---
name: biz/npo/fundraising/funder-matching
description: |
  AI-powered funder discovery and matching for NPOs. Use this skill when:
  (1) scoring and ranking potential funders against an NPO's mission, capabilities, and impact data,
  (2) generating AI reasoning for why a funder aligns (or doesn't) with the NPO,
  (3) building alignment breakdowns across dimensions (mission fit, sector, geography, funding capacity, relationship warmth),
  (4) identifying grant deadlines, CSI programme cycles, and seasonal funding windows,
  (5) discovering new funders from web research, CSI databases, or foundation directories.
license: MIT
compatibility: Cloudflare Workers + D1 + Claude API via AI Gateway
homepage: https://skills.2nth.ai/biz/npo/fundraising/funder-matching
repository: https://github.com/2nth-ai/skills
requires:
  - tech/cloudflare/workers
  - tech/cloudflare/d1
  - tech/cloudflare/ai/ai-gateway
  - biz/npo/fundraising/csi-landscape
  - data/analysis
improves:
  - biz/npo/fundraising
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Funder Matching, AI Scoring, Grant Discovery, CSI, Donor Intelligence"
allowed-tools: Bash(curl:*) Read Write Edit Glob Grep
---

# Funder Matching Engine

AI-powered scoring of funders against an NPO's mission, impact data, and capabilities. Produces a match score (0–100), natural-language reasoning, alignment breakdown, and a suggested approach for each funder.

## Data Model

### Funder record (D1)

```sql
CREATE TABLE funders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,       -- 'Corporate CSI' | 'Foundation' | 'Government' | 'International Grant' | 'Private / Eco-Tourism'
  sector TEXT,              -- 'Mining & Resources' | 'Financial Services' | 'Aviation & Fuel' | etc.
  csi_program TEXT,         -- specific programme name
  funding_min INTEGER,      -- ZAR
  funding_max INTEGER,
  geo_focus TEXT,           -- 'South Africa' | 'Southern Africa' | 'Pan-African' | 'Global'
  deadline TEXT,            -- ISO date or NULL for rolling
  website TEXT,
  contact_name TEXT,
  contact_email TEXT,
  notes TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
```

### Match record (D1)

```sql
CREATE TABLE funder_matches (
  id TEXT PRIMARY KEY,
  funder_id TEXT NOT NULL REFERENCES funders(id),
  match_score INTEGER NOT NULL,        -- 0-100
  ai_reasoning TEXT,                   -- 2-3 sentence explanation
  pitch_angle TEXT,                    -- one-line hook
  suggested_approach TEXT,             -- 1-2 paragraph strategy
  alignment_mission INTEGER,           -- 0-100
  alignment_sector INTEGER,
  alignment_geo INTEGER,
  alignment_funding INTEGER,
  alignment_relationship INTEGER,
  relevant_cases TEXT,                 -- JSON array of case study IDs
  scored_at INTEGER NOT NULL DEFAULT (unixepoch()),
  model_version TEXT                   -- e.g. 'claude-sonnet-4-6-20250514'
);
```

## Scoring Algorithm

Scoring is a two-phase process: structured scoring + AI reasoning.

### Phase 1 — Structured scoring (deterministic)

Calculate base alignment scores from data overlap:

```typescript
interface OrgProfile {
  mission: string;
  sectors: string[];
  geoFocus: string[];
  impactAreas: string[];     // 'wildlife' | 'environmental' | 'community'
  capabilities: string[];    // 'aerial survey' | 'wildlife transport' | 'monitoring'
  existingPartners: string[];
  pboRegistered: boolean;
  section18a: boolean;
}

function structuredScore(org: OrgProfile, funder: Funder): Partial<Alignment> {
  return {
    geo: geoOverlap(org.geoFocus, funder.geo_focus),           // 0-100
    funding: fundingFit(org, funder),                            // capacity vs need
    relationship: relationshipWarmth(org.existingPartners, funder), // existing connection score
  };
}

function geoOverlap(orgGeo: string[], funderGeo: string): number {
  if (funderGeo === 'Global') return 85;
  if (orgGeo.includes(funderGeo)) return 95;
  if (funderGeo === 'Pan-African' && orgGeo.includes('Southern Africa')) return 80;
  return 40;
}

function relationshipWarmth(partners: string[], funder: Funder): number {
  // Direct relationship
  if (partners.includes(funder.name)) return 95;
  // Shared network (funder funds one of our partners)
  // This requires a funder-beneficiary graph — seed from known data
  return 30; // cold by default
}
```

### Phase 2 — AI reasoning (Claude API)

Pass org profile + funder data to Claude for mission/sector alignment scoring and natural-language reasoning:

```typescript
async function aiScore(org: OrgProfile, funder: Funder, env: Env): Promise<AIScoreResult> {
  const prompt = `You are a fundraising strategist for non-profit organisations.

Score this funder's alignment with the NPO below. Return JSON only.

NPO PROFILE:
- Name: ${org.name}
- Mission: ${org.mission}
- Sectors: ${org.sectors.join(', ')}
- Impact areas: ${org.impactAreas.join(', ')}
- Capabilities: ${org.capabilities.join(', ')}
- Geographic focus: ${org.geoFocus.join(', ')}

FUNDER:
- Name: ${funder.name}
- Type: ${funder.type}
- Sector: ${funder.sector}
- CSI Programme: ${funder.csi_program || 'Unknown'}
- Funding range: R${funder.funding_min}–R${funder.funding_max}
- Geographic focus: ${funder.geo_focus}
- Deadline: ${funder.deadline || 'Rolling'}

Return JSON:
{
  "mission_alignment": <0-100>,
  "sector_alignment": <0-100>,
  "reasoning": "<2-3 sentences explaining WHY this funder matches or doesn't>",
  "pitch_angle": "<one-line hook for the outreach>",
  "suggested_approach": "<1-2 paragraph strategy for engaging this funder>",
  "relevant_impact_areas": ["<which of the NPO's impact areas are most relevant>"]
}`;

  const res = await fetch(`${env.AI_GATEWAY_URL}/v1/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.ANTHROPIC_API_KEY}`,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
      'cf-aig-metadata': JSON.stringify({ skill: 'biz/npo/fundraising/funder-matching', org: org.name }),
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6-20250514',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await res.json();
  return JSON.parse(data.content[0].text) as AIScoreResult;
}
```

