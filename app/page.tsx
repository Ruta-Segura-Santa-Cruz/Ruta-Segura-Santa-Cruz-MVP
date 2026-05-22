'use client';

import { useState } from 'react';
import MapWrapper from '@/components/MapWrapper';

export default function Home() {
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null);
  const [destination, setDestination] = useState<{ lat: number; lng: number } | null>(null);

  const handleMapClick = (latlng: { lat: number; lng: number }) => {
    if (!origin) {
      setOrigin(latlng);
    } else if (!destination) {
      setDestination(latlng);
    } else {
      setOrigin(latlng);
      setDestination(null);
    }
  };

  return (
    <main style={{ width: '100vw', height: '100vh' }}>
      <MapWrapper
        onMapClick={handleMapClick}
        origin={origin}
        destination={destination}
        route={null}
        riskLevel="Bajo"
        isLoading={false}
      />
    </main>
  );
}
