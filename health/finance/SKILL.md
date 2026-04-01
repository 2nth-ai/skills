---
name: Healthcare Finance & Revenue Cycle
description: >
  Medical billing, ICD-10 coding, medical aid tariff structures, PMB (Prescribed
  Minimum Benefits), DRGs, revenue cycle management, and healthcare funding models
  in South Africa.
requires: []
improves: []
metadata:
  domain: health
  subdomain: finance
  maturity: stable
---

# Healthcare Finance & Revenue Cycle

This skill covers the full financial and revenue cycle domain for South African healthcare — what a Healthcare Finance Director or Revenue Cycle specialist carries. It is SA-specific throughout. Where international parallels exist they are noted, but the primary reference is the South African medical schemes regulatory environment.

---

## 1. South African Healthcare Funding Landscape

South Africa operates a dual healthcare system: a large public sector funded through general taxation and a private sector funded mainly through medical aid schemes and out-of-pocket payments. Understanding which payer applies to each patient is the first decision in the revenue cycle.

### Funding Sources

| Funding Source | Description | % of Population (approx.) |
|---|---|---|
| Medical Aid Schemes | Private voluntary insurance regulated by Council for Medical Schemes (CMS) under the Medical Schemes Act 131 of 1998 | ~16% |
| Out-of-Pocket (OOP) | Direct patient payment — specialists, GPs, private hospitals for uninsured | ~20–25% |
| Employer Self-Insurance | Large employers bear medical costs directly; often administered by a TPA (Third Party Administrator) | Minority of employers |
| Road Accident Fund (RAF) | No-fault insurer for road accident victims; covers medical costs, loss of income, general damages | Incident-based |
| COID / COIDA | Compensation for Occupational Injuries and Diseases Act 130 of 1993; covers work-related injury/illness. Administered by the Compensation Fund (DoL). | Incident-based |
| Department of Health (DoH) | Public sector: district hospitals, regional hospitals, tertiary/academic hospitals, community health centres funded by national + provincial budgets | ~84% of population |
| NHI (National Health Insurance) | Pending universal coverage reform | See below |

### Road Accident Fund (RAF) — Revenue Cycle Implications

RAF claims are handled under the Road Accident Fund Act 56 of 1996. Key points:

- Provider submits a Form RAF4 (medical report) and itemised account.
- RAF pays the lower of actual cost or the applicable tariff (NHRPL / agreed rates).
- Claims have a three-year prescription period from date of accident.
- RAF is notoriously slow to settle — accounts receivable (AR) for RAF claims commonly exceed 180 days. Budget bad debt accordingly.
- Emergency treatment cannot be refused on the basis of RAF funding uncertainty.

### COID / COIDA — Revenue Cycle Implications

- Employer must report injury/disease to the Compensation Fund.
- Provider submits WCL2 (first medical report) and WCL4 (progress/final).
- The Compensation Commissioner sets tariffs — currently below NHRPL in most categories.
- Providers can apply for higher tariff approval for complex cases.
- Turnaround from the Compensation Fund is often 90–180+ days. Many providers collect from patient and submit for reimbursement.

### National Health Insurance (NHI) — Current Status

The NHI Act 20 of 2023 was signed into law on 15 May 2024. As at Q1 2026:

- The NHI Fund is not yet operational.
- No benefit schedule or accreditation framework has been gazetted.
- Constitutional court challenges are in progress (Medical Association of SA, SAPPF, others).
- Practical implementation is estimated at 5–10 years away.
- Providers should monitor NHI developments but need not restructure revenue cycle processes yet.
- Key future implication: NHI will be the single purchaser. Medical aid schemes' role will be limited to top-up cover for services not in the NHI benefit package.

---

## 2. Medical Aid Tariff Structures

### Background: From Schedule 2 to NHRPL to NHCF

