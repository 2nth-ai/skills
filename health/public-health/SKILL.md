---
name: Public Health & Epidemiology
description: >
  Population health management, epidemiology, disease surveillance, community
  health programmes, and South Africa's primary healthcare system.
requires: []
improves: []
metadata:
  domain: health
  subdomain: public-health
  maturity: stable
---

# Public Health & Epidemiology

South Africa carries one of the world's most complex disease burdens — simultaneously managing the largest HIV epidemic globally, the highest TB incidence per capita, a rising tide of non-communicable diseases, and pervasive injury from violence and road traffic crashes. This skill provides the epidemiological frameworks, SA-specific disease data, PHC system architecture, and health metric knowledge required for a fractional Healthcare Director operating at district, regional, or national level.

All outputs support qualified public health practitioners and health managers. Clinical recommendations require qualified medical or public health officer review. Epidemiological figures carry uncertainty intervals — treat point estimates as references, not absolutes.

---

## 1. Epidemiology Fundamentals

### Core Measures of Disease Frequency

| Measure | Definition | Formula | Typical Use |
|--------|-----------|---------|------------|
| **Prevalence** | Proportion of population with condition at a point in time | Cases / Population at risk | Chronic diseases, HIV, HTN |
| **Incidence rate** | New cases per population per time unit | New cases / Person-time at risk | TB notification rate, cholera outbreaks |
| **Cumulative incidence** | Proportion developing condition over period | New cases / Population at risk (start) | Vaccine trial endpoints |
| **Attack rate** | Cumulative incidence in outbreak setting | Cases / Exposed population | Foodborne outbreak, measles cluster |
| **Case Fatality Rate (CFR)** | Proportion of cases that die | Deaths / Confirmed cases | Ebola, COVID-19 severity tracking |
| **Infection Fatality Rate (IFR)** | Deaths / All infected (including undiagnosed) | Deaths / Estimated all infections | Harder to measure; requires seroprevalence data |

**Prevalence vs Incidence relationship:**
```
Prevalence ≈ Incidence Rate × Average Duration of Disease
```
A high prevalence can reflect either high incidence OR long disease duration (or both). HIV has both high incidence and long duration with ART — hence 7.8M PLHIV despite decades of epidemic.

### Crude vs Adjusted Rates

- **Crude rate**: Uses total population in denominator. Distorted by age structure differences between populations.
- **Age-standardised (age-adjusted) rate**: Controls for age distribution using a reference population. Required when comparing TB or cancer rates between provinces with different demographic profiles.
- **Direct standardisation**: Apply age-specific rates from study population to reference population.
- **Indirect standardisation**: Produces Standardised Mortality Ratio (SMR) — used when age-specific rates are unstable due to small numbers.

SA context: The Western Cape has an older age profile than Limpopo. Crude mortality comparisons will systematically understate mortality burden in younger provinces if not age-adjusted.

### Epidemic Curves and Transmission Patterns

| Curve Type | Shape | Implication | SA Example |
|-----------|-------|-------------|-----------|
| **Common-source (point)** | Sharp peak, rapid decline | Single exposure event | Listeriosis outbreak 2017–2018 (polony) |
| **Common-source (continuous)** | Sustained plateau | Ongoing exposure source | Contaminated water supply |
| **Propagated (person-to-person)** | Multiple successive waves, each larger | Human-to-human transmission | Measles, COVID-19 waves |
| **Mixed** | Initial sharp peak + propagated tail | Index case triggers secondary spread | Ebola nosocomial + community spread |

### Reproductive Numbers

- **R0 (basic reproduction number)**: Average secondary cases from one case in a fully susceptible population. Biological property of pathogen-host interaction.
- **Rt (effective reproduction number)**: Real-time R accounting for population immunity and interventions. Rt < 1 means epidemic is declining.

