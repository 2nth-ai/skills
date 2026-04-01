---
name: AI Agent Communication Protocols
description: >
  The open standards and patterns for building chains of AI agents that
  communicate, delegate, and collaborate — covering MCP, A2A, ACP, agent
  orchestration topologies, and practical implementation on edge and cloud.
requires:
  - tech/architecture
improves:
  - tech
metadata:
  domain: tech
  subdomain: agent-protocols
  maturity: stable
  version: "1.0.0"
---

# AI Agent Communication Protocols

Multi-agent systems move AI from isolated question-answering to distributed work: one agent plans, another retrieves data, another executes code, another verifies output. Getting agents to communicate reliably requires agreed-upon protocols — the same reason HTTP exists for browsers and servers.

As of 2025, three open protocols have emerged as the dominant standards:

| Protocol | Originator | Scope | Status |
|----------|-----------|-------|--------|
| **MCP** (Model Context Protocol) | Anthropic | Model ↔ tools/data | Widely adopted; de facto standard |
| **A2A** (Agent-to-Agent) | Google | Agent ↔ Agent | Open spec; growing adoption |
| **ACP** (Agent Communication Protocol) | Linux Foundation / IBM | Agent ↔ Agent (REST) | Early adoption; enterprise focus |

These protocols are complementary, not competing. MCP handles how an agent accesses tools and data. A2A and ACP handle how agents talk to each other.

---

## MCP — Model Context Protocol

### What It Is

MCP is an open standard (MIT licence) for connecting AI models to external context — tools, data sources, and prompts. Think of it as USB-C for AI: one protocol that any model can use to plug into any tool.

Published by Anthropic in November 2024. Adopted by: Claude, Cursor, Windsurf, Cline, Sourcegraph, Zed, and dozens of third-party servers.

### Architecture

```
┌─────────────────────────────────┐
│         MCP HOST                │
│  (Claude Desktop, Cursor, etc.) │
│                                 │
│  ┌──────────────────────────┐   │
│  │      MCP CLIENT          │   │
│  │  (manages connections)   │   │
│  └──────┬───────────────────┘   │
└─────────│───────────────────────┘
          │  JSON-RPC 2.0
          │  (stdio / SSE / HTTP)
          ▼
┌─────────────────────┐
│     MCP SERVER      │
│  (your tool/data)   │
│                     │
│  ├── Resources      │  ← files, DB rows, API responses
│  ├── Tools          │  ← functions the model can call
│  ├── Prompts        │  ← reusable prompt templates
│  └── Sampling       │  ← server asks model to generate text
└─────────────────────┘
```

### The Four MCP Primitives

**Resources** — Expose data the model can read:
```json
{
  "uri": "file:///project/src/agents.ts",
  "mimeType": "text/typescript",
  "text": "export const AGENTS = [...]"
}
```

**Tools** — Functions the model can invoke:
```json
{
  "name": "query_database",
  "description": "Run a SQL query against the data warehouse",
  "inputSchema": {
    "type": "object",
    "properties": {
      "sql": { "type": "string" },
      "database": { "type": "string", "enum": ["production", "analytics"] }
    },
    "required": ["sql"]
  }
}
```

**Prompts** — Reusable prompt templates with arguments:
```json
{
  "name": "code_review",
  "arguments": [
    { "name": "language", "required": true },
    { "name": "focus", "required": false }
  ]
}
```

**Sampling** — Server requests a model completion (enables recursive agent patterns):
```json
{
  "method": "sampling/createMessage",
  "params": {
    "messages": [...],
    "maxTokens": 1024
  }
}
```

### Transport Options

| Transport | Use Case | Notes |
|-----------|---------|-------|
| **stdio** | Local processes; CLI tools | Most common for local MCP servers |
| **HTTP + SSE** | Remote servers; cloud-hosted tools | Use for production deployments |
| **WebSocket** | Bidirectional real-time | Lower overhead than SSE for high-frequency calls |

