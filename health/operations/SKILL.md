---
name: Healthcare Operations
description: >
  Facility operations, bed management, capacity planning, staffing models,
  patient flow optimisation, and operational KPIs for healthcare organisations.
requires: []
improves: []
metadata:
  domain: health
  subdomain: operations
  maturity: stable
---

# Healthcare Operations

This skill carries the operational knowledge of a senior Healthcare Operations Manager — the person responsible for keeping the facility running safely, efficiently, and sustainably. It covers bed management, capacity planning, staffing, theatre scheduling, outpatient throughput, supply chain, and the South African regulatory and infrastructure context.

---

## 1. Patient Flow & Bed Management

Patient flow is the single biggest lever in healthcare operations. Poor flow manifests as ED overcrowding, surgical delays, staff burnout, and preventable deterioration. Every other operational problem is downstream of it.

### Occupancy Targets

| Ward Type | Target Occupancy | Rationale |
|-----------|-----------------|-----------|
| General medical/surgical ward | 82–85% | Headroom for surges; <80% signals inefficiency, >90% signals unsafe staffing load |
| ICU / High care | 70–75% | Must maintain reserve capacity for unplanned admissions |
| Maternity | 75–80% | Unpredictable demand curve; buffer required |
| Paediatrics | 70–80% | Seasonal peaks (winter respiratory) require buffer |
| Rehabilitation | 85–90% | More predictable, planned admissions; higher tolerable occupancy |
| Private hospital facility-wide | 65–75% | Lower than public; elective mix is more schedulable |

Occupancy above 92% consistently predicts adverse events, increased LOS, and staff errors. If any general ward exceeds this for more than 48 consecutive hours, escalate to amber capacity level.

### Bed Turnaround Time

Bed turnaround time = the interval from a patient leaving a bed to the next patient occupying it. This includes:
1. Notification to housekeeping
2. Physical cleaning and linen change (standard: 20–30 min)
3. Inspection and sign-off
4. Bed allocation by admissions or bed manager

**Target**: <45 minutes for standard beds; <90 minutes for isolation rooms requiring terminal clean.

Failures in turnaround are almost always process failures, not capacity failures — track the breakdown by step to find the bottleneck.

### Discharge Planning

Discharge planning should start at admission. The biggest driver of delayed discharges is social and systemic, not clinical.

| Cause of Delayed Discharge | Intervention |
|---------------------------|-------------|
| Awaiting specialist review | Embed consultants on ward rounds at defined times; do not wait for them to appear |
| Awaiting transport | Book transport morning before, not on the day |
| Awaiting pharmacy (TTO — to take out medication) | Initiate TTO request 4 hours before expected discharge |
| Family/carer not arranged | Social work referral within 24 hours of admission for vulnerable patients |
| Post-acute placement (step-down, frail care) | Bed manager to maintain relationships with step-down facilities; pre-register patient within 24 hours of admission |
| Awaiting final bloods/imaging result | Proactive escalation by ward nurse at 09:00 daily for any pending result blocking discharge |

**Discharge Rounds**: At least one formal discharge round daily (08:00–10:00 is the optimal window). Identify patients likely to be discharged that day; flag blockers; assign an owner to each blocker with a resolution time.

**Same-day discharge targets**: elective surgical patients should have a defined discharge time at pre-admission. If the patient is not discharged by 14:00, a nurse must review and escalate.

### ED to Inpatient Flow (Bottleneck Analysis)

The ED-to-ward pathway is the most common chokepoint in acute facilities.

```
[ED Triage] → [ED Assessment & Treatment] → [Admission Decision] → [Bed Request]
    → [Bed Assignment] → [Patient Transfer] → [Ward Acceptance]
```

Each handoff is a potential delay. Measure each step:

| Step | Acceptable Duration | Common Failure Mode |
|------|--------------------|--------------------|
| Triage to first doctor contact | <30 min (ESI 2), <60 min (ESI 3) | Nurse-to-doctor handoff not standardised |
| Admission decision to bed request | <30 min | Registrar delays; consultant not available |
| Bed request to bed assigned | <60 min | No available beds; bed manager not resourced |
| Bed assigned to patient in ward bed | <30 min | Transport unavailable; ward not ready |

