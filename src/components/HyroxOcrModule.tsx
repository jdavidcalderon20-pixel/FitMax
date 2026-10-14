import React, { useState, useEffect } from 'react';
import { 
  Mountain, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Cloud, 
  CloudOff, 
  LogOut, 
  Calendar, 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  Flame, 
  Sparkles, 
  Sliders, 
  Trophy, 
  AlertTriangle,
  Zap,
  HeartPulse,
  Info,
  X,
  Dumbbell
} from 'lucide-react';
import { HYROX_OFFICIAL_STATIONS, HYROX_WARMUP_H, OCR_WARMUP_O } from '../data/hyroxOcrData';
import { HyroxLevel, HYROX_LEVELS, HYROX_STATIONS, generateHyroxWeek } from '../lib/hyrox';
import { OcrLevel, OCR_TIERS, GRIP_TIERS, GripTier, generateOcrWeek } from '../lib/ocr';
import { fetchCompletedSessions, markSessionCompleteCloud, markSessionIncompleteCloud } from '../lib/hyroxOcrCloud';
import { syncLocalDataToCloud } from '../lib/syncLocalToCloud';
import { getPhaseFromWeeks, PeriodizationPhase } from '../lib/periodization';
import { 
  calculateAutoregulation, 
  saveLastFeedback, 
  getLastFeedback, 
  PostWorkoutFeedback, 
  AutoregulationAdjustment 
} from '../lib/autoregulation';
import { playBeepSound } from '../lib/sound';
import { useAuth } from '../lib/auth';
import { ExerciseDetail, findExerciseDetail } from '../lib/exerciseBank';
import ExerciseDetailModal from './ExerciseDetailModal';
import AuthScreen from './AuthScreen';

interface HyroxOcrModuleProps {
  nickname: string;
}

type Discipline = 'hyrox' | 'ocr';

