---
name: tech/google/workspace
description: |
  Google Workspace API skills. Use skills in this domain when:
  (1) reading, sending, or labelling email through the Gmail API,
  (2) reading, writing, or sharing files via Drive API v3,
  (3) appending rows, reading ranges, or batch-updating Sheets via Sheets API v4,
  (4) creating events, checking availability, or receiving push notifications from Calendar API v3,
  (5) managing Workspace users, groups, or domain-wide delegation via Admin SDK,
  (6) choosing between user OAuth (consented access to a user's data) and domain-wide delegation (service account acting as any user in a Workspace domain),
  (7) building Cloudflare-native Workspace integrations — the workspace-bridge Worker pattern with Web Crypto JWT signing.
license: MIT
compatibility: Google APIs client libraries (Node, Python), REST v1/v3/v4, Cloudflare Workers (Web Crypto)
homepage: https://skills.2nth.ai/tech/google/workspace
repository: https://github.com/2nth-ai/skills
requires:
  - tech/google
improves:
  - tech/google
  - tech
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Google Workspace, Gmail, Drive, Sheets, Calendar, Admin SDK, OAuth, Domain-wide delegation, Cloudflare Workers"
allowed-tools: Bash(gcloud:*) Bash(curl:*) Bash(wrangler:*) Read Write Edit Glob Grep
---

# Google Workspace APIs

Workspace APIs sit on the same OAuth 2.0 / service-account identity plane as GCP, but access **user-owned data** (email, files, calendar) rather than **project-owned infrastructure**. The consent model is consequently different: either the end user authorises your app, or a Workspace admin grants a service account domain-wide delegation to impersonate any user in their domain.

In the 2nth.ai stack, Workspace APIs back:
- **Penny briefings** — Gmail Watch + AI summarisation of inbound client email.
- **Intake flows** — Drive + Sheets for document collection and structured capture.
- **Diary orchestration** — Calendar API for availability + scheduling.
- **Admin automation** — provisioning, group membership, DWD grant audits.

## Workspace APIs in scope

| API | Purpose | Common 2nth use |
|-----|---------|----------------|
| **Gmail** | Read, send, label, search email | Enquiry capture, auto-reply, notification routing, Penny briefings |
| **Drive** | Files, folders, sharing | Document ingestion, asset management, report delivery |
| **Sheets** | Spreadsheet read/write | Live data feeds, reporting outputs, config tables |
| **Calendar** | Events, availability | Booking automation, appointment scheduling |
| **Admin SDK** | Users, groups, org units | Provisioning, access control, audit |
| **Contacts** | People API | CRM sync, contact enrichment |

## Sub-skills

| Path | Focus | Status |
|------|-------|--------|
| `tech/google/workspace/gmail` | Gmail API — read, send, label, Watch pipeline, AI automation | ✓ production |
| `tech/google/workspace/drive` | Drive API v3 — files, folders, permissions, shared drives | stub |
| `tech/google/workspace/sheets` | Sheets API v4 — read, append, batch update, formulas | stub |
| `tech/google/workspace/calendar` | Calendar API v3 — events, availability, push notifications | stub |
| `tech/google/workspace/admin` | Admin SDK Directory + Reports — users, groups, DWD management | stub |

## Auth decision: user OAuth vs DWD

| Your app needs to... | Use |
|---------------------|-----|
| Access *one user's* Gmail/Drive (they click "allow") | **User OAuth 2.0** (Authorization Code + PKCE) |
| Access *all users* in a Workspace domain (server job, no user clicks) | **Service account + Domain-Wide Delegation** |
| Access project-owned GCP resources only | Service account, no DWD needed |
| Access external user data across multiple orgs | User OAuth — one consent per user |

**DWD is powerful and dangerous.** It lets a service account impersonate any user in the domain. Grant narrow scopes, audit regularly, and store the JSON key in Secret Manager (or Cloudflare Worker secrets) — never in the repo.

### User OAuth 2.0 (per-user consent, googleapis SDK)

```bash
# Required setup in GCP Console (APIs & Services → OAuth consent screen):
#   1. App type: External (for consumer Gmail accounts) OR Internal (Workspace-only)
#   2. Authorized redirect URIs: https://your-app.example.com/oauth/callback
#   3. Scopes: add only what you need (see below)
#   4. Test users (during dev) OR submit for verification (production external)
```

```typescript
// Node.js — googleapis client (user OAuth flow)
import { google } from 'googleapis';

const oauth2 = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'https://your-app.example.com/oauth/callback'
);

// Step 1: redirect user to consent URL
const authUrl = oauth2.generateAuthUrl({
  access_type: 'offline',           // required for refresh_token
  prompt: 'consent',                 // force refresh_token re-issue
  scope: [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
  ],
});

// Step 2: exchange ?code for tokens
const { tokens } = await oauth2.getToken(codeFromQuery);
oauth2.setCredentials(tokens);
// Store tokens.refresh_token against the user
// tokens.access_token expires in ~1 hour; auto-refreshed via refresh_token

// Later: use for API calls
const gmail = google.gmail({ version: 'v1', auth: oauth2 });
const { data } = await gmail.users.messages.list({ userId: 'me', maxResults: 10 });
```

### Service account + Domain-Wide Delegation

```bash
# Step 1: create SA + note its *numeric OAuth client ID* (not the email)
gcloud iam service-accounts create workspace-bot \
  --display-name "Workspace automation bot"

gcloud iam service-accounts describe \
  workspace-bot@my-project.iam.gserviceaccount.com \
  --format="value(oauth2ClientId)"
# → 123456789012345678901

# Step 2: Workspace admin grants DWD
#   admin.google.com → Security → API Controls → Domain-wide Delegation → Add new
#   Client ID: 123456789012345678901
#   OAuth Scopes: https://www.googleapis.com/auth/gmail.readonly, etc.

# Step 3: SA impersonates a domain user at runtime
```

```typescript
// Node — impersonate user@example.com via DWD (googleapis SDK)
import { google } from 'googleapis';

const auth = new google.auth.JWT({
  keyFile: '/secrets/workspace-bot-key.json',
  scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
  subject: 'user@example.com',   // the user being impersonated
});

const gmail = google.gmail({ version: 'v1', auth });
await gmail.users.messages.list({ userId: 'me', maxResults: 10 });
// 'me' refers to the impersonated subject, not the service account
```

## Scope minimisation

Workspace scopes are categorised by Google as **Non-sensitive / Sensitive / Restricted**. Restricted scopes (full Gmail, full Drive content) require annual security audit + verification for external apps.

Prefer granular over broad:

| Broad (avoid) | Narrow (prefer) |
|--------------|----------------|
| `gmail.modify` | `gmail.readonly` + `gmail.labels` + `gmail.send` |
| `drive` | `drive.file` (only files your app creates/opens) |
| `drive.readonly` | `drive.metadata.readonly` (if you don't need content) |
| `calendar` | `calendar.events` or `calendar.events.readonly` |

`drive.file` is the single biggest scope-minimisation win — your app only sees files it created or that the user explicitly opens with it, so no verification audit for full-Drive access.

## OAuth verification (for External apps)

If your app uses **sensitive** or **restricted** scopes AND is published externally (not Internal to one Workspace domain):
- Unverified: 100 user cap, unverified warning screen
- Verified: full production, annual third-party security audit for restricted scopes (CASA Tier 2+)

For 2nth.ai internal-domain apps, set OAuth consent screen to **Internal** and skip verification entirely.

## Webhook / push notifications (Watch API)

All major Workspace APIs support push notifications — instead of polling, Google POSTs to your endpoint when something changes.

```typescript
// Register a Gmail watch (expires every 7 days — must renew)
await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/watch`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    topicName: 'projects/PROJECT_ID/topics/PUBSUB_TOPIC',
    labelIds: ['INBOX'],
    labelFilterAction: 'include',
  }),
});
```

Gmail watch requires a **Pub/Sub topic** — notifications are published there, then pushed to your Worker (or Cloud Run). See `tech/google/cloud/data` for Pub/Sub setup.

**Renewal pattern:** Cloud Scheduler calls a renewal endpoint every 6 days.

## Admin SDK — common operations

```typescript
const base = 'https://admin.googleapis.com/admin/directory/v1';

