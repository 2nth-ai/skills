---
name: tech/cisco/collaboration
description: Cisco collaboration — Webex cloud, CUCM on-prem telephony, Unity Connection voicemail, UCCX contact centre.
requires:
  - tech/cisco
improves:
  - tech/cisco
metadata:
  author: 2nth.ai
  version: "1.0.0"
  maturity: stub
---

# Cisco Collaboration

> **Stub** — full skill pending. Core patterns documented below.

## Platform landscape

| Product | Deployment | Use case |
|---------|-----------|---------|
| **Webex** | Cloud (Cisco-hosted) | Meetings, messaging, calling, contact centre as-a-service |
| **CUCM** | On-prem or private cloud | Enterprise IP telephony, SIP trunking, dial plan |
| **Unity Connection** | On-prem | Voicemail, auto-attendant, speech recognition |
| **UCCX** | On-prem | Contact centre, IVR, ACD, agent desktop |
| **Expressway** | On-prem edge | Business-to-business SIP federation, MRA (Mobile and Remote Access) |

## Webex API (cloud)

```bash
# List Webex rooms (spaces)
curl -H "Authorization: Bearer $WEBEX_TOKEN" \
  https://webexapis.com/v1/rooms

# Send a message
curl -X POST \
  -H "Authorization: Bearer $WEBEX_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"roomId":"...", "text":"Hello from API"}' \
  https://webexapis.com/v1/messages
```

## CUCM dial plan essentials

```
Route Pattern: 9.XXXXXXXXXX  → PSTN SIP trunk (10-digit with access code)
Translation Pattern: strip leading 9 before sending to carrier
Partition + CSS: used for call routing policy (who can call what)
```

## Gotchas

- Webex and CUCM are separate products — Webex Calling replaces CUCM for greenfield; CUCM persists in regulated environments requiring on-prem call control
- CUCM licensing moved to subscription (CUWL/UCL) — perpetual licences still active but no new purchases
- MRA via Expressway is the supported path for remote workers on CUCM; do not open CUCM directly to internet
- UCCX is limited to 400 agents; Unified CCE (UCCE) or Webex Contact Centre for larger deployments
