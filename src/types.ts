export type Level = 'A' | 'B' | 'C';

export interface Exercise {
  name: string;
  category: string;
  description?: string;
  // Objetivo científico de entrenamiento: series, rango de repeticiones y descanso sugerido (segundos)
  defaultSets?: number;
  defaultReps?: string;
  restSeconds?: number;
}

export interface GeneratedRoutine {
  sessionA: Exercise[];
  sessionB: Exercise[];
}

export const LEVELS = [
  {
    id: 'A',
    name: 'Nivel A: Base / Aprendizaje',
    description: 'Estable, seguro y fácil de aprender. Fase 0 y 1.',
  },
  {
    id: 'B',
    name: 'Nivel B: Intermedio / Fuerza',
    description: 'Más carga y más control. Fase 2 y 3.',
  },
  {
    id: 'C',
    name: 'Nivel C: Avanzado',
    description: 'Alta demanda, exige técnica perfecta. Fase 4.',
  },
];
