---
name: Electronics Hardware Design
description: >
  PCB design, schematic capture, component selection, signal integrity,
  EMC/EMI compliance, design-for-manufacture, and hardware bring-up for
  IoT and embedded electronics products.
requires: []
improves: []
metadata:
  domain: iot
  subdomain: hardware
  maturity: stable
---

# Electronics Hardware Design

You are the fractional IoT Engineering Director for this project. Hardware decisions made here directly affect production yield, regulatory approval, field reliability, and unit economics. Every schematic, layout, and BOM choice is made with manufacture in mind from day one. South African context applies throughout: ICASA type approval is a hard requirement for any radio-bearing product sold locally; sourcing from RS Components SA, Communica, and Mantech Electronics is preferred where lead times and duties make international distributors impractical.

---

## 1. Schematic Design

### Net Naming Conventions

Consistent net names prevent cross-sheet ambiguity and make netlist diffs readable.

| Category | Convention | Example |
|---|---|---|
| Power rails | VBUS, VIN, VSYS, V3V3, V1V8 | `V3V3`, `V1V8_CORE` |
| Ground | GND (digital), AGND (analog), PGND (power) | `AGND`, `PGND` |
| Active-low signals | Suffix `_N` or `_B` | `RESET_N`, `CS_N` |
| Differential pairs | Suffix `_P` / `_N` | `USB_DP`, `USB_DN` |
| Clocks | Prefix `CLK_` | `CLK_32K`, `CLK_SYS` |
| Interrupts | Prefix `IRQ_` | `IRQ_ACCEL` |
| GPIO | Module name + pin intent | `BLE_UART_TX`, `SENS_INT` |

Never reuse a net name on different sheets without a global net flag. Hierarchical designs must propagate port names identically top-to-bottom.

### Power Hierarchy

The canonical rail cascade for a battery-powered IoT node:

```
VBAT (LiPo 3.0–4.2 V) or VBUS (USB 5 V)
  └─ VIN (post-reverse-polarity protection, fuse)
       └─ VSYS (post-ideal-diode or OR-ing FET, switchover)
            ├─ V3V3  (LDO or buck from VSYS, main MCU rail)
            │    ├─ V1V8  (LDO from V3V3 for low-voltage IO)
            │    └─ VDDIO (configurable IO supply, often 1.8–3.3 V)
            └─ VBAT_PROT (charger output to battery, managed separately)
```

Design rules:
- VSYS must be available before any downstream rail enables.
- Sequence V3V3 → V1V8 using enable-pin chaining or a supervisor IC (TPS3840, MAX16054).
- Never route audio or RF analog supplies from a shared digital LDO without additional LC filtering.

### Decoupling Strategy

Every IC requires two classes of decoupling:

**Bulk (electrolytic or large ceramic):** Placed within 5 mm of the IC power pin cluster. Size per load transient. A 10 µF X5R ceramic at the rail entry handles step loads up to ~50 mA/µs on a 100 mV droop budget. For SMPS outputs add ≥ 47 µF rated at 1.5× Vout.

**High-frequency ceramic (100 nF + 10 nF):** Placed as close as possible to each VDD/VDDIO pin — under the IC on the opposite side if routing permits. Use X7R/X5R 0402 minimum. Avoid Y5V; capacitance drops 80% at rated voltage.

```
Placement priority:
1. 100 nF 0402 → directly adjacent to each IC power pin
2. 10 nF 0402  → stacked or immediately beside the 100 nF
3. 10 µF 0805  → within 5 mm, one per rail per IC cluster
```

Via from the decoupling cap pad to the ground plane must be placed on the cap pad itself, not at the end of a stub trace.

### ESD Protection

| Port type | Recommended device | Placement rule |
|---|---|---|
| USB 2.0 | PRTR5V0U2X (dual, 0.5 pF) | Within 500 µm of connector, before series R |
| UART / SPI | ESD5Z3.3T1G (unidirectional TVS) | First device after connector, before MCU |
| CAN / RS-485 | CDSOT23-SM712 | Differential pair, symmetric placement |
| GPIO (user-accessible) | 100 Ω series + 3.3 V zener to GND | Inline on signal path |
| Power input | SMAJ5.0A TVS + 1 A polyfuse | Inline on VIN before any regulator |

TVS clamping voltage must be below the absolute maximum rating of the protected IC. For 3.3 V tolerant inputs, use a 5 V TVS, not a 3.3 V TVS (forward voltage drop + leakage causes brown-outs under normal operation).

Current limiting: add a series resistor (22–100 Ω) between the TVS and the IC pin to slow the current ramp and give the TVS time to clamp. Calculate: `I_peak = (V_transient - V_clamp) / R_series`.

### Reset Circuitry

Preferred: dedicated supervisor IC (TLV809, APX803) over RC + Schmitt trigger. Supervisor ICs provide:
- Precise threshold (typically ±1.5%)
- Glitch immunity (minimum assert time)
- Open-drain output compatible with active-low reset pins

