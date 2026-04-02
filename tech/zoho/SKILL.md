---
name: tech/zoho
description: |
  Zoho platform integration skill. Use when:
  (1) reading or writing CRM data — Leads, Contacts, Accounts, Deals via Zoho CRM API v8,
  (2) automating accounting — invoices, bills, expenses, payments via Zoho Books API v3,
  (3) syncing contacts and companies across CRM ↔ Books ↔ Desk,
  (4) building OAuth 2.0 flows for Zoho — multi-datacenter token management, refresh, revoke,
  (5) handling Zoho webhooks — real-time notifications from CRM or Books on record changes,
  (6) integrating Zoho with Cloudflare Workers or AWS Lambda — lightweight API proxies, scheduled syncs,
  (7) working with other Zoho products — Desk (support), People (HR), Projects, Campaigns, Analytics.
license: MIT
compatibility: Zoho CRM API v8, Zoho Books API v3, Zoho OAuth 2.0, Node.js/TypeScript SDK, Python SDK
homepage: https://skills.2nth.ai/tech/zoho
repository: https://github.com/2nth-ai/skills
improves:
  - tech
  - biz
metadata:
  author: 2nth.ai
  version: "1.0.0"
  maturity: stub
  categories: "Zoho, CRM, Books, Desk, People, OAuth, invoices, contacts, leads, deals, webhooks, accounting"
---

# Zoho

Zoho is a full-stack business platform — CRM, accounting (Books), HR (People), support (Desk), projects, email, and analytics — all under one OAuth identity. A single registered OAuth client can access all Zoho products across all data centres. In the 2nth.ai stack Zoho fills the SMB CRM and accounting layer; agents use the APIs to read pipeline data, raise invoices, and sync contacts.

> **Stub** — full skill pending. Core patterns documented below.

## Product API map

| Product | API base | Primary use |
|---------|----------|------------|
| **CRM v8** | `https://www.zohoapis.[DC]/crm/v8` | Leads, Contacts, Accounts, Deals, Activities |
| **Books v3** | `https://www.zohoapis.[DC]/books/v3` | Invoices, bills, expenses, contacts, payments |
| **Desk** | `https://desk.zoho.[DC]/api/v1` | Support tickets, agents, contacts |
| **People** | `https://people.zoho.[DC]/api/v2` | Employees, leave, attendance |
| **Projects** | `https://projectsapi.zoho.[DC]/restapi` | Tasks, milestones, timesheets |
| **Campaigns** | `https://campaigns.zoho.[DC]/api/v1.1` | Email campaigns, mailing lists |
| **Analytics** | `https://analyticsapi.zoho.[DC]/api/v2` | Reports, dashboards, workspaces |

---

## Data centres

Zoho is multi-regional. **All OAuth tokens and API calls must use the same DC throughout a session.** Use the `api_domain` field returned in OAuth responses to route subsequent calls.

| Region | Account domain | API domain |
|--------|---------------|-----------|
| US (default) | `accounts.zoho.com` | `www.zohoapis.com` |
| EU | `accounts.zoho.eu` | `www.zohoapis.eu` |
| India | `accounts.zoho.in` | `www.zohoapis.in` |
| Australia | `accounts.zoho.com.au` | `www.zohoapis.com.au` |
| UK | `accounts.zoho.uk` | `www.zohoapis.uk` |
| Canada | `accounts.zoho.ca` | `www.zohoapis.ca` |
| Japan | `accounts.zoho.jp` | `www.zohoapis.jp` |
| Saudi Arabia | `accounts.zoho.sa` | `www.zohoapis.sa` |

```bash
# Discover DC-to-URL mapping programmatically
curl https://accounts.zoho.com/oauth/serverinfo
```

---

## 1. OAuth 2.0 authentication

Zoho uses standard OAuth 2.0. Register your app at **api-console.zoho.com** → get Client ID + Client Secret.

### Step 1 — authorisation code request

