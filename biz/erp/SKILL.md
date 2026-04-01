---
name: biz/erp
description: |
  ERP integration skills. Use skills in this subdomain when working with:
  (1) Sage X3 — GraphQL API, master data, sales, purchasing, stock,
  (2) ERPNext / Frappe — REST API, manufacturing, BOMs, work orders,
  (3) Shopify — Admin + Storefront API, e-commerce operations,
  (4) any ERP system for AI-powered reporting or workflow automation.
license: MIT
homepage: https://skills.2nth.ai/biz/erp
repository: https://github.com/2nth-ai/skills
improves:
  - biz
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "ERP, Business, Integration"
---

# ERP Skills

Enterprise resource planning integrations. All production skills in this subdomain follow the same pattern: authenticate, introspect, query, transform, report.

## Production Skills

| Skill | System | API Style |
|-------|--------|-----------|
| `biz/erp/sage-x3` | Sage X3 / Sage Enterprise Management | GraphQL |
| `biz/erp/erpnext` | ERPNext (Frappe framework) | REST + RPC |
| `biz/erp/shopify` | Shopify | REST + GraphQL |

## Common ERP Principles

- **Never hardcode credentials.** Use environment variables or `wrangler secret`.
- **Introspect before querying.** Schemas vary by installation and version.
- **Pagination is required.** All ERP APIs return partial results by default.
- **2nth is middleware, not SOR.** Read from the ERP, enrich with AI, write results back or display in dashboards. Never replace the ERP as the system of record.
