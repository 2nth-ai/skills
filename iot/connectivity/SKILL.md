---
name: IoT Connectivity & Protocols
description: >
  Wireless protocol selection (WiFi, BLE, LoRaWAN, Zigbee, NB-IoT, LTE-M, cellular),
  MQTT/CoAP/HTTP, mesh networking, and protocol trade-offs for IoT deployments.
requires:
  - iot/firmware
improves: []
metadata:
  domain: iot
  subdomain: connectivity
  maturity: stable
---

# IoT Connectivity & Protocols

Choosing the wrong radio kills a product. A sensor network that drains batteries in weeks, a mesh that collapses under 50 nodes, or an MQTT broker mis-configured for QoS 2 at 10 000 devices — these are engineering failures that connectivity expertise prevents. This skill equips an agent with the protocol vocabulary, trade-off frameworks, configuration patterns, and SA-specific deployment context needed to make defensible wireless architecture decisions from first prototype to large-scale rollout.

---

## 1. Protocol Selection Matrix

Use this table for first-pass protocol selection. Always validate against the specific deployment constraints (battery budget, data rate, range, cost, spectrum, operator availability) before committing.

| Protocol | Frequency | Range (typical) | Data Rate | Power Profile | Topology | Licensing | Best For | Avoid When |
|---|---|---|---|---|---|---|---|---|
| **WiFi 2.4 GHz** | 2.4 GHz | 30–100 m indoor | Up to 150 Mbps (n) | High (100–300 mA Tx) | Star (AP) | Unlicensed (ISM) | High-bandwidth, mains-powered, existing AP infra | Battery-critical, no AP infra, dense RF environments |
| **WiFi 5 GHz** | 5 GHz | 20–50 m indoor | Up to 3.5 Gbps (ac) | High | Star (AP) | Unlicensed | Video streaming, high-throughput gateways | Range-critical, older hardware, wall penetration |
| **BLE 5.x** | 2.4 GHz | 10–100 m (coded PHY up to 400 m) | 125 kbps–2 Mbps | Very low (µA sleep, ~15 mA Tx) | Point-to-point, mesh | Unlicensed | Wearables, asset tags, proximity, mesh sensor nets | High throughput, > 300 m range without repeaters |
| **LoRaWAN** | AU915 / AS923 (SA) | 2–15 km urban, > 30 km rural LOS | 250 bps–50 kbps | Ultra-low (2–10 µA sleep) | Star-of-stars (via gateway) | Unlicensed (sub-GHz ISM) | Smart meters, agriculture, asset tracking, wide-area low-data | Real-time control, > 50 bytes/msg frequently, high message rate |
| **Zigbee** | 2.4 GHz | 10–100 m per hop | 250 kbps | Low (~30 mA Tx, µA sleep) | Mesh (coordinator/router/end) | Unlicensed | Home automation, building controls, dense sensor grids | Interoperability across vendors without Matter bridge |
| **Z-Wave** | 868 / 908 / 916 MHz (sub-GHz) | 30–100 m per hop | 9.6–100 kbps | Low | Mesh | Unlicensed (sub-GHz) | Home automation, locks, switches (strong interop) | Industrial, > 232 nodes, non-residential |
| **Thread / Matter** | 2.4 GHz | 10–30 m per hop | 250 kbps (IEEE 802.15.4) | Low | IPv6 mesh | Unlicensed | Smart home (Apple/Google/Amazon ecosystem), new product design | Legacy systems, infrastructure without Thread border router |
| **NB-IoT** | LTE bands (B28 in SA) | Cellular coverage | 200 kbps DL / 20 kbps UL | Very low with PSM/eDRX | Star (base station) | Licensed (cellular operator) | Stationary meters, trackers, 10-year battery target | Mobile devices, high message rate, areas without NB-IoT coverage |
| **LTE-M (Cat-M1)** | LTE bands | Cellular coverage | 1 Mbps DL / 1 Mbps UL | Low-moderate | Star (base station) | Licensed (cellular operator) | Mobile assets, firmware OTA, voice + data, medium throughput | Ultra-low-power stationary sensors (NB-IoT better) |
| **4G LTE (Cat-1 / Cat-4)** | LTE bands | Cellular coverage | 10–150 Mbps | Moderate-high | Star (base station) | Licensed | Video, high-data, gateways aggregating local devices | Low-power leaf nodes, cost-sensitive mass deployments |
| **5G (SA/NSA)** | sub-6 GHz / mmWave | Cellular / limited mmWave | 1–10 Gbps theoretical | High | Star (base station) | Licensed | Industrial automation, private 5G campus, URLLC use cases | Low-power IoT, rural deployments, budget-constrained |
| **Sigfox** | 868 MHz (EU), 915 MHz (AU/SA) | 3–50 km | 100 bps UL, 600 bps DL | Ultra-low | Star (base station) | Unlicensed + network service | Ultra-low-power wide-area (12 bytes/msg max) | Two-way heavy, > 140 msg/day, time-sensitive |

### SA-specific Sigfox note

Sigfox coverage in South Africa is operated by **Squidnet** (squidnet.co.za). Coverage is concentrated in Gauteng, Western Cape, and KZN metros. Verify coverage before committing — Squidnet publishes a coverage map. The 12-byte/message UL limit and 4 DL bytes per day make Sigfox viable only for sparse status/alarm use cases.

### Quick decision flowchart

```
Battery-powered AND wide area?
  ├─ Stationary, < 50 bytes, infrequent → LoRaWAN or NB-IoT
  ├─ Mobile, needs ACK, firmware OTA   → LTE-M
  └─ Ultra-sparse, < 12 bytes          → Sigfox

Mains-powered AND short range (< 100 m)?
  ├─ High throughput (video/audio)     → WiFi
  ├─ Low throughput, existing AP       → WiFi (power save mode)
  └─ Dense mesh, building controls     → Zigbee / Thread / Matter

Short range AND battery-powered?
  ├─ Consumer product, ecosystem fit   → BLE 5 or Thread/Matter
  ├─ Asset tracking, proximity         → BLE (iBeacon / Eddystone)
  └─ Industrial mesh, no smartphone    → Zigbee or BLE mesh

Cellular required?
  ├─ > 10 years battery, stationary    → NB-IoT
  ├─ Mobile, OTA, voice                → LTE-M
  └─ Gateway / high throughput         → 4G Cat-1 / Cat-4
```

