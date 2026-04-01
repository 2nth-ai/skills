---
name: fin/accounting/quickbooks
description: |
  QuickBooks Online (QBO) AI integration expert. Use this skill when:
  (1) querying the QBO REST API v3 — invoices, payments, customers, vendors, accounts, bills,
  (2) building AI-powered accounting automations for QuickBooks Online companies,
  (3) syncing financial data between QBO and ERPs, CRMs, or e-commerce platforms,
  (4) generating financial reports — P&L, balance sheet, aged receivables, cash flow,
  (5) automating invoicing, payment application, and reconciliation workflows,
  (6) implementing change data capture (CDC) or webhook-driven accounting pipelines.
license: MIT
compatibility: Any HTTP client, Node.js, Python, Cloudflare Workers
homepage: https://skills.2nth.ai/fin/accounting/quickbooks
repository: https://github.com/2nth-ai/skills
requires:
  - fin/modelling
improves:
  - fin/accounting
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Accounting, QuickBooks, Intuit, Finance, AI"
allowed-tools: Bash(curl:*) Bash(npx:*) Read Write Edit Glob Grep
---

# QuickBooks Online AI Integration

QuickBooks Online (QBO) is the dominant cloud accounting platform for SMBs. It exposes a REST API v3 for programmatic access to the full accounting ledger — customers, vendors, invoices, bills, payments, accounts, reports, and more.

Docs: https://developer.intuit.com/app/developer/qbo/docs/develop

## The 2nth Model: One Person + One AI

| Role | The Human Decides | The AI Enables |
|------|-------------------|----------------|
| **Business Owner** | Strategy, pricing, supplier terms | Cash position summary, overdue receivables alerts, P&L narrative |
| **Bookkeeper** | Exception review, chart of accounts structure | Auto-categorisation, bank rec suggestions, data entry from documents |
| **Accountant** | Tax strategy, audit, advisory | Report generation, variance analysis, client-ready narratives |
| **Finance Manager** | Budget sign-off, forecasting assumptions | Actuals vs budget, scenario modelling from live QBO data |
| **Accounts Receivable** | Escalations, dispute resolution | Aged AR report, draft payment reminders, invoice status lookup |
| **Accounts Payable** | Payment approvals, vendor relationships | Bill schedule, cash flow impact, duplicate invoice detection |

## Authentication

QBO uses **OAuth 2.0 Authorization Code Flow** with a 1-hour access token and 100-day rolling refresh token.

```bash
# Environment variables
QBO_CLIENT_ID="ABxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
QBO_CLIENT_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
QBO_REDIRECT_URI="https://yourapp.com/callback"
QBO_REALM_ID="123456789"          # Company ID — obtained from token response
QBO_ACCESS_TOKEN="eyJ..."         # Refresh every 60 min
QBO_REFRESH_TOKEN="AB11..."       # Rotate every 100 days
QBO_SANDBOX=false                 # true for development
```

### OAuth Endpoints
```
Authorization:  https://appcenter.intuit.com/connect/oauth2
Token:          https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer
```

### Scopes
```
com.intuit.quickbooks.accounting    # All accounting data (required)
com.intuit.quickbooks.payment       # Payment processing
```

### Token Refresh
```bash
curl -X POST https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer \
  -H "Authorization: Basic base64(CLIENT_ID:CLIENT_SECRET)" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=refresh_token&refresh_token=AB11..."
# Returns: new access_token + new refresh_token (rolling window resets)
```

### Base URL
```
Production: https://quickbooks.api.intuit.com/v3/company/{realmId}/
Sandbox:    https://sandbox-quickbooks.api.intuit.com/v3/company/{realmId}/
```

Always include:
```
Accept: application/json
Content-Type: application/json
Authorization: Bearer {access_token}
```

## Query Language

QBO uses a **SQL-like query syntax** (not standard SQL — it's Intuit's own dialect).

```
GET /v3/company/{realmId}/query?query=SELECT * FROM Invoice WHERE Balance > '0'
```

```sql
-- Key syntax rules
SELECT * FROM Invoice WHERE TotalAmt > '1000.0'          -- single quotes required
SELECT * FROM Customer WHERE DisplayName LIKE 'Acme%'    -- % wildcard only
SELECT * FROM Invoice WHERE Balance > '0' ORDER BY DueDate DESC
SELECT * FROM Invoice STARTPOSITION 1 MAXRESULTS 200     -- max 1000 per page

-- Paginate
SELECT COUNT(*) FROM Invoice                              -- get total first
SELECT * FROM Invoice STARTPOSITION 201 MAXRESULTS 200   -- next page
```

