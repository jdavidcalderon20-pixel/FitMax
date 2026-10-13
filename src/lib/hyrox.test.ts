import { describe, it, expect } from 'vitest';
import { HYROX_STATIONS, HYROX_LEVELS, generateHyroxWeek, HyroxLevel } from './hyrox';

describe('HYROX_STATIONS', () => {
  it('tiene exactamente las 8 estaciones oficiales', () => {
    expect(HYROX_STATIONS).toHaveLength(8);
  });

  it('están en el orden oficial de carrera', () => {
    const names = HYROX_STATIONS.map((s) => s.name);
    expect(names).toEqual([
      'SkiErg',
      'Sled Push',
      'Sled Pull',
      'Burpee Broad Jumps',
      'Rowing',
      'Farmers Carry',
      'Sandbag Lunges',
      'Wall Balls',
    ]);
  });

  it('el peso Pro siempre es mayor al peso Open cuando hay carga', () => {
    // Extrae el número inmediatamente antes de "kg" (no el primer número del string, que en
    // formatos como "2×24kg" sería el multiplicador "2" y no el peso real "24").
    const extractKg = (spec: string): number => {
      const match = spec.match(/(\d+(?:\.\d+)?)kg/);
      return match ? parseFloat(match[1]) : NaN;
    };
    const withLoad = HYROX_STATIONS.filter((s) => s.loadMenOpen !== 'Sin carga');
    expect(withLoad.length).toBeGreaterThan(0);
    withLoad.forEach((s) => {
      const openKg = extractKg(s.loadMenOpen);
      const proKg = extractKg(s.loadMenPro);
      expect(proKg).toBeGreaterThan(openKg);
    });
  });
});

describe('generateHyroxWeek', () => {
  const levels: HyroxLevel[] = HYROX_LEVELS.map((l) => l.id);

  it('genera 4 sesiones para cada nivel', () => {
    levels.forEach((level) => {
      expect(generateHyroxWeek(level)).toHaveLength(4);
    });
  });

  it('cada sesión tiene título, calentamiento y al menos un bloque', () => {
    generateHyroxWeek('base').forEach((session) => {
      expect(session.title).toBeTruthy();
      expect(session.warmup).toBeTruthy();
      expect(session.blocks.length).toBeGreaterThan(0);
      expect(session.runningNote).toBeTruthy();
    });
  });

  it('el volumen (series) escala con el nivel: pro > open > base', () => {
    const baseSets = generateHyroxWeek('base')[0].blocks[0].detail;
    const openSets = generateHyroxWeek('open')[0].blocks[0].detail;
    const proSets = generateHyroxWeek('pro')[0].blocks[0].detail;
    expect(baseSets).toContain('3 rondas');
    expect(openSets).toContain('4 rondas');
    expect(proSets).toContain('5 rondas');
  });

  it('incluye bloques de carrera comprometida (compromised running) y adapta volumen en fase de tapering', () => {
    const normalWeek = generateHyroxWeek('open');
    const taperingWeek = generateHyroxWeek('open', 'tapering');

    const hasCompromised = normalWeek.some((s) => s.blocks.some((b) => b.isCompromised));
    expect(hasCompromised).toBe(true);

    // Tapering reduce el número de rondas
    const tapDetail = taperingWeek[0].blocks[0].detail;
    expect(tapDetail).toContain('2 rondas');
  });
});

