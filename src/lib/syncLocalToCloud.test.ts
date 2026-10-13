import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { hasLocalDataToSync, syncLocalDataToCloud } from './syncLocalToCloud';

const mockStorage: Record<string, string> = {};

const localStorageMock = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, val: string) => { mockStorage[key] = val; },
  removeItem: (key: string) => { delete mockStorage[key]; },
  clear: () => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  },
};

describe('syncLocalToCloud', () => {
  const originalLocalStorage = globalThis.localStorage;

  beforeEach(() => {
    (globalThis as any).localStorage = localStorageMock;
    localStorageMock.clear();
  });

  afterAll(() => {
    (globalThis as any).localStorage = originalLocalStorage;
  });

  it('hasLocalDataToSync devuelve false si no hay datos en localStorage', () => {
    expect(hasLocalDataToSync('Juan')).toBe(false);
  });

  it('hasLocalDataToSync devuelve true cuando hay carreras locales', () => {
    localStorageMock.setItem(
      'fit_gen_Juan_running_logs_v1',
      JSON.stringify([{ id: '1', date: Date.now(), distanceKm: 5, durationMin: 30, type: 'facil' }])
    );
    expect(hasLocalDataToSync('Juan')).toBe(true);
  });

  it('hasLocalDataToSync devuelve true cuando hay sesiones hyrox/ocr locales', () => {
    localStorageMock.setItem(
      'fit_gen_Juan_hyroxocr_completed_v1',
      JSON.stringify({ hyrox_base_day0: true })
    );
    expect(hasLocalDataToSync('Juan')).toBe(true);
  });

  it('hasLocalDataToSync devuelve true cuando hay logs de ejercicios locales', () => {
    localStorageMock.setItem(
      'fit_gen_Juan_weekly_logs_v1',
      JSON.stringify({ 'A_day1_press': { weight: '60', reps: '10', completed: true } })
    );
    expect(hasLocalDataToSync('Juan')).toBe(true);
  });

  it('syncLocalDataToCloud se degrada a valores seguros sin supabase configurado en test', async () => {
    const res = await syncLocalDataToCloud('test-uid', 'Juan');
    expect(res).toEqual({
      runningImported: 0,
      hyroxOcrImported: 0,
      exerciseLogsImported: 0,
      profileSynced: false,
    });
  });
});
