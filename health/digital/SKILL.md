---
name: Digital Health & Clinical Informatics
description: >
  EMR/EHR systems, HL7 FHIR interoperability, telemedicine, health data standards,
  clinical decision support, and digital health implementation in South Africa.
requires: []
improves: []
metadata:
  domain: health
  subdomain: digital
  maturity: stable
---

# Digital Health & Clinical Informatics

Clinical informatics sits at the intersection of healthcare delivery, data management, and technology. In the South African context it spans both a sophisticated private sector (operating at par with global best practice) and a heavily digitising public sector navigating NHID rollout, DHIS2 maturation, and constrained infrastructure. This skill equips an agent to advise on system selection, implementation, interoperability architecture, regulatory obligations, and digital health KPIs in that dual-context environment.

---

## 1. EMR vs EHR vs PHR — Getting the Terminology Right

These terms are used loosely in SA practice. Precision matters when specifying systems or drafting RFPs.

| Term | Definition | Scope | Owned by |
|------|-----------|-------|---------|
| **EMR** (Electronic Medical Record) | Digital version of a paper chart within a single practice or facility | One provider organisation | Provider |
| **EHR** (Electronic Health Record) | Longitudinal record designed to be shared across providers | Cross-facility, cross-sector | Multi-stakeholder |
| **PHR** (Personal Health Record) | Patient-controlled record aggregating their own data | Patient's full history | Patient |

In SA private practice, "EMR" is used colloquially for both EMR and EHR. The regulatory distinction matters for NHID compliance: the NDoH's vision is a national EHR via the Shared Health Record (SHR), not facility-siloed EMRs.

### Key Systems in South Africa

#### Private Sector

| System | Vendor | Market Presence | Notes |
|--------|--------|-----------------|-------|
| **Elixir** | Elixir Health | Dominant in SA private hospitals (Netcare, Life Healthcare, Mediclinic) | Deeply integrated with SA billing (BHF tariff codes, medical aid EDI); proprietary but FHIR adapters being added |
| **Meditech** | Meditech | Selected private hospitals, some public-private | US-origin; strong pharmacy module; FHIR R4 support via Traverse API |
| **TrakCare** | InterSystems | Private hospitals and some provincial systems | Supports HL7 v2 and FHIR; InterSystems HealthShare underpins some SA HIE work |
| **iSoft** | Now part of CSC/DXC Health | Legacy installs still active | Largely being migrated off |
| **Helios** | Helios Health | Mid-market private practices and day clinics | SA-developed; good local billing support |
| **DrNote** | DrNote (SA startup) | GP practices and outpatient | Cloud-native; mobile-first; growing footprint |
| **HealthIQ** | HealthIQ (SA) | Specialist practices | Procedure and outcome tracking focus |

#### Public Sector and NGO

| System | Vendor/Origin | Use Case |
|--------|--------------|----------|
| **OpenMRS** | Open-source (Regenstrief) | Widely deployed in SA public clinics, NGO-run ART programmes; modular; FHIR R4 support via OpenMRS FHIR module |
| **PHCIS** | NDoH / provincial | Primary Health Care Information System — legacy; being replaced |
| **SINJANI** | NDoH | Clinic-level patient registration and visit tracking (KZN/WC) |
| **ETR.net** | PEPFAR-funded | HIV/TB electronic register; widely used at facility level |

### Selection Criteria Checklist

When advising on EMR/EHR selection, evaluate against:

1. **HL7 FHIR R4 compliance** — can it expose a FHIR API? Required for NHID integration long-term.
2. **Local billing integration** — BHF tariff codes, NHRPL procedure codes, EDI 837/835 equivalents for SA medical aid claims (PCM/EDI via Healthbridge or Meddbase).
3. **HPCSA record-keeping compliance** — records must be retained for a minimum of 6 years (adults) or until the patient turns 26 (minors); system must support audit trails and access logs.
4. **POPIA compliance** — health records are special personal information under s26 of POPIA; system must enforce access controls, consent tracking, and breach notification capability.
5. **Uptime and offline capability** — rural and peri-urban SA has unreliable connectivity; systems must support offline-first operation with sync.
6. **Local support and SLA** — vendor presence in SA, response times, data sovereignty (no patient data leaving SA borders without compliant mechanisms).
7. **Integration with laboratory systems** — LIS (Lab Information System) connectivity, particularly to NHLS (National Health Laboratory Service) for public sector.

---

## 2. HL7 FHIR

### What FHIR Is

**FHIR** (Fast Healthcare Interoperability Resources, pronounced "fire") is the modern standard for healthcare data exchange, published by HL7 International. It is RESTful, resource-oriented, and uses JSON or XML. The current production version is **FHIR R4** (4.0.1, 2019); FHIR R5 is published but not yet widely adopted in SA.

