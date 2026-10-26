import { ExerciseDetail } from './exerciseBank';
import { supabase } from './supabaseClient';

const getStorageKey = (nickname: string) => `fitmax_custom_exercises_${nickname || 'anon'}`;

export function getCustomExercises(nickname: string): ExerciseDetail[] {
  try {
    const raw = localStorage.getItem(getStorageKey(nickname));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error al leer ejercicios personalizados:', e);
    return [];
  }
}

export function saveCustomExercise(
  nickname: string,
  data: {
    id?: string;
    name: string;
    muscleGroup: ExerciseDetail['muscleGroup'];
    pattern: ExerciseDetail['pattern'];
    equipment: ExerciseDetail['equipment'];
    level?: ExerciseDetail['level'];
    targetFocus?: string;
    techniqueCues?: string;
    steps?: string[];
    commonMistakes?: string[];
    breathingTip?: string;
  }
): ExerciseDetail {
  const existing = getCustomExercises(nickname);
  const id = data.id || `custom_ex_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const steps = data.steps && data.steps.length > 0 
    ? data.steps 
    : data.techniqueCues 
    ? [data.techniqueCues] 
    : ['Ejecuta el movimiento con control en fase excéntrica y concéntrica asegurando rango completo.'];

  const newExercise: ExerciseDetail = {
    id,
    name: data.name.trim(),
    muscleGroup: data.muscleGroup,
    pattern: data.pattern,
    level: data.level || 'A',
    equipment: data.equipment,
    steps,
    commonMistakes: data.commonMistakes || ['Perder la tensión muscular en el cambio de fase excéntrica a concéntrica.'],
    breathingTip: data.breathingTip || 'Inhala en la fase excéntrica (bajada); exhala al aplicar fuerza en la contracción.',
    targetFocus: data.targetFocus || `${data.muscleGroup} (${data.pattern})`,
  };

  const index = existing.findIndex((e) => e.id === id || e.name.toLowerCase() === newExercise.name.toLowerCase());
  let updated: ExerciseDetail[];
  if (index !== -1) {
    updated = [...existing];
    updated[index] = { ...updated[index], ...newExercise };
  } else {
    updated = [newExercise, ...existing];
  }

  try {
    localStorage.setItem(getStorageKey(nickname), JSON.stringify(updated));
  } catch (e) {
    console.error('Error guardando en localStorage:', e);
  }

  // Sincronización en la nube opcional en background
  try {
    supabase.auth.getUser().then(({ data: authData }) => {
      const user = authData?.user;
      if (user) {
        supabase
          .from('profiles')
          .update({
            custom_exercises: updated,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
          .then();
      }
    });
  } catch {}

  return newExercise;
}

export function deleteCustomExercise(nickname: string, id: string): void {
  const existing = getCustomExercises(nickname);
  const updated = existing.filter((e) => e.id !== id);
  try {
    localStorage.setItem(getStorageKey(nickname), JSON.stringify(updated));
  } catch (e) {
    console.error('Error eliminando de localStorage:', e);
  }
}
