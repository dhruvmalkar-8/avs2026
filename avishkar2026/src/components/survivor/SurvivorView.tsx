import React, { useState, useEffect } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { EmergencyType, SeverityLevel } from '../../types/emergency';
import { GeolocationService, GeoResult } from '../../services/location/geolocation';
import { 
  AlertTriangle, 
  MapPin, 
  CheckCircle, 
  Send, 
  RefreshCw, 
  Flame, 
  Waves, 
  Activity, 
  Crosshair, 
  Copy, 
  Radio, 
  ShieldAlert,
  Clock,
  ArrowRight
} from 'lucide-react';

const EMERGENCY_TYPES: { type: EmergencyType; label: string; icon: React.ReactNode; color: string }[] = [
  { type: 'TRAPPED', label: 'Trapped / Structural Collapse', icon: <ShieldAlert size={20} />, color: '#dc2626' },
  { type: 'MEDICAL_EMERGENCY', label: 'Medical Emergency', icon: <Activity size={20} />, color: '#e11d48' },
  { type: 'FIRE', label: 'Fire / Smoke Hazard', icon: <Flame size={20} />, color: '#ea580c' },
  { type: 'FLOOD', label: 'Flood / Rising Water', icon: <Waves size={20} />, color: '#0284c7' },
  { type: 'INJURY', label: 'Severe Injury / Bleeding', icon: <AlertTriangle size={20} />, color: '#d97706' },
  { type: 'OTHER', label: 'Other Critical Danger', icon: <AlertTriangle size={20} />, color: '#475569' }
];

const SEVERITIES: { level: SeverityLevel; label: string; desc: string; color: string }[] = [
  { level: 'CRITICAL', label: 'CRITICAL', desc: 'Imminent threat to life (minutes matter)', color: '#dc2626' },
  { level: 'HIGH', label: 'HIGH', desc: 'Severe danger or worsening condition', color: '#ea580c' },
  { level: 'MEDIUM', label: 'MEDIUM', desc: 'Stable but trapped or needing evacuation', color: '#d97706' },
  { level: 'LOW', label: 'LOW', desc: 'Minor injury or safe sheltering', color: '#16a34a' }
];

