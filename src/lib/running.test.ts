import { describe, it, expect } from 'vitest';
import { calculatePace, getWeeklyRunStats, getVolumeFeedback, getPolarizationFeedback, RunLog } from './running';

// Replica la misma lógica de "inicio de semana en lunes" que usa el código fuente, para
// construir fechas de prueba que caigan de forma predecible en "esta semana" o "la anterior",
// sin importar qué día de la semana se ejecuten los tests.
function mondayStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const thisMonday = mondayStart(new Date()).getTime();
const midThisWeek = thisMonday + 2 * DAY_MS; // miércoles de esta semana
const midLastWeek = thisMonday - 4 * DAY_MS; // jueves de la semana pasada

const makeLog = (overrides: Partial<RunLog>): RunLog => ({
  id: Math.random().toString(),
  date: midThisWeek,
  distanceKm: 5,
  durationMin: 30,
  type: 'facil',
  rpe: 5,
  ...overrides,
});

describe('calculatePace', () => {
  it('calcula el ritmo en min/km correctamente', () => {
    expect(calculatePace(5, 30)).toBe('6:00/km');
  });

  it('redondea correctamente los segundos', () => {
    expect(calculatePace(10, 47)).toBe('4:42/km');
  });

  it('devuelve "--" si distancia o duración son inválidas', () => {
    expect(calculatePace(0, 30)).toBe('--');
    expect(calculatePace(5, 0)).toBe('--');
  });
});

describe('getWeeklyRunStats', () => {
  it('filtra solo las carreras de la semana solicitada', () => {
    const logs = [
      makeLog({ date: midThisWeek, distanceKm: 5 }),
      makeLog({ date: midLastWeek, distanceKm: 100 }), // no debe contarse en la semana actual
    ];
    const stats = getWeeklyRunStats(logs, 0);
    expect(stats.totalKm).toBe(5);
    expect(stats.sessionCount).toBe(1);
  });

  it('calcula el % fácil vs. moderado-fuerte', () => {
    const logs = [
      makeLog({ date: midThisWeek, distanceKm: 8, type: 'facil' }),
      makeLog({ date: midThisWeek, distanceKm: 2, type: 'series' }),
    ];
    const stats = getWeeklyRunStats(logs, 0);
    expect(stats.easyPct).toBe(80);
    expect(stats.hardPct).toBe(20);
  });

  it('devuelve ceros cuando no hay carreras esa semana', () => {
    const stats = getWeeklyRunStats([], 0);
    expect(stats.totalKm).toBe(0);
    expect(stats.sessionCount).toBe(0);
    expect(stats.easyPct).toBe(0);
  });
});

describe('getVolumeFeedback', () => {
  it('devuelve null si falta alguna de las dos semanas para comparar', () => {
    const logs = [makeLog({ date: midThisWeek, distanceKm: 5 })];
    expect(getVolumeFeedback(logs)).toBeNull();
  });

  it('avisa cuando el volumen sube más de 10% frente a la semana pasada', () => {
    const logs = [
      makeLog({ date: midLastWeek, distanceKm: 10 }),
      makeLog({ date: midThisWeek, distanceKm: 15 }), // +50%
    ];
    const feedback = getVolumeFeedback(logs);
    expect(feedback?.level).toBe('watch');
  });

  it('marca como "ok" una progresión razonable', () => {
    const logs = [
      makeLog({ date: midLastWeek, distanceKm: 10 }),
      makeLog({ date: midThisWeek, distanceKm: 10.5 }), // +5%
    ];
    const feedback = getVolumeFeedback(logs);
    expect(feedback?.level).toBe('ok');
  });
});

describe('getPolarizationFeedback (regla 80/20)', () => {
  it('devuelve null si no hay volumen esa semana', () => {
    expect(getPolarizationFeedback({ totalKm: 0, totalMin: 0, sessionCount: 0, easyPct: 0, hardPct: 0 })).toBeNull();
  });

  it('avisa si el % fácil está muy por debajo de 80/20', () => {
    const feedback = getPolarizationFeedback({ totalKm: 10, totalMin: 60, sessionCount: 2, easyPct: 40, hardPct: 60 });
    expect(feedback).toContain('falta');
  });

  it('confirma cuando el reparto está cerca de 80/20', () => {
    const feedback = getPolarizationFeedback({ totalKm: 10, totalMin: 60, sessionCount: 2, easyPct: 80, hardPct: 20 });
    expect(feedback).toContain('recomendado');
  });
});