| Pathogen | Approximate R0 | Implications |
|---------|---------------|-------------|
| Measles | 12–18 | Requires ~94% population immunity to halt transmission |
| COVID-19 (original strain) | 2–3 | Herd immunity threshold ~50–67% |
| TB (Mtb) | 1–2 (slow) | Long infectious period sustains transmission at low R0 |
| HIV | 2–5 (without interventions) | R0 depends heavily on behaviour and viral load |

### Bias and Confounding in Health Data

**Selection bias**: Non-random selection into study or surveillance system.
- SA example: Facility-based surveillance underrepresents rural populations and those who self-treat.

**Information bias**: Systematic error in measuring exposure or outcome.
- Recall bias: Patients underreport stigmatised behaviours (alcohol, drug use).
- Misclassification: TB cases lost to follow-up recorded as "transferred out" rather than treatment failure.

**Confounding**: Third variable associated with both exposure and outcome.
- SA example: Poverty confounds the TB–HIV relationship (poverty drives both; not just HIV causing TB independently).

**Controlling confounding**: Stratification, multivariate regression, matching, restriction. In SA public health, age, sex, HIV status, and geography are near-universal confounders.

---

## 2. Disease Burden in South Africa — The Quadruple Burden

South Africa is uniquely challenged by simultaneous epidemics across four categories, with social determinants (poverty, inequality, unemployment, housing) driving all four.

### 2.1 HIV/AIDS

| Indicator | Value (2023/2024 estimates) | Source |
|----------|---------------------------|--------|
| People living with HIV (PLHIV) | ~7.8 million | HSRC/SANAC |
| Adult (15–49) HIV prevalence | ~19% | HSRC 2022 Household Survey |
| New infections per year | ~170,000–200,000 | UNAIDS |
| People on ART | ~5.9 million | NDOH ART statistics |
| HIV+ pregnant women on PMTCT | >95% | DHIS2 |
| Mother-to-child transmission rate | ~1.4% (at 10 weeks) | NDOH |

SA has the largest ART programme in the world. The 90-90-90 UNAIDS targets (now updated to 95-95-95):
- **First 90/95**: 95% of PLHIV know their status
- **Second 90/95**: 95% of those who know their status on ART
- **Third 90/95**: 95% of those on ART virally suppressed

SA performance (2023): approximately 94-78-88. The second 95 (ART coverage) remains the key gap — people who test positive but do not link to or remain in care.

**Key programmatic terms:**
- **PMTCT**: Prevention of Mother-to-Child Transmission
- **VL**: Viral Load — undetectable VL (<50 copies/mL) = virally suppressed = cannot transmit
- **PrEP**: Pre-Exposure Prophylaxis (tenofovir/emtricitabine) — rolled out in SA since 2016
- **U=U**: Undetectable = Untransmittable — public health messaging cornerstone
- **PEPFAR**: US President's Emergency Plan for AIDS Relief — primary external funder of SA HIV programme

### 2.2 Tuberculosis

| Indicator | Value | Context |
|----------|-------|---------|
| TB incidence rate | ~520/100,000 population | Highest in world per capita (WHO 2023) |
| New TB cases notified annually | ~270,000–300,000 | NDOH |
| TB/HIV co-infection | ~50–60% of new TB cases | A defining feature of SA epidemic |
| MDR-TB cases | ~8,000–9,000/year | Drug-resistant burden is significant |
| XDR-TB | ~450–600/year | Extensively drug-resistant; limited treatment options |
| TB treatment success rate (DS-TB) | ~82–85% | Below 90% WHO target |

**Drug-resistant TB definitions:**

| Category | Resistance Profile |
|---------|------------------|
| DS-TB (Drug-susceptible) | Sensitive to rifampicin and isoniazid |
| RR-TB (Rifampicin-resistant) | Resistant to rifampicin (most important first-line drug) |
| MDR-TB | Resistant to at least rifampicin + isoniazid |
| Pre-XDR-TB | MDR + resistant to any fluoroquinolone |
| XDR-TB | Pre-XDR + resistant to at least one Group A drug (bedaquiline or linezolid) |

