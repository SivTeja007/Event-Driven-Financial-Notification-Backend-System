# 🚀 Event-Driven Financial Notification Back-end System

[![Tech Stack](https://img.shields.io/badge/Stack-Node.js%20|%20TypeScript%20|%20Express%20|%20React%20|%20Vite-blue.svg)](#tech-stack)
[![Architecture](https://img.shields.io/badge/Architecture-Event--Driven%20%7C%20CQRS%20%7C%20Circuit%20Breakers%20%7C%20DLQ-emerald.svg)](#architecture--key-patterns)
[![Compliance](https://img.shields.io/badge/Compliance-TRAI%20DND%20%7C%20DLT%20Header%20Matching-amber.svg)](#regulatory--compliance-trai-dnd)
[![Tests](https://img.shields.io/badge/Tests-Vitest%20%7C%206%20Passed-success.svg)](#testing--verification)

An enterprise-scale, production-grade **Event-Driven Financial Notification Engine** engineered for high-throughput fintech platforms, stock brokerages, and wealth management applications. 

The system processes **25+ distinct financial event types** across **5 communication channels** (*SMS, Email, Push Notifications, WhatsApp Business API, and In-App Feeds*) while enforcing strict TRAI DND regulatory compliance, user preference matrices, quiet hours, frequency capping rate-limiters, dead-letter queue (DLQ) retry strategies, multi-lingual personalisation, and real-time analytics streaming.

---

## 📋 Table of Contents
- [✨ Key Features](#-key-features)
- [⚡ Tech Stack](#-tech-stack)
- [📐 Architecture & Key Patterns](#-architecture--key-patterns)
- [📊 25+ Financial Event Types Matrix](#-25-financial-event-types-matrix)
- [🏛️ Regulatory & Compliance (TRAI DND)](#️-regulatory--compliance-trai-dnd)
- [🔄 Dead-Letter Queue & Circuit Breakers](#-dead-letter-queue--circuit-breakers)
- [🚀 Quick Start & Installation](#-quick-start--installation)
- [📖 User Guide & UI Walkthrough](#-user-guide--ui-walkthrough)
- [📡 REST API & WebSockets Reference](#-rest-api--websockets-reference)
- [🧪 Testing & Verification](#-testing--verification)

---

## ✨ Key Features

- **25+ Financial Event Types**: Categorized across Transactions, Margin & Risk, Wealth/SIP, Price Alerts, and Regulatory Compliance.
- **Multi-Channel Dispatch Engine**: Orchestrates dispatches across **SMS**, **Email**, **Push Notifications**, **WhatsApp Business API**, and **In-App WebSocket Feeds**.
- **TRAI DND & DLT Verification**: Enforces Telecom Regulatory Authority of India (TRAI) DND rules, Distributed Ledger Technology (**DLT Header & Template ID**) compliance, and mandatory promotional quiet windows (21:00 to 09:00 IST).
- **Timezone-Aware Quiet Hours**: Defers non-critical dispatches during user quiet windows while allowing emergency overrides for **CRITICAL** priority events (Margin Calls, Fraud Warnings, OTPs).
- **Sliding-Window Frequency Capping**: Rate-limits promotional and service explicit communications per user to prevent notification fatigue.
- **Resilient Channel Routing & Fallback**: Intelligent priority queueing with automated fallback channel routing (e.g. `SMS` -> `WhatsApp`) when primary providers fail.
- **Circuit Breaker State Machine**: Monitors provider health (`CLOSED`, `OPEN`, `HALF_OPEN`) to isolate downstream failure spikes.
- **DLQ & Exponential Backoff Retries**: Retries failed attempts with `BaseDelay * 2^(attempt-1) + RandomJitter` before committing to Dead-Letter Queue with manual replay APIs.
- **Multi-Lingual Template Engine (i18n)**: Personalised templates with dynamic key interpolation and multi-lingual dictionary support for **English (`en`)**, **Hindi (`hi`)**, **Tamil (`ta`)**, **Gujarati (`gu`)**, and **Marathi (`mr`)**.
- **Real-Time Telemetry & Visual Control Center**: Express REST API + WebSocket Server coupled with a NexBank Matte Black (`#1a1b1c`) & Pure White (`#ffffff`) React Vite UI dashboard displaying throughput (TPS), SLA percentiles (P50, P95, P99), channel costs, and live audit feeds.

---

## ⚡ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Backend Runtime** | Node.js (v24.x) | High-performance asynchronous non-blocking runtime |
| **Language** | TypeScript (v5.4) | Strict type-safe domain models & schemas |
| **API Server** | Express (v4.19) | RESTful API routing framework |
| **Real-time Stream**| WebSockets (`ws` v8.17)| Bi-directional telemetry and dispatch status broadcasting |
| **Frontend UI** | React (v18.3) + Vite (v5.2) | Fast modern SPA Control Center Dashboard |
| **Styling System** | Vanilla CSS Tokens | NexBank `#1a1b1c` Matte Black & `#ffffff` Pure White theme |
| **Testing** | Vitest (v1.6) | Lightning-fast unit & integration test runner |
| **Execution** | `tsx` | Direct TypeScript execution engine |

---

## 📐 Architecture & Key Patterns

```
+-----------------------------------------------------------------------------------+
|                            FINANCIAL EVENT PRODUCERS                              |
|   (Core Banking, Trading Engines, Portfolio Trackers, Regulatory Compliance Systems) |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                         EVENT INGESTION & VALIDATOR API                           |
|                       (Validates against catalog & schema)                        |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                            TRAI DND & DLT ENGINE                                  |
|     (Verifies DLT Header/Template IDs, DND status, 21:00-09:00 IST quiet window)  |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                       QUIET HOURS & FREQUENCY CAP ENGINE                          |
|    (Timezone-aware quiet window deferral, 24h sliding window rate limiter)        |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                     TEMPLATE ENGINE & LOCALISATION (i18n)                         |
|     (Renders templates in English, Hindi, Tamil, Gujarati, Marathi + formatters)  |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                        INTELLIGENT ROUTER & FALLBACK                              |
|           (Evaluates user preference matrix & selects active channels)            |
+------------------------------------------+----------------------------------------+
                                           |
      +------------------------------------+------------------------------------+
      |                                    |                                    |
      v                                    v                                    v
+-----------+                        +-----------+                        +-----------+
|    SMS    |                        |   EMAIL   |                        |   PUSH    |
| ADAPTER   |                        | ADAPTER   |                        | ADAPTER   |
+-----+-----+                        +-----+-----+                        +-----+-----+
      |                                    |                                    |
      +------------------------------------+------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                 CIRCUIT BREAKERS & DLQ EXPONENTIAL RETRY ENGINE                   |
|          (Backoff + Jitter retries, Fallback Channel Routing, DLQ Replay)         |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                  REAL-TIME TELEMETRY & WEBSOCKET BROADCASTER                      |
|                  (Streams TPS, SLA Latencies P50/P95/P99 to UI)                  |
+-----------------------------------------------------------------------------------+
```

---

## 📊 25+ Financial Event Types Matrix

The engine comes pre-configured with **25 distinct production-grade financial event types**:

| Category | Event Type | Description | Priority | Standard Channels | DLT Header |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Transaction** | `TXN_HIGH_VALUE_DEBIT` | High-value debit transaction alert | HIGH | Push, SMS, In-App | `BANKTX` |
| | `TXN_SALARY_CREDIT` | Monthly salary credit notice | MEDIUM | Email, Push, In-App | `BANKTX` |
| | `TXN_ATM_WITHDRAWAL` | ATM cash withdrawal notice | HIGH | SMS, Push, In-App | `BANKTX` |
| | `TXN_INTL_CARD` | Foreign currency card transaction | CRITICAL | SMS, Push, WhatsApp | `BANKSEC` |
| | `TXN_UPI_RECEIVED` | Instant UPI payment credit | LOW | Push, In-App | `BANKUPI` |
| **Margin & Risk**| `MARGIN_CALL_CRITICAL` | Margin balance shortfall (<15%) | CRITICAL | SMS, Push, WhatsApp, Email | `FINRISK` |
| | `RISK_STOP_LOSS` | Automatic stop-loss order executed | HIGH | Push, SMS, In-App | `FINRISK` |
| | `RISK_LIQUIDATION_WARN`| Impending position square-off warning | CRITICAL | SMS, Push, WhatsApp | `FINRISK` |
| | `RISK_OPTIONS_EXPIRY` | F&O contracts expiring today | HIGH | Email, Push, In-App | `FINRISK` |
| | `RISK_MTM_LOSS` | Daily MTM unrealized loss threshold | HIGH | Push, In-App, Email | `FINRISK` |
| **Wealth & SIP** | `SIP_DUE_REMINDER` | Mutual fund SIP auto-debit reminder | MEDIUM | Push, WhatsApp, Email | `WEALTH` |
| | `MUTUAL_FUND_NAV` | Target NAV reached alert | LOW | Push, In-App | `WEALTH` |
| | `DIVIDEND_CREDITED` | Corporate dividend payment credited | LOW | Email, In-App | `WEALTH` |
| | `BOND_COUPON_PAID` | Sovereign Bond coupon interest payout | MEDIUM | Email, In-App, SMS | `WEALTH` |
| | `PORTFOLIO_REBALANCE` | Asset allocation drift advice | LOW | Email, Push | `WEALTH` |
| **Price Alerts**| `PRICE_52WK_BREAKOUT` | 52-Week High / Low breakout alert | MEDIUM | Push, In-App, WhatsApp | `MKTALRT` |
| | `PRICE_TARGET_HIT` | Custom user stock price target hit | HIGH | Push, SMS, In-App | `MKTALRT` |
| | `MARKET_CIRCUIT_LIMIT`| Trading halt upper/lower circuit hit | HIGH | Push, In-App | `MKTALRT` |
| | `MARKET_VOLUME_SPIKE` | Unusual institutional volume spike | LOW | Push, In-App | `MKTALRT` |
| | `CRYPTO_VOLATILITY` | Rapid 10%+ price fluctuation alert | MEDIUM | Push, WhatsApp | `MKTALRT` |
| **Regulatory** | `REG_DND_OPT_OUT` | TRAI DND opt-out confirmation | MEDIUM | SMS, Email, In-App | `COMPLNC` |
| | `REG_KYC_RENEWAL` | Mandatory CKYC update deadline | HIGH | Email, Push, WhatsApp | `COMPLNC` |
| | `REG_TAX_STATEMENT` | Annual capital gains tax report ready | LOW | Email, In-App | `COMPLNC` |
| | `REG_DEMAT_AUDIT` | Monthly NSDL/CDSL holding balance | LOW | Email | `COMPLNC` |
| | `SECURITY_FRAUD_ALERT` | Suspicious login / unrecognized IP | CRITICAL | SMS, Push, WhatsApp, Email | `BANKSEC` |

---

## 🏛️ Regulatory & Compliance (TRAI DND)

The engine implements Indian Telecom Regulatory Authority (TRAI) compliance:

1. **DLT Registration Verification**: Checks mandatory `dltHeaderId` and `dltTemplateId` bindings before forwarding messages to SMS or WhatsApp gateways.
2. **Category Classification Rules**:
   - `SERVICE_IMPLICIT` & `TRANSACTIONAL`: Critical OTPs, Margin Shortfalls, Fraud Alerts bypass TRAI DND and can be delivered 24/7.
   - `SERVICE_EXPLICIT`: Delivered according to explicit user opt-in consent.
   - `PROMOTIONAL`: Blocked if the user has DND active, or if current time falls within the TRAI mandatory quiet period (**21:00 to 09:00 IST**).

---

## 🔄 Dead-Letter Queue & Circuit Breakers

- **Circuit Breaker per Provider**: 3-state state machine (`CLOSED`, `OPEN`, `HALF_OPEN`). Automatically trips to `OPEN` if provider failure rate exceeds 30% over 20 requests.
- **Fallback Channel Strategy**: When a primary channel (e.g. `SMS`) fails or circuit opens, `HIGH` and `CRITICAL` priority notifications are automatically rerouted to alternative channels (e.g. `WHATSAPP` or `PUSH`).
- **Exponential Backoff with Jitter**:
  ```ts
  delay = Math.min(maxDelay, baseDelay * 2^(attempt-1) + randomJitter)
  ```
- **Dead-Letter Queue (DLQ)**: Captures terminal failures after maximum retries. Includes a REST API endpoint `/api/dlq/replay/:dispatchId` to trigger manual message replays after provider recovery.

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/fintech-event-notification-engine.git
cd fintech-event-notification-engine
npm install
```

### 2. Start the Backend API & WebSocket Server
```bash
npm run server
```
- REST API Server listening on: **`http://localhost:5000`**
- Telemetry WebSocket Stream live on: **`ws://localhost:5000/ws`**

### 3. Start the Visual Monitoring Dashboard UI
```bash
npm run dev
```
Open **`http://localhost:8080`** in your browser.

---

## 📖 User Guide & UI Walkthrough

The visual control center features 6 specialized interactive tabs:

1. **Telemetry Dashboard**: Displays live Throughput (TPS), Delivery SLA Rate %, P50/P95/P99 SLA latencies, TRAI DND blocks, DLQ count, and channel cost estimations.
2. **Financial Event Studio**: Trigger any of the 25+ financial event types with custom JSON payloads, or run high-volume burst simulations (10 to 500 events).
3. **Live Dispatch Stream**: Real-time WebSocket timeline displaying message dispatches, channel badges, SLA latencies, and failure logs.
4. **TRAI DND & Preferences**: Manage TRAI DND opt-in/opt-out status, quiet hours windows, and per-category channel matrices.
5. **i18n Template Studio**: Preview compiled templates in English, Hindi, Tamil, Gujarati, and Marathi with DLT header verification.
6. **DLQ & Fault Injector**: Simulate provider outages (e.g. inject 80% failure into SMS) to test automated circuit breakers, channel fallbacks, and manual DLQ message replays.

---

## 📡 REST API & WebSockets Reference

### REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/events/trigger` | Ingest and process a single financial event |
| `POST` | `/api/events/batch` | Fire a batch simulation burst of events |
| `GET` | `/api/preferences/:userId` | Get user preferences & DND profile |
| `POST` | `/api/preferences/:userId` | Update user preferences & quiet hours |
| `GET` | `/api/dlq` | List all messages in Dead-Letter Queue |
| `POST` | `/api/dlq/replay/:dispatchId` | Manually replay a DLQ message |
| `POST` | `/api/providers/simulate-failure`| Inject failure rate into provider adapter |
| `POST` | `/api/providers/reset-circuit` | Reset provider circuit breakers to CLOSED |
| `GET` | `/api/metrics` | Fetch metric snapshots and audit trail |
| `POST` | `/api/metrics/reset` | Reset telemetry counters |
| `GET` | `/api/events/catalog` | Get complete catalog of 25+ event types |

### Example Ingestion Request
```bash
curl -X POST http://localhost:5000/api/events/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "MARGIN_CALL_CRITICAL",
    "userId": "USR_1001",
    "templateData": {
      "userName": "Tejal Patel",
      "shortfallAmount": 75000,
      "deadline": "11:30 AM Tomorrow"
    }
  }'
```

---

## 🧪 Testing & Verification

### 1. Automated Vitest Unit & Integration Suite
Run unit tests covering event processing, DND rules, quiet hours, rate-limiters, templates, and DLQ retries:
```bash
npm test
```
**Output:**
```
 ✓ tests/notificationEngine.test.ts (6 tests) 686ms

 Test Files  1 passed (1)
      Tests  6 passed (6)
```

### 2. High-Throughput Load Simulation Benchmark
Run the load benchmark script simulating 1,000 financial events with simulated provider outages and fallback routing:
```bash
npm run simulate
```
**Benchmark Output Sample:**
```
================================================================
📊 SIMULATION METRICS & BENCHMARK SUMMARY 📊
================================================================
⏱️ Total Execution Time: 21.20 seconds
⚡ Throughput (TPS): 37.55 events/sec
📥 Total Events Ingested: 1000
📤 Total Channel Dispatches: 796
✅ Total Delivered: 796
🚫 TRAI DND Blocked: 206
🛑 Frequency Cap Blocked: 620
💀 DLQ Messages: 0
🎯 Overall Delivery Success Rate: 100%

📈 SLA Latency Stats:
   P50 Latency: 77 ms
   P95 Latency: 94 ms
   P99 Latency: 94 ms
```

### 3. Production Build
Build TypeScript and Vite production bundle:
```bash
npm run build
```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
