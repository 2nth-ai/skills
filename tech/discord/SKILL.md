---
name: tech/discord
description: |
  Discord integration skill. Use this skill when:
  (1) building a Discord bot that receives slash commands and responds via Interactions Endpoint,
  (2) verifying Discord request signatures in a Cloudflare Worker using Ed25519 (not HMAC),
  (3) implementing deferred interaction responses — type 5 ack within 3s, AI reply via followup,
  (4) sending rich embed messages with fields, colours, thumbnails, and action buttons,
  (5) registering application commands (slash commands) via the Discord REST API,
  (6) posting automated notifications to Discord channels via webhooks,
  (7) using Discord as an AI agent surface — /ask triggers Workers AI + Claude reply,
  (8) handling message component interactions — button clicks, select menus, modals,
  (9) reading channel messages, guild members, or role data via the REST API,
  (10) building community bots for customer support, AI Q&A, or ops alerts.
license: MIT
compatibility: Discord REST API v10, Interactions Endpoint, Cloudflare Workers, Ed25519
repository: https://github.com/2nth-ai/skills
improves:
  - tech
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Discord, Bot, Slash Commands, Interactions, Embeds, AI, Webhooks, Workers"
allowed-tools: Read Write Edit Glob Grep
---

# Discord Integration

Discord bots work differently to Slack bots. Rather than polling a WebSocket gateway (which Workers can't maintain), Discord supports an **Interactions Endpoint URL** — Discord pushes every slash command and button click to your HTTP endpoint. Cloudflare Workers are ideal.

The key difference from Slack: Discord uses **Ed25519** (not HMAC-SHA256) for request verification. You also respond differently — a **deferred response** (type 5) tells Discord to show "Bot is thinking..." while your Worker processes asynchronously and patches the message when ready.

The **2nth.ai pattern**: `/ask` → Worker verifies Ed25519 → responds type 5 → `waitUntil` → Workers AI classify → Claude draft → PATCH original interaction response.

## App setup

### 1. Create the app
1. Go to [discord.com/developers/applications](https://discord.com/developers/applications) → New Application
2. Name it (e.g. `2nth Assistant`) → Create
3. **Bot** → Add Bot → copy the **Bot Token**
4. **General Information** → copy the **Application ID** and **Public Key**
5. **OAuth2 → URL Generator** → scopes: `bot`, `applications.commands` → copy invite URL → add to server

### 2. Set Interactions Endpoint URL
**General Information** → Interactions Endpoint URL → `https://your-worker.workers.dev/discord`

Discord will immediately POST a PING to verify the URL. Your Worker must verify the signature and respond with `{ "type": 1 }` (PONG).

### Required secrets
```bash
wrangler secret put DISCORD_PUBLIC_KEY    # from General Information → Public Key
wrangler secret put DISCORD_BOT_TOKEN     # from Bot → Token (xoxb-style, starts with Bot prefix)
wrangler secret put DISCORD_APP_ID        # Application ID (snowflake)
```

## Ed25519 signature verification

Discord uses Ed25519, not HMAC. The signed message is `timestamp + body` (concatenated, not separated).

```typescript
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

async function verifyDiscordSignature(request: Request, env: Env): Promise<{ valid: boolean; body: string }> {
  const signature = request.headers.get('X-Signature-Ed25519') ?? '';
  const timestamp  = request.headers.get('X-Signature-Timestamp') ?? '';
  const body = await request.text();

  if (!signature || !timestamp) return { valid: false, body };

  const key = await crypto.subtle.importKey(
    'raw',
    hexToBytes(env.DISCORD_PUBLIC_KEY),
    { name: 'Ed25519', namedCurve: 'Ed25519' },
    false,
    ['verify']
  );

  const valid = await crypto.subtle.verify(
    'Ed25519',
    key,
    hexToBytes(signature),
    new TextEncoder().encode(timestamp + body)
  );

  return { valid, body };
}
```

## Main Worker handler

```typescript
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });

    const { valid, body } = await verifyDiscordSignature(request, env);
    if (!valid) return new Response('Invalid signature', { status: 401 });

    const interaction = JSON.parse(body);

    // Type 1 — Discord PING (sent on URL setup and periodically)
    if (interaction.type === 1) {
      return Response.json({ type: 1 }); // PONG
    }

    // Type 2 — Application Command (slash command)
    if (interaction.type === 2) {
      return handleSlashCommand(interaction, env, ctx);
    }

    // Type 3 — Message Component (button/select menu click)
    if (interaction.type === 3) {
      return handleComponent(interaction, env, ctx);
    }

    // Type 5 — Modal submit
    if (interaction.type === 5) {
      return handleModalSubmit(interaction, env, ctx);
    }

    return new Response('Unknown interaction type', { status: 400 });
  }
};
```

## Deferred responses — the AI pattern

Discord expects a response within **3 seconds**. AI takes longer. Respond with type 5 (DEFERRED) immediately, then patch the response when the AI is ready. Discord shows "Bot is thinking…" to the user in the meantime.

```typescript
async function handleSlashCommand(
  interaction: any,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  const commandName = interaction.data.name;
  const options = interaction.data.options ?? [];
  const query = options.find((o: any) => o.name === 'question')?.value ?? '';

  // DEFER immediately — Discord sees this as a valid response < 3s
  const deferResponse = Response.json({
    type: 5,  // DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE
    data: { flags: 0 }, // 0 = public, 64 = ephemeral (only visible to user)
  });

  // Process async after response is sent
  ctx.waitUntil(processSlashCommand(interaction, query, env));

  return deferResponse;
}

async function processSlashCommand(interaction: any, query: string, env: Env) {
  const { application_id, token } = interaction;

  try {
    // 1. Classify with Workers AI
    const classification = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: 'Classify as: erp_query | report | general | help. One word only.' },
        { role: 'user', content: query.slice(0, 500) },
      ],
    });
    const intent = classification.response.trim().toLowerCase();

    // 2. Draft reply with Claude
    const reply = await draftWithClaude(query, intent, env);

    // 3. PATCH the deferred response with the real content
    await patchInteractionResponse(application_id, token, {
      embeds: [buildEmbed(query, reply, intent)],
      components: [buildActionRow()],
    }, env);

  } catch (err) {
    // Patch with error message if something goes wrong
    await patchInteractionResponse(application_id, token, {
      content: '⚠️ Something went wrong. Please try again.',
    }, env);
  }
}

async function patchInteractionResponse(appId: string, token: string, data: any, env: Env) {
  await fetch(
    `https://discord.com/api/v10/webhooks/${appId}/${token}/messages/@original`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
      },
      body: JSON.stringify(data),
    }
  );
}
```

## Registering slash commands

Commands must be registered via the REST API before Discord shows them to users. Do this once on deploy, or on app boot for guild-specific commands.

```typescript
// Register commands globally (takes up to 1 hour to propagate)
async function registerCommands(env: Env) {
  const commands = [
    {
      name: 'ask',
      description: 'Ask the 2nth AI assistant anything',
      options: [
        {
          name: 'question',
          description: 'Your question',
          type: 3, // STRING
          required: true,
        },
      ],
    },
    {
      name: 'invoice',
      description: 'Query invoice status',
      options: [
        { name: 'client', description: 'Client name', type: 3, required: false },
        { name: 'status', description: 'Status filter', type: 3, required: false,
          choices: [
            { name: 'Open', value: 'open' },
            { name: 'Overdue', value: 'overdue' },
            { name: 'Paid', value: 'paid' },
          ],
        },
      ],
    },
    {
      name: 'report',
      description: 'Generate a business report',
      options: [
        { name: 'type', description: 'Report type', type: 3, required: true,
          choices: [
            { name: 'Revenue', value: 'revenue' },
            { name: 'Invoices', value: 'invoices' },
            { name: 'Support', value: 'support' },
          ],
        },
      ],
    },
  ];

  await fetch(`https://discord.com/api/v10/applications/${env.DISCORD_APP_ID}/commands`, {
    method: 'PUT', // PUT replaces all global commands atomically
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
    },
    body: JSON.stringify(commands),
  });
}

