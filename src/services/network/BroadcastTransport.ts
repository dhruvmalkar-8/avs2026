import { EmergencyMessage } from '../../types/emergency';
import { AckPayload, ITransportLayer } from './types';

const CHANNEL_NAME = 'emergency-mesh-broadcast-v1';

export class BroadcastTransport implements ITransportLayer {
  public readonly name = 'Browser Cross-Tab Mesh (BroadcastChannel)';
  public readonly description = 'Real local inter-process broadcast across browser tabs and windows on the same device.';
  public readonly isSimulation = false;

  private channel: BroadcastChannel | null = null;
  private packetListeners: Set<(packet: EmergencyMessage) => void> = new Set();
  private ackListeners: Set<(ack: AckPayload) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
      this.channel.onmessage = (event) => {
        const data = event.data;
        if (!data || !data.type) return;

        if (data.type === 'PACKET' && data.payload) {
          this.packetListeners.forEach((fn) => fn(data.payload));
        } else if (data.type === 'ACK' && data.payload) {
          this.ackListeners.forEach((fn) => fn(data.payload));
        }
      };
    }
  }

  async sendPacket(packet: EmergencyMessage): Promise<boolean> {
    if (!this.channel) return false;
    try {
      this.channel.postMessage({ type: 'PACKET', payload: packet });
      return true;
    } catch (e) {
      console.error('Failed to broadcast packet:', e);
      return false;
    }
  }

  onReceivePacket(callback: (packet: EmergencyMessage) => void): () => void {
    this.packetListeners.add(callback);
    return () => this.packetListeners.delete(callback);
  }

  async sendAck(ack: AckPayload): Promise<void> {
    if (!this.channel) return;
    try {
      this.channel.postMessage({ type: 'ACK', payload: ack });
    } catch (e) {
      console.error('Failed to broadcast ACK:', e);
    }
  }

  onReceiveAck(callback: (ack: AckPayload) => void): () => void {
    this.ackListeners.add(callback);
    return () => this.ackListeners.delete(callback);
  }
}
