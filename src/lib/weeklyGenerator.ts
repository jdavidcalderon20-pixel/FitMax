import { Level } from '../types';

export interface WeeklyExercise {
  name: string;
  category: string;
  defaultSets: number;
  defaultReps: string;
  description?: string;
}

export type RoutineFocus = 'standard' | 'glutes';

export interface WeeklyDay {
  id: number;
  name: string;
  subtitle: string;
  category: 'torso_fuerza' | 'pierna_fuerza' | 'torso_hipertrofia' | 'pierna_hipertrofia' | 'gluteos_fuerza' | 'torso_estetico' | 'gluteos_hipertrofia' | 'espalda_gluteos' | 'pierna_gluteos_hipertrofia' | 'gluteos_bombeo' | string;
  exercises: WeeklyExercise[];
  amrapComplementary: {
    name: string;
    durationMinutes: number;
    exercises: string[];
    instructions: string;
  };
  amrapActivator: {
    name: string;
    durationMinutes: number;
    exercises: string[];
    instructions: string;
  };
}

export type WeeklyRoutine = Record<number, WeeklyDay>;

// Helper to pick random item from array
const pickRandom = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

// --- DAY 1 POOLS ---
const day1_ex1 = {
  A: [
    { name: 'Press plano con mancuernas', reps: '8-10 reps', desc: 'Control de trayectoria y estabilidad escapular.' },
    { name: 'Press en máquina de pecho sentado', reps: '10 reps', desc: 'Empuja de forma controlada sintiendo la contracción del pectoral.' },
    { name: 'Press plano con mancuernas (agarre neutro)', reps: '8-10 reps', desc: 'Excelente para cuidar la salud del hombro y deltoides.' }
  ],
  B: [
    { name: 'Press de banca con barra', reps: '6-8 reps', desc: 'Mantén retracción escapular y rango completo sin rebotar en el pecho.' },
    { name: 'Press plano pesado con mancuernas', reps: '8 reps', desc: 'Baja controlado hasta tocar los laterales del pecho con las mancuernas.' },
    { name: 'Press de banca inclinado con barra', reps: '6-8 reps', desc: 'Enfoque en la porción clavicular del pectoral.' }
  ],
  C: [
    { name: 'Press de banca pesado con barra', reps: '5-6 reps', desc: 'Carga pesada con técnica estricta. Usa spotter si es posible.' },
    { name: 'Press de banca con pausa de 2s abajo', reps: '5 reps', desc: 'Elimina el rebote y genera fuerza pura desde el punto muerto.' },
    { name: 'Press plano pesado con mancuernas (pausa abajo)', reps: '6 reps', desc: 'Pausa de 1 segundo en el estiramiento máximo.' }
  ]
};

const day1_ex2 = {
  A: [
    { name: 'Remo con mancuernas apoyado en banco', reps: '8-10 reps', desc: 'Evita rotar el torso, enfócate en llevar el codo atrás.' },
    { name: 'Remo bajo en máquina con soporte de pecho', reps: '10 reps', desc: 'Aísla la espalda manteniendo el pecho firme contra el pad.' },
    { name: 'Remo con mancuernas a una mano', reps: '10 reps', desc: 'Apóyate en el banco, jala con el codo apuntando hacia la cadera.' }
  ],
  B: [
    { name: 'Remo con barra', reps: '6-8 reps', desc: 'Mantén la espalda neutra en ángulo de 45°.' },
    { name: 'Remo con mancuernas pronación', reps: '8 reps', desc: 'Codos abiertos a 45 grados para reclutar más deltoides posterior.' },
    { name: 'Remo en barra T', reps: '6-8 reps', desc: 'Mantén las rodillas flexionadas y el core muy firme.' }
  ],
  C: [
    { name: 'Remo Pendlay con barra (pesado)', reps: '5-6 reps', desc: 'Remo explosivo desde el piso, controlando el descenso.' },
    { name: 'Remo con barra pesado agarre supino', reps: '5-6 reps', desc: 'Excelente constructor de densidad de espalda y bíceps.' },
    { name: 'Remo con mancuerna pesado a una mano (Remo Kroc)', reps: '6 reps', desc: 'Carga pesada con alto volumen y técnica controlada.' }
  ]
};

const day1_ex3 = {
  A: [
    { name: 'Press de hombros en máquina sentado', reps: '10 reps', desc: 'Movimiento controlado sin arquear la espalda.' },
    { name: 'Press militar con mancuernas sentado', reps: '10 reps', desc: 'Sube controlando el balanceo, espalda bien apoyada en el banco.' }
  ],
  B: [
    { name: 'Press militar con mancuernas de pie', reps: '8-10 reps', desc: 'Core activo para estabilizar el cuerpo en todo el rango.' },
    { name: 'Press militar con barra sentado', reps: '8-10 reps', desc: 'Controla la barra al bajar al nivel de la barbilla.' }
  ],
  C: [
    { name: 'Press militar pesado con barra (de pie)', reps: '6-8 reps', desc: 'Baja la barra hasta la parte alta del pecho con control.' },
    { name: 'Press push press de hombros pesado', reps: '5-6 reps', desc: 'Usa una ligera flexión de rodillas para impulsar la carga.' }
  ]
};

const day1_ex4 = {
  A: [
    { name: 'Jalón al pecho con agarre amplio neutro', reps: '10 reps', desc: 'Contracción consciente del dorsal ancho.' },
    { name: 'Jalón al pecho invertido (supino)', reps: '10 reps', desc: 'Recluta más el bíceps y la parte baja del dorsal.' }
  ],
  B: [
    { name: 'Dominadas libres (o Jalón al pecho pesado)', reps: '8-10 reps', desc: 'Trata de pasar la barbilla por encima de la barra.' },
    { name: 'Jalón al pecho agarre cerrado en V', reps: '10 reps', desc: 'Lleva el agarre a la parte baja del pecho, inclínate ligeramente.' }
  ],
  C: [
    { name: 'Dominadas lastradas o Estrictas amplias', reps: '6-8 reps', desc: 'Añade lastre controlado o realiza repeticiones lentas estrictas.' },
    { name: 'Dominadas agarre supino con lastre', reps: '6-8 reps', desc: 'Contracción máxima de dorsales y bíceps en el tope.' }
  ]
};

const day1_ex5 = [
  { name: 'Curl con mancuernas + Extensión en polea', reps: '12 reps cada uno', desc: 'Ejercicios realizados consecutivamente sin descanso intermedio.' },
  { name: 'Curl martillo con mancuernas + Extensión de tríceps copa', reps: '12 reps cada uno', desc: 'Estimulación equilibrada de bíceps y cabeza larga de tríceps.' },
  { name: 'Curl con barra EZ + Rompecráneos con barra EZ', reps: '10-12 reps c/u', desc: 'Superserie clásica de brazos para máxima tensión mecánica.' }
];

const day1_amrap_comp = [
  {
    name: 'AMRAP Complementario: Burnout de Brazos y Core',
    exercises: ['10 Flexiones de pecho (Push-ups)', '15 Fondos en banco o cajón', '20 Abdominales tipo Crunch'],
    instructions: 'Realiza tantas rondas como sea posible. Enfócate en bombear los tríceps y el pecho.'
  },
  {
    name: 'AMRAP Complementario: Resistencia de Hombros y Core',
    exercises: ['15 Elevaciones frontales de disco', '10 Caminatas de oso (Bear crawls)', '30s Plancha alta'],
    instructions: 'Trabaja la estabilidad escapular y de core sin detenerte.'
  }
];

const day1_amrap_act = [
  {
    name: 'AMRAP Activador: Preparación para Día de Piernas',
    exercises: ['10 Puentes de glúteo isométrica 2s', '12 Sentadillas peso corporal lentas', '15 Planchas de oso con toque de hombros'],
    instructions: 'Activa la musculatura de cadera, core y cuádriceps para optimizar el entrenamiento de mañana.'
  },
  {
    name: 'AMRAP Activador: Movilidad Activa de Cadera',
    exercises: ['10 Zancadas cosacas alternas', '8 Rotaciones de cadera a 90/90', '12 Puentes de glúteo dinámicos'],
    instructions: 'Suelta la articulación de la cadera para facilitar la profundidad de la sentadilla.'
  }
];

// --- DAY 2 POOLS ---
const day2_ex1 = {
  A: [
    { name: 'Sentadilla Goblet pesada', reps: '8-10 reps', desc: 'Sostén la mancuerna contra el pecho, baja con espalda recta.' },
    { name: 'Sentadilla Goblet en caja (Box Squat)', reps: '10 reps', desc: 'Baja controlado hasta tocar la caja y sube explosivamente.' },
    { name: 'Prensa de piernas pesada', reps: '10 reps', desc: 'Rango de movimiento completo y seguro para tus rodillas.' }
  ],
  B: [
    { name: 'Sentadilla trasera con barra', reps: '6-8 reps', desc: 'Mantén las rodillas alineadas con la punta de los pies.' },
    { name: 'Sentadilla frontal con barra', reps: '8 reps', desc: 'Mantén los codos altos y la columna vertical durante el trayecto.' },
    { name: 'Sentadilla Goblet doble con mancuernas', reps: '8-10 reps', desc: 'Sostén dos mancuernas a los lados del hombro para cargar más.' }
  ],
  C: [
    { name: 'Sentadilla trasera pesada con barra', reps: '5-6 reps', desc: 'Carga pesada con técnica estricta. Rompe el paralelo.' },
    { name: 'Sentadilla frontal pesada con barra', reps: '5 reps', desc: 'Enfoque masivo en cuádriceps y estabilidad de columna.' },
    { name: 'Sentadilla trasera con pausa abajo de 2s', reps: '5 reps', desc: 'Detén el movimiento por completo abajo para generar potencia pura.' }
  ]
};

const day2_ex2 = {
  A: [
    { name: 'Peso muerto rumano con mancuernas', reps: '8-10 reps', desc: 'Enfócate en empujar la cadera hacia atrás sintiendo los isquios.' },
    { name: 'Hip thrust con mancuerna pesada', reps: '10-12 reps', desc: 'Contracción de 1s arriba de los glúteos.' },
    { name: 'Peso muerto rumano en polea baja', reps: '10 reps', desc: 'Mantiene la tensión constante en isquiotibiales y glúteos.' }
  ],
  B: [
    { name: 'Peso muerto rumano con barra', reps: '8-10 reps', desc: 'Siente el estiramiento en los isquiotibiales bajando controlado.' },
    { name: 'Peso muerto con barra hexagonal (Trap Bar)', reps: '6-8 reps', desc: 'Excelente distribución del peso que reduce tensión lumbar.' },
    { name: 'Hip thrust pesado con barra', reps: '8-10 reps', desc: 'Usa colchoneta para proteger la cadera, extiende fuerte.' }
  ],
  C: [
    { name: 'Peso muerto convencional pesado', reps: '5 reps', desc: 'Mantén la barra pegada a las espinillas, core sumamente compacto.' },
    { name: 'Peso muerto rumano pesado con barra', reps: '6-8 reps', desc: 'Fuerza extrema en cadena posterior, espalda neutra garantizada.' },
    { name: 'Peso muerto sumo pesado con barra', reps: '5 reps', desc: 'Mayor apertura de piernas para priorizar cuádriceps y aductores.' }
  ]
};

const day2_ex3 = {
  A: [
    { name: 'Prensa de piernas con pies bajos', reps: '12 reps', desc: 'Rango de movimiento completo sin despegar la cadera.' },
    { name: 'Zancadas estáticas hacia atrás', reps: '10 reps por lado', desc: 'Baja la rodilla trasera casi rozando el suelo.' }
  ],
  B: [
    { name: 'Prensa de piernas (carga media-alta)', reps: '10-12 reps', desc: 'Empuje controlado, no bloquees rodillas al final.' },
    { name: 'Sentadilla Goblet a una pierna (Step-ups)', reps: '10 reps por pierna', desc: 'Sube a un banco controlando la bajada.' }
  ],
  C: [
    { name: 'Prensa unilateral pesada', reps: '8-10 reps', desc: 'Aísla cada pierna de manera independiente para evitar asimetrías.' },
    { name: 'Sentadilla Hack pesada', reps: '8-10 reps', desc: 'Excelente soporte para la espalda y máximo estímulo a los cuádriceps.' }
  ]
};

