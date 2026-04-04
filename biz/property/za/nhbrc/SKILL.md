---
name: biz/property/za/nhbrc
description: |
  NHBRC National Home Builders Registration Council. Use this skill when:
  (1) advising on home builder registration requirements in South Africa,
  (2) explaining home enrolment — the 15-day pre-construction requirement,
  (3) tracking NHBRC's 4-stage inspection framework (foundation, wall plate, roof, practical completion),
  (4) explaining the tiered warranty structure (3-month snag, 1-year roof, 5-year structural),
  (5) handling defect complaints, conciliation, or builder disciplinary processes,
  (6) integrating NHBRC compliance fields into ERP or project management systems,
  (7) determining whether a construction project falls under NHBRC scope (residential only).
license: MIT
compatibility: Housing Consumers Protection Measures Act, 1998 (Act 95 of 1998)
homepage: https://skills.2nth.ai/biz/property/za/nhbrc
repository: https://github.com/2nth-ai/skills
requires:
  - biz/property/za
improves:
  - biz/property/za
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "NHBRC, Home Builders, Warranties, Inspections, South Africa, Residential"
allowed-tools: Read Glob Grep
---

# NHBRC — National Home Builders Registration Council

## Overview

The NHBRC is a statutory body established in 1998 under the Housing Consumers Protection Measures Act, 1998 (Act 95 of 1998). Its mandate is to protect housing consumers and regulate the home building industry.

**Critical legal requirements:**
- Any person in the business of building homes **must** be registered — failure is a criminal offence (fine or imprisonment up to 1 year)
- Every new home **must** be enrolled at least **15 days before construction starts**
- The NHBRC conducts quality inspections at four construction stages
- Homes are covered by a tiered warranty from date of occupation

**Scope:** Residential home building only. Commercial and industrial construction falls outside NHBRC's mandate (though those projects must still comply with SANS 10400 and, for public sector work, CIDB requirements).

## Builder Registration

### Who Must Register
Any person or entity in the business of building homes, regardless of size or value.

### Application Process
1. Visit NHBRC Online Services Portal or nearest provincial office
2. Complete Builder Registration Form
3. Submit required documents:
   - Valid ID
   - Company registration documents (COR14.1, COR14.3 for new PTYs; CM29 for old PTYs)
   - Certified copy of share certificates
   - Valid Tax Clearance from SARS
   - Signed consent for credit checks
   - Trust resolution / Partnership agreement / Constitution (as applicable)
   - Appointment letter for Technical Manager (if not a managing member)
4. Pay application fee: **R745.61** (once-off, non-refundable)
5. Attend mandatory **Builders' Induction Workshop** at nearest NHBRC office
6. Pass the **Technical Assessment** (construction knowledge, SANS compliance, general building)
   - Two attempts within 30 days of paying application fee
   - Prepare via the Home Builders Manual (Parts 1, 2, and 3)
7. Receive registration certificate

### Home Builders Manual
- Manual only: ~R88
- Manual + SANS 10400: ~R3,168

### Renewal
- Annual membership: **R526.32**
- Must be renewed annually to maintain compliance

## Home Enrolment

Every new home must be enrolled at least **15 days before construction starts**.

- The **home builder** enrols the home (not the homeowner)
- Enrolment is per dwelling unit
- An enrolment fee applies (varies by project value)
- No warranty cover without enrolment
- Enrolment triggers the NHBRC inspection schedule

### What Counts as a "Home"
Any dwelling unit constructed for human habitation:
- Houses, townhouses, flats/apartments
- Government housing (RDP/BNG)
- Alterations and additions above a certain value threshold

## Inspection Stages

The NHBRC conducts a **minimum of four inspections**:

| Stage | What Is Inspected | SANS 10400 Alignment |
|-------|-------------------|----------------------|
| **1. Foundation** | Excavation, soil conditions, foundation layout, concrete quality | Part G (Excavations), Part H (Foundations) |
| **2. Wall plate** | Wall construction, damp-proof course, lintels, wall plate level | Part K (Walls), Part B (Structural design) |
| **3. Roof** | Roof structure, waterproofing, truss installation | Part L (Roofs) |
| **4. Practical completion** | Overall finish, plumbing, electrical, drainage, plan compliance | Parts J, O, P, R, T, W, XA |

