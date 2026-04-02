---
name: tech/aws/ai
description: AWS AI services — Bedrock (Claude, Llama, Titan), SageMaker, Rekognition, Comprehend, Transcribe.
requires:
  - tech/aws
improves:
  - tech/aws
metadata:
  author: 2nth.ai
  version: "1.0.0"
  maturity: stub
---

# AWS AI

> **Stub** — full skill pending.

## Services

| Service | Purpose |
|---------|---------|
| **Bedrock** | Managed foundation model API — Claude (Anthropic), Llama (Meta), Titan (Amazon), Mistral |
| **SageMaker** | End-to-end ML platform — training, fine-tuning, hosting, MLOps |
| **Rekognition** | Computer vision — object detection, face analysis, OCR, content moderation |
| **Comprehend** | NLP — entity extraction, sentiment, key phrases, classification |
| **Transcribe** | Speech-to-text; real-time and batch |
| **Polly** | Text-to-speech |
| **Textract** | Document extraction — forms, tables, handwriting from PDFs/images |

## Bedrock — Claude via AWS

```typescript
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const client = new BedrockRuntimeClient({ region: 'us-east-1' }); // Bedrock not yet in af-south-1

const response = await client.send(new InvokeModelCommand({
  modelId: 'anthropic.claude-opus-4-6',
  contentType: 'application/json',
  accept: 'application/json',
  body: JSON.stringify({
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  }),
}));

const result = JSON.parse(new TextDecoder().decode(response.body));
const text = result.content[0].text;
```

**Note**: Bedrock is not available in af-south-1 as of 2025. Use us-east-1 or eu-west-1 for Bedrock. Document the cross-region transfer for POPIA purposes if processing personal data.

**Prefer Cloudflare AI Gateway → Anthropic API directly** for most 2nth.ai use cases — lower latency, no AWS SDK dependency, works from Cloudflare Workers natively.
