---
name: Data Visualisation & BI
description: >
  Dashboard design, BI tool selection, data storytelling, self-serve analytics,
  and building reporting infrastructure that executives actually use.
requires:
  - data/analysis
improves: []
metadata:
  domain: data
  subdomain: visualisation
  maturity: stable
---

# Data Visualisation & BI

A correct insight that nobody reads creates no value. Visualisation is the last mile between data and decision.

## BI Tool Selection

| Tool | Best For | Avoid When |
|------|---------|-----------|
| **Looker / Looker Studio** | Large teams; LookML semantic layer; embedding; Salesforce ecosystem | Small teams — steep LookML learning curve |
| **Metabase** | SMBs; self-serve without SQL; fast setup; open-source option | Complex multi-table semantic modelling |
| **Tableau** | Executive-facing; rich visualisation options; large data volumes | Budget is constrained; IT resources are limited |
| **Power BI** | Microsoft-first organisations (Azure, Excel heavy); desktop-first | GCP/AWS stacks; teams that prefer SQL over DAX |
| **Grafana** | Operational/technical dashboards; time-series monitoring; real-time | Business reporting; non-technical audiences |
| **Streamlit / Dash** | Custom ML apps; interactive data apps; developer-built tools | Non-technical business users |
| **Evidence** | Code-based BI; SQL + Markdown; git-versioned reports | Non-technical content editors |

**Default for growth-stage**: Metabase (fast to ship, low cost) or Looker Studio (free, Google ecosystem). Upgrade to Looker or Tableau when self-serve demand outgrows ad-hoc query tools.

---

## Dashboard Design Principles

### The Three-Second Rule
A dashboard viewer should be able to identify the most important information within three seconds. Achieve this by:
- Placing the most critical KPI top-left or top-centre
- Using a single dominant number (hero metric) with trend context
- Using colour sparingly and consistently (red = bad, green = good — do not invert this)

### Information Hierarchy

```
Level 1 — Executive Summary (one screen)
  Hero metrics: 3–5 KPIs, current value vs target vs prior period
  Status: RAG (Red/Amber/Green) indicators
  Trend: Sparklines or mini trend charts

Level 2 — Operational Detail (drill-down)
  Time-series charts for each L1 metric
  Segmentation (by region, product, team)
  Exception tables (what is outside normal range)

Level 3 — Analytical Deep Dive (analyst tools)
  Cross-filters, custom date ranges
  Raw data exports
  Cohort and funnel views
```

### Common Dashboard Mistakes

| Mistake | Fix |
|---------|-----|
| Too many metrics on one screen | Max 6–8 KPIs per dashboard. Build separate dashboards for separate audiences. |
| Missing context | Always show prior period, target, or benchmark alongside current value |
| Pie charts | Use bar charts. Humans cannot accurately compare angles. |
| Dual axis charts | Misleading; use faceted charts instead |
| Automatic Y-axis that does not start at zero | Forces misleading visual impression of change magnitude |
| Colour gradients with no legend | Always label your colour scale |

---

## Semantic Layer / Metrics Layer

The semantic layer defines business metrics in one place so every tool in the stack uses the same definition.

**Problem without it**: Marketing defines "active user" as any user who logged in the last 30 days. Product defines it as anyone who took an action. Finance defines it differently again. Three dashboards, three numbers, arguments in every board meeting.

**With a semantic layer**: One definition. All tools query the same logic.

**Tools**:
- **LookML** (Looker): SQL-based; powerful; steep learning curve
- **dbt metrics layer**: Define metrics in YAML alongside dbt models; tool-agnostic
- **Cube.dev**: Open-source; works with any BI tool; headless BI

```yaml
# dbt/models/metrics.yml
metrics:
  - name: monthly_active_users
    label: Monthly Active Users
    model: ref('fct_user_activity')
    description: "Users who took at least one meaningful action in the last 30 days"
    calculation_method: count_distinct
    expression: user_id
    timestamp: event_date
    time_grains: [day, week, month]
    filters:
      - field: is_meaningful_action
        operator: '='
        value: 'true'
```

---

## Self-Serve Analytics

Self-serve analytics means business users can answer their own questions without waiting for an analyst. Done well, it multiplies analyst capacity. Done poorly, it creates a proliferation of contradictory, untrustworthy reports.

### Enabling Self-Serve Safely

1. **Curated data marts**: Business users should query cleaned, modelled data — not raw tables. Build marts with descriptive column names, documented business logic, and clear ownership.
2. **Training**: Run 2-hour SQL Basics sessions for power users in each business unit. Most business questions require only SELECT, WHERE, GROUP BY, and ORDER BY.
3. **Guardrails**: Lock down raw tables. Grant read access to marts only. This prevents "creative" data pulls that bypass business logic.
4. **A single source of truth per metric**: When a user searches for "revenue," one result should appear. If five different revenue tables exist, self-serve breaks down into tribal knowledge.

---

## Data Storytelling

When presenting data findings to leadership:

### The One-Slide Structure

```
Headline (the conclusion, not the topic):
"Churn is accelerating — SMB segment down 18% QoQ"

Visual: One chart that proves the headline

Context: What does this mean? Is 18% unusual?

Root cause: Based on data, what is driving this?

Recommended action: What should we do?

Decision needed: What do you need from this room?
```

### Annotate Your Charts

Annotations turn a chart into a story.

```
Revenue trend line
    → Add annotation: "Price increase Feb" at the revenue inflection point
    → Add annotation: "New enterprise tier launched Mar"
    → Add annotation: "COVID lockdown Apr 2020"
```

Without annotations, executives must reconstruct context from memory. With annotations, the chart tells its own story.

### Numbers in Context

| Raw | With Context |
|-----|-------------|
| "NPS is 42" | "NPS is 42 — above the SA B2B SaaS median of 35, but below our Q4 target of 50" |
| "CAC is R8,400" | "CAC is R8,400 — up 22% MoM due to increased paid social spend; LTV:CAC ratio is 4.1x, still above our 3x minimum" |
| "We have 847 bugs" | "847 open bugs — 12 P1 (SLA breach risk), 203 P2, 632 P3. P1 count is down 40% from last month." |