RC reset (last resort):
```
V3V3 ──┬── R (10 kΩ) ── RESET_N (MCU pin, active-low)
        │         │
       C (100 nF) │
        │         │
       GND      Optional manual reset button to GND
```
`τ = RC = 10 kΩ × 100 nF = 1 ms`. Power-on delay at 63% threshold ≈ 1 ms — adequate for most MCUs but verify against datasheet minimum reset pulse width.

### Crystal Oscillator Loading Calculation

The MCU datasheet specifies load capacitance `CL`. Achieve this with:

```
C_load = (C_X1 × C_X2) / (C_X1 + C_X2) + C_stray
```

For matched capacitors (`C_X1 = C_X2 = CX`):

```
CX = 2 × (CL - C_stray)
```

Typical `C_stray` on a 4-layer board: 3–5 pF. For `CL = 12 pF` and `C_stray = 4 pF`:

```
CX = 2 × (12 - 4) = 16 pF
```

Use 15 pF or 18 pF standard values. Keep crystal traces below 10 mm, guarded by a ground ring, no other signals routed underneath.

### Pull-up / Pull-down Selection

| Signal type | Pull value | Rationale |
|---|---|---|
| I2C SDA/SCL (100 kHz, 3.3 V) | 4.7 kΩ | Rise time: `τ = R × C_bus`; stay below 1 µs |
| I2C SDA/SCL (400 kHz, 3.3 V) | 2.2 kΩ | Faster rise time needed |
| SPI CS_N (idle high) | 10 kΩ | Prevent spurious asserts on power-up |
| UART RX | 10 kΩ | Hold line idle-high, prevent framing errors |
| Active-low RESET_N | 10 kΩ pull-up | Defined state; allows open-drain supervision |
| BOOT/MODE pins | 10 kΩ (board-level) | Override by solder jumper or test point |

Never float a CMOS input. Every unused GPIO must be pulled to a defined level or configured as output.

---

## 2. PCB Layout

### Layer Stackup Options

**2-Layer (cost-optimised, <50 MHz signals, no RF):**
```
Top:    Signal + power pours
Bottom: Ground pour (as continuous as possible) + secondary signals
```
Limitation: shared reference plane forces compromise between ground integrity and routing density. Avoid on boards with RF, DDR, or high-speed USB.

**4-Layer (standard IoT choice):**
```
Layer 1 (Top):    Components + high-speed signals
Layer 2:          GND (solid, reference plane)
Layer 3:          Power planes (V3V3, V1V8 poured by region)
Layer 4 (Bottom): Secondary signals + ground pour
```
Core thickness: 0.36 mm (L2–L3), prepreg: 0.1 mm (L1–L2, L3–L4). Total ~0.8 mm or 1.0 mm standard.

**6-Layer (RF module, high-speed MCU, dense BGA):**
```
Layer 1 (Top):    RF + high-speed signals
Layer 2:          GND
Layer 3:          Signal (controlled impedance)
Layer 4:          Power distribution
Layer 5:          GND
Layer 6 (Bottom): Signal + slow IO
```

### Impedance Control

| Signal type | Target impedance | Trace width (4L, 0.1 mm prepreg) |
|---|---|---|
| Single-ended RF (50 Ω) | 50 Ω | ~0.22 mm on L1 over L2 GND |
| USB 2.0 differential | 90 Ω | 0.15 mm trace / 0.15 mm gap |
| CAN differential | 120 Ω | 0.2 mm trace / 0.2 mm gap |
| DDR data | 50 Ω single, 100 Ω diff | Per stackup calculator |

Always confirm with your fab's stackup impedance calculator (JLCPCB, PCBWay both offer online tools). Request controlled impedance stackup explicitly in fab notes — it adds cost but is mandatory for RF and USB.

### Ground Plane Rules

- Keep the L2 ground plane unbroken under RF traces and high-speed buses.
- Splits in the ground plane for AGND/PGND must be bridged by a single-point connection (zero-ohm resistor or ferrite bead) — the split stops conducted current looping through analog sections.
- No signal traces crossing plane splits. DRC rule: flag any trace that crosses a pour gap.
- Pour-flood in KiCad/Altium: use `Net: GND`, `Clearance: 0.2 mm`, `Thermal relief: None` for high-current pads, `Thermal spoke: 4-spoke` for hand-soldering pads.

### Via Stitching

Stitch the top-layer ground pour to L2 GND:
- Spacing: ≤ λ/20 at highest frequency (for 2.4 GHz: λ = 125 mm → stitch every 6 mm max).
- Via size: 0.3 mm drill / 0.6 mm pad is JLCPCB Basic spec, no extra charge.
- Stitching row around RF keepout perimeter: mandatory for BLE/Wi-Fi module integration.
- Shielding cans on PCB: add stitching vias on 1.5 mm grid inside the can footprint perimeter.

### Component Placement Priority

