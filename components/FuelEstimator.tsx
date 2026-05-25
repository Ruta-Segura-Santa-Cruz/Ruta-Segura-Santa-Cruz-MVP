'use client';

import type { FuelEstimate } from '@/lib/types';

interface FuelEstimatorProps {
  fuelEstimate: FuelEstimate | null;
}

export default function FuelEstimator({ fuelEstimate }: FuelEstimatorProps) {
  if (!fuelEstimate) {
    return (
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h3 className="font-semibold text-gray-700">
          Estimación de Combustible
        </h3>
        <p className="text-sm text-gray-400 mt-2">
          Calcula una ruta para ver la estimación
        </p>
      </div>
    );
  }

  const {
    distanceKm,
    baseConsumptionL,
    realConsumptionL,
    extraConsumptionL,
    extraConsumptionPercent,
    baseCostBs,
    realCostBs,
    extraCostBs,
  } = fuelEstimate;

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <h3 className="font-semibold text-gray-700 mb-3">
        Estimación de Combustible
      </h3>

      <div className="mb-3">
        <div className="text-2xl font-bold text-gray-800">
          {distanceKm.toFixed(1)} km
        </div>
        <div className="text-xs text-gray-400">Distancia total</div>
      </div>

      <div className="space-y-2">
        <div className="bg-blue-50 rounded p-3 border border-blue-100">
          <div className="text-xs text-blue-600 font-medium mb-1">
            Consumo Base
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{baseConsumptionL} L</span>
            <span className="text-sm font-semibold text-gray-800">
              Bs. {baseCostBs.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="bg-amber-50 rounded p-3 border border-amber-100">
          <div className="text-xs text-amber-600 font-medium mb-1">
            Consumo Real (con baches)
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {realConsumptionL} L
            </span>
            <span className="text-sm font-semibold text-gray-800">
              Bs. {realCostBs.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="bg-red-50 rounded p-3 border border-red-100">
          <div className="text-xs text-red-600 font-medium mb-1">
            Consumo Extra
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              +{extraConsumptionL} L ({extraConsumptionPercent}%)
            </span>
            <span className="text-sm font-semibold text-red-600">
              +Bs. {extraCostBs.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
