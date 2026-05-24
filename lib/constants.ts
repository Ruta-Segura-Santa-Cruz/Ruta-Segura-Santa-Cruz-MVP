// lib/constants.ts
// Persona 3 — Parámetros fijos, precios y multiplicadores del sistema

import type { RiskLevel } from './types';

// ─── MAPA ─────────────────────────────────────────────────────────────────────
export const MAP_CONFIG = {
  CENTER: [-17.7833, -63.1821] as [number, number], // Plaza 24 de Septiembre, SCZ
  ZOOM: 12,
  ZOOM_MIN: 10,
  ZOOM_MAX: 18,
  TILE_LAYER: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  TILE_ATTRIBUTION: '© OpenStreetMap contributors',
  BUFFER_DISTANCE_KM: 0.05, // 50 metros expresados en kilómetros para Turf.js
} as const;

// ─── COMBUSTIBLE ──────────────────────────────────────────────────────────────
export const FUEL_CONFIG = {
  // Consumo base de un auto urbano promedio: 10 L/100km → 0.10 L/km
  BASE_CONSUMPTION_L_PER_KM: 0.10,

  // Precio oficial de gasolina especial en Bolivia (Bs.)
  PRICE_PER_LITER_BS: 3.74,

  // Factores de penalización por severidad de bache
  // Cada bache cercano a la ruta aplica un multiplicador acumulativo al consumo
  SEVERITY_FACTORS: {
    low: 1.02,      // +2% — pequeñas vibraciones, mínima fricción adicional
    medium: 1.05,   // +5% — frenado suave, reducción de velocidad moderada
    high: 1.10,     // +10% — frenado fuerte, maniobras de evasión
    critical: 1.15, // +15% — detención, aceleración brusca, daño potencial
  } as const,

  // Factores globales de consumo según nivel de riesgo total de la ruta
  RISK_FACTORS: {
    'Bajo': 1.0,
    'Medio': 1.05,
    'Alto': 1.12,
    'Muy Alto': 1.20,
  } as Record<RiskLevel, number>,
} as const;

// ─── ANÁLISIS DE RIESGO ───────────────────────────────────────────────────────
export const RISK_CONFIG = {
  // Peso de cada bache según su severidad (para el score ponderado)
  WEIGHTS: {
    low: 1,
    medium: 2,
    high: 5,
    critical: 10,
  } as const,

  // Umbrales del score ponderado para clasificar el nivel de riesgo
  // score < 10       → Bajo
  // score 10-24      → Medio
  // score 25-49      → Alto
  // score >= 50      → Muy Alto
  THRESHOLDS: {
    MEDIO: 10,
    ALTO: 25,
    MUY_ALTO: 50,
  } as const,

  // Radio de búsqueda de baches alrededor de la ruta
  BUFFER_METERS: 50,
} as const;

// ─── COLORES DE RIESGO (para el mapa y UI) ────────────────────────────────────
export const RISK_COLORS: Record<RiskLevel, string> = {
  'Bajo': '#16a34a',      // verde
  'Medio': '#ca8a04',     // amarillo
  'Alto': '#ea580c',      // naranja
  'Muy Alto': '#dc2626',  // rojo
};

// Colores de marcadores de baches por severidad
export const SEVERITY_COLORS = {
  low: '#22c55e',      // verde
  medium: '#eab308',   // amarillo
  high: '#f97316',     // naranja
  critical: '#ef4444', // rojo
} as const;

// ─── ORS ──────────────────────────────────────────────────────────────────────
export const ORS_CONFIG = {
  BASE_URL: 'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
  PROXY_URL: '/api/route', // Next.js API Route interna
} as const;