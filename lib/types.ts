export interface Pothole {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'fixed';
  region_slug: string;
  created_at: string;
}

export interface RiskAnalysis {
  riskLevel: 'Bajo' | 'Medio' | 'Alto' | 'Muy Alto';
  riskScore: number;
  bachesCercanos: number;
  weightedScore: number;
}

export interface FuelEstimate {
  distanceKm: number;
  baseConsumptionL: number;
  realConsumptionL: number;
  extraConsumptionL: number;
  extraConsumptionPercent: number;
  baseCostBs: number;
  realCostBs: number;
  extraCostBs: number;
}

import type { FeatureCollection } from 'geojson';

export type RouteGeoJSON = FeatureCollection;
