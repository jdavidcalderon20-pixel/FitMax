import { describe, it, expect } from 'vitest';
import { findExerciseDetail } from './exerciseBank';
import { FUNCTIONAL_ROUTINES } from '../data/functionalRoutinesData';

describe('HIIT & Functional Exercises (hiitFunctional.test.ts)', () => {
  const exercisesToTest = [
    'Burpees completos',
    'Arrancada con mancuerna (Snatch)',
    'Saltos de tijera (Jumping jacks)',
    'Escaladores (Mountain climbers)',
    'Sentadillas con salto',
    'Zancadas con salto alternadas',
    'Flexiones explosivas',
    'Plancha con saltos de pies',
    'Rodillas arriba',
    'Balanceos con pesa rusa (Kettlebell swings)',
    'Patinadores laterales (Skaters)',
    'Flexiones comando',
    'Hollow rocks de abdomen',
    'Saltos de cuerda virtuales',
    'Cinta de correr a buen ritmo',
    'Bicicleta estática intensa',
    'Remo en máquina (Rowing)',
    'SkiErg (máquina de esquí)',
    'Empuje de trineo (Sled push)',
    'Thruster con kettlebells o mancuernas',
    'Cargada con kettlebell o mancuerna (Clean)',
    'Saltos al cajón (Box jumps)',
    'Cuerdas de batalla (Battling ropes)',
    'Zancadas caminando (Walking Lunges)'
  ];

  it('resuelve cada ejercicio de HIIT y Funcional con imágenes de demostración válidas', () => {
    exercisesToTest.forEach((exName) => {
      const detail = findExerciseDetail(exName);
      expect(detail).toBeDefined();
      expect(detail.name).toBe(exName);
      expect(detail.demoImages).toBeDefined();
      expect(detail.demoImages!.length).toBeGreaterThanOrEqual(1);
      expect(detail.steps.length).toBeGreaterThanOrEqual(2);
      expect(detail.commonMistakes.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('verifica que todas las rutinas funcionales tengan estaciones con ejercicios válidos', () => {
    expect(FUNCTIONAL_ROUTINES.length).toBeGreaterThanOrEqual(4);
    FUNCTIONAL_ROUTINES.forEach((routine) => {
      expect(routine.stations.length).toBeGreaterThanOrEqual(4);
      routine.stations.forEach((station) => {
        const detail = findExerciseDetail(station.name);
        expect(detail).toBeDefined();
        expect(detail.demoImages).toBeDefined();
      });
    });
  });
});
