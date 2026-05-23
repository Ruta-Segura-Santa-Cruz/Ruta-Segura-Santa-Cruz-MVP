'use client';

interface RiskIndicatorProps {
  riskLevel: 'Bajo' | 'Medio' | 'Alto' | 'Muy Alto';
  riskScore: number;
}

export default function RiskIndicator({ riskLevel, riskScore }: RiskIndicatorProps) {
  const getColor = () => {
    switch (riskLevel) {
      case 'Bajo': return 'text-green-600';
      case 'Medio': return 'text-yellow-600';
      case 'Alto': return 'text-orange-600';
      case 'Muy Alto': return 'text-red-600';
    }
  };

  return (
    <div className="absolute top-4 right-4 z-[1000] w-32 bg-white/90 rounded-xl p-3 shadow-lg">
      <div className="text-center">
        <div className={`text-2xl font-bold ${getColor()}`}>
          {riskScore}
        </div>
        <div className={`text-sm font-bold ${getColor()}`}>
          RIESGO {riskLevel}
        </div>
      </div>
    </div>
  );
}