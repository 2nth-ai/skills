---
name: Embedded Firmware Development
description: >
  Bare-metal and RTOS firmware for IoT devices — MCU architecture selection,
  FreeRTOS/Zephyr, peripheral drivers, OTA updates, power management in firmware,
  and CI/CD for embedded systems.
requires:
  - iot/hardware
improves: []
metadata:
  domain: iot
  subdomain: firmware
  maturity: stable
  author: 2nth.ai
  version: "1.0.0"
  categories: "IoT, Embedded, Firmware, RTOS, OTA, Power Management"
allowed-tools: Bash(curl:*) Read Write Edit Glob Grep
---

# Embedded Firmware Development

Firmware is the software layer closest to silicon. It owns the hardware, manages peripherals, enforces power budgets, and guarantees the device works unattended for years. This skill covers the full firmware stack from MCU selection through CI/CD — the decisions that determine whether a product ships on time and survives in the field.

---

## 1. MCU Architecture Selection

Choosing the wrong MCU costs months. Match the silicon to the power budget, connectivity requirements, cost target, and certification path before writing a line of code.

### Comparison Table

| MCU | Core | Flash/RAM | Connectivity | Active Current | Sleep (deep) | Price (1k) | Ecosystem |
|-----|------|-----------|-------------|---------------|-------------|-----------|-----------|
| ESP32 | Xtensa LX6 240MHz dual | 4 MB / 520 KB | WiFi b/g/n + BLE 4.2 | ~80 mA | ~10 µA | $2.00 | ESP-IDF, Arduino |
| ESP32-S3 | Xtensa LX7 240MHz dual | 8 MB / 512 KB | WiFi + BLE 5 + USB OTG | ~80 mA | ~7 µA | $2.50 | ESP-IDF, TFLite Micro |
| nRF52840 | Cortex-M4F 64MHz | 1 MB / 256 KB | BLE 5 + IEEE 802.15.4 + USB | ~4 mA | ~1.5 µA | $3.50 | Zephyr, nRF SDK |
| STM32L4 | Cortex-M4F 80MHz | up to 2 MB / 640 KB | None (add modem) | ~8 mA | ~300 nA | $2.80 | STM32Cube HAL |
| STM32H7 | Cortex-M7 480MHz | 2 MB / 1 MB | Ethernet, USB HS | ~220 mA | ~2 µA | $6.00 | STM32Cube HAL |
| RP2040 | Cortex-M0+ 133MHz dual | ext QSPI / 264 KB | None (add modem) | ~25 mA | ~0.8 mA | $1.00 | Arduino, SDK C/C++ |
| SAMD21 | Cortex-M0+ 48MHz | 256 KB / 32 KB | None (add modem) | ~6 mA | ~2 µA | $1.80 | Arduino, ASF |
| SAMD51 | Cortex-M4F 120MHz | 1 MB / 192 KB | USB HS | ~19 mA | ~2 µA | $2.80 | Arduino, ASF |

### Selection Criteria Matrix

| Requirement | Best Fit |
|-------------|----------|
| WiFi + BLE, cost-sensitive | ESP32 |
| On-device ML inference | ESP32-S3 (vector instructions) |
| Ultra-low power BLE mesh | nRF52840 |
| Low power + analog peripherals | STM32L4 |
| High-compute (vision, DSP) | STM32H7 |
| Maker/rapid prototype | RP2040 |
| CE/FCC pre-certified module | ESP32 module, nRF52840 DK |
| MatterTM / Thread | nRF52840 (OpenThread native) |

**Certification note**: Buying a certified module (e.g., ESP32-WROOM-32, u-blox ANNA-B112) offloads RF certification. DIY PCB with raw die requires full Part 15B/CE RED testing — budget 6–12 weeks.

---

## 2. Bare-Metal Programming

### Startup Sequence

Before `main()` runs, the startup file configures the vector table, initialises the stack pointer, copies `.data` from Flash to SRAM, and zeroes `.bss`.

```c
/* startup_stm32l4xx.s — simplified ARM Cortex-M4 vector table */
.section .isr_vector, "a", %progbits
.type  g_pfnVectors, %object

g_pfnVectors:
    .word  _estack                  /* initial stack pointer (top of SRAM) */
    .word  Reset_Handler            /* reset                                */
    .word  NMI_Handler
    .word  HardFault_Handler
    .word  MemManage_Handler
    .word  BusFault_Handler
    .word  UsageFault_Handler
    /* ... peripheral IRQs follow */

Reset_Handler:
    /* Copy .data section from Flash to SRAM */
    ldr  r0, =_sdata
    ldr  r1, =_edata
    ldr  r2, =_sidata
copy_data:
    cmp  r0, r1
    bge  zero_bss
    ldr  r3, [r2], #4
    str  r3, [r0], #4
    b    copy_data
zero_bss:
    ldr  r0, =_sbss
    ldr  r1, =_ebss
    mov  r2, #0
zero_loop:
    cmp  r0, r1
    bge  call_main
    str  r2, [r0], #4
    b    zero_loop
call_main:
    bl   SystemInit              /* clock setup (CMSIS) */
    bl   main
```

