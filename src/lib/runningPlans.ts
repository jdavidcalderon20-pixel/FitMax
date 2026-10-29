// Motor de generación de planes de entrenamiento de running según distancia, ritmo objetivo y fase de periodización.
// Basado en el principio 80/20 (Jack Daniels / Stephen Seiler) y periodización lineal/ondulada de carrera.

import { RunType } from './running';
import { PeriodizationPhase } from './periodization';

export type RaceDistance = '5K' | '10K' | '21K' | '42K';

export interface RunningWorkoutBlock {
  id: string;
  phaseType: 'warmup' | 'work' | 'recovery' | 'cooldown';
  title: string;
  targetType: 'distance' | 'time';
  targetValue: number; // km si es 'distance', segundos si es 'time'
  targetPace?: string;
  instructions: string;
}

export interface PlannedRunningSession {
  id: string;
  dayTitle: string;
  type: RunType;
  name: string;
  distanceKm: number;
  targetPaceLabel: string;
  estimatedDurationMin: number;
  rpe: number;
  focus: string;
  structure: string[];
  isCustom?: boolean;
  customBlocks?: RunningWorkoutBlock[];
}

export interface RunningCoachGuidance {
  phaseName: string;
  phaseBadge: string;
  headline: string;
  explanation: string;
  weeklyVolumeKm: number;
  totalTimeEstimatedMin: number;
  coachTips: string[];
  suggestedSchedule: { day: string; sessionNumber: number; title: string; type: RunType }[];
}

// Formatea un ritmo numérico (ej. 5.5 min/km -> "5:30 min/km")
export const formatPaceDecimal = (paceDecimal: number): string => {
  const mins = Math.floor(paceDecimal);
  const secs = Math.round((paceDecimal - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, '0')} min/km`;
};

// Calcula el tiempo total de carrera estimado según distancia y ritmo objetivo
export const calculateRaceFinishTime = (distance: RaceDistance, targetPaceDecimal: number): string => {
  const km = distance === '5K' ? 5 : distance === '10K' ? 10 : distance === '21K' ? 21.0975 : 42.195;
  const totalMinutes = km * targetPaceDecimal;
  const hours = Math.floor(totalMinutes / 60);
  const mins = Math.floor(totalMinutes % 60);
  const secs = Math.round((totalMinutes - Math.floor(totalMinutes)) * 60);

  if (hours > 0) {
    return `${hours}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  }
  return `${mins}m ${secs.toString().padStart(2, '0')}s`;
};