Total acceptable time from admission decision to ward bed: **<2 hours** for stable patients, **<4 hours** for the facility-wide benchmark.

**Boarding**: when patients occupy ED beds while waiting for inpatient beds. Boarding >2 hours should trigger a bed manager intervention. Boarding >4 hours requires a capacity escalation review.

### Length of Stay (LOS) Management

ALOS (Average Length of Stay) benchmarks vary significantly by ward type, payer mix, and case complexity. Use Diagnosis Related Group (DRG) benchmarks rather than global ALOS for meaningful comparison.

| Ward / Case Category | Public Sector ALOS (SA) | Private Sector ALOS (SA) |
|---------------------|------------------------|-------------------------|
| General medical (non-surgical) | 5–7 days | 3–5 days |
| General surgery | 4–6 days | 2–4 days |
| Orthopaedics (elective) | 5–8 days | 3–5 days |
| Orthopaedics (trauma) | 8–14 days | 5–10 days |
| ICU | 4–7 days | 3–6 days |
| Maternity (normal delivery) | 2–3 days | 1–2 days |
| Maternity (C-section) | 4–5 days | 3–4 days |
| Paediatrics (respiratory) | 3–5 days | 2–4 days |
| Stroke | 10–14 days | 7–10 days |

**LOS outliers** (>1.5× expected) should trigger review: is this a clinical complexity issue, a discharge barrier, or a process failure?

```
LOS Index = Observed ALOS ÷ Expected ALOS (DRG-adjusted)
```
A LOS Index >1.2 for any DRG grouping requires a root-cause review.

---

## 2. Capacity Planning

### Demand Forecasting

Healthcare demand is not random — it is seasonal, day-of-week dependent, and event-driven. Building a 12-month demand forecast requires at least 3 years of historical data.

**Seasonal Patterns (Southern Hemisphere / SA context)**:

| Period | Pattern |
|--------|---------|
| May–August (winter) | Spike in respiratory admissions (children and elderly); plan for +15–25% paediatric and medical bed demand |
| December–January (summer) | Trauma spike (MVAs, drownings, assault); elective demand drops; staff leave peaks |
| February–April | Return of elective surgical demand; steady state |
| September–November | Allergy/asthma season; moderate increase |

**Day-of-Week Patterns**:
- Mondays: highest ED presentations and elective surgical starts
- Fridays: highest elective discharges; avoid scheduling complex cases (incomplete recovery before weekend)
- Weekends: 30–40% reduction in elective activity; emergency admissions continue at ~80% of weekday rate
- Public holidays: treat as Sundays; plan for skeleton elective schedule and full emergency cover

**Demand Forecasting Model**:
```
Projected_Admissions(week) =
    Base_Volume × Seasonal_Index(month) × DOW_Factor × Event_Adjustment
```
Where:
- `Seasonal_Index` = that month's historical volume ÷ annual average monthly volume
- `DOW_Factor` = that day's historical volume ÷ average daily volume
- `Event_Adjustment` = manual override for known demand drivers (school holidays, major public events, disease outbreaks)

### Escalation Levels

Capacity escalation is a formal process, not an informal conversation. Every facility must have a written escalation plan with triggers, actions, and owners at each level.

| Level | Bed Occupancy | Key Actions |
|-------|--------------|-------------|
| Green (normal) | <85% | Business as usual; bed manager monitors hourly |
| Amber | 85–92% | Bed manager activates daily capacity calls; discharge round intensified; elective admissions reviewed |
| Red | 92–96% | CEO / Clinical Manager notified; elective admissions suspended except oncology/chemo; step-down beds activated; agency staffing authorised |
| Black (full capacity) | >96% | Ambulance diversion (where applicable); mutual aid agreements activated; Command and Control convened; all postponable electives cancelled; NDOH/DoH notified (public sector) |

Escalation levels must be declared formally (email or EHR system flag), not just communicated verbally. Undeclared escalations hide systemic problems from leadership.

### Surge Capacity Protocols

Every facility should have a documented surge capacity plan that identifies:

