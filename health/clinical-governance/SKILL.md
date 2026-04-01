---
name: Clinical Governance
description: >
  Patient safety frameworks, clinical audit, incident management, mortality
  and morbidity review, accreditation, and HPCSA compliance for South African healthcare.
requires: []
improves: []
metadata:
  domain: health
  subdomain: clinical-governance
  maturity: stable
---

# Clinical Governance

Clinical governance is the system by which healthcare organisations are accountable for continuously improving the quality of their services and safeguarding high standards of care. In the South African context it sits at the intersection of the National Health Act (61 of 2003), the Office of Health Standards Compliance (OHSC) norms and standards, COHSASA accreditation, and HPCSA practitioner obligations.

This skill carries what a Clinical Governance / Quality Manager specialist brings: frameworks, tools, SA-specific programmes, regulatory touch-points, and the practical mechanics of running a governance function in a public or private facility.

---

## 1. Clinical Governance Framework

### The 7 Pillars

| Pillar | What it covers | Key activities |
|--------|---------------|----------------|
| **Clinical Effectiveness** | Evidence-based practice, guidelines adherence | Clinical audit, protocol review, outcome measurement |
| **Patient Safety** | Incident prevention, harm reduction | Incident reporting, RCA, Never Events monitoring |
| **Patient Experience** | Patient-centred care, dignity | Complaints management, Patient Satisfaction Surveys (PSS), PREMS/PROMS |
| **Staffing & Staff Management** | Safe staffing levels, competency | Workforce planning, performance review, scope of practice compliance |
| **Education & Training** | CPD, clinical competence | Mandatory training registers, CPD points tracking, induction |
| **Information** | Data quality, clinical records | Medical records audits, data completeness, ICD-10 coding accuracy |
| **Communication** | Internal and external communication | SBAR use, handover protocols, family communication standards |

### Governance Committee Structure

```
Board / Hospital Management Committee
        |
Clinical Governance Committee (CGC)
        |
  ┌─────┴──────────────────────────────────────┐
  │              │              │               │
Patient       Clinical       Infection      Pharmacy &
Safety       Audit &        Prevention     Therapeutics
Committee    Effectiveness   Control (IPC)  Committee
             Committee       Committee
  │
  └── Mortality & Morbidity Review Group
```

**Clinical Governance Committee (CGC) — Core Terms of Reference**

| Element | Standard |
|---------|----------|
| Frequency | Minimum quarterly; monthly preferred |
| Quorum | Medical Director + Nursing Manager + at minimum 2 clinical leads |
| Agenda standing items | Incident reports, audit results, M&M outcomes, accreditation status, complaints summary, indicator dashboard |
| Minutes | Circulated within 10 working days; action log tracked to closure |
| Reporting line | Board or equivalent governing body; annual clinical governance report |
| Independence | CGC chair should not be operational line manager of most members |

**Subcommittee Reporting Cadence**

| Subcommittee | Frequency | Reports to CGC |
|-------------|-----------|---------------|
| Patient Safety | Monthly | Quarterly summary |
| Clinical Audit & Effectiveness | Quarterly | Per audit cycle |
| IPC | Monthly | Monthly HAI dashboard |
| Pharmacy & Therapeutics | Monthly | Medication safety incidents |
| M&M Review Group | Monthly (clinical departments) | Quarterly aggregate |

---

## 2. Patient Safety

### Incident Classification

| Class | Definition | Reporting Timeline | Example |
|-------|-----------|-------------------|---------|
| **Sentinel Event** | Unexpected occurrence involving death or serious physical/psychological harm, or risk thereof | Immediate (within 24h) to management; OHSC notification as required | Wrong-site surgery, retained instrument, infant abduction |
| **Serious Adverse Event (SAE)** | Harm to patient that was not the result of underlying illness; requires investigation | Within 48h | Medication error causing organ damage, unplanned return to theatre |
| **Near Miss** | Event that could have caused harm but did not reach the patient, or reached patient without harm | Within 72h | Wrong drug prepared but caught before administration |
| **No Harm Incident** | Reached patient but no discernible harm | Within 7 days | Incorrect diet tray delivered; patient did not eat it |

