---
name: tech/google/workspace/gmail
description: |
  Gmail API skill. Use when: (1) reading, searching, or listing messages/threads via users.messages.list + get,
  (2) sending email (including replies that thread correctly) via users.messages.send,
  (3) creating, applying, and removing labels — the core primitive for workflow automation,
  (4) setting up a Watch → Pub/Sub pipeline for real-time inbox events without polling,
  (5) building the "Penny briefing" pattern — Watch → Pub/Sub → Cloud Run → Gemini summary → label/reply,
  (6) handling MIME parsing, base64url encoding, and attachments correctly.
license: MIT
compatibility: Gmail API v1, googleapis (Node 9+), google-api-python-client
homepage: https://skills.2nth.ai/tech/google/workspace/gmail
repository: https://github.com/2nth-ai/skills
requires:
  - tech/google/workspace
improves:
  - tech/google/workspace
  - tech/google
  - tech
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Gmail, Email, Workspace, OAuth, Push, Pub/Sub, AI Automation, Penny"
allowed-tools: Bash(gcloud:*) Bash(curl:*) Read Write Edit Glob Grep
---

# Gmail API

The Gmail API exposes messages, threads, labels, drafts, history, and a **Watch** mechanism that pushes inbox changes to Pub/Sub in real time. This is the engine behind the 2nth.ai **Penny briefing** pattern — an inbox that auto-summarises, classifies, drafts replies, and labels.

## The 2nth Model: Gmail as an AI-powered ops layer

| Role | Without AI | With Gmail AI + 2nth |
|------|-----------|---------------------|
| **Business owner** | Reads every enquiry manually | AI classifies, summarises, and routes — owner sees only what needs a decision |
| **Sales** | Manually drafts follow-ups | AI drafts reply from thread context; human reviews and sends |
| **Ops** | Manually extracts order details from email | AI parses order data into WooCommerce / QuickBooks automatically |
| **Support** | Searches inbox to find history | AI retrieves full customer thread history on demand |

## Scope selection

| Scope | Grants | Category |
|-------|--------|---------|
| `gmail.readonly` | Read mail + metadata | Restricted |
| `gmail.send` | Send mail (no read) | Sensitive |
| `gmail.labels` | CRUD labels | Non-sensitive |
| `gmail.modify` | Read + modify labels, draft, but not delete | Restricted |
| `gmail.compose` | Create + send drafts | Restricted |
| `gmail.metadata` | Headers only, no body content | Restricted |
| `gmail.settings.basic` | Filters, forwarding, delegates | Restricted |
| `gmail.settings.sharing` | Forwarding to external, send-as | Restricted |

Restricted scopes require **verification + annual CASA Tier 2/3 security audit** for External (non-Internal) apps. Prefer the narrowest combo — often `gmail.readonly + gmail.labels + gmail.send`.

For 2nth.ai automations targeting one Workspace domain, set OAuth consent to **Internal** — no verification required, full restricted-scope access.

## Auth choice

| Pattern | When |
|---------|------|
| **User OAuth 2.0** | End-user consent, per-user refresh token, works with `@gmail.com` consumer accounts |
| **Service account + DWD** | Server job acting as any user in a Workspace domain (Penny batch jobs) |

See `tech/google/workspace/SKILL.md` for full auth setup. Below assumes DWD for server code.

## Auth bootstrap (Node, DWD)

```typescript
import { google } from 'googleapis';

function gmailFor(userEmail: string) {
  const auth = new google.auth.JWT({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.labels',
      'https://www.googleapis.com/auth/gmail.modify',
    ],
    subject: userEmail,   // the user being impersonated
  });
  return google.gmail({ version: 'v1', auth });
}
```

## List, search, read messages

Gmail search uses the same operators as the Gmail UI: `from:`, `to:`, `subject:`, `has:attachment`, `newer_than:7d`, `label:inbox`, `is:unread`.

```typescript
const gmail = gmailFor('user@example.com');

// List messages matching a query (returns ID refs only — batch-fetch for bodies)
const { data } = await gmail.users.messages.list({
  userId: 'me',
  q: 'is:unread newer_than:2d -label:processed',
  maxResults: 50,
});
const messageIds = (data.messages ?? []).map(m => m.id!);

// Fetch one — format 'full' = all headers + body parts; 'metadata' = headers only (cheaper); 'minimal' = ids only
const msg = await gmail.users.messages.get({
  userId: 'me',
  id: messageIds[0],
  format: 'full',
});
```

### Parse headers + body

Gmail stores bodies in base64url, and multipart MIME nests parts. The extract pattern:

