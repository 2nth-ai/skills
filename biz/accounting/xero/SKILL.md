---
name: biz/accounting/xero
description: |
  Xero cloud accounting AI integration expert. Use this skill when:
  (1) creating, querying, or updating Xero invoices (ACCREC accounts receivable or ACCPAY accounts payable),
  (2) applying payments and reconciling bank statement lines to open transactions,
  (3) querying contacts (customers and suppliers) in Xero,
  (4) fetching financial reports — P&L, balance sheet, trial balance, aged receivables, aged payables,
  (5) managing multi-tenant Xero organisations (multiple tenant IDs),
  (6) building AI-powered accounting workflows with OAuth 2.0 token management,
  (7) automating AP/AR aging analysis and cash flow narration,
  (8) integrating Xero with external systems via the Xero REST API.
license: MIT
compatibility: Any HTTP client, Cloudflare Workers, Node.js
homepage: https://skills.2nth.ai/biz/accounting/xero
repository: https://github.com/2nth-ai/skills
requires: []
improves:
  - biz/accounting
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Accounting, Xero, OAuth 2.0, Invoicing, Reconciliation"
allowed-tools: Bash(curl:*) Read Write Edit Glob Grep
---

# Xero Accounting AI

Xero is the dominant cloud accounting platform for SMEs in South Africa, Australia, New Zealand, and the UK. It manages the general ledger, accounts payable/receivable, bank feeds, and financial reporting — all accessible via a well-documented REST API. The AI pairing enables natural-language invoice management, automated reconciliation suggestions, and instant financial narrative from Xero data.

API base: `https://api.xero.com/api.xro/2.0`

## Authentication

Xero uses **OAuth 2.0** with PKCE for public apps and client credentials for private/machine-to-machine flows. Access tokens expire after 30 minutes; refresh tokens expire after 60 days of inactivity.

**Credentials:** Store as environment variables — never hardcode.

```
XERO_CLIENT_ID=...
XERO_CLIENT_SECRET=...
XERO_REDIRECT_URI=...
```

```js
// OAuth 2.0 — Authorization Code + PKCE flow
async function getXeroToken(code, codeVerifier) {
  const response = await fetch('https://identity.xero.com/connect/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.XERO_CLIENT_ID,
      code,
      redirect_uri: process.env.XERO_REDIRECT_URI,
      code_verifier: codeVerifier,
    })
  });
  return response.json();
  // Returns: { access_token, refresh_token, expires_in: 1800, token_type: 'Bearer' }
}

// Refresh token (access tokens expire after 30 min)
async function refreshXeroToken(refreshToken) {
  const response = await fetch('https://identity.xero.com/connect/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: process.env.XERO_CLIENT_ID,
      refresh_token: refreshToken,
    })
  });
  return response.json();
}
```

### OAuth Scopes

| Scope | Access |
|-------|--------|
| `openid profile email` | User identity |
| `accounting.transactions` | Invoices, credit notes, payments, bank transactions |
| `accounting.contacts` | Contacts (customers, suppliers) |
| `accounting.reports.read` | Financial reports (P&L, balance sheet, trial balance) |
| `accounting.settings` | Chart of accounts, tax rates, currencies |
| `accounting.attachments` | File attachments on transactions |

### Multi-Tenancy

After token exchange, call `GET /connections` to retrieve the list of authorised organisations. Store the `tenantId` UUID — it is required as the `Xero-Tenant-Id` header on every subsequent API call.

```js
const connections = await fetch('https://api.xero.com/connections', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());
// [{ tenantId, tenantName, tenantType, ... }]
```

## Core Objects

| Object | Endpoint | Key Fields | Notes |
|--------|----------|------------|-------|
| Contact | `/Contacts` | ContactID, Name, EmailAddress, AccountNumber, IsCustomer, IsSupplier | Used for both customers and suppliers |
| Account | `/Accounts` | AccountID, Code, Name, Type, TaxType | Chart of accounts |
| Invoice | `/Invoices` | InvoiceID, Type (ACCREC/ACCPAY), ContactID, LineItems, DueDate, Status | ACCREC = AR, ACCPAY = AP |
| Payment | `/Payments` | PaymentID, InvoiceID, AccountID, Amount, Date | Links invoice to bank account |
| BankTransaction | `/BankTransactions` | BankTransactionID, Type, Contact, LineItems, BankAccount | Manual bank entries |
| BankStatement | `/BankStatements` | StatementID, Lines | Bank feed import |
| Report | `/Reports/{ReportID}` | ProfitAndLoss, BalanceSheet, TrialBalance, AgedReceivablesByContact | Read-only financial reports |
| CreditNote | `/CreditNotes` | CreditNoteID, Type, Status, LineItems | AR/AP credit notes |

