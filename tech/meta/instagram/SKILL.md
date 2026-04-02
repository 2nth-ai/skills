---
name: tech/meta/instagram
description: |
  Instagram Messaging API skill. Use this skill when:
  (1) receiving and processing inbound Instagram DMs in a Cloudflare Worker,
  (2) sending Instagram DM replies — text, images, audio, video, stickers,
  (3) handling story mentions — auto-reply when a user mentions your account in their story,
  (4) handling story replies — when a user replies directly to your story,
  (5) building the AI reply pattern — Instagram DM → Workers AI classify → Claude draft → Graph API send,
  (6) handling quick replies and generic templates in Instagram DMs,
  (7) routing Instagram events from the shared Meta webhook stream (object: "instagram"),
  (8) managing the 7-day messaging window for Instagram vs 24h for WhatsApp,
  (9) storing Instagram conversation threads in D1 for context and CRM sync,
  (10) human agent handover via the Handover Protocol for Instagram.
license: MIT
compatibility: Instagram Messaging API (Graph API v21.0), Cloudflare Workers, Meta Graph API
homepage: https://skills.2nth.ai/tech/meta/instagram
repository: https://github.com/2nth-ai/skills
requires:
  - tech/meta
improves:
  - tech/meta
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Instagram, Meta, Messaging, DM, Social, AI, Automation, Graph API"
allowed-tools: Read Write Edit Glob Grep
---

# Instagram Messaging API

Instagram DMs give businesses a high-engagement channel — reply rates are typically 3-5× higher than email. The Instagram Messaging API runs through the same Meta webhook stream as Messenger, differentiated by `object: "instagram"`. No separate infrastructure needed if you already have a Meta webhook Worker.

**Requirements:** Instagram Professional Account (Creator or Business) linked to a Facebook Page. The Facebook Page must have the Instagram account connected in Business Manager.

## Architecture (2nth.ai pattern)

```
Customer sends Instagram DM (or story mention/reply)
  → Meta Cloud pushes to Worker webhook (object: "instagram")
  → Worker: verify X-Hub-Signature-256
  → Identify sender IGSID and message type
  → Workers AI: classify intent (50ms, edge)
  → Route: simple reply inline | complex → Claude via AI Gateway
  → Build response: text | image | quick_replies | generic template
  → POST to /me/messages (Page Access Token)
  → Store thread in D1 (for context on next message)
```

## Required setup

1. **Facebook Page** with Instagram Professional Account connected
2. **Meta App** with `instagram_manage_messages` and `pages_messaging` permissions
3. **Webhook** subscribed to `messages`, `messaging_postbacks`, `messaging_story_mentions`
4. **Page Access Token** (long-lived system user token in production)

## Required secrets
```bash
wrangler secret put META_APP_SECRET          # For X-Hub-Signature-256 verification
wrangler secret put WEBHOOK_VERIFY_TOKEN     # Your own string
wrangler secret put PAGE_ACCESS_TOKEN        # Long-lived token with instagram_manage_messages
wrangler secret put INSTAGRAM_PAGE_ID        # Numeric Page ID (not @handle)
```

## Webhook payload — Instagram DM

Instagram events arrive with `object: "instagram"` and use Instagram-scoped user IDs (IGSID).

```typescript
interface IGWebhook {
  object: 'instagram';
  entry: Array<{
    id: string;        // Page ID
    time: number;
    messaging?: IGMessagingEvent[];
    changes?: IGChange[];
  }>;
}

interface IGMessagingEvent {
  sender:    { id: string };   // IGSID — Instagram-scoped user ID
  recipient: { id: string };   // Your Page ID
  timestamp: number;
  message?: {
    mid:  string;              // message ID (ig-msg.xxx)
    text?: string;
    attachments?: Array<{
      type: 'image' | 'video' | 'audio' | 'file' | 'ig_reel' | 'story_mention';
      payload: { url?: string };
    }>;
    reply_to?: { mid: string; story?: { url: string; id: string } };
    is_echo?: boolean;         // true = message you sent, skip these
  };
  postback?: {
    mid:     string;
    title:   string;
    payload: string;
  };
  read?: { watermark: number };
}

// Story mention events come via `changes`, not `messaging`
interface IGChange {
  field: 'mentions';
  value: {
    media_id:  string;   // The story's media ID
    comment_id?: string;
  };
}
```