1. **Decoupling capacitors** — place before routing any signal. Lock them in place.
2. **Thermal pads / exposed pads** — align with thermal via arrays; verify paste stencil opening.
3. **RF front-end** — antenna keepout enforced (no copper, no traces, no vias under monopole/patch). BLE module keepouts typically 2 mm from antenna to any copper.
4. **Oscillators / crystals** — short traces, ground guard ring, isolated from switching supplies.
5. **Power components** (inductor, bulk caps, FETs) — thermal cluster, short high-current loops.
6. **Connectors** — edge-aligned, 3D clearance checked.
7. **Remaining ICs** — by functional block; keep signal flow logical (left-to-right or top-to-bottom).

### Trace Width for Current Capacity (IPC-2221)

External conductor (1 oz Cu = 35 µm):

| Max current | Min trace width | Temp rise |
|---|---|---|
| 0.5 A | 0.25 mm | 10°C |
| 1.0 A | 0.50 mm | 10°C |
| 2.0 A | 1.00 mm | 10°C |
| 3.0 A | 1.75 mm | 10°C |
| 5.0 A | 2.50 mm | 10°C |

Double width for internal conductors (buried layers dissipate heat less efficiently). For battery charge/discharge paths, design for 2× peak current with 10°C rise margin. Use multiple vias in parallel for high-current layer transitions (each via handles ~0.5 A at 10°C rise).

### Thermal Relief vs Solid Connection

| Connection type | Use thermal relief? | Rationale |
|---|---|---|
| Hand-soldering THT pins | Yes (4-spoke) | Prevents cold joints |
| SMD pads, hand-solder | Yes (2-spoke) | Thermal balance |
| SMD pads, reflow oven | No (solid) | Solder wicks to pad; no joint quality issue |
| Thermal pad (exposed, reflow) | No | Maximum thermal conductivity to plane |
| High-current power tabs | No | Thermal resistance directly impacts FET Tjunction |

---

## 3. Component Selection

### Sourcing Hierarchy

```
1. Primary (preferred):   Manufacturer part → authorized distributor (Mouser, DigiKey, RS Components SA)
2. Secondary:             Equivalent from alternate manufacturer (same pinout, electrical spec)
3. Alternate (last):      Generic unbranded (passives only — resistors, capacitors from JLCPCB Basic)
```

Never substitute active ICs (MCUs, regulators, RF modules) with generics. Silicon fakes are common on AliExpress; failures occur at production, not prototype stage.

### JLCPCB / PCBWay Part Selection

JLCPCB categorises components as Basic or Extended:

| Category | Assembly surcharge | Strategy |
|---|---|---|
| Basic | None | Prefer for passives, common ICs (AMS1117, CH340, common STM32 variants) |
| Extended | ~$3/unique part setup fee | Minimise; consolidate to ≤5 extended parts per board |

Check stock levels before BOM submission. JLCPCB stock fluctuates; pin down C and R values to JLCPCB Basic catalogue. For the SA market, LCSC is JLCPCB's sister site — cross-reference part numbers directly.

### Local SA Sourcing

| Supplier | Strengths | Weakness |
|---|---|---|
| RS Components SA (rsonline.co.za) | Wide industrial range, next-day JHB/CPT, genuine stock | Premium pricing |
| Communica (communica.co.za) | Maker/hobbyist, dev boards, RF modules, wire | Limited industrial grade |
| Mantech Electronics (mantech.co.za) | Semiconductors, passives, test equipment | Web catalogue can be outdated |
| Electrocomp (electrocomp.co.za) | Connectors, enclosures, cable assembly | Limited active components |

Import route: DigiKey/Mouser ship to ZA (DHL 3–5 days); budget 15% import duty + 15% VAT on declared value. Factor into unit economics from BOM v1.

### Component Footprint Verification

Before placing any new component:
1. Download manufacturer reference footprint (IPC-7351B compliant).
2. Cross-check courtyard against datasheet package drawing.
3. Verify pad pitch with calipers on a physical sample (fake or incorrect packages exist).
4. Confirm 3D model clearance in assembly stack.
5. Solder mask expansion: 0.05 mm per side standard; 0 mm for fine-pitch QFN (<0.5 mm pitch).

### Tolerance Stacking

Critical for:
- Resistor dividers (voltage reference accuracy = sum of individual tolerances).
- RC filter cutoff frequency (`fc = 1/(2πRC)` — 5% R + 5% C = up to 10% fc variation).
- Crystal loading capacitors (use 1% if `CL` spec is tight).

For production: use 1% resistors throughout signal chains. 5% is acceptable for current limiting, pull-up/pull-down only.

### Operating Temperature Range — SA Climate

SA ambient: coastal +25–35°C, Highveld +15–35°C summer, Karoo/Limpopo up to +45°C ambient. Enclosure internal temperature adds 10–20°C above ambient (solar loading on plastic/metal IP67 enclosures tested at +60°C internal).