const day2_ex4 = {
  A: [
    { name: 'Elevación de talones de pie (sin peso)', reps: '15 reps', desc: 'Rango máximo de estiramiento y contracción arriba.' },
    { name: 'Elevación de talones en banco', reps: '15 reps', desc: 'Trabajo controlado de gemelos con los pies colgando.' }
  ],
  B: [
    { name: 'Elevación de talones en máquina de pie', reps: '12-15 reps', desc: 'Sostén la contracción arriba 1 segundo en cada repetición.' },
    { name: 'Elevación de talones en prensa', reps: '12-15 reps', desc: 'Aprovecha la prensa para estirar completamente la pantorrilla.' }
  ],
  C: [
    { name: 'Elevación de talones unilateral de pie (con peso)', reps: '10-12 reps', desc: 'Aísla cada pantorrilla sosteniendo una mancuerna pesada.' },
    { name: 'Elevación de talones de pie pesada en máquina', reps: '10-12 reps', desc: 'Carga alta, bajada de 3s para vencer el reflejo miotático.' }
  ]
};

const day2_ex5 = {
  A: [
    { name: 'Plancha abdominal isométrica', reps: '30 segundos', desc: 'Mantén el abdomen y glúteos contraídos. No dejes caer la pelvis.' },
    { name: 'Abdominales muertos (Dead bug)', reps: '12 reps alternas', desc: 'Baja brazo y pierna contraria controlando que la lumbar no se arquee.' }
  ],
  B: [
    { name: 'Plancha abdominal máxima duración', reps: 'Al fallo controlado', desc: 'Esfuerzo máximo para reclutar las fibras más profundas del core.' },
    { name: 'Elevación de rodillas en paralelas (Captain\'s Chair)', reps: '12-15 reps', desc: 'Eleva controlando la cadera, sin usar balanceo.' }
  ],
  C: [
    { name: 'Plancha abdominal con peso', reps: '45 segundos', desc: 'Añade un disco sobre la espalda baja para mayor exigencia.' },
    { name: 'Rueda abdominal (Ab wheel rollouts)', reps: '12 reps', desc: 'Extiende hasta donde puedas controlar la columna neutra.' }
  ]
};

// --- DAY 3 POOLS ---
const day3_ex1 = {
  A: [
    { name: 'Press inclinado con mancuernas (ligero)', reps: '12 reps', desc: 'Inclinación de banco a 30° para priorizar haz clavicular del pectoral.' },
    { name: 'Press de pecho inclinado en máquina', reps: '12 reps', desc: 'Empuje fluido para aislar la zona alta del pecho.' }
  ],
  B: [
    { name: 'Press superior con mancuernas', reps: '10-12 reps', desc: 'Inclinación de banco a 30° para priorizar haz clavicular del pectoral.' },
    { name: 'Press inclinado con barra', reps: '10 reps', desc: 'Lleva la barra a la parte alta del pecho con trayectoria estricta.' }
  ],
  C: [
    { name: 'Press superior pesado con mancuernas', reps: '8-10 reps', desc: 'Inclinación de banco a 30° para priorizar haz clavicular del pectoral.' },
    { name: 'Press inclinado con mancuernas con pausa', reps: '8 reps', desc: 'Pausa de 1.5s abajo justo antes de empujar.' }
  ]
};

const day3_ex2 = {
  A: [
    { name: 'Remo bajo en polea con agarre triángulo', reps: '12 reps', desc: 'Sostén la contracción de los dorsales atrás 1-2 segundos en cada rep.' },
    { name: 'Remo unilateral en polea baja', reps: '12 reps', desc: 'Permite un estiramiento profundo del dorsal al rotar ligeramente.' }
  ],
  B: [
    { name: 'Remo sentado en polea (agarre neutro)', reps: '10-12 reps', desc: 'Sostén la contracción de los dorsales atrás 1-2 segundos en cada rep.' },
    { name: 'Remo con mancuernas apoyado en banco inclinado', reps: '10-12 reps', desc: 'Elimina el impulso del cuerpo y aísla por completo la espalda.' }
  ],
  C: [
    { name: 'Remo en polea unilateral con rotación', reps: '10-12 reps', desc: 'Sostén la contracción de los dorsales atrás 1-2 segundos en cada rep.' },
    { name: 'Remo Meadows con barra', reps: '10 reps por lado', desc: 'Agarre unilateral a la barra T con inclinación del torso, gran tracción.' }
  ]
};

const day3_ex3 = {
  A: [
    { name: 'Pec Deck o Aperturas en máquina', reps: '12-15 reps', desc: 'Enfócate en juntar los bíceps contra el pecho, apretando el pectoral.' },
    { name: 'Aperturas en poleas bajas', reps: '12-15 reps', desc: 'Tensión constante para la zona superior del pecho.' }
  ],
  B: [
    { name: 'Aperturas con mancuernas en banco plano', reps: '12-15 reps', desc: 'Enfócate en juntar los bíceps contra el pecho, apretando el pectoral.' },
    { name: 'Cruce de poleas para pecho (Cables)', reps: '12-15 reps', desc: 'Enfócate en juntar los bíceps al final del rango.' }
  ],
  C: [
    { name: 'Cruce de poleas altas para pecho (Flyes)', reps: '12-15 reps', desc: 'Enfócate en juntar los bíceps contra el pecho, apretando el pectoral.' },
    { name: 'Dips (Fondos) de pecho enfocados', reps: '12 reps', desc: 'Cuerpo inclinado adelante para transferir tensión al pectoral bajo.' }
  ]
};

const day3_ex4 = {
  A: [
    { name: 'Elevaciones laterales de pie ligeras', reps: '15 reps', desc: 'Sube las manos liderando con los codos. Evita balanceos.' },
    { name: 'Elevaciones laterales sentado', reps: '15 reps', desc: 'Elimina el impulso de las piernas y aísla la cabeza lateral.' }
  ],
  B: [
    { name: 'Elevaciones laterales con mancuernas', reps: '12-15 reps', desc: 'Sube las manos liderando con los codos. Evita balanceos.' },
    { name: 'Elevaciones laterales en polea', reps: '12-15 reps', desc: 'La polea mantiene una excelente tensión en todo el recorrido.' }
  ],
  C: [
    { name: 'Elevaciones laterales en polea baja unilateral', reps: '12-15 reps', desc: 'Sube las manos liderando con los codos. Evita balanceos.' },
    { name: 'Elevaciones de hombro estilo Lu Raises', reps: '12 reps', desc: 'Rango de movimiento completo por encima de la cabeza.' }
  ]
};

const day3_ex5 = {
  A: [
    { name: 'Curl martillo + Extensión con cuerda', reps: '12 reps cada uno', desc: 'Aislamiento máximo para brazos. Controla la fase excéntrica de 2-3 segundos.' },
    { name: 'Curl de bíceps polea + Patada de tríceps', reps: '12 reps cada uno', desc: 'Mantén los codos pegados al cuerpo en todo momento.' }
  ],
  B: [
    { name: 'Curl inclinado + Fondos en paralelas', reps: '12 reps cada uno', desc: 'Aislamiento máximo para brazos. Controla la fase excéntrica de 2-3 segundos.' },
    { name: 'Curl con barra EZ + Extensión polea agarre invertido', reps: '12 reps cada uno', desc: 'Superserie de alta congestión para bíceps y tríceps.' }
  ],
  C: [
    { name: 'Curl inclinado pesado + Fondos lastrados', reps: '12 reps cada uno', desc: 'Aislamiento máximo para brazos. Controla la fase excéntrica de 2-3 segundos.' },
    { name: 'Curl de bíceps concentrado + Extensión copa pesada', reps: '12 reps cada uno', desc: 'Enfoque absoluto en la contracción muscular máxima.' }
  ]
};

// --- DAY 4 POOLS ---
const day4_ex1 = {
  A: [
    { name: 'Zancadas hacia atrás con mancuernas ligeras', reps: '10-12 reps por pierna', desc: 'Mantén el torso ligeramente inclinado adelante para involucrar más los glúteos.' },
    { name: 'Paso de zancada caminando (ligeras)', reps: '12 pasos totales', desc: 'Asegura estabilidad en la rodilla en cada paso.' }
  ],
  B: [
    { name: 'Zancadas (Desplantes) con mancuernas', reps: '10-12 reps por pierna', desc: 'Mantén el torso ligeramente inclinado adelante para involucrar más los glúteos.' },
    { name: 'Sentadilla búlgara con mancuernas ligeras', reps: '10 reps por pierna', desc: 'Baja con control manteniendo el peso centrado.' }
  ],
  C: [
    { name: 'Sentadilla búlgara con mancuernas pesadas', reps: '10-12 reps por pierna', desc: 'Mantén el torso ligeramente inclinado adelante para involucrar más los glúteos.' },
    { name: 'Zancadas caminando pesadas con mancuernas', reps: '12 pasos por pierna', desc: 'Fuerza, estabilidad y volumen masivo para tus piernas.' }
  ]
};

const day4_ex2 = {
  A: [
    { name: 'Extensión de cuádriceps en máquina (ligero)', reps: '15 reps', desc: 'No bajes el peso de golpe. Siente el cuádriceps trabajando durante todo el trayecto.' },
    { name: 'Sentadilla Sissy peso corporal', reps: '12 reps', desc: 'Enfoque puro en cuádriceps usando el peso de tu propio cuerpo.' }
  ],
  B: [
    { name: 'Extensión de cuádriceps en máquina', reps: '12-15 reps', desc: 'No bajes el peso de golpe. Siente el cuádriceps trabajando durante todo el trayecto.' },
    { name: 'Prensa inclinada con pies juntos y bajos', reps: '12 reps', desc: 'Maximiza la flexión de rodilla para priorizar cuádriceps.' }
  ],
  C: [
    { name: 'Extensión de cuádriceps unilateral excéntrica lenta', reps: '10-12 reps', desc: 'No bajes el peso de golpe. Siente el cuádriceps trabajando durante todo el trayecto.' },
    { name: 'Sentadilla Hack enfocada en cuádriceps', reps: '10 reps', desc: 'Bajo rango de apoyo para enfocar la tensión en los cuádriceps.' }
  ]
};

const day4_ex3 = {
  A: [
    { name: 'Curl de pierna acostado en máquina', reps: '15 reps', desc: 'Aprieta al final de la flexión. Controla el retorno estirando bien el músculo.' },
    { name: 'Peso muerto rumano con mancuernas ligeras', reps: '12 reps', desc: 'Mantén la espalda recta e isquiotibiales activos.' }
  ],
  B: [
    { name: 'Curl de pierna acostado (Isquiotibiales)', reps: '12-15 reps', desc: 'Aprieta al final de la flexión. Controla el retorno estirando bien el músculo.' },
    { name: 'Curl de pierna sentado', reps: '12-15 reps', desc: 'Aprovecha la flexión de cadera para estirar más el femoral.' }
  ],
  C: [
    { name: 'Curl femoral sentado con pausa abajo (contracción)', reps: '10-12 reps', desc: 'Aprieta al final de la flexión. Controla el retorno estirando bien el músculo.' },
    { name: 'Nordic curls progresivas o asistidas', reps: '8 reps', desc: 'Fuerza excéntrica extrema para blindar tus isquiotibiales.' }
  ]
};

const day4_ex4 = {
  A: [
    { name: 'Elevación de talones sentado (ligera)', reps: '15 reps', desc: 'La flexión sentado aísla principalmente el músculo sóleo.' },
    { name: 'Elevación de talones sentado (con mancuernas)', reps: '15 reps', desc: 'Sostén mancuernas sobre tus rodillas para cargar más.' }
  ],
  B: [
    { name: 'Elevación de talones sentado en máquina', reps: '12-15 reps', desc: 'La flexión sentado aísla principalmente el músculo sóleo.' },
    { name: 'Elevación de talones en prensa baja', reps: '12-15 reps', desc: 'Rango controlado sin arquear los tobillos.' }
  ],
  C: [
    { name: 'Elevación de talones sentado pesada con pausa arriba', reps: '10-12 reps', desc: 'La flexión sentado aísla principalmente el músculo sóleo.' },
    { name: 'Elevación de talones sentado unilateral pesada', reps: '10-12 reps', desc: 'Aísla cada sóleo de forma profunda y enfocada.' }
  ]
};

