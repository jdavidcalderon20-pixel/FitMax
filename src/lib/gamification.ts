export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'titanium';
export type BadgeCategory = 'strength' | 'running' | 'hybrid' | 'consistency';

export interface Badge {
  id: string;
  title: string;
  description: string;
  category: BadgeCategory;
  tier: BadgeTier;
  iconName: string;
  isUnlocked: boolean;
  progress: number; // 0 a 100
  progressLabel: string;
  unlockedAt?: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: BadgeCategory;
  targetValue: number;
  currentValue: number;
  unit: string;
  daysLeft: number;
  badgeRewardId: string;
  badgeRewardTitle: string;
  isJoined: boolean;
  isCompleted: boolean;
  progress: number; // 0 a 100
}

export interface EvaluationContext {
  weeklyLogs?: Record<string, { weight: string; reps: string; completed: boolean }>;
  weeklyHistory?: Record<string, Array<{ weight: string; reps: string; date: number }>>;
  runningLogs?: Array<{ distance_km: number; run_type: string; run_date?: string }>;
  hyroxOcrCompleted?: Record<string, boolean>;
  mesocycleWeek?: number;
  joinedChallengeIds?: string[];
}

export const BADGE_TIER_STYLES: Record<BadgeTier, { border: string; bg: string; text: string; ring: string }> = {
  bronze: {
    border: 'border-amber-700/60',
    bg: 'from-amber-950/40 to-amber-900/10',
    text: 'text-amber-500',
    ring: 'ring-amber-700/30'
  },
  silver: {
    border: 'border-slate-400/60',
    bg: 'from-slate-800/40 to-slate-900/10',
    text: 'text-slate-300',
    ring: 'ring-slate-400/30'
  },
  gold: {
    border: 'border-amber-400/70',
    bg: 'from-amber-500/20 to-yellow-950/20',
    text: 'text-amber-300',
    ring: 'ring-amber-400/40'
  },
  titanium: {
    border: 'border-cyan-400/80',
    bg: 'from-cyan-950/40 to-purple-950/30',
    text: 'text-cyan-300',
    ring: 'ring-cyan-400/50'
  }
};

export const INITIAL_BADGES: Omit<Badge, 'isUnlocked' | 'progress' | 'progressLabel' | 'unlockedAt'>[] = [
  {
    id: 'first_blood',
    title: 'Iniciación de Hierro',
    description: 'Completa y registra tu primer entrenamiento en cualquiera de los módulos.',
    category: 'consistency',
    tier: 'bronze',
    iconName: 'Flame'
  },
  {
    id: 'mesocycle_half',
    title: 'Mitad del Mesociclo',
    description: 'Alcanza la semana 4 de tu bloque de musculación con sobrecarga progresiva.',
    category: 'strength',
    tier: 'silver',
    iconName: 'Calendar'
  },
  {
    id: 'mesocycle_master',
    title: 'Maestro del Mesociclo',
    description: 'Completa las 8 semanas de tu mesociclo de musculación antes del deload.',
    category: 'strength',
    tier: 'gold',
    iconName: 'Trophy'
  },
  {
    id: 'zone2_pioneer',
    title: 'Motor Mitocondrial',
    description: 'Acumula al menos 20 km en rodajes suaves de Zona 2.',
    category: 'running',
    tier: 'bronze',
    iconName: 'Footprints'
  },
  {
    id: 'polarization_pro',
    title: 'Corredor Polarizado 80/20',
    description: 'Registra al menos 5 sesiones de carrera respetando la regla del 80% suave y 20% intenso.',
    category: 'running',
    tier: 'silver',
    iconName: 'HeartPulse'
  },
  {
    id: 'long_run_hero',
    title: 'Fondo Aeróbico (Tirada Larga)',
    description: 'Registra una tirada larga individual de 15 km o más.',
    category: 'running',
    tier: 'gold',
    iconName: 'Award'
  },
  {
    id: 'iron_grip',
    title: 'Garra de Acero OCR',
    description: 'Completa al menos 3 sesiones de trabajo específico de agarre o suspensiones.',
    category: 'hybrid',
    tier: 'silver',
    iconName: 'Mountain'
  },
  {
    id: 'hyrox_sim_finisher',
    title: 'Finisher Hyrox',
    description: 'Completa y marca como finalizada al menos una sesión completa de Hyrox.',
    category: 'hybrid',
    tier: 'gold',
    iconName: 'Zap'
  },
  {
    id: 'compromised_runner',
    title: 'Piernas de Acero',
    description: 'Completa 3 sesiones de Carrera Comprometida con fatiga previa en cuádriceps.',
    category: 'hybrid',
    tier: 'gold',
    iconName: 'Sparkles'
  },
  {
    id: 'progressive_overload_pro',
    title: 'Sobrecarga Imparable',
    description: 'Aumenta peso o repeticiones en tu historial en al menos 3 ejercicios distintos.',
    category: 'strength',
    tier: 'silver',
    iconName: 'Dumbbell'
  },
  {
    id: 'titanium_streak',
    title: 'Racha de Titanio',
    description: 'Alcanza 16 sesiones completadas en total en la aplicación.',
    category: 'consistency',
    tier: 'titanium',
    iconName: 'Shield'
  },
  {
    id: 'hybrid_warrior',
    title: 'Atleta Híbrido Completo',
    description: 'Entrena y registra sesiones en al menos 3 disciplinas: Musculación, Running y Hyrox/OCR.',
    category: 'consistency',
    tier: 'titanium',
    iconName: 'Crown'
  }
];

