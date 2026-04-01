---
name: Non-Monolithic Trading Platforms
description: >
  Architecture patterns for composable, microservices-based capital markets platforms —
  the shift away from monolithic front-to-back systems, FM Converge as a reference
  implementation, FRTB/SA-CCR/XVA regulatory modules, and how banks evaluate
  and adopt next-generation trading infrastructure.
requires:
  - fin/capital-markets
improves: []
metadata:
  domain: fin
  subdomain: capital-markets
  maturity: stable
---

# Non-Monolithic Trading Platforms

For three decades, capital markets technology was dominated by large monolithic platforms: single-vendor front-to-back systems that handled pricing, trading, risk, operations, and accounting in a tightly coupled stack. These systems (Murex MX.3, Calypso, Finastra Fusion, OpenLink) delivered deep functionality but extracted a high price — years-long implementations, nine-figure total costs, upgrade cycles measured in years, and near-total vendor lock-in.

The industry is now in a structural shift toward **composable, service-oriented trading architectures** — platforms built as independently deployable, replaceable modules that banks can assemble, mix, and evolve without replacing the entire stack.

---

## Why Monolithic Platforms Are a Strategic Liability

| Problem | Monolith Impact | Business Consequence |
|---------|----------------|---------------------|
| **Upgrade coupling** | Change one module → regression risk across entire system | Banks skip upgrades for years; accumulate tech debt |
| **Regulatory lag** | FRTB/SA-CCR requires bespoke vendor patch | Time-to-compliance measured in quarters, not weeks |
| **New product onboarding** | New instrument type → change request to vendor → wait 6–18 months | Competitive disadvantage; revenue foregone |
| **Cloud migration** | Monolith designed for on-prem; cloud lift-and-shift is expensive and fragile | Infrastructure costs remain high; elasticity impossible |
| **Vendor lock-in** | All data, models, and workflows inside proprietary schema | No leverage in contract negotiations; exit costs prohibitive |
| **Talent** | Vendor-specific skills required | Thin talent pool; high consultant day rates |
| **AI integration** | Proprietary data model blocks external AI tooling | Banks can't apply their own ML to their own trading data |

**The compounding problem**: Monolithic vendors offer upgrades and extensions — but at the cost of further lock-in. Each customisation makes the next upgrade harder. The technical debt is structural, not incidental.

---

## The Composable Trading Platform Architecture

A composable trading platform decomposes the traditional monolith into independently deployable, loosely coupled services aligned to business capabilities.

### Logical Service Decomposition

```
┌─────────────────────────────────────────────────────────────┐
│                      Front Office                           │
│  Pricing Engine │ Structuring │ Order Management │ e-Dealing│
├─────────────────────────────────────────────────────────────┤
│                      Middle Office                          │
│  Position Keeping │ P&L │ Risk Engine │ Limit Monitoring   │
├─────────────────────────────────────────────────────────────┤
│                      Regulatory                             │
│  FRTB-SA │ FRTB-IMA │ SA-CCR │ XVA │ ISDA SIMM │ LCR/NSFR │
├─────────────────────────────────────────────────────────────┤
│                      Back Office                            │
│  Trade Confirmation │ Settlement │ Accounting │ Reconciliation│
├─────────────────────────────────────────────────────────────┤
│                      Data Layer                             │
│  Cross-Asset Data Model │ Market Data │ Reference Data      │
└─────────────────────────────────────────────────────────────┘
```

Each row is independently deployable. A bank can replace only the Pricing Engine without touching Settlement. The Data Layer is the critical shared substrate — every service speaks the same cross-asset data model.

### Cross-Asset Data Model (the foundation)

The monolith's core insight was correct: all financial instruments share common concepts — counterparty, notional, cashflow schedule, risk sensitivities. The composable equivalent is a **canonical cross-asset data model** that all services share via API contract, rather than a shared database.

