---
name: Data Governance
description: >
  Data quality management, data cataloguing, data lineage, access controls,
  and POPIA-compliant data handling for South African organisations.
requires:
  - data/strategy
improves: []
metadata:
  domain: data
  subdomain: governance
  maturity: stable
---

# Data Governance

Data governance is the system of policies, roles, and processes that ensure data is accurate, accessible, consistent, and used responsibly. Without governance, data assets degrade — the warehouse fills with tables nobody trusts, analysts spend half their time debating which number is correct, and compliance exposure accumulates silently.

## The Four Governance Pillars

| Pillar | Question It Answers |
|--------|-------------------|
| **Quality** | Can we trust this data? |
| **Cataloguing** | Can we find and understand this data? |
| **Access control** | Who can see and use this data? |
| **Privacy & compliance** | Are we handling personal data lawfully? |

---

## Data Quality

### Dimensions of Data Quality

| Dimension | Definition | Measurement |
|-----------|-----------|-------------|
| **Completeness** | Are expected values present? | % of non-null values per field |
| **Accuracy** | Does the data reflect reality? | Reconciliation against source systems or known truths |
| **Consistency** | Is data consistent across systems? | Cross-system record matching |
| **Timeliness** | Is data available when needed? | Pipeline SLA tracking — how often does data arrive late? |
| **Uniqueness** | Are records deduplicated? | Duplicate rate on primary keys |
| **Validity** | Are values within acceptable ranges and formats? | Schema validation, domain constraints |

### Data Quality SLA

Define explicit agreements for each critical data asset:

```yaml
# data quality SLA — fct_orders
owner: analytics-team
freshness: data must arrive by 06:00 SAST daily
row_count: minimum 1000 rows per day (flag if below)
critical_columns:
  - order_id: must be unique and not null
  - order_date: must be within last 90 days
  - total_amount: must be > 0
  - customer_id: must reference a valid customer
```

### Data Observability

Modern data observability tools (Monte Carlo, Bigeye, Soda, dbt tests + Metaplane) monitor tables continuously for:
- Volume anomalies (sudden drops or spikes)
- Schema changes (columns added, removed, renamed)
- Distribution shifts (statistical change in field values)
- Freshness SLA breaches

Alert routing: Data quality alerts go to the data team's Slack channel, with escalation to the data product owner if unresolved within 2 hours during business hours.

---

## Data Cataloguing

A data catalogue is a searchable inventory of all data assets — what exists, what it means, who owns it, who uses it, and where it came from.

### What a Catalogue Entry Should Include

- **Technical metadata**: Table name, schema, column names and types, row count, size
- **Business metadata**: What does this table represent? What business process does it support?
- **Ownership**: Who is the data product owner? Who is the steward?
- **Lineage**: What sources feed this table? What downstream tables and reports depend on it?
- **Usage**: How often is it queried? By which teams?
- **Quality status**: Last quality check result; known issues

### Catalogue Tools

| Tool | Type | Best For |
|------|------|---------|
| **dbt docs** | Lightweight, free | dbt-first teams; SQL-based lineage |
| **DataHub** | Open-source | Full metadata platform; lineage; search |
| **Atlan** | Managed | Business-user-friendly; collaboration features |
| **Alation** | Managed | Enterprise; strong stewardship workflows |
| **Google Dataplex** | Managed | GCP-native; BigQuery integration |

### Data Lineage

Lineage tracks how data flows through the system: from source → pipeline → warehouse → transformation → report → decision.

```
Salesforce CRM
    ↓ Fivetran
raw.salesforce_opportunities
    ↓ dbt staging
stg_opportunities
    ↓ dbt mart
fct_pipeline
    ↓ Looker
Revenue Dashboard
    ↓
CFO Decision: Q3 forecast
```

Lineage is critical for impact analysis: "If we change the definition of this field upstream, which 37 reports are affected?"

---

## Access Control

### Principle of Least Privilege

Every person and system should have access only to the data they need to do their job — nothing more.

### Role-Based Access Control (RBAC) in a Data Warehouse

```sql
-- BigQuery example
-- Analysts can read marts; cannot read raw or staging
GRANT `roles/bigquery.dataViewer` ON DATASET `marts` TO 'group:analysts@company.com';
GRANT `roles/bigquery.dataViewer` ON DATASET `raw` TO 'group:data-engineers@company.com';
GRANT `roles/bigquery.dataEditor` ON DATASET `raw` TO 'serviceAccount:fivetran@company.iam.gserviceaccount.com';

-- PII tables: restricted to authorised roles only
GRANT `roles/bigquery.dataViewer` ON TABLE `marts.dim_customers_pii` TO 'group:pii-authorised@company.com';
```

### Column-Level Security for PII

For tables containing personal information, implement column-level masking so that users without PII access see masked values:

```sql
-- Snowflake: dynamic data masking
CREATE MASKING POLICY email_mask AS (val STRING) RETURNS STRING ->
  CASE
    WHEN CURRENT_ROLE() IN ('PII_ADMIN', 'ANALYTICS_LEAD') THEN val
    ELSE REGEXP_REPLACE(val, '.+@', '***@')
  END;

ALTER TABLE dim_customers MODIFY COLUMN email SET MASKING POLICY email_mask;
```

---

## POPIA Compliance for Data Teams

The Protection of Personal Information Act (POPIA) — South Africa — applies to any processing of personal information about identifiable natural persons.

### Eight Conditions of Lawful Processing

| Condition | Data Team Implication |
|-----------|----------------------|
| **Accountability** | Appoint a data steward for each dataset containing personal information. Document who owns what. |
| **Processing limitation** | Only collect and process personal information you have a lawful basis for. Delete when the purpose is served. |
| **Purpose specification** | Document why you collected each field. Do not use customer data for a purpose other than the one communicated to the customer. |
| **Further processing limitation** | New use of existing data (e.g., using CRM data to train an ML model) requires reassessment of lawful basis. |
| **Information quality** | Maintain accurate, up-to-date records. Implement processes for customers to update their information. |
| **Openness** | Document your data processing activities (ROPA — Record of Processing Activities). |
| **Security safeguards** | Encrypt personal data at rest and in transit. Implement access controls. Log access to PII tables. |
| **Data subject participation** | Processes to handle access requests, correction requests, and deletion requests must exist and be operable. |

### Practical Governance Actions

1. **PII inventory**: Tag every column containing personal information in your data catalogue.
2. **Retention schedule**: Document how long each type of personal data is retained. Implement automated deletion or anonymisation at end of retention period.
3. **Anonymisation vs pseudonymisation**: Anonymised data is outside POPIA scope. Pseudonymised data (e.g., customer_id replacing email) is still personal data because re-identification is possible.
4. **Breach notification**: If a data breach occurs, POPIA requires notification to the Information Regulator within a reasonable time, and to affected data subjects if there is a real risk of harm.
5. **Cross-border transfers**: Transferring personal data outside South Africa requires either the recipient country to have adequate protection, or explicit consent from the data subject. Relevant when using US/EU-based cloud services for PII-containing datasets.

### ROPA (Record of Processing Activities)

Maintain a register with one entry per data processing activity:

| Field | Example |
|-------|---------|
| Processing activity | Customer analytics |
| Purpose | Improve product and identify churn risk |
| Lawful basis | Legitimate interest |
| Categories of personal information | Name, email, usage events |
| Data subjects | Registered customers |
| Recipients | Internal analytics team; ML model |
| Retention period | 3 years post-churn |
| Cross-border transfers | Stored in GCP us-central1 — covered by standard contractual clauses |
| Security measures | Encrypted at rest; access restricted to PII-authorised role |