export const INITIAL_CHALLENGES: Omit<Challenge, 'currentValue' | 'isCompleted' | 'progress' | 'isJoined'>[] = [
  {
    id: 'challenge_50k_month',
    title: 'Reto Motor Aeróbico 50K',
    description: 'Acumula 50 km de running en este mes para optimizar tu capacidad cardiovascular.',
    category: 'running',
    targetValue: 50,
    unit: 'km',
    daysLeft: 21,
    badgeRewardId: 'zone2_pioneer',
    badgeRewardTitle: 'Motor Mitocondrial'
  },
  {
    id: 'challenge_mesocycle_16',
    title: 'Reto Disciplina de Mesociclo',
    description: 'Completa 16 sesiones de musculación en tu bloque Torso/Pierna.',
    category: 'strength',
    targetValue: 16,
    unit: 'sesiones',
    daysLeft: 28,
    badgeRewardId: 'mesocycle_half',
    badgeRewardTitle: 'Mitad del Mesociclo'
  },
  {
    id: 'challenge_hyrox_compromised',
    title: 'Reto Desafío Hyrox / OCR',
    description: 'Completa 4 sesiones combinadas de estaciones Hyrox o suspensiones de agarre OCR.',
    category: 'hybrid',
    targetValue: 4,
    unit: 'sesiones',
    daysLeft: 18,
    badgeRewardId: 'compromised_runner',
    badgeRewardTitle: 'Piernas de Acero'
  },
  {
    id: 'challenge_consistency_20',
    title: 'Reto Frecuencia de Élite',
    description: 'Registra 20 entrenamientos totales entre cualquier disciplina de la app.',
    category: 'consistency',
    targetValue: 20,
    unit: 'entrenos',
    daysLeft: 30,
    badgeRewardId: 'titanium_streak',
    badgeRewardTitle: 'Racha de Titanio'
  }
];