// Register to a specific guild (instant, good for development)
async function registerGuildCommands(guildId: string, env: Env) {
  await fetch(
    `https://discord.com/api/v10/applications/${env.DISCORD_APP_ID}/guilds/${guildId}/commands`,
    { /* same as above */ }
  );
}
```

## Embeds — rich message formatting

Embeds are Discord's equivalent of Block Kit. Use a left-border colour to indicate intent.

```typescript
function buildEmbed(question: string, answer: string, intent: string) {
  const colours: Record<string, number> = {
    erp_query: 0x007a5a,  // green
    report:    0x1264a3,  // blue
    general:   0x5865F2,  // discord blurple
    help:      0xFEE75C,  // yellow
  };

  return {
    color: colours[intent] ?? 0x5865F2,
    author: {
      name: '2nth Assistant',
      icon_url: 'https://skills.2nth.ai/logo.png',
    },
    description: answer,
    footer: {
      text: `Powered by 2nth.ai · Workers AI + Claude`,
    },
    timestamp: new Date().toISOString(),
    fields: question ? [
      { name: 'Question', value: `> ${question}`, inline: false },
    ] : [],
  };
}
```

## Message components — buttons and select menus

```typescript
function buildActionRow() {
  return {
    type: 1, // ACTION_ROW
    components: [
      {
        type: 2, // BUTTON
        style: 3, // SUCCESS (green)
        label: '👍 Helpful',
        custom_id: 'feedback_positive',
      },
      {
        type: 2, // BUTTON
        style: 2, // SECONDARY
        label: '✏️ Refine',
        custom_id: 'feedback_refine',
      },
      {
        type: 2,
        style: 2,
        label: '📋 Save',
        custom_id: 'save_response',
      },
    ],
  };
}

