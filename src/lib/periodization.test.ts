import { describe, it, expect } from 'vitest';
import { getPhaseFromWeeks, calculateWeeksUntilDate } from './periodization';
import { calculateAutoregulation, PostWorkoutFeedback } from './autoregulation';

describe('Periodización Inversa (periodization.ts)', () => {
  it('identifica correctamente las 4 fases según las semanas restantes para un evento de 12 semanas', () => {
    // 12 semanas restantes -> Fase 1: Base
    const phaseBase = getPhaseFromWeeks(12, 12);
    expect(phaseBase.phase).toBe('base');
    expect(phaseBase.volumeMultiplier).toBeLessThanOrEqual(1.0);

    // 7 semanas restantes -> Fase 2: Potencia
    const phasePower = getPhaseFromWeeks(7, 12);
    expect(phasePower.phase).toBe('potencia');
    expect(phasePower.volumeMultiplier).toBeGreaterThan(1.0);

    // 4 semanas restantes -> Fase 3: Compromised Running & Simulacros
    const phaseComp = getPhaseFromWeeks(4, 12);
    expect(phaseComp.phase).toBe('compromised');

    // 1 semana restante -> Fase 4: Tapering
    const phaseTaper = getPhaseFromWeeks(1, 12);
    expect(phaseTaper.phase).toBe('tapering');
    expect(phaseTaper.volumeMultiplier).toBeLessThan(0.7);
  });

  it('calculateWeeksUntilDate devuelve número positivo coherente', () => {
    const futureDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const weeks = calculateWeeksUntilDate(futureDate);
    expect(weeks).toBeGreaterThanOrEqual(1);
  });
});

describe('Autorregulación Adaptativa (autoregulation.ts)', () => {
  it('reduce volumen y emite advertencia si hay molestia articular', () => {
    const feedback: PostWorkoutFeedback = {
      sessionId: 's1',
      discipline: 'hyrox',
      perceivedIntensity: 'adecuado',
      repsCompletion: 'completas',
      jointFatigue: 'molestia_articular',
      loggedAt: Date.now(),
    };
    const adj = calculateAutoregulation(feedback);
    expect(adj.alertType).toBe('warning');
    expect(adj.factor).toBeLessThan(1.0);
    expect(adj.feedbackTitle).toContain('articular');
  });

  it('sugiere sobrecarga progresiva si la sesión fue percibida muy suave con reps completas', () => {
    const feedback: PostWorkoutFeedback = {
      sessionId: 's2',
      discipline: 'hyrox',
      perceivedIntensity: 'muy_suave',
      repsCompletion: 'completas',
      jointFatigue: 'ninguna',
      loggedAt: Date.now(),
    };
    const adj = calculateAutoregulation(feedback);
    expect(adj.alertType).toBe('success');
    expect(adj.factor).toBeGreaterThan(1.0);
  });

  it('mantiene la carga si se llegó al límite para evitar sobreentrenamiento', () => {
    const feedback: PostWorkoutFeedback = {
      sessionId: 's3',
      discipline: 'ocr',
      perceivedIntensity: 'al_limite',
      repsCompletion: 'incompletas',
      jointFatigue: 'muscular_normal',
      loggedAt: Date.now(),
    };
    const adj = calculateAutoregulation(feedback);
    expect(adj.alertType).toBe('info');
    expect(adj.factor).toBeLessThanOrEqual(1.0);
  });
});
