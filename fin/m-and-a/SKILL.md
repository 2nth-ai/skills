---
name: m-and-a
description: |
  Mergers and acquisitions advisory expert. Use this skill when:
  (1) screening acquisition targets — criteria definition, longlist generation, initial assessment,
  (2) conducting commercial and financial due diligence on targets,
  (3) structuring transactions — share purchase, asset purchase, scheme of arrangement,
  (4) advising on deal negotiation — pricing mechanisms, earn-outs, warranties, indemnities,
  (5) modelling acquisition returns — accretion/dilution, synergy quantification, IRR on acquisition,
  (6) handling African cross-border M&A — exchange control, competition authority, sector regulators.
license: MIT
compatibility: Any
metadata:
  author: Gananda Connect (Barry Hawke)
  version: "1.0.0"
  homepage: "https://skills.2nth.ai/fin/m-and-a"
  repository: "https://github.com/2nth-ai/skills"
  requires: "fin/modelling, fin/reporting"
  improves: "fin"
  categories: "Finance, M&A, Mergers, Acquisitions, Due Diligence"
---

# Mergers & Acquisitions Advisory

Deal advisory for AI agents supporting M&A transactions — from target screening through to post-deal integration. Specialised in mid-market African transactions where information asymmetry is high and structured processes matter.

## Key Capabilities

- Target screening: criteria definition, database and registry searches, initial financial assessment
- Due diligence: commercial, financial, legal, tax, and operational DD workstreams
- Deal structuring: share purchase vs. asset purchase, pricing mechanisms, deferred consideration
- Valuation: EV/EBITDA multiples, DCF, comparable transactions, sum-of-parts
- Negotiation support: term sheet drafting, SPA mark-up, warranty and indemnity schedules
- Post-deal: 100-day plan, integration workstreams, synergy tracking

## Due Diligence Framework

Structure DD across five workstreams, each producing a findings report with RAG (Red/Amber/Green) risk ratings:

1. **Commercial DD** — market position, customer concentration, competitive dynamics, growth drivers
2. **Financial DD** — quality of earnings, normalised EBITDA, working capital analysis, net debt bridge
3. **Legal DD** — corporate structure, material contracts, litigation, IP ownership, regulatory compliance
4. **Tax DD** — tax compliance history, contingent liabilities, structure optimisation opportunities
5. **Operational DD** — management team, key person risk, systems, processes, scalability

## Pricing Mechanisms

The two standard approaches to pricing:

**Locked box** — price fixed at a historical date; seller bears no leakage risk post-lockbox date. Simpler, faster, preferred by sellers. Buyer needs strong DD on the lockbox accounts.

**Completion accounts** — price adjusted post-completion based on actual working capital, net debt, and cash at closing. More complex, protects buyer from balance sheet movements between signing and closing.

## Gotchas

1. **Normalised EBITDA** — always normalise for owner-manager adjustments (above-market salary, personal expenses through the business, related-party transactions). The gap between reported and normalised EBITDA in African mid-market deals is often 20-40%.
2. **Competition authority** — South African Competition Commission filing is mandatory above the thresholds (currently ~R600M combined / R100M target turnover for intermediate mergers). Filing delays can add 3-6 months. Factor this into timeline.
3. **Exchange control** — cross-border deals involving SA entities require SARB approval. Non-resident buyers need a ruling for outward investment. This is procedural but time-consuming.
4. **Key person risk** — in African mid-market, the owner IS the business. If they leave post-acquisition, revenue drops 30-50% within 12 months. Structure earn-outs and retention mechanisms accordingly.
