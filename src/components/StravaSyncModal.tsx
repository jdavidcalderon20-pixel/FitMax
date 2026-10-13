import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  Compass,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { parseGPXString, ParsedGPXResult, GeoPoint } from '../lib/gpx';
import { RunType, RUN_TYPES, calculatePace } from '../lib/running';
import RunningMap from './RunningMap';

interface StravaSyncModalProps {
  onClose: () => void;
  onImportRun: (data: {
    distanceKm: number;
    durationMin: number;
    type: RunType;
    rpe: number;
    notes?: string;
    route: GeoPoint[];
  }) => void;
  onNotification?: (msg: string) => void;
}

export default function StravaSyncModal({
  onClose,
  onImportRun,
  onNotification,
}: StravaSyncModalProps) {
  const [activeTab, setActiveTab] = useState<'gpx' | 'strava_read'>('gpx');
  const [importedData, setImportedData] = useState<ParsedGPXResult | null>(null);
  const [importType, setImportType] = useState<RunType>('facil');
  const [importRpe, setImportRpe] = useState<number>(6);
  const [parseError, setParseError] = useState<string | null>(null);

  // Estado para Client ID de Strava
  const [stravaClientId, setStravaClientId] = useState<string>(() => {
    return localStorage.getItem('fitmax_strava_client_id') || '';
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParseError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseGPXString(text);
        if (parsed.points.length === 0) {
          throw new Error('El archivo no contiene coordenadas GPS válidas.');
        }
        setImportedData(parsed);
      } catch (err: any) {
        setParseError(err?.message || 'Error al procesar el archivo GPX.');
      }
    };
    reader.onerror = () => {
      setParseError('Error de lectura del archivo.');
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (!importedData) return;

    onImportRun({
      distanceKm: importedData.totalDistanceKm,
      durationMin: importedData.totalDurationMin,
      type: importType,
      rpe: importRpe,
      notes: `Importado de GPX / Strava: ${importedData.name}`,
      route: importedData.points,
    });

    if (onNotification) {
      onNotification(`¡Ruta "${importedData.name}" de ${importedData.totalDistanceKm} km sumada a tu plan semanal!`);
    }

    onClose();
  };

  const handleSaveClientId = () => {
    if (stravaClientId.trim()) {
      localStorage.setItem('fitmax_strava_client_id', stravaClientId.trim());
      if (onNotification) {
        onNotification('Client ID guardado para sincronización de solo lectura.');
      }
    }
  };

  // Alcance estricto de SOLO LECTURA (read,activity:read_all). Cero permisos de escritura.
  const stravaAuthUrl = stravaClientId
    ? `https://www.strava.com/oauth/authorize?client_id=${stravaClientId.trim()}&response_type=code&redirect_uri=${encodeURIComponent(
        window.location.origin
      )}&approval_prompt=auto&scope=read,activity:read_all`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-zinc-950 text-white rounded-3xl w-full max-w-xl border border-zinc-800 shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Encabezado */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/70">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
                Sincronización de Running & GPS
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-black flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> SOLO LECTURA
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Suma tus kilómetros a FitMax sin publicar nada en tus redes sociales
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner de Garantía de Privacidad */}
        <div className="bg-emerald-950/40 border-b border-emerald-500/20 px-5 py-2.5 flex items-center gap-2.5 text-xs text-emerald-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Garantía de Privacidad:</strong> FitMax solo lee tus kilómetros para actualizar tu progreso. <strong>Nunca sube ni publica nada en tu cuenta de Strava.</strong>
          </span>
        </div>

        {/* Selector de Pestañas */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/30 p-1">
          <button
            onClick={() => setActiveTab('gpx')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'gpx'
                ? 'bg-zinc-800 text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>Importar Archivo GPX (Gratis)</span>
          </button>

          <button
            onClick={() => setActiveTab('strava_read')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'strava_read'
                ? 'bg-zinc-800 text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>Conectar Strava (Solo Lectura)</span>
          </button>
        </div>

        {/* Contenido según pestaña */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'gpx' && (
            <div>
              <p className="text-xs text-zinc-300 mb-3 leading-relaxed">
                Importa cualquier archivo <strong>.GPX</strong> exportado de Strava, Garmin, Polar, Coros o Apple Watch. Visualiza el mapa y suma los kilómetros a tu plan semanal:
              </p>

              {!importedData ? (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".gpx,application/gpx+xml"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-zinc-700 hover:border-emerald-500/80 bg-zinc-900/40 hover:bg-zinc-900 rounded-3xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white">Haz clic para seleccionar tu archivo .GPX</p>
                      <p className="text-xs text-zinc-400 mt-1">Exportado desde tu reloj deportivo o app de carrera</p>
                    </div>
                  </div>

                  {parseError && (
                    <div className="mt-3 p-3 bg-red-950/60 border border-red-500/30 rounded-2xl text-xs text-red-200 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{parseError}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-extrabold text-sm text-emerald-400">{importedData.name}</h4>
                      <button
                        onClick={() => setImportedData(null)}
                        className="text-[11px] text-zinc-400 hover:text-white underline"
                      >
                        Cambiar archivo
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/80">
                      <div>
                        <span className="text-[10px] text-zinc-400 uppercase font-bold">Distancia</span>
                        <p className="text-base font-black text-white">{importedData.totalDistanceKm} km</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 uppercase font-bold">Duración</span>
                        <p className="text-base font-black text-white">{importedData.totalDurationMin} min</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 uppercase font-bold">Ritmo Medio</span>
                        <p className="text-base font-black text-sky-400">
                          {calculatePace(importedData.totalDistanceKm, importedData.totalDurationMin)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Previsualización del mapa de la ruta importada */}
                  <div>
                    <span className="text-[11px] font-bold text-zinc-400 mb-1.5 block">
                      Trazado GPS ({importedData.points.length} puntos registrados):
                    </span>
                    <RunningMap
                      route={importedData.points}
                      height="200px"
                      interactive={true}
                      autoFit={true}
                    />
                  </div>

                  {/* Tipo y Sensación de esfuerzo (RPE) */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-zinc-300 block mb-1">Tipo de entrenamiento:</label>
                      <select
                        value={importType}
                        onChange={(e) => setImportType(e.target.value as RunType)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                      >
                        {RUN_TYPES.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-300 block mb-1">
                        Esfuerzo percibido: <span className="text-emerald-400 font-bold">{importRpe}/10</span>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={importRpe}
                        onChange={(e) => setImportRpe(parseInt(e.target.value, 10))}
                        className="w-full accent-emerald-500 mt-2"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmImport}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-xl text-xs transition-all shadow-md"
                  >
                    Guardar Carrera en FitMax
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'strava_read' && (
            <div className="space-y-4 text-xs">
              <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
                <h4 className="font-black text-sm text-white mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Sincronización Directa de Solo Lectura
                </h4>
                <p className="text-zinc-400 leading-relaxed mt-1">
                  Al conectar Strava con FitMax, solicitamos únicamente el permiso <code>activity:read_all</code>. Esto significa que FitMax <strong>únicamente lee tus carreras completadas</strong> para registrar tus kilómetros en tu plan de entrenamiento.
                </p>
                <div className="mt-3 p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-zinc-300 space-y-1">
                  <p className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" /> ¿Qué hace FitMax?
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    • Lee la distancia, tiempo y ritmo de tus carreras para marcar el día como completado.
                  </p>
                  <p className="font-bold text-amber-400 flex items-center gap-1.5 mt-2">
                    <AlertCircle className="w-3.5 h-3.5" /> ¿Qué NO hace FitMax?
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    • <strong>Nunca publica</strong> entrenamientos ni historias en tu feed de Strava.
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    • <strong>Nunca modifica</strong> ninguna actividad ni tus datos personales.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-zinc-300 block">Tu Strava Client ID (Opcional):</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ej: 123456"
                    value={stravaClientId}
                    onChange={(e) => setStravaClientId(e.target.value)}
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <button
                    onClick={handleSaveClientId}
                    className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 font-bold rounded-xl border border-zinc-700"
                  >
                    Guardar
                  </button>
                </div>
              </div>

              {stravaAuthUrl && (
                <div className="pt-2">
                  <a
                    href={stravaAuthUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Conectar Strava en Modo Solo Lectura</span>
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
