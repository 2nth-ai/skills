---
name: tech/meta
description: |
  Meta Business platform skill. Use this skill when:
  (1) building WhatsApp Business automation — receiving and sending messages via Cloud API,
  (2) verifying Meta webhook signatures in a Cloudflare Worker (HMAC-SHA256, X-Hub-Signature-256),
  (3) handling the GET webhook verification challenge (hub.mode, hub.verify_token, hub.challenge),
  (4) sending WhatsApp interactive messages — buttons, list menus, and approved templates,
  (5) building a Messenger chatbot on a Facebook Page — receive messages, reply via Graph API,
  (6) managing access tokens — Page Access Tokens, System User tokens, long-lived token exchange,
  (7) posting to Facebook Pages or reading Page insights via the Graph API,
  (8) using the Meta Conversions API to send events server-side from Cloudflare Workers,
  (9) integrating Instagram messaging — DMs from Instagram in the same webhook stream,
  (10) routing: Workers AI classifies WhatsApp intent → Claude drafts reply → send via Cloud API.
license: MIT
compatibility: Meta Graph API v21.0, WhatsApp Business Cloud API, Messenger Platform, Cloudflare Workers
homepage: https://skills.2nth.ai/tech/meta
repository: https://github.com/2nth-ai/skills
improves:
  - tech
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Meta, Facebook, WhatsApp, Messenger, Instagram, DM, Story mentions, Graph API, Business, Webhooks, AI"
allowed-tools: Read Write Edit Glob Grep
---

# Meta Business Platform

Meta's developer surface is unified under the **Graph API** — one base URL, one auth model, covering WhatsApp, Messenger, Instagram, Pages, Ads, and Pixel. The entry point is [business.facebook.com](https://business.facebook.com) for accounts and [developers.facebook.com](https://developers.facebook.com) for app setup.

**For 2nth.ai clients, the priority order:**

| Integration | Value | Complexity |
|-------------|-------|-----------|
| **WhatsApp Cloud API** | Highest — direct customer channel | Medium |
| **Messenger** | High — Facebook page chatbot | Low |
| **Instagram Messaging** | High — same webhook as Messenger | Low (flows with Messenger) |
| **Pages API** | Medium — post scheduling, insights | Low |
| **Conversions API** | Medium — server-side ad tracking | Low |
| **Ads API** | Lower — ad management, reporting | High |

Sub-skill: `tech/meta/whatsapp` covers the WhatsApp Cloud API in full detail.

## Authentication model

Meta uses three token types. Choose based on what the integration acts on.

| Token | What it accesses | Lifespan | How to get |
|-------|-----------------|---------|-----------|
| **App Access Token** | App-level (webhooks, app management) | Non-expiring | `{APP_ID}|{APP_SECRET}` |
| **Page Access Token** | Facebook Page — Messenger, page posts | Long-lived (60 days) | User grants page permissions |
| **System User Token** | All assets in a Business — WhatsApp, Pages | Non-expiring | Meta Business Manager → System Users |
| **WhatsApp Token** | Phone number — send/receive messages | Non-expiring (system user) | WABA settings in Business Manager |

**For production automation: always use System User tokens** — they don't expire and aren't tied to a human's account.

