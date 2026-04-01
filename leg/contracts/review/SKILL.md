---
name: leg/contracts/review
description: |
  Contract review AI expert. Use this skill when:
  (1) performing first-pass review of commercial contracts (NDA, MSA, SLA, employment, vendor, SaaS),
  (2) identifying non-standard clauses and deviations from market standard positions,
  (3) detecting missing standard clauses (IP ownership, DPA, force majeure, dispute resolution),
  (4) scoring clause risk on a 1-10 scale with rationale and recommendations,
  (5) calculating maximum liability exposure scenarios and triggering conditions,
  (6) generating redline alternative clause language with commercial rationale,
  (7) comparing an incoming contract against a stored standard baseline template,
  (8) producing structured review reports or executive summaries for legal or board distribution,
  (9) jurisdiction-aware review for South African (POPIA), UK (GDPR), or US contracts.
license: MIT
compatibility: Any — outputs JSON, Markdown, redline documents
homepage: https://skills.2nth.ai/leg/contracts/review
repository: https://github.com/2nth-ai/skills
requires: []
improves:
  - leg/contracts
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Legal, Contracts, Risk, NDA, MSA, Compliance"
allowed-tools: Read Write Edit Glob Grep
---

# Contract Review AI

> **Legal Disclaimer:** This skill assists qualified legal professionals with research, drafting, and review workflows. It does not constitute legal advice and does not replace qualified legal counsel. All AI-generated risk scores, redline suggestions, and review reports must be reviewed and approved by a qualified legal professional before use in any commercial transaction.

This skill equips AI agents with the legal knowledge to perform first-pass contract review — identifying non-standard clauses, flagging missing protections, scoring risk per clause, and producing a structured review report. It reduces the time a qualified lawyer or contracts manager spends on initial review by handling the systematic comparison work, so human attention focuses on clauses that genuinely require professional judgment and negotiating strategy.

## Configuration

```bash
# .env — optional configuration
LEG_JURISDICTION=ZA            # Default: ZA (South Africa). Options: ZA | UK | US
LEG_BASELINE_TEMPLATE=standard # Use 'standard' or path to custom baseline JSON
LEG_RISK_THRESHOLD=6           # Flag clauses at or above this risk score (1-10)
```

## Supported Contract Types

- **NDA** — mutual and one-way non-disclosure agreements
- **MSA / PSA** — master services and professional services agreements
- **SLA** — service level agreements with SLO and credit provisions
- **Employment** — employment contracts (SA LRA compliant)
- **Vendor / Supplier** — procurement and vendor agreements
- **Software / SaaS** — software licence and subscription agreements

## Core Capabilities

- **Clause-by-clause risk scoring** — 1-10 scale with rationale for each score
- **Non-standard term identification** — comparison against configurable baseline or market standard
- **Missing clause detection** — what is absent matters as much as what is present
- **Liability exposure analysis** — maximum exposure scenarios with triggering conditions
- **Payment terms summarisation** — structured extraction of all payment obligations
- **Termination right mapping** — all termination triggers, notice periods, and consequences
- **IP ownership clause extraction** — work product, background IP, and licence grants
- **Comparative analysis** — deviation report against stored standard templates
- **Executive summary generation** — board-ready risk summary with key concerns
- **Redline suggestion generation** — alternative clause language with commercial rationale

## Review Output Structure

```json
{
  "contract_review": {
    "document": "Master Services Agreement — Vendor XYZ",
    "review_date": "2026-03-31",
    "overall_risk_score": 7.2,
    "summary": "Above-market risk profile. Primary concerns: uncapped liability, missing IP ownership clause, unilateral termination right for vendor.",
    "clause_analysis": [
      {
        "clause": "Limitation of Liability",
        "location": "Section 8.2",
        "text_extracted": "Vendor's total liability shall not exceed the fees paid in the preceding 30 days...",
        "risk_score": 9,
        "issue": "30-day cap is extremely low for a 12-month contract — effectively limits recovery to 1/12th of annual fees",
        "market_standard": "12-month lookback is standard; some contracts use total contract value",
        "recommendation": "Negotiate to 12-month fee cap minimum, or total contract value for material breaches"
      },
      {
        "clause": "IP Ownership",
        "location": "Not found",
        "risk_score": 8,
        "issue": "No IP assignment clause — ownership of work product is ambiguous",
        "recommendation": "Add explicit clause: all work product created under this agreement vests in Client upon payment"
      }
    ],
    "missing_clauses": ["IP ownership", "Data processing agreement", "Business continuity"],
    "favourable_clauses": [
      "Confidentiality (Section 5) — standard 3-year term",
      "Governing law (South Africa — Western Cape) — acceptable"
    ]
  }
}
```

## Redline Suggestion Format