### Building an MCP Server (TypeScript)

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server(
  { name: 'skills-server', version: '1.0.0' },
  { capabilities: { tools: {}, resources: {} } }
);

// Register a tool
server.setRequestHandler('tools/call', async (request) => {
  if (request.params.name === 'resolve_skill') {
    const { path } = request.params.arguments;
    const content = await fetchSkill(path);
    return { content: [{ type: 'text', text: content }] };
  }
  throw new Error(`Unknown tool: ${request.params.name}`);
});

// Register a resource
server.setRequestHandler('resources/read', async (request) => {
  const skill = await fetchSkill(request.params.uri.replace('skill://', ''));
  return { contents: [{ uri: request.params.uri, text: skill }] };
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

### MCP Security Model

- Servers cannot initiate connections — clients connect to servers
- Tool calls require explicit model invocation — the model decides when to call a tool
- Human-in-the-loop: hosts (like Claude Desktop) can require user approval before tool execution
- Servers should validate all inputs; never trust tool arguments without sanitisation
- OAuth 2.1 is the recommended auth mechanism for remote MCP servers

---

## A2A — Agent-to-Agent Protocol

### What It Is

A2A (published by Google, April 2025, open spec at google.github.io/A2A) defines how AI agents discover and communicate with other AI agents. Where MCP connects agents to tools, A2A connects agents to agents.

### Core Concepts

**Agent Card** — A machine-readable capability manifest. Every A2A agent publishes one at `/.well-known/agent.json`:

```json
{
  "name": "Grant — Financial Agent",
  "description": "Cash flow, P&L, runway, and South African tax compliance.",
  "url": "https://agents.2nth.ai/agents/grant",
  "version": "1.0.0",
  "capabilities": {
    "streaming": true,
    "pushNotifications": false
  },
  "skills": [
    {
      "id": "fin/cash-flow",
      "name": "Cash Flow Management",
      "description": "13-week rolling forecast, working capital, runway planning",
      "examples": ["What is my current runway?", "Build a 13-week cash flow forecast"]
    }
  ],
  "authentication": {
    "schemes": ["bearer"]
  }
}
```

**Task** — The unit of work in A2A:

```json
{
  "id": "task-uuid-1234",
  "sessionId": "session-uuid-5678",
  "status": {
    "state": "working",
    "timestamp": "2025-04-01T10:00:00Z"
  },
  "message": {
    "role": "user",
    "parts": [{ "text": "Analyse our Q1 cash position and flag any risks." }]
  }
}
```

**Task lifecycle**:
```
submitted → working → [input-required] → working → completed
                                                  ↘ failed
                                                  ↘ cancelled
```

### A2A Request/Response Flow

```
Client Agent (Katharine — CRO)
    │
    │  POST /tasks/send
    │  { message: "What is our current runway?", sessionId: "..." }
    ▼
Server Agent (Grant — CFO)
    │
    ├── Returns: { status: "working" }  (if streaming: SSE begins)
    │
    ├── SSE events during processing:
    │   data: { type: "working", artifact: { parts: [{ text: "Analysing..." }] } }
    │
    └── Final: { status: "completed", artifact: { parts: [{ text: "Runway: 8.3 months..." }] } }
```

### Agent Discovery

Agents discover each other either:
1. **Static**: Hard-coded agent URLs in an agent registry
2. **Dynamic**: Search an Agent Directory (a catalogue of Agent Cards)

```typescript
// Fetch an agent's capabilities before routing
const agentCard = await fetch('https://agents.2nth.ai/.well-known/agent.json').then(r => r.json());
const canHandleTask = agentCard.skills.some(s => s.id === requiredSkillId);
```

---

## ACP — Agent Communication Protocol

### What It Is

ACP (Linux Foundation AI & Data, 2025) is a REST-based protocol for agent-to-agent communication in enterprise environments. It is more prescriptive than A2A about message structure, error handling, and observability.

### Key Differences from A2A

| | A2A | ACP |
|--|-----|-----|
| **Message format** | JSON with `parts` array | Structured `Message` with typed attachments |
| **Discovery** | Agent Cards at `/.well-known/agent.json` | Agent Registry service |
| **Auth** | OAuth 2.1 | OAuth 2.1 + API keys |
| **Streaming** | SSE | SSE + WebSocket |
| **Focus** | General agent interop | Enterprise, regulated industries |

### ACP Message Structure

```json
{
  "message_id": "msg-uuid",
  "created_at": "2025-04-01T10:00:00Z",
  "sender": {
    "agent_id": "agent-katharine",
    "run_id": "run-uuid"
  },
  "content": [
    { "type": "text/plain", "data": "What is our Q1 pipeline conversion rate?" }
  ],
  "metadata": {
    "session_id": "session-uuid",
    "correlation_id": "corr-uuid"
  }
}
```

---

## Agent Orchestration Topologies

Protocols define how agents communicate. Topology defines how they are arranged.

### 1. Sequential Chain

Each agent processes output from the prior agent. Simple, predictable.

```
User → Agent A → Agent B → Agent C → Response
```

**Use when**: Tasks have a clear linear dependency. Example: Research → Summarise → Format.

**Risk**: A failure at any step blocks the whole chain.

### 2. Supervisor / Orchestrator

One agent decomposes a task and routes subtasks to specialist agents. Collects and synthesises results.

```
         ┌─── Specialist A (data retrieval)
User → Orchestrator ─── Specialist B (analysis)     → Synthesised Response
         └─── Specialist C (formatting)
```

**Use when**: Tasks require multiple independent capabilities. Example: 2nth.ai agents — Leo routes legal questions, Grant handles financials, Katharine handles revenue.

**Implementation**: Orchestrator holds conversation context; specialists are stateless. Orchestrator decides routing based on intent classification.

### 3. Peer-to-Peer with Handoff

Agents handle tasks directly but can hand off to peers when out of domain. Conversation history travels with the handoff.

```
User → Agent A
       Agent A detects out-of-domain
       Agent A → [handoff with context] → Agent B
                                          Agent B continues
```

**This is what agents.2nth.ai implements** via the `__handoff__` JSON signal in responses.

### 4. Hierarchical Multi-Tier

Director agents manage specialist agents; specialist agents may manage worker agents. Mirrors human org structure.

```
Director Agent (strategic decomposition)
    ├── Domain Agent A (tactical planning)
    │       ├── Worker A1 (tool execution)
    │       └── Worker A2 (tool execution)
    └── Domain Agent B (tactical planning)
            └── Worker B1 (tool execution)
```

**Use when**: Tasks are large enough to require independent sub-teams. Example: a software project where an architect agent delegates to frontend, backend, and data agents.

### 5. Critic / Debate Pattern

Two agents produce competing outputs; a judge agent evaluates and selects or synthesises.

```
User → Generator A → Critic
       Generator B ↗       → Final Response
```

**Use when**: Output quality and accuracy are paramount. Example: legal contract review where two analysis agents identify issues and a synthesis agent produces the final report.

---

## Practical Implementation Patterns

### Structured Handoff Payload

When an agent hands off to another, include full context:

```typescript
interface Handoff {
  to_agent: string;          // target agent identifier
  reason: string;            // why the handoff is happening
  conversation: Message[];   // full conversation history
  context: {                 // structured context to prime the new agent
    original_intent: string;
    completed_steps: string[];
    pending_task: string;
    relevant_artifacts?: Record<string, unknown>;
  };
}
```

### Agent Registry

A registry maps capability requirements to agent endpoints:

```typescript
const AGENT_REGISTRY = {
  'fin/*':    { url: 'https://agents.2nth.ai/agents/grant',    card: '...' },
  'leg/*':    { url: 'https://agents.2nth.ai/agents/leo',      card: '...' },
  'mkt/*':    { url: 'https://agents.2nth.ai/agents/penny',    card: '...' },
  'data/*':   { url: 'https://agents.2nth.ai/agents/alex',     card: '...' },
  'biz/sales': { url: 'https://agents.2nth.ai/agents/katharine', card: '...' },
};

async function routeTask(task: string, intentPath: string): Promise<AgentEndpoint> {
  const match = Object.entries(AGENT_REGISTRY).find(([pattern]) =>
    minimatch(intentPath, pattern)
  );
  if (!match) throw new Error(`No agent registered for: ${intentPath}`);
  return match[1];
}
```

### Idempotent Task IDs

In distributed agent chains, the same task may be submitted more than once (network retries, orchestrator restarts). Design task handling to be idempotent:

```typescript
// Use a deterministic task ID based on content + session
const taskId = crypto.subtle.digest(
  'SHA-256',
  new TextEncoder().encode(`${sessionId}:${taskContent}`)
).then(hash => btoa(String.fromCharCode(...new Uint8Array(hash))));
```

### Streaming in Agent Chains

Prefer streaming at every hop so the user sees progress as it happens, not just a final result after all agents finish:

```
User's browser ←SSE── Orchestrator ←SSE── Specialist Agent
                           ↑
                       Re-streams specialist events
                       with agent attribution metadata
```

Each streamed event should include `agent_id` so the UI can attribute partial outputs to the correct agent.

### Error Propagation

Define what happens when an agent in a chain fails:

```typescript
enum AgentFailurePolicy {
  FAIL_FAST = 'fail_fast',      // Abort the whole chain
  SKIP = 'skip',                // Continue with remaining agents
  RETRY = 'retry',              // Retry up to N times with backoff
  FALLBACK = 'fallback',        // Route to a backup agent
  HUMAN_ESCALATION = 'escalate' // Pause chain; notify human
}
```

For production agent chains: use `RETRY` (max 3, exponential backoff) for transient failures, `FALLBACK` for agent unavailability, `HUMAN_ESCALATION` for ambiguous inputs that no agent can handle confidently.

---

## Observability for Agent Chains

Distributed agents fail in distributed ways. Observability is non-negotiable.

### Trace Context

Every task must carry a trace ID through the entire chain (W3C Trace Context format):

```
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
              │  └── trace-id (16 bytes)           └── span-id   │
              │                                                   └── flags
              └── version
```

Inject this header at the chain entry point; propagate to every downstream agent call.

### What to Log per Agent Invocation

```typescript
{
  trace_id: string,
  span_id: string,
  parent_span_id: string,
  agent_id: string,
  task_id: string,
  input_tokens: number,
  output_tokens: number,
  model: string,
  latency_ms: number,
  status: 'success' | 'failure' | 'timeout',
  error?: string,
  tool_calls?: { name: string; latency_ms: number }[],
  timestamp: string
}
```

### Metrics to Track

| Metric | Alert Threshold |
|--------|----------------|
| End-to-end chain latency | P95 > 30s |
| Per-agent success rate | < 98% |
| Token consumption rate | > budget per task type |
| Handoff rate by agent | Sudden spike = routing bug |
| Task abandonment rate | > 5% = UX or capability gap |

---

## Protocol Selection Guide

| Scenario | Recommended Protocol |
|----------|---------------------|
| Agent needs to call external tools (APIs, DBs, files) | **MCP** |
| Agent needs to delegate to another agent | **A2A** |
| Enterprise regulated environment; audit trail required | **ACP** |
| Internal agents in the same codebase | Direct function calls + typed interfaces |
| Agent chain with streaming to end-user | A2A over SSE |
| Discovery of unknown agents at runtime | A2A Agent Cards |
| Custom protocol within a single platform | Handoff JSON + SSE (current 2nth.ai pattern) |