### Clock Initialisation (STM32 HAL)

```c
static void SystemClock_Config(void)
{
    RCC_OscInitTypeDef osc = {0};
    RCC_ClkInitTypeDef clk = {0};

    /* Enable MSI oscillator at 4 MHz, then PLL to 80 MHz */
    osc.OscillatorType = RCC_OSCILLATORTYPE_MSI;
    osc.MSIState       = RCC_MSI_ON;
    osc.MSICalibrationValue = 0;
    osc.MSIClockRange  = RCC_MSIRANGE_6;   /* 4 MHz */
    osc.PLL.PLLState   = RCC_PLL_ON;
    osc.PLL.PLLSource  = RCC_PLLSOURCE_MSI;
    osc.PLL.PLLM       = 1;
    osc.PLL.PLLN       = 40;
    osc.PLL.PLLR       = RCC_PLLR_DIV2;   /* 80 MHz SYSCLK */
    HAL_RCC_OscConfig(&osc);

    clk.ClockType      = RCC_CLOCKTYPE_SYSCLK | RCC_CLOCKTYPE_HCLK |
                         RCC_CLOCKTYPE_PCLK1  | RCC_CLOCKTYPE_PCLK2;
    clk.SYSCLKSource   = RCC_SYSCLKSOURCE_PLLCLK;
    clk.AHBCLKDivider  = RCC_SYSCLK_DIV1;
    clk.APB1CLKDivider = RCC_HCLK_DIV1;
    clk.APB2CLKDivider = RCC_HCLK_DIV1;
    HAL_RCC_ClockConfig(&clk, FLASH_LATENCY_4);
}
```

### Peripheral Register Access vs HAL

Direct register access is faster and smaller; HAL is portable and safer for maintenance.

```c
/* Direct register access — toggle PA5 in ~1 cycle */
GPIOA->BSRR = (1U << 5);          /* set   */
GPIOA->BSRR = (1U << (5 + 16));   /* reset */

/* HAL equivalent — readable but 5-10x more instructions */
HAL_GPIO_WritePin(GPIOA, GPIO_PIN_5, GPIO_PIN_SET);
```

Use direct access in ISRs and timing-critical paths; HAL elsewhere.

### Interrupt Handling (NVIC)

```c
/* Configure NVIC priority before enabling IRQ */
NVIC_SetPriority(USART2_IRQn, 5);   /* lower number = higher priority */
NVIC_EnableIRQ(USART2_IRQn);

/* ISR rules:
   1. No blocking calls (no HAL_Delay, no vTaskDelay)
   2. No heap allocation (no malloc/free)
   3. Keep execution < ~10 µs for high-rate peripherals
   4. Signal the task, do the work in task context        */
void USART2_IRQHandler(void)
{
    BaseType_t xHigherPriorityTaskWoken = pdFALSE;

    if (USART2->ISR & USART_ISR_RXNE) {
        uint8_t byte = (uint8_t)(USART2->RDR & 0xFF);
        xQueueSendFromISR(uart_rx_queue, &byte, &xHigherPriorityTaskWoken);
    }
    portYIELD_FROM_ISR(xHigherPriorityTaskWoken);
}
```

### DMA Circular Buffer for ADC

```c
#define ADC_BUF_LEN 256
volatile uint16_t adc_buf[ADC_BUF_LEN];   /* volatile: written by DMA, read by CPU */

/* Half-transfer and transfer-complete interrupts give double-buffer behaviour */
void HAL_ADC_ConvHalfCpltCallback(ADC_HandleTypeDef *hadc)
{
    process_adc_samples(&adc_buf[0], ADC_BUF_LEN / 2);
}

void HAL_ADC_ConvCpltCallback(ADC_HandleTypeDef *hadc)
{
    process_adc_samples(&adc_buf[ADC_BUF_LEN / 2], ADC_BUF_LEN / 2);
}
```

### `volatile` Correctness

```c
/* WRONG: compiler may cache PORTA_PIN in a register — reads stale value */
uint8_t pin_state = PORTA_PIN;
while (pin_state == 0) { pin_state = PORTA_PIN; }

/* CORRECT: volatile forces a memory read each iteration */
volatile uint8_t *pin = (volatile uint8_t *)0x40000000;
while (*pin == 0) {}
```

Use `volatile` for: hardware registers, ISR-shared variables, DMA buffers. Do not use as a substitute for proper memory barriers in SMP (use `__DMB()`).

