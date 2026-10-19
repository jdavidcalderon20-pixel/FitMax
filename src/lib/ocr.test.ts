import { describe, it, expect } from 'vitest';
import { OCR_TIERS, generateOcrWeek, OcrLevel } from './ocr';

describe('OCR_TIERS', () => {
  it('tiene los 4 niveles de carrera en progresión ascendente', () => {
    expect(OCR_TIERS.map((t) => t.id)).toEqual(['sprint', 'super', 'beast', 'ultra']);
  });

  it('cada nivel tiene distancia y conteo de obstáculos definidos', () => {
    OCR_TIERS.forEach((t) => {
      expect(t.distance).toBeTruthy();
      expect(t.obstacles).toBeTruthy();
    });
  });
});

describe('generateOcrWeek', () => {
  const levels: OcrLevel[] = OCR_TIERS.map((t) => t.id);

  it('genera 4 sesiones para cada nivel', () => {
    levels.forEach((level) => {
      expect(generateOcrWeek(level)).toHaveLength(4);
    });
  });

  it('cada sesión tiene título, enfoque y al menos un bloque', () => {
    generateOcrWeek('sprint').forEach((session) => {
      expect(session.title).toBeTruthy();
      expect(session.focus).toBeTruthy();
      expect(session.blocks.length).toBeGreaterThan(0);
    });
  });

  it('el volumen de carrera escala hacia niveles más exigentes: ultra > beast > super > sprint', () => {
    const sprintRun = generateOcrWeek('sprint')[1].blocks[0].detail;
    const ultraRun = generateOcrWeek('ultra')[1].blocks[0].detail;
    expect(sprintRun).toContain('3km');
    expect(ultraRun).toContain('12km');
  });

  it('permite alternar entre los 3 niveles de progresión de agarre (gripTier)', () => {
    const baseGrip = generateOcrWeek('super', undefined, 'base')[0];
    const advGrip = generateOcrWeek('super', undefined, 'avanzado')[0];

    expect(baseGrip.blocks.some((b) => b.name.includes('Dead Hang Pasivo'))).toBe(true);
    expect(advGrip.blocks.some((b) => b.name.includes('1 Mano Asistida') || b.name.includes('Pinch Grip'))).toBe(true);
  });

  it('cada sesión incluye una guía de estructura detallada (structureGuide)', () => {
    generateOcrWeek('super').forEach((session) => {
      expect(session.structureGuide).toBeTruthy();
      expect(session.structureGuide?.length).toBeGreaterThan(20);
    });
  });

  it('el Día 2 de OCR especifica claramente el protocolo secuencial (primero 5km, luego cuestas)', () => {
    const dia2 = generateOcrWeek('super')[1];
    expect(dia2.structureGuide).toContain('Protocolo Secuencial');
    expect(dia2.structureGuide).toContain('Primero realiza el Bloque 1');
    expect(dia2.structureGuide).toContain('cuestas cortas explosivas');
  });
});