---

## 2. WiFi Deep Dive

### Provisioning Methods

Provisioning is the most friction-prone step in WiFi IoT. Choose based on product UX constraints:

| Method | How it works | Pros | Cons |
|---|---|---|---|
| **SoftAP** | Device creates its own AP; user connects phone to it, enters credentials via captive portal | Works offline, no app required | Two network switches for user, poor UX on iOS (prompts to leave network) |
| **BLE provisioning** | Device advertises BLE; companion app sends SSID/password over GATT | Smooth UX, no network switching | Requires app + BLE on device |
| **SmartConfig / ESP-NOW** | Router sends encoded SSID/password as broadcast packets; device sniffs promiscuously | No AP mode needed | Works only on 2.4 GHz, unreliable in dense RF, patented variants |
| **QR code** | Device generates QR embedding credentials; phone scans | Zero-touch if AP is pre-configured | Requires camera access, doesn't scale for field provisioning |
| **Enterprise (802.1X / EAP)** | RADIUS server authenticates device certificate | Highest security, IT-friendly | Requires PKI, certificate management, complex firmware |

ESP-IDF recommendation: use `wifi_prov_mgr` with BLE transport for ESP32 products. It abstracts the provisioning FSM and supports SoftAP fallback.

```c
// ESP-IDF: BLE provisioning manager init
wifi_prov_mgr_config_t config = {
    .scheme = wifi_prov_scheme_ble,
    .scheme_event_handler = WIFI_PROV_SCHEME_BLE_EVENT_HANDLER_FREE_BTDM,
};
wifi_prov_mgr_init(config);
wifi_prov_mgr_start_provisioning(security, pop, service_name, service_key);
```

### Connection Management and Reconnect Backoff

Never hard-loop on reconnect. Use exponential backoff with jitter to avoid thundering-herd on power restoration events (e.g., load-shedding recovery with 500 devices reconnecting simultaneously).

```c
// Exponential backoff: start 1s, max 60s, ±20% jitter
static uint32_t backoff_ms = 1000;
static const uint32_t BACKOFF_MAX_MS = 60000;

void wifi_reconnect_with_backoff(void) {
    uint32_t jitter = (esp_random() % (backoff_ms / 5));
    vTaskDelay(pdMS_TO_TICKS(backoff_ms + jitter));
    esp_wifi_connect();
    backoff_ms = MIN(backoff_ms * 2, BACKOFF_MAX_MS);
}

// Reset backoff on successful connection
void on_wifi_connected(void) {
    backoff_ms = 1000;
}
```

### Power Save Modes

| Mode | Standard | Description | Latency impact | Use case |
|---|---|---|---|---|
| **Active** | 802.11 | Radio always on | None | Gateways, mains-powered continuous |
| **PS-Poll** | 802.11 legacy | Device sleeps, wakes to check AP beacon (DTIM interval) | DTIM × 100ms typical | Low-update sensors |
| **TWT (Target Wake Time)** | WiFi 6 (802.11ax) | AP negotiates individual wake schedules per device | Predictable, low | Battery WiFi 6 devices |
| **Modem sleep** | ESP-IDF | CPU active, RF sleeps between transmissions | Minimal | Always-on processing, reduced RF power |
| **Light sleep** | ESP-IDF | CPU halted, RAM retained, wakes on timer/GPIO | 1–5 ms | Periodic sensors |
| **Deep sleep** | ESP-IDF | Near full power-off, wake via RTC timer/ext GPIO | Full reconnect time | Very low duty cycle (< 1/min) |

For ESP32 deep sleep with WiFi: budget ~3–4 s for boot + WiFi connect + send + return to sleep. At 100 mAh CR2032, with a 15 mA average during active window and 10 µA sleep, deep sleep every 15 min yields ~8 months.

### RSSI Thresholds

| RSSI (dBm) | Signal quality | Recommendation |
|---|---|---|
| > -55 | Excellent | Full throughput, reliable |
| -55 to -70 | Good | Normal operation |
| -70 to -80 | Fair | Marginal — consider AP placement |
| -80 to -90 | Poor | Frequent disconnects, consider range extender |
| < -90 | Unusable | Device will not maintain association |

Minimum viable RSSI for stable IoT operation: **-75 dBm**. Alert or log when RSSI drops below -72 dBm to catch degradation before failure.

### Dual-Band Considerations

- Most IoT SoCs (ESP32, W600, ATWINC) are **2.4 GHz only**. 5 GHz capable modules (ESP32-S3 + external PA, Murata Type-1YN) cost more.
- 2.4 GHz is congested in urban environments — channels 1, 6, 11 only for non-overlapping.
- 5 GHz provides more channels (UNII-1/2/3) but shorter range and worse wall penetration.
- For enterprise deployments with existing dual-band APs: band-steer IoT devices to 2.4 GHz explicitly via SSID isolation.

---

## 3. BLE Deep Dive

### GATT Profile Design

GATT (Generic Attribute Profile) is the data model for BLE connections. Design hierarchy: **Profile > Service > Characteristic > Descriptor**.

```
Custom IoT GATT Profile
├── Device Information Service (0x180A) [standard]
│   ├── Manufacturer Name String (0x2A29)
│   ├── Model Number String (0x2A24)
│   └── Firmware Revision String (0x2A26)
├── Environmental Sensing Service (0x181A) [standard]
│   ├── Temperature (0x2A6E) — int16, 0.01°C resolution
│   ├── Humidity (0x2A6F) — uint16, 0.01% resolution
│   └── Pressure (0x2A6D) — uint32, 0.1 Pa resolution
└── Custom Control Service (128-bit UUID)
    ├── Config Characteristic (READ | WRITE | WRITE_NO_RSP)
    ├── Status Characteristic (READ | NOTIFY)
    └── Log Characteristic (READ | INDICATE)
```

