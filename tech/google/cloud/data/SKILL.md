---
name: tech/google/cloud/data
description: |
  GCP data platform skill. Use when: (1) querying or loading data in BigQuery — serverless analytics, per-TB on-demand or capacity,
  (2) publishing / subscribing to Pub/Sub topics — push + pull, exactly-once, filters, dead-letter,
  (3) building streaming or batch pipelines in Dataflow (Apache Beam) — template jobs, Flex Templates,
  (4) streaming changes from Firestore/Cloud SQL into BigQuery via Datastream or CDC,
  (5) orchestrating with Cloud Scheduler → Pub/Sub → Cloud Run / Dataflow.
license: MIT
compatibility: BigQuery standard SQL + BigQuery ML, Pub/Sub v1, Dataflow (Apache Beam 2.50+)
homepage: https://skills.2nth.ai/tech/google/cloud/data
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
  categories: "GCP, BigQuery, Pub/Sub, Dataflow, Streaming, Analytics, ETL, CDC"
allowed-tools: Bash(gcloud:*) Bash(bq:*) Bash(gsutil:*) Read Write Edit Glob Grep
---

# BigQuery, Pub/Sub, Dataflow

The GCP data trio that covers analytics, messaging, and pipelines:

- **BigQuery** — serverless columnar analytics. Sub-second on billions of rows. Pay per TB scanned (on-demand) or per slot-hour (capacity). Primary warehouse for the 2nth.ai token economy tables, client activity, and Penny analytics.
- **Pub/Sub** — global managed message bus. At-least-once (pull/push) or exactly-once (pull with ordering keys). Replacement for Kafka for most use cases.
- **Dataflow** — managed Apache Beam for batch + streaming pipelines. Google templates handle GCS→BigQuery, Pub/Sub→BigQuery, Datastream CDC without custom code.

---

## BigQuery

### Create dataset + table

```bash
# Dataset (choose location carefully — queries must match dataset region)
bq --location=africa-south1 mk --dataset \
  --description "Production analytics" \
  my-app-prod:analytics

# Table with schema + partitioning + clustering
bq mk --table \
  --time_partitioning_field event_time \
  --time_partitioning_type DAY \
  --clustering_fields client_id,event_type \
  --require_partition_filter \
  my-app-prod:analytics.events \
  client_id:STRING,event_type:STRING,event_time:TIMESTAMP,properties:JSON,ip:STRING
```

**Partitioning + clustering is the #1 cost lever.** `--require_partition_filter` blocks full-table scans by forcing every query to include `WHERE event_time BETWEEN ...` — a cheap guardrail against accidental multi-TB queries.

### Query

```bash
# CLI
bq query --use_legacy_sql=false \
  'SELECT client_id, COUNT(*) c FROM `my-app-prod.analytics.events`
   WHERE event_time BETWEEN "2026-04-01" AND "2026-04-19"
     AND event_type = "skill_invoked"
   GROUP BY client_id ORDER BY c DESC LIMIT 10'

# Dry-run to see bytes-will-scan BEFORE paying
bq query --dry_run --use_legacy_sql=false 'SELECT * FROM `my-app-prod.analytics.events`'
# Query successfully validated. Assuming the tables are not modified,
# running this query will process 12.8 TB of data.
```

### Node SDK

```typescript
import { BigQuery } from '@google-cloud/bigquery';

const bq = new BigQuery({ projectId: 'my-app-prod' });

// Parameterised query (always — never template literals)
const [rows] = await bq.query({
  query: `
    SELECT event_type, COUNT(*) AS c
    FROM \`my-app-prod.analytics.events\`
    WHERE event_time BETWEEN @start AND @end
      AND client_id = @clientId
    GROUP BY event_type
    ORDER BY c DESC
  `,
  params: { start: '2026-04-01', end: '2026-04-19', clientId: '2n-014' },
  location: 'africa-south1',
});
```

### Streaming inserts (realtime)

```typescript
const table = bq.dataset('analytics').table('events');