| Era | Reference | Status |
|---|---|---|
| Pre-2004 | Schedule 2 — Rand Mutual/MASA fee schedule; legally binding | Repealed |
| 2004–2010 | NHRPL (National Health Reference Price List) — published by DoH as a "reference" | No legal force; used as benchmark |
| 2010 onwards | NHCF (National Health Care Fee) — industry self-regulation; published by BHF | Benchmark only |
| Post-2010 | Scheme-specific tariff negotiations between providers and schemes | Contractual |

There is currently no legally binding national tariff. Schemes and providers negotiate bilaterally. The NHCF (formerly NHRPL) serves as a common reference denominator — often expressed as "X% of NHRPL/NHCF".

### NHCF Tariff Mechanics

NHCF codes map to three charge categories:

1. **Consultation codes** (e.g., 0190 — GP consultation)
2. **Procedure codes** (e.g., 4420 — appendectomy)
3. **Anaesthesiology codes** (time + base units × conversion factor)

Anaesthesiology billing formula:

```
Total Units = Base Units (procedure complexity) + Time Units (15 min intervals) + Qualifying Circumstance Units
Rand Value = Total Units × Conversion Factor (CF)
```

The CF is scheme-specific and negotiated annually. In 2025, the BHF published CF of approximately R26.00 per unit; schemes typically pay 80–100% of this.

### Scheme Types

| Type | Description | Tariff Flexibility |
|---|---|---|
| Open Scheme | Any eligible person may join (e.g., Discovery Health, Bonitas, Momentum Health) | Negotiate with all providers |
| Closed Scheme | Restricted to employees of a specific employer/industry (e.g., GEMS — government employees) | May impose designated networks |
| Restricted Scheme | Hybrid — restricted but can open to dependants | Similar to closed |

### Network Providers and Co-payments

Schemes construct Designated Service Provider (DSP) networks. Choosing a DSP:

- PMB conditions: zero co-payment at DSP, up to 20% co-payment at non-DSP (some schemes impose 100% co-payment for non-DSP elective).
- Non-PMB conditions: scheme rules apply; co-payments common at non-network providers.

### Benefit Options

| Option | Hospital Cover | Day-to-day | Typical Annual Premium |
|---|---|---|---|
| Hospital Plan | Private ward, ICU; no day-to-day | None | Lowest |
| Essential/Core | Hospital + some chronic | Minimal | Mid |
| Comprehensive | Hospital + day-to-day + savings | Full | Highest |

Sub-limits are common: e.g., R5,000/year for physiotherapy, R2,500/year for dentistry. Providers must check benefit limits before treatment to avoid non-payment.

### Key Billing Modifiers

- **Modifier 0009** — after-hours consultation (adds premium).
- **Modifier 0014** — assisted surgery.
- **Modifier 0021** — bilateral procedure (schemes often pay 150%, not 200%).
- **Same-day surgery rules** — some codes cannot be claimed together on the same date; bundling edits apply.

---

## 3. Prescribed Minimum Benefits (PMBs)

PMBs are defined in the Medical Schemes Act s29(1) and detailed in Regulations 8–9. Every open and restricted medical scheme must cover PMBs in full — at cost, at a DSP.

### The 270 PMB Conditions

PMBs consist of:

- **26 chronic conditions** (the Chronic Disease List / CDL) — e.g., diabetes mellitus, hypertension, epilepsy, HIV/AIDS, asthma.
- **270 Diagnosis Treatment Pairs (DTPs)** — emergency and non-emergency conditions paired with their treatment pathway.

Common DTPs include: acute appendicitis + appendectomy, acute MI + angioplasty/thrombolysis, major depressive episode + specified pharmacotherapy and psychotherapy.

### "At Cost" — What It Means in Practice

"At cost" does not mean whatever the provider charges. It means:

> The scheme must fund the cost of the treatment as determined by the designated service provider's cost — but if no DSP arrangement exists, the scheme funds at its own tariff.

In practice:
- At DSP: scheme pays provider's contracted rate; member pays nothing.
- At non-DSP: scheme pays its own benefit rate; provider may charge more; member pays the difference (co-payment) — **but only if the member chose non-DSP electively**. If no DSP exists in the area for that condition, the scheme must fund at cost regardless.