Use standard SIG-assigned UUIDs where they exist — scanners and generic apps understand them. Reserve 128-bit UUIDs for proprietary characteristics.

### Advertising Data Structure

BLE advertising packet is 31 bytes. Extended advertising (BLE 5) extends to 255 bytes.

```
Standard AD structure (31 bytes total):
[len][type][data] ... repeated

Common AD types:
0x01 - Flags (always include: 0x06 for BLE-only, non-discoverable-LE)
0x02 - Incomplete list of 16-bit UUIDs
0x03 - Complete list of 16-bit UUIDs
0x07 - Complete list of 128-bit UUIDs
0x08 - Shortened local name
0x09 - Complete local name
0xFF - Manufacturer specific data (first 2 bytes = company ID)

Example: temperature beacon in manufacturer data
[02][01][06]                      // Flags: LE General Discoverable, BR/EDR not supported
[05][FF][FF FF][XX XX XX]         // Manufacturer: 0xFFFF (test), 3 bytes payload
                                  // payload: temp MSB, temp LSB, battery %
```

### Connection Parameters

| Parameter | Range | Recommended (sensor) | Recommended (streaming) |
|---|---|---|---|
| Connection Interval | 7.5 ms – 4 s | 500 ms – 1 s | 15–30 ms |
| Slave Latency | 0–499 | 4–9 | 0 |
| Supervision Timeout | 100 ms – 32 s | 6 s | 2 s |
| MTU | 23–517 bytes | 247 (negotiate) | 517 |

Effective throughput (bytes/s) = `(MTU - 3) × (1000 / connection_interval_ms) / (1 + slave_latency)`. At 247 MTU, 30 ms interval, 0 latency: ~7.3 kB/s application throughput.

### Security Modes

| Mode | Mechanism | MITM protection | Use case |
|---|---|---|---|
| No security (Mode 1, Level 1) | None | No | Non-sensitive beacons |
| Just Works (Mode 1, Level 2) | Unauthenticated pairing | No | Basic pairing, no keyboard/display |
| Passkey Entry (Mode 1, Level 3) | 6-digit PIN | Yes | Consumer products with display |
| Numeric Comparison (Mode 1, Level 3) | 6-digit confirmation | Yes | Both devices have display |
| OOB (Mode 1, Level 3) | NFC or QR code | Yes | Manufacturing, high-security |
| LE Secure Connections (Mode 1, Level 4) | ECDH + AES-CMAC | Yes | Medical, industrial |

Always use **LE Secure Connections** for any product handling personal data or controlling physical actuators.

### BLE Mesh (Bluetooth Mesh Profile)

BLE mesh is a publish/subscribe flooding network over BLE advertising. Not the same as BLE connections.

Key roles:
- **Provisioner**: configures new nodes into the network (typically a phone or gateway)
- **Proxy node**: bridges BLE mesh to GATT (for phone access without provisioning hardware)
- **Relay node**: re-broadcasts mesh messages (increases range)
- **Friend node**: buffers messages for Low Power Nodes
- **Low Power Node (LPN)**: sleeps most of the time, polls Friend node for queued messages

```
Provisioning sequence:
1. Unprovisioned device broadcasts Unprovisioned Device beacon
2. Provisioner discovers device
3. Provisioner opens provisioning bearer (PB-ADV or PB-GATT)
4. ECDH key exchange → session key derivation
5. Provisioner assigns: unicast address, NetKey, DevKey, IV Index
6. Device is now a mesh node — configure AppKeys + model bindings
```

### iBeacon vs Eddystone

| Feature | iBeacon (Apple) | Eddystone (Google) |
|---|---|---|
| Frame type | Single (proximity UUID) | Multiple: UID, URL, TLM, EID |
| Unique IDs | UUID + Major + Minor | Namespace + Instance (UID) |
| Telemetry | Not in standard | TLM frame (battery, temp, pkt count) |
| Ephemeral IDs | No | EID frame (privacy-preserving tracking) |
| Platform lock-in | iOS CoreLocation | Android/Web/open |
| Best for | iOS proximity apps, retail | Fleet management, open ecosystem |

For asset tracking in mixed environments: use Eddystone-UID for the device identity and add manufacturer-specific AD for sensor payload.

---

## 4. LoRaWAN Deep Dive

### LoRa Physical Layer: Spreading Factor vs Data Rate vs Range

LoRa modulates using CSS (Chirp Spread Spectrum). The Spreading Factor (SF) is the key trade-off parameter.

| SF | Bit Rate (125 kHz BW) | Time-on-Air (10 byte payload) | Range multiplier | Sensitivity |
|---|---|---|---|---|
| SF7 | 5.47 kbps | ~56 ms | 1× (baseline) | -123 dBm |
| SF8 | 3.13 kbps | ~103 ms | ~1.4× | -126 dBm |
| SF9 | 1.76 kbps | ~185 ms | ~2× | -129 dBm |
| SF10 | 0.98 kbps | ~329 ms | ~2.8× | -132 dBm |
| SF11 | 0.54 kbps | ~659 ms | ~4× | -134.5 dBm |
| SF12 | 0.29 kbps | ~1319 ms | ~5.6× | -137 dBm |

Higher SF = longer range, lower data rate, longer time-on-air, more duty-cycle consumption. Default to SF7 when gateway is nearby; ADR manages SF automatically in production.

### LoRaWAN Architecture

```
End Device (Class A/B/C)
    │ LoRa RF
    ▼
Gateway (Semtech SX1301/SX1302 concentrator)
    │ Backhaul (Ethernet / 4G / WiFi)
    ▼
Network Server (TTN / ChirpStack / Helium / Everynet)
    │ HTTPS / MQTT / gRPC
    ▼
Application Server (your backend)
```

The gateway is a pure forwarder — it does not decode or authenticate LoRaWAN. Authentication happens at the network server using NwkSKey (network session key) and AppSKey (application session key).

### Device Classes