---

## 3. FreeRTOS

### Task Creation and Stack Sizing

```c
#include "FreeRTOS.h"
#include "task.h"

/* Static allocation avoids heap fragmentation on constrained devices */
static StaticTask_t sensor_tcb;
static StackType_t  sensor_stack[256];   /* 256 * 4 = 1 KB */

TaskHandle_t sensor_task_handle;

void sensor_task(void *pvParameters)
{
    TickType_t last_wake = xTaskGetTickCount();
    for (;;) {
        read_sensor_and_publish();
        vTaskDelayUntil(&last_wake, pdMS_TO_TICKS(100));   /* 10 Hz, drift-free */
    }
}

int main(void)
{
    sensor_task_handle = xTaskCreateStatic(
        sensor_task,
        "Sensor",
        256,              /* stack depth in words */
        NULL,             /* parameter */
        3,                /* priority — higher number = higher priority */
        sensor_stack,
        &sensor_tcb
    );

    vTaskStartScheduler();
    for (;;);   /* never reached */
}
```

### Inter-Task Communication

```c
/* Queue: typed, ordered, thread-safe — preferred for data passing */
QueueHandle_t sensor_queue = xQueueCreate(10, sizeof(sensor_reading_t));

/* Producer (sensor task) */
sensor_reading_t reading = { .temp_c = 23.5f, .timestamp = xTaskGetTickCount() };
xQueueSend(sensor_queue, &reading, pdMS_TO_TICKS(10));

/* Consumer (publish task) */
sensor_reading_t rx;
if (xQueueReceive(sensor_queue, &rx, portMAX_DELAY) == pdPASS) {
    mqtt_publish(rx);
}

/* Mutex: protect shared resource — NOT from ISR */
SemaphoreHandle_t i2c_mutex = xSemaphoreCreateMutex();
xSemaphoreTake(i2c_mutex, portMAX_DELAY);
i2c_write(dev_addr, buf, len);
xSemaphoreGive(i2c_mutex);

/* Event group: broadcast multiple flags simultaneously */
EventGroupHandle_t sys_events = xEventGroupCreate();
#define EVT_WIFI_CONNECTED  (1 << 0)
#define EVT_MQTT_READY      (1 << 1)

/* Wait for both flags before proceeding */
xEventGroupWaitBits(sys_events,
    EVT_WIFI_CONNECTED | EVT_MQTT_READY,
    pdFALSE,    /* don't clear on exit */
    pdTRUE,     /* wait for ALL bits */
    portMAX_DELAY);
```

### Common Pitfalls

```c
/* Stack overflow — enable runtime check */
/* FreeRTOSConfig.h */
#define configCHECK_FOR_STACK_OVERFLOW  2   /* method 2: pattern check */

void vApplicationStackOverflowHook(TaskHandle_t xTask, char *pcTaskName)
{
    /* Log pcTaskName, then reset or halt */
    __BKPT(0);   /* break in debugger; in production, trigger watchdog */
}

/* configASSERT — catches FreeRTOS API misuse at development time */
#define configASSERT(x) \
    do { if (!(x)) { taskDISABLE_INTERRUPTS(); for (;;); } } while (0)

/* Priority inversion prevention — use mutex, not semaphore, for shared resources */
/* FreeRTOS mutexes implement priority inheritance automatically               */

/* Heap model selection — FreeRTOSConfig.h */
/* heap_1: no free(), deterministic                   */
/* heap_2: best-fit, fragmentation risk               */
/* heap_3: wraps malloc/free, not deterministic       */
/* heap_4: first-fit, coalesces adjacent free blocks  */
/* heap_5: spans multiple memory regions (recommended for complex layouts) */
```

### Runtime Stats

```c
/* FreeRTOSConfig.h */
#define configGENERATE_RUN_TIME_STATS           1
#define configUSE_TRACE_FACILITY                1
#define configUSE_STATS_FORMATTING_FUNCTIONS    1
#define portCONFIGURE_TIMER_FOR_RUN_TIME_STATS()  setup_stats_timer()
#define portGET_RUN_TIME_COUNTER_VALUE()           get_stats_timer_count()

/* Print task stats over UART */
char stats_buf[512];
vTaskGetRunTimeStats(stats_buf);
printf("%s\n", stats_buf);
/* Output: Task Name  Abs Time  % Time
           Sensor     12345     12%
           Publish    8901      9%
           IDLE       78000     78% */
```

---

## 4. Zephyr RTOS

### Devicetree Overlay (Board Shield)

