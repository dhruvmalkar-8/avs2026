import { EmergencyMessage, EmergencyStatus } from '../../types/emergency';

const DB_NAME = 'DisasterEmergencyNetworkDB';
const DB_VERSION = 1;
const STORE_EMERGENCIES = 'emergencies';
const STORE_SEEN_PACKETS = 'seen_packets';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported on this browser'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_EMERGENCIES)) {
        const store = db.createObjectStore(STORE_EMERGENCIES, { keyPath: 'emergencyId' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('severity', 'severity', { unique: false });
        store.createIndex('status', 'status', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_SEEN_PACKETS)) {
        db.createObjectStore(STORE_SEEN_PACKETS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const StorageService = {
  async saveEmergency(msg: EmergencyMessage): Promise<void> {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_EMERGENCIES], 'readwrite');
      const store = tx.objectStore(STORE_EMERGENCIES);
      const req = store.put(msg);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async getAllEmergencies(): Promise<EmergencyMessage[]> {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_EMERGENCIES], 'readonly');
      const store = tx.objectStore(STORE_EMERGENCIES);
      const req = store.getAll();
      req.onsuccess = () => {
        const list = req.result as EmergencyMessage[];
        // Sort newest first
        list.sort((a, b) => b.timestamp - a.timestamp);
        resolve(list);
      };
      req.onerror = () => reject(req.error);
    });
  },

  async getEmergencyById(emergencyId: string): Promise<EmergencyMessage | null> {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_EMERGENCIES], 'readonly');
      const store = tx.objectStore(STORE_EMERGENCIES);
      const req = store.get(emergencyId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  },

  async updateEmergencyStatus(
    emergencyId: string,
    status: EmergencyStatus,
    extraFields?: Partial<EmergencyMessage>
  ): Promise<void> {
    const current = await this.getEmergencyById(emergencyId);
    if (!current) return;
    const updated: EmergencyMessage = {
      ...current,
      ...extraFields,
      status
    };
    await this.saveEmergency(updated);
  },

  async hasSeenPacket(packetId: string): Promise<boolean> {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_SEEN_PACKETS], 'readonly');
      const store = tx.objectStore(STORE_SEEN_PACKETS);
      const req = store.get(packetId);
      req.onsuccess = () => resolve(!!req.result);
      req.onerror = () => reject(req.error);
    });
  },

  async markPacketSeen(packetId: string): Promise<void> {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_SEEN_PACKETS], 'readwrite');
      const store = tx.objectStore(STORE_SEEN_PACKETS);
      const req = store.put({ id: packetId, seenAt: Date.now() });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async clearAll(): Promise<void> {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_EMERGENCIES, STORE_SEEN_PACKETS], 'readwrite');
      tx.objectStore(STORE_EMERGENCIES).clear();
      tx.objectStore(STORE_SEEN_PACKETS).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
};
