// Motor de progresión adaptativa: convierte lo que ya registras (peso y reps por sesión) en
// una sugerencia concreta para la próxima vez, en vez de dejar que el usuario recuerde y decida
// solo. Todo corre localmente, sobre el historial guardado en localStorage.

export interface HistoryEntry {
  weight: string;
  reps: string;
  date: number;
}

export const MAX_HISTORY_ENTRIES = 12;

// Estimación de 1RM (fórmula de Epley: 1RM = peso × (1 + reps/30)), el método estándar para
// inferir fuerza máxima a partir de series submáximas sin necesidad de probar el 1RM real.
export const estimate1RM = (weight: number, reps: number): number => {
  if (!weight || weight <= 0 || !reps || reps <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
};

// Extrae el rango de repeticiones objetivo de un string como "8-10" o "10-12 por lado"
export const parseRepRange = (repsStr?: string): { min: number; max: number } | null => {
  if (!repsStr) return null;
  const nums = repsStr.match(/\d+/g)?.map(Number);
  if (!nums || nums.length === 0) return null;
  return nums.length === 1 ? { min: nums[0], max: nums[0] } : { min: nums[0], max: nums[1] };
};

// Redondea a un incremento de carga realista (el disco/mancuerna más pequeño disponible)
const roundToPracticalIncrement = (weight: number): number => {
  const step = weight >= 20 ? 2.5 : weight >= 6 ? 1 : 0.5;
  return Math.round(weight / step) * step;
};

// Añade un registro al historial de un ejercicio, con tope de entradas para no crecer sin límite
export const pushHistoryEntry = (history: HistoryEntry[] | undefined, entry: HistoryEntry): HistoryEntry[] => {
  const updated = [...(history || []), entry];
  return updated.slice(-MAX_HISTORY_ENTRIES);
};

export interface ProgressionSuggestion {
  text: string;
  trend?: string;
}

// Doble progresión (estándar en programación de hipertrofia basada en evidencia, p. ej. los
// esquemas de Renaissance Periodization): con el mismo peso, sube repeticiones dentro del rango
// objetivo; en cuanto tocas el techo del rango con buena técnica, sube el peso ~3-5% y vuelve
// al piso del rango. Sin rango objetivo, se limita a mostrar el último registro como referencia.
export const getProgressionSuggestion = (
  history: HistoryEntry[] | undefined,
  defaultReps?: string
): ProgressionSuggestion | null => {
  if (!history || history.length === 0) return null;
  const last = history[history.length - 1];
  const lastWeight = parseFloat(last.weight);
  const lastReps = parseInt(last.reps, 10);
  if (!lastWeight || isNaN(lastWeight) || lastWeight <= 0 || isNaN(lastReps) || lastReps <= 0) {
    return null;
  }

  const range = parseRepRange(defaultReps);
  let text: string;

  if (range && lastReps >= range.max) {
    const suggestedWeight = roundToPracticalIncrement(lastWeight * 1.04);
    text = `Sugerido hoy: ${suggestedWeight}kg × ${range.min} reps (completaste el rango con ${lastWeight}kg)`;
  } else if (range) {
    text = `Sugerido hoy: ${lastWeight}kg × ${Math.min(lastReps + 1, range.max)} reps (mismo peso, sube reps)`;
  } else {
    text = `Última vez: ${lastWeight}kg × ${lastReps} reps`;
  }

  // Tendencia de fuerza estimada (1RM) frente al registro anterior, si existe
  let trend: string | undefined;
  if (history.length >= 2) {
    const prev = history[history.length - 2];
    const prevWeight = parseFloat(prev.weight);
    const prevReps = parseInt(prev.reps, 10);
    const lastE1RM = estimate1RM(lastWeight, lastReps);
    const prevE1RM = estimate1RM(prevWeight, prevReps);
    if (prevE1RM > 0 && lastE1RM > 0) {
      const change = ((lastE1RM - prevE1RM) / prevE1RM) * 100;
      if (Math.abs(change) >= 1) {
        trend = `${change > 0 ? '↑' : '↓'} ${Math.abs(change).toFixed(0)}% de fuerza estimada vs. la sesión anterior`;
      }
    }
  }

  return { text, trend };
};
