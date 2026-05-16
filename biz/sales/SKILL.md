---
name: B2B Sales
description: >
  B2B sales methodology, pipeline process, and revenue operations for complex sales
  cycles — prospecting through close through expansion. Covers qualification frameworks
  (MEDDIC, BANT, CHAMP), pipeline stage definitions, discovery question patterns,
  forecasting categories, proposal structure, and SA-specific context including
  FAIS-licensed sales, tender response cycles, B-BBEE scorecard implications, and
  POPIA-compliant outbound. The parent manifest for nine sub-skills covering each
  point in the cycle in depth.
requires: []
improves:
  - biz/crm
  - biz/crm/hubspot
  - biz/crm/salesforce
metadata:
  domain: biz
  subdomain: sales
  maturity: production
  author: 2nth.ai
  reviewed: 2026-05-16
---

# B2B Sales

Structured approach to business-to-business selling across the full revenue cycle. The agent loading this skill is supporting a sales motion — a salesperson, a sales leader, a RevOps engineer, or a founder who is the company's first salesperson. The agent's job is to make their thinking sharper and their cycle time shorter, not to replace the human judgement that closes deals.

## 1. Scope and structure

This domain has nine sub-skills under `biz/sales/`. Load the relevant one for the specific stage of the cycle:

| Sub-skill | Stage | Load when |
|---|---|---|
| `biz/sales/prospecting/` | Top of funnel | Building outbound lists, designing sequences, generating SDR scripts |
| `biz/sales/qualification/` | Lead → opportunity | Applying BANT / MEDDIC / CHAMP; deciding which deals deserve effort |
| `biz/sales/discovery/` | Early opportunity | Question design, current-state mapping, identifying the economic buyer |
| `biz/sales/proposal/` | Mid-cycle | Structuring proposals, costing options, terms |
| `biz/sales/negotiation/` | Late cycle | Concessions, multi-issue trades, "best alternative" planning |
| `biz/sales/pipeline/` | Sales management | Stage definitions, conversion rates, deal hygiene |
| `biz/sales/forecasting/` | Sales management | Commit / best-case / pipeline categorisation; weighted vs. unweighted views |
| `biz/sales/revops/` | Operations | Stack design, CRM hygiene, comp plans, territory carving |
| `biz/sales/enablement/` | Team-side | Playbooks, training material, role-plays, call coaching |

The parent skill (this file) covers the methodology choices and decisions that span sub-skills.

## 2. Core principle

B2B sales is a process of helping a buyer make a good decision. The seller's job is to:

1. Understand the buyer's **current state** — what's true today, what works, what doesn't, what it costs.
2. Co-define the buyer's **desired future state** — what changes, what value that creates, who benefits.
3. Quantify the **cost of the gap** — what the buyer loses every quarter they stay in the current state.
4. Demonstrate credibly that the seller's solution **closes that gap at acceptable cost and risk**.

If any of those four are skipped, the deal usually stalls in late stages or closes lost. Most "lost to no-decision" outcomes are gap-cost failures — the buyer wasn't shown the price of doing nothing.

## 3. Methodology choices — when each applies

There is no universal "best" B2B sales methodology. The right pick depends on deal size, cycle length, and the buyer's organisational complexity.

### 3.1 MEDDIC / MEDDPICC

- **What it is**: a qualification + opportunity-management framework: Metrics, Economic buyer, Decision criteria, Decision process, Identify pain, Champion, (Paper process, Competition).
- **Fits**: enterprise deals (R500k+ ACV), 3+ month cycles, multi-stakeholder buying committees.
- **Sign you're using it badly**: deals stuck in "verbal yes from champion" with no documented decision process. MEDDIC is rigorous about identifying the buying-committee mechanism, not just the friendly contact.

### 3.2 Challenger Sale

- **What it is**: organising the call around teach-tailor-take-control — the seller brings a commercial insight the buyer hadn't framed themselves, then leads them through implications.
- **Fits**: technical / consultative products where the buyer doesn't yet know they have the problem the seller solves; net-new categories.
- **Sign you're using it badly**: insights are generic ("everyone's doing AI now") rather than specific to the buyer's business mechanics.

### 3.3 SPIN Selling

- **What it is**: Situation → Problem → Implication → Need-payoff question sequence; uncovers the cost of the current state by walking the buyer through implications before offering a solution.
- **Fits**: products where the buyer underestimates the cost of their current workaround; classic for software-replacing-spreadsheets.
- **Sign you're using it badly**: launching into Solution before exhausting Implication questions. Most sellers run out of patience on implication and pitch too early.