1. **Flex beds**: which wards can expand beyond normal licensed capacity, under what conditions, and with what staffing changes. Typically: day wards converted to overnight wards, procedure rooms converted to observation beds, recovery areas used for step-down.
2. **Cohorting**: grouping patients with the same diagnosis (e.g., respiratory infections) in a single area to free up other wards and reduce infection risk.
3. **Discharge acceleration**: list of patients who can be discharged to community care under surge conditions, with GP notification.
4. **Mutual aid**: written agreements with neighbouring facilities for patient transfers when one site reaches black.

### Elective vs Emergency Bed Allocation

In mixed facilities (planned and emergency admissions), the balance between elective and emergency beds is a daily management decision, not a fixed policy.

**Rule of thumb** for general hospitals:
```
Emergency reserve beds = Expected_Emergency_Admissions(next 24h) × 1.2
Elective beds = Total_Available_Beds − Emergency_Reserve − Occupied_Beds
```

Elective admissions that cannot be accommodated should be rescheduled, not cancelled day-of where avoidable. Day-of cancellations are a waste indicator and a patient experience failure.

---

## 3. Staffing Models

### Nurse-to-Patient Ratios

These are minimum safe ratios. In practice, skill mix, patient acuity, and ward layout affect the real number.

| Ward Type | Day Shift Ratio | Night Shift Ratio | Notes |
|-----------|----------------|------------------|-------|
| ICU | 1:1–1:2 | 1:1–1:2 | 1:1 for ventilated/unstable patients |
| High care / HDU | 1:2–1:3 | 1:2–1:3 | Step down from ICU |
| General medical/surgical | 1:6–1:8 | 1:8–1:10 | SA public sector often runs 1:10–1:15; unsafe |
| Maternity (antenatal) | 1:6–1:8 | 1:8–1:10 | |
| Maternity (labour ward) | 1:1 in active labour | 1:2–1:3 | SANC guideline |
| Paediatrics | 1:4–1:6 | 1:6–1:8 | Higher dependency than adult general |
| Emergency Department | 1:3–1:4 (triage to treatment) | 1:4–1:5 | Highly variable; triage acuity matters |
| Theatre (scrub/circulator) | 1:1 scrub + 1 circulator per table | — | Plus anaesthetic nurse |
| Psychiatry | 1:6–1:8 | 1:8–1:10 | High observation patients: 1:1 |

South African Nursing Council (SANC) does not publish hard numerical ratios for most ward types but holds facilities accountable for safe staffing through inspection. DoH norms documents provide indicative ratios for public facilities.

### Shift Patterns

| Pattern | Description | Best Fit |
|---------|-------------|----------|
| 3×8 | Three 8-hour shifts per day (06:00–14:00, 14:00–22:00, 22:00–06:00) | ICU, emergency, pharmacy |
| 2×12 | Two 12-hour shifts (07:00–19:00, 19:00–07:00) | General wards; reduces handovers; staff prefer it |
| 5×8 office hours | Standard administrative shift | Operational managers, clinic staff |
| Split shifts | Non-standard; used to cover demand peaks | Outpatient, procedure rooms |

12-hour shifts reduce handovers (a major patient safety risk) but increase fatigue risk for night workers. Rotate nurses to no more than 3 consecutive night shifts before a rest day. Night shift fatigue after the 12th hour is a documented patient safety risk.

### Rostering Principles

1. **Publish rosters at least 4 weeks in advance.** Last-minute changes are a staff satisfaction and retention problem.
2. **Match staffing to demand by shift.** Day Monday rostering should exceed night Friday rostering. Use historical admission and patient dependency data to calibrate.
3. **Ensure continuity of care.** A patient admitted on Monday should see the same primary nurse more than once in their stay where possible. Random assignment destroys continuity.
4. **Build in mandatory rest.** Minimum 11 hours between shifts (Basic Conditions of Employment Act applies). Do not roster back-to-back 12-hour shifts with insufficient rest.
5. **Pre-approve leave caps.** Maximum % of a ward's nursing establishment that can be on leave simultaneously (typically 15–20%). Enforce at roster approval, not on the day.

### Agency / Locum Governance

Agency and locum use is legitimate surge management but must be governed:

