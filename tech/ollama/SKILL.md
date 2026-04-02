---
name: tech/ollama
description: |
  Ollama local LLM runtime skill. Use when:
  (1) running open-weight models locally — Llama 3, Mistral, Gemma, Phi, Qwen, DeepSeek with zero cloud cost,
  (2) building private AI applications — on-premise inference, air-gapped environments, no data leaving the machine,
  (3) serving models via OpenAI-compatible API — drop-in replacement for apps targeting OpenAI SDK,
  (4) customising model behaviour — Modelfile system prompt, parameter tuning, adapter merging,
  (5) deploying at the edge or on-prem — Docker, Linux service, Kubernetes, GPU/CPU inference,
  (6) integrating with agent frameworks — LangChain, LlamaIndex, Open WebUI, Continue.dev.
license: MIT
compatibility: Ollama v0.5+, REST API, OpenAI-compatible API, Docker
homepage: https://skills.2nth.ai/tech/ollama
repository: https://github.com/2nth-ai/skills
improves:
  - tech
metadata:
  author: 2nth.ai
  version: "1.0.0"
  maturity: stub
  categories: "Ollama, local LLM, open-weight, Llama, Mistral, Gemma, Phi, Qwen, DeepSeek, on-premise, private AI, OpenAI-compatible, Modelfile, inference"
---

# Ollama

Ollama is a local LLM runtime that lets you pull, run, and serve open-weight models with a single command. It exposes a REST API (and an OpenAI-compatible endpoint) so existing tooling — LangChain, OpenAI SDKs, Continue.dev — works without modification. In the 2nth.ai stack it provides private inference for sensitive workloads or cost-sensitive high-volume tasks.

> **Stub** — full skill pending. Core patterns documented below.

## Subdomains

| Path | Focus | Status |
|------|-------|--------|
| [`tech/ollama/models`](models/SKILL.md) | Model selection, pull, GGUF, quantisation | stub |
| [`tech/ollama/api`](api/SKILL.md) | REST API, OpenAI-compatible endpoint, streaming | stub |
| [`tech/ollama/modelfile`](modelfile/SKILL.md) | Custom Modelfile — system prompts, parameters, adapters | stub |
| [`tech/ollama/deployment`](deployment/SKILL.md) | Docker, Linux service, Kubernetes, GPU configuration | stub |

## Quick Start

```bash
# macOS / Linux
curl -fsSL https://ollama.com/install.sh | sh

# Pull and run a model
ollama pull llama3.2
ollama run llama3.2

# Pull a smaller/faster model for edge use
ollama pull phi4-mini
ollama run phi4-mini "Summarise this in one sentence: ..."
```

## OpenAI-Compatible API

Ollama serves an OpenAI-compatible endpoint at `http://localhost:11434/v1` — swap the base URL and it works with any OpenAI SDK:

```typescript
import OpenAI from 'openai';

const ollama = new OpenAI({
  baseURL: 'http://localhost:11434/v1',
  apiKey: 'ollama', // required by SDK, value ignored
});

const res = await ollama.chat.completions.create({
  model: 'llama3.2',
  messages: [{ role: 'user', content: 'Explain OSPF in one paragraph.' }],
  stream: true,
});

for await (const chunk of res) {
  process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
}
```

## Model Families

| Family | Best for | Recommended pull |
|--------|----------|-----------------|
| Llama 3.2 | General purpose, tool use | `llama3.2` (3B), `llama3.2:1b` |
| Llama 3.1 | Long context (128K), coding | `llama3.1:8b`, `llama3.1:70b` |
| Mistral / Mixtral | Fast inference, instruction following | `mistral`, `mixtral:8x7b` |
| Gemma 3 | Multimodal, efficient | `gemma3:4b`, `gemma3:12b` |
| Phi-4 Mini | Ultra-small, on-device | `phi4-mini` |
| Qwen 2.5 | Code, maths, Chinese | `qwen2.5-coder:7b` |
| DeepSeek R1 | Reasoning, chain-of-thought | `deepseek-r1:7b`, `deepseek-r1:32b` |
| Nomic Embed | Embeddings | `nomic-embed-text` |

## Native REST API

```bash
# Generate (single-turn)
curl http://localhost:11434/api/generate \
  -d '{"model":"llama3.2","prompt":"What is Cloudflare Workers?","stream":false}'

# Chat (multi-turn)
curl http://localhost:11434/api/chat \
  -d '{
    "model": "llama3.2",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "What is RAG?"}
    ]
  }'

# Embeddings
curl http://localhost:11434/api/embed \
  -d '{"model":"nomic-embed-text","input":"Ollama runs models locally"}'

# List running models
curl http://localhost:11434/api/ps

# List available models
curl http://localhost:11434/api/tags
```

## Key Concepts

- **GGUF** — quantised model format; Ollama pulls GGUF files from the Ollama library or Hugging Face
- **Modelfile** — Docker-like config file for customising a model (system prompt, temperature, stop tokens, adapter)
- **Context window** — set via `num_ctx` in Modelfile or request body; default varies by model
- **GPU offloading** — Ollama auto-detects CUDA/Metal/ROCm; use `num_gpu` to force layer count
- **Keep-alive** — models stay loaded in VRAM for 5 minutes by default; set `keep_alive: -1` to keep forever

## Integration Points in 2nth.ai Stack

| Use case | Pattern |
|----------|---------|
| Private document analysis | Ollama + `nomic-embed-text` → Vectorize or pgvector |
| Cost fallback from Claude | OpenAI-compatible swap — same SDK, different `baseURL` |
| Local agent development | Continue.dev in VS Code pointing to local Ollama |
| On-prem client deployment | Docker container on client GPU server |
| Classification at edge | `phi4-mini` for fast intent routing before Claude |
