---
name: tech/google/cloud/compute
description: |
  GCP compute skill. Use when: (1) deploying serverless containers on Cloud Run — scale-to-zero, pay per request,
  (2) running event-driven functions on Cloud Functions v2 (Cloud Run under the hood),
  (3) running Kubernetes workloads on GKE Autopilot (managed nodes) or Standard (DIY nodes),
  (4) provisioning virtual machines on Compute Engine — persistent workloads, GPUs, custom kernels,
  (5) choosing between Cloud Run (most cases) vs GKE (complex K8s apps) vs GCE (stateful/kernel-level),
  (6) building hybrid Cloudflare + GCP — Cloudflare at edge, Cloud Run for container workloads.
license: MIT
compatibility: gcloud CLI v500+, Cloud Run gen2, Cloud Functions v2, GKE 1.30+
repository: https://github.com/2nth-ai/skills
requires:
  - tech/google/cloud
improves:
  - tech/google/cloud
  - tech/google
  - tech
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "GCP, Cloud Run, Cloud Functions, GKE, Compute Engine, Serverless, Containers, Kubernetes"
allowed-tools: Bash(gcloud:*) Bash(docker:*) Bash(kubectl:*) Read Write Edit Glob Grep
---

# Google Cloud Compute

GCP offers four compute tiers. Pick the leftmost that fits — each step right costs more operational weight:

**Cloud Run → Cloud Functions → GKE Autopilot → GKE Standard → Compute Engine**

The 2nth.ai default is **Cloud Run**. It gives you containers with scale-to-zero, pay-per-request, global HTTPS endpoints, and integrates cleanly with Pub/Sub, Cloud SQL, Vertex AI, and Workspace DWD. Lambda-equivalent workloads that need >60 min runtime, persistent state, or GPU specialisation move up to GKE or GCE.

## Service comparison

| Service | Best for | Cold start | Runtime | Scale-to-zero | Price model |
|---------|---------|-----------|---------|---------------|-------------|
| **Cloud Run** | HTTP/gRPC containers, event triggers | 100–500ms | Up to 60 min/req | ✓ | vCPU-sec + GB-sec + requests |
| **Cloud Functions v2** | Single-function glue, event consumers | 200–800ms | Up to 60 min | ✓ | Same as Cloud Run (runs on it) |
| **GKE Autopilot** | Multi-service K8s apps, complex routing | Node-level (minutes) | Unlimited | ✗ (pod-level HPA) | vCPU + memory per pod-hour |
| **GKE Standard** | Full K8s control, DaemonSets, custom nodes | Node-level | Unlimited | ✗ | Node VM + control plane fee |
| **Compute Engine** | Stateful VMs, GPUs, legacy workloads | Instance boot (seconds) | Unlimited | ✗ | Per-second VM billing |

---

## Cloud Run

Cloud Run runs **any containerised HTTP server** on Google's managed platform. You push an image, Google runs it — auto-scaling from 0 to thousands of instances, auto-TLS, auto-HTTPS URL. The sweet spot for ~90% of backend services.

### Deploy from source (no Dockerfile needed)

```bash
# Cloud Run builds a container via Buildpacks and deploys in one command
gcloud run deploy my-service \
  --source . \
  --region africa-south1 \
  --allow-unauthenticated

# Your app just needs to listen on the $PORT env var (default 8080)
```

### Deploy a pre-built container

```bash
gcloud run deploy my-service \
  --image europe-west2-docker.pkg.dev/my-app-prod/my-repo/my-service:v1 \
  --region africa-south1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi --cpu 1 \
  --concurrency 80 \
  --min-instances 0 --max-instances 100 \
  --timeout 300 \
  --set-env-vars NODE_ENV=production \
  --set-secrets DB_URL=db-url:latest,API_KEY=stripe-key:latest \
  --service-account my-service-sa@my-app-prod.iam.gserviceaccount.com
```

### Concurrency — the single biggest cost lever

Cloud Run bills per vCPU-second. A Node.js service doing mostly I/O can handle 80–250 concurrent requests per instance. Raising concurrency reduces the instance count you need.

