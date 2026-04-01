---
name: IoT Security
description: >
  Device security architecture, secure boot, TLS/DTLS, certificate management,
  OTA security, POPIA compliance for IoT data, and common IoT attack vectors.
requires:
  - iot/firmware
  - iot/connectivity
improves: []
metadata:
  domain: iot
  subdomain: security
  maturity: stable
---

# IoT Security

IoT devices are the largest and most poorly-secured attack surface in most organisations. A sensor node with default credentials on a production network is a pivot point into that network. Security must be designed in from day one — retrofitting is expensive and often incomplete.

---

## Threat Model First

Before implementing security controls, define the threat model for the deployment:

| Threat Actor | Capability | Likely Attack |
|-------------|-----------|--------------|
| Script kiddie | Low | Shodan scan; default credential login; known CVE exploitation |
| Opportunistic attacker | Medium | Network sniffing; replay attacks; firmware extraction from discarded device |
| Targeted attacker | High | Side-channel attacks (power analysis, timing); fault injection; supply chain |
| Insider | Variable | Physical access; privileged API misuse; credential theft |
| Nation-state | Very high | Hardware backdoors; zero-days; supply chain compromise |

For most commercial IoT deployments, design against opportunistic and medium-capability targeted attackers. Nation-state-level threats require hardware security modules (HSM) and are out of scope for typical projects.

---

## Device Identity & Certificates

### Certificate Hierarchy

```
Root CA (offline; air-gapped)
    └── Intermediate CA (online; signs device certs)
            └── Device Certificate (per-device; CN = serial number)
```

**Never use the Root CA online.** If the intermediate CA is compromised, revoke and reissue — the Root CA remains trusted.

### Device Certificate Fields

```
Subject: CN=SN-{serial}, O=YourCompany, C=ZA
Subject Alternative Names: URI:urn:company:device:{serial}
Key Usage: Digital Signature, Key Encipherment
Extended Key Usage: TLS Web Client Authentication
Validity: 10 years (device lifetime)
Key: ECDSA P-256 (preferred) or RSA-2048
```

### Certificate Injection at Manufacture

Three approaches:

| Approach | When | Security | Complexity |
|----------|------|---------|-----------|
| **Factory injection (pre-provisioning)** | During PCB test/programming | High — private key never leaves secure factory | High — requires secure factory process |
| **First-boot provisioning (TOFU)** | Device generates keypair on first boot; sends CSR to provisioning endpoint | Medium — trust-on-first-use window is vulnerable | Medium |
| **Claim certificate (AWS Fleet Provisioning)** | Device ships with a claim cert; exchanges for permanent cert after first connection | High — claim cert has limited permissions | Medium |

### Key Storage

| Platform | Secure Storage |
|----------|---------------|
| ESP32 | eFuse (burn once); Flash Encryption + NVS encryption |
| STM32 | STSAFE-A (secure element); Option bytes |
| nRF52 | CryptoCell-310 (hardware crypto); ACL on flash |
| Generic | ATECC608B (external secure element; I²C; ECC508/608 family) |

**ATECC608B** is the pragmatic choice for any MCU without built-in hardware crypto:
- Stores private keys in hardware — key never exposed to MCU firmware
- Performs ECDH and ECDSA operations in hardware
- Tamper-resistant; physically unclonable function (PUF) seed
- $0.70 in volume; simple I²C interface

---

## TLS for IoT

### TLS 1.3 vs 1.2

Prefer TLS 1.3:
- Fewer round-trips (1-RTT vs 2-RTT) → faster handshake → less energy
- Forward secrecy mandatory — past sessions safe if long-term key compromised
- Removed weak cipher suites (RC4, 3DES, SHA-1)
- 0-RTT session resumption for reconnecting devices

### Cipher Suite Selection for Constrained Devices

| Suite | Key Exchange | Auth | Bulk Cipher | Notes |
|-------|-------------|------|------------|-------|
| TLS_AES_128_GCM_SHA256 | ECDHE | ECDSA | AES-128-GCM | TLS 1.3 default; best balance |
| TLS_CHACHA20_POLY1305_SHA256 | ECDHE | ECDSA | ChaCha20 | Better on MCUs without AES hardware |
| TLS_AES_256_GCM_SHA384 | ECDHE | ECDSA | AES-256-GCM | Higher security; higher compute |

On ESP32, STM32H7, nRF52840: hardware AES acceleration → use AES-128-GCM. On Cortex-M0/M0+: no hardware AES → ChaCha20-Poly1305 is faster.

### Mutual TLS (mTLS)