### Exchange short-lived token for long-lived
```typescript
const res = await fetch(
  `https://graph.facebook.com/v21.0/oauth/access_token?` +
  `grant_type=fb_exchange_token&client_id=${env.META_APP_ID}` +
  `&client_secret=${env.META_APP_SECRET}&fb_exchange_token=${shortLivedToken}`
);
const { access_token, expires_in } = await res.json();
// Store in KV with TTL = expires_in - 86400 (refresh 1 day early)
await env.KV.put('meta_page_token', access_token, { expirationTtl: expires_in - 86400 });
```

## Webhook setup — shared pattern for all Meta products

All Meta webhooks use the same two-step verification — a GET for URL verification and POST for events.

### Step 1 — URL verification (GET)
```typescript
if (request.method === 'GET') {
  const url = new URL(request.url);
  const mode      = url.searchParams.get('hub.mode');
  const token     = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === env.WEBHOOK_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 }); // must return the raw challenge string
  }
  return new Response('Forbidden', { status: 403 });
}
```

### Step 2 — Signature verification (POST)
```typescript
async function verifyMetaSignature(request: Request, env: Env): Promise<{ valid: boolean; body: string }> {
  const signature = request.headers.get('X-Hub-Signature-256') ?? '';
  const body = await request.text();

  if (!signature.startsWith('sha256=')) return { valid: false, body };

  const expected = signature.slice('sha256='.length);
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(env.META_APP_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
  const actual = Array.from(new Uint8Array(mac)).map(b => b.toString(16).padStart(2, '0')).join('');

  return { valid: actual === expected, body };
}
```

## Required secrets
```bash
wrangler secret put META_APP_ID           # App ID from developers.facebook.com
wrangler secret put META_APP_SECRET       # App Secret from Basic Settings
wrangler secret put WEBHOOK_VERIFY_TOKEN  # Your own string, set in webhook config
wrangler secret put WHATSAPP_TOKEN        # System User token with WhatsApp permissions
wrangler secret put WHATSAPP_PHONE_ID     # Phone Number ID from WhatsApp settings
wrangler secret put PAGE_ACCESS_TOKEN     # For Messenger / page posts (if needed)
```

## Graph API base URL

```
https://graph.facebook.com/v21.0/
```

Always pin the version (`v21.0`). Meta deprecates old versions with ~2 years' notice.

## Messenger Platform

Facebook Page chatbot. The same webhook can receive Messenger, Instagram, and WhatsApp events — differentiated by the `object` field.

### Receive + reply
```typescript
async function handleMessengerEvent(entry: any[], env: Env) {
  for (const e of entry) {
    for (const msg of e.messaging ?? []) {
      if (!msg.message?.text) continue;

      const senderId = msg.sender.id;
      const text     = msg.message.text;

      // Classify with Workers AI
      const { response: intent } = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          { role: 'system', content: 'Classify as: enquiry | order | complaint | general. One word.' },
          { role: 'user', content: text.slice(0, 400) },
        ],
      });

      // Draft reply with Claude
      const draft = await draftReply(text, intent.trim(), env);

      // Send via Messenger Send API
      await fetch('https://graph.facebook.com/v21.0/me/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.PAGE_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          recipient: { id: senderId },
          message: {
            text: draft,
            quick_replies: [
              { content_type: 'text', title: '✅ Helpful', payload: 'HELPFUL' },
              { content_type: 'text', title: '🔄 More detail', payload: 'MORE' },
            ],
          },
        }),
      });
    }
  }
}
```

## Meta Conversions API — server-side events

Send purchase, lead, and custom events directly from Workers — bypasses ad blockers, improves attribution.

```typescript
await fetch(`https://graph.facebook.com/v21.0/${env.META_PIXEL_ID}/events`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data: [{
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      event_source_url: 'https://2nth.ai/checkout',
      user_data: {
        em: await hashSHA256(userEmail),     // SHA-256 hashed
        ph: await hashSHA256(userPhone),
        client_ip_address: request.headers.get('CF-Connecting-IP'),
        client_user_agent: request.headers.get('User-Agent'),
        fbc: cookieFbc,   // _fbc cookie
        fbp: cookieFbp,   // _fbp cookie
      },
      custom_data: {
        currency: 'ZAR',
        value: 4800.00,
        content_ids: ['PLAN-PRO'],
        content_type: 'product',
      },
    }],
    access_token: env.META_SYSTEM_USER_TOKEN,
  }),
});
```

## Unified webhook router

One Worker handles all Meta product events:

```typescript
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // GET — webhook URL verification
    if (request.method === 'GET') return verifyWebhook(url, env);

    // POST — event delivery
    const { valid, body } = await verifyMetaSignature(request, env);
    if (!valid) return new Response('Unauthorized', { status: 401 });

    const payload = JSON.parse(body);

    // Route by product
    if (payload.object === 'whatsapp_business_account') {
      ctx.waitUntil(handleWhatsAppEvents(payload.entry, env));
    } else if (payload.object === 'page') {
      ctx.waitUntil(handleMessengerEvents(payload.entry, env));
    } else if (payload.object === 'instagram') {
      ctx.waitUntil(handleInstagramEvents(payload.entry, env));
    }

    // Always ack within 20s or Meta retries
    return new Response('EVENT_RECEIVED', { status: 200 });
  }
};
```

## Rate limits

| Product | Limit | Notes |
|---------|-------|-------|
| WhatsApp messages (template) | Tier-based (start at 1k/day) | Scales with quality rating |
| WhatsApp messages (session) | Unlimited during 24h window | Customer must message first |
| Graph API reads | 200 calls/hour per user token | App-level: higher |
| Messenger send | 1 req/sec per recipient | Batch where possible |
| Conversions API | No hard limit | Deduplication by `event_id` |

## Gotchas

- **Always return `EVENT_RECEIVED`** — Meta retries any non-200 response up to 5 times with exponential backoff. Ack the POST before any async processing.
- **Hub.challenge must be raw string** — return `new Response(challenge)` not `Response.json(...)`. Meta compares the raw string.
- **24-hour messaging window (WhatsApp)** — you can only reply freely within 24 hours of the customer's last message. After that, only approved templates can initiate contact.
- **Template approval** — WhatsApp message templates must be approved by Meta before sending. Factor in 24–48 hours for approval in production.
- **System User tokens for production** — Page Access Tokens issued to users expire when the user changes their password or revokes the app. System User tokens don't expire.
- **X-Hub-Signature vs X-Hub-Signature-256** — always use `X-Hub-Signature-256` (SHA-256). The SHA-1 variant (`X-Hub-Signature`) is deprecated.
- **WABA vs phone number ID** — the WhatsApp Business Account ID (WABA) is different from the Phone Number ID. Messages are sent using the Phone Number ID, not the WABA.

## Sub-skills

| Skill | Path | Status |
|-------|------|--------|
| WhatsApp Business Cloud API | `tech/meta/whatsapp` | Active |
| Instagram Messaging API | `tech/meta/instagram` | Active |
