import { SCIENTIFIC_EXERCISES } from '../data/exercisesData';
import { findExerciseMedia } from './exerciseMediaDb';

export interface ExerciseDetail {
  id: string;
  name: string;
  muscleGroup: 'Pecho' | 'Espalda' | 'Cuádriceps' | 'Glúteos' | 'Isquios y Glúteo' | 'Hombros' | 'Brazos' | 'Core' | 'Cardio y Metabólico';
  pattern: 'Empuje horizontal' | 'Tracción vertical' | 'Tracción horizontal' | 'Dominante rodilla' | 'Dominante cadera' | 'Empuje vertical' | 'Aislamiento' | 'Metabólico' | 'Carga y Agarre';
  level: 'A' | 'B' | 'C';
  equipment: 'Mancuernas' | 'Barra' | 'Máquina' | 'Polea' | 'Peso corporal' | 'Kettlebell' | 'Caja / Banco' | 'Saco / Lastre' | 'Ergómetro';
  steps: string[];
  commonMistakes: string[];
  breathingTip: string;
  targetFocus: string;
  imageUrl?: string;
  demoImages?: [string, string];
}

export const EXERCISE_BANK: ExerciseDetail[] = [
  // ==========================================
  // --- PECHO / EMPUJE HORIZONTAL ---
  // ==========================================
  {
    id: 'press_plano_mancuernas',
    name: 'Press plano con mancuernas',
    muscleGroup: 'Pecho',
    pattern: 'Empuje horizontal',
    level: 'A',
    equipment: 'Mancuernas',
    steps: [
      'Acuéstate sobre un banco plano con una mancuerna en cada mano a la altura del pecho.',
      'Planta los pies firmes en el suelo y retrae las escápulas (junta los omóplatos hacia atrás y abajo).',
      'Empuja las mancuernas verticalmente sin llegar a chocar los discos arriba ni bloquear los codos.',
      'Baja de forma controlada en 2-3 segundos hasta sentir un estiramiento agradable en el pectoral.'
    ],
    commonMistakes: [
      'Abrir los codos a 90° respecto al torso (deben ir a unos 45-60° en forma de flecha para proteger los hombros).',
      'Despegar la zona lumbar o los glúteos del banco de forma exagerada.',
      'Rebotar o dejar caer el peso sin frenar la bajada.'
    ],
    breathingTip: 'Inhala profundo al descender las mancuernas; exhala con fuerza al empujar hacia arriba.',
    targetFocus: 'Pectoral mayor, deltoides anterior y tríceps.'
  },
  {
    id: 'press_banca_barra',
    name: 'Press de banca con barra',
    muscleGroup: 'Pecho',
    pattern: 'Empuje horizontal',
    level: 'B',
    equipment: 'Barra',
    steps: [
      'Túmbate bajo la barra con los ojos alineados debajo de la misma.',
      'Agarra la barra a un ancho ligeramente superior al de los hombros con agarre prono firme.',
      'Retrae escápulas fuertemente, crea un arco lumbar anatómico y clava los talones en el suelo (leg drive).',
      'Desengancha la barra, bájala con control hacia la parte inferior del esternón.',
      'Empuja explosivamente en trayectoria ligeramente diagonal hacia tus hombros.'
    ],
    commonMistakes: [
      'Rebotar la barra en las costillas o el esternón.',
      'Permitir que las muñecas se doblen hacia atrás en hiperextensión.',
      'Desarmar la retracción de los hombros en la parte más alta de la repetición.'
    ],
    breathingTip: 'Inhala y aprieta el abdomen (maniobra de Valsalva) antes de bajar; exhala al superar el punto de estancamiento.',
    targetFocus: 'Fuerza máxima de empuje en tren superior y densidad de pectoral.'
  },
  {
    id: 'press_banca_pausa',
    name: 'Press de banca con pausa de 2s abajo',
    muscleGroup: 'Pecho',
    pattern: 'Empuje horizontal',
    level: 'C',
    equipment: 'Barra',
    steps: [
      'Ejecuta la técnica de press de banca con barra con retracción escapular férrea.',
      'Baja la barra controlado y detente por completo a 1 cm del pecho o rozando la camiseta durante 2 segundos cronometrados.',
      'Mantén toda la musculatura en máxima tensión isométrica sin dejar caer el peso sobre el pecho.',
      'Empuja con máxima aceleración desde el punto muerto.'
    ],
    commonMistakes: [
      'Relajar los hombros o el pecho durante la pausa.',
      'Apresurar la pausa (cuenta "mil uno, mil dos" mentalmente).'
    ],
    breathingTip: 'Mantén aire comprimido en el tórax durante toda la pausa; libera al subir.',
    targetFocus: 'Potencia pura desde el punto de estancamiento y control neuromuscular absoluto.'
  },
  {
    id: 'press_inclinado_mancuernas',
    name: 'Press inclinado con mancuernas',
    muscleGroup: 'Pecho',
    pattern: 'Empuje horizontal',
    level: 'B',
    equipment: 'Mancuernas',
    steps: [
      'Ajusta el banco a unos 30-45° de inclinación.',
      'Sube las mancuernas a la altura de los hombros con ayuda de las rodillas.',
      'Mantén escápulas retraídas y empuja las mancuernas convergiendo hacia el centro sin chocarlas.',
      'Desciende con cadencia lenta sintiendo el estiramiento en la porción clavicular del pecho.'
    ],
    commonMistakes: [
      'Inclinar el banco a más de 45° (convierte el ejercicio en press de hombros).',
      'Despegar la espalda alta del respaldo al empujar.'
    ],
    breathingTip: 'Inhala en la fase excéntrica lenta; exhala en la fase de empuje.',
    targetFocus: 'Haz clavicular del pectoral mayor y deltoides anterior.'
  },
  {
    id: 'fondos_paralelas_pecho',
    name: 'Fondos en paralelas (Dips)',
    muscleGroup: 'Pecho',
    pattern: 'Empuje horizontal',
    level: 'C',
    equipment: 'Peso corporal',
    steps: [
      'Sujétate en las barras paralelas con brazos extendidos y hombros deprimidos.',
      'Inclina el torso hacia adelante unos 20-30° para enfocar el esfuerzo en el pectoral.',
      'Flexiona los codos bajando hasta que los brazos formen un ángulo de 90° (no fuerces más allá si hay dolor de hombro).',
      'Empuja firmemente hacia arriba extendiendo los brazos sin redondear los hombros.'
    ],
    commonMistakes: [
      'Mantener el torso totalmente vertical (desvía el trabajo casi exclusivamente al tríceps).',
      'Permitir que los hombros se eleven hacia las orejas por falta de estabilidad escapular.'
    ],
    breathingTip: 'Inhala al descender controlado; exhala con fuerza al subir.',
    targetFocus: 'Pectoral inferior, tríceps y estabilizadores escapulares.'
  },
  {
    id: 'cruces_polea_pecho',
    name: 'Cruces en polea para pecho',
    muscleGroup: 'Pecho',
    pattern: 'Aislamiento',
    level: 'A',
    equipment: 'Polea',
    steps: [
      'Coloca las poleas a la altura del pecho o ligeramente por encima.',
      'Da un paso al frente con un pie adelantado para ganar equilibrio.',
      'Con una ligera flexión en los codos, junta las manos al frente simulando un abrazo.',
      'Aguanta 1 segundo la contracción en el centro y regresa estirando el pectoral despacio.'
    ],
    commonMistakes: [
      'Flexionar y extender los codos como si fuera press en vez de apertura.',
      'Impulsar el torso balanceándose hacia adelante y atrás.'
    ],
    breathingTip: 'Inhala al abrir los brazos; exhala al cerrar y apretar el pectoral.',
    targetFocus: 'Aislamiento y congestión sanguínea en el pectoral con tensión continua.'
  },

  // ==========================================
  // --- CUÁDRICEPS / DOMINANTE DE RODILLA ---
  // ==========================================
  {
    id: 'sentadilla_goblet',
    name: 'Sentadilla copa (Goblet Squat)',
    muscleGroup: 'Cuádriceps',
    pattern: 'Dominante rodilla',
    level: 'A',
    equipment: 'Mancuernas',
    steps: [
      'Sostén una mancuerna o kettlebell verticalmente pegada al pecho con ambas manos.',
      'Coloca los pies al ancho de los hombros con las puntas ligeramente hacia afuera (15-30°).',
      'Desciende flexionando rodillas y caderas al mismo tiempo, manteniendo el torso lo más vertical posible.',
      'Baja hasta que los muslos rompan el paralelo con el suelo (o los codos rocen los muslos por dentro).',
      'Empuja firmemente a través del mediopié para volver a la posición erguida.'
    ],
    commonMistakes: [
      'Dejar que los talones se despeguen del suelo por falta de movilidad de tobillo.',
      'Colapsar las rodillas en valgo hacia adentro (deben apuntar hacia los dedos del pie).'
    ],
    breathingTip: 'Inhala hondo inflando el abdomen al bajar; exhala al incorporarte.',
    targetFocus: 'Patrón de sentadilla perfecto, movilidad de cadera y cuádriceps.'
  },
  {
    id: 'sentadilla_trasera_barra',
    name: 'Sentadilla trasera con barra (Back Squat)',
    muscleGroup: 'Cuádriceps',
    pattern: 'Dominante rodilla',
    level: 'B',
    equipment: 'Barra',
    steps: [
      'Coloca la barra apoyada sobre los trapecios (barra alta para mayor verticalidad y énfasis en cuádriceps).',
      'Desengancha la barra dando dos pasos hacia atrás firmes y estables.',
      'Toma aire hacia el abdomen creando presión intraabdominal (brace core).',
      'Baja de forma controlada rompiendo el paralelo con la cadera por debajo de las rodillas.',
      'Empuja el suelo con fuerza levantándote con torso sólido y trayectoria recta.'
    ],
    commonMistakes: [
      'Redondear la espalda baja en el fondo ("guiño de glúteo" severo).',
      'Subir primero la cadera dejando el torso horizontal ("sentadilla buenos días").'
    ],
    breathingTip: 'Inhala profundamente y crea presión antes de descender; mantén hasta pasar el punto medio de subida.',
    targetFocus: 'Fuerza base de cuádriceps, glúteos y cadena extensora de piernas.'
  },
  {
    id: 'sentadilla_pausa_2s',
    name: 'Sentadilla trasera con pausa de 2s abajo',
    muscleGroup: 'Cuádriceps',
    pattern: 'Dominante rodilla',
    level: 'C',
    equipment: 'Barra',
    steps: [
      'Ejecuta una sentadilla profunda con barra alta.',
      'Al llegar a la profundidad máxima (rompiendo el paralelo), congela la posición durante 2 segundos completos.',
      'Mantén el torso erguido y el core en máxima tensión sin sentarte sobre tus articulaciones.',
      'Explota hacia arriba desde el reposo total sin rebotes.'
    ],
    commonMistakes: [
      'Relajar el abdomen en el fondo de la pausa.',
      'Hacer un rebote previo antes de comenzar la subida.'
    ],
    breathingTip: 'Retén el aire intraabdominal durante los 2 segundos de pausa; exhala al superar la subida.',
    targetFocus: 'Fuerza en el punto muerto, hipertrofia de vastos de cuádriceps y estabilidad lumbar.'
  },
  {
    id: 'sentadilla_frontal_barra',
    name: 'Sentadilla frontal con barra (Front Squat)',
    muscleGroup: 'Cuádriceps',
    pattern: 'Dominante rodilla',
    level: 'C',
    equipment: 'Barra',
    steps: [
      'Apoya la barra sobre los deltoides anteriores con los codos apuntando altos al frente (agarre olímpico o de brazos cruzados).',
      'Pies al ancho de hombros, torso estrictamente vertical.',
      'Desciende llevando las rodillas hacia adelante en la línea de las puntas de los pies.',
      'Baja profundo manteniendo los codos arriba en todo momento para no dejar caer la barra.',
      'Empuja con el centro del pie hacia arriba sin inclinar el pecho hacia adelante.'
    ],
    commonMistakes: [
      'Bajar los codos durante el descenso, lo cual redondea la espalda alta y tira la barra.',
      'Llevar la cadera demasiado atrás como en sentadilla barra baja en lugar de vertical.'
    ],
    breathingTip: 'Inhala expandiendo la caja torácica antes de bajar; exhala al terminar de extender las rodillas.',
    targetFocus: 'Máximo reclutamiento del recto femoral y vastos con mínimo estrés en zona lumbar.'
  },
  {
    id: 'sentadilla_hack_maquina',
    name: 'Sentadilla Hack en máquina',
    muscleGroup: 'Cuádriceps',
    pattern: 'Dominante rodilla',
    level: 'B',
    equipment: 'Máquina',
    steps: [
      'Coloca los hombros bajo los cojines y la espalda apoyada totalmente en el respaldo inclinado.',
      'Sitúa los pies en la parte media/baja de la plataforma para favorecer la flexión de rodilla.',
      'Baja controladamente hasta una flexión de rodilla de 90° a 110° sin que la cadera se despegue del cojín.',
      'Empuja con la planta del pie extendiendo las piernas sin hiperextender rodillas arriba.'
    ],
    commonMistakes: [
      'Despegar la zona lumbar del respaldo en el punto más profundo.',
      'Colocar los pies demasiado arriba en la plataforma (desvía el trabajo al glúteo en vez de cuádriceps).'
    ],
    breathingTip: 'Inhala en el descenso lento (3 segundos); exhala potente en la fase concéntrica.',
    targetFocus: 'Aislamiento puro y seguro de cuádriceps con gran sobrecarga mecánica.'
  },
  {
    id: 'prensa_inclinada_piernas',
    name: 'Prensa de piernas inclinada a 45°',
    muscleGroup: 'Cuádriceps',
    pattern: 'Dominante rodilla',
    level: 'A',
    equipment: 'Máquina',
    steps: [
      'Siéntate con la espalda baja y los glúteos perfectamente pegados al respaldo.',
      'Ubica los pies en el centro de la plataforma al ancho de hombros.',
      'Quita los seguros y baja la plataforma flexionando rodillas hasta unos 90-100° sin despegar la pelvis.',
      'Empuja con toda la planta del pie sin llegar a bloquear las rodillas de forma brusca arriba.'
    ],
    commonMistakes: [
      'Bloquear las rodillas con hiperextensión al final de la subida (riesgo articular severo).',
      'Despegar el sacro del asiento por intentar bajar más allá de la propia movilidad.'
    ],
    breathingTip: 'Inhala mientras el carro desciende hacia ti; exhala al presionar.',
    targetFocus: 'Sobrecarga de cuádriceps sin fatiga compresiva sobre la columna.'
  },
  {
    id: 'extension_cuadriceps_maquina',
    name: 'Extensiones de cuádriceps en máquina',
    muscleGroup: 'Cuádriceps',
    pattern: 'Aislamiento',
    level: 'A',
    equipment: 'Máquina',
    steps: [
      'Ajusta la máquina de modo que el eje de rotación coincida exactamente con la línea de tus rodillas.',
      'Coloca el rodillo sobre la parte baja de las tibias (justo encima de los tobillos).',
      'Sujeta los mangos laterales para mantener la pelvis anclada al asiento.',
      'Extiende las piernas hasta la horizontal, manteniendo una contracción isométrica de 1 segundo arriba.',
      'Desciende en 3 segundos de forma pausada sintiendo el estiramiento del cuádriceps.'
    ],
    commonMistakes: [
      'Lanzar las piernas con balanceo usando impulso y rebotar las placas de peso.',
      'Despegar la cadera del asiento en la contracción máxima.'
    ],
    breathingTip: 'Exhala al extender completamente las rodillas; inhala al resistir la bajada excéntrica.',
    targetFocus: 'Aislamiento absoluto del recto femoral en posición acortada.'
  },
  {
    id: 'sentadilla_bulgara_cuadriceps',
    name: 'Sentadilla búlgara (enfoque cuádriceps)',
    muscleGroup: 'Cuádriceps',
    pattern: 'Dominante rodilla',
    level: 'B',
    equipment: 'Mancuernas',
    steps: [
      'Coloca el empeine de un pie sobre un banco detrás de ti a la altura de la rodilla.',
      'Da un paso al frente moderado y mantén el torso estrictamente vertical (a diferencia del enfoque glúteo).',
      'Desciende permitiendo que la rodilla delantera avance hacia adelante sobre las puntas de los pies.',
      'Baja hasta que el muslo delantero quede paralelo al suelo y la rodilla trasera casi toque el piso.',
      'Empuja con la punta y mediopié hacia arriba manteniendo la verticalidad.'
    ],
    commonMistakes: [
      'Inclinar el torso 45° adelante (eso deriva la carga al glúteo).',
      'Colocar el pie delantero excesivamente lejos impidiendo la flexión de rodilla.'
    ],
    breathingTip: 'Inhala al descender; exhala al empujar hacia la posición inicial.',
    targetFocus: 'Fuerza unilateral, equilibrio y desarrollo de vasto interno y externo.'
  },
  {
    id: 'sentadilla_sissy',
    name: 'Sentadilla sissy (inclinando el cuerpo hacia atrás)',
    muscleGroup: 'Cuádriceps',
    pattern: 'Aislamiento',
    level: 'C',
    equipment: 'Peso corporal',
    steps: [
      'De pie, apoyando los talones elevados en una plataforma o sobre las puntas de los pies.',
      'Mantén una línea recta desde las rodillas hasta los hombros apretando el glúteo y core.',
      'Empuja las rodillas hacia adelante y desciende inclinando el torso hacia atrás para compensar.',
      'Siente un estiramiento extremo en los cuádriceps conforme desciendes.',
      'Vuelve a subir empujando con los cuádriceps manteniendo el tronco alineado.'
    ],
    commonMistakes: [
      'Flexionar la cadera quebrando la línea torso-muslo.',
      'No usar apoyo para las manos al aprender el movimiento.'
    ],
    breathingTip: 'Inhala en el estiramiento descendente; exhala al retornar.',
    targetFocus: 'Sobrecarga del recto anterior del cuádriceps en su máximo estiramiento excéntrico.'
  },
  {
    id: 'zancadas_caminando_cuadriceps',
    name: 'Zancadas caminando (Walking Lunges)',
    muscleGroup: 'Cuádriceps',
    pattern: 'Dominante rodilla',
    level: 'A',
    equipment: 'Mancuernas',
    steps: [
      'Sostén una mancuerna en cada mano con brazos a los lados.',
      'Da un paso amplio al frente y desciende con control flexionando ambas rodillas a 90°.',
      'Mantén el torso erguido para maximizar la demanda sobre el cuádriceps de la pierna delantera.',
      'Empuja a través del talón y da el siguiente paso de manera fluida y continua.'
    ],
    commonMistakes: [
      'Dar pasos demasiado cortos que fuerzan la articulación del tobillo excesivamente.',
      'Golpear la rodilla trasera contra el suelo con brusquedad.'
    ],
    breathingTip: 'Inhala al dar el paso y descender; exhala al impulsarte hacia el siguiente paso.',
    targetFocus: 'Capacidad de trabajo unilateral, hipertrofia de piernas y estabilidad de core.'
  },

  // ==========================================
  // --- GLÚTEOS / CADENA POSTERIOR ---
  // ==========================================
  {
    id: 'hip_thrust_barra',
    name: 'Empuje de cadera con barra (Hip thrust)',
    muscleGroup: 'Glúteos',
    pattern: 'Dominante cadera',
    level: 'B',
    equipment: 'Barra',
    steps: [
      'Apoya la espalda alta (borde inferior de escápulas) contra un banco acolchado.',
      'Coloca una almohadilla protectora sobre la barra y ubícala en el pliegue de la cadera.',
      'Pies al ancho de hombros con espinillas completamente verticales en el punto más alto del levantamiento.',
      'Empuja la cadera hacia arriba a través de los talones hasta alcanzar la extensión completa.',
      'Mantén la barbilla pegada al pecho (mirada al frente) para no arquear la columna lumbar.',
      'Aprieta los glúteos en la cima durante 1 segundo antes de descender con control.'
    ],
    commonMistakes: [
      'Hiperextender la zona lumbar en la cima mirando al techo.',
      'Poner los pies demasiado lejos (activa más isquiotibiales) o demasiado cerca (activa más cuádriceps).'
    ],
    breathingTip: 'Inhala al bajar la cadera; exhala con fuerza al extender y apretar el glúteo arriba.',
    targetFocus: 'Sobrecarga máxima del glúteo mayor en posición de máxima contracción (acortamiento).'
  },
  {
    id: 'hip_thrust_pausa_2s',
    name: 'Empuje de cadera con barra y pausa de 2s (Hip thrust)',
    muscleGroup: 'Glúteos',
    pattern: 'Dominante cadera',
    level: 'C',
    equipment: 'Barra',
    steps: [
      'Configura la postura idéntica al Hip Thrust con barra tradicional.',
      'Empuja explosivamente hasta la extensión completa de cadera.',
      'Congela la posición arriba durante 2 segundos cronometrados apretando los glúteos al 100%.',
      'Desciende en 2 segundos controlando el retorno excéntrico.'
    ],
    commonMistakes: [
      'Perder la altura de la cadera durante los 2 segundos de pausa.',
      'Dejar que las rodillas se cierren hacia adentro bajo fatiga.'
    ],
    breathingTip: 'Exhala al subir; mantén la tensión muscular en apnea controlada durante la pausa; inhala al bajar.',
    targetFocus: 'Reclutamiento de unidades motoras del glúteo mayor y eliminación del rebote inercial.'
  },
  {
    id: 'kas_glute_bridge',
    name: 'Kas Glute Bridge con mancuerna o barra',
    muscleGroup: 'Glúteos',
    pattern: 'Dominante cadera',
    level: 'A',
    equipment: 'Mancuernas',
    steps: [
      'Apoya la zona escapular en el banco igual que en un Hip Thrust.',
      'A diferencia del Hip Thrust, aquí el rango de movimiento es corto: solo baja la cadera un tercio del recorrido.',
      'Mantén las espinillas perpendiculares al suelo en todo momento sin movimiento hacia adelante de las rodillas.',
      'Enfócate en la contracción apical pura del glúteo mayor con cadencia pausada.'
    ],
    commonMistakes: [
      'Bajar la cadera hasta el suelo convirtiéndolo en un hip thrust convencional.',
      'Mover las rodillas adelante y atrás durante la repetición.'
    ],
    breathingTip: 'Exhala en la subida corta; inhala en la bajada mínima controlada.',
    targetFocus: 'Aislamiento continuo en máxima tensión del glúteo mayor sin demanda de flexión de rodilla.'
  },
  {
    id: 'sentadilla_bulgara_gluteo',
    name: 'Sentadilla búlgara con torso inclinado (enfoque glúteo)',
    muscleGroup: 'Glúteos',
    pattern: 'Dominante cadera',
    level: 'B',
    equipment: 'Mancuernas',
    steps: [
      'Coloca el empeine trasero en un banco a la altura de la rodilla.',
      'Da un paso al frente suficiente para que la espinilla delantera se mantenga casi vertical.',
      'Inclina el torso hacia adelante a unos 45° manteniendo la columna perfectamente recta.',
      'Desciende empujando la cadera hacia atrás y abajo sintiendo el estiramiento profundo del glúteo de la pierna delantera.',
      'Empuja a través del talón delantero para volver arriba.'
    ],
    commonMistakes: [
      'Mantener el torso vertical (eso transfiere el estímulo al cuádriceps).',
      'Cargar el peso en la pierna trasera.'
    ],
    breathingTip: 'Inhala hondo al estirar el glúteo en la bajada; exhala al retornar.',
    targetFocus: 'Hipertrofia unilateral de glúteo mayor en posición estirada mediante flexión de cadera.'
  },
  {
    id: 'patada_gluteo_polea',
    name: 'Patada de glúteo en polea a 30° (Cable Kickback)',
    muscleGroup: 'Glúteos',
    pattern: 'Aislamiento',
    level: 'A',
    equipment: 'Polea',
    steps: [
      'Coloca la tobillera en la polea baja.',
      'Inclina el torso hacia adelante unos 30-45° apoyando las manos en la estructura para estabilizar la pelvis.',
      'Patea la pierna hacia atrás y ligeramente hacia afuera (unos 30° de abducción) siguiendo el plano de las fibras del glúteo.',
      'Mantén 1 segundo la contracción arriba sin arquear la zona lumbar.',
      'Regresa despacio frenando el peso.'
    ],
    commonMistakes: [
      'Arquear la espalda baja para subir más la pierna (el movimiento debe ser exclusivo de la articulación coxofemoral).',
      'Patear puramente recto atrás en vez de ligeramente diagonal (30°).'
    ],
    breathingTip: 'Exhala en la patada controlada; inhala al volver a la posición de inicio.',
    targetFocus: 'Glúteo mayor superior y glúteo medio en su ángulo biomecánico óptimo.'
  },
  {
    id: 'abduccion_cadera_maquina',
    name: 'Abducción de cadera en máquina (Glúteo Medio)',
    muscleGroup: 'Glúteos',
    pattern: 'Aislamiento',
    level: 'A',
    equipment: 'Máquina',
    steps: [
      'Siéntate en la máquina de abductores e inclina el torso levemente hacia adelante (unos 20-30°) o despega ligeramente los glúteos del respaldo.',
      'Separa las rodillas abriendo la carga al máximo rango posible.',
      'Sostén la apertura durante 1 segundo sintiendo la contracción lateral del glúteo.',
      'Cierra las piernas de manera lenta en 3 segundos sin dejar caer el peso.'
    ],
    commonMistakes: [
      'Permitir que las placas choquen entre repeticiones.',
      'Empujar con los pies en lugar de empujar con las rodillas contra los cojines.'
    ],
    breathingTip: 'Exhala al abrir; inhala al cerrar controlado.',
    targetFocus: 'Glúteo medio y menor: estética lateral y estabilizador pélvico.'
  },

  // ==========================================
  // --- ISQUIOS Y CADENA POSTERIOR ---
  // ==========================================
  {
    id: 'peso_muerto_rumano_barra',
    name: 'Peso muerto rumano con barra (RDL)',
    muscleGroup: 'Isquios y Glúteo',
    pattern: 'Dominante cadera',
    level: 'B',
    equipment: 'Barra',
    steps: [
      'De pie con la barra sostenida en agarre prono al ancho de hombros pegada a los muslos.',
      'Con rodillas semirrígidas (apenas un leve desbloqueo), empuja la pelvis hacia la pared de atrás.',
      'Baja la barra rozando los muslos y espinillas hasta justo debajo de las rodillas.',
      'Detente cuando sientas el estiramiento máximo de los isquiotibiales antes de que la espalda se redondee.',
      'Empuja la cadera hacia adelante con los glúteos para volver arriba.'
    ],
    commonMistakes: [
      'Flexionar las rodillas convirtiendo el ejercicio en sentadilla.',
      'Alejar la barra del cuerpo aumentando el brazo de palanca sobre la columna lumbar.'
    ],
    breathingTip: 'Inhala en el descenso llenando el abdomen de aire; exhala al retornar extendiendo la cadera.',
    targetFocus: 'Isquiosurales (bíceps femoral, semitendinoso) y glúteo mayor en elongación.'
  },
  {
    id: 'curl_femoral_tumbado',
    name: 'Curl femoral tumbado en máquina',
    muscleGroup: 'Isquios y Glúteo',
    pattern: 'Aislamiento',
    level: 'A',
    equipment: 'Máquina',
    steps: [
      'Acuéstate boca abajo alineando las rodillas con el eje de rotación de la máquina.',
      'Coloca el rodillo sobre el tendón de Aquiles.',
      'Aprieta los glúteos contra el banco para no arquear la zona lumbar.',
      'Flexiona las rodillas llevando los talones hacia los glúteos con fuerza.',
      'Desciende despacio en 3 segundos sintiendo el estiramiento excéntrico de los isquios.'
    ],
    commonMistakes: [
      'Levantar la cadera del banco durante la flexión.',
      'Hacer tirones bruscos con rebote.'
    ],
    breathingTip: 'Exhala al flexionar las piernas; inhala al extender controlado.',
    targetFocus: 'Aislamiento de la cabeza corta del bíceps femoral.'
  },
  {
    id: 'curl_femoral_sentado',
    name: 'Curl femoral sentado en máquina',
    muscleGroup: 'Isquios y Glúteo',
    pattern: 'Aislamiento',
    level: 'A',
    equipment: 'Máquina',
    steps: [
      'Ajusta el respaldo para que el eje de rotación de la máquina coincida con tus rodillas.',
      'Baja la almohadilla superior sobre los muslos para anclar las piernas firmemente.',
      'Flexiona las rodillas tirando del rodillo hacia abajo y atrás, apretando 1-2 segundos en la máxima contracción.',
      'Regresa en 3 segundos sintiendo el estiramiento profundo de los isquiotibiales (superioridad hipertrófica por elongación).'
    ],
    commonMistakes: [
      'No fijar bien la almohadilla superior permitiendo que los muslos se eleven.',
      'Dejar caer el peso sin controlar la fase excéntrica.'
    ],
    breathingTip: 'Inhala al estirar las piernas al frente; exhala al flexionar hacia abajo con potencia.',
    targetFocus: 'Máxima hipertrofia de isquiotibiales mediada por estiramiento con cadera a 90°.'
  },
  {
    id: 'elevacion_talones_pie_maquina',
    name: 'Elevación de talones de pie en máquina',
    muscleGroup: 'Isquios y Glúteo',
    pattern: 'Aislamiento',
    level: 'A',
    equipment: 'Máquina',
    steps: [
      'Apoya el metatarso en el borde del escalón dejando los talones libres en el aire.',
      'Baja los talones por debajo del nivel de la plataforma sintiendo un estiramiento profundo en los gemelos durante 2 segundos.',
      'Impúlsate explosivamente sobre las puntas de los pies contrayendo los gemelos al máximo durante 1 segundo arriba.',
      'Desciende de forma lenta y pausada para no usar la elasticidad del tendón de Aquiles.'
    ],
    commonMistakes: [
      'Rebotar en la parte baja en vez de hacer una pausa controlada.',
      'Doblar las rodillas en una elevación de pie.'
    ],
    breathingTip: 'Inhala en el estiramiento profundo abajo; exhala al elevarte sobre las puntas de los pies.',
    targetFocus: 'Desarrollo del gastrocnemio (gemelos), fuerza de tobillo y potencia en carrera.'
  },
  {
    id: 'elevacion_talones_sentado_maquina',
    name: 'Elevación de talones sentado en máquina',
    muscleGroup: 'Isquios y Glúteo',
    pattern: 'Aislamiento',
    level: 'A',
    equipment: 'Máquina',
    steps: [
      'Siéntate con las almohadillas ajustadas sobre la parte baja de los muslos.',
      'Apoya la punta de los pies en la plataforma con los talones colgando.',
      'Baja los talones profundamente sintiendo el estiramiento del sóleo.',
      'Eleva los talones lo más alto posible apretando 1 segundo en la cima.'
    ],
    commonMistakes: ['Rango de recorrido incompleto.'],
    breathingTip: 'Inhala al bajar; exhala al subir.',
    targetFocus: 'Aislamiento específico del músculo sóleo (crucial para volumen de pantorrilla y estabilidad).'
  },
  {
    id: 'hiperextensiones_banco_45',
    name: 'Hiperextensiones en banco a 45°',
    muscleGroup: 'Isquios y Glúteo',
    pattern: 'Dominante cadera',
    level: 'B',
    equipment: 'Peso corporal',
    steps: [
      'Colócate en el banco a 45° con las almohadillas justo debajo de la pelvis (permite doblar la cadera libremente).',
      'Cruza los brazos sobre el pecho o sujeta un disco.',
      'Flexiona la cadera descendiendo el torso hasta sentir un estiramiento profundo en glúteos e isquios.',
      'Extiende la cadera empujando contra la almohadilla hasta alinear el cuerpo sin hiperextender la columna.'
    ],
    commonMistakes: ['Arquear excesivamente la espalda baja en la parte alta.'],
    breathingTip: 'Inhala al bajar; exhala al subir contrayendo glúteos.',
    targetFocus: 'Glúteo mayor, isquiotibiales y salud de los erectores espinales.'
  },

  // ==========================================
  // --- ESPALDA / TRACCIÓN ---
  // ==========================================
  {
    id: 'remo_barra_inclinado',
    name: 'Remo con barra inclinado',
    muscleGroup: 'Espalda',
    pattern: 'Tracción horizontal',
    level: 'B',
    equipment: 'Barra',
    steps: [
      'De pie con los pies al ancho de caderas, inclina el torso a unos 45-60° empujando la cadera atrás.',
      'Espalda recta y pecho erguido, agarre prono un poco más ancho que los hombros.',
      'Tira de la barra hacia el ombligo llevando los codos pegados hacia atrás y arriba.',
      'Junta las escápulas con fuerza al final del movimiento.',
      'Baja la barra con control sin perder la posición del tronco.'
    ],
    commonMistakes: [
      'Curvar la columna lumbar durante el tirón.',
      'Dar tirones hacia arriba con el torso para subir el peso con inercia.'
    ],
    breathingTip: 'Inhala abajo manteniendo el abdomen activo; exhala al subir la barra al abdomen.',
    targetFocus: 'Dorsal ancho, romboides, trapecio medio y erectores espinales.'
  },
  {
    id: 'remo_pendlay_barra',
    name: 'Remo Pendlay (remo desde el suelo)',
    muscleGroup: 'Espalda',
    pattern: 'Tracción horizontal',
    level: 'C',
    equipment: 'Barra',
    steps: [
      'Ubica la barra cargada en el suelo sobre la mitad de los pies, con los pies al ancho de las caderas.',
      'Flexiona la cadera manteniendo la columna neutra y rígida: el torso debe colocarse estrictamente horizontal y paralelo al suelo (90°).',
      'Sujeta la barra con agarre prono (palmas hacia abajo) un poco más ancho que la anchura de hombros. La cadera queda más alta que en un peso muerto convencional.',
      'Tira de la barra de forma explosiva directamente hacia la base del esternón o parte superior del abdomen, llevando los codos hacia el techo y juntando las escápulas con fuerza.',
      'Baja la barra con control hasta que descanse por completo en el suelo (dead stop). Pausa una fracción de segundo para disipar cualquier rebote o inercia elástica antes del siguiente tirón.'
    ],
    commonMistakes: [
      'Levantar el torso hacia arriba a 45° durante el tirón (convirtiéndolo en un remo convencional con impulso).',
      'Rebotar los discos contra el suelo usando el rebote en lugar de fuerza pura concéntrica desde parado.'
    ],
    breathingTip: 'Inhala profundo y presuriza el abdomen (maniobra de Valsalva) antes del tirón; exhala al contactar el esternón y descender al piso.',
    targetFocus: 'Fuerza explosiva pura de tracción y densidad brutal de la espalda alta (romboides y trapecio) eliminando cualquier balanceo.'
  },
  {
    id: 'remo_meadows_barra',
    name: 'Remo Meadows con barra',
    muscleGroup: 'Espalda',
    pattern: 'Tracción horizontal',
    level: 'B',
    equipment: 'Barra',
    steps: [
      'Coloca un extremo de una barra olímpica en un anclaje landmine o en una esquina protegida. Usa discos pequeños (de 10 o 15 kg / 25 lbs) para permitir un rango completo de estiramiento sin que choquen con el piso.',
      'Párate perpendicular al extremo cargado de la barra en postura escalonada (pierna opuesta al brazo ejecutor adelantada). Apoya el antebrazo o mano libre sobre la rodilla delantera para dar máxima solidez y soporte al torso.',
      'Sujeta el extremo grueso (la manga) de la barra con agarre prono (palma hacia atrás) usando una agarradera/strap si la carga es pesada.',
      'Inicia la tracción llevando el codo hacia afuera y hacia atrás en un arco natural hacia la cadera, apretando el dorsal al máximo en el punto álgido sin rotar el torso.',
      'Desciende la carga lentamente en 2 a 3 segundos sintiendo el estiramiento extremo del dorsal ancho antes de la siguiente repetición.'
    ],
    commonMistakes: [
      'Usar discos de 20 kg (45 lbs) de gran diámetro que toquen el suelo antes de lograr el estiramiento completo del dorsal.',
      'Rotar bruscamente la espalda o impulsarse con la cadera para mover la carga.'
    ],
    breathingTip: 'Inhala en el descenso profundo de estiramiento; exhala al traccionar el codo hacia la cadera.',
    targetFocus: 'Aislamiento supremo del dorsal ancho (inserción ilíaca baja) y redondo mayor con cero fatiga lumbar (variante creada por John Meadows).'
  },
  {
    id: 'remo_barra_t',
    name: 'Remo en barra T',
    muscleGroup: 'Espalda',
    pattern: 'Tracción horizontal',
    level: 'B',
    equipment: 'Barra',
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
    targetFocus: 'Densidad y grosor de la espalda media con trayectoria semicircular guiada.'
  },
  {
    id: 'jalon_pecho_polea',
    name: 'Jalón al pecho en polea alta',
    muscleGroup: 'Espalda',
    pattern: 'Tracción vertical',
    level: 'A',
    equipment: 'Polea',
    steps: [
      'Siéntate con los muslos bien asegurados bajo los cojines.',
      'Toma la barra ancha en agarre prono.',
      'Inclina el torso 10-15° hacia atrás y activa las escápulas hacia abajo.',
      'Jala la barra hacia la parte superior del esternón dirigiendo los codos hacia abajo.',
      'Regresa lentamente estirando los dorsales por completo arriba.'
    ],
    commonMistakes: [
      'Inclinarse 45° hacia atrás usando el peso corporal para columpiar la barra.',
      'Bajar la barra detrás del cuello.'
    ],
    breathingTip: 'Inhala al estirar arriba; exhala al jalar hacia el pecho.',
    targetFocus: 'Amplitud de dorsal ancho y control escapular.'
  },
  {
    id: 'dominadas_estrictas',
    name: 'Dominadas estrictas (Pull-ups)',
    muscleGroup: 'Espalda',
    pattern: 'Tracción vertical',
    level: 'B',
    equipment: 'Peso corporal',
    steps: [
      'Cuélgate de la barra con agarre prono más ancho que los hombros, brazos extendidos.',
      'Inicia con depresión escapular (hombros lejos de las orejas).',
      'Tira con los codos hacia los costados hasta que la barbilla supere limpiamente la barra.',
      'Desciende en 2-3 segundos hasta la suspensión completa sin balanceos.'
    ],
    commonMistakes: [
      'Patear con las piernas para tomar impulso (kipping) en lugar de fuerza estricta.',
      'No extender los brazos abajo (rango incompleto).'
    ],
    breathingTip: 'Exhala en la subida; inhala al descender con control.',
    targetFocus: 'Fuerza funcional de tracción de tren superior y densidad de espalda.'
  },

  // ==========================================
  // --- HOMBROS Y BRAZOS ---
  // ==========================================
  {
    id: 'press_militar_barra',
    name: 'Press militar con barra de pie (Overhead Press)',
    muscleGroup: 'Hombros',
    pattern: 'Empuje vertical',
    level: 'B',
    equipment: 'Barra',
    steps: [
      'Barra apoyada sobre las clavículas, manos a la anchura de hombros, antebrazos verticales.',
      'Aprieta glúteos y abdomen para mantener la columna bloqueada en posición neutra.',
      'Empuja la barra en línea recta, inclinando la cabeza ligeramente hacia atrás para dejar pasar la barra.',
      'Una vez que la barra pasa la cabeza, vuelve la cabeza al centro y bloquea los codos sobre la corona de la cabeza.',
      'Baja con control hasta tocar suavemente las clavículas.'
    ],
    commonMistakes: [
      'Arquear la espalda baja en exceso para compensar falta de movilidad en hombros.',
      'Empujar la barra hacia adelante en diagonal en lugar de vertical.'
    ],
    breathingTip: 'Inhala y presuriza el core antes de empujar; exhala al bloquear la barra arriba.',
    targetFocus: 'Deltoides anterior y lateral, serratos y estabilidad del core.'
  },
  {
    id: 'elevaciones_laterales_mancuernas',
    name: 'Elevaciones laterales con mancuernas',
    muscleGroup: 'Hombros',
    pattern: 'Aislamiento',
    level: 'A',
    equipment: 'Mancuernas',
    steps: [
      'De pie con una mancuerna en cada mano, torso levemente inclinado hacia adelante (5-10°).',
      'Eleva los brazos en el plano escapular (30° adelante del plano coronal) hasta la altura de los hombros.',
      'Mantén los codos ligeramente flexionados y las muñecas neutras.',
      'Desciende despacio en 2 a 3 segundos resistiendo el peso.'
    ],
    commonMistakes: [
      'Usar impulso de piernas o balanceo de torso.',
      'Subir las mancuernas por encima del nivel de los hombros sobrecargando el trapecio superior.'
    ],
    breathingTip: 'Exhala al subir; inhala al descender.',
    targetFocus: 'Deltoides lateral (anchura y aspecto redondo del hombro).'
  },
  {
    id: 'curl_biceps_barra',
    name: 'Curl de bíceps con barra',
    muscleGroup: 'Brazos',
    pattern: 'Aislamiento',
    level: 'A',
    equipment: 'Barra',
    steps: [
      'De pie con la barra en agarre supino al ancho de los hombros.',
      'Mantén los codos pegados a los costados del torso durante todo el recorrido.',
      'Flexiona los codos subiendo la barra hasta la altura de la parte superior del pecho.',
      'Aprieta el bíceps arriba y desciende en 2-3 segundos hasta la extensión completa.'
    ],
    commonMistakes: [
      'Mover los codos hacia adelante y usar la espalda baja como columpio.',
      'No extender los brazos abajo.'
    ],
    breathingTip: 'Exhala al flexionar; inhala al bajar.',
    targetFocus: 'Bíceps braquial y braquial anterior.'
  },
  {
    id: 'extension_triceps_polea',
    name: 'Extensiones de tríceps en polea con cuerda',
    muscleGroup: 'Brazos',
    pattern: 'Aislamiento',
    level: 'A',
    equipment: 'Polea',
    steps: [
      'Sujeta los extremos de la cuerda en polea alta con agarre neutro.',
      'Fija los codos a los costados del cuerpo e inclina el torso levemente adelante.',
      'Extiende los brazos hacia abajo y separa los extremos de la cuerda al final para máxima contracción.',
      'Regresa despacio hasta que los antebrazos formen un ángulo de 90° con los brazos.'
    ],
    commonMistakes: [
      'Mover los codos adelante y atrás perdiendo el aislamiento.',
      'Usar el peso corporal para empujar la cuerda.'
    ],
    breathingTip: 'Exhala al extender completamente; inhala en el retorno.',
    targetFocus: 'Cabeza lateral y larga del tríceps.'
  },

  // ==========================================
  // --- HYROX & OCR / METABÓLICO & AGARRE ---
  // ==========================================
  {
    id: 'hyrox_skierg',
    name: 'SkiErg (máquina de esquí)',
    muscleGroup: 'Cardio y Metabólico',
    pattern: 'Metabólico',
    level: 'B',
    equipment: 'Ergómetro',
    steps: [
      'Colócate frente a la máquina con los pies al ancho de hombros.',
      'Agarra los mangos con brazos semiflexionados ligeramente por encima de la cabeza.',
      'Inicia el tirón flexionando caderas y rodillas al mismo tiempo mientras bajas los mangos con el dorsal y core.',
      'Termina el tirón con las manos pasando a los lados de los muslos.',
      'Vuelve a la posición inicial extendiendo caderas y brazos de forma fluida.'
    ],
    commonMistakes: [
      'Tirar solo con los brazos sin involucrar la bisagra de cadera y el peso corporal.',
      'Agacharse excesivamente en sentadilla profunda perdiendo eficiencia energética.'
    ],
    breathingTip: 'Inhala en la subida / extensión; exhala potente en la flexión y tirón hacia abajo.',
    targetFocus: 'Potencia metabólica, dorsal, tríceps y resistencia aeróbica de tren superior.'
  },
  {
    id: 'hyrox_sled_push',
    name: 'Empuje de trineo (Sled push)',
    muscleGroup: 'Cuádriceps',
    pattern: 'Dominante rodilla',
    level: 'B',
    equipment: 'Saco / Lastre',
    steps: [
      'Agarra los postes verticales del trineo a una altura media-baja con brazos estirados o semiflexionados.',
      'Inclina el cuerpo en un ángulo de 45° creando una línea recta desde los talones hasta la cabeza.',
      'Mantén el core firme y da pasos cortos y potentes empujando desde la bola del pie (metatarso).',
      'Mantén cadencia continua sin frenadas bruscas para no perder la inercia del trineo.'
    ],
    commonMistakes: [
      'Empujar con el cuerpo demasiado vertical (reduce la tracción mecánica contra el suelo).',
      'Dar zancadas demasiado largas que sobrecargan la pantorrilla y frenan el avance.'
    ],
    breathingTip: 'Respiración rítmica continua por la nariz y boca coordinada con cada paso.',
    targetFocus: 'Fuerza de empuje horizontal de piernas, cuádriceps, glúteos y resistencia al lactato.'
  },
  {
    id: 'hyrox_sled_pull',
    name: 'Arrastre de trineo (Sled pull)',
    muscleGroup: 'Espalda',
    pattern: 'Tracción horizontal',
    level: 'B',
    equipment: 'Saco / Lastre',
    steps: [
      'Colócate detrás de la línea con los pies anclados en postura de media sentadilla estable.',
      'Toma la cuerda con brazos extendidos, retrae escápulas y tira utilizando la extensión de caderas y piernas hacia atrás.',
      'Recupera la cuerda brazo por brazo con tirones firmes acumulando la cuerda a tus pies.',
      'Mantén el pecho erguido y nunca curves la espalda baja bajo tensión.'
    ],
    commonMistakes: [
      'Tirar únicamente con los brazos sin usar las piernas y la cadera como ancla de fuerza.',
      'Tropezar con la cuerda acumulada en el suelo.'
    ],
    breathingTip: 'Exhala en cada tirón fuerte de cuerda; inhala al cambiar el agarre de manos.',
    targetFocus: 'Cadena posterior, dorsal ancho, bíceps, agarre y erectores espinales.'
  },
  {
    id: 'hyrox_burpee_broad_jumps',
    name: 'Burpee con salto largo (Burpee broad jumps)',
    muscleGroup: 'Cardio y Metabólico',
    pattern: 'Metabólico',
    level: 'B',
    equipment: 'Peso corporal',
    steps: [
      'Comienza de pie, apoya las manos en el suelo a unos 30 cm de tus pies y salta con las piernas atrás.',
      'Haz contacto con el pecho y muslos en el suelo de forma controlada.',
      'Sube empujando con brazos y caderas recogiendo los pies firmemente debajo del cuerpo.',
      'Sin pausa, balancea los brazos y ejecuta un salto largo hacia adelante (long jump).',
      'Aterriza suavemente sobre ambos pies absorbiendo el impacto y repite.'
    ],
    commonMistakes: [
      'Hacer saltos hacia arriba en lugar de saltos horizontales de longitud.',
      'Aterrizar con las piernas rígidas provocando impacto brusco en las rodillas.'
    ],
    breathingTip: 'Inhala al bajar el pecho al suelo; exhala fuerte al subir e impulsarte en el salto.',
    targetFocus: 'Pliometría, potencia anaeróbica, resistencia cardiovascular y full body.'
  },
  {
    id: 'hyrox_rowing',
    name: 'Remo en máquina (Rowing)',
    muscleGroup: 'Cardio y Metabólico',
    pattern: 'Metabólico',
    level: 'B',
    equipment: 'Ergómetro',
    steps: [
      'Siéntate con los pies ajustados en las correas sobre la mitad de los cordones.',
      'Secuencia de tirón (Drive): Empuja primero con las piernas (60%), luego bisagra de cadera atrás (20%) y finalmente jala el mango al esternón con los brazos (20%).',
      'Secuencia de retorno (Recovery): Extiende primero los brazos, inclina la cadera al frente y finalmente flexiona las rodillas.',
      'Mantén una cadencia eficiente de 24 a 28 paladas por minuto sin apresurar el retorno.'
    ],
    commonMistakes: [
      'Doblar las rodillas antes de que las manos hayan pasado por encima de ellas en el retorno.',
      'Jalar con los brazos antes de terminar el empuje de las piernas.'
    ],
    breathingTip: 'Exhala potente durante el empuje; inhala suavemente en el retorno controlado.',
    targetFocus: 'Capacidad aeróbica máxima, potencia de piernas y resistencia de espalda.'
  },
  {
    id: 'hyrox_farmers_carry',
    name: 'Paseo del granjero (Farmers carry)',
    muscleGroup: 'Cardio y Metabólico',
    pattern: 'Carga y Agarre',
    level: 'B',
    equipment: 'Kettlebell',
    steps: [
      'Levanta las pesas rusas o mancuernas desde el suelo con técnica de peso muerto impecable.',
      'Colócate de pie erguido con hombros hacia atrás, pecho inflado y core activo.',
      'Camina a paso rápido pero corto y controlado, manteniendo las cargas separadas un par de centímetros de los muslos.',
      'Evita cualquier balanceo lateral del tronco.'
    ],
    commonMistakes: [
      'Dejar que los hombros caigan hacia adelante en postura jorobada.',
      'Dar pasos demasiado largos que provocan balanceo de las cargas.'
    ],
    breathingTip: 'Respiraciones superficiales constantes manteniendo la rigidez del abdomen en todo momento.',
    targetFocus: 'Fuerza de agarre, antebrazos, trapecios, core anti-flexión lateral y glúteo medio.'
  },
  {
    id: 'hyrox_sandbag_lunges',
    name: 'Zancadas con saco (Sandbag lunges)',
    muscleGroup: 'Cuádriceps',
    pattern: 'Dominante rodilla',
    level: 'B',
    equipment: 'Saco / Lastre',
    steps: [
      'Carga el saco de arena sobre los hombros detrás de la nuca con ambas manos sujetando las asas.',
      'Da un paso al frente y desciende hasta que la rodilla trasera roce suavemente el suelo.',
      'Ambas rodillas deben llegar a unos 90° de flexión en el punto bajo.',
      'Empuja a través del talón delantero y avanza la pierna trasera en un paso continuo y fluido.'
    ],
    commonMistakes: [
      'Dejar caer el torso hacia adelante por el peso del saco.',
      'Golpear con fuerza la rótula trasera contra el suelo.'
    ],
    breathingTip: 'Inhala en el paso y bajada; exhala al extender e incorporarte.',
    targetFocus: 'Fuerza unilateral de cuádriceps y glúteos bajo gran fatiga sistémica.'
  },
  {
    id: 'hyrox_wall_balls',
    name: 'Lanzamientos de balón a la pared (Wall balls)',
    muscleGroup: 'Cardio y Metabólico',
    pattern: 'Metabólico',
    level: 'B',
    equipment: 'Saco / Lastre',
    steps: [
      'Sostén el balón medicinal frente al pecho a la altura de la barbilla con los codos debajo del balón.',
      'Colócate a un brazo de distancia de la pared con pies al ancho de hombros.',
      'Haz una sentadilla completa rompiendo el paralelo.',
      'Explota hacia arriba con las piernas y transfiere la energía a los brazos para lanzar el balón a la diana (3.0m hombres / 2.7m mujeres).',
      'Atrapa el balón mientras desciendes inmediatamente a la siguiente sentadilla en un solo movimiento fluido.'
    ],
    commonMistakes: [
      'Lanzar el balón solo con los hombros sin aprovechar la aceleración de las piernas.',
      'No romper el paralelo en la sentadilla (repetición nula en Hyrox).'
    ],
    breathingTip: 'Inhala al bajar a la sentadilla; exhala con fuerza al lanzar el balón a la diana.',
    targetFocus: 'Capacidad glucolítica, cuádriceps, glúteos, hombros y resistencia mental.'
  },
  {
    id: 'transicion_carrera_comprometida',
    name: 'Correr con piernas cansadas (Compromised running)',
    muscleGroup: 'Cardio y Metabólico',
    pattern: 'Metabólico',
    level: 'B',
    equipment: 'Peso corporal',
    steps: [
      'Tras soltar la estación (ej: trineo o ergómetro), inicia inmediatamente el trote sin quedarte quieto.',
      'Durante los primeros 100-200 metros las piernas se sentirán pesadas ("piernas de plomo"): acorta la zancada y aumenta la cadencia.',
      'Mantén los hombros relajados y respira profundamente para ayudar a metabolizar el lactato acumulado.',
      'Una vez superado el primer minuto, estabiliza tu ritmo de carrera objetivo constante.'
    ],
    commonMistakes: [
      'Caminar los primeros 100 metros (hace que las piernas se congelen aún más por bajada brusca de circulación).',
      'Salir a un sprint inicial descontrolado aumentando la deuda de oxígeno.'
    ],
    breathingTip: 'Inhala en 2 pasos, exhala en 2 pasos de forma profunda para oxigenar los músculos saturados.',
    targetFocus: 'Adaptación neuromotora a la carrera fatigada (Compromised Running), clave de Hyrox y triatlón.'
  },
  {
    id: 'ocr_sandbag_bucket_carry',
    name: 'Transporte de saco o balde (Sandbag / bucket carry)',
    muscleGroup: 'Cardio y Metabólico',
    pattern: 'Carga y Agarre',
    level: 'B',
    equipment: 'Saco / Lastre',
    steps: [
      'Levanta el saco o la cubeta (bucket) flexionando las rodillas con la espalda recta.',
      'Para el Bucket Carry: abraza la cubeta por la parte inferior, apoyando la base en el abdomen y los antebrazos rodeándola (los dedos de una mano agarran la muñeca contraria).',
      'Para el Sandbag Carry: apoya el saco cruzado sobre los hombros o abrázalo contra el pecho con agarre de oso (bear hug).',
      'Camina a paso corto y constante manteniendo el torso ligeramente retrasado para equilibrar el centro de gravedad.',
      'No apoyes la cubeta en los muslos al caminar (motivo de penalización en OCR).'
    ],
    commonMistakes: [
      'Curvar la columna dorsal y lumbar hacia adelante comprimiendo el diafragma.',
      'Soltar la carga antes de la marca obligando a reiniciar el trayecto.'
    ],
    breathingTip: 'Respiración torácica rítmica; expande las costillas lateralmente ya que el abdomen está comprimido por la carga.',
    targetFocus: 'Fuerza isométrica de bíceps, agarre de dedos, core anterior y resistencia de espalda alta.'
  },
  {
    id: 'ocr_dead_hang_barra',
    name: 'Colgado en barra (Dead hang pasivo y activo)',
    muscleGroup: 'Espalda',
    pattern: 'Carga y Agarre',
    level: 'A',
    equipment: 'Peso corporal',
    steps: [
      'Cuélgate de una barra fija con ambas manos a la anchura de hombros.',
      'Para suspensión pasiva: relaja los hombros permitiendo que las escápulas suban de forma natural.',
      'Para suspensión activa: deprime las escápulas (baja los hombros lejos de las orejas) activando dorsales y serratos.',
      'Mantén las piernas juntas con core apretado para evitar balanceos.',
      'Sostén el tiempo objetivo respirando de forma controlada.'
    ],
    commonMistakes: [
      'Balancear el cuerpo para engañar el agarre.',
      'Contener la respiración provocando picos de presión innecesarios.'
    ],
    breathingTip: 'Respiraciones largas y constantes; exhala lento para calmar el sistema nervioso.',
    targetFocus: 'Resistencia de los flexores profundos de los dedos, antebrazos y descompresión vertebral.'
  },
  {
    id: 'ocr_towel_hang',
    name: 'Towel Hang (Toalla sobre barra)',
    muscleGroup: 'Espalda',
    pattern: 'Carga y Agarre',
    level: 'B',
    equipment: 'Peso corporal',
    steps: [
      'Pasa dos toallas resistentes sobre una barra de dominadas separadas al ancho de hombros.',
      'Sujeta con cada mano el extremo doble de una toalla en agarre neutro grueso.',
      'Despega los pies del suelo y cuélgate manteniendo los hombros estables.',
      'Aprieta con máxima fuerza los dedos contra la tela para no deslizarte.',
      'Aguanta el tiempo indicado con el cuerpo inmóvil.'
    ],
    commonMistakes: [
      'Dejar que la toalla se deslice por falta de fuerza de pellizco en los dedos.',
      'Hiperextender el cuello hacia arriba.'
    ],
    breathingTip: 'Inhala por la nariz y exhala con control por la boca manteniendo el agarre al 100%.',
    targetFocus: 'Fuerza extrema de antebrazo y dedos simulando cuerdas lisas de carreras OCR.'
  },
  {
    id: 'ocr_pinch_grip_carry',
    name: 'Pinch Grip Carry (Pellizco con discos)',
    muscleGroup: 'Brazos',
    pattern: 'Carga y Agarre',
    level: 'B',
    equipment: 'Barra',
    steps: [
      'Coloca dos discos lisos juntos (con las caras lisas hacia afuera).',
      'Pellizca los discos únicamente con las yemas de los dedos y el pulgar (sin meter los dedos en los agujeros).',
      'Levántate con la espalda recta y camina la distancia establecida manteniendo el pellizco.',
      'Mantén los hombros atrás y el paso firme.'
    ],
    commonMistakes: [
      'Enganchar los dedos en los bordes o huecos del disco perdiendo el efecto de pellizco.',
      'Caminar a los saltos provocando que los discos se separen.'
    ],
    breathingTip: 'Mantén respiración controlada y no desvíes la atención del agarre de pinza.',
    targetFocus: 'Músculos tenares de la mano, fuerza de pulgar y agarre en pinza para obstáculos resbalosos.'
  },
  {
    id: 'ocr_monkey_bars_drills',
    name: 'Transiciones de Barra / Monkey Bar Drills',
    muscleGroup: 'Espalda',
    pattern: 'Carga y Agarre',
    level: 'C',
    equipment: 'Peso corporal',
    steps: [
      'Comienza suspendido en la primera barra con una ligera flexión de codos para proteger los hombros.',
      'Genera un balanceo suave y controlado desde las caderas (hollow to arch).',
      'Alcanza la siguiente barra con la mano delantera en el punto álgido del balanceo hacia adelante.',
      'Mantén siempre al menos una mano con agarre de hierro mientras la otra avanza de forma dinámica.',
      'Cruza la estructura manteniendo el ritmo sin detenerte a colgarte pasivamente.'
    ],
    commonMistakes: [
      'Cruzar con los brazos totalmente estirados y hombros relajados (aumenta el riesgo de desgarro).',
      'Mirar a los pies en lugar de fijar la vista en la siguiente barra.'
    ],
    breathingTip: 'Exhala en cada cambio de barra; mantén un ritmo respiratorio dinámico.',
    targetFocus: 'Dominio de rigs, monkey bars y obstáculos suspendidos en Spartan Race y OCR.'
  },

  // ==========================================
  // --- CORE Y ABDOMEN ---
  // ==========================================
  {
    id: 'cable_crunches_polea',
    name: 'Abdominales en polea alta (Cable crunches)',
    muscleGroup: 'Core',
    pattern: 'Aislamiento',
    level: 'B',
    equipment: 'Polea',
    steps: [
      'Arrodíllate frente a la polea alta con el accesorio de cuerda.',
      'Sujeta la cuerda a los lados de la cabeza a la altura de las sienes y mantén los brazos fijos.',
      'Enrolla la columna vertebral contrayendo los abdominales, llevando los codos hacia los muslos.',
      'Pausa 1 segundo en la máxima contracción apretando el abdomen intensamente.',
      'Regresa lentamente desenrollando la columna hasta la posición de estiramiento sin mover las caderas.'
    ],
    commonMistakes: [
      'Mover las caderas hacia atrás como en una sentadilla en vez de flexionar la columna.',
      'Tirar con los brazos y tríceps en lugar de usar la contracción del abdomen.'
    ],
    breathingTip: 'Inhala al abrir el torso arriba; exhala con fuerza al enrollar y contraer el abdomen.',
    targetFocus: 'Sobrecarga progresiva real del recto abdominal con tensión continua en todo el rango articular.'
  },
  {
    id: 'hanging_leg_raises',
    name: 'Elevación de piernas colgado en barra',
    muscleGroup: 'Core',
    pattern: 'Aislamiento',
    level: 'B',
    equipment: 'Peso corporal',
    steps: [
      'Cuélgate de la barra con los brazos extendidos y hombros deprimidos.',
      'Sin balancear el cuerpo, eleva las rodillas o piernas extendidas hacia el pecho.',
      'Bascula la pelvis hacia arriba en el punto más alto para activar profundamente el recto abdominal.',
      'Desciende de forma lenta y pausada resistiendo la bajada en 2-3 segundos.'
    ],
    commonMistakes: ['Columpiarse usando inercia.', 'No bascular la pelvis.'],
    breathingTip: 'Exhala al subir las piernas; inhala al bajar.',
    targetFocus: 'Fuerza profunda del core anterior, compresión abdominal y agarre.'
  },
  {
    id: 'ab_wheel_rollout',
    name: 'Rueda abdominal (Ab rollout)',
    muscleGroup: 'Core',
    pattern: 'Aislamiento',
    level: 'B',
    equipment: 'Peso corporal',
    steps: [
      'Arrodíllate sujetando la rueda con los brazos perpendiculares al suelo.',
      'Rueda hacia adelante extendiendo el cuerpo manteniendo la pelvis en retroversión.',
      'Tira con los abdominales para regresar sin que las lumbares caigan.'
    ],
    commonMistakes: ['Arquear la espalda baja en exceso perdiendo el bloqueo del core.'],
    breathingTip: 'Inhala al estirar el cuerpo; exhala al comprimir el abdomen para volver.',
    targetFocus: 'Anti-extensión del core y fuerza funcional profunda.'
  },
  {
    id: 'plancha_isometrica',
    name: 'Plancha abdominal isométrica',
    muscleGroup: 'Core',
    pattern: 'Aislamiento',
    level: 'A',
    equipment: 'Peso corporal',
    steps: [
      'Apóyate sobre los antebrazos y las puntas de los pies en el suelo.',
      'Alinea hombros, caderas y tobillos en una línea recta sólida.',
      'Aprieta con fuerza el abdomen y los glúteos sin permitir que la cadera se hunda.',
      'Respira de forma controlada manteniendo la tensión isométrica.'
    ],
    commonMistakes: ['Dejar caer la pelvis arqueando las lumbares.'],
    breathingTip: 'Respiraciones cortas y diafragmáticas sin perder la rigidez abdominal.',
    targetFocus: 'Estabilidad central y protección de la columna vertebral.'
  },

  // ==========================================
  // --- HOMBROS ---
  // ==========================================
  {
    id: 'elevaciones_laterales_mancuernas',
    name: 'Elevaciones laterales con mancuernas',
    muscleGroup: 'Hombros',
    pattern: 'Aislamiento',
    level: 'A',
    equipment: 'Mancuernas',
    steps: [
      'De pie con una ligera inclinación del torso hacia adelante (10-15°).',
      'Sube las mancuernas por los lados en el plano escapular (30° adelantadas) hasta la altura de los hombros.',
      'Lidera el movimiento con los codos manteniendo los meñiques ligeramente más altos o neutros.',
      'Baja con control en 2-3 segundos resistiendo la gravedad.'
    ],
    commonMistakes: ['Usar impulso balanceando la espalda.', 'Encoger los trapecios hacia las orejas.'],
    breathingTip: 'Exhala al subir; inhala al bajar.',
    targetFocus: 'Cabeza lateral del deltoides para amplitud y forma en V.'
  },
  {
    id: 'pajaros_deltoides_posterior',
    name: 'Pájaros para deltoides posterior con mancuernas',
    muscleGroup: 'Hombros',
    pattern: 'Aislamiento',
    level: 'B',
    equipment: 'Mancuernas',
    steps: [
      'Inclina el torso hacia adelante a 45-60° con la espalda plana o apóyate en banco inclinado.',
      'Abre los brazos hacia los costados en un arco amplio liderando con los codos.',
      'Aprieta la parte posterior de los hombros sin juntar excesivamente las escápulas.',
      'Desciende despacio resistiendo el peso.'
    ],
    commonMistakes: ['Usar demasiado peso y convertir el movimiento en un remo.'],
    breathingTip: 'Exhala al abrir; inhala al cerrar.',
    targetFocus: 'Deltoides posterior y salud articular del hombro.'
  },
  {
    id: 'face_pull_polea',
    name: 'Face pull en polea con cuerda',
    muscleGroup: 'Hombros',
    pattern: 'Aislamiento',
    level: 'A',
    equipment: 'Polea',
    steps: [
      'Coloca la polea a la altura de la cara con el accesorio de cuerda.',
      'Agarra los extremos con las palmas enfrentadas o hacia abajo.',
      'Tira de la cuerda hacia la frente separando las manos al final en rotación externa.',
      'Pausa 1 segundo apretando la parte alta de la espalda y hombros posteriores.'
    ],
    commonMistakes: ['Tirar hacia el pecho en lugar de hacia la frente.', 'Arquear la espalda lumbar.'],
    breathingTip: 'Exhala al tirar; inhala al regresar.',
    targetFocus: 'Rotadores externos, deltoides posterior y postura escapular óptima.'
  },

  // ==========================================
  // --- BRAZOS ---
  // ==========================================
  {
    id: 'curl_martillo_mancuernas',
    name: 'Curl martillo con mancuernas',
    muscleGroup: 'Brazos',
    pattern: 'Aislamiento',
    level: 'A',
    equipment: 'Mancuernas',
    steps: [
      'Sostén las mancuernas a los costados con agarre neutro (palmas enfrentadas).',
      'Mantén los codos pegados al cuerpo y flexiona los antebrazos sin girar las muñecas.',
      'Aprieta 1 segundo en la cima y baja controlando el descenso.'
    ],
    commonMistakes: ['Balancear los hombros hacia adelante.'],
    breathingTip: 'Exhala al subir; inhala al descender.',
    targetFocus: 'Músculo braquial anterior y braquiorradial (grosor de brazo y antebrazo).'
  },
  {
    id: 'extension_triceps_polea',
    name: 'Extensión de tríceps en polea alta con cuerda',
    muscleGroup: 'Brazos',
    pattern: 'Aislamiento',
    level: 'A',
    equipment: 'Polea',
    steps: [
      'De pie frente a la polea con el torso ligeramente inclinado al frente.',
      'Codos pegados a los costados.',
      'Extiende los antebrazos hacia abajo abriendo la cuerda al final para máxima contracción.',
      'Regresa en 2 segundos hasta los 90 grados.'
    ],
    commonMistakes: ['Mover los codos hacia atrás en el retorno.'],
    breathingTip: 'Exhala al extender; inhala al subir.',
    targetFocus: 'Cabeza lateral y medial del tríceps braquial.'
  },
  {
    id: 'extension_triceps_copa',
    name: 'Extensión de tríceps copa a dos manos',
    muscleGroup: 'Brazos',
    pattern: 'Aislamiento',
    level: 'A',
    equipment: 'Mancuernas',
    steps: [
      'Siéntate con la espalda apoyada y sujeta una mancuerna con ambas manos sobre la cabeza.',
      'Mantén los codos apuntando al frente cerca de las orejas.',
      'Extiende los antebrazos hacia el techo apretando los tríceps.',
      'Baja sintiendo el estiramiento profundo detrás de los brazos.'
    ],
    commonMistakes: ['Abrir los codos en exceso hacia los lados.'],
    breathingTip: 'Inhala al bajar tras la cabeza; exhala al presionar arriba.',
    targetFocus: 'Cabeza larga del tríceps en máxima posición de estiramiento.'
  },

  // ==========================================
  // --- GLÚTEOS ---
  // ==========================================
  {
    id: 'abduccion_cadera_maquina',
    name: 'Abducción de cadera en máquina',
    muscleGroup: 'Glúteos',
    pattern: 'Aislamiento',
    level: 'A',
    equipment: 'Máquina',
    steps: [
      'Siéntate en la máquina de abducciones con la espalda apoyada o ligeramente inclinada al frente.',
      'Abre las piernas con fuerza empujando contra las almohadillas laterales.',
      'Pausa 1-2 segundos en la máxima apertura apretando la parte lateral de los glúteos.',
      'Regresa despacio en 3 segundos resistiendo el peso.'
    ],
    commonMistakes: ['Hacer repeticiones rápidas con rebote sin pausa en apertura.'],
    breathingTip: 'Exhala al abrir; inhala al cerrar controlado.',
    targetFocus: 'Glúteo medio y menor para redondez lateral y estabilidad de cadera.'
  },
  {
    id: 'puente_gluteo_suelo',
    name: 'Puente de glúteos en suelo con peso',
    muscleGroup: 'Glúteos',
    pattern: 'Dominante cadera',
    level: 'A',
    equipment: 'Barra',
    steps: [
      'Acuéstate boca arriba con rodillas dobladas y pies planos al ancho de hombros.',
      'Coloca una barra o mancuerna sobre las caderas.',
      'Empuja a través de los talones elevando la pelvis hasta alinear rodillas, caderas y hombros.',
      'Aprieta los glúteos al máximo durante 2 segundos arriba antes de bajar.'
    ],
    commonMistakes: ['Arquear la zona lumbar en lugar de bascular la pelvis.'],
    breathingTip: 'Inhala abajo; exhala al elevar la pelvis.',
    targetFocus: 'Glúteo mayor en máxima contracción concéntrica sin estrés espinal.'
  },

  // ==========================================
  // --- PIERNAS / CUÁDRICEPS ---
  // ==========================================
  {
    id: 'sentadilla_bulgara_pesada',
    name: 'Sentadilla búlgara con mancuernas pesadas',
    muscleGroup: 'Cuádriceps',
    pattern: 'Dominante rodilla',
    level: 'C',
    equipment: 'Mancuernas',
    steps: [
      'Apoya el empeine trasero en el banco con mancuernas pesadas a los lados.',
      'Baja flexionando la rodilla delantera hasta que el muslo quede paralelo al suelo.',
      'Empuja desde todo el pie delantero para subir con potencia sin balanceo.',
      'Pausa de 1 segundo abajo en cada repetición para eliminar inercias.'
    ],
    commonMistakes: ['Perder la estabilidad por dar un paso demasiado estrecho.'],
    breathingTip: 'Inhala al descender; exhala al subir con fuerza.',
    targetFocus: 'Fuerza máxima unilateral, hipertrofia de cuádriceps y glúteo mayor.'
  },
  {
    id: 'sentadilla_hack_cuadriceps',
    name: 'Sentadilla Hack enfocada en cuádriceps',
    muscleGroup: 'Cuádriceps',
    pattern: 'Dominante rodilla',
    level: 'B',
    equipment: 'Máquina',
    steps: [
      'Apoya la espalda y hombros totalmente contra los acolchados de la máquina Hack.',
      'Pies al ancho de hombros en posición media-baja de la plataforma.',
      'Baja de forma controlada en 3 segundos buscando profundidad de 90° a 110°.',
      'Empuja con fuerza extendiendo las piernas sin bloquear las rodillas arriba.'
    ],
    commonMistakes: ['Despegar la zona lumbar del respaldo en el fondo.'],
    breathingTip: 'Inhala en el descenso; exhala al empujar hacia arriba.',
    targetFocus: 'Máximo estímulo en los vastos del cuádriceps con soporte espinal total.'
  },
  {
    id: 'prensa_inclinada_gluteo',
    name: 'Prensa inclinada con pies altos (enfoque glúteo)',
    muscleGroup: 'Glúteos',
    pattern: 'Dominante cadera',
    level: 'B',
    equipment: 'Máquina',
    steps: [
      'Coloca los pies en la parte superior de la plataforma, ligeramente más abiertos que el ancho de hombros.',
      'Desciende la prensa flexionando profundamente las caderas.',
      'Empuja a través de los talones extendiendo las piernas para máxima activación de glúteo e isquios.'
    ],
    commonMistakes: ['Permitir que la pelvis se levante del asiento en el fondo.'],
    breathingTip: 'Inhala al bajar la plataforma; exhala al empujar desde los talones.',
    targetFocus: 'Glúteo mayor e isquiotibiales mediante gran flexión de cadera en prensa.'
  }
];

