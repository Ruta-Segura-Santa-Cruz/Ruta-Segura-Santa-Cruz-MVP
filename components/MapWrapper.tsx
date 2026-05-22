'use client';

import dynamic from 'next/dynamic';

interface MapProps {
  onMapClick: (latlng: { lat: number; lng: number }) => void;
  origin: { lat: number; lng: number } | null;
  destination: { lat: number; lng: number } | null;
  route: any;
  riskLevel: 'Bajo' | 'Medio' | 'Alto' | 'Muy Alto';
  isLoading: boolean;
}

const MapWrapper = dynamic<MapProps>(
  () => import('./Map').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#94a3b8', fontFamily: 'monospace' }}>
        <span>Cargando mapa...</span>
      </div>
    ),
  }
);

export default MapWrapper;