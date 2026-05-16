---
name: tech/microsoft/azure-ai
description: |
  Microsoft Azure AI agentic platform skill. Use this skill when:
  (1) calling Azure OpenAI (GPT-4o, o3, embeddings) from Cloudflare Workers via REST,
  (2) building persistent agentic workflows with Azure AI Agent Service — threads, tool calls, file search,
  (3) orchestrating multi-step tool use with Semantic Kernel plugins from a Worker or Cloud Run container,
  (4) exposing 2nth.ai agents to Microsoft Copilot Studio via MCP or custom connectors,
  (5) building RAG pipelines with Azure AI Search (hybrid vector + keyword) as the retrieval layer,
  (6) routing: Workers AI classifies intent at the edge → Azure AI Agent handles the stateful thread,
  (7) connecting M365 data (mail, calendar, Teams) into an agent tool via Graph API.
license: MIT
compatibility: Azure OpenAI REST API, Azure AI Agent Service REST API, Semantic Kernel SDK, Copilot Studio, MCP
homepage: https://skills.2nth.ai/tech/microsoft/azure-ai
repository: https://github.com/2nth-ai/skills
requires:
  - tech/microsoft
improves:
  - tech/microsoft
  - tech
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Azure AI, Azure OpenAI, AI Agents, Semantic Kernel, Copilot Studio, MCP, RAG"
allowed-tools: Bash(az:*) Read Write Edit Glob Grep
---

# Azure AI — Agentic Platform

Microsoft's agentic AI stack in 2025/2026 centres on four layers:

| Layer | Technology | Role |
|-------|-----------|------|
| **Models** | Azure OpenAI (GPT-4o, o3, o1), Azure AI Foundry model catalog | Foundation models, reasoning, embeddings |
| **Agents** | Azure AI Agent Service | Managed threads, tool execution, file search, code interpreter |
| **Orchestration** | Semantic Kernel | Plugin routing, planner, multi-agent process framework |
| **Surface** | Copilot Studio / M365 Agents SDK | Expose agents in Teams, Outlook, Copilot Chat |

The **2nth.ai pattern**: Workers AI classifies intent at the edge (zero latency) → Azure AI Agent handles the stateful, multi-step thread → results stream back through the Worker.

## Azure OpenAI — calling from Workers

Azure OpenAI uses the same REST API shape as OpenAI but with a different base URL and `api-version` parameter. Auth via API key or Entra ID token.