**Incident Reporting System requirements:**
- Anonymous reporting option available (promotes safety culture)
- Non-punitive response to reporters (except reckless conduct)
- Mandatory acknowledgement to reporter within 5 working days
- All Sentinel Events require formal Root Cause Analysis

### Root Cause Analysis (RCA)

**Trigger:** All Sentinel Events; selected SAEs at Clinical Governance Committee discretion.

**5 Whys Method**
A sequential interrogation technique. For each identified cause, ask "Why did this occur?" up to 5 iterations until the systemic root cause is reached. Stop when reaching a factor outside the organisation's control.

```
Incident: Patient received wrong medication
Why 1: Wrong drug drawn from the Pyxis?  → Nurse selected wrong vial
Why 2: Why wrong vial selected?           → Look-alike packaging on adjacent shelf
Why 3: Why adjacent?                      → No segregation protocol in place
Why 4: Why no protocol?                   → Not identified in last accreditation round
Why 5: Why not identified?                → Pharmacy audit did not include storage review
Root cause: Pharmacy audit scope gap + absence of LASA segregation policy
```

**Fishbone / Ishikawa Diagram — Standard Categories for Healthcare**

```
                    ┌──────────────────────┐
                    │       INCIDENT       │
                    └──────────────────────┘
                              ▲
         ┌────────────────────┴────────────────────┐
         │                                         │
    ┌────┴────┐                              ┌─────┴────┐
    │  Staff  │                              │Equipment │
    └─────────┘                              └──────────┘
    ┌─────────┐                              ┌──────────┐
    │ Process │                              │  Place / │
    │(Method) │                              │Environment│
    └─────────┘                              └──────────┘
    ┌─────────┐                              ┌──────────┐
    │Materials│                              │Management│
    │(Drugs/  │                              │& Culture │
    │Supplies)│                              │          │
    └─────────┘                              └──────────┘
```

Populate each bone with contributing factors before identifying root cause. All bones must be explored before concluding.

**RCA Report minimum structure:**
1. Incident description (factual, no names)
2. Timeline of events
3. Immediate actions taken
4. Fishbone analysis
5. Root cause(s) identified
6. Recommendations (SMART — Specific, Measurable, Achievable, Relevant, Time-bound)
7. Implementation plan with named accountable persons
8. Review date for effectiveness check

### SBAR Communication Tool

Used for handovers, escalations, and critical communications.

| Component | Prompt |
|-----------|--------|
| **S — Situation** | "I am calling about [patient name/bed] because [reason]" |
| **B — Background** | Diagnosis, admission date, relevant history, current treatment |
| **A — Assessment** | "I think the problem is…" — your clinical concern |
| **R — Recommendation** | "I need you to [come assess / order X / advise on Y] within [timeframe]" |

SBAR applies equally to: nurse-to-doctor handover, doctor-to-specialist referral, ward round summary, critical result notification.

### Safety Culture Assessment

**Manchester Patient Safety Framework (MaPSaF)**

A validated self-assessment tool covering 9 dimensions of safety culture. Each dimension is rated across 5 maturity levels:

| Level | Label | Characteristic |
|-------|-------|---------------|
| A | Pathological | "Why waste time on safety?" |
| B | Reactive | Safety only after incidents occur |
| C | Bureaucratic | Systems exist for compliance only |
| D | Proactive | Safety risks anticipated and managed |
| E | Generative | Safety is how we work; learning is continuous |

MaPSaF dimensions: overall commitment to safety, priority given to safety, systems errors and individual responsibility, recording and monitoring, evaluating incidents, learning and change, communication, staff management, staff education/training.

Target: organisations should aim to sustain Level D across all dimensions; Level E is the benchmark for high-reliability organisations (HRO).

### Never Events

Never Events are serious, largely preventable patient safety incidents that should not occur if the available preventive measures are implemented. South African facilities should adopt as a minimum:

