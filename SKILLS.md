---
name: 2nth-ai/skills
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
| Data | `data/` | Data strategy, engineering, analytics, ML, governance |
| Education | `edu/` | Course design, assessment, corporate training |
| Finance | `fin/` | Reporting, treasury, tax, financial modelling |
| Healthcare | `health/` | Clinical systems, operations, pharma, public health |
| IoT | `iot/` | Embedded hardware, firmware, connectivity, sensors, platform |
| Legal | `leg/` | Contracts, compliance, IP, regulatory |
| Technology | `tech/` | Cloudflare, AWS, Google Cloud, Microsoft, Claude Code, MCP, infrastructure |

## Agents

| Agent | Role | Skills |
|-------|------|--------|
| `agents/penny` | Fractional CMO | mkt/brand, mkt/content, mkt/digital, mkt/social, mkt/performance, mkt/demand-gen, mkt/pr, mkt/go-to-market, mkt/sa |
| `agents/grant` | Fractional CFO | fin/accounting, fin/management-accounts, fin/cash-flow, fin/fp-and-a, fin/credit-control, fin/costing, fin/modelling, fin/sa |
| `agents/katharine` | Fractional CRO | biz/sales, biz/sales/prospecting, biz/sales/qualification, biz/sales/discovery, biz/sales/proposal, biz/sales/negotiation, biz/sales/pipeline, biz/sales/forecasting, biz/sales/enablement, biz/sales/revops |
| `agents/tom` | Fractional COO | biz/erp, tech/architecture |
| `agents/grace` | Fractional CHRO | biz/crm |
| `agents/leo` | Fractional CLO | leg/commercial, leg/disputes, leg/property, leg/employment, leg/employment/ccma, leg/ip, leg/corporate, leg/data-privacy, leg/fundraising |
| `agents/clara` | Fractional CSM Lead | biz/crm |
| `agents/max` | Fractional CSO | fin/modelling, tech/architecture, tech/agent-protocols |
| `agents/alex` | Fractional CDO | data/strategy, data/engineering, data/analysis, data/science, data/ml-ops, data/visualisation, data/governance, data/sa, tech/agent-protocols |
| `agents/morgan` | Fractional Healthcare Director | health/operations, health/clinical-governance, health/finance, health/digital, health/public-health, health/mental-health, health/pharmacy, health/sa |
| `agents/eric` | Fractional IoT Engineering Director | iot/hardware, iot/firmware, iot/connectivity, iot/sensors, iot/power, iot/security, iot/platform, iot/sa |
| `agents/andi` | FinMechanics Africa Representative | fin/capital-markets, fin/capital-markets/trading-platforms, fin/sa |
| `agents/sophia` | (specialist — see AGENT.md) | |

## Skill Tree (current state)

