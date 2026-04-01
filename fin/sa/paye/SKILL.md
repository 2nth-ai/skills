---
name: South African PAYE, UIF & SDL
description: >
  (1) South African employer tax obligations — PAYE withholding, UIF contributions,
  Skills Development Levy, EMP201 monthly returns, and EMP501 annual reconciliation.
requires:
  - fin/sa
improves:
  - fin/accounting
metadata:
  domain: fin
  subdomain: sa/paye
  maturity: stable
  jurisdiction: ZA
  legislation: Income Tax Act 58 of 1962; Unemployment Insurance Act 63 of 2001; Skills Development Levies Act 9 of 1999
---

# South African PAYE, UIF & SDL

Employers in South Africa must register with SARS for PAYE (Pay As You Earn), UIF (Unemployment Insurance Fund), and SDL (Skills Development Levy) as soon as they employ staff. All three are reported and paid monthly via the **EMP201 return**.

---

## PAYE — Pay As You Earn

PAYE is income tax withheld by the employer from employee remuneration and paid to SARS on behalf of the employee.

### Remuneration Includes
- Basic salary
- Overtime pay
- Commissions
- Bonuses (including 13th cheque and performance bonuses)
- Fringe benefits (company car, medical aid subsidy, housing allowance)
- Director's fees
- Subsistence allowances above SARS prescribed amounts

### PAYE Calculation
Use the **SARS Tax Tables** (updated annually in the Budget):
1. Annualise the monthly remuneration
2. Apply the individual tax brackets
3. Subtract rebates (Primary Rebate: R17,235 for 2024/25)
4. De-annualise (divide by 12) for monthly withholding

**2024/25 Individual Tax Brackets**:

| Taxable Income | Rate |
|----------------|------|
| R0 – R237,100 | 18% |
| R237,101 – R370,500 | R42,678 + 26% above R237,100 |
| R370,501 – R512,800 | R77,362 + 31% above R370,500 |
| R512,801 – R673,000 | R121,475 + 36% above R512,800 |
| R673,001 – R857,900 | R179,147 + 39% above R673,000 |
| R857,901 – R1,817,000 | R251,258 + 41% above R857,900 |
| R1,817,001+ | R644,489 + 45% above R1,817,000 |

**Primary Rebate**: R17,235 (all taxpayers)
**Secondary Rebate**: R9,444 (taxpayers 65 years and older)
**Tertiary Rebate**: R3,145 (taxpayers 75 years and older)

**Tax Thresholds** (below which no tax is payable):
- Under 65: R95,750
- 65–74: R148,217
- 75+: R165,689

### IRP5 / IT3(a)
At year-end, the employer issues each employee an **IRP5** (tax certificate) reflecting total remuneration and PAYE deducted. This forms the basis of the employee's personal tax return (ITR12).

### Fringe Benefits (Paragraph 2–14 of 7th Schedule)
Must be included in remuneration for PAYE purposes:

| Benefit | Taxable Amount |
|---------|---------------|
| Company car | 3.5% of determined value per month (or 3.25% if maintaining logbook; reduces if employee bears fuel costs) |
| Medical aid subsidy | Employer contribution above prescribed amount |
| Low-interest loans | Difference between official rate (8.25% p.a. per SARS) and actual interest charged |
| Residential accommodation | Formula-based (R value or market value) |
| Use of company assets | 15% of cash equivalent per annum |

---

## UIF — Unemployment Insurance Fund

UIF provides short-term relief to workers who become unemployed, ill, or go on maternity leave.

### Contributions
- **Employee**: 1% of remuneration
- **Employer**: 1% of remuneration (employer's own contribution — not deducted from employee)
- **Total**: 2% per employee per month

### UIF Ceiling (2024/25)
Monthly remuneration is capped at **R17,712** for UIF purposes.
Maximum monthly UIF contribution per employee: R354.24 (employee) + R354.24 (employer) = R708.48 total.

### Excluded from UIF
- Employees earning less than R17,712/month (UIF applies, just capped)
- Employees working fewer than 24 hours per month
- Public servants (have their own Government Employees Pension Fund)
- Foreigners on temporary employment

### UIF Registration and TERS
Employers must register employees with UIF via uFiling or SARS eFiling. The COVID-19 TERS (Temporary Employer/Employee Relief Scheme) was administered via UIF — maintain employer and employee registration to access future relief schemes.

---

## SDL — Skills Development Levy

SDL funds skills development through the **SETAs** (Sector Education and Training Authorities). Employers can recover up to **70% of SDL paid** by submitting Workplace Skills Plans (WSP) and Annual Training Reports (ATR) to their relevant SETA.

### Levy Rate
**1%** of total leviable amount (remuneration paid to employees).

### Exemption
Employers with an annual payroll of **R500,000 or less** are exempt from SDL.

### Leviable Amount
Total remuneration paid to all employees, including:
- Salaries and wages
- Overtime
- Leave pay
- Bonuses
- Commissions
- Fringe benefits

Excludes: Pension fund contributions, reimbursements for actual expenditure.

### SETA Recovery
**Mandatory Grant (20%)**: Submitted via Employer Registration Form to SETA.
**Discretionary Grant (50%)**: Submitted with Workplace Skills Plan and Annual Training Report. Deadline: **30 April** annually.

---

## EMP201 — Monthly Employer Return

Due: **7th of the following month** (e.g., January PAYE due by 7 February). If the 7th falls on a weekend or public holiday, due the last business day before.

The EMP201 consolidates:
- PAYE withheld
- SDL payable
- UIF contributions (employer + employee)

Payment must accompany the return. Late payment attracts **10% penalty + interest** at the prescribed rate.

---

## EMP501 — Employer Annual Reconciliation

Reconciles monthly EMP201 payments against the total IRP5s issued to employees.

| Period | Submission Deadline |
|--------|-------------------|
| Interim (March–August) | 31 October |
| Annual (March–February) | 31 May |

The EMP501 reconciliation must balance exactly. Common reconciling items:
- Bonus payments that fall in one month but were estimated in another
- Corrections to fringe benefit values
- Employees who joined or left mid-year
- Leave pay on termination

SARS's **Auto-Assessment** system uses IRP5 data from the EMP501 to pre-populate employee tax returns — accuracy is critical.

---

## Practical Payroll Compliance Checklist

- [ ] PAYE registration number obtained from SARS (PAYE, SDL, UIF)
- [ ] Payroll system calculates PAYE from correct tax tables (updated February each year)
- [ ] All fringe benefits included in remuneration and taxed
- [ ] EMP201 submitted and paid by the 7th monthly
- [ ] EMP501 reconciliation completed and submitted (May and October)
- [ ] IRP5s issued to all employees by 28 February
- [ ] UIF employer and employee registration current on uFiling
- [ ] SDL paid to SETA if payroll >R500,000; WSP/ATR submitted by 30 April