| Workload | Concurrency |
|----------|-------------|
| CPU-bound (image processing, PDF) | 1–5 |
| I/O-bound Node/Python (typical API) | 80 (default) |
| Async I/O heavy (proxies, streaming) | 250–1000 |

```bash
# Lower for CPU-bound
gcloud run services update my-service --concurrency 4 --region africa-south1

# Higher for I/O-bound
gcloud run services update my-service --concurrency 250 --region africa-south1
```

### CPU allocation: "request" vs "always-on"

| Mode | When CPU is billed | When to use |
|------|-------------------|-------------|
| **CPU only during request handling** (default) | Only while the instance has an active request | Web APIs, sync handlers |
| **CPU always allocated** (`--no-cpu-throttling`) | Continuously while the instance is running | Background tasks, Queue consumers, min-instances > 0 |

```bash
# Background worker with min-instances — pay for always-on CPU
gcloud run services update my-worker \
  --no-cpu-throttling \
  --min-instances 1 \
  --region africa-south1
```

### TypeScript service (Node 20)

```typescript
// src/index.ts — Fastify on Cloud Run
import Fastify from 'fastify';

const app = Fastify({ logger: true });

app.get('/health', async () => ({ ok: true }));

app.post('/api/process', async (req) => {
  const body = req.body as { input: string };
  // ...business logic
  return { processed: body.input };
});

const port = Number(process.env.PORT ?? 8080);
app.listen({ port, host: '0.0.0.0' }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
```

```dockerfile
# Dockerfile — minimal, fast cold start
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY dist ./dist
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
```

### Pub/Sub push trigger

```bash
# Grant Pub/Sub permission to invoke your Cloud Run service
gcloud run services add-iam-policy-binding my-consumer \
  --region africa-south1 \
  --member "serviceAccount:service-PROJECT_NUMBER@gcp-sa-pubsub.iam.gserviceaccount.com" \
  --role "roles/run.invoker"

# Push subscription posts JSON to your HTTPS endpoint
gcloud pubsub subscriptions create my-sub \
  --topic my-topic \
  --push-endpoint https://my-consumer-xyz-ew.a.run.app/events \
  --push-auth-service-account "pubsub-invoker@my-app-prod.iam.gserviceaccount.com"
```

```typescript
// Cloud Run receives Pub/Sub push
app.post('/events', async (req) => {
  const { message } = req.body as { message: { data: string; attributes: Record<string, string> } };
  const payload = JSON.parse(Buffer.from(message.data, 'base64').toString());
  await handleEvent(payload);
  return { ack: true };  // return 200 to ack
});
```

### Cloud Run jobs (batch, not HTTP)

For cron-style or CLI-triggered batch work that doesn't need HTTP serving:

```bash
gcloud run jobs create my-nightly-etl \
  --image europe-west2-docker.pkg.dev/my-app-prod/my-repo/etl:v1 \
  --region africa-south1 \
  --tasks 10 \
  --task-timeout 1h \
  --parallelism 5 \
  --cpu 2 --memory 4Gi \
  --set-env-vars INPUT_BUCKET=raw,OUTPUT_BUCKET=processed

# Run manually
gcloud run jobs execute my-nightly-etl --region africa-south1

# Schedule via Cloud Scheduler
gcloud scheduler jobs create http nightly-etl-trigger \
  --schedule "0 2 * * *" --time-zone "Africa/Johannesburg" \
  --uri "https://REGION-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/PROJECT_ID/jobs/my-nightly-etl:run" \
  --http-method POST \
  --oauth-service-account-email scheduler-sa@my-app-prod.iam.gserviceaccount.com
```

### Calling Cloud Run from Cloudflare Workers (IAM-authenticated)

Cloud Run service accepts Google OIDC ID tokens. From a Cloudflare Worker, mint an ID token using a service-account key (stored in Workers secrets):