await table.insert([
  {
    client_id: '2n-014',
    event_type: 'skill_invoked',
    event_time: new Date().toISOString(),
    properties: { skill: 'penny-briefing', duration_ms: 420 },
  },
], { raw: false });
```

Streaming inserts have no free tier (~$0.01/200MB). For high-volume events, prefer **Storage Write API** (BigQuery's newer, cheaper streaming endpoint) or **Pub/Sub → BigQuery direct subscription** (zero-ETL).

### Pub/Sub → BigQuery subscription (zero-ETL)

```bash
# One-time setup: grant the Pub/Sub service account BQ writer
PROJECT_NUMBER=$(gcloud projects describe my-app-prod --format="value(projectNumber)")
bq add-iam-policy-binding \
  --member "serviceAccount:service-${PROJECT_NUMBER}@gcp-sa-pubsub.iam.gserviceaccount.com" \
  --role "roles/bigquery.dataEditor" \
  my-app-prod:analytics

# Create a subscription that writes directly to the table
gcloud pubsub subscriptions create events-to-bq \
  --topic events \
  --bigquery-table=my-app-prod:analytics.events \
  --use-topic-schema --drop-unknown-fields
```

No Dataflow, no Cloud Function, no code. Messages published to the topic land in the table in seconds.

### Materialised views + scheduled queries

```sql
-- Materialised view auto-refreshes as base table gets new partitions
CREATE MATERIALIZED VIEW `my-app-prod.analytics.daily_event_counts`
PARTITION BY DATE(event_day)
CLUSTER BY client_id
AS
SELECT
  DATE(event_time) AS event_day,
  client_id,
  event_type,
  COUNT(*) AS c
FROM `my-app-prod.analytics.events`
GROUP BY 1, 2, 3;
```

```bash
# Scheduled daily rollup (replaces a nightly ETL job)
bq query \
  --use_legacy_sql=false \
  --destination_table my-app-prod:analytics.daily_rollup \
  --schedule="every day 03:00" \
  --time_partitioning_field event_day \
  --time_partitioning_type DAY \
  --replace=false \
  --display_name "daily-rollup" \
  'SELECT DATE(event_time) AS event_day, client_id, COUNT(*) c
   FROM `my-app-prod.analytics.events`
   WHERE event_time = TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY))
   GROUP BY 1, 2'
```

### BigQuery ML (SQL-native models)

```sql
-- Train a simple churn model in SQL
CREATE OR REPLACE MODEL `analytics.churn_predictor`
OPTIONS(model_type='LOGISTIC_REG', input_label_cols=['churned']) AS
SELECT
  sessions_last_7d,
  skill_invocations_last_30d,
  days_since_signup,
  churned
FROM `analytics.churn_training`;

-- Predict
SELECT *
FROM ML.PREDICT(MODEL `analytics.churn_predictor`,
  (SELECT client_id, sessions_last_7d, skill_invocations_last_30d, days_since_signup
   FROM `analytics.clients_live`));
```

BQML supports logistic/linear regression, k-means, matrix factorisation, ARIMA+, and XGBoost. For anything heavier, export to Vertex AI.

---

## Pub/Sub

### Topic + subscription

```bash
# Create topic
gcloud pubsub topics create events

# Pull subscription (consumer pulls — default, most flexible)
gcloud pubsub subscriptions create events-worker \
  --topic events \
  --ack-deadline 60 \
  --message-retention-duration 7d

# Push subscription (Pub/Sub POSTs to your HTTPS endpoint — Cloud Run / Functions)
gcloud pubsub subscriptions create events-to-cloudrun \
  --topic events \
  --push-endpoint https://my-consumer-xyz-ew.a.run.app/events \
  --push-auth-service-account pubsub-invoker@my-app-prod.iam.gserviceaccount.com \
  --ack-deadline 60 \
  --dead-letter-topic events-dlq \
  --max-delivery-attempts 5
```

### Publish (Node)

```typescript
import { PubSub } from '@google-cloud/pubsub';

const ps = new PubSub({ projectId: 'my-app-prod' });
const topic = ps.topic('events', {
  batching: { maxMessages: 100, maxMilliseconds: 100 },   // batch for throughput
});

await topic.publishMessage({
  json: { clientId: '2n-014', type: 'skill_invoked', at: new Date().toISOString() },
  attributes: { source: 'penny', version: '1' },
  orderingKey: '2n-014',     // only if subscription has enableMessageOrdering
});
```

### Pull consumer (Node)

```typescript
const sub = ps.subscription('events-worker', {
  flowControl: { maxMessages: 50 },
  enableExactlyOnceDelivery: true,
});