### DSP Rules and Disputes

The scheme must publish its DSP network. If a member requires emergency care and no DSP is available:

- The scheme cannot impose a co-payment for PMB treatment.
- The provider should document the lack of DSP availability.

PMB dispute resolution path:

1. Query to scheme (must respond within 30 days).
2. Complaint to the Council for Medical Schemes (CMS) — adjudicated by the Registrar.
3. CMS Disputes Committee hearing.
4. Appeal to the Appeal Board (quasi-judicial).
5. High Court (judicial review).

### Common PMB Denial Traps

| Error | Consequence |
|---|---|
| ICD-10 code not mapping to a DTP | Claim treated as non-PMB; co-payment imposed |
| Wrong CDL chronic condition code | Claim falls outside CDL benefit; rejected or co-payment |
| Provider not recognised by scheme even when PMB | Scheme stalls claim; provider must escalate to CMS |
| Treatment exceeds DTP protocol | Scheme funds only protocol-compliant portion |

### PMB for Mental Health

Regulation 15H specifies mental health PMBs: acute psychiatric emergencies, severe depression, schizophrenia. Historically under-funded relative to physical health PMBs; CMS has issued guidance requiring parity.

---

## 4. ICD-10 Coding

South Africa adopted ICD-10 (10th revision of the International Classification of Diseases, WHO) in 2005. Schemes require ICD-10 codes on all claims. ICD-11 is not yet adopted.

### ICD-10 Structure

```
Chapter (e.g., Chapter IX: Diseases of the Circulatory System)
  Block (e.g., I20–I25: Ischaemic Heart Diseases)
    Category (e.g., I21: Acute Myocardial Infarction)
      Code (e.g., I21.0: Anterior wall STEMI)
        Extension code (e.g., dagger/asterisk codes for dual coding)
```

### Principal vs Secondary Diagnosis

| Code Position | Definition |
|---|---|
| Principal diagnosis | The condition established after study to be chiefly responsible for the admission. NOT necessarily the presenting complaint. |
| Secondary diagnosis | Comorbidities or complications that affect care, length of stay, or resource consumption. |
| External cause code | Supplementary code (V, W, X, Y chapters) — required for injuries, poisonings (e.g., V89.2 — motor vehicle accident). |

Coding rules in SA follow WHO ICD-10 Volume 2 plus National Department of Health coding guidelines (the "Blue Book" — Guidelines for ICD-10 Coding in South Africa).

### Procedure Coding in South Africa

Unlike the US (which uses CPT codes), South Africa uses NHRPL/NHCF procedure codes. These are alphanumeric codes published in the BHF tariff list. Key characteristics:

- Codes are 4–5 digits (e.g., procedure code 4420 = appendectomy; 0190 = GP consultation).
- ICD-10 diagnosis codes are paired with procedure codes on the claim.
- Some schemes additionally accept SNOMED CT procedure codes for clinical systems integration.
- Theatre procedure codes must match the anaesthetic code complexity; mismatches trigger claim queries.

### Coding Accuracy and Reimbursement Impact

| Coding Error | Revenue Impact |
|---|---|
| Unspecified code (e.g., I21.9 instead of I21.0) | Potential DRG downcode; lower reimbursement |
| Missing secondary diagnosis (comorbidity) | Lower DRG weight; underpayment |
| Wrong external cause code | PMB determination fails for accident cases |
| Procedure code not matching diagnosis | Claim rejected; rework cost |

### Upcoding — Legal Consequences

Upcoding is billing a higher-complexity code than the documented clinical condition warrants. In South Africa:

- It is fraud under the Medical Schemes Act s66.
- The Health Professions Council of South Africa (HPCSA) can impose professional sanctions.
- The CMS can refer matters to the NPA (National Prosecuting Authority).
- Penalties include repayment of all claims, fines, and deregistration.

Coding audits by schemes (and internal clinical coding audits) are essential controls. Target: zero intentional upcoding; coding queries resolved through clinical documentation, not code changes.

