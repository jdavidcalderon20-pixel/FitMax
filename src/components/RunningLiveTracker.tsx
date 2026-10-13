import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  MapPin, 
  Timer, 
  Flame, 
  Navigation, 
  Download, 
  AlertCircle,
  X,
  Share2
} from 'lucide-react';
import { GeoPoint, calculateHaversineDistanceKm, generateGPXString, downloadGPXFile } from '../lib/gpx';
import { RunType, RUN_TYPES, calculatePace } from '../lib/running';
import RunningMap from './RunningMap';

interface RunningLiveTrackerProps {
  onSaveRun: (data: {
    distanceKm: number;
    durationMin: number;
    type: RunType;
    rpe: number;
    notes?: string;
    route: GeoPoint[];
  }) => void;
  onClose: () => void;
  onNotification?: (msg: string) => void;
}

export default function RunningLiveTracker({
  onSaveRun,
  onClose,
  onNotification,
}: RunningLiveTrackerProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [route, setRoute] = useState<GeoPoint[]>([]);
  const [currentLocation, setCurrentLocation] = useState<GeoPoint | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Formulario final para guardar
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [runType, setRunType] = useState<RunType>('facil');
  const [runRpe, setRunRpe] = useState<number>(5);
  const [runNotes, setRunNotes] = useState<string>('');

  const watchIdRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<any>(null);

  // Distancia total acumulada en km
  const totalDistanceKm = route.length >= 2
    ? route.reduce((acc, pt, idx) => {
        if (idx === 0) return 0;
        return acc + calculateHaversineDistanceKm(
          route[idx - 1].latitude,
          route[idx - 1].longitude,
          pt.latitude,
          pt.longitude
        );
      }, 0)
    : 0;

  // Ritmo en vivo (minutos por km)
  const durationMin = elapsedSeconds / 60;
  const currentPaceStr = calculatePace(totalDistanceKm, durationMin);

  // Manejo del cronómetro
  useEffect(() => {
    if (isTracking && !isPaused) {
      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds((sec) => sec + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTracking, isPaused]);

  // Iniciar geolocalización continua
  const startGps = () => {
    if (!('geolocation' in navigator)) {
      setGpsError('Tu navegador o dispositivo no soporta geolocalización GPS.');
      return;
    }

    setGpsError(null);
    setIsTracking(true);
    setIsPaused(false);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, altitude, accuracy } = position.coords;
        const newPoint: GeoPoint = {
          latitude,
          longitude,
          altitude: altitude ?? undefined,
          timestamp: position.timestamp || Date.now(),
        };

        setCurrentLocation(newPoint);
        setGpsAccuracy(Math.round(accuracy));

        // Solo agregar punto si no está en pausa y si tiene una precisión razonable (< 50m) o es el primero
        if (!isPaused) {
          setRoute((prev) => {
            if (prev.length === 0) return [newPoint];
            const last = prev[prev.length - 1];
            // Filtrar ruido: solo añadir si se ha movido al menos 3 metros
            const distKm = calculateHaversineDistanceKm(last.latitude, last.longitude, latitude, longitude);
            if (distKm * 1000 >= 3) {
              return [...prev, newPoint];
            }
            return prev;
          });
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError('Permiso de GPS denegado. Habilita la ubicación en tu navegador para rastrear tu ruta.');
        } else {
          setGpsError(`Error de señal GPS: ${err.message}`);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000,
      }
    );
  };

  const stopGps = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  };

  const handleFinishRun = () => {
    stopGps();
    setShowSummaryModal(true);
  };

  const handleConfirmSave = () => {
    const finalDistance = Math.max(0.1, Math.round(totalDistanceKm * 100) / 100);
    const finalDuration = Math.max(1, Math.round(elapsedSeconds / 60));

    onSaveRun({
      distanceKm: finalDistance,
      durationMin: finalDuration,
      type: runType,
      rpe: runRpe,
      notes: runNotes.trim() ? runNotes : undefined,
      route,
    });

    if (onNotification) {
      onNotification(`¡Carrera de ${finalDistance} km guardada con éxito en FitMax!`);
    }

    onClose();
  };

  const handleExportGPX = () => {
    if (route.length === 0) {
      alert('Aún no hay puntos GPS suficientes para exportar la ruta.');
      return;
    }
    const gpx = generateGPXString(`FitMax Running ${new Date().toLocaleDateString()}`, route);
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadGPXFile(`FitMax_Carrera_${dateStr}.gpx`, gpx);
    if (onNotification) {
      onNotification('¡Archivo GPX descargado! Puedes subirlo directamente a Strava.');
    }
  };

  // Formato mm:ss o hh:mm:ss
  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 animate-fadeIn">
      <div className="bg-zinc-950 text-white rounded-3xl w-full max-w-2xl border border-zinc-800 shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Cabecera */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Navigation className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base tracking-tight text-white flex items-center gap-2">
                Rastreo GPS en Vivo
                {isTracking && !isPaused && (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                )}
              </h3>
              <p className="text-[11px] text-zinc-400">
                {gpsAccuracy !== null ? `Precisión GPS: ±${gpsAccuracy}m` : 'Buscando satélites GPS...'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopGps();
              onClose();
            }}
            className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerta de error GPS */}
        {gpsError && (
          <div className="m-4 p-3 bg-red-950/60 border border-red-500/40 rounded-2xl flex items-start gap-2.5 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-300">Problema con el sensor GPS</p>
              <p className="text-[11px] text-red-200/90 mt-0.5">{gpsError}</p>
            </div>
          </div>
        )}

        {/* Dashboard de métricas en tiempo real */}
        <div className="p-4 sm:p-5 grid grid-cols-3 gap-2 sm:gap-3 bg-zinc-900/40 border-b border-zinc-800/60">
          <div className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800 text-center">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">
              Distancia
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
              {totalDistanceKm.toFixed(2)}
            </span>
            <span className="text-[10px] text-zinc-500 font-bold ml-1">km</span>
          </div>

          <div className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800 text-center">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">
              Tiempo
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-white tabular-nums">
              {formatTimer(elapsedSeconds)}
            </span>
          </div>

          <div className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800 text-center">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">
              Ritmo
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-sky-400">
              {currentPaceStr.replace('/km', '')}
            </span>
            <span className="text-[10px] text-zinc-500 font-bold ml-1">/km</span>
          </div>
        </div>

        {/* Mapa Interactivo Leaflet con OpenStreetMap */}
        <div className="p-4 sm:p-5 flex-1 overflow-hidden flex flex-col min-h-[260px]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mapa Satelital OSM Dark ({route.length} coordenadas)</span>
            </div>
            {route.length > 0 && (
              <button
                onClick={handleExportGPX}
                className="text-[11px] text-zinc-300 hover:text-white flex items-center gap-1 bg-zinc-800/80 hover:bg-zinc-700 px-2.5 py-1 rounded-lg border border-zinc-700 transition-colors"
                title="Descargar archivo GPX compatible con Strava"
              >
                <Download className="w-3 h-3 text-orange-400" />
                <span>GPX / Strava</span>
              </button>
            )}
          </div>

          <div className="flex-1 min-h-[220px] rounded-2xl overflow-hidden relative">
            <RunningMap
              route={route}
              currentLocation={currentLocation}
              height="100%"
              interactive={true}
              autoFit={true}
            />
          </div>
        </div>

        {/* Controles de Acción (Iniciar, Pausar, Finalizar) */}
        <div className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-900/80 flex items-center justify-center gap-3">
          {!isTracking ? (
            <button
              onClick={startGps}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-black rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all active:scale-[0.98]"
            >
              <Play className="w-5 h-5 fill-zinc-950" />
              <span>Iniciar Grabación GPS</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsPaused(!isPaused)}
                className={`flex-1 py-3.5 font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 border transition-all ${
                  isPaused
                    ? 'bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-500'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {isPaused ? (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Reanudar</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Pausar</span>
                  </>
                )}
              </button>

              <button
                onClick={handleFinishRun}
                className="flex-1 py-3.5 bg-red-600 hover:bg-red-500 text-white font-extrabold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-950 transition-all active:scale-[0.98]"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Terminar Carrera</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Modal Resumen al Terminar para Guardar en FitMax */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-zinc-900 text-white rounded-3xl max-w-md w-full p-6 border border-zinc-800 shadow-2xl">
            <h4 className="text-lg font-black tracking-tight text-white mb-1">
              ¡Entrenamiento Concluido! 🏁
            </h4>
            <p className="text-xs text-zinc-400 mb-4">
              Revisa los detalles para registrar la sesión en tu historial de FitMax:
            </p>

            <div className="grid grid-cols-2 gap-2 mb-4 bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-bold">Distancia:</span>
                <p className="text-lg font-black text-emerald-400">{totalDistanceKm.toFixed(2)} km</p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-bold">Tiempo:</span>
                <p className="text-lg font-black text-white">{formatTimer(elapsedSeconds)}</p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-bold">Ritmo Medio:</span>
                <p className="text-sm font-black text-sky-400">{currentPaceStr}</p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-bold">Puntos GPS:</span>
                <p className="text-sm font-bold text-zinc-300">{route.length} coords</p>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <div>
                <label className="text-[11px] font-bold text-zinc-300 mb-1 block">Tipo de sesión:</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {RUN_TYPES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setRunType(t.id)}
                      className={`p-2 rounded-xl text-left border text-xs transition-all ${
                        runType === t.id
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                          : 'bg-zinc-800/80 border-zinc-700 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-300 mb-1 flex justify-between">
                  <span>Esfuerzo Percibido (RPE):</span>
                  <span className="text-emerald-400 font-black">{runRpe} / 10</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={runRpe}
                  onChange={(e) => setRunRpe(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-300 mb-1 block">Notas opcionales:</label>
                <input
                  type="text"
                  placeholder="Ej: Buena sensación, terreno plano con viento..."
                  value={runNotes}
                  onChange={(e) => setRunNotes(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleConfirmSave}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-xl text-xs transition-all shadow-md"
              >
                Guardar en Historial FitMax
              </button>

              {route.length > 0 && (
                <button
                  onClick={handleExportGPX}
                  className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-orange-400 font-bold rounded-xl text-xs border border-zinc-700 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar Archivo GPX para Strava</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
