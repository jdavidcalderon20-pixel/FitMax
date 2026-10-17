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
  Download
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
  PlannedRunningSession,
  getRunningCoachGuidance 
} from '../lib/runningPlans';
import { calculatePacesFrom10K } from '../data/runningPlansData';
import { useAuth } from '../lib/auth';
import AuthScreen from './AuthScreen';
import RunningMap from './RunningMap';
import RunningLiveTracker from './RunningLiveTracker';
import StravaSyncModal from './StravaSyncModal';
import { GeoPoint, generateGPXString, downloadGPXFile } from '../lib/gpx';

interface RunningModuleProps {
  nickname: string;
  onNotification?: (msg: string) => void;
}

const todayStr = (): string => new Date().toISOString().slice(0, 10);

export default function RunningModule({ nickname, onNotification }: RunningModuleProps) {
  const { user, signOut } = useAuth();
  const [logs, setLogs] = useState<RunLog[]>([]);
  const [loadingCloud, setLoadingCloud] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showAuthScreen, setShowAuthScreen] = useState(false);
  const [showLiveTracker, setShowLiveTracker] = useState(false);
  const [showStravaModal, setShowStravaModal] = useState(false);
  const [inspectedRouteLog, setInspectedRouteLog] = useState<RunLog | null>(null);
  const [hasLocalToSync, setHasLocalToSync] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [showRegisterMenu, setShowRegisterMenu] = useState(false);

  // Periodización hacia carrera / evento objetivo
  const [targetWeeks, setTargetWeeks] = useState<number>(12);
  const [weeksRemaining, setWeeksRemaining] = useState<number>(8);
  const [showPeriodization, setShowPeriodization] = useState<boolean>(false);

  // Plan de Entrenamiento Guiado
  const [raceDistance, setRaceDistance] = useState<RaceDistance>('10K');
  const [targetPace, setTargetPace] = useState<number>(5.0); // 5:00 min/km por defecto
  const [completedPlanIds, setCompletedPlanIds] = useState<Record<string, boolean>>({});
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [showAllSessions, setShowAllSessions] = useState<boolean>(false);

  const [formDate, setFormDate] = useState(todayStr());
  const [formDistance, setFormDistance] = useState('');
  const [formDuration, setFormDuration] = useState('');
  const [formType, setFormType] = useState<RunType>('facil');
  const [formRpe, setFormRpe] = useState(5);
  const [formNotes, setFormNotes] = useState('');

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
    } catch (e) {
      console.error(e);
    }
  }, [targetWeeks, weeksRemaining, raceDistance, targetPace, completedPlanIds, nickname]);

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

  const resetForm = () => {
    setFormDate(todayStr());
    setFormDistance('');
    setFormDuration('');
    setFormType('facil');
    setFormRpe(5);
    setFormNotes('');
  };

  const handleAddRun = async () => {
    const distanceKm = parseFloat(formDistance.replace(',', '.'));
    const durationMin = parseFloat(formDuration.replace(',', '.'));
    if (!distanceKm || distanceKm <= 0 || !durationMin || durationMin <= 0) return;

    const draft = {
      date: new Date(formDate).getTime(),
      distanceKm,
      durationMin,
      type: formType,
      rpe: formRpe,
      notes: formNotes.trim() || undefined,
    };

    if (user) {
      const saved = await addRunLogCloud(user.id, draft);
      if (saved) setLogs((prev) => [...prev, saved]);
    } else {
      const newLog: RunLog = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        ...draft,
      };
      setLogs((prev) => [...prev, newLog]);
    }
    resetForm();
    setShowForm(false);
  };

  const handleSaveTrackedRun = async (data: {
    distanceKm: number;
    durationMin: number;
    type: RunType;
    rpe: number;
    notes?: string;
    route: GeoPoint[];
  }) => {
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
  };

  const handleDownloadLogGPX = (log: RunLog) => {
    if (!log.route || log.route.length === 0) {
      if (onNotification) onNotification('Esta sesión no contiene trazado GPS para exportar.');
      return;
    }
    const gpx = generateGPXString(`FitMax Carrera ${new Date(log.date).toLocaleDateString()}`, log.route);
    const dateStr = new Date(log.date).toISOString().slice(0, 10);
    downloadGPXFile(`FitMax_Carrera_${dateStr}_${log.distanceKm}km.gpx`, gpx);
    if (onNotification) onNotification('¡Archivo GPX descargado! Listo para Strava.');
  };

  const handleDeleteRun = async (id: string) => {
    if (user) {
      const ok = await deleteRunLogCloud(id);
      if (!ok) return;
    }
    setLogs((prev) => prev.filter((l) => l.id !== id));
  };

  const handleQuickLogPlannedSession = async (session: PlannedRunningSession) => {
    if (completedPlanIds[session.id]) {
      setCompletedPlanIds((prev) => {
        const copy = { ...prev };
        delete copy[session.id];
        return copy;
      });
      setSyncMsg(`Sesión "${session.dayTitle}" marcada como pendiente.`);
      setTimeout(() => setSyncMsg(null), 3000);
      return;
    }

    const draft = {
      date: Date.now(),
      distanceKm: session.distanceKm,
      durationMin: session.estimatedDurationMin,
      type: session.type,
      rpe: session.rpe,
      notes: `Sesión guiada: ${session.name} (${session.targetPaceLabel})`,
    };

    if (user) {
      const saved = await addRunLogCloud(user.id, draft);
      if (saved) setLogs((prev) => [...prev, saved]);
    } else {
      const newLog: RunLog = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        ...draft,
      };
      setLogs((prev) => [...prev, newLog]);
    }

    setCompletedPlanIds((prev) => ({
      ...prev,
      [session.id]: true,
    }));

    setSyncMsg(`¡Sesión "${session.dayTitle}" registrada con éxito! (+${session.distanceKm} km en tu volumen semanal)`);
    setTimeout(() => setSyncMsg(null), 4000);
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
  const coachGuidance = getRunningCoachGuidance(
    phaseDetails.phase,
    raceDistance,
    currentWeekNumber,
    targetWeeks,
    targetPace
  );
  const paceZones = calculatePacesFrom10K(targetPace);
  const typeLabel = (t: RunType) => RUN_TYPES.find((rt) => rt.id === t)?.label || t;

  // Sesión actualmente seleccionada por el atleta (libertad total de inspección y orden)
  const activeSession = plannedSessions.find((s) => s.id === selectedSessionId) || plannedSessions[0];
  const isActiveCompleted = Boolean(completedPlanIds[activeSession.id]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-start justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-[#F4F2ED] flex items-center gap-2.5">
            <Footprints className="w-6 h-6 text-[#1FD08A]" />
            Running
          </h2>
          <p className="text-[#A8B0BB] text-sm mt-1">
            Planes periodizados inteligentes (80/20), ritmos calibrados y registro GPS
          </p>
        </div>
        <div className="relative flex items-center gap-2">
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

          <div className="relative">
            <button
              onClick={() => setShowRegisterMenu(!showRegisterMenu)}
              className="flex items-center gap-2 bg-[#1FD08A] hover:bg-[#1ab87a] text-[#15181D] font-black px-4 py-2.5 rounded-2xl text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar carrera</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showRegisterMenu ? 'rotate-180' : ''}`} />
            </button>

            {showRegisterMenu && (
              <div 
                className="absolute right-0 mt-2 w-56 bg-[#20252C] border border-[#282F38] rounded-2xl shadow-2xl z-30 p-1.5 space-y-1 animate-fadeIn"
                onClick={() => setShowRegisterMenu(false)}
              >
                <button
                  onClick={() => setShowLiveTracker(true)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#F4F2ED] hover:bg-[#15181D] transition-colors text-left"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#1FD08A]" />
                  <span>Grabar GPS en vivo</span>
                </button>

                <button
                  onClick={() => setShowForm((v) => !v)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#F4F2ED] hover:bg-[#15181D] transition-colors text-left"
                >
                  <Plus className="w-3.5 h-3.5 text-[#5B8DEF]" />
                  <span>Registro manual</span>
                </button>

                <button
                  onClick={() => setShowStravaModal(true)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#F4F2ED] hover:bg-[#15181D] transition-colors text-left"
                >
                  <Compass className="w-3.5 h-3.5 text-[#FB923C]" />
                  <span>Strava &amp; Archivos GPX</span>
                </button>

                {!user && (
                  <button
                    onClick={() => setShowAuthScreen(true)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#A8B0BB] hover:text-[#F4F2ED] hover:bg-[#15181D] transition-colors text-left border-t border-[#282F38] pt-2"
                  >
                    <CloudOff className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Sincronizar en la nube</span>
                  </button>
                )}
              </div>
            )}
          </div>
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

          {/* Stepper intuitivo de semana */}
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

        {/* Duración del ciclo y Selector rápido de fase */}
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
                      : 'bg-[#15181D] border-[#282F38] text-[#A8B0BB] hover:text-[#F4F2ED]'
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
                      : 'bg-[#15181D] border-[#282F38] text-[#A8B0BB] hover:text-[#F4F2ED]'
                  }`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>

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
                Toca cualquier sesión para ver su estructura completa o realizarla sin importar el orden.
              </p>
            </div>
            <span className="text-[11px] font-bold text-[#1FD08A] bg-[#1FD08A]/10 border border-[#1FD08A]/20 px-2.5 py-0.5 rounded-full">
              {Object.values(completedPlanIds).filter(Boolean).length} de 4 completadas
            </span>
          </div>

          {/* Fila de 4 tarjetas/píldoras de sesión */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {plannedSessions.map((session, sIdx) => {
              const isSelected = activeSession.id === session.id;
              const isCompleted = Boolean(completedPlanIds[session.id]);
              const num = sIdx + 1;

              return (
                <button
                  key={session.id}
                  onClick={() => setSelectedSessionId(session.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-[#5B8DEF]/15 border-[#5B8DEF] ring-2 ring-[#5B8DEF] shadow-lg'
                      : isCompleted
                      ? 'bg-[#15181D] border-emerald-500/40 opacity-90'
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

          {/* TARJETA DETALLADA DE LA SESIÓN SELECCIONADA */}
          <div className="bg-[#15181D] border-2 border-[#5B8DEF]/60 rounded-3xl p-5 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="bg-[#5B8DEF]/20 text-[#5B8DEF] font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full border border-[#5B8DEF]/30">
                  {activeSession.dayTitle}
                </span>
                <span className="text-[10px] font-bold text-[#A8B0BB] bg-[#20252C] px-2 py-0.5 rounded-full">
                  Esfuerzo RPE {activeSession.rpe}/10
                </span>
                <span className="text-[10px] font-bold text-[#A8B0BB] bg-[#20252C] px-2 py-0.5 rounded-full">
                  ~{activeSession.estimatedDurationMin} min
                </span>
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
                Ritmo sugerido de referencia: <span className="text-[#1FD08A] font-bold">{activeSession.targetPaceLabel}</span>
              </p>
            </div>

            {/* Estructura detallada del entrenamiento */}
            <div className="space-y-2 border-t border-[#282F38] pt-3">
              <span className="text-[10px] font-black uppercase text-[#A8B0BB] tracking-wider block">
                Estructura paso a paso de la sesión:
              </span>
              {activeSession.structure.map((st, i) => (
                <div key={i} className="text-xs text-zinc-300 leading-relaxed flex items-start gap-2 bg-[#20252C]/40 p-2 rounded-xl">
                  <span className="text-[#5B8DEF] font-bold shrink-0 mt-0.5">•</span>
                  <span>{st}</span>
                </div>
              ))}
            </div>

            {/* Botones de acción directa */}
            <div className="pt-3 border-t border-[#282F38] flex items-center justify-between gap-3 flex-wrap">
              <span className="text-[11px] text-[#A8B0BB] italic max-w-sm">
                💡 {activeSession.focus}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowLiveTracker(true)}
                  className="px-4 py-2.5 bg-[#20252C] hover:bg-[#282F38] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 border border-[#282F38] transition-all cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#5B8DEF]" />
                  <span>Grabar con GPS</span>
                </button>
                <button
                  onClick={() => handleQuickLogPlannedSession(activeSession)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                    isActiveCompleted
                      ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                      : 'bg-[#1FD08A] hover:bg-[#1ab87a] text-[#15181D]'
                  }`}
                >
                  {isActiveCompleted ? <Check className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isActiveCompleted ? 'Completada ✓ (Toca para desmarcar)' : 'Completar esta sesión'}</span>
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
                      {completedPlanIds[s.id] && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          Hecha ✓
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSessionId(s.id);
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold bg-[#20252C] hover:bg-[#282F38] text-white rounded-lg border border-[#282F38]"
                      >
                        Ver detalles
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <div className="mb-5 bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] uppercase font-black text-zinc-400 tracking-wider block mb-1">Fecha</label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs font-bold text-zinc-900"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black text-zinc-400 tracking-wider block mb-1">Distancia (km)</label>
              <input
                type="text"
                placeholder="5"
                value={formDistance}
                onChange={(e) => setFormDistance(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs font-bold text-zinc-900"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black text-zinc-400 tracking-wider block mb-1">Duración (min)</label>
              <input
                type="text"
                placeholder="30"
                value={formDuration}
                onChange={(e) => setFormDuration(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs font-bold text-zinc-900"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black text-zinc-400 tracking-wider block mb-1">RPE (1-10)</label>
              <input
                type="number"
                min={1}
                max={10}
                value={formRpe}
                onChange={(e) => setFormRpe(Math.min(10, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs font-bold text-zinc-900"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-black text-zinc-400 tracking-wider block mb-1.5">Tipo de sesión</label>
            <div className="flex flex-wrap gap-1.5">
              {RUN_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setFormType(t.id)}
                  title={t.description}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    formType === t.id
                      ? 'bg-emerald-500 border-emerald-500 text-zinc-950'
                      : 'bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-black text-zinc-400 tracking-wider block mb-1">Notas (opcional)</label>
            <input
              type="text"
              placeholder="Sensaciones, clima, terreno..."
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900"
            />
          </div>

          <button
            onClick={handleAddRun}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black py-2.5 rounded-xl text-sm transition-all"
          >
            Guardar carrera
          </button>
        </div>
      )}

      <div className="space-y-2 flex-1 overflow-y-auto">
        {sortedLogs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 py-16">
            <Footprints className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-medium">Aún no has registrado carreras</p>
          </div>
        ) : (
          sortedLogs.map((log) => {
            const hasGpsRoute = Boolean(log.route && log.route.length > 0);

            return (
              <div
                key={log.id}
                className="flex items-center gap-3 p-3.5 rounded-2xl border border-zinc-200 bg-zinc-50 hover:bg-white transition-all flex-wrap sm:flex-nowrap"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">
                      {typeLabel(log.type)}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-bold">
                      {new Date(log.date).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                    </span>
                    {hasGpsRoute && (
                      <span className="text-[10px] bg-sky-50 text-sky-700 border border-sky-200 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-sky-500" />
                        <span>Ruta GPS ({log.route?.length} pts)</span>
                      </span>
                    )}
                  </div>
                  <p className="font-extrabold text-sm text-zinc-900">
                    {log.distanceKm}km · {log.durationMin}min · {calculatePace(log.distanceKm, log.durationMin)}
                    <span className="text-zinc-400 font-semibold"> · RPE {log.rpe}</span>
                  </p>
                  {log.notes && <p className="text-xs text-zinc-500 mt-0.5">{log.notes}</p>}
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  {hasGpsRoute && (
                    <>
                      <button
                        onClick={() => setInspectedRouteLog(log)}
                        className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-sky-300 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                        title="Ver trazado en mapa interactivo"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Mapa</span>
                      </button>

                      <button
                        onClick={() => handleDownloadLogGPX(log)}
                        className="px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                        title="Descargar archivo GPX para Strava"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>GPX</span>
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => handleDeleteRun(log.id)}
                    className="p-2 rounded-lg text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
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

      {/* MODAL PARA GRABACIÓN DE CARRERA GPS EN VIVO */}
      {showLiveTracker && (
        <RunningLiveTracker
          onSaveRun={handleSaveTrackedRun}
          onClose={() => setShowLiveTracker(false)}
          onNotification={onNotification}
        />
      )}

      {/* MODAL DE CONECTIVIDAD STRAVA Y RUTAS GPX */}
      {showStravaModal && (
        <StravaSyncModal
          onClose={() => setShowStravaModal(false)}
          onImportRun={handleSaveTrackedRun}
          onNotification={onNotification}
        />
      )}

      {/* MODAL PARA VER MAPA DE RUTA GUARDADA */}
      {inspectedRouteLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-zinc-950 text-white rounded-3xl max-w-xl w-full border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white">
                    Trazado de Ruta ({inspectedRouteLog.distanceKm} km)
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {new Date(inspectedRouteLog.date).toLocaleDateString('es-CO', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectedRouteLog(null)}
                className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 flex-1 min-h-[300px] flex flex-col">
              <div className="flex-1 min-h-[260px] rounded-2xl overflow-hidden mb-4">
                <RunningMap
                  route={inspectedRouteLog.route || []}
                  height="100%"
                  interactive={true}
                  autoFit={true}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 bg-zinc-900 p-3 rounded-2xl border border-zinc-800 text-center mb-4">
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase">Distancia</span>
                  <p className="text-base font-black text-emerald-400">{inspectedRouteLog.distanceKm} km</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase">Duración</span>
                  <p className="text-base font-black text-white">{inspectedRouteLog.durationMin} min</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase">Ritmo Medio</span>
                  <p className="text-base font-black text-sky-400">
                    {calculatePace(inspectedRouteLog.distanceKm, inspectedRouteLog.durationMin)}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleDownloadLogGPX(inspectedRouteLog)}
                  className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 text-orange-400 border border-orange-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportar GPX a Strava</span>
                </button>
                <button
                  onClick={() => setInspectedRouteLog(null)}
                  className="px-5 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold transition-all"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAuthScreen && <AuthScreen onClose={() => setShowAuthScreen(false)} />}
    </div>
  );
}