```dts
/* boards/shields/my_sensor_shield/my_sensor_shield.overlay */
/ {
    aliases {
        sensor0 = &bme280_i2c;
    };
};

&i2c0 {
    status = "okay";
    clock-frequency = <I2C_BITRATE_FAST>;   /* 400 kHz */

    bme280_i2c: bme280@76 {
        compatible = "bosch,bme280";
        reg = <0x76>;
        label = "BME280";
    };
};
```

### Kconfig

```kconfig
# prj.conf — enable what you need, nothing else
CONFIG_I2C=y
CONFIG_SENSOR=y
CONFIG_BME280=y
CONFIG_MQTT_LIB=y
CONFIG_WIFI=y
CONFIG_NET_TCP=y
CONFIG_NET_SOCKETS=y
CONFIG_LOG=y
CONFIG_LOG_DEFAULT_LEVEL=3      # INFO
CONFIG_SHELL=y
CONFIG_PM=y                     # power management
CONFIG_PM_DEVICE=y
```

### Application Skeleton

```c
#include <zephyr/kernel.h>
#include <zephyr/drivers/sensor.h>
#include <zephyr/logging/log.h>

LOG_MODULE_REGISTER(app, LOG_LEVEL_INF);

#define SENSOR_NODE DT_ALIAS(sensor0)
static const struct device *sensor_dev = DEVICE_DT_GET(SENSOR_NODE);

void main(void)
{
    if (!device_is_ready(sensor_dev)) {
        LOG_ERR("Sensor not ready");
        return;
    }

    struct sensor_value temp, humidity;
    while (1) {
        sensor_sample_fetch(sensor_dev);
        sensor_channel_get(sensor_dev, SENSOR_CHAN_AMBIENT_TEMP, &temp);
        sensor_channel_get(sensor_dev, SENSOR_CHAN_HUMIDITY,     &humidity);

        LOG_INF("Temp: %d.%06d C  Hum: %d.%06d %%",
                temp.val1, temp.val2, humidity.val1, humidity.val2);

        k_sleep(K_MSEC(1000));
    }
}
```

### Power Management (Zephyr PM)

```c
/* Suspend a peripheral device when not in use */
pm_device_action_run(sensor_dev, PM_DEVICE_ACTION_SUSPEND);
/* ... do other work ... */
pm_device_action_run(sensor_dev, PM_DEVICE_ACTION_RESUME);

/* System-level sleep — Zephyr selects deepest state compatible with next wake */
/* Configured in prj.conf:
   CONFIG_PM=y
   CONFIG_PM_DEVICE=y
   CONFIG_PM_DEVICE_RUNTIME=y   */
```

### West Build Commands

```bash
# Build for nRF52840 DK with custom shield
west build -b nrf52840dk_nrf52840 -- -DSHIELD=my_sensor_shield

# Flash
west flash

# Attach serial console
west espressif monitor   # for ESP32
minicom -D /dev/ttyACM0 -b 115200

# Run unit tests on host (Twister)
west twister -T tests/unit -p native_posix
```

---

## 5. Peripheral Drivers

### UART — Ring Buffer with DMA Idle-Line Interrupt

Variable-length packets are difficult with fixed DMA. The UART idle-line interrupt fires when the line goes silent, signalling end-of-packet regardless of length.

```c
#define UART_RX_BUF_SIZE  512
uint8_t uart_dma_buf[UART_RX_BUF_SIZE];

/* STM32 HAL — enable DMA receive + idle line interrupt */
HAL_UARTEx_ReceiveToIdle_DMA(&huart2, uart_dma_buf, UART_RX_BUF_SIZE);
__HAL_DMA_DISABLE_IT(&hdma_usart2_rx, DMA_IT_HT);  /* suppress half-transfer IRQ */

/* Callback fires on idle (end of packet) or buffer full */
void HAL_UARTEx_RxEventCallback(UART_HandleTypeDef *huart, uint16_t Size)
{
    if (huart->Instance == USART2) {
        /* Size = number of bytes received since last call */
        process_packet(uart_dma_buf, Size);
        /* Re-arm for next packet */
        HAL_UARTEx_ReceiveToIdle_DMA(&huart2, uart_dma_buf, UART_RX_BUF_SIZE);
    }
}
```

### SPI — CS Management and Clock Mode