```typescript
type Headers = Record<string, string>;

function extractHeaders(payload: any): Headers {
  const h: Headers = {};
  for (const { name, value } of payload.headers ?? []) {
    h[name.toLowerCase()] = value;
  }
  return h;
}

function extractBody(payload: any): { text: string; html: string } {
  const out = { text: '', html: '' };

  function walk(part: any) {
    if (part.body?.data) {
      const decoded = Buffer.from(part.body.data, 'base64url').toString('utf8');
      if (part.mimeType === 'text/plain') out.text += decoded;
      else if (part.mimeType === 'text/html') out.html += decoded;
    }
    for (const sub of part.parts ?? []) walk(sub);
  }
  walk(payload);
  return out;
}

const h = extractHeaders(msg.data.payload);
const body = extractBody(msg.data.payload);

console.log({
  from:    h['from'],
  subject: h['subject'],
  date:    h['date'],
  text:    body.text.slice(0, 500),
});
```

### Batch fetch for throughput

```typescript
// Fetch in parallel with a concurrency cap
import pLimit from 'p-limit';
const limit = pLimit(10);

const messages = await Promise.all(
  messageIds.map((id) =>
    limit(() => gmail.users.messages.get({ userId: 'me', id, format: 'full' }))
  )
);
```

## Send mail (new + reply in thread)

Gmail's send endpoint takes a **raw RFC 822 message**, base64url-encoded.

```typescript
function encodeMessage({
  to, from, subject, text, html, inReplyTo, references,
}: {
  to: string; from: string; subject: string;
  text?: string; html?: string;
  inReplyTo?: string; references?: string;
}): string {
  const boundary = 'bd-' + Date.now().toString(36);
  const headers = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    ...(inReplyTo  ? [`In-Reply-To: ${inReplyTo}`] : []),
    ...(references ? [`References: ${references}`] : []),
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
  ];
  const parts: string[] = [];
  if (text) parts.push(`--${boundary}\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n${text}`);
  if (html) parts.push(`--${boundary}\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n${html}`);
  parts.push(`--${boundary}--`);

  const raw = headers.join('\r\n') + '\r\n' + parts.join('\r\n');
  return Buffer.from(raw).toString('base64url');
}

// New message
await gmail.users.messages.send({
  userId: 'me',
  requestBody: {
    raw: encodeMessage({
      to:      'client@example.com',
      from:    'penny@my-domain.com',
      subject: 'Monday briefing',
      html:    '<p>Here\'s your Monday summary…</p>',
    }),
  },
});

// Reply in the same thread — must set threadId + In-Reply-To + References headers
const original = await gmail.users.messages.get({ userId: 'me', id: inboundId, format: 'metadata' });
const h = extractHeaders(original.data.payload);

await gmail.users.messages.send({
  userId: 'me',
  requestBody: {
    threadId: original.data.threadId!,     // keeps the reply in the same thread
    raw: encodeMessage({
      to:         h['from'],
      from:       'penny@my-domain.com',
      subject:    h['subject'].startsWith('Re:') ? h['subject'] : `Re: ${h['subject']}`,
      text:       'Acknowledged — processing your request now.',
      inReplyTo:  h['message-id'],         // critical for threading in clients
      references: h['references'] ? `${h['references']} ${h['message-id']}` : h['message-id'],
    }),
  },
});
```

### Draft instead of send (human-in-the-loop)

```typescript
const { data: draft } = await gmail.users.drafts.create({
  userId: 'me',
  requestBody: {
    message: { threadId: originalThreadId, raw: encodeMessage({ /* ... */ }) },
  },
});
// Draft now appears in the user's Gmail — they can edit + send manually
// Or auto-send later:
await gmail.users.drafts.send({ userId: 'me', requestBody: { id: draft.id! } });
```

## Labels (the workflow primitive)

```typescript
// Create a label — system labels (INBOX, UNREAD, STARRED) are immutable; user labels are CRUD
const { data: label } = await gmail.users.labels.create({
  userId: 'me',
  requestBody: {
    name: 'Penny/Processed',
    labelListVisibility: 'labelShow',
    messageListVisibility: 'show',
    color: { backgroundColor: '#16a765', textColor: '#ffffff' },
  },
});
const labelId = label.id!;

// Apply / remove labels on a message
await gmail.users.messages.modify({
  userId: 'me',
  id: messageId,
  requestBody: {
    addLabelIds:    [labelId],
    removeLabelIds: ['UNREAD'],     // mark read
  },
});

// Find messages by label
const { data: labelled } = await gmail.users.messages.list({
  userId: 'me',
  labelIds: [labelId],
  maxResults: 100,
});
```

## Watch → Pub/Sub (real-time inbox events)

Watch is how you avoid polling — Gmail pushes changes to a Pub/Sub topic, which triggers your Cloud Run consumer.

