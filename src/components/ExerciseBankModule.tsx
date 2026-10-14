import React, { useState, useMemo } from 'react';
import { 
  Dumbbell, 
  Search, 
  Plus, 
  Check, 
  Trash2, 
  BookOpen, 
  Layers, 
  Calendar,
  X,
  Share2,
  ArrowUp,
  ArrowDown,
  Star,
  SlidersHorizontal,
  ChevronRight,
  Flame,
  HelpCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { EXERCISE_BANK, ExerciseDetail, findExerciseDetail } from '../lib/exerciseBank';
import { SCIENTIFIC_EXERCISES } from '../data/exercisesData';
import ExerciseDetailModal from './ExerciseDetailModal';
import EvidenceBadge from './EvidenceBadge';
import { Level } from '../types';
import { useAuth } from '../lib/auth';
import { updateUserProfileCloud, fetchUserProfileCloud } from '../lib/exerciseCloud';
import { WeeklyRoutine, WeeklyExercise } from '../lib/weeklyGenerator';
import { SharedRoutinePayload, Squad, shareRoutineToSquadCloud } from '../lib/squads';

interface ExerciseBankModuleProps {
  nickname: string;
  selectedLevel: Level;
  onNotification?: (msg: string) => void;
}

// Diccionario de sinónimos Inglés - Español y términos coloquiales para búsqueda tolerante
const SEARCH_SYNONYMS: Record<string, string[]> = {
  squat: ['sentadilla', 'sentadillas', 'squat', 'hack', 'prensa', 'bulgara', 'goblet', 'sissy'],
  sentadilla: ['squat', 'sentadilla', 'hack', 'prensa', 'bulgara', 'goblet', 'sissy'],
  bench: ['press banca', 'banca', 'pecho', 'pectoral', 'chest', 'mancuernas'],
  pecho: ['press banca', 'banca', 'pecho', 'pectoral', 'aperturas', 'fondos', 'flexiones'],
  deadlift: ['peso muerto', 'rumano', 'rdl', 'deadlift'],
  rdl: ['peso muerto rumano', 'rdl', 'isquios', 'femoral'],
  'peso muerto': ['deadlift', 'rdl', 'peso muerto', 'rumano'],
  'pull up': ['dominada', 'dominadas', 'pull up', 'chin up', 'jalon'],
  pullup: ['dominada', 'dominadas', 'pull up', 'chin up', 'jalon'],
  dominada: ['pull up', 'chin up', 'dominada', 'dominadas'],
  dip: ['fondos', 'dips', 'paralelas'],
  fondos: ['dips', 'fondos', 'paralelas'],
  lunge: ['zancada', 'zancadas', 'estocada', 'lunge', 'lunges', 'bulgara'],
  zancada: ['lunge', 'lunges', 'zancada', 'zancadas', 'estocada', 'bulgara'],
  curl: ['curl', 'biceps', 'brazo'],
  biceps: ['curl', 'biceps', 'brazo', 'martillo'],
  triceps: ['triceps', 'fondos', 'extension', 'frances', 'copa', 'polea'],
  press: ['press', 'militar', 'banca', 'hombro', 'pecho'],
  shoulder: ['hombro', 'deltoides', 'militar', 'elevaciones', 'lateral'],
  hombro: ['shoulder', 'deltoides', 'militar', 'elevaciones', 'lateral', 'pajaro', 'press'],
  row: ['remo', 'row', 'dorsal', 'espalda', 'pendlay'],
  remo: ['row', 'remo', 'dorsal', 'espalda', 'pendlay', 'gironda', 'polea'],
  espalda: ['back', 'dorsal', 'remo', 'jalon', 'dominada'],
  plank: ['plancha', 'core', 'plank', 'abdomen'],
  plancha: ['plank', 'plancha', 'core', 'abdomen', 'isometria'],
  'hip thrust': ['empuje de cadera', 'hip thrust', 'gluteo', 'pelvis'],
  gluteo: ['hip thrust', 'gluteo', 'puente', 'patada', 'abduccion', 'sentadilla'],
  sissy: ['sissy', 'sentadilla sissy'],
  burpee: ['burpee', 'salto', 'metabolico'],
  swing: ['balanceo', 'kettlebell', 'pesa rusa', 'swing'],
  carry: ['paseo', 'granjero', 'carry', 'transporte', 'carga', 'sandbag'],
  'paseo del granjero': ['farmers carry', 'paseo del granjero', 'cuelgue', 'carry'],
  farmer: ['granjero', 'paseo', 'carry'],
  farmers: ['granjero', 'paseo', 'carry'],
  skierg: ['esqui', 'skierg', 'ski erg'],
  sled: ['trineo', 'sled', 'push', 'pull', 'empuje', 'arrastre'],
  trineo: ['sled', 'trineo', 'empuje', 'arrastre'],
  wallball: ['balon', 'pared', 'wall ball', 'wallball'],
  'wall ball': ['balon', 'pared', 'wall ball', 'wallball']
};

function normalizeForSearch(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const d: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + cost
      );
    }
  }
  return d[m][n];
}

