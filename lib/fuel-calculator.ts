// lib/fuel-calculator.ts
// Persona 3 — Motor de estimación de consumo real de gasolina

import type { FuelEstimate, Pothole, RiskLevel } from './types';
import { FUEL_CONFIG } from './constants';

/**
 * Calcula el consumo real de gasolina de una ruta, con penalizaciones
 * basadas en los baches que intercepta.
 *
 * Modelo matemático:
 * 1. Consumo base = distancia (km) × consumo nominal (L/km)
 * 2. Factor de baches = producto acumulativo de factores por severidad
 * 3. Factor global de riesgo = multiplicador según nivel de riesgo de ruta
 * 4. Consumo real = consumo base × factor de baches × factor de riesgo
 * 5. Costo (Bs.) = consumo × precio por litro
 *
 * @param distanceKm Distancia de la ruta en kilómetros
 * @param bachesCercanos Lista de baches dentro del buffer de 50m
 * @param riskLevel Nivel de riesgo global de la ruta
 * @returns FuelEstimate con todos los valores calculados
 */
export function calculateFuelEstimate(
  distanceKm: number,
  bachesCercanos: Pothole[],
  riskLevel: RiskLevel
): FuelEstimate {
  // ── Paso 1: Consumo base (sin baches) ────────────────────────────────────
  const baseConsumptionLiters =
    distanceKm * FUEL_CONFIG.BASE_CONSUMPTION_L_PER_KM;

  // ── Paso 2: Factor acumulado por baches ───────────────────────────────────
  // Cada bache dentro del buffer agrega su penalización multiplicativa.
  // Para evitar valores extremos, se aplica raíz del producto (promedio geométrico).
  let accumulatedFactor = 1.0;

  if (bachesCercanos.length > 0) {
    const productOfFactors = bachesCercanos.reduce((product, bache) => {
      return product * FUEL_CONFIG.SEVERITY_FACTORS[bache.severity];
    }, 1.0);

    // Promedio geométrico: evita inflación exponencial con muchos baches
    accumulatedFactor = Math.pow(productOfFactors, 1 / bachesCercanos.length);
  }

  // ── Paso 3: Factor global de riesgo de ruta ───────────────────────────────
  const globalRiskFactor = FUEL_CONFIG.RISK_FACTORS[riskLevel];

  // ── Paso 4: Consumo real combinado ────────────────────────────────────────
  const realConsumptionLiters =
    baseConsumptionLiters * accumulatedFactor * globalRiskFactor;

  // ── Paso 5: Diferenciales ─────────────────────────────────────────────────
  const extraConsumptionLiters = realConsumptionLiters - baseConsumptionLiters;
  const extraPercent =
    baseConsumptionLiters > 0
      ? (extraConsumptionLiters / baseConsumptionLiters) * 100
      : 0;

  // ── Paso 6: Costos en bolivianos ──────────────────────────────────────────
  const baseCostBs = baseConsumptionLiters * FUEL_CONFIG.PRICE_PER_LITER_BS;
  const realCostBs = realConsumptionLiters * FUEL_CONFIG.PRICE_PER_LITER_BS;
  const extraCostBs = realCostBs - baseCostBs;

  return {
    distanceKm: roundTo(distanceKm, 2),
    baseConsumptionLiters: roundTo(baseConsumptionLiters, 3),
    realConsumptionLiters: roundTo(realConsumptionLiters, 3),
    extraConsumptionLiters: roundTo(extraConsumptionLiters, 3),
    extraPercent: roundTo(extraPercent, 1),
    baseCostBs: roundTo(baseCostBs, 2),
    realCostBs: roundTo(realCostBs, 2),
    extraCostBs: roundTo(extraCostBs, 2),
  };
}

/**
 * Formatea un valor en bolivianos para mostrar en UI.
 * Ejemplo: 12.5 → "Bs. 12.50"
 */
export function formatBs(value: number): string {
  return `Bs. ${value.toFixed(2)}`;
}

/**
 * Formatea litros para mostrar en UI.
 * Ejemplo: 1.234 → "1.23 L"
 */
export function formatLiters(value: number): string {
  return `${value.toFixed(2)} L`;
}

/**
 * Genera un resumen textual del sobreconsumo para mostrar en el panel.
 */
export function fuelSummary(estimate: FuelEstimate): string {
  if (estimate.extraPercent < 1) {
    return 'El estado de la vía no impacta significativamente el consumo.';
  }
  return (
    `Esta ruta genera un sobreconsumo estimado de ${formatLiters(estimate.extraConsumptionLiters)} ` +
    `(+${estimate.extraPercent.toFixed(1)}%) equivalente a ${formatBs(estimate.extraCostBs)} adicionales.`
  );
}

// ─── Utilidad interna ─────────────────────────────────────────────────────────
function roundTo(value: number, decimals: number): number {
  return Math.round(value * 10 ** decimals) / 10 ** decimals;
}