### One-time setup

```bash
# 1. Create a Pub/Sub topic
gcloud pubsub topics create gmail-events

# 2. Grant Gmail's service account publish permission
gcloud pubsub topics add-iam-policy-binding gmail-events \
  --member "serviceAccount:gmail-api-push@system.gserviceaccount.com" \
  --role "roles/pubsub.publisher"

# 3. Create a push subscription to your Cloud Run consumer
gcloud pubsub subscriptions create gmail-events-to-consumer \
  --topic gmail-events \
  --push-endpoint https://gmail-consumer-xyz-ew.a.run.app/events \
  --push-auth-service-account pubsub-invoker@my-app-prod.iam.gserviceaccount.com \
  --ack-deadline 60
```

### Register Watch (per user — expires after 7 days)

```typescript
// Call Watch — returns the current historyId. Re-call every ~6 days to refresh.
const { data } = await gmail.users.watch({
  userId: 'me',
  requestBody: {
    topicName: 'projects/my-app-prod/topics/gmail-events',
    labelIds: ['INBOX'],              // optional — only notify on inbox changes
    labelFilterBehavior: 'INCLUDE',
  },
});
// Persist { userEmail, historyId: data.historyId } per user
```

### Handle Pub/Sub notification in Cloud Run

Gmail Watch sends a **minimal** notification — just the new `historyId`. You diff against the previously-stored `historyId` using `users.history.list` to discover what actually changed.

```typescript
app.post('/events', async (req, res) => {
  const { message } = req.body as { message: { data: string } };
  const { emailAddress, historyId: newHistoryId } =
    JSON.parse(Buffer.from(message.data, 'base64').toString());

  // Look up the last historyId we processed for this user
  const { historyId: lastHistoryId } = await db.getUserState(emailAddress);

  const gmail = gmailFor(emailAddress);
  const { data } = await gmail.users.history.list({
    userId: 'me',
    startHistoryId: lastHistoryId,
    historyTypes: ['messageAdded'],
  });

  // History records include new message IDs — fetch + process each
  for (const h of data.history ?? []) {
    for (const m of h.messagesAdded ?? []) {
      const msg = await gmail.users.messages.get({ userId: 'me', id: m.message!.id!, format: 'full' });
      await processMessage(emailAddress, msg.data);
    }
  }

  await db.setUserState(emailAddress, { historyId: newHistoryId });
  res.status(200).send();   // ACK — any non-2xx triggers redelivery
});
```

### Keep Watch alive

```typescript
// Cloud Scheduler → Cloud Run job, daily — re-watch for every active user
for (const user of activeUsers) {
  const gmail = gmailFor(user.email);
  await gmail.users.watch({ userId: 'me', requestBody: { topicName, labelIds: ['INBOX'] } });
}
```

Watch expires after 7 days with no explicit refresh. Daily re-registration is the safe default.

## The "Penny briefing" pattern (full loop)

```
Inbox message arrives
 ─ Gmail Watch pushes {emailAddress, historyId} to Pub/Sub
 ─ Cloud Run consumer:
   1. Diff historyId → get new message(s)
   2. Extract sender, subject, body text
   3. Call Vertex AI Gemini to:
      - Classify (client/sales/spam/personal)
      - Generate 1-paragraph summary
      - Suggest 3 reply options
   4. Apply labels: Penny/Processed + one of Penny/Client, Penny/Sales, etc.
   5. Create a Gmail draft with the suggested reply (threaded correctly)
   6. Log to BigQuery for Penny analytics
 ─ Scheduled daily digest:
   - Query BigQuery for today's Penny-labelled threads
   - Send one summary email via gmail.users.messages.send
```

This skill provides all the Gmail pieces; `tech/google/cloud/ai` has the Gemini call; `tech/google/cloud/data` has the BigQuery + Pub/Sub integration.

## Attachments

```typescript
// Extract attachment IDs from the payload, then fetch the data separately
function findAttachments(payload: any): Array<{ filename: string; mimeType: string; attachmentId: string; size: number }> {
  const out: any[] = [];
  function walk(part: any) {
    if (part.filename && part.body?.attachmentId) {
      out.push({
        filename: part.filename,
        mimeType: part.mimeType,
        attachmentId: part.body.attachmentId,
        size: part.body.size,
      });
    }
    for (const sub of part.parts ?? []) walk(sub);
  }
  walk(payload);
  return out;
}

for (const att of findAttachments(msg.data.payload)) {
  const { data: attData } = await gmail.users.messages.attachments.get({
    userId: 'me', messageId: msg.data.id!, id: att.attachmentId,
  });
  const buffer = Buffer.from(attData.data!, 'base64url');
  // Save to GCS, parse, feed into Vertex AI, etc.
}
```

