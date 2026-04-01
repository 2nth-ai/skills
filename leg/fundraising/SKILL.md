---
name: Fundraising & Investment Documentation
description: >
  (1) Investment documentation for founders — term sheets, shareholder agreements,
  SAFE notes, convertible instruments, cap table, and investor rights in South Africa.
requires:
  - leg
  - leg/corporate
improves: []
metadata:
  domain: leg
  subdomain: fundraising
  maturity: stable
  jurisdiction: ZA
  legislation: Companies Act 71 of 2008; Financial Markets Act 19 of 2012
---

# Fundraising & Investment Documentation

Raising capital is one of the highest-stakes legal events in a company's life. Every clause in a term sheet will be negotiated into definitive documents that govern the investor relationship for years. Founders who do not understand the terms they sign often lose control of the business before they realise it.

> Leo outlines term sheet concepts and flags unfavourable terms. For completing a funding round, engage a commercial attorney experienced in venture transactions.

---

## The Funding Round Stack

A South African funding round typically involves:

1. **Term Sheet / Letter of Intent (LOI)** — Non-binding summary of deal terms; sets the commercial framework before legal costs are incurred
2. **Subscription Agreement** — The primary investment contract; governs the issue of new shares
3. **Amended MOI** — Updates the company's Memorandum of Incorporation to reflect new share classes and rights
4. **Shareholders' Agreement (SHA)** — Governs the relationship between all shareholders post-investment
5. **CIPC filings** — Share issuances, director changes, MOI amendments filed with CIPC

In early-stage rounds, **SAFE notes** (Simple Agreement for Future Equity) or **convertible loan notes** are increasingly used to defer valuation negotiations until a priced round.

---

## The Term Sheet

A term sheet is non-binding (except for exclusivity and confidentiality clauses) but sets the terms that will appear in definitive documents. Fight hard here — it is much harder to renegotiate once definitive documents are being drafted.

### Valuation

**Pre-money valuation**: The company's value before the investment. If the pre-money valuation is R20m and the investor puts in R5m, the post-money valuation is R25m and the investor owns 20%.

**Post-money valuation** = Pre-money valuation + Investment amount

**Dilution**: Every new share issued dilutes existing shareholders proportionally. A fully diluted cap table shows dilution including all option pools, convertible notes, and warrants.

**Option pool shuffle**: Investors often require an option pool to be created or topped up **before** their investment (pre-money), which dilutes founders but not the investor. Negotiate for the option pool to be created post-money or sized only for the immediate 12-month hiring plan.

### Share Classes

South African investment rounds commonly use **preference shares** (not ordinary shares):

| Feature | Ordinary Shares | Preference Shares |
|---------|-----------------|-------------------|
| Voting | Yes (1 vote per share) | Often non-voting or limited |
| Dividends | Discretionary | Priority (often non-cumulative at early stage) |
| Liquidation | Residual | Priority return before ordinary shareholders |

**Liquidation preference**: The investor receives their investment back (and sometimes a multiple) before ordinary shareholders in a liquidation or exit. Types:
- **Non-participating preferred**: Investor gets their money back OR converts to ordinary shares for a proportional share — whichever is higher. Founder-friendly.
- **Participating preferred**: Investor gets their money back AND THEN participates pro-rata in remaining proceeds with ordinary shareholders. Founder-unfriendly — avoid or cap participation.
- **2x liquidation preference**: Investor gets 2x their investment back before founders see anything — common in downrounds and distressed raises; red flag in normal rounds.

### Anti-dilution

Protects investors if new shares are issued at a lower valuation (a "down round"):
- **Full ratchet**: Investor's price resets to the new lower price — extremely punitive for founders
- **Broad-based weighted average**: The adjustment reflects the actual dilution impact. Market standard. Accept this; resist full ratchet.
- **Narrow-based weighted average**: Partially founder-friendly variant; sometimes negotiable

### Protective Provisions (Investor Vetoes)

Investors typically require shareholder approval (via preference share vote) for:
- New share issuances
- Debt above a threshold
- Changes to the MOI affecting preference share rights
- Acquisitions or disposals above a threshold
- Liquidation or winding up
- Changes to the business (pivot)

**Founders' position**: Accept protective provisions for material transactions (the list above is reasonable). Resist provisions that would require investor consent for operational decisions (hiring above a salary, any new contract above R500k, etc.).

### Board Composition

Investors typically negotiate board representation:
- **Seed round**: Observer rights (attend, no vote) or one board seat
- **Series A**: One board seat (sometimes two if investor owns >30%)
- **Majority investor**: May seek a majority or veto on the board

An independent director (acceptable to both parties) is valuable — breaks deadlocks and provides governance credibility.

---

## SAFE Notes and Convertible Loans

### SAFE Note (Simple Agreement for Future Equity)

Originated by Y Combinator. No maturity date, no interest. Converts to equity at the next priced round, typically at a discount or with a valuation cap.

**Discount**: SAFE holder converts at a discount to the price paid by the new investors (typically 15–25%). Rewards early risk.

**Valuation cap**: The SAFE converts at the lower of the cap or the new round price. Protects the SAFE holder if the company raises at a high valuation.