| Never Event | Prevention measure |
|-------------|-------------------|
| Wrong-site surgery | WHO Surgical Safety Checklist (mandatory sign-in, time-out, sign-out) |
| Retained surgical instrument | Instrument and swab count protocols |
| Wrong patient procedure | Two-identifier patient verification at every handover point |
| Medication 10-fold dosing error | Independent double-check for high-alert medications |
| Misidentification of blood product | Two-nurse blood verification at bedside |
| Undetected oesophageal intubation | Waveform capnography confirmation |
| Intravenous potassium chloride given undiluted | Remove concentrated KCl from ward stock |
| Infant discharge to wrong family | Identity band + photograph protocol |

---

## 3. Clinical Audit

### The Audit Cycle

```
1. IDENTIFY STANDARD
   (guideline, protocol, best practice, NCS criterion)
          ↓
2. SET CRITERIA & STANDARDS
   (measurable, evidence-based, agreed by clinical team)
          ↓
3. COLLECT DATA
   (sample size, data collection tool, prospective or retrospective)
          ↓
4. COMPARE AGAINST STANDARD
   (compliance rate, gap analysis, benchmarking)
          ↓
5. IMPLEMENT CHANGE
   (education, protocol update, system change, re-training)
          ↓
6. RE-AUDIT
   (close the loop — confirm improvement sustained)
          ↑
          └─ Repeat cycle
```

**Minimum acceptable sample size for ward-level audits:** 30 cases or 10% of caseload per month — whichever is greater. For low-frequency procedures, 100% case review is appropriate.

### Audit Types

| Type | Description | When to use |
|------|-------------|-------------|
| **Prospective** | Data collected in real time as care is delivered | New protocol implementation; process compliance |
| **Retrospective** | Data extracted from existing records | Outcome measurement; baseline assessment |
| **Criterion-based** | Measures compliance with specific agreed criteria | Guideline adherence; standard of care |
| **Significant Event Audit (SEA)** | Detailed review of a single significant case — positive or negative | Sentinel events; exemplary care; complex cases |
| **Tracer Methodology** | Follows one patient's journey across departments | System-wide process evaluation (used in COHSASA) |

### Audit Report Structure

| Section | Content |
|---------|---------|
| Title | Audit name, department, period, lead auditor |
| Objective | What standard was being measured and why |
| Methodology | Sample, data source, collection method |
| Results | Compliance rates, variances, tables/charts |
| Analysis | Why gaps exist — contributing factors |
| Recommendations | Numbered, SMART actions |
| Action Plan | Responsible person, deadline, resource required |
| Re-audit date | When loop will be closed (typically 3–6 months) |

---

## 4. Mortality & Morbidity Review

### M&M Meeting Structure

**Frequency:** Monthly per clinical department; aggregate quarterly to CGC.

**Case Selection Criteria** (all-cause, no pre-selection bias):
- All in-hospital deaths
- Unplanned return to theatre within 30 days
- Unplanned ICU admission
- Significant complications (e.g., anastomotic leak, post-operative haemorrhage)
- Cases where team requests review (anonymous nomination acceptable)

**Meeting Format:**

| Phase | Duration | Content |
|-------|----------|---------|
| Case presentation | 5–10 min per case | Factual timeline, no names, presented by most junior appropriate clinician |
| Discussion | 10–15 min | Multidisciplinary; what happened, contributing factors |
| Classification | 2 min | Preventability grading (see below) |
| Learning points | 5 min | What would we do differently? |
| Action assignment | 2 min | Named person, deadline |

**Preventability Grading:**

| Grade | Definition |
|-------|-----------|
| 0 — Not preventable | Death/complication was inevitable given presentation and available resources |
| 1 — Possibly preventable | Some factors identifiable but likely not decisive |
| 2 — Probably preventable | Management contributed significantly; different approach likely to have altered outcome |
| 3 — Preventable | Clear management error or system failure; different approach would have prevented outcome |

**Learning vs Blame Culture**
M&M is a protected learning environment. Presentations are anonymised. No disciplinary action flows directly from M&M. However, a pattern of Grade 2–3 cases linked to a specific individual should trigger a separate clinical performance review process under HPCSA professional conduct rules — these are distinct processes.

