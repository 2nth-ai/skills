---
name: Pharmacy & Medicines Management
description: >
  Formulary management, drug procurement, pharmacovigilance, controlled substances,
  medicine pricing, and pharmacy law in South Africa.
requires: []
improves: []
metadata:
  domain: health
  subdomain: pharmacy
  maturity: stable
---

# Pharmacy & Medicines Management

Medicines are the highest-volume clinical intervention in any healthcare organisation and one of the largest cost lines. Pharmacy management sits at the intersection of clinical safety, procurement efficiency, and regulatory compliance.

## The South African Medicines Regulatory Framework

### SAHPRA (South African Health Products Regulatory Authority)

SAHPRA (formerly MCC — Medicines Control Council) regulates medicines, medical devices, and clinical trials under the Medicines and Related Substances Act 101 of 1965 (as amended).

**Responsibilities**:
- Registration of medicines (Schedule 0–8)
- Licensing of manufacturers, wholesalers, pharmacies
- Post-market surveillance (pharmacovigilance)
- Clinical trial authorisation
- Scheduling of substances

### Scheduling System

| Schedule | Category | Examples | Who May Supply |
|----------|----------|---------|----------------|
| S0 | General sale | Paracetamol ≤8 tablets, low-strength antihistamines | Any retail outlet |
| S1 | Pharmacy sale | Standard paracetamol packs, ibuprofen | Pharmacy without prescription |
| S2 | Pharmacist prescription | Stronger analgesics, some antihistamines | Pharmacist may initiate |
| S3 | Prescription (repeat) | Oral contraceptives, statins, amlodipine | Registered prescriber; repeats allowed |
| S4 | Prescription (no repeat without new Rx) | Antibiotics, antihypertensives (most), antidiabetics | Registered prescriber; no automatic repeat |
| S5 | Controlled substance (moderate) | Codeine-containing combinations > threshold | Strict record-keeping; triplicate book |
| S6 | Controlled substance (high) | Morphine, pethidine, oxycodone | S6 register; DEA licence; biannual audit |
| S7 | Prohibited (research only) | MDMA, LSD | Research exemption only |
| S8 | Prohibited | Heroin | No civilian use |

**Key**: S5 and S6 require separate registers, counting, and reconciliation. S6 requires a DEA (Drug Enforcement Authority within SAHPRA) licence. Mismanagement of controlled substances is a criminal offence and grounds for deregistration.

### Pharmacy Act 53 of 1974

Governs pharmacy practice:
- Only a registered pharmacist may compound, dispense, and supervise the dispensing of medicines
- Pharmacist's assistant (post-basic) may dispense under pharmacist supervision
- A medical practitioner may dispense from their practice (Section 22C licence) — but this is controversial and increasingly restricted
- Community service year is compulsory for pharmacists after internship

---

## Essential Medicines List (EML)

The National EML and Standard Treatment Guidelines (STGs) define the medicines that should be available at each level of care:

| Level | Scope | Key Document |
|-------|-------|-------------|
| PHC / Clinic | ~300 medicines | Primary Care STGs |
| District Hospital | ~500 medicines | District Hospital STGs |
| Regional Hospital | ~700 medicines | Regional Hospital STGs |
| Tertiary/Academic | Full formulary | Tertiary/Academic Hospital STGs |

**Principle**: Prescribe from the EML at the appropriate care level. Off-formulary prescribing requires motivation and approval. Private sector equivalents are the hospital formulary and the medical aid formulary.

### Formulary Management in Private Hospitals

Hospital pharmacy formularies:
- **Closed formulary**: Only listed medicines available; must motivate for non-formulary items
- **Preferred formulary**: Listed items are first-line; alternatives available with additional co-payment
- **Open formulary**: Any medicine available; controls via therapeutic interchange and generic substitution

Generic substitution is mandatory in South Africa under the Medicines Act unless the prescriber writes "no substitution" and the patient agrees to pay the price difference.

---

## Medicine Pricing in South Africa

### Single Exit Price (SEP)

Introduced in 2004 under the Medicines and Related Substances Amendment Act. All manufacturers and importers must publish a SEP for each medicine. The SEP is the maximum price at which a medicine may be sold to any buyer in South Africa (with the exception of SEP-exempt exports).

**Dispensing fee**: Pharmacists charge a dispensing fee on top of the SEP. The fee is regulated by the DoH and is tiered based on the SEP of the medicine:

| SEP Range | Dispensing Fee (approx.) |
|-----------|--------------------------|
| R0 – R85.99 | R14.00 flat |
| R86 – R185.99 | R16.00 |
| R186+ | Sliding scale capped |

*Exact fee schedule published annually by the DoH.*

### Medicine Price Register

All registered medicines with their SEP are listed on the Medicine Price Register (MPR), publicly available. This enables price comparison and procurement benchmarking.

### Tender Pricing (Public Sector)

National Department of Health negotiates national contracts for high-volume medicines via competitive tender (NDoH Pharmaceutical Contracts). Provincial health departments procure against these contracts. SLA compliance and delivery performance are tracked by the DoH.

---

## Pharmacovigilance

### Adverse Drug Reaction (ADR) Reporting

All healthcare professionals have an obligation to report suspected ADRs to SAHPRA via the MedSafety / VigiBase system (South Africa participates in the WHO Programme for International Drug Monitoring).

