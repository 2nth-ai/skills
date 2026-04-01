---
name: Commercial Contracts
description: >
  (1) Commercial contract fundamentals — MSAs, SLAs, NDAs, service agreements, and
  the key clauses every CEO must understand before signing anything.
requires:
  - leg/contracts
improves: []
metadata:
  domain: leg
  subdomain: commercial
  maturity: stable
  jurisdiction: ZA
---

# Commercial Contracts

Every commercial relationship rests on a contract. Most business disputes arise not from bad faith but from ambiguous agreements — terms that meant different things to each party, obligations that were assumed but not written, and consequences that were never discussed. The CEO's job is to know what the business is agreeing to before the ink dries.

> Leo drafts first versions and flags risk. For high-value or complex agreements, engage a commercial attorney to finalise.

---

## The Essential Commercial Documents

### Master Service Agreement (MSA)
The governing agreement for an ongoing commercial relationship. Sets the terms under which individual work orders or statements of work (SOWs) are delivered.

**Key clauses**:
- **Scope of services**: What is included and what explicitly is not
- **Payment terms**: When invoices are due, late payment consequences
- **IP ownership**: Who owns what is created under the agreement (see `leg/ip`)
- **Confidentiality**: What information is confidential and for how long
- **Indemnification**: Who bears liability if something goes wrong
- **Limitation of liability**: The cap on damages either party can claim (typically 12 months of fees paid)
- **Term and termination**: Duration, notice periods, termination for cause vs convenience
- **Governing law**: Which country's law applies and which courts have jurisdiction

### Statement of Work (SOW)
A project-specific document that sits under an MSA. Defines:
- Deliverables (specific and measurable, not vague)
- Timeline and milestones
- Fees and payment schedule
- Acceptance criteria — how does the client confirm the work is complete?
- Change order process — what happens when scope changes?

### Non-Disclosure Agreement (NDA)
Protects confidential information shared between parties.

**One-way vs mutual**: A one-way NDA protects only one party's information. A mutual NDA protects both. Use mutual for any early-stage commercial discussion.

**Key terms to review**:
- Definition of confidential information (should be broad enough to cover all relevant information)
- Exclusions (information already public, independently developed, received from a third party)
- Permitted disclosures (employees, advisors on a need-to-know basis)
- Duration (2–5 years is standard; perpetual is unusual and often unenforceable)
- Return or destruction of information on termination

### Service Level Agreement (SLA)
Defines performance standards:
- Uptime commitments (99.9% = ~8.7 hours downtime/year)
- Response and resolution times by severity
- Remedies for SLA breach (service credits, termination right)
- Measurement methodology
- Exclusions (force majeure, scheduled maintenance)

---

## Red Flag Clauses

These clauses in any agreement warrant careful review before signing:

| Clause | Risk |
|--------|------|
| **Unlimited liability** | No cap on damages you can face |
| **Indemnity for third-party claims** | You bear cost of lawsuits you didn't cause |
| **Auto-renewal without notice** | Locked in for another term without realising |
| **Unilateral price change** | Supplier can increase fees without your agreement |
| **Broad IP assignment** | You assign IP you didn't intend to give away |
| **Non-compete / non-solicit** | Restricts who you can hire or what markets you enter |
| **Exclusivity** | You cannot work with others in a category or geography |
| **Penalty clauses** | Fixed penalties (not just damages) for breach |
| **Governing law in foreign jurisdiction** | Disputes resolved under unfamiliar law, potentially abroad |

---

## Negotiation Priorities

Not all clauses are equally important. Focus energy on:

1. **Liability cap**: Negotiate to fees paid in the last 12 months. Resist unlimited liability at all costs.
2. **IP ownership**: Confirm your position before signing (see `leg/ip`)
3. **Termination rights**: Ensure you can exit if the relationship breaks down — avoid long notice periods without a termination-for-convenience right
4. **Payment terms**: Your standard terms, not theirs
5. **Governing law**: South African law and SA courts for SA-based transactions

Accept without negotiation: boilerplate definitions, standard confidentiality language, anti-corruption clauses (these protect both parties).

---

## Contract Management

A signed contract in a drawer is a liability, not an asset.

**Contract register** — minimum fields:
- Counterparty name
- Contract type
- Start date and end date
- Auto-renewal date (with notice period)
- Value (annual and total)
- Key obligations and responsible owner
- Termination notice date (when must you act to avoid auto-renewal?)

Review the contract register quarterly. The auto-renewal date is the one most often missed — and most expensive to recover from.