const day4_ex5 = {
  A: [
    { name: 'Crunch abdominal con pies elevados', reps: '15 reps', desc: 'Controla el descenso de las piernas usando la fuerza del abdomen, sin balanceo.' },
    { name: 'Plancha lateral estática', reps: '30s por lado', desc: 'Mantén la cadera alta y el hombro estabilizado.' }
  ],
  B: [
    { name: 'Elevación de piernas acostado (Leg raises)', reps: '15 reps', desc: 'Controla el descenso de las piernas usando la fuerza del abdomen, sin balanceo.' },
    { name: 'Giros rusos con peso (Russian twists)', reps: '20 reps', desc: 'Trabajo rotacional dinámico para oblicuos con carga.' }
  ],
  C: [
    { name: 'Elevación de piernas colgado de barra', reps: '12-15 reps', desc: 'Controla el descenso de las piernas usando la fuerza del abdomen, sin balanceo.' },
    { name: 'Abdominales en polea alta (Cable crunches)', reps: '12-15 reps', desc: 'Fuerza de contracción con resistencia añadida.' }
  ]
};

// --- GLUTE FOCUS POOLS (Énfasis Glúteos & Tren Inferior / Rutina Femenina Atlética) ---
const gluteD1_ex1 = {
  A: [
    { name: 'Hip thrust con mancuerna pesada', reps: '10-12 reps', desc: 'Pausa de 1 segundo arriba comprimiendo al máximo los glúteos.' },
    { name: 'Kas Glute Bridge con mancuerna', reps: '12 reps', desc: 'Rango corto en tercio superior manteniendo tensión continua.' }
  ],
  B: [
    { name: 'Hip thrust pesado con barra', reps: '8-10 reps', desc: 'Usa colchoneta protectora, extiende pelvis hasta la horizontal.' },
    { name: 'Hip thrust en máquina guiada', reps: '10 reps', desc: 'Sobrecarga guiada con máxima seguridad y control.' }
  ],
  C: [
    { name: 'Hip thrust con barra y pausa de 2s arriba', reps: '6-8 reps', desc: 'Elimina el impulso elástico y genera máxima tensión isométrica.' },
    { name: 'Hip thrust pesado con barra (Drop-set en última serie)', reps: '8 reps + 6 al fallo', desc: 'Estímulo metabólico extremo para el glúteo mayor.' }
  ]
};

const gluteD1_ex2 = {
  A: [
    { name: 'Peso muerto rumano con mancuernas', reps: '10 reps', desc: 'Empuja la cadera hacia atrás sintiendo los isquiotibiales y glúteos.' },
    { name: 'Peso muerto rumano en polea baja', reps: '12 reps', desc: 'Tensión constante durante todo el recorrido de la bisagra.' }
  ],
  B: [
    { name: 'Peso muerto rumano con barra', reps: '8-10 reps', desc: 'Mantén la barra pegada a los muslos y la espalda baja neutra.' },
    { name: 'Peso muerto rumano B-Stance unilateral', reps: '10 reps por pierna', desc: 'Concentra el 85% de la carga en la pierna delantera.' }
  ],
  C: [
    { name: 'Peso muerto rumano B-Stance pesado con mancuernas', reps: '8 reps por pierna', desc: 'Carga pesada con rango completo de estiramiento del glúteo.' },
    { name: 'Peso muerto rumano pesado con barra (pausa abajo)', reps: '6-8 reps', desc: 'Pausa de 1s en máximo estiramiento isquiotibial y glúteo.' }
  ]
};

const gluteD1_ex3 = {
  A: [
    { name: 'Zancadas estáticas hacia atrás', reps: '10 reps por pierna', desc: 'Torso inclinado a 30° para priorizar el glúteo sobre el cuádriceps.' },
    { name: 'Sentadilla búlgara con peso corporal', reps: '10 reps por pierna', desc: 'Mantén el equilibrio y el peso centrado en el talón delantero.' }
  ],
  B: [
    { name: 'Sentadilla búlgara con enfoque en glúteo (Torso a 45°)', reps: '10 reps por pierna', desc: 'Espinilla vertical y torso inclinado para máximo estiramiento del glúteo.' },
    { name: 'Zancadas caminando con mancuernas', reps: '12 pasos por pierna', desc: 'Pasos largos para mayor ángulo de flexión de cadera.' }
  ],
  C: [
    { name: 'Sentadilla búlgara pesada con mancuernas (Torso a 45°)', reps: '8-10 reps por pierna', desc: 'Carga exigente, bajada lenta en 3 segundos sin impulso.' },
    { name: 'Sentadilla búlgara en máquina Smith (enfoque glúteo)', reps: '10 reps por pierna', desc: 'Estabilidad máxima para empujar con intensidad límite.' }
  ]
};

const gluteD1_ex4 = {
  A: [
    { name: 'Abducción de cadera en máquina a 30°', reps: '15 reps', desc: 'Inclina el torso ligeramente adelante para alinear el glúteo medio.' },
    { name: 'Abducciones con banda elástica de pie', reps: '15-20 reps', desc: 'Contracción sostenida de 1 segundo en máxima apertura.' }
  ],
  B: [
    { name: 'Abducción de cadera en máquina con pausa de 1s', reps: '12-15 reps', desc: 'Sostén la apertura 1 segundo antes de cerrar en 3 segundos.' },
    { name: 'Abducción de cadera en polea baja con tobillera', reps: '12 reps por pierna', desc: 'Cruza ligeramente por delante para estirar antes de abrir.' }
  ],
  C: [
    { name: 'Abducción de cadera en máquina a 30° (Drop-set)', reps: '12 + 10 reps', desc: 'Realiza 12 reps pesadas, baja 30% del peso y saca 10 más.' },
    { name: 'Abducción en polea con inclinación de torso', reps: '12 reps por lado', desc: 'Aislamiento estricto de la porción superior del glúteo.' }
  ]
};

const gluteD1_ex5 = {
  A: [
    { name: 'Plancha abdominal isométrica', reps: '30 segundos', desc: 'Mantén el abdomen y glúteos contraídos. No dejes caer la pelvis.' },
    { name: 'Abdominales muertos (Dead bug)', reps: '12 reps alternas', desc: 'Baja brazo y pierna contraria controlando la lumbar.' }
  ],
  B: [
    { name: 'Plancha abdominal máxima duración', reps: 'Al fallo controlado', desc: 'Esfuerzo máximo para reclutar las fibras más profundas del core.' },
    { name: 'Elevación de rodillas en paralelas', reps: '12-15 reps', desc: 'Eleva controlando la cadera, sin usar balanceo.' }
  ],
  C: [
    { name: 'Rueda abdominal (Ab wheel rollouts)', reps: '12 reps', desc: 'Extiende hasta donde puedas controlar la columna neutra.' },
    { name: 'Plancha abdominal con peso', reps: '45 segundos', desc: 'Añade un disco sobre la espalda baja para mayor exigencia.' }
  ]
};

const gluteD2_ex1 = {
  A: [
    { name: 'Press militar con mancuernas sentado', reps: '10 reps', desc: 'Sube controlando el balanceo, espalda bien apoyada.' },
    { name: 'Press de hombros en máquina sentado', reps: '10-12 reps', desc: 'Empuje guiado para dar forma redonda al hombro.' }
  ],
  B: [
    { name: 'Press militar con mancuernas de pie', reps: '8-10 reps', desc: 'Core activo para estabilizar el cuerpo en todo el rango.' },
    { name: 'Press militar con mancuernas sentado (pesado)', reps: '8 reps', desc: 'Carga media-alta para estilizar el deltoides.' }
  ],
  C: [
    { name: 'Press militar pesado con barra (de pie)', reps: '6-8 reps', desc: 'Baja la barra hasta la parte alta del pecho con control.' },
    { name: 'Press de hombros en máquina unilateral pesado', reps: '8 reps', desc: 'Carga pesada manteniendo simetría bilateral.' }
  ]
};

const gluteD2_ex2 = {
  A: [
    { name: 'Jalón al pecho con agarre neutro', reps: '10-12 reps', desc: 'Lleva el agarre al pecho alto retrayendo escápulas.' },
    { name: 'Jalón al pecho invertido (supino)', reps: '10 reps', desc: 'Recluta más el bíceps y la parte baja del dorsal.' }
  ],
  B: [
    { name: 'Jalón al pecho con agarre amplio', reps: '10 reps', desc: 'Estira completamente los dorsales arriba en cada rep.' },
    { name: 'Dominadas asistidas en máquina', reps: '8-10 reps', desc: 'Control excéntrico estricto de 3 segundos al bajar.' }
  ],
  C: [
    { name: 'Dominadas libres estrictas', reps: '6-8 reps', desc: 'Rango completo pasando la barbilla sobre la barra.' },
    { name: 'Jalón al pecho pesado con pausa abajo', reps: '8 reps', desc: 'Pausa isométrica de 1s con escápulas retraídas.' }
  ]
};

const gluteD2_ex3 = {
  A: [
    { name: 'Elevaciones laterales con mancuernas', reps: '12-15 reps', desc: 'Codos ligeramente flexionados, sube hasta la línea de hombros.' },
    { name: 'Elevaciones laterales en máquina', reps: '15 reps', desc: 'Aislamiento continuo para hombros estilizados.' }
  ],
  B: [
    { name: 'Elevaciones laterales en polea a una mano', reps: '12-15 reps', desc: 'Tensión constante desde el punto más bajo del recorrido.' },
    { name: 'Elevaciones laterales con mancuernas (tempo 3-1)', reps: '12 reps', desc: 'Subida controlada y bajada en 3 segundos.' }
  ],
  C: [
    { name: 'Elevaciones laterales pesadas + parciales', reps: '10 + 6 reps', desc: '6 repeticiones parciales al final para sobrecarga del deltoides.' },
    { name: 'Elevaciones laterales en polea inclinada', reps: '12 reps por lado', desc: 'Mayor brazo de palanca y tensión en máxima elongación.' }
  ]
};

const gluteD2_ex4 = {
  A: [
    { name: 'Remo bajo en máquina con soporte de pecho', reps: '12 reps', desc: 'Aísla la espalda sin fatigar la columna lumbar.' },
    { name: 'Remo con mancuernas apoyado en banco', reps: '10 reps', desc: 'Evita rotar el torso, lleva los codos hacia atrás.' }
  ],
  B: [
    { name: 'Remo sentado en polea con agarre triángulo', reps: '10-12 reps', desc: 'Aprieta la espalda atrás 1-2 segundos en cada repetición.' },
    { name: 'Remo con mancuernas a una mano en banco', reps: '10 reps por brazo', desc: 'Jala con el codo apuntando hacia la cadera.' }
  ],
  C: [
    { name: 'Remo en barra T con soporte de pecho (pesado)', reps: '8-10 reps', desc: 'Densidad en la espalda media y romboides.' },
    { name: 'Remo con mancuernas apoyado en banco inclinado', reps: '10 reps', desc: 'Cero balanceo corporal para estímulo puro de espalda alta.' }
  ]
};

const gluteD2_ex5 = {
  A: [
    { name: 'Extensiones de tríceps en polea + Curl de bíceps con mancuernas', reps: '12 reps c/u', desc: 'Superserie de brazos para tono y definición sin volumen excesivo.' }
  ],
  B: [
    { name: 'Extensiones de tríceps tras nuca en polea + Curl martillo', reps: '10-12 reps c/u', desc: 'Enfoca la porción larga del tríceps y braquial.' }
  ],
  C: [
    { name: 'Fondos en paralelas asistidos + Curl concentrado en banco', reps: '10 reps c/u', desc: 'Control neuromuscular y bombeo de brazos.' }
  ]
};

