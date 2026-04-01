---
name: tech/cloudflare/queues
description: |
  Cloudflare Queues — async message processing. Use this skill when:
  (1) decoupling AI inference from HTTP request handlers to avoid timeout,
  (2) processing webhooks reliably with automatic retry on failure,
  (3) running background jobs (email sending, PDF generation, report building),
  (4) implementing fan-out patterns (one event → multiple consumers),
  (5) replacing sequential synchronous AI agent calls with async pipelines,
  (6) ensuring at-least-once delivery for critical operations (payments, credits).
  Requires Workers Paid plan.
license: MIT
compatibility: Cloudflare Workers (Paid plan required)
homepage: https://skills.2nth.ai/tech/cloudflare/queues
repository: https://github.com/2nth-ai/skills
requires:
  - tech/cloudflare/workers
improves:
  - tech/cloudflare
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Cloudflare, Queues, Async, Background Jobs, Messaging"
allowed-tools: Bash(npx:*) Bash(wrangler:*) Read Write Edit Glob Grep
---

# Cloudflare Queues

Queues decouple producers (Workers that send messages) from consumers (Workers that process them). Messages are delivered at-least-once with automatic retries.

**Pricing**: $0.40 per million messages. Included in Workers Paid plan.

The code review anti-pattern: running sequential AI agent calls inside an HTTP handler risks Cloudflare's 30s CPU limit and gives users a slow experience. **Queues fix this** — return a 202 immediately, process asynchronously.

## wrangler.toml

```toml
# Producer binding (Worker that sends messages)
[[queues.producers]]
binding = "QUEUE"
queue = "ai-jobs"

# Consumer binding (Worker that processes messages)
[[queues.consumers]]
queue = "ai-jobs"
max_batch_size = 10          # messages per batch
max_batch_timeout = 5        # seconds to wait to fill a batch
max_retries = 3              # retry failed messages N times
dead_letter_queue = "ai-jobs-dlq"  # failed messages go here
```

```bash
wrangler queues create ai-jobs
wrangler queues create ai-jobs-dlq   # dead letter queue
```

## Producer: sending messages

```typescript
// Send a single message
await env.QUEUE.send({ type: 'analyse_brief', projectId, userId });

// Send multiple messages (batch — cheaper, one operation)
await env.QUEUE.sendBatch([
  { body: { type: 'send_email', to: 'user@example.com', template: 'welcome' } },
  { body: { type: 'update_credits', userId, amount: 100 } },
  { body: { type: 'log_event', event: 'project_created', projectId } },
]);
```

## Consumer: processing messages

```typescript
export default {
  // HTTP handler — returns 202 immediately
  async fetch(request: Request, env: Env): Promise<Response> {
    const { projectId, userId } = await request.json();
    await env.QUEUE.send({ type: 'analyse_brief', projectId, userId });
    return Response.json({ status: 'queued' }, { status: 202 });
  },

  // Queue consumer — runs asynchronously
  async queue(batch: MessageBatch<JobMessage>, env: Env): Promise<void> {
    for (const msg of batch.messages) {
      try {
        await processJob(msg.body, env);
        msg.ack();  // remove from queue on success
      } catch (err) {
        msg.retry({ delaySeconds: 30 });  // retry after 30s delay
      }
    }
  },
};
```

## Typed messages

```typescript
type JobMessage =
  | { type: 'analyse_brief'; projectId: string; userId: string }
  | { type: 'send_email'; to: string; template: string; data?: Record<string, string> }
  | { type: 'update_credits'; userId: string; amount: number };

async function processJob(msg: JobMessage, env: Env): Promise<void> {
  switch (msg.type) {
    case 'analyse_brief':
      return analyseBrief(msg.projectId, msg.userId, env);
    case 'send_email':
      return sendEmail(msg, env);
    case 'update_credits':
      return updateCredits(msg.userId, msg.amount, env);
  }
}
```

## Retry and dead letter queue pattern

```typescript
async queue(batch: MessageBatch<JobMessage>, env: Env): Promise<void> {
  for (const msg of batch.messages) {
    try {
      await processJob(msg.body, env);
      msg.ack();
    } catch (err) {
      // msg.retry() — message goes back to queue (up to max_retries)
      // After max_retries, goes to dead_letter_queue
      if (msg.attempts >= 3) {
        // Last attempt — log to D1 before it goes to DLQ
        await env.DB.prepare('INSERT INTO failed_jobs (id, payload, error) VALUES (?, ?, ?)')
          .bind(crypto.randomUUID(), JSON.stringify(msg.body), String(err))
          .run();
        msg.ack(); // ack so it doesn't retry (we logged it)
      } else {
        msg.retry({ delaySeconds: Math.pow(2, msg.attempts) * 10 }); // exponential backoff
      }
    }
  }
}
```

## Webhook ingestion pattern (reliable)

```typescript
// POST /webhook — receive and immediately queue
async fetch(request: Request, env: Env): Promise<Response> {
  // 1. Verify signature FIRST — never process unsigned webhooks
  const signature = request.headers.get('X-Webhook-Signature') ?? '';
  const body = await request.text();
  const valid = await verifyHmac(body, signature, env.WEBHOOK_SECRET);
  if (!valid) return new Response('Unauthorized', { status: 401 });

  // 2. Queue for processing — respond fast
  await env.QUEUE.send({ payload: JSON.parse(body), source: 'webhook' });
  return new Response(null, { status: 202 });
}
```

## Common Gotchas

- **Paid plan required**: Queues need Workers Paid.
- **At-least-once delivery**: Messages may arrive more than once. Make consumers idempotent — use a `messageId` to deduplicate.
- **`msg.ack()` is required**: If you don't ack, the message will be retried after the batch timeout.
- **Max message size: 128KB**: For larger payloads, store in R2 and queue just the key.
- **Dead letter queue is just another queue**: You need a separate consumer Worker to process (or alert on) DLQ messages.
- **Batching is cheaper**: `sendBatch()` is one operation vs N operations. Use it for fan-out.
- **Don't await heavy work in the consumer without retries**: If you `await` a slow AI call and it times out, the message retries. Wrap in try/catch + `msg.retry()`.

## See Also

- [Workers runtime](../workers/SKILL.md)
- [Durable Objects (stateful coordination)](../durable-objects/SKILL.md)
- [Workers AI (async inference)](../ai/workers-ai/SKILL.md)