FHIR replaces the older HL7 v2 (message-based, pipe-delimited) and HL7 v3/CDA (XML, complex) standards. HL7 v2 remains ubiquitous in SA hospital middleware (particularly ADT feeds and lab results), so any SA integration strategy must handle both.

### FHIR Resource Architecture

Every FHIR resource is a JSON object accessible via a standard RESTful URL pattern:

```
GET  https://fhir.example.org/Patient/12345
GET  https://fhir.example.org/Patient?identifier=ZA-ID|8001015009087
POST https://fhir.example.org/Observation
PUT  https://fhir.example.org/MedicationRequest/67890
```

### Core Resources for Clinical Informatics

| Resource | Purpose | SA Example |
|----------|---------|-----------|
| **Patient** | Demographics, identifiers | SA ID number as identifier system `http://za.gov.nid/identifier`; HN (Health Number) as `http://hprs.health.gov.za/identifier` |
| **Encounter** | A visit or admission | OPD visit at a clinic, inpatient episode, telemedicine consultation |
| **Observation** | Measurements, lab results, vitals | Viral load result, blood pressure, NEWS2 score component |
| **MedicationRequest** | Prescription / medication order | ARV regimen order in OpenMRS |
| **DiagnosticReport** | Lab panel, radiology report | NHLS full blood count, chest X-ray report with CAD4TB flag |
| **Condition** | Diagnosis / problem | ICD-10 coded diagnosis — Z21 (HIV positive status) |
| **Procedure** | Procedure performed | NHRPL-coded surgical procedure |
| **Immunization** | Vaccine administration | EPI vaccine given at clinic |
| **AllergyIntolerance** | Drug/food allergies | Penicillin allergy for drug interaction checking |
| **CarePlan** | Longitudinal care plan | ART adherence plan, TB DOTS plan |

### SMART on FHIR

**SMART on FHIR** (Substitutable Medical Applications and Reusable Technologies) is the OAuth 2.0-based authorisation framework for health applications launching from within EHR platforms. It enables third-party clinical apps to access patient data with the clinician's permission, without sharing raw credentials.

Flow:
1. EHR launches SMART app with a launch context (patient ID, encounter ID, user role).
2. SMART app redirects to the EHR's authorisation server.
3. Clinician approves the scopes (e.g., `patient/Observation.read`, `user/MedicationRequest.write`).
4. App receives an access token tied to the patient context.
5. App calls the FHIR API using the token.

Relevant SA scopes for common use cases:
- `patient/Patient.read` — read the patient record
- `patient/Observation.read` — read lab results and vitals
- `user/MedicationRequest.write` — write a prescription
- `launch/patient` — receive patient context on launch

### SA FHIR Implementation: DHMIS and NHIS

**DHMIS (District Health Management Information System)** is the NDoH's framework for district-level health data aggregation. It is not a single system but a set of standards and data flows connecting facility-level systems (OpenMRS, ETR.net, PHCIS) to DHIS2 at the district and national level.

**NHIS (National Health Information System)** — the NDoH's overarching architecture for the National Health Information System under NHID — envisions:
- A **Health Number** (HN) for every person in SA (similar to NHS Number in the UK)
- A **Shared Health Record (SHR)** — longitudinal FHIR-based record accessible across providers
- **HN-PIX** (Health Number Patient Identity Cross-Reference) — the master patient index matching records across facilities using probabilistic matching on demographics + SA ID number
- **Point-of-Care (PoC) Integration** via FHIR APIs connecting facility EMRs to the SHR

Current status (2025): HN piloting in selected provinces. SHR in development. Full NHID rollout contingent on National Health Insurance Act operationalisation.

### HL7 v2 — Still Relevant

HL7 v2 message types still dominate SA hospital integration engines (Mirth Connect, Rhapsody, InterSystems Ensemble):

| Message Type | Trigger | Content |
|-------------|---------|---------|
| **ADT^A01** | Patient admission | Demographics, MRN, ward, attending doctor |
| **ADT^A08** | Patient info update | Changed demographics or insurance |
| **ADT^A03** | Patient discharge | Discharge date, disposition |
| **ORM^O01** | Order (lab/radiology) | Test order from clinician |
| **ORU^R01** | Observation result | Lab result back from LIS |
| **MDM^T02** | Document notification | Clinical note or report |

Integration tip: Most SA integration projects require an HL7 v2 → FHIR translation layer. Use an integration engine (Mirth Connect is free/open-source; Rhapsody is common in larger hospitals) to transform v2 messages to FHIR resources before feeding the SHR or analytics platform.