const gluteD3_ex1 = {
  A: [
    { name: 'Kas Glute Bridge con mancuerna', reps: '12 reps', desc: 'Recorrido corto concentrado en la contracción pico del glúteo.' },
    { name: 'Puente de glúteos en suelo con mancuerna pesada', reps: '15 reps', desc: 'Aprieta 2 segundos arriba en cada repetición.' }
  ],
  B: [
    { name: 'Kas Glute Bridge con barra acolchada', reps: '10-12 reps', desc: 'Pausa de 1 segundo en retroversión pélvica arriba.' },
    { name: 'Hip thrust en máquina Smith', reps: '10 reps', desc: 'Carga estable con foco absoluto en contracción de glúteos.' }
  ],
  C: [
    { name: 'Kas Glute Bridge pesado con barra (1.5 reps)', reps: '10 reps', desc: 'Sube completo, baja hasta la mitad, vuelve a subir y baja completo = 1 rep.' },
    { name: 'Kas Glute Bridge pesado con banda de resistencia', reps: '10-12 reps', desc: 'La banda genera activación simultánea de glúteo medio y mayor.' }
  ]
};

const gluteD3_ex2 = {
  A: [
    { name: 'Sentadilla Goblet profunda con mancuerna', reps: '10 reps', desc: 'Baja rompiendo el paralelo manteniendo el torso erguido.' },
    { name: 'Prensa de piernas con pies altos', reps: '12 reps', desc: 'Pies en parte superior para involucrar glúteos y femorales.' }
  ],
  B: [
    { name: 'Prensa inclinada con pies altos y abiertos (enfoque glúteo)', reps: '10-12 reps', desc: 'Empuja desde los talones con flexión profunda de cadera.' },
    { name: 'Sentadilla trasera con barra (profunda)', reps: '8-10 reps', desc: 'Baja controlado sintiendo el estiramiento en glúteos y cuádriceps.' }
  ],
  C: [
    { name: 'Prensa pesada con pies altos y pausa abajo de 1s', reps: '8-10 reps', desc: 'Máxima activación del glúteo mayor y aductores sin rebote.' },
    { name: 'Sentadilla Hack profunda con pies adelantados', reps: '8-10 reps', desc: 'Permite flexión profunda de cadera protegiendo la columna.' }
  ]
};

const gluteD3_ex3 = {
  A: [
    { name: 'Patada de glúteo en polea a 30°', reps: '12-15 reps por lado', desc: 'Patea en diagonal hacia afuera sintiendo el glúteo superior.' },
    { name: 'Patada de glúteo en cuatro apoyos con tobillera', reps: '15 reps por lado', desc: 'Empuja la planta del pie hacia el techo.' }
  ],
  B: [
    { name: 'Patada de glúteo en polea baja (pesada)', reps: '12 reps por lado', desc: 'Contracción sostenida de 1 segundo en el punto más alto.' },
    { name: 'Patada de glúteo en máquina multicadera', reps: '12 reps por lado', desc: 'Movimiento guiado con sobrecarga aislada.' }
  ],
  C: [
    { name: 'Patada de glúteo en polea con bajada lenta de 3s', reps: '10-12 reps por lado', desc: 'Resiste el tirón del cable controlando el descenso.' },
    { name: 'Patada de glúteo en polea a 30° (Drop-set final)', reps: '10 + 8 reps por lado', desc: 'Agotamiento completo de las fibras del glúteo superior.' }
  ]
};

const gluteD3_ex4 = {
  A: [
    { name: 'Step-Up controlado en caja para glúteo', reps: '10 reps por pierna', desc: 'Torso a 30° adelante, no te impulses con el pie de abajo.' },
    { name: 'Zancadas estáticas con mancuernas ligeras', reps: '10 reps por pierna', desc: 'Baja con control manteniendo el torso levemente inclinado.' }
  ],
  B: [
    { name: 'Step-Up con mancuernas en banco', reps: '10-12 reps por pierna', desc: 'Desciende en 3 segundos rozando apenas el piso con el talón.' },
    { name: 'Zancadas caminando con mancuernas', reps: '12 pasos por pierna', desc: 'Pasos largos para mayor ángulo de flexión de cadera.' }
  ],
  C: [
    { name: 'Step-Up pesado con mancuernas en caja alta', reps: '8-10 reps por pierna', desc: 'Máxima exigencia de fuerza unipodal y estabilidad pélvica.' },
    { name: 'Zancadas búlgaras excéntricas lentas (enfoque glúteo)', reps: '8 reps por pierna', desc: 'Bajada de 4 segundos sintiendo el estiramiento máximo del glúteo.' }
  ]
};

const gluteD3_ex5 = {
  A: [
    { name: 'Crunch abdominal con pies elevados', reps: '15 reps', desc: 'Enfoca la contracción del abdomen superior.' },
    { name: 'Plancha lateral estática', reps: '30s por lado', desc: 'Mantén la cadera alta y el core alineado.' }
  ],
  B: [
    { name: 'Elevación de piernas acostado (Leg raises)', reps: '15 reps', desc: 'Controla el descenso usando la fuerza del abdomen bajo.' },
    { name: 'Giros rusos con mancuerna ligera', reps: '20 giros alternos', desc: 'Rotación controlada para estilizar la cintura.' }
  ],
  C: [
    { name: 'Elevación de piernas colgado en barra', reps: '12-15 reps', desc: 'Rango estricto sin balanceo del cuerpo.' },
    { name: 'Abdominales en polea alta con cuerda', reps: '15 reps', desc: 'Contracción contra resistencia añadida.' }
  ]
};

const gluteD4_ex1 = {
  A: [
    { name: 'Remo con mancuernas a una mano en banco', reps: '10 reps por lado', desc: 'Lleva el codo hacia el bolsillo de la cadera.' },
    { name: 'Remo bajo en polea con agarre estrecho', reps: '12 reps', desc: 'Aprieta la espalda media atrás en cada rep.' }
  ],
  B: [
    { name: 'Remo en barra T con apoyo en pecho', reps: '10 reps', desc: 'Mantén la retracción escapular durante todo el rango.' },
    { name: 'Remo con barra agarre prono', reps: '8-10 reps', desc: 'Torso a 45 grados, jala hacia el ombligo.' }
  ],
  C: [
    { name: 'Remo Meadows con barra T unilateral', reps: '8-10 reps por lado', desc: 'Gran sobrecarga en dorsal y deltoides posterior.' },
    { name: 'Remo unilateral en polea con rotación de torso', reps: '10 reps por lado', desc: 'Estiramiento profundo y máxima contracción escapular.' }
  ]
};

const gluteD4_ex2 = {
  A: [
    { name: 'Press inclinado con mancuernas liviano (30°)', reps: '12 reps', desc: 'Desarrollo armónico de la clavícula y torso alto.' },
    { name: 'Aperturas inclinadas con mancuernas', reps: '12 reps', desc: 'Siente el estiramiento en la porción superior del pecho.' }
  ],
  B: [
    { name: 'Press de pecho inclinado en máquina', reps: '10-12 reps', desc: 'Empuje suave y controlado.' },
    { name: 'Press superior inclinado con mancuernas', reps: '10 reps', desc: 'Rango completo sin arquear la espalda.' }
  ],
  C: [
    { name: 'Press inclinado con mancuernas con pausa abajo', reps: '8 reps', desc: 'Pausa de 1 segundo en el estiramiento.' },
    { name: 'Cruces en polea alta hacia abajo', reps: '12-15 reps', desc: 'Aislamiento continuo para tonificación del pecho.' }
  ]
};

const gluteD4_ex3 = {
  A: [
    { name: 'Hiperextensión a 45° con espalda curvada (enfoque glúteo)', reps: '15 reps', desc: 'Curva la espalda en C y aprieta solo con los glúteos.' },
    { name: 'Puente de glúteos con elevación unilateral (Single-leg)', reps: '10 reps por pierna', desc: 'Eleva la pelvis manteniendo niveladas las caderas.' }
  ],
  B: [
    { name: 'Hiperextensión a 45° con disco abrazado al pecho', reps: '12 reps', desc: 'Añade peso sin perder la flexión dorsal de la columna.' },
    { name: 'Hiperextensión a 45° con mancuernas colgando', reps: '12 reps', desc: 'Enfoca la extensión pura desde las caderas.' }
  ],
  C: [
    { name: 'Hiperextensión a 45° pesada con pausa arriba de 2s', reps: '10-12 reps', desc: 'Contracción isométrica extrema de glúteos arriba.' },
    { name: 'Hiperextensión a 45° con barra en espalda', reps: '10 reps', desc: 'Sobrecarga avanzada manteniendo la barbilla al pecho.' }
  ]
};

const gluteD4_ex4 = {
  A: [
    { name: 'Abducción en polea baja con tobillera', reps: '15 reps por pierna', desc: 'Cruza el pie por delante antes de abrir.' },
    { name: 'Abducción con banda elástica de pie', reps: '20 reps por pierna', desc: 'Quemazón de altas repeticiones en glúteo medio.' }
  ],
  B: [
    { name: 'Abducción de cadera en máquina a 30°', reps: '15 reps con pausa', desc: 'Foco en quemazón y volumen del glúteo medio.' },
    { name: 'Paseo del monstruo con banda en rodillas y tobillos', reps: '15 pasos por lado', desc: 'Tensión constante en abductores y rotadores externos.' }
  ],
  C: [
    { name: 'Abducción en máquina drop-set mecánico', reps: '15 reps inclinado + 10 erguido', desc: 'Agotamiento completo de todos los ángulos del glúteo medio.' },
    { name: 'Abducción pesada en polea a 30° con pausa de 1s', reps: '12 reps por lado', desc: 'Máxima tensión en el glúteo medio superior.' }
  ]
};

const gluteD4_ex5 = {
  A: [
    { name: 'Plancha lateral estática', reps: '30s por lado', desc: 'Fortalece oblicuos y estiliza la cintura.' },
    { name: 'Abdominales muertos (Dead bug)', reps: '12 reps alternas', desc: 'Estabilidad de columna y core profundo.' }
  ],
  B: [
    { name: 'Giros rusos con peso (Russian twists)', reps: '20 giros alternos', desc: 'Trabajo dinámico de cintura y oblicuos.' },
    { name: 'Plancha isométrica con elevación de talón alternada', reps: '40 segundos', desc: 'Activa glúteos y core simultáneamente.' }
  ],
  C: [
    { name: 'Rueda abdominal (Ab wheel rollouts)', reps: '12 reps', desc: 'Extensión completa manteniendo pelvis neutra.' },
    { name: 'Plancha lateral con elevación de pierna (Star plank)', reps: '25s por lado', desc: 'Recluta glúteo medio y oblicuos en máxima dificultad.' }
  ]
};

// --- DÍA 5 POOLS (Estándar: Pierna & Glúteos Hipertrofia / Bombeo) ---
const day5_ex1 = {
  A: [
    { name: 'Prensa de piernas inclinada a 45°', reps: '10-12 reps', desc: 'Pies en el centro de la plataforma con rango completo.' },
    { name: 'Sentadilla en máquina Hack', reps: '10 reps', desc: 'Desciende controlado sintiendo el estiramiento de cuádriceps.' }
  ],
  B: [
    { name: 'Sentadilla Hack pesada en máquina', reps: '8-10 reps', desc: 'Baja a 90° sin despegar la pelvis del respaldo.' },
    { name: 'Prensa inclinada con pies medios', reps: '10 reps', desc: 'Carga progresiva, cadencia 2 segundos de bajada.' }
  ],
  C: [
    { name: 'Sentadilla Hack pesada (pausa 1s abajo)', reps: '6-8 reps', desc: 'Pausa en máxima flexión de rodilla eliminando el rebote.' },
    { name: 'Sentadilla frontal con barra', reps: '6-8 reps', desc: 'Torso vertical, codos altos y máxima demanda de cuádriceps.' }
  ]
};

