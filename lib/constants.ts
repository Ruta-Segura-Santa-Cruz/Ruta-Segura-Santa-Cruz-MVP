export const SANTA_CRUZ_CENTER = {
  lat: -17.7833,
  lng: -63.1821,
} as const;

export const MAP_ZOOM = 12;

export const FUEL_PRICE_PER_LITER_BS = 7.5;

export const FUEL_CONSUMPTION_L_PER_KM = 0.1;

export const RISK_WEIGHTS: Record<string, number> = {
  low: 0.02,
  medium: 0.05,
  high: 0.10,
  critical: 0.20,
};

export const RISK_THRESHOLDS = {
  BAJO: { max: 1.0 },
  MEDIO: { max: 2.5 },
  ALTO: { max: 5.0 },
  MUY_ALTO: { max: Infinity },
} as const;

export const ROUTE_BUFFER_KM = 0.05;
