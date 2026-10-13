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
  PlannedRunningSession 
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

  // Periodización hacia carrera / evento objetivo
  const [targetWeeks, setTargetWeeks] = useState<number>(12);
  const [weeksRemaining, setWeeksRemaining] = useState<number>(8);
  const [showPeriodization, setShowPeriodization] = useState<boolean>(false);

  // Plan de Entrenamiento Guiado
  const [raceDistance, setRaceDistance] = useState<RaceDistance>('10K');
  const [targetPace, setTargetPace] = useState<number>(5.0); // 5:00 min/km por defecto
  const [completedPlanIds, setCompletedPlanIds] = useState<Record<string, boolean>>({});

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

  const phaseDetails = getPhaseFromWeeks(weeksRemaining, targetWeeks, 'running');
  const plannedSessions = generateRunningPlan(raceDistance, targetPace);
  const paceZones = calculatePacesFrom10K(targetPace);
  const typeLabel = (t: RunType) => RUN_TYPES.find((rt) => rt.id === t)?.label || t;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-start justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-zinc-900 flex items-center gap-2.5">
            <Footprints className="w-6 h-6 text-emerald-500" />
            Running
          </h2>
          <p className="text-zinc-500 text-sm mt-1">
            Registra tus carreras y sigue tu progresión de volumen e intensidad
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {user ? (
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold px-3 py-2.5 rounded-xl text-xs transition-all shrink-0"
              title={`Sincronizado como ${user.email ?? 'tu cuenta'} — clic para cerrar sesión`}
            >
              <Cloud className="w-3.5 h-3.5" />
              <span className="hidden sm:inline max-w-[140px] truncate">{user.email}</span>
              <LogOut className="w-3.5 h-3.5 ml-1" />
            </button>
          ) : (
            <button
              onClick={() => setShowAuthScreen(true)}
              className="flex items-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 font-bold px-3 py-2.5 rounded-xl text-xs transition-all shrink-0"
              title="Sincronizar entre dispositivos"
            >
              <CloudOff className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sincronizar</span>
            </button>
          )}
          <button
            onClick={() => setShowLiveTracker(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black px-3.5 py-2.5 rounded-xl text-xs shadow-md shadow-emerald-950/20 transition-all shrink-0 active:scale-95"
            title="Rastreo de ruta en vivo con GPS y mapa OpenStreetMap gratuito"
          >
            <Navigation className="w-3.5 h-3.5 animate-pulse" />
            <span>Grabar GPS en Vivo</span>
          </button>
          <button
            onClick={() => setShowStravaModal(true)}
            className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-orange-400 border border-zinc-700 font-bold px-3 py-2.5 rounded-xl text-xs transition-all shrink-0"
            title="Conectar con Strava o importar/exportar archivos de ruta GPX"
          >
            <Compass className="w-3.5 h-3.5 text-orange-400" />
            <span>Strava & GPX</span>
          </button>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 bg-zinc-950 hover:bg-zinc-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shrink-0"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Cancelar' : 'Manual'}
          </button>
        </div>
      </div>

      {syncMsg && (
        <div className="mb-4 bg-emerald-500 text-zinc-950 rounded-2xl p-3 font-bold text-xs animate-fadeIn">
          {syncMsg}
        </div>
      )}

      {hasLocalToSync && user && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <Cloud className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs font-black text-emerald-950">Datos locales encontrados</p>
              <p className="text-[11px] text-emerald-700">Tienes carreras registradas en este dispositivo. ¿Deseas subirlas a tu cuenta?</p>
            </div>
          </div>
          <button
            onClick={handleSyncLocal}
            disabled={syncing}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition-all shrink-0"
          >
            {syncing ? 'Subiendo...' : 'Importar a la nube'}
          </button>
        </div>
      )}

      {/* Banner de Periodización Inversa hacia Carrera / Evento Objetivo */}
      <div className="mb-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white shadow-sm transition-all">
        <div
          className="flex items-center justify-between gap-3 flex-wrap cursor-pointer"
          onClick={() => setShowPeriodization((v) => !v)}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">Objetivo de Carrera</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${phaseDetails.badgeColor}`}>
                  {phaseDetails.phase.toUpperCase()} · SEMANA {phaseDetails.weekNumber}/{phaseDetails.totalWeeks}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-zinc-100">{phaseDetails.name}</p>
            </div>
          </div>
          <button className="text-zinc-400 hover:text-white p-1" title="Ajustar semanas de preparación">
            {showPeriodization ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showPeriodization && (
          <div className="mt-4 pt-3 border-t border-zinc-800 space-y-3 animate-fadeIn text-xs">
            <p className="text-zinc-300 leading-relaxed text-[11px] sm:text-xs">{phaseDetails.focusDescription}</p>
            <div className="flex items-center justify-between gap-3 flex-wrap bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-zinc-400 font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Semanas restantes:
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); setWeeksRemaining((w) => Math.max(1, w - 1)); }}
                    className="w-6 h-6 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-bold flex items-center justify-center text-xs"
                  >
                    -
                  </button>
                  <span className="font-mono font-black text-emerald-400 px-1 text-xs">{weeksRemaining} sem</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setWeeksRemaining((w) => Math.min(targetWeeks, w + 1)); }}
                    className="w-6 h-6 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-bold flex items-center justify-center text-xs"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-zinc-400 font-medium">Ciclo total:</span>
                <div className="flex gap-1">
                  {[8, 12, 16].map((w) => (
                    <button
                      key={w}
                      onClick={(e) => {
                        e.stopPropagation();
                        setTargetWeeks(w);
                        if (weeksRemaining > w) setWeeksRemaining(w);
                      }}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors ${
                        targetWeeks === w
                          ? 'bg-emerald-500 border-emerald-500 text-zinc-950 font-black'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500'
                      }`}
                    >
                      {w} sem
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3.5">
          <p className="text-[10px] uppercase font-black text-zinc-400 tracking-wider">Esta semana</p>
          <p className="text-xl font-black text-zinc-900">{weekStats.totalKm.toFixed(1)} km</p>
        </div>
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3.5">
          <p className="text-[10px] uppercase font-black text-zinc-400 tracking-wider">Sesiones</p>
          <p className="text-xl font-black text-zinc-900">{weekStats.sessionCount}</p>
        </div>
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3.5">
          <p className="text-[10px] uppercase font-black text-zinc-400 tracking-wider">Fácil</p>
          <p className="text-xl font-black text-emerald-600">{weekStats.easyPct}%</p>
        </div>
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3.5">
          <p className="text-[10px] uppercase font-black text-zinc-400 tracking-wider">Moderado-fuerte</p>
          <p className="text-xl font-black text-amber-600">{weekStats.hardPct}%</p>
        </div>
      </div>

      {polarizationFeedback && (
        <div className="mb-2.5 flex items-start gap-2 bg-blue-50 border border-blue-200/70 rounded-xl px-3 py-2">
          <TrendingUp className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
          <p className="text-[11px] text-blue-800 leading-snug">{polarizationFeedback}</p>
        </div>
      )}
      {volumeFeedback && (
        <div
          className={`mb-4 flex items-start gap-2 rounded-xl px-3 py-2 border ${
            volumeFeedback.level === 'watch'
              ? 'bg-amber-50 border-amber-200/70'
              : 'bg-emerald-50 border-emerald-200/70'
          }`}
        >
          {volumeFeedback.level === 'watch' ? (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
          )}
          <p className={`text-[11px] leading-snug ${volumeFeedback.level === 'watch' ? 'text-amber-800' : 'text-emerald-800'}`}>
            {volumeFeedback.text}
          </p>
        </div>
      )}

      {/* SECCIÓN DEL PLAN DE ENTRENAMIENTO DE CARRERA */}
      <div className="mb-6 bg-zinc-900 border border-zinc-800 rounded-3xl p-5 text-white shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                Plan de Carrera Inteligente
              </span>
              <span className="text-zinc-400 text-xs font-bold">
                Meta estimada: {calculateRaceFinishTime(raceDistance, targetPace)}
              </span>
            </div>
            <h3 className="text-base md:text-lg font-black tracking-tight text-white flex items-center gap-2">
              <Gauge className="w-5 h-5 text-emerald-400" />
              Estructura Semanal para {raceDistance} a {formatPaceDecimal(targetPace)}
            </h3>
            <p className="text-zinc-400 text-xs mt-0.5">
              4 sesiones científicas (80/20) calibradas a tu ritmo objetivo para llegar en pico de forma.
            </p>
          </div>

          {/* Selectores de Distancia */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(['5K', '10K', '21K', '42K'] as RaceDistance[]).map((d) => (
              <button
                key={d}
                onClick={() => setRaceDistance(d)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border ${
                  raceDistance === d
                    ? 'bg-emerald-500 border-emerald-500 text-zinc-950 shadow-md'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* SELECTOR DE RITMO OBJETIVO */}
        <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-3.5 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-zinc-400">Pace Meta (Ritmo Objetivo):</span>
            <span className="font-mono font-black text-emerald-400 text-xs md:text-sm bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
              {formatPaceDecimal(targetPace)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-zinc-500 font-bold uppercase">Ritmos rápidos:</span>
            {[4.0, 4.5, 5.0, 5.5, 6.0, 6.5].map((p) => (
              <button
                key={p}
                onClick={() => setTargetPace(p)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                  targetPace === p
                    ? 'bg-purple-600 border-purple-500 text-white font-black'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
                }`}
              >
                {formatPaceDecimal(p).replace(' min/km', '')}
              </button>
            ))}
          </div>
        </div>

        {/* ZONAS DE RITMO CALCULADAS AUTOMÁTICAMENTE */}
        <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-3.5 mb-4">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-black uppercase tracking-wider text-zinc-200">
                Tus 4 Zonas de Ritmo Calculadas
              </span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              Fórmula de Ritmos 80/20
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-left">
            <div className="bg-zinc-900/80 border border-emerald-900/30 rounded-xl p-2.5">
              <div className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">1. Suave (80% del tiempo)</div>
              <div className="text-xs md:text-sm font-black text-white font-mono mt-0.5">{paceZones.easyZone12.max} – {paceZones.easyZone12.min}</div>
              <p className="text-[10px] text-zinc-400 mt-1 leading-tight">Zonas 1 y 2. Puedes hablar fluidamente sin ahogarte.</p>
            </div>
            <div className="bg-zinc-900/80 border border-sky-900/30 rounded-xl p-2.5">
              <div className="text-[10px] font-black text-sky-400 uppercase tracking-wider">2. Tempo (Alegre)</div>
              <div className="text-xs md:text-sm font-black text-white font-mono mt-0.5">{paceZones.tempoPace.max} – {paceZones.tempoPace.min}</div>
              <p className="text-[10px] text-zinc-400 mt-1 leading-tight">Ritmo constante que cuesta pero aguantas varios km.</p>
            </div>
            <div className="bg-zinc-900/80 border border-amber-900/30 rounded-xl p-2.5">
              <div className="text-[10px] font-black text-amber-400 uppercase tracking-wider">3. Umbral (Exigente)</div>
              <div className="text-xs md:text-sm font-black text-white font-mono mt-0.5">{paceZones.umbralPace.max} – {paceZones.umbralPace.min}</div>
              <p className="text-[10px] text-zinc-400 mt-1 leading-tight">Para series de 1k a 2k. Retrasa la sensación de fatiga.</p>
            </div>
            <div className="bg-zinc-900/80 border border-rose-900/30 rounded-xl p-2.5">
              <div className="text-[10px] font-black text-rose-400 uppercase tracking-wider">4. Velocidad (400m)</div>
              <div className="text-xs md:text-sm font-black text-white font-mono mt-0.5">{paceZones.sprint400m.min} – {paceZones.sprint400m.max}</div>
              <p className="text-[10px] text-zinc-400 mt-1 leading-tight">Series cortas explosivas. Estimula tu potencia de zancada.</p>
            </div>
          </div>
        </div>

        {/* LISTADO DE LAS 4 SESIONES SEMANALES GUIADAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {plannedSessions.map((session) => {
            const isCompleted = Boolean(completedPlanIds[session.id]);

            return (
              <div
                key={session.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isCompleted
                    ? 'bg-emerald-950/20 border-emerald-500/40'
                    : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] uppercase font-black tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      {session.dayTitle}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full">
                      RPE {session.rpe}/10
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-white">{session.name}</h4>
                  <p className="text-xs text-zinc-400 font-semibold mt-0.5">
                    {session.distanceKm} km · Ritmo sugerido: <span className="text-emerald-400 font-bold">{session.targetPaceLabel}</span>
                  </p>

                  <div className="mt-3 space-y-1.5 border-t border-zinc-800/80 pt-2.5">
                    {session.structure.map((st, i) => (
                      <p key={i} className="text-[11px] text-zinc-300 leading-relaxed flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold shrink-0">•</span>
                        <span>{st}</span>
                      </p>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-zinc-500 italic">{session.focus}</span>
                  <button
                    onClick={() => handleQuickLogPlannedSession(session)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black shadow-sm'
                    }`}
                    title="Guarda esta sesión directamente en tu historial y suma los km de la semana"
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isCompleted ? 'Registrada' : 'Registrar sesión'}</span>
                  </button>
                </div>
              </div>
            );
          })}
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