### Maternal Mortality Review — NCCEMD

**National Committee for Confidential Enquiries into Maternal Deaths (NCCEMD)** is the South African body that conducts confidential enquiries into all maternal deaths in public and private facilities.

**Mandatory reporting:** Every maternal death must be reported to the NCCEMD within 7 days using the standardised maternal death notification form.

**Confidential Enquiry Process:**
1. Facility completes maternal death data form (within 7 days)
2. District/provincial review
3. Regional NCCEMD review panel
4. National analysis published in triennial Saving Mothers Report

**Saving Mothers Report** — the triennial publication classifying SA maternal deaths by avoidable factors:
- Patient-related delays (delay in seeking care)
- Administrative factors (facility resource failures)
- Healthcare provider factors (clinical management failures)

**Leading causes tracked:** Non-pregnancy-related infections (NPRI, primarily HIV/TB), obstetric haemorrhage, hypertensive disorders, pre-existing medical conditions.

**Avoidable Factor classification** is used to direct quality improvement — facilities with high provider factor rates trigger targeted intervention.

### Perinatal Mortality Review — PPIP

**Perinatal Problem Identification Programme (PPIP)** is the SA audit tool for perinatal deaths (stillbirths + neonatal deaths in the first week of life).

**All perinatal deaths** must be entered into the PPIP database.

**PPIP Classification System:**

| Primary Obstetric Problem | Neonatal Problem |
|--------------------------|-----------------|
| Hypertension | Immaturity |
| Antepartum haemorrhage | Infection |
| Fetal abnormality | Hypoxia |
| Maternal disease | Other |
| Unexplained IUD | |

**Avoidable factors in PPIP** mirror NCCEMD: patient/family factors, administrative factors, health worker factors.

**PPIP output:** Perinatal mortality rate (PNMR) per 1,000 births; stillbirth rate; early neonatal death rate. These feed directly into the Ideal Hospital Realisation and Maintenance Programme (IHRP) scorecard.

---

## 5. Infection Prevention & Control (IPC)

### HAI Surveillance

**Hospital-Acquired Infection (HAI)** — infection not present at admission, occurring ≥48h after admission (or within 30 days of discharge for surgical site infections).

**Core HAI types monitored:**

| HAI Type | Denominator | Target rate |
|----------|-------------|------------|
| Catheter-Associated Urinary Tract Infection (CAUTI) | Per 1,000 catheter-days | <3/1,000 |
| Central Line-Associated Bloodstream Infection (CLABSI) | Per 1,000 central-line days | <1/1,000 |
| Surgical Site Infection (SSI) | Per 100 procedures by wound class | Varies by class |
| Ventilator-Associated Pneumonia (VAP) | Per 1,000 ventilator-days | <2/1,000 |
| Clostridioides difficile | Per 10,000 patient-days | <1/10,000 |
| MRSA bacteraemia | Per 1,000 patient-days | <0.5/1,000 |

**HAI Rate formula:**

```
HAI Rate = (Number of HAIs / Number of patient-days) × 1,000
```

### WHO 5 Moments for Hand Hygiene

Compliance auditing against the 5 Moments is a COHSASA and IHRP requirement.

| Moment | Timing |
|--------|--------|
| 1 | Before touching a patient |
| 2 | Before a clean/aseptic procedure |
| 3 | After body fluid exposure risk |
| 4 | After touching a patient |
| 5 | After touching patient surroundings |

**Compliance target:** ≥80% overall; ICU ≥90%. Audit monthly using WHO observation tool. Report to IPC Committee.

**Calculation:**
```
Compliance % = (Compliant actions / Opportunities observed) × 100
```

### MRSA and CRKP Screening Protocols

**MRSA (Methicillin-Resistant Staphylococcus aureus):**
- Screen on admission: ICU, haematology, oncology, renal, patients transferred from other facilities
- Screen sites: nasal swab (primary) + wound/skin lesion if present
- Positive result action: contact precautions (gown + gloves), single room or cohort, decolonisation per protocol (mupirocin nasal + chlorhexidine bath for 5 days)
- Screen to clear: 3 negative screens ≥48h apart