### Non-Compliance
- Builder given reasonable time to rectify
- If unable/unwilling: NHBRC may stop construction, institute disciplinary proceedings, or arrange rectification and recover costs

## Warranty Structure

From the **date of first occupation**, three tiers apply:

### Tier 1: Minor Defects — 3 months
- Any deviation from plans, specifications, or agreement
- Any deficiency in design, workmanship, or materials
- Consumer must notify builder **in writing** within 3 months
- **Not** covered by NHBRC Warranty Fund — this is the builder's direct obligation

### Tier 2: Roof Leaks — 1 year
- Any roof leak
- Must be reported **in writing** within 1 year
- NHBRC intervenes if builder fails to respond

### Tier 3: Major Structural Defects — 5 years
- Defects affecting structural integrity
- Must be reported **in writing** within 5 years
- Covered by the **NHBRC Warranty Fund**
- If builder defaults, NHBRC arranges rectification

### Warranty Fund
Funded by enrolment fees. Provides the financial backstop for Tier 3 claims when the builder cannot or will not rectify.

## Complaints & Conciliation

1. Consumer identifies defect within warranty period
2. Consumer notifies builder **in writing** (keep proof)
3. Builder has reasonable time to rectify
4. If builder fails → consumer contacts nearest NHBRC Provincial Customer Care Office
5. NHBRC notifies builder and seeks response
6. If builder still fails → NHBRC issues request for conciliation
7. Consumer pays refundable conciliation deposit
8. Conciliation determines outcome
9. If conciliation fails → arbitration

### Builder Disciplinary Action
The NHBRC can act against builders who: fail to enrol homes, build below standards, refuse to rectify defects, engage in fraud, or fail to maintain registration.

## ERP Integration Points

### Builder/Contractor Fields
```
nhbrc_registration_number       — NHBRC registration number
nhbrc_registration_expiry       — Date (annual renewal)
nhbrc_technical_manager         — Appointed Technical Manager name
nhbrc_compliance_status         — Active / Expired / Suspended
```

### Project/Home Fields
```
nhbrc_enrolment_number          — Per dwelling unit
nhbrc_enrolment_date            — Must be ≥15 days before construction_start
nhbrc_enrolment_fee_paid        — Boolean + amount
construction_start_date         — Validated against enrolment date
```

### Inspection Tracking
```
inspection_stage                — Foundation / Wall Plate / Roof / Practical Completion
inspection_date                 — Date of NHBRC inspection
inspection_result               — Compliant / Non-compliant / Rectification Required
rectification_deadline          — Date
rectification_completed         — Boolean + date
```

### Warranty Tracking
```
occupation_date                 — Triggers warranty start
snag_list_deadline              — occupation_date + 3 months
roof_warranty_expiry            — occupation_date + 1 year
structural_warranty_expiry      — occupation_date + 5 years
defect_reports                  — Child table: date, type, description, status
```

### Validation Rules
- Block construction start if enrolment date < 15 days before construction start
- Alert on builder registration expiry
- Auto-generate warranty milestone dates from occupation date
- Require written defect notification records with timestamps

## Common Gotchas

1. **The 15-day enrolment rule is non-negotiable.** No enrolment = no warranty cover. This is the single most common compliance failure in residential construction.
2. **The 3-month snag list is NOT an NHBRC warranty claim.** It's the builder's direct obligation. NHBRC only backstops Tier 3 (structural, 5-year).
3. **Enrolment is per dwelling unit**, not per project. A 50-unit development requires 50 separate enrolments.
4. **The Technical Assessment has teeth.** Two attempts only within 30 days. Builders who fail both must reapply and repay the application fee.
5. **Written notification is essential** for all warranty claims. Verbal complaints have no legal standing under the Act.

## See Also

- [NHBRC Website](https://www.nhbrc.org.za)
- [biz/property/za](../SKILL.md) — Parent skill with regulatory overview
- [biz/property/za/sans-10400](../sans-10400/SKILL.md) — SANS 10400 parts aligned to inspection stages
- [biz/property/za/project-stages](../project-stages/SKILL.md) — Inspections mapped to project lifecycle
