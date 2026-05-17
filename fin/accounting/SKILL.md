---
name: fin/accounting
description: |
  Accounting domain manifest. Use this skill when:
  (1) routing a finance / accounting workload to the right platform integration,
  (2) choosing between QuickBooks (QBO REST API) and Xero (Xero API) for a new build,
  (3) discovering the available leaf skills under fin/accounting.
license: MIT
repository: https://github.com/2nth-ai/skills
improves:
  - fin
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Accounting, Finance"
---

# Accounting

AI integration skills for cloud accounting platforms — invoicing, payments, reconciliation, and reporting.

## Child Skills

- [QuickBooks Online](quickbooks/SKILL.md) — QBO REST API v3, OAuth 2.0, CDC, reports
- [Xero](../../biz/accounting/xero/SKILL.md) — Xero REST API, OAuth 2.0 PKCE, invoicing, bank reconciliation
