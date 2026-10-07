export interface GeoResult {
  latitude: number;
  longitude: number;
  accuracy?: number;
  source: 'GPS_HARDWARE' | 'SIMULATED_FALLBACK';
  error?: string;
}

export const GeolocationService = {
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'geolocation' in navigator;
  },

  async getCurrentLocation(): Promise<GeoResult> {
    if (!this.isSupported()) {
      return {
        latitude: 19.076,
        longitude: 72.8777,
        accuracy: 50,
        source: 'SIMULATED_FALLBACK',
        error: 'Browser Geolocation API not supported'
      };
    }

    return new Promise((resolve) => {
      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      };

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: Number(pos.coords.latitude.toFixed(6)),
            longitude: Number(pos.coords.longitude.toFixed(6)),
            accuracy: Math.round(pos.coords.accuracy),
            source: 'GPS_HARDWARE'
          });
        },
        (err) => {
          // Provide realistic fallback (e.g. Mumbai / Disaster center coordinates) with notice
          console.warn('Geolocation failed or denied, using simulated coordinates:', err.message);
          resolve({
            latitude: 18.5204,
            longitude: 73.8567,
            accuracy: 35,
            source: 'SIMULATED_FALLBACK',
            error: `Browser GPS unavailable (${err.message}). Using preset coordinates.`
          });
        },
        options
      );
    });
  },

  formatCoordinates(lat: number, lng: number): string {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lngDir = lng >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
  }
};