**CRKP (Carbapenem-Resistant Klebsiella pneumoniae):**
- Screen on admission from high-risk facilities or endemic areas
- Screen sites: rectal swab
- Positive result action: enhanced contact precautions, dedicated equipment, alert on patient record
- Outbreak threshold: 2 linked cases in same ward/unit within 30 days → trigger outbreak protocol

### Outbreak Management

**Outbreak declared when:** HAI rate exceeds control chart upper control limit (UCL) or ≥2 linked cases of significant pathogen.

**Outbreak Response Steps:**
1. Declare outbreak — notify IPC Lead and Hospital Management within 4h
2. Case definition established (who counts as a case)
3. Case finding — review all admissions in affected area
4. Enhanced surveillance (active rather than passive)
5. Implement enhanced IPC precautions (cohorting, dedicated staff if possible)
6. Environmental sampling (swabs, cultures)
7. Microbiology and Public Health notification (NICD if notifiable condition)
8. Daily situation report to management until outbreak declared over
9. Outbreak declared over: 2 × maximum incubation period with no new cases
10. Post-outbreak debrief and report to CGC

**NICD (National Institute for Communicable Diseases)** must be notified for: CRKP clusters, XDR-TB, outbreak of unknown aetiology affecting ≥5 patients.

### IPC Committee

| Role | Responsibility |
|------|---------------|
| IPC Lead (Infection Control Nurse / IPC Practitioner) | Day-to-day surveillance, education, audit |
| Medical Microbiologist / Infectious Disease Physician | Clinical guidance, outbreak management |
| Pharmacy representative | Antibiotic stewardship, antimicrobial resistance data |
| Nursing Management | Policy enforcement, staffing implications |
| Housekeeping/Environmental Services | Cleaning and disinfection protocols |
| Engineering/Maintenance | HVAC, water systems, building works |

IPC Committee frequency: monthly; reports to CGC quarterly.

---

## 6. Accreditation

### COHSASA

**Council for Health Service Accreditation of Southern Africa (COHSASA)** is the primary healthcare accreditation body in South Africa. It is an ISQua (International Society for Quality in Health Care) accredited body — meaning its own accreditation process meets international standards.

**COHSASA Accreditation Process:**

| Phase | Activity | Duration |
|-------|----------|----------|
| 1. Application | Facility applies; baseline self-assessment against COHSASA standards | 1–2 months |
| 2. Quality Improvement Programme (QIP) | Facility implements improvements; COHSASA support and mentoring available | 6–24 months (varies by readiness) |
| 3. Pre-accreditation survey (optional) | Mock survey to identify gaps before formal survey | |
| 4. Accreditation survey | External survey team (3–5 days); tracer methodology; interviews; document review | 3–5 days on-site |
| 5. Accreditation decision | Report issued; accreditation granted or conditional | 4–6 weeks post-survey |
| 6. Surveillance | Ongoing monitoring; midterm review; 3-year accreditation cycle | Continuous |

**Accreditation Outcomes:**

| Outcome | Meaning |
|---------|---------|
| Accredited | Full compliance with required standards |
| Accredited with conditions | Minor non-compliances; corrective action plan required |
| Not accredited | Significant gaps; re-survey required |

**COHSASA Standard Domains** (current framework):
- Leadership and Governance
- Patient Rights and Organisational Ethics
- Patient Safety
- Clinical Care
- Medication Management
- Infection Prevention and Control
- Human Resources
- Quality Improvement
- Support Services (Radiology, Laboratory, Pharmacy, Catering, Housekeeping)
- Physical Environment and Safety

### ISQua Alignment

COHSASA's standards are aligned to ISQua's International Principles for Healthcare Standards (IPHS). This means COHSASA accreditation is internationally recognised. Facilities accredited by COHSASA can credibly reference this for international partnerships, medical tourism, and insurer contracting.

### JCI Differences