---

## 3. Clinical Decision Support (CDS)

### CDS Types

| Type | Description | SA Example |
|------|-------------|-----------|
| **Drug-drug interaction (DDI) alert** | Fires when two medications with a known interaction are co-prescribed | Fluconazole + warfarin (INR risk) |
| **Drug-allergy alert** | Fires when a prescribed drug matches a documented allergy | Penicillin order for a patient with documented penicillin allergy |
| **Order sets** | Pre-configured bundles of orders for a clinical scenario | Sepsis bundle: blood cultures × 2, lactate, broad-spectrum antibiotics, IV fluids |
| **Documentation templates** | Structured note templates ensuring completeness | Pre-operative assessment, discharge summary |
| **Diagnostic reminder** | Suggests a test or action based on patient data | CD4 count overdue for HIV patient on ART > 6 months |
| **Best practice advisory (BPA)** | Non-interruptive suggestion | "Patient due for cervical cancer screening" |
| **Risk score dashboard** | Aggregated risk display | NEWS2 score, CURB-65 score |

### CDS Hooks

**CDS Hooks** is the standard (HL7-published) for triggering CDS logic from an EHR workflow. The EHR calls an external CDS service at defined hook points, and the service returns cards (suggestions, alerts, app links).

```
Hook points used in SA implementations:
- patient-view     → fires when a clinician opens a patient chart
- order-sign       → fires when a clinician is about to sign an order
- medication-prescribe → fires during medication ordering workflow
```

CDS Hook card structure (JSON):
```json
{
  "summary": "Drug-drug interaction: Fluconazole + Warfarin",
  "indicator": "warning",
  "detail": "Co-prescribing may increase INR by 50–100%. Monitor INR within 48 hours or switch antifungal.",
  "source": { "label": "SA National Formulary" },
  "suggestions": [
    {
      "label": "Switch to topical antifungal",
      "actions": [...]
    }
  ]
}
```

### Alert Fatigue — The Critical Problem

Poorly configured CDS is counterproductive. Studies show override rates for low-specificity alerts can exceed 90%, meaning clinicians stop reading them. Mitigation strategies:

1. **Tiering alerts**: Reserve interruptive (hard stop or modal) alerts for genuinely dangerous situations only. Use passive (non-interruptive) banners for advisory alerts.
2. **Specificity tuning**: Only fire DDI alerts for interactions with clinical significance in the patient's context — don't alert for theoretical interactions.
3. **Mandatory override reason with analytics**: Require a reason when overriding; review the most-overridden alerts quarterly and retune or retire them.
4. **Contextual suppression**: Suppress an alert if the prescriber has already acknowledged it in the same session or in the last N days for a chronic medication.
5. **Pharmacist-facing vs clinician-facing routing**: Route advisory DDI alerts to the dispensing pharmacist rather than interrupting the prescriber.

### NEWS2 — Early Warning Score

**NEWS2** (National Early Warning Score 2) is the standard deterioration detection score used in SA private hospitals and increasingly in public sector ICUs. Automatically calculated from routine vitals in the EMR.

| Parameter | Score 3 | Score 2 | Score 1 | Score 0 | Score 1 | Score 2 | Score 3 |
|-----------|---------|---------|---------|---------|---------|---------|---------|
| Respiration rate | ≤8 | — | 9–11 | 12–20 | — | 21–24 | ≥25 |
| SpO2 (air) | ≤91 | 92–93 | 94–95 | ≥96 | — | — | — |
| Systolic BP | ≤90 | 91–100 | 101–110 | 111–219 | — | — | ≥220 |
| Pulse | ≤40 | — | 41–50 | 51–90 | 91–110 | 111–130 | ≥131 |
| Consciousness | — | — | — | Alert | — | — | CVPU |
| Temperature | ≤35.0 | — | 35.1–36.0 | 36.1–38.0 | 38.1–39.0 | ≥39.1 | — |

Aggregate score triggers: 0–4 low risk (4-hourly monitoring), 5–6 medium risk (escalate to registrar), ≥7 high risk (urgent medical review, consider ICU referral).

CDS implementation: EMR calculates NEWS2 automatically when vitals are documented; triggers a nursing alert for escalation when threshold crossed; sends an HL7 ADT or FHIR notification to the ward manager dashboard.

### Medication Reconciliation

Medication reconciliation — reconciling a patient's medication list across care transitions (admission, transfer, discharge) — is a patient safety priority and a COHSASA (South African hospital accreditation) standard.

