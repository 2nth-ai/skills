---
name: tech/cloudflare/ai
description: |
  Cloudflare AI stack. Use skills in this subdomain when building:
  (1) edge inference — Workers AI for fast, cheap classification and routing,
  (2) AI Gateway — unified proxy for Claude + OpenAI + Workers AI with logging and caching,
  (3) Vectorize — vector database for RAG, semantic search, and skill discovery,
  (4) full AI pipelines combining all three: classify at edge, retrieve context, answer with Claude.
license: MIT
repository: https://github.com/2nth-ai/skills
improves:
  - tech/cloudflare
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Cloudflare, AI, LLM, RAG, Inference"
---

# Cloudflare AI Stack

Three services that compose into the 2nth.ai AI pipeline:

| Service | Role | When to use |
|---------|------|-------------|
| `tech/cloudflare/ai/workers-ai` | Edge inference | Classification, routing, embeddings — cheap + zero latency |
| `tech/cloudflare/ai/ai-gateway` | Proxy + observability | All Claude calls — token metering, caching, fallback |
| `tech/cloudflare/ai/vectorize` | Vector database | RAG, semantic search, skill discovery |

## The 2nth AI pattern

```
Request
  → Workers AI (Llama 3.1 8B) — classify intent at edge (5–20 tokens, ~1ms)
  → If complex: AI Gateway → Claude — domain expert response
  → Vectorize — retrieve relevant skills/context for RAG
  → Response streams back to client
  → AI Gateway logs token usage (→ Penny's token economy)
```

This pattern minimises Claude API costs by filtering and enriching at the edge before the expensive call.

## Gotchas

The three services in this stack have distinct failure modes — surface the ones that bite across all of them, then drill into per-service leaves for specifics.

- **Workers AI cold model swaps** — switching between models on Workers AI adds a per-model first-invocation latency penalty (often 200–800ms). Keep a single model warm per Worker rather than dispatching across many models per request.
- **AI Gateway caching is exact-match only** — cache hits require identical request bodies including all metadata. If a prompt template ever varies by even a whitespace character, the cache misses. Normalize the prompt aggressively before sending.
- **Vectorize index dimensions are immutable** — once created at 768 (BGE) or 1536 (OpenAI ada-002), the embedding dimension cannot be changed. Re-create the index from scratch to switch embedding models. Plan for this when standardising on an embedding model.
- **AI Gateway fallback ordering matters** — if you list providers as `[anthropic, openai]`, Anthropic outages route to OpenAI on every call (no health-check, just on-failure). For predictable behaviour, route primary-only and handle the fallback in application code if outages should be visible.
- **Workers AI free tier model availability shifts** — models in the free tier rotate (some get demoted to paid). Always pin a specific model + provider combination in production; do not rely on the default model list resolving the same way over time.
- **Vectorize query metadata filter is post-filter** — the topK filter runs BEFORE metadata filtering. If you set topK=5 and filter for `category=billing`, you may get fewer than 5 results (or zero) even when 100+ matching vectors exist. Set topK high (50+) and filter generously, then trim in application code.
