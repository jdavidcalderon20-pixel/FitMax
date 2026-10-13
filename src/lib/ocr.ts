// Datos y generador de programación para OCR (carreras de obstáculos). Niveles de referencia
// tomados de la estructura de Spartan Race, con énfasis en el limitante #1: agarre y tracción funcional.
import { PeriodizationPhase } from './periodization';

export type OcrLevel = 'sprint' | 'super' | 'beast' | 'ultra';
export type GripTier = 'base' | 'intermedio' | 'avanzado';

export const OCR_TIERS: { id: OcrLevel; name: string; distance: string; obstacles: string; description: string }[] = [
  { id: 'sprint', name: 'Sprint', distance: '5K (3-5 mi)', obstacles: '20-23 obstáculos', description: 'Nivel de entrada, ideal para tu primera carrera OCR' },
  { id: 'super', name: 'Super', distance: '10K (8-10 mi)', obstacles: '24-29 obstáculos', description: 'Más distancia y más obstáculos, exige base aeróbica sólida' },
  { id: 'beast', name: 'Beast', distance: '21K (12-14 mi)', obstacles: '30-35 obstáculos', description: 'Media maratón con obstáculos, nivel avanzado' },
  { id: 'ultra', name: 'Ultra', distance: '50K', obstacles: '60+ obstáculos', description: 'Nivel élite, resistencia extrema' },
];

export const GRIP_TIERS: { id: GripTier; name: string; description: string }[] = [
  { id: 'base', name: 'Agarre Base', description: 'Suspensiones pasivas en barra de 20-40s y remos invertidos para construir tolerancia en palma y dedos.' },
  { id: 'intermedio', name: 'Agarre Intermedio', description: 'Dead hang activo con retracción escapular (45-60s), agarre de toalla (towel hang) y dominadas neutras.' },
  { id: 'avanzado', name: 'Agarre Élite / Rig Ready', description: 'Suspensiones a 1 mano asistidas, pinch grip (agarre en pinza de discos) y transiciones dinámicas entre barras.' },
];

export interface OcrBlock {
  name: string;
  detail: string;
  isGripSpecific?: boolean;
}

export interface OcrSession {
  title: string;
  focus: string;
  warmup: string;
  blocks: OcrBlock[];
  runningNote: string;
  isCompromisedDay?: boolean;
}

const OCR_SCALE: Record<OcrLevel, { sets: number; hangSec: number; runKm: number }> = {
  sprint: { sets: 3, hangSec: 25, runKm: 3 },
  super: { sets: 4, hangSec: 35, runKm: 5 },
  beast: { sets: 4, hangSec: 45, runKm: 8 },
  ultra: { sets: 5, hangSec: 60, runKm: 12 },
};