```typescript
// Chat completion — GPT-4o
const res = await fetch(
  `${env.AZURE_OPENAI_ENDPOINT}/openai/deployments/gpt-4o/chat/completions?api-version=2025-01-01-preview`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': env.AZURE_OPENAI_KEY,
      // OR: Authorization: `Bearer ${await getAzureToken(env, 'https://cognitiveservices.azure.com/.default')}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a helpful business assistant.' },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 1000,
      temperature: 0.3,
    }),
  }
);
const data = await res.json();
const reply = data.choices[0].message.content;
```

**Current model deployments (2025/2026):**
| Deployment name | Model | Best for |
|----------------|-------|---------|
| `gpt-4o` | GPT-4o | General assistant, structured output, tool use |
| `gpt-4o-mini` | GPT-4o mini | Fast classification, low-cost tasks |
| `o3-mini` | o3-mini | Complex reasoning, coding, multi-step planning |
| `o1` | o1 | Deep reasoning, long-context analysis |
| `text-embedding-3-large` | Embedding | RAG, semantic search, Vectorize |

### Structured output (JSON schema)
```typescript
body: JSON.stringify({
  model: 'gpt-4o',
  messages: [...],
  response_format: {
    type: 'json_schema',
    json_schema: {
      name: 'invoice_extraction',
      strict: true,
      schema: {
        type: 'object',
        properties: {
          vendor: { type: 'string' },
          amount: { type: 'number' },
          due_date: { type: 'string' },
          line_items: { type: 'array', items: { type: 'object', properties: { description: { type: 'string' }, amount: { type: 'number' } }, required: ['description','amount'], additionalProperties: false } },
        },
        required: ['vendor','amount','due_date','line_items'],
        additionalProperties: false,
      },
    },
  },
})
```

## Azure AI Agent Service

Managed agent infrastructure with persistent threads. Think OpenAI Assistants v2, hosted in Azure, with enterprise auth and Azure AI Search integration.

### Concepts
- **Agent** — a configured AI with a system prompt, model, and tools
- **Thread** — a persistent conversation session with a user (stored in Azure)
- **Run** — executing the agent against a thread; may involve multiple tool calls
- **Tool** — function (your Worker endpoint), file search (Azure AI Search), code interpreter

### Create an agent
```typescript
const agent = await fetch(
  `${env.AZURE_AI_PROJECT_ENDPOINT}/agents/v1.0/agents`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': env.AZURE_AI_KEY },
    body: JSON.stringify({
      model: 'gpt-4o',
      name: '2nth-erp-assistant',
      instructions: `You are an ERP assistant for 2nth.ai clients. You can query invoices, 
        check stock, and draft supplier communications. Always confirm before taking actions.`,
      tools: [
        { type: 'file_search' },
        { type: 'code_interpreter' },
        {
          type: 'function',
          function: {
            name: 'query_invoices',
            description: 'Query open invoices from the ERP system',
            parameters: {
              type: 'object',
              properties: {
                client_name: { type: 'string', description: 'Filter by client name' },
                status: { type: 'string', enum: ['open', 'overdue', 'paid'] },
              },
            },
          },
        },
      ],
    }),
  }
).then(r => r.json());
```

### Thread lifecycle (Worker handler)
```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { message, threadId: existingThreadId } = await request.json() as {
      message: string; threadId?: string;
    };

    const base = env.AZURE_AI_PROJECT_ENDPOINT + '/agents/v1.0';
    const headers = { 'Content-Type': 'application/json', 'api-key': env.AZURE_AI_KEY };

    // 1. Get or create thread
    const threadId = existingThreadId ?? (
      await fetch(`${base}/threads`, { method: 'POST', headers, body: '{}' })
        .then(r => r.json()).then(d => d.id)
    );

    // 2. Add user message to thread
    await fetch(`${base}/threads/${threadId}/messages`, {
      method: 'POST', headers,
      body: JSON.stringify({ role: 'user', content: message }),
    });

    // 3. Create a run
    let run = await fetch(`${base}/threads/${threadId}/runs`, {
      method: 'POST', headers,
      body: JSON.stringify({ assistant_id: env.AZURE_AGENT_ID }),
    }).then(r => r.json());

    // 4. Poll until complete (handle tool calls)
    while (run.status === 'queued' || run.status === 'in_progress' || run.status === 'requires_action') {
      await new Promise(r => setTimeout(r, 800));
      run = await fetch(`${base}/threads/${threadId}/runs/${run.id}`, { headers }).then(r => r.json());

      if (run.status === 'requires_action') {
        const toolCalls = run.required_action.submit_tool_outputs.tool_calls;
        const outputs = await Promise.all(toolCalls.map(async (tc: any) => {
          const args = JSON.parse(tc.function.arguments);
          let output = '';

          if (tc.function.name === 'query_invoices') {
            // Call your own Worker/D1/ERPNext
            const invoices = await env.DB.prepare(
              'SELECT * FROM invoices WHERE status = ? LIMIT 10'
            ).bind(args.status ?? 'open').all();
            output = JSON.stringify(invoices.results);
          }

          return { tool_call_id: tc.id, output };
        }));

        // Submit tool outputs
        await fetch(`${base}/threads/${threadId}/runs/${run.id}/submit_tool_outputs`, {
          method: 'POST', headers,
          body: JSON.stringify({ tool_outputs: outputs }),
        });
      }
    }

    // 5. Get the assistant reply
    const messages = await fetch(
      `${base}/threads/${threadId}/messages?order=desc&limit=1`, { headers }
    ).then(r => r.json());

    const reply = messages.data[0].content[0].text.value;
    return Response.json({ reply, threadId });
  }
};
```

## Semantic Kernel — orchestration layer

Semantic Kernel (SK) is Microsoft's orchestration SDK. Use it from a Cloud Run container (Node.js/Python) when you need multi-agent coordination, complex planning, or plugin chaining that's too stateful for a Worker.

### Worker → Cloud Run → SK pattern
```typescript
// Cloudflare Worker: classify + route
const intent = await classifyWithWorkersAI(message, env);

if (intent === 'complex_multi_step') {
  // Hand off to Cloud Run container running Semantic Kernel
  const result = await fetch(env.SK_SERVICE_URL + '/orchestrate', {
    method: 'POST',
    headers: { Authorization: `Bearer ${await getCloudRunToken(env)}` },
    body: JSON.stringify({ message, threadId, context }),
  }).then(r => r.json());
  return result;
}
// Simple → handle in Worker directly with Azure OpenAI
```

### SK plugin definition (TypeScript)
```typescript
import { kernel, KernelFunction, KernelArguments } from '@microsoft/semantic-kernel';

class ERPPlugin {
  @KernelFunction()
  @kernel.function({ description: 'Get open invoices from ERPNext' })
  async getOpenInvoices(
    @kernel.parameter({ description: 'Client name filter', required: false })
    clientName?: string
  ): Promise<string> {
    const res = await fetch(`${ERP_BASE_URL}/api/method/frappe.client.get_list`, {
      headers: { Authorization: `token ${API_KEY}:${API_SECRET}` },
      // ...
    });
    return JSON.stringify(await res.json());
  }
}

// Register and invoke
const k = kernel.builder()
  .addAzureOpenAIChatCompletion('gpt-4o', endpoint, apiKey)
  .build();
k.importPluginFromObject(new ERPPlugin(), 'ERP');

