import { describe, it, expect } from 'vitest';
import { findExerciseDetail } from './exerciseBank';

describe('findExerciseDetail - Verificación estricta de técnica y fotos reales', () => {
  it('identifica correctamente el press de hombros y NO lo confunde con press plano de pecho', () => {
    const res = findExerciseDetail('Press de hombros en máquina sentado');
    expect(res.muscleGroup).toBe('Hombros');
    expect(res.pattern).toBe('Empuje vertical');
    expect(res.demoImages).toBeDefined();
    expect(res.demoImages?.[0]).toContain('.jpg');
  });

  it('identifica correctamente el press militar con mancuernas sentado', () => {
    const res = findExerciseDetail('Press militar con mancuernas sentado');
    expect(res.muscleGroup).toBe('Hombros');
    expect(res.pattern).toBe('Empuje vertical');
    expect(res.name).toBe('Press militar con mancuernas sentado');
  });

  it('descompone correctamente la superserie de bíceps y tríceps sin caer en press plano', () => {
    const res = findExerciseDetail('Curl martillo con mancuernas + Extensión de tríceps copa');
    expect(res.muscleGroup).toBe('Brazos');
    expect(res.name).toContain('Curl martillo');
    expect(res.name).toContain('Extensión de tríceps');
    expect(res.steps.length).toBeGreaterThan(2);
    expect(res.demoImages).toBeDefined();
    expect(res.demoImages?.length).toBe(2);
  });

  it('identifica remos de espalda correctamente', () => {
    const res = findExerciseDetail('Remo con mancuernas apoyado en banco');
    expect(res.muscleGroup).toBe('Espalda');
    expect(res.pattern).toBe('Tracción horizontal');
    expect(res.demoImages).toBeDefined();
  });

  it('identifica sentadillas y variantes de pierna correctamente', () => {
    const res = findExerciseDetail('Sentadilla búlgara (enfoque cuádriceps)');
    expect(res.muscleGroup).toBe('Cuádriceps');
    expect(res.pattern).toBe('Dominante rodilla');
    expect(res.demoImages).toBeDefined();
  });

  it('identifica hip thrust y variantes de glúteo correctamente', () => {
    const res = findExerciseDetail('Hip Thrust con barra (pausa de 2s arriba)');
    expect(res.muscleGroup).toBe('Glúteos');
    expect(res.pattern).toBe('Dominante cadera');
    expect(res.demoImages).toBeDefined();
  });

  it('identifica el press de banca plano de pecho correctamente', () => {
    const res = findExerciseDetail('Press plano con mancuernas');
    expect(res.muscleGroup).toBe('Pecho');
    expect(res.pattern).toBe('Empuje horizontal');
    expect(res.demoImages).toBeDefined();
  });

  it('identifica correctamente la elevación de talones / gemelos y NUNCA lo confunde con hombros', () => {
    const res = findExerciseDetail('Elevación de talones de pie pesada en máquina');
    expect(res.muscleGroup).not.toBe('Hombros');
    expect(res.muscleGroup).toBe('Isquios y Glúteo');
    expect(res.demoImages).toBeDefined();
    expect(res.demoImages?.[0]).toContain('Standing_Calf_Raises');
    expect(res.steps.some(s => s.toLowerCase().includes('talon') || s.toLowerCase().includes('talón'))).toBe(true);
  });

  it('identifica elevaciones laterales de hombros correctamente', () => {
    const res = findExerciseDetail('Elevación lateral con mancuernas');
    expect(res.muscleGroup).toBe('Hombros');
    expect(res.demoImages?.[0]).toContain('Lateral_Raise');
  });

  it('diferencia estrictamente el Remo Meadows con barra del Remo Pendlay con barra', () => {
    const meadows = findExerciseDetail('Remo Meadows con barra');
    const pendlay = findExerciseDetail('Remo Pendlay con barra (pesado)');
    const barbell = findExerciseDetail('Remo con barra inclinado');

    // Remo Meadows debe ser unilateral en landmine con fotos de One-Arm Long Bar Row
    expect(meadows.muscleGroup).toBe('Espalda');
    expect(meadows.demoImages).toBeDefined();
    expect(meadows.demoImages?.[0]).toContain('One-Arm_Long_Bar_Row');
    expect(meadows.steps.some((s) => /landmine|perpendicular|escalonada|manga|meadows/i.test(s))).toBe(true);

    // Remo Pendlay debe ser con barra desde el piso (dead stop a 90 grados)
    expect(pendlay.muscleGroup).toBe('Espalda');
    expect(pendlay.demoImages).toBeDefined();
    expect(pendlay.demoImages?.[0]).toContain('Barbell_Rear_Delt_Row');
    expect(pendlay.steps.some((s) => /dead stop|suelo|horizontal|piso|90°|90 grados/i.test(s))).toBe(true);

    // Las referencias de imagen NO deben ser iguales entre Meadows y Pendlay
    expect(meadows.demoImages?.[0]).not.toEqual(pendlay.demoImages?.[0]);
    expect(meadows.targetFocus).not.toEqual(pendlay.targetFocus);
    expect(meadows.steps[0]).not.toEqual(pendlay.steps[0]);
  });

  it('asigna la imagen de Split Squat con mancuernas a la Sentadilla búlgara con mancuernas pesadas', () => {
    const res = findExerciseDetail('Sentadilla búlgara con mancuernas pesadas');
    expect(res.muscleGroup).toBe('Cuádriceps');
    expect(res.equipment).toBe('Mancuernas');
    expect(res.demoImages).toBeDefined();
    expect(res.demoImages?.[0]).toContain('Split_Squat_with_Dumbbells');
    expect(res.demoImages?.[0]).not.toContain('Barbell_Full_Squat');
  });

  it('asigna la imagen de Hack Squat a la Sentadilla Hack enfocada en cuádriceps', () => {
    const res = findExerciseDetail('Sentadilla Hack enfocada en cuádriceps');
    expect(res.muscleGroup).toBe('Cuádriceps');
    expect(res.equipment).toBe('Máquina');
    expect(res.demoImages).toBeDefined();
    expect(res.demoImages?.[0]).toContain('Hack_Squat');
  });

  it('diferencia el Curl femoral sentado del Curl femoral acostado con imagen Seated_Leg_Curl', () => {
    const seated = findExerciseDetail('Curl femoral sentado con pausa abajo (congestión máxima)');
    const lying = findExerciseDetail('Curl femoral tumbado en máquina');

    expect(seated.muscleGroup).toBe('Isquios y Glúteo');
    expect(seated.equipment).toBe('Máquina');
    expect(seated.demoImages).toBeDefined();
    expect(seated.demoImages?.[0]).toContain('Seated_Leg_Curl');
    expect(seated.demoImages?.[0]).not.toContain('Lying_Leg_Curls');

    expect(lying.demoImages?.[0]).toContain('Lying_Leg_Curls');
  });

  it('asigna Cable_Crunch a las Abdominales en polea alta y NO la rueda abdominal', () => {
    const res = findExerciseDetail('Abdominales en polea alta (Cable crunches)');
    expect(res.muscleGroup).toBe('Core');
    expect(res.equipment).toBe('Polea');
    expect(res.demoImages).toBeDefined();
    expect(res.demoImages?.[0]).toContain('Cable_Crunch');
    expect(res.demoImages?.[0]).not.toContain('Ab_Roller');
  });

  it('asigna correctamente Front_Plate_Raise a Elevaciones frontales de disco y NO press de hombros', () => {
    const res = findExerciseDetail('15 Elevaciones frontales de disco');
    expect(res.muscleGroup).toBe('Hombros');
    expect(res.pattern).toBe('Aislamiento');
    expect(res.demoImages).toBeDefined();
    expect(res.demoImages?.[0]).toContain('Front_Plate_Raise');
    expect(res.demoImages?.[0]).not.toContain('Seated_Dumbbell_Press');
    expect(res.targetFocus).toContain('Deltoides anterior');
    expect(res.steps.some(s => /disco|mancuerna|pecho|ojos/i.test(s))).toBe(true);
  });

  it('ordena adecuadamente las imágenes del Press militar sentado (1.jpg inicio a la altura de hombros, 0.jpg contracción arriba)', () => {
    const res = findExerciseDetail('Press militar con mancuernas sentado');
    expect(res.demoImages).toBeDefined();
    expect(res.demoImages?.[0]).toContain('Seated_Dumbbell_Press/1.jpg');
    expect(res.demoImages?.[1]).toContain('Seated_Dumbbell_Press/0.jpg');
  });

  it('identifica correctamente las caminatas de oso (Bear crawls) como Core y no como hombro o pecho', () => {
    const res = findExerciseDetail('10 Caminatas de oso (Bear crawls)');
    expect(res.muscleGroup).toBe('Core');
    expect(res.steps.some(s => /cuadrupedia|rodillas|gateo/i.test(s))).toBe(true);
  });

  it('asigna imágenes de Russian_Twist a los giros rusos', () => {
    const res = findExerciseDetail('20 Giros rusos (Russian twists)');
    expect(res.muscleGroup).toBe('Core');
    expect(res.demoImages?.[0]).toContain('Russian_Twist');
  });

  describe('Validación estricta de los 31 ejercicios corregidos (sin desajustes ni fotos faltantes)', () => {
    const verifiedExercises = [
      { name: 'Abducción de cadera en máquina (Glúteo Medio)', image: 'Thigh_Abductor', group: 'Glúteos' },
      { name: 'Extensiones de tríceps en polea con cuerda', image: 'Triceps_Pushdown_-_Rope_Attachment', group: 'Brazos' },
      { name: 'Press de banca con pausa de 2s abajo', image: 'Barbell_Bench_Press_-_Medium_Grip', group: 'Pecho' },
      { name: 'Sentadilla copa (Goblet Squat)', image: 'Goblet_Squat', group: 'Cuádriceps' },
      { name: 'Sentadilla trasera con barra (Back Squat)', image: 'Barbell_Full_Squat', group: 'Cuádriceps' },
      { name: 'Sentadilla frontal con barra (Front Squat)', image: 'Front_Barbell_Squat', group: 'Cuádriceps' },
      { name: 'Extensiones de cuádriceps en máquina', image: 'Leg_Extensions', group: 'Cuádriceps' },
      { name: 'Sentadilla sissy (inclinando el cuerpo hacia atrás)', image: 'Weighted_Sissy_Squat', group: 'Cuádriceps' },
      { name: 'Empuje de cadera con barra (Hip thrust)', image: 'Barbell_Hip_Thrust', group: 'Glúteos' },
      { name: 'Empuje de cadera con barra y pausa', image: 'Barbell_Hip_Thrust', group: 'Glúteos' },
      { name: 'Patada de glúteo en polea a 30° (Cable Kickback)', image: 'One-Legged_Cable_Kickback', group: 'Glúteos' },
      { name: 'Elevación de talones sentado en máquina', image: 'Seated_Calf_Raise', group: 'Isquios y Glúteo' },
      { name: 'Remo Pendlay (remo desde el suelo)', image: 'Barbell_Rear_Delt_Row', group: 'Espalda' },
      { name: 'Remo en barra T', image: 'Lying_T-Bar_Row', group: 'Espalda' },
      { name: 'Press militar con barra de pie (Overhead Press)', image: 'Standing_Military_Press', group: 'Hombros' },
      { name: 'SkiErg (máquina de esquí)', image: 'Rope_Straight-Arm_Pulldown', group: 'Cardio y Metabólico' },
      { name: 'Empuje de trineo (Sled push)', image: 'Sled_Push', group: 'Cuádriceps' },
      { name: 'Arrastre de trineo (Sled pull)', image: 'Sled_Drag_-_Harness', group: 'Espalda' },
      { name: 'Burpee con salto largo (Burpee broad jumps)', image: 'Standing_Long_Jump', group: 'Cardio y Metabólico' },
      { name: 'Remo en máquina (Rowing)', image: 'Rowing_Stationary', group: 'Cardio y Metabólico' },
      { name: 'Paseo del granjero (Farmers carry)', image: 'Farmers_Walk', group: 'Cardio y Metabólico' },
      { name: 'Zancadas con saco (Sandbag lunges)', image: 'Barbell_Walking_Lunge', group: 'Cuádriceps' },
      { name: 'Lanzamientos de balón a la pared (Wall balls)', image: 'Catch_and_Overhead_Throw', group: 'Cardio y Metabólico' },
      { name: 'Correr con piernas cansadas (Compromised running)', image: 'Running_Treadmill', group: 'Cardio y Metabólico' },
      { name: 'Transporte de saco o balde (Sandbag / bucket carry)', image: 'Rickshaw_Carry', group: 'Cardio y Metabólico' },
      { name: 'Colgado en barra (Dead hang pasivo y activo)', image: 'Scapular_Pull-Up', group: 'Espalda' },
      { name: 'Towel Hang (Toalla sobre barra)', image: 'Scapular_Pull-Up', group: 'Espalda' },
      { name: 'Pinch Grip Carry (Pellizco con discos)', image: 'Farmers_Walk', group: 'Brazos' },
      { name: 'Transiciones de Barra / Monkey Bar Drills', image: 'Band_Assisted_Pull-Up', group: 'Espalda' },
      { name: 'Face pull en polea con cuerda', image: 'Face_Pull', group: 'Hombros' },
      { name: 'Puente de glúteos en suelo con peso', image: 'Barbell_Glute_Bridge', group: 'Glúteos' }
    ];

    verifiedExercises.forEach(({ name, image, group }) => {
      it(`asigna imagen técnica precisa (${image}) y grupo (${group}) a "${name}"`, () => {
        const res = findExerciseDetail(name);
        expect(res.muscleGroup).toBe(group);
        expect(res.demoImages).toBeDefined();
        expect(res.demoImages?.length).toBe(2);
        expect(res.demoImages?.[0]).toContain(image);
        expect(res.demoImages?.[1]).toContain(image);
      });
    });
  });
});

