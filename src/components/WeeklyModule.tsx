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
  Trophy, 
  Save, 
  Dumbbell, 
  RefreshCw,
  Calendar,
  Layers,
  ChevronRight,
  Cloud,
  CloudOff,
  Info
} from 'lucide-react';
import { Level } from '../types';
import { 
  WeeklyRoutine, 
  WeeklyExercise, 
  generateWeeklyRoutine, 
  getAlternativeWeeklyExercises,
  RoutineFocus
} from '../lib/weeklyGenerator';
import { 
  HistoryEntry, 
  pushHistoryEntry, 
  getProgressionSuggestion 
} from '../lib/progression';
import { getRecommendedRest, getTargetRIR } from '../lib/workoutRules';
import { playBeepSound } from '../lib/sound';
import { useAuth } from '../lib/auth';
import { 
  fetchExerciseLogs, 
  saveExerciseLogCloud, 
  fetchUserProfileCloud, 
  updateUserProfileCloud 
} from '../lib/exerciseCloud';
import { ExerciseDetail, findExerciseDetail } from '../lib/exerciseBank';
import ExerciseDetailModal from './ExerciseDetailModal';

interface WeeklyModuleProps {
  nickname: string;
  selectedLevel: Level;
  onNotification?: (msg: string) => void;
}