### 3.4 Sandler

- **What it is**: an "anti-selling" approach with explicit upfront contracts, pain funnel, and a deliberate qualification-out path early.
- **Fits**: mid-market, transactional cycles where seller time is the constraint and unqualified prospects are the leak.
- **Sign you're using it badly**: applied to enterprise — the upfront-contract candour reads as combative to buying committees that need political room.

### 3.5 BANT (legacy)

- **What it is**: Budget, Authority, Need, Timeline. Originated at IBM in the 1950s; still the default qualification in many CRMs.
- **Fits**: short-cycle, transactional, single-stakeholder deals.
- **Sign you're using it badly**: applied to any modern enterprise SaaS deal. BANT misses the buying committee entirely and treats "authority" as a single person when modern deals have 5–10 stakeholders. Use MEDDIC / CHAMP instead for any deal over R100k ACV.

### 3.6 CHAMP

- **What it is**: Challenges, Authority, Money, Prioritisation. A reordering of BANT that leads with the buyer's challenge rather than the budget question.
- **Fits**: outbound-led motions where the seller is the first to surface the problem; mid-market SaaS.
- **Sign you're using it well**: discovery calls feel like a diagnostic, not an interrogation.

## 4. Pipeline stage definitions

Most teams butcher pipeline stages and then wonder why forecasting is broken. Stages are not "feelings" — they are exit-criteria-based gates. A deal does not advance to the next stage until the named criterion is **demonstrably met**.

| Stage | Exit criterion | Common probability range |
|---|---|---|
| **Lead** | Inbound or outbound contact made; no engagement yet | n/a (not a forecast stage) |
| **Engaged / MQL** | Two-way exchange occurred; not yet a sales opportunity | n/a |
| **Discovery booked** | First discovery meeting scheduled with right stakeholder | 5–10% |
| **Discovery completed** | Current state + desired future state mapped; pain quantified | 10–20% |
| **Qualified opportunity** | Economic buyer identified; decision criteria + process understood (MEDDIC) | 20–30% |
| **Proposal sent** | Written proposal sent; buyer has acknowledged receipt | 30–50% |
| **Verbal agreement** | Champion + economic buyer have indicated intent to proceed; pending paper | 60–75% |
| **Closed won / lost** | Contract signed, or buyer or seller has walked | 100% / 0% |

### 4.1 The 20–30% stage gap

Most pipeline leakage happens between Discovery Completed and Qualified Opportunity. The criterion "economic buyer identified" is harder than most reps admit — the friendly contact is usually not the EB. Force the test: who signs the contract? Who has the budget authority for this line item this fiscal year? If those names aren't documented, the deal is not in Qualified Opportunity.

### 4.2 The 60–75% stage trap

"Verbal agreement" deals slip more than any other stage. Verbal yes is not procurement yes. The clock starts on the paper process when the proposal is sent, not when verbal is given. Force the test: has procurement / legal opened a file?

## 5. Forecasting categories

A forecast is a public commitment by the rep to the sales leader. Pipeline coverage is a separate measure; do not conflate them.

| Category | Definition | What it commits |
|---|---|---|
| **Commit** | Rep is publicly committing this deal closes this quarter | Rep's quota credibility |
| **Best case** | Rep believes deal could close this quarter but has named risks | Pipeline strength signal |
| **Pipeline** | Deal exists this quarter but is not expected to close this quarter | Coverage measure |
| **Omitted** | Deal exists but is not in the current forecast | Hygiene check (should it be in pipeline?) |

### 5.1 Commit-call accuracy as a metric

Track Commit-call accuracy per rep per quarter: of deals the rep put in Commit, how many closed? A healthy rep is between 85–95%. Below 70% and the rep is sandbagging or guessing. Above 95% sustained is sandbagging — the rep is hiding deals in Best Case that they're confident in, which damages team forecasting at the leader level.

### 5.2 Weighted vs unweighted views

- **Weighted** pipeline = sum of (deal value × stage probability). Useful for coverage analysis.
- **Unweighted** Commit = sum of deal values in Commit. The only number that should drive quarterly forecast to the CFO.

Most CRM "weighted forecast" reports are misleading because they apply stage probability uniformly across reps. Two reps in the same stage have different conversion rates by history; the weighted view should use per-rep historical conversion, not stage-level probability.