| Class | Receive windows | Power | Use case |
|---|---|---|---|
| **A** (mandatory) | 2 short RX windows after every TX | Lowest | Most battery sensors — downlink only after uplink |
| **B** | Class A + scheduled beacon-synchronized RX slots | Medium | Actuators needing occasional downlink |
| **C** | Continuous RX (except during TX) | Highest (near-mains) | Actuators needing immediate downlink |

### OTAA vs ABP

**Always use OTAA in production.**

| | OTAA (Over-the-Air Activation) | ABP (Activation By Personalisation) |
|---|---|---|
| Session keys | Derived fresh on each join | Hardcoded at provisioning |
| Frame counters | Reset on join (server handles) | Must persist across resets — brick risk |
| Security | Higher — keys not embedded in binary | Lower — session keys in firmware |
| Network Server | Must support join server | Simpler |
| Production suitability | Yes | Development/testing only |

OTAA credentials to provision: **DevEUI** (hardware UID), **AppEUI/JoinEUI** (application identifier), **AppKey** (128-bit root key). Never commit AppKey to source control.

### Duty Cycle Limits

LoRaWAN operates in unlicensed sub-GHz spectrum subject to duty cycle regulations.

| Region | Band | Duty Cycle Limit | Notes |
|---|---|---|---|
| EU868 | 863–870 MHz | 1% (10 ms/s on-air per sub-band) | ETSI EN 300 220 |
| AU915 | 915–928 MHz | 1% | Also used in some SA deployments |
| AS923 | 915–928 MHz | Varies by sub-region | Used by some SA operators |
| US915 | 902–928 MHz | No duty cycle — dwell time 400 ms | FCC Part 15 |

In South Africa, ICASA regulates sub-GHz ISM under the Radio Frequency Spectrum Regulations. The relevant licence-exempt band for LoRa is **915–928 MHz (Industrial ISM)**. Duty cycle limits are not explicitly mandated in SA regulations but best practice is to follow 1% as per equipment certification (most modules are CE/FCC certified with these limits baked in).

### SA LoRaWAN Network Operators

| Operator | Network | Coverage | Notes |
|---|---|---|---|
| **Everynet** | Public LoRaWAN | Gauteng, WC, KZN metros + expanding | Roaming agreements, TTI-compatible API |
| **Squidnet** | Sigfox + LoRa hybrid | Metro-focused | Also Sigfox operator |
| **CSIR Smart Places** | Research / private | Pretoria campus + pilot sites | Not commercial |
| **MTN / Vodacom** | NB-IoT (not LoRa) | See Section 5 | Cellular IoT, different technology |

Private LoRaWAN gateway deployment is also viable using ChirpStack on a VPS + SX1302-based gateway hardware (RAK7268, Dragino LPS8N). Budget R8 000–R15 000 per gateway for outdoor IP67-rated units.

### Network Server Comparison

| Platform | Hosting | Cost | Best For |
|---|---|---|---|
| **TTN (The Things Network)** | Cloud (community) | Free (fair use) | Prototyping, community coverage |
| **TTI (The Things Industries)** | Cloud (SLA) | Paid | Production, SLA required |
| **ChirpStack v4** | Self-hosted | Free (OSS) | Private deployments, full control |
| **Helium** | Decentralised | Token-based | US-heavy coverage, crypto complexity |
| **AWS IoT Core for LoRaWAN** | Cloud | AWS pricing | AWS-native backends |

For SA production: self-hosted **ChirpStack v4** on a Cloudflare Worker-adjacent VPS (or Hetzner Johannesburg) gives full control without dependency on overseas network servers.

### Confirmed vs Unconfirmed Uplinks

Use unconfirmed (Class A default) for most sensors. Confirmed uplinks consume an extra downlink slot, use duty cycle, and stress the network server at scale.

Use confirmed uplinks for: alarm/alert events, actuation commands, critical data that must not be lost.

### ADR (Adaptive Data Rate)

ADR is a network server feature that optimizes SF and TX power per device based on SNR history. Enable ADR for **stationary devices only**. For mobile assets (vehicles, livestock), disable ADR and set a fixed SF appropriate for worst-case range.

```json
// ChirpStack device profile: ADR settings
{
  "adrAlgorithmId": "default",
  "maxEirp": 16,
  "uplinkInterval": 3600
}
```

---

## 5. Cellular IoT: NB-IoT and LTE-M

### NB-IoT vs LTE-M Comparison

| Parameter | NB-IoT | LTE-M (Cat-M1) |
|---|---|---|
| Bandwidth | 200 kHz (in-band LTE or standalone) | 1.4 MHz |
| DL peak rate | 200 kbps | 1 Mbps |
| UL peak rate | 20 kbps (single-tone) / 200 kbps (multi-tone) | 1 Mbps |
| Mobility | Stationary only (no handover) | Full mobility + handover |
| VoLTE | No | Yes |
| PSM support | Yes (deep sleep, operator-configured) | Yes |
| eDRX support | Yes | Yes |
| Coverage enhancement | +20 dB vs LTE (MCL 164 dBm) | +15 dB vs LTE (MCL 156 dBm) |
| Duplex | Half (FDD) | Half or Full (FDD) |
| Firmware OTA | Possible but slow | Practical (FOTA) |
| Use case fit | Fixed meters, sensors, 10-year battery | Mobile assets, OTA, voice |

### SA Operator Support

| Operator | NB-IoT | LTE-M | Coverage |
|---|---|---|---|
| **Vodacom** | Yes (Band 28, 700 MHz) | Partial rollout | Major metros + national highway corridors |
| **MTN** | Yes (Band 28) | Partial rollout | Major metros |
| **Rain** | No public IoT service | No | Data-only |
| **Telkom** | Limited (check current status) | No | Limited |

Both Vodacom and MTN NB-IoT coverage in SA is concentrated in Gauteng, Western Cape, KwaZulu-Natal, and Eastern Cape metros as of 2024. Rural coverage is thin — validate with operator coverage checker before committing to cellular IoT in agricultural or remote deployments.

### PSM (Power Saving Mode) Configuration

PSM allows the device to power down the cellular modem completely between transmissions. The network buffers downlinks.

