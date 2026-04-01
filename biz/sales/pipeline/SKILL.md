---
name: Pipeline Management
description: >
  (1) B2B pipeline management — stage definitions with exit criteria, deal hygiene,
  pipeline reviews, and velocity tracking across the sales cycle.
requires:
  - biz/sales
  - biz/sales/qualification
improves:
  - biz/crm
metadata:
  domain: biz
  subdomain: sales/pipeline
  maturity: stable
---

# Pipeline Management

A pipeline is not a list of deals. It is a model of future revenue, and like any model, it is only useful if it reflects reality. Pipeline management is the discipline of keeping that model accurate, actionable, and predictive.

## Stage Definitions

Each stage has an **entry condition** (what makes a deal move in) and an **exit criterion** (a specific buyer action that confirms progression). Stage advancement based on seller activity rather than buyer action creates false pipeline.

### Stage 1 — Prospect
**Entry**: Account identified as fitting ICP. Contact identified.
**Exit criterion**: Buyer has agreed to an initial conversation.
**Probability**: 5–10%

### Stage 2 — Discovery
**Entry**: First call booked and held.
**Exit criterion**: Pain confirmed and quantified. Buyer has agreed to continue.
**Probability**: 20%

### Stage 3 — Qualified
**Entry**: MEDDIC gaps identified and a plan to close them.
**Exit criterion**: Economic buyer identified and a path to meeting them confirmed.
**Probability**: 35%

### Stage 4 — Solution / Demo
**Entry**: Demo or proposal scoped and scheduled.
**Exit criterion**: Buyer has confirmed solution addresses their pain. Stakeholders mapped.
**Probability**: 50%

### Stage 5 — Proposal
**Entry**: Commercial proposal submitted.
**Exit criterion**: Buyer has reviewed and provided feedback. No pending showstoppers.
**Probability**: 65%

### Stage 6 — Negotiation
**Entry**: Buyer has indicated intent to proceed. Commercial terms under discussion.
**Exit criterion**: Commercial agreement in principle. Legal/procurement engaged.
**Probability**: 80%

### Stage 7 — Closed Won / Lost
**Entry**: Decision made.
**Won**: Signed contract or PO received.
**Lost**: Decision to not proceed confirmed. Loss reason recorded.

---

## Pipeline Hygiene Rules

A deal must be removed or downgraded when:
- No buyer-initiated contact in 3× the average stage cycle time
- Last confirmed next step has passed with no response
- Economic buyer access has been explicitly refused
- Budget has been removed or frozen
- Champion has left the organisation

**Stale deals inflate forecast and delay honest assessment.** Review and cull weekly.

---

## Pipeline Review Framework

Run weekly or bi-weekly. Focus on movement, not status.

**Questions per deal:**
1. What has the buyer done since last review? (not the seller — the buyer)
2. What is the confirmed next step and date?
3. What is the biggest risk to this deal?
4. What do you need to move it forward?

**Review by stage, not by rep.** Look at the whole funnel shape:
- Too many deals in early stages = conversion problem downstream
- Too many deals in late stages with low movement = closing or qualification problem
- High pipeline volume + low win rate = qualification problem upstream

---

## Sales Velocity

The single most useful pipeline metric:

```
Sales Velocity = (Number of Opportunities × Win Rate × Average Deal Value) ÷ Sales Cycle Length
```

Use it to model the impact of improvements:
- Increasing win rate 5% → velocity impact
- Reducing cycle length 2 weeks → velocity impact
- Increasing average deal value 10% → velocity impact

Optimising the right lever depends on where the bottleneck is.

---

## Pipeline Coverage Ratio

**Coverage ratio** = Total pipeline value ÷ Quota

Industry standard targets:
- 3× coverage for an established team with a proven process
- 4–5× for a new team or new product with higher uncertainty
- Below 2× = quota achievement is unlikely without exceptional close rates

Coverage ratio by stage matters more than total coverage. A 4× pipeline that is 80% in Stage 2 is not a healthy pipeline.
