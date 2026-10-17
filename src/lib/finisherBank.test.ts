import { describe, it, expect } from 'vitest';
import { 
  FINISHER_EXERCISE_BANK, 
  getFinisherAlternatives 
} from './finisherBank';
import { findExerciseDetail } from './exerciseBank';

describe('finisherBank - Banco de ejercicios para Finishers (AMRAP)', () => {
  it('contiene ejercicios para los 3 tipos de Finisher (abs, complementary, activator)', () => {
    const absList = FINISHER_EXERCISE_BANK.filter((e) => e.type === 'abs');
    const compList = FINISHER_EXERCISE_BANK.filter((e) => e.type === 'complementary');
    const actList = FINISHER_EXERCISE_BANK.filter((e) => e.type === 'activator');

    expect(absList.length).toBeGreaterThanOrEqual(10);
    expect(compList.length).toBeGreaterThanOrEqual(10);
    expect(actList.length).toBeGreaterThanOrEqual(10);
  });

  it('permite filtrar alternativas de abdomen por equipamiento (ej. bodyweight si las poleas están ocupadas)', () => {
    const bodyweightAbs = getFinisherAlternatives('abs', '15 Abdominales en polea alta (Cable crunches)', 'bodyweight');
    expect(bodyweightAbs.length).toBeGreaterThanOrEqual(5);
    expect(bodyweightAbs.every((e) => e.equipmentGroup === 'bodyweight')).toBe(true);

    // Debe contener sustitutos clásicos de suelo sin máquinas
    const names = bodyweightAbs.map((e) => e.name);
    expect(names.some((n) => /crunch/i.test(n))).toBe(true);
    expect(names.some((n) => /bicicleta/i.test(n))).toBe(true);
    expect(names.some((n) => /plancha/i.test(n))).toBe(true);
  });

  it('permite filtrar alternativas por mancuerna o disco si el atleta prefiere carga libre sin poleas', () => {
    const freeWeightAbs = getFinisherAlternatives('abs', undefined, 'free_weight');
    expect(freeWeightAbs.length).toBeGreaterThanOrEqual(2);
    expect(freeWeightAbs.every((e) => e.equipmentGroup === 'free_weight')).toBe(true);
  });

  it('soporta búsqueda por texto (ej. "crunch", "plancha")', () => {
    const crunches = getFinisherAlternatives('abs', undefined, 'all', 'crunch');
    expect(crunches.length).toBeGreaterThanOrEqual(2);
    expect(crunches.every((e) => /crunch/i.test(e.name) || /crunch/i.test(e.targetFocus))).toBe(true);
  });

  it('ordena el ejercicio actual al inicio de la lista si coincide', () => {
    const currentName = '15 Abdominales en polea alta (Cable crunches)';
    const alternatives = getFinisherAlternatives('abs', currentName);
    expect(alternatives[0].name).toBe(currentName);
  });

  it('todos los ejercicios de abdomen del banco tienen descripción técnica e imágenes en findExerciseDetail', () => {
    const sampleExercises = [
      '15 Crunches en colchoneta controlados',
      '15 Abdominales bicicleta continuos',
      '15 Crunches con disco al pecho en colchoneta',
      '20 Giros rusos (Russian twists)',
      '10 Caminatas de oso (Bear crawls)',
      '30s Plancha abdominal isométrica'
    ];

    for (const exName of sampleExercises) {
      const detail = findExerciseDetail(exName);
      expect(detail).toBeDefined();
      expect(detail.muscleGroup).toBe('Core');
      expect(detail.steps.length).toBeGreaterThanOrEqual(2);
      expect(detail.demoImages).toBeDefined();
      expect(detail.demoImages?.[0]).toContain('.jpg');
    }
  });
});
