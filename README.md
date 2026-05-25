# Ruta Segura Santa Cruz — MVP Geoespacial

Plataforma interactiva para conductores urbanos de Santa Cruz de la Sierra. Visualiza baches reales, calcula rutas optimas y estima el consumo de gasolina segun el estado de la via.

## Stack Tecnologico

- **Next.js 16** + TypeScript + Tailwind CSS v4
- **Leaflet** (mapas interactivos sin react-leaflet para evitar conflictos SSR)
- **@turf/turf v7** (analisis espacial: buffers, distancias, puntos en poligonos)
- **OpenRouteService API** (calculo de rutas vehiculares)

## Arquitectura

```
User clicks map (origin → destination)
       ↓
handleMapClick() actualiza estado en page.tsx
       ↓
User click "Calcular Ruta"
       ↓
handleCalculateRoute() → POST /api/route
       ↓
API Route proxy → OpenRouteService (oculta API Key)
       ↓
GeoJSON route devuelto al cliente
       ↓
analyzeRisk() (buffer Turf + potholes)
       ↓
calculateFuelConsumption() (distancia × factor riesgo)
       ↓
Todos los estados actualizados → Components re-renderizan
```

## Flujo de Datos

Todo el estado vive en `app/page.tsx` y fluye unidireccionalmente hacia los componentes via props.

### Estados principales
- `origin` / `destination`: coordenadas seleccionadas en el mapa
- `route`: GeoJSON de la ruta desde OpenRouteService
- `riskLevel`: nivel de riesgo ('Bajo' | 'Medio' | 'Alto' | 'Muy Alto')
- `riskAnalysis`: objeto con puntuacion detallada de riesgo
- `fuelEstimate`: objeto con consumo base, real, extra y costos en Bs.
- `isLoading`: control de estado de carga

## Instalacion

```bash
git clone https://github.com/Ruta-Segura-Santa-Cruz/Ruta-Segura-Santa-Cruz-MVP.git
cd Ruta-Segura-Santa-Cruz-MVP
npm install
```

## Configuracion

Crear archivo `.env.local` en la raiz del proyecto:

```
ORS_API_KEY=tu_api_key_aqui
```

Obtener API Key gratis en: https://openrouteservice.org/

## Ejecucion Local

```bash
npm run dev
```

Abrir http://localhost:3000

1. Haz clic en el mapa para marcar el **Origen** (marcador verde)
2. Haz clic nuevamente para marcar el **Destino** (marcador rojo)
3. Presiona **Calcular Ruta** en el panel lateral
4. Visualiza la ruta, nivel de riesgo y estimacion de combustible

## Comandos

| Comando | Uso |
|---|---|
| `npm run dev` | Servidor local puerto 3000 |
| `npm run build` | Compilar para produccion |
| `npm run lint` | Revisar errores de codigo |
| `npm start` | Iniciar servidor de produccion |

## Despliegue en Vercel

1. Conectar repositorio a [Vercel](https://vercel.com)
2. Configurar variable de entorno en Vercel:
   - `ORS_API_KEY` = tu clave de OpenRouteService
3. Desplegar branch `main`
4. La aplicacion se despliega automaticamente en cada push

## Estructura del Proyecto

```
ruta-segura-scz/
├── app/
│   ├── page.tsx           # Orquestador principal (Persona 4)
│   ├── layout.tsx          # Layout base con metadata (Persona 4)
│   ├── globals.css         # Estilos globales + Leaflet (Persona 4)
│   └── api/route/route.ts  # Proxy API a OpenRouteService (Persona 2)
├── components/
│   ├── Map.tsx             # Mapa Leaflet con baches (Persona 1)
│   ├── MapWrapper.tsx      # Dynamic import SSR-safe (Persona 1)
│   ├── RoutePanel.tsx      # Panel de control de ruta (Persona 2)
│   ├── RiskIndicator.tsx   # Indicador circular de riesgo (Persona 2)
│   ├── FuelEstimator.tsx   # Estimacion de combustible (Persona 4)
│   └── LoadingSpinner.tsx  # Spinner de carga (Persona 2)
├── lib/
│   ├── types.ts            # Interfaces compartidas (Persona 3)
│   ├── constants.ts        # Parametros de configuracion (Persona 3)
│   ├── geometry.ts         # Formula Haversine (Persona 3)
│   ├── potholes-data.ts    # Loader de baches JSON (Persona 3)
│   ├── fuel-calculator.ts  # Calculo de combustible (Persona 3)
│   └── risk-analyzer.ts    # Analisis espacial Turf (Persona 3)
└── public/data/
    └── potholes.json       # 796 baches de Santa Cruz
```

## Responsabilidades del Equipo

### Persona 1 - Mapa y Geoespacial (COMPLETADO)
- `components/Map.tsx` — Mapa Leaflet con baches, marcadores y polilinea
- `components/MapWrapper.tsx` — Wrapper SSR-safe con dynamic import
- Carga de 796 baches con colores por severidad
- Marcadores de Origen (verde) y Destino (rojo)
- Polilinea de ruta con color reactivo segun riesgo
- Leyenda de severidad y `fitBounds` automatico

### Persona 2 - UI Components y API Proxy (COMPLETADO)
- `components/RoutePanel.tsx` — Panel con coordenadas y boton calcular
- `components/RiskIndicator.tsx` — Badge circular con barra de progreso
- `components/LoadingSpinner.tsx` — Spinner animado SVG
- `app/api/route/route.ts` — Proxy POST a OpenRouteService

### Persona 3 - Datos y Logica Matematica (COMPLETADO)
- `lib/types.ts` — Interfaces: Pothole, RiskAnalysis, FuelEstimate, RouteGeoJSON
- `lib/constants.ts` — Parametros de combustible, riesgo y mapa
- `lib/potholes-data.ts` — Loader con fetch a /data/potholes.json
- `lib/geometry.ts` — Formula Haversine para distancias
- `lib/fuel-calculator.ts` — Consumo base/real/extra + costos en Bs.
- `lib/risk-analyzer.ts` — Buffer Turf + puntos dentro del poligono

### Persona 4 - Integracion y QA (COMPLETADO)
- `app/layout.tsx` — Metadatos SEO, OpenGraph, fuentes
- `app/globals.css` — Tailwind v4 + Leaflet CSS
- `app/page.tsx` — Orquestador: estados, clics, API calls, conexion de componentes
- `components/FuelEstimator.tsx` — Visualizacion de consumo y costos

## Pruebas Realizadas

- [x] Build sin errores TypeScript
- [x] Lint sin warnings
- [x] Mapa carga 796 baches
- [x] Clic secuencial origen → destino
- [x] Calculo de ruta con todos los componentes
- [x] Visualizacion de nivel de riesgo
- [x] Estimacion de combustible con costos en Bs.
- [x] Diseño responsive (sidebar colapsable en mobile)
- [x] Manejo de errores con feedback visual
- [x] Despliegue en produccion

## Demo

Para probar la aplicacion con coordenadas de Santa Cruz:

- **Origen**: -17.7833, -63.1821 (centro)
- **Destino**: -17.7900, -63.1900 (zona sur)
