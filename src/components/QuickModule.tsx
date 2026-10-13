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
  Info
} from 'lucide-react';
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

  // Modal de técnica
  const [inspectedExercise, setInspectedExercise] = useState<ExerciseDetail | null>(null);

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

  return (
    <div className="flex flex-col flex-1 h-full">
      {/* HEADER & SELECTOR DE SESIÓN */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-zinc-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="bg-emerald-100 text-emerald-800 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-block shadow-sm border border-emerald-200">
              Entrenamiento Rápido A/B
            </span>
            {user ? (
              <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                <Cloud className="w-3 h-3" /> Nube
              </span>
            ) : (
              <span className="bg-zinc-100 text-zinc-500 border border-zinc-200 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                <CloudOff className="w-3 h-3" /> Local
              </span>
            )}
            <span className="text-zinc-500 text-xs font-bold">
              {completedCount} / {totalCount} completados
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900">
            {activeTab === 'A' ? 'Sesión A: Tren Inferior' : 'Sesión B: Tren Superior'}
          </h3>
          <p className="text-zinc-500 text-xs mt-0.5">
            {activeTab === 'A'
              ? 'Dominante de rodilla, cadera y accesorios de tren inferior.'
              : 'Patrones de empuje, tracción, brazos y estabilidad del core.'}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="bg-zinc-100 p-1 rounded-xl flex flex-1 md:flex-initial">
            <button
              onClick={() => setActiveTab('A')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${
                activeTab === 'A' ? 'bg-white shadow text-emerald-600' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              SESIÓN A
            </button>
            <button
              onClick={() => setActiveTab('B')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${
                activeTab === 'B' ? 'bg-white shadow text-emerald-600' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              SESIÓN B
            </button>
          </div>

          <button
            onClick={handleGenerate}
            className="p-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl transition-all"
            title="Recalcular ejercicios aleatorios"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* REST TIMER WIDGET */}
      {timeLeft > 0 ? (
        <div className="mb-6 bg-zinc-950 text-white rounded-2xl p-4 border border-zinc-800 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Timer className={`w-5 h-5 ${timerRunning ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <h4 className="font-bold text-xs tracking-wider text-emerald-400 uppercase">
                  Cronómetro de Descanso
                </h4>
                <h3 className="font-bold text-sm text-zinc-200 mt-0.5 truncate max-w-[200px] sm:max-w-xs">
                  {activeExercise ? `Sig. Ejercicio: ${activeExercise}` : 'Recuperación muscular'}
                </h3>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-start gap-4">
              <div className="text-4xl font-extrabold font-mono tracking-tight text-emerald-400 tabular-nums">
                {formatTime(timeLeft)}
              </div>

              <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                <button
                  onClick={() => setTimerRunning(!timerRunning)}
                  className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-emerald-400"
                >
                  {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => { setTimeLeft((t) => t + 30); setTimerDuration((d) => d + 30); }}
                  className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white flex items-center gap-1 text-xs font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />30s
                </button>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => { setTimeLeft(0); setTimerRunning(false); }}
                  className="p-2 hover:bg-red-950 rounded-lg text-zinc-500 hover:text-red-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="mt-3.5 w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${(timeLeft / timerDuration) * 100}%` }}
            />
          </div>
        </div>
      ) : showFinishedAlert ? (
        <div className="mb-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 rounded-2xl p-4 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5" />
            <div>
              <h4 className="font-bold text-sm">¡Descanso Completado!</h4>
              <p className="text-xs font-semibold opacity-90">Listo para la siguiente serie.</p>
            </div>
          </div>
          <button
            onClick={() => setShowFinishedAlert(false)}
            className="bg-zinc-950 text-white hover:bg-zinc-900 px-3 py-1.5 rounded-xl text-xs font-bold"
          >
            Entendido
          </button>
        </div>
      ) : (
        <div className="mb-6 bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-zinc-600">Descanso rápido entre series:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {[30, 45, 60, 90, 120].map((s) => (
              <button
                key={s}
                onClick={() => startTimer(s, null)}
                className="bg-white hover:bg-emerald-50 text-zinc-800 hover:text-emerald-700 font-bold px-3 py-1.5 rounded-xl text-xs border border-zinc-200"
              >
                +{s}s
              </button>
            ))}
          </div>
        </div>
      )}

      {/* AVISO DE CALENTAMIENTO */}
      <div className="mb-4 flex items-start gap-2 bg-amber-50 border border-amber-200/70 rounded-xl px-3 py-2">
        <Flame className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-[11px] text-amber-800 leading-snug">
          <span className="font-bold">Calienta antes de empezar:</span> 5-10 min de cardio suave + 1-2 series de aproximación con poco peso en el primer ejercicio.
        </p>
      </div>

      {/* LISTA DE EJERCICIOS */}
      <div className="space-y-3 flex-1 overflow-y-auto">
        {currentExercises.map((exercise, index) => {
          const key = `${selectedLevel}_${activeTab}_${exercise.name}`;
          const log = exerciseLogs[key] || { weight: '', reps: '', completed: false };
          const suggestion = getProgressionSuggestion(exerciseHistory[key], exercise.defaultReps);

          return (
            <div
              key={index}
              className={`flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-2xl border transition-all duration-200 ${
                log.completed
                  ? 'bg-emerald-50/40 border-emerald-300'
                  : 'bg-zinc-50 border-zinc-200 hover:bg-white hover:border-zinc-300'
              }`}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <button
                  onClick={() => handleToggleCompleted(exercise.name)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                    log.completed
                      ? 'bg-emerald-500 border-emerald-500 text-zinc-950 shadow-sm'
                      : 'bg-white border-zinc-200 text-zinc-300 hover:border-zinc-400'
                  }`}
                  title={log.completed ? 'Desmarcar' : 'Marcar como realizado'}
                >
                  <CheckCircle className={`w-5 h-5 ${log.completed ? 'text-zinc-950' : 'text-zinc-300'}`} />
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 bg-zinc-200/60 px-1.5 py-0.5 rounded">
                      {exercise.category}
                    </span>
                    {exercise.defaultSets && exercise.defaultReps && (
                      <span className="text-[10px] font-bold text-zinc-500 bg-zinc-200/60 px-1.5 py-0.5 rounded">
                        Objetivo: {exercise.defaultSets}× {exercise.defaultReps}
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                      RIR {getTargetRIR(exercise.category)}
                    </span>
                  </div>

                  <div
                    onClick={() => setInspectedExercise(findExerciseDetail(exercise.name))}
                    className="flex items-center gap-1.5 cursor-pointer group/name w-fit"
                    title="Toca para ver técnica correcta, errores comunes y respiración"
                  >
                    <p className="font-bold text-base text-zinc-900 leading-tight group-hover/name:text-emerald-600 transition-colors">
                      {exercise.name}
                    </p>
                    <Info className="w-3.5 h-3.5 text-zinc-400 group-hover/name:text-emerald-600 transition-colors shrink-0" />
                  </div>
                  {exercise.description && (
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2 md:line-clamp-none">
                      {exercise.description}
                    </p>
                  )}

                  {suggestion && (
                    <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                        <ArrowUpDown className="w-3 h-3 text-emerald-600" />
                        {suggestion.text}
                      </span>
                      {suggestion.trend && (
                        <span className="text-[10px] text-zinc-500 font-semibold">{suggestion.trend}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Inputs de Peso y Reps */}
              <div className="flex items-center gap-2.5 shrink-0 bg-white p-1.5 rounded-xl border border-zinc-200 shadow-sm w-full md:w-auto justify-between md:justify-start">
                <div className="flex items-center gap-1.5 px-2 py-1 flex-1 md:flex-initial">
                  <span className="text-[10px] uppercase font-black text-zinc-400 select-none">Peso</span>
                  <input
                    type="text"
                    placeholder="--"
                    value={log.weight}
                    onChange={(e) => handleUpdateLog(exercise.name, 'weight', e.target.value)}
                    className="w-12 bg-transparent text-zinc-900 focus:outline-none text-center text-xs font-bold font-mono"
                    title="Ingresa el peso en kg"
                  />
                  <span className="text-[10px] text-zinc-500 font-bold select-none">kg</span>
                </div>

                <div className="w-[1px] h-4 bg-zinc-200" />

                <div className="flex items-center gap-1.5 px-2 py-1 flex-1 md:flex-initial">
                  <span className="text-[10px] uppercase font-black text-zinc-400 select-none">Reps</span>
                  <input
                    type="text"
                    placeholder="--"
                    value={log.reps}
                    onChange={(e) => handleUpdateLog(exercise.name, 'reps', e.target.value)}
                    className="w-10 bg-transparent text-zinc-900 focus:outline-none text-center text-xs font-bold font-mono"
                    title="Ingresa las repeticiones hechas"
                  />
                </div>
              </div>

              {/* Botón de descanso */}
              <div className="flex items-center justify-end shrink-0 gap-2 w-full md:w-auto">
                <button
                  onClick={() => startTimer(getRecommendedRest(exercise.category), exercise.name)}
                  className="w-full md:w-auto bg-white hover:bg-emerald-500 text-zinc-700 hover:text-zinc-950 font-bold px-3.5 py-1.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 border border-zinc-200 shadow-sm"
                >
                  <Timer className="w-4 h-4 text-zinc-400" />
                  <span>Descansar {getRecommendedRest(exercise.category)}s</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleToggleCompleteAll}
        className={`mt-6 w-full font-bold py-4 rounded-2xl transition-all uppercase tracking-widest text-sm shadow-lg ${
          completedCount === totalCount && totalCount > 0
            ? 'bg-zinc-200 hover:bg-zinc-300 text-zinc-900'
            : 'bg-zinc-950 hover:bg-zinc-800 text-white shadow-zinc-900/10'
        }`}
      >
        {completedCount === totalCount && totalCount > 0
          ? 'Reiniciar sesión'
          : `Marcar sesión ${activeTab} como realizada`}
      </button>
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
