import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { EmergencyMessage, EmergencyType, SeverityLevel, EmergencyStatus } from '../types/emergency';
import { StorageService } from '../services/storage/indexedDB';
import { BroadcastTransport } from '../services/network/BroadcastTransport';
import { ProtocolEngine } from '../services/network/ProtocolEngine';

export type ViewMode = 'LANDING' | 'SURVIVOR' | 'RESCUE' | 'SIMULATION' | 'LIMITATIONS';

interface SubmitSOSParams {
  emergencyType: EmergencyType;
  severity: SeverityLevel;
  message: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
}

interface EmergencyContextType {
  emergencies: EmergencyMessage[];
  activeSurvivorSos: EmergencyMessage | null;
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;
  isOnline: boolean;
  submitSOS: (params: SubmitSOSParams) => Promise<EmergencyMessage>;
  acknowledgeEmergency: (emergencyId: string, operatorName?: string) => Promise<void>;
  resolveEmergency: (emergencyId: string) => Promise<void>;
  deleteEmergency: (emergencyId: string) => Promise<void>;
  clearAllData: () => Promise<void>;
  refreshEmergencies: () => Promise<void>;
  broadcastTransport: BroadcastTransport;
}

const EmergencyContext = createContext<EmergencyContextType | undefined>(undefined);

const broadcast = new BroadcastTransport();

// Device fingerprint generator for demo
function getOrSetDeviceId(): string {
  if (typeof window === 'undefined') return 'DEVICE_ANON';
  let id = localStorage.getItem('emergency_node_id');
  if (!id) {
    id = `NODE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    localStorage.setItem('emergency_node_id', id);
  }
  return id;
}

export const EmergencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [emergencies, setEmergencies] = useState<EmergencyMessage[]>([]);
  const [activeSurvivorSos, setActiveSurvivorSos] = useState<EmergencyMessage | null>(null);
  const [currentView, setCurrentView] = useState<ViewMode>('LANDING');
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // Load from IndexedDB
  const refreshEmergencies = useCallback(async () => {
    try {
      const list = await StorageService.getAllEmergencies();
      setEmergencies(list);

      // Check if we have an active SOS in this browser session
      const savedActiveId = localStorage.getItem('active_sos_id');
      if (savedActiveId) {
        const found = list.find((m) => m.emergencyId === savedActiveId);
        if (found) {
          setActiveSurvivorSos(found);
        }
      }
    } catch (err) {
      console.error('Failed to load emergencies from IndexedDB:', err);
    }
  }, []);

  useEffect(() => {
    refreshEmergencies();

    // Listen for online/offline browser state
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for incoming packets via cross-tab BroadcastChannel
    const unsubscribePacket = broadcast.onReceivePacket(async (incoming) => {
      console.log('Received mesh packet via BroadcastChannel:', incoming.emergencyId);
      await StorageService.saveEmergency(incoming);
      await refreshEmergencies();
    });

    // Listen for incoming ACKs via BroadcastChannel
    const unsubscribeAck = broadcast.onReceiveAck(async (ack) => {
      console.log('Received ACK via BroadcastChannel for:', ack.emergencyId);
      await StorageService.updateEmergencyStatus(ack.emergencyId, 'ACKNOWLEDGED', {
        acknowledgedAt: ack.acknowledgedAt,
        acknowledgedBy: ack.acknowledgedBy
      });
      await refreshEmergencies();
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribePacket();
      unsubscribeAck();
    };
  }, [refreshEmergencies]);

  const submitSOS = async (params: SubmitSOSParams): Promise<EmergencyMessage> => {
    const deviceId = getOrSetDeviceId();
    const emergencyId = ProtocolEngine.generateEmergencyId();
    const now = Date.now();

    const newSos: EmergencyMessage = {
      emergencyId,
      senderId: deviceId,
      timestamp: now,
      latitude: params.latitude,
      longitude: params.longitude,
      accuracy: params.accuracy,
      emergencyType: params.emergencyType,
      severity: params.severity,
      message: params.message.trim(),
      hopCount: 0,
      ttl: 5,
      status: 'SEARCHING_FOR_RELAY',
      relayPath: [deviceId]
    };

    // 1. Save to local IndexedDB
    await StorageService.saveEmergency(newSos);

    // 2. Broadcast to cross-tab mesh
    await broadcast.sendPacket(newSos);

    // 3. Update local state
    localStorage.setItem('active_sos_id', emergencyId);
    setActiveSurvivorSos(newSos);
    await refreshEmergencies();

    return newSos;
  };

  const acknowledgeEmergency = async (emergencyId: string, operatorName: string = 'Command Unit 1') => {
    const now = Date.now();
    await StorageService.updateEmergencyStatus(emergencyId, 'ACKNOWLEDGED', {
      acknowledgedAt: now,
      acknowledgedBy: operatorName
    });

    // Broadcast ACK across the channel
    await broadcast.sendAck({
      emergencyId,
      acknowledgedAt: now,
      acknowledgedBy: operatorName
    });

    await refreshEmergencies();
  };

  const resolveEmergency = async (emergencyId: string) => {
    const now = Date.now();
    await StorageService.updateEmergencyStatus(emergencyId, 'RESOLVED', {
      resolvedAt: now
    });
    await refreshEmergencies();
  };

  const deleteEmergency = async (emergencyId: string) => {
    // Clear from active if it matches
    if (activeSurvivorSos?.emergencyId === emergencyId) {
      localStorage.removeItem('active_sos_id');
      setActiveSurvivorSos(null);
    }
    // Delete from IndexedDB by updating list
    const current = await StorageService.getEmergencyById(emergencyId);
    if (current) {
      // IndexedDB delete
      const db = await (window as any).indexedDB.open('DisasterEmergencyNetworkDB', 1);
      db.onsuccess = () => {
        const tx = db.result.transaction(['emergencies'], 'readwrite');
        tx.objectStore('emergencies').delete(emergencyId);
        tx.oncomplete = () => refreshEmergencies();
      };
    }
  };

  const clearAllData = async () => {
    await StorageService.clearAll();
    localStorage.removeItem('active_sos_id');
    setActiveSurvivorSos(null);
    setEmergencies([]);
  };

  return (
    <EmergencyContext.Provider
      value={{
        emergencies,
        activeSurvivorSos,
        currentView,
        setCurrentView,
        isOnline,
        submitSOS,
        acknowledgeEmergency,
        resolveEmergency,
        deleteEmergency,
        clearAllData,
        refreshEmergencies,
        broadcastTransport: broadcast
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergency = () => {
  const context = useContext(EmergencyContext);
  if (!context) {
    throw new Error('useEmergency must be used within an EmergencyProvider');
  }
  return context;
};