function isTolerantMatch(candidate: string, query: string): boolean {
  const normCand = normalizeForSearch(candidate);
  const normQuery = normalizeForSearch(query);
  if (!normQuery) return true;
  if (normCand.includes(normQuery)) return true;

  // Revisar si la consulta o partes coinciden con la lista de sinónimos
  const queryTokens = normQuery.split(' ');
  for (const token of queryTokens) {
    if (token.length < 3) continue;
    if (normCand.includes(token)) return true;

    // Sinónimos directos
    const syns = SEARCH_SYNONYMS[token];
    if (syns && syns.some((s) => normCand.includes(normalizeForSearch(s)))) {
      return true;
    }

    // Tolerancia a pequeños errores tipográficos (ej. sentadila -> sentadilla)
    if (token.length >= 5) {
      const candWords = normCand.split(' ');
      for (const cw of candWords) {
        if (cw.length >= 5 && levenshteinDistance(token, cw) <= 1) {
          return true;
        }
      }
    }
  }

  // Buscar por frase de sinónimo completa (ej. 'hip thrust')
  const phraseSyns = SEARCH_SYNONYMS[normQuery];
  if (phraseSyns && phraseSyns.some((s) => normCand.includes(normalizeForSearch(s)))) {
    return true;
  }

  return false;
}

