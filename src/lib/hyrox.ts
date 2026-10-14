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

  return [
    {
      title: 'Día 1 · Empuje y Tracción + Carrera Comprometida',
      focus: 'Sled Push + Sled Pull + Farmers Carry con transiciones a carrera',
      warmup: '5-10 min cardio suave + movilidad de cadera, tobillo y muñeca',
      blocks: [
        { name: s('Sled Push').name, detail: `${sets} rondas de 25m a carga competitiva (Open/Pro)` },
        { name: 'Transición Carrera Comprometida', detail: `${sets} × ${Math.round(runKm * 1000)}m trote inmediatamente tras soltar el trineo (sin descanso)`, isCompromised: true },
        { name: s('Sled Pull').name, detail: `${sets} rondas de 25m con cuerda, tirón potente con caderas` },
        { name: s('Farmers Carry').name, detail: `${sets} rondas de 50-100m, agarre de hierro` },
      ],
      runningNote: `Compromised Running: El objetivo es correr los primeros 200m con las piernas pesadas a ritmo sostenido sin caminar.`,
      isCompromisedDay: true,
    },
    {
      title: 'Día 2 · Cardio de Estaciones (Ergómetros)',
      focus: 'SkiErg + Rowing + Burpee Broad Jumps',
      warmup: '5-10 min de trote progresivo + activación escapular',
      blocks: [
        { name: s('SkiErg').name, detail: `${sets} rondas de 250-500m a cadencia de carrera sostenida` },
        { name: s('Rowing').name, detail: `${sets} rondas de 250-500m (frecuencia 26-28 s/m)` },
        { name: s('Burpee Broad Jumps').name, detail: `${sets} rondas de 20m, ritmo continuo y respiración controlada` },
      ],
      runningNote: `Entre bloques: ${runKm}km a ritmo fácil para acumular capacidad aeróbica sin fatiga extrema.`,
    },
    {
      title: 'Día 3 · Bloque Específico: Carrera Comprometida Extrema',
      focus: 'La demanda reina de Hyrox: correr con piernas congestionadas de lactato',
      warmup: '10 min trote suave + zancadas dinámicas',
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
      title: 'Día 4 · Piernas y Wall Balls',
      focus: 'Sandbag Lunges + Wall Balls de cierre de carrera',
      warmup: '5-10 min movilidad de sentadilla y rotación torácica',
      blocks: [
        { name: s('Sandbag Lunges').name, detail: `${sets} rondas de 25-50m con saco en espalda` },
        { name: s('Wall Balls').name, detail: `${sets} rondas de 20-30 reps completas a 3m (hombres) / 2.7m (mujeres)` },
      ],
      runningNote: `Cierra con ${runKm}km a ritmo regenerativo para lavar lactato acumulado.`,
    },
  ];
};
