import { describe, it, expect } from 'vitest';
import { HYROX_GYM_ALTERNATIVES, findStationAlternatives, OCR_CONVENTIONAL_GYM_GUIDE } from './hyroxAlternatives';

describe('hyroxAlternatives', () => {
  it('contains alternatives for all 8 official Hyrox stations', () => {
    const keys = Object.keys(HYROX_GYM_ALTERNATIVES);
    expect(keys).toContain('Sled Push');
    expect(keys).toContain('Sled Pull');
    expect(keys).toContain('SkiErg');
    expect(keys).toContain('Rowing');
    expect(keys).toContain('Farmers Carry');
    expect(keys).toContain('Sandbag Lunges');
    expect(keys).toContain('Wall Balls');
    expect(keys).toContain('Burpee Broad Jumps');
    expect(keys.length).toBe(8);
  });

  it('each station has at least 2 viable gym alternatives with tips and whyItWorks', () => {
    Object.values(HYROX_GYM_ALTERNATIVES).forEach((st) => {
      expect(st.alternatives.length).toBeGreaterThanOrEqual(2);
      st.alternatives.forEach((alt) => {
        expect(alt.name).toBeTruthy();
        expect(alt.equipment).toBeTruthy();
        expect(alt.whyItWorks).toBeTruthy();
        expect(alt.executionTips.length).toBeGreaterThan(0);
      });
    });
  });

  it('findStationAlternatives finds alternatives by partial or full name', () => {
    const foundPush = findStationAlternatives('Sled Push');
    expect(foundPush).not.toBeNull();
    expect(foundPush?.officialName).toContain('Sled Push');

    const foundSki = findStationAlternatives('SkiErg máquina');
    expect(foundSki).not.toBeNull();

    const notFound = findStationAlternatives('Ejercicio Inventado');
    expect(notFound).toBeNull();
  });

  it('contains conventional gym OCR adaptations', () => {
    expect(OCR_CONVENTIONAL_GYM_GUIDE.length).toBeGreaterThanOrEqual(3);
    const towelHang = OCR_CONVENTIONAL_GYM_GUIDE.find((a) => a.title.includes('Towel Hang'));
    expect(towelHang).toBeDefined();
  });
});
