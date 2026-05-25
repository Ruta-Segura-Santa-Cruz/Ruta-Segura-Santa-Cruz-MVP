'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import RoutePanel from '@/components/RoutePanel';
import RiskIndicator from '@/components/RiskIndicator';
import FuelEstimator from '@/components/FuelEstimator';
import { analyzeRisk } from '@/lib/risk-analyzer';
import { calculateFuelConsumption } from '@/lib/fuel-calculator';
import { loadPotholes } from '@/lib/potholes-data';
import type { RiskAnalysis, FuelEstimate, Pothole, RouteGeoJSON } from '@/lib/types';

const MapWrapper = dynamic(
  () => import('@/components/MapWrapper').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center w-full h-full bg-slate-900 text-slate-400 font-mono">
        Cargando mapa...
      </div>
    ),
  }
);

export default function Home() {
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [destination, setDestination] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [route, setRoute] = useState<RouteGeoJSON | null>(null);
  const [riskLevel, setRiskLevel] = useState<
    'Bajo' | 'Medio' | 'Alto' | 'Muy Alto'
  >('Bajo');
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysis | null>(null);
  const [fuelEstimate, setFuelEstimate] = useState<FuelEstimate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMapClick = useCallback(
    (latlng: { lat: number; lng: number }) => {
      setError(null);
      if (!origin) {
        setOrigin(latlng);
        setDestination(null);
        setRoute(null);
        setRiskAnalysis(null);
        setFuelEstimate(null);
      } else if (!destination) {
        setDestination(latlng);
        setRoute(null);
        setRiskAnalysis(null);
        setFuelEstimate(null);
      } else {
        setOrigin(latlng);
        setDestination(null);
        setRoute(null);
        setRiskAnalysis(null);
        setFuelEstimate(null);
        setRiskLevel('Bajo');
      }
    },
    [origin, destination]
  );

  const handleCalculateRoute = useCallback(async () => {
    if (!origin || !destination) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start: { lat: origin.lat, lng: origin.lng },
          end: { lat: destination.lat, lng: destination.lng },
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Error al calcular la ruta');
      }

      const data = await res.json();
      const routeGeoJSON = data.route;

      setRoute(routeGeoJSON);

      const potholes: Pothole[] = await loadPotholes();
      const analysis = analyzeRisk(routeGeoJSON, potholes);
      setRiskAnalysis(analysis);
      setRiskLevel(analysis.riskLevel);

      const fuel = calculateFuelConsumption(routeGeoJSON, analysis);
      setFuelEstimate(fuel);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [origin, destination]);

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between shadow-md">
        <h1 className="text-lg md:text-xl font-bold">
          Ruta Segura Santa Cruz
        </h1>
        <button
          className="md:hidden p-2 rounded hover:bg-blue-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Abrir panel"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {sidebarOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 fixed md:relative z-30 md:z-auto w-80 bg-gray-100 p-4 overflow-y-auto h-full md:h-auto transition-transform duration-300 ease-in-out`}
        >
          <RoutePanel
            origin={origin}
            destination={destination}
            onCalculate={handleCalculateRoute}
            isLoading={isLoading}
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <RiskIndicator riskAnalysis={riskAnalysis} />
          <FuelEstimator fuelEstimate={fuelEstimate} />
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 relative">
          <MapWrapper
            onMapClick={handleMapClick}
            origin={origin}
            destination={destination}
            route={route}
            riskLevel={riskLevel}
            isLoading={isLoading}
          />
        </main>
      </div>
    </div>
  );
}
