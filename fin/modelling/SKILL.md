---
name: fin/modelling
description: |
  Financial modelling AI expert. Use this skill when:
  (1) building three-statement models (P&L, Balance Sheet, Cash Flow) from assumptions or natural language inputs,
  (2) computing DCF valuations — WACC, FCF projections, terminal value, enterprise value, IRR, NPV, MOIC,
  (3) generating base / bull / bear scenario analysis with cascading assumption consistency,
  (4) producing two-dimensional sensitivity tables (discount rate vs revenue growth, or any two variables),
  (5) exporting financial models to Excel (with formulas intact) or structured JSON,
  (6) auditing financial models for circular references, hardcoded values, and assumption gaps,
  (7) producing board-ready executive summaries with key metrics and variance commentary,
  (8) handling IFRS vs GAAP differences (including IFRS 16 lease accounting adjustments).
license: MIT
compatibility: Any — outputs Excel, JSON, Markdown
homepage: https://skills.2nth.ai/fin/modelling
repository: https://github.com/2nth-ai/skills
requires:
  - fin/reporting
improves:
  - fin
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Finance, DCF, Financial Modelling, Valuation, Scenario Analysis"
allowed-tools: Read Write Edit
---

# Financial Modelling AI

Financial modelling is one of the highest-leverage AI pairings in finance. The human brings domain judgement — industry knowledge, deal context, capital structure preferences. The AI brings speed, consistency, and tireless number-crunching. Together they produce models that are faster, better-documented, and easier to audit.

This skill covers the full financial modelling workflow: three-statement models, DCF valuation, scenario analysis, sensitivity tables, and model export.

## Key Capabilities

- Build three-statement models (P&L, Balance Sheet, Cash Flow) from natural language inputs
- Compute WACC, terminal value, IRR, NPV, MOIC automatically
- Generate base / bull / bear scenarios with linked assumption tables
- Produce two-dimensional sensitivity tables (discount rate vs revenue growth)
- Export to Excel (with formulas intact) or structured JSON for downstream use
- Audit models for circular references, hardcoded values, and assumption gaps

## Three-Statement Model

The three statements are fully linked: retained earnings flow from net income, working capital movements derive from DSO/DPO assumptions, and closing cash derives from the cash flow statement. Any out-of-balance condition is flagged immediately with the offending line identified.

```json
{
  "model": "three_statement",
  "period": "FY2026",
  "assumptions": {
    "revenue_growth": 0.18,
    "gross_margin": 0.72,
    "opex_pct_revenue": 0.45,
    "capex_pct_revenue": 0.08,
    "tax_rate": 0.28,
    "days_receivable": 45,
    "days_payable": 30,
    "days_inventory": 0
  },
  "income_statement": {
    "revenue": 12400000,
    "cogs": 3472000,
    "gross_profit": 8928000,
    "opex": 5580000,
    "ebitda": 3348000,
    "da": 420000,
    "ebit": 2928000,
    "interest": 180000,
    "ebt": 2748000,
    "tax": 769440,
    "net_income": 1978560
  }
}
```

### Cash Flow Bridge

```json
{
  "cash_flow_statement": {
    "period": "FY2026",
    "operating": {
      "net_income": 1978560,
      "add_back_da": 420000,
      "change_in_receivables": -167671,
      "change_in_payables": 36164,
      "change_in_inventory": 0,
      "cfo": 2267053
    },
    "investing": {
      "capex": -992000,
      "cfi": -992000
    },
    "financing": {
      "debt_repayment": -180000,
      "cff": -180000
    },
    "net_change_in_cash": 1095053,
    "opening_cash": 800000,
    "closing_cash": 1895053
  }
}
```

## DCF Valuation

```js
async function buildDCF(model, params) {
  const { wacc, terminalGrowth, horizon } = params;

  // AI generates FCF projections from three-statement model
  const fcfProjections = await ai.project({
    model,
    years: horizon,
    sensitivity: 'conservative'
  });

  // Discount cash flows
  const pvFCF = fcfProjections.map((fcf, i) =>
    fcf / Math.pow(1 + wacc, i + 1)
  );

  // Terminal value (Gordon Growth Model)
  const tv = fcfProjections[horizon - 1] * (1 + terminalGrowth)
             / (wacc - terminalGrowth);
  const pvTV = tv / Math.pow(1 + wacc, horizon);

  return {
    enterpriseValue: pvFCF.reduce((a, b) => a + b, 0) + pvTV,
    terminalValuePct: (pvTV / (pvFCF.reduce((a, b) => a + b, 0) + pvTV)) * 100,
  };
}
```

