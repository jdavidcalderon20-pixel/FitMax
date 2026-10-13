// Utilidad de exportación e importación GPX (GPS Exchange Format) y cálculo geodésico
// 100% estándar, compatible con Strava, Garmin Connect, Suunto, Coros y Apple Health.

export interface GeoPoint {
  latitude: number;
  longitude: number;
  altitude?: number;
  timestamp: number; // timestamp en milisegundos
}

export interface ParsedGPXResult {
  name: string;
  points: GeoPoint[];
  totalDistanceKm: number;
  totalDurationMin: number;
  startTime: number;
}

/**
 * Fórmula de Haversine para calcular la distancia en kilómetros entre dos coordenadas GPS
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calcula la distancia total acumulada de una serie de puntos GPS en km
 */
export function calculateTotalRouteDistanceKm(points: GeoPoint[]): number {
  if (!points || points.length < 2) return 0;
  let totalKm = 0;
  for (let i = 1; i < points.length; i++) {
    totalKm += calculateHaversineDistanceKm(
      points[i - 1].latitude,
      points[i - 1].longitude,
      points[i].latitude,
      points[i].longitude
    );
  }
  return totalKm;
}

/**
 * Genera un archivo XML estándar GPX 1.1 listo para Strava / Garmin
 */
export function generateGPXString(
  activityName: string,
  points: GeoPoint[],
  creator = 'FitMax Running GPS'
): string {
  const safeName = activityName.replace(/[<>&]/g, '');
  const startTimeIso = points.length > 0 ? new Date(points[0].timestamp).toISOString() : new Date().toISOString();

  let trkptsXml = '';
  for (const pt of points) {
    const timeIso = new Date(pt.timestamp).toISOString();
    const eleXml = pt.altitude !== undefined ? `\n        <ele>${pt.altitude.toFixed(1)}</ele>` : '';
    trkptsXml += `      <trkpt lat="${pt.latitude.toFixed(6)}" lon="${pt.longitude.toFixed(6)}">${eleXml}\n        <time>${timeIso}</time>\n      </trkpt>\n`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="${creator}" xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>${safeName}</name>
    <time>${startTimeIso}</time>
  </metadata>
  <trk>
    <name>${safeName}</name>
    <type>running</type>
    <trkseg>
${trkptsXml}    </trkseg>
  </trk>
</gpx>`;
}

/**
 * Descarga en el navegador un archivo .gpx generado
 */
export function downloadGPXFile(filename: string, gpxContent: string): void {
  const blob = new Blob([gpxContent], { type: 'application/gpx+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.gpx') ? filename : `${filename}.gpx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parsea el contenido XML de un archivo GPX (Strava, Garmin, etc.)
 * Funciona en navegadores (DOMParser) y en entornos Node/Vitest (expresiones regulares).
 */
export function parseGPXString(xmlContent: string): ParsedGPXResult {
  let name = 'Ruta GPX';
  const points: GeoPoint[] = [];

  if (typeof DOMParser !== 'undefined') {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'application/xml');

    const parserError = xmlDoc.querySelector('parsererror');
    if (!parserError) {
      const nameElem = xmlDoc.querySelector('metadata > name, trk > name');
      if (nameElem?.textContent?.trim()) {
        name = nameElem.textContent.trim();
      }

      const trkptNodes = xmlDoc.querySelectorAll('trkpt');
      trkptNodes.forEach((node) => {
        const lat = parseFloat(node.getAttribute('lat') || '0');
        const lon = parseFloat(node.getAttribute('lon') || '0');
        const eleNode = node.querySelector('ele');
        const timeNode = node.querySelector('time');

        const altitude = eleNode ? parseFloat(eleNode.textContent || '0') : undefined;
        const timestamp = timeNode && timeNode.textContent ? new Date(timeNode.textContent).getTime() : Date.now();

        if (!isNaN(lat) && !isNaN(lon)) {
          points.push({
            latitude: lat,
            longitude: lon,
            altitude: altitude !== undefined && !isNaN(altitude) ? altitude : undefined,
            timestamp: isNaN(timestamp) ? Date.now() : timestamp,
          });
        }
      });
    }
  }

  // Fallback con expresiones regulares si DOMParser no extrajo puntos (entorno Node/Test o XML especial)
  if (points.length === 0) {
    const nameMatch = xmlContent.match(/<name>(.*?)<\/name>/i);
    if (nameMatch && nameMatch[1]) {
      name = nameMatch[1].trim();
    }

    const trkptRegex = /<trkpt\s+lat="([^"]+)"\s+lon="([^"]+)"[^>]*>([\s\S]*?)<\/trkpt>/gi;
    let match: RegExpExecArray | null;
    while ((match = trkptRegex.exec(xmlContent)) !== null) {
      const lat = parseFloat(match[1]);
      const lon = parseFloat(match[2]);
      const inner = match[3];

      const eleMatch = inner.match(/<ele>([^<]+)<\/ele>/i);
      const timeMatch = inner.match(/<time>([^<]+)<\/time>/i);

      const altitude = eleMatch ? parseFloat(eleMatch[1]) : undefined;
      const timestamp = timeMatch ? new Date(timeMatch[1]).getTime() : Date.now();

      if (!isNaN(lat) && !isNaN(lon)) {
        points.push({
          latitude: lat,
          longitude: lon,
          altitude: altitude !== undefined && !isNaN(altitude) ? altitude : undefined,
          timestamp: isNaN(timestamp) ? Date.now() : timestamp,
        });
      }
    }
  }

  const totalDistanceKm = calculateTotalRouteDistanceKm(points);

  let totalDurationMin = 0;
  if (points.length >= 2) {
    const diffMs = points[points.length - 1].timestamp - points[0].timestamp;
    totalDurationMin = Math.max(1, Math.round(diffMs / 60000));
  }

  const startTime = points.length > 0 ? points[0].timestamp : Date.now();

  return {
    name,
    points,
    totalDistanceKm: Math.round(totalDistanceKm * 100) / 100,
    totalDurationMin,
    startTime,
  };
}
