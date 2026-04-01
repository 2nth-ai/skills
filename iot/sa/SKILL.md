---
name: South Africa IoT Context
description: >
  SA-specific IoT deployment context: ICASA type approval, local spectrum regulations,
  LoRaWAN/NB-IoT operators, load shedding-resilient design, local suppliers,
  smart metering (Eskom AMI), and municipal IoT initiatives.
requires:
  - iot/connectivity
  - iot/power
improves: []
metadata:
  domain: iot
  subdomain: sa
  maturity: stable
---

# South Africa IoT Context

Deploying IoT in South Africa requires understanding local regulations, spectrum licensing, network operator landscape, power reliability constraints, and supply chain realities. Designs that work in Europe or the US may be non-compliant or impractical in the SA context.

---

## ICASA Type Approval

The Independent Communications Authority of South Africa (ICASA) requires type approval for any radio frequency (RF) device sold or used in South Africa under the Electronic Communications Act 36 of 2005.

### What Requires Type Approval

| Device Category | Requirement |
|----------------|------------|
| WiFi (2.4GHz / 5GHz) | Type approval required; most module manufacturers hold SA approval |
| BLE / Bluetooth | Type approval required |
| LoRaWAN (868MHz equivalent — SA uses 915MHz ISM) | Type approval required |
| NB-IoT / LTE-M | Type approval required (network operator assists) |
| Cellular (2G/3G/4G) | Module must have ICASA approval; operator confirms compliance |
| Zigbee / Thread | Type approval required |
| Short-range (< 10mW, unlicensed ISM) | Still requires approval; process is lighter |

### SA Frequency Bands

South Africa uses ITU Region 1 allocations with some deviations:

| Technology | Frequency Band | Notes |
|-----------|---------------|-------|
| LoRaWAN | 915–920 MHz (ISM) | SA868 plan exists but 915 MHz AS923 plan is more common |
| NB-IoT | 700 MHz / 800 MHz | Vodacom, MTN licensed spectrum |
| LTE-M | 700 MHz / 1800 MHz | Vodacom Cat-M1 deployment |
| BLE / WiFi / Zigbee | 2.4 GHz ISM | Globally consistent; ICASA approval still required |
| WiFi 5GHz | 5.15–5.35 GHz / 5.47–5.725 GHz | Indoor/outdoor restrictions apply |
| Sub-GHz ISM | 433 MHz / 868 MHz | 433 MHz widely used for remotes, sensors |

### Type Approval Process

1. **ICASA accredited test laboratory** — Submit device for testing (RF emissions, spurious emissions, conducted emissions). Labs: CSIR, TÜV SÜD, SGS South Africa, Element Materials Technology.
2. **Application** — Submit test report + technical documentation to ICASA via WISA (Wireless Industry Standards Association) or directly.
3. **Certificate** — ICASA issues Type Approval Certificate. Valid 3 years; renewable.
4. **Labelling** — Device must carry ICASA mark (ICASA logo + approval number).

**Practical tip**: For module-based designs (ESP32, SIM7080G, SARA-R4), check if the module already holds SA type approval. Many do — you need only a Declaration of Conformity for your product, not a full re-test, if you use an approved module without modifying the RF circuit.

**Cost**: R15,000–R80,000 depending on complexity and lab fees. Timeline: 4–12 weeks.

---

## LoRaWAN in South Africa

### Network Operators

| Operator | Coverage | Frequency | Notes |
|---------|---------|----------|-------|
| **Everynet SA** | Major metros + agriculture zones | 915 MHz | Commercial; national rollout; REST API; roaming |
| **Squidnet** | Western Cape strong; expanding nationally | 915 MHz | SA-focused; good agricultural coverage |
| **Liquid Intelligent Technologies** | Business parks; expanding | 915 MHz | Enterprise focus |
| **Actility / ThingPark** | Through Everynet partnership | 915 MHz | Global roaming via ThingPark Exchange |
| **Private networks** | Any deployment | 915 MHz | DIY gateway + ChirpStack server common |

