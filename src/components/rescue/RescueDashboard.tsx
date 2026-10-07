import React, { useState } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { EmergencyMessage, SeverityLevel, EmergencyStatus } from '../../types/emergency';
import { EmergencyMap } from './EmergencyMap';
import { GeolocationService } from '../../services/location/geolocation';
import { 
  ShieldAlert, 
  MapPin, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Radio, 
  PlusCircle, 
  Search, 
  Check, 
  XCircle,
  Eye,
  Filter
} from 'lucide-react';

export const RescueDashboard: React.FC = () => {
  const { emergencies, acknowledgeEmergency, resolveEmergency, submitSOS } = useEmergency();

  const [selectedEmergencyId, setSelectedEmergencyId] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [modalIncident, setModalIncident] = useState<EmergencyMessage | null>(null);

  // Statistics
  const totalCount = emergencies.length;
  const criticalCount = emergencies.filter((e) => e.severity === 'CRITICAL' && e.status !== 'RESOLVED').length;
  const acknowledgedCount = emergencies.filter((e) => e.status === 'ACKNOWLEDGED').length;
  const resolvedCount = emergencies.filter((e) => e.status === 'RESOLVED').length;

  // Filtered & Prioritized emergencies (CRITICAL first, then newest)
  const filteredEmergencies = emergencies.filter((e) => {
    if (filterSeverity !== 'ALL' && e.severity !== filterSeverity) return false;
    if (filterStatus === 'UNACKNOWLEDGED' && (e.status === 'ACKNOWLEDGED' || e.status === 'RESOLVED')) return false;
    if (filterStatus === 'ACKNOWLEDGED' && e.status !== 'ACKNOWLEDGED') return false;
    if (filterStatus === 'RESOLVED' && e.status !== 'RESOLVED') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        e.emergencyId.toLowerCase().includes(q) ||
        e.emergencyType.toLowerCase().includes(q) ||
        e.message.toLowerCase().includes(q)
      );
    }
    return true;
  }).sort((a, b) => {
    // Critical first if not resolved
    const aCrit = a.severity === 'CRITICAL' && a.status !== 'RESOLVED';
    const bCrit = b.severity === 'CRITICAL' && b.status !== 'RESOLVED';
    if (aCrit && !bCrit) return -1;
    if (!aCrit && bCrit) return 1;
    return b.timestamp - a.timestamp;
  });

  const handleSimulateIncident = async () => {
    // Generate realistic disaster survivor alert nearby
    const types: ('TRAPPED' | 'MEDICAL_EMERGENCY' | 'FIRE' | 'FLOOD' | 'INJURY')[] = [
      'TRAPPED', 'MEDICAL_EMERGENCY', 'FIRE', 'FLOOD', 'INJURY'
    ];
    const severities: SeverityLevel[] = ['CRITICAL', 'HIGH', 'MEDIUM'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomSev = severities[Math.floor(Math.random() * severities.length)];

    // Slight random offset from center
    const latOffset = (Math.random() - 0.5) * 0.04;
    const lngOffset = (Math.random() - 0.5) * 0.04;

    const sampleMessages: Record<string, string> = {
      TRAPPED: 'Basement wall collapsed, 3 people trapped under concrete debris.',
      MEDICAL_EMERGENCY: 'Elderly patient with severe respiratory distress, oxygen running low.',
      FIRE: 'Electrical spark igniting gas line near shelter staircase.',
      FLOOD: 'Ground floor submerged up to 5 feet, electrical panel shorting.',
      INJURY: 'Deep laceration and fracture from falling building glass.'
    };

    await submitSOS({
      emergencyType: randomType,
      severity: randomSev,
      message: sampleMessages[randomType] || 'Urgent evacuation needed.',
      latitude: Number((18.5204 + latOffset).toFixed(6)),
      longitude: Number((73.8567 + lngOffset).toFixed(6)),
      accuracy: 25
    });
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem' }}>
      {/* Title & Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Radio size={28} color="#2563eb" />
            <span>Rescue & Command Operations</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Tactical situational awareness, incoming multi-hop beacon triage, and field dispatch.
          </p>
        </div>

        <button
          onClick={handleSimulateIncident}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#1e293b',
            color: '#ffffff',
            padding: '0.65rem 1.1rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 700,
            border: '1px solid #475569'
          }}
          title="Generates a mock survivor beacon to test incoming relay triage"
        >
          <PlusCircle size={16} color="#38bdf8" />
          <span>Simulate Incoming Beacon</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Emergencies</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a' }}>{totalCount}</div>
        </div>

        <div style={{
          backgroundColor: '#fee2e2',
          padding: '1rem',
          borderRadius: '10px',
          border: '2px solid #ef4444',
          boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#991b1b', textTransform: 'uppercase' }}>Critical Alerts</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#dc2626' }}>{criticalCount}</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Acknowledged</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#10b981' }}>{acknowledgedCount}</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Resolved / Safe</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#64748b' }}>{resolvedCount}</div>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Triage Feed */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 1.1fr) minmax(320px, 0.9fr)',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Left Column: Interactive Leaflet Map */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '1rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} color="#2563eb" />
              <span>Incident Location Radar</span>
            </h2>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {filteredEmergencies.length} active marker(s)
            </span>
          </div>

          <EmergencyMap
            emergencies={filteredEmergencies}
            selectedEmergencyId={selectedEmergencyId}
            onSelectEmergency={(id) => setSelectedEmergencyId(id)}
            onAcknowledge={(id) => acknowledgeEmergency(id, 'Command Alpha')}
          />
        </div>

        {/* Right Column: Triage Control & Filters */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '1.25rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '480px'
        }}>
          {/* Filter Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f1f5f9', padding: '0.4rem 0.75rem', borderRadius: '6px' }}>
              <Search size={16} color="#64748b" />
              <input
                type="text"
                placeholder="Search by ID, type, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  background: 'none',
                  outline: 'none',
                  fontSize: '0.85rem',
                  width: '100%'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                style={{
                  padding: '0.35rem 0.6rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical Only</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  padding: '0.35rem 0.6rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="ALL">All Statuses</option>
                <option value="UNACKNOWLEDGED">Unacknowledged</option>
                <option value="ACKNOWLEDGED">Acknowledged</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>
          </div>

          {/* Incident Feed List */}
          <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.25rem' }}>
            {filteredEmergencies.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                No emergency incidents match current filters.
              </div>
            ) : (
              filteredEmergencies.map((emg) => {
                const isCritical = emg.severity === 'CRITICAL';
                const isAck = emg.status === 'ACKNOWLEDGED' || emg.status === 'RESOLVED';
                const isSelected = emg.emergencyId === selectedEmergencyId;

                return (
                  <div
                    key={emg.emergencyId}
                    onClick={() => setSelectedEmergencyId(emg.emergencyId)}
                    style={{
                      padding: '0.85rem',
                      borderRadius: '8px',
                      marginBottom: '0.65rem',
                      border: isSelected ? '2px solid #2563eb' : isCritical && !isAck ? '2px solid #ef4444' : '1px solid #e2e8f0',
                      backgroundColor: isSelected ? '#eff6ff' : isCritical && !isAck ? '#fef2f2' : '#f8fafc',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          color: '#ffffff',
                          backgroundColor: emg.severity === 'CRITICAL' ? '#dc2626' : emg.severity === 'HIGH' ? '#ea580c' : '#d97706'
                        }}>
                          {emg.severity}
                        </span>
                        <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>{emg.emergencyType}</strong>
                      </div>

                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        {new Date(emg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#475569', marginBottom: '0.4rem' }}>
                      {emg.emergencyId} • {emg.hopCount} hop(s)
                    </div>

                    {emg.message && (
                      <div style={{ fontSize: '0.8rem', color: '#334155', fontStyle: 'italic', marginBottom: '0.6rem' }}>
                        "{emg.message}"
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.45rem',
                        borderRadius: '9999px',
                        backgroundColor: isAck ? '#dcfce7' : '#fee2e2',
                        color: isAck ? '#15803d' : '#b91c1c'
                      }}>
                        {emg.status}
                      </span>

                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        {!isAck && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              acknowledgeEmergency(emg.emergencyId, 'Dispatch Alpha');
                            }}
                            style={{
                              backgroundColor: '#10b981',
                              color: '#ffffff',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                          >
                            <Check size={12} />
                            <span>Acknowledge</span>
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalIncident(emg);
                          }}
                          style={{
                            backgroundColor: '#e2e8f0',
                            color: '#334155',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          <Eye size={12} />
                          <span>Dossier</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Incident Dossier Modal */}
      {modalIncident && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            maxWidth: '550px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              backgroundColor: modalIncident.severity === 'CRITICAL' ? '#dc2626' : '#1e293b',
              color: '#ffffff',
              padding: '1rem 1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Incident Dossier</h3>
                <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>{modalIncident.emergencyId}</span>
              </div>
              <button
                onClick={() => setModalIncident(null)}
                style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: 800 }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '1.25rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>TYPE</span>
                  <div style={{ fontWeight: 800 }}>{modalIncident.emergencyType}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>SEVERITY</span>
                  <div style={{ fontWeight: 800, color: modalIncident.severity === 'CRITICAL' ? '#dc2626' : '#ea580c' }}>
                    {modalIncident.severity}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>TIME OF INCIDENT</span>
                  <div>{new Date(modalIncident.timestamp).toLocaleString()}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>HOPS / TTL REMAINING</span>
                  <div>{modalIncident.hopCount} hops (TTL: {modalIncident.ttl})</div>
                </div>
              </div>

              <div style={{ marginBottom: '1rem', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>GPS COORDINATES</span>
                <div style={{ fontWeight: 700, fontFamily: 'monospace' }}>
                  {GeolocationService.formatCoordinates(modalIncident.latitude, modalIncident.longitude)}
                </div>
                {modalIncident.accuracy && (
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Accuracy radius: ±{modalIncident.accuracy}m</div>
                )}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>RELAY HOP PATH</span>
                <div style={{ backgroundColor: '#f1f5f9', padding: '0.5rem', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  {modalIncident.relayPath.join(' ➔ ')}
                </div>
              </div>

              {modalIncident.message && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>SURVIVOR MESSAGE</span>
                  <div style={{ fontStyle: 'italic', backgroundColor: '#fef2f2', padding: '0.6rem', borderRadius: '6px', border: '1px solid #fee2e2' }}>
                    "{modalIncident.message}"
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                {modalIncident.status !== 'ACKNOWLEDGED' && modalIncident.status !== 'RESOLVED' && (
                  <button
                    onClick={() => {
                      acknowledgeEmergency(modalIncident.emergencyId, 'Command Unit Alpha');
                      setModalIncident(null);
                    }}
                    style={{
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '0.85rem'
                    }}
                  >
                    Acknowledge SOS
                  </button>
                )}

                {modalIncident.status !== 'RESOLVED' && (
                  <button
                    onClick={() => {
                      resolveEmergency(modalIncident.emergencyId);
                      setModalIncident(null);
                    }}
                    style={{
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '0.85rem'
                    }}
                  >
                    Mark Resolved
                  </button>
                )}

                <button
                  onClick={() => setModalIncident(null)}
                  style={{
                    backgroundColor: '#e2e8f0',
                    color: '#334155',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    fontWeight: 600,
                    fontSize: '0.85rem'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
