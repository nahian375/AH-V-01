# ASTRA Health — Astronaut Health Intelligence System

ASTRA Health is an autonomous, mission-critical Progressive Web Application (PWA) designed to monitor, protect, and support astronaut physiological and psychological wellbeing during long-duration deep-space transit (such as NASA's Mars-01 mission).

Built for environments where terrestrial communications encounter latencies up to 22+ minutes each way or complete blackout windows, ASTRA operates with an offline-first architecture powered by dual AI engines: a high-reasoning online Gemini model and an onboard zero-latency browser-native local AI engine.

---

## Features

- **Mission Command Telemetry HUD:** Real-time tracking of Mission Day, Mars Sol, flight phase, Deep Space Network (DSN) round-trip delay, and critical vitals.
- **Dual AI Engine:**
  - **Online Gemini Intelligence:** Server-side Google Gemini model via resilient fallback cascade (`gemini-3.8-flash`, `gemini-3.1-flash-lite`, `gemini-flash-latest`).
  - **Local Autonomous Onboard Mode:** 100% in-browser offline retrieval engine powered by an embedded NASA spaceflight medical knowledge base.
- **Interactive Neuro-Cognitive Test Battery:**
  - **Psychomotor Vigilance Test (PVT):** Millisecond-accurate reaction latency and attention stamina benchmark.
  - **Spatial N-Back Working Memory:** Multi-node spatial sequence recall test.
  - **Continuous Performance Test (CPT):** Target signal discrimination under cognitive load.
- **NASA Space Data Grounding:**
  - **NASA RadLab:** Real-time space radiation dosimetry (absorbed dose and dose equivalent rates).
  - **NASA DONKI:** Heliospheric space-weather monitoring (Coronal Mass Ejections, solar flares, and SEP events).
  - **NASA OSDR:** Peer-reviewed space-life-sciences research accessions (cardiovascular, bone demineralization, circadian, and genomic studies).
- **14-Day Rolling Baselines:** Personalized baseline comparison rather than generalized terrestrial population averages.
- **Offline-First Persistence:** Fully functional offline using IndexedDB (`Dexie.js`) with background synchronization upon reconnect.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [npm](https://www.npmjs.com/) (v9.0.0 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/astra-health.git
   cd astra-health
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy the example environment configuration to create your local `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` with your API credentials:
   ```env
   # Required for Online Gemini AI Intelligence
   GEMINI_API_KEY=your_gemini_api_key_here

   # Optional: NASA Open Data API Key (defaults to DEMO_KEY if unset)
   NASA_API_KEY=your_nasa_api_key_here

   # Server Configuration
   PORT=3000
   NODE_ENV=development
   ```

---

## Development & Production

- **Start development server:**
  ```bash
  npm run dev
  ```
  The app will be accessible at `http://localhost:3000`.

- **Typecheck and Lint:**
  ```bash
  npm run lint
  ```

- **Build for production:**
  ```bash
  npm run build
  ```

- **Run production server:**
  ```bash
  npm start
  ```

---

## Architecture & Security

- **Server-Side Secret Isolation:** Private credentials such as `GEMINI_API_KEY` are only ever accessed in backend server routines (`server/`) and are never bundled or exposed to client-side code.
- **Sanitized Headers:** Default security headers (`X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-XSS-Protection`) and disabled `X-Powered-By` fingerprinting.
- **Biomedical Privacy:** Telemetry and daily check-ins are stored in client-side IndexedDB with encryption-ready stores, adhering to NASA human-spaceflight data isolation guidelines.
- **Non-Diagnostic Decision Support:** ASTRA Health provides clinical decision support and probabilistic trend analysis; it is not a certified medical diagnostic device.

---

## License

This project is licensed under the MIT License.
