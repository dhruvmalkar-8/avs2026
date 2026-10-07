import React from 'react';
import { useEmergency, ViewMode } from '../../context/EmergencyContext';
import { AlertTriangle, Radio, Shield, Network, MapPin, Database, Wifi, WifiOff } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentView, setCurrentView, isOnline, emergencies } = useEmergency();

  const criticalCount = emergencies.filter(
    (e) => e.severity === 'CRITICAL' && e.status !== 'RESOLVED'
  ).length;

  return (
    <header style={{
      backgroundColor: '#0f172a',
      color: '#ffffff',
      borderBottom: '2px solid #dc2626',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '0.75rem 1.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        {/* Neutral Application Branding */}
        <div 
          onClick={() => setCurrentView('LANDING')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <div style={{
            backgroundColor: '#dc2626',
            color: '#ffffff',
            padding: '0.5rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Radio size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.025em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Disaster Emergency Network</span>
              <span style={{
                fontSize: '0.65rem',
                backgroundColor: '#ef4444',
                color: '#fff',
                padding: '0.15rem 0.4rem',
                borderRadius: '4px',
                fontWeight: 700,
                textTransform: 'uppercase'
              }}>
                Offline Relay Mesh
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Multi-Hop Delay-Tolerant Emergency System
            </div>
          </div>
        </div>

        {/* Navigation Modes */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setCurrentView('SURVIVOR')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.9rem',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.875rem',
              backgroundColor: currentView === 'SURVIVOR' ? '#dc2626' : '#1e293b',
              color: '#ffffff',
              border: currentView === 'SURVIVOR' ? '1px solid #ef4444' : '1px solid #334155'
            }}
          >
            <AlertTriangle size={16} />
            <span>Survivor Mode</span>
          </button>

          <button
            onClick={() => setCurrentView('RESCUE')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.9rem',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.875rem',
              backgroundColor: currentView === 'RESCUE' ? '#2563eb' : '#1e293b',
              color: '#ffffff',
              border: currentView === 'RESCUE' ? '1px solid #3b82f6' : '1px solid #334155',
              position: 'relative'
            }}
          >
            <MapPin size={16} />
            <span>Rescue Command</span>
            {criticalCount > 0 && (
              <span className="flash-critical-badge" style={{
                fontSize: '0.7rem',
                padding: '0.1rem 0.4rem',
                borderRadius: '9999px',
                fontWeight: 800,
                marginLeft: '0.25rem'
              }}>
                {criticalCount} CRITICAL
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentView('SIMULATION')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.9rem',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.875rem',
              backgroundColor: currentView === 'SIMULATION' ? '#059669' : '#1e293b',
              color: '#ffffff',
              border: currentView === 'SIMULATION' ? '1px solid #10b981' : '1px solid #334155'
            }}
          >
            <Network size={16} />
            <span>Relay Simulation</span>
          </button>

          <button
            onClick={() => setCurrentView('LIMITATIONS')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.8rem',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.8rem',
              backgroundColor: currentView === 'LIMITATIONS' ? '#475569' : '#1e293b',
              color: '#cbd5e1',
              border: '1px solid #334155'
            }}
          >
            <Shield size={14} />
            <span>Browser Tech & Limits</span>
          </button>
        </nav>

        {/* Status Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.3rem 0.6rem',
            borderRadius: '6px',
            backgroundColor: isOnline ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.2)',
            color: isOnline ? '#34d399' : '#fbbf24',
            border: isOnline ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.4)'
          }}>
            {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
            <span>{isOnline ? 'Online' : 'Offline PWA Active'}</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.3rem 0.6rem',
            borderRadius: '6px',
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            color: '#60a5fa',
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }}>
            <Database size={14} />
            <span>IndexedDB Ready</span>
          </div>
        </div>
      </div>
    </header>
  );
};
