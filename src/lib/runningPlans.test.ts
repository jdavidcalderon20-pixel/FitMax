import { describe, it, expect } from 'vitest';
import { 
  generateRunningPlan, 
  calculateRaceFinishTime, 
  formatPaceDecimal 
} from './runningPlans';

describe('Running Plans (runningPlans.ts)', () => {
  it('formatea ritmos decimales con precisión', () => {
    expect(formatPaceDecimal(5.0)).toBe('5:00 min/km');
    expect(formatPaceDecimal(5.5)).toBe('5:30 min/km');
    expect(formatPaceDecimal(4.75)).toBe('4:45 min/km');
  });

  it('calcula tiempos de meta coherentes', () => {
    // 10K a 5:00 min/km = 50m 00s
    expect(calculateRaceFinishTime('10K', 5.0)).toBe('50m 00s');
    // 5K a 4:00 min/km = 20m 00s
    expect(calculateRaceFinishTime('5K', 4.0)).toBe('20m 00s');
  });

  it('genera 4 sesiones estructuradas balanceadas para 10K', () => {
    const plan = generateRunningPlan('10K', 5.0);
    expect(plan.length).toBe(4);
    expect(plan[0].type).toBe('facil');
    expect(plan[1].type).toBe('series');
    expect(plan[2].type).toBe('tempo');
    expect(plan[3].type).toBe('larga');
    expect(plan[0].distanceKm).toBeGreaterThan(0);
    expect(plan[3].distanceKm).toBeGreaterThan(plan[0].distanceKm);
  });
});
