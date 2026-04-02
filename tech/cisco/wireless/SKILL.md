---
name: tech/cisco/wireless
description: Cisco wireless — Catalyst Wi-Fi (WLC), Meraki cloud-managed, access point deployment, RF design.
requires:
  - tech/cisco
improves:
  - tech/cisco
metadata:
  author: 2nth.ai
  version: "1.0.0"
  maturity: stub
---

# Cisco Wireless

> **Stub** — full skill pending. Core patterns documented below.

## Platform choice

| Platform | Management | Best for |
|----------|-----------|---------|
| **Catalyst 9800 WLC** | On-prem or cloud (C9800-CL) | Enterprise, high density, full IOS-XE feature set |
| **Meraki MR** | Meraki Dashboard (cloud) | Distributed sites, quick deploy, SD-WAN integration |
| **Embedded WLC (EWC)** | AP acts as controller | Small branch, <100 APs |

## SSID config (Catalyst 9800)

```ios
! WLAN profile
wlan CORP_WIFI 1 CORP_WIFI
 security wpa psk set-key ascii 0 MyPassphrase
 security wpa akm psk
 no shutdown

! Policy profile (maps to VLAN)
wireless profile policy CORP_POLICY
 vlan 20
 no shutdown

! Tag binding
wireless tag policy CORP_TAG
 wlan CORP_WIFI policy CORP_POLICY
```

## RF design principles

- **2.4 GHz**: 3 non-overlapping channels (1, 6, 11); use for IoT/legacy only
- **5 GHz**: 20+ non-overlapping channels (UNII-1/2/3); primary for data
- **6 GHz (Wi-Fi 6E)**: Catalyst 9136/9166; clean band, 1200 MHz spectrum
- Cell sizing: -67 dBm minimum RSSI for voice; -72 dBm for data
- AP density: 1 AP per 25-30 users in high-density (boardrooms, trading floors)

## Gotchas

- Meraki requires cloud connectivity to function — local breakout fails if Meraki cloud unreachable
- 9800 WLC high availability requires SSO config; active/standby pair shares single IP
- 802.11r (fast BSS transition) must be enabled for seamless roaming with voice/video
- DFS channels (5 GHz) trigger radar detection and AP channel change — avoid for latency-sensitive deployments