```
biz/
  erp/
    sage-x3/         SKILL.md  ✓ production — Sage X3 GraphQL ERP integration
    erpnext/         SKILL.md  ✓ production — ERPNext REST API, furniture manufacturing
    shopify/         SKILL.md  ✓ production — Shopify Admin + Storefront API, 6 AI roles
    woocommerce/     SKILL.md  ✓ production — WooCommerce REST API v3, orders, products, inventory, webhooks
  accounting/        SKILL.md  ✓ production — accounting domain manifest
    xero/            SKILL.md  ✓ production — Xero REST API, OAuth 2.0, invoicing, reconciliation, reports
  crm/
    hubspot/         stub
    salesforce/      stub
  property/          SKILL.md  ✓ production — property development, construction compliance
    za/              SKILL.md  ✓ production — SA regulatory landscape (SANS 10400 + CIDB + NHBRC)
      sans-10400/    SKILL.md  ✓ production — building codes, 23 parts, occupancy classes, plan submission
      cidb/          SKILL.md  ✓ production — contractor grading (1–9), classes of works, tender values
      nhbrc/         SKILL.md  ✓ production — builder registration, 4-stage inspections, 3-tier warranty
      project-stages/ SKILL.md ✓ production — 9-stage lifecycle, ERPNext doctypes, compliance checklists
  spatial-gallery/   SKILL.md  ✓ production — FOAM-inspired spatial index, gallery, proof of presence for shared spaces
  hr/                SKILL.md  ✓ stub — HR and talent domain manifest
    recruitment/     SKILL.md  ✓ production — full recruitment value chain, JD → offer
    onboarding/      stub
    performance/     stub
    compliance/      stub
  ops/               stub

data/
  strategy/          SKILL.md  ✓ production — data maturity, data product road-map, platform architecture, team structure
  engineering/       SKILL.md  ✓ production — ETL/ELT, data warehouse, dbt, orchestration, data quality
  analysis/          SKILL.md  ✓ production — SQL analytics, EDA, statistical reasoning, A/B testing
  science/           SKILL.md  ✓ production — ML problem framing, feature engineering, model selection, evaluation
  ml-ops/            SKILL.md  ✓ production — model serving, feature stores, drift detection, retraining pipelines
  visualisation/     SKILL.md  ✓ production — dashboard design, BI tool selection, semantic layer, self-serve analytics
  governance/        SKILL.md  ✓ production — data quality SLAs, cataloguing, lineage, RBAC, POPIA
  sa/                SKILL.md  ✓ production — SA cloud regions, POPIA, SA talent, load shedding, B-BBEE data

edu/
  curriculum/        SKILL.md  ✓ production — lesson plans, scope & sequence, Bloom's, CAPS/IEB/Cambridge/IB/Common Core
  higher-ed/
    course-design/   stub
    assessment/      stub
  corporate/
    training/        stub
  k12/               stub

fin/
  capital-markets/   SKILL.md  ✓ production — capital markets domain (trading, risk, pricing, post-trade; SA FSCA/SARB context)
    trading-platforms/ SKILL.md ✓ production — non-monolithic trading platforms, FM Converge, FRTB/SA-CCR/XVA, composable architecture
  reporting/         SKILL.md  ✓ stub — financial KPI reporting patterns
  modelling/         SKILL.md  ✓ production — DCF, three-statement, scenario analysis, sensitivity tables, Excel export
  accounting/        SKILL.md  ✓ production — accounting domain manifest
    quickbooks/      SKILL.md  ✓ production — QBO REST API v3, OAuth 2.0, invoices, payments, CDC, reports, webhooks
  treasury/          stub
  tax/               stub

health/
  operations/        SKILL.md  ✓ production — bed management, capacity planning, staffing, theatre utilisation, KPIs
  clinical-governance/ SKILL.md ✓ production — patient safety, RCA, clinical audit, M&M, COHSASA, OHSC, NCS
  finance/           SKILL.md  ✓ production — medical billing, ICD-10, PMBs, revenue cycle, DRGs, denial management
  digital/           SKILL.md  ✓ production — EMR/EHR, HL7 FHIR, telemedicine, DHIS2, clinical decision support
  public-health/     SKILL.md  ✓ production — epidemiology, SA disease burden (HIV/TB/NCD), PHC, NHI
  mental-health/     SKILL.md  ✓ production — Mental Health Care Act, psychiatric pathways, psychotropics, workforce
  pharmacy/          SKILL.md  ✓ production — formulary, ARV management, pharmacovigilance, scheduling, SEP
  sa/                SKILL.md  ✓ production — NHI, medical aid schemes, HPCSA, public sector, private hospital groups

iot/
  hardware/          SKILL.md  ✓ production — PCB design, EMC, DFM, signal integrity, component selection, bring-up
  firmware/          SKILL.md  ✓ production — MCU selection, FreeRTOS, Zephyr, OTA pipelines, CI/CD for embedded
  connectivity/      SKILL.md  ✓ production — WiFi, BLE, LoRaWAN, NB-IoT, MQTT, CoAP, mesh networking
  sensors/           SKILL.md  ✓ production — sensor selection, ADC, calibration, sensor fusion, edge anomaly detection
  power/             SKILL.md  ✓ production — battery tech, BMS, solar harvest, load shedding resilience, power budget
  security/          SKILL.md  ✓ production — device identity, mTLS, secure boot, OTA signing, POPIA for IoT
  platform/          SKILL.md  ✓ production — AWS IoT Core, Azure IoT Hub, ThingsBoard, device management, tinyML
  sa/                SKILL.md  ✓ production — ICASA type approval, SA LoRaWAN/NB-IoT, load shedding design, local suppliers

leg/
  commercial/        SKILL.md  ✓ production — MSAs, SLAs, NDAs — structure, red flags, negotiation priorities
  disputes/          SKILL.md  ✓ production — escalation ladder: negotiation → demand letter → mediation → arbitration
  property/          SKILL.md  ✓ production — lease review and negotiation — escalation, TIA, break clauses, exit
  employment/        SKILL.md  ✓ production — LRA, BCEA, employment contracts, dismissal procedure
    ccma/            SKILL.md  ✓ production — Form 7.11 referral, conciliation, arbitration
  ip/                SKILL.md  ✓ production — copyright, trademarks (CIPC), patents, trade secrets, IP assignment
  corporate/         SKILL.md  ✓ production — Companies Act 71/2008, MOI, director duties, shareholder agreements, King IV
  data-privacy/      SKILL.md  ✓ production — POPIA 8 conditions, Information Officer, breach notification, R10m penalties
  fundraising/       SKILL.md  ✓ production — term sheets, SAFE notes, preference shares, cap table

tech/
  architecture/      SKILL.md  ✓ production — ADRs, C4 diagrams, trade-off matrices, anti-pattern detection, 12 patterns
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
  aws/               SKILL.md  ✓ production — IAM auth model, regions (af-south-1), Cloudflare+AWS hybrid
    compute/         SKILL.md  ✓ production — Lambda, ECS Fargate, EC2, API Gateway, SigV4 signing from CF Workers
    security/        SKILL.md  ✓ production — IAM least-privilege, VPC security groups, KMS, Secrets Manager
    storage/         SKILL.md  ✓ stub — S3, EBS, EFS, Glacier
    database/        SKILL.md  ✓ stub — RDS, DynamoDB, ElastiCache, Aurora
    networking/      SKILL.md  ✓ stub — VPC, Route 53, CloudFront, ALB/NLB
    messaging/       SKILL.md  ✓ stub — SQS, SNS, EventBridge, Kinesis
    connect/         SKILL.md  ✓ production — Amazon Connect contact centre: IVR flows, routing, Lambda, Lex, Streams API, Contact Lens
    ai/              SKILL.md  ✓ stub — Bedrock (Claude), SageMaker, Rekognition
  cisco/             SKILL.md  ✓ stub — IOS/NX-OS, ASA/Firepower, Meraki, Webex, Netmiko
    networking/      SKILL.md  ✓ stub — VLANs, STP, OSPF, EIGRP, BGP
    security/        SKILL.md  ✓ stub — ASA, Firepower, Umbrella, ISE, AnyConnect
    wireless/        SKILL.md  ✓ stub — Catalyst WLC, Meraki, RF design
    collaboration/   SKILL.md  ✓ stub — Webex, CUCM, Unity Connection, UCCX
    automation/      SKILL.md  ✓ stub — Netmiko, NAPALM, Ansible, DNA Center, NETCONF
  elevenlabs/        SKILL.md  ✓ stub — TTS (flash/v3), voice cloning, STT, conversational AI agents, Cloudflare streaming
  github/            SKILL.md  ✓ stub — REST API, Octokit v21, Actions, Apps, webhooks, Copilot data policy (Apr 2026)
  zoho/              SKILL.md  ✓ stub — CRM v8 (COQL, bulk), Books v3 (invoices, payments), OAuth multi-DC, CRM↔Books sync
  recall-ai/         SKILL.md  ✓ production — meeting bot API, recording, transcripts, webhooks for Zoom/Meet/Teams/Webex
  claude-code/       SKILL.md  ✓ stub — Claude Code setup and patterns
  agent-protocols/   SKILL.md  ✓ production — MCP, A2A, ACP, multi-agent orchestration patterns
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
https://raw.githubusercontent.com/2nth-ai/skills/main/biz/erp/sage-x3/SKILL.md
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
