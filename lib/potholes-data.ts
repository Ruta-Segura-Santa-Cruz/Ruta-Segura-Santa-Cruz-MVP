// lib/potholes-data.ts
// Persona 3 — Carga y filtrado del JSON local de 796 baches de SCZ

import type { Pothole } from './types';

// Cache en memoria para no leer el archivo múltiples veces
let _cachedPotholes: Pothole[] | null = null;

/**
 * Carga los baches desde el archivo público local.
 * En producción, este archivo vive en /public/data/potholes.json
 * y fue extraído previamente del Bachómetro.
 *
 * Usa cache en memoria: la segunda llamada es instantánea.
 */
export async function loadPotholes(): Promise<Pothole[]> {
  if (_cachedPotholes) return _cachedPotholes;

  try {
    const response = await fetch('/data/potholes.json');
    if (!response.ok) {
      throw new Error(`Error al cargar baches: ${response.status}`);
    }
    const raw: unknown[] = await response.json();
    _cachedPotholes = raw
      .map(normalizePothole)
      .filter(isValidPothole)
      .filter((p) => p.region_slug === 'scz'); // Solo Santa Cruz

    console.info(`[potholes-data] Cargados ${_cachedPotholes.length} baches de SCZ`);
    return _cachedPotholes;
  } catch (error) {
    console.error('[potholes-data] No se pudo cargar potholes.json:', error);
    return [];
  }
}

/**
 * Normaliza un objeto crudo del JSON al tipo Pothole.
 * Protege contra campos faltantes o mal tipados.
 */
function normalizePothole(raw: unknown): Pothole {
  const r = raw as Record<string, unknown>;
  return {
    id: String(r.id ?? ''),
    title: String(r.title ?? 'Sin título'),
    latitude: Number(r.latitude ?? 0),
    longitude: Number(r.longitude ?? 0),
    severity: validateSeverity(r.severity),
    status: r.status === 'fixed' ? 'fixed' : 'reported',
    region_slug: String(r.region_slug ?? ''),
    created_at: String(r.created_at ?? ''),
    on_main_avenue: Boolean(r.on_main_avenue ?? false),
  };
}

/**
 * Valida que el bache tenga coordenadas reales (no 0,0) y un ID.
 */
function isValidPothole(p: Pothole): boolean {
  return (
    p.id.length > 0 &&
    p.latitude !== 0 &&
    p.longitude !== 0 &&
    !isNaN(p.latitude) &&
    !isNaN(p.longitude)
  );
}

/**
 * Valida el campo severity y retorna un valor seguro.
 */
function validateSeverity(value: unknown): Pothole['severity'] {
  const valid = ['low', 'medium', 'high', 'critical'];
  return valid.includes(String(value))
    ? (value as Pothole['severity'])
    : 'medium';
}

/**
 * Filtra baches por severidad mínima.
 * Útil si se quiere mostrar solo los más peligrosos en el mapa.
 */
export function filterBySeverity(
  potholes: Pothole[],
  minSeverity: 'low' | 'medium' | 'high' | 'critical'
): Pothole[] {
  const order = { low: 0, medium: 1, high: 2, critical: 3 };
  const min = order[minSeverity];
  return potholes.filter((p) => order[p.severity] >= min);
}

/**
 * Convierte el array de baches al formato GeoJSON FeatureCollection
 * para que Leaflet/react-leaflet pueda renderizarlo directamente.
 */
export function potholesToGeoJSON(potholes: Pothole[]) {
  return {
    type: 'FeatureCollection' as const,
    features: potholes.map((p) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [p.longitude, p.latitude], // GeoJSON: [lng, lat]
      },
      properties: {
        id: p.id,
        title: p.title,
        severity: p.severity,
        status: p.status,
        on_main_avenue: p.on_main_avenue,
        created_at: p.created_at,
      },
    })),
  };
}

/**
 * Limpia la cache (útil para tests).
 */
export function clearCache(): void {
  _cachedPotholes = null;
}