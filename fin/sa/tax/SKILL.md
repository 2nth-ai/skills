---
name: South African Corporate Tax
description: >
  (1) South African corporate income tax — Income Tax Act 58 of 1962, provisional tax,
  corporate tax rates, deductions, assessed losses, and SARS compliance for companies.
requires:
  - fin/sa
improves:
  - fin/accounting
  - fin/modelling
metadata:
  domain: fin
  subdomain: sa/tax
  maturity: stable
  jurisdiction: ZA
  legislation: Income Tax Act 58 of 1962
---

# South African Corporate Income Tax

Corporate income tax in South Africa is governed by the **Income Tax Act 58 of 1962**, administered by SARS. The standard corporate tax rate is **27%** (effective for companies with years of assessment ending on or after 31 March 2023; previously 28%).

---

## Tax Rates

### Standard Companies
**27%** on taxable income.

### Small Business Corporations (SBC)
A more favourable sliding scale applies where the company meets ALL of the following:
- All shareholders are natural persons
- Annual taxable income does not exceed R20 million
- No shareholder holds a shareholding in another company (with limited exceptions)
- Not a personal service provider
- Not an investment company

**2024/25 SBC Tax Table**:

| Taxable Income | Rate |
|----------------|------|
| R0 – R95,750 | 0% |
| R95,751 – R365,000 | 7% on the amount above R95,750 |
| R365,001 – R550,000 | R18,848 + 21% on the amount above R365,000 |
| R550,001+ | R57,698 + 27% on the amount above R550,000 |

### Personal Service Providers
Taxed at 27%. Cannot claim most employee-related deductions.

### Dividends Tax
**20%** withheld on dividends paid to shareholders. Dividend Tax is a withholding tax — the company withholds and pays to SARS on behalf of the shareholder.

Exemptions:
- Dividends paid to SA resident companies (inter-company dividends)
- Dividends paid to certain public benefit organisations
- Foreign dividends are exempt if the SA company holds ≥10% in the foreign company (subject to conditions)

---

## Provisional Tax

Provisional tax is a mechanism to pay income tax in advance during the tax year rather than as a lump sum. Companies are provisional taxpayers.

### First Provisional Tax Return (IRP6 — First Period)
Due: **Last day of the 6th month of the tax year**
- Estimate: At least 80% of the actual tax liability for the year, or the basic amount (prior year's taxable income)
- Minimum payment: Based on the basic amount (SARS's estimate from prior year)
- Penalty for underpayment: 20% of the shortfall if less than 80% of actual liability

### Second Provisional Tax Return (IRP6 — Second Period)
Due: **Last day of the tax year**
- Estimate: At least 80% of actual tax liability
- This is the critical estimate — if you pay too little here, penalties apply

### Third (Optional) Provisional Tax Return
Due: **7 months after year-end** (for February year-end: by 30 September)
- Allows topping up to avoid the 20% underestimation penalty
- Strongly recommended when actual tax liability will significantly exceed the second provisional estimate

### Example (February Year-End Company)
| Event | Due Date |
|-------|---------|
| 1st Provisional | 31 August |
| 2nd Provisional | 28/29 February |
| Optional 3rd | 30 September |
| Tax Return (ITR14) | 12 months after year-end |

---

## Taxable Income Calculation

```
Gross Income
Less: Exempt Income
= Income
Less: Deductions (s11)
Add: Recoupments and capital gains (CGT inclusion)
= Taxable Income
× Tax Rate
= Normal Tax
Less: Rebates (not applicable to companies)
Less: Provisional Tax Paid
= Tax Payable / (Refundable)
```

### Key Allowable Deductions (Section 11)
- Expenses **actually incurred** in the production of income
- Not of a capital nature
- Not prohibited by another section

**Common deductions**:
- Salaries and wages (including employer UIF and SDL)
- Rent
- Repairs and maintenance (not improvements)
- Bad debts (written off, previously included in income)
- Professional fees (accounting, legal)
- Marketing and advertising
- Travel (at SARS rate or actual cost with logbook)
- Medical aid employer contributions (for employees)
- Interest on borrowings used for trade purposes

### Capital vs Revenue Distinction
Capital expenditure is **not immediately deductible**. Instead:
- **Section 11(e)** — wear and tear allowance on plant, machinery, and equipment
- **Section 12C** — manufacturing plant: 40/20/20/20 or 20% per year
- **Section 13** — buildings: 5% per year for commercial, 10% for residential rental
- **Section 12B** — renewable energy assets: 100% in year 1 (solar, wind)

---

## Assessed Losses

A company that incurs a loss in a tax year may carry the **assessed loss** forward indefinitely, subject to the **balance of assessed loss** limitation:

- From 1 April 2022: A company may only set off a balance of assessed loss against **80% of taxable income** in a given year
- The remaining 20% of taxable income is always taxable, even where assessed losses exist
- Example: Taxable income R1m, assessed loss R2m → Tax on R200,000 (20% of R1m is always taxable)

---

## Transfer Pricing

Applicable to transactions between connected persons (related parties):
- Must be at **arm's length** (as if between unrelated parties)
- Documentation required to support pricing decisions
- SARS may adjust pricing to arm's length equivalent
- Applies to cross-border and (under s31) certain domestic related-party transactions

---

## Common Tax Planning Considerations (Legitimate)

- **Timing of income recognition**: Defer income to the next tax year where possible (subject to anti-avoidance rules)
- **Accelerated depreciation**: Use Section 12B for renewable energy assets (100% year 1)
- **Research & Development**: Section 11D allows a 150% deduction for qualifying R&D expenditure
- **Learnership allowances**: Section 12H — additional deductions for registered learnerships (NQF Level 1-6)
- **Small Business Corporation**: Structure to qualify if shareholders are natural persons
- **Dividend vs Salary**: At 27% CIT + 20% dividends tax (effective 41.6%) vs marginal income tax rates — analysis required per situation

---

## Annual Tax Return (ITR14)

Due **12 months after the company's year-end**. Filed on SARS eFiling.

Requires:
- Financial statements (IFRS for SMEs or full IFRS)
- Reconciliation of accounting profit to taxable income
- Supporting schedules for capital allowances, assessed losses, related party transactions
