import React, { useState, useEffect } from 'react';
import { 
  Footprints, 
  Plus, 
  Trash2, 
  X, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Cloud, 
  CloudOff, 
  LogOut, 
  Calendar, 
  Target, 
  ChevronDown, 
  ChevronUp, 
  Play, 
  Check, 
  Zap, 
  Gauge,
  Navigation,
  Compass,
  MapPin,
  Download,
  Sparkles,
  HelpCircle,
  SlidersHorizontal
} from 'lucide-react';
import {
  RunLog,
  RunType,
  RUN_TYPES,
  calculatePace,
  getWeeklyRunStats,
  getVolumeFeedback,
  getPolarizationFeedback,
} from '../lib/running';
import { fetchRunLogs, addRunLogCloud, deleteRunLogCloud } from '../lib/runningCloud';
import { syncLocalDataToCloud } from '../lib/syncLocalToCloud';
import { getPhaseFromWeeks, calculateWeeksUntilDate } from '../lib/periodization';
import { 
  RaceDistance, 
  generateRunningPlan, 
  calculateRaceFinishTime, 
  formatPaceDecimal, 
  formatPaceRangeLabel,
  PlannedRunningSession,
  RunningWorkoutBlock,
  getRunningCoachGuidance,
  getCustomRunningSessions,
  saveCustomRunningSession,
  deleteCustomRunningSession
} from '../lib/runningPlans';
import { calculatePacesFrom10K } from '../data/runningPlansData';
import { useAuth } from '../lib/auth';
import AuthScreen from './AuthScreen';
import RunningLiveTracker from './RunningLiveTracker';
import RunActivityDetailModal from './RunActivityDetailModal';
import { GeoPoint } from '../lib/gpx';

interface RunningModuleProps {
  nickname: string;
  onNotification?: (msg: string) => void;
}

