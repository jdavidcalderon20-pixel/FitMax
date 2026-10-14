import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  MoreHorizontal, 
  HelpCircle, 
  Check, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  X, 
  Sparkles,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { Level } from '../types';
import { ExerciseDetail, findExerciseDetail, EXERCISE_BANK } from '../lib/exerciseBank';
import ExerciseDetailModal from './ExerciseDetailModal';
import { playBeepSound } from '../lib/sound';

export interface SetEntry {
  setNumber: number;
  weight: string;
  reps: string;
  completed: boolean;
  previousRecord?: string;
}

interface WorkoutSessionViewProps {
  dayId: number;
  dayName: string;
  exercises: {
    category: string;
    name: string;
    defaultSets?: number;
    defaultReps?: string;
    description?: string;
    restSeconds?: number;
  }[];
  selectedLevel: Level;
  nickname: string;
  initialExerciseIndex?: number;
  onClose: () => void;
  onFinishWorkout: () => void;
  onSwapExercise?: (index: number, newName: string) => void;
  onNotification?: (msg: string) => void;
}

export default function WorkoutSessionView({
  dayId,
  dayName,
  exercises,
  selectedLevel,
  nickname,
  initialExerciseIndex = 0,
  onClose,
  onFinishWorkout,
  onSwapExercise,
  onNotification
}: WorkoutSessionViewProps) {
  const [currentExIndex, setCurrentExIndex] = useState<number>(initialExerciseIndex);
  const [inspectedExercise, setInspectedExercise] = useState<ExerciseDetail | null>(null);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [showSwapModal, setShowSwapModal] = useState<boolean>(false);
  const [swapType, setSwapType] = useState<'easier' | 'harder' | 'alternative'>('alternative');

  // Estado de series por cada ejercicio: clave `${exerciseName}`
  const [exerciseSets, setExerciseSets] = useState<Record<string, SetEntry[]>>(() => {
    const initial: Record<string, SetEntry[]> = {};
    exercises.forEach((ex) => {
      const storageKey = `fit_sets_${nickname}_${selectedLevel}_d${dayId}_${ex.name}`;
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          initial[ex.name] = JSON.parse(saved);
          return;
        }
      } catch (e) {}

      // Generar series iniciales (por defecto 4 o defaultSets)
      const totalSets = ex.defaultSets || 4;
      const historyKey = `fit_gen_${nickname}_weekly_logs_v1`;
      let prevWeight = '24';
      let prevReps = '6';

      try {
        const logsRaw = localStorage.getItem(historyKey);
        if (logsRaw) {
          const logs = JSON.parse(logsRaw);
          const found = logs[`${selectedLevel}_day${dayId}_${ex.name}`];
          if (found && found.weight) prevWeight = found.weight;
          if (found && found.reps) prevReps = found.reps;
        }
      } catch (e) {}

      initial[ex.name] = Array.from({ length: totalSets }, (_, idx) => ({
        setNumber: idx + 1,
        weight: prevWeight,
        reps: prevReps,
        completed: false,
        previousRecord: `${prevWeight} kg × ${prevReps}`
      }));
    });
    return initial;
  });

  // Temporizador de descanso flotante
  const [restSecondsLeft, setRestSecondsLeft] = useState<number>(0);
  const [restTotalDuration, setRestTotalDuration] = useState<number>(90);
  const [restRunning, setRestRunning] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const currentExercise = exercises[currentExIndex] || exercises[0];
  const currentSets = exerciseSets[currentExercise?.name] || [];

  // Guardar en localStorage cada vez que cambien las series
  useEffect(() => {
    if (!currentExercise) return;
    const storageKey = `fit_sets_${nickname}_${selectedLevel}_d${dayId}_${currentExercise.name}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(currentSets));
    } catch (e) {}
  }, [currentSets, currentExercise, nickname, selectedLevel, dayId]);

  // Manejo del cronómetro de descanso
  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;
    if (restRunning && restSecondsLeft > 0) {
      timerId = setInterval(() => {
        setRestSecondsLeft((prev) => {
          if (prev <= 1) {
            setRestRunning(false);
            playBeepSound(isMuted);
            if (onNotification) onNotification('¡Descanso completado! A por la siguiente serie 💪');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [restRunning, restSecondsLeft, isMuted, onNotification]);

  const startRestTimer = (seconds: number) => {
    setRestTotalDuration(seconds);
    setRestSecondsLeft(seconds);
    setRestRunning(true);
  };

  const adjustRestTime = (secondsDelta: number) => {
    setRestSecondsLeft((prev) => Math.max(0, prev + secondsDelta));
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Actualizar kilos o reps de una serie
  const handleUpdateSet = (setNumber: number, field: 'weight' | 'reps', val: string) => {
    setExerciseSets((prev) => {
      const exName = currentExercise.name;
      const sets = prev[exName] ? [...prev[exName]] : [];
      const idx = sets.findIndex((s) => s.setNumber === setNumber);
      if (idx !== -1) {
        sets[idx] = { ...sets[idx], [field]: val };
      }
      return { ...prev, [exName]: sets };
    });
  };

  // Marcar/Desmarcar serie
  const handleToggleSet = (setNumber: number) => {
    setExerciseSets((prev) => {
      const exName = currentExercise.name;
      const sets = prev[exName] ? [...prev[exName]] : [];
      const idx = sets.findIndex((s) => s.setNumber === setNumber);
      if (idx !== -1) {
        const willComplete = !sets[idx].completed;
        sets[idx] = { ...sets[idx], completed: willComplete };

        if (willComplete) {
          playBeepSound(true);
          // Autoarranque de descanso (90 segundos por defecto o según ejercicio)
          const suggestedRest = currentExercise.restSeconds || 90;
          startRestTimer(suggestedRest);

          // Si hay siguiente serie vacía, copiar los kilos
          if (idx + 1 < sets.length && !sets[idx + 1].weight) {
            sets[idx + 1].weight = sets[idx].weight;
          }
        }
      }
      return { ...prev, [exName]: sets };
    });
  };

  // Calcular subtítulo simple del ejercicio
  const getExerciseSimpleSubtitle = (name: string) => {
    const detail = findExerciseDetail(name);
    if (/pendlay/i.test(name)) return 'remo desde el suelo';
    if (/meadows/i.test(name)) return 'remo en punta de barra (unilateral)';
    if (/bulgar/i.test(name)) return 'sentadilla a una pierna en banco';
    if (/rdl|rumano/i.test(name)) return 'peso muerto con bajada lenta';
    if (/hip thrust/i.test(name)) return 'empuje de cadera con soporte';
    if (/press.*banca|press.*plano/i.test(name)) return 'empuje de pecho en banco plano';
    if (/sissy/i.test(name)) return 'sentadilla inclinando torso atrás';
    if (/press.*militar|hombro/i.test(name)) return 'empuje vertical de hombros';
    return detail.targetFocus || detail.muscleGroup || 'movimiento guiado';
  };

  // Calcular RIR e indicación clara
  const getExerciseGuidanceText = (ex: typeof currentExercise) => {
    const setsCount = ex.defaultSets || 4;
    const repsRange = ex.defaultReps || '5 a 6 repeticiones';
    return `${setsCount} series de ${repsRange}. Te deben quedar 2 o 3 repeticiones en reserva.`;
  };

  // Navegar al siguiente ejercicio o terminar
  const handleNextOrFinish = () => {
    if (currentExIndex < exercises.length - 1) {
      setCurrentExIndex(currentExIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onFinishWorkout();
    }
  };

  // Opciones de sustitución (Más fácil, Más difícil, Alternativa)
  const getSwapCandidates = () => {
    const detail = findExerciseDetail(currentExercise.name);
    if (swapType === 'easier') {
      return EXERCISE_BANK.filter(
        (b) => b.id !== detail.id && b.muscleGroup === detail.muscleGroup && (b.equipment === 'Mancuernas' || b.equipment === 'Máquina' || b.equipment === 'Peso corporal')
      ).slice(0, 4);
    }
    if (swapType === 'harder') {
      return EXERCISE_BANK.filter(
        (b) => b.id !== detail.id && b.muscleGroup === detail.muscleGroup && (b.level === 'C' || b.equipment === 'Barra')
      ).slice(0, 4);
    }
    return EXERCISE_BANK.filter(
      (b) => b.id !== detail.id && b.muscleGroup === detail.muscleGroup
    ).slice(0, 4);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#15181D] text-[#F4F2ED] flex flex-col overflow-y-auto animate-fadeIn">
      {/* CABECERA SUPERIOR DE LA SESIÓN */}
      <header className="sticky top-0 z-20 bg-[#15181D]/95 backdrop-blur-md border-b border-[#20252C] px-4 py-3 flex items-center justify-between">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-xl bg-[#20252C] hover:bg-[#282F38] text-[#F4F2ED] flex items-center justify-center transition-all active:scale-95 cursor-pointer"
          title="Volver"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h2 className="text-sm font-black tracking-tight text-center capitalize">
          {dayName || `Día ${dayId}: entrenamiento`}
        </h2>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-10 h-10 rounded-xl bg-[#20252C] hover:bg-[#282F38] text-[#A8B0BB] hover:text-[#F4F2ED] flex items-center justify-center transition-all active:scale-95 cursor-pointer"
            title="Opciones"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#20252C] border border-[#282F38] rounded-2xl p-2 shadow-2xl z-30 space-y-1">
              <button
                onClick={() => {
                  setInspectedExercise(findExerciseDetail(currentExercise.name));
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-[#15181D] rounded-xl text-[#F4F2ED] flex items-center gap-2"
              >
                <HelpCircle className="w-4 h-4 text-[#5B8DEF]" />
                <span>Ver técnica completa</span>
              </button>
              <button
                onClick={() => {
                  setIsMuted(!isMuted);
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-[#15181D] rounded-xl text-[#A8B0BB] flex items-center gap-2"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                <span>{isMuted ? 'Sonido desactivado' : 'Sonido activado'}</span>
              </button>
              <button
                onClick={() => {
                  if (window.confirm('¿Reiniciar las series de este ejercicio?')) {
                    setExerciseSets((prev) => ({
                      ...prev,
                      [currentExercise.name]: prev[currentExercise.name].map((s) => ({ ...s, completed: false }))
                    }));
                  }
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-rose-950/40 text-rose-400 rounded-xl flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reiniciar ejercicio</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-5 flex flex-col justify-between pb-32">
        <div>
          {/* BARRA DE PROGRESO SEGMENTADA */}
          <div className="space-y-1.5 mb-6">
            <div className="grid grid-cols-5 gap-1.5 w-full">
              {exercises.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx < currentExIndex
                      ? 'bg-[#1FD08A]'
                      : idx === currentExIndex
                      ? 'bg-[#1FD08A]'
                      : 'bg-[#282F38]'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-[#A8B0BB] font-medium pt-1">
              Ejercicio {currentExIndex + 1} de {exercises.length}
            </p>
          </div>

          {/* TÍTULO DEL EJERCICIO & BOTÓN DE AYUDA (?) */}
          <div className="mb-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-[#F4F2ED]">
                  {currentExercise.name}
                </h1>
                <p className="text-sm text-[#A8B0BB] font-normal mt-0.5">
                  {getExerciseSimpleSubtitle(currentExercise.name)}
                </p>
              </div>

              <button
                onClick={() => setInspectedExercise(findExerciseDetail(currentExercise.name))}
                className="w-10 h-10 rounded-full bg-[#20252C] hover:bg-[#282F38] border border-[#282F38] flex items-center justify-center text-[#F4F2ED] font-black text-lg transition-all active:scale-90 shadow-md shrink-0 cursor-pointer"
                title="Ver guía técnica del ejercicio"
              >
                ?
              </button>
            </div>

            {/* FRASE DE GUÍA SIN JERGA (RIR en lenguaje de persona) */}
            <p className="text-xs text-[#A8B0BB] mt-3 leading-relaxed">
              {getExerciseGuidanceText(currentExercise)}
            </p>
          </div>

          {/* TABLA DE SERIES (DISEÑO IDÉNTICO A LA IMAGEN 1) */}
          <div className="bg-[#20252C] rounded-2xl p-4 shadow-xl border border-[#282F38] mb-5">
            {/* Cabecera de la tabla */}
            <div className="grid grid-cols-12 gap-2 text-[11px] font-bold text-[#A8B0BB] mb-3 px-1">
              <span className="col-span-2 text-center">Serie</span>
              <span className="col-span-4 text-center">Anterior</span>
              <span className="col-span-3 text-center">Kilos</span>
              <span className="col-span-2 text-center">Reps</span>
              <span className="col-span-1 text-center"></span>
            </div>

            {/* Filas de series */}
            <div className="space-y-2.5">
              {currentSets.map((s, sIdx) => {
                const isActive = !s.completed && (sIdx === 0 || currentSets[sIdx - 1]?.completed);
                return (
                  <div
                    key={s.setNumber}
                    className={`grid grid-cols-12 gap-2 items-center py-1 px-1 rounded-xl transition-all ${
                      s.completed ? 'opacity-85' : ''
                    }`}
                  >
                    {/* Número de Serie */}
                    <span className="col-span-2 text-center text-sm font-bold text-[#F4F2ED]">
                      {s.setNumber}
                    </span>

                    {/* Registro Anterior */}
                    <span className="col-span-4 text-center text-xs text-[#A8B0BB] font-mono tabular-nums">
                      {s.previousRecord || '—'}
                    </span>

                    {/* Input Kilos */}
                    <div className="col-span-3">
                      <input
                        type="number"
                        inputMode="decimal"
                        value={s.weight}
                        onChange={(e) => handleUpdateSet(s.setNumber, 'weight', e.target.value)}
                        className={`w-full bg-[#15181D] rounded-xl py-2 px-2 text-center text-sm font-bold text-[#F4F2ED] font-mono tabular-nums focus:outline-none transition-all ${
                          isActive
                            ? 'border-2 border-[#1FD08A] shadow-[0_0_10px_rgba(31,208,138,0.2)]'
                            : 'border border-[#282F38]'
                        }`}
                      />
                    </div>

                    {/* Input Reps */}
                    <div className="col-span-2">
                      <input
                        type="number"
                        inputMode="numeric"
                        value={s.reps}
                        onChange={(e) => handleUpdateSet(s.setNumber, 'reps', e.target.value)}
                        className={`w-full bg-[#15181D] rounded-xl py-2 px-2 text-center text-sm font-bold text-[#F4F2ED] font-mono tabular-nums focus:outline-none transition-all ${
                          isActive
                            ? 'border-2 border-[#1FD08A] shadow-[0_0_10px_rgba(31,208,138,0.2)]'
                            : 'border border-[#282F38]'
                        }`}
                      />
                    </div>

                    {/* Botón de Check */}
                    <div className="col-span-1 flex justify-center">
                      <button
                        onClick={() => handleToggleSet(s.setNumber)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                          s.completed
                            ? 'bg-[#1FD08A] text-[#15181D] shadow-[0_0_12px_rgba(31,208,138,0.4)] scale-105'
                            : 'border-2 border-[#282F38] hover:border-[#1FD08A] bg-transparent text-transparent'
                        }`}
                        title={s.completed ? 'Serie completada' : 'Marcar serie'}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CHIPS DE ACCIÓN RÁPIDA: Más fácil / Más difícil / Alternativa */}
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => {
                setSwapType('easier');
                setShowSwapModal(true);
              }}
              className="flex-1 bg-[#20252C] hover:bg-[#282F38] text-[#F4F2ED] border border-[#282F38] py-2.5 px-3 rounded-full text-xs font-bold transition-all text-center cursor-pointer active:scale-95"
            >
              Más fácil
            </button>

            <button
              onClick={() => {
                setSwapType('harder');
                setShowSwapModal(true);
              }}
              className="flex-1 bg-[#20252C] hover:bg-[#282F38] text-[#F4F2ED] border border-[#282F38] py-2.5 px-3 rounded-full text-xs font-bold transition-all text-center cursor-pointer active:scale-95"
            >
              Más difícil
            </button>

            <button
              onClick={() => {
                setSwapType('alternative');
                setShowSwapModal(true);
              }}
              className="flex-1 bg-[#20252C] hover:bg-[#282F38] text-[#F4F2ED] border border-[#282F38] py-2.5 px-3 rounded-full text-xs font-bold transition-all text-center cursor-pointer active:scale-95"
            >
              Alternativa
            </button>
          </div>
        </div>

        {/* PARTE INFERIOR: TEMPORIZADOR FLOTANTE & BOTÓN PRINCIPAL */}
        <div className="space-y-4">
          {/* TEMPORIZADOR DE DESCANSO FLOTANTE */}
          <div className="bg-[#20252C] border border-[#282F38] rounded-2xl p-3.5 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#A8B0BB] font-semibold">Descanso</span>
              <span className="text-2xl font-black text-[#F4F2ED] font-mono tabular-nums tracking-tight">
                {formatTimer(restSecondsLeft)}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => adjustRestTime(-15)}
                className="bg-[#15181D] hover:bg-[#282F38] text-[#A8B0BB] hover:text-[#F4F2ED] font-bold text-xs px-2.5 py-1.5 rounded-xl border border-[#282F38] transition-all cursor-pointer active:scale-90"
              >
                −15 s
              </button>

              <button
                onClick={() => adjustRestTime(15)}
                className="bg-[#15181D] hover:bg-[#282F38] text-[#A8B0BB] hover:text-[#F4F2ED] font-bold text-xs px-2.5 py-1.5 rounded-xl border border-[#282F38] transition-all cursor-pointer active:scale-90"
              >
                +15 s
              </button>
            </div>
          </div>

          {/* BOTÓN PRINCIPAL: SIGUIENTE EJERCICIO O TERMINAR */}
          <button
            onClick={handleNextOrFinish}
            className="w-full bg-[#1FD08A] hover:bg-[#1ab87a] text-[#15181D] font-black py-4 px-6 rounded-2xl text-base transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(31,208,138,0.35)] cursor-pointer"
          >
            <span>
              {currentExIndex < exercises.length - 1 ? 'Siguiente ejercicio' : `Terminar ${dayName || 'sesión'}`}
            </span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </main>

      {/* MODAL DE CAMBIO / VARIACIÓN DE EJERCICIO */}
      {showSwapModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#20252C] border border-[#282F38] rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#282F38]">
              <h3 className="text-sm font-bold text-[#F4F2ED]">
                {swapType === 'easier'
                  ? 'Variante más fácil'
                  : swapType === 'harder'
                  ? 'Variante más difícil'
                  : 'Alternativa equivalente'}
              </h3>
              <button
                onClick={() => setShowSwapModal(false)}
                className="text-[#A8B0BB] hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#A8B0BB] leading-relaxed">
              Selecciona una opción adaptada a tu necesidad sin alterar el balance muscular de tu día:
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {getSwapCandidates().map((candidate) => (
                <button
                  key={candidate.id}
                  onClick={() => {
                    if (onSwapExercise) onSwapExercise(currentExIndex, candidate.name);
                    setShowSwapModal(false);
                    if (onNotification) onNotification(`Ejercicio cambiado a: ${candidate.name}`);
                  }}
                  className="w-full text-left p-3 rounded-2xl bg-[#15181D] hover:bg-[#282F38] border border-[#282F38] text-xs transition-all space-y-1"
                >
                  <p className="font-bold text-[#F4F2ED]">{candidate.name}</p>
                  <p className="text-[10px] text-[#A8B0BB]">{candidate.equipment} · {candidate.muscleGroup}</p>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowSwapModal(false)}
              className="w-full bg-[#15181D] hover:bg-[#282F38] text-[#A8B0BB] py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE TÉCNICA DEL EJERCICIO (Ficha completa con fotos reales) */}
      {inspectedExercise && (
        <ExerciseDetailModal
          exercise={inspectedExercise}
          onClose={() => setInspectedExercise(null)}
        />
      )}
    </div>
  );
}