### WACC Components

| Component | Source / Method |
|-----------|----------------|
| Risk-Free Rate | 10-year government bond yield |
| Equity Risk Premium | Damodaran country ERP |
| Beta | Sector / levered beta |
| Cost of Debt | Marginal rate x (1 - tax rate) |
| Capital Structure | Market value weights (equity / debt) |

## Scenario Analysis

The AI maintains scenario consistency — changing a revenue assumption in the bull case cascades working capital, tax, and capex automatically.

| Scenario | Revenue Growth | Margin | WACC | EV/EBITDA |
|----------|---------------|--------|------|-----------|
| Bear | -5% | -300bps | +150bps | 6.2x |
| Base | +18% | Stable | Flat | 9.1x |
| Bull | +32% | +200bps | -50bps | 13.4x |

## Sensitivity Tables

Two-dimensional sensitivity tables show enterprise value across ranges of any two variables. Example: Enterprise Value vs WACC and Terminal Growth Rate (base case: WACC 10%, TGR 2.5%):

| WACC \ TGR | 1.5% | 2.0% | 2.5% | 3.0% | 3.5% |
|------------|------|------|------|------|------|
| 8% | 48.2M | 52.1M | 56.8M | 62.4M | 69.9M |
| 9% | 41.3M | 44.4M | 48.0M | 52.3M | 57.8M |
| **10%** | 35.6M | 38.1M | **40.9M** | 44.2M | 48.2M |
| 11% | 30.9M | 32.9M | 35.2M | 37.8M | 41.0M |
| 12% | 27.1M | 28.7M | 30.5M | 32.6M | 35.2M |

## Agent Workflow Example

```
Human: Build a DCF for a SaaS company with $12.4M ARR, 72% gross margin,
       growing at 18% YoY. Use WACC of 10% and 2.5% terminal growth.

AI:    Three-statement model built. Net income FY2026: $1.98M.
       FCF projection: $2.1M, $2.5M, $3.0M, $3.6M, $4.3M over 5 years.
       Enterprise value: $40.9M at base case.
       Terminal value is 68% of EV — typical for high-growth SaaS.
       Implied EV/ARR: 3.3x.
```

## MCP Tools

| Tool | Description |
|------|-------------|
| `build_three_statement` | Generate P&L, BS, CF from assumptions JSON |
| `compute_dcf` | WACC, FCF projections, terminal value, EV |
| `run_scenario` | Apply named scenario to model and recompute |
| `build_sensitivity_table` | 2D sensitivity for any two variables |
| `compute_wacc` | Build WACC from capital structure inputs |
| `export_excel` | Export model to .xlsx with formula cells |
| `export_json` | Structured model output for downstream APIs |
| `audit_model` | Flag circular references, hardcoded values, assumption gaps |
| `compare_versions` | Diff two model versions and summarise changes |
| `generate_board_pack` | Produce executive summary with key metrics and charts |

## Common Gotchas

- **Circular references in Excel** — AI flags these before export; cash/debt sweep models require iterative calculation enabled in the workbook settings.
- **Terminal value dominance** — If TV > 80% of EV, assumptions are speculative. Warn and suggest a shorter horizon or exit multiple approach instead of Gordon Growth.
- **Currency consistency** — Ensure all inputs in same currency; mixed-currency inputs will produce nonsense without an explicit exchange rate table.
- **IFRS vs GAAP differences** — Lease accounting (IFRS 16) affects EBITDA by capitalising operating lease costs; adjust automatically when standard is specified.
- **Working capital timing** — DSO/DPO assumptions can swing FCF materially; show sensitivity to +/-5 day changes before finalising.
- **Tax loss carryforwards** — Track NOL shields across projection years; failing to model these understates equity value in early-stage companies.
- **Minority interests** — Bridge from enterprise to equity value requires deducting minorities; prompt for this if detected in inputs.
- **Model lock date** — Always stamp model with lock date and exchange rates used; auto-stamp on export to prevent version confusion.
- **IFRS 17 — Insurance entities** — IFRS 17 fundamentally changes income recognition for insurance. Use a dedicated Insurance Modelling skill for CSM, RA, and fulfilment cashflow projections.

## See Also

- [fin/reporting](../reporting/SKILL.md) — Financial KPI reporting patterns