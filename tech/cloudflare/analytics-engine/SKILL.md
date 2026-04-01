---
name: tech/cloudflare/analytics-engine
description: |
  Cloudflare Analytics Engine — time-series metrics at the edge. Use this skill when:
  (1) recording token usage, request counts, or latency metrics per client/skill/agent,
  (2) building Penny's token economy dashboard without a separate analytics DB,
  (3) replacing KV-based counters (which are slow and expensive for high-cardinality metrics),
  (4) querying usage data via SQL over the Cloudflare API for billing reports,
  (5) tracking AI inference costs per user, project, or domain in real time.
  Included with Workers Paid plan.
license: MIT
compatibility: Cloudflare Workers (Paid plan)
homepage: https://skills.2nth.ai/tech/cloudflare/analytics-engine
repository: https://github.com/2nth-ai/skills
requires:
  - tech/cloudflare/workers
improves:
  - tech/cloudflare
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Cloudflare, Analytics Engine, Metrics, Token Economy, Observability"
---

# Cloudflare Analytics Engine

Analytics Engine is a columnar time-series store built into Workers. It accepts structured metric events (called "data points") and makes them queryable via SQL through the Cloudflare API. It's purpose-built for high-cardinality metrics at scale — far cheaper and more appropriate than using KV or D1 for counters.

**Included** with Workers Paid plan. 10M data points free/month.

## wrangler.toml

```toml
[[analytics_engine_datasets]]
binding = "METRICS"
dataset = "2nth_token_usage"
```

## Writing metrics (writeDataPoint)

```typescript
// Record a token usage event per AI call
env.METRICS.writeDataPoint({
  blobs: [
    clientId,      // blob1 — searchable string
    skillPath,     // blob2
    agentId,       // blob3
    model,         // blob4 (e.g. 'claude-sonnet-4-6')
  ],
  doubles: [
    tokensIn,      // double1 — input tokens
    tokensOut,     // double2 — output tokens
    latencyMs,     // double3 — request latency
    estimatedCost, // double4 — cost in USD
  ],
  indexes: [clientId], // index for fast filtering (one per writeDataPoint)
});
```

`writeDataPoint` is non-blocking — it returns immediately and doesn't count against your CPU time.

## Querying via Cloudflare API (for Penny's briefings)

```typescript
// GET usage per client for the past 7 days
const query = `
  SELECT
    blob1 AS client_id,
    SUM(_sample_interval * double1) AS total_tokens_in,
    SUM(_sample_interval * double2) AS total_tokens_out,
    SUM(_sample_interval * double4) AS total_cost_usd,
    COUNT() AS total_requests
  FROM 2nth_token_usage
  WHERE timestamp > NOW() - INTERVAL '7' DAY
  GROUP BY blob1
  ORDER BY total_cost_usd DESC
`;

const response = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${accountId}/analytics_engine/sql`,
  {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${cfApiToken}` },
    body: query,
  }
);
const { data } = await response.json();
```

## Token economy pattern (for 2nth billing)

```typescript
// After every Claude call, record usage
async function recordTokenUsage(params: {
  clientId: string;
  skillPath: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
  latencyMs: number;
}, env: Env): Promise<void> {
  const costUsd = (params.tokensIn * 3 + params.tokensOut * 15) / 1_000_000; // claude-sonnet-4-6 pricing

  env.METRICS.writeDataPoint({
    blobs: [params.clientId, params.skillPath, params.model],
    doubles: [params.tokensIn, params.tokensOut, params.latencyMs, costUsd],
    indexes: [params.clientId],
  });
}
```

## Common Gotchas

- **Max 20 blobs, 20 doubles per data point**: Plan your schema before writing — you can't alter it later.
- **Blobs are strings, doubles are numbers**: No booleans or nested objects. Encode complex types as JSON strings in a blob.
- **`_sample_interval`**: The query engine may sample your data at high volumes. Always multiply aggregates by `_sample_interval` for accurate counts.
- **Not a replacement for D1**: Analytics Engine is append-only metrics. For transactional data (user records, orders), use D1.
- **Query API is rate-limited**: Don't query per-request — use scheduled queries (via Cron Triggers or Workflows) for reports.

## See Also

- [Workers runtime](../workers/SKILL.md)
- [D1 (transactional data)](../d1/SKILL.md)
- [AI Gateway (token logs)](../ai/ai-gateway/SKILL.md)
