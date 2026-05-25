'use client';

interface RoutePanelProps {
  origin: { lat: number; lng: number } | null;
  destination: { lat: number; lng: number } | null;
  onCalculate: () => void;
  isLoading: boolean;
}

export default function RoutePanel({
  origin,
  destination,
  onCalculate,
  isLoading,
}: RoutePanelProps) {
  const canCalculate = !!origin && !!destination && !isLoading;

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <h2 className="text-lg font-bold text-gray-800 mb-3">
        Planificar Ruta
      </h2>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Origen
          </label>
          <div className="bg-gray-50 rounded p-2 text-sm text-gray-700 min-h-[36px]">
            {origin ? (
              <span className="font-mono">
                {origin.lat.toFixed(5)}, {origin.lng.toFixed(5)}
              </span>
            ) : (
              <span className="text-gray-400">
                Haz clic en el mapa para seleccionar
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Destino
          </label>
          <div className="bg-gray-50 rounded p-2 text-sm text-gray-700 min-h-[36px]">
            {destination ? (
              <span className="font-mono">
                {destination.lat.toFixed(5)}, {destination.lng.toFixed(5)}
              </span>
            ) : (
              <span className="text-gray-400">
                {origin
                  ? 'Haz clic en el mapa para seleccionar'
                  : 'Selecciona primero el origen'}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={onCalculate}
          disabled={!canCalculate}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all min-h-[44px] ${
            canCalculate
              ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-md'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Calculando...
            </span>
          ) : (
            'Calcular Ruta'
          )}
        </button>
      </div>
    </div>
  );
}
