import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, 
  Play, 
  Pause, 
  RotateCcw, 
  MapPin, 
  Navigation, 
  Timer, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  X, 
  Share2, 
  Award, 
  Sparkles, 
  Flame, 
  Activity, 
  Zap,
  ArrowRightLeft
} from 'lucide-react';
import { 
  HyroxDivision, 
  HYROX_DIVISIONS, 
  HYROX_OFFICIAL_RACE_STATIONS, 
  HyroxSegmentRecord, 
  HyroxRaceResult, 
  formatDuration, 
  calculatePaceFromSec, 
  analyzeHyroxRace, 
  saveHyroxRaceResult, 
  getHyroxPersonalBest,
  OfficialStationSpec 
} from '../lib/hyroxRace';
import { GeoPoint, calculateHaversineDistanceKm } from '../lib/gpx';
import { playBeepSound } from '../lib/sound';

interface HyroxRaceSimulatorModalProps {
  nickname: string;
  onClose: () => void;
  onNotification?: (msg: string) => void;
}

type RacePhase = 'config' | 'running' | 'station' | 'finished';
type RunTrackingMode = 'gps' | 'treadmill';

export default function HyroxRaceSimulatorModal({
  nickname,
  onClose,
  onNotification,
}: HyroxRaceSimulatorModalProps) {
  // Configuración de carrera
  const [division, setDivision] = useState<HyroxDivision>('open_men');
  const [trackingMode, setTrackingMode] = useState<RunTrackingMode>('treadmill');
  const [phase, setPhase] = useState<RacePhase>('config');

  // Estado de simulación activa
  const [currentSegmentIdx, setCurrentSegmentIdx] = useState<number>(0); // 0 a 7 (8 segmentos)
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [totalRaceSec, setTotalRaceSec] = useState<number>(0);
  const [currentLegSec, setCurrentLegSec] = useState<number>(0); // Tiempo del tramo actual (Run o Estación)

  // Tracking GPS
  const [gpsDistanceKm, setGpsDistanceKm] = useState<number>(0);
  const [gpsPoints, setGpsPoints] = useState<GeoPoint[]>([]);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Registro de segmentos completados
  const [recordedSegments, setRecordedSegments] = useState<HyroxSegmentRecord[]>([]);
  const [currentRunRecord, setCurrentRunRecord] = useState<{ durationSec: number; distanceKm: number; paceStr: string } | null>(null);
  const [alternativeUsedForStation, setAlternativeUsedForStation] = useState<Record<number, string>>({});

  // Resultado final y récord personal
  const [raceResult, setRaceResult] = useState<HyroxRaceResult | null>(null);
  const [pbInfo, setPbInfo] = useState<{ isNewPB: boolean; previousPB: HyroxRaceResult | null } | null>(null);

  // Referencias para timers y GPS
  const totalTimerRef = useRef<any>(null);
  const legTimerRef = useRef<any>(null);
  const gpsWatchIdRef = useRef<number | null>(null);
  const prevGpsPointRef = useRef<GeoPoint | null>(null);

  const previousPB = getHyroxPersonalBest(nickname, division);
  const currentStation: OfficialStationSpec = HYROX_OFFICIAL_RACE_STATIONS[currentSegmentIdx] || HYROX_OFFICIAL_RACE_STATIONS[0];

  // Manejo de cronómetros globales y de segmento
  useEffect(() => {
    if ((phase === 'running' || phase === 'station') && !isPaused) {
      totalTimerRef.current = setInterval(() => {
        setTotalRaceSec((s) => s + 1);
      }, 1000);

      legTimerRef.current = setInterval(() => {
        setCurrentLegSec((s) => s + 1);
      }, 1000);
    } else {
      if (totalTimerRef.current) clearInterval(totalTimerRef.current);
      if (legTimerRef.current) clearInterval(legTimerRef.current);
    }

    return () => {
      if (totalTimerRef.current) clearInterval(totalTimerRef.current);
      if (legTimerRef.current) clearInterval(legTimerRef.current);
    };
  }, [phase, isPaused]);

  // Manejo de geolocalización GPS cuando está en modo carrera exterior
  useEffect(() => {
    if (phase === 'running' && trackingMode === 'gps' && !isPaused) {
      if (!('geolocation' in navigator)) {
        setGpsError('Este dispositivo o navegador no soporta geolocalización GPS.');
        return;
      }

      setGpsError(null);
      prevGpsPointRef.current = null;

      gpsWatchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          setGpsAccuracy(accuracy);

          // Filtro de precisión (> 35m descartamos saltos locos)
          if (accuracy > 35) return;

          const newPt: GeoPoint = {
            latitude,
            longitude,
            timestamp: position.timestamp || Date.now(),
          };

          if (prevGpsPointRef.current) {
            const deltaKm = calculateHaversineDistanceKm(
              prevGpsPointRef.current.latitude,
              prevGpsPointRef.current.longitude,
              newPt.latitude,
              newPt.longitude
            );

            // Filtrar saltos imposibles (> 25 km/h a pie)
            const timeDiffSec = (newPt.timestamp - prevGpsPointRef.current.timestamp) / 1000;
            const speedKmh = timeDiffSec > 0 ? (deltaKm / (timeDiffSec / 3600)) : 0;

            if (speedKmh <= 28) {
              setGpsDistanceKm((d) => {
                const nextDist = d + deltaKm;
                // Si alcanza 1.00 km exacto, dar aviso acústico y táctil
                if (d < 1.0 && nextDist >= 1.0) {
                  playBeepSound();
                  if ('vibrate' in navigator) navigator.vibrate([200, 100, 200, 100, 300]);
                  onNotification?.(`¡1.00 km completado a ritmo ${calculatePaceFromSec(nextDist, currentLegSec)}! Pasa a ${currentStation.shortName}.`);
                }
                return nextDist;
              });
            }
          }

          prevGpsPointRef.current = newPt;
          setGpsPoints((pts) => [...pts, newPt]);
        },
        (err) => {
          setGpsError(err.message || 'Error al obtener señal GPS.');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 1000,
        }
      );
    } else {
      if (gpsWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(gpsWatchIdRef.current);
        gpsWatchIdRef.current = null;
      }
    }

    return () => {
      if (gpsWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(gpsWatchIdRef.current);
        gpsWatchIdRef.current = null;
      }
    };
  }, [phase, trackingMode, isPaused]);

  // INICIAR CARRERA
  const handleStartRace = () => {
    setPhase('running');
    setCurrentSegmentIdx(0);
    setTotalRaceSec(0);
    setCurrentLegSec(0);
    setGpsDistanceKm(0);
    setGpsPoints([]);
    setRecordedSegments([]);
    setCurrentRunRecord(null);
    setIsPaused(false);
    playBeepSound();
    onNotification?.('¡Simulacro Hyrox Oficial Iniciado! Comienza el Run 1 (1 km).');
  };

  // COMPLETAR RUN DEL SEGMENTO ACTUAL
  const handleCompleteRun = () => {
    const finalDist = trackingMode === 'gps' ? Math.max(1.0, gpsDistanceKm) : 1.0;
    const finalRunSec = currentLegSec;
    const pace = calculatePaceFromSec(finalDist, finalRunSec);

    setCurrentRunRecord({
      durationSec: finalRunSec,
      distanceKm: finalDist,
      paceStr: pace,
    });

    playBeepSound();
    if ('vibrate' in navigator) navigator.vibrate([150, 80, 150]);

    // Transición a la estación de ejercicio
    setPhase('station');
    setCurrentLegSec(0);
    setGpsDistanceKm(0);
    prevGpsPointRef.current = null;
  };

  // COMPLETAR ESTACIÓN DEL SEGMENTO ACTUAL
  const handleCompleteStation = () => {
    if (!currentRunRecord) return;

    const stationSec = currentLegSec;
    const totalSegSec = currentRunRecord.durationSec + stationSec;
    const isAlt = Boolean(alternativeUsedForStation[currentSegmentIdx]);

    const segRecord: HyroxSegmentRecord = {
      segmentNumber: currentSegmentIdx + 1,
      stationName: currentStation.name,
      runDistanceKm: currentRunRecord.distanceKm,
      runDurationSec: currentRunRecord.durationSec,
      runPaceStr: currentRunRecord.paceStr,
      stationDurationSec: stationSec,
      totalSegmentDurationSec: totalSegSec,
      isAlternativeUsed: isAlt,
      alternativeName: alternativeUsedForStation[currentSegmentIdx] || undefined,
    };

    const nextRecorded = [...recordedSegments, segRecord];
    setRecordedSegments(nextRecorded);
    playBeepSound();

    if (currentSegmentIdx < 7) {
      // Siguiente segmento (siguiente Run)
      setCurrentSegmentIdx((prev) => prev + 1);
      setPhase('running');
      setCurrentLegSec(0);
      setGpsDistanceKm(0);
      setCurrentRunRecord(null);
      prevGpsPointRef.current = null;
      onNotification?.(`¡Estación ${currentStation.shortName} completada en ${formatDuration(stationSec)}! Inicia el Run ${currentSegmentIdx + 2}.`);
    } else {
      // ¡CARRERA COMPLETADA!
      setPhase('finished');
      const analysis = analyzeHyroxRace(nextRecorded, division, trackingMode);
      setRaceResult(analysis);
      const pbResult = saveHyroxRaceResult(nickname, analysis);
      setPbInfo(pbResult);
      if ('vibrate' in navigator) navigator.vibrate([300, 150, 300, 150, 500]);
      onNotification?.('¡META CRUZADA! Has completado el simulacro oficial Hyrox.');
    }
  };

  // Ritmo en vivo en carrera
  const liveRunPace = trackingMode === 'gps' && gpsDistanceKm > 0.05
    ? calculatePaceFromSec(gpsDistanceKm, currentLegSec)
    : '--:--/km';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-[#15181D] border border-[#282F38] text-[#F4F2ED] rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl flex flex-col max-h-[95vh] overflow-y-auto">
        
        {/* CABECERA */}
        <div className="flex items-center justify-between pb-3 border-b border-[#282F38] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#F4F2ED] flex items-center gap-2">
                Simulador Oficial Hyrox
                <span className="text-[10px] bg-amber-500 text-zinc-950 font-black px-2 py-0.5 rounded-full uppercase">
                  Día de Carrera
                </span>
              </h3>
              <p className="text-xs text-[#A8B0BB]">
                8 x (1 km carrera + 1 estación funcional) con telemetría de ritmo y tiempos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#20252C] hover:bg-[#282F38] text-[#A8B0BB] hover:text-[#F4F2ED] flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ----------------- FASE 1: CONFIGURACIÓN PRE-CARRERA ----------------- */}
        {phase === 'config' && (
          <div className="space-y-4">
            {/* Record Personal Previo si existe */}
            {previousPB && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Award className="w-6 h-6 text-amber-400 shrink-0" />
                  <div>
                    <p className="text-xs font-black text-amber-300">Tu Marca Personal a Batir (PB):</p>
                    <p className="text-lg font-black text-[#F4F2ED] font-mono">
                      {formatDuration(previousPB.totalDurationSec)}
                    </p>
                    <p className="text-[11px] text-[#A8B0BB]">
                      Ritmo medio carrera: {previousPB.averageRunPace} · Estaciones: {formatDuration(previousPB.totalStationDurationSec)}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] bg-[#15181D] text-amber-400 border border-amber-500/30 font-bold px-2 py-1 rounded-lg shrink-0">
                  Rival a vencer ⏱️
                </span>
              </div>
            )}

            {/* Selector de División */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-[#A8B0BB] tracking-wider block">
                1. Selecciona tu Categoría o Adaptación:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {HYROX_DIVISIONS.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDivision(d.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      division === d.id
                        ? 'bg-amber-500/20 border-amber-500 text-[#F4F2ED] shadow-sm'
                        : 'bg-[#20252C] border-[#282F38] text-[#A8B0BB] hover:border-[#38414D]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black text-[#F4F2ED]">{d.name}</p>
                      {division === d.id && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                    </div>
                    <p className="text-[10px] text-amber-300 font-semibold mt-0.5">{d.badge}</p>
                    <p className="text-[11px] text-[#A8B0BB] mt-1 leading-snug">{d.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Modo de Medición de Carrera */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-[#A8B0BB] tracking-wider block">
                2. ¿Dónde vas a correr los tramos de 1 km?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTrackingMode('treadmill')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    trackingMode === 'treadmill'
                      ? 'bg-purple-900/30 border-purple-500 text-[#F4F2ED]'
                      : 'bg-[#20252C] border-[#282F38] text-[#A8B0BB]'
                  }`}
                >
                  <p className="text-xs font-black flex items-center gap-1.5 text-[#F4F2ED]">
                    🏃 Caminadora / Tacómetro
                  </p>
                  <p className="text-[11px] text-[#A8B0BB] mt-1 leading-snug">
                    Ideal para gimnasios cerrados. Corres 1.00 km en la cinta y tocas el botón al llegar.
                  </p>
                </button>

                <button
                  onClick={() => setTrackingMode('gps')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    trackingMode === 'gps'
                      ? 'bg-emerald-950/40 border-emerald-500 text-[#F4F2ED]'
                      : 'bg-[#20252C] border-[#282F38] text-[#A8B0BB]'
                  }`}
                >
                  <p className="text-xs font-black flex items-center gap-1.5 text-[#F4F2ED]">
                    🛰️ GPS Exterior / Pista
                  </p>
                  <p className="text-[11px] text-[#A8B0BB] mt-1 leading-snug">
                    Calcula ritmo en vivo (min/km), distancia continua y avisa acústicamente al completar 1 km.
                  </p>
                </button>
              </div>
            </div>

            {/* Estructura oficial de 8 estaciones */}
            <div className="bg-[#20252C] border border-[#282F38] rounded-2xl p-3.5 space-y-2">
              <p className="text-[11px] font-black uppercase tracking-wider text-[#1FD08A]">
                📋 Circuito Oficial (8 km + 8 Estaciones):
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {HYROX_OFFICIAL_RACE_STATIONS.map((st) => (
                  <div key={st.order} className="bg-[#15181D] p-2 rounded-xl border border-[#282F38]/60">
                    <span className="text-[10px] font-bold text-amber-400 block">{st.order}. 1km Run +</span>
                    <span className="font-extrabold text-[#F4F2ED] text-[11px] truncate block">{st.icon} {st.shortName}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* BOTÓN INICIAR */}
            <button
              onClick={handleStartRace}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-black py-4 rounded-2xl text-sm transition-all flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 cursor-pointer active:scale-98"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Iniciar Simulacro Oficial (Run 1)</span>
            </button>
          </div>
        )}

        {/* ----------------- FASE 2: RUNNING (1 KM) ----------------- */}
        {phase === 'running' && (
          <div className="space-y-4">
            {/* Barra superior de progreso de segmentos */}
            <div className="flex items-center justify-between text-xs font-bold text-[#A8B0BB] bg-[#20252C] p-2.5 rounded-xl border border-[#282F38]">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Trophy className="w-4 h-4" />
                Segmento {currentSegmentIdx + 1} de 8
              </span>
              <span>Cronómetro Total: <strong className="text-[#F4F2ED] font-mono text-sm">{formatDuration(totalRaceSec)}</strong></span>
            </div>

            {/* TARJETA PRINCIPAL DEL RUN */}
            <div className="bg-[#20252C] border-2 border-emerald-500/50 rounded-3xl p-5 text-center space-y-4 shadow-lg">
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl animate-bounce">🏃</span>
                <h4 className="text-xl sm:text-2xl font-black text-[#F4F2ED]">
                  RUN {currentSegmentIdx + 1} · 1,000 Metros
                </h4>
              </div>

              {/* Distancia y ritmo */}
              <div className="grid grid-cols-2 gap-3 bg-[#15181D] p-4 rounded-2xl border border-[#282F38]">
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#A8B0BB]">Tiempo de este km</p>
                  <p className="text-3xl sm:text-4xl font-black font-mono text-emerald-400 tabular-nums">
                    {formatDuration(currentLegSec)}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] uppercase font-bold text-[#A8B0BB]">
                    {trackingMode === 'gps' ? 'Ritmo en vivo' : 'Objetivo 1 km'}
                  </p>
                  <p className="text-3xl sm:text-4xl font-black font-mono text-[#F4F2ED] tabular-nums">
                    {trackingMode === 'gps' ? liveRunPace : '1.00 km'}
                  </p>
                </div>
              </div>

              {/* Telemetría GPS adicional si está en modo exterior */}
              {trackingMode === 'gps' && (
                <div className="bg-[#15181D] p-3 rounded-2xl border border-[#282F38] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span>Distancia GPS: <strong className="text-emerald-400 text-sm font-mono">{gpsDistanceKm.toFixed(2)} km</strong> / 1.00 km</span>
                  </div>
                  {gpsAccuracy !== null && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      gpsAccuracy < 15 ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                    }`}>
                      Precisión: ±{Math.round(gpsAccuracy)}m
                    </span>
                  )}
                </div>
              )}

              {gpsError && (
                <div className="p-2.5 bg-red-950/40 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{gpsError} Puedes completar el km manualmente tocando el botón inferior.</span>
                </div>
              )}

              {/* Próxima Estación Preview */}
              <div className="bg-[#15181D]/60 p-2.5 rounded-xl border border-[#282F38]/60 text-xs text-[#A8B0BB] flex items-center justify-between">
                <span>Al terminar este km sigue:</span>
                <span className="font-extrabold text-amber-400 flex items-center gap-1">
                  {currentStation.icon} {currentStation.name}
                </span>
              </div>

              {/* Botón grande para completar 1 km y pasar a la estación */}
              <button
                onClick={handleCompleteRun}
                className="w-full bg-[#1FD08A] hover:bg-emerald-400 text-zinc-950 font-black py-4 rounded-2xl text-base transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 cursor-pointer active:scale-98"
              >
                <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                <span>1 KM Completado · Entrar a {currentStation.shortName}</span>
              </button>
            </div>

            {/* Controles de pausa */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="px-4 py-2 rounded-xl bg-[#20252C] hover:bg-[#282F38] text-[#A8B0BB] hover:text-[#F4F2ED] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
                <span>{isPaused ? 'Reanudar Carrera' : 'Pausar Simulacro'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ----------------- FASE 3: ESTACIÓN FUNCIONAL ----------------- */}
        {phase === 'station' && (
          <div className="space-y-4">
            {/* Cabecera del Segmento */}
            <div className="flex items-center justify-between text-xs font-bold text-[#A8B0BB] bg-[#20252C] p-2.5 rounded-xl border border-[#282F38]">
              <span className="text-amber-400 flex items-center gap-1">
                {currentStation.icon} Estación {currentSegmentIdx + 1} de 8
              </span>
              <span>Cronómetro Total: <strong className="text-[#F4F2ED] font-mono text-sm">{formatDuration(totalRaceSec)}</strong></span>
            </div>

            {/* TARJETA DE LA ESTACIÓN */}
            <div className="bg-[#20252C] border-2 border-amber-500/50 rounded-3xl p-5 space-y-4 shadow-lg">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs uppercase font-black text-amber-400 tracking-wider">
                    Estación Oficial Hyrox
                  </span>
                  <h4 className="text-xl sm:text-2xl font-black text-[#F4F2ED] mt-0.5">
                    {currentStation.name}
                  </h4>
                  <p className="text-xs text-amber-300 font-bold mt-1">
                    Meta: {currentStation.distanceOrReps}
                  </p>
                </div>
                <span className="text-3xl">{currentStation.icon}</span>
              </div>

              {/* Peso reglamentario según categoría */}
              <div className="bg-[#15181D] p-3 rounded-2xl border border-[#282F38] space-y-1">
                <p className="text-[10px] uppercase font-bold text-[#A8B0BB]">
                  Peso oficial ({HYROX_DIVISIONS.find((d) => d.id === division)?.name}):
                </p>
                <p className="text-xs font-extrabold text-[#F4F2ED]">
                  {currentStation.weightByDivision[division] || currentStation.weightByDivision.open_men}
                </p>
              </div>

              {/* Cronómetro de la Estación */}
              <div className="bg-[#15181D] p-4 rounded-2xl border border-[#282F38] text-center">
                <p className="text-[10px] uppercase font-bold text-[#A8B0BB]">Tiempo en esta estación</p>
                <p className="text-4xl sm:text-5xl font-black font-mono text-amber-400 tabular-nums mt-1">
                  {formatDuration(currentLegSec)}
                </p>
                {currentRunRecord && (
                  <p className="text-[11px] text-[#A8B0BB] mt-1.5">
                    Run previo: {formatDuration(currentRunRecord.durationSec)} ({currentRunRecord.paceStr})
                  </p>
                )}
              </div>

              {/* Alternativa gym si no hay máquina oficial */}
              <div className="bg-[#15181D]/60 p-2.5 rounded-xl border border-[#282F38]/60 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#A8B0BB] flex items-center gap-1 font-semibold">
                    <ArrowRightLeft className="w-3.5 h-3.5 text-purple-400" />
                    ¿Sin máquina oficial?
                  </span>
                  <button
                    onClick={() => {
                      const isCurrently = Boolean(alternativeUsedForStation[currentSegmentIdx]);
                      setAlternativeUsedForStation((prev) => ({
                        ...prev,
                        [currentSegmentIdx]: isCurrently ? '' : currentStation.gymAlternative,
                      }));
                    }}
                    className="text-[10px] text-purple-300 hover:text-white underline font-bold cursor-pointer"
                  >
                    {alternativeUsedForStation[currentSegmentIdx] ? 'Restaurar oficial' : 'Usar alternativa gym'}
                  </button>
                </div>
                {alternativeUsedForStation[currentSegmentIdx] && (
                  <p className="text-[11px] text-purple-200 font-semibold bg-purple-950/40 p-2 rounded-lg border border-purple-500/30">
                    💡 Adaptación activa: {currentStation.gymAlternative}
                  </p>
                )}
              </div>

              {/* Consejo Pro */}
              <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-2.5 text-xs text-amber-200/90 leading-relaxed">
                💡 <strong className="text-amber-200">Consejo técnico: </strong>{currentStation.proTip}
              </div>

              {/* Botón para completar estación */}
              <button
                onClick={handleCompleteStation}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-black py-4 rounded-2xl text-base transition-all flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 cursor-pointer active:scale-98"
              >
                <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                <span>
                  {currentSegmentIdx < 7 
                    ? `Estación Completada · Salir a Run ${currentSegmentIdx + 2} 🏃` 
                    : '¡FINALIZAR SIMULACRO HYROX! 🏆'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ----------------- FASE 4: RESUMEN FINAL & MARCA PERSONAL (PB) ----------------- */}
        {phase === 'finished' && raceResult && (
          <div className="space-y-4 animate-fadeIn">
            {/* Tarjeta de Felicitación / PB */}
            <div className="bg-gradient-to-br from-amber-500/20 via-zinc-900 to-[#15181D] border-2 border-amber-500 rounded-3xl p-5 text-center space-y-2 relative overflow-hidden shadow-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-zinc-950 font-black text-xs uppercase mb-1">
                <Trophy className="w-4 h-4" />
                {pbInfo?.isNewPB ? '¡NUEVO RÉCORD PERSONAL BATIDO! 🏆' : '¡SIMULACRO OFICIAL COMPLETADO!'}
              </div>

              <p className="text-xs text-[#A8B0BB]">Tiempo Total Oficial Hyrox (8 km + 8 Estaciones):</p>
              <h2 className="text-4xl sm:text-5xl font-black font-mono text-amber-400">
                {formatDuration(raceResult.totalDurationSec)}
              </h2>

              {pbInfo?.previousPB && (
                <p className="text-xs text-[#1FD08A] font-bold">
                  {pbInfo.isNewPB
                    ? `Batiste tu marca anterior por ${formatDuration(pbInfo.previousPB.totalDurationSec - raceResult.totalDurationSec)} segundos`
                    : `Marca anterior de referencia: ${formatDuration(pbInfo.previousPB.totalDurationSec)}`}
                </p>
              )}
            </div>

            {/* Estadísticas Clave de Carrera vs Estaciones */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="bg-[#20252C] p-3 rounded-2xl border border-[#282F38]">
                <p className="text-[10px] uppercase font-bold text-[#A8B0BB]">Total Carrera (8km)</p>
                <p className="text-lg font-black text-emerald-400 font-mono mt-0.5">
                  {formatDuration(raceResult.totalRunDurationSec)}
                </p>
                <p className="text-[10px] text-[#A8B0BB]">{raceResult.averageRunPace}</p>
              </div>

              <div className="bg-[#20252C] p-3 rounded-2xl border border-[#282F38]">
                <p className="text-[10px] uppercase font-bold text-[#A8B0BB]">Total Estaciones</p>
                <p className="text-lg font-black text-amber-400 font-mono mt-0.5">
                  {formatDuration(raceResult.totalStationDurationSec)}
                </p>
                <p className="text-[10px] text-[#A8B0BB]">8 ejercicios</p>
              </div>

              <div className="bg-[#20252C] p-3 rounded-2xl border border-[#282F38]">
                <p className="text-[10px] uppercase font-bold text-[#A8B0BB]">Km Más Rápido</p>
                <p className="text-lg font-black text-[#F4F2ED] font-mono mt-0.5">
                  Run {raceResult.fastestRunSegment}
                </p>
                <p className="text-[10px] text-emerald-400">
                  {formatDuration(raceResult.segments[raceResult.fastestRunSegment - 1]?.runDurationSec || 0)}
                </p>
              </div>

              <div className="bg-[#20252C] p-3 rounded-2xl border border-[#282F38]">
                <p className="text-[10px] uppercase font-bold text-[#A8B0BB]">Estación Más Rápida</p>
                <p className="text-lg font-black text-[#F4F2ED] font-mono mt-0.5">
                  {HYROX_OFFICIAL_RACE_STATIONS[raceResult.fastestStationSegment - 1]?.shortName}
                </p>
                <p className="text-[10px] text-amber-400">
                  {formatDuration(raceResult.segments[raceResult.fastestStationSegment - 1]?.stationDurationSec || 0)}
                </p>
              </div>
            </div>

            {/* TABLA DETALLADA DE LOS 8 SEGMENTOS (RUN + ESTACIÓN) */}
            <div className="bg-[#20252C] border border-[#282F38] rounded-2xl p-3.5 space-y-2">
              <p className="text-xs font-black uppercase text-[#F4F2ED] tracking-wider">
                Desglose Segmento a Segmento (Splits Oficiales):
              </p>
              <div className="space-y-1.5 overflow-x-auto">
                {raceResult.segments.map((seg) => (
                  <div
                    key={seg.segmentNumber}
                    className="flex items-center justify-between bg-[#15181D] p-2.5 rounded-xl border border-[#282F38]/70 text-xs gap-2 min-w-[340px]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 font-black text-[10px] flex items-center justify-center shrink-0">
                        {seg.segmentNumber}
                      </span>
                      <div>
                        <p className="font-extrabold text-[#F4F2ED]">{seg.stationName}</p>
                        <p className="text-[10px] text-[#A8B0BB]">
                          Run: {formatDuration(seg.runDurationSec)} ({seg.runPaceStr}) · Estación: {formatDuration(seg.stationDurationSec)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-mono font-black text-amber-400">
                        {formatDuration(seg.totalSegmentDurationSec)}
                      </p>
                      <p className="text-[9px] text-[#A8B0BB] uppercase font-bold">Total tramo</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Botones finales */}
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 bg-[#1FD08A] hover:bg-emerald-400 text-zinc-950 font-black py-3.5 rounded-2xl text-xs transition-all cursor-pointer shadow-lg"
              >
                Guardar y Cerrar
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