```c
/* SPI modes: CPOL/CPHA
   Mode 0: CPOL=0 CPHA=0 — clock idle low,  sample on rising  edge (most common)
   Mode 1: CPOL=0 CPHA=1 — clock idle low,  sample on falling edge
   Mode 2: CPOL=1 CPHA=0 — clock idle high, sample on falling edge
   Mode 3: CPOL=1 CPHA=1 — clock idle high, sample on rising  edge */

static inline void spi_cs_assert(void)   { HAL_GPIO_WritePin(SPI_CS_GPIO, SPI_CS_PIN, GPIO_PIN_RESET); }
static inline void spi_cs_deassert(void) { HAL_GPIO_WritePin(SPI_CS_GPIO, SPI_CS_PIN, GPIO_PIN_SET);   }

uint8_t spi_transfer_byte(uint8_t tx)
{
    uint8_t rx;
    spi_cs_assert();
    HAL_SPI_TransmitReceive(&hspi1, &tx, &rx, 1, HAL_MAX_DELAY);
    spi_cs_deassert();
    return rx;
}

/* Read register from SPI device (common pattern: send reg addr, read response) */
uint8_t read_reg(uint8_t reg_addr)
{
    uint8_t tx[2] = { reg_addr | 0x80, 0x00 };   /* 0x80 = read bit */
    uint8_t rx[2] = {0};
    spi_cs_assert();
    HAL_SPI_TransmitReceive(&hspi1, tx, rx, 2, HAL_MAX_DELAY);
    spi_cs_deassert();
    return rx[1];
}
```

### I2C — Clock Stretching and Error Recovery

```c
/* Write then read (register read pattern) */
HAL_StatusTypeDef i2c_read_reg(uint8_t dev_addr, uint8_t reg, uint8_t *data, uint16_t len)
{
    HAL_StatusTypeDef status;
    /* Write register address */
    status = HAL_I2C_Master_Transmit(&hi2c1, dev_addr << 1, &reg, 1, 10);
    if (status != HAL_OK) goto recovery;
    /* Read data */
    status = HAL_I2C_Master_Receive(&hi2c1, dev_addr << 1, data, len, 10);
    if (status != HAL_OK) goto recovery;
    return HAL_OK;

recovery:
    /* I2C bus recovery: toggle SCL 9 times to release stuck slave */
    for (int i = 0; i < 9; i++) {
        HAL_GPIO_WritePin(I2C1_SCL_GPIO, I2C1_SCL_PIN, GPIO_PIN_SET);
        HAL_Delay(1);
        HAL_GPIO_WritePin(I2C1_SCL_GPIO, I2C1_SCL_PIN, GPIO_PIN_RESET);
        HAL_Delay(1);
    }
    HAL_I2C_Init(&hi2c1);  /* re-initialise peripheral */
    return status;
}
```

### GPIO Debounce

```c
/* Software debounce — sample in systick or timer ISR, not in EXTI ISR */
#define DEBOUNCE_TICKS  5   /* 5 ms @ 1 ms tick */

typedef struct {
    GPIO_TypeDef *port;
    uint16_t      pin;
    uint8_t       count;
    uint8_t       state;
} debounced_button_t;

void debounce_tick(debounced_button_t *btn)
{
    uint8_t raw = (btn->port->IDR & btn->pin) ? 1 : 0;
    if (raw != btn->state) {
        btn->count++;
        if (btn->count >= DEBOUNCE_TICKS) {
            btn->state = raw;
            btn->count = 0;
            on_button_state_change(btn->state);
        }
    } else {
        btn->count = 0;
    }
}
```

### PWM — Frequency and Duty Cycle Maths

```c
/* Timer peripheral: ARR sets period, CCR sets duty cycle
   F_pwm = F_timer / (PSC + 1) / (ARR + 1)
   Duty  = CCR / (ARR + 1)                   */

void pwm_set(TIM_HandleTypeDef *htim, uint32_t channel,
             uint32_t freq_hz, uint8_t duty_pct)
{
    uint32_t timer_clk = HAL_RCC_GetPCLK1Freq() * 2;  /* APB1 timer clock */
    uint32_t period    = (timer_clk / freq_hz) - 1;
    uint32_t pulse     = (period * duty_pct) / 100;

    __HAL_TIM_SET_AUTORELOAD(htim, period);
    __HAL_TIM_SET_COMPARE(htim, channel, pulse);
}
```

### ADC — Oversampling for Noise Reduction

Hardware oversampling averages N samples in the ADC peripheral, effective resolution = log2(N)/2 extra bits.

```c
/* STM32L4 — 16x hardware oversampling adds 2 bits resolution (12 → 14 bit) */
ADC_OversamplingTypeDef os = {
    .Ratio                 = ADC_OVERSAMPLING_RATIO_16,
    .RightBitShift         = ADC_RIGHTBITSHIFT_4,    /* divide by 16 */
    .TriggeredMode         = ADC_TRIGGEREDMODE_SINGLE_TRIGGER,
    .OversamplingStopReset = ADC_REGOVERSAMPLING_CONTINUED_MODE,
};
hadc1.Init.Oversampling = os;
HAL_ADC_Init(&hadc1);
```

---

## 6. OTA (Over-The-Air) Updates

### Dual-Bank Flash Layout

