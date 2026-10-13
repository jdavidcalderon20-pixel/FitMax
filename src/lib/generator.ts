import { Level, GeneratedRoutine, Exercise } from '../types';
import { exerciseData } from '../data';

const getRandomItem = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

// --- PARÁMETROS CIENTÍFICOS POR CATEGORÍA Y NIVEL ---
// Series, repeticiones y descanso sugeridos con base en evidencia de fuerza/hipertrofia:
// - Rangos de repeticiones amplios son efectivos para hipertrofia siempre que el esfuerzo se
//   acerque al fallo (Schoenfeld, Grgic & Krieger, 2021).
// - El descanso ≥90-120s en compuestos pesados preserva mejor el rendimiento entre series que
//   descansos cortos (Grgic et al. 2017; Schoenfeld et al. 2016, "Longer Interset Rest Periods
//   Enhance Muscle Strength and Hypertrophy in Resistance-Trained Men").
// - Los accesorios/aislamiento toleran mayor proximidad al fallo (menor RIR) con menor costo
//   sistémico que los grandes compuestos multiarticulares.
interface ExerciseParams {
  sets: number;
  reps: string;
  restSeconds: number;
}

const getExerciseParams = (category: string, level: Level): ExerciseParams => {
  const cat = category.toLowerCase();

  // Movimientos compuestos principales (multiarticulares, alta demanda técnica y sistémica)
  const isMainCompound =
    cat.includes('dominante') ||
    cat.includes('empuje horizontal') ||
    cat.includes('empuje vertical') ||
    cat.includes('tracción horizontal') ||
    cat.includes('tracción vertical');

  if (isMainCompound) {
    // Reps más altas en nivel A (aprendizaje motor y tendinoso), más bajas y pesadas en nivel C
    const reps = level === 'A' ? '10-12' : level === 'B' ? '8-10' : '6-8';
    return { sets: level === 'C' ? 4 : 3, reps, restSeconds: 120 };
  }

  if (cat.includes('unilateral')) {
    return { sets: 3, reps: '10-12 por lado', restSeconds: 90 };
  }

  if (cat.includes('core')) {
    return { sets: 3, reps: level === 'C' ? '15-20' : '12-15', restSeconds: 45 };
  }

  // Accesorios / aislamiento / brazos: toleran mayor proximidad al fallo con menor costo sistémico
  const reps = level === 'A' ? '12-15' : level === 'B' ? '10-12' : '8-12';
  return { sets: 3, reps, restSeconds: 60 };
};

const buildExercise = (category: string, name: string, level: Level, description?: string): Exercise => {
  const params = getExerciseParams(category, level);
  return {
    category,
    name,
    description,
    defaultSets: params.sets,
    defaultReps: params.reps,
    restSeconds: params.restSeconds,
  };
};

export const generateRoutine = (level: Level): GeneratedRoutine => {
  // --- SESIÓN A: TREN INFERIOR ---
  const sessionA: Exercise[] = [
    buildExercise('1 Dominante de Rodilla', getRandomItem(exerciseData.sessionA.kneeDominant[level]), level),
    buildExercise('1 Dominante de Cadera', getRandomItem(exerciseData.sessionA.hipDominant[level]), level),
    buildExercise(
      '1 Unilateral',
      getRandomItem(exerciseData.sessionA.unilateral),
      level,
      'Elige predominio de rodilla o cadera según necesidad'
    ),
    buildExercise('Accesorio 1 (Rodilla)', getRandomItem(exerciseData.sessionA.accessoriesKnee), level),
    buildExercise('Accesorio 2 (Isquios/Glúteo)', getRandomItem(exerciseData.sessionA.accessoriesHip), level),
  ];

  // --- SESIÓN B: TREN SUPERIOR ---
  const sessionB: Exercise[] = [
    buildExercise('Empuje Horizontal', getRandomItem(exerciseData.sessionB.pushHorizontal[level]), level),
    buildExercise('Empuje Vertical', getRandomItem(exerciseData.sessionB.pushVertical[level]), level),
    buildExercise('Tracción Horizontal', getRandomItem(exerciseData.sessionB.pullHorizontal[level]), level),
    buildExercise('Tracción Vertical', getRandomItem(exerciseData.sessionB.pullVertical[level]), level),
    buildExercise('Brazos (Bíceps)', getRandomItem(exerciseData.sessionB.arms.biceps), level),
    buildExercise('Brazos (Tríceps)', getRandomItem(exerciseData.sessionB.arms.triceps), level),
    buildExercise('Core y Más', getRandomItem(exerciseData.sessionB.core), level),
  ];

  return { sessionA, sessionB };
};
