---
name: tech/ollama/api
description: |
  Ollama REST API and OpenAI-compatible endpoint skill. Use when:
  (1) calling Ollama from TypeScript/Python/curl — generate, chat, embed endpoints,
  (2) streaming responses — server-sent events from /api/generate or /api/chat,
  (3) using Ollama as an OpenAI drop-in — same SDK, different baseURL,
  (4) structured output — JSON mode with schema enforcement,
  (5) tool/function calling — Ollama tool use with compatible models,
  (6) managing models via API — pull, delete, copy, show, ps endpoints.
license: MIT
compatibility: Ollama v0.5+, OpenAI SDK v4+
improves:
  - tech/ollama
metadata:
  author: 2nth.ai
  version: "1.0.0"
  maturity: stub
  categories: "Ollama, REST API, OpenAI-compatible, streaming, JSON mode, tool calling, TypeScript, Python"
---

# Ollama — REST API & OpenAI-Compatible Endpoint

> **Stub** — core patterns below.

## Base URLs

| Endpoint | URL |
|----------|-----|
| Ollama native REST | `http://localhost:11434/api/*` |
| OpenAI-compatible | `http://localhost:11434/v1/*` |
| Remote (if OLLAMA_HOST set) | `http://<host>:11434/api/*` |

## Generate (Single-turn)

```typescript
// Streaming (default)
const res = await fetch('http://localhost:11434/api/generate', {
  method: 'POST',
  body: JSON.stringify({
    model: 'llama3.2',
    prompt: 'Why is the sky blue?',
    system: 'Answer in one sentence.',
    options: {
      temperature: 0.7,
      num_ctx: 8192,
    },
  }),
});

const reader = res.body!.getReader();
const decoder = new TextDecoder();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const lines = decoder.decode(value).split('\n').filter(Boolean);
  for (const line of lines) {
    const chunk = JSON.parse(line) as { response: string; done: boolean };
    process.stdout.write(chunk.response);
  }
}

// Non-streaming
const res = await fetch('http://localhost:11434/api/generate', {
  method: 'POST',
  body: JSON.stringify({
    model: 'llama3.2',
    prompt: 'What is Cloudflare Workers?',
    stream: false,
  }),
});
const { response } = await res.json() as { response: string };
```

## Chat (Multi-turn)

```typescript
type Message = { role: 'system' | 'user' | 'assistant'; content: string };

async function chat(messages: Message[]): Promise<string> {
  const res = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      model: 'llama3.2',
      messages,
      stream: false,
      options: { temperature: 0.8, num_ctx: 4096 },
    }),
  });
  const data = await res.json() as { message: Message };
  return data.message.content;
}

const reply = await chat([
  { role: 'system', content: 'You are a concise assistant.' },
  { role: 'user', content: 'What is RAG?' },
]);
```

## Structured Output (JSON Mode)

```typescript
// Enforce a JSON schema in the response
const res = await fetch('http://localhost:11434/api/chat', {
  method: 'POST',
  body: JSON.stringify({
    model: 'llama3.2',
    messages: [{ role: 'user', content: 'Extract: John Smith, age 34, engineer' }],
    stream: false,
    format: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
        role: { type: 'string' },
      },
      required: ['name', 'age', 'role'],
    },
  }),
});
const { message } = await res.json() as any;
const person = JSON.parse(message.content); // { name: 'John Smith', age: 34, role: 'engineer' }
```

## Tool Calling

```typescript
const res = await fetch('http://localhost:11434/api/chat', {
  method: 'POST',
  body: JSON.stringify({
    model: 'llama3.1:8b', // tool-use capable models: llama3.1, mistral-nemo, qwen2.5
    messages: [{ role: 'user', content: 'What is the weather in Cape Town?' }],
    tools: [
      {
        type: 'function',
        function: {
          name: 'get_weather',
          description: 'Get current weather for a city',
          parameters: {
            type: 'object',
            properties: {
              city: { type: 'string', description: 'City name' },
            },
            required: ['city'],
          },
        },
      },
    ],
    stream: false,
  }),
});

const data = await res.json() as any;
if (data.message.tool_calls) {
  for (const call of data.message.tool_calls) {
    const args = call.function.arguments; // { city: 'Cape Town' }
    // Execute your tool function, then send result back in next message
  }
}
```

## OpenAI SDK Drop-in

```typescript
import OpenAI from 'openai';

const ollama = new OpenAI({
  baseURL: 'http://localhost:11434/v1',
  apiKey: 'ollama',
});

// Works exactly like OpenAI — swap model name only
const completion = await ollama.chat.completions.create({
  model: 'llama3.2',
  messages: [{ role: 'user', content: 'Hello!' }],
});

// Streaming
const stream = await ollama.chat.completions.create({
  model: 'llama3.2',
  messages: [{ role: 'user', content: 'Count to 5.' }],
  stream: true,
});
for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
}

// Embeddings
const embedding = await ollama.embeddings.create({
  model: 'nomic-embed-text',
  input: 'Text to embed',
});
const vector = embedding.data[0].embedding; // number[]
```

## Model Management API

```bash
# Pull a model
curl http://localhost:11434/api/pull \
  -d '{"name":"llama3.2","stream":false}'

# Delete a model
curl -X DELETE http://localhost:11434/api/delete \
  -d '{"name":"llama3.2"}'

# Copy a model
curl http://localhost:11434/api/copy \
  -d '{"source":"llama3.2","destination":"my-llama"}'

# Show model info
curl http://localhost:11434/api/show \
  -d '{"name":"llama3.2"}'

# List loaded models (in VRAM)
curl http://localhost:11434/api/ps

# List all local models
curl http://localhost:11434/api/tags
```

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `OLLAMA_HOST` | `127.0.0.1:11434` | Bind address — set `0.0.0.0:11434` to allow remote |
| `OLLAMA_MODELS` | `~/.ollama/models` | Model storage path |
| `OLLAMA_NUM_GPU` | auto | GPU layers — `0` forces CPU |
| `OLLAMA_KEEP_ALIVE` | `5m` | How long to keep models loaded |
| `OLLAMA_MAX_LOADED_MODELS` | `1` | Concurrent models in VRAM |
| `OLLAMA_FLASH_ATTENTION` | `0` | Enable flash attention (`1` for speed) |
| `OLLAMA_CONTEXT_LENGTH` | model default | Override default context window |
