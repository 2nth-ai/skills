---
name: biz/npo/fundraising/csi-landscape
description: |
  South African CSI and NPO funding ecosystem knowledge. Use this skill when:
  (1) understanding Section 18A tax deduction rules for PBO donations,
  (2) navigating BBBEE scorecard implications for corporate CSI spending,
  (3) identifying SA-specific funding cycles (financial year-end, ESG reporting seasons),
  (4) understanding the SA conservation funding landscape (SANParks, DFFE, provincial agencies),
  (5) advising NPOs on PBO registration, compliance, and donor tax certificates.
license: MIT
compatibility: Domain knowledge — no runtime dependencies
homepage: https://skills.2nth.ai/biz/npo/fundraising/csi-landscape
repository: https://github.com/2nth-ai/skills
requires: []
improves:
  - biz/npo/fundraising
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "CSI, Section 18A, BBBEE, South Africa, NPO Funding, Conservation"
allowed-tools: Read Glob Grep
---

# South African CSI & NPO Funding Landscape

Domain knowledge for AI agents working with South African non-profit organisations. This is reference material — no code, just knowledge that informs scoring, pitching, and compliance.

## Section 18A — Tax Deductible Donations

- NPOs registered as Public Benefit Organisations (PBOs) with SARS can issue Section 18A certificates
- Donors (individuals and corporates) deduct donations from taxable income (up to 10% of taxable income)
- **This is the single most important incentive for SA corporate donors** — always mention it
- The NPO must issue a Section 18A receipt with: PBO reference number, donor details, amount, date, nature of donation
- PBO reference number format: `930XXXXXX` (9 digits)

## BBBEE and CSI

- Broad-Based Black Economic Empowerment (BBBEE) scorecards include a Socio-Economic Development (SED) element
- Companies earn BBBEE points for CSI spending on approved beneficiaries
- Conservation and environmental NPOs qualify under the SED pillar
- **For corporate funders, BBBEE points are often the budget unlock** — frame donations as "BBBEE-compliant CSI investment"
- Enterprise and Supplier Development (ESD) is a separate pillar — relevant if the NPO procures from black-owned suppliers

## SA Funding Calendar

| Period | Event | Implication |
|--------|-------|-------------|
| Jan-Feb | New financial year (many corporates) | CSI budgets allocated — best time to pitch |
| Mar | Financial year-end (Feb year-end corporates) | Rush to deploy unspent CSI budget |
| Jun | Mid-year review | Corporates assess CSI portfolio — window for new partnerships |
| Jul-Sep | ESG reporting preparation | Corporates seek impact content for annual reports |
| Oct-Nov | Budget planning for next FY | Plant seeds for next year's CSI allocation |
| Dec | Year-end giving (individuals) | Individual donor campaigns, crowd-funding |

## SA Conservation Funding Ecosystem

### Government
- **SANParks** — 80% funded by eco-tourism revenue, remainder from government and donors
- **DFFE** (Department of Forestry, Fisheries and the Environment) — national conservation mandates
- **Provincial agencies**: Ezemvelo KZN Wildlife, CapeNature, SANBi

### Major Corporate CSI (Conservation)
- Anglo American (Biodiversity Grant)
- Rand Merchant Bank / FirstRand Foundation
- Santam (via WWF SA partnership)
- Nedbank (Green Affinity Programme, Green Trust)
- Vodacom Foundation
- Sasol CSI
- TotalEnergies SA

### International Foundations
- WWF (global + SA chapter)
- IUCN Save Our Species (Threatened Species + Rapid Action grants)
- Critical Ecosystem Partnership Fund (CEPF) — biodiversity hotspot funding
- JRS Biodiversity Foundation
- Peace Parks Foundation (Transfrontier Conservation Areas)

### Grant Programmes
- Anglo American Biodiversity Grant — annual cycle, ~May deadline
- IUCN-SOS Threatened Species Grant — biannual calls
- CEPF hotspot calls — varies by hotspot, Maputaland-Pondoland-Albany active
- Africa Hope Fund — rolling applications
- Wild Spirit Fund — rolling, smaller grants

## Common Gotchas

- **Section 18A is not automatic**: The NPO must be registered as a PBO with SARS AND approved for Section 18A status. These are separate registrations.
- **BBBEE verification**: Some corporates require the NPO itself to have a BBBEE certificate or letter of exemption. Check before pitching.
- **Financial year mismatch**: SA government runs Apr-Mar, most corporates run Jan-Dec or Jul-Jun. Time your outreach to their budget cycle, not yours.
- **Conservation is under-represented in CSI**: Education and health dominate SA CSI spend. Conservation NPOs must work harder to articulate economic impact (jobs, tourism, ecosystem services) not just environmental impact.

## See Also

- [biz/npo/compliance/pbo-registration](../../compliance/pbo-registration/SKILL.md) — PBO registration process
- [leg/data-privacy](../../../../leg/data-privacy/SKILL.md) — POPIA compliance for donor data
