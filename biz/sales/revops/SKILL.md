---
name: Revenue Operations
description: >
  (1) Revenue operations — quota design, compensation plans, territory management,
  CRM governance, and tech stack for a high-performance B2B sales function.
requires:
  - biz/sales
  - biz/sales/pipeline
  - biz/sales/forecasting
improves:
  - biz/crm
  - fin/modelling
metadata:
  domain: biz
  subdomain: sales/revops
  maturity: stable
---

# Revenue Operations

Revenue Operations (RevOps) is the function that aligns people, process, and technology across the revenue cycle to maximise predictable growth. Where sales focuses on winning deals, RevOps focuses on the system that makes winning repeatable.

## Quota Design

### Quota Setting Principles
- Quota should be achievable by 60–70% of the team in a normal year. If fewer than 50% attain quota, it is set too high. If more than 80% attain, it is too low.
- Build quota bottom-up from realistic capacity, not top-down from a board target
- Account for ramp time: new reps should have ramped quotas for their first 3–6 months

### Quota Components
**New business quota**: Net new ARR or revenue from new logos. Primary quota for most sales roles.

**Expansion quota**: Upsell and cross-sell from existing accounts. Typically held by account managers or CSMs.

**Activity quotas**: Pipeline generation (meetings booked, opportunities created). Leading indicator quotas for SDRs / BDRs.

### Bottom-Up Quota Build
```
Rep capacity: 40 qualified discovery calls/month
× 30% conversion to opportunity: 12 opportunities/month
× 25% win rate: 3 deals/month
× £X ACV: £Y/month = £Z/quarter quota
```

Model with conservative assumptions. Optimistic quota models produce chronic underattainment.

---

## Compensation Plans

### Commission Structure

**Standard SaaS / B2B services structure**:
- Base salary: 50–60% of OTE (On-Target Earnings)
- Variable (commission): 40–50% of OTE
- OTE achieved at 100% quota attainment

**Accelerators**: Commission rate increases above a threshold
- 0–100% quota: 100% commission rate (standard)
- 100–120% quota: 125% commission rate
- 120%+ quota: 150% commission rate

Accelerators incentivise over-achievement and reward top performers disproportionately.

**Cliff**: Commission only pays if a minimum threshold is met (typically 50–70% of quota). Prevents paying commission on chronically underperforming reps.

**SPIFs** (Sales Performance Incentive Funds): Short-term cash bonuses for specific behaviours — closing a particular product, winning in a target vertical, hitting a monthly milestone.

### Comp Plan Design Rules
- Simple enough to calculate in your head
- Pays commission on bookings (not collections) for sales; adjust clawback terms in contract
- Align incentives with company objectives: if you want multi-year deals, pay more for them
- New plan effective from day 1 of new period — never retroactive changes

---

## Territory Design

**Principles**:
- Equal opportunity, not equal accounts. Territories should have similar revenue potential, not the same number of accounts.
- Specialise by: geography, industry vertical, company size (SMB / mid-market / enterprise), or product line — not all at once

**Territory sizing**:
- Each rep needs enough accounts to prospect actively (Tier 1+2+3 combined: 150–300 accounts)
- Too many accounts = shallow coverage; too few = pipeline ceiling

**Named accounts**: Strategic accounts identified by leadership. Protected from territorial dispute. Reviewed quarterly.

---

## CRM Governance

The CRM is the system of record. Its integrity determines forecast accuracy, pipeline visibility, and management insight.

### CRM Hygiene Standards
- All deals logged within 24 hours of first qualified conversation
- Contact record requires: name, title, email, phone, company
- Opportunity record requires: stage, close date, ARR, next step, next step date
- Close dates must be realistic: updated when slippage occurs, not left as aspirational
- Every opportunity needs a next step date in the future

### CRM Audit Cadence
- **Weekly**: Deals with no activity in 14 days flagged for review
- **Monthly**: Opportunities with close dates in the past — close or remove
- **Quarterly**: Win/loss analysis run against all closed opportunities

---

## Sales Tech Stack

**Core** (required):
- CRM: Salesforce, HubSpot, or Pipedrive (scaled to team size and complexity)
- Email/Calendar integration: full sync to CRM

**Outbound** (for proactive prospecting):
- Sequencing: Outreach, Salesloft, Apollo, or HubSpot Sequences
- Contact data: Apollo, ZoomInfo, Lusha, or LinkedIn Sales Navigator

**Intelligence** (for scaling teams):
- Call recording/intelligence: Gong, Chorus, or Fireflies
- Intent data: Bombora, G2 Buyer Intent
- Proposal: Proposify, PandaDoc

**RevOps rule**: Add tooling only when the process it supports is working manually. Automating a broken process scales the problem.

---

## Key RevOps Metrics

| Metric | Definition | Target |
|--------|-----------|--------|
| Win rate | Closed won ÷ total closed | 20–30% (varies by segment) |
| Sales cycle length | Days from opp created to close | Benchmark by segment |
| ACV / ARR | Average contract value | Track trend, not absolute |
| Pipeline coverage | Total pipeline ÷ quota | 3–4× |
| Quota attainment | % of reps at ≥100% quota | 60–70% |
| Ramp time | Months to full productivity | 3–6 months |
| CAC | Cost to acquire a customer | < 1× ACV for healthy unit economics |
| CAC payback | Months to recover CAC | <12 months (SaaS standard) |
