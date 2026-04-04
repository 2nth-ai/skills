---
name: biz/property/za/cidb
description: |
  CIDB Construction Industry Development Board contractor registration and grading. Use this skill when:
  (1) checking contractor eligibility for South African construction tenders,
  (2) understanding CIDB grading designations (1GB through 9CE) and tender value limits,
  (3) advising on contractor registration, renewal, or grade upgrades,
  (4) structuring public sector procurement per the CIDB Standard for Uniformity,
  (5) mapping CIDB classes of works (CE, GB, ME, EB, etc.) to project requirements,
  (6) integrating contractor compliance fields into ERP or project management systems,
  (7) understanding financial sponsorship rules for CIDB grading.
license: MIT
compatibility: CIDB Act 38 of 2000, tender value ranges revised October 2019
homepage: https://skills.2nth.ai/biz/property/za/cidb
repository: https://github.com/2nth-ai/skills
requires:
  - biz/property/za
improves:
  - biz/property/za
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "CIDB, Contractors, Grading, Tenders, South Africa, Procurement"
allowed-tools: Read Glob Grep
---

# CIDB — Construction Industry Development Board

## Overview

The CIDB was established by the CIDB Act 38 of 2000. It is a Schedule 3A national public entity under the PFMA with a mandate to develop and regulate the South African construction industry.

**Key function:** Maintains the **Register of Contractors** (RoC) and the **Register of Projects** (RoP). Any contractor performing public sector construction work must be registered and graded.

**Legal requirement:** No public sector client may award a construction contract to an unregistered contractor.

## Grading System (Grades 1–9)

The grading system determines the maximum rand value of projects a contractor can bid for.

| Grade | Max Tender Value (post-2019) | Track Record | Capital |
|-------|------------------------------|-------------|---------|
| 1 | R200,000 | None | None |
| 2 | R1,000,000 | Required | Required |
| 3 | R3,000,000 | Required | Required |
| 4 | R6,000,000 | Required | Required |
| 5 | R13,000,000 | Required | Required |
| 6 | R40,000,000 | Required | Required |
| 7 | R80,000,000 | Required | Required |
| 8 | R200,000,000 | Required | Required |
| 9 | No limit | Required | Required |

> Tender value ranges were revised October 2019. Always verify current thresholds with the CIDB.

### Grading Determinants

**1. Track record (construction works capability)**
Projects completed in the past 5 years in the relevant class of works. Verified via project award letters, completion certificates, payment certificates, and bank statements.

**2. Available capital**
Based on financial statements for the past 2 years. The CIDB considers the best annual turnover of the two years. Net asset value (total assets − total liabilities) plus any financial sponsorship determines available capital.

### Financial Sponsorship Rules

| Sponsor ownership stake | Maximum sponsorship |
|------------------------|---------------------|
| Financial institution (any) | No cap |
| 50%+ ownership of contractor | Full sponsorship |
| 25–49% ownership | ≤ 75% of required capital |
| < 25% ownership | ≤ 50% of required capital |
| Non-financial, any | ≤ 15% of sponsor's net asset value |

## Classes of Works

Each contractor is registered in one or more classes, identified by a two-letter code:

| Code | Class of Works |
|------|----------------|
| **CE** | Civil engineering |
| **GB** | General building |
| **ME** | Mechanical engineering |
| **EB** | Electrical engineering (buildings) |
| **EI** | Electrical engineering (infrastructure) |
| **EP** | Electrical engineering (power generation and supply) |
| **SB** | Specialist building works |
| **SC** | Specialist civil engineering works |
| **SE** | Specialist electrical works |
| **SM** | Specialist mechanical works |

A contractor's full designation reads as: **7GB** (Grade 7, General Building) or **5CE** (Grade 5, Civil Engineering).

## Registration

### New Registration
- Complete application (online or at CIDB offices)
- Company registration documents (CIPC)
- Tax clearance from SARS
- Financial statements (audited/reviewed)
- For Grade 2+: track record evidence and capital documentation
- Registration fee payment
- Foreign companies must have a registered SA physical address and CIPC registration

### Renewal
- Annual renewal required
- CIDB verifies company status with CIPC
- De-registered companies are flagged non-compliant → suspension or cancellation

### Upgrades
- Apply with evidence of completed projects at or near current grade level
- Updated financial statements showing increased capacity
- CIDB assesses and assigns new grade

> **Warning:** Providing false information is a punishable offence under the CIDB Act and Regulations.

## Procurement & Standard for Uniformity

The CIDB publishes the **Standard for Uniformity in Construction Procurement** for public sector tender structuring:

- Tender documents must reference CIDB grading requirements
- Estimated contractor grading designation must appear in the tender notice
- Procurement must follow Standard Procurement Procedures in the CIDB framework
- Aligns with SANS 10845 (Construction procurement series)
- Potentially emerging enterprises (one grade below estimate) may be eligible under targeted development programmes

### Best Practice Guidelines
The CIDB publishes guidelines (e.g., Guideline A6) with templates for tender notice wording, evaluation criteria, grading designation requirements, and Register of Projects reporting.

## BUILD Programme

Became law April 2021. Targets infrastructure projects valued at R60 million and above.

- Public clients contribute 0.2% of project value (capped at R2m) to contractor development
- Grade 7–9 contractors must implement action plans for developing Grade 1–6 contractors
- Includes mentorship, skills training, and 4IR technologies like BIM

## ERP Integration Points

### Contractor/Supplier Fields
```
cidb_registration_number        — CIDB registration number
cidb_grade                      — Current grade (1–9)
cidb_classes_of_works           — Multi-select: CE, GB, ME, EB, EI, EP, SB, SC, SE, SM
cidb_registration_expiry        — Date (annual renewal)
cidb_max_tender_value           — Auto-calculated from grade
cidb_compliance_status          — Active / Suspended / Expired
```

### Project/Tender Fields
```
estimated_cidb_grade            — Required grade for this project
cidb_class_of_works             — Required class
tender_value                    — Must be within contractor's grade range
cidb_project_registered         — Whether registered on Register of Projects
```

### Validation Rules
- Block tender award if contractor grade < estimated project grade
- Alert on registration expiry (30/60/90 day warnings)
- Require CIDB registration number before adding to approved supplier list
- Auto-verify contractor grade against tender value

## Common Gotchas

1. **Grade 1 is entry-level with no qualifying criteria** — but Grade 2+ requires demonstrated track record AND capital. The jump from 1 to 2 is the hardest upgrade.
2. **Tender values are not inflation-adjusted automatically.** The 2019 revision restored real values after years of erosion. Check current thresholds.
3. **Public sector only is a common misconception.** While registration is legally required for public sector work, private sector clients increasingly demand CIDB registration as a quality signal.
4. **A contractor can hold multiple class/grade combinations.** A single entity might be 7GB and 5CE simultaneously.
5. **Registration expiry during a contract** can create compliance gaps. Track renewal dates proactively.

## See Also

- [CIDB Website](https://www.cidb.org.za)
- [biz/property/za](../SKILL.md) — Parent skill with regulatory overview
- [biz/property/za/project-stages](../project-stages/SKILL.md) — CIDB verification mapped to project lifecycle
