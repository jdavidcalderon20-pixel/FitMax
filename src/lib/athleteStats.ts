// Motor de cálculo y agregación de métricas y estadísticas del atleta híbrido.
// Cruza datos reales locales de Gimnasio, Running, Hyrox/OCR y Funcional.

export interface AthleteWeeklySummary {
  // Entrenamientos
  totalWorkouts: number;
  targetWorkouts: number;
  compliancePercentage: number;

  // Running
  totalRunningKm: number;
  targetRunningKm: number;
  runningPaceAvg: string;
  runningMinutes: number;
  easyRunningPct: number; // Porcentaje en Zona 2 / Fácil

  // Gimnasio / Fuerza
  gymSetsCompleted: number;
  gymMinutes: number;
  estimatedTonnageKg: number; // Tonelaje aproximado movido (kg * reps)

  // Hyrox & OCR
  hyroxSessionsCompleted: number;
  hyroxStationsCompleted: number;
  hyroxMinutes: number;

  // Globales
  totalActiveMinutes: number;
  weeksStreak: number;
  disciplineBreakdown: {
    gymPct: number;
    runningPct: number;
    hyroxPct: number;
    functionalPct: number;
  };
  loadStatus: 'recuperacion' | 'optimo' | 'alto' | 'sobrecarga';
  loadBadgeText: string;
  loadAdvice: string;
  recentHighlights: string[];
}

// Obtiene la fecha de inicio de la semana actual (lunes a las 00:00)
export const getStartOfWeek = (d: Date = new Date()): number => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

