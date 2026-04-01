---
name: Capital Markets
description: >
  Capital markets domain manifest — trading, risk, pricing, and technology
  architecture for investment banks, treasury operations, and capital market divisions.
requires: []
improves:
  - fin
metadata:
  domain: fin
  subdomain: capital-markets
  maturity: stable
---

# Capital Markets

Capital markets is the domain where banks, asset managers, central banks, and corporates price, trade, risk-manage, and settle financial instruments. It spans front office (deal origination and pricing), middle office (risk and P&L), and back office (settlement, accounting, reconciliation).

## Sub-skills

| Path | Description |
|------|------------|
| `fin/capital-markets/trading-platforms` | Non-monolithic trading platform architecture, FM Converge, composable design |

## Domain Boundaries

- **In scope**: Trading systems, risk platforms, pricing models, derivatives, FX, fixed income, structured products, regulatory capital (FRTB, SA-CCR, XVA), post-trade processing
- **Out of scope**: Retail banking, mortgage lending, insurance, payments (these are separate domains)

## SA Capital Markets Context

South Africa's capital markets are regulated by the FSCA (Financial Sector Conduct Authority) and SARB (South African Reserve Bank). Key infrastructure: JSE (Johannesburg Stock Exchange) for equities and listed derivatives; BESA (Bond Exchange of South Africa, now part of JSE) for fixed income; SAFEX for commodity derivatives; ZARX and A2X as alternative exchanges.

**Tier 1 SA investment banks**: Standard Bank CIB, FirstRand (RMB), Absa CIB, Nedbank CIB, Investec. All operate proprietary trading desks, derivatives businesses, and treasury operations subject to Basel III/IV capital requirements and FRTB.
