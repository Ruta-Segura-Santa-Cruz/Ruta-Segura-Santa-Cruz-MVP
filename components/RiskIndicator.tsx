'use client';

import type { RiskAnalysis } from '@/lib/types';

interface RiskIndicatorProps {
  riskAnalysis: RiskAnalysis | null;
}

const riskColors: Record<string, string> = {
  Bajo: 'bg-green-500',
  Medio: 'bg-yellow-500',
  Alto: 'bg-orange-500',
  'Muy Alto': 'bg-red-600',
};

const riskBgColors: Record<string, string> = {
  Bajo: 'bg-green-50 border-green-200',
  Medio: 'bg-yellow-50 border-yellow-200',
  Alto: 'bg-orange-50 border-orange-200',
  'Muy Alto': 'bg-red-50 border-red-200',
};

const riskTextColors: Record<string, string> = {
  Bajo: 'text-green-700',
  Medio: 'text-yellow-700',
  Alto: 'text-orange-700',
  'Muy Alto': 'text-red-700',
};

export default function RiskIndicator({ riskAnalysis }: RiskIndicatorProps) {
  if (!riskAnalysis) {
    return (
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h3 className="font-semibold text-gray-700">Nivel de Riesgo</h3>
        <p className="text-sm text-gray-400 mt-2">
          Calcula una ruta para ver el análisis
        </p>
      </div>
    );
  }

  const { riskLevel, riskScore, bachesCercanos, weightedScore } = riskAnalysis;

  return (
    <div
      className={`rounded-lg border p-4 mb-4 transition-all ${riskBgColors[riskLevel]}`}
    >
      <h3 className={`font-semibold mb-3 ${riskTextColors[riskLevel]}`}>
        Nivel de Riesgo
      </h3>

      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${riskColors[riskLevel]}`}
        >
          {riskLevel === 'Muy Alto' ? 'MA' : riskLevel[0]}
        </div>
        <div>
          <span className={`text-lg font-bold ${riskTextColors[riskLevel]}`}>
            {riskLevel}
          </span>
          <div className="w-32 h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${riskColors[riskLevel]}`}
              style={{ width: `${Math.min(riskScore * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Baches cercanos:</span>
          <span className="font-semibold">{bachesCercanos}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Puntuación ponderada:</span>
          <span className="font-semibold">{weightedScore.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
