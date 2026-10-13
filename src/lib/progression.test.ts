import { describe, it, expect } from 'vitest';
import { estimate1RM, parseRepRange, getProgressionSuggestion, pushHistoryEntry, MAX_HISTORY_ENTRIES } from './progression';

describe('estimate1RM (fórmula de Epley)', () => {
  it('calcula el 1RM estimado correctamente', () => {
    // 100kg x 10 reps -> 100 * (1 + 10/30) = 133.33
    expect(estimate1RM(100, 10)).toBeCloseTo(133.33, 1);
  });

  it('con 1 rep, el 1RM estimado es el propio peso', () => {
    expect(estimate1RM(100, 1)).toBe(100);
  });

  it('devuelve 0 si el peso o las reps son inválidos', () => {
    expect(estimate1RM(0, 10)).toBe(0);
    expect(estimate1RM(100, 0)).toBe(0);
    expect(estimate1RM(-5, 10)).toBe(0);
  });
});

describe('parseRepRange', () => {
  it('parsea un rango simple "8-10"', () => {
    expect(parseRepRange('8-10')).toEqual({ min: 8, max: 10 });
  });

  it('parsea rangos con texto adicional, como "10-12 por lado"', () => {
    expect(parseRepRange('10-12 por lado')).toEqual({ min: 10, max: 12 });
  });

  it('parsea un único número como min=max', () => {
    expect(parseRepRange('12')).toEqual({ min: 12, max: 12 });
  });

  it('devuelve null si no hay números o el input es undefined', () => {
    expect(parseRepRange(undefined)).toBeNull();
    expect(parseRepRange('al fallo')).toBeNull();
  });
});

describe('pushHistoryEntry', () => {
  it('agrega una entrada nueva al historial', () => {
    const result = pushHistoryEntry(undefined, { weight: '60', reps: '10', date: 1 });
    expect(result).toHaveLength(1);
  });

  it('respeta el tope máximo de entradas (rolling window)', () => {
    const history = Array.from({ length: MAX_HISTORY_ENTRIES }, (_, i) => ({
      weight: '60',
      reps: '10',
      date: i,
    }));
    const result = pushHistoryEntry(history, { weight: '62.5', reps: '10', date: 999 });
    expect(result).toHaveLength(MAX_HISTORY_ENTRIES);
    // La entrada más antigua se descarta, la nueva queda al final
    expect(result[result.length - 1].weight).toBe('62.5');
    expect(result[0].date).toBe(1); // se descartó la entrada date=0
  });
});

describe('getProgressionSuggestion (doble progresión)', () => {
  it('devuelve null si no hay historial', () => {
    expect(getProgressionSuggestion([], '8-10')).toBeNull();
    expect(getProgressionSuggestion(undefined, '8-10')).toBeNull();
  });

  it('sugiere subir peso cuando se completó el techo del rango de reps', () => {
    const history = [{ weight: '60', reps: '10', date: 1 }];
    const suggestion = getProgressionSuggestion(history, '8-10');
    expect(suggestion).not.toBeNull();
    expect(suggestion!.text).toContain('Sugerido hoy');
    expect(suggestion!.text).toMatch(/6[0-9](\.\d+)?kg/); // peso sugerido > 60kg
  });

  it('sugiere mantener el peso y subir reps si no se llegó al techo del rango', () => {
    const history = [{ weight: '60', reps: '8', date: 1 }];
    const suggestion = getProgressionSuggestion(history, '8-10');
    expect(suggestion).not.toBeNull();
    expect(suggestion!.text).toContain('60kg');
    expect(suggestion!.text).toContain('mismo peso');
  });

  it('devuelve null si el último registro tiene peso o reps inválidos', () => {
    const history = [{ weight: '', reps: '10', date: 1 }];
    expect(getProgressionSuggestion(history, '8-10')).toBeNull();
  });

  it('calcula la tendencia de fuerza estimada cuando hay 2+ registros', () => {
    const history = [
      { weight: '60', reps: '8', date: 1 },
      { weight: '65', reps: '8', date: 2 },
    ];
    const suggestion = getProgressionSuggestion(history, '6-8');
    expect(suggestion?.trend).toBeDefined();
    expect(suggestion?.trend).toContain('↑');
  });

  it('sin rango objetivo, muestra el último registro como referencia', () => {
    const history = [{ weight: '60', reps: '10', date: 1 }];
    const suggestion = getProgressionSuggestion(history, undefined);
    expect(suggestion?.text).toBe('Última vez: 60kg × 10 reps');
  });
});
