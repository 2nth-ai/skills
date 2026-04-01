---
name: tech/cloudflare
description: |
  Cloudflare platform skills. Use skills in this domain when:
  (1) building or deploying Cloudflare Workers or Pages applications,
  (2) working with D1 (SQLite at the edge), KV, R2, or Vectorize,
  (3) configuring Workers AI for edge inference or AI Gateway for Claude proxying,
  (4) writing wrangler.toml, migration files, or Wrangler CLI commands,
  (5) deploying 2nth.ai platform components or client applications.
license: MIT
compatibility: Cloudflare Workers, Cloudflare Pages, Wrangler CLI
homepage: https://skills.2nth.ai/tech/cloudflare
repository: https://github.com/2nth-ai/skills
improves:
  - tech
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Cloudflare, Edge, Infrastructure, Workers, D1"
allowed-tools: Bash(npx:*) Bash(wrangler:*) Read Write Edit Glob Grep
---

# Cloudflare Platform

The 2nth.ai deployment substrate. All client applications and platform services run on Cloudflare's edge network.

## Core Services

| Service | Purpose | 2nth Usage |
|---------|---------|-----------|
| Workers | Edge compute (JS/TS) | API logic, agent runtimes |
| Pages | Static + Functions | Frontend deployments |
| D1 | SQLite at the edge | Per-client databases |
| KV | Key-value store | Sessions, caching |
| R2 | Object storage | Documents, assets |
| Vectorize | Vector embeddings | RAG search |
| Workers AI | Edge inference | Routing, classification |
| AI Gateway | Claude proxy | Logging, rate limiting, token metering |

## Common Commands

```bash
wrangler pages dev ./public          # local dev (Pages)
wrangler dev                         # local dev (Worker)
wrangler pages deploy ./public       # deploy Pages
wrangler deploy                      # deploy Worker
wrangler d1 execute DB --file=migrations/0001_initial.sql --local
wrangler d1 execute DB --file=migrations/0001_initial.sql --remote
wrangler secret put SECRET_NAME      # set encrypted secret
```

## wrangler.toml Pattern

```toml
name = "project-name"
compatibility_date = "2024-12-01"
compatibility_flags = ["nodejs_compat"]

[[d1_databases]]
binding = "DB"
database_name = "project-db"
database_id = "your-d1-id"

[[kv_namespaces]]
binding = "KV"
id = "your-kv-id"

[ai]
binding = "AI"

[[r2_buckets]]
binding = "R2"
bucket_name = "project-bucket"
```

## D1 Migration Convention

```
migrations/
  0001_initial.sql
  0002_add_indexes.sql
  0003_descriptive_name.sql
```

Never modify existing migrations. Always add new files.

## Workers AI — Edge Routing Pattern

```typescript
const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
  messages: [
    { role: 'system', content: 'Classify intent. Reply with one word: erp | crm | general' },
    { role: 'user', content: userMessage }
  ],
  max_tokens: 10
});
// Fast, zero-latency classification at the edge
// Then route to Claude via AI Gateway for depth
```

## Common Gotchas

- **`nodejs_compat` flag**: Required for Node.js built-ins in Workers. Add to `wrangler.toml`
- **D1 binding name**: Must match exactly between `wrangler.toml` and code (`env.DB`)
- **Pages vs Workers**: Pages Functions run as Workers under the hood but deploy differently
- **Local D1**: `--local` flag uses a local SQLite file, not the remote D1 instance
- **Secret names**: Secrets are per-environment. `wrangler secret put` targets production by default
- **AI Gateway**: Requires a separate AI Gateway URL — don't call Claude API directly from Workers in production

## See Also

- [Workers docs](https://developers.cloudflare.com/workers/)
- [D1 docs](https://developers.cloudflare.com/d1/)
- [AI Gateway docs](https://developers.cloudflare.com/ai-gateway/)