```
https://accounts.zoho.[DC]/oauth/v2/auth
  ?response_type=code
  &client_id=YOUR_CLIENT_ID
  &scope=ZohoCRM.modules.ALL,ZohoBooks.invoices.ALL,ZohoBooks.contacts.ALL
  &redirect_uri=https://your-app.com/oauth/callback
  &access_type=offline   ← required to get a refresh token
  &prompt=consent
```

### Step 2 — exchange code for tokens

```bash
curl -X POST "https://accounts.zoho.com/oauth/v2/token" \
  -d "grant_type=authorization_code" \
  -d "client_id=$CLIENT_ID" \
  -d "client_secret=$CLIENT_SECRET" \
  -d "redirect_uri=https://your-app.com/oauth/callback" \
  -d "code=$AUTH_CODE"
```

Response:
```json
{
  "access_token": "1000.xxxx",
  "refresh_token": "1000.xxxx",
  "token_type": "Bearer",
  "expires_in": 3600,
  "api_domain": "https://www.zohoapis.com"
}
```

### Step 3 — refresh access token (store and reuse refresh token)

```typescript
async function refreshZohoToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string,
  dc = 'com'
): Promise<string> {
  const res = await fetch(`https://accounts.zoho.${dc}/oauth/v2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  const data = await res.json() as { access_token: string };
  return data.access_token;
}
```

### Token management pattern (Cloudflare KV or AWS Secrets Manager)

```typescript
// Cache access token; refresh only when expired
async function getAccessToken(env: Env): Promise<string> {
  const cached = await env.KV.get('zoho_access_token');
  if (cached) return cached;

  const newToken = await refreshZohoToken(
    await env.KV.get('zoho_refresh_token') ?? '',
    env.ZOHO_CLIENT_ID,
    env.ZOHO_CLIENT_SECRET,
  );
  // Cache for 55 minutes (tokens expire at 60)
  await env.KV.put('zoho_access_token', newToken, { expirationTtl: 3300 });
  return newToken;
}
```

---

## 2. Zoho CRM

### Scopes

```
ZohoCRM.modules.ALL          ← read/write all modules
ZohoCRM.modules.leads.ALL
ZohoCRM.modules.contacts.ALL
ZohoCRM.modules.accounts.ALL
ZohoCRM.modules.deals.ALL
ZohoCRM.settings.ALL         ← module metadata, fields, layouts
ZohoCRM.bulk.ALL             ← bulk read/write jobs
```

### List records

```typescript
async function crmGet(module: string, token: string, params?: Record<string, string>) {
  const url = new URL(`https://www.zohoapis.com/crm/v8/${module}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Zoho-oauthtoken ${token}` },
  });
  return res.json();
}

// Fetch first 200 leads modified in last 7 days
const leads = await crmGet('Leads', token, {
  fields: 'First_Name,Last_Name,Email,Lead_Status,Company',
  sort_by: 'Modified_Time',
  sort_order: 'desc',
  per_page: '200',
  page: '1',
});
```

### Create / update records

```typescript
// Create a lead
const res = await fetch('https://www.zohoapis.com/crm/v8/Leads', {
  method: 'POST',
  headers: {
    Authorization: `Zoho-oauthtoken ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    data: [{
      First_Name: 'Jane',
      Last_Name: 'Doe',
      Email: 'jane@example.com',
      Company: 'Acme Corp',
      Lead_Source: 'Web Site',
      Lead_Status: 'Not Contacted',
    }],
    duplicate_check_fields: ['Email'],  // upsert by email
    trigger: ['approval', 'workflow'],  // run automation
  }),
});

// Update a deal stage
await fetch(`https://www.zohoapis.com/crm/v8/Deals/${dealId}`, {
  method: 'PUT',
  headers: {
    Authorization: `Zoho-oauthtoken ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    data: [{ Stage: 'Proposal/Price Quote', Closing_Date: '2026-06-30' }],
  }),
});
```

### Search records (COQL query)

```typescript
// SQL-style query across CRM modules
const res = await fetch('https://www.zohoapis.com/crm/v8/coql', {
  method: 'POST',
  headers: {
    Authorization: `Zoho-oauthtoken ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    select_query: `
      SELECT First_Name, Last_Name, Email, Account_Name, Modified_Time
      FROM Contacts
      WHERE Account_Name = 'Acme Corp'
        AND Modified_Time >= '2026-01-01T00:00:00+00:00'
      ORDER BY Modified_Time DESC
      LIMIT 10
    `,
  }),
});
```

### Rate limits (CRM)

| Licences | Requests/day |
|----------|-------------|
| 1–5 | 4,000 (minimum floor) |
| 10 | 5,000 (10 × 500) |
| 50 | 25,000 (cap) |

Max 200 records per GET, 100 per POST/PUT/DELETE. Bulk API for larger jobs.

---

## 3. Zoho Books

All Books requests require `organization_id` as a query parameter.

```bash
# Get your organization ID first
curl -H "Authorization: Zoho-oauthtoken $TOKEN" \
  "https://www.zohoapis.com/books/v3/organizations"
