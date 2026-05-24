// lib/risk-analyzer.ts
// Persona 3 — Motor de análisis espacial de riesgo de ruta

import * as turf from '@turf/turf';
import type { Pothole, RiskAnalysis, RiskLevel, RouteGeoJSON } from './types';
import { RISK_CONFIG } from './constants';

/**
 * Analiza el riesgo de una ruta comparándola con los baches conocidos.
 *
 * Algoritmo:
 * 1. Construye un buffer de 50m alrededor de la ruta (polígono)
 * 2. Verifica qué baches caen dentro del buffer
 * 3. Calcula un score ponderado según la severidad de cada bache
 * 4. Mapea el score a un nivel de riesgo (Bajo/Medio/Alto/Muy Alto)
 *
 * @param routeGeoJSON GeoJSON de la ruta devuelto por ORS
 * @param potholes Array de baches cargados desde el JSON local
 * @returns RiskAnalysis completo con score, nivel y baches cercanos
 */
export function analyzeRisk(
  routeGeoJSON: RouteGeoJSON,
  potholes: Pothole[]
): RiskAnalysis {
  // Extraer la geometría LineString de la primera feature de la ruta
  const routeFeature = routeGeoJSON.features[0];
  if (!routeFeature) {
    return buildEmptyAnalysis('No se encontró geometría de ruta.');
  }

  // ── Paso 1: Crear buffer de 50m alrededor de la ruta ──────────────────────
  const routeLine = turf.lineString(routeFeature.geometry.coordinates);
  const buffer = turf.buffer(routeLine, RISK_CONFIG.BUFFER_METERS / 1000, {
    units: 'kilometers',
  });

  if (!buffer) {
    return buildEmptyAnalysis('No se pudo construir el buffer de riesgo.');
  }

  // ── Paso 2: Filtrar baches dentro del buffer ───────────────────────────────
  const bachesDentroDelBuffer: Pothole[] = [];

  for (const pothole of potholes) {
    // Ignorar baches ya arreglados
    if (pothole.status === 'fixed') continue;

    const punto = turf.point([pothole.longitude, pothole.latitude]);
    const estaDentro = turf.booleanPointInPolygon(punto, buffer);

    if (estaDentro) {
      bachesDentroDelBuffer.push(pothole);
    }
  }

  // ── Paso 3: Calcular score ponderado ──────────────────────────────────────
  let weightedScore = 0;
  const breakdown = { low: 0, medium: 0, high: 0, critical: 0 };

  for (const bache of bachesDentroDelBuffer) {
    const peso = RISK_CONFIG.WEIGHTS[bache.severity];
    weightedScore += peso;
    breakdown[bache.severity]++;

    // Bonus: baches en avenida principal pesan el doble
    if (bache.on_main_avenue) {
      weightedScore += peso * 0.5;
    }
  }

  // ── Paso 4: Normalizar score a 0-100 ──────────────────────────────────────
  // El score máximo teórico sería si todos fueran critical + on_main_avenue
  const MAX_EXPECTED_SCORE = 150;
  const riskScore = Math.min(100, Math.round((weightedScore / MAX_EXPECTED_SCORE) * 100));

  // ── Paso 5: Clasificar nivel de riesgo ────────────────────────────────────
  const riskLevel = classifyRisk(weightedScore);

  return {
    riskLevel,
    riskScore,
    weightedScore: Math.round(weightedScore),
    bachesCercanos: bachesDentroDelBuffer,
    totalBaches: bachesDentroDelBuffer.length,
    breakdown,
    recommendation: buildRecommendation(riskLevel, bachesDentroDelBuffer.length),
  };
}

/**
 * Clasifica el nivel de riesgo según el score ponderado crudo.
 * Usa los umbrales definidos en RISK_CONFIG.
 */
function classifyRisk(weightedScore: number): RiskLevel {
  if (weightedScore < RISK_CONFIG.THRESHOLDS.MEDIO) return 'Bajo';
  if (weightedScore < RISK_CONFIG.THRESHOLDS.ALTO) return 'Medio';
  if (weightedScore < RISK_CONFIG.THRESHOLDS.MUY_ALTO) return 'Alto';
  return 'Muy Alto';
}

/**
 * Genera un mensaje de recomendación según el nivel de riesgo.
 */
function buildRecommendation(nivel: RiskLevel, total: number): string {
  const plural = total === 1 ? 'bache' : 'baches';
  switch (nivel) {
    case 'Bajo':
      return `Ruta en buen estado. Se detectaron ${total} ${plural} cercanos. Puede circular con normalidad.`;
    case 'Medio':
      return `Ruta con precaución. Se detectaron ${total} ${plural} cercanos. Reduzca velocidad en zonas marcadas.`;
    case 'Alto':
      return `Ruta de alto riesgo. ${total} ${plural} detectados. Se recomienda una ruta alternativa.`;
    case 'Muy Alto':
      return `⚠️ Ruta muy peligrosa. ${total} ${plural} detectados incluyendo críticos. Seleccione una ruta alternativa.`;
  }
}

/**
 * Retorna un análisis vacío cuando no hay datos suficientes.
 */
function buildEmptyAnalysis(recommendation: string): RiskAnalysis {
  return {
    riskLevel: 'Bajo',
    riskScore: 0,
    weightedScore: 0,
    bachesCercanos: [],
    totalBaches: 0,
    breakdown: { low: 0, medium: 0, high: 0, critical: 0 },
    recommendation,
  };
}