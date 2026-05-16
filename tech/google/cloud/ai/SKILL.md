---
name: tech/google/cloud/ai
description: |
  GCP AI/ML skill. Use when: (1) running Gemini models (gemini-2.5-pro, gemini-2.5-flash, gemini-2.0-flash) via Vertex AI,
  (2) generating embeddings with text-embedding-004 / gemini-embedding-001 for RAG / search,
  (3) fine-tuning or deploying custom models to Vertex AI endpoints,
  (4) choosing between Vertex AI (production, VPC-SC, regional) and AI Studio (prototyping, simpler auth),
  (5) building RAG with Vertex AI Search or integrating Gemini + BigQuery,
  (6) deciding Gemini vs Claude via Vertex Model Garden — Anthropic models are available through Vertex too.
license: MIT
compatibility: Vertex AI v1, Gen AI SDK (Node/Python), Model Garden
homepage: https://skills.2nth.ai/tech/google/cloud/ai
repository: https://github.com/2nth-ai/skills
requires:
  - tech/google/cloud
improves:
  - tech/google/cloud
  - tech/google
  - tech
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "GCP, Vertex AI, Gemini, Claude via Vertex, Embeddings, RAG, AI Studio, Model Garden"
allowed-tools: Bash(gcloud:*) Bash(curl:*) Read Write Edit Glob Grep
---

# Vertex AI & Gemini

Vertex AI is the production entry point for ML on GCP. It covers:

