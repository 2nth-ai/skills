---
domain: build/robotics
skill: fanuc-m20ib
name: FANUC M-20iB/35S Industrial Robot
version: "1.0"
tier: specialist
contributor: 2nth-core
status: active
tags: [robotics, fanuc, industrial, 6-axis, machine-tending, assembly, pick-and-place, IP67]
---

# FANUC M-20iB/35S Industrial Robot

6-axis industrial robot with 35kg payload, IP67 protection, and compact footprint. Designed for machine tending, assembly, and material handling in harsh environments.

## Specifications

### Core Performance
| Parameter | Value |
|-----------|-------|
| Model | M-20iB/35S |
| Manufacturer | FANUC |
| Axes | 6 (controlled) |
| Payload | 35 kg (77 lbs) |
| Reach | 1445 mm (56.9 in) |
| Repeatability | ±0.02 mm |
| Robot Weight | 205 kg (452 lbs) |
| IP Rating | IP67 (fully encapsulated) |
| Mounting | Floor, inverted (ceiling), angle |
| Controller | R-30iB Plus / R-30iB Mate Plus |

### Axis Motion Range
| Axis | Range | Max Speed |
|------|-------|-----------|
| J1 (Rotation) | ±340° | 250°/s |
| J2 (Lower Arm) | +160° / -100° | 250°/s |
| J3 (Upper Arm) | +375° / -163° | 290°/s |
| J4 (Wrist Roll) | ±380° | 430°/s |
| J5 (Wrist Pitch) | ±125° | 430°/s |
| J6 (Wrist Yaw) | ±360° | 630°/s |

### Wrist Specifications
| Parameter | Value |
|-----------|-------|
| Wrist Type | Inline (slim profile) |
| J4 Moment | 56 Nm |
| J5 Moment | 56 Nm |
| J6 Moment | 29.4 Nm |
| J4 Inertia | 4.7 kg·m² |
| J5 Inertia | 4.7 kg·m² |
| J6 Inertia | 1.5 kg·m² |

### Environmental
| Parameter | Value |
|-----------|-------|
| Ambient Temp | 0°C to 45°C |
| Humidity | Up to 96% RH (non-condensing) |
| Protection | IP67 — submersible, spray/moisture/dirt resistant |
| Vibration | 0.5G or less |

## Key Design Features

### Slim Arm Design
The M-20iB/35S has a lightweight upper arm and inline wrist significantly slimmer than previous generations. This allows the robot to operate in tight spaces and avoid interference with fixtures, conveyors, and peripheral equipment.

### Strength-to-Weight Ratio
At 205 kg robot weight carrying 35 kg payload, the M-20iB/35S achieves a 17% payload-to-weight ratio — exceptional for its class. This means smaller pedestals, less floor reinforcement, and easier integration into existing cells.

### IP67 Full Encapsulation
Every joint and cable is fully sealed. The robot operates reliably in:
- Machining environments (coolant spray, swarf, mist)
- Washdown applications (food, pharma)
- Dusty environments (foundry, woodworking)
- Wet environments (waterjet, cleaning)

### Flexible Mounting
- **Floor mount** — standard installation
- **Inverted (ceiling)** — maximises floor space, ideal for machine tending from above
- **Angle mount** — angled pedestal for reaching into machines at optimal approach angles

## Applications

### Machine Tending
Primary use case. The slim arm profile and IP67 rating make it ideal for:
- CNC lathe loading/unloading
- Milling machine tending
- Grinding and deburring cells
- Multi-machine tending (one robot, multiple machines)

**Cycle time consideration:** With 250°/s on J1/J2 and ±0.02mm repeatability, typical machine tending cycles achieve 8-12 second load/unload times depending on travel distance.

### Assembly
- Precision component insertion (±0.02mm)
- Screw driving and fastening
- Press-fit operations
- Multi-part assembly sequences

### Pick & Place / Palletising
- High-speed part sorting
- Bin picking (with vision system)
- Layer palletising up to 35 kg per pick
- De-palletising for machine feeding

### Material Handling
- Part transfer between stations
- Conveyor pick-and-place
- Tray loading/unloading
- Buffer station management

