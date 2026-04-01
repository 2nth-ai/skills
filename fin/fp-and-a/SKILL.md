---
name: Financial Planning & Analysis
description: >
  (1) FP&A — annual budgeting, rolling forecasts, scenario modelling, unit economics,
  and the financial narratives that connect business performance to strategic decisions.
requires:
  - fin/accounting
  - fin/management-accounts
  - fin/modelling
improves: []
metadata:
  domain: fin
  subdomain: fp-and-a
  maturity: stable
---

# Financial Planning & Analysis (FP&A)

FP&A is the function that translates business strategy into financial terms and business performance into management insight. Where management accounts look backward, FP&A looks forward — budgets, forecasts, models, and the analytical frameworks that support better decisions.

## Annual Budget

The annual budget is the financial expression of the operating plan. It should be built bottom-up, challenged top-down, and owned by the business — not just the finance team.

### Budget Build Process

**Step 1 — Revenue Budget**
- By product/service line, by geography, by customer segment
- Driven by: pipeline, headcount, pricing model, growth assumptions
- Build from the sales team's view of the year — do not impose a number from above without interrogating the assumptions

**Step 2 — Cost of Revenue (Gross Profit)**
- Direct costs that vary with revenue: materials, direct labour, commissions, production costs
- Calculate gross margin % by line — this is where pricing decisions show up

**Step 3 — Operating Expenses**
- Fixed costs: rent, salaries for non-revenue roles, subscriptions, depreciation
- Variable costs: marketing, travel, professional fees
- Headcount plan: when are new hires planned? Model the full employment cost (salary + benefits + PAYE employer costs)

**Step 4 — Capital Expenditure**
- What investments are planned? Equipment, software, infrastructure
- Feed into depreciation schedule for the income statement

**Step 5 — Cash Flow Budget**
- Derived from the P&L and balance sheet assumptions
- Working capital movements: debtor days, creditor days, inventory
- Tax payment calendar

### Budget Governance
- Lock the budget before the start of the financial year
- Hold budget vs actual reviews monthly (do not revise the budget — update the forecast instead)
- Budget owners accountable for their cost centres

---

## Rolling Forecast

The rolling forecast extends the budget dynamically — typically updated monthly to show the next 12 months, regardless of where you are in the financial year.

**Advantages over a static budget**:
- Always forward-looking by a fixed horizon
- Incorporates what you now know (pipeline updates, cost changes)
- More useful for operational decision-making in volatile environments

**Best practice**: Maintain both. The budget is the commitment; the rolling forecast is the current best estimate.

---

## Scenario Modelling

For any material decision, model at least three scenarios:

| Scenario | Description |
|----------|-------------|
| Base case | Most likely outcome given current trajectory |
| Upside case | What happens if key assumptions go better than expected |
| Downside case | What happens if key risks materialise |

**Key questions per scenario**:
- What are the trigger conditions for this scenario?
- What is the cash impact and runway?
- What decisions would management make differently?
- At what point does this become a crisis scenario?

---

## Unit Economics

The fundamental building blocks of a scalable business model:

### Customer Acquisition Cost (CAC)
```
CAC = Total Sales & Marketing Spend ÷ New Customers Acquired
```
Track by channel. Know which channels are efficient and which are not.

### Customer Lifetime Value (LTV or CLV)
```
LTV = Average Revenue per Customer × Gross Margin % × Average Customer Lifespan
```
Or for subscription businesses:
```
LTV = (Monthly Recurring Revenue per Customer × Gross Margin %) ÷ Monthly Churn Rate
```

### LTV:CAC Ratio
| Ratio | Interpretation |
|-------|---------------|
| <1× | Destroying value on every customer |
| 1–3× | Marginal; improving but not yet healthy |
| 3× | The SaaS benchmark — healthy |
| >5× | Under-investing in growth; could accelerate |

### Payback Period
```
Payback (months) = CAC ÷ (Monthly Revenue per Customer × Gross Margin %)
```
The number of months to recover the cost of acquiring a customer. Target: <12 months for most SMBs.

---

## Reporting for Non-Financial Stakeholders

The CFO's job is to make numbers accessible, not to demonstrate technical sophistication.

**Principles**:
- Lead with the punchline — "We are R500k ahead of budget" — then explain
- Visualise: use charts for trends, tables for detail
- Connect financial performance to operational drivers the business can actually influence
- Flag decisions, not just data — "Our creditor days have increased to 62 days; if we do not pay three key suppliers this week, we risk credit holds on our next production run"

**Board pack structure (one page per section)**:
1. Trading summary: Revenue, gross profit, EBITDA vs budget and prior year
2. Cash position and runway
3. Key risks and opportunities
4. Decisions required from the board