```
PSM timers (set via AT commands or network provisioning):
T3412 (TAU - Tracking Area Update): how long the device can sleep before re-registering
T3324 (Active Time): how long the device stays reachable after waking

Example: T3412 = 1 hour, T3324 = 2 seconds
→ Device wakes, sends uplink, remains reachable for 2s for downlink, sleeps for up to 1 hour
→ Current in PSM: 2–10 µA (module-dependent)
```

AT command syntax (3GPP TS 27.007):
```
AT+CPSMS=1,"","","01000110","00000001"
                              ^T3412    ^T3324
```
T3412 encoding: bits 5-7 = unit (000=10min, 001=1hr, 010=10hr), bits 0-4 = value.
`01000110` = 011 unit (6 × 1hr) = 6 hours. `00000001` = 000 unit × 1 = 2 seconds.

### eDRX (Extended Discontinuous Reception)

eDRX extends the DRX cycle beyond standard LTE (which is ~1.28 s) to minutes, reducing idle power. Unlike PSM, the device is still reachable within the eDRX cycle.

```
eDRX cycle values (NB-IoT):
5.12 s, 10.24 s, 20.48 s, 40.96 s, 81.92 s, 163.84 s, 327.68 s, 655.36 s, 1310.72 s, 2621.44 s

AT+CEDRXS=2,5,"0101"   // Enable eDRX, NB-IoT, requested cycle index 5 (~163s)
```

Combine PSM + eDRX for maximum battery life: eDRX for reachability windows, PSM for deep sleep between transmissions.

### SIM Selection for IoT

| SIM Type | Form factor | Temp range | Use case |
|---|---|---|---|
| Standard consumer SIM | 2FF/3FF/4FF | 0–70°C | Development only |
| Industrial SIM | 2FF/3FF/4FF | -40–+105°C | Outdoor/industrial deployments |
| Multi-IMSI SIM | 4FF/MFF2 | -40–+105°C | Roaming, operator switching without SIM swap |
| eSIM (eUICC) | MFF2 soldered | -40–+105°C | Sealed devices, remote carrier switching |
| iSIM (integrated) | On-die | SoC-dependent | Next-gen modules (Qualcomm 9205, Nordic nRF9161) |

For SA deployments with devices that may be moved between metro areas (different operator coverage): use multi-IMSI SIM with both Vodacom and MTN profiles.

### AT Command Reference (Quectel BG96 / EC21)

```
// Check network registration
AT+CEREG?                    // NB-IoT registration status
AT+CREG?                     // General registration

// Check signal quality
AT+CSQ                       // RSSI (0-31 scale, 99=unknown)
AT+QCSQ                      // Extended signal quality (RSRP, RSRQ, SINR)

// Configure RAT preference
AT+QCFG="nwscanseq",020301   // Prefer NB-IoT, then GSM, then LTE-M
AT+QCFG="iotopmode",1        // NB-IoT only (0=LTE-M only, 2=both)

// PSM configuration
AT+CPSMS=1,"","","01000110","00000001"

// MQTT via Quectel MQTT client
AT+QMTOPEN=0,"broker.example.com",8883
AT+QMTCONN=0,"device-id","user","pass"
AT+QMTPUBEX=0,0,1,0,"topic/path",payload_length
```

SIMCom SIM7080G (popular for NB-IoT/LTE-M dual-mode) uses near-identical AT syntax.

---

## 6. MQTT

### Broker Comparison

| Broker | Hosting | Throughput | SA latency | Notes |
|---|---|---|---|---|
| **Mosquitto** | Self-hosted | High (single-threaded bottleneck at ~100k) | Depends on host | OSS, lightweight, good for edge/gateway |
| **HiveMQ** | Cloud / self-hosted | Very high (clustered) | EU/US PoPs | Enterprise features, MQTT 5 native |
| **EMQX** | Cloud / self-hosted | Extremely high (10M+ connections) | EU/US PoPs, SA via VPS | OSS community edition available |
| **AWS IoT Core** | Cloud | Managed | ~200ms from SA | Deep AWS integration, per-message pricing |
| **Azure IoT Hub** | Cloud | Managed | ~180ms from SA (ZA South region) | Good for Azure backends |
| **Cloudflare Pub/Sub** | Edge | High | ~10ms from SA (Johannesburg PoP) | MQTT 3.1.1, beta — check GA status |

For lowest-latency SA production: self-hosted EMQX on Hetzner Johannesburg (HEL DC + JNB DC available) or Azure South Africa North (Johannesburg).

### QoS Levels

| QoS | Delivery guarantee | Broker storage | Use case |
|---|---|---|---|
| **0** (At most once) | No guarantee | None | High-frequency telemetry (loss acceptable) |
| **1** (At least once) | Guaranteed, may duplicate | Until PUBACK | Most sensor data, events |
| **2** (Exactly once) | Guaranteed, no duplicates | PUBREC/PUBREL/PUBCOMP 4-way handshake | Billing data, commands, financial events |

QoS 2 is 4× the message exchanges of QoS 0. At 10 000 devices × 1 msg/min, QoS 2 is ~40 000 MQTT packets/min vs ~10 000 for QoS 0. Default to QoS 1; use QoS 2 only where duplicates cause real harm.

### LWT (Last Will and Testament)

LWT allows the broker to publish a message on behalf of a client when the connection drops unexpectedly (no DISCONNECT sent).

```python
import paho.mqtt.client as mqtt

client = mqtt.Client(client_id="device-001")
client.will_set(
    topic="fleet/site-a/device-001/status",
    payload='{"online": false, "reason": "unexpected_disconnect"}',
    qos=1,
    retain=True
)
client.connect("broker.example.com", 8883)
# On clean disconnect: publish {"online": false, "reason": "graceful"} then DISCONNECT
# On ungraceful disconnect: broker publishes LWT automatically
```

### Topic Hierarchy Design

```
Recommended hierarchy:
{tenant}/{site}/{device_id}/{measurement}

Examples:
acme/jhb-factory/motor-01/temperature
acme/jhb-factory/motor-01/vibration
acme/jhb-factory/motor-01/status       ← retained, LWT target
acme/jhb-factory/+/temperature         ← wildcard: all temps at site
acme/+/+/status                        ← all device statuses across tenant
acme/#                                 ← all messages for tenant (use sparingly)

System topics (use $ prefix, broker-internal):
$SYS/broker/clients/connected
$SYS/broker/messages/received
```

