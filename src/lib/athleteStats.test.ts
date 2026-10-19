import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { getAthleteWeeklySummary, getStartOfWeek } from './athleteStats';

const mockStorage: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, val: string) => { mockStorage[key] = val; },
  removeItem: (key: string) => { delete mockStorage[key]; },
  clear: () => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  },
};

describe('athleteStats', () => {
  const originalLocalStorage = globalThis.localStorage;

  beforeEach(() => {
    (globalThis as any).localStorage = localStorageMock;
    localStorageMock.clear();
  });

  afterAll(() => {
    (globalThis as any).localStorage = originalLocalStorage;
  });

  it('calculates default initial stats when storage is empty', () => {
    const summary = getAthleteWeeklySummary('juan');
    expect(summary.totalWorkouts).toBe(0);
    expect(summary.totalRunningKm).toBe(0);
    expect(summary.compliancePercentage).toBe(0);
    expect(summary.loadStatus).toBe('recuperacion');
    expect(summary.recentHighlights.length).toBeGreaterThan(0);
  });

  it('aggregates running logs recorded during current week', () => {
    const now = Date.now();
    const fakeLogs = [
      { id: '1', date: now, distanceKm: 5.0, durationMin: 27.5, type: 'facil' },
      { id: '2', date: now, distanceKm: 7.0, durationMin: 35.0, type: 'tempo' }
    ];
    localStorage.setItem('fit_gen_juan_running_logs_v1', JSON.stringify(fakeLogs));

    const summary = getAthleteWeeklySummary('juan');
    expect(summary.totalRunningKm).toBe(12.0);
    expect(summary.runningMinutes).toBe(62.5);
    expect(summary.runningPaceAvg).toBe('5:12/km');
  });

  it('aggregates completed gym logs and tonnage', () => {
    const fakeGymLogs = {
      'B_day1_Press': { weight: '60', reps: '10', completed: true },
      'B_day1_Sentadilla': { weight: '80', reps: '8', completed: true },
      'B_day1_Remo': { weight: '50', reps: '10', completed: false }
    };
    localStorage.setItem('fit_gen_juan_weekly_logs_v1', JSON.stringify(fakeGymLogs));

    const summary = getAthleteWeeklySummary('juan');
    expect(summary.gymSetsCompleted).toBe(2);
    // Tonnage = (60 * 10) + (80 * 8) = 600 + 640 = 1240
    expect(summary.estimatedTonnageKg).toBe(1240);
  });

  it('computes start of week as a timestamp corresponding to Monday', () => {
    const start = getStartOfWeek(new Date('2026-10-18T12:00:00Z')); // Sunday
    const startDate = new Date(start);
    expect(startDate.getDay()).toBe(1); // Monday
  });
});
