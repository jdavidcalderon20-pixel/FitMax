import { describe, it, expect } from 'vitest';
import { fetchCompletedSessions, markSessionCompleteCloud, markSessionIncompleteCloud } from './hyroxOcrCloud';

// Sin proyecto Supabase configurado en este entorno de pruebas, confirmamos que la capa de datos
// se degrada de forma segura en vez de fallar. El comportamiento real contra una base de datos
// viva solo se puede verificar con un proyecto Supabase real.
describe('hyroxOcrCloud sin Supabase configurado', () => {
  it('fetchCompletedSessions devuelve un Set vacío en vez de fallar', async () => {
    const result = await fetchCompletedSessions('user-123');
    expect(result).toEqual(new Set());
  });

  it('markSessionCompleteCloud devuelve false en vez de fallar', async () => {
    const result = await markSessionCompleteCloud('user-123', 'hyrox', 'base', 0);
    expect(result).toBe(false);
  });

  it('markSessionIncompleteCloud devuelve false en vez de fallar', async () => {
    const result = await markSessionIncompleteCloud('user-123', 'hyrox', 'base', 0);
    expect(result).toBe(false);
  });
});