const day5_ex2 = {
  A: [
    { name: 'Extensiones de cuádriceps en máquina', reps: '12-15 reps', desc: 'Contracción de 1 segundo arriba en horizontal.' },
    { name: 'Sentadilla búlgara con mancuernas (enfoque cuádriceps)', reps: '10 reps por pierna', desc: 'Torso vertical con avance de rodilla delantera.' }
  ],
  B: [
    { name: 'Extensiones de cuádriceps pesadas', reps: '10-12 reps', desc: 'Bajada en 3 segundos excéntricos lentos.' },
    { name: 'Zancadas caminando con mancuernas', reps: '12 pasos por pierna', desc: 'Paso fluido continuo manteniendo el tronco firme.' }
  ],
  C: [
    { name: 'Extensiones de cuádriceps (Drop-set final)', reps: '10 + 10 reps', desc: 'Haz 10 reps pesadas, reduce el 30% del peso y saca 10 más al fallo.' },
    { name: 'Sentadilla Sissy con peso corporal o disco', reps: '10-12 reps', desc: 'Estiramiento extremo del recto anterior del cuádriceps.' }
  ]
};

const day5_ex3 = {
  A: [
    { name: 'Curl femoral sentado en máquina', reps: '12 reps', desc: 'Torso inclinado adelante para mayor estiramiento isquiotibial.' },
    { name: 'Curl femoral tumbado con mancuerna', reps: '10 reps', desc: 'Sujeta una mancuerna entre los pies y sube controlado.' }
  ],
  B: [
    { name: 'Curl femoral tumbado en máquina', reps: '10-12 reps', desc: 'Aprieta la pelvis contra el cojín para no arquear la lumbar.' },
    { name: 'Peso muerto rumano con mancuernas', reps: '10 reps', desc: 'Bisagra profunda sintiendo la tensión en la cadena posterior.' }
  ],
  C: [
    { name: 'Curl femoral tumbado con pausa excéntrica', reps: '8-10 reps', desc: 'Aguanta 2 segundos en la bajada resistiendo el peso.' },
    { name: 'Curl nórdico excéntrico asistido', reps: '6-8 reps', desc: 'Baja lo más lento posible usando las manos para frenar suave.' }
  ]
};

const day5_ex4 = {
  A: [
    { name: 'Hip thrust con mancuerna en banco', reps: '12 reps', desc: 'Extiende completamente la cadera y aprieta 1 segundo.' },
    { name: 'Puente de glúteos en suelo con peso', reps: '15 reps', desc: 'Pies planos, empuja a través de los talones.' }
  ],
  B: [
    { name: 'Hip thrust con barra', reps: '10-12 reps', desc: 'Mirada al frente, barbilla pegada al pecho en la cima.' },
    { name: 'Patada de glúteo en polea baja', reps: '12 reps por pierna', desc: 'Movimiento limpio sin balanceo del tronco.' }
  ],
  C: [
    { name: 'Hip thrust pesado con barra (Drop-set)', reps: '8 + 6 reps', desc: 'Sobrecarga de tensión mecánica para finalizar glúteos.' },
    { name: 'Hiperextensión a 45° con espalda curvada', reps: '12-15 reps', desc: 'Enfoca todo el esfuerzo en los glúteos redondeando la parte alta.' }
  ]
};

const day5_ex5 = {
  A: [
    { name: 'Elevación de talones de pie en máquina', reps: '15 reps', desc: 'Sube hasta la contracción completa de las pantorrillas.' },
    { name: 'Plancha abdominal isométrica', reps: '30-45 seg', desc: 'Core apretado en línea recta.' }
  ],
  B: [
    { name: 'Elevación de talones en prensa', reps: '12-15 reps', desc: 'Estira al máximo abajo antes de empujar con el metatarso.' },
    { name: 'Rueda abdominal (Ab rollout)', reps: '10-12 reps', desc: 'Extiende el tronco sin curvar la espalda baja.' }
  ],
  C: [
    { name: 'Elevación de talones tipo burro o Smith pesado', reps: '10-12 reps', desc: 'Pausa de 2 segundos en el estiramiento profundo.' },
    { name: 'Elevaciones de piernas colgado en barra', reps: '12-15 reps', desc: 'Lleva las rodillas o puntas hacia el pecho sin inercia.' }
  ]
};

// --- DÍA 5 POOLS (Énfasis Glúteos: Aislamiento & Bombeo Máximo) ---
const gluteD5_ex1 = {
  A: [
    { name: 'Kas Glute Bridge con mancuerna', reps: '12 reps', desc: 'Rango corto en el tercio superior apretando al máximo.' },
    { name: 'Puente de glúteos con banda elástica', reps: '15-20 reps', desc: 'Tensión lateral continua con rodillas abiertas.' }
  ],
  B: [
    { name: 'Kas Glute Bridge con barra pesada', reps: '10-12 reps', desc: 'Espinillas verticales estáticas, cadencia pausada.' },
    { name: 'Hip thrust en máquina Smith', reps: '10-12 reps', desc: 'Tensión constante sin necesidad de balancear la barra.' }
  ],
  C: [
    { name: 'Kas Glute Bridge pesado con barra (Drop-set)', reps: '10 + 8 reps', desc: 'Carga pesada seguida de bombeo continuo al fallo.' },
    { name: 'Hip thrust unilateral con mancuerna (B-Stance)', reps: '8-10 reps por pierna', desc: 'Aísla cada glúteo eliminando cualquier asimetría.' }
  ]
};

const gluteD5_ex2 = {
  A: [
    { name: 'Hiperextensión a 45° con peso corporal (espalda curva)', reps: '15 reps', desc: 'Pies a 45° afuera, espalda alta curvada para anular erectores y activar glúteos.' },
    { name: 'Frog pumps con mancuerna en la pelvis', reps: '20 reps', desc: 'Junta las plantas de los pies y eleva la cadera rápidamente.' }
  ],
  B: [
    { name: 'Hiperextensión a 45° con disco en el pecho', reps: '12-15 reps', desc: 'Sube únicamente contrayendo los glúteos, no la columna lumbar.' },
    { name: 'Frog pumps pesados con mancuerna', reps: '15-20 reps', desc: 'Máxima congestión y bombeo en glúteo mayor y medio.' }
  ],
  C: [
    { name: 'Hiperextensión a 45° pesada con mancuerna o barra', reps: '10-12 reps (pausa 1s arriba)', desc: 'Pausa isométrica arriba exprimiendo el glúteo.' },
    { name: 'Hiperextensión unilateral a 45°', reps: '10 reps por pierna', desc: 'Estímulo unilateral intenso sin sobrecarga en la columna.' }
  ]
};

const gluteD5_ex3 = {
  A: [
    { name: 'Patada de glúteo en polea baja a 30°', reps: '12-15 reps por pierna', desc: 'Patea diagonal afuera siguiendo las fibras del glúteo mayor.' },
    { name: 'Patada de glúteo en cuadrupedia con mancuerna', reps: '15 reps por pierna', desc: 'Mancuerna detrás de la rodilla, sube hasta la horizontal.' }
  ],
  B: [
    { name: 'Patada de glúteo en polea con pausa de 1s', reps: '12 reps por pierna', desc: 'Congela 1 segundo la contracción en la cima.' },
    { name: 'Patada de glúteo en máquina multicadera', reps: '12 reps por pierna', desc: 'Aislamiento estricto de la extensión de cadera.' }
  ],
  C: [
    { name: 'Patada de glúteo en polea pesada a 30° (Drop-set)', reps: '10 + 8 reps', desc: 'Agotamiento completo de las fibras superiores del glúteo.' },
    { name: 'Patada en polea con inclinación pronunciada', reps: '12 reps por lado', desc: 'Mayor elongación en el punto de partida.' }
  ]
};

const gluteD5_ex4 = {
  A: [
    { name: 'Abducción de cadera en máquina inclinada a 30°', reps: '15-20 reps', desc: 'Torso hacia adelante para reclutar las fibras medias del glúteo.' },
    { name: 'Abducción lateral con banda elástica caminando', reps: '15 pasos por lado', desc: 'Pasos en posición de media sentadilla manteniendo la banda tensa.' }
  ],
  B: [
    { name: 'Abducción de cadera en máquina (Drop-set triple)', reps: '12 + 10 + 10 reps', desc: 'Bombeo metabólico extremo para redondear el glúteo lateral.' },
    { name: 'Abducción en polea baja con tobillera', reps: '12 reps por pierna', desc: 'Control excéntrico de 3 segundos al regresar.' }
  ],
  C: [
    { name: 'Abducción en máquina con pausa de 2s en apertura', reps: '12 reps', desc: 'Apertura máxima sostenida 2 segundos en cada repetición.' },
    { name: 'Abducción en polea con elevación lateral sostenida', reps: '12 reps por pierna', desc: 'Tensión continua sin apoyo entre repeticiones.' }
  ]
};

const gluteD5_ex5 = {
  A: [
    { name: 'Plancha abdominal con toque de hombro', reps: '16 toques totales', desc: 'Evita balancear la cadera manteniendo el core firme.' },
    { name: 'Elevación de pelvis en suelo a una pierna', reps: '12 reps por pierna', desc: 'Equilibrio y activación profunda sin peso añadido.' }
  ],
  B: [
    { name: 'Elevaciones de piernas en suelo o banco', reps: '15 reps', desc: 'Espalda baja pegada a la colchoneta sin arquearse.' },
    { name: 'Plancha lateral con elevación de pierna (Star plank)', reps: '10 reps por lado', desc: 'Combina core oblicuo con glúteo medio estabilizador.' }
  ],
  C: [
    { name: 'Rueda abdominal (Ab wheel)', reps: '12 reps', desc: 'Control de la tensión en todo el recorrido.' },
    { name: 'Elevación de rodillas colgado en barra', reps: '15 reps', desc: 'Movimiento estricto sin usar balanceo inercial.' }
  ]
};

