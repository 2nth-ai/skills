---
name: tech/cloudflare/workers-for-platforms
description: |
  Cloudflare Workers for Platforms — multi-tenant Worker execution. Use this skill when:
  (1) building a platform where YOUR customers deploy their own Workers into your infrastructure,
  (2) isolating tenant code with separate dispatch namespaces and billing,
  (3) routing requests to customer-owned Workers via a dispatch Worker you control.
  NOT for: deploying Workers on behalf of clients — use standard Workers + Accounts for that.
license: MIT
compatibility: Cloudflare Workers (Paid, Enterprise)
homepage: https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/
repository: https://github.com/2nth-ai/skills
requires:
  - tech/cloudflare/workers
improves:
  - tech/cloudflare
metadata:
  author: 2nth.ai
  version: "0.1.0"
  status: stub
  categories: "Cloudflare, Workers for Platforms, Multi-tenant, Platform"
---

# Cloudflare Workers for Platforms

> **Status: stub** — documented for future reference. Do not build with this until 2nth has 50+ clients with custom code deployment requirements.

Workers for Platforms lets you build a multi-tenant execution platform where your *customers* deploy and run their own Workers code inside your Cloudflare account, with full isolation between tenants.

## When this becomes relevant for 2nth

This is the right primitive if `clients.2nth.ai` evolves so that enterprise clients need to deploy their own **skill customisations or agent hooks** without direct access to 2nth's Cloudflare account. Example: a client writes a custom `onBriefComplete` hook that runs inside 2nth's AI pipeline.

Until that pattern exists, use standard Workers deployed per client environment.

## How it works (concept)

```
Inbound request
    ↓
Dispatch Worker (you control) — routes by tenant ID
    ↓
Customer Worker (tenant code, isolated namespace)
```

- Each tenant gets a **dispatch namespace** — isolated from other tenants
- You upload tenant Workers via the Cloudflare API (they don't get CF dashboard access)
- Your dispatch Worker inspects the request and calls the right tenant Worker
- Rate limiting, billing, and CPU limits are enforced per namespace

## Key primitives

```typescript
// wrangler.toml — dispatch namespace binding
[[dispatch_namespaces]]
binding = "DISPATCH"
namespace = "2nth-client-plugins"

// Dispatch Worker
export default {
  async fetch(request: Request, env: Env) {
    const tenantId = request.headers.get('x-tenant-id');
    const userWorker = env.DISPATCH.get(tenantId);
    return userWorker.fetch(request);
  }
}
```

## See Also

- [Workers runtime](../workers/SKILL.md)
- [Durable Objects (stateful compute)](../durable-objects/SKILL.md)