**Critical:** values in WHERE clauses must use single quotes. `WHERE TotalAmt > 1000` fails silently or errors.

Always pin the API version:
```
?minorversion=73    # Append to all requests — defaults to 2014 without it
```

## Core Entities

### Invoice
```json
{
  "CustomerRef": { "value": "42", "name": "Acme Corp" },
  "TxnDate": "2026-04-01",
  "DueDate": "2026-04-30",
  "Line": [
    {
      "Amount": 500.00,
      "DetailType": "SalesItemLineDetail",
      "SalesItemLineDetail": {
        "ItemRef": { "value": "1", "name": "Consulting" },
        "Qty": 5,
        "UnitPrice": 100.00
      }
    }
  ]
}
```

Create: `POST /v3/company/{realmId}/invoice`
Read:   `GET  /v3/company/{realmId}/invoice/{id}`
Update: `POST /v3/company/{realmId}/invoice` (include `Id` + `SyncToken`)
Send:   `POST /v3/company/{realmId}/invoice/{id}/send?sendTo=client@example.com`

### Payment (apply to invoice)
```json
{
  "TotalAmt": 500.00,
  "CustomerRef": { "value": "42" },
  "Line": [{
    "Amount": 500.00,
    "LinkedTxn": [{ "TxnId": "123", "TxnType": "Invoice" }]
  }]
}
```

### Bill (accounts payable)
```json
{
  "VendorRef": { "value": "56" },
  "TxnDate": "2026-04-01",
  "DueDate": "2026-04-30",
  "Line": [{
    "Amount": 200.00,
    "DetailType": "AccountBasedExpenseLineDetail",
    "AccountBasedExpenseLineDetail": {
      "AccountRef": { "value": "7", "name": "Office Supplies" }
    }
  }]
}
```

### Customer
```json
{
  "DisplayName": "Acme Corp",
  "CompanyName": "Acme Corporation",
  "PrimaryEmailAddr": { "Address": "accounts@acme.com" },
  "BillAddr": { "Line1": "123 Main St", "City": "Cape Town", "CountrySubDivisionCode": "WC" },
  "DefaultTaxCodeRef": { "value": "TAX" }
}
```

### Account (Chart of Accounts)
```
AccountType values: Bank | Accounts Receivable | Other Current Asset | Fixed Asset |
                    Accounts Payable | Credit Card | Equity | Income | Expense | Cost of Goods Sold
```

## Key MCP Tools

| Tool | Description |
|------|-------------|
| `qbo_query` | Run SQL-like query against any QBO entity |
| `qbo_get_invoice` | Fetch single invoice with full line item detail |
| `qbo_create_invoice` | Create invoice for a customer |
| `qbo_send_invoice` | Email invoice to customer via QBO |
| `qbo_apply_payment` | Apply payment against one or more invoices |
| `qbo_get_customer` | Customer detail including balance and credit limit |
| `qbo_list_overdue` | Invoices past due date with days overdue |
| `qbo_aged_receivables` | AR aging report (Current / 1-30 / 31-60 / 61-90 / 90+) |
| `qbo_profit_loss` | P&L report for a date range |
| `qbo_balance_sheet` | Balance sheet as at a date |
| `qbo_cash_flow` | Cash flow statement |
| `qbo_cdc` | Change data capture — entities modified since a timestamp |
| `qbo_batch` | Submit up to 30 operations in one request |

## Reports API

Reports are not entities — they use a separate endpoint pattern:

```bash
# Profit & Loss
GET /v3/company/{realmId}/reports/ProfitAndLoss?start_date=2026-01-01&end_date=2026-03-31

# Balance Sheet
GET /v3/company/{realmId}/reports/BalanceSheet?date_macro=This%20Year-to-date

# Aged Receivables
GET /v3/company/{realmId}/reports/AgedReceivableDetail

# Cash Flow
GET /v3/company/{realmId}/reports/CashFlow?start_date=2026-01-01&end_date=2026-03-31

# Transaction List (detailed ledger)
GET /v3/company/{realmId}/reports/TransactionList?start_date=2026-01-01&end_date=2026-03-31
```

Reports have a **400,000-cell limit**. For large date ranges, break into quarterly or monthly requests and concatenate.

## Change Data Capture (CDC)

CDC returns all objects of given entity types modified since a timestamp — far more efficient than polling.

```bash
GET /v3/company/{realmId}/cdc?entities=Invoice,Payment,Customer&changedSince=2026-04-01T00:00:00Z
```

Returns a `CDCResponse` with `QueryResponse` arrays per entity — including deleted records (`status: "Deleted"`).

**CDC + Webhooks pattern (recommended):**
- Webhooks for real-time notification
- CDC as fallback: on webhook failure, query CDC from last successful sync timestamp

