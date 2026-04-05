---
name: openbim
description: |
  openBIM and smart building platform expert. Use this skill when:
  (1) implementing IFC (Industry Foundation Classes) for digital building models,
  (2) setting up BIM Collaboration Format (BCF) workflows for issue management,
  (3) using Information Delivery Specifications (IDS) to define and validate data requirements,
  (4) integrating with the buildingSMART Data Dictionary (bSDD) for consistent terminology,
  (5) designing open data exchange workflows between architecture, engineering, and construction software,
  (6) building digital twins for constructed assets using open standards,
  (7) advising on SA building compliance (SANS 10400, NHBRC, CIDB) in the context of BIM workflows,
  (8) connecting BIM models to IoT sensor networks for smart building operations.
license: MIT
compatibility: Any
metadata:
  author: GridLineProp (Grant Kneale)
  version: "1.0.0"
  homepage: "https://skills.2nth.ai/biz/openbim"
  repository: "https://github.com/2nth-ai/skills"
  requires: "biz/property, iot/platform"
  improves: "biz"
  categories: "Construction, BIM, openBIM, Smart Buildings, IFC, Digital Twin"
---

# openBIM — Smart Building Platforms

Open standards for building information modelling and smart building operations. This skill enables AI agents to work with IFC models, BIM collaboration workflows, and the integration of construction data with IoT systems for intelligent building management.

openBIM is not a product — it's an approach. It uses open, vendor-neutral standards (maintained by buildingSMART International) to ensure that building data flows freely between design, construction, and operations tools without lock-in.

## Core Standards

### IFC (Industry Foundation Classes)

The universal data model for buildings and infrastructure. IFC describes geometry, spatial structure, materials, properties, systems, and relationships in a single neutral format.

```
IFC Model Structure:
  IfcProject
    └── IfcSite
        └── IfcBuilding (Silvercroft)
            ├── IfcBuildingStorey (Ground Floor)
            │   ├── IfcWall (external, R-value 3.2)
            │   ├── IfcWindow (double-glazed, U-value 1.4)
            │   ├── IfcDoor (fire rated, FD30)
            │   └── IfcSpace (living room, 42m²)
            ├── IfcBuildingStorey (First Floor)
            │   └── ...
            └── IfcSystem
                ├── IfcDistributionSystem (solar PV)
                ├── IfcDistributionSystem (water harvesting)
                └── IfcDistributionSystem (HVAC)
```

Key IFC classes for smart buildings:
- `IfcSensor` — temperature, humidity, occupancy, light sensors
- `IfcActuator` — motorised blinds, valves, switches
- `IfcController` — building automation controllers (BACnet, KNX)
- `IfcDistributionSystem` — HVAC, plumbing, electrical, solar

### BCF (BIM Collaboration Format)

Structured issue management between design tools. BCF captures what, where, and who — linked to the IFC model.

```json
{
  "topic": {
    "title": "Solar panel clashes with rainwater gutter",
    "status": "Active",
    "priority": "High",
    "assigned_to": "grant@gridline.co.za",
    "viewpoint": {
      "camera_position": [12.4, 8.2, 15.0],
      "ifc_guids": ["2O2Fr$t4X7Zf8NOew3FLOH"]
    }
  }
}
```

### IDS (Information Delivery Specification)

Defines what information is required in an IFC model at each project stage. Machine-readable requirements that can be automatically validated.

Use cases:
- SANS 10400 compliance checking (fire ratings, structural, energy)
- NHBRC enrollment documentation requirements
- CIDB grading evidence extraction from BIM
- Municipality submission validation

### bSDD (buildingSMART Data Dictionary)

Standardised terminology for the built environment. Ensures that "R-value" means the same thing across all software, all languages, and all project participants.

## Smart Building Integration

### BIM-to-IoT Bridge

The digital twin connects the as-built IFC model with live sensor data:

```
IFC Model (static)               IoT Layer (live)
──────────────────               ─────────────────
IfcSpace "Living Room"    ←───→  ESP32 temp sensor (22.1°C)
IfcSystem "Solar PV"      ←───→  Victron API (5.2kW producing)
IfcSystem "Water"         ←───→  Tank float switch (78% full)
IfcSensor "Occupancy"     ←───→  PIR sensor (occupied)
IfcActuator "Blinds West" ←───→  ESP32 motor controller (closed)
```

Each IFC element has a GlobalId (GUID). The IoT layer maps sensor readings to GUIDs. The digital twin shows real-time state overlaid on the 3D model.

### Open APIs (openCDE)

buildingSMART's openCDE provides standardised APIs:
- **Foundation API** — authentication, project discovery
- **BCF API** — issue creation, comment, status
- **Documents API** — file upload, versioning, access control
- **Dictionary API** — terminology lookup, classification

## SA Building Compliance via BIM

### SANS 10400 Automated Checking

IFC models contain the properties needed for code compliance:

| SANS 10400 Part | IFC Property | Check |
|----------------|-------------|-------|
| Part B (Structural) | `IfcStructuralLoadGroup` | Load calculations complete |
| Part T (Fire) | `IfcDoor.FireRating` | Fire doors rated FD30/FD60 |
| Part XA (Energy) | `IfcWall.ThermalTransmittance` | U-values within limits |
| Part S (Facilities) | `IfcSpace.NetFloorArea` | Disability access compliance |

An AI agent can:
1. Load the IFC model
2. Extract relevant properties per SANS 10400 part
3. Compare against code requirements
4. Generate a compliance report with pass/fail per element
5. Create BCF issues for non-compliant elements

### NHBRC Enrollment

BIM-extracted data feeds directly into NHBRC enrollment:
- Structural engineer's calculations (from `IfcStructuralAnalysisModel`)
- Building dimensions and areas (from `IfcSpace`)
- Material specifications (from `IfcMaterial`)
- Foundation details (from `IfcFooting`, `IfcPile`)

## Gotchas

1. **IFC version matters** — IFC4 is the current standard. IFC2x3 is still widely used but lacks smart building classes. Always check which version the authoring tool exports.
2. **Geometry vs. data** — IFC carries both geometry and properties. For compliance checking and IoT integration, you only need properties. Don't process geometry unless you're building a 3D viewer.
3. **Export quality varies** — not all BIM software exports complete IFC. Validate with the buildingSMART IFC Validation Service before relying on downstream automation.
4. **South African adoption is early** — most SA practices still use proprietary formats. openBIM is a push, not a pull. Frame it as "future-proofing your data" and "compliance automation."
5. **Digital twin ≠ 3D viewer** — a real digital twin connects live sensor data to model elements via GUIDs. A 3D viewer with no live data is just a render.
