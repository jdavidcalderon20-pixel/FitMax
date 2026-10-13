// Motor de Autorregulación y Feedback Post-Entrenamiento
// Ajusta dinámicamente las cargas y volumen de la próxima sesión según RPE, completitud y fatiga articular

export interface PostWorkoutFeedback {
  sessionId: string;
  discipline: string;
  perceivedIntensity: 'muy_suave' | 'adecuado' | 'al_limite';
  repsCompletion: 'completas' | 'adaptadas' | 'incompletas';
  jointFatigue: 'ninguna' | 'muscular_normal' | 'molestia_articular';
  notes?: string;
  loggedAt: number;
}

export interface AutoregulationAdjustment {
  factor: number; // Factor sobre pesos o distancia (ej. 1.05 = +5%, 0.85 = -15%)
  volumeRecommendation: string;
  feedbackTitle: string;
  feedbackAdvice: string;
  alertType: 'success' | 'info' | 'warning';
}

export const calculateAutoregulation = (feedback: PostWorkoutFeedback): AutoregulationAdjustment => {
  // 1. Prioridad médica/articular: Molestia en tendón o articulación
  if (feedback.jointFatigue === 'molestia_articular') {
    return {
      factor: 0.85,
      volumeRecommendation: 'Reducir volumen un 20% en la siguiente sesión',
      feedbackTitle: 'Atención a fatiga articular',
      feedbackAdvice: 'Detectada molestia no muscular. Reduciremos un 15-20% el impacto e intensidad de la próxima sesión. Realiza calentamiento RAMP extendido y prioriza movilidad.',
      alertType: 'warning',
    };
  }

  // 2. Al límite / fallo excesivo o no completó las series
  if (feedback.perceivedIntensity === 'al_limite' || feedback.repsCompletion === 'incompletas') {
    return {
      factor: 0.95,
      volumeRecommendation: 'Mantener o reducir 1 serie para disipar fatiga',
      feedbackTitle: 'Fatiga neuromuscular elevada',
      feedbackAdvice: 'Llegaste al límite en la sesión. Para evitar el sobreentrenamiento y estancamiento, consolidaremos esta carga antes de subir peso o volumen.',
      alertType: 'info',
    };
  }

  // 3. Estímulo completado con holgura (RIR alto / ritmo muy suave)
  if (feedback.perceivedIntensity === 'muy_suave' && feedback.repsCompletion === 'completas') {
    return {
      factor: 1.05,
      volumeRecommendation: 'Sobrecarga progresiva: +2.5% a +5% de carga o +10% en carrera',
      feedbackTitle: '¡Gran capacidad de trabajo!',
      feedbackAdvice: 'Completaste el bloque con reserva. La IA sugiere aumentar ligeramente la carga o el ritmo en tu próxima sesión.',
      alertType: 'success',
    };
  }

  // 4. Estímulo calibrado perfectamente
  return {
    factor: 1.0,
    volumeRecommendation: 'Carga óptima calibrada',
    feedbackTitle: 'Estímulo perfecto en el blanco',
    feedbackAdvice: 'Intensidad y recuperación equilibradas. Mantén este ritmo en la siguiente sesión.',
    alertType: 'info',
  };
};

export const getStoredFeedbackKey = (nickname: string, discipline: string): string =>
  `fit_gen_${nickname}_last_feedback_${discipline}`;

export const saveLastFeedback = (nickname: string, feedback: PostWorkoutFeedback): void => {
  if (typeof localStorage === 'undefined' || !nickname) return;
  try {
    localStorage.setItem(getStoredFeedbackKey(nickname, feedback.discipline), JSON.stringify(feedback));
  } catch (e) {
    console.error(e);
  }
};

export const getLastFeedback = (nickname: string, discipline: string): PostWorkoutFeedback | null => {
  if (typeof localStorage === 'undefined' || !nickname) return null;
  try {
    const raw = localStorage.getItem(getStoredFeedbackKey(nickname, discipline));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
