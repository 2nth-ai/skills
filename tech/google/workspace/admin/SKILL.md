---
name: tech/google/workspace/admin
description: |
  Workspace Admin SDK skill (stub). Use when: (1) provisioning users and groups via Directory API,
  (2) auditing logins / admin / Drive / Gmail events via Reports API,
  (3) managing domain-wide delegation grants and OAuth app allowlists,
  (4) programmatically managing org units, mobile device policies, and Chrome OS devices,
  (5) automating offboarding — suspend user, transfer Drive, delete after grace period.
license: MIT
compatibility: Admin SDK Directory v1, Reports v1, Groups Settings v1
homepage: https://skills.2nth.ai/tech/google/workspace/admin
repository: https://github.com/2nth-ai/skills
requires:
  - tech/google/workspace
improves:
  - tech/google/workspace
  - tech/google
  - tech
metadata:
  author: 2nth.ai
  version: "0.1.0"
  categories: "Google Workspace Admin, Directory, Reports, User Provisioning, Compliance"
allowed-tools: Read Write Edit Glob Grep
---

# Workspace Admin SDK (stub)

> **Status**: stub. Production depth pending.

## Requires super-admin DWD

Admin SDK writes (create users, update groups, delete) require **DWD impersonation of a Workspace super-admin**, not any regular user. Grant the service account DWD with scopes like `admin.directory.user` and set `subject: 'superadmin@example.com'` in the JWT.

## Common operations

```typescript
import { google } from 'googleapis';
const admin = google.admin({ version: 'directory_v1', auth });

// Provision a new user
await admin.users.insert({
  requestBody: {
    primaryEmail: 'new.hire@example.com',
    name: { givenName: 'New', familyName: 'Hire' },
    password: 'TempPass!2026',
    changePasswordAtNextLogin: true,
    orgUnitPath: '/Staff',
  },
});

// Suspend a user (offboarding step 1 — retains data, blocks login)
await admin.users.update({
  userKey: 'leaving@example.com',
  requestBody: { suspended: true },
});

// List group members
const { data } = await admin.members.list({ groupKey: 'engineering@example.com' });
```

## Reports API (audit)

```typescript
const reports = google.admin({ version: 'reports_v1', auth });

// Who logged in from where in the last 24h
const { data } = await reports.activities.list({
  userKey: 'all',
  applicationName: 'login',
  startTime: new Date(Date.now() - 86400000).toISOString(),
});

// Admin console actions
await reports.activities.list({
  userKey: 'all',
  applicationName: 'admin',
});
```

Activities available: `login`, `admin`, `drive`, `gmail` (requires Enterprise plan), `calendar`, `groups`, `mobile`, `meet`, `context_aware_access`.

## Offboarding automation pattern

```
Trigger (HR webhook, calendar event)
 ─ admin.users.update { suspended: true }
 ─ Transfer Drive ownership to manager (Data Transfer API)
 ─ Remove from all groups (admin.members.delete)
 ─ Revoke OAuth tokens (admin.tokens.delete)
 ─ After N-day retention → admin.users.delete
```

## Gotchas (high-level)

- DWD super-admin grant is a broad, audited privilege. Rotate the key, store in Secret Manager, alert on use.
- `admin.users.delete` is immediate and permanent. Always suspend first.
- Reports API has a 4-hour ingestion lag — recent events may be missing.
- Gmail audit requires Enterprise tier; Standard plans don't see mail activities.
- OAuth app allowlisting: adding an app via API marks it as trusted; removing it doesn't force-revoke existing tokens — also call `tokens.delete` per user.

## See Also

- [Workspace parent (DWD setup)](../SKILL.md)
- [GCP IAM (for service-account role grants)](../../cloud/security/SKILL.md)
