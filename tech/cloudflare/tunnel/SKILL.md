---
name: tech/cloudflare/tunnel
description: |
  Cloudflare Tunnel — secure outbound connector from on-premise to Cloudflare edge. Use this skill when:
  (1) connecting 2nth Workers to a client's on-premise ERP, CRM, or database without opening firewall ports,
  (2) exposing a local development environment for preview or client demo access,
  (3) building a private service mesh where Workers call internal services via named hostnames.
  Free — cloudflared daemon runs on the client's machine or server.
license: MIT
compatibility: Cloudflare Tunnel (cloudflared), any OS
homepage: https://skills.2nth.ai/tech/cloudflare/tunnel
repository: https://github.com/2nth-ai/skills
requires:
  - tech/cloudflare/workers
improves:
  - tech/cloudflare
metadata:
  author: 2nth.ai
  version: "0.1.0"
  status: stub
  categories: "Cloudflare, Tunnel, cloudflared, Private Network, On-premise"
---

# Cloudflare Tunnel

Tunnel creates a secure outbound-only connection from any server or machine to Cloudflare's edge. The `cloudflared` daemon initiates the connection — no inbound firewall rules needed.

**Free** — the `cloudflared` binary is open source.

## Install cloudflared

```bash
# macOS
brew install cloudflare/cloudflare/cloudflared

# Linux (Debian/Ubuntu)
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb
```

## Create a tunnel (run once per server)

```bash
cloudflared tunnel login          # opens browser, authorises your CF account
cloudflared tunnel create my-tunnel
# → prints tunnel ID (UUID)

# Create a config file at ~/.cloudflared/config.yml
```

## config.yml

```yaml
tunnel: <TUNNEL-UUID>
credentials-file: /root/.cloudflared/<TUNNEL-UUID>.json

ingress:
  # Expose an on-premise ERP on a private hostname
  - hostname: erp-client.internal.2nth.ai
    service: http://localhost:8069

  # Expose a local Postgres via TCP (for Hyperdrive)
  - hostname: db-client.internal.2nth.ai
    service: tcp://localhost:5432

  # Catch-all — must be last
  - service: http_status:404
```

## Run the tunnel

```bash
# One-off (dev)
cloudflared tunnel run my-tunnel

# As a system service (production)
cloudflared service install
systemctl start cloudflared
```

## Calling the tunnelled service from a Worker

Once the tunnel is running and the hostname is proxied through Cloudflare:

```typescript
// Worker calling a client's on-premise ERP
const response = await fetch('https://erp-client.internal.2nth.ai/api/method/frappe.client.get', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `token ${env.ERP_API_KEY}`,
  },
  body: JSON.stringify({ doctype: 'Sales Order', name: 'SO-001' }),
});
```

## 2nth Usage Pattern — Client SOR Access

For clients with on-premise ERP (Frappe/ERPNext, Sage X3 on Windows), the deployment pattern is:

1. Install `cloudflared` on the client's ERP server
2. Create a tunnel pointing to the ERP HTTP/HTTPS port
3. Assign a private hostname under the client's Cloudflare zone
4. Workers call the private hostname — traffic never leaves Cloudflare's network

This avoids VPN setup and doesn't require the client to open firewall ports.

## Common Gotchas

- **Tunnel must be running**: If `cloudflared` stops, the Worker requests will 502. Set it up as a system service.
- **Private hostnames need Cloudflare Access (optional but recommended)**: Wrap the tunnelled service with Cloudflare Access policies to prevent unauthenticated access.
- **TCP services need `--proto tcp`**: HTTP/HTTPS works automatically; TCP (Postgres, SMTP) requires explicit configuration.
- **DNS propagation**: New tunnel hostnames may take a few minutes to resolve globally.

## See Also

- [Workers runtime (makes requests through the tunnel)](../workers/SKILL.md)
- [Hyperdrive (pool Postgres connections via tunnel)](../hyperdrive/SKILL.md)
