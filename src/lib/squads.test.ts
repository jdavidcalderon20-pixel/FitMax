import { describe, it, expect } from 'vitest';
import { 
  generateSquadCode, 
  validateSquadCode, 
  hasUserCheckedInToday, 
  calculateStreak,
  DEFAULT_COMMUNITY_SQUADS 
} from './squads';

describe('squads module', () => {
  it('generates valid 6-character squad codes with custom prefix', () => {
    const code = generateSquadCode('HYR');
    expect(code).toHaveLength(6);
    expect(code.startsWith('HYR')).toBe(true);
    expect(validateSquadCode(code)).toBe(true);
  });

  it('validates correct and incorrect squad codes', () => {
    expect(validateSquadCode('HYR202')).toBe(true);
    expect(validateSquadCode('RUN820')).toBe(true);
    expect(validateSquadCode('IRON04')).toBe(true);
    expect(validateSquadCode('12')).toBe(false); // muy corto
    expect(validateSquadCode('HYROX12345')).toBe(false); // muy largo
    expect(validateSquadCode('INVALID!#')).toBe(false); // caracteres no alfanuméricos
  });

  it('checks if user has checked in today', () => {
    const now = Date.now();
    const yesterday = now - 86400000;
    expect(hasUserCheckedInToday(now)).toBe(true);
    expect(hasUserCheckedInToday(yesterday)).toBe(false);
    expect(hasUserCheckedInToday(undefined)).toBe(false);
  });

  it('calculates streaks correctly across consecutive days', () => {
    const now = Date.now();
    const yesterday = now - 86400000;
    const twoDaysAgo = now - 86400000 * 2;

    // Primer entreno de la historia
    expect(calculateStreak(0, undefined)).toBe(1);

    // Mismo día (ya tenía racha de 3)
    expect(calculateStreak(3, now)).toBe(3);

    // Día consecutivo (entrenó ayer y tenía racha de 3 -> 4)
    expect(calculateStreak(3, yesterday)).toBe(4);

    // Salto de 2 días (se rompió la racha -> reinicia en 1)
    expect(calculateStreak(5, twoDaysAgo)).toBe(1);
  });

  it('contains valid default community squads with shared routines', () => {
    expect(DEFAULT_COMMUNITY_SQUADS.length).toBeGreaterThanOrEqual(3);
    const hyroxSquad = DEFAULT_COMMUNITY_SQUADS.find((s) => s.id === 'squad_hyrox_titans');
    expect(hyroxSquad).toBeDefined();
    expect(hyroxSquad?.discipline).toBe('hyrox_ocr');
    expect(hyroxSquad?.sharedRoutine?.daysData?.length).toBeGreaterThan(0);
  });
});
