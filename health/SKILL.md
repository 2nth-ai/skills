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
homepage: https://skills.2nth.ai/health
repository: https://github.com/2nth-ai/skills
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Healthcare, Clinical, EHR, Compliance, Pharma"
---

# Healthcare Skills

Skills for AI agents working in healthcare contexts — clinical systems, operations, pharmaceuticals, and public health.

## Subdomains

| Path | Focus |
|------|-------|
| `health/clinical/` | EHR/EMR, diagnostics, clinical protocols |
| `health/ops/` | Scheduling, billing, coding, compliance |
| `health/pharma/` | Formulary, drug interactions, clinical trials |
| `health/public-health/` | Population health, epidemiology, reporting |

## Critical Principle

AI agents in healthcare contexts **support clinical and administrative professionals — they do not make clinical decisions**. All clinical outputs require qualified human review. This is non-negotiable.

Regulatory context: HIPAA (US), POPIA (ZA), GDPR (EU), national health authority guidelines apply. Skills in this domain will note applicable regulations.

## Status

Stubs. Production skills to be added as client engagements define the patterns. Starting with `health/ops/billing` and `health/clinical/ehr` based on current pipeline.
