import { supabase } from './supabaseClient';
import { HistoryEntry } from './progression';

export interface ExerciseLogRow {
  id: string;
  user_id: string;
  module: 'quick' | 'weekly';
  exercise_key: string;
  weight: number | null;
  reps: string | null;
  completed: boolean;
  logged_at: string;
}

export interface UserProfileCloud {
  id: string;
  nickname: string;
  selected_level: 'A' | 'B' | 'C';
  weekly_routine?: any;
  weekly_start_date?: number | null;
  weekly_target_weeks?: number | null;
  race_target_weeks?: number | null;
  race_target_date?: string | null;
}

// Obtiene los últimos logs y el historial agrupado por ejercicio en la nube
export const fetchExerciseLogs = async (
  userId: string,
  module: 'quick' | 'weekly'
): Promise<{
  currentLogs: Record<string, { weight: string; reps: string; completed: boolean }>;
  history: Record<string, HistoryEntry[]>;
}> => {
  if (!supabase || !userId) {
    return { currentLogs: {}, history: {} };
  }

  const { data, error } = await supabase
    .from('exercise_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('module', module)
    .order('logged_at', { ascending: true });

  if (error || !data) {
    console.error(error);
    return { currentLogs: {}, history: {} };
  }

  const rows = data as ExerciseLogRow[];
  const currentLogs: Record<string, { weight: string; reps: string; completed: boolean }> = {};
  const history: Record<string, HistoryEntry[]> = {};

  for (const row of rows) {
    const key = row.exercise_key;
    const weightStr = row.weight !== null && row.weight !== undefined ? String(row.weight) : '';
    const repsStr = row.reps !== null && row.reps !== undefined ? String(row.reps) : '';

    currentLogs[key] = {
      weight: weightStr,
      reps: repsStr,
      completed: row.completed,
    };

    if (weightStr && repsStr) {
      if (!history[key]) history[key] = [];
      history[key].push({
        weight: weightStr,
        reps: repsStr,
        date: new Date(row.logged_at).getTime(),
      });
    }
  }

  return { currentLogs, history };
};

// Guarda un evento de log en la nube para registrar pesos, repeticiones y finalización
export const saveExerciseLogCloud = async (
  userId: string,
  module: 'quick' | 'weekly',
  exerciseKey: string,
  weight: string,
  reps: string,
  completed: boolean
): Promise<boolean> => {
  if (!supabase || !userId) return false;

  const parsedWeight = parseFloat(weight.replace(',', '.'));
  const weightVal = !isNaN(parsedWeight) && parsedWeight > 0 ? parsedWeight : null;

  const { error } = await supabase.from('exercise_logs').insert({
    user_id: userId,
    module,
    exercise_key: exerciseKey,
    weight: weightVal,
    reps: reps.trim() || null,
    completed,
  });

  if (error) {
    console.error(error);
    return false;
  }
  return true;
};

// Carga el perfil del usuario desde Supabase
export const fetchUserProfileCloud = async (userId: string): Promise<UserProfileCloud | null> => {
  if (!supabase || !userId) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return null;
  }
  return data as UserProfileCloud;
};

// Actualiza los metadatos de perfil (nivel, rutina fijada, inicio de mesociclo, etc.)
export const updateUserProfileCloud = async (
  userId: string,
  updates: Partial<UserProfileCloud>
): Promise<boolean> => {
  if (!supabase || !userId) return false;

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) {
    console.error(error);
    return false;
  }
  return true;
};
