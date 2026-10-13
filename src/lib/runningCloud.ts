// Capa de acceso a datos en la nube para el módulo Running. Cuando no hay proyecto Supabase
// configurado, cada función devuelve un valor seguro (array vacío / null / false) en vez de
// lanzar un error, para que el resto de la app pueda seguir funcionando en modo local.
import { supabase } from './supabaseClient';
import { RunLog, RunType } from './running';

interface RunningLogRow {
  id: string;
  run_date: string;
  distance_km: number;
  duration_min: number;
  run_type: RunType;
  rpe: number;
  notes: string | null;
}

const rowToRunLog = (row: RunningLogRow): RunLog => ({
  id: row.id,
  date: new Date(row.run_date).getTime(),
  distanceKm: row.distance_km,
  durationMin: row.duration_min,
  type: row.run_type,
  rpe: row.rpe,
  notes: row.notes ?? undefined,
});

export const fetchRunLogs = async (userId: string): Promise<RunLog[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('running_logs')
    .select('*')
    .eq('user_id', userId)
    .order('run_date', { ascending: false });
  if (error || !data) {
    console.error(error);
    return [];
  }
  return (data as RunningLogRow[]).map(rowToRunLog);
};

export const addRunLogCloud = async (userId: string, log: Omit<RunLog, 'id'>): Promise<RunLog | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('running_logs')
    .insert({
      user_id: userId,
      run_date: new Date(log.date).toISOString().slice(0, 10),
      distance_km: log.distanceKm,
      duration_min: log.durationMin,
      run_type: log.type,
      rpe: log.rpe,
      notes: log.notes ?? null,
    })
    .select()
    .single();
  if (error || !data) {
    console.error(error);
    return null;
  }
  return rowToRunLog(data as RunningLogRow);
};

export const deleteRunLogCloud = async (id: string): Promise<boolean> => {
  if (!supabase) return false;
  const { error } = await supabase.from('running_logs').delete().eq('id', id);
  if (error) {
    console.error(error);
    return false;
  }
  return true;
};
