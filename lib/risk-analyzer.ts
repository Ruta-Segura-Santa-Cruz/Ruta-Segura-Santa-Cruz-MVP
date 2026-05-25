import type { Pothole, RiskAnalysis, RouteGeoJSON } from '@/lib/types';
import { RISK_WEIGHTS, RISK_THRESHOLDS, ROUTE_BUFFER_KM } from '@/lib/constants';
import { buffer, point, booleanPointInPolygon } from '@turf/turf';
import type { Feature, Polygon, MultiPolygon } from 'geojson';

export function analyzeRisk(
  route: RouteGeoJSON,
  potholes: Pothole[]
): RiskAnalysis {
  const buffered = buffer(route, ROUTE_BUFFER_KM, { units: 'kilometers' }) as
    | Feature<Polygon | MultiPolygon>
    | undefined;
  if (!buffered) {
    return { riskLevel: 'Bajo', riskScore: 0, bachesCercanos: 0, weightedScore: 0 };
  }
  const nearPotholes = potholes.filter((p) => {
    const pt = point([p.longitude, p.latitude]);
    return booleanPointInPolygon(pt, buffered);
  });

  const bachesCercanos = nearPotholes.length;
  let weightedScore = 0;
  for (const p of nearPotholes) {
    const w = RISK_WEIGHTS[p.severity] ?? 0.02;
    weightedScore += w;
  }

  let riskLevel: RiskAnalysis['riskLevel'];
  if (weightedScore <= RISK_THRESHOLDS.BAJO.max) {
    riskLevel = 'Bajo';
  } else if (weightedScore <= RISK_THRESHOLDS.MEDIO.max) {
    riskLevel = 'Medio';
  } else if (weightedScore <= RISK_THRESHOLDS.ALTO.max) {
    riskLevel = 'Alto';
  } else {
    riskLevel = 'Muy Alto';
  }

  const riskScore = Math.min(weightedScore / RISK_THRESHOLDS.MUY_ALTO.max, 1);

  return { riskLevel, riskScore, bachesCercanos, weightedScore };
}
