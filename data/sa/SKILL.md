---
name: South African Data Landscape
description: >
  Data infrastructure, cloud providers, connectivity constraints, POPIA specifics,
  and the practical realities of data work in South Africa.
requires:
  - data/governance
improves: []
metadata:
  domain: data
  subdomain: sa
  maturity: stable
---

# South African Data Landscape

South Africa has the most mature data and analytics ecosystem on the continent, but operates under constraints and regulatory requirements that differ meaningfully from the US/EU contexts that most tooling and frameworks are designed for.

## Cloud Data Infrastructure in South Africa

### Data Centre Regions

| Provider | SA Region | Location | Notes |
|----------|-----------|----------|-------|
| **AWS** | af-south-1 | Cape Town | Generally Available since 2020 |
| **Azure** | South Africa North | Johannesburg | GA; South Africa West (Cape Town) — limited |
| **GCP** | africa-south1 | Johannesburg | GA since 2024 |
| **Cloudflare** | Multiple PoPs | JHB, CPT | Edge compute; Workers AI available |

**POPIA implication**: For personal information of South African data subjects, storing data in South African regions eliminates cross-border transfer concerns. For non-personal data, cost and latency should drive region selection.

### Connectivity Realities

- **Bandwidth costs** are higher than US/EU — design pipelines to minimise data egress
- **Load shedding** affects on-premise infrastructure reliability — cloud-first is the right default
- **Latency to US/EU**: ~180–220ms from JHB to US East Coast; ~120ms to London. This matters for real-time APIs but not for batch analytics
- **Mobile-first population**: 70%+ of South Africans access the internet primarily via mobile — if your data product surfaces to end users, design for low-bandwidth conditions

---

## Local Cloud and Data Providers

| Provider | Offering | Notes |
|----------|---------|-------|
| **Liquid Intelligent Technologies** | Enterprise connectivity, data centre colocation | Pan-African; strong enterprise relationships |
| **BCX** | Managed IT, cloud brokering | IBM partnership; large enterprise focus |
| **Dimension Data** | Cloud managed services, SD-WAN | NTT subsidiary; strong in financial services |
| **Teraco** | Carrier-neutral data centres | JHB, CPT, DBN; interconnection hub; AWS/Azure peering |
| **IS (Internet Solutions)** | Connectivity, cloud | Acquired by Vox |
| **Telkom / Openserve** | Fibre, enterprise connectivity | Last-mile; FTTH expansion ongoing |

For POPIA compliance in regulated industries (financial services, healthcare), local data centres (Teraco-hosted) combined with South African cloud regions are the safest architecture.

---

## The South African Analytics Job Market

Understanding the market informs hiring strategy and realistic salary expectations.

### Typical Roles and Market Rates (2024–2025, Johannesburg)

| Role | Junior (0–3yr) | Mid (3–6yr) | Senior (6yr+) |
|------|---------------|------------|--------------|
| Data Analyst | R25–40k/mo | R40–65k/mo | R65–90k/mo |
| Analytics Engineer | R35–55k/mo | R55–85k/mo | R85–120k/mo |
| Data Engineer | R40–65k/mo | R65–100k/mo | R100–150k/mo |
| Data Scientist | R45–70k/mo | R70–110k/mo | R110–160k/mo |
| ML Engineer | R55–80k/mo | R80–120k/mo | R120–180k/mo |

**Shortage**: Experienced data engineers and ML engineers are in short supply. Budget 20–30% above market for specialists with 5+ years of hands-on production experience.

**Alternative**: Senior talent from neighbouring countries (Zimbabwe, Botswana, Nigeria, Kenya) often available at lower cost. Remote-first data teams with distributed African talent are increasingly common.

### Skills Commonly Available

- SQL and BI tools (widespread)
- Python and R for analysis (growing rapidly)
- dbt (fast-growing; ZA community active — dbt Cape Town and JHB meetups)
- Spark / Databricks (limited; specialist market)
- MLOps / model deployment (scarce; often requires upskilling)

---

## Data Regulations Beyond POPIA

### Financial Services

- **FSCA (Financial Sector Conduct Authority)**: Requires data governance frameworks for FSPs; record-keeping obligations for client data
- **SARB Guidance**: Data localisation requirements for core banking data; cloud usage requires SARB cloud risk management framework compliance
- **Basel III reporting**: Banks must maintain data lineage for regulatory capital calculations — a specific data governance use case

### Healthcare

- **National Health Act**: Patient data must be handled with confidentiality
- **Health Professions Act**: Records retention requirements (minimum 6 years for adults; longer for minors)
- **HPCSA guidelines**: Electronic health records must be secured and auditable

### Telecommunications

- **ICASA regulations**: Network data retention; subscriber record obligations
- **ECT Act (Electronic Communications and Transactions Act)**: Foundational e-commerce and data security requirements

---

## Practical Data Work in SA Organisations

### Common Data Maturity Reality

Most South African SMBs are at Stage 1–2 of the maturity model. The most common issues:
- **Accounting data in Sage or Xero** — rarely integrated into analytics; exported to Excel for management reporting
- **CRM data fragmented** — some in spreadsheets, some in a CRM, some in email inboxes
- **Reporting is manual** — month-end is a painful multi-day exercise of copy-pasting between systems
- **No single customer view** — customer data lives separately in accounting, CRM, and support systems with no common customer ID

**Highest ROI starting points for SA SMBs**:
1. Connect Xero/Sage to BigQuery via Airbyte — 2 days of setup; eliminates monthly Excel exports
2. Build a single customer view across systems using email as the join key
3. Automate management accounts into a Metabase dashboard — eliminates the month-end manual report

### B-BBEE and Data

B-BBEE scorecard calculations require accurate employee and procurement data. Common pain point: B-BBEE data is maintained manually by HR in spreadsheets, making verification audit-stressful.

**Data opportunity**: Automate B-BBEE data collection from payroll (for employment equity) and accounting (for preferential procurement) into a consolidated scorecard dashboard. Many SA data teams have built proprietary versions of this — commercial products also exist (e.g., LabourNet, CRS Technologies).

### Load Shedding and Pipeline Reliability

Load shedding creates reliability risks for on-premise data infrastructure. Mitigations:
- Move all data workloads to cloud (they run in data centres with generators)
- If on-premise sources exist, implement change-data capture (CDC) to catch changes even during outages
- Use cloud-based orchestration (not on-premise Airflow) to ensure schedulers are not affected
- Monitor pipeline completeness with row-count checks — a pipeline that "ran" during load shedding may have completed with partial data
