import React from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { Trash2, AlertCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  const { clearAllData, emergencies } = useEmergency();

  const handleClear = async () => {
    if (window.confirm('Clear all local IndexedDB emergency alerts and cache?')) {
      await clearAllData();
    }
  };

  return (
    <footer style={{
      backgroundColor: '#0f172a',
      color: '#94a3b8',
      borderTop: '1px solid #334155',
      padding: '1.25rem 1.5rem',
      fontSize: '0.8rem',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} color="#f59e0b" />
          <span>
            <strong>Educational Demonstration Project</strong>: Temporary neutral designation ("Disaster Emergency Network"). 
            Features Store-and-Forward delay-tolerant routing and local IndexedDB offline storage.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>Local records: <strong>{emergencies.length}</strong></span>
          <button
            onClick={handleClear}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              padding: '0.3rem 0.6rem',
              borderRadius: '4px',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              fontSize: '0.75rem'
            }}
            title="Wipe IndexedDB alerts and local session"
          >
            <Trash2 size={13} />
            <span>Reset Local DB</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
