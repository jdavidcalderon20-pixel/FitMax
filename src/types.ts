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

export const getLevelDisplayName = (level: Level): string => {
  switch (level) {
    case 'A': return 'Base';
    case 'B': return 'Intermedio';
    case 'C': return 'Avanzado';
    default: return 'Intermedio';
  }
};

export const LEVELS = [
  {
    id: 'A' as Level,
    name: 'Base',
    simpleName: 'Base',
    label: 'Base',
    description: 'Estable, seguro y fácil de aprender. Fase de aprendizaje técnico.',
    phrase: 'Aprendes la técnica paso a paso con máquinas guiadas y peso corporal sin riesgo de lesión.'
  },
  {
    id: 'B' as Level,
    name: 'Intermedio',
    simpleName: 'Intermedio',
    label: 'Intermedio',
    description: 'Mayor carga, control y variedad con mancuernas, barras y poleas.',
    phrase: 'Conoces los movimientos básicos y buscas ganar fuerza sostenida.'
  },
  {
    id: 'C' as Level,
    name: 'Avanzado',
    simpleName: 'Avanzado',
    label: 'Avanzado',
    description: 'Alta demanda en barras libres y movimientos multiarticulares pesados.',
    phrase: 'Dominas la sobrecarga progresiva y ejercicios multiarticulares complejos.'
  },
];
