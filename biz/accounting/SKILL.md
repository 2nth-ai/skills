---
name: biz/accounting
description: |
  Accounting domain manifest. Use this skill when routing to accounting system integrations.
  Child skills provide specific platform coverage:
  (1) Xero cloud accounting — invoicing, reconciliation, financial reports, OAuth 2.0.
license: MIT
compatibility: Any
homepage: https://skills.2nth.ai/biz/accounting
repository: https://github.com/2nth-ai/skills
requires: []
improves:
  - biz
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Accounting, Finance, ERP"
allowed-tools: Read
---

# Accounting Skills

Accounting integrations for cloud platforms used by SMEs. Skills in this subdomain cover API integration, AI-powered workflow automation, and financial data extraction.

## Child Skills

| Skill | Path | Status |
|-------|------|--------|
| Xero Accounting | `biz/accounting/xero/SKILL.md` | production |

## See Also

- [biz/erp](../erp/SKILL.md) — ERP systems (Sage X3, ERPNext, Shopify)
- [fin/reporting](../../fin/reporting/SKILL.md) — Financial KPI reporting patterns
