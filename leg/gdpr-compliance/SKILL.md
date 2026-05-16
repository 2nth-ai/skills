---
domain: legal
skill: gdpr-compliance
name: GDPR & POPIA Compliance for SaaS Platforms
version: "1.0"
tier: platform
contributor: 2nth-core
status: active
tags: [gdpr, popia, privacy, compliance, saas, data-protection]
---

# GDPR & POPIA Compliance for SaaS Platforms

Technical and operational requirements for GDPR (EU) and POPIA (South Africa) compliance in multi-tenant SaaS platforms.

## Applicability

### When POPIA Applies
- Processing personal information of South African data subjects
- Any 2nth.ai/2nth.io user with a South African email, IP, or declared location
- B2BS.co.za as the responsible party (data controller)

### When GDPR Applies
- Processing personal data of EU/EEA data subjects
- Any user accessing from EU, or with EU email domain
- Applies even if the data controller is outside the EU
- 2nth.ai processes EU data via Cloudflare edge nodes in EU

### Overlap
Both laws share the same core principles. Build for GDPR (stricter) and you satisfy POPIA automatically. Key differences:

| Requirement | GDPR | POPIA |
|-------------|------|-------|
| Notification deadline | 72 hours | "As soon as reasonably possible" |
| DPO required? | Yes (>250 employees or special categories) | Yes (Information Officer, registered with Regulator) |
| Fines | Up to €20M or 4% global turnover | Up to R10M or 10 years imprisonment |
| Data transfer | Adequacy decisions, SCCs, BCRs | Similar, but SA not yet on EU adequacy list |
| Right to be forgotten | Article 17 — explicit right | Section 24 — similar, less explicit |
| Data portability | Article 20 — structured, machine-readable | Not explicitly required, but best practice |

## Lawful Basis for Processing

### Per Data Type
| Data | Lawful Basis | Justification |
|------|-------------|---------------|
| Email address | Consent (registration) | Required for account creation and OTP auth |
| Display name | Consent (optional) | User chooses to provide |
| Company name | Consent (optional) | User chooses to provide |
| IP address | Legitimate interest | Security, rate limiting, abuse prevention |
| Geo location (country/city) | Legitimate interest | POPIA compliance (jurisdiction), Cloudflare auto-detection |
| Token balance | Contract | Billing relationship |
| Activity log | Legitimate interest + Legal obligation | Security audit, POPIA Section 19 |
| Agent chat history | Contract | Service delivery |
| OAuth tokens | Contract | SSO functionality |

## Technical Requirements

### Data Minimisation
```
DO collect:
  ✓ Email (required for auth)
  ✓ Consent timestamp + IP (required for compliance)
  ✓ Activity log (required for security)

DO NOT collect:
  ✗ Full name (unless user volunteers it)
  ✗ Physical address (not needed)
  ✗ Date of birth (not needed)
  ✗ Government ID numbers (not needed)
  ✗ Browsing history beyond platform (no third-party tracking)
  ✗ Device fingerprinting beyond session (anon demo only)
```

### Encryption
| Layer | Requirement | 2nth Implementation |
|-------|-------------|---------------------|
| In transit | TLS 1.2+ | Cloudflare manages (TLS 1.3) |
| At rest (DB) | AES-256 or equivalent | Cloudflare D1 encrypted at rest |
| At rest (KV) | Encrypted storage | Cloudflare KV encrypted at rest |
| Backups | Encrypted | D1 automatic (Cloudflare managed) |
| Secrets | Environment variables | Wrangler secrets (encrypted) |

### Access Control
```
Principle of least privilege:
  - Users see only their own data
  - Partners see only their scoped content
  - Admin access requires explicit role
  - OAuth scopes limit data exposed to relying parties
  - No wildcard database queries without user_id filter
```

