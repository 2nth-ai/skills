---
name: tech/slack
description: |
  Slack integration skill. Use this skill when:
  (1) building a Slack bot or app that receives events and replies in channels or DMs,
  (2) handling slash commands — custom /commands that trigger AI workflows from Slack,
  (3) implementing the 3-second ack + async reply pattern for AI responses in Workers,
  (4) verifying Slack request signatures in a Cloudflare Worker (HMAC-SHA256),
  (5) building rich Block Kit messages — sections, actions, context, modals,
  (6) using Slack as an agentic surface — app_mention triggers Workers AI + Claude reply,
  (7) posting structured data to Slack channels via Web API or Incoming Webhooks,
  (8) building interactive messages — button clicks, select menus, modal submissions,
  (9) reading channel history, user info, or workspace data via the Web API,
  (10) exposing Slack slash commands as MCP tools or AI agent endpoints.
license: MIT
compatibility: Slack Web API, Events API, Slash Commands, Block Kit, Cloudflare Workers
repository: https://github.com/2nth-ai/skills
improves:
  - tech
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Slack, Bot, Events API, Block Kit, AI, Automation, Workers"
allowed-tools: Read Write Edit Glob Grep
---

# Slack Integration

Slack is the most direct AI agent surface for business teams. A mention or slash command is a natural agent invocation — the user is already in context, expects a reply, and can act on it immediately.

The **2nth.ai pattern**: Slack event → Cloudflare Worker → signature verify (3ms) → Workers AI classify (50ms) → Claude draft reply → `chat.postMessage`.

## App setup

### Create the app (app manifest)
```yaml
# slack-app-manifest.yaml — paste into api.slack.com/apps → Create from manifest
display_information:
  name: 2nth Assistant
  description: AI-powered business assistant for your workspace
  background_color: "#003459"

features:
  bot_user:
    display_name: 2nth
    always_online: true
  slash_commands:
    - command: /ask
      url: https://your-worker.workers.dev/slack/command
      description: Ask the 2nth AI assistant
      usage_hint: "[your question]"
      should_escape: false

oauth_config:
  scopes:
    bot:
      - app_mentions:read       # receive @mentions
      - chat:write               # send messages
      - chat:write.public        # post to channels the bot isn't in
      - commands                 # receive slash commands
      - channels:history         # read channel messages (for context)
      - im:history               # read DMs
      - im:write                 # open DMs
      - users:read               # resolve user display names
      - channels:read            # list channels

settings:
  event_subscriptions:
    request_url: https://your-worker.workers.dev/slack/events
    bot_events:
      - app_mention              # @2nth in any channel
      - message.im               # DM to the bot
  interactivity:
    is_enabled: true
    request_url: https://your-worker.workers.dev/slack/interact
  org_deploy_enabled: false
  socket_mode_enabled: false   # Workers use HTTP, not Socket Mode
```

### Required secrets
```bash
wrangler secret put SLACK_BOT_TOKEN       # xoxb-... from OAuth & Permissions
wrangler secret put SLACK_SIGNING_SECRET  # from Basic Information → App Credentials
```

## Signature verification

Every request from Slack must be verified. Skip this and your Worker is an open endpoint.

```typescript
async function verifySlackSignature(request: Request, env: Env): Promise<boolean> {
  const timestamp = request.headers.get('X-Slack-Request-Timestamp') ?? '';
  const slackSig  = request.headers.get('X-Slack-Signature') ?? '';
  const body      = await request.text();

  // Reject replays older than 5 minutes
  if (Math.abs(Date.now() / 1000 - parseInt(timestamp)) > 300) return false;

  const sigBase = `v0:${timestamp}:${body}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(env.SLACK_SIGNING_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(sigBase));
  const hex = 'v0=' + Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');

  return hex === slackSig;
}
```

## The 3-second rule — critical pattern

Slack times out any event endpoint that doesn't respond within **3 seconds**. AI responses take 2–10 seconds. The solution: ack immediately, process with `waitUntil`.

```typescript
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const body = await request.text();

    // Verify before anything else
    if (!await verifySlackSignature(request.clone(), env)) {
      return new Response('Unauthorized', { status: 401 });
    }

    const payload = JSON.parse(body);

    // Slack URL verification challenge (happens once on setup)
    if (payload.type === 'url_verification') {
      return Response.json({ challenge: payload.challenge });
    }

    // ACK IMMEDIATELY — Slack requires < 3s
    const ackResponse = new Response('', { status: 200 });

    // Process async — Worker keeps running after response is sent
    ctx.waitUntil(handleEvent(payload.event, env));

    return ackResponse;
  }
};
```

## Event handling

### app_mention — the core AI pattern
```typescript
async function handleEvent(event: any, env: Env) {
  if (event.type !== 'app_mention' && event.type !== 'message') return;
  if (event.bot_id) return; // ignore messages from bots (including ourselves)

  const text = event.text.replace(/<@[A-Z0-9]+>/g, '').trim(); // strip @mention
  const channel = event.channel;
  const threadTs = event.thread_ts ?? event.ts; // reply in thread

  // Show typing indicator
  await postTypingIndicator(channel, env);

  // 1. Classify with Workers AI (fast, edge)
  const classification = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      { role: 'system', content: 'Classify this message as one of: erp_query | document_search | report | general. Reply with one word.' },
      { role: 'user', content: text.slice(0, 500) },
    ],
  });
  const intent = classification.response.trim().toLowerCase();

  // 2. Route based on intent
  let reply: string;
  if (intent === 'erp_query') {
    reply = await handleERPQuery(text, env);
  } else if (intent === 'report') {
    reply = await handleReportRequest(text, env);
  } else {
    // General — Claude via AI Gateway
    reply = await draftWithClaude(text, env);
  }

  // 3. Post reply in thread
  await postMessage(channel, threadTs, reply, env);
}

