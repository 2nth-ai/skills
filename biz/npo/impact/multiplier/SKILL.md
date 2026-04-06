---
name: biz/npo/impact/multiplier
description: |
  ROI and multiplier effect calculation for NPOs. Use this skill when:
  (1) calculating and presenting the donation-to-impact ratio,
  (2) building interactive "what your donation buys" calculators,
  (3) demonstrating value-for-money to corporate CSI committees.
license: MIT
homepage: https://skills.2nth.ai/biz/npo/impact/multiplier
repository: https://github.com/2nth-ai/skills
requires: []
improves:
  - biz/npo/impact
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "ROI, Multiplier Effect, Value for Money, Impact Calculator"
allowed-tools: Read Write Edit Glob Grep
---

# Multiplier Effect Calculator

Many NPOs leverage volunteer labour, donated equipment, or in-kind services that amplify each donated rand. The multiplier effect quantifies this for funders.

## Calculation Model

```typescript
interface MultiplierModel {
  donorContribution: number;       // What the funder pays (e.g., fuel costs)
  volunteerContribution: number;   // Value of volunteer time/equipment
  totalValue: number;              // Total mission value delivered
  multiplier: number;              // totalValue / donorContribution
}

// Example: The Bateleurs
// Pilots donate 75% of mission costs (time + aircraft operations)
// Donors cover 25% (fuel + lean ops team)
// R1 donated + R3 volunteered = R4 conservation value
// Multiplier = 4:1

function calculateMultiplier(donorPct: number): MultiplierModel {
  const donorContribution = 1;  // normalised to R1
  const volunteerContribution = (1 - donorPct) / donorPct;
  const totalValue = donorContribution + volunteerContribution;
  return {
    donorContribution,
    volunteerContribution,
    totalValue,
    multiplier: totalValue,
  };
}
```

## Presentation

For a funder donating R250,000 with a 4:1 multiplier:
- "Your R250,000 generates R1,000,000 in conservation value"
- "75% of mission costs are absorbed by our 200+ volunteer pilots"
- "You fund the fuel — they donate the aircraft, the maintenance, and their time"

## Common Gotchas

- **Be honest about the multiplier**: Only count genuine volunteer/in-kind contributions. Don't inflate with notional values.
- **Different funders care about different framing**: Corporates want ROI language. Foundations want impact-per-rand. Government wants beneficiary reach.
- **The multiplier is a pitch tool, not an accounting tool**: It illustrates leverage, not financial returns. Never imply financial ROI.

## See Also

- [biz/npo/fundraising/grant-writing](../../fundraising/grant-writing/SKILL.md) — Multiplier in pitches
