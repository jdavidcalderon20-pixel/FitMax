// Catálogo de Planes de Running y Calculadora Científica de Ritmos
// Basado en el modelo 80/20 (Seiler) y la fórmula de predicción atlética de Riegel.

export interface RunningPaceZones {
  base10kPaceSec: number;        // Segundos por km en 10K
  pace10kFormatted: string;      // Ej. '4:30/km'
  sprint400m: { min: string; max: string; desc: string };
  umbralPace: { min: string; max: string; desc: string };
  tempoPace: { min: string; max: string; desc: string };
  easyZone12: { min: string; max: string; desc: string };
}

export interface RunningPlanSummary {
  id: string;
  title: string;
  objective: string;
  weeksTotal: number;
  daysPerWeek: number;
  level: 'principiante' | 'intermedio' | 'avanzado';
  levelLabel: string;
  structure: string;
  description: string;
  blockCycle: string;
}

export const RUNNING_PLANS_CATALOG: RunningPlanSummary[] = [
  {
    id: 'c25k',
    title: 'De 0 a 5 Kilómetros (Caminar y Correr)',
    objective: 'Lograr correr 5 km seguidos sin detenerte',
    weeksTotal: 9,
    daysPerWeek: 3,
    level: 'principiante',
    levelLabel: 'Principiante Cero Impacto',
    structure: 'Intervalos amigables de caminar y trotar con progresión gradual.',
    description: 'Diseñado especialmente para quienes nunca han corrido o llevan años sin hacer deporte. Cero presión, protegiendo tus rodillas.',
    blockCycle: 'Bloques de 3 semanas + 1 semana de consolidación'
  },
  {
    id: '5k_mejora',
    title: 'Mejora tu Marca en 5 Kilómetros',
    objective: 'Bajar tu tiempo en 5K y ganar velocidad',
    weeksTotal: 8,
    daysPerWeek: 3,
    level: 'intermedio',
    levelLabel: 'Intermedio',
    structure: '1 rodaje fácil + 1 sesión de series cortas + 1 tirada continua a ritmo tempo.',
    description: 'Aprende a sostener ritmos vivos con buena cadencia y respiración rítmica.',
    blockCycle: 'Bloque 1 (Base y series cortas) + Bloque 2 (Ritmo sostenido y afinación)'
  },
  {
    id: '10k_primero',
    title: 'Tu Primer 10K con Éxito',
    objective: 'Completar 10 kilómetros con buenas sensaciones',
    weeksTotal: 10,
    daysPerWeek: 3,
    level: 'principiante',
    levelLabel: 'Principiante / Intermedio',
    structure: 'Rodajes cómodos + tirada larga progresiva cada domingo.',
    description: 'El salto clásico del corredor popular: construye la base aeróbica necesaria para llegar con energía a la meta.',
    blockCycle: '2 bloques de 4 semanas + 2 semanas finales de afinación'
  },
  {
    id: '10k_rendimiento',
    title: '10K Rendimiento y Competición',
    objective: 'Optimizar umbral de lactato y buscar tu mejor marca personal',
    weeksTotal: 8,
    daysPerWeek: 4,
    level: 'intermedio',
    levelLabel: 'Intermedio / Avanzado',
    structure: 'Fartleks a tempo, series de 1000m en umbral y rodajes progresivos.',
    description: 'Plan estructurado con el formato del entrenador para sostener ritmos exigentes (4:10 a 5:00 min/km) con economía de esfuerzo.',
    blockCycle: 'Semana 1-3 Carga, Semana 4 Descarga, Semanas 5-7 Umbral, Semana 8 Taper'
  },
  {
    id: '21k_primero',
    title: 'Primera Media Maratón (21 km)',
    objective: 'Conquistar los 21 km disfrutando el camino',
    weeksTotal: 12,
    daysPerWeek: 4,
    level: 'intermedio',
    levelLabel: 'Intermedio',
    structure: 'Base aeróbica sólida, sesiones tempo y fondos largos de hasta 17-18 km.',
    description: 'Enfocado en la eficiencia energética y la tolerancia muscular para no chocar contra el cansancio al kilómetro 15.',
    blockCycle: '3 bloques encadenables de 4 semanas'
  },
  {
    id: '21k_rendimiento',
    title: 'Media Maratón Rendimiento',
    objective: 'Bajar de 1h45 o buscar marca sub-1h30',
    weeksTotal: 12,
    daysPerWeek: 4,
    level: 'avanzado',
    levelLabel: 'Avanzado',
    structure: 'Series largas (2000m-3000m), rodajes a ritmo de competición y volumen polarizado.',
    description: 'Para corredores experimentados que dominan las distancias y quieren volar sobre el asfalto.',
    blockCycle: 'Periodización polarizada 80/20 con descarga estratégica'
  },
  {
    id: '42k',
    title: 'Maratón Completa (42.195 km)',
    objective: 'Completar la distancia mítica del atletismo',
    weeksTotal: 16,
    daysPerWeek: 4,
    level: 'avanzado',
    levelLabel: 'Intermedio / Avanzado',
    structure: 'Construcción piramidal de volumen, tiradas dominicales de hasta 30-32 km y afinación.',
    description: 'El desafío definitivo: dosificación inteligente para asimilar los kilómetros sin lesionarse.',
    blockCycle: '4 bloques encadenables de 4 semanas con 3 semanas de afinación final'
  },
  {
    id: 'base_4s',
    title: 'Bloque Base Aeróbica de 4 Semanas (Repetible)',
    objective: 'Mantener salud y kilometraje constante',
    weeksTotal: 4,
    daysPerWeek: 3,
    level: 'principiante',
    levelLabel: 'Todos los niveles',
    structure: '3 semanas de rodajes suaves y confortables + 1 semana ligera de recuperación.',
    description: 'Ideal para períodos entre carreras o para compaginar con entrenamiento pesado de gimnasio.',
    blockCycle: 'Bloque mensual autónomo'
  }
];