- **Gemini models** (Google's foundation models): `gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-1.5-pro`, `gemini-1.5-flash`.
- **Third-party models via Model Garden** — Claude (Sonnet 4.6, Opus 4.7, Haiku 4.5), Llama, Mistral, and others, billed through your GCP bill.
- **Embeddings** — `text-embedding-004`, `gemini-embedding-001`, `text-multilingual-embedding-002`.
- **Custom model training, tuning, and deployment** — managed endpoints, batch prediction, feature store.
- **Vertex AI Search & Conversation** — managed RAG + agent runtime for enterprise apps.

**AI Studio vs Vertex AI**: AI Studio (`aistudio.google.com`) is the prototyping UI — API key auth, consumer Google account, no VPC/IAM controls. **Vertex AI** is the production path — IAM, service accounts, regional endpoints, VPC Service Controls, quotas. Always use Vertex for anything user-facing.

## When to pick what

| Use case | Recommended |
|---------|------------|
| South African app, low-latency chat | Gemini Flash in `europe-west2` (nearest with full model availability) |
| Complex reasoning, agentic | Gemini 2.5 Pro or Claude Opus 4.7 via Model Garden |
| Cheap high-volume summarisation | Gemini 2.0/2.5 Flash |
| Anthropic-loyal app needing GCP billing | Claude via Vertex Model Garden |
| RAG over private docs | Vertex AI Search OR Gemini + embeddings + your vector DB |
| On-device / edge inference | Not Vertex — use Gemini Nano (Android) or Workers AI |

## Auth

Vertex AI uses **Application Default Credentials (ADC)** — no API keys. On GCE/Cloud Run/GKE, the attached service account is used automatically. Locally, `gcloud auth application-default login`.

```bash
# Grant the service account Vertex AI user role
gcloud projects add-iam-policy-binding my-app-prod \
  --member "serviceAccount:my-service-sa@my-app-prod.iam.gserviceaccount.com" \
  --role "roles/aiplatform.user"
```

## Gemini via Gen AI SDK (Node)

```bash
npm install @google/genai
```

```typescript
import { GoogleGenAI } from '@google/genai';

// Vertex AI mode — uses ADC, no API key
const ai = new GoogleGenAI({
  vertexai: true,
  project: 'my-app-prod',
  location: 'europe-west2',
});

// Simple generate
const res = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: 'Summarise the POPIA requirements for processing SA personal data in 3 bullets.',
});
console.log(res.text);

// With system instruction + generation config
const res2 = await ai.models.generateContent({
  model: 'gemini-2.5-pro',
  contents: [
    { role: 'user', parts: [{ text: 'Draft a 1-line product update for Penny briefings.' }] }
  ],
  config: {
    systemInstruction: 'You are a concise technical writer. Max 25 words.',
    temperature: 0.3,
    maxOutputTokens: 60,
    responseMimeType: 'application/json',
    responseSchema: {
      type: 'object',
      properties: { headline: { type: 'string' }, emoji: { type: 'string' } },
      required: ['headline', 'emoji'],
    },
  },
});

// Streaming
const stream = await ai.models.generateContentStream({
  model: 'gemini-2.5-flash',
  contents: 'Write a 5-step plan for launching in SA.',
});
for await (const chunk of stream) {
  process.stdout.write(chunk.text ?? '');
}
```

## Function calling (tools)

```typescript
const tools = [{
  functionDeclarations: [{
    name: 'lookup_client',
    description: 'Find a 2nth client by ID',
    parameters: {
      type: 'object',
      properties: { clientId: { type: 'string' } },
      required: ['clientId'],
    },
  }],
}];

const res = await ai.models.generateContent({
  model: 'gemini-2.5-pro',
  contents: 'Show me client 2n-014 summary',
  config: { tools },
});

// Inspect and handle function calls
const call = res.candidates?.[0]?.content?.parts?.[0]?.functionCall;
if (call?.name === 'lookup_client') {
  const data = await db.clients.get(call.args.clientId as string);
  // Send function response back for final answer
  const final = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: [
      { role: 'user', parts: [{ text: 'Show me client 2n-014 summary' }] },
      { role: 'model', parts: [{ functionCall: call }] },
      { role: 'function', parts: [{ functionResponse: { name: 'lookup_client', response: data } }] },
    ],
    config: { tools },
  });
  console.log(final.text);
}
```

## Embeddings (RAG)

```typescript
// Generate embedding — 768 dims for text-embedding-004
const emb = await ai.models.embedContent({
  model: 'text-embedding-004',
  contents: 'POPIA requires consent and purpose limitation for personal data.',
  config: { taskType: 'RETRIEVAL_DOCUMENT', outputDimensionality: 768 },
});
const vec = emb.embeddings[0].values;   // number[]

// Store in Vectorize / pgvector / Firestore vector search
await env.VECTORIZE.insert([{ id: 'doc-1', values: vec, metadata: { source: 'popia.md' } }]);

// Query with RETRIEVAL_QUERY task type for asymmetric retrieval
const q = await ai.models.embedContent({
  model: 'text-embedding-004',
  contents: 'Do I need consent to collect email addresses?',
  config: { taskType: 'RETRIEVAL_QUERY' },
});
const results = await env.VECTORIZE.query(q.embeddings[0].values, { topK: 5 });
```

Key embedding task types: `RETRIEVAL_DOCUMENT` (when storing), `RETRIEVAL_QUERY` (when searching), `SEMANTIC_SIMILARITY` (symmetric), `CLASSIFICATION`, `CLUSTERING`. Must match between index and query.

## Claude via Vertex AI Model Garden

Anthropic's Claude is available through Vertex — billed on the GCP invoice, same IAM, same region boundary. Useful if your org requires single-vendor billing or VPC Service Controls around Anthropic inference.

```bash
# Enable in Model Garden (one-time, per model, per region)
# Console: Vertex AI → Model Garden → search "Claude 4.5 Sonnet" → Enable
```

```typescript
import Anthropic from '@anthropic-ai/vertex-sdk';

const client = new AnthropicVertex({
  projectId: 'my-app-prod',
  region: 'europe-west4',   // Claude regions: us-east5, europe-west4, asia-southeast1
});

const msg = await client.messages.create({
  model: 'claude-sonnet-4-6@20250106',   // Vertex uses pinned model revisions
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Write a 3-sentence POPIA compliance check.' }],
});
console.log(msg.content[0].type === 'text' ? msg.content[0].text : '');
```

**Regional caveat for Claude on Vertex**: Claude models are only in a subset of regions — commonly `us-east5`, `europe-west4`, `asia-southeast1`. Not all sizes in all regions. Check Model Garden before designing.

## Vertex AI endpoints (custom or tuned models)

```bash
# Deploy a tuned model or custom container to a managed endpoint
gcloud ai endpoints create --display-name my-endpoint --region europe-west2

ENDPOINT_ID=$(gcloud ai endpoints list --region europe-west2 \
  --filter "displayName=my-endpoint" --format "value(name.scope(endpoints))")

gcloud ai endpoints deploy-model $ENDPOINT_ID \
  --region europe-west2 \
  --model projects/my-app-prod/locations/europe-west2/models/MODEL_ID \
  --display-name my-deployment \
  --machine-type n1-standard-4 \
  --min-replica-count 1 --max-replica-count 5
```

Endpoints with `min-replica-count >= 1` are billed 24/7 for the underlying machines. Consider **batch prediction** (cheaper, async) for non-interactive workloads.

## Grounding with Google Search / your data

```typescript
// Gemini can ground responses in Google Search (reduces hallucination, adds citations)
const res = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: 'What are the SARS e-filing deadlines for 2026?',
  config: {
    tools: [{ googleSearch: {} }],
  },
});
// Inspect res.candidates[0].groundingMetadata for citations
```

```typescript
// Ground in your own Vertex AI Search datastore (RAG without writing vector code)
const res = await ai.models.generateContent({
  model: 'gemini-2.5-pro',
  contents: 'What does our onboarding contract say about notice period?',
  config: {
    tools: [{
      retrieval: {
        vertexAiSearch: {
          datastore: 'projects/my-app-prod/locations/global/collections/default_collection/dataStores/my-contracts',
        },
      },
    }],
  },
});
```

## Safety & filters

```typescript
config: {
  safetySettings: [
    { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  ],
}
```

When a response is blocked, `res.candidates[0].finishReason === 'SAFETY'` and `text` is empty. Check `finishReason` on every call.

## Cost model (approximate, per 1M tokens)

| Model | Input | Output |
|-------|-------|--------|
| Gemini 2.5 Pro | ~$1.25 | ~$5.00 |
| Gemini 2.5 Flash | ~$0.075 | ~$0.30 |
| Gemini 2.0 Flash | ~$0.075 | ~$0.30 |
| Gemini 1.5 Pro | ~$1.25 | ~$5.00 (≤128k) |
| Gemini 1.5 Flash | ~$0.075 | ~$0.30 (≤128k) |
| Claude Sonnet 4.6 via Vertex | ~$3.00 | ~$15.00 |
| Claude Opus 4.7 via Vertex | ~$15.00 | ~$75.00 |
| Claude Haiku 4.5 via Vertex | ~$0.80 | ~$4.00 |
| text-embedding-004 | ~$0.025 / 1M input chars | — |

**Context caching** (Gemini): cache input prompts > 32k tokens for a flat fee, then per-token reads at 25% of input cost. Big savings on repeated long-context prompts (same system prompt + knowledge base across many calls).

## Gotchas

- **AI Studio ≠ Vertex**: Code samples from `ai.google.dev` often use API-key auth against the Gemini API (not Vertex). That flow has no IAM, no VPC-SC, no regional control. Always verify which endpoint your SDK hits — look for `vertexai: true`.
- **Region mismatch silently fails**: If the model isn't available in the region you specified, you get a cryptic 404. `gemini-2.5-pro` is widely available; third-party Model Garden models (Claude, Llama) are limited to specific regions.
- **Quota per region, per model, per minute**: `RESOURCE_EXHAUSTED` means you hit a per-minute quota. Request quota increases in Cloud Console → IAM & Admin → Quotas. Default quotas for new projects are low.
- **`responseMimeType: application/json`**: Great for structured output but requires a `responseSchema` for reliability. Without the schema, Gemini often emits markdown-fenced JSON that fails to parse.
- **Function calling can loop**: Gemini may call the same function repeatedly if your responses lack distinguishing info. Track a per-conversation call count and break after N calls.
- **Safety blocks on benign content**: `HARM_CATEGORY_DANGEROUS_CONTENT` can trigger on security tutorials, medical advice, or legal questions. If your app is a regulated domain, loosen thresholds or expect blocks.
- **Embedding dimensionality for vector DB**: `text-embedding-004` supports dimension reduction (768 or 256). Must match your vector DB config. Changing mid-flight invalidates existing embeddings.
- **Claude via Vertex uses @date suffix**: Model IDs include a version date (`claude-sonnet-4-6@20250106`). Using an unpinned name can break without notice as Google moves defaults.
- **Context caching TTL is 5 minutes default**: Extend with `ttl: '3600s'` if your caching pattern relies on cross-request reuse.

## See Also

- [Gen AI SDK docs](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/overview)
- [Model Garden (incl. Claude)](https://cloud.google.com/model-garden)
- [Cloud Run — host your API next to Vertex](../compute/SKILL.md)
- [BigQuery for RAG datastore](../data/SKILL.md)
- [AWS Bedrock sibling](../../../aws/ai/SKILL.md)
- [Cloudflare Workers AI (edge inference)](../../../cloudflare/ai/workers-ai/SKILL.md)
