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
  Volume2,
  VolumeX,
  Radio,
  Activity,
  CheckCircle2
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
  const [isIndoor, setIsIndoor] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [route, setRoute] = useState<GeoPoint[]>([]);
  const [currentLocation, setCurrentLocation] = useState<GeoPoint | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'searching' | 'ready' | 'error' | 'indoor'>('searching');

  // Audio Coach (Web Speech API)
  const [voiceCoachEnabled, setVoiceCoachEnabled] = useState<boolean>(true);
  const lastAnnouncedKmRef = useRef<number>(0);
  const lastSplitTimeRef = useRef<number>(0);

  // Formulario final para guardar
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [runType, setRunType] = useState<RunType>('facil');
  const [runRpe, setRunRpe] = useState<number>(5);
  const [runNotes, setRunNotes] = useState<string>('');
  const [manualDistanceStr, setManualDistanceStr] = useState<string>('');

  const watchIdRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<any>(null);

  // Sintetizador de voz en español para el Audio Coach
  const speakCoach = (text: string) => {
    if (!voiceCoachEnabled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
    }
  };

  // Semáforo GPS Pre-arranque: sondea señal al montar
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setGpsError('Tu dispositivo no soporta geolocalización.');
      setGpsStatus('error');
      return;
    }

    setGpsStatus('searching');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setCurrentLocation({
          latitude,
          longitude,
          timestamp: pos.timestamp || Date.now(),
        });
        setGpsAccuracy(Math.round(accuracy));
        setGpsStatus('ready');
        setGpsError(null);
      },
      (err) => {
        console.warn('Pre-GPS check:', err);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError('Permiso GPS denegado. Puedes usar el Modo Cinta sin GPS.');
        } else {
          setGpsError('Buscando satélites... Sal a cielo abierto para mejor señal.');
        }
        setGpsStatus('error');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

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

  // Detección de Splits por km y avisos por voz
  useEffect(() => {
    if (!isTracking || isPaused || isIndoor) return;
    const currentWholeKm = Math.floor(totalDistanceKm);
    if (currentWholeKm > lastAnnouncedKmRef.current && currentWholeKm >= 1) {
      const splitTimeSec = elapsedSeconds - lastSplitTimeRef.current;
      lastSplitTimeRef.current = elapsedSeconds;
      lastAnnouncedKmRef.current = currentWholeKm;

      const splitMins = Math.floor(splitTimeSec / 60);
      const splitSecs = splitTimeSec % 60;
      speakCoach(`Kilómetro ${currentWholeKm} completado. Ritmo de split: ${splitMins} minutos y ${splitSecs} segundos.`);

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  }, [totalDistanceKm, isTracking, isPaused, isIndoor, elapsedSeconds]);

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

  // Iniciar geolocalización continua GPS
  const startGps = () => {
    if (!('geolocation' in navigator)) {
      setGpsError('Tu dispositivo no soporta geolocalización.');
      return;
    }

    setGpsError(null);
    setIsTracking(true);
    setIsPaused(false);
    setIsIndoor(false);
    setGpsStatus('ready');

    speakCoach('Grabación GPS iniciada. ¡Buen entrenamiento!');
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([150]);
    }

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

        if (!isPaused) {
          setRoute((prev) => {
            if (prev.length === 0) return [newPoint];
            const last = prev[prev.length - 1];
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
        setGpsError(`Error GPS: ${err.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000,
      }
    );
  };

  // Iniciar Modo Cinta / Interior (sin GPS)
  const startIndoor = () => {
    setIsTracking(true);
    setIsPaused(false);
    setIsIndoor(true);
    setGpsStatus('indoor');
    speakCoach('Modo Cinta iniciado. ¡A sumar kilómetros!');
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([150]);
    }
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  };

  const handlePauseResume = () => {
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);
    if (nextPaused) {
      speakCoach('Entrenamiento pausado.');
    } else {
      speakCoach('Entrenamiento reanudado.');
    }
  };

  const handleFinishRun = () => {
    stopTracking();
    speakCoach('¡Entrenamiento finalizado! Gran trabajo.');
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 400]);
    }
    // Inicializar distancia manual con la del GPS si existe
    setManualDistanceStr(totalDistanceKm > 0 ? totalDistanceKm.toFixed(2) : '');
    setShowSummaryModal(true);
  };

  const handleConfirmSave = () => {
    const manualDist = parseFloat(manualDistanceStr.replace(',', '.'));
    const finalDistance = !isNaN(manualDist) && manualDist > 0
      ? Math.round(manualDist * 100) / 100
      : Math.max(0.01, Math.round(totalDistanceKm * 100) / 100);

    // Duración exacta sin redondear hacia arriba 20s a 1 minuto
    const finalDuration = Number((elapsedSeconds / 60).toFixed(2));

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
      onNotification('¡Archivo GPX descargado! Listo para Strava.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 animate-fadeIn">
      <div className="bg-[#15181D] text-white rounded-3xl w-full max-w-2xl border border-[#282F38] shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Cabecera con Semáforo GPS y Audio Coach */}
        <div className="p-4 sm:p-5 border-b border-[#282F38] flex items-center justify-between bg-[#20252C]">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center border transition-all ${
              gpsStatus === 'ready'
                ? 'bg-[#1FD08A]/15 border-[#1FD08A]/40 text-[#1FD08A]'
                : gpsStatus === 'indoor'
                ? 'bg-sky-500/15 border-sky-500/40 text-sky-400'
                : gpsStatus === 'error'
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                : 'bg-zinc-800 border-zinc-700 text-zinc-400'
            }`}>
              {isIndoor ? (
                <Activity className="w-5 h-5 text-sky-400 animate-pulse" />
              ) : (
                <Radio className={`w-5 h-5 ${isTracking ? 'animate-pulse' : ''}`} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-[#F4F2ED]">
                  {isIndoor ? 'Modo Cinta / Indoor' : 'Rastreo GPS en Vivo'}
                </h3>
                {isTracking && !isPaused && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1FD08A] animate-ping inline-block" />
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                {isIndoor ? (
                  <span className="text-[11px] text-sky-400 font-bold">Sin GPS · Cronómetro activo</span>
                ) : gpsStatus === 'ready' ? (
                  <span className="text-[11px] text-[#1FD08A] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#1FD08A]" />
                    GPS Conectado {gpsAccuracy !== null ? `(±${gpsAccuracy}m)` : ''}
                  </span>
                ) : gpsStatus === 'searching' ? (
                  <span className="text-[11px] text-amber-400 font-medium flex items-center gap-1 animate-pulse">
                    <Radio className="w-3 h-3" />
                    Buscando satélites...
                  </span>
                ) : (
                  <span className="text-[11px] text-zinc-400">Listo para iniciar</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Audio Coach */}
            <button
              onClick={() => {
                const nextState = !voiceCoachEnabled;
                setVoiceCoachEnabled(nextState);
                if (nextState) {
                  speakCoach('Audio coach activado.');
                }
              }}
              className={`p-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                voiceCoachEnabled
                  ? 'bg-[#1FD08A]/10 border-[#1FD08A]/30 text-[#1FD08A]'
                  : 'bg-[#20252C] border-[#282F38] text-zinc-500 hover:text-white'
              }`}
              title={voiceCoachEnabled ? 'Audio coach activado' : 'Audio coach silenciado'}
            >
              {voiceCoachEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{voiceCoachEnabled ? 'Coach' : 'Mudo'}</span>
            </button>

            <button
              onClick={() => {
                stopTracking();
                onClose();
              }}
              className="p-2 hover:bg-[#282F38] rounded-xl text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Alerta de error GPS */}
        {gpsError && !isIndoor && (
          <div className="m-4 p-3 bg-amber-950/40 border border-amber-500/30 rounded-2xl flex items-start gap-2.5 text-xs text-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-amber-300">Aviso de señal GPS</p>
              <p className="text-[11px] text-amber-200/90 mt-0.5">{gpsError}</p>
            </div>
            {!isTracking && (
              <button
                onClick={startIndoor}
                className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-[10px] font-black shrink-0 transition-all"
              >
                Usar Cinta
              </button>
            )}
          </div>
        )}

        {/* Dashboard de métricas en tiempo real */}
        <div className="p-4 sm:p-5 grid grid-cols-3 gap-2 sm:gap-3 bg-[#15181D] border-b border-[#282F38]">
          <div className="bg-[#20252C] p-3 rounded-2xl border border-[#282F38] text-center">
            <span className="text-[10px] font-bold text-[#A8B0BB] uppercase tracking-wider block mb-0.5">
              Distancia
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-[#1FD08A]">
              {totalDistanceKm.toFixed(2)}
            </span>
            <span className="text-[10px] text-zinc-500 font-bold ml-1">km</span>
          </div>

          <div className="bg-[#20252C] p-3 rounded-2xl border border-[#282F38] text-center">
            <span className="text-[10px] font-bold text-[#A8B0BB] uppercase tracking-wider block mb-0.5">
              Tiempo
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-[#F4F2ED] tabular-nums">
              {formatTimer(elapsedSeconds)}
            </span>
          </div>

          <div className="bg-[#20252C] p-3 rounded-2xl border border-[#282F38] text-center">
            <span className="text-[10px] font-bold text-[#A8B0BB] uppercase tracking-wider block mb-0.5">
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
              <MapPin className="w-3.5 h-3.5 text-[#1FD08A]" />
              <span>
                {isIndoor ? 'Sesión en cinta (sin coordenadas GPS)' : `Mapa Satelital (${route.length} coordenadas)`}
              </span>
            </div>
            {route.length > 0 && (
              <button
                onClick={handleExportGPX}
                className="text-[11px] text-zinc-300 hover:text-white flex items-center gap-1 bg-[#20252C] hover:bg-[#282F38] px-2.5 py-1 rounded-xl border border-[#282F38] transition-colors"
                title="Descargar archivo GPX compatible con Strava"
              >
                <Download className="w-3 h-3 text-orange-400" />
                <span>GPX Strava</span>
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

        {/* Controles de Acción (Iniciar GPS, Cinta, Pausar, Finalizar) */}
        <div className="p-4 sm:p-5 border-t border-[#282F38] bg-[#20252C] flex items-center justify-center gap-3">
          {!isTracking ? (
            <div className="w-full flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={startGps}
                className="flex-1 py-3.5 bg-gradient-to-r from-[#1FD08A] to-teal-400 hover:from-[#1ab87a] hover:to-teal-300 text-[#15181D] font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all active:scale-[0.98] cursor-pointer"
              >
                <Play className="w-4 h-4 fill-[#15181D]" />
                <span>Iniciar Grabación GPS ✅</span>
              </button>
              <button
                onClick={startIndoor}
                className="py-3.5 px-4 bg-[#15181D] hover:bg-[#282F38] text-sky-300 border border-sky-500/30 font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Activity className="w-4 h-4 text-sky-400" />
                <span>Iniciar sin GPS (Cinta)</span>
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={handlePauseResume}
                className={`flex-1 py-3.5 font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  isPaused
                    ? 'bg-[#1FD08A] border-[#1FD08A] text-[#15181D] hover:bg-[#1ab87a]'
                    : 'bg-[#15181D] border-[#282F38] text-zinc-300 hover:bg-[#282F38]'
                }`}
              >
                {isPaused ? (
                  <>
                    <Play className="w-4 h-4 fill-[#15181D]" />
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
                className="flex-1 py-3.5 bg-red-600 hover:bg-red-500 text-white font-extrabold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-950 transition-all active:scale-[0.98] cursor-pointer"
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
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#15181D] text-white rounded-3xl max-w-md w-full p-6 border border-[#282F38] shadow-2xl">
            <h4 className="text-lg font-black tracking-tight text-[#F4F2ED] mb-1">
              ¡Entrenamiento Concluido! 🏁
            </h4>
            <p className="text-xs text-[#A8B0BB] mb-4">
              Revisa los detalles para registrar la sesión en tu historial de FitMax:
            </p>

            <div className="grid grid-cols-2 gap-2 mb-4 bg-[#20252C] p-3.5 rounded-2xl border border-[#282F38]">
              <div>
                <span className="text-[10px] text-[#A8B0BB] uppercase font-bold">Distancia:</span>
                <p className="text-lg font-black text-[#1FD08A]">
                  {manualDistanceStr || totalDistanceKm.toFixed(2)} km
                </p>
              </div>
              <div>
                <span className="text-[10px] text-[#A8B0BB] uppercase font-bold">Tiempo:</span>
                <p className="text-lg font-black text-white">
                  {elapsedSeconds < 60
                    ? `${elapsedSeconds} seg`
                    : `${Math.floor(elapsedSeconds / 60)} min ${elapsedSeconds % 60} seg`}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-[#A8B0BB] uppercase font-bold">Ritmo Medio:</span>
                <p className="text-sm font-black text-sky-400">{currentPaceStr}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#A8B0BB] uppercase font-bold">Modo:</span>
                <p className="text-sm font-bold text-zinc-300">
                  {isIndoor ? 'Cinta / Interior' : `${route.length} coords GPS`}
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              {/* Opción de ajustar distancia si fue en cinta */}
              <div>
                <label className="text-[11px] font-bold text-zinc-300 mb-1 block">
                  Distancia recorrida en km {isIndoor ? '(Indica los km de la cinta):' : '(ajuste opcional):'}
                </label>
                <input
                  type="text"
                  placeholder="Ej: 5.0"
                  value={manualDistanceStr}
                  onChange={(e) => setManualDistanceStr(e.target.value)}
                  className="w-full bg-[#20252C] border border-[#282F38] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#1FD08A]"
                />
              </div>

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
                          ? 'bg-[#1FD08A]/20 border-[#1FD08A] text-[#1FD08A] font-bold'
                          : 'bg-[#20252C] border-[#282F38] text-zinc-400 hover:text-white'
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
                  <span className="text-[#1FD08A] font-black">{runRpe} / 10</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={runRpe}
                  onChange={(e) => setRunRpe(parseInt(e.target.value, 10))}
                  className="w-full accent-[#1FD08A]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-300 mb-1 block">Notas opcionales:</label>
                <input
                  type="text"
                  placeholder="Ej: Buena sensación, ritmo controlado en Z2..."
                  value={runNotes}
                  onChange={(e) => setRunNotes(e.target.value)}
                  className="w-full bg-[#20252C] border border-[#282F38] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#1FD08A]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleConfirmSave}
                className="w-full py-3 bg-[#1FD08A] hover:bg-[#1ab87a] text-[#15181D] font-black rounded-xl text-xs transition-all shadow-md cursor-pointer"
              >
                Guardar en Historial FitMax
              </button>

              {route.length > 0 && (
                <button
                  onClick={handleExportGPX}
                  className="w-full py-2.5 bg-[#20252C] hover:bg-[#282F38] text-orange-400 font-bold rounded-xl text-xs border border-[#282F38] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
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
