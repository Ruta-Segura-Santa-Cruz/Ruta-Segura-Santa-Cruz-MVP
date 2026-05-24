// lib/types.ts
// Persona 3 — Contratos de tipos del sistema completo

// ─── BACHE ────────────────────────────────────────────────────────────────────
export interface Pothole {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'fixed';
  region_slug: string;
  created_at: string;
  on_main_avenue?: boolean;
}

// ─── COORDENADA ───────────────────────────────────────────────────────────────
export interface LatLng {
  lat: number;
  lng: number;
}

// ─── RUTA (respuesta de ORS via proxy) ────────────────────────────────────────
export interface RouteGeoJSON {
  type: 'FeatureCollection';
  features: RouteFeature[];
  metadata?: {
    query: {
      coordinates: [number, number][];
    };
  };
}

export interface RouteFeature {
  type: 'Feature';
  geometry: {
    type: 'LineString';
    coordinates: [number, number][]; // [lng, lat] — formato GeoJSON estándar
  };
  properties: {
    summary: {
      distance: number; // metros
      duration: number; // segundos
    };
    segments?: RouteSegment[];
  };
}

export interface RouteSegment {
  distance: number;
  duration: number;
  steps: RouteStep[];
}

export interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
}

// ─── ANÁLISIS DE RIESGO ───────────────────────────────────────────────────────
export type RiskLevel = 'Bajo' | 'Medio' | 'Alto' | 'Muy Alto';

export interface RiskAnalysis {
  riskLevel: RiskLevel;
  riskScore: number;       // 0-100, score ponderado final
  weightedScore: number;   // suma cruda de pesos antes de normalizar
  bachesCercanos: Pothole[]; // baches dentro del buffer de 50m
  totalBaches: number;
  breakdown: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  recommendation: string;
}

// ─── ESTIMACIÓN DE COMBUSTIBLE ────────────────────────────────────────────────
export interface FuelEstimate {
  distanceKm: number;
  baseConsumptionLiters: number;   // consumo sin baches
  realConsumptionLiters: number;   // consumo real con penalizaciones
  extraConsumptionLiters: number;  // diferencia
  extraPercent: number;            // % de sobreconsumo
  baseCostBs: number;              // costo ideal en bolivianos
  realCostBs: number;              // costo real en bolivianos
  extraCostBs: number;             // costo extra en bolivianos
}

// ─── ESTADO GLOBAL DE LA APP (para Persona 4) ────────────────────────────────
export interface AppState {
  origin: LatLng | null;
  destination: LatLng | null;
  route: RouteGeoJSON | null;
  riskAnalysis: RiskAnalysis | null;
  fuelEstimate: FuelEstimate | null;
  isLoading: boolean;
  error: string | null;
}
