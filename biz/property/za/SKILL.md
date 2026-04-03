---
name: biz/property/za
description: |
  South African property development and construction compliance. Use this skill when:
  (1) the user mentions South African building regulations, SANS 10400, CIDB grading, or NHBRC registration,
  (2) advising on construction compliance in South Africa — building plans approval, occupancy certificates, inspections,
  (3) mapping property development workflows to SA regulatory milestones,
  (4) customizing ERPNext or other ERP systems for SA construction compliance,
  (5) checking contractor eligibility, builder registration, or home enrolment requirements,
  (6) any reference to SA building codes, SABS standards, NHBRC warranty, CIDB grade, or National Building Regulations.
license: MIT
compatibility: South African regulatory framework (current as of 2024)
homepage: https://skills.2nth.ai/biz/property/za
repository: https://github.com/2nth-ai/skills
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Property, Construction, Compliance, South Africa, Regulations"
allowed-tools: Read Glob Grep
---

# South African Property Development & Construction Compliance

This skill equips Claude to advise on South African construction regulations, property development workflows, and how to embed regulatory compliance into project management systems.

## Regulatory Landscape

South African construction is governed by three interlocking regulatory bodies. Understanding how they interact is essential for any property development project:

| Pillar | Body | Function | Governs |
|--------|------|----------|---------|
| **Technical code** | SABS / SANS 10400 | Defines *how* structures must be designed and built | Plans, materials, structural integrity |
| **Contractor registry** | CIDB | Defines *who* is eligible to build (especially public sector) | Grading, tenders, procurement |
| **Consumer protection** | NHBRC | Defines *what warranties and inspections* apply to residential construction | Enrolment, inspections, warranties |

These three pillars create a compliance chain: a project needs SANS-compliant plans, a CIDB-registered contractor (for public work), and NHBRC enrolment (for homes) before a single foundation is poured.

## Key Legislation

| Law | Purpose |
|-----|---------|
| National Building Regulations and Building Standards Act, 1977 (Act 103 of 1977) | Primary building law |
| Housing Consumers Protection Measures Act, 1998 (Act 95 of 1998) | Establishes the NHBRC |
| Construction Industry Development Board Act, 2000 (Act 38 of 2000) | Establishes the CIDB |

## Core Principles for Advice

1. **Always cite the specific regulation or part.** Say "SANS 10400 Part K (Walls) requires it" — not "the building regulations require it."
2. **Distinguish mandatory law from deemed-to-satisfy guidelines.** The National Building Regulations are law. SANS 10400 deemed-to-satisfy requirements are one accepted compliance route — rational design by a competent person is also permitted.
3. **Flag when professional involvement is required.** Many aspects require a "competent person" (architect, engineer) as defined in SANS 10400 Part A. Recommend professional consultation rather than implying self-certification.
4. **Respect local authority variation.** Building plan approval, inspections, and occupancy certificates are issued by municipalities. Requirements vary — advise users to confirm specifics locally.
5. **Note that regulations evolve.** SANS 10400 was overhauled in 2008/2011, CIDB revised tender values in 2019, and individual parts continue to be updated. Always recommend verifying against the latest published standards.

## Subskills

| Skill | Scope | When to load |
|-------|-------|--------------|
| [sans-10400](sans-10400/SKILL.md) | Building codes, plans, structural design, occupancy classification | Building codes, materials, plan submission, occupancy |
| [cidb](cidb/SKILL.md) | Contractor registration, grading, tenders, procurement | Contractor eligibility, public sector tenders, grading |
| [nhbrc](nhbrc/SKILL.md) | Home builder registration, enrolment, warranties, inspections | Residential construction, warranties, inspections |
| [project-stages](project-stages/SKILL.md) | Development lifecycle, ERP integration, compliance checklists | Project planning, ERPNext customization, checklists |

If the question spans multiple domains (common in real projects), load all relevant subskills.

## See Also

- [SABS Standards](https://www.sabs.co.za)
- [CIDB](https://www.cidb.org.za)
- [NHBRC](https://www.nhbrc.org.za)
