# Ruta Segura Santa Cruz — MVP Geoespacial

Plataforma interactiva para conductores urbanos de Santa Cruz de la Sierra. Visualiza baches reales, calcula rutas optimas y estima el consumo de gasolina segun el estado de la via.

## Stack Tecnologico

- Next.js 14 + TypeScript + Tailwind CSS
- Leaflet + react-leaflet (mapas interactivos)
- @turf/turf (calculos espaciales)
- OpenRouteService API (calculo de rutas)

## Instalacion

```bash
git clone https://github.com/Ruta-Segura-Santa-Cruz/Ruta-Segura-Santa-Cruz-MVP.git
cd Ruta-Segura-Santa-Cruz-MVP
npm install
```

Crear archivo `.env.local` en la raiz:
Obtener API Key gratis en: https://openrouteservice.org/

Levantar servidor local:
```bash
npm run dev
```

Abrir http://localhost:3000

## Estado del Proyecto por Persona

### Persona 1 - Mapa y Geoespacial - COMPLETADO
- components/Map.tsx — mapa Leaflet completo con baches, marcadores y polilínea
- components/MapWrapper.tsx — wrapper SSR-safe para Next.js
- Carga automatica de potholes.json con colores por severidad
- Marcadores de Origen (verde) y Destino (rojo) al hacer clic
- Polilínea de ruta con color reactivo segun nivel de riesgo
- Leyenda de severidad en esquina inferior derecha
- fitBounds automatico al calcular ruta

### Persona 2 - UI Components y API Proxy - PENDIENTE
Archivos a completar:
- components/RoutePanel.tsx — panel lateral con coordenadas y boton calcular ruta
- components/RiskIndicator.tsx — badge circular de nivel de riesgo
- components/LoadingSpinner.tsx — spinner animado SVG
- app/api/route/route.ts — proxy POST hacia OpenRouteService (oculta la API Key)
- .env.local — ya creado, agregar tu ORS_API_KEY real

### Persona 3 - Datos y Logica Matematica - PENDIENTE
Archivos a completar:
- lib/types.ts — interfaces TypeScript globales
- lib/constants.ts — parametros de combustible, riesgo y mapa
- lib/potholes-data.ts — loader del JSON de baches
- lib/geometry.ts — formula Haversine y calculo de distancias
- lib/fuel-calculator.ts — estimacion de consumo real en bolivianos
- lib/risk-analyzer.ts — analisis espacial con buffers Turf.js
- public/data/potholes.json — IMPORTANTE: reemplazar el archivo vacio con los 796 baches reales

### Persona 4 - Integracion y QA - PENDIENTE
Archivos a completar:
- app/layout.tsx — metadatos y estructura base
- app/globals.css — ya configurado con Leaflet CSS
- app/page.tsx — orquestador principal de estados y componentes

## Estructura de Carpetas: ruta-segura-scz/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   └── api/route/route.ts
├── components/
│   ├── Map.tsx
│   ├── MapWrapper.tsx
│   ├── RoutePanel.tsx
│   ├── RiskIndicator.tsx
│   ├── FuelEstimator.tsx
│   └── LoadingSpinner.tsx
├── lib/
│   ├── types.ts
│   ├── constants.ts
│   ├── fuel-calculator.ts
│   ├── risk-analyzer.ts
│   ├── potholes-data.ts
│   └── geometry.ts
└── public/data/
└── potholes.json

## Reglas de Git

- NO hacer push directo a main
- Cada persona trabaja en su rama: feature/mapa, feature/ui, feature/data, feature/integracion
- Pull Request obligatorio con aprobacion del equipo antes de fusionar

## Comandos

| Comando | Uso |
|---|---|
| npm run dev | Servidor local puerto 3000 |
| npm run build | Compilar para produccion |
| npm run lint | Revisar errores de codigo |