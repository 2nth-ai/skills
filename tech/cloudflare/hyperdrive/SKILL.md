---
name: tech/cloudflare/hyperdrive
description: |
  Cloudflare Hyperdrive — database connection pooling for Postgres and MySQL. Use this skill when:
  (1) connecting Cloudflare Workers to an external Postgres or MySQL database,
  (2) solving "too many connections" errors from Workers creating per-request DB connections,
  (3) reducing latency on external database queries via connection pooling at the edge,
  (4) integrating a client's existing hosted database (Supabase, Neon, PlanetScale, RDS) with 2nth Workers.
  Requires Workers Paid plan.
license: MIT
compatibility: Cloudflare Workers (Paid), Postgres, MySQL
homepage: https://skills.2nth.ai/tech/cloudflare/hyperdrive
repository: https://github.com/2nth-ai/skills
requires:
  - tech/cloudflare/workers
improves:
  - tech/cloudflare
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Cloudflare, Hyperdrive, Postgres, MySQL, Connection Pooling"
---

# Cloudflare Hyperdrive

Hyperdrive creates a globally-distributed connection pool between Cloudflare Workers and external databases. Workers open a connection to the nearest Hyperdrive node (fast), which maintains a pool of connections to your database (amortised).

**Requires**: Workers Paid plan. **Pricing**: $0.15/GB data proxied beyond free tier.

## Setup

```bash
wrangler hyperdrive create my-hyperdrive \
  --connection-string="postgresql://user:pass@db.example.com:5432/mydb"
# → prints the Hyperdrive ID
```

## wrangler.toml

```toml
[[hyperdrive]]
binding = "DB"
id = "YOUR_HYPERDRIVE_ID"
```

## Querying (use standard Postgres driver)

```typescript
import { Pool } from 'pg';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Hyperdrive provides a connectionString that routes through the pool
    const pool = new Pool({ connectionString: env.DB.connectionString });

    const { rows } = await pool.query('SELECT * FROM users WHERE active = $1', [true]);
    await pool.end();

    return Response.json(rows);
  },
};
```

## Common Gotchas

- **Always close the pool**: Call `pool.end()` at the end of each request — Workers don't persist connection pools between requests.
- **Use `env.DB.connectionString`**: This is the Hyperdrive-proxied URL, not your raw database URL.
- **SSL is handled by Hyperdrive**: No need to configure SSL in the pool — Hyperdrive handles the TLS to your database.
- **Hyperdrive is not D1**: If you can use D1, use D1. Hyperdrive is for existing external databases you can't migrate.

## See Also

- [D1 (native edge SQLite — prefer over Hyperdrive when possible)](../d1/SKILL.md)
- [Workers runtime](../workers/SKILL.md)
