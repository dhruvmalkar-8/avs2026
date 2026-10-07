import React from 'react';
import { 
  ShieldAlert, 
  Bluetooth, 
  Wifi, 
  Database, 
  Cpu, 
  HardDrive, 
  Layers, 
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';

export const LimitationsView: React.FC = () => {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Title */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem' }}>
          Browser Networking Analysis & Technical Limitations
        </h1>
        <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.6 }}>
          A rigorous, honest technical evaluation of modern browser capabilities for disaster communication.
          Highlights what works natively, what browser security prevents, and how our modular architecture 
          bridges to physical hardware.
        </p>
      </div>

      {/* Comparison Matrix Table */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        marginBottom: '2.5rem'
      }}>
        <div style={{ backgroundColor: '#1e293b', color: '#ffffff', padding: '1rem 1.25rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Technology Feasibility Assessment in Web Browsers</h2>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Technology</th>
                <th style={{ padding: '0.75rem 1rem' }}>Browser Support</th>
                <th style={{ padding: '0.75rem 1rem' }}>Disaster Capability</th>
                <th style={{ padding: '0.75rem 1rem' }}>Hard Limitation / Blocker</th>
              </tr>
            </thead>
            <tbody>
              {/* Web Bluetooth */}
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Bluetooth size={18} color="#2563eb" />
                  <span>Web Bluetooth</span>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                    Partial (Chrome/Edge)
                  </span>
                </td>
                <td style={{ padding: '0.85rem 1rem', color: '#16a34a' }}>
                  Can connect to external Bluetooth GATT devices (heart monitors, custom radios)
                </td>
                <td style={{ padding: '0.85rem 1rem', color: '#b91c1c' }}>
                  <strong>Cannot act as a BLE Peripheral or Beacon.</strong> A browser cannot advertise itself to another phone's browser without native apps.
                </td>
              </tr>

              {/* WebRTC */}
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Wifi size={18} color="#059669" />
                  <span>WebRTC (Peer-to-Peer)</span>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                    Universal
                  </span>
                </td>
                <td style={{ padding: '0.85rem 1rem', color: '#16a34a' }}>
                  Direct data channels between peers with microsecond latency
                </td>
                <td style={{ padding: '0.85rem 1rem', color: '#b91c1c' }}>
                  <strong>Requires an active Signaling Server</strong> or manual copy-pasting of SDP offers. Cannot discover peers with zero infrastructure.
                </td>
              </tr>

              {/* PWA & Service Workers */}
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Cpu size={18} color="#7c3aed" />
                  <span>PWA & Service Worker</span>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                    Universal
                  </span>
                </td>
                <td style={{ padding: '0.85rem 1rem', color: '#16a34a' }}>
                  Complete offline asset caching, background sync, app home screen install
                </td>
                <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>
                  Works completely offline after initial load, but cannot communicate externally without transport.
                </td>
              </tr>

              {/* IndexedDB */}
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Database size={18} color="#d97706" />
                  <span>IndexedDB & Cache</span>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                    Universal
                  </span>
                </td>
                <td style={{ padding: '0.85rem 1rem', color: '#16a34a' }}>
                  Permanent local persistence for emergency outbox, seen packets, and relay cache
                </td>
                <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>
                  Local to device; requires physical transport or bridge to move data.
                </td>
              </tr>

              {/* WebSerial / WebUSB */}
              <tr>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HardDrive size={18} color="#0891b2" />
                  <span>WebSerial / WebUSB</span>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                    Chromium
                  </span>
                </td>
                <td style={{ padding: '0.85rem 1rem', color: '#16a34a' }}>
                  Direct serial link to external hardware (ESP32 LoRa transceivers / Meshtastic nodes)
                </td>
                <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>
                  Requires physical USB / OTG cable to the radio module.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep-Dive Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {/* Why Browser Can't Do Standalone Ad-Hoc RF */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#991b1b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <XCircle size={20} color="#dc2626" />
            <span>The Browser Sandbox Limitation</span>
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6, marginBottom: '0.75rem' }}>
            Operating systems (Android, iOS, Windows, macOS) deliberately isolate web browsers inside strict security sandboxes.
          </p>
          <ul style={{ fontSize: '0.85rem', color: '#334155', paddingLeft: '1.25rem', lineHeight: 1.6 }}>
            <li>A browser cannot broadcast Bluetooth advertisements (BLE Peripheral mode is blocked).</li>
            <li>A browser cannot create an ad-hoc Wi-Fi Direct or Wi-Fi Aware network without OS native APIs.</li>
            <li>Background scanning for nearby radio signals is blocked when the screen is locked or browser is in background.</li>
          </ul>
        </div>

        {/* Our Modular Hybrid Architecture Solution */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#065f46', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={20} color="#059669" />
            <span>The Modular Transport Architecture</span>
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6, marginBottom: '0.75rem' }}>
            To solve this honestly and effectively, this application separates the <strong>Protocol & Presentation Layer</strong> from the <strong>Physical Transport Layer</strong>:
          </p>
          <ul style={{ fontSize: '0.85rem', color: '#334155', paddingLeft: '1.25rem', lineHeight: 1.6 }}>
            <li><strong>Transport 1 (Simulation Mode):</strong> Interactive visual multi-hop laboratory for demonstrations and testing.</li>
            <li><strong>Transport 2 (BroadcastChannel):</strong> Instant local cross-tab and cross-window sync for same-device trials.</li>
            <li><strong>Transport 3 (Pluggable Native Bridge):</strong> WebSerial or Local WebSocket bridge connecting to an ESP32 LoRa dongle or Android BLE foreground service.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
