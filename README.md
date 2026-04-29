# YatriSuraksha
### Smart Tourist Safety, Monitoring & Incident Response System

---

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture Summary](#architecture-summary)
- [Tech Stack](#tech-stack)
- [File Structure](#file-structure)
- [Progress Tracker](#progress-tracker)
  - [Phase 0 — Project Setup & Infrastructure](#phase-0--project-setup--infrastructure)
  - [Phase 1 — Core Backend & Database](#phase-1--core-backend--database)
  - [Phase 2 — Embedded Firmware (LoRaWAN)](#phase-2--embedded-firmware-lorawan)
  - [Phase 3 — LoRaWAN Network Server](#phase-3--lorawan-network-server)
  - [Phase 4 — Blockchain & Digital ID](#phase-4--blockchain--digital-id)
  - [Phase 5 — Mobile Application (Flutter)](#phase-5--mobile-application-flutter)
  - [Phase 6 — Authority Dashboard (React)](#phase-6--authority-dashboard-react)
  - [Phase 7 — AI Safety Score & Alerts](#phase-7--ai-safety-score--alerts)
  - [Phase 8 — Integration & End-to-End Testing](#phase-8--integration--end-to-end-testing)
  - [Phase 9 — Hardening, Security & Multilingual](#phase-9--hardening-security--multilingual)
  - [Phase 10 — Kubernetes & Production Readiness](#phase-10--kubernetes--production-readiness)
- [Environment Setup](#environment-setup)
- [Running Locally](#running-locally)

---

## Project Overview

YatriSuraksha (*Traveller Safety* in Hindi) is a multi-layered safety ecosystem that
addresses the critical gap in India's tourism infrastructure, particularly in the
Northeast where tourist safety is compromised by:

- Cellular dead zones in forests, high-altitude passes, and river valleys
- Fragmented, non-digital tourist identity records
- Slow, non-integrated emergency response systems
- Absence of tamper-proof incident and FIR (First Information Report) logging

**YatriSuraksha solves this through five tightly integrated pillars:**

| Pillar | Technology | Purpose |
|--------|-----------|---------|
| Off-grid connectivity | LoRaWAN (IN865 MHz) | Track tourists in cellular dead zones |
| Digital Identity | Blockchain (EVM) | Time-bound, KYC-linked tourist ID |
| Mobile Interface | Flutter | Tourist-facing app: SOS, map, safety score |
| Authority Dashboard | React + WebSocket | Real-time situational awareness for police/tourism |
| AI Safety Engine | LightGBM + PostGIS | Predictive safety score, geo-fence alerts |

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          TOURIST LAYER                                  │
│   ┌──────────────────┐              ┌──────────────────────────────┐    │
│   │  LoRaWAN Wearable│              │     Flutter Mobile App       │    │
│   │  (ESP32 + SX127x)│              │  (Cellular / WiFi coverage)  │    │
│   └────────┬─────────┘              └───────────────┬──────────────┘    │
└────────────┼────────────────────────────────────────┼───────────────────┘
             │ LoRa Radio (IN865)                     │ HTTPS / WSS
┌────────────▼───────────────────────────────────────▼───────────────────┐
│                        CONNECTIVITY LAYER                              │
│   ┌──────────────────┐              ┌──────────────────────────────┐   │
│   │  LoRaWAN Gateway │              │     Mobile Internet / 4G     │   │
│   │ (Solar, pole-mnt)│              └───────────────┬──────────────┘   │
│   └────────┬─────────┘                              │                  │
│            │ UDP / MQTT (BasicStation TLS)          │                  │
└────────────┼────────────────────────────────────────┼──────────────────┘
             │                                        │
┌────────────▼────────────────────────────────────────▼──────────────────┐
│                         BACKEND PLANE                                  │
│   ┌───────────────┐  ┌───────────────┐  ┌──────────────────────────┐   │
│   │ ChirpStack NS │  │  Go API Server│  │  Blockchain Node (Besu)  │   │
│   │  (LoRaWAN NS) │→ │  + NATS Queue │←→│  Smart Contracts (EVM)   │   │
│   └───────────────┘  └───────┬───────┘  └──────────────────────────┘   │
│                              │                                         │
│   ┌───────────────┐  ┌───────▼───────┐  ┌──────────────────────────┐   │
│   │  TimescaleDB  │  │  Redis Cache  │  │   AI Inference Service   │   │
│   │  (GPS history)│  │  (sessions)   │  │   (Python + LightGBM)    │   │
│   └───────────────┘  └───────────────┘  └──────────────────────────┘   │
└───────────────────────────────┬────────────────────────────────────────┘
                                │ WebSocket / REST
┌───────────────────────────────▼─────────────────────────────────────────┐
│                         AUTHORITY LAYER                                 │
│   ┌──────────────────────────────────┐   ┌──────────────────────────┐   │
│   │   React Authority Dashboard      │   │  Alert Dispatch Engine   │   │
│   │   (Map, SOS, E-FIR, Heatmaps)    │   │  (SMS / Push / Email)    │   │
│   └──────────────────────────────────┘   └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Embedded Firmware
| Component | Technology | Version / Notes |
|-----------|-----------|-----------------|
| Microcontroller | ESP32-WROOM-32 | Dual-core 240 MHz |
| LoRa Radio | SX1276 / SX1278 | IN865 band (865–867 MHz) |
| Framework | Arduino-ESP32 + ESP-IDF | C++17 |
| Build System | CMake + PlatformIO | |
| GPS Library | TinyGPS++ | NMEA parsing |
| LoRaWAN MAC | LMIC (IBM) / RadioLib | OTAA, Confirmed Uplinks |
| Crypto | mbedTLS (AES-128 AppSKey) | Built into ESP-IDF |

### LoRaWAN Network Layer
| Component | Technology | Notes |
|-----------|-----------|-------|
| Network Server | ChirpStack v4 | Open-source, Docker-deployed |
| Gateway Protocol | LoRa Basics™ Station | Mutual TLS, replaces legacy UDP forwarder |
| Message Broker | MQTT (Mosquitto) | NS ↔ Backend bridge |
| Geolocation | ChirpStack Geolocation Server | TDOA fallback when GPS unavailable |

### Backend (API Server)
| Component | Technology | Notes |
|-----------|-----------|-------|
| Language | Go 1.22+ | High-throughput, low latency |
| Web Framework | Fiber v2 | Express-like, fast |
| WebSocket | Gorilla WebSocket | Real-time dashboard push |
| Message Queue | NATS JetStream | Decouples NS → Backend under spike load |
| Primary DB | PostgreSQL 16 + TimescaleDB | Time-series GPS records |
| Cache | Redis 7 | Sessions, geo-fence polygon cache |
| Spatial Queries | PostGIS 3 | `ST_Contains()` for geo-fence checks |
| ORM/Query | sqlc + pgx/v5 | Type-safe, no reflection overhead |
| Auth | JWT (RS256) + Blockchain verify | Dual: admin JWT + tourist on-chain ID |
| Container | Docker → Kubernetes (Phase 10) | |

### Blockchain (Digital ID)
| Component | Technology | Notes |
|-----------|-----------|-------|
| Chain | Hyperledger Besu (EVM-compatible) | Private/consortium chain, fixed gas |
| Smart Contracts | Solidity 0.8.x | OpenZeppelin base contracts |
| Contract Framework | Hardhat | Testing, deployment, verification |
| Token Standard | ERC-721 (modified) | Time-bound NFT for tourist ID |
| Privacy | Poseidon hash (zk-friendly) | KYC fields hashed, never stored raw |
| Future ZK | Circom + SnarkJS | zk-SNARK KYC proof (Phase 9 upgrade) |
| Client Library | ethers.js v6 | Used by both backend and frontend |
| Node | Hyperledger Besu | Docker-deployed |

### Mobile App
| Component | Technology | Notes |
|-----------|-----------|-------|
| Framework | Flutter 3.x (Dart) | Android + iOS |
| State Management | Riverpod 2 | |
| Maps | flutter_map + OpenStreetMap | No Google Maps API key dependency |
| Location | Geolocator + background_locator | Geofenced background tracking |
| BLE (wearable pairing) | flutter_reactive_ble | OTAA credential provisioning |
| Blockchain | web3dart | On-chain ID retrieval, QR wallet |
| Notifications | Firebase Cloud Messaging | SOS alerts to emergency contacts |
| Localisation | flutter_localizations | 10+ Indian languages |
| Secure Storage | flutter_secure_storage | AppKey, JWT token storage |

### Authority Dashboard
| Component | Technology | Notes |
|-----------|-----------|-------|
| Framework | React 18 + TypeScript | |
| Bundler | Vite | |
| Maps | Leaflet.js + react-leaflet | Heatmap, live GPS pins |
| Real-time | Socket.IO client | Dashboard ↔ Go backend WebSocket |
| UI Components | shadcn/ui + Tailwind CSS | |
| Charts | Recharts | Incident trends, Safety Score distributions |
| State | Zustand | Lightweight global state |
| Auth | JWT (admin) + RBAC | Police, Tourism Dept, Admin roles |
| Deployment | Vercel (Docker: Nginx) | |

### AI / ML Service
| Component | Technology | Notes |
|-----------|-----------|-------|
| Language | Python 3.11 | |
| Framework | FastAPI | Async inference endpoint |
| Model | LightGBM | Safety Score regression |
| Anomaly Detection | Isolation Forest (scikit-learn) | Detects stationary-too-long, erratic movement |
| Data Pipeline | pandas + numpy | Feature engineering |
| Model Serving | BentoML | Versioned model registry |
| Container | Docker | Sidecar to Go backend |

### Infrastructure & DevOps
| Component | Technology | Notes |
|-----------|-----------|-------|
| Containerisation | Docker + Docker Compose | Phase 1–9 |
| Orchestration | Kubernetes (k3s / GKE) | Phase 10 upgrade |
| Reverse Proxy | Traefik (Docker) → Nginx Ingress (K8s) | TLS termination |
| CI/CD | GitHub Actions | Lint → Test → Build → Deploy |
| Secrets | Docker secrets → K8s Secrets + Vault | |
| Monitoring | Prometheus + Grafana | Metrics for all services |
| Log Aggregation | Loki + Promtail | |
| Registry | GitHub Container Registry (GHCR) | |

---

## File Structure

```
yatrisuraksha/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Lint + test on every PR
│       ├── build-firmware.yml        # PlatformIO firmware build
│       └── deploy-dashboard.yml      # Vercel deploy on main merge
│
├── firmware/                         # ESP32 embedded C++ code
│   ├── src/
│   │   ├── main.cpp
│   │   ├── lora/
│   │   │   ├── lorawan.cpp           # OTAA join, uplink, downlink
│   │   │   └── lorawan.h
│   │   ├── gps/
│   │   │   ├── gps_reader.cpp        # NMEA parsing via TinyGPS++
│   │   │   └── gps_reader.h
│   │   ├── payload/
│   │   │   ├── payload_codec.cpp     # 11-byte binary frame encode/decode
│   │   │   └── payload_codec.h
│   │   ├── sos/
│   │   │   ├── sos_handler.cpp       # Hardware interrupt SOS button
│   │   │   └── sos_handler.h
│   │   └── config.h                  # DevEUI, AppEUI, frequency plan
│   ├── test/
│   │   ├── test_payload_codec.cpp
│   │   └── test_gps_reader.cpp
│   ├── platformio.ini
│   └── CMakeLists.txt
│
├── network-server/                   # ChirpStack LoRaWAN NS config
│   ├── chirpstack/
│   │   ├── chirpstack.toml           # NS configuration
│   │   └── region_IN865.toml         # Indian 865 MHz band plan
│   ├── gateway-bridge/
│   │   └── chirpstack-gateway-bridge.toml
│   └── docker-compose.ns.yml         # NS-only compose (can run standalone)
│
├── backend/                          # Go API + WebSocket server
│   ├── cmd/
│   │   └── server/
│   │       └── main.go               # Entry point
│   ├── internal/
│   │   ├── api/
│   │   │   ├── router.go             # Fiber router setup
│   │   │   ├── middleware/
│   │   │   │   ├── auth.go           # JWT + blockchain verify middleware
│   │   │   │   ├── ratelimit.go
│   │   │   │   └── cors.go
│   │   │   └── handlers/
│   │   │       ├── tourist.go        # Tourist CRUD, ID fetch
│   │   │       ├── location.go       # GPS record ingest + query
│   │   │       ├── sos.go            # SOS trigger + dispatch
│   │   │       ├── efir.go           # E-FIR filing + blockchain write
│   │   │       └── dashboard.go      # Dashboard aggregation endpoints
│   │   ├── lorawan/
│   │   │   ├── mqtt_listener.go      # Subscribe to ChirpStack MQTT
│   │   │   ├── payload_decoder.go    # Decode 11-byte binary frame
│   │   │   └── device_registry.go   # Map DevEUI → tourist identity
│   │   ├── blockchain/
│   │   │   ├── client.go             # ethers-go RPC client
│   │   │   ├── yatri_id.go           # mintID, getID, logIncident calls
│   │   │   └── abis/
│   │   │       └── YatriID.json      # ABI generated from Hardhat
│   │   ├── geofence/
│   │   │   ├── engine.go             # PostGIS ST_Contains queries
│   │   │   └── zones.go              # Load/cache zone polygons from DB
│   │   ├── ai/
│   │   │   └── client.go             # HTTP client to Python AI service
│   │   ├── alerts/
│   │   │   ├── dispatcher.go         # Orchestrates SMS + push + email
│   │   │   ├── sms.go                # Twilio integration
│   │   │   └── push.go               # Firebase Cloud Messaging
│   │   ├── websocket/
│   │   │   ├── hub.go                # WebSocket connection hub
│   │   │   └── events.go             # Event types: LocationUpdate, SOS, Alert
│   │   ├── db/
│   │   │   ├── postgres.go           # pgx/v5 pool setup
│   │   │   ├── redis.go              # Redis client
│   │   │   ├── queries/              # sqlc-generated type-safe queries
│   │   │   │   ├── tourist.sql.go
│   │   │   │   ├── location.sql.go
│   │   │   │   └── incident.sql.go
│   │   │   └── migrations/           # golang-migrate SQL files
│   │   │       ├── 001_init.up.sql
│   │   │       ├── 002_timescale.up.sql
│   │   │       └── 003_geofence.up.sql
│   │   ├── queue/
│   │   │   └── nats.go               # NATS JetStream publisher/subscriber
│   │   └── config/
│   │       └── config.go             # Env-based config struct
│   ├── sql/                          # Raw SQL for sqlc codegen
│   │   └── queries/
│   │       ├── tourist.sql
│   │       ├── location.sql
│   │       └── incident.sql
│   ├── sqlc.yaml
│   ├── Dockerfile
│   ├── go.mod
│   └── go.sum
│
├── blockchain/                       # Solidity smart contracts
│   ├── contracts/
│   │   ├── YatriID.sol               # Core tourist ID NFT (ERC-721)
│   │   ├── IncidentLedger.sol        # E-FIR immutable log
│   │   └── interfaces/
│   │       └── IYatriID.sol
│   ├── scripts/
│   │   ├── deploy.js                 # Hardhat deploy script
│   │   └── provision-tourist.js      # Mint ID + register AppKey
│   ├── test/
│   │   ├── YatriID.test.js
│   │   └── IncidentLedger.test.js
│   ├── artifacts/                    # Hardhat build output (gitignored except ABIs)
│   ├── hardhat.config.js
│   └── package.json
│
├── ai-service/                       # Python AI inference microservice
│   ├── src/
│   │   ├── main.py                   # FastAPI app entry
│   │   ├── models/
│   │   │   ├── safety_score.py       # LightGBM inference wrapper
│   │   │   └── anomaly.py            # Isolation Forest wrapper
│   │   ├── features/
│   │   │   └── engineer.py           # Feature extraction from GPS + context
│   │   ├── training/
│   │   │   ├── train_score.py        # Training pipeline
│   │   │   └── train_anomaly.py
│   │   └── schemas.py                # Pydantic request/response models
│   ├── models/                       # Serialised model files (.pkl / BentoML)
│   ├── tests/
│   │   └── test_inference.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── bentofile.yaml
│
├── mobile/                           # Flutter tourist app
│   ├── lib/
│   │   ├── main.dart
│   │   ├── core/
│   │   │   ├── router.dart           # go_router navigation
│   │   │   ├── theme.dart
│   │   │   └── constants.dart
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── screens/
│   │   │   │   │   └── registration_screen.dart   # QR scan at check-post
│   │   │   │   └── providers/
│   │   │   │       └── auth_provider.dart
│   │   │   ├── home/
│   │   │   │   ├── screens/
│   │   │   │   │   └── home_screen.dart           # Safety score + SOS button
│   │   │   │   └── providers/
│   │   │   │       └── safety_provider.dart
│   │   │   ├── map/
│   │   │   │   ├── screens/
│   │   │   │   │   └── map_screen.dart            # Live map + geofences
│   │   │   │   └── providers/
│   │   │   │       └── location_provider.dart
│   │   │   ├── sos/
│   │   │   │   └── sos_handler.dart               # SOS trigger + countdown
│   │   │   ├── efir/
│   │   │   │   └── screens/
│   │   │   │       └── efir_screen.dart           # In-app FIR filing
│   │   │   ├── wearable/
│   │   │   │   └── screens/
│   │   │   │       └── pair_screen.dart           # BLE pairing for LoRa band
│   │   │   └── settings/
│   │   │       └── screens/
│   │   │           └── settings_screen.dart       # Language, contacts, account
│   │   ├── services/
│   │   │   ├── api_service.dart
│   │   │   ├── blockchain_service.dart
│   │   │   ├── location_service.dart
│   │   │   └── ble_service.dart
│   │   └── l10n/                                  # Localisation ARB files
│   │       ├── app_en.arb
│   │       ├── app_hi.arb
│   │       ├── app_bn.arb
│   │       ├── app_ta.arb
│   │       ├── app_te.arb
│   │       ├── app_as.arb
│   │       └── app_mr.arb
│   ├── test/
│   │   ├── unit/
│   │   └── widget/
│   ├── android/
│   ├── ios/
│   └── pubspec.yaml
│
├── dashboard/                        # React authority dashboard
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── Map/
│   │   │   │   ├── LiveMap.tsx        # Leaflet map with tourist pins
│   │   │   │   ├── HeatmapLayer.tsx
│   │   │   │   └── GeofenceOverlay.tsx
│   │   │   ├── SOS/
│   │   │   │   ├── SOSPanel.tsx       # Real-time SOS alert list
│   │   │   │   └── SOSCard.tsx
│   │   │   ├── EFIR/
│   │   │   │   ├── EFIRTable.tsx      # Authority-side FIR management
│   │   │   │   └── EFIRModal.tsx
│   │   │   ├── Tourists/
│   │   │   │   ├── TouristTable.tsx
│   │   │   │   └── TouristDetail.tsx
│   │   │   ├── Charts/
│   │   │   │   ├── IncidentTrends.tsx
│   │   │   │   └── SafetyScoreHist.tsx
│   │   │   └── Layout/
│   │   │       ├── Sidebar.tsx
│   │   │       └── Header.tsx
│   │   ├── hooks/
│   │   │   ├── useWebSocket.ts
│   │   │   └── useMapData.ts
│   │   ├── store/
│   │   │   └── useStore.ts            # Zustand global store
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   └── socket.ts
│   │   └── types/
│   │       └── index.ts
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── Dockerfile
│   └── package.json
│
├── infra/                            # Infrastructure as Code
│   ├── docker/
│   │   ├── docker-compose.yml        # Full local development stack
│   │   ├── docker-compose.dev.yml    # Dev overrides (hot reload, debug ports)
│   │   └── docker-compose.prod.yml   # Production overrides
│   └── k8s/                          # Kubernetes manifests (Phase 10)
│       ├── namespace.yaml
│       ├── backend/
│       │   ├── deployment.yaml
│       │   ├── service.yaml
│       │   └── hpa.yaml              # Horizontal Pod Autoscaler
│       ├── ai-service/
│       │   ├── deployment.yaml
│       │   └── service.yaml
│       ├── chirpstack/
│       │   └── statefulset.yaml
│       ├── postgres/
│       │   └── statefulset.yaml
│       ├── redis/
│       │   └── deployment.yaml
│       ├── nats/
│       │   └── statefulset.yaml
│       ├── blockchain/
│       │   └── statefulset.yaml
│       ├── monitoring/
│       │   ├── prometheus.yaml
│       │   └── grafana.yaml
│       ├── ingress/
│       │   └── traefik-ingress.yaml
│       └── secrets/                  # Sealed secrets / Vault references
│           └── .gitkeep
│
├── docs/                             # Documentation
│   ├── TIMELINE.md                   # ← Full development timeline
│   ├── ARCHITECTURE.md
│   ├── LORAWAN.md                    # LoRaWAN deep-dive
│   ├── BLOCKCHAIN.md
│   ├── API.md                        # OpenAPI / REST reference
│   ├── FIRMWARE.md                   # Flashing + hardware setup guide
│   └── DEPLOYMENT.md                 # Docker + K8s deployment guide
│
├── scripts/                          # Developer utility scripts
│   ├── setup.sh                      # One-shot dev environment bootstrap
│   ├── seed-db.sh                    # Seed PostGIS with geo-fence zones
│   ├── simulate-lora.sh              # Simulate LoRa uplinks via ChirpStack API
│   └── generate-contracts.sh         # Hardhat compile + copy ABIs to backend
│
├── .env.example                      # Template for all service env vars
├── .gitignore
├── docker-compose.yml               # Symlink → infra/docker/docker-compose.yml
├── Makefile                          # `make up`, `make test`, `make firmware`
└── README.md                         # ← This file
```

---

## Progress Tracker

> **Legend:** ✅ Done · 🔄 In Progress · ⬜ Not Started · 🚫 Blocked

---

### Phase 0 — Project Setup & Infrastructure
**Target: Week 1**

#### Repository & Tooling
- [ ] Initialise monorepo with the new file structure
- [ ] Create `.env.example` with all service variables documented
- [ ] Write root `Makefile` with `make up`, `make down`, `make test`, `make firmware` targets
- [ ] Set up `.gitignore` (node_modules, build artifacts, `.env`, firmware `.pio/`, model `.pkl`)
- [ ] Configure GitHub repository: branch protection on `main`, PR templates

#### CI/CD Pipelines (GitHub Actions)
- [ ] `ci.yml` — lint + unit test all services on PR (Go, Dart, Python, Solidity, C++)
- [ ] `build-firmware.yml` — PlatformIO firmware compile check on firmware/ changes
- [ ] `deploy-dashboard.yml` — Vercel preview deploy on PR, prod deploy on `main` merge
- [ ] `deploy-backend.yml` — Build and push Docker image to GHCR on `main` merge

#### Docker Compose (Base Stack)
- [ ] `docker-compose.yml` — orchestrate: backend, postgres+timescale, redis, nats, chirpstack, besu, ai-service, dashboard
- [ ] `docker-compose.dev.yml` — hot reload overrides for backend (Air) and dashboard (Vite HMR)
- [ ] `docker-compose.prod.yml` — resource limits, restart policies, no debug ports
- [ ] Traefik reverse proxy container with TLS (Let's Encrypt / self-signed for local)
- [ ] Verify all services reach `healthy` state with `docker compose up`

#### Database Setup
- [ ] PostgreSQL 16 + TimescaleDB extension container configured
- [ ] PostGIS 3 extension enabled in init SQL
- [ ] Redis 7 container configured with persistence (AOF)
- [ ] Migration runner container (golang-migrate) wired to backend startup

#### Monitoring Stack
- [ ] Prometheus container with scrape configs for all services
- [ ] Grafana container with pre-built dashboards (LoRa uplink rate, API latency, DB connections)
- [ ] Loki + Promtail for centralised log collection
- [ ] Alert rules: API error rate > 5%, DB connection pool exhausted, no LoRa uplinks for 10 min

---

### Phase 1 — Core Backend & Database
**Target: Weeks 2–3**

#### Database Schema & Migrations
- [ ] `001_init.up.sql` — tourists, devices, admins tables
- [ ] `002_timescale.up.sql` — convert `gps_records` to TimescaleDB hypertable, add retention policy (90 days)
- [ ] `003_geofence.up.sql` — geo_zones table with PostGIS GEOMETRY column, seed with sample NE India zones
- [ ] `004_incidents.up.sql` — incidents table, efir_records table
- [ ] sqlc codegen: run `sqlc generate` and verify all type-safe query functions

#### Go Backend — Core API
- [ ] Project scaffold: `cmd/server/main.go`, config loading from env, graceful shutdown
- [ ] Fiber router setup with middleware chain (cors, ratelimit, logger, auth)
- [ ] JWT auth middleware (RS256, key rotation support)
- [ ] Health check endpoint: `GET /health` → returns service status for all dependencies
- [ ] `POST /api/v1/tourists` — create tourist record (called by registration kiosk)
- [ ] `GET /api/v1/tourists/:id` — get tourist with current location + blockchain ID status
- [ ] `GET /api/v1/tourists` — paginated list (authority dashboard)
- [ ] `POST /api/v1/locations` — ingest GPS record (mobile app path)
- [ ] `GET /api/v1/locations/:tourist_id` — GPS history for a tourist (last N records)
- [ ] `POST /api/v1/sos` — trigger SOS for a tourist ID
- [ ] `GET /api/v1/geofences` — list all active geo-fence zones
- [ ] `POST /api/v1/efir` — file an E-FIR (writes to DB + blockchain)
- [ ] `GET /api/v1/efir` — list E-FIRs with status (authority dashboard)
- [ ] `PATCH /api/v1/efir/:id` — update E-FIR status (police action)
- [ ] Rate limiting middleware: 100 req/min per IP, 1000 req/min per authenticated admin
- [ ] OpenAPI spec (swagger) auto-generated from Fiber routes

#### WebSocket Hub
- [ ] `hub.go` — connection registration, broadcast, room-based channels (by zone)
- [ ] `events.go` — typed event structs: `LocationUpdate`, `SOSAlert`, `GeofenceViolation`, `SafetyScoreUpdate`
- [ ] Dashboard WebSocket endpoint: `GET /ws/dashboard` (JWT-authenticated)
- [ ] Load test WebSocket with 500 simultaneous dashboard connections

#### NATS JetStream
- [ ] NATS container running in Docker Compose
- [ ] Streams defined: `LOCATIONS`, `SOS_EVENTS`, `GEOFENCE_ALERTS`
- [ ] Backend publishes to NATS on every LoRa or mobile GPS ingest
- [ ] Backend subscribes and fans out to WebSocket hub + AI service + alert dispatcher

---

### Phase 2 — Embedded Firmware (LoRaWAN)
**Target: Weeks 3–4**

#### Hardware Setup
- [ ] Prototype board assembled: ESP32-WROOM + SX1278 LoRa module + NEO-6M GPS + LiPo
- [ ] PlatformIO project initialised with `platformio.ini` (board: `esp32dev`, framework: `arduino`)
- [ ] All pins mapped and documented in `config.h`

#### GPS Module
- [ ] UART initialised for GPS communication (115200 baud, configurable)
- [ ] TinyGPS++ integrated: parse NMEA sentences, extract lat/lon/alt/fix-quality
- [ ] GPS fix timeout handling: if no fix in 60s, set `GPS_VALID=false` in flags byte
- [ ] Unit test: `test_gps_reader.cpp` — feed sample NMEA strings, assert parsed values

#### Payload Codec
- [ ] 11-byte binary frame encoder: Tourist ID (2B) + Lat (3B) + Lon (3B) + Alt (2B) + Flags (1B)
- [ ] Decoder function (mirror of Go backend decoder)
- [ ] Coordinate encoding: `int32_t = degrees × 1,000,000`, big-endian
- [ ] Unit test: `test_payload_codec.cpp` — encode → decode round-trip with edge cases (poles, negative coords)

#### LoRaWAN MAC Layer (OTAA)
- [ ] RadioLib or LMIC library integrated
- [ ] OTAA join: send JoinRequest with DevEUI + AppEUI + DevNonce
- [ ] Join retry with exponential backoff (1s, 2s, 4s … up to 5 min)
- [ ] Session key storage in ESP32 NVS (Non-Volatile Storage) — survives deep sleep
- [ ] Uplink transmission: SF9, BW125, CR4/5, Confirmed Uplink for SOS
- [ ] Downlink receive windows (RX1, RX2) handled correctly per LoRaWAN spec
- [ ] ADR (Adaptive Data Rate) handling: respond to MAC commands from NS

#### Main Loop & Power Management
- [ ] Deep sleep between transmissions (default: 300s interval)
- [ ] Wake via RTC timer or SOS button hardware interrupt
- [ ] SOS interrupt: immediately assemble and send at SF12, confirmed uplink, retry until ACK
- [ ] Battery level measurement via ADC → encoded in Flags byte
- [ ] LED indicators: GPS fix (green), LoRa tx (blue), SOS (red)

#### Firmware OTA (Over-the-Air Update)
- [ ] Downlink command handler for firmware version check
- [ ] OTA update via LoRaWAN fragmented data block (FUOTAv1) — low priority, Phase 9

---

### Phase 3 — LoRaWAN Network Server
**Target: Week 4**

#### ChirpStack Deployment
- [ ] ChirpStack v4 container running in Docker Compose (`docker-compose.ns.yml`)
- [ ] PostgreSQL backend for ChirpStack (separate DB from app, same PG instance)
- [ ] Redis for ChirpStack deduplication cache
- [ ] `chirpstack.toml` configured: API address, metrics, log level

#### Band Plan & Device Profiles
- [ ] `region_IN865.toml` — IN865 band plan: channels 865.0625, 865.4025, 865.9850 MHz
- [ ] Duty cycle enforced: 1% per sub-band
- [ ] Device Profile created: Class A, OTAA, `MAC_VERSION=1.0.3`, ADR enabled
- [ ] Application and API key generated for backend MQTT subscription

#### Gateway Setup
- [ ] ChirpStack Gateway Bridge configured (LoRa Basics™ Station mode, mutual TLS)
- [ ] Self-signed CA + server + client certificates generated for gateway TLS
- [ ] At least 1 physical or simulated gateway registered in ChirpStack UI
- [ ] Gateway statistics visible in ChirpStack dashboard

#### MQTT Integration
- [ ] Mosquitto MQTT broker running in Docker Compose
- [ ] ChirpStack publishing uplinks to: `application/{appId}/device/{devEUI}/event/up`
- [ ] Go backend MQTT listener subscribes to the above topic
- [ ] Decode ChirpStack uplink JSON → extract `data` (base64 payload) → pass to payload decoder
- [ ] Downlink API: Go backend can publish ADR / interval change commands via MQTT

#### TDOA Geolocation Fallback
- [ ] ChirpStack Geolocation Server container configured
- [ ] Backend falls back to TDOA location when `GPS_VALID=false` in uplink flags
- [ ] TDOA estimate logged with uncertainty radius (displayed differently on dashboard map)

#### Simulation
- [ ] `scripts/simulate-lora.sh` — uses ChirpStack REST API to inject synthetic uplinks
- [ ] Simulate 50 concurrent tourist devices moving along a predefined GPS track
- [ ] Verify deduplication: two gateways receiving same uplink → only one event in backend

---

### Phase 4 — Blockchain & Digital ID
**Target: Weeks 5–6**

#### Smart Contract Development
- [ ] Hardhat project initialised with TypeScript config
- [ ] `YatriID.sol` — ERC-721 with:
  - [ ] `mintID(address to, bytes32 aadhaarHash, bytes32 passportHash, string itinerary, uint256 expiresAt)` → mints token
  - [ ] `isValid(uint256 tokenId)` → returns `false` after `expiresAt`
  - [ ] `revokeID(uint256 tokenId)` → authority-only revocation (owner role)
  - [ ] `getIDMetadata(uint256 tokenId)` → returns hashes + expiry + itinerary
  - [ ] `setAppKey(uint256 tokenId, bytes32 encryptedAppKey)` → links LoRa device
  - [ ] `getAppKey(uint256 tokenId)` → authority-only getter
- [ ] `IncidentLedger.sol` —
  - [ ] `logIncident(uint256 touristTokenId, int256 lat, int256 lon, string incidentType, bytes32 descHash)` → immutable event log
  - [ ] `getIncidents(uint256 touristTokenId)` → return array of incident records
- [ ] OpenZeppelin imports: `ERC721`, `Ownable`, `AccessControl`, `Pausable`
- [ ] Natspec documentation on every function

#### Contract Testing
- [ ] `YatriID.test.js` — mint, isValid before/after expiry, revoke, role checks
- [ ] `IncidentLedger.test.js` — log incident, retrieve by tourist ID
- [ ] 100% branch coverage target
- [ ] Slither static analysis: zero high/medium findings before deploy
- [ ] Mythril symbolic execution: no critical vulnerabilities

#### Deployment
- [ ] Hyperledger Besu node running in Docker Compose (private chain, `--network-id 1337`)
- [ ] Hardhat configured to deploy to local Besu node
- [ ] `scripts/deploy.js` — deploys both contracts, writes deployed addresses to `contracts.json`
- [ ] `scripts/generate-contracts.sh` — compiles contracts, copies ABIs to `backend/internal/blockchain/abis/`
- [ ] Deploy to Polygon Mumbai testnet for external testing

#### Backend Blockchain Integration
- [ ] Go ethers-go (or go-ethereum) RPC client initialised against Besu node
- [ ] `yatri_id.go` — wrapper for all contract calls (read-only: no private key needed)
- [ ] `mintID` called by registration kiosk handler (`POST /api/v1/tourists`)
- [ ] `isValid` checked on every tourist API request (expired IDs return 403)
- [ ] `logIncident` called when E-FIR is filed or SOS confirmed

#### Registration Kiosk Interface
- [ ] Standalone web page (can reuse dashboard stack) for entry-point staff
- [ ] Form: upload Aadhaar / Passport scan → hash client-side → call `mintID`
- [ ] Print / display QR code containing `tokenId` and tourist's `DevEUI`
- [ ] Provision LoRa band: call `setAppKey` on contract with encrypted AppKey

---

### Phase 5 — Mobile Application (Flutter)
**Target: Weeks 6–7**

#### Project Scaffold
- [ ] Flutter 3.x project initialised under `mobile/`
- [ ] `pubspec.yaml` with all dependencies pinned
- [ ] `go_router` navigation configured with all routes
- [ ] Riverpod 2 providers wired for global state
- [ ] `flutter_localizations` + ARB files scaffold (English first)
- [ ] Flavors configured: `dev`, `staging`, `prod` (separate API endpoints)

#### Authentication & Registration
- [ ] QR code scanner screen: scan QR from registration kiosk
- [ ] Parse QR: extract `tokenId`, fetch metadata from blockchain via `GET /api/v1/tourists/:id`
- [ ] Store token in `flutter_secure_storage`
- [ ] Display digital ID card (name, photo placeholder, validity, QR) in wallet screen

#### Home Screen (Safety Dashboard)
- [ ] Safety Score widget: colour-coded circle (green/yellow/red) with numeric value
- [ ] Zone status badge: "Safe Zone", "Caution Zone", "Restricted — Turn Back"
- [ ] SOS button: large, accessible, 3-second countdown with cancel
- [ ] Emergency contacts display: nearest police station + user's saved contacts
- [ ] Last seen / GPS sync indicator

#### Live Map Screen
- [ ] `flutter_map` + OpenStreetMap tiles (offline tile caching for dead zones)
- [ ] User's GPS pin updated every 30s (background, geofenced)
- [ ] Geo-fence overlays: coloured polygon overlays for safe/danger zones
- [ ] Route display: tourist's itinerary path
- [ ] Points of Interest: hospitals, police stations, ranger posts

#### Background Location Tracking
- [ ] `background_locator` or `geolocator` (background mode) enabled
- [ ] Location posted to `POST /api/v1/locations` every 60s when app is backgrounded
- [ ] Geofenced activation: increase frequency to 10s when inside a danger zone
- [ ] Battery optimisation: use significant-change location API when in safe zones

#### SOS Flow
- [ ] SOS trigger → POST `/api/v1/sos` → server dispatches alerts
- [ ] Confirmation screen: "SOS sent. Help is on the way. Your location is being shared."
- [ ] SOS cancellation within 30 seconds (accidental press protection)
- [ ] Offline SOS: if no internet, app attempts BLE command to wearable band to send LoRa SOS

#### E-FIR Filing
- [ ] Multi-step form: incident type, description, photos (optional), location (pre-filled)
- [ ] Photo upload via `image_picker` → compressed → uploaded to backend
- [ ] Submission calls `POST /api/v1/efir` → blockchain hash logged
- [ ] Receipt screen: E-FIR ID, blockchain transaction hash

#### Wearable Pairing (BLE)
- [ ] BLE scan screen: discover nearby YatriSuraksha band (by service UUID)
- [ ] Pair and provision: write DevEUI + AppKey to band via BLE characteristic
- [ ] Band status display: battery level, GPS fix, last LoRa transmission time

#### Settings
- [ ] Language selector (10+ languages, live switch without restart)
- [ ] Emergency contacts management (add/remove/notify)
- [ ] Notification preferences
- [ ] Account / token management (logout / ID refresh)

---

### Phase 6 — Authority Dashboard (React)
**Target: Weeks 7–8**

#### Project Scaffold
- [ ] Vite + React 18 + TypeScript project initialised under `dashboard/`
- [ ] Tailwind CSS + shadcn/ui configured
- [ ] Zustand store initialised
- [ ] React Router v6 with protected routes (JWT auth guard)
- [ ] RBAC roles defined: `super_admin`, `police`, `tourism_officer`

#### Authentication
- [ ] Login page: email + password → `POST /api/v1/auth/login` → JWT stored in memory (not localStorage)
- [ ] Token refresh on expiry (silent refresh via HTTP-only cookie)
- [ ] Role-based sidebar: police sees SOS + E-FIR; tourism sees tourist register + heatmaps

#### Live Map Component
- [ ] Leaflet.js map centred on Northeast India
- [ ] Tourist pins: coloured by Safety Score (green/yellow/red), click → tourist detail panel
- [ ] Real-time pin updates via WebSocket `LocationUpdate` events (no polling)
- [ ] Heatmap layer toggle: incident density overlay (Leaflet.heat plugin)
- [ ] Geo-fence overlay: draw and save new geo-fence polygons (authority-only)
- [ ] TDOA pins: display with uncertainty circle when GPS not available

#### SOS Alert Panel
- [ ] Real-time SOS list: sorted by time, with tourist name + location + blockchain ID
- [ ] Sound alert on new SOS event (Web Audio API)
- [ ] Acknowledge button: marks SOS as attended, logs responder identity to blockchain
- [ ] Dispatch modal: assign nearest police unit, send downlink command to wearable

#### Tourist Register
- [ ] Paginated table: all active digital IDs (fetched from blockchain + backend)
- [ ] Search by name, nationality, entry point, current zone
- [ ] Tourist detail drawer: GPS history replay, Safety Score history, E-FIR history
- [ ] Manual revoke ID button (super_admin only) → calls `revokeID` on contract

#### E-FIR Management
- [ ] Table view: all filed E-FIRs with status (pending / under investigation / closed)
- [ ] Filter by status, zone, incident type, date range
- [ ] Detail modal: full incident description, blockchain tx hash link, photo attachments
- [ ] Status update: police changes status → `PATCH /api/v1/efir/:id` → logged on blockchain

#### Analytics Charts
- [ ] Incident trend: line chart of incidents per day, last 30 days
- [ ] Safety Score distribution: histogram of all active tourist scores
- [ ] Zone breakdown: pie chart of tourists by zone (safe / caution / restricted)
- [ ] Gateway uptime: bar chart of LoRa uplinks per gateway per hour

#### Notifications
- [ ] Browser push notification (Web Push API) on new SOS
- [ ] In-app notification bell with unread count

---

### Phase 7 — AI Safety Score & Alerts
**Target: Week 8**

#### Data Collection for Training
- [ ] Run `scripts/simulate-lora.sh` for 48h to generate synthetic GPS dataset
- [ ] Label training data: assign risk levels based on zone + time-of-day + historical incidents
- [ ] Feature engineering (`features/engineer.py`):
  - [ ] Current zone risk level (from PostGIS lookup)
  - [ ] Time of day (encoded as sine/cosine)
  - [ ] Dwell time in current location
  - [ ] Distance from nearest police station
  - [ ] Historical incident count in 1 km radius (last 30 days)
  - [ ] GPS trajectory speed (sudden stop = risk)
  - [ ] Battery level of wearable
  - [ ] Weather risk (API call to IMD / Open-Meteo)

#### Model Training
- [ ] LightGBM safety score regression model trained on synthetic dataset
- [ ] Isolation Forest anomaly detection trained on normal movement patterns
- [ ] Cross-validation: 5-fold, target RMSE < 5 score points
- [ ] Model serialised and saved to `ai-service/models/`

#### FastAPI Inference Service
- [ ] `POST /predict/safety-score` — accepts feature vector, returns score (0–100)
- [ ] `POST /predict/anomaly` — accepts GPS sequence, returns `{is_anomaly: bool, reason: str}`
- [ ] Health check: `GET /health`
- [ ] Async inference: Starlette background tasks for non-blocking prediction
- [ ] BentoML model registry for versioned model management

#### Integration with Go Backend
- [ ] Go backend calls AI service on every GPS ingest (HTTP, <5ms p99 target)
- [ ] Safety Score stored in Redis with 5-min TTL
- [ ] Score pushed to dashboard via WebSocket
- [ ] Score pushed to mobile app via `GET /api/v1/tourists/:id`

#### Geo-fence Alert Engine
- [ ] PostGIS `ST_Contains(zone.geom, tourist.location)` on every GPS update
- [ ] Zone state machine: `SAFE → CAUTION` transition triggers push notification
- [ ] `CAUTION → RESTRICTED` triggers SMS to emergency contacts + police station
- [ ] Downlink command via ChirpStack: increase LoRa transmission frequency in danger zones

#### Alert Dispatcher
- [ ] Twilio SMS: message to emergency contact + nearest police station on SOS
- [ ] Firebase Cloud Messaging: push notification to tourist's phone on geofence violation
- [ ] Email (SendGrid): incident report to tourism department on E-FIR filing
- [ ] Dead-letter queue: failed alerts retried with exponential backoff via NATS

---

### Phase 8 — Integration & End-to-End Testing
**Target: Weeks 9–10**

#### End-to-End Flow Testing
- [ ] **Flow 1: Registration → LoRa uplink → Dashboard pin appears**
  - [ ] Register tourist via kiosk UI → blockchain ID minted
  - [ ] Firmware sends OTAA join → ChirpStack approves → session keys derived
  - [ ] Firmware sends GPS uplink → Go backend receives → dashboard pin updates within 2s
- [ ] **Flow 2: Geo-fence violation → Alert → E-FIR**
  - [ ] Simulate tourist entering restricted zone
  - [ ] Go backend detects via PostGIS → dispatches SMS + push notification
  - [ ] Dashboard SOS panel shows alert within 1s of event
  - [ ] Authority files E-FIR via dashboard → blockchain logs incident hash
- [ ] **Flow 3: Mobile SOS → Alert → Police Response**
  - [ ] Tourist presses SOS in app → `POST /api/v1/sos`
  - [ ] SMS dispatched to emergency contacts + police station within 5s
  - [ ] Dashboard SOS panel shows alert with tourist location
  - [ ] Police acknowledges on dashboard → blockchain records acknowledgement
- [ ] **Flow 4: Offline SOS (LoRa-only)**
  - [ ] Firmware SOS button pressed → SF12 confirmed uplink sent
  - [ ] NS receives → backend processes → same alert pipeline as above
  - [ ] No mobile internet required end-to-end

#### Performance Testing
- [ ] Backend load test (k6): 1000 concurrent GPS ingest requests, p99 < 100ms
- [ ] WebSocket load test: 500 simultaneous dashboard connections, no drops
- [ ] LoRa simulator: 100 concurrent devices uploading every 5 min, verify 0 missed uplinks
- [ ] Database: TimescaleDB query for 1M GPS records, aggregate in < 500ms

#### Security Testing
- [ ] Slither static analysis on all Solidity contracts (0 high/medium)
- [ ] Mythril symbolic execution on `YatriID.sol`
- [ ] Go backend: OWASP Top 10 review (SQL injection via sqlc: N/A; auth bypass: tested)
- [ ] TLS certificate validation on LoRa gateway BasicStation connection
- [ ] JWT expiry and rotation tested
- [ ] Rate limit bypass attempts tested

#### Field Test (Physical Hardware)
- [ ] Physical ESP32 + SX1278 board flashed with production firmware
- [ ] Outdoor test: verify GPS fix acquisition time < 60s
- [ ] LoRa range test: 3+ km distance from gateway at SF9
- [ ] SOS confirmed uplink: verify acknowledgement from NS at 3 km
- [ ] Battery life test: confirm 24h+ at 5-min transmission interval

---

### Phase 9 — Hardening, Security & Multilingual
**Target: Weeks 11–12**

#### Multilingual Support (Flutter)
- [ ] ARB files completed for: Hindi, Bengali, Tamil, Telugu, Marathi, Assamese, English (7 languages)
- [ ] All UI strings externalised (zero hardcoded English strings in code)
- [ ] RTL layout support for Urdu (if added)
- [ ] Language auto-detect from device locale with manual override
- [ ] Tested on native speakers for translation accuracy

#### Security Hardening
- [ ] LoRa gateway: migrate all gateways to LoRa Basics™ Station (mutual TLS, no UDP forwarder)
- [ ] Backend: input validation on all API endpoints (request body, path params, query params)
- [ ] Blockchain: implement zk-SNARK KYC proof (Circom circuit for Aadhaar verification) — replaces raw hash
- [ ] Secrets: migrate all Docker secrets to HashiCorp Vault (dev: file-based, prod: Vault agent)
- [ ] Rate limiting: graduated response (warn → throttle → ban) per tourist device ID
- [ ] CORS: restrict dashboard origin to specific domain
- [ ] CSP headers on dashboard (Nginx config)

#### Satellite Fallback (Stretch Goal)
- [ ] Research Swarm M138 or Iridium 9603 integration
- [ ] Firmware: if N consecutive LoRa uplinks unacknowledged, switch to satellite
- [ ] Backend: satellite uplink receiver endpoint

#### Firmware OTA
- [ ] FUOTA v1 (Fragmented Unicast Over-The-Air) implementation in firmware
- [ ] Backend OTA management API: upload firmware, push to device via ChirpStack downlink
- [ ] Version check on every join: firmware self-reports version in uplink

#### Documentation
- [ ] `docs/API.md` — complete OpenAPI spec exported from Fiber
- [ ] `docs/FIRMWARE.md` — hardware BOM, schematic, PlatformIO setup, flashing guide
- [ ] `docs/LORAWAN.md` — gateway deployment guide (pole mount, solar, backhaul options)
- [ ] `docs/DEPLOYMENT.md` — Docker Compose and Kubernetes deployment guide
- [ ] `docs/ARCHITECTURE.md` — system architecture with diagrams

#### Demo Preparation
- [ ] 5-minute demonstration video: full flow from registration to SOS to E-FIR
- [ ] Slide deck: problem, solution, architecture, novelties, demo link
- [ ] GitHub README updated with demo GIF, architecture diagram, quick-start guide

---

### Phase 10 — Kubernetes & Production Readiness
**Target: Weeks 13–14 (Post-SIH, Production Upgrade)**

> This phase upgrades the Docker Compose deployment to a production-grade Kubernetes cluster.
> All Phase 1–9 work remains functionally identical; only the deployment layer changes.

#### Kubernetes Manifests
- [ ] `infra/k8s/namespace.yaml` — `yatrisuraksha` namespace
- [ ] Backend: `Deployment` (3 replicas), `Service` (ClusterIP), `HPA` (scale on CPU > 70%)
- [ ] AI Service: `Deployment` (2 replicas), `Service`
- [ ] ChirpStack: `StatefulSet` (1 replica, persistent volume for config)
- [ ] PostgreSQL: `StatefulSet` (1 replica, PVC for data), or use managed RDS
- [ ] Redis: `Deployment` with `PersistentVolumeClaim`
- [ ] NATS: `StatefulSet` (3 replicas for JetStream clustering)
- [ ] Hyperledger Besu: `StatefulSet` (1 replica, persistent chain data)
- [ ] Dashboard: `Deployment` (2 replicas) behind Ingress

#### Networking & Ingress
- [ ] Nginx Ingress Controller deployed
- [ ] TLS certificates via cert-manager (Let's Encrypt)
- [ ] Ingress rules: `api.yatrisuraksha.in`, `dashboard.yatrisuraksha.in`, `ws.yatrisuraksha.in`
- [ ] Network policies: deny all cross-namespace traffic except explicitly allowed paths

#### Secrets & Config
- [ ] Kubernetes Secrets for all credentials (migrated from Docker secrets)
- [ ] HashiCorp Vault Agent injector for dynamic secrets (DB credentials rotation)
- [ ] ConfigMaps for non-sensitive configuration

#### Observability
- [ ] Prometheus Operator deployed with ServiceMonitor CRDs
- [ ] Grafana dashboards imported via ConfigMap (GitOps pattern)
- [ ] Loki stack (Loki + Promtail DaemonSet) for log aggregation
- [ ] AlertManager rules: PagerDuty / Telegram bot for on-call alerts

#### CI/CD for Kubernetes
- [ ] GitHub Actions: build → push to GHCR → `kubectl rollout` on `main` merge
- [ ] ArgoCD or Flux for GitOps-based continuous deployment
- [ ] Helm chart wrapping all K8s manifests for parameterised deployment

#### Disaster Recovery
- [ ] PostgreSQL: daily automated backup to S3-compatible storage (Minio or AWS S3)
- [ ] Blockchain: Besu node data backup (chain state)
- [ ] Recovery drill: restore DB from backup and verify application function

---

## Environment Setup

```bash
# 1. Clone the repository
git clone https://github.com/itsmebirdie/yatrisuraksha.git yatrisuraksha
cd yatrisuraksha

# 2. Copy and fill in environment variables
cp .env.example .env
# Edit .env with your actual credentials

# 3. Run the bootstrap script
chmod +x scripts/setup.sh
./scripts/setup.sh

# 4. Start the full stack
make up

# 5. Run database migrations
make migrate

# 6. Seed geo-fence zones
make seed

# 7. Verify all services are healthy
make health
```

---

## Running Locally

| Command | Description |
|---------|-------------|
| `make up` | Start all services (Docker Compose) |
| `make down` | Stop all services |
| `make logs` | Tail logs from all services |
| `make test` | Run all test suites (Go + Dart + Python + Solidity) |
| `make firmware` | Compile firmware with PlatformIO |
| `make migrate` | Run database migrations |
| `make seed` | Seed PostGIS with sample geo-fence zones |
| `make simulate` | Run LoRa device simulator (50 virtual tourists) |
| `make contracts` | Compile Solidity + copy ABIs to backend |
| `make health` | Check health of all running services |

---

*YatriSuraksha — Because every traveller deserves to come home safe.*