| Spec range | Use case |
|---|---|
| Commercial (0°C to +70°C) | Indoor only, climate-controlled |
| Industrial (−40°C to +85°C) | Outdoor, direct sun, unventilated enclosures |
| Automotive (−40°C to +125°C) | Engine bay, exhaust-adjacent; also mining environments |

Default for SA outdoor IoT: **industrial grade**. JLCPCB Extended parts often lack industrial-rated stock; design passives to commercial rating (ceramic caps retain spec over full industrial range if correctly derated).

### RoHS Compliance

All PCBs for EU market (or EU-traceable supply chains) must be RoHS-compliant: no lead, cadmium, mercury, hexavalent chromium. JLCPCB lead-free HASL and ENIG finishes are compliant by default. Request RoHS compliance documentation from assembly house for regulatory submissions.

---

## 4. Signal Integrity

### Transmission Line Effects

A trace behaves as a transmission line when its propagation delay exceeds 1/6 of the signal rise time. Rule of thumb:

```
Length threshold: L_crit = T_rise × (c / sqrt(ε_r)) / 6
```

For FR4 (ε_r ≈ 4.5), propagation speed ≈ 141 mm/ns. Example for 5 ns rise time:

```
L_crit = 5 ns × 141 mm/ns / 6 ≈ 118 mm
```

Traces shorter than 118 mm are electrically short for 5 ns signals. For 1 ns (fast MCU GPIOs): ~23 mm. For 100 ps (USB 3.0/LVDS): ~2.3 mm — every trace is a transmission line.

Also check: trace length vs λ/10 at operating frequency:

| Frequency | λ in FR4 | λ/10 threshold |
|---|---|---|
| 100 MHz | 1410 mm | 141 mm |
| 2.4 GHz | 58.7 mm | 5.9 mm |
| 5 GHz | 28.2 mm | 2.8 mm |

RF traces at 2.4 GHz: even a 6 mm trace needs impedance control.

### Termination Strategies

| Type | Topology | When to use |
|---|---|---|
| Series | R (22–50 Ω) inline at source | Short/medium PCB traces, reduces ringing |
| Parallel | R to GND at receiver | Long backplanes, high-speed buses |
| Thevenin | R to V+ and R to GND split | When matched impedance AND DC bias needed |
| AC | R + C to GND | Reduces DC power loss vs parallel; AC only |

For MCU GPIO driving a trace < 50 mm at < 50 MHz: series 22 Ω at source is sufficient. For SPI buses > 100 MHz: match trace impedance (50 Ω), series terminate at source.

### Differential Signalling

| Standard | Impedance | Voltage swing | Max distance |
|---|---|---|---|
| CAN 2.0 / FD | 120 Ω | 1.5–3.5 V | 40 m at 1 Mbps |
| RS-485 | 120 Ω | ±1.5–5 V | 1200 m at 100 kbps |
| USB 2.0 (FS/HS) | 90 Ω | 0.2–0.4 V | <5 m (cable) |
| I2S / PDM audio | 50 Ω single-ended | Logic level | PCB only |

Layout rules for differential pairs:
- Match length within 0.1 mm for USB; within 1 mm for CAN/RS-485.
- Route pairs as coupled microstrips: gap = trace width (for 90 Ω differential on 4L).
- Keep pair together — no splitting at vias (use two adjacent vias, close stitch to reference plane on both sides).
- No 90° bends. Use 45° or curved routing.

### Eye Diagram Basics

An eye diagram overlays successive bit periods. Key measurements:

| Parameter | Threshold | Degradation cause |
|---|---|---|
| Eye height | > 70% of swing | Noise, ISI, reflections |
| Eye width | > 70% of UI | Jitter, skew |
| Crossing percentage | 45–55% | Asymmetric rise/fall |
| Rise/fall time | < 35% of UI | Driver strength, load capacitance |

Use oscilloscope infinite persistence or BERT for qualification. For CAN FD at 5 Mbps, request eye diagram from the board level (scope probe at far-end node) before production sign-off.

### Crosstalk Mitigation

**3W rule:** maintain centre-to-centre spacing of 3× trace width between parallel high-speed traces.

```
If trace width = W, then spacing S ≥ 2W (edge-to-edge) = 3W centre-to-centre
```

Additional measures:
- Route high-speed signals perpendicular on adjacent layers (avoid parallel routing on L1/L3 with no solid reference in between).
- Insert a ground trace (guard trace) between two sensitive parallel signals.
- Keep sensitive analog signals (ADC input, audio) orthogonal to digital buses.

### Ferrite Beads for EMI Filtering

Ferrite bead selection: `Z` at 100 MHz is the key spec, not DC resistance.

| Application | Z at 100 MHz | DC current |
|---|---|---|
| MCU VDD decoupling | 600 Ω | 500 mA |
| USB VBUS filtering | 2200 Ω | 500 mA |
| Audio supply isolation | 600 Ω | 100 mA |
| Antenna VCC | 120 Ω | 50 mA |