async function draftWithClaude(text: string, env: Env): Promise<string> {
  const res = await fetch(env.AI_GATEWAY_URL + '/anthropic/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      messages: [{ role: 'user', content: text }],
      system: 'You are a helpful business assistant. Be concise and direct. Use plain text suitable for Slack.',
    }),
  }).then(r => r.json());
  return res.content[0].text;
}
```

## Slash commands

Slash commands arrive as `application/x-www-form-urlencoded`, not JSON. They also require a sub-3-second response but can use `response_url` for delayed replies.

```typescript
async function handleSlashCommand(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const data = await request.formData();
  const command  = data.get('command');   // /ask
  const text     = data.get('text');      // everything after /ask
  const userId   = data.get('user_id');
  const responseUrl = data.get('response_url'); // for delayed replies

  // Ack with an immediate "thinking" message
  const ack = Response.json({
    response_type: 'in_channel',
    text: `Processing: _${text}_...`,
  });

  // Process and post the real reply using response_url
  ctx.waitUntil((async () => {
    const reply = await draftWithClaude(text as string, env);
    await fetch(responseUrl as string, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        response_type: 'in_channel',
        replace_original: true,
        blocks: buildReplyBlocks(text as string, reply, userId as string),
      }),
    });
  })());

  return ack;
}
```

## Web API — posting messages

```typescript
async function postMessage(channel: string, threadTs: string, text: string, env: Env) {
  await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.SLACK_BOT_TOKEN}`,
    },
    body: JSON.stringify({
      channel,
      thread_ts: threadTs,  // reply in thread — always do this
      text,                  // fallback for notifications
      blocks: buildReplyBlocks('', text, ''), // rich Block Kit version
    }),
  });
}

// Fetch user display name
async function getUserName(userId: string, env: Env): Promise<string> {
  const res = await fetch(`https://slack.com/api/users.info?user=${userId}`, {
    headers: { Authorization: `Bearer ${env.SLACK_BOT_TOKEN}` },
  }).then(r => r.json());
  return res.user?.display_name ?? res.user?.real_name ?? userId;
}
```

## Block Kit — rich messages

Block Kit turns plain text into interactive, structured messages. Always include a `text` fallback for notifications.

```typescript
function buildReplyBlocks(question: string, answer: string, userId: string) {
  const blocks: any[] = [];

  if (question) {
    blocks.push({
      type: 'context',
      elements: [{ type: 'mrkdwn', text: `*Question from <@${userId}>:* ${question}` }],
    });
  }

  blocks.push({
    type: 'section',
    text: { type: 'mrkdwn', text: answer },
  });

  blocks.push({ type: 'divider' });

  blocks.push({
    type: 'actions',
    elements: [
      {
        type: 'button',
        text: { type: 'plain_text', text: '👍 Helpful' },
        style: 'primary',
        action_id: 'feedback_positive',
      },
      {
        type: 'button',
        text: { type: 'plain_text', text: '✏️ Refine' },
        action_id: 'feedback_refine',
      },
      {
        type: 'button',
        text: { type: 'plain_text', text: '📋 Copy to D1' },
        action_id: 'save_to_db',
      },
    ],
  });

  blocks.push({
    type: 'context',
    elements: [{ type: 'mrkdwn', text: `_Powered by 2nth.ai · ${new Date().toLocaleTimeString()}_` }],
  });

  return blocks;
}
```

## Interactivity — handling button clicks

Button clicks (and modal submissions) are sent to the `interactivity` URL as `payload=<urlencoded JSON>`.

```typescript
async function handleInteraction(request: Request, env: Env): Promise<Response> {
  const body = await request.formData();
  const payload = JSON.parse(body.get('payload') as string);

  if (payload.type === 'block_actions') {
    const action = payload.actions[0];

    if (action.action_id === 'save_to_db') {
      // Extract the message text and store in D1
      const messageText = payload.message.blocks
        .find((b: any) => b.type === 'section')?.text?.text ?? '';

      await env.DB.prepare(
        'INSERT INTO saved_messages (user_id, content, channel, saved_at) VALUES (?,?,?,?)'
      ).bind(payload.user.id, messageText, payload.channel.id, Date.now()).run();

      // Update the message to show it was saved
      await fetch('https://slack.com/api/chat.update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.SLACK_BOT_TOKEN}` },
        body: JSON.stringify({
          channel: payload.channel.id,
          ts: payload.message.ts,
          text: payload.message.text,
          blocks: [...payload.message.blocks.slice(0, -1),
            { type: 'context', elements: [{ type: 'mrkdwn', text: '✅ _Saved to database_' }] }],
        }),
      });
    }
  }

  return new Response('', { status: 200 });
}
```

## Incoming webhooks — simplest send pattern

For one-way notifications (alerts, scheduled reports, ERP events), Incoming Webhooks need no token management.

```typescript
async function notify(webhookUrl: string, message: string) {
  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: message,
      blocks: [
        { type: 'section', text: { type: 'mrkdwn', text: message } },
        { type: 'context', elements: [{ type: 'mrkdwn', text: `<!date^${Math.floor(Date.now()/1000)}^{date_short_pretty} at {time}|now>` }] },
      ],
    }),
  });
}