**SA LoRaWAN frequency plan**: Use **AU915** (Australian 915 MHz plan) — this is the closest standardised plan and is what SA operators and device manufacturers support. The AS923 plan is also deployed in some networks.

### LoRaWAN Gateway Deployment

For private networks (farms, campuses, mines):

| Gateway | Coverage | Notes |
|---------|---------|-------|
| RAK7268 / RAK7289 | 10–15 km rural; 2–5 km urban | Indoor/outdoor; Ethernet + LTE backhaul |
| Dragino DLOS8 | 10 km rural | Outdoor IP67; popular in SA agriculture |
| Kerlink iFemtoCell | 1–5 km | Indoor; enterprise; used in mines and buildings |
| Milesight UG65 | 10 km rural | Dual SIM backhaul; good SA support |

**Backhaul recommendation for SA**: LTE primary, Ethernet secondary. Load shedding → LTE survives when Ethernet switches are down. Use LiFePO₄ backup battery on the gateway (see power design below).

### SA LoRaWAN Deployment Sectors

| Sector | Use Case | Notes |
|--------|---------|-------|
| **Agriculture** | Soil moisture, dam levels, frost alerts, livestock tracking | Western Cape, Limpopo, KZN deployments |
| **Metering** | Water, electricity, gas sub-metering | Municipalities piloting; Eskom AMI separate |
| **Cold chain** | Temperature monitoring (pharma, food) | SAHPRA compliance driver |
| **Waste management** | Bin fill-level sensors | City of Cape Town pilot; Tshwane piloting |
| **Mining** | Worker tracking, gas detection, equipment monitoring | Silica dust, methane monitoring |
| **Smart cities** | Parking, air quality, flood monitoring | Johannesburg, Cape Town, Durban pilots |

---

## NB-IoT and LTE-M in South Africa

### Network Operator Coverage

| Operator | Technology | Coverage | Notes |
|---------|-----------|---------|-------|
| **Vodacom** | NB-IoT + LTE-M (Cat-M1) | 80%+ population coverage | Best national coverage; NB-IoT since 2018 |
| **MTN** | NB-IoT | 70%+ population coverage | Expanding; good in metros and corridors |
| **Rain** | LTE / NB-IoT (limited) | Urban focus | Mainly data; IoT secondary |
| **Liquid** | NB-IoT through partnership | Enterprise zones | |

**Recommended module**: SIM7080G (SIMCom) — NB-IoT + LTE-M + GNSS; supports SA bands; readily available through Communica and RS Components SA. Alternative: SARA-R410M (u-blox).

### NB-IoT SIM Selection

| SIM Provider | Type | Notes |
|-------------|------|-------|
| Vodacom IoT SIM | Machine SIM | Fixed monthly; low ARPU plans from R2.50/month |
| MTN IoT Connect | Machine SIM | Available; requires business account |
| Emnify / 1NCE | Global eSIM | Works on Vodacom/MTN; global roaming; R12–R35/month; useful for international deployments |
| Eseye | Global eSIM | Enterprise; multi-IMSI; automatic operator steering |

**1NCE** (€10 for 10 years / 500MB / 250 SMS) is popular for low-data SA IoT deployments that need a simple billing model.

---

## Load Shedding-Aware IoT Design

South Africa's load shedding — systematic rolling power cuts — is a primary design constraint for any grid-connected IoT device. As of 2024, Stage 2–6 cuts (2–12 hours/day) are routine. Design must assume the grid is unreliable.

### Load Shedding Stage Reference

| Stage | Hours off per day | Pattern |
|-------|-----------------|---------|
| Stage 1 | 2 h | 2 slots × 1h |
| Stage 2 | 4 h | 2 slots × 2h |
| Stage 3 | 6 h | 2–3 slots |
| Stage 4 | 8 h | 4 slots × 2h |
| Stage 5 | 10 h | 5 slots × 2h |
| Stage 6 | 12 h | 6 slots × 2h |
| Stage 8 | 16 h | 8 slots × 2h (possible) |

### Design Rules for Load Shedding