// Genera las 4 sesiones semanales clave adaptadas a la distancia, ritmo objetivo y fase de periodización activa
export const generateRunningPlan = (
  distance: RaceDistance,
  targetPaceDecimal: number = 5.0,
  phase: PeriodizationPhase = 'base',
  currentWeek: number = 1,
  totalWeeks: number = 12
): PlannedRunningSession[] => {
  // Ritmos calibrados según Jack Daniels VDOT / 80-20:
  // - Fácil / Z2: Ritmo objetivo + 60 a 75 segundos/km
  const easyPace = targetPaceDecimal + 1.1; 
  // - Series (VO2 Máx): Ritmo objetivo - 20 a 30 segundos/km
  const intervalPace = Math.max(3.0, targetPaceDecimal - 0.4); 
  // - Tempo (Umbral): Ritmo objetivo exacto o +10s
  const tempoPace = targetPaceDecimal;
  // - Ritmo vivo recuperación / chispa
  const speedPace = Math.max(2.8, targetPaceDecimal - 0.6);

  // ==========================================
  // DISTANCIA: 5K
  // ==========================================
  if (distance === '5K') {
    if (phase === 'base') {
      return [
        {
          id: '5k_s1_facil',
          dayTitle: 'Sesión 1 · Rodaje Base Z2',
          type: 'facil',
          name: 'Rodaje aeróbico mitocondrial',
          distanceKm: 5.0,
          targetPaceLabel: formatPaceDecimal(easyPace),
          estimatedDurationMin: Math.round(5.0 * easyPace),
          rpe: 4,
          focus: 'Capilarización y adaptación tendinosa en Zona 2 sin acumular fatiga.',
          structure: [
            '5 min de movilidad articular dinámica (tobillos, cadera y zancadas cortas).',
            `5.0 km continuos a ritmo cómodo conversacional (${formatPaceDecimal(easyPace)}).`,
            'Si te cuesta hablar en oraciones completas, desacelera de inmediato: el objetivo es 100% aeróbico.'
          ]
        },
        {
          id: '5k_s2_series',
          dayTitle: 'Sesión 2 · Fartlek / Cuestas Cortas',
          type: 'series',
          name: 'Fartlek aeróbico dinámico (6 × 1 min)',
          distanceKm: 5.2,
          targetPaceLabel: formatPaceDecimal(intervalPace),
          estimatedDurationMin: 32,
          rpe: 7,
          focus: 'Estimulación neuromuscular y cadencia viva sin llegar al fallo de lactato.',
          structure: [
            '1.5 km de trote suave de calentamiento progresivo.',
            `6 repeticiones de 1 minuto a ritmo alegre (${formatPaceDecimal(intervalPace)}) por 1 minuto de trote muy suave.`,
            'Enfoque en braceo limpio y pisada de mediopié.',
            '1.3 km de trote muy suave de enfriamiento.'
          ]
        },
        {
          id: '5k_s3_tempo',
          dayTitle: 'Sesión 3 · Rodaje Medio + Rectas',
          type: 'tempo',
          name: 'Rodaje medio continuo con rectas de soltura',
          distanceKm: 4.8,
          targetPaceLabel: formatPaceDecimal(easyPace),
          estimatedDurationMin: Math.round(4.8 * easyPace + 4),
          rpe: 5,
          focus: 'Volumen aeróbico y soltura de tobillos.',
          structure: [
            `4.0 km a ritmo continuo cómodo (${formatPaceDecimal(easyPace)}).`,
            '4 aceleraciones progresivas de 80 metros en césped o llano (strides) para mantener reactividad neuromuscular.',
            'Caminata y estiramientos suaves.'
          ]
        },
        {
          id: '5k_s4_larga',
          dayTitle: 'Sesión 4 · Tirada Larga Aeróbica',
          type: 'larga',
          name: 'Fondo continuo puramente aeróbico',
          distanceKm: 7.0,
          targetPaceLabel: formatPaceDecimal(easyPace),
          estimatedDurationMin: Math.round(7.0 * easyPace),
          rpe: 5,
          focus: 'Enseñarle al cuerpo a optimizar la combustión de grasas.',
          structure: [
            `7.0 km continuos a ritmo constante y parejo (${formatPaceDecimal(easyPace)}).`,
            'Mantén cadencia ligera (alrededor de 170-180 pasos por minuto).',
            'Hidratación ligera al terminar.'
          ]
        }
      ];
    }

    if (phase === 'potencia') {
      return [
        {
          id: '5k_s1_facil',
          dayTitle: 'Sesión 1 · Rodaje Regenerativo Z2',
          type: 'facil',
          name: 'Carrera suave regenerativa',
          distanceKm: 5.0,
          targetPaceLabel: formatPaceDecimal(easyPace),
          estimatedDurationMin: Math.round(5.0 * easyPace),
          rpe: 4,
          focus: 'Recuperación activa y flujo sanguíneo sin impacto residual.',
          structure: [
            `5.0 km continuos en Zona 2 conversacional (${formatPaceDecimal(easyPace)}).`,
            'Trote relajado con respiración nasal.'
          ]
        },
        {
          id: '5k_s2_series',
          dayTitle: 'Sesión 2 · Series de Velocidad (VO2 Máx)',
          type: 'series',
          name: 'Intervalos explosivos 6 × 400m',
          distanceKm: 5.4,
          targetPaceLabel: formatPaceDecimal(intervalPace),
          estimatedDurationMin: 34,
          rpe: 8,
          focus: 'Elevar el consumo máximo de oxígeno (VO2 máx) y potencia de zancada.',
          structure: [
            '1.5 km de trote suave de calentamiento progresivo.',
            `6 repeticiones de 400m exactos a ritmo de series (${formatPaceDecimal(intervalPace)}).`,
            '75 segundos de recuperación caminando o trote lento entre repeticiones.',
            '1.5 km de trote suave de vuelta a la calma.'
          ]
        },
        {
          id: '5k_s3_tempo',
          dayTitle: 'Sesión 3 · Tempo Run (Umbral de Lactato)',
          type: 'tempo',
          name: 'Bloque a ritmo de competición de 5K',
          distanceKm: 5.5,
          targetPaceLabel: formatPaceDecimal(tempoPace),
          estimatedDurationMin: Math.round(5.5 * tempoPace + 4),
          rpe: 7,
          focus: 'Tolerancia y reciclaje de lactato al ritmo meta.',
          structure: [
            '1.2 km de trote suave de activación.',
            `3.0 km sostenidos a tu ritmo meta de carrera (${formatPaceDecimal(tempoPace)}).`,
            '1.3 km de trote regenerativo final.'
          ]
        },
        {
          id: '5k_s4_larga',
          dayTitle: 'Sesión 4 · Tirada Larga Progresiva',
          type: 'larga',
          name: 'Fondo aeróbico con final vivo',
          distanceKm: 8.0,
          targetPaceLabel: formatPaceDecimal(easyPace),
          estimatedDurationMin: Math.round(8.0 * easyPace),
          rpe: 6,
          focus: 'Resistencia muscular y capacidad de acelerar con piernas fatigadas.',
          structure: [
            `Primeros 6.0 km a ritmo cómodo Zona 2 (${formatPaceDecimal(easyPace)}).`,
            `Últimos 2.0 km acelerando de forma sostenida hasta tu ritmo tempo (${formatPaceDecimal(tempoPace)}).`,
            'Estiramientos estáticos suaves al finalizar.'
          ]
        }
      ];
    }

    if (phase === 'compromised') {
      return [
        {
          id: '5k_s1_facil',
          dayTitle: 'Sesión 1 · Rodaje Base Z2',
          type: 'facil',
          name: 'Rodaje de mantenimiento aeróbico',
          distanceKm: 5.0,
          targetPaceLabel: formatPaceDecimal(easyPace),
          estimatedDurationMin: Math.round(5.0 * easyPace),
          rpe: 4,
          focus: 'Economía de carrera y soltura sin acumular estrés.',
          structure: [
            `5.0 km continuos a ritmo suave (${formatPaceDecimal(easyPace)}).`,
            '3 rectas progresivas de 60m para activar el tobillo.'
          ]
        },
        {
          id: '5k_s2_series',
          dayTitle: 'Sesión 2 · Intervalos a Ritmo Objetivo 5K',
          type: 'series',
          name: 'Series específicas 4 × 1000m',
          distanceKm: 6.5,
          targetPaceLabel: formatPaceDecimal(tempoPace),
          estimatedDurationMin: 42,
          rpe: 8,
          focus: 'Memorización neuromuscular exacta del paso de 5K.',
          structure: [
            '1.5 km de calentamiento progresivo.',
            `4 repeticiones de 1000m exactos al ritmo de carrera previsto (${formatPaceDecimal(tempoPace)}).`,
            '90 segundos de recuperación caminando entre cada mil.',
            '1.0 km de trote regenerativo.'
          ]
        },
        {
          id: '5k_s3_tempo',
          dayTitle: 'Sesión 3 · Simulacro Específico 5K',
          type: 'tempo',
          name: 'Bloque continuo de ritmo meta',
          distanceKm: 5.5,
          targetPaceLabel: formatPaceDecimal(tempoPace),
          estimatedDurationMin: Math.round(5.5 * tempoPace + 3),
          rpe: 8,
          focus: 'Gestión psicológica y sensaciones reales de competencia.',
          structure: [
            '1.0 km de trote suave con ejercicios de técnica de carrera.',
            `3.5 km continuos clavando tu ritmo objetivo (${formatPaceDecimal(tempoPace)}).`,
            '1.0 km de vuelta a la calma muy suave.'
          ]
        },
        {
          id: '5k_s4_larga',
          dayTitle: 'Sesión 4 · Tirada Larga Específica',
          type: 'larga',
          name: 'Fondo de resistencia con remate competitivo',
          distanceKm: 8.5,
          targetPaceLabel: formatPaceDecimal(easyPace),
          estimatedDurationMin: Math.round(8.5 * easyPace),
          rpe: 6,
          focus: 'Garantizar que los 5 km del evento se sientan cortos y manejables.',
          structure: [
            `5.5 km a ritmo Zona 2 fácil (${formatPaceDecimal(easyPace)}).`,
            `Últimos 3.0 km apretando al ritmo de carrera (${formatPaceDecimal(tempoPace)}).`,
            'Hidratación con sales minerales.'
          ]
        }
      ];
    }

    // Tapering 5K
    return [
      {
        id: '5k_s1_facil',
        dayTitle: 'Sesión 1 · Rodaje Regenerativo Corto',
        type: 'facil',
        name: 'Activación ligera de descarga',
        distanceKm: 3.5,
        targetPaceLabel: formatPaceDecimal(easyPace),
        estimatedDurationMin: Math.round(3.5 * easyPace),
        rpe: 3,
        focus: 'Eliminar fatiga residual y mantener circulación sanguínea activa.',
        structure: [
          `3.5 km muy suaves a ritmo conversacional (${formatPaceDecimal(easyPace)}).`,
          'Nada de esfuerzos; corre con la sensación de frescura total.'
        ]
      },
      {
        id: '5k_s2_series',
        dayTitle: 'Sesión 2 · Chispa Neuromuscular (Tapering)',
        type: 'series',
        name: 'Intervalos cortos de velocidad 4 × 200m',
        distanceKm: 4.0,
        targetPaceLabel: formatPaceDecimal(speedPace),
        estimatedDurationMin: 25,
        rpe: 6,
        focus: 'Mantener el tono muscular y la zancada viva sin agotar glucógeno.',
        structure: [
          '2.0 km de trote suave.',
          `4 rectas vivas de 200m a buen ritmo (${formatPaceDecimal(speedPace)}) con 90s de descanso completo caminando.`,
          '1.2 km de trote suave de enfriamiento.'
        ]
      },
      {
        id: '5k_s3_tempo',
        dayTitle: 'Sesión 3 · Activación Pre-Carrera (24-48h antes)',
        type: 'tempo',
        name: 'Despertar neuromuscular previo al evento',
        distanceKm: 3.0,
        targetPaceLabel: formatPaceDecimal(easyPace),
        estimatedDurationMin: Math.round(3.0 * easyPace + 2),
        rpe: 4,
        focus: 'Preparar el sistema nervioso central para el día de la carrera.',
        structure: [
          `2.5 km de trote regenerativo muy suave (${formatPaceDecimal(easyPace)}).`,
          '3 aceleraciones progresivas de 60 metros recuperando caminando.',
          'Movilidad y buen descanso nocturno.'
        ]
      },
      {
        id: '5k_s4_larga',
        dayTitle: 'Sesión 4 · ¡Día de la Carrera 5K!',
        type: 'larga',
        name: 'Prueba Oficial 5K Objetivo',
        distanceKm: 5.0,
        targetPaceLabel: formatPaceDecimal(tempoPace),
        estimatedDurationMin: Math.round(5.0 * tempoPace),
        rpe: 9,
        focus: 'Ejecutar tu estrategia y alcanzar tu marca personal.',
        structure: [
          '10 min de calentamiento dinámico y zancadas progresivas.',
          `5.0 km al ritmo objetivo programado (${formatPaceDecimal(tempoPace)}).`,
          '¡Cruza la meta y celebra tu logro!'
        ]
      }
    ];
  }

  // ==========================================
  // DISTANCIA: 10K
  // ==========================================
  if (distance === '10K') {
    if (phase === 'base') {
      return [
        {
          id: '10k_s1_facil',
          dayTitle: 'Sesión 1 · Rodaje Base Z2',
          type: 'facil',
          name: 'Rodaje aeróbico mitocondrial',
          distanceKm: 6.5,
          targetPaceLabel: formatPaceDecimal(easyPace),
          estimatedDurationMin: Math.round(6.5 * easyPace),
          rpe: 4,
          focus: 'Base mitocondrial y volumen sin estrés articular.',
          structure: [
            'Movilidad articular dinámica de cadera y tobillos.',
            `6.5 km continuos a ritmo cómodo conversacional (${formatPaceDecimal(easyPace)}).`,
            '4 aceleraciones progresivas de 80m en césped al terminar para mantener soltura neuromuscular.'
          ]
        },
        {
          id: '10k_s2_series',
          dayTitle: 'Sesión 2 · Fartlek de Adaptación Aeróbica',
          type: 'series',
          name: 'Fartlek 8 × 1 min / 1 min suave',
          distanceKm: 7.2,
          targetPaceLabel: formatPaceDecimal(intervalPace),
          estimatedDurationMin: 44,
          rpe: 7,
          focus: 'Activar el motor aeróbico sin generar acidosis excesiva.',
          structure: [
            '2.0 km de trote suave de calentamiento.',
            `8 bloques de 1 minuto a ritmo vivo (${formatPaceDecimal(intervalPace)}) por 1 minuto de trote muy suave.`,
            '2.0 km de vuelta a la calma relajada.'
          ]
        },
        {
          id: '10k_s3_tempo',
          dayTitle: 'Sesión 3 · Rodaje Medio en Progresión',
          type: 'tempo',
          name: 'Carrera continua con progresión final',
          distanceKm: 7.0,
          targetPaceLabel: formatPaceDecimal(easyPace),
          estimatedDurationMin: Math.round(7.0 * easyPace),
          rpe: 5,
          focus: 'Eficiencia de zancada en fatiga leve.',
          structure: [
            `5.0 km a ritmo base (${formatPaceDecimal(easyPace)}).`,
            `2.0 km finales progresivos aumentando 15-20 s/km el ritmo.`,
            'Estiramientos suaves.'
          ]
        },
        {
          id: '10k_s4_larga',
          dayTitle: 'Sesión 4 · Tirada Larga Aeróbica Continua',
          type: 'larga',
          name: 'Fondo de base en Zona 2 pura',
          distanceKm: 10.0,
          targetPaceLabel: formatPaceDecimal(easyPace),
          estimatedDurationMin: Math.round(10.0 * easyPace),
          rpe: 5,
          focus: 'Construcción de densidad capilar y utilización de ácidos grasos.',
          structure: [
            `10.0 km continuos a ritmo Zona 2 parejo y constante (${formatPaceDecimal(easyPace)}).`,
            'Mantén respiración controlada y cadencia fluida.',
            'Hidratación con electrolitos al culminar.'
          ]
        }
      ];
    }

    if (phase === 'potencia') {
      return [
        {
          id: '10k_s1_facil',
          dayTitle: 'Sesión 1 · Rodaje Base Z2',
          type: 'facil',
          name: 'Carrera suave regenerativa',
          distanceKm: 7.0,
          targetPaceLabel: formatPaceDecimal(easyPace),
          estimatedDurationMin: Math.round(7.0 * easyPace),
          rpe: 4,
          focus: 'Oxigenación muscular y preparación para los días de calidad.',
          structure: [
            `7.0 km continuos a ritmo muy cómodo (${formatPaceDecimal(easyPace)}).`,
            'Mantén cadencia alta y pisada silenciosa.'
          ]
        },
        {
          id: '10k_s2_series',
          dayTitle: 'Sesión 2 · Series de Umbral y VO2 Máx',
          type: 'series',
          name: 'Intervalos medios 5 × 1000m',
          distanceKm: 8.5,
          targetPaceLabel: formatPaceDecimal(intervalPace),
          estimatedDurationMin: 48,
          rpe: 8,
          focus: 'Construir velocidad crucero y elevar el umbral anaeróbico.',
          structure: [
            '2.0 km de trote suave de calentamiento.',
            `5 series de 1000m exactos al ritmo de series (${formatPaceDecimal(intervalPace)}).`,
            'Recuperación de 90 segundos al paso entre cada mil.',
            '1.5 km de trote suave de enfriamiento.'
          ]
        },
        {
          id: '10k_s3_tempo',
          dayTitle: 'Sesión 3 · Tempo Run Sostenido',
          type: 'tempo',
          name: 'Bloque a ritmo de competición de 10K',
          distanceKm: 8.0,
          targetPaceLabel: formatPaceDecimal(tempoPace),
          estimatedDurationMin: Math.round(8.0 * tempoPace + 4),
          rpe: 7,
          focus: 'Ritmo exacto de carrera y gestión de la zancada bajo fatiga.',
          structure: [
            '1.5 km de calentamiento suave.',
            `5.0 km continuos a tu ritmo objetivo de 10K (${formatPaceDecimal(tempoPace)}).`,
            '1.5 km de vuelta a la calma.'
          ]
        },
        {
          id: '10k_s4_larga',
          dayTitle: 'Sesión 4 · Tirada Larga Progresiva',
          type: 'larga',
          name: 'Fondo aeróbico de larga distancia',
          distanceKm: 12.0,
          targetPaceLabel: formatPaceDecimal(easyPace),
          estimatedDurationMin: Math.round(12.0 * easyPace),
          rpe: 6,
          focus: 'Economía de carrera, gestión de glucógeno y resistencia mental.',
          structure: [
            `Primeros 9.0 km a ritmo Zona 2 controlado (${formatPaceDecimal(easyPace)}).`,
            `Últimos 3.0 km apretando a ritmo objetivo de 10K (${formatPaceDecimal(tempoPace)}).`,
            'Hidratación con electrolitos al culminar.'
          ]
        }
      ];
    }

    if (phase === 'compromised') {
      return [
        {
          id: '10k_s1_facil',
          dayTitle: 'Sesión 1 · Rodaje Base Z2',
          type: 'facil',
          name: 'Rodaje suave regenerativo',
          distanceKm: 7.0,
          targetPaceLabel: formatPaceDecimal(easyPace),
          estimatedDurationMin: Math.round(7.0 * easyPace),
          rpe: 4,
          focus: 'Mantenimiento aeróbico y asimilación de la carga previa.',
          structure: [
            `7.0 km continuos a ritmo conversacional (${formatPaceDecimal(easyPace)}).`
          ]
        },
        {
          id: '10k_s2_series',
          dayTitle: 'Sesión 2 · Intervalos Largos 3 × 2000m',
          type: 'series',
          name: 'Series largas a ritmo de competición 3 × 2000m',
          distanceKm: 9.5,
          targetPaceLabel: formatPaceDecimal(tempoPace),
          estimatedDurationMin: 55,
          rpe: 8,
          focus: 'Mantener el paso de 10K durante 2 km consecutivos bajo fatiga.',
          structure: [
            '2.0 km de calentamiento.',
            `3 repeticiones de 2000m exactos al ritmo de 10K (${formatPaceDecimal(tempoPace)}).`,
            '2 minutos de descanso al paso entre repeticiones.',
            '1.5 km de trote muy suave.'
          ]
        },
        {
          id: '10k_s3_tempo',
          dayTitle: 'Sesión 3 · Simulacro Específico 10K',
          type: 'tempo',
          name: 'Bloque continuo de ritmo meta (6 km)',
          distanceKm: 8.5,
          targetPaceLabel: formatPaceDecimal(tempoPace),
          estimatedDurationMin: Math.round(8.5 * tempoPace + 4),
          rpe: 8,
          focus: 'El test definitivo antes de iniciar el tapering.',
          structure: [
            '1.5 km de activación con 3 aceleraciones cortas.',
            `6.0 km continuos al ritmo exacto de tu prueba (${formatPaceDecimal(tempoPace)}).`,
            '1.0 km de enfriamiento.'
          ]
        },
        {
          id: '10k_s4_larga',
          dayTitle: 'Sesión 4 · Gran Tirada Específica',
          type: 'larga',
          name: 'Fondo de larga distancia con final competitivo',
          distanceKm: 13.0,
          targetPaceLabel: formatPaceDecimal(easyPace),
          estimatedDurationMin: Math.round(13.0 * easyPace),
          rpe: 6,
          focus: 'Garantizar reserva de energía para los últimos 2 km del día de carrera.',
          structure: [
            `9.0 km en Zona 2 (${formatPaceDecimal(easyPace)}).`,
            `Últimos 4.0 km progresivos hasta clavar el ritmo objetivo (${formatPaceDecimal(tempoPace)}).`
          ]
        }
      ];
    }

    // Tapering 10K
    return [
      {
        id: '10k_s1_facil',
        dayTitle: 'Sesión 1 · Rodaje Regenerativo Corto',
        type: 'facil',
        name: 'Carrera suave de descarga',
        distanceKm: 4.5,
        targetPaceLabel: formatPaceDecimal(easyPace),
        estimatedDurationMin: Math.round(4.5 * easyPace),
        rpe: 3,
        focus: 'Supercompensación de glucógeno y piernas frescas.',
        structure: [
          `4.5 km a ritmo suave regenerativo (${formatPaceDecimal(easyPace)}).`,
          'Cero prisa, concéntrate en la relajación muscular.'
        ]
      },
      {
        id: '10k_s2_series',
        dayTitle: 'Sesión 2 · Toque de Chispa Neuromuscular',
        type: 'series',
        name: 'Intervalos cortos 5 × 300m',
        distanceKm: 5.0,
        targetPaceLabel: formatPaceDecimal(speedPace),
        estimatedDurationMin: 30,
        rpe: 6,
        focus: 'Mantener tono de zancada sin acumular fatiga.',
        structure: [
          '2.0 km de trote suave.',
          `5 series de 300m a ritmo alegre (${formatPaceDecimal(speedPace)}) con 90s de recuperación completa caminando.`,
          '1.5 km de enfriamiento.'
        ]
      },
      {
        id: '10k_s3_tempo',
        dayTitle: 'Sesión 3 · Activación Pre-Carrera',
        type: 'tempo',
        name: 'Trote suave y rectas de activación',
        distanceKm: 3.5,
        targetPaceLabel: formatPaceDecimal(easyPace),
        estimatedDurationMin: Math.round(3.5 * easyPace + 2),
        rpe: 4,
        focus: 'Despertar neuromuscular previo al evento (24 a 48h antes).',
        structure: [
          `3.0 km de trote muy cómodo (${formatPaceDecimal(easyPace)}).`,
          '4 rectas progresivas de 70m.',
          'Cena rica en carbohidratos complejos y descanso profundo.'
        ]
      },
      {
        id: '10k_s4_larga',
        dayTitle: 'Sesión 4 · ¡Día de la Carrera 10K!',
        type: 'larga',
        name: 'Competición 10K Oficial',
        distanceKm: 10.0,
        targetPaceLabel: formatPaceDecimal(tempoPace),
        estimatedDurationMin: Math.round(10.0 * tempoPace),
        rpe: 9,
        focus: 'Romper tu marca personal ejecutando el plan.',
        structure: [
          '10 min de calentamiento y movilidad articular.',
          `Primeros 5.0 km al ritmo objetivo controlado (${formatPaceDecimal(tempoPace)}).`,
          'Últimos 5.0 km sosteniendo el paso y rematando en los últimos 500m.',
          '¡Medalla y felicitaciones!'
        ]
      }
    ];
  }

  // ==========================================
  // DISTANCIA: 21K (Media Maratón)
  // ==========================================
  if (distance === '21K') {
    if (phase === 'base') {
      return [
        {
          id: '21k_s1_facil',
          dayTitle: 'Sesión 1 · Rodaje Base Z2',
          type: 'facil',
          name: 'Rodaje regenerativo aeróbico',
          distanceKm: 8.0,
          targetPaceLabel: formatPaceDecimal(easyPace),
          estimatedDurationMin: Math.round(8.0 * easyPace),
          rpe: 4,
          focus: 'Economía mitocondrial y descarga de impacto.',
          structure: [
            `8.0 km continuos a ritmo suave (${formatPaceDecimal(easyPace)}).`,
            'Mantén cadencia ligera (175-180 pasos por minuto).'
          ]
        },
        {
          id: '21k_s2_series',
          dayTitle: 'Sesión 2 · Fartlek Aeróbico / Cambios de Ritmo',
          type: 'series',
          name: 'Fartlek progresivo en llano',
          distanceKm: 9.0,
          targetPaceLabel: formatPaceDecimal(intervalPace),
          estimatedDurationMin: 52,
          rpe: 7,
          focus: 'Variabilidad de ritmos y potencia de zancada.',
          structure: [
            '2.0 km de trote suave.',
            `6 bloques de 2 minutos alegres (${formatPaceDecimal(intervalPace)}) por 2 minutos de trote suave.`,
            '2.0 km de enfriamiento.'
          ]
        },
        {
          id: '21k_s3_tempo',
          dayTitle: 'Sesión 3 · Rodaje Medio en Progresión',
          type: 'tempo',
          name: 'Rodaje de volumen medio continuo',
          distanceKm: 10.0,
          targetPaceLabel: formatPaceDecimal(easyPace),
          estimatedDurationMin: Math.round(10.0 * easyPace),
          rpe: 5,
          focus: 'Adaptación musculoesquelética para distancias mayores.',
          structure: [
            `8.0 km a ritmo cómodo Zona 2 (${formatPaceDecimal(easyPace)}).`,
            `2.0 km finales a ritmo alegre.`
          ]
        },
        {
          id: '21k_s4_larga',
          dayTitle: 'Sesión 4 · Tirada Larga de Resistencia Base',
          type: 'larga',
          name: 'Fondo continuo puramente aeróbico',
          distanceKm: 14.0,
          targetPaceLabel: formatPaceDecimal(easyPace),
          estimatedDurationMin: Math.round(14.0 * easyPace),
          rpe: 5,
          focus: 'Tolerancia al impacto articular durante más de 60 minutos.',
          structure: [
            `14.0 km en Zona 2 con ritmo constante (${formatPaceDecimal(easyPace)}).`,
            'Practica beber agua cada 20 minutos durante la carrera.'
          ]
        }
      ];
    }

    if (phase === 'potencia') {
      return [
        {
          id: '21k_s1_facil',
          dayTitle: 'Sesión 1 · Rodaje Base Z2',
          type: 'facil',
          name: 'Rodaje regenerativo aeróbico',
          distanceKm: 9.0,
          targetPaceLabel: formatPaceDecimal(easyPace),
          estimatedDurationMin: Math.round(9.0 * easyPace),
          rpe: 4,
          focus: 'Economía mitocondrial y asimilación de la carga de series.',
          structure: [
            `9.0 km continuos a ritmo suave (${formatPaceDecimal(easyPace)}).`
          ]
        },
        {
          id: '21k_s2_series',
          dayTitle: 'Sesión 2 · Intervalos Largos de Umbral',
          type: 'series',
          name: 'Series largas 4 × 2000m',
          distanceKm: 12.0,
          targetPaceLabel: formatPaceDecimal(intervalPace),
          estimatedDurationMin: 65,
          rpe: 8,
          focus: 'Mantener potencia aeróbica sostenida durante kilómetros.',
          structure: [
            '2.0 km de trote suave de calentamiento.',
            `4 repeticiones de 2000m a ritmo fuerte controlado (${formatPaceDecimal(intervalPace)}).`,
            'Recuperación de 2 minutos caminando/trotando entre cada 2K.',
            '2.0 km de trote suave de vuelta a la calma.'
          ]
        },
        {
          id: '21k_s3_tempo',
          dayTitle: 'Sesión 3 · Ritmo Media Maratón',
          type: 'tempo',
          name: 'Tempo continuo a ritmo de carrera (7 km)',
          distanceKm: 11.0,
          targetPaceLabel: formatPaceDecimal(tempoPace),
          estimatedDurationMin: Math.round(11.0 * tempoPace + 5),
          rpe: 7,
          focus: 'Memorización neuromuscular del paso de 21K.',
          structure: [
            '2.0 km de calentamiento suave.',
            `7.0 km sostenidos a ritmo exacto de 21K (${formatPaceDecimal(tempoPace)}).`,
            '2.0 km de enfriamiento.'
          ]
        },
        {
          id: '21k_s4_larga',
          dayTitle: 'Sesión 4 · Tirada Larga de Resistencia',
          type: 'larga',
          name: 'Fondo de media maratón progresivo',
          distanceKm: 17.0,
          targetPaceLabel: formatPaceDecimal(easyPace),
          estimatedDurationMin: Math.round(17.0 * easyPace),
          rpe: 6,
          focus: 'Simulacro de distancia, vaciado de glucógeno y tolerancia articular.',
          structure: [
            `13.0 km a ritmo cómodo Zona 2 (${formatPaceDecimal(easyPace)}).`,
            `Últimos 4.0 km progresivos a ritmo objetivo (${formatPaceDecimal(tempoPace)}).`,
            'Practica la ingesta de agua y geles durante el trayecto.'
          ]
        }
      ];
    }

    if (phase === 'compromised') {
      return [
        {
          id: '21k_s1_facil',
          dayTitle: 'Sesión 1 · Rodaje Base Z2',
          type: 'facil',
          name: 'Rodaje suave regenerativo',
          distanceKm: 9.0,
          targetPaceLabel: formatPaceDecimal(easyPace),
          estimatedDurationMin: Math.round(9.0 * easyPace),
          rpe: 4,
          focus: 'Oxigenación activa de piernas.',
          structure: [
            `9.0 km suaves en Zona 2 (${formatPaceDecimal(easyPace)}).`
          ]
        },
        {
          id: '21k_s2_series',
          dayTitle: 'Sesión 2 · Bloques de Ritmo Específico 2 × 4000m',
          type: 'series',
          name: 'Intervalos de resistencia al paso de 21K',
          distanceKm: 13.5,
          targetPaceLabel: formatPaceDecimal(tempoPace),
          estimatedDurationMin: 75,
          rpe: 8,
          focus: 'Sostener 4 km consecutivos al ritmo meta dos veces.',
          structure: [
            '2.5 km de calentamiento.',
            `2 series de 4000m al ritmo exacto de media maratón (${formatPaceDecimal(tempoPace)}).`,
            '3 minutos de recuperación suave entre bloques.',
            '2.0 km de vuelta a la calma.'
          ]
        },
        {
          id: '21k_s3_tempo',
          dayTitle: 'Sesión 3 · Gran Simulacro Continuo (9 km)',
          type: 'tempo',
          name: 'Tempo específico de media maratón',
          distanceKm: 13.0,
          targetPaceLabel: formatPaceDecimal(tempoPace),
          estimatedDurationMin: Math.round(13.0 * tempoPace + 5),
          rpe: 8,
          focus: 'Simular la segunda mitad de la carrera con fatiga controlada.',
          structure: [
            '2.0 km suaves de activación.',
            `9.0 km sostenidos a tu ritmo meta de 21K (${formatPaceDecimal(tempoPace)}).`,
            '2.0 km de trote regenerativo.'
          ]
        },
        {
          id: '21k_s4_larga',
          dayTitle: 'Sesión 4 · Gran Fondo Específico',
          type: 'larga',
          name: 'Tirada cumbre de media maratón',
          distanceKm: 18.5,
          targetPaceLabel: formatPaceDecimal(easyPace),
          estimatedDurationMin: Math.round(18.5 * easyPace),
          rpe: 7,
          focus: 'La tirada más exigente del macrociclo antes del tapering.',
          structure: [
            `12.5 km a ritmo aeróbico Zona 2 (${formatPaceDecimal(easyPace)}).`,
            `Últimos 6.0 km sostenidos al ritmo de carrera previsto (${formatPaceDecimal(tempoPace)}).`,
            'Toma gel energético en el km 10 y en el km 15.'
          ]
        }
      ];
    }

    // Tapering 21K
    return [
      {
        id: '21k_s1_facil',
        dayTitle: 'Sesión 1 · Rodaje Regenerativo de Descarga',
        type: 'facil',
        name: 'Carrera suave regenerativa',
        distanceKm: 5.0,
        targetPaceLabel: formatPaceDecimal(easyPace),
        estimatedDurationMin: Math.round(5.0 * easyPace),
        rpe: 3,
        focus: 'Reducción drástica del kilometraje para llenar depósitos de glucógeno.',
        structure: [
          `5.0 km continuos a ritmo suave (${formatPaceDecimal(easyPace)}).`
        ]
      },
      {
        id: '21k_s2_series',
        dayTitle: 'Sesión 2 · Toque de Ritmo 4 × 400m',
        type: 'series',
        name: 'Mantenimiento neuromuscular',
        distanceKm: 6.0,
        targetPaceLabel: formatPaceDecimal(tempoPace),
        estimatedDurationMin: 35,
        rpe: 6,
        focus: 'Sentir la ligereza del paso de media maratón con descansos amplios.',
        structure: [
          '2.0 km de trote suave.',
          `4 repeticiones de 400m al ritmo de 21K (${formatPaceDecimal(tempoPace)}) con 2 minutos de caminata entre ellas.`,
          '2.0 km de enfriamiento.'
        ]
      },
      {
        id: '21k_s3_tempo',
        dayTitle: 'Sesión 3 · Activación Pre-Carrera (24-48h antes)',
        type: 'tempo',
        name: 'Activación ligera de carrera',
        distanceKm: 4.0,
        targetPaceLabel: formatPaceDecimal(easyPace),
        estimatedDurationMin: Math.round(4.0 * easyPace + 2),
        rpe: 3,
        focus: 'Soltar piernas y comprobar equipamiento de carrera.',
        structure: [
          `3.5 km de trote muy suave (${formatPaceDecimal(easyPace)}).`,
          '3 rectas progresivas de 80m.',
          'Hidratación con electrolitos y descanso.'
        ]
      },
      {
        id: '21k_s4_larga',
        dayTitle: 'Sesión 4 · ¡Día de la Media Maratón 21K!',
        type: 'larga',
        name: 'Competición 21K Oficial',
        distanceKm: 21.1,
        targetPaceLabel: formatPaceDecimal(tempoPace),
        estimatedDurationMin: Math.round(21.1 * tempoPace),
        rpe: 9,
        focus: 'Ejecutar los 21.0975 km con ritmo constante y cabeza fría.',
        structure: [
          'Calentamiento articular suave en el cajón de salida.',
          `21.1 km a tu ritmo objetivo entrenado (${formatPaceDecimal(tempoPace)}).`,
          'Hidratación en cada avituallamiento y geles en km 7 y km 14.',
          '¡Cruza el arco de meta y reclama tu medalla!'
        ]
      }
    ];
  }

  // ==========================================
  // DISTANCIA: 42K (Maratón)
  // ==========================================
  if (phase === 'base') {
    return [
      {
        id: '42k_s1_facil',
        dayTitle: 'Sesión 1 · Rodaje Base Z2',
        type: 'facil',
        name: 'Carrera suave regenerativa',
        distanceKm: 9.0,
        targetPaceLabel: formatPaceDecimal(easyPace),
        estimatedDurationMin: Math.round(9.0 * easyPace),
        rpe: 4,
        focus: 'Volumen aeróbico y densidad capilar sin fatiga residual.',
        structure: [
          `9.0 km muy suaves a ritmo conversacional (${formatPaceDecimal(easyPace)}).`
        ]
      },
      {
        id: '42k_s2_series',
        dayTitle: 'Sesión 2 · Intervalos Aeróbicos 6 × 1000m',
        type: 'series',
        name: 'Intervalos de base aeróbica',
        distanceKm: 11.0,
        targetPaceLabel: formatPaceDecimal(intervalPace),
        estimatedDurationMin: 65,
        rpe: 7,
        focus: 'Potencia aeróbica controlada sin acumular lactato.',
        structure: [
          '2.5 km de trote suave.',
          `6 series de 1000m a ritmo controlado (${formatPaceDecimal(intervalPace)}) con 90s de trote suave.`,
          '2.0 km de enfriamiento.'
        ]
      },
      {
        id: '42k_s3_tempo',
        dayTitle: 'Sesión 3 · Rodaje Medio en Zona 2/3',
        type: 'tempo',
        name: 'Bloque continuo aeróbico',
        distanceKm: 12.0,
        targetPaceLabel: formatPaceDecimal(easyPace),
        estimatedDurationMin: Math.round(12.0 * easyPace),
        rpe: 5,
        focus: 'Economía de carrera para fondistas.',
        structure: [
          `12.0 km continuos a ritmo parejo y cómodo (${formatPaceDecimal(easyPace)}).`
        ]
      },
      {
        id: '42k_s4_larga',
        dayTitle: 'Sesión 4 · Gran Fondo de Fin de Semana',
        type: 'larga',
        name: 'Tirada larga de volumen en Zona 2',
        distanceKm: 20.0,
        targetPaceLabel: formatPaceDecimal(easyPace),
        estimatedDurationMin: Math.round(20.0 * easyPace),
        rpe: 6,
        focus: 'Adaptación mitocondrial profunda y prueba de nutrición.',
        structure: [
          `20.0 km continuos a ritmo Zona 2 estricto (${formatPaceDecimal(easyPace)}).`,
          'Lleva botellín y geles para entrenar el estómago a digerir en carrera.'
        ]
      }
    ];
  }

  if (phase === 'potencia') {
    return [
      {
        id: '42k_s1_facil',
        dayTitle: 'Sesión 1 · Rodaje Base Z2',
        type: 'facil',
        name: 'Carrera suave regenerativa',
        distanceKm: 10.0,
        targetPaceLabel: formatPaceDecimal(easyPace),
        estimatedDurationMin: Math.round(10.0 * easyPace),
        rpe: 4,
        focus: 'Volumen aeróbico y densidad capilar.',
        structure: [
          `10.0 km muy suaves a ritmo conversacional (${formatPaceDecimal(easyPace)}).`
        ]
      },
      {
        id: '42k_s2_series',
        dayTitle: 'Sesión 2 · Intervalos de Umbral 3 × 3000m',
        type: 'series',
        name: 'Intervalos de resistencia sostenida',
        distanceKm: 14.0,
        targetPaceLabel: formatPaceDecimal(intervalPace),
        estimatedDurationMin: 75,
        rpe: 8,
        focus: 'Eficiencia energética a velocidad crucero de maratón.',
        structure: [
          '2.5 km de calentamiento.',
          `3 series de 3000m a ritmo tempo (${formatPaceDecimal(intervalPace)}).`,
          '3 minutos de recuperación suave entre series.',
          '2.5 km de vuelta a la calma.'
        ]
      },
      {
        id: '42k_s3_tempo',
        dayTitle: 'Sesión 3 · Ritmo Maratón Sostenido',
        type: 'tempo',
        name: 'Bloque continuo a ritmo de maratón (10 km)',
        distanceKm: 14.0,
        targetPaceLabel: formatPaceDecimal(tempoPace),
        estimatedDurationMin: Math.round(14.0 * tempoPace + 6),
        rpe: 7,
        focus: 'Eficiencia de combustible graso y paso de carrera.',
        structure: [
          '2.0 km suaves.',
          `10.0 km al ritmo objetivo de maratón (${formatPaceDecimal(tempoPace)}).`,
          '2.0 km suaves.'
        ]
      },
      {
        id: '42k_s4_larga',
        dayTitle: 'Sesión 4 · Gran Fondo Progresivo',
        type: 'larga',
        name: 'Tirada ultra-larga preparatoria',
        distanceKm: 24.0,
        targetPaceLabel: formatPaceDecimal(easyPace),
        estimatedDurationMin: Math.round(24.0 * easyPace),
        rpe: 6,
        focus: 'Construcción de resiliencia musculoesquelética para los 42K.',
        structure: [
          `20.0 km a ritmo Zona 2 con hidratación constante (${formatPaceDecimal(easyPace)}).`,
          `4.0 km finales a ritmo de maratón (${formatPaceDecimal(tempoPace)}).`
        ]
      }
    ];
  }

  if (phase === 'compromised') {
    return [
      {
        id: '42k_s1_facil',
        dayTitle: 'Sesión 1 · Rodaje Base Z2',
        type: 'facil',
        name: 'Carrera suave regenerativa',
        distanceKm: 10.0,
        targetPaceLabel: formatPaceDecimal(easyPace),
        estimatedDurationMin: Math.round(10.0 * easyPace),
        rpe: 4,
        focus: 'Recuperación de impacto.',
        structure: [
          `10.0 km suaves (${formatPaceDecimal(easyPace)}).`
        ]
      },
      {
        id: '42k_s2_series',
        dayTitle: 'Sesión 2 · Bloques de Ritmo Maratón 2 × 5000m',
        type: 'series',
        name: 'Intervalos ultra-largos de maratón',
        distanceKm: 16.0,
        targetPaceLabel: formatPaceDecimal(tempoPace),
        estimatedDurationMin: 90,
        rpe: 8,
        focus: 'Consolidar el ritmo de maratón sobre fatiga muscular.',
        structure: [
          '3.0 km de calentamiento.',
          `2 series de 5000m al ritmo exacto de 42K (${formatPaceDecimal(tempoPace)}).`,
          '4 minutos de recuperación lenta caminando/trotando.',
          '3.0 km de vuelta a la calma.'
        ]
      },
      {
        id: '42k_s3_tempo',
        dayTitle: 'Sesión 3 · Gran Simulacro Continuo (12 km)',
        type: 'tempo',
        name: 'Tempo sostenido a ritmo de maratón',
        distanceKm: 16.0,
        targetPaceLabel: formatPaceDecimal(tempoPace),
        estimatedDurationMin: Math.round(16.0 * tempoPace + 6),
        rpe: 8,
        focus: 'Simulacro de sensaciones del km 25 al 37 de maratón.',
        structure: [
          '2.0 km suaves.',
          `12.0 km al ritmo objetivo estricto (${formatPaceDecimal(tempoPace)}).`,
          '2.0 km suaves.'
        ]
      },
      {
        id: '42k_s4_larga',
        dayTitle: 'Sesión 4 · Tirada Cumbre de Maratón',
        type: 'larga',
        name: 'Fondo máximo de preparación (28 km)',
        distanceKm: 28.0,
        targetPaceLabel: formatPaceDecimal(easyPace),
        estimatedDurationMin: Math.round(28.0 * easyPace),
        rpe: 7,
        focus: 'La tirada más larga de todo el plan para derribar el muro de los 42K.',
        structure: [
          `20.0 km a ritmo cómodo Zona 2 (${formatPaceDecimal(easyPace)}).`,
          `Últimos 8.0 km sosteniendo el ritmo exacto de maratón (${formatPaceDecimal(tempoPace)}).`,
          'Consumir gel cada 45 minutos religiosamente.'
        ]
      }
    ];
  }

  // Tapering 42K
  return [
    {
      id: '42k_s1_facil',
      dayTitle: 'Sesión 1 · Rodaje de Descarga Profunda',
      type: 'facil',
      name: 'Carrera regenerativa de oxigenación',
      distanceKm: 6.0,
      targetPaceLabel: formatPaceDecimal(easyPace),
      estimatedDurationMin: Math.round(6.0 * easyPace),
      rpe: 3,
      focus: 'Eliminar fatiga acumulada del pico de volumen.',
      structure: [
        `6.0 km muy suaves (${formatPaceDecimal(easyPace)}).`
      ]
    },
    {
      id: '42k_s2_series',
      dayTitle: 'Sesión 2 · Toque de Chispa 5 × 400m',
      type: 'series',
      name: 'Mantenimiento neuromuscular de maratón',
      distanceKm: 7.0,
      targetPaceLabel: formatPaceDecimal(tempoPace),
      estimatedDurationMin: 42,
      rpe: 5,
      focus: 'Recordarle a las piernas el ritmo sin quemar energía.',
      structure: [
        '2.5 km de trote suave.',
        `5 repeticiones de 400m a ritmo maratón (${formatPaceDecimal(tempoPace)}) con 2 min de descanso caminando.`,
        '2.5 km de enfriamiento.'
      ]
    },
    {
      id: '42k_s3_tempo',
      dayTitle: 'Sesión 3 · Activación Pre-Maratón',
      type: 'tempo',
      name: 'Trote suave y soltura final',
      distanceKm: 4.0,
      targetPaceLabel: formatPaceDecimal(easyPace),
      estimatedDurationMin: Math.round(4.0 * easyPace + 2),
      rpe: 3,
      focus: 'Carga completa de carbohidratos, buena hidratación y mente en calma.',
      structure: [
        `3.5 km muy suaves (${formatPaceDecimal(easyPace)}).`,
        '3 aceleraciones de 80m muy fluidas.'
      ]
    },
    {
      id: '42k_s4_larga',
      dayTitle: 'Sesión 4 · ¡Día del Maratón 42K!',
      type: 'larga',
      name: 'Maratón Oficial 42.195 km',
      distanceKm: 42.2,
      targetPaceLabel: formatPaceDecimal(tempoPace),
      estimatedDurationMin: Math.round(42.2 * tempoPace),
      rpe: 9,
      focus: 'La prueba reina: 42.195 km de constancia, hidratación y gloria.',
      structure: [
        `42.195 km a tu ritmo objetivo calculado (${formatPaceDecimal(tempoPace)}).`,
        'Mantén la calma los primeros 30 km y entrega el alma en los últimos 12 km.',
        '¡Eres un maratoniano!'
      ]
    }
  ];
};

