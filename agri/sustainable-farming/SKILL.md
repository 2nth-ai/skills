---
name: agri/sustainable-farming
description: |
  Agricultural sector intelligence and sustainable farming expert. Use this skill when:
  (1) analysing crop economics — yield projections, input costs, margin analysis per hectare,
  (2) evaluating sustainable farming practices — regenerative agriculture, conservation tillage, IPM,
  (3) assessing farm-to-market value chains — logistics, cold chain, commodity pricing, export readiness,
  (4) modelling livestock economics — carrying capacity, feed conversion, herd management,
  (5) advising on agricultural certifications — GlobalGAP, organic, fair trade, carbon credits,
  (6) analysing South African agriculture — land reform implications, water rights, DAFF policy,
  (7) building investment cases for agricultural assets — farm valuations, comparable transactions.
license: MIT
compatibility: Any
homepage: https://skills.2nth.ai/agri/sustainable-farming
repository: https://github.com/2nth-ai/skills
requires:
  - fin/modelling
improves:
  - agri
metadata:
  author: Gananda Connect (Barry Hawke)
  version: "1.0.0"
  categories: "Agriculture, Sustainable Farming, Crop Economics, Farm Valuation"
---

# Sustainable Farming Intelligence

Domain expertise for AI agents working with agricultural operations, farm economics, and sustainable food production. This skill bridges agricultural science with financial analysis — the combination needed to evaluate farming operations as both productive systems and investment assets.

## Key Capabilities

- Crop economics: yield modelling, input cost analysis, gross margin per hectare by crop type
- Livestock economics: carrying capacity, feed conversion ratios, breeding cycle cash flows
- Sustainable practices: regenerative agriculture frameworks, conservation tillage, integrated pest management
- Farm valuation: comparable transaction analysis, productive value vs. market value, water rights valuation
- Certification guidance: GlobalGAP, organic, fair trade — requirements, costs, price premiums
- SA-specific: land reform implications for title, water allocation policy, DAFF compliance

## Crop Economics Framework

When analysing crop profitability, always model the full cost stack:

```
Gross margin = Yield (tons/ha) × Price (R/ton) − Variable costs (R/ha)
```

Variable costs include: seed, fertiliser, crop protection, fuel, labour, irrigation, harvesting, transport to silo.

Fixed costs per hectare include: land (rental or opportunity cost), depreciation on equipment, insurance, management overhead.

Break-even yield = Total costs / Price per ton. This is the minimum yield needed to cover all costs at current commodity prices.

## Farm Valuation

Agricultural asset valuation uses three approaches:

1. **Productive value** — capitalised net farm income at appropriate discount rate (typically 8-12% for SA farms)
2. **Comparable sales** — recent transactions for similar farms in the district, adjusted for improvements and water
3. **Replacement cost** — land + infrastructure + permanent crops at current build/planting costs

Water rights are often the most valuable component. In SA, a water use licence under the NWA can represent 30-50% of farm value in irrigation districts.

## Gotchas

1. **Commodity price volatility** — never model farm economics at spot prices. Use 3-year rolling averages or forward contract rates. Single-year snapshots are misleading.
2. **Water risk** — SA agriculture is water-constrained. Always check the Water Use Licence status and dam levels for the relevant water management area before projecting irrigated yields.
3. **Land reform** — understand the current policy framework (expropriation without compensation debate, ESTA, land claims). Title certainty affects valuations and bankability.
4. **Seasonality** — agricultural cash flows are highly seasonal. Monthly cash flow models are essential; annual averages hide liquidity crises.
5. **Climate variability** — use at least 10 years of rainfall data for the specific farm location, not regional averages. Micro-climate differences within a district can be material.