1. **Never assume grid availability** — design for ≥ Stage 6 autonomy (12h+ without mains).
2. **LiFePO₄ preferred over LiPo** for gateway backup — wider temperature range, safer, 2,000+ cycles vs 300.
3. **Solar + battery mandatory for outdoor unattended nodes** — any remote asset must be energy-independent.
4. **Graceful degradation** — on low battery, reduce transmit frequency; increase sleep duration; alert platform.
5. **Schedule awareness** — integrate EskomSePush API to pre-charge to 100% before outage window.

```javascript
// EskomSePush API — fetch schedule for area
// API: https://eskomsepush.gumroad.com/l/api
const response = await fetch(
  `https://developer.sepush.co.za/business/2.0/area?id=${areaCode}&test=current`,
  { headers: { 'Token': ESP_API_KEY } }
);
const schedule = await response.json();
// schedule.events[n].start (ISO 8601), schedule.events[n].end
// schedule.events[n].note ("Stage 2")
```

**Area codes**: Municipalities publish area codes; EskomSePush maintains a searchable database of 4,000+ areas.

### Battery Sizing for Gateway (12h Load Shedding)

```
Example: IoT gateway with cellular modem + PoE switch + 4 sensors
Active load: 500mA at 12V = 6W
Battery: 12V 15Ah LiFePO₄ = 180Wh (usable 80% = 144Wh)
Runtime: 144Wh / 6W = 24h — comfortable Stage 8 coverage
Charging time from solar: 50W panel × 5.5 PSH × 0.85η = 233Wh/day → full recharge daily
```

### Load Shedding Alert Flow

```
Gateway firmware:
1. Monitor ADC on mains-detect circuit (opto-isolated)
2. On mains lost: log event to MQTT topic `gw/{id}/power`, publish "grid_off"
3. On battery < 20%: publish "battery_low" + reduce sensor poll interval 10×
4. On mains restored: publish "grid_on" + sync time via NTP + resume normal
5. Platform side: alert operations team; log outage duration
```

---

## SA Local Suppliers

### Electronics & Components

| Supplier | Location | Strengths |
|---------|---------|----------|
| **RS Components SA** | JHB, CPT, DBN | Full Farnell/RS catalog; next-day; good MCU/sensor range |
| **Communica** | Nationwide + online | Modules, dev boards, LoRa hardware; ESP32, Arduino, Pi |
| **Mantech Electronics** | Nationwide | Industrial components, connectors, power supplies |
| **Electrocomp** | JHB | Passive components, ICs, enclosures |
| **Assembly Garage** | CPT | PCB prototyping + assembly; fast turnaround |
| **PCBWay SA** | Via China | PCB fabrication; 2-week delivery |
| **3DIY** | Online | 3D printing services; rapid prototype enclosures |

### PCB Manufacturing

For prototypes: **JLCPCB** (China — 7–14 days, R150 for 5× PCBs + airfreight). For production in SA: **Kaifa Technology**, **Asorbes**, **Trident**, **Assembly Garage** (CPT, small runs).

**JLCPCB Basic Parts List**: Design boards using JLCPCB basic components library to minimise assembly cost. Common parts in the basic list: 0402/0603 resistors/caps, STM32G0xx, ESP32-S3, common FETs.

### System Integrators & IoT Specialists

| Company | Specialty |
|---------|----------|
| **Synaptiq** | Enterprise IoT; Vodacom partner; smart cities |
| **Aerobotics** | AgriTech; drone + IoT; Western Cape |
| **WineMS** | Wine farm automation; Western Cape |
| **IntelliAMS** | Asset management; mine IoT; Gauteng |
| **Senko** | LoRaWAN integration; agriculture; Cape Town |
| **Numida Technologies** | Water + energy metering; municipalities |
| **ThingSpace** | IoT managed services; LoRaWAN; JHB |

---

## Smart Metering — Eskom AMI

Eskom's Advanced Metering Infrastructure (AMI) program is one of the largest IoT deployments in Africa.

### Eskom AMI Architecture

```
Smart Meter (DLMS/COSEM, PLC or RF mesh)
    → Data Concentrator Unit (DCU, per substation)
        → Eskom Head-End System (HES, Itron OpenWay Riva or Landis+Gyr)
            → MDM (Meter Data Management) system
                → Billing / outage management
