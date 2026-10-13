// Chequeo de Salud y Seguridad Deportiva (Basado en el estándar internacional PAR-Q+)
// Adaptado a lenguaje 100% amigable, claro y sin tecnicismos para cualquier atleta.

export interface HealthQuestion {
  id: string;
  question: string;
  explanation: string;
}

export const HEALTH_SAFETY_QUESTIONS: HealthQuestion[] = [
  {
    id: 'corazon',
    question: '¿Alguna vez un médico te ha dicho que tienes alguna afección cardíaca o del corazón?',
    explanation: 'Nos ayuda a recomendarte intensidades aeróbicas seguras y controladas.'
  },
  {
    id: 'pecho_dolor',
    question: '¿Sientes dolor u opresión en el pecho cuando realizas actividad física?',
    explanation: 'La seguridad cardiovascular siempre es la prioridad número uno.'
  },
  {
    id: 'pecho_reposo',
    question: 'En el último mes, ¿has sentido dolor en el pecho cuando estabas descansando o sin hacer esfuerzo?',
    explanation: 'Para garantizar que estés apto antes de realizar intervalos de alta intensidad.'
  },
  {
    id: 'mareos',
    question: '¿Pierdes el equilibrio con frecuencia debido a mareos o has perdido el conocimiento recientemente?',
    explanation: 'Evita caídas o accidentes en ejercicios de levantamiento o cinta de correr.'
  },
  {
    id: 'articulaciones',
    question: '¿Tienes algún problema en huesos, rodillas, columna o articulaciones que pueda empeorar con el ejercicio?',
    explanation: 'Así te sugeriremos ejercicios con menor impacto articular (por ejemplo, prensa o elíptica en vez de saltos).'
  },
  {
    id: 'medicamentos',
    question: '¿Tomas medicamentos recetados para la presión arterial o problemas del corazón?',
    explanation: 'Permite calibrar las zonas de frecuencia cardíaca de forma realista.'
  },
  {
    id: 'otra_razon',
    question: '¿Conoces alguna otra razón médica por la cual no deberías realizar actividad física vigorosa?',
    explanation: 'Queremos que tu experiencia en FitMax sea siempre saludable y sostenible en el tiempo.'
  }
];

export const MEDICAL_DISCLAIMER = {
  title: 'Entrena con Responsabilidad y Seguridad',
  badge: 'Cuidado Preventivo',
  summary: 'FitMax es una herramienta de entrenamiento inteligente y planificación deportiva basada en ciencia, pero no sustituye la valoración médica profesional. Si respondiste "Sí" a alguna pregunta o tienes dudas sobre tu estado físico, te recomendamos consultar con un médico deportólogo antes de iniciar entrenamientos de alta intensidad.',
  emergencyNote: 'Si en algún momento durante un entrenamiento sientes dolor en el pecho, mareo intenso o falta de aire inusual, detén la sesión de inmediato y descansa.'
};