Both server and client authenticate with certificates. Required for device-to-cloud where you need to verify device identity, not just encrypt the channel.

```c
// mbedTLS mTLS configuration (simplified)
mbedtls_ssl_conf_own_cert(&ssl_conf, &device_cert, &device_key);
mbedtls_ssl_conf_ca_chain(&ssl_conf, &server_ca_cert, NULL);
mbedtls_ssl_conf_authmode(&ssl_conf, MBEDTLS_SSL_VERIFY_REQUIRED);
```

### DTLS for UDP-based Protocols

CoAP runs over UDP → use DTLS (Datagram TLS). Same security as TLS but handles packet loss and reordering. DTLS 1.3 now standardised (RFC 9147).

### Certificate Pinning

For devices connecting to a known fixed endpoint, pin the server certificate or public key:

```c
// Compare server cert fingerprint against known-good value
const uint8_t EXPECTED_SHA256[32] = { 0xAB, 0xCD, ... };
// Verify in TLS handshake callback
if (memcmp(cert_fingerprint, EXPECTED_SHA256, 32) != 0) {
    // Abort connection — possible MITM
    return MBEDTLS_ERR_X509_CERT_VERIFY_FAILED;
}
```

---

## Secure Boot

Prevents unsigned firmware from running on the device. Critical for preventing firmware replacement with malicious code.

### Chain of Trust

```
Hardware Root of Trust (immutable ROM / OTP / Secure Element)
    → Bootloader (verified by hardware RoT)
        → Application firmware (verified by bootloader signature)
            → Loaded modules / OTA updates (verified by app)
```

### ESP32 Secure Boot V2

```
1. Generate signing key: espsecure.py generate_signing_key --version 2 secure_boot_signing_key.pem
2. Burn public key digest to eFuse (IRREVERSIBLE): espsecure.py burn_efuse secure_boot_signing_key.pem
3. Sign firmware: espsecure.py sign_data --version 2 --keyfile signing_key.pem firmware.bin
4. Enable in sdkconfig: CONFIG_SECURE_BOOT=y, CONFIG_SECURE_BOOT_V2_ENABLED=y
```

**Flash Encryption** (complement to Secure Boot):
- Encrypts contents of flash with AES-256-XTS
- Prevents reading firmware from flash via JTAG or desoldering
- Enable alongside Secure Boot: `CONFIG_FLASH_ENCRYPTION_ENABLED=y`

### STM32 Secure Boot (STM32Trust / SBSFU)

- Option byte: RDP (Read-Out Protection) Level 0/1/2
  - Level 0: Full debug access (development)
  - Level 1: Flash not readable via debug; RAM accessible (testing)
  - Level 2: Debug interface completely disabled (production — IRREVERSIBLE)
- SBSFU framework: complete dual-bank OTA with signature verification

### MCUboot (Multi-platform)

MCUboot is the open-source bootloader for Zephyr, mynewt, and others:
```
CONFIG_BOOTLOADER_MCUBOOT=y
CONFIG_MCUBOOT_SIGNATURE_TYPE_RSA=y      # or ECDSA
CONFIG_MCUBOOT_GENERATE_SIGNING_KEY=y
# After build, sign with: imgtool sign --key signing_key.pem firmware.bin signed.bin
```

---

## OTA Update Security

An insecure OTA mechanism is worse than no OTA — it gives attackers a reliable way to install malware on every device in your fleet.

### OTA Security Checklist

- [ ] Firmware image signed with ECDSA-P256 or RSA-2048+ (minimum)
- [ ] Signature verified by bootloader before swap — not by application
- [ ] Download over TLS 1.2+ with server certificate verification
- [ ] No OTA rollback to a version with known vulnerabilities (anti-rollback counter in eFuse)
- [ ] Version number verified — refuse downgrades unless explicitly authorised
- [ ] Hash (SHA-256) of image verified after download, before bootloader swap
- [ ] Atomic update — partial write treated as corrupt image → rollback to known-good
- [ ] OTA authorisation token — per-device, time-limited token to prevent replay of update commands

### Delta OTA

Full firmware images are 100KB–4MB+. Delta updates send only the diff:
- **JanPatch**: patch format for constrained devices; applies binary diff
- **bsdiff/bspatch**: larger device; generates compact diffs
- Savings: 60–90% bandwidth reduction on minor version updates
- Requirement: device must hold complete base image to apply patch

---

## Network Security

### Network Segmentation

IoT devices must never be on the same network segment as corporate IT systems:

