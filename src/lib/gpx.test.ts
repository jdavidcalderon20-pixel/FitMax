import { describe, it, expect } from 'vitest';
import {
  calculateHaversineDistanceKm,
  calculateTotalRouteDistanceKm,
  generateGPXString,
  parseGPXString,
  GeoPoint,
} from './gpx';

describe('GPX Utilities & Geo Calculations', () => {
  it('calcula distancia Haversine correctamente entre dos puntos', () => {
    // Plaza de Bolívar a Parque Simón Bolívar en Bogotá ~ 6.5 km
    const dist = calculateHaversineDistanceKm(4.5981, -74.0760, 4.6582, -74.0935);
    expect(dist).toBeGreaterThan(6.0);
    expect(dist).toBeLessThan(7.5);
  });

  it('calcula distancia acumulada de una serie de puntos', () => {
    const pts: GeoPoint[] = [
      { latitude: 4.5981, longitude: -74.0760, timestamp: 1000 },
      { latitude: 4.6100, longitude: -74.0800, timestamp: 2000 },
      { latitude: 4.6582, longitude: -74.0935, timestamp: 3000 },
    ];
    const totalDist = calculateTotalRouteDistanceKm(pts);
    expect(totalDist).toBeGreaterThan(6.0);
  });

  it('genera un XML GPX válido y estructurado', () => {
    const pts: GeoPoint[] = [
      { latitude: 4.6000, longitude: -74.0700, altitude: 2600, timestamp: 1700000000000 },
      { latitude: 4.6100, longitude: -74.0800, altitude: 2605, timestamp: 1700000600000 },
    ];

    const gpx = generateGPXString('Carrera Parque 5K', pts);
    expect(gpx).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(gpx).toContain('<gpx version="1.1"');
    expect(gpx).toContain('<name>Carrera Parque 5K</name>');
    expect(gpx).toContain('<trkpt lat="4.600000" lon="-74.070000">');
    expect(gpx).toContain('<ele>2600.0</ele>');
    expect(gpx).toContain('</gpx>');
  });

  it('parsea un string GPX extrayendo nombre, coordenadas, distancia y duración', () => {
    const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
    <gpx version="1.1" creator="Strava">
      <metadata><name>Entrenamiento Matutino Strava</name></metadata>
      <trk>
        <name>Entrenamiento Matutino Strava</name>
        <trkseg>
          <trkpt lat="4.600000" lon="-74.070000">
            <ele>2600</ele>
            <time>2026-10-12T10:00:00Z</time>
          </trkpt>
          <trkpt lat="4.610000" lon="-74.080000">
            <ele>2610</ele>
            <time>2026-10-12T10:30:00Z</time>
          </trkpt>
        </trkseg>
      </trk>
    </gpx>`;

    const parsed = parseGPXString(sampleXml);
    expect(parsed.name).toBe('Entrenamiento Matutino Strava');
    expect(parsed.points).toHaveLength(2);
    expect(parsed.totalDistanceKm).toBeGreaterThan(1);
    expect(parsed.totalDurationMin).toBe(30);
  });
});