## Full Worker handler

```typescript
import { verifyMetaSignature } from '../verify'; // from tech/meta SKILL.md

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method === 'GET') {
      const url = new URL(request.url);
      if (url.searchParams.get('hub.verify_token') === env.WEBHOOK_VERIFY_TOKEN) {
        return new Response(url.searchParams.get('hub.challenge'));
      }
      return new Response('Forbidden', { status: 403 });
    }

    const { valid, body } = await verifyMetaSignature(request, env);
    if (!valid) return new Response('Unauthorized', { status: 401 });

    const payload = JSON.parse(body) as IGWebhook;
    if (payload.object !== 'instagram') {
      return new Response('EVENT_RECEIVED', { status: 200 });
    }

    ctx.waitUntil(processInstagram(payload, env));
    return new Response('EVENT_RECEIVED', { status: 200 });
  }
};

async function processInstagram(payload: IGWebhook, env: Env) {
  for (const entry of payload.entry) {
    // Handle story mentions (arrive via `changes`)
    for (const change of entry.changes ?? []) {
      if (change.field === 'mentions') {
        await handleStoryMention(entry.id, change.value, env);
      }
    }

    // Handle DMs
    for (const event of entry.messaging ?? []) {
      const msg = event.message;

      // Skip echoes (your own sent messages) and read receipts
      if (!msg || msg.is_echo) continue;

      const igsid = event.sender.id;

      // Dedup by message ID
      const exists = await env.DB.prepare(
        'SELECT 1 FROM ig_messages WHERE mid = ?'
      ).bind(msg.mid).first();
      if (exists) continue;

      const text = msg.text ?? extractAttachmentContext(msg.attachments);
      if (!text) continue;

      // Load conversation context (last 6 turns from KV)
      const ctxKey = `ig_ctx:${igsid}`;
      const context = JSON.parse(await env.KV.get(ctxKey) ?? '[]') as string[];

      // Classify intent at the edge
      const { response: intent } = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          { role: 'system', content: 'Classify as: enquiry | order | collab | support | general. One word.' },
          { role: 'user', content: text.slice(0, 400) },
        ],
      });

      // Draft reply
      const reply = await buildIGReply(text, intent.trim(), context, env);

      // Send reply
      await sendIGMessage(igsid, reply, env);

      // Update context in KV
      context.push(`User: ${text}`, `Bot: ${typeof reply === 'string' ? reply : '[template]'}`);
      await env.KV.put(ctxKey, JSON.stringify(context.slice(-12)), { expirationTtl: 604800 }); // 7 days

      // Store in D1
      await env.DB.prepare(
        'INSERT INTO ig_messages (mid, igsid, text, intent, ts) VALUES (?,?,?,?,?)'
      ).bind(msg.mid, igsid, text, intent.trim(), Date.now()).run();
    }
  }
}

function extractAttachmentContext(attachments?: IGMessagingEvent['message']['attachments']): string {
  if (!attachments?.length) return '';
  const a = attachments[0];
  if (a.type === 'story_mention') return '[User mentioned you in their story]';
  if (a.type === 'ig_reel')       return '[User sent a Reel]';
  if (a.type === 'image')         return '[User sent an image]';
  if (a.type === 'video')         return '[User sent a video]';
  return `[User sent a ${a.type}]`;
}
```

## Sending messages

### Text reply
```typescript
async function sendIGText(igsid: string, text: string, env: Env) {
  return fetch('https://graph.facebook.com/v21.0/me/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.PAGE_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      recipient: { id: igsid },
      message: { text },
    }),
  });
}
```

