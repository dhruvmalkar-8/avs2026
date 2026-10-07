import React from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { AlertTriangle, MapPin, Network, Shield, ArrowRight, Radio, BatteryCharging, Zap } from 'lucide-react';

export const LandingView: React.FC = () => {
  const { setCurrentView } = useEmergency();

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Hero Banner */}
      <div style={{
        textAlign: 'center',
        padding: '3rem 1.5rem',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: '16px',
        color: '#ffffff',
        border: '1px solid #334155',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
        marginBottom: '2.5rem'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: 'rgba(220, 38, 38, 0.2)',
          border: '1px solid #dc2626',
          color: '#fca5a5',
          padding: '0.35rem 0.85rem',
          borderRadius: '9999px',
          fontSize: '0.85rem',
          fontWeight: 700,
          marginBottom: '1.25rem'
        }}>
          <Radio size={16} />
          <span>Disaster Resilience & Relief Initiative</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(1.8rem, 4vw, 2.75rem)',
          fontWeight: 800,
          lineHeight: 1.15,
          marginBottom: '1rem',
          letterSpacing: '-0.025em'
        }}>
          Offline Multi-Hop Emergency Relay Network
        </h1>

        <p style={{
          fontSize: '1.1rem',
          color: '#cbd5e1',
          maxWidth: '750px',
          margin: '0 auto 2rem auto',
          lineHeight: 1.6
        }}>
          When cellular towers fail, fiber is severed, and Wi-Fi collapses during floods, earthquakes, or fires:
          survivors broadcast SOS beacons passed node-by-node through nearby devices to reach search and rescue teams.
        </p>

        {/* Big Quick Actions */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setCurrentView('SURVIVOR')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              padding: '1rem 1.75rem',
              borderRadius: '10px',
              fontSize: '1.1rem',
              fontWeight: 800,
              boxShadow: '0 10px 15px -3px rgba(220, 38, 38, 0.4)',
              border: '2px solid #ef4444'
            }}
          >
            <AlertTriangle size={22} />
            <span>Launch Survivor SOS</span>
            <ArrowRight size={18} />
          </button>

          <button
            onClick={() => setCurrentView('RESCUE')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              backgroundColor: '#1e293b',
              color: '#ffffff',
              padding: '1rem 1.75rem',
              borderRadius: '10px',
              fontSize: '1.1rem',
              fontWeight: 700,
              border: '2px solid #3b82f6',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            <MapPin size={22} color="#60a5fa" />
            <span>Open Command Operations</span>
          </button>
        </div>
      </div>

      {/* Mode Grid Cards */}
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.25rem', color: '#1e293b' }}>
        Core Operational Modes
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2.5rem'
      }}>
        {/* Survivor Mode Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '2px solid #fee2e2',
          borderTop: '6px solid #dc2626',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.5rem', borderRadius: '8px' }}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#991b1b' }}>Survivor Mode</h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Emergency SOS Beaconing</span>
            </div>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5, marginBottom: '1.25rem', flex: 1 }}>
            High-contrast, one-tap SOS creation. Captures device GPS coordinates, incident classification (Trapped, Medical, Fire, Flood), 
            and tracks real-time status across multi-hop relay stages.
          </p>
          <button
            onClick={() => setCurrentView('SURVIVOR')}
            style={{
              backgroundColor: '#dc2626',
              color: '#ffffff',
              padding: '0.65rem 1rem',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <span>Enter Survivor Mode</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Rescue Mode Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '2px solid #dbeafe',
          borderTop: '6px solid #2563eb',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ backgroundColor: '#dbeafe', color: '#2563eb', padding: '0.5rem', borderRadius: '8px' }}>
              <MapPin size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e40af' }}>Rescue / Command Mode</h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Triage, Map & Dispatch</span>
            </div>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5, marginBottom: '1.25rem', flex: 1 }}>
            Command operations dashboard. Visualizes emergency beacons on an interactive map, displays hop histories, 
            prioritizes critical emergencies, and broadcasts rescue ACK confirmations.
          </p>
          <button
            onClick={() => setCurrentView('RESCUE')}
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              padding: '0.65rem 1rem',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <span>Open Rescue Dashboard</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Simulation Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '2px solid #d1fae5',
          borderTop: '6px solid #059669',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ backgroundColor: '#d1fae5', color: '#059669', padding: '0.5rem', borderRadius: '8px' }}>
              <Network size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#065f46' }}>Relay Simulation Studio</h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Multi-Hop Demonstration</span>
            </div>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5, marginBottom: '1.25rem', flex: 1 }}>
            Educational laboratory showcasing Survivor A → Relay B → Relay C → Rescue Node. 
            Interactive step-by-step forwarding, packet buffer inspection, duplicate dropping, and TTL verification.
          </p>
          <button
            onClick={() => setCurrentView('SIMULATION')}
            style={{
              backgroundColor: '#059669',
              color: '#ffffff',
              padding: '0.65rem 1rem',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <span>Launch Simulation Studio</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Differentiating Concept & Technical Pillars */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '2rem',
        border: '1px solid #e2e8f0',
        marginBottom: '2rem'
      }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', color: '#0f172a' }}>
          How the Offline Multi-Hop Relay Works
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem'
        }}>
          <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 800, color: '#dc2626', marginBottom: '0.25rem' }}>1. Local Generation</div>
            <div style={{ fontSize: '0.85rem', color: '#475569' }}>
              Unique ID generated client-side, encrypted/structured, and persisted into IndexedDB with high-precision GPS.
            </div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 800, color: '#f59e0b', marginBottom: '0.25rem' }}>2. Store-and-Forward</div>
            <div style={{ fontSize: '0.85rem', color: '#475569' }}>
              Intermediate devices store packets in local buffers and relay them as other nodes come within physical range.
            </div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 800, color: '#2563eb', marginBottom: '0.25rem' }}>3. Loop & Flood Prevention</div>
            <div style={{ fontSize: '0.85rem', color: '#475569' }}>
              Deduplication cache discards repeated packets; TTL bounds prevent infinite relay loops across dense crowds.
            </div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 800, color: '#059669', marginBottom: '0.25rem' }}>4. Reverse ACK Delivery</div>
            <div style={{ fontSize: '0.85rem', color: '#475569' }}>
              When Command marks an alert acknowledged, the receipt is relayed back so the survivor knows help is coming.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