```typescript
// Sign a Google-compatible JWT → exchange for ID token → call private Cloud Run
export async function getIdentityToken(env: Env, audience: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const jwtHeader = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const jwtPayload = btoa(JSON.stringify({
    iss: env.GCP_SA_EMAIL,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    target_audience: audience,             // the Cloud Run URL
    iat: now,
    exp: now + 3600,
  }));

  // Sign with the SA private key (imported via SubtleCrypto)
  const keyData = pemToArrayBuffer(env.GCP_SA_PRIVATE_KEY);
  const cryptoKey = await crypto.subtle.importKey('pkcs8', keyData,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey,
    new TextEncoder().encode(`${jwtHeader}.${jwtPayload}`));
  const signedJwt = `${jwtHeader}.${jwtPayload}.${arrayBufferToBase64Url(sig)}`;

  // Exchange assertion for an ID token
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: signedJwt,
    }),
  });
  const { id_token } = await res.json() as { id_token: string };
  return id_token;
}

// Call private Cloud Run
const idToken = await getIdentityToken(env, 'https://my-service-xyz-ew.a.run.app');
const result = await fetch('https://my-service-xyz-ew.a.run.app/api/process', {
  method: 'POST',
  headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ input: 'hello' }),
});
```

### Custom domain

```bash
# Map your domain (requires DNS verification)
gcloud run domain-mappings create \
  --service my-service \
  --domain api.example.com \
  --region africa-south1

# Returns DNS records (A/AAAA or CNAME) to add at your registrar or Cloudflare
```

For Cloudflare-fronted custom domains, set Cloudflare DNS to "DNS only" (grey cloud) during verification, then re-enable proxy.

---

## Cloud Functions v2

Cloud Functions v2 is a thin wrapper over Cloud Run — same scaling, same container, but the platform builds the container for you from a source function. Use it when you want zero Dockerfile boilerplate for a single event handler.

```bash
# HTTP function
gcloud functions deploy my-webhook \
  --gen2 --runtime nodejs20 \
  --region africa-south1 \
  --trigger-http --allow-unauthenticated \
  --entry-point handler \
  --source .

# Pub/Sub trigger
gcloud functions deploy on-event \
  --gen2 --runtime nodejs20 \
  --region africa-south1 \
  --trigger-topic my-topic \
  --entry-point onEvent \
  --source .

# GCS object-created trigger
gcloud functions deploy on-upload \
  --gen2 --runtime nodejs20 \
  --region africa-south1 \
  --trigger-bucket my-bucket \
  --entry-point onUpload \
  --source .
```

```typescript
// index.ts
import { http, cloudEvent } from '@google-cloud/functions-framework';

http('handler', (req, res) => {
  res.json({ ok: true, body: req.body });
});

cloudEvent('onEvent', (event) => {
  const data = Buffer.from(event.data.message.data, 'base64').toString();
  console.log('Pub/Sub:', JSON.parse(data));
});
```

**When to use Functions over Cloud Run**: a one-file glue handler with no build pipeline. **When to skip Functions**: anything with dependencies, multi-route, or that benefits from a Dockerfile — Cloud Run direct is cleaner and the same runtime.

---

## GKE

GKE runs Kubernetes. Pick the mode first:

| Mode | Control over nodes | Billing | Best for |
|------|-------------------|---------|---------|
| **Autopilot** | None — Google manages | Per pod vCPU/mem + cluster fee | Default — ops-light K8s |
| **Standard** | Full — you pick VMs | Node VMs + cluster fee | DaemonSets, GPU pools, custom kernels |

### Autopilot cluster

```bash
gcloud container clusters create-auto my-cluster \
  --region africa-south1 \
  --release-channel regular

# Get kubeconfig
gcloud container clusters get-credentials my-cluster --region africa-south1

# Deploy
kubectl apply -f deployment.yaml
```

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-service
spec:
  replicas: 3
  selector: { matchLabels: { app: my-service } }
  template:
    metadata: { labels: { app: my-service } }
    spec:
      serviceAccountName: my-service-ksa   # bound to GCP SA via Workload Identity
      containers:
        - name: app
          image: europe-west2-docker.pkg.dev/my-app-prod/my-repo/my-service:v1
          ports: [{ containerPort: 3000 }]
          resources:
            requests: { cpu: 250m, memory: 512Mi }
            limits:   { cpu: 500m, memory: 1Gi }
          readinessProbe:
            httpGet: { path: /health, port: 3000 }
