// Lógica del módulo de Running: tipos de sesión, cálculo de ritmo, reparto 80/20 y control de
// progresión de volumen semanal.
import { GeoPoint } from './gpx';

export type RunType = 'facil' | 'tempo' | 'series' | 'larga';

export interface RunLog {
  id: string;
  date: number; // timestamp
  distanceKm: number;
  durationMin: number;
  type: RunType;
  rpe: number; // esfuerzo percibido, 1-10
  notes?: string;
  route?: GeoPoint[];
}

export const RUN_TYPES: { id: RunType; label: string; description: string }[] = [
  { id: 'facil', label: 'Fácil / Z2', description: 'Ritmo conversacional, esfuerzo bajo' },
  { id: 'larga', label: 'Larga distancia', description: 'Rodaje largo a ritmo fácil' },
  { id: 'tempo', label: 'Tempo', description: 'Ritmo moderado-alto sostenido' },
  { id: 'series', label: 'Series / Intervalos', description: 'Repeticiones a alta intensidad' },
];

export const calculatePace = (distanceKm: number, durationMin: number): string => {
  if (!distanceKm || distanceKm <= 0 || !durationMin || durationMin <= 0) return '--';
  const paceMinPerKm = durationMin / distanceKm;
  const min = Math.floor(paceMinPerKm);
  const sec = Math.round((paceMinPerKm - min) * 60);
  return `${min}:${sec.toString().padStart(2, '0')}/km`;
};

const startOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // semana empieza el lunes
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

export interface WeeklyRunStats {
  totalKm: number;
  totalMin: number;
  sessionCount: number;
  easyPct: number;
  hardPct: number;
}

// Estadísticas de la semana actual (weeksAgo=0) o de N semanas atrás, para comparar progresión
export const getWeeklyRunStats = (logs: RunLog[], weeksAgo: number = 0): WeeklyRunStats => {
  const now = new Date();
  const weekStart = startOfWeek(now);
  weekStart.setDate(weekStart.getDate() - weeksAgo * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const weekLogs = logs.filter((l) => l.date >= weekStart.getTime() && l.date < weekEnd.getTime());
  const totalKm = weekLogs.reduce((sum, l) => sum + l.distanceKm, 0);
  const totalMin = weekLogs.reduce((sum, l) => sum + l.durationMin, 0);
  const easyKm = weekLogs
    .filter((l) => l.type === 'facil' || l.type === 'larga')
    .reduce((sum, l) => sum + l.distanceKm, 0);
  const easyPct = totalKm > 0 ? Math.round((easyKm / totalKm) * 100) : 0;

  return { totalKm, totalMin, sessionCount: weekLogs.length, easyPct, hardPct: 100 - easyPct };
};

export interface VolumeFeedback {
  level: 'ok' | 'watch';
  text: string;
}

// Progresión de volumen semanal: un salto brusco (>10%) se usa como heurístico razonable de
// carga de entrenamiento, aunque la evidencia específica de ese umbral como predictor único de
// lesión es mixta — el riesgo real depende más del manejo global de carga y recuperación.
export const getVolumeFeedback = (logs: RunLog[]): VolumeFeedback | null => {
  const thisWeek = getWeeklyRunStats(logs, 0);
  const lastWeek = getWeeklyRunStats(logs, 1);
  if (lastWeek.totalKm === 0 || thisWeek.totalKm === 0) return null;

  const change = ((thisWeek.totalKm - lastWeek.totalKm) / lastWeek.totalKm) * 100;
  if (change > 10) {
    return {
      level: 'watch',
      text: `Tu volumen subió ${change.toFixed(0)}% frente a la semana pasada. Subidas bruscas se asocian con más riesgo de sobrecarga — considera un aumento más gradual la próxima semana.`,
    };
  }
  return {
    level: 'ok',
    text: `Progresión de volumen dentro de un rango razonable (${change >= 0 ? '+' : ''}${change.toFixed(0)}% vs. la semana pasada).`,
  };
};

// Reparto 80/20 (entrenamiento polarizado, Seiler): la mayoría del volumen debe ser fácil
export const getPolarizationFeedback = (stats: WeeklyRunStats): string | null => {
  if (stats.totalKm === 0) return null;
  if (stats.easyPct < 65) {
    return `Esta semana ${stats.easyPct}% fue fácil / ${stats.hardPct}% moderado-fuerte. El modelo polarizado sugiere ~80% fácil — te está faltando volumen suave.`;
  }
  return `Esta semana ${stats.easyPct}% fue fácil / ${stats.hardPct}% moderado-fuerte, cerca del reparto 80/20 recomendado.`;
};
