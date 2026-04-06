---
name: biz/npo/fundraising/grant-writing
description: |
  AI-powered grant application and pitch generation for NPOs. Use this skill when:
  (1) generating personalised outreach emails to corporate CSI teams or foundation grant committees,
  (2) drafting grant proposals or funding applications tailored to a funder's priorities,
  (3) producing impact briefs that package an NPO's data for a specific funder audience,
  (4) creating follow-up communications, thank-you letters, or reporting updates for donors,
  (5) adapting pitch content for different funder types (corporate vs foundation vs government).
license: MIT
compatibility: Cloudflare Workers + Claude API via AI Gateway
homepage: https://skills.2nth.ai/biz/npo/fundraising/grant-writing
repository: https://github.com/2nth-ai/skills
requires:
  - tech/cloudflare/workers
  - tech/cloudflare/ai/ai-gateway
  - biz/npo/fundraising/funder-matching
  - biz/npo/impact/case-studies
improves:
  - biz/npo/fundraising
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Grant Writing, Proposals, Pitch, Outreach, Fundraising"
allowed-tools: Bash(curl:*) Read Write Edit Glob Grep
---

# Grant Writing & Pitch Generation

AI generates personalised fundraising content using the NPO's impact data, the funder's known priorities, and the match reasoning from `funder-matching`. Every piece of content is a draft for human review — never auto-send.

## Content Types

| Type | Purpose | Tone | Length |
|------|---------|------|--------|
| `email` | Cold outreach to a new funder | Professional, concise | 200-350 words |
| `proposal` | Formal grant application summary | Formal, evidence-based | 500-800 words |
| `impact_brief` | Impact data package for a specific funder | Data-forward, visual-ready | 300-500 words |
| `follow_up` | Post-meeting or post-application follow-up | Warm, specific | 100-200 words |
| `report` | Donor impact update (quarterly/annual) | Appreciative, results-focused | 400-600 words |

## Generation Pattern

```typescript
interface PitchRequest {
  funderId: string;
  type: 'email' | 'proposal' | 'impact_brief' | 'follow_up' | 'report';
  context?: string;  // additional user context (e.g., "we met at the conference")
}

async function generatePitch(req: PitchRequest, env: Env): Promise<string> {
  const org = await getOrgProfile(env);
  const funder = await getFunder(req.funderId, env);
  const match = await getMatch(req.funderId, env);
  const cases = await getCaseStudies(match.relevant_cases, env);
  const metrics = await getImpactMetrics(env);

  const systemPrompt = `You are a fundraising copywriter for ${org.name}, a non-profit organisation.
Mission: ${org.mission}
Key stats: ${metrics.map(m => `${m.metric_name}: ${m.metric_value}`).join(', ')}
PBO Reference: ${org.pbo_reference}
Section 18A: ${org.section_18a ? 'Yes — donations are tax deductible' : 'No'}

Write for the specific funder below. Use the match reasoning to tailor your angle.
Never fabricate statistics. Only reference case studies provided.
Always end with a specific next step, not a generic CTA.
Sign as: ${org.contact_name}, ${org.contact_title}`;

  const userPrompt = `Generate a ${req.type} for:

FUNDER: ${funder.name} (${funder.type})
CSI PROGRAMME: ${funder.csi_program || 'General CSI'}
MATCH SCORE: ${match.match_score}%
MATCH REASONING: ${match.ai_reasoning}
PITCH ANGLE: ${match.pitch_angle}
SUGGESTED APPROACH: ${match.suggested_approach}

RELEVANT CASE STUDIES:
${cases.map(c => `- ${c.title}: ${c.summary}`).join('\n')}

${req.context ? `ADDITIONAL CONTEXT: ${req.context}` : ''}

Return the ${req.type} content only. No meta-commentary.`;

  const res = await fetch(`${env.AI_GATEWAY_URL}/v1/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.ANTHROPIC_API_KEY}`,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
      'cf-aig-metadata': JSON.stringify({ skill: 'biz/npo/fundraising/grant-writing', type: req.type }),
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6-20250514',
      max_tokens: 1200,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  const data = await res.json();
  const content = data.content[0].text;

  // Save to pitches table
  await env.DB.prepare(`
    INSERT INTO pitches (id, funder_id, pitch_type, content, model, tokens_used, created_at)
    VALUES (?, ?, ?, ?, ?, ?, unixepoch())
  `).bind(crypto.randomUUID(), req.funderId, req.type, content, 'claude-sonnet-4-6-20250514', data.usage?.output_tokens || 0).run();

  return content;
}
```

## Pitch Personalisation Rules

1. **Corporate CSI**: Lead with ROI and measurable impact. Use the multiplier effect. Reference their ESG reporting needs.
2. **Foundation**: Lead with mission alignment and evidence of outcomes. Reference peer organisations they fund.
3. **International Grant**: Lead with methodology and scalability. Use formal grant language. Include budget breakdown.
4. **Government**: Lead with policy alignment and public benefit. Reference national priorities (biodiversity targets, SDGs).
5. **Private / Eco-Tourism**: Lead with mutual value — what they get back (brand exposure, guest experiences, operational support).

## Common Gotchas

- **Never auto-send**: All generated content is a draft. The NPO reviews, edits, and sends manually. AI-generated fundraising that reads as AI-generated damages credibility.
- **Don't fabricate case studies**: Only reference case studies that exist in the NPO's data. Hallucinated impact stories destroy trust permanently.
- **Match the funder's language**: A mining CSI team expects different language than an IUCN grant committee. The `type` field drives tone selection.
- **Include the ask**: Every pitch must include a specific funding amount and what it buys. "We'd appreciate your support" is not a pitch — "R250,000 funds 60 conservation flights" is.
- **Section 18A is a closer**: For SA corporate donors, always mention Section 18A tax deductibility. It's often the difference between "interesting" and "approved."

## See Also

- [biz/npo/fundraising/funder-matching](../funder-matching/SKILL.md) — Match data feeds pitch generation
- [biz/npo/impact/case-studies](../../impact/case-studies/SKILL.md) — Case study content
- [biz/npo/fundraising/csi-landscape](../csi-landscape/SKILL.md) — CSI context for pitch tailoring