---
apiVersion: v1
kind: Service
metadata: { name: my-service }
spec:
  type: LoadBalancer
  selector: { app: my-service }
  ports: [{ port: 80, targetPort: 3000 }]
```

### Workload Identity (GKE pod → GCP service account)

```bash
# Bind Kubernetes SA (KSA) to GCP SA (GSA) — no JSON keys in the pod
gcloud iam service-accounts add-iam-policy-binding \
  my-service-gsa@my-app-prod.iam.gserviceaccount.com \
  --role roles/iam.workloadIdentityUser \
  --member "serviceAccount:my-app-prod.svc.id.goog[default/my-service-ksa]"

kubectl annotate serviceaccount my-service-ksa \
  iam.gke.io/gcp-service-account=my-service-gsa@my-app-prod.iam.gserviceaccount.com
```

Now pods running as `my-service-ksa` get GCP-scoped tokens automatically via the metadata server. No key files in the container.

---

## Compute Engine (VMs)

Use GCE when you need persistent VMs: legacy workloads that don't containerise, GPU/TPU specialisation, or very high-utilisation steady-state where committed-use discounts beat Cloud Run.

```bash
# Create a small always-on VM
gcloud compute instances create my-vm \
  --machine-type e2-small \
  --zone africa-south1-a \
  --image-family debian-12 --image-project debian-cloud \
  --boot-disk-size 20GB --boot-disk-type pd-balanced \
  --service-account my-vm-sa@my-app-prod.iam.gserviceaccount.com \
  --scopes cloud-platform \
  --tags http-server \
  --metadata-from-file startup-script=startup.sh

# SSH via IAP (no external IP needed, no firewall rule for port 22)
gcloud compute ssh my-vm --zone africa-south1-a --tunnel-through-iap
```

### Machine families (when to pick what)

| Family | Example | Best for |
|--------|--------|---------|
| **E2** | e2-small, e2-medium | Cheap general purpose, dev/test |
| **N2** | n2-standard-4 | Balanced production workloads |
| **T2D** | t2d-standard-4 | AMD EPYC, best price/perf general |
| **C3** | c3-highcpu-8 | Compute-bound, Intel Sapphire Rapids |
| **C2D** | c2d-standard-8 | Compute-bound, AMD |
| **M2/M3** | m3-ultramem | In-memory databases, SAP HANA |
| **A3/G2** | a3-highgpu-8g | GPU (H100/L4) — ML training, video |

### Preemptible / Spot VMs (cheap, interruptible)

```bash
gcloud compute instances create my-batch-vm \
  --machine-type n2-standard-4 \
  --zone africa-south1-a \
  --provisioning-model SPOT \
  --instance-termination-action STOP
```

Up to 60–91% off on-demand. Google can preempt with 30s notice.

### Managed Instance Groups (auto-scaling fleet)

```bash
# Instance template
gcloud compute instance-templates create my-template \
  --machine-type n2-standard-2 \
  --image-family debian-12 --image-project debian-cloud \
  --metadata-from-file startup-script=startup.sh \
  --tags http-server

# Regional MIG with auto-scaling
gcloud compute instance-groups managed create my-mig \
  --base-instance-name my-app --region africa-south1 \
  --template my-template --size 2

gcloud compute instance-groups managed set-autoscaling my-mig \
  --region africa-south1 \
  --max-num-replicas 10 --min-num-replicas 2 \
  --target-cpu-utilization 0.6 --cool-down-period 90
