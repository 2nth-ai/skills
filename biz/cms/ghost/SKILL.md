---
name: biz/cms/ghost
description: |
  Ghost CMS setup and management expert. Use this skill when:
  (1) installing, configuring, or upgrading Ghost — self-hosted (Docker, Ubuntu, custom) or Ghost(Pro),
  (2) managing content via the Ghost Admin API — posts, pages, tags, authors, newsletters,
  (3) reading published content via the Ghost Content API — public feeds, headless front-ends,
  (4) building or customising Ghost themes — Handlebars templates, theme structure, Ghost helpers,
  (5) configuring memberships, tiers, subscriptions, and Stripe integration,
  (6) managing newsletters, email sending (Mailgun), and subscriber segments,
  (7) migrating content to or from Ghost — JSON import/export, WordPress migration,
  (8) integrating Ghost with external systems — webhooks, Zapier, custom integrations.
license: MIT
compatibility: Node.js 18+, Docker, Ubuntu 22.04+, any HTTP client
repository: https://github.com/2nth-ai/skills
requires:
  - tech/cloudflare
improves:
  - biz/cms
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "CMS, Ghost, Blog, Newsletter, Memberships, Headless CMS"
allowed-tools: Bash(curl:*) Bash(ghost:*) Bash(docker*) Bash(npm:*) Bash(npx:*) Read Write Edit Glob Grep
---

# Ghost CMS

Ghost is an open-source, professional publishing platform built on Node.js. It handles websites, blogs, newsletters, and paid memberships in a single platform. Ghost exposes two APIs — **Admin** (read/write, JWT-authenticated) and **Content** (read-only, key-authenticated) — making it ideal as a headless CMS or traditional publishing tool.

Docs: https://ghost.org/docs/

## Installation

### Self-Hosted (Ubuntu — recommended for production)

```bash
# Prerequisites
sudo apt update && sudo apt install -y nginx mysql-server nodejs npm
sudo npm install -g ghost-cli@latest

# Install Ghost
sudo mkdir -p /var/www/ghost && cd /var/www/ghost
sudo chown $(whoami):$(whoami) /var/www/ghost
ghost install
```

The `ghost install` wizard prompts for:
- Blog URL (must match your domain exactly, including protocol)
- MySQL credentials
- Nginx setup (auto-configures reverse proxy)
- SSL via Let's Encrypt
- Systemd service setup

### Docker (development or isolated deploys)

```yaml
# docker-compose.yml
version: "3.8"
services:
  ghost:
    image: ghost:5-alpine
    restart: always
    ports:
      - "2368:2368"
    environment:
      url: https://example.com
      database__client: mysql
      database__connection__host: db
      database__connection__user: ghost
      database__connection__password: ${GHOST_DB_PASSWORD}
      database__connection__database: ghost
      mail__transport: SMTP
      mail__options__host: smtp.mailgun.org
      mail__options__port: 587
      mail__options__auth__user: ${MAILGUN_SMTP_USER}
      mail__options__auth__pass: ${MAILGUN_SMTP_PASS}
    volumes:
      - ghost-content:/var/lib/ghost/content
    depends_on:
      - db

  db:
    image: mysql:8.0
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_USER: ghost
      MYSQL_PASSWORD: ${GHOST_DB_PASSWORD}
      MYSQL_DATABASE: ghost
    volumes:
      - ghost-db:/var/lib/mysql

volumes:
  ghost-content:
  ghost-db:
```

### Ghost CLI Commands

```bash
ghost start              # Start Ghost
ghost stop               # Stop Ghost
ghost restart            # Restart Ghost
ghost update             # Update to latest version
ghost log                # View logs (add --follow for tail)
ghost config             # View/edit config
ghost config url https://newdomain.com  # Change site URL
ghost doctor             # Diagnose issues
ghost backup             # Create backup (content + DB)
```

## Authentication

### Admin API (JWT)

Ghost Admin API uses short-lived JWT tokens generated from an Admin API key. The key format is `id:secret` (hex-encoded).

