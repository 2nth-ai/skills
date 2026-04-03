---
name: biz/property/za/sans-10400
description: |
  SANS 10400 South African National Building Regulations. Use this skill when:
  (1) advising on building code compliance — structural design, materials, fire protection, energy usage,
  (2) preparing or reviewing building plan submissions to local authorities,
  (3) determining occupancy classification for a building (A1–J4),
  (4) checking minimum room dimensions, ceiling heights, or floor areas,
  (5) identifying which SANS 10400 parts apply to a specific construction type,
  (6) explaining competent person requirements for SA construction,
  (7) comparing deemed-to-satisfy vs rational design compliance routes.
license: MIT
compatibility: SANS 10400:2011 base edition with updates through 2024
homepage: https://skills.2nth.ai/biz/property/za/sans-10400
repository: https://github.com/2nth-ai/skills
requires:
  - biz/property/za
improves:
  - biz/property/za
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "SANS 10400, Building Codes, South Africa, Construction Standards, SABS"
allowed-tools: Read Glob Grep
---

# SANS 10400 — South African National Building Regulations

## Overview

SANS 10400 is the South African National Standard for the application of the National Building Regulations. Developed and maintained by the South African Bureau of Standards (SABS), the current base edition is SANS 10400:2011 with individual parts updated independently.

**Two-layer structure:**
- **The Regulations** (law) — short, functional requirements from the National Building Regulations and Building Standards Act, 1977
- **Deemed-to-satisfy requirements** (SANS 10400) — detailed technical guidelines that, if followed, are considered compliant

A builder can comply either by following the deemed-to-satisfy requirements OR through a rational design prepared by a competent person demonstrating equivalent or better performance.

> SANS 10400 is purchased from SABS (parts sold separately). The 1990 edition is freely available online but is outdated — many parts have been substantially revised.

## Complete Parts List

| Part | Title | Key Scope |
|------|-------|-----------|
| **A** | General principles and requirements | Occupancy classification, plan submission, definitions, competent persons |
| **B** | Structural design | Structural integrity, loading, dolomite land requirements |
| **C** | Dimensions | Minimum room sizes, floor areas per occupancy, ceiling heights |
| **D** | Public safety | Safety of persons on/near buildings, swimming pool fencing |
| **E** | Demolition work | Requirements for demolition (no deemed-to-satisfy code) |
| **F** | Site operations | Site clearance, noise/dust control, waste, working hours |
| **G** | Excavations | Excavation safety, support of excavation faces |
| **H** | Foundations | Foundation design, geotechnical investigation requirements |
| **J** | Floors | Floor construction, damp-proofing of floors |
| **K** | Walls | Wall construction, masonry, damp-proof courses, boundary walls |
| **L** | Roofs | Roof construction, waterproofing (watertight 5+ years without maintenance) |
| **M** | Stairways | Stairway dimensions, handrails, balustrades (min 850mm–1m) |
| **N** | Glazing | Safety glazing requirements |
| **O** | Lighting and ventilation | Natural light, window sizes, mechanical ventilation |
| **P** | Drainage | Sanitary drainage design and discharge |
| **Q** | Non-water-borne sanitary disposal | Pit latrines, septic tanks (no waterborne sewerage areas) |
| **R** | Stormwater disposal | Stormwater management, discharge restrictions |
| **S** | Facilities for persons with disabilities | Ramps, accessible bathrooms, door widths, grab rails |
| **T** | Fire protection | Fire safety, escape routes, fire ratings, fire doors |
| **U** | Refuse disposal | Refuse storage and removal (no deemed-to-satisfy code) |
| **V** | Space heating | Requirements for heating installations |
| **W** | Fire installation | Fire detection and suppression systems |
| **X** | Energy usage in buildings | General energy requirements |
| **XA** | Energy usage in buildings (detailed) | Building envelope, orientation, services efficiency (updated 2021) |

> There is no Part I (to avoid confusion with the number 1).

## Plan Submission Requirements (Part A)

Before any construction, plans and documents **must** be submitted to the local authority:

- Site plan showing building in relation to boundaries and existing structures
- Floor plans, elevations, and sections at prescribed scales
- Structural design details (by a competent person)
- Particulars of any building to be demolished
- Details of materials to be used (colour-coded per convention)
- Any other plans and particulars required by the local authority
- Proof of NHBRC enrolment (for residential construction)

