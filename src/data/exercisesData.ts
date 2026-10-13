import { ExerciseData, PATTERN_LABELS } from './types';

export const SCIENTIFIC_EXERCISES: ExerciseData[] = [
  // =========================================================================
  // --- RODILLA / PIERNAS (CUÁDRICEPS Y GLÚTEOS) ---
  // =========================================================================
  {
    id: 'sentadilla_trasera',
    name: 'Sentadilla trasera con barra',
    pattern: 'rodilla',
    patternLabel: PATTERN_LABELS.rodilla,
    primary: ['Cuádriceps', 'Glúteo mayor', 'Aductores'],
    equipment: ['Barra', 'Rack'],
    levels: ['intermedio', 'avanzado'],
    evidence: 'A',
    cues: [
      'Pies al ancho de hombros con puntas ligeramente hacia afuera.',
      'Inicia bajando la cadera y rodillas al mismo tiempo manteniendo el pecho erguido.',
      'Baja hasta que los muslos queden al menos paralelos al suelo con los talones bien plantados.'
    ],
    regression: 'sentadilla_goblet',
    progression: 'sentadilla_trasera_pausa',
    alternatives: ['sentadilla_hack', 'prensa_piernas', 'sentadilla_frontal'],
    notes: 'Ejercicio rey para masa y fuerza de tren inferior. Si tu movilidad te limita, usa zapatos de tacón o elevador en talones.'
  },
  {
    id: 'sentadilla_frontal',
    name: 'Sentadilla frontal',
    pattern: 'rodilla',
    patternLabel: PATTERN_LABELS.rodilla,
    primary: ['Cuádriceps', 'Core / Abdomen'],
    equipment: ['Barra', 'Rack'],
    levels: ['intermedio', 'avanzado'],
    evidence: 'A',
    cues: [
      'Apoya la barra sobre los deltoides frontales con los codos apuntando alto.',
      'Mantén el torso lo más vertical posible durante todo el descenso.',
      'Empuja el suelo con la planta completa del pie al subir.'
    ],
    regression: 'sentadilla_goblet',
    progression: 'sentadilla_frontal_pausa',
    alternatives: ['sentadilla_hack', 'sentadilla_trasera'],
    notes: 'Reduce la tensión lumbar respecto a la sentadilla trasera y exige mayor control del abdomen.'
  },
  {
    id: 'sentadilla_goblet',
    name: 'Sentadilla goblet con mancuerna o kettlebell',
    pattern: 'rodilla',
    patternLabel: PATTERN_LABELS.rodilla,
    primary: ['Cuádriceps', 'Glúteo', 'Core'],
    equipment: ['Mancuerna', 'Kettlebell'],
    levels: ['principiante', 'intermedio'],
    evidence: 'B',
    cues: [
      'Sostén el peso pegado al pecho con ambas manos como una copa.',
      'Baja las caderas entre los talones manteniendo la espalda firme.',
      'Excelente para aprender el patrón de sentadilla sin sobrecargar la columna.'
    ],
    progression: 'sentadilla_frontal',
    alternatives: ['prensa_piernas'],
    notes: 'Ideal para principiantes y para ganar movilidad profunda de cadera y tobillos.'
  },
  {
    id: 'prensa_piernas',
    name: 'Prensa de piernas en máquina',
    pattern: 'rodilla',
    patternLabel: PATTERN_LABELS.rodilla,
    primary: ['Cuádriceps', 'Glúteo'],
    equipment: ['Máquina'],
    levels: ['principiante', 'intermedio', 'avanzado'],
    evidence: 'B',
    cues: [
      'Coloca los pies en la plataforma al ancho de cadera.',
      'Baja el peso hasta unos 90° en rodillas sin despegar los glúteos del asiento.',
      'Empuja sin bloquear las rodillas por completo en el punto más alto.'
    ],
    alternatives: ['sentadilla_hack', 'sentadilla_goblet'],
    notes: 'Permite acumular gran volumen de cuádriceps de forma segura y sin fatiga axial en la columna.'
  },
  {
    id: 'sentadilla_hack',
    name: 'Sentadilla Hack en máquina',
    pattern: 'rodilla',
    patternLabel: PATTERN_LABELS.rodilla,
    primary: ['Cuádriceps'],
    equipment: ['Máquina'],
    levels: ['intermedio', 'avanzado'],
    evidence: 'B',
    cues: [
      'Espalda y cabeza bien apoyadas en el respaldo.',
      'Desciende de forma lenta y controlada buscando máxima flexión de rodilla.',
      'Sube con fuerza empujando desde el centro del pie.'
    ],
    regression: 'prensa_piernas',
    alternatives: ['prensa_piernas', 'sentadilla_frontal'],
    notes: 'Aislación extrema del cuádriceps con gran seguridad articular.'
  },
  {
    id: 'zancada_bulgara',
    name: 'Zancada búlgara con mancuernas',
    pattern: 'unilateral',
    patternLabel: PATTERN_LABELS.unilateral,
    primary: ['Glúteo mayor', 'Cuádriceps'],
    equipment: ['Mancuernas', 'Banco'],
    levels: ['intermedio', 'avanzado'],
    evidence: 'B',
    cues: [
      'Apoya el empeine del pie trasero en un banco o cajón.',
      'Da un paso largo al frente e inclina el torso levemente hacia adelante para activar más el glúteo.',
      'Baja la rodilla trasera hacia el suelo sin que la rodilla delantera colapse hacia adentro.'
    ],
    regression: 'zancada_atras',
    progression: 'zancada_bulgara_pesada',
    alternatives: ['step_up', 'zancada_caminando'],
    notes: 'Uno de los ejercicios más efectivos para glúteos e hipertrofia unilateral. Corrige asimetrías de fuerza.'
  },
  {
    id: 'zancada_caminando',
    name: 'Zancadas caminando con peso',
    pattern: 'unilateral',
    patternLabel: PATTERN_LABELS.unilateral,
    primary: ['Cuádriceps', 'Glúteo', 'Estabilidad'],
    equipment: ['Mancuernas', 'Kettlebell', 'Saco'],
    levels: ['principiante', 'intermedio'],
    evidence: 'B',
    cues: [
      'Avanza con pasos fluidos y controlados.',
      'La rodilla trasera roza suavemente el suelo.',
      'Mantén el pecho erguido y el torso estable.'
    ],
    regression: 'zancada_atras',
    alternatives: ['zancada_bulgara', 'step_up'],
    notes: 'Transferencia directa para resistencia de piernas en Hyrox y carreras de obstáculos.'
  },
  {
    id: 'zancada_atras',
    name: 'Zancada hacia atrás (Reverse Lunge)',
    pattern: 'unilateral',
    patternLabel: PATTERN_LABELS.unilateral,
    primary: ['Glúteo', 'Cuádriceps'],
    equipment: ['Mancuernas', 'Peso corporal'],
    levels: ['principiante', 'intermedio'],
    evidence: 'B',
    cues: [
      'Da un paso hacia atrás con control y baja la cadera en vertical.',
      'La espinilla delantera se mantiene casi perpendicular al suelo.',
      'Regresa a la posición inicial empujando con el talón delantero.'
    ],
    progression: 'zancada_bulgara',
    alternatives: ['step_up', 'zancada_caminando'],
    notes: 'Muy amable con las rodillas sensibles en comparación con la zancada frontal.'
  },
  {
    id: 'step_up',
    name: 'Step-up en cajón con mancuernas',
    pattern: 'unilateral',
    patternLabel: PATTERN_LABELS.unilateral,
    primary: ['Glúteo', 'Cuádriceps'],
    equipment: ['Mancuernas', 'Cajón'],
    levels: ['principiante', 'intermedio'],
    evidence: 'B',
    cues: [
      'Coloca todo el pie sobre un cajón a la altura de la rodilla.',
      'Impúlsate usando la pierna de arriba, evitando rebotar con el pie de abajo.',
      'Baja lento y con control.'
    ],
    alternatives: ['zancada_bulgara', 'zancada_atras'],
    notes: 'Excelente para atletas que buscan potencia y estabilidad en zancada de carrera.'
  },
  {
    id: 'extension_cuadriceps',
    name: 'Extensión de cuádriceps en máquina',
    pattern: 'rodilla',
    patternLabel: PATTERN_LABELS.rodilla,
    primary: ['Cuádriceps (Recto femoral)'],
    equipment: ['Máquina'],
    levels: ['principiante', 'intermedio', 'avanzado'],
    evidence: 'B',
    cues: [
      'Ajusta el respaldo para que la articulación de la rodilla coincida con el eje de la máquina.',
      'Sube con control hasta estirar las piernas y mantén 1 segundo arriba.',
      'Desciende en 2-3 segundos sintiendo el estiramiento muscular.'
    ],
    alternatives: ['sentadilla_sissy', 'prensa_piernas'],
    notes: 'Aísla el recto femoral en su porción distal. Ideal como remate con series de 12 a 15 repeticiones.'
  },

  // =========================================================================
  // --- BISAGRA / CADENA POSTERIOR (GLÚTEOS E ISQUIOS) ---
  // =========================================================================
  {
    id: 'peso_muerto',
    name: 'Peso muerto convencional',
    pattern: 'bisagra',
    patternLabel: PATTERN_LABELS.bisagra,
    primary: ['Glúteo mayor', 'Isquiotibiales', 'Erectores espinales', 'Espalda alta'],
    equipment: ['Barra'],
    levels: ['intermedio', 'avanzado'],
    evidence: 'A',
    cues: [
      'Barra a 2 cm de las espinillas con pies al ancho de cadera.',
      'Agarra la barra, lleva el pecho orgulloso y tensa los dorsales antes de tirar.',
      'Empuja el suelo con las piernas y extiende la cadera sin arquear la espalda baja hacia atrás al final.'
    ],
    regression: 'peso_muerto_hexagonal',
    progression: 'peso_muerto_pausa',
    alternatives: ['peso_muerto_hexagonal', 'peso_muerto_rumano'],
    notes: 'Constructor supremo de densidad y fuerza total. No entrenar al fallo técnico por seguridad.'
  },
  {
    id: 'peso_muerto_rumano',
    name: 'Peso muerto rumano con barra o mancuernas',
    pattern: 'bisagra',
    patternLabel: PATTERN_LABELS.bisagra,
    primary: ['Isquiotibiales', 'Glúteo mayor'],
    equipment: ['Barra', 'Mancuernas'],
    levels: ['principiante', 'intermedio', 'avanzado'],
    evidence: 'A',
    cues: [
      'Rodillas ligeramente flexionadas (desbloqueadas) y fijas en ese ángulo.',
      'Lleva la cadera hacia atrás como si quisieras tocar la pared con los glúteos.',
      'Baja la barra rozando los muslos hasta sentir el estiramiento máximo en los isquios y sube apretando glúteos.'
    ],
    regression: 'puente_gluteo',
    progression: 'pdr_unilateral',
    alternatives: ['curl_femoral_sentado', 'hip_thrust'],
    notes: 'El ejercicio de mayor estímulo por estiramiento para isquios y glúteos.'
  },
  {
    id: 'peso_muerto_hexagonal',
    name: 'Peso muerto con barra hexagonal (Trap Bar)',
    pattern: 'bisagra',
    patternLabel: PATTERN_LABELS.bisagra,
    primary: ['Glúteo', 'Cuádriceps', 'Trapecios'],
    equipment: ['Barra hexagonal'],
    levels: ['principiante', 'intermedio'],
    evidence: 'B',
    cues: [
      'Colócate en el centro de la barra y toma los agarres neutrales.',
      'Pecho alto y hombros estables.',
      'Empuja con las piernas como en una mezcla de sentadilla y peso muerto.'
    ],
    alternatives: ['peso_muerto', 'peso_muerto_rumano'],
    notes: 'Mucho más fácil de aprender que el peso muerto con barra recta y con menor tensión sobre la columna lumbar.'
  },
  {
    id: 'hip_thrust',
    name: 'Hip Thrust con barra (Empuje de cadera)',
    pattern: 'bisagra',
    patternLabel: PATTERN_LABELS.bisagra,
    primary: ['Glúteo mayor'],
    equipment: ['Barra', 'Banco'],
    levels: ['principiante', 'intermedio', 'avanzado'],
    evidence: 'B',
    cues: [
      'Espalda alta apoyada justo bajo los omóplatos contra el banco.',
      'Pies plantados a una distancia donde las espinillas queden verticales en la cima.',
      'Sube la cadera hasta quedar alineado y aprieta fuertemente los glúteos durante 1 segundo arriba.'
    ],
    regression: 'puente_gluteo',
    alternatives: ['peso_muerto_rumano', 'kickback_polea'],
    notes: 'Máxima activación del glúteo en posición acortada. Esencial para rutinas con enfoque en glúteos.'
  },
  {
    id: 'puente_gluteo',
    name: 'Puente de glúteos en suelo',
    pattern: 'bisagra',
    patternLabel: PATTERN_LABELS.bisagra,
    primary: ['Glúteo mayor'],
    equipment: ['Peso corporal', 'Banda'],
    levels: ['principiante'],
    evidence: 'C',
    cues: [
      'Túmbate boca arriba con las rodillas dobladas y los pies en el suelo.',
      'Empuja con los talones y levanta la cadera hasta formar una línea recta de rodillas a hombros.',
      'Aprieta los glúteos 2 segundos arriba antes de bajar.'
    ],
    progression: 'hip_thrust',
    alternatives: ['hip_thrust'],
    notes: 'Regresión segura para principiantes o como calentamiento de activación antes de sentadillas.'
  },
  {
    id: 'kb_swing',
    name: 'Swing con kettlebell (Pesa rusa)',
    pattern: 'bisagra',
    patternLabel: PATTERN_LABELS.bisagra,
    primary: ['Glúteos', 'Isquios', 'Core', 'Cardiovascular'],
    equipment: ['Kettlebell'],
    levels: ['intermedio'],
    evidence: 'B',
    cues: [
      'Movimiento de bisagra de cadera explosiva, no es una sentadilla.',
      'Lleva la pesa entre las piernas y proyéctala al frente con la extensión rápida de glúteos.',
      'Los brazos solo actúan como cuerdas que guían el peso.'
    ],
    alternatives: ['peso_muerto_rumano'],
    notes: 'Excelente para desarrollar potencia de cadera y resistencia para corredores y cross-training.'
  },
  {
    id: 'hiperextension_45',
    name: 'Hiperextensión a 45° en banco',
    pattern: 'bisagra',
    patternLabel: PATTERN_LABELS.bisagra,
    primary: ['Glúteos', 'Isquiotibiales', 'Erectores espinales'],
    equipment: ['Banco'],
    levels: ['principiante', 'intermedio'],
    evidence: 'B',
    cues: [
      'Ajusta la almohadilla justo debajo de la cadera para permitir doblar el tronco libremente.',
      'Baja con control y sube contrayendo los glúteos sin arquear la espalda en exceso arriba.'
    ],
    alternatives: ['peso_muerto_rumano'],
    notes: 'Fortalece la espalda baja de forma segura y trabaja la cadena posterior.'
  },
  {
    id: 'curl_femoral_sentado',
    name: 'Curl femoral sentado en máquina',
    pattern: 'bisagra',
    patternLabel: PATTERN_LABELS.bisagra,
    primary: ['Isquiotibiales'],
    equipment: ['Máquina'],
    levels: ['principiante', 'intermedio', 'avanzado'],
    evidence: 'B',
    cues: [
      'Ajusta el rodillo sobre los tobillos y asegura la almohadilla superior apretada sobre los muslos.',
      'Flexiona las rodillas con fuerza y aguanta 1 segundo abajo.',
      'Regresa en 2-3 segundos estirando bien los isquios.'
    ],
    alternatives: ['curl_femoral_tumbado', 'curl_nordico'],
    notes: 'Al estar la cadera flexionada a 90°, estira los isquios previamente logrando mayor hipertrofia que la versión tumbada.'
  },
  {
    id: 'curl_femoral_tumbado',
    name: 'Curl femoral tumbado en máquina',
    pattern: 'bisagra',
    patternLabel: PATTERN_LABELS.bisagra,
    primary: ['Isquiotibiales'],
    equipment: ['Máquina'],
    levels: ['principiante', 'intermedio'],
    evidence: 'B',
    cues: [
      'Túmbate boca abajo con el rodillo contra la parte baja de los gemelos.',
      'Mantén las caderas pegadas a la almohadilla mientras doblas las rodillas hacia los glúteos.',
      'Baja lento sin soltar el peso bruscamente.'
    ],
    alternatives: ['curl_femoral_sentado'],
    notes: 'Excelente opción clásica para aislar la flexión de rodilla en isquios.'
  },
  {
    id: 'curl_nordico',
    name: 'Curl nórdico para isquiotibiales',
    pattern: 'bisagra',
    patternLabel: PATTERN_LABELS.bisagra,
    primary: ['Isquiotibiales (Fuerza excéntrica)'],
    equipment: ['Peso corporal', 'Banda'],
    levels: ['intermedio', 'avanzado'],
    evidence: 'A',
    cues: [
      'Arrodíllate con los tobillos firmemente anclados o sujetos por un compañero.',
      'Mantén el cuerpo recto desde las rodillas hasta la cabeza y déjate caer hacia adelante lo más lento que puedas.',
      'Frena la caída con los brazos cuando no puedas sostener más y vuelve a subir ayudándote.'
    ],
    regression: 'curl_nordico_asistido_banda',
    alternatives: ['curl_femoral_sentado'],
    notes: 'Estándar de oro con amplísima evidencia científica en la prevención de desgarros de isquiotibiales en corredores y futbolistas.'
  },
  {
    id: 'pdr_unilateral',
    name: 'Peso muerto rumano a una pierna con mancuerna',
    pattern: 'unilateral',
    patternLabel: PATTERN_LABELS.unilateral,
    primary: ['Isquiotibiales', 'Glúteo medio', 'Equilibrio'],
    equipment: ['Mancuerna'],
    levels: ['intermedio'],
    evidence: 'B',
    cues: [
      'Apóyate sobre una pierna con rodilla ligeramente doblada.',
      'Inclina el torso al frente mientras la pierna libre sube recta hacia atrás en línea con tu cuerpo.',
      'Siente el estiramiento en el isquio de apoyo y vuelve apretando el glúteo.'
    ],
    regression: 'peso_muerto_rumano',
    alternatives: ['peso_muerto_rumano'],
    notes: 'Brinda estabilidad lateral a corredores y protege el menisco y rodilla de torsiones.'
  },

  // =========================================================================
  // --- EMPUJE HORIZONTAL (PECHO Y TRÍCEPS) ---
  // =========================================================================
  {
    id: 'press_banca',
    name: 'Press de banca plano con barra',
    pattern: 'empuje_h',
    patternLabel: PATTERN_LABELS.empuje_h,
    primary: ['Pectoral mayor', 'Tríceps', 'Deltoides anterior'],
    equipment: ['Barra', 'Banco'],
    levels: ['intermedio', 'avanzado'],
    evidence: 'A',
    cues: [
      'Ojos alineados con la barra, pies plantados en el suelo.',
      'Junta los omóplatos hacia atrás y abajo contra el banco.',
      'Baja la barra al pecho medio-bajo manteniendo los codos a unos 45-60 grados del torso.'
    ],
    regression: 'press_pecho_maquina',
    progression: 'press_banca_pausa',
    alternatives: ['press_mancuernas_plano', 'press_pecho_maquina'],
    notes: 'El estándar de oro para medir la fuerza de empuje en tren superior.'
  },
  {
    id: 'press_mancuernas_plano',
    name: 'Press plano con mancuernas',
    pattern: 'empuje_h',
    patternLabel: PATTERN_LABELS.empuje_h,
    primary: ['Pectoral mayor', 'Tríceps'],
    equipment: ['Mancuernas', 'Banco'],
    levels: ['principiante', 'intermedio', 'avanzado'],
    evidence: 'A',
    cues: [
      'Permite mayor rango de recorrido y libertad de giro en las muñecas.',
      'Baja las mancuernas sintiendo el estiramiento agradable en el pecho.',
      'Empuja verticalmente sin chocar las mancuernas arriba.'
    ],
    regression: 'flexiones',
    alternatives: ['press_banca', 'press_pecho_maquina'],
    notes: 'Ideal si sufres molestias de hombro con la barra fija.'
  },
  {
    id: 'press_inclinado_mancuernas',
    name: 'Press inclinado con mancuernas',
    pattern: 'empuje_h',
    patternLabel: PATTERN_LABELS.empuje_h,
    primary: ['Pectoral superior (clavicular)', 'Deltoides anterior'],
    equipment: ['Mancuernas', 'Banco'],
    levels: ['principiante', 'intermedio', 'avanzado'],
    evidence: 'B',
    cues: [
      'Ajusta el banco a una inclinación moderada (30° a 40°).',
      'No inclines a más de 45° para evitar transferir todo el trabajo a los hombros.',
      'Baja con control y empuja en trayectoria convergente.'
    ],
    alternatives: ['press_mancuernas_plano'],
    notes: 'Focaliza la porción clavicular del pecho para lograr un torso lleno y armónico.'
  },
  {
    id: 'flexiones',
    name: 'Flexiones de pecho (Push-ups)',
    pattern: 'empuje_h',
    patternLabel: PATTERN_LABELS.empuje_h,
    primary: ['Pectoral mayor', 'Tríceps', 'Core'],
    equipment: ['Peso corporal'],
    levels: ['principiante', 'intermedio'],
    evidence: 'B',
    cues: [
      'Cuerpo en tabla recta desde la cabeza a los talones, glúteos y abdomen firmes.',
      'Manos algo más abiertas que los hombros.',
      'Baja el pecho hasta casi tocar el suelo con los codos en forma de flecha (45°).'
    ],
    regression: 'flexiones_en_banco',
    progression: 'fondos',
    alternatives: ['press_mancuernas_plano'],
    notes: 'Excelente para salud escapular y activación completa del serrato anterior.'
  },
  {
    id: 'press_pecho_maquina',
    name: 'Press de pecho en máquina',
    pattern: 'empuje_h',
    patternLabel: PATTERN_LABELS.empuje_h,
    primary: ['Pectoral mayor'],
    equipment: ['Máquina'],
    levels: ['principiante'],
    evidence: 'B',
    cues: [
      'Ajusta la altura del asiento para que los agarres queden a la altura del pecho medio.',
      'Mantén la espalda pegada al respaldo y empuja hacia adelante con fluidez.'
    ],
    progression: 'press_mancuernas_plano',
    alternatives: ['press_banca'],
    notes: 'Cero riesgo de caída del peso; perfecto para aprender o buscar repeticiones cercanas al fallo de forma segura.'
  },
  {
    id: 'aperturas_polea',
    name: 'Aperturas / Cruces en polea',
    pattern: 'empuje_h',
    patternLabel: PATTERN_LABELS.empuje_h,
    primary: ['Pectoral mayor (Aislamiento)'],
    equipment: ['Polea'],
    levels: ['principiante', 'intermedio', 'avanzado'],
    evidence: 'B',
    cues: [
      'Codos ligeramente flexionados y fijos en ese ángulo durante todo el movimiento.',
      'Abre los brazos sintiendo gran estiramiento en el pecho y junta al frente con un apretón de 1 segundo.'
    ],
    alternatives: ['pec_deck'],
    notes: 'Tensión constante en todo el recorrido a diferencia de las aperturas con mancuernas.'
  },
  {
    id: 'fondos',
    name: 'Fondos en paralelas (Dips)',
    pattern: 'empuje_h',
    patternLabel: PATTERN_LABELS.empuje_h,
    primary: ['Pectoral inferior', 'Tríceps', 'Deltoides anterior'],
    equipment: ['Peso corporal', 'Barras paralelas'],
    levels: ['intermedio', 'avanzado'],
    evidence: 'B',
    cues: [
      'Inclina el torso ligeramente hacia adelante para activar más el pecho.',
      'Baja hasta que los codos formen un ángulo de 90° sin dejar que los hombros se encorven.',
      'Empuja con firmeza hasta estirar los brazos.'
    ],
    regression: 'fondos_asistidos_maquina',
    alternatives: ['press_banca'],
    notes: 'Si sientes pinchazos en la parte frontal del hombro, reduce el rango de bajada o cambia a press con mancuernas.'
  },

  // =========================================================================
  // --- EMPUJE VERTICAL (HOMBROS) ---
  // =========================================================================
  {
    id: 'press_militar',
    name: 'Press militar de pie con barra (Overhead Press)',
    pattern: 'empuje_v',
    patternLabel: PATTERN_LABELS.empuje_v,
    primary: ['Deltoides anterior y lateral', 'Tríceps', 'Core'],
    equipment: ['Barra'],
    levels: ['intermedio', 'avanzado'],
    evidence: 'A',
    cues: [
      'Glúteos y abdomen apretados con firmeza para proteger la espalda baja.',
      'Empuja la barra verticalmente por delante de la cara y al pasar la frente colócate bajo la barra con la cabeza neutra.',
      'Baja con control rozando la barbilla.'
    ],
    regression: 'press_hombro_mancuernas',
    alternatives: ['press_hombro_mancuernas', 'landmine_press'],
    notes: 'Desarrolla fuerza global en hombros y estabilidad de todo el cuerpo erguido.'
  },
  {
    id: 'press_hombro_mancuernas',
    name: 'Press de hombro sentado con mancuernas',
    pattern: 'empuje_v',
    patternLabel: PATTERN_LABELS.empuje_v,
    primary: ['Deltoides anterior', 'Tríceps'],
    equipment: ['Mancuernas', 'Banco'],
    levels: ['principiante', 'intermedio', 'avanzado'],
    evidence: 'B',
    cues: [
      'Banco colocado casi a 90° (mejor a unos 75-80° para comodidad del hombro).',
      'Empuja las mancuernas hacia arriba en trayectoria arqueada suave.',
      'Baja hasta que las mancuernas queden a la altura de las orejas.'
    ],
    alternatives: ['press_militar', 'landmine_press'],
    notes: 'Muy cómodo y seguro para hipertrofia de hombros sin requerir equilibrio de pie.'
  },
  {
    id: 'landmine_press',
    name: 'Press Landmine a un brazo con barra',
    pattern: 'empuje_v',
    patternLabel: PATTERN_LABELS.empuje_v,
    primary: ['Deltoides', 'Serrato', 'Tríceps'],
    equipment: ['Barra', 'Soporte landmine'],
    levels: ['principiante', 'intermedio'],
    evidence: 'C',
    cues: [
      'Empuja la punta de la barra en trayectoria diagonal hacia arriba y adelante.',
      'Sigue el movimiento con el cuerpo con un suave paso adelante.',
      'Permite que el omóplato se mueva naturalmente hacia arriba.'
    ],
    alternatives: ['press_hombro_mancuernas'],
    notes: 'La alternativa número 1 para personas con molestias en el manguito rotador o falta de movilidad sobre la cabeza.'
  },
  {
    id: 'elevaciones_laterales',
    name: 'Elevaciones laterales con mancuernas o polea',
    pattern: 'empuje_v',
    patternLabel: PATTERN_LABELS.empuje_v,
    primary: ['Deltoides lateral (Cabeza media)'],
    equipment: ['Mancuernas', 'Polea'],
    levels: ['principiante', 'intermedio', 'avanzado'],
    evidence: 'B',
    cues: [
      'Inclina el torso 5 grados hacia adelante con los codos ligeramente doblados.',
      'Sube los brazos hacia los lados en el plano escapular (ligeramente al frente de los hombros) hasta la altura paralela.',
      'Baja en 2 segundos sin impulsarte con las piernas.'
    ],
    alternatives: ['elevaciones_laterales_polea'],
    notes: 'Clave para dar amplitud visual al torso. Rango ideal: series de 12 a 20 repeticiones controladas.'
  },

  // =========================================================================
  // --- TRACCIÓN VERTICAL (DORSALES Y DOMINADAS) ---
  // =========================================================================
  {
    id: 'dominada',
    name: 'Dominada pronada en barra fija (Pull-up)',
    pattern: 'traccion_v',
    patternLabel: PATTERN_LABELS.traccion_v,
    primary: ['Dorsal ancho', 'Bíceps', 'Braquiorradial', 'Core'],
    equipment: ['Barra fija', 'Peso corporal'],
    levels: ['intermedio', 'avanzado'],
    evidence: 'A',
    cues: [
      'Agarre prono algo más amplio que los hombros.',
      'Inicia bajando los hombros (depresión escapular) y luego tira con los codos hacia las costillas.',
      'Supera la barra con la barbilla y desciende con control hasta estirar los brazos.'
    ],
    regression: 'jalon_pecho',
    progression: 'dominada_lastrada',
    alternatives: ['jalon_pecho', 'dominada_supina'],
    notes: 'Prueba suprema de fuerza relativa. Indispensable para OCR (obstáculos) y escalada.'
  },
  {
    id: 'dominada_supina',
    name: 'Dominada supina / neutra (Chin-up)',
    pattern: 'traccion_v',
    patternLabel: PATTERN_LABELS.traccion_v,
    primary: ['Dorsal ancho', 'Bíceps braquial'],
    equipment: ['Barra fija', 'Peso corporal'],
    levels: ['intermedio', 'avanzado'],
    evidence: 'A',
    cues: [
      'Palmas mirando hacia ti al ancho de hombros.',
      'Gran reclutamiento de los bíceps junto con los dorsales.',
      'Tira con el pecho hacia la barra sin balancear las piernas.'
    ],
    regression: 'jalon_pecho',
    alternatives: ['dominada', 'jalon_pecho'],
    notes: 'Suele ser más fácil de lograr que la dominada pronada gracias a la ayuda de los bíceps.'
  },
  {
    id: 'dominada_asistida',
    name: 'Dominada asistida con banda elástica o máquina',
    pattern: 'traccion_v',
    patternLabel: PATTERN_LABELS.traccion_v,
    primary: ['Dorsal ancho', 'Bíceps'],
    equipment: ['Banda', 'Máquina'],
    levels: ['principiante'],
    evidence: 'B',
    cues: [
      'Coloca la rodilla o pie en la banda elástica para aligerar tu peso.',
      'Ejecuta el recorrido completo de tracción vertical con técnica perfecta.'
    ],
    progression: 'dominada',
    alternatives: ['jalon_pecho'],
    notes: 'El puente ideal para quienes aún no alcanzan su primera dominada con peso corporal.'
  },
  {
    id: 'jalon_pecho',
    name: 'Jalón al pecho en polea (Lat Pulldown)',
    pattern: 'traccion_v',
    patternLabel: PATTERN_LABELS.traccion_v,
    primary: ['Dorsal ancho', 'Bíceps'],
    equipment: ['Polea'],
    levels: ['principiante', 'intermedio', 'avanzado'],
    evidence: 'B',
    cues: [
      'Ajusta las almohadillas para que las piernas queden bien sujetas.',
      'Inclina el torso ligeramente hacia atrás (10-15°), saca el pecho y tira de la barra hacia la parte superior del esternón.',
      'Controla la subida sintiendo cómo se estiran los dorsales.'
    ],
    alternatives: ['dominada', 'remo_polea_baja'],
    notes: 'Permite regular con precisión la carga para atletas de todos los niveles.'
  },

  // =========================================================================
  // --- TRACCIÓN HORIZONTAL (ESPALDA Y REMOS) ---
  // =========================================================================
  {
    id: 'remo_barra',
    name: 'Remo con barra inclinado (Bent-over row)',
    pattern: 'traccion_h',
    patternLabel: PATTERN_LABELS.traccion_h,
    primary: ['Dorsal ancho', 'Romboides', 'Trapecio medio', 'Erectores'],
    equipment: ['Barra'],
    levels: ['intermedio', 'avanzado'],
    evidence: 'A',
    cues: [
      'Torso inclinado a unos 45-60 grados con espalda completamente recta y rodillas flexionadas.',
      'Tira de la barra hacia el ombligo llevando los codos hacia atrás.',
      'Junta los omóplatos en la contracción y baja con control sin balancear la espalda.'
    ],
    regression: 'remo_apoyo_pecho',
    alternatives: ['remo_mancuerna', 'remo_polea_baja'],
    notes: 'Constructor formidable de masa en la espalda media y fuerza postural.'
  },
  {
    id: 'remo_pendlay',
    name: 'Remo Pendlay con barra (pesado)',
    pattern: 'traccion_h',
    patternLabel: PATTERN_LABELS.traccion_h,
    primary: ['Espalda alta', 'Romboides', 'Trapecio', 'Dorsal ancho'],
    equipment: ['Barra'],
    levels: ['intermedio', 'avanzado'],
    evidence: 'A',
    cues: [
      'Torso estrictamente horizontal a 90 grados paralelo al suelo.',
      'Tirón explosivo desde el piso directo a la base del esternón.',
      'En cada repetición la barra descansa totalmente en el suelo (dead stop).'
    ],
    regression: 'remo_barra',
    alternatives: ['remo_barra', 'remo_apoyo_pecho'],
    notes: 'Desarrolla fuerza pura y potencia de tracción eliminando la inercia elástica y el balanceo del tronco.'
  },
  {
    id: 'remo_meadows',
    name: 'Remo Meadows con barra',
    pattern: 'traccion_h',
    patternLabel: PATTERN_LABELS.traccion_h,
    primary: ['Dorsal ancho (porción baja)', 'Redondo mayor', 'Deltoides posterior'],
    equipment: ['Barra'],
    levels: ['intermedio', 'avanzado'],
    evidence: 'A',
    cues: [
      'Posición escalonada perpendicular a la punta de la barra en landmine.',
      'Mano libre firme en la rodilla adelantada para fijar el torso sin balanceo.',
      'Tirón con el codo en arco hacia la cadera con estiramiento profundo abajo.'
    ],
    regression: 'remo_mancuerna',
    alternatives: ['remo_mancuerna', 'remo_polea_baja'],
    notes: 'Aislamiento extremo del dorsal ancho y redondo mayor sin fatigar los erectores lumbares.'
  },
  {
    id: 'remo_mancuerna',
    name: 'Remo a una mano con mancuerna (apoyo en banco)',
    pattern: 'traccion_h',
    patternLabel: PATTERN_LABELS.traccion_h,
    primary: ['Dorsal ancho', 'Romboides'],
    equipment: ['Mancuerna', 'Banco'],
    levels: ['principiante', 'intermedio', 'avanzado'],
    evidence: 'B',
    cues: [
      'Apoya rodilla y mano opuesta en el banco con la espalda paralela al suelo.',
      'Tira de la mancuerna hacia la cadera (trayectoria en J) apretando el dorsal.',
      'Baja sintiendo un estiramiento profundo sin rotar el torso excesivamente.'
    ],
    alternatives: ['remo_barra', 'remo_apoyo_pecho'],
    notes: 'Gran rango de estiramiento y cero sobrecarga sobre la zona lumbar gracias al apoyo del banco.'
  },
  {
    id: 'remo_polea_baja',
    name: 'Remo sentado en polea baja con agarre estrecho',
    pattern: 'traccion_h',
    patternLabel: PATTERN_LABELS.traccion_h,
    primary: ['Dorsal ancho', 'Espalda media', 'Bíceps'],
    equipment: ['Polea'],
    levels: ['principiante', 'intermedio', 'avanzado'],
    evidence: 'B',
    cues: [
      'Pies firmes en los topes, rodillas ligeramente dobladas.',
      'Pecho erguido; tira del maneral hacia el abdomen bajo juntando las escápulas.',
      'Regresa estirando los brazos sin encorvar la columna.'
    ],
    alternatives: ['remo_mancuerna', 'remo_apoyo_pecho'],
    notes: 'Excelente para acumular volumen de espalda media con mínimo riesgo.'
  },
  {
    id: 'remo_apoyo_pecho',
    name: 'Remo con apoyo en el pecho en máquina o banco inclinado',
    pattern: 'traccion_h',
    patternLabel: PATTERN_LABELS.traccion_h,
    primary: ['Espalda media', 'Romboides', 'Dorsales'],
    equipment: ['Máquina', 'Banco inclinado', 'Mancuernas'],
    levels: ['principiante', 'intermedio', 'avanzado'],
    evidence: 'B',
    cues: [
      'Pecho completamente apoyado contra el respaldo acolchado.',
      'Tira con los codos hacia atrás con fuerza.',
      'Elimina cualquier posibilidad de hacer trampa o sobrecargar la espalda baja.'
    ],
    alternatives: ['remo_polea_baja', 'remo_mancuerna'],
    notes: 'La mejor opción si tienes la espalda baja fatigada de sentadillas o carreras.'
  },
  {
    id: 'remo_invertido',
    name: 'Remo invertido en barra (Australian Pull-up)',
    pattern: 'traccion_h',
    patternLabel: PATTERN_LABELS.traccion_h,
    primary: ['Espalda alta', 'Bíceps', 'Core'],
    equipment: ['Barra fija baja', 'Peso corporal'],
    levels: ['principiante', 'intermedio'],
    evidence: 'B',
    cues: [
      'Colócate debajo de una barra baja con el cuerpo recto como una tabla.',
      'Tira del pecho hacia la barra juntando los omóplatos.',
      'Para facilitar, dobla las rodillas; para dificultar, eleva los pies en un banco.'
    ],
    alternatives: ['remo_polea_baja'],
    notes: 'Excelente ejercicio funcional de calistenia y paso previo para dominadas.'
  },
  {
    id: 'face_pull',
    name: 'Face pull en polea con cuerda',
    pattern: 'traccion_h',
    patternLabel: PATTERN_LABELS.traccion_h,
    primary: ['Deltoides posterior', 'Manguito rotador', 'Trapecio medio'],
    equipment: ['Polea con cuerda'],
    levels: ['principiante', 'intermedio', 'avanzado'],
    evidence: 'C',
    cues: [
      'Ajusta la polea a la altura de los ojos.',
      'Tira de la cuerda hacia la frente o nariz separando las manos al final.',
      'Rota externamente los hombros mostrando los nudillos hacia atrás.'
    ],
    alternatives: ['pajaros'],
    notes: 'El ejercicio más recomendado para mantener los hombros sanos y revertir la postura encorvada del escritorio o el teléfono.'
  },
  {
    id: 'pajaros',
    name: 'Aperturas posteriores con mancuernas (Pájaros)',
    pattern: 'traccion_h',
    patternLabel: PATTERN_LABELS.traccion_h,
    primary: ['Deltoides posterior'],
    equipment: ['Mancuernas'],
    levels: ['principiante', 'intermedio'],
    evidence: 'C',
    cues: [
      'Inclina el torso al frente casi paralelo al suelo.',
      'Abre los brazos hacia los lados como alas con codos ligeramente doblados.',
      'Siente la contracción en la parte trasera del hombro sin impulsarte.'
    ],
    alternatives: ['face_pull'],
    notes: 'Aislamiento directo para la cabeza posterior del deltoides.'
  },

  // =========================================================================
  // --- BRAZOS (BÍCEPS Y TRÍCEPS) ---
  // =========================================================================
  {
    id: 'curl_biceps',
    name: 'Curl de bíceps con barra o mancuernas',
    pattern: 'brazos',
    patternLabel: PATTERN_LABELS.brazos,
    primary: ['Bíceps braquial'],
    equipment: ['Barra', 'Mancuernas'],
    levels: ['principiante', 'intermedio', 'avanzado'],
    evidence: 'B',
    cues: [
      'Codos pegados a los costados y fijos sin balancearse.',
      'Sube contrayendo el bíceps y aguanta 1 segundo arriba.',
      'Baja con lentitud estirando el brazo completo.'
    ],
    alternatives: ['curl_inclinado', 'curl_martillo'],
    notes: 'Básico tradicional para volumen de brazos.'
  },
  {
    id: 'curl_inclinado',
    name: 'Curl en banco inclinado con mancuernas',
    pattern: 'brazos',
    patternLabel: PATTERN_LABELS.brazos,
    primary: ['Bíceps (Cabeza larga)'],
    equipment: ['Mancuernas', 'Banco inclinado'],
    levels: ['intermedio'],
    evidence: 'B',
    cues: [
      'Banco inclinado a unos 60° con brazos colgando detrás del torso.',
      'Inicia la subida desde un estiramiento marcado del bíceps.',
      'Excelente estímulo por estiramiento previo.'
    ],
    alternatives: ['curl_biceps'],
    notes: 'Favorece el desarrollo del "pico" del bíceps gracias al estiramiento inicial.'
  },
  {
    id: 'curl_martillo',
    name: 'Curl martillo con mancuernas',
    pattern: 'brazos',
    patternLabel: PATTERN_LABELS.brazos,
    primary: ['Braquial anterior', 'Braquiorradial (antebrazo)'],
    equipment: ['Mancuernas'],
    levels: ['principiante', 'intermedio'],
    evidence: 'B',
    cues: [
      'Agarre neutro con las palmas mirándose entre sí.',
      'Sube apretando la parte externa del brazo y el antebrazo.',
      'Fortalece la fuerza de agarre y muñeca.'
    ],
    alternatives: ['curl_biceps'],
    notes: 'Aumenta el grosor visual del brazo y da fuerza para sostener sacos o barras.'
  },
  {
    id: 'triceps_polea',
    name: 'Extensión de tríceps en polea alta',
    pattern: 'brazos',
    patternLabel: PATTERN_LABELS.brazos,
    primary: ['Tríceps (Cabeza lateral y medial)'],
    equipment: ['Polea'],
    levels: ['principiante', 'intermedio', 'avanzado'],
    evidence: 'B',
    cues: [
      'Codos pegados al cuerpo y hombros fijos.',
      'Extiende los antebrazos hacia abajo hasta bloquear suavemente los codos y abre la cuerda al final.',
      'Sube con control hasta unos 90° sin mover los codos del sitio.'
    ],
    alternatives: ['triceps_sobre_cabeza', 'rompecraneos'],
    notes: 'El ejercicio más cómodo y seguro para aislar tríceps sin dolor de codos.'
  },
  {
    id: 'triceps_sobre_cabeza',
    name: 'Extensión de tríceps sobre la cabeza en polea o mancuerna',
    pattern: 'brazos',
    patternLabel: PATTERN_LABELS.brazos,
    primary: ['Tríceps (Cabeza larga)'],
    equipment: ['Polea', 'Mancuerna'],
    levels: ['intermedio'],
    evidence: 'B',
    cues: [
      'Brazos elevados verticalmente junto a la cabeza.',
      'Flexiona los codos dejando bajar el peso detrás de la nuca para estirar la cabeza larga.',
      'Extiende con fuerza hacia arriba.'
    ],
    alternatives: ['triceps_polea', 'rompecraneos'],
    notes: 'La cabeza larga del tríceps solo se estira al máximo cuando el brazo está elevado sobre la cabeza.'
  },
  {
    id: 'rompecraneos',
    name: 'Press francés / Rompecráneos con barra Z o mancuernas',
    pattern: 'brazos',
    patternLabel: PATTERN_LABELS.brazos,
    primary: ['Tríceps'],
    equipment: ['Barra EZ', 'Mancuernas', 'Banco'],
    levels: ['intermedio'],
    evidence: 'B',
    cues: [
      'Tumbado en banco plano con los brazos estirados verticalmente.',
      'Flexiona solo los codos llevando la barra hacia la frente o coronilla.',
      'Empuja con los tríceps de regreso a la vertical.'
    ],
    alternatives: ['triceps_polea'],
    notes: 'Clásico de fuerza para tríceps. Si tus codos se quejan, usa polea o mancuernas.'
  },

  // =========================================================================
  // --- GEMELOS / PANTORRILLAS ---
  // =========================================================================
  {
    id: 'gemelos_pie',
    name: 'Elevación de talones de pie (Gemelos de pie)',
    pattern: 'gemelos',
    patternLabel: PATTERN_LABELS.gemelos,
    primary: ['Gastrocnemio (Gemelos)', 'Tendón de Aquiles'],
    equipment: ['Máquina', 'Mancuerna', 'Escalón'],
    levels: ['principiante', 'intermedio', 'avanzado'],
    evidence: 'B',
    cues: [
      'Apoya la punta de los pies en un escalón con las rodillas completamente rectas pero no hiper-bloqueadas.',
      'Baja los talones profundamente sintiendo un estiramiento durante 2 segundos abajo.',
      'Impúlsate hasta la punta más alta y aprieta 1 segundo arriba.'
    ],
    alternatives: ['gemelos_sentado'],
    notes: 'Vital para corredores para brindar rigidez elástica al tendón de Aquiles y prevenir fascitis plantar.'
  },
  {
    id: 'gemelos_sentado',
    name: 'Elevación de talones sentado en máquina',
    pattern: 'gemelos',
    patternLabel: PATTERN_LABELS.gemelos,
    primary: ['Sóleo'],
    equipment: ['Máquina'],
    levels: ['principiante', 'intermedio', 'avanzado'],
    evidence: 'B',
    cues: [
      'Con las rodillas a 90°, el gemelo se relaja y el sóleo asume todo el trabajo.',
      'Baja lento y sube con recorrido completo.',
      'Excelente para resistencia de carrera sostenida.'
    ],
    alternatives: ['gemelos_pie'],
    notes: 'El sóleo soporta hasta 6-8 veces el peso corporal en cada zancada al correr.'
  },

  // =========================================================================
  // --- CORE / ABDOMEN Y ZONA MEDIA ---
  // =========================================================================
  {
    id: 'plancha',
    name: 'Plancha abdominal isométrica (Plank)',
    pattern: 'core',
    patternLabel: PATTERN_LABELS.core,
    primary: ['Recto abdominal', 'Transverso', 'Oblicuos'],
    equipment: ['Peso corporal'],
    levels: ['principiante'],
    evidence: 'B',
    cues: [
      'Apoya los antebrazos en el suelo alineados con los hombros.',
      'Aprieta glúteos y mete el ombligo como si te fueran a dar un puñetazo.',
      'No dejes caer la pelvis ni levantes los glúteos en pirámide.'
    ],
    alternatives: ['dead_bug', 'pallof_press'],
    notes: 'Base de estabilidad anti-extensión de la columna.'
  },
  {
    id: 'plancha_lateral',
    name: 'Plancha lateral isométrica',
    pattern: 'core',
    patternLabel: PATTERN_LABELS.core,
    primary: ['Oblicuos', 'Cuadrado lumbar', 'Glúteo medio'],
    equipment: ['Peso corporal'],
    levels: ['principiante'],
    evidence: 'B',
    cues: [
      'Apóyate sobre un antebrazo de lado con los pies juntos.',
      'Eleva la cadera formando una línea recta desde los tobillos hasta la cabeza.',
      'Mantén la tensión 30-40 segundos por lado.'
    ],
    alternatives: ['pallof_press'],
    notes: 'Fundamental para estabilizar la cadera y evitar el balanceo lateral al correr.'
  },
  {
    id: 'dead_bug',
    name: 'Bicho muerto (Dead Bug)',
    pattern: 'core',
    patternLabel: PATTERN_LABELS.core,
    primary: ['Transverso abdominal', 'Control motor'],
    equipment: ['Peso corporal'],
    levels: ['principiante'],
    evidence: 'B',
    cues: [
      'Boca arriba con rodillas a 90° y brazos apuntando al techo.',
      'Pega la espalda baja firmemente contra el suelo (cero hueco en la zona lumbar).',
      'Extiende brazo derecho y pierna izquierda de forma coordinada sin despegar la espalda baja.'
    ],
    alternatives: ['bird_dog', 'plancha'],
    notes: 'El ejercicio de rehabilitación y fortalecimiento lumbar más seguro y recomendado por fisioterapeutas.'
  },
  {
    id: 'bird_dog',
    name: 'Pájaro perro en cuadrupedia (Bird Dog)',
    pattern: 'core',
    patternLabel: PATTERN_LABELS.core,
    primary: ['Erectores espinales', 'Glúteo', 'Multífidos'],
    equipment: ['Peso corporal'],
    levels: ['principiante'],
    evidence: 'B',
    cues: [
      'En 4 puntos de apoyo (manos y rodillas).',
      'Extiende al mismo tiempo brazo derecho al frente y pierna izquierda hacia atrás.',
      'Mantén la cadera y hombros nivelados sin rotar el tronco.'
    ],
    alternatives: ['dead_bug'],
    notes: 'Parte de los famosos "Tres grandes de McGill" para una espalda sana y libre de dolor.'
  },
  {
    id: 'pallof_press',
    name: 'Press Pallof anti-rotación con banda o polea',
    pattern: 'core',
    patternLabel: PATTERN_LABELS.core,
    primary: ['Oblicuos', 'Transverso abdominal'],
    equipment: ['Polea', 'Banda'],
    levels: ['principiante', 'intermedio'],
    evidence: 'B',
    cues: [
      'Colócate de pie de lado a la polea a la altura del pecho.',
      'Extiende los brazos al frente resistiendo el jalón de la polea que intenta girarte.',
      'Aguanta 2 segundos al frente y regresa las manos al pecho.'
    ],
    alternatives: ['plancha_lateral'],
    notes: 'Enseña al abdomen a resistir la rotación indeseada durante la carrera y los levantamientos.'
  },
  {
    id: 'elevacion_rodillas_colgado',
    name: 'Elevación de rodillas colgado de barra',
    pattern: 'core',
    patternLabel: PATTERN_LABELS.core,
    primary: ['Abdomen inferior', 'Flexores de cadera', 'Fuerza de agarre'],
    equipment: ['Barra fija'],
    levels: ['intermedio'],
    evidence: 'C',
    cues: [
      'Cuélgate con agarre prono firme.',
      'Sube las rodillas hacia el pecho flexionando la pelvis hacia arriba, no solo moviendo las piernas.',
      'Baja lento evitando balancearte como un péndulo.'
    ],
    progression: 'elevacion_piernas_rectas',
    alternatives: ['rueda_abdominal'],
    notes: 'Entrena agarre y abdomen al mismo tiempo.'
  },
  {
    id: 'rueda_abdominal',
    name: 'Rueda abdominal (Ab Wheel Rollout)',
    pattern: 'core',
    patternLabel: PATTERN_LABELS.core,
    primary: ['Recto abdominal', 'Dorsal ancho'],
    equipment: ['Rueda abdominal'],
    levels: ['intermedio', 'avanzado'],
    evidence: 'C',
    cues: [
      'De rodillas en el suelo agarrando la rueda.',
      'Rueda hacia adelante extendiendo el cuerpo manteniendo el abdomen comprimido en hueco.',
      'Vuelve tirando con el abdomen y los dorsales sin dejar caer la espalda baja.'
    ],
    alternatives: ['plancha'],
    notes: 'Estímulo de tensión extrema. Iniciar con recorridos cortos antes de intentar estirar el cuerpo entero.'
  },
  {
    id: 'copenhagen',
    name: 'Plancha Copenhagen para aductores',
    pattern: 'core',
    patternLabel: PATTERN_LABELS.core,
    primary: ['Aductores (ingle)', 'Oblicuos'],
    equipment: ['Banco', 'Peso corporal'],
    levels: ['intermedio', 'avanzado'],
    evidence: 'B',
    cues: [
      'Apoya la pierna superior sobre un banco y el antebrazo en el suelo.',
      'Eleva el cuerpo sosteniéndote con la fuerza de la parte interna del muslo superior.',
      'Aguanta 20-30 segundos por lado.'
    ],
    alternatives: ['plancha_lateral'],
    notes: 'Respaldado por el British Journal of Sports Medicine como el método más eficaz para evitar pubalgias y lesiones de ingle.'
  },

  // =========================================================================
  // --- ACARREOS Y FUERZA DE AGARRE (HYROX, OCR Y FUNCIONAL) ---
  // =========================================================================
  {
    id: 'paseo_granjero',
    name: 'Paseo del granjero (Farmer’s Carry)',
    pattern: 'acarreo',
    patternLabel: PATTERN_LABELS.acarreo,
    primary: ['Antebrazos / Agarre', 'Trapecios', 'Core', 'Glúteos'],
    equipment: ['Mancuernas', 'Kettlebell'],
    levels: ['principiante', 'intermedio', 'avanzado'],
    evidence: 'B',
    cues: [
      'Levanta dos pesos pesados a los costados con técnica de peso muerto.',
      'Camina erguido con pasos cortos, pecho alto y hombros estables.',
      'No dejes que los pesos se balanceen contra tus muslos.'
    ],
    alternatives: ['maleta_carry', 'colgado_barra'],
    notes: 'Estación oficial Hyrox (200 m). Construye una resistencia de agarre de acero indispensable para cualquier deporte.'
  },
  {
    id: 'maleta_carry',
    name: 'Acarreo de maleta a una mano (Suitcase Carry)',
    pattern: 'acarreo',
    patternLabel: PATTERN_LABELS.acarreo,
    primary: ['Oblicuos', 'Cuadrado lumbar', 'Agarre'],
    equipment: ['Mancuerna', 'Kettlebell'],
    levels: ['principiante', 'intermedio'],
    evidence: 'B',
    cues: [
      'Sostén un peso pesado solo en una mano.',
      'Camina manteniendo los hombros perfectamente nivelados, resistiendo la tendencia a inclinarte de lado.',
      'Cambia de mano al completar la distancia.'
    ],
    alternatives: ['paseo_granjero'],
    notes: 'Entrenamiento funcional supremo anti-inclinación lateral.'
  },
  {
    id: 'colgado_barra',
    name: 'Colgado pasivo y activo en barra (Dead Hang)',
    pattern: 'acarreo',
    patternLabel: PATTERN_LABELS.acarreo,
    primary: ['Fuerza de dedos y antebrazo', 'Descompresión espinal', 'Hombros'],
    equipment: ['Barra fija', 'Peso corporal'],
    levels: ['principiante', 'intermedio', 'avanzado'],
    evidence: 'B',
    cues: [
      'Cuélgate con ambos brazos estirados de una barra fija.',
      'Respira hondo y siente cómo se descomprimen las vértebras lumbares.',
      'Para colgado activo, activa ligeramente las escápulas separando los hombros de las orejas.'
    ],
    alternatives: ['paseo_granjero'],
    notes: 'Esencial para pasar obstáculos de suspensión en carreras OCR y aliviar dolor de espalda tras cargar pesos.'
  },
  {
    id: 'acarreo_saco',
    name: 'Acarreo de saco de arena al pecho (Sandbag Carry)',
    pattern: 'acarreo',
    patternLabel: PATTERN_LABELS.acarreo,
    primary: ['Espalda alta', 'Bíceps', 'Core', 'Capacidad pulmonar'],
    equipment: ['Saco de arena'],
    levels: ['principiante', 'intermedio', 'avanzado'],
    evidence: 'C',
    cues: [
      'Abraza el saco contra el pecho entrelazando las manos (agarre de oso).',
      'Camina manteniendo la respiración rítmica a pesar de la presión en el tórax.'
    ],
    alternatives: ['paseo_granjero'],
    notes: 'Prepara para la estación de zancadas con saco de Hyrox y acarreos pesados de Spartan Race.'
  },

  // =========================================================================
  // --- POTENCIA Y PLIOMETRÍA (PARA CORREDORES Y PRUEBAS HÍBRIDAS) ---
  // =========================================================================
  {
    id: 'salto_cajon',
    name: 'Salto al cajón pliométrico (Box Jump)',
    pattern: 'potencia',
    patternLabel: PATTERN_LABELS.potencia,
    primary: ['Glúteos', 'Cuádriceps', 'Reactividad de tobillo'],
    equipment: ['Cajón pliométrico'],
    levels: ['principiante', 'intermedio'],
    evidence: 'B',
    cues: [
      'Coge impulso doblando rodillas y lanzando brazos hacia atrás.',
      'Explota hacia arriba y aterriza suave en el centro del cajón con rodillas flexionadas amortiguando.',
      'Ponte de pie completo arriba antes de bajar caminando (evita saltar hacia atrás al suelo para cuidar el tendón).'
    ],
    alternatives: ['sentadilla_salto'],
    notes: 'Mejora la economía de zancada en corredores sin acumular fatiga excesiva.'
  },
  {
    id: 'sentadilla_salto',
    name: 'Sentadilla con salto vertical (Jump Squat)',
    pattern: 'potencia',
    patternLabel: PATTERN_LABELS.potencia,
    primary: ['Piernas', 'Potencia elástica'],
    equipment: ['Peso corporal'],
    levels: ['intermedio'],
    evidence: 'B',
    cues: [
      'Baja a media sentadilla y despega con máxima aceleración vertical.',
      'Aterriza de puntas a talones absorbiendo el impacto con las caderas.'
    ],
    alternatives: ['salto_cajon'],
    notes: 'Aumenta el reclutamiento de fibras rápidas de contracción.'
  },
  {
    id: 'salto_longitud',
    name: 'Salto de longitud a pies juntos (Broad Jump)',
    pattern: 'potencia',
    patternLabel: PATTERN_LABELS.potencia,
    primary: ['Cadena posterior', 'Potencia horizontal'],
    equipment: ['Peso corporal'],
    levels: ['intermedio'],
    evidence: 'B',
    cues: [
      'Carga la cadera hacia atrás y propúlsate hacia adelante lo más lejos posible.',
      'Aterriza con ambos pies a la vez de forma suave.'
    ],
    alternatives: ['salto_cajon'],
    notes: 'La base biomecánica del burpee broad jump de 80 m de Hyrox.'
  },
  {
    id: 'lanzamiento_balon',
    name: 'Lanzamiento de balón medicinal a la pared (Wall Ball)',
    pattern: 'potencia',
    patternLabel: PATTERN_LABELS.potencia,
    primary: ['Piernas', 'Hombros', 'Capacidad anaeróbica'],
    equipment: ['Balón medicinal', 'Pared'],
    levels: ['principiante', 'intermedio'],
    evidence: 'B',
    cues: [
      'Sostén el balón frente al pecho, haz una sentadilla profunda (cadera rompe paralelo).',
      'Extiende las piernas con ímpetu y lanza el balón al objetivo en la pared (3 m hombres / 2.7 m mujeres).',
      'Atrapa el balón mientras desciendes fluidamente a la siguiente sentadilla.'
    ],
    alternatives: ['sentadilla_salto'],
    notes: 'Estación final de Hyrox (100 repeticiones). Exige sincronización perfecta de respiración y ritmo.'
  },

  // =========================================================================
  // --- MOVILIDAD, PREHAB Y SALUD ARTICULAR ---
  // =========================================================================
  {
    id: 'mov_cadera_90_90',
    name: 'Movilidad de cadera 90/90 en suelo',
    pattern: 'prehab',
    patternLabel: PATTERN_LABELS.prehab,
    primary: ['Rotación interna y externa de cadera'],
    equipment: ['Peso corporal'],
    levels: ['principiante'],
    evidence: 'C',
    cues: [
      'Siéntate en el suelo con ambas piernas dobladas a 90 grados (una al frente y otra al costado).',
      'Inclina suavemente el torso sobre la pierna delantera sintiendo el glúteo.',
      'Cambia de lado rotando las rodillas sin despegar los talones.'
    ],
    alternatives: ['figura_4_gluteo'],
    notes: 'Libera la tensión en las caderas tras largas jornadas sentado y antes de correr o hacer sentadillas.'
  },
  {
    id: 'rot_toracica',
    name: 'Rotación torácica en cuadrupedia',
    pattern: 'prehab',
    patternLabel: PATTERN_LABELS.prehab,
    primary: ['Columna torácica', 'Salud escapular'],
    equipment: ['Peso corporal'],
    levels: ['principiante'],
    evidence: 'C',
    cues: [
      'En cuadrupedia, coloca una mano detrás de la cabeza.',
      'Gira el codo hacia el codo de apoyo y luego ábrelo hacia el techo siguiendo el movimiento con la mirada.',
      'Haz 8 repeticiones lentas por lado.'
    ],
    alternatives: ['face_pull'],
    notes: 'Mejora la capacidad de expansión del tórax para respirar mejor corriendo y reduce la rigidez cervical.'
  },
  {
    id: 'dorsiflexion_pared',
    name: 'Dorsiflexión de tobillo contra la pared',
    pattern: 'prehab',
    patternLabel: PATTERN_LABELS.prehab,
    primary: ['Movilidad de tobillo (Tendón de Aquiles)'],
    equipment: ['Pared'],
    levels: ['principiante'],
    evidence: 'C',
    cues: [
      'Coloca el pie a unos 8-10 cm de la pared.',
      'Lleva la rodilla hacia la pared sin despegar el talón del suelo.',
      'Si tocas con facilidad, aleja el pie un centímetro más.'
    ],
    alternatives: ['gemelos_pie'],
    notes: 'La falta de dorsiflexión es la causa número 1 de problemas en sentadilla profunda y sobrecargas en la tibia al correr.'
  },
  {
    id: 'equilibrio_unipodal',
    name: 'Equilibrio a una pierna sobre superficie estable o inestable',
    pattern: 'prehab',
    patternLabel: PATTERN_LABELS.prehab,
    primary: ['Propiocepción de tobillo', 'Glúteo medio'],
    equipment: ['Peso corporal'],
    levels: ['principiante'],
    evidence: 'B',
    cues: [
      'Ponte de pie sobre un solo pie con la rodilla ligeramente desbloqueada.',
      'Aguanta 30 segundos manteniendo el arco del pie activo.',
      'Para nivel avanzado, cierra los ojos o gira la cabeza suavemente.'
    ],
    alternatives: ['pdr_unilateral'],
    notes: 'Protege contra esguinces y torceduras en senderos de running y carreras con obstáculos (OCR).'
  }
];

export function getExerciseById(id: string): ExerciseData | undefined {
  return SCIENTIFIC_EXERCISES.find(ex => ex.id === id);
}

export function searchExercises(query: string, pattern?: string): ExerciseData[] {
  const q = query.toLowerCase().trim();
  return SCIENTIFIC_EXERCISES.filter(ex => {
    const matchesQuery = !q || 
      ex.name.toLowerCase().includes(q) || 
      ex.primary.some(m => m.toLowerCase().includes(q)) ||
      ex.equipment.some(e => e.toLowerCase().includes(q));
    const matchesPattern = !pattern || ex.pattern === pattern;
    return matchesQuery && matchesPattern;
  });
}