// Helper de normalización para búsqueda fonética y textual
const normalizeStr = (str: string) =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim();

// Busca un ejercicio individual sin superseries
function findSingleExercise(name: string): ExerciseDetail {
  const cleanName = normalizeStr(name);

  // 1. Primero consultar la base de datos de medios reales (coincidencia precisa de patrón y fotos reales)
  const mediaEntry = findExerciseMedia(name);
  if (mediaEntry) {
    return {
      id: mediaEntry.id,
      name, // MANTENER SIEMPRE EL NOMBRE EXACTO DEL EJERCICIO QUE EL ATLETA TOCÓ
      muscleGroup: mediaEntry.muscleGroup,
      pattern: mediaEntry.pattern,
      level: 'A',
      equipment: mediaEntry.equipment,
      steps: mediaEntry.steps,
      commonMistakes: mediaEntry.commonMistakes,
      breathingTip: mediaEntry.breathingTip,
      targetFocus: mediaEntry.primaryMuscle,
      demoImages: mediaEntry.demoImages
    };
  }

  // 2. Coincidencia exacta en el banco estándar
  const exact = EXERCISE_BANK.find((ex) => normalizeStr(ex.name) === cleanName);
  if (exact) {
    const fallbackMedia = findExerciseMedia(exact.name);
    return {
      ...exact,
      demoImages: exact.demoImages || fallbackMedia?.demoImages
    };
  }

  // 3. Coincidencia exacta en el catálogo científico ampliado
  const matchSciExact = SCIENTIFIC_EXERCISES.find((ex) => normalizeStr(ex.name) === cleanName);
  if (matchSciExact) {
    const isArm = matchSciExact.pattern === 'brazos' || matchSciExact.primary.some((p) => /b[íi]ceps|tr[íi]ceps|antebrazo/i.test(p));
    const isGlute = matchSciExact.pattern === 'bisagra' || matchSciExact.primary.some((p) => /gl[úu]teo/i.test(p));
    const isQuad = matchSciExact.pattern === 'unilateral' || matchSciExact.primary.some((p) => /cu[áa]driceps/i.test(p));
    const fallbackMedia = findExerciseMedia(matchSciExact.name);

    return {
      id: matchSciExact.id,
      name: matchSciExact.name,
      muscleGroup: isArm
        ? 'Brazos'
        : isGlute
        ? 'Glúteos'
        : isQuad
        ? 'Cuádriceps'
        : matchSciExact.pattern === 'empuje_h'
        ? 'Pecho'
        : matchSciExact.pattern === 'empuje_v'
        ? 'Hombros'
        : 'Espalda',
      pattern: isArm
        ? 'Aislamiento'
        : isQuad
        ? 'Dominante rodilla'
        : matchSciExact.pattern === 'bisagra'
        ? 'Dominante cadera'
        : matchSciExact.pattern === 'empuje_h'
        ? 'Empuje horizontal'
        : matchSciExact.pattern === 'empuje_v'
        ? 'Empuje vertical'
        : matchSciExact.pattern === 'traccion_v'
        ? 'Tracción vertical'
        : 'Tracción horizontal',
      level: matchSciExact.evidence,
      equipment: (matchSciExact.equipment[0] as any) || 'Mancuernas',
      steps: matchSciExact.cues && matchSciExact.cues.length > 0 ? matchSciExact.cues : [
        'Adopta una posición de partida sólida con alineación articular neutra y pies firmemente anclados.',
        'Inicia el movimiento controlando la fase excéntrica en 2 a 3 segundos.',
        'Completa el rango articular sin balanceos ni inercias.'
      ],
      commonMistakes: [
        'Usar más carga de la permitida por tu técnica limpia.',
        'Acortar el recorrido en la parte profunda o de máxima contracción.'
      ],
      breathingTip: 'Inhala al descender con control; exhala con fuerza al superar la fase concéntrica.',
      targetFocus: matchSciExact.notes || 'Estimulación muscular de alta evidencia científica.',
      demoImages: fallbackMedia?.demoImages
    };
  }

  // 4. Detección específica por grupo muscular y patrón para ejercicios dinámicos de las rutinas semanales
  const isCalves = /talon|talón|gemelo|pantorrilla|calf/i.test(cleanName);
  const isArms = /curl|martillo|biceps|bíceps|triceps|tríceps|copa|frances|francés|rompecraneos|fondos.*banco|antebrazo|brazo/i.test(cleanName);
  const isGlute = /glute|hip thrust|puente|patada|abducc|rdl|rumano|isquio|frog pump|elevacion.*pelvis|elevación.*pelvis/i.test(cleanName);
  const isSquat = /sentadilla|squat|cuadriceps|cuádriceps|prensa|leg extension|bulgara|búlgara|hack|zancada|step-?up|caja/i.test(cleanName);
  const isPull = /remo|jalon|jalón|dominada|pull|espalda|dorsal/i.test(cleanName);
  const isShoulders = !isCalves && /hombro|deltoid|militar|elevacion.*(lateral|frontal)|elevación.*(lateral|frontal)|pajaro|pájaro|face pull/i.test(cleanName);
  const isPush = /press.*(banca|plano|inclinado|pecho)|pecho|flexion|flexión|apertura|dips/i.test(cleanName);
  const isCore = /abdomen|abdominal|core|plancha|plank|crunch|rueda.*ab|rollout|elevacion.*(pierna|rodilla)|elevación.*(pierna|rodilla)|giro.*ruso|russian|twist|oso|bear|crawl|hollow/i.test(cleanName);
  const isCarry = /carry|carga|bucket|sandbag|paseo|transporte/i.test(cleanName);
  const isRunning = /carrera|correr|run|trote|intervalo|trail|sprint/i.test(cleanName);

  const equipmentGuess = /mancuerna/i.test(cleanName)
    ? 'Mancuernas'
    : /polea|cable/i.test(cleanName)
    ? 'Polea'
    : /barra.*t/i.test(cleanName)
    ? 'Barra'
    : /barra/i.test(cleanName)
    ? 'Barra'
    : /maquina|máquina|prensa|hack|smith/i.test(cleanName)
    ? 'Máquina'
    : /kettlebell/i.test(cleanName)
    ? 'Kettlebell'
    : /corporal|libre/i.test(cleanName)
    ? 'Peso corporal'
    : 'Mancuernas';

  if (isCalves) {
    const media = findExerciseMedia('talon');
    return {
      id: `custom_calf_${cleanName.replace(/\s+/g, '_')}`,
      name,
      muscleGroup: 'Isquios y Glúteo',
      pattern: 'Aislamiento',
      level: 'A',
      equipment: equipmentGuess,
      steps: [
        'Apoya la punta de los pies en el borde de la plataforma o escalón con los talones libres.',
        'Baja los talones despacio por debajo del nivel sintiendo un estiramiento profundo en las pantorrillas.',
        'Impúlsate con fuerza hacia arriba sobre el metatarso y contrae los gemelos durante 1-2 segundos en la cima.'
      ],
      commonMistakes: [
        'Rebotar en la parte baja usando la elasticidad del tendón.',
        'Flexionar las rodillas en una elevación de pie.'
      ],
      breathingTip: 'Inhala al descender los talones; exhala al impulsarte hacia arriba.',
      targetFocus: 'Desarrollo de los gemelos y sóleo, y estabilidad de tobillo.',
      demoImages: media?.demoImages
    };
  }

  if (isShoulders) {
    const isLateral = /lateral/i.test(cleanName);
    const isFrontal = /frontal/i.test(cleanName);
    const media = isFrontal
      ? findExerciseMedia('elevacion frontal')
      : isLateral
      ? findExerciseMedia('elevacion lateral')
      : findExerciseMedia('press militar');

    return {
      id: `custom_shoulder_${cleanName.replace(/\s+/g, '_')}`,
      name,
      muscleGroup: 'Hombros',
      pattern: isLateral || isFrontal ? 'Aislamiento' : 'Empuje vertical',
      level: 'A',
      equipment: /disco/i.test(cleanName) ? 'Mancuernas' : equipmentGuess,
      steps: isFrontal ? [
        'Sujeta la carga (disco o mancuernas) frente a los muslos con los brazos casi extendidos pero codos relajados.',
        'Mantén el torso erguido y el core firme sin arquear la zona lumbar.',
        'Eleva la carga hacia adelante y arriba en una trayectoria suave hasta la altura de los ojos o la barbilla.',
        'Pausa 1 segundo en la cúspide apretando los deltoides frontales y baja en 2 a 3 segundos resistiendo el peso.'
      ] : isLateral ? [
        'Inclina el torso levemente hacia adelante (5°-10°) con una mancuerna en cada mano.',
        'Eleva los brazos hacia los lados en el plano escapular guiando con los codos.',
        'Sube hasta la altura paralela de los hombros sin balancear el cuerpo.',
        'Pausa 1 segundo arriba y desciende en 2 segundos controlando el movimiento.'
      ] : [
        'Alinea el torso con el abdomen firme y los glúteos contraídos para proteger las lumbares.',
        'Sube la carga verticalmente en el plano escapular con una trayectoria fluida.',
        'Desciende de forma pausada hasta la altura de los hombros o clavículas sin soltar el peso.'
      ],
      commonMistakes: [
        'Balancear el torso o arquear la espalda baja para subir la carga con inercia.',
        'Encoger los hombros hacia las orejas usando el trapecio.'
      ],
      breathingTip: isFrontal || isLateral
        ? 'Exhala al elevar la carga; inhala al descenderla de forma controlada.'
        : 'Inhala antes de iniciar el empuje; exhala con fuerza al presionar sobre la cabeza.',
      targetFocus: isFrontal
        ? 'Aislamiento e hipertrofia del deltoides anterior (hombro frontal) y estabilidad escapular.'
        : isLateral
        ? 'Aislamiento del deltoides lateral y silueta en V.'
        : 'Desarrollo de los deltoides y fuerza de empuje vertical.',
      demoImages: media?.demoImages
    };
  }

  if (isArms) {
    const isTriceps = /triceps|tríceps|copa|frances|francés|rompecraneos|extension|extensión/i.test(cleanName);
    const media = findExerciseMedia(isTriceps ? 'copa' : 'martillo');
    return {
      id: `custom_arm_${cleanName.replace(/\s+/g, '_')}`,
      name,
      muscleGroup: 'Brazos',
      pattern: 'Aislamiento',
      level: 'A',
      equipment: equipmentGuess,
      steps: isTriceps ? [
        'Fija los hombros y codos sin permitir que se abran hacia los lados.',
        'Extiende completamente los antebrazos contrayendo los tríceps con fuerza al final.',
        'Regresa en 2-3 segundos sintiendo el estiramiento profundo del tríceps.'
      ] : [
        'Mantén los codos pegados a los costados del cuerpo y el pecho erguido.',
        'Flexiona los antebrazos contrayendo los bíceps sin balancear la espalda.',
        'Aprieta 1 segundo arriba y desciende resistiendo el peso.'
      ],
      commonMistakes: [
        'Balancear el torso para mover la carga.',
        'Separar los codos restando aislamiento al músculo objetivo.'
      ],
      breathingTip: 'Exhala en el esfuerzo de contracción; inhala en la bajada controlada.',
      targetFocus: isTriceps ? 'Hipertrofia de las tres cabezas del tríceps.' : 'Pico y grosor del bíceps y braquial.',
      demoImages: media?.demoImages
    };
  }

  if (isGlute) {
    const isSeatedFemoral = /sentado/i.test(cleanName) && /femoral|isquio|curl/i.test(cleanName);
    const isLyingFemoral = /curl.*femoral/i.test(cleanName);
    const media = isSeatedFemoral
      ? findExerciseMedia('femoral sentado')
      : isLyingFemoral
      ? findExerciseMedia('curl femoral')
      : findExerciseMedia('hip thrust');

    return {
      id: `custom_glute_${cleanName.replace(/\s+/g, '_')}`,
      name,
      muscleGroup: (isSeatedFemoral || isLyingFemoral) ? 'Isquios y Glúteo' : 'Glúteos',
      pattern: (isSeatedFemoral || isLyingFemoral) ? 'Aislamiento' : 'Dominante cadera',
      level: 'A',
      equipment: equipmentGuess,
      steps: (isSeatedFemoral || isLyingFemoral) ? [
        'Ajusta la máquina para alinear tus rodillas con el eje de rotación.',
        'Coloca el rodillo en la parte baja de los gemelos o talones.',
        'Flexiona las rodillas con fuerza apretando los isquiotibiales 1-2 segundos en la contracción.',
        'Regresa controlando la bajada en 2-3 segundos sintiendo el estiramiento profundo.'
      ] : [
        'Apoya la espalda alta o colócate con los pies al ancho de hombros.',
        'Empuja a través de los talones extendiendo la cadera con la pelvis neutra.',
        'Aprieta los glúteos intensamente durante 1-2 segundos en la máxima contracción.',
        'Baja controlando la fase excéntrica sin perder la tensión muscular.'
      ],
      commonMistakes: [
        'Arquear la zona lumbar en lugar de bascular la pelvis.',
        'Pisar de puntas en lugar de anclar los talones.'
      ],
      breathingTip: 'Inhala en el descenso; exhala con potencia al extender la cadera o flexionar las piernas.',
      targetFocus: (isSeatedFemoral || isLyingFemoral) ? 'Aislamiento e hipertrofia de los isquiotibiales.' : 'Máxima activación del glúteo mayor y medio.',
      demoImages: media?.demoImages
    };
  }

  if (isSquat) {
    const isBulgarian = /bulgara|búlgara|split/i.test(cleanName);
    const isHack = /hack/i.test(cleanName);
    const isPress = /prensa/i.test(cleanName);
    const isExt = /extension|extensión/i.test(cleanName);
    const media = isBulgarian
      ? findExerciseMedia('sentadilla bulgara')
      : isHack
      ? findExerciseMedia('hack')
      : isPress
      ? findExerciseMedia('prensa')
      : isExt
      ? findExerciseMedia('extension cuadriceps')
      : findExerciseMedia('sentadilla');

    return {
      id: `custom_squat_${cleanName.replace(/\s+/g, '_')}`,
      name,
      muscleGroup: 'Cuádriceps',
      pattern: 'Dominante rodilla',
      level: 'A',
      equipment: equipmentGuess,
      steps: [
        'Pies al ancho de los hombros con puntas ligeramente hacia afuera.',
        'Desciende flexionando rodillas y caderas al mismo tiempo con el pecho alto.',
        'Baja hasta que los muslos queden al menos paralelos al suelo con los talones firmes.',
        'Empuja contra el suelo con toda la planta del pie para retornar erguido.'
      ],
      commonMistakes: [
        'Colapso de rodillas hacia adentro.',
        'Despegar los talones del suelo durante la bajada.'
      ],
      breathingTip: 'Inhala llenando el abdomen de aire en la bajada; exhala al subir.',
      targetFocus: 'Fuerza e hipertrofia de cuádriceps y estabilidad de rodilla.',
      demoImages: media?.demoImages
    };
  }

  if (isPull) {
    const media = /meadows/i.test(cleanName)
      ? findExerciseMedia('meadows')
      : /pendlay/i.test(cleanName)
      ? findExerciseMedia('pendlay')
      : /barra.*t|t-?bar/i.test(cleanName)
      ? findExerciseMedia('barra t')
      : /dominada|pull-?up/i.test(cleanName)
      ? findExerciseMedia('dominadas')
      : /jalon|jalón/i.test(cleanName)
      ? findExerciseMedia('jalon al pecho')
      : /mancuerna/i.test(cleanName)
      ? findExerciseMedia('remo mancuerna')
      : findExerciseMedia('remo con barra');
    return {
      id: `custom_pull_${cleanName.replace(/\s+/g, '_')}`,
      name,
      muscleGroup: 'Espalda',
      pattern: /vertical|dominada|jalon|jalón/i.test(cleanName) ? 'Tracción vertical' : 'Tracción horizontal',
      level: 'A',
      equipment: equipmentGuess,
      steps: [
        'Inicia cada repetición activando las escápulas hacia abajo y atrás.',
        'Tira de la carga guiando con los codos en dirección a la cadera o costillas.',
        'Aprieta la musculatura dorsal 1 segundo en contracción máxima.',
        'Extiende los brazos suavemente sintiendo cómo se estira la espalda.'
      ],
      commonMistakes: [
        'Tirar con tirones del torso usando inercia.',
        'Encorvar la espalda alta.'
      ],
      breathingTip: 'Inhala al extender los brazos; exhala al tirar de la carga.',
      targetFocus: 'Amplitud y densidad de espalda con óptima salud escapular.',
      demoImages: media?.demoImages
    };
  }

  if (isPush) {
    const media = findExerciseMedia('press banca');
    return {
      id: `custom_push_${cleanName.replace(/\s+/g, '_')}`,
      name,
      muscleGroup: 'Pecho',
      pattern: 'Empuje horizontal',
      level: 'A',
      equipment: equipmentGuess,
      steps: [
        'Acuéstate con los pies firmes y retrae los omóplatos contra el banco.',
        'Desciende la carga con los codos a 45°-60° respecto al torso.',
        'Empuja hacia arriba con los pectorales hasta extender los brazos.'
      ],
      commonMistakes: [
        'Abrir los codos a 90° forzando los manguitos rotadores.',
        'Rebotar la carga en el pecho.'
      ],
      breathingTip: 'Inhala al descender sintiendo el estiramiento; exhala al empujar.',
      targetFocus: 'Hipertrofia del pectoral mayor y fuerza de empuje.',
      demoImages: media?.demoImages
    };
  }

  if (isCore) {
    const isCableCrunch = /polea|cable/i.test(cleanName);
    const isWheel = /rueda|rollout|wheel/i.test(cleanName);
    const isHanging = /elevacion|elevación|colgado|pierna|rodilla/i.test(cleanName);
    const isRussian = /ruso|russian/i.test(cleanName);
    const isBear = /oso|bear/i.test(cleanName);
    const isBicycle = /bicicleta|bicycle|air.*bike/i.test(cleanName);
    const isFloorCrunch = !isCableCrunch && /crunch|colchoneta/i.test(cleanName);
    const media = isCableCrunch
      ? findExerciseMedia('cable crunch')
      : isWheel
      ? findExerciseMedia('rueda abdominal')
      : isHanging
      ? findExerciseMedia('elevacion pierna')
      : isRussian
      ? findExerciseMedia('giro ruso')
      : isBicycle
      ? findExerciseMedia('bicicleta')
      : isFloorCrunch
      ? findExerciseMedia('crunches en colchoneta')
      : findExerciseMedia('plancha');

    return {
      id: `custom_core_${cleanName.replace(/\s+/g, '_')}`,
      name,
      muscleGroup: 'Core',
      pattern: 'Aislamiento',
      level: 'A',
      equipment: isCableCrunch ? 'Polea' : (isWheel || isRussian || isBear || isBicycle || isFloorCrunch) ? 'Peso corporal' : equipmentGuess,
      steps: isCableCrunch ? [
        'Arrodíllate frente a la polea alta con el accesorio de cuerda.',
        'Sujeta la cuerda a los lados de la cabeza y mantén los brazos fijos.',
        'Enrolla la columna contrayendo los abdominales llevando los codos a los muslos.',
        'Pausa 1 segundo apretando el abdomen y regresa controlando el movimiento.'
      ] : isBear ? [
        'Ponte en posición de cuadrupedia con las manos bajo los hombros y las rodillas bajo las caderas.',
        'Despega las rodillas del suelo solo 2 a 3 centímetros manteniendo la espalda completamente plana.',
        'Avanza en pasos cruzados cortos coordinando mano derecha con pie izquierdo y viceversa.',
        'Mantén las caderas estables sin balancear el torso de lado a lado.'
      ] : isRussian ? [
        'Siéntate con las rodillas flexionadas y reclina el torso hacia atrás a 45° con la espalda recta.',
        'Gira el torso de un lado al otro llevando las manos hacia la cadera opuesta con control.',
        'Siente la contracción oblicua en cada lado sin redondear los hombros.'
      ] : isBicycle ? [
        'Acuéstate sobre la colchoneta con las manos tras las orejas y piernas elevadas a 90°.',
        'Lleva el codo hacia la rodilla contraria mientras extiendes la otra pierna al frente.',
        'Alterna los lados de forma continua y fluida coordinando la rotación de hombros con el pedaleo.',
        'Mantén la espalda baja en contacto con el suelo sin tirar del cuello.'
      ] : isFloorCrunch ? [
        'Acuéstate boca arriba con rodillas flexionadas y las yemas de los dedos tras las orejas.',
        'Enrolla la columna despegando los omóplatos del suelo y contrayendo intensamente el abdomen.',
        'Pausa 1 segundo en el punto máximo de contracción apretando el recto anterior.',
        'Desciende de forma controlada hasta rozar la colchoneta sin rebotar.'
      ] : [
        'Adopta una postura estable activando la pared abdominal y los glúteos.',
        'Ejecuta el movimiento con control muscular estricto evitando tirar con el cuello o la zona lumbar.',
        'Mantén la tensión en el recto abdominal durante todo el rango articular.'
      ],
      commonMistakes: [
        'Tirar con el cuello o los brazos en vez de usar la contracción del abdomen.',
        'Arquear la espalda lumbar perdiendo la estabilidad del core.'
      ],
      breathingTip: 'Exhala en la contracción abdominal o en cada rotación; inhala al extender o transicionar.',
      targetFocus: isBear
        ? 'Estabilidad anti-rotación y fuerza isométrica del core en cuadrupedia.'
        : isRussian
        ? 'Fuerza rotacional y definición de los oblicuos y pared abdominal.'
        : isBicycle
        ? 'Activación electromiográfica combinada de oblicuos y recto abdominal.'
        : isFloorCrunch
        ? 'Aislamiento directo y seguro del recto abdominal sin máquinas ni poleas.'
        : 'Fuerza funcional, estabilidad central y definición del recto abdominal.',
      demoImages: media?.demoImages
    };
  }

  if (isCarry) {
    const media = findExerciseMedia('plancha');
    return {
      id: `custom_carry_${cleanName.replace(/\s+/g, '_')}`,
      name,
      muscleGroup: 'Cardio y Metabólico',
      pattern: 'Carga y Agarre',
      level: 'B',
      equipment: 'Saco / Lastre',
      steps: [
        'Levanta la carga con las piernas manteniendo la columna neutra.',
        'Camina erguido con pasos cortos y rápidos manteniendo el core blindado.',
        'Respira continuamente sin contener el aire.'
      ],
      commonMistakes: ['Encorvarse hacia adelante con el peso.'],
      breathingTip: 'Respiración rítmica y continua.',
      targetFocus: 'Fuerza de agarre, trapecios y estabilidad central.',
      demoImages: media?.demoImages
    };
  }

  if (isRunning) {
    return {
      id: `custom_run_${cleanName.replace(/\s+/g, '_')}`,
      name,
      muscleGroup: 'Cardio y Metabólico',
      pattern: 'Metabólico',
      level: 'B',
      equipment: 'Peso corporal',
      steps: [
        'Postura erguida con ligera inclinación desde los tobillos.',
        'Aterriza con el mediopié debajo de tu centro de masa.',
        'Cadencia ágil de 170-180 pasos por minuto.'
      ],
      commonMistakes: ['Dar zancadas demasiado largas impactando con el talón.'],
      breathingTip: 'Inhala en 2 zancadas, exhala en 2 zancadas.',
      targetFocus: 'Resistencia cardiovascular y eficiencia de carrera.'
    };
  }

  // Fallback general seguro (respeta el nombre exacto que pulsó el atleta)
  return {
    id: `custom_gen_${cleanName.replace(/\s+/g, '_')}`,
    name,
    muscleGroup: 'Core',
    pattern: 'Aislamiento',
    level: 'B',
    equipment: equipmentGuess,
    steps: [
      'Colócate en postura estable con buena alineación de la columna.',
      'Controla la fase excéntrica (bajada) en 2 a 3 segundos.',
      'Acelera con control en la fase concéntrica (subida) sin usar inercias.'
    ],
    commonMistakes: ['Mover el peso con rebotes o balanceo.'],
    breathingTip: 'Inhala al bajar, exhala en el esfuerzo.',
    targetFocus: 'Control motor y técnica limpia.'
  };
}

