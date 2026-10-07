# Disaster Emergency Relay Network (Prototype)

> **Notice on Project Branding**: The enclosing folder is named `AVISHKAR`, but following system specifications, `AVISHKAR` is not used as the application name, title, logo, or brand. The neutral designation **"Disaster Emergency Relay Network"** is used throughout.

---

## 1. Overview & Problem Statement

During extreme disasters (floods, earthquakes, landslides, building collapses, wildfires), central communication infrastructure—cellular towers, fiber optic cables, and commercial internet service providers—often suffers total collapse or severe congestion.

This project delivers a **Progressive Web Application (PWA)** designed to facilitate emergency communication in disconnected environments via **Delay-Tolerant Store-and-Forward Multi-Hop Relaying**.

```
[Survivor A (Origin)]  ➔  [Relay B (Volunteer)]  ➔  [Relay C (Shelter)]  ➔  [Rescue Command Node]
```

Instead of requiring the survivor to possess an unbroken direct connection to emergency services, the emergency SOS beacon is relayed hop-by-hop across intermediate peer devices until it reaches a command node.

---

## 2. Browser Networking Capabilities & Limitations

A critical requirement of this project is **strict technical honesty** regarding what web browsers can and cannot do:

| Technology | Browser Support | Capabilities | Hard Sandbox Constraints |
| :--- | :--- | :--- | :--- |
| **Web Bluetooth** | Chrome / Edge | Can connect to existing GATT peripheral devices | **Cannot advertise as a BLE Peripheral or Beacon.** Browsers cannot beacon to other browsers without user interaction or native OS apps. |
| **WebRTC** | Universal | High-speed P2P data channels | **Requires an active Signaling Server** or manual SDP exchange. Cannot discover local peers with zero network. |
| **PWA & Service Worker** | Universal | Caches app assets, enabling full offline startup and usage | Universal across modern mobile and desktop browsers. |
| **IndexedDB** | Universal | Robust local storage for SOS packets, seen packet hashes, and logs | Client-side only; requires physical transport to propagate data. |
| **BroadcastChannel** | Universal | Real cross-tab / cross-window inter-process messaging | Limited to tabs/windows on the same physical host. |
| **WebSerial / WebUSB** | Chromium | Direct communication with external microcontrollers (ESP32/LoRa) | Requires OTG or USB connection to hardware. |

### Architectural Conclusion: Modular Transport Architecture
Because browser sandboxes prevent autonomous background peer-to-peer RF discovery, this application implements a **pluggable transport abstraction** (`ITransportLayer`):
1. **Simulation Transport (`SimulationTransport`)**: An interactive 4-node visual laboratory demonstrating store-and-forward routing, TTL decrement, path audits, and duplicate suppression.
2. **Local Multi-Tab Mesh (`BroadcastTransport`)**: Uses the browser's native `BroadcastChannel` API to facilitate real zero-backend communication between multiple tabs/windows on the same machine.
3. **Hardware Bridge Adapter (Extensible Interface)**: A modular adapter designed for connecting to external hardware nodes (e.g., ESP32 running Meshtastic/LoRa via WebSerial, or a native Android BLE daemon).

---

## 3. Core Features Implemented (Phase 1)

1. **Survivor Mode**:
   - High-contrast, accessibility-first SOS trigger button.
   - Emergency category classification: `Trapped`, `Medical Emergency`, `Fire`, `Flood`, `Injury`, `Other`.
   - Urgency severity level selection: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`.
   - Browser GPS acquisition via Geolocation API (latitude, longitude, accuracy radius, and coordinate formatting).
   - Collision-resistant Emergency ID generation (`EMG-<timestamp>-<hex>`).
   - Local persistence in IndexedDB.
   - Real-time 5-stage status tracker: `Created` ➔ `Searching for Relay` ➔ `Relayed` ➔ `Received by Command` ➔ `Acknowledged`.

2. **Rescue / Command Operations Mode**:
   - Live triage queue with automatic visual prioritization for `CRITICAL` alerts.
   - Interactive Leaflet map plotting incidents with color-coded severity markers.
   - Search, severity filters, and status filters.
   - Incident Dossier Modal showing full relay paths, coordinates, timestamps, and survivor notes.
   - Operator actions: **Acknowledge SOS** (broadcasts reverse ACK to survivor) and **Mark Resolved**.
   - Built-in "Simulate Incoming Beacon" generator for instant triage testing.

3. **Multi-Hop Simulation Studio**:
   - Visual topological diagram showing: `Survivor A` ➔ `Relay B` ➔ `Relay C` ➔ `Rescue Node`.
   - Discrete **Step Next Hop** and **Auto-Play** modes.
   - Real-time node buffer inspector and online/offline status toggles.
   - Protocol verification controls: **Test Duplicate Drop** and **Test TTL Expiry**.
   - Live **Protocol Audit Ledger** detailing why packets are forwarded, buffered, or dropped.

4. **Offline Architecture & PWA**:
   - Service worker (`public/sw.js`) pre-caching static assets for complete offline availability.
   - Web App Manifest (`public/manifest.json`) supporting installation to home screens.
   - Zero-dependency client-side persistence via native IndexedDB (`DisasterEmergencyNetworkDB`).

---

## 4. How to Run

### Prerequisites
- Node.js (v18 or higher) and npm installed.

### Development Mode (with hot-reload)
```powershell
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build & Preview
```powershell
# Build optimized production bundle
npm run build

# Launch local preview server
npm run preview
```
Open [http://localhost:4173](http://localhost:4173) in your browser.

---

## 5. Demonstration Guide for Evaluators & Presentations

1. **Testing Same-Device Cross-Tab Mesh**:
   - Open [http://localhost:3000](http://localhost:3000) in Tab 1 and select **Survivor Mode**.
   - Open [http://localhost:3000](http://localhost:3000) in Tab 2 and select **Rescue Command**.
   - In Tab 1, acquire GPS and click **Transmit Emergency SOS**.
   - Observe Tab 2 instantly receive the alert via `BroadcastChannel` and plot it on the map.
   - In Tab 2, click **Acknowledge SOS**.
   - Return to Tab 1 and observe the status banner turn green: **"SOS ACKNOWLEDGED BY COMMAND"**.

2. **Testing the Multi-Hop Relay Simulation**:
   - Navigate to **Relay Simulation** in the top navigation bar.
   - Click **Trigger SOS (TTL=5)** to create a simulated beacon at Node A.
   - Click **Step Next Hop** repeatedly to watch the packet hop to Relay B, Relay C, and Command Node D.
   - Inspect the **Mesh Protocol Audit Ledger** to see how TTL is decremented and path history is appended.
   - Click **Test Duplicate Drop** to verify the mesh engine discards duplicate transmissions.
   - Click **Test TTL Expiry** to demonstrate that packets with TTL=1 are safely dropped to prevent infinite routing loops.

3. **Inspecting Browser Limitations**:
   - Click **Browser Tech & Limits** in the navigation bar to review the technical matrix analyzing Web Bluetooth, WebRTC, and hardware bridge requirements.
