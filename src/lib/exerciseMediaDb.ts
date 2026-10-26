// Base de datos de imágenes reales demostrativas (2 fases: inicio y contracción)
// Procedentes de repositorios abiertos (Public Domain / CC0 / MIT) de libre distribución (yuhonas/free-exercise-db)

export interface ExerciseMediaEntry {
  id: string;
  matchPatterns: RegExp[];
  canonicalName: string;
  muscleGroup: 'Pecho' | 'Espalda' | 'Cuádriceps' | 'Glúteos' | 'Isquios y Glúteo' | 'Hombros' | 'Brazos' | 'Core' | 'Cardio y Metabólico';
  pattern: 'Empuje horizontal' | 'Tracción vertical' | 'Tracción horizontal' | 'Dominante rodilla' | 'Dominante cadera' | 'Empuje vertical' | 'Aislamiento' | 'Metabólico' | 'Carga y Agarre';
  equipment: 'Mancuernas' | 'Barra' | 'Máquina' | 'Polea' | 'Peso corporal' | 'Kettlebell' | 'Caja / Banco' | 'Saco / Lastre' | 'Ergómetro';
  primaryMuscle: string;
  secondaryMuscles: string[];
  steps: string[];
  commonMistakes: string[];
  breathingTip: string;
  targetFocus: string;
  demoImages: [string, string]; // [Fase 1: Inicio, Fase 2: Ejecución/Contracción]
}

const CDN_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';