export default function HyroxOcrModule({ nickname }: HyroxOcrModuleProps) {
  const { user, signOut } = useAuth();
  const [discipline, setDiscipline] = useState<Discipline>('hyrox');
  const [hyroxLevel, setHyroxLevel] = useState<HyroxLevel>('base');
  const [ocrLevel, setOcrLevel] = useState<OcrLevel>('sprint');
  const [gripTier, setGripTier] = useState<GripTier>('intermedio');
  const [activeDay, setActiveDay] = useState(0);

  // Periodización Inversa hacia fecha objetivo
  const [targetWeeks, setTargetWeeks] = useState<number>(12);
  const [weeksRemaining, setWeeksRemaining] = useState<number>(10);

  // Sincronización y sesión
  const [showReference, setShowReference] = useState(false);
  const [referenceTab, setReferenceTab] = useState<'hyrox_stations' | 'warmup_h' | 'warmup_o'>('hyrox_stations');
  const [showAuthScreen, setShowAuthScreen] = useState(false);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [completedBlocks, setCompletedBlocks] = useState<Record<string, boolean>>({});
  const [loadingCloud, setLoadingCloud] = useState(false);
  const [hasLocalToSync, setHasLocalToSync] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  // Cronómetro integrado simplificado para Box/Pista (Magnesium-friendly)
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [timerInitial, setTimerInitial] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [timerLabel, setTimerLabel] = useState<string>('Cronómetro');

  // Modal de feedback post-entrenamiento (Autorregulación dinámica)
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [feedbackIntensity, setFeedbackIntensity] = useState<'muy_suave' | 'adecuado' | 'al_limite'>('adecuado');
  const [feedbackCompletion, setFeedbackCompletion] = useState<'completas' | 'adaptadas' | 'incompletas'>('completas');
  const [feedbackJoint, setFeedbackJoint] = useState<'ninguna' | 'muscular_normal' | 'molestia_articular'>('ninguna');
  const [lastAdjustment, setLastAdjustment] = useState<AutoregulationAdjustment | null>(null);
  const [inspectedExercise, setInspectedExercise] = useState<ExerciseDetail | null>(null);

  // Cargar estado inicial y persistencia
  useEffect(() => {
    if (user) {
      setLoadingCloud(true);
      fetchCompletedSessions(user.id).then((keys) => {
        const map: Record<string, boolean> = {};
        keys.forEach((k) => { map[k] = true; });
        setCompleted(map);
        setLoadingCloud(false);
      });
      return;
    }
    if (!nickname) return;
    try {
      const saved = localStorage.getItem(`fit_gen_${nickname}_hyroxocr_completed_v1`);
      setCompleted(saved ? JSON.parse(saved) : {});
      const savedWeeks = localStorage.getItem(`fit_gen_${nickname}_race_target_weeks`);
      if (savedWeeks) setTargetWeeks(parseInt(savedWeeks, 10));
      const savedRem = localStorage.getItem(`fit_gen_${nickname}_race_weeks_rem`);
      if (savedRem) setWeeksRemaining(parseInt(savedRem, 10));
    } catch (e) {
      setCompleted({});
    }
  }, [nickname, user]);

  // Cargar último feedback de autorregulación
  useEffect(() => {
    if (!nickname) return;
    const fb = getLastFeedback(nickname, discipline);
    if (fb) {
      setLastAdjustment(calculateAutoregulation(fb));
    }
  }, [nickname, discipline]);

  // Persistir sesiones locales
  useEffect(() => {
    if (user || !nickname) return;
    try {
      localStorage.setItem(`fit_gen_${nickname}_hyroxocr_completed_v1`, JSON.stringify(completed));
    } catch (e) {
      console.error(e);
    }
  }, [completed, nickname, user]);

  // Chequeo de datos locales pendientes para sincronizar con la nube
  useEffect(() => {
    if (user && nickname) {
      try {
        const localStr = localStorage.getItem(`fit_gen_${nickname}_hyroxocr_completed_v1`);
        const localSessions: Record<string, boolean> = localStr ? JSON.parse(localStr) : {};
        const count = Object.values(localSessions).filter(Boolean).length;
        setHasLocalToSync(count > 0);
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
    if (res.hyroxOcrImported > 0) {
      const keys = await fetchCompletedSessions(user.id);
      const map: Record<string, boolean> = {};
      keys.forEach((k) => { map[k] = true; });
      setCompleted(map);
      setSyncMsg(`¡Se importaron ${res.hyroxOcrImported} sesiones locales a la nube!`);
    } else {
      setSyncMsg('Tus sesiones locales ya estaban sincronizadas en la nube.');
    }
    setHasLocalToSync(false);
    setSyncing(false);
    setTimeout(() => setSyncMsg(null), 5000);
  };

  // Cronómetro integrado
  useEffect(() => {
    let tId: any = null;
    if (timerRunning && timerSeconds > 0) {
      tId = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            playBeepSound();
            return 0;
          }
          if (prev <= 4) {
            playBeepSound();
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (tId) clearInterval(tId);
    };
  }, [timerRunning, timerSeconds]);

  const startCountdown = (sec: number, label: string) => {
    setTimerInitial(sec);
    setTimerSeconds(sec);
    setTimerLabel(label);
    setTimerRunning(true);
  };

  // Cálculo de fase según periodización inversa
  const phaseInfo = getPhaseFromWeeks(weeksRemaining, targetWeeks);
  const activePhase: PeriodizationPhase = phaseInfo.phase;

  // Generación de semana con bloques combinados y periodización
  const sessions = discipline === 'hyrox' 
    ? generateHyroxWeek(hyroxLevel, activePhase) 
    : generateOcrWeek(ocrLevel, activePhase, gripTier);

  const session = sessions[activeDay];
  const level = discipline === 'hyrox' ? hyroxLevel : ocrLevel;
  const dayKey = `${discipline}_${level}_day${activeDay}`;

  const toggleCompleted = async () => {
    const willComplete = !completed[dayKey];
    if (user) {
      const ok = willComplete
        ? await markSessionCompleteCloud(user.id, discipline, level, activeDay)
        : await markSessionIncompleteCloud(user.id, discipline, level, activeDay);
      if (!ok) return;
    }
    setCompleted((prev) => ({ ...prev, [dayKey]: willComplete }));
    if (willComplete) {
      setShowFeedbackModal(true);
    }
  };

  const handleBlockToggle = (blockIndex: number) => {
    const key = `${dayKey}_block${blockIndex}`;
    setCompletedBlocks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const submitFeedback = () => {
    const feedback: PostWorkoutFeedback = {
      sessionId: dayKey,
      discipline,
      perceivedIntensity: feedbackIntensity,
      repsCompletion: feedbackCompletion,
      jointFatigue: feedbackJoint,
      loggedAt: Date.now(),
    };
    saveLastFeedback(nickname, feedback);
    const adj = calculateAutoregulation(feedback);
    setLastAdjustment(adj);
    setShowFeedbackModal(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* HEADER PRINCIPAL */}
      <div className="flex items-start justify-between mb-4 gap-3 flex-wrap">
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-zinc-900 flex items-center gap-2.5">
            <Mountain className="w-6 h-6 text-emerald-500" />
            Hyrox &amp; OCR
          </h2>
          <p className="text-zinc-500 text-xs mt-0.5">
            Compromised running, fuerza de agarre y periodización inversa para eventos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowReference(true)}
            className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-zinc-700 font-bold px-3 py-2 rounded-xl text-xs transition-all shrink-0"
            title="Ver los pesos oficiales reglamentarios y rutinas de calentamiento guiado"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Estándares &amp; Calentamiento</span>
          </button>
          {user ? (
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold px-3 py-2 rounded-xl text-xs transition-all shrink-0"
              title={`Sincronizado como ${user.email} — clic para salir`}
            >
              <Cloud className="w-3.5 h-3.5" />
              <span className="hidden sm:inline max-w-[140px] truncate">{user.email}</span>
              <LogOut className="w-3.5 h-3.5 ml-1" />
            </button>
          ) : (
            <button
              onClick={() => setShowAuthScreen(true)}
              className="flex items-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 font-bold px-3 py-2 rounded-xl text-xs transition-all shrink-0"
              title="Sincronizar entre dispositivos"
            >
              <CloudOff className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sincronizar</span>
            </button>
          )}
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
              <p className="text-xs font-black text-emerald-950">Sesiones locales encontradas</p>
              <p className="text-[11px] text-emerald-700">Tienes entrenamientos completados en este dispositivo. ¿Deseas subirlos a tu cuenta?</p>
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

      {/* TARJETA DE PERIODIZACIÓN INVERSA HACIA FECHA OBJETIVO */}
      <div className="bg-zinc-900 text-white rounded-2xl p-4 mb-4 border border-zinc-800 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${phaseInfo.badgeColor}`}>
                {phaseInfo.name}
              </span>
              <span className="text-xs text-zinc-400 font-bold">
                Semana {phaseInfo.weekNumber} de {targetWeeks} ({weeksRemaining} restantes)
              </span>
            </div>
            <p className="text-xs text-zinc-300 mt-1 font-semibold">{phaseInfo.subtitle}</p>
          </div>

          <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800 self-start sm:self-auto">
            <span className="text-[10px] font-bold text-zinc-500 px-1">Faltan:</span>
            {[16, 12, 8, 4, 1].map((w) => (
              <button
                key={w}
                onClick={() => {
                  setWeeksRemaining(w);
                  try {
                    localStorage.setItem(`fit_gen_${nickname}_race_weeks_rem`, String(w));
                  } catch (e) {}
                }}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  weeksRemaining === w ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {w} sem
              </button>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed">
          💡 <span className="text-zinc-200 font-bold">Foco actual:</span> {phaseInfo.focusDescription}
        </p>

        {lastAdjustment && (
          <div className={`mt-3 p-2.5 rounded-xl text-xs border flex items-center justify-between gap-2 ${
            lastAdjustment.alertType === 'warning'
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
              : lastAdjustment.alertType === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : 'bg-zinc-800/80 border-zinc-700 text-zinc-300'
          }`}>
            <div>
              <p className="font-extrabold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Ajuste IA previo: {lastAdjustment.feedbackTitle}
              </p>
              <p className="text-[11px] opacity-90">{lastAdjustment.feedbackAdvice}</p>
            </div>
            <button
              onClick={() => setShowFeedbackModal(true)}
              className="text-[10px] underline font-bold hover:text-white shrink-0"
            >
              Reevaluar
            </button>
          </div>
        )}
      </div>

      {/* SELECTOR DE DISCIPLINA */}
      <div className="grid grid-cols-2 gap-2 mb-4 bg-zinc-100 p-1.5 rounded-2xl">
        <button
          onClick={() => { setDiscipline('hyrox'); setActiveDay(0); }}
          className={`py-2.5 rounded-xl text-sm font-black transition-all cursor-pointer ${discipline === 'hyrox' ? 'bg-zinc-950 text-white shadow' : 'text-zinc-500 hover:text-zinc-800'}`}
        >
          Hyrox
        </button>
        <button
          onClick={() => { setDiscipline('ocr'); setActiveDay(0); }}
          className={`py-2.5 rounded-xl text-sm font-black transition-all cursor-pointer ${discipline === 'ocr' ? 'bg-zinc-950 text-white shadow' : 'text-zinc-500 hover:text-zinc-800'}`}
        >
          OCR (Obstáculos)
        </button>
      </div>

      {/* MI OBJETIVO / SUBNIVELES DE DISCIPLINA */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-zinc-500 mr-1">Mi objetivo:</span>
          {discipline === 'hyrox'
            ? HYROX_LEVELS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setHyroxLevel(l.id)}
                  title={l.description}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    hyroxLevel === l.id ? 'bg-[#1FD08A] border-[#1FD08A] text-zinc-950 font-black' : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300'
                  }`}
                >
                  {l.name}
                </button>
              ))
            : OCR_TIERS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setOcrLevel(t.id)}
                  title={t.description}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    ocrLevel === t.id ? 'bg-emerald-500 border-emerald-500 text-zinc-950 font-black' : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300'
                  }`}
                >
                  {t.name} · {t.distance}
                </button>
              ))}
        </div>

        {/* Nivel de agarre para OCR */}
        {discipline === 'ocr' && (
          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl">
            <span className="text-[10px] font-bold text-zinc-400 px-1">Agarre:</span>
            {GRIP_TIERS.map((g) => (
              <button
                key={g.id}
                onClick={() => setGripTier(g.id)}
                title={g.description}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  gripTier === g.id ? 'bg-purple-600 text-white' : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* CRONÓMETRO INTEGRADO / HANG TIMER TÁCTIL (MODO BOX/PISTA) */}
      <div className="mb-4 bg-zinc-950 text-white rounded-2xl p-3.5 border border-zinc-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
            <Timer className={`w-5 h-5 ${timerRunning ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-black tracking-wider text-purple-400">{timerLabel}</p>
            <p className="text-2xl font-black font-mono tabular-nums leading-none mt-0.5">
              {timerSeconds > 0 ? `${timerSeconds}s` : 'Listo'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold text-zinc-500 mr-1 hidden sm:inline">Suspensiones:</span>
          {[20, 30, 45, 60].map((sec) => (
            <button
              key={sec}
              onClick={() => startCountdown(sec, `Suspensión / Dead Hang ${sec}s`)}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold px-2.5 py-1.5 rounded-lg text-xs"
            >
              {sec}s hang
            </button>
          ))}
          <span className="text-[10px] font-bold text-zinc-500 mx-1 hidden sm:inline">Descanso:</span>
          {[60, 90].map((sec) => (
            <button
              key={sec}
              onClick={() => startCountdown(sec, `Descanso ${sec}s`)}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold px-2.5 py-1.5 rounded-lg text-xs"
            >
              +{sec}s
            </button>
          ))}
          {timerSeconds > 0 && (
            <button
              onClick={() => { setTimerRunning(false); setTimerSeconds(0); }}
              className="bg-red-950/60 hover:bg-red-900 text-red-300 font-bold px-2.5 py-1.5 rounded-lg text-xs ml-1"
            >
              Parar
            </button>
          )}
        </div>
      </div>

      {/* DÍAS SWITCHER */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {sessions.map((s, i) => (
          <button
            key={i}
            onClick={() => setActiveDay(i)}
            className={`p-3 rounded-2xl border text-center transition-all ${
              activeDay === i 
                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-800 font-black shadow-sm' 
                : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:border-zinc-300'
            }`}
          >
            <p className="text-[10px] font-black uppercase tracking-wider">Día {i + 1}</p>
            {completed[`${discipline}_${level}_day${i}`] ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto mt-1" />
            ) : s.isCompromisedDay ? (
              <span className="text-[9px] font-black text-purple-700 block mt-1">Metabólico</span>
            ) : null}
          </button>
        ))}
      </div>

      {/* DETALLE DE SESIÓN */}
      {session && (
        <div className="flex-1 overflow-y-auto space-y-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-zinc-900">{session.title}</h3>
              {session.isCompromisedDay && (
                <span className="bg-purple-100 text-purple-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  Compromised Running
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">{session.focus}</p>
          </div>

          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3">
            <p className="text-[10px] uppercase font-black text-zinc-400 tracking-wider mb-0.5">Calentamiento</p>
            <p className="text-xs text-zinc-700">{session.warmup}</p>
          </div>

          {/* GUÍA DE FORMATO DE RONDAS */}
          <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-3 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <span className="font-extrabold">¿Cómo funcionan las 3 rondas? </span>
              Se entrena en <strong>circuito continuo</strong>: haz 1 ronda del Bloque 1 → luego Bloque 2 → Bloque 3... hasta completar toda la lista (= <strong>1 Ronda completada</strong>). Descansas 90-120s y repites desde el Bloque 1 hasta completar el número total de rondas. ¡Toca el nombre de cualquier ejercicio para ver su técnica paso a paso!
            </div>
          </div>

          {/* CHECKLIST DE BLOQUES CON TARGETS GRANDES */}
          <div className="space-y-2">
            {session.blocks.map((b, i) => {
              const blockKey = `${dayKey}_block${i}`;
              const isChecked = Boolean(completedBlocks[blockKey]);
              return (
                <div
                  key={i}
                  onClick={() => handleBlockToggle(i)}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                    isChecked
                      ? 'bg-emerald-50/50 border-emerald-300 shadow-sm'
                      : b.isCompromised
                      ? 'bg-purple-50/30 border-purple-200 hover:border-purple-300'
                      : 'bg-white border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-all ${
                    isChecked 
                  ? 'bg-emerald-500 text-zinc-950' 
                  : b.isCompromised
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-zinc-100 text-zinc-700'
                  }`}>
                    {isChecked ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectedExercise(findExerciseDetail(b.name));
                        }}
                        className="flex items-center gap-1 cursor-pointer group/name hover:underline"
                        title="Toca para ver técnica y ejecución"
                      >
                        <p className={`font-extrabold text-sm group-hover/name:text-emerald-600 transition-colors ${isChecked ? 'line-through text-zinc-400' : 'text-zinc-900'}`}>
                          {b.name}
                        </p>
                        <Info className="w-3.5 h-3.5 text-zinc-400 group-hover/name:text-emerald-600 shrink-0" />
                      </div>
                      {b.isCompromised && (
                        <span className="text-[9px] bg-purple-600 text-white font-black px-1.5 py-0.5 rounded uppercase">
                          Compromised Run
                        </span>
                      )}
                      {b.isGripSpecific && (
                        <span className="text-[9px] bg-amber-500 text-zinc-950 font-black px-1.5 py-0.5 rounded uppercase">
                          Fuerza de Agarre
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-600 mt-0.5">{b.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3">
            <p className="text-xs text-blue-900 leading-snug font-medium">
              🏃 {session.runningNote}
            </p>
          </div>

          {/* BOTÓN GRANDE COMPLETAR SESIÓN */}
          <button
            onClick={toggleCompleted}
            className={`w-full font-black py-4 rounded-2xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg min-h-[52px] ${
              completed[dayKey] ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-950 hover:bg-zinc-800 text-white'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            {completed[dayKey] ? 'Sesión completada (Clic para reevaluar)' : 'Marcar sesión completada'}
          </button>
        </div>
      )}

      {/* MODAL DE FEEDBACK POST-ENTRENAMIENTO (AUTORREGULACIÓN) */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-zinc-200 shadow-2xl animate-fadeIn">
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 bg-purple-100 text-purple-700 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-black text-zinc-900">Feedback de la Sesión</h3>
            </div>
            <p className="text-xs text-zinc-500 mb-4">
              La IA autorregulará las cargas y volumen de tu próxima sesión en base a tus respuestas rápidas:
            </p>

            <div className="space-y-4">
              {/* 1. Intensidad */}
              <div>
                <label className="text-[11px] font-black uppercase text-zinc-700 block mb-1.5">
                  1. ¿Cómo sentiste el ritmo / intensidad?
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'muy_suave', label: 'Muy suave (+reserva)' },
                    { id: 'adecuado', label: 'En el punto' },
                    { id: 'al_limite', label: 'Al límite / Fallo' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setFeedbackIntensity(opt.id as any)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        feedbackIntensity === opt.id
                          ? 'bg-zinc-950 text-white border-zinc-950 shadow'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Reps y Estaciones */}
              <div>
                <label className="text-[11px] font-black uppercase text-zinc-700 block mb-1.5">
                  2. ¿Pudiste completar todas las rondas?
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'completas', label: '100% Completas' },
                    { id: 'adaptadas', label: 'Con adaptaciones' },
                    { id: 'incompletas', label: 'Incompletas' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setFeedbackCompletion(opt.id as any)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        feedbackCompletion === opt.id
                          ? 'bg-zinc-950 text-white border-zinc-950 shadow'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Molestia articular */}
              <div>
                <label className="text-[11px] font-black uppercase text-zinc-700 block mb-1.5">
                  3. ¿Fatiga o dolor articular/tendinoso?
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'ninguna', label: 'Cero dolor' },
                    { id: 'muscular_normal', label: 'Muscular normal' },
                    { id: 'molestia_articular', label: 'Molestia articular' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setFeedbackJoint(opt.id as any)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        feedbackJoint === opt.id
                          ? opt.id === 'molestia_articular'
                            ? 'bg-red-600 text-white border-red-600 shadow'
                            : 'bg-zinc-950 text-white border-zinc-950 shadow'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="flex-1 py-3 rounded-xl border border-zinc-200 text-zinc-600 font-bold text-xs hover:bg-zinc-50"
              >
                Omitir
              </button>
              <button
                onClick={submitFeedback}
                className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-md"
              >
                Guardar y Autorregular
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ESTÁNDARES OFICIALES Y CALENTAMIENTO */}
      {showReference && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-2xl w-full p-5 max-h-[90vh] flex flex-col text-white shadow-2xl animate-fadeIn">
            {/* Cabecera del modal */}
            <div className="flex items-start justify-between pb-3 border-b border-zinc-800 mb-4">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  Estándares Oficiales &amp; Calentamiento
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Pesos reglamentarios Hyrox y rutinas de activación funcional guiadas
                </p>
              </div>
              <button
                onClick={() => setShowReference(false)}
                className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selector de Pestañas */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-900 rounded-2xl mb-4 border border-zinc-800">
              <button
                onClick={() => setReferenceTab('hyrox_stations')}
                className={`py-2 px-2 rounded-xl text-xs font-black transition-all ${
                  referenceTab === 'hyrox_stations'
                    ? 'bg-amber-500 text-zinc-950 shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                🏋️ 8 Estaciones Hyrox
              </button>
              <button
                onClick={() => setReferenceTab('warmup_h')}
                className={`py-2 px-2 rounded-xl text-xs font-black transition-all ${
                  referenceTab === 'warmup_h'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                🔥 Calentamiento Hyrox
              </button>
              <button
                onClick={() => setReferenceTab('warmup_o')}
                className={`py-2 px-2 rounded-xl text-xs font-black transition-all ${
                  referenceTab === 'warmup_o'
                    ? 'bg-emerald-500 text-zinc-950 shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                🧗 Calentamiento OCR
              </button>
            </div>

            {/* Contenido según pestaña */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {referenceTab === 'hyrox_stations' && (
                <>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 text-xs text-amber-200">
                    <span className="font-black">Formato Oficial de Carrera Hyrox:</span> Se corre 1 km seguido de cada una de las 8 estaciones en este orden exacto (Total: 8 km de carrera + 8 ejercicios funcionales).
                  </div>

                  <div className="space-y-3">
                    {HYROX_OFFICIAL_STATIONS.map((station) => (
                      <div
                        key={station.order}
                        className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3.5 space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-black text-xs flex items-center justify-center shrink-0">
                              {station.order}
                            </span>
                            <div>
                              <h4 className="font-extrabold text-sm text-white">{station.name}</h4>
                              <p className="text-[11px] text-amber-400 font-semibold">{station.distanceOrReps}</p>
                            </div>
                          </div>
                        </div>

                        {/* Pesos reglamentarios */}
                        <div className="grid grid-cols-3 gap-2 bg-zinc-950/70 border border-zinc-800/80 p-2.5 rounded-xl text-center">
                          <div>
                            <p className="text-[10px] uppercase font-black text-zinc-500">Open Mujeres</p>
                            <p className="text-xs font-black text-white mt-0.5">{station.openWomenWeight}</p>
                          </div>
                          <div className="border-x border-zinc-800">
                            <p className="text-[10px] uppercase font-black text-zinc-500">Open Hombres</p>
                            <p className="text-xs font-black text-white mt-0.5">{station.openMenWeight}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-black text-amber-400">Pro Hombres</p>
                            <p className="text-xs font-black text-amber-300 mt-0.5">{station.proMenWeight}</p>
                          </div>
                        </div>

                        <p className="text-xs text-zinc-300 leading-relaxed">
                          {station.description}
                        </p>

                        <div className="bg-zinc-950/50 border border-zinc-800/60 rounded-xl p-2 flex items-start gap-2">
                          <span className="text-xs shrink-0">💡</span>
                          <p className="text-[11px] text-zinc-400 leading-snug">
                            <strong className="text-zinc-200">Consejo clave: </strong>{station.proTip}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {referenceTab === 'warmup_h' && (
                <div className="space-y-4">
                  <div className="bg-purple-900/20 border border-purple-500/30 rounded-2xl p-4">
                    <h4 className="font-black text-base text-purple-300 flex items-center gap-2">
                      <Flame className="w-5 h-5 text-purple-400" />
                      {HYROX_WARMUP_H.title}
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1">{HYROX_WARMUP_H.subtitle}</p>
                  </div>

                  <div className="space-y-2">
                    {HYROX_WARMUP_H.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 bg-zinc-900/80 border border-zinc-800 p-3 rounded-2xl"
                      >
                        <span className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-300 font-black text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <p className="text-xs font-semibold text-zinc-200 leading-relaxed">{item}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-xs text-zinc-400 leading-relaxed">
                    💡 <strong className="text-zinc-200">Por qué es importante:</strong> Activa el flujo sanguíneo y lubrica rodillas, caderas y hombros sin fatigarte, preparando el cuerpo para el impacto del running con piernas cargadas.
                  </div>
                </div>
              )}

              {referenceTab === 'warmup_o' && (
                <div className="space-y-4">
                  <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-2xl p-4">
                    <h4 className="font-black text-base text-emerald-300 flex items-center gap-2">
                      <Mountain className="w-5 h-5 text-emerald-400" />
                      {OCR_WARMUP_O.title}
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1">{OCR_WARMUP_O.subtitle}</p>
                  </div>

                  <div className="space-y-2">
                    {OCR_WARMUP_O.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 bg-zinc-900/80 border border-zinc-800 p-3 rounded-2xl"
                      >
                        <span className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-300 font-black text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <p className="text-xs font-semibold text-zinc-200 leading-relaxed">{item}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-xs text-zinc-400 leading-relaxed">
                    💡 <strong className="text-zinc-200">Protección de Agarre:</strong> Activar las escápulas y antebrazos antes de suspenderte en el aire previene tirones en los flexores de los dedos y molestias en los hombros.
                  </div>
                </div>
              )}
            </div>

            {/* Pie del modal */}
            <div className="pt-3 border-t border-zinc-800 mt-3 flex justify-end">
              <button
                onClick={() => setShowReference(false)}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {showAuthScreen && <AuthScreen onClose={() => setShowAuthScreen(false)} />}

      {/* MODAL DE TÉCNICA DETALLADA */}
      {inspectedExercise && (
        <ExerciseDetailModal
          exercise={inspectedExercise}
          onClose={() => setInspectedExercise(null)}
        />
      )}
    </div>
  );
}
