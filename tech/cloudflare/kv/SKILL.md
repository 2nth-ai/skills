---
name: tech/cloudflare/kv
description: |
  Cloudflare Workers KV — distributed key-value store. Use this skill when:
  (1) storing session tokens, auth state, or user preferences at the edge,
  (2) caching computed results with TTL expiry (feature flags, config, rate data),
  (3) storing small blobs (<25MB) that need global low-latency reads,
  (4) implementing feature flags or A/B test configuration,
  (5) choosing between KV, D1, and R2 for the right data shape.
  Do NOT use KV for: rate limiting (use Cloudflare Rate Limiting rules),
  structured queries, or data >25MB per value.
license: MIT
compatibility: Cloudflare Workers, Wrangler CLI
homepage: https://skills.2nth.ai/tech/cloudflare/kv
repository: https://github.com/2nth-ai/skills
requires:
  - tech/cloudflare/workers
improves:
  - tech/cloudflare
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Cloudflare, KV, Cache, Edge, Sessions"
allowed-tools: Bash(npx:*) Bash(wrangler:*) Read Write Edit Glob Grep
---

# Cloudflare Workers KV

KV is a globally distributed, eventually consistent key-value store. Reads are served from the nearest edge (~0ms after cache propagation). Writes propagate globally within ~60 seconds.

**Free tier**: 100k reads/day, 1k writes/day, 1k deletes/day, 1GB storage.
**Paid**: $0.50/M reads, $5/M writes beyond free.

## wrangler.toml binding

```toml
[[kv_namespaces]]
binding = "KV"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# For different namespaces per purpose
[[kv_namespaces]]
binding = "SESSIONS"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

[[kv_namespaces]]
binding = "CACHE"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

Create a namespace:
```bash
wrangler kv namespace create SESSIONS
# → prints the id to put in wrangler.toml
wrangler kv namespace list
```

## Core operations

```typescript
// Write (with optional TTL in seconds)
await env.SESSIONS.put(sessionId, JSON.stringify(sessionData), {
  expirationTtl: 86400,   // 24h — auto-deletes after TTL
});

// Read
const raw = await env.SESSIONS.get(sessionId);
if (!raw) return null;
const session = JSON.parse(raw);

// Read with metadata
const { value, metadata } = await env.SESSIONS.getWithMetadata<{ userId: string }>(key);

// Delete
await env.SESSIONS.delete(sessionId);

// List keys (paginated, max 1000 per call)
const { keys, list_complete, cursor } = await env.KV.list({ prefix: 'session:', limit: 100 });
```

## Storing typed values

```typescript
// JSON values (most common)
await env.KV.put(key, JSON.stringify(value), { expirationTtl: 3600 });
const value = JSON.parse(await env.KV.get(key) ?? 'null');

// ArrayBuffer (binary)
await env.KV.put(key, buffer, { expirationTtl: 3600 });
const buffer = await env.KV.get(key, 'arrayBuffer');

// Stream
const stream = await env.KV.get(key, 'stream');
```

## Feature flags pattern

```typescript
// Store flags as JSON in KV (update without deploying code)
// Key: "flags:v1", Value: {"new_dashboard": true, "beta_users": ["user1","user2"]}

async function isEnabled(env: Env, flag: string, userId?: string): Promise<boolean> {
  const raw = await env.CACHE.get('flags:v1');
  if (!raw) return false;
  const flags = JSON.parse(raw);
  const val = flags[flag];
  if (typeof val === 'boolean') return val;
  if (Array.isArray(val) && userId) return val.includes(userId);
  return false;
}
```

## Session pattern (preferred over D1 for short-lived sessions)

```typescript
const SESSION_TTL = 60 * 60 * 24 * 7; // 7 days

async function createSession(env: Env, userId: string): Promise<string> {
  const id = crypto.randomUUID();
  await env.SESSIONS.put(id, JSON.stringify({ userId, createdAt: Date.now() }), {
    expirationTtl: SESSION_TTL,
  });
  return id;
}

async function getSession(env: Env, id: string) {
  const raw = await env.SESSIONS.get(id);
  return raw ? JSON.parse(raw) : null;
}
```

## Common Gotchas

- **Eventually consistent**: Writes propagate in ~60 seconds globally. Do not use KV for data that needs immediate global consistency — use Durable Objects or D1.
- **Do NOT use for rate limiting**: Every rate limit check costs a KV read + write. Use Cloudflare Rate Limiting rules instead (edge-level, zero cost).
- **Max value size: 25MB**: For larger values, use R2.
- **Max key size: 512 bytes**: Keep keys short.
- **List is slow**: Listing keys makes multiple requests under the hood. Avoid listing in hot paths.
- **No transactions**: KV has no compare-and-swap. For atomic counters or locks, use Durable Objects.
- **expirationTtl vs expiration**: `expirationTtl` is seconds from now; `expiration` is a Unix timestamp. Don't mix them.

## KV vs D1 vs Durable Objects

| Scenario | Best Choice |
|----------|-------------|
| Sessions with TTL | KV |
| Feature flags, config | KV |
| User data needing SQL queries | D1 |
| Rate limiting | Cloudflare Rate Limiting (not KV) |
| Atomic counters | Durable Objects |
| Real-time state (WebSockets) | Durable Objects |

## See Also

- [D1 SQL database](../d1/SKILL.md)
- [R2 object storage](../r2/SKILL.md)
- [Durable Objects (stateful, atomic)](../durable-objects/SKILL.md)
- [Workers runtime](../workers/SKILL.md)