// List all users in domain
const users = await gFetch(`${base}/users?domain=yourdomain.co.za&maxResults=500`, token);

// Get a single user
const user = await gFetch(`${base}/users/user@yourdomain.co.za`, token);

// List groups
const groups = await gFetch(`${base}/groups?domain=yourdomain.co.za`, token);

// Suspend a user
await gFetch(`${base}/users/user@yourdomain.co.za`, token, 'PATCH', { suspended: true });
```

---

## 2nth.ai ↔ Trusted Workspace Tenant — Integration Pattern

This is the canonical Cloudflare-native pattern for connecting 2nth.ai infrastructure to a **specific, trusted Google Workspace organisation** — for exploration, internal tooling, and client platform builds. It's the alternative to running a Node googleapis SDK inside Cloud Run.

### Architecture

```
Cloudflare Worker (any 2nth.ai service)
  → calls workspace-bridge Worker (service binding)
      → mints JWT using service account key (stored as CF secret)
      → exchanges JWT for Google access_token
      → calls Workspace API (Gmail, Drive, Sheets, Calendar, Admin)
      → returns structured result
```

One service account. One set of secrets. Any Worker in the account can reach any Workspace API in the trusted tenant by calling the bridge.

### Step 1: GCP project setup

Create a dedicated GCP project for the 2nth.ai ↔ Workspace bridge. Keep it separate from any client GCP projects.

```bash
# Create project
gcloud projects create 2nth-workspace-bridge --name="2nth Workspace Bridge"
gcloud config set project 2nth-workspace-bridge

