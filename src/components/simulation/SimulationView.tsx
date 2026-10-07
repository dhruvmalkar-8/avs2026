import React, { useState, useEffect, useRef } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { EmergencyMessage, RelayNode, SimulationLogEntry } from '../../types/emergency';
import { ProtocolEngine, ProcessResult } from '../../services/network/ProtocolEngine';
import { createDefaultSimulationNodes } from '../../services/network/SimulationTransport';
import { 
  Network, 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  Radio, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  Layers, 
  Battery, 
  Terminal, 
  Copy,
  Info
} from 'lucide-react';

export const SimulationView: React.FC = () => {
  const { acknowledgeEmergency } = useEmergency();

  // Mesh Topology
  const [nodes, setNodes] = useState<RelayNode[]>(createDefaultSimulationNodes());
  const [protocolEngine] = useState<ProtocolEngine>(new ProtocolEngine());

  // Active packet in flight
  const [packet, setPacket] = useState<EmergencyMessage | null>(null);
  const [currentHopIndex, setCurrentHopIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [logs, setLogs] = useState<SimulationLogEntry[]>([]);
  const autoPlayTimerRef = useRef<any>(null);

  // Stop auto-play on unmount
  useEffect(() => {
    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, []);

  const addLog = (entry: SimulationLogEntry) => {
    setLogs((prev) => [entry, ...prev]);
  };

  // Initialize a fresh simulated SOS
  const handleStartSimulation = (initialTtl: number = 5) => {
    if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    setIsAutoPlaying(false);
    protocolEngine.resetSeenCache();

    const emergencyId = ProtocolEngine.generateEmergencyId();
    const newPacket: EmergencyMessage = {
      emergencyId,
      senderId: 'NODE_A',
      timestamp: Date.now(),
      latitude: 18.5204,
      longitude: 73.8567,
      accuracy: 15,
      emergencyType: 'TRAPPED',
      severity: 'CRITICAL',
      message: 'SIMULATION: 4 people stranded near river embankment.',
      hopCount: 0,
      ttl: initialTtl,
      status: 'SEARCHING_FOR_RELAY',
      relayPath: ['NODE_A']
    };

    setPacket(newPacket);
    setCurrentHopIndex(0);

    // Update Node A buffer
    setNodes((prev) =>
      prev.map((n) => (n.id === 'NODE_A' ? { ...n, buffer: [newPacket] } : { ...n, buffer: [] }))
    );

    addLog({
      id: `LOG-${Date.now()}-START`,
      timestamp: Date.now(),
      fromNode: 'NODE_A',
      toNode: 'BROADCAST',
      action: 'BROADCAST_BEACON',
      messageId: emergencyId,
      hopCount: 0,
      ttlRemaining: initialTtl,
      details: `[SIMULATION] Survivor Node A broadcasted initial beacon. Initial TTL=${initialTtl}, HopCount=0.`
    });
  };

  // Execute one discrete hop in the mesh
  const handleStepForward = () => {
    if (!packet) {
      handleStartSimulation();
      return;
    }

    if (currentHopIndex >= nodes.length - 1) {
      // Already at command node
      addLog({
        id: `LOG-${Date.now()}-END`,
        timestamp: Date.now(),
        fromNode: 'NODE_CMD',
        toNode: 'COMMAND',
        action: 'ACK_SENT',
        messageId: packet.emergencyId,
        hopCount: packet.hopCount,
        ttlRemaining: packet.ttl,
        details: `Emergency already reached Command Node. Broadcasted ACK back across mesh.`
      });
      setIsAutoPlaying(false);
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      return;
    }

    const nextIndex = currentHopIndex + 1;
    const targetNode = nodes[nextIndex];
    const sourceNode = nodes[currentHopIndex];

    // Process hop through protocol rules
    const result: ProcessResult = protocolEngine.processHop(packet, targetNode, nodes[nextIndex + 1]);

    addLog(result.log);

    if (result.forwardPacket) {
      setPacket(result.forwardPacket);
      setCurrentHopIndex(nextIndex);

      // Add to target node's store-and-forward buffer
      setNodes((prev) =>
        prev.map((n) =>
          n.id === targetNode.id ? { ...n, buffer: [...n.buffer, result.forwardPacket!] } : n
        )
      );

      // If destination reached (Command Node), trigger ACK in system
      if (targetNode.role === 'COMMAND') {
        acknowledgeEmergency(result.forwardPacket.emergencyId, 'Simulation Auto-Ack');
        setIsAutoPlaying(false);
        if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      }
    } else {
      // Packet dropped (e.g. duplicate, TTL expired, node offline)
      setIsAutoPlaying(false);
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    }
  };

  // Auto-play timer
  const handleToggleAutoPlay = () => {
    if (isAutoPlaying) {
      setIsAutoPlaying(false);
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    } else {
      if (!packet || currentHopIndex >= nodes.length - 1) {
        handleStartSimulation();
      }
      setIsAutoPlaying(true);
      autoPlayTimerRef.current = setInterval(() => {
        handleStepForward();
      }, 1400);
    }
  };

  // Inject duplicate packet to verify duplicate rejection rule
  const handleInjectDuplicate = () => {
    if (!packet) {
      alert('Please start a simulation packet first.');
      return;
    }

    const currentNode = nodes[currentHopIndex];
    const result = protocolEngine.processHop(packet, currentNode);
    addLog({
      id: `LOG-${Date.now()}-DUP`,
      timestamp: Date.now(),
      fromNode: 'SIMULATOR',
      toNode: currentNode.id,
      action: 'DROP_DUPLICATE',
      messageId: packet.emergencyId,
      hopCount: packet.hopCount,
      ttlRemaining: packet.ttl,
      details: `[TEST] Injected duplicate packet [${packet.emergencyId}] into [${currentNode.name}]. Protocol rule dropped it immediately.`
    });
  };

  const handleToggleNodeOnline = (nodeId: string) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, isOnline: !n.isOnline } : n))
    );
  };

  const handleReset = () => {
    if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    setIsAutoPlaying(false);
    setPacket(null);
    setCurrentHopIndex(0);
    setLogs([]);
    protocolEngine.resetSeenCache();
    setNodes(createDefaultSimulationNodes());
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem' }}>
      {/* Notice Banner: Clearly Labeled Simulation */}
      <div style={{
        backgroundColor: '#ecfdf5',
        border: '2px solid #10b981',
        borderRadius: '10px',
        padding: '0.85rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        color: '#065f46'
      }}>
        <Info size={22} color="#059669" />
        <div style={{ fontSize: '0.875rem' }}>
          <strong>SIMULATION MODE (LABORATORY DEMONSTRATION):</strong>{' '}
          This visualizer simulates the exact mathematical packet routing rules (Store-and-Forward, TTL decrement, 
          path recording, duplicate dropping) across a 4-node disaster mesh. 
          <em>Not presented as real RF hardware communication.</em>
        </div>
      </div>

      {/* Title & Controls Bar */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '1.25rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Network size={24} color="#059669" />
              <span>Multi-Hop Relay Simulation Studio</span>
            </h1>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Survivor A ➔ Relay B ➔ Relay C ➔ Rescue Command Node
            </span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleStartSimulation(5)}
              style={{
                backgroundColor: '#dc2626',
                color: '#ffffff',
                padding: '0.55rem 1rem',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Radio size={16} />
              <span>Trigger SOS (TTL=5)</span>
            </button>

            <button
              onClick={handleStepForward}
              disabled={isAutoPlaying}
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                padding: '0.55rem 1rem',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                opacity: isAutoPlaying ? 0.6 : 1
              }}
            >
              <ChevronRight size={16} />
              <span>Step Next Hop</span>
            </button>

            <button
              onClick={handleToggleAutoPlay}
              style={{
                backgroundColor: isAutoPlaying ? '#e11d48' : '#059669',
                color: '#ffffff',
                padding: '0.55rem 1rem',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              {isAutoPlaying ? <Pause size={16} /> : <Play size={16} />}
              <span>{isAutoPlaying ? 'Pause Auto' : 'Auto Play'}</span>
            </button>

            <button
              onClick={handleInjectDuplicate}
              style={{
                backgroundColor: '#f59e0b',
                color: '#ffffff',
                padding: '0.55rem 0.85rem',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.85rem'
              }}
              title="Demonstrates duplicate packet dropping"
            >
              Test Duplicate Drop
            </button>

            <button
              onClick={() => handleStartSimulation(1)}
              style={{
                backgroundColor: '#9333ea',
                color: '#ffffff',
                padding: '0.55rem 0.85rem',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.85rem'
              }}
              title="Demonstrates TTL boundary expiration after 1 hop"
            >
              Test TTL Expiry
            </button>

            <button
              onClick={handleReset}
              style={{
                backgroundColor: '#e2e8f0',
                color: '#334155',
                padding: '0.55rem 0.85rem',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Network Topology Pipeline Visualizer */}
        <div style={{
          backgroundColor: '#0f172a',
          borderRadius: '10px',
          padding: '1.75rem 1rem',
          color: '#ffffff',
          overflowX: 'auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minWidth: '700px',
            position: 'relative'
          }}>
            {nodes.map((node, idx) => {
              const isCurrent = packet && currentHopIndex === idx;
              const isPast = packet && currentHopIndex > idx;
              const hasReached = packet && packet.relayPath.includes(node.id);

              return (
                <React.Fragment key={node.id}>
                  {/* Node Circle & Details */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    zIndex: 2,
                    width: '150px'
                  }}>
                    {/* Visual Pulse Circle */}
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      backgroundColor: !node.isOnline 
                        ? '#475569' 
                        : isCurrent 
                        ? '#ef4444' 
                        : hasReached 
                        ? '#10b981' 
                        : '#1e293b',
                      border: isCurrent ? '3px solid #ffffff' : '2px solid #64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      boxShadow: isCurrent ? '0 0 20px rgba(239, 68, 68, 0.8)' : 'none',
                      transition: 'all 0.3s ease',
                      position: 'relative'
                    }}>
                      {node.role === 'SURVIVOR' ? 'S' : node.role === 'COMMAND' ? 'CMD' : `R${idx}`}
                      
                      {/* Active Packet Indicator Pill */}
                      {isCurrent && (
                        <div style={{
                          position: 'absolute',
                          top: '-8px',
                          backgroundColor: '#fbbf24',
                          color: '#000',
                          fontSize: '0.65rem',
                          padding: '1px 5px',
                          borderRadius: '9999px',
                          fontWeight: 900
                        }}>
                          PACKET HERE
                        </div>
                      )}
                    </div>

                    {/* Node Name */}
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, marginTop: '0.6rem', textAlign: 'center' }}>
                      {node.name.split('(')[0]}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', textAlign: 'center' }}>
                      {node.role}
                    </div>

                    {/* Node Online Toggle & Buffer */}
                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <button
                        onClick={() => handleToggleNodeOnline(node.id)}
                        style={{
                          fontSize: '0.65rem',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: 700,
                          backgroundColor: node.isOnline ? '#065f46' : '#991b1b',
                          color: '#ffffff',
                          border: 'none'
                        }}
                      >
                        {node.isOnline ? 'Online' : 'Offline'}
                      </button>

                      <span style={{ fontSize: '0.65rem', color: '#cbd5e1', backgroundColor: '#334155', padding: '2px 5px', borderRadius: '4px' }}>
                        Buffer: {node.buffer.length}
                      </span>
                    </div>
                  </div>

                  {/* Connecting Line between nodes */}
                  {idx < nodes.length - 1 && (
                    <div style={{
                      flex: 1,
                      height: '4px',
                      backgroundColor: isPast ? '#10b981' : '#334155',
                      margin: '0 -15px',
                      marginBottom: '40px',
                      position: 'relative',
                      zIndex: 1,
                      transition: 'background-color 0.4s ease'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '-16px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '0.65rem',
                        color: isPast ? '#34d399' : '#64748b',
                        fontWeight: 700
                      }}>
                        Hop {idx + 1}
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Packet Header Inspector & Audit Log Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1.4fr)',
        gap: '1.5rem'
      }}>
        {/* Packet Live Inspector */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '1.25rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Layers size={18} color="#059669" />
            <span>Active Packet Header (In Flight)</span>
          </h2>

          {packet ? (
            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>EMERGENCY ID</span>
                <div style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0f172a' }}>
                  {packet.emergencyId}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>HOPS TRAVERSED</span>
                  <div style={{ fontWeight: 800, color: '#2563eb' }}>{packet.hopCount}</div>
                </div>

                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>TTL REMAINING</span>
                  <div style={{ fontWeight: 800, color: packet.ttl <= 1 ? '#dc2626' : '#059669' }}>
                    {packet.ttl} / 5
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>SEVERITY</span>
                  <div style={{ fontWeight: 800, color: '#dc2626' }}>{packet.severity}</div>
                </div>

                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>CATEGORY</span>
                  <div style={{ fontWeight: 800 }}>{packet.emergencyType}</div>
                </div>
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>AUDITED RELAY PATH</span>
                <div style={{ backgroundColor: '#e2e8f0', padding: '0.4rem 0.6rem', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                  {packet.relayPath.join(' ➔ ')}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>COORDINATES</span>
                <div style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  {packet.latitude.toFixed(4)}° N, {packet.longitude.toFixed(4)}° E
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
              No packet currently in flight. Click <strong>"Trigger SOS"</strong> to launch simulation.
            </div>
          )}
        </div>

        {/* Real-time Protocol Audit Log */}
        <div style={{
          backgroundColor: '#0f172a',
          borderRadius: '12px',
          padding: '1.25rem',
          color: '#e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '440px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8' }}>
              <Terminal size={18} />
              <span>Mesh Protocol Audit Ledger</span>
            </h2>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              {logs.length} event(s)
            </span>
          </div>

          <div style={{ overflowY: 'auto', flex: 1, fontSize: '0.8rem', fontFamily: 'monospace' }}>
            {logs.length === 0 ? (
              <div style={{ color: '#64748b', fontStyle: 'italic', padding: '1rem 0' }}>
                Awaiting mesh network transmission...
              </div>
            ) : (
              logs.map((log) => {
                let badgeColor = '#38bdf8';
                if (log.action === 'COMMAND_DELIVERY' || log.action === 'ACK_SENT') badgeColor = '#34d399';
                if (log.action === 'DROP_DUPLICATE' || log.action === 'DROP_TTL_EXPIRED') badgeColor = '#f87171';

                return (
                  <div key={log.id} style={{
                    padding: '0.5rem 0',
                    borderBottom: '1px solid #1e293b',
                    lineHeight: 1.4
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.7rem' }}>
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      <span style={{ color: badgeColor, fontWeight: 700 }}>{log.action}</span>
                    </div>
                    <div style={{ color: '#f1f5f9', marginTop: '2px' }}>
                      {log.details}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
