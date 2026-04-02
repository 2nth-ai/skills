---
name: tech/cisco/security
description: Cisco network security — ASA/Firepower NGFW, Umbrella DNS security, ISE identity/NAC, AnyConnect VPN.
requires:
  - tech/cisco
improves:
  - tech/cisco
metadata:
  author: 2nth.ai
  version: "1.0.0"
  maturity: stub
---

# Cisco Security

> **Stub** — full skill pending. Core patterns documented below.

## Products

| Product | Use case |
|---------|---------|
| **ASA** | Stateful firewall, AnyConnect VPN headend, legacy perimeter |
| **Firepower NGFW (FTD)** | Next-gen firewall, IPS, application visibility, Snort 3 |
| **FMC / FDM** | Firepower Management Center (centralised) or Device Manager (local) |
| **Umbrella** | DNS-layer security, cloud-delivered SASE, malware blocking |
| **ISE** | Identity/NAC, 802.1X, RADIUS, TrustSec SGT policy |
| **AnyConnect / Secure Client** | SSL/IPsec VPN, posture assessment, endpoint visibility |

## ASA ACL pattern

```ios
! Permit HTTPS inbound, deny all else
access-list OUTSIDE_IN extended permit tcp any host 196.x.x.10 eq 443
access-list OUTSIDE_IN extended deny ip any any log

access-group OUTSIDE_IN in interface outside
```

## AnyConnect VPN (ASA)

```ios
! IP pool for VPN clients
ip local pool VPN_POOL 10.100.0.1-10.100.0.254 mask 255.255.255.0

! Group policy
group-policy GP_REMOTE internal
group-policy GP_REMOTE attributes
 vpn-tunnel-protocol ssl-client
 split-tunnel-policy tunnelall

! Tunnel group
tunnel-group REMOTE_ACCESS type remote-access
tunnel-group REMOTE_ACCESS general-attributes
 address-pool VPN_POOL
 default-group-policy GP_REMOTE
```

## ISE 802.1X (basic)

```ios
! On the switch
aaa new-model
aaa authentication dot1x default group radius
aaa authorization network default group radius
dot1x system-auth-control

interface GigabitEthernet1/0/1
 authentication port-control auto
 dot1x pae authenticator
```

## Gotchas

- ASA and FTD (Firepower) have different CLIs — ASA uses `access-list`/`nat`, FTD uses FMC policy objects
- ISE requires a valid PKI chain for EAP-TLS; self-signed certs cause supplicant failures
- Umbrella DNS security requires either the Umbrella roaming client or DNS forwarder config — split-DNS environments need careful design
- AnyConnect split tunnelling vs tunnel-all has compliance implications — financial services typically requires tunnel-all
