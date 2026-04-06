---
name: biz/npo/fundraising/donor-pipeline
description: |
  Donor pipeline management for NPOs. Use this skill when:
  (1) tracking funders through stages from identification to funds received,
  (2) logging outreach activities, meetings, and follow-up tasks per funder,
  (3) calculating pipeline value (estimated vs committed),
  (4) generating pipeline reports and conversion analytics,
  (5) scheduling follow-up reminders based on pipeline stage and funder deadlines.
license: MIT
compatibility: Cloudflare Workers + D1
homepage: https://skills.2nth.ai/biz/npo/fundraising/donor-pipeline
repository: https://github.com/2nth-ai/skills
requires:
  - tech/cloudflare/workers
  - tech/cloudflare/d1
improves:
  - biz/npo/fundraising
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Pipeline, CRM, Donor Management, Fundraising Tracking"
allowed-tools: Bash(curl:*) Read Write Edit Glob Grep
---

# Donor Pipeline Management

Track funders through a structured pipeline. Each stage has clear entry criteria and expected actions.

## Pipeline Stages

```
New → Contacted → In Discussion → Committed → Received
```

| Stage | Entry Criteria | Expected Action | Typical Duration |
|-------|---------------|-----------------|-----------------|
| `new` | AI-matched, not yet contacted | Review match, decide to pursue | 1-2 weeks |
| `contacted` | First outreach sent | Wait for response, follow up at 7/14 days | 2-4 weeks |
| `in_discussion` | Active conversation (reply received, meeting held) | Present proposal, negotiate terms | 4-8 weeks |
| `committed` | Verbal or written commitment to fund | Complete paperwork, issue Section 18A | 2-4 weeks |
| `received` | Funds deposited | Send acknowledgment, begin reporting | — |

## Data Model

```sql
CREATE TABLE pipeline (
  id TEXT PRIMARY KEY,
  funder_id TEXT NOT NULL REFERENCES funders(id),
  status TEXT NOT NULL DEFAULT 'new',
  estimated_value INTEGER,
  committed_value INTEGER,
  next_step TEXT,
  next_date TEXT,
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE pipeline_events (
  id TEXT PRIMARY KEY,
  funder_id TEXT NOT NULL REFERENCES funders(id),
  event_type TEXT NOT NULL,  -- status_change | note | email_sent | meeting | deadline | follow_up
  from_status TEXT,
  to_status TEXT,
  note TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
```

## Pipeline Analytics

```typescript
async function getPipelineSummary(env: Env) {
  const stages = await env.DB.prepare(`
    SELECT
      p.status,
      COUNT(*) as count,
      SUM(COALESCE(p.committed_value, p.estimated_value, 0)) as total_value
    FROM pipeline p
    GROUP BY p.status
    ORDER BY CASE p.status
      WHEN 'received' THEN 0
      WHEN 'committed' THEN 1
      WHEN 'in_discussion' THEN 2
      WHEN 'contacted' THEN 3
      WHEN 'new' THEN 4
    END
  `).all();

  const conversion = await env.DB.prepare(`
    SELECT
      ROUND(100.0 * SUM(CASE WHEN status IN ('committed','received') THEN 1 ELSE 0 END) /
            NULLIF(SUM(CASE WHEN status != 'new' THEN 1 ELSE 0 END), 0), 1) as conversion_rate
    FROM pipeline
  `).first();

  return { stages: stages.results, conversionRate: conversion?.conversion_rate || 0 };
}
```

## Common Gotchas

- **Don't skip stages**: Moving a funder from `new` to `committed` without the intermediate steps loses the activity history. Log every interaction.
- **Estimated vs committed**: `estimated_value` is the AI's funding range midpoint. `committed_value` is only set when the funder confirms an amount. Never report estimated as committed.
- **Follow-up discipline**: The #1 reason NPOs lose fundable opportunities is failure to follow up. Surface overdue follow-ups prominently.
- **Activity logging is the memory**: With a 2-person team, institutional memory lives in the pipeline events. Log meeting notes, email summaries, and decisions religiously.

## See Also

- [biz/npo/fundraising/funder-matching](../funder-matching/SKILL.md) — Funders enter pipeline from matching
- [biz/npo/compliance/grant-reporting](../../compliance/grant-reporting/SKILL.md) — Post-`received` reporting
