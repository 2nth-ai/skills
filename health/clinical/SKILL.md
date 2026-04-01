---
name: health/clinical
description: |
  Clinical systems skills. Use skills in this subdomain when working with:
  (1) EHR/EMR systems — FHIR APIs, patient records, clinical notes,
  (2) diagnostic support — lab results interpretation, imaging metadata, clinical pathways,
  (3) clinical protocols — treatment guidelines, order sets, care plans,
  (4) interoperability — HL7, FHIR R4, SMART on FHIR integrations.
license: MIT
homepage: https://skills.2nth.ai/health/clinical
repository: https://github.com/2nth-ai/skills
improves:
  - health
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Clinical, EHR, FHIR, HL7, Diagnostics"
---

# Clinical Skills

Skills for working with clinical systems, patient data, and healthcare interoperability standards.

## Subdomains

| Path | Focus |
|------|-------|
| `health/clinical/ehr` | EHR/EMR integration — FHIR, HL7, patient records |
| `health/clinical/diagnostics` | Lab results, imaging metadata, diagnostic support |
| `health/clinical/protocols` | Treatment guidelines, care pathways, order sets |

## Interoperability Standards

Healthcare data exchange runs on:
- **FHIR R4** (Fast Healthcare Interoperability Resources) — modern REST-based standard
- **HL7 v2** — legacy but ubiquitous (ADT, ORM, ORU messages)
- **SMART on FHIR** — OAuth2-based app authorisation for EHR platforms
- **DICOM** — imaging (read only for AI; write only with certified systems)

## Status

Stubs. Priority: `health/clinical/ehr` (FHIR R4 patterns) to be built first.
