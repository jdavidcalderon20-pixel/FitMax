import { describe, it, expect } from 'vitest';
import { fetchRunLogs, addRunLogCloud, deleteRunLogCloud } from './runningCloud';

// En el entorno de pruebas no hay proyecto Supabase configurado (no hay .env.local), así que
// `supabase` es null. Estas pruebas confirman que la capa de datos se degrada de forma segura
// en vez de lanzar un error cuando la nube no está disponible — el comportamiento real contra
// una base de datos viva solo se puede verificar con un proyecto Supabase real.
describe('runningCloud sin Supabase configurado', () => {
  it('fetchRunLogs devuelve un array vacío en vez de fallar', async () => {
    const logs = await fetchRunLogs('user-123');
    expect(logs).toEqual([]);
  });

  it('addRunLogCloud devuelve null en vez de fallar', async () => {
    const result = await addRunLogCloud('user-123', {
      date: Date.now(),
      distanceKm: 5,
      durationMin: 30,
      type: 'facil',
      rpe: 5,
    });
    expect(result).toBeNull();
  });

  it('deleteRunLogCloud devuelve false en vez de fallar', async () => {
    const result = await deleteRunLogCloud('log-123');
    expect(result).toBe(false);
  });
});