// Handle button clicks
async function handleComponent(interaction: any, env: Env, ctx: ExecutionContext): Promise<Response> {
  const customId = interaction.data.custom_id;

  if (customId === 'save_response') {
    // Get the message content from the interaction
    const content = interaction.message.embeds[0]?.description ?? '';
    await env.DB.prepare(
      'INSERT INTO saved_responses (user_id, content, guild_id, saved_at) VALUES (?,?,?,?)'
    ).bind(interaction.member?.user?.id, content, interaction.guild_id, Date.now()).run();

    // Update message — remove buttons, add saved confirmation
    return Response.json({
      type: 7, // UPDATE_MESSAGE
      data: {
        embeds: interaction.message.embeds,
        components: [{
          type: 1,
          components: [{
            type: 2, style: 2,
            label: '✅ Saved to database',
            custom_id: 'saved_done',
            disabled: true,
          }],
        }],
      },
    });
  }

  // Acknowledge other button clicks with a hidden message
  return Response.json({
    type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
    data: {
      content: customId === 'feedback_positive' ? '✅ Glad it helped!' : '✏️ What would you like changed?',
      flags: 64, // EPHEMERAL — only visible to the button clicker
    },
  });
}
```

## Webhooks — simple one-way notifications

Webhooks don't require a bot token. Create one in any Discord channel and POST to it for alerts.

```typescript
// Create webhook in Discord: Channel settings → Integrations → Webhooks → New Webhook
async function sendWebhook(webhookUrl: string, content: string, embed?: object) {
  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: '2nth Alerts',
      avatar_url: 'https://skills.2nth.ai/logo.png',
      content,
      embeds: embed ? [embed] : [],
    }),
  });
}

