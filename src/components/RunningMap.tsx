import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GeoPoint } from '../lib/gpx';

interface RunningMapProps {
  route?: GeoPoint[];
  currentLocation?: GeoPoint | null;
  height?: string;
  interactive?: boolean;
  autoFit?: boolean;
}

export default function RunningMap({
  route = [],
  currentLocation = null,
  height = '320px',
  interactive = true,
  autoFit = true,
}: RunningMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const startMarkerRef = useRef<L.Marker | null>(null);
  const currentMarkerRef = useRef<L.Marker | null>(null);

  // Inicializar mapa
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Centro inicial: primera coordenada disponible o Bogotá por defecto (4.6097, -74.0817)
    const initialLat = currentLocation?.latitude || (route.length > 0 ? route[0].latitude : 4.6097);
    const initialLng = currentLocation?.longitude || (route.length > 0 ? route[0].longitude : -74.0817);

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 15,
      zoomControl: interactive,
      dragging: interactive,
      touchZoom: interactive,
      scrollWheelZoom: interactive ? 'center' : false,
      doubleClickZoom: interactive,
    });

    // Tiles oscuros CartoDB Dark Matter (100% gratuitos, sin API key, estética FitMax)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    // Timeout para asegurar que las dimensiones del contenedor se calculen correctamente
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Actualizar ruta y polilínea
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const latLngs: L.LatLngTuple[] = route.map((pt) => [pt.latitude, pt.longitude]);

    // Actualizar polilínea
    if (polylineRef.current) {
      polylineRef.current.setLatLngs(latLngs);
    } else if (latLngs.length > 0) {
      polylineRef.current = L.polyline(latLngs, {
        color: '#10b981', // Verde esmeralda neón
        weight: 5,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);
    }

    // Marcador de Inicio
    if (route.length > 0) {
      const startPoint = route[0];
      const startIcon = L.divIcon({
        className: 'start-marker-icon',
        html: `
          <div style="background-color: #10b981; width: 14px; height: 14px; border-radius: 50%; border: 2.5px solid #ffffff; box-shadow: 0 0 10px rgba(16, 185, 129, 0.8);"></div>
        `,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      if (startMarkerRef.current) {
        startMarkerRef.current.setLatLng([startPoint.latitude, startPoint.longitude]);
      } else {
        startMarkerRef.current = L.marker([startPoint.latitude, startPoint.longitude], {
          icon: startIcon,
        })
          .addTo(map)
          .bindTooltip('Inicio de Ruta', { direction: 'top', offset: [0, -6] });
      }
    }

    // Ajustar límites de vista si autoFit está activo
    if (autoFit && latLngs.length > 1) {
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 17 });
    }
  }, [route, autoFit]);

  // Actualizar marcador de posición actual / en vivo
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !currentLocation) return;

    const currentIcon = L.divIcon({
      className: 'live-gps-marker',
      html: `
        <div style="position: relative; width: 22px; height: 22px;">
          <div style="position: absolute; inset: 0; border-radius: 50%; background: rgba(56, 189, 248, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; inset: 3px; border-radius: 50%; background: #38bdf8; border: 2.5px solid #ffffff; box-shadow: 0 0 12px #38bdf8;"></div>
        </div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });

    if (currentMarkerRef.current) {
      currentMarkerRef.current.setLatLng([currentLocation.latitude, currentLocation.longitude]);
    } else {
      currentMarkerRef.current = L.marker([currentLocation.latitude, currentLocation.longitude], {
        icon: currentIcon,
        zIndexOffset: 1000,
      })
        .addTo(map)
        .bindTooltip('Tú (GPS en Vivo)', { direction: 'top', offset: [0, -10] });
    }

    // Si no hay ruta grabada todavía, centrar el mapa en la posición actual
    if (route.length <= 1) {
      map.setView([currentLocation.latitude, currentLocation.longitude], 16);
    }
  }, [currentLocation, route.length]);

  return (
    <div
      ref={mapContainerRef}
      style={{ height, width: '100%' }}
      className="rounded-2xl overflow-hidden border border-zinc-800 shadow-inner z-0"
    />
  );
}
