---
name: tech/google/cloud/networking
description: |
  GCP networking skill (stub). Use when: (1) designing VPC networks — subnets, routes, firewalls, VPC peering,
  (2) fronting services with Cloud Load Balancing — global HTTPS, regional, internal,
  (3) caching static assets at the edge with Cloud CDN,
  (4) managing DNS zones with Cloud DNS (public + private),
  (5) connecting private services from Cloud Run with Serverless VPC Access or Direct VPC Egress,
  (6) egress via Cloud NAT for no-public-IP workloads.
license: MIT
compatibility: VPC, Cloud LB (global + regional), Cloud CDN, Cloud DNS, Cloud NAT
homepage: https://skills.2nth.ai/tech/google/cloud/networking
repository: https://github.com/2nth-ai/skills
requires:
  - tech/google/cloud
improves:
  - tech/google/cloud
  - tech/google
  - tech
metadata:
  author: 2nth.ai
  version: "0.1.0"
  categories: "GCP, VPC, Cloud Load Balancing, Cloud CDN, Cloud DNS, Cloud NAT, Networking"
allowed-tools: Bash(gcloud:*) Read Write Edit Glob Grep
---

# GCP Networking (stub)

> **Status**: stub. Production depth pending.

## In scope

| Area | Services |
|------|----------|
| VPC | networks, subnets, firewalls, routes, peering, Shared VPC |
| Load balancing | Global External HTTPS, Regional HTTPS, Internal HTTP(S), Network LB |
| CDN | Cloud CDN (origin = LB backend), Media CDN |
| DNS | Cloud DNS public + private zones, DNSSEC |
| Connectivity | Cloud VPN, Cloud Interconnect, Cross-Cloud Interconnect |
| Egress / private | Cloud NAT, Private Google Access, Private Service Connect |
| Serverless networking | Serverless VPC Access, Direct VPC Egress (Cloud Run) |

## Quick start — VPC + subnet + firewall

```bash
# Custom-mode VPC (recommended over auto-mode)
gcloud compute networks create my-vpc \
  --subnet-mode custom --bgp-routing-mode regional

gcloud compute networks subnets create my-subnet \
  --network my-vpc --region africa-south1 --range 10.10.0.0/20 \
  --enable-private-ip-google-access

# Firewall — allow internal; deny everything else (default-deny is implicit)
gcloud compute firewall-rules create allow-internal \
  --network my-vpc --direction INGRESS --action ALLOW \
  --source-ranges 10.10.0.0/20 --rules tcp,udp,icmp

gcloud compute firewall-rules create allow-lb-health \
  --network my-vpc --direction INGRESS --action ALLOW \
  --source-ranges 130.211.0.0/22,35.191.0.0/16 --rules tcp
```

## Cloud Run → private service (Direct VPC Egress)

```bash
# Direct VPC Egress — newer, no intermediate connector VMs, cheaper than Serverless VPC Access
gcloud run services update my-service --region africa-south1 \
  --network my-vpc --subnet my-subnet \
  --vpc-egress private-ranges-only
# Now Cloud Run can reach 10.10.0.0/20 (your Cloud SQL private IP, internal LB, etc.)
```

## Global HTTPS Load Balancer pattern

```
User → Google global anycast → HTTPS LB (Cloud CDN, Cloud Armor) → Cloud Run / GKE / GCE backend
```

Global LB is the usual choice for public services — anycast for low latency, integrated CDN + Armor, one IP for the world.

## Gotchas (high-level)

- Default VPC is auto-mode and exists in every project. Delete it and use custom-mode in production.
- `africa-south1` LB backends are fine but some LB features (Cloud CDN custom origins, Advanced Traffic Management) lag.
- Serverless VPC Access (connectors) is legacy; prefer Direct VPC Egress for Cloud Run if your region supports it.
- Cloud NAT is per-region and per-VPC. One NAT can handle many subnets but egress billing is per-GB.
- Internal LBs don't support Cloud CDN or Cloud Armor. Those are external-LB only.

## See Also

- [GCP parent](../SKILL.md)
- [Compute: Cloud Run Direct VPC Egress](../compute/SKILL.md)
- [AWS networking sibling](../../../aws/networking/SKILL.md)
- [Cloudflare edge (global LB alternative)](../../../cloudflare/SKILL.md)
