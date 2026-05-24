// lib/tests/logic.test.ts
// Persona 3 — Banco de pruebas aisladas (sin framework, corre en Node.js)
// Ejecutar: npx ts-node lib/tests/logic.test.ts

import { haversineDistance, calculateRouteDistanceKm, isWithinRadius, geoJsonToLeaflet } from '../geometry';
import { calculateFuelEstimate, formatBs, fuelSummary } from '../fuel-calculator';
import type { Pothole } from '../types';

// ─── Mini runner de tests ──────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (e) {
    console.error(`  ❌ ${name}`);
    console.error(`     ${(e as Error).message}`);
    failed++;
  }
}

function expect(actual: number, expected: number, tolerance = 0.01) {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`Esperado ~${expected}, obtenido ${actual}`);
  }
}

function expectTrue(value: boolean, msg: string) {
  if (!value) throw new Error(msg);
}

// ─── SUITE 1: Haversine ────────────────────────────────────────────────────────
console.log('\n📐 Suite 1: Haversine Distance');

test('Plaza 24 de Septiembre → Cristo Redentor (~11km)', () => {
  // Plaza 24: -17.7833, -63.1821
  // Cristo Redentor aprox: -17.7356, -63.1990
  const dist = haversineDistance(-17.7833, -63.1821, -17.7356, -63.1990);
  expect(dist, 5900, 500); // ~5.9 km ajustado a coords reales
});

test('Misma coordenada → distancia 0', () => {
  const dist = haversineDistance(-17.7833, -63.1821, -17.7833, -63.1821);
  expect(dist, 0, 0.001);
});

test('100m al norte debe ser ~111m', () => {
  // 1 grado lat ≈ 111,000m → 0.001 grado ≈ 111m
  const dist = haversineDistance(-17.7833, -63.1821, -17.7823, -63.1821);
  expect(dist, 111, 5);
});

// ─── SUITE 2: Distancia de ruta ───────────────────────────────────────────────
console.log('\n📏 Suite 2: Route Distance');

test('Ruta de 2 puntos conocidos', () => {
  const coords: [number, number][] = [
    [-63.1821, -17.7833],
    [-63.1990, -17.7356],
  ];
  const km = calculateRouteDistanceKm(coords);
  expect(km, 5.9, 0.5);
});

test('Ruta vacía → 0km', () => {
  expect(calculateRouteDistanceKm([]), 0, 0);
});

test('Ruta de 1 punto → 0km', () => {
  expect(calculateRouteDistanceKm([[-63.18, -17.78]]), 0, 0);
});

// ─── SUITE 3: isWithinRadius ──────────────────────────────────────────────────
console.log('\n🎯 Suite 3: isWithinRadius');

test('Punto a 30m → dentro de radio 50m', () => {
  // 30m al norte: ~0.00027 grados lat
  expectTrue(
    isWithinRadius(-17.7830, -63.1821, -17.7833, -63.1821, 50),
    'Debería estar dentro de 50m'
  );
});

test('Punto a 200m → fuera de radio 50m', () => {
  // 200m al norte: ~0.0018 grados lat
  expectTrue(
    !isWithinRadius(-17.7815, -63.1821, -17.7833, -63.1821, 50),
    'Debería estar fuera de 50m'
  );
});

// ─── SUITE 4: GeoJSON a Leaflet ───────────────────────────────────────────────
console.log('\n🔄 Suite 4: geoJsonToLeaflet');

test('Convierte [lng, lat] a [lat, lng]', () => {
  const result = geoJsonToLeaflet([[-63.1821, -17.7833]]);
  expectTrue(result[0][0] === -17.7833, 'Latitud debe ser primer elemento');
  expectTrue(result[0][1] === -63.1821, 'Longitud debe ser segundo elemento');
});

// ─── SUITE 5: Fuel Calculator ─────────────────────────────────────────────────
console.log('\n⛽ Suite 5: Fuel Calculator');

const noBaches: Pothole[] = [];
const bacheMedio: Pothole = {
  id: 'test-1', title: 'Test', latitude: -17.78, longitude: -63.18,
  severity: 'medium', status: 'reported', region_slug: 'scz', created_at: '',
};
const bacheHigh: Pothole = { ...bacheMedio, id: 'test-2', severity: 'high' };
const bacheCritical: Pothole = { ...bacheMedio, id: 'test-3', severity: 'critical' };

test('10km sin baches → consumo base 1L exacto', () => {
  const est = calculateFuelEstimate(10, noBaches, 'Bajo');
  expect(est.baseConsumptionLiters, 1.0, 0.001);
  expect(est.extraConsumptionLiters, 0, 0.001);
});

test('10km sin baches → costo base Bs. 3.74', () => {
  const est = calculateFuelEstimate(10, noBaches, 'Bajo');
  expect(est.baseCostBs, 3.74, 0.01);
});

test('Bache medium genera sobreconsumo positivo', () => {
  const est = calculateFuelEstimate(10, [bacheMedio], 'Medio');
  expectTrue(est.realConsumptionLiters > est.baseConsumptionLiters, 'Debe haber sobreconsumo');
  expectTrue(est.extraCostBs > 0, 'Debe haber costo extra');
});

test('Bache critical genera más sobreconsumo que medium', () => {
  const estMedium = calculateFuelEstimate(10, [bacheMedio], 'Medio');
  const estCritical = calculateFuelEstimate(10, [bacheCritical], 'Alto');
  expectTrue(
    estCritical.realConsumptionLiters > estMedium.realConsumptionLiters,
    'Critical debe consumir más que medium'
  );
});

test('Nivel Muy Alto genera más sobreconsumo que Bajo', () => {
  const estBajo = calculateFuelEstimate(10, [bacheHigh], 'Bajo');
  const estMuyAlto = calculateFuelEstimate(10, [bacheHigh], 'Muy Alto');
  expectTrue(estMuyAlto.realCostBs > estBajo.realCostBs, 'Muy Alto debe costar más');
});

test('formatBs formatea correctamente', () => {
  const result = formatBs(12.5);
  expectTrue(result === 'Bs. 12.50', `Esperado "Bs. 12.50", obtenido "${result}"`);
});

test('fuelSummary con 0% extra retorna mensaje sin impacto', () => {
  const est = calculateFuelEstimate(10, noBaches, 'Bajo');
  const msg = fuelSummary(est);
  expectTrue(msg.includes('no impacta'), `Mensaje inesperado: "${msg}"`);
});

// ─── RESUMEN ──────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(50)}`);
console.log(`Total: ${passed + failed} tests | ✅ ${passed} pasados | ❌ ${failed} fallidos`);
if (failed === 0) {
  console.log('🎉 Todos los tests pasaron. Lógica lista para integración.\n');
} else {
  console.log('⚠️  Hay tests fallidos. Revisar antes de integrar.\n');
  process.exit(1);
}