Avoid: deep hierarchies > 6 levels, variable-length segments, device IP or transient identifiers in topic paths.

### TLS Mutual Authentication

```bash
# Generate CA, server cert, client cert (production: use proper PKI)
openssl genrsa -out ca.key 4096
openssl req -new -x509 -days 3650 -key ca.key -out ca.crt

openssl genrsa -out device-001.key 2048
openssl req -new -key device-001.key -out device-001.csr -subj "/CN=device-001"
openssl x509 -req -days 3650 -in device-001.csr -CA ca.crt -CAkey ca.key \
  -CAcreateserial -out device-001.crt
```

```python
# Paho Python: TLS mutual auth
client.tls_set(
    ca_certs="ca.crt",
    certfile="device-001.crt",
    keyfile="device-001.key",
    tls_version=ssl.PROTOCOL_TLS
)
```

Store device private key in secure element (ATECC608A, ESP32 eFuse) — never in plain flash.

### MQTT 5 Key Features

| Feature | Description | Benefit |
|---|---|---|
| Reason codes | Extended return codes on PUBACK, SUBACK, etc. | Better error diagnostics |
| User properties | Key-value pairs in any packet | Metadata without payload modification |
| Message expiry | TTL on published messages | Stale data prevention |
| Subscription options | No local, retain as published | Fine-grained control |
| Shared subscriptions | Load-balanced consumers on same topic | Horizontal scaling of consumers |
| Flow control | Receive maximum (client-side throttle) | Back-pressure without dropping |
| Topic alias | Replace long topic strings with integer IDs | Reduces packet size for constrained devices |

MQTT 5 adoption in IoT devices is growing but not universal. Verify broker and client library support before using MQTT 5 features.

---

## 7. CoAP & HTTP

### CoAP (RFC 7252)

CoAP is UDP-based, designed for constrained devices. It mirrors HTTP semantics (GET/POST/PUT/DELETE) but with a fraction of the overhead (~4-byte fixed header vs ~200-byte HTTP minimum).

| Feature | CoAP | MQTT | HTTP |
|---|---|---|---|
| Transport | UDP | TCP | TCP |
| Header overhead | 4 bytes | 2 bytes | ~200 bytes |
| Request-response | Yes (like HTTP) | No (pub/sub) | Yes |
| Push/subscribe | Observe option | Native pub/sub | SSE/WebSocket |
| Security | DTLS | TLS | TLS |
| Multicast | Yes | No | No |
| Best for | Request-response on constrained networks | Event-driven telemetry | REST APIs, webhooks |

#### Confirmable vs Non-Confirmable

```
Confirmable (CON): reliable delivery
  Client → Server: CON GET /temperature (MID: 1234)
  Server → Client: ACK 2.05 Content (MID: 1234) [piggybacked response]
  If no ACK: client retransmits with exponential backoff (2s, 4s, 8s, 16s)

Non-Confirmable (NON): fire and forget
  Client → Server: NON GET /temperature (MID: 5678)
  [No ACK required — server may still respond as NON]
```

Use CON for commands and configuration; NON for high-frequency telemetry where loss is acceptable.

#### Observe Option (RFC 7641)

CoAP Observe lets a client subscribe to resource state changes without polling:

```
Client → Server: GET /temperature Observe:0    // Register observation
Server → Client: 2.05 Content, temperature=22.1°C, Observe:12345   // Initial + token
Server → Client: 2.05 Content, temperature=22.4°C, Observe:12346   // On change
...
Client → Server: GET /temperature Observe:1    // Deregister
```

#### Block-Wise Transfer (RFC 7959)

For firmware OTA over CoAP (large payloads that exceed UDP MTU):

```
Client → Server: GET /firmware/v2.1.0  Block2: NUM=0, SZX=6 (1024 bytes)
Server → Client: 2.05 Content, Block2: NUM=0, M=1, SZX=6  [block 0, more follows]
Client → Server: GET /firmware/v2.1.0  Block2: NUM=1, SZX=6
Server → Client: 2.05 Content, Block2: NUM=1, M=1, SZX=6  [block 1, more follows]
...
Server → Client: 2.05 Content, Block2: NUM=N, M=0, SZX=6  [last block]
```

#### When to Use CoAP over MQTT

- Devices already use UDP stack (smaller ROM footprint than TCP)
- Request-response semantics are natural (actuator commands with immediate status return)
- Multicast needed (broadcast to all devices on a subnet)
- Network is too constrained for persistent TCP connections
- CoAP-to-HTTP proxy exists in infrastructure (RFC 8075)

### HTTP/HTTPS for IoT

HTTP is appropriate for IoT devices that: are mains-powered, have a full TCP/IP stack, and need to integrate with REST APIs or webhooks without a broker.

#### REST API Design for Device Endpoints

```
Device-facing API conventions:
POST /v1/telemetry           // Batch telemetry upload
PUT  /v1/devices/{id}/config // Push config to device (device polls)
GET  /v1/devices/{id}/commands // Device polls for pending commands
POST /v1/devices/{id}/ota/accept // Device acknowledges OTA job

Response codes:
200 OK         - Success with body
202 Accepted   - Command queued (async)
204 No Content - Success, no body (telemetry ack)
304 Not Modified - Config unchanged (ETag/If-None-Match polling)
429 Too Many Requests - Rate limit hit (device must back off)
```

#### Real-time Patterns Comparison

| Pattern | Protocol | Server state | Latency | Device complexity | Use case |
|---|---|---|---|---|---|
| Polling | HTTP GET | Stateless | High (poll interval) | Low | Simple devices, infrequent updates |
| Long-polling | HTTP GET (hold open) | Session state | Low | Medium | Command delivery without broker |
| SSE (Server-Sent Events) | HTTP/1.1 chunked | Connection state | Low | Medium | Server-to-device push, one-way |
| WebSocket | HTTP upgrade → WS | Connection state | Very low | Higher | Bidirectional real-time |
| MQTT | TCP | Broker state | Very low | Low (library) | Best general IoT choice |

