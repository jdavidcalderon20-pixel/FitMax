// Modelos de datos, especificaciones oficiales y persistencia de Simulacro Real / Día de Competencia Hyrox
import { GeoPoint } from './gpx';

export type HyroxDivision = 'open_men' | 'open_women' | 'pro_men' | 'pro_women' | 'gym_adapted';

export interface DivisionInfo {
  id: HyroxDivision;
  name: string;
  badge: string;
  description: string;
}

export const HYROX_DIVISIONS: DivisionInfo[] = [
  {
    id: 'open_men',
    name: 'Open Hombres',
    badge: '152kg Sled · 24kg Farmers · 6kg Wall Ball',
    description: 'Categoría oficial individual masculina estándar.',
  },
  {
    id: 'open_women',
    name: 'Open Mujeres',
    badge: '102kg Sled · 16kg Farmers · 4kg Wall Ball',
    description: 'Categoría oficial individual femenina estándar.',
  },
  {
    id: 'pro_men',
    name: 'Pro Hombres',
    badge: '202kg Sled · 32kg Farmers · 9kg Wall Ball',
    description: 'Categoría de élite con pesos máximos reglamentarios.',
  },
  {
    id: 'pro_women',
    name: 'Pro Mujeres',
    badge: '152kg Sled · 24kg Farmers · 6kg Wall Ball',
    description: 'Categoría Pro femenina con pesos de Open Masculino.',
  },
  {
    id: 'gym_adapted',
    name: 'Adaptado Gym Convencional',
    badge: 'Mancuernas / Polea / Empuje en Suelo',
    description: 'Para simular la carrera completa en cualquier gimnasio sin máquinas oficiales.',
  },
];

export interface OfficialStationSpec {
  order: number;
  name: string;
  shortName: string;
  icon: string;
  distanceOrReps: string;
  weightByDivision: Record<HyroxDivision, string>;
  gymAlternative: string;
  proTip: string;
}

