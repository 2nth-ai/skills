---
name: biz/spatial-gallery
description: |
  Build spatial gallery solutions for shared-space operators — visual directories
  of physical spaces with verified occupancy, hierarchical addressing, and live
  availability. Inspired by FOAM.org's proof-of-location protocol, adapted for
  commercial real estate and shared-space operations. Use this skill when:
  (1) building a browsable gallery/directory of physical spaces (desks, rooms, floors, buildings),
  (2) implementing spatial addressing schemes for multi-site portfolios,
  (3) creating proof-of-presence systems using IoT sensors and access hardware,
  (4) building live availability feeds for coworking, student housing, or corporate campuses,
  (5) designing zone-based governance where commercial rules apply per spatial cluster,
  (6) integrating occupancy data from Salto, Kisi, Openpath, HID, or ButterflyMX hardware.
license: MIT
compatibility: Cloudflare Workers, Node.js, any runtime with HTTPS
homepage: https://skills.2nth.ai/biz/spatial-gallery
repository: https://github.com/2nth-ai/skills
requires:
  - biz/shared-space-ops
improves:
  - biz
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Shared Spaces, Gallery, Spatial, IoT, Proof of Presence, FOAM, Coworking, Property"
allowed-tools: Bash(curl:*) Read Write Edit Glob Grep
---

# Spatial Gallery

