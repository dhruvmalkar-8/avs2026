export type EmergencyType =
  | 'TRAPPED'
  | 'MEDICAL_EMERGENCY'
  | 'FIRE'
  | 'FLOOD'
  | 'INJURY'
  | 'OTHER';

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type EmergencyStatus =
  | 'CREATED'
  | 'SEARCHING_FOR_RELAY'
  | 'RELAYED'
  | 'RECEIVED_BY_COMMAND'
  | 'ACKNOWLEDGED'
  | 'RESOLVED';

export interface EmergencyMessage {
  emergencyId: string;       // Unique ID, e.g. "EMG-1728031200000-A9F2"
  senderId: string;          // Originator device identifier
  timestamp: number;         // Epoch timestamp (ms)
  latitude: number;          // Latitude decimal
  longitude: number;         // Longitude decimal
  accuracy?: number;         // In meters from browser GPS
  emergencyType: EmergencyType;
  severity: SeverityLevel;
  message: string;           // Optional survivor note
  hopCount: number;          // Hops traversed (starts at 0)
  ttl: number;               // Remaining Time-To-Live (decrements per hop)
  status: EmergencyStatus;   // Current lifecycle status
  relayPath: string[];       // Path of node IDs traversed
  acknowledgedAt?: number;   // Timestamp when command acknowledged
  acknowledgedBy?: string;   // Identifier of operator or node
  resolvedAt?: number;       // Timestamp when incident marked resolved
}

export interface RelayNode {
  id: string;
  name: string;
  role: 'SURVIVOR' | 'RELAY' | 'COMMAND';
  isOnline: boolean;
  latitude: number;
  longitude: number;
  batteryLevel?: number;
  rangeMeters: number;
  buffer: EmergencyMessage[];
}

export type SimulationActionType =
  | 'BROADCAST_BEACON'
  | 'HOP_FORWARD'
  | 'RECEIVED_AT_RELAY'
  | 'COMMAND_DELIVERY'
  | 'DROP_DUPLICATE'
  | 'DROP_TTL_EXPIRED'
  | 'ACK_SENT';

export interface SimulationLogEntry {
  id: string;
  timestamp: number;
  fromNode: string;
  toNode: string;
  action: SimulationActionType;
  messageId: string;
  hopCount: number;
  ttlRemaining: number;
  details: string;
}
