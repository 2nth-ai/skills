---
name: tech/cloudflare/pages
description: |
  Cloudflare Pages — static hosting + serverless functions. Use this skill when:
  (1) deploying frontend apps, marketing sites, or documentation from a Git repo,
  (2) adding server-side logic to a static site via Pages Functions (edge Workers),
  (3) deploying the skills.2nth.ai catalog or client portal frontends,
  (4) setting up Git-based CI/CD with automatic branch preview deployments.
  Unlimited sites, 500 builds/month on free plan.
license: MIT
compatibility: Cloudflare Pages, Wrangler CLI
homepage: https://skills.2nth.ai/tech/cloudflare/pages
repository: https://github.com/2nth-ai/skills
requires:
  - tech/cloudflare/workers
improves:
  - tech/cloudflare
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Cloudflare, Pages, Static Hosting, Serverless, CI/CD"
---

# Cloudflare Pages

Pages hosts static assets on Cloudflare's global CDN with optional Pages Functions — edge Workers that run alongside your static files. It's the standard deployment target for all 2nth.ai frontend sites and client portals.

**Free plan**: unlimited sites, 500 builds/month, unlimited bandwidth.

## Deploy via CLI

```bash
# Build your site first, then:
wrangler pages deploy ./dist --project-name=my-site

# With a dirty git state (no CI):
wrangler pages deploy ./dist --project-name=my-site --commit-dirty=true
```

First deploy to a new project requires creating it first:
```bash
wrangler pages project create my-site --production-branch=main
```

## wrangler.toml (for Pages with Functions + bindings)

```toml
name = "my-site"
pages_build_output_dir = "./dist"
compatibility_date = "2024-12-01"
compatibility_flags = ["nodejs_compat"]

[[d1_databases]]
binding = "DB"
database_name = "my-site-db"
database_id = "your-d1-id"

[[kv_namespaces]]
binding = "KV"
id = "your-kv-id"
```

## Pages Functions

Functions live in `functions/` at your project root. File path = URL path.

```
functions/
  api/
    chat.ts         → /api/chat
    health.ts       → /api/health
  _middleware.ts    → runs before every request
```

```typescript
// functions/api/chat.ts
import type { PagesFunction } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
  KV: KVNamespace;
  AI: Ai;
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const body = await ctx.request.json();
  // Same as a Worker — full access to bindings
  return Response.json({ ok: true });
};
```

## Local Dev

```bash
wrangler pages dev ./dist            # serve static + functions locally
wrangler pages dev ./dist --port=3000
```

Bindings (D1, KV, AI) work locally with `.dev.vars` for secrets:
```
# .dev.vars
ANTHROPIC_API_KEY=sk-ant-...
```

## Git Integration (recommended for production)

Connect your GitHub repo in the Cloudflare dashboard:
- **Production branch**: `main` → deploys to `your-site.pages.dev`
- **Preview branches**: every PR gets a unique preview URL
- Build command and output directory set per project

## Common Gotchas

- **`wrangler pages deploy` vs `wrangler deploy`**: Pages uses `wrangler pages deploy`; Workers use `wrangler deploy`. They are different commands.
- **Functions directory must be at root**: `functions/` relative to project root, not inside `dist/`.
- **`_` prefix for special files**: `_middleware.ts`, `_not-found.ts`, `_headers`, `_redirects` — Cloudflare handles these specially.
- **Build output directory**: must contain an `index.html` or Cloudflare will serve a blank page.
- **Secrets in Pages**: set via dashboard or `wrangler pages secret put SECRET_NAME --project-name=my-site`.

## See Also

- [Workers runtime (Pages Functions run on Workers)](../workers/SKILL.md)
- [D1 (database bindings)](../d1/SKILL.md)
- [KV (session/cache bindings)](../kv/SKILL.md)
