---
name: tech/cloudflare/d1
description: |
  Cloudflare D1 — SQLite at the edge. Use this skill when:
  (1) designing schemas and writing migrations for D1 databases,
  (2) querying D1 from Workers using the D1Database binding,
  (3) using batch operations for atomicity or performance,
  (4) enabling D1 read replicas for global read scaling (paid),
  (5) seeding data or running one-off scripts via Wrangler CLI,
  (6) choosing between D1, KV, and R2 for different data shapes.
license: MIT
compatibility: Cloudflare Workers, Wrangler CLI
homepage: https://skills.2nth.ai/tech/cloudflare/d1
repository: https://github.com/2nth-ai/skills
requires:
  - tech/cloudflare/workers
improves:
  - tech/cloudflare
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Cloudflare, D1, SQLite, Database, Edge"
allowed-tools: Bash(npx:*) Bash(wrangler:*) Read Write Edit Glob Grep
---

# Cloudflare D1

D1 is SQLite running at Cloudflare's edge. It supports standard SQL, automatic backups, and read replicas that route queries to the closest edge location (paid tier).

**Free tier**: 5GB storage, 5M row reads/day, 100k row writes/day.
**Paid tier** (Workers Paid): 50GB storage, 25B row reads/month, 50M row writes/month + read replicas.

## wrangler.toml binding

```toml
[[d1_databases]]
binding = "DB"
database_name = "my-app-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

## Create and migrate

```bash
wrangler d1 create my-app-db                     # creates DB, prints database_id
wrangler d1 execute my-app-db --local  --file=migrations/0001_initial.sql
wrangler d1 execute my-app-db --remote --file=migrations/0001_initial.sql
```

## Migration convention

```
migrations/
  0001_initial.sql
  0002_add_indexes.sql
  0003_sessions.sql
```

**Never modify existing migrations.** Always add a new numbered file.

## Schema patterns

```sql
-- migrations/0001_initial.sql
CREATE TABLE IF NOT EXISTS users (
  id        TEXT PRIMARY KEY,              -- use UUID or nanoid
  email     TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS sessions (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  data       TEXT NOT NULL DEFAULT '{}',  -- JSON blob
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- migrations/0002_add_indexes.sql
-- Always index foreign keys and columns used in WHERE clauses
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
```

## Querying in Workers

```typescript
// Single row
const user = await env.DB
  .prepare('SELECT * FROM users WHERE email = ?')
  .bind(email)
  .first<User>();

// Multiple rows
const { results } = await env.DB
  .prepare('SELECT * FROM sessions WHERE user_id = ? AND expires_at > ?')
  .bind(userId, Math.floor(Date.now() / 1000))
  .all<Session>();

// Insert / update
const { success } = await env.DB
  .prepare('INSERT INTO users (id, email) VALUES (?, ?)')
  .bind(crypto.randomUUID(), email)
  .run();

// Raw (returns metadata too)
const { results, meta } = await env.DB
  .prepare('SELECT * FROM users')
  .raw();
```

## Batch operations (atomic)

```typescript
// All statements execute atomically — all succeed or all fail
const results = await env.DB.batch([
  env.DB.prepare('INSERT INTO users (id, email) VALUES (?, ?)').bind(id, email),
  env.DB.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)').bind(sessionId, id, expiry),
]);
```

**Use batch for any multi-step write** — it's the D1 equivalent of a transaction.

## JSON columns

```sql
-- Store JSON in TEXT column
UPDATE users SET preferences = ? WHERE id = ?
-- Query JSON field (SQLite JSON functions)
SELECT json_extract(preferences, '$.theme') AS theme FROM users WHERE id = ?
```

## Seeding data

```bash
wrangler d1 execute my-app-db --local --command="INSERT INTO users VALUES ('1', 'admin@example.com', unixepoch())"

# Or seed from a file
wrangler d1 execute my-app-db --local --file=seed.sql
```

## Read replicas (paid)

When enabled on the paid tier, D1 automatically routes read queries to the closest Cloudflare edge location. Write queries always go to the primary.

```typescript
// No code change needed — D1 routes automatically
// Write goes to primary, reads go to nearest replica
const row = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
```

## Common Gotchas

- **Always use indexes**: D1 is SQLite — without indexes on WHERE/JOIN columns, queries do full scans. Always add indexes in a follow-up migration.
- **Timestamps as integers**: Store as `unixepoch()` (seconds), not ISO strings. Easier to compare and index.
- **IDs as TEXT**: D1 has no AUTO_INCREMENT UUID support. Use `crypto.randomUUID()` in the Worker and pass it in.
- **`.first()` returns null**: Not an error — check for null before using the result.
- **Batch ≠ transaction across Workers**: `batch()` is atomic within one call, but not across multiple Worker requests.
- **100ms D1 timeout**: Queries taking >100ms will fail. Optimise with indexes; don't run complex analytics in D1.
- **Local dev uses local SQLite**: `wrangler dev` creates a `.wrangler/state/v3/d1/` file. Run `--remote` to test against the real DB.

## Choosing D1 vs KV vs R2

| Use case | D1 | KV | R2 |
|----------|----|----|---|
| Structured relational data | ✓ | ✗ | ✗ |
| User records, sessions, logs | ✓ | Sessions only | ✗ |
| Key-value lookups (<128KB) | ✗ | ✓ | ✗ |
| Config, feature flags | ✗ | ✓ | ✗ |
| Files, images, documents | ✗ | ✗ | ✓ |
| Large blobs (>1MB) | ✗ | ✗ | ✓ |

## See Also

- [Workers runtime](../workers/SKILL.md)
- [KV store](../kv/SKILL.md)
- [R2 object storage](../r2/SKILL.md)