## AI integration patterns

The Penny briefing loop below outlines the full pipeline. These three patterns are the building blocks — use them independently or chain them:

### Pattern 1: Classify → route (Workers AI, fast + cheap)

```typescript
// Workers AI (Llama 3.1 8B) for intent classification — runs at the edge, zero cold start
const { response: intent } = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
  messages: [
    { role: 'system', content: 'Classify as: enquiry | order | complaint | invoice | spam' },
    { role: 'user', content: emailBody.slice(0, 800) },
  ],
});
// Route on intent — apply label, assign to team, drop into D1 queue, etc.
```

### Pattern 2: Summarise + draft reply (Claude via AI Gateway, quality-first)

```typescript
// Claude via Cloudflare AI Gateway — adds caching, fallback, observability
const draft = await fetch(env.AI_GATEWAY_URL + '/anthropic/v1/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY },
  body: JSON.stringify({
    model: 'claude-sonnet-4-6',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: `Draft a professional reply to this email. Be concise and warm.\n\nFrom: ${from}\nSubject: ${subject}\n\n${body}`,
    }],
  }),
}).then(r => r.json());

const replyDraft = draft.content[0].text;
// Store draft in D1 — human reviews before sending, OR use gmail.users.drafts.create above
```

### Pattern 3: Extract structured data

```typescript
const extraction = await fetch(env.AI_GATEWAY_URL + '/anthropic/v1/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY },
  body: JSON.stringify({
    model: 'claude-sonnet-4-6',
    max_tokens: 300,
    messages: [{
      role: 'user',
      content: `Extract this as JSON: { customer_name, company, product_requested, quantity, delivery_address }.\nReturn only valid JSON.\n\n${body}`,
    }],
  }),
}).then(r => r.json());

const order = JSON.parse(extraction.content[0].text);
// Insert into WooCommerce, QuickBooks, or D1
```

For higher-reliability structured extraction, pass `response_format: { type: 'json_object' }` on the Anthropic side or use the same pattern with Gemini's `responseSchema` (see `tech/google/cloud/ai`).

## Quota & performance

Gmail API has **quota units per user per second** (not per project):
- `users.messages.get`: 5 units
- `users.messages.list`: 5 units
- `users.messages.send`: 100 units
- `users.history.list`: 2 units
- `users.watch`: 100 units

Default: **250 units/sec/user**, **1.2 billion units/day/project**. A high-volume DWD job that iterates all users parallelises across users, not within one user.

For send throughput, batch across users rather than a single user. Sending 1000 emails from one user in 10 seconds will hit the per-user cap; sending 1000 emails across 200 users will not.

## Gotchas

- **`base64url` not `base64`**: Every body and raw message uses base64url (URL-safe, no padding). Standard base64 decoders fail silently on `-` / `_` characters.
- **Watch expires in 7 days**: If you don't refresh, notifications silently stop. Daily refresh is the safe pattern.
- **Pub/Sub push delivery != instant**: Typical delivery is <5s, but under load can drift. Don't build reply SLAs with <30s guarantees.
- **`historyId` gaps**: If your consumer is down for 7+ days, the stored `historyId` may be expired. `users.history.list` returns 404 — recover by listing recent messages and resuming from the newest `historyId`.
- **Reply threading in clients**: Setting `threadId` groups messages in Gmail, but other clients (Outlook, iOS Mail) rely on `In-Reply-To` + `References` headers. Set all three.
- **Send quota per-user**: 2,000 msgs/day consumer Gmail, 10,000/day Workspace. Commercial sender reputation also throttles. For bulk, use SendGrid/Postmark, not Gmail API.
- **`users.messages.insert` vs `send`**: `send` sends and stores; `insert` stores without sending (useful for importing archives). Don't mix them up.
- **Filter operators are lossy**: `newer_than:2d` is approximate to the second; server-side clock drift can miss edge messages. For exact windows, filter by internal timestamp after fetch.
- **Drafts have their own ID namespace**: Retrieve drafts via `users.drafts.get`, not `users.messages.get`. The `message.id` inside a draft is different from the eventual sent-message ID.
- **Restricted-scope verification audit**: For External apps using `gmail.modify`/`gmail.readonly` at scale, plan for annual CASA Tier 2 audit (~$10k+). Internal apps bypass this.

## See Also

- [Google Workspace parent (scopes + auth)](../SKILL.md)
- [Vertex AI + Gemini (summarise / classify)](../../cloud/ai/SKILL.md)
- [Pub/Sub (push subscriptions)](../../cloud/data/SKILL.md)
- [Cloud Run (the consumer runtime)](../../cloud/compute/SKILL.md)
