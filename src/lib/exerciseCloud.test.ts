import { describe, it, expect } from 'vitest';
import {
  fetchExerciseLogs,
  saveExerciseLogCloud,
  fetchUserProfileCloud,
  updateUserProfileCloud,
} from './exerciseCloud';

describe('exerciseCloud (entorno de pruebas sin Supabase)', () => {
  it('fetchExerciseLogs se degrada a objetos vacíos si supabase es null', async () => {
    const res = await fetchExerciseLogs('user-123', 'weekly');
    expect(res).toEqual({ currentLogs: {}, history: {} });
  });

  it('saveExerciseLogCloud retorna false con gracia si supabase es null', async () => {
    const res = await saveExerciseLogCloud('user-123', 'weekly', 'A_day1_press', '50', '10', true);
    expect(res).toBe(false);
  });

  it('fetchUserProfileCloud retorna null si supabase es null', async () => {
    const res = await fetchUserProfileCloud('user-123');
    expect(res).toBeNull();
  });

  it('updateUserProfileCloud retorna false si supabase es null', async () => {
    const res = await updateUserProfileCloud('user-123', { nickname: 'Juan' });
    expect(res).toBe(false);
  });
});
