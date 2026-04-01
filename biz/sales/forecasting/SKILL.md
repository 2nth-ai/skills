---
name: Revenue Forecasting
description: >
  (1) B2B revenue forecasting — three-tier forecast model, sales velocity, commit
  discipline, and CRM-based forecasting hygiene for accurate revenue prediction.
requires:
  - biz/sales
  - biz/sales/pipeline
improves:
  - fin/modelling
metadata:
  domain: biz
  subdomain: sales/forecasting
  maturity: stable
---

# Revenue Forecasting

A forecast is a commitment, not a wish list. The discipline of accurate forecasting separates professional revenue organisations from hopeful ones. Investors, boards, and operators make decisions based on forecasts — chronic inaccuracy erodes trust and leads to bad resource allocation.

## Three-Tier Forecast Model

The standard framework used by most B2B sales organisations:

### Commit
Deals the rep will stake their reputation on closing this period. The seller is saying: "If this doesn't close, something unusual happened."
- Must have: economic buyer engaged, verbal agreement on commercial terms, no blocking issues
- Managers must be able to verify commit independently from CRM data — not just rep assertion
- Commit overrides = deals a manager moves into commit based on their own read of the deal

### Best Case
Deals that could close if everything goes right. Upside scenario.
- Deal is late-stage with some open issues
- Champion is engaged but economic buyer meeting hasn't happened yet
- Timeline is tight but not impossible

### Pipeline
Everything else that could realistically close in the period with some probability.
- Realistic: based on stage and cycle time, not optimism
- Used for: planning coverage, identifying deals to accelerate

### Forecast Roll-Up
```
Forecast = Commit + (Best Case × 50%) + (Pipeline × 10–15%)
```
Adjust multipliers based on historical conversion rates for your team.

---

## Forecast Accuracy Disciplines

**Call it before you close it.** Forecast discipline means committing at the start of the period and holding to it — not adjusting as the period progresses to match reality.

**Separate forecast from pipeline review.** Forecast calls are about what will close. Pipeline reviews are about what needs work.

**Track variance.** Every period, record: forecast vs actual. Over time, identify:
- Optimistic reps (consistently forecast > actual)
- Conservative reps (consistently forecast < actual)
- Unpredictable reps (high variance either direction)

Each pattern requires a different coaching response.

---

## Forecast by Signal, Not by Gut

CRM-based signals that improve forecast accuracy:

| Signal | Weight |
|--------|--------|
| Economic buyer met in last 30 days | High |
| Mutual close plan agreed in writing | High |
| Legal/procurement engaged | High |
| Last buyer activity < 14 days ago | Medium |
| Champion has confirmed internal support | Medium |
| Demo completed and feedback received | Medium |
| Proposal sent, no response > 14 days | Negative |
| Stage not advanced in 30+ days | Negative |

---

## Quarterly Forecast Cadence

**Week 1**: Pipeline review — assess what carried over, identify new opps needed
**Week 4–6**: Early commit identification — what is tracking to close this quarter?
**Week 8**: Forecast lock — commit and best case submitted to leadership
**Week 10–12**: Deal acceleration focus — remove blockers on commit deals, pull in best case
**Week 13**: Close week — daily check-ins on commit deals, escalate blockers immediately

---

## Common Forecasting Failures

**Sandbagging**: Reps sandbag (under-forecast) to manage expectations and look like heroes. Fix: reward accuracy, not just attainment.

**Happy ears**: Reps hear what they want to hear from buyers. Fix: require buyer-initiated actions as evidence, not verbal enthusiasm.

**Stage inflation**: Deals advanced in CRM without real buyer movement. Fix: exit criteria enforced in pipeline review.

**Last-day deals**: Disproportionate closes on the last day of the quarter. Fix: track intra-quarter close distribution; coach against end-loading.
