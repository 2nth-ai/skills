---
name: tech/cloudflare/workers
description: |
  Cloudflare Workers runtime. Use this skill when:
  (1) building edge API handlers, middleware, or proxies in TypeScript/JavaScript,
  (2) connecting Workers to D1, KV, R2, Queues, or Durable Objects via bindings,
  (3) deploying with Wrangler CLI — local dev, secrets, migrations, publish,
  (4) implementing async patterns — background tasks via Queues, waitUntil(),
  (5) streaming responses (SSE, chunked transfer) from AI or upstream APIs,
  (6) building Worker-to-Worker communication or service bindings.
license: MIT
compatibility: Cloudflare Workers (V8 isolates, Node.js compat mode)
homepage: https://skills.2nth.ai/tech/cloudflare/workers
repository: https://github.com/2nth-ai/skills
requires:
  - tech/cloudflare
improves:
  - tech/cloudflare
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Cloudflare, Workers, Edge, TypeScript, Serverless"
allowed-tools: Bash(npx:*) Bash(wrangler:*) Read Write Edit Glob Grep
---

# Cloudflare Workers

Cloudflare Workers run JavaScript/TypeScript in V8 isolates at Cloudflare's edge — zero cold starts, global distribution, bound to your account's storage and AI services.

**CPU limit**: 10ms (free) / 30s (paid Unbound).
**Memory**: 128MB per isolate.
**Requests**: 100k/day (free) / 10M+/month (Workers Paid, $5/mo).

## wrangler.toml (canonical pattern)

```toml
name = "my-worker"
main = "src/index.ts"
compatibility_date = "2024-12-01"
compatibility_flags = ["nodejs_compat"]   # enables Node.js built-ins

[vars]
ENV = "production"

[[d1_databases]]
binding = "DB"
database_name = "my-db"
database_id = "YOUR_D1_ID"

[[kv_namespaces]]
binding = "KV"
id = "YOUR_KV_ID"

[[r2_buckets]]
binding = "R2"
bucket_name = "my-bucket"

[ai]
binding = "AI"

[[queues.producers]]
binding = "QUEUE"
queue = "my-queue"
```

## Worker entrypoint

```typescript
export interface Env {
  DB: D1Database;
  KV: KVNamespace;
  R2: R2Bucket;
  AI: Ai;
  QUEUE: Queue;
  // Vars (from [vars] or wrangler secret)
  ENV: string;
  API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // ctx.waitUntil — runs after response is sent (logging, cache warming)
    ctx.waitUntil(logRequest(env, request));

    if (url.pathname === '/api/data') {
      const rows = await env.DB.prepare('SELECT * FROM items LIMIT 50').all();
      return Response.json(rows.results);
    }

    return new Response('Not found', { status: 404 });
  },

  // Queue consumer (if this Worker is a queue consumer)
  async queue(batch: MessageBatch<unknown>, env: Env): Promise<void> {
    for (const msg of batch.messages) {
      await processMessage(msg.body, env);
      msg.ack();
    }
  },
};
```

## Streaming responses (SSE / AI)

```typescript
// Stream Workers AI output to client
const stream = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
  messages: [{ role: 'user', content: prompt }],
  stream: true,
});

return new Response(stream, {
  headers: {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  },
});
```

## Service bindings (Worker-to-Worker)

```toml
# In wrangler.toml — call another Worker directly (no HTTP overhead)
[[services]]
binding = "AUTH_SERVICE"
service = "auth-worker"
```

```typescript
// In code
const response = await env.AUTH_SERVICE.fetch(request.clone());
```

## Secrets

```bash
wrangler secret put API_KEY          # prompts for value, encrypts at rest
wrangler secret list                 # list secret names (not values)
wrangler secret delete API_KEY
```

Secrets are available as `env.API_KEY` in the Worker. Never put secrets in `[vars]` — those are plaintext in wrangler.toml.

## Key commands

```bash
wrangler dev                          # local dev (port 8787)
wrangler dev --remote                 # dev against production bindings
wrangler deploy                       # deploy to production
wrangler tail                         # stream live logs
wrangler deployments list             # deployment history
wrangler rollback <version-id>        # roll back to a previous version
```

## `waitUntil()` pattern (post-response work)

```typescript
ctx.waitUntil((async () => {
  // Runs after response is sent — use for logging, analytics, cache warming
  await env.KV.put(`log:${Date.now()}`, JSON.stringify({ path: url.pathname }), { expirationTtl: 86400 });
})());
```

## Common Gotchas

- **No filesystem**: Workers have no disk access. Use R2 for files, KV for config, D1 for structured data.
- **CPU ≠ wall clock**: A `setTimeout` doesn't extend your CPU budget. Async I/O (fetch, D1, KV) is cheap; compute is not.
- **`nodejs_compat` required**: Without it, Node.js built-ins like `crypto`, `Buffer`, `stream` don't work.
- **No persistent memory across requests**: Each request is a fresh isolate. Use Durable Objects for stateful in-memory data.
- **`waitUntil()` vs background**: `waitUntil()` keeps the Worker alive after the response; don't use it for long-running tasks — use Queues.
- **Cold starts are ~0ms**: Workers use isolates not containers. But first-request deploys still have a brief startup.
- **D1 in local dev**: `wrangler dev` uses a local SQLite file unless you pass `--remote`.

## Free vs Paid

| Limit | Free | Workers Paid ($5/mo) |
|-------|------|---------------------|
| Requests | 100k/day | 10M/month (+$0.30/M) |
| CPU time | 10ms/request | 30s/request (Unbound) |
| Durable Objects | ✗ | ✓ |
| Log tailing | ✓ | ✓ |

## See Also

- [D1 SQL database](../d1/SKILL.md)
- [KV store](../kv/SKILL.md)
- [Queues (async)](../queues/SKILL.md)
- [Durable Objects (stateful)](../durable-objects/SKILL.md)
- [Workers AI](../ai/workers-ai/SKILL.md)