export const SurvivorView: React.FC = () => {
  const { submitSOS, activeSurvivorSos, deleteEmergency, setCurrentView } = useEmergency();

  // Form State
  const [selectedType, setSelectedType] = useState<EmergencyType>('TRAPPED');
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityLevel>('CRITICAL');
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<boolean>(false);

  // GPS State
  const [location, setLocation] = useState<GeoResult | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Auto-acquire GPS on mount
  useEffect(() => {
    handleAcquireLocation();
  }, []);

  const handleAcquireLocation = async () => {
    setIsLocating(true);
    setLocationError(null);
    try {
      const res = await GeolocationService.getCurrentLocation();
      setLocation(res);
      if (res.error) {
        setLocationError(res.error);
      }
    } catch (e: any) {
      setLocationError(e.message || 'GPS retrieval failed');
    } finally {
      setIsLocating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Use acquired location or fallback default
      const lat = location?.latitude ?? 18.5204;
      const lng = location?.longitude ?? 73.8567;
      const acc = location?.accuracy;

      await submitSOS({
        emergencyType: selectedType,
        severity: selectedSeverity,
        message,
        latitude: lat,
        longitude: lng,
        accuracy: acc
      });
    } catch (err: any) {
      alert(`Failed to save SOS: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2500);
  };

  // If there is an active SOS for this survivor, show the live status tracker
  if (activeSurvivorSos) {
    const isAck = activeSurvivorSos.status === 'ACKNOWLEDGED' || activeSurvivorSos.status === 'RESOLVED';
    const isCmd = activeSurvivorSos.status === 'RECEIVED_BY_COMMAND' || isAck;
    const isRelayed = activeSurvivorSos.status === 'RELAYED' || isCmd;

    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Urgent Status Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: isAck ? '3px solid #10b981' : '3px solid #dc2626',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          marginBottom: '2rem'
        }}>
          {/* Header */}
          <div style={{
            backgroundColor: isAck ? '#059669' : '#dc2626',
            color: '#ffffff',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Radio className={isAck ? '' : 'sos-pulse-btn'} size={28} />
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
                  {isAck ? 'SOS ACKNOWLEDGED BY COMMAND' : 'EMERGENCY BEACON ACTIVE'}
                </h2>
                <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                  {isAck 
                    ? `First responders have confirmed your SOS! Help is being dispatched.` 
                    : `Transmitting via Delay-Tolerant Store-and-Forward Mesh.`}
                </span>
              </div>
            </div>

            <div style={{
              backgroundColor: 'rgba(0,0,0,0.25)',
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: 700
            }}>
              Severity: {activeSurvivorSos.severity}
            </div>
          </div>

          <div style={{ padding: '1.5rem' }}>
            {/* Emergency ID readout */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#f8fafc',
              padding: '0.85rem 1.25rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              marginBottom: '1.5rem'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                  Unique Emergency ID
                </span>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>
                  {activeSurvivorSos.emergencyId}
                </div>
              </div>

              <button
                onClick={() => handleCopyId(activeSurvivorSos.emergencyId)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: copiedId ? '#dcfce7' : '#e2e8f0',
                  color: copiedId ? '#15803d' : '#334155',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}
              >
                {copiedId ? <CheckCircle size={16} /> : <Copy size={16} />}
                <span>{copiedId ? 'Copied' : 'Copy ID'}</span>
              </button>
            </div>

            {/* Step-by-Step Progress Pipeline */}
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', color: '#334155' }}>
              Relay Mesh Progression
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '0.75rem',
              marginBottom: '1.5rem'
            }}>
              {/* Step 1: Created */}
              <div style={{
                padding: '0.75rem',
                borderRadius: '8px',
                backgroundColor: '#f1f5f9',
                borderLeft: '4px solid #10b981',
                fontSize: '0.8rem'
              }}>
                <div style={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CheckCircle size={14} color="#10b981" /> 1. Created
                </div>
                <div style={{ color: '#64748b', marginTop: '0.2rem' }}>Stored in IndexedDB</div>
              </div>

              {/* Step 2: Searching */}
              <div style={{
                padding: '0.75rem',
                borderRadius: '8px',
                backgroundColor: '#f1f5f9',
                borderLeft: isRelayed ? '4px solid #10b981' : '4px solid #f59e0b',
                fontSize: '0.8rem'
              }}>
                <div style={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  {isRelayed ? <CheckCircle size={14} color="#10b981" /> : <RefreshCw size={14} className="sos-pulse-btn" color="#f59e0b" />}
                  2. Searching
                </div>
                <div style={{ color: '#64748b', marginTop: '0.2rem' }}>Scanning for Relays</div>
              </div>

              {/* Step 3: Relayed */}
              <div style={{
                padding: '0.75rem',
                borderRadius: '8px',
                backgroundColor: '#f1f5f9',
                borderLeft: isRelayed ? '4px solid #10b981' : '4px solid #cbd5e1',
                fontSize: '0.8rem'
              }}>
                <div style={{ fontWeight: 800, color: isRelayed ? '#0f172a' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  {isRelayed ? <CheckCircle size={14} color="#10b981" /> : <Clock size={14} />}
                  3. Relayed
                </div>
                <div style={{ color: '#64748b', marginTop: '0.2rem' }}>
                  {activeSurvivorSos.hopCount > 0 ? `${activeSurvivorSos.hopCount} hop(s)` : 'Pending peer'}
                </div>
              </div>

              {/* Step 4: Command Received */}
              <div style={{
                padding: '0.75rem',
                borderRadius: '8px',
                backgroundColor: '#f1f5f9',
                borderLeft: isCmd ? '4px solid #10b981' : '4px solid #cbd5e1',
                fontSize: '0.8rem'
              }}>
                <div style={{ fontWeight: 800, color: isCmd ? '#0f172a' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  {isCmd ? <CheckCircle size={14} color="#10b981" /> : <Clock size={14} />}
                  4. Command
                </div>
                <div style={{ color: '#64748b', marginTop: '0.2rem' }}>{isCmd ? 'Arrived at HQ' : 'In transit'}</div>
              </div>

              {/* Step 5: Acknowledged */}
              <div style={{
                padding: '0.75rem',
                borderRadius: '8px',
                backgroundColor: isAck ? '#ecfdf5' : '#f1f5f9',
                borderLeft: isAck ? '4px solid #10b981' : '4px solid #cbd5e1',
                fontSize: '0.8rem'
              }}>
                <div style={{ fontWeight: 800, color: isAck ? '#065f46' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  {isAck ? <CheckCircle size={14} color="#10b981" /> : <Clock size={14} />}
                  5. ACK Received
                </div>
                <div style={{ color: isAck ? '#047857' : '#64748b', marginTop: '0.2rem' }}>
                  {isAck ? 'Dispatch Confirmed' : 'Awaiting team'}
                </div>
              </div>
            </div>

            {/* Incident Summary Info */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              fontSize: '0.875rem'
            }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem' }}>EMERGENCY TYPE</span>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{activeSurvivorSos.emergencyType}</div>
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem' }}>GPS COORDINATES</span>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>
                  {GeolocationService.formatCoordinates(activeSurvivorSos.latitude, activeSurvivorSos.longitude)}
                </div>
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem' }}>TIME ELAPSED</span>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>
                  {new Date(activeSurvivorSos.timestamp).toLocaleTimeString()}
                </div>
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem' }}>RELAY PATH HOPS</span>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>
                  {activeSurvivorSos.relayPath.join(' → ')}
                </div>
              </div>

              {activeSurvivorSos.message && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={{ color: '#64748b', fontSize: '0.75rem' }}>SURVIVOR MESSAGE</span>
                  <div style={{ fontStyle: 'italic', color: '#1e293b' }}>"{activeSurvivorSos.message}"</div>
                </div>
              )}

              {activeSurvivorSos.acknowledgedBy && (
                <div style={{ gridColumn: '1 / -1', backgroundColor: '#dcfce7', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                  <span style={{ color: '#15803d', fontWeight: 700 }}>
                    Acknowledged by {activeSurvivorSos.acknowledgedBy} at{' '}
                    {new Date(activeSurvivorSos.acknowledgedAt || 0).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setCurrentView('SIMULATION')}
                style={{
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span>View Multi-Hop Propagation in Simulation</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => deleteEmergency(activeSurvivorSos.emergencyId)}
                style={{
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  border: '1px solid #fecaca'
                }}
              >
                Cancel / Reset SOS
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SOS Creation View
  return (
    <div style={{ maxWidth: '750px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* SOS Title & Large Button Trigger */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#991b1b', marginBottom: '0.5rem' }}>
          Survivor Emergency Portal
        </h1>
        <p style={{ color: '#475569', fontSize: '0.95rem' }}>
          Broadcasting without cellular or internet? Fill this emergency beacon. 
          Your information is stored locally and relayed across available mesh nodes.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{
        backgroundColor: '#ffffff',
        padding: '2rem',
        borderRadius: '16px',
        border: '2px solid #fee2e2',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08)'
      }}>
        {/* 1. Emergency Type Selection */}
        <div style={{ marginBottom: '1.75rem' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>
            1. Select Emergency Type *
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.75rem'
          }}>
            {EMERGENCY_TYPES.map((item) => {
              const isSelected = selectedType === item.type;
              return (
                <button
                  type="button"
                  key={item.type}
                  onClick={() => setSelectedType(item.type)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.85rem 1rem',
                    borderRadius: '8px',
                    textAlign: 'left',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    border: isSelected ? `2px solid ${item.color}` : '1px solid #cbd5e1',
                    backgroundColor: isSelected ? '#fee2e2' : '#f8fafc',
                    color: isSelected ? '#991b1b' : '#334155'
                  }}
                >
                  <span style={{ color: item.color }}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Severity Selection */}
        <div style={{ marginBottom: '1.75rem' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>
            2. Urgency & Severity Level *
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '0.75rem'
          }}>
            {SEVERITIES.map((sev) => {
              const isSelected = selectedSeverity === sev.level;
              return (
                <button
                  type="button"
                  key={sev.level}
                  onClick={() => setSelectedSeverity(sev.level)}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: isSelected ? `2px solid ${sev.color}` : '1px solid #cbd5e1',
                    backgroundColor: isSelected ? sev.color : '#f8fafc',
                    color: isSelected ? '#ffffff' : '#334155'
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{sev.label}</div>
                  <div style={{ fontSize: '0.7rem', opacity: isSelected ? 0.9 : 0.7, marginTop: '0.2rem' }}>
                    {sev.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Location Acquisition (GPS) */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '1.25rem',
          marginBottom: '1.75rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={18} color="#dc2626" />
              <span>3. Survivor Location (Browser GPS)</span>
            </label>

            <button
              type="button"
              onClick={handleAcquireLocation}
              disabled={isLocating}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#334155'
              }}
            >
              <RefreshCw size={14} className={isLocating ? 'sos-pulse-btn' : ''} />
              <span>{isLocating ? 'Detecting GPS...' : 'Refresh GPS'}</span>
            </button>
          </div>

          {location ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.9rem' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem' }}>LATITUDE</span>
                <div style={{ fontWeight: 800, fontFamily: 'monospace', color: '#0f172a' }}>
                  {location.latitude.toFixed(6)}°
                </div>
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem' }}>LONGITUDE</span>
                <div style={{ fontWeight: 800, fontFamily: 'monospace', color: '#0f172a' }}>
                  {location.longitude.toFixed(6)}°
                </div>
              </div>

              {location.accuracy && (
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem' }}>ACCURACY</span>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>±{location.accuracy} meters</div>
                </div>
              )}

              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem' }}>SOURCE</span>
                <div style={{ fontWeight: 700, color: location.source === 'GPS_HARDWARE' ? '#16a34a' : '#d97706' }}>
                  {location.source === 'GPS_HARDWARE' ? 'Live Device GPS' : 'Simulated Preset'}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Detecting coordinates...</div>
          )}

          {locationError && (
            <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#b45309', backgroundColor: '#fef3c7', padding: '0.4rem 0.75rem', borderRadius: '4px' }}>
              {locationError}
            </div>
          )}
        </div>

        {/* 4. Short Emergency Note */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
            4. Emergency Details / Immediate Needs (Optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. 2 adults, 1 child trapped on 2nd floor balcony. Water rising fast. No drinking water."
            rows={3}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              resize: 'vertical',
              outline: 'none'
            }}
          />
        </div>

        {/* 5. Big Obvious SOS Action Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            type="submit"
            disabled={isSubmitting}
            className="sos-pulse-btn"
            style={{
              backgroundColor: '#dc2626',
              color: '#ffffff',
              padding: '1.25rem 2.5rem',
              borderRadius: '9999px',
              fontSize: '1.25rem',
              fontWeight: 900,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: '0 10px 25px -5px rgba(220, 38, 38, 0.5)',
              border: '4px solid #ef4444'
            }}
          >
            <Send size={24} />
            <span>{isSubmitting ? 'GENERATING BEACON...' : 'TRANSMIT EMERGENCY SOS'}</span>
          </button>
          <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
            Persists to local storage & broadcasts to all nearby relay nodes immediately
          </div>
        </div>
      </form>
    </div>
  );
};