## Webhooks

Subscribe at: https://developer.intuit.com/app/developer/qbo/docs/develop/webhooks

```json
// Payload arrives as POST to your endpoint
{
  "eventNotifications": [{
    "realmId": "123456789",
    "dataChangeEvent": {
      "entities": [{
        "name": "Invoice",
        "id": "456",
        "operation": "Update",
        "lastUpdated": "2026-04-01T10:30:00Z"
      }]
    }
  }]
}
```

Verify the `intuit-signature` header (HMAC-SHA256 of body with your verifier token):
```typescript
const sig = request.headers.get('intuit-signature');
const body = await request.text();
const expected = btoa(
  String.fromCharCode(...new Uint8Array(
    await crypto.subtle.sign('HMAC', verifierKey, new TextEncoder().encode(body))
  ))
);
if (sig !== expected) return new Response('Unauthorized', { status: 401 });
```

## Rate Limits

| Endpoint type | Limit |
|---------------|-------|
| Standard | 500 req/min per realm |
| Batch | 40 req/min per realm |
| Reports | 200 req/min per realm |
| Concurrent | 10 simultaneous per realm+app |

HTTP `429` on breach — implement exponential backoff. Start at 1s, double up to 60s.

## Pricing (as of 2025)

Intuit introduced metered pricing for the App Partner Program:

| Tier | Monthly | GET credits included |
|------|---------|---------------------|
| Builder (free) | $0 | 500K |
| Silver | $300 | 1M |
| Gold | $1,700 | 10M |
| Platinum | $4,500 | 75M |

- **POST/PUT (writes) are free** across all tiers
- **GET (reads) are metered** — only successful 2xx calls count
- Sandbox is always free
- Overage on paid tiers: ~$0.25–$3.50 per 1,000 calls depending on tier

Design integrations to minimise unnecessary GET calls — use CDC instead of polling, cache reference data (customers, items, accounts).

## Batch Operations

Up to 30 operations per batch — useful for bulk imports:

```json
POST /v3/company/{realmId}/batch
{
  "BatchItemRequest": [
    {
      "bId": "1",
      "operation": "create",
      "Invoice": { ...invoice object... }
    },
    {
      "bId": "2",
      "operation": "update",
      "Customer": { "Id": "42", "SyncToken": "5", "DisplayName": "Acme Corp Updated" }
    }
  ]
}
```

## Common Gotchas

- **SyncToken required for updates** — every object has a `SyncToken` version number that increments on each change. Always fetch the current object before updating or you'll get a conflict error. Never cache SyncToken.
- **Single quotes in queries** — `WHERE TotalAmt > '1000'` works; `WHERE TotalAmt > 1000` does not. This is a silent failure in some cases.
- **minorversion defaults to 2014** — fields added after 2014 (most modern features) are invisible without `?minorversion=73` on every request.
- **401 can mean 429** — rate limit errors sometimes surface as 401 Unauthorized rather than 429. Implement backoff on all 4xx responses, not just 429.
- **Sandbox and production are separate apps** — keys, OAuth apps, and realm IDs are not interchangeable. Test thoroughly in sandbox; expect different realm IDs in production.
- **Report cell limit (400K)** — `TransactionList` and `BalanceSheet` for large date ranges will error. Iterate monthly or quarterly and stitch results.
- **Multi-tenant realm management** — each QBO company has its own `realmId`. Multi-tenant apps must store and switch realmId per customer. Never hardcode.
- **Refresh token is rolling** — each refresh call issues a new refresh token (100-day window resets). Store the latest token or you'll lock out your integration.
- **Regional variations** — French QBO requires journal codes; US has complex state tax via Avalara. Test per-region if building a multi-country integration.
- **Deleted objects via CDC** — soft deletes appear in CDC as `status: "Deleted"`. Always handle this case; entity endpoints return 404 on deleted objects.

## See Also

- [QuickBooks Online API Docs](https://developer.intuit.com/app/developer/qbo/docs/develop)
- [OAuth 2.0 Guide](https://developer.intuit.com/app/developer/qbo/docs/develop/authentication-and-authorization/oauth-2.0)
- [QBO Query Language](https://developer.intuit.com/app/developer/qbo/docs/learn/explore-the-quickbooks-online-api/data-queries)
- [Change Data Capture](https://developer.intuit.com/app/developer/qbo/docs/learn/explore-the-quickbooks-online-api/change-data-capture)
- [Xero skill](../../biz/accounting/xero/SKILL.md) — for Xero-specific patterns
- [Financial Modelling skill](../modelling/SKILL.md) — for DCF and scenario analysis on top of QBO data
