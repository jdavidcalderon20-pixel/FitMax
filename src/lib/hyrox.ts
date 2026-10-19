// Datos y generador de programación Hyrox. Formato de las 8 estaciones y pesos oficiales por
// división verificados contra el rulebook HYROX Singles 2026/27 (hyrox.com).
import { PeriodizationPhase } from './periodization';

export type HyroxLevel = 'base' | 'open' | 'pro';

export const HYROX_LEVELS: { id: HyroxLevel; name: string; description: string }[] = [
  { id: 'base', name: 'Primera vez', description: 'Construye capacidad de trabajo y técnica en cada estación antes de exigir ritmo de carrera' },
  { id: 'open', name: 'Competir (Open)', description: 'Trabajo específico a intensidad de carrera, pesos oficiales de la división Open' },
  { id: 'pro', name: 'Élite (Pro)', description: 'Sobrecarga por encima del peso de carrera, simulaciones completas, pesos de división Pro' },
];

export interface HyroxStation {
  order: number;
  name: string;
  spec: string;
  category: string;
  loadMenOpen: string;
  loadWomenOpen: string;
  loadMenPro: string;
  loadWomenPro: string;
}

// Formato oficial: 8x(1km carrera + estación), orden fijo en todas las carreras Hyrox del mundo
export const HYROX_STATIONS: HyroxStation[] = [
  { order: 1, name: 'SkiErg', spec: '1000m', category: 'Cardio tren superior', loadMenOpen: 'Sin carga', loadWomenOpen: 'Sin carga', loadMenPro: 'Sin carga', loadWomenPro: 'Sin carga' },
  { order: 2, name: 'Sled Push', spec: '50m', category: 'Empuje de piernas', loadMenOpen: '152kg', loadWomenOpen: '102kg', loadMenPro: '202kg', loadWomenPro: '152kg' },
  { order: 3, name: 'Sled Pull', spec: '50m', category: 'Tracción de piernas', loadMenOpen: '103kg', loadWomenOpen: '78kg', loadMenPro: '153kg', loadWomenPro: '103kg' },
  { order: 4, name: 'Burpee Broad Jumps', spec: '80m', category: 'Full body / pliométrico', loadMenOpen: 'Sin carga', loadWomenOpen: 'Sin carga', loadMenPro: 'Sin carga', loadWomenPro: 'Sin carga' },
  { order: 5, name: 'Rowing', spec: '1000m', category: 'Cardio tren superior', loadMenOpen: 'Sin carga', loadWomenOpen: 'Sin carga', loadMenPro: 'Sin carga', loadWomenPro: 'Sin carga' },
  { order: 6, name: 'Farmers Carry', spec: '200m', category: 'Agarre / core', loadMenOpen: '2×24kg', loadWomenOpen: '2×16kg', loadMenPro: '2×32kg', loadWomenPro: '2×24kg' },
  { order: 7, name: 'Sandbag Lunges', spec: '100m', category: 'Piernas unilateral', loadMenOpen: '20kg', loadWomenOpen: '10kg', loadMenPro: '30kg', loadWomenPro: '20kg' },
  { order: 8, name: 'Wall Balls', spec: '100 reps', category: 'Full body / piernas', loadMenOpen: '6kg → 3.0m', loadWomenOpen: '4kg → 2.7m', loadMenPro: '9kg → 3.0m', loadWomenPro: '6kg → 2.7m' },
];

export interface HyroxBlock {
  name: string;
  detail: string;
  isCompromised?: boolean; // Bloque combinado de carrera fatigada
}

export interface HyroxSession {
  title: string;
  focus: string;
  warmup: string;
  structureGuide: string; // Explicación paso a paso de cómo ejecutar la sesión sin ambigüedad
  blocks: HyroxBlock[];
  runningNote: string;
  isCompromisedDay?: boolean;
}

const LEVEL_SCALE: Record<HyroxLevel, { sets: number; runKm: number }> = {
  base: { sets: 3, runKm: 0.4 },
  open: { sets: 4, runKm: 0.8 },
  pro: { sets: 5, runKm: 1.0 },
};

