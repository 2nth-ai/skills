---
name: Power Systems & Energy Management
description: >
  Power architecture for IoT devices — battery selection, energy harvesting,
  load shedding-resilient design, regulators, BMS, and ultra-low-power budgeting.
requires:
  - iot/hardware
improves: []
metadata:
  domain: iot
  subdomain: power
  maturity: stable
---

# Power Systems & Energy Management

Power is the constraint that defines IoT design. A device that runs out of battery, dies during load shedding, or draws too much current to run from a solar panel is a failed deployment regardless of its features. Design power first.

---

## Power Budget — Start Here

Before selecting any component, build the power budget:

```
Average Current (mA) = Σ [ Component_current(mA) × Duty_cycle(%) ]

Battery life (hours) = Battery_capacity(mAh) / Average_current(mA)
```

### Example Budget: LoRaWAN soil moisture sensor

| State | Current | Duty Cycle | Contribution |
|-------|---------|------------|-------------|
| Deep sleep (MCU + sensor off) | 8 µA | 99.7% | 7.98 µA |
| Sensor wake + measurement | 3.2 mA | 0.1% | 3.2 µA |
| LoRa TX (SF9, +14dBm) | 38 mA | 0.05% | 19 µA |
| LoRa RX window | 11 mA | 0.15% | 16.5 µA |
| **Average** | | | **~47 µA** |

With 3× AA alkaline (6,000 mAh usable after Peukert): **~14.5 years** — theoretical. Real-world target: 5–7 years after derating for temperature, self-discharge, and Peukert losses.

---

## Battery Technologies

### Primary (Non-Rechargeable)

| Chemistry | Voltage | Energy Density | Temp Range | Self-Discharge | Best For |
|-----------|---------|---------------|------------|----------------|---------|
| **Alkaline (AA/AAA)** | 1.5V | 150 Wh/kg | −20°C to +55°C | ~2%/year | Low-cost indoor sensors |
| **Lithium AA (LiFeS₂)** | 1.5V | 300 Wh/kg | −40°C to +60°C | ~1%/year | Outdoor; wide temp range |
| **Li-SOCl₂ (ER26500)** | 3.6V | 500 Wh/kg | −60°C to +85°C | <1%/10 years | Industrial; 10yr deployments |
| **Li-MnO₂ (CR2032)** | 3V | 270 Wh/kg | −30°C to +70°C | <1%/year | Small coin cell; BLE beacons |

**Li-SOCl₂ passivation**: These cells form a passivation layer at rest, causing a voltage drop on first pulse. Use a supercapacitor in parallel to handle transmit pulses — critical for LoRa and NB-IoT which have high instantaneous current peaks (100–500mA).

```
Li-SOCl₂ cell → 10Ω series resistor → 1F supercapacitor
                                            ↓
                                        MCU + Radio
```

### Rechargeable

| Chemistry | Nominal V | Capacity (typical) | Cycle Life | Temp (charging) | Notes |
|-----------|----------|-------------------|-----------|-----------------|-------|
| **LiPo / Li-ion** | 3.7V | 100–10,000 mAh | 300–500 | 0°C to +45°C | Most IoT devices; requires BMS |
| **LiFePO₄** | 3.2V | 500–5,000 mAh | 2,000+ | −10°C to +45°C | Safer; longer cycle life; lower energy density |
| **NiMH** | 1.2V | 600–3,000 mAh | 500–1,000 | 0°C to +40°C | Robust; wide temp; simple charging |
| **Lead Acid** | 12V | 7–200 Ah | 200–500 | 0°C to +40°C | UPS/backup; heavy; cheap; tolerates abuse |
| **Supercapacitor** | 2.7V | 1–100F | 500,000+ | −40°C to +70°C | Pulse buffering; not for storage |

---

## Battery Management Systems (BMS)

Any LiPo/Li-ion deployment requires a BMS for:

### BMS Functions

| Function | Why Critical |
|----------|-------------|
| **Overvoltage protection** | Li-ion above 4.2V → thermal runaway → fire |
| **Undervoltage cutoff** | Below 2.5V → irreversible capacity loss |
| **Overcurrent protection** | Short circuit → heating → fire |
| **Temperature monitoring** | No charging below 0°C or above 45°C |
| **Cell balancing** (multi-cell) | Prevents weakest cell from limiting pack |
| **State of Charge (SoC)** | Coulomb counting + OCV lookup |

### Common BMS ICs