const result = await k.invokePromptAsync(
  'Find all overdue invoices for {{$client}} and draft a payment reminder.',
  new KernelArguments({ client: 'Acme Corp' })
);
```

## Copilot Studio — MCP connector

Expose any 2nth.ai Worker as a tool in Microsoft Copilot Studio using the MCP protocol. Copilot Studio added native MCP support in 2025.

```
2nth Worker (MCP server)
  → Copilot Studio MCP connector
  → Microsoft 365 Copilot Chat
  → Teams / Outlook / Word
```

### Worker as MCP server (minimal)
```typescript
// GET /.well-known/mcp — MCP server manifest
// POST /mcp/tools/call — tool invocation

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/.well-known/mcp') {
      return Response.json({
        schema_version: '2025-11-05',
        name: '2nth-erp',
        description: 'Query ERP data — invoices, stock, suppliers',
        tools: [
          {
            name: 'query_invoices',
            description: 'List invoices by status or client',
            inputSchema: {
              type: 'object',
              properties: {
                status: { type: 'string', enum: ['open','overdue','paid'] },
                client: { type: 'string' },
              },
            },
          },
        ],
      });
    }

    if (url.pathname === '/mcp/tools/call' && request.method === 'POST') {
      const { name, arguments: args } = await request.json() as any;
      // ... dispatch to tool handlers
      return Response.json({ content: [{ type: 'text', text: result }] });
    }

    return new Response('Not found', { status: 404 });
  }
};
```

### Register in Copilot Studio
```
1. Copilot Studio → Your copilot → Tools → Add a tool → MCP
2. Server URL: https://your-worker.workers.dev
3. Auth: API key header (X-API-Key → your Worker secret)
4. Copilot Studio auto-discovers tools from /.well-known/mcp
5. Enable tool → test in Copilot Chat → publish to Teams/Outlook
```

## Azure AI Search — RAG retrieval

Azure AI Search is the enterprise RAG layer. Hybrid search (vector + BM25 keyword) outperforms pure vector search for most business document scenarios.

```typescript
// Index a document
await fetch(`${env.AZURE_SEARCH_ENDPOINT}/indexes/erp-docs/docs/index?api-version=2024-07-01`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'api-key': env.AZURE_SEARCH_KEY },
  body: JSON.stringify({
    value: [{
      '@search.action': 'upload',
      id: docId,
      content: documentText,
      contentVector: await getEmbedding(documentText, env), // text-embedding-3-large
      source: 'erpnext',
      clientId: 'acme-corp',
    }],
  }),
});

// Hybrid search
const results = await fetch(
  `${env.AZURE_SEARCH_ENDPOINT}/indexes/erp-docs/docs/search?api-version=2024-07-01`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': env.AZURE_SEARCH_KEY },
    body: JSON.stringify({
      search: userQuery,               // BM25 keyword
      vectorQueries: [{
        kind: 'vector',
        vector: await getEmbedding(userQuery, env),
        fields: 'contentVector',
        k: 5,
      }],
      queryType: 'semantic',
      semanticConfiguration: 'default',
      top: 5,
      select: 'id,content,source,clientId',
    }),
  }
).then(r => r.json());
```

## 2nth.ai agentic routing pattern

```
User message (Web / Teams / WhatsApp)
  → Cloudflare Worker
      ↓
  Workers AI (Llama 3.1 8B) — classify intent: simple | complex | erp | document
      ↓
  [simple]    → Azure OpenAI GPT-4o mini — direct answer, stream back
  [complex]   → Azure AI Agent Service — create/resume thread, run with tools
  [erp]       → Azure AI Agent + ERPNext function tool via Cloud Run
  [document]  → Azure AI Agent + Azure AI Search file_search tool
      ↓
  D1 / KV — persist threadId per user session
  R2 — store uploaded files before indexing
```

## Rate limits and quotas

| Service | Default quota | Notes |
|---------|--------------|-------|
| GPT-4o | 450k TPM (tokens/min) | Request increase for production |
| GPT-4o mini | 2M TPM | Good for classification/routing |
| o3-mini | 150k TPM | Lower — use for complex tasks only |
| AI Agent Service | 50 concurrent runs | Scales with quota request |
| Azure AI Search | 3 indexes (free tier) | Standard S1: 50 indexes |

## Gotchas

- **`api-version` is mandatory** on every Azure OpenAI call — use `2025-01-01-preview` or latest stable; missing it returns 404
- **Thread polling in Workers** — Workers have a 30s CPU limit; for long-running agent runs (>30s), return the `threadId` and let the client poll a `/status` endpoint
- **Streaming from Workers** — Azure OpenAI supports `stream: true`; use `TransformStream` in the Worker to stream SSE back to the browser
- **Token caching** — access tokens are valid 1 hour; cache in KV with `expirationTtl: 3500` to avoid a token fetch on every request
- **MCP in Copilot Studio** — requires the MCP server to be publicly reachable and respond to the manifest within 5s; Workers are ideal
- **Azure AI Search free tier** — 3 indexes, 50MB total; upgrade to Standard S1 for production RAG workloads
- **Region availability** — `eastus` and `westeurope` have the broadest model availability; `southafricanorth` has limited Azure OpenAI capacity — check before designing