Schematic model: `L_bead` (inductance) + `R_dc` in series. At high frequency the resistive component dominates — energy is dissipated, not reflected. Avoid ferrite beads with impedance peak below your EMI frequency of concern.

---

## 5. EMC/EMI Design

### Conducted vs Radiated Emissions

**Conducted:** disturbances on power/signal cables, measured at the EUT power port. Limits: CISPR 22 Class B (for residential/commercial products), FCC Part 15B, EN 55032.

**Radiated:** electric/magnetic field emissions from the EUT. Measured at 3 m or 10 m anechoic chamber. CISPR 32 Class B limits at 30 MHz–1 GHz.

Root cause mapping:

| Source | Conducted? | Radiated? |
|---|---|---|
| SMPS switching noise | Yes (primary) | Via cables acting as antennas |
| Fast digital edges on long traces | No | Yes (loop antenna) |
| RF module harmonics | No | Yes |
| Common-mode currents on cables | Yes | Yes |

### ICASA Type Approval (South Africa)

ICASA = Independent Communications Authority of South Africa. Mandatory for any product with intentional RF transmitters (BLE, Wi-Fi, LoRa, LTE) sold or marketed in SA.

Key points:
- Use a pre-certified RF module (e.g., u-blox NINA-W10x, Espressif ESP32-S3 certified variant, Nordic nRF9160 DK certified module) — the module's ICASA approval number transfers to your end product if used within the certified configuration.
- If custom RF frontend: full ICASA homologation required (~R150 000–R300 000 lab + fees, 6–12 month lead time).
- ICASA registration: apply through an approved test lab (Bureau Veritas ZA, SGS SA, SABS) after FCC/CE pre-certification tests pass.
- Required marking: ICASA approval number on product label or PCB silk screen.

### FCC Part 15 / CE Marking

| Standard | Applies when |
|---|---|
| FCC Part 15B | Unintentional radiators, US market |
| FCC Part 15C | Intentional radiators (RF transmitters), US market |
| EN 55032 / CISPR 32 | Emissions, EU (CE mark) |
| EN 55035 / CISPR 35 | Immunity, EU (CE mark) |
| EN 301 893 / EN 300 328 | Wi-Fi, BLE radio standards (EU R&TTE/RED) |

Design to CE limits from day one — they are more stringent than FCC for most frequency bands.

### Shielding Options

| Method | Attenuation | Cost | Use case |
|---|---|---|---|
| PCB ground pour (flood) | 6–10 dB | Zero | Baseline; always implement |
| PCB shield can (solderable) | 20–40 dB | Low (Harting, Würth Electronik) | BLE/Wi-Fi module isolation |
| Metal enclosure (Al/steel) | 40–80 dB | Medium | Full product shielding |
| µ-metal enclosure liner | >80 dB @ <1 MHz | High | DC/low-frequency magnetic shielding |

For IoT nodes: PCB-level shield cans around RF modules are the most common and cost-effective approach. Tin-plate cans with PCB castle walls and snap-on lids from Würth (ref: 36100009) are production-friendly.

### Common-Mode Choke Placement

Place on cable interfaces (USB, Ethernet, RS-485) to attenuate common-mode noise:

```
Cable connector → Common-mode choke → ESD TVS → IC
```

Selection: common-mode impedance > 1 kΩ at 100 MHz; differential-mode impedance < 5 Ω (to avoid signal distortion). Würth 744235680 series or Murata DLW5BTM series for USB and RS-485.

### Spread-Spectrum Clocking

SMPS controllers with spread-spectrum modulation (e.g., TPS62xxx SSFM variants) spread switching noise across ±4–6% of `f_sw`, reducing peak emissions by 10–15 dB. Enable SSFM on the regulator if a SSC-capable part is available. Trade-off: slightly increased output ripple (verify against load requirement).

### PCB Design Checklist for Pre-Compliance

Before sending boards for pre-compliance:

- [ ] All power rails decoupled at every IC VDD pin
- [ ] SMPS switching loop area minimised (inductor, diode, input cap in tight triangle)
- [ ] Ground plane continuous under all high-speed traces
- [ ] Via stitching on ground pour at λ/20 spacing for highest frequency
- [ ] Cable connectors have common-mode chokes
- [ ] RF module antenna keepout enforced (no copper flood)
- [ ] Crystal guard ring connected to GND, no signal routing underneath
- [ ] Ferrite beads on all external-facing power lines
- [ ] Shield can pads present (even if not populated initially)
- [ ] Test points on USB D+/D− and power rails for conducted measurements

---

## 6. Power Distribution

### LDO vs Switching Regulator Trade-offs

| Parameter | LDO | Buck Converter |
|---|---|---|
| Efficiency | (Vin/Vout) × Iout / Iin — poor at high drop | 85–95% typical |
| Noise | Very low (PSRR 60–80 dB) | Higher (switching ripple) |
| Quiescent current | 1 µA–1 mA (typ) | 10–100 µA (PFM mode) |
| Cost | Low | Medium |
| BOM complexity | 1–3 components | 4–8 components |
| Suitable for | Low ΔV (<500 mV), low Iout (<200 mA), noise-sensitive analog | High ΔV, high Iout, battery-powered |

