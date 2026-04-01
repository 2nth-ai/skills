---
name: tech/cloudflare/ai/vectorize
description: |
  Cloudflare Vectorize — vector database for semantic search and RAG. Use this skill when:
  (1) building semantic search over skills, documents, or knowledge bases,
  (2) implementing RAG (retrieval-augmented generation) to reduce token costs 80–95%,
  (3) finding semantically similar content without exact keyword matching,
  (4) embedding and indexing skill SKILL.md files for agent skill discovery,
  (5) building recommendation systems or nearest-neighbour lookups,
  (6) combining Vectorize with Workers AI embeddings and Claude for full RAG pipelines.
license: MIT
compatibility: Cloudflare Workers
homepage: https://skills.2nth.ai/tech/cloudflare/ai/vectorize
repository: https://github.com/2nth-ai/skills
requires:
  - tech/cloudflare/workers
  - tech/cloudflare/ai/workers-ai
improves:
  - tech/cloudflare/ai
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Cloudflare, Vectorize, RAG, Embeddings, Semantic Search"
allowed-tools: Bash(npx:*) Bash(wrangler:*) Read Write Edit Glob Grep
---

# Cloudflare Vectorize

Vectorize is a vector database built into the Cloudflare edge. It stores float[] embeddings and supports approximate nearest-neighbour (ANN) search, filtered by metadata.

**Free tier**: 5M vector dimensions stored (e.g. ~6,500 vectors at 768d).
**Paid**: $0.01 per 1M vector dimensions queried, $0.05 per 1M stored.

## wrangler.toml

```toml
[[vectorize]]
binding = "SKILLS_INDEX"
index_name = "skills-embeddings"
```

```bash
# Create index — choose dimensions to match your embedding model
wrangler vectorize create skills-embeddings --dimensions=768 --metric=cosine
# BGE-base = 768, BGE-large = 1024, OpenAI ada-002 = 1536
```

## Full RAG pipeline (2nth pattern)

```typescript
// Step 1: Embed the user query
async function searchSkills(query: string, env: Env): Promise<string> {
  // Generate embedding for the query
  const { data } = await env.AI.run('@cf/baai/bge-base-en-v1.5', { text: [query] });
  const queryVector = data[0];

  // Step 2: Find top-K similar skill vectors
  const results = await env.SKILLS_INDEX.query(queryVector, {
    topK: 5,
    returnMetadata: 'all',
    filter: { domain: 'tech' }, // optional metadata filter
  });

  // Step 3: Build context from retrieved skills
  const context = results.matches
    .filter(m => m.score > 0.75) // similarity threshold
    .map(m => m.metadata?.content as string)
    .join('\n\n---\n\n');

  return context;
}

// Step 4: Pass context to Claude (via AI Gateway)
async function answerWithRAG(question: string, env: Env): Promise<string> {
  const context = await searchSkills(question, env);

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: `Answer using this context from the 2nth.ai skills library:\n\n${context}`,
    messages: [{ role: 'user', content: question }],
  });

  return message.content[0].text;
}
```

## Indexing skill documents

```typescript
// Embed and store a SKILL.md file
async function indexSkill(skillPath: string, content: string, env: Env): Promise<void> {
  const { data } = await env.AI.run('@cf/baai/bge-base-en-v1.5', { text: [content] });

  await env.SKILLS_INDEX.upsert([{
    id: skillPath.replace(/\//g, '_'), // 'biz_erp_sage-x3'
    values: data[0],
    metadata: {
      path: skillPath,
      domain: skillPath.split('/')[0],
      content: content.slice(0, 1000), // truncated for metadata (max 10KB)
      githubUrl: `https://github.com/2nth-ai/skills/blob/main/${skillPath}/SKILL.md`,
    },
  }]);
}

// Batch upsert multiple skills at once (more efficient)
await env.SKILLS_INDEX.upsert(skillsToIndex.map(s => ({
  id: s.path.replace(/\//g, '_'),
  values: s.embedding,
  metadata: { path: s.path, domain: s.domain, content: s.excerpt },
})));
```

## Metadata filtering

```typescript
// Filter by domain and minimum score
const results = await env.SKILLS_INDEX.query(queryVector, {
  topK: 10,
  returnMetadata: 'all',
  filter: {
    domain: { $in: ['biz', 'fin'] }, // only business + finance skills
  },
});

// Filter by status
const results = await env.SKILLS_INDEX.query(queryVector, {
  topK: 5,
  filter: { status: 'production' },
});
```

## Namespace isolation (per-client indexes)

```toml
# Separate indexes per client keeps data isolated
[[vectorize]]
binding = "CLIENT_INDEX"
index_name = "client-proximity-green-docs"
```

## Delete and update vectors

```typescript
// Delete by ID
await env.SKILLS_INDEX.deleteByIds(['biz_erp_sage-x3', 'tech_cloudflare_workers']);

// Upsert overwrites existing vectors with same ID
await env.SKILLS_INDEX.upsert([{ id: 'biz_erp_sage-x3', values: newEmbedding, metadata: {} }]);

// Get info about the index
const info = await env.SKILLS_INDEX.describe();
console.log(info.vectorsCount, info.dimensions);
```

## Common Gotchas

- **Dimensions must match the embedding model**: BGE-base = 768. Creating an index with wrong dimensions and then inserting causes silent errors or query failures.
- **Score 0–1 (cosine)**: Cosine similarity returns 0–1. Scores below 0.7 are usually poor matches. Always filter by `score > threshold`.
- **Metadata max 10KB per vector**: Don't store the full SKILL.md content in metadata. Store an excerpt and fetch the full content from GitHub or R2.
- **Vectorize is eventually consistent**: Upserted vectors may not appear in queries immediately (usually <1s, can be a few seconds).
- **`returnMetadata: 'all'` costs more**: Only request metadata when you need it. Use `'none'` if you only need IDs.
- **Free tier dimensions ≠ vectors**: 5M dimensions ÷ 768 dimensions/vector ≈ 6,500 vectors on free. For the skills catalog (~50 skills), free tier is fine.

## See Also

- [Workers AI (embeddings)](../workers-ai/SKILL.md)
- [AI Gateway (Claude integration)](../ai-gateway/SKILL.md)
- [R2 (storing full skill content)](../../r2/SKILL.md)
