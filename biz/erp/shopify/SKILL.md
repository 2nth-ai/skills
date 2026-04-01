---
name: biz/erp/shopify
description: |
  Shopify AI integration expert. Use this skill when:
  (1) querying Shopify Admin API — products, orders, customers, inventory, collections,
  (2) building AI-powered e-commerce tools — product descriptions, SEO, merchandising,
  (3) automating Shopify operations — order management, fulfillment, customer service,
  (4) connecting Shopify via MCP to give human roles their AI partner,
  (5) building Storefront API integrations for headless commerce,
  (6) analysing Shopify data for marketing, growth, and operational insights.
license: MIT
compatibility: Any HTTP client, Node.js, Python, or Cloudflare Workers
homepage: https://skills.2nth.ai/biz/erp/shopify
repository: https://github.com/2nth-ai/skills
requires:
  - tech/cloudflare/workers
improves:
  - biz/erp
metadata:
  author: 2nth.ai
  version: "1.1.0"
  categories: "E-Commerce, Shopify, AI, Retail"
allowed-tools: Bash(curl:*) Bash(npx:*) Read Write Edit Glob Grep
---

# Shopify AI Integration

Shopify exposes two APIs: the **Admin API** (REST + GraphQL) for store management, and the **Storefront API** (GraphQL) for customer-facing experiences.

Docs: https://shopify.dev/docs/api

## The 2nth Model: One Person + One AI

Every Shopify role has an AI partner that makes them extraordinary:

| Role | The Human Decides | The AI Enables |
|------|-------------------|----------------|
| **Store Owner** | Strategy, pricing, brand direction | Revenue dashboards, trend analysis, competitor monitoring |
| **Merchandiser** | Collection curation, product selection | Auto-tagging, SEO optimisation, inventory-aware recommendations |
| **Content Creator** | Brand voice, creative direction | Draft product descriptions, blog posts, alt text, meta tags |
| **Customer Service** | Escalations, refunds, relationship calls | Order lookup, FAQ answers, draft responses, sentiment analysis |
| **Marketing Manager** | Campaign strategy, budget allocation | Audience segmentation, A/B copy, performance reporting |
| **Operations/Fulfillment** | Exception handling, carrier selection | Order routing, stock alerts, fulfillment tracking, fraud flags |

## Authentication

### Admin API
```
X-Shopify-Access-Token: shpat_xxxxx
```

### Storefront API
```
X-Shopify-Storefront-Access-Token: xxxxx
```

### Admin API Base URL
```
https://{store}.myshopify.com/admin/api/2024-10/{resource}.json   # REST
https://{store}.myshopify.com/admin/api/2024-10/graphql.json      # GraphQL
```

## Admin API — Key Resources

### Products
```
GET /admin/api/2024-10/products.json?limit=50&status=active
POST /admin/api/2024-10/products.json
PUT /admin/api/2024-10/products/{id}.json
```

### Orders
```
GET /admin/api/2024-10/orders.json?status=open&limit=50
POST /admin/api/2024-10/orders/{id}/fulfillments.json
```

### Customers
```
GET /admin/api/2024-10/customers.json?limit=50
GET /admin/api/2024-10/customers/search.json?query=email:user@example.com
```

### Inventory
```
GET /admin/api/2024-10/inventory_levels.json?location_ids=1234
POST /admin/api/2024-10/inventory_levels/set.json
```

## Admin GraphQL API

```graphql
{
  products(first: 10, query: "status:active") {
    edges {
      node {
        id
        title
        variants(first: 5) {
          edges {
            node { price inventoryQuantity sku }
          }
        }
        seo { title description }
        tags
      }
    }
  }
}
```

## MCP Server Pattern

```javascript
const ROLE_TOOLS = {
  owner:       ['get_revenue_dashboard', 'get_top_products', 'get_customer_growth', 'get_inventory_value'],
  merchandiser:['list_products', 'update_product', 'manage_collection', 'get_seo_audit', 'auto_tag_products'],
  content:     ['get_product', 'update_product_description', 'generate_alt_text', 'update_seo_metadata'],
  support:     ['search_orders', 'get_order_status', 'search_customers', 'draft_response', 'create_return'],
  marketing:   ['get_sales_report', 'get_customer_segments', 'generate_campaign_copy', 'get_channel_performance'],
  operations:  ['list_unfulfilled_orders', 'get_inventory_levels', 'create_fulfillment', 'flag_fraud_risk'],
};
```

## Webhooks

| Webhook | Use Case |
|---------|----------|
| `orders/create` | Alert operations, update dashboards |
| `orders/fulfilled` | Notify customer service, update tracking |
| `products/update` | Trigger SEO re-audit |
| `inventory_levels/update` | Check reorder points |
| `customers/create` | Welcome sequence, segment assignment |
| `refunds/create` | Alert customer service, flag patterns |

## Rate Limits

| Plan | REST | GraphQL |
|------|------|---------|
| Standard | 2 req/sec | 50 points/sec |
| Advanced/Plus | 4 req/sec | 100 points/sec |
| Shopify Plus | 20 req/sec | 1000 points/sec |

## Common Gotchas

- **API versioning**: Always specify version (e.g., `2024-10`). Deprecated versions return errors
- **Pagination**: REST uses Link headers; GraphQL uses cursor-based `edges/node`
- **GraphQL is cost-based**: Complex queries cost more points. Check `extensions.cost` in responses
- **Metafields**: Use GraphQL — REST support is limited
- **Bulk operations**: For >250 items, use GraphQL bulk operations
- **Currency**: Amounts are strings in REST; use `MoneyV2` in GraphQL

## See Also

- [API queries](references/queries.md)
- [Role patterns](references/roles.md)
- [AI integration](references/ai-integration.md)