Plans must be drawn by or under the supervision of a "competent person" — architect, engineer, draughtsperson, or other professional recognized by the local authority.

**Timeframe:** Local authorities must approve or reject plans within **30 working days** (60 days for complex applications). If no response is received, the applicant may proceed as if approved — but this is risky in practice.

## Occupancy Classifications (Part A, Regulation A20)

| Class | Description | Examples |
|-------|-------------|----------|
| A1–A5 | Assembly / entertainment / worship / sport | Cinemas, schools, churches, stadiums |
| B1–B3 | Commercial service (high → low risk) | Spray painting, workshops, offices |
| C1–C2 | Exhibition / museum | Museums, galleries |
| D1–D4 | Industrial (high → low risk) + plant rooms | Chemical plants, manufacturing, light industry |
| E1–E4 | Institutional | Prisons, hospitals, old age homes, clinics |
| F1–F3 | Mercantile | Supermarkets, retail shops, warehouses |
| G1 | Office | Office buildings |
| H1–H5 | Residential / hospitality | Hotels, hostels, houses, flats, guest houses |
| J1–J4 | Storage / parking | Flammable materials, general storage, parking garages |

## Parts by Project Type

### Residential (H3/H4)
Most relevant: **A** (plans), **B** (structure), **C** (dimensions), **H** (foundations), **J** (floors), **K** (walls), **L** (roofs), **O** (lighting/ventilation), **P** (drainage), **R** (stormwater), **T** (fire protection), **XA** (energy).

### Commercial / mixed-use
Add: **D** (public safety), **S** (disability access), **W** (fire installation). Occupancy classification drives specific requirements for fire ratings, escape routes, and accessibility.

## Energy Compliance (Part XA — updated 2021)

All new buildings must demonstrate energy compliance via one of three routes:

1. **Prescriptive** — follow deemed-to-satisfy rules for building envelope, orientation, shading, and services
2. **Rational design** — competent person demonstrates equivalent energy performance
3. **Software modelling** — certified thermal calculation software shows performance meets or exceeds reference building

## Competent Person Requirements

| Aspect | Required Professional |
|--------|----------------------|
| Building plans | Architect, draughtsperson, or engineer |
| Structural design | Structural engineer (ECSA registered) |
| Electrical work | Registered electrician (must issue Certificate of Compliance) |
| Plumbing | Registered plumber (PIRB — must issue Certificate of Compliance) |
| Fire engineering | Professional Engineer/Technologist (ECSA registered, fire experience) |

## Common Compliance Scenarios

### Building a house
1. Engage competent person to draw plans
2. Submit plans to local authority for approval (Part A)
3. Ensure NHBRC enrolment (15 days before construction starts)
4. Construct per approved plans and SANS 10400
5. NHBRC inspections at key stages
6. Obtain occupancy certificate from local authority
7. Obtain electrical and plumbing Certificates of Compliance

### Additions and alterations
Same plan submission process. Plans must show existing structure AND proposed changes. Existing non-compliant elements may be flagged by inspectors.

### Boundary walls and fences
Regulated under Part K. Height limits, structural requirements, and setback rules apply. Electric fence regulations are separate.

### Swimming pools
Must comply with Part D (Public Safety) — fencing requirements to prevent child drowning. Minimum fence height and gate specifications apply.

## Common Gotchas

1. **The 1990 free edition is not current.** Many parts were substantially revised in 2008/2011 and continue to be updated. Always verify against latest SABS publications.
2. **Deemed-to-satisfy ≠ the only way.** Rational design by a competent person is equally valid — but requires professional sign-off.
3. **No Part I exists.** Parts skip from H to J to avoid confusion with the number 1.
4. **Municipality variation is real.** Local authorities may impose additional requirements beyond SANS 10400. Always confirm with the relevant municipality.
5. **Plan approval silence is not safe approval.** While the Act allows proceeding after 30/60 days without response, doing so without written approval is risky in practice.

## See Also

- [SABS Standards Portal](https://www.sabs.co.za)
- [biz/property/za](../SKILL.md) — Parent skill with regulatory overview
- [biz/property/za/nhbrc](../nhbrc/SKILL.md) — NHBRC inspections and warranties
- [biz/property/za/project-stages](../project-stages/SKILL.md) — SANS 10400 mapped to project lifecycle