## 6. Discovery question patterns

Discovery is the highest-leverage skill in B2B sales. Three families of questions structure a good discovery:

### 6.1 Current-state questions

- "Walk me through how that's done today."
- "Who owns that process? Who does the work? Who feels the pain when it goes wrong?"
- "What does it cost when [the failure mode] happens?"
- "How often does that happen — weekly, monthly?"

The goal is a quantified map of how work flows today. Until that map exists, no future state can be costed.

### 6.2 Desired-state questions

- "If that worked the way you wanted, what would change?"
- "Who would notice first?"
- "What does success look like at the end of [period]?"
- "What would the team be doing instead of [current friction]?"

The goal is a quantified picture of the future state that the buyer themselves articulates — not the seller projecting.

### 6.3 Gap-cost questions (the highest leverage)

- "What does [current state] cost the business per quarter?"
- "What's the consequence of doing nothing for another year?"
- "If you don't solve this in this fiscal year, what changes?"
- "Who else loses if [this doesn't get fixed]?"

The goal is to put a number on the cost of inaction. **Most lost-to-no-decision deals are gap-cost failures** — the buyer was never shown what staying in current state costs them.

## 7. Proposal structure

A proposal is not a brochure. It is a written argument that the buyer can take into a procurement or board meeting and defend without the seller in the room. Five sections, in this order:

### 7.1 Executive summary (one page)

- What problem is being solved
- What the recommended solution is
- What the investment is (range, not single figure, at this stage)
- What the expected outcome is, quantified

### 7.2 Current state

- The mapped current-state from discovery, in the buyer's words
- The quantified gap cost from §6.3
- The implications of staying in current state

### 7.3 Recommended solution

- What's proposed, scoped tightly
- What's deliberately out of scope (this discipline beats over-promising every time)
- The implementation approach in three to five steps
- The success metric the buyer will use to evaluate the work

### 7.4 Investment

- Pricing options (usually 2–3; a single price is a take-it-or-leave-it)
- Payment terms
- What's included; what's billed separately
- Total cost of ownership over the relevant horizon (3-year is standard)

### 7.5 Terms and next steps

- Contract structure
- Mutually-agreed next dates
- Who signs

## 8. Compensation and quota — the structural decisions

Comp plan design shapes seller behaviour more than any other RevOps decision. Three structural choices matter:

### 8.1 Base / variable ratio

- **70 / 30** (base / variable): conservative; suits long-cycle enterprise where ramp time is long
- **60 / 40**: standard mid-market SaaS
- **50 / 50**: aggressive; suits transactional / inside-sales motions with short cycles
- **30 / 70** or lower: rare; usually channel / agency-style reps with very short cycles

### 8.2 Quota multiple

A target rep should produce 4–5× their on-target earnings (OTE) in ACV / new bookings over a year. Below 4× and the comp model isn't sustainable for the business. Above 6× and the quota is probably set too high (or the rep is exceptional and being underpaid).

### 8.3 Accelerators and decelerators

- **Accelerators above quota**: 1.5–2.5× commission rate on bookings beyond 100% quota. Drives the back half of the year.
- **Decelerators below threshold**: many comp plans pay no commission below 50% of quota. Forces hygiene on under-performers.
- **Kicker for the year-end push**: 2–3× rate for the last 30 days of the fiscal year. Used to align rep behaviour with company need.

## 9. South African context

### 9.1 FAIS-licensed selling

If the agent is supporting a sale that involves financial product advice (insurance, investments, savings products, credit products), the seller is governed by the Financial Advisory and Intermediary Services (FAIS) Act 37 of 2002. FAIS-licensed sellers have specific record-keeping obligations and must give advice in writing for any decision over a low monetary threshold. **Do not script call patterns that include implied financial advice without confirming the seller is FAIS-licensed.**

### 9.2 Tender response cycles (public sector)

SA public-sector procurement runs on a published tender cycle. Key documents: Request for Information (RFI), Request for Proposal (RFP), Request for Bids (RFB), Service Level Agreement (SLA). Process is governed by the Preferential Procurement Policy Framework Act (PPPFA) 5 of 2000, the regulations under it (most recently 2022), and the Treasury Regulations. Bidder requirements typically include:

- B-BBEE certificate (level 1 or 2 carries a 20% scorecard advantage on most tenders)
- Tax clearance certificate
- CIPC documentation showing the bidding entity is in good standing
- Three years of audited financials (for tenders over R10m)