CDS support:
- On admission: compare patient-reported medications with dispensing history from medical aid EDI claims or Chronic Illness Benefit (CIB) data.
- On discharge: generate a discharge medication list, flag omissions versus pre-admission medications, generate patient-readable discharge instructions.
- FHIR resource: `MedicationStatement` (patient-reported) vs `MedicationRequest` (prescribed) vs `MedicationDispense` (dispensed).

---

## 4. Telemedicine & Digital Consultations

### Synchronous vs Asynchronous

| Mode | Description | SA Platform Examples | Reimbursement |
|------|-------------|---------------------|---------------|
| **Synchronous — video** | Live video consultation | Dochub, Emed (previously Emed.co.za), Hello Doctor, Healthforce | Most medical aids reimburse at a percentage of the relevant tariff; requires HPCSA-compliant consent |
| **Synchronous — telephonic** | Live audio-only | Same platforms; lower bandwidth requirement | Reimbursed; must document in EMR that it was telephonic |
| **Asynchronous — store-and-forward** | Patient submits photos/history; clinician reviews later | Dermatology AI triage apps; teledermatology platforms | Limited reimbursement — not universally covered |
| **Remote Patient Monitoring (RPM)** | IoT devices transmit continuous data | Glucose monitors, blood pressure cuffs, wearables integrated to EMR | Emerging; medical aid pilots only |

### HPCSA Guidelines on Telemedicine

The HPCSA published telemedicine guidelines in **2014** (Health Professions Act Rule on Telemedicine) and updated guidance in subsequent booklets. Key requirements:

1. **Identity verification**: The practitioner must be reasonably satisfied of the patient's identity before providing advice or prescribing.
2. **Informed consent**: Patient must consent to the telemedicine consultation, understanding the limitations of remote assessment. Consent must be documented in the patient record.
3. **Continuity of care**: Telemedicine does not replace the therapeutic relationship. Practitioners must ensure follow-up can be arranged.
4. **Emergency referral**: If the clinical situation requires in-person assessment or emergency care, the practitioner must refer appropriately and not continue with a remote consultation.
5. **Record-keeping**: The consultation must be documented in an EMR to the same standard as an in-person consultation. Video recordings of consultations are not required but if made, are subject to POPIA.
6. **Cross-border consultations**: HPCSA-registered practitioners may consult patients outside SA via telemedicine, but must comply with the laws of the patient's jurisdiction and their own registration conditions.

### Prescribing via Telemedicine

Under HPCSA guidance and the Medicines and Related Substances Act, a practitioner may prescribe via telemedicine subject to:
- The practitioner has sufficient information to make a diagnosis and the prescription is clinically justified.
- Schedule 5 and 6 (controlled substances) prescriptions via telemedicine are not permitted — in-person assessment required.
- The prescription must meet the same format requirements as any prescription (practitioner details, patient details, BHF practice number, date, generic name, dose, quantity, signature/electronic signature).
- Repeat prescriptions for stable chronic conditions (hypertension, diabetes, asthma) are generally acceptable via telemedicine after an initial in-person baseline.

### Medical Aid Reimbursement for Telemedicine

Reimbursement remains inconsistent across schemes:

| Scheme Tier | Position (2024/25) |
|-------------|-------------------|
| Discovery Health | Covers video and telephonic consultations at tariff rates for GP and specialist; requires provider registration on their telehealth portal |
| Medihelp | Covers telephonic consultations for GPs; video consultations scheme-by-scheme |
| GEMS (Government Employees) | Telephonic covered; video consultation pilot |
| Low-income / hospital plans | Typically excluded from benefit for telemedicine |

Key billing codes used in SA for telemedicine:
- **0190** — Telephonic consultation (NHRPL)
- **0191** — Video consultation (NHRPL) — introduced with 2021 NHRPL updates
- Motivations may be required for first-time telemedicine claims on some schemes.

---

## 5. Health Data Standards

### Diagnostic and Clinical Coding

| Standard | Full Name | Purpose | SA Status |
|---------|-----------|---------|----------|
| **ICD-10** | International Classification of Diseases, 10th Revision | Diagnoses — required on all medical aid claims and death certificates | Mandated — SA uses ICD-10-CM aligned version |
| **NHRPL** | National Health Reference Price List | SA procedure codes for medical aid billing | BHF (Board of Healthcare Funders) publishes annually |
| **CPT** | Current Procedural Terminology (AMA) | US procedure codes — some SA specialists use as reference | Not mandated; NHRPL is SA standard |
| **SNOMED CT** | Systematised Nomenclature of Medicine — Clinical Terms | Rich clinical terminology for EMR coding and CDS | SA is a member country of SNOMED International; adoption in EMRs in progress |
| **LOINC** | Logical Observation Identifiers Names and Codes | Lab test and observation coding | Used in FHIR Observation resources; NHLS adopting for result reporting |
| **NAPPI** | National Pharmaceutical Product Interface | SA drug coding system | Required for dispensing and claims; published by MIMS/Ascent |
| **NDA drug codes** | South African Health Products Regulatory Authority (SAHPRA) | Registered product codes | SAHPRA publishes the Medicine Control Council (MCC) register |