export const EXERCISE_MEDIA_DATABASE: ExerciseMediaEntry[] = [
  // ==========================================
  // --- PECHO (EMPUJE HORIZONTAL) ---
  // ==========================================
  {
    id: 'barbell_bench_press',
    matchPatterns: [/press.*(de\s+)?banca/i, /bench press/i, /press.*(plano|banca).*barra/i, /press.*banca.*pausa/i],
    canonicalName: 'Press de banca con barra',
    muscleGroup: 'Pecho',
    pattern: 'Empuje horizontal',
    equipment: 'Barra',
    primaryMuscle: 'Pectoral mayor (Fibras medias y esternales)',
    secondaryMuscles: ['Tríceps braquial', 'Deltoides anterior'],
    steps: [
      'Acuéstate sobre el banco plano con los ojos directamente debajo de la barra.',
      'Sujeta la barra con agarre ligeramente más ancho que los hombros y junta los omóplatos hacia atrás y abajo.',
      'Desciende la barra de forma controlada hasta rozar la parte media del esternón (codos a 45°-60° en flecha).',
      'Empuja la barra con fuerza hacia arriba extendiendo los brazos sin despegar la espalda del banco.'
    ],
    commonMistakes: [
      'Abrir los codos a 90° forzando la articulación del hombro.',
      'Rebotar la barra en las costillas o arquear excesivamente la zona lumbar.'
    ],
    breathingTip: 'Inhala hondo al bajar la barra al pecho; exhala con potencia al empujar hacia arriba.',
    targetFocus: 'Fuerza global de empuje e hipertrofia del pectoral.',
    demoImages: [
      `${CDN_BASE}/Barbell_Bench_Press_-_Medium_Grip/0.jpg`,
      `${CDN_BASE}/Barbell_Bench_Press_-_Medium_Grip/1.jpg`
    ]
  },
  {
    id: 'dumbbell_bench_press',
    matchPatterns: [/press.*(plano|banca).*mancuerna/i, /press.*mancuerna.*(plano|banco)/i],
    canonicalName: 'Press plano con mancuernas',
    muscleGroup: 'Pecho',
    pattern: 'Empuje horizontal',
    equipment: 'Mancuernas',
    primaryMuscle: 'Pectoral mayor',
    secondaryMuscles: ['Tríceps braquial', 'Deltoides anterior', 'Estabilizadores escapulares'],
    steps: [
      'Siéntate en el banco con las mancuernas sobre los muslos y túmbate apoyando bien los pies en el suelo.',
      'Coloca las mancuernas a los lados del pecho con los codos a 45° del torso.',
      'Empuja verticalmente hacia arriba juntando las mancuernas en la cúspide sin llegar a chocarlas.',
      'Baja en 2 a 3 segundos sintiendo un estiramiento profundo y controlado en los pectorales.'
    ],
    commonMistakes: [
      'Chocar los discos arriba perdiendo la tensión muscular.',
      'Dejar caer los codos por debajo del nivel articular seguro.'
    ],
    breathingTip: 'Inhala en el descenso abriendo la caja torácica; exhala al presionar hacia arriba.',
    targetFocus: 'Mayor rango de recorrido y simetría entre ambos lados del pecho.',
    demoImages: [
      `${CDN_BASE}/Dumbbell_Bench_Press/0.jpg`,
      `${CDN_BASE}/Dumbbell_Bench_Press/1.jpg`
    ]
  },
  {
    id: 'incline_dumbbell_press',
    matchPatterns: [/press.*inclinado.*mancuerna/i, /incline dumbbell/i],
    canonicalName: 'Press inclinado con mancuernas',
    muscleGroup: 'Pecho',
    pattern: 'Empuje horizontal',
    equipment: 'Mancuernas',
    primaryMuscle: 'Pectoral superior (Porción clavicular)',
    secondaryMuscles: ['Deltoides anterior', 'Tríceps'],
    steps: [
      'Ajusta el banco a unos 30° - 45° de inclinación.',
      'Inicia con las mancuernas al nivel de las clavículas con retracción de escápulas.',
      'Presiona hacia arriba en una trayectoria suave hasta extender los brazos.',
      'Baja controlando el peso hasta sentir el estiramiento en la parte alta del pecho.'
    ],
    commonMistakes: [
      'Inclinar el banco a más de 45° (convierte el ejercicio en hombro).',
      'Despegar la espalda baja del respaldo.'
    ],
    breathingTip: 'Inhala al descender; exhala al empujar hacia el techo.',
    targetFocus: 'Desarrollo de la porción clavicular superior del pectoral.',
    demoImages: [
      `${CDN_BASE}/Incline_Dumbbell_Press/0.jpg`,
      `${CDN_BASE}/Incline_Dumbbell_Press/1.jpg`
    ]
  },
  {
    id: 'chest_dips',
    matchPatterns: [/fondos.*paralela/i, /dips/i],
    canonicalName: 'Fondos en paralelas (Dips)',
    muscleGroup: 'Pecho',
    pattern: 'Empuje horizontal',
    equipment: 'Peso corporal',
    primaryMuscle: 'Pectoral inferior y tríceps',
    secondaryMuscles: ['Deltoides anterior', 'Core'],
    steps: [
      'Sujétate en las barras paralelas con brazos extendidos e inclina el torso 30° hacia adelante.',
      'Flexiona los codos descendiendo hasta que tus hombros queden ligeramente por debajo de los codos.',
      'Empuja con el pecho y los brazos para volver a la posición de partida.'
    ],
    commonMistakes: [
      'Bajar en exceso si tienes falta de movilidad en el hombro.',
      'Quedarse completamente erguido (pasa toda la carga a los tríceps).'
    ],
    breathingTip: 'Inhala en la bajada; exhala al presionar hacia arriba.',
    targetFocus: 'Fuerza funcional de tren superior y pectoral inferior.',
    demoImages: [
      `${CDN_BASE}/Dips_-_Chest_Version/0.jpg`,
      `${CDN_BASE}/Dips_-_Chest_Version/1.jpg`
    ]
  },
  {
    id: 'cable_crossover',
    matchPatterns: [/cruce.*polea/i, /cable crossover/i, /apertura.*polea/i],
    canonicalName: 'Cruces en polea para pecho',
    muscleGroup: 'Pecho',
    pattern: 'Aislamiento',
    equipment: 'Polea',
    primaryMuscle: 'Pectoral mayor (Fibras esternales en aducción)',
    secondaryMuscles: ['Deltoides anterior'],
    steps: [
      'Coloca las poleas a media altura o altas y da un paso al frente con una pierna para dar estabilidad.',
      'Con una ligera flexión en los codos, junta las manos al frente abrazando un barril imaginario.',
      'Aprieta los pectorales durante 1 segundo en el punto de máximo cruce.',
      'Regresa lentamente abriendo los brazos sintiendo cómo se estira el pecho.'
    ],
    commonMistakes: [
      'Doblar y estirar los codos como en un press en vez de hacer una apertura.',
      'Balancear el torso con impulso.'
    ],
    breathingTip: 'Inhala al abrir los brazos; exhala al juntar las manos al frente.',
    targetFocus: 'Tensión constante en todo el recorrido y congestión pectoral.',
    demoImages: [
      `${CDN_BASE}/Cable_Crossover/0.jpg`,
      `${CDN_BASE}/Cable_Crossover/1.jpg`
    ]
  },

  // ==========================================
  // --- ESPALDA (TRACCIÓN) ---
  // ==========================================
  {
    id: 'lat_pulldown',
    matchPatterns: [/jalon.*pecho/i, /jalón.*pecho/i, /lat pulldown/i],
    canonicalName: 'Jalón al pecho en polea alta',
    muscleGroup: 'Espalda',
    pattern: 'Tracción vertical',
    equipment: 'Polea',
    primaryMuscle: 'Dorsal ancho (Amplitud de espalda)',
    secondaryMuscles: ['Bíceps braquial', 'Braquiorradial', 'Romboides'],
    steps: [
      'Ajusta las almohadillas para que tus muslos queden firmes y sujeta la barra con agarre algo más ancho que los hombros.',
      'Saca el pecho e inclina el torso unos 10°-15° hacia atrás.',
      'Tira de la barra hacia la parte superior del esternón llevando los codos hacia abajo y atrás.',
      'Contrae la espalda 1 segundo y sube controlando el cable hasta estirar por completo los dorsales.'
    ],
    commonMistakes: [
      'Tirar de la barra detrás de la nuca (muy lesivo para cervicales y hombros).',
      'Balancear el cuerpo hacia atrás usando el peso corporal.'
    ],
    breathingTip: 'Inhala arriba al estirar; exhala al tirar de la barra hacia el pecho.',
    targetFocus: 'Amplitud dorsal y fuerza vertical de espalda.',
    demoImages: [
      `${CDN_BASE}/Close-Grip_Front_Lat_Pulldown/0.jpg`,
      `${CDN_BASE}/Close-Grip_Front_Lat_Pulldown/1.jpg`
    ]
  },
  {
    id: 'pull_ups',
    matchPatterns: [/dominada/i, /pull-?ups/i],
    canonicalName: 'Dominadas estrictas (Pull-ups)',
    muscleGroup: 'Espalda',
    pattern: 'Tracción vertical',
    equipment: 'Peso corporal',
    primaryMuscle: 'Dorsal ancho y redondo mayor',
    secondaryMuscles: ['Bíceps', 'Trapecio medio e inferior', 'Core'],
    steps: [
      'Cuélgate de la barra con las palmas mirando hacia el frente (pronación) algo más anchas que los hombros.',
      'Activa las escápulas tirando de ellas hacia abajo antes de doblar los brazos.',
      'Sube con fuerza hasta que tu barbilla supere con claridad la barra.',
      'Baja de forma controlada hasta que los brazos queden prácticamente estirados.'
    ],
    commonMistakes: [
      'Hacer balanceos o patadas (kipping) en vez de tracción pura.',
      'No completar el recorrido completo por fatiga.'
    ],
    breathingTip: 'Inhala abajo; exhala mientras tiras hacia arriba.',
    targetFocus: 'Fuerza relativa y desarrollo masivo de la espalda.',
    demoImages: [
      `${CDN_BASE}/Pullups/0.jpg`,
      `${CDN_BASE}/Pullups/1.jpg`
    ]
  },
  {
    id: 'meadows_row',
    matchPatterns: [/meadows/i, /remo.*meadows/i, /landmine.*row/i, /remo.*punta.*barra/i],
    canonicalName: 'Remo Meadows con barra (Landmine unilateral)',
    muscleGroup: 'Espalda',
    pattern: 'Tracción horizontal',
    equipment: 'Barra',
    primaryMuscle: 'Dorsal ancho (porción baja e ilíaca) y redondo mayor',
    secondaryMuscles: ['Deltoides posterior', 'Romboides', 'Trapecio medio', 'Core anti-rotacional', 'Antebrazo'],
    steps: [
      'Coloca una barra olímpica en un anclaje landmine o en una esquina protegida y carga discos pequeños (preferiblemente de 10-15 kg / 25 lbs para no acortar el recorrido de bajada).',
      'Párate perpendicular al extremo de la barra en postura escalonada (pierna opuesta al brazo ejecutor adelantada). Apoya la mano o antebrazo libre en la rodilla frontal para estabilizar el torso.',
      'Sujeta la manga gruesa de la barra con agarre prono (palma hacia atrás) usando una agarradera o strap si la carga es pesada.',
      'Inicia la tracción llevando el codo hacia afuera y hacia atrás en un arco natural hacia la cadera, contrayendo el dorsal al máximo en el punto álgido sin girar el torso.',
      'Desciende el peso lentamente en 2-3 segundos sintiendo el estiramiento extremo del dorsal ancho antes de la siguiente repetición.'
    ],
    commonMistakes: [
      'Usar discos de 20 kg (45 lbs) de gran diámetro que toquen el suelo antes de lograr el estiramiento completo del dorsal.',
      'Rotar bruscamente el torso o dar tirones con la cadera para mover la carga.'
    ],
    breathingTip: 'Inhala en el estiramiento profundo abajo; exhala al traccionar el codo hacia la cadera.',
    targetFocus: 'Aislamiento supremo unilateral del dorsal ancho y deltoides posterior sin fatigar la zona lumbar (creado por John Meadows).',
    demoImages: [
      `${CDN_BASE}/One-Arm_Long_Bar_Row/0.jpg`,
      `${CDN_BASE}/One-Arm_Long_Bar_Row/1.jpg`
    ]
  },
  {
    id: 'pendlay_row',
    matchPatterns: [/pendlay/i, /remo.*pendlay/i, /remo.*desde.*el.*suelo/i, /remo.*suelo/i],
    canonicalName: 'Remo Pendlay con barra (Dead-Stop desde el suelo)',
    muscleGroup: 'Espalda',
    pattern: 'Tracción horizontal',
    equipment: 'Barra',
    primaryMuscle: 'Espalda alta (Romboides, trapecio medio e inferior) y dorsal ancho',
    secondaryMuscles: ['Erectores espinales (estabilidad isométrica pura)', 'Deltoides posterior', 'Bíceps'],
    steps: [
      'Coloca la barra con discos olímpicos en el suelo sobre la mitad de tus pies, con los pies al ancho de las caderas.',
      'Flexiona la cadera manteniendo la columna neutra y rígida: el torso debe colocarse estrictamente horizontal y paralelo al suelo (90°).',
      'Toma la barra con agarre prono (palmas hacia abajo) un poco más ancho que los hombros. La cadera queda más alta que en un peso muerto convencional.',
      'Tira de la barra de forma explosiva directamente hacia la base del esternón o parte superior del abdomen, llevando los codos hacia el techo y juntando las escápulas.',
      'Baja la barra con control hasta que descanse por completo en el suelo (dead stop). Pausa una fracción de segundo para disipar cualquier rebote o inercia elástica antes del siguiente tirón.'
    ],
    commonMistakes: [
      'Levantar el torso hacia arriba a 45° durante el tirón (convirtiéndolo en un remo convencional con impulso).',
      'Rebotar los discos contra el suelo usando el rebote en lugar de fuerza pura concéntrica desde parado.'
    ],
    breathingTip: 'Inhala profundo y presuriza el abdomen (maniobra de Valsalva) antes del tirón; exhala al contactar el esternón y descender al piso.',
    targetFocus: 'Fuerza explosiva pura de tracción y densidad brutal de la espalda alta (romboides y trapecio) eliminando cualquier balanceo.',
    demoImages: [
      `${CDN_BASE}/Bent_Over_Barbell_Row/0.jpg`,
      `${CDN_BASE}/Bent_Over_Barbell_Row/1.jpg`
    ]
  },
  {
    id: 't_bar_row',
    matchPatterns: [/remo.*barra.*t/i, /\bbarra\s*[-_]?\s*t\b/i, /t-?bar.*row/i, /t-?bar/i],
    canonicalName: 'Remo en barra T (apoyado en máquina o agarre cerrado)',
    muscleGroup: 'Espalda',
    pattern: 'Tracción horizontal',
    equipment: 'Máquina',
    primaryMuscle: 'Espalda media (Romboides, trapecio medio) y dorsal ancho',
    secondaryMuscles: ['Bíceps', 'Deltoides posterior', 'Erectores lumbares'],
    steps: [
      'Apoya el pecho firmemente contra la almohadilla inclinada o colócate sobre la plataforma.',
      'Toma el agarre neutro o cerrado en V con ambas manos y los brazos extendidos.',
      'Tracciona la carga hacia la base del pecho o abdomen retrayendo las escápulas con fuerza.',
      'Aguanta 1 segundo la contracción en la cima y baja controlando el peso hasta el estiramiento completo.'
    ],
    commonMistakes: [
      'Despegar el pecho del soporte acolchado para impulsarse con las lumbares.',
      'Tirar únicamente con los brazos sin juntar los omóplatos.'
    ],
    breathingTip: 'Inhala en el descenso; exhala al tirar de las empuñaduras hacia el pecho.',
    targetFocus: 'Densidad y grosor de la espalda media eliminando el estrés sobre la columna baja.',
    demoImages: [
      `${CDN_BASE}/Lying_T-Bar_Row/0.jpg`,
      `${CDN_BASE}/Lying_T-Bar_Row/1.jpg`
    ]
  },
  {
    id: 'barbell_row',
    matchPatterns: [/remo.*barra/i, /bent over row/i],
    canonicalName: 'Remo con barra inclinado',
    muscleGroup: 'Espalda',
    pattern: 'Tracción horizontal',
    equipment: 'Barra',
    primaryMuscle: 'Dorsal ancho, romboides y trapecio medio (Densidad de espalda)',
    secondaryMuscles: ['Bíceps braquial', 'Deltoides posterior', 'Erectores lumbares'],
    steps: [
      'Pies al ancho de las caderas, flexiona ligeramente las rodillas e inclina el torso a 45° manteniendo la espalda plana.',
      'Sujeta la barra con agarre prono o supino a la anchura de hombros.',
      'Tira de la barra hacia la zona del ombligo/cadera guiando el movimiento con los codos en tensión continua (sin apoyar la barra en el piso).',
      'Aprieta los omóplatos al final y baja la barra con control sin perder la posición de la columna.'
    ],
    commonMistakes: [
      'Encorvar la espalda baja poniendo en riesgo los discos intervertebrales.',
      'Incorporarse y tirar con tirones verticales del torso.'
    ],
    breathingTip: 'Inhala al descolgar la barra; exhala al tirar hacia el abdomen.',
    targetFocus: 'Grosor y densidad muscular en toda la espalda con tensión continua sostenida.',
    demoImages: [
      `${CDN_BASE}/Bent_Over_Barbell_Row/0.jpg`,
      `${CDN_BASE}/Bent_Over_Barbell_Row/1.jpg`
    ]
  },
  {
    id: 'dumbbell_row',
    matchPatterns: [/remo.*mancuerna/i, /remo.*kroc/i, /one arm row/i],
    canonicalName: 'Remo con mancuernas (a una mano o en banco)',
    muscleGroup: 'Espalda',
    pattern: 'Tracción horizontal',
    equipment: 'Mancuernas',
    primaryMuscle: 'Dorsal ancho y romboides',
    secondaryMuscles: ['Bíceps', 'Deltoides posterior', 'Core rotacional'],
    steps: [
      'Apoya una rodilla y mano en el banco plano, manteniendo la espalda totalmente horizontal y neutra.',
      'Con la otra mano sujeta la mancuerna colgando hacia el suelo.',
      'Tira del codo hacia atrás en dirección a tu bolsillo de la cadera.',
      'Aprieta la espalda en el punto alto y desciende con suavidad estirando el dorsal.'
    ],
    commonMistakes: [
      'Rotar el torso de forma exagerada para subir más peso.',
      'Jalar hacia el hombro en lugar de hacia la cadera.'
    ],
    breathingTip: 'Inhala en la bajada; exhala al subir el codo.',
    targetFocus: 'Trabajo unilateral para corregir desbalances de fuerza entre lados.',
    demoImages: [
      `${CDN_BASE}/One-Arm_Dumbbell_Row/0.jpg`,
      `${CDN_BASE}/One-Arm_Dumbbell_Row/1.jpg`
    ]
  },
  {
    id: 'seated_cable_row',
    matchPatterns: [/remo.*polea/i, /remo.*maquina/i, /remo.*gironda/i, /seated row/i],
    canonicalName: 'Remo sentado en polea baja / máquina',
    muscleGroup: 'Espalda',
    pattern: 'Tracción horizontal',
    equipment: 'Polea',
    primaryMuscle: 'Zona media de espalda (Romboides y trapecio)',
    secondaryMuscles: ['Dorsal ancho', 'Bíceps'],
    steps: [
      'Siéntate con los pies en los topes, rodillas semi-flexionadas y torso erguido a 90°.',
      'Tira del agarre hacia el abdomen inferior llevando los hombros hacia atrás.',
      'Pausa 1 segundo sintiendo el pellizco entre las escápulas.',
      'Regresa lentamente estirando los brazos sin encorvar la zona lumbar.'
    ],
    commonMistakes: ['Columpiarse hacia adelante y hacia atrás con la espalda baja.'],
    breathingTip: 'Exhala al acercar el agarre; inhala al extender los brazos.',
    targetFocus: 'Densidad interescapular y postura erguida.',
    demoImages: [
      `${CDN_BASE}/Seated_Cable_Rows/0.jpg`,
      `${CDN_BASE}/Seated_Cable_Rows/1.jpg`
    ]
  },

  {
    id: 'seated_dumbbell_shoulder_press',
    matchPatterns: [/press.*(militar|hombro).*sentado/i, /press.*mancuerna.*(hombro|sentado)/i, /seated.*dumbbell.*press/i, /press.*militar.*mancuerna/i],
    canonicalName: 'Press militar con mancuernas sentado',
    muscleGroup: 'Hombros',
    pattern: 'Empuje vertical',
    equipment: 'Mancuernas',
    primaryMuscle: 'Deltoides anterior y lateral',
    secondaryMuscles: ['Tríceps braquial', 'Trapecio superior', 'Core'],
    steps: [
      'Siéntate en un banco con respaldo a unos 75°-80° con las mancuernas apoyadas sobre los muslos.',
      'Sube las mancuernas a la altura de las orejas/clavículas con los codos ligeramente hacia adelante (plano escapular).',
      'Empuja verticalmente hacia arriba juntando las mancuernas en la cúspide sin chocarlas.',
      'Baja controlando el peso en 2 a 3 segundos hasta la altura de las orejas.'
    ],
    commonMistakes: [
      'Arquear la espalda lumbar despegándola del respaldo.',
      'Abrir los codos a 90° forzando la articulación del hombro.'
    ],
    breathingTip: 'Inhala en el descenso; exhala al presionar hacia arriba.',
    targetFocus: 'Desarrollo del deltoides anterior y fuerza de empuje vertical sentado.',
    demoImages: [
      `${CDN_BASE}/Seated_Dumbbell_Press/1.jpg`,
      `${CDN_BASE}/Seated_Dumbbell_Press/0.jpg`
    ]
  },
  {
    id: 'military_press',
    matchPatterns: [/press.*militar.*barra/i, /press.*militar.*pie/i, /overhead.*press/i, /press.*militar/i, /press.*hombro/i, /shoulder.*press/i],
    canonicalName: 'Press militar con barra de pie (Overhead Press)',
    muscleGroup: 'Hombros',
    pattern: 'Empuje vertical',
    equipment: 'Barra',
    primaryMuscle: 'Deltoides anterior y lateral',
    secondaryMuscles: ['Tríceps braquial', 'Trapecio superior', 'Core y glúteos (estabilidad)'],
    steps: [
      'Ponte de pie con los pies al ancho de hombros y toma la barra apoyada sobre las clavículas con agarre pronado.',
      'Contrae glúteos, cuádriceps y abdomen para crear un pilar inamovible.',
      'Retrae levemente la cabeza y empuja la barra en línea recta vertical hacia el techo.',
      'Al superar la frente, proyecta la cabeza suavemente hacia adelante bloqueando los codos con la barra sobre la coronilla.',
      'Baja con control guiado hasta rozar las clavículas para la siguiente repetición.'
    ],
    commonMistakes: [
      'Arquear la espalda lumbar hacia atrás convirtiendo el press en un empuje inclinado de pecho.',
      'Impulsarse con las rodillas (push press) cuando se busca fuerza estricta.',
      'Bajar a mitad de recorrido sin tocar la zona alta del pecho.'
    ],
    breathingTip: 'Inhala hondo y fija el core antes de empujar; exhala al bloquear la barra sobre la cabeza.',
    targetFocus: 'Desarrollo de fuerza vertical y redondez del hombro.',
    demoImages: [
      `${CDN_BASE}/Standing_Military_Press/0.jpg`,
      `${CDN_BASE}/Standing_Military_Press/1.jpg`
    ]
  },
  {
    id: 'front_plate_raise',
    matchPatterns: [/elevacion.*frontal/i, /elevación.*frontal/i, /front.*raise/i, /disco.*frontal/i, /frontal.*disco/i],
    canonicalName: 'Elevaciones frontales con disco o mancuerna',
    muscleGroup: 'Hombros',
    pattern: 'Aislamiento',
    equipment: 'Mancuernas',
    primaryMuscle: 'Deltoides anterior (Porción clavicular)',
    secondaryMuscles: ['Deltoides lateral', 'Serrato anterior', 'Pectoral superior'],
    steps: [
      'Párate erguido sujetando un disco con ambas manos frente a tus muslos, con los brazos casi extendidos pero codos relajados.',
      'Mantén el abdomen firme y la pelvis neutra para evitar balanceos con la espalda.',
      'Eleva el disco hacia adelante y arriba de forma controlada hasta la altura de los ojos o la barbilla.',
      'Pausa 1 segundo arriba apretando los deltoides frontales y desciende en 2 a 3 segundos resistiendo el peso.'
    ],
    commonMistakes: [
      'Balancear el torso o arquear la zona lumbar para subir el peso con impulso.',
      'Encoger los hombros hacia las orejas usando los trapecios.',
      'Dejar caer el disco sin frenar la bajada.'
    ],
    breathingTip: 'Exhala al elevar el disco hacia el frente; inhala al descenderlo controlado a los muslos.',
    targetFocus: 'Aislamiento e hipertrofia del deltoides anterior (hombro frontal) y estabilidad escapular.',
    demoImages: [
      `${CDN_BASE}/Front_Plate_Raise/0.jpg`,
      `${CDN_BASE}/Front_Plate_Raise/1.jpg`
    ]
  },
  {
    id: 'lateral_raises',
    matchPatterns: [/elevacion.*lateral/i, /elevación.*lateral/i, /lateral raise/i],
    canonicalName: 'Elevaciones laterales con mancuernas o polea',
    muscleGroup: 'Hombros',
    pattern: 'Aislamiento',
    equipment: 'Mancuernas',
    primaryMuscle: 'Deltoides lateral (Anchura 3D del hombro)',
    secondaryMuscles: ['Deltoides anterior', 'Trapecio'],
    steps: [
      'De pie con una mancuerna en cada mano, inclina el torso levemente hacia adelante (5°-10°).',
      'Eleva los brazos hacia los lados en el plano escapular (codos 20° adelantados).',
      'Sube hasta la altura paralela de los hombros guiando con los codos.',
      'Pausa un instante arriba y desciende en 2 segundos resistiendo la gravedad.'
    ],
    commonMistakes: [
      'Usar demasiado peso y darse impulso con las rodillas o la cadera.',
      'Subir las manos por encima de los codos (resta tensión al deltoides lateral).'
    ],
    breathingTip: 'Exhala al subir lateralmente; inhala al descender.',
    targetFocus: 'Anchura estética y silueta en V.',
    demoImages: [
      `${CDN_BASE}/Side_Lateral_Raise/0.jpg`,
      `${CDN_BASE}/Side_Lateral_Raise/1.jpg`
    ]
  },
  {
    id: 'rear_delt_flyes',
    matchPatterns: [/pajaro/i, /pájaro/i, /deltoides.*posterior/i],
    canonicalName: 'Pájaros con mancuernas (Deltoides posterior)',
    muscleGroup: 'Hombros',
    pattern: 'Aislamiento',
    equipment: 'Mancuernas',
    primaryMuscle: 'Deltoides posterior y rotadores externos',
    secondaryMuscles: ['Romboides', 'Trapecio medio'],
    steps: [
      'Inclina el torso hacia adelante paralelo al suelo con la espalda recta.',
      'Abre los brazos hacia los lados llevando los codos hacia afuera y atrás.',
      'Aprieta la parte trasera de los hombros durante 1 segundo.',
      'Regresa lentamente al centro.'
    ],
    commonMistakes: ['Tirar con los dorsales o encoger los hombros hacia las orejas.'],
    breathingTip: 'Exhala al abrir; inhala al cerrar.',
    targetFocus: 'Salud postural y equilibrio articular del hombro.',
    demoImages: [
      `${CDN_BASE}/Seated_Bent-Over_Rear_Delt_Raise/0.jpg`,
      `${CDN_BASE}/Seated_Bent-Over_Rear_Delt_Raise/1.jpg`
    ]
  },
  {
    id: 'face_pull_rope',
    matchPatterns: [/face.*pull/i, /tir[oó]n.*(al\s+)?rostro/i],
    canonicalName: 'Face pull en polea con cuerda',
    muscleGroup: 'Hombros',
    pattern: 'Aislamiento',
    equipment: 'Polea',
    primaryMuscle: 'Deltoides posterior, manguito rotador (infraespinoso, redondo menor) y trapecio medio/superior',
    secondaryMuscles: ['Romboides', 'Bíceps braquial'],
    steps: [
      'Coloca la polea a la altura del pecho superior o de los ojos con el accesorio de cuerda doble.',
      'Sujeta los extremos de la cuerda con agarre neutro o con los pulgares apuntando hacia atrás.',
      'Da uno o dos pasos hacia atrás con una postura sólida, torso erguido y abdomen activo.',
      'Tira de la cuerda directamente hacia la cara (altura de los ojos o nariz), separando las manos y rotando externamente los hombros de modo que las manos queden a los lados de las orejas.',
      'Sostén la contracción durante 1 a 2 segundos juntando las escápulas y regresa despacio controlando la fase excéntrica.'
    ],
    commonMistakes: [
      'Usar una carga excesiva e inclinarse violentamente hacia atrás para mover el peso.',
      'No separar las manos ni rotar los hombros externamente al final del tirón.',
      'Dejar que los hombros se eleven hacia las orejas perdiendo la depresión escapular.'
    ],
    breathingTip: 'Inhala en la posición de estiramiento; exhala con potencia al tirar de la cuerda hacia el rostro y rotar externamente.',
    targetFocus: 'Salud articular del hombro, fortalecimiento del manguito rotador y densidad del deltoides posterior.',
    demoImages: [
      `${CDN_BASE}/Face_Pull/0.jpg`,
      `${CDN_BASE}/Face_Pull/1.jpg`
    ]
  },

  // ==========================================
  // --- BRAZOS (BÍCEPS Y TRÍCEPS) ---
  // ==========================================
  {
    id: 'hammer_curl',
    matchPatterns: [/martillo/i, /hammer curl/i],
    canonicalName: 'Curl martillo con mancuernas',
    muscleGroup: 'Brazos',
    pattern: 'Aislamiento',
    equipment: 'Mancuernas',
    primaryMuscle: 'Braquial anterior y braquiorradial (Grosor de brazo y antebrazo)',
    secondaryMuscles: ['Bíceps braquial (cabeza larga)'],
    steps: [
      'Párate erguido con una mancuerna en cada mano, palmas enfrentadas (agarre neutro).',
      'Fija los codos a los lados del torso.',
      'Flexiona los antebrazos hacia arriba manteniendo las palmas mirándose entre sí todo el tiempo.',
      'Aprieta con fuerza en la parte alta y desciende controlando la bajada en 2 segundos.'
    ],
    commonMistakes: [
      'Balancear el cuerpo hacia atrás.',
      'Separar los codos del cuerpo o moverlos hacia adelante.'
    ],
    breathingTip: 'Exhala al flexionar; inhala al bajar las mancuernas.',
    targetFocus: 'Grosor frontal del brazo y fuerza de agarre.',
    demoImages: [
      `${CDN_BASE}/Alternate_Hammer_Curl/0.jpg`,
      `${CDN_BASE}/Alternate_Hammer_Curl/1.jpg`
    ]
  },
  {
    id: 'bicep_curl_regular',
    matchPatterns: [/curl.*(bicep|bíceps|barra|mancuerna)/i],
    canonicalName: 'Curl de bíceps con barra o mancuernas',
    muscleGroup: 'Brazos',
    pattern: 'Aislamiento',
    equipment: 'Barra',
    primaryMuscle: 'Bíceps braquial (Pico y longitud)',
    secondaryMuscles: ['Braquial anterior', 'Antebrazo'],
    steps: [
      'Sujeta la barra o mancuernas con agarre supino (palmas hacia arriba) al ancho de hombros.',
      'Mantén los codos clavados a los costados y el torso quieto.',
      'Sube la carga flexionando los codos hasta contraer completamente el bíceps.',
      'Baja con lentitud resistiendo el peso hasta la extensión casi total.'
    ],
    commonMistakes: [
      'Usar impulso de espalda o balancear las caderas.',
      'No extender completamente abajo perdiendo rango de movimiento.'
    ],
    breathingTip: 'Exhala al subir; inhala al descender.',
    targetFocus: 'Pico del bíceps y fuerza de flexión de codo.',
    demoImages: [
      `${CDN_BASE}/Barbell_Curl/0.jpg`,
      `${CDN_BASE}/Barbell_Curl/1.jpg`
    ]
  },
  {
    id: 'triceps_overhead_extension',
    matchPatterns: [/(copa.*tr[ií]ceps|tr[ií]ceps.*copa|extensi[oó]n.*copa|copa.*tras\s*nuca)/i, /extension.*triceps.*(mancuerna|overhead)/i, /extensión.*tríceps.*copa/i],
    canonicalName: 'Extensión de tríceps copa (tras nuca)',
    muscleGroup: 'Brazos',
    pattern: 'Aislamiento',
    equipment: 'Mancuernas',
    primaryMuscle: 'Tríceps braquial (Cabeza larga en máximo estiramiento)',
    secondaryMuscles: ['Ancóneo'],
    steps: [
      'Siéntate en un banco con respaldo corto y sujeta una mancuerna pesada con ambas manos tras la cabeza.',
      'Mantén los codos cerrados apuntando hacia el techo y cerca de las orejas.',
      'Extiende los antebrazos hacia arriba hasta bloquear casi por completo los tríceps.',
      'Baja de forma controlada sintiendo el estiramiento profundo detrás del brazo.'
    ],
    commonMistakes: [
      'Abrir excesivamente los codos hacia los lados.',
      'Arquear la espalda lumbar para compensar.'
    ],
    breathingTip: 'Inhala al doblar los brazos tras la cabeza; exhala al extender hacia el techo.',
    targetFocus: 'Cabeza larga del tríceps, responsable del 60% del volumen del brazo.',
    demoImages: [
      `${CDN_BASE}/Seated_Triceps_Press/0.jpg`,
      `${CDN_BASE}/Seated_Triceps_Press/1.jpg`
    ]
  },
  {
    id: 'triceps_pushdown',
    matchPatterns: [
      /extensi[oó]n(es)?.*tr[ií]ceps.*polea/i,
      /tr[ií]ceps.*(en\s+)?polea/i,
      /triceps.*pushdown/i,
      /polea.*cuerda.*tr[ií]ceps/i,
      /tr[ií]ceps.*cuerda/i,
      /extensiones.*tr[ií]ceps/i
    ],
    canonicalName: 'Extensiones de tríceps en polea con cuerda o barra',
    muscleGroup: 'Brazos',
    pattern: 'Aislamiento',
    equipment: 'Polea',
    primaryMuscle: 'Tríceps braquial (Cabeza lateral y medial)',
    secondaryMuscles: ['Ancóneo'],
    steps: [
      'Frente a la polea alta con cuerda, inclina el torso levemente hacia adelante unos 10°.',
      'Pega los codos firmemente a tus costados y no permitas que oscilen hacia adelante o atrás.',
      'Empuja la carga hacia abajo abriendo los extremos de la cuerda hacia los lados al llegar a la extensión completa.',
      'Aguanta 1 segundo la contracción apretando los tríceps y sube con control hasta un ángulo de 90°.'
    ],
    commonMistakes: [
      'Mover los codos hacia adelante y hacia atrás como si fuera un remo.',
      'No abrir la cuerda al final perdiendo el pico de contracción lateral.'
    ],
    breathingTip: 'Exhala al extender hacia abajo y abrir la cuerda; inhala al subir a 90°.',
    targetFocus: 'Definición y corte de la cabeza lateral del tríceps (herradura).',
    demoImages: [
      `${CDN_BASE}/Triceps_Pushdown_-_Rope_Attachment/0.jpg`,
      `${CDN_BASE}/Triceps_Pushdown_-_Rope_Attachment/1.jpg`
    ]
  },

  // ==========================================
  // --- PIERNAS / CUÁDRICEPS (DOMINANTE RODILLA) ---
  // ==========================================
  {
    id: 'bulgarian_split_squat',
    matchPatterns: [/bulgara/i, /búlgara/i, /split.*squat/i, /zancada.*b[uú]lgara/i],
    canonicalName: 'Sentadilla búlgara con mancuernas',
    muscleGroup: 'Cuádriceps',
    pattern: 'Dominante rodilla',
    equipment: 'Mancuernas',
    primaryMuscle: 'Cuádriceps y Glúteo Mayor (Fuerza unilateral)',
    secondaryMuscles: ['Isquiotibiales', 'Estabilizadores de tobillo y cadera'],
    steps: [
      'Apoya el empeine del pie trasero en un banco plano o plataforma detrás de ti.',
      'Da un paso amplio al frente con la pierna delantera para asegurar una base sólida.',
      'Sujeta una mancuerna en cada mano con los brazos relajados a los lados.',
      'Baja flexionando la rodilla delantera hasta que el muslo quede paralelo al suelo o la rodilla trasera casi toque el piso.',
      'Empuja a través de todo el pie delantero para retornar a la posición inicial sin perder la estabilidad.'
    ],
    commonMistakes: [
      'Pisar demasiado cerca del banco recargando excesivamente la rótula.',
      'Perder el equilibrio por colocar ambos pies en la misma línea estrecha en vez del ancho de cadera.'
    ],
    breathingTip: 'Inhala en el descenso controlado (2 a 3 segundos); exhala al subir con potencia.',
    targetFocus: 'Potencia unilateral, corrección de asimetrías de piernas y máximo reclutamiento de cuádriceps y glúteo.',
    demoImages: [
      `${CDN_BASE}/Split_Squat_with_Dumbbells/0.jpg`,
      `${CDN_BASE}/Split_Squat_with_Dumbbells/1.jpg`
    ]
  },
  {
    id: 'hack_squat',
    matchPatterns: [/hack/i, /hack.*squat/i, /sentadilla.*hack/i],
    canonicalName: 'Sentadilla Hack en máquina',
    muscleGroup: 'Cuádriceps',
    pattern: 'Dominante rodilla',
    equipment: 'Máquina',
    primaryMuscle: 'Cuádriceps (Vasto externo, vasto medio y recto femoral)',
    secondaryMuscles: ['Glúteo mayor', 'Aductores'],
    steps: [
      'Coloca los hombros bajo los cojines acolchados y apoya la espalda y zona lumbar totalmente contra el respaldo.',
      'Ubica los pies en la plataforma al ancho de los hombros en posición media o baja para aislar los cuádriceps.',
      'Libera los seguros laterales y desciende flexionando las rodillas de forma muy controlada en 2-3 segundos.',
      'Baja hasta alcanzar una flexión de al menos 90° sin que la cadera ni la espalda baja se despeguen del respaldo.',
      'Empuja con fuerza contra la plataforma extendiendo las piernas sin bloquear bruscamente las rodillas en la cima.'
    ],
    commonMistakes: [
      'Despegar la zona lumbar del respaldo en el fondo (peligro para la columna).',
      'Bloquear las rodillas con impacto articular al terminar de subir.'
    ],
    breathingTip: 'Inhala en el descenso conteniendo el aire; exhala con fuerza al empujar hacia arriba.',
    targetFocus: 'Sobrecarga y aislamiento masivo del cuádriceps con máxima estabilidad espinal.',
    demoImages: [
      `${CDN_BASE}/Hack_Squat/0.jpg`,
      `${CDN_BASE}/Hack_Squat/1.jpg`
    ]
  },
  {
    id: 'front_barbell_squat',
    matchPatterns: [/sentadilla.*frontal/i, /front.*squat/i],
    canonicalName: 'Sentadilla frontal con barra (Front Squat)',
    muscleGroup: 'Cuádriceps',
    pattern: 'Dominante rodilla',
    equipment: 'Barra',
    primaryMuscle: 'Cuádriceps (Énfasis en recto femoral y vasto medial) y core anterior',
    secondaryMuscles: ['Glúteo mayor', 'Erectores torácicos', 'Aductores'],
    steps: [
      'Apoya la barra sobre los deltoides anteriores clavando los codos bien altos (paralelos al suelo) con agarre olímpico o brazos cruzados.',
      'Coloca los pies al ancho de caderas o hombros con las puntas ligeramente abiertas.',
      'Inhala y desciende manteniendo el torso completamente vertical, empujando las rodillas hacia afuera en línea con los pies.',
      'Rompe el paralelo manteniendo los codos arriba en todo momento sin que caigan.',
      'Empuja a través del medio pie y talones para regresar a la posición erguida.'
    ],
    commonMistakes: [
      'Dejar caer los codos hacia abajo provocando que la barra ruede o se encorve la espalda alta.',
      'Inclinar el torso en exceso hacia adelante perdiendo la verticalidad.'
    ],
    breathingTip: 'Inhala profundamente antes de descender manteniendo el tórax inflado y codos altos; exhala al superar la mitad de la subida.',
    targetFocus: 'Desarrollo colosal de los cuádriceps y fuerza isométrica del core anterior y espalda torácica.',
    demoImages: [
      `${CDN_BASE}/Front_Barbell_Squat/0.jpg`,
      `${CDN_BASE}/Front_Barbell_Squat/1.jpg`
    ]
  },
  {
    id: 'barbell_squat',
    matchPatterns: [/sentadilla.*trasera/i, /back.*squat/i, /sentadilla.*(con\s+)?barra.*trasera/i, /sentadilla.*pesada/i, /sentadilla.*barra/i],
    canonicalName: 'Sentadilla trasera con barra (Back Squat)',
    muscleGroup: 'Cuádriceps',
    pattern: 'Dominante rodilla',
    equipment: 'Barra',
    primaryMuscle: 'Cuádriceps (Vasto externo, interno y recto femoral)',
    secondaryMuscles: ['Glúteo mayor', 'Aductores', 'Core'],
    steps: [
      'Apoya la barra sobre los trapecios y retrae los codos hacia abajo.',
      'Pies al ancho de hombros con puntas ligeramente hacia afuera (15°-30°).',
      'Desciende flexionando rodillas y caderas simultáneamente manteniendo el pecho erguido.',
      'Baja hasta que los muslos queden al menos paralelos al suelo y empuja con todo el pie para subir.'
    ],
    commonMistakes: [
      'Colapso de rodillas hacia adentro (valgo de rodilla).',
      'Despegar los talones del suelo durante la bajada.'
    ],
    breathingTip: 'Inhala profundamente en el abdomen antes de bajar; exhala al superar la mitad de la subida.',
    targetFocus: 'Fuerza máxima y volumen de todo el tren inferior.',
    demoImages: [
      `${CDN_BASE}/Box_Squat/0.jpg`,
      `${CDN_BASE}/Box_Squat/1.jpg`
    ]
  },
  {
    id: 'goblet_squat',
    matchPatterns: [/sentadilla.*(copa|goblet)/i, /goblet.*squat/i],
    canonicalName: 'Sentadilla copa (Goblet Squat)',
    muscleGroup: 'Cuádriceps',
    pattern: 'Dominante rodilla',
    equipment: 'Kettlebell',
    primaryMuscle: 'Cuádriceps y Glúteo',
    secondaryMuscles: ['Core', 'Aductores'],
    steps: [
      'Sostén una mancuerna o kettlebell pegada al pecho con ambas manos.',
      'Desciende con la espalda muy erguida abriendo las caderas.',
      'Lleva los codos hacia el interior de las rodillas en la parte baja.',
      'Empuja contra el suelo para volver a ponerte de pie.'
    ],
    commonMistakes: ['Separar el peso del pecho haciendo palanca con los brazos.'],
    breathingTip: 'Inhala al descender; exhala al subir.',
    targetFocus: 'Excelente para pulir la profundidad y postura con bajo estrés lumbar.',
    demoImages: [
      `${CDN_BASE}/Dumbbell_Squat/0.jpg`,
      `${CDN_BASE}/Dumbbell_Squat/1.jpg`
    ]
  },
  {
    id: 'leg_press',
    matchPatterns: [/prensa/i, /leg press/i],
    canonicalName: 'Prensa de piernas inclinada a 45°',
    muscleGroup: 'Cuádriceps',
    pattern: 'Dominante rodilla',
    equipment: 'Máquina',
    primaryMuscle: 'Cuádriceps',
    secondaryMuscles: ['Glúteos', 'Isquiotibiales'],
    steps: [
      'Apoya la espalda y cadera por completo contra el respaldo acolchado.',
      'Coloca los pies a la mitad de la plataforma al ancho de hombros.',
      'Desbloquea los seguros y desciende la plataforma hasta que las rodillas alcancen un ángulo de 90°.',
      'Empuja con toda la planta del pie sin llegar a bloquear las rodillas arriba.'
    ],
    commonMistakes: [
      'Bloquear las rodillas con fuerza arriba (alto riesgo articular).',
      'Despegar el coxis/glúteos del respaldo en la bajada.'
    ],
    breathingTip: 'Inhala al flexionar las piernas; exhala al empujar la plataforma.',
    targetFocus: 'Sobrecarga de cuádriceps sin fatiga del tronco o columna.',
    demoImages: [
      `${CDN_BASE}/Leg_Press/0.jpg`,
      `${CDN_BASE}/Leg_Press/1.jpg`
    ]
  },
  {
    id: 'leg_extension',
    matchPatterns: [/extensi[oó]n(es)?.*cu[aá]driceps/i, /cu[aá]driceps.*m[aá]quina/i, /leg.*extension/i],
    canonicalName: 'Extensiones de cuádriceps en máquina',
    muscleGroup: 'Cuádriceps',
    pattern: 'Aislamiento',
    equipment: 'Máquina',
    primaryMuscle: 'Cuádriceps (Recto femoral en contracción máxima)',
    secondaryMuscles: [],
    steps: [
      'Alinea el eje de rotación de la máquina exactamente con tus rodillas.',
      'Coloca el rodillo sobre la parte baja de las tibias (justo encima de los tobillos).',
      'Extiende las piernas hacia arriba aguantando 1 segundo en la máxima contracción.',
      'Baja de forma muy controlada en 2-3 segundos.'
    ],
    commonMistakes: ['Dar patadas bruscas usando inercia en vez de tensión muscular.'],
    breathingTip: 'Exhala al subir; inhala en la bajada.',
    targetFocus: 'Aislamiento directo y detalle muscular de los cuádriceps.',
    demoImages: [
      `${CDN_BASE}/Leg_Extensions/0.jpg`,
      `${CDN_BASE}/Leg_Extensions/1.jpg`
    ]
  },
  {
    id: 'sissy_squat',
    matchPatterns: [/sissy/i, /sentadilla.*sissy/i],
    canonicalName: 'Sentadilla sissy (inclinando el cuerpo hacia atrás)',
    muscleGroup: 'Cuádriceps',
    pattern: 'Aislamiento',
    equipment: 'Peso corporal',
    primaryMuscle: 'Cuádriceps (Aislamiento extremo del recto femoral en posición elongada)',
    secondaryMuscles: ['Flexores de cadera', 'Core', 'Gemelos'],
    steps: [
      'Sujétate ligeramente a un poste o soporte estable con una mano para mantener el equilibrio.',
      'Elévate sobre las puntas de los pies y proyecta las rodillas hacia adelante mientras inclinas el torso rígidamente hacia atrás.',
      'Mantén una línea recta desde las rodillas hasta los hombros (cadera en extensión completa).',
      'Desciende hasta donde tu movilidad y rodillas lo permitan sin dolor, sintiendo una tensión brutal en el vientre del cuádriceps.',
      'Empuja con la punta de los pies contrayendo los cuádriceps para volver a la posición erguida.'
    ],
    commonMistakes: [
      'Doblar la cadera (hacer bisagra) en vez de mantener el torso y muslos alineados como una tabla.',
      'Usar peso adicional antes de dominar el control y la salud tendinosa con peso corporal.'
    ],
    breathingTip: 'Inhala mientras las rodillas viajan adelante y el torso atrás; exhala al extender las rodillas y volver arriba.',
    targetFocus: 'Hipertrofia del recto femoral y fortalecimiento del tendón rotuliano en flexión profunda.',
    demoImages: [
      `${CDN_BASE}/Weighted_Sissy_Squat/0.jpg`,
      `${CDN_BASE}/Weighted_Sissy_Squat/1.jpg`
    ]
  },
  {
    id: 'sandbag_lunges',
    matchPatterns: [/zancada.*saco/i, /sandbag.*lunge/i, /zancadas.*con.*saco/i],
    canonicalName: 'Zancadas con saco (Sandbag lunges)',
    muscleGroup: 'Cuádriceps',
    pattern: 'Dominante rodilla',
    equipment: 'Saco / Lastre',
    primaryMuscle: 'Cuádriceps, glúteos y estabilidad del core',
    secondaryMuscles: ['Isquiotibiales', 'Trapecios', 'Core profundo'],
    steps: [
      'Carga el saco sobre los hombros tras la nuca o abrázalo contra el pecho en posición frontal.',
      'Da un paso amplio al frente descendiendo la rodilla trasera hasta rozar el suelo suavemente.',
      'Ambas rodillas deben alcanzar flexión de 90° con el torso completamente erguido.',
      'Empuja a través del talón delantero para avanzar a la siguiente zancada sin perder el balance.'
    ],
    commonMistakes: [
      'Inclinar el torso excesivamente hacia adelante por el peso inestable del saco.',
      'Golpear la rodilla trasera bruscamente contra el piso.'
    ],
    breathingTip: 'Inhala al dar el paso y descender; exhala con fuerza al impulsarte y ponerte de pie.',
    targetFocus: 'Fuerza unilateral bajo carga inestable que simula esfuerzos de carreras de obstáculos e HYROX.',
    demoImages: [
      `${CDN_BASE}/Barbell_Walking_Lunge/0.jpg`,
      `${CDN_BASE}/Barbell_Walking_Lunge/1.jpg`
    ]
  },
  {
    id: 'walking_lunges',
    matchPatterns: [/zancada/i, /lunges/i, /estocada/i],
    canonicalName: 'Zancadas con mancuernas (Lunges)',
    muscleGroup: 'Cuádriceps',
    pattern: 'Dominante rodilla',
    equipment: 'Mancuernas',
    primaryMuscle: 'Cuádriceps y Glúteos',
    secondaryMuscles: ['Isquios', 'Core'],
    steps: [
      'De pie con una mancuerna a cada lado, da un paso firme hacia adelante.',
      'Baja la cadera hasta que ambas rodillas formen ángulos de 90°.',
      'La rodilla trasera roza casi el suelo con control.',
      'Empuja con el pie delantero para dar el siguiente paso.'
    ],
    commonMistakes: ['Golpear la rodilla trasera contra el suelo con brusquedad.'],
    breathingTip: 'Inhala al bajar; exhala al impulsarte hacia arriba.',
    targetFocus: 'Fuerza dinámica funcional y estabilidad de carrera.',
    demoImages: [
      `${CDN_BASE}/Dumbbell_Lunges/0.jpg`,
      `${CDN_BASE}/Dumbbell_Lunges/1.jpg`
    ]
  },

  // ==========================================
  // --- GLÚTEOS Y CADERA (DOMINANTE CADERA) ---
  // ==========================================
  {
    id: 'hip_thrust',
    matchPatterns: [/hip.*thrust/i, /empuje.*cadera/i, /empuje.*de.*cadera/i, /thrust.*barra/i],
    canonicalName: 'Hip Thrust con barra (o mancuerna)',
    muscleGroup: 'Glúteos',
    pattern: 'Dominante cadera',
    equipment: 'Barra',
    primaryMuscle: 'Glúteo Mayor (Máxima tensión en acortamiento)',
    secondaryMuscles: ['Isquiotibiales', 'Erectores espinales', 'Core'],
    steps: [
      'Apoya la espalda alta contra el banco justo debajo de los omóplatos.',
      'Coloca la barra acolchada sobre el pliegue de las caderas.',
      'Pies al ancho de hombros con los talones firmes en el suelo.',
      'Empuja con los talones elevando la pelvis hasta alinear rodillas, caderas y hombros.',
      'Aprieta los glúteos intensamente arriba durante 1-2 segundos manteniendo la barbilla al pecho.',
      'Desciende controlando la bajada sin tocar el suelo por completo.'
    ],
    commonMistakes: [
      'Arquear la espalda lumbar en vez de bascular la pelvis.',
      'Mirar hacia el techo en la contracción (debes mantener la mirada al frente).'
    ],
    breathingTip: 'Inhala al bajar la pelvis; exhala con potencia al empujar arriba y apretar los glúteos.',
    targetFocus: 'El ejercicio más eficiente y con mayor activación electromiográfica para el glúteo.',
    demoImages: [
      `${CDN_BASE}/Barbell_Hip_Thrust/0.jpg`,
      `${CDN_BASE}/Barbell_Hip_Thrust/1.jpg`
    ]
  },
  {
    id: 'cable_kickback',
    matchPatterns: [/patada.*gl[uú]teo/i, /cable.*kickback/i, /patada.*polea/i, /glute.*kickback/i],
    canonicalName: 'Patada de glúteo en polea a 30° (Cable Kickback)',
    muscleGroup: 'Glúteos',
    pattern: 'Aislamiento',
    equipment: 'Polea',
    primaryMuscle: 'Glúteo mayor (Porción superior) y glúteo medio',
    secondaryMuscles: ['Isquiotibiales', 'Core (estabilidad lumbo-pélvica)'],
    steps: [
      'Coloca la tobillera en la polea baja y engánchala a tu tobillo de trabajo.',
      'Sujeta la torre con ambas manos e inclina el torso levemente hacia adelante con la columna neutra.',
      'Patea hacia atrás y ligeramente en diagonal hacia afuera a unos 30° siguiendo la orientación natural de las fibras del glúteo.',
      'Aprieta 1 segundo en la máxima contracción arriba sin arquear la espalda baja.',
      'Regresa controlando el peso de forma pausada en 2-3 segundos.'
    ],
    commonMistakes: [
      'Arquear la espalda lumbar para subir la pierna más alto en vez de aislar el glúteo.',
      'Patear puramente recto perdiendo la alineación con las fibras del glúteo superior.'
    ],
    breathingTip: 'Exhala al patear hacia atrás; inhala al retornar la pierna a la posición inicial.',
    targetFocus: 'Aislamiento supremo y congestión de la porción superior y externa del glúteo.',
    demoImages: [
      `${CDN_BASE}/One-Legged_Cable_Kickback/0.jpg`,
      `${CDN_BASE}/One-Legged_Cable_Kickback/1.jpg`
    ]
  },
  {
    id: 'thigh_abductor',
    matchPatterns: [/abducci[oó]n.*cadera/i, /abductor.*m[aá]quina/i, /thigh.*abductor/i, /m[aá]quina.*abductora/i, /abducci[oó]n.*m[aá]quina/i],
    canonicalName: 'Abducción de cadera en máquina (Glúteo Medio)',
    muscleGroup: 'Glúteos',
    pattern: 'Aislamiento',
    equipment: 'Máquina',
    primaryMuscle: 'Glúteo medio y glúteo menor',
    secondaryMuscles: ['Tensor de la fascia lata', 'Piriforme'],
    steps: [
      'Siéntate en la máquina de abductor apoyando la espalda en el respaldo o ligeramente inclinada al frente para maximizar el brazo de palanca.',
      'Coloca la parte exterior de las rodillas contra las almohadillas.',
      'Separa las piernas empujando hacia afuera contra la resistencia mediante la fuerza de tus glúteos.',
      'Aguanta 1 a 2 segundos en máxima apertura y regresa controlando el cierre lentamente en 2-3 segundos.'
    ],
    commonMistakes: [
      'Usar impulso o rebotar las almohadillas en vez de controlar la fase excéntrica.',
      'Despegar la cadera del asiento.'
    ],
    breathingTip: 'Exhala al abrir las piernas; inhala al regresar al centro.',
    targetFocus: 'Hipertrofia del glúteo medio, redondez lateral de la cadera y estabilidad de pelvis.',
    demoImages: [
      `${CDN_BASE}/Thigh_Abductor/0.jpg`,
      `${CDN_BASE}/Thigh_Abductor/1.jpg`
    ]
  },
  {
    id: 'romanian_deadlift',
    matchPatterns: [/peso muerto rumano/i, /rdl/i, /rumano.*barra/i, /rumano.*mancuerna/i],
    canonicalName: 'Peso muerto rumano (RDL) con barra o mancuernas',
    muscleGroup: 'Isquios y Glúteo',
    pattern: 'Dominante cadera',
    equipment: 'Barra',
    primaryMuscle: 'Isquiotibiales y Glúteo mayor (Tensión en elongación)',
    secondaryMuscles: ['Erectores espinales', 'Trapecio', 'Fuerza de agarre'],
    steps: [
      'Ponte de pie sosteniendo la carga al frente con brazos rectos.',
      'Con las rodillas apenas semi-flexionadas (desbloqueadas), empuja la cadera hacia atrás como si quisieras tocar la pared detrás de ti.',
      'Desliza la barra pegada a los muslos hasta justo debajo de las rodillas o media tibia sintiendo el estiramiento en los isquios.',
      'Extiende la cadera hacia adelante contrayendo los glúteos para volver arriba.'
    ],
    commonMistakes: [
      'Doblar las rodillas como en una sentadilla perdiendo la tensión en la cadena posterior.',
      'Encorvar la espalda lumbar al bajar demasiado.'
    ],
    breathingTip: 'Inhala antes de iniciar la bisagra de cadera; exhala al retornar a la vertical.',
    targetFocus: 'Sobrecarga de glúteos e isquiotibiales en estiramiento, clave para hipertrofia profunda.',
    demoImages: [
      `${CDN_BASE}/Romanian_Deadlift/0.jpg`,
      `${CDN_BASE}/Romanian_Deadlift/1.jpg`
    ]
  },
  {
    id: 'seated_leg_curl',
    matchPatterns: [/curl.*femoral.*sentado/i, /femoral.*sentado/i, /seated.*leg.*curl/i],
    canonicalName: 'Curl femoral sentado en máquina',
    muscleGroup: 'Isquios y Glúteo',
    pattern: 'Aislamiento',
    equipment: 'Máquina',
    primaryMuscle: 'Isquiotibiales (Bíceps femoral, semitendinoso y semimembranoso en máxima elongación)',
    secondaryMuscles: ['Gastrocnemio (gemelos)'],
    steps: [
      'Ajusta el respaldo de la máquina para que tus rodillas queden alineadas con el eje de giro de la palanca.',
      'Baja la almohadilla superior sobre tus muslos para fijar las piernas e impedir que se eleven durante la flexión.',
      'Coloca el rodillo inferior justo detrás de los tobillos (sobre los tendones de Aquiles).',
      'Flexiona las rodillas tirando del rodillo hacia abajo y atrás con fuerza, apretando los isquios durante 1 a 2 segundos en la máxima contracción.',
      'Regresa de forma controlada en 3 segundos sintiendo el estiramiento profundo de los isquiotibiales.'
    ],
    commonMistakes: [
      'Despegar los muslos del asiento por no fijar la almohadilla superior.',
      'Dejar caer el peso en el retorno sin controlar la fase excéntrica.'
    ],
    breathingTip: 'Inhala al estirar las piernas hacia adelante; exhala al flexionar con fuerza hacia abajo.',
    targetFocus: 'Mayor hipertrofia de isquiotibiales debido a la posición de cadera a 90° que elonga el músculo al máximo (evidencia científica de superioridad frente al curl tumbado).',
    demoImages: [
      `${CDN_BASE}/Seated_Leg_Curl/0.jpg`,
      `${CDN_BASE}/Seated_Leg_Curl/1.jpg`
    ]
  },
  {
    id: 'lying_leg_curl',
    matchPatterns: [/curl.*femoral.*(tumbado|acostado|prono)/i, /curl.*femoral/i, /leg curl/i, /femoral.*acostado/i],
    canonicalName: 'Curl femoral tumbado en máquina',
    muscleGroup: 'Isquios y Glúteo',
    pattern: 'Aislamiento',
    equipment: 'Máquina',
    primaryMuscle: 'Isquiotibiales (Bíceps femoral, semitendinoso)',
    secondaryMuscles: ['Gemelos'],
    steps: [
      'Acuéstate boca abajo con el rodillo apoyado en la parte posterior de los tobillos.',
      'Sujeta los agarres y mantén las caderas pegadas a la almohadilla.',
      'Flexiona las rodillas subiendo los talones hacia los glúteos con control.',
      'Sostén 1 segundo arriba y desciende en 3 segundos resistiendo el peso.'
    ],
    commonMistakes: ['Despegar la pelvis del banco arqueando la espalda para ayudarse.'],
    breathingTip: 'Exhala al flexionar; inhala al extender.',
    targetFocus: 'Aislamiento estricto de isquiotibiales para salud de rodilla.',
    demoImages: [
      `${CDN_BASE}/Lying_Leg_Curls/0.jpg`,
      `${CDN_BASE}/Lying_Leg_Curls/1.jpg`
    ]
  },

  // ==========================================
  // --- PANTORRILLAS / GEMELOS ---
  // ==========================================
  {
    id: 'seated_calf_raise',
    matchPatterns: [/talon.*sentado/i, /talón.*sentado/i, /gemelo.*sentado/i, /pantorrilla.*sentado/i, /seated.*calf/i, /elevaci[oó]n.*talones.*sentado/i],
    canonicalName: 'Elevación de talones sentado en máquina',
    muscleGroup: 'Isquios y Glúteo',
    pattern: 'Aislamiento',
    equipment: 'Máquina',
    primaryMuscle: 'Sóleo (Aislamiento directo con rodilla en flexión de 90°)',
    secondaryMuscles: ['Gastrocnemio profundo', 'Tendón de Aquiles'],
    steps: [
      'Siéntate en la máquina de sóleo apoyando la parte delantera de los pies (metatarso) en la plataforma.',
      'Ajusta la almohadilla acolchada sobre los muslos justo por encima de las rodillas.',
      'Libera la palanca de seguridad y desciende los talones de forma lenta y profunda hasta sentir un estiramiento completo en la parte baja de la pantorrilla.',
      'Impúlsate hacia arriba sobre las puntas de los pies contrayendo el sóleo con fuerza.',
      'Aguanta 1 a 2 segundos en el punto de máxima contracción antes de volver a descender con control.'
    ],
    commonMistakes: [
      'Rebotar el peso en el fondo usando la elasticidad del tendón de Aquiles.',
      'Hacer repeticiones cortas sin llegar al estiramiento inferior ni al bloqueo superior.'
    ],
    breathingTip: 'Inhala en el estiramiento profundo; exhala con fuerza al empujar y elevar los talones.',
    targetFocus: 'Hipertrofia del sóleo (músculo monoarticular clave para el ancho de la pantorrilla y absorción de impacto en carrera).',
    demoImages: [
      `${CDN_BASE}/Barbell_Seated_Calf_Raise/0.jpg`,
      `${CDN_BASE}/Barbell_Seated_Calf_Raise/1.jpg`
    ]
  },
  {
    id: 'standing_calf_raises',
    matchPatterns: [/talon/i, /talón/i, /gemelo/i, /pantorrilla/i, /calf/i],
    canonicalName: 'Elevación de talones (de pie o en máquina)',
    muscleGroup: 'Isquios y Glúteo',
    pattern: 'Aislamiento',
    equipment: 'Máquina',
    primaryMuscle: 'Gastrocnemio y Sóleo (Pantorrillas)',
    secondaryMuscles: ['Tibial anterior', 'Flexores plantares', 'Estabilizadores de tobillo'],
    steps: [
      'Apoya la punta de los pies (metatarso) en el borde de la plataforma o escalón, dejando los talones libres en el aire.',
      'Baja los talones despacio por debajo del nivel de la plataforma sintiendo un estiramiento profundo en los gemelos.',
      'Impúlsate hacia arriba sobre las puntas de los pies contrayendo las pantorrillas con fuerza.',
      'Aguanta 1 a 2 segundos en el punto más alto de contracción antes de volver a descender con control.'
    ],
    commonMistakes: [
      'Rebotar en la parte baja usando la elasticidad del tendón en lugar de fuerza muscular.',
      'Doblar las rodillas en una elevación de pie (deben permanecer estables y casi rectas).'
    ],
    breathingTip: 'Inhala en el estiramiento abajo; exhala al elevarte sobre las puntas de los pies.',
    targetFocus: 'Desarrollo de los gemelos, estabilidad de tobillo y potencia de despegue en carrera.',
    demoImages: [
      `${CDN_BASE}/Standing_Calf_Raises/0.jpg`,
      `${CDN_BASE}/Standing_Calf_Raises/1.jpg`
    ]
  },

  // ==========================================
  // --- PESO MUERTO Y CADENA POSTERIOR ---
  // ==========================================
  {
    id: 'barbell_deadlift',
    matchPatterns: [/peso muerto.*(convencional|sumo|trap|hexagonal|pesado)/i, /peso muerto con barra/i],
    canonicalName: 'Peso muerto con barra (convencional, sumo o hexagonal)',
    muscleGroup: 'Isquios y Glúteo',
    pattern: 'Dominante cadera',
    equipment: 'Barra',
    primaryMuscle: 'Cadena posterior completa (Glúteos, isquiotibiales y erectores espinales)',
    secondaryMuscles: ['Dorsales', 'Trapecios', 'Core', 'Fuerza de agarre'],
    steps: [
      'Colócate con la barra pegada a las tibias, pies al ancho de caderas y espalda totalmente recta.',
      'Agarra la barra por fuera de las rodillas, baja la cadera y activa los dorsales protegiendo la columna.',
      'Empuja contra el suelo extendiendo rodillas y caderas al mismo tiempo.',
      'Bloquea la cadera arriba con glúteos apretados sin hiperextender la espalda baja.'
    ],
    commonMistakes: [
      'Encorvar la espalda lumbar al levantar la carga.',
      'Separar la barra del cuerpo aumentando la palanca sobre las lumbares.'
    ],
    breathingTip: 'Inhala hondo y fija el abdomen antes de despegar; exhala al completar el bloqueo arriba.',
    targetFocus: 'Fuerza máxima absoluta de todo el cuerpo y densidad de cadena posterior.',
    demoImages: [
      `${CDN_BASE}/Barbell_Deadlift/0.jpg`,
      `${CDN_BASE}/Barbell_Deadlift/1.jpg`
    ]
  },
  {
    id: 'hyperextensions',
    matchPatterns: [/hiperextension/i, /hiperextensión/i],
    canonicalName: 'Hiperextensión a 45° (Glúteo e Isquios)',
    muscleGroup: 'Isquios y Glúteo',
    pattern: 'Dominante cadera',
    equipment: 'Caja / Banco',
    primaryMuscle: 'Glúteo mayor y erectores espinales',
    secondaryMuscles: ['Isquiotibiales'],
    steps: [
      'Ajusta el cojín de la banca de hiperextensiones justo por debajo de las caderas para permitir flexión libre.',
      'Cruza los brazos sobre el pecho o sujeta un disco pegado.',
      'Baja flexionando la cadera con la espalda neutra hasta sentir estiramiento.',
      'Sube contrayendo fuertemente los glúteos hasta alinear el cuerpo.'
    ],
    commonMistakes: ['Hiperextender la columna hacia atrás al subir en vez de apretar los glúteos.'],
    breathingTip: 'Inhala al bajar; exhala al subir.',
    targetFocus: 'Salud lumbar y fortalecimiento de glúteos sin impacto articular.',
    demoImages: [
      `${CDN_BASE}/Hyperextensions_Back_Extensions/0.jpg`,
      `${CDN_BASE}/Hyperextensions_Back_Extensions/1.jpg`
    ]
  },
  {
    id: 'step_ups',
    matchPatterns: [/step-?up/i, /subidas.*caja/i, /caja.*mancuerna/i],
    canonicalName: 'Step-Up con mancuernas en banco o caja',
    muscleGroup: 'Cuádriceps',
    pattern: 'Dominante rodilla',
    equipment: 'Mancuernas',
    primaryMuscle: 'Cuádriceps y Glúteo mayor',
    secondaryMuscles: ['Isquiotibiales', 'Pantorrillas', 'Core'],
    steps: [
      'Coloca un pie completo sobre la caja o banco.',
      'Impúlsate exclusivamente con la pierna delantera sin dar un salto con la pierna de abajo.',
      'Extiende por completo la cadera arriba y desciende de forma lenta y controlada.'
    ],
    commonMistakes: ['Impulsarse con la pantorrilla del pie de apoyo en el suelo.'],
    breathingTip: 'Exhala al subir; inhala al bajar.',
    targetFocus: 'Fuerza unilateral y transferencia directa a la zancada de carrera.',
    demoImages: [
      `${CDN_BASE}/Dumbbell_Step_Ups/0.jpg`,
      `${CDN_BASE}/Dumbbell_Step_Ups/1.jpg`
    ]
  },
  {
    id: 'glute_bridge_frog',
    matchPatterns: [/frog pump/i, /elevacion.*pelvis/i, /elevación.*pelvis/i, /puente.*suelo/i, /puente.*gl[uú]teo/i, /glute.*bridge/i],
    canonicalName: 'Puente de glúteos en suelo con peso',
    muscleGroup: 'Glúteos',
    pattern: 'Dominante cadera',
    equipment: 'Barra',
    primaryMuscle: 'Glúteo mayor y medio',
    secondaryMuscles: ['Isquios', 'Core'],
    steps: [
      'Acuéstate boca arriba en el suelo con las rodillas flexionadas a 90° y los pies apoyados al ancho de las caderas.',
      'Coloca una barra acolchada o mancuerna pesada sobre la pelvis sujetándola firmemente con ambas manos.',
      'Empuja a través de los talones elevando las caderas hasta formar una línea recta diagonal desde las rodillas hasta los hombros.',
      'Aprieta los glúteos intensamente durante 1 a 2 segundos en la cúspide sin arquear las lumbares.',
      'Desciende de forma suave y controlada rozando apenas el suelo antes de la siguiente repetición.'
    ],
    commonMistakes: [
      'Arquear la columna lumbar en vez de bascular la pelvis hacia arriba.',
      'Empujar con la punta de los pies en vez de anclar los talones.'
    ],
    breathingTip: 'Inhala al apoyar la espalda; exhala con potencia al elevar la pelvis y contraer los glúteos.',
    targetFocus: 'Activación y congestión masiva del glúteo mayor sin sobrecarga sobre la columna.',
    demoImages: [
      `${CDN_BASE}/Barbell_Glute_Bridge/0.jpg`,
      `${CDN_BASE}/Barbell_Glute_Bridge/1.jpg`
    ]
  },

  // ==========================================
  // --- CORE Y ABDOMEN ---
  // ==========================================
  {
    id: 'hanging_leg_raise',
    matchPatterns: [/elevacion.*pierna/i, /elevación.*pierna/i, /elevacion.*rodilla/i, /elevación.*rodilla/i, /leg raise/i, /knee raise/i],
    canonicalName: 'Elevación de piernas / rodillas (colgado o en paralelas)',
    muscleGroup: 'Core',
    pattern: 'Aislamiento',
    equipment: 'Peso corporal',
    primaryMuscle: 'Recto abdominal inferior e iliopsoas',
    secondaryMuscles: ['Oblicuos', 'Antebrazos (agarre)'],
    steps: [
      'Cuélgate de una barra o apoya los antebrazos en la estación de paralelas con el torso vertical.',
      'Sin balancear el cuerpo, eleva las rodillas o piernas rectas hacia el pecho.',
      'Bascula ligeramente la pelvis hacia arriba para activar el abdomen y no solo los flexores de cadera.',
      'Baja lentamente sin balanceos.'
    ],
    commonMistakes: ['Columpiarse para usar inercia en vez de contracción abdominal.'],
    breathingTip: 'Exhala al elevar las piernas; inhala al descender.',
    targetFocus: 'Fuerza profunda del core y compresión abdominal.',
    demoImages: [
      `${CDN_BASE}/Hanging_Leg_Raise/0.jpg`,
      `${CDN_BASE}/Hanging_Leg_Raise/1.jpg`
    ]
  },
  {
    id: 'crunches_floor',
    matchPatterns: [/crunch.*(colchoneta|suelo|suave|controlado)/i, /crunches.*(colchoneta|suelo)/i, /^(\d+\s*)?(abdominales tipo crunch|crunches en colchoneta)/i],
    canonicalName: 'Crunches en colchoneta (Suelo)',
    muscleGroup: 'Core',
    pattern: 'Aislamiento',
    equipment: 'Peso corporal',
    primaryMuscle: 'Recto anterior del abdomen (porción superior y media)',
    secondaryMuscles: ['Oblicuos'],
    steps: [
      'Acuéstate boca arriba en la colchoneta con las rodillas flexionadas y los pies firmes en el suelo.',
      'Coloca las yemas de los dedos detrás de las orejas sin tirar de la nuca ni flexionar el cuello.',
      'Enrolla la columna despegando los omóplatos del suelo y contrayendo intensamente el abdomen.',
      'Pausa 1 segundo en el punto máximo de contracción y desciende de forma controlada hasta rozar la colchoneta.'
    ],
    commonMistakes: [
      'Tirar de la cabeza con las manos provocando tensión cervical.',
      'Despegar toda la espalda baja del suelo convirtiéndolo en una flexión de cadera.'
    ],
    breathingTip: 'Inhala en el suelo; exhala al despegar los omóplatos y contraer el abdomen.',
    targetFocus: 'Aislamiento directo y seguro del recto abdominal sin necesidad de máquinas ni poleas.',
    demoImages: [
      `${CDN_BASE}/Crunches/0.jpg`,
      `${CDN_BASE}/Crunches/1.jpg`
    ]
  },
  {
    id: 'air_bike',
    matchPatterns: [/bicicleta/i, /bicycle/i, /air.*bike/i],
    canonicalName: 'Abdominales bicicleta (Air bike crunches)',
    muscleGroup: 'Core',
    pattern: 'Aislamiento',
    equipment: 'Peso corporal',
    primaryMuscle: 'Oblicuos y recto anterior del abdomen',
    secondaryMuscles: ['Flexores de cadera', 'Transverso abdominal'],
    steps: [
      'Acuéstate sobre la colchoneta con las manos tras las orejas y eleva las piernas con rodillas flexionadas a 90°.',
      'Lleva el codo derecho hacia la rodilla izquierda mientras extiendes la pierna derecha al frente.',
      'Alterna los lados de forma continua y fluida coordinando la rotación de hombros con el pedaleo.',
      'Mantén la espalda baja en contacto con el suelo sin balancear el torso.'
    ],
    commonMistakes: [
      'Tirar del cuello con los brazos o pedalear demasiado rápido sin control muscular.',
      'Dejar que la zona lumbar se arquee al extender la pierna.'
    ],
    breathingTip: 'Exhala en cada cruce de codo con rodilla contraria; mantén un ritmo respiratorio constante.',
    targetFocus: 'Alta activación electromiográfica combinada de oblicuos y recto abdominal.',
    demoImages: [
      `${CDN_BASE}/Air_Bike/0.jpg`,
      `${CDN_BASE}/Air_Bike/1.jpg`
    ]
  },
  {
    id: 'cable_crunch',
    matchPatterns: [/polea.*(crunch|abdominal)/i, /abdominal.*polea/i, /cable.*crunch/i, /crunches.*polea/i, /crunch.*polea/i],
    canonicalName: 'Abdominales en polea alta (Cable crunches)',
    muscleGroup: 'Core',
    pattern: 'Aislamiento',
    equipment: 'Polea',
    primaryMuscle: 'Recto anterior del abdomen y faja central',
    secondaryMuscles: ['Oblicuos', 'Serrato anterior'],
    steps: [
      'Arrodíllate frente a la polea alta con el accesorio de cuerda.',
      'Sujeta la cuerda a los lados de la cabeza a la altura de las sienes y mantén los brazos anclados sin moverlos por separado.',
      'Enrolla la columna vertebral contrayendo los abdominales, llevando los codos hacia los muslos.',
      'Pausa 1 segundo en la máxima contracción apretando el abdomen intensamente.',
      'Regresa lentamente desenrollando la columna hasta la posición de estiramiento sin mover las caderas.'
    ],
    commonMistakes: [
      'Mover las caderas hacia atrás como en una sentadilla en vez de flexionar la columna.',
      'Tirar con los brazos y tríceps en lugar de usar la contracción del abdomen.'
    ],
    breathingTip: 'Inhala al abrir el torso arriba; exhala con fuerza al enrollar y contraer el abdomen.',
    targetFocus: 'Sobrecarga progresiva real del recto abdominal con tensión continua en todo el rango articular.',
    demoImages: [
      `${CDN_BASE}/Cable_Crunch/0.jpg`,
      `${CDN_BASE}/Cable_Crunch/1.jpg`
    ]
  },
  {
    id: 'ab_wheel_crunches',
    matchPatterns: [/rueda.*abdominal/i, /ab.*wheel/i, /ab.*rollout/i],
    canonicalName: 'Rueda abdominal (Ab Wheel Rollout)',
    muscleGroup: 'Core',
    pattern: 'Aislamiento',
    equipment: 'Peso corporal',
    primaryMuscle: 'Recto anterior del abdomen y estabilidad lumbopélvica',
    secondaryMuscles: ['Dorsales', 'Serrato anterior', 'Glúteos'],
    steps: [
      'Arrodíllate en el suelo sujetando los manillares de la rueda abdominal directamente bajo los hombros.',
      'Rueda hacia adelante extendiendo el cuerpo manteniendo la espalda ligeramente redondeada (pelvis en retroversión).',
      'Tira con los abdominales comprimiendo el torso para regresar a la posición inicial sin dejar caer la cadera.'
    ],
    commonMistakes: [
      'Dejar caer la pelvis arqueando las lumbares (riesgo lumbar).',
      'Iniciar el retorno flexionando las caderas hacia atrás en lugar de tirar con el abdomen.'
    ],
    breathingTip: 'Inhala al extenderte al frente; exhala con fuerza al comprimir el abdomen para volver.',
    targetFocus: 'Anti-extensión del core y fuerza funcional profunda.',
    demoImages: [
      `${CDN_BASE}/Ab_Roller/0.jpg`,
      `${CDN_BASE}/Ab_Roller/1.jpg`
    ]
  },
  {
    id: 'russian_twist',
    matchPatterns: [/giro.*ruso/i, /russian.*twist/i, /giros.*rusos/i],
    canonicalName: 'Giros rusos (Russian twists)',
    muscleGroup: 'Core',
    pattern: 'Aislamiento',
    equipment: 'Peso corporal',
    primaryMuscle: 'Oblicuos internos y externos',
    secondaryMuscles: ['Recto anterior del abdomen', 'Transverso abdominal'],
    steps: [
      'Siéntate en el suelo con las rodillas flexionadas y reclina el torso hacia atrás unos 45° manteniendo la espalda recta.',
      'Eleva los pies ligeramente del suelo para mayor activación o déjalos apoyados si eres principiante.',
      'Gira el torso de un lado al otro llevando las manos hacia la cadera opuesta en un movimiento controlado.',
      'Siente la torsión controlada desde el core en cada rotación sin redondear los hombros.'
    ],
    commonMistakes: [
      'Mover solo los brazos sin rotar realmente el torso.',
      'Encorvar la zona lumbar perdiendo la tensión del abdomen.'
    ],
    breathingTip: 'Exhala en cada giro lateral; inhala en la transición central.',
    targetFocus: 'Fuerza rotacional y definición de los oblicuos y pared abdominal.',
    demoImages: [
      `${CDN_BASE}/Russian_Twist/0.jpg`,
      `${CDN_BASE}/Russian_Twist/1.jpg`
    ]
  },
  {
    id: 'plank_core',
    matchPatterns: [/plancha/i, /plank/i],
    canonicalName: 'Plancha abdominal isométrica',
    muscleGroup: 'Core',
    pattern: 'Aislamiento',
    equipment: 'Peso corporal',
    primaryMuscle: 'Transverso abdominal y recto anterior',
    secondaryMuscles: ['Glúteos', 'Deltoides', 'Cuádriceps'],
    steps: [
      'Apóyate sobre los antebrazos y las puntas de los pies en el suelo.',
      'Alinea hombros, caderas y tobillos en una línea recta sólida.',
      'Aprieta con fuerza el abdomen y los glúteos sin permitir que la cadera se hunda.',
      'Respira de forma controlada manteniendo la tensión isométrica.'
    ],
    commonMistakes: ['Dejar caer la pelvis arqueando las lumbares.'],
    breathingTip: 'Respiraciones cortas y diafragmáticas sin perder la rigidez abdominal.',
    targetFocus: 'Estabilidad central y protección de la columna.',
    demoImages: [
      `${CDN_BASE}/Plank/0.jpg`,
      `${CDN_BASE}/Plank/1.jpg`
    ]
  },

  // ==========================================
  // --- CARDIO, METABÓLICO, HYROX Y AGARRE ---
  // ==========================================
  {
    id: 'skierg',
    matchPatterns: [/skierg/i, /esqu[ií]/i, /m[aá]quina.*de.*esqu[ií]/i],
    canonicalName: 'SkiErg (máquina de esquí nórdico)',
    muscleGroup: 'Cardio y Metabólico',
    pattern: 'Metabólico',
    equipment: 'Ergómetro',
    primaryMuscle: 'Dorsal ancho, tríceps, core anterior y acondicionamiento aeróbico/anaeróbico',
    secondaryMuscles: ['Deltoides posterior', 'Glúteos', 'Isquiotibiales'],
    steps: [
      'Párate frente al SkiErg con los pies al ancho de las caderas y toma las empuñaduras por encima de la cabeza con brazos semi-flexionados.',
      'Inicia la tracción flexionando el core y caderas hacia abajo mientras tiras con fuerza hacia los muslos.',
      'Termina la brazada pasando las manos más allá de las caderas en una bisagra de cadera fluida.',
      'Regresa de forma elástica extendiendo caderas y elevando los brazos para preparar la siguiente palada.'
    ],
    commonMistakes: [
      'Tirar solo con los brazos sin involucrar la bisagra de cadera y el peso corporal.',
      'Flexionar en exceso las rodillas convirtiendo la tracción en una sentadilla profunda.'
    ],
    breathingTip: 'Exhala con fuerza al traccionar hacia abajo; inhala en la fase de elevación y recuperación de los brazos.',
    targetFocus: 'Potencia metabólica de tracción vertical continua y resistencia anaeróbica de la cadena anterior.',
    demoImages: [
      `${CDN_BASE}/Rope_Straight-Arm_Pulldown/0.jpg`,
      `${CDN_BASE}/Rope_Straight-Arm_Pulldown/1.jpg`
    ]
  },
  {
    id: 'sled_push',
    matchPatterns: [/empuje.*trineo/i, /sled.*push/i],
    canonicalName: 'Empuje de trineo (Sled push)',
    muscleGroup: 'Cuádriceps',
    pattern: 'Dominante rodilla',
    equipment: 'Saco / Lastre',
    primaryMuscle: 'Cuádriceps, glúteos y pantorrillas',
    secondaryMuscles: ['Core', 'Deltoides anterior', 'Erectores lumbares'],
    steps: [
      'Coloca las manos en los postes verticales del trineo con los brazos extendidos y firmes.',
      'Inclina el cuerpo hacia adelante formando una línea recta sólida de 45° desde los tobillos hasta la cabeza.',
      'Conduce las rodillas hacia adelante con pasos cortos, potentes y continuos empujando contra el suelo con el antepié.',
      'Mantén la pelvis estable y la cadera baja sin permitir oscilaciones laterales.'
    ],
    commonMistakes: [
      'Erguir el torso perdiendo el ángulo de empuje de 45° contra el trineo.',
      'Dar zancadas demasiado largas que desestabilizan la pelvis.'
    ],
    breathingTip: 'Respira con cadencia rítmica forzada manteniendo la presión intraabdominal.',
    targetFocus: 'Potencia concéntrica pura de piernas sin sobrecarga excéntrica ni agujetas asociadas.',
    demoImages: [
      `${CDN_BASE}/Sled_Push/0.jpg`,
      `${CDN_BASE}/Sled_Push/1.jpg`
    ]
  },
  {
    id: 'sled_pull',
    matchPatterns: [/arrastre.*trineo/i, /sled.*pull/i, /trineo.*jal[oó]n/i],
    canonicalName: 'Arrastre de trineo (Sled pull)',
    muscleGroup: 'Espalda',
    pattern: 'Tracción horizontal',
    equipment: 'Saco / Lastre',
    primaryMuscle: 'Espalda alta, glúteos, isquiotibiales y cuádriceps',
    secondaryMuscles: ['Bíceps', 'Antebrazos (agarre)', 'Core'],
    steps: [
      'Engancha las correas o cuerda al trineo y sujeta los extremos con ambas manos o colócate el arnés.',
      'Flexiona rodillas y caderas con el torso inclinado hacia atrás en contraposición a la carga.',
      'Tracciona el trineo mediante pasos firmes hacia atrás o tirando de la cuerda mano a mano de forma constante.',
      'Mantén la columna neutra y el core activo durante todo el arrastre.'
    ],
    commonMistakes: [
      'Encorvar la espalda lumbar al fatigarse.',
      'Dejar que el trineo pierda inercia frenándose por completo.'
    ],
    breathingTip: 'Inhala profundamente y exhala en cada paso o tirón potente con la espalda rígida.',
    targetFocus: 'Fuerza funcional de tracción, salud de rodilla y capacidad de trabajo de cadena posterior.',
    demoImages: [
      `${CDN_BASE}/Sled_Drag_-_Harness/0.jpg`,
      `${CDN_BASE}/Sled_Drag_-_Harness/1.jpg`
    ]
  },
  {
    id: 'burpee_broad_jumps',
    matchPatterns: [/burpee.*salto.*largo/i, /burpee.*broad.*jump/i, /salto.*largo/i],
    canonicalName: 'Burpee con salto largo (Burpee broad jumps)',
    muscleGroup: 'Cardio y Metabólico',
    pattern: 'Metabólico',
    equipment: 'Peso corporal',
    primaryMuscle: 'Capacidad glucolítica de cuerpo completo, cuádriceps y glúteos',
    secondaryMuscles: ['Pectorales', 'Tríceps', 'Core', 'Pantorrillas'],
    steps: [
      'Desde posición de pie, apoya las manos en el suelo y lanza los pies atrás aterrizando en posición de flexión.',
      'Toca el pecho en el suelo de forma controlada y empuja para volver con los pies justo por fuera de las manos.',
      'Carga las caderas en bisagra y balancéate con los brazos hacia adelante para realizar un salto horizontal explosivo.',
      'Aterriza suavemente en media sentadilla absorbiendo el impacto con rodillas y caderas.'
    ],
    commonMistakes: [
      'Aterrizar con las piernas rígidas transmitiendo el impacto directo a las rodillas.',
      'Arquear la columna lumbar al salir del suelo en el burpee.'
    ],
    breathingTip: 'Inhala al bajar al suelo; exhala con fuerza al saltar hacia adelante.',
    targetFocus: 'Potencia explosiva horizontal combinada con resistencia anaeróbica de alta intensidad.',
    demoImages: [
      `${CDN_BASE}/Standing_Long_Jump/0.jpg`,
      `${CDN_BASE}/Standing_Long_Jump/1.jpg`
    ]
  },
  {
    id: 'rowing_ergometer',
    matchPatterns: [/remo.*en\s+m[aá]quina.*\(rowing\)/i, /remo.*erg[oó]metro/i, /concept2/i, /rowing/i],
    canonicalName: 'Remo en máquina (Rowing)',
    muscleGroup: 'Cardio y Metabólico',
    pattern: 'Metabólico',
    equipment: 'Ergómetro',
    primaryMuscle: 'Piernas (60%), cadera/espalda (20%) y brazos (20%)',
    secondaryMuscles: ['Dorsales', 'Bíceps', 'Glúteos', 'Isquiotibiales', 'Core'],
    steps: [
      'Ajusta las correas en el tercio superior de los pies y toma la empuñadura con agarre prono.',
      'Inicia el ataque flexionando rodillas con el torso inclinado a las 11 en punto.',
      'Empuja potentemente con las piernas, bascula el torso a la 1 en punto y tira de la empuñadura hacia la base de las costillas.',
      'Para la recuperación, invierte la secuencia: primero extiende brazos, inclina torso y luego flexiona rodillas.'
    ],
    commonMistakes: [
      'Doblar las rodillas antes de pasar la barra por encima de ellas en la recuperación.',
      'Tirar con los brazos antes de que las piernas hayan completado el empuje.'
    ],
    breathingTip: 'Exhala durante el empuje y tracción potente; inhala en la fase de retorno y preparación.',
    targetFocus: 'Potencia cardiovascular sostenida y coordinación neuromuscular de cuerpo entero.',
    demoImages: [
      `${CDN_BASE}/Rowing_Stationary/0.jpg`,
      `${CDN_BASE}/Rowing_Stationary/1.jpg`
    ]
  },
  {
    id: 'farmers_carry',
    matchPatterns: [/paseo.*granjero/i, /farmer.*carry/i, /farmer.*walk/i],
    canonicalName: 'Paseo del granjero (Farmers carry)',
    muscleGroup: 'Cardio y Metabólico',
    pattern: 'Carga y Agarre',
    equipment: 'Kettlebell',
    primaryMuscle: 'Fuerza de agarre (antebrazos), trapecios y core antirrotación/antiflexión lateral',
    secondaryMuscles: ['Glúteos', 'Cuádriceps', 'Pantorrillas', 'Dorsales'],
    steps: [
      'Colócate entre dos mancuernas, kettlebells o barras de carga pesadas.',
      'Haz peso muerto para levantarlas con la espalda totalmente recta y el pecho alto.',
      'Camina con pasos cortos y rápidos mirando al frente, con los hombros empaquetados atrás y abajo.',
      'Mantén el torso perfectamente rígido evitando cualquier balanceo lateral de las cargas.'
    ],
    commonMistakes: [
      'Dejar que los hombros caigan hacia adelante perdiendo la retracción y depresión escapular.',
      'Caminar con zancadas largas desestabilizando la pelvis.'
    ],
    breathingTip: 'Respiraciones superficiales y continuas manteniendo el diafragma y core comprimidos.',
    targetFocus: 'Fuerza brutal de prensión manual, estabilidad lumbopélvica y resistencia en carga.',
    demoImages: [
      `${CDN_BASE}/Farmers_Walk/0.jpg`,
      `${CDN_BASE}/Farmers_Walk/1.jpg`
    ]
  },
  {
    id: 'wall_balls',
    matchPatterns: [/bal[oó]n.*pared/i, /wall.*ball/i, /lanzamiento.*bal[oó]n/i],
    canonicalName: 'Lanzamientos de balón a la pared (Wall balls)',
    muscleGroup: 'Cardio y Metabólico',
    pattern: 'Metabólico',
    equipment: 'Saco / Lastre',
    primaryMuscle: 'Cuádriceps, glúteos, deltoides y acondicionamiento metabólico',
    secondaryMuscles: ['Pectorales', 'Tríceps', 'Core anterior'],
    steps: [
      'Sostén el balón medicinal con ambas manos a la altura de la barbilla y pecho, codos recogidos.',
      'Desciende en una sentadilla completa rompiendo el paralelo con el torso erguido.',
      'Sube de manera explosiva y, al extender cadera y rodillas, transfiere la potencia empujando el balón hacia la diana en la pared.',
      'Recibe el balón en el pecho con las manos amortiguando la caída y entra de inmediato en la siguiente sentadilla.'
    ],
    commonMistakes: [
      'No romper el paralelo en la sentadilla perdiendo eficiencia mecánica.',
      'Lanzar el balón solo con los hombros sin transferir la inercia del empuje de piernas.'
    ],
    breathingTip: 'Inhala en el descenso de la sentadilla; exhala con potencia al lanzar el balón a la diana.',
    targetFocus: 'Potencia metabólica combinada de tren inferior y empuje vertical de tren superior.',
    demoImages: [
      `${CDN_BASE}/Catch_and_Overhead_Throw/0.jpg`,
      `${CDN_BASE}/Catch_and_Overhead_Throw/1.jpg`
    ]
  },
  {
    id: 'compromised_running',
    matchPatterns: [/correr.*(piernas.*cansadas|compromised)/i, /compromised.*running/i, /carrera.*(fatiga|comprometida)/i, /correr.*piernas.*cansadas/i],
    canonicalName: 'Correr con piernas cansadas (Compromised running)',
    muscleGroup: 'Cardio y Metabólico',
    pattern: 'Metabólico',
    equipment: 'Peso corporal',
    primaryMuscle: 'Capacidad aeróbica, resiliencia muscular de cuádriceps y pantorrillas',
    secondaryMuscles: ['Glúteos', 'Isquiotibiales', 'Erectores espinales'],
    steps: [
      'Inicia la carrera inmediatamente tras la estación de fuerza o metabólica previa.',
      'Ajusta la cadencia con pasos cortos y rápidos para contrarrestar la pesadez muscular.',
      'Mantén el torso relajado, hombros abajo y brazos oscilando con economía de energía.',
      'Respira hondo para restablecer el ritmo de oxigenación y asentar el ritmo de carrera.'
    ],
    commonMistakes: [
      'Arrancar en sprint antes de estabilizar el pulso y quemar los recursos energéticos restantes.',
      'Arrastrar los pies o encorvar los hombros por fatiga.'
    ],
    breathingTip: 'Establece un patrón rítmico de respiración (2 pasos inhalar, 2 pasos exhalar) para regular la frecuencia cardíaca.',
    targetFocus: 'Adaptación específica para HYROX y triatlón: correr eficientemente bajo fatiga muscular previa.',
    demoImages: [
      `${CDN_BASE}/Running_Treadmill/0.jpg`,
      `${CDN_BASE}/Running_Treadmill/1.jpg`
    ]
  },
  {
    id: 'sandbag_bucket_carry',
    matchPatterns: [/transporte.*(saco|balde)/i, /bucket.*carry/i, /sandbag.*carry/i, /saco.*o.*balde/i],
    canonicalName: 'Transporte de saco o balde (Sandbag / bucket carry)',
    muscleGroup: 'Cardio y Metabólico',
    pattern: 'Carga y Agarre',
    equipment: 'Saco / Lastre',
    primaryMuscle: 'Espalda alta, bíceps, antebrazos y core anterior (resistencia isométrica)',
    secondaryMuscles: ['Glúteos', 'Cuádriceps', 'Erectores lumbares'],
    steps: [
      'Levanta el saco o balde cargado abrazándolo contra el torso con agarre de oso o sujetando los bordes inferiores.',
      'Pega la carga lo más cerca posible de tu centro de masa para reducir la palanca sobre la espalda.',
      'Mantén la columna neutra y el pecho alto, evitando reclinarte excesivamente hacia atrás.',
      'Camina con pasos fluidos y cadenciados manteniendo la compresión abdominal activa.'
    ],
    commonMistakes: [
      'Separar la carga del pecho forzando los hombros y sobrecargando las lumbares.',
      'Arquear la zona lumbar para contrapesar la carga.'
    ],
    breathingTip: 'Respiraciones cortas torácicas sin aflojar el corsé abdominal.',
    targetFocus: 'Fuerza isométrica brutal de tren superior y tolerancia a la fatiga en transporte de cargas pesadas.',
    demoImages: [
      `${CDN_BASE}/Rickshaw_Carry/0.jpg`,
      `${CDN_BASE}/Rickshaw_Carry/1.jpg`
    ]
  },
  {
    id: 'dead_hang',
    matchPatterns: [/dead.*hang/i, /colgado.*barra/i, /suspensi[oó]n.*barra/i],
    canonicalName: 'Colgado en barra (Dead hang pasivo y activo)',
    muscleGroup: 'Espalda',
    pattern: 'Carga y Agarre',
    equipment: 'Barra',
    primaryMuscle: 'Fuerza de agarre (flexores de los dedos), descompresión espinal y salud de hombro',
    secondaryMuscles: ['Dorsal ancho', 'Trapecio inferior', 'Serrato anterior'],
    steps: [
      'Sujeta la barra de dominadas con agarre prono al ancho de hombros.',
      'Levanta los pies del suelo y déjate colgar con los brazos completamente extendidos.',
      'En cuelgue pasivo: relaja los hombros y permite la descompresión total de la columna vertebral.',
      'En cuelgue activo: activa los dorsales deprimiendo las escápulas (alejando los hombros de las orejas) sin flexionar los codos.',
      'Mantén la respiración profunda y el core firme durante el tiempo asignado.'
    ],
    commonMistakes: [
      'Balancear el cuerpo con balanceo de piernas.',
      'Aguantar la respiración generando tensión cervical innecesaria.'
    ],
    breathingTip: 'Inhala profundamente hacia la caja torácica sintiendo la descompresión intervertebral; exhala lento y relajado.',
    targetFocus: 'Fuerza de agarre estricta, movilidad de hombros y descompresión de discos espinales.',
    demoImages: [
      `${CDN_BASE}/Scapular_Pull-Up/0.jpg`,
      `${CDN_BASE}/Scapular_Pull-Up/1.jpg`
    ]
  },
  {
    id: 'towel_hang',
    matchPatterns: [/towel.*hang/i, /toalla.*barra/i, /toalla.*sobre.*barra/i],
    canonicalName: 'Towel Hang (Toalla sobre barra)',
    muscleGroup: 'Espalda',
    pattern: 'Carga y Agarre',
    equipment: 'Peso corporal',
    primaryMuscle: 'Fuerza de agarre pinza/aplastamiento extrema (flexores de los dedos y antebrazo)',
    secondaryMuscles: ['Braquial', 'Dorsal ancho', 'Estabilizadores escapulares'],
    steps: [
      'Coloca una o dos toallas gruesas sobre una barra de dominadas firme.',
      'Sujeta con fuerza los extremos de la toalla cerrando los puños con máxima presión.',
      'Despega los pies del suelo y cuélgate manteniendo los hombros firmes y el core rígido.',
      'Sostén la posición de suspensión isométrica el mayor tiempo posible sin aflojar la presa.'
    ],
    commonMistakes: [
      'Permitir que la toalla se deslice entre los dedos por falta de presión inicial.',
      'Dejar los hombros desalineados o colapsados hacia el cuello.'
    ],
    breathingTip: 'Inhalaciones y exhalaciones controladas manteniendo la tensión máxima en las manos.',
    targetFocus: 'Desarrollo de fuerza de prensión manual y densidad de antebrazos incomparable.',
    demoImages: [
      `${CDN_BASE}/Scapular_Pull-Up/0.jpg`,
      `${CDN_BASE}/Scapular_Pull-Up/1.jpg`
    ]
  },
  {
    id: 'pinch_grip_carry',
    matchPatterns: [/pinch.*grip/i, /pellizco.*disco/i, /agarre.*pellizco/i],
    canonicalName: 'Pinch Grip Carry (Pellizco con discos)',
    muscleGroup: 'Brazos',
    pattern: 'Carga y Agarre',
    equipment: 'Barra',
    primaryMuscle: 'Fuerza de pellizco (músculos intrínsecos de la mano, pulgares y flexores profundos)',
    secondaryMuscles: ['Antebrazo', 'Trapecio', 'Core'],
    steps: [
      'Coloca dos discos encarados con sus lados lisos hacia afuera o toma un disco grueso por el borde superior.',
      'Pellizca el borde utilizando solo las yemas de los dedos y la yema del pulgar (sin meter la mano en el agujero central).',
      'Levántate con la espalda recta y camina a ritmo constante manteniendo los discos pegados a los costados.',
      'Deposita los discos con cuidado en el suelo antes de que se deslicen de tus dedos.'
    ],
    commonMistakes: [
      'Doblar la muñeca o permitir que el disco descanse contra la pierna para hacer trampa.',
      'Soltar el disco desde la altura en vez de bajar en peso muerto controlado.'
    ],
    breathingTip: 'Respira rítmicamente sin perder la presión en las yemas de los dedos.',
    targetFocus: 'Fuerza de pellizco (pinch grip), esencial para escalada, OCR y agarre de precisión.',
    demoImages: [
      `${CDN_BASE}/Farmers_Walk/0.jpg`,
      `${CDN_BASE}/Farmers_Walk/1.jpg`
    ]
  },
  {
    id: 'monkey_bar_drills',
    matchPatterns: [/monkey.*bar/i, /transici[oó]n.*barra/i, /pasamanos/i],
    canonicalName: 'Transiciones de Barra / Monkey Bar Drills',
    muscleGroup: 'Espalda',
    pattern: 'Carga y Agarre',
    equipment: 'Barra',
    primaryMuscle: 'Fuerza de tracción unilateral dinámica, dorsales y antebrazos',
    secondaryMuscles: ['Oblicuos', 'Deltoides posterior', 'Bíceps'],
    steps: [
      'Cuélgate de la primera barra con ambas manos en suspensión activa.',
      'Genera un suave balanceo controlado (kipping) desde los hombros y caderas en el plano sagital.',
      'Suelta una mano en el punto culminante del impulso hacia adelante y toma con precisión la siguiente barra.',
      'Transfiere el peso del cuerpo de forma continua de una mano a la otra manteniendo el ritmo y la cadencia fluida.'
    ],
    commonMistakes: [
      'Colgarse de forma completamente pasiva dejando que el impacto caiga directo en la articulación del hombro.',
      'Hacer tirones espasmódicos descoordinados que agotan los antebrazos prematuramente.'
    ],
    breathingTip: 'Exhala en cada transición y alcance de una nueva barra; inhala en el punto de suspensión.',
    targetFocus: 'Fuerza dinámica de agarre y tracción unilateral esencial para carreras de obstáculos (OCR / Ninja).',
    demoImages: [
      `${CDN_BASE}/Band_Assisted_Pull-Up/0.jpg`,
      `${CDN_BASE}/Band_Assisted_Pull-Up/1.jpg`
    ]
  },
  {
    id: 'burpees_full',
    matchPatterns: [/burpee(s)?(\s+completo(s)?)?/i, /sprawl(s)?/i],
    canonicalName: 'Burpees completos',
    muscleGroup: 'Cardio y Metabólico',
    pattern: 'Metabólico',
    equipment: 'Peso corporal',
    primaryMuscle: 'Capacidad glucolítica de cuerpo completo, cuádriceps, pecho y core',
    secondaryMuscles: ['Tríceps', 'Glúteos', 'Pantorrillas', 'Hombros'],
    steps: [
      'Desde posición de pie, agáchate y apoya las manos firmes en el suelo delante de tus pies.',
      'Lanza los pies hacia atrás con un salto llegando a posición de plancha alta.',
      'Baja el pecho hasta rozar el suelo en una flexión controlada.',
      'Empuja con fuerza hacia arriba, recoge los pies de un salto hacia tus manos y despega en un salto vertical con palmada sobre la cabeza.'
    ],
    commonMistakes: [
      'Dejar caer la cadera arqueando la espalda lumbar al bajar o subir.',
      'Aterrizar con las piernas rígidas sin amortiguar el impacto con rodillas flexionadas.'
    ],
    breathingTip: 'Inhala al descender hacia el suelo; exhala explosivamente al empujar y saltar.',
    targetFocus: 'Acondicionamiento metabólico total, potencia y resistencia cardiovascular anaeróbica.',
    demoImages: [
      `${CDN_BASE}/Standing_Long_Jump/0.jpg`,
      `${CDN_BASE}/Standing_Long_Jump/1.jpg`
    ]
  },
  {
    id: 'jumping_jacks',
    matchPatterns: [/jumping\s*jacks?/i, /salto(s)?\s*de\s*tijera/i, /star\s*jumps?/i],
    canonicalName: 'Saltos de tijera (Jumping jacks)',
    muscleGroup: 'Cardio y Metabólico',
    pattern: 'Metabólico',
    equipment: 'Peso corporal',
    primaryMuscle: 'Deltoides, gemelos, aductores y resistencia cardiovascular',
    secondaryMuscles: ['Cuádriceps', 'Glúteos', 'Core'],
    steps: [
      'Comienza de pie con los pies juntos y los brazos a los lados del cuerpo.',
      'Salta abriendo las piernas más allá del ancho de hombros mientras elevas los brazos por encima de la cabeza hasta casi tocar las palmas.',
      'Vuelve de un salto suave a la posición inicial con pies juntos y brazos abajo.',
      'Mantén un ritmo ágil y continuo aterrizando sobre las almohadillas de los pies.'
    ],
    commonMistakes: [
      'Aterrizar con los talones de golpe transmitiendo el impacto a las articulaciones.',
      'Perder la postura inclinando el torso hacia adelante.'
    ],
    breathingTip: 'Inhala al abrir brazos y piernas; exhala al cerrar.',
    targetFocus: 'Activación cardiovascular, coordinación neuromuscular y elevación de temperatura central.',
    demoImages: [
      `${CDN_BASE}/Star_Jump/0.jpg`,
      `${CDN_BASE}/Star_Jump/1.jpg`
    ]
  },
  {
    id: 'mountain_climbers',
    matchPatterns: [/mountain\s*climbers?/i, /escalador(es)?/i],
    canonicalName: 'Escaladores (Mountain climbers)',
    muscleGroup: 'Cardio y Metabólico',
    pattern: 'Metabólico',
    equipment: 'Peso corporal',
    primaryMuscle: 'Recto abdominal, flexores de cadera y deltoides anterior',
    secondaryMuscles: ['Cuádriceps', 'Oblicuos', 'Pectorales', 'Tríceps'],
    steps: [
      'Colócate en posición de plancha alta con las manos alineadas directamente debajo de los hombros y el core apretado.',
      'Lleva una rodilla hacia el pecho sin levantar la cadera ni arquear la espalda.',
      'Regresa el pie hacia atrás mientras simultáneamente impulsas la rodilla contraria hacia el pecho en un movimiento continuo similar a correr en el suelo.',
      'Mantén el cuello neutro y el peso distribuido de manera uniforme entre ambas manos.'
    ],
    commonMistakes: [
      'Elevar la cadera formando una V invertida perdiendo la tensión en el abdomen.',
      'Rebotar bruscamente con el pie delantero en el suelo en cada zancada.'
    ],
    breathingTip: 'Respira rítmicamente al compás de cada zancada sin contener el aire.',
    targetFocus: 'Resistencia del core bajo alta fatiga y potencia aeróbica/anaeróbica.',
    demoImages: [
      `${CDN_BASE}/Mountain_Climbers/0.jpg`,
      `${CDN_BASE}/Mountain_Climbers/1.jpg`
    ]
  },
  {
    id: 'jump_squats',
    matchPatterns: [/sentadilla(s)?\s*con\s*salto/i, /jump\s*squats?/i],
    canonicalName: 'Sentadillas con salto',
    muscleGroup: 'Cuádriceps',
    pattern: 'Dominante rodilla',
    equipment: 'Peso corporal',
    primaryMuscle: 'Potencia de cuádriceps, glúteos y gemelos',
    secondaryMuscles: ['Core', 'Isquiotibiales', 'Erectores espinales'],
    steps: [
      'Pies al ancho de hombros con las puntas ligeramente abiertas a 15°.',
      'Baja en sentadilla controlada hasta que los muslos queden paralelos al suelo.',
      'Desde el fondo, empuja el suelo de forma explosiva y salta hacia arriba extendiendo tobillos, rodillas y caderas simultáneamente.',
      'Aterriza de puntas a talones flexionando las rodillas de inmediato para amortiguar el impacto y encadenar la siguiente repetición.'
    ],
    commonMistakes: [
      'Colapso de rodillas hacia adentro (valgo) al despegar o al aterrizar.',
      'Aterrizar rígidamente con las piernas extendidas.'
    ],
    breathingTip: 'Inhala mientras bajas en sentadilla; exhala con fuerza al explotar en el salto.',
    targetFocus: 'Desarrollo de potencia vertical y capacidad reactiva del tren inferior.',
    demoImages: [
      `${CDN_BASE}/Freehand_Jump_Squat/0.jpg`,
      `${CDN_BASE}/Freehand_Jump_Squat/1.jpg`
    ]
  },
  {
    id: 'split_jumps',
    matchPatterns: [/zancada(s)?\s*con\s*salto/i, /zancadas?\s*pliom[eé]tricas?/i, /split\s*jumps?/i, /lunge\s*jumps?/i],
    canonicalName: 'Zancadas con salto alternadas',
    muscleGroup: 'Cuádriceps',
    pattern: 'Dominante rodilla',
    equipment: 'Peso corporal',
    primaryMuscle: 'Cuádriceps, glúteo mayor y estabilidad unilateral',
    secondaryMuscles: ['Gemelos', 'Isquiotibiales', 'Core'],
    steps: [
      'Inicia en posición de zancada con ambas rodillas flexionadas a 90° y el torso erguido.',
      'Impúlsate explosivamente hacia arriba con ambas piernas despegando del suelo.',
      'En el aire, intercambia la posición de los pies rápidamente.',
      'Aterriza con suavidad en zancada con la pierna contraria al frente y repite sin pausa.'
    ],
    commonMistakes: [
      'Golpear la rodilla trasera contra el suelo.',
      'Inclinarse excesivamente hacia adelante perdiendo el equilibrio.'
    ],
    breathingTip: 'Exhala en cada salto de cambio; inhala al amortiguar el aterrizaje.',
    targetFocus: 'Potencia unilateral reactiva, equilibrio dinámico y resistencia láctica.',
    demoImages: [
      `${CDN_BASE}/Split_Jump/0.jpg`,
      `${CDN_BASE}/Split_Jump/1.jpg`
    ]
  },
  {
    id: 'plyo_pushups',
    matchPatterns: [/flexi[oó]n(es)?\s*explosiva(s)?/i, /plyo\s*push.*ups?/i, /flexiones\s*con\s*salto/i],
    canonicalName: 'Flexiones explosivas',
    muscleGroup: 'Pecho',
    pattern: 'Empuje horizontal',
    equipment: 'Peso corporal',
    primaryMuscle: 'Pectoral mayor, deltoides anterior y tríceps braquial',
    secondaryMuscles: ['Serrato anterior', 'Core', 'Glúteos'],
    steps: [
      'Ponte en posición de flexión con las manos al ancho de los hombros y el cuerpo alineado de pies a cabeza.',
      'Baja el pecho de forma controlada hasta rozar el suelo.',
      'Empuja contra el suelo con máxima aceleración de modo que las manos se despeguen del suelo en la parte alta.',
      'Aterriza con los codos ligeramente flexionados para absorber la fuerza y bajar de inmediato a la siguiente repetición.'
    ],
    commonMistakes: [
      'Dejar caer la pelvis arqueando la zona lumbar.',
      'Aterrizar con los codos bloqueados.'
    ],
    breathingTip: 'Inhala en el descenso; exhala con un estallido al despegar las manos del suelo.',
    targetFocus: 'Potencia de empuje del tren superior y reclutamiento de fibras rápidas.',
    demoImages: [
      `${CDN_BASE}/Plyo_Push-up/0.jpg`,
      `${CDN_BASE}/Plyo_Push-up/1.jpg`
    ]
  },
  {
    id: 'plank_jacks',
    matchPatterns: [/plancha\s*con\s*saltos?/i, /plank\s*jacks?/i],
    canonicalName: 'Plancha con saltos de pies',
    muscleGroup: 'Core',
    pattern: 'Metabólico',
    equipment: 'Peso corporal',
    primaryMuscle: 'Transverso del abdomen, recto anterior y abductores de cadera',
    secondaryMuscles: ['Hombros', 'Glúteo medio', 'Gemelos'],
    steps: [
      'Colócate en plancha sobre antebrazos o manos con los pies juntos y el abdomen contraído.',
      'Salta separando los pies más allá del ancho de caderas mientras mantienes el torso totalmente inmóvil.',
      'Salta inmediatamente regresando los pies al centro con suavidad.',
      'Evita que la pelvis suba o baje durante los rebotes.'
    ],
    commonMistakes: [
      'Rebotar con la pelvis arriba y abajo perdiendo la rigidez del core.'
    ],
    breathingTip: 'Mantén una respiración rítmica y controlada por la nariz.',
    targetFocus: 'Estabilidad del core dinámico y elevación del ritmo cardíaco sin impacto en brazos.',
    demoImages: [
      `${CDN_BASE}/Plank/0.jpg`,
      `${CDN_BASE}/Plank/1.jpg`
    ]
  },
  {
    id: 'high_knees',
    matchPatterns: [/rodillas?\s*arriba/i, /skipping\s*alto/i, /high\s*knees?/i],
    canonicalName: 'Rodillas arriba',
    muscleGroup: 'Cardio y Metabólico',
    pattern: 'Metabólico',
    equipment: 'Peso corporal',
    primaryMuscle: 'Flexores de cadera (psoas), pantorrillas y cuádriceps',
    secondaryMuscles: ['Core', 'Glúteos', 'Brazos'],
    steps: [
      'De pie en el lugar, corre elevando las rodillas de forma alterna por encima del nivel de las caderas (90°).',
      'Bracea con energía en sincronía con las piernas opuestas.',
      'Aterriza elásticamente sobre las almohadillas de los pies con tobillos reactivos.',
      'Mantén el tronco erguido sin reclinarte hacia atrás.'
    ],
    commonMistakes: [
      'Inclinarse hacia atrás compensando la falta de flexión de cadera.',
      'No subir las rodillas a la altura adecuada.'
    ],
    breathingTip: 'Inhala en 2 zancadas, exhala en 2 zancadas rítmicamente.',
    targetFocus: 'Cadencia de carrera, reactividad de tobillo y acondicionamiento cardiovascular.',
    demoImages: [
      `${CDN_BASE}/Knee_Tuck_Jump/0.jpg`,
      `${CDN_BASE}/Knee_Tuck_Jump/1.jpg`
    ]
  },
  {
    id: 'kettlebell_swings',
    matchPatterns: [/balanceo(s)?\s*con\s*pesa\s*rusa/i, /kettlebell\s*swings?/i, /swing(s)?\s*con\s*kettlebell/i, /swing.*pesa.*rusa/i],
    canonicalName: 'Balanceos con pesa rusa (Kettlebell swings)',
    muscleGroup: 'Isquios y Glúteo',
    pattern: 'Dominante cadera',
    equipment: 'Kettlebell',
    primaryMuscle: 'Glúteo mayor, isquiotibiales y cadena posterior explosiva',
    secondaryMuscles: ['Erectores espinales', 'Antebrazos', 'Deltoides anterior', 'Core'],
    steps: [
      'Pies ligeramente más anchos que los hombros con la pesa rusa en el suelo un paso por delante de ti.',
      'Inclina la cadera en bisagra (hombros por encima de caderas, caderas por encima de rodillas) y toma el asa con ambas manos.',
      'Pasa la pesa entre las piernas cargando los isquiotibiales como un resorte.',
      'Extiende con violencia las caderas y glúteos proyectando la pesa hacia adelante por pura inercia hasta la altura del pecho.',
      'Deja que la pesa caiga libremente y vuelve a amortiguar en bisagra de cadera profunda.'
    ],
    commonMistakes: [
      'Convertir el movimiento en sentadilla doblando en exceso las rodillas.',
      'Levantar la pesa con los hombros o brazos en lugar del empuje de cadera.',
      'Hiperextender la zona lumbar en la cima.'
    ],
    breathingTip: 'Inhala mientras la pesa pasa entre las piernas; exhala con fuerza siseando al bloquear glúteos arriba.',
    targetFocus: 'Potencia balística de cadera, quema calórica extrema y salud lumbar/glútea.',
    demoImages: [
      `${CDN_BASE}/One-Arm_Kettlebell_Swings/0.jpg`,
      `${CDN_BASE}/One-Arm_Kettlebell_Swings/1.jpg`
    ]
  },
  {
    id: 'snatch_kettlebell',
    matchPatterns: [/arrancada.*(mancuerna|pesa|kettlebell)/i, /snatch/i],
    canonicalName: 'Arrancada con mancuerna (Snatch)',
    muscleGroup: 'Cardio y Metabólico',
    pattern: 'Metabólico',
    equipment: 'Kettlebell',
    primaryMuscle: 'Cadena posterior completa, trapecios y deltoides en un solo impulso',
    secondaryMuscles: ['Glúteos', 'Isquiotibiales', 'Tríceps', 'Core'],
    steps: [
      'Comienza con la pesa en el suelo entre los pies.',
      'Toma la mancuerna o pesa con una mano con la columna neutra y las caderas en bisagra.',
      'Extiende piernas y caderas con máxima aceleración, manteniendo la carga pegada al cuerpo.',
      'Cuando la carga alcance el pecho, desliza la mano por debajo y extiende el brazo bloqueando la carga directamente sobre la cabeza en un movimiento fluido.',
      'Desciende con control al suelo o cambia de mano.'
    ],
    commonMistakes: [
      'Alejar la pesa del cuerpo en un arco amplio cargando el hombro.',
      'No usar la potencia de las piernas para propulsar el peso hacia arriba.'
    ],
    breathingTip: 'Exhala enérgicamente en el bloqueo superior; inhala al bajar.',
    targetFocus: 'Potencia unilateral de cuerpo entero y velocidad de transferencia de fuerza.',
    demoImages: [
      `${CDN_BASE}/One-Arm_Kettlebell_Snatch/0.jpg`,
      `${CDN_BASE}/One-Arm_Kettlebell_Snatch/1.jpg`
    ]
  },
  {
    id: 'skaters',
    matchPatterns: [/patinador(es)?/i, /skaters?/i, /salto(s)?\s*lateral(es)?/i],
    canonicalName: 'Patinadores laterales (Skaters)',
    muscleGroup: 'Glúteos',
    pattern: 'Dominante rodilla',
    equipment: 'Peso corporal',
    primaryMuscle: 'Glúteo medio, aductores y estabilizadores laterales de rodilla/tobillo',
    secondaryMuscles: ['Cuádriceps', 'Core', 'Gemelos'],
    steps: [
      'Comienza de pie con una rodilla ligeramente flexionada.',
      'Empuja lateralmente con fuerza saltando hacia el lado derecho, aterrizando sobre el pie derecho.',
      'Cruza la pierna izquierda por detrás sin que toque el suelo y amortigua flexionando la cadera y rodilla derecha.',
      'Inmediatamente empuja con el pie derecho para saltar hacia la izquierda en un movimiento fluido de patinador sobre hielo.'
    ],
    commonMistakes: [
      'Aterrizar con la rodilla colapsando hacia adentro sin control del glúteo medio.',
      'Hacer saltos muy cortos sin comprometer la potencia lateral.'
    ],
    breathingTip: 'Exhala en cada impulso lateral; inhala en la recepción.',
    targetFocus: 'Fuerza en el plano frontal, prevención de lesiones de rodilla y agilidad atlética.',
    demoImages: [
      `${CDN_BASE}/Lateral_Box_Jump/0.jpg`,
      `${CDN_BASE}/Lateral_Box_Jump/1.jpg`
    ]
  },
  {
    id: 'rope_jumping',
    matchPatterns: [/salto(s)?\s*de\s*cuerda/i, /salto(s)?\s*a\s*la\s*comba/i, /rope\s*jump/i],
    canonicalName: 'Saltos de cuerda virtuales',
    muscleGroup: 'Cardio y Metabólico',
    pattern: 'Metabólico',
    equipment: 'Peso corporal',
    primaryMuscle: 'Sóleo, gemelos, tendón de Aquiles y resistencia aeróbica',
    secondaryMuscles: ['Deltoides', 'Antebrazos', 'Core'],
    steps: [
      'Sostén la cuerda o realiza el movimiento virtual con codos pegados a los costados y rotación desde las muñecas.',
      'Salta apenas 2 a 3 cm sobre el suelo manteniendo los pies y tobillos elásticos.',
      'Aterriza suavemente sobre las almohadillas de los pies absorbiendo con las pantorrillas sin flexionar en exceso las rodillas.',
      'Mantén la mirada al frente y la respiración regular.'
    ],
    commonMistakes: [
      'Saltar demasiado alto flexionando las rodillas hacia atrás.',
      'Rotar los brazos enteros desde los hombros en lugar de usar las muñecas.'
    ],
    breathingTip: 'Respira calmado y continuo para mantener las pulsaciones en zona eficiente.',
    targetFocus: 'Rigidez elástica del tendón de Aquiles, economía de rebote y alta densidad calórica.',
    demoImages: [
      `${CDN_BASE}/Rope_Jumping/0.jpg`,
      `${CDN_BASE}/Rope_Jumping/1.jpg`
    ]
  },
  {
    id: 'commando_pushups',
    matchPatterns: [/flexi[oó]n(es)?\s*comando/i, /plancha\s*comando/i, /push\s*up\s*to\s*plank/i],
    canonicalName: 'Flexiones comando',
    muscleGroup: 'Core',
    pattern: 'Metabólico',
    equipment: 'Peso corporal',
    primaryMuscle: 'Tríceps, hombros, recto abdominal y estabilizadores escapulares',
    secondaryMuscles: ['Pectorales', 'Oblicuos'],
    steps: [
      'Inicia en plancha apoyando los antebrazos con el core contraído y los pies al ancho de hombros.',
      'Apoya la palma derecha en el suelo exactamente debajo del hombro y empuja hacia arriba; repite con la mano izquierda para quedar en plancha alta.',
      'Baja de nuevo el codo derecho al suelo y luego el codo izquierdo volviendo a la plancha sobre antebrazos.',
      'Alterna el brazo que lidera la subida en cada repetición manteniendo las caderas lo más fijas posible.'
    ],
    commonMistakes: [
      'Balancear las caderas de lado a lado como un péndulo al subir.'
    ],
    breathingTip: 'Exhala al empujar hacia la posición alta; inhala al descender sobre los antebrazos.',
    targetFocus: 'Anti-rotación del core, fuerza funcional de tríceps y control escapular.',
    demoImages: [
      `${CDN_BASE}/Push_Up_to_Side_Plank/0.jpg`,
      `${CDN_BASE}/Push_Up_to_Side_Plank/1.jpg`
    ]
  },
  {
    id: 'hollow_rocks',
    matchPatterns: [/hollow.*rock(s)?/i, /hollow/i, /canoa.*abdominal/i],
    canonicalName: 'Hollow rocks de abdomen',
    muscleGroup: 'Core',
    pattern: 'Aislamiento',
    equipment: 'Peso corporal',
    primaryMuscle: 'Recto abdominal profundo, transverso del abdomen y flexores de cadera',
    secondaryMuscles: ['Cuádriceps', 'Dorsales'],
    steps: [
      'Acuéstate boca arriba en el suelo. Pega la zona lumbar contra la colchoneta sin dejar ningún hueco.',
      'Extiende los brazos por detrás de la cabeza y las piernas estiradas a unos 15-20 cm del suelo formando una postura cóncava ("banana").',
      'Manteniendo esa estructura completamente rígida como un bloque sólido, balancéate suavemente hacia adelante y atrás desde la espalda baja.',
      'Si la zona lumbar se despega del suelo, flexiona ligeramente las rodillas para acortar la palanca.'
    ],
    commonMistakes: [
      'Arquear la columna lumbar despegándola del suelo.',
      'Mover los brazos o piernas de forma independiente en lugar de balancear todo el cuerpo en bloque.'
    ],
    breathingTip: 'Respira con respiraciones cortas y superficiales manteniendo la presión intraabdominal.',
    targetFocus: 'Tensión abdominal global isométrica y fuerza transferible a gimnasia y calistenia.',
    demoImages: [
      `${CDN_BASE}/Jackknife_Sit-Up/0.jpg`,
      `${CDN_BASE}/Jackknife_Sit-Up/1.jpg`
    ]
  },
  {
    id: 'treadmill_running',
    matchPatterns: [/cinta.*correr/i, /sprint.*cinta/i, /correr.*cinta/i],
    canonicalName: 'Cinta de correr a buen ritmo',
    muscleGroup: 'Cardio y Metabólico',
    pattern: 'Metabólico',
    equipment: 'Peso corporal',
    primaryMuscle: 'Capacidad aeróbica, cuádriceps, glúteos e isquiotibiales',
    secondaryMuscles: ['Gemelos', 'Core'],
    steps: [
      'Sube a la cinta con postura erguida y hombros relajados.',
      'Aumenta la velocidad a tu ritmo objetivo de trabajo.',
      'Corre aterrizando con el mediopié justo debajo del centro de masa, manteniendo una cadencia ágil.',
      'Brazos oscilando en 90° relajados sin cruzar la línea media del pecho.'
    ],
    commonMistakes: [
      'Agarrarse de las barandillas de la cinta mientras se corre.',
      'Dar zancadas excesivamente largas impactando con el talón.'
    ],
    breathingTip: 'Patrón de respiración rítmico 2:2 (dos pasos inhalando, dos pasos exhalando).',
    targetFocus: 'Consumo máximo de oxígeno y resistencia cardiovascular continua.',
    demoImages: [
      `${CDN_BASE}/Running_Treadmill/0.jpg`,
      `${CDN_BASE}/Running_Treadmill/1.jpg`
    ]
  },
  {
    id: 'stationary_bike',
    matchPatterns: [/bicicleta\s*est[aá]tica/i, /bici\s*est[aá]tica/i, /airbike/i, /air\s*bike/i],
    canonicalName: 'Bicicleta estática intensa',
    muscleGroup: 'Cardio y Metabólico',
    pattern: 'Metabólico',
    equipment: 'Ergómetro',
    primaryMuscle: 'Cuádriceps, glúteos y sistema cardiovascular con cero impacto articular',
    secondaryMuscles: ['Gemelos', 'Isquiotibiales'],
    steps: [
      'Ajusta el sillín a la altura de tu cadera de modo que la rodilla quede con un leve ángulo de 25-30° al pedalear abajo.',
      'Toma los manillares con firmeza sin tensar el cuello ni los hombros.',
      'Pedalea a cadencia alta (85-105 RPM) aplicando fuerza tanto al empujar el pedal como al levantarlo.',
      'En fases de sprint o alta resistencia, activa el core para no bambolear el torso.'
    ],
    commonMistakes: [
      'Sillín demasiado bajo sobrecargando la rótula.'
    ],
    breathingTip: 'Inhalaciones profundas por la nariz y exhalaciones rítmicas por la boca.',
    targetFocus: 'Entrenamiento cardiovascular de alta potencia sin estrés articular en rodillas o tobillos.',
    demoImages: [
      `${CDN_BASE}/Air_Bike/0.jpg`,
      `${CDN_BASE}/Air_Bike/1.jpg`
    ]
  },
  {
    id: 'kettlebell_thruster',
    matchPatterns: [/thruster(s)?/i, /kettlebell.*thruster/i],
    canonicalName: 'Thruster con kettlebells o mancuernas',
    muscleGroup: 'Cuádriceps',
    pattern: 'Dominante rodilla',
    equipment: 'Kettlebell',
    primaryMuscle: 'Cuádriceps, glúteos y deltoides en un movimiento compuesto continuo',
    secondaryMuscles: ['Tríceps', 'Core', 'Erectores espinales'],
    steps: [
      'Posiciona dos kettlebells o mancuernas a la altura de los hombros en posición rack.',
      'Desciende en sentadilla completa rompiendo el paralelo con el pecho alto y los codos levantados.',
      'Sube de forma explosiva desde el fondo empujando el suelo con toda la planta del pie.',
      'Usa el impulso de la subida de piernas para transferir la energía hacia los brazos y empujar la carga por encima de la cabeza en un press militar fluido.',
      'Baja la carga a los hombros mientras comienzas el descenso a la siguiente sentadilla.'
    ],
    commonMistakes: [
      'Pausar entre la sentadilla y el press perdiendo el impulso de las piernas.',
      'Colapsar el pecho hacia adelante durante la sentadilla.'
    ],
    breathingTip: 'Inhala al descender; exhala con fuerza al llegar a la extensión completa arriba.',
    targetFocus: 'Máxima demanda metabólica, integración de tren inferior y superior y potencia funcional.',
    demoImages: [
      `${CDN_BASE}/Kettlebell_Thruster/0.jpg`,
      `${CDN_BASE}/Kettlebell_Thruster/1.jpg`
    ]
  },
  {
    id: 'battling_ropes',
    matchPatterns: [/cuerdas?\s*de\s*batalla/i, /battling\s*ropes?/i, /battle\s*ropes?/i],
    canonicalName: 'Cuerdas de batalla (Battling ropes)',
    muscleGroup: 'Cardio y Metabólico',
    pattern: 'Metabólico',
    equipment: 'Ergómetro',
    primaryMuscle: 'Hombros, antebrazos, core y capacidad anaeróbica láctica',
    secondaryMuscles: ['Pectorales', 'Dorsales', 'Piernas'],
    steps: [
      'Toma un extremo de la cuerda en cada mano con agarre neutro y ponte en posición de media sentadilla atlética con el pecho erguido.',
      'Genera ondas continuas alternando los brazos hacia arriba y abajo con máxima velocidad y potencia.',
      'Mantén los codos semi-flexionados y el core apretado para no tambalear el tronco.',
      'Procura que las ondas viajen limpiamente hasta el punto de anclaje de la cuerda.'
    ],
    commonMistakes: [
      'Levantarse perdiendo la postura atlética y dejando caer los hombros.',
      'Mover solo las muñecas en lugar de involucrar los deltoides y la musculatura escapular.'
    ],
    breathingTip: 'Respira con exhalaciones cortas y explosivas con cada latigazo.',
    targetFocus: 'Potencia anaeróbica del tren superior sin impacto articular en extremidades inferiores.',
    demoImages: [
      `${CDN_BASE}/Battling_Ropes/0.jpg`,
      `${CDN_BASE}/Battling_Ropes/1.jpg`
    ]
  },
  {
    id: 'kettlebell_clean',
    matchPatterns: [/cargada.*(kettlebell|mancuerna|pesa)/i, /kettlebell\s*clean/i, /clean.*mancuerna/i],
    canonicalName: 'Cargada con kettlebell o mancuerna (Clean)',
    muscleGroup: 'Isquios y Glúteo',
    pattern: 'Dominante cadera',
    equipment: 'Kettlebell',
    primaryMuscle: 'Glúteos, isquiotibiales, trapecios y fuerza de agarre',
    secondaryMuscles: ['Bíceps', 'Deltoides', 'Core'],
    steps: [
      'Coloca la pesa rusa en el suelo entre tus pies y flexiona la cadera en bisagra.',
      'Toma el asa con una o dos manos y genera un tirón explosivo desde las caderas manteniendo la pesa cerca del torso.',
      'Gira suavemente la mano alrededor del asa mientras la pesa sube para amortiguar en posición de rack sobre el antebrazo sin que golpee la muñeca.',
      'Bloquea rodillas y glúteos en la posición final erguida.'
    ],
    commonMistakes: [
      'Dejar que la pesa rusa se desplace lejos del cuerpo y golpee con fuerza el antebrazo.'
    ],
    breathingTip: 'Exhala al encajar la pesa en el rack; inhala al bajar.',
    targetFocus: 'Potencia de cadera, coordinación motora y preparación para presses o thrusters.',
    demoImages: [
      `${CDN_BASE}/Two-Arm_Kettlebell_Clean/0.jpg`,
      `${CDN_BASE}/Two-Arm_Kettlebell_Clean/1.jpg`
    ]
  },
  {
    id: 'box_jumps',
    matchPatterns: [/saltos?\s*al\s*caj[oó]n/i, /box\s*jumps?/i],
    canonicalName: 'Saltos al cajón (Box jumps)',
    muscleGroup: 'Cuádriceps',
    pattern: 'Dominante rodilla',
    equipment: 'Caja / Banco',
    primaryMuscle: 'Potencia explosiva vertical de cuádriceps, glúteos y pantorrillas',
    secondaryMuscles: ['Isquiotibiales', 'Core'],
    steps: [
      'Párate frente al cajón a una distancia cómoda (unos 30-40 cm) con los pies al ancho de caderas.',
      'Balancea los brazos hacia atrás mientras flexionas caderas y rodillas en un cuarto de sentadilla.',
      'Lanza los brazos hacia arriba y extiende caderas con máxima aceleración saltando sobre el cajón.',
      'Aterriza con ambos pies simultáneamente sobre el centro del cajón en media sentadilla suave sin ruido.',
      'Ponte de pie con extensión completa y baja dando un paso hacia atrás (step-down) para proteger los tendones de Aquiles.'
    ],
    commonMistakes: [
      'Aterrizar con los talones en el borde del cajón con riesgo de resbalar.',
      'Bajar saltando de espaldas con alto impacto en rodillas y tendón.'
    ],
    breathingTip: 'Exhala en el despegue; inhala al aterrizar y ponerte erguido.',
    targetFocus: 'Potencia concéntrica pura sin impacto excéntrico agresivo.',
    demoImages: [
      `${CDN_BASE}/Box_Jump_Multiple_Response/0.jpg`,
      `${CDN_BASE}/Box_Jump_Multiple_Response/1.jpg`
    ]
  }
];

// Helper para encontrar la entrada multimedia exacta
export function findExerciseMedia(exerciseName: string): ExerciseMediaEntry | null {
  if (!exerciseName) return null;
  const clean = exerciseName.trim().toLowerCase();

  for (const entry of EXERCISE_MEDIA_DATABASE) {
    if (entry.matchPatterns.some((p) => p.test(clean))) {
      return entry;
    }
  }
  return null;
}
