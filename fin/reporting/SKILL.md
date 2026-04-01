---
name: fin/reporting
description: |
  Financial reporting skills. Use this skill when:
  (1) building KPI dashboards from ERP or CRM data,
  (2) calculating financial metrics — revenue, margin, burn rate, AR/AP aging,
  (3) producing variance analysis (actual vs budget vs prior period),
  (4) summarising financial data for executive reporting,
  (5) formatting financial outputs for display in Cloudflare Workers or Pages.
license: MIT
compatibility: Any JavaScript/TypeScript, Cloudflare Workers
homepage: https://skills.2nth.ai/fin/reporting
repository: https://github.com/2nth-ai/skills
improves:
  - fin
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Finance, Reporting, KPIs, Dashboards"
---

# Financial Reporting

Patterns for extracting, calculating, and presenting financial KPIs from ERP and CRM systems.

## Core KPI Patterns

### Revenue Metrics
```javascript
const grossMargin = (revenue - cogs) / revenue;
const netMarginPct = (netIncome / revenue) * 100;
const revenueGrowth = (currentPeriod - priorPeriod) / priorPeriod;
```

### Working Capital
```javascript
const currentRatio = currentAssets / currentLiabilities;
const dso = (accountsReceivable / revenue) * 365;  // Days Sales Outstanding
const dpo = (accountsPayable / cogs) * 365;        // Days Payable Outstanding
const dio = (inventory / cogs) * 365;              // Days Inventory Outstanding
```

### Variance Analysis
```javascript
const variance = actual - budget;
const variancePct = (variance / budget) * 100;
const flag = Math.abs(variancePct) > 5 ? 'REVIEW' : 'OK';
```

## Formatting for Display

```javascript
const formatCurrency = (amount, currency = 'ZAR') =>
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency }).format(amount);

const formatPct = (value) =>
  `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
```

## AI Narrative Generation

Feed KPIs to Claude for executive summaries:

```
System: You are a CFO briefing assistant. Summarise financial KPIs in 3 bullet points.
        Be factual, flag variances >5%, suggest one action item.
User: {JSON of KPI data}
```

## Common Gotchas

- **Currency precision**: Financial calculations must use integer cents or a decimal library — never floating point for money
- **Period alignment**: Ensure all source data uses the same fiscal period before comparing
- **Null handling**: ERP data often has nulls for new accounts — treat as zero in calculations, not as errors
- **Tax-inclusive vs exclusive**: Always confirm whether amounts from the ERP include VAT/tax before reporting

## See Also

- [biz/erp/sage-x3](../../biz/erp/sage-x3/SKILL.md) — Sage X3 as financial data source
- [biz/erp/erpnext](../../biz/erp/erpnext/SKILL.md) — ERPNext as financial data source