// Triggered from Pub/Sub → Worker (GCP event pipeline)
await notify(env.SLACK_WEBHOOK_OVERDUE, `⚠️ *Overdue invoice alert* — Acme Corp owes R 24,500 (18 days)`);
```

## wrangler.toml — full config

```toml
name = "slack-bot"
main = "src/index.ts"
compatibility_date = "2025-01-01"

[[kv_namespaces]]
binding = "KV"
id = "..."

[[d1_databases]]
binding = "DB"
database_name = "slack-bot"
database_id = "..."

[ai]
binding = "AI"

[vars]
AI_GATEWAY_URL = "https://gateway.ai.cloudflare.com/v1/YOUR_ACCOUNT/YOUR_GATEWAY"
```

## Router — single Worker, multiple paths

```typescript
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (!await verifySlackSignature(request.clone(), env)) {
      return new Response('Unauthorized', { status: 401 });
    }

    const url = new URL(request.url);

    if (url.pathname === '/slack/events')   return handleEvents(request, env, ctx);
    if (url.pathname === '/slack/command')  return handleSlashCommand(request, env, ctx);
    if (url.pathname === '/slack/interact') return handleInteraction(request, env);

    return new Response('Not found', { status: 404 });
  }
};
```

## Rate limits

| Endpoint | Tier | Limit |
|----------|------|-------|
| `chat.postMessage` | Tier 3 | 1 req/sec per channel |
| `users.info` | Tier 4 | 20+ req/min |
| `conversations.history` | Tier 3 | 50 req/min |
| Incoming webhooks | — | 1 req/sec |
| Event delivery retries | — | 3 retries, exponential backoff |

Cache user info in KV (`user:{userId}`, TTL 3600) — calling `users.info` on every message will hit rate limits fast.

## Gotchas

- **3-second timeout** — non-negotiable. Always `ctx.waitUntil()` for AI work. The ack must be sent before the AI call starts.
- **Signature verification** — do it on every request. The timestamp check prevents replay attacks — reject anything older than 5 minutes.
- **Bot message loops** — always check `event.bot_id` before processing. Without this your bot will reply to itself indefinitely.
- **Thread replies** — always pass `thread_ts` to `chat.postMessage` when replying to a mention. Without it you flood the channel.
- **`text` fallback** — Block Kit messages require a `text` field for notifications and accessibility. Never omit it.
- **Slash command formData** — slash commands send `application/x-www-form-urlencoded`, not JSON. Use `request.formData()`, not `request.json()`.
- **`response_url` expiry** — slash command `response_url` tokens expire after 30 minutes and can only be used 5 times.
- **Socket Mode** — Socket Mode requires a persistent WebSocket connection, which Workers don't support. Use HTTP event subscriptions.
- **App Home tab** — use `app_home_opened` to build a personal dashboard per user — summary of their invoices, tasks, or alerts.