# Enable required APIs
gcloud services enable \
  gmail.googleapis.com \
  drive.googleapis.com \
  sheets.googleapis.com \
  calendar-json.googleapis.com \
  admin.googleapis.com \
  people.googleapis.com \
  iamcredentials.googleapis.com

# Create service account
gcloud iam service-accounts create workspace-bridge \
  --display-name="2nth Workspace Bridge" \
  --project=2nth-workspace-bridge

# Download key (store immediately — cannot re-download)
gcloud iam service-accounts keys create ./workspace-bridge-key.json \
  --iam-account=workspace-bridge@2nth-workspace-bridge.iam.gserviceaccount.com
```

Note the `client_id` from `workspace-bridge-key.json` — you need it for Step 2.

### Step 2: Grant domain-wide delegation in the Workspace tenant

The Workspace **super admin** must complete this step. This is what creates the trust.

1. Go to **admin.google.com** → Security → Access and data control → API controls
2. Click **Manage domain-wide delegation** → **Add new**
3. Enter:
   - **Client ID**: the `client_id` from `workspace-bridge-key.json`
   - **OAuth scopes** (comma-separated — start with this set for exploration):
     ```
     https://www.googleapis.com/auth/gmail.readonly,
     https://www.googleapis.com/auth/gmail.send,
     https://www.googleapis.com/auth/drive.readonly,
     https://www.googleapis.com/auth/spreadsheets.readonly,
     https://www.googleapis.com/auth/calendar.readonly,
     https://www.googleapis.com/auth/admin.directory.user.readonly
     ```
4. Click **Authorise**

The service account can now impersonate **any user** in that Workspace org for the listed scopes. No per-user consent required.

### Step 3: Store secrets in Cloudflare

```bash
# Extract values from the key JSON and store as Worker secrets
# Run each interactively — paste value when prompted

npx wrangler secret put GOOGLE_SERVICE_ACCOUNT_EMAIL
# → workspace-bridge@2nth-workspace-bridge.iam.gserviceaccount.com

npx wrangler secret put GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
# → paste the full "private_key" value from the JSON (include -----BEGIN/END----- lines)

npx wrangler secret put GOOGLE_SERVICE_ACCOUNT_CLIENT_ID
# → the client_id value from the JSON

npx wrangler secret put GOOGLE_WORKSPACE_DOMAIN
# → the trusted tenant domain, e.g. 2nth.ai or b2bs.co.za
```

**Never commit `workspace-bridge-key.json` to git.** Delete it locally after storing the secrets.

### Step 4: JWT minting in Cloudflare Workers (Web Crypto API)

Cloudflare Workers run in V8 isolates — no Node.js `crypto` or `jsonwebtoken`. Use the Web Crypto API instead. This helper is the core of the bridge.

```typescript
// helpers/google-auth.ts

interface Env {
  GOOGLE_SERVICE_ACCOUNT_EMAIL: string;
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: string;
  GOOGLE_SERVICE_ACCOUNT_CLIENT_ID: string;
}

