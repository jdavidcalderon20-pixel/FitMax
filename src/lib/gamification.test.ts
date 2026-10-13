import { describe, it, expect } from 'vitest';
import { evaluateBadges, evaluateChallenges } from './gamification';

describe('gamification module', () => {
  it('returns all initial badges locked with 0 progress when empty context', () => {
    const badges = evaluateBadges({});
    expect(badges.length).toBe(12);
    badges.forEach((b) => {
      expect(b.isUnlocked).toBe(false);
    });
  });

  it('unlocks first_blood when at least one running log or weekly exercise exists', () => {
    const badges = evaluateBadges({
      runningLogs: [{ distance_km: 5, run_type: 'easy_z2' }]
    });
    const firstBlood = badges.find((b) => b.id === 'first_blood');
    expect(firstBlood?.isUnlocked).toBe(true);
    expect(firstBlood?.progress).toBe(100);
  });

  it('evaluates mesocycle badges based on mesocycleWeek', () => {
    const badgesW4 = evaluateBadges({ mesocycleWeek: 4 });
    const halfBadge = badgesW4.find((b) => b.id === 'mesocycle_half');
    const masterBadge = badgesW4.find((b) => b.id === 'mesocycle_master');

    expect(halfBadge?.isUnlocked).toBe(true);
    expect(halfBadge?.progress).toBe(100);
    expect(masterBadge?.isUnlocked).toBe(false);
    expect(masterBadge?.progress).toBe(50); // 4/8 = 50%
  });

  it('evaluates zone 2 and long run running badges', () => {
    const badges = evaluateBadges({
      runningLogs: [
        { distance_km: 10, run_type: 'easy_z2' },
        { distance_km: 12, run_type: 'easy_z2' },
        { distance_km: 16, run_type: 'long_run' }
      ]
    });

    const z2Badge = badges.find((b) => b.id === 'zone2_pioneer');
    const longRunBadge = badges.find((b) => b.id === 'long_run_hero');

    expect(z2Badge?.isUnlocked).toBe(true); // 38 km Z2 >= 20
    expect(longRunBadge?.isUnlocked).toBe(true); // 16 km >= 15
  });

  it('evaluates challenges correctly and respects joinedChallengeIds', () => {
    const challenges = evaluateChallenges({
      runningLogs: [
        { distance_km: 25, run_type: 'easy_z2' },
        { distance_km: 25, run_type: 'tempo' }
      ],
      joinedChallengeIds: ['challenge_50k_month']
    });

    const ch50k = challenges.find((c) => c.id === 'challenge_50k_month');
    expect(ch50k?.isJoined).toBe(true);
    expect(ch50k?.currentValue).toBe(50);
    expect(ch50k?.isCompleted).toBe(true);
    expect(ch50k?.progress).toBe(100);

    const chMeso = challenges.find((c) => c.id === 'challenge_mesocycle_16');
    expect(chMeso?.isJoined).toBe(false);
  });

  it('evaluates hybrid badges (hyrox, ocr, compromised running)', () => {
    const badges = evaluateBadges({
      hyroxOcrCompleted: {
        hyrox_station_1: true,
        hyrox_station_2: true,
        ocr_suspension_1: true,
        ocr_suspension_2: true,
        ocr_suspension_3: true
      }
    });

    const hyroxBadge = badges.find((b) => b.id === 'hyrox_sim_finisher');
    const ocrBadge = badges.find((b) => b.id === 'iron_grip');
    const compromisedBadge = badges.find((b) => b.id === 'compromised_runner');

    expect(hyroxBadge?.isUnlocked).toBe(true);
    expect(ocrBadge?.isUnlocked).toBe(true);
    expect(compromisedBadge?.isUnlocked).toBe(true); // 2 + 3 = 5 >= 3
  });

  it('evaluates progressive overload from history entries', () => {
    const badges = evaluateBadges({
      weeklyHistory: {
        press_banca: [
          { weight: '70', reps: '8', date: 1000 },
          { weight: '72.5', reps: '8', date: 2000 }
        ],
        sentadilla: [
          { weight: '90', reps: '6', date: 1000 },
          { weight: '95', reps: '6', date: 2000 }
        ],
        peso_muerto: [
          { weight: '120', reps: '5', date: 1000 },
          { weight: '125', reps: '5', date: 2000 }
        ]
      }
    });

    const overloadBadge = badges.find((b) => b.id === 'progressive_overload_pro');
    expect(overloadBadge?.isUnlocked).toBe(true);
  });

  it('unlocks hybrid_warrior only when all 3 disciplines have activity', () => {
    // Solo 2 disciplinas
    const partialBadges = evaluateBadges({
      weeklyLogs: { ex1: { weight: '20', reps: '10', completed: true } },
      runningLogs: [{ distance_km: 5, run_type: 'easy_z2' }]
    });
    expect(partialBadges.find((b) => b.id === 'hybrid_warrior')?.isUnlocked).toBe(false);

    // Las 3 disciplinas completas
    const fullBadges = evaluateBadges({
      weeklyLogs: { ex1: { weight: '20', reps: '10', completed: true } },
      runningLogs: [{ distance_km: 5, run_type: 'easy_z2' }],
      hyroxOcrCompleted: { hyrox_1: true }
    });
    expect(fullBadges.find((b) => b.id === 'hybrid_warrior')?.isUnlocked).toBe(true);
  });
});

