import { describe, it, expect } from 'vitest';
import { generateWeeklyRoutine, getDefaultAbsAmrap } from './weeklyGenerator';

describe('weeklyGenerator - Generación de AMRAP de Abdomen', () => {
  it('getDefaultAbsAmrap genera un bloque AMRAP válido para cada día', () => {
    for (let day = 1; day <= 5; day++) {
      const amrap = getDefaultAbsAmrap(day);
      expect(amrap).toBeDefined();
      expect(amrap.name).toContain('AMRAP Abdomen');
      expect(amrap.durationMinutes).toBe(7);
      expect(amrap.exercises.length).toBeGreaterThanOrEqual(3);
      expect(amrap.instructions.length).toBeGreaterThan(10);
    }
  });

  it('asigna amrapAbs a todos los días en la rutina estándar de 4 días', () => {
    const routine = generateWeeklyRoutine('B', 'standard', 4);
    for (const dayId of [1, 2, 3, 4]) {
      const day = routine[dayId];
      expect(day).toBeDefined();
      expect(day.amrapComplementary).toBeDefined();
      expect(day.amrapActivator).toBeDefined();
      expect(day.amrapAbs).toBeDefined();
      expect(day.amrapAbs?.name).toContain('AMRAP Abdomen');
      expect(day.amrapAbs?.exercises.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('asigna amrapAbs a todos los días en la rutina estándar de 5 días', () => {
    const routine = generateWeeklyRoutine('C', 'standard', 5);
    for (const dayId of [1, 2, 3, 4, 5]) {
      const day = routine[dayId];
      expect(day).toBeDefined();
      expect(day.amrapAbs).toBeDefined();
      expect(day.amrapAbs?.durationMinutes).toBe(7);
    }
  });

  it('asigna amrapAbs a todos los días en la rutina Full Body de 3 días', () => {
    const routine = generateWeeklyRoutine('A', 'standard', 3);
    for (const dayId of [1, 2, 3]) {
      const day = routine[dayId];
      expect(day).toBeDefined();
      expect(day.amrapAbs).toBeDefined();
      expect(day.amrapAbs?.exercises.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('asigna amrapAbs a todos los días en la rutina con enfoque de glúteos', () => {
    const routine = generateWeeklyRoutine('B', 'glutes', 4);
    for (const dayId of [1, 2, 3, 4]) {
      const day = routine[dayId];
      expect(day).toBeDefined();
      expect(day.amrapAbs).toBeDefined();
      expect(day.amrapAbs?.name).toContain('AMRAP Abdomen');
    }
  });
});
