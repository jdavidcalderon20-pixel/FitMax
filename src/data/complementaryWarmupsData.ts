// Módulos complementarios de calentamiento, fuerza y prevención
// Nombrados con títulos 100% claros y amigables para cualquier principiante.

export interface WarmupBlock {
  code: string;                  // Identificador interno (ej. C1, C2)
  friendlyTitle: string;         // Nombre claro para la pantalla
  subtitle: string;              // Descripción sencilla
  durationMin: number;           // Minutos estimados
  target: string;                // Para qué sirve
  steps: Array<{
    name: string;
    detail: string;
    repsOrDuration: string;
  }>;
}

export const COMPLEMENTARY_MODULES: WarmupBlock[] = [
  {
    code: 'C1',
    friendlyTitle: 'Calentamiento Articular Dinámico',
    subtitle: 'Prepara tus articulaciones y sube las pulsaciones antes de entrenar',
    durationMin: 8,
    target: 'Lubricar rodillas, caderas, hombros y elevar temperatura corporal',
    steps: [
      { name: 'Trote suave o rebote en el sitio', detail: 'Aumenta el flujo sanguíneo de forma progresiva.', repsOrDuration: '3 minutos' },
      { name: 'Círculos suaves de cadera y tobillos', detail: 'Movilidad articular circular sin tirones.', repsOrDuration: '10 giros por lado' },
      { name: 'Balanceo de piernas frontal y lateral', detail: 'Sujétate de una pared y balancea la pierna como un péndulo.', repsOrDuration: '10 por pierna' },
      { name: 'Zancada caminando con giro de torso', detail: 'Abre la cadera y activa la zona media.', repsOrDuration: '8 por pierna' },
      { name: 'Sentadillas al aire controladas', detail: 'Profundidad cómoda para calentar cuádriceps y glúteos.', repsOrDuration: '10 repeticiones' }
    ]
  },
  {
    code: 'C2',
    friendlyTitle: 'Técnica y Zancada de Carrera (Drills)',
    subtitle: 'Mejora la postura y reactividad de tus pies para correr más rápido y ligero',
    durationMin: 6,
    target: 'Economía de carrera, cadencia y pisada eficiente',
    steps: [
      { name: 'Skipping A (Rodillas arriba con braceo)', detail: 'Contacto rápido de metatarso con el suelo.', repsOrDuration: '2 series de 20 metros' },
      { name: 'Skipping B (Extensión y zarpazo)', detail: 'Extiende suavemente la pierna y barre el suelo hacia atrás.', repsOrDuration: '2 series de 20 metros' },
      { name: 'Talones al glúteo dinámicos', detail: 'Movimiento rápido sin inclinar el torso hacia adelante.', repsOrDuration: '2 series de 20 metros' },
      { name: 'Impulso y zancada con salto (Bouncing)', detail: 'Busca elasticidad en cada despegue.', repsOrDuration: '2 series de 20 metros' }
    ]
  },
  {
    code: 'C3',
    friendlyTitle: 'Fuerza Articular Protectora para Corredores',
    subtitle: 'Fortalece rodillas, caderas y tobillos para resistir miles de impactos',
    durationMin: 35,
    target: 'Blindar el cuerpo contra sobrecargas y fascitis plantar',
    steps: [
      { name: 'Sentadilla Goblet con mancuerna', detail: 'Baja con control y sube con fuerza de talones.', repsOrDuration: '3 series de 10 reps' },
      { name: 'Peso muerto rumano con mancuernas', detail: 'Siente el estiramiento en la parte trasera del muslo.', repsOrDuration: '3 series de 8 reps' },
      { name: 'Zancada búlgara (pie elevado atrás)', detail: 'Estabilidad extrema para glúteo y rodilla.', repsOrDuration: '3 series de 8 por pierna' },
      { name: 'Puente de glúteo a una pierna', detail: 'Previene el balanceo de pelvis en carrera.', repsOrDuration: '3 series de 12 por pierna' },
      { name: 'Elevación de talones de pie (Gemelos)', detail: 'Pausa de 2 segundos abajo para cuidar el tendón de Aquiles.', repsOrDuration: '3 series de 15 reps' },
      { name: 'Saltos bajos a cajón o escalón', detail: 'Aterriza suave como un felino.', repsOrDuration: '3 series de 5 reps' }
    ]
  },
  {
    code: 'C4',
    friendlyTitle: 'Abdomen Fuerte y Estable (Core)',
    subtitle: 'El cinturón natural que protege tu columna lumbar de dolores y fatiga',
    durationMin: 10,
    target: 'Estabilidad de columna y postura recta al correr y levantar peso',
    steps: [
      { name: 'Plancha frontal en antebrazos', detail: 'Cuerpo recto como tabla, aprieta glúteos fuertemente.', repsOrDuration: '3 series de 40 seg' },
      { name: 'Plancha lateral', detail: 'Activa oblicuos y cadera lateral.', repsOrDuration: '3 series de 30 seg por lado' },
      { name: 'Bicho muerto (Dead Bug)', detail: 'Espalda baja 100% pegada al suelo mientras mueves brazos y piernas.', repsOrDuration: '3 series de 10 reps' },
      { name: 'Pájaro perro (Bird Dog)', detail: 'En 4 apoyos, estira brazo y pierna contraria sin torcer la cadera.', repsOrDuration: '3 series de 10 por lado' }
    ]
  },
  {
    code: 'C5',
    friendlyTitle: 'Movilidad y Vuelta a la Calma',
    subtitle: 'Estiramientos suaves para relajar la musculatura y bajar el ritmo cardíaco',
    durationMin: 8,
    target: 'Recuperación muscular y descanso reparador',
    steps: [
      { name: 'Estiramiento de flexor de cadera (Psoas)', detail: 'Zancada en el suelo llevando la pelvis suave al frente.', repsOrDuration: '30 seg por pierna' },
      { name: 'Estiramiento de isquiotibiales suave', detail: 'Sin rebotar, respirando hondo.', repsOrDuration: '30 seg por pierna' },
      { name: 'Estiramiento de glúteos en figura 4', detail: 'Tumbado boca arriba cruzando el tobillo sobre la rodilla opuesta.', repsOrDuration: '30 seg por pierna' },
      { name: 'Rotación de columna torácica', detail: 'Abre el pecho y exhala despacio.', repsOrDuration: '8 por lado' }
    ]
  },
  {
    code: 'C6',
    friendlyTitle: 'Cuidado y Prevención de Tobillo y Pie',
    subtitle: 'Refuerza los pequeños músculos del pie que absorben cada zancada',
    durationMin: 4,
    target: 'Prevenir torceduras, periostitis tibial y fascitis plantar',
    steps: [
      { name: 'Caminata en puntas de pie', detail: 'Tronco erguido, pasos cortos.', repsOrDuration: '20 metros' },
      { name: 'Caminata en talones (dedos arriba)', detail: 'Activa el músculo tibial anterior.', repsOrDuration: '20 metros' },
      { name: 'Equilibrio a una pierna descalzo', detail: 'Siente cómo los dedos del pie se agarran al suelo.', repsOrDuration: '30 seg por pie' },
      { name: 'Garra de dedos (recoger toalla imaginaria)', detail: 'Flexiona los dedos del pie con fuerza.', repsOrDuration: '15 repeticiones' }
    ]
  }
];

export function getWarmupByCode(code: string): WarmupBlock | undefined {
  return COMPLEMENTARY_MODULES.find(m => m.code.toUpperCase() === code.toUpperCase());
}