### Phase 3 — Composite score

```typescript
function compositeScore(structured: Partial<Alignment>, ai: AIScoreResult): number {
  const weights = {
    mission: 0.30,    // Most important — does the funder care about what you do?
    sector: 0.25,     // Sector alignment (mining, conservation, finance)
    geo: 0.15,        // Geographic overlap
    funding: 0.15,    // Funding capacity vs NPO needs
    relationship: 0.15 // Existing connection warmth
  };

  const scores = {
    mission: ai.mission_alignment,
    sector: ai.sector_alignment,
    geo: structured.geo!,
    funding: structured.funding!,
    relationship: structured.relationship!,
  };

  return Math.round(
    Object.entries(weights).reduce((sum, [key, w]) => sum + scores[key as keyof typeof scores] * w, 0)
  );
}
```

## Batch Scoring

Score all funders on org onboarding or profile update. Use Cloudflare Queue for async processing:

```typescript
// Producer: enqueue scoring jobs
async function enqueueScoring(orgId: string, env: Env) {
  const funders = await env.DB.prepare('SELECT id FROM funders').all();
  for (const funder of funders.results) {
    await env.SCORING_QUEUE.send({ orgId, funderId: funder.id });
  }
}

// Consumer: process one funder score
export default {
  async queue(batch: MessageBatch<ScoringJob>, env: Env) {
    for (const msg of batch.messages) {
      try {
        const { orgId, funderId } = msg.body;
        const org = await getOrgProfile(orgId, env);
        const funder = await getFunder(funderId, env);

        const structured = structuredScore(org, funder);
        const ai = await aiScore(org, funder, env);
        const score = compositeScore(structured, ai);

        await env.DB.prepare(`
          INSERT OR REPLACE INTO funder_matches
          (id, funder_id, match_score, ai_reasoning, pitch_angle, suggested_approach,
           alignment_mission, alignment_sector, alignment_geo, alignment_funding, alignment_relationship,
           scored_at, model_version)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), ?)
        `).bind(
          `${orgId}-${funderId}`, funderId, score, ai.reasoning, ai.pitch_angle,
          ai.suggested_approach, ai.mission_alignment, ai.sector_alignment,
          structured.geo, structured.funding, structured.relationship,
          'claude-sonnet-4-6-20250514'
        ).run();

        msg.ack();
      } catch (e) {
        msg.retry();
      }
    }
  }
};
```

