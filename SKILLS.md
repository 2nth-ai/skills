---
name: 2nthai/skills
description: Root index for the 2nth.ai skill tree. Load this first to understand what skills exist and how to reference them. Use this when you need to discover available skills or understand the domain structure.
type: index
repository: https://github.com/2nth-ai/skills
---

# 2nth.ai Skill Tree

Skills teach AI agents how to work effectively in a specific domain context. They are the encoded intelligence of the 2nth.ai platform — each skill is a reusable unit that compounds with others.

## Domains

| Domain | Path | Purpose |
|--------|------|---------|
| Business | `biz/` | ERP, CRM, operations — systems businesses run on |
| Education | `edu/` | Course design, assessment, corporate training |
| Finance | `fin/` | Reporting, treasury, tax, financial modelling |
| Healthcare | `health/` | Clinical systems, operations, pharma, public health |
| Legal | `leg/` | Contracts, compliance, IP, regulatory |
| Technology | `tech/` | Cloudflare, Claude Code, MCP, infrastructure |

## Skill Tree (current state)

```
biz/
  erp/
    sage-x3/         SKILL.md  ✓ production — Sage X3 GraphQL ERP integration
    erpnext/         SKILL.md  ✓ production — ERPNext REST API, furniture manufacturing
    shopify/         SKILL.md  ✓ production — Shopify Admin + Storefront API, 6 AI roles
  crm/
    hubspot/         stub
    salesforce/      stub
  hr/                SKILL.md  ✓ stub — HR and talent domain manifest
    recruitment/     SKILL.md  ✓ production — full recruitment value chain, JD → offer
    onboarding/      stub
    performance/     stub
    compliance/      stub
  ops/               stub

edu/
  higher-ed/
    course-design/   stub
    assessment/      stub
  corporate/
    training/        stub
  k12/               stub

fin/
  reporting/         SKILL.md  ✓ stub — financial KPI reporting patterns
  treasury/          stub
  tax/               stub

health/
  clinical/          SKILL.md  ✓ stub — EHR, FHIR, diagnostics, protocols
    ehr/             stub
    diagnostics/     stub
    protocols/       stub
  ops/               SKILL.md  ✓ stub — scheduling, billing, compliance
    scheduling/      stub
    billing/         stub
    compliance/      stub
  pharma/            stub
  public-health/     stub

leg/
  contracts/         stub
  compliance/        stub
  ip/                stub

tech/
  cloudflare/        SKILL.md  ✓ production — full platform manifest, 16 services
    workers/         SKILL.md  ✓ production — Workers runtime, streaming, service bindings
    pages/           SKILL.md  ✓ production — Pages deploy, Functions, Git integration
    d1/              SKILL.md  ✓ production — SQLite edge DB, migrations, batch ops
    kv/              SKILL.md  ✓ production — KV store, sessions, feature flags
    r2/              SKILL.md  ✓ production — object storage, presigned URLs, zero egress
    durable-objects/ SKILL.md  ✓ production — stateful compute, WebSockets, hibernation
    queues/          SKILL.md  ✓ production — reliable messaging, DLQ, async AI pattern
    workflows/       SKILL.md  ✓ production — durable execution, step.do(), beta
    ai/
      workers-ai/    SKILL.md  ✓ production — edge inference, JSON schema, embeddings
      ai-gateway/    SKILL.md  ✓ production — token metering, caching, fallback routing
      vectorize/     SKILL.md  ✓ production — vector DB, RAG pipeline, metadata filtering
    hyperdrive/      SKILL.md  ✓ production — Postgres/MySQL pooling, client SOR access
    analytics-engine/ SKILL.md ✓ production — time-series metrics, token economy
    email/           SKILL.md  ✓ stub — inbound routing, MailChannels outbound
    tunnel/          SKILL.md  ✓ stub — secure outbound connector, on-premise SOR
    workers-for-platforms/ SKILL.md ✓ stub — multi-tenant execution (deferred)
  claude-code/       SKILL.md  ✓ stub — Claude Code setup and patterns
  mcp/               stub
  iac/               stub
```

## How Skills Reference Each Other

Skills declare dependencies in their `requires:` frontmatter field. When an agent loads a skill, it resolves the full dependency chain automatically:

```yaml
requires:
  - tech/cloudflare/workers   # deployment substrate
  - fin/reporting/kpis        # output format
```

Loading `biz/erp/sage-x3` also loads its required skills. This is the compounding principle — narrow skills gain depth by pulling in atomic primitives, and contribute back up via `improves:`.

## Loading a Skill

### Claude Code
```bash
npx skills add biz/erp/sage-x3
```

### Direct reference (any agent)
```
https://raw.githubusercontent.com/2nthai/skills/main/biz/erp/sage-x3/SKILL.md
```

### In `.claude/settings.json`
```json
{
  "skills": ["biz/erp/sage-x3", "tech/cloudflare/workers"]
}
```

## Contribution

Skills are proposed via PR. Penny (agents/penny) reviews token efficiency — skills that reduce tokens-per-outcome are prioritised.

See [SKILL_FORMAT.md](SKILL_FORMAT.md) before writing a new skill.
