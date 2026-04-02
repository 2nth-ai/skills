---
name: tech/ollama/models
description: |
  Ollama model selection and management skill. Use when:
  (1) choosing the right open-weight model for a task — size vs quality vs speed trade-offs,
  (2) pulling models from the Ollama library or Hugging Face GGUF,
  (3) understanding quantisation levels — Q4_K_M vs Q8_0 vs fp16,
  (4) managing VRAM budgets — which models fit on which GPUs,
  (5) using embedding models locally — nomic-embed-text, mxbai-embed-large.
license: MIT
compatibility: Ollama v0.5+
improves:
  - tech/ollama
metadata:
  author: 2nth.ai
  version: "1.0.0"
  maturity: stub
  categories: "Ollama, models, GGUF, quantisation, Llama, Mistral, Gemma, Phi, Qwen, DeepSeek, embeddings, VRAM"
---

# Ollama — Model Selection & Management

> **Stub** — core patterns below.

## Pull & Manage

```bash
# Pull a model (downloads to ~/.ollama/models)
ollama pull llama3.2

# Pull specific quantisation
ollama pull llama3.1:8b-instruct-q4_K_M

# Pull from Hugging Face (GGUF)
ollama pull hf.co/bartowski/Llama-3.2-3B-Instruct-GGUF:Q4_K_M

# List local models
ollama list

# Show model info (params, quantisation, context length)
ollama show llama3.2

# Remove a model
ollama rm llama3.2

# Copy/alias a model
ollama cp llama3.2 my-custom-llama
```

## Quantisation Guide

| Format | Size vs fp16 | Quality loss | Best for |
|--------|-------------|-------------|---------|
| `q2_K` | ~25% | High | Tiny RAM, experiments |
| `q4_K_M` | ~45% | Low | **Default choice — best balance** |
| `q5_K_M` | ~55% | Very low | When VRAM allows |
| `q8_0` | ~75% | Minimal | Near-lossless, big GPU |
| `fp16` | 100% | None | Maximum quality, research |

**Rule of thumb**: Use `q4_K_M` unless you have a specific quality requirement. It fits a 7B model in ~4GB VRAM and a 13B in ~8GB.

## VRAM Requirements

| Model size | q4_K_M VRAM | q8_0 VRAM | Notes |
|------------|------------|----------|-------|
| 1B–3B | ~1–2 GB | ~2–3 GB | Runs on integrated GPU or CPU |
| 7B–8B | ~4–5 GB | ~8 GB | RTX 3060 / M2 |
| 13B | ~8 GB | ~14 GB | RTX 3080 / M2 Pro |
| 30B–34B | ~20 GB | ~34 GB | RTX 3090 / M3 Max |
| 70B | ~40 GB | ~70 GB | A100 40GB / 2× RTX 3090 |

## Recommended Models by Task

```bash
# General chat / instruction following
ollama pull llama3.2          # 3B — fast, good quality
ollama pull llama3.1:8b       # 8B — better reasoning

# Coding
ollama pull qwen2.5-coder:7b  # Best small coding model
ollama pull deepseek-coder-v2 # Strong for code review

# Reasoning / chain-of-thought
ollama pull deepseek-r1:7b    # Thinking model, shows reasoning
ollama pull deepseek-r1:32b   # Stronger reasoning, needs big GPU

# Ultra-fast / on-device
ollama pull phi4-mini         # 3.8B, excellent for its size
ollama pull llama3.2:1b       # 1B, CPU-only capable

# Multimodal (vision)
ollama pull llava:7b          # Image + text
ollama pull minicpm-v         # Efficient vision model
ollama pull llama3.2-vision   # Meta's vision variant

# Embeddings
ollama pull nomic-embed-text  # 768-dim, fast, good quality
ollama pull mxbai-embed-large # 1024-dim, higher quality
ollama pull bge-m3            # Multilingual, 1024-dim
```

## Embedding Workflow

```typescript
// Generate embeddings for RAG
async function embed(text: string): Promise<number[]> {
  const res = await fetch('http://localhost:11434/api/embed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'nomic-embed-text',
      input: text,
    }),
  });
  const data = await res.json() as { embeddings: number[][] };
  return data.embeddings[0];
}

// Batch embedding
const res = await fetch('http://localhost:11434/api/embed', {
  method: 'POST',
  body: JSON.stringify({
    model: 'nomic-embed-text',
    input: ['Document one text', 'Document two text', 'Query text'],
  }),
});
```

## CPU-Only Operation

```bash
# Force CPU (no GPU offload)
OLLAMA_NUM_GPU=0 ollama serve

# Or set in Modelfile
PARAMETER num_gpu 0

# Recommended CPU models
ollama pull phi4-mini          # 3.8B — fast on modern CPU
ollama pull llama3.2:1b        # 1B — usable on any machine
ollama pull gemma3:1b          # 1B Google model
```
