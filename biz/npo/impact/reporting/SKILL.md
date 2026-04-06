---
name: biz/npo/impact/reporting
description: |
  NPO impact dashboard and donor report generation. Use this skill when:
  (1) building configurable impact dashboards with mission metrics,
  (2) generating per-donor impact reports showing what their funding achieved,
  (3) creating public impact pages shareable with prospective funders,
  (4) producing quarterly or annual impact summaries with charts and case studies.
license: MIT
compatibility: Cloudflare Workers + D1 + Claude API
homepage: https://skills.2nth.ai/biz/npo/impact/reporting
repository: https://github.com/2nth-ai/skills
requires:
  - tech/cloudflare/workers
  - tech/cloudflare/d1
  - tech/cloudflare/ai/ai-gateway
  - data/analysis
improves:
  - biz/npo/impact
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Impact Reporting, Dashboards, Donor Reports, Metrics"
allowed-tools: Bash(curl:*) Read Write Edit Glob Grep
---

# Impact Reporting

Generate impact reports from structured metrics and case study data. Two audiences: internal dashboards and donor-facing reports.

## Data Model

```sql
CREATE TABLE impact_metrics (
  id TEXT PRIMARY KEY,
  metric_name TEXT NOT NULL,      -- 'Missions Flown' | 'Species Monitored' | 'Conservation Value'
  metric_value TEXT NOT NULL,     -- '1047' | 'R70,000,000'
  metric_unit TEXT,               -- 'missions' | 'ZAR' | 'species' | 'hectares'
  period TEXT,                    -- 'lifetime' | '2025' | '2025-Q1'
  category TEXT,                  -- 'missions' | 'species' | 'environmental' | 'community'
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE case_studies (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  full_content TEXT,
  impact_area TEXT,               -- 'environmental' | 'wildlife' | 'community'
  species TEXT,
  location TEXT,
  image_key TEXT,                 -- R2 object key
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
```

## Donor Report Generation

```typescript
async function generateDonorReport(funderId: string, period: string, env: Env): Promise<string> {
  const funder = await getFunder(funderId, env);
  const pipeline = await getPipelineEntry(funderId, env);
  const metrics = await env.DB.prepare(
    'SELECT * FROM impact_metrics WHERE period = ? OR period = ?'
  ).bind(period, 'lifetime').all();
  const cases = await env.DB.prepare(
    'SELECT * FROM case_studies ORDER BY created_at DESC LIMIT 3'
  ).all();

  const prompt = `Generate a donor impact report for ${funder.name}.

Their contribution: R${pipeline.committed_value}
Period: ${period}
Organisation metrics: ${JSON.stringify(metrics.results)}
Recent case studies: ${cases.results.map((c: any) => `${c.title}: ${c.summary}`).join('\n')}

Structure:
1. Thank you and acknowledgment
2. What their funding achieved (specific, quantified)
3. 2-3 impact highlights from this period
4. Looking ahead — what's next
5. Closing with invitation to continue partnership

Tone: Appreciative, evidence-based, specific. No vague claims.`;

  // Call Claude API via AI Gateway...
  return generatedReport;
}
```

## Public Impact Page

Unauthenticated page at `/impact` showing:
- Key metrics (configurable grid)
- Case study carousel
- Multiplier effect calculator
- "Support us" CTA with Section 18A mention

## Common Gotchas

- **Don't report what you can't prove**: Every metric must trace to a data source. "We saved 500 rhinos" needs to link to mission logs.
- **Period matters**: Separate lifetime metrics from current-period metrics. A donor wants to know what happened with *their* money, not your 25-year total.
- **Images sell impact**: Case studies with aerial photography convert donors. Always include visuals when available.

## See Also

- [biz/npo/impact/case-studies](../case-studies/SKILL.md) — Case study creation
- [biz/npo/impact/multiplier](../multiplier/SKILL.md) — ROI calculator
- [data/visualisation](../../../data/visualisation/SKILL.md) — Dashboard design
