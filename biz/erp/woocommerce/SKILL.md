---
name: biz/erp/woocommerce
description: |
  WooCommerce AI integration expert. Use this skill when:
  (1) querying the WooCommerce REST API — products, orders, customers, inventory, coupons, reports,
  (2) building AI-powered e-commerce automations on WordPress/WooCommerce stores,
  (3) automating order management, fulfilment, stock alerts, and customer communications,
  (4) generating product descriptions, SEO content, and pricing recommendations,
  (5) analysing WooCommerce data for sales trends, customer behaviour, and inventory health,
  (6) integrating WooCommerce with ERPs, accounting systems, or fulfilment providers via AI middleware.
license: MIT
compatibility: Any HTTP client, Node.js, Python, Cloudflare Workers, PHP
homepage: https://skills.2nth.ai/biz/erp/woocommerce
repository: https://github.com/2nth-ai/skills
requires: []
improves:
  - biz/erp
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "E-Commerce, WooCommerce, WordPress, AI, Retail"
allowed-tools: Bash(curl:*) Bash(npx:*) Read Write Edit Glob Grep
---

# WooCommerce AI Integration

WooCommerce is the world's most widely deployed e-commerce platform, running on WordPress. It exposes a full REST API (v3) for programmatic access to the entire store — products, orders, customers, inventory, coupons, and reports.

Docs: https://woocommerce.github.io/woocommerce-rest-api-docs/

## The 2nth Model: One Person + One AI

| Role | The Human Decides | The AI Enables |
|------|-------------------|----------------|
| **Store Owner** | Strategy, margins, supplier relationships | Revenue dashboards, profitability by category, reorder alerts |
| **Merchandiser** | Range planning, pricing, promotions | Bulk product updates, auto-tagging, SEO title/description generation |
| **Content Creator** | Brand voice, creative direction | Product descriptions, meta tags, alt text, blog content |
| **Customer Service** | Escalations, refunds, relationship calls | Order lookup, draft responses, return eligibility checks |
| **Operations** | Exception handling, carrier selection | Stock alerts, fulfilment routing, fraud flag review |
| **Marketing Manager** | Campaign strategy, budget | Coupon performance, customer segmentation, repeat purchase analysis |

## Authentication

WooCommerce REST API uses **Basic Auth over HTTPS** with Consumer Key + Consumer Secret.

Generate keys: WooCommerce → Settings → Advanced → REST API → Add key

```bash
# Environment variables
WC_URL="https://yourstore.com"
WC_KEY="ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
WC_SECRET="cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

```bash
# Basic Auth header
Authorization: Basic base64(WC_KEY:WC_SECRET)
```

Or pass as query params (less secure — avoid in production):
```
?consumer_key=ck_xxx&consumer_secret=cs_xxx
```

**Base URL:**
```
https://{store}/wp-json/wc/v3/{resource}
```

## Core Resources

### Products
```bash
# List active products
GET /wp-json/wc/v3/products?status=publish&per_page=100

# Get single product
GET /wp-json/wc/v3/products/{id}

# Create product
POST /wp-json/wc/v3/products
{
  "name": "Product Name",
  "type": "simple",           # simple | variable | grouped | external
  "regular_price": "299.00",
  "description": "...",
  "short_description": "...",
  "categories": [{"id": 12}],
  "images": [{"src": "https://..."}],
  "manage_stock": true,
  "stock_quantity": 50
}

# Update product
PUT /wp-json/wc/v3/products/{id}

# Batch update (up to 100)
POST /wp-json/wc/v3/products/batch
{
  "update": [{"id": 123, "regular_price": "199.00"}],
  "delete": [456]
}
```

### Product Variations
```bash
# List variations for a variable product
GET /wp-json/wc/v3/products/{product_id}/variations

# Update variation stock
PUT /wp-json/wc/v3/products/{product_id}/variations/{variation_id}
{ "stock_quantity": 25 }
```

### Orders
```bash
# List open orders
GET /wp-json/wc/v3/orders?status=processing&per_page=50

# Statuses: pending | processing | on-hold | completed | cancelled | refunded | failed | trash

# Get single order
GET /wp-json/wc/v3/orders/{id}

# Update order status
PUT /wp-json/wc/v3/orders/{id}
{ "status": "completed" }

# Add order note
POST /wp-json/wc/v3/orders/{id}/notes
{ "note": "Dispatched via FastShip, tracking: FS123456", "customer_note": true }

# Create refund
POST /wp-json/wc/v3/orders/{id}/refunds
{
  "amount": "50.00",
  "reason": "Damaged in transit",
  "line_items": [{"id": 1, "refund_total": 50.00}]
}
```

### Customers
```bash
# List customers
GET /wp-json/wc/v3/customers?per_page=100&orderby=registered_date&order=desc

# Search by email
GET /wp-json/wc/v3/customers?email=user@example.com

# Customer object key fields:
{
  "id": 42,
  "email": "user@example.com",
  "first_name": "...",
  "last_name": "...",
  "orders_count": 7,
  "total_spent": "3450.00",
  "date_created": "...",
  "billing": { "address_1": "...", "city": "...", "country": "ZA" }
}
```

### Inventory & Stock
```bash
# Low stock report
GET /wp-json/wc/v3/reports/stock?type=lowstock