sub.on('message', async (message) => {
  try {
    const payload = JSON.parse(message.data.toString());
    await handle(payload);
    message.ack();
  } catch (err) {
    // With EOD enabled, nack() tells Pub/Sub to redeliver (or DLQ after max-attempts)
    message.nack();
  }
});

sub.on('error', (err) => console.error('sub error', err));
```

### Push consumer (Cloud Run)

```typescript
// Pub/Sub POSTs this JSON body — verify the Bearer token is from your push SA
app.post('/events', async (req, res) => {
  // Optional: verify req.headers.authorization contains a valid Google OIDC token
  const { message } = req.body as { message: { data: string; attributes: Record<string, string> } };
  const payload = JSON.parse(Buffer.from(message.data, 'base64').toString());
  await handle(payload);
  res.status(200).send();    // 200 ACKs, any other status triggers redelivery
});
```

### Filters & dead-letter

```bash
# Subscription-level filter — only receive messages matching an attribute expression
gcloud pubsub subscriptions create high-value-events \
  --topic events \
  --message-filter='attributes.priority = "high" AND attributes.source != "test"'

# Dead-letter topic catches permanently-failing messages after N attempts
gcloud pubsub topics create events-dlq
gcloud pubsub subscriptions update events-worker \
  --dead-letter-topic events-dlq \
  --max-delivery-attempts 5
```

---

## Dataflow

Dataflow runs Apache Beam pipelines — batch or streaming — on managed workers that auto-scale. Use when:
- Volumes exceed what Cloud Run/Functions can handle (millions of events/min).
- You need exactly-once semantics + windowing.
- The pipeline is complex (multi-stage, joins, watermarks).

### Google-provided templates (no code)

Most common patterns already exist as templates — just run one:

```bash
# Pub/Sub → BigQuery (streaming)
gcloud dataflow jobs run pubsub-to-bq-events \
  --gcs-location gs://dataflow-templates/latest/PubSub_to_BigQuery \
  --region africa-south1 \
  --staging-location gs://my-dataflow-staging/staging \
  --parameters "inputTopic=projects/my-app-prod/topics/events,outputTableSpec=my-app-prod:analytics.events"

# GCS → BigQuery (batch)
gcloud dataflow jobs run gcs-to-bq-import \
  --gcs-location gs://dataflow-templates/latest/GCS_Text_to_BigQuery \
  --region africa-south1 \
  --parameters "inputFilePattern=gs://my-raw/events/*.json,JSONPath=gs://my-config/schema.json,outputTable=my-app-prod:analytics.events,javascriptTextTransformGcsPath=gs://my-config/udf.js,javascriptTextTransformFunctionName=transform"
```

### Flex Template (custom Beam pipeline)

```python
# pipeline.py — Python Beam pipeline
import apache_beam as beam
from apache_beam.options.pipeline_options import PipelineOptions

def parse_event(line):
    import json
    return json.loads(line)

def run():
    opts = PipelineOptions(
        streaming=True,
        project='my-app-prod',
        region='africa-south1',
        runner='DataflowRunner',
        temp_location='gs://my-dataflow-staging/temp',
    )
    with beam.Pipeline(options=opts) as p:
        (p
         | 'Read'   >> beam.io.ReadFromPubSub(topic='projects/my-app-prod/topics/events')
         | 'Parse'  >> beam.Map(parse_event)
         | 'Enrich' >> beam.Map(lambda e: {**e, 'ingested_at': __import__('datetime').datetime.utcnow().isoformat()})
         | 'Write'  >> beam.io.WriteToBigQuery(
               'my-app-prod:analytics.events',
               schema='client_id:STRING,event_type:STRING,event_time:TIMESTAMP,properties:JSON,ingested_at:TIMESTAMP',
               write_disposition=beam.io.BigQueryDisposition.WRITE_APPEND))

if __name__ == '__main__':
    run()
