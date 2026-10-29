import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Square,
  MapPin,
  AlertCircle,
  X,
  Volume2,
  VolumeX,
  Radio,
  Activity,
  CheckCircle2,
  SkipForward,
  Bell,
  BellRing,
  Sparkles,
  ChevronRight,
  Timer
} from 'lucide-react';
import { GeoPoint, calculateHaversineDistanceKm } from '../lib/gpx';
import { RunType, RUN_TYPES, calculatePace } from '../lib/running';
import {
  PlannedRunningSession,
  RunningWorkoutBlock,
  buildWorkoutBlocksFromSession,
  parsePaceRangeBounds,
  formatPaceRangeLabel
} from '../lib/runningPlans';
import RunningMap from './RunningMap';

export type DistanceAlertInterval = 1000 | 500 | 400 | 0; // metros (0 = solo cambios de bloque)

interface RunningLiveTrackerProps {
  plannedSession?: PlannedRunningSession | null;
  onSaveRun: (
    data: {
      distanceKm: number;
      durationMin: number;
      type: RunType;
      rpe: number;
      notes?: string;
      route: GeoPoint[];
    },
    completionMeta?: {
      plannedSessionId?: string;
      status: 'completed' | 'partial';
      completedBlocksCount: number;
      totalBlocksCount: number;
    }
  ) => void;
  onClose: () => void;
  onNotification?: (msg: string) => void;
}

