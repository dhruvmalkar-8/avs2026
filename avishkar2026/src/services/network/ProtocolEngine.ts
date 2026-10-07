import { EmergencyMessage, RelayNode, SimulationLogEntry } from '../../types/emergency';

export interface ProcessResult {
  forwardPacket: EmergencyMessage | null;
  status: 'ACCEPTED' | 'DUPLICATE_DROPPED' | 'TTL_EXPIRED' | 'LOOP_DETECTED' | 'NODE_OFFLINE' | 'DELIVERED_TO_COMMAND';
  log: SimulationLogEntry;
}

export class ProtocolEngine {
  private seenPacketIds: Set<string> = new Set();

  /**
   * Generates a collision-resistant unique Emergency ID
   * e.g., "EMG-1728031200000-A9F2"
   */
  public static generateEmergencyId(): string {
    const timestamp = Date.now();
    const randomHex = Math.floor(Math.random() * 0xffff)
      .toString(16)
      .toUpperCase()
      .padStart(4, '0');
    return `EMG-${timestamp}-${randomHex}`;
  }

  /**
   * Process incoming packet at a specific node adhering to mesh network rules
   */
  public processHop(
    incomingPacket: EmergencyMessage,
    currentNode: RelayNode,
    targetNode?: RelayNode
  ): ProcessResult {
    const now = Date.now();

    // 1. Node online check
    if (!currentNode.isOnline) {
      return {
        forwardPacket: null,
        status: 'NODE_OFFLINE',
        log: {
          id: `LOG-${now}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: now,
          fromNode: currentNode.id,
          toNode: targetNode?.id || 'UNKNOWN',
          action: 'DROP_DUPLICATE',
          messageId: incomingPacket.emergencyId,
          hopCount: incomingPacket.hopCount,
          ttlRemaining: incomingPacket.ttl,
          details: `Node [${currentNode.name}] is OFFLINE. Cannot relay packet.`
        }
      };
    }

    // 2. Loop detection via path inspection
    if (incomingPacket.relayPath.includes(currentNode.id)) {
      return {
        forwardPacket: null,
        status: 'LOOP_DETECTED',
        log: {
          id: `LOG-${now}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: now,
          fromNode: incomingPacket.relayPath[incomingPacket.relayPath.length - 1] || 'PREV',
          toNode: currentNode.id,
          action: 'DROP_DUPLICATE',
          messageId: incomingPacket.emergencyId,
          hopCount: incomingPacket.hopCount,
          ttlRemaining: incomingPacket.ttl,
          details: `Routing loop detected! Node [${currentNode.name}] was already in relay path. Packet dropped.`
        }
      };
    }

    // 3. Duplicate packet check (Bloom/Set lookup)
    const packetKey = `${currentNode.id}:${incomingPacket.emergencyId}`;
    if (this.seenPacketIds.has(packetKey)) {
      return {
        forwardPacket: null,
        status: 'DUPLICATE_DROPPED',
        log: {
          id: `LOG-${now}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: now,
          fromNode: incomingPacket.relayPath[incomingPacket.relayPath.length - 1] || 'PREV',
          toNode: currentNode.id,
          action: 'DROP_DUPLICATE',
          messageId: incomingPacket.emergencyId,
          hopCount: incomingPacket.hopCount,
          ttlRemaining: incomingPacket.ttl,
          details: `Duplicate packet detected at [${currentNode.name}]. Already processed. Dropping to prevent flood.`
        }
      };
    }

    // Mark as seen at this node
    this.seenPacketIds.add(packetKey);

    // 4. Check if current node is Command (Destination reached)
    if (currentNode.role === 'COMMAND') {
      const delivered: EmergencyMessage = {
        ...incomingPacket,
        status: 'RECEIVED_BY_COMMAND',
        relayPath: [...incomingPacket.relayPath, currentNode.id]
      };

      return {
        forwardPacket: delivered,
        status: 'DELIVERED_TO_COMMAND',
        log: {
          id: `LOG-${now}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: now,
          fromNode: incomingPacket.relayPath[incomingPacket.relayPath.length - 1] || 'PREV',
          toNode: currentNode.id,
          action: 'COMMAND_DELIVERY',
          messageId: incomingPacket.emergencyId,
          hopCount: incomingPacket.hopCount,
          ttlRemaining: incomingPacket.ttl,
          details: `Destination reached! Alert [${incomingPacket.emergencyId}] successfully received at Command Operations Center after ${incomingPacket.hopCount} hop(s).`
        }
      };
    }

    // 5. TTL Validation
    if (incomingPacket.ttl <= 1) {
      return {
        forwardPacket: null,
        status: 'TTL_EXPIRED',
        log: {
          id: `LOG-${now}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: now,
          fromNode: currentNode.id,
          toNode: targetNode?.id || 'NEXT',
          action: 'DROP_TTL_EXPIRED',
          messageId: incomingPacket.emergencyId,
          hopCount: incomingPacket.hopCount + 1,
          ttlRemaining: 0,
          details: `Time-To-Live (TTL) expired at [${currentNode.name}]. Remaining TTL reached 0. Dropped to preserve mesh capacity.`
        }
      };
    }

    // 6. Forward packet: Decrement TTL, increment hopCount, record path
    const forwardedPacket: EmergencyMessage = {
      ...incomingPacket,
      hopCount: incomingPacket.hopCount + 1,
      ttl: incomingPacket.ttl - 1,
      status: 'RELAYED',
      relayPath: [...incomingPacket.relayPath, currentNode.id]
    };

    return {
      forwardPacket: forwardedPacket,
      status: 'ACCEPTED',
      log: {
        id: `LOG-${now}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: now,
        fromNode: currentNode.id,
        toNode: targetNode?.id || 'NEXT_RELAY',
        action: 'HOP_FORWARD',
        messageId: forwardedPacket.emergencyId,
        hopCount: forwardedPacket.hopCount,
        ttlRemaining: forwardedPacket.ttl,
        details: `Packet forwarded by [${currentNode.name}] → Hop ${forwardedPacket.hopCount}, remaining TTL ${forwardedPacket.ttl}.`
      }
    };
  }

  public resetSeenCache(): void {
    this.seenPacketIds.clear();
  }
}
