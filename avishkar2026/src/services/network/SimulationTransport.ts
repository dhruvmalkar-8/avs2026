import { EmergencyMessage, RelayNode, SimulationLogEntry } from '../../types/emergency';
import { AckPayload, ITransportLayer } from './types';

export interface SimulationState {
  nodes: RelayNode[];
  activePacket: EmergencyMessage | null;
  currentStepIndex: number;
  isRunning: boolean;
  logs: SimulationLogEntry[];
  speedMs: number;
}

export class SimulationTransport implements ITransportLayer {
  public readonly name = 'Educational Mesh Simulation';
  public readonly description = 'Multi-hop visual simulation engine with hop progression, store-and-forward buffers, and duplicate/TTL enforcement.';
  public readonly isSimulation = true;

  private packetListeners: Set<(packet: EmergencyMessage) => void> = new Set();
  private ackListeners: Set<(ack: AckPayload) => void> = new Set();

  async sendPacket(packet: EmergencyMessage): Promise<boolean> {
    // Notify listeners (e.g. simulation UI or rescue dashboard)
    this.packetListeners.forEach((fn) => fn(packet));
    return true;
  }

  onReceivePacket(callback: (packet: EmergencyMessage) => void): () => void {
    this.packetListeners.add(callback);
    return () => this.packetListeners.delete(callback);
  }

  async sendAck(ack: AckPayload): Promise<void> {
    this.ackListeners.forEach((fn) => fn(ack));
  }

  onReceiveAck(callback: (ack: AckPayload) => void): () => void {
    this.ackListeners.add(callback);
    return () => this.ackListeners.delete(callback);
  }
}

export function createDefaultSimulationNodes(): RelayNode[] {
  return [
    {
      id: 'NODE_A',
      name: 'Survivor A (Stranded Citizen)',
      role: 'SURVIVOR',
      isOnline: true,
      latitude: 18.5204,
      longitude: 73.8567,
      batteryLevel: 68,
      rangeMeters: 80,
      buffer: []
    },
    {
      id: 'NODE_B',
      name: 'Relay B (Community Volunteer)',
      role: 'RELAY',
      isOnline: true,
      latitude: 18.5245,
      longitude: 73.8612,
      batteryLevel: 85,
      rangeMeters: 120,
      buffer: []
    },
    {
      id: 'NODE_C',
      name: 'Relay C (Field Search Team)',
      role: 'RELAY',
      isOnline: true,
      latitude: 18.5290,
      longitude: 73.8665,
      batteryLevel: 92,
      rangeMeters: 150,
      buffer: []
    },
    {
      id: 'NODE_CMD',
      name: 'Command Node (Disaster Operations Center)',
      role: 'COMMAND',
      isOnline: true,
      latitude: 18.5355,
      longitude: 73.8735,
      batteryLevel: 100,
      rangeMeters: 500,
      buffer: []
    }
  ];
}