**SA TB programme architecture:**
- GeneXpert (Xpert MTB/RIF) as first-line diagnostic — detects TB and rifampicin resistance in 2 hours
- BPaL (bedaquiline, pretomanid, linezolid) regimen for XDR-TB — SA was a trial site
- Community-based treatment supporters (treatment buddies/DOT supporters)
- TB contact tracing — household contacts of index cases screened and offered INH preventive therapy (IPT)

### 2.3 Non-Communicable Diseases (NCDs)

| NCD | Prevalence (Adults) | Key Drivers | SA Programme |
|----|-------------------|------------|-------------|
| Hypertension | ~48% of adults (SANHANES) | Obesity, salt, stress, alcohol | Chronic Disease Management (CDM) at PHC level |
| Diabetes (Type 2) | ~13% of adults | Obesity, diet, sedentary lifestyle | CDM, foot care clinics |
| Cardiovascular disease | Leading cause of death in 35–64 age group | HTN, diabetes, smoking, dyslipidaemia | Risk factor screening at PHC |
| Cancer | ~100,000 new cases/year (NCRSA) | Cervical (HPV), breast, prostate, lung, oesophageal | NHLS pathology, oncology referral pathway |
| Chronic Respiratory Disease | ~COPD, asthma underdiagnosed | Occupational exposure (mining), tobacco, TB sequelae | PHC spirometry pilot sites |
| Obesity | ~68% of adult women overweight/obese | Urbanisation, ultra-processed foods | HEALA advocacy, food labelling regulations |

**NCD double burden in SA:** NCDs and communicable diseases are not competing — they are synergistic. HIV accelerates cardiovascular disease; TB causes lung destruction; poverty drives both.

### 2.4 Injuries — The "Fourth Epidemic"

| Injury Category | SA Rate | Benchmark |
|----------------|---------|-----------|
| Interpersonal violence (homicide) | ~45/100,000 (one of highest globally) | Global average ~6/100,000 |
| Road traffic deaths | ~25.9/100,000 | More than double WHO target |
| Femicide | ~5× global average | GBV crisis declared national emergency |
| Drowning | High paediatric burden | Unguarded pools, rivers |

Injuries are the leading cause of death in 15–44 year age group in SA — YLLs (Years of Life Lost) are disproportionate to absolute numbers.

### DALY Framework

**Disability-Adjusted Life Year (DALY)** = Years of Life Lost (YLL) + Years Lived with Disability (YLD)

- YLL: Deaths × standard life expectancy remaining at age of death
- YLD: Cases × disability weight × duration

SA leading causes of DALYs (IHME/SAMRC data):
1. HIV/AIDS and STIs
2. Lower respiratory infections
3. TB
4. Diarrhoeal diseases
5. Road injuries
6. Interpersonal violence
7. Hypertensive heart disease
8. Diabetes
9. Neonatal conditions
10. Depressive disorders

---

## 3. South African Primary Healthcare System

### PHC Re-Engineering (2011 onwards)

PHC re-engineering is the NDoH's strategy to shift SA from a hospital-centric to a community-based health system. Three streams:

**Stream 1 — Ward-Based Outreach Teams (WBOTs)**
- Each team covers approximately 1,000–1,500 households per ward
- Composition: Community Health Workers (CHWs) + Professional Nurse (team leader)
- Functions: household registration, chronic disease follow-up, PMTCT support, TB contact tracing, maternal and child health monitoring, health promotion
- CHWs receive a stipend (not a salary) — ongoing advocacy issue for professionalisation and salary scale

**Stream 2 — School Health Teams**
- Nurses deployed to schools for the Integrated School Health Programme (ISHP)
- Vision, hearing, oral health, HIV testing, immunisation catch-up

**Stream 3 — District Clinical Specialist Teams (DCSTs)**
- Each district has a multidisciplinary specialist team: obstetrician/gynaecologist, paediatrician, anaesthetist, family physician, PHC/midwife specialist
- Support district and sub-district facilities with clinical governance, mentorship, and complex case management

### Health System Hierarchy

