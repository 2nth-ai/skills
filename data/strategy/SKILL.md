---
name: Data Strategy
description: >
  Building a data strategy — capability assessment, data product road-map, platform
  architecture decisions, team structure, and measuring data ROI.
improves: []
metadata:
  domain: data
  subdomain: strategy
  maturity: stable
---

# Data Strategy

Most companies have data. Few have a data strategy. The difference is whether your data assets are deliberately designed to create value or simply accumulate as a by-product of operations.

## The Three Questions Every Data Strategy Must Answer

1. **What decisions do we need data to improve?** — Start with the decision, not the data.
2. **What data assets do we need to build or acquire to improve those decisions?** — Identify gaps.
3. **What capabilities (people, platforms, processes) do we need to produce and consume those assets?** — Close the gaps in order of ROI.

---

## Data Maturity Model

Assess current state before setting direction.

| Stage | Characteristics | Typical Pain |
|-------|----------------|--------------|
| **1 — Reactive** | Reports pulled manually; Excel is the data warehouse | Leadership asks the same questions weekly and gets different answers |
| **2 — Descriptive** | A BI tool exists; dashboards show what happened | Data is siloed; no single source of truth |
| **3 — Diagnostic** | Can answer "why did this happen?"; data warehouse operational | Analysts spend 80% of time cleaning data |
| **4 — Predictive** | ML models in production; proactive alerting | Model decay goes undetected; no MLOps process |
| **5 — Prescriptive** | Systems act on predictions automatically | Governance and ethics lag the capability |

**Tool**: Score each business function 1–5. The average is your maturity level. The lowest-scoring function is where the business is most exposed.

---

## Data Product Road-Map

A data product is a dataset, model, or application that is actively maintained and delivers measurable business value. Structure your road-map around products, not projects.

### Prioritisation Framework

Score each potential data product on:
- **Decision value** (1–5): How important is the decision this improves?
- **Data availability** (1–5): How accessible is the underlying data?
- **Build complexity** (1–5, inverse): How hard is it to build? (5 = easiest)
- **Time to value** (1–5, inverse): How fast can we ship? (5 = fastest)

Priority score = (Decision value × 2) + Data availability + Build complexity + Time to value

Ship highest-scoring products first.

---

## Platform Architecture Decisions

### Data Warehouse vs Data Lake vs Lakehouse

| Pattern | Best For | Avoid When |
|---------|----------|-----------|
| **Warehouse** (BigQuery, Snowflake, Redshift) | Structured data; SQL-first analytics; fast BI | Unstructured data (images, text); very high volume raw storage cost |
| **Data Lake** (S3 + Glue, Azure Data Lake) | Unstructured/semi-structured; cheap raw storage; ML workloads | Business users need direct SQL access without transformation |
| **Lakehouse** (Databricks, Delta Lake, Apache Iceberg) | Both worlds; ACID transactions on lake; streaming + batch | Small teams — operational complexity is high |

**Default recommendation for SMBs**: Start with a managed data warehouse (BigQuery or Snowflake). Add a lake layer only when you have a specific use case that justifies the complexity.

### The Modern Data Stack (MDS)

```
Sources → Ingestion → Storage → Transformation → Serving → Consumption
  CRMs      Fivetran    BigQuery     dbt            dbt         Looker
  ERPs      Airbyte     Snowflake    SQLMesh        Metrics     Metabase
  APIs      Stitch                                 Layer       Streamlit
  Events    Kafka
```

---

## Team Structure

### Data Team Archetypes

**Centralised**: One data team serves all business units. Pros: consistency, no duplication. Cons: bottleneck; teams compete for capacity.

**Embedded**: Data people sit inside each business unit. Pros: domain context; fast iteration. Cons: inconsistent tooling; quality varies.

**Hub-and-Spoke (recommended for growth-stage)**: A central data platform team (infrastructure, governance, standards) + embedded analysts in each business unit. Platform team owns the warehouse and dbt project; embedded analysts own business-unit reporting.

### Hiring Order

1. **Analytics Engineer** first — transforms raw data into reliable models that everyone can query.
2. **Data Analyst** second — turns models into insights and dashboards.
3. **Data Scientist** third — builds predictive models once the analytical foundation is solid.
4. **Data Engineer** fourth (or contractor from the start) — builds ingestion pipelines.
5. **ML Engineer** fifth — productionises models at scale.

Do not hire a Data Scientist before you have clean, trusted data. Models built on unreliable data destroy trust faster than no model at all.

---

## Measuring Data ROI

Data teams struggle to demonstrate value because their output is a capability, not a product. Use these proxies:

| Metric | What It Measures |
|--------|----------------|
| Decision cycle time | How long from question to answer? Target: < 1 day for tier-1 questions |
| Report automation rate | % of recurring reports that are fully automated |
| Data coverage | % of key business KPIs with a trusted, automated data source |
| Model uptime | % of time production ML models are serving predictions |
| Data incident rate | Number of data quality incidents per month (target: declining) |

Present these in a quarterly data team review alongside the business decisions your work influenced.
