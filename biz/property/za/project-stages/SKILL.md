---
name: biz/property/za/project-stages
description: |
  South African property development lifecycle with ERP integration. Use this skill when:
  (1) planning a property development project mapped to SA regulatory milestones,
  (2) customizing ERPNext for South African construction compliance — doctypes, fields, validation rules,
  (3) building compliance checklists for each construction stage (pre-construction through post-occupation),
  (4) determining which documents are required at each stage of SA construction,
  (5) mapping SANS 10400, CIDB, and NHBRC requirements to project timeline,
  (6) implementing automated compliance validation in project management systems,
  (7) creating handover documentation packages for SA residential construction.
license: MIT
compatibility: ERPNext v14+, adaptable to any ERP or project management system
homepage: https://skills.2nth.ai/biz/property/za/project-stages
repository: https://github.com/2nth-ai/skills
requires:
  - biz/property/za
  - biz/property/za/sans-10400
  - biz/property/za/cidb
  - biz/property/za/nhbrc
improves:
  - biz/property/za
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Project Management, ERP, ERPNext, Construction Lifecycle, Compliance Checklists, South Africa"
allowed-tools: Read Write Edit Glob Grep Bash(bench:*) Bash(erpnext:*)
---

# Project Stages & ERP Integration for SA Property Development

## Development Lifecycle

A typical South African residential property development follows these stages. Each has specific regulatory requirements from SANS 10400, CIDB, and/or NHBRC.

### Stage 0: Feasibility & Land Acquisition
- Zoning confirmation with local municipality
- Geotechnical investigation (required by SANS 10400-B for dolomite lands, recommended elsewhere)
- Environmental impact assessment (if required by NEMA)
- Title deed and SG diagram review

### Stage 1: Design & Plan Approval
- Engage competent person (architect/engineer) for design
- Prepare building plans per SANS 10400-A requirements
- Submit plans to local authority for approval
- Await approval (30–60 working days)
- Obtain CIDB-registered contractor (for public sector projects)
- Register builder with NHBRC (if not already registered)

### Stage 2: Pre-Construction
- Enrol each home with NHBRC (minimum 15 days before construction)
- Appoint CIDB-graded contractor (verify grade vs project value)
- Site establishment per SANS 10400-F (Site Operations)
- Secure construction guarantee/insurance
- Submit construction schedule to NHBRC

### Stage 3: Foundation
- Clear site per SANS 10400-F
- Excavate per SANS 10400-G
- Lay foundations per SANS 10400-H and approved plans
- **NHBRC Inspection 1: Foundation stage**
- Obtain foundation sign-off before proceeding

### Stage 4: Superstructure
- Construct walls per SANS 10400-K (masonry, damp-proof course)
- Install lintels, wall plate
- **NHBRC Inspection 2: Wall plate / Structural stage**
- Construct floors per SANS 10400-J
- Install stairways per SANS 10400-M (if applicable)

### Stage 5: Roof & Envelope
- Install roof structure per SANS 10400-L
- Waterproofing (watertight 5+ years without maintenance)
- Install glazing per SANS 10400-N
- **NHBRC Inspection 3: Roof stage**
- Energy compliance check per SANS 10400-XA (building envelope)

### Stage 6: Services & Finishes
- Electrical installation (registered electrician → CoC required)
- Plumbing installation (registered plumber → CoC required)
- Drainage per SANS 10400-P
- Stormwater disposal per SANS 10400-R
- Lighting and ventilation per SANS 10400-O
- Fire protection per SANS 10400-T (especially multi-unit)
- Disability access per SANS 10400-S (if applicable)

### Stage 7: Practical Completion & Handover
- **NHBRC Inspection 4: Practical completion**
- Obtain occupancy certificate from local authority
- Obtain electrical and plumbing Certificates of Compliance
- Compile as-built drawings
- Handover package: warranty docs, maintenance manual, CoCs, approved plans