For battery applications: use a buck converter on the main 3.3 V rail; LDO post-regulators for analog and RF supplies.

### Buck Converter Design

**Inductor sizing:**

```
L = Vout × (1 - D) / (ΔI × fs)
```

Where:
- `D = Vout / Vin` (duty cycle, ideal)
- `ΔI = 30–40% of Iout_max` (target ripple current)
- `fs` = switching frequency (Hz)

Example: 5 V → 3.3 V, 500 mA load, 1 MHz switching:

```
D = 3.3/5 = 0.66
ΔI = 0.3 × 0.5 = 0.15 A
L = 3.3 × (1 - 0.66) / (0.15 × 1,000,000) = 1.122 × 10⁻⁵ H ≈ 10 µH
```

Choose 10 µH with `Isat > 1.5 × Iout_max` and `Irms > Iout_max`. For DCM/CCM boundary at light load, use the IC's datasheet compensation procedure.

**Output capacitor ESR:**

Low ESR is critical. MLCC (X5R, 47–100 µF at output) provides low ESR. Electrolytic caps have higher ESR — check ripple current rating. Target output ripple:

```
ΔVout ≈ ΔI × ESR + ΔI × (1 - D) / (8 × Cout × fs)
```

Keep `ΔVout < 1% Vout` for MCU rails.

**Bootstrap circuit:** Most integrated buck controllers (TPS62xxx, LMR36006, MP2315) include internal bootstrap capacitor. Add 100 nF X7R from `BST` to `SW` pin as specified in datasheet.

### Power Sequencing

For systems with multiple rails (V3V3 + V1V8 + VCORE):

**Hard sequencing:** Enable pin of downstream rail driven by PG (power good) of upstream rail.

```
V3V3 PG ──→ EN of V1V8 regulator
V1V8 PG ──→ EN of VCORE regulator
```

**Soft sequencing:** Adjustable soft-start resistor staggers ramp times. Less precise but acceptable for most MCU + memory combinations where sequencing is simply "simultaneous or V3V3 first."

Power supervisor ICs (TPS3431, MAX16047) handle multi-rail monitoring with configurable sequence timing — use for 4+ rail systems.

### Inrush Current Limiting

Bulk capacitors cause inrush current at power-on: `I_inrush = C × dV/dt`. For 100 µF and 5 V in 100 µs: 5 A peak. This can blow polyfuses and trip current-limited bench supplies.

Solutions:
- **NTC thermistor** (simple, passive): resistance high on cold start, drops as it warms. Limitation: does not recover instantly; slow repeat hot-start.
- **RC soft-start on enable pin:** ramp EN voltage slowly → soft-start ramp on regulator.
- **Dedicated inrush controller** (TPS2490, LTC4364): active limiting, ideal for 24 V industrial inputs.

### Reverse Polarity Protection

| Method | Voltage drop | Cost | Note |
|---|---|---|---|
| Series Schottky diode | 0.2–0.5 V | Very low | Power loss = Vf × Iload |
| P-channel FET | 5–50 mV | Low | Gate driven by source-to-drain diode; add 100 kΩ gate-source R |
| Ideal diode controller | <10 mV | Medium | Requires additional IC (LTC4412, MAX40200) |

For battery-powered IoT: P-FET with gate tied to GND through 100 kΩ is the standard. Forward direction: FET conducts when Vsource > Vdrain (body diode conducts first, gate biases FET on). Reverse: gate-source forward biased, FET off.

```
VBAT+ ── Source ─[P-FET]─ Drain ── VIN
             |
            GND via 100 kΩ (gate pull-down)
```

---

## 7. Design for Manufacture (DFM)

### Minimum Trace/Space Rules by Process

| Fab process | Min trace | Min space | Min via drill | Typical supplier |
|---|---|---|---|---|
| JLCPCB Standard | 0.127 mm | 0.127 mm | 0.3 mm | JLCPCB |
| PCBWay Standard | 0.1 mm | 0.1 mm | 0.2 mm | PCBWay |
| Advanced (HDI) | 0.075 mm | 0.075 mm | 0.1 mm (laser) | Sierra, Würth, local: none |
| Local ZA (Circuit.co.za) | 0.15 mm | 0.15 mm | 0.4 mm | Circuit.co.za |

Design to JLCPCB Standard unless HDI is non-negotiable. HDI adds cost and 3–5 day lead time; rarely justified for IoT sensor nodes.

### SMD vs THT Trade-offs

| Factor | SMD | THT |
|---|---|---|
| Assembly cost (JLCPCB PCBA) | Low (standard AOI + reflow) | High (wave solder or hand) |
| Mechanical strength | Low (solder only) | High (lead clinch) |
| Repairability in field | Difficult without hot air | Easy |
| Suitable for | All production ICs, passives | Connectors, high-current terminals, user-accessible ports |