### Dispensing
- Adhesive application
- Sealant dispensing
- Paint application (with IP67 no additional protection needed)
- Coating operations

### Material Removal
- Deburring (with force control)
- Grinding
- Polishing
- Trimming

## Controller: R-30iB Plus

### Key Capabilities
| Feature | Description |
|---------|-------------|
| iRVision | Integrated 2D/3D vision (no external PC) |
| Force Sensing | iRCalibration for contact-based tasks |
| iRPickTool | High-speed conveyor tracking |
| Line Tracking | Synchronised motion with moving conveyors |
| DCS (Dual Check Safety) | Safety-rated speed and position monitoring |
| ROBOGUIDE | Offline programming and simulation |
| ZDT (Zero Down Time) | Predictive maintenance analytics |
| FANUC FIELD | IoT connectivity and edge computing |

### Programming
| Method | Description |
|--------|-------------|
| Teach Pendant (iPendant) | Primary programming interface, touchscreen |
| KAREL | FANUC's proprietary programming language (Pascal-based) |
| TP Programs | Teach pendant motion programs |
| ROBOGUIDE | Offline simulation and path planning |
| ROS Interface | Via third-party drivers (not native) |

### Communication Protocols
- EtherNet/IP (native)
- PROFINET
- DeviceNet
- CC-Link
- EtherCAT (via gateway)
- Modbus TCP/IP
- OPC-UA (via FIELD system)

## Integration Notes

### End-of-Arm Tooling (EOAT)
| Interface | Specification |
|-----------|--------------|
| Mechanical | ISO 9409-1 flange |
| Pneumatic | Internal air lines through arm |
| Electrical | Tool I/O through connector at J6 |
| Max Payload at Flange | 35 kg |
| Max Payload at Wrist | Varies by offset — derate for CG offset |

### Payload Derating
The 35 kg rating assumes centre of gravity at the flange face. For offset CG:
```
Effective payload = f(distance from flange, inertia limits)
Use FANUC's payload checker utility in ROBOGUIDE
Rule of thumb: 10% derating per 50mm CG offset
```

### Cell Design Considerations
- **Footprint:** ~800mm diameter working envelope at floor level
- **Height clearance:** 2200mm minimum for floor mount
- **Pedestal:** Steel pedestal recommended, concrete anchor minimum M16 x 4
- **Cable routing:** Cables exit at base; allow 300mm radius for dress-out
- **Safety fencing:** DCS can reduce fencing requirements with safety-rated monitoring

## Maintenance Schedule

| Interval | Task |
|----------|------|
| 3 months | Visual inspection, check for leaks/damage |
| 6 months | Grease J1-J3 (FANUC specified grease only) |
| 12 months | Grease J4-J6, check belt tension |
| 3 years | Replace batteries (encoder backup) |
| 5 years | Full overhaul — belts, seals, bearings inspection |
| 10,000 hrs | Reducer inspection |

### Predictive Maintenance (ZDT)
FANUC's Zero Down Time system monitors:
- Motor current signatures (detect wear)
- Vibration patterns (bearing degradation)
- Temperature trends (overload detection)
- Cycle time drift (mechanical wear indicator)

## Comparison: M-20iB Family

| Model | Payload | Reach | Weight | Use Case |
|-------|---------|-------|--------|----------|
| M-20iB/25 | 25 kg | 1835 mm | 250 kg | General purpose, longer reach |
| **M-20iB/35S** | **35 kg** | **1445 mm** | **205 kg** | **Compact, high payload** |
| M-20iD/25 | 25 kg | 1835 mm | 225 kg | Next-gen, slimmer, faster |
| M-20iD/35 | 35 kg | 1831 mm | 230 kg | Next-gen, full reach + payload |

## Reference

- Product page: https://www.fanucamerica.com/products/robots/series/m-20/m-20ib-35s
- ROBOGUIDE simulation: Available from FANUC authorised integrators
- CAD models: Available on FANUC's partner portal (login required)
- Training: FANUC Academy — Handling Tool Operation and Programming (40 hours)
