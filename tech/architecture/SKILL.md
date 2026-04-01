---
name: tech/architecture
description: |
  Code architecture AI expert. Use this skill when:
  (1) generating Architecture Decision Records (ADRs) in MADR or Nygard format from decision context and constraints,
  (2) reviewing a system design against established patterns and identifying missing concerns (resilience, observability, security, NFRs),
  (3) producing trade-off analysis matrices for architectural choices (microservices vs monolith, REST vs GraphQL vs gRPC, row-level vs schema-per-tenant),
  (4) generating C4 model diagrams (context, container, component) in Mermaid syntax,
  (5) detecting anti-patterns — distributed monolith, chatty microservices, god service, anemic domain model,
  (6) selecting a database technology (relational, document, time-series, graph, vector) based on workload characteristics,
  (7) planning migration strategies — strangler fig, parallel run, big-bang — with risk profiles,
  (8) structuring non-functional requirements (availability, latency, throughput, consistency, security),
  (9) identifying and documenting existing architecture decisions retrospectively.
license: MIT
compatibility: Any — outputs Markdown, Mermaid, JSON
homepage: https://skills.2nth.ai/tech/architecture
repository: https://github.com/2nth-ai/skills
requires:
  - tech/cloudflare/workers
improves:
  - tech
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Engineering, Architecture, ADR, System Design, Patterns"
allowed-tools: Read Write Edit Glob Grep
---

# Code Architecture AI

Good architecture decisions are hard to make alone and expensive to reverse. This skill gives engineers an AI partner that knows architecture patterns, trade-off frameworks, and documentation standards — producing first-draft ADRs, identifying anti-patterns, and generating C4 diagrams from verbal descriptions so engineers focus on the judgment calls that require domain expertise.

Whether you are a solo founder choosing a database, a staff engineer reviewing a proposed microservices split, or a CTO documenting the decisions that led to your current stack — the Code Architecture AI structures the conversation and does the heavy documentation lifting.

## Pairing by Role

| Role | Primary Use |
|------|-------------|
| Software Engineer | AI reviews proposed design against known patterns, generates trade-off analysis, and drafts the ADR for team review |
| Staff / Principal Eng | AI generates C4 context and container diagrams from system descriptions, identifies missing NFRs, spots anti-patterns |
| Engineering Manager | AI produces architecture decision records backlog, documents existing system decisions, surfaces technical debt patterns |
| CTO / Architect | AI structures RFC documents, generates migration roadmaps, produces board-level system topology summaries |

The AI does not make architecture decisions — engineers do. The AI prepares the analysis, generates the documentation, and structures the trade-offs. The human applies judgment, organisational context, and technical intuition.

## ADR Generation (MADR Format)

Describe the decision context and constraints — the AI produces a complete MADR-format Architecture Decision Record ready for team review and version control.

```markdown
# ADR-001: Use Event Sourcing for Order Management

## Status
Accepted

## Context
Our order management system needs to support audit trails, temporal queries,
and eventual consistency between inventory, payments, and fulfilment services.
Current approach uses direct DB updates with no event history.

## Decision
Implement event sourcing using Cloudflare Queues + Durable Objects for the
order aggregate. Events are the source of truth; current state is a projection.

## Consequences
### Positive
- Complete audit trail of all order state changes
- Temporal queries ("what was the order state at T?") become trivial
- Event replay enables recovery and new projection creation

### Negative
- Increased complexity in query patterns (CQRS required)
- Event schema evolution requires versioning strategy
- Higher initial development effort (~2 sprint overhead)

## Alternatives Considered
- Change Data Capture (CDC): rejected — tighter DB coupling
- Audit log table: rejected — doesn't enable replay or projections
```

## C4 System Context Diagram (Mermaid)

Describe your system's actors and external dependencies — the AI generates a Mermaid C4 context diagram that renders directly in GitHub, Notion, or any Mermaid-compatible renderer.