export const HYROX_OFFICIAL_RACE_STATIONS: OfficialStationSpec[] = [
  {
    order: 1,
    name: '1000m SkiErg',
    shortName: 'SkiErg',
    icon: '🎿',
    distanceOrReps: '1,000 metros',
    weightByDivision: {
      open_men: 'Resistencia damper 5-6 (peso corporal)',
      open_women: 'Resistencia damper 5-6 (peso corporal)',
      pro_men: 'Resistencia damper 6 (alta cadencia)',
      pro_women: 'Resistencia damper 6 (alta cadencia)',
      gym_adapted: 'Jalón en polea alta con cuerda doble (100 reps ritmo rápido)',
    },
    gymAlternative: 'Polea alta con cuerda o Jumping Jacks + Burpees continuos',
    proTip: 'Mantén un ritmo sostenible (pace +5s sobre tu 1k máximo) para no quemar los hombros y tríceps antes del trineo.',
  },
  {
    order: 2,
    name: '50m Sled Push (Empuje de Trineo)',
    shortName: 'Sled Push',
    icon: '🚜',
    distanceOrReps: '50 metros (4 x 12.5m)',
    weightByDivision: {
      open_men: '152 kg (incluye peso trineo)',
      open_women: '102 kg (incluye peso trineo)',
      pro_men: '202 kg (incluye peso trineo)',
      pro_women: '152 kg (incluye peso trineo)',
      gym_adapted: 'Prensa inclinada a 1 pierna (4x12) o Empuje de disco sobre toalla en suelo liso',
    },
    gymAlternative: 'Empuje de disco sobre toalla en piso sintético o Prensa de piernas pesada',
    proTip: 'Brazos bloqueados rectos contra los postes, torso a 45° y zancadas cortas impulsando con toda la planta del pie.',
  },
  {
    order: 3,
    name: '50m Sled Pull (Tracción de Trineo con Cuerda)',
    shortName: 'Sled Pull',
    icon: '🪢',
    distanceOrReps: '50 metros (4 x 12.5m)',
    weightByDivision: {
      open_men: '103 kg (incluye peso trineo)',
      open_women: '78 kg (incluye peso trineo)',
      pro_men: '153 kg (incluye peso trineo)',
      pro_women: '103 kg (incluye peso trineo)',
      gym_adapted: 'Remo en polea baja con cuerda o Remo con barra pesada (4x12 pesado)',
    },
    gymAlternative: 'Remo en polea sentado con cuerda o arrastre de mancuernas con toalla',
    proTip: 'Permanece dentro de la caja reglamentaria. Usa el peso corporal echándote hacia atrás con las piernas en sentadilla.',
  },
  {
    order: 4,
    name: '80m Burpee Broad Jumps (Saltos en Longitud)',
    shortName: 'Burpee Jumps',
    icon: '🐸',
    distanceOrReps: '80 metros de avance continuo',
    weightByDivision: {
      open_men: 'Peso corporal (pecho al suelo y salto hacia adelante)',
      open_women: 'Peso corporal (pecho al suelo y salto hacia adelante)',
      pro_men: 'Peso corporal (pecho al suelo y salto explosivo)',
      pro_women: 'Peso corporal (pecho al suelo y salto explosivo)',
      gym_adapted: '80m de saltos o 35 burpees completos con salto vertical',
    },
    gymAlternative: '35 Burpees completos con salto vertical al pecho si no hay espacio de 80m',
    proTip: 'Encuentra un ritmo constante tipo metrónomo. No des saltos exagerados que te dejen sin aire: saltos cortos y avance fluido.',
  },
  {
    order: 5,
    name: '1000m Rowing (Remo Concept2)',
    shortName: 'Rowing',
    icon: '🚣‍♂️',
    distanceOrReps: '1,000 metros',
    weightByDivision: {
      open_men: 'Damper 5-6 (resistencia media)',
      open_women: 'Damper 5-6 (resistencia media)',
      pro_men: 'Damper 6 (resistencia sostenida)',
      pro_women: 'Damper 6 (resistencia sostenida)',
      gym_adapted: 'Kettlebell Sumo Deadlift High Pulls (60 reps con 20kg)',
    },
    gymAlternative: 'Remo ergómetro convencional o Kettlebell Sumo Deadlift High Pull (60 reps)',
    proTip: 'La mitad de la carrera ya pasó. Concéntrate en la fase de empuje de piernas (60%) antes de tirar con la espalda y brazos.',
  },
  {
    order: 6,
    name: '200m Farmers Carry (Paseo del Granjero)',
    shortName: 'Farmers Carry',
    icon: '🧳',
    distanceOrReps: '200 metros (4 x 50m)',
    weightByDivision: {
      open_men: '2 mancuernas / kettlebells de 24 kg (Total: 48 kg)',
      open_women: '2 mancuernas / kettlebells de 16 kg (Total: 32 kg)',
      pro_men: '2 mancuernas / kettlebells de 32 kg (Total: 64 kg)',
      pro_women: '2 mancuernas / kettlebells de 24 kg (Total: 48 kg)',
      gym_adapted: '2 mancuernas pesadas disponibles en el gym (ej. 20-24kg c/u)',
    },
    gymAlternative: '2 Mancuernas pesadas o 2 discos de 20kg sostenidos por el asa',
    proTip: 'Paso corto y rápido sin balancear las mancuernas. Escápulas retraídas y mirada fija al frente. ¡No sueltes la carga!',
  },
  {
    order: 7,
    name: '100m Sandbag Walking Lunges (Zancadas con Saco)',
    shortName: 'Sandbag Lunges',
    icon: '🎒',
    distanceOrReps: '100 metros (4 x 25m)',
    weightByDivision: {
      open_men: 'Saco de 20 kg sobre los hombros',
      open_women: 'Saco de 10 kg sobre los hombros',
      pro_men: 'Saco de 30 kg sobre los hombros',
      pro_women: 'Saco de 20 kg sobre los hombros',
      gym_adapted: 'Barra sobre hombros o 2 mancuernas de 10-12kg en rack frontal',
    },
    gymAlternative: 'Zancadas con barra corta tras nuca (20kg) o mancuernas al pecho',
    proTip: 'La rodilla trasera debe tocar suavemente el suelo. Cadencia constante sin descansar de pie más de 2 segundos.',
  },
  {
    order: 8,
    name: 'Wall Balls (Lanzamientos al Disco)',
    shortName: 'Wall Balls',
    icon: '🏐',
    distanceOrReps: '100 o 75 lanzamientos',
    weightByDivision: {
      open_men: '100 reps con balón de 6 kg (diana a 3.05m)',
      open_women: '75 reps con balón de 4 kg (diana a 2.75m)',
      pro_men: '100 reps con balón de 9 kg (diana a 3.05m)',
      pro_women: '100 reps con balón de 6 kg (diana a 3.05m)',
      gym_adapted: 'Thrusters con mancuernas (50-75 reps con mancuernas de 6-8kg)',
    },
    gymAlternative: 'Thrusters con mancuernas de 6kg a 8kg si el techo del gym no permite lanzamientos',
    proTip: '¡Última estación antes de cruzar la meta! Divide en series programadas: 4 x 25 o 5 x 20 con 5 segundos de respiro.',
  },
];

export interface HyroxSegmentRecord {
  segmentNumber: number; // 1 a 8
  stationName: string;
  runDistanceKm: number;
  runDurationSec: number;
  runPaceStr: string;
  stationDurationSec: number;
  totalSegmentDurationSec: number;
  isAlternativeUsed?: boolean;
  alternativeName?: string;
}