/**
 * Get a Google access_token for a specific user and scope set.
 * Uses service account domain-wide delegation.
 *
 * @param userEmail  - The Workspace user to impersonate, e.g. craig@2nth.ai
 * @param scopes     - Array of OAuth scope URLs
 */
export async function getWorkspaceToken(
  env: Env,
  userEmail: string,
  scopes: string[]
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  // Build JWT payload
  const header  = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss:   env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    sub:   userEmail,
    scope: scopes.join(' '),
    aud:   'https://oauth2.googleapis.com/token',
    iat:   now,
    exp:   now + 3600,
  };

  const encode = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const signingInput = `${encode(header)}.${encode(payload)}`;

  // Import the PEM private key into Web Crypto
  const pemBody = env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');

  const keyData = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0));

  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    keyData,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  // Sign
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(signingInput)
  );

  const jwt = `${signingInput}.${btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}`;

  // Exchange JWT for access_token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`Google token exchange failed: ${err}`);
  }

  const { access_token } = await tokenRes.json() as { access_token: string };
  return access_token;
}
```

### Step 5: workspace-bridge Worker

A thin internal Worker that other services call via [service bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/) — no public HTTP, no auth overhead.

```typescript
// workspace-bridge/src/index.ts

import { getWorkspaceToken } from './helpers/google-auth';

const SCOPES = {
  gmail_read:  ['https://www.googleapis.com/auth/gmail.readonly'],
  gmail_send:  ['https://www.googleapis.com/auth/gmail.send'],
  drive_read:  ['https://www.googleapis.com/auth/drive.readonly'],
  sheets_read: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  calendar:    ['https://www.googleapis.com/auth/calendar.readonly'],
  admin:       ['https://www.googleapis.com/auth/admin.directory.user.readonly'],
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    const body = await request.json() as { user?: string; [key: string]: unknown };
    const user = body.user ?? `admin@${env.GOOGLE_WORKSPACE_DOMAIN}`;

    // POST /token — get a raw access token for a user + scope set
    if (pathname === '/token') {
      const { scope } = body as { scope: keyof typeof SCOPES; user: string };
      const token = await getWorkspaceToken(env, user, SCOPES[scope] ?? SCOPES.gmail_read);
      return Response.json({ token });
    }

    // POST /gmail/list — list recent inbox messages
    if (pathname === '/gmail/list') {
      const token = await getWorkspaceToken(env, user, SCOPES.gmail_read);
      const { q = 'is:unread in:inbox', maxResults = 10 } = body as { q?: string; maxResults?: number };
      const res = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(q)}&maxResults=${maxResults}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return Response.json(await res.json());
    }

    // POST /gmail/send — send an email as the user
    if (pathname === '/gmail/send') {
      const { to, subject, html } = body as { to: string; subject: string; html: string };
      const token = await getWorkspaceToken(env, user, SCOPES.gmail_send);
      const raw = btoa(
        `To: ${to}\r\nFrom: ${user}\r\nSubject: ${subject}\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=utf-8\r\n\r\n${html}`
      ).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw }),
      });
      return Response.json(await res.json());
    }

    // POST /drive/list — list Drive files
    if (pathname === '/drive/list') {
      const token = await getWorkspaceToken(env, user, SCOPES.drive_read);
      const { q = "'root' in parents", pageSize = 20 } = body as { q?: string; pageSize?: number };
      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&pageSize=${pageSize}&fields=files(id,name,mimeType,modifiedTime,size)`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return Response.json(await res.json());
    }

    // POST /sheets/read — read a range from a spreadsheet
    if (pathname === '/sheets/read') {
      const { spreadsheetId, range } = body as { spreadsheetId: string; range: string };
      const token = await getWorkspaceToken(env, user, SCOPES.sheets_read);
      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return Response.json(await res.json());
    }

    // POST /calendar/events — list upcoming events
    if (pathname === '/calendar/events') {
      const token = await getWorkspaceToken(env, user, SCOPES.calendar);
      const now = new Date().toISOString();
      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now}&maxResults=10&orderBy=startTime&singleEvents=true`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return Response.json(await res.json());
    }

    return new Response('Not found', { status: 404 });
  }
};
```

**wrangler.toml for the bridge:**
```toml
name = "workspace-bridge"
main = "src/index.ts"
compatibility_date = "2026-01-01"

