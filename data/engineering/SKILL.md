---
name: Data Engineering
description: >
  Data pipeline design, ETL/ELT patterns, data warehouse modelling, streaming
  vs batch, orchestration, and data quality in production pipelines.
requires:
  - data/strategy
improves: []
metadata:
  domain: data
  subdomain: engineering
  maturity: stable
---

# Data Engineering

Data engineering is the infrastructure discipline of data. Data engineers build and maintain the pipelines that move data from sources to destinations reliably, at scale, and in a form that analysts and data scientists can use.

## ETL vs ELT

| Pattern | Flow | When to Use |
|---------|------|------------|
| **ETL** (Extract → Transform → Load) | Transform before loading | Legacy warehouses with limited compute; sensitive data that must be masked before storage |
| **ELT** (Extract → Load → Transform) | Load raw, transform in the warehouse | Modern cloud warehouses (BigQuery, Snowflake); preferred for flexibility and reprocessability |

**Default**: Use ELT. Load raw data first. You can always re-transform. You cannot re-extract what you never stored.

---

## Pipeline Architecture

### Batch vs Streaming

| Type | Latency | Complexity | Use Case |
|------|---------|------------|----------|
| **Batch** | Hours to daily | Low | Nightly financial reports; daily ML feature refresh |
| **Micro-batch** | Minutes | Medium | Near-real-time dashboards; Spark Structured Streaming |
| **Streaming** | Seconds | High | Fraud detection; real-time recommendations; event-driven ML |

Start batch. Move to streaming only when the business has a specific latency requirement that batch cannot meet.

### Ingestion Tools

| Tool | Type | Best For |
|------|------|---------|
| **Fivetran** | Managed connectors | Fast time-to-value; 300+ connectors; SaaS sources (Salesforce, Stripe, HubSpot) |
| **Airbyte** | Open-source + cloud | Custom connectors; on-premise sources; cost control at scale |
| **Stitch** | Managed | Budget-conscious teams; simpler source sets |
| **Kafka + Debezium** | CDC streaming | Real-time database replication; event streaming |
| **dlt (data load tool)** | Python library | Code-first pipelines; flexible schema handling |

---

## Data Warehouse Modelling

### Kimball Dimensional Modelling

The dominant pattern for analytical warehouses.

**Fact tables**: Measurements of business events (sales transactions, page views, API calls). Contain numeric measures + foreign keys to dimensions.

**Dimension tables**: Descriptive context for facts (customer, product, date, geography). Contain attributes used for filtering and grouping.

**Star schema**: One fact table surrounded by denormalised dimension tables. Fast query performance; easy for analysts.

### dbt — the Analytics Engineer's Tool

dbt (data build tool) transforms raw data in the warehouse using SQL SELECT statements. It handles:
- Dependency resolution (runs models in the right order)
- Documentation (auto-generated data catalog from YAML)
- Testing (not-null, unique, accepted-values, referential integrity)
- Incremental materialisation (process only new/changed rows)

```sql
-- models/marts/core/fct_orders.sql
{{ config(materialized='incremental', unique_key='order_id') }}

SELECT
    o.order_id,
    o.customer_id,
    o.order_date,
    o.total_amount,
    c.customer_segment,
    c.country_code
FROM {{ ref('stg_orders') }} o
LEFT JOIN {{ ref('dim_customers') }} c USING (customer_id)

{% if is_incremental() %}
WHERE o.order_date >= (SELECT MAX(order_date) FROM {{ this }})
{% endif %}
```

**Layer structure**:
```
sources/         Raw source tables (never modified)
staging/         1:1 with source tables; light cleaning; snake_case
intermediate/    Business logic; joins across domains
marts/           Presentation layer; business-unit-specific models
```

---

## Orchestration

| Tool | Type | Best For |
|------|------|---------|
| **Airflow** | Open-source | Mature; large community; Python DAGs; complex dependencies |
| **Dagster** | Open-source | Software-defined assets; better observability than Airflow |
| **Prefect** | Open-source + cloud | Simpler than Airflow; good for small/medium teams |
| **dbt Cloud** | Managed | dbt-native scheduling; good enough for ELT-only pipelines |
| **GitHub Actions** | CI/CD | Lightweight; good for triggered pipelines (event-driven) |

**South African context**: All three major cloud providers (AWS, Azure, GCP) have data centre regions in South Africa (Johannesburg). For POPIA compliance, ensure data residency is configured to keep personal information in-country.

---

## Data Quality in Pipelines

### The Three Guarantees

1. **Freshness**: Data arrived when expected. Alert if pipeline is late by >N minutes/hours.
2. **Completeness**: Expected row counts and non-null rates met. Alert on anomalous drops.
3. **Accuracy**: Values are in expected ranges and match known truths (cross-system reconciliation).

### Testing in dbt

```yaml
# models/staging/schema.yml
models:
  - name: stg_customers
    columns:
      - name: customer_id
        tests:
          - not_null
          - unique
      - name: email
        tests:
          - not_null
      - name: country_code
        tests:
          - accepted_values:
              values: ['ZA', 'NG', 'KE', 'US', 'GB']
```

### Great Expectations / Soda

For more sophisticated data quality beyond dbt tests:
- Expectation suites define what "good data" looks like
- Run against incoming data before it enters the warehouse
- Alert or block pipeline on failure

---

## Pipeline Design Principles

1. **Idempotency**: Running a pipeline twice should produce the same result as running it once. Never append without deduplication logic.
2. **Reprocessability**: Store raw data. You must be able to reprocess from scratch if transformation logic changes.
3. **Observability**: Every pipeline should emit run logs, row counts, and latency metrics. Silence is not success.
4. **Least privilege**: Pipeline credentials should have read access on sources and write access only to their destination schema — nothing else.
5. **Schema evolution**: Design for upstream schema changes. Use schema contracts or alerting when source schemas change unexpectedly.