Hybrid: use SMD throughout; THT for USB-B, barrel jacks, screw terminals, and any connector subject to mechanical stress.

### Panelisation Strategies

| Method | Use case | Note |
|---|---|---|
| V-score | Rectangular PCBs | Fab scores panel; boards snap apart. 5 mm rail each side |
| Tab-routed (mouse-bites) | Irregular shapes | 0.5 mm tabs with perforated holes; clean with file |
| Mixed (V-score + tabs) | Rectangular with protruding connectors | Most flexible |

Panel design rules:
- 5 mm border rail for conveyor support.
- Fiducial marks: minimum 3 per panel (top-left, top-right, bottom-left or bottom-right). Fiducial: 1 mm Cu circle, 3 mm copper-free keepout, on paste mask layer.
- Tooling holes: 4× 3.2 mm NPTH in corners of rails.
- Panel size: JLCPCB max 480 × 480 mm; optimal 250 × 250 mm for SMT tray compatibility.

### Testpoint Placement

| Test method | TP requirement | Note |
|---|---|---|
| Bed-of-nails ICT | 1.0 mm TP pads, 2.54 mm grid | Grid constraint driven by fixture pin pitch |
| Flying probe | 0.8 mm TP pads, any placement | Less rigid constraint, slower throughput |
| JTAG/SWD | 2.54 mm 5-pin header footprint | DNP in production, populated for bring-up |
| Manual clip | 1.5 mm TP pads on power rails | Accessible from board edge |

Mandatory test points: VBUS, VIN, V3V3, V1V8, GND, SWDIO, SWDCLK, UART_TX, UART_RX. Label each with silk screen reference.

### BOM Management

BOM must contain at minimum:

| Column | Content |
|---|---|
| Reference Designator | R1, C12, U3 |
| Quantity | Per board |
| Value | 10 kΩ, 100 nF, AMS1117-3.3 |
| Package/Footprint | 0402, 0805, SOT-223 |
| Manufacturer | Vishay, Murata, Diodes Inc |
| Manufacturer PN | CRCW040210K0FKED |
| Supplier | RS, Mouser, LCSC |
| Supplier PN | 822-CRCW040210K0F |
| JLCPCB Part# | C25744 |
| Notes | DNP / Alternate / Critical |

Maintain a parallel "sourcing BOM" with pricing at 100/500/1000 unit breaks. Update before each production run — passive pricing shifts quarterly.

### IPC Class Distinction

| Class | Description | SA context |
|---|---|---|
| Class 1 | General electronics — consumer, short life | Hobbyist, throwaway IoT |
| Class 2 | Dedicated service — industrial IoT, meters | Default for commercial IoT products |
| Class 3 | High reliability — medical, aerospace, defence | Mining safety systems, medical devices |

Specify IPC Class 2 as minimum in fab notes. It requires: no defective solder joints, no lifted pads, 75% solder coverage on SMD pads. JLCPCB PCBA default is Class 2.

---

## 8. Hardware Bring-Up

### Power-On Sequence Checklist

Before first power:
- [ ] Visual inspection: component orientation on polarity-sensitive parts (electrolytics, diodes, ICs pin 1)
- [ ] Continuity check: GND rail to all expected ground pads (DMM buzzer)
- [ ] Short-circuit check: measure resistance VIN to GND — should be >10 kΩ (bulk cap leakage) not < 1 Ω
- [ ] Verify bulk cap polarity (electrolytic: positive stripe to positive rail)
- [ ] Confirm crystal installed (not a 0 Ω short in error)
- [ ] Check BOM against silk screen: all DNP pads empty

### First Power-On Safety

Use a current-limited bench supply, not the production power source.

```
Procedure:
1. Set bench PSU to design Vin (e.g., 5.0 V)
2. Set current limit to 50 mA (below any expected operating current)
3. Connect, observe current draw:
   - < 5 mA: quiescent OK, rails likely correct
   - 20–50 mA: possible short or regulator startup issue — measure rails before proceeding
   - Hits 50 mA limit: short present. STOP. Inspect.
4. Raise current limit to 2× expected operating current
5. Proceed to rail verification
```

The bench PSU current limit is your smoke-test safety net. Never skip it on first board.

### Voltage Rail Verification

Measure each rail against GND with a DMM before connecting any external device or programmer:

| Rail | Expected | Tolerance |
|---|---|---|
| VIN | Vin − Vf(protection) | ±2% |
| V3V3 | 3.30 V | ±3% (3.20–3.40 V) |
| V1V8 | 1.80 V | ±2% (1.76–1.84 V) |
| VBAT_SENSE | Divided from VBAT | Per divider ratio |

If V3V3 reads 2.8 V: LDO may be in dropout (Vin too low), or load is too high (short on V3V3 net). Disconnect load, retest.

### JTAG/SWD Connection