[vars]
GOOGLE_WORKSPACE_DOMAIN = "2nth.ai"   # or whichever tenant
```

**Calling the bridge from another Worker via service binding:**
```toml
# In the consuming Worker's wrangler.toml
[[services]]
binding = "WORKSPACE"
service  = "workspace-bridge"
```

```typescript
// In the consuming Worker
const result = await env.WORKSPACE.fetch(new Request('http://internal/gmail/list', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ user: 'craig@2nth.ai', q: 'is:unread', maxResults: 5 }),
})).then(r => r.json());
```

### First experiments to run

Once the bridge is deployed and domain-wide delegation is active, validate the trust with these in order:

| # | Endpoint | What it proves |
|---|----------|---------------|
| 1 | `POST /token` `{ user, scope: 'gmail_read' }` | Service account JWT minting works, DWD is configured |
| 2 | `POST /gmail/list` `{ user, q: 'is:unread' }` | Can read inbox — foundational for all email automation |
| 3 | `POST /gmail/send` `{ user, to, subject, html }` | Can send as a Workspace user — replaces Resend for internal mail |
| 4 | `POST /drive/list` `{ user }` | Can see Drive — opens document ingestion, RAG, asset sync |
| 5 | `POST /sheets/read` `{ user, spreadsheetId, range }` | Can read Sheets — config tables, live data feeds, reporting |
| 6 | `POST /calendar/events` `{ user }` | Can see calendar — scheduling, availability, meeting context |

### What this unlocks for 2nth.ai

| Capability | How |
|-----------|-----|
| **Gmail as a CRM trigger** | Watch inbox → classify with Workers AI → route to D1 or notify |
| **Send from Workspace domain** | Replace Resend for any mail that should come from @2nth.ai or @client.co.za |
| **Google Sheets as a live config table** | Read a client's Sheet for pricing, products, or settings — no code deploy needed |
| **Drive as a document source for RAG** | Ingest Drive docs into Vectorize for semantic search |
| **Calendar availability** | Build booking flows that check real availability before confirming |
| **Cross-tenant client onboarding** | Grant DWD in a client's Workspace tenant, bridge connects instantly |

---

## Common gotchas

- **DWD on consumer `@gmail.com`**: Doesn't work. DWD requires a Workspace domain. Use user OAuth for consumer accounts.
- **Refresh token without `prompt=consent`**: Subsequent auth flows return only an `access_token`, not a new `refresh_token`. Use `prompt=consent` + `access_type=offline` on the first authorisation. If a user's refresh token is lost, they must re-consent.
- **Refresh token expiry**: Refresh tokens for External (unverified) apps expire after **7 days**. Verify the app or switch to Internal consent to get non-expiring refresh tokens.
- **Quotas are per-user, not per-project**: Gmail API has ~250 quota units/sec/user. High-volume DWD jobs that iterate all users parallelise across users, not within one user.
- **`userId: 'me'` with DWD**: `me` means "the impersonated user" (from `subject`), not the service account. Confusing but intentional.
- **Scopes added after first consent**: Adding a scope later requires re-consent. The existing access token does not gain new scopes. Use incremental authorisation (`include_granted_scopes: true`) to avoid re-asking for already-granted scopes.
- **Admin SDK requires super-admin DWD**: Directory API writes (create users, update groups) require DWD impersonation of a Workspace super-admin, not any user.
- **Scope creep**: Request only what you need — broad scopes cause OAuth consent failures in Workspace admin-managed accounts.
- **Watch expiry**: Gmail/Drive watches expire after 7 days — always set up a renewal job at creation time.
- **Rate limits**: Gmail 250 quota units/sec/user. Drive 12,000 req/minute/user. Back off on 429s with exponential retry.
- **Unverified app warning**: OAuth consent screen shows warning until app is verified by Google — acceptable for internal use, required for public.
- **Never commit SA keys**: Use Secret Manager for GCP-hosted runtime, Cloudflare Worker secrets (`wrangler secret put`) for Workers. Delete the JSON file immediately after storing.

## See Also

- [Gmail API](gmail/SKILL.md)
- [Google platform auth](../SKILL.md)
- [Google Cloud (for GCP-side infrastructure)](../cloud/SKILL.md)
- [Cloudflare Workers runtime](../../cloudflare/workers/SKILL.md)