```

**Communication**: Power Line Communication (PLC, G3-PLC or PRIME) in most deployments. RF mesh (Itron OpenWay) in some areas.

**Protocol**: DLMS/COSEM (Device Language Message Specification / Companion Specification for Energy Metering) — IEC 62056 standard.

**Private sub-metering** (buildings, industrial): LoRaWAN or RS-485 Modbus sub-meters are common; connect to building BMS or IoT platform.

### Municipality Smart Water Metering

Several SA municipalities have deployed or are piloting smart water meters:

| Municipality | Supplier | Technology | Notes |
|-------------|---------|-----------|-------|
| City of Cape Town | Sensus / Itron | Fixed-network RF | Partial rollout; targeting full coverage |
| City of Johannesburg | Kamstrup | AMR/AMI | Ongoing rollout via Johannesburg Water |
| eThekwini (Durban) | Sensus | AMR | Larger properties targeted |
| Nelson Mandela Bay | In-house + IoT | LoRaWAN pilot | Water scarcity driver |

**Water scarcity context**: Day Zero planning in Cape Town (2018) accelerated investment in water metering IoT. NMB and other Eastern Cape municipalities face ongoing drought — smart metering demand remains high.

---

## POPIA & Data Sovereignty for SA IoT

IoT data collected in South Africa is subject to POPIA (Protection of Personal Information Act, No. 4 of 2013, effective 1 July 2021).

### Data Residency Considerations

| Scenario | POPIA Implication |
|---------|-----------------|
| IoT data stored on AWS Johannesburg (af-south-1) | Preferred; in-country; no cross-border transfer |
| IoT data stored on AWS Ireland or US | Cross-border transfer — requires adequate protection or contractual safeguards |
| Azure South Africa North (Johannesburg) | In-country; POPIA-compliant hosting |
| Google Cloud (no SA region yet) | Cross-border — additional obligations |

**Recommendation**: Use **AWS af-south-1** (Cape Town opened 2020) or **Azure South Africa North** for any SA IoT platform storing personal data.

### SA IoT Data Classification

| Data | POPIA Category | Notes |
|------|---------------|-------|
| Smart meter readings (per address) | Personal | Reveals occupancy, behaviour |
| Agricultural sensor (farm coordinates) | Not personal (farm is property, not person) | May become personal if linked to individual |
| Employee location tracking (mine, warehouse) | Personal — workplace monitoring | POPIA s69 + LRA obligations |
| Vehicle telematics | Personal | PPIA; also Road Traffic Act compliance |
| Health IoT (wearables, hospitals) | Special personal information | POPIA s26 — heightened standard |
| Air quality (community level, not per house) | Not personal | Aggregate — no individual identification |

### PAIA Obligations for IoT Platforms

The Promotion of Access to Information Act (PAIA) requires SA organisations to maintain a PAIA manual. IoT platforms that process personal data must include data categories, retention periods, and access procedures in their PAIA manual.

---

## SA-Specific Design Considerations

### Environmental

| Condition | SA Specifics | Design Response |
|-----------|------------|----------------|
| **Solar irradiance** | Northern Cape 6+ kWh/m²/day; even Highveld winter 4.5+ | Solar is viable everywhere in SA |
| **Temperature** | Enclosure temp up to +85°C in direct sun (Limpopo, NC) | White enclosures; thermal management |
| **Dust** | Highveld dust storms; mine dust; agricultural dust | IP65 minimum; IP67 preferred |
| **Humidity** | KZN coastal: 80–95% RH year-round | Conformal coating on PCBs; ePTFE vents |
| **Lightning** | SA has one of world's highest lightning flash densities (Highveld summer) | TVS diodes on all I/O; lightning arrestors on antennas; earthing |
| **Vandalism** | Urban deployments; farm theft | Tamper-evident enclosures; GPS + alert on enclosure open |

### Lightning Protection (Critical for SA)

The Highveld (Gauteng, Mpumalanga) has > 10 lightning flashes/km²/year. Outdoor IoT installations must be designed accordingly:

```
Antenna port → Lightning arrester (PolyPhaser IS-B50LN-C2 or similar)
             → Coax to radio module