```
Instrument
  → asset class (FX, RatesIR, Credit, Equity, Commodity, Crypto)
  → product type (Spot, Forward, Swap, Option, Structured)
  → cashflows[]
  → risk sensitivities (delta, gamma, vega, theta by risk factor)
  → lifecycle state (live, matured, cancelled, settled)

Book
  → instruments[]
  → positions (net per risk factor)
  → P&L (realised + unrealised)
  → limits[]
```

Services communicate through this model via event streams (Kafka) or REST/gRPC APIs. No service owns the canonical record — a golden-copy approach using event sourcing.

---

## FM Converge — Reference Implementation

**Finmechanics FM Converge** is the most advanced production example of a non-monolithic capital markets platform. It is the platform to reference when explaining composable trading architecture to a bank.

### What FM Converge Is

FM Converge is a cross-asset front-to-back-to-risk platform built natively on a microservices architecture. Unlike vendors who refactored monoliths into "micro" services, FM Converge was designed service-first from the ground up.

**Vendor profile**: Finmechanics Pte. Ltd., Singapore. Founded to address the failure modes of traditional capital markets vendors. Ranked in the **Chartis Quantitative Analytics 50** (top 15, 2025). Clients include Swiss cantonal banks, African CIBs, regional banks across APAC, Middle East, and Africa.

### FM Converge Capability Map

| Module | Description |
|--------|------------|
| **Pricing Engine** | Cross-asset derivatives pricing; supports vanilla and structured products; FX, rates, credit, equity, commodity, crypto |
| **Pre-trade Analytics** | Real-time what-if pricing, structuring, scenario analysis before trade capture |
| **Trade Capture** | Cross-asset trade booking with full lifecycle management |
| **Position Keeping** | Real-time position aggregation per book, trader, entity, across all asset classes |
| **P&L Engine** | Real-time and end-of-day P&L with full attribution (market, carry, theta, new trades) |
| **Risk Engine** | VaR, Expected Shortfall, sensitivity Greeks (delta, gamma, vega, vanna, volga), stress testing |
| **FRTB-SA** | Standardised approach for market risk capital under BCBS 457 / CRR3 |
| **FRTB-IMA** | Internal models approach; NMRF, P&L Attribution test, back-testing |
| **SA-CCR** | Standardised approach for counterparty credit risk; replacement cost + PFE |
| **XVA** | CVA, DVA, FVA, MVA, KVA — valuation adjustments with full sensitivities |
| **ISDA SIMM** | Standard Initial Margin Model for uncleared OTC derivatives |
| **Collateral Management** | Margin calls, CSA management, collateral optimisation |
| **Back Office** | Trade confirmation, settlement instructions, nostro reconciliation |
| **Accounting** | P&L booking, hedge accounting, IFRS 9 / IAS 39 |
| **FM Connect** | e-Dealing portal — web-based front-end for FX, rates, and derivatives distribution to clients |

### The Key Differentiator: Independent Module Deployment

Each module above can be deployed independently or as a complete suite. A bank that already has a back office system it doesn't want to replace can deploy only the Pricing + Risk + FRTB modules. This **minimum-disruption** implementation model is the commercial breakthrough.

```
Traditional vendor:   Replace everything → 3-year project → $30M+
FM Converge model:    Replace only the risk and FRTB layer → 6-month project → fraction of cost
```

