// Banco de ejercicios curados para Finishers metabólicos (AMRAP)
// Permite sustituir cualquier ejercicio del Finisher cuando máquinas/poleas están ocupadas en el gym

export type FinisherType = 'abs' | 'complementary' | 'activator';
export type FinisherEquipment = 'Peso corporal' | 'Mancuernas' | 'Disco' | 'Polea' | 'Barra' | 'Banda' | 'Máquina';
export type FinisherEquipmentGroup = 'all' | 'bodyweight' | 'free_weight' | 'cable_machine' | 'bar';

export interface FinisherExerciseOption {
  id: string;
  name: string; // Formato con repeticiones/tiempo para el bloque AMRAP
  type: FinisherType;
  category: string;
  equipment: FinisherEquipment;
  equipmentGroup: FinisherEquipmentGroup;
  targetFocus: string;
  description: string;
}

export const FINISHER_EXERCISE_BANK: FinisherExerciseOption[] = [
  // ========================================================
  // --- BANCO AMRAP: ABDOMEN & CORE ---
  // ========================================================
  // Suelo / Peso corporal (Sin máquinas - Libre cuando el gym está lleno)
  {
    id: 'abs_crunch_floor',
    name: '15 Crunches en colchoneta controlados',
    type: 'abs',
    category: 'Recto anterior',
    equipment: 'Peso corporal',
    equipmentGroup: 'bodyweight',
    targetFocus: 'Aislamiento directo del abdomen en colchoneta sin depender de poleas ocupadas.',
    description: 'Enrolla la columna vertebral despegando los omóplatos con pausa de 1s arriba.'
  },
  {
    id: 'abs_bicycle',
    name: '15 Abdominales bicicleta continuos',
    type: 'abs',
    category: 'Recto & Oblicuos',
    equipment: 'Peso corporal',
    equipmentGroup: 'bodyweight',
    targetFocus: 'Máxima activación electromiográfica combinada de oblicuos y recto abdominal.',
    description: 'Alterna codo con rodilla contraria en pedaleo fluido manteniendo la lumbar pegada.'
  },
  {
    id: 'abs_leg_raise_floor',
    name: '12 Elevaciones de piernas en suelo o paralelas',
    type: 'abs',
    category: 'Abdomen inferior',
    equipment: 'Peso corporal',
    equipmentGroup: 'bodyweight',
    targetFocus: 'Basculación de la pelvis hacia arriba para aislar la porción inferior del recto.',
    description: 'Eleva piernas extendidas o rodillas controlando la bajada sin arquear la espalda.'
  },
  {
    id: 'abs_scissors',
    name: '12 Tijeras abdominales en colchoneta',
    type: 'abs',
    category: 'Abdomen inferior',
    equipment: 'Peso corporal',
    equipmentGroup: 'bodyweight',
    targetFocus: 'Tensión continua en abdomen bajo y transverso con aleteo horizontal/vertical.',
    description: 'Cruza las piernas a ras de suelo manteniendo la zona lumbar anclada.'
  },
  {
    id: 'abs_plank_iso',
    name: '30s Plancha abdominal isométrica',
    type: 'abs',
    category: 'Core profundo',
    equipment: 'Peso corporal',
    equipmentGroup: 'bodyweight',
    targetFocus: 'Estabilidad y anti-extensión del transverso abdominal y glúteos.',
    description: 'Apoyo en antebrazos formando una línea recta sin dejar caer la pelvis.'
  },
  {
    id: 'abs_hollow_hold',
    name: '30s Plancha hueca (Hollow body hold)',
    type: 'abs',
    category: 'Anti-extensión gimnástica',
    equipment: 'Peso corporal',
    equipmentGroup: 'bodyweight',
    targetFocus: 'Fuerza isométrica profunda con compresión abdominal total contra el piso.',
    description: 'Brazos y piernas flotando a 15 cm del suelo con retroversión pélvica estricta.'
  },
  {
    id: 'abs_bear_crawl',
    name: '10 Caminatas de oso (Bear crawls)',
    type: 'abs',
    category: 'Core dinámico',
    equipment: 'Peso corporal',
    equipmentGroup: 'bodyweight',
    targetFocus: 'Estabilidad anti-rotación y resistencia del core en posición de cuadrupedia.',
    description: 'Rodillas flotando a 2 cm del suelo avanzando en pasos cruzados cortos y estables.'
  },
  {
    id: 'abs_v_ups',
    name: '15 Abdominales en V (V-ups)',
    type: 'abs',
    category: 'Flexión global',
    equipment: 'Peso corporal',
    equipmentGroup: 'bodyweight',
    targetFocus: 'Cierre coordinado de torso y piernas para reclutamiento de toda la pared abdominal.',
    description: 'Toca las puntas de los pies en el punto alto con contracción explosiva.'
  },
  {
    id: 'abs_side_plank',
    name: '30s Plancha lateral (15s por lado)',
    type: 'abs',
    category: 'Oblicuos & Cuadrado lumbar',
    equipment: 'Peso corporal',
    equipmentGroup: 'bodyweight',
    targetFocus: 'Estabilidad en el plano frontal y fortalecimiento de la cintura y glúteo medio.',
    description: 'Cuerpo completamente alineado de lado con el antebrazo apoyado en el suelo.'
  },
  {
    id: 'abs_mountain_climbers',
    name: '20 Escaladores de montaña (Mountain climbers)',
    type: 'abs',
    category: 'Metabólico & Core',
    equipment: 'Peso corporal',
    equipmentGroup: 'bodyweight',
    targetFocus: 'Estabilidad escapular, flexión de cadera y gasto calórico cardiovascular.',
    description: 'Desde plancha alta, lleva las rodillas alternas hacia el pecho con ritmo ágil.'
  },

  // Abdomen con Peso Libre (Mancuerna o Disco)
  {
    id: 'abs_crunch_plate',
    name: '15 Crunches con disco al pecho en colchoneta',
    type: 'abs',
    category: 'Recto anterior con carga',
    equipment: 'Disco',
    equipmentGroup: 'free_weight',
    targetFocus: 'Sustituto ideal del Cable Crunch: sobrecarga progresiva sin esperar por poleas.',
    description: 'Sostén un disco de 5 a 10 kg sobre el pecho y realiza flexión de columna lenta.'
  },
  {
    id: 'abs_russian_twists',
    name: '20 Giros rusos (Russian twists)',
    type: 'abs',
    category: 'Oblicuos rotacionales',
    equipment: 'Peso corporal',
    equipmentGroup: 'bodyweight',
    targetFocus: 'Fuerza rotacional y definición de los oblicuos sin máquinas.',
    description: 'Torso inclinado 45° girando de un lado al otro con control estricto.'
  },
  {
    id: 'abs_russian_twists_weight',
    name: '20 Giros rusos con mancuerna o disco',
    type: 'abs',
    category: 'Oblicuos con carga',
    equipment: 'Mancuernas',
    equipmentGroup: 'free_weight',
    targetFocus: 'Mayor sobrecarga en rotadores del tronco usando una mancuerna o disco ligero.',
    description: 'Gira el peso hacia cada cadera manteniendo los pies elevados o apoyados.'
  },

  // Abdomen con Poleas o Máquinas
  {
    id: 'abs_cable_crunch',
    name: '15 Abdominales en polea alta (Cable crunches)',
    type: 'abs',
    category: 'Sobrecarga en polea',
    equipment: 'Polea',
    equipmentGroup: 'cable_machine',
    targetFocus: 'Tensión constante continua en todo el rango articular con cuerda en polea alta.',
    description: 'Arrodíllate con la cuerda en sienes y enrolla la columna hacia los muslos.'
  },
  {
    id: 'abs_woodchopper_cable',
    name: '15 Giros de leñador en polea (Woodchoppers)',
    type: 'abs',
    category: 'Oblicuos en polea',
    equipment: 'Polea',
    equipmentGroup: 'cable_machine',
    targetFocus: 'Torsión oblicua con resistencia constante en trayectoria diagonal.',
    description: 'Tira del cable en diagonal de arriba a abajo o de abajo hacia arriba rotando cadera.'
  },

  // Abdomen en Barra / Estación
  {
    id: 'abs_hanging_knees',
    name: '12 Elevaciones de rodillas o piernas colgado',
    type: 'abs',
    category: 'Colgado en barra',
    equipment: 'Barra',
    equipmentGroup: 'bar',
    targetFocus: 'Descompresión espinal mientras se eleva la pelvis contrayendo el abdomen.',
    description: 'Cuélgate de una barra fija y sube las rodillas al pecho sin columpiarte.'
  },
  {
    id: 'abs_ab_roller',
    name: '12 Rueda abdominal (Ab wheel rollouts)',
    type: 'abs',
    category: 'Anti-extensión avanzada',
    equipment: 'Peso corporal',
    equipmentGroup: 'bodyweight',
    targetFocus: 'Sobrecarga extrema del transverso y recto anterior en fase excéntrica.',
    description: 'Rueda hacia adelante manteniendo la espalda ligeramente curvada y regresa contrayendo.'
  },

  // ========================================================
  // --- BANCO AMRAP: COMPLEMENTARIO (BURNOUT METABÓLICO) ---
  // ========================================================
  {
    id: 'comp_pushups',
    name: '10 Flexiones de pecho (Push-ups)',
    type: 'complementary',
    category: 'Empuje & Pecho',
    equipment: 'Peso corporal',
    equipmentGroup: 'bodyweight',
    targetFocus: 'Bombeo final de pectorales, tríceps y estabilidad de core.',
    description: 'Baja el pecho a 2 cm del suelo con codos a 45° y empuja con fuerza.'
  },
  {
    id: 'comp_bench_dips',
    name: '15 Fondos en banco o cajón',
    type: 'complementary',
    category: 'Tríceps & Deltoides',
    equipment: 'Peso corporal',
    equipmentGroup: 'bodyweight',
    targetFocus: 'Agotamiento de tríceps aprovechando cualquier banco libre del gym.',
    description: 'Espalda pegada al borde del banco flexionando codos a 90°.'
  },
  {
    id: 'comp_air_squats',
    name: '15 Sentadillas al aire (Air squats)',
    type: 'complementary',
    category: 'Piernas / Cuádriceps',
    equipment: 'Peso corporal',
    equipmentGroup: 'bodyweight',
    targetFocus: 'Flujo sanguíneo a cuádriceps y glúteos con alta velocidad y control.',
    description: 'Rompe el paralelo con el pecho alto y empuja desde los talones.'
  },
  {
    id: 'comp_squat_jumps',
    name: '12 Sentadillas de salto (Squat jumps)',
    type: 'complementary',
    category: 'Potencia metabólica',
    equipment: 'Peso corporal',
    equipmentGroup: 'bodyweight',
    targetFocus: 'Reclutamiento de fibras rápidas tipo II y elevación de frecuencia cardíaca.',
    description: 'Sentadilla profunda seguida de salto vertical potente amortiguando la caída.'
  },
  {
    id: 'comp_jumping_lunges',
    name: '10 Zancadas alternas de salto',
    type: 'complementary',
    category: 'Unilateral metabólico',
    equipment: 'Peso corporal',
    equipmentGroup: 'bodyweight',
    targetFocus: 'Quemazón extrema de cuádriceps y glúteos en zancadas pliométricas.',
    description: 'Cambia de pierna en el aire aterrizando suavemente con la rodilla a 90°.'
  },
  {
    id: 'comp_sumo_squats',
    name: '15 Sentadillas sumo (peso corporal)',
    type: 'complementary',
    category: 'Aductores & Glúteos',
    equipment: 'Peso corporal',
    equipmentGroup: 'bodyweight',
    targetFocus: 'Tensión en la cara interna de los muslos y glúteo medio sin pesas.',
    description: 'Pies más anchos que hombros con puntas a 45° bajando la cadera vertical.'
  },
  {
    id: 'comp_front_plate_raise',
    name: '15 Elevaciones frontales de disco',
    type: 'complementary',
    category: 'Hombros frontales',
    equipment: 'Disco',
    equipmentGroup: 'free_weight',
    targetFocus: 'Bombeo aislado del deltoides anterior con disco entre cintura y ojos.',
    description: 'Sube el disco con brazos casi rectos sin balancear la espalda baja.'
  },
  {
    id: 'comp_lateral_raises_light',
    name: '12 Elevaciones laterales con mancuernas ligeras',
    type: 'complementary',
    category: 'Hombros laterales',
    equipment: 'Mancuernas',
    equipmentGroup: 'free_weight',
    targetFocus: 'Bombeo estético de la cabeza lateral del deltoides para amplitud de hombros.',
    description: 'Eleva los codos en el plano escapular con carga ligera y control excéntrico.'
  },
  {
    id: 'comp_dumbbell_rows_light',
    name: '15 Remos con banda o mancuerna ligera',
    type: 'complementary',
    category: 'Espalda & Bombeo',
    equipment: 'Mancuernas',
    equipmentGroup: 'free_weight',
    targetFocus: 'Agotamiento de dorsales y romboides sin fatiga articular.',
    description: 'Tira de las mancuernas hacia la cadera con el torso inclinado y codos cerrados.'
  },
  {
    id: 'comp_plank_shoulder_tap',
    name: '15 Planchas altas con toque de hombros',
    type: 'complementary',
    category: 'Core anti-rotación',
    equipment: 'Peso corporal',
    equipmentGroup: 'bodyweight',
    targetFocus: 'Fijación escapular y estabilidad del core evitando oscilaciones pélvicas.',
    description: 'Toca el hombro opuesto con la mano alternando lados con cadera congelada.'
  },
  {
    id: 'comp_frog_pumps',
    name: '12 Puentes de rana (Frog pumps)',
    type: 'complementary',
    category: 'Glúteo bomba',
    equipment: 'Peso corporal',
    equipmentGroup: 'bodyweight',
    targetFocus: 'Congestión rápida del glúteo medio y superior sin necesidad de barra.',
    description: 'Plantas de pies juntas en mariposa elevando la pelvis y apretando arriba.'
  },
  {
    id: 'comp_band_crab_walks',
    name: '15 Pasos de cangrejo con banda',
    type: 'complementary',
    category: 'Abductores',
    equipment: 'Banda',
    equipmentGroup: 'free_weight',
    targetFocus: 'Saturación del glúteo medio en abducción continua.',
    description: 'Banda sobre rodillas en media sentadilla dando pasos laterales resistidos.'
  },

  // ========================================================
  // --- BANCO AMRAP: ACTIVADOR (MOVILIDAD Y PREPARACIÓN) ---
  // ========================================================
  {
    id: 'act_thoracic_rotations',
    name: '10 Rotaciones de columna torácica en cuadrupedia',
    type: 'activator',
    category: 'Apertura torácica',
    equipment: 'Peso corporal',
    equipmentGroup: 'bodyweight',
    targetFocus: 'Movilidad torácica para empujes verticales y sentadillas sin dolor de hombro.',
    description: 'Mano en nuca abriendo el codo hacia el techo y rotando el esternón.'
  },
  {
    id: 'act_scapular_pushups',
    name: '12 Flexiones escapulares',
    type: 'activator',
    category: 'Serrato & Escápulas',
    equipment: 'Peso corporal',
    equipmentGroup: 'bodyweight',
    targetFocus: 'Protracción y retracción pura del serrato para proteger la articulación glenohumeral.',
    description: 'Brazos rectos en plancha juntando y separando omóplatos sin doblar codos.'
  },
  {
    id: 'act_plank_downdog',
    name: '10 Planchas altas a perro boca abajo',
    type: 'activator',
    category: 'Cadena posterior & Hombros',
    equipment: 'Peso corporal',
    equipmentGroup: 'bodyweight',
    targetFocus: 'Estiramiento dinámico de isquiotibiales y movilidad de hombros en flexión.',
    description: 'Transiciona desde plancha empujando la cadera hacia arriba y talones al suelo.'
  },
  {
    id: 'act_inchworms',
    name: '8 Inchworms dinámicos',
    type: 'activator',
    category: 'Cadena posterior dinámica',
    equipment: 'Peso corporal',
    equipmentGroup: 'bodyweight',
    targetFocus: 'Activación del core y estiramiento de isquiotibiales en paso de manos.',
    description: 'Camina con las manos hasta plancha y regresa caminando con los pies hacia las manos.'
  },
  {
    id: 'act_hip_90_90',
    name: '8 Rotaciones de cadera 90/90',
    type: 'activator',
    category: 'Movilidad de cadera',
    equipment: 'Peso corporal',
    equipmentGroup: 'bodyweight',
    targetFocus: 'Rotación interna y externa de cadera para sentadillas profundas sin pellizco.',
    description: 'Sentado en el suelo con piernas en ángulos de 90° cambiando de lado fluidamente.'
  },
  {
    id: 'act_cossack_squat',
    name: '10 Desplantes de cosaco laterales',
    type: 'activator',
    category: 'Movilidad aductores & tobillo',
    equipment: 'Peso corporal',
    equipmentGroup: 'bodyweight',
    targetFocus: 'Dorsiflexión de tobillo y apertura de cadera en plano frontal.',
    description: 'Desciende en sentadilla profunda sobre una pierna manteniendo la otra estirada.'
  },
  {
    id: 'act_cat_camel',
    name: '10 Gato-camello respiraciones lentas',
    type: 'activator',
    category: 'Descompresión espinal',
    equipment: 'Peso corporal',
    equipmentGroup: 'bodyweight',
    targetFocus: 'Movilización segmentaria de la columna vertebral y descompresión discal.',
    description: 'En cuadrupedia, arquea y redondea la espalda al ritmo de la respiración.'
  },
  {
    id: 'act_glute_bridges_iso',
    name: '10 Puentes de glúteo isométrica 2s',
    type: 'activator',
    category: 'Activación de glúteo',
    equipment: 'Peso corporal',
    equipmentGroup: 'bodyweight',
    targetFocus: 'Despertar neuromuscular del glúteo mayor antes de sentadillas o peso muerto.',
    description: 'Eleva la cadera con pausa de 2 segundos apretando glúteos arriba.'
  },
  {
    id: 'act_child_pose',
    name: '8 Respiraciones en posición del niño (Child pose)',
    type: 'activator',
    category: 'Relajación miofascial',
    equipment: 'Peso corporal',
    equipmentGroup: 'bodyweight',
    targetFocus: 'Descompresión lumbar y relajación del sistema nervioso simpático.',
    description: 'Siéntate sobre los talones con brazos estirados al frente respirando hondo.'
  },
  {
    id: 'act_psoas_stretch',
    name: '6 Estiramientos dinámicos de psoas',
    type: 'activator',
    category: 'Flexores de cadera',
    equipment: 'Peso corporal',
    equipmentGroup: 'bodyweight',
    targetFocus: 'Liberación de los flexores de cadera tras periodos prolongados sentado.',
    description: 'En posición de caballero, empuja la pelvis al frente contrayendo el glúteo trasero.'
  }
];

