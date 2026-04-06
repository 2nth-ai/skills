---
name: biz/npo/impact/case-studies
description: |
  Structured impact case study creation for NPOs. Use this skill when:
  (1) creating case studies from mission data, photos, and outcomes,
  (2) tailoring case study presentation for different funder audiences,
  (3) building a case study library that feeds into pitch generation.
license: MIT
homepage: https://skills.2nth.ai/biz/npo/impact/case-studies
repository: https://github.com/2nth-ai/skills
requires:
  - tech/cloudflare/workers
  - tech/cloudflare/r2
improves:
  - biz/npo/impact
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Case Studies, Impact Stories, Conservation, Storytelling"
allowed-tools: Read Write Edit Glob Grep
---

# Impact Case Studies

Structured format for NPO impact stories. Each case study is a reusable asset referenced by the funder matching and pitch generation skills.

## Case Study Schema

```typescript
interface CaseStudy {
  id: string;
  title: string;           // "Gorongosa Wild Dog Repopulation"
  summary: string;          // 2-3 sentence overview
  full_content: string;     // Full narrative (500-800 words)
  impact_area: 'environmental' | 'wildlife' | 'community';
  species?: string;         // "African Wild Dog" | "Wattled Crane"
  location: string;         // "Gorongosa, Mozambique"
  year: number;
  outcome: string;          // Quantified result
  image_key?: string;       // R2 key for hero image
  tags: string[];           // ["rewilding", "cross-border", "endangered species"]
}
```

## Case Study Template

```markdown
# [Title]

**Location:** [Place, Country]
**Impact area:** [Wildlife / Environmental / Community]
**Period:** [Year or date range]

## Challenge
What problem existed? Why did it matter? (2-3 sentences)

## Mission
What did the NPO do? What was the aerial/operational contribution? (3-4 sentences)

## Outcome
What changed? Quantify the result. (2-3 sentences with numbers)

## Ongoing Impact
What is the lasting effect? Does it continue? (1-2 sentences)
```

## Common Gotchas

- **Quantify outcomes**: "We helped" is not a case study. "We flew 14 wild dogs 1,200km from South Africa to Gorongosa, reintroducing the species after 30 years" is.
- **Attribution matters**: Be precise about the NPO's role vs partners' roles. Don't claim sole credit for multi-org efforts.
- **Keep them current**: A case study from 2005 is history, not fundraising material. Prioritise recent (last 3-5 years) unless the historical case is foundational.

## See Also

- [biz/npo/fundraising/grant-writing](../../fundraising/grant-writing/SKILL.md) — Case studies referenced in pitches
- [biz/npo/impact/reporting](../reporting/SKILL.md) — Case studies in donor reports
