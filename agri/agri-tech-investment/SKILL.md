---
name: agri-tech-investment
description: |
  Agri-tech investment assessment expert. Use this skill when:
  (1) evaluating precision farming technologies — satellite imagery, NDVI analysis, variable rate application,
  (2) assessing AI-driven crop analytics — yield prediction, disease detection, harvest timing,
  (3) analysing drone and aerial monitoring solutions for agriculture,
  (4) evaluating IoT sensor networks for soil moisture, weather, and livestock tracking,
  (5) building investment cases for agri-tech ventures — TAM, unit economics, adoption curves,
  (6) advising on automated irrigation and water management technology,
  (7) comparing agri-tech solutions for African farming conditions.
license: MIT
compatibility: Any
metadata:
  author: Gananda Connect (Barry Hawke)
  version: "1.0.0"
  homepage: "https://skills.2nth.ai/agri/agri-tech-investment"
  repository: "https://github.com/2nth-ai/skills"
  requires: "agri/sustainable-farming, fin/modelling"
  improves: "agri"
  categories: "Agri-Tech, Precision Farming, AI Agriculture, Investment"
---

# Agri-Tech Investment Assessment

Bridges agricultural science and investment-grade technology evaluation. This skill helps AI agents assess agri-tech ventures, precision farming deployments, and AI-driven agricultural solutions — with the domain knowledge to distinguish genuine innovation from hype.

## Key Capabilities

- Precision farming evaluation: satellite imagery (Sentinel-2, Planet), NDVI vegetation indices, variable rate application
- AI crop analytics: yield prediction accuracy, disease detection models, harvest timing optimisation
- Drone monitoring: flight planning, multispectral imaging, thermal mapping for irrigation and livestock
- IoT and sensors: soil moisture networks, weather stations, livestock GPS tracking, integration requirements
- Investment analysis: TAM sizing for African agri-tech, unit economics per hectare, adoption curve modelling
- Technology comparison: vendor landscape, build vs. buy, integration with existing farm management systems

## Technology Assessment Framework

When evaluating any agri-tech solution, assess across five dimensions:

1. **Agronomic validity** — does the science hold? Peer-reviewed evidence, field trial data, crop-specific applicability
2. **Farm-level ROI** — cost per hectare vs. yield uplift or input savings. Payback period under realistic conditions
3. **Adoption feasibility** — connectivity requirements, farmer skill level, integration with existing practices
4. **Scalability** — does it work across farm sizes, crop types, and African infrastructure constraints?
5. **Data ownership** — who owns the farm data? Vendor lock-in risk, export capabilities, privacy compliance

## African Context

African agri-tech operates under different constraints than US/EU precision farming:

- **Connectivity**: many farms lack reliable cellular coverage. Solutions must work offline or with intermittent sync
- **Farm size**: smallholder farms (< 5 ha) dominate. Per-hectare economics must work at small scale
- **Infrastructure**: limited cold chain, unreliable power, poor rural roads. Post-harvest loss can exceed 30%
- **Finance**: most African farmers lack access to credit. Agri-tech adoption often requires embedded financing

## Gotchas

1. **NDVI is not yield** — vegetation index correlation to actual yield varies by crop, growth stage, and soil type. Never present NDVI data as a yield guarantee to investors.
2. **Pilot vs. scale** — most agri-tech startups show impressive pilot results on well-resourced demo farms. Always ask for commercial-scale deployment data under real conditions.
3. **Connectivity assumptions** — if the solution requires always-on internet, it won't work on most African farms. Edge computing with periodic sync is the realistic architecture.
4. **Regulatory gaps** — drone regulations vary across African jurisdictions. Commercial drone operations typically require SACAA (SA) or equivalent certification plus landowner consent.
