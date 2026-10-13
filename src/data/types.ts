export type Level = 'principiante' | 'intermedio' | 'avanzado';
export type Evidence = 'A' | 'B' | 'C';
export type Module = 'gym' | 'hiit' | 'running' | 'hyrox' | 'ocr';

export type Pattern = 
  | 'rodilla' 
  | 'bisagra' 
  | 'empuje_h' 
  | 'empuje_v' 
  | 'traccion_h' 
  | 'traccion_v'
  | 'unilateral' 
  | 'core' 
  | 'acarreo' 
  | 'potencia' 
  | 'brazos' 
  | 'gemelos'
  | 'prehab' 
  | 'cardio' 
  | 'especifico';

export interface ExerciseData {
  id: string;                    // snake_case único
  name: string;                  // Nombre amigable en español
  pattern: Pattern;              // Patrón biomecánico
  patternLabel: string;         // Explicación sencilla en español para novatos
  primary: string[];             // Músculos principales
  equipment: string[];           // 'barra', 'mancuernas', 'maquina', 'polea', 'peso_corporal', 'kettlebell', 'banda', 'trineo', 'erg'
  levels: Level[];               // Niveles recomendados
  evidence: Evidence;            // Nivel de respaldo (A, B, C)
  cues?: string[];               // 2-3 indicaciones técnicas clave
  regression?: string;           // id de versión más fácil
  progression?: string;          // id de versión más avanzada
  alternatives?: string[];       // ids intercambiables
  notes?: string;                // Nota práctica de seguridad o beneficio
}

export interface SetPrescription {
  sets: number;
  reps: string;                  // Ej: '5-8', '30s', '25m'
  rir?: number;                  // Repeticiones en reserva (0 a 3)
  restSec?: number;              // Tiempo de descanso en segundos
  load?: 'doble_progresion' | 'peso_corporal' | 'porcentaje_1rm' | 'rpe' | 'ritmo' | 'libre';
}

export interface SessionBlock {
  type: 'calentamiento' | 'principal' | 'accesorio' | 'enfriamiento' | 'complemento';
  title?: string;
  items: Array<{
    exerciseId?: string;
    text?: string;
    prescription?: SetPrescription;
  }>;
}

export interface Session {
  day: number;                   // 1..7 (1 = lunes)
  name: string;
  type: 'fuerza' | 'hipertrofia' | 'carrera' | 'series' | 'tempo' | 'rodaje' | 'velocidad'
      | 'fartlek' | 'motor' | 'hibrido' | 'tecnica' | 'test' | 'descanso' | 'movilidad';
  durationMin?: number;
  intensity?: string;            // 'RPE 7', 'Z1-2', '4:30-4:40/km'
  blocks: SessionBlock[];
}

export interface Plan {
  id: string;
  name: string;
  module: Module;
  level: Level;
  goal: string;
  weeks: Array<{
    week: number;
    label?: string;
    sessions: Session[];
  }>;
  daysPerWeek?: 3 | 4 | 5 | 6;
}

// Helpers amigables para atletas novatos y avanzados
export const EVIDENCE_INFO: Record<Evidence, { badge: string; color: string; label: string; explanation: string }> = {
  A: {
    badge: '⭐ Respaldo Alto',
    color: 'emerald',
    label: 'Evidencia Científica Alta (Nivel A)',
    explanation: 'Respaldado por múltiples estudios científicos y metanálisis en hipertrofia y fuerza.'
  },
  B: {
    badge: '✓ Respaldo Moderado',
    color: 'blue',
    label: 'Evidencia Científica Moderada (Nivel B)',
    explanation: 'Respaldado por estudios de activación muscular (EMG) y biomecánica deportiva aplicada.'
  },
  C: {
    badge: '• Práctica Segura',
    color: 'purple',
    label: 'Uso Práctico Tradicional (Nivel C)',
    explanation: 'Ejercicio clásico, seguro y de gran transferencia deportiva en el gimnasio.'
  }
};

export const PATTERN_LABELS: Record<Pattern, string> = {
  rodilla: 'Piernas (Cuádriceps y Rodilla)',
  bisagra: 'Cadena Posterior (Glúteos e Isquiotibiales)',
  empuje_h: 'Empuje Horizontal (Pecho y Tríceps)',
  empuje_v: 'Empuje Vertical (Hombros)',
  traccion_h: 'Tracción Horizontal (Espalda y Remos)',
  traccion_v: 'Tracción Vertical (Dorsales y Dominadas)',
  unilateral: 'A una pierna (Equilibrio y Glúteos)',
  core: 'Abdomen y Zona Media (Core)',
  acarreo: 'Fuerza de Agarre y Acarreos',
  potencia: 'Potencia y Saltos',
  brazos: 'Brazos (Bíceps y Tríceps)',
  gemelos: 'Pantorrillas (Gemelos y Sóleo)',
  prehab: 'Movilidad y Cuidado Articular',
  cardio: 'Cardio y Resistencia',
  especifico: 'Específico de Competencia'
};

export function getRirExplanation(rir?: number): string {
  if (rir === undefined) return '';
  switch (rir) {
    case 0:
      return 'RIR 0: Al fallo muscular técnico (máximo esfuerzo sin perder la postura).';
    case 1:
      return 'RIR 1: Detente cuando sientas que solo podrías hacer 1 repetición más.';
    case 2:
      return 'RIR 2: Detente cuando te queden unas 2 repeticiones en el tanque.';
    case 3:
      return 'RIR 3: Esfuerzo moderado-alto, terminando con margen de unas 3 repeticiones.';
    default:
      return `RIR ${rir}: Guarda un margen de ${rir} repeticiones antes del fallo.`;
  }
}