export default function RunningModule({ nickname, onNotification }: RunningModuleProps) {
  const { user, signOut } = useAuth();
  const [logs, setLogs] = useState<RunLog[]>([]);
  const [loadingCloud, setLoadingCloud] = useState(false);
  const [showAuthScreen, setShowAuthScreen] = useState(false);
  const [showLiveTracker, setShowLiveTracker] = useState(false);
  const [trackerSession, setTrackerSession] = useState<PlannedRunningSession | null>(null);
  const [inspectedRouteLog, setInspectedRouteLog] = useState<RunLog | null>(null);
  const [hasLocalToSync, setHasLocalToSync] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  // Periodización hacia carrera / evento objetivo
  const [targetWeeks, setTargetWeeks] = useState<number>(12);
  const [weeksRemaining, setWeeksRemaining] = useState<number>(8);
  const [runningGoal, setRunningGoal] = useState<'salud_base' | 'ritmo_velocidad' | 'preparar_carrera'>('salud_base');
  const [showAdvancedPeriodization, setShowAdvancedPeriodization] = useState<boolean>(false);

  // Plan de Entrenamiento Guiado y Estados Reales (Completada vs Parcial/Incompleta)
  const [raceDistance, setRaceDistance] = useState<RaceDistance>('10K');
  const [targetPace, setTargetPace] = useState<number>(5.0); // 5:00 min/km por defecto
  const [completedPlanIds, setCompletedPlanIds] = useState<Record<string, boolean>>({});
  const [partialPlanInfo, setPartialPlanInfo] = useState<
    Record<string, { distanceKm: number; durationMin: number; completedBlocksCount: number; totalBlocksCount: number }>
  >({});
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [showAllSessions, setShowAllSessions] = useState<boolean>(false);

  // Rutinas de Running Personalizadas del usuario
  const [customSessions, setCustomSessions] = useState<PlannedRunningSession[]>([]);
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [customBuilderMode, setCustomBuilderMode] = useState<'blocks' | 'intervals'>('blocks');
  const [customName, setCustomName] = useState<string>('Cambio de Ritmo 3K + 1K');
  const [customFreeBlocks, setCustomFreeBlocks] = useState<
    {
      id: string;
      phaseType: 'warmup' | 'work' | 'recovery' | 'cooldown';
      targetType: 'distance' | 'time';
      valueStr: string; // km si es distance, segundos si es time
      paceStr: string;
    }[]
  >([
    { id: 'fb_1', phaseType: 'warmup', targetType: 'distance', valueStr: '3.0', paceStr: '5:35 - 5:50 min/km' },
    { id: 'fb_2', phaseType: 'work', targetType: 'distance', valueStr: '1.0', paceStr: '4:35 - 4:50 min/km' },
  ]);
  const [customWarmupKm, setCustomWarmupKm] = useState<string>('2.0');
  const [customReps, setCustomReps] = useState<string>('5');
  const [customIntervalMeters, setCustomIntervalMeters] = useState<string>('1000');
  const [customRestSec, setCustomRestSec] = useState<string>('90');
  const [customCooldownKm, setCustomCooldownKm] = useState<string>('1.5');
  const [customPaceLabel, setCustomPaceLabel] = useState<string>('4:25 - 4:40 min/km');

  useEffect(() => {
    setCustomSessions(getCustomRunningSessions(nickname));
  }, [nickname]);

  // Con sesión activa, los datos viven en Supabase (sincronizados entre dispositivos); sin
  // sesión, se usa el almacenamiento local de siempre, sin ningún cambio de comportamiento.
  useEffect(() => {
    if (user) {
      setLoadingCloud(true);
      fetchRunLogs(user.id).then((cloudLogs) => {
        setLogs(cloudLogs);
        setLoadingCloud(false);
      });
      return;
    }
    if (!nickname) return;
    try {
      const saved = localStorage.getItem(`fit_gen_${nickname}_running_logs_v1`);
      setLogs(saved ? JSON.parse(saved) : []);
      const savedTarget = localStorage.getItem(`fit_gen_${nickname}_running_target_weeks`);
      if (savedTarget) setTargetWeeks(parseInt(savedTarget, 10));
      const savedRem = localStorage.getItem(`fit_gen_${nickname}_running_weeks_rem`);
      if (savedRem) setWeeksRemaining(parseInt(savedRem, 10));
      const savedDist = localStorage.getItem(`fit_gen_${nickname}_running_race_dist`);
      if (savedDist) setRaceDistance(savedDist as RaceDistance);
      const savedPace = localStorage.getItem(`fit_gen_${nickname}_running_target_pace`);
      if (savedPace) setTargetPace(parseFloat(savedPace) || 5.0);
      const savedCompleted = localStorage.getItem(`fit_gen_${nickname}_running_plan_completed`);
      if (savedCompleted) setCompletedPlanIds(JSON.parse(savedCompleted));
      const savedPartial = localStorage.getItem(`fit_gen_${nickname}_running_plan_partial`);
      if (savedPartial) setPartialPlanInfo(JSON.parse(savedPartial));
    } catch (e) {
      setLogs([]);
    }
  }, [nickname, user]);

  // Solo se persiste en localStorage sin sesión activa: en la nube cada operación ya guarda por
  // su cuenta contra Supabase, así que no hay que duplicar el guardado aquí.
  useEffect(() => {
    if (user || !nickname) return;
    try {
      localStorage.setItem(`fit_gen_${nickname}_running_logs_v1`, JSON.stringify(logs));
    } catch (e) {
      console.error(e);
    }
  }, [logs, nickname, user]);

  useEffect(() => {
    if (!nickname) return;
    try {
      localStorage.setItem(`fit_gen_${nickname}_running_target_weeks`, String(targetWeeks));
      localStorage.setItem(`fit_gen_${nickname}_running_weeks_rem`, String(weeksRemaining));
      localStorage.setItem(`fit_gen_${nickname}_running_race_dist`, raceDistance);
      localStorage.setItem(`fit_gen_${nickname}_running_target_pace`, String(targetPace));
      localStorage.setItem(`fit_gen_${nickname}_running_plan_completed`, JSON.stringify(completedPlanIds));
      localStorage.setItem(`fit_gen_${nickname}_running_plan_partial`, JSON.stringify(partialPlanInfo));
    } catch (e) {
      console.error(e);
    }
  }, [targetWeeks, weeksRemaining, raceDistance, targetPace, completedPlanIds, partialPlanInfo, nickname]);

  useEffect(() => {
    if (user && nickname) {
      try {
        const localStr = localStorage.getItem(`fit_gen_${nickname}_running_logs_v1`);
        const localRuns = localStr ? JSON.parse(localStr) : [];
        setHasLocalToSync(localRuns.length > 0);
      } catch {
        setHasLocalToSync(false);
      }
    } else {
      setHasLocalToSync(false);
    }
  }, [user, nickname]);

  const handleSyncLocal = async () => {
    if (!user || !nickname) return;
    setSyncing(true);
    const res = await syncLocalDataToCloud(user.id, nickname);
    if (res.runningImported > 0) {
      const updated = await fetchRunLogs(user.id);
      setLogs(updated);
      setSyncMsg(`¡Se importaron ${res.runningImported} carreras locales a tu cuenta en la nube!`);
    } else {
      setSyncMsg('Tus carreras locales ya estaban sincronizadas en la nube.');
    }
    setHasLocalToSync(false);
    setSyncing(false);
    setTimeout(() => setSyncMsg(null), 5000);
  };

  const handleSelectGoal = (goal: 'salud_base' | 'ritmo_velocidad' | 'preparar_carrera') => {
    setRunningGoal(goal);
    if (goal === 'salud_base') {
      setTargetWeeks(8);
      setWeeksRemaining(8); // Semana 1 (Fase Base)
      setRaceDistance('5K');
    } else if (goal === 'ritmo_velocidad') {
      setTargetWeeks(12);
      setWeeksRemaining(Math.round(12 * 0.6)); // Semana 5 (Fase Umbral / Potencia)
      setRaceDistance('10K');
    } else if (goal === 'preparar_carrera') {
      setTargetWeeks(12);
      setWeeksRemaining(12);
    }
  };

  const handleSaveTrackedRun = async (
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
  ) => {
    const draft = {
      date: Date.now(),
      distanceKm: data.distanceKm,
      durationMin: data.durationMin,
      type: data.type,
      rpe: data.rpe,
      notes: data.notes,
      route: data.route,
    };

    if (user) {
      const saved = await addRunLogCloud(user.id, draft);
      if (saved) setLogs((prev) => [...prev, { ...saved, route: data.route }]);
    } else {
      const newLog: RunLog = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        ...draft,
      };
      setLogs((prev) => [...prev, newLog]);
    }

    if (completionMeta?.plannedSessionId) {
      const sId = completionMeta.plannedSessionId;
      if (completionMeta.status === 'completed') {
        setCompletedPlanIds((prev) => ({ ...prev, [sId]: true }));
        setPartialPlanInfo((prev) => {
          const next = { ...prev };
          delete next[sId];
          return next;
        });
        setSyncMsg(`¡Sesión completada al 100%! (${data.distanceKm} km registrados en tu historial)`);
      } else {
        setCompletedPlanIds((prev) => {
          const next = { ...prev };
          delete next[sId];
          return next;
        });
        setPartialPlanInfo((prev) => ({
          ...prev,
          [sId]: {
            distanceKm: data.distanceKm,
            durationMin: data.durationMin,
            completedBlocksCount: completionMeta.completedBlocksCount,
            totalBlocksCount: completionMeta.totalBlocksCount,
          },
        }));
        setSyncMsg(`Avance real guardado (${data.distanceKm} km). La sesión queda marcada como Parcial / En curso.`);
      }
      setTimeout(() => setSyncMsg(null), 5000);
    }
  };

  const handleCreateCustomRunningSession = () => {
    if (customBuilderMode === 'blocks') {
      const validBlocks = customFreeBlocks.filter((b) => (parseFloat(b.valueStr.replace(',', '.')) || 0) > 0);
      if (validBlocks.length === 0) return;

      let totalKm = 0;
      let totalTimeMin = 0;
      const customBlocks: RunningWorkoutBlock[] = [];
      const structure: string[] = [];

      validBlocks.forEach((b, idx) => {
        const val = parseFloat(b.valueStr.replace(',', '.')) || 1;
        const cleanPace = formatPaceRangeLabel(b.paceStr || '5:00 - 5:15 min/km', 8);
        const phaseLabel =
          b.phaseType === 'warmup'
            ? 'Calentamiento'
            : b.phaseType === 'work'
            ? `Bloque ${idx + 1}`
            : b.phaseType === 'recovery'
            ? 'Recuperación'
            : 'Vuelta a la calma';

        if (b.targetType === 'distance') {
          totalKm += val;
          totalTimeMin += val * 5.2;
          customBlocks.push({
            id: `cb_${idx + 1}`,
            phaseType: b.phaseType,
            title: `${phaseLabel} · ${val} km`,
            targetType: 'distance',
            targetValue: val,
            targetPace: cleanPace,
            instructions: `Corre ${val} km en el rango sugerido (${cleanPace}).`
          });
          structure.push(`${phaseLabel}: ${val} km a rango sugerido (${cleanPace}).`);
        } else {
          const secs = Math.round(val);
          totalTimeMin += secs / 60;
          customBlocks.push({
            id: `cb_${idx + 1}`,
            phaseType: b.phaseType,
            title: `${phaseLabel} · ${secs}s`,
            targetType: 'time',
            targetValue: secs,
            targetPace: b.phaseType === 'recovery' ? undefined : cleanPace,
            instructions:
              b.phaseType === 'recovery'
                ? `${secs} segundos de descanso o trote regenerativo.`
                : `${secs} segundos manteniendo rango ${cleanPace}.`
          });
          structure.push(
            b.phaseType === 'recovery'
              ? `Descanso de ${secs} segundos antes del siguiente bloque.`
              : `${phaseLabel}: ${secs} segundos a rango (${cleanPace}).`
          );
        }
      });

      const primaryWorkBlock = customBlocks.find((b) => b.phaseType === 'work') || customBlocks[0];
      const newSession: PlannedRunningSession = {
        id: `custom_run_${Date.now()}`,
        dayTitle: 'Sesión Personalizada por Bloques',
        type: 'tempo',
        name: customName.trim() || `Ruta por Bloques (${ Math.round(totalKm * 10) / 10 } km)`,
        distanceKm: Math.max(0.5, Math.round(totalKm * 100) / 100),
        targetPaceLabel: primaryWorkBlock?.targetPace || '5:00 - 5:15 min/km',
        estimatedDurationMin: Math.max(10, Math.round(totalTimeMin)),
        rpe: 7,
        focus: 'Transición automática entre bloques con aviso de nuevo ritmo sugerido y control de rango en vivo.',
        structure,
        isCustom: true,
        customBlocks
      };

      const updated = saveCustomRunningSession(nickname, newSession);
      setCustomSessions(updated);
      setSelectedSessionId(newSession.id);
      setShowCustomModal(false);
      if (onNotification) onNotification(`¡Rutina "${newSession.name}" creada con ${customBlocks.length} bloques!`);
      return;
    }

    const warmupKm = Math.max(0, parseFloat(customWarmupKm.replace(',', '.')) || 0);
    const reps = Math.max(1, parseInt(customReps, 10) || 1);
    const meters = Math.max(100, parseInt(customIntervalMeters, 10) || 1000);
    const restSec = Math.max(0, parseInt(customRestSec, 10) || 60);
    const cooldownKm = Math.max(0, parseFloat(customCooldownKm.replace(',', '.')) || 0);
    const intervalKm = Math.round((meters / 1000) * 1000) / 1000;
    const totalKm = Math.round((warmupKm + reps * intervalKm + cooldownKm) * 100) / 100;
    const formattedRange = formatPaceRangeLabel(customPaceLabel, 8);

    const customBlocks: RunningWorkoutBlock[] = [];
    let bIdx = 1;
    if (warmupKm > 0) {
      customBlocks.push({
        id: `cb_${bIdx++}`,
        phaseType: 'warmup',
        title: `Calentamiento · ${warmupKm} km`,
        targetType: 'distance',
        targetValue: warmupKm,
        targetPace: `${paceZones.easyZone12.min.replace('/km', '')} - ${paceZones.easyZone12.max.replace('/km', '')} min/km`,
        instructions: `${warmupKm} km de trote suave de calentamiento.`
      });
    }
    for (let r = 1; r <= reps; r++) {
      customBlocks.push({
        id: `cb_${bIdx++}`,
        phaseType: 'work',
        title: `Serie ${r} de ${reps} · ${meters}m`,
        targetType: 'distance',
        targetValue: intervalKm,
        targetPace: formattedRange,
        instructions: `Completa ${meters}m dentro del rango (${formattedRange}).`
      });
      if (restSec > 0) {
        customBlocks.push({
          id: `cb_${bIdx++}`,
          phaseType: 'recovery',
          title: `Descanso ${r} de ${reps} · ${restSec}s`,
          targetType: 'time',
          targetValue: restSec,
          instructions: `${restSec} segundos de recuperación antes del siguiente bloque.`
        });
      }
    }
    if (cooldownKm > 0) {
      customBlocks.push({
        id: `cb_${bIdx++}`,
        phaseType: 'cooldown',
        title: `Vuelta a la calma · ${cooldownKm} km`,
        targetType: 'distance',
        targetValue: cooldownKm,
        targetPace: `${paceZones.easyZone12.min.replace('/km', '')} - ${paceZones.easyZone12.max.replace('/km', '')} min/km`,
        instructions: `${cooldownKm} km de trote muy suave regenerativo.`
      });
    }

    const structure: string[] = [];
    if (warmupKm > 0) structure.push(`${warmupKm} km de trote suave de calentamiento.`);
    structure.push(`${reps} repeticiones de ${meters}m exactos a rango objetivo (${formattedRange}).`);
    if (restSec > 0) structure.push(`${restSec} segundos de recuperación entre cada serie.`);
    if (cooldownKm > 0) structure.push(`${cooldownKm} km de trote suave de vuelta a la calma.`);

    const newSession: PlannedRunningSession = {
      id: `custom_run_${Date.now()}`,
      dayTitle: 'Sesión Personalizada',
      type: reps > 1 ? 'series' : 'tempo',
      name: customName.trim() || `Series ${reps} × ${meters}m`,
      distanceKm: Math.max(0.5, totalKm),
      targetPaceLabel: formattedRange || '4:25 - 4:40 min/km',
      estimatedDurationMin: Math.max(15, Math.round(totalKm * 5.2 + (reps * restSec) / 60)),
      rpe: 8,
      focus: 'Entrenamiento estructurado personalizado con guía de bloques y alertas en vivo.',
      structure,
      isCustom: true,
      customBlocks
    };

    const updated = saveCustomRunningSession(nickname, newSession);
    setCustomSessions(updated);
    setSelectedSessionId(newSession.id);
    setShowCustomModal(false);
    if (onNotification) onNotification(`¡Rutina de running "${newSession.name}" creada!`);
  };

  const handleDeleteRun = async (id: string) => {
    if (user) {
      const ok = await deleteRunLogCloud(id);
      if (!ok) return;
    }
    setLogs((prev) => prev.filter((l) => l.id !== id));
  };

  const sortedLogs = [...logs].sort((a, b) => b.date - a.date);
  const weekStats = getWeeklyRunStats(logs, 0);
  const volumeFeedback = getVolumeFeedback(logs);
  const polarizationFeedback = getPolarizationFeedback(weekStats);

  const currentWeekNumber = Math.max(1, targetWeeks - weeksRemaining + 1);
  const phaseDetails = getPhaseFromWeeks(weeksRemaining, targetWeeks, 'running');
  const plannedSessions = generateRunningPlan(
    raceDistance,
    targetPace,
    phaseDetails.phase,
    currentWeekNumber,
    targetWeeks
  );
  const allAvailableSessions = [...plannedSessions, ...customSessions];
  const coachGuidance = getRunningCoachGuidance(
    phaseDetails.phase,
    raceDistance,
    currentWeekNumber,
    targetWeeks,
    targetPace
  );
  const paceZones = calculatePacesFrom10K(targetPace);
  const typeLabel = (t: RunType) => RUN_TYPES.find((rt) => rt.id === t)?.label || t;

  const formatLogDuration = (min: number) => {
    const totalSec = Math.round(min * 60);
    if (totalSec < 60) return `${totalSec}s`;
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return s > 0 ? `${m}m ${s}s` : `${m}min`;
  };

  // Sesión actualmente seleccionada por el atleta (libertad total de inspección y orden)
  const activeSession = allAvailableSessions.find((s) => s.id === selectedSessionId) || plannedSessions[0];
  const isActiveCompleted = Boolean(completedPlanIds[activeSession.id]);
  const activePartialInfo = partialPlanInfo[activeSession.id];

  const openWorkoutTracker = (session: PlannedRunningSession | null) => {
    setTrackerSession(session);
    setShowLiveTracker(true);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-start justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-[#F4F2ED] flex items-center gap-2.5">
            <Footprints className="w-6 h-6 text-[#1FD08A]" />
            Running
          </h2>
          <p className="text-[#A8B0BB] text-sm mt-1">
            Planes periodizados inteligentes (80/20), guía de series por bloques y GPS en tiempo real
          </p>
        </div>
        <div className="relative flex items-center gap-2 flex-wrap">
          {user && (
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold px-3 py-2.5 rounded-xl text-xs transition-all shrink-0 cursor-pointer"
              title={`Conectado como ${user.email} — clic para salir`}
            >
              <Cloud className="w-3.5 h-3.5" />
              <span className="hidden sm:inline max-w-[120px] truncate">{user.email}</span>
            </button>
          )}

          <button
            onClick={() => setShowCustomModal(true)}
            className="flex items-center gap-1.5 bg-[#20252C] hover:bg-[#282F38] text-[#F4F2ED] border border-[#282F38] font-bold px-3.5 py-2.5 rounded-2xl text-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#5B8DEF]" />
            <span>Crear Rutina Running</span>
          </button>

          <button
            onClick={() => openWorkoutTracker(null)}
            className="flex items-center gap-2 bg-[#1FD08A] hover:bg-[#1ab87a] text-[#15181D] font-black px-4 py-2.5 rounded-2xl text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Iniciar Carrera Libre</span>
          </button>
        </div>
      </div>

      {syncMsg && (
        <div className="mb-4 bg-emerald-500 text-zinc-950 rounded-2xl p-3 font-bold text-xs animate-fadeIn">
          {syncMsg}
        </div>
      )}

      {hasLocalToSync && user && (
        <div className="mb-4 bg-emerald-950/30 border border-emerald-500/40 rounded-2xl p-3.5 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <Cloud className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs font-black text-[#F4F2ED]">Datos locales encontrados</p>
              <p className="text-[11px] text-emerald-300">Tienes carreras registradas en este dispositivo. ¿Deseas subirlas a tu cuenta?</p>
            </div>
          </div>
          <button
            onClick={handleSyncLocal}
            disabled={syncing}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition-all shrink-0 cursor-pointer"
          >
            {syncing ? 'Subiendo...' : 'Importar a la nube'}
          </button>
        </div>
      )}

      {/* SELECTOR DE OBJETIVO PARA EL ATLETA (INTUITIVO PARA PRINCIPIANTES) */}
      <div className="mb-5 bg-[#20252C] border border-[#282F38] rounded-3xl p-4 sm:p-5 text-white shadow-xl space-y-3.5">
        <div className="flex items-center justify-between gap-2 flex-wrap pb-2.5 border-b border-[#282F38]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1FD08A] inline-block" />
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#F4F2ED]">
              ¿Cuál es tu objetivo de entrenamiento?
            </h3>
          </div>
          <button
            onClick={() => setShowAdvancedPeriodization(!showAdvancedPeriodization)}
            className="text-[11px] font-bold text-[#A8B0BB] hover:text-[#1FD08A] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#5B8DEF]" />
            <span>{showAdvancedPeriodization ? 'Ocultar ajuste avanzado' : 'Ajustar semanas y fases manualmente'}</span>
          </button>
        </div>

        {/* 3 Tarjetas de Objetivo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          <button
            onClick={() => handleSelectGoal('salud_base')}
            className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
              runningGoal === 'salud_base'
                ? 'bg-[#1FD08A]/15 border-[#1FD08A] shadow-md shadow-emerald-950/30'
                : 'bg-[#15181D] border-[#282F38] hover:border-[#1FD08A]/40'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-black text-[#1FD08A] uppercase tracking-wider flex items-center gap-1.5">
                  <span>🟢</span> 1. Salud y Base (Z2)
                </span>
                {runningGoal === 'salud_base' && <Check className="w-4 h-4 text-[#1FD08A]" />}
              </div>
              <p className="text-[11px] text-zinc-300 leading-snug">
                Ideal para iniciarte, quemar grasa y ganar capacidad pulmonar corriendo a ritmo conversacional sin dolor ni fatiga extrema.
              </p>
            </div>
            <span className="text-[10px] font-bold text-[#1FD08A] bg-[#1FD08A]/10 border border-[#1FD08A]/20 px-2.5 py-0.5 rounded-lg self-start">
              80% Ritmo Cómodo
            </span>
          </button>

          <button
            onClick={() => handleSelectGoal('ritmo_velocidad')}
            className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
              runningGoal === 'ritmo_velocidad'
                ? 'bg-[#5B8DEF]/15 border-[#5B8DEF] shadow-md shadow-blue-950/30'
                : 'bg-[#15181D] border-[#282F38] hover:border-[#5B8DEF]/40'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-black text-[#5B8DEF] uppercase tracking-wider flex items-center gap-1.5">
                  <span>🟡</span> 2. Mejorar Ritmo &amp; Velocidad
                </span>
                {runningGoal === 'ritmo_velocidad' && <Check className="w-4 h-4 text-[#5B8DEF]" />}
              </div>
              <p className="text-[11px] text-zinc-300 leading-snug">
                Para romper tu estancamiento y correr más rápido. Desarrolla tolerancia al lactato y resistencia mediante cambios de ritmo y series.
              </p>
            </div>
            <span className="text-[10px] font-bold text-[#5B8DEF] bg-[#5B8DEF]/10 border border-[#5B8DEF]/20 px-2.5 py-0.5 rounded-lg self-start">
              Fase Umbral y Series
            </span>
          </button>

          <button
            onClick={() => handleSelectGoal('preparar_carrera')}
            className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
              runningGoal === 'preparar_carrera'
                ? 'bg-[#FB923C]/15 border-[#FB923C] shadow-md shadow-orange-950/30'
                : 'bg-[#15181D] border-[#282F38] hover:border-[#FB923C]/40'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-black text-[#FB923C] uppercase tracking-wider flex items-center gap-1.5">
                  <span>🟣</span> 3. Preparar Carrera
                </span>
                {runningGoal === 'preparar_carrera' && <Check className="w-4 h-4 text-[#FB923C]" />}
              </div>
              <p className="text-[11px] text-zinc-300 leading-snug">
                Planificación estructurada para una competencia (5K a 42K) con fases de volumen, especificidad de ritmo y afinamiento (tapering).
              </p>
            </div>
            <span className="text-[10px] font-bold text-[#FB923C] bg-[#FB923C]/10 border border-[#FB923C]/20 px-2.5 py-0.5 rounded-lg self-start">
              Plan Periodizado Completo
            </span>
          </button>
        </div>
      </div>

      {/* BANNER DE PERIODIZACIÓN Y ADAPTACIÓN DEL PLAN */}
      <div className="mb-5 bg-[#20252C] border border-[#282F38] rounded-3xl p-4 sm:p-5 text-white shadow-xl space-y-4">
        {/* Cabecera del ciclo */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#282F38]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1FD08A]/15 border border-[#1FD08A]/30 flex items-center justify-center text-[#1FD08A]">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#1FD08A]">
                  Periodización Adaptativa
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${phaseDetails.badgeColor}`}>
                  {coachGuidance.phaseBadge} · SEMANA {currentWeekNumber}/{targetWeeks}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-[#F4F2ED] mt-0.5">
                {coachGuidance.headline}
              </h3>
            </div>
          </div>

          {/* Stepper de semana */}
          <div className="flex items-center gap-1.5 bg-[#15181D] border border-[#282F38] rounded-2xl p-1.5">
            <button
              onClick={() => {
                const prev = Math.max(1, currentWeekNumber - 1);
                setWeeksRemaining(targetWeeks - prev + 1);
              }}
              disabled={currentWeekNumber <= 1}
              className="w-7 h-7 rounded-xl bg-[#20252C] hover:bg-[#282F38] disabled:opacity-30 text-[#F4F2ED] font-black text-sm flex items-center justify-center transition-colors cursor-pointer"
              title="Semana anterior"
            >
              -
            </button>
            <div className="px-2 text-center">
              <span className="text-[10px] text-[#A8B0BB] font-bold block uppercase">Semana</span>
              <span className="text-xs font-mono font-black text-[#1FD08A]">
                {currentWeekNumber} / {targetWeeks}
              </span>
            </div>
            <button
              onClick={() => {
                const next = Math.min(targetWeeks, currentWeekNumber + 1);
                setWeeksRemaining(targetWeeks - next + 1);
              }}
              disabled={currentWeekNumber >= targetWeeks}
              className="w-7 h-7 rounded-xl bg-[#20252C] hover:bg-[#282F38] disabled:opacity-30 text-[#F4F2ED] font-black text-sm flex items-center justify-center transition-colors cursor-pointer"
              title="Siguiente semana"
            >
              +
            </button>
          </div>
        </div>

        {/* Duración del ciclo y Selector de fase avanzado (desplegable para no abrumar a principiantes) */}
        {showAdvancedPeriodization && (
          <div className="p-3.5 bg-[#15181D] rounded-2xl border border-[#282F38] space-y-3 animate-fadeIn">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-[#A8B0BB] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#5B8DEF]" /> Duración ciclo:
                </span>
                <div className="flex gap-1.5">
                  {[
                    { w: 8, label: '8 sem (Rápido)' },
                    { w: 12, label: '12 sem (Recomendado)' },
                    { w: 16, label: '16 sem (Completo)' }
                  ].map((item) => (
                    <button
                      key={item.w}
                      onClick={() => {
                        setTargetWeeks(item.w);
                        if (currentWeekNumber > item.w) {
                          setWeeksRemaining(1);
                        } else {
                          setWeeksRemaining(item.w - currentWeekNumber + 1);
                        }
                      }}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-black transition-all border cursor-pointer ${
                        targetWeeks === item.w
                          ? 'bg-[#1FD08A] border-[#1FD08A] text-[#15181D] shadow-sm'
                          : 'bg-[#20252C] border-[#282F38] text-[#A8B0BB] hover:text-[#F4F2ED]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Salto directo a fases */}
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[10px] uppercase font-bold text-zinc-500 mr-1">Ir a fase:</span>
                {[
                  { id: 'base', name: '1. Base', week: 1 },
                  { id: 'potencia', name: '2. Umbral', week: Math.round(targetWeeks * 0.4) },
                  { id: 'compromised', name: '3. Específico', week: Math.round(targetWeeks * 0.75) },
                  { id: 'tapering', name: '4. Tapering', week: targetWeeks }
                ].map((p) => {
                  const isActive = phaseDetails.phase === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setWeeksRemaining(targetWeeks - p.week + 1)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all border cursor-pointer ${
                        isActive
                          ? 'bg-[#5B8DEF] border-[#5B8DEF] text-white shadow-sm'
                          : 'bg-[#20252C] border-[#282F38] text-[#A8B0BB] hover:text-[#F4F2ED]'
                      }`}
                    >
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tarjeta de Asesoramiento del Coach Experto */}
        <div className="bg-[#15181D] border border-[#282F38] rounded-2xl p-3.5 sm:p-4 space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-xs font-black text-[#F4F2ED] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#1FD08A]" />
              Fisiología de la semana: {phaseDetails.name}
            </p>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-[#A8B0BB]">Volumen sugerido esta semana:</span>
              <span className="font-mono font-black text-[#1FD08A] bg-[#1FD08A]/10 border border-[#1FD08A]/20 px-2 py-0.5 rounded-lg">
                {coachGuidance.weeklyVolumeKm} km totales
              </span>
            </div>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            {coachGuidance.explanation}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-[#282F38] text-[11px] text-[#A8B0BB]">
            {coachGuidance.coachTips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-1.5">
                <span className="text-[#1FD08A] font-bold shrink-0">•</span>
                <span className="leading-snug">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MÉTRICAS DE VOLUMEN DE ESTA SEMANA (DARK THEME) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-[#20252C] border border-[#282F38] rounded-2xl p-3.5">
          <p className="text-[10px] uppercase font-black text-[#A8B0BB] tracking-wider">Esta semana</p>
          <p className="text-xl font-black text-[#F4F2ED]">{weekStats.totalKm.toFixed(1)} km</p>
        </div>
        <div className="bg-[#20252C] border border-[#282F38] rounded-2xl p-3.5">
          <p className="text-[10px] uppercase font-black text-[#A8B0BB] tracking-wider">Sesiones</p>
          <p className="text-xl font-black text-[#F4F2ED]">{weekStats.sessionCount}</p>
        </div>
        <div className="bg-[#20252C] border border-[#282F38] rounded-2xl p-3.5">
          <p className="text-[10px] uppercase font-black text-[#A8B0BB] tracking-wider">Fácil (Zona 1-2)</p>
          <p className="text-xl font-black text-[#1FD08A]">
            {weekStats.totalKm === 0 && weekStats.sessionCount === 0 ? '—' : `${weekStats.easyPct}%`}
          </p>
        </div>
        <div className="bg-[#20252C] border border-[#282F38] rounded-2xl p-3.5">
          <p className="text-[10px] uppercase font-black text-[#A8B0BB] tracking-wider">Moderado-fuerte</p>
          <p className="text-xl font-black text-[#FB923C]">
            {weekStats.totalKm === 0 && weekStats.sessionCount === 0 ? '—' : `${weekStats.hardPct}%`}
          </p>
        </div>
      </div>

      {polarizationFeedback && (
        <div className="mb-2.5 flex items-start gap-2 bg-[#5B8DEF]/10 border border-[#5B8DEF]/30 rounded-xl px-3 py-2 text-[#5B8DEF]">
          <TrendingUp className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <p className="text-[11px] leading-snug">{polarizationFeedback}</p>
        </div>
      )}
      {volumeFeedback && (
        <div
          className={`mb-4 flex items-start gap-2 rounded-xl px-3 py-2 border ${
            volumeFeedback.level === 'watch'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          }`}
        >
          {volumeFeedback.level === 'watch' ? (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
          )}
          <p className="text-[11px] leading-snug">
            {volumeFeedback.text}
          </p>
        </div>
      )}

      {/* SECCIÓN DEL PLAN DE ENTRENAMIENTO DE CARRERA */}
      <div className="mb-6 bg-[#20252C] border border-[#282F38] rounded-3xl p-5 text-white shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#282F38] pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                Plan de Carrera Inteligente
              </span>
              <span className="text-[#A8B0BB] text-xs font-bold">
                Meta estimada: {calculateRaceFinishTime(raceDistance, targetPace)}
              </span>
            </div>
            <h3 className="text-base md:text-lg font-black tracking-tight text-[#F4F2ED] flex items-center gap-2">
              <Gauge className="w-5 h-5 text-[#1FD08A]" />
              Estructura Semanal para {raceDistance} a {formatPaceDecimal(targetPace)}
            </h3>
            <p className="text-[#A8B0BB] text-xs mt-0.5">
              4 sesiones científicas adaptadas a la <strong className="text-white">{phaseDetails.name}</strong>.
            </p>
          </div>

          {/* Selectores de Distancia */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(['5K', '10K', '21K', '42K'] as RaceDistance[]).map((d) => (
              <button
                key={d}
                onClick={() => setRaceDistance(d)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                  raceDistance === d
                    ? 'bg-[#1FD08A] border-[#1FD08A] text-[#15181D] shadow-md'
                    : 'bg-[#15181D] border-[#282F38] text-[#A8B0BB] hover:text-white'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* SELECTOR DE RITMO OBJETIVO */}
        <div className="bg-[#15181D] border border-[#282F38] rounded-2xl p-3.5 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#A8B0BB]">Pace Meta (Ritmo Objetivo):</span>
            <span className="font-mono font-black text-[#1FD08A] text-xs md:text-sm bg-[#1FD08A]/10 border border-[#1FD08A]/20 px-2 py-0.5 rounded-lg">
              {formatPaceDecimal(targetPace)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-zinc-500 font-bold uppercase">Ritmos rápidos:</span>
            {[4.0, 4.5, 5.0, 5.5, 6.0, 6.5].map((p) => (
              <button
                key={p}
                onClick={() => setTargetPace(p)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                  targetPace === p
                    ? 'bg-[#5B8DEF] border-[#5B8DEF] text-white font-black'
                    : 'bg-[#20252C] border-[#282F38] text-[#A8B0BB] hover:text-white'
                }`}
              >
                {formatPaceDecimal(p).replace(' min/km', '')}
              </button>
            ))}
          </div>
        </div>

        {/* ZONAS DE RITMO CALCULADAS AUTOMÁTICAMENTE */}
        <div className="bg-[#15181D] border border-[#282F38] rounded-2xl p-3.5 mb-5">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-black uppercase tracking-wider text-zinc-200">
                Tus 4 Zonas de Ritmo Calculadas
              </span>
            </div>
            <span className="text-[10px] text-[#1FD08A] font-bold bg-[#1FD08A]/10 border border-[#1FD08A]/20 px-2 py-0.5 rounded-full">
              Fórmula de Ritmos 80/20
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-left">
            <div className="bg-[#20252C] border border-[#282F38] rounded-xl p-2.5">
              <div className="text-[10px] font-black text-[#1FD08A] uppercase tracking-wider">1. Suave (80% del tiempo)</div>
              <div className="text-xs md:text-sm font-black text-white font-mono mt-0.5">{paceZones.easyZone12.max} – {paceZones.easyZone12.min}</div>
              <p className="text-[10px] text-[#A8B0BB] mt-1 leading-tight">Zona 2. Puedes hablar fluidamente sin ahogarte.</p>
            </div>
            <div className="bg-[#20252C] border border-[#282F38] rounded-xl p-2.5">
              <div className="text-[10px] font-black text-[#5B8DEF] uppercase tracking-wider">2. Tempo (Alegre)</div>
              <div className="text-xs md:text-sm font-black text-white font-mono mt-0.5">{paceZones.tempoPace.max} – {paceZones.tempoPace.min}</div>
              <p className="text-[10px] text-[#A8B0BB] mt-1 leading-tight">Ritmo constante que cuesta pero aguantas varios km.</p>
            </div>
            <div className="bg-[#20252C] border border-[#282F38] rounded-xl p-2.5">
              <div className="text-[10px] font-black text-[#FB923C] uppercase tracking-wider">3. Umbral (Exigente)</div>
              <div className="text-xs md:text-sm font-black text-white font-mono mt-0.5">{paceZones.umbralPace.max} – {paceZones.umbralPace.min}</div>
              <p className="text-[10px] text-[#A8B0BB] mt-1 leading-tight">Para series medias. Retrasa la sensación de fatiga.</p>
            </div>
            <div className="bg-[#20252C] border border-[#282F38] rounded-xl p-2.5">
              <div className="text-[10px] font-black text-rose-400 uppercase tracking-wider">4. Velocidad / VO2</div>
              <div className="text-xs md:text-sm font-black text-white font-mono mt-0.5">{paceZones.sprint400m.min} – {paceZones.sprint400m.max}</div>
              <p className="text-[10px] text-[#A8B0BB] mt-1 leading-tight">Series cortas explosivas para elevar el consumo de O2.</p>
            </div>
          </div>
        </div>

        {/* SELECTOR DE LAS 4 SESIONES CON LIBERTAD TOTAL DE ELECCIÓN */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#F4F2ED] block">
                Sesiones de la semana (Elige cuál realizar hoy)
              </span>
              <p className="text-[11px] text-[#A8B0BB]">
                Selecciona cualquier sesión y pulsa <strong>Iniciar Entrenamiento</strong> para que la app te guíe bloque por bloque en vivo.
              </p>
            </div>
            <span className="text-[11px] font-bold text-[#1FD08A] bg-[#1FD08A]/10 border border-[#1FD08A]/20 px-2.5 py-0.5 rounded-full">
              {plannedSessions.filter((s) => completedPlanIds[s.id]).length} de 4 completadas
            </span>
          </div>

          {/* Fila de 4 tarjetas/píldoras de sesión */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {plannedSessions.map((session, sIdx) => {
              const isSelected = activeSession.id === session.id;
              const isCompleted = Boolean(completedPlanIds[session.id]);
              const partialInfo = partialPlanInfo[session.id];
              const num = sIdx + 1;

              return (
                <button
                  key={session.id}
                  onClick={() => setSelectedSessionId(session.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-[#5B8DEF]/15 border-[#5B8DEF] ring-2 ring-[#5B8DEF] shadow-lg'
                      : isCompleted
                      ? 'bg-[#15181D] border-emerald-500/40 opacity-95'
                      : partialInfo
                      ? 'bg-[#15181D] border-amber-500/40'
                      : 'bg-[#15181D] border-[#282F38] hover:border-[#38414D]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-black uppercase text-[#5B8DEF]">
                      Sesión {num}
                    </span>
                    {isCompleted ? (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5" /> Hecha
                      </span>
                    ) : partialInfo ? (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        ⏳ Parcial ({partialInfo.distanceKm}km)
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-zinc-500">
                        Pendiente
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-white truncate leading-tight">{session.name}</p>
                  <div className="flex items-center justify-between mt-1 pt-1 border-t border-[#282F38]/60 text-[10px]">
                    <span className="font-mono text-[#1FD08A] font-bold">{session.distanceKm} km</span>
                    <span className="text-[#A8B0BB]">{session.estimatedDurationMin} min</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* RUTINAS DE RUNNING PERSONALIZADAS DEL ATLETA */}
          {customSessions.length > 0 && (
            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#1FD08A]">
                  ✨ Tus Rutinas de Running Personalizadas ({customSessions.length})
                </span>
                <button
                  onClick={() => setShowCustomModal(true)}
                  className="text-[10px] font-bold text-[#5B8DEF] hover:underline cursor-pointer"
                >
                  + Añadir otra
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {customSessions.map((cSession) => {
                  const isSelected = activeSession.id === cSession.id;
                  const isCompleted = Boolean(completedPlanIds[cSession.id]);
                  const partialInfo = partialPlanInfo[cSession.id];
                  return (
                    <div
                      key={cSession.id}
                      onClick={() => setSelectedSessionId(cSession.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-[#1FD08A]/15 border-[#1FD08A] ring-1 ring-[#1FD08A]'
                          : 'bg-[#15181D] border-[#282F38] hover:border-[#1FD08A]/40'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[9px] font-black uppercase text-[#1FD08A] bg-[#1FD08A]/10 px-1.5 py-0.5 rounded">
                            Personalizada
                          </span>
                          {isCompleted && (
                            <span className="text-[9px] font-black text-emerald-400">✓ Hecha</span>
                          )}
                          {!isCompleted && partialInfo && (
                            <span className="text-[9px] font-black text-amber-300">
                              ⏳ Parcial ({partialInfo.distanceKm} km)
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-white truncate">{cSession.name}</p>
                        <p className="text-[10px] text-[#A8B0BB] font-mono">
                          {cSession.distanceKm} km · {cSession.targetPaceLabel}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const next = deleteCustomRunningSession(nickname, cSession.id);
                          setCustomSessions(next);
                          if (selectedSessionId === cSession.id) {
                            setSelectedSessionId(plannedSessions[0].id);
                          }
                        }}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar rutina personalizada"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TARJETA DETALLADA DE LA SESIÓN SELECCIONADA */}
          <div className="bg-[#15181D] border-2 border-[#5B8DEF]/60 rounded-3xl p-5 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-[#5B8DEF]/20 text-[#5B8DEF] font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full border border-[#5B8DEF]/30">
                  {activeSession.dayTitle}
                </span>
                <span className="text-[10px] font-bold text-[#A8B0BB] bg-[#20252C] px-2 py-0.5 rounded-full">
                  Esfuerzo RPE {activeSession.rpe}/10
                </span>
                <span className="text-[10px] font-bold text-[#A8B0BB] bg-[#20252C] px-2 py-0.5 rounded-full">
                  ~{activeSession.estimatedDurationMin} min
                </span>
                {isActiveCompleted && (
                  <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    ✓ Sesión Completada
                  </span>
                )}
                {!isActiveCompleted && activePartialInfo && (
                  <span className="text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                    ⏳ Parcial / Incompleta: {activePartialInfo.distanceKm} de {activeSession.distanceKm} km ({activePartialInfo.completedBlocksCount}/{activePartialInfo.totalBlocksCount} bloques)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-black text-[#1FD08A] bg-[#1FD08A]/10 border border-[#1FD08A]/20 px-2.5 py-0.5 rounded-lg">
                  {activeSession.distanceKm} km
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-base sm:text-lg font-black text-white">{activeSession.name}</h4>
              <p className="text-xs text-[#A8B0BB] font-semibold mt-0.5">
                Rango de ritmo sugerido:{' '}
                <span className="text-[#1FD08A] font-bold font-mono">
                  {formatPaceRangeLabel(activeSession.targetPaceLabel, 8)}
                </span>
              </p>
            </div>

            {/* Estructura detallada del entrenamiento */}
            <div className="space-y-2 border-t border-[#282F38] pt-3">
              <span className="text-[10px] font-black uppercase text-[#A8B0BB] tracking-wider block">
                Estructura paso a paso de la sesión (Guía automática en vivo):
              </span>
              {activeSession.structure.map((st, i) => (
                <div key={i} className="text-xs text-zinc-300 leading-relaxed flex items-start gap-2 bg-[#20252C]/40 p-2 rounded-xl">
                  <span className="text-[#5B8DEF] font-bold shrink-0 mt-0.5">•</span>
                  <span>{st}</span>
                </div>
              ))}
            </div>

            {/* Botón único de acción directa: Iniciar Entrenamiento con Guía en Vivo y GPS */}
            <div className="pt-3 border-t border-[#282F38] flex items-center justify-between gap-3 flex-wrap">
              <span className="text-[11px] text-[#A8B0BB] italic max-w-sm">
                💡 {activeSession.focus}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openWorkoutTracker(activeSession)}
                  className="px-6 py-3 bg-[#1FD08A] hover:bg-[#1ab87a] text-[#15181D] font-black text-xs sm:text-sm rounded-2xl flex items-center gap-2 shadow-[0_6px_20px_rgba(31,208,138,0.28)] transition-all active:scale-95 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>
                    {isActiveCompleted
                      ? 'Repetir Entrenamiento'
                      : activePartialInfo
                      ? 'Continuar / Iniciar Entrenamiento'
                      : 'Iniciar Entrenamiento'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* VISTA GENERAL COMPLETA DESPLEGABLE (OPCIONAL) */}
          <div className="pt-2">
            <button
              onClick={() => setShowAllSessions(!showAllSessions)}
              className="text-xs text-[#A8B0BB] hover:text-[#F4F2ED] flex items-center gap-1 cursor-pointer font-bold"
            >
              {showAllSessions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>{showAllSessions ? 'Ocultar vista general de la semana' : 'Ver resumen de las 4 sesiones juntas'}</span>
            </button>

            {showAllSessions && (
              <div className="mt-3 space-y-2 animate-fadeIn">
                {plannedSessions.map((s, idx) => (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSessionId(s.id)}
                    className="p-3 bg-[#15181D] border border-[#282F38] hover:border-[#5B8DEF] rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-[#5B8DEF]">Sesión {idx + 1}</span>
                        <span className="text-xs font-bold text-white">{s.name}</span>
                      </div>
                      <p className="text-[11px] text-[#A8B0BB] mt-0.5">
                        {s.distanceKm} km · {s.targetPaceLabel} · {s.focus}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {completedPlanIds[s.id] ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          Hecha ✓
                        </span>
                      ) : partialPlanInfo[s.id] ? (
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full">
                          ⏳ Parcial ({partialPlanInfo[s.id].distanceKm} km)
                        </span>
                      ) : null}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSessionId(s.id);
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold bg-[#20252C] hover:bg-[#282F38] text-white rounded-lg border border-[#282F38]"
                      >
                        Seleccionar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* HISTORIAL REAL DE ENTRENAMIENTOS DE RUNNING */}
      <div className="space-y-2 flex-1 overflow-y-auto">
        {sortedLogs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-[#A8B0BB] py-16 bg-[#20252C]/40 rounded-3xl border border-[#282F38]">
            <Footprints className="w-12 h-12 mb-4 opacity-20 text-[#1FD08A]" />
            <p className="font-bold text-sm text-[#F4F2ED]">Aún no has registrado entrenamientos de running</p>
            <p className="text-xs text-[#A8B0BB] mt-1">
              Elige una sesión del plan y pulsa <strong>Iniciar Entrenamiento</strong> para registrar tus métricas reales.
            </p>
          </div>
        ) : (
          sortedLogs.map((log) => {
            const hasGpsRoute = Boolean(log.route && log.route.length > 0);
            const isPartialNote = Boolean(log.notes && log.notes.includes('[Parcial'));

            return (
              <div
                key={log.id}
                className="flex items-center gap-3 p-3.5 rounded-2xl border border-[#282F38] bg-[#20252C] hover:border-[#1FD08A]/40 transition-all flex-wrap sm:flex-nowrap"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] uppercase font-black tracking-wider text-[#1FD08A] bg-[#1FD08A]/10 border border-[#1FD08A]/20 px-2 py-0.5 rounded-full">
                      {typeLabel(log.type)}
                    </span>
                    <span className="text-[10px] text-[#A8B0BB] font-bold">
                      {new Date(log.date).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                    </span>
                    {isPartialNote ? (
                      <span className="text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                        ⏳ Parcial / Incompleta
                      </span>
                    ) : (
                      <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                        ✓ Completada
                      </span>
                    )}
                    {hasGpsRoute && (
                      <span className="text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-sky-400" />
                        <span>Ruta GPS ({log.route?.length} pts)</span>
                      </span>
                    )}
                  </div>
                  <p className="font-extrabold text-sm text-[#F4F2ED]">
                    {log.distanceKm} km · {formatLogDuration(log.durationMin)} · {calculatePace(log.distanceKm, log.durationMin)}
                    <span className="text-orange-400 font-bold ml-1.5">· RPE {log.rpe}/10</span>
                  </p>
                  {log.notes && <p className="text-xs text-[#A8B0BB] mt-0.5 truncate">{log.notes}</p>}
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => setInspectedRouteLog(log)}
                    className="px-3 py-1.5 bg-[#15181D] hover:bg-[#282F38] text-[#1FD08A] border border-[#1FD08A]/30 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Ver detalles completos, mapa y tarjeta para redes sociales"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#1FD08A]" />
                    <span>Ver Actividad</span>
                  </button>

                  <button
                    onClick={() => handleDeleteRun(log.id)}
                    className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0 cursor-pointer"
                    title="Eliminar registro"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL CREADOR DE RUTINA DE RUNNING PERSONALIZADA */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#15181D] border border-[#282F38] rounded-3xl w-full max-w-lg p-5 text-white shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#282F38] pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#1FD08A] block">
                  Entrenamiento Guiado a Medida
                </span>
                <h3 className="text-base font-black text-white">Crear Rutina de Running</h3>
              </div>
              <button
                onClick={() => setShowCustomModal(false)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-[#20252C]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selector de modo: Bloques Secuenciales vs Series Clásicas */}
            <div className="grid grid-cols-2 gap-1.5 bg-[#20252C] p-1 rounded-2xl border border-[#282F38]">
              <button
                type="button"
                onClick={() => setCustomBuilderMode('blocks')}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  customBuilderMode === 'blocks'
                    ? 'bg-[#1FD08A] text-[#15181D] shadow'
                    : 'text-[#A8B0BB] hover:text-white'
                }`}
              >
                Por Bloques y Ritmos (Ej: 3K + 1K)
              </button>
              <button
                type="button"
                onClick={() => setCustomBuilderMode('intervals')}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  customBuilderMode === 'intervals'
                    ? 'bg-[#1FD08A] text-[#15181D] shadow'
                    : 'text-[#A8B0BB] hover:text-white'
                }`}
              >
                Series Repetidas (Ej: 5 × 1000m)
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-[#A8B0BB] block mb-1">Nombre de la sesión</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Ej: Progresivo 3 km Z2 + 1 km Umbral"
                  className="w-full bg-[#20252C] border border-[#282F38] rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-[#1FD08A]"
                />
              </div>

              {customBuilderMode === 'blocks' ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-[#A8B0BB]">
                      Bloques secuenciales (la app te avisará al pasar de un bloque al siguiente):
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setCustomFreeBlocks((prev) => [
                          ...prev,
                          {
                            id: `fb_${Date.now()}`,
                            phaseType: 'work',
                            targetType: 'distance',
                            valueStr: '1.0',
                            paceStr: `${paceZones.umbralPace.min.replace('/km', '')} - ${paceZones.umbralPace.max.replace('/km', '')} min/km`
                          }
                        ])
                      }
                      className="px-2.5 py-1 rounded-lg bg-[#1FD08A]/15 text-[#1FD08A] border border-[#1FD08A]/30 font-black text-[11px] cursor-pointer"
                    >
                      + Añadir bloque
                    </button>
                  </div>

                  {customFreeBlocks.map((b, idx) => (
                    <div key={b.id} className="bg-[#20252C] border border-[#282F38] rounded-2xl p-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black uppercase text-[#1FD08A]">
                          Bloque {idx + 1}
                        </span>
                        {customFreeBlocks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setCustomFreeBlocks((prev) => prev.filter((item) => item.id !== b.id))}
                            className="text-zinc-500 hover:text-rose-400 text-[11px] font-bold cursor-pointer"
                          >
                            Quitar
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] text-[#A8B0BB] block mb-0.5">Tipo de fase</label>
                          <select
                            value={b.phaseType}
                            onChange={(e) => {
                              const nextType = e.target.value as any;
                              setCustomFreeBlocks((prev) =>
                                prev.map((item) =>
                                  item.id === b.id
                                    ? {
                                        ...item,
                                        phaseType: nextType,
                                        targetType: nextType === 'recovery' ? 'time' : item.targetType,
                                        valueStr: nextType === 'recovery' ? '90' : item.valueStr
                                      }
                                    : item
                                )
                              );
                            }}
                            className="w-full bg-[#15181D] border border-[#282F38] rounded-xl px-2 py-1.5 text-white font-bold text-[11px]"
                          >
                            <option value="warmup">Calentamiento</option>
                            <option value="work">Carrera / Serie</option>
                            <option value="recovery">Descanso</option>
                            <option value="cooldown">Enfriamiento</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-[#A8B0BB] block mb-0.5">Medir por</label>
                          <select
                            value={b.targetType}
                            onChange={(e) => {
                              const nextT = e.target.value as 'distance' | 'time';
                              setCustomFreeBlocks((prev) =>
                                prev.map((item) =>
                                  item.id === b.id
                                    ? { ...item, targetType: nextT, valueStr: nextT === 'distance' ? '1.0' : '90' }
                                    : item
                                )
                              );
                            }}
                            className="w-full bg-[#15181D] border border-[#282F38] rounded-xl px-2 py-1.5 text-white font-bold text-[11px]"
                          >
                            <option value="distance">Distancia (km)</option>
                            <option value="time">Tiempo (seg)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-[#A8B0BB] block mb-0.5">
                            {b.targetType === 'distance' ? 'Kilómetros' : 'Segundos'}
                          </label>
                          <input
                            type="text"
                            value={b.valueStr}
                            onChange={(e) =>
                              setCustomFreeBlocks((prev) =>
                                prev.map((item) => (item.id === b.id ? { ...item, valueStr: e.target.value } : item))
                              )
                            }
                            placeholder={b.targetType === 'distance' ? '3.0' : '90'}
                            className="w-full bg-[#15181D] border border-[#282F38] rounded-xl px-2.5 py-1.5 text-white font-bold text-[11px]"
                          />
                        </div>
                      </div>

                      {b.phaseType !== 'recovery' && (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[10px] text-[#A8B0BB]">Rango de ritmo sugerido para este bloque:</label>
                            <div className="flex gap-1">
                              {[
                                { label: 'Z2 Suave', val: `${paceZones.easyZone12.min.replace(/\/km/g, '')} - ${paceZones.easyZone12.max.replace(/\/km/g, '')} min/km` },
                                { label: 'Tempo', val: `${paceZones.tempoPace.min.replace(/\/km/g, '')} - ${paceZones.tempoPace.max.replace(/\/km/g, '')} min/km` },
                                { label: 'Umbral', val: `${paceZones.umbralPace.min.replace(/\/km/g, '')} - ${paceZones.umbralPace.max.replace(/\/km/g, '')} min/km` },
                                { label: 'VO2', val: `${paceZones.sprint400m.min.replace(/\/km/g, '')} - ${paceZones.sprint400m.max.replace(/\/km/g, '')} min/km` }
                              ].map((z) => (
                                <button
                                  key={z.label}
                                  type="button"
                                  onClick={() =>
                                    setCustomFreeBlocks((prev) =>
                                      prev.map((item) => (item.id === b.id ? { ...item, paceStr: z.val } : item))
                                    )
                                  }
                                  className="px-1.5 py-0.5 rounded bg-[#15181D] hover:bg-[#1FD08A]/20 text-[9px] font-bold text-[#1FD08A] border border-[#282F38] cursor-pointer"
                                >
                                  {z.label}
                                </button>
                              ))}
                            </div>
                          </div>
                          <input
                            type="text"
                            value={b.paceStr}
                            onChange={(e) =>
                              setCustomFreeBlocks((prev) =>
                                prev.map((item) => (item.id === b.id ? { ...item, paceStr: e.target.value } : item))
                              )
                            }
                            placeholder="Ej: 5:20 - 5:35 min/km"
                            className="w-full bg-[#15181D] border border-[#282F38] rounded-xl px-2.5 py-1.5 text-white font-mono font-bold text-[11px]"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-[#A8B0BB] block mb-1">Calentamiento (km)</label>
                      <input
                        type="text"
                        value={customWarmupKm}
                        onChange={(e) => setCustomWarmupKm(e.target.value)}
                        placeholder="2.0"
                        className="w-full bg-[#20252C] border border-[#282F38] rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-[#1FD08A]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[#A8B0BB] block mb-1">Vuelta a la calma (km)</label>
                      <input
                        type="text"
                        value={customCooldownKm}
                        onChange={(e) => setCustomCooldownKm(e.target.value)}
                        placeholder="1.5"
                        className="w-full bg-[#20252C] border border-[#282F38] rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-[#1FD08A]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-[#A8B0BB] block mb-1">N° de Series</label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={customReps}
                        onChange={(e) => setCustomReps(e.target.value)}
                        className="w-full bg-[#20252C] border border-[#282F38] rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-[#1FD08A]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[#A8B0BB] block mb-1">Distancia (m)</label>
                      <input
                        type="number"
                        step="100"
                        min="100"
                        value={customIntervalMeters}
                        onChange={(e) => setCustomIntervalMeters(e.target.value)}
                        className="w-full bg-[#20252C] border border-[#282F38] rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-[#1FD08A]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[#A8B0BB] block mb-1">Descanso (seg)</label>
                      <input
                        type="number"
                        step="15"
                        min="0"
                        value={customRestSec}
                        onChange={(e) => setCustomRestSec(e.target.value)}
                        className="w-full bg-[#20252C] border border-[#282F38] rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-[#1FD08A]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#A8B0BB] block mb-1">Rango de ritmo objetivo de las series</label>
                    <input
                      type="text"
                      value={customPaceLabel}
                      onChange={(e) => setCustomPaceLabel(e.target.value)}
                      placeholder="Ej: 4:25 - 4:35 min/km"
                      className="w-full bg-[#20252C] border border-[#282F38] rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-[#1FD08A]"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="flex-1 py-2.5 bg-[#20252C] hover:bg-[#282F38] text-[#A8B0BB] font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateCustomRunningSession}
                className="flex-1 py-2.5 bg-[#1FD08A] hover:bg-[#1ab87a] text-[#15181D] font-black rounded-xl text-xs cursor-pointer"
              >
                Guardar Rutina Running
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARA ENTRENAMIENTO GUIADO POR BLOQUES Y GPS EN VIVO */}
      {showLiveTracker && (
        <RunningLiveTracker
          plannedSession={trackerSession}
          onSaveRun={handleSaveTrackedRun}
          onClose={() => setShowLiveTracker(false)}
          onNotification={onNotification}
        />
      )}

      {/* MODAL ENRIQUECIDO DE ACTIVIDAD & CREADOR DE TARJETAS SOCIALES */}
      {inspectedRouteLog && (
        <RunActivityDetailModal
          log={inspectedRouteLog}
          nickname={nickname}
          onClose={() => setInspectedRouteLog(null)}
          onNotification={onNotification}
        />
      )}

      {showAuthScreen && <AuthScreen onClose={() => setShowAuthScreen(false)} />}
    </div>
  );
}
