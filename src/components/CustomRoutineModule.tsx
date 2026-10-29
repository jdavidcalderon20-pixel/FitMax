import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  Play, 
  Calendar, 
  Dumbbell, 
  Flame, 
  CheckCircle2, 
  ChevronRight, 
  Copy, 
  Clock, 
  Save, 
  X, 
  Info,
  Check
} from 'lucide-react';
import { Level } from '../types';
import { ExerciseDetail, findExerciseDetail, EXERCISE_BANK } from '../lib/exerciseBank';
import { getCustomExercises } from '../lib/customExercises';
import { 
  CustomRoutine, 
  CustomRoutineDay, 
  CustomExerciseItem, 
  getCustomRoutines, 
  saveCustomRoutine, 
  deleteCustomRoutine 
} from '../lib/customRoutines';
import WorkoutSessionView from './WorkoutSessionView';
import CustomExerciseModal from './CustomExerciseModal';
import ExerciseDetailModal from './ExerciseDetailModal';

interface CustomRoutineModuleProps {
  nickname: string;
  selectedLevel: Level;
  onNotification?: (msg: string) => void;
}

export default function CustomRoutineModule({
  nickname,
  selectedLevel,
  onNotification
}: CustomRoutineModuleProps) {
  const [routines, setRoutines] = useState<CustomRoutine[]>(() => getCustomRoutines(nickname));
  const [activeRoutineId, setActiveRoutineId] = useState<string | null>(() => {
    const list = getCustomRoutines(nickname);
    return list.length > 0 ? list[0].id : null;
  });

  // Modo edición / creación de rutina
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingRoutine, setEditingRoutine] = useState<CustomRoutine | null>(null);

  // Modal para agregar ejercicio a un día
  const [targetDayIndex, setTargetDayIndex] = useState<number | null>(null);
  const [showAddExModal, setShowAddExModal] = useState<boolean>(false);
  const [showCreateCustomExModal, setShowCreateCustomExModal] = useState<boolean>(false);
  const [searchExQuery, setSearchExQuery] = useState<string>('');
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<string>('Todos');

  // Vista de sesión activa (WorkoutSessionView)
  const [trainingDay, setTrainingDay] = useState<{ day: CustomRoutineDay; routineName: string; routineId: string } | null>(null);
  const [inspectedExercise, setInspectedExercise] = useState<ExerciseDetail | null>(null);

  // Progreso de semanas e historial de sesiones de rutinas personalizadas
  const [routineProgress, setRoutineProgress] = useState<
    Record<string, { currentWeek: number; completedDays: Record<string, number>; history: { date: number; dayName: string; week: number }[] }>
  >(() => {
    try {
      const raw = localStorage.getItem(`fit_custom_routine_progress_${nickname}`);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const saveProgressState = (next: typeof routineProgress) => {
    setRoutineProgress(next);
    try {
      localStorage.setItem(`fit_custom_routine_progress_${nickname}`, JSON.stringify(next));
    } catch {}
  };

  const cleanNumericReps = (val: string) => {
    return String(val || '8-10')
      .replace(/reps?|repeticiones/gi, '')
      .trim() || '8-10';
  };

  // Recargar rutinas
  const reloadRoutines = () => {
    const list = getCustomRoutines(nickname);
    setRoutines(list);
    if (!activeRoutineId && list.length > 0) {
      setActiveRoutineId(list[0].id);
    }
  };

  useEffect(() => {
    reloadRoutines();
  }, [nickname]);

  const activeRoutine = routines.find((r) => r.id === activeRoutineId) || routines[0] || null;

  // Iniciar creación de nueva rutina desde cero
  const handleStartNewRoutine = () => {
    const newRoutine: CustomRoutine = {
      id: `routine_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: 'Mi Nueva Rutina Personalizada',
      description: 'Estructurada a mi medida sin interferir en el plan oficial.',
      targetWeeks: 8,
      createdAt: Date.now(),
      days: [
        {
          id: 1,
          name: 'Día 1: Torso / Fuerza',
          subtitle: 'Empuje y tracción',
          exercises: [
            {
              id: 'ex_1',
              name: 'Press de banca con barra',
              category: 'Pecho',
              defaultSets: 4,
              defaultReps: '6-8',
              restSeconds: 90
            },
            {
              id: 'ex_2',
              name: 'Remo Pendlay con barra (Dead-Stop desde el suelo)',
              category: 'Espalda',
              defaultSets: 4,
              defaultReps: '6-8',
              restSeconds: 90
            }
          ]
        },
        {
          id: 2,
          name: 'Día 2: Pierna / Glúteo',
          subtitle: 'Cuádriceps e isquios',
          exercises: [
            {
              id: 'ex_3',
              name: 'Sentadilla trasera con barra (Back Squat)',
              category: 'Cuádriceps',
              defaultSets: 4,
              defaultReps: '6-8',
              restSeconds: 120
            },
            {
              id: 'ex_4',
              name: 'Hip Thrust con barra (o mancuerna)',
              category: 'Glúteos',
              defaultSets: 4,
              defaultReps: '8-10',
              restSeconds: 90
            }
          ]
        }
      ]
    };
    setEditingRoutine(newRoutine);
    setIsEditing(true);
  };

  // Guardar cambios de la rutina en edición
  const handleSaveRoutineEdits = () => {
    if (!editingRoutine) return;
    if (!editingRoutine.name.trim()) {
      if (onNotification) onNotification('Asigna un nombre a tu rutina');
      return;
    }
    saveCustomRoutine(nickname, editingRoutine);
    reloadRoutines();
    setActiveRoutineId(editingRoutine.id);
    setIsEditing(false);
    setEditingRoutine(null);
    if (onNotification) onNotification(`¡Rutina "${editingRoutine.name}" guardada con éxito!`);
  };

  // Eliminar rutina
  const handleDeleteRoutine = (id: string, name: string) => {
    if (window.confirm(`¿Seguro que deseas eliminar la rutina "${name}"?`)) {
      deleteCustomRoutine(nickname, id);
      reloadRoutines();
      if (activeRoutineId === id) {
        const remaining = routines.filter((r) => r.id !== id);
        setActiveRoutineId(remaining.length > 0 ? remaining[0].id : null);
      }
      if (onNotification) onNotification(`Rutina "${name}" eliminada`);
    }
  };

  // Agregar un día nuevo a la rutina en edición
  const handleAddDayToRoutine = () => {
    if (!editingRoutine) return;
    const newDayId = editingRoutine.days.length + 1;
    const newDay: CustomRoutineDay = {
      id: newDayId,
      name: `Día ${newDayId}: Enfoque libre`,
      subtitle: 'Personalizado',
      exercises: []
    };
    setEditingRoutine({
      ...editingRoutine,
      days: [...editingRoutine.days, newDay]
    });
  };

  // Eliminar un día
  const handleRemoveDay = (dayIdx: number) => {
    if (!editingRoutine) return;
    if (editingRoutine.days.length <= 1) {
      if (onNotification) onNotification('La rutina debe contener al menos un día');
      return;
    }
    const updatedDays = editingRoutine.days.filter((_, idx) => idx !== dayIdx).map((d, i) => ({
      ...d,
      id: i + 1,
      name: d.name.replace(/^Día \d+:/, `Día ${i + 1}:`)
    }));
    setEditingRoutine({
      ...editingRoutine,
      days: updatedDays
    });
  };

  // Quitar ejercicio de un día
  const handleRemoveExerciseFromDay = (dayIdx: number, exIdx: number) => {
    if (!editingRoutine) return;
    const updatedDays = [...editingRoutine.days];
    updatedDays[dayIdx].exercises = updatedDays[dayIdx].exercises.filter((_, idx) => idx !== exIdx);
    setEditingRoutine({
      ...editingRoutine,
      days: updatedDays
    });
  };

  // Modificar series o reps de un ejercicio
  const handleUpdateExConfig = (
    dayIdx: number, 
    exIdx: number, 
    field: 'defaultSets' | 'defaultReps' | 'restSeconds', 
    val: any
  ) => {
    if (!editingRoutine) return;
    const updatedDays = [...editingRoutine.days];
    updatedDays[dayIdx].exercises[exIdx] = {
      ...updatedDays[dayIdx].exercises[exIdx],
      [field]: val
    };
    setEditingRoutine({
      ...editingRoutine,
      days: updatedDays
    });
  };

  // Agregar ejercicio seleccionado al día
  const handleSelectExerciseForDay = (ex: ExerciseDetail) => {
    if (targetDayIndex === null || !editingRoutine) return;
    const updatedDays = [...editingRoutine.days];
    const newExItem: CustomExerciseItem = {
      id: `ex_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: ex.name,
      category: ex.muscleGroup,
      defaultSets: 4,
      defaultReps: '8-10',
      restSeconds: 90,
      description: ex.targetFocus
    };
    updatedDays[targetDayIndex].exercises.push(newExItem);
    setEditingRoutine({
      ...editingRoutine,
      days: updatedDays
    });
    setShowAddExModal(false);
    if (onNotification) onNotification(`Ejercicio "${ex.name}" añadido al Día ${targetDayIndex + 1}`);
  };

  // Si el usuario decide entrenar un día con la vista de sesión activa
  if (trainingDay) {
    return (
      <WorkoutSessionView
        dayId={800 + trainingDay.day.id}
        dayName={`${trainingDay.routineName} — ${trainingDay.day.name}`}
        exercises={trainingDay.day.exercises.map((e) => ({
          name: e.name,
          category: e.category,
          defaultSets: e.defaultSets,
          defaultReps: `${cleanNumericReps(e.defaultReps)} reps`,
          restSeconds: e.restSeconds,
          description: e.description
        }))}
        selectedLevel={selectedLevel}
        nickname={nickname}
        onClose={() => setTrainingDay(null)}
        onFinishWorkout={() => {
          const rId = trainingDay.routineId;
          const prevProg = routineProgress[rId] || { currentWeek: 1, completedDays: {}, history: [] };
          const dayKey = `w${prevProg.currentWeek}_d${trainingDay.day.id}`;
          const nextCompleted = { ...prevProg.completedDays, [dayKey]: Date.now() };
          const nextHistory = [
            { date: Date.now(), dayName: trainingDay.day.name, week: prevProg.currentWeek },
            ...(prevProg.history || []).slice(0, 49)
          ];
          saveProgressState({
            ...routineProgress,
            [rId]: {
              ...prevProg,
              completedDays: nextCompleted,
              history: nextHistory
            }
          });
          setTrainingDay(null);
          if (onNotification) onNotification(`¡Entrenamiento "${trainingDay.day.name}" registrado en tu historial! 🏆`);
        }}
        onNotification={onNotification}
      />
    );
  }

  const customExercises = getCustomExercises(nickname);
  const combinedBank = [...customExercises, ...EXERCISE_BANK];
  const filteredBank = combinedBank.filter((e) => {
    const matchesSearch = e.name.toLowerCase().includes(searchExQuery.toLowerCase()) || 
                          e.muscleGroup.toLowerCase().includes(searchExQuery.toLowerCase());
    const matchesMuscle = selectedMuscleFilter === 'Todos' || e.muscleGroup === selectedMuscleFilter;
    return matchesSearch && matchesMuscle;
  });

  return (
    <div className="w-full space-y-5 animate-fadeIn text-[#F4F2ED]">
      {/* CABECERA PRINCIPAL DEL MÓDULO */}
      <div className="bg-[#20252C] rounded-3xl p-5 border border-[#282F38] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#1FD08A] bg-[#1FD08A]/15 border border-[#1FD08A]/30 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              100% Personalizado e Independiente
            </span>
            <span className="text-xs text-[#A8B0BB]">
              El Plan Semanal oficial permanece protegido
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Gestor de Rutinas Personalizadas
          </h2>
          <p className="text-xs text-[#A8B0BB] mt-0.5">
            Estructura las semanas, días, series, repeticiones y ejercicios que tú decidas.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleStartNewRoutine}
            className="flex items-center gap-2 bg-[#1FD08A] hover:bg-[#1ab87a] text-[#15181D] font-black px-4 py-2.5 rounded-2xl text-xs transition-all shadow-[0_4px_15px_rgba(31,208,138,0.3)] cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Crear nueva rutina</span>
          </button>
        </div>
      </div>

      {/* SELECTOR DE RUTINAS EXISTENTES */}
      {routines.length > 0 ? (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {routines.map((r) => {
            const isSelected = activeRoutine?.id === r.id;
            return (
              <button
                key={r.id}
                onClick={() => {
                  setActiveRoutineId(r.id);
                  setIsEditing(false);
                  setEditingRoutine(null);
                }}
                className={`px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-[#1FD08A]/15 border-[#1FD08A] text-[#1FD08A] shadow-md'
                    : 'bg-[#20252C] border-[#282F38] text-[#A8B0BB] hover:text-white'
                }`}
              >
                <Dumbbell className="w-3.5 h-3.5" />
                <span>{r.name}</span>
                <span className="text-[10px] opacity-70 font-mono">({r.days.length} días)</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#20252C] border border-[#282F38] rounded-3xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#1FD08A]/15 border border-[#1FD08A]/30 flex items-center justify-center mx-auto text-[#1FD08A]">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-white">No tienes rutinas personalizadas creadas</h3>
          <p className="text-xs text-[#A8B0BB] max-w-sm mx-auto leading-relaxed">
            Diseña tu rutina a medida eligiendo semanas, días y ejercicios de tu biblioteca o creados por ti.
          </p>
          <button
            type="button"
            onClick={handleStartNewRoutine}
            className="inline-flex items-center gap-2 bg-[#1FD08A] hover:bg-[#1ab87a] text-[#15181D] font-black px-4 py-2.5 rounded-2xl text-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Crear mi primera rutina</span>
          </button>
        </div>
      )}

      {/* DETALLE O EDITOR DE LA RUTINA ACTIVA */}
      {activeRoutine && !isEditing && (
        <div className="space-y-4">
          {/* BARRA SUPERIOR DE ACCIONES Y PROGRESO POR SEMANA DE LA RUTINA */}
          <div className="bg-[#20252C] rounded-3xl p-4 sm:p-5 border border-[#282F38] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-white">{activeRoutine.name}</h3>
                <span className="text-[10px] bg-[#1FD08A]/15 border border-[#1FD08A]/30 px-2.5 py-0.5 rounded-full text-[#1FD08A] font-black font-mono">
                  Semana {routineProgress[activeRoutine.id]?.currentWeek || 1} de {activeRoutine.targetWeeks}
                </span>
              </div>
              {activeRoutine.description && (
                <p className="text-xs text-[#A8B0BB] mt-1">{activeRoutine.description}</p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Stepper de Semana de la Rutina Personalizada */}
              <div className="flex items-center gap-1 bg-[#15181D] border border-[#282F38] rounded-xl px-2 py-1">
                <span className="text-[10px] text-[#A8B0BB] font-bold mr-1">Semana:</span>
                <button
                  type="button"
                  onClick={() => {
                    const prevProg = routineProgress[activeRoutine.id] || { currentWeek: 1, completedDays: {}, history: [] };
                    const nextW = Math.max(1, prevProg.currentWeek - 1);
                    saveProgressState({
                      ...routineProgress,
                      [activeRoutine.id]: { ...prevProg, currentWeek: nextW }
                    });
                  }}
                  className="w-6 h-6 rounded-lg bg-[#20252C] hover:bg-[#282F38] text-xs font-black text-white"
                >
                  -
                </button>
                <span className="text-xs font-mono font-black text-[#1FD08A] px-1.5">
                  {routineProgress[activeRoutine.id]?.currentWeek || 1}/{activeRoutine.targetWeeks}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const prevProg = routineProgress[activeRoutine.id] || { currentWeek: 1, completedDays: {}, history: [] };
                    if (prevProg.currentWeek >= activeRoutine.targetWeeks) {
                      if (
                        window.confirm(
                          `🏆 ¡Felicitaciones! Has alcanzado el final de tu ciclo de ${activeRoutine.targetWeeks} ${
                            activeRoutine.targetWeeks === 1 ? 'semana' : 'semanas'
                          } en "${activeRoutine.name}".\n\n¿Deseas reiniciar el ciclo desde la Semana 1 conservando todo tu historial de sesiones?`
                        )
                      ) {
                        saveProgressState({
                          ...routineProgress,
                          [activeRoutine.id]: { ...prevProg, currentWeek: 1, completedDays: {} }
                        });
                        if (onNotification) {
                          onNotification(`🔄 ¡Nuevo ciclo iniciado en la Semana 1 de ${activeRoutine.targetWeeks}!`);
                        }
                      }
                      return;
                    }
                    const nextW = Math.min(activeRoutine.targetWeeks, prevProg.currentWeek + 1);
                    saveProgressState({
                      ...routineProgress,
                      [activeRoutine.id]: { ...prevProg, currentWeek: nextW }
                    });
                  }}
                  className="w-6 h-6 rounded-lg bg-[#20252C] hover:bg-[#282F38] text-xs font-black text-white"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingRoutine(JSON.parse(JSON.stringify(activeRoutine)));
                  setIsEditing(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-[#15181D] hover:bg-[#282F38] border border-[#282F38] text-xs font-bold text-white flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#5B8DEF]" />
                <span>Editar estructura</span>
              </button>

              <button
                type="button"
                onClick={() => handleDeleteRoutine(activeRoutine.id, activeRoutine.name)}
                className="p-2 rounded-xl bg-[#15181D] hover:bg-rose-950/40 border border-[#282F38] text-rose-400 transition-all cursor-pointer"
                title="Eliminar rutina"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* DÍAS DE LA RUTINA */}
          <div className="grid grid-cols-1 gap-4">
            {activeRoutine.days.map((day) => {
              const curWeek = routineProgress[activeRoutine.id]?.currentWeek || 1;
              const isDayDoneThisWeek = Boolean(
                routineProgress[activeRoutine.id]?.completedDays?.[`w${curWeek}_d${day.id}`]
              );
              return (
                <div
                  key={day.id}
                  className={`bg-[#20252C] border rounded-3xl p-4 sm:p-5 shadow-lg space-y-4 ${
                    isDayDoneThisWeek ? 'border-[#1FD08A]/50' : 'border-[#282F38]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#282F38]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-[#1FD08A] tracking-wider">
                          Día {day.id} de {activeRoutine.days.length} · Semana {curWeek}
                        </span>
                        {isDayDoneThisWeek && (
                          <span className="text-[10px] font-black bg-[#1FD08A]/15 text-[#1FD08A] border border-[#1FD08A]/30 px-2 py-0.5 rounded-full">
                            Completado esta semana ✓
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm sm:text-base font-black text-white mt-0.5">{day.name}</h4>
                      {day.subtitle && <p className="text-xs text-[#A8B0BB]">{day.subtitle}</p>}
                    </div>

                    <button
                      type="button"
                      onClick={() => setTrainingDay({ day, routineName: activeRoutine.name, routineId: activeRoutine.id })}
                      className="flex items-center gap-2 bg-[#1FD08A] hover:bg-[#1ab87a] text-[#15181D] font-black px-4 py-2.5 rounded-xl text-xs transition-all shadow-[0_4px_15px_rgba(31,208,138,0.25)] self-start sm:self-auto cursor-pointer active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>{isDayDoneThisWeek ? 'Repetir este día' : 'Entrenar este día'}</span>
                    </button>
                  </div>

                  {/* LISTADO DE EJERCICIOS DEL DÍA */}
                  {day.exercises.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {day.exercises.map((ex, exIdx) => (
                        <div
                          key={ex.id || exIdx}
                          onClick={() => setInspectedExercise(findExerciseDetail(ex.name))}
                          className="bg-[#15181D] hover:bg-[#282F38] border border-[#282F38] hover:border-[#1FD08A]/40 rounded-2xl p-3 transition-all cursor-pointer group flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-[10px] font-bold text-[#A8B0BB] bg-[#20252C] px-2 py-0.5 rounded-lg">
                                {ex.category}
                              </span>
                              <span className="text-[10px] font-mono font-bold text-[#1FD08A] bg-[#1FD08A]/10 px-2 py-0.5 rounded-lg">
                                {ex.defaultSets} × {cleanNumericReps(ex.defaultReps)} reps
                              </span>
                            </div>
                            <p className="text-xs font-black text-white group-hover:text-[#1FD08A] transition-colors line-clamp-2">
                              {ex.name}
                            </p>
                          </div>
                          <div className="mt-2 pt-2 border-t border-[#282F38]/50 flex items-center justify-between text-[10px] text-[#A8B0BB]">
                            <span>⏱️ {ex.restSeconds || 90}s descanso</span>
                            <span className="text-[#1FD08A] font-bold">Ver técnica</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#A8B0BB] italic py-2">
                      No has agregado ejercicios a este día todavía. Edita la rutina para añadir ejercicios.
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* HISTORIAL DE SESIONES REALIZADAS CON ESTA RUTINA */}
          {(routineProgress[activeRoutine.id]?.history?.length || 0) > 0 && (
            <div className="bg-[#20252C] border border-[#282F38] rounded-3xl p-4 sm:p-5 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#1FD08A]">
                  Historial de sesiones realizadas ({routineProgress[activeRoutine.id].history.length})
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('¿Deseas reiniciar la rutina a la Semana 1 para volver a realizarla conservando tu historial?')) {
                      const prevProg = routineProgress[activeRoutine.id];
                      saveProgressState({
                        ...routineProgress,
                        [activeRoutine.id]: {
                          ...prevProg,
                          currentWeek: 1,
                          completedDays: {}
                        }
                      });
                      if (onNotification) onNotification('Rutina reiniciada a la Semana 1 lista para un nuevo ciclo.');
                    }
                  }}
                  className="text-[11px] font-bold text-[#5B8DEF] hover:underline cursor-pointer"
                >
                  Reiniciar ciclo a Semana 1
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {routineProgress[activeRoutine.id].history.slice(0, 8).map((h, i) => (
                  <span
                    key={i}
                    className="text-[11px] bg-[#15181D] border border-[#282F38] px-3 py-1 rounded-xl text-[#F4F2ED]"
                  >
                    ✓ <strong>{h.dayName}</strong> (Sem {h.week}) ·{' '}
                    <span className="text-[#A8B0BB]">
                      {new Date(h.date).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* EDITOR DE RUTINA EN VIVO */}
      {isEditing && editingRoutine && (
        <div className="bg-[#20252C] border-2 border-[#1FD08A]/40 rounded-3xl p-5 shadow-2xl space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-[#282F38]">
            <div className="flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-[#1FD08A]" />
              <h3 className="text-base font-black text-white">Editor de Rutina Personalizada</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditingRoutine(null);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#15181D] hover:bg-[#282F38] text-xs font-bold text-[#A8B0BB]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveRoutineEdits}
                className="px-4 py-2 rounded-xl bg-[#1FD08A] hover:bg-[#1ab87a] text-xs font-black text-[#15181D] flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Guardar rutina</span>
              </button>
            </div>
          </div>

          {/* CAMPOS MAESTROS: NOMBRE Y SEMANAS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-[#A8B0BB]">Nombre de la rutina</label>
              <input
                type="text"
                value={editingRoutine.name}
                onChange={(e) => setEditingRoutine({ ...editingRoutine, name: e.target.value })}
                className="w-full bg-[#15181D] rounded-xl py-2 px-3 text-sm font-black text-white border border-[#282F38] focus:border-[#1FD08A] outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#A8B0BB]">Duración (semanas)</label>
              <select
                value={editingRoutine.targetWeeks}
                onChange={(e) => setEditingRoutine({ ...editingRoutine, targetWeeks: parseInt(e.target.value, 10) || 8 })}
                className="w-full bg-[#15181D] rounded-xl py-2 px-3 text-xs font-bold text-white border border-[#282F38] focus:border-[#1FD08A] outline-none cursor-pointer"
              >
                {[1, 2, 4, 6, 8, 10, 12, 16].map((w) => (
                  <option key={w} value={w}>
                    {w === 1 ? '1 semana (o rutina de 1 día)' : `${w} semanas`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ESTRUCTURA DÍA POR DÍA */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#A8B0BB]">
                Días de entrenamiento ({editingRoutine.days.length} días)
              </h4>
              <button
                type="button"
                onClick={handleAddDayToRoutine}
                className="px-3 py-1.5 rounded-xl bg-[#15181D] hover:bg-[#282F38] border border-[#1FD08A]/30 text-xs font-bold text-[#1FD08A] flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir otro día</span>
              </button>
            </div>

            {editingRoutine.days.map((day, dayIdx) => (
              <div
                key={day.id || dayIdx}
                className="bg-[#15181D] border border-[#282F38] rounded-2xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#282F38]">
                  <input
                    type="text"
                    value={day.name}
                    onChange={(e) => {
                      const updatedDays = [...editingRoutine.days];
                      updatedDays[dayIdx].name = e.target.value;
                      setEditingRoutine({ ...editingRoutine, days: updatedDays });
                    }}
                    className="bg-transparent font-black text-sm text-white focus:outline-none border-b border-dashed border-[#282F38] focus:border-[#1FD08A] pb-0.5 flex-1"
                  />

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTargetDayIndex(dayIdx);
                        setShowAddExModal(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#20252C] hover:bg-[#282F38] text-xs font-bold text-[#1FD08A] border border-[#1FD08A]/30 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Agregar ejercicio</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveDay(dayIdx)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 transition-colors"
                      title="Eliminar este día"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* LISTA DE EJERCICIOS EDITABLES */}
                {day.exercises.length > 0 ? (
                  <div className="space-y-2">
                    {day.exercises.map((ex, exIdx) => (
                      <div
                        key={ex.id || exIdx}
                        className="bg-[#20252C] border border-[#282F38] rounded-xl p-2.5 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black text-white truncate">{ex.name}</p>
                          <span className="text-[10px] text-[#A8B0BB]">{ex.category}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-[#15181D] px-2 py-1 rounded-lg border border-[#282F38]">
                            <span className="text-[10px] text-[#A8B0BB] font-bold">Series:</span>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={ex.defaultSets}
                              onChange={(e) => handleUpdateExConfig(dayIdx, exIdx, 'defaultSets', parseInt(e.target.value, 10) || 3)}
                              className="w-8 bg-transparent text-center font-bold text-xs text-white outline-none"
                            />
                          </div>

                          <div className="flex items-center gap-1 bg-[#15181D] px-2.5 py-1 rounded-lg border border-[#282F38]">
                            <span className="text-[10px] text-[#A8B0BB] font-bold select-none">Reps:</span>
                            <input
                              type="text"
                              inputMode="text"
                              placeholder="8-10"
                              value={cleanNumericReps(ex.defaultReps)}
                              onChange={(e) => {
                                // Permitir únicamente dígitos, guion, 'a' o espacios para rangos (ej. "6-8" o "8 a 10"), sin permitir borrar/escribir la palabra "reps"
                                const sanitized = e.target.value.replace(/reps?/gi, '').replace(/[^0-9a\-\s/]/gi, '');
                                handleUpdateExConfig(dayIdx, exIdx, 'defaultReps', sanitized);
                              }}
                              className="w-12 bg-transparent text-center font-bold text-xs text-white outline-none focus:text-[#1FD08A]"
                            />
                            <span className="text-[10px] text-[#A8B0BB] font-bold select-none">reps</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveExerciseFromDay(dayIdx, exIdx)}
                            className="p-1 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Quitar ejercicio"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-center border border-dashed border-[#282F38] rounded-xl">
                    <p className="text-xs text-[#A8B0BB]">Sin ejercicios en este día</p>
                    <button
                      type="button"
                      onClick={() => {
                        setTargetDayIndex(dayIdx);
                        setShowAddExModal(true);
                      }}
                      className="mt-1.5 text-xs text-[#1FD08A] font-bold hover:underline"
                    >
                      + Añadir primer ejercicio
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL PARA AGREGAR EJERCICIO A UN DÍA */}
      {showAddExModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#20252C] rounded-3xl p-5 max-w-lg w-full border border-[#282F38] shadow-2xl text-[#F4F2ED] space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#282F38] pb-3">
              <div>
                <h3 className="text-base font-black text-white">Seleccionar Ejercicio</h3>
                <p className="text-xs text-[#A8B0BB]">Elige un ejercicio de tu catálogo para este día</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddExModal(false)}
                className="p-1 text-[#A8B0BB] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Buscar ejercicio o músculo..."
                value={searchExQuery}
                onChange={(e) => setSearchExQuery(e.target.value)}
                className="flex-1 bg-[#15181D] border border-[#282F38] rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-[#1FD08A]"
              />
              <button
                type="button"
                onClick={() => setShowCreateCustomExModal(true)}
                className="px-3 py-2 bg-[#1FD08A]/15 hover:bg-[#1FD08A]/25 border border-[#1FD08A]/30 text-xs font-bold text-[#1FD08A] rounded-xl flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Crear nuevo</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-72">
              {filteredBank.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => handleSelectExerciseForDay(ex)}
                  className="p-3 bg-[#15181D] hover:bg-[#282F38] border border-[#282F38] hover:border-[#1FD08A]/40 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all group"
                >
                  <div>
                    <p className="text-xs font-black text-white group-hover:text-[#1FD08A] transition-colors">{ex.name}</p>
                    <p className="text-[10px] text-[#A8B0BB]">{ex.equipment} · {ex.muscleGroup}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#1FD08A] shrink-0" />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowAddExModal(false)}
              className="w-full py-2.5 bg-[#15181D] hover:bg-[#282F38] text-xs font-bold text-[#A8B0BB] rounded-xl"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* MODAL PARA CREAR UN EJERCICIO NUEVO DESDE AQUÍ */}
      {showCreateCustomExModal && (
        <CustomExerciseModal
          nickname={nickname}
          defaultMuscleGroup="Cuádriceps"
          onClose={() => setShowCreateCustomExModal(false)}
          onCreated={(newEx) => {
            setShowCreateCustomExModal(false);
            handleSelectExerciseForDay(newEx);
          }}
          onNotification={onNotification}
        />
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
