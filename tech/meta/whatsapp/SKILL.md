---
name: tech/meta/whatsapp
description: |
  WhatsApp Business Cloud API skill. Use this skill when:
  (1) receiving and processing inbound WhatsApp messages in a Cloudflare Worker,
  (2) sending WhatsApp replies — text, interactive buttons, list menus, images, documents,
  (3) sending approved template messages for business-initiated outreach — invoices, reminders, alerts,
  (4) marking messages as read and showing typing indicators in WhatsApp,
  (5) building the AI reply pattern — WhatsApp message → Workers AI classify → Claude draft → Cloud API send,
  (6) handling interactive message replies — button taps and list selections from customers,
  (7) sending media (images, PDFs, audio) via the WhatsApp Cloud API,
  (8) managing the 24-hour customer service window — free-form vs template rules,
  (9) storing WhatsApp conversation threads in D1 for context and CRM sync,
  (10) building multi-turn conversations with context from KV or D1.
license: MIT
compatibility: WhatsApp Business Cloud API v21.0, Cloudflare Workers, Meta Graph API
homepage: https://skills.2nth.ai/tech/meta/whatsapp
repository: https://github.com/2nth-ai/skills
requires:
  - tech/meta
improves:
  - tech/meta
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "WhatsApp, Meta, Business, Messaging, AI, Automation, Cloud API"
allowed-tools: Read Write Edit Glob Grep
---

# WhatsApp Business Cloud API

WhatsApp is the dominant messaging channel in South Africa and across emerging markets. The Cloud API (hosted by Meta, no on-premise server required) makes it possible to send and receive WhatsApp messages from a Cloudflare Worker with no infrastructure beyond secrets.

**Key numbers:** 2B+ users globally. 90%+ smartphone penetration in SA uses WhatsApp as the primary communication channel. For B2C AI automation, this is higher-impact than email.

## Architecture (2nth.ai pattern)

```
Customer sends WhatsApp message
  → Meta Cloud pushes to Worker webhook
  → Worker: verify X-Hub-Signature-256
  → Mark message as read (instant)
  → Workers AI: classify intent (50ms, edge)
  → Route: simple reply inline | complex → Claude via AI Gateway
  → Build response: text | interactive buttons | template
  → POST to /{PHONE_NUMBER_ID}/messages
  → Store thread in D1 (for context on next message)
```

## Base URL and auth

```
Base: https://graph.facebook.com/v21.0/{PHONE_NUMBER_ID}/
Auth: Authorization: Bearer {WHATSAPP_TOKEN}
```

The `PHONE_NUMBER_ID` is the numeric ID of your WhatsApp business number (not the phone number itself). Find it in Meta Business Manager → WhatsApp → Phone Numbers.

## Receiving messages — webhook payload

```typescript
// Incoming webhook — object: "whatsapp_business_account"
interface WAWebhook {
  object: 'whatsapp_business_account';
  entry: Array<{
    id: string; // WABA ID
    changes: Array<{
      value: {
        messages?: WAMessage[];
        statuses?: WAStatus[];
        contacts?: WAContact[];
        metadata: { phone_number_id: string; display_phone_number: string };
      };
      field: 'messages';
    }>;
  }>;
}

interface WAMessage {
  id: string;      // wamid.xxx — unique message ID
  from: string;    // sender's phone number (no + prefix, e.g. "27821234567")
  timestamp: string;
  type: 'text' | 'image' | 'document' | 'audio' | 'interactive' | 'button' | 'location';
  text?: { body: string };
  interactive?: {
    type: 'button_reply' | 'list_reply';
    button_reply?: { id: string; title: string };
    list_reply?: { id: string; title: string; description?: string };
  };
  image?: { id: string; mime_type: string; caption?: string };
  document?: { id: string; filename: string; mime_type: string };
}
```

## Full Worker handler