```js
const XERO_BASE = 'https://api.xero.com/api.xro/2.0';

async function xeroGet(path, tenantId, token) {
  const res = await fetch(`${XERO_BASE}${path}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Xero-Tenant-Id': tenantId,
      'Accept': 'application/json',
    }
  });
  if (!res.ok) throw new Error(`Xero API ${res.status}: ${await res.text()}`);
  return res.json();
}

// Fetch contacts (customers)
const { Contacts } = await xeroGet('/Contacts?where=IsCustomer=true', tenantId, token);
```

## Invoicing & Payments

Xero invoices are typed: `ACCREC` for accounts receivable (money owed to you) and `ACCPAY` for accounts payable (money you owe). Invoices move through a defined status lifecycle.

```js
async function createInvoice(tenantId, token, { contactId, lineItems, dueDate, reference }) {
  const body = {
    Invoices: [{
      Type: 'ACCREC',
      Contact: { ContactID: contactId },
      DueDate: dueDate,                    // "2026-04-30"
      Reference: reference,
      Status: 'DRAFT',                     // DRAFT → SUBMITTED → AUTHORISED → PAID
      LineItems: lineItems.map(li => ({
        Description: li.description,
        Quantity: li.quantity,
        UnitAmount: li.unitAmount,
        AccountCode: li.accountCode,       // e.g. "200" (Sales)
        TaxType: 'OUTPUT2',                // SA VAT at 15%
      }))
    }]
  };
  const res = await fetch(`${XERO_BASE}/Invoices`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Xero-Tenant-Id': tenantId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body)
  });
  return res.json();
}
```

### Invoice Lifecycle

| Status | Meaning | Transitions |
|--------|---------|-------------|
| DRAFT | Created, not submitted | → SUBMITTED or AUTHORISED |
| SUBMITTED | Awaiting approval | → AUTHORISED or DELETED |
| AUTHORISED | Approved, sent to customer | → PAID or VOIDED |
| PAID | Fully paid | Terminal |
| VOIDED | Cancelled | Terminal |
| DELETED | Soft deleted | Terminal |

### Applying a Payment

```js
async function applyPayment(tenantId, token, { invoiceId, accountId, amount, date }) {
  const body = {
    Payments: [{
      Invoice: { InvoiceID: invoiceId },
      Account: { AccountID: accountId },   // Bank account the payment was received into
      Amount: amount,
      Date: date,                           // "2026-04-15"
      Reference: 'EFT payment received',
    }]
  };
  const res = await fetch(`${XERO_BASE}/Payments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Xero-Tenant-Id': tenantId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body)
  });
  return res.json();
}
```

### AR Aging Query

```js
// Get all authorised AR invoices overdue (DueDate < today)
const today = new Date().toISOString().split('T')[0];
const { Invoices } = await xeroGet(
  `/Invoices?where=Type=="ACCREC"&&Status=="AUTHORISED"&&DueDate<DateTime(${today.replace(/-/g,',,')})&order=DueDate ASC`,
  tenantId, token
);

const aging = Invoices.map(inv => ({
  contact: inv.Contact.Name,
  invoiceNumber: inv.InvoiceNumber,
  amountDue: inv.AmountDue,
  dueDate: inv.DueDate,
  daysOverdue: Math.floor((Date.now() - new Date(inv.DueDate)) / 86400000)
}));
```

## Bank Reconciliation

Xero bank feeds import statement lines that must be matched to existing transactions or manually coded to the correct GL account. Unreconciled lines accumulate until matched.

```js
// Get unreconciled bank statement lines
async function getUnreconciledLines(tenantId, token, bankAccountId) {
  const { BankStatements } = await xeroGet(
    `/BankStatements?BankAccountID=${bankAccountId}&Unreconciled=true`,
    tenantId, token
  );
  return BankStatements.flatMap(s => s.Lines);
}

// AI reconciliation suggestion engine
async function suggestMatches(statementLine, openInvoices) {
  const amountMatches = openInvoices.filter(inv =>
    Math.abs(inv.AmountDue - statementLine.Amount) < 0.01
  );
  const nameMatches = openInvoices.filter(inv =>
    statementLine.Payee?.toLowerCase().includes(
      inv.Contact.Name.toLowerCase().split(' ')[0]
    )
  );
  return [...new Set([...amountMatches, ...nameMatches])].map(inv => ({
    invoice: inv,
    confidence: amountMatches.includes(inv) && nameMatches.includes(inv) ? 'HIGH'
               : amountMatches.includes(inv) ? 'MEDIUM' : 'LOW'
  }));
}
```

High-confidence matches (amount + payee both match) can be auto-reconciled. Always queue low-confidence matches for human review.

## Reporting

Xero's Reports API returns structured JSON for all standard financial statements. The AI converts this into plain-English narratives, summaries, and variance analyses.

```js
// P&L for a date range
async function getProfitAndLoss(tenantId, token, fromDate, toDate) {
  const { Reports } = await xeroGet(
    `/Reports/ProfitAndLoss?fromDate=${fromDate}&toDate=${toDate}&standardLayout=true`,
    tenantId, token
  );
  return Reports[0];
}

// Balance Sheet as at a date
async function getBalanceSheet(tenantId, token, date) {
  const { Reports } = await xeroGet(
    `/Reports/BalanceSheet?date=${date}&standardLayout=true`,
    tenantId, token
  );
  return Reports[0];
}

// Aged Receivables — who owes what
async function getAgedReceivables(tenantId, token) {
  const { Reports } = await xeroGet(
    `/Reports/AgedReceivablesByContact`,
    tenantId, token
  );
  return Reports[0];
}
```

## MCP Tools

| Tool | Description |
|------|-------------|
| `get_contacts` | List customers and suppliers with filtering |
| `create_invoice` | Draft or authorise an ACCREC/ACCPAY invoice |
| `get_invoices` | Query invoices by status, contact, date range |
| `apply_payment` | Mark invoice as paid against a bank account |
| `get_bank_transactions` | Fetch unreconciled bank statement lines |
| `suggest_reconciliation` | AI-powered match suggestions for statement lines |
| `get_profit_and_loss` | P&L report for any date range |
| `get_balance_sheet` | Balance sheet as at any date |
| `get_aged_receivables` | Aged debtor analysis by contact |
| `get_aged_payables` | Aged creditor analysis by contact |
| `create_credit_note` | Issue AR/AP credit notes |
| `get_chart_of_accounts` | Full account list with codes and types |

## Key Facts

- API version: 2.0; formats: JSON and XML
- Rate limit: 60 requests/minute per tenant connection, 5,000/day
- Supports 160+ currencies; IFRS and GAAP compliant
- Multi-tenant: each organisation has a distinct UUID `tenantId`
- All monetary values in decimal; specify currency code explicitly
- Xero's unique identifier for most objects is a UUID called `{ObjectType}ID`

## Common Gotchas

- **Access tokens expire in 30 minutes** — always refresh before calling; store refresh token securely; refresh tokens expire after 60 days of inactivity.
- **Tenant ID is mandatory** — every API call requires a `Xero-Tenant-Id` header; missing it returns 403, not a helpful error message.
- **Rate limits are per connection, not global** — 60 req/min per tenant connection; if you have 10 tenants, each gets 60 independently. Xero returns 429 on breach with a `Retry-After` header.
- **Invoice amounts are net of tax unless stated** — `LineAmount` is net; `TaxAmount` is separate. South African VAT (`OUTPUT2` / `INPUT2`) = 15%. Always specify `TaxType` explicitly or Xero will infer from account settings.
- **DueDate format** — use `"YYYY-MM-DD"` string in JSON mode. Millisecond timestamp format is accepted but not documented — stick to ISO date strings.
- **Contacts are shared** — the same Contact can be both a customer (`IsCustomer=true`) and supplier (`IsSupplier=true`). Search first, do not create duplicates.
- **Voided is not deleted** — voided invoices remain in history; deleted invoices are soft-deleted and retrievable with `includeArchived=true`. Regulatory audit trails require voiding, not deletion.
- **Bank feed vs manual entry** — bank feeds (direct integration) have `IsReconciled` managed by Xero; manual bank transactions require explicit reconciliation calls. Do not mix the workflows.

## See Also

- [Xero API changelog](https://developer.xero.com/changelog) — subscribe before building production integrations
- [Related: biz/accounting](../SKILL.md)