export default function WeeklyModule({ nickname, selectedLevel, onNotification }: WeeklyModuleProps) {
  const { user } = useAuth();
  const [activeWeeklyDay, setActiveWeeklyDay] = useState<number>(1);
  const [weeklyRoutine, setWeeklyRoutine] = useState<WeeklyRoutine | null>(null);
  const [weeklyLogs, setWeeklyLogs] = useState<Record<string, { weight: string; reps: string; completed: boolean }>>({});
  const [weeklyHistory, setWeeklyHistory] = useState<Record<string, HistoryEntry[]>>({});
  const [weeklyRoutineStartDate, setWeeklyRoutineStartDate] = useState<number>(Date.now());
  const [mesocycleTargetWeeks, setMesocycleTargetWeeks] = useState<number>(8); // 8 semanas = 2 meses por defecto
  const [mesocycleWeek, setMesocycleWeek] = useState<number>(1); // Semana activa real del microciclo
  const [routineDays, setRoutineDays] = useState<3 | 4 | 5>(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem(`fit_gen_${nickname}_weekly_days_count`) : null;
      if (saved === '3' || saved === '4' || saved === '5') return parseInt(saved, 10) as 3 | 4 | 5;
    } catch (e) {}
    return 4;
  });
  const [routineFocus, setRoutineFocus] = useState<RoutineFocus>(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem(`fit_gen_${nickname}_weekly_focus_v1`) : null;
      if (saved === 'glutes' || saved === 'standard') return saved as RoutineFocus;
    } catch (e) {}
    return 'standard';
  });

  // Estado para sustituir ejercicio individual
  const [swapModalState, setSwapModalState] = useState<{ dayId: number; exIndex: number; currentName: string } | null>(null);

  // Estado para modal de técnica detallada de ejercicio
  const [inspectedExercise, setInspectedExercise] = useState<ExerciseDetail | null>(null);

  // Estados del temporizador de descanso
  const [timerDuration, setTimerDuration] = useState<number>(60);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showFinishedAlert, setShowFinishedAlert] = useState<boolean>(false);

  // Estados del AMRAP
  const [amrapType, setAmrapType] = useState<'complementary' | 'activator'>('complementary');
  const [amrapCustomDuration, setAmrapCustomDuration] = useState<number>(selectedLevel === 'A' ? 5 : selectedLevel === 'C' ? 10 : 7);
  const [amrapTimeLeft, setAmrapTimeLeft] = useState<number>((selectedLevel === 'A' ? 5 : selectedLevel === 'C' ? 10 : 7) * 60);
  const [amrapRunning, setAmrapRunning] = useState<boolean>(false);
  const [showAmrapAlert, setShowAmrapAlert] = useState<boolean>(false);

  // Carga inicial y persistencia por perfil
  useEffect(() => {
    let isCancelled = false;

    const loadData = async () => {
      let currentFocus: RoutineFocus = 'standard';
      let currentDays: 3 | 4 | 5 = 4;
      try {
        const savedFocus = localStorage.getItem(`fit_gen_${nickname}_weekly_focus_v1`);
        if (savedFocus === 'glutes' || savedFocus === 'standard') {
          currentFocus = savedFocus as RoutineFocus;
          setRoutineFocus(currentFocus);
        }
        const savedDays = localStorage.getItem(`fit_gen_${nickname}_weekly_days_count`);
        if (savedDays === '5' || savedDays === '4' || savedDays === '3') {
          currentDays = parseInt(savedDays, 10) as 3 | 4 | 5;
          setRoutineDays(currentDays);
        }
      } catch (e) {}

      if (user) {
        try {
          const profile = await fetchUserProfileCloud(user.id);
          if (!isCancelled && profile) {
            if ((profile as any).weekly_focus === 'glutes' || (profile as any).weekly_focus === 'standard') {
              currentFocus = (profile as any).weekly_focus;
              setRoutineFocus(currentFocus);
            }
            if ((profile as any).weekly_days === 5 || (profile as any).weekly_days === 4 || (profile as any).weekly_days === 3) {
              currentDays = (profile as any).weekly_days;
              setRoutineDays(currentDays);
            }
            if (profile.weekly_routine) {
              setWeeklyRoutine(profile.weekly_routine);
              if (profile.weekly_routine[5]) {
                setRoutineDays(5);
              } else if (!profile.weekly_routine[4] && profile.weekly_routine[3]) {
                setRoutineDays(3);
              }
            } else {
              const fresh = generateWeeklyRoutine(selectedLevel, currentFocus, currentDays);
              setWeeklyRoutine(fresh);
              updateUserProfileCloud(user.id, { weekly_routine: fresh, weekly_focus: currentFocus, weekly_days: currentDays } as any);
            }
            if (profile.weekly_start_date) {
              setWeeklyRoutineStartDate(Number(profile.weekly_start_date));
            }
            if (profile.weekly_target_weeks) {
              setMesocycleTargetWeeks(Number(profile.weekly_target_weeks));
            }
          } else if (!isCancelled && !weeklyRoutine) {
            setWeeklyRoutine(generateWeeklyRoutine(selectedLevel, currentFocus, currentDays));
          }

          const { currentLogs, history } = await fetchExerciseLogs(user.id, 'weekly');
          if (!isCancelled) {
            if (Object.keys(currentLogs).length > 0) setWeeklyLogs(currentLogs);
            if (Object.keys(history).length > 0) setWeeklyHistory(history);
          }
        } catch (e) {
          console.error(e);
        }
        return;
      }

      if (!nickname) return;

      try {
        const savedRoutine = localStorage.getItem(`fit_gen_${nickname}_weekly_routine_${selectedLevel}_v1`)
          || (selectedLevel === 'B' ? localStorage.getItem(`fit_gen_${nickname}_weekly_routine_v1`) : null);
        if (savedRoutine) {
          const parsed = JSON.parse(savedRoutine);
          setWeeklyRoutine(parsed);
          if (parsed && parsed[5]) {
            setRoutineDays(5);
          }
        } else {
          const fresh = generateWeeklyRoutine(selectedLevel, currentFocus, currentDays);
          setWeeklyRoutine(fresh);
        }
      } catch (e) {
        setWeeklyRoutine(generateWeeklyRoutine(selectedLevel, currentFocus, currentDays));
      }

      try {
        const savedLogs = localStorage.getItem(`fit_gen_${nickname}_weekly_logs_v1`);
        setWeeklyLogs(savedLogs ? JSON.parse(savedLogs) : {});
      } catch (e) {
        setWeeklyLogs({});
      }

      try {
        const savedHistory = localStorage.getItem(`fit_gen_${nickname}_weekly_history_v1`);
        setWeeklyHistory(savedHistory ? JSON.parse(savedHistory) : {});
      } catch (e) {
        setWeeklyHistory({});
      }

      try {
        const savedStartDate = localStorage.getItem(`fit_gen_${nickname}_weekly_start_date`);
        if (savedStartDate) {
          setWeeklyRoutineStartDate(parseInt(savedStartDate, 10));
        } else {
          const now = Date.now();
          setWeeklyRoutineStartDate(now);
          localStorage.setItem(`fit_gen_${nickname}_weekly_start_date`, String(now));
        }
      } catch (e) {
        setWeeklyRoutineStartDate(Date.now());
      }

      try {
        const savedTarget = localStorage.getItem(`fit_gen_${nickname}_weekly_mesocycle_target_weeks`);
        if (savedTarget) {
          setMesocycleTargetWeeks(parseInt(savedTarget, 10) || 8);
        }
      } catch (e) {
        setMesocycleTargetWeeks(8);
      }

      try {
        const savedWeek = localStorage.getItem(`fit_gen_${nickname}_weekly_mesocycle_current_week`);
        if (savedWeek) {
          setMesocycleWeek(Math.max(1, parseInt(savedWeek, 10) || 1));
        } else {
          setMesocycleWeek(1);
        }
      } catch (e) {
        setMesocycleWeek(1);
      }
    };

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [nickname, selectedLevel, user]);

  // Persistir semana activa del mesociclo
  useEffect(() => {
    if (!nickname) return;
    try {
      localStorage.setItem(`fit_gen_${nickname}_weekly_mesocycle_current_week`, String(mesocycleWeek));
    } catch (e) {
      console.error(e);
    }
  }, [mesocycleWeek, nickname]);

  // Persistir rutina localmente solo si no hay sesión activa
  useEffect(() => {
    if (user || !nickname || !weeklyRoutine) return;
    try {
      localStorage.setItem(`fit_gen_${nickname}_weekly_routine_${selectedLevel}_v1`, JSON.stringify(weeklyRoutine));
    } catch (e) {
      console.error(e);
    }
  }, [weeklyRoutine, nickname, user, selectedLevel]);

  // Persistir logs localmente solo si no hay sesión activa
  useEffect(() => {
    if (user || !nickname) return;
    try {
      localStorage.setItem(`fit_gen_${nickname}_weekly_logs_v1`, JSON.stringify(weeklyLogs));
    } catch (e) {
      console.error(e);
    }
  }, [weeklyLogs, nickname, user]);

  // Persistir historial localmente solo si no hay sesión activa
  useEffect(() => {
    if (user || !nickname) return;
    try {
      localStorage.setItem(`fit_gen_${nickname}_weekly_history_v1`, JSON.stringify(weeklyHistory));
    } catch (e) {
      console.error(e);
    }
  }, [weeklyHistory, nickname, user]);

  // Persistir objetivo de semanas de mesociclo
  const handleSetTargetWeeks = (weeks: number) => {
    setMesocycleTargetWeeks(weeks);
    if (user) {
      updateUserProfileCloud(user.id, { weekly_target_weeks: weeks });
    }
    try {
      localStorage.setItem(`fit_gen_${nickname}_weekly_mesocycle_target_weeks`, String(weeks));
    } catch (e) {
      console.error(e);
    }
    if (onNotification) {
      onNotification(`Bloque fijado en ${weeks} semanas (~${Math.round(weeks / 4)} meses).`);
    }
  };

  const availableDays = weeklyRoutine ? Object.keys(weeklyRoutine).map(Number).sort((a, b) => a - b) : (routineDays === 5 ? [1, 2, 3, 4, 5] : routineDays === 3 ? [1, 2, 3] : [1, 2, 3, 4]);

  // Cálculo de sesiones reales completadas y progreso fisiológico del mesociclo
  const completedDaysInCurrentWeek = availableDays.filter((dId) => {
    if (!weeklyRoutine || !weeklyRoutine[dId]) return false;
    const exs = weeklyRoutine[dId].exercises;
    return exs.length > 0 && exs.every((ex) => weeklyLogs[`${selectedLevel}_day${dId}_${ex.name}`]?.completed);
  }).length;

  const daysPerWeek = routineDays;
  const totalSessionsInMesocycle = mesocycleTargetWeeks * daysPerWeek;
  const completedSessionsTotal = Math.min(
    totalSessionsInMesocycle,
    Math.max(0, (mesocycleWeek - 1) * daysPerWeek + completedDaysInCurrentWeek)
  );
  const progressPercent = Math.min(100, Math.round((completedSessionsTotal / totalSessionsInMesocycle) * 100));
  const isWeekFullyCompleted = completedDaysInCurrentWeek >= daysPerWeek;

  // Manejo de descanso
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

  const startTimer = (seconds: number, exName: string | null = null) => {
    setTimerDuration(seconds);
    setTimeLeft(seconds);
    setTimerRunning(true);
    setActiveExercise(exName);
    setShowFinishedAlert(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // AMRAP Timer
  useEffect(() => {
    const defaultMins = selectedLevel === 'A' ? 5 : selectedLevel === 'C' ? 10 : 7;
    setAmrapCustomDuration(defaultMins);
    setAmrapTimeLeft(defaultMins * 60);
    setAmrapRunning(false);
    setShowAmrapAlert(false);
  }, [activeWeeklyDay, amrapType, selectedLevel]);

  useEffect(() => {
    let amrapTimerId: any = null;
    if (amrapRunning && amrapTimeLeft > 0) {
      amrapTimerId = setInterval(() => {
        setAmrapTimeLeft((prev) => {
          if (prev <= 1) {
            setAmrapRunning(false);
            playBeepSound(isMuted);
            setShowAmrapAlert(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (amrapTimerId) clearInterval(amrapTimerId);
    };
  }, [amrapRunning, amrapTimeLeft, isMuted]);

  // Actualizar log
  const handleUpdateWeeklyLog = (dayId: number, exerciseName: string, field: 'weight' | 'reps', value: string) => {
    const key = `${selectedLevel}_day${dayId}_${exerciseName}`;
    setWeeklyLogs((prev) => ({
      ...prev,
      [key]: {
        ...prev[key] || { weight: '', reps: '', completed: false },
        [field]: value
      }
    }));
  };

  // Toggle ejercicio completado
  const handleToggleWeeklyCompleted = (dayId: number, exerciseName: string) => {
    const key = `${selectedLevel}_day${dayId}_${exerciseName}`;
    setWeeklyLogs((prev) => {
      const current = prev[key] || { weight: '', reps: '', completed: false };
      const nowCompleting = !current.completed;
      if (nowCompleting && current.weight && current.reps) {
        setWeeklyHistory((prevHist) => ({
          ...prevHist,
          [key]: pushHistoryEntry(prevHist[key], { weight: current.weight, reps: current.reps, date: Date.now() })
        }));
      }
      if (user) {
        saveExerciseLogCloud(user.id, 'weekly', key, current.weight, current.reps, nowCompleting);
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

  // Toggle completar todo el día
  const handleToggleWeeklyCompleteAll = (dayId: number) => {
    if (!weeklyRoutine) return;
    const day = weeklyRoutine[dayId];
    if (!day) return;

    const allCompleted = day.exercises.every((ex) => {
      const key = `${selectedLevel}_day${dayId}_${ex.name}`;
      return weeklyLogs[key]?.completed;
    });
    const nowCompleting = !allCompleted;

    if (nowCompleting) {
      setWeeklyHistory((prevHist) => {
        const updated = { ...prevHist };
        day.exercises.forEach((ex) => {
          const key = `${selectedLevel}_day${dayId}_${ex.name}`;
          const log = weeklyLogs[key];
          if (log?.weight && log?.reps) {
            updated[key] = pushHistoryEntry(updated[key], { weight: log.weight, reps: log.reps, date: Date.now() });
          }
        });
        return updated;
      });
    }

    if (user) {
      day.exercises.forEach((ex) => {
        const key = `${selectedLevel}_day${dayId}_${ex.name}`;
        const log = weeklyLogs[key];
        saveExerciseLogCloud(user.id, 'weekly', key, log?.weight || '', log?.reps || '', nowCompleting);
      });
    }

    setWeeklyLogs((prev) => {
      const updated = { ...prev };
      day.exercises.forEach((ex) => {
        const key = `${selectedLevel}_day${dayId}_${ex.name}`;
        updated[key] = {
          weight: prev[key]?.weight || '',
          reps: prev[key]?.reps || '',
          completed: nowCompleting
        };
      });
      return updated;
    });
  };

  // Iniciar nueva semana avanzando microciclo y manteniendo pesos de referencia
  const handleResetWeeklyProgress = () => {
    const nextWeek = Math.min(mesocycleTargetWeeks + 1, mesocycleWeek + 1);
    if (
      window.confirm(
        `Vas a avanzar a la Semana ${nextWeek} de tu mesociclo: se desmarcarán los ejercicios para iniciar el nuevo microciclo, pero tus pesos y repeticiones se mantendrán intactos para aplicar sobrecarga progresiva. ¿Continuar?`
      )
    ) {
      setMesocycleWeek(nextWeek);
      setWeeklyLogs((prev) => {
        const updated: Record<string, { weight: string; reps: string; completed: boolean }> = { ...prev };
        Object.keys(updated).forEach((key) => {
          updated[key] = { ...updated[key], completed: false };
        });
        return updated;
      });
      try {
        localStorage.setItem(`fit_gen_${nickname}_weekly_mesocycle_current_week`, String(nextWeek));
      } catch (e) {}
      if (onNotification) {
        onNotification(`¡Semana ${nextWeek} iniciada! Tus pesos anteriores se conservan como referencia.`);
      }
    }
  };

  // Cambiar distribución de días (3 Días vs 4 Días vs 5 Días)
  const handleSwitchDaysCount = (newDays: 3 | 4 | 5) => {
    if (newDays === routineDays) return;
    const label = newDays === 3
      ? '3 Días (Full Body / 4 de descanso)'
      : newDays === 5
      ? '5 Días (Alta Frecuencia / 2 de descanso)'
      : '4 Días (Torso/Pierna / 3 de descanso)';
    if (
      window.confirm(
        `¿Deseas cambiar tu distribución semanal a "${label}"?\n\nSe adaptará tu mesociclo a ${newDays} días de entrenamiento y tu progreso iniciará en la Semana 1.`
      )
    ) {
      setRoutineDays(newDays);
      try {
        localStorage.setItem(`fit_gen_${nickname}_weekly_days_count`, String(newDays));
      } catch (e) {}

      const fresh = generateWeeklyRoutine(selectedLevel, routineFocus, newDays);
      setWeeklyRoutine(fresh);
      setActiveWeeklyDay(1);
      setMesocycleWeek(1);
      const now = Date.now();
      setWeeklyRoutineStartDate(now);
      setWeeklyLogs((prev) => {
        const reset: Record<string, { weight: string; reps: string; completed: boolean }> = {};
        Object.keys(prev).forEach((k) => {
          reset[k] = { ...prev[k], completed: false };
        });
        return reset;
      });

      if (user) {
        updateUserProfileCloud(user.id, { 
          weekly_routine: fresh, 
          weekly_start_date: now,
          weekly_focus: routineFocus,
          weekly_days: newDays
        } as any);
      }

      try {
        localStorage.setItem(`fit_gen_${nickname}_weekly_start_date`, String(now));
        localStorage.setItem(`fit_gen_${nickname}_weekly_routine_${selectedLevel}_v1`, JSON.stringify(fresh));
        localStorage.setItem(`fit_gen_${nickname}_weekly_mesocycle_current_week`, '1');
      } catch (e) {}

      if (onNotification) {
        onNotification(`¡Distribución cambiada a ${label}!`);
      }
    }
  };

  // Cambiar enfoque de mesociclo (Estándar vs Énfasis Glúteos)
  const handleSwitchFocus = (newFocus: RoutineFocus) => {
    if (newFocus === routineFocus) return;
    const label = newFocus === 'glutes' ? 'Énfasis Glúteos (Rutina Femenina)' : 'Estándar (Torso/Pierna)';
    if (
      window.confirm(
        `¿Deseas cambiar el enfoque a "${label}"?\n\nSe generará un nuevo mesociclo estructurado con ejercicios específicos y tu progreso iniciará en la Semana 1.`
      )
    ) {
      setRoutineFocus(newFocus);
      try {
        localStorage.setItem(`fit_gen_${nickname}_weekly_focus_v1`, newFocus);
      } catch (e) {}

      const fresh = generateWeeklyRoutine(selectedLevel, newFocus, routineDays);
      setWeeklyRoutine(fresh);
      setMesocycleWeek(1);
      const now = Date.now();
      setWeeklyRoutineStartDate(now);
      setWeeklyLogs((prev) => {
        const reset: Record<string, { weight: string; reps: string; completed: boolean }> = {};
        Object.keys(prev).forEach((k) => {
          reset[k] = { ...prev[k], completed: false };
        });
        return reset;
      });

      if (user) {
        updateUserProfileCloud(user.id, { 
          weekly_routine: fresh, 
          weekly_start_date: now,
          weekly_focus: newFocus,
          weekly_days: routineDays
        } as any);
      }

      try {
        localStorage.setItem(`fit_gen_${nickname}_weekly_start_date`, String(now));
        localStorage.setItem(`fit_gen_${nickname}_weekly_routine_${selectedLevel}_v1`, JSON.stringify(fresh));
        localStorage.setItem(`fit_gen_${nickname}_weekly_mesocycle_current_week`, '1');
      } catch (e) {}

      if (onNotification) {
        onNotification(`¡Enfoque cambiado a ${label}!`);
      }
    }
  };

  // Regenerar mesociclo completo con confirmación
  const handleRegenerateRoutine = () => {
    if (
      window.confirm(
        `¿Deseas generar una nueva rutina de ${routineDays} días? Tus ejercicios actuales serán cambiados para iniciar un nuevo mesociclo y el progreso se reiniciará a la Semana 1 (0%).`
      )
    ) {
      const fresh = generateWeeklyRoutine(selectedLevel, routineFocus, routineDays);
      setWeeklyRoutine(fresh);
      setMesocycleWeek(1);
      const now = Date.now();
      setWeeklyRoutineStartDate(now);
      setWeeklyLogs((prev) => {
        const reset: Record<string, { weight: string; reps: string; completed: boolean }> = {};
        Object.keys(prev).forEach((k) => {
          reset[k] = { ...prev[k], completed: false };
        });
        return reset;
      });
      if (user) {
        updateUserProfileCloud(user.id, { weekly_routine: fresh, weekly_start_date: now, weekly_focus: routineFocus, weekly_days: routineDays } as any);
      }
      try {
        localStorage.setItem(`fit_gen_${nickname}_weekly_start_date`, String(now));
        localStorage.setItem(`fit_gen_${nickname}_weekly_routine_${selectedLevel}_v1`, JSON.stringify(fresh));
        localStorage.setItem(`fit_gen_${nickname}_weekly_mesocycle_current_week`, '1');
      } catch (e) {}
      if (onNotification) {
        onNotification(`¡Nuevo mesociclo de ${routineDays} días generado con éxito!`);
      }
    }
  };

  // Sustituir un solo ejercicio por una alternativa
  const handleSwapExercise = (newEx: WeeklyExercise) => {
    if (!swapModalState || !weeklyRoutine) return;
    const { dayId, exIndex } = swapModalState;
    const day = weeklyRoutine[dayId];
    if (!day) return;

    const updatedExercises = [...day.exercises];
    updatedExercises[exIndex] = newEx;

    const updatedRoutine: WeeklyRoutine = {
      ...weeklyRoutine,
      [dayId]: {
        ...day,
        exercises: updatedExercises
      }
    };

    setWeeklyRoutine(updatedRoutine);
    if (user) {
      updateUserProfileCloud(user.id, { weekly_routine: updatedRoutine });
    }
    setSwapModalState(null);
    if (onNotification) {
      onNotification(`Ejercicio cambiado por: ${newEx.name}.`);
    }
  };

  if (!weeklyRoutine || !weeklyRoutine[activeWeeklyDay]) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 p-8">
        <Dumbbell className="w-12 h-12 mb-4 opacity-30 animate-pulse" />
        <p className="font-semibold text-sm">Cargando Plan Semanal de 4 Días...</p>
      </div>
    );
  }

  const currentDay = weeklyRoutine[activeWeeklyDay];
  const dayExercises = currentDay.exercises;
  const dayCompletedCount = dayExercises.filter((ex) => {
    const key = `${selectedLevel}_day${activeWeeklyDay}_${ex.name}`;
    return weeklyLogs[key]?.completed;
  }).length;
  const dayTotalCount = dayExercises.length;

  return (
    <div className="flex flex-col flex-1 h-full">
      {/* HEADER DE MESOCICLO Y DURACIÓN */}
      <div className="bg-zinc-900 text-white rounded-2xl p-4 md:p-5 mb-5 border border-zinc-800 shadow-xl">
        {/* FILA SUPERIOR: BADGES, TÍTULO Y SEMANA ACTIVA */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3.5 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                Mesociclo de Musculación
              </span>
              {user ? (
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                  <Cloud className="w-3 h-3" /> Nube Sincronizada
                </span>
              ) : (
                <span className="bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                  <CloudOff className="w-3 h-3" /> Modo Local
                </span>
              )}
            </div>
            <h2 className="text-lg md:text-xl font-black tracking-tight text-zinc-100 flex items-center gap-2 flex-wrap">
              <span>{routineFocus === 'glutes' ? 'Rutina Énfasis Glúteos & Inferior' : 'Rutina Fija Torso / Pierna'}</span>
              <span className="text-xs md:text-sm font-bold text-zinc-400 bg-zinc-800/60 px-2 py-0.5 rounded-lg border border-zinc-700/60">
                {mesocycleTargetWeeks} Semanas
              </span>
            </h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              {routineFocus === 'glutes'
                ? 'Estructura biomecánica con sobrecarga en elongación y acortamiento de glúteos, más tono estético en torso.'
                : 'Ejecuta esta misma rutina durante tu ciclo para construir sobrecarga progresiva real. Tus pesos se conservan semana a semana.'}
            </p>
          </div>

          {/* SELECTOR DE SEMANA DEL MESOCICLO */}
          <div className="flex items-center gap-2 bg-zinc-950 p-2 rounded-2xl border border-zinc-800 shrink-0 self-start lg:self-auto shadow-inner">
            <Calendar className="w-4 h-4 text-purple-400 ml-1" />
            <span className="text-xs font-bold text-zinc-200">
              Semana <strong className="text-purple-300 font-mono text-sm">{mesocycleWeek}</strong> de {mesocycleTargetWeeks}
            </span>
            <div className="flex items-center border-l border-zinc-800 pl-1.5 gap-1">
              <button
                onClick={() => setMesocycleWeek((w) => Math.max(1, w - 1))}
                disabled={mesocycleWeek <= 1}
                className="text-zinc-400 hover:text-white disabled:opacity-30 p-1 hover:bg-zinc-800 rounded-lg transition-colors text-xs"
                title="Retroceder a semana anterior"
              >
                ◀
              </button>
              <button
                onClick={() => setMesocycleWeek((w) => Math.min(mesocycleTargetWeeks, w + 1))}
                disabled={mesocycleWeek >= mesocycleTargetWeeks}
                className="text-zinc-400 hover:text-white disabled:opacity-30 p-1 hover:bg-zinc-800 rounded-lg transition-colors text-xs"
                title="Avanzar a semana siguiente"
              >
                ▶
              </button>
            </div>
          </div>
        </div>

        {/* FILA INFERIOR ESPACIOSA: SELECTORES ORGANIZADOS EN 3 COLUMNAS LIMPIAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3.5 items-end">
          {/* 1. DÍAS POR SEMANA */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                Frecuencia Semanal:
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">
                {routineDays === 3 ? '4 descanso' : routineDays === 4 ? '3 descanso' : '2 descanso'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 shadow-inner">
              <button
                onClick={() => handleSwitchDaysCount(3)}
                className={`py-2 px-1 rounded-lg text-xs font-bold transition-all text-center ${
                  routineDays === 3
                    ? 'bg-emerald-600 text-white font-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="3 días de entrenamiento Full Body (4 días de descanso o carrera)"
              >
                🌱 3 Días
              </button>
              <button
                onClick={() => handleSwitchDaysCount(4)}
                className={`py-2 px-1 rounded-lg text-xs font-bold transition-all text-center ${
                  routineDays === 4
                    ? 'bg-emerald-600 text-white font-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="4 días de entrenamiento Torso/Pierna (3 días de descanso)"
              >
                📅 4 Días
              </button>
              <button
                onClick={() => handleSwitchDaysCount(5)}
                className={`py-2 px-1 rounded-lg text-xs font-bold transition-all text-center ${
                  routineDays === 5
                    ? 'bg-emerald-600 text-white font-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="5 días de entrenamiento (2 días de descanso)"
              >
                ⚡ 5 Días
              </button>
            </div>
          </div>

          {/* 2. ENFOQUE MUSCULAR */}
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
              Enfoque de Rutina:
            </span>
            <div className="grid grid-cols-2 gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 shadow-inner">
              <button
                onClick={() => handleSwitchFocus('standard')}
                className={`py-2 px-2 rounded-lg text-xs font-bold transition-all text-center ${
                  routineFocus === 'standard'
                    ? 'bg-purple-600 text-white font-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                🏋️‍♂️ Estándar
              </button>
              <button
                onClick={() => handleSwitchFocus('glutes')}
                className={`py-2 px-2 rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center gap-1 ${
                  routineFocus === 'glutes'
                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white font-black shadow-md ring-1 ring-pink-400/40'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                🍑 Glúteos
              </button>
            </div>
          </div>

          {/* 3. DURACIÓN DEL MESOCICLO */}
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
              Duración del Bloque:
            </span>
            <div className="grid grid-cols-4 gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 shadow-inner">
              {[4, 6, 8, 12].map((w) => (
                <button
                  key={w}
                  onClick={() => handleSetTargetWeeks(w)}
                  className={`py-2 rounded-lg text-xs font-bold transition-all text-center ${
                    mesocycleTargetWeeks === w
                      ? 'bg-purple-600 text-white font-black shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {w} sem
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Barra de progreso real del mesociclo por sesiones completadas */}
        <div className="mt-4 pt-3 border-t border-zinc-800">
          <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 mb-1.5 flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span>Sesiones del bloque: <strong className="text-emerald-400 font-mono text-xs">{completedSessionsTotal}</strong> / <strong className="text-zinc-300 font-mono text-xs">{totalSessionsInMesocycle}</strong></span>
              <span className="text-zinc-600">•</span>
              <span>Esta semana: <strong className="text-purple-300 font-mono">{completedDaysInCurrentWeek}/{daysPerWeek}</strong> días hechos</span>
            </div>
            <span className="font-mono text-emerald-400 text-xs font-black">{progressPercent}%</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                completedSessionsTotal >= totalSessionsInMesocycle
                  ? 'bg-amber-500'
                  : 'bg-gradient-to-r from-purple-500 via-teal-400 to-emerald-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Felicitación y botón para avanzar microciclo al completar todos los días de la semana */}
          {isWeekFullyCompleted && mesocycleWeek < mesocycleTargetWeeks && (
            <div className="mt-3 bg-emerald-950/70 border border-emerald-500/40 p-3 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-emerald-200 text-xs animate-fadeIn shadow-lg">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-black text-emerald-300 uppercase text-[10px] tracking-wider">¡Semana completada al 100%!</p>
                  <p className="text-xs text-emerald-100/90 font-medium">Has completado los {daysPerWeek} entrenamientos de la <strong>Semana {mesocycleWeek}</strong>. Tus estímulos musculares están consolidados.</p>
                </div>
              </div>
              <button
                onClick={handleResetWeeklyProgress}
                className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black px-4 py-2 rounded-xl text-xs shrink-0 transition-all shadow-md self-end sm:self-auto"
              >
                Avanzar a Semana {mesocycleWeek + 1} ➔
              </button>
            </div>
          )}

          {completedSessionsTotal >= totalSessionsInMesocycle && (
            <p className="text-[11px] text-amber-300 mt-2.5 font-medium flex items-center gap-1.5 bg-amber-950/40 p-2.5 rounded-xl border border-amber-500/30">
              <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                ¡Has completado las {totalSessionsInMesocycle} sesiones de tu ciclo de {mesocycleTargetWeeks} semanas! Es momento de tomar una semana de descarga (deload con 50% menos volumen) o renovar tu mesociclo.
              </span>
            </p>
          )}
        </div>
      </div>

      {/* NAVEGACIÓN DE DÍAS Y RESUMEN */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 gap-3 border-b border-zinc-100 pb-4">
        <div>
          <span className="bg-emerald-100 text-emerald-800 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-block mb-1 shadow-sm border border-emerald-200">
            Estructura de {routineDays} Días
          </span>
          <h3 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900">
            {currentDay.name}
          </h3>
          <p className="text-zinc-500 text-xs mt-0.5 italic">
            {currentDay.subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <div className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-emerald-100">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Progreso: {dayCompletedCount} / {dayTotalCount} Ejercicios</span>
            </div>
            {dayCompletedCount === dayTotalCount && (
              <span className="text-[9px] bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 px-2 py-1 rounded-lg font-black tracking-wider uppercase">
                ¡DÍA COMPLETADO! 🎉
              </span>
            )}
          </div>
        </div>

        {/* Pestañas dinámicas D1 a D4/D5 con indicador de día completado */}
        <div className="bg-zinc-100 p-1 rounded-xl flex shrink-0 w-full md:w-auto overflow-x-auto">
          {availableDays.map((dId) => {
            const isDayFinished = weeklyRoutine && weeklyRoutine[dId] && weeklyRoutine[dId].exercises.length > 0 && weeklyRoutine[dId].exercises.every((ex) => weeklyLogs[`${selectedLevel}_day${dId}_${ex.name}`]?.completed);
            return (
              <button
                key={dId}
                onClick={() => setActiveWeeklyDay(dId)}
                className={`flex-1 md:flex-none px-3.5 py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  activeWeeklyDay === dId
                    ? 'bg-white shadow text-emerald-600'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                <span>Día {dId}</span>
                {isDayFinished && <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* CRONÓMETRO DE DESCANSO WIDGET */}
      {timeLeft > 0 ? (
        <div className="mb-5 bg-zinc-950 text-white rounded-2xl p-4 border border-zinc-800 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Timer className={`w-4 h-4 ${timerRunning ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <h4 className="font-bold text-[10px] tracking-wider text-emerald-400 uppercase">Recuperación Activa</h4>
                <h3 className="font-bold text-xs text-zinc-300 truncate max-w-[150px] sm:max-w-xs">
                  {activeExercise ? `Siguiente: ${activeExercise}` : 'Recuperación muscular'}
                </h3>
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-3">
              <div className="text-3xl font-extrabold font-mono tracking-tight text-emerald-400 tabular-nums">
                {formatTime(timeLeft)}
              </div>
              <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                <button
                  onClick={() => setTimerRunning(!timerRunning)}
                  className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-emerald-400"
                >
                  {timerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => { setTimeLeft((t) => t + 30); setTimerDuration((d) => d + 30); }}
                  className="px-2 py-1 hover:bg-zinc-800 rounded-lg text-zinc-400 text-[10px] font-bold"
                >
                  +30s
                </button>
                <button
                  onClick={() => { setTimeLeft(0); setTimerRunning(false); }}
                  className="p-1.5 hover:bg-red-950 rounded-lg text-zinc-500 hover:text-red-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
          <div className="mt-2.5 w-full bg-zinc-900 rounded-full h-1 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-1000 ease-linear"
              style={{ width: `${(timeLeft / timerDuration) * 100}%` }}
            />
          </div>
        </div>
      ) : showFinishedAlert ? (
        <div className="mb-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 rounded-2xl p-4 shadow-lg flex items-center justify-between border border-emerald-400">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-zinc-950" />
            <div>
              <h4 className="font-extrabold text-sm">¡Cronómetro de Descanso Terminado!</h4>
              <p className="text-xs opacity-90 font-medium">Musculatura recuperada. ¡A por la siguiente serie!</p>
            </div>
          </div>
          <button
            onClick={() => setShowFinishedAlert(false)}
            className="bg-zinc-950 text-white hover:bg-zinc-900 px-3 py-1 rounded-xl text-xs font-bold"
          >
            Entendido
          </button>
        </div>
      ) : (
        <div className="mb-4 bg-zinc-50 border border-zinc-200/80 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-inner">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-zinc-600">Descanso rápido entre series:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {[30, 45, 60, 90, 120].map((s) => (
              <button
                key={s}
                onClick={() => startTimer(s, null)}
                className="bg-white hover:bg-emerald-50 text-zinc-800 hover:text-emerald-700 font-extrabold px-2.5 py-1 rounded-lg text-xs border border-zinc-200"
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
          <span className="font-bold">Calentamiento RAMP:</span> 5-10 min de cardio ligero + 1-2 series de aproximación en tu primer ejercicio para preparar articulaciones y sistema nervioso.
        </p>
      </div>

      {/* LISTA DE EJERCICIOS */}
      <div className="space-y-3 flex-1 overflow-y-auto">
        {dayExercises.map((exercise, index) => {
          const key = `${selectedLevel}_day${activeWeeklyDay}_${exercise.name}`;
          const log = weeklyLogs[key] || { weight: '', reps: '', completed: false };
          const suggestion = getProgressionSuggestion(weeklyHistory[key], exercise.defaultReps);

          return (
            <div
              key={exercise.name}
              className={`flex flex-col lg:flex-row lg:items-center justify-between p-4 rounded-2xl border transition-all duration-200 gap-3.5 ${
                log.completed
                  ? 'bg-emerald-50/40 border-emerald-300'
                  : 'bg-zinc-50 border-zinc-200 hover:bg-white hover:border-zinc-300'
              }`}
            >
              {/* Izquierda: Checkbox y Detalles */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <button
                  onClick={() => handleToggleWeeklyCompleted(activeWeeklyDay, exercise.name)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                    log.completed
                      ? 'bg-emerald-500 border-emerald-500 text-zinc-950 shadow-sm'
                      : 'bg-white border-zinc-300 text-zinc-300 hover:border-zinc-400'
                  }`}
                  title={log.completed ? 'Desmarcar' : 'Completar serie'}
                >
                  <CheckCircle className={`w-5 h-5 ${log.completed ? 'text-zinc-950' : 'text-zinc-300'}`} />
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 bg-zinc-200/60 px-1.5 py-0.5 rounded">
                      {exercise.category}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-500 bg-zinc-200/60 px-1.5 py-0.5 rounded">
                      {exercise.defaultSets}× {exercise.defaultReps}
                    </span>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                      RIR {getTargetRIR(exercise.category)}
                    </span>

                    {/* Botón para cambiar ejercicio individual */}
                    <button
                      onClick={() => setSwapModalState({ dayId: activeWeeklyDay, exIndex: index, currentName: exercise.name })}
                      className="text-[10px] font-bold text-zinc-600 hover:text-emerald-700 bg-white hover:bg-emerald-50 border border-zinc-200 px-2 py-0.5 rounded flex items-center gap-1 transition-all"
                      title="Sustituir este ejercicio por otra máquina o variante sin reiniciar tu rutina de 2 meses"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      <span>Cambiar ejercicio</span>
                    </button>
                  </div>

                  <div
                    onClick={() => setInspectedExercise(findExerciseDetail(exercise.name))}
                    className="flex items-center gap-1.5 cursor-pointer group/name w-fit"
                    title="Toca para ver técnica correcta, errores comunes y respiración"
                  >
                    <p className="font-extrabold text-sm text-zinc-900 leading-tight group-hover/name:text-emerald-600 transition-colors">
                      {exercise.name}
                    </p>
                    <Info className="w-3.5 h-3.5 text-zinc-400 group-hover/name:text-emerald-600 transition-colors shrink-0" />
                  </div>
                  {exercise.description && (
                    <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1 md:line-clamp-none">
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

              {/* Centro: Inputs de Peso y Reps */}
              <div className="flex items-center gap-2.5 shrink-0 bg-white p-1.5 rounded-xl border border-zinc-200 shadow-sm w-full lg:w-auto justify-between lg:justify-start">
                <div className="flex items-center gap-1.5 px-2 py-1 flex-1 lg:flex-initial">
                  <span className="text-[10px] uppercase font-black text-zinc-400 select-none">PESO</span>
                  <input
                    type="text"
                    placeholder="--"
                    value={log.weight}
                    onChange={(e) => handleUpdateWeeklyLog(activeWeeklyDay, exercise.name, 'weight', e.target.value)}
                    className="w-12 bg-transparent text-zinc-900 focus:outline-none text-center text-xs font-bold font-mono"
                    title="Peso en kg"
                  />
                  <span className="text-[10px] text-zinc-500 font-bold select-none">kg</span>
                </div>

                <div className="w-[1px] h-4 bg-zinc-200" />

                <div className="flex items-center gap-1.5 px-2 py-1 flex-1 lg:flex-initial">
                  <span className="text-[10px] uppercase font-black text-zinc-400 select-none">REPS</span>
                  <input
                    type="text"
                    placeholder="--"
                    value={log.reps}
                    onChange={(e) => handleUpdateWeeklyLog(activeWeeklyDay, exercise.name, 'reps', e.target.value)}
                    className="w-10 bg-transparent text-zinc-900 focus:outline-none text-center text-xs font-bold font-mono"
                    title="Reps logradas"
                  />
                </div>
              </div>

              {/* Derecha: Botón de descanso */}
              <div className="flex items-center justify-end shrink-0 gap-2 w-full lg:w-auto">
                <button
                  onClick={() => startTimer(getRecommendedRest(exercise.category), exercise.name)}
                  className="w-full lg:w-auto bg-white hover:bg-emerald-500 text-zinc-700 hover:text-zinc-950 font-extrabold px-3.5 py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 border border-zinc-200 shadow-sm"
                >
                  <Timer className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Descansar {getRecommendedRest(exercise.category)}s</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* AMRAP COMPLEMENTARIO / ACTIVADOR */}
      <div className="mt-6 bg-zinc-950 text-white rounded-3xl p-5 border border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-purple-500 text-white text-[9px] font-black tracking-widest px-2.5 py-0.5 rounded-full uppercase">
                Finisher Opcional
              </span>
              <h4 className="text-base font-black text-zinc-100">
                {amrapType === 'complementary'
                  ? currentDay.amrapComplementary.name
                  : currentDay.amrapActivator.name}
              </h4>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              {amrapType === 'complementary'
                ? currentDay.amrapComplementary.instructions
                : currentDay.amrapActivator.instructions}
            </p>

            {/* Selector de Duración 5, 7, 10 min con predeterminado según nivel */}
            <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
              <span className="text-[11px] font-bold text-zinc-400">Duración AMRAP:</span>
              {[5, 7, 10].map((mins) => {
                const isSuggested = (mins === 5 && selectedLevel === 'A') || (mins === 7 && selectedLevel === 'B') || (mins === 10 && selectedLevel === 'C');
                return (
                  <button
                    key={mins}
                    onClick={() => {
                      setAmrapCustomDuration(mins);
                      setAmrapTimeLeft(mins * 60);
                      setAmrapRunning(false);
                      setShowAmrapAlert(false);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                      amrapCustomDuration === mins
                        ? 'bg-purple-600 border-purple-500 text-white shadow'
                        : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {mins} min {isSuggested ? `(Nivel ${selectedLevel})` : ''}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setAmrapType('complementary')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                amrapType === 'complementary' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Complementario
            </button>
            <button
              onClick={() => setAmrapType('activator')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                amrapType === 'activator' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Activador
            </button>
          </div>
        </div>

        {/* Ejercicios del AMRAP y Cronómetro */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 space-y-1.5 w-full">
            {(amrapType === 'complementary'
              ? currentDay.amrapComplementary.exercises
              : currentDay.amrapActivator.exercises
            ).map((ex, i) => (
              <div 
                key={i} 
                onClick={() => setInspectedExercise(findExerciseDetail(ex))}
                className="flex items-center justify-between text-xs text-zinc-300 bg-zinc-900/60 hover:bg-zinc-900 hover:border-purple-500/50 px-3 py-2 rounded-xl border border-zinc-800 cursor-pointer transition-colors group"
                title="Toca para ver técnica de este ejercicio"
              >
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-black flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="group-hover:text-purple-300 transition-colors font-medium">{ex}</span>
                </div>
                <Info className="w-3 h-3 text-zinc-500 group-hover:text-purple-400 shrink-0" />
              </div>
            ))}
          </div>

          {/* Temporizador AMRAP */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center shrink-0 w-full md:w-56">
            <div className="text-3xl font-extrabold font-mono tracking-tight text-purple-400 tabular-nums mb-2">
              {formatTime(amrapTimeLeft)}
            </div>
            <div className="flex items-center gap-2 w-full">
              <button
                onClick={() => setAmrapRunning(!amrapRunning)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  amrapRunning ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-purple-600 text-white hover:bg-purple-500'
                }`}
              >
                {amrapRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{amrapRunning ? 'Pausar' : 'Empezar'}</span>
              </button>
              <button
                onClick={() => {
                  setAmrapRunning(false);
                  setAmrapTimeLeft(amrapCustomDuration * 60);
                  setShowAmrapAlert(false);
                }}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold px-3 py-2 rounded-xl text-xs"
              >
                Reiniciar
              </button>
            </div>
          </div>
        </div>

        {showAmrapAlert && (
          <div className="mt-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl p-3.5 shadow-lg flex items-center justify-between border border-purple-400">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-300 animate-bounce" />
              <div>
                <p className="text-xs font-black uppercase">¡AMRAP Completado!</p>
                <p className="text-[11px] opacity-90">Gran esfuerzo para cerrar la sesión de hoy.</p>
              </div>
            </div>
            <button
              onClick={() => setShowAmrapAlert(false)}
              className="bg-white text-zinc-950 text-xs font-black px-3 py-1 rounded-lg"
            >
              Genial
            </button>
          </div>
        )}
      </div>

      {/* ACCIONES INFERIORES */}
      <div className="mt-6 pt-4 border-t border-zinc-200 flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => handleToggleWeeklyCompleteAll(activeWeeklyDay)}
          className={`flex-1 font-bold py-3.5 px-4 rounded-2xl transition-all uppercase tracking-wider text-xs shadow-md ${
            dayCompletedCount === dayTotalCount
              ? 'bg-zinc-200 hover:bg-zinc-300 text-zinc-900'
              : 'bg-zinc-950 hover:bg-zinc-800 text-white'
          }`}
        >
          {dayCompletedCount === dayTotalCount
            ? 'Reiniciar progreso de hoy'
            : `Marcar Día ${activeWeeklyDay} completo`}
        </button>

        <button
          onClick={handleResetWeeklyProgress}
          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold py-3.5 px-4 rounded-2xl transition-all text-xs"
          title="Desmarca los ejercicios completados pero conserva tus pesos para la siguiente semana"
        >
          Iniciar nueva semana (conserva pesos)
        </button>

        <button
          onClick={handleRegenerateRoutine}
          className="bg-zinc-100 hover:bg-zinc-200 text-zinc-600 font-bold py-3.5 px-4 rounded-2xl transition-all text-xs flex items-center justify-center gap-1.5"
          title="Regenera toda la rutina de 4 días para comenzar un nuevo mesociclo"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Regenerar mesociclo</span>
        </button>
      </div>

      {/* MODAL PARA SUSTITUIR UN EJERCICIO INDIVIDUAL */}
      {swapModalState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-zinc-200 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Sustitución en Gimnasio
                </span>
                <h3 className="text-base font-black text-zinc-900 mt-1">
                  Elegir alternativa para este ejercicio
                </h3>
                <p className="text-xs text-zinc-500">
                  Actual: <span className="font-bold text-zinc-800">{swapModalState.currentName}</span>
                </p>
              </div>
              <button
                onClick={() => setSwapModalState(null)}
                className="p-1.5 hover:bg-zinc-100 rounded-xl text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-600 mb-3 leading-relaxed">
              Elige otra máquina o ejercicio equivalente para el mismo grupo muscular. El resto de tu rutina de 2 meses permanecerá intacta:
            </p>

            <div className="space-y-2 mb-5 max-h-72 overflow-y-auto">
              {getAlternativeWeeklyExercises(swapModalState.dayId, swapModalState.exIndex, selectedLevel, routineFocus, routineDays).map((alt) => {
                const isSelected = alt.name === swapModalState.currentName;
                return (
                  <button
                    key={alt.name}
                    onClick={() => handleSwapExercise(alt)}
                    disabled={isSelected}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-zinc-100 border-zinc-300 opacity-60 cursor-not-allowed'
                        : 'bg-zinc-50 hover:bg-emerald-50/50 hover:border-emerald-300 border-zinc-200'
                    }`}
                  >
                    <div>
                      <p className="font-extrabold text-xs text-zinc-900">{alt.name}</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">{alt.description}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold text-zinc-400">
                        {alt.defaultSets}× {alt.defaultReps}
                      </span>
                    </div>
                    {isSelected ? (
                      <span className="text-[10px] font-bold text-zinc-400">Actual</span>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSwapModalState(null)}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl text-xs"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

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
