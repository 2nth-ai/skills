---
name: tech/github
description: |
  GitHub platform skill. Use when:
  (1) automating repositories — create, update, branch, tag via REST API,
  (2) managing issues and pull requests — open, comment, review, merge programmatically,
  (3) building GitHub Actions workflows — CI/CD, automated releases, matrix builds,
  (4) building GitHub Apps or OAuth Apps — fine-grained tokens, webhooks, org-level access,
  (5) integrating Copilot — Copilot API, extensions, data policy compliance,
  (6) code search and analysis — code search API, SARIF upload, code scanning,
  (7) working with GitHub in Cloudflare Workers or AWS Lambda — Octokit, REST, webhooks.
license: MIT
compatibility: GitHub REST API v3, GraphQL API v4, Octokit v21 (TypeScript/JS), GitHub Actions, GitHub Apps
homepage: https://skills.2nth.ai/tech/github
repository: https://github.com/2nth-ai/skills
improves:
  - tech
metadata:
  author: 2nth.ai
  version: "1.0.0"
  maturity: stub
  categories: "GitHub, REST API, Octokit, GitHub Actions, GitHub Apps, Copilot, webhooks, CI/CD, repositories, issues, pull requests"
---

# GitHub

GitHub is the primary platform for source control, CI/CD, and developer collaboration in the 2nth.ai stack. This skill covers the GitHub REST API, Octokit SDK, GitHub Actions automation, GitHub Apps, and the Copilot platform — including data policy obligations developers need to understand.

> **Stub** — full skill pending. Core patterns documented below.

## API areas

| Area | REST base path | Use case |
|------|---------------|---------|
| **Repositories** | `/repos/{owner}/{repo}` | CRUD, topics, activity, templates |
| **Issues** | `/repos/{owner}/{repo}/issues` | Create, list, comment, label, close |
| **Pull Requests** | `/repos/{owner}/{repo}/pulls` | Open, review, merge, list checks |
| **Actions** | `/repos/{owner}/{repo}/actions` | Trigger workflows, list runs, download artifacts |
| **Code Search** | `/search/code` | Find files/symbols across repos |
| **Code Scanning** | `/repos/{owner}/{repo}/code-scanning` | Upload SARIF, list alerts |
| **Copilot** | `/orgs/{org}/copilot` | Seat assignment, usage metrics |
| **Webhooks** | `/repos/{owner}/{repo}/hooks` | Subscribe to push, PR, issue events |
| **GitHub Apps** | `/app` | JWT auth, installation tokens, org access |

---

## Authentication

### Fine-grained PAT (recommended for personal/script use)

```bash
# Set as environment variable — never hardcode
export GITHUB_TOKEN="github_pat_xxxxxxxxxxxx"

# Use in requests
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
     -H "Accept: application/vnd.github+json" \
     https://api.github.com/repos/owner/repo
```

Fine-grained PATs scope to specific repositories and permissions. Prefer these over classic PATs for all new integrations.

### GitHub Actions (built-in token)

```yaml
# GITHUB_TOKEN is automatically injected — never create a PAT for this
jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write      # only request what you need
      pull-requests: read
    steps:
      - uses: actions/checkout@v4
      - name: Create release
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: gh release create v1.0.0 --generate-notes
```

### GitHub App (for org-level / multi-repo automation)

```typescript
import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from '@octokit/rest';

// App authenticates with a JWT, then gets installation token per org/repo
const octokit = new Octokit({
  authStrategy: createAppAuth,
  auth: {
    appId: process.env.GITHUB_APP_ID,
    privateKey: process.env.GITHUB_APP_PRIVATE_KEY,
    installationId: process.env.GITHUB_INSTALLATION_ID,
  },
});
```

---

## Octokit (TypeScript)

```bash
npm install @octokit/rest
```

```typescript
import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  userAgent: 'my-app/1.0.0',
});

// Get repo
const { data: repo } = await octokit.repos.get({ owner: '2nth-ai', repo: 'skills' });

// List open PRs
const { data: prs } = await octokit.pulls.list({
  owner: '2nth-ai',
  repo: 'skills',
  state: 'open',
  per_page: 50,
});

// Create an issue
const { data: issue } = await octokit.issues.create({
  owner: '2nth-ai',
  repo: 'skills',
  title: 'Add Python SDK skill',
  body: 'Stub needed for biz/accounting/python-sdk',
  labels: ['enhancement'],
});

// Merge a PR
await octokit.pulls.merge({
  owner: '2nth-ai',
  repo: 'skills',
  pull_number: 42,
  merge_method: 'squash',
  commit_title: 'feat: add python sdk skill (#42)',
});
```

### Pagination

```typescript
// Use paginate for large result sets
const allIssues = await octokit.paginate(octokit.issues.listForRepo, {
  owner: '2nth-ai',
  repo: 'skills',
  state: 'all',
  per_page: 100,
});
```

---

## GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:   # manual trigger

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run build
      - run: npm run deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CF_API_TOKEN }}

  # Matrix build example
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: ['18', '20', '22']
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '${{ matrix.node }}' }
      - run: npm ci && npm test
