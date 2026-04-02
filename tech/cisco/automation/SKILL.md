---
name: tech/cisco/automation
description: Cisco network automation — Netmiko/NAPALM Python, Ansible, DNA Center REST API, NSO, YANG/NETCONF/RESTCONF.
requires:
  - tech/cisco
improves:
  - tech/cisco
metadata:
  author: 2nth.ai
  version: "1.0.0"
  maturity: stub
---

# Cisco Network Automation

> **Stub** — full skill pending. Core patterns documented below.

## Toolchain

| Tool | Abstraction level | Best for |
|------|-----------------|---------|
| **Netmiko** | SSH screen-scraping | Quick config push/pull, legacy IOS |
| **NAPALM** | Multi-vendor abstraction | Getter-based read (facts, interfaces, routes) |
| **Ansible** (cisco.ios collection) | Playbook/idempotent | Config management, compliance checks |
| **DNA Center REST API** | Intent-based | Inventory, templates, assurance on Catalyst 9K |
| **NSO** | Service abstraction | Multi-vendor service orchestration at scale |
| **NETCONF/RESTCONF** | YANG model | Structured config on IOS-XE 16.6+, NX-OS 9.3+ |

## Netmiko (Python)

```python
from netmiko import ConnectHandler

device = {
    "device_type": "cisco_ios",
    "host": "192.168.1.1",
    "username": "admin",
    "password": "secret",
}

with ConnectHandler(**device) as net_connect:
    output = net_connect.send_command("show ip interface brief")
    print(output)

    # Push config
    config_commands = [
        "interface GigabitEthernet0/1",
        "description UPLINK",
        "no shutdown",
    ]
    net_connect.send_config_set(config_commands)
```

## NAPALM getters

```python
from napalm import get_network_driver

driver = get_network_driver("ios")
device = driver("192.168.1.1", "admin", "secret")
device.open()

facts = device.get_facts()           # hostname, model, serial, uptime
interfaces = device.get_interfaces() # speed, mtu, description
routes = device.get_route_to("0.0.0.0/0")

device.close()
```

## Ansible (cisco.ios collection)

```yaml
# inventory.yml
all:
  hosts:
    sw01:
      ansible_host: 192.168.1.1
      ansible_network_os: cisco.ios.ios
      ansible_user: admin
      ansible_password: "{{ vault_password }}"
      ansible_connection: network_cli

# playbook — gather facts
- name: Collect IOS facts
  hosts: all
  gather_facts: false
  tasks:
    - name: Get facts
      cisco.ios.ios_facts:
        gather_subset: all

    - name: Set interface description
      cisco.ios.ios_interfaces:
        config:
          - name: GigabitEthernet0/1
            description: "UPLINK-TO-CORE"
        state: merged
```

## DNA Center — device inventory via REST

```python
import requests

# Authenticate
auth = requests.post(
    "https://dnac.example.com/dna/system/api/v1/auth/token",
    auth=("admin", "password"),
    verify=False
)
token = auth.json()["Token"]

# List devices
devices = requests.get(
    "https://dnac.example.com/dna/intent/api/v1/network-device",
    headers={"X-Auth-Token": token},
    verify=False
)
for d in devices.json()["response"]:
    print(d["hostname"], d["managementIpAddress"], d["softwareVersion"])
```

## Gotchas

- Netmiko screen-scraping breaks on IOS version changes that alter `show` output format — prefer RESTCONF/NETCONF for structured data
- DNA Center API rate limits apply — use pagination (`offset` + `limit`) for large inventories
- Ansible `network_cli` connection uses SSH + privilege escalation (`enable`) — ensure `ansible_become` and `ansible_become_password` are set
- NSO has significant learning curve; only justified at 50+ devices or complex multi-vendor service chains
- NETCONF requires `netconf-yang` enabled on device: `netconf-yang` global config command (IOS-XE)