```typescript
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // GET — webhook verification
    if (request.method === 'GET') {
      const url = new URL(request.url);
      if (url.searchParams.get('hub.verify_token') === env.WEBHOOK_VERIFY_TOKEN) {
        return new Response(url.searchParams.get('hub.challenge'));
      }
      return new Response('Forbidden', { status: 403 });
    }

    // POST — verify signature first
    const { valid, body } = await verifyMetaSignature(request, env);
    if (!valid) return new Response('Unauthorized', { status: 401 });

    const payload = JSON.parse(body) as WAWebhook;
    if (payload.object !== 'whatsapp_business_account') {
      return new Response('EVENT_RECEIVED', { status: 200 });
    }

    // Ack IMMEDIATELY — Meta retries non-200 responses
    ctx.waitUntil(processWebhook(payload, env));
    return new Response('EVENT_RECEIVED', { status: 200 });
  }
};

async function processWebhook(payload: WAWebhook, env: Env) {
  for (const entry of payload.entry) {
    for (const change of entry.changes) {
      const { messages, contacts, metadata } = change.value;
      if (!messages?.length) continue;

      for (const msg of messages) {
        const phoneId = metadata.phone_number_id;
        const from    = msg.from;
        const name    = contacts?.find(c => c.wa_id === from)?.profile.name ?? from;

        // Mark as read immediately
        await markRead(msg.id, phoneId, env);

        // Extract text (works for text and interactive replies)
        const text = extractText(msg);
        if (!text) continue;

        // Load conversation context from KV (last 5 turns)
        const contextKey = `wa_ctx:${from}`;
        const context = JSON.parse(await env.KV.get(contextKey) ?? '[]') as string[];

        // Classify intent with Workers AI
        const { response: intent } = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
          messages: [
            { role: 'system', content: 'Classify as: invoice | order | support | enquiry | general. One word.' },
            { role: 'user', content: text.slice(0, 400) },
          ],
        });

        // Draft reply
        const reply = await buildReply(text, intent.trim(), name, context, env);

        // Send reply
        await sendMessage(from, reply, phoneId, env);

        // Update context in KV (sliding window of 5 turns)
        context.push(`Customer: ${text}`, `Bot: ${typeof reply === 'string' ? reply : '[interactive]'}`);
        await env.KV.put(contextKey, JSON.stringify(context.slice(-10)), { expirationTtl: 86400 });

        // Store in D1
        await env.DB.prepare(
          'INSERT INTO wa_messages (wa_id, from_number, name, text, intent, ts) VALUES (?,?,?,?,?,?)'
        ).bind(msg.id, from, name, text, intent.trim(), Date.now()).run();
      }
    }
  }
}

function extractText(msg: WAMessage): string {
  if (msg.type === 'text') return msg.text?.body ?? '';
  if (msg.type === 'interactive') {
    return msg.interactive?.button_reply?.title
        ?? msg.interactive?.list_reply?.title
        ?? '';
  }
  if (msg.type === 'button') return (msg as any).button?.text ?? '';
  return '';
}
```

## Sending messages

### Text message
```typescript
async function sendText(to: string, text: string, phoneId: string, env: Env) {
  return fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.WHATSAPP_TOKEN}`,
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { preview_url: false, body: text },
    }),
  });
}
```

### Interactive — buttons (up to 3)
```typescript
async function sendButtons(to: string, body: string, buttons: { id: string; title: string }[], phoneId: string, env: Env) {
  return fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.WHATSAPP_TOKEN}` },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: body },
        action: {
          buttons: buttons.map(b => ({ type: 'reply', reply: { id: b.id, title: b.title } })),
        },
      },
    }),
  });
}

// Usage — overdue invoice with action buttons
await sendButtons(customerPhone,
  `Hi ${name}, your invoice #INV-0847 for R 24,500 is 18 days overdue. What would you like to do?`,
  [
    { id: 'pay_eft', title: 'Pay via EFT' },
    { id: 'payment_plan', title: 'Payment plan' },
    { id: 'dispute', title: 'Query invoice' },
  ],
  phoneId, env
);
```

### Interactive — list menu (up to 10 items)
```typescript
async function sendList(to: string, body: string, sections: any[], phoneId: string, env: Env) {
  return fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.WHATSAPP_TOKEN}` },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'list',
        header: { type: 'text', text: '2nth.ai Support' },
        body: { text: body },
        footer: { text: 'Select an option' },
        action: {
          button: 'View options',
          sections,
        },
      },
    }),
  });
}

// Usage
await sendList(customerPhone,
  'How can I help you today?',
  [{
    title: 'Account & Billing',
    rows: [
      { id: 'check_invoice', title: 'Check my invoice', description: 'View outstanding invoices' },
      { id: 'payment_history', title: 'Payment history', description: 'View past payments' },
      { id: 'update_details', title: 'Update my details', description: 'Change address or contact info' },
    ],
  }, {
    title: 'Orders & Delivery',
    rows: [
      { id: 'track_order', title: 'Track my order', description: 'Get delivery status' },
      { id: 'new_order', title: 'Place an order', description: 'Browse products' },
    ],
  }],
  phoneId, env
);
```

