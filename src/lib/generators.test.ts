import { describe, it, expect } from 'vitest';
import { generateRoutine } from './generator';
import { generateWeeklyRoutine, getAlternativeWeeklyExercises } from './weeklyGenerator';
import { Level } from '../types';

const LEVELS: Level[] = ['A', 'B', 'C'];

describe('generateRoutine (módulo Rápido)', () => {
  it('genera 5 ejercicios en la sesión A y 7 en la sesión B, para cada nivel', () => {
    LEVELS.forEach((level) => {
      const routine = generateRoutine(level);
      expect(routine.sessionA).toHaveLength(5);
      expect(routine.sessionB).toHaveLength(7);
    });
  });

  it('cada ejercicio trae series/reps objetivo asignados (no debe haber ejercicios "en blanco")', () => {
    const routine = generateRoutine('B');
    [...routine.sessionA, ...routine.sessionB].forEach((ex) => {
      expect(ex.name).toBeTruthy();
      expect(ex.category).toBeTruthy();
      expect(ex.defaultSets).toBeGreaterThan(0);
      expect(ex.defaultReps).toBeTruthy();
    });
  });
});

describe('generateWeeklyRoutine (Plan Semanal)', () => {
  it('genera los 4 días del split Torso/Pierna x Fuerza/Hipertrofia', () => {
    LEVELS.forEach((level) => {
      const routine = generateWeeklyRoutine(level);
      [1, 2, 3, 4].forEach((dayId) => {
        expect(routine[dayId]).toBeDefined();
        expect(routine[dayId].exercises.length).toBeGreaterThan(0);
      });
    });
  });

  it('cada ejercicio del plan semanal tiene nombre y categoría', () => {
    const routine = generateWeeklyRoutine('A');
    Object.values(routine).forEach((day) => {
      day.exercises.forEach((ex) => {
        expect(ex.name).toBeTruthy();
        expect(ex.category).toBeTruthy();
      });
    });
  });

  it('permite consultar ejercicios alternativos para cualquier día y posición sin romper la categoría', () => {
    const alternatives = getAlternativeWeeklyExercises(1, 0, 'B');
    expect(alternatives.length).toBeGreaterThanOrEqual(2);
    alternatives.forEach((alt) => {
      expect(alt.name).toBeTruthy();
      expect(alt.category).toBe('Empuje Horizontal (Fuerza)');
      expect(alt.defaultSets).toBe(4);
    });
  });

  it('genera correctamente la rutina especializada con Énfasis en Glúteos y Tren Inferior', () => {
    LEVELS.forEach((level) => {
      const gluteRoutine = generateWeeklyRoutine(level, 'glutes');
      expect(gluteRoutine[1].category).toBe('gluteos_fuerza');
      expect(gluteRoutine[2].category).toBe('torso_estetico');
      expect(gluteRoutine[3].category).toBe('gluteos_hipertrofia');
      expect(gluteRoutine[4].category).toBe('espalda_gluteos');

      expect(gluteRoutine[1].exercises[0].name.toLowerCase()).toMatch(/thrust|glute/i);
      expect(gluteRoutine[1].exercises).toHaveLength(5);
      expect(gluteRoutine[3].exercises).toHaveLength(5);
    });

    const altGlutes = getAlternativeWeeklyExercises(1, 0, 'B', 'glutes');
    expect(altGlutes.length).toBeGreaterThanOrEqual(2);
    expect(altGlutes[0].category).toContain('Glúteo Mayor');
  });

  it('genera correctamente rutinas de 5 días (estándar y glúteos) con alternativas en día 5', () => {
    LEVELS.forEach((level) => {
      const routine5 = generateWeeklyRoutine(level, 'standard', 5);
      expect(Object.keys(routine5)).toHaveLength(5);
      expect(routine5[5]).toBeDefined();
      expect(routine5[5].category).toBe('pierna_gluteos_bombeo');
      expect(routine5[5].exercises).toHaveLength(5);

      const glute5 = generateWeeklyRoutine(level, 'glutes', 5);
      expect(Object.keys(glute5)).toHaveLength(5);
      expect(glute5[5]).toBeDefined();
      expect(glute5[5].category).toBe('gluteos_bombeo');
      expect(glute5[5].exercises).toHaveLength(5);
    });

    const altDay5Std = getAlternativeWeeklyExercises(5, 0, 'B', 'standard');
    expect(altDay5Std.length).toBeGreaterThanOrEqual(2);
    expect(altDay5Std[0].category).toContain('Prensa');

    const altDay5Glute = getAlternativeWeeklyExercises(5, 0, 'B', 'glutes');
    expect(altDay5Glute.length).toBeGreaterThanOrEqual(2);
    expect(altDay5Glute[0].category).toContain('Kas Glute Bridge');
  });

  it('genera correctamente rutinas de 3 días Full Body (estándar y glúteos)', () => {
    LEVELS.forEach((level) => {
      const routine3 = generateWeeklyRoutine(level, 'standard', 3);
      expect(Object.keys(routine3)).toHaveLength(3);
      expect(routine3[1].category).toBe('fullbody_fuerza');
      expect(routine3[2].category).toBe('fullbody_hipertrofia');
      expect(routine3[3].category).toBe('fullbody_consolidacion');
      expect(routine3[1].exercises).toHaveLength(5);
      expect(routine3[2].exercises).toHaveLength(5);
      expect(routine3[3].exercises).toHaveLength(5);

      const glute3 = generateWeeklyRoutine(level, 'glutes', 3);
      expect(Object.keys(glute3)).toHaveLength(3);
      expect(glute3[1].category).toBe('gluteos_fuerza');
      expect(glute3[2].category).toBe('torso_estetico');
      expect(glute3[3].category).toBe('gluteos_hipertrofia');
      expect(glute3[1].exercises).toHaveLength(5);
    });

    const altDay1Std = getAlternativeWeeklyExercises(1, 0, 'B', 'standard', 3);
    expect(altDay1Std.length).toBeGreaterThanOrEqual(2);
    expect(altDay1Std[0].category).toContain('Rodilla');
  });
});