```

### Trigger a workflow via API

```typescript
await octokit.actions.createWorkflowDispatch({
  owner: 'my-org',
  repo: 'my-repo',
  workflow_id: 'deploy.yml',
  ref: 'main',
  inputs: { environment: 'production' },
});
```

---

## Webhooks (Cloudflare Worker)

```typescript
import { createHmac } from 'crypto'; // not available in Workers — use Web Crypto

async function verifySignature(payload: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const expected = 'sha256=' + Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0')).join('');
  return expected === signature;
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const payload = await req.text();
    const sig = req.headers.get('x-hub-signature-256') ?? '';
    const event = req.headers.get('x-github-event') ?? '';

    if (!await verifySignature(payload, sig, env.GITHUB_WEBHOOK_SECRET)) {
      return new Response('Unauthorized', { status: 401 });
    }

    const body = JSON.parse(payload);

    if (event === 'push' && body.ref === 'refs/heads/main') {
      // trigger deploy, update cache, notify Slack, etc.
    }

    if (event === 'pull_request' && body.action === 'opened') {
      // auto-assign reviewer, post welcome comment, etc.
    }

    return new Response('OK');
  },
};
```

---

## Rate limits

```typescript
// Check rate limit before bulk operations
const { data } = await octokit.rateLimit.get();
const { remaining, reset, limit } = data.rate;
console.log(`${remaining}/${limit} requests left — resets ${new Date(reset * 1000)}`);

// Authenticated: 5,000 req/hr (PAT), 15,000 req/hr (GitHub App)
// Search API: 30 req/min authenticated
// Secondary rate limits apply to concurrent requests and content creation
```

---

## Copilot data policy — what developers need to know

**Effective date: 24 April 2026**

GitHub updated its Copilot interaction data usage policy for **Free, Pro, and Pro+ tiers**. **Business and Enterprise tiers are unaffected.**

### What changes

From 24 April 2026, GitHub will use interaction data from individual Copilot users to train and improve its AI models, unless the user opts out.

**Data collected includes:**

| Data type | Examples |
|-----------|---------|
| Code suggestions accepted or modified | Completions you tab-accept or partially edit |
| Inputs submitted | Prompts, inline chat queries, code snippets you send |
| Surrounding code context | Open files, imports, function signatures visible to Copilot |
| Comments and documentation | Docstrings, inline comments in scope |
| Repository structure | File names, directory layout |
| Navigation patterns | Files visited, features used |
| Feature feedback | Thumbs up/down ratings on suggestions |

**Data NOT collected:**

- Interaction data from Business or Enterprise tiers (zero change for paid org accounts)
- Data from users who disable this setting
- "At rest" content from private repositories (though Copilot processes it during active use)

**Data sharing:** Shared with GitHub affiliates (including Microsoft). Not shared with third-party providers.

### How to opt out

1. Go to **github.com → Settings → Privacy**
2. Under "GitHub Copilot" → toggle off **"Allow GitHub to use my data to improve GitHub Copilot"**
3. Previously opted-out preferences are automatically retained — no action needed if you opted out before

```bash
# Verify your current setting via API (requires user scope)
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
     -H "Accept: application/vnd.github+json" \
     https://api.github.com/user/copilot_interaction_data_policy
```

### What this means for teams

| Tier | Impact | Action required |
|------|--------|----------------|
| **Free** | Data used to train models from 24 Apr 2026 | Opt out in Settings if unwilling |
| **Pro / Pro+** | Same as Free | Opt out in Settings if unwilling |
| **Business** | No change — org data never used for training | None |
| **Enterprise** | No change — org data never used for training | None |

**For consultants and contractors**: If you use a personal Free/Pro Copilot account and write code for clients on personal hardware, client code snippets may be included in training data unless you opt out. Consider upgrading to Business or opting out via Settings.

**For open source contributors**: Contributions to public repos are already public. The policy extends to interaction patterns (what suggestions you accept), not just the code itself.

---

## Gotchas

- **Fine-grained PAT expiry** — fine-grained tokens expire (max 1 year); classic tokens can be set to no-expiry but GitHub recommends against it for security
- **`GITHUB_TOKEN` scope defaults** — the default `GITHUB_TOKEN` in Actions has read-only permissions since 2023; declare `permissions:` explicitly in your workflow
- **Secondary rate limits** — creating issues/PRs/comments too fast triggers secondary limits; add a small delay in batch scripts
- **Webhook secret required** — always verify `x-hub-signature-256`; unauthenticated webhook endpoints are a common injection vector
- **GraphQL vs REST** — GraphQL v4 is more efficient for complex queries (one request vs multiple REST calls); use Octokit's `graphql` method for nested data
- **GitHub App vs PAT** — Apps have higher rate limits (15,000/hr vs 5,000/hr) and don't expire; prefer Apps for production integrations

## See also

- `tech/cloudflare/workers` — host GitHub webhook handlers at the edge
- `tech/aws/compute` — Lambda for GitHub webhook processing
- `tech/microsoft/azure-ai` — GitHub Copilot runs on Azure OpenAI infrastructure