### 9.3 B-BBEE scorecard implications

The B-BBEE scorecard affects sales motion in three concrete ways:

- **Procurement preference**: many SA buyers (especially government, parastatals, banks, mining majors) require their suppliers to hold a specific B-BBEE level. A seller's B-BBEE level directly affects their addressable market.
- **Skills development scorecard element**: buyers can score points by procuring training services from B-BBEE-aligned vendors. Sales of training / consulting / advisory services can be positioned against this.
- **Supplier development**: large SA companies have specific budgets for developing smaller B-BBEE-aligned suppliers. Sales motion into these budgets is different from generic procurement.

### 9.4 POPIA-compliant outbound

The Protection of Personal Information Act 4 of 2013 (POPIA) imposes specific limits on cold outbound:

- **Direct marketing** to individuals requires opt-in consent (Section 69). This includes email and SMS marketing to individuals.
- **B2B email to a corporate role address** (e.g. `sales@company.com`) is generally treated as direct marketing to a juristic person, which is less restricted but still requires a lawful basis.
- **B2B email to a named individual at a company** is more restricted — the named individual is a data subject under POPIA, and direct marketing requires either prior opt-in or a valid existing-customer exception.
- **Record-keeping** of consent is mandatory. The seller must be able to demonstrate the basis for contacting any individual.

The practical implication for SA outbound: lists scraped from LinkedIn and used for cold email to named individuals carry POPIA risk. The safer pattern is referral-led or content-led inbound, with opt-in consent captured at form submission.

### 9.5 NCA implications (consumer credit)

If the deal involves any extension of credit to a consumer (Net 30 terms are credit, technically), the National Credit Act 34 of 2005 may apply. NCA registration is required for any business extending credit above defined thresholds; non-registration is unenforceable. For B2B sales of products that involve consumer-facing financing, this matters at the deal-structure stage, not at close.

## 10. When this skill applies — and when it doesn't

### 10.1 Applies

- Designing or auditing a sales process for a B2B company
- Building a revenue team from scratch
- Diagnosing pipeline health and forecast accuracy
- Coaching salespeople on specific deals
- Writing sales collateral and playbooks
- Structuring compensation and quota plans
- Designing the CRM stage model
- Running a sales-leadership operating cadence (weekly forecast call, monthly pipeline review)

### 10.2 Does not apply (load a different skill)

- **B2C sales** — different motion entirely; the cost-of-gap framing rarely fits consumer decisions
- **Channel / partner sales** — the buyer is the partner, not the end user; different qualification logic
- **Inside / SDR-only motion at the lead-gen stage** — load `biz/sales/prospecting` directly
- **Customer success or account expansion** — different motion than new acquisition; load `biz/sales/revops` for the post-sale expansion plays
- **Marketing-led demand generation** — load `mkt/sa` or general marketing skills

## 11. The agent's role

When this skill is loaded into an agent supporting B2B sales work, the agent should:

1. **Surface the right framework for the deal at hand**, not the framework the user mentioned. If a rep says "BANT this for me" on a R2m enterprise deal, recommend MEDDIC instead and explain why.
2. **Draft, never decide**. Proposals, discovery questions, follow-up emails, pipeline notes — the agent drafts; the human edits and sends.
3. **Quantify wherever possible**. Pipeline notes should carry numbers — deal size, days in stage, last meaningful interaction date. Forecast categories should be defended in writing.
4. **Flag stage hygiene**. If a deal has been in "Verbal Agreement" for more than 30 days without movement, surface that. If a rep has no Commit deals two weeks into the quarter, surface that.
5. **Respect the human-in-the-loop**. The seller closes; the agent shortens cycle time, sharpens thinking, and reduces the rep's CRM hygiene tax.

## 12. References and further reading

- *The Challenger Sale*, Dixon & Adamson — Challenger framework reference
- *SPIN Selling*, Neil Rackham — SPIN reference, dated but the implication-question discipline is still the strongest in the field
- *MEDDIC Qualification* — open material at meddic.com; the original framework
- *Predictable Revenue*, Aaron Ross — outbound SDR motion reference; methodology now dated, the operating-model section still applies
- FAIS Act 37 of 2002 — full text at gov.za
- POPIA Act 4 of 2013 — full text at gov.za
- PPPFA 5 of 2000 and regulations — National Treasury website for tender-cycle requirements
- B-BBEE Amended Codes — Department of Trade, Industry and Competition (DTIC)
