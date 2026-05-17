---
name: tech/google
description: |
  Google platform skills. Shared OAuth 2.0 / service-account model spanning Google Cloud (GCP) and Google Workspace. Use skills in this domain when:
  (1) authenticating any Google API — gcloud CLI, service accounts, workload identity, OAuth 2.0 with PKCE,
  (2) deciding between GCP (infrastructure) and Workspace (productivity APIs) boundaries,
  (3) building hybrid integrations that span both — e.g. a Cloud Run service that reads Gmail via Workspace domain-wide delegation,
  (4) navigating project, organisation, and folder hierarchies with IAM,
  (5) choosing regions for POPIA / GDPR data residency — africa-south1 (Johannesburg) for SA clients.
license: MIT
repository: https://github.com/2nth-ai/skills
improves:
  - tech
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Google, GCP, Google Cloud, Workspace, Gmail, Drive, OAuth, IAM, Vertex AI, BigQuery"
allowed-tools: Bash(gcloud:*) Bash(bq:*) Bash(gsutil:*) Read Write Edit Glob Grep
---

# Google Platform

Google runs two overlapping product families under one identity plane:

- **Google Cloud (GCP)** — infrastructure: Cloud Run, Cloud SQL, BigQuery, Vertex AI, Pub/Sub, Cloud Storage.
- **Google Workspace** — productivity APIs: Gmail, Drive, Sheets, Calendar, Admin SDK.

Both share **OAuth 2.0 and service-account authentication** and live under **Cloud IAM**, but the consent flows, scopes, and administrative domains differ. A Workspace admin grants domain-wide delegation to a GCP service account; a GCP IAM binding grants that same service account access to BigQuery. The two planes meet at the service-account identity.

In the 2nth.ai stack, GCP is the **second-tier compute substrate** alongside AWS — used when a workload needs Vertex AI (Gemini, embeddings), BigQuery analytics, or deep Workspace integration. Workspace APIs run through Gmail/Drive/Sheets automations that back Penny briefings and client intake flows.

## Sub-skills

| Path | Focus | Status |
|------|-------|--------|
| `tech/google/cloud` | GCP parent — projects, IAM, regions, gcloud CLI | ✓ production |
| `tech/google/cloud/compute` | Cloud Run, Cloud Functions, GKE, Compute Engine | ✓ production |
| `tech/google/cloud/ai` | Vertex AI, Gemini, embeddings, AI Studio | ✓ production |
| `tech/google/cloud/data` | BigQuery, Pub/Sub, Dataflow, Dataproc | ✓ production |
| `tech/google/cloud/security` | IAM, Secret Manager, KMS, Cloud Armor | stub |
| `tech/google/cloud/storage` | Cloud Storage, Filestore, Transfer Service | stub |
| `tech/google/cloud/database` | Cloud SQL, Spanner, Firestore, AlloyDB, Bigtable | stub |
| `tech/google/cloud/networking` | VPC, Load Balancing, Cloud CDN, Cloud DNS | stub |
| `tech/google/workspace` | Workspace parent — domain-wide delegation, scopes | ✓ production |
| `tech/google/workspace/gmail` | Gmail API — read, send, label, Watch pipeline, AI automation | ✓ production |
| `tech/google/workspace/drive` | Drive API v3 — files, folders, permissions, shared drives | stub |
| `tech/google/workspace/sheets` | Sheets API v4 — read, append, batch update, formulas | stub |
| `tech/google/workspace/calendar` | Calendar API v3 — events, availability, push notifications | stub |
| `tech/google/workspace/admin` | Admin SDK — users, groups, domain-wide delegation management | stub |

## Authentication model

Google uses **OAuth 2.0** for user-delegated access and **service accounts** for server-to-server. Both sit on top of Cloud IAM. The choice depends on whose data you are accessing:

| Identity | Use case | Credential |
|----------|---------|-----------|
| **User OAuth** | User authorises your app to access *their* Gmail/Drive/Sheets | `access_token` + `refresh_token`, OAuth consent screen |
| **Service account** | Server code accessing *project-owned* GCP resources (BigQuery, GCS, Pub/Sub) | JSON key OR Workload Identity Federation |
| **Service account + DWD** | Workspace *domain* data (all users in example.com) | JSON key + Workspace admin grants domain-wide delegation to the SA's OAuth client ID |
| **Workload Identity** | GKE / Cloud Run / Cloud Functions — no static key | Automatic token exchange via metadata server |
| **Workload Identity Federation** | External IdPs (AWS, Okta, GitHub OIDC) | Trust policy on the SA, short-lived tokens |

