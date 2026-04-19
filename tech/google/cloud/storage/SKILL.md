---
name: tech/google/cloud/storage
description: |
  GCP storage skill (stub). Use when: (1) storing objects in Cloud Storage — buckets, lifecycle, versioning, signed URLs,
  (2) choosing storage class — Standard / Nearline / Coldline / Archive,
  (3) running NFS-style shared filesystems with Filestore,
  (4) moving data into GCP with Storage Transfer Service or Transfer Appliance.
license: MIT
compatibility: Cloud Storage v1, gsutil, Filestore v1
homepage: https://skills.2nth.ai/tech/google/cloud/storage
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
  categories: "GCP, Cloud Storage, GCS, Filestore, Transfer Service"
allowed-tools: Bash(gcloud:*) Bash(gsutil:*) Read Write Edit Glob Grep
---

# GCP Storage (stub)

> **Status**: stub. Production depth pending.

## In scope

| Area | Service |
|------|---------|
| Object storage | Cloud Storage (buckets, objects, versioning) |
| Storage classes | Standard, Nearline, Coldline, Archive |
| File systems | Filestore (NFSv3/v4.1), Filestore Enterprise |
| Bulk transfer | Storage Transfer Service, Transfer Appliance |
| Backup | Backup and DR Service |

## Quick start

```bash
# Create bucket in SA region, uniform access, default encryption
gcloud storage buckets create gs://my-raw-uploads \
  --location africa-south1 \
  --uniform-bucket-level-access \
  --public-access-prevention

# Lifecycle: auto-move objects >30d to Nearline, >365d to Coldline
gcloud storage buckets update gs://my-raw-uploads \
  --lifecycle-file=lifecycle.json

# Signed URL (V4) for time-limited client upload (skip your server)
gcloud storage sign-url gs://my-raw-uploads/incoming/file.pdf \
  --duration=1h --http-verb=PUT
```

## Storage classes

| Class | Min storage duration | Best for |
|-------|---------------------|---------|
| Standard | none | Frequently accessed |
| Nearline | 30 days | Monthly access |
| Coldline | 90 days | Quarterly access |
| Archive | 365 days | Annual access, compliance |

Retrieval costs grow as classes get colder. Lifecycle rules auto-transition.

## Gotchas (high-level)

- `gs://bucket-name` must be globally unique across all GCP projects.
- Uniform bucket-level access disables per-object ACLs — use IAM only. Enable this at creation; retrofit is painful.
- Signed URLs expire at the absolute time, not "on next request" — clock skew matters.
- `us-east1` buckets can't be accessed from `us-east4` without egress costs. Same-region compute + storage is essential.

## See Also

- [GCP parent](../SKILL.md)
- [AWS storage sibling (S3/EBS/EFS)](../../../aws/storage/SKILL.md)
- [Cloudflare R2 (zero-egress alternative)](../../../cloudflare/r2/SKILL.md)