// Genera el asesoramiento del entrenador y distribución de días para la fase actual
export const getRunningCoachGuidance = (
  phase: PeriodizationPhase,
  distance: RaceDistance,
  currentWeek: number,
  totalWeeks: number,
  targetPaceDecimal: number = 5.0
): RunningCoachGuidance => {
  const sessions = generateRunningPlan(distance, targetPaceDecimal, phase, currentWeek, totalWeeks);
  const weeklyVolumeKm = Math.round(sessions.reduce((acc, s) => acc + s.distanceKm, 0) * 10) / 10;
  const totalTimeEstimatedMin = sessions.reduce((acc, s) => acc + s.estimatedDurationMin, 0);

  const suggestedSchedule = [
    { day: 'Martes', sessionNumber: 1, title: sessions[0].name, type: sessions[0].type },
    { day: 'Jueves', sessionNumber: 2, title: sessions[1].name, type: sessions[1].type },
    { day: 'Sábado', sessionNumber: 3, title: sessions[2].name, type: sessions[2].type },
    { day: 'Domingo', sessionNumber: 4, title: sessions[3].name, type: sessions[3].type }
  ];

  if (phase === 'base') {
    return {
      phaseName: 'Fase 1: Base Aeróbica y Capacidad Mitocondrial',
      phaseBadge: 'Fase 1 · Base Aeróbica',
      headline: `Semana ${currentWeek} de ${totalWeeks} · Construcción de Motor Aeróbico`,
      explanation: `Durante esta fase el 80% de tus kilómetros se corren a ritmo conversacional suave en Zona 2. El objetivo es multiplicar tus mitocondrias y capilarizar las piernas sin desgastar tus tendones para soportar la intensidad venidera.`,
      weeklyVolumeKm,
      totalTimeEstimatedMin,
      coachTips: [
        'No caigas en la trampa de correr rápido en los rodajes fáciles: el beneficio aeróbico se produce cuando puedes hablar sin ahogarte.',
        'Las series de esta fase son ligeras o en formato fartlek para no acumular ácido láctico prematuro.',
        'La tirada larga del fin de semana es 100% aeróbica continua: concéntrate en la constancia.'
      ],
      suggestedSchedule
    };
  }

  if (phase === 'potencia') {
    return {
      phaseName: 'Fase 2: Umbral de Lactato y Potencia Aeróbica',
      phaseBadge: 'Fase 2 · Umbral y Potencia',
      headline: `Semana ${currentWeek} de ${totalWeeks} · Desplazar el Umbral hacia la Derecha`,
      explanation: `En esta fase introducimos repeticiones exigentes de VO2 máx y bloques Tempo. El objetivo es elevar tu capacidad para reciclar el lactato y acostumbrarte a ritmos vivos sin fatigarte rápidamente.`,
      weeklyVolumeKm,
      totalTimeEstimatedMin,
      coachTips: [
        'En las series de repeticiones (Sesión 2), respeta los tiempos de descanso para que cada intervalo tenga la misma velocidad que el primero.',
        'En el Tempo (Sesión 3), corre a un ritmo donde notes esfuerzo constante (RPE 7-8) pero que puedas sostener sin derrumbarte.',
        'La tirada larga del domingo incluye un tramo progresivo para entrenar el cambio de ritmo en fatiga.'
      ],
      suggestedSchedule
    };
  }

  if (phase === 'compromised') {
    return {
      phaseName: 'Fase 3: Ritmo Específico de Competición',
      phaseBadge: 'Fase 3 · Ritmo Objetivo',
      headline: `Semana ${currentWeek} de ${totalWeeks} · Simulacro y Memorización Neuromuscular`,
      explanation: `Es la fase de máxima especificidad competitiva. Tu cuerpo y tu mente deben grabar exactamente la sensación de correr al paso objetivo (${formatPaceDecimal(targetPaceDecimal)}) de cara al día de la prueba.`,
      weeklyVolumeKm,
      totalTimeEstimatedMin,
      coachTips: [
        `Tus intervalos y tempos se corren al paso exacto de competencia (${formatPaceDecimal(targetPaceDecimal)}). Ni más rápido ni más lento.`,
        'Entrena con las mismas zapatillas, ropa e hidratación/geles que planeas usar el día de la carrera.',
        'Presta especial atención a la recuperación nocturna y nutrición post-entreno.'
      ],
      suggestedSchedule
    };
  }

  // Tapering
  return {
    phaseName: 'Fase 4: Afilamiento y Tapering Pre-Carrera',
    phaseBadge: 'Fase 4 · Tapering y Descarga',
    headline: `Semana ${currentWeek} de ${totalWeeks} · Piernas Frescas y Supercompensación`,
    explanation: `El kilometraje total se reduce entre un 40% y 50%, pero mantenemos pequeños estímulos de velocidad para conservar el tono y la chispa neuromuscular. Es el momento de almacenar glucógeno y llegar al 100% a la línea de salida.`,
    weeklyVolumeKm,
    totalTimeEstimatedMin,
    coachTips: [
      'Menos es más: no intentes ganar forma física en la última semana, solo puedes perderla si te sobreentrenas.',
      'Las pequeñas series de velocidad son solo para soltar piernas con descansos completos.',
      'Prioriza el descanso de calidad (8h de sueño), hidrátate bien y visualiza tu estrategia de carrera.'
    ],
    suggestedSchedule
  };
};