### Template message (business-initiated)
```typescript
// Only approved templates can start a new conversation
// Templates are created in Meta Business Manager → WhatsApp → Message Templates
async function sendTemplate(to: string, templateName: string, params: string[], phoneId: string, env: Env) {
  return fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.WHATSAPP_TOKEN}` },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'en_ZA' },
        components: params.length ? [{
          type: 'body',
          parameters: params.map(p => ({ type: 'text', text: p })),
        }] : [],
      },
    }),
  });
}

// Example: invoice_overdue template = "Hi {{1}}, your invoice for {{2}} is overdue."
await sendTemplate(customerPhone, 'invoice_overdue', [customerName, 'R 24,500'], phoneId, env);
```

### Mark as read + typing indicator
```typescript
async function markRead(messageId: string, phoneId: string, env: Env) {
  await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.WHATSAPP_TOKEN}` },
    body: JSON.stringify({ messaging_product: 'whatsapp', status: 'read', message_id: messageId }),
  });
}
```

### Send image or document
```typescript
// Send a PDF invoice
await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.WHATSAPP_TOKEN}` },
  body: JSON.stringify({
    messaging_product: 'whatsapp',
    to: customerPhone,
    type: 'document',
    document: {
      link: 'https://r2.2nth.ai/invoices/INV-0847.pdf', // public R2 URL
      caption: 'Invoice #INV-0847 — R 24,500',
      filename: 'INV-0847.pdf',
    },
  }),
});
```

## AI reply builder

```typescript
async function buildReply(
  text: string,
  intent: string,
  name: string,
  context: string[],
  env: Env
): Promise<string | object> {
  // ERP queries — check D1/ERPNext first, then format response
  if (intent === 'invoice') {
    const invoices = await env.DB.prepare(
      'SELECT * FROM invoices WHERE customer_phone = ? AND status = ? LIMIT 3'
    ).bind(env.CUSTOMER_PHONE, 'open').all();

    if (invoices.results.length > 0) {
      // Return interactive buttons instead of plain text
      return {
        type: 'interactive_buttons',
        body: `Hi ${name}, you have ${invoices.results.length} open invoice(s). Would you like to view details or make a payment?`,
        buttons: [
          { id: 'view_invoices', title: 'View invoices' },
          { id: 'pay_now', title: 'Pay now' },
        ],
      };
    }
  }

  // General — Claude via AI Gateway
  const contextStr = context.slice(-6).join('\n');
  const res = await fetch(env.AI_GATEWAY_URL + '/anthropic/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      system: `You are a WhatsApp business assistant for 2nth.ai. Respond in plain conversational text suitable for WhatsApp — no markdown, no bullet points, short sentences. Customer name: ${name}.`,
      messages: [
        ...(contextStr ? [{ role: 'user', content: `Previous conversation:\n${contextStr}` }] : []),
        { role: 'user', content: text },
      ],
    }),
  }).then(r => r.json());

  return res.content[0].text;
}
```

## 24-hour window rules

| Scenario | What you can send | Rule |
|----------|------------------|------|
| Customer messaged in last 24h | Any message type — text, interactive, media | Free-form session window |
| Customer messaged > 24h ago | **Approved templates only** | Business-initiated restriction |
| Never messaged before | **Approved templates only** | Cold outreach restriction |

Always check whether you're in a session window before choosing between `sendText` and `sendTemplate`.

## Gotchas

- **`EVENT_RECEIVED` not `OK`** — Meta expects the literal string `EVENT_RECEIVED` as the response body (or any 200). Returning JSON or empty body still works, but the spec says `EVENT_RECEIVED`.
- **Phone number format** — incoming `from` has no `+` prefix (`"27821234567"`). The `to` field for sending also must not have a `+` prefix. Strip it before storing.
- **`wamid` deduplication** — Meta may deliver the same webhook twice. Store the `wamid` in D1 with a unique constraint and ignore duplicates.
- **Template variables are 1-indexed** — `{{1}}`, `{{2}}` — not zero-indexed. Body components only; header/button variables have their own component arrays.
- **Interactive button title max 20 chars** — WhatsApp truncates titles silently. Keep button titles under 20 characters.
- **Media IDs expire** — Media uploaded via the API has a 30-day expiry. Use direct links from R2/Cloud Storage for permanent media.
- **Status updates flood webhooks** — you'll get `sent`, `delivered`, `read` statuses for every message. Check `change.value.statuses` and skip processing if it's a status update, not a message.
- **WABA quality rating** — sending too many unanswered messages or getting blocked degrades your phone number's quality tier, reducing daily send limits.