export default function ExerciseBankModule({ nickname, selectedLevel, onNotification }: ExerciseBankModuleProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('Todos');
  const [selectedEquip, setSelectedEquip] = useState<string>('Todos');
  const [selectedPattern, setSelectedPattern] = useState<string>('Todos');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<'Todos' | 'Base' | 'Intermedio' | 'Avanzado'>('Todos');
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);
  const [modalExercise, setModalExercise] = useState<ExerciseDetail | null>(null);

  // Favoritos
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`fitmax_fav_exercises_${nickname}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = (exerciseId: string) => {
    const updated = favorites.includes(exerciseId)
      ? favorites.filter((id) => id !== exerciseId)
      : [...favorites, exerciseId];
    setFavorites(updated);
    try {
      localStorage.setItem(`fitmax_fav_exercises_${nickname}`, JSON.stringify(updated));
    } catch {}
    if (onNotification) {
      onNotification(favorites.includes(exerciseId) ? 'Eliminado de tus favoritos' : 'Añadido a tus favoritos ⭐');
    }
  };

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
  const movementPatterns = ['Todos', 'Empuje horizontal', 'Empuje vertical', 'Tracción vertical', 'Tracción horizontal', 'Dominante rodilla', 'Dominante cadera', 'Aislamiento', 'Metabólico', 'Carga y Agarre'];

  // Enriquecer el banco con evidencia científica mapeada
  const enrichedExercises = useMemo(() => {
    return EXERCISE_BANK.map((ex) => {
      const sci = SCIENTIFIC_EXERCISES.find(
        (s) => s.id === ex.id || 
               normalizeForSearch(s.name) === normalizeForSearch(ex.name) ||
               normalizeForSearch(ex.name).includes(normalizeForSearch(s.name))
      );
      const evidence = (sci?.evidence || (ex.level === 'A' ? 'A' : ex.level === 'B' ? 'B' : 'B')) as 'A' | 'B' | 'C';
      return {
        ...ex,
        evidence,
        scientificCues: sci?.cues || []
      };
    });
  }, []);

  // Filtrado de ejercicios
  const filteredExercises = useMemo(() => {
    return enrichedExercises.filter((ex) => {
      const matchesSearch = isTolerantMatch(ex.name, searchQuery) ||
                            isTolerantMatch(ex.targetFocus, searchQuery) ||
                            isTolerantMatch(ex.muscleGroup, searchQuery) ||
                            isTolerantMatch(ex.equipment, searchQuery);

      const matchesMuscle = selectedMuscle === 'Todos' || ex.muscleGroup === selectedMuscle;
      const matchesEquip = selectedEquip === 'Todos' || ex.equipment === selectedEquip;
      const matchesPattern = selectedPattern === 'Todos' || ex.pattern === selectedPattern;

      const matchesLevel = selectedLevelFilter === 'Todos' || 
                           (selectedLevelFilter === 'Base' && ex.level === 'A') ||
                           (selectedLevelFilter === 'Intermedio' && (ex.level === 'A' || ex.level === 'B')) ||
                           (selectedLevelFilter === 'Avanzado');

      const matchesFav = !onlyFavorites || favorites.includes(ex.id);

      return matchesSearch && matchesMuscle && matchesEquip && matchesPattern && matchesLevel && matchesFav;
    });
  }, [enrichedExercises, searchQuery, selectedMuscle, selectedEquip, selectedPattern, selectedLevelFilter, onlyFavorites, favorites]);

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

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...customList];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setCustomList(updated);
    try {
      localStorage.setItem(`fit_gen_${nickname}_custom_routine_v1`, JSON.stringify(updated));
    } catch {}
  };

  const handleMoveDown = (index: number) => {
    if (index === customList.length - 1) return;
    const updated = [...customList];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setCustomList(updated);
    try {
      localStorage.setItem(`fit_gen_${nickname}_custom_routine_v1`, JSON.stringify(updated));
    } catch {}
  };

  const handleApplyPreset = (index: number, sets: number, reps: string) => {
    const updated = [...customList];
    updated[index] = { ...updated[index], sets, reps };
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
        onNotification(`¡Rutina "${customRoutineName}" asignada exitosamente al Día ${targetWeeklyDay} de tu Plan Semanal!`);
      }
    } catch (e: any) {
      console.error(e);
      alert('Error al sincronizar con el Plan Semanal.');
    }
  };

  // Compartir rutina con el Combo
  const handleShareWithCombo = async () => {
    if (customList.length === 0) {
      alert('Agrega al menos un ejercicio a tu rutina antes de compartirla.');
      return;
    }

    const payload: SharedRoutinePayload = {
      title: customRoutineName,
      discipline: 'strength',
      description: `Rutina de ${customList.length} ejercicios diseñada por ${nickname}`,
      authorNickname: nickname,
      sharedAt: Date.now(),
      type: 'custom_bank',
      exercisesData: customList.map((item) => ({
        name: item.exercise.name,
        sets: item.sets,
        reps: item.reps
      }))
    };

    try {
      // Guardar en cuadrillas locales
      const savedSquads = localStorage.getItem(`fit_gen_${nickname}_squads_v1`);
      let squadsList: Squad[] = savedSquads ? JSON.parse(savedSquads) : [];
      if (squadsList.length > 0) {
        squadsList[0].sharedRoutine = payload;
        localStorage.setItem(`fit_gen_${nickname}_squads_v1`, JSON.stringify(squadsList));
        if (user && squadsList[0].id) {
          await shareRoutineToSquadCloud(squadsList[0].id, user.id, payload);
        }
      }

      if (onNotification) {
        onNotification(`¡Rutina "${customRoutineName}" compartida con tu combo! 🔥`);
      }
    } catch (e) {
      console.error(e);
      if (onNotification) {
        onNotification(`¡Rutina guardada para compartir con tu combo!`);
      }
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 animate-fadeIn">
      {/* CABECERA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-[#20252C]">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="bg-[#1FD08A]/15 text-[#1FD08A] px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-block border border-[#1FD08A]/30">
              Banco abierto &amp; Creador
            </span>
            <span className="text-[#A8B0BB] text-xs font-semibold">
              {EXERCISE_BANK.length} ejercicios disponibles
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-[#F4F2ED] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#1FD08A]" />
            Biblioteca de ejercicios
          </h2>
          <p className="text-[#A8B0BB] text-xs mt-0.5">
            Técnica guiada paso a paso, respaldo científico y creador de rutinas para tu plan.
          </p>
        </div>
      </div>

      {/* CREADOR DE RUTINA PERSONALIZADA */}
      <div className="bg-[#20252C] border border-[#282F38] rounded-3xl p-4 sm:p-5 text-[#F4F2ED] shadow-xl">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Layers className="w-5 h-5 text-[#1FD08A]" />
            <input
              type="text"
              value={customRoutineName}
              onChange={(e) => setCustomRoutineName(e.target.value)}
              className="bg-transparent text-sm md:text-base font-black text-[#F4F2ED] border-b border-[#282F38] focus:border-[#1FD08A] focus:outline-none px-1"
              placeholder="Nombre de tu rutina"
            />
            <span className="text-[11px] font-bold text-[#A8B0BB] bg-[#15181D] px-2.5 py-0.5 rounded-full border border-[#282F38]">
              {customList.length} ejercicios
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {customList.length > 0 && (
              <>
                <button
                  onClick={() => setShowLoadModal(true)}
                  className="bg-[#1FD08A] hover:bg-[#1ab87a] text-[#15181D] font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
                  title="Asignar esta rutina a un día de tu plan semanal"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Asignar a día del plan</span>
                </button>

                <button
                  onClick={handleShareWithCombo}
                  className="bg-[#15181D] hover:bg-[#282F38] text-[#1FD08A] border border-[#1FD08A]/40 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Compartir esta rutina con tu combo de entrenamiento"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Compartir con combo</span>
                </button>

                <button
                  onClick={handleClearCustom}
                  className="text-xs text-[#A8B0BB] hover:text-red-400 p-2 rounded-xl hover:bg-[#15181D] transition-colors cursor-pointer"
                  title="Vaciar lista"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {customList.length === 0 ? (
          <div className="bg-[#15181D]/80 border border-dashed border-[#282F38] rounded-2xl p-5 text-center text-[#A8B0BB]">
            <p className="text-xs font-semibold mb-1 text-[#F4F2ED]">Tu rutina personalizada está vacía actualmente.</p>
            <p className="text-[11px] text-[#A8B0BB]">
              Explora cualquier ejercicio abajo y pulsa en <strong>"+"</strong> para añadirlo a tu rutina personalizada.
            </p>
          </div>
        ) : (
          <div className="space-y-2 mt-3">
            {customList.map((item, index) => (
              <div
                key={item.exercise.id}
                className="bg-[#15181D] border border-[#282F38] p-3 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                {/* Nombre y datos */}
                <div className="min-w-0 flex-1 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-[#20252C] text-[#A8B0BB] font-black text-[11px] flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-[#F4F2ED] truncate">{item.exercise.name}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#A8B0BB]">
                      <span className="text-[#1FD08A] font-bold">{item.exercise.muscleGroup}</span>
                      <span>·</span>
                      <span>{item.exercise.equipment}</span>
                    </div>
                  </div>
                </div>

                {/* Presets y Controles de Series/Reps */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center gap-1 bg-[#20252C] p-1 rounded-xl border border-[#282F38]">
                    <button
                      type="button"
                      onClick={() => handleApplyPreset(index, 4, '4-6 reps')}
                      className={`px-2 py-0.5 text-[10px] rounded-lg font-bold transition-colors ${
                        item.sets === 4 && item.reps.includes('4-6')
                          ? 'bg-[#1FD08A] text-[#15181D]'
                          : 'text-[#A8B0BB] hover:text-[#F4F2ED]'
                      }`}
                    >
                      Fuerza 4×6
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset(index, 3, '8-12 reps')}
                      className={`px-2 py-0.5 text-[10px] rounded-lg font-bold transition-colors ${
                        item.sets === 3 && item.reps.includes('8-12')
                          ? 'bg-[#1FD08A] text-[#15181D]'
                          : 'text-[#A8B0BB] hover:text-[#F4F2ED]'
                      }`}
                    >
                      Hipertrofia 3×10
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset(index, 3, '15-20 reps')}
                      className={`px-2 py-0.5 text-[10px] rounded-lg font-bold transition-colors ${
                        item.sets === 3 && item.reps.includes('15-20')
                          ? 'bg-[#1FD08A] text-[#15181D]'
                          : 'text-[#A8B0BB] hover:text-[#F4F2ED]'
                      }`}
                    >
                      Resistencia 3×15
                    </button>
                  </div>

                  {/* Reordenar y eliminar */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="p-1.5 text-[#A8B0BB] hover:text-[#F4F2ED] disabled:opacity-30 rounded-lg hover:bg-[#20252C] transition-colors cursor-pointer"
                      title="Mover arriba"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === customList.length - 1}
                      className="p-1.5 text-[#A8B0BB] hover:text-[#F4F2ED] disabled:opacity-30 rounded-lg hover:bg-[#20252C] transition-colors cursor-pointer"
                      title="Mover abajo"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleRemoveFromCustom(item.exercise.id)}
                      className="p-1.5 text-[#A8B0BB] hover:text-red-400 rounded-lg hover:bg-[#20252C] transition-colors cursor-pointer"
                      title="Quitar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BUSCADOR Y FILTROS TOLERANTES */}
      <div className="bg-[#20252C] border border-[#282F38] rounded-3xl p-4 sm:p-5 space-y-3.5">
        {/* Barra de búsqueda */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#A8B0BB] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar ejercicio en español o inglés (ej. sentadilla, squat, bench, rdl, remo, dominadas...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#15181D] border border-[#282F38] rounded-2xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-[#F4F2ED] placeholder-[#A8B0BB]/60 focus:outline-none focus:border-[#1FD08A] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8B0BB] hover:text-[#F4F2ED] p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filtros rápidos: Grupo Muscular */}
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#A8B0BB] block mb-1.5">
            Grupo muscular:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {muscleGroups.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMuscle(m)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  selectedMuscle === m
                    ? 'bg-[#1FD08A] border-[#1FD08A] text-[#15181D] font-black shadow-sm'
                    : 'bg-[#15181D] border-[#282F38] text-[#A8B0BB] hover:text-[#F4F2ED] hover:border-[#38414D]'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Filtros rápidos: Equipo y Favoritos */}
        <div className="pt-2 border-t border-[#282F38] flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#A8B0BB] block mb-1.5">
              Equipo:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {equipmentTypes.map((eq) => (
                <button
                  key={eq}
                  onClick={() => setSelectedEquip(eq)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                    selectedEquip === eq
                      ? 'bg-[#1FD08A]/20 border-[#1FD08A] text-[#1FD08A] font-bold'
                      : 'bg-[#15181D] border-[#282F38] text-[#A8B0BB] hover:text-[#F4F2ED]'
                  }`}
                >
                  {eq}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 sm:pt-0">
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                onlyFavorites
                  ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                  : 'bg-[#15181D] border-[#282F38] text-[#A8B0BB] hover:text-[#F4F2ED]'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>Favoritos ({favorites.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* CONTADOR DE RESULTADOS */}
      <div className="flex items-center justify-between px-1 text-xs text-[#A8B0BB]">
        <span>Mostrando {filteredExercises.length} de {EXERCISE_BANK.length} ejercicios</span>
        {(selectedMuscle !== 'Todos' || selectedEquip !== 'Todos' || searchQuery || onlyFavorites) && (
          <button
            onClick={() => {
              setSelectedMuscle('Todos');
              setSelectedEquip('Todos');
              setSelectedPattern('Todos');
              setSearchQuery('');
              setOnlyFavorites(false);
            }}
            className="text-[11px] text-[#1FD08A] hover:underline cursor-pointer"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* LISTADO DE TARJETAS SIMPLIFICADAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 flex-1 overflow-y-auto">
        {filteredExercises.length === 0 ? (
          <div className="col-span-full py-16 text-center text-[#A8B0BB]">
            <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-20 text-[#1FD08A]" />
            <p className="font-bold text-sm text-[#F4F2ED]">No se encontraron ejercicios con estos filtros</p>
            <p className="text-xs text-[#A8B0BB] mt-1">
              Prueba buscando en inglés o español (ej: "squat" o "sentadilla") o borra los filtros aplicados.
            </p>
          </div>
        ) : (
          filteredExercises.map((ex) => {
            const isAdded = customList.some((item) => item.exercise.id === ex.id);
            const isFav = favorites.includes(ex.id);
            const thumbUrl = ex.demoImages?.[0];

            return (
              <div
                key={ex.id}
                className="bg-[#20252C] border border-[#282F38] hover:border-[#1FD08A]/50 rounded-2xl p-3.5 transition-all flex flex-col justify-between group shadow-sm"
              >
                <div>
                  {/* Fila superior: Miniatura + Nombre + Favorito */}
                  <div className="flex items-start gap-3">
                    {/* Miniatura / Icono de movimiento */}
                    <div className="w-12 h-12 rounded-xl bg-[#15181D] border border-[#282F38] flex items-center justify-center overflow-hidden shrink-0">
                      {thumbUrl ? (
                        <img 
                          src={thumbUrl} 
                          alt={ex.name} 
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <Dumbbell className="w-5 h-5 text-[#1FD08A]/70" />
                      )}
                    </div>

                    {/* Nombre y datos */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h3
                          onClick={() => setModalExercise(ex)}
                          className="text-xs sm:text-sm font-black text-[#F4F2ED] group-hover:text-[#1FD08A] transition-colors cursor-pointer truncate"
                          title={ex.name}
                        >
                          {ex.name}
                        </h3>
                        <button
                          type="button"
                          onClick={() => toggleFavorite(ex.id)}
                          className="p-1 text-[#A8B0BB] hover:text-amber-400 transition-colors shrink-0 cursor-pointer"
                          title={isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                        >
                          <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </button>
                      </div>

                      {/* Una sola línea con Músculo · Equipo · Patrón */}
                      <p className="text-[11px] text-[#A8B0BB] truncate mt-0.5">
                        <span className="text-[#1FD08A] font-bold">{ex.muscleGroup}</span>
                        <span className="mx-1">·</span>
                        <span>{ex.equipment}</span>
                        <span className="mx-1">·</span>
                        <span>{ex.pattern}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Fila inferior: Evidencia discreta + Botón "Ver técnica" + Botón "+" */}
                <div className="mt-3 pt-2.5 border-t border-[#282F38] flex items-center justify-between gap-2">
                  {/* Insignia discreta con tooltip */}
                  <EvidenceBadge evidence={ex.evidence} size="sm" />

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setModalExercise(ex)}
                      className="px-3 py-1.5 bg-[#15181D] hover:bg-[#282F38] text-[#F4F2ED] font-bold text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer border border-[#282F38]"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#1FD08A]" />
                      <span>Ver técnica</span>
                    </button>

                    <button
                      onClick={() => handleAddToCustom(ex)}
                      className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        isAdded
                          ? 'bg-[#1FD08A]/20 text-[#1FD08A] border border-[#1FD08A]'
                          : 'bg-[#1FD08A] hover:bg-[#1ab87a] text-[#15181D]'
                      }`}
                      title={isAdded ? 'Ya está en tu rutina' : 'Añadir a rutina personalizada'}
                    >
                      {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">{isAdded ? 'Añadido' : 'Añadir'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL PARA CARGAR A DÍA ESPECÍFICO DEL PLAN SEMANAL */}
      {showLoadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#20252C] text-[#F4F2ED] rounded-3xl max-w-md w-full p-6 border border-[#282F38] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#282F38] mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#1FD08A]" />
                <h3 className="font-extrabold text-base text-[#F4F2ED]">Asignar al Plan Semanal</h3>
              </div>
              <button
                onClick={() => setShowLoadModal(false)}
                className="p-1.5 hover:bg-[#15181D] rounded-xl text-[#A8B0BB] hover:text-[#F4F2ED] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#A8B0BB] leading-relaxed mb-4">
              ¿A qué día de tu mesociclo deseas asignar tu rutina personalizada con <strong>{customList.length} ejercicios</strong>?
            </p>

            <div className="grid grid-cols-2 gap-2 mb-5">
              {[1, 2, 3, 4, 5].map((d) => (
                <button
                  key={d}
                  onClick={() => setTargetWeeklyDay(d)}
                  className={`p-3 rounded-2xl text-xs font-bold border transition-all text-left flex items-center justify-between cursor-pointer ${
                    targetWeeklyDay === d
                      ? 'bg-[#1FD08A]/15 border-[#1FD08A] text-[#1FD08A]'
                      : 'bg-[#15181D] border-[#282F38] text-[#A8B0BB] hover:text-[#F4F2ED]'
                  }`}
                >
                  <span>Día {d}</span>
                  {targetWeeklyDay === d && <Check className="w-4 h-4 text-[#1FD08A]" />}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleConfirmLoadToWeekly}
                className="flex-1 py-3 bg-[#1FD08A] hover:bg-[#1ab87a] text-[#15181D] font-black rounded-xl text-xs shadow-md transition-all cursor-pointer"
              >
                Confirmar y asignar
              </button>
              <button
                onClick={() => setShowLoadModal(false)}
                className="px-4 py-3 bg-[#15181D] hover:bg-[#282F38] text-[#A8B0BB] rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE TÉCNICA */}
      {modalExercise && (
        <ExerciseDetailModal 
          exercise={modalExercise} 
          onClose={() => setModalExercise(null)}
          onAddToRoutine={(ex) => handleAddToCustom(ex)}
          onSelectAlternative={(alt) => setModalExercise(alt)}
        />
      )}
    </div>
  );
}