| IC | Cells | Features | Notes |
|----|-------|---------|-------|
| TP4056 | 1S | Charge only; 4.2V, 1A max | Ubiquitous; no protection — add DW01A |
| MCP73831 | 1S | Charge only; 4.2V or 4.35V; 500mA | Low cost; compact |
| BQ25895 | 1S | Charge + OTG + boost; 5A; I²C | Feature-rich; USB-PD input |
| BQ76920 | 3–5S | AFE; protection; SoC via host | Industrial; pairs with MCU for full BMS |
| MAX17048 | 1S | Fuel gauge (ModelGauge); SoC/SoH; I²C | Excellent SoC accuracy; 3µA quiescent |

---

## Energy Harvesting

When no battery replacement is acceptable or the deployment is in an unreachable location.

### Solar

**Sizing formula**:
```
Panel power (W) = Average_load(W) × Hours_per_day / (PSH × η_system)

PSH = Peak Sun Hours (SA average: 5.5–6.0 h/day coastal; 5.0–5.5 inland)
η_system = charge controller efficiency × battery efficiency (typically 0.75–0.85)
```

**Example**: 50mA average load, 3.3V system, SA inland site
```
Load = 0.05A × 3.3V = 165mW = 0.165W
Panel = 0.165W × 24h / (5.5h × 0.80) = 0.9W → use 1–2W panel with margin
```

**SA solar resource**: South Africa has some of the best solar irradiance globally (Northern Cape 6+ PSH/day). Even in winter (Highveld: ~4.5 PSH), solar is viable for low-power IoT.

**MPPT vs PWM charge controller**:
- PWM: simple, cheap, wastes panel capacity below battery voltage — avoid on small systems
- MPPT: tracks maximum power point, 15–30% more energy extracted, required for any serious deployment

**Cold start problem**: System must start from a fully discharged state (no battery, no supercap). Add a comparator that prevents MCU boot until panel output is sufficient.

### Thermal (TEG)

Seebeck effect: ΔT of 10°C → ~10–50mV (module-dependent). Useful in: industrial pipes, machinery, geothermal vents. Requires ΔT > 5°C sustained. Output power: µW to mW range. Use a boost converter (BQ25504) with minimum start voltage as low as 130mV.

### Vibration / Piezoelectric

Cantilever piezo harvesters: 10–1,000 µW from sustained vibration. Frequency must match mechanical resonance (typically 50–200 Hz). Practical for: rotating machinery monitoring, rail vibration, HVAC fans.

### RF Energy Harvesting

Rectenna harvesting from ambient RF (GSM, WiFi). Power: 1–100 µW at typical urban RF density. Only viable for ultra-ultra-low-power sensors with months between readings. Not reliable as primary power.

---

## Voltage Regulation

### LDO (Low-Dropout Regulator)

```
Efficiency = Vout / Vin  (best case — ignores quiescent current)
Power dissipated = (Vin - Vout) × Iload
```

| IC | Vin | Vout | Iq | Notes |
|----|-----|------|----|-------|
| MCP1700 | 2.3–6V | Adj | 1.6 µA | Ultra-low Iq; ideal for battery |
| LP5907 | 2.2–5.5V | Fixed/Adj | 75 µA | Low noise; RF applications |
| AMS1117 | 4.75–15V | 3.3V/5V/Adj | 5 mA | Common, cheap; poor Iq |
| TPS7A02 | 1.4–5.5V | Adj | 25 nA | Record-low Iq; 200mA |

**When to use LDO**: Small voltage drop (Vin−Vout < 1V), low current (<100mA), noise-sensitive (RF, ADC), simplicity.

**When NOT to use**: Large input-output differential with significant load — heat becomes a design problem. Switch to buck converter.

### Buck (Step-Down) Switching Regulator

Inductor sizing:
```
L = (Vin - Vout) × Vout / (ΔIL × fs × Vin)

ΔIL = ripple current (typically 20–40% of Iload)
fs = switching frequency
```

Output capacitor for stability:
```
Cout_min = ΔIL / (8 × fs × ΔVout)
ESR < ΔVout / ΔIL
```

| IC | Vin | Vout | Iq | fs | Notes |
|----|-----|------|----|----|-------|
| TPS62840 | 1.8–6.5V | 0.4–3.3V | 60 nA | 4 MHz | Ultra-low Iq; IoT goldstandard |
| RT9013 | 2.2–5.5V | Adj | 55 µA | | Actually LDO — common confusion |
| SY8009A | 2.5–5.5V | 0.6–5V | 40 µA | 1.5 MHz | Cheap; JLCPCB basic part |
| MAX17222 | 0.7–5.5V | Adj | 300 nA | 4 MHz | Nano-power boost/buck |

