import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getCustomExercises, saveCustomExercise, deleteCustomExercise } from './customExercises';
import {
  getCustomRoutines,
  saveCustomRoutine,
  deleteCustomRoutine,
  sendRoutineFromCoach,
  getCoachAssignedRoutines,
  acceptCoachRoutineAssignment,
} from './customRoutines';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('customExercises - Gestión de ejercicios propios del atleta', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('guarda y recupera un ejercicio personalizado', () => {
    const ex = saveCustomExercise('atleta1', {
      name: 'Press Declinado con Mancuernas',
      muscleGroup: 'Pecho',
      pattern: 'Empuje horizontal',
      equipment: 'Mancuernas',
      techniqueCues: 'Controlar el descenso y enfocar el pectoral inferior.',
    });

    expect(ex.id).toBeDefined();
    expect(ex.name).toBe('Press Declinado con Mancuernas');
    expect(ex.muscleGroup).toBe('Pecho');

    const list = getCustomExercises('atleta1');
    expect(list.length).toBe(1);
    expect(list[0].name).toBe('Press Declinado con Mancuernas');
    expect(list[0].steps[0]).toContain('Controlar el descenso');
  });

  it('elimina un ejercicio personalizado correctamente', () => {
    const ex = saveCustomExercise('atleta1', {
      name: 'Fondos con Lastre',
      muscleGroup: 'Pecho',
      pattern: 'Empuje vertical',
      equipment: 'Peso corporal',
    });

    expect(getCustomExercises('atleta1').length).toBe(1);
    deleteCustomExercise('atleta1', ex.id);
    expect(getCustomExercises('atleta1').length).toBe(0);
  });
});

describe('customRoutines - Gestión de rutinas estructuradas personalizadas', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('crea, persiste y recupera una rutina personalizada con días y ejercicios', () => {
    const routine = saveCustomRoutine('atleta1', {
      name: 'Torso Pierna Especial',
      description: 'Foco en hipertrofia y fuerza',
      targetWeeks: 4,
      days: [
        {
          id: 1,
          name: 'Día 1: Torso Pesado',
          subtitle: 'Pecho y Espalda',
          exercises: [
            {
              id: 'ex-1',
              name: 'Press de banca plano con barra',
              category: 'Pecho',
              defaultSets: 4,
              defaultReps: '6-8',
              restSeconds: 120,
            },
          ],
        },
      ],
    });

    expect(routine.id).toBeDefined();
    expect(routine.name).toBe('Torso Pierna Especial');

    const routines = getCustomRoutines('atleta1');
    expect(routines.length).toBe(1);
    expect(routines[0].days[0].exercises[0].name).toBe('Press de banca plano con barra');
    expect(routines[0].days[0].exercises[0].defaultSets).toBe(4);
  });

  it('elimina una rutina personalizada sin afectar las demás', () => {
    const r1 = saveCustomRoutine('atleta1', {
      name: 'Rutina A',
      targetWeeks: 2,
      days: [],
    });

    const r2 = saveCustomRoutine('atleta1', {
      name: 'Rutina B',
      targetWeeks: 2,
      days: [],
    });

    expect(getCustomRoutines('atleta1').length).toBe(2);
    deleteCustomRoutine('atleta1', r1.id);
    const after = getCustomRoutines('atleta1');
    expect(after.length).toBe(1);
    expect(after[0].id).toBe(r2.id);
  });

  it('envía una rutina en Modo Coach y permite al alumno agregarla a sus Rutinas Personalizadas', () => {
    const coachRoutine = saveCustomRoutine('CoachJuan', {
      name: 'Mesociclo Hipertrofia 8 Semanas',
      description: 'Plan de fuerza progresiva',
      targetWeeks: 8,
      days: [
        {
          id: 1,
          name: 'Día 1: Empuje',
          subtitle: 'Pecho y Hombro',
          exercises: [
            {
              id: 'ex-coach-1',
              name: 'Press de banca con barra',
              category: 'Pecho',
              defaultSets: 4,
              defaultReps: '6 a 8',
              restSeconds: 120,
            },
          ],
        },
      ],
    });

    const assignment = sendRoutineFromCoach({
      coachNickname: 'CoachJuan',
      targetRecipient: 'AtletaPedro',
      routine: coachRoutine,
      coachMessage: 'Respeta RIR 2 en las primeras 4 semanas.',
    });

    const inbox = getCoachAssignedRoutines();
    expect(inbox.length).toBe(1);
    expect(inbox[0].id).toBe(assignment.id);
    expect(inbox[0].coachNickname).toBe('CoachJuan');

    const imported = acceptCoachRoutineAssignment('AtletaPedro', assignment.id);
    expect(imported).not.toBeNull();
    expect(imported?.targetWeeks).toBe(8);

    const athleteRoutines = getCustomRoutines('AtletaPedro');
    expect(athleteRoutines.length).toBe(1);
    expect(athleteRoutines[0].name).toContain('Mesociclo Hipertrofia 8 Semanas');
  });
});
