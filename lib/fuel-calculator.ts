import type { RiskAnalysis, FuelEstimate, RouteGeoJSON } from '@/lib/types';
import { FUEL_CONSUMPTION_L_PER_KM, FUEL_PRICE_PER_LITER_BS } from '@/lib/constants';
import { length } from '@turf/turf';

export function calculateFuelConsumption(
  route: RouteGeoJSON,
  riskAnalysis: RiskAnalysis
): FuelEstimate {
  const distanceKm = length(route, { units: 'kilometers' });
  const baseConsumptionL = distanceKm * FUEL_CONSUMPTION_L_PER_KM;
  const riskFactor = 1 + riskAnalysis.weightedScore * 0.1;
  const realConsumptionL = baseConsumptionL * riskFactor;
  const extraConsumptionL = realConsumptionL - baseConsumptionL;
  const extraConsumptionPercent = baseConsumptionL > 0
    ? (extraConsumptionL / baseConsumptionL) * 100
    : 0;
  const baseCostBs = baseConsumptionL * FUEL_PRICE_PER_LITER_BS;
  const realCostBs = realConsumptionL * FUEL_PRICE_PER_LITER_BS;
  const extraCostBs = realCostBs - baseCostBs;

  return {
    distanceKm: Math.round(distanceKm * 100) / 100,
    baseConsumptionL: Math.round(baseConsumptionL * 100) / 100,
    realConsumptionL: Math.round(realConsumptionL * 100) / 100,
    extraConsumptionL: Math.round(extraConsumptionL * 100) / 100,
    extraConsumptionPercent: Math.round(extraConsumptionPercent * 100) / 100,
    baseCostBs: Math.round(baseCostBs * 100) / 100,
    realCostBs: Math.round(realCostBs * 100) / 100,
    extraCostBs: Math.round(extraCostBs * 100) / 100,
  };
}