SWD minimum 4 wires: SWDIO, SWDCLK, GND, V3V3 (target reference). Optional: SWO (trace output), RESET.

```
J-Link or ST-Link pinout → board SWD header
SWDIO  → MCU SWDIO
SWDCLK → MCU SWDCLK
GND    → GND
VTref  → V3V3 (reference, not power source — do not power board from programmer)
```

Confirm target detected in OpenOCD / STM32CubeIDE / nRF Connect before flashing. If "No target found": check SWD pull-ups (SWDIO needs 10 kΩ pull-up; SWDCLK no pull needed), verify SWD not shared with alternate function enabled in bootloader.

### Oscilloscope Probing for Signal Integrity

| Signal | Probe setup | Look for |
|---|---|---|
| SMPS switching node | 10× probe, 200 MHz BW, ground spring (not clip lead) | Ringing > 20% of switching voltage |
| SPI clock | 10× probe, 500 MHz BW | Edge cleanliness, 45%–55% duty cycle |
| CAN bus | Differential probe or 2-ch math (CH1 − CH2) | Eye opening, recessive/dominant levels |
| I2C | Single-ended, 100 MHz BW | Rise time, stretch events, ACK bits |
| Crystal oscillator | 10× probe on OSC_IN | Startup transient, steady-state amplitude |

Ground lead length dominates probe parasitic inductance. Use the shortest ground return possible — probe tip ground spring at 1 cm beats a 15 cm clip lead at 100 MHz every time.

### Thermal Imaging for Hotspots

After 10–30 minutes of operation at rated load, use a FLIR Lepton or FLIR C3 (or RS Components SA stocks FLIR TG165) for IR scan:

| Component | Expected temp rise above ambient | Action if exceeded |
|---|---|---|
| LDO regulator | < 40°C (dependent on ΔV and Iout) | Add heatsink, increase copper pour, or switch to buck |
| Buck converter FET/diode | < 30°C | Verify inductor saturation, switching freq |
| MCU (active) | < 25°C | Verify clock speed, sleep modes, short-circuit |
| Current sense resistor | < 20°C | Verify power dissipation: P = I² × R |
| PCB trace | < 10°C | Trace underrated for current; widen or add copper pour |

Any component exceeding 85°C junction temperature requires re-design before production release.

### Common Failure Modes

| Failure | Symptom | Diagnosis |
|---|---|---|
| Component reverse orientation | Rail short, smoke | DMM before power; visual check pin 1 |
| Tombstoning (0402 passives) | One pad lifts during reflow | Unequal pad thermal mass; adjust stencil aperture |
| Cold solder joint | Intermittent connectivity | Visual at 10× loupe; reflow with flux |
| Wrong footprint (package mismatch) | Physical misalignment | Footprint audit vs physical part before layout |
| Missing/wrong value | Incorrect voltage / no oscillation | BOM audit; measure in-circuit |
| ESD damage (latent) | Works at test, fails in field | Improve ESD handling; add TVS at ports |
| Floating BOOT pins | MCU in wrong boot mode | Pull-up/down all BOOT/MODE pins at schematic stage |
| Ferrite bead saturation | Regulator instability under load | Check Idc rating vs actual load current; replace with rated part |
| Via not tented on bottom | Short to conductive enclosure | Specify tented vias in fab notes for bottom-side vias near connectors |

---

## Quick-Reference Tables

### Common IoT MCU SWD/JTAG Pinouts

| MCU family | SWDIO | SWDCLK | SWO | RESET |
|---|---|---|---|---|
| STM32 (all) | PA13 | PA14 | PB3 | NRST |
| nRF52840 | P0.18 (SWDIO) | P0.19 (SWDCLK) | — | P0.21 |
| ESP32-S3 (JTAG) | GPIO46 (TMS) | GPIO3 (TCK) | — | EN |
| RP2040 | SWDIO | SWDCLK | — | RUN |

### Decoupling Capacitor Quick Reference

| Supply voltage | Bulk cap | High-freq caps |
|---|---|---|
| 5 V (VBUS) | 47 µF X5R | 100 nF + 10 nF per IC |
| 3.3 V (V3V3) | 10–22 µF X5R | 100 nF + 10 nF per IC |
| 1.8 V (V1V8) | 4.7–10 µF X5R | 100 nF per IC |
| Analog (AVDD) | 10 µF tantalum | 100 nF + 1 nF per ADC pin |

### JLCPCB PCB Spec Cheat Sheet

| Parameter | Standard spec |
|---|---|
| Min trace/space | 0.127 mm / 0.127 mm |
| Min drill (PTH) | 0.3 mm |
| Min annular ring | 0.13 mm |
| Copper weight | 1 oz (35 µm) standard |
| Surface finish | HASL (lead-free) or ENIG (+cost) |
| Solder mask | Green standard; others +lead time |
| Silk screen | White on green, min text 0.8 mm height |
| Board thickness | 1.6 mm standard |
| Max board size | 500 × 500 mm |
