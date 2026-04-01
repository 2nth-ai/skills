---
name: Digital Marketing
description: >
  (1) Digital channel strategy — SEO, SEM, paid social, email marketing,
  marketing automation, and multi-channel attribution.
requires:
  - mkt
improves: []
metadata:
  domain: mkt
  subdomain: digital
  maturity: stable
  jurisdiction: ZA
---

# Digital Marketing

Digital marketing is the practice of acquiring, engaging, and converting customers through digital channels. The discipline has fragmented into dozens of specialisms — but the Marketing Director needs to understand each channel well enough to set strategy, brief specialists, allocate budget intelligently, and hold agencies accountable for results.

---

## Search Engine Optimisation (SEO)

SEO is the practice of earning top rankings in organic search results for queries your target customers are actually typing.

### The three pillars of SEO

**1. Technical SEO** — Site structure, page speed, crawlability, mobile optimisation, structured data. Without this, content and links cannot do their job.

**2. On-page SEO** — Content quality, keyword alignment, title tags, meta descriptions, header structure, internal linking. Each page targets a primary keyword and supports related terms.

**3. Off-page SEO** — Backlinks from authoritative sites signal trust to Google. In SA: local news sites, BizCommunity, ITWeb, BusinessTech, Moneyweb — links from these carry real authority.

### SA SEO specifics
- Google dominates SA search (>95% market share) — Bing optimisation is not a priority
- `.co.za` domains have local authority signal; hreflang tags needed if targeting both SA and international
- Voice search growing rapidly in SA across lower-income demographics (SA's most accessed internet device is a mobile phone)
- Local SEO critical for any business with physical presence: Google Business Profile, consistent NAP (name/address/phone) across directories

### Keyword research process
1. Identify seed keywords (your product/service category + pain points)
2. Use Google Search Console + keyword tool to find volume and difficulty
3. Prioritise: high volume + low difficulty = quick wins; high volume + high difficulty = long game
4. Map keywords to content types (informational → blog; commercial → landing pages; transactional → product/service pages)

---

## Search Engine Marketing (SEM / Paid Search)

Google Ads is the most direct form of demand capture — you appear when someone is actively searching for what you sell.

### Campaign structure
- **Search campaigns**: Text ads triggered by keywords; highest intent, highest CPCs
- **Display campaigns**: Banner ads on Google Display Network; brand awareness and retargeting
- **Shopping campaigns**: Product listing ads; relevant for ecommerce only
- **Performance Max**: Automated campaign across all Google channels; requires significant conversion data to work well

### SA-specific SEM considerations
- CPCs in SA are lower than US/UK markets but increasing YoY
- ZAR budget planning: R50–R200 CPC for competitive B2B terms; R5–R50 for niche B2B
- Broad match now includes close variants — always layer with negative keywords to prevent waste
- Google Ads billing is in ZAR for SA accounts; currency risk if paying from foreign cards

### Account hygiene
- Negative keyword list: review search terms weekly in the first month, monthly thereafter
- Quality Score: affects CPC and ad position; improve by aligning ad copy to keyword and landing page to ad
- Conversion tracking: must fire on actual conversions (form submission, purchase), not just page views

---

## Paid Social

Social advertising reaches audiences by demographics, interests, and behaviours rather than search intent.

### Platform selection for SA audiences

| Platform | Best use | SA context |
|----------|----------|-----------|
| LinkedIn | B2B targeting (job title, company size, industry) | Most effective B2B channel; expensive (R80–R300 CPM) |
| Facebook/Meta | Consumer, SMB, retargeting | Largest SA user base; strong for Facebook Groups and Marketplace adjacent audiences |
| Instagram | Visual brand building; consumer products | Growing in 18–35 urban SA demographic |
| TikTok | Youth audiences, consumer awareness | Rapidly growing; few SA B2B use cases yet |
| X/Twitter | Thought leadership amplification | Declining reach and ad effectiveness in SA |

### LinkedIn Ads specifics (most important for B2B)
- **Targeting**: Job title + company size + industry is the standard B2B layer; add seniority to exclude junior staff
- **Formats**: Sponsored Content (native feed posts) outperforms Message Ads in engagement; Conversation Ads (InMail-style) work for direct outreach
- **Budget**: LinkedIn minimum R100/day; recommended R500+/day for meaningful reach in SA
- **Lead Gen Forms**: Native form completion (no landing page) reduces friction; higher volume but lower quality than website form leads

---

## Email Marketing

Email is the highest ROI digital channel — it reaches an owned audience at negligible cost per send.

### List hygiene
- Clean your list quarterly: remove bounces, unsubscribes, and contacts inactive for 12+ months
- POPIA: all SA email lists must be opt-in; consent must be documented. Purchased lists are non-compliant
- **Soft opt-in exception**: POPIA allows marketing emails to existing customers for similar products/services without fresh consent — but unsubscribe must be immediate and simple

### Email types and cadence
| Type | Cadence | Purpose |
|------|---------|---------|
| Newsletter | Weekly or bi-weekly | Nurture, brand stay-top-of-mind |
| Promotional | Campaign-driven | Offers, launches, events |
| Nurture sequence | Automated | Convert leads → customers over time |
| Transactional | Event-triggered | Receipts, confirmations, onboarding |
| Re-engagement | Quarterly | Win back inactive contacts |

### Key metrics
- **Open rate**: Industry benchmark SA B2B 20–30%; below 15% means deliverability or relevance problem
- **CTR**: 2–5% B2B average; below 1% means content not compelling
- **Unsubscribe rate**: above 0.5% per send indicates mismatch between audience and content
- **Deliverability**: DKIM, DMARC, SPF records must be configured; check spam score before sends

---

## Marketing Automation

Marketing automation sequences messages based on behaviour — turning cold leads into warm pipeline without manual intervention.

**Core automation flows:**
1. **Lead capture → nurture sequence**: New lead fills a form → gets a 5-email educational series over 3 weeks → sales follow-up triggered if they engage
2. **Webinar follow-up**: Attendee vs no-show receive different sequences
3. **Trial / freemium nurture**: Day 1 welcome → Day 3 tip → Day 7 check-in → Day 14 upgrade prompt
4. **Win-back**: Inactive customer at 90 days → re-engagement email → special offer → at-risk flag to CSM

**Platform selection for SA teams**: HubSpot (most common in SA B2B), Mailchimp (SMB), ActiveCampaign (mid-market), Brevo (Sendinblue — lower cost for high volume). Salesforce Marketing Cloud for enterprise.

---

## Multi-Channel Attribution

Attribution answers: which marketing activities are actually driving revenue?

**Common models:**
| Model | Logic | When to use |
|-------|-------|------------|
| First touch | 100% credit to first channel | Brand awareness measurement |
| Last touch | 100% credit to last channel | Conversion-focused campaigns |
| Linear | Equal credit to all touches | Understanding full journey |
| Time decay | More credit to recent touches | Short sales cycles |
| Data-driven | ML-based; requires volume | Mature, high-volume programs |

**SA attribution challenges:**
- B2B sales cycles of 3–9 months mean attribution windows are often too short
- Dark social (WhatsApp, private Slack groups) is a major SA distribution channel that is invisible to attribution tools
- Phone calls and in-person introductions are common first touches in SA B2B — track with call tracking tools and CRM source fields

**What good attribution looks like**: A report showing pipeline and revenue by source, by campaign, and by channel — with enough confidence to make budget allocation decisions.