// Evalúa las medallas en función de la actividad real del usuario
export function evaluateBadges(context: EvaluationContext): Badge[] {
  const {
    weeklyLogs = {},
    weeklyHistory = {},
    runningLogs = [],
    hyroxOcrCompleted = {},
    mesocycleWeek = 1
  } = context;

  // Métricas calculadas
  const completedWeeklyExercises = Object.values(weeklyLogs).filter((l) => l.completed).length;
  const totalRunningKm = runningLogs.reduce((acc, log) => acc + (Number(log.distance_km) || 0), 0);
  const z2Km = runningLogs
    .filter((l) => l.run_type === 'easy_z2' || l.run_type === 'long_run')
    .reduce((acc, log) => acc + (Number(log.distance_km) || 0), 0);
  const maxLongRun = runningLogs.reduce((max, log) => Math.max(max, Number(log.distance_km) || 0), 0);
  const hyroxSessionsDone = Object.keys(hyroxOcrCompleted).filter((k) => k.startsWith('hyrox_') && hyroxOcrCompleted[k]).length;
  const ocrSessionsDone = Object.keys(hyroxOcrCompleted).filter((k) => k.startsWith('ocr_') && hyroxOcrCompleted[k]).length;
  const totalHyroxOcrDone = Object.values(hyroxOcrCompleted).filter(Boolean).length;

  // Sobrecarga progresiva: ejercicios con al menos 2 entradas en historial con peso creciente
  let progressiveExercisesCount = 0;
  Object.values(weeklyHistory).forEach((historyArr) => {
    if (historyArr && historyArr.length >= 2) {
      const first = parseFloat(historyArr[0]?.weight) || 0;
      const last = parseFloat(historyArr[historyArr.length - 1]?.weight) || 0;
      if (last > first) progressiveExercisesCount++;
    }
  });

  // Total de sesiones acumuladas estimadas
  const totalSessionsAcrossApp = (mesocycleWeek > 1 ? (mesocycleWeek - 1) * 4 : 0) +
    (completedWeeklyExercises > 0 ? 1 : 0) +
    runningLogs.length +
    totalHyroxOcrDone;

  // Detección de disciplinas
  const trainedDisciplines = [
    completedWeeklyExercises > 0 || Object.keys(weeklyHistory).length > 0,
    runningLogs.length > 0,
    totalHyroxOcrDone > 0
  ].filter(Boolean).length;

  return INITIAL_BADGES.map((b) => {
    let isUnlocked = false;
    let progress = 0;
    let progressLabel = '';

    switch (b.id) {
      case 'first_blood': {
        const totalActivity = completedWeeklyExercises + runningLogs.length + totalHyroxOcrDone;
        isUnlocked = totalActivity > 0;
        progress = isUnlocked ? 100 : 0;
        progressLabel = isUnlocked ? '1 / 1 entrenamiento' : '0 / 1 entrenamiento';
        break;
      }
      case 'mesocycle_half': {
        isUnlocked = mesocycleWeek >= 4;
        progress = Math.min(100, Math.round((mesocycleWeek / 4) * 100));
        progressLabel = `${Math.min(4, mesocycleWeek)} / 4 semanas`;
        break;
      }
      case 'mesocycle_master': {
        isUnlocked = mesocycleWeek >= 8;
        progress = Math.min(100, Math.round((mesocycleWeek / 8) * 100));
        progressLabel = `${Math.min(8, mesocycleWeek)} / 8 semanas`;
        break;
      }
      case 'zone2_pioneer': {
        isUnlocked = z2Km >= 20;
        progress = Math.min(100, Math.round((z2Km / 20) * 100));
        progressLabel = `${Math.round(z2Km * 10) / 10} / 20 km Z2`;
        break;
      }
      case 'polarization_pro': {
        const runsCount = runningLogs.length;
        isUnlocked = runsCount >= 5;
        progress = Math.min(100, Math.round((runsCount / 5) * 100));
        progressLabel = `${runsCount} / 5 carreras registradas`;
        break;
      }
      case 'long_run_hero': {
        isUnlocked = maxLongRun >= 15;
        progress = Math.min(100, Math.round((maxLongRun / 15) * 100));
        progressLabel = `${Math.round(maxLongRun * 10) / 10} / 15 km de tirada`;
        break;
      }
      case 'iron_grip': {
        isUnlocked = ocrSessionsDone >= 3;
        progress = Math.min(100, Math.round((ocrSessionsDone / 3) * 100));
        progressLabel = `${ocrSessionsDone} / 3 sesiones OCR`;
        break;
      }
      case 'hyrox_sim_finisher': {
        isUnlocked = hyroxSessionsDone >= 1;
        progress = isUnlocked ? 100 : 0;
        progressLabel = `${hyroxSessionsDone} / 1 sesión Hyrox`;
        break;
      }
      case 'compromised_runner': {
        const compromisedRuns = hyroxSessionsDone + ocrSessionsDone;
        isUnlocked = compromisedRuns >= 3;
        progress = Math.min(100, Math.round((compromisedRuns / 3) * 100));
        progressLabel = `${compromisedRuns} / 3 sesiones comprometidas`;
        break;
      }
      case 'progressive_overload_pro': {
        isUnlocked = progressiveExercisesCount >= 3;
        progress = Math.min(100, Math.round((progressiveExercisesCount / 3) * 100));
        progressLabel = `${progressiveExercisesCount} / 3 ejercicios con sobrecarga`;
        break;
      }
      case 'titanium_streak': {
        isUnlocked = totalSessionsAcrossApp >= 16;
        progress = Math.min(100, Math.round((totalSessionsAcrossApp / 16) * 100));
        progressLabel = `${totalSessionsAcrossApp} / 16 sesiones totales`;
        break;
      }
      case 'hybrid_warrior': {
        isUnlocked = trainedDisciplines >= 3;
        progress = Math.min(100, Math.round((trainedDisciplines / 3) * 100));
        progressLabel = `${trainedDisciplines} / 3 disciplinas probadas`;
        break;
      }
      default:
        break;
    }

    return {
      ...b,
      isUnlocked,
      progress,
      progressLabel,
      unlockedAt: isUnlocked ? Date.now() : undefined
    };
  });
}

// Evalúa los retos activos según métricas
export function evaluateChallenges(context: EvaluationContext): Challenge[] {
  const {
    runningLogs = [],
    hyroxOcrCompleted = {},
    mesocycleWeek = 1,
    joinedChallengeIds = []
  } = context;

  const totalRunningKm = runningLogs.reduce((acc, log) => acc + (Number(log.distance_km) || 0), 0);
  const totalHyroxOcrDone = Object.values(hyroxOcrCompleted).filter(Boolean).length;
  const estimatedGymSessions = (mesocycleWeek > 1 ? (mesocycleWeek - 1) * 4 : 0);
  const totalSessions = estimatedGymSessions + runningLogs.length + totalHyroxOcrDone;

  return INITIAL_CHALLENGES.map((ch) => {
    let currentValue = 0;
    switch (ch.id) {
      case 'challenge_50k_month':
        currentValue = Math.round(totalRunningKm * 10) / 10;
        break;
      case 'challenge_mesocycle_16':
        currentValue = estimatedGymSessions;
        break;
      case 'challenge_hyrox_compromised':
        currentValue = totalHyroxOcrDone;
        break;
      case 'challenge_consistency_20':
        currentValue = totalSessions;
        break;
      default:
        break;
    }

    const progress = Math.min(100, Math.round((currentValue / ch.targetValue) * 100));
    const isCompleted = progress >= 100;
    const isJoined = joinedChallengeIds.includes(ch.id);

    return {
      ...ch,
      currentValue,
      progress,
      isCompleted,
      isJoined
    };
  });
}
