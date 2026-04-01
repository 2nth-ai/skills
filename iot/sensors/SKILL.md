---
name: Sensors & Signal Conditioning
description: >
  Sensor selection, signal conditioning, ADC design, calibration, interface
  protocols (I²C/SPI/UART/4-20mA/RS-485), and measurement accuracy for
  IoT and industrial deployments.
requires:
  - iot/hardware
improves: []
metadata:
  domain: iot
  subdomain: sensors
  maturity: stable
---

# Sensors & Signal Conditioning

Sensors convert physical phenomena into electrical signals. The quality of the measurement is only as good as the sensor selection, signal conditioning chain, and calibration. Garbage in, garbage out — a beautifully designed wireless system transmitting inaccurate data helps nobody.

---

## Sensor Selection Framework

Ask these questions before selecting any sensor:

| Question | Why It Matters |
|----------|---------------|
| What is the measurement range? | Full-scale range must cover worst-case physical value |
| What accuracy is required? | ±0.1°C vs ±1°C → completely different sensor categories |
| What resolution is needed? | 8-bit (256 steps) vs 16-bit (65,536 steps) |
| What is the operating environment? | Temperature, humidity, dust (IP rating), vibration, chemicals |
| What is the power budget? | Continuous vs duty-cycled; 1µA vs 1mA makes a huge battery difference |
| What interface is available on the MCU? | I²C, SPI, UART, ADC, pulse counter |
| What are the supply voltage constraints? | 3.3V vs 5V vs 24V |
| Is a calibration certificate required? | Industrial/safety applications often require traceable calibration |
| What is the MTBF/lifetime requirement? | Consumer vs industrial grade |
| What is the cost target? | $0.50 vs $5 vs $50 per node changes design entirely |

---

## Common Sensor Categories

### Temperature