### NAPPI Codes in Detail

NAPPI (National Pharmaceutical Product Interface) codes are the SA standard for identifying medicines in claims and dispensing systems:
- 6-digit numeric code assigned to each registered product-pack combination
- MIMS South Africa is the primary publisher and API provider
- Integration: dispensing systems query NAPPI database for pack size, price benchmark (SEP — Single Exit Price), and generic substitution options
- SEP (Single Exit Price) — the maximum price at which a medicine may be sold at the first point of sale; published by DoH under the Medicines Act; used by medical aids to calculate reimbursement

### ICD-10 SA Implementation Notes

- SA uses ICD-10 aligned with ICD-10-CM (clinical modification).
- All medical aid claims must include a primary ICD-10 code and may include secondary codes.
- Death certificates require ICD-10 coding by the certifying doctor (immediate cause, underlying cause, contributing conditions).
- Common coding errors: using "R" (symptom) codes when a definitive diagnosis is available; using unspecified codes (e.g., J18.9 — pneumonia, unspecified) when a more specific code is justifiable.
- The BHF ICD-10 Coding Guidelines for South Africa are the reference document for SA-specific coding decisions.

---

## 6. Interoperability Architecture in SA

### The NHID Data Architecture

The National Health Insurance Act (18 of 2019) mandates a National Health Information Repository as the data backbone. The architecture being implemented:

```
Patient → Facility EMR/OpenMRS/Elixir
                   ↓
           FHIR API (HL7 FHIR R4)
                   ↓
         HN-PIX (Health Number MPI)
                   ↓
         SHR (Shared Health Record)
                   ↓
         NHID Fund Administration System
                   ↓
         Analytics → DHIS2 → NDoH Dashboards
```

### HN-PIX — Patient Identity Cross-Reference

The **Health Number** system assigns each SA resident a unique health identifier. HN-PIX:
- Uses the SA ID number (13-digit) as the primary matching key where available.
- For undocumented patients: probabilistic matching on surname, first name, date of birth, sex, and facility-assigned MRN.
- IHE PIX (Patient Identity Cross-Reference) profile underlies the technical architecture — a standard used in national health systems globally.
- Challenge: High duplicate rate in public sector due to manual data entry errors; data quality initiatives are a prerequisite for SHR success.

### SHR (Shared Health Record)

The NDoH's SHR is a longitudinal FHIR-based record:
- Stores key clinical events: diagnoses (Condition), medications (MedicationStatement), encounters (Encounter), immunisations (Immunization), lab results (Observation/DiagnosticReport)
- Not designed to replicate the full EMR — it is a summary-level longitudinal record, analogous to the NHS Summary Care Record
- Access control: patient consent-based; practitioners access via their healthcare professional identity (linked to HPCSA registration number)

### OpenHIE Architecture

**OpenHIE** (Open Health Information Exchange) is the open-source reference architecture underpinning many African country HIE implementations, including SA's.

Core components deployed in SA:

| Component | Purpose | SA Implementation |
|-----------|---------|------------------|
| **OpenHIM** | Health Information Mediator — routes, transforms, and audits messages | OpenHIM deployed as national mediator layer |
| **OpenCR** | Client Registry / Master Patient Index | HN-PIX uses OpenCR-based architecture |
| **OpenSHR** | Shared Health Record | SHR prototype built on OpenSHR/HAPI FHIR |
| **Terminology Service** | Centralised code mappings (SNOMED, ICD-10, LOINC) | NDoH terminology server in development |

### DHIS2