```
National Department of Health (NDoH)
    ↓
Provincial Department of Health (9 provinces)
    ↓
District Health System (~52 health districts)
    ↓
Sub-district / Local Municipality
    ↓
Community Health Centre (CHC) — 24hr facility
    ↓
Fixed Clinic / Satellite Clinic
    ↓
Mobile Clinic / WBOT / Community Health Worker
```

### District Health System

The District Health System (DHS) is the operational unit of PHC delivery:
- Each district has a District Management Team (DMT) headed by a District Director
- District Health Expenditure per capita is a key accountability metric (target: equitable share per population)
- District Hospital is the referral node for PHC facilities — 24hr casualty, surgical, obstetric, medical, paediatric wards
- Sub-district structure below district: Facility Management Teams at each PHC facility

### Ideal Clinic Programme

The Ideal Clinic Realisation and Maintenance (ICRM) programme assesses clinics against a set of standards across 10 components:

| Component | Examples |
|-----------|---------|
| Administration | Clinic committee, pharmacy stock, personnel lists |
| Human Resources | Staff ratios, leave management |
| Finance | Budget management, petty cash |
| Facility/Infrastructure | Maintenance, HVAC, waiting areas |
| Medicine and Supplies | Essential Medicines List compliance, cold chain |
| Equipment | Calibration records, service schedules |
| Connectivity/IT | HPRS/DHIS2, computer infrastructure |
| Quality of Care | Clinical protocols, adverse event reporting |
| Infection Prevention & Control (IPC) | Hand hygiene, PPE, waste management |
| Community Interface | Health committees, outreach |

Status rating: Ideal, Silver, Gold, or suboptimal. Target: all clinics to attain Ideal status.

---

## 4. Disease Surveillance

### NICD — National Institute for Communicable Diseases

The NICD (part of NHLS) is SA's national public health institute for communicable disease intelligence:
- Reference laboratory function — confirms novel pathogens, does whole genome sequencing
- GERMS-SA: Group for Enteric, Respiratory and Meningeal disease Surveillance
- SIRESS: Syndromic Surveillance (influenza-like illness, severe acute respiratory illness)
- ISARIC/South African SARI surveillance network
- Issues weekly Communicable Diseases Communique and outbreak alerts

### Notifiable Medical Conditions (NMCs)

The Notifiable Medical Conditions Regulations (R. 883 of 2017) list 47 conditions requiring mandatory reporting to the DoH. Health professionals, laboratories, and facilities all have reporting obligations.

**Category 1 — Immediate notification (within 24 hours):**

| Condition | Notes |
|-----------|-------|
| Anthrax | Bioterrorism risk |
| Botulism | |
| Cholera | |
| Diphtheria | |
| Ebola | Viral haemorrhagic fever |
| Human influenza (novel subtype) | Pandemic potential |
| Meningococcal meningitis/septicaemia | |
| Plague | |
| Rabies | |
| Severe Acute Respiratory Syndrome (SARS) | |
| Smallpox | |
| Viral haemorrhagic fevers (Marburg, Lassa, Crimean-Congo) | |
| Yellow fever | |

**Category 2 — Within 5 days:**
Includes TB (all forms), HIV (newly diagnosed), typhoid, measles, rubella, pertussis, tetanus, polio, malaria, brucellosis, food poisoning, Hepatitis A/B/C/E, listeriosis, leptospirosis, typhus, and others.

**Reporting pathway:**
```
Clinician/Lab → District Disease Surveillance Officer
    → Provincial Health Department
    → NDoH Epidemiology cluster
    → WHO (for IHR-notifiable conditions)
```

### NHLS — National Health Laboratory Service

- Processes ~65 million tests per year from public sector facilities
- CD4 count, viral load, GeneXpert, culture and DST for TB — all through NHLS
- Laboratory data feeds TIER.Net (HIV programme data) and DATIM

### Sentinel vs Mandatory Surveillance