---

## Load Shedding-Resilient Power Design

South Africa's load shedding (up to Stage 8: 8–12h/day without power) demands that IoT devices designed for grid-connected deployments handle extended grid outages.

### Design Strategies

| Strategy | Complexity | Cost | Best For |
|----------|-----------|------|---------|
| **Battery backup only** | Low | Low | Sensors; < 4h runtime needed |
| **Battery + MPPT solar** | Medium | Medium | Outdoor; extended outages; remote |
| **UPS topology (mains + battery)** | Medium | Medium | Indoor; permanent infrastructure |
| **Supercapacitor bridge** | Low | Low | Short outages (< 30min); ride-through |
| **Generator input** | Low (device side) | High (generator) | Critical infrastructure; data centres |

### UPS Design for IoT Gateway

```
Mains (230V AC)
    → AC/DC adapter → 12V or 5V DC bus
                           ↓
                    Ideal diode OR        ← Battery (LiFePO₄ or SLA)
                    Power path controller     charged by charger IC
                           ↓
                    5V → 3.3V (LDO)
                           ↓
                    MCU + Radio + Sensors
```

Key ICs for seamless switchover:
- **BQ24650** — MPPT solar charger; 26V input; 1A–10A charge current; accurate voltage regulation
- **LTC4412** — ideal diode controller; near-zero forward drop; automatic switchover
- **MCP73213** — dual-cell Li-ion charger with input overvoltage protection

### Load Shedding Schedule Awareness

Integrate the Eskom load shedding schedule API into IoT gateway firmware:
- Fetch schedule for the device's supply area (suburb → area code)
- Pre-charge to 100% before expected outage
- Reduce transmit frequency during battery operation to extend runtime
- Alert platform when battery drops below threshold
- Resume normal operation on mains restoration

**SA load shedding API sources**: EskomSePush API (community-maintained), loadshedding.eskom.co.za (official but unreliable), municipalities publish their own schedules.

---

## Power Measurement & Profiling

You cannot optimise what you cannot measure.

### Hardware Tools

| Tool | Range | Resolution | Cost | Notes |
|------|-------|-----------|------|-------|
| **nRF PPK2** (Nordic Power Profiler Kit 2) | 800nA–1A | 1 µA | ~$40 | Best IoT power tool; USB; nRF Connect app |
| **µCurrent Gold** | 1nA–1A | nA | ~$100 | Shunt-based; use with DMM or scope |
| **Otii Arc** | 0.1µA–5A | 0.1 µA | ~$200 | Simultaneous voltage + current + UART |
| **Keysight N6705C** | µA–20A | nA | >$5,000 | Lab bench; gold standard |
| **INA219 / INA3221** | 0–3.2A | ~1 mA | ~$2 | On-board current sensing; I²C; production monitoring |

### Firmware Power Profiling Pattern

Use a GPIO pin toggled at each power state transition — measure on oscilloscope alongside current:

```c
// Toggle GPIO high before high-power operation
HAL_GPIO_WritePin(PROBE_GPIO, PROBE_PIN, GPIO_PIN_SET);
lora_transmit(packet, len);
HAL_GPIO_WritePin(PROBE_GPIO, PROBE_PIN, GPIO_PIN_RESET);
```

Correlate GPIO trace with current waveform to identify:
- Unexpected wake-ups
- Peripheral not entering sleep
- Transmit current spikes higher than spec
- Sleep current floor higher than expected

---

## Enclosure Thermal Management

Battery and electronics performance degrades at temperature extremes common in SA deployments (outdoor enclosures: −5°C to +70°C; in direct sun: up to +85°C enclosure interior).

### Thermal Rules

- **LiPo charging**: Never charge below 0°C — lithium plating → short circuit risk. Add NTC thermistor in charge controller feedback path.
- **LiPo discharge**: Capacity drops ~20% at 0°C; ~40% at −10°C. Derate battery life calculations for cold climates (Drakensberg, Highveld winter nights).
- **High temperature**: Every 10°C above 25°C halves electrolytic capacitor life. Use polymer capacitors for outdoor designs.
- **Passive thermal dissipation**: Add thermal vias under switching regulators and power FETs. Copper pours on both sides for heat spreading.
- **White enclosures**: Reflective white vs black enclosure reduces internal temperature by 15–20°C in direct sunlight. Critical for solar-powered outdoor nodes.
