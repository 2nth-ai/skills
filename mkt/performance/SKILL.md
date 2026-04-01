---
name: Performance Marketing & Analytics
description: >
  (1) Marketing metrics, CAC/LTV analysis, attribution, ROI measurement,
  and data-driven budget allocation across channels.
requires:
  - mkt
improves: []
metadata:
  domain: mkt
  subdomain: performance
  maturity: stable
  jurisdiction: ZA
---

# Performance Marketing & Analytics

Performance marketing is marketing held accountable to commercial outcomes — not impressions, not likes, not brand sentiment, but pipeline and revenue. The Marketing Director must own the measurement framework and be able to walk the CFO through how every rand of marketing budget converts to profit.

> Penny drafts marketing measurement frameworks and interprets data. For complex marketing mix modelling or attribution infrastructure, work with a data analyst or specialist agency.

---

## The Marketing Funnel Metrics

### Awareness to Revenue

```
Awareness (reach, impressions)
    ↓
Website visitors
    ↓
Leads (MQLs — Marketing Qualified Leads)
    ↓
Sales Qualified Leads (SQLs)
    ↓
Opportunities
    ↓
Closed/Won (Revenue)
```

**Key ratios to track at each conversion:**
- Visitor → Lead conversion rate: 1–3% typical for B2B; above 5% is excellent
- MQL → SQL rate: 20–40% typical; below 10% indicates lead quality problem
- SQL → Opportunity: 50–70%
- Opportunity → Won: 20–40% for healthy B2B pipeline

**If any ratio is dramatically below benchmark**, that stage is the constraint. Fix the bottleneck before adding budget upstream.

---

## Customer Acquisition Cost (CAC)

**Formula:**
```
CAC = Total Marketing + Sales Spend (period)
      ──────────────────────────────────────
      New Customers Acquired (same period)
```

Include in marketing spend: agency fees, ad spend, tools/software, content production, events, team salaries (fully loaded).

**CAC by channel** is more useful than blended CAC — it tells you where to put the next rand:

| Channel | Typical CAC (B2B SA — indicative) | Strength |
|---------|-----------------------------------|---------|
| Inbound SEO | Low (R500–R5,000) | Scales without proportional cost increase |
| Content / thought leadership | Medium-low (R1,000–R8,000) | Long payback; durable lead source |
| Paid search | Medium (R2,000–R15,000) | Immediate; scales with budget |
| LinkedIn Ads | High (R5,000–R40,000) | Best targeting precision for B2B |
| Events / in-person | Variable (R5,000–R80,000+) | High quality; hard to scale |
| Referral / word of mouth | Very low (R0–R2,000) | Cannot be fully manufactured |

---

## Customer Lifetime Value (LTV)

**Formula (SaaS/subscription):**
```
LTV = (Average Monthly Revenue per Customer × Gross Margin %)
      ──────────────────────────────────────────────────────
      Monthly Churn Rate
```

**Formula (transactional):**
```
LTV = Average Order Value × Purchase Frequency × Average Customer Lifespan
```

### CAC:LTV Ratio
The single most important ratio in growth marketing:

| Ratio | Interpretation | Action |
|-------|---------------|--------|
| < 1:1 | Destroying value — each customer costs more to acquire than they generate | Stop growth; fix unit economics |
| 1:1 – 1:3 | Marginal — sustainable only with very fast payback | Optimise before scaling |
| 1:3 | Healthy — rule of thumb benchmark for SaaS | Scale with confidence |
| > 1:5 | Excellent — under-investing in growth | Increase acquisition spend |

**CAC Payback Period**: How many months before the customer revenue covers the CAC.
- SaaS target: 12–18 months
- Above 24 months: working capital risk (need to fund the gap)

---

## Marketing ROI and Attribution

### Revenue Attribution Models

**Marketing-sourced pipeline**: All revenue opportunities where marketing was the first touch. Most defensible metric for proving marketing's top-of-funnel value.