#### Payload Compression

For battery/bandwidth-constrained devices sending JSON:

```python
import gzip, json

payload = {"t": 22.4, "h": 65.2, "p": 101325, "bat": 87}
compressed = gzip.compress(json.dumps(payload).encode())
# Raw JSON: ~50 bytes → Compressed: ~45 bytes (small payloads: minimal gain)
# At 100 fields: raw ~800 bytes → compressed ~200 bytes (significant)

# HTTP header:
headers = {
    "Content-Encoding": "gzip",
    "Content-Type": "application/json"
}
```

For very constrained devices: use **CBOR** (Concise Binary Object Representation, RFC 7049) instead of JSON. CBOR encodes the same data structure in ~30–50% fewer bytes with no compression overhead.

---

## 8. Mesh Networking

### Zigbee Mesh

Zigbee uses IEEE 802.15.4 at the PHY/MAC layer with the Zigbee network layer on top.

#### Node Roles

| Role | Description | Power | Routing | Notes |
|---|---|---|---|---|
| **Coordinator** | Forms the network, selects PAN ID and channel | Mains | Yes | Exactly one per network — single point of failure |
| **Router** | Extends mesh, routes messages | Mains | Yes | Can also host application (e.g., smart plug) |
| **End Device** | Leaf node, sleeps between transmissions | Battery | No | Must associate with a parent router |

#### Network Parameters

- **PAN ID**: 16-bit identifier, use random to avoid collision with neighbours
- **Channel**: IEEE 802.15.4 channels 11–26 (2.4 GHz). Avoid channels 11, 15, 20, 25 which overlap with WiFi channels 1, 6, 11. Use channels 15, 20, 25, 26 for minimal WiFi interference.
- **Network size**: Theoretically 65 535 nodes, practically 200–300 before routing table memory becomes a bottleneck on router nodes
- **Hop limit**: Default 10 hops, configurable
- **Mesh healing**: Zigbee re-routes automatically around failed nodes (seconds to minutes depending on network activity)

#### Zigbee Profiles and Interoperability

| Profile | Use case | Interop |
|---|---|---|
| Zigbee Home Automation (HA) | Lights, switches, sensors | Partial — vendor extensions break interop |
| Zigbee Light Link (ZLL) | Philips Hue, LED systems | Better interop in lighting |
| Zigbee 3.0 | Unified profile | Better than HA, not perfect |
| Matter (over Thread) | Replacing Zigbee in consumer | Full interop (Apple/Google/Amazon) |

For new consumer product design in 2024+: prefer **Matter over Thread** over Zigbee. For industrial/building automation with existing Zigbee infrastructure: continue with Zigbee 3.0.

### Thread (OpenThread)

Thread is an IPv6-native mesh networking protocol built on IEEE 802.15.4. It is the transport layer beneath Matter.

#### Roles

| Role | Description |
|---|---|
| **Leader** | Manages network data, assigns router IDs (elected dynamically) |
| **Router** | Participates in mesh routing, maintains routing table |
| **Reed (Router Eligible End Device)** | Can become a Router if elected |
| **Sleepy End Device (SED)** | Battery node, polls parent for buffered messages |
| **Border Router** | Connects Thread network to IP network (WiFi/Ethernet); runs on Thread + WiFi hardware |

#### IPv6 Addressing in Thread

Every Thread device has a Link-Local address and a Mesh-Local address (derived from PAN and device EUI). Border Router advertises a global prefix — devices self-assign global addresses (SLAAC). No NAT required; Thread devices are directly addressable over IPv6.

```
Thread address types:
fe80::/10          Link-Local (single hop)
fd00::/8           Mesh-Local (intra-mesh, ULA)
2001:db8::/32      Global (if Border Router provides prefix)
```

OpenThread (open-source implementation by Google, used in Matter) runs on ESP32-H2, Nordic nRF52840, Silicon Labs EFR32MG24, and others.

### BLE Mesh Provisioning Sequence (Summary)

```
1. Factory-reset device broadcasts: Unprovisioned Device beacon (UUID)
2. Provisioner (phone/gateway) scans → selects device → opens PB-ADV bearer
3. Invite PDU → Capabilities PDU (device reports algorithms, OOB info)
4. Start PDU → Public Key exchange → ECDH → confirmation exchange
5. Random values exchanged → session key derived
6. Network key (NetKey), unicast address, IV Index, flags sent to device
7. Device is now provisioned → Provisioner configures:
   - Application keys (AppKey) bound to models
   - Publication address (where to publish sensor data)
   - Subscription addresses (which addresses to listen to)
```

### WiFi Mesh

WiFi mesh is typically a gateway aggregation layer, not a battery-node network.

| Implementation | Platform | Notes |
|---|---|---|
| **ESP-MESH (ESP-MDF)** | ESP32 family | Proprietary Espressif mesh over WiFi; no AP required; up to 1000 nodes |
| **Painless Mesh** | ESP8266/ESP32 (Arduino) | OSS, simple, small networks (< 50 nodes) |
| **802.11s** | Linux (hostapd, wpa_supplicant) | Standard WiFi mesh, used in router products |
| **EasyMesh (802.11ax)** | WiFi 6 APs | Multi-vendor AP mesh, enterprise backhaul |

ESP-MESH topology: root node connects to router AP; child nodes connect to root or intermediate nodes. All nodes are peers — no single coordinator failure risk.

### Range Extension Strategies

| Strategy | Cost | Complexity | Best for |
|---|---|---|---|
| Additional gateways/APs | Medium | Low | WiFi, LoRaWAN coverage gaps |
| Mesh repeater/router nodes | Low-medium | Low | Zigbee, Thread, BLE mesh, ESP-MESH |
| Directional antenna | Low | Low | LoRa long-range links, point-to-point |
| Higher-gain omnidirectional antenna | Low | Very low | LoRa, NB-IoT (where external antenna port available) |
| Elevated gateway placement | Low | Low | LoRaWAN — rooftop vs ground level is 10× range |
| Cellular signal booster | High | Medium | NB-IoT/LTE-M in basements, metal buildings |
| Wired backbone + wireless at leaf | Medium | Medium | Industrial mesh — Ethernet to each zone, wireless within zone |

