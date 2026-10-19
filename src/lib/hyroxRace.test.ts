import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { 
  HYROX_OFFICIAL_RACE_STATIONS, 
  HYROX_DIVISIONS, 
  formatDuration, 
  calculatePaceFromSec, 
  analyzeHyroxRace, 
  saveHyroxRaceResult, 
  getHyroxPersonalBest, 
  getHyroxRaceHistory,
  HyroxSegmentRecord 
} from './hyroxRace';

describe('hyroxRace specs & stations', () => {
  it('tiene exactamente 8 estaciones oficiales en el orden reglamentario Hyrox', () => {
    expect(HYROX_OFFICIAL_RACE_STATIONS).toHaveLength(8);
    expect(HYROX_OFFICIAL_RACE_STATIONS[0].shortName).toBe('SkiErg');
    expect(HYROX_OFFICIAL_RACE_STATIONS[1].shortName).toBe('Sled Push');
    expect(HYROX_OFFICIAL_RACE_STATIONS[2].shortName).toBe('Sled Pull');
    expect(HYROX_OFFICIAL_RACE_STATIONS[3].shortName).toBe('Burpee Jumps');
    expect(HYROX_OFFICIAL_RACE_STATIONS[4].shortName).toBe('Rowing');
    expect(HYROX_OFFICIAL_RACE_STATIONS[5].shortName).toBe('Farmers Carry');
    expect(HYROX_OFFICIAL_RACE_STATIONS[6].shortName).toBe('Sandbag Lunges');
    expect(HYROX_OFFICIAL_RACE_STATIONS[7].shortName).toBe('Wall Balls');
  });

  it('cada estación incluye pesos para las divisiones oficiales y adaptaciones de gimnasio', () => {
    HYROX_OFFICIAL_RACE_STATIONS.forEach((st) => {
      expect(st.weightByDivision.open_men).toBeTruthy();
      expect(st.weightByDivision.open_women).toBeTruthy();
      expect(st.weightByDivision.pro_men).toBeTruthy();
      expect(st.weightByDivision.gym_adapted).toBeTruthy();
      expect(st.gymAlternative).toBeTruthy();
      expect(st.proTip).toBeTruthy();
    });
  });

  it('tiene las 5 divisiones soportadas', () => {
    expect(HYROX_DIVISIONS.map((d) => d.id)).toEqual([
      'open_men',
      'open_women',
      'pro_men',
      'pro_women',
      'gym_adapted',
    ]);
  });
});

describe('formatDuration & calculatePaceFromSec', () => {
  it('formatea duraciones menores a una hora en MM:SS', () => {
    expect(formatDuration(272)).toBe('04:32');
    expect(formatDuration(59)).toBe('00:59');
  });

  it('formatea duraciones mayores a una hora en HH:MM:SS', () => {
    expect(formatDuration(3665)).toBe('01:01:05');
    expect(formatDuration(4500)).toBe('01:15:00');
  });

  it('calcula el ritmo por km a partir de segundos', () => {
    expect(calculatePaceFromSec(1.0, 300)).toBe('5:00/km');
    expect(calculatePaceFromSec(1.0, 270)).toBe('4:30/km');
    expect(calculatePaceFromSec(0, 0)).toBe('--:--/km');
  });
});

const mockStorage: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, val: string) => { mockStorage[key] = val; },
  removeItem: (key: string) => { delete mockStorage[key]; },
  clear: () => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
  },
};

describe('analyzeHyroxRace & Personal Best logic', () => {
  const dummySegments: HyroxSegmentRecord[] = [
    { segmentNumber: 1, stationName: 'SkiErg', runDistanceKm: 1.0, runDurationSec: 270, runPaceStr: '4:30/km', stationDurationSec: 240, totalSegmentDurationSec: 510 },
    { segmentNumber: 2, stationName: 'Sled Push', runDistanceKm: 1.0, runDurationSec: 280, runPaceStr: '4:40/km', stationDurationSec: 180, totalSegmentDurationSec: 460 },
    { segmentNumber: 3, stationName: 'Sled Pull', runDistanceKm: 1.0, runDurationSec: 290, runPaceStr: '4:50/km', stationDurationSec: 210, totalSegmentDurationSec: 500 },
    { segmentNumber: 4, stationName: 'Burpees', runDistanceKm: 1.0, runDurationSec: 300, runPaceStr: '5:00/km', stationDurationSec: 230, totalSegmentDurationSec: 530 },
    { segmentNumber: 5, stationName: 'Rowing', runDistanceKm: 1.0, runDurationSec: 305, runPaceStr: '5:05/km', stationDurationSec: 245, totalSegmentDurationSec: 550 },
    { segmentNumber: 6, stationName: 'Farmers', runDistanceKm: 1.0, runDurationSec: 310, runPaceStr: '5:10/km', stationDurationSec: 150, totalSegmentDurationSec: 460 },
    { segmentNumber: 7, stationName: 'Lunges', runDistanceKm: 1.0, runDurationSec: 320, runPaceStr: '5:20/km', stationDurationSec: 220, totalSegmentDurationSec: 540 },
    { segmentNumber: 8, stationName: 'Wall Balls', runDistanceKm: 1.0, runDurationSec: 330, runPaceStr: '5:30/km', stationDurationSec: 300, totalSegmentDurationSec: 630 },
  ];

  const originalLocalStorage = (globalThis as any).localStorage;

  beforeEach(() => {
    (globalThis as any).localStorage = localStorageMock;
    localStorageMock.clear();
  });

  afterAll(() => {
    (globalThis as any).localStorage = originalLocalStorage;
  });

  it('calcula totales, ritmos y determina la estación más rápida y más lenta', () => {
    const analysis = analyzeHyroxRace(dummySegments, 'open_men', 'treadmill');

    expect(analysis.totalRunDurationSec).toBe(2405);
    expect(analysis.totalStationDurationSec).toBe(1775);
    expect(analysis.totalDurationSec).toBe(4180);
    expect(analysis.fastestRunSegment).toBe(1); // 270s
    expect(analysis.slowestRunSegment).toBe(8); // 330s
    expect(analysis.fastestStationSegment).toBe(6); // 150s (Farmers)
    expect(analysis.slowestStationSegment).toBe(8); // 300s (Wall Balls)
  });

  it('guarda en historial y detecta nuevo Personal Best', () => {
    const race1 = analyzeHyroxRace(dummySegments, 'open_men', 'treadmill');
    const save1 = saveHyroxRaceResult('atleta_test', race1);
    expect(save1.isNewPB).toBe(true);

    const pb1 = getHyroxPersonalBest('atleta_test', 'open_men');
    expect(pb1).not.toBeNull();
    expect(pb1?.totalDurationSec).toBe(4180);

    // Segundo intento más rápido
    const fasterSegments = dummySegments.map((s) => ({
      ...s,
      runDurationSec: s.runDurationSec - 10,
      stationDurationSec: s.stationDurationSec - 5,
    }));
    const race2 = analyzeHyroxRace(fasterSegments, 'open_men', 'treadmill');
    const save2 = saveHyroxRaceResult('atleta_test', race2);

    expect(save2.isNewPB).toBe(true);
    expect(save2.previousPB?.totalDurationSec).toBe(4180);

    const pb2 = getHyroxPersonalBest('atleta_test', 'open_men');
    expect(pb2?.totalDurationSec).toBe(race2.totalDurationSec);
    expect(getHyroxRaceHistory('atleta_test')).toHaveLength(2);
  });
});