```
┌──────────────────────────────────────────────────┐
│  Sector 0   MCUboot bootloader (48 KB)           │
├──────────────────────────────────────────────────┤
│  Sector 1   Image Slot 0 — active firmware       │  ← runs from here
├──────────────────────────────────────────────────┤
│  Sector 2   Image Slot 1 — pending update        │  ← downloaded here
├──────────────────────────────────────────────────┤
│  Sector 3   Scratch area (swap buffer)           │
└──────────────────────────────────────────────────┘
```

### MCUboot Integration

MCUboot validates each slot with a SHA-256 hash and optional ECDSA-P256 signature before booting.

```c
/* Confirm boot is successful — call after successful cloud connection post-OTA */
#include "bootutil/bootutil.h"

int confirm_ota_success(void)
{
    struct boot_rsp rsp;
    int rc = boot_set_confirmed();   /* marks slot 0 as permanent */
    if (rc != 0) {
        /* On next reset MCUboot will revert to previous image */
        return rc;
    }
    return 0;
}
```

```cmake
# west sign — sign image with ECDSA key for MCUboot
west sign -t imgtool -- --key keys/root-ec-p256.pem
```

### HTTPS Download with Certificate Pinning (ESP-IDF)

```c
/* esp_http_client with bundled CA cert */
extern const uint8_t server_cert_pem_start[] asm("_binary_ca_cert_pem_start");
extern const uint8_t server_cert_pem_end[]   asm("_binary_ca_cert_pem_end");

esp_http_client_config_t cfg = {
    .url            = "https://ota.example.com/firmware/latest.bin",
    .cert_pem       = (const char *)server_cert_pem_start,
    .skip_cert_common_name_check = false,   /* enforce CN */
    .event_handler  = ota_http_event_handler,
};

esp_https_ota_config_t ota_cfg = { .http_config = &cfg };
esp_err_t ret = esp_https_ota(&ota_cfg);
if (ret == ESP_OK) {
    confirm_ota_success();
    esp_restart();
} else {
    /* Image rejected — slot 0 unchanged, device still operational */
}
```

### Anti-Brick Patterns

- Always validate image header (magic bytes, version, size) before writing to slot 1.
- Never erase slot 0 until slot 1 is fully written and hash-verified.
- Watchdog must be active during download; a hung download = automatic recovery.
- Increment boot counter on each reset; after N failures without confirmation, roll back.
- Test rollback in CI: inject a deliberately corrupt image and assert the device reverts.

---

## 7. Power Management in Firmware

### Sleep Mode Hierarchy (ARM Cortex-M)

| Mode | STM32 Name | Stop clocks | RAM retained | Wake latency | Typical current |
|------|-----------|-------------|-------------|--------------|----------------|
| CPU idle | Sleep | CPU only | Yes | <1 µs | 5–15 mA |
| Peripheral stop | Stop 1/2 | CPU + most peripherals | Yes | ~5 µs | 5–100 µA |
| RAM retained | Standby | All except RTC | Yes (selected SRAM) | ~50 µs | 1–5 µA |
| Full powerdown | Shutdown | All except wakeup pin | No | ~100 µs + re-init | <300 nA |

```c
/* Enter STM32 Stop 2 mode — lowest power while retaining RAM */
HAL_SuspendTick();                      /* stop SysTick — saves ~1 mA */
__HAL_RCC_WAKEUPSTOP_CLK_CONFIG(RCC_STOP_WAKEUPCLOCK_MSI);
HAL_PWREx_EnterSTOP2Mode(PWR_STOPENTRY_WFI);   /* halts here until wake event */

/* Execution resumes here after wake */
SystemClock_Config();                   /* re-apply PLL — MSI is active but slow */
HAL_ResumeTick();
```

### Wake Sources

```c
/* Wake on GPIO external interrupt (e.g., motion sensor INT pin) */
HAL_PWR_EnableWakeUpPin(PWR_WAKEUP_PIN1_HIGH);

/* Wake on RTC alarm — periodic sensor read */
RTC_AlarmTypeDef alarm = {0};
alarm.AlarmTime.Hours   = 0;
alarm.AlarmTime.Minutes = 0;
alarm.AlarmTime.Seconds = 30;   /* wake every 30 s */
alarm.AlarmMask         = RTC_ALARMMASK_DATEWEEKDAY | RTC_ALARMMASK_HOURS | RTC_ALARMMASK_MINUTES;
HAL_RTC_SetAlarm_IT(&hrtc, &alarm, RTC_FORMAT_BIN);
```

### Tickless Idle in FreeRTOS

