---
name: health
description: |
  Healthcare domain skills. Use skills in this domain when working with:
  (1) clinical systems — EHR/EMR integration, patient records, clinical protocols,
  (2) healthcare operations — scheduling, billing, coding (ICD-10, CPT), compliance,
  (3) pharmaceuticals — formulary management, drug interactions, clinical trials,
  (4) public health — population health analytics, epidemiology, reporting,
  (5) healthcare AI — clinical decision support, diagnostic assistance, care coordination.
license: MIT
metadata:
  author: 2nth.ai
  version: "1.0.0"
  homepage: "https://skills.2nth.ai/health"
  repository: "https://github.com/2nth-ai/skills"
  categories: "Healthcare, Clinical, EHR, Compliance, Pharma"
---

# Healthcare Skills

Skills for AI agents working in healthcare contexts — clinical systems, operations, pharmaceuticals, and public health.

## Subdomains

| Path | Focus |
|------|-------|
| `health/clinical/` | EHR/EMR integration, patient records, clinical protocols |
| `health/clinical-governance/` | Quality assurance, clinical audits, patient safety |
| `health/digital/` | Digital health, telemedicine, health informatics |
| `health/finance/` | Healthcare financial management, medical aid billing |
| `health/mental-health/` | Mental health services, counselling frameworks |
| `health/operations/` | Hospital operations, bed management, staffing |
| `health/ops/` | Scheduling, billing, ICD-10/CPT coding, compliance |
| `health/pharmacy/` | Formulary management, drug interactions, dispensing |
| `health/public-health/` | Population health, epidemiology, NHI, reporting |
| `health/sa/` | South African healthcare context — NDoH, HPCSA, COHSASA, medical aids |

## Critical Principle

AI agents in healthcare contexts **support clinical and administrative professionals — they do not make clinical decisions**. All clinical outputs require qualified human review. This is non-negotiable.

Regulatory context: POPIA (ZA), NHA (National Health Act 61 of 2003), HPCSA ethical rules, and provincial health department guidelines apply. Skills in this domain note applicable regulations.

## Status

`health/operations`, `health/sa`, `health/ops` are production. Others are stubs pending client engagements.
