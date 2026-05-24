// lib/geometry.ts
// Persona 3 — Cálculos matemáticos geoespaciales puros (sin dependencias externas)

/**
 * Calcula la distancia en METROS entre dos puntos geográficos
 * usando la fórmula de Haversine.
 *
 * Fórmula:
 *   a = sin²(Δlat/2) + cos(lat1) · cos(lat2) · sin²(Δlng/2)
 *   c = 2 · atan2(√a, √(1−a))
 *   d = R · c
 *
 * @param lat1 Latitud del punto A (grados decimales)
 * @param lng1 Longitud del punto A (grados decimales)
 * @param lat2 Latitud del punto B (grados decimales)
 * @param lng2 Longitud del punto B (grados decimales)
 * @returns Distancia en metros
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6_371_000; // Radio de la Tierra en metros
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calcula la distancia total de una ruta GeoJSON LineString en KILÓMETROS.
 *
 * Recorre todos los segmentos consecutivos de la polilínea y suma
 * las distancias Haversine punto a punto.
 *
 * @param coordinates Array de [lng, lat] — formato estándar GeoJSON
 * @returns Distancia total en kilómetros
 */
export function calculateRouteDistanceKm(
  coordinates: [number, number][]
): number {
  if (coordinates.length < 2) return 0;

  let totalMeters = 0;
  for (let i = 0; i < coordinates.length - 1; i++) {
    const [lng1, lat1] = coordinates[i];
    const [lng2, lat2] = coordinates[i + 1];
    totalMeters += haversineDistance(lat1, lng1, lat2, lng2);
  }

  return totalMeters / 1000; // convertir a km
}

/**
 * Verifica si un punto (lat, lng) está dentro de un radio dado
 * en metros de otro punto de referencia.
 *
 * Atajo rápido: evita la raíz cuadrada comparando al cuadrado.
 * Para uso en filtrado masivo de baches (796 puntos × N puntos de ruta).
 *
 * @param pointLat Latitud del punto a evaluar
 * @param pointLng Longitud del punto a evaluar
 * @param refLat Latitud del punto de referencia
 * @param refLng Longitud del punto de referencia
 * @param radiusMeters Radio en metros
 */
export function isWithinRadius(
  pointLat: number,
  pointLng: number,
  refLat: number,
  refLng: number,
  radiusMeters: number
): boolean {
  return haversineDistance(pointLat, pointLng, refLat, refLng) <= radiusMeters;
}

/**
 * Convierte coordenadas GeoJSON [lng, lat] al formato Leaflet [lat, lng].
 * Uso crítico: GeoJSON y Leaflet tienen el orden de coordenadas invertido.
 *
 * @param coordinates Array de [lng, lat]
 * @returns Array de [lat, lng] para Leaflet
 */
export function geoJsonToLeaflet(
  coordinates: [number, number][]
): [number, number][] {
  return coordinates.map(([lng, lat]) => [lat, lng]);
}

/**
 * Calcula el punto medio (centroide) de una ruta.
 * Útil para centrar el mapa en la ruta calculada.
 *
 * @param coordinates Array de [lng, lat]
 * @returns { lat, lng } del centroide
 */
export function routeCentroid(
  coordinates: [number, number][]
): { lat: number; lng: number } {
  if (coordinates.length === 0) return { lat: -17.7833, lng: -63.1821 };

  const sumLat = coordinates.reduce((acc, [, lat]) => acc + lat, 0);
  const sumLng = coordinates.reduce((acc, [lng]) => acc + lng, 0);

  return {
    lat: sumLat / coordinates.length,
    lng: sumLng / coordinates.length,
  };
}