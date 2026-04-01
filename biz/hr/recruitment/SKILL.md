---
name: biz/hr/recruitment
description: |
  Recruitment value chain — AI augmentation across every stage from sourcing to signed offer. Use this skill when:
  (1) drafting or optimising job descriptions for clarity, inclusivity, and SEO,
  (2) parsing and ranking CVs against a JD using structured scoring,
  (3) generating competency-based interview guides tailored to the role and level,
  (4) drafting personalised candidate outreach or rejection communications,
  (5) producing offer letters, employment contracts, and counter-offer analysis,
  (6) integrating with ATS platforms (Greenhouse, Lever, Workday, BambooHR, SmartRecruiters).
license: MIT
compatibility: Any ATS via REST API; Cloudflare Workers AI for CV parsing
homepage: https://skills.2nth.ai/biz/hr/recruitment
repository: https://github.com/2nth-ai/skills
requires:
  - tech/cloudflare/workers
  - tech/cloudflare/ai/workers-ai
  - tech/cloudflare/ai/ai-gateway
improves:
  - biz/hr
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "HR, Recruitment, Talent Acquisition, ATS, JD, CV Screening"
---

# Recruitment Value Chain

The recruitment value chain has six stages where AI adds compounding value. Each stage produces a structured output consumed by the next.

```
JD Creation → Sourcing → CV Screening → Interviewing → Assessment → Offer
```

## Stage 1 — Job Description Creation

AI drafts JDs from a brief. The output is scored against a rubric before it goes live.

```typescript
const jdPrompt = `
You are a talent acquisition specialist. Draft a job description from this brief.

Brief: ${brief}

Output JSON:
{
  "title": string,
  "summary": string (2-3 sentences, candidate-facing),
  "responsibilities": string[] (5-8 bullets, action verbs),
  "requirements": {
    "essential": string[],
    "desirable": string[]
  },
  "about_us": string (3-4 sentences),
  "inclusivity_flags": string[] (list any non-inclusive language found — empty if clean)
}
`;

const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
  messages: [{ role: 'user', content: jdPrompt }],
  response_format: { type: 'json_object' },
});
const jd = JSON.parse(response.response);
// Flag and fix any inclusivity_flags before publishing
```

## Stage 2 — CV Screening and Ranking

Parse raw CV text and score against the JD. Returns a structured candidate record.

```typescript
interface CandidateScore {
  name: string;
  email: string;
  score: number;           // 0–100
  tier: 'A' | 'B' | 'C';  // A = interview, B = hold, C = reject
  strengths: string[];
  gaps: string[];
  experience_years: number;
  red_flags: string[];     // gaps, frequent moves, mismatch
  summary: string;         // 2-sentence recruiter note
}

async function screenCV(cvText: string, jd: string, env: Env): Promise<CandidateScore> {
  const prompt = `
Score this CV against the job description. Be rigorous — only A-tier candidates
meet 80%+ of essential requirements AND have relevant domain experience.

JD: ${jd}
CV: ${cvText}

Output JSON matching CandidateScore schema.
`;

  const result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });
  return JSON.parse(result.response) as CandidateScore;
}
```

## Stage 3 — Interview Guide Generation

Produces a structured interview guide per competency, with scoring rubric.

```typescript
const interviewPrompt = `
Create a competency-based interview guide for this role.

Role: ${jd.title}
Level: ${level}  // e.g. "Senior", "Entry"
Key competencies: ${competencies.join(', ')}

For each competency produce:
- 2 behavioural questions (STAR format)
- 1 situational/hypothetical question
- Green/amber/red answer indicators

Output JSON: { competencies: [{ name, questions: [{ text, type, indicators }] }] }
`;
```

## Stage 4 — Candidate Outreach

Personalised outreach for sourced candidates. Never send without human review.

```typescript
async function draftOutreach(params: {
  candidateName: string;
  candidateRole: string;        // their current title
  targetRole: string;
  companyContext: string;
  tone: 'formal' | 'conversational';
}, env: Env): Promise<string> {
  const prompt = `
Draft a LinkedIn/email outreach message to ${params.candidateName}, currently a
${params.candidateRole}. We're hiring a ${params.targetRole}.

${params.companyContext}

