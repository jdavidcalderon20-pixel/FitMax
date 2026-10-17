// Catálogo de Rutinas y Circuitos de Entrenamiento Funcional
// Diseñados para fuerza metabólica, potencia, estabilidad y acondicionamiento integral

export interface FunctionalStation {
  name: string;
  repsOrDuration: string;
  focus: string;
}

export interface FunctionalRoutine {
  id: string;
  name: string;
  category: 'cargas' | 'calistenia' | 'saltos_cuerda' | 'core_estabilidad';
  categoryLabel: string;
  shortDesc: string;
  targetFocus: string;
  totalDurationMin: number;
  rounds: number;
  workSec: number;
  restSec: number;
  equipment: string;
  evidence: 'A' | 'B';
  stations: FunctionalStation[];
  coachTips: string[];
}

export const FUNCTIONAL_ROUTINES: FunctionalRoutine[] = [
  {
    id: 'functional_fullbody_cargas',
    name: 'Full Body Funcional con Cargas (Kettlebells & Mancuernas)',
    category: 'cargas',
    categoryLabel: 'Fuerza con Cargas',
    shortDesc: 'Circuito de alta densidad combinando movimientos compuestos de empuje, tracción y bisagra.',
    targetFocus: 'Fuerza metabólica, hipertrofia funcional y gasto calórico elevado.',
    totalDurationMin: 20,
    rounds: 4,
    workSec: 40,
    restSec: 20,
    equipment: 'Kettlebells o Mancuernas',
    evidence: 'A',
    stations: [
      {
        name: 'Thruster con kettlebells o mancuernas',
        repsOrDuration: '40 s de trabajo',
        focus: 'Sentadilla profunda + press vertical continuo transferido desde piernas.'
      },
      {
        name: 'Cargada con kettlebell o mancuerna (Clean)',
        repsOrDuration: '40 s de trabajo',
        focus: 'Potencia balística de cadera llevando la carga al pecho con control.'
      },
      {
        name: 'Zancadas caminando (Walking Lunges)',
        repsOrDuration: '40 s de trabajo',
        focus: 'Estabilidad unilateral y fuerza de cuádriceps y glúteos con paso amplio.'
      },
      {
        name: 'Flexiones explosivas',
        repsOrDuration: '40 s de trabajo',
        focus: 'Empuje horizontal despegando las palmas con potencia del pectoral y tríceps.'
      },
      {
        name: 'Escaladores (Mountain climbers)',
        repsOrDuration: '40 s de trabajo',
        focus: 'Resistencia del core y flexores de cadera a ritmo continuo.'
      }
    ],
    coachTips: [
      'Prioriza la técnica y la columna neutra antes que la velocidad descontrolada.',
      'Respira en sincronía con cada repetición y aprovecha los 20 segundos de pausa para oxigenar.',
      'Si tienes dos pesos, usa el más pesado en cargadas y zancadas, y el más ligero en thrusters.'
    ]
  },
  {
    id: 'functional_calistenia_metabolico',
    name: 'Metabólico & Potencia con Peso Corporal (Calistenia)',
    category: 'calistenia',
    categoryLabel: 'Peso Corporal & Agilidad',
    shortDesc: 'Entrenamiento pliométrico y cardiovascular sin necesidad de ningún material ni gimnasio.',
    targetFocus: 'Potencia reactiva, quema calórica extrema y agilidad atlética.',
    totalDurationMin: 17,
    rounds: 4,
    workSec: 35,
    restSec: 15,
    equipment: 'Peso corporal',
    evidence: 'A',
    stations: [
      {
        name: 'Sentadillas con salto',
        repsOrDuration: '35 s de trabajo',
        focus: 'Extensión triple explosiva (tobillos, rodillas y caderas) amortiguando suavemente.'
      },
      {
        name: 'Saltos de tijera (Jumping jacks)',
        repsOrDuration: '35 s de trabajo',
        focus: 'Ritmo ágil y continuo elevando pulsaciones y temperatura central.'
      },
      {
        name: 'Flexiones explosivas',
        repsOrDuration: '35 s de trabajo',
        focus: 'Fuerza de empuje despegando las palmas del suelo en la cúspide.'
      },
      {
        name: 'Rodillas arriba',
        repsOrDuration: '35 s de trabajo',
        focus: 'Cadencia de carrera viva elevando las rodillas a 90° con braceo activo.'
      },
      {
        name: 'Plancha con saltos de pies',
        repsOrDuration: '35 s de trabajo',
        focus: 'Estabilidad del core dinámico abriendo y cerrando pies sin mover la cadera.'
      }
    ],
    coachTips: [
      'Aterriza de puntas a talones absorbiendo el impacto con las piernas flexionadas para proteger las rodillas.',
      'Si te fatigas a mitad del intervalo, mantén el movimiento continuo a ritmo suave en vez de parar.',
      'Excelente rutina para días de viaje o cuando no tienes material a mano.'
    ]
  },
  {
    id: 'functional_saltos_cuerda_potencia',
    name: 'Fuerza & Pliometría (Saltos, Cuerda & Potencia)',
    category: 'saltos_cuerda',
    categoryLabel: 'Pliometría & Cuerda',
    shortDesc: 'Acondicionamiento inspirado en deportes de combate con reactividad de tobillos y cadera.',
    targetFocus: 'Resistencia láctica, elasticidad tendinosa y coordinación dinámica neuromuscular.',
    totalDurationMin: 20,
    rounds: 4,
    workSec: 40,
    restSec: 20,
    equipment: 'Cuerda / Caja o Banco',
    evidence: 'B',
    stations: [
      {
        name: 'Saltos de cuerda virtuales',
        repsOrDuration: '40 s de trabajo',
        focus: 'Rebote elástico sobre mediopié con rotación rápida de muñecas.'
      },
      {
        name: 'Saltos al cajón (Box jumps)',
        repsOrDuration: '40 s de trabajo',
        focus: 'Potencia vertical máxima aterrizando en media sentadilla silenciosa.'
      },
      {
        name: 'Balanceos con pesa rusa (Kettlebell swings)',
        repsOrDuration: '40 s de trabajo',
        focus: 'Bisagra de cadera explosiva proyectando la carga con los glúteos.'
      },
      {
        name: 'Patinadores laterales (Skaters)',
        repsOrDuration: '40 s de trabajo',
        focus: 'Desplazamiento explosivo en el plano frontal fortaleciendo el glúteo medio.'
      },
      {
        name: 'Burpees completos',
        repsOrDuration: '40 s de trabajo',
        focus: 'El estímulo metabólico rey para cerrar cada ronda al máximo nivel.'
      }
    ],
    coachTips: [
      'Baja del cajón con paso hacia atrás (step-down) para preservar los tendones de Aquiles de impactos repetitivos.',
      'En los balanceos, proyecta la pesa con la cadera, nunca con la fuerza de los brazos.',
      'Mantén los tobillos rígidos y reactivos en los saltos de cuerda.'
    ]
  },
  {
    id: 'functional_core_estabilidad',
    name: 'Core & Estabilidad Funcional (Anti-Rotación & Postura)',
    category: 'core_estabilidad',
    categoryLabel: 'Core & Estabilidad',
    shortDesc: 'Fortalecimiento del cinturón lumbopélvico, anti-extensión y transferencia postural.',
    targetFocus: 'Blindaje de columna, estabilidad escapular y resistencia isométrica profunda.',
    totalDurationMin: 16,
    rounds: 4,
    workSec: 40,
    restSec: 20,
    equipment: 'Colchoneta o suelo',
    evidence: 'A',
    stations: [
      {
        name: 'Hollow rocks de abdomen',
        repsOrDuration: '40 s de trabajo',
        focus: 'Tensión abdominal global manteniendo la espalda baja completamente pegada al suelo.'
      },
      {
        name: 'Flexiones comando',
        repsOrDuration: '40 s de trabajo',
        focus: 'Transición de plancha baja a alta evitando el balanceo lateral de caderas.'
      },
      {
        name: 'Escaladores (Mountain climbers)',
        repsOrDuration: '40 s de trabajo',
        focus: 'Control del core con flexión alterna de caderas sin elevar la pelvis.'
      },
      {
        name: 'Plancha con saltos de pies',
        repsOrDuration: '40 s de trabajo',
        focus: 'Rigidez de cuerpo entero apretando glúteos, cuádriceps y transverso abdominal.'
      }
    ],
    coachTips: [
      'La calidad de contracción es fundamental: no permitas que la zona lumbar se arquee en ningún momento.',
      'Mantén respiraciones controladas y diafragmáticas durante toda la fase de trabajo.',
      'Ideal como sesión complementaria o de recuperación activa entre días pesados de piernas.'
    ]
  }
];