## API Endpoints

```typescript
// GET /api/matches — list scored funders for this org
app.get('/api/matches', async (c) => {
  const scoreMin = parseInt(c.req.query('score_min') || '0');
  const type = c.req.query('type');  // optional filter
  const sort = c.req.query('sort') || 'match_score';

  let query = `
    SELECT f.*, m.match_score, m.ai_reasoning, m.pitch_angle, m.suggested_approach,
           m.alignment_mission, m.alignment_sector, m.alignment_geo,
           m.alignment_funding, m.alignment_relationship, m.relevant_cases,
           p.status as pipeline_status
    FROM funders f
    JOIN funder_matches m ON m.funder_id = f.id
    LEFT JOIN pipeline p ON p.funder_id = f.id
    WHERE m.match_score >= ?
  `;
  const params: any[] = [scoreMin];

  if (type) {
    query += ' AND f.type = ?';
    params.push(type);
  }

  query += ` ORDER BY ${sort === 'funding' ? 'f.funding_max' : 'm.match_score'} DESC`;

  const results = await c.env.DB.prepare(query).bind(...params).all();
  return c.json({ funders: results.results });
});

// POST /api/matches/rescore — trigger full re-scoring
app.post('/api/matches/rescore', async (c) => {
  await enqueueScoring(c.get('orgId'), c.env);
  return c.json({ status: 'scoring_queued' });
});
```

## Funder Discovery (Research Agent)

Scheduled weekly via Cron Trigger. Claude researches new funding opportunities:

```typescript
// Cron Trigger: runs every Monday at 06:00 UTC
export default {
  async scheduled(event: ScheduledEvent, env: Env) {
    const org = await getOrgProfile('default', env);
    const existingFunders = await env.DB.prepare('SELECT name FROM funders').all();
    const existingNames = existingFunders.results.map((f: any) => f.name);

    const prompt = `You are a fundraising researcher for ${org.name}, a ${org.mission}.

Known funders already in our database: ${existingNames.join(', ')}.

Research and suggest 3-5 NEW potential funders NOT in the list above. Focus on:
1. SA corporate CSI programs with environmental/conservation mandates
2. International conservation foundations with African programs
3. Government grants or bilateral aid programs for conservation
4. Private sector companies with natural brand alignment

For each, return JSON array:
[{
  "name": string,
  "type": "Corporate CSI" | "Foundation" | "International Grant" | "Government",
  "sector": string,
  "csi_program": string,
  "funding_estimate_min": number,
  "funding_estimate_max": number,
  "geo_focus": string,
  "reasoning": "Why this funder might be a fit"
}]`;

    // Call Claude, parse results, insert into funders table, trigger scoring
  }
};
```

## Common Gotchas

- **Stale scores**: Re-score when the org profile changes (new case studies, updated mission, new partnerships). A match score from 6 months ago may not reflect current alignment.
- **Relationship warmth is gold**: A 75% match with a warm relationship converts better than a 95% match cold. Weight relationship data heavily in outreach prioritisation.
- **Deadline awareness**: Grant deadlines are hard cutoffs. Surface deadlines prominently — a perfect match is worthless if the window closed last week.
- **AI reasoning must be auditable**: Store the model version and full reasoning. When a user asks "why did you score Anglo American at 94%?" you need to show the work.
- **Don't over-score**: Not every funder is a match. A score below 50% should surface as "low alignment" with clear reasoning, not be hidden. NPOs waste time chasing poor fits.

## See Also

- [biz/npo/fundraising/grant-writing](../grant-writing/SKILL.md) — Generate pitches from match data
- [biz/npo/fundraising/csi-landscape](../csi-landscape/SKILL.md) — SA CSI ecosystem knowledge
- [biz/npo/impact/case-studies](../../impact/case-studies/SKILL.md) — Case studies referenced in matching
- [tech/cloudflare/queues](../../../../tech/cloudflare/queues/SKILL.md) — Async scoring pattern
- [tech/cloudflare/ai/ai-gateway](../../../../tech/cloudflare/ai/ai-gateway/SKILL.md) — Token metering
