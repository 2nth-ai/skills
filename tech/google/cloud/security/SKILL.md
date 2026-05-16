---
name: tech/google/cloud/security
description: |
  GCP security skill (stub). Use when: (1) modelling Cloud IAM policies — principals, roles, conditions, policy-simulator,
  (2) storing secrets in Secret Manager and mounting as Cloud Run/GKE volumes,
  (3) managing encryption keys with Cloud KMS — CMEK, external keys, auto-rotation,
  (4) blocking attacks at the edge with Cloud Armor (WAF + DDoS + rate limit),
  (5) constraining data exfiltration with VPC Service Controls.
license: MIT
compatibility: gcloud CLI, Secret Manager v1, KMS v1, Cloud Armor (HTTPS LB)
homepage: https://skills.2nth.ai/tech/google/cloud/security
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
  categories: "GCP, IAM, Secret Manager, KMS, Cloud Armor, VPC-SC, Security"
allowed-tools: Bash(gcloud:*) Read Write Edit Glob Grep
---

# GCP Security (stub)

> **Status**: stub. Production depth pending. Contribute production patterns via PR.

## In scope

| Area | Key services |
|------|-------------|
| Identity | Cloud IAM, Workload Identity Federation, IAM Conditions, Policy Simulator |
| Secrets | Secret Manager (replication, rotation, version mgmt) |
| Encryption | Cloud KMS (CMEK, HSM, External Keys, auto-rotation) |
| Edge security | Cloud Armor (WAF rules, bot management, rate limits, DDoS) |
| Data perimeter | VPC Service Controls (egress/ingress rules around GCP APIs) |
| Audit | Cloud Audit Logs, Access Transparency, Access Approval |

## Quick start

```bash
# Secret Manager — store + mount
gcloud secrets create db-url --replication-policy automatic
echo -n "postgres://..." | gcloud secrets versions add db-url --data-file=-

# Cloud Run mounts the latest version as an env var
gcloud run services update my-service --region africa-south1 \
  --set-secrets DB_URL=db-url:latest

# KMS — create a key ring + key for encrypting Cloud SQL / BQ at rest with CMEK
gcloud kms keyrings create my-ring --location africa-south1
gcloud kms keys create bq-cmek \
  --location africa-south1 --keyring my-ring \
  --purpose encryption --rotation-period 90d --next-rotation-time +90d
```

## Gotchas (high-level)

- Primitive `roles/owner,editor,viewer` are too broad for production. Use predefined service-specific roles.
- IAM Conditions (time-based, resource tag-based) only apply to supported resource types — check before relying on them.
- Secret Manager auto-rotation ≠ your app re-reading. Use `:latest` version alias and restart the service OR subscribe to Pub/Sub notifications on the secret.
- VPC-SC perimeter violations are *silent* on the caller side — check VPC-SC audit logs, not app logs.

## See Also

- [GCP parent (IAM basics)](../SKILL.md)
- [AWS security sibling](../../../aws/security/SKILL.md)