// Permite sustituir un ejercicio individual en el gimnasio manteniendo el resto de la rutina de 2 meses intacta
export const getAlternativeWeeklyExercises = (
  dayId: number, 
  exerciseIndex: number, 
  level: Level, 
  focus: RoutineFocus = 'standard',
  daysCount: 3 | 4 | 5 = 4
): WeeklyExercise[] => {
  if (focus === 'glutes') {
    const gluteMap: Record<number, Record<number, { cat: string; sets: number; items: { name: string; reps: string; desc: string }[] }>> = {
      1: {
        0: { cat: 'Glúteo Mayor (Fuerza / Acortamiento)', sets: 4, items: gluteD1_ex1[level] },
        1: { cat: 'Bisagra de Cadera (Fuerza / Elongación)', sets: 4, items: gluteD1_ex2[level] },
        2: { cat: 'Unilateral Glúteo (Tensión Mecánica)', sets: 3, items: gluteD1_ex3[level] },
        3: { cat: 'Aislamiento Glúteo Medio', sets: 4, items: gluteD1_ex4[level] },
        4: { cat: 'Core / Anti-extensión', sets: 3, items: gluteD1_ex5[level] }
      },
      2: {
        0: { cat: 'Hombros / Deltoides Estético', sets: 4, items: gluteD2_ex1[level] },
        1: { cat: 'Tracción Vertical / Espalda', sets: 4, items: gluteD2_ex2[level] },
        2: { cat: 'Deltoides Lateral', sets: 4, items: gluteD2_ex3[level] },
        3: { cat: 'Tracción Horizontal / Remos', sets: 3, items: gluteD2_ex4[level] },
        4: { cat: 'Brazos (Tono & Definición)', sets: 3, items: gluteD2_ex5[level] }
      },
      3: {
        0: { cat: 'Empuje Pélvico Continuo (Hipertrofia)', sets: 4, items: gluteD3_ex1[level] },
        1: { cat: 'Empuje Pierna / Flexión Profunda', sets: 4, items: gluteD3_ex2[level] },
        2: { cat: 'Glúteo Superior en Polea (Aislamiento)', sets: 3, items: gluteD3_ex3[level] },
        3: { cat: 'Unilateral / Elevación en Caja', sets: 3, items: gluteD3_ex4[level] },
        4: { cat: 'Abdomen / Cintura', sets: 3, items: gluteD3_ex5[level] }
      },
      4: {
        0: { cat: 'Espalda / Tracción Horizontal', sets: 4, items: gluteD4_ex1[level] },
        1: { cat: 'Empuje Inclinado Suave', sets: 3, items: gluteD4_ex2[level] },
        2: { cat: 'Glúteo Mayor en Pivote (Hiperextensión)', sets: 4, items: gluteD4_ex3[level] },
        3: { cat: 'Glúteo Medio en Polea / Máquina', sets: 4, items: gluteD4_ex4[level] },
        4: { cat: 'Core & Oblicuos', sets: 3, items: gluteD4_ex5[level] }
      },
      5: {
        0: { cat: 'Kas Glute Bridge / Aislamiento Pélvico', sets: 4, items: gluteD5_ex1[level] },
        1: { cat: 'Hiperextensión a 45° / Bombeo Cadera', sets: 4, items: gluteD5_ex2[level] },
        2: { cat: 'Patada de Glúteo en Polea / Máquina', sets: 3, items: gluteD5_ex3[level] },
        3: { cat: 'Abducción de Cadera / Glúteo Medio', sets: 4, items: gluteD5_ex4[level] },
        4: { cat: 'Core & Glúteo Estabilizador', sets: 3, items: gluteD5_ex5[level] }
      }
    };

    const slot = gluteMap[dayId]?.[exerciseIndex];
    if (!slot) return [];

    return slot.items.map((item) => ({
      category: slot.cat,
      name: item.name,
      defaultSets: slot.sets,
      defaultReps: item.reps,
      description: item.desc
    }));
  }

  if (daysCount === 3) {
    const fullBody3Map: Record<number, Record<number, { cat: string; sets: number; items: { name: string; reps: string; desc: string }[] }>> = {
      1: {
        0: { cat: 'Dominante de Rodilla / Sentadilla', sets: 3, items: day2_ex1[level] },
        1: { cat: 'Empuje Horizontal (Pecho)', sets: 3, items: day1_ex1[level] },
        2: { cat: 'Tracción Horizontal (Espalda)', sets: 3, items: day1_ex2[level] },
        3: { cat: 'Bisagra de Cadera (Isquios/Glúteo)', sets: 3, items: day2_ex2[level] },
        4: { cat: 'Core / Abdomen Estable', sets: 3, items: day2_ex5[level] }
      },
      2: {
        0: { cat: 'Piernas / Unilateral (Prensa/Zancada)', sets: 3, items: day4_ex1[level] },
        1: { cat: 'Empuje Vertical (Hombros)', sets: 3, items: day1_ex3[level] },
        2: { cat: 'Tracción Vertical (Dorsales)', sets: 3, items: day1_ex4[level] },
        3: { cat: 'Hip Thrust / Glúteos', sets: 3, items: day4_ex2[level] },
        4: { cat: 'Brazos (Superserie Bíceps/Tríceps)', sets: 2, items: day1_ex5 }
      },
      3: {
        0: { cat: 'Peso Muerto (Fuerza Posterior)', sets: 3, items: day2_ex2[level] },
        1: { cat: 'Press Inclinado (Pectoral Superior)', sets: 3, items: day3_ex1[level] },
        2: { cat: 'Remo en Polea / Máquina', sets: 3, items: day3_ex2[level] },
        3: { cat: 'Aislamiento Pierna (Femoral/Cuádriceps)', sets: 3, items: day4_ex3[level] },
        4: { cat: 'Pantorrillas & Core', sets: 3, items: day4_ex4[level] }
      }
    };
    const fbSlot = fullBody3Map[dayId]?.[exerciseIndex];
    if (fbSlot) {
      return fbSlot.items.map((item) => ({
        category: fbSlot.cat,
        name: item.name,
        defaultSets: fbSlot.sets,
        defaultReps: item.reps,
        description: item.desc
      }));
    }
  }

  const map: Record<number, Record<number, { cat: string; sets: number; items: { name: string; reps: string; desc: string }[] }>> = {
    1: {
      0: { cat: 'Empuje Horizontal (Fuerza)', sets: 4, items: day1_ex1[level] },
      1: { cat: 'Tracción Horizontal (Fuerza)', sets: 4, items: day1_ex2[level] },
      2: { cat: 'Empuje Vertical', sets: 3, items: day1_ex3[level] },
      3: { cat: 'Tracción Vertical', sets: 3, items: day1_ex4[level] },
      4: { cat: 'Brazos (Superserie)', sets: 3, items: day1_ex5 }
    },
    2: {
      0: { cat: 'Dominante de Rodilla (Fuerza)', sets: 4, items: day2_ex1[level] },
      1: { cat: 'Bisagra de Cadera (Fuerza)', sets: 4, items: day2_ex2[level] },
      2: { cat: 'Empuje Pierna Secundario', sets: 3, items: day2_ex3[level] },
      3: { cat: 'Pantorrillas (Fuerza)', sets: 4, items: day2_ex4[level] },
      4: { cat: 'Abdomen / Core', sets: 3, items: day2_ex5[level] }
    },
    3: {
      0: { cat: 'Empuje Inclinado', sets: 4, items: day3_ex1[level] },
      1: { cat: 'Tracción Horizontal Polea', sets: 4, items: day3_ex2[level] },
      2: { cat: 'Empuje Aislamiento', sets: 3, items: day3_ex3[level] },
      3: { cat: 'Hombro Lateral', sets: 4, items: day3_ex4[level] },
      4: { cat: 'Brazos (Superserie)', sets: 3, items: day3_ex5[level] }
    },
    4: {
      0: { cat: 'Unilateral / Fuerza-Hipertrofia', sets: 3, items: day4_ex1[level] },
      1: { cat: 'Aislamiento Cuádriceps', sets: 3, items: day4_ex2[level] },
      2: { cat: 'Aislamiento Isquiotibiales', sets: 3, items: day4_ex3[level] },
      3: { cat: 'Pantorrillas Sentado', sets: 4, items: day4_ex4[level] },
      4: { cat: 'Abdomen de Elección', sets: 3, items: day4_ex5[level] }
    },
    5: {
      0: { cat: 'Prensa / Sentadilla Máquina (Cuádriceps)', sets: 4, items: day5_ex1[level] },
      1: { cat: 'Aislamiento Cuádriceps (Extensión/Búlgara)', sets: 3, items: day5_ex2[level] },
      2: { cat: 'Aislamiento Isquios (Curl Femoral)', sets: 3, items: day5_ex3[level] },
      3: { cat: 'Hip Thrust / Glúteos Bombeo', sets: 4, items: day5_ex4[level] },
      4: { cat: 'Pantorrillas & Core Bombeo', sets: 3, items: day5_ex5[level] }
    }
  };

  const slot = map[dayId]?.[exerciseIndex];
  if (!slot) return [];

  return slot.items.map((item) => ({
    category: slot.cat,
    name: item.name,
    defaultSets: slot.sets,
    defaultReps: item.reps,
    description: item.desc
  }));
};