| Control | Standard |
|---------|---------|
| Pre-approved supplier list | Only agencies with valid DoL compliance, BEE certification, and indemnity insurance |
| Competency verification | Agency nurse must present valid SANC registration + proof of relevant ward experience before first shift |
| Orientation | Minimum 30-minute site orientation before first shift; no floating agency nurse into ICU without demonstrated ICU competency |
| Rate cap | Defined maximum rate per grade per shift; escalations require CNM or DON sign-off |
| Agency spend % | Target <10% of total nursing hours; >20% indicates a systemic recruitment failure |
| Feedback loop | Grade agency nurses after each shift; do not re-engage nurses rated unsafe |

### Skills Mix Planning

A ward's nursing team is not just a headcount — it is a skills portfolio.

```
Skills Mix = (Professional Nurses ÷ Total Nursing Hours) × 100
```

| Ward Type | Target Professional Nurse % | Enrolled/Auxiliary Nurse % |
|-----------|---------------------------|---------------------------|
| ICU | 100% | 0% |
| High care | 80–100% | 0–20% |
| General ward | 50–60% | 40–50% |
| Maternity | 60–70% | 30–40% |
| Psychiatric | 60–70% | 30–40% |

A ward relying on >50% enrolled or auxiliary nurses in a general setting is outside safe skill mix. Flag for recruitment action.

---

## 4. Operational KPIs

The metrics that determine whether a facility is running well. Report these at minimum monthly; track weekly at the operational level.

### Core KPI Dashboard

| KPI | Formula | Target | Red Flag |
|-----|---------|--------|----------|
| Bed Occupancy Rate | (Occupied Bed Days ÷ Available Bed Days) × 100 | 82–85% (general) | >92% sustained |
| Average Length of Stay (ALOS) | Total Inpatient Days ÷ Total Discharges | DRG-adjusted benchmark | >1.2× expected |
| 30-Day Readmission Rate | Readmissions within 30 days ÷ Total Discharges | <8% (general) | >12% |
| Theatre Utilisation Rate | (Scheduled Theatre Hours Used ÷ Available Theatre Hours) × 100 | 85% | <75% or >95% |
| ED Door-to-Doctor Time | Median time from ED arrival to first clinical contact | <30 min (triage 1–2) | >60 min |
| First-Case On-Time Start | % of first theatre cases starting within 15 min of scheduled time | >85% | <70% |
| Discharge Before Noon | % of discharges occurring before 12:00 | >30% | <15% |
| Patient Satisfaction Score | HCAHPS or equivalent (% would recommend) | >80% | <70% |
| Staff Vacancy Rate | (Funded Vacant Posts ÷ Total Funded Posts) × 100 | <8% | >15% |
| Overtime % | Overtime Hours ÷ Total Worked Hours | <5% | >10% |
| Agency Nursing % | Agency Nurse Hours ÷ Total Nursing Hours | <10% | >20% |
| Stockout Incidents | # of stockouts per month on essential items list | 0 critical | Any critical stockout |
| Incident Report Rate | Adverse events per 1,000 patient days | Trend down | Any never-event |

### KPI Calculation Examples

```
Bed Occupancy Rate:
BOR = (Sum of daily midnight census for period ÷ (Available beds × Days in period)) × 100

Readmission Rate:
RAR = (Unplanned readmissions within 30 days ÷ Total index discharges) × 100

Theatre Utilisation:
TUR = (Actual case minutes ÷ (Allocated session minutes × Sessions)) × 100

Overtime Percentage:
OT% = (Overtime hours worked ÷ Total contracted hours) × 100
```

### Benchmarking Sources (South Africa)

- **Council for Health Service Accreditation of Southern Africa (COHSASA)**: accreditation standards with operational benchmarks
- **Hospital Association of South Africa (HASA)**: private sector benchmarks, published periodically
- **District Health Information System (DHIS)**: public sector reporting on facility-level indicators
- **National Core Standards (NCS)**: DoH minimum standards for health establishments — the inspection framework

---

## 5. Theatre / OR Management

Theatre is the revenue engine of a private hospital and the surgical capacity constraint of a public facility. Inefficiency here has outsized financial and clinical consequences.

### Session Utilisation

