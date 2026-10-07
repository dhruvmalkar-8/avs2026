import { EmergencyMessage } from '../../types/emergency';

export interface AckPayload {
  emergencyId: string;
  acknowledgedAt: number;
  acknowledgedBy: string;
}

export interface ITransportLayer {
  readonly name: string;
  readonly description: string;
  readonly isSimulation: boolean;

  /**
   * Broadcast or forward an emergency packet to available nodes
   */
  sendPacket(packet: EmergencyMessage): Promise<boolean>;

  /**
   * Register a listener for incoming emergency packets
   */
  onReceivePacket(callback: (packet: EmergencyMessage) => void): () => void;

  /**
   * Send acknowledgment back across the relay path
   */
  sendAck(ack: AckPayload): Promise<void>;

  /**
   * Register listener for incoming ACKs
   */
  onReceiveAck(callback: (ack: AckPayload) => void): () => void;
}
