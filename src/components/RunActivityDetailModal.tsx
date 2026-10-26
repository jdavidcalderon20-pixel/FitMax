import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Download, 
  Share2, 
  Calendar, 
  Clock, 
  Zap, 
  Flame, 
  Gauge, 
  Award, 
  Layers,
  Sparkles
} from 'lucide-react';
import { RunLog, calculatePace, RUN_TYPES } from '../lib/running';
import { GeoPoint, generateGPXString, downloadGPXFile, calculateHaversineDistanceKm } from '../lib/gpx';
import RunningMap from './RunningMap';

interface RunActivityDetailModalProps {
  log: RunLog;
  nickname: string;
  onClose: () => void;
  onNotification?: (msg: string) => void;
}

export default function RunActivityDetailModal({
  log,
  nickname,
  onClose,
  onNotification,
}: RunActivityDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'social'>('details');
  const [socialAspect, setSocialAspect] = useState<'story' | 'post'>('story'); // story: 9:16, post: 4:5
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const durationMin = log.durationMin;
  const distanceKm = log.distanceKm;
  const paceStr = calculatePace(distanceKm, durationMin);
  const typeObj = RUN_TYPES.find((t) => t.id === log.type);
  const typeLabel = typeObj ? typeObj.label : log.type;

  // Formato de duración legible (soporta segundos)
  const formatDurationDisplay = (min: number) => {
    const totalSec = Math.round(min * 60);
    if (totalSec < 60) return `${totalSec} seg`;
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return s > 0 ? `${m}m ${s}s` : `${m} min`;
  };

  // Calorías estimadas (~65 kcal por km promedio)
  const estCalories = Math.round(distanceKm * 68);

  // Calcular splits si hay coordenadas GPS
  const route = log.route || [];
  const splits: { km: number; pace: string; timeSec: number }[] = [];
  if (route.length >= 2) {
    let accumulatedKm = 0;
    let splitStartSec = 0;
    let currentKmTarget = 1;
    const baseTime = route[0].timestamp || 0;

    for (let i = 1; i < route.length; i++) {
      const d = calculateHaversineDistanceKm(
        route[i - 1].latitude,
        route[i - 1].longitude,
        route[i].latitude,
        route[i].longitude
      );
      accumulatedKm += d;

      if (accumulatedKm >= currentKmTarget) {
        const curTime = (route[i].timestamp || 0) - baseTime;
        const curTimeSec = Math.max(1, Math.round(curTime / 1000));
        const deltaSec = curTimeSec - splitStartSec;
        splitStartSec = curTimeSec;
        const splitMins = deltaSec / 60;
        splits.push({
          km: currentKmTarget,
          pace: calculatePace(1, splitMins),
          timeSec: deltaSec,
        });
        currentKmTarget++;
      }
    }
  }

  // Exportar GPX
  const handleDownloadGPX = () => {
    if (!route || route.length === 0) {
      if (onNotification) onNotification('Esta sesión no contiene coordenadas GPS.');
      return;
    }
    const dateStr = new Date(log.date).toISOString().slice(0, 10);
    const gpx = generateGPXString(`FitMax Carrera ${dateStr}`, route);
    downloadGPXFile(`FitMax_Carrera_${dateStr}_${distanceKm}km.gpx`, gpx);
    if (onNotification) onNotification('¡Archivo GPX descargado para Strava!');
  };

  // Dibujar Tarjeta Deportiva en Canvas para Redes
  useEffect(() => {
    if (activeTab !== 'social' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1080;
    const height = socialAspect === 'story' ? 1920 : 1350;
    canvas.width = width;
    canvas.height = height;

    // 1. Fondo Degradado Premium Oscuro
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#0D1117');
    grad.addColorStop(0.5, '#161B22');
    grad.addColorStop(1, '#090D12');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // 2. Grilla sutil deportiva y acentos de luz
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Glow verde esmeralda superior e inferior
    const glowTop = ctx.createRadialGradient(width / 2, 0, 10, width / 2, 0, 600);
    glowTop.addColorStop(0, 'rgba(31, 208, 138, 0.18)');
    glowTop.addColorStop(1, 'rgba(31, 208, 138, 0)');
    ctx.fillStyle = glowTop;
    ctx.fillRect(0, 0, width, 600);

    // 3. Header: Brand FitMax Running
    ctx.fillStyle = '#1FD08A';
    ctx.font = '900 36px "Montserrat", -apple-system, sans-serif';
    ctx.letterSpacing = '6px';
    ctx.fillText('FITMAX RUNNING', 80, 130);

    ctx.fillStyle = '#A8B0BB';
    ctx.font = '700 24px -apple-system, sans-serif';
    ctx.letterSpacing = '2px';
    const dateFormatted = new Date(log.date).toLocaleDateString('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).toUpperCase();
    ctx.fillText(`ATLETA: ${nickname.toUpperCase()}  |  ${dateFormatted}`, 80, 180);

    // 4. Distancia Gigante Neón
    ctx.fillStyle = '#F4F2ED';
    ctx.font = '900 160px -apple-system, sans-serif';
    ctx.letterSpacing = '-2px';
    const distText = distanceKm.toFixed(2);
    ctx.fillText(distText, 80, 360);

    const distWidth = ctx.measureText(distText).width;
    ctx.fillStyle = '#1FD08A';
    ctx.font = '900 48px -apple-system, sans-serif';
    ctx.fillText('KM', 80 + distWidth + 24, 340);

    // 5. Barra de Métricas Clave (Pace, Tiempo, RPE, Calorías)
    const metricsY = 430;
    const boxW = (width - 160 - 45) / 4;
    const metricsData = [
      { label: 'RITMO MEDIO', value: paceStr.replace('/km', ''), unit: '/km', color: '#38BDF8' },
      { label: 'TIEMPO TOTAL', value: formatDurationDisplay(durationMin), unit: '', color: '#F4F2ED' },
      { label: 'ESFUERZO RPE', value: `${log.rpe}`, unit: '/10', color: '#FB923C' },
      { label: 'CALORÍAS EST.', value: `${estCalories}`, unit: 'kcal', color: '#1FD08A' },
    ];

    metricsData.forEach((m, idx) => {
      const bx = 80 + idx * (boxW + 15);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(bx, metricsY, boxW, 110, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#8E99A8';
      ctx.font = '800 16px -apple-system, sans-serif';
      ctx.letterSpacing = '1px';
      ctx.fillText(m.label, bx + 18, metricsY + 38);

      ctx.fillStyle = m.color;
      ctx.font = '900 32px -apple-system, sans-serif';
      ctx.fillText(m.value, bx + 18, metricsY + 84);
      if (m.unit) {
        const valW = ctx.measureText(m.value).width;
        ctx.font = '700 16px -apple-system, sans-serif';
        ctx.fillStyle = '#8E99A8';
        ctx.fillText(m.unit, bx + 18 + valW + 6, metricsY + 84);
      }
    });

    // 6. Trazado de Ruta GPS en Canvas (Proyección 2D Normalizada)
    const mapY = metricsY + 160;
    const mapH = height - mapY - 220;
    const mapW = width - 160;

    ctx.fillStyle = 'rgba(20, 26, 34, 0.7)';
    ctx.strokeStyle = 'rgba(31, 208, 138, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(80, mapY, mapW, mapH, 24);
    ctx.fill();
    ctx.stroke();

    if (route && route.length >= 2) {
      // Calcular bounding box de coordenadas
      let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
      route.forEach((pt) => {
        if (pt.latitude < minLat) minLat = pt.latitude;
        if (pt.latitude > maxLat) maxLat = pt.latitude;
        if (pt.longitude < minLng) minLng = pt.longitude;
        if (pt.longitude > maxLng) maxLng = pt.longitude;
      });

      const latSpan = Math.max(0.0001, maxLat - minLat);
      const lngSpan = Math.max(0.0001, maxLng - minLng);
      const padding = 70;
      const plotW = mapW - padding * 2;
      const plotH = mapH - padding * 2;

      // Mantener aspect ratio geográfico aproximado
      const scaleX = plotW / lngSpan;
      const scaleY = plotH / latSpan;
      const scale = Math.min(scaleX, scaleY);

      const offsetX = 80 + padding + (plotW - lngSpan * scale) / 2;
      const offsetY = mapY + padding + (plotH - latSpan * scale) / 2;

      const project = (lat: number, lng: number) => {
        const x = offsetX + (lng - minLng) * scale;
        const y = offsetY + (maxLat - lat) * scale;
        return { x, y };
      };

      // Dibujar resplandor de la ruta
      ctx.shadowColor = '#1FD08A';
      ctx.shadowBlur = 25;
      ctx.strokeStyle = '#1FD08A';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      route.forEach((pt, idx) => {
        const p = project(pt.latitude, pt.longitude);
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();

      // Reset sombra
      ctx.shadowBlur = 0;

      // Marcador de salida (verde)
      const pStart = project(route[0].latitude, route[0].longitude);
      ctx.fillStyle = '#10B981';
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(pStart.x, pStart.y, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Marcador de meta (naranja neón)
      const pEnd = project(route[route.length - 1].latitude, route[route.length - 1].longitude);
      ctx.fillStyle = '#FB923C';
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(pEnd.x, pEnd.y, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      // Sesión en cinta o sin GPS
      ctx.fillStyle = '#8E99A8';
      ctx.font = '700 28px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🏃 MODO CINTA / ENTRENAMIENTO AERÓBICO', width / 2, mapY + mapH / 2);
      ctx.font = '500 20px -apple-system, sans-serif';
      ctx.fillText('Sesión registrada en FitMax Intelligent Trainer', width / 2, mapY + mapH / 2 + 45);
      ctx.textAlign = 'left';
    }

    // 7. Footer: Badge de tipo y llamada a la acción
    const footerY = height - 100;
    ctx.fillStyle = '#1FD08A';
    ctx.font = '900 24px -apple-system, sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText(`ENTRENAMIENTO: ${typeLabel.toUpperCase()}`, 80, footerY);

    ctx.fillStyle = '#8E99A8';
    ctx.font = '600 20px -apple-system, sans-serif';
    ctx.letterSpacing = '1px';
    ctx.fillText('FITMAX INTELLIGENT TRAINING SYSTEM', 80, footerY + 35);

  }, [activeTab, socialAspect, log, nickname]);

  // Descargar la tarjeta PNG
  const handleDownloadCard = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    const dateStr = new Date(log.date).toISOString().slice(0, 10);
    link.download = `FitMax_Story_${dateStr}_${distanceKm}km.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    if (onNotification) onNotification('¡Tarjeta deportiva descargada en alta resolución para Instagram / WhatsApp!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 animate-fadeIn">
      <div className="bg-[#15181D] text-white rounded-3xl w-full max-w-3xl border border-[#282F38] shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Cabecera */}
        <div className="p-4 sm:p-5 border-b border-[#282F38] flex items-center justify-between bg-[#20252C]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1FD08A]/15 border border-[#1FD08A]/30 flex items-center justify-center text-[#1FD08A]">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#1FD08A] bg-[#1FD08A]/10 border border-[#1FD08A]/20 px-2 py-0.5 rounded-full">
                  {typeLabel}
                </span>
                <span className="text-xs text-[#A8B0BB] font-bold">
                  {new Date(log.date).toLocaleDateString('es-CO', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#F4F2ED] mt-0.5">
                Resumen de Actividad ({distanceKm} km)
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#282F38] rounded-xl text-[#A8B0BB] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Selector de Pestañas: [Detalles & Mapa] | [Compartir en Redes 📸] */}
        <div className="flex items-center gap-2 p-2.5 bg-[#15181D] border-b border-[#282F38]">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
              activeTab === 'details'
                ? 'bg-[#20252C] text-[#1FD08A] border border-[#282F38]'
                : 'text-[#A8B0BB] hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Métricas y Trazado GPS</span>
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
              activeTab === 'social'
                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-[#1FD08A] border border-emerald-500/40'
                : 'text-[#A8B0BB] hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Generar Tarjeta para Redes 📲</span>
          </button>
        </div>

        {/* CONTENIDO PESTAÑA 1: DETALLES Y MAPA */}
        {activeTab === 'details' && (
          <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4">
            {/* Grid 4 Métricas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-[#20252C] p-3 rounded-2xl border border-[#282F38]">
                <span className="text-[10px] font-bold text-[#A8B0BB] uppercase block">Distancia</span>
                <span className="text-xl sm:text-2xl font-black text-[#1FD08A]">{distanceKm}</span>
                <span className="text-xs text-[#A8B0BB] font-bold ml-1">km</span>
              </div>
              <div className="bg-[#20252C] p-3 rounded-2xl border border-[#282F38]">
                <span className="text-[10px] font-bold text-[#A8B0BB] uppercase block">Duración</span>
                <span className="text-xl sm:text-2xl font-black text-white">{formatDurationDisplay(durationMin)}</span>
              </div>
              <div className="bg-[#20252C] p-3 rounded-2xl border border-[#282F38]">
                <span className="text-[10px] font-bold text-[#A8B0BB] uppercase block">Ritmo Medio</span>
                <span className="text-xl sm:text-2xl font-black text-sky-400">{paceStr.replace('/km', '')}</span>
                <span className="text-xs text-[#A8B0BB] font-bold ml-1">/km</span>
              </div>
              <div className="bg-[#20252C] p-3 rounded-2xl border border-[#282F38]">
                <span className="text-[10px] font-bold text-[#A8B0BB] uppercase block">Esfuerzo RPE</span>
                <span className="text-xl sm:text-2xl font-black text-orange-400">{log.rpe}</span>
                <span className="text-xs text-[#A8B0BB] font-bold ml-1">/10</span>
              </div>
            </div>

            {/* Mapa Interactivo Leaflet */}
            <div className="bg-[#20252C] border border-[#282F38] rounded-2xl overflow-hidden p-3 space-y-2">
              <div className="flex items-center justify-between text-xs text-[#A8B0BB]">
                <span className="font-bold flex items-center gap-1.5 text-white">
                  <MapPin className="w-3.5 h-3.5 text-[#1FD08A]" />
                  Trazado Satelital ({route.length} coordenadas)
                </span>
                {route.length > 0 && (
                  <button
                    onClick={handleDownloadGPX}
                    className="text-[11px] bg-[#15181D] hover:bg-[#282F38] text-orange-400 px-3 py-1.5 rounded-xl border border-[#282F38] font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar GPX para Strava</span>
                  </button>
                )}
              </div>
              <div className="h-[260px] sm:h-[300px] rounded-xl overflow-hidden">
                <RunningMap route={route} height="100%" interactive={true} autoFit={true} />
              </div>
            </div>

            {/* Splits por Kilómetro */}
            {splits.length > 0 && (
              <div className="bg-[#20252C] border border-[#282F38] rounded-2xl p-4 space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#F4F2ED] block">
                  Tiempos Parciales por Kilómetro (Splits)
                </span>
                <div className="divide-y divide-[#282F38]">
                  {splits.map((s) => (
                    <div key={s.km} className="py-2 flex items-center justify-between text-xs">
                      <span className="font-bold text-white">Km {s.km}</span>
                      <span className="font-mono text-[#1FD08A] font-bold">{s.pace}</span>
                      <span className="text-[#A8B0BB] font-mono">
                        {Math.floor(s.timeSec / 60)}:{(s.timeSec % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {log.notes && (
              <div className="bg-[#20252C] border border-[#282F38] rounded-2xl p-3.5 text-xs text-zinc-300">
                <span className="text-[10px] font-black uppercase text-[#A8B0BB] block mb-1">Notas del atleta:</span>
                <p>{log.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* CONTENIDO PESTAÑA 2: CREADOR DE TARJETAS SOCIALES */}
        {activeTab === 'social' && (
          <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4 flex flex-col items-center">
            {/* Controles de aspecto: Historia 9:16 vs Post 4:5 */}
            <div className="flex items-center gap-2 self-center bg-[#20252C] p-1 rounded-xl border border-[#282F38]">
              <button
                onClick={() => setSocialAspect('story')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  socialAspect === 'story'
                    ? 'bg-[#1FD08A] text-[#15181D]'
                    : 'text-[#A8B0BB] hover:text-white'
                }`}
              >
                📱 Historia (9:16)
              </button>
              <button
                onClick={() => setSocialAspect('post')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  socialAspect === 'post'
                    ? 'bg-[#1FD08A] text-[#15181D]'
                    : 'text-[#A8B0BB] hover:text-white'
                }`}
              >
                📸 Post (4:5)
              </button>
            </div>

            {/* Vista Previa del Canvas escalado */}
            <div className="relative rounded-2xl overflow-hidden border border-[#282F38] shadow-2xl max-w-xs sm:max-w-sm w-full bg-black flex justify-center">
              <canvas
                ref={canvasRef}
                className="w-full h-auto object-contain rounded-2xl"
                style={{ maxHeight: '420px' }}
              />
            </div>

            <p className="text-[11px] text-[#A8B0BB] text-center max-w-sm">
              Genera una tarjeta gráfica de alto impacto con tu trazado GPS y métricas para compartir directamente en tus estados o historias.
            </p>

            <button
              onClick={handleDownloadCard}
              className="w-full max-w-sm py-3.5 bg-gradient-to-r from-[#1FD08A] to-teal-400 hover:from-[#1ab87a] hover:to-teal-300 text-[#15181D] font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Tarjeta en Alta Resolución</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
