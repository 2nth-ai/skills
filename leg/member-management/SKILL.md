---
domain: legal
skill: member-management
name: Multi-Portal Member Management
version: "1.0"
tier: platform
contributor: 2nth-core
status: active
tags: [popia, gdpr, privacy, members, consent, multi-tenant, sso]
---

# Multi-Portal Member Management

Best practices for managing members across multiple properties with SSO, privacy compliance, and role-based access.

## Architecture Pattern

### Central Identity Provider (2nth.ai)
```
2nth.ai (Identity Provider)
├── User account (email, profile, consent record)
├── OAuth2/OIDC provider
├── Token balance & billing
├── Activity audit log
│
├── 2nth.io (Relying Party — Infrastructure)
│   ├── OTP auth via 2nth.ai API
│   ├── Local session cookie (2nth_io_session)
│   ├── Role: platform user, partner
│   └── No duplicate user record
│
├── 2nth.org (Relying Party — Investor Portal)
│   ├── PIN auth (local) + OTP fallback via 2nth.ai
│   ├── Local session cookie (2nth_org_pin / 2nth_org_token)
│   ├── Role: investor (whitelist-gated)
│   └── No duplicate user record
│
├── 2nth.me (Independent Identity)
│   ├── Own OTP auth, own KV store
│   ├── Separate user record (privacy-first)
│   ├── Optional link to 2nth.ai account
│   └── Role: skill member
│
└── developers.2nth.ai (Relying Party — Dev Portal)
    ├── JWT auth via 2nth.ai session cookie
    ├── Scope-based access (per partner)
    └── Role: developer, partner, admin
```

### Key Principles

1. **Single identity, multiple sessions** — One account on 2nth.ai, separate session cookies per property
2. **No credential duplication** — Relying parties never store passwords or PINs for the central identity
3. **Consent per property** — Each property tracks its own consent grant, not inherited from SSO
4. **Minimal data transfer** — OAuth userinfo returns only what the relying party needs (scoped claims)
5. **Independent deletion** — Deleting from one property doesn't cascade (user chooses per-platform)

## Consent Management

### Consent Record Schema
```sql
CREATE TABLE consent_records (
    id              TEXT PRIMARY KEY,
    user_id         TEXT NOT NULL,
    property        TEXT NOT NULL,       -- '2nth.ai', '2nth.io', '2nth.org', '2nth.me'
    consent_type    TEXT NOT NULL,       -- 'registration', 'marketing', 'data_sharing', 'profiling'
    granted         INTEGER NOT NULL DEFAULT 1,
    ip_address      TEXT,
    user_agent      TEXT,
    granted_at      TEXT NOT NULL,
    revoked_at      TEXT,
    version         TEXT,               -- Terms version consented to
    UNIQUE(user_id, property, consent_type)
);
```

### Consent Types
| Type | Description | Required | Default |
|------|-------------|----------|---------|
| `registration` | Account creation consent | Yes | Granted on signup |
| `marketing` | Email marketing opt-in | No | Not granted |
| `data_sharing` | Share data between 2nth properties | No | Not granted |
| `profiling` | Use data for recommendations/analytics | No | Not granted |
| `public_profile` | Make profile publicly visible | No | Not granted |
| `partner_visibility` | Show profile in partner directory | No | Not granted |

### Consent Change Audit
Every consent change must be logged:
```sql
CREATE TABLE consent_audit (
    id              TEXT PRIMARY KEY,
    user_id         TEXT NOT NULL,
    property        TEXT NOT NULL,
    consent_type    TEXT NOT NULL,
    action          TEXT NOT NULL,       -- 'grant', 'revoke', 'update'
    old_value       INTEGER,
    new_value       INTEGER NOT NULL,
    ip_address      TEXT,
    user_agent      TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
```

## Data Subject Rights (POPIA Section 23-25, GDPR Articles 15-22)

### Required Endpoints per Property
```
GET  /api/privacy/data-export      — Full data export (JSON/CSV)
POST /api/privacy/delete-account   — Account deletion with confirmation
GET  /api/privacy/consent          — Current consent status
PUT  /api/privacy/consent          — Update consent preferences
GET  /api/privacy/activity-log     — Activity history for the user
POST /api/privacy/data-request     — Formal data subject request (30-day SLA)
```

### Data Export Format
```json
{
  "export_date": "2026-04-05T10:00:00Z",
  "property": "2nth.ai",
  "user": {
    "id": "abc123",
    "email": "user@example.com",
    "display_name": "User Name",
    "created_at": "2026-01-15T08:00:00Z",
    "consent_records": [
      { "type": "registration", "granted": true, "at": "2026-01-15T08:00:00Z" }
    ]
  },
  "activity_log": [...],
  "transactions": [...],
  "projects": [...],
  "agent_sessions": [...]
}
```