export interface HyroxRaceResult {
  id: string;
  date: number; // timestamp
  division: HyroxDivision;
  runTrackingMode: 'gps' | 'treadmill';
  totalDurationSec: number;
  totalRunDurationSec: number;
  totalStationDurationSec: number;
  averageRunPace: string;
  segments: HyroxSegmentRecord[];
  fastestRunSegment: number;
  slowestRunSegment: number;
  fastestStationSegment: number;
  slowestStationSegment: number;
  notes?: string;
  isPersonalBest?: boolean;
}

/**
 * Convierte segundos a formato de carrera legible HH:MM:SS o MM:SS
 */
export function formatDuration(totalSec: number): string {
  if (!totalSec || isNaN(totalSec) || totalSec < 0) return '00:00';
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = Math.floor(totalSec % 60);

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Calcula ritmo en min/km a partir de km y segundos
 */
export function calculatePaceFromSec(distanceKm: number, durationSec: number): string {
  if (!distanceKm || distanceKm <= 0 || !durationSec || durationSec <= 0) return '--:--/km';
  const durationMin = durationSec / 60;
  const pace = durationMin / distanceKm;
  const min = Math.floor(pace);
  const sec = Math.round((pace - min) * 60);
  return `${min}:${sec.toString().padStart(2, '0')}/km`;
}

/**
 * Genera el análisis de rendimiento de un simulacro completado
 */
export function analyzeHyroxRace(
  segments: HyroxSegmentRecord[],
  division: HyroxDivision,
  mode: 'gps' | 'treadmill',
  notes?: string
): HyroxRaceResult {
  const totalRunDurationSec = segments.reduce((acc, s) => acc + s.runDurationSec, 0);
  const totalStationDurationSec = segments.reduce((acc, s) => acc + s.stationDurationSec, 0);
  const totalDurationSec = totalRunDurationSec + totalStationDurationSec;
  const totalKm = segments.reduce((acc, s) => acc + s.runDistanceKm, 0) || 8;
  const averageRunPace = calculatePaceFromSec(totalKm, totalRunDurationSec);

  let fastestRunSegment = 1;
  let slowestRunSegment = 1;
  let fastestStationSegment = 1;
  let slowestStationSegment = 1;

  let minRunSec = Infinity;
  let maxRunSec = -1;
  let minStationSec = Infinity;
  let maxStationSec = -1;

  segments.forEach((seg) => {
    if (seg.runDurationSec < minRunSec) {
      minRunSec = seg.runDurationSec;
      fastestRunSegment = seg.segmentNumber;
    }
    if (seg.runDurationSec > maxRunSec) {
      maxRunSec = seg.runDurationSec;
      slowestRunSegment = seg.segmentNumber;
    }
    if (seg.stationDurationSec < minStationSec) {
      minStationSec = seg.stationDurationSec;
      fastestStationSegment = seg.segmentNumber;
    }
    if (seg.stationDurationSec > maxStationSec) {
      maxStationSec = seg.stationDurationSec;
      slowestStationSegment = seg.segmentNumber;
    }
  });

  return {
    id: `hyrox_sim_${Date.now()}`,
    date: Date.now(),
    division,
    runTrackingMode: mode,
    totalDurationSec,
    totalRunDurationSec,
    totalStationDurationSec,
    averageRunPace,
    segments,
    fastestRunSegment,
    slowestRunSegment,
    fastestStationSegment,
    slowestStationSegment,
    notes,
  };
}

function getStorage(): Storage | null {
  if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) return (globalThis as any).localStorage;
  return null;
}

/**
 * Obtiene el historial de simulacros guardados
 */
export function getHyroxRaceHistory(nickname: string): HyroxRaceResult[] {
  const storage = getStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(`fitmax_hyrox_races_${nickname}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Obtiene el récord personal (PB) guardado
 */
export function getHyroxPersonalBest(nickname: string, division?: HyroxDivision): HyroxRaceResult | null {
  const history = getHyroxRaceHistory(nickname);
  const filtered = division ? history.filter((r) => r.division === division) : history;
  if (!filtered || filtered.length === 0) return null;

  return filtered.reduce((best, cur) => {
    return cur.totalDurationSec < best.totalDurationSec ? cur : best;
  }, filtered[0]);
}

/**
 * Guarda un resultado de simulacro y evalúa si es récord personal
 */
export function saveHyroxRaceResult(nickname: string, result: HyroxRaceResult): { isNewPB: boolean; previousPB: HyroxRaceResult | null } {
  const currentPB = getHyroxPersonalBest(nickname, result.division);
  const isNewPB = !currentPB || result.totalDurationSec < currentPB.totalDurationSec;
  result.isPersonalBest = isNewPB;

  const storage = getStorage();
  if (storage) {
    try {
      const history = getHyroxRaceHistory(nickname);
      const updated = [result, ...history];
      storage.setItem(`fitmax_hyrox_races_${nickname}`, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving Hyrox race', e);
    }
  }

  return { isNewPB, previousPB: currentPB };
}