**Golden rule**: Never put a service-account JSON key in application code running on Google Cloud compute. Always use the attached service account via the metadata server. Keys are only for local dev, CI secrets, or cross-cloud.

### gcloud CLI setup

```bash
# Install (macOS)
brew install --cask google-cloud-sdk

# Interactive login (user credentials)
gcloud auth login

# Application Default Credentials (what SDKs read)
gcloud auth application-default login

# Set the active project
gcloud config set project my-project-id
gcloud config set compute/region africa-south1
gcloud config set run/region africa-south1

# Verify
gcloud config list
gcloud auth list
gcloud projects list
```

### Service account (server-to-server)

```bash
# Create service account
gcloud iam service-accounts create my-sa \
  --display-name "My Service Account" \
  --project my-project-id

# Grant a role (project-level)
gcloud projects add-iam-policy-binding my-project-id \
  --member "serviceAccount:my-sa@my-project-id.iam.gserviceaccount.com" \
  --role "roles/bigquery.dataViewer"

# Generate JSON key (local dev / CI only — prefer Workload Identity for runtime)
gcloud iam service-accounts keys create ~/.keys/my-sa.json \
  --iam-account my-sa@my-project-id.iam.gserviceaccount.com

# Use the key
export GOOGLE_APPLICATION_CREDENTIALS=~/.keys/my-sa.json
```

### Workload Identity Federation (no JSON keys)

Federate an external IdP (AWS STS, GitHub OIDC, Okta) to impersonate a GCP service account without a downloadable key. The canonical pattern for GitHub Actions deploying to GCP:

```bash
# Pool + provider
gcloud iam workload-identity-pools create github \
  --location global --display-name "GitHub Actions"

gcloud iam workload-identity-pools providers create-oidc github-oidc \
  --location global --workload-identity-pool github \
  --issuer-uri "https://token.actions.githubusercontent.com" \
  --attribute-mapping "google.subject=assertion.sub,attribute.repository=assertion.repository"

# Bind the SA
gcloud iam service-accounts add-iam-policy-binding \
  my-sa@my-project-id.iam.gserviceaccount.com \
  --role roles/iam.workloadIdentityUser \
  --member "principalSet://iam.googleapis.com/projects/NUM/locations/global/workloadIdentityPools/github/attribute.repository/my-org/my-repo"
```

## Project / organisation hierarchy

```
Organization (example.com)
 ├── Folder: production
 │   ├── Project: my-app-prod          ← where compute runs
 │   └── Project: my-data-prod
 ├── Folder: staging
 │   └── Project: my-app-staging
 └── Project: shared-services           ← central logging, billing, DNS
```

IAM bindings cascade downward. Grant narrowly — at the project or resource level, not the org level, unless you have org-admin reasons.

## Regions for SA / Africa clients

| Region | Code | POPIA fit |
|--------|------|-----------|
| Johannesburg | `africa-south1` | ✓ SA data residency |
| London | `europe-west2` | GDPR + documented SA transfer basis |
| Belgium | `europe-west1` | GDPR EU fallback |
| Iowa | `us-central1` | Avoid for SA personal data |

`africa-south1` launched 2024 with Cloud Run, GCE, GCS, Cloud SQL, GKE, BigQuery regional, Pub/Sub. **Not yet in africa-south1 (verify before building)**: Vertex AI model endpoints (use `europe-west2`), some Dataflow templates, Anthos Service Mesh. Check https://cloud.google.com/about/locations before designing.

## Cloudflare + GCP hybrid pattern

```
User request
    → Cloudflare Worker (edge auth, rate limit, cache)
         → Cloud Run service (europe-west2 or africa-south1)
              → BigQuery (analytics)
              → Vertex AI Gemini (inference)
              → Cloud SQL / Firestore (persistence)
              → Gmail API via Workspace DWD (user comms)
```

Cloud Run is the closest GCP analogue to Cloudflare Workers + AWS Lambda — pay-per-request, scale to zero, container-based. For real-time streaming AI inference, Vertex AI endpoints sit behind Cloud Run.

## See Also

- [Google Cloud (GCP)](cloud/SKILL.md)
- [Google Workspace](workspace/SKILL.md)
- [AWS platform](../aws/SKILL.md) — the sibling compute substrate
- [Cloudflare Workers](../cloudflare/workers/SKILL.md) — the edge tier