```
C4Context
  title System Context — Order Platform
  Person(customer, "Customer", "Places and tracks orders")
  System(orderSystem, "Order Platform", "Manages the full order lifecycle")
  System_Ext(paymentGateway, "Payment Gateway", "Stripe / PayFast")
  System_Ext(warehouseWMS, "WMS", "Inventory and fulfilment")
  System_Ext(notificationSvc, "Notifications", "Email / SMS / Push")

  Rel(customer, orderSystem, "Places order, tracks status", "HTTPS")
  Rel(orderSystem, paymentGateway, "Authorises payment", "REST/TLS")
  Rel(orderSystem, warehouseWMS, "Sends pick instruction", "Event")
  Rel(orderSystem, notificationSvc, "Triggers notifications", "Event")
```

## Trade-off Matrix

State the architectural choice — the AI generates a structured trade-off matrix covering the dimensions that matter most for your context:

```markdown
| Dimension                   | Microservices         | Modular Monolith       | Decision                           |
|-----------------------------|----------------------|------------------------|------------------------------------|
| Development speed (early)   | Slower               | Faster                 | Monolith wins at <10 devs         |
| Independent deployment      | Yes                  | No                     | Microservices if CI/CD is mature  |
| Operational complexity      | High                 | Low                    | Monolith until scale demands      |
| Team autonomy               | Yes                  | Coupling risk          | Microservices with strong ownership|
| Data consistency            | Distributed          | ACID                   | Monolith for strong consistency   |
```

## Anti-pattern Detection

Describe your system's current structure — the AI identifies known anti-patterns with specific indicators and remediation recommendations:

```markdown
## Distributed Monolith (HIGH RISK)
Indicator: 12 microservices with synchronous HTTP calls between all of them.
           Any single service failure cascades to full system outage.
Remediation: Introduce async messaging (queues/events) for non-latency-critical
             paths. Add circuit breakers on synchronous calls. Consider merging
             services that are always deployed together.

## Chatty Microservices (MEDIUM RISK)
Indicator: Product page requires 8 sequential API calls to render.
           p95 latency = sum of all downstream p95s.
Remediation: Introduce a BFF (Backend for Frontend) that aggregates calls
             server-side. Or use GraphQL with dataloader batching.

## God Service (LOW-MEDIUM RISK)
Indicator: OrderService owns orders, inventory, notifications, and reporting.
           Single team bottleneck for all product changes.
Remediation: Extract NotificationService. Extract ReportingService.
             Keep OrderService focused on the order aggregate lifecycle.
```

## MCP Tools

| Tool | Description |
|------|-------------|
| `eng_generate_adr` | Generate a complete MADR or Nygard-format ADR from decision context and constraints |
| `eng_review_architecture` | Review a system description against known patterns and identify missing concerns |
| `eng_c4_diagram` | Generate C4 context, container, or component diagrams in Mermaid syntax |
| `eng_tradeoff_analysis` | Produce a structured trade-off matrix for a given architectural choice |
| `eng_detect_antipatterns` | Identify architectural anti-patterns from a system description with remediation guidance |
| `eng_db_selection` | Recommend database technology based on workload, consistency, and scale requirements |
| `eng_migration_plan` | Generate a migration roadmap with approach, phases, risk profile, and rollback strategy |
| `eng_nfr_analysis` | Structure non-functional requirements (availability, latency, throughput, security) for a system |
| `eng_pattern_recommend` | Recommend architecture patterns matching a described problem with implementation notes |

### Tool Schema: eng_generate_adr

```json
{
  "name": "eng_generate_adr",
  "description": "Generate a complete Architecture Decision Record in MADR format",
  "inputSchema": {
    "type": "object",
    "required": ["title", "context", "decision"],
    "properties": {
      "title":        { "type": "string", "description": "Short decision title" },
      "context":      { "type": "string", "description": "Problem statement and constraints" },
      "decision":     { "type": "string", "description": "The chosen approach" },
      "alternatives": { "type": "array",  "items": { "type": "string" }, "description": "Other options considered" },
      "format":       { "type": "string", "enum": ["madr", "nygard"], "default": "madr" },
      "adr_number":   { "type": "integer", "description": "ADR sequence number" }
    }
  }
}
```

## Architecture Patterns Reference