**DHIS2** (District Health Information Software 2) is the aggregate health data platform used across the SA public sector and by PEPFAR implementing partners. It is the primary tool for:
- Facility-level monthly reporting (headcount, disease burden, stock levels)
- District and provincial health management dashboards
- TB and HIV programme monitoring (with DATIM — PEPFAR's global data system, which feeds from DHIS2)

DHIS2 is aggregate (not patient-level) — individual patient data lives in OpenMRS/ETR.net/PHCIS and flows to DHIS2 as aggregated statistics via automated reporting jobs or manual capture.

DHIS2 API is REST-based with its own data model (Data Elements, Organisation Units, Data Sets, Periods) — not FHIR-native, though FHIR adapters exist.

### DATIM

**DATIM** (Data for Accountability, Transparency, and Impact Monitoring) is the PEPFAR data system receiving SA HIV programme data. SA's PEPFAR implementing partners (e.g., PEPFAR through USAID, CDC) submit quarterly site-level data to DATIM via DHIS2 APIs. Key indicators: TX_CURR (currently on ART), TX_NEW (newly initiated), HTS_TST (HIV tests done), VL_SUPPRESSED (viral load suppression rate).

---

## 7. Cybersecurity in Healthcare

### POPIA and Health Records

Health information is **special personal information** under **Section 26 of POPIA** (Protection of Personal Information Act 4 of 2013). This is the highest protection category.

Key obligations for responsible parties (hospitals, practices, medical aids):

| Obligation | Requirement |
|-----------|------------|
| **Lawful processing** | Processing health information requires explicit patient consent OR falls within a listed exception (treatment, legal obligation, vital interests) |
| **Purpose limitation** | Health data collected for treatment may not be repurposed for marketing without fresh consent |
| **Access controls** | Role-based access; only treating clinicians and their direct support staff may access a patient's full record |
| **Security safeguards** | Technical and organisational measures appropriate to the sensitivity of health data |
| **Breach notification** | Must notify the Information Regulator within 72 hours of becoming aware of a reportable breach; must notify affected data subjects without undue delay |
| **Retention** | Align with HPCSA guideline: 6 years from last entry (adults); until the patient's 26th birthday (minors) |

The Information Regulator of South Africa enforces POPIA. Fines of up to R10 million or imprisonment are possible for intentional violations.

### Healthcare as Critical Infrastructure

The SA National Cybersecurity Policy Framework classifies health as critical information infrastructure. Practical implications:
- Government health systems are subject to the Cybercrimes Act 19 of 2020 — unauthorised access to patient records is a criminal offence.
- Private hospitals (particularly Netcare, Life Healthcare, Mediclinic) operate SOC (Security Operations Centre) monitoring.
- The CSIRT (Computer Security Incident Response Team) at CSIR handles national-level incidents.

### Ransomware — The Primary Threat to SA Hospitals

SA hospitals are high-value targets because:
- Patient data commands high prices on darknet markets.
- Operational disruption in a hospital creates immediate patient safety risk, increasing willingness to pay ransom.
- Many SA hospitals run legacy systems with unpatched vulnerabilities (end-of-life Windows, unencrypted databases).

Notable SA incidents: Ransomware attacks on Life Healthcare (June 2020) disrupted admissions systems across multiple hospitals for weeks.

Minimum controls for SA hospitals:
1. **Network segmentation**: Clinical systems (EMR, PACS, LIS) on separate VLAN from administrative and guest WiFi.
2. **Immutable backups**: Offline or air-gapped backups tested monthly; recovery time tested quarterly.
3. **Endpoint Detection and Response (EDR)** on all clinical workstations and servers.
4. **Privileged Access Management**: No shared admin accounts; just-in-time access for sysadmins.
5. **Medical device inventory**: All networked medical devices (infusion pumps, ventilators, PACS workstations) included in asset register and patching schedule.

### Medical Device Security

Connected medical devices (CT scanners, PACS workstations, infusion pumps) are a significant attack surface:
- Many run end-of-life operating systems (Windows XP/7) that cannot be patched.
- SAHPRA (formerly MCC) does not currently mandate cybersecurity standards in device registration — this is a gap.
- Mitigation: Isolate medical devices on a dedicated VLAN with no internet access; whitelist inbound/outbound connections only to required clinical systems.

### Cloud Storage of Health Records — Legal Requirements

Cloud storage of health records is permissible in SA subject to:
1. **POPIA compliance**: The cloud provider must be a POPIA-compliant operator with a data processing agreement in place.
2. **Data sovereignty**: There is no explicit SA law prohibiting offshore health data storage, but the Information Regulator has indicated preference for SA-hosted or at minimum SA-jurisdiction data. Practically: use AWS af-south-1 (Cape Town), Azure South Africa North (Johannesburg), or GCP (africa-south1) where available.
3. **HPCSA record-keeping**: Cloud storage is acceptable provided the practitioner retains control and the record is accessible and retrievable within reasonable time.
4. **Medical aid EDI**: Claims data transmitted via Healthbridge or Meddbase is already processed by third-party operators — an established precedent for health data processing agreements.

---

## 8. Digital Health KPIs

### Implementation Metrics

| KPI | Definition | Target (Mature Implementation) | Measurement Frequency |
|-----|-----------|-------------------------------|----------------------|
| **EMR Adoption Rate** | % of clinical encounters documented in the EMR vs total encounters | >95% | Monthly |
| **Electronic Prescribing Rate** | % of prescriptions generated electronically vs total prescriptions | >90% | Monthly |
| **CDS Alert Acceptance Rate** | % of CDS alerts acted upon (not overridden) without justification | 60–80% (lower may indicate alert fatigue) | Monthly |
| **CDS Override Rate with Reason** | % of overridden alerts where a reason was documented | >95% | Monthly |
| **Patient Portal Activation Rate** | % of registered patients who have activated and logged into the patient portal | >30% (Year 1 target) | Monthly |
| **Telemedicine Consultation Volume** | Number of telemedicine consultations per month / as % of total consultations | Trending upward; benchmark: 15–25% of GP consultations | Monthly |
| **Data Completeness Rate** | % of mandatory fields completed on clinical records (critical for claims) | >98% for claims-critical fields | Weekly |
| **Planned Downtime per Month** | Hours of scheduled maintenance downtime | <4 hours/month | Monthly |
| **Unplanned Downtime per Month** | Hours of unplanned system unavailability | <1 hour/month (class A SLA) | Monthly |
| **Time to First Documentation** | Median time from patient arrival to first EMR entry | <15 minutes | Monthly |
| **Lab Result Turnaround in EMR** | Median time from lab result to visibility in EMR | <2 hours for routine; <30 minutes for critical values | Monthly |

### Claims-Related Digital KPIs

| KPI | Definition | Implication of Failure |
|-----|-----------|----------------------|
| **First-pass claim acceptance rate** | % of claims accepted by medical aid on first submission without rejection | Revenue cycle delay, cash flow risk |
| **ICD-10 coding accuracy rate** | % of claims with correct and specific ICD-10 codes | Rejections, fraud risk flagging |
| **NAPPI code match rate** | % of dispensed items with valid NAPPI codes on claim | Drug claim rejections |
| **EDI submission timeliness** | % of claims submitted within 3 months of service (medical aid time limit) | Write-offs |

---

## 9. AI in Healthcare — SA Context

### Diagnostic AI

| Application | Technology | SA Deployment |
|-------------|-----------|--------------|
| **CAD4TB** | Convolutional neural network for TB detection on chest X-ray | Deployed at scale in SA public sector TB screening programmes; USAID/PEPFAR-funded; automated triage of digital CXR at high-volume sites (e.g., Eastern Cape, KZN) |
| **qXR / Qure.ai** | Chest X-ray AI (TB, pneumonia, cardiomegaly, pleural effusion) | Deployed in some SA private radiology groups |
| **IDx-DR equivalent** | Diabetic retinopathy screening from fundus photos | Pilots in SA; not yet at scale |
| **Histopathology AI** | Cervical cancer screening from Pap smear images | Research stage in SA |

### CAD4TB — SA Detail

CAD4TB (Computer-Aided Detection for Tuberculosis) is developed by Delft Imaging (Netherlands) and has been deployed across SA as part of PEPFAR and NDoH TB elimination programmes:
- Uses a deep learning model to score CXR images for TB likelihood on a 0–100 scale.
- Score ≥60 triggers further clinical evaluation (sputum GeneXpert).
- Reduces radiologist workload at high-volume screening sites where TB incidence is high.
- Integrated with portable digital X-ray units deployed in mobile TB screening trucks.
- SA data: studies show sensitivity ~90% and specificity ~75% at threshold 60 — comparable to a general practitioner reading CXR for TB.

### Predictive Models in SA Clinical Settings

| Model Type | Purpose | Implementation Maturity in SA |
|-----------|---------|------------------------------|
| **Sepsis prediction** | Early identification of deteriorating patients using vitals + labs | Pilots in major private hospital groups |
| **30-day readmission prediction** | Identify high-risk patients for post-discharge follow-up | Medscheme/Discovery Value-Based Care programmes |
| **ART adherence prediction** | Predict viral non-suppression in HIV patients | Academic studies; limited routine deployment |
| **ICU deterioration** | Continuous monitoring of ICU patients for early warning | Some SA ICUs with integrated EMR analytics |

### NLP for Clinical Notes

South African clinical notes present specific NLP challenges:
- **Multilingual**: Notes may contain Afrikaans, isiZulu, or Sesotho terms mixed with English and Latin medical abbreviations.
- **Abbreviation-heavy**: SA clinical culture uses heavy abbreviation in notes (e.g., "SOB, LRTI, Rx amox 500 TDS 5/7" — shortness of breath, lower respiratory tract infection, prescribed amoxicillin 500mg three times daily for 5 days).
- **Low-resource languages**: NLP models for clinical Zulu or Xhosa are nascent; English-only NLP will miss clinically significant information in public sector notes.

Use cases in deployment or near-deployment in SA:
- **Automated ICD-10 coding** from discharge summaries (reduces manual coding effort; reduces coding errors).
- **Clinical note summarisation** for handover and referral letter generation.
- **Adverse event extraction** from unstructured notes for pharmacovigilance reporting to SAHPRA.

### HPCSA Position on AI-Assisted Diagnosis

The HPCSA has not (as of 2025) published definitive guidelines specific to AI-assisted diagnosis. The relevant principles from existing ethical guidelines:

1. **Clinical responsibility remains with the registered practitioner**: AI tools are advisory. The clinician who signs off on the diagnosis or treatment plan is liable regardless of what the AI suggested.
2. **Informed consent**: Patients should be informed if AI tools are being used in their diagnosis or treatment planning — consistent with HPCSA informed consent guidelines (Booklet 9).
3. **Transparency**: Practitioners must be able to explain the basis for their clinical decisions; "the AI told me" is not an acceptable defence in a professional conduct hearing.
4. **Validation requirement**: AI tools used in clinical practice should be validated on SA populations — imported AI models trained on US or European data may have reduced accuracy on SA patient populations (different disease prevalence, different demographics).

### Liability in AI-Assisted Healthcare

| Scenario | Liability Position (SA Law) |
|----------|----------------------------|
| Clinician follows AI recommendation that is incorrect | Clinician is liable if the AI recommendation was incorrect and a reasonable clinician would not have followed it |
| Clinician overrides correct AI recommendation | Clinician is liable if their override was unreasonable given available information |
| AI system failure causes patient harm | Potential product liability of vendor (Consumer Protection Act 68 of 2008); hospital/operator liability for failure to maintain system |
| Biased AI model produces worse outcomes for Black patients | Health equity obligation under the National Health Act; potential HPCSA disciplinary matter |

---

## Common Gotchas

1. **FHIR R4 vs R5 confusion**: SA implementations are standardising on R4. Do not design for R5 unless specifically required — interoperability with SA systems (OpenMRS, the SHR) depends on R4 compatibility.

2. **HL7 v2 is not dead**: Do not assume a "FHIR-capable" SA hospital has retired its v2 infrastructure. Most SA hospital integration layers still run HL7 v2 for ADT and lab results. A FHIR facade is likely translating from v2 underneath.

3. **NAPPI vs INN confusion in prescribing**: SA prescribing should use the International Non-proprietary Name (INN/generic name) on prescriptions; NAPPI codes are for dispensing and claims. Do not confuse the two layers.

4. **Medical aid reimbursement is not uniform**: Telemedicine and AI-assisted consult reimbursement rules differ by scheme and benefit option. Always check the specific scheme's provider agreement before assuming coverage.

5. **ICD-10 coding on SA claims must be clinically defensible**: Medical aids audit ICD-10 codes against the clinical record. Upcoding or using symptom codes when a diagnosis is available are the two most common audit triggers.

6. **POPIA breach notification has a 72-hour clock**: Many SA healthcare organisations are unaware the clock starts from when the organisation "becomes aware" — not from when the breach is confirmed. Incident response plans must account for this.

7. **CAD4TB and similar AI tools require local calibration**: AI diagnostic tools trained on global data should be re-validated on SA cohort data before deployment. TB prevalence in SA is dramatically higher than global averages — this affects positive predictive value calculations.

8. **Downtime procedures are regulatory and operational**: HPCSA record-keeping obligations do not pause during EMR downtime. Downtime procedures (paper-based fallback, post-downtime scanning) must be documented in clinical governance frameworks.

9. **The HN / NHID integration timeline is uncertain**: Design EMR integrations to function standalone. Build FHIR APIs as a foundation but do not make the SHR integration a critical dependency in the short term given the uncertain rollout timeline.

---

## See Also

- [Health domain manifest](../SKILL.md)
- [Clinical skills](../clinical/SKILL.md)
- [Clinical governance](../clinical-governance/SKILL.md)
- [Public health](../public-health/SKILL.md)
- HPCSA Guidelines for Good Practice: Booklet 14 (Telemedicine)
- HL7 FHIR R4 specification: https://hl7.org/fhir/R4/
- OpenHIE Architecture: https://ohie.org/framework/
- NDoH NHID Digital Health Framework: https://www.health.gov.za/nhid/
- DHIS2 documentation: https://docs.dhis2.org/
- CAD4TB product information: https://www.delft.care/cad4tb/
- NAPPI/MIMS API: https://www.mims.co.za/
- BHF ICD-10 Coding Guidelines for South Africa (Board of Healthcare Funders)