### Stage 8: Post-Occupation (Warranty Period)
- 3-month snag list period (builder's obligation)
- 1-year roof leak warranty
- 5-year major structural defect warranty (NHBRC Warranty Fund)
- Track and manage defect reports

## Regulatory Milestones Matrix

| Stage | SANS 10400 | CIDB | NHBRC |
|-------|------------|------|-------|
| Feasibility | Part B (geotech) | — | — |
| Design | Part A (plans) | — | — |
| Pre-construction | Part F (site ops) | Contractor grade verification | Home enrolment (15 days before) |
| Foundation | Parts G, H | — | Inspection 1 |
| Superstructure | Parts J, K, M | — | Inspection 2 |
| Roof | Parts L, N, XA | — | Inspection 3 |
| Services | Parts O, P, R, T, W | — | — |
| Completion | All parts | Project registered on RoP | Inspection 4 |
| Handover | — | — | Warranty starts |
| Post-occupation | — | — | 3mo / 1yr / 5yr warranty |

## ERPNext Doctype Mapping

### Project (master)
```
project_name                    — Development name
project_type                    — Residential / Commercial / Mixed
local_authority                 — Municipality name
zoning_status                   — Confirmed / Pending / Requires rezoning
plan_approval_date              — Date plans approved
plan_approval_reference         — Local authority reference number
occupancy_classification        — Per SANS 10400 Part A (H3, H4, etc.)
estimated_cidb_grade            — Required contractor grade
environmental_approval          — Required / Not required / Approved
geotechnical_report             — Attached / Not required
```

### Dwelling Unit (child of Project)
```
unit_number                     — Unit identifier
nhbrc_enrolment_number          — NHBRC enrolment reference
nhbrc_enrolment_date            — Must be ≥15 days before construction_start
construction_start_date         — Actual start
inspection_1_date               — Foundation
inspection_1_result             — Pass / Fail / Rectification
inspection_2_date               — Wall plate
inspection_2_result
inspection_3_date               — Roof
inspection_3_result
inspection_4_date               — Practical completion
inspection_4_result
occupancy_certificate_date      — From local authority
occupation_date                 — Consumer moves in
snag_list_deadline              — Auto: occupation_date + 90 days
roof_warranty_expiry            — Auto: occupation_date + 365 days
structural_warranty_expiry      — Auto: occupation_date + 1825 days
electrical_coc_date             — Electrical Certificate of Compliance
plumbing_coc_date               — Plumbing Certificate of Compliance
```

### Contractor (linked to Supplier)
```
cidb_registration_number
cidb_grade                      — 1–9
cidb_classes_of_works           — Multi-select (CE, GB, ME, etc.)
cidb_registration_expiry
cidb_max_tender_value           — Auto from grade
nhbrc_registration_number       — For residential builders
nhbrc_registration_expiry
nhbrc_technical_manager
```

### Compliance Checklist
```
project                         — Link to Project
stage                           — Pre-construction / Foundation / Superstructure / Roof / Services / Completion
sans_10400_parts_applicable     — Multi-select (A, B, C, etc.)
checklist_items                 — Child table of individual checks
overall_status                  — Pending / In Progress / Compliant / Non-compliant
sign_off_by                     — Competent person name
sign_off_date
```

## Compliance Checklists

### Pre-Construction
- [ ] Building plans approved by local authority
- [ ] NHBRC home enrolment confirmed (≥15 days before start)
- [ ] Contractor CIDB registration verified (grade ≥ project requirement)
- [ ] Contractor NHBRC registration verified (current)
- [ ] Geotechnical report obtained (if required)
- [ ] Site establishment plan per SANS 10400-F
- [ ] Construction guarantee/insurance in place
- [ ] Environmental approval obtained (if required)

### Foundation
- [ ] Site cleared per SANS 10400-F
- [ ] Excavation per SANS 10400-G (safe faces, appropriate depth)
- [ ] Foundation layout matches approved plans
- [ ] Concrete quality per specification
- [ ] Damp-proof membrane installed
- [ ] NHBRC Inspection 1 completed and passed
- [ ] Foundation sign-off by competent person

### Wall Plate
- [ ] Masonry per SANS 10400-K
- [ ] Damp-proof course correctly positioned (above finished ground level)
- [ ] Lintels correctly installed over all openings
- [ ] Wall plate level and aligned
- [ ] Window and door openings per approved plans
- [ ] NHBRC Inspection 2 completed and passed

### Roof
- [ ] Roof structure per SANS 10400-L and engineer's design
- [ ] Trusses correctly installed and braced
- [ ] Waterproofing installed (5+ year durability)
- [ ] Fascia and barge boards installed
- [ ] Roof drainage connected
- [ ] NHBRC Inspection 3 completed and passed

### Practical Completion
- [ ] All construction per approved plans and SANS 10400
- [ ] Electrical installation complete with CoC
- [ ] Plumbing installation complete with CoC
- [ ] Drainage per SANS 10400-P connected and tested
- [ ] Stormwater per SANS 10400-R properly channelled
- [ ] Lighting and ventilation per SANS 10400-O
- [ ] Fire protection per SANS 10400-T (if applicable)
- [ ] Energy compliance per SANS 10400-XA demonstrated
- [ ] Disability access per SANS 10400-S (if applicable)
- [ ] NHBRC Inspection 4 completed and passed
- [ ] Occupancy certificate obtained from local authority
- [ ] As-built drawings compiled
- [ ] Handover documentation package prepared

## Document Requirements by Stage

### At Plan Submission
- Architectural drawings (site plan, floor plans, elevations, sections)
- Structural engineer's drawings and calculations
- Energy compliance documentation (SANS 10400-XA)
- Geotechnical report (if applicable)
- SG diagram and title deed
- Municipal rates clearance
- NHBRC enrolment proof

### During Construction
- NHBRC inspection reports (4 stages)
- Site diary/logbook
- Material test certificates (concrete cube tests, etc.)
- Variation orders (if changes to approved plans)
- Progress photographs

### At Handover
- Occupancy certificate (from local authority)
- Electrical Certificate of Compliance
- Plumbing Certificate of Compliance
- NHBRC final inspection report
- As-built drawings
- Warranty documentation
- Maintenance manual
- Keys and access devices

### Post-Occupation
- Defect reports (within warranty periods)
- Proof of written notification to builder
- NHBRC conciliation records (if applicable)
- Rectification completion records

## Common Gotchas

1. **Stage gates are hard dependencies.** You cannot pour a foundation before NHBRC enrolment. You cannot proceed past foundation without Inspection 1 sign-off. ERP workflows must enforce this sequencing.
2. **Occupation date drives all warranty calculations.** Get this date wrong and every downstream deadline is wrong. Make it a required field with audit trail.
3. **Variation orders require updated plan approval.** Any change to approved plans during construction needs local authority sign-off — not just an internal change order.
4. **CoCs are per-installation, not per-project.** A multi-unit development needs separate electrical and plumbing CoCs for each unit.
5. **The handover package is a legal deliverable**, not a nice-to-have. Missing documents at handover create liability exposure throughout the warranty period.

## See Also

- [biz/property/za](../SKILL.md) — Parent skill with regulatory overview
- [biz/property/za/sans-10400](../sans-10400/SKILL.md) — Building code details per part
- [biz/property/za/cidb](../cidb/SKILL.md) — Contractor grading and procurement
- [biz/property/za/nhbrc](../nhbrc/SKILL.md) — Builder registration and inspections
