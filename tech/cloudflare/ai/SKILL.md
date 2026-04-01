---
name: tech/cloudflare/ai
description: |
  Cloudflare AI stack. Use skills in this subdomain when building:
  (1) edge inference — Workers AI for fast, cheap classification and routing,
  (2) AI Gateway — unified proxy for Claude + OpenAI + Workers AI with logging and caching,
  (3) Vectorize — vector database for RAG, semantic search, and skill discovery,
  (4) full AI pipelines combining all three: classify at edge, retrieve context, answer with Claude.
license: MIT
homepage: https://skills.2nth.ai/tech/cloudflare/ai
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