```c
/* FreeRTOSConfig.h */
#define configUSE_TICKLESS_IDLE  2   /* 2 = custom implementation */

/* Implement the hook — called when all tasks are blocked and scheduler can sleep */
void vPortSuppressTicksAndSleep(TickType_t xExpectedIdleTime)
{
    uint32_t sleep_ms = xExpectedIdleTime * portTICK_PERIOD_MS;
    configure_rtc_wakeup(sleep_ms);
    HAL_PWREx_EnterSTOP2Mode(PWR_STOPENTRY_WFI);
    /* Execution resumes here after wakeup */
    correct_tick_count_after_sleep(sleep_ms);
}
```

### Peripheral Power Gating

```c
/* Disable clocks to unused peripherals — each peripheral ~0.1–1 mA when clocked */
__HAL_RCC_USART1_CLK_DISABLE();   /* UART not needed in sleep */
__HAL_RCC_SPI1_CLK_DISABLE();

/* Power gate external sensor via GPIO load switch */
HAL_GPIO_WritePin(SENSOR_PWR_GPIO, SENSOR_PWR_PIN, GPIO_PIN_RESET);   /* off */
HAL_Delay(10);                                                           /* discharge */
HAL_GPIO_WritePin(SENSOR_PWR_GPIO, SENSOR_PWR_PIN, GPIO_PIN_SET);     /* on */
HAL_Delay(5);                                                            /* startup */
```

### Measuring Sleep Current

- **nRF Power Profiling Kit 2 (PPK2)**: USB source measure unit, 0.2 µA–1 A, 100k samples/s. Essential for nRF targets.
- **uCurrent Gold**: shunt-based, sub-µA precision, connects in series with battery.
- **Otii Arc**: full energy profiling with timeline, correlates UART events with current.
- Always measure from battery (not bench supply through debugger) — debugger holds SWDIO high, adds ~0.5 mA.

---

## 8. CI/CD for Embedded Systems

### GitHub Actions — Firmware Build

```yaml
# .github/workflows/firmware.yml
name: Firmware CI

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-22.04
    container:
      image: espressif/idf:v5.2.1   # pin exact toolchain version

    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: Build firmware
        run: |
          . $IDF_PATH/export.sh
          idf.py build

      - name: Check binary size
        run: |
          python3 $IDF_PATH/tools/idf_size.py build/firmware.map \
            --output-format json > size_report.json
          python3 scripts/check_size_budget.py size_report.json

      - name: Upload artefacts
        uses: actions/upload-artifact@v4
        with:
          name: firmware-${{ github.sha }}
          path: |
            build/firmware.bin
            build/firmware.elf
            size_report.json
```

### Unit Testing on Host (Unity + CMock)

Test pure logic (packet parsers, state machines, sensor calibration maths) on x86 — no hardware needed.

```c
/* tests/test_packet_parser.c */
#include "unity.h"
#include "mock_uart_driver.h"   /* CMock auto-generated from uart_driver.h */
#include "packet_parser.h"

void setUp(void)    { mock_uart_driver_Init(); }
void tearDown(void) { mock_uart_driver_Verify(); }

void test_valid_packet_is_parsed(void)
{
    uint8_t raw[] = { 0xAA, 0x05, 0x01, 0x02, 0x03, 0xAB };   /* header + len + payload + checksum */
    packet_t pkt;
    int rc = parse_packet(raw, sizeof(raw), &pkt);
    TEST_ASSERT_EQUAL(0, rc);
    TEST_ASSERT_EQUAL(3, pkt.payload_len);
    TEST_ASSERT_EQUAL_UINT8_ARRAY((uint8_t[]){0x01,0x02,0x03}, pkt.payload, 3);
}

void test_bad_checksum_rejected(void)
{
    uint8_t raw[] = { 0xAA, 0x05, 0x01, 0x02, 0x03, 0xFF };   /* wrong checksum */
    packet_t pkt;
    int rc = parse_packet(raw, sizeof(raw), &pkt);
    TEST_ASSERT_EQUAL(-EBADMSG, rc);
}
```

```yaml
# CMakeLists.txt for host tests
enable_testing()
add_executable(test_packet_parser
    tests/test_packet_parser.c
    src/packet_parser.c
    unity/src/unity.c
    cmock/src/cmock.c
    tests/mocks/mock_uart_driver.c
)
target_include_directories(test_packet_parser PRIVATE src unity/src cmock/src tests/mocks)
add_test(NAME packet_parser COMMAND test_packet_parser)
```

### Static Analysis

```yaml
# In CI pipeline
- name: cppcheck
  run: |
    cppcheck --enable=all --error-exitcode=1 \
             --suppress=missingInclude \
             --inline-suppr \
             src/

- name: clang-tidy
  run: |
    run-clang-tidy -p build/ src/*.c \
      -checks='-*,clang-analyzer-*,cert-*,bugprone-*'
```

### Binary Signing for OTA