| Dimension | COHSASA | JCI |
|-----------|---------|-----|
| Cost | More accessible for SA private facilities | Significantly higher (US-based) |
| Language | Aligned to SA regulatory environment | US-centric; requires local adaptation |
| NCS alignment | Mapped to OHSC National Core Standards | Not specifically aligned |
| Prevalence in SA | Most private hospitals; many public | Select premium private hospitals only |
| International recognition | ISQua-accredited; recognised in Africa/Commonwealth | Global premium recognition |
| Tracer methodology | Yes | Yes |

Recommendation: COHSASA is the default standard for SA facilities. JCI only if international marketing or insurer contract explicitly requires it.

---

## 7. Complaints & Compliments

### Complaint Management Process

**National Health Act (61 of 2003), Section 46** — Patient rights include the right to lodge complaints about health services and to have those complaints investigated.

**Process:**

| Step | Timeline | Action |
|------|----------|--------|
| Receipt | Day 0 | Acknowledge receipt in writing (email, letter, or handed form). Complaints register updated. |
| Acknowledgement | Within 24 hours | Written acknowledgement to complainant; assigned case manager identified |
| Investigation | Within 5 working days | Gather records, interview staff, review clinical notes |
| Response | Within 30 days | Written response addressing each point raised; findings and actions taken |
| Escalation | If not resolved | Inform complainant of escalation options (OHSC, Health Ombud) |
| Closure | When complainant satisfied or process exhausted | Record outcome; identify systemic issues for CGC |

**Complaints Register** must capture: date received, complainant details, nature of complaint, assigned case manager, response date, outcome, whether systemic issue identified.

**Compliments** — document and share with staff. Compliment-to-complaint ratio is an indicator of patient experience culture. Target: 3:1 or better (3 compliments per complaint).

### OHSC — Office of Health Standards Compliance

The OHSC is established under the National Health Amendment Act (12 of 2013). It monitors and enforces compliance with health establishment norms and standards.

**OHSC Inspection types:**
- Announced inspection (scheduled)
- Unannounced inspection (random compliance check)
- Complaint-triggered inspection (following a formal complaint to the OHSC)

**OHSC Inspection focus areas** mirror the National Core Standards (NCS):
1. Patient rights
2. Patient safety, clinical governance, and clinical care
3. Clinical support services
4. Public health
5. Leadership and governance
6. Operational management
7. Facilities and infrastructure

**Non-compliance with OHSC norms** — the OHSC can issue:
- Improvement notice (corrective action required within specified period)
- Prohibition notice (stop specific practice or close unit)
- Referral to Health Ombud for investigation

### Health Ombud

Established under the Office of Health Standards Compliance Act. The Health Ombud investigates complaints about serious non-compliance with norms and standards. The Health Ombud has powers to compel testimony and production of records. Findings are published and can be referred to the Minister of Health.

Key distinction: OHSC = standards inspection / systemic compliance. Health Ombud = serious individual or systemic complaints where OHSC process has been exhausted or where severity warrants direct investigation.

---

## 8. Clinical Indicators

### Core Dashboard Indicators

| Indicator | Formula | Frequency | Target |
|-----------|---------|-----------|--------|
| **HAI Rate** | (HAIs / Patient-days) × 1,000 | Monthly | Benchmark by HAI type (see Section 5) |
| **Pressure Ulcer Prevalence** | (Patients with pressure ulcer / Patients surveyed) × 100 | Monthly point prevalence | <5% (hospital-acquired only) |
| **Fall Rate** | (Patient falls / Patient-days) × 1,000 | Monthly | <3/1,000 patient-days |
| **Medication Error Rate** | (Medication errors / Patient-days) × 1,000 | Monthly | Trend down; zero serious medication errors |
| **In-Hospital Cardiac Arrest Survival** | (ROSC achieved / Cardiac arrests) × 100 | Monthly | >30% ROSC; benchmark against Utstein registry |
| **Unplanned ICU Admission Rate** | (Unplanned ICU admissions / Total admissions) × 100 | Monthly | Facility-specific; track trend |
| **30-Day Readmission Rate** | (Readmissions within 30 days / Discharges) × 100 | Monthly | <10% (general); <15% cardiac/surgical |
| **HSMR** | (Observed deaths / Expected deaths) × 100 | Quarterly | <100 (100 = national average; <75 = top quartile) |

