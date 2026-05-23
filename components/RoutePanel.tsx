'use client';

interface RoutePanelProps {
  origin: { lat: number; lng: number } | null;
  destination: { lat: number; lng: number } | null;
  onCalculate: () => void;
  isLoading: boolean;
  onClear: () => void;
}

export default function RoutePanel({ 
  origin, 
  destination, 
  onCalculate, 
  isLoading,
  onClear 
}: RoutePanelProps) {
  return (
    <div className="absolute top-4 left-4 z-[1000] w-80 bg-white rounded-xl shadow-lg p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        🚗 Ruta Segura SCZ
      </h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          📍 Origen
        </label>
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          {origin ? (
            <div>
              <p className="text-sm font-mono text-gray-600">
                Lat: {origin.lat.toFixed(6)}
              </p>
              <p className="text-sm font-mono text-gray-600">
                Lng: {origin.lng.toFixed(6)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Haz clic en el mapa</p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          🏁 Destino
        </label>
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          {destination ? (
            <div>
              <p className="text-sm font-mono text-gray-600">
                Lat: {destination.lat.toFixed(6)}
              </p>
              <p className="text-sm font-mono text-gray-600">
                Lng: {destination.lng.toFixed(6)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Haz clic en el mapa</p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onCalculate}
          disabled={!origin || !destination || isLoading}
          className={`
            flex-1 py-2.5 px-4 rounded-lg font-medium transition-all
            ${!origin || !destination || isLoading
              ? 'bg-gray-300 cursor-not-allowed text-gray-500'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
            }
          `}
        >
          {isLoading ? 'Calculando...' : 'Calcular Ruta'}
        </button>
        
        <button
          onClick={onClear}
          className="px-4 py-2.5 rounded-lg bg-gray-500 hover:bg-gray-600 text-white"
        >
          Limpiar
        </button>
      </div>
    </div>
  );
}