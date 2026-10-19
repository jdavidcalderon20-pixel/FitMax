// Base de alternativas para Hyrox y OCR adaptadas a Gimnasios Convencionales.
// Permite al atleta entrenar la demanda fisiológica real aunque su gimnasio
// no cuente con trineo, cuerda de arrastre, SkiErg o sacos específicos.

export interface StationAlternative {
  id: string;
  name: string;
  equipment: string;
  conversionFormula: string; // Equivalencia vs estación oficial
  whyItWorks: string; // Justificación biomecánica
  executionTips: string[];
}

export interface OfficialStationAlternatives {
  officialName: string;
  officialSpec: string;
  officialEquipment: string;
  alternatives: StationAlternative[];
}

export const HYROX_GYM_ALTERNATIVES: Record<string, OfficialStationAlternatives> = {
  'Sled Push': {
    officialName: 'Empuje de trineo (Sled Push)',
    officialSpec: '50 metros (152kg Open Hombres / 102kg Open Mujeres)',
    officialEquipment: 'Trineo con césped artificial',
    alternatives: [
      {
        id: 'plate_push_towel',
        name: 'Plate Push en suelo liso (Empuje de disco sobre toalla)',
        equipment: '1 o 2 discos de 20kg + Toalla sobre suelo pulido',
        conversionFormula: '4 tramos de 15m empujando los discos apoyando las manos en ellos',
        whyItWorks: 'Idéntica flexión anterior de tronco, ángulo de ataque de tobillos y demanda concéntrica de cuádriceps.',
        executionTips: [
          'Coloca una toalla en el suelo pulido del gimnasio y apila 1 o 2 discos de 20kg encima.',
          'Apoya las palmas sobre el disco superior, mantén la espalda recta a 45° y empuja con pasos cortos y potentes clavando la puntera.',
          'Respira continuo sin bloquear el diafragma.'
        ]
      },
      {
        id: 'single_leg_press_heavy',
        name: 'Prensa de piernas unilateral explosiva (Leg Press)',
        equipment: 'Máquina de Prensa a 45°',
        conversionFormula: '4 series de 12 repeticiones pesadas por pierna (pausa 1s en fondo)',
        whyItWorks: 'Aísla la fuerza unilateral de empuje de cuádriceps y glúteo sin requerir espacio para desplazarse.',
        executionTips: [
          'Coloca el pie en la parte media de la plataforma.',
          'Baja lento controlando hasta 90° de rodilla y empuja de forma explosiva con el talón y mediopié.',
          'Alterna de pierna sin descanso entre series para simular la fatiga cardiovascular del trineo.'
        ]
      },
      {
        id: 'heavy_walking_lunges',
        name: 'Zancadas cortas pesadas caminando',
        equipment: '2 Mancuernas pesadas (16kg a 24kg c/u)',
        conversionFormula: '50 metros o 50 zancadas continuas',
        whyItWorks: 'Somete los cuádriceps a máxima sobrecarga con zancada corta y cadera adelantada.',
        executionTips: [
          'Da pasos deliberadamente cortos para enfatizar la sobrecarga en el cuádriceps delantero.',
          'Mantén el torso ligeramente inclinado hacia adelante para reproducir la postura de empuje.'
        ]
      }
    ]
  },
  'Sled Pull': {
    officialName: 'Arrastre de trineo con cuerda (Sled Pull)',
    officialSpec: '50 metros (103kg Open Hombres / 78kg Open Mujeres)',
    officialEquipment: 'Trineo con cuerda de 15m',
    alternatives: [
      {
        id: 'cable_rope_seated_row',
        name: 'Remo sentado en polea baja con cuerda (Hand-over-Hand)',
        equipment: 'Polea baja + Agarre de cuerda o toalla',
        conversionFormula: '4 series de 25-30 tirones continuos a carga pesada',
        whyItWorks: 'Reproduce la tracción continua brazo por brazo, la fatiga de antebrazos y el trabajo de dorsal y bíceps.',
        executionTips: [
          'Coloca una cuerda en la polea baja.',
          'Siéntate con rodillas semiflexionadas y tira alternando las manos como si estuvieras recogiendo la soga de un trineo.',
          'Traba el core para no arquear la columna lumbar al traccionar.'
        ]
      },
      {
        id: 'heavy_tbar_row',
        name: 'Remo pesado en barra T o mancuernas simultáneas',
        equipment: 'Barra T o 2 Mancuernas pesadas',
        conversionFormula: '4 series de 15 repeticiones pesadas con pausa de 1s en contracción',
        whyItWorks: 'Fuerza isométrica de erectores espinales, glúteos e isquios mientras la espalda alta tira con carga alta.',
        executionTips: [
          'Mantén la bisagra de cadera firme a 45°.',
          'Tira con los codos pegados a las costillas apretando la espalda media.'
        ]
      },
      {
        id: 'plate_drag_towel',
        name: 'Arrastre de disco con toalla de espaldas',
        equipment: 'Discos pesados + Toalla o soga',
        conversionFormula: '4 tramos de 15m caminando hacia atrás tirando de la toalla',
        whyItWorks: 'Demanda isométrica brutal de cuádriceps (retro-walking) y fuerza de agarre.',
        executionTips: [
          'Toma los extremos de la toalla o soga atada al disco.',
          'Camina hacia atrás manteniendo la cadera baja en media sentadilla y tirando con las piernas.'
        ]
      }
    ]
  },
  'SkiErg': {
    officialName: 'Ergómetro de Esquí (SkiErg)',
    officialSpec: '1000 metros continuos',
    officialEquipment: 'Máquina Concept2 SkiErg',
    alternatives: [
      {
        id: 'straight_arm_cable_pulldown_hinge',
        name: 'Jalón dorsal en polea alta con cuerda y flexión de cadera',
        equipment: 'Polea alta doble o simple con cuerda de tríceps',
        conversionFormula: '100 repeticiones continuas divididas en 4 bloques de 25 con 15s de pausa',
        whyItWorks: 'El patrón biomecánico exacto del SkiErg: extensión de hombros + flexión de cadera y activación de tríceps y recto abdominal.',
        executionTips: [
          'Fija la polea en el punto más alto.',
          'Agarra la cuerda, inclina el tronco en bisagra de cadera mientras llevas los brazos abajo hasta las caderas.',
          'Regresa los brazos arriba estirando el dorsal y repite a ritmo ágil y constante.'
        ]
      },
      {
        id: 'kettlebell_swings_continuous',
        name: 'Kettlebell Swings continuos a ritmo de carrera',
        equipment: 'Kettlebell o mancuerna (16kg a 24kg)',
        conversionFormula: '4 series de 25 reps con 20s de descanso o 80-100 swings totales',
        whyItWorks: 'Genera el mismo consumo de oxígeno (VO2) y demanda rítmica de cadera y tren superior.',
        executionTips: [
          'Empuja desde las caderas apretando glúteos al subir.',
          'Mantén los brazos relajados actuando como ganchos.'
        ]
      },
      {
        id: 'airbike_sprints',
        name: 'Airbike / Assault Bike o Bici estática a alta cadencia',
        equipment: 'Bicicleta estática o AirBike',
        conversionFormula: '3 a 4 minutos a 80-85% FCmáx',
        whyItWorks: 'Desgaste metabólico idéntico sin impacto en articulaciones.',
        executionTips: [
          'Si es AirBike, usa tanto brazos como piernas para involucrar el tren superior.'
        ]
      }
    ]
  },
  'Rowing': {
    officialName: 'Remo ergómetro (Rowing)',
    officialSpec: '1000 metros continuos (Concept2)',
    officialEquipment: 'Remo Concept2 Indoor Rower',
    alternatives: [
      {
        id: 'incline_treadmill_power_walk',
        name: 'Cinta de correr con inclinación máxima (12% a 15%)',
        equipment: 'Cinta de correr convencional',
        conversionFormula: '4 a 5 minutos a 5.5 - 6.0 km/h con inclinación al 12-15%',
        whyItWorks: 'Misma fatiga de cadena posterior, gemelos y demanda aeróbica sostenida.',
        executionTips: [
          'No te sostengas de las barandas; bracea con energía.',
          'Inclina el torso ligeramente hacia la pendiente.'
        ]
      },
      {
        id: 'smith_machine_inverted_rows',
        name: 'Remo invertido en multipower (Smith Machine)',
        equipment: 'Máquina Smith o barra fija a altura de cadera',
        conversionFormula: '4 series de 15 reps + 400m de trote suave entre series',
        whyItWorks: 'Tracción de espalda y bíceps con el peso corporal.',
        executionTips: [
          'Cuerpo rígido en línea recta talones apoyados en el suelo.',
          'Lleva el pecho a la barra apretando escápulas.'
        ]
      }
    ]
  },
  'Farmers Carry': {
    officialName: 'Paseo del granjero (Farmers Carry)',
    officialSpec: '200 metros (2×24kg Open Hombres / 2×16kg Open Mujeres)',
    officialEquipment: 'Kettlebells oficiales o asas de Farmers',
    alternatives: [
      {
        id: 'dumbbell_farmers_walk',
        name: 'Paseo con mancuernas pesadas del gimnasio',
        equipment: '2 Mancuernas pesadas (20kg a 26kg c/u)',
        conversionFormula: '200 metros (o 4 vueltas de 50m en el pasillo del gimnasio)',
        whyItWorks: 'Disponibles en cualquier gimnasio; mismo estímulo de trapecios, antebrazos y core.',
        executionTips: [
          'Hombros abajo y atrás, mirada al frente.',
          'Pasos cortos y controlados sin balancear las mancuernas.'
        ]
      },
      {
        id: 'static_farmer_hold_marching',
        name: 'Marcha estática con mancuernas (Marching in Place)',
        equipment: '2 Mancuernas pesadas (20-24kg c/u)',
        conversionFormula: '90 a 120 segundos de marcha levantando rodillas en el sitio',
        whyItWorks: 'Ideal si el gimnasio está lleno y no hay pasillo libre para caminar.',
        executionTips: [
          'Sostén las mancuernas y marcha en el sitio subiendo las rodillas a 90°.',
          'Evita inclinarte a los lados.'
        ]
      }
    ]
  },
  'Sandbag Lunges': {
    officialName: 'Zancadas con saco de arena (Sandbag Lunges)',
    officialSpec: '100 metros (20kg Open Hombres / 10kg Open Mujeres)',
    officialEquipment: 'Saco de arena en la espalda',
    alternatives: [
      {
        id: 'barbell_walking_lunges',
        name: 'Zancadas caminando con barra sobre la espalda',
        equipment: 'Barra olímpica o barra preolímpica (20kg a 30kg)',
        conversionFormula: '80 a 100 zancadas totales o 4 series de 25 pasos',
        whyItWorks: 'Misma colocación de la carga en el centro de masa de la espalda alta.',
        executionTips: [
          'Apoya la barra en los trapecios (barra alta).',
          'La rodilla trasera roza suavemente el suelo sin golpear.'
        ]
      },
      {
        id: 'dumbbell_suitcase_lunges',
        name: 'Zancadas con 2 mancuernas a los lados',
        equipment: '2 Mancuernas (10kg a 14kg c/u)',
        conversionFormula: '4 tramos de 20-25 zancadas',
        whyItWorks: 'Disponible universalmente en cualquier gimnasio.',
        executionTips: [
          'Pecho erguido, sin encorvar la espalda alta.'
        ]
      },
      {
        id: 'bumper_plate_bear_hug_lunges',
        name: 'Zancadas con disco abrazado al pecho (Bear Hug)',
        equipment: '1 Disco de 20kg (o 15kg)',
        conversionFormula: '4 tramos de 20 zancadas',
        whyItWorks: 'Obliga al core y a la espalda torácica a mantenerse erguidos exactamente igual que el saco.',
        executionTips: [
          'Abraza el disco contra el esternón con ambos brazos.',
          'Respira rítmico en cada zancada.'
        ]
      }
    ]
  },
  'Wall Balls': {
    officialName: 'Lanzamientos de balón a la pared (Wall Balls)',
    officialSpec: '100 repeticiones (6kg a 3m Open H / 4kg a 2.7m Open M)',
    officialEquipment: 'Balón medicinal blando + Diana a 3 metros',
    alternatives: [
      {
        id: 'dumbbell_thrusters',
        name: 'Thrusters con mancuernas (Sentadilla + Press simultáneo)',
        equipment: '2 Mancuernas ligeras (6kg a 10kg c/u)',
        conversionFormula: '70 a 80 repeticiones (en series de 15-20 con 15s de pausa)',
        whyItWorks: 'La misma cadena cinética de extensión explosiva de piernas transferida a empuje de hombros.',
        executionTips: [
          'Baja en sentadilla completa con las mancuernas a los hombros.',
          'Sube con aceleración y usa el impulso de las piernas para empujar las mancuernas arriba.',
          'Une la bajada con la siguiente sentadilla de forma fluida.'
        ]
      },
      {
        id: 'goblet_squat_jump_press',
        name: 'Goblet Squat explosivo con salto corto o elevación a press',
        equipment: '1 Mancuerna o Kettlebell de 10-14kg',
        conversionFormula: '4 series de 20 repeticiones a ritmo continuo',
        whyItWorks: 'Máxima demanda cardíaca de tren inferior sin necesitar pared ni techo alto.',
        executionTips: [
          'Sujeta la mancuerna al pecho en copa.',
          'Baja en sentadilla y sal con potencia despegando talones o dando un micro-salto.'
        ]
      }
    ]
  },
  'Burpee Broad Jumps': {
    officialName: 'Burpees con salto largo (Burpee Broad Jumps)',
    officialSpec: '80 metros continuos',
    officialEquipment: 'Pasillo despejado de 20 metros',
    alternatives: [
      {
        id: 'standard_burpee_tuck_jump',
        name: 'Burpee al suelo + Salto vertical alto (sin avanzar)',
        equipment: 'Espacio de 2×1 metros (esterilla)',
        conversionFormula: '4 series de 15 burpees continuos con 30s de descanso',
        whyItWorks: 'Permite entrenar la flexión torácica al suelo y la potencia explosiva de cadera en espacios reducidos.',
        executionTips: [
          'Pecho y muslos tocan el suelo por completo.',
          'Al incorporarte, salta llevando las rodillas arriba en salto vertical sin necesidad de desplazarte.'
        ]
      },
      {
        id: 'burpee_box_stepup',
        name: 'Burpee al suelo + Step-up explosivo a banco/cajón',
        equipment: '1 Banco o cajón plano',
        conversionFormula: '50 repeticiones alternando la pierna que sube',
        whyItWorks: 'Recluta glúteos y cuádriceps de forma unilateral tras el pecho a tierra.',
        executionTips: [
          'Haz el burpee en el suelo frente al banco.',
          'Pisa firme con todo el pie en el banco y extiende la cadera completa arriba.'
        ]
      }
    ]
  }
};