| Sensor Type | Range | Accuracy | Interface | Power | Use Case |
|-------------|-------|---------|-----------|-------|---------|
| NTC Thermistor | −40 to +125°C | ±0.5–2°C (cal'd) | ADC | nA (resistive) | Low cost; requires linearisation |
| PT100/PT1000 (RTD) | −200 to +850°C | ±0.1–0.5°C | ADC + amp | µA | Industrial; high accuracy |
| DS18B20 (1-Wire) | −55 to +125°C | ±0.5°C | 1-Wire | 1.5mA active | Watertight probe; multi-drop |
| SHT4x (Sensirion) | −40 to +125°C | ±0.2°C | I²C | 0.1µA sleep | Combined T+RH; excellent |
| TMP117 (TI) | −55 to +150°C | ±0.1°C | I²C | 3.5µA active | Precision; medical-grade option |
| K-type thermocouple + MAX31855 | −200 to +1350°C | ±2°C | SPI | 1.5mA | High-temp industrial; motors |

**NTC linearisation**: Steinhart-Hart equation for accuracy:
```c
// Steinhart-Hart: 1/T = A + B·ln(R) + C·(ln(R))³
float steinhart_temp(float resistance) {
    float A = 0.001129148f, B = 0.000234125f, C = 8.76741e-8f;
    float logR = logf(resistance);
    float T = 1.0f / (A + B * logR + C * logR * logR * logR);
    return T - 273.15f;  // Convert Kelvin to Celsius
}
```

Simpler but less accurate: Beta equation (use when ±1°C is acceptable).

### Humidity

| Sensor | Accuracy | Hysteresis | Notes |
|--------|---------|-----------|-------|
| SHT40 (Sensirion) | ±1.8% RH | ±0.1% | Best overall; pre-cal'd; I²C |
| SHT31 | ±2% RH | ±0.1% | Previous generation; still excellent |
| DHT22 / AM2302 | ±2% RH | ~0.5% | 1-Wire-like; slow; cheap; adequate |
| BME280 (Bosch) | ±3% RH | ±1% | Combined T+RH+pressure; I²C or SPI |
| HIH6130 | ±4% RH | | I²C; Honeywell industrial |

**Condensation protection**: Capacitive RH sensors fail when condensation forms on the sensing element. Use a hydrophobic membrane filter (Gore-Tex ePTFE) for outdoor deployments. Or use heated sensors (SHT35 with heater command) to prevent condensation.

### Pressure

| Type | Range | Interface | Application |
|------|-------|---------|------------|
| BMP390 (Bosch) | 300–1250 hPa | SPI/I²C | Weather; altitude; drone |
| MS5637 (TE) | 300–1200 hPa | I²C | High accuracy weather |
| MPX5700 (NXP) | 0–700 kPa | Analogue | Tyre pressure; fluid pressure |
| Honeywell TBM | 0–10 bar | Analogue/I²C | Industrial pipe pressure |
| Gems Sensors | 0–1000 bar | 4-20mA | Harsh industrial |

**Differential pressure**: For flow measurement (Bernoulli), air quality (filter monitoring), liquid level. Use MPXV7002 (±2kPa, analogue) or SDP810 (Sensirion, ±500Pa, I²C, low differential).

### Motion & Vibration

| Sensor | Type | Range | Interface | Use Case |
|--------|------|-------|---------|---------|
| MPU-6050/ICM-42688 | IMU (accel+gyro) | ±16g / ±2000°/s | I²C/SPI | Orientation, motion detection |
| ADXL345 | Accelerometer | ±16g | SPI/I²C | Low power; tap/freefall detect |
| LIS3DH | Accelerometer | ±16g | SPI/I²C | 2µA sleep; activity interrupt |
| IIS3DWB | Vibration | ±16g | SPI | Wide-bandwidth (6kHz); industrial |
| HC-SR501 | PIR | Passive IR | Digital GPIO | Motion detection; wide angle |
| RCWL-0516 | Doppler microwave | | Digital GPIO | Motion through walls; rain-resistant |

**Vibration for predictive maintenance**: Sample at ≥2× max frequency of interest (Nyquist). Motor bearings: 10kHz sample rate. Use FFT to identify bearing fault frequencies (BPFI, BPFO, BSF, FTF — calculated from bearing geometry).

### Light & Optical

| Sensor | Wavelength | Output | Use Case |
|--------|-----------|--------|---------|
| BH1750 | 400–700nm (lux) | I²C | Ambient light; 16-bit |
| VEML7700 | 400–700nm (lux) | I²C | High dynamic range; 0.0036 to 120k lux |
| TSL2591 | 400–1000nm | I²C | Dual-channel; IR + visible; 600M:1 DR |
| AS7341 | 11-channel spectral | I²C | Colour/spectral analysis |
| OPT3001 | 300–1000nm (lux) | I²C | Texas Instruments; low power |
| APDS-9960 | RGB + proximity + gesture | I²C | Gesture recognition; colour sensing |

**IR distance/proximity**: GP2Y0A21 (analogue, 10–80cm), VL53L1X (ToF, 0–4m, I²C, 10ms response), VL53L4CD (multi-zone ToF). ToF sensors are unaffected by target reflectivity — use for fluid level sensing.

### Gas & Air Quality

| Sensor | Target Gas | Interface | Warm-Up | Notes |
|--------|-----------|---------|---------|-------|
| SGP40 (Sensirion) | VOC index | I²C | 10s | Relative VOC; pairs with SHT4x |
| SEN55 (Sensirion) | PM1/2.5/4/10 + VOC + T + RH | UART/I²C | 1s | All-in-one air quality module |
| SCD40/41 (Sensirion) | CO₂ (NDIR) | I²C | 0 (photoacoustic) | True CO₂; no drift; ±50ppm |
| MH-Z19C | CO₂ (NDIR) | UART/PWM | 3 min | Cheap; self-calibrating; adequate |
| MQ-2/135/136 | LPG/smoke/CO₂/NH₃ | Analogue | 24–48h | Cheap; drifty; need recalibration; 5V |
| MICS-6814 | CO/NO₂/NH₃ | Analogue | 15 min | Compact; 3 sensors; use with care |
| SHT4x + SGP41 | Humidity + VOC + NOₓ | I²C | 10s | Sensirion indoor air quality combo |

**Electrochemical gas sensors** (CO, H₂S, SO₂): Higher accuracy for specific gases, but degrade over 2–5 years and require factory calibration. Used in industrial safety monitoring.

### Soil & Agricultural (SA Relevance)

| Measurement | Sensor | Interface | Notes |
|-------------|--------|---------|-------|
| Soil moisture (capacitive) | Capacitive soil sensor v1.2 | ADC | No corrosion; better than resistive |
| Soil moisture (FDR) | Sentek EnviroSCAN | SDI-12 | Industrial; multi-depth |
| Soil temperature | DS18B20 in probe | 1-Wire | Stainless steel probe; watertight |
| Soil EC (electrical conductivity) | Atlas Scientific EZO-EC | UART/I²C | ±2%; requires calibration solutions |
| Leaf wetness | 200SS-WS leaf wetness | Analogue | Grid resistance; simple |
| Rainfall | Tipping bucket rain gauge | Pulse count | 0.2mm/tip; interrupt-driven counter |
| Wind speed | Anemometer (cup) | Pulse count | Calibrate: Hz → m/s curve |
| Water level | Ultrasonic (JSN-SR04T) | Trigger/Echo | Weatherproof; 20–600cm |

**SA precision agriculture**: Significant IoT deployments in Western Cape wine farms, Limpopo citrus, KZN sugarcane. LoRaWAN preferred (range, battery life). Local integrators: Aerobotics, Aerospec, WineMS.

---

## Interface Protocols

### I²C

- Two-wire (SDA + SCL); multi-master capable; 100kHz / 400kHz / 1MHz / 3.4MHz
- 7-bit address space (128 devices; typically 20–50 usable after reserved)
- Pull-up resistors: 4.7kΩ at 100kHz (3.3V); 2.2kΩ at 400kHz
- Pull-up calculation: R_max = (Vcc − 0.4V) / 3mA; R_min = trise_max / Cbus
- Clock stretching: slow sensors hold SCL low — ensure master supports it
- **Address conflicts**: multiple sensors with same address → use I²C multiplexer (TCA9548A)

```c
// I²C read example (STM32 HAL)
uint8_t buf[2];
HAL_I2C_Mem_Read(&hi2c1, SENSOR_ADDR << 1, REG_TEMP, I2C_MEMADD_SIZE_8BIT, buf, 2, HAL_MAX_DELAY);
int16_t raw = (buf[0] << 8) | buf[1];
float temp_c = raw * 0.0078125f;  // SHT4x conversion
```

### SPI

- Four-wire (MOSI, MISO, SCLK, CS); single-master; up to 80MHz
- CS active-low; one CS pin per device (no address conflict issue)
- Clock polarity (CPOL) and phase (CPHA): check datasheet; CPOL=0/CPHA=0 is most common
- Full-duplex: transmit and receive simultaneously
- Better for high-speed ADCs, display drivers, high-resolution sensors

### UART

- Two-wire (TX, RX) + optional RTS/CTS; point-to-point
- Baud rate must match exactly (common: 9600, 115200)
- RS-232: ±12V signalling; long cable runs; needs level shifter
- RS-485: differential; 32 nodes; 1.2km; 10Mbps; use for industrial multi-drop

### 4-20mA Current Loop

Standard for industrial sensors. 4mA = zero, 20mA = full-scale. Immune to resistive cable losses (up to 1kΩ loop resistance). Dead band below 4mA indicates wire break.

```
ADC voltage = I_loop × R_sense
Engineering value = (I_loop - 0.004) / 0.016 × full_scale_value
```

Use a 100–250Ω precision resistor as current sense. ADC input: 0.4V (4mA) to 2.0V (20mA) across 100Ω. Single-supply with 3.3V ADC.

### SDI-12

Serial digital interface at 1200 baud. Used extensively in environmental and agricultural sensors (soil sensors, weather stations, water quality probes). One wire + ground. Up to 10 sensors per bus. ASCII command/response protocol.

```
Measurement command: aM!  (a = address 0-9, M = measure)
Response: a<ttt><n><cr><lf>  (ttt = seconds until ready, n = values)
Data command: aD0!
Response: a<values><cr><lf>
```

---

## ADC Design

### Resolution vs Noise

ADC effective resolution is limited by noise floor:
```
ENOB = (SNR - 1.76) / 6.02  (Effective Number of Bits)

A 12-bit ADC (theoretical SNR = 74dB) rarely achieves ENOB > 10-11 bits in practice
```

### Oversampling for Noise Reduction

Averaging N samples increases resolution by 0.5 bits per 4× oversampling:
```
Extra bits = log2(N) / 2
For +2 bits: N = 16 samples averaged
For +4 bits: N = 256 samples averaged
```

### ADC Reference Voltage

- Ratiometric: sensor and ADC share the same supply — noise cancels. Best for resistive dividers (thermistors, potentiometers).
- Absolute: use a precision reference (LM4040, ADR3412). Required for absolute measurements.
- Internal reference: most MCUs have 1.1V or 2.5V internal bandgap — adequate for many applications; check temperature coefficient.

---

## Calibration

### Two-Point Calibration

```python
# Apply at firmware or platform level
def calibrate(raw, raw_low, raw_high, val_low, val_high):
    slope = (val_high - val_low) / (raw_high - raw_low)
    return val_low + slope * (raw - raw_low)

# Example: CO₂ sensor at 400ppm ambient and known 2000ppm gas
cal_400 = 512   # ADC reading in ambient air (~400ppm CO₂)
cal_2000 = 1843 # ADC reading with 2000ppm reference gas
current_ppm = calibrate(raw_reading, cal_400, cal_2000, 400, 2000)
```

### Calibration Storage

Store calibration coefficients in:
- Non-volatile flash (internal MCU flash, last sector)
- External EEPROM/FRAM (AT24C02, MB85RC)
- NVS (Non-Volatile Storage) subsystem (ESP-IDF, Zephyr settings)
- Platform database (retrieve on boot via MQTT/HTTPS — allows remote recalibration)

### Field Calibration Considerations

- Temperature drift: recalibrate at operating temperature, not bench temperature
- Long-term drift: plan for annual recalibration visits on precision sensors
- Sensor replacement: calibration coefficients are device-specific — don't share between units
- Traceable calibration: ISO 17025 accredited lab for regulated industries (food safety, pharmaceutical, environmental compliance)

---

## Sensor Fusion

Combining multiple sensor readings to derive a higher-quality output than any single sensor provides.

### Complementary Filter (Attitude Estimation)

Accelerometer gives absolute orientation but is noisy. Gyroscope gives smooth motion but drifts. Blend at a cutoff frequency:

```c
float alpha = 0.98f;  // Trust gyro 98%, accelerometer 2%
angle = alpha * (angle + gyro_rate * dt) + (1 - alpha) * accel_angle;
```

### Kalman Filter

Optimal state estimator for linear systems with Gaussian noise. Widely used in GPS+IMU fusion, motor control, environmental monitoring. Computationally heavier than complementary filter — justified when accuracy is critical.

### Anomaly Detection at the Edge

Run a simple statistical outlier filter at the sensor node before transmitting:
```c
// Z-score outlier rejection
float mean = rolling_mean(history, N);
float std  = rolling_std(history, N);
if (fabs(new_reading - mean) > 3.0f * std) {
    // Outlier — discard or flag, don't transmit as valid reading
    return;
}
```
Reduces bandwidth, storage costs, and prevents spurious alerts from corrupt readings.
