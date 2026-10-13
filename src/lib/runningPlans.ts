// Motor de generación de planes de entrenamiento de running según distancia y ritmo objetivo.
// Basado en el principio 80/20 (Jack Daniels / Stephen Seiler) y periodización de carrera.

import { RunType } from './running';

export type RaceDistance = '5K' | '10K' | '21K' | '42K';

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

// Genera las 4 sesiones semanales clave adaptadas a la distancia y ritmo objetivo
export const generateRunningPlan = (
  distance: RaceDistance,
  targetPaceDecimal: number = 5.0
): PlannedRunningSession[] => {
  // Ritmos calibrados:
  // - Fácil / Z2: Ritmo objetivo + 60 a 75 segundos/km
  const easyPace = targetPaceDecimal + 1.1; 
  // - Series (VO2 Máx): Ritmo objetivo - 20 a 30 segundos/km
  const intervalPace = Math.max(3.0, targetPaceDecimal - 0.4); 
  // - Tempo (Umbral): Ritmo objetivo exacto o +10s
  const tempoPace = targetPaceDecimal; 

  if (distance === '5K') {
    return [
      {
        id: '5k_s1_facil',
        dayTitle: 'Sesión 1 · Rodaje Base Zona 2',
        type: 'facil',
        name: 'Carrera regenerativa aeróbica continua',
        distanceKm: 5.0,
        targetPaceLabel: formatPaceDecimal(easyPace),
        estimatedDurationMin: Math.round(5.0 * easyPace),
        rpe: 4,
        focus: 'Desarrollo mitocondrial en Zona 2 sin fatiga residual.',
        structure: [
          'Calentamiento articular dinámico (tobillos, cadera y zancadas cortas).',
          `5.0 km continuos a ritmo conversacional suave (${formatPaceDecimal(easyPace)}).`,
          'Si no puedes respirar cómodamente por la nariz o hablar frases completas, reduce el ritmo.'
        ]
      },
      {
        id: '5k_s2_series',
        dayTitle: 'Sesión 2 · Series de Velocidad (VO2 Máx)',
        type: 'series',
        name: 'Intervalos cortos explosivos 6 × 400m',
        distanceKm: 5.4,
        targetPaceLabel: formatPaceDecimal(intervalPace),
        estimatedDurationMin: 32,
        rpe: 8,
        focus: 'Elevar el consumo máximo de oxígeno y cadencia de zancada.',
        structure: [
          '1.5 km de trote suave de calentamiento progresivo.',
          `6 repeticiones de 400m a ritmo rápido (${formatPaceDecimal(intervalPace)}).`,
          'Recuperación de 75 segundos caminando o trote muy suave entre cada serie.',
          '1.5 km de vuelta a la calma muy suave.'
        ]
      },
      {
        id: '5k_s3_tempo',
        dayTitle: 'Sesión 3 · Tempo Run (Umbral de Lactato)',
        type: 'tempo',
        name: 'Bloque continuo a ritmo objetivo de carrera',
        distanceKm: 5.0,
        targetPaceLabel: formatPaceDecimal(tempoPace),
        estimatedDurationMin: Math.round(5.0 * tempoPace + 4),
        rpe: 7,
        focus: 'Tolerancia y reciclaje de lactato al ritmo meta.',
        structure: [
          '1.0 km de trote suave de activación.',
          `3.0 km sostenidos a ritmo de carrera objetivo (${formatPaceDecimal(tempoPace)}).`,
          '1.0 km de trote regenerativo final.'
        ]
      },
      {
        id: '5k_s4_larga',
        dayTitle: 'Sesión 4 · Tirada Larga Progresiva',
        type: 'larga',
        name: 'Fondo aeróbico de tolerancia',
        distanceKm: 7.5,
        targetPaceLabel: formatPaceDecimal(easyPace),
        estimatedDurationMin: Math.round(7.5 * easyPace),
        rpe: 5,
        focus: 'Capacidad de resistencia muscular y eficiencia de carrera.',
        structure: [
          `Primeros 5.5 km a ritmo muy cómodo (${formatPaceDecimal(easyPace)}).`,
          `Últimos 2.0 km en progresión acelerando hasta tu ritmo objetivo (${formatPaceDecimal(tempoPace)}).`,
          'Estiramientos estáticos suaves al finalizar.'
        ]
      }
    ];
  }

  if (distance === '10K') {
    return [
      {
        id: '10k_s1_facil',
        dayTitle: 'Sesión 1 · Rodaje Base Zona 2',
        type: 'facil',
        name: 'Carrera suave regenerativa',
        distanceKm: 7.0,
        targetPaceLabel: formatPaceDecimal(easyPace),
        estimatedDurationMin: Math.round(7.0 * easyPace),
        rpe: 4,
        focus: 'Base aeróbica mitocondrial y volumen sin estrés articular.',
        structure: [
          'Calentamiento de movilidad de cadera y tobillos.',
          `7.0 km continuos a ritmo cómodo y conversacional (${formatPaceDecimal(easyPace)}).`,
          '4 aceleraciones progresivas de 80m en césped al terminar para mantener soltura neuromuscular.'
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
        focus: 'Construir velocidad crucero y tolerancia al ácido láctico.',
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
        focus: 'Ritmo exacto de carrera y gestión de la zancada en fatiga.',
        structure: [
          '1.5 km de calentamiento suave.',
          `5.0 km continuos a ritmo objetivo de carrera (${formatPaceDecimal(tempoPace)}).`,
          '1.5 km de vuelta a la calma.'
        ]
      },
      {
        id: '10k_s4_larga',
        dayTitle: 'Sesión 4 · Tirada Larga de Fin de Semana',
        type: 'larga',
        name: 'Fondo aeróbico de larga distancia',
        distanceKm: 12.0,
        targetPaceLabel: formatPaceDecimal(easyPace),
        estimatedDurationMin: Math.round(12.0 * easyPace),
        rpe: 5,
        focus: 'Economía de carrera, gestión de glucógeno y resistencia mental.',
        structure: [
          `Primeros 9.0 km a ritmo Zona 2 controlado (${formatPaceDecimal(easyPace)}).`,
          `Últimos 3.0 km apretando a ritmo objetivo de 10K (${formatPaceDecimal(tempoPace)}).`,
          'Hidratación con electrolitos al culminar.'
        ]
      }
    ];
  }

  // 21K Media Maratón
  if (distance === '21K') {
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
        focus: 'Economía mitocondrial y descarga de impacto.',
        structure: [
          `9.0 km continuos a ritmo suave (${formatPaceDecimal(easyPace)}).`,
          'Mantén cadencia ligera (alrededor de 170-180 pasos por minuto).'
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
        name: 'Tempo continuo a ritmo de carrera',
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
        name: 'Fondo de media maratón',
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

  // 42K Maratón
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
      dayTitle: 'Sesión 2 · Intervalos de Umbral',
      type: 'series',
      name: 'Intervalos de resistencia 3 × 3000m',
      distanceKm: 14.0,
      targetPaceLabel: formatPaceDecimal(intervalPace),
      estimatedDurationMin: 75,
      rpe: 8,
      focus: 'Eficiencia energética a velocidad crucero.',
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
      name: 'Bloque continuo a ritmo de maratón',
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
      dayTitle: 'Sesión 4 · Gran Fondo de Fin de Semana',
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
};
