---
name: tech/cloudflare/durable-objects
description: |
  Cloudflare Durable Objects — stateful edge compute. Use this skill when:
  (1) building real-time collaborative features requiring WebSocket connections,
  (2) implementing atomic counters, locks, or compare-and-swap operations,
  (3) managing per-user or per-session state that persists across requests,
  (4) coordinating multi-agent pipelines without polling (event-driven),
  (5) building chat rooms, live dashboards, or streaming AI sessions,
  (6) replacing sequential Worker calls with event-driven state machines.
  Requires Workers Paid plan ($5/mo).
license: MIT
compatibility: Cloudflare Workers (Paid plan required)
homepage: https://skills.2nth.ai/tech/cloudflare/durable-objects
repository: https://github.com/2nth-ai/skills
requires:
  - tech/cloudflare/workers
improves:
  - tech/cloudflare
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Cloudflare, Durable Objects, WebSockets, Stateful, Real-time"
allowed-tools: Bash(npx:*) Bash(wrangler:*) Read Write Edit Glob Grep
---

# Cloudflare Durable Objects

Durable Objects (DOs) are single-instance, globally-unique JavaScript objects with persistent storage and a co-located execution environment. Unlike Workers (which are stateless isolates), each DO instance:

- Has a **unique ID** — all requests to the same ID go to the same instance
- Has **private storage** — a transactional key-value store via `this.ctx.storage`
- Can hold **WebSocket connections** open
- Runs in a **single location** (no global distribution — single-threaded execution prevents races)

**Requires Workers Paid plan.**

## wrangler.toml

```toml
[[durable_objects.bindings]]
name = "CHAT_ROOM"
class_name = "ChatRoom"

# Must also declare the migration
[[migrations]]
tag = "v1"
new_classes = ["ChatRoom"]
```

## Durable Object class

```typescript
import { DurableObject } from 'cloudflare:workers';

export class ChatRoom extends DurableObject {
  private sessions: Map<WebSocket, { userId: string }> = new Map();

  async fetch(request: Request): Promise<Response> {
    const upgradeHeader = request.headers.get('Upgrade');
    if (upgradeHeader === 'websocket') {
      return this.handleWebSocket(request);
    }
    return new Response('Expected WebSocket', { status: 426 });
  }

  private async handleWebSocket(request: Request): Promise<Response> {
    const [client, server] = Object.values(new WebSocketPair());

    server.addEventListener('message', async (event) => {
      const data = JSON.parse(event.data as string);
      await this.broadcast(data);
    });

    server.addEventListener('close', () => {
      this.sessions.delete(server);
    });

    this.ctx.acceptWebSocket(server);
    this.sessions.set(server, { userId: new URL(request.url).searchParams.get('userId') ?? 'anon' });

    return new Response(null, { status: 101, webSocket: client });
  }

  private async broadcast(message: unknown): Promise<void> {
    const payload = JSON.stringify(message);
    for (const ws of this.sessions.keys()) {
      try { ws.send(payload); } catch { this.sessions.delete(ws); }
    }
  }
}
```

## Getting a DO stub from a Worker

```typescript
// By name — same name always routes to same instance
const id = env.CHAT_ROOM.idFromName('room:project-123');
const stub = env.CHAT_ROOM.get(id);
const response = await stub.fetch(request);

// By generated ID — unique per creation
const id = env.CHAT_ROOM.newUniqueId();
const stub = env.CHAT_ROOM.get(id);
```

## Persistent storage (transactional KV)

```typescript
export class Counter extends DurableObject {
  async increment(amount = 1): Promise<number> {
    const current = (await this.ctx.storage.get<number>('count')) ?? 0;
    const next = current + amount;
    await this.ctx.storage.put('count', next);
    return next;
  }

  // Atomic transaction
  async transfer(from: string, to: string, amount: number): Promise<void> {
    await this.ctx.storage.transaction(async (txn) => {
      const fromBalance = (await txn.get<number>(from)) ?? 0;
      if (fromBalance < amount) throw new Error('Insufficient funds');
      await txn.put(from, fromBalance - amount);
      await txn.put(to, ((await txn.get<number>(to)) ?? 0) + amount);
    });
  }
}
```

## Streaming AI output via DO + WebSocket

```typescript
// DO streams Workers AI output to all connected WebSocket clients
async streamAI(prompt: string): Promise<void> {
  const stream = await this.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [{ role: 'user', content: prompt }],
    stream: true,
  });

  const reader = stream.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    this.broadcast({ type: 'chunk', text: new TextDecoder().decode(value) });
  }
  this.broadcast({ type: 'done' });
}
```

## Alarms (scheduled tasks within a DO)

```typescript
export class AgentSession extends DurableObject {
  async setAlarm(delayMs: number): Promise<void> {
    await this.ctx.storage.setAlarm(Date.now() + delayMs);
  }

  // Called automatically when alarm fires
  async alarm(): Promise<void> {
    await this.cleanupExpiredSessions();
  }
}
```

## Common Gotchas

- **Paid plan required**: DOs are not available on the free tier.
- **Single location**: A DO instance runs in one Cloudflare region. Requests are routed there — no global distribution. Don't use DOs for purely read-heavy workloads.
- **Migration required**: Adding a new DO class requires a `[[migrations]]` entry in wrangler.toml. Missing this causes a deploy error.
- **`ctx.acceptWebSocket()` vs `new WebSocketPair()`**: Use `ctx.acceptWebSocket()` for hibernating WebSockets (cheaper) — the DO can sleep and wake on message receipt.
- **Storage is eventually consistent outside transactions**: Use `storage.transaction()` for atomic multi-key operations.
- **No shared state between DO classes**: Each DO class is independent. Use service bindings or KV to pass data between them.

## When to use DOs vs alternatives

| Need | Use |
|------|-----|
| Real-time collaboration (WebSockets) | Durable Objects |
| Atomic counter / rate limiter | Durable Objects |
| Async background jobs | Queues |
| Shared config/flags | KV |
| Per-user session data | KV (with TTL) |
| Structured data + SQL queries | D1 |

## See Also

- [Workers runtime](../workers/SKILL.md)
- [Queues (async tasks)](../queues/SKILL.md)
- [Workers AI streaming](../ai/workers-ai/SKILL.md)