// ==========================================
// ADAPTACIONES DE OCR PARA GIMNASIOS CONVENCIONALES
// ==========================================

export interface OcrGymAdaptation {
  title: string;
  focus: string;
  howToInNormalGym: string;
  secretTrick: string;
}

export const OCR_CONVENTIONAL_GYM_GUIDE: OcrGymAdaptation[] = [
  {
    title: 'Towel Hang (Toalla sobre barra de dominadas)',
    focus: 'Fuerza de cuerda y suspensión vertical (Cuerdas de Spartan y Rigs)',
    howToInNormalGym: 'Toma tu toalla de entrenamiento, pásala por encima de cualquier barra de dominadas del gimnasio. Agarra un extremo con cada mano y suspéndete en el aire.',
    secretTrick: '¡Cero equipo especial! Entrena exactamente el agarre cilíndrico de cuerda y elimina los resbalones en carrera.'
  },
  {
    title: 'Pinch Grip con Discos (Agarre en Pinza)',
    focus: 'Tendones flexores de los dedos y agarre de muros y bordes',
    howToInNormalGym: 'Toma dos discos de 5kg o 10kg de fundición, júntalos cara a cara con la parte lisa hacia afuera, y sostenlos con las yemas de los dedos mientras caminas o te quedas quieto.',
    secretTrick: 'Obliga a los dedos a trabajar sin apoyarse en la palma, fortaleciendo los tendones profundos de la mano.'
  },
  {
    title: 'Fat Gripz Casero (Barra gruesa con toalla envuelta)',
    focus: 'Adaptación a tubos anchos y obstáculos de gran diámetro',
    howToInNormalGym: 'Enrolla tu toalla firmemente alrededor de la barra de dominadas o las mancuernas para duplicar su grosor antes de hacer dominadas o paseos de granjero.',
    secretTrick: 'A mayor diámetro de agarre, el antebrazo debe reclutar un 200% más de fibras motoras.'
  },
  {
    title: 'Monkey Bar Drills en Torre de Poleas o Jaula',
    focus: 'Transición dinámica mano a mano',
    howToInNormalGym: 'En la jaula de potencia o la barra transversal de poleas cruzadas, cuélgate y avanza de lado a lado soltando y agarrando una mano a la vez.',
    secretTrick: 'Entrena la estabilización escapular dinámica cuando todo el peso corporal queda soportado en un solo brazo durante la transición.'
  }
];

export function findStationAlternatives(stationName: string): OfficialStationAlternatives | null {
  if (!stationName) return null;
  const clean = stationName.trim().toLowerCase();

  for (const [key, val] of Object.entries(HYROX_GYM_ALTERNATIVES)) {
    if (clean.includes(key.toLowerCase()) || val.officialName.toLowerCase().includes(clean)) {
      return val;
    }
  }
  return null;
}