```
Session Utilisation = (Actual Case Minutes ÷ Allocated Session Minutes) × 100
```

Target: **82–88%** utilisation. Below 75% indicates poor case scheduling or surgeon no-shows. Above 92% indicates over-booking, which leads to rushed cases, overtime, and safety risk.

**Measuring utilisation correctly**: use case start to case end (wheels-in to wheels-out), not incision to close. Ancillary time (anaesthetic induction, positioning, setup) is part of the session cost.

### Turnover Time

Turnover time = interval from previous patient leaving theatre to next patient entering.

| Case Category | Target Turnover Time |
|--------------|---------------------|
| Elective general surgery | 20–25 min |
| Orthopaedic (standard implant) | 25–30 min |
| Cardiac / neurosurgery | 30–45 min |
| Laparoscopic procedures | 20–25 min |
| Obstetrics (emergency Caesar) | No turnover target — emergency priority |

Turnover is driven by: cleaning speed, instrument turnaround (CSSD throughput), anaesthetic team readiness, and patient prep in holding bay. Track each component separately.

### First-Case On-Time Starts (FCOS)

FCOS = % of first cases per day starting within 15 minutes of scheduled time.

Target: **>85%** FCOS. Each delayed first case cascades through the rest of the list.

Common FCOS failure causes:
- Patient not pre-admitted; consent not signed
- Surgeon delayed (private sector: multi-site commitments)
- Anaesthetic team not ready
- Instrument set not sterilised (CSSD failure)
- Patient nil-by-mouth not confirmed

**Fix**: structured theatre start checklist completed by 06:30 for a 07:00 list start. Bed manager confirms patient in holding bay by 06:45.

### Theatre Cancellation Rate

```
Cancellation Rate = (Day-of-surgery cancellations ÷ Scheduled cases) × 100
```

Target: **<3%** for elective cases. Above 5% is a systemic problem.

Root-cause categorise every cancellation:
| Reason | Benchmark % of Cancellations |
|--------|------------------------------|
| Patient unfit on day (medical) | 30–40% |
| Patient did not arrive / refused | 10–15% |
| Surgeon/anaesthetist unavailable | 10–15% |
| Equipment/instrument unavailable | 5–10% |
| Bed unavailable post-operatively | 10–20% |
| Insufficient operating time | 5–10% |

Bed unavailability as a cause of theatre cancellation is a bed management failure, not a theatre failure — it requires operational escalation, not surgical process improvement.

### Add-on Case Management

Add-on (unscheduled emergency) cases disrupt elective lists. Manage them with:
1. A designated emergency theatre slot per day (or per session) — kept free until 14:00 before being offered for electives
2. Triage protocol: life/limb-threatening cases bump the list immediately; urgent cases are slotted at the next available gap; semi-urgent cases scheduled for the following day
3. Clear communication protocol: surgeon, anaesthetist, and scrub nurse informed minimum 30 minutes before the add-on case

---

## 6. Outpatient Operations

### Appointment Scheduling Models

| Model | How It Works | Best Fit |
|-------|-------------|----------|
| Fixed (stream) scheduling | Every patient booked for a specific time with equal slot length | Predictable, low-variability consultations |
| Wave scheduling | Multiple patients booked at the top of each hour; seen in order of arrival | High-volume clinics; accommodates late arrivals |
| Modified wave | Cluster bookings early in each hour; taper off toward the hour end | Good balance of efficiency and patient experience |
| Open access (demand-based) | No fixed appointments; patients arrive and are seen same day | ED, urgent care, walk-in clinics |
| Block scheduling | Blocks of time reserved for specific procedure types | Procedure rooms, echo labs, colposcopy |

For most outpatient specialist clinics in South Africa: **modified wave** is the default. Book 2–3 patients at 08:00, one at 08:20, one at 08:40, one at 09:00, etc. This absorbs early lateness without creating a downstream cascade.

### DNA (Did Not Attend) Rate Management

```
DNA Rate = (DNAs ÷ Scheduled Appointments) × 100
```

Target: **<10%** for most outpatient settings. Above 15% is a revenue and efficiency problem.