| Type | Description | SA Examples |
|------|-------------|------------|
| **Mandatory/Passive** | All cases must be reported | NMC list — TB, cholera, measles |
| **Sentinel/Active** | Selected sites report all cases (more complete but limited sites) | Influenza (SARI) sentinels, maternal mortality (NCCEMD) |
| **Syndromic** | Report clinical syndrome without waiting for lab confirmation | ILI/SARI — faster signal for emerging threats |

### DATIM — Data for Accountability, Transparency, and Impact Monitoring

DATIM is the PEPFAR-mandated data system for HIV/AIDS programme monitoring:
- SA reports quarterly to DATIM on PEPFAR-funded indicators
- Key indicators: HTS_TST (HIV testing), TX_NEW (new ART initiations), TX_CURR (current on ART), VL_SUPPRESSION (viral load suppression)
- Used alongside DHIS2 (government system) — two parallel systems create data reconciliation burden

---

## 5. National Health Insurance (NHI) and Primary Care Financing

### NHI Act 20 of 2019

The NHI Act establishes a single-payer national health insurance system. Core architecture:

| Element | Detail |
|---------|--------|
| Fund structure | Single NHI Fund — public entity, governed by Board |
| Purchasing model | Monopsony purchaser of healthcare services |
| Provider contracting | Both public and private providers accredited and contracted |
| Benefit package | Defined by Advisory Committees — comprehensive PHC + essential hospital |
| Financing | General tax revenue + payroll levy (Fiscus contribution) |
| Medical schemes | Role significantly curtailed — cannot cover services covered by NHI |

**Constitutional challenge status (as of 2024–2025):** Multiple legal challenges lodged by DA, SAMA, BHF. ConCourt challenge on medical scheme provisions anticipated. Implementation is phased — full NHI fund functionality is a multi-year horizon.

### Implementation Phases

| Phase | Period | Key Milestones |
|-------|--------|---------------|
| Phase 1 (complete) | 2012–2017 | Pilots in 10 districts, Ideal Clinic programme |
| Phase 2 (underway) | 2017–2022 | GP contracting pilots (CUPs), health system strengthening |
| Phase 3 (in progress) | 2023+ | NHI Fund establishment, provider accreditation framework |
| Full implementation | 2030+ (est.) | Subject to fiscal envelope and legal resolution |

### Contracting Units for Primary Healthcare (CUPs)

CUPs are the geographic unit for PHC contracting under NHI:
- Each CUP covers approximately 10,000 population
- A GP (general practitioner) registers with the CUP and is contracted to provide PHC services
- Patient registers with a GP at the CUP — gatekeeping function
- GPs paid on a blended capitation + fee-for-service basis (under NHI pilot design)

### PHC Benefit Package

Under NHI, the PHC benefit package is intended to be comprehensive:
- Preventive services: immunisations, antenatal care, family planning, cervical screening
- Curative: acute illness management, chronic disease management (HTN, diabetes, HIV, TB, asthma)
- Rehabilitative: physiotherapy referral, occupational therapy
- Palliative care: pain management, end-of-life care

Reference price setting for NHI services is done by the Office of Health Products and Technologies (OHPT) — previously the Pricing Committee.

---

## 6. Health Promotion

### Ottawa Charter Framework (1986)

The WHO Ottawa Charter remains the foundational framework for health promotion globally and is explicitly referenced in SA health policy:

| Action Area | SA Application |
|------------|---------------|
| **Build healthy public policy** | Tobacco Products and Electronic Delivery Systems Act, sugar tax (Health Promotion Levy), food labelling regulations |
| **Create supportive environments** | Safe urban design, school nutrition, housing programmes |
| **Strengthen community action** | WBOTs, ward-based health committees, Community Health Workers |
| **Develop personal skills** | Health literacy programmes, lifeskills in schools |
| **Reorient health services** | PHC re-engineering, wellness screening at workplaces |

### Upstream vs Downstream Interventions