export const generateHyroxWeek = (level: HyroxLevel, phase?: PeriodizationPhase): HyroxSession[] => {
  const baseScale = LEVEL_SCALE[level];
  const s = (name: string) => HYROX_STATIONS.find((st) => st.name === name)!;

  // Ajuste según fase de periodización inversa
  const setsMultiplier = phase === 'tapering' ? 0.6 : phase === 'potencia' ? 1.2 : 1.0;
  const sets = Math.max(2, Math.round(baseScale.sets * setsMultiplier));
  const runKm = phase === 'tapering' ? baseScale.runKm * 0.6 : baseScale.runKm;
  const runMeters = Math.round(runKm * 1000);

  return [
    {
      title: 'Día 1 · Empuje y Tracción + Carrera Comprometida',
      focus: 'Sled Push + Sled Pull + Farmers Carry con transiciones a carrera',
      warmup: '5-10 min cardio suave + movilidad de cadera, tobillo y muñeca',
      structureGuide: `Circuito en Parejas de Trabajo: En cada ronda, haz 1 serie de Empuje (25m) ➔ sal INMEDIATAMENTE a trotar los ${runMeters}m de Carrera Comprometida (sin sentarte) ➔ pasa a Tracción de Soga (25m) ➔ cierra con Farmers Carry (50-100m). Al terminar la vuelta descansas 90-120 s. Repite la secuencia completa hasta completar las ${sets} rondas.`,
      blocks: [
        { name: s('Sled Push').name, detail: `${sets} rondas de 25m a carga competitiva (Open/Pro)` },
        { name: 'Transición Carrera Comprometida', detail: `${sets} × ${runMeters}m trote inmediatamente tras soltar el trineo (sin descanso)`, isCompromised: true },
        { name: s('Sled Pull').name, detail: `${sets} rondas de 25m con cuerda, tirón potente con caderas` },
        { name: s('Farmers Carry').name, detail: `${sets} rondas de 50-100m, agarre de hierro` },
      ],
      runningNote: `La carrera de ${runMeters}m va pegada al empuje de trineo: entrena a tu mente a correr con los cuádriceps ardiendo sin pararte a caminar.`,
      isCompromisedDay: true,
    },
    {
      title: 'Día 2 · Cardio de Estaciones (Ergómetros & Ritmo)',
      focus: 'SkiErg + Rowing + Burpee Broad Jumps + Intervalo de Carrera',
      warmup: '5-10 min de trote progresivo + activación escapular',
      structureGuide: `Circuito Aeróbico de 4 Estaciones: En cada ronda haces 1 serie de SkiErg (250-500m) ➔ pasas directo al Remo (250-500m) ➔ haces los Burpees (20m) ➔ y cierras la vuelta con ${runMeters}m de carrera continua a ritmo sostenido. Al terminar los ${runMeters}m de carrera, completaste 1 ronda completa. Descansas 90 a 120 s y repites hasta completar las ${sets} rondas.`,
      blocks: [
        { name: s('SkiErg').name, detail: `${sets} rondas de 250-500m a cadencia de carrera sostenida` },
        { name: s('Rowing').name, detail: `${sets} rondas de 250-500m (frecuencia 26-28 s/m)` },
        { name: s('Burpee Broad Jumps').name, detail: `${sets} rondas de 20m, ritmo continuo y respiración controlada` },
        { name: 'Carrera Aeróbica de Circuito', detail: `${sets} rondas de ${runMeters}m en cinta o pista al finalizar los 3 ejercicios para completar la vuelta`, isCompromised: true },
      ],
      runningNote: `La carrera de ${runMeters}m es la 4.ª estación de cada ronda. Mantén un ritmo crucero controlado que puedas sostener las ${sets} vueltas.`,
    },
    {
      title: 'Día 3 · Bloque Específico: Carrera Comprometida Extrema',
      focus: 'La demanda reina de Hyrox: correr con piernas congestionadas de lactato',
      warmup: '10 min trote suave + zancadas dinámicas',
      structureGuide: `Entrenamiento en 2 Grandes Bloques: Primero realizas las ${sets} rondas del Bloque 1 (Zancadas de 50m + Carrera de 800m) descansando 90 s entre cada una. Al terminar las ${sets} rondas, descansas 3 min y pasas al Bloque 2 (Burpees de 15 reps + Carrera de 600m) realizando también sus ${sets} rondas.`,
      blocks: [
        { 
          name: 'Bloque Combinado 1: Zancadas + Carrera', 
          detail: `${sets} rondas: 50m Zancadas lastradas inmediatamente seguidas de 800m Carrera a ritmo objetivo`,
          isCompromised: true
        },
        { 
          name: 'Bloque Combinado 2: Burpees + Carrera', 
          detail: `${sets} rondas: 15 Burpees Broad Jump inmediatamente seguidos de 600m Carrera comprometida`,
          isCompromised: true
        },
      ],
      runningNote: 'Entrena la transición fisiológica de piernas de plomo a zancada eficiente. Clave para bajar de 1h15m en Hyrox.',
      isCompromisedDay: true,
    },
    {
      title: 'Día 4 · Piernas, Wall Balls + Rodaje Regenerativo',
      focus: 'Sandbag Lunges + Wall Balls + Carrera de desahogo',
      warmup: '5-10 min movilidad de sentadilla y rotación torácica',
      structureGuide: `Fuerza Muscular + Cierre Aeróbico: Realiza ${sets} rondas combinando Bloque 1 (Zancadas con saco) y Bloque 2 (Wall Balls) con 90 s de descanso entre vueltas. Cuando hayas completado las ${sets} rondas de fuerza, pasas al Bloque 3: un trote suave continuo de ${runMeters}m para soltar piernas y lavar el lactato acumulado.`,
      blocks: [
        { name: s('Sandbag Lunges').name, detail: `${sets} rondas de 25-50m con saco en espalda` },
        { name: s('Wall Balls').name, detail: `${sets} rondas de 20-30 reps completas a 3m (hombres) / 2.7m (mujeres)` },
        { name: 'Carrera Regenerativa Final', detail: `1 bloque de ${runMeters}m de trote suave al terminar todo el trabajo de pesas para soltar cuádriceps`, isCompromised: false },
      ],
      runningNote: `El trote final no es a ritmo rápido: es regenerativo suave para bombear sangre limpia a las piernas cansadas.`,
    },
  ];
};
