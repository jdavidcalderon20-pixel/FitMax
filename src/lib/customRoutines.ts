import { supabase } from './supabaseClient';

export interface CustomExerciseItem {
  id: string;
  name: string;
  category: string;
  defaultSets: number;
  defaultReps: string;
  restSeconds?: number;
  description?: string;
}

export interface CustomRoutineDay {
  id: number;
  name: string;
  subtitle?: string;
  exercises: CustomExerciseItem[];
  amrap?: {
    enabled: boolean;
    durationMin: number;
    exercises: string[];
  };
}

export interface CustomRoutine {
  id: string;
  name: string;
  description?: string;
  targetWeeks: number;
  createdAt: number;
  days: CustomRoutineDay[];
}

const getStorageKey = (nickname: string) => `fit_custom_routines_${nickname || 'anon'}`;

export function getCustomRoutines(nickname: string): CustomRoutine[] {
  try {
    const raw = localStorage.getItem(getStorageKey(nickname));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error al leer rutinas personalizadas:', e);
    return [];
  }
}

export function saveCustomRoutine(
  nickname: string, 
  routine: Partial<CustomRoutine> & { name: string; days: CustomRoutineDay[] }
): CustomRoutine {
  const existing = getCustomRoutines(nickname);
  const fullRoutine: CustomRoutine = {
    id: routine.id || `custom_routine_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: routine.name.trim(),
    description: routine.description,
    targetWeeks: routine.targetWeeks || 4,
    createdAt: routine.createdAt || Date.now(),
    days: routine.days,
  };

  const index = existing.findIndex((r) => r.id === fullRoutine.id);
  let updated: CustomRoutine[];
  if (index !== -1) {
    updated = [...existing];
    updated[index] = fullRoutine;
  } else {
    updated = [fullRoutine, ...existing];
  }

  try {
    localStorage.setItem(getStorageKey(nickname), JSON.stringify(updated));
  } catch (e) {
    console.error('Error guardando rutina personalizada:', e);
  }

  // Sincronización en la nube opcional en background
  try {
    supabase.auth.getUser().then(({ data: authData }) => {
      const user = authData?.user;
      if (user) {
        supabase
          .from('profiles')
          .update({
            custom_routines: updated,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
          .then();
      }
    });
  } catch {}

  return fullRoutine;
}

export function deleteCustomRoutine(nickname: string, routineId: string): void {
  const existing = getCustomRoutines(nickname);
  const updated = existing.filter((r) => r.id !== routineId);
  try {
    localStorage.setItem(getStorageKey(nickname), JSON.stringify(updated));
  } catch (e) {
    console.error('Error al eliminar rutina personalizada:', e);
  }

  try {
    supabase.auth.getUser().then(({ data: authData }) => {
      const user = authData?.user;
      if (user) {
        supabase
          .from('profiles')
          .update({
            custom_routines: updated,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
          .then();
      }
    });
  } catch {}
}

// ========================================================
// MODO ENTRENADOR: ASIGNACIÓN Y RECEPCIÓN DE RUTINAS
// ========================================================
export interface CoachRoutineAssignment {
  id: string;
  coachNickname: string;
  targetRecipient: string; // nickname del alumno o nombre del grupo
  sentAt: number;
  coachMessage?: string;
  routine: CustomRoutine;
  acceptedBy?: string[];
}

const COACH_ASSIGNMENTS_KEY = 'fitmax_coach_assigned_routines_v1';

export function getCoachAssignedRoutines(): CoachRoutineAssignment[] {
  try {
    const raw = localStorage.getItem(COACH_ASSIGNMENTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export function sendRoutineFromCoach(assignment: Omit<CoachRoutineAssignment, 'id' | 'sentAt'>): CoachRoutineAssignment {
  const current = getCoachAssignedRoutines();
  const full: CoachRoutineAssignment = {
    ...assignment,
    id: `coach_assign_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    sentAt: Date.now(),
    acceptedBy: [],
  };
  const updated = [full, ...current];
  try {
    localStorage.setItem(COACH_ASSIGNMENTS_KEY, JSON.stringify(updated));
  } catch {}
  return full;
}

export function acceptCoachRoutineAssignment(nickname: string, assignmentId: string): CustomRoutine | null {
  const current = getCoachAssignedRoutines();
  const found = current.find((a) => a.id === assignmentId);
  if (!found) return null;

  // Guardar en las Rutinas Personalizadas del alumno
  const savedRoutine = saveCustomRoutine(nickname, {
    ...found.routine,
    id: `coach_${found.routine.id}_${Date.now()}`,
    name: `${found.routine.name} (Coach ${found.coachNickname})`,
    description: found.coachMessage || found.routine.description,
  });

  // Marcar como aceptada por este usuario
  const updated = current.map((a) =>
    a.id === assignmentId
      ? { ...a, acceptedBy: Array.from(new Set([...(a.acceptedBy || []), nickname])) }
      : a
  );
  try {
    localStorage.setItem(COACH_ASSIGNMENTS_KEY, JSON.stringify(updated));
  } catch {}

  return savedRoutine;
}

export function dismissCoachRoutineAssignment(nickname: string, assignmentId: string): void {
  const current = getCoachAssignedRoutines();
  const updated = current.map((a) =>
    a.id === assignmentId
      ? { ...a, acceptedBy: Array.from(new Set([...(a.acceptedBy || []), nickname])) }
      : a
  );
  try {
    localStorage.setItem(COACH_ASSIGNMENTS_KEY, JSON.stringify(updated));
  } catch {}
}