Tone: ${params.tone}. Max 120 words. No buzzwords. End with a specific question,
not a generic CTA. Do not use "I hope this message finds you well."
`;

  const result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 200,
  });
  return result.response;
}
```

## Stage 5 — Offer Letter Drafting

Structured offer letter from compensation parameters. Always reviewed by HR and legal.

```typescript
interface OfferParams {
  candidateName: string;
  role: string;
  department: string;
  reportingTo: string;
  startDate: string;
  baseSalary: number;
  currency: string;
  bonusScheme?: string;
  equity?: string;
  probationMonths: number;
  location: string;
  remotePolicy: string;
  expiryDate: string;
}

// Generate offer letter body — merge into your letterhead template
async function draftOffer(params: OfferParams, env: Env): Promise<string> {
  // Use Claude via AI Gateway for formal document drafting
  const res = await fetch(env.AI_GATEWAY_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.ANTHROPIC_API_KEY}`,
      'Content-Type': 'application/json',
      'cf-aig-metadata': JSON.stringify({ skill: 'biz/hr/recruitment', stage: 'offer' }),
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      messages: [{
        role: 'user',
        content: `Draft a formal offer letter body from these parameters: ${JSON.stringify(params)}.
Include: opening congratulations, role/department/reporting line, start date, compensation breakdown,
probation terms, remote policy, acceptance deadline. Professional tone, no exclamation marks.`,
      }],
    }),
  });
  const { content } = await res.json();
  return content[0].text;
}
```

## ATS Integration Patterns

### Greenhouse (REST API)

```typescript
// POST a candidate to a job
await fetch(`https://harvest.greenhouse.io/v1/jobs/${jobId}/candidates`, {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${btoa(env.GREENHOUSE_API_KEY + ':')}`,
    'Content-Type': 'application/json',
    'On-Behalf-Of': recruiterId,
  },
  body: JSON.stringify({
    first_name: candidate.firstName,
    last_name: candidate.lastName,
    email_addresses: [{ value: candidate.email, type: 'personal' }],
    applications: [{ job_id: jobId }],
    attachments: [{ filename: 'cv.pdf', type: 'resume', content: base64CV, content_type: 'application/pdf' }],
  }),
});
```

### BambooHR (REST API)

```typescript
// Get open positions
const jobs = await fetch(`https://api.bamboohr.com/api/gateway.php/${env.BAMBOOHR_SUBDOMAIN}/v1/applicant_tracking/jobs`, {
  headers: { 'Authorization': `Basic ${btoa(env.BAMBOOHR_API_KEY + ':x')}`, 'Accept': 'application/json' },
});
```

## Scoring Rubric (A/B/C tiers)

| Tier | Score | Criteria | Action |
|------|-------|----------|--------|
| A | 80–100 | Meets all essential + most desirable requirements | Invite to interview |
| B | 55–79 | Meets essential requirements; gaps in desirable | Hold for review |
| C | 0–54 | Missing essential requirements | Reject with feedback |

**Important**: AI scores are a first-pass filter. A human recruiter reviews all A-tier and B-tier candidates before any decision is communicated.

## Common Gotchas

- **Bias in JDs**: Always check `inclusivity_flags` output. Words like "rockstar", "ninja", age-coded phrases, and gender-coded language reduce application diversity.
- **CV parsing accuracy**: Structured CVs (Word/PDF with clear sections) parse well. Creative/visual CVs often lose data — ask candidates to submit a plain text version too.
- **AI scoring is not a decision**: The score is a ranking aid, not a hiring decision. Document human review at every stage for audit trails (POPIA/GDPR compliance).
- **Outreach volume**: Don't automate bulk outreach — personalise each message. AI-generated but human-sent is the correct pattern.
- **Offer letter jurisdiction**: Employment law varies by country. Always have a qualified HR practitioner review offers, especially for notice periods, restraints of trade, and equity terms.

## See Also

- [biz/hr (domain manifest)](../SKILL.md)
- [tech/cloudflare/ai/workers-ai (CV parsing, JSON schema enforcement)](../../../tech/cloudflare/ai/workers-ai/SKILL.md)
- [tech/cloudflare/ai/ai-gateway (token metering for recruitment AI spend)](../../../tech/cloudflare/ai/ai-gateway/SKILL.md)
- [tech/cloudflare/queues (async CV processing queue)](../../../tech/cloudflare/queues/SKILL.md)