**Marketing-influenced pipeline**: All opportunities where marketing touched the buyer at any point. Includes sales-sourced deals where the buyer read a blog, attended a webinar, or clicked a retargeting ad. Always larger than sourced; harder to defend.

**Revenue**: The ultimate attribution. Marketing rarely gets sole credit for a closed deal — but the discipline should be able to show its contribution through:
1. Pipeline contribution (sourced + influenced)
2. Win rate difference (deals with marketing touches vs without)
3. Sales cycle length (marketing-touched deals close faster — measure this)

### Practical Attribution in SA B2B
Challenges:
- Long sales cycles (3–18 months) exceed most attribution windows
- Multiple buyers in a committee decision
- Dark social (WhatsApp introductions, word-of-mouth referrals) has no attribution
- In-person events convert well but are hard to attribute digitally

Solutions:
- UTM parameters on all digital assets (consistent naming convention enforced)
- Lead source field in CRM (captured at first touch; never overwritten)
- "How did you hear about us?" on all forms — qualitative but catches dark social
- Self-reported attribution: ask customers at close "What actually led you to us?"

---

## Marketing Dashboard

**Weekly metrics (fast-moving signals):**
- Website sessions + traffic source breakdown
- Leads generated by channel
- Ad spend vs budget
- Email campaign performance (if sent)

**Monthly metrics (performance review):**
- CAC by channel
- MQL and SQL volume and quality (SQL rate from each channel)
- Pipeline added (marketing-sourced and influenced)
- Content performance (top 10 pages by traffic and leads)
- Paid channel efficiency (CPL, CPA by platform)

**Quarterly metrics (strategy):**
- LTV:CAC by cohort
- Brand health indicators (NPS, search volume, share of voice)
- CAC payback period trends
- Budget allocation vs results (which channels deserve more/less next quarter)

---

## Budget Planning

### Budget allocation framework

A practical starting framework for B2B marketing budget:

| Category | % of budget | Notes |
|----------|-------------|-------|
| Paid acquisition (search, social, retargeting) | 25–35% | Scales immediately; stops when budget stops |
| Content and SEO | 15–25% | Compounds over time; long-term investment |
| Events and field marketing | 10–20% | High quality in SA; must be selective |
| Tools and technology | 8–12% | CRM, automation, analytics, design tools |
| Brand and creative | 10–15% | Agency or in-house production |
| PR and comms | 5–10% | Earns media; amplifies content |
| Reserve / test budget | 5–10% | Experiments; never fully committed upfront |

### Budget conversations with the CFO
- Frame marketing spend as an investment with a return, not a cost centre
- Present CAC by channel, LTV:CAC ratio, and payback period
- Request budget increments based on demonstrated channel ROI, not historical precedent
- Marketing budget as % of revenue benchmark: early-stage growth 15–25%; established business 8–15%; maturity 5–10% (SA B2B typical)

---

## MarTech Stack Essentials

The marketing technology stack for a growing SA business:

| Layer | Tool options | Purpose |
|-------|-------------|---------|
| CRM | HubSpot, Salesforce, Pipedrive | Source of truth for leads and pipeline |
| Marketing automation | HubSpot, ActiveCampaign, Brevo | Email nurture, lead scoring |
| Analytics | Google Analytics 4, Mixpanel | Website and product behaviour |
| Paid ads | Google Ads, Meta Ads Manager, LinkedIn Campaign Manager | Paid acquisition |
| SEO | Ahrefs, SEMrush, Search Console | Keyword tracking, site audit |
| Social scheduling | Buffer, Hootsuite, Sprout Social | Content calendar management |
| Design | Figma, Canva | Creative production |
| Reporting | Looker Studio (free), Databox | Dashboard consolidation |

**SA martech consideration**: Most tools bill in USD — budget for ZAR/USD exchange rate risk, especially for enterprise tools (Salesforce, HubSpot Marketing Hub). Local alternatives exist for some categories (e.g., local email tools) but rarely match functionality.