// Helper para obtener las alternativas según el tipo de AMRAP y filtros de equipamiento
export function getFinisherAlternatives(
  amrapType: FinisherType,
  currentExerciseName?: string,
  equipmentFilter: FinisherEquipmentGroup = 'all',
  searchQuery: string = ''
): FinisherExerciseOption[] {
  let list = FINISHER_EXERCISE_BANK.filter((ex) => ex.type === amrapType);

  // Filtrar por grupo de equipamiento
  if (equipmentFilter !== 'all') {
    list = list.filter((ex) => ex.equipmentGroup === equipmentFilter);
  }

  // Filtrar por búsqueda de texto
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    list = list.filter((ex) => 
      ex.name.toLowerCase().includes(q) ||
      ex.targetFocus.toLowerCase().includes(q) ||
      ex.category.toLowerCase().includes(q) ||
      ex.equipment.toLowerCase().includes(q)
    );
  }

  // Si hay un ejercicio actual, colocarlo primero o destacarlo
  if (currentExerciseName) {
    const cleanCurrent = currentExerciseName.toLowerCase().trim();
    list.sort((a, b) => {
      const aIsCurrent = a.name.toLowerCase().trim() === cleanCurrent;
      const bIsCurrent = b.name.toLowerCase().trim() === cleanCurrent;
      if (aIsCurrent) return -1;
      if (bIsCurrent) return 1;
      return 0;
    });
  }

  return list;
}
