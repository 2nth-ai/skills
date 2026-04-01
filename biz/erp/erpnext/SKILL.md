---
name: biz/erp/erpnext
description: |
  ERPNext integration expert. Use this skill when:
  (1) querying ERPNext doctypes — Items, BOMs, Work Orders, Stock, Sales/Purchase,
  (2) building or managing Bills of Materials for manufactured products,
  (3) scheduling and tracking production work orders,
  (4) managing raw material inventory and stock movements,
  (5) building AI-powered reporting dashboards against ERPNext,
  (6) integrating ERPNext with external systems via its REST/RPC API.
license: MIT
compatibility: Any HTTP client, Python, or Cloudflare Workers
homepage: https://skills.2nth.ai/biz/erp/erpnext
repository: https://github.com/2nth-ai/skills
requires:
  - tech/cloudflare/workers
  - fin/reporting
improves:
  - biz/erp
metadata:
  author: 2nth.ai
  version: "1.1.0"
  categories: "ERP, Manufacturing, REST API, ERPNext, Frappe"
allowed-tools: Bash(curl:*) Bash(npx:*) Bash(python*) Read Write Edit Glob Grep
---

# ERPNext Integration

ERPNext is an open-source ERP built on the Frappe framework. It exposes a comprehensive **REST API** for every doctype, plus an **RPC API** for server-side methods.

Docs: https://frappeframework.com/docs/user/en/api

## Authentication

### API Key + Secret (recommended for integrations)

```
Authorization: token api_key:api_secret
```

### Basic Auth

```
Authorization: Basic base64(user:password)
```

### Session (cookie-based)

```bash
curl -X POST https://site.example.com/api/method/login \
  -d 'usr=user@example.com&pwd=password'
# Use returned cookies for subsequent requests
```

**Never hardcode credentials.** Use environment variables or secrets.

## API Patterns

### Base URL

```
https://<site>/api/resource/<DocType>
https://<site>/api/method/<dotted.path>
```

### List records

```
GET /api/resource/Item?filters=[["item_group","=","Finished Goods"]]&fields=["name","item_name","item_group","stock_uom"]&limit_page_length=50&order_by=item_name asc
```

### Get single record

```
GET /api/resource/Item/ITEM-CODE-001
```

### Create record

```
POST /api/resource/Item
Content-Type: application/json

{"item_code":"ITEM-001","item_name":"Item Name","item_group":"Finished Goods","stock_uom":"Nos"}
```

### Update record

```
PUT /api/resource/Item/ITEM-001
Content-Type: application/json

{"description":"Updated description"}
```

### Filters

Filters are JSON arrays: `[field, operator, value]`

| Operator | Meaning | Example |
|----------|---------|---------|
| `=` | Equals | `["item_group","=","Raw Material"]` |
| `!=` | Not equals | `["status","!=","Cancelled"]` |
| `>`, `>=`, `<`, `<=` | Comparison | `["qty",">",0]` |
| `like` | Wildcard match | `["item_name","like","%Oak%"]` |
| `in` | In list | `["status","in",["Open","In Process"]]` |
| `between` | Range | `["posting_date","between",["2026-01-01","2026-03-31"]]` |

Multiple filters: `[["item_group","=","Raw Material"],["stock_uom","=","Nos"]]`

## Core Doctypes

```
Item                      — Products, raw materials, sub-assemblies
BOM (Bill of Materials)   — Recipe for manufacturing a product
Work Order                — Production order
Job Card                  — Per-operation tracking
Workstation               — Machine or station
Operation                 — Manufacturing step
Stock Entry               — Inventory movements (issue, receipt, manufacture)
Quality Inspection        — QC checks
Sales Order               — Customer orders
Purchase Order            — Supplier orders
Warehouse                 — Storage locations
```

## Manufacturing Flow

```
Sales Order
  → Work Order (from BOM)
    → Job Card (per operation)
      → Stock Entry (material transfer)
      → Stock Entry (manufacture — finished goods in)
    → Quality Inspection
  → Delivery Note
  → Sales Invoice
```

## RPC Methods

```
POST /api/method/erpnext.manufacturing.doctype.work_order.work_order.make_stock_entry
Content-Type: application/json

{"work_order":"WO-00045","purpose":"Material Transfer for Manufacture","qty":30}
```

### Useful RPC methods

| Method | Purpose |
|--------|---------|
| `frappe.client.get_count` | Count documents matching filters |
| `frappe.client.get_list` | List with server-side aggregation |
| `erpnext.stock.utils.get_stock_balance` | Real-time stock balance |
| `erpnext.manufacturing.doctype.bom.bom.get_bom_items` | Explode BOM |
| `erpnext.manufacturing.doctype.work_order.work_order.make_stock_entry` | Create stock entry from WO |
| `erpnext.selling.doctype.sales_order.sales_order.make_work_order` | Create WO from SO |

## Common Gotchas

- **Docstatus matters**: 0=Draft, 1=Submitted, 2=Cancelled. Most queries need `["docstatus","=",1]`
- **Child tables**: BOM items, SO items are child tables — fetch via parent or `fields=["items.item_code","items.qty"]`
- **Rate limits**: Frappe defaults to 5 requests/second for API keys
- **Pagination**: Default `limit_page_length=20`. Set explicitly; use `limit_page_length=0` for all (careful with large sets)
- **Naming series**: Always use `name` (ID) not `item_name` for record lookups
- **BOM versioning**: Multiple BOMs per item — filter for `is_active=1` and `is_default=1`
- **Stock Entry types**: "Material Issue", "Material Receipt", "Material Transfer for Manufacture", "Manufacture"

## See Also

- [API queries](references/queries.md)
- [Manufacturing workflows](references/manufacturing.md)
- [AI integration](references/ai-integration.md)