```javascript
const jwt = require('jsonwebtoken');

// Admin API key from Ghost Admin → Integrations → Custom
const key = process.env.GHOST_ADMIN_API_KEY; // format: "id:secret"
const [id, secret] = key.split(':');

const token = jwt.sign({}, Buffer.from(secret, 'hex'), {
  keyid: id,
  algorithm: 'HS256',
  expiresIn: '5m',
  audience: '/admin/'
});

// Use in requests
// Authorization: Ghost ${token}
```

### Content API (key)

```
GET https://example.com/ghost/api/content/posts/?key=YOUR_CONTENT_API_KEY
```

Content API keys are passed as a `key` query parameter. No JWT required.

### Creating API Keys

Ghost Admin → Settings → Integrations → Add custom integration. This generates both an Admin API key and a Content API key.

**Never hardcode credentials.** Use environment variables: `GHOST_ADMIN_API_KEY`, `GHOST_CONTENT_API_KEY`, `GHOST_API_URL`.

## Admin API

Base URL: `https://<site>/ghost/api/admin/`

### Posts

```bash
# List posts
curl -s "https://example.com/ghost/api/admin/posts/" \
  -H "Authorization: Ghost ${TOKEN}"

# Get single post (include author + tags)
curl -s "https://example.com/ghost/api/admin/posts/${POST_ID}/?include=authors,tags" \
  -H "Authorization: Ghost ${TOKEN}"

# Create post
curl -s -X POST "https://example.com/ghost/api/admin/posts/" \
  -H "Authorization: Ghost ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"posts": [{"title": "My Post", "html": "<p>Content here</p>", "status": "draft"}]}'

# Update post (requires updated_at for collision detection)
curl -s -X PUT "https://example.com/ghost/api/admin/posts/${POST_ID}/" \
  -H "Authorization: Ghost ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"posts": [{"title": "Updated Title", "updated_at": "2026-01-01T00:00:00.000Z"}]}'

# Delete post
curl -s -X DELETE "https://example.com/ghost/api/admin/posts/${POST_ID}/" \
  -H "Authorization: Ghost ${TOKEN}"
```

### Pages

Same endpoints as posts but at `/ghost/api/admin/pages/`.

### Tags

```bash
# Create tag
curl -s -X POST "https://example.com/ghost/api/admin/tags/" \
  -H "Authorization: Ghost ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"tags": [{"name": "Technology", "slug": "technology", "description": "Tech articles"}]}'
```

### Members

```bash
# List members
curl -s "https://example.com/ghost/api/admin/members/?filter=status:paid" \
  -H "Authorization: Ghost ${TOKEN}"

# Create member
curl -s -X POST "https://example.com/ghost/api/admin/members/" \
  -H "Authorization: Ghost ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"members": [{"email": "reader@example.com", "name": "Reader Name", "labels": [{"name": "VIP"}]}]}'
```

### Images

```bash
# Upload image
curl -s -X POST "https://example.com/ghost/api/admin/images/upload/" \
  -H "Authorization: Ghost ${TOKEN}" \
  -F "file=@/path/to/image.jpg" \
  -F "purpose=image"
```

### Newsletters

```bash
# List newsletters
curl -s "https://example.com/ghost/api/admin/newsletters/" \
  -H "Authorization: Ghost ${TOKEN}"

# Create newsletter
curl -s -X POST "https://example.com/ghost/api/admin/newsletters/" \
  -H "Authorization: Ghost ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"newsletters": [{"name": "Weekly Digest", "sender_name": "Blog Team", "sender_email": "hello@example.com"}]}'
```

## Content API

Base URL: `https://<site>/ghost/api/content/`

Read-only API for public content. Use for headless front-ends, static site generators, or content syndication.

```bash
# List published posts
curl -s "https://example.com/ghost/api/content/posts/?key=${CONTENT_KEY}&include=tags,authors&limit=10"

# Filter posts by tag
curl -s "https://example.com/ghost/api/content/posts/?key=${CONTENT_KEY}&filter=tag:technology"

# Get post by slug
curl -s "https://example.com/ghost/api/content/posts/slug/my-post-slug/?key=${CONTENT_KEY}"

# List tags
curl -s "https://example.com/ghost/api/content/tags/?key=${CONTENT_KEY}&include=count.posts"

# List authors
curl -s "https://example.com/ghost/api/content/authors/?key=${CONTENT_KEY}&include=count.posts"

# Pagination
curl -s "https://example.com/ghost/api/content/posts/?key=${CONTENT_KEY}&page=2&limit=15"
```