### Data Retention
| Data Type | Retention Period | Justification |
|-----------|-----------------|---------------|
| User account | Until deletion requested | Ongoing service |
| Activity log | 12 months | Security audit |
| Auth sessions | 7-30 days (auto-expire) | Session management |
| OTP codes | 10 minutes (auto-expire) | Authentication |
| OAuth auth codes | 10 minutes (auto-expire) | Token exchange |
| Refresh tokens | 30 days (auto-expire) | Session continuity |
| Anonymous fingerprints | 30 days (auto-expire) | Demo rate limiting |
| Breach register | 5 years minimum | Legal requirement |
| Consent audit trail | Life of account + 5 years | Legal requirement |

### Automatic Purge Implementation
```sql
-- Run daily via scheduled worker
DELETE FROM activity_log
WHERE created_at < datetime('now', '-12 months');

DELETE FROM anon_identities
WHERE last_seen < datetime('now', '-30 days');

DELETE FROM oauth_authorization_codes
WHERE expires_at < datetime('now');

DELETE FROM oauth_refresh_tokens
WHERE expires_at < datetime('now');
```

## Privacy by Design Checklist

### Registration Flow
- [ ] Only email required (all other fields optional)
- [ ] Consent timestamp and IP captured
- [ ] Terms link visible before submission
- [ ] No pre-checked marketing consent boxes
- [ ] Welcome email includes privacy notice link
- [ ] Profile defaults to private

### Authentication Flow
- [ ] OTP/magic link — no password storage
- [ ] Session cookies: HttpOnly, Secure, SameSite=Lax
- [ ] Session rotation after 1 hour
- [ ] Rate limiting on auth endpoints (3/min)
- [ ] Failed attempt logging (without storing codes)
- [ ] Brute-force lockout (5 attempts)

### Data Display
- [ ] PII never in URLs or query parameters
- [ ] PII never in client-side JavaScript variables (except current user)
- [ ] Partner names/emails not visible to unauthenticated users
- [ ] Error messages don't reveal whether an email exists
- [ ] API responses don't include unnecessary fields

### Third-Party Services
| Service | Data Shared | DPA Required | Status |
|---------|-------------|-------------|--------|
| Cloudflare | All traffic (proxied) | Yes (Cloudflare DPA) | ✓ Covered by Cloudflare terms |
| Resend | Email addresses (OTP) | Yes | Review required |
| Hetzner | Server data (2nth.io) | Yes | Review required |
| Paystack | Email + payment (billing) | Yes | Review required |
| GitHub | Public code only | No (no PII) | N/A |

## Information Officer Registration

### POPIA Requirement (Section 55)
- Register Information Officer with Information Regulator
- Current: Craig Leppan (craig@2nth.ai)
- Register at: https://www.justice.gov.za/inforeg/
- Annual confirmation required

### Responsibilities
1. Encourage compliance within the organisation
2. Handle data subject requests
3. Ensure privacy impact assessments are conducted
4. Cooperate with the Information Regulator
5. Maintain breach register

## Cross-Border Data Transfers

### Current Architecture
```
User (SA/EU/Global)
  → Cloudflare Edge (nearest PoP — global)
  → Cloudflare D1 (edge replicated)
  → Hetzner Cloud (Helsinki — 2nth.io instances)
```

### POPIA Section 72 — Transborder Flows
Personal information may be transferred if:
1. Recipient country has adequate protection (EU countries qualify)
2. Data subject consents
3. Transfer is necessary for contract performance
4. Binding corporate rules are in place

### GDPR Chapter 5 — International Transfers
- Cloudflare: Standard Contractual Clauses (SCCs) in place
- Hetzner: EU-based (Germany/Finland) — no transfer issue
- Mauritius (planned): No EU adequacy decision — will need SCCs

## Privacy Notice Template

Every 2nth property must display:
1. **Who we are** — Data controller identity and contact
2. **What we collect** — Specific data types
3. **Why** — Lawful basis per data type
4. **How long** — Retention periods
5. **Who sees it** — Third parties and sub-processors
6. **Your rights** — Access, correction, deletion, portability, objection
7. **How to complain** — Information Regulator contact details
8. **Updates** — How changes to the notice are communicated
