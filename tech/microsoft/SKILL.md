---
name: tech/microsoft
description: |
  Microsoft platform skills — Azure AI, M365, and the Entra ID identity layer. Use skills in this domain when:
  (1) calling Azure OpenAI, Azure AI Agent Service, or Azure AI Foundry from Cloudflare Workers,
  (2) building agentic workflows with Semantic Kernel, AutoGen, or Azure AI Agent Service threads,
  (3) integrating with Microsoft 365 via the Graph API — emails, calendars, Teams, SharePoint, OneDrive,
  (4) authenticating to any Microsoft API using Azure AD / Entra ID — client credentials or delegated,
  (5) exposing 2nth.ai skills to Microsoft Copilot Studio or Teams via MCP or custom connectors,
  (6) running hybrid Cloudflare + Azure architectures — edge routing, Azure for AI compute and M365 data.
license: MIT
homepage: https://skills.2nth.ai/tech/microsoft
repository: https://github.com/2nth-ai/skills
improves:
  - tech
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Microsoft, Azure, Azure AI, M365, Entra ID, Graph API, Copilot"
allowed-tools: Bash(az:*) Read Write Edit Glob Grep
---

# Microsoft Platform

Two product families under one identity model:

| Family | Slug | What it covers |
|--------|------|---------------|
| **Azure AI** | `tech/microsoft/azure-ai` | Azure OpenAI, AI Agent Service, Foundry, Semantic Kernel, Copilot Studio |
| **Microsoft 365** | `tech/microsoft/m365` *(coming)* | Graph API — Mail, Calendar, Teams, SharePoint, OneDrive |

Both share the same authentication layer: **Azure AD / Microsoft Entra ID**. Understand it once, apply everywhere.

## Authentication model — Azure AD / Entra ID

Microsoft uses OAuth 2.0 with Entra ID as the identity provider. Two patterns cover all server-to-server and user-delegated scenarios.

### Client Credentials (server-to-server)
Used when a Worker or backend service acts as a system identity — no user login. This is the primary pattern for calling Azure AI services from Cloudflare Workers.

```
1. Register an app in Azure portal (Entra ID → App registrations)
2. Add a client secret (Certificates & secrets → New client secret)
3. Grant API permissions: e.g. Cognitive Services User, Graph Mail.Read
4. Note: tenant_id, client_id, client_secret
5. POST to /oauth2/v2.0/token → get access_token (1-hour TTL)
```

```typescript
async function getAzureToken(env: Env, scope: string): Promise<string> {
  const res = await fetch(
    `https://login.microsoftonline.com/${env.AZURE_TENANT_ID}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id:     env.AZURE_CLIENT_ID,
        client_secret: env.AZURE_CLIENT_SECRET,
        scope,
        grant_type:    'client_credentials',
      }),
    }
  );
  const { access_token } = await res.json() as { access_token: string };
  return access_token;
}

// Usage
const aiToken    = await getAzureToken(env, 'https://cognitiveservices.azure.com/.default');
const graphToken = await getAzureToken(env, 'https://graph.microsoft.com/.default');
```

### Delegated (on behalf of a user)
Used when the integration reads a user's mailbox, calendar, or OneDrive. Requires an interactive login to get an authorization code, then exchanges for tokens.

```typescript
// Refresh an existing delegated token
async function refreshDelegatedToken(env: Env, refreshToken: string): Promise<string> {
  const res = await fetch(
    `https://login.microsoftonline.com/${env.AZURE_TENANT_ID}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id:     env.AZURE_CLIENT_ID,
        client_secret: env.AZURE_CLIENT_SECRET,
        refresh_token: refreshToken,
        scope:         'https://graph.microsoft.com/.default offline_access',
        grant_type:    'refresh_token',
      }),
    }
  );
  const { access_token } = await res.json() as { access_token: string };
  return access_token;
}
```

**Required secrets (wrangler):**
```
AZURE_TENANT_ID       # Directory (tenant) ID from app overview
AZURE_CLIENT_ID       # Application (client) ID
AZURE_CLIENT_SECRET   # Value of the client secret
AZURE_OPENAI_ENDPOINT # https://<resource>.openai.azure.com
AZURE_OPENAI_KEY      # API key (alternative to token auth for OpenAI)
```

## Scope reference

| API | Client credentials scope | Delegated scope |
|-----|-------------------------|-----------------|
| Azure OpenAI / Cognitive | `https://cognitiveservices.azure.com/.default` | same |
| Microsoft Graph (all M365) | `https://graph.microsoft.com/.default` | `Mail.Read Calendar.Read` etc. |
| Azure Resource Manager | `https://management.azure.com/.default` | — |
| Azure AI Search | `https://search.azure.com/.default` | — |

## App registration checklist

```bash
# Create via Azure CLI
az ad app create --display-name "2nth-worker" \
  --sign-in-audience AzureADMyOrg

az ad sp create --id <appId>

az ad app credential reset --id <appId> \
  --append --display-name "worker-secret"

# Grant API permissions (then admin consent in portal)
az ad app permission add --id <appId> \
  --api 00000003-0000-0000-c000-000000000000 \  # Graph
  --api-permissions e1fe6dd8-ba31-4d61-89e7-88639da4683d=Role  # User.Read.All
```

## Sub-skills

| Skill | Path | Status |
|-------|------|--------|
| Azure AI (OpenAI, Agents, Foundry, Copilot) | `tech/microsoft/azure-ai` | Active |
| Microsoft 365 / Graph API | `tech/microsoft/m365` | Pending |
