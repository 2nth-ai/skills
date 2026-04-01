---
name: tech/cloudflare/ai/workers-ai
description: |
  Cloudflare Workers AI — edge inference. Use this skill when:
  (1) running LLM inference at the edge with zero cold starts (Llama, Mistral, Phi),
  (2) classifying intent or routing requests before calling Claude (cheap + fast),
  (3) generating embeddings for vector search or semantic similarity,
  (4) streaming AI responses directly to clients via SSE,
  (5) enforcing JSON output via schema validation (no regex parsing),
  (6) running image classification, speech-to-text, or translation at the edge.
license: MIT
compatibility: Cloudflare Workers
homepage: https://skills.2nth.ai/tech/cloudflare/ai/workers-ai
repository: https://github.com/2nth-ai/skills
requires:
  - tech/cloudflare/workers
improves:
  - tech/cloudflare/ai
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Cloudflare, Workers AI, LLM, Embeddings, Edge Inference"
allowed-tools: Bash(npx:*) Bash(wrangler:*) Read Write Edit Glob Grep
---

# Cloudflare Workers AI

Edge inference — LLMs, embeddings, image, and speech models running inside Cloudflare's network. No cold starts, billed per neuron.

**Free tier**: 10k neurons/day (limited model access).
**Workers AI (paid)**: Included with Workers Paid plan — higher limits, all models.

## wrangler.toml

```toml
[ai]
binding = "AI"
```

## Core LLM inference

```typescript
const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: prompt },
  ],
  max_tokens: 512,
  temperature: 0.7,
});

console.log(response.response); // string output
```

## Streaming (SSE to client)

```typescript
const stream = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
  messages: [{ role: 'user', content: prompt }],
  stream: true,
});

return new Response(stream, {
  headers: {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
  },
});
```

## JSON schema enforcement (no regex — use this pattern)

```typescript
// Workers AI can enforce structured JSON output natively
// Use instead of: JSON.parse(output.match(/\{[\s\S]*\}/)?.[0])
const result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
  messages: [
    { role: 'system', content: 'Classify the intent and return JSON.' },
    { role: 'user', content: userMessage },
  ],
  response_format: {
    type: 'json_schema',
    json_schema: {
      name: 'IntentClassification',
      schema: {
        type: 'object',
        properties: {
          intent: { type: 'string', enum: ['erp', 'crm', 'support', 'general'] },
          confidence: { type: 'number' },
        },
        required: ['intent', 'confidence'],
      },
    },
  },
});

const { intent, confidence } = JSON.parse(result.response);
```

## Intent routing pattern (2nth standard)

```typescript
// Fast, cheap classification at the edge before routing to Claude
async function classifyIntent(message: string, env: Env): Promise<string> {
  const result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      {
        role: 'system',
        content: 'Classify the user message. Reply with one word only: erp | crm | finance | support | general',
      },
      { role: 'user', content: message },
    ],
    max_tokens: 5,
    temperature: 0,
  });
  return result.response.trim().toLowerCase();
}

// Then route to Claude via AI Gateway for depth
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { message } = await request.json();
    const intent = await classifyIntent(message, env);

    if (intent === 'general') {
      return Response.json({ reply: 'How can I help?' });
    }

    // Route to Claude with domain-specific context
    return callClaude(message, intent, env);
  },
};
```

## Embeddings (for Vectorize / semantic search)

```typescript
const { data } = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
  text: ['2nth skills for Sage X3 ERP integration', 'Cloudflare Workers deployment'],
});
// data[0] is a float[] of 768 dimensions — insert into Vectorize
```

## Available models (key ones)

| Model | ID | Use case |
|-------|----|---------|
| Llama 3.1 8B | `@cf/meta/llama-3.1-8b-instruct` | Routing, classification, summaries |
| Llama 3.3 70B | `@cf/meta/llama-3.3-70b-instruct-fp8-fast` | Higher quality, slower |
| Mistral 7B | `@cf/mistral/mistral-7b-instruct-v0.2` | Efficient general inference |
| Phi-2 | `@cf/microsoft/phi-2` | Code tasks |
| BGE Base | `@cf/baai/bge-base-en-v1.5` | Embeddings (768d) |
| BGE Large | `@cf/baai/bge-large-en-v1.5` | Embeddings (1024d) |
| Whisper | `@cf/openai/whisper` | Speech-to-text |
| LLaVA | `@cf/llava-hf/llava-1.5-7b-hf` | Vision (image + text) |

Full catalog: `wrangler ai models list`

## Common Gotchas

- **Never regex-parse JSON output**: Use `response_format.json_schema` — it's built in. Regex fails on preamble text and markdown fences.
- **`max_tokens` matters for cost**: Neurons are billed per token generated. Set a tight `max_tokens` for classification tasks (5–20).
- **Temperature 0 for deterministic routing**: Set `temperature: 0` for classification tasks where you need consistent output.
- **8B vs 70B**: The 8B model is 10–20× cheaper per request. Use it for routing/classification; use Claude (via AI Gateway) for depth.
- **Embeddings are different models**: Don't run embeddings with a chat model. Use `@cf/baai/bge-*` specifically.
- **Streaming requires SSE headers**: Always set `Content-Type: text/event-stream` and `Cache-Control: no-cache`.
- **Free tier is very limited**: 10k neurons/day runs out fast in dev. Workers Paid includes much higher limits.

## See Also

- [AI Gateway (routing + caching)](../ai-gateway/SKILL.md)
- [Vectorize (vector search)](../vectorize/SKILL.md)
- [Durable Objects (streaming WebSockets)](../../durable-objects/SKILL.md)
- [Queues (async inference)](../../queues/SKILL.md)