/**
 * Convierte segundos a formato MM:SS
 */
export function formatSecondsToPace(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

/**
 * Convierte un string MM:SS o número de minutos a segundos por km
 */
export function parsePaceToSeconds(paceInput: string): number {
  if (!paceInput) return 300; // 5:00/km default
  const clean = paceInput.replace('/km', '').trim();
  const parts = clean.split(':');
  if (parts.length === 2) {
    const mins = parseInt(parts[0], 10) || 5;
    const secs = parseInt(parts[1], 10) || 0;
    return mins * 60 + secs;
  }
  const floatVal = parseFloat(clean);
  return !isNaN(floatVal) ? Math.round(floatVal * 60) : 300;
}

/**
 * Fórmula de Peter Riegel: T2 = T1 * (D2 / D1)^1.06
 * Predice el tiempo en una distancia D2 a partir del tiempo en D1.
 */
export function predictTimeRiegel(time1Minutes: number, dist1Km: number, dist2Km: number): number {
  if (dist1Km <= 0 || dist2Km <= 0) return time1Minutes;
  return time1Minutes * Math.pow(dist2Km / dist1Km, 1.06);
}

/**
 * Calcula todas las zonas de entrenamiento derivadas a partir de una marca de 10K
 * (Velocidad, Umbral, Tempo y Rodaje Suave Z1-2)
 */
export function calculatePacesFrom10K(pace10kMinutesPerKm: number): RunningPaceZones {
  const baseSec = Math.round(pace10kMinutesPerKm * 60);

  // 1. Velocidad (series de 400m): 25 a 35 seg más rápido por km
  const vMin = baseSec - 35;
  const vMax = baseSec - 25;

  // 2. Umbral de lactato: entre el mismo ritmo de 10K y +10 seg/km
  const uMin = baseSec;
  const uMax = baseSec + 10;

  // 3. Ritmo Tempo: 20 a 35 seg más lento por km
  const tMin = baseSec + 20;
  const tMax = baseSec + 35;

  // 4. Rodaje suave conversacional (Z1 - Z2): 60 a 90 seg más lento por km
  const eMin = baseSec + 60;
  const eMax = baseSec + 90;

  return {
    base10kPaceSec: baseSec,
    pace10kFormatted: `${formatSecondsToPace(baseSec)}/km`,
    sprint400m: {
      min: `${formatSecondsToPace(vMin)}/km`,
      max: `${formatSecondsToPace(vMax)}/km`,
      desc: 'Para series cortas y explosivas de 400 m. Esfuerzo alto.'
    },
    umbralPace: {
      min: `${formatSecondsToPace(uMin)}/km`,
      max: `${formatSecondsToPace(uMax)}/km`,
      desc: 'Ritmo exigente pero controlado que puedes mantener en series de 1.000 m a 2.000 m.'
    },
    tempoPace: {
      min: `${formatSecondsToPace(tMin)}/km`,
      max: `${formatSecondsToPace(tMax)}/km`,
      desc: 'Ritmo alegre y constante para carreras de 5 a 8 km continuos.'
    },
    easyZone12: {
      min: `${formatSecondsToPace(eMin)}/km`,
      max: `${formatSecondsToPace(eMax)}/km`,
      desc: 'Ritmo suave y conversacional donde puedes hablar con un compañero sin ahogarte. Representa el 80% de tus kilómetros.'
    }
  };
}