### HSMR — Hospital Standardised Mortality Ratio

**Formula:**
```
HSMR = (Observed in-hospital deaths / Expected deaths based on case-mix) × 100
```

- Expected deaths are calculated using a risk-adjustment model accounting for: age, sex, diagnosis (ICD-10), comorbidities, admission urgency, length of stay.
- HSMR = 100 means the facility's mortality rate equals the national average for its case-mix.
- HSMR > 100 indicates higher-than-expected mortality — triggers investigation.
- HSMR < 100 indicates lower-than-expected mortality.

**SA context:** HSMR is not yet universally mandated in SA but is used by accredited private hospital groups (Netcare, Mediclinic, Life Healthcare) and is part of COHSASA quality indicator requirements for accredited facilities. Public facilities are expected to report to provincial DoH via DHIS (District Health Information System).

### Indicator Interpretation Principles

- Never act on a single data point. Use run charts or Statistical Process Control (SPC) charts to distinguish special cause variation (requiring investigation) from common cause variation (requiring system redesign).
- **Special cause signal:** 1 point beyond 3 sigma, 8 consecutive points above or below the mean, 6 consecutive points trending in one direction.
- Indicators should be presented with trend lines and benchmarks. A compliance number without trend is meaningless.

---

## 9. South African Context

### OHSC National Core Standards (NCS)

The National Core Standards define the minimum acceptable quality of health services in SA. Organised into 7 domains (see Section 7). OHSC inspection compliance thresholds:

| Score | Status |
|-------|--------|
| ≥80% | Compliant |
| 60–79% | Conditional compliance |
| <60% | Non-compliant |

Certain criteria are classified as "vital" (immediate risk to life) or "essential" (significant risk). A single vital criterion failure can result in a prohibition notice regardless of overall score.

### IHRP — Ideal Hospital Realisation and Maintenance Programme

The Department of Health's quality improvement programme for public sector hospitals (the equivalent of the Ideal Clinic programme for PHC facilities).

**IHRP Assessment Domains:**

| Domain | Key measures |
|--------|-------------|
| Administration and Management | Governance, HR, finance compliance |
| Clinical Governance | M&M, adverse events, clinical audit |
| Clinical Support Services | Laboratory, pharmacy, radiology turnaround |
| Infection Prevention and Control | Hand hygiene compliance, HAI rates |
| Patient Safety | Incident reporting rate, Never Events |
| Infrastructure | Maintenance, equipment functionality |
| Patient Experience | Patient satisfaction scores |

**IHRP Score levels:**
- Level 1: Basic (foundational requirements met)
- Level 2: Intermediate
- Level 3: Ideal (optimal functioning; publicly recognised)

Facilities achieving Level 3 receive DoH recognition and are used as training/mentoring sites.

### Provincial Reporting Requirements

**DHIS (District Health Information System)** — the national data platform. All public facilities must report monthly to DHIS. Key clinical governance indicators reported via DHIS:
- PNMR (from PPIP)
- Maternal deaths (NCCEMD notifications)
- IHRP scores
- HAI rates (IPC surveillance)
- Complaint volumes

**Provincial Quality Improvement Plans (QIPs):** Each facility is required to have a documented, annually reviewed QIP aligned to IHRP gaps and NCS non-compliances. The QIP is the facility's commitment to the Provincial DoH on how it will close identified gaps.

**Reporting chain:** Facility QIP → District Health Management → Sub-district QI team → Provincial DoH Quality Assurance Directorate → National DoH.

### HPCSA vs Clinical Governance Complaints — Critical Distinction

These are **separate processes** with different triggers, investigators, and consequences.