### Deletion Process
1. User requests deletion via UI or API
2. System generates confirmation token (emailed)
3. User confirms within 24 hours
4. Soft-delete: mark `status = 'deleted'`, anonymise PII
5. Hard-delete: after 30-day cooling period, permanently remove
6. Log deletion event in audit trail (retain audit record without PII)
7. Notify linked properties (OAuth clients) of deletion

### Response SLA
- **POPIA**: 30 days (Section 25)
- **GDPR**: 30 days (Article 12), extendable to 90 days for complex requests
- **Best practice**: Respond within 7 days, complete within 14 days

## Role & Access Management

### Role Hierarchy
```
admin          — Full access to all properties and admin functions
partner        — Access to partner hub, developer portal, assigned scopes
builder        — Full platform access, token billing, project creation
investor       — 2nth.org portal access (whitelist-gated)
user           — Standard platform access
explorer       — Free tier, limited demo access
anonymous      — Fingerprint-tracked demo access, no PII
```

### Scope-Based Access (Developer Portal)
```
full           — All partner materials, admin functions
platform       — Platform docs and general partner content
<partner-name> — Specific partner's materials only (e.g. 'agilex', 'proximity-green')
```

### Access Control Checklist per Property
- [ ] Authentication required for private pages
- [ ] Session validation on every protected request
- [ ] Role/scope check before rendering content
- [ ] No PII visible to unauthenticated users
- [ ] Partner profiles gated behind auth
- [ ] Admin functions require admin role
- [ ] Rate limiting on auth endpoints
- [ ] Session expiry and rotation

## Cookie Policy

### Per-Property Cookies
| Property | Cookie | Domain | TTL | Purpose |
|----------|--------|--------|-----|---------|
| 2nth.ai | `2nth_session` | `.2nth.ai` | 7 days | JWT session |
| 2nth.io | `2nth_io_token` | (pages.dev) | 15 min | OAuth access token |
| 2nth.io | `2nth_io_session` | (pages.dev) | 30 days | Session ID |
| 2nth.org | `2nth_org_pin` | (pages.dev) | 30 days | PIN session |
| 2nth.org | `2nth_org_token` | (pages.dev) | 15 min | OAuth access token |
| 2nth.me | `2nth_me_session` | `.2nth.me` | 7 days | Session ID |
| developers | `2nth_session` | `.2nth.ai` | 7 days | Shared with 2nth.ai |

### Cookie Rules
1. All cookies: `HttpOnly`, `Secure`, `SameSite=Lax`
2. No tracking cookies, analytics cookies, or third-party cookies
3. Session cookies only — no persistent identifiers beyond session
4. Cookie consent banner not required if only essential cookies (POPIA/GDPR exemption)

## Breach Notification

### Process
1. Detect breach (monitoring, audit log anomaly, external report)
2. Contain: revoke affected sessions, rotate secrets
3. Assess: determine scope, affected users, data types exposed
4. Notify Information Regulator within 72 hours (POPIA Section 22)
5. Notify affected users "as soon as reasonably possible"
6. Document in breach register

### Breach Register Schema
```sql
CREATE TABLE breach_register (
    id              TEXT PRIMARY KEY,
    detected_at     TEXT NOT NULL,
    description     TEXT NOT NULL,
    affected_users  INTEGER,
    data_types      TEXT,               -- JSON array: ['email', 'name', 'tokens']
    severity        TEXT,               -- 'low', 'medium', 'high', 'critical'
    contained_at    TEXT,
    regulator_notified_at TEXT,
    users_notified_at TEXT,
    remediation     TEXT,
    status          TEXT DEFAULT 'open' -- 'open', 'contained', 'resolved'
);
```

## Implementation Checklist

### Phase 1: Foundation
- [ ] Consent record table in D1
- [ ] Consent audit table in D1
- [ ] Privacy settings page on each property
- [ ] Data export endpoint per property
- [ ] Account deletion endpoint with confirmation flow

### Phase 2: Compliance
- [ ] Data subject request handler (email + API)
- [ ] 30-day SLA tracking
- [ ] Breach register table
- [ ] Breach notification workflow
- [ ] Privacy impact assessment template

### Phase 3: User Control
- [ ] Consent preference centre (granular opt-in/out)
- [ ] Cross-property consent dashboard
- [ ] Activity log viewer per user
- [ ] Data retention policy enforcement (auto-purge)
- [ ] Right to be forgotten across linked properties
