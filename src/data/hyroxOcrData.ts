// Estándares Oficiales y Planes de Hyrox y OCR (Carreras de Obstáculos)
// Con pesos oficiales reglamentarios y explicaciones claras para atletas de todos los niveles.

export interface HyroxStation {
  order: number;
  name: string;
  distanceOrReps: string;
  openWomenWeight: string;
  openMenWeight: string;
  proMenWeight: string;
  description: string;
  proTip: string;
}

export const HYROX_OFFICIAL_STATIONS: HyroxStation[] = [
  {
    order: 1,
    name: 'SkiErg (Esquí Indoor)',
    distanceOrReps: '1.000 metros',
    openWomenWeight: 'Resistencia estándar',
    openMenWeight: 'Resistencia estándar',
    proMenWeight: 'Resistencia estándar',
    description: 'Tracción rítmica con ambos brazos flexionando suavemente las rodillas y caderas.',
    proTip: 'No quemes tus piernas aquí; usa el peso del cuerpo al dejarte caer para impulsar las palancas.'
  },
  {
    order: 2,
    name: 'Sled Push (Empuje de Trineo)',
    distanceOrReps: '50 metros (4 tramos de 12.5m)',
    openWomenWeight: '102 kg',
    openMenWeight: '152 kg',
    proMenWeight: '202 kg',
    description: 'Empuje con brazos estirados o flexionados y pasos cortos y constantes clavando las punteras.',
    proTip: 'Mantén los brazos fijos y la cadera baja. Respira en cada paso corto.'
  },
  {
    order: 3,
    name: 'Sled Pull (Arrastre de Trineo con Cuerda)',
    distanceOrReps: '50 metros (4 tramos de 12.5m)',
    openWomenWeight: '78 kg',
    openMenWeight: '103 kg',
    proMenWeight: '153 kg',
    description: 'Arrastre con cuerda manteniéndote dentro del cajón reglamentario de 1.5 metros.',
    proTip: 'Usa las piernas dando un paso atrás con cada brazada en lugar de tirar solo con los bíceps.'
  },
  {
    order: 4,
    name: 'Burpee Broad Jumps (Burpees con Salto Adelante)',
    distanceOrReps: '80 metros',
    openWomenWeight: 'Peso corporal',
    openMenWeight: 'Peso corporal',
    proMenWeight: 'Peso corporal',
    description: 'Pecho al suelo en cada burpee y despegue a dos pies con salto de longitud coordinado.',
    proTip: 'Busca un ritmo de crucero constante en lugar de saltar al máximo y quedarte sin aire.'
  },
  {
    order: 5,
    name: 'Rowing (Remo Indoor)',
    distanceOrReps: '1.000 metros',
    openWomenWeight: 'Resistencia damper 5-6',
    openMenWeight: 'Resistencia damper 5-6',
    proMenWeight: 'Resistencia damper 6',
    description: 'Empuje de piernas primero, balanceo de tronco y remate con brazos al esternón.',
    proTip: 'Mantén una cadencia eficiente de 24 a 28 paladas por minuto para no fatigar los antebrazos.'
  },
  {
    order: 6,
    name: 'Farmers Carry (Acarreo de Mancuernas/KBs)',
    distanceOrReps: '200 metros',
    openWomenWeight: '2 × 16 kg',
    openMenWeight: '2 × 24 kg',
    proMenWeight: '2 × 32 kg',
    description: 'Camina erguido con una pesa pesada en cada mano a lo largo del pasillo.',
    proTip: 'Tronco firme, hombros relajados hacia atrás y pasos veloces y cortos.'
  },
  {
    order: 7,
    name: 'Sandbag Lunges (Zancadas con Saco al Hombro)',
    distanceOrReps: '100 metros',
    openWomenWeight: '10 kg',
    openMenWeight: '20 kg',
    proMenWeight: '30 kg',
    description: 'Zancadas continuas con el saco sobre los hombros, rodilla trasera tocando suave el suelo.',
    proTip: 'Coloca el saco bien equilibrado sobre los trapecios para no cargar los brazos.'
  },
  {
    order: 8,
    name: 'Wall Balls (Lanzamientos de Balón a la Pared)',
    distanceOrReps: '100 repeticiones',
    openWomenWeight: '4 kg (diana a 2.75 m)',
    openMenWeight: '6 kg (diana a 3.00 m)',
    proMenWeight: '9 kg (diana a 3.00 m)',
    description: 'Sentadilla rompiendo el paralelo de 90° y lanzamiento fluido del balón al disco superior.',
    proTip: 'Divide las 100 reps en bloques amigables (ej. 4 series de 25 o 5 series de 20 con 10 seg de pausa).'
  }
];

export const HYROX_WARMUP_H = {
  title: 'Calentamiento Específico Hyrox (10 min)',
  subtitle: 'Prepara el cuerpo para combinar carrera y esfuerzo funcional',
  items: [
    '500 metros de remo indoor o trote a ritmo suave (Z1)',
    '10 sentadillas al aire profundas controladas',
    '10 puentes de glúteo en suelo apretando 1 segundo arriba',
    '8 caminatas de oruga (Inchworms) con flexión suave',
    '2 series de 20 metros de skipping ágil',
    '2 pasadas de 10 metros de trineo suave o empujes simulados'
  ]
};

export const OCR_WARMUP_O = {
  title: 'Calentamiento Específico OCR / Obstáculos (10 min)',
  subtitle: 'Activa tus dedos, hombros y agilidad antes de colgarte o saltar muros',
  items: [
    '3 minutos de trote suave continuo',
    '20 círculos suaves de hombros con banda elástica',
    '8 retracciones escapulares colgado en barra (Scap pull-ups)',
    '10 sentadillas dinámicas con salto suave',
    '5 caminatas de oruga estirando isquios',
    '2 pasadas de 10 metros de gateo de oso (Bear Crawl)'
  ]
};
