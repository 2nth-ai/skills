---
name: tech/google/cloud
description: |
  Google Cloud Platform (GCP) skills. Use skills in this domain when:
  (1) deploying compute — Cloud Run (serverless containers), Cloud Functions (events), GKE (Kubernetes), Compute Engine (VMs),
  (2) running AI/ML workloads — Vertex AI, Gemini, embeddings, AI Studio,
  (3) working with data — BigQuery analytics, Pub/Sub event streaming, Dataflow pipelines,
  (4) storing data — Cloud SQL, Spanner, Firestore, AlloyDB, Cloud Storage, Bigtable,
  (5) securing infrastructure — Cloud IAM, Secret Manager, KMS, Cloud Armor, VPC Service Controls,
  (6) building Cloudflare + GCP hybrid architectures — Cloudflare at the edge, Cloud Run for compute, BigQuery for analytics.
license: MIT
compatibility: gcloud CLI, bq, gsutil, GCP SDK v3 (Node/Python/Go), Terraform
homepage: https://skills.2nth.ai/tech/google/cloud
repository: https://github.com/2nth-ai/skills
requires:
  - tech/google
improves:
  - tech/google
  - tech
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "GCP, Google Cloud, Cloud Run, Cloud Functions, GKE, Vertex AI, BigQuery, Pub/Sub, Cloud SQL, Firestore"
allowed-tools: Bash(gcloud:*) Bash(bq:*) Bash(gsutil:*) Bash(terraform:*) Read Write Edit Glob Grep
---

# Google Cloud Platform (GCP)

GCP is the 2nth.ai choice for:
- **AI/ML workloads** via Vertex AI (Gemini, embeddings, managed endpoints) — often the reason to pick GCP over AWS.
- **Analytics at scale** via BigQuery — serverless, sub-second on billions of rows, pay per TB scanned.
- **Event streaming** via Pub/Sub — simpler than Kafka, deeply integrated with Dataflow and BigQuery.
- **Workspace-native integrations** — service-account domain-wide delegation lets GCP code act on behalf of Gmail/Drive/Sheets domains.
- **Containerised legacy workloads** that don't fit the edge model — ERPNext / Frappe (`2nth_erp`), large relational databases, Python ML training.

The pattern is: **Cloudflare at the edge → Cloud Run for the heavy lift → BigQuery / Vertex AI for data + AI**.

### 2nth-specific usage map

| Service | 2nth usage |
|---------|-----------|
| **Cloud Run** | On-demand ERPNext/Frappe instances (`2nth_erp`) — scale to zero between sessions |
| **Cloud SQL (MySQL 8.0)** | Frappe DB for ERPNext, client ERP databases |
| **BigQuery** | Token economy analytics, Penny briefing rollups, client activity warehouse |
| **Vertex AI** | Gemini endpoints + Claude via Model Garden for Penny briefings, embeddings for skill retrieval |
| **Pub/Sub** | Gmail Watch → Cloud Run / Worker push, webhook fanout, inter-service events |
| **Cloud Scheduler** | Cold-wake for 2nth_erp Cloud Run, daily token rollups into BQ, Gmail watch renewal |
| **Secret Manager** | Workspace-bridge SA keys, Frappe DB creds, third-party API keys |

## Sub-skills

| Path | Focus | Status |
|------|-------|--------|
| `tech/google/cloud/compute` | Cloud Run, Cloud Functions, GKE, Compute Engine | ✓ production |
| `tech/google/cloud/ai` | Vertex AI, Gemini, embeddings, AI Studio | ✓ production |
| `tech/google/cloud/data` | BigQuery, Pub/Sub, Dataflow, Dataproc | ✓ production |
| `tech/google/cloud/security` | IAM, Secret Manager, KMS, Cloud Armor, VPC-SC | stub |
| `tech/google/cloud/storage` | Cloud Storage, Filestore, Transfer Service | stub |
| `tech/google/cloud/database` | Cloud SQL, Spanner, Firestore, AlloyDB, Bigtable | stub |
| `tech/google/cloud/networking` | VPC, Cloud Load Balancing, Cloud CDN, Cloud DNS | stub |

## gcloud project setup

