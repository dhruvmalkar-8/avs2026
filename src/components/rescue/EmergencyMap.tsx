import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { EmergencyMessage } from '../../types/emergency';
import { GeolocationService } from '../../services/location/geolocation';

interface EmergencyMapProps {
  emergencies: EmergencyMessage[];
  selectedEmergencyId?: string | null;
  onSelectEmergency?: (id: string) => void;
  onAcknowledge?: (id: string) => void;
}

export const EmergencyMap: React.FC<EmergencyMapProps> = ({
  emergencies,
  selectedEmergencyId,
  onSelectEmergency,
  onAcknowledge
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default center (Pune/Mumbai disaster region)
      const defaultCenter: [number, number] = [18.5204, 73.8567];
      const map = L.map(mapContainerRef.current).setView(defaultCenter, 13);

      // Tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear old markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    if (emergencies.length === 0) return;

    const bounds: [number, number][] = [];

    emergencies.forEach((emg) => {
      const isCritical = emg.severity === 'CRITICAL';
      const isAck = emg.status === 'ACKNOWLEDGED' || emg.status === 'RESOLVED';
      const isSelected = emg.emergencyId === selectedEmergencyId;

      let pinColor = '#dc2626'; // Red for critical
      if (isAck) pinColor = '#10b981'; // Green for ack
      else if (emg.severity === 'HIGH') pinColor = '#ea580c';
      else if (emg.severity === 'MEDIUM') pinColor = '#d97706';
      else if (emg.severity === 'LOW') pinColor = '#2563eb';

      // Custom pulsing marker icon
      const customIcon = L.divIcon({
        className: 'custom-emergency-marker',
        html: `
          <div style="
            position: relative;
            width: ${isSelected ? '32px' : '26px'};
            height: ${isSelected ? '32px' : '26px'};
            background-color: ${pinColor};
            border: 2px solid #ffffff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-weight: 800;
            font-size: 11px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
            ${isCritical && !isAck ? 'animation: flash-critical 1.5s infinite;' : ''}
          ">
            ${isCritical ? '!' : emg.hopCount}
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      const marker = L.marker([emg.latitude, emg.longitude], { icon: customIcon }).addTo(map);

      const popupContent = document.createElement('div');
      popupContent.style.fontFamily = 'system-ui, sans-serif';
      popupContent.style.minWidth = '220px';
      popupContent.innerHTML = `
        <div style="font-weight: 800; color: ${pinColor}; font-size: 14px; margin-bottom: 4px;">
          ${emg.emergencyType} (${emg.severity})
        </div>
        <div style="font-size: 11px; font-family: monospace; color: #64748b; margin-bottom: 6px;">
          ${emg.emergencyId}
        </div>
        <div style="font-size: 12px; margin-bottom: 6px;">
          <strong>Location:</strong> ${GeolocationService.formatCoordinates(emg.latitude, emg.longitude)}
        </div>
        <div style="font-size: 12px; margin-bottom: 6px;">
          <strong>Hops:</strong> ${emg.hopCount} | <strong>Status:</strong> ${emg.status}
        </div>
        ${emg.message ? `<div style="font-size: 12px; font-style: italic; background: #f1f5f9; padding: 4px 6px; border-radius: 4px; margin-bottom: 8px;">"${emg.message}"</div>` : ''}
        <div style="display: flex; gap: 6px; margin-top: 8px;">
          ${!isAck && onAcknowledge ? `<button id="btn-ack-${emg.emergencyId}" style="background: #10b981; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-weight: 700; font-size: 11px; cursor: pointer;">Acknowledge SOS</button>` : ''}
        </div>
      `;

      // Attach button listener after popup opens
      marker.bindPopup(popupContent);
      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-ack-${emg.emergencyId}`);
        if (btn && onAcknowledge) {
          btn.onclick = () => onAcknowledge(emg.emergencyId);
        }
        if (onSelectEmergency) {
          onSelectEmergency(emg.emergencyId);
        }
      });

      markersRef.current[emg.emergencyId] = marker;
      bounds.push([emg.latitude, emg.longitude]);
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }

    return () => {
      // cleanup on component unmount
    };
  }, [emergencies, selectedEmergencyId, onAcknowledge, onSelectEmergency]);

  // Center on selected emergency if changed
  useEffect(() => {
    if (selectedEmergencyId && mapInstanceRef.current && markersRef.current[selectedEmergencyId]) {
      const marker = markersRef.current[selectedEmergencyId];
      mapInstanceRef.current.setView(marker.getLatLng(), 15, { animate: true });
      marker.openPopup();
    }
  }, [selectedEmergencyId]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '420px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        zIndex: 500,
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        padding: '0.4rem 0.75rem',
        borderRadius: '6px',
        fontSize: '0.75rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#dc2626', display: 'inline-block' }} />
          <span>Critical</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ea580c', display: 'inline-block' }} />
          <span>High</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
          <span>Acknowledged</span>
        </div>
      </div>
    </div>
  );
};
