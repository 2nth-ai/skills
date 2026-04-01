---
name: tech/cloudflare/ai/ai-gateway
description: |
  Cloudflare AI Gateway — unified proxy for Claude, OpenAI, and Workers AI. Use this skill when:
  (1) routing all Claude API calls through AI Gateway for token metering and logging,
  (2) implementing caching to reduce duplicate AI costs (semantic caching),
  (3) setting rate limits on AI usage per client or user,
  (4) adding fallback providers (if Claude fails, fall back to Workers AI),
  (5) observing token usage, latency, and cost across all AI calls in one dashboard,
  (6) implementing the 2nth token economy — per-client billing via gateway logs.
license: MIT
compatibility: Cloudflare Workers, any HTTP client
homepage: https://skills.2nth.ai/tech/cloudflare/ai/ai-gateway
repository: https://github.com/2nth-ai/skills
requires:
  - tech/cloudflare/workers
  - tech/cloudflare/ai/workers-ai
improves:
  - tech/cloudflare/ai
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Cloudflare, AI Gateway, Claude, Token Economy, Observability"
allowed-tools: Bash(npx:*) Bash(wrangler:*) Read Write Edit Glob Grep
---

# Cloudflare AI Gateway

AI Gateway is a proxy that sits between your Workers and AI providers (Anthropic, OpenAI, Workers AI). It provides caching, rate limiting, logging, fallback routing, and token usage analytics — all without changing your AI SDK code.

**Free tier**: 100k requests/month, 7-day log retention.
**Paid**: Higher request limits, 30-day retention, persistent logs.

## Why this is critical for 2nth

Every Claude API call in 2nth.ai should go through AI Gateway. This gives:
- **Token metering**: see exactly how many tokens each client, agent, and skill consumes
- **Cost attribution**: allocate AI spend per client for billing
- **Caching**: reduce costs on repeated queries
- **Fallback**: if Claude is down, route to Workers AI

## Setup

1. Create a gateway in the Cloudflare dashboard: **AI > AI Gateway > Create Gateway**
2. Copy the gateway URL:
   ```
   https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_name}/
   ```
3. Replace the Anthropic base URL in your Worker:

```bash
# Set via wrangler secret
wrangler secret put ANTHROPIC_BASE_URL
# Value: https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_name}/anthropic
```

## Calling Claude via AI Gateway (drop-in replacement)

```typescript
// Before: direct Anthropic call
// const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

// After: route through AI Gateway (no SDK changes needed)
const client = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
  baseURL: env.ANTHROPIC_BASE_URL, // points to AI Gateway
});

const message = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  messages: [{ role: 'user', content: prompt }],
});
```

## Metadata for token attribution (per-client billing)

AI Gateway passes custom headers downstream — use these to tag which client and skill generated each request:

```typescript
const client = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
  baseURL: env.ANTHROPIC_BASE_URL,
  defaultHeaders: {
    'cf-aig-metadata': JSON.stringify({
      clientId: currentClient,
      skillPath: 'biz/erp/sage-x3',
      agentId: 'penny',
      sessionId: sessionId,
    }),
  },
});
```

This metadata appears in AI Gateway logs → filterable by client for billing.

## Caching responses

```typescript
// Pass cache headers to AI Gateway
const client = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
  baseURL: env.ANTHROPIC_BASE_URL,
  defaultHeaders: {
    'cf-aig-cache-ttl': '3600',       // cache for 1 hour (in seconds)
    'cf-aig-skip-cache': 'false',     // set 'true' to always bypass
  },
});
```

**When to cache**: Classification tasks, FAQ answers, skill summaries — anything deterministic.
**When not to cache**: User-specific conversations, real-time data queries.

## Fallback routing

```typescript
// AI Gateway URL format for fallback:
// /v1/{account}/{gateway}/anthropic → /v1/{account}/{gateway}/workers-ai
// Configure in the gateway dashboard under "Providers" — set fallback order.

// Or call the universal gateway endpoint for provider-agnostic routing:
const response = await fetch(`${env.AI_GATEWAY_URL}/anthropic/v1/messages`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${env.ANTHROPIC_API_KEY}`,
    'cf-aig-fallback-model': '@cf/meta/llama-3.1-8b-instruct',  // Workers AI fallback
  },
  body: JSON.stringify({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  }),
});
```

## Rate limiting via AI Gateway

In the Cloudflare dashboard, set per-gateway rate limits:
- **Requests per minute**: e.g. 60 RPM per API key
- **Tokens per day**: total token budget
- **Per-user rate limits**: using the metadata `clientId` field

No code changes needed — the gateway enforces limits and returns `429` when exceeded.

## Reading usage data (for Penny's token economy)

```typescript
// AI Gateway exposes usage via Cloudflare API
// GET /client/v4/accounts/{account_id}/ai-gateway/gateways/{gateway_id}/logs

const logs = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/ai-gateway/gateways/${env.GATEWAY_ID}/logs?limit=100`,
  { headers: { 'Authorization': `Bearer ${env.CF_API_TOKEN}` } }
);

// Each log entry includes: tokens_in, tokens_out, model, duration, metadata (client/skill)
// Aggregate by clientId for monthly billing
```

## Common Gotchas

- **The gateway URL includes the provider path**: For Anthropic, it's `.../{gateway_name}/anthropic`. For OpenAI: `.../{gateway_name}/openai`. Include the trailing provider slug.
- **SDK `baseURL` must end without trailing slash** for Anthropic SDK v4+.
- **`cf-aig-metadata` must be valid JSON string**: Stringify it before setting as a header value.
- **Caching is exact-match by default**: Semantic caching (embed + similarity) is a paid gateway feature.
- **Logs are not real-time**: Gateway logs have ~1min delay. Don't use for real-time rate limit checks.
- **Free tier: 7 days retention**: Penny's weekly briefing must aggregate within the window.

## See Also

- [Workers AI (edge inference)](../workers-ai/SKILL.md)
- [Vectorize (RAG search)](../vectorize/SKILL.md)
- [Queues (async AI jobs)](../../queues/SKILL.md)