export default function RunningLiveTracker({
  plannedSession,
  onSaveRun,
  onClose,
  onNotification,
}: RunningLiveTrackerProps) {
  // Generar bloques interactivos paso a paso si hay una sesión planificada o personalizada
  const workoutBlocks: RunningWorkoutBlock[] = React.useMemo(() => {
    if (!plannedSession) return [];
    return buildWorkoutBlocksFromSession(plannedSession);
  }, [plannedSession]);

  // Detectar si la rutina tiene bloques de 400m o 200m para preseleccionar alerta cada 400m
  const defaultAlertMeters: DistanceAlertInterval = React.useMemo(() => {
    if (!plannedSession) return 1000;
    const text = `${plannedSession.name} ${plannedSession.structure.join(' ')}`.toLowerCase();
    if (text.includes('400m') || text.includes('200m')) return 400;
    if (text.includes('500m')) return 500;
    return 1000;
  }, [plannedSession]);

  // Configuración de alertas antes y durante el entreno
  const [alertDistanceMeters, setAlertDistanceMeters] = useState<DistanceAlertInterval>(defaultAlertMeters);
  const [alertLast10Sec, setAlertLast10Sec] = useState<boolean>(true);
  const [paceRangeAlertEnabled, setPaceRangeAlertEnabled] = useState<boolean>(true);
  const [voiceCoachEnabled, setVoiceCoachEnabled] = useState<boolean>(true);

  // Solo mostrar el aviso de 10s cuando la sesión tiene múltiples bloques/segmentos o bloques por tiempo/descanso
  const hasMultipleOrTimedBlocks = React.useMemo(() => {
    return workoutBlocks.length > 1 || workoutBlocks.some((b) => b.targetType === 'time' || b.phaseType === 'recovery');
  }, [workoutBlocks]);

  // Estado de ejecución en vivo
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isIndoor, setIsIndoor] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [route, setRoute] = useState<GeoPoint[]>([]);
  const [addedIndoorKm, setAddedIndoorKm] = useState<number>(0);
  const [currentLocation, setCurrentLocation] = useState<GeoPoint | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'searching' | 'ready' | 'error' | 'indoor'>('searching');

  // Estado del bloque actual (guía paso a paso)
  const [currentBlockIndex, setCurrentBlockIndex] = useState<number>(0);
  const [blockStartDistanceKm, setBlockStartDistanceKm] = useState<number>(0);
  const [blockElapsedSec, setBlockElapsedSec] = useState<number>(0);
  const [allBlocksFinished, setAllBlocksFinished] = useState<boolean>(false);

  // Resumen al terminar
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [runType, setRunType] = useState<RunType>(plannedSession?.type || 'facil');
  const [runRpe, setRunRpe] = useState<number>(plannedSession?.rpe || 6);
  const [runNotes, setRunNotes] = useState<string>('');
  const [manualDistanceStr, setManualDistanceStr] = useState<string>('');

  const watchIdRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const wakeLockRef = useRef<any>(null);
  const lastAnnouncedStepCountRef = useRef<number>(0);
  const lastSplitTimeRef = useRef<number>(0);
  const announced10sForBlockRef = useRef<string | null>(null);

  // Generador de tonos sonoros (Web Audio API) para alertas de 10s, 3-2-1 y cambio de bloque
  const playBeep = (freq = 880, durationMs = 180, count = 1) => {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      for (let i = 0; i < count; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.value = 0.18;
        osc.connect(gain);
        gain.connect(ctx.destination);
        const startAt = ctx.currentTime + i * ((durationMs + 90) / 1000);
        osc.start(startAt);
        osc.stop(startAt + durationMs / 1000);
      }
    } catch {
      // Ignorar si el navegador bloquea AudioContext
    }
  };

  // Sintetizador de voz en español para el Audio Coach
  const speakCoach = (text: string) => {
    if (!voiceCoachEnabled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 1.06;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
    }
  };

  // Mantener pantalla encendida en dispositivos móviles (WakeLock API)
  const requestScreenWakeLock = async () => {
    try {
      if ('wakeLock' in navigator && (navigator as any).wakeLock) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      }
    } catch {
      // No crítico si el navegador no lo soporta
    }
  };

  const releaseScreenWakeLock = () => {
    try {
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    } catch {
      // Ignorar
    }
  };

  // Sondeo GPS automático al abrir la ventana
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
          setGpsError('Permiso GPS denegado en el navegador. Activa la ubicación o usa el Modo Cinta.');
        } else {
          setGpsError('Conectando con satélites GPS... Al pulsar Iniciar Entrenamiento se activará el rastreo continuo.');
        }
        setGpsStatus('error');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );

    return () => {
      releaseScreenWakeLock();
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Distancia GPS calculada con Haversine + distancia indoor/treadmill
  const gpsDistanceKm = route.length >= 2
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

  const totalDistanceKm = Math.round((gpsDistanceKm + addedIndoorKm) * 1000) / 1000;
  const durationMin = elapsedSeconds / 60;
  const currentPaceStr = calculatePace(totalDistanceKm, durationMin);
  const currentPaceDecimal = totalDistanceKm >= 0.05 && durationMin > 0 ? durationMin / totalDistanceKm : null;

  // Bloque activo y siguiente bloque
  const currentBlock: RunningWorkoutBlock | null =
    workoutBlocks.length > 0 && currentBlockIndex < workoutBlocks.length
      ? workoutBlocks[currentBlockIndex]
      : null;
  const nextBlock: RunningWorkoutBlock | null =
    workoutBlocks.length > 0 && currentBlockIndex + 1 < workoutBlocks.length
      ? workoutBlocks[currentBlockIndex + 1]
      : null;

  // Rango de ritmo objetivo del bloque activo o de la sesión general
  const activePaceBounds = React.useMemo(() => {
    const rawTarget = currentBlock?.targetPace || plannedSession?.targetPaceLabel;
    return parsePaceRangeBounds(rawTarget, 8);
  }, [currentBlock?.targetPace, plannedSession?.targetPaceLabel]);

  const livePaceZoneStatus: 'in_range' | 'too_fast' | 'too_slow' | null = React.useMemo(() => {
    if (!activePaceBounds || currentPaceDecimal === null || currentBlock?.phaseType === 'recovery') return null;
    if (currentPaceDecimal < activePaceBounds.fastestDecimal - 0.03) return 'too_fast';
    if (currentPaceDecimal > activePaceBounds.slowestDecimal + 0.03) return 'too_slow';
    return 'in_range';
  }, [activePaceBounds, currentPaceDecimal, currentBlock?.phaseType]);

  // Progreso dentro del bloque activo
  const blockDistanceCoveredKm = Math.max(0, totalDistanceKm - blockStartDistanceKm);
  const blockRemainingKm =
    currentBlock && currentBlock.targetType === 'distance'
      ? Math.max(0, currentBlock.targetValue - blockDistanceCoveredKm)
      : 0;
  const blockRemainingSec =
    currentBlock && currentBlock.targetType === 'time'
      ? Math.max(0, currentBlock.targetValue - blockElapsedSec)
      : 0;

  const isInLast10Seconds =
    isTracking &&
    !isPaused &&
    currentBlock?.targetType === 'time' &&
    blockRemainingSec <= 10 &&
    blockRemainingSec > 0;

  // Avanzar al siguiente bloque (automático o con botón Saltar Fase)
  const advanceToNextBlock = (manualSkip = false) => {
    if (workoutBlocks.length === 0) return;

    const nextIdx = currentBlockIndex + 1;
    if (nextIdx >= workoutBlocks.length) {
      setAllBlocksFinished(true);
      playBeep(1046, 250, 3);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([300, 120, 300, 120, 400]);
      }
      speakCoach('¡Has completado todos los bloques de la sesión! Excelente entrenamiento.');
      return;
    }

    const upcoming = workoutBlocks[nextIdx];
    setCurrentBlockIndex(nextIdx);
    setBlockStartDistanceKm(totalDistanceKm);
    setBlockElapsedSec(0);
    announced10sForBlockRef.current = null;

    playBeep(880, 200, 2);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([250, 100, 250]);
    }

    const prefix = manualSkip ? 'Fase saltada. ' : 'Bloque completado. ';
    if (upcoming.phaseType === 'recovery') {
      speakCoach(`${prefix}Iniciando ${upcoming.title}. Recupera el aliento.`);
    } else if (upcoming.phaseType === 'work') {
      speakCoach(`${prefix}¡Vamos! ${upcoming.title}. ${upcoming.targetPace ? `Ritmo objetivo ${upcoming.targetPace}` : ''}`);
    } else if (upcoming.phaseType === 'cooldown') {
      speakCoach(`${prefix}Iniciando vuelta a la calma: ${upcoming.title}.`);
    } else {
      speakCoach(`${prefix}${upcoming.title}.`);
    }
  };

  // Cronómetro principal y del bloque activo
  useEffect(() => {
    if (isTracking && !isPaused) {
      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds((sec) => sec + 1);
        setBlockElapsedSec((bSec) => bSec + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTracking, isPaused]);

  // Control automático de bloques por TIEMPO y alerta de últimos 10 segundos
  useEffect(() => {
    if (!isTracking || isPaused || !currentBlock || allBlocksFinished) return;
    if (currentBlock.targetType !== 'time') return;

    const remaining = currentBlock.targetValue - blockElapsedSec;

    // Alerta sonora y de voz cuando faltan exactamente 10 segundos
    if (alertLast10Sec && remaining === 10 && announced10sForBlockRef.current !== currentBlock.id) {
      announced10sForBlockRef.current = currentBlock.id;
      playBeep(987, 160, 2);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
      const nextLabel = nextBlock ? `para ${nextBlock.title}` : 'para terminar el bloque';
      speakCoach(`¡Últimos diez segundos! Prepárate ${nextLabel}.`);
    }

    // Pitidos de cuenta regresiva 3, 2, 1
    if (alertLast10Sec && (remaining === 3 || remaining === 2 || remaining === 1)) {
      playBeep(740, 120, 1);
    }

    // Fin del bloque de tiempo -> avanzar automáticamente al siguiente bloque
    if (remaining <= 0) {
      advanceToNextBlock(false);
    }
  }, [blockElapsedSec, isTracking, isPaused, currentBlock, nextBlock, alertLast10Sec, allBlocksFinished]);

  // Control automático de bloques por DISTANCIA
  useEffect(() => {
    if (!isTracking || isPaused || !currentBlock || allBlocksFinished) return;
    if (currentBlock.targetType !== 'distance') return;

    if (blockDistanceCoveredKm >= currentBlock.targetValue) {
      advanceToNextBlock(false);
    }
  }, [blockDistanceCoveredKm, isTracking, isPaused, currentBlock, allBlocksFinished]);

  // Alertas configurables por distancia (cada 1000m, 500m o 400m)
  useEffect(() => {
    if (!isTracking || isPaused || alertDistanceMeters === 0) return;
    const stepKm = alertDistanceMeters / 1000;
    const currentStepCount = Math.floor(totalDistanceKm / stepKm);

    if (currentStepCount > lastAnnouncedStepCountRef.current && currentStepCount >= 1) {
      const splitTimeSec = elapsedSeconds - lastSplitTimeRef.current;
      lastSplitTimeRef.current = elapsedSeconds;
      lastAnnouncedStepCountRef.current = currentStepCount;

      const splitMins = Math.floor(splitTimeSec / 60);
      const splitSecs = splitTimeSec % 60;
      const distReachedMeters = currentStepCount * alertDistanceMeters;
      const distLabel =
        alertDistanceMeters === 1000
          ? `Kilómetro ${currentStepCount}`
          : `${distReachedMeters} metros`;

      let paceFeedbackMsg = '';
      if (paceRangeAlertEnabled && activePaceBounds && currentPaceDecimal !== null && currentBlock?.phaseType !== 'recovery') {
        if (currentPaceDecimal < activePaceBounds.fastestDecimal - 0.03) {
          paceFeedbackMsg = ` Vas más rápido del rango sugerido (${activePaceBounds.rangeLabel}), afloja un poco el paso.`;
        } else if (currentPaceDecimal > activePaceBounds.slowestDecimal + 0.03) {
          paceFeedbackMsg = ` Estás por debajo del ritmo sugerido (${activePaceBounds.rangeLabel}), debes apretar un poco.`;
        } else {
          paceFeedbackMsg = ` Estás dentro del rango sugerido (${activePaceBounds.rangeLabel}). ¡Excelente paso!`;
        }
      }

      playBeep(880, 150, 1);
      speakCoach(`${distLabel} completado. Parcial: ${splitMins} minutos y ${splitSecs} segundos.${paceFeedbackMsg}`);

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  }, [totalDistanceKm, isTracking, isPaused, alertDistanceMeters, elapsedSeconds, paceRangeAlertEnabled, activePaceBounds, currentPaceDecimal, currentBlock?.phaseType]);

  // Alerta periódica de control de rango de ritmo cada 90 segundos de carrera activa
  useEffect(() => {
    if (!isTracking || isPaused || !paceRangeAlertEnabled || !activePaceBounds || currentPaceDecimal === null) return;
    if (currentBlock?.phaseType === 'recovery') return;
    if (elapsedSeconds > 0 && elapsedSeconds % 90 === 0) {
      const cleanPace = currentPaceStr.replace('/km', '');
      if (currentPaceDecimal < activePaceBounds.fastestDecimal - 0.03) {
        playBeep(660, 140, 2);
        speakCoach(`Control de ritmo: vas a ${cleanPace} por kilómetro, más rápido del rango sugerido. Afloja un poco.`);
      } else if (currentPaceDecimal > activePaceBounds.slowestDecimal + 0.03) {
        playBeep(520, 160, 2);
        speakCoach(`Control de ritmo: vas a ${cleanPace} por kilómetro, por debajo del rango sugerido. Aprieta un poco el paso.`);
      } else {
        speakCoach(`Control de ritmo: ${cleanPace} por kilómetro. Estás dentro del rango sugerido.`);
      }
    }
  }, [elapsedSeconds, isTracking, isPaused, paceRangeAlertEnabled, activePaceBounds, currentPaceDecimal, currentPaceStr, currentBlock?.phaseType]);

  // Iniciar Entrenamiento con conexión GPS real por defecto en el móvil
  const startWorkoutWithGps = () => {
    requestScreenWakeLock();
    setGpsError(null);
    setIsTracking(true);
    setIsPaused(false);
    setIsIndoor(false);
    setGpsStatus('ready');

    if (currentBlock) {
      speakCoach(`Entrenamiento iniciado. Bloque 1: ${currentBlock.title}.`);
    } else {
      speakCoach('Entrenamiento iniciado. ¡Buen ritmo!');
    }

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([150]);
    }

    if ('geolocation' in navigator) {
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
          setGpsStatus('ready');

          setRoute((prev) => {
            if (prev.length === 0) return [newPoint];
            const last = prev[prev.length - 1];
            const distKm = calculateHaversineDistanceKm(last.latitude, last.longitude, latitude, longitude);
            // Filtrar ruido menor a 2.5 metros
            if (distKm * 1000 >= 2.5) {
              return [...prev, newPoint];
            }
            return prev;
          });
        },
        (err) => {
          console.warn('Geolocation watch error:', err);
          setGpsError(`Señal GPS débil (${err.message}). Puedes usar los botones de avance o Modo Cinta.`);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    }
  };

  // Iniciar Modo Cinta / Interior
  const startIndoor = () => {
    requestScreenWakeLock();
    setIsTracking(true);
    setIsPaused(false);
    setIsIndoor(true);
    setGpsStatus('indoor');
    if (currentBlock) {
      speakCoach(`Modo cinta iniciado. Bloque 1: ${currentBlock.title}.`);
    } else {
      speakCoach('Modo cinta iniciado. ¡A sumar kilómetros!');
    }
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([150]);
    }
  };

  const stopTracking = () => {
    releaseScreenWakeLock();
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
      speakCoach('Entrenamiento en pausa.');
    } else {
      speakCoach('Entrenamiento reanudado.');
    }
  };

  const handleFinishRun = () => {
    stopTracking();
    speakCoach('Entrenamiento detenido. Guardando tus datos reales.');
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 400]);
    }
    setManualDistanceStr(totalDistanceKm > 0 ? totalDistanceKm.toFixed(2) : '');
    setShowSummaryModal(true);
  };

  // Determinar si la sesión fue completada al 100% o quedó parcial / incompleta
  const getCompletionStatus = (finalDistKm: number): 'completed' | 'partial' => {
    if (!plannedSession) return 'completed';
    if (allBlocksFinished) return 'completed';
    if (workoutBlocks.length > 0 && currentBlockIndex >= workoutBlocks.length - 1 && finalDistKm >= plannedSession.distanceKm * 0.85) {
      return 'completed';
    }
    if (finalDistKm >= plannedSession.distanceKm * 0.9) {
      return 'completed';
    }
    return 'partial';
  };

  const handleConfirmSave = () => {
    const manualDist = parseFloat(manualDistanceStr.replace(',', '.'));
    const finalDistance = !isNaN(manualDist) && manualDist >= 0
      ? Math.round(manualDist * 100) / 100
      : Math.round(totalDistanceKm * 100) / 100;

    const finalDuration = Math.max(0.1, Number((elapsedSeconds / 60).toFixed(2)));
    const status = getCompletionStatus(finalDistance);
    const completedBlocksCount = allBlocksFinished
      ? workoutBlocks.length
      : Math.min(workoutBlocks.length, currentBlockIndex);

    let autoNotePrefix = '';
    if (plannedSession) {
      if (status === 'completed') {
        autoNotePrefix = `[Completada: ${plannedSession.name}] `;
      } else {
        autoNotePrefix = `[Parcial / Incompleta: ${finalDistance} de ${plannedSession.distanceKm} km · ${completedBlocksCount}/${workoutBlocks.length} bloques de ${plannedSession.name}] `;
      }
    }

    const combinedNotes = `${autoNotePrefix}${runNotes.trim()}`.trim();

    onSaveRun(
      {
        distanceKm: finalDistance,
        durationMin: finalDuration,
        type: runType,
        rpe: runRpe,
        notes: combinedNotes || undefined,
        route,
      },
      plannedSession
        ? {
            plannedSessionId: plannedSession.id,
            status,
            completedBlocksCount,
            totalBlocksCount: workoutBlocks.length,
          }
        : undefined
    );

    if (onNotification) {
      if (plannedSession && status === 'partial') {
        onNotification(`Sesión guardada como Parcial (${finalDistance} km de ${plannedSession.distanceKm} km).`);
      } else {
        onNotification(`¡Entrenamiento de ${finalDistance} km registrado con éxito!`);
      }
    }

    onClose();
  };

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const previewFinalDist = parseFloat(manualDistanceStr.replace(',', '.')) || totalDistanceKm;
  const previewStatus = getCompletionStatus(previewFinalDist);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2.5 sm:p-5 animate-fadeIn">
      <div className="bg-[#15181D] text-white rounded-3xl w-full max-w-2xl border border-[#282F38] shadow-2xl flex flex-col overflow-hidden max-h-[95vh]">
        {/* Cabecera con Semáforo GPS y Audio Coach */}
        <div className="p-3.5 sm:p-4 border-b border-[#282F38] flex items-center justify-between bg-[#20252C]">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center border shrink-0 transition-all ${
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
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-xs sm:text-sm text-[#F4F2ED] truncate">
                  {plannedSession ? plannedSession.name : isIndoor ? 'Entrenamiento en Cinta' : 'Entrenamiento Running en Vivo'}
                </h3>
                {isTracking && !isPaused && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1FD08A] animate-ping inline-block shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                {isIndoor ? (
                  <span className="text-[11px] text-sky-400 font-bold">Modo Cinta · Cronómetro y guía de bloques activa</span>
                ) : gpsStatus === 'ready' ? (
                  <span className="text-[11px] text-[#1FD08A] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#1FD08A]" />
                    GPS Móvil Conectado {gpsAccuracy !== null ? `(±${gpsAccuracy}m)` : ''}
                  </span>
                ) : (
                  <span className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
                    <Radio className="w-3 h-3 animate-pulse" />
                    Conexión GPS automática lista al iniciar
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                const nextState = !voiceCoachEnabled;
                setVoiceCoachEnabled(nextState);
                if (nextState) speakCoach('Voz del entrenador activada.');
              }}
              className={`p-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                voiceCoachEnabled
                  ? 'bg-[#1FD08A]/10 border-[#1FD08A]/30 text-[#1FD08A]'
                  : 'bg-[#20252C] border-[#282F38] text-zinc-500 hover:text-white'
              }`}
              title={voiceCoachEnabled ? 'Audio coach activado' : 'Audio coach silenciado'}
            >
              {voiceCoachEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{voiceCoachEnabled ? 'Voz' : 'Mudo'}</span>
            </button>

            <button
              onClick={() => {
                stopTracking();
                onClose();
              }}
              className="p-2 hover:bg-[#282F38] rounded-xl text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cuerpo desplazable */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5">
          {/* PANEL PRE-INICIO: CONFIGURACIÓN DE ALERTAS DE LA SESIÓN */}
          {!isTracking && (
            <div className="bg-[#20252C] border border-[#282F38] rounded-2xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#1FD08A]" />
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    Configurar Alertas del Entrenamiento
                  </span>
                </div>
                <span className="text-[10px] font-bold text-[#1FD08A] bg-[#1FD08A]/10 px-2 py-0.5 rounded-lg">
                  Voz + Vibración
                </span>
              </div>

              <div>
                <label className="text-[11px] text-[#A8B0BB] font-semibold block mb-1.5">
                  Notificar ritmo y parcial cada:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { val: 1000 as DistanceAlertInterval, label: 'Cada 1000m (1 km)' },
                    { val: 400 as DistanceAlertInterval, label: 'Cada 400m (Pista)' },
                    { val: 500 as DistanceAlertInterval, label: 'Cada 500m' },
                    { val: 0 as DistanceAlertInterval, label: 'Solo por bloques' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setAlertDistanceMeters(opt.val)}
                      className={`py-2 px-2.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                        alertDistanceMeters === opt.val
                          ? 'bg-[#1FD08A]/15 border-[#1FD08A] text-[#1FD08A]'
                          : 'bg-[#15181D] border-[#282F38] text-[#A8B0BB] hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {hasMultipleOrTimedBlocks && (
                <div className="flex items-center justify-between pt-2 border-t border-[#282F38]/70">
                  <div>
                    <p className="text-xs font-bold text-white">Aviso en los últimos 10 segundos de descanso/serie</p>
                    <p className="text-[10px] text-[#A8B0BB]">
                      Te avisa con voz y cuenta regresiva (10s... 3, 2, 1) para prepararte antes del siguiente bloque.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAlertLast10Sec(!alertLast10Sec)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer shrink-0 ${
                      alertLast10Sec
                        ? 'bg-[#1FD08A] text-[#15181D] border-[#1FD08A]'
                        : 'bg-[#15181D] text-zinc-400 border-[#282F38]'
                    }`}
                  >
                    {alertLast10Sec ? 'Activado ✓' : 'Desactivado'}
                  </button>
                </div>
              )}

              {activePaceBounds && (
                <div className="flex items-center justify-between pt-2 border-t border-[#282F38]/70">
                  <div>
                    <p className="text-xs font-bold text-white">
                      Alerta de rango de ritmo ({activePaceBounds.rangeLabel})
                    </p>
                    <p className="text-[10px] text-[#A8B0BB]">
                      Te avisa si vas muy rápido (&ldquo;afloja un poco&rdquo;), muy lento (&ldquo;aprieta el paso&rdquo;) o dentro del rango sugerido.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPaceRangeAlertEnabled(!paceRangeAlertEnabled)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer shrink-0 ${
                      paceRangeAlertEnabled
                        ? 'bg-[#1FD08A] text-[#15181D] border-[#1FD08A]'
                        : 'bg-[#15181D] text-zinc-400 border-[#282F38]'
                    }`}
                  >
                    {paceRangeAlertEnabled ? 'Activado ✓' : 'Desactivado'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* GUÍA INTERACTIVA PASO A PASO POR BLOQUES */}
          {workoutBlocks.length > 0 && (
            <div
              className={`rounded-2xl p-4 border transition-all ${
                isInLast10Seconds
                  ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_25px_rgba(251,146,60,0.35)] animate-pulse'
                  : allBlocksFinished
                  ? 'bg-[#1FD08A]/15 border-[#1FD08A]/50'
                  : currentBlock?.phaseType === 'recovery'
                  ? 'bg-sky-500/10 border-sky-500/40'
                  : currentBlock?.phaseType === 'work'
                  ? 'bg-[#20252C] border-[#1FD08A]/50'
                  : 'bg-[#20252C] border-[#282F38]'
              }`}
            >
              {allBlocksFinished ? (
                <div className="text-center py-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1FD08A]/20 text-[#1FD08A] text-xs font-black mb-1">
                    <CheckCircle2 className="w-4 h-4" /> ¡TODOS LOS BLOQUES COMPLETADOS!
                  </span>
                  <p className="text-xs text-[#F4F2ED] mt-1">
                    Has cumplido toda la estructura de la sesión. Puedes continuar corriendo libre o pulsar <strong>Terminar Entrenamiento</strong>.
                  </p>
                </div>
              ) : currentBlock ? (
                <div className="space-y-3">
                  {/* Encabezado del bloque activo + Botón Saltar Fase */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#15181D] text-[#1FD08A] border border-[#282F38]">
                          Bloque {currentBlockIndex + 1} de {workoutBlocks.length}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            currentBlock.phaseType === 'warmup'
                              ? 'bg-amber-500/20 text-amber-300'
                              : currentBlock.phaseType === 'work'
                              ? 'bg-[#1FD08A]/20 text-[#1FD08A]'
                              : currentBlock.phaseType === 'recovery'
                              ? 'bg-sky-500/20 text-sky-300'
                              : 'bg-purple-500/20 text-purple-300'
                          }`}
                        >
                          {currentBlock.phaseType === 'warmup'
                            ? '🔥 Calentamiento'
                            : currentBlock.phaseType === 'work'
                            ? '⚡ Serie / Trabajo'
                            : currentBlock.phaseType === 'recovery'
                            ? '💨 Recuperación'
                            : '🧘 Vuelta a la Calma'}
                        </span>
                        {currentBlock.targetPace && (
                          <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md">
                            Meta: {currentBlock.targetPace}
                          </span>
                        )}
                      </div>
                      <h4 className="text-base sm:text-lg font-black text-white mt-1.5">
                        {currentBlock.title}
                      </h4>
                      <p className="text-xs text-[#A8B0BB] mt-0.5">{currentBlock.instructions}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => advanceToNextBlock(true)}
                      className="flex items-center gap-1 bg-[#15181D] hover:bg-[#282F38] text-[#F4F2ED] border border-[#282F38] px-3 py-2 rounded-xl text-[11px] font-black transition-all shrink-0 cursor-pointer active:scale-95"
                      title="Pasar manualmente al siguiente bloque"
                    >
                      <SkipForward className="w-3.5 h-3.5 text-[#1FD08A]" />
                      <span>Saltar fase</span>
                    </button>
                  </div>

                  {/* ALERTA VISUAL ÚLTIMOS 10 SEGUNDOS */}
                  {isInLast10Seconds && (
                    <div className="bg-amber-500 text-[#15181D] px-3 py-2 rounded-xl flex items-center justify-between font-black text-xs shadow-md">
                      <span className="flex items-center gap-1.5">
                        <BellRing className="w-4 h-4 animate-bounce" />
                        ¡PREPÁRATE! CAMBIO DE BLOQUE EN {blockRemainingSec}s
                      </span>
                      <span className="font-mono text-sm">{blockRemainingSec}s</span>
                    </div>
                  )}

                  {/* Medidor de objetivo del bloque actual (Distancia o Cuenta regresiva de Tiempo) */}
                  {currentBlock.targetType === 'distance' ? (
                    <div className="bg-[#15181D] p-3 rounded-xl border border-[#282F38]">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-[#A8B0BB] font-bold">Progreso del bloque actual:</span>
                        <span className="font-mono font-black text-[#1FD08A]">
                          {currentBlock.targetValue < 1
                            ? `${Math.round(blockDistanceCoveredKm * 1000)}m / ${Math.round(currentBlock.targetValue * 1000)}m`
                            : `${blockDistanceCoveredKm.toFixed(2)} / ${currentBlock.targetValue.toFixed(2)} km`}
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-[#20252C] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#1FD08A] to-teal-400 transition-all duration-300"
                          style={{
                            width: `${Math.min(100, (blockDistanceCoveredKm / Math.max(0.05, currentBlock.targetValue)) * 100)}%`,
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[11px] text-[#A8B0BB]">
                          Restante:{' '}
                          <strong className="text-white font-mono">
                            {blockRemainingKm < 1
                              ? `${Math.round(blockRemainingKm * 1000)} metros`
                              : `${blockRemainingKm.toFixed(2)} km`}
                          </strong>
                        </span>
                        {/* Botones de ayuda para sumar distancia en Cinta / Pista si el GPS es interior */}
                        {isTracking && (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-[#A8B0BB] mr-1">Cinta/Pista:</span>
                            <button
                              type="button"
                              onClick={() => setAddedIndoorKm((d) => d + 0.1)}
                              className="px-2 py-0.5 rounded-lg bg-[#20252C] hover:bg-[#282F38] text-[10px] font-bold text-[#1FD08A] border border-[#282F38] cursor-pointer"
                            >
                              +100m
                            </button>
                            <button
                              type="button"
                              onClick={() => setAddedIndoorKm((d) => d + 0.4)}
                              className="px-2 py-0.5 rounded-lg bg-[#20252C] hover:bg-[#282F38] text-[10px] font-bold text-[#1FD08A] border border-[#282F38] cursor-pointer"
                            >
                              +400m
                            </button>
                            <button
                              type="button"
                              onClick={() => setAddedIndoorKm((d) => d + 1.0)}
                              className="px-2 py-0.5 rounded-lg bg-[#20252C] hover:bg-[#282F38] text-[10px] font-bold text-[#1FD08A] border border-[#282F38] cursor-pointer"
                            >
                              +1km
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#15181D] p-3.5 rounded-xl border border-[#282F38] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8B0BB] block">
                          Tiempo restante del bloque
                        </span>
                        <span className="text-2xl sm:text-3xl font-black font-mono text-sky-400 tabular-nums">
                          {formatTimer(blockRemainingSec)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#A8B0BB] block">Duración objetivo</span>
                        <span className="text-xs font-bold text-white font-mono">
                          {formatTimer(currentBlock.targetValue)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Vista previa del siguiente bloque */}
                  {nextBlock && (
                    <div className="flex items-center justify-between text-[11px] bg-[#15181D]/60 px-3 py-1.5 rounded-xl border border-[#282F38]/60 text-[#A8B0BB]">
                      <span className="flex items-center gap-1.5 truncate">
                        <ChevronRight className="w-3.5 h-3.5 text-[#1FD08A] shrink-0" />
                        <span>Siguiente bloque:</span>
                        <strong className="text-white truncate">
                          {nextBlock.title}
                          {nextBlock.targetPace ? ` (${nextBlock.targetPace})` : ''}
                        </strong>
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400 shrink-0 ml-2">
                        ({currentBlockIndex + 2}/{workoutBlocks.length})
                      </span>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {/* Dashboard de métricas totales en tiempo real */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="bg-[#20252C] p-3 rounded-2xl border border-[#282F38] text-center">
              <span className="text-[10px] font-bold text-[#A8B0BB] uppercase tracking-wider block mb-0.5">
                Distancia
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono text-[#1FD08A]">
                {totalDistanceKm.toFixed(2)}
              </span>
              <span className="text-[10px] text-zinc-500 font-bold ml-1">km</span>
              {plannedSession && (
                <span className="block text-[10px] text-[#A8B0BB] mt-0.5">
                  Meta: {plannedSession.distanceKm} km
                </span>
              )}
            </div>

            <div className="bg-[#20252C] p-3 rounded-2xl border border-[#282F38] text-center">
              <span className="text-[10px] font-bold text-[#A8B0BB] uppercase tracking-wider block mb-0.5">
                Tiempo Total
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono text-[#F4F2ED] tabular-nums">
                {formatTimer(elapsedSeconds)}
              </span>
              {plannedSession && (
                <span className="block text-[10px] text-[#A8B0BB] mt-0.5">
                  Est: ~{plannedSession.estimatedDurationMin} min
                </span>
              )}
            </div>

            <div className="bg-[#20252C] p-3 rounded-2xl border border-[#282F38] text-center">
              <span className="text-[10px] font-bold text-[#A8B0BB] uppercase tracking-wider block mb-0.5">
                Ritmo
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono text-sky-400">
                {currentPaceStr.replace('/km', '')}
              </span>
              <span className="text-[10px] text-zinc-500 font-bold ml-1">/km</span>
              {activePaceBounds ? (
                <div className="mt-0.5">
                  <span className="block text-[9px] text-[#A8B0BB] truncate">
                    Rango: {activePaceBounds.rangeLabel.replace(' min/km', '')}
                  </span>
                  {livePaceZoneStatus === 'in_range' && (
                    <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-[#1FD08A]/15 text-[#1FD08A] text-[9px] font-black">
                      ✓ En rango
                    </span>
                  )}
                  {livePaceZoneStatus === 'too_fast' && (
                    <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-black">
                      ⚠️ Afloja un poco
                    </span>
                  )}
                  {livePaceZoneStatus === 'too_slow' && (
                    <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[9px] font-black">
                      ⚡ Aprieta el paso
                    </span>
                  )}
                </div>
              ) : plannedSession ? (
                <span className="block text-[10px] text-[#A8B0BB] mt-0.5 truncate">
                  Ref: {formatPaceRangeLabel(plannedSession.targetPaceLabel)}
                </span>
              ) : null}
            </div>
          </div>

          {/* Mapa Interactivo GPS */}
          <div className="flex flex-col min-h-[190px]">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#1FD08A]" />
                <span>
                  {isIndoor
                    ? 'Sesión en cinta / interior'
                    : `Recorrido GPS en Tiempo Real (${route.length} puntos)`}
                </span>
              </div>
              {gpsError && !isIndoor && (
                <span className="text-[10px] text-amber-400 font-medium truncate max-w-[220px]">
                  {gpsError}
                </span>
              )}
            </div>

            <div className="h-[190px] rounded-2xl overflow-hidden relative border border-[#282F38]">
              <RunningMap
                route={route}
                currentLocation={currentLocation}
                height="100%"
                interactive={true}
                autoFit={true}
              />
            </div>
          </div>
        </div>

        {/* Controles de Acción Inferiores */}
        <div className="p-3.5 sm:p-4 border-t border-[#282F38] bg-[#20252C] flex items-center justify-center gap-3">
          {!isTracking ? (
            <div className="w-full flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={startWorkoutWithGps}
                className="flex-1 py-3.5 bg-gradient-to-r from-[#1FD08A] to-teal-400 hover:from-[#1ab87a] hover:to-teal-300 text-[#15181D] font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all active:scale-[0.98] cursor-pointer"
              >
                <Play className="w-4 h-4 fill-[#15181D]" />
                <span>Iniciar Entrenamiento (Conexión GPS)</span>
              </button>
              <button
                onClick={startIndoor}
                className="py-3.5 px-4 bg-[#15181D] hover:bg-[#282F38] text-sky-300 border border-sky-500/30 font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Activity className="w-4 h-4 text-sky-400" />
                <span>Modo Cinta / Indoor</span>
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
                <span>Terminar Entrenamiento</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Modal Resumen al Terminar con Estado Completada vs Parcial/Incompleta */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#15181D] text-white rounded-3xl max-w-md w-full p-6 border border-[#282F38] shadow-2xl">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h4 className="text-lg font-black tracking-tight text-[#F4F2ED]">
                Resumen Real del Entrenamiento
              </h4>
              {plannedSession && (
                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                    previewStatus === 'completed'
                      ? 'bg-[#1FD08A]/20 text-[#1FD08A] border border-[#1FD08A]/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {previewStatus === 'completed' ? '✓ Sesión Completada' : '⏳ Parcial / Incompleta'}
                </span>
              )}
            </div>
            <p className="text-xs text-[#A8B0BB] mb-4">
              {plannedSession && previewStatus === 'partial'
                ? `Se guardará el avance real que hiciste hoy (${previewFinalDist.toFixed(2)} de ${plannedSession.distanceKm} km) y la sesión quedará marcada como Parcial/Pendiente.`
                : 'Tus métricas reales de tiempo, distancia y ritmo se registrarán automáticamente en tu historial:'}
            </p>

            <div className="grid grid-cols-3 gap-2 mb-4 bg-[#20252C] p-3.5 rounded-2xl border border-[#282F38] text-center">
              <div>
                <span className="text-[10px] text-[#A8B0BB] uppercase font-bold block">Distancia Real</span>
                <p className="text-base font-black text-[#1FD08A]">
                  {manualDistanceStr || totalDistanceKm.toFixed(2)} km
                </p>
              </div>
              <div>
                <span className="text-[10px] text-[#A8B0BB] uppercase font-bold block">Tiempo Real</span>
                <p className="text-base font-black text-white">
                  {elapsedSeconds < 60
                    ? `${elapsedSeconds}s`
                    : `${Math.floor(elapsedSeconds / 60)}m ${elapsedSeconds % 60}s`}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-[#A8B0BB] uppercase font-bold block">Ritmo Real</span>
                <p className="text-sm font-black text-sky-400">{currentPaceStr}</p>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <div>
                <label className="text-[11px] font-bold text-zinc-300 mb-1 block">
                  Distancia final en km {isIndoor ? '(según pantalla de la cinta):' : '(ajuste opcional si corriste en cinta):'}
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
                <label className="text-[11px] font-bold text-zinc-300 mb-1 block">Notas de sensaciones (opcional):</label>
                <input
                  type="text"
                  placeholder="Ej: Buenas sensaciones en las series de 1000m..."
                  value={runNotes}
                  onChange={(e) => setRunNotes(e.target.value)}
                  className="w-full bg-[#20252C] border border-[#282F38] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#1FD08A]"
                />
              </div>
            </div>

            <button
              onClick={handleConfirmSave}
              className="w-full py-3.5 bg-[#1FD08A] hover:bg-[#1ab87a] text-[#15181D] font-black rounded-xl text-xs transition-all shadow-md cursor-pointer"
            >
              {plannedSession && previewStatus === 'partial'
                ? 'Guardar Avance Real (Marcar Sesión Parcial)'
                : 'Guardar Entrenamiento Real'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