export const generateOcrWeek = (
  level: OcrLevel, 
  phase?: PeriodizationPhase, 
  gripTier: GripTier = 'intermedio'
): OcrSession[] => {
  const baseScale = OCR_SCALE[level];

  // Ajuste según fase de periodización inversa
  const setsMultiplier = phase === 'tapering' ? 0.6 : phase === 'potencia' ? 1.2 : 1.0;
  const sets = Math.max(2, Math.round(baseScale.sets * setsMultiplier));
  const runKm = phase === 'tapering' ? baseScale.runKm * 0.6 : baseScale.runKm;

  // Bloques de agarre según nivel seleccionado
  const gripBlocks: OcrBlock[] = gripTier === 'base'
    ? [
        { name: 'Dead Hang Pasivo en Barra', detail: `${sets} series de ${baseScale.hangSec}s colgado de barra, hombros relajados pero estables`, isGripSpecific: true },
        { name: 'Dominadas Asistidas o Remo Invertido', detail: `${sets} series de 8-10 reps, pausa de 1s arriba`, isGripSpecific: true },
        { name: 'Farmers Carry con Mancuernas', detail: `${sets} rondas de 40m a paso controlado`, isGripSpecific: true }
      ]
    : gripTier === 'intermedio'
    ? [
        { name: 'Dead Hang Activo (Retracción Escapular)', detail: `${sets} series de ${baseScale.hangSec + 15}s con escápulas activadas abajo`, isGripSpecific: true },
        { name: 'Towel Hang (Toalla sobre barra)', detail: `${sets} series de 20-30s sosteniendo dos toallas colgadas (agarre neutro grueso)`, isGripSpecific: true },
        { name: 'Dominadas Estrictas en Agarre Neutro', detail: `${sets} series de 6-8 reps controlando el descenso de 3 segundos`, isGripSpecific: true },
        { name: 'Heavy Farmer Carry', detail: `${sets} rondas de 50m con peso exigente para dedos y antebrazo`, isGripSpecific: true }
      ]
    : [
        { name: 'Dead Hang Asimétrico / 1 Mano Asistida', detail: `${sets} series de 20-25s por brazo (usa una toalla para asistir el otro brazo si es necesario)`, isGripSpecific: true },
        { name: 'Pinch Grip Carry (Pellizco con discos)', detail: `${sets} rondas de 30m sosteniendo dos discos lisos pellizcados solo con los dedos`, isGripSpecific: true },
        { name: 'Transiciones de Barra / Monkey Bar Drills', detail: `${sets} series de 8-10 cambios dinámicos de barra a barra simulando el obstáculo rig`, isGripSpecific: true },
        { name: 'Dominadas con Lastre o Pausa en Ángulo', detail: `${sets} series de 5 reps con pausa isométrica de 2s en 90° de codo`, isGripSpecific: true }
      ];

  return [
    {
      title: 'Día 1 · Agarre y Tracción Funcional (Específico OCR)',
      focus: 'El limitante #1 en OCR: fuerza de agarre, antebrazo y suspensión en barra',
      warmup: '5-10 min movilidad de hombro, muñecas y estiramiento de flexores de antebrazo',
      blocks: gripBlocks,
      runningNote: 'Cierra con 2-3km de trote suave para descongestionar los antebrazos y recuperar el tren superior.',
    },
    {
      title: 'Día 2 · Trail Running y Desnivel',
      focus: 'Base aeróbica específica: terreno irregular y cuestas para el barro y montaña',
      warmup: '5-10 min de trote progresivo en llano',
      blocks: [
        { name: 'Carrera en sendero / desnivel', detail: `${runKm}km a ritmo fácil en senderos o con inclinación en caminadora` },
        { name: 'Cuestas cortas explosivas', detail: `${sets} repeticiones de 20-30s cuesta arriba a RPE 8-9, bajada caminando` },
      ],
      runningNote: 'El desnivel fortalece tobillos, tendón de Aquiles y prepara las piernas para los descensos de carrera.',
    },
    {
      title: 'Día 3 · Cargas Pesadas y Arrastres',
      focus: 'Simulación de obstáculos de carga: sacos de arena, cubetas y arrastres',
      warmup: '5 min cardio ligero + movilidad de cadera y bisagra',
      blocks: [
        { name: 'Sandbag / Bucket Carry', detail: `${sets} rondas de 50-80m sosteniendo la carga contra el pecho o hombro` },
        { name: 'Arrastre o Empuje pesado (Sled/Trineo)', detail: `${sets} rondas de 25-35m` },
        { name: 'Bear Crawl (Paso de oso bajo)', detail: `${sets} rondas de 20m manteniendo rodillas a 2cm del piso` },
      ],
      runningNote: 'Alterna cada carga con 200m-400m de trote para acostumbrar la zancada a la fatiga previa.',
    },
    {
      title: 'Día 4 · Circuito de Obstáculos y Penalización',
      focus: 'Acondicionamiento tipo carrera: burpees oficiales OCR + esfuerzo variable',
      warmup: '5-10 min de trote + movilidad articular completa',
      blocks: [
        { name: 'Burpees oficiales OCR (pecho al suelo)', detail: `${sets} series de 15 reps sin pausa (la penalización estándar de obstáculo fallado)` },
        { name: 'Circuito mixto de obstáculos', detail: `${sets} rondas: 300m carrera + 10 burpees + 15 saltos al cajón / zancadas de salto` },
      ],
      runningNote: `Cierra con ${Math.round(runKm * 0.5)}km a ritmo de carrera para simular el tramo final hacia la meta.`,
    },
  ];
};