---

## 5. Diagnosis-Related Groups (DRGs)

### What DRGs Do

A DRG classifies an inpatient episode into a payment group based on:

- Principal diagnosis (ICD-10)
- Procedures performed (procedure codes)
- Comorbidities / complications (secondary diagnoses)
- Age, sex, discharge status

Each DRG has a relative weight. The hospital's payment = DRG weight × base rate (negotiated per scheme).

### SA DRG Implementation

South Africa has not legislatively mandated DRGs, but private hospital groups and major open schemes have adopted them bilaterally. The dominant classification system used in SA private sector is:

- **AR-DRG** (Australian Refined DRG) — Version 9.0+ adapted for SA case mix. Used by Network Healthcare Holdings, Mediclinic, Life Healthcare in scheme negotiations.
- **DHPSA** (formerly Dental and Hospital Plans of South Africa) has been involved in SA DRG standards work.

Public sector: The DoH's UPFS (Uniform Patient Fee Schedule) operates as a cost-recovery mechanism, not a true DRG system, though DRG pilots have been run in academic hospitals.

### DRG Payment Flow

```
Admission → Coding (ICD-10 + procedures) → DRG Grouper Software
         → DRG assigned → DRG weight retrieved → Payment calculated
         → Outlier adjustment (if applicable)
```

Outlier adjustments: If length of stay (LOS) exceeds the DRG trim point by a threshold, the scheme pays a per-diem supplement for outlier days. Short-stay cases may be paid a day-fraction.

### Case Mix Index (CMI)

```
CMI = Sum of DRG weights for all cases / Number of cases
```

CMI measures the average clinical complexity of a hospital's patient population. A higher CMI indicates more resource-intensive patients.

- CMI is used in scheme negotiations to justify higher base rates.
- Monitor CMI month-on-month; a sudden drop often indicates a coding quality problem, not a real change in patient mix.
- Target: CMI should track with the hospital's clinical profile (e.g., an academic hospital should have CMI > 1.5; a day clinic < 1.0).

### DRG Optimisation — Legitimate Documentation Improvement

| Action | Impact |
|---|---|
| Capture all comorbidities (secondary diagnoses) | Assigns to higher-weight DRG (CC/MCC splits) |
| Specify principal diagnosis correctly | Correct MDC (Major Diagnostic Category) assignment |
| Document procedures with full detail | Procedure-based DRG vs medical DRG split |
| Specify discharge status (died, transferred, home) | Affects outlier and special payment rules |

DRG optimisation is legitimate when it improves documentation accuracy. It becomes fraud when documentation is fabricated. Clinical documentation improvement (CDI) programmes should be physician-led.

---

## 6. Revenue Cycle Management

The revenue cycle is the sequence from patient registration to cash collected. Every step is a potential revenue leak.

### Revenue Cycle Stages

```
1. Patient Registration & Eligibility Verification
        ↓
2. Pre-authorisation (Pre-auth)
        ↓
3. Admission & Clinical Documentation
        ↓
4. Concurrent Review (for extended admissions)
        ↓
5. Coding (ICD-10 + procedure codes)
        ↓
6. Claim Preparation & Scrubbing
        ↓
7. Claim Submission (EDI or paper)
        ↓
8. Adjudication by Scheme
        ↓
9. Payment / Remittance Advice
        ↓
10. Denial Management & Appeals
        ↓
11. Patient Statement & Collections (gap amounts)
        ↓
12. Write-off Governance
```

### Stage 1: Registration and Eligibility

- Verify membership number, option, and benefit year.
- Check benefit utilisation (sub-limits, annual limits): has the patient's physiotherapy benefit already been exhausted?
- Confirm principal member vs dependant status.
- Verify scheme against hospital's contracted list — is there a network agreement?

Tools: Real-time eligibility verification via SwitchConnect (Healthbridge, Mededi, Rx Systems) — most large SA hospitals have EDI integration with major schemes.

### Stage 2: Pre-authorisation (Pre-auth)