Real-world example: Luzerner Kantonalbank (Switzerland's 3rd-largest cantonal bank) implemented FM Converge in 2024 replacing only their position management and risk system. Structured products and FRTB modules followed in subsequent phases. The bank was live on risk and VaR within months.

### Cloud Architecture

FM Converge is available on **Azure Marketplace** (hosted managed service). Deployment options:

| Mode | Description | Best For |
|------|------------|---------|
| **SaaS (managed)** | Finmechanics operates the platform; bank connects via API | Smaller banks; rapid deployment; minimal IT overhead |
| **Private cloud** | Deployed in bank's Azure/AWS tenant; Finmechanics manages application layer | Mid-tier banks needing data sovereignty |
| **On-premises** | Full bank infrastructure; Finmechanics provides software + support | Tier 1 banks; regulatory data residency requirements |

**South Africa**: FM Converge deployed on Azure South Africa North (Johannesburg) satisfies SARB data residency requirements and achieves sub-10ms latency to JSE and SA bank trading desks.

---

## FM Connect — e-Dealing for Banks

FM Connect is the client-facing web-dealing portal, separate from but integrated with FM Converge.

| Feature | Detail |
|---------|--------|
| **Asset classes** | FX Spot/Forward/Swap/Options, Fixed Income, Derivatives |
| **Client types** | Corporate treasuries, fund managers, institutional clients |
| **Distribution** | Bank prices and distributes structured products to clients via portal |
| **Integration** | Connects to FM Converge for live pricing; STP to back office |
| **Whitelabel** | Banks brand the portal as their own |

FM Connect addresses the competitive gap where banks lose FX and derivatives business to larger global banks that offer better digital dealing experiences. A tier-2 bank in Johannesburg can offer real-time FX and rates pricing equivalent to a global tier-1 bank's portal within months.

---

## Regulatory Capital Modules — What Banks Actually Need

The regulatory capital requirements under Basel III/IV (FRTB, SA-CCR, ISDA SIMM) are the burning platform forcing banks off legacy systems. The old systems were not designed for these calculations.

### FRTB (Fundamental Review of the Trading Book — BCBS 457)

FRTB replaced the Basel 2.5 market risk framework. Live in the EU (CRR3) from January 2025; SA implementation expected via SARB 2025–2026.

**Standardised Approach (SA)**: Rule-based capital calculation using sensitivity-based method (SBM), default risk charge (DRC), residual risk add-on (RRAO). Every bank must compute this floor.

**Internal Models Approach (IMA)**: Advanced banks can use internal VaR/ES models subject to P&L Attribution Test and back-testing requirements. Significantly lower capital charges if models pass — the commercial incentive is enormous.

**The problem with monolithic vendors**: FRTB SA requires instrument-level sensitivities across hundreds of risk factors, aggregated under specific correlation scenarios. Monoliths built pre-FRTB require full re-engineering of their risk engines — which then destabilises the rest of the platform.

**FM Converge approach**: FRTB-SA and FRTB-IMA are standalone services. They consume positions and sensitivities from the risk engine via API. No dependency on the trade capture or pricing layers — deployable standalone.

### SA-CCR (Standardised Approach for Counterparty Credit Risk)

Replaced CEM (Current Exposure Method) and SM (Standardised Method) under Basel III. Calculates EAD (Exposure at Default) for OTC derivatives, exchange-traded derivatives, and SFTs.

```
EAD = alpha × (RC + PFE_multiplier × AddOn_aggregate)

alpha = 1.4
RC = Replacement Cost (mark-to-market + variation margin)
PFE = Potential Future Exposure (asset class AddOns by netting set)
```

SA-CCR requires **netting set** awareness — offsetting positions within a legally enforceable netting agreement reduce capital. Monolithic systems often lack the netting set data model, making SA-CCR retrofitting expensive.

### XVA (Valuation Adjustments)

XVA is the umbrella term for valuation adjustments that reflect the real-world costs and risks of trading:

| Adjustment | Driver | Direction |
|-----------|--------|----------|
| **CVA** — Credit Valuation Adjustment | Counterparty default risk | Reduces asset value |
| **DVA** — Debit Valuation Adjustment | Own default risk | Increases liability value |
| **FVA** — Funding Valuation Adjustment | Cost of funding uncollateralised trades | Reduces trade value |
| **MVA** — Margin Valuation Adjustment | Cost of posting initial margin | Reduces trade value |
| **KVA** — Capital Valuation Adjustment | Cost of regulatory capital held | Reduces trade value |

**XVA desks** at large banks manage these adjustments as a P&L centre. Computing XVA requires Monte Carlo simulation of counterparty exposure across thousands of scenarios — computationally intensive, requiring GPU or distributed compute. FM Converge's XVA module is designed for cloud-scaled computation.

### ISDA SIMM (Standard Initial Margin Model)

For bilateral OTC derivatives not cleared through a CCP. SIMM is the industry-standard model (ISDA, 2016; updated annually). Banks exchange initial margin based on SIMM calculations — getting it wrong means posting too much or too little margin, with regulatory and liquidity consequences.

---

## Evaluation Framework — How a Bank Should Assess a Trading Platform

### Build vs Buy vs Compose Decision

| Approach | When Viable | Risk | Cost |
|---------|------------|------|------|
| **Monolith (full vendor)** | Greenfield with no existing systems | High lock-in | $10M–$100M+ |
| **In-house build** | Tier 1 bank with 500+ quant devs | High execution risk | $50M–$500M over 10 years |
| **Composable (best-of-breed)** | Existing systems; incremental replacement | Medium integration effort | $1M–$20M per module |
| **SaaS microservices (FM Converge model)** | Regional/mid-tier banks; rapid deployment | Operational dependency on vendor | $500K–$5M/year |

For African and emerging-market banks, the **composable SaaS model** is the right answer: world-class pricing and risk infrastructure without the capital outlay or headcount to build and maintain it.

### RFP Criteria for a Non-Monolithic Platform

When a bank evaluates a trading platform, these criteria distinguish composable from monolithic:

| Criterion | Monolith Red Flag | Composable Green Flag |
|----------|-----------------|----------------------|
| Can we deploy only the risk module? | "The platform is fully integrated" | Independent module deployment confirmed |
| What is our exit path? | Data export only via vendor tools | Open APIs; standard data formats; event stream access |
| How do we add a new instrument type? | Change request + release cycle | Configuration or model plugin; no core change |
| FRTB compliance path? | Upgrade scheduled for 2026 | Standalone regulatory service; live today |
| Cloud deployment? | "Cloud-ready roadmap" | Live on Azure/AWS Marketplace now |
| Data model? | Proprietary schema; vendor documentation only | Published API spec; cross-asset canonical model |
| Integration with our existing systems? | Requires full data migration | API-first; connects to existing DWH and settlement |

### Total Cost of Ownership — Composable vs Monolith

```
Monolith (10-year TCO estimate, mid-tier bank):
  Licence/subscription:     $2M–$5M/year
  Implementation:           $10M–$30M (years 1–3)
  Upgrades/customisation:   $1M–$3M/year ongoing
  Internal headcount:       5–15 FTE platform engineers
  Total 10-year:            $50M–$120M

Composable SaaS (FM Converge, same bank):
  Subscription:             $500K–$2M/year (modules selected)
  Implementation:           $500K–$3M (6–12 months)
  Upgrades:                 Included; continuous delivery
  Internal headcount:       2–5 FTE (focus on business config, not platform)
  Total 10-year:            $8M–$25M
```

The TCO gap is the most powerful argument for composable architecture in bank boardrooms.

---

## The African Bank Opportunity

African banks face a specific structural opportunity: they can **leapfrog** the legacy technology trap that European and North American banks are stuck in.

A South African or East African CIB that has never deployed a full Murex or Calypso stack can launch with FM Converge + FM Connect and operate with better technology infrastructure than a European bank that spent 15 years implementing its monolith and is now locked in.

### Specific African Market Considerations

**South Africa (SARB / FSCA regulation)**:
- FRTB implementation timeline: SARB aligning to Basel IV; expected 2025–2027 phased
- IFRS 9 hedge accounting: all SA banks live; FM Converge accounting module supports
- Data residency: Azure South Africa North satisfies SARB requirements
- JSE connectivity: FM Converge integrates with JSE equity and derivatives markets
- SWIFT connectivity: FM Connect integrates with SWIFT for cross-border payments and confirmations

**East Africa (Kenya, Uganda, Tanzania)**:
- CBK (Central Bank of Kenya) Basel III implementation ongoing
- Regional banks expanding cross-border — need cross-currency FX and rates capability
- FM Connect's e-dealing portal addresses the gap in corporate FX distribution

**West Africa (Nigeria, Ghana)**:
- CBN (Central Bank of Nigeria) increasing capital requirements; FRTB on horizon
- Lagos as regional financial centre — increasing derivatives sophistication

**The Andile Solutions partnership** positions FM Converge specifically for this market: Andile provides SA regulatory knowledge, JSE connectivity expertise, and implementation capacity. The first major SA CIB implementation (derivatives pricing replacement at a major South African corporate and investment bank) is already complete.

---

## Integration Architecture

### How FM Converge Connects to Existing Bank Systems

```
Market Data Vendors (Bloomberg, Refinitiv)
    ↓ market data feed
FM Converge Pricing & Risk ←→ Bank's Trade Capture (if existing)
    ↓ positions, P&L, risk    ↓ STP
    ↓                     Settlement System
    ↓ regulatory capital
FRTB / SA-CCR / XVA modules
    ↓ capital charges
SARB / FSCA Regulatory Reporting
    ↓ risk data
Bank's Data Warehouse / BI Layer (Snowflake, Azure Synapse)
```

**Key integration points**:
- **FIX protocol** for order management and trade capture
- **REST/gRPC APIs** for real-time risk queries and position queries
- **Kafka event streams** for real-time P&L and position updates
- **SWIFT MX/ISO 20022** for confirmation and settlement instructions
- **S3/Azure Blob** for batch regulatory reporting outputs (FRTB SA capital reports)

### AI Integration Pattern

FM Converge's API-first architecture enables AI augmentation that is impossible on monolithic platforms:

```python
# Example: AI-assisted pre-trade risk check
async def pre_trade_check(trade: Trade) -> RiskDecision:
    # Fetch real-time position from FM Converge API
    current_position = await fm_converge.get_position(
        book=trade.book, risk_factor=trade.risk_factor
    )

    # Fetch regulatory capital impact
    incremental_capital = await fm_converge.frtb_sa_incremental(trade)

    # AI risk decision (Claude via AI Gateway)
    decision = await claude.complete(
        prompt=f"""
        Trade: {trade.details}
        Current position: {current_position}
        Incremental FRTB capital: {incremental_capital}
        Available capital headroom: {capital_headroom}

        Recommend: approve / refer / reject with reasoning.
        """
    )
    return RiskDecision(decision)
```

This pattern — AI accessing live risk and position data via open APIs — is only possible when the trading platform exposes structured data. Monolithic platforms do not.

---

## Glossary

| Term | Definition |
|------|-----------|
| **FX Spot** | Exchange of currencies at current market rate, settling T+2 |
| **FX Forward** | Agreement to exchange currencies at a fixed rate on a future date |
| **FX Swap** | Near-leg spot + far-leg forward in opposite direction |
| **Cross-Currency Swap** | Exchange of principal and interest in different currencies |
| **IRS** | Interest Rate Swap — fixed rate vs floating rate in same currency |
| **VaR** | Value at Risk — loss threshold not exceeded with X% confidence over Y days |
| **ES** | Expected Shortfall (CVaR) — average loss in worst-case scenarios beyond VaR |
| **Greeks** | Sensitivities: Delta (price), Gamma (delta change), Vega (vol), Theta (time), Rho (rate) |
| **FRTB** | Fundamental Review of the Trading Book — Basel IV market risk capital framework |
| **SA-CCR** | Standardised Approach for Counterparty Credit Risk — EAD calculation method |
| **XVA** | Valuation Adjustments (CVA, DVA, FVA, MVA, KVA) |
| **ISDA SIMM** | Standard Initial Margin Model — bilateral OTC initial margin calculation |
| **STP** | Straight-Through Processing — automated trade flow from capture to settlement |
| **NMF** | Non-Modellable Risk Factor — FRTB IMA category for illiquid risk factors |
| **Netting set** | Group of trades subject to a legally enforceable netting agreement |
| **CSA** | Credit Support Annex — ISDA schedule governing collateral posting |
| **DRC** | Default Risk Charge — FRTB component for default/migration risk in trading book |
| **P&L Attribution** | FRTB IMA test comparing desk P&L to risk-theoretical P&L |