// Convierte una sesión planificada o personalizada en una secuencia de bloques interactivos paso a paso
export const buildWorkoutBlocksFromSession = (session: PlannedRunningSession): RunningWorkoutBlock[] => {
  if (session.customBlocks && session.customBlocks.length > 0) {
    return session.customBlocks;
  }

  const blocks: RunningWorkoutBlock[] = [];
  let blockIdx = 1;

  // Buscar tiempos de recuperación sueltos en las líneas (ej. "75 segundos de recuperación...", "90 segundos de recuperación...", "2 minutos de recuperación...")
  let standaloneRecoverySec = 0;
  for (const line of session.structure) {
    const lower = line.toLowerCase();
    if (lower.includes('recuperación') || lower.includes('descanso')) {
      const secMatch = line.match(/(\d+)\s*(?:segundos|s\b)/i);
      const minMatch = line.match(/(\d+)\s*(?:minutos|min\b)/i);
      if (secMatch && !lower.includes('repeticiones') && !lower.includes('series') && !lower.includes('bloques')) {
        standaloneRecoverySec = parseInt(secMatch[1], 10);
      } else if (minMatch && !lower.includes('repeticiones') && !lower.includes('series') && !lower.includes('bloques')) {
        standaloneRecoverySec = parseInt(minMatch[1], 10) * 60;
      }
    }
  }

  for (let i = 0; i < session.structure.length; i++) {
    const line = session.structure[i];
    const lower = line.toLowerCase();

    // Ignorar líneas que ya fueron absorbidas como descanso suelto entre series
    if (
      (lower.includes('recuperación') || lower.includes('descanso')) &&
      !lower.includes('repeticiones') &&
      !lower.includes('series') &&
      !lower.includes('bloques') &&
      !lower.includes('rectas')
    ) {
      continue;
    }

    // Extraer ritmo sugerido si aparece entre paréntesis: (4:06 min/km)
    const paceMatch = line.match(/(\d+:\d+\s*min\/km)/i);
    const extractedPace = paceMatch ? paceMatch[1] : session.targetPaceLabel;

    // 1. Caso Fartlek / Intervalos por tiempo en una misma línea:
    // Ej: "8 bloques de 1 minuto a ritmo vivo (4:06 min/km) por 1 minuto de trote muy suave."
    // Ej: "6 repeticiones de 1 minuto a ritmo alegre (4:36 min/km) por 1 minuto de trote muy suave."
    const timeIntervalMatch = line.match(/(\d+)\s*(?:repeticiones|bloques|series)\s*de\s*(\d+)\s*(?:minuto|minutos|min)\b.*?(?:por|con)\s*(\d+)\s*(minuto|minutos|min|segundos|s)\b/i);
    if (timeIntervalMatch) {
      const reps = parseInt(timeIntervalMatch[1], 10);
      const workSec = parseInt(timeIntervalMatch[2], 10) * 60;
      const restVal = parseInt(timeIntervalMatch[3], 10);
      const restUnit = timeIntervalMatch[4].toLowerCase();
      const restSec = restUnit.startsWith('min') ? restVal * 60 : restVal;

      for (let r = 1; r <= reps; r++) {
        blocks.push({
          id: `b_${blockIdx++}`,
          phaseType: 'work',
          title: `Serie ${r} de ${reps} · ${timeIntervalMatch[2]} min rápido`,
          targetType: 'time',
          targetValue: workSec,
          targetPace: extractedPace,
          instructions: `Mantén ritmo vivo (${extractedPace}) durante este bloque.`
        });
        blocks.push({
          id: `b_${blockIdx++}`,
          phaseType: 'recovery',
          title: `Recuperación ${r} de ${reps} · ${restSec}s suave`,
          targetType: 'time',
          targetValue: restSec,
          instructions: 'Trote muy suave o caminata activa para bajar pulsaciones.'
        });
      }
      continue;
    }

    // 2. Caso Series por distancia en metros (ej. "6 repeticiones de 400m", "4 repeticiones de 1000m", "4 rectas vivas de 200m... con 90s de descanso")
    const distMetersMatch = line.match(/(\d+)\s*(?:repeticiones|series|bloques|rectas(?:\s+vivas)?|aceleraciones(?:\s+progresivas)?)\s*de\s*(\d+)\s*(?:m|metros)\b/i);
    if (distMetersMatch) {
      const reps = parseInt(distMetersMatch[1], 10);
      const meters = parseInt(distMetersMatch[2], 10);
      const distKm = Math.round((meters / 1000) * 1000) / 1000;

      // Buscar si la misma línea especifica descanso (ej. "con 90s de descanso")
      let inlineRestSec = standaloneRecoverySec || (meters <= 200 ? 60 : meters <= 500 ? 75 : 90);
      const inlineSecMatch = line.match(/con\s*(\d+)\s*(?:s|segundos)\s*de\s*(?:descanso|recuperación)/i);
      const inlineMinMatch = line.match(/con\s*(\d+)\s*(?:min|minutos)\s*de\s*(?:descanso|recuperación)/i);
      if (inlineSecMatch) inlineRestSec = parseInt(inlineSecMatch[1], 10);
      if (inlineMinMatch) inlineRestSec = parseInt(inlineMinMatch[1], 10) * 60;

      for (let r = 1; r <= reps; r++) {
        blocks.push({
          id: `b_${blockIdx++}`,
          phaseType: 'work',
          title: `Serie ${r} de ${reps} · ${meters}m`,
          targetType: 'distance',
          targetValue: distKm,
          targetPace: extractedPace,
          instructions: `Completa ${meters} metros a ritmo objetivo (${extractedPace}).`
        });
        blocks.push({
          id: `b_${blockIdx++}`,
          phaseType: 'recovery',
          title: `Descanso ${r} de ${reps} · ${inlineRestSec}s`,
          targetType: 'time',
          targetValue: inlineRestSec,
          instructions: 'Recupera caminando o trotando muy suave antes de la siguiente serie.'
        });
      }
      continue;
    }

    // 3. Caso Series por kilómetros (ej. "3 bloques de 2.0 km a ritmo...")
    const distKmSeriesMatch = line.match(/(\d+)\s*(?:repeticiones|series|bloques)\s*de\s*(\d+(?:\.\d+)?)\s*km\b/i);
    if (distKmSeriesMatch) {
      const reps = parseInt(distKmSeriesMatch[1], 10);
      const kmVal = parseFloat(distKmSeriesMatch[2]);
      const restSec = standaloneRecoverySec || 120;

      for (let r = 1; r <= reps; r++) {
        blocks.push({
          id: `b_${blockIdx++}`,
          phaseType: 'work',
          title: `Serie ${r} de ${reps} · ${kmVal} km`,
          targetType: 'distance',
          targetValue: kmVal,
          targetPace: extractedPace,
          instructions: `Completa ${kmVal} km a ritmo controlado (${extractedPace}).`
        });
        if (r < reps) {
          blocks.push({
            id: `b_${blockIdx++}`,
            phaseType: 'recovery',
            title: `Descanso ${r} de ${reps - 1} · ${restSec}s`,
            targetType: 'time',
            targetValue: restSec,
            instructions: 'Trote regenerativo entre bloques.'
          });
        }
      }
      continue;
    }

    // 4. Caso bloque único de distancia en km (ej. "2.0 km de trote suave de calentamiento", "5.0 km continuos...", "1.5 km de vuelta a la calma")
    const singleKmMatch = line.match(/(\d+(?:\.\d+)?)\s*km\b/i);
    if (singleKmMatch) {
      const kmVal = parseFloat(singleKmMatch[1]);
      const isWarmup = lower.includes('calentamiento') || lower.includes('activación') || (i === 0 && session.structure.length >= 3 && lower.includes('suave'));
      const isCooldown = lower.includes('calma') || lower.includes('enfriamiento') || lower.includes('regenerativo final') || (i === session.structure.length - 1 && session.structure.length >= 3 && lower.includes('suave'));

      blocks.push({
        id: `b_${blockIdx++}`,
        phaseType: isWarmup ? 'warmup' : isCooldown ? 'cooldown' : 'work',
        title: isWarmup
          ? `Calentamiento · ${kmVal} km`
          : isCooldown
            ? `Vuelta a la calma · ${kmVal} km`
            : `Bloque Principal · ${kmVal} km`,
        targetType: 'distance',
        targetValue: kmVal,
        targetPace: extractedPace,
        instructions: line
      });
      continue;
    }

    // 5. Caso calentamiento o movilidad por minutos al inicio (ej. "5 min de movilidad...", "10 min de calentamiento...")
    const singleMinMatch = line.match(/^(\d+)\s*(?:min|minutos)\b/i);
    if (singleMinMatch) {
      const mins = parseInt(singleMinMatch[1], 10);
      blocks.push({
        id: `b_${blockIdx++}`,
        phaseType: 'warmup',
        title: `Activación / Movilidad · ${mins} min`,
        targetType: 'time',
        targetValue: mins * 60,
        instructions: line
      });
    }
  }

  // Fallback de seguridad si ninguna línea produjo bloques
  if (blocks.length === 0) {
    blocks.push({
      id: 'b_1',
      phaseType: 'work',
      title: `${session.name} · ${session.distanceKm} km`,
      targetType: 'distance',
      targetValue: session.distanceKm,
      targetPace: session.targetPaceLabel,
      instructions: session.focus
    });
  }

  return blocks;
};

// Persistencia de Entrenamientos de Running Personalizados del usuario
const getCustomRunningKey = (nickname: string) => `fitmax_custom_running_sessions_${nickname || 'guest'}`;

export const getCustomRunningSessions = (nickname: string): PlannedRunningSession[] => {
  try {
    const raw = localStorage.getItem(getCustomRunningKey(nickname));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveCustomRunningSession = (nickname: string, session: PlannedRunningSession): PlannedRunningSession[] => {
  const current = getCustomRunningSessions(nickname);
  const existsIdx = current.findIndex((s) => s.id === session.id);
  const updated = existsIdx >= 0
    ? current.map((s, idx) => (idx === existsIdx ? session : s))
    : [session, ...current];
  localStorage.setItem(getCustomRunningKey(nickname), JSON.stringify(updated));
  return updated;
};

export const deleteCustomRunningSession = (nickname: string, id: string): PlannedRunningSession[] => {
  const current = getCustomRunningSessions(nickname).filter((s) => s.id !== id);
  localStorage.setItem(getCustomRunningKey(nickname), JSON.stringify(current));
  return current;
};