Pre-auth is the single largest revenue leak point in SA private healthcare. Without it:

- The scheme can legally reject the entire claim on non-PMB conditions.
- Even for PMBs, documentation of the pre-auth attempt is required.

Pre-auth best practice:

| Rule | Detail |
|---|---|
| Elective admissions | Pre-auth minimum 48 hours before admission |
| Emergency admissions | Telephonic pre-auth within 24 hours of admission |
| Document pre-auth reference number | On the patient file and the claim |
| Obtain authorised bed days | Authorised days ≠ actual days; request extension before expiry |
| Procedure-specific auth | Some schemes require separate auth for each procedure (ICU, theatre, physiotherapy) |

Pre-auth failure rate target: < 2% of admissions.

### Stage 3–4: Clinical Documentation and Concurrent Review

Concurrent review: for admissions > 4–5 days, schemes send a case manager who reviews clinical necessity. The scheme may recommend early discharge. The clinician must document clinical justification for continued stay.

Revenue protection: Ensure treating physician completes progress notes daily. Absence of documentation = scheme will not authorise additional days.

### Stage 5: Coding

See Section 4. Coding must be completed within 24–48 hours of discharge for timely claim submission. Coding backlogs directly inflate days in AR.

### Stage 6: Claim Scrubbing

Before submission, claims pass through a scrubber (automated rules engine) that checks:

- ICD-10 code validity and age/sex appropriateness.
- Procedure code compatibility (bundling edits — can these two codes be billed together?).
- Duplicate claim detection.
- Modifier requirements (e.g., bilateral modifier applied?).
- Pre-auth reference number present.

Clean claim rate target: > 95% of claims pass scrubbing on first submission.

### Stage 7: Submission

- **EDI (Electronic Data Interchange)**: dominant in SA private sector. Standards: EDIFACT or HL7 FHIR-based claim messages via switches (Healthbridge, etc.).
- **Paper**: still used for smaller practices and some public sector; high error rate and slow turnaround.

Submission timing: target within 3 business days of discharge. Most schemes impose a 6-month claim submission deadline; after that, the claim may be rejected as "out of time."

### Stage 8: Adjudication

The scheme's adjudication engine processes the claim. Possible outcomes:

| Outcome | Description |
|---|---|
| Approved and paid | Claim accepted at submitted or tariff amount |
| Approved at lower amount | Tariff reduction applied; co-payment to member |
| Pended | Awaiting additional information (clinical motivation, pre-auth, duplicate check) |
| Denied | Rejected; reason code provided |
| Partial payment | Some line items approved; others denied |

Adjudication turnaround: Medical Schemes Act requires schemes to process claims within 30 days of receipt. Track receipt-to-payment against this benchmark.

### Stage 9: Payment and Remittance

Remittance advice (RA) must be matched to the original claim. Unmatched RAs create phantom credits and understate AR. Automated remittance posting is essential for volumes > 500 claims/month.

### Days in Accounts Receivable (AR)

```
Days in AR = (Total AR Balance / Annual Revenue) × 365
```

Or more precisely:

```
Days in AR = Total AR / (Revenue last 90 days / 90)
```

Benchmark:
- Private hospital (medical aid): < 45 days
- Private specialist practice: < 35 days
- RAF claims: budget separately; 120–180 days common
- COID claims: budget separately; 90–150 days common

AR aging buckets: 0–30, 31–60, 61–90, 91–120, 121–180, 180+ days. Any claim > 90 days needs active follow-up; > 180 days is impairment risk.

---

## 7. Denial Management

### Top Denial Reasons in SA Private Healthcare