```bash
# Generate ECDSA-P256 key pair (do once, keep private key offline)
imgtool keygen -k keys/root-ec-p256.pem -t ecdsa-p256

# Sign image as part of CI build
imgtool sign \
  --key    keys/root-ec-p256.pem \
  --header-size 0x200 \
  --align  4 \
  --version ${SEMVER} \
  --slot-size 0x60000 \
  build/firmware.bin \
  build/firmware-signed.bin
```

### Semantic Versioning for Firmware

```c
/* version.h — generated by CI from git tag */
#define FW_VERSION_MAJOR  1
#define FW_VERSION_MINOR  4
#define FW_VERSION_PATCH  2
#define FW_VERSION_STR    "1.4.2"
#define FW_BUILD_HASH     "a3f7c1d"   /* short git SHA */
#define FW_BUILD_DATE     "2026-04-01"
```

```bash
# scripts/gen_version.sh — run in CI before build
TAG=$(git describe --tags --match "v*" --abbrev=7 2>/dev/null || echo "v0.0.0-0-g$(git rev-parse --short HEAD)")
MAJOR=$(echo $TAG | sed 's/v\([0-9]*\).*/\1/')
MINOR=$(echo $TAG | sed 's/v[0-9]*\.\([0-9]*\).*/\1/')
PATCH=$(echo $TAG | sed 's/v[0-9]*\.[0-9]*\.\([0-9]*\).*/\1/')
HASH=$(git rev-parse --short HEAD)
cat > src/version.h <<EOF
#define FW_VERSION_MAJOR  ${MAJOR}
#define FW_VERSION_MINOR  ${MINOR}
#define FW_VERSION_PATCH  ${PATCH}
#define FW_VERSION_STR    "${MAJOR}.${MINOR}.${PATCH}"
#define FW_BUILD_HASH     "${HASH}"
#define FW_BUILD_DATE     "$(date -u +%Y-%m-%d)"
EOF
```

---

## Common Gotchas

- **Forgetting `volatile` on ISR-shared variables** — the compiler sees no modification in the main loop and optimises the variable into a register. The loop never sees the update. Always declare ISR-shared state as `volatile`, or use atomic types (`_Atomic` in C11).

- **Stack overflow is silent by default** — FreeRTOS will not detect it unless `configCHECK_FOR_STACK_OVERFLOW` is set to 2. The symptom is random corruption or a hard fault far from the root cause. Run with stack checking always enabled during development; set stack sizes 20% larger than the measured peak.

- **I2C clock stretching hangs the bus** — some STM32 HAL versions have a silicon errata where the I2C peripheral locks up if the slave holds SCL low longer than expected. Implement the 9-pulse SCL recovery sequence and call `HAL_I2C_Init()` to recover. Set a timeout on all I2C transactions; never use `HAL_MAX_DELAY` on a shared bus.

- **DMA buffer in cacheable memory (Cortex-M7/STM32H7)** — the D-cache sees a stale copy of the buffer while DMA writes directly to SRAM. Call `SCB_InvalidateDCache_by_Addr()` before reading DMA RX buffers and `SCB_CleanDCache_by_Addr()` after filling DMA TX buffers. Or place DMA buffers in non-cacheable SRAM (e.g., `__attribute__((section(".dma_buffers")))`).

- **OTA never confirmed = boot loop** — if the application downloads and reboots but never calls `boot_set_confirmed()`, MCUboot will revert to the previous image on the next reset. Always gate confirmation on a successful cloud handshake (not just startup), and test the rollback path in CI.

- **Peripheral clocks not re-enabled after Stop mode** — returning from STM32 Stop mode restores the CPU but peripherals clocked from PLLs that were stopped need re-initialisation. Call `SystemClock_Config()` on wakeup before accessing any peripheral that depends on the PLL. Symptom: UART/SPI/I2C silently produces garbage after first sleep cycle.

- **`HAL_Delay()` called from an ISR** — blocks on the SysTick counter. If the ISR priority is higher than or equal to SysTick priority (or SysTick is suspended for tickless idle), `HAL_Delay` spins forever. Never block in an ISR; post to a queue and handle timing in task context.

- **Unsigned arithmetic underflow in ADC calibration** — subtracting an offset from a `uint16_t` sample that is smaller than the offset wraps to 65535. Use `int32_t` for intermediate calculations and clamp before converting back to the output type.

---

## See Also

- [iot/hardware](../hardware/SKILL.md) — PCB layout, schematic review, component selection
- [ESP-IDF Programming Guide](https://docs.espressif.com/projects/esp-idf/en/latest/)
- [Zephyr Project Documentation](https://docs.zephyrproject.org/latest/)
- [MCUboot Documentation](https://docs.mcuboot.com/)
- [FreeRTOS Reference Manual](https://www.freertos.org/Documentation/RTOS_book.html)
- [CMock + Unity Testing Framework](https://www.throwtheswitch.org/)
