import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  RotateCcw, 
  Timer, 
  Sparkles, 
  ArrowUpDown, 
  Play, 
  Pause, 
  Plus, 
  X, 
  Flame, 
  Dumbbell,
  Volume2,
  VolumeX,
  Zap,
  Cloud,
  CloudOff,
  Info,
  ChevronRight
} from 'lucide-react';
import WorkoutSessionView from './WorkoutSessionView';
import { Level, GeneratedRoutine } from '../types';
import { generateRoutine } from '../lib/generator';
import { HistoryEntry, pushHistoryEntry, getProgressionSuggestion } from '../lib/progression';
import { getRecommendedRest, getTargetRIR } from '../lib/workoutRules';
import { playBeepSound } from '../lib/sound';
import { useAuth } from '../lib/auth';
import { fetchExerciseLogs, saveExerciseLogCloud } from '../lib/exerciseCloud';
import { ExerciseDetail, findExerciseDetail } from '../lib/exerciseBank';
import ExerciseDetailModal from './ExerciseDetailModal';

interface QuickModuleProps {
  nickname: string;
  selectedLevel: Level;
  onNotification?: (msg: string) => void;
}

export default function QuickModule({ nickname, selectedLevel, onNotification }: QuickModuleProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'A' | 'B'>('A');
  const [routine, setRoutine] = useState<GeneratedRoutine | null>(null);
  const [exerciseLogs, setExerciseLogs] = useState<Record<string, { weight: string; reps: string; completed: boolean }>>({});
  const [exerciseHistory, setExerciseHistory] = useState<Record<string, HistoryEntry[]>>({});

  // Estados de Sesión Activa (Imagen 1)
  const [activeSession, setActiveSession] = useState<boolean>(false);
  const [sessionInitialIndex, setSessionInitialIndex] = useState<number>(0);
  const [warmupOpen, setWarmupOpen] = useState<boolean>(false);

  // Modal de técnica
  const [inspectedExercise, setInspectedExercise] = useState<ExerciseDetail | null>(null);

  const formatCleanReps = (reps?: string) => {
    if (!reps) return 'reps';
    const clean = reps.replace(/reps?|repeticiones/gi, '').trim();
    return `${clean} reps`;
  };

  // Rest Timer states
  const [timerDuration, setTimerDuration] = useState<number>(60);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showFinishedAlert, setShowFinishedAlert] = useState<boolean>(false);

  // Load from Supabase or localStorage
  useEffect(() => {
    let isCancelled = false;

    if (user) {
      fetchExerciseLogs(user.id, 'quick').then(({ currentLogs, history }) => {
        if (!isCancelled) {
          if (Object.keys(currentLogs).length > 0) setExerciseLogs(currentLogs);
          if (Object.keys(history).length > 0) setExerciseHistory(history);
        }
      });

      try {
        const savedRoutine = localStorage.getItem(`fit_gen_${nickname}_quick_routine_${selectedLevel}_v1`)
          || (selectedLevel === 'B' ? localStorage.getItem(`fit_gen_${nickname}_quick_routine_v1`) : null);
        if (savedRoutine) {
          setRoutine(JSON.parse(savedRoutine));
        } else {
          setRoutine(generateRoutine(selectedLevel));
        }
      } catch (e) {
        setRoutine(generateRoutine(selectedLevel));
      }
      return;
    }

    if (!nickname) return;

    try {
      const savedRoutine = localStorage.getItem(`fit_gen_${nickname}_quick_routine_${selectedLevel}_v1`)
        || (selectedLevel === 'B' ? localStorage.getItem(`fit_gen_${nickname}_quick_routine_v1`) : null);
      if (savedRoutine) {
        setRoutine(JSON.parse(savedRoutine));
      } else {
        setRoutine(generateRoutine(selectedLevel));
      }
    } catch (e) {
      setRoutine(generateRoutine(selectedLevel));
    }

    try {
      const savedLogs = localStorage.getItem(`fit_gen_${nickname}_logs_v2`);
      setExerciseLogs(savedLogs ? JSON.parse(savedLogs) : {});
    } catch (e) {
      setExerciseLogs({});
    }

    try {
      const savedHistory = localStorage.getItem(`fit_gen_${nickname}_history_v1`);
      setExerciseHistory(savedHistory ? JSON.parse(savedHistory) : {});
    } catch (e) {
      setExerciseHistory({});
    }

    return () => {
      isCancelled = true;
    };
  }, [nickname, selectedLevel, user]);

  // Persist routine
  useEffect(() => {
    if (!nickname || !routine) return;
    try {
      localStorage.setItem(`fit_gen_${nickname}_quick_routine_${selectedLevel}_v1`, JSON.stringify(routine));
    } catch (e) {
      console.error(e);
    }
  }, [routine, nickname, selectedLevel]);

  // Persist logs
  useEffect(() => {
    if (user || !nickname) return;
    try {
      localStorage.setItem(`fit_gen_${nickname}_logs_v2`, JSON.stringify(exerciseLogs));
    } catch (e) {
      console.error(e);
    }
  }, [exerciseLogs, nickname, user]);

  // Persist history
  useEffect(() => {
    if (user || !nickname) return;
    try {
      localStorage.setItem(`fit_gen_${nickname}_history_v1`, JSON.stringify(exerciseHistory));
    } catch (e) {
      console.error(e);
    }
  }, [exerciseHistory, nickname, user]);

  // Rest Timer countdown
  useEffect(() => {
    let timerId: any = null;
    if (timerRunning && timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            playBeepSound(isMuted);
            setShowFinishedAlert(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [timerRunning, timeLeft, isMuted]);

  const startTimer = (seconds: number, exerciseName: string | null = null) => {
    setTimerDuration(seconds);
    setTimeLeft(seconds);
    setTimerRunning(true);
    setActiveExercise(exerciseName);
    setShowFinishedAlert(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleUpdateLog = (exerciseName: string, field: 'weight' | 'reps', value: string) => {
    const key = `${selectedLevel}_${activeTab}_${exerciseName}`;
    setExerciseLogs((prev) => ({
      ...prev,
      [key]: {
        ...prev[key] || { weight: '', reps: '', completed: false },
        [field]: value
      }
    }));
  };

  const handleToggleCompleted = (exerciseName: string) => {
    const key = `${selectedLevel}_${activeTab}_${exerciseName}`;
    setExerciseLogs((prev) => {
      const current = prev[key] || { weight: '', reps: '', completed: false };
      const nowCompleting = !current.completed;
      if (nowCompleting && current.weight && current.reps) {
        setExerciseHistory((prevHist) => ({
          ...prevHist,
          [key]: pushHistoryEntry(prevHist[key], { weight: current.weight, reps: current.reps, date: Date.now() })
        }));
      }
      if (user) {
        saveExerciseLogCloud(user.id, 'quick', key, current.weight, current.reps, nowCompleting);
      }
      return {
        ...prev,
        [key]: {
          ...current,
          completed: nowCompleting
        }
      };
    });
  };

  const handleToggleCompleteAll = () => {
    if (!routine) return;
    const exercises = activeTab === 'A' ? routine.sessionA : routine.sessionB;
    const allCompleted = exercises.every((ex) => {
      const key = `${selectedLevel}_${activeTab}_${ex.name}`;
      return exerciseLogs[key]?.completed;
    });
    const nowCompleting = !allCompleted;

    if (nowCompleting) {
      setExerciseHistory((prevHist) => {
        const updated = { ...prevHist };
        exercises.forEach((ex) => {
          const key = `${selectedLevel}_${activeTab}_${ex.name}`;
          const log = exerciseLogs[key];
          if (log?.weight && log?.reps) {
            updated[key] = pushHistoryEntry(updated[key], { weight: log.weight, reps: log.reps, date: Date.now() });
          }
        });
        return updated;
      });
    }

    if (user) {
      exercises.forEach((ex) => {
        const key = `${selectedLevel}_${activeTab}_${ex.name}`;
        const log = exerciseLogs[key];
        saveExerciseLogCloud(user.id, 'quick', key, log?.weight || '', log?.reps || '', nowCompleting);
      });
    }

    setExerciseLogs((prev) => {
      const updated = { ...prev };
      exercises.forEach((ex) => {
        const key = `${selectedLevel}_${activeTab}_${ex.name}`;
        updated[key] = {
          weight: prev[key]?.weight || '',
          reps: prev[key]?.reps || '',
          completed: nowCompleting
        };
      });
      return updated;
    });
  };

  const handleGenerate = () => {
    setRoutine(generateRoutine(selectedLevel));
    setTimeLeft(0);
    setTimerRunning(false);
    setActiveExercise(null);
    setShowFinishedAlert(false);
    if (onNotification) {
      onNotification('¡Sesión rápida recalculada con nuevos ejercicios!');
    }
  };

  if (!routine) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 p-8">
        <Dumbbell className="w-12 h-12 mb-4 opacity-20 animate-pulse" />
        <p className="font-semibold text-sm">Generando rutina rápida...</p>
      </div>
    );
  }

  const currentExercises = activeTab === 'A' ? routine.sessionA : routine.sessionB;
  const completedCount = currentExercises.filter((ex) => {
    const key = `${selectedLevel}_${activeTab}_${ex.name}`;
    return exerciseLogs[key]?.completed;
  }).length;
  const totalCount = currentExercises.length;

  if (activeSession && currentExercises.length > 0) {
    const sessionLogs: Record<string, { weight: string; reps: string; completed?: boolean }> = {};
    currentExercises.forEach((ex) => {
      const k = `${selectedLevel}_${activeTab}_${ex.name}`;
      if (exerciseLogs[k]) {
        sessionLogs[ex.name] = exerciseLogs[k];
      }
    });

    return (
      <WorkoutSessionView
        dayName={activeTab === 'A' ? 'Rutina rápida: Tren inferior (Sesión A)' : 'Rutina rápida: Tren superior (Sesión B)'}
        exercises={currentExercises}
        nickname={nickname}
        selectedLevel={selectedLevel}
        dayId={activeTab === 'A' ? 101 : 102}
        initialExerciseIndex={sessionInitialIndex}
        onClose={() => setActiveSession(false)}
        onFinishWorkout={() => {
          setActiveSession(false);
          if (onNotification) {
            onNotification(`¡Sesión rápida ${activeTab} completada!`);
          }
        }}
        onNotification={onNotification}
      />
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full text-[#F4F2ED]">
      {/* TARJETA PROTAGONISTA DE LA SESIÓN RÁPIDA */}
      <div className="bg-[#20252C] rounded-3xl p-5 mb-5 border border-[#282F38] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="bg-[#1FD08A]/15 text-[#1FD08A] px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-[#1FD08A]/30">
                Rutina rápida A/B
              </span>
              <span className="text-xs font-semibold text-[#A8B0BB]">
                <strong className="text-white font-mono">{completedCount}</strong> de {totalCount} completados
              </span>
            </div>
            <h3 className="text-xl font-black text-white">
              {activeTab === 'A' ? 'Sesión A: Tren inferior' : 'Sesión B: Tren superior'}
            </h3>
            <p className="text-xs text-[#A8B0BB] mt-0.5">
              {activeTab === 'A'
                ? 'Dominante de rodilla, cadera y accesorios de tren inferior.'
                : 'Patrones de empuje, tracción, brazos y estabilidad del core.'}
            </p>
          </div>

          {/* Selector Sesión A / Sesión B */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center gap-1 bg-[#15181D] p-1 rounded-2xl border border-[#282F38]">
              <button
                onClick={() => setActiveTab('A')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'A'
                    ? 'bg-[#5B8DEF] text-white shadow-sm'
                    : 'text-[#A8B0BB] hover:text-white'
                }`}
              >
                Sesión A
              </button>
              <button
                onClick={() => setActiveTab('B')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'B'
                    ? 'bg-[#5B8DEF] text-white shadow-sm'
                    : 'text-[#A8B0BB] hover:text-white'
                }`}
              >
                Sesión B
              </button>
            </div>

            <button
              onClick={handleGenerate}
              className="p-2 bg-[#15181D] hover:bg-[#282F38] text-[#A8B0BB] hover:text-white rounded-xl border border-[#282F38] transition-all cursor-pointer"
              title="Recalcular ejercicios aleatorios"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Botón protagonista para empezar la sesión (abre WorkoutSessionView) */}
        <button
          onClick={() => {
            setSessionInitialIndex(0);
            setActiveSession(true);
          }}
          className="w-full bg-[#1FD08A] hover:bg-[#1ab87a] text-[#15181D] font-black py-4 px-6 rounded-2xl text-base transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(31,208,138,0.35)] cursor-pointer"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Empezar sesión ({activeTab === 'A' ? 'Tren inferior' : 'Tren superior'})</span>
        </button>
      </div>

      {/* CRONÓMETRO DE DESCANSO EN MODO REPOSO */}
      {timeLeft > 0 && (
        <div className="mb-5 bg-[#20252C] text-[#F4F2ED] rounded-2xl p-4 border border-[#282F38] shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#1FD08A]/15 text-[#1FD08A] flex items-center justify-center shrink-0">
                <Timer className={`w-4 h-4 ${timerRunning ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <h4 className="font-bold text-[10px] tracking-wider text-[#1FD08A] uppercase">Recuperación activa</h4>
                <h3 className="font-bold text-xs text-[#F4F2ED] truncate max-w-[150px] sm:max-w-xs">
                  {activeExercise ? `Siguiente: ${activeExercise}` : 'Descanso muscular'}
                </h3>
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-3">
              <div className="text-3xl font-extrabold font-mono tracking-tight text-[#1FD08A] tabular-nums">
                {formatTime(timeLeft)}
              </div>
              <div className="flex items-center gap-1 bg-[#15181D] p-1 rounded-xl border border-[#282F38]">
                <button
                  onClick={() => setTimerRunning(!timerRunning)}
                  className="p-1.5 hover:bg-[#282F38] rounded-lg text-[#A8B0BB] hover:text-[#1FD08A] cursor-pointer"
                >
                  {timerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => { setTimeLeft((t) => t + 30); setTimerDuration((d) => d + 30); }}
                  className="px-2 py-1 hover:bg-[#282F38] rounded-lg text-[#A8B0BB] hover:text-white text-[10px] font-bold cursor-pointer"
                >
                  +30s
                </button>
                <button
                  onClick={() => { setTimeLeft(0); setTimerRunning(false); }}
                  className="p-1.5 hover:bg-rose-950/60 rounded-lg text-[#A8B0BB] hover:text-[#F2685B] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
          <div className="mt-2.5 w-full bg-[#15181D] rounded-full h-1 overflow-hidden">
            <div
              className="bg-[#1FD08A] h-full transition-all duration-1000 ease-linear"
              style={{ width: `${(timeLeft / timerDuration) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* AVISO DE CALENTAMIENTO RAMP PLEGABLE */}
      <div className="mb-4 bg-[#20252C] border border-[#282F38] rounded-2xl overflow-hidden transition-all">
        <button
          onClick={() => setWarmupOpen(!warmupOpen)}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#282F38]/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#F4F2ED]">Calentamiento RAMP (5-10 min)</span>
              <p className="text-[11px] text-[#A8B0BB]">Prepara articulaciones y sistema nervioso antes de cargar peso</p>
            </div>
          </div>
          <ChevronRight className={`w-4 h-4 text-[#A8B0BB] transition-transform duration-200 ${warmupOpen ? 'rotate-90' : ''}`} />
        </button>

        {warmupOpen && (
          <div className="px-4 pb-4 pt-1 border-t border-[#282F38] space-y-2 text-xs text-[#A8B0BB]">
            <div className="flex items-start gap-2.5 bg-[#15181D] p-2.5 rounded-xl border border-[#282F38]">
              <span className="font-mono font-bold text-amber-400 shrink-0">1. R</span>
              <div>
                <strong className="text-white">Aumento de pulso:</strong> 3 a 5 min de cardio suave.
              </div>
            </div>
            <div className="flex items-start gap-2.5 bg-[#15181D] p-2.5 rounded-xl border border-[#282F38]">
              <span className="font-mono font-bold text-amber-400 shrink-0">2. A</span>
              <div>
                <strong className="text-white">Activación neuromuscular:</strong> 1 serie con banda o peso corporal.
              </div>
            </div>
            <div className="flex items-start gap-2.5 bg-[#15181D] p-2.5 rounded-xl border border-[#282F38]">
              <span className="font-mono font-bold text-amber-400 shrink-0">3. M</span>
              <div>
                <strong className="text-white">Movilidad articular dinámica:</strong> 5-8 repeticiones dinámicas.
              </div>
            </div>
            <div className="flex items-start gap-2.5 bg-[#15181D] p-2.5 rounded-xl border border-[#282F38]">
              <span className="font-mono font-bold text-amber-400 shrink-0">4. P</span>
              <div>
                <strong className="text-white">Potenciación:</strong> 1-2 series de aproximación con el 50% del peso objetivo.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* LISTA DE EJERCICIOS (TARJETAS COMPACTAS) */}
      <div className="space-y-2.5 flex-1 overflow-y-auto">
        {currentExercises.map((exercise, index) => {
          const key = `${selectedLevel}_${activeTab}_${exercise.name}`;
          const log = exerciseLogs[key] || { weight: '', reps: '', completed: false };
          const suggestion = getProgressionSuggestion(exerciseHistory[key], exercise.defaultReps);

          return (
            <div
              key={index}
              className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                log.completed
                  ? 'bg-[#1FD08A]/10 border-[#1FD08A]/35'
                  : 'bg-[#20252C] border-[#282F38] hover:border-[#3A434F]'
              }`}
            >
              {/* Izquierda: Checkbox y Detalles */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleCompleted(exercise.name);
                  }}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-all cursor-pointer mt-0.5 ${
                    log.completed
                      ? 'bg-[#1FD08A] border-[#1FD08A] text-[#15181D] shadow-sm'
                      : 'bg-[#15181D] border-[#282F38] text-[#A8B0BB] hover:border-[#5B8DEF]'
                  }`}
                  title={log.completed ? 'Desmarcar ejercicio' : 'Marcar ejercicio como completado'}
                >
                  <CheckCircle className={`w-4 h-4 ${log.completed ? 'text-[#15181D]' : 'text-[#A8B0BB]'}`} />
                </button>

                <div 
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => {
                    setSessionInitialIndex(index);
                    setActiveSession(true);
                  }}
                >
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    <span className="text-[10px] font-bold text-[#A8B0BB] bg-[#15181D] px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {exercise.category}
                    </span>
                    <span className="text-[10px] font-bold text-white bg-[#15181D] px-2 py-0.5 rounded-md font-mono">
                      {exercise.defaultSets} × {formatCleanReps(exercise.defaultReps)}
                    </span>
                    <span className="text-[10px] font-bold text-purple-300 bg-purple-950/60 border border-purple-800/40 px-2 py-0.5 rounded-md">
                      RIR {getTargetRIR(exercise.category)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 group/name w-fit">
                    <p className={`font-black text-sm leading-snug group-hover/name:text-[#1FD08A] transition-colors ${
                      log.completed ? 'text-white' : 'text-[#F4F2ED]'
                    }`}>
                      {exercise.name}
                    </p>
                  </div>

                  {exercise.description && (
                    <p className="text-xs text-[#A8B0BB] mt-0.5 line-clamp-1">
                      {exercise.description}
                    </p>
                  )}

                  {/* Historial o sugerencia de progresión */}
                  {(log.weight || log.reps || suggestion) && (
                    <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                      {(log.weight || log.reps) && (
                        <span className="text-[11px] font-mono text-[#A8B0BB] bg-[#15181D] px-2 py-0.5 rounded border border-[#282F38]">
                          Último: <strong className="text-white">{log.weight || '--'} kg</strong> × <strong className="text-white">{log.reps || '--'} reps</strong>
                        </span>
                      )}
                      {suggestion && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1FD08A] bg-[#1FD08A]/10 border border-[#1FD08A]/20 px-2 py-0.5 rounded">
                          <ArrowUpDown className="w-3 h-3 text-[#1FD08A]" />
                          {suggestion.text}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Derecha: Acciones rápidas (Técnica, Entrenar) */}
              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => setInspectedExercise(findExerciseDetail(exercise.name))}
                  className="p-2 bg-[#15181D] hover:bg-[#282F38] text-[#A8B0BB] hover:text-white rounded-xl text-xs transition-colors border border-[#282F38] cursor-pointer"
                  title="Ver técnica detallada"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    setSessionInitialIndex(index);
                    setActiveSession(true);
                  }}
                  className="px-3 py-1.5 bg-[#1FD08A]/15 hover:bg-[#1FD08A] text-[#1FD08A] hover:text-[#15181D] rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>Entrenar</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ACCIONES SECUNDARIAS AL FONDO */}
      <div className="mt-6 pt-4 border-t border-[#282F38] flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleToggleCompleteAll}
          className={`flex-1 font-bold py-3.5 px-4 rounded-2xl transition-all text-xs cursor-pointer ${
            completedCount === totalCount && totalCount > 0
              ? 'bg-[#15181D] hover:bg-[#282F38] text-[#A8B0BB] border border-[#282F38]'
              : 'bg-[#20252C] hover:bg-[#282F38] text-[#F4F2ED] border border-[#282F38]'
          }`}
        >
          {completedCount === totalCount && totalCount > 0
            ? 'Reiniciar progreso de sesión'
            : `Marcar Sesión ${activeTab} como realizada`}
        </button>

        <button
          onClick={handleGenerate}
          className="bg-[#20252C] hover:bg-[#282F38] text-[#A8B0BB] hover:text-white border border-[#282F38] font-bold py-3.5 px-4 rounded-2xl transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Generar nuevos ejercicios</span>
        </button>
      </div>

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