A generic gallery and spatial index solution for shared-space operators. Represents physical spaces as addressable, verifiable, browsable entities — inspired by [FOAM.org](https://foam.space)'s proof-of-location protocol, adapted for commercial shared-space operations.

Every shared-space operator needs to answer: *what spaces exist, where are they, are they available, and can I prove someone was there?* This skill provides the architecture patterns, data models, and integration approach to build that.

## Authentication

Gallery APIs use the same 2nth.ai platform authentication:

```bash
GALLERY_API_KEY=your_api_key       # 2nth.ai platform key
OPERATOR_ID=workshop17             # operator identifier in the spatial index
```

For IoT/access hardware integrations, store vendor credentials separately:

```bash
SALTO_CLIENT_ID=...
SALTO_CLIENT_SECRET=...
KISI_API_KEY=...
```

## Core concepts — FOAM to shared spaces

The FOAM protocol introduced a decentralised proof-of-location system using radio beacons, token-curated registries, and crypto-spatial coordinates. We adapt each concept for commercial space operations:

### Points of Interest → Spaces

In FOAM, POIs are locations on a map verified by token stakers. In a spatial gallery, **spaces** are the atomic unit — a desk, a meeting room, a floor, a building.

```json
{
  "uri": "pg://workshop17/cape-town/silo/floor-2/room-204",
  "type": "meeting_room",
  "name": "Room 204 — The Hyrax",
  "capacity": 8,
  "amenities": ["display", "whiteboard", "video_conf"],
  "coordinates": { "lat": -33.9078, "lng": 18.4178 },
  "floor": 2,
  "zone": "workshop17/cape-town/silo",
  "status": "available",
  "images": ["https://cdn.operator.com/rooms/204-hero.jpg"],
  "rates": {
    "hourly": { "amount": 350, "currency": "ZAR" },
    "daily": { "amount": 1800, "currency": "ZAR" }
  }
}
```

### Crypto-Spatial Coordinates → Space URIs

FOAM uses geohash-based coordinates tied to Ethereum addresses. We use a **hierarchical URI scheme** that uniquely addresses any space in the network:

```
pg://{operator}/{city}/{site}/{floor}/{space}
```

Examples:
```
pg://workshop17/cape-town/silo                    → site
pg://workshop17/cape-town/silo/floor-2            → floor
pg://workshop17/cape-town/silo/floor-2/room-204   → space
pg://workshop17/cape-town/silo/floor-2/desk-47    → desk
pg://kofisi/kigali/kn-1/ground/hot-desk-area      → zone within floor
```

Resolution rules:
- Shorter URIs resolve to aggregate views (all spaces on a floor, all floors in a site)
- Longer URIs resolve to specific spaces with live availability
- URIs are stable — renaming a room creates an alias, not a new URI

### Zones → Operator portfolios

In FOAM, zones are clusters of anchors that maintain consensus on time and space. In a spatial gallery, **zones** are governance boundaries — a cluster of spaces under one commercial policy.

```json
{
  "zone": "workshop17/cape-town",
  "governance": {
    "billing_rules": "standard-coworking-v2",
    "access_policy": "business-hours-plus-members",
    "currency": "ZAR",
    "tax_jurisdiction": "ZA-WC",
    "dispute_sla_hours": 48
  },
  "sites": [
    "workshop17/cape-town/silo",
    "workshop17/cape-town/kloof",
    "workshop17/cape-town/waterfront"
  ],
  "stats": {
    "total_spaces": 342,
    "occupancy_rate": 0.73,
    "available_now": 92
  }
}
```

### Zone Anchors → IoT sensors and access hardware

FOAM uses radio beacons with Byzantine fault-tolerant clock sync. We use **real-world signals** from access hardware and sensors:

| Signal source | What it proves | Hardware |
|---|---|---|
| Access event (badge tap) | Person entered/exited a space | Salto, Kisi, Openpath, HID |
| Occupancy sensor | Space is currently occupied | IR sensors, desk sensors |
| Booking confirmation | Space is reserved for a time slot | Booking system API |
| Wi-Fi probe | Device is in proximity | Wi-Fi AP logs |
| Camera count | Head count in a zone | Privacy-preserving people counters |

### Proof of Location → Proof of Presence

FOAM issues "Presence Claims" — cryptographic certificates proving an entity was at a location at a time. We issue **Presence Records**:

```json
{
  "id": "pres-a1b2c3d4",
  "space_uri": "pg://workshop17/cape-town/silo/floor-2/room-204",
  "participant_id": "tenant-9f8e7d",
  "entered_at": "2026-04-04T09:15:00+02:00",
  "exited_at": "2026-04-04T11:32:00+02:00",
  "duration_minutes": 137,
  "signals": [
    { "source": "salto", "event": "access_granted", "at": "2026-04-04T09:15:00+02:00" },
    { "source": "occupancy_sensor", "event": "occupied", "at": "2026-04-04T09:15:12+02:00" },
    { "source": "occupancy_sensor", "event": "vacant", "at": "2026-04-04T11:31:48+02:00" },
    { "source": "salto", "event": "access_granted", "at": "2026-04-04T11:32:00+02:00" }
  ],
  "confidence": 0.98,
  "hash": "sha256:e3b0c44298fc..."
}
```

Presence records are written to the **Event Ledger** (Proximity Green's immutable audit trail) and used for:
- Billing verification (prove the space was used before invoicing)
- Dispute resolution (tenant claims they weren't there — check the record)
- Occupancy analytics (real utilisation vs bookings)
- Compliance reporting (fire safety occupancy counts)

### Token Curated Registry → Verified Gallery

FOAM uses token staking to curate POI quality. We use **operator verification** and **data quality scoring**:

| Gallery tier | Requirements |
|---|---|
| Listed | Operator submits space data. Basic gallery card with photos and rates. |
| Verified | Access hardware connected. Live availability feed active. Presence records flowing. |
| Certified | 90-day track record. Occupancy data audited. Dispute rate below threshold. |

## Gallery API

The gallery exposes a read API for partners, aggregators, and listing sites:

```
GET /api/gallery/spaces?zone=workshop17/cape-town&type=meeting_room&available=now
GET /api/gallery/spaces/{uri}
GET /api/gallery/zones/{zone}
GET /api/gallery/availability?uri=pg://workshop17/cape-town/silo/floor-2&date=2026-04-05
```

Response follows the space schema above. Availability is real-time when hardware is connected, or booking-system-based when not.

## Gallery UI patterns

### Card grid (default view)

Each space renders as a card: hero image, name, type badge, capacity, rate, and a live availability indicator (green/amber/red dot).

### Map view

Spaces plotted on a map using coordinates from the space record. Cluster at zoom-out, individual pins at zoom-in. Filter by type, availability, amenities.

### Floor plan view

For operators with floor plan data, render spaces on a 2D plan with colour-coded occupancy status. Requires floor plan SVG with space IDs matching URIs.

## Common Gotchas

- **Don't poll hardware for availability.** Use webhooks from access systems (Salto webhooks, Kisi events). Polling creates stale data and hits rate limits.
- **Space URIs must be stable.** Renaming a room should create an alias, not break existing presence records and booking links. The URI is the primary key.
- **Occupancy sensors lie.** A single IR sensor can miss people or double-count. Use multiple signal sources (access + sensor + booking) and a confidence score, not a binary occupied/vacant.
- **Gallery images go stale.** Require operators to refresh photos annually. Flag spaces with images older than 12 months in the gallery admin.
- **Time zones matter for availability.** Always store and serve availability in the space's local timezone with explicit UTC offset. A Cape Town room and a Kigali room have different business hours.
- **Don't expose tenant identity in presence records.** The gallery shows availability, not who's using the space. Presence records are for the operator's audit trail, not the public gallery.
- **Floor plan SVGs must use consistent coordinate systems.** If the SVG doesn't match the space URI mapping, the floor plan view breaks silently. Validate on upload.

## See Also

- [Shared Space Operations](../shared-space-ops/SKILL.md) — operational patterns this skill builds on
- [Access Governance](../access-governance/SKILL.md) — access hardware integration and policy engine
- [Tenant Billing Intelligence](../tenant-billing/SKILL.md) — billing from presence records
- [FOAM Protocol](https://foam.space) — the proof-of-location protocol that inspired this architecture
- [FOAM Whitepaper](https://www.foam.space/publicAssets/FOAM_Whitepaper.pdf) — original spatial protocol design