Power input  → TVS diode (SMBJ12A for 12V; clamps at 19.9V)
I/O lines    → ESD protection array (PRTR5V0U2X or similar)
Ground       → Dedicated earth stake; < 1Ω resistance; bond to enclosure
```

**SANS 10313** (Protection of structures against lightning) and **SANS 62305** — applicable to fixed IoT infrastructure installations.

### Connectivity Fallback Strategy

SA network reliability varies significantly by region. Design for degraded-mode operation:

```
Primary:   LoRaWAN (Everynet/Squidnet) or NB-IoT (Vodacom)
Fallback:  SMS (AT+CMGS via cellular module) — extremely reliable even in rural areas
Local:     SD card / FRAM data logging — never lose readings during connectivity outage
Sync:      On reconnect, upload buffered data with timestamp preservation
```

**Rural SA connectivity reality**: LoRaWAN coverage on farms is private-gateway dependent. NB-IoT coverage is excellent on N1, N2 corridors but sparse 20km+ off national routes. Design for ≥24h local data buffering.

### Theft & Security

IoT hardware theft is a material risk in SA deployments:

| Measure | Implementation |
|---------|---------------|
| GPS tracking | SIM7080G has built-in GNSS — log position on boot and periodically |
| Tamper detection | Reed switch on enclosure lid → interrupt → MQTT alert |
| Solar panel theft alert | Sudden drop in panel voltage → alert |
| Cellular module SIM lock | Lock SIM to ICCID in firmware; reject foreign SIM insertions |
| Epoxy potting | Valuable outdoor nodes; prevents component harvest |
| Decoy cabling | Visible cable routed away from actual electronics |

---

## Local Standards & Compliance

| Standard | Scope | Applicability |
|---------|-------|--------------|
| **ICASA Type Approval** | RF devices | Mandatory for any radio device |
| **SANS 10112** | Electrical installation | Gateway power installations |
| **SANS 10313 / SANS 62305** | Lightning protection | Outdoor fixed installations |
| **SANS 241** | Drinking water quality | Water quality IoT sensors |
| **NRCS (National Regulator for Compulsory Specifications)** | Electrical appliances | If device plugs into mains |
| **POPIA** | Personal data | Any IoT collecting personal information |
| **SAHPRA** | Medical devices | Health IoT (wearables, diagnostics) |
| **SABS SANS 50631** | Solar panels | Solar PV components |
| **NERSA** | Energy | Smart meters; grid-connected energy monitoring |

---

## Cost Benchmarks (ZAR, 2024–2025)

| Item | ZAR Range | Notes |
|------|----------|-------|
| ESP32-S3 module | R45–R80 | Via Communica / JLCPCB assembly |
| LoRa transceiver (SX1276 module) | R120–R200 | RAK811, LLCC68 modules |
| SIM7080G (NB-IoT/Cat-M/GNSS) | R280–R450 | RS Components SA |
| ATECC608B secure element | R35–R60 | RS Components |
| SHT40 T+RH sensor | R80–R150 | RS Components |
| LiFePO₄ 10Ah 12V battery | R800–R1,400 | Local battery suppliers |
| 20W solar panel | R350–R550 | Local solar suppliers |
| IP67 polycarbonate enclosure | R180–R400 | RS Components; Mantech |
| PCB fabrication (100× 2-layer, JLCPCB) | R800–R1,500 | Including airfreight |
| ICASA type approval | R15,000–R80,000 | Lab + ICASA fee; module reuse reduces this |
| NB-IoT SIM (1NCE 10yr) | ~R185 once-off | Best for low-data budget deployments |
| Everynet LoRaWAN (per device/year) | R60–R150 | Volume dependent |

**Rule of thumb**: A production-quality outdoor LoRaWAN sensor node (PCB + enclosure + battery + solar + connectivity) costs R1,500–R3,500 BOM at 100-unit volume. Gateway cost: R3,000–R8,000 depending on backhaul.
