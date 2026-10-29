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
  Info,
  Sliders,
  MoreHorizontal,
  Check,
  Search
} from 'lucide-react';
import WorkoutSessionView from './WorkoutSessionView';
import { Level } from '../types';
import CustomExerciseModal from './CustomExerciseModal';
import { getCustomExercises } from '../lib/customExercises';
import { 
  WeeklyRoutine, 
  WeeklyDay,
  WeeklyExercise, 
  AmrapBlock,
  generateWeeklyRoutine, 
  getAlternativeWeeklyExercises,
  getDefaultAbsAmrap,
  RoutineFocus
} from '../lib/weeklyGenerator';
import { 
  getFinisherAlternatives, 
  FinisherExerciseOption, 
  FinisherEquipmentGroup 
} from '../lib/finisherBank';
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

  // Estado para sustituir ejercicio individual de la rutina
  const [swapModalState, setSwapModalState] = useState<{ dayId: number; exIndex: number; currentName: string } | null>(null);
  const [showCustomExModal, setShowCustomExModal] = useState<boolean>(false);

  const formatCleanReps = (reps?: string) => {
    if (!reps) return 'reps';
    const clean = reps.replace(/reps?|repeticiones/gi, '').trim();
    return `${clean} reps`;
  };

  // Estado para sustituir ejercicio individual del Finisher (AMRAP)
  const [swapAmrapModalState, setSwapAmrapModalState] = useState<{
    dayId: number;
    amrapType: 'complementary' | 'activator' | 'abs';
    exIndex: number;
    currentName: string;
  } | null>(null);
  const [finisherEquipmentFilter, setFinisherEquipmentFilter] = useState<FinisherEquipmentGroup>('all');
  const [finisherSearchQuery, setFinisherSearchQuery] = useState<string>('');

  // Estados de Sesión Activa (Imagen 1) y Modal Editar Plan
  const [activeSessionDay, setActiveSessionDay] = useState<number | null>(null);
  const [sessionInitialIndex, setSessionInitialIndex] = useState<number>(0);
  const [showEditPlanModal, setShowEditPlanModal] = useState<boolean>(false);
  const [showPlanMenu, setShowPlanMenu] = useState<boolean>(false);
  const [showCycleCompleteModal, setShowCycleCompleteModal] = useState<boolean>(false);
  const [warmupOpen, setWarmupOpen] = useState<boolean>(false);
  const [amrapOpen, setAmrapOpen] = useState<boolean>(false);

  // Estados temporales para el modal de Editar Plan
  const [tempPlanDays, setTempPlanDays] = useState<3 | 4 | 5>(4);
  const [tempPlanFocus, setTempPlanFocus] = useState<RoutineFocus>('standard');
  const [tempPlanTargetWeeks, setTempPlanTargetWeeks] = useState<number>(8);
  const [tempPlanCurrentWeek, setTempPlanCurrentWeek] = useState<number>(1);

  const openEditPlanModal = () => {
    setTempPlanDays(routineDays);
    setTempPlanFocus(routineFocus);
    setTempPlanTargetWeeks(mesocycleTargetWeeks);
    setTempPlanCurrentWeek(mesocycleWeek);
    setShowEditPlanModal(true);
  };

  const handleSavePlanEdits = () => {
    let needsRegen = false;
    if (tempPlanDays !== routineDays) {
      handleSwitchDaysCount(tempPlanDays);
      needsRegen = true;
    }
    if (tempPlanFocus !== routineFocus) {
      handleSwitchFocus(tempPlanFocus);
      needsRegen = true;
    }
    if (tempPlanTargetWeeks !== mesocycleTargetWeeks) {
      handleSetTargetWeeks(tempPlanTargetWeeks);
    }
    if (!needsRegen && tempPlanCurrentWeek !== mesocycleWeek) {
      setMesocycleWeek(tempPlanCurrentWeek);
      try {
        localStorage.setItem(`fit_gen_${nickname}_weekly_mesocycle_current_week`, String(tempPlanCurrentWeek));
      } catch (e) {}
    }
    setShowEditPlanModal(false);
    if (onNotification) {
      onNotification('Plan de entrenamiento actualizado');
    }
  };

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
  const [amrapType, setAmrapType] = useState<'complementary' | 'activator' | 'abs'>('complementary');
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

      let parsedTargetWeeks = 8;
      try {
        const savedTarget = localStorage.getItem(`fit_gen_${nickname}_weekly_mesocycle_target_weeks`);
        if (savedTarget) {
          parsedTargetWeeks = parseInt(savedTarget, 10) || 8;
          setMesocycleTargetWeeks(parsedTargetWeeks);
        }
      } catch (e) {
        setMesocycleTargetWeeks(8);
      }

      try {
        const savedWeek = localStorage.getItem(`fit_gen_${nickname}_weekly_mesocycle_current_week`);
        if (savedWeek) {
          const rawW = Math.max(1, parseInt(savedWeek, 10) || 1);
          if (rawW > parsedTargetWeeks) {
            setMesocycleWeek(parsedTargetWeeks);
            localStorage.setItem(`fit_gen_${nickname}_weekly_mesocycle_current_week`, String(parsedTargetWeeks));
            setShowCycleCompleteModal(true);
          } else {
            setMesocycleWeek(rawW);
          }
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

  // Iniciar nueva semana avanzando microciclo o finalizar el ciclo al llegar a la semana meta
  const handleResetWeeklyProgress = () => {
    if (mesocycleWeek >= mesocycleTargetWeeks) {
      setShowCycleCompleteModal(true);
      return;
    }
    const nextWeek = mesocycleWeek + 1;
    if (
      window.confirm(
        `Vas a avanzar a la Semana ${nextWeek} de ${mesocycleTargetWeeks} de tu mesociclo: se desmarcarán los ejercicios para iniciar el nuevo microciclo, pero tus pesos y repeticiones se mantendrán intactos para aplicar sobrecarga progresiva. ¿Continuar?`
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
        onNotification(`¡Semana ${nextWeek} de ${mesocycleTargetWeeks} iniciada! Tus pesos anteriores se conservan como referencia.`);
      }
    }
  };

  // Opciones al completar el ciclo completo de N semanas
  const handleStartSmartNextCycle = () => {
    // Genera un nuevo ciclo rotando variantes de cada patrón pero conservando el historial de cargas
    if (!weeklyRoutine) return;
    const rotatedRoutine: WeeklyRoutine = {};
    Object.keys(weeklyRoutine).forEach((dKey) => {
      const dId = Number(dKey);
      const day = weeklyRoutine[dId];
      if (!day) return;
      const newExercises = day.exercises.map((ex, idx) => {
        const alts = getAlternativeWeeklyExercises(dId, idx, selectedLevel, routineFocus, routineDays);
        const differentAlt = alts.find((a) => a.name !== ex.name);
        return differentAlt || ex;
      });
      rotatedRoutine[dId] = {
        ...day,
        exercises: newExercises
      };
    });

    setWeeklyRoutine(rotatedRoutine);
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
        weekly_routine: rotatedRoutine,
        weekly_start_date: now,
        weekly_focus: routineFocus,
        weekly_days: routineDays
      } as any);
    }

    try {
      localStorage.setItem(`fit_gen_${nickname}_weekly_start_date`, String(now));
      localStorage.setItem(`fit_gen_${nickname}_weekly_routine_${selectedLevel}_v1`, JSON.stringify(rotatedRoutine));
      localStorage.setItem(`fit_gen_${nickname}_weekly_mesocycle_current_week`, '1');
    } catch (e) {}

    setShowCycleCompleteModal(false);
    if (onNotification) {
      onNotification('🚀 ¡Nuevo ciclo inteligente generado! Se renovaron variantes de estímulo conservando tu historial de cargas.');
    }
  };

  const handleRepeatSameCycleFromWeek1 = () => {
    setMesocycleWeek(1);
    setWeeklyLogs((prev) => {
      const reset: Record<string, { weight: string; reps: string; completed: boolean }> = {};
      Object.keys(prev).forEach((k) => {
        reset[k] = { ...prev[k], completed: false };
      });
      return reset;
    });
    try {
      localStorage.setItem(`fit_gen_${nickname}_weekly_mesocycle_current_week`, '1');
    } catch (e) {}
    setShowCycleCompleteModal(false);
    if (onNotification) {
      onNotification(`🔄 ¡Ciclo reiniciado en la Semana 1 de ${mesocycleTargetWeeks}! Tus cargas previas se mantienen como referencia a superar.`);
    }
  };

  const handleExtendCurrentCycle = (extraWeeks: number) => {
    const newTarget = mesocycleTargetWeeks + extraWeeks;
    const nextW = mesocycleWeek + 1;
    setMesocycleTargetWeeks(newTarget);
    setMesocycleWeek(nextW);
    setWeeklyLogs((prev) => {
      const reset: Record<string, { weight: string; reps: string; completed: boolean }> = {};
      Object.keys(prev).forEach((k) => {
        reset[k] = { ...prev[k], completed: false };
      });
      return reset;
    });
    if (user) {
      updateUserProfileCloud(user.id, { weekly_target_weeks: newTarget });
    }
    try {
      localStorage.setItem(`fit_gen_${nickname}_weekly_mesocycle_target_weeks`, String(newTarget));
      localStorage.setItem(`fit_gen_${nickname}_weekly_mesocycle_current_week`, String(nextW));
    } catch (e) {}
    setShowCycleCompleteModal(false);
    if (onNotification) {
      onNotification(`➕ Ciclo extendido a ${newTarget} semanas. ¡Iniciando Semana ${nextW} de ${newTarget}!`);
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

  // Sustituir un ejercicio del Finisher (AMRAP) por una alternativa del banco
  const handleSwapAmrapExercise = (newExName: string) => {
    if (!swapAmrapModalState || !weeklyRoutine) return;
    const { dayId, amrapType: targetType, exIndex } = swapAmrapModalState;
    const day = weeklyRoutine[dayId];
    if (!day) return;

    let targetBlock: AmrapBlock;
    if (targetType === 'abs') {
      targetBlock = { ...(day.amrapAbs || getDefaultAbsAmrap(dayId)) };
    } else if (targetType === 'activator') {
      targetBlock = { ...day.amrapActivator };
    } else {
      targetBlock = { ...day.amrapComplementary };
    }

    const updatedExercises = [...targetBlock.exercises];
    updatedExercises[exIndex] = newExName;
    targetBlock.exercises = updatedExercises;

    const updatedDay: WeeklyDay = {
      ...day,
      ...(targetType === 'abs' ? { amrapAbs: targetBlock } : {}),
      ...(targetType === 'activator' ? { amrapActivator: targetBlock } : {}),
      ...(targetType === 'complementary' ? { amrapComplementary: targetBlock } : {})
    };

    const updatedRoutine: WeeklyRoutine = {
      ...weeklyRoutine,
      [dayId]: updatedDay
    };

    setWeeklyRoutine(updatedRoutine);
    try {
      localStorage.setItem(`fit_gen_${nickname}_weekly_routine_${selectedLevel}_v1`, JSON.stringify(updatedRoutine));
    } catch (e) {}

    if (user) {
      updateUserProfileCloud(user.id, { weekly_routine: updatedRoutine });
    }

    setSwapAmrapModalState(null);
    if (onNotification) {
      onNotification(`Finisher actualizado con: ${newExName}`);
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

  // Si el usuario entra al Modo Sesión Activa (Imagen 1)
  if (activeSessionDay !== null && currentDay) {
    const sessionDay = weeklyRoutine[activeSessionDay] || currentDay;
    return (
      <WorkoutSessionView
        dayId={activeSessionDay}
        dayName={sessionDay.name}
        exercises={sessionDay.exercises}
        selectedLevel={selectedLevel}
        nickname={nickname}
        initialExerciseIndex={sessionInitialIndex}
        onClose={() => setActiveSessionDay(null)}
        onFinishWorkout={() => {
          handleToggleWeeklyCompleteAll(activeSessionDay);
          setActiveSessionDay(null);
          if (onNotification) onNotification(`¡${sessionDay.name} terminado con éxito! 🎉`);
        }}
        onSwapExercise={(index, newName) => {
          const alt = getAlternativeWeeklyExercises(activeSessionDay, index, selectedLevel, routineFocus, routineDays).find((a) => a.name === newName);
          if (alt) handleSwapExercise(alt);
        }}
        onUpdateExerciseSummary={(exerciseName, summary) => {
          const key = `${selectedLevel}_day${activeSessionDay}_${exerciseName}`;
          setWeeklyLogs((prev) => ({
            ...prev,
            [key]: {
              weight: summary.weight || prev[key]?.weight || '',
              reps: summary.reps || prev[key]?.reps || '',
              completed: summary.completed || prev[key]?.completed || false,
            }
          }));
        }}
        onNotification={onNotification}
      />
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full text-[#F4F2ED]">
      {/* CABECERA DEL BLOQUE DE ENTRENAMIENTO */}
      <div className="bg-[#20252C] rounded-3xl p-5 mb-5 border border-[#282F38] shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#282F38]">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[10px] uppercase font-black tracking-wider text-[#5B8DEF] bg-[#5B8DEF]/10 border border-[#5B8DEF]/25 px-2.5 py-0.5 rounded-full">
                Bloque de entrenamiento
              </span>
              <span className="text-xs text-[#A8B0BB]">
                {routineFocus === 'glutes' ? 'Énfasis glúteos e inferior' : 'Torso / Pierna'}
              </span>
            </div>
            <h2 className="text-xl font-black text-white">
              Semana {mesocycleWeek} de {mesocycleTargetWeeks} · Día {activeWeeklyDay} de {routineDays}
            </h2>
            <p className="text-xs text-[#A8B0BB] mt-0.5">
              {routineDays} días de entrenamiento · {routineDays === 3 ? '4 días de descanso' : routineDays === 4 ? '3 días de descanso' : '2 días de descanso'}
            </p>
          </div>

          <div className="flex items-center gap-2 relative">
            <button
              onClick={openEditPlanModal}
              className="bg-[#15181D] hover:bg-[#282F38] text-[#F4F2ED] border border-[#282F38] px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-[#5B8DEF]" />
              <span>Editar plan</span>
            </button>

            <button
              onClick={() => setShowPlanMenu(!showPlanMenu)}
              className="bg-[#15181D] hover:bg-[#282F38] text-[#A8B0BB] hover:text-[#F4F2ED] border border-[#282F38] p-2 rounded-xl text-xs transition-all cursor-pointer"
              title="Opciones del bloque"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showPlanMenu && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-[#20252C] border border-[#282F38] rounded-2xl p-2 shadow-2xl z-30 space-y-1 animate-fadeIn">
                <button
                  onClick={() => {
                    if (window.confirm('¿Deseas crear un bloque nuevo? Se renovará tu plan de entrenamiento.')) {
                      handleRegenerateRoutine();
                    }
                    setShowPlanMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-[#15181D] rounded-xl text-[#F4F2ED] flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Crear bloque nuevo</span>
                </button>
                <button
                  onClick={() => {
                    handleResetWeeklyProgress();
                    setShowPlanMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-[#15181D] rounded-xl text-[#F4F2ED] flex items-center gap-2 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
                  <span>
                    {mesocycleWeek >= mesocycleTargetWeeks
                      ? `Finalizar ciclo de ${mesocycleTargetWeeks} semanas 🏆`
                      : 'Pasar a la semana siguiente'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Barra de progreso de sesiones del bloque */}
        <div className="mt-3.5">
          <div className="flex justify-between items-center text-[11px] font-semibold text-[#A8B0BB] mb-1.5">
            <span>Sesiones del bloque: <strong className="text-[#1FD08A] font-mono">{completedSessionsTotal}</strong> de {totalSessionsInMesocycle}</span>
            <span className="font-mono text-[#1FD08A] font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full bg-[#15181D] rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#1FD08A] h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Banner cuando está en la última semana del mesociclo */}
        {mesocycleWeek >= mesocycleTargetWeeks && (
          <div className="mt-4 bg-gradient-to-r from-[#1FD08A]/15 via-[#5B8DEF]/15 to-[#1FD08A]/10 border border-[#1FD08A]/40 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Trophy className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-black text-white">
                  ¡Estás en la Semana {mesocycleTargetWeeks} de {mesocycleTargetWeeks} (Última semana de tu ciclo)!
                </p>
                <p className="text-[11px] text-[#A8B0BB] mt-0.5">
                  Al terminar esta semana cerramos tu mesociclo para evaluar tus marcas y decidir tu próximo bloque.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowCycleCompleteModal(true)}
              className="px-3.5 py-2 rounded-xl bg-[#1FD08A] hover:bg-[#1ab87a] text-[#15181D] font-black text-xs shrink-0 transition-all cursor-pointer shadow-md"
            >
              🏆 Cerrar Ciclo / Elegir Siguiente Paso
            </button>
          </div>
        )}
      </div>

      {/* TARJETA DEL DÍA ACTIVO Y ACCIÓN PRINCIPAL */}
      <div className="bg-[#20252C] rounded-3xl p-5 mb-5 border border-[#282F38] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-black text-white">
              {currentDay.name}
            </h3>
            <p className="text-xs text-[#A8B0BB] mt-0.5">
              {currentDay.subtitle}
            </p>
          </div>

          {/* Selector de días D1 a D4/D5 */}
          <div className="flex items-center gap-1.5 bg-[#15181D] p-1 rounded-2xl border border-[#282F38]">
            {availableDays.map((dId) => {
              const isDayFinished = weeklyRoutine && weeklyRoutine[dId] && weeklyRoutine[dId].exercises.length > 0 && weeklyRoutine[dId].exercises.every((ex) => weeklyLogs[`${selectedLevel}_day${dId}_${ex.name}`]?.completed);
              return (
                <button
                  key={dId}
                  onClick={() => setActiveWeeklyDay(dId)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    activeWeeklyDay === dId
                      ? 'bg-[#5B8DEF] text-white shadow-sm'
                      : 'text-[#A8B0BB] hover:text-white'
                  }`}
                >
                  <span>Día {dId}</span>
                  {isDayFinished && <span className="text-[10px] text-[#1FD08A]">✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Botón protagonista para empezar la sesión (abre la vista de la Imagen 1) */}
        <button
          onClick={() => {
            setSessionInitialIndex(0);
            setActiveSessionDay(activeWeeklyDay);
          }}
          className="w-full bg-[#1FD08A] hover:bg-[#1ab87a] text-[#15181D] font-black py-4 px-6 rounded-2xl text-base transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(31,208,138,0.35)] cursor-pointer"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Empezar sesión ({currentDay.name})</span>
        </button>
      </div>

      {/* CRONÓMETRO DE DESCANSO EN MODO REPOSO (SI ESTÁ ACTIVO) */}
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
                <strong className="text-white">Aumento de pulso:</strong> 3 a 5 min de cardio ligero (bici, cinta o elíptica suave).
              </div>
            </div>
            <div className="flex items-start gap-2.5 bg-[#15181D] p-2.5 rounded-xl border border-[#282F38]">
              <span className="font-mono font-bold text-amber-400 shrink-0">2. A</span>
              <div>
                <strong className="text-white">Activación neuromuscular:</strong> 1 serie con banda o peso corporal para escápulas o glúteos.
              </div>
            </div>
            <div className="flex items-start gap-2.5 bg-[#15181D] p-2.5 rounded-xl border border-[#282F38]">
              <span className="font-mono font-bold text-amber-400 shrink-0">3. M</span>
              <div>
                <strong className="text-white">Movilidad articular dinámica:</strong> 5-8 repeticiones dinámicas para cadera, tobillos y columna torácica.
              </div>
            </div>
            <div className="flex items-start gap-2.5 bg-[#15181D] p-2.5 rounded-xl border border-[#282F38]">
              <span className="font-mono font-bold text-amber-400 shrink-0">4. P</span>
              <div>
                <strong className="text-white">Potenciación:</strong> 1-2 series de aproximación con 50% y 75% del peso objetivo en tu primer ejercicio.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* LISTA DE EJERCICIOS DEL DÍA (TARJETAS COMPACTAS) */}
      <div className="space-y-2.5 flex-1 overflow-y-auto">
        {dayExercises.map((exercise, index) => {
          const key = `${selectedLevel}_day${activeWeeklyDay}_${exercise.name}`;
          const log = weeklyLogs[key] || { weight: '', reps: '', completed: false };
          const suggestion = getProgressionSuggestion(weeklyHistory[key], exercise.defaultReps);

          // Leer series reales ejecutadas o ajustadas en el simulador en vivo
          let realSetsCount: number | null = null;
          let realRepsStr: string | null = null;
          let realWeightStr: string | null = null;
          let hasCompletedSetsInSession = false;

          try {
            const savedSetsRaw = localStorage.getItem(
              `fit_sets_${nickname}_${selectedLevel}_d${activeWeeklyDay}_${exercise.name}`
            );
            if (savedSetsRaw) {
              const parsedSets = JSON.parse(savedSetsRaw);
              if (Array.isArray(parsedSets) && parsedSets.length > 0) {
                const completedList = parsedSets.filter((s: any) => s.completed);
                hasCompletedSetsInSession = completedList.length > 0;
                const targetList = completedList.length > 0 ? completedList : parsedSets;
                realSetsCount = targetList.length;
                const uniqueReps = Array.from(
                  new Set(targetList.map((s: any) => String(s.reps || '').trim()).filter(Boolean))
                );
                realRepsStr =
                  uniqueReps.length === 1
                    ? uniqueReps[0]
                    : targetList
                        .map((s: any) => String(s.reps || '').trim())
                        .filter(Boolean)
                        .join('/');
                realWeightStr = targetList[targetList.length - 1]?.weight || '';
              }
            }
          } catch {}

          const defaultCleanReps = formatCleanReps(exercise.defaultReps);
          const wasModifiedOrLogged =
            hasCompletedSetsInSession ||
            log.completed ||
            (realSetsCount !== null && realSetsCount !== exercise.defaultSets) ||
            (realRepsStr !== null && `${realRepsStr} reps` !== defaultCleanReps && realRepsStr !== '6');

          return (
            <div
              key={exercise.name}
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
                    handleToggleWeeklyCompleted(activeWeeklyDay, exercise.name);
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
                    setActiveSessionDay(activeWeeklyDay);
                  }}
                >
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    <span className="text-[10px] font-bold text-[#A8B0BB] bg-[#15181D] px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {exercise.category}
                    </span>
                    <span
                      className="text-[10px] font-bold text-[#A8B0BB] bg-[#15181D] px-2 py-0.5 rounded-md font-mono border border-[#282F38]"
                      title="Series y repeticiones recomendadas por el plan científico"
                    >
                      Sugerido: {exercise.defaultSets} × {defaultCleanReps}
                    </span>
                    {wasModifiedOrLogged && realSetsCount && realRepsStr && (
                      <span
                        className="text-[10px] font-black text-[#1FD08A] bg-[#1FD08A]/15 border border-[#1FD08A]/40 px-2 py-0.5 rounded-md font-mono"
                        title="Series y repeticiones reales registradas o ajustadas por ti en la sesión"
                      >
                        {log.completed || hasCompletedSetsInSession ? '✓ Realizado:' : 'Tu ajuste:'} {realSetsCount} × {realRepsStr} reps
                        {realWeightStr ? ` (${realWeightStr} kg)` : ''}
                      </span>
                    )}
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

              {/* Derecha: Acciones rápidas (Técnica, Cambiar ejercicio, Entrenar) */}
              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => setInspectedExercise(findExerciseDetail(exercise.name))}
                  className="p-2 bg-[#15181D] hover:bg-[#282F38] text-[#A8B0BB] hover:text-white rounded-xl text-xs transition-colors border border-[#282F38] cursor-pointer"
                  title="Ver técnica detallada"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setSwapModalState({ dayId: activeWeeklyDay, exIndex: index, currentName: exercise.name })}
                  className="px-2.5 py-1.5 bg-[#15181D] hover:bg-[#282F38] text-[#A8B0BB] hover:text-[#5B8DEF] rounded-xl text-xs font-semibold transition-colors border border-[#282F38] flex items-center gap-1 cursor-pointer"
                  title="Cambiar por ejercicio alternativo"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span className="hidden md:inline">Cambiar</span>
                </button>

                <button
                  onClick={() => {
                    setSessionInitialIndex(index);
                    setActiveSessionDay(activeWeeklyDay);
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

      {/* AMRAP COMPLEMENTARIO / ACTIVADOR / ABDOMEN PLEGABLE */}
      {(() => {
        const activeAmrap = 
          amrapType === 'complementary'
            ? currentDay.amrapComplementary
            : amrapType === 'activator'
            ? currentDay.amrapActivator
            : (currentDay.amrapAbs || getDefaultAbsAmrap(currentDay.id));

        return (
          <div className="mt-5 bg-[#20252C] rounded-3xl border border-[#282F38] shadow-xl overflow-hidden">
            <button
              onClick={() => setAmrapOpen(!amrapOpen)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-[#282F38]/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white">Finisher metabólico (AMRAP opcional)</span>
                    <span className="text-[10px] font-bold text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded-full border border-purple-800/40">
                      {amrapCustomDuration} min
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A8B0BB] mt-0.5">
                    {activeAmrap.name}
                  </p>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 text-[#A8B0BB] transition-transform duration-200 ${amrapOpen ? 'rotate-90' : ''}`} />
            </button>

            {amrapOpen && (
              <div className="p-5 pt-2 border-t border-[#282F38] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-[#A8B0BB]">
                      {activeAmrap.instructions}
                    </p>

                    {/* Selector de Duración 5, 7, 10 min */}
                    <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                      <span className="text-[11px] font-bold text-[#A8B0BB]">Duración:</span>
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
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                              amrapCustomDuration === mins
                                ? 'bg-purple-600 border-purple-500 text-white shadow'
                                : 'bg-[#15181D] border-[#282F38] text-[#A8B0BB] hover:text-white'
                            }`}
                          >
                            {mins} min {isSuggested ? '(Sugerido)' : ''}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-[#15181D] p-1 rounded-xl border border-[#282F38] shrink-0 self-start sm:self-auto flex-wrap">
                    <button
                      onClick={() => setAmrapType('complementary')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        amrapType === 'complementary' ? 'bg-purple-600 text-white shadow' : 'text-[#A8B0BB] hover:text-white'
                      }`}
                    >
                      Complementario
                    </button>
                    <button
                      onClick={() => setAmrapType('activator')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        amrapType === 'activator' ? 'bg-purple-600 text-white shadow' : 'text-[#A8B0BB] hover:text-white'
                      }`}
                    >
                      Activador
                    </button>
                    <button
                      onClick={() => setAmrapType('abs')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        amrapType === 'abs' ? 'bg-purple-600 text-white shadow' : 'text-[#A8B0BB] hover:text-white'
                      }`}
                    >
                      Abdomen
                    </button>
                  </div>
                </div>

                {/* Ejercicios del AMRAP y Cronómetro */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex-1 space-y-1.5 w-full">
                    {activeAmrap.exercises.map((ex, i) => (
                      <div 
                        key={i} 
                        className="flex items-center justify-between text-xs text-[#F4F2ED] bg-[#15181D] hover:bg-[#282F38]/80 hover:border-purple-500/40 p-2.5 rounded-xl border border-[#282F38] transition-all group gap-2"
                      >
                        <div 
                          onClick={() => setInspectedExercise(findExerciseDetail(ex))}
                          className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                          title="Toca para ver técnica de este ejercicio"
                        >
                          <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-black flex items-center justify-center shrink-0">
                            {i + 1}
                          </span>
                          <span className="group-hover:text-purple-300 transition-colors font-medium truncate sm:whitespace-normal">
                            {ex}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFinisherEquipmentFilter('all');
                              setFinisherSearchQuery('');
                              setSwapAmrapModalState({
                                dayId: activeWeeklyDay,
                                amrapType,
                                exIndex: i,
                                currentName: ex
                              });
                            }}
                            className="px-2 py-1 bg-[#20252C] hover:bg-[#282F38] text-[#A8B0BB] hover:text-[#5B8DEF] rounded-lg text-[11px] font-bold transition-colors border border-[#282F38] flex items-center gap-1 cursor-pointer"
                            title="Cambiar por otro ejercicio alternativo del finisher"
                          >
                            <RefreshCw className="w-3 h-3 text-[#5B8DEF]" />
                            <span className="hidden sm:inline">Cambiar</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectedExercise(findExerciseDetail(ex));
                            }}
                            className="p-1 bg-[#20252C] hover:bg-[#282F38] text-[#A8B0BB] hover:text-purple-300 rounded-lg transition-colors border border-[#282F38] cursor-pointer"
                            title="Ver técnica detallada"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Temporizador AMRAP */}
                  <div className="bg-[#15181D] border border-[#282F38] rounded-2xl p-4 flex flex-col items-center justify-center shrink-0 w-full md:w-56">
                    <div className="text-3xl font-extrabold font-mono tracking-tight text-purple-400 tabular-nums mb-2">
                      {formatTime(amrapTimeLeft)}
                    </div>
                    <div className="flex items-center gap-2 w-full">
                      <button
                        onClick={() => setAmrapRunning(!amrapRunning)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          amrapRunning ? 'bg-[#282F38] text-white hover:bg-[#323B47]' : 'bg-purple-600 text-white hover:bg-purple-500'
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
                        className="bg-[#282F38] hover:bg-[#323B47] text-[#A8B0BB] hover:text-white font-bold px-3 py-2 rounded-xl text-xs cursor-pointer"
                      >
                        Reiniciar
                      </button>
                    </div>
                  </div>
                </div>

                {showAmrapAlert && (
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl p-3.5 shadow-lg flex items-center justify-between border border-purple-400/50">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-300 animate-bounce" />
                      <div>
                        <p className="text-xs font-black">¡AMRAP completado!</p>
                        <p className="text-[11px] opacity-90">Gran esfuerzo para cerrar la sesión de hoy.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowAmrapAlert(false)}
                      className="bg-white text-zinc-950 text-xs font-black px-3 py-1 rounded-lg cursor-pointer"
                    >
                      Genial
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* ACCIONES SECUNDARIAS AL FONDO */}
      <div className="mt-6 pt-4 border-t border-[#282F38] flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => handleToggleWeeklyCompleteAll(activeWeeklyDay)}
          className={`flex-1 font-bold py-3.5 px-4 rounded-2xl transition-all text-xs cursor-pointer ${
            dayCompletedCount === dayTotalCount
              ? 'bg-[#15181D] hover:bg-[#282F38] text-[#A8B0BB] border border-[#282F38]'
              : 'bg-[#20252C] hover:bg-[#282F38] text-[#F4F2ED] border border-[#282F38]'
          }`}
        >
          {dayCompletedCount === dayTotalCount
            ? 'Reiniciar progreso de hoy'
            : `Marcar Día ${activeWeeklyDay} completo`}
        </button>

        <button
          onClick={handleResetWeeklyProgress}
          className={`${
            mesocycleWeek >= mesocycleTargetWeeks
              ? 'bg-[#1FD08A] hover:bg-[#1ab87a] text-[#15181D] border-[#1FD08A] font-black shadow-lg'
              : 'bg-[#20252C] hover:bg-[#282F38] text-[#5B8DEF] border-[#282F38] font-bold'
          } border py-3.5 px-4 rounded-2xl transition-all text-xs cursor-pointer`}
          title="Avanza de semana o cierra el ciclo actual al llegar a la meta"
        >
          {mesocycleWeek >= mesocycleTargetWeeks
            ? `🏆 Finalizar ciclo (${mesocycleTargetWeeks} sem)`
            : 'Pasar a la semana siguiente'}
        </button>

        <button
          onClick={handleRegenerateRoutine}
          className="bg-[#20252C] hover:bg-[#282F38] text-[#A8B0BB] hover:text-[#F4F2ED] border border-[#282F38] font-bold py-3.5 px-4 rounded-2xl transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          title="Regenera toda la rutina de 4 días para comenzar un nuevo mesociclo"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Crear bloque nuevo</span>
        </button>
      </div>

      {/* MODAL DE FELICITACIÓN Y FIN DE CICLO (MESOCICLO COMPLETADO) */}
      {showCycleCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#20252C] rounded-3xl p-6 max-w-lg w-full border border-[#1FD08A]/40 shadow-2xl text-[#F4F2ED] space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 border-b border-[#282F38] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#1FD08A] bg-[#1FD08A]/15 px-2.5 py-0.5 rounded-full">
                    Mesociclo Completado · {mesocycleTargetWeeks} Semanas
                  </span>
                  <h3 className="text-lg font-black text-white mt-1">
                    ¡Felicitaciones, {nickname}! 🎉
                  </h3>
                  <p className="text-xs text-[#A8B0BB]">
                    Terminaste las {mesocycleTargetWeeks} semanas de tu bloque de entrenamiento.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCycleCompleteModal(false)}
                className="p-1.5 hover:bg-[#15181D] rounded-xl text-[#A8B0BB] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Métricas alcanzadas en este ciclo */}
            {(() => {
              const loggedKeys = Object.keys(weeklyLogs).filter(
                (k) => k.startsWith(`${selectedLevel}_`) && (weeklyLogs[k]?.weight || weeklyLogs[k]?.completed)
              );
              const withWeight = loggedKeys.filter((k) => Number(weeklyLogs[k]?.weight) > 0);
              return (
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="bg-[#15181D] border border-[#282F38] rounded-2xl p-3 text-center">
                    <p className="text-[10px] font-bold text-[#A8B0BB] uppercase">Ciclo</p>
                    <p className="text-base font-black text-[#1FD08A] font-mono mt-0.5">
                      {mesocycleTargetWeeks} sem
                    </p>
                    <p className="text-[10px] text-[#717885]">{totalSessionsInMesocycle} sesiones</p>
                  </div>
                  <div className="bg-[#15181D] border border-[#282F38] rounded-2xl p-3 text-center">
                    <p className="text-[10px] font-bold text-[#A8B0BB] uppercase">Cargas medidas</p>
                    <p className="text-base font-black text-[#5B8DEF] font-mono mt-0.5">
                      {withWeight.length}
                    </p>
                    <p className="text-[10px] text-[#717885]">ejercicios con peso</p>
                  </div>
                  <div className="bg-[#15181D] border border-[#282F38] rounded-2xl p-3 text-center">
                    <p className="text-[10px] font-bold text-[#A8B0BB] uppercase">Frecuencia</p>
                    <p className="text-base font-black text-amber-400 font-mono mt-0.5">
                      {routineDays} días/sem
                    </p>
                    <p className="text-[10px] text-[#717885]">{routineFocus === 'glutes' ? 'Glúteos/Pierna' : 'Torso/Pierna'}</p>
                  </div>
                </div>
              );
            })()}

            {/* Explicación fisiológica profesional */}
            <div className="bg-[#15181D] border border-[#5B8DEF]/30 rounded-2xl p-3.5 text-xs text-[#A8B0BB] space-y-1.5">
              <p className="font-black text-[#5B8DEF] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>¿Qué se recomienda científicamente al terminar un ciclo?</span>
              </p>
              <p className="leading-relaxed">
                Tras <strong>{mesocycleTargetWeeks} semanas</strong> repitiendo los mismos ejercicios, tu sistema nervioso y articular acumula fatiga y el estímulo empieza a estancarse (ley de rendimientos decrecientes). Por eso la app no sigue infinitamente a la semana {mesocycleTargetWeeks + 1}, sino que te permite elegir tu siguiente fase:
              </p>
            </div>

            {/* 3 Opciones de Decisión del Atleta */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleStartSmartNextCycle}
                className="w-full text-left p-4 rounded-2xl bg-[#1FD08A]/15 hover:bg-[#1FD08A]/25 border-2 border-[#1FD08A] transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-[#1FD08A] text-[#15181D] px-2 py-0.5 rounded-md">
                    ⭐ Recomendado por el Coach
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#1FD08A] group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-sm font-black text-white mt-1.5">
                  1. Generar Nuevo Ciclo Sugerido según mis Métricas
                </p>
                <p className="text-[11px] text-[#A8B0BB] mt-0.5 leading-snug">
                  Rota las variantes de ejercicios para renovar el estímulo muscular, conserva tu historial de pesos logrados e inicia un nuevo bloque en la <strong>Semana 1 de {mesocycleTargetWeeks}</strong>.
                </p>
              </button>

              <button
                type="button"
                onClick={handleRepeatSameCycleFromWeek1}
                className="w-full text-left p-4 rounded-2xl bg-[#15181D] hover:bg-[#282F38] border border-[#282F38] hover:border-[#5B8DEF]/50 transition-all cursor-pointer"
              >
                <p className="text-sm font-black text-white">
                  2. Repetir este mismo Ciclo desde la Semana 1
                </p>
                <p className="text-[11px] text-[#A8B0BB] mt-0.5 leading-snug">
                  Mantiene exactamente los mismos ejercicios actuales y tus pesos registrados como base para que busques superar tus marcas en un nuevo ciclo de {mesocycleTargetWeeks} semanas.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleExtendCurrentCycle(4)}
                className="w-full text-left p-4 rounded-2xl bg-[#15181D] hover:bg-[#282F38] border border-[#282F38] hover:border-amber-400/50 transition-all cursor-pointer"
              >
                <p className="text-sm font-black text-white">
                  3. Continuar este ciclo (+4 semanas adicionales)
                </p>
                <p className="text-[11px] text-[#A8B0BB] mt-0.5 leading-snug">
                  Si sientes que aún estás subiendo cargas sin fatiga articular, amplía este bloque a {mesocycleTargetWeeks + 4} semanas y pasa a la Semana {mesocycleTargetWeeks + 1}.
                </p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARA EDITAR PLAN */}
      {showEditPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#20252C] rounded-3xl p-6 max-w-md w-full border border-[#282F38] shadow-2xl text-[#F4F2ED] space-y-5">
            <div className="flex items-center justify-between border-b border-[#282F38] pb-3">
              <div>
                <h3 className="text-base font-black text-white">Editar plan de entrenamiento</h3>
                <p className="text-xs text-[#A8B0BB]">Ajusta la estructura de tu mesociclo</p>
              </div>
              <button
                onClick={() => setShowEditPlanModal(false)}
                className="p-1.5 hover:bg-[#15181D] rounded-xl text-[#A8B0BB] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Días por semana */}
            <div>
              <label className="text-xs font-bold text-[#A8B0BB] block mb-2">Días de entrenamiento por semana</label>
              <div className="grid grid-cols-3 gap-2">
                {([3, 4, 5] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setTempPlanDays(d)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      tempPlanDays === d
                        ? 'bg-[#5B8DEF]/15 border-[#5B8DEF] text-white font-black'
                        : 'bg-[#15181D] border-[#282F38] text-[#A8B0BB] hover:text-white'
                    }`}
                  >
                    <div className="text-sm font-black">{d} días</div>
                    <div className="text-[10px] opacity-75">{d === 3 ? 'Full Body' : d === 4 ? 'Torso/Pierna' : 'Frecuencia alta'}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Enfoque del bloque */}
            <div>
              <label className="text-xs font-bold text-[#A8B0BB] block mb-2">Enfoque muscular</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTempPlanFocus('standard')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    tempPlanFocus === 'standard'
                      ? 'bg-[#1FD08A]/15 border-[#1FD08A] text-white font-black'
                      : 'bg-[#15181D] border-[#282F38] text-[#A8B0BB] hover:text-white'
                  }`}
                >
                  <div className="text-xs font-black">Estándar</div>
                  <div className="text-[10px] opacity-75">Torso / Pierna equilibrado</div>
                </button>
                <button
                  type="button"
                  onClick={() => setTempPlanFocus('glutes')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    tempPlanFocus === 'glutes'
                      ? 'bg-purple-500/15 border-purple-500 text-white font-black'
                      : 'bg-[#15181D] border-[#282F38] text-[#A8B0BB] hover:text-white'
                  }`}
                >
                  <div className="text-xs font-black">Glúteos & Pierna</div>
                  <div className="text-[10px] opacity-75">Énfasis cadena posterior</div>
                </button>
              </div>
            </div>

            {/* Duración del bloque */}
            <div>
              <label className="text-xs font-bold text-[#A8B0BB] block mb-2">Duración del bloque</label>
              <div className="grid grid-cols-4 gap-2">
                {[4, 6, 8, 12].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setTempPlanTargetWeeks(w)}
                    className={`py-2 px-1 rounded-xl border text-center text-xs transition-all cursor-pointer ${
                      tempPlanTargetWeeks === w
                        ? 'bg-[#1FD08A] border-[#1FD08A] text-[#15181D] font-black'
                        : 'bg-[#15181D] border-[#282F38] text-[#A8B0BB] hover:text-white'
                    }`}
                  >
                    {w} sem
                  </button>
                ))}
              </div>
            </div>

            {/* Semana actual */}
            <div>
              <label className="text-xs font-bold text-[#A8B0BB] block mb-2">
                Semana activa: <span className="text-[#1FD08A] font-mono">Semana {tempPlanCurrentWeek}</span> de {tempPlanTargetWeeks}
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {Array.from({ length: tempPlanTargetWeeks }, (_, i) => i + 1).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setTempPlanCurrentWeek(w)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center ${
                      tempPlanCurrentWeek === w
                        ? 'bg-[#5B8DEF] border-[#5B8DEF] text-white'
                        : 'bg-[#15181D] border-[#282F38] text-[#A8B0BB] hover:text-white'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#282F38]">
              <button
                type="button"
                onClick={() => setShowEditPlanModal(false)}
                className="px-4 py-2.5 bg-[#15181D] hover:bg-[#282F38] text-[#A8B0BB] hover:text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSavePlanEdits}
                className="px-5 py-2.5 bg-[#1FD08A] hover:bg-[#1ab87a] text-[#15181D] font-black rounded-xl text-xs transition-all shadow-md cursor-pointer"
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARA SUSTITUIR UN EJERCICIO INDIVIDUAL */}
      {swapModalState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#20252C] rounded-3xl p-6 max-w-lg w-full border border-[#282F38] shadow-2xl text-[#F4F2ED]">
            <div className="flex items-center justify-between border-b border-[#282F38] pb-3 mb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#1FD08A] bg-[#1FD08A]/15 px-2 py-0.5 rounded-full">
                  Sustitución en gimnasio
                </span>
                <h3 className="text-base font-black text-white mt-1">
                  Elegir alternativa para este ejercicio
                </h3>
                <p className="text-xs text-[#A8B0BB]">
                  Actual: <span className="font-bold text-white">{swapModalState.currentName}</span>
                </p>
              </div>
              <button
                onClick={() => setSwapModalState(null)}
                className="p-1.5 hover:bg-[#15181D] rounded-xl text-[#A8B0BB] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#A8B0BB] mb-3 leading-relaxed">
              Elige otra máquina o ejercicio equivalente para el mismo grupo muscular. El resto de tu mesociclo permanecerá intacto:
            </p>

            <div className="space-y-2 mb-5 max-h-72 overflow-y-auto">
              <button
                type="button"
                onClick={() => setShowCustomExModal(true)}
                className="w-full text-center py-2.5 px-3 rounded-2xl bg-[#1FD08A]/10 hover:bg-[#1FD08A]/20 border border-[#1FD08A]/30 text-xs font-bold text-[#1FD08A] transition-all flex items-center justify-center gap-1.5 cursor-pointer mb-2"
              >
                <Plus className="w-4 h-4" />
                <span>Crear mi propio ejercicio</span>
              </button>

              {getAlternativeWeeklyExercises(swapModalState.dayId, swapModalState.exIndex, selectedLevel, routineFocus, routineDays).map((alt) => {
                const isSelected = alt.name === swapModalState.currentName;
                return (
                  <button
                    key={alt.name}
                    onClick={() => handleSwapExercise(alt)}
                    disabled={isSelected}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-[#15181D] border-[#282F38] opacity-50 cursor-not-allowed'
                        : 'bg-[#15181D] hover:bg-[#282F38] hover:border-[#1FD08A]/40 border-[#282F38]'
                    }`}
                  >
                    <div>
                      <p className="font-extrabold text-xs text-white">{alt.name}</p>
                      <p className="text-[11px] text-[#A8B0BB] mt-0.5">{alt.description}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold text-[#A8B0BB] font-mono">
                        {alt.defaultSets} series × {formatCleanReps(alt.defaultReps)}
                      </span>
                    </div>
                    {isSelected ? (
                      <span className="text-[10px] font-bold text-[#A8B0BB]">Actual</span>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-[#1FD08A] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSwapModalState(null)}
                className="px-4 py-2 bg-[#15181D] hover:bg-[#282F38] text-[#A8B0BB] hover:text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARA CREAR EJERCICIO PERSONALIZADO DESDE SUSTITUCIÓN */}
      {showCustomExModal && swapModalState && (
        <CustomExerciseModal
          nickname={nickname}
          defaultMuscleGroup="Cuádriceps"
          onClose={() => setShowCustomExModal(false)}
          onCreated={(newEx) => {
            const altExercise: WeeklyExercise = {
              name: newEx.name,
              category: newEx.muscleGroup,
              defaultSets: 4,
              defaultReps: '8-10 reps',
              description: newEx.targetFocus
            };
            handleSwapExercise(altExercise);
            setShowCustomExModal(false);
          }}
          onNotification={onNotification}
        />
      )}

      {/* MODAL PARA SUSTITUIR UN EJERCICIO DEL FINISHER (AMRAP) */}
      {swapAmrapModalState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#20252C] rounded-3xl p-5 sm:p-6 max-w-lg w-full border border-[#282F38] shadow-2xl text-[#F4F2ED] max-h-[90vh] flex flex-col">
            {/* Cabecera */}
            <div className="flex items-center justify-between border-b border-[#282F38] pb-3 mb-3.5 shrink-0">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 bg-purple-500/15 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
                  Finisher · {swapAmrapModalState.amrapType === 'abs' ? 'AMRAP Abdomen' : swapAmrapModalState.amrapType === 'activator' ? 'AMRAP Activador' : 'AMRAP Complementario'}
                </span>
                <h3 className="text-base font-black text-white mt-1.5">
                  Elegir alternativa para este finisher
                </h3>
                <p className="text-xs text-[#A8B0BB]">
                  Actual: <span className="font-bold text-white">{swapAmrapModalState.currentName}</span>
                </p>
              </div>
              <button
                onClick={() => setSwapAmrapModalState(null)}
                className="p-1.5 hover:bg-[#15181D] rounded-xl text-[#A8B0BB] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Aviso de gimnasio concurrido */}
            <div className="bg-[#15181D] border border-amber-500/25 rounded-2xl p-3 mb-3 text-xs text-amber-200/90 flex items-start gap-2.5 shrink-0">
              <span className="text-base shrink-0">💡</span>
              <p className="leading-snug">
                <strong>¿Poleas o máquinas ocupadas en el gym?</strong> Elige una opción de <em>Sin equipo / Suelo</em> o <em>Mancuerna/Disco</em> para continuar tu AMRAP sin esperas ni pausas.
              </p>
            </div>

            {/* Filtros rápidos de equipamiento */}
            <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1 shrink-0 scrollbar-none">
              {(
                [
                  { id: 'all', label: 'Todos' },
                  { id: 'bodyweight', label: 'Sin equipo / Suelo' },
                  { id: 'free_weight', label: 'Mancuerna / Disco' },
                  { id: 'cable_machine', label: 'Poleas / Máquinas' },
                  { id: 'bar', label: 'Barras / Paralelas' }
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFinisherEquipmentFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                    finisherEquipmentFilter === f.id
                      ? 'bg-purple-600 border-purple-500 text-white shadow'
                      : 'bg-[#15181D] border-[#282F38] text-[#A8B0BB] hover:text-white hover:border-[#3A434F]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Buscador de ejercicio */}
            <div className="relative mb-3 shrink-0">
              <Search className="w-3.5 h-3.5 text-[#717885] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={finisherSearchQuery}
                onChange={(e) => setFinisherSearchQuery(e.target.value)}
                placeholder="Buscar ejercicio (ej. crunch, plancha, elevación)..."
                className="w-full bg-[#15181D] border border-[#282F38] rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-[#717885] focus:outline-none focus:border-purple-500 transition-colors"
              />
              {finisherSearchQuery && (
                <button
                  onClick={() => setFinisherSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A8B0BB] hover:text-white text-xs cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Lista de alternativas del banco */}
            <div className="space-y-2 overflow-y-auto flex-1 pr-1">
              {(() => {
                const alternatives = getFinisherAlternatives(
                  swapAmrapModalState.amrapType,
                  swapAmrapModalState.currentName,
                  finisherEquipmentFilter,
                  finisherSearchQuery
                );

                if (alternatives.length === 0) {
                  return (
                    <div className="text-center py-8 text-[#A8B0BB] text-xs">
                      No se encontraron ejercicios con este filtro. Intenta seleccionar "Todos" o borrar la búsqueda.
                    </div>
                  );
                }

                return alternatives.map((alt) => {
                  const isCurrent = alt.name.toLowerCase().trim() === swapAmrapModalState.currentName.toLowerCase().trim();
                  return (
                    <div
                      key={alt.id}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-[#15181D] border-purple-500/40 opacity-75'
                          : 'bg-[#15181D] hover:bg-[#282F38] hover:border-purple-500/40 border-[#282F38]'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <span className="text-[10px] font-bold text-purple-300 bg-purple-950/60 border border-purple-800/40 px-2 py-0.5 rounded-md">
                            {alt.category}
                          </span>
                          <span className="text-[10px] font-bold text-[#A8B0BB] bg-[#20252C] border border-[#282F38] px-2 py-0.5 rounded-md">
                            {alt.equipment}
                          </span>
                        </div>
                        <p className="font-extrabold text-xs text-white">{alt.name}</p>
                        <p className="text-[11px] text-[#A8B0BB] mt-0.5 line-clamp-2">{alt.targetFocus}</p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setInspectedExercise(findExerciseDetail(alt.name))}
                          className="p-2 bg-[#20252C] hover:bg-[#282F38] text-[#A8B0BB] hover:text-white rounded-xl text-xs transition-colors border border-[#282F38] cursor-pointer"
                          title="Ver técnica detallada"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSwapAmrapExercise(alt.name)}
                          disabled={isCurrent}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-[#282F38] text-[#717885] cursor-not-allowed'
                              : 'bg-purple-600 hover:bg-purple-500 text-white shadow'
                          }`}
                        >
                          {isCurrent ? 'Actual' : 'Elegir'}
                        </button>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-3 mt-3 border-t border-[#282F38] shrink-0">
              <button
                onClick={() => setSwapAmrapModalState(null)}
                className="px-4 py-2 bg-[#15181D] hover:bg-[#282F38] text-[#A8B0BB] hover:text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cerrar
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