```markdown
## Original (Section 8.2):
Vendor's total liability shall not exceed the fees paid in the **preceding 30 days**.

## Suggested Redline:
Vendor's total liability shall not exceed the **greater of (i) the fees paid in the
preceding 12 months or (ii) ZAR 500,000** for any single claim or series of related claims.

## Rationale:
30-day cap creates insufficient protection for a 12-month engagement. 12-month lookback
is market standard for services contracts of this nature.
```

## Pairing by Role

| Role | Primary Use |
|------|-------------|
| Contracts Manager | AI reviews vendor MSA, scores each clause, flags deviations from standard terms, drafts redline suggestions for review |
| In-house Counsel | AI extracts liability exposure scenarios, calculates maximum risk, identifies triggering conditions for legal review |
| Procurement Lead | AI compares incoming vendor terms against standard playbook, produces deviation register for negotiation briefing |
| Legal Ops | AI processes contract pipeline, categorises by risk level, routes high-risk agreements for priority legal review |

## MCP Tools

| Tool | Description |
|------|-------------|
| `leg_review_contract` | Run full first-pass review on a contract document, returning structured analysis with overall risk score |
| `leg_extract_clauses` | Extract and categorise all identifiable clauses from a contract document |
| `leg_score_risk` | Score a specific clause or clause text on the 1-10 risk scale with rationale |
| `leg_detect_missing` | Identify standard clauses that are absent from the contract given its type and jurisdiction |
| `leg_suggest_redline` | Generate alternative clause language for a flagged provision with commercial rationale |
| `leg_summarise_terms` | Produce an executive summary of key commercial terms: payment, liability, IP, termination |
| `leg_compare_baseline` | Compare contract against a stored standard template and produce a deviation register |
| `leg_analyse_liability` | Calculate maximum liability exposure scenarios with triggering conditions |
| `leg_generate_report` | Produce a formatted review report suitable for legal or board distribution |

## Clause Types Reference

Market standard positions for 15 standard clause types across SA, UK, and US commercial agreements:

| Clause Type | Normal Position | Red Flags |
|-------------|----------------|-----------|
| Limitation of Liability | 12-month fee cap; consequential loss excluded | No cap; sub-30-day lookback; consequential loss included |
| Indemnification | Mutual; IP & gross negligence only; capped | One-way; no cap; defence costs included |
| Termination for Convenience | Mutual; 90-day notice | Unilateral vendor; 7-day notice; fees accelerate |
| Termination for Cause | Mutual; 30-day cure period | No cure; immediate; broad triggers |
| IP Ownership | Client owns work product; vendor retains background IP | Clause absent; vendor owns all; ownership ambiguous |
| Confidentiality | Mutual; 3 years; standard exclusions | Perpetual; one-way; no exclusion for public domain |
| Payment Terms | 30 days net; dispute mechanism | 7-day terms; default interest above prime; no dispute mechanism |
| Warranties | Fitness for purpose; compliance with specs; no IP infringement | No warranties; total disclaimer; no remedy on breach |
| Governing Law | Agreed neutral jurisdiction; clearly specified | Absent; vendor's home jurisdiction only |
| Dispute Resolution | Negotiation then mediation then arbitration | Immediate litigation; foreign courts only; no cost sharing |
| Force Majeure | Defined events; notice; termination if >90 days | No definition; no notice; no termination right |
| Change of Control | Either party may terminate on change; notice required | Absent; automatic assignment permitted |
| Data Protection | POPIA/GDPR compliant; DPA attached; 72hr breach notification | No DPA; no breach notification; no data deletion obligation |
| Non-Solicitation | Mutual; 12 months; employees only | Unlimited duration; covers contractors and clients |
| Entire Agreement | Supersedes prior; amendments in writing only | Unilateral variation right; no notice of changes |

## Common Gotchas

- **Liability cap arithmetic** — a 30-day cap on a 12-month contract limits recovery to 1/12th of annual fees. Always calculate the absolute ZAR/USD/GBP value implied by the cap formula, not just the formula itself.
- **Consequential loss carve-outs** — many contracts disclaim consequential loss in general terms but then include specific indemnities (e.g. for IP infringement) with no cap. The specific indemnity overrides the general disclaimer. Check both.
- **Missing clauses are risk too** — an absent IP ownership clause is often more dangerous than a bad one. The default legal position (IP stays with the creator) is rarely what the client intends.
- **Governing law vs jurisdiction** — a contract can specify South African law but require disputes be heard in London courts. These are separate clauses; both must be checked.
- **Force majeure scope creep** — overly broad definitions (e.g. "any event beyond the vendor's control") can excuse performance for foreseeable operational failures like staffing shortages.
- **Data processing agreements** — POPIA (South Africa) and GDPR (UK/EU) both require a formal DPA when personal data is processed. Absence is a regulatory risk independent of the commercial terms.
- **Non-compete vs non-solicitation** — non-compete clauses in employment contracts are rarely enforceable in South Africa; non-solicitation clauses generally are. Flag scope and duration of both.

## See Also

- [leg/contracts](../SKILL.md) — contracts subdomain manifest