| DNA Reduction Intervention | Expected Impact |
|--------------------------|----------------|
| SMS reminder 48 hours before appointment | -20–30% DNA rate |
| SMS reminder + call 24 hours before | -30–40% DNA rate |
| Online cancellation/rescheduling option | -10–15% DNA rate (converts DNA to cancellation, freeing the slot) |
| Overbooking by DNA rate % | Fills slots but risks overruns; use carefully |
| Waitlist management system | Automatically offers cancelled slots to waitlisted patients |

In public sector settings where patient contact details are unreliable, DNA rates of 20–30% are common. Overbooking by 15–20% is standard operational practice.

### Clinic Throughput Benchmarks

| Specialty | Patients per Session (3.5h) | Average Consultation Time |
|-----------|---------------------------|--------------------------|
| General practitioner (private) | 15–20 | 10–12 min |
| General outpatient (public OPD) | 25–40 | 5–8 min |
| Internal medicine specialist | 8–12 | 15–20 min |
| Surgical outpatient (new) | 8–10 | 20–30 min |
| Surgical outpatient (follow-up) | 12–15 | 10–15 min |
| Antenatal clinic (ANC) | 20–30 | 10–15 min |
| Paediatric outpatient | 12–18 | 15–20 min |
| Psychiatric outpatient | 6–10 | 30–45 min |

Public sector outpatient clinics operating above these benchmarks without a triage nurse system are at risk of missed diagnoses and adverse events. Flag for clinical governance review.

---

## 7. Supply Chain & Procurement

### Par Level Management

Par levels define the minimum stock quantity that triggers reorder. Healthcare supply chain failure kills patients — stockout prevention is non-negotiable for essential items.

```
Par Level = (Average Daily Usage × Lead Time in Days) + Safety Stock
Safety Stock = Z-score × σ(daily usage) × √(Lead Time)
```

Where Z-score = 1.65 for 95% service level; 2.05 for 98%.