### Filtering

Ghost uses NQL (Nested Query Language) for filtering:

| Filter | Example |
|--------|---------|
| Exact match | `filter=tag:news` |
| Multiple values | `filter=tag:[news,tech]` |
| Negation | `filter=tag:-draft` |
| Combined | `filter=tag:news+featured:true` |
| OR | `filter=tag:news,tag:tech` |
| Date range | `filter=published_at:>'2026-01-01'` |
| Null check | `filter=feature_image:-null` |

## Themes

Ghost themes use Handlebars templates. Theme directory structure:

```
my-theme/
├── package.json           # Theme metadata (name, version, config)
├── index.hbs              # Home page / post listing
├── post.hbs               # Single post
├── page.hbs               # Static page
├── tag.hbs                # Tag archive
├── author.hbs             # Author archive
├── default.hbs            # Base layout wrapper
├── error.hbs              # Error page
├── custom-page.hbs        # Custom template (selectable in editor)
├── partials/
│   ├── header.hbs
│   ├── footer.hbs
│   └── post-card.hbs
└── assets/
    ├── css/
    ├── js/
    └── images/
```

### Key Handlebars Helpers

```handlebars
{{!-- Post loop --}}
{{#foreach posts}}
  <h2><a href="{{url}}">{{title}}</a></h2>
  <p>{{excerpt words="30"}}</p>
  {{#if feature_image}}
    <img src="{{feature_image}}" alt="{{title}}">
  {{/if}}
  <span>{{date published_at format="DD MMM YYYY"}}</span>
  <span>{{reading_time}}</span>
{{/foreach}}

{{!-- Navigation --}}
{{navigation}}

{{!-- Pagination --}}
{{pagination}}

{{!-- Content output --}}
{{content}}

{{!-- Conditional visibility --}}
{{#has tag="premium"}}
  {{!-- Paid content --}}
{{/has}}

{{!-- Member-aware content --}}
{{#if @member}}
  <p>Welcome back, {{@member.name}}</p>
{{else}}
  <p>Subscribe to read more</p>
{{/if}}
```

### Theme Development

```bash
# Install gscan for theme validation
npm install -g gscan

# Validate theme
gscan /path/to/theme

# Upload theme via API
curl -s -X POST "https://example.com/ghost/api/admin/themes/upload/" \
  -H "Authorization: Ghost ${TOKEN}" \
  -F "file=@theme.zip"

# Activate theme
curl -s -X PUT "https://example.com/ghost/api/admin/themes/${THEME_NAME}/activate/" \
  -H "Authorization: Ghost ${TOKEN}"
```

## Memberships & Subscriptions

Ghost has built-in membership and subscription support with Stripe integration.

### Stripe Setup

Ghost Admin → Settings → Membership → Stripe Connect. Use the "Connect with Stripe" button for OAuth flow, or manually set keys:

```bash
ghost config set stripe:secretKey sk_live_xxx
ghost config set stripe:publicKey pk_live_xxx
```

### Tiers

```bash
# Create tier
curl -s -X POST "https://example.com/ghost/api/admin/tiers/" \
  -H "Authorization: Ghost ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"tiers": [{"name": "Premium", "monthly_price": 900, "yearly_price": 9000, "currency": "usd", "description": "Full access to all content"}]}'
```

Prices are in cents (900 = $9.00).

### Post Visibility

- `public` — visible to everyone
- `members` — visible to free + paid members
- `paid` — visible to paid members only
- `tiers` — visible to specific tiers (set via `tiers` array on post)

## Email & Newsletters

Ghost sends newsletters via **Mailgun** (recommended) or other SMTP providers.

### Mailgun Configuration

```json
// config.production.json
{
  "mail": {
    "transport": "SMTP",
    "options": {
      "service": "Mailgun",
      "host": "smtp.mailgun.org",
      "port": 587,
      "secure": true,
      "auth": {
        "user": "postmaster@mg.example.com",
        "pass": "mailgun-smtp-password"
      }
    }
  },
  "bulk_email_settings": {
    "provider": "mailgun",
    "apiKey": "key-xxx",
    "domain": "mg.example.com",
    "baseUrl": "https://api.eu.mailgun.net/v3"
  }
}
```