export const generateWeeklyRoutine = (
  level: Level, 
  focus: RoutineFocus = 'standard',
  daysCount: 3 | 4 | 5 = 4
): WeeklyRoutine => {
  if (focus === 'glutes') {
    const eg1_1 = pickRandom(gluteD1_ex1[level]);
    const eg1_2 = pickRandom(gluteD1_ex2[level]);
    const eg1_3 = pickRandom(gluteD1_ex3[level]);
    const eg1_4 = pickRandom(gluteD1_ex4[level]);
    const eg1_5 = pickRandom(gluteD1_ex5[level]);

    const eg2_1 = pickRandom(gluteD2_ex1[level]);
    const eg2_2 = pickRandom(gluteD2_ex2[level]);
    const eg2_3 = pickRandom(gluteD2_ex3[level]);
    const eg2_4 = pickRandom(gluteD2_ex4[level]);
    const eg2_5 = pickRandom(gluteD2_ex5[level]);

    const eg3_1 = pickRandom(gluteD3_ex1[level]);
    const eg3_2 = pickRandom(gluteD3_ex2[level]);
    const eg3_3 = pickRandom(gluteD3_ex3[level]);
    const eg3_4 = pickRandom(gluteD3_ex4[level]);
    const eg3_5 = pickRandom(gluteD3_ex5[level]);

    const eg4_1 = pickRandom(gluteD4_ex1[level]);
    const eg4_2 = pickRandom(gluteD4_ex2[level]);
    const eg4_3 = pickRandom(gluteD4_ex3[level]);
    const eg4_4 = pickRandom(gluteD4_ex4[level]);
    const eg4_5 = pickRandom(gluteD4_ex5[level]);

    const gluteRoutine: WeeklyRoutine = {
      1: {
        id: 1,
        name: 'Día 1: Glúteos & Isquios (Fuerza)',
        subtitle: 'Sobrecarga mecánica pesada y tensión en máxima contracción y elongación',
        category: 'gluteos_fuerza',
        exercises: [
          {
            category: 'Glúteo Mayor (Fuerza / Acortamiento)',
            name: eg1_1.name,
            defaultSets: 4,
            defaultReps: eg1_1.reps,
            description: eg1_1.desc
          },
          {
            category: 'Bisagra de Cadera (Fuerza / Elongación)',
            name: eg1_2.name,
            defaultSets: 4,
            defaultReps: eg1_2.reps,
            description: eg1_2.desc
          },
          {
            category: 'Unilateral Glúteo (Tensión Mecánica)',
            name: eg1_3.name,
            defaultSets: 3,
            defaultReps: eg1_3.reps,
            description: eg1_3.desc
          },
          {
            category: 'Aislamiento Glúteo Medio',
            name: eg1_4.name,
            defaultSets: 4,
            defaultReps: eg1_4.reps,
            description: eg1_4.desc
          },
          {
            category: 'Core / Anti-extensión',
            name: eg1_5.name,
            defaultSets: 3,
            defaultReps: eg1_5.reps,
            description: eg1_5.desc
          }
        ],
        amrapComplementary: {
          name: 'AMRAP Complementario: Burnout Glúteos & Isquios',
          durationMinutes: 5,
          exercises: ['12 Puentes de glúteo con salto o explosivos', '15 Abducciones con banda elástica', '10 Zancadas de reverencia alternas'],
          instructions: 'Bombeo metabólico final para agotar las reservas de glucógeno en glúteos y femorales.'
        },
        amrapActivator: {
          name: 'AMRAP Activador: Conexión Neuromuscular de Cadera',
          durationMinutes: 5,
          exercises: ['10 Puentes de glúteo dinámicos', '8 Rotaciones 90/90 de cadera', '12 Patadas de hidrante (Fire hydrants)'],
          instructions: 'Despierta el glúteo medio y mayor antes de iniciar las series pesadas.'
        }
      },
      2: {
        id: 2,
        name: 'Día 2: Torso Estético & Hombros / Espalda',
        subtitle: 'Desarrollo armónico de tren superior para acentuar la proporción atlética',
        category: 'torso_estetico',
        exercises: [
          {
            category: 'Hombros / Deltoides Estético',
            name: eg2_1.name,
            defaultSets: 4,
            defaultReps: eg2_1.reps,
            description: eg2_1.desc
          },
          {
            category: 'Tracción Vertical / Espalda',
            name: eg2_2.name,
            defaultSets: 4,
            defaultReps: eg2_2.reps,
            description: eg2_2.desc
          },
          {
            category: 'Deltoides Lateral',
            name: eg2_3.name,
            defaultSets: 4,
            defaultReps: eg2_3.reps,
            description: eg2_3.desc
          },
          {
            category: 'Tracción Horizontal / Remos',
            name: eg2_4.name,
            defaultSets: 3,
            defaultReps: eg2_4.reps,
            description: eg2_4.desc
          },
          {
            category: 'Brazos (Tono & Definición)',
            name: eg2_5.name,
            defaultSets: 3,
            defaultReps: eg2_5.reps,
            description: eg2_5.desc
          }
        ],
        amrapComplementary: {
          name: 'AMRAP Complementario: Escultura de Hombros y Espalda',
          durationMinutes: 5,
          exercises: ['12 Elevaciones frontales livianas', '15 Face pulls con banda o polea', '10 Planchas altas con toque de hombros'],
          instructions: 'Agotamiento estético de la porción superior del cuerpo.'
        },
        amrapActivator: {
          name: 'AMRAP Activador: Movilidad y Apertura Escapular',
          durationMinutes: 5,
          exercises: ['12 Flexiones escapulares', '8 Rotaciones torácicas en cuadrupedia', '10 Estiramientos de pecho dinámicos'],
          instructions: 'Prepara las articulaciones glenohumerales para los empujes y tracciones.'
        }
      },
      3: {
        id: 3,
        name: 'Día 3: Glúteos & Cuádriceps (Hipertrofia)',
        subtitle: 'Volumen moderado-alto, tensión continua y estimulación sarcoplásmica',
        category: 'gluteos_hipertrofia',
        exercises: [
          {
            category: 'Empuje Pélvico Continuo (Hipertrofia)',
            name: eg3_1.name,
            defaultSets: 4,
            defaultReps: eg3_1.reps,
            description: eg3_1.desc
          },
          {
            category: 'Empuje Pierna / Flexión Profunda',
            name: eg3_2.name,
            defaultSets: 4,
            defaultReps: eg3_2.reps,
            description: eg3_2.desc
          },
          {
            category: 'Glúteo Superior en Polea (Aislamiento)',
            name: eg3_3.name,
            defaultSets: 3,
            defaultReps: eg3_3.reps,
            description: eg3_3.desc
          },
          {
            category: 'Unilateral / Elevación en Caja',
            name: eg3_4.name,
            defaultSets: 3,
            defaultReps: eg3_4.reps,
            description: eg3_4.desc
          },
          {
            category: 'Abdomen / Cintura',
            name: eg3_5.name,
            defaultSets: 3,
            defaultReps: eg3_5.reps,
            description: eg3_5.desc
          }
        ],
        amrapComplementary: {
          name: 'AMRAP Complementario: Quemador Metabólico Glúteos & Piernas',
          durationMinutes: 5,
          exercises: ['15 Sentadillas sumo peso corporal', '12 Patadas de glúteo continuas', '20 Escaladores lentos'],
          instructions: 'Quema metabólica para maximizar el flujo sanguíneo y recuperación muscular.'
        },
        amrapActivator: {
          name: 'AMRAP Activador: Activación de Tobillo y Cadera',
          durationMinutes: 5,
          exercises: ['8 Desplantes de cosaco laterales', '10 Sentadillas profundas sostenidas', '12 Elevaciones pélvicas en suelo'],
          instructions: 'Aumenta la dorsiflexión de tobillo para sentadillas profundas sin despegar talones.'
        }
      },
      4: {
        id: 4,
        name: 'Día 4: Espalda, Core & Aislamiento Glúteo',
        subtitle: 'Definición de espalda alta, cintura compacta y remate de glúteo medio',
        category: 'espalda_gluteos',
        exercises: [
          {
            category: 'Espalda / Tracción Horizontal',
            name: eg4_1.name,
            defaultSets: 4,
            defaultReps: eg4_1.reps,
            description: eg4_1.desc
          },
          {
            category: 'Empuje Inclinado Suave',
            name: eg4_2.name,
            defaultSets: 3,
            defaultReps: eg4_2.reps,
            description: eg4_2.desc
          },
          {
            category: 'Glúteo Mayor en Pivote (Hiperextensión)',
            name: eg4_3.name,
            defaultSets: 4,
            defaultReps: eg4_3.reps,
            description: eg4_3.desc
          },
          {
            category: 'Glúteo Medio en Polea / Máquina',
            name: eg4_4.name,
            defaultSets: 4,
            defaultReps: eg4_4.reps,
            description: eg4_4.desc
          },
          {
            category: 'Core & Oblicuos',
            name: eg4_5.name,
            defaultSets: 3,
            defaultReps: eg4_5.reps,
            description: eg4_5.desc
          }
        ],
        amrapComplementary: {
          name: 'AMRAP Complementario: Quema Final de Glúteo y Cintura',
          durationMinutes: 5,
          exercises: ['15 Abducciones laterales en colchoneta', '12 Puentes con piernas juntas', '15 Planchas estrella'],
          instructions: 'Agotamiento final de los rotadores externos y oblicuos.'
        },
        amrapActivator: {
          name: 'AMRAP Activador: Descompresión y Respiración Diafragmática',
          durationMinutes: 5,
          exercises: ['8 Respiraciones gato-camello', '10 Estiramientos de psoas ilíaco', '5 Estiramientos en posición de paloma'],
          instructions: 'Descomprime la columna y relaja flexores de cadera tras la semana de sobrecarga.'
        }
      }
    };

    if (daysCount === 5) {
      const eg5_1 = pickRandom(gluteD5_ex1[level]);
      const eg5_2 = pickRandom(gluteD5_ex2[level]);
      const eg5_3 = pickRandom(gluteD5_ex3[level]);
      const eg5_4 = pickRandom(gluteD5_ex4[level]);
      const eg5_5 = pickRandom(gluteD5_ex5[level]);

      gluteRoutine[5] = {
        id: 5,
        name: 'Día 5: Glúteos (Aislamiento & Bombeo Máximo)',
        subtitle: 'Enfoque metabólico, tensión mecánica constante y remate sarcoplásmico',
        category: 'gluteos_bombeo',
        exercises: [
          {
            category: 'Kas Glute Bridge / Aislamiento Pélvico',
            name: eg5_1.name,
            defaultSets: 4,
            defaultReps: eg5_1.reps,
            description: eg5_1.desc
          },
          {
            category: 'Hiperextensión a 45° / Bombeo Cadera',
            name: eg5_2.name,
            defaultSets: 4,
            defaultReps: eg5_2.reps,
            description: eg5_2.desc
          },
          {
            category: 'Patada de Glúteo en Polea / Máquina',
            name: eg5_3.name,
            defaultSets: 3,
            defaultReps: eg5_3.reps,
            description: eg5_3.desc
          },
          {
            category: 'Abducción de Cadera / Glúteo Medio',
            name: eg5_4.name,
            defaultSets: 4,
            defaultReps: eg5_4.reps,
            description: eg5_4.desc
          },
          {
            category: 'Core & Glúteo Estabilizador',
            name: eg5_5.name,
            defaultSets: 3,
            defaultReps: eg5_5.reps,
            description: eg5_5.desc
          }
        ],
        amrapComplementary: {
          name: 'AMRAP Complementario: Quema Final de Glúteo en Banda',
          durationMinutes: 5,
          exercises: ['15 Pasos de cangrejo con banda', '12 Puentes de rana (Frog pumps)', '15 Elevaciones de talones con rebote'],
          instructions: 'Bombeo final sin descanso para saturación sanguínea y desarrollo muscular.'
        },
        amrapActivator: {
          name: 'AMRAP Activador: Movilidad Activa de Cadera y Lumbar',
          durationMinutes: 5,
          exercises: ['8 Rotaciones de cadera 90/90', '10 Gato-camello respiraciones lentas', '8 Desplantes de cosaco'],
          instructions: 'Relajación miofascial y movilidad activa de cadera previa al descanso del fin de semana.'
        }
      };
    }

    if (daysCount === 3) {
      return {
        1: gluteRoutine[1],
        2: gluteRoutine[2],
        3: gluteRoutine[3]
      };
    }

    return gluteRoutine;
  }
  const e1_1 = pickRandom(day1_ex1[level]);
  const e1_2 = pickRandom(day1_ex2[level]);
  const e1_3 = pickRandom(day1_ex3[level]);
  const e1_4 = pickRandom(day1_ex4[level]);
  const e1_5 = pickRandom(day1_ex5);
  const am1_comp = pickRandom(day1_amrap_comp);
  const am1_act = pickRandom(day1_amrap_act);

  const e2_1 = pickRandom(day2_ex1[level]);
  const e2_2 = pickRandom(day2_ex2[level]);
  const e2_3 = pickRandom(day2_ex3[level]);
  const e2_4 = pickRandom(day2_ex4[level]);
  const e2_5 = pickRandom(day2_ex5[level]);

  const e3_1 = pickRandom(day3_ex1[level]);
  const e3_2 = pickRandom(day3_ex2[level]);
  const e3_3 = pickRandom(day3_ex3[level]);
  const e3_4 = pickRandom(day3_ex4[level]);
  const e3_5 = pickRandom(day3_ex5[level]);

  const e4_1 = pickRandom(day4_ex1[level]);
  const e4_2 = pickRandom(day4_ex2[level]);
  const e4_3 = pickRandom(day4_ex3[level]);
  const e4_4 = pickRandom(day4_ex4[level]);
  const e4_5 = pickRandom(day4_ex5[level]);

  if (daysCount === 3) {
    const fb1_1 = pickRandom(day2_ex1[level]);
    const fb1_2 = pickRandom(day1_ex1[level]);
    const fb1_3 = pickRandom(day1_ex2[level]);
    const fb1_4 = pickRandom(day2_ex2[level]);
    const fb1_5 = pickRandom(day2_ex5[level]);

    const fb2_1 = pickRandom(day4_ex1[level]);
    const fb2_2 = pickRandom(day1_ex3[level]);
    const fb2_3 = pickRandom(day1_ex4[level]);
    const fb2_4 = pickRandom(day4_ex2[level]);
    const fb2_5 = pickRandom(day1_ex5);

    const fb3_1 = pickRandom(day2_ex2[level]);
    const fb3_2 = pickRandom(day3_ex1[level]);
    const fb3_3 = pickRandom(day3_ex2[level]);
    const fb3_4 = pickRandom(day4_ex3[level]);
    const fb3_5 = pickRandom(day4_ex4[level]);

    return {
      1: {
        id: 1,
        name: 'Día 1: Full Body A (Fuerza & Base)',
        subtitle: 'Básicos multiarticulares para estimular todo el cuerpo con alta tensión mecánica',
        category: 'fullbody_fuerza',
        exercises: [
          { category: 'Dominante de Rodilla / Sentadilla', name: fb1_1.name, defaultSets: 3, defaultReps: fb1_1.reps, description: fb1_1.desc },
          { category: 'Empuje Horizontal (Pecho)', name: fb1_2.name, defaultSets: 3, defaultReps: fb1_2.reps, description: fb1_2.desc },
          { category: 'Tracción Horizontal (Espalda)', name: fb1_3.name, defaultSets: 3, defaultReps: fb1_3.reps, description: fb1_3.desc },
          { category: 'Bisagra de Cadera (Isquios/Glúteo)', name: fb1_4.name, defaultSets: 3, defaultReps: fb1_4.reps, description: fb1_4.desc },
          { category: 'Core / Abdomen Estable', name: fb1_5.name, defaultSets: 3, defaultReps: fb1_5.reps, description: fb1_5.desc }
        ],
        amrapComplementary: am1_comp,
        amrapActivator: am1_act
      },
      2: {
        id: 2,
        name: 'Día 2: Full Body B (Hipertrofia & Empuje Vertical)',
        subtitle: 'Variación de estímulos, trabajo unilateral y desarrollo de hombros y glúteos',
        category: 'fullbody_hipertrofia',
        exercises: [
          { category: 'Piernas / Unilateral (Prensa/Zancada)', name: fb2_1.name, defaultSets: 3, defaultReps: fb2_1.reps, description: fb2_1.desc },
          { category: 'Empuje Vertical (Hombros)', name: fb2_2.name, defaultSets: 3, defaultReps: fb2_2.reps, description: fb2_2.desc },
          { category: 'Tracción Vertical (Dorsales)', name: fb2_3.name, defaultSets: 3, defaultReps: fb2_3.reps, description: fb2_3.desc },
          { category: 'Hip Thrust / Glúteos', name: fb2_4.name, defaultSets: 3, defaultReps: fb2_4.reps, description: fb2_4.desc },
          { category: 'Brazos (Superserie Bíceps/Tríceps)', name: fb2_5.name, defaultSets: 2, defaultReps: fb2_5.reps, description: fb2_5.desc }
        ],
        amrapComplementary: {
          name: 'AMRAP Complementario: Desgaste Cuádriceps y Core',
          durationMinutes: 5,
          exercises: ['15 Sentadillas al aire', '12 Fondos en banco', '20 Escaladores'],
          instructions: 'Quema metabólica para maximizar el flujo sanguíneo y recuperación muscular.'
        },
        amrapActivator: {
          name: 'AMRAP Activador: Movilidad y Apertura de Torso',
          durationMinutes: 5,
          exercises: ['10 Rotaciones de columna torácica', '8 Inchworms dinámicos', '10 Sentadillas profundas'],
          instructions: 'Preparación neuromuscular y apertura articular.'
        }
      },
      3: {
        id: 3,
        name: 'Día 3: Full Body C (Cadena Posterior & Torso)',
        subtitle: 'Consolidación semanal con peso muerto, remos y bombeo compensatorio',
        category: 'fullbody_consolidacion',
        exercises: [
          { category: 'Peso Muerto (Fuerza Posterior)', name: fb3_1.name, defaultSets: 3, defaultReps: fb3_1.reps, description: fb3_1.desc },
          { category: 'Press Inclinado (Pectoral Superior)', name: fb3_2.name, defaultSets: 3, defaultReps: fb3_2.reps, description: fb3_2.desc },
          { category: 'Remo en Polea / Máquina', name: fb3_3.name, defaultSets: 3, defaultReps: fb3_3.reps, description: fb3_3.desc },
          { category: 'Aislamiento Pierna (Femoral/Cuádriceps)', name: fb3_4.name, defaultSets: 3, defaultReps: fb3_4.reps, description: fb3_4.desc },
          { category: 'Pantorrillas & Core', name: fb3_5.name, defaultSets: 3, defaultReps: fb3_5.reps, description: fb3_5.desc }
        ],
        amrapComplementary: {
          name: 'AMRAP Complementario: Burnout de Espalda y Core',
          durationMinutes: 5,
          exercises: ['12 Remos con mancuernas ligeras', '15 Planchas altas con toque de hombros', '20 Abdominales tipo Crunch'],
          instructions: 'Agotamiento final de tren superior y zona media.'
        },
        amrapActivator: {
          name: 'AMRAP Activador: Movilidad y Estiramiento de Cadena Posterior',
          durationMinutes: 5,
          exercises: ['8 Estiramientos de isquios en paso dinámico', '10 Gato-camello respiraciones', '6 Desplantes de cosaco'],
          instructions: 'Aumenta el rango de movimiento de caderas e isquios.'
        }
      }
    };
  }

  const standardRoutine: WeeklyRoutine = {
    1: {
      id: 1,
      name: 'Día 1: Torso (Fuerza)',
      subtitle: 'Enfoque en desarrollo de fuerza máxima de empuje y tracción',
      category: 'torso_fuerza',
      exercises: [
        {
          category: 'Empuje Horizontal (Fuerza)',
          name: e1_1.name,
          defaultSets: 4,
          defaultReps: e1_1.reps,
          description: e1_1.desc
        },
        {
          category: 'Tracción Horizontal (Fuerza)',
          name: e1_2.name,
          defaultSets: 4,
          defaultReps: e1_2.reps,
          description: e1_2.desc
        },
        {
          category: 'Empuje Vertical',
          name: e1_3.name,
          defaultSets: 3,
          defaultReps: e1_3.reps,
          description: e1_3.desc
        },
        {
          category: 'Tracción Vertical',
          name: e1_4.name,
          defaultSets: 3,
          defaultReps: e1_4.reps,
          description: e1_4.desc
        },
        {
          category: 'Brazos (Superserie)',
          name: e1_5.name,
          defaultSets: 3,
          defaultReps: e1_5.reps,
          description: e1_5.desc
        }
      ],
      amrapComplementary: {
        name: am1_comp.name,
        durationMinutes: 5,
        exercises: am1_comp.exercises,
        instructions: am1_comp.instructions
      },
      amrapActivator: {
        name: am1_act.name,
        durationMinutes: 5,
        exercises: am1_act.exercises,
        instructions: am1_act.instructions
      }
    },
    2: {
      id: 2,
      name: 'Día 2: Pierna (Fuerza)',
      subtitle: 'Enfoque en desarrollo de fuerza máxima en tren inferior y estabilidad de core',
      category: 'pierna_fuerza',
      exercises: [
        {
          category: 'Dominante de Rodilla (Fuerza)',
          name: e2_1.name,
          defaultSets: 4,
          defaultReps: e2_1.reps,
          description: e2_1.desc
        },
        {
          category: 'Bisagra de Cadera (Fuerza)',
          name: e2_2.name,
          defaultSets: 4,
          defaultReps: e2_2.reps,
          description: e2_2.desc
        },
        {
          category: 'Empuje Pierna Secundario',
          name: e2_3.name,
          defaultSets: 3,
          defaultReps: e2_3.reps,
          description: e2_3.desc
        },
        {
          category: 'Pantorrillas (Fuerza)',
          name: e2_4.name,
          defaultSets: 4,
          defaultReps: e2_4.reps,
          description: e2_4.desc
        },
        {
          category: 'Abdomen / Core',
          name: e2_5.name,
          defaultSets: 3,
          defaultReps: e2_5.reps,
          description: e2_5.desc
        }
      ],
      amrapComplementary: {
        name: 'AMRAP Complementario: Desgaste Cuádriceps y Core',
        durationMinutes: 5,
        exercises: ['12 Sentadillas de salto (Squat jumps)', '15 Abdominales bicicleta', '10 Zancadas alternas de salto'],
        instructions: 'Maximiza el bombeo cardiovascular y de piernas. Intenta no descansar entre ejercicios.'
      },
      amrapActivator: {
        name: 'AMRAP Activador: Movilidad y Apertura de Torso',
        durationMinutes: 5,
        exercises: ['12 Flexiones escapulares', '8 Rotaciones torácicas en cuadrupedia', '10 Planchas altas a perro boca abajo'],
        instructions: 'Mejora la movilidad de hombros, columna torácica y prepara los empujes para el día de torso.'
      }
    },
    3: {
      id: 3,
      name: 'Día 3: Torso (Hipertrofia)',
      subtitle: 'Estimulación de crecimiento muscular con volumen moderado-alto',
      category: 'torso_hipertrofia',
      exercises: [
        {
          category: 'Empuje Inclinado',
          name: e3_1.name,
          defaultSets: 4,
          defaultReps: e3_1.reps,
          description: e3_1.desc
        },
        {
          category: 'Tracción Horizontal Polea',
          name: e3_2.name,
          defaultSets: 4,
          defaultReps: e3_2.reps,
          description: e3_2.desc
        },
        {
          category: 'Empuje Aislamiento',
          name: e3_3.name,
          defaultSets: 3,
          defaultReps: e3_3.reps,
          description: e3_3.desc
        },
        {
          category: 'Hombro Lateral',
          name: e3_4.name,
          defaultSets: 4,
          defaultReps: e3_4.reps,
          description: e3_4.desc
        },
        {
          category: 'Brazos (Superserie)',
          name: e3_5.name,
          defaultSets: 3,
          defaultReps: e3_5.reps,
          description: e3_5.desc
        }
      ],
      amrapComplementary: {
        name: 'AMRAP Complementario: Burnout de Hombros y Espalda',
        durationMinutes: 5,
        exercises: ['12 Elevaciones frontales de disco/mancuerna', '15 Remos con banda o mancuerna ligera', '10 Planchas altas con toque de hombros'],
        instructions: 'Agotamiento final de la porción superior del cuerpo. Ideal para el desarrollo estético de hombros.'
      },
      amrapActivator: {
        name: 'AMRAP Activador: Desbloqueo de Cadera y Tobillo',
        durationMinutes: 5,
        exercises: ['8 Desplantes de cosaco laterales', '10 Estiramientos de tobillo contra pared', '12 Patadas de glúteo en cuadrupedia'],
        instructions: 'Aumenta el rango de movimiento de las caderas y flexión de tobillo para sentadillas profundas mañana.'
      }
    },
    4: {
      id: 4,
      name: 'Día 4: Pierna (Hipertrofia)',
      subtitle: 'Volumen y aislamiento enfocado en hipertrofia de cuádriceps, isquios y glúteos',
      category: 'pierna_hipertrofia',
      exercises: [
        {
          category: 'Unilateral / Fuerza-Hipertrofia',
          name: e4_1.name,
          defaultSets: 3,
          defaultReps: e4_1.reps,
          description: e4_1.desc
        },
        {
          category: 'Aislamiento Cuádriceps',
          name: e4_2.name,
          defaultSets: 3,
          defaultReps: e4_2.reps,
          description: e4_2.desc
        },
        {
          category: 'Aislamiento Isquiotibiales',
          name: e4_3.name,
          defaultSets: 3,
          defaultReps: e4_3.reps,
          description: e4_3.desc
        },
        {
          category: 'Pantorrillas Sentado',
          name: e4_4.name,
          defaultSets: 4,
          defaultReps: e4_4.reps,
          description: e4_4.desc
        },
        {
          category: 'Abdomen de Elección',
          name: e4_5.name,
          defaultSets: 3,
          defaultReps: e4_5.reps,
          description: e4_5.desc
        }
      ],
      amrapComplementary: {
        name: 'AMRAP Complementario: Desgaste Final Isquios y Core',
        durationMinutes: 5,
        exercises: ['15 Sentadillas sumo (peso corporal)', '12 Planchas laterales con rotación', '20 Escaladores de montaña (Mountain climbers)'],
        instructions: 'Quema metabólica final para dejar al máximo el estímulo hipertrófico semanal de piernas.'
      },
      amrapActivator: {
        name: 'AMRAP Activador: Movilidad General de Descanso',
        durationMinutes: 5,
        exercises: ['8 Saludos al sol de yoga lentos', '10 Gato-camello respiraciones', '5 Sentadillas profundas con estiramiento'],
        instructions: 'Sesión de relajación e incremento de rango articular posterior a la alta exigencia del entrenamiento.'
      }
    }
  };

  if (daysCount === 5) {
    const e5_1 = pickRandom(day5_ex1[level]);
    const e5_2 = pickRandom(day5_ex2[level]);
    const e5_3 = pickRandom(day5_ex3[level]);
    const e5_4 = pickRandom(day5_ex4[level]);
    const e5_5 = pickRandom(day5_ex5[level]);

    standardRoutine[5] = {
      id: 5,
      name: 'Día 5: Pierna & Glúteos (Hipertrofia / Bombeo)',
      subtitle: 'Segunda frecuencia de tren inferior con enfoque en máquinas, volumen y congestión muscular',
      category: 'pierna_gluteos_bombeo',
      exercises: [
        {
          category: 'Prensa / Sentadilla Máquina (Cuádriceps)',
          name: e5_1.name,
          defaultSets: 4,
          defaultReps: e5_1.reps,
          description: e5_1.desc
        },
        {
          category: 'Aislamiento Cuádriceps (Extensión/Búlgara)',
          name: e5_2.name,
          defaultSets: 3,
          defaultReps: e5_2.reps,
          description: e5_2.desc
        },
        {
          category: 'Aislamiento Isquios (Curl Femoral)',
          name: e5_3.name,
          defaultSets: 3,
          defaultReps: e5_3.reps,
          description: e5_3.desc
        },
        {
          category: 'Hip Thrust / Glúteos Bombeo',
          name: e5_4.name,
          defaultSets: 4,
          defaultReps: e5_4.reps,
          description: e5_4.desc
        },
        {
          category: 'Pantorrillas & Core Bombeo',
          name: e5_5.name,
          defaultSets: 3,
          defaultReps: e5_5.reps,
          description: e5_5.desc
        }
      ],
      amrapComplementary: {
        name: 'AMRAP Complementario: Finisher de Bombeo y Core',
        durationMinutes: 5,
        exercises: ['15 Sentadillas con salto', '15 Abdominales en V (V-ups)', '20 Escaladores'],
        instructions: 'Estímulo de alta densidad metabólica para culminar la semana.'
      },
      amrapActivator: {
        name: 'AMRAP Activador: Descompresión de Columna y Cadera',
        durationMinutes: 5,
        exercises: ['8 Respiraciones en posición del niño (Child pose)', '10 Rotaciones de columna torácica', '6 Estiramientos de psoas'],
        instructions: 'Restauración del sistema nervioso y flexibilidad pasivo-activa post-entreno.'
      }
    };
  }

  return standardRoutine;
};
