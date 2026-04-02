---
name: tech/cisco/networking
description: Cisco switching and routing — IOS/IOS-XE/NX-OS, VLANs, STP, inter-VLAN routing, OSPF, EIGRP, BGP, QoS.
requires:
  - tech/cisco
improves:
  - tech/cisco
metadata:
  author: 2nth.ai
  version: "1.0.0"
  maturity: stub
---

# Cisco Networking

> **Stub** — full skill pending. Core patterns documented below.

## Platform coverage

| Platform | OS | Typical use |
|----------|----|------------|
| Catalyst 9000 series | IOS-XE | Enterprise access/distribution/core switching |
| Nexus 9000 series | NX-OS | Data centre switching, VXLAN fabric |
| ISR/ASR routers | IOS-XE | Branch/WAN routing, SD-WAN headend |
| CSR 1000v / Catalyst 8000v | IOS-XE | Virtual router (VM or cloud) |

## VLANs and trunking

```ios
! Create VLANs
vlan 10
 name SERVERS
vlan 20
 name CLIENTS
vlan 30
 name MANAGEMENT

! Access port
interface GigabitEthernet1/0/1
 switchport mode access
 switchport access vlan 10

! Trunk port (to upstream switch or router)
interface GigabitEthernet1/0/48
 switchport mode trunk
 switchport trunk allowed vlan 10,20,30
```

## Inter-VLAN routing (Layer 3 switch)

```ios
! Enable IP routing
ip routing

! SVI per VLAN
interface Vlan10
 ip address 10.10.10.1 255.255.255.0
 no shutdown

interface Vlan20
 ip address 10.10.20.1 255.255.255.0
 no shutdown
```

## OSPF (most common enterprise IGP)

```ios
router ospf 1
 router-id 1.1.1.1
 network 10.10.0.0 0.0.255.255 area 0
 passive-interface default
 no passive-interface GigabitEthernet0/0
```

## BGP (WAN / internet peering)

```ios
router bgp 65001
 bgp router-id 1.1.1.1
 neighbor 203.0.113.1 remote-as 65002
 neighbor 203.0.113.1 description ISP_PEER
 address-family ipv4 unicast
  neighbor 203.0.113.1 activate
  network 196.x.x.0 mask 255.255.255.0
```

## Spanning Tree (access layer)

```ios
! Enable Rapid PVST+ (default on Catalyst)
spanning-tree mode rapid-pvst

! Set root bridge for VLAN 10
spanning-tree vlan 10 priority 4096

! PortFast + BPDU Guard on access ports
interface GigabitEthernet1/0/1
 spanning-tree portfast
 spanning-tree bpduguard enable
```

## Gotchas

- NX-OS and IOS-XE CLI differ — `feature ospf` must be enabled on NX-OS before configuring OSPF
- Always set explicit OSPF router-id; auto-selection from loopback/interface is unreliable at scale
- `passive-interface default` + selectively enabling is safer than manually passiving each interface
- BGP does not auto-redistribute — explicit `network` statements or `redistribute` required
- STP topology changes cause 30-second outages on classic STP; Rapid PVST+ reduces this to ~1s
