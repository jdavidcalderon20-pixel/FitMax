// Protocolos de Cardio HIIT Científico y Salud Cardiovascular
// Respaldados por estudios clínicos sobre VO2 máx y quema eficiente en poco tiempo.

export interface HiitProtocol {
  id: string;
  name: string;
  shortDesc: string;
  workTimeSec: number;
  restTimeSec: number;
  rounds: number;
  totalDurationMin: number;
  intensityDesc: string;
  targetHrPercent: string;
  evidence: 'A' | 'B';
  evidenceLabel: string;
  bestFor: string;
  modality: string; // 'Bicicleta, Remo, SkiErg, Carrera o Circuito'
  tips: string[];
}

export const HIIT_PROTOCOLS: HiitProtocol[] = [
  {
    id: 'hiit_4x4',
    name: 'Noruego 4×4 (Estándar de Oro Clínico)',
    shortDesc: '4 minutos intensos por 3 minutos de trote o pedaleo suave. 4 repeticiones.',
    workTimeSec: 240,
    restTimeSec: 180,
    rounds: 4,
    totalDurationMin: 28,
    intensityDesc: 'Zona 4-5 (Fuerte, respiración muy agitada donde apenas puedes decir 2 palabras)',
    targetHrPercent: '85% a 95% FC Máx',
    evidence: 'A',
    evidenceLabel: 'Máxima Evidencia (Hospital Universitario de Trondheim, Noruega)',
    bestFor: 'Aumentar drásticamente tu consumo máximo de oxígeno (VO2 máx) y capacidad cardiovascular.',
    modality: 'Cinta de correr, bicicleta estática, remo indoor o SkiErg.',
    tips: [
      'No empieces al sprint descontrolado; busca un ritmo fuerte que puedas sostener los 4 minutos completos.',
      'En los 3 minutos de pausa no te detengas por completo: mantén un pedaleo o caminata suave.',
      'Excelente si solo tienes 1 o 2 días para cardio a la semana.'
    ]
  },
  {
    id: 'hiit_10x1',
    name: '10×1 Minuto (El Más Amigable para Iniciar)',
    shortDesc: '1 minuto a ritmo vivo por 1 minuto de recuperación suave. 10 repeticiones.',
    workTimeSec: 60,
    restTimeSec: 60,
    rounds: 10,
    totalDurationMin: 20,
    intensityDesc: 'Ritmo rápido pero controlable (puedes completarlo sin llegar al agotamiento prematuro)',
    targetHrPercent: '85% a 90% FC Máx',
    evidence: 'A',
    evidenceLabel: 'Evidencia Alta en Adaptación Aeróbica Segura',
    bestFor: 'Quienes quieren los beneficios del HIIT sin la fatiga mental de intervalos largos.',
    modality: 'Bicicleta, carrera, elíptica o remo.',
    tips: [
      'El intervalo de 1 minuto pasa rápido: concéntrate en mantener la cadencia constante.',
      'Usa el minuto de descanso para inhalar profundo por la nariz y exhalar por la boca.'
    ]
  },
  {
    id: 'hiit_tabata',
    name: 'Método Tabata (Express de 4 Minutos)',
    shortDesc: '20 segundos a máxima intensidad por solo 10 segundos de pausa. 8 rondas.',
    workTimeSec: 20,
    restTimeSec: 10,
    rounds: 8,
    totalDurationMin: 4,
    intensityDesc: 'Máximo esfuerzo sostenible (RPE 9 sobre 10)',
    targetHrPercent: '90%+ FC Máx',
    evidence: 'B',
    evidenceLabel: 'Respaldo Científico en Resistencia Anaeróbica',
    bestFor: 'Días con cero tiempo donde necesitas un estímulo metabólico fulminante.',
    modality: 'AirBike (bici de aire), skipping alto, saltos al cajón o sprints.',
    tips: [
      'Parece fácil los primeros 2 intervalos, pero a partir de la ronda 5 el lactato se acumula rápidamente.',
      'Calienta muy bien 5 minutos antes de arrancar este protocolo.'
    ]
  },
  {
    id: 'hiit_30_30',
    name: '30/30 (Ritmo Dinámico Ágil)',
    shortDesc: '30 segundos fuerte por 30 segundos de recuperación. 12 a 15 rondas.',
    workTimeSec: 30,
    restTimeSec: 30,
    rounds: 12,
    totalDurationMin: 12,
    intensityDesc: 'RPE 8 (Fuerte y constante)',
    targetHrPercent: '80% a 90% FC Máx',
    evidence: 'B',
    evidenceLabel: 'Respaldo en Deportes de Equipo y Corredores',
    bestFor: 'Simular cambios de ritmo en partidos de fútbol, baloncesto y carreras de media distancia.',
    modality: 'Cinta, carrera al aire libre o remo.',
    tips: [
      'Procura que los últimos 30 segundos sean a la misma velocidad que los primeros.'
    ]
  },
  {
    id: 'hiit_sit',
    name: 'Sprint Interval Training (SIT a Fondo)',
    shortDesc: '30 segundos a potencia absoluta ("todo o nada") seguidos de 3 a 4 minutos de descanso total. 4 a 5 series.',
    workTimeSec: 30,
    restTimeSec: 240,
    rounds: 4,
    totalDurationMin: 18,
    intensityDesc: 'Potencia 100% máxima (Sprint absoluto)',
    targetHrPercent: 'Máxima capacidad neuromuscular',
    evidence: 'A',
    evidenceLabel: 'Máxima Evidencia en Eficiencia Mitocondrial',
    bestFor: 'Atletas avanzados que buscan aceleración y potencia sin perder masa muscular.',
    modality: 'Sprint en pendiente, bicicleta con alta resistencia o trineo.',
    tips: [
      'Solo para atletas con buena base física previa.',
      'El descanso largo es indispensable para que los depósitos de fosfocreatina se recuperen.'
    ]
  },
  {
    id: 'hiit_circuito',
    name: 'Circuito Metabólico Funcional',
    shortDesc: '40 segundos de trabajo por 20 segundos de transición entre 6 estaciones funcionales.',
    workTimeSec: 40,
    restTimeSec: 20,
    rounds: 18, // 3 vueltas de 6 ejercicios
    totalDurationMin: 18,
    intensityDesc: 'Cardio + Fuerza en movimiento continuo (RPE 7-8)',
    targetHrPercent: '75% a 85% FC Máx',
    evidence: 'B',
    evidenceLabel: 'Respaldo en Acondicionamiento Físico General',
    bestFor: 'Quemar calorías mientras entrenas cuerpo completo y mejoras la agilidad.',
    modality: 'Kettlebell swings, zancadas, flexiones, skipping, mountain climbers y burpees.',
    tips: [
      'Mantén buena postura en cada ejercicio; la calidad técnica siempre va antes que la velocidad.'
    ]
  }
];

/**
 * Fórmula de Tanaka et al. (2001) para calcular la Frecuencia Cardíaca Máxima
 * FC Máx = 208 - (0.7 * edad)
 * Más precisa en adultos que la fórmula clásica 220 - edad.
 */
export function calculateTanakaMaxHeartRate(age: number): number {
  if (age < 10 || age > 110) return 190;
  return Math.round(208 - (0.7 * age));
}

/**
 * Calcula el rango de pulsaciones objetivo para una zona de intensidad
 */
export function getHeartRateRange(maxHr: number, minPercent: number, maxPercent: number): { min: number; max: number } {
  return {
    min: Math.round(maxHr * (minPercent / 100)),
    max: Math.round(maxHr * (maxPercent / 100))
  };
}