# Out of stock
GET /wp-json/wc/v3/reports/stock?type=outofstock

# Bulk stock update pattern (batch endpoint)
POST /wp-json/wc/v3/products/batch
{
  "update": [
    {"id": 101, "stock_quantity": 0, "stock_status": "outofstock"},
    {"id": 102, "stock_quantity": 15}
  ]
}
```

### Coupons
```bash
# List coupons
GET /wp-json/wc/v3/coupons

# Create coupon
POST /wp-json/wc/v3/coupons
{
  "code": "SAVE20",
  "discount_type": "percent",    # percent | fixed_cart | fixed_product
  "amount": "20",
  "usage_limit": 100,
  "expiry_date": "2026-12-31",
  "minimum_amount": "500.00"
}
```

### Reports
```bash
# Sales summary (date range)
GET /wp-json/wc/v3/reports/sales?date_min=2026-01-01&date_max=2026-03-31

# Top sellers
GET /wp-json/wc/v3/reports/top_sellers?period=month

# Orders totals
GET /wp-json/wc/v3/reports/orders/totals

# Revenue by category — requires custom query or plugin; use orders endpoint + line_items
```

## Key MCP Tools

| Tool | Description |
|------|-------------|
| `wc_list_products` | List products with filters (status, category, stock) |
| `wc_get_product` | Full product detail including variations |
| `wc_update_product` | Update price, stock, description, status |
| `wc_batch_update_products` | Bulk price/stock changes (up to 100) |
| `wc_list_orders` | List orders by status, date, customer |
| `wc_get_order` | Full order detail with line items, shipping, notes |
| `wc_update_order_status` | Move order through status lifecycle |
| `wc_add_order_note` | Add internal or customer-visible note |
| `wc_list_customers` | Customer list with spend and order count |
| `wc_get_customer_orders` | All orders for a specific customer |
| `wc_sales_report` | Revenue, orders, items for a date range |
| `wc_low_stock_report` | Products below stock threshold |
| `wc_create_coupon` | Generate promotional codes |

## AI Workflow Patterns

### Daily Operations Brief
```
1. wc_list_orders(status=processing) → pending fulfilment count
2. wc_low_stock_report() → items needing reorder
3. wc_sales_report(period=yesterday) → revenue vs target
→ Draft morning summary for store owner
```

### Product Description Generation
```
1. wc_get_product(id) → fetch existing product data
2. AI generates SEO-optimised description using name, category, attributes
3. wc_update_product(id, description, short_description, meta_data[seo])
```

### Customer Win-Back
```
1. wc_list_customers(last_active_before=90_days_ago)
2. Filter: orders_count >= 2, total_spent >= threshold
3. AI generates personalised re-engagement email per customer
4. wc_create_coupon(code=unique_per_customer) → attach to email
```

### Abandoned Cart Recovery (requires plugin or webhook)
```
WooCommerce → WooCommerce Abandoned Cart Lite (or Metorik)
Webhook fires → AI drafts recovery email → send via Resend/Mailchimp
```

## Webhooks

WooCommerce fires webhooks on key events. Configure at:
WooCommerce → Settings → Advanced → Webhooks

| Topic | Trigger |
|-------|---------|
| `order.created` | New order placed |
| `order.updated` | Status change, note added |
| `order.deleted` | Order trashed |
| `product.updated` | Stock change, price update |
| `customer.created` | New account registered |

Webhook payload is signed with `X-WC-Webhook-Signature` (HMAC-SHA256 of the body, keyed with the secret).

```typescript
// Verify webhook in Cloudflare Worker
const sig = request.headers.get('X-WC-Webhook-Signature');
const body = await request.text();
const expected = btoa(
  String.fromCharCode(...new Uint8Array(
    await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body))
  ))
);
if (sig !== expected) return new Response('Unauthorized', { status: 401 });
```

## Common Gotchas

- **HTTPS required** — the REST API rejects all requests over plain HTTP. Local dev needs SSL (use ngrok or Local by Flywheel).
- **Per-page max is 100** — paginate with `?page=2&per_page=100`. The `X-WP-TotalPages` response header tells you how many pages exist.
- **Variable products need separate variation calls** — a `variable` product's stock lives on its variations, not the parent. Don't update stock on the parent.
- **Batch endpoint caps at 100 operations** — split large bulk updates into chunks.
- **Order status is a string, not an enum** — plugins can add custom statuses (e.g. `wc-awaiting-payment`). Always check what statuses the store actually uses.
- **Consumer keys are scoped** — create Read-only keys for reporting agents; Read/Write keys for fulfilment agents. Never give an agent a key with more permissions than it needs.
- **wp-json path can be customised** — some WordPress installs change the REST prefix. Check `https://store.com/wp-json/` to confirm the discovery endpoint resolves.
- **WooCommerce version matters** — v3 API requires WooCommerce ≥ 3.5. Check `GET /wp-json/wc/v3` returns `200` before assuming all endpoints exist.

## See Also

- [WooCommerce REST API Docs](https://woocommerce.github.io/woocommerce-rest-api-docs/)
- [WooCommerce Webhooks](https://woocommerce.com/document/webhooks/)
- [Shopify skill](../shopify/SKILL.md) — for Shopify-specific patterns
- [Xero skill](../../accounting/xero/SKILL.md) — for accounting integration