// Helper principal con soporte nativo de Superseries («Ejercicio 1 + Ejercicio 2»)
export const findExerciseDetail = (name: string): ExerciseDetail => {
  if (!name || !name.trim()) {
    return {
      id: 'default',
      name: 'Ejercicio',
      muscleGroup: 'Brazos',
      pattern: 'Aislamiento',
      level: 'A',
      equipment: 'Mancuernas',
      steps: ['Controla cada repetición de forma pausada.', 'Mantén la alineación postural neutra.'],
      commonMistakes: ['Exceso de peso o balanceo.'],
      breathingTip: 'Inhala en la bajada, exhala en el esfuerzo.',
      targetFocus: 'Acondicionamiento y control motor.'
    };
  }

  // Si contiene '+' o '/', es una superserie o biserie de dos ejercicios continuos
  if (name.includes('+') || name.includes('/')) {
    const parts = name.split(/\s*[\+\/]\s*/).map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const partA = findSingleExercise(parts[0]);
      const partB = findSingleExercise(parts[1]);

      const demoImagesA = partA.demoImages?.[0] || partA.imageUrl;
      const demoImagesB = partB.demoImages?.[1] || partB.demoImages?.[0] || partB.imageUrl;
      const combinedDemo: [string, string] | undefined =
        demoImagesA && demoImagesB ? [demoImagesA, demoImagesB] : undefined;

      return {
        id: `superset_${normalizeStr(name).replace(/\s+/g, '_')}`,
        name,
        muscleGroup: partA.muscleGroup === partB.muscleGroup ? partA.muscleGroup : 'Brazos',
        pattern: 'Aislamiento',
        level: 'A',
        equipment: partA.equipment || 'Mancuernas',
        steps: [
          `1. [Primer ejercicio - ${parts[0]}]: ${partA.steps.join(' ')}`,
          `2. [Transición inmediata]: Sin descanso y sin soltar la carga, pasa directamente al segundo ejercicio.`,
          `3. [Segundo ejercicio - ${parts[1]}]: ${partB.steps.join(' ')}`,
          `4. Descansa 60 a 90 segundos únicamente tras haber finalizado la ronda de ambos ejercicios.`
        ],
        commonMistakes: [
          `En ${parts[0]}: ${partA.commonMistakes[0] || 'Balancear la carga con inercia.'}`,
          `En ${parts[1]}: ${partB.commonMistakes[0] || 'Perder la estabilidad por fatiga acumulada.'}`
        ],
        breathingTip: 'Exhala en cada fase concéntrica de esfuerzo; inhala durante la bajada excéntrica.',
        targetFocus: `Superserie de alta congestión metabólica: combina de forma consecutiva ${parts[0]} con ${parts[1]} para máxima densidad y desarrollo sin pérdida de tiempo.`,
        demoImages: combinedDemo
      };
    }
  }

  // Ejercicio individual
  return findSingleExercise(name);
};
