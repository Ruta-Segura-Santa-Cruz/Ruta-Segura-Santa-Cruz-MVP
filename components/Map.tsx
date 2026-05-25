'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapProps {
  onMapClick: (latlng: { lat: number; lng: number }) => void;
  origin: { lat: number; lng: number } | null;
  destination: { lat: number; lng: number } | null;
  route: import('@/lib/types').RouteGeoJSON | null;
  riskLevel: 'Bajo' | 'Medio' | 'Alto' | 'Muy Alto';
  isLoading: boolean;
}

interface Pothole {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'fixed';
  region_slug: string;
  created_at: string;
}

function getSeverityColor(severity: Pothole['severity']): string {
  switch (severity) {
    case 'low':      return '#22c55e';
    case 'medium':   return '#eab308';
    case 'high':     return '#f97316';
    case 'critical': return '#ef4444';
    default:         return '#94a3b8';
  }
}

function getRouteColor(riskLevel: MapProps['riskLevel']): string {
  switch (riskLevel) {
    case 'Bajo':     return '#22c55e';
    case 'Medio':    return '#eab308';
    case 'Alto':     return '#f97316';
    case 'Muy Alto': return '#ef4444';
    default:         return '#3b82f6';
  }
}

function createCircleIcon(color: string, size = 10): L.DivIcon {
  return L.divIcon({
    className: '',
    html: '<div style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:' + color + ';border:2px solid rgba(255,255,255,0.7);box-shadow:0 0 6px ' + color + ';"></div>',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function createPinIcon(color: string, label: string): L.DivIcon {
  return L.divIcon({
    className: '',
    html: '<div style="position:relative;display:flex;flex-direction:column;align-items:center;"><div style="background:' + color + ';color:#fff;font-weight:700;font-size:10px;font-family:monospace;padding:3px 7px;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,0.5);white-space:nowrap;">' + label + '</div><div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:8px solid ' + color + ';margin-top:-1px;"></div></div>',
    iconSize: [60, 36],
    iconAnchor: [30, 36],
    popupAnchor: [0, -38],
  });
}

export default function Map({ onMapClick, origin, destination, route, riskLevel, isLoading }: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef          = useRef<L.Map | null>(null);
  const routeLayerRef   = useRef<L.GeoJSON | null>(null);
  const originMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef   = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;
    const map = L.map(mapContainerRef.current, {
      center: [-17.7833, -63.1821],
      zoom: 12,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;

    fetch('/data/potholes.json')
      .then((res) => res.json())
      .then((potholes: Pothole[]) => {
        potholes.forEach((p) => {
          if (!p.latitude || !p.longitude) return;
          const color = getSeverityColor(p.severity);
          const icon  = createCircleIcon(color, p.severity === 'critical' ? 13 : 9);
          const fecha = p.created_at ? new Date(p.created_at).toLocaleDateString('es-BO') : 'Sin fecha';
          L.marker([p.latitude, p.longitude], { icon })
            .bindPopup('<div style="font-family:monospace;"><strong>' + (p.title || 'Bache') + '</strong><br/>Severidad: ' + p.severity + '<br/>Estado: ' + (p.status === 'fixed' ? 'Reparado' : 'Sin reparar') + '<br/><small>' + fecha + '</small></div>')
            .addTo(map);
        });
      })
      .catch(() => console.warn('No se pudo cargar potholes.json'));

    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const handleClick = (e: L.LeafletMouseEvent) => onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    map.on('click', handleClick);
    return () => { map.off('click', handleClick); };
  }, [onMapClick]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (originMarkerRef.current) { map.removeLayer(originMarkerRef.current); originMarkerRef.current = null; }
    if (origin) {
      const m = L.marker([origin.lat, origin.lng], { icon: createPinIcon('#16a34a', 'Origen') }).addTo(map);
      m.bindPopup('Origen: ' + origin.lat.toFixed(5) + ', ' + origin.lng.toFixed(5));
      originMarkerRef.current = m;
    }
  }, [origin]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (destMarkerRef.current) { map.removeLayer(destMarkerRef.current); destMarkerRef.current = null; }
    if (destination) {
      const m = L.marker([destination.lat, destination.lng], { icon: createPinIcon('#dc2626', 'Destino') }).addTo(map);
      m.bindPopup('Destino: ' + destination.lat.toFixed(5) + ', ' + destination.lng.toFixed(5));
      destMarkerRef.current = m;
    }
  }, [destination]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (routeLayerRef.current) { map.removeLayer(routeLayerRef.current); routeLayerRef.current = null; }
    if (!route) return;
    const color = getRouteColor(riskLevel);
    const layer = L.geoJSON(route, { style: { color, weight: 5, opacity: 0.9 } }).addTo(map);
    routeLayerRef.current = layer;
    const bounds = layer.getBounds();
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [40, 40] });
  }, [route, riskLevel]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      {isLoading && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <span style={{ color: '#e2e8f0', fontFamily: 'monospace', padding: '10px 20px', background: 'rgba(30,41,59,0.9)', borderRadius: '8px' }}>
            Calculando ruta...
          </span>
        </div>
      )}
      <div style={{ position: 'absolute', bottom: '24px', right: '12px', zIndex: 999, background: 'rgba(15,23,42,0.88)', border: '1px solid rgba(148,163,184,0.25)', borderRadius: '10px', padding: '10px 14px', fontFamily: 'monospace', fontSize: '11px', color: '#cbd5e1', pointerEvents: 'none' }}>
        <div style={{ fontWeight: 700, marginBottom: '6px', color: '#f1f5f9' }}>SEVERIDAD BACHES</div>
        {(['low','medium','high','critical'] as const).map((s) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '3px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: getSeverityColor(s), flexShrink: 0 }} />
            <span>{{ low:'Leve', medium:'Moderado', high:'Alto', critical:'Critico' }[s]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}