### Gateway Placement for LoRaWAN

The single most impactful variable for LoRaWAN coverage is gateway elevation. Rules of thumb:

- Rooftop (> 10 m) vs ground level: 3–10× range improvement
- Line-of-sight to building cluster: gateway on the tallest structure in the cluster
- Water towers, cell masts (where co-location is permitted): best sites for rural agriculture
- Minimum 3 gateways for redundancy and geolocation (TDOA)
- SX1302-based concentrators (RAK2287, Dragino PG1301) support 8 simultaneous channels — route all AU915/AS923 sub-bands

---

## 9. SA Spectrum and Regulatory Context

### ICASA Spectrum Licensing

ICASA (Independent Communications Authority of South Africa) regulates the radio frequency spectrum under the Electronic Communications Act (ECA) 36 of 2005.

| Band | Use | Licence status | IoT relevance |
|---|---|---|---|
| 433 MHz | ISM (short range) | Licence-exempt | Short-range devices, keyfobs, some sensors |
| 868 MHz | ISM (European allocation) | Not formally designated in SA | Some EU-certified devices operate here — grey area |
| 915–928 MHz | ISM (industrial) | Licence-exempt | LoRa, Sigfox, some sub-GHz sensors |
| 2.4 GHz | ISM | Licence-exempt | WiFi, BLE, Zigbee, Thread |
| 5 GHz | UNII / ISM | Licence-exempt (with DFS requirements) | WiFi 5/6 |
| 700 MHz (B28) | Licensed cellular | Operator licence (Vodacom/MTN) | NB-IoT, LTE-M |
| 1800/2100/2600 MHz | Licensed cellular | Operator licence | LTE Cat-1/4, 5G |

Key point: LoRaWAN devices in SA operate on 915–928 MHz under the licence-exempt ISM allocation. However, devices must comply with ICASA type approval requirements (equipment must be approved under the ICASA Equipment Regulations). Most modules certified in CE/FCC/RCM are accepted but verify — ICASA does conduct enforcement actions.

For commercial deployments: confirm equipment type approval with your module vendor. Semtech SX1276/SX1302 modules from major vendors (RAK Wireless, Murata, HopeRF) generally carry adequate certification.

### Power Limits

SA licence-exempt equipment (GN 3100 and successor regulations):
- 915 MHz ISM: 25 mW EIRP (typical LoRa operating power — 14–20 dBm module output, antenna dependent)
- 2.4 GHz ISM: 100 mW EIRP for most applications
- 5 GHz: 200 mW EIRP (UNII-1), 1 W (UNII-3)

---

## Common Gotchas

- **LoRaWAN ABP in production**: frame counters do not reset on power cycle with ABP — device will be rejected by network server after reboot. Production devices must use OTAA.
- **NB-IoT coverage assumption**: Vodacom/MTN coverage maps show outdoor coverage. Indoor and basement penetration can be 20–30 dB worse. Test with the actual module + antenna at the deployment site before committing.
- **BLE connection parameter negotiation**: iOS enforces minimum connection interval of 15 ms regardless of what the peripheral requests. Android is more permissive. Design throughput estimates for iOS constraints.
- **WiFi deep sleep reconnect time**: ESP32 deep sleep with WiFi reconnect takes 3–5 seconds, not milliseconds. At 1-minute intervals, this is 5–8% duty cycle just for connection — budget accordingly in power calculations.
- **MQTT QoS 1 duplicates**: QoS 1 guarantees at-least-once, not exactly-once. Your application must be idempotent or include a sequence number / message ID for deduplication.
- **LoRaWAN duty cycle at SF12**: a single SF12 transmission of 50 bytes is ~2.8 seconds on-air. At 1% duty cycle, the device must wait 280 seconds before the next transmission. Do not use SF12 for anything requiring more than ~300 messages/day.
- **Zigbee channel and WiFi co-channel interference**: Zigbee channel 11 (2405 MHz) overlaps with WiFi channel 1. In dense office/residential environments, this causes 40–60% packet loss. Always survey and select a Zigbee channel with minimum WiFi overlap.
- **NB-IoT PSM downlink latency**: in PSM, the device is unreachable until it wakes and re-registers. T3412 can be up to 310 hours. Design your application so downlinks are queued and delivered at next uplink — do not expect real-time downlink on NB-IoT with PSM.
- **Sigfox 12-byte limit**: the 12-byte UL payload limit is a hard limit, not a soft guideline. Design your payload encoding around it from day one. Trying to retrofit a richer data model later is costly.
- **SA LoRaWAN coverage**: assume no coverage outside the four major metros until validated with a field test. Private gateway deployment is often the only viable option for agricultural or mining sites.
- **BLE mesh and scan window**: BLE mesh uses advertising-based flooding. High node density with default scan windows can saturate the 2.4 GHz channel. Tune advertising intervals and use Friend/LPN node pairs for battery-powered end nodes in dense deployments.
- **Thread border router is a single point of failure**: in production Thread networks, deploy at least two border routers for redundancy. OpenThread supports multiple border routers natively — they synchronise network data automatically.

---

## See Also

- [iot/firmware SKILL.md](../firmware/SKILL.md) — Firmware OTA, RTOS, power management
- [iot/hardware SKILL.md](../hardware/SKILL.md) — SoC selection, antenna design, PCB layout
- [LoRaWAN specification v1.0.4](https://lora-alliance.org/resource_hub/lorawan-104-specification-package/)
- [ChirpStack v4 documentation](https://www.chirpstack.io/docs/)
- [OpenThread documentation](https://openthread.io/guides)
- [ICASA Equipment Regulations (GN 3100)](https://www.icasa.org.za/legislation-and-regulations/equipment-regulations)
- [Everynet SA coverage](https://everynet.com)
- [Squidnet SA coverage](https://squidnet.co.za)