```
UPSTREAM (Structural/Social determinants)
    Poverty reduction, housing, education, employment
    Clean water and sanitation (Blue Drop/Green Drop)
    Food security programmes (SNAP, school nutrition)
              ↓
MIDSTREAM (Community/Behavioural)
    WBOT health promotion visits
    Community support groups (PLHIV, TB, DM)
    School health education
              ↓
DOWNSTREAM (Individual/Clinical)
    ART, TB treatment, chronic disease medication
    Surgical interventions
    Hospital-based care
```

Health promotion theory holds that downstream interventions are necessary but insufficient — upstream structural change is required for sustained population health improvement. SA's quadruple burden is largely an upstream failure (apartheid spatial planning, inequality, poverty).

### SA Health Promotion Priorities

**Tobacco control:**
- Tobacco Products and Electronic Delivery Systems Control Act (2022) — plain packaging, vaping restrictions
- CTPA (Cigarette Tax Policy Advocacy) context: sin taxes raised annually in Budget
- SA smoking prevalence ~18% adults (declining)

**Substance abuse:**
- Alcohol: SA has one of the highest per capita consumption rates globally; FASD (Foetal Alcohol Spectrum Disorder) in Northern Cape and Western Cape is a crisis
- Methamphetamine (tik): epidemic in Western Cape — Tygerberg catchment overwhelmed
- Nyaope (whoonga): heroin + cannabis + antiretrovirals — prevalent in Gauteng and KZN townships
- Central Drug Authority (CDA) coordinates policy; SANCA (SA National Council on Alcoholism and Drug Dependence) provides treatment referral

**Gender-based violence:**
- GBV declared national crisis by President Ramaphosa (2019)
- Thuthuzela Care Centres (TCCs) — one-stop GBV response centres at hospitals (183 sites)
- Femicide rate 5× global average

**Obesity and NCDs:**
- HEALA (Healthy Living Alliance) leads civil society advocacy on food environments
- Health Promotion Levy (sugar tax) introduced 2018 — R2.21/gram of sugar above 4g/100ml
- Front-of-pack food labelling regulations (R3337 of 2023) — mandatory from 2025

---

## 7. Key Population Health Metrics

### Life Expectancy and Mortality

| Indicator | SA Value | Comparators |
|----------|---------|------------|
| Life expectancy at birth (overall) | ~64.6 years (2023 est.) | Sub-Saharan Africa avg ~61; Global avg ~73 |
| Life expectancy — female | ~68 years | |
| Life expectancy — male | ~61 years | |
| Under-5 mortality rate (U5MR) | ~34/1,000 live births | MDG5 target achieved; SDG target <25 |
| Infant mortality rate (IMR) | ~25/1,000 live births | Neonatal deaths (first 28 days) drive IMR |
| Neonatal mortality rate (NMR) | ~12/1,000 live births | Prematurity, birth asphyxia, infections |
| Maternal mortality ratio (MMR) | ~119/100,000 live births | NCCEMD Triennial Report; target <70 |
| Stillbirth rate | ~22/1,000 births | High compared to income peers |

**Maternal mortality leading causes in SA (NCCEMD data):**
1. Non-pregnancy-related infections (mostly HIV/TB) — ~43% of maternal deaths
2. Obstetric haemorrhage
3. Hypertension/eclampsia
4. Pregnancy-related sepsis
5. Pre-existing medical conditions

The NCCEMD (National Committee on Confidential Enquiries into Maternal Deaths) produces triennial "Saving Mothers" reports — essential reference for district maternal health management.

### Immunisation Coverage — EPI Schedule

The Expanded Programme on Immunisation (EPI) schedule for SA:

| Age | Vaccines |
|-----|---------|
| Birth | BCG, OPV 0 (birth dose) |
| 6 weeks | DTaP-IPV-Hib-HepB (hexavalent), PCV13, RV1 (rotavirus) |
| 10 weeks | DTaP-IPV-Hib-HepB, PCV13 |
| 14 weeks | DTaP-IPV-Hib-HepB, PCV13, RV1 |
| 6 months | MenAfriVac (meningococcal A — northern border areas) |
| 9 months | Measles 1, MenAfriVac |
| 12 months | PCV13 (booster) |
| 18 months | Measles 2, DTaP-IPV booster |
| 6 years (Grade R) | Td (tetanus-diphtheria) |
| 9 years (Grade 4) | HPV1 (Cervarix — girls only; NDOH piloting gender-neutral) |
| 10 years (Grade 5) | HPV2 |

