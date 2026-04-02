---
name: tech/cisco
description: |
  Cisco platform skills. Use skills in this domain when working with:
  (1) network infrastructure — IOS/IOS-XE/NX-OS switches and routers, VLANs, spanning tree, routing protocols (OSPF, EIGRP, BGP),
  (2) network security — ASA/Firepower firewalls, Umbrella DNS security, ISE identity, AnyConnect VPN,
  (3) wireless — Catalyst/Meraki Wi-Fi, WLC, access points, RF design,
  (4) collaboration — Webex, CUCM, Unity Connection, UCCX,
  (5) network automation — Netmiko, NAPALM, Ansible, Cisco DNA Center, NSO, YANG/NETCONF/RESTCONF.
license: MIT
homepage: https://skills.2nth.ai/tech/cisco
repository: https://github.com/2nth-ai/skills
improves:
  - tech
metadata:
  author: 2nth.ai
  version: "1.0.0"
  maturity: stub
  categories: "Cisco, IOS, NX-OS, networking, switching, routing, OSPF, BGP, firewall, ASA, Firepower, Meraki, Webex, CUCM, Netmiko, DNA Center, automation"
---

# Cisco

Cisco is the dominant network infrastructure vendor in enterprise and service provider environments. In the 2nth.ai stack, Cisco skills are used when designing, configuring, securing, or automating the physical and virtual network layers that underpin cloud-connected and hybrid deployments.

The pattern is: **Cloudflare/AWS at the application layer → Cisco for the on-premise and hybrid network substrate**.

## Sub-skills

| Path | Focus | Status |
|------|-------|--------|
| `tech/cisco/networking` | IOS/IOS-XE/NX-OS, VLANs, STP, OSPF, EIGRP, BGP, QoS | stub |
| `tech/cisco/security` | ASA, Firepower NGFW, Umbrella, ISE, AnyConnect VPN | stub |
| `tech/cisco/wireless` | Catalyst/Meraki Wi-Fi, WLC, access points, RF design | stub |
| `tech/cisco/collaboration` | Webex, CUCM, Unity Connection, UCCX contact centre | stub |
| `tech/cisco/automation` | Netmiko, NAPALM, Ansible, DNA Center, NSO, NETCONF/RESTCONF | stub |

## Certification ladder (context for skill depth)

| Level | Cert | Scope |
|-------|------|-------|
| Associate | CCNA | Routing/switching fundamentals, security basics, automation intro |
| Professional | CCNP Enterprise / Security / Collaboration | Specialist tracks |
| Expert | CCIE | Lab-level depth per track |
| Specialist | DevNet Associate / Professional | Automation, APIs, programmability |

## Common CLI entry points

```bash
# Connect to device (SSH)
ssh admin@192.168.1.1

# Show running config
show running-config

# Show interface status
show interfaces status

# Show routing table
show ip route

# Show CDP neighbours (topology discovery)
show cdp neighbors detail
```

## SA context

Cisco has a significant presence in South African enterprise and banking. Major local integrators include Dimension Data (NTT), T-Systems, BCX, and Liquid Intelligent Technologies. ECNS/ECS licensed operators use Cisco SP gear. African bank networks (the primary 2nth.ai vertical) typically run Cisco switching/routing with Palo Alto or Fortinet firewalls at the perimeter.

## See also

- `tech/cloudflare` — edge network layer above Cisco infrastructure
- `tech/aws/networking` — VPC and cloud networking that Cisco on-prem connects into
- `tech/aws/security` — cloud security posture that mirrors on-prem Cisco security controls