// From a Pub/Sub trigger (GCP → Worker):
await sendWebhook(env.DISCORD_WEBHOOK_OPS, '', {
  color: 0xE01E5A, // red = alert
  title: '⚠️ Overdue Invoice Alert',
  description: 'Acme Corp owes **R 24,500** — 18 days overdue',
  fields: [
    { name: 'Invoice', value: '#INV-2024-0847', inline: true },
    { name: 'Due date', value: '14 Mar 2026', inline: true },
    { name: 'Action', value: '[View in ERP](https://erp.2nth.ai/invoices/0847)', inline: false },
  ],
  timestamp: new Date().toISOString(),
});
```

## AI draft helper

```typescript
async function draftWithClaude(query: string, intent: string, env: Env): Promise<string> {
  const systemPrompts: Record<string, string> = {
    erp_query: 'You are an ERP assistant. Answer concisely with key data points. Use Discord markdown formatting.',
    report:    'You are a business analyst. Provide structured summaries with bullet points and bold key figures.',
    general:   'You are a helpful business assistant. Be concise and direct. Use Discord markdown.',
    help:      'You are explaining the 2nth.ai Discord bot. List commands and capabilities clearly.',
  };

  const res = await fetch(env.AI_GATEWAY_URL + '/anthropic/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      system: systemPrompts[intent] ?? systemPrompts.general,
      messages: [{ role: 'user', content: query }],
    }),
  }).then(r => r.json());

  return res.content[0].text;
}
```

## Interaction response type reference

| Type | Name | When to use |
|------|------|-------------|
| `1` | PONG | Reply to Discord's PING on URL setup |
| `4` | CHANNEL_MESSAGE_WITH_SOURCE | Instant reply (< 3s, no AI) |
| `5` | DEFERRED_CHANNEL_MESSAGE | Show "thinking…" — use for AI, PATCH later |
| `6` | DEFERRED_UPDATE_MESSAGE | Defer update to an existing message |
| `7` | UPDATE_MESSAGE | Replace a component message in-place |

Ephemeral flag (`flags: 64`) makes a reply only visible to the user who triggered it. Use for feedback confirmations and error messages.

## Rate limits

| Endpoint | Limit | Notes |
|----------|-------|-------|
| Global | 50 req/sec per bot | Across all endpoints |
| `POST /messages` per channel | 5 req/5s | Back off with exponential retry |
| Webhook | 30 req/min | Per webhook URL |
| `PATCH /messages/@original` | 5 req/sec | Followup to deferred interaction |
| Global commands `PUT` | 2 per day | Use guild commands in development |

## Gotchas

- **Ed25519, not HMAC** — Discord verification is completely different to Slack. Using the wrong algorithm will always fail. The signed message is `timestamp + body` with no separator.
- **PING must respond immediately** — Discord sends a type 1 PING both on URL setup and periodically. It must get a type 1 PONG with no async delay.
- **Deferred = no content** — When you respond with type 5, you cannot include `content` or `embeds`. They go in the PATCH followup only.
- **Interaction token expiry** — The `token` in an interaction expires after **15 minutes**. Store tasks accordingly; you can't patch after that.
- **Global command propagation** — `PUT /applications/{id}/commands` for global commands can take up to 1 hour. During development, always use guild commands (`/guilds/{guildId}/commands`) which are instant.
- **`PUT` replaces all commands** — Using PUT on global or guild commands atomically replaces the full set. Don't use PATCH for updates in bulk.
- **Ephemeral messages can't be patched** — Ephemeral (flags: 64) deferred responses can't be patched. If you need to update an ephemeral message, use type 6 (DEFERRED_UPDATE_MESSAGE) instead.
- **Bot token prefix** — The Authorization header must be `Bot <token>`, not `Bearer <token>`. Easy to miss when coming from OAuth APIs.
- **No Gateway in Workers** — The Discord Gateway uses WebSockets which Workers don't support. Use Interactions Endpoint for slash commands; use webhooks for posting. If you need real-time events (reactions, joins), use a Durable Object or Cloud Run container.