```

---

## Cost model (approximate, africa-south1)

### Cloud Run

| Component | Price |
|-----------|-------|
| vCPU | ~$0.000024 / vCPU-second (tier 1) |
| Memory | ~$0.0000025 / GB-second |
| Requests | $0.40 / million |
| Free tier | 2M requests + 180k vCPU-s + 360k GB-s / month |

Example: 10M req/month, 512MB, avg 200ms, concurrency 80 → ~**$25–40/month**.

### GKE

| Component | Price |
|-----------|-------|
| Control plane | $0.10/hr (regional) per cluster ≈ **$73/mo** |
| Autopilot vCPU | ~$0.0445 / vCPU-hour |
| Autopilot memory | ~$0.0049 / GB-hour |
| Standard (node VMs) | Per GCE instance pricing |

One Autopilot pod at 250m CPU + 512Mi ≈ **$10/month** plus the $73 control-plane fee. GKE only makes sense from ~5+ services or when you need K8s specifically.

### Compute Engine (approximate, on-demand)

| Type | vCPU | RAM | $/hr | $/mo |
|------|------|-----|------|------|
| e2-small | 2 (shared) | 2GB | ~$0.017 | ~$12 |
| e2-medium | 2 (shared) | 4GB | ~$0.034 | ~$25 |
| n2-standard-2 | 2 | 8GB | ~$0.098 | ~$72 |
| n2-standard-4 | 4 | 16GB | ~$0.195 | ~$142 |
| c3-highcpu-8 | 8 | 16GB | ~$0.320 | ~$234 |

Committed-use discounts: 1-year = ~25% off, 3-year = ~52% off. Spot: up to ~91% off.

`africa-south1` is typically 5–15% more expensive than `us-central1`. Weigh the data-residency benefit against the premium.

---

## Gotchas

- **Cloud Run CPU allocation default**: CPU is only allocated during request processing. Background `setTimeout`/workers stall between requests. Set `--no-cpu-throttling` if your app does post-response work.
- **Cloud Run cold starts on min-instances=0**: 100–500ms for Node, 2–5s for JVM. Use `--min-instances 1` for latency-critical paths (billed 24/7 at idle CPU).
- **Concurrency misconfig is the #1 cost overshoot**: Default 80 is fine for I/O-bound Node. CPU-bound workloads (image resize, PDF) must drop to 1–5 or instances multiply and vCPU-seconds explode.
- **Port is `$PORT`, not 3000**: Cloud Run injects `PORT=8080` but expects your app to read the env var. Hardcoding any other port = endless cold-start failures.
- **Cloud Functions v2 ≠ v1**: V2 runs on Cloud Run; v1 is legacy and limited. Always `--gen2` for new work.
- **GKE Autopilot denies privileged pods**: Any DaemonSet or SecurityContext requiring `privileged: true` / `hostNetwork: true` won't schedule. Use Standard for those.
- **Workload Identity annotation order**: The `gcloud iam ... add-iam-policy-binding` must happen BEFORE `kubectl annotate` or tokens won't be issued. Both-ways breakage is silent — pods get no credentials, calls fail with ambiguous 403.
- **`gcloud run deploy --source .`**: Invisibly enables Cloud Build + Artifact Registry + grants Cloud Build's SA the roles it needs. First-run permission failures are cryptic — check [cloudbuild.googleapis.com] and the Cloud Build SA's IAM.
- **africa-south1 GCE disk types**: `pd-extreme` and local SSD availability varies by zone. Prefer `pd-balanced` for general VMs, `pd-ssd` for latency-sensitive databases.
- **Egress from africa-south1**: Same-continent egress is billed; cross-continent egress is expensive. If traffic is SA-served but compute runs in `europe-west2` as a fallback, design for bursty sync-back to `africa-south1` via Pub/Sub or scheduled Dataflow, not per-request.

## See Also

- [GCP parent](../SKILL.md)
- [Vertex AI — run inference next to your compute](../ai/SKILL.md)
- [BigQuery + Pub/Sub](../data/SKILL.md)
- [AWS compute (Lambda/ECS/EC2)](../../../aws/compute/SKILL.md)
- [Cloudflare Workers (the edge tier)](../../../cloudflare/workers/SKILL.md)