**Coverage targets:** WHO recommends ≥95% coverage for all antigens. SA DTP3 coverage is ~90–93% nationally but with significant subnational variation (rural districts lower).

**Cold chain**: 2–8°C for most vaccines; BCG and MMR cannot be frozen. Cold chain failures are a quality-of-care indicator monitored under Ideal Clinic.

### TB Programme Metrics

| Metric | SA Performance | Target |
|--------|--------------|--------|
| TB case detection rate | ~76% (estimated vs notified) | 90% |
| Treatment success rate (DS-TB) | ~82–85% | 90% |
| MDR-TB treatment success | ~55–65% | 75% |
| TB preventive therapy (TPT) coverage in PLHIV | ~78% | 90% |
| Contact screening completion | Variable (~40–70% district-dependent) | 90% |

### Antenatal Care (ANC) Coverage

| Indicator | SA Value |
|----------|---------|
| ANC 1st visit before 20 weeks | ~78% |
| ANC 4+ visits | ~91% |
| Facility delivery | ~97% |
| Postnatal care within 6 days | ~88% |

High facility delivery rate is an SA strength — institutional deliveries reduce perinatal mortality. Challenge is quality of care at delivery, not access.

---

## Common Gotchas

- **Confusing TB notification rate with incidence**: SA's ~520/100,000 TB incidence is estimated from modelling; notification rate (cases actually reported) is ~300/100,000. The gap represents missed cases and is the target for active case finding.
- **HIV prevalence ≠ PLHIV who know status**: The 19% adult prevalence means many people are living with undiagnosed HIV — particularly men aged 25–40 who engage with health services less.
- **CFR vs IFR conflation**: During outbreaks (COVID-19, mpox) reporting often confuses case fatality rate (deaths/confirmed cases) with infection fatality rate — CFR is always higher early when only severe cases are confirmed.
- **WBOTs staffing reality**: Policy says one CHW per 250–300 households; implementation reality in most provinces is 1:500–1:800. Don't design programmes assuming full WBOT coverage.
- **NHI implementation timeline**: The Act was signed in 2024 but full fund operationalisation is years away. Do not plan PHC financing strategies assuming NHI is operational.
- **DATIM vs DHIS2 discordance**: HIV programme numbers in DATIM (PEPFAR-funded reporting) and DHIS2 (government DHIS2) routinely differ by 10–20% due to different denominator definitions and reporting periods. Always specify which system figures come from.
- **Maternal mortality undercounting**: SA MMR of ~119/100,000 is based on NCCEMD confidential enquiry data; vital registration undercount means true MMR may be higher.
- **Nyaope/whoonga composition varies by province**: In KZN it often contains HIV antiretrovirals (specifically efavirenz); in Gauteng composition differs. Clinical management implications vary.

---

## See Also

- NICD Communicable Diseases Communique (weekly): nicd.ac.za
- SAMRC South African Burden of Disease Study (2023)
- NCCEMD "Saving Mothers" Triennial Reports (latest: 2020–2022)
- WHO Global TB Report (annual)
- UNAIDS Data (annual) — HIV statistics
- StatsSA Mortality and Causes of Death (annual P0309.3)
- NDoH District Health Barometer (annual) — district-level performance metrics
- HSRC HIV/AIDS/STI/TB National Survey (SABSSM — every 5 years)
- SANHANES-1 (SA National Health and Nutrition Examination Survey) — NCD prevalence baseline
- NDOH NHI White Paper and NHI Act 20 of 2019
- `/health/SKILL.md` — parent domain manifest
- `/health/clinical/SKILL.md` — clinical systems complement