| Rank | Denial Reason | Frequency |
|---|---|---|
| 1 | No pre-authorisation obtained | ~28% of denials |
| 2 | Incorrect or invalid ICD-10 code | ~18% |
| 3 | Benefit exhausted / sub-limit reached | ~14% |
| 4 | Duplicate claim submission | ~10% |
| 5 | Not a PMB condition (or code doesn't map to DTP) | ~9% |
| 6 | Out-of-network / non-DSP provider | ~8% |
| 7 | Service not covered under the option | ~7% |
| 8 | Missing clinical motivation | ~6% |

### Denial Rate Benchmark

```
Denial Rate = (Number of denied claims / Total claims submitted) × 100
```

Target: < 5% overall denial rate. Denial rates > 10% indicate systemic revenue cycle failure requiring process review.

### Denial Workflow

```
Denial received → Reason code categorised → Assignable to (1) coding, (2) pre-auth, (3) clinical, (4) admin
                → Correctable? → Yes: rework and resubmit
                                → No: appeal or write-off
```

Resubmission window: Schemes typically allow 90 days from original denial to resubmit a corrected claim. Track this deadline rigorously.

### Appeals

Appeal levels:

1. **Internal scheme appeal** — submit written appeal with supporting documentation (clinical motivation letter from treating physician, ICD-10 mapping justification, pre-auth records).
2. **CMS Complaint** — if internal appeal fails. CMS has jurisdiction over scheme conduct.
3. **Appeal Board** — formal quasi-judicial hearing for significant amounts.

Appeal success rates: A well-documented appeal for a PMB denial should succeed > 70% of the time. Poorly documented appeals succeed < 30%.

Key appeal documents:

- Clinical motivation letter (physician signature required).
- Proof of pre-auth attempt or emergency circumstances.
- ICD-10 to DTP mapping table (for PMB disputes).
- Itemised account matching the claim.

### Write-off Governance

Write-offs must not be at individual coder or billing clerk discretion. Governance framework:

| Write-off Amount | Approval Level |
|---|---|
| < R500 | Billing supervisor |
| R500 – R5,000 | Revenue Cycle Manager |
| R5,000 – R50,000 | CFO / Finance Director |
| > R50,000 | Board / Audit Committee |

Write-off reasons must be coded (expired, clinical error, commercial decision, PMB dispute settled). Monthly write-off report to Finance Director is a minimum control.

Bad debt provision: IFRS 9 expected credit loss (ECL) model applies. Provision rates by payer and aging bucket should be set annually based on historical collection data.

---

## 8. Financial KPIs for Healthcare

### Operating KPIs

| KPI | Formula | Benchmark |
|---|---|---|
| Revenue per Bed Day | Net patient revenue / Total inpatient bed days | Varies by facility type; track trend |
| Cost per Patient Day (CPPD) | Total operating costs / Total inpatient bed days | Private hospital R8,000–R20,000+ (2025) |
| Occupancy Rate | Occupied bed days / Available bed days × 100 | Target > 65% for breakeven; > 75% for profitability |
| Occupancy Breakeven | Fixed costs / (Revenue per bed day − Variable cost per bed day) | Site-specific calculation |
| Theatre Utilisation | Actual theatre hours used / Available theatre hours × 100 | Target > 70% |
| Theatre Cost per Case | Total theatre costs / Number of theatre cases | Benchmark against procedure mix |

### Revenue Cycle KPIs

| KPI | Formula | Benchmark |
|---|---|---|
| Clean Claim Rate | Claims passing scrubber first time / Total claims × 100 | > 95% |
| Denial Rate | Denied claims / Total submitted claims × 100 | < 5% |
| Days in AR | See Section 6 | < 45 days (medical aid) |
| Collection Rate | Cash collected / Net collectible revenue × 100 | > 96% |
| Bad Debt Rate | Bad debt write-offs / Gross revenue × 100 | < 2% (private) |
| Pre-auth Failure Rate | Failed pre-auths / Total admissions × 100 | < 2% |
| Appeal Success Rate | Successful appeals / Total appeals × 100 | > 60% |
| Cost to Collect | Revenue cycle operating costs / Net collections × 100 | < 3% |

### Service Line Financial KPIs

| KPI | Description |
|---|---|
| Contribution Margin by Service Line | (Revenue − Variable costs) / Revenue × 100 per service line (theatre, ICU, emergency, maternity, etc.) |
| Pharmacy Spend as % of Revenue | Total pharmacy costs / Net patient revenue × 100; benchmark < 12% for acute care |
| Implant / Prosthesis Cost per Case | Track separately; high-cost items require cost-benefit visibility |
| Length of Stay (LOS) vs DRG Expected | Actual LOS / DRG expected LOS; ratio > 1.0 signals outlier risk |

### Contribution Margin Formula

```
Contribution Margin (Rand) = Net Revenue − Variable Costs
Contribution Margin % = Contribution Margin / Net Revenue × 100
```

Variable costs include: consumables, pharmacy, linen, theatre gases, per-diem nursing supplements for high-census periods.

Fixed costs include: base nursing staff, depreciation, rent/facilities, management.

A service line with positive contribution margin covers its variable costs and contributes to fixed cost absorption. Negative contribution margin service lines should be reviewed clinically before financial closure decisions.

### Breakeven Occupancy

```
Breakeven Occupancy % = Fixed Costs / ((Revenue per Bed Day − Variable Cost per Bed Day) × Available Bed Days) × 100
```

Example: A 100-bed facility with fixed costs of R15M/month, revenue per bed day R12,000, variable cost per bed day R4,000:

```
Contribution per bed day = R12,000 − R4,000 = R8,000
Available bed days/month = 100 × 30 = 3,000
Breakeven = R15,000,000 / (R8,000 × 3,000) = 62.5%
```

The facility breaks even at 62.5% occupancy; below this it loses money.

---

## 9. Public Sector Healthcare Finance

### Budget Framework: MTEF

South Africa's public sector operates on the Medium Term Expenditure Framework (MTEF) — a rolling three-year budget cycle. National Treasury issues the MTEF in February each year as part of the national budget. Provincial health departments receive their allocations and must plan three years out.

Key instruments:

| Instrument | Purpose |
|---|---|
| MTEF | Three-year rolling expenditure envelope per department |
| Estimates of National Expenditure (ENE) | Detailed annual budget tables per programme |
| Estimates of Provincial Revenue and Expenditure (EPRE) | Provincial equivalent |
| Adjusted Estimates (AENE) | Mid-year adjustments; tabled in October |

### Department of Health Budget Structure (Programmes 1–7)

The national Department of Health budget is structured in seven programmes:

| Programme | Name | Key Activities |
|---|---|---|
| 1 | Administration | DoH management, governance |
| 2 | National Health Insurance | NHI fund development, district health management grants |
| 3 | Communicable and Non-Communicable Diseases | HIV/AIDS, TB, malaria, mental health, NCD programmes |
| 4 | Primary Health Care | PHC, immunisation, school health, environmental health |
| 5 | Hospital Systems | Tertiary/academic hospital grants, revitalisation |
| 6 | Health Regulation and Compliance Management | MCC/SAHPRA, CMS oversight, emergency services |
| 7 | Human Resources | Health workforce, training, bursaries |

Provincial health departments mirror this structure but with different programme numbering depending on the province's MTEF presentation.

### Conditional Grants

Conditional grants are transfers from national government to provinces with conditions attached. Provinces cannot use them for other purposes.

| Grant | Purpose | Administered By |
|---|---|---|
| Health Facility Revitalisation Grant (HFRG) | Capital: new builds, refurbishments, medical equipment | DoH / Treasury |
| National Health Insurance Indirect Grant | NHI implementation support, ideal clinic programme | DoH |
| HIV, TB, Malaria and Community Outreach Grant | ARVs, TB treatment, VMMC, community health workers | DoH |
| Health Professions Training and Development Grant | Training of health professionals at academic hospitals | DoH |
| Comprehensive HIV and AIDS Grant (direct) | Large HIV/AIDS programme spend; largest health conditional grant | DoH |

Grant conditions include spending milestones, reporting requirements, and business case approval for capital projects. Under-spending on conditional grants triggers rollback (funds returned to National Treasury); over-spending is not permitted.

### Equitable Share Formula

The equitable share is the constitutionally mandated transfer to provinces for funding provincial services. The health component uses a formula weighted by:

- Population size.
- Poverty index (share of population below poverty line).
- Age structure (elderly and child populations are more resource-intensive).
- Current health service backlogs.

Provincial health departments receive the bulk of their funding through the equitable share, not conditional grants. The equitable share is unconditional — provinces have fiscal autonomy in allocation within their envelopes, subject to the MTEF.

### Programme-Based Budgeting (PBB)

PBB links budget allocations to programme outputs and outcomes. In health:

- Inputs: Rand allocation per programme.
- Outputs: Number of patients treated, immunisations administered, ARV patients on treatment.
- Outcomes: Under-5 mortality rate, TB cure rate, maternal mortality ratio.

Performance is measured via the Annual Performance Plan (APP) and reported quarterly to the relevant portfolio committee. Poor performance on outputs can trigger conditional grant clawbacks or MEC interventions.

### Uniform Patient Fee Schedule (UPFS)

Public sector facilities charge patients who can afford to pay using the UPFS. Patients are means-tested (means test income thresholds are updated annually). UPFS categories:

| Category | Description |
|---|---|
| Category H | Free care — patients who cannot afford to pay |
| Category A–F | Graduated fees based on income; Category F = full fees (not state-subsidised) |

UPFS revenue collected at provincial hospitals is paid into the provincial revenue fund. It does not stay with the facility — a disincentive for aggressive collection in the public sector.

### Key Public Sector Finance Risks

| Risk | Mitigation |
|---|---|
| Underspending on conditional grants | Monthly expenditure tracking; grant management officer designated |
| Irregular expenditure (PFMA s1) | Supply chain compliance; pre-approval for deviations |
| Unauthorised expenditure | Budget control reports; early warning at 80% of vote used |
| Accruals and payables to suppliers | Prompt Payment Act (30 days); accruals breach PFMA if not budgeted |
| Fruitless and wasteful expenditure | Consequence management; disciplinary process per PFMA s38 |

The Public Finance Management Act (PFMA) 1 of 1999 is the primary governance instrument for public sector finance. The Accounting Officer (Director-General or HOD) bears personal liability for PFMA breaches.

---

## Quick Reference: South African Healthcare Finance Regulatory Landscape

| Legislation / Instrument | Relevance |
|---|---|
| Medical Schemes Act 131 of 1998 | Medical aid schemes, PMBs, scheme registration, CMS |
| Medical Schemes Act Regulations | PMB conditions, benefit definitions, CMS powers |
| NHRPL / NHCF (BHF) | Reference tariff; not legally binding |
| ICD-10 (SA adaptation) | DoH Blue Book: SA coding guidelines |
| HPCSA Rules | Professional conduct; coding fraud |
| Road Accident Fund Act 56 of 1996 | RAF claims |
| COIDA 130 of 1993 | Compensation Fund claims |
| NHI Act 20 of 2023 | Future single-payer; not yet operational |
| PFMA 1 of 1999 | Public sector financial management |
| MFMA 56 of 2003 | Municipal health services financial management |
| UPFS (DoH) | Public sector patient fee schedule |

---

## Common Pitfalls — Healthcare Finance Director Checklist

- [ ] Pre-auth process is documented, owned, and KPI-tracked (failure rate < 2%).
- [ ] ICD-10 coding is done by trained coders, not by billing clerks retrospectively.
- [ ] RAF and COID AR is budgeted separately with appropriate bad debt provisions.
- [ ] PMB disputes have a documented escalation path to CMS.
- [ ] Write-off governance framework exists with tiered approval levels.
- [ ] Monthly denial rate and AR aging reports go to CFO / Finance Director.
- [ ] CMI is tracked monthly; drops trigger coding quality investigation.
- [ ] Conditional grants have designated grant managers and monthly expenditure reports.
- [ ] PFMA compliance controls are in place: irregular, unauthorised, and fruitless expenditure registers maintained.
- [ ] NHI developments are monitored; scenario planning for single-payer impact exists.