**Reportable events**:
- All ADRs to newly registered medicines (< 5 years post-registration)
- Serious ADRs to any medicine (hospitalisation, disability, death, congenital abnormality)
- Unexpected ADRs not described in the package insert
- ADRs in special populations (children, pregnant women, elderly)

**Naranjo Algorithm** — assesses causality of suspected ADR:
```
Score ≥ 9:   Definite ADR
Score 5–8:   Probable ADR
Score 1–4:   Possible ADR
Score ≤ 0:   Doubtful ADR
```

### Drug-Drug Interactions (DDIs)

High-risk interaction pairs common in SA context:

| Drug A | Drug B | Risk | Management |
|--------|--------|------|-----------|
| Warfarin | Fluconazole | Major — INR ↑↑ | Avoid / reduce warfarin dose / monitor INR |
| Rifampicin | ARVs (PIs, NNRTIs) | Major — induces CYP3A4 | Use rifabutin / switch ARV regimen |
| Metformin | IV contrast media | Major — lactic acidosis risk | Hold metformin 48h peri-procedure |
| TMP-SMX | ACE inhibitor | Moderate — hyperkalaemia | Monitor K⁺; avoid in renal impairment |
| Clopidogrel | Omeprazole | Moderate — reduced antiplatelet effect | Use pantoprazole instead |
| Clozapine | Ciprofloxacin | Major — clozapine levels ↑ | Avoid; monitor clozapine levels |

---

## Hospital Pharmacy Operations

### Medicine Supply Chain

```
NDoH/Provincial Tender → Primary Depot (NDOH Depot / Provincial Depot)
                             ↓
                     Secondary Depot (District)
                             ↓
                     Facility Pharmacy (Hospital)
                             ↓
                     Ward Dispensing / Satellite Pharmacy
                             ↓
                     Patient / Bedside Administration
```

**Stockout prevention**:
- Maintain min/max par levels based on 6-month consumption data
- Buffer stock: 2–4 weeks for essential medicines; 4–8 weeks for ARVs
- Daily review of ward requisitions vs stock on hand
- Alert system for medicines approaching reorder level
- National Drug Action Committee (NDAC) stockout reporting

### Dispensing Systems

| System | Description | Best For |
|--------|------------|---------|
| **Traditional dispensing** | Pharmacist-checked individual patient packs | Small facilities; outpatient |
| **Ward stock (floor stock)** | Medicines stocked in ward, nurses administer | Routine ward medicines |
| **Unit dose dispensing** | 24-hour supply per patient, individually labelled | ICU, high-dependency, reducing medication errors |
| **Automated dispensing cabinets (ADCs)** | Pyxis, Omnicell — controlled electronic dispensing | Theatre, ED, ICU — high-value/controlled substances |

### Medication Error Prevention

WHO High-Alert Medicines (require double-checks at administration):
- Concentrated electrolytes (KCl, hypertonic saline) — never on wards
- Insulin — independent double-check before administration
- Chemotherapy — pharmacist verification + second nurse check
- Anticoagulants (heparin, warfarin, LMWHs)
- Neuromuscular blocking agents — must be labelled; never stored with other injectables
- Opioids — S6 register + double-check

**Look-alike / sound-alike (LASA) medicines**: Physical separation, different-coloured labels, TALL man lettering (e.g., DOBUTamine vs DOPamine).

---

## ARV (Antiretroviral) Medicines Management

South Africa runs the world's largest ARV programme (approximately 5.5 million people on treatment). ARV supply chain management is a national priority.

### Current First-Line Regimen (Adults)

Per SA ARV Treatment Guidelines (2023):
- **TLD**: Tenofovir (TDF) 300mg + Lamivudine (3TC) 300mg + Dolutegravir (DTG) 50mg — one tablet daily

### ARV-Specific Management Requirements

- 2-month dispensing intervals (stable patients) to reduce facility visits — Adherence Clubs and CCMDD (Central Chronic Medicines Dispensing and Distribution)
- CCMDD: pick-up points in the community (spaza shops, community sites) for chronic stable patients
- DTG in pregnancy: safe (early concern about NTDs resolved with folic acid supplementation)
- Viral load monitoring: 6-monthly for stable patients; monthly if unsuppressed
- Resistance testing (genotyping): on treatment failure before switching regimen

### TB-ARV Co-treatment Drug Interactions

Rifampicin (TB treatment backbone) is a potent CYP3A4 inducer:
- Rifampicin + DTG: DTG dose doubled to 50mg twice daily
- Rifampicin + PI-based regimens: not recommended (use rifabutin instead, or switch to EFV-based)
- Standard approach: use TLD with DTG 50mg BD during rifampicin-containing TB treatment; revert to once-daily DTG after TB treatment completes

---

## Pharmacy Metrics

| KPI | Benchmark | Notes |
|-----|-----------|-------|
| Stockout rate (tracer medicines) | < 2% | Monitor monthly; report to NDAC |
| Prescription turnaround time (outpatient) | < 30 minutes | Patient satisfaction driver |
| Dispensing error rate | < 0.1% | Near-miss captures important |
| Generic dispensing rate | > 80% | Cost reduction; SAHPRA encourages |
| ADR reporting rate | > 0.5/100 beds/year | Underreporting is systemic |
| Controlled substance discrepancy rate | 0% | Any discrepancy triggers investigation |
| Medicine expenditure as % of total facility spend | 15–25% private; 25–35% public | Varies by case mix |