Use `baseUrl: "https://api.eu.mailgun.net/v3"` for EU Mailgun accounts.

## Migration

### Import from WordPress

```bash
# Export WordPress to WXR XML, then use the Ghost migration tool
npm install -g @tryghost/migrate

# Convert WordPress export to Ghost JSON
migrate wp /path/to/wordpress-export.xml

# Import via Ghost Admin → Settings → Import
# Or via API:
curl -s -X POST "https://example.com/ghost/api/admin/db/" \
  -H "Authorization: Ghost ${TOKEN}" \
  -F "importfile=@ghost-import.json"
```

### Export Ghost Content

```bash
# Full JSON export
curl -s "https://example.com/ghost/api/admin/db/" \
  -H "Authorization: Ghost ${TOKEN}" \
  -o ghost-export.json
```

## Webhooks

```bash
# Create webhook
curl -s -X POST "https://example.com/ghost/api/admin/webhooks/" \
  -H "Authorization: Ghost ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"webhooks": [{"event": "post.published", "target_url": "https://hooks.example.com/ghost", "integration_id": "INTEGRATION_ID"}]}'
```

Available events: `post.published`, `post.unpublished`, `post.deleted`, `page.published`, `member.added`, `member.deleted`, `tag.added`.

## Cloudflare Integration

Ghost works well behind Cloudflare for CDN, SSL, and caching:

- **Cache**: Set page rules to cache everything except `/ghost/*` (admin) and `/members/*` (auth). Purge cache on `post.published` webhook.
- **SSL**: Use Full (strict) mode. Ghost handles HTTPS via Let's Encrypt; Cloudflare provides edge SSL.
- **Workers**: Use Cloudflare Workers to add dynamic edge logic — A/B testing, geo-redirects, or content transformation before serving Ghost pages.
- **DNS**: Point your domain to the Ghost server via Cloudflare DNS (proxied).

## Configuration Reference

Ghost config lives in `config.production.json` (production) or `config.development.json` (dev):

```json
{
  "url": "https://example.com",
  "server": {
    "port": 2368,
    "host": "127.0.0.1"
  },
  "database": {
    "client": "mysql",
    "connection": {
      "host": "localhost",
      "user": "ghost",
      "password": "password",
      "database": "ghost_prod"
    }
  },
  "logging": {
    "level": "info",
    "transports": ["stdout"]
  },
  "paths": {
    "contentPath": "/var/lib/ghost/content"
  }
}
```

## Common Gotchas

- **`updated_at` is required for PUT requests.** Ghost uses optimistic locking — you must send the current `updated_at` value or the update will fail with a 409 Conflict. Always GET before PUT.
- **Admin API JWT tokens expire after 5 minutes.** Generate a fresh token per request or batch of requests. Do not cache tokens long-term.
- **Content API returns only published content.** Draft, scheduled, and sent posts are only accessible via the Admin API.
- **`url` config must match exactly.** If Ghost is configured with `https://example.com` but accessed via `http://example.com` or `https://www.example.com`, redirects and links will break. Set this correctly at install time.
- **MySQL 8 authentication.** Ghost requires `mysql_native_password` auth plugin, not `caching_sha2_password` (MySQL 8 default). Set `ALTER USER 'ghost'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';`.
- **Image storage is local by default.** Ghost stores images in `/content/images/`. For scalability, configure an S3-compatible storage adapter or use Cloudflare R2.
- **Newsletter sending requires Mailgun for bulk.** SMTP works for transactional emails but Ghost's bulk email feature specifically needs the Mailgun API configured under `bulk_email_settings`, not just SMTP.
- **Theme uploads replace, not merge.** Uploading a theme with the same name overwrites the existing theme entirely. Keep themes in version control.

## See Also

- [Ghost API docs](https://ghost.org/docs/admin-api/)
- [Ghost Content API](https://ghost.org/docs/content-api/)
- [Ghost themes](https://ghost.org/docs/themes/)
- [Ghost hosting guide](https://ghost.org/docs/install/)
- [Cloudflare integration](../../../tech/cloudflare/SKILL.md)