```bash
# Create project
gcloud projects create my-app-prod --name "My App (prod)" --organization 123456789012

# Set active project
gcloud config set project my-app-prod

# Link billing account (required for most services)
gcloud billing projects link my-app-prod \
  --billing-account 0X0X0X-0X0X0X-0X0X0X

# Enable APIs you need (always explicit)
gcloud services enable \
  run.googleapis.com \
  cloudfunctions.googleapis.com \
  bigquery.googleapis.com \
  aiplatform.googleapis.com \
  pubsub.googleapis.com \
  secretmanager.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com
```

## IAM: primitive, predefined, custom roles

| Role type | Example | When to use |
|-----------|--------|------------|
| **Primitive** | `roles/owner`, `roles/editor`, `roles/viewer` | Never in production — too broad |
| **Predefined** | `roles/run.invoker`, `roles/bigquery.dataViewer` | Default — least privilege built-in |
| **Custom** | `roles/organizations/123/customRoleId` | When predefined doesn't fit; org-level definition |

```bash
# Grant Cloud Run invoker to a service account
gcloud run services add-iam-policy-binding my-service \
  --region africa-south1 \
  --member "serviceAccount:caller@other-project.iam.gserviceaccount.com" \
  --role "roles/run.invoker"

# Grant BigQuery job-user (can run queries) at project level
gcloud projects add-iam-policy-binding my-app-prod \
  --member "serviceAccount:my-sa@my-app-prod.iam.gserviceaccount.com" \
  --role "roles/bigquery.jobUser"

# Grant BigQuery dataset-level read (not project-wide)
bq add-iam-policy-binding \
  --member "serviceAccount:my-sa@my-app-prod.iam.gserviceaccount.com" \
  --role "roles/bigquery.dataViewer" \
  my-app-prod:my_dataset
```

## Scale-to-zero pattern (2nth_erp / Frappe)

Cloud Run's scale-to-zero is the foundation of the 2nth_erp on-demand ERPNext pattern: an instance that costs nothing when idle and warms on first request. Pairs with Cloud SQL (MySQL 8.0 for Frappe) connected over the built-in Cloud SQL proxy — no network plumbing.

```bash
# Frappe needs the Cloud SQL connection wired into the Cloud Run service
gcloud run services update 2nth-erp --region africa-south1 \
  --set-cloudsql-instances=my-project:africa-south1:frappe-db \
  --set-env-vars DB_HOST=/cloudsql/my-project:africa-south1:frappe-db \
  --min-instances 0 --max-instances 3 \
  --memory 2Gi --cpu 2

# Cold-wake via Cloud Scheduler before a scheduled session
gcloud scheduler jobs create http wake-2nth-erp \
  --schedule "55 7 * * 1-5" --time-zone "Africa/Johannesburg" \
  --uri "https://2nth-erp-xyz-ew.a.run.app/healthz" \
  --http-method GET
```

Idle timeout is ~15 min — first request wears the cold-start cost, subsequent requests within the window are warm.

## Region reference

| Region | Code | Notes |
|--------|------|-------|
| Johannesburg | `africa-south1` | SA primary; POPIA data residency |
| London | `europe-west2` | EU fallback for services not in africa-south1; Vertex AI |
| Belgium | `europe-west1` | GDPR EU, broader service availability |
| Iowa | `us-central1` | Most features, cheapest — avoid for SA personal data |
| Las Vegas | `us-west4` | Vertex AI specific model availability |