Core patterns the AI knows in detail — problem, solution, and key trade-offs:

| Pattern | Problem | Solution | Trade-offs |
|---------|---------|----------|------------|
| **Event Sourcing** | Need audit trail and temporal queries | Store events as source of truth; derive state via projection | + Auditability, replay. - Query complexity, event schema evolution |
| **CQRS** | Read and write models have different shape/scale needs | Separate command (write) and query (read) models and data stores | + Independent scaling. - Eventual consistency, sync overhead |
| **Saga** | Distributed transactions across services | Choreography or orchestration of compensating transactions | + No 2PC lock. - Complex failure handling, difficult to debug |
| **Outbox** | Atomic DB write + event publish (dual-write problem) | Write event to outbox table in same transaction; relay polls and publishes | + At-least-once delivery. - Polling latency, relay is a new component |
| **Circuit Breaker** | Cascading failures from unhealthy downstream dependency | Track failure rate; open circuit to fail fast instead of queuing | + Resilience, fast failure. - False positives, state management |
| **API Gateway** | Clients need a single entry point to multiple services | Gateway handles routing, auth, rate limiting, and protocol translation | + Centralised concerns. - Single point of failure, latency hop |
| **BFF** | Mobile and web need different API shapes from same backend | Backend for Frontend aggregates and shapes data per client type | + Client-optimised responses. - Duplicate logic risk if not abstracted |
| **Sidecar** | Cross-cutting concerns (logging, mTLS, tracing) pollute service code | Deploy proxy container alongside service; handles cross-cutting concerns | + Language-agnostic. - Resource overhead, network hop within pod |
| **Strangler Fig** | Rewriting a legacy system without big-bang cutover | Proxy intercepts traffic; gradually route paths to new system | + Low risk migration. - Long-running parallel systems, proxy complexity |
| **Bulkhead** | One slow consumer exhausts all thread pool / connection resources | Isolate resource pools per consumer category to contain failure | + Blast radius containment. - Resource underutilisation if pools idle |
| **Retry with Backoff** | Transient failures cause permanent errors without retry logic | Exponential backoff with jitter; retry budget to prevent thundering herd | + Resilience to transient faults. - Amplified load if misconfigured |
| **Rate Limiter** | Uncontrolled request volume degrades or crashes the service | Token bucket or sliding window algorithm enforces request rate per client | + Abuse protection, fair use. - Legitimate traffic throttled under burst |

## Common Gotchas

- **Distributed monolith is the most common microservices failure mode** — if services cannot be deployed independently and any one failure takes down the whole system, you have a distributed monolith regardless of how many services you have. Check for synchronous call chains at design time, not after the outage.
- **N+1 queries kill GraphQL naive implementations** — any GraphQL resolver that calls a data source per list item will multiply database calls by list length. Require DataLoader (or equivalent batching) as a design constraint before GraphQL adoption.
- **Multi-tenant DB isolation has a connection pool cliff** — schema-per-tenant sounds clean until you have 200 tenants: Postgres connection pools exhaust quickly because each schema requires its own connection context. Row-level security (RLS) scales connection pool better; schema-per-tenant is viable only for a small number of high-value isolated tenants.
- **Terminal value dominates DCF-style thinking about architecture** — the long-term operational cost of a complex architecture often dwarfs its build cost. Model the operational burden (on-call complexity, tooling overhead, team size required) before committing to microservices.
- **ADRs are most valuable when written at decision time** — retrospective ADRs are useful for documentation but miss the options that were considered and rejected. Establish the habit of writing ADRs before implementation, not after.
- **C4 diagrams drift** — architecture diagrams become incorrect within weeks of major changes if not maintained. Treat them as living documents; assign ownership and review quarterly.

## See Also

- [tech/cloudflare/workers](../cloudflare/workers/SKILL.md) — Cloudflare Workers deployment substrate
- [tech/cloudflare/durable-objects](../cloudflare/durable-objects/SKILL.md) — stateful compute for event sourcing patterns
- [tech/cloudflare/queues](../cloudflare/queues/SKILL.md) — async messaging for distributed patterns
