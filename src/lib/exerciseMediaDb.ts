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
    matchPatterns: [/press.*(banca|plano).*barra/i, /bench press/i],
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
    matchPatterns: [/pendlay/i, /remo.*pendlay/i],
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
    matchPatterns: [/remo.*barra.*t/i, /barra.*t/i, /t-?bar.*row/i, /t-?bar/i],
    canonicalName: 'Remo en barra T (con agarre cerrado)',
    muscleGroup: 'Espalda',
    pattern: 'Tracción horizontal',
    equipment: 'Barra',
    primaryMuscle: 'Espalda media (Romboides, trapecio medio) y dorsal ancho',
    secondaryMuscles: ['Bíceps', 'Deltoides posterior', 'Erectores lumbares'],
    steps: [
      'Colócate a horcajadas sobre la barra T con rodillas semi-flexionadas y el torso inclinado a 45° manteniendo la espalda plana.',
      'Toma el agarre neutro o en V con ambas manos.',
      'Tracciona la carga hacia el abdomen bajo retrayendo las escápulas con fuerza.',
      'Baja controlando el peso hasta el estiramiento completo sin arquear la espalda.'
    ],
    commonMistakes: [
      'Columpiar el torso para subir el peso.',
      'Redondear la espalda lumbar bajo cargas pesadas.'
    ],
    breathingTip: 'Inhala al bajar; exhala al tirar de la barra hacia el torso.',
    targetFocus: 'Densidad y grosor de la espalda media con trayectoria semicircular guiada.',
    demoImages: [
      `${CDN_BASE}/T-Bar_Row_with_Handle/0.jpg`,
      `${CDN_BASE}/T-Bar_Row_with_Handle/1.jpg`
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

  // ==========================================
  // --- HOMBROS (DELTOIDES / EMPUJE VERTICAL) ---
  // ==========================================
  {
    id: 'military_press',
    matchPatterns: [/press.*militar/i, /press.*hombro/i, /shoulder press/i, /overhead press/i],
    canonicalName: 'Press militar de hombros (Barra o Mancuernas)',
    muscleGroup: 'Hombros',
    pattern: 'Empuje vertical',
    equipment: 'Mancuernas',
    primaryMuscle: 'Deltoides anterior y lateral',
    secondaryMuscles: ['Tríceps braquial', 'Trapecio superior', 'Core'],
    steps: [
      'Siéntate o ponte de pie con las mancuernas/barra a la altura de las clavículas y codos debajo de las muñecas.',
      'Aprieta el abdomen y los glúteos para blindar la zona lumbar.',
      'Empuja la carga en línea recta vertical hasta extender los brazos sobre la cabeza.',
      'Baja de forma controlada hasta la altura de las orejas/clavículas.'
    ],
    commonMistakes: [
      'Arquear la espalda baja hacia atrás convirtiendo el press en un empuje inclinado de pecho.',
      'Bajar a mitad de recorrido.'
    ],
    breathingTip: 'Inhala antes de iniciar; exhala con fuerza al empujar sobre la cabeza.',
    targetFocus: 'Desarrollo de fuerza vertical y redondez del hombro.',
    demoImages: [
      `${CDN_BASE}/Seated_Dumbbell_Press/1.jpg`,
      `${CDN_BASE}/Seated_Dumbbell_Press/0.jpg`
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
    matchPatterns: [/pajaro/i, /pájaro/i, /deltoides.*posterior/i, /face pull/i],
    canonicalName: 'Pájaros con mancuernas / Face Pull',
    muscleGroup: 'Hombros',
    pattern: 'Aislamiento',
    equipment: 'Mancuernas',
    primaryMuscle: 'Deltoides posterior y rotadores externos',
    secondaryMuscles: ['Romboides', 'Trapecio medio'],
    steps: [
      'Inclina el torso hacia adelante paralelo al suelo con la espalda recta o usa una polea a nivel de rostro.',
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
    matchPatterns: [/copa/i, /extension.*triceps.*(mancuerna|overhead)/i, /extensión.*tríceps.*copa/i],
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
    matchPatterns: [/extension.*triceps.*polea/i, /extensión.*tríceps.*polea/i, /triceps pushdown/i],
    canonicalName: 'Extensiones de tríceps en polea con cuerda o barra',
    muscleGroup: 'Brazos',
    pattern: 'Aislamiento',
    equipment: 'Polea',
    primaryMuscle: 'Tríceps braquial (Cabeza lateral y medial)',
    secondaryMuscles: ['Ancóneo'],
    steps: [
      'Frente a la polea alta con cuerda o barra, inclina el torso levemente hacia adelante.',
      'Pega los codos a tus costados y no los muevas durante toda la serie.',
      'Empuja la carga hacia abajo hasta estirar los brazos por completo (abre la cuerda al final si usas cuerda).',
      'Aguanta 1 segundo la contracción y sube con control hasta un ángulo de 90°.'
    ],
    commonMistakes: [
      'Mover los codos hacia adelante y hacia atrás como si fuera un remo.',
      'Separar los codos del cuerpo.'
    ],
    breathingTip: 'Exhala al extender hacia abajo; inhala al subir.',
    targetFocus: 'Definición y corte de la cabeza lateral del tríceps (herradura).',
    demoImages: [
      `${CDN_BASE}/Reverse_Grip_Triceps_Pushdown/0.jpg`,
      `${CDN_BASE}/Reverse_Grip_Triceps_Pushdown/1.jpg`
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
    id: 'barbell_squat',
    matchPatterns: [/sentadilla.*(trasera|barra)/i, /back squat/i, /sentadilla.*pesada/i],
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
      `${CDN_BASE}/Barbell_Full_Squat/0.jpg`,
      `${CDN_BASE}/Barbell_Full_Squat/1.jpg`
    ]
  },
  {
    id: 'goblet_squat',
    matchPatterns: [/sentadilla.*(copa|goblet)/i],
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
      `${CDN_BASE}/Goblet_Squat/0.jpg`,
      `${CDN_BASE}/Goblet_Squat/1.jpg`
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
    matchPatterns: [/extension.*cuadriceps/i, /extensión.*cuádriceps/i, /leg extension/i],
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
    matchPatterns: [/hip thrust/i, /puente.*gluteo/i, /glute bridge/i],
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
    matchPatterns: [/frog pump/i, /elevacion.*pelvis/i, /elevación.*pelvis/i, /puente.*suelo/i],
    canonicalName: 'Frog pumps / Puente de glúteo en suelo',
    muscleGroup: 'Glúteos',
    pattern: 'Dominante cadera',
    equipment: 'Mancuernas',
    primaryMuscle: 'Glúteo mayor y medio',
    secondaryMuscles: ['Isquios'],
    steps: [
      'Acuéstate boca arriba con las plantas de los pies juntas (en posición de mariposa) o apoyadas en el suelo.',
      'Eleva la pelvis contrayendo los glúteos con fuerza en el punto alto.',
      'Aguanta 1 segundo y desciende controladamente.'
    ],
    commonMistakes: ['Arquear las lumbares en vez de apretar los glúteos.'],
    breathingTip: 'Exhala arriba; inhala al bajar.',
    targetFocus: 'Activación y congestión del glúteo medio y superior.',
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