### Quick replies
```typescript
async function sendIGQuickReplies(
  igsid: string,
  text: string,
  replies: { title: string; payload: string }[],
  env: Env
) {
  return fetch('https://graph.facebook.com/v21.0/me/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.PAGE_ACCESS_TOKEN}` },
    body: JSON.stringify({
      recipient: { id: igsid },
      message: {
        text,
        quick_replies: replies.map(r => ({
          content_type: 'text',
          title: r.title,   // max 20 chars
          payload: r.payload,
        })),
      },
    }),
  });
}

// Usage — product enquiry
await sendIGQuickReplies(igsid,
  'Thanks for reaching out! How can I help?',
  [
    { title: 'Product info',   payload: 'INFO' },
    { title: 'Pricing',        payload: 'PRICING' },
    { title: 'Collaboration',  payload: 'COLLAB' },
  ],
  env
);
```

### Generic template (product card)
```typescript
async function sendIGTemplate(
  igsid: string,
  title: string,
  subtitle: string,
  imageUrl: string,
  buttons: { title: string; url?: string; payload?: string }[],
  env: Env
) {
  return fetch('https://graph.facebook.com/v21.0/me/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.PAGE_ACCESS_TOKEN}` },
    body: JSON.stringify({
      recipient: { id: igsid },
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: [{
              title,
              subtitle,
              image_url: imageUrl,
              buttons: buttons.map(b => b.url
                ? { type: 'web_url',  title: b.title, url: b.url }
                : { type: 'postback', title: b.title, payload: b.payload }
              ),
            }],
          },
        },
      },
    }),
  });
}
```

### Image reply
```typescript
async function sendIGImage(igsid: string, imageUrl: string, env: Env) {
  return fetch('https://graph.facebook.com/v21.0/me/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.PAGE_ACCESS_TOKEN}` },
    body: JSON.stringify({
      recipient: { id: igsid },
      message: {
        attachment: {
          type: 'image',
          payload: { url: imageUrl, is_reusable: true },
        },
      },
    }),
  });
}
```

## Story mention handler

```typescript
async function handleStoryMention(pageId: string, value: { media_id: string }, env: Env) {
  // Fetch story details to get the user who mentioned you
  const res = await fetch(
    `https://graph.facebook.com/v21.0/${value.media_id}?fields=from,media_type,timestamp&access_token=${env.PAGE_ACCESS_TOKEN}`
  );
  const story = await res.json() as { from: { id: string; username: string }; media_type: string };

  if (!story.from) return; // private account or deleted story

  // Send a thank-you DM to the person who mentioned you
  await sendIGText(
    story.from.id,
    `Hey @${story.from.username}! 🙌 Thanks for the mention — we really appreciate you sharing us in your story.`,
    env
  );

  // Log in D1
  await env.DB.prepare(
    'INSERT INTO ig_story_mentions (media_id, from_igsid, username, ts) VALUES (?,?,?,?)'
  ).bind(value.media_id, story.from.id, story.from.username, Date.now()).run();
}
```

## AI reply builder

```typescript
async function buildIGReply(
  text: string,
  intent: string,
  context: string[],
  env: Env
): Promise<string | object> {
  // Collaboration enquiry — return product card template
  if (intent === 'collab') {
    return {
      type: 'template',
      title: 'Work with 2nth.ai',
      subtitle: 'AI automation for your business — WhatsApp, Instagram, ERP integration.',
      imageUrl: 'https://r2.2nth.ai/og/collab.jpg',
      buttons: [
        { title: 'View packages', url: 'https://2nth.ai/packages' },
        { title: 'Book a call',   payload: 'BOOK_CALL' },
      ],
    };
  }

  // General — Claude via AI Gateway
  const contextStr = context.slice(-6).join('\n');
  const res = await fetch(env.AI_GATEWAY_URL + '/anthropic/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 280,
      system: `You are a friendly Instagram DM assistant for 2nth.ai. Keep replies conversational and warm — this is Instagram, not email. Use natural language, no bullet points or markdown. Max 2 short sentences.`,
      messages: [
        ...(contextStr ? [{ role: 'user', content: `Previous:\n${contextStr}` }] : []),
        { role: 'user', content: text },
      ],
    }),
  }).then(r => r.json());

  return res.content[0].text;
}

