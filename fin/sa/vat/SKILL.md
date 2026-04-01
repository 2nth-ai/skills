---
name: South African VAT
description: >
  (1) South African VAT compliance — VAT Act 89 of 1991, VAT201 returns, input and output
  tax, zero-rated and exempt supplies, registration thresholds, and SARS requirements.
requires:
  - fin/sa
improves:
  - fin/accounting
metadata:
  domain: fin
  subdomain: sa/vat
  maturity: stable
  jurisdiction: ZA
  legislation: Value-Added Tax Act 89 of 1991
---

# South African VAT

Value-Added Tax (VAT) is administered under the Value-Added Tax Act 89 of 1991. The standard rate is **15%** (increased from 14% on 1 April 2018). VAT is collected at each stage of the supply chain; the vendor acts as a collection agent for SARS.

## Registration

### Compulsory Registration
A vendor must register for VAT when taxable supplies exceed **R1 million** in any consecutive 12-month period (or when it is reasonably certain they will).

### Voluntary Registration
A vendor may register voluntarily when:
- Taxable supplies exceed **R50,000** in the past 12 months, or
- There is a reasonable expectation of reaching R50,000

Voluntary registration is advantageous when supplying other VAT vendors (input tax recovery) and when significant capital expenditure is planned.

### Category of Vendor (Return Period)

| Category | Taxable Supplies | Return Period |
|----------|-----------------|---------------|
| A | ≤R30 million | Bi-monthly (every 2 months) |
| B | ≤R30 million | Bi-monthly (staggered) |
| C | >R30 million | Monthly |
| D | Farming operations | Every 6 months |
| E | Banks, certain entities | Monthly |

### VAT201 Due Date
**25th of the month** following the end of the tax period (or the last business day before if the 25th falls on a weekend or public holiday). Late payment attracts a 10% penalty plus interest at the prescribed rate.

---

## Output Tax

Output tax is VAT charged on taxable supplies made by the vendor.

### Standard-Rated Supplies (15%)
Most goods and services supplied in the course of an enterprise.

### Zero-Rated Supplies (0%)
VAT is charged at 0% — the vendor still accounts for these on the VAT return but charges no VAT. Input tax on costs related to zero-rated supplies is still claimable.

Zero-rated supplies include:
- **Exports** — goods exported from South Africa (documentary proof required: export documents, commercial invoice, proof of payment)
- **Basic foodstuffs** — brown bread, dried mealies, dried beans, lentils, pilchards/sardines in tins, milk, eggs, cooking oil, tea, rice, vegetables, fruit, vegetable oil, peanut butter, canned vegetables
- **Fuel levy goods** — petrol and diesel
- **Illuminating paraffin**
- **International transport services**
- **Going concern sales** — sale of a business as a going concern (both parties must be VAT vendors; the going concern must be capable of continued operation)
- **Agricultural land and improvements** (where used for farming)

### Exempt Supplies
No VAT is charged and **no input tax may be claimed** on costs related to exempt supplies.

Exempt supplies include:
- **Financial services** — interest, insurance premiums (life, short-term), granting of credit, foreign exchange transactions
- **Residential accommodation** — letting of a dwelling (not commercial property)
- **Educational services** — SAQA-approved qualifications
- **Public transport** — road and rail passenger transport (under certain conditions)
- **Childcare** — registered crèches and pre-primary schools

---

## Input Tax

Input tax is VAT paid on goods and services acquired for use in making taxable supplies. It is deducted from output tax to determine the net VAT payable (or refundable).

### Claiming Input Tax — Requirements
1. Must hold a **valid tax invoice** from a registered VAT vendor
2. Supply must be used in the course of making taxable supplies
3. Claim must fall within the correct tax period (or carry forward)

### Valid Tax Invoice Requirements (supplies >R50)
- The words "Tax Invoice" prominently displayed
- Supplier's name, address, and VAT registration number
- Customer's name and address
- Invoice date and unique sequential number
- Description of goods/services
- Quantity and price (inclusive and exclusive of VAT)
- VAT amount
- If >R5,000: customer's VAT registration number

### Blocked Input Tax (not claimable)
- **Motor cars** — passenger vehicles (not game drive vehicles, hearses, or ambulances)
- **Club subscriptions** — entertainment clubs, sports clubs
- **Medical or dental services** for employees
- **Accommodation** for non-business purposes
- Entertainment above the entertainment allowance threshold

---

## VAT Reconciliation

Monthly/bi-monthly reconciliation to confirm the VAT201 is accurate:

```
Output VAT (all standard-rated sales × 15/115)
Less: Input VAT (all valid tax invoices)
= Net VAT payable / (refundable)
```

**Reconcile against**: Sales ledger, purchase ledger, and bank statement. Differences typically arise from:
- Invoices posted in wrong period
- Non-VAT invoices incorrectly VAT-coded
- Blocked input tax incorrectly claimed
- Zero-rated or exempt supplies incorrectly coded at 15%

---

## VAT Refunds

SARS must pay a refund within **21 business days** of receipt of a VAT201. Refunds are common when:
- Significant capital expenditure in the period
- Majority of supplies are zero-rated (exporters)
- Business is in a start-up phase

SARS frequently audits refund claims before payment. Maintain complete documentation:
- All tax invoices for input tax claimed
- Export documentation for zero-rated exports
- Bank statements confirming payments

---

## Common VAT Errors

| Error | Consequence |
|-------|------------|
| Claiming input VAT without a valid tax invoice | SARS disallows the claim + interest |
| Incorrect tax period for an invoice | Timing difference — carry forward |
| Charging VAT on exempt supplies | Overcharging client; must refund |
| Not charging VAT on standard-rated supplies | Vendor liable for output VAT regardless |
| Motor car input tax claimed | Blocked — disallowed on audit |
| Going concern not properly documented | Supply reclassified as standard-rated |