```

### Scopes

```
ZohoBooks.contacts.ALL
ZohoBooks.invoices.ALL
ZohoBooks.expenses.ALL
ZohoBooks.bills.ALL
ZohoBooks.customerpayments.ALL
ZohoBooks.vendorpayments.ALL
ZohoBooks.settings.ALL
ZohoBooks.banking.ALL
```

### Create and send an invoice

```typescript
const orgId = 'YOUR_ORG_ID';

// Create invoice
const createRes = await fetch(
  `https://www.zohoapis.com/books/v3/invoices?organization_id=${orgId}`,
  {
    method: 'POST',
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customer_id: '2345678000000111111',
      invoice_number: 'INV-00042',
      date: '2026-04-02',
      due_date: '2026-05-02',
      line_items: [
        {
          item_id: '2345678000000222222',
          quantity: 10,
          rate: 500.00,
          description: 'Software consulting — April 2026',
        },
      ],
      notes: 'Payment due within 30 days.',
      terms: 'Net 30',
    }),
  }
);
const { invoice } = await createRes.json();

// Email the invoice to the customer
await fetch(
  `https://www.zohoapis.com/books/v3/invoices/${invoice.invoice_id}/email?organization_id=${orgId}`,
  {
    method: 'POST',
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to_mail_ids: ['client@example.com'],
      subject: `Invoice ${invoice.invoice_number} from Acme`,
      body: 'Please find your invoice attached.',
      send_from_org_email_id: true,
    }),
  }
);
```

### Record a payment

```typescript
await fetch(
  `https://www.zohoapis.com/books/v3/customerpayments?organization_id=${orgId}`,
  {
    method: 'POST',
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customer_id: '2345678000000111111',
      payment_mode: 'bank_transfer',
      amount: 5000.00,
      date: '2026-04-15',
      reference_number: 'EFT-987654',
      invoices: [{ invoice_id: invoice.invoice_id, amount_applied: 5000.00 }],
    }),
  }
);
```

### Rate limits (Books)

| Plan | Requests/day | Per minute |
|------|-------------|-----------|
| Free | 1,000 | 100 |
| Standard | 2,000 | 100 |
| Professional | 5,000 | 100 |
| Premium+ | 10,000 | 100 |

---

## 4. Webhooks (CRM notifications)

```typescript
// Register a notification channel in CRM
await fetch('https://www.zohoapis.com/crm/v8/actions/watch', {
  method: 'POST',
  headers: {
    Authorization: `Zoho-oauthtoken ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    watch: [{
      channel_id: '1000000068001',
      events: ['Leads.create', 'Leads.edit', 'Deals.edit'],
      channel_expiry: '2026-12-31T00:00:00+05:30',
      token: 'MY_WEBHOOK_VERIFY_TOKEN',
      notify_url: 'https://my-worker.workers.dev/zoho/crm/notify',
    }],
  }),
});

// Cloudflare Worker — receive CRM notification
export default {
  async fetch(req: Request): Promise<Response> {
    const payload = await req.json() as {
      query_params: { token: string };
      data: Array<{ module_name: string; operation: string; ids: string[] }>;
    };

    // Verify token
    if (payload.query_params.token !== 'MY_WEBHOOK_VERIFY_TOKEN') {
      return new Response('Forbidden', { status: 403 });
    }

    for (const event of payload.data) {
      console.log(`${event.module_name} ${event.operation}: ${event.ids.join(', ')}`);
      // Sync to Books, notify Slack, trigger workflow, etc.
    }

    return new Response('OK');
  },
};
```

---

## 5. CRM ↔ Books contact sync pattern

A common agent task: keep CRM Contacts in sync with Books Contacts so invoices can be raised from deal data.

```typescript
async function syncContactToBooks(
  crmContactId: string,
  crmToken: string,
  booksToken: string,
  orgId: string
): Promise<void> {
  // 1. Fetch from CRM
  const crmRes = await fetch(
    `https://www.zohoapis.com/crm/v8/Contacts/${crmContactId}`,
    { headers: { Authorization: `Zoho-oauthtoken ${crmToken}` } }
  );
  const { data: [contact] } = await crmRes.json();

  // 2. Search Books for existing contact by email
  const searchRes = await fetch(
    `https://www.zohoapis.com/books/v3/contacts?organization_id=${orgId}&email=${contact.Email}`,
    { headers: { Authorization: `Zoho-oauthtoken ${booksToken}` } }
  );
  const { contacts } = await searchRes.json();
  const existing = contacts?.[0];

  const payload = {
    contact_name: `${contact.First_Name} ${contact.Last_Name}`,
    company_name: contact.Account_Name,
    email: contact.Email,
    phone: contact.Phone,
    contact_type: 'customer',
  };

  // 3. Create or update
  if (existing) {
    await fetch(
      `https://www.zohoapis.com/books/v3/contacts/${existing.contact_id}?organization_id=${orgId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Zoho-oauthtoken ${booksToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );
  } else {
    await fetch(
      `https://www.zohoapis.com/books/v3/contacts?organization_id=${orgId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Zoho-oauthtoken ${booksToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );
  }
}
```

---

## Gotchas

- **DC mismatch causes `invalid_client`** — the DC used for the authorisation URL, token exchange, and API calls must all match; never mix `.com` auth with `.eu` API calls
- **`api_domain` is authoritative** — use the `api_domain` from the token response as the base URL for all API calls, not a hardcoded region
- **`organization_id` is mandatory for Books** — every Books request fails without it; fetch it once at startup and cache it
- **Refresh token limits** — max 20 refresh tokens per user per client; creating more silently invalidates the oldest; store the refresh token securely and reuse it
- **CRM module API names differ from display names** — `Contacts` not `Contact`, `Deals` not `Opportunity`; use `GET /settings/modules` to discover actual API names
- **CRM rate limit resets at midnight PST** — burst usage in a single hour is fine; daily cap is the constraint
- **COQL 10K row limit** — COQL queries return max 10,000 rows per query; use `offset` + `limit` or the Bulk Read API for full table exports
- **Notification channel expiry** — CRM webhook channels expire; renew them before expiry or events will stop arriving silently
- **Books `payment_mode` enum** — must be an exact string from Zoho's enum (`cash`, `check`, `creditcard`, `banktransfer`, `bank_transfer`, etc.); free-text values are rejected
- **OAuth consent screen on re-auth** — adding new scopes to an existing client requires user re-consent; design scope lists upfront to avoid re-auth flows

## See also

- `tech/cloudflare/kv` — cache Zoho access tokens (55-min TTL)
- `tech/cloudflare/workers` — host CRM webhook handler and API proxy at the edge
- `tech/aws/compute` — Lambda for scheduled CRM-to-Books sync jobs
- `biz/crm` — CRM strategy and pipeline management context
- `fin/accounting` — accounting principles behind Books usage
