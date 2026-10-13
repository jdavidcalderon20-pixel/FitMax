import { supabase } from './supabaseClient';
import { RunLog } from './running';

export interface SyncResult {
  runningImported: number;
  hyroxOcrImported: number;
  exerciseLogsImported: number;
  profileSynced: boolean;
}

// Comprueba si existen datos locales guardados para el apodo actual
export const hasLocalDataToSync = (nickname: string): boolean => {
  if (!nickname || typeof localStorage === 'undefined') return false;
  try {
    const runKey = `fit_gen_${nickname}_running_logs_v1`;
    const hyroxKey = `fit_gen_${nickname}_hyroxocr_completed_v1`;
    const weeklyLogsKey = `fit_gen_${nickname}_weekly_logs_v1`;
    const quickLogsKey = `fit_gen_${nickname}_logs_v2`;

    const runs = localStorage.getItem(runKey);
    const hyrox = localStorage.getItem(hyroxKey);
    const weekly = localStorage.getItem(weeklyLogsKey);
    const quick = localStorage.getItem(quickLogsKey);

    const hasRuns = runs && JSON.parse(runs).length > 0;
    const hasHyrox = hyrox && Object.keys(JSON.parse(hyrox)).length > 0;
    const hasWeekly = weekly && Object.keys(JSON.parse(weekly)).length > 0;
    const hasQuick = quick && Object.keys(JSON.parse(quick)).length > 0;

    return Boolean(hasRuns || hasHyrox || hasWeekly || hasQuick);
  } catch (e) {
    return false;
  }
};

// Sube los datos locales a Supabase sin sobreescribir ni duplicar registros existentes
export const syncLocalDataToCloud = async (userId: string, nickname: string): Promise<SyncResult> => {
  if (!supabase || !userId || !nickname) {
    return { runningImported: 0, hyroxOcrImported: 0, exerciseLogsImported: 0, profileSynced: false };
  }

  let runningImported = 0;
  let hyroxOcrImported = 0;
  let exerciseLogsImported = 0;
  let profileSynced = false;

  // 1. Sincronizar carreras locales
  try {
    const runKey = `fit_gen_${nickname}_running_logs_v1`;
    const savedRunsStr = localStorage.getItem(runKey);
    if (savedRunsStr) {
      const localRuns: RunLog[] = JSON.parse(savedRunsStr);
      if (localRuns.length > 0) {
        const { data: existingRuns } = await supabase
          .from('running_logs')
          .select('run_date, distance_km')
          .eq('user_id', userId);

        const existingSet = new Set(
          (existingRuns || []).map((r) => `${r.run_date}_${Number(r.distance_km).toFixed(2)}`)
        );

        for (const log of localRuns) {
          const runDateStr = new Date(log.date).toISOString().slice(0, 10);
          const signature = `${runDateStr}_${Number(log.distanceKm).toFixed(2)}`;

          if (!existingSet.has(signature)) {
            const { error } = await supabase.from('running_logs').insert({
              user_id: userId,
              run_date: runDateStr,
              distance_km: log.distanceKm,
              duration_min: log.durationMin,
              run_type: log.type,
              rpe: log.rpe,
              notes: log.notes ?? null,
            });
            if (!error) {
              runningImported++;
              existingSet.add(signature);
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('Error sincronizando running a la nube', err);
  }

  // 2. Sincronizar sesiones completadas de Hyrox / OCR
  try {
    const hyroxKey = `fit_gen_${nickname}_hyroxocr_completed_v1`;
    const savedHyroxStr = localStorage.getItem(hyroxKey);
    if (savedHyroxStr) {
      const localCompleted: Record<string, boolean> = JSON.parse(savedHyroxStr);
      const keys = Object.keys(localCompleted).filter((k) => localCompleted[k]);

      if (keys.length > 0) {
        const { data: existingSessions } = await supabase
          .from('hyroxocr_sessions')
          .select('discipline, level, day_index')
          .eq('user_id', userId);

        const existingKeySet = new Set(
          (existingSessions || []).map((s) => `${s.discipline}_${s.level}_day${s.day_index}`)
        );

        for (const key of keys) {
          if (!existingKeySet.has(key)) {
            const parts = key.split('_');
            if (parts.length >= 3) {
              const discipline = parts[0];
              const level = parts[1];
              const dayIndex = parseInt(parts[2].replace('day', ''), 10);

              if (!isNaN(dayIndex)) {
                const { error } = await supabase.from('hyroxocr_sessions').insert({
                  user_id: userId,
                  discipline,
                  level,
                  day_index: dayIndex,
                });
                if (!error) {
                  hyroxOcrImported++;
                  existingKeySet.add(key);
                }
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('Error sincronizando hyrox/ocr a la nube', err);
  }

  // 3. Sincronizar logs de ejercicios (Weekly y Quick)
  try {
    const syncLogsForModule = async (storageKey: string, module: 'weekly' | 'quick') => {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const logsMap: Record<string, { weight?: string; reps?: string; completed?: boolean }> = JSON.parse(raw);
      
      const { data: existingRows } = await supabase
        .from('exercise_logs')
        .select('exercise_key')
        .eq('user_id', userId)
        .eq('module', module);

      const existingKeys = new Set((existingRows || []).map((r) => r.exercise_key));

      for (const [exKey, item] of Object.entries(logsMap)) {
        if (!existingKeys.has(exKey) && (item.weight || item.reps || item.completed)) {
          const parsedWeight = item.weight ? parseFloat(item.weight.replace(',', '.')) : null;
          const { error } = await supabase.from('exercise_logs').insert({
            user_id: userId,
            module,
            exercise_key: exKey,
            weight: !isNaN(Number(parsedWeight)) && Number(parsedWeight) > 0 ? parsedWeight : null,
            reps: item.reps ? String(item.reps).trim() : null,
            completed: Boolean(item.completed),
          });
          if (!error) {
            exerciseLogsImported++;
            existingKeys.add(exKey);
          }
        }
      }
    };

    await syncLogsForModule(`fit_gen_${nickname}_weekly_logs_v1`, 'weekly');
    await syncLogsForModule(`fit_gen_${nickname}_logs_v2`, 'quick');
  } catch (err) {
    console.error('Error sincronizando logs de ejercicios a la nube', err);
  }

  // 4. Sincronizar perfil (rutina semanal, semanas objetivo)
  try {
    const weeklyRoutineStr = localStorage.getItem(`fit_gen_${nickname}_weekly_routine_v1`);
    const weeklyStartStr = localStorage.getItem(`fit_gen_${nickname}_weekly_start_date`);
    const weeklyTargetStr = localStorage.getItem(`fit_gen_${nickname}_weekly_mesocycle_target_weeks`);
    const raceTargetStr = localStorage.getItem(`fit_gen_${nickname}_race_target_weeks`);

    const profileUpdates: any = { nickname };
    if (weeklyRoutineStr) profileUpdates.weekly_routine = JSON.parse(weeklyRoutineStr);
    if (weeklyStartStr) profileUpdates.weekly_start_date = parseInt(weeklyStartStr, 10);
    if (weeklyTargetStr) profileUpdates.weekly_target_weeks = parseInt(weeklyTargetStr, 10);
    if (raceTargetStr) profileUpdates.race_target_weeks = parseInt(raceTargetStr, 10);

    const { error: profileError } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', userId);

    if (!profileError) {
      profileSynced = true;
    }
  } catch (err) {
    console.error('Error sincronizando perfil a la nube', err);
  }

  return { runningImported, hyroxOcrImported, exerciseLogsImported, profileSynced };
};
