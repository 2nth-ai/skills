---
name: tech/google/cloud/database
description: |
  GCP database skill (stub). Use when: (1) running managed Postgres/MySQL/SQL Server on Cloud SQL,
  (2) running Postgres-compatible high-performance OLTP on AlloyDB,
  (3) running globally-distributed SQL on Spanner,
  (4) using Firestore for serverless document storage (mobile, web clients, Firebase),
  (5) using Bigtable for wide-column at petabyte scale,
  (6) using Memorystore (Redis/Memcached/Valkey) for caching.
license: MIT
compatibility: Cloud SQL (Postgres 13–16, MySQL 8.0), AlloyDB, Spanner, Firestore Native, Bigtable
repository: https://github.com/2nth-ai/skills
requires:
  - tech/google/cloud
improves:
  - tech/google/cloud
  - tech/google
  - tech
metadata:
  author: 2nth.ai
  version: "0.1.0"
  categories: "GCP, Cloud SQL, AlloyDB, Spanner, Firestore, Bigtable, Memorystore, Database"
allowed-tools: Bash(gcloud:*) Read Write Edit Glob Grep
---

# GCP Databases (stub)

> **Status**: stub. Production depth pending.

## Decision tree

| Need | Pick |
|------|------|
| Standard relational, <few TB | **Cloud SQL** (Postgres most common) |
| Postgres compatible, high-perf OLTP (~4x Cloud SQL) | **AlloyDB** |
| Global consistency, >10TB or multi-region writes | **Spanner** |
| Serverless doc store, mobile SDK | **Firestore (Native)** |
| Wide-column, time-series, IoT at petabyte scale | **Bigtable** |
| In-memory cache | **Memorystore** (Redis/Memcached/Valkey) |

## Quick starts

```bash
# Cloud SQL for Postgres
gcloud sql instances create my-pg \
  --database-version POSTGRES_16 \
  --region africa-south1 \
  --tier db-custom-2-7680 \
  --storage-type SSD --storage-size 20 --storage-auto-increase \
  --availability-type ZONAL \
  --backup --enable-point-in-time-recovery

# Firestore (Native mode)
gcloud firestore databases create --location=africa-south1 \
  --type=firestore-native

# Memorystore Redis
gcloud redis instances create my-cache \
  --size 1 --region africa-south1 --tier basic
```

## Connecting from Cloud Run to Cloud SQL

```bash
# Option 1: Cloud SQL Auth Proxy built in (recommended)
gcloud run services update my-service --region africa-south1 \
  --set-cloudsql-instances=my-app-prod:africa-south1:my-pg \
  --set-env-vars INSTANCE_UNIX_SOCKET=/cloudsql/my-app-prod:africa-south1:my-pg
# Connect via unix socket — no IP, no network config
```

## Gotchas (high-level)

- Cloud SQL private IP requires a VPC + allocated service range — plan at project creation.
- AlloyDB and Spanner have high floor costs (~$200+/mo for the cheapest valid config). Cloud SQL starts much lower.
- Firestore Native vs Datastore mode are different products — Native is what modern apps use; don't create in Datastore mode by accident.
- Spanner needs at least 100 processing units (~$65/mo) to exist. Below 1000 PUs, query concurrency is limited.
- Memorystore Basic has no HA; Standard has failover. Choose based on "can we tolerate cache-flushing restart?"

## See Also

- [GCP parent](../SKILL.md)
- [AWS database sibling](../../../aws/database/SKILL.md)
- [Cloudflare D1 (SQLite at edge)](../../../cloudflare/d1/SKILL.md)
- [Cloudflare Hyperdrive (pool Postgres from Workers)](../../../cloudflare/hyperdrive/SKILL.md)
