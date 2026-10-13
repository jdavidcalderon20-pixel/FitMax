import React, { useState } from 'react';
import { 
  Dumbbell, 
  Search, 
  Plus, 
  Check, 
  Trash2, 
  BookOpen, 
  Layers, 
  Eye, 
  Calendar,
  X,
  Info,
  Sparkles
} from 'lucide-react';
import { EXERCISE_BANK, ExerciseDetail } from '../lib/exerciseBank';
import ExerciseDetailModal from './ExerciseDetailModal';
import { Level } from '../types';
import { useAuth } from '../lib/auth';
import { updateUserProfileCloud, fetchUserProfileCloud } from '../lib/exerciseCloud';
import { WeeklyRoutine, WeeklyExercise } from '../lib/weeklyGenerator';

interface ExerciseBankModuleProps {
  nickname: string;
  selectedLevel: Level;
  onNotification?: (msg: string) => void;
}

export default function ExerciseBankModule({ nickname, selectedLevel, onNotification }: ExerciseBankModuleProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('Todos');
  const [selectedEquip, setSelectedEquip] = useState<string>('Todos');
  const [modalExercise, setModalExercise] = useState<ExerciseDetail | null>(null);

  // Creador de rutina personalizada
  const [customRoutineName, setCustomRoutineName] = useState('Mi Rutina Personalizada');
  const [customList, setCustomList] = useState<{ exercise: ExerciseDetail; sets: number; reps: string }[]>(() => {
    try {
      const saved = localStorage.getItem(`fit_gen_${nickname}_custom_routine_v1`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal para cargar rutina personalizada al plan semanal
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [targetWeeklyDay, setTargetWeeklyDay] = useState<number>(1);

  const muscleGroups = ['Todos', 'Cuádriceps', 'Glúteos', 'Isquios y Glúteo', 'Pecho', 'Espalda', 'Hombros', 'Brazos', 'Core', 'Cardio y Metabólico'];
  const equipmentTypes = ['Todos', 'Mancuernas', 'Barra', 'Máquina', 'Polea', 'Peso corporal', 'Kettlebell', 'Caja / Banco', 'Ergómetro', 'Saco / Lastre'];

  // El atleta elige libremente de todo el banco sin filtros de nivel
  const filteredExercises = EXERCISE_BANK.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ex.targetFocus.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle = selectedMuscle === 'Todos' || ex.muscleGroup === selectedMuscle;
    const matchesEquip = selectedEquip === 'Todos' || ex.equipment === selectedEquip;

    return matchesSearch && matchesMuscle && matchesEquip;
  });

  const handleAddToCustom = (ex: ExerciseDetail) => {
    if (customList.some((item) => item.exercise.id === ex.id)) {
      if (onNotification) onNotification('Este ejercicio ya está en tu lista personalizada.');
      return;
    }
    const updated = [...customList, { exercise: ex, sets: 3, reps: '8-12 reps' }];
    setCustomList(updated);
    try {
      localStorage.setItem(`fit_gen_${nickname}_custom_routine_v1`, JSON.stringify(updated));
    } catch {}
    if (onNotification) onNotification(`¡${ex.name} añadido a tu rutina!`);
  };

  const handleRemoveFromCustom = (id: string) => {
    const updated = customList.filter((item) => item.exercise.id !== id);
    setCustomList(updated);
    try {
      localStorage.setItem(`fit_gen_${nickname}_custom_routine_v1`, JSON.stringify(updated));
    } catch {}
  };

  const handleClearCustom = () => {
    if (window.confirm('¿Deseas vaciar tu lista de rutina personalizada?')) {
      setCustomList([]);
      try {
        localStorage.removeItem(`fit_gen_${nickname}_custom_routine_v1`);
      } catch {}
    }
  };

  // Cargar la rutina personalizada a un día del Plan Semanal
  const handleConfirmLoadToWeekly = async () => {
    if (customList.length === 0) {
      alert('Agrega al menos un ejercicio a tu rutina antes de cargarla.');
      return;
    }

    try {
      let routine: WeeklyRoutine | null = null;
      if (user) {
        const profile = await fetchUserProfileCloud(user.id);
        if (profile?.weekly_routine) {
          routine = profile.weekly_routine;
        }
      }

      if (!routine) {
        const savedRoutineStr = localStorage.getItem(`fit_gen_${nickname}_weekly_routine_${selectedLevel}_v1`)
          || localStorage.getItem(`fit_gen_${nickname}_weekly_routine_v1`);
        if (savedRoutineStr) {
          routine = JSON.parse(savedRoutineStr);
        }
      }

      if (!routine || !routine[targetWeeklyDay]) {
        alert('No se encontró el plan semanal para actualizar. Abre primero el módulo Plan Semanal.');
        return;
      }

      // Convertir a WeeklyExercise
      const newWeeklyExercises: WeeklyExercise[] = customList.map((item) => ({
        name: item.exercise.name,
        category: item.exercise.muscleGroup,
        defaultSets: item.sets,
        defaultReps: item.reps,
        description: item.exercise.targetFocus,
      }));

      const updatedRoutine: WeeklyRoutine = {
        ...routine,
        [targetWeeklyDay]: {
          ...routine[targetWeeklyDay],
          subtitle: `${customRoutineName} (${newWeeklyExercises.length} ejercicios creados por ti)`,
          exercises: newWeeklyExercises,
        },
      };

      // Guardar local
      localStorage.setItem(`fit_gen_${nickname}_weekly_routine_${selectedLevel}_v1`, JSON.stringify(updatedRoutine));

      // Guardar en la nube si hay usuario
      if (user) {
        await updateUserProfileCloud(user.id, { weekly_routine: updatedRoutine });
      }

      setShowLoadModal(false);
      if (onNotification) {
        onNotification(`¡Rutina "${customRoutineName}" cargada exitosamente en el Día ${targetWeeklyDay} de tu Plan Semanal!`);
      }
    } catch (e: any) {
      console.error(e);
      alert('Error al sincronizar con el Plan Semanal.');
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="bg-emerald-100 text-emerald-800 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-block border border-emerald-200">
              Banco Abierto &amp; Creador de Rutinas
            </span>
            <span className="text-zinc-400 text-xs font-bold">
              {EXERCISE_BANK.length} Ejercicios en el Catálogo
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-zinc-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-500" />
            Banco de Ejercicios y Rutina Libre
          </h2>
          <p className="text-zinc-500 text-xs mt-0.5">
            Elige libremente cualquier ejercicio de todo el catálogo para aprender su técnica o diseña tu rutina personalizada y cárgala a tu Plan Semanal.
          </p>
        </div>
      </div>

      {/* RUTINA PERSONALIZADA DEL ATLETA */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 text-white shadow-xl">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Layers className="w-5 h-5 text-emerald-400" />
            <input
              type="text"
              value={customRoutineName}
              onChange={(e) => setCustomRoutineName(e.target.value)}
              className="bg-transparent text-sm md:text-base font-black text-zinc-100 border-b border-zinc-700 focus:border-emerald-400 focus:outline-none px-1"
            />
            <span className="text-[11px] font-bold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full">
              {customList.length} Ejercicios
            </span>
          </div>

          <div className="flex items-center gap-2">
            {customList.length > 0 && (
              <>
                <button
                  onClick={() => setShowLoadModal(true)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                  title="Cargar esta rutina en un día específico de tu Plan Semanal"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Cargar al Plan Semanal</span>
                </button>
                <button
                  onClick={handleClearCustom}
                  className="text-xs text-zinc-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-zinc-800 font-bold transition-colors"
                  title="Vaciar lista"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {customList.length === 0 ? (
          <div className="bg-zinc-950/60 border border-dashed border-zinc-800 rounded-2xl p-6 text-center text-zinc-400">
            <p className="text-xs font-medium mb-1">Tu lista personalizada está vacía actualmente.</p>
            <p className="text-[11px] text-zinc-500">
              Explora cualquier grupo muscular abajo y haz clic en <strong>"+ Añadir"</strong> para armar tu entrenamiento a gusto.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {customList.map((item) => (
              <div
                key={item.exercise.id}
                className="bg-zinc-950/80 border border-zinc-800 p-3 rounded-2xl flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      {item.exercise.muscleGroup}
                    </span>
                    <span className="text-[9px] text-zinc-500 font-bold">{item.exercise.equipment}</span>
                  </div>
                  <p className="text-xs font-black text-white truncate">{item.exercise.name}</p>
                  <p className="text-[10px] text-zinc-400 font-semibold">{item.sets} series · {item.reps}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setModalExercise(item.exercise)}
                    className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
                    title="Ver técnica"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRemoveFromCustom(item.exercise.id)}
                    className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-zinc-800"
                    title="Quitar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BARRA DE BÚSQUEDA Y FILTROS POR GRUPO MUSCULAR Y EQUIPO (SIN RESTRICCIÓN DE NIVEL) */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-4 md:p-5 space-y-3">
        {/* BUSCADOR */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por ejercicio (ej. sentadilla frontal, prensa, hack, hip thrust, dominadas...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-zinc-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs md:text-sm font-semibold text-zinc-900 focus:outline-none focus:border-emerald-500 shadow-sm"
          />
        </div>

        {/* FILTROS POR GRUPO MUSCULAR */}
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1.5">
            Grupo Muscular:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {muscleGroups.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMuscle(m)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  selectedMuscle === m
                    ? 'bg-zinc-950 border-zinc-900 text-white shadow'
                    : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* FILTROS POR EQUIPO */}
        <div className="pt-2 border-t border-zinc-200/60">
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1.5">
            Equipo:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {equipmentTypes.map((eq) => (
              <button
                key={eq}
                onClick={() => setSelectedEquip(eq)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                  selectedEquip === eq
                    ? 'bg-emerald-500 border-emerald-500 text-zinc-950 font-black shadow-sm'
                    : 'bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300'
                }`}
              >
                {eq}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* LISTADO DE EJERCICIOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 flex-1 overflow-y-auto">
        {filteredExercises.length === 0 ? (
          <div className="col-span-full py-16 text-center text-zinc-400">
            <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-bold text-sm">No se encontraron ejercicios con estos filtros</p>
            <p className="text-xs text-zinc-400 mt-1">Prueba seleccionando otro grupo muscular o borrando la búsqueda.</p>
          </div>
        ) : (
          filteredExercises.map((ex) => {
            const isAdded = customList.some((item) => item.exercise.id === ex.id);

            return (
              <div
                key={ex.id}
                className="bg-white border border-zinc-200/90 rounded-3xl p-4 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <span className="bg-emerald-50 text-emerald-700 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full border border-emerald-100">
                      {ex.muscleGroup}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">
                      {ex.equipment}
                    </span>
                  </div>

                  <h3
                    onClick={() => setModalExercise(ex)}
                    className="text-sm font-black text-zinc-900 hover:text-emerald-600 cursor-pointer transition-colors flex items-center justify-between group"
                  >
                    <span>{ex.name}</span>
                    <Info className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-500 shrink-0" />
                  </h3>

                  <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                    {ex.targetFocus}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center gap-2">
                  <button
                    onClick={() => setModalExercise(ex)}
                    className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs py-2 rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-zinc-600" />
                    <span>Ver Técnica</span>
                  </button>

                  <button
                    onClick={() => handleAddToCustom(ex)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                      isAdded
                        ? 'bg-emerald-100 text-emerald-800 font-black'
                        : 'bg-zinc-950 hover:bg-zinc-800 text-white'
                    }`}
                    title={isAdded ? 'Ya está en tu rutina' : 'Agregar a tu rutina personalizada'}
                  >
                    {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>{isAdded ? 'Agregado' : 'Añadir'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL PARA CARGAR A DÍA ESPECÍFICO DEL PLAN SEMANAL */}
      {showLoadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-zinc-900 text-white rounded-3xl max-w-md w-full p-6 border border-zinc-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-base text-white">Cargar al Plan Semanal</h3>
              </div>
              <button
                onClick={() => setShowLoadModal(false)}
                className="p-1.5 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed mb-4">
              ¿A qué día de tu mesociclo deseas asignar tu rutina personalizada con <strong>{customList.length} ejercicios</strong>?
            </p>

            <div className="grid grid-cols-2 gap-2 mb-5">
              {[1, 2, 3, 4, 5].map((d) => (
                <button
                  key={d}
                  onClick={() => setTargetWeeklyDay(d)}
                  className={`p-3 rounded-2xl text-xs font-bold border transition-all text-left flex items-center justify-between ${
                    targetWeeklyDay === d
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <span>Día {d}</span>
                  {targetWeeklyDay === d && <Check className="w-4 h-4 text-emerald-400" />}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleConfirmLoadToWeekly}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-xl text-xs shadow-md transition-all"
              >
                Confirmar y Asignar
              </button>
              <button
                onClick={() => setShowLoadModal(false)}
                className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE TÉCNICA */}
      {modalExercise && (
        <ExerciseDetailModal exercise={modalExercise} onClose={() => setModalExercise(null)} />
      )}
    </div>
  );
}