```

Packaging + running is a multi-step process — lean on templates first.

---

## Datastream + CDC (Cloud SQL / Postgres → BigQuery)

For ops databases that need to flow into analytics without custom ETL:

```bash
# Create connection profiles (source = Cloud SQL logical replication, target = BQ)
gcloud datastream connection-profiles create source-cloudsql \
  --location africa-south1 --type postgresql ...

# Create stream — mirrors selected schemas/tables into BQ in near-real-time
gcloud datastream streams create orders-to-bq \
  --location africa-south1 \
  --source source-cloudsql --source-config source.json \
  --destination bq-target   --destination-config bq.json
```

CDC-landed tables in BigQuery get `_metadata_*` columns (source offset, operation type INSERT/UPDATE/DELETE, timestamp). Build analytics views on top.

---

## Cost model

### BigQuery

| Plan | Price |
|------|-------|
| On-demand query | ~$5/TB scanned (us), ~$6.25/TB (eu, africa-south1) |
| Capacity (Editions) | ~$0.04/slot-hour (Standard), ~$0.06 (Enterprise) — min 100 slots |
| Active storage | ~$0.02/GB/month |
| Long-term storage (>90d unchanged) | ~$0.01/GB/month (automatic 50% off) |
| Streaming inserts | ~$0.01 / 200MB (avoid — use Storage Write API or Pub/Sub sub) |

A single analyst running `SELECT * FROM big_table` on a 5TB table costs ~$30. Partition filters + column selection + clustering commonly cut that by 90%+.

### Pub/Sub

| Component | Price |
|-----------|-------|
| Throughput | ~$40/TB ingress or egress, first 10GB/month free |
| Message storage | ~$0.27/GB-month (after default 1-day retention) |
| Seek (time-based) | additional storage cost |

Typical event volumes (millions/day, small JSON) cost pennies. Dashboards with replayable event history are the main cost driver.

### Dataflow

| Component | Price |
|-----------|-------|
| vCPU | ~$0.056/vCPU-hour (batch), ~$0.069 (streaming) |
| Memory | ~$0.0035/GB-hour |
| Persistent disk | ~$0.00005/GB-hour |
| Streaming Engine | +~$0.018/GB shuffled |

Streaming Dataflow jobs run 24/7 — always consider whether a Pub/Sub → BigQuery subscription replaces the pipeline.

---

## Gotchas

- **`SELECT *` is expensive**: BQ scans every column you select. Always name columns. A 1TB table with 50 columns averages ~20GB per column — `SELECT col` is 50x cheaper than `SELECT *`.
- **Region lock**: A BigQuery dataset has a location. Queries can only join tables in the same location. Cross-region joins require a copy. Pick `africa-south1` or `EU` early — hard to move later.
- **`require_partition_filter` saves you**: Turning it on at table creation blocks all partition-full-scans. Makes every query either work quickly + cheaply or fail loudly — much better than silent 10TB scans.
- **Streaming inserts have no dedup**: Use `insertId` on each row OR prefer the Storage Write API (exactly-once committed mode) for dedup.
- **Pub/Sub "exactly-once" ≠ free**: `enableExactlyOnceDelivery` is pull-only and introduces its own ack semantics (`ack()` returns a promise that resolves only after Pub/Sub confirms). Non-trivial to refactor to.
- **Pub/Sub ordering + parallelism tradeoff**: With an `orderingKey`, messages per key are serial. Parallelism comes from many keys. One hot key = one worker = no scale-out.
- **Push subscription ack deadline**: Default 10s, max 600s. If your handler is slow, raise `ack-deadline` OR return 202 and process async + explicit `modifyAckDeadline` calls.
- **Dataflow costs surprise**: A "small streaming job" running 24/7 at min 2 workers ≈ $150/month minimum. Always check whether a Pub/Sub → BQ subscription or a Cloud Run worker handles the volume.
- **BQ scheduled queries run as a user or SA**: If the author leaves and their account is deactivated, queries silently stop. Create scheduled queries under a service account you control.
- **`bq cp` is free cross-region within same continent**: Useful for disaster recovery. Cross-continent `bq cp` costs standard egress.

## See Also

- [Cloud Run — Pub/Sub push consumers](../compute/SKILL.md)
- [Vertex AI — use BQ as a Gemini grounding source](../ai/SKILL.md)
- [GCP parent for IAM + regions](../SKILL.md)