| Dimension | Clinical Governance Complaint | HPCSA Conduct Complaint |
|-----------|------------------------------|------------------------|
| Trigger | Complaint about facility service quality or system failure | Complaint about individual practitioner's professional conduct or competence |
| Investigated by | Facility complaints officer → OHSC (if escalated) → Health Ombud | HPCSA Professional Conduct Committee |
| Who is respondent | The health establishment | The individual registered practitioner |
| Outcome | Facility improvement notice, prohibition, public report | Practitioner warning, suspension, erasure from register |
| Legal basis | National Health Act s46; OHSC Act | Health Professions Act (56 of 1974) |
| Confidentiality | Complaint subject to NHA privacy provisions | HPCSA hearings are generally public |
| Timeline | 30-day facility response; OHSC investigation varies | HPCSA preliminary inquiry + formal hearing; can take 1–3 years |

**Practical guidance:**
- A medication error complaint can run both processes simultaneously: facility handles the systems failure (clinical governance); if the pharmacist or doctor deviated from scope of practice, HPCSA is notified separately.
- Clinical governance findings (e.g., an RCA report) may be requested as evidence in HPCSA proceedings. Ensure RCA reports are factual, anonymised, and focused on system causes rather than individual blame — this protects both the learning process and individuals.
- Pattern of complaints against one practitioner across multiple patients = likely HPCSA referral. Single system failure = likely clinical governance only.
- HPCSA has a mandatory reporting obligation: any practitioner who is aware that a colleague is practising in a manner that poses a risk to patients has a duty to report to the HPCSA.

---

## Common Gotchas

- **M&M anonymisation is protective, not obstruction.** Do not include patient names or staff names in M&M minutes. Minutes are a learning record. If litigation arises, named M&M minutes are discoverable. Anonymised system-focused minutes are substantially less useful as evidence against the facility.
- **NCS vital criteria can override your overall score.** A facility scoring 85% overall can still receive a prohibition notice if a vital criterion (e.g., oxygen supply failure, no resuscitation equipment) is failed. Audit vital criteria separately and prioritise them.
- **PPIP and NCCEMD are mandatory, not optional.** Non-reporting of perinatal or maternal deaths is a compliance failure and will be flagged in OHSC inspections. Build reporting into the routine — don't wait for M&M meetings to trigger it.
- **COHSASA tracer methodology will expose disconnects between policy and practice.** A binder of policies is not evidence of compliance. Surveyors follow patients through the system — staff must know and apply the policies. Education and simulation are more effective than document audits.
- **Hand hygiene compliance tends to be over-reported.** Hawthorne effect (observed behaviour improves under observation) inflates audit scores. Triangulate with HAI rates and product usage data (litres of alcohol hand rub consumed per patient-day) for a more accurate picture. Target: ≥2 mL alcohol hand rub per patient-day.
- **HSMR requires accurate ICD-10 coding.** The risk-adjustment model depends on correct primary and secondary diagnosis coding. Facilities with poor coding accuracy will have unreliable HSMR. Run an ICD-10 coding audit before interpreting HSMR.
- **CGC minutes without action tracking are performative governance.** Each action item must have a named owner, a deadline, and a follow-up status at the next meeting. A CGC that generates recommendations without tracking their closure is not functioning as a governance structure.
- **Complaints not logged are a regulatory risk.** Verbal complaints resolved at ward level without logging create blind spots. Train all staff to log every complaint, even those resolved immediately. The complaints register is reviewed in OHSC inspections.

---

## See Also

- [National Core Standards — OHSC](https://www.ohsc.org.za)
- [COHSASA accreditation standards](https://www.cohsasa.co.za)
- [NCCEMD Saving Mothers Reports — National DoH](https://www.health.gov.za)
- [PPIP programme — MRC South Africa](https://www.mrc.ac.za)
- [HPCSA Professional Conduct](https://www.hpcsa.co.za)
- [WHO Surgical Safety Checklist](https://www.who.int/teams/integrated-health-services/patient-safety/research/safe-surgery)
- [Manchester Patient Safety Framework](https://www.manchestersafety.org)
- [NICD Healthcare-Associated Infections](https://www.nicd.ac.za)
