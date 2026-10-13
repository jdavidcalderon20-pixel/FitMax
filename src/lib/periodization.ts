// Motor de Periodización Inversa hacia Fecha Objetivo (Target Event Periodization)
// Para Hyrox, OCR y Running: estructura fases inversas hacia el día de la competencia

export type PeriodizationPhase = 'base' | 'potencia' | 'compromised' | 'tapering';

export interface PhaseDetails {
  phase: PeriodizationPhase;
  name: string;
  subtitle: string;
  weekNumber: number;
  totalWeeks: number;
  weeksRemaining: number;
  volumeMultiplier: number;
  focusDescription: string;
  badgeColor: string;
}

export const getPhaseFromWeeks = (
  weeksRemaining: number, 
  totalWeeks: number = 12,
  discipline: 'hybrid' | 'running' = 'hybrid'
): PhaseDetails => {
  const currentWeek = Math.max(1, totalWeeks - weeksRemaining + 1);

  // Última semana o 2 semanas antes del evento: Tapering (Descarga competitiva)
  if (weeksRemaining <= (totalWeeks <= 6 ? 1 : 2)) {
    return {
      phase: 'tapering',
      name: discipline === 'running' ? 'Fase 4: Descarga y Tapering Pre-Carrera' : 'Fase 4: Descarga y Tapering Pre-Evento',
      subtitle: discipline === 'running' 
        ? 'Afinamiento competitivo y supercompensación de glucógeno para el día de la carrera'
        : 'Afinamiento competitivo y recuperación profunda de glucógeno y SNC',
      weekNumber: currentWeek,
      totalWeeks,
      weeksRemaining,
      volumeMultiplier: 0.6,
      focusDescription: discipline === 'running'
        ? 'Reducción del 40-50% del kilometraje semanal. Mantén intensidad en cambios de ritmo cortos pero elimina fatiga para llegar con piernas ligeras y frescas.'
        : 'Reducción del 40-50% del volumen total. Mantén intensidad viva pero elimina fatiga acumulada para llegar al 100% el día del evento.',
      badgeColor: 'bg-emerald-500 text-zinc-950',
    };
  }

  // Entre 2 y 5 semanas restantes: Simulacros & Compromised Running / Ritmo Competitivo
  const compromisedWindow = totalWeeks <= 6 ? 2 : totalWeeks <= 10 ? 3 : 4;
  if (weeksRemaining <= (totalWeeks <= 6 ? 3 : compromisedWindow + 2)) {
    return {
      phase: 'compromised',
      name: discipline === 'running' ? 'Fase 3: Ritmo Objetivo y Tiradas Específicas' : 'Fase 3: Simulacros y Carrera Comprometida',
      subtitle: discipline === 'running'
        ? 'Consolidar el ritmo objetivo de carrera (5K, 10K, 21K) bajo fatiga acumulada'
        : 'Entrenar el estímulo específico de carrera con piernas y antebrazos fatigados',
      weekNumber: currentWeek,
      totalWeeks,
      weeksRemaining,
      volumeMultiplier: 1.0,
      focusDescription: discipline === 'running'
        ? 'Bloques sostenidos al ritmo objetivo exacto de competencia. Simulacros de carrera con gestión del ritmo y de la hidratación.'
        : 'Transición inmediata tras trineos, zancadas o suspensiones a carrera. Ritmo objetivo de competencia bajo estrés metabólico real.',
      badgeColor: 'bg-purple-600 text-white',
    };
  }

  // Mitad del ciclo: Potencia y Volumen Específico / Umbral de lactato
  const halfwayWeeks = Math.floor(totalWeeks / 2);
  if (currentWeek >= halfwayWeeks - 1) {
    return {
      phase: 'potencia',
      name: discipline === 'running' ? 'Fase 2: Umbral de Lactato y Series de Ritmo' : 'Fase 2: Potencia y Cargas de Competencia',
      subtitle: discipline === 'running'
        ? 'Desarrollo del consumo máximo de oxígeno (VO2 máx) y ritmo tempo sostenido'
        : 'Sobrecarga en pesos oficiales Open/Pro e intervalos de umbral de lactato',
      weekNumber: currentWeek,
      totalWeeks,
      weeksRemaining,
      volumeMultiplier: 1.1,
      focusDescription: discipline === 'running'
        ? 'Series de repeticiones (ej. 800m, 1000m a ritmo tempo) para elevar el umbral anaeróbico, aumentar la tolerancia al lactato y mejorar la economía de zancada.'
        : 'Cargas máximas de trineo y farmer carries, adaptaciones neuromusculares y series de umbral anaeróbico.',
      badgeColor: 'bg-amber-500 text-zinc-950',
    };
  }

  // Inicio del ciclo: Base Aeróbica y Capacidad de Trabajo
  return {
    phase: 'base',
    name: discipline === 'running' ? 'Fase 1: Base Aeróbica y Capacidad Mitocondrial' : 'Fase 1: Base Aeróbica y Capacidad de Trabajo',
    subtitle: discipline === 'running'
      ? 'Desarrollo en Zona 2 conversacional (80/20) y adaptación musculoesquelética'
      : 'Desarrollo mitocondrial en Zona 2 y fuerza base estructural',
    weekNumber: currentWeek,
    totalWeeks,
    weeksRemaining,
    volumeMultiplier: 0.9,
    focusDescription: discipline === 'running'
      ? 'El 80% de tus salidas a ritmo fácil y conversacional. Construye capilarización, densidad mitocondrial y protege tendones y articulaciones antes de meter alta intensidad.'
      : 'Volumen aeróbico fácil (80/20), técnica de carrera limpia, hipertrofia funcional y resistencia tendinosa antes de la alta intensidad.',
    badgeColor: 'bg-blue-600 text-white',
  };
};

// Calcula las semanas restantes a partir de una fecha de evento en formato YYYY-MM-DD
export const calculateWeeksUntilDate = (targetDateStr: string): number => {
  if (!targetDateStr) return 8;
  const target = new Date(targetDateStr).getTime();
  const now = Date.now();
  if (isNaN(target)) return 8;

  const diffMs = target - now;
  if (diffMs <= 0) return 1; // Semana de carrera
  const weeks = Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000));
  return Math.min(24, Math.max(1, weeks));
};