export const getAthleteWeeklySummary = (nickname: string): AthleteWeeklySummary => {
  const startOfWeek = getStartOfWeek();
  const now = Date.now();
  const getStorage = (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
    } catch (e) {}
    return null;
  };

  // 1. RUNNING LOGS
  let runningKm = 0;
  let runningMin = 0;
  let runningPaceSum = 0;
  let runningSessionsCount = 0;
  let easyKm = 0;

  try {
    const rawRunLogs = getStorage(`fit_gen_${nickname}_running_logs_v1`);
    if (rawRunLogs) {
      const logs = JSON.parse(rawRunLogs);
      if (Array.isArray(logs)) {
        logs.forEach((l: any) => {
          if (l.date && l.date >= startOfWeek && l.date <= now) {
            const km = Number(l.distanceKm) || 0;
            const min = Number(l.durationMin) || 0;
            runningKm += km;
            runningMin += min;
            runningSessionsCount += 1;
            if (km > 0 && min > 0) {
              runningPaceSum += min / km;
            }
            if (l.type === 'facil' || l.type === 'larga') {
              easyKm += km;
            }
          }
        });
      }
    }
  } catch (e) {}

  // Revisar si hay sesiones completadas en el plan periodizado de Running
  let runningPlanCompletedCount = 0;
  try {
    const rawCompletedRunningPlan = getStorage(`fitmax_running_completed_${nickname}`);
    if (rawCompletedRunningPlan) {
      const map = JSON.parse(rawCompletedRunningPlan);
      const keys = Object.keys(map).filter((k) => map[k]);
      runningPlanCompletedCount = keys.length;
    }
  } catch (e) {}

  // Si no había logs individuales manuales pero hay sesiones del plan marcadas
  if (runningSessionsCount === 0 && runningPlanCompletedCount > 0) {
    runningSessionsCount = runningPlanCompletedCount;
    runningKm = runningPlanCompletedCount * 6.5; // Estimado promedio 6.5km por sesión
    runningMin = Math.round(runningKm * 5.5);
    easyKm = runningKm * 0.75;
  }

  // 2. GYM LOGS & SETS
  let gymSets = 0;
  let gymSessionsCount = 0;
  let tonnage = 0;

  try {
    const rawWeeklyLogs = getStorage(`fit_gen_${nickname}_weekly_logs_v1`);
    if (rawWeeklyLogs) {
      const logs = JSON.parse(rawWeeklyLogs);
      // logs tiene llaves tipo `${level}_day${dayId}_${exerciseName}`
      const entries = Object.values(logs) as { weight?: string; reps?: string; completed?: boolean }[];
      entries.forEach((entry) => {
        if (entry.completed) {
          gymSets += 1;
          const w = parseFloat(entry.weight || '0');
          const r = parseInt(entry.reps || '0', 10);
          if (w > 0 && r > 0) {
            tonnage += w * r;
          }
        }
      });
    }

    // Revisar días de gimnasio marcados
    const rawCompletedGymDays = getStorage(`fit_gen_${nickname}_weekly_completed_days_v1`);
    if (rawCompletedGymDays) {
      const days = JSON.parse(rawCompletedGymDays);
      if (Array.isArray(days)) {
        gymSessionsCount = days.length;
      }
    } else if (gymSets > 0) {
      gymSessionsCount = Math.max(1, Math.ceil(gymSets / 16)); // ~16 series por sesión de gimnasio
    }
  } catch (e) {}

  const gymMinutes = gymSessionsCount * 55; // ~55 min por sesión promedio

  // 3. HYROX & OCR
  let hyroxSessionsCount = 0;
  let hyroxStations = 0;

  try {
    const rawHyrox = getStorage(`fit_gen_${nickname}_hyroxocr_completed_v1`);
    if (rawHyrox) {
      const map = JSON.parse(rawHyrox);
      hyroxSessionsCount = Object.keys(map).filter((k) => map[k]).length;
      hyroxStations = hyroxSessionsCount * 4; // ~4 estaciones/bloques por sesión
    }
  } catch (e) {}

  const hyroxMinutes = hyroxSessionsCount * 45; // ~45 min por sesión de Hyrox

  // 4. TOTALES Y RATIOS
  const totalWorkouts = gymSessionsCount + runningSessionsCount + hyroxSessionsCount;
  const targetWorkouts = 5; // Meta estándar semanal
  const compliancePercentage = Math.min(100, Math.round((totalWorkouts / targetWorkouts) * 100));
  const totalActiveMinutes = gymMinutes + runningMin + hyroxMinutes;

  // Promedio de ritmo de carrera
  let runningPaceAvg = '--';
  if (runningKm > 0 && runningMin > 0) {
    const paceDecimal = runningMin / runningKm;
    const mins = Math.floor(paceDecimal);
    const secs = Math.round((paceDecimal - mins) * 60);
    runningPaceAvg = `${mins}:${secs < 10 ? '0' : ''}${secs}/km`;
  }

  // Racha de semanas
  let weeksStreak = 1;
  try {
    const savedWeek = getStorage(`fit_gen_${nickname}_weekly_mesocycle_current_week`);
    if (savedWeek) weeksStreak = Math.max(1, parseInt(savedWeek, 10));
  } catch (e) {}

  // Porcentaje 80/20 de carrera
  const easyRunningPct = runningKm > 0 ? Math.round((easyKm / runningKm) * 100) : 80;

  // Reparto de disciplinas
  const minutesSum = Math.max(1, totalActiveMinutes);
  const gymPct = Math.round((gymMinutes / minutesSum) * 100);
  const runningPct = Math.round((runningMin / minutesSum) * 100);
  const hyroxPct = Math.round((hyroxMinutes / minutesSum) * 100);
  const functionalPct = Math.max(0, 100 - (gymPct + runningPct + hyroxPct));

  // Diagnóstico de Carga (Inspirado en Foster / Intervals.icu)
  let loadStatus: AthleteWeeklySummary['loadStatus'] = 'optimo';
  let loadBadgeText = 'Carga Óptima';
  let loadAdvice = 'Estás en el rango ideal de volumen y estímulo. Excelente asimilación neuromuscular.';

  if (totalWorkouts === 0) {
    loadStatus = 'recuperacion';
    loadBadgeText = 'Semana Iniciando';
    loadAdvice = 'Aún no registras sesiones esta semana. Programa tu primer entrenamiento para activar la racha.';
  } else if (totalWorkouts <= 2) {
    loadStatus = 'recuperacion';
    loadBadgeText = 'Carga Moderada';
    loadAdvice = 'Buen inicio de semana. Tienes margen para sumar una sesión de rodaje o fuerza antes del fin de semana.';
  } else if (totalWorkouts >= 6 || totalActiveMinutes > 360) {
    loadStatus = 'sobrecarga';
    loadBadgeText = 'Alto Volumen';
    loadAdvice = 'Volumen semanal exigente. Prioriza hidratación, 8h de sueño y movilidad para no acumular fatiga residual.';
  } else if (totalWorkouts >= 4) {
    loadStatus = 'optimo';
    loadBadgeText = 'En el Punto Óptimo';
    loadAdvice = 'Equilibrio perfecto entre estímulo cardiovascular y tensión mecánica de pesas.';
  }

  // Hitos o destacados recientes
  const recentHighlights: string[] = [];
  if (totalWorkouts >= 3) {
    recentHighlights.push(`🔥 ${totalWorkouts} entrenamientos completados esta semana.`);
  }
  if (runningKm >= 10) {
    recentHighlights.push(`🏃 ${runningKm.toFixed(1)} km de carrera acumulados (${easyRunningPct}% en Zona 2).`);
  }
  if (gymSets >= 12) {
    recentHighlights.push(`💪 ${gymSets} series efectivas completadas en el gimnasio.`);
  }
  if (hyroxSessionsCount >= 1) {
    recentHighlights.push(`⚡ ${hyroxSessionsCount} sesión de Hyrox / Compromised running completada.`);
  }
  if (recentHighlights.length === 0) {
    recentHighlights.push('🎯 Tu objetivo semanal está fijado en 4 a 5 sesiones equilibradas.');
    recentHighlights.push('📈 Cada serie y cada kilómetro que registres actualizará este panel en tiempo real.');
  }

  return {
    totalWorkouts,
    targetWorkouts,
    compliancePercentage,
    totalRunningKm: Math.round(runningKm * 10) / 10,
    targetRunningKm: 25, // Meta semanal estándar
    runningPaceAvg,
    runningMinutes: runningMin,
    easyRunningPct,
    gymSetsCompleted: gymSets,
    gymMinutes,
    estimatedTonnageKg: Math.round(tonnage),
    hyroxSessionsCompleted: hyroxSessionsCount,
    hyroxStationsCompleted: hyroxStations,
    hyroxMinutes,
    totalActiveMinutes,
    weeksStreak,
    disciplineBreakdown: {
      gymPct,
      runningPct,
      hyroxPct,
      functionalPct
    },
    loadStatus,
    loadBadgeText,
    loadAdvice,
    recentHighlights
  };
};