**Essential items requiring zero-tolerance stockout**:
- Resuscitation drugs (adrenaline, atropine, sodium bicarbonate, dextrose)
- IV fluids (Hartmann's, Normal saline, 5% Dextrose)
- Oxygen (piped and cylinder)
- Insulin (regular and long-acting)
- Antibiotics (at least one broad-spectrum IV cephalosporin and penicillin)
- Blood products (maintained by blood bank, but monitor availability)
- Surgical gloves and sharps containers

### Stockout Prevention

Perform daily stock checks on critical items. Use a two-bin or Kanban system:
- **Bin 1**: current working stock
- **Bin 2**: safety stock, sealed — when Bin 1 is empty, open Bin 2 and place an order

Any breach into safety stock must trigger an immediate order and a root-cause review.

### Expired Goods Management

| Control | Frequency |
|---------|-----------|
| Full stock expiry audit | Monthly |
| 90-day expiry flagging | Weekly automated report from inventory system |
| 30-day expiry action (rotate to high-use area or return to supplier) | Weekly |
| Expired goods quarantine and destruction log | Every incident |

Expired medication usage is a medico-legal liability and a COHSASA non-conformance. Track expired goods as a KPI; any expired item used on a patient requires a formal incident report.

### Vendor Management

| Governance Element | Standard |
|-------------------|---------|
| Approved vendor list | Reviewed annually; only vendors with valid tax clearance and relevant certifications |
| Dual sourcing | All critical items must have a secondary approved supplier |
| Lead time SLA | Written SLA with target delivery time and penalty for non-performance |
| Performance review | Quarterly; track delivery accuracy, lead time adherence, invoice accuracy |
| Emergency procurement | Written policy for urgent out-of-contract purchases; CFO sign-off required above threshold |

### Consignment Stock for Implants

Consignment stock (orthopaedic implants, cardiac devices, ophthalmology lenses) is high-value, low-turnover stock held on-site but owned by the supplier until use.

Key controls:
1. **Physical count reconciliation**: weekly count by stores and supplier rep; discrepancies investigated within 24 hours
2. **Implant use tracking**: every implant used must be documented with patient record number, batch number, expiry date, and surgeon name
3. **Implant registry**: South Africa has a voluntary implant registry (moving toward mandatory); record all joint replacements, cardiac devices, and mesh products
4. **Expired consignment**: supplier responsible for rotation; facility must notify supplier of items within 90 days of expiry
5. **Invoice control**: consignment invoice raised only on use, matched to theatre record — do not accept bulk invoices without theatre documentation

---

## 8. South African Context

### Public vs Private Sector Operational Differences

| Dimension | Public Sector | Private Sector |
|-----------|--------------|----------------|
| Funding | National/provincial DoH budget; NHI transition underway | Medical aid, out-of-pocket, NHI (limited) |
| Bed occupancy | 85–100%+ (chronically over-occupied) | 60–80% (market-driven; varies by region) |
| Staffing | PERSAL-linked; rigid; vacancies take 12–18 months to fill | Flexible; agency used freely; competitive market |
| Supply chain | Central procurement (NHI SDP, NHLS, provincial depots); long lead times | Direct hospital group procurement; faster but margin-driven |
| Patient mix | Uninsured majority; complex social determinants | Insured majority; shorter ALOS; higher elective % |
| Data systems | DHIS2 for reporting; MEDITECH in some provinces; paper-based in many facilities | Meditech, InterSystems TrakCare, Netcare i-Actuary, Life iCare; mostly electronic |
| Governance | Accounting Officer (CEO) accountable to DoH; Facility Supervisory Board | Board of Directors; group clinical governance frameworks |
| Quality framework | National Core Standards (NCS); OHSC inspections | COHSASA accreditation; JCI (select facilities) |

### DoH Norms and Standards for Facility Operations

The **National Department of Health Norms and Standards Regulations** (2018, under National Health Act) set minimum requirements for health establishments:

Key operational standards:
- Emergency care: facility must be able to assess and stabilise any emergency presentation regardless of ability to pay
- Staffing: facilities must have a staffing plan approved by the Nursing Manager; nurse-to-patient ratios must be documented and maintained
- Infection prevention: dedicated IPC (Infection Prevention and Control) officer; hand hygiene compliance audited quarterly
- Waste management: healthcare risk waste (HCRW) must be segregated, stored securely, and disposed of by a licensed contractor
- Medication management: pharmacy must be supervised by a registered pharmacist; medication errors must be reported and reviewed
- Patient rights: Batho Pele principles apply in public sector; private sector governed by Consumer Protection Act and Health Professions Act

### District Hospital vs Regional vs Tertiary Staffing Norms

| Facility Level | Bed Range | Minimum Medical Staffing | Minimum Nursing |
|---------------|-----------|-------------------------|-----------------|
| District hospital (community) | 50–150 beds | 1–2 medical officers per shift; GP-level | 1:8 general ward day; 1:12 night |
| District hospital (full) | 150–400 beds | 2–4 MOs per shift; visiting specialist support | 1:6–8 general; ICU 1:2 |
| Regional hospital | 400–800 beds | 24/7 specialist cover in core disciplines (medicine, surgery, O&G, paeds, anaesthetics) | 1:5–6 general; ICU 1:1–2 |
| Tertiary / academic | 800–2,000+ beds | Full specialist and subspecialist cover; registrar training programmes | 1:4–5 general; ICU 1:1 |
| Central hospital | 2,000+ beds | Quaternary subspecialty; academic attached | Highest skill mix; ICU 1:1 |

Staffing below district norms at any facility level must be reported to the Provincial DoH and to the OHSC (Office of Health Standards Compliance).

### Load Shedding Contingency (Eskom Stages 1–8)

Load shedding is a permanent operational planning assumption in South Africa. Every healthcare facility must have a documented power contingency plan.

**Generator requirements by area**:

| Area | Generator Priority | Minimum Autonomy |
|------|------------------|-----------------|
| ICU / High care | Priority 1 (automatic transfer <30 sec) | 72 hours at full load |
| Operating theatres | Priority 1 | 72 hours |
| Emergency Department | Priority 1 | 72 hours |
| Labour ward / NICU | Priority 1 | 72 hours |
| General wards (life-support patients) | Priority 2 | 48 hours |
| Pharmacy (refrigerators) | Priority 2 | 48 hours |
| Pathology lab | Priority 2 | 48 hours |
| Radiology (CT/MRI) | Priority 3 | 24 hours |
| Administration | Non-essential | —  |

**UPS requirements**: UPS (Uninterruptible Power Supply) must bridge the gap between grid power failure and generator start. Minimum UPS runtime:
- ICU ventilators, infusion pumps: 30 minutes
- OR anaesthetic machines: 30 minutes
- Server/HIS room: 60 minutes

**Operational protocols during load shedding**:
1. Theatre scheduler to check Eskom schedule the night before; avoid scheduling long cases that will span a load shedding window unless generator is confirmed on
2. Blood bank: confirm blood refrigerators on generator circuit; log temperature every 4 hours during extended outages
3. Pharmacy: log vaccine and cold-chain item temperatures; discard if out of range per cold chain protocol
4. ICU: all patients on manual ventilation drill quarterly; nurses to confirm ventilator battery level at start of each shift
5. Backup lighting: check emergency lighting monthly; torches in every ward (charged)

**Diesel management**: maintain minimum 7-day diesel reserve for generators; dual supplier contracts to prevent stockout during extended grid failure (Stage 6–8). Log diesel levels daily during active load shedding.

### Water Outage Protocols

Johannesburg (Rand Water), Ekurhuleni, Nelson Mandela Bay, and Buffalo City Metro have all experienced extended water outages. Every facility in these regions must plan for this.

**Water storage requirement**: minimum 48-hour potable water supply on-site (storage tanks or JoJo tanks). ICU and theatre require continuous water access — size storage accordingly.

**Protocols during water outage**:
1. Switch to stored water immediately; notify DoH if outage extends beyond 12 hours
2. Theatre: reduce elective cases requiring large volumes of irrigation; prioritise life-saving cases
3. CSSD: confirm sterile water supply for autoclave; delay non-urgent sterilisation if supply compromised
4. IPC: alcohol hand rub to replace hand washing where water is unavailable; maintain supply of rub at every station
5. Kitchen: contact pre-cooked meal supplier for backup; reduce menu to shelf-stable options
6. Patient bathing: substitute with no-rinse cleansing products during outage
7. Dialysis: renal units require significant water volume; have a protocol for patient transfer to a facility with water if outage extends beyond 6 hours

Designated Water Management Officer (can be Facilities Manager) responsible for daily tank level checks and outage protocol activation.

---

## Common Gotchas

- **Occupancy is a lagging indicator.** By the time you hit 95% occupancy, you have already lost the ability to manage the surge. Use predictive occupancy (projected census for the next 24–48 hours) to trigger escalation early, not after the fact.
- **ALOS is not a quality metric by itself.** A short ALOS driven by premature discharge shows up as a high 30-day readmission rate. Always present ALOS alongside the readmission rate.
- **Discharge before noon targets fail without morning blood results.** If phlebotomy rounds happen at 07:00 and results are not in the system until 11:00, you cannot discharge before noon. Solving DBON (discharge before noon) is a pathology workflow problem as much as a nursing one.
- **Theatre utilisation gaming.** Surgeons will artificially inflate case estimates to protect session time. Use actual median case time by procedure and surgeon for scheduling — not the surgeon's stated estimate.
- **Agency staffing creates a competency blind spot.** A nurse with valid SANC registration and claimed ICU experience may not be competent in your specific equipment and protocols. Mandatory orientation is not optional, and ICU or theatre agency nurses must be directly supervised on their first shift.
- **Load shedding + diesel stockout is a never-event waiting to happen.** The generator is not a backup plan if there is no diesel. Assign one person to check diesel levels daily and sign off. Do not leave this to assumption.
- **Consignment stock is invisible until it is not.** Most facilities only notice consignment discrepancies at month-end reconciliation. Weekly physical counts by stores staff (not supplier rep alone) are essential.
- **DoH / OHSC inspections are unannounced.** Do not run the facility to a pre-inspection standard. The inspection standard should be the daily operating standard. Common findings: expired medications in stock, missing patient consent, staff without current CPR certificates, broken emergency equipment not logged.

---

## See Also

- [Health domain overview](../SKILL.md)
- [Healthcare Operations (ops hub)](../ops/SKILL.md)
- [Clinical systems](../clinical/SKILL.md)