**Pro-rata rights**: SAFE holders may have the right to invest further in the next priced round to maintain their ownership percentage.

South African SAFEs require adaptation — the US SAFE contemplates Delaware corporations; a South African version must align with Companies Act share issuance mechanics.

### Convertible Loan Note

A loan with an interest rate (typically 8–15% per annum) that converts to equity at the next round (or a defined trigger). More common in South Africa than SAFEs due to familiarity.

**Maturity date**: If conversion has not occurred by maturity, the loan becomes repayable. This is leverage over the company — investors often use it to force a round or renegotiate terms.

**Conversion mechanics**: Must comply with Companies Act Section 43 (debentures) and require a board resolution to issue.

---

## Investor Rights (Post-Investment)

### Information Rights

Investors typically require:
- Monthly management accounts (within 15–20 business days of month-end)
- Annual audited financials (within 120 days of year-end)
- Annual budget (30 days before year-start)
- Notice of material events (litigation, key person departure, regulatory action)

**Threshold-based rights**: Minor investors (< 5–10%) often have information rights but no board rights. Negotiate thresholds to limit the administrative burden.

### Pre-emptive Rights (Anti-dilution — New Shares)

Before issuing new shares to third parties, existing investors have the right to subscribe for their pro-rata share at the same price. Standard and reasonable — accept this.

### Tag-Along and Drag-Along

- **Tag-along**: If a majority shareholder sells, the minority investor may sell their shares on the same terms. Protects minority investors.
- **Drag-along**: If shareholders representing a qualifying majority (e.g., 75%) agree to sell, they can compel the minority to sell on the same terms. Enables clean exits. Ensure the drag threshold is high enough that a single investor cannot drag the company into an unwanted sale.

### Right of First Refusal (ROFR)

Before selling shares to a third party, the seller must first offer them to existing shareholders (or the company) at the same price. Standard — accept it.

---

## Cap Table Management

The cap table tracks who owns what, on a fully diluted basis:

```
Founder A         30.0%  1,500,000 ordinary shares
Founder B         25.0%  1,250,000 ordinary shares
Investor X        20.0%  1,000,000 preference A shares (R5m @ R20m pre)
Employee pool     15.0%    750,000 unallocated options
Angel (SAFE)       5.0%    250,000 estimated (unconverted)
ESOP allocated     5.0%    250,000 options (vested + unvested)
─────────────────────────────────────────────────────
Total (fully diluted)    5,000,000 shares
```

**Fully diluted** means including all options (vested and unvested), warrants, unconverted SAFEs, and convertible notes as if they had all been exercised or converted today.

**Tool**: Use a spreadsheet with scenario modelling for each round. Free tools: Pulley (ZA-compatible), Carta (US-focused but usable).

---

## Founder Vesting

Investors almost universally require founder vesting — a mechanism that returns unvested founder shares to the company if the founder exits early.

**Standard vesting schedule**: 4 years, with a 1-year cliff.
- If founder leaves in year 1: 0% vested, 100% returned
- At the 1-year cliff: 25% vests immediately
- Thereafter: Monthly vesting over the remaining 36 months

**Good leaver / bad leaver**:
- **Good leaver** (retrenchment, serious illness): Keeps vested shares; unvested may be bought at fair market value
- **Bad leaver** (resignation, misconduct, breach): Keeps only vested shares; unvested returned at cost (or nominal value)

---

## South Africa-Specific Issues

### Exchange Control (SARB)

Issuing shares to non-resident investors requires South African Reserve Bank (SARB) approval via an Authorised Dealer (commercial bank). Required before the shares are issued. File Form DP(a) (inward investment). Processing: 2–6 weeks.

### B-BBEE Impact

Foreign investment can reduce B-BBEE ownership scores. If the company sells products or services to government or state-owned entities, B-BBEE compliance is a commercial requirement. Model the B-BBEE impact of each investment round on your scorecard.

### Securities Transfer Tax (STT)

Share transfers (not new issuances) attract STT at 0.25% of the market value of the shares transferred, collected by the transferring broker or party.

### SARS Section 8C

If shares are issued to employees (including founders) subject to restrictions (vesting conditions), Section 8C of the Income Tax Act defers the tax event until the restrictions lapse. Founder vesting shares fall under Section 8C — tax is triggered when shares vest, not when issued. Founders should be aware of the tax liability that arises with each vesting tranche.

---

## Term Sheet Red Flags

| Term | Risk | Negotiation Position |
|------|------|---------------------|
| Full ratchet anti-dilution | Catastrophic dilution in down round | Broad-based weighted average only |
| 2x participating liquidation preference | Founders get nothing until investor gets 2x + participates | Non-participating 1x at most |
| Investor approval for operational decisions | Loss of operational control | Restrict vetoes to material transactions only |
| Drag-along at 51% | Single investor can force a sale | Drag threshold ≥ 75% of all shareholders |
| No time limit on ROFR | Investor holds up any secondary sale | 20–30 business day exercise period |
| Pay-to-play without notice | Forced participation in future rounds or punitive conversion | Ensure notice period and negotiable threshold |