async function sendIGMessage(igsid: string, reply: string | object, env: Env) {
  if (typeof reply === 'string') {
    await sendIGText(igsid, reply, env);
  } else {
    const r = reply as any;
    if (r.type === 'template') {
      await sendIGTemplate(igsid, r.title, r.subtitle, r.imageUrl, r.buttons, env);
    }
  }
}
```

## Handover Protocol — escalate to human agent

```typescript
// Pass control to a human agent app (e.g., Zendesk, Freshdesk)
async function passToHuman(igsid: string, metadata: string, env: Env) {
  await fetch('https://graph.facebook.com/v21.0/me/pass_thread_control', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.PAGE_ACCESS_TOKEN}` },
    body: JSON.stringify({
      recipient: { id: igsid },
      target_app_id: env.HUMAN_AGENT_APP_ID,  // Secondary receiver app ID
      metadata,
    }),
  });
}

// Take control back (e.g., when human marks resolved)
async function takeThreadControl(igsid: string, env: Env) {
  await fetch('https://graph.facebook.com/v21.0/me/take_thread_control', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.PAGE_ACCESS_TOKEN}` },
    body: JSON.stringify({ recipient: { id: igsid } }),
  });
}
```

## D1 schema

```sql
CREATE TABLE ig_messages (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  mid     TEXT UNIQUE NOT NULL,   -- ig-msg dedup key
  igsid   TEXT NOT NULL,          -- Instagram-scoped user ID
  text    TEXT,
  intent  TEXT,
  ts      INTEGER NOT NULL
);

CREATE TABLE ig_story_mentions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  media_id   TEXT UNIQUE NOT NULL,
  from_igsid TEXT NOT NULL,
  username   TEXT,
  ts         INTEGER NOT NULL
);

CREATE INDEX idx_ig_igsid ON ig_messages(igsid);
```

## 7-day messaging window

Instagram uses a **7-day** session window (vs WhatsApp's 24 hours). After 7 days of inactivity, you cannot send free-form messages. Human Agent tag (`"messaging_type": "HUMAN_AGENT"`) extends the window to 7 days from the last human agent reply.

```typescript
// Standard reply (within 7-day window)
body: JSON.stringify({ recipient: { id: igsid }, message: { text }, messaging_type: 'RESPONSE' })

// Human agent reply (extends window 7 more days)
body: JSON.stringify({ recipient: { id: igsid }, message: { text }, messaging_type: 'HUMAN_AGENT', tag: 'HUMAN_AGENT' })
```

## Gotchas

- **IGSID ≠ PSID** — Instagram-scoped user IDs are different from Facebook Page-scoped IDs. Never mix them across Messenger and Instagram send calls.
- **`is_echo: true` messages** — every message you send generates an echo webhook event. Always guard with `if (msg.is_echo) continue;` or you'll process your own replies.
- **Story mentions are in `changes`, not `messaging`** — loop over both `entry.changes` and `entry.messaging` in your handler.
- **Story media expires** — Instagram stories disappear after 24 hours. Fetch story details immediately in `handleStoryMention` — don't defer.
- **No template approval required** — unlike WhatsApp, Instagram generic templates don't require Meta pre-approval. But content must comply with Instagram messaging policies.
- **Quick reply title max 20 chars** — same as WhatsApp button titles. Truncated silently.
- **Subscribe to correct webhook fields** — you need `messages` (DMs), `messaging_postbacks` (button taps), and `messaging_story_mentions` separately in App Dashboard → Webhooks.
- **Private account users** — if the user's account is private and they haven't followed you, `story.from` may be null. Handle gracefully.
- **Rate limit** — 1 request/second per IGSID for sends. For broadcast scenarios (e.g., story mention bulk reply), add a queue via Queue Workers.