```
Internet
    → Firewall
        → Corporate LAN (office PCs, servers) — VLAN 10
        → IoT Network — VLAN 20 (isolated)
            → IoT devices (sensors, gateways)
            → IoT gateway → cloud only (no LAN access)
        → Guest WiFi — VLAN 30
```

Rules: IoT VLAN can reach internet (specific IPs/ports). IoT VLAN cannot reach corporate LAN. Corporate LAN can reach IoT management interface (read-only dashboards) via reverse proxy — never direct device access.

### Firewall Rules for IoT

```
# IoT devices: whitelist outbound only
ALLOW  IoT → broker.yourcompany.com:8883 (MQTT over TLS)
ALLOW  IoT → api.yourcompany.com:443 (HTTPS OTA, provisioning)
ALLOW  IoT → time.cloudflare.com:123 (NTP)
DENY   IoT → ANY (everything else)
DENY   ANY → IoT (no inbound connections to devices)
```

### Disabling Unnecessary Services

Default-on services that must be disabled in production:

| Service | Risk | Action |
|---------|------|--------|
| Telnet | Cleartext; trivially intercepted | Disable entirely |
| HTTP (port 80) | Cleartext config/API | Force HTTPS redirect or disable |
| JTAG/SWD | Full flash read/write/debug access | Disable (lock) before production |
| Serial debug console | Firmware exposure; command injection | Disable or require auth |
| mDNS/Bonjour | Device discovery by attacker | Disable on production network |
| UPnP | Port-forwarding attacks | Disable on gateway devices |

---

## POPIA Compliance for IoT

IoT devices collecting personal information are subject to POPIA (Protection of Personal Information Act).

### What Counts as Personal Information in IoT

| Data Type | Personal? | Notes |
|-----------|----------|-------|
| MAC address | Yes | Persistent identifier; linked to person/premises |
| IP address | Yes | Dynamic but linkable |
| GPS coordinates | Yes (precise location) | Precise location = personal; grid-level = debatable |
| Energy consumption (smart meter) | Yes | Reveals behaviour patterns (home/away, sleep times) |
| Video/image | Yes | Biometric data — special category |
| Health sensor data | Yes (special category) | POPIA s26 — heightened obligations |
| Anonymous aggregate (e.g. "50 devices on this block") | No | Aggregated; not individually identifiable |

### POPIA Obligations for IoT Systems

1. **Purpose limitation**: Only collect data needed for stated purpose. A temperature sensor for HVAC efficiency monitoring should not collect presence data unless explicitly disclosed.
2. **Data minimisation**: Don't store raw data longer than needed. Roll up: 1-minute readings → hourly averages after 30 days → daily averages after 1 year.
3. **Security**: Encrypt data at rest and in transit. Access controls on the IoT platform. Audit logs for data access.
4. **Retention**: Define and automate deletion. A device decommissioned 3 years ago should have its data purged.
5. **Breach notification**: A compromised IoT gateway that exfiltrates personal data is a POPIA breach. 72-hour notification clock applies (aligned with POPIA reasonable-time requirement — typically interpreted as 72h).
6. **Cross-border transfer**: IoT platform hosted in the US/EU requires POPIA cross-border transfer compliance (adequate protection or contractual safeguards).

### Privacy by Design in IoT

- Collect the minimum data needed on-device; compute locally where possible
- Hash or pseudonymise identifiers at the edge before transmission
- Store device serial numbers separately from measurement data (join only when needed)
- Log data access — who queried which device data and when

---

## Common IoT Attack Vectors

| Attack | Description | Mitigation |
|--------|------------|-----------|
| **Default credentials** | Factory username/password unchanged | Force credential change on first boot; no hardcoded credentials in firmware |
| **Unencrypted MQTT** | Port 1883 plaintext; trivially sniffed | Always use MQTT over TLS (port 8883) |
| **Replay attack** | Attacker re-sends captured valid packet | Include timestamp + nonce in message; reject messages >30s old |
| **Firmware extraction** | Read flash via JTAG or desoldering | Flash encryption (ESP32, STM32 RDP Level 2) |
| **Physical tampering** | Device opened; UART connected | Tamper-evident enclosure; epoxy potting; disable debug interfaces |
| **DNS hijacking** | Device resolves broker hostname to attacker IP | Certificate verification (not just TLS); certificate pinning for critical infrastructure |
| **OTA poisoning** | Malicious firmware pushed as update | Firmware signing; bootloader signature verification |
| **Side-channel** | Power analysis to extract private keys | Hardware secure element (ATECC608B); constant-time crypto implementations |
| **Supply chain** | Counterfeit components; backdoored firmware | Supplier vetting; firmware signing from day 1; chip authentication (DS28E50) |
