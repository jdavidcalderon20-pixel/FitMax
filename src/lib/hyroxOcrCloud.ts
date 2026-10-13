// Capa de acceso a datos en la nube para Hyrox/OCR. El modelo de datos es un "registro de
// finalización": cada fila en hyroxocr_sessions representa una vez que se completó esa sesión.
// Sin proyecto Supabase configurado, cada función se degrada a un valor seguro en vez de fallar.
import { supabase } from './supabaseClient';

interface HyroxOcrSessionRow {
  discipline: string;
  level: string;
  day_index: number;
}

const keyOf = (discipline: string, level: string, dayIndex: number) => `${discipline}_${level}_day${dayIndex}`;

// Devuelve el conjunto de claves "disciplina_nivel_dayN" que ya están marcadas como completadas
export const fetchCompletedSessions = async (userId: string): Promise<Set<string>> => {
  if (!supabase) return new Set();
  const { data, error } = await supabase
    .from('hyroxocr_sessions')
    .select('discipline, level, day_index')
    .eq('user_id', userId);
  if (error || !data) {
    console.error(error);
    return new Set();
  }
  return new Set((data as HyroxOcrSessionRow[]).map((r) => keyOf(r.discipline, r.level, r.day_index)));
};

export const markSessionCompleteCloud = async (
  userId: string,
  discipline: string,
  level: string,
  dayIndex: number
): Promise<boolean> => {
  if (!supabase) return false;
  const { error } = await supabase
    .from('hyroxocr_sessions')
    .insert({ user_id: userId, discipline, level, day_index: dayIndex });
  if (error) {
    console.error(error);
    return false;
  }
  return true;
};

export const markSessionIncompleteCloud = async (
  userId: string,
  discipline: string,
  level: string,
  dayIndex: number
): Promise<boolean> => {
  if (!supabase) return false;
  const { error } = await supabase
    .from('hyroxocr_sessions')
    .delete()
    .eq('user_id', userId)
    .eq('discipline', discipline)
    .eq('level', level)
    .eq('day_index', dayIndex);
  if (error) {
    console.error(error);
    return false;
  }
  return true;
};