Check [cloud.google.com/about/locations](https://cloud.google.com/about/locations) before committing — `africa-south1` is newer and some services land there last.

## Cloud Build — container → deploy

```bash
# cloudbuild.yaml
steps:
  - name: gcr.io/cloud-builders/docker
    args: [build, -t, europe-west2-docker.pkg.dev/$PROJECT_ID/my-repo/my-service:$SHORT_SHA, .]
  - name: gcr.io/cloud-builders/docker
    args: [push, europe-west2-docker.pkg.dev/$PROJECT_ID/my-repo/my-service:$SHORT_SHA]
  - name: gcr.io/google.com/cloudsdktool/cloud-sdk
    entrypoint: gcloud
    args:
      - run
      - deploy
      - my-service
      - --image=europe-west2-docker.pkg.dev/$PROJECT_ID/my-repo/my-service:$SHORT_SHA
      - --region=africa-south1
      - --platform=managed

# Submit a build
gcloud builds submit --config cloudbuild.yaml .
```

## Artifact Registry (container + package hosting)

```bash
# Create a Docker repo (replaces deprecated Container Registry / gcr.io)
gcloud artifacts repositories create my-repo \
  --repository-format=docker \
  --location=europe-west2 \
  --description="Container images for my-app"

# Configure Docker auth
gcloud auth configure-docker europe-west2-docker.pkg.dev

# Push
docker tag my-service europe-west2-docker.pkg.dev/my-app-prod/my-repo/my-service:v1
docker push europe-west2-docker.pkg.dev/my-app-prod/my-repo/my-service:v1
```

## Cloud Logging & Monitoring

GCP auto-collects structured JSON logs from Cloud Run, Functions, GKE, GCE. Write one-line JSON to stdout and Cloud Logging parses every field.

```typescript
// Structured logging — Cloud Logging auto-parses
const log = (severity: 'INFO' | 'WARNING' | 'ERROR', message: string, extra?: object) => {
  console.log(JSON.stringify({
    severity,
    message,
    timestamp: new Date().toISOString(),
    ...extra,
  }));
};

log('INFO', 'request', { method: 'POST', path: '/api/process', userId: 'u_123' });
log('ERROR', 'bq_query_failed', { error: err.message, queryId: job.id });
```

```bash
# Tail Cloud Run logs
gcloud run services logs read my-service --region africa-south1 --limit 50

# Structured log filter (Cloud Logging query language)
gcloud logging read '
  resource.type="cloud_run_revision"
  resource.labels.service_name="my-service"
  severity>=ERROR
' --limit 20 --format json
```

## Cost controls

```bash
# Budget alert at $500 for the project
gcloud alpha billing budgets create \
  --billing-account 0X0X0X-0X0X0X-0X0X0X \
  --display-name "my-app-prod monthly" \
  --budget-amount 500USD \
  --threshold-rule percent=0.5,basis=CURRENT_SPEND \
  --threshold-rule percent=0.9,basis=CURRENT_SPEND \
  --threshold-rule percent=1.0,basis=CURRENT_SPEND \
  --filter-projects projects/my-app-prod
```

Expect surprises from: **egress** (especially cross-region + to internet), **BigQuery on-demand queries** (scan bytes, not rows), **Vertex AI endpoint provisioned capacity** (billed idle), **Cloud NAT** (per-GB + hourly).

## Common gotchas

- **africa-south1 service gaps**: Vertex AI Gemini endpoints, some Dataflow templates, Anthos Service Mesh, and newer managed services often land in `europe-west2`/`us-central1` first. Always verify availability at [cloud.google.com/about/locations](https://cloud.google.com/about/locations).
- **Service account JSON keys**: Prefer Workload Identity or Workload Identity Federation over downloadable keys. A leaked JSON key is the #1 GCP breach vector.
- **`roles/editor` is not least privilege**: It grants broad mutate power across most services. Use predefined resource-specific roles.
- **BigQuery billing model**: On-demand is per TB scanned (~$5/TB `us`, ~$6–7/TB `eu`). A `SELECT *` on a 1TB table scans 1TB every time. Use partitioned tables + clustering + `SELECT specific_columns` + capped custom quotas.
- **Cloud Run cold starts**: ~100–500ms for Node/Python; seconds for JVM. Use min-instances > 0 for latency-critical paths. Each min-instance is billed 24/7.
- **Quotas ≠ billing**: GCP quotas are per-project soft/hard limits (e.g. Vertex AI requests/min, Cloud Run concurrency). Running out of quota returns 429/RESOURCE_EXHAUSTED — not billed but blocks traffic.
- **Project deletion is 30-day soft**: Deleted projects hang around for 30 days. You can `gcloud projects undelete`. But billing stops immediately.

## See Also

- [Cloud Run / Functions / GKE / GCE](compute/SKILL.md)
- [Vertex AI and Gemini](ai/SKILL.md)
- [BigQuery, Pub/Sub, Dataflow](data/SKILL.md)
- [Google platform auth model](../SKILL.md)
- [AWS platform](../../aws/SKILL.md)
