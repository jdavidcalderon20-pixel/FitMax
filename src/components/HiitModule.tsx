import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, 
  Clock, 
  Play, 
  Pause, 
  ArrowRight, 
  Flame, 
  Volume2, 
  VolumeX,
  RefreshCw,
  Info
} from 'lucide-react';
import { playBeepSound } from '../lib/sound';
import { ExerciseDetail, findExerciseDetail } from '../lib/exerciseBank';
import ExerciseDetailModal from './ExerciseDetailModal';

const HIIT_EXERCISE_POOL = [
  'Burpees completos',
  'Snatch con mancuerna',
  'Jumping Jacks rápidos',
  'Escaladores rápidos (Mountain Climbers)',
  'Sentadilla con salto (Jump Squats)',
  'Zancadas de salto alternadas',
  'Flexiones explosivas',
  'Plancha con saltos (Plank Jacks)',
  'Rodillas arriba (High knees)',
  'Kettlebell swings / Swings mancuerna',
  'Skaters laterales de potencia',
  'Flexión comando',
  'Hollow rocks de core',
  'Sprawls explosivos',
  'Saltos de cuerda virtuales',
  'Zancadas pliométricas'
];

export default function HiitModule() {
  const [hiitPreset, setHiitPreset] = useState<string>('diez_uno');
  const [hiitRunning, setHiitRunning] = useState<boolean>(false);
  const [hiitPhase, setHiitPhase] = useState<'prep' | 'work' | 'rest' | 'complete'>('prep');
  const [hiitTimeLeft, setHiitTimeLeft] = useState<number>(10);
  const [hiitRound, setHiitRound] = useState<number>(1);
  const [hiitTotalRounds, setHiitTotalRounds] = useState<number>(10);
  const [hiitWorkDuration, setHiitWorkDuration] = useState<number>(60);
  const [hiitRestDuration, setHiitRestDuration] = useState<number>(60);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [inspectedExercise, setInspectedExercise] = useState<ExerciseDetail | null>(null);
  const [customCircuit, setCustomCircuit] = useState<Record<string, string[]>>({});

  // Calculadora de Frecuencia Cardíaca Máxima (Fórmula de Tanaka: 208 - 0.7 * edad)
  const [athleteAge, setAthleteAge] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('fitmax_athlete_age');
      return saved ? parseInt(saved, 10) : 28;
    } catch {
      return 28;
    }
  });

  const estimatedMaxHr = Math.round(208 - (0.7 * athleteAge));
  const hiitTargetHrMin = Math.round(estimatedMaxHr * 0.85);
  const hiitTargetHrMax = Math.round(estimatedMaxHr * 0.95);

  const hiitPresets: Record<string, {
    name: string;
    description: string;
    work: number;
    rest: number;
    rounds: number;
    evidence: string;
    exercises: string[];
  }> = {
    diez_uno: {
      name: '10×1 Minuto Progresivo',
      description: '1 minuto activo por 1 minuto de pausa suave. El protocolo más amigable y equilibrado para iniciar.',
      work: 60,
      rest: 60,
      rounds: 10,
      evidence: '⭐ Respaldo Alto (Evidencia A)',
      exercises: ['Rodillas arriba (High knees)', 'Sentadilla con salto (Jump Squats)', 'Escaladores rápidos', 'Kettlebell swings']
    },
    noruego: {
      name: 'Noruego 4×4 Clínico',
      description: 'Estándar de oro médico: 4 minutos a intensidad exigente (85-95% FC) por 3 minutos suaves.',
      work: 240,
      rest: 180,
      rounds: 4,
      evidence: '⭐ Respaldo Alto (Evidencia A)',
      exercises: ['Cinta de correr a buen ritmo', 'Bicicleta estática intensa', 'Remo indoor dinámico', 'SkiErg / Sprints continuos']
    },
    tabata: {
      name: 'Método Tabata Express',
      description: 'Entrenamiento de 4 minutos al máximo esfuerzo: 20 segundos intensos por 10 segundos de descanso.',
      work: 20,
      rest: 10,
      rounds: 8,
      evidence: '✓ Respaldo Moderado (Evidencia B)',
      exercises: ['Snatch con mancuerna', 'Jumping Jacks rápidos', 'Escaladores rápidos (Mountain Climbers)', 'Sentadilla con salto (Jump Squats)']
    },
    treinta_treinta: {
      name: '30/30 Dinámico',
      description: '30 segundos vivos por 30 segundos de recuperación. Excelente para deportes de equipo y corredores.',
      work: 30,
      rest: 30,
      rounds: 12,
      evidence: '✓ Respaldo Moderado (Evidencia B)',
      exercises: ['Burpees completos', 'Zancadas de salto alternadas', 'Skaters laterales', 'Saltos de cuerda']
    },
    sit: {
      name: 'Sprint Interval (SIT a Fondo)',
      description: '30 segundos a potencia máxima seguidos de descanso largo para recuperación de fosfocreatina.',
      work: 30,
      rest: 210,
      rounds: 4,
      evidence: '⭐ Respaldo Alto (Evidencia A)',
      exercises: ['Sprint en cinta o llano', 'AirBike a máxima potencia', 'Empuje de trineo veloz', 'Sprint en cuesta']
    },
    shred: {
      name: 'Circuito Funcional Quemador',
      description: 'Cardio y fuerza funcional en movimiento continuo con estaciones dinámicas.',
      work: 40,
      rest: 20,
      rounds: 10,
      evidence: '✓ Respaldo Moderado (Evidencia B)',
      exercises: ['Burpees completos', 'Zancadas de salto alternadas', 'Flexiones explosivas', 'Plancha con saltos (Plank Jacks)']
    }
  };

  const handleShuffleCircuit = () => {
    const shuffled = [...HIIT_EXERCISE_POOL].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 4);
    setCustomCircuit((prev) => ({
      ...prev,
      [hiitPreset]: selected
    }));
  };

  const activeExercises = customCircuit[hiitPreset] || hiitPresets[hiitPreset].exercises;

  useEffect(() => {
    const config = hiitPresets[hiitPreset];
    setHiitTotalRounds(config.rounds);
    setHiitWorkDuration(config.work);
    setHiitRestDuration(config.rest);
    setHiitRound(1);
    setHiitPhase('prep');
    setHiitTimeLeft(10);
    setHiitRunning(false);
  }, [hiitPreset]);

  useEffect(() => {
    let intervalId: any = null;
    if (hiitRunning && hiitPhase !== 'complete') {
      intervalId = setInterval(() => {
        setHiitTimeLeft((prev) => {
          if (prev === 4 || prev === 3 || prev === 2) {
            playBeepSound(isMuted);
          }

          if (prev <= 1) {
            if (hiitPhase === 'prep') {
              setHiitPhase('work');
              playBeepSound(isMuted);
              return hiitWorkDuration;
            } else if (hiitPhase === 'work') {
              if (hiitRound === hiitTotalRounds) {
                setHiitPhase('complete');
                setHiitRunning(false);
                playBeepSound(isMuted);
                return 0;
              } else {
                setHiitPhase('rest');
                playBeepSound(isMuted);
                return hiitRestDuration;
              }
            } else if (hiitPhase === 'rest') {
              setHiitRound((r) => r + 1);
              setHiitPhase('work');
              playBeepSound(isMuted);
              return hiitWorkDuration;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [hiitRunning, hiitTimeLeft, hiitPhase, hiitRound, hiitTotalRounds, hiitWorkDuration, hiitRestDuration, isMuted]);

  return (
    <div className="flex flex-col flex-1 h-full gap-5">
      {/* HEADER & SELECTOR DE PRESET */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-100 pb-4 gap-4">
        <div>
          <span className="bg-red-100 text-red-700 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-block mb-1 shadow-sm border border-red-200">
            Cardio Intervalos
          </span>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900">
            Entrenador Cardio HIIT Interactivo
          </h2>
          <p className="text-zinc-500 text-xs mt-0.5">
            Selecciona un protocolo de entrenamiento a intervalos y sigue el temporizador acústico asistido.
          </p>
        </div>

        <button
          onClick={() => setIsMuted(!isMuted)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition-all"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-zinc-400" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
          <span>{isMuted ? 'Silenciado' : 'Sonido activo'}</span>
        </button>
      </div>

      {/* CALCULADORA DE PULSACIONES DE ORO (FÓRMULA DE TANAKA) */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 p-4 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
            <HeartPulse className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              Zona Cardíaca Recomendada para tu Edad
              <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-bold">
                Fórmula de Tanaka
              </span>
            </h4>
            <p className="text-[11px] text-zinc-300 mt-0.5 leading-snug">
              En los intervalos fuertes busca entre <strong className="text-rose-400">{hiitTargetHrMin} y {hiitTargetHrMax} pulsaciones por minuto</strong> (FC Máx estimada: {estimatedMaxHr} ppm).
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto bg-zinc-900/80 px-3 py-1.5 rounded-2xl border border-zinc-800">
          <span className="text-[11px] text-zinc-400 font-bold">Tu Edad:</span>
          <input
            type="number"
            min="14"
            max="90"
            value={athleteAge}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10) || 28;
              setAthleteAge(val);
              try { localStorage.setItem('fitmax_athlete_age', String(val)); } catch (e) {}
            }}
            className="w-14 bg-zinc-950 border border-zinc-700 text-white font-black text-xs px-2 py-1 rounded-xl text-center focus:border-rose-500 outline-none"
          />
          <span className="text-xs text-zinc-400 font-bold">años</span>
        </div>
      </div>

      {/* TARJETAS DE PROTOCOLOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {(Object.keys(hiitPresets) as Array<keyof typeof hiitPresets>).map((presetId) => {
          const preset = hiitPresets[presetId];
          const isSelected = hiitPreset === presetId;
          return (
            <button
              key={presetId}
              onClick={() => setHiitPreset(presetId)}
              className={`p-4 rounded-3xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-red-500/10 border-red-500 ring-1 ring-red-400 shadow-md'
                  : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300 hover:bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-red-500/20 text-red-600' : 'bg-zinc-200 text-zinc-700'
                  }`}>
                    {preset.evidence}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 font-bold">
                    {preset.rounds} rondas
                  </span>
                </div>
                <p className={`text-xs font-black ${isSelected ? 'text-red-600' : 'text-zinc-900'}`}>
                  {preset.name}
                </p>
                <p className="text-[11px] text-zinc-500 leading-snug mt-1">
                  {preset.description}
                </p>
              </div>
              <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-dashed border-zinc-200 text-[10px] font-bold text-zinc-600">
                <span>⏱️ Trabajo: {preset.work}s</span>
                <span>😮‍💨 Pausa: {preset.rest}s</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* CONSOLA PRINCIPAL DEL TEMPORIZADOR */}
      <div className="bg-zinc-950 text-white rounded-3xl p-6 border border-zinc-800 shadow-2xl flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
        {/* Círculo indicador */}
        <div
          className="w-40 h-40 rounded-full border-4 flex flex-col items-center justify-center shrink-0 shadow-lg relative z-10 transition-all duration-300 select-none bg-zinc-900/60 backdrop-blur-sm"
          style={{
            borderColor:
              hiitPhase === 'work' ? '#ef4444' :
              hiitPhase === 'rest' ? '#10b981' :
              hiitPhase === 'prep' ? '#f59e0b' : '#a855f7'
          }}
        >
          <span
            className={`text-[10px] font-black uppercase tracking-wider ${
              hiitPhase === 'work' ? 'text-red-500 animate-pulse' :
              hiitPhase === 'rest' ? 'text-emerald-400' :
              hiitPhase === 'prep' ? 'text-amber-400' : 'text-purple-400'
            }`}
          >
            {hiitPhase === 'prep' ? 'Prepárate' :
             hiitPhase === 'work' ? '¡Entrena!' :
             hiitPhase === 'rest' ? '¡Descansa!' : 'Terminado'}
          </span>

          <span className="text-5xl font-black font-mono tracking-tight tabular-nums mt-1">
            {hiitPhase === 'complete' ? '🎉' : `${hiitTimeLeft}s`}
          </span>

          <span className="text-[10px] font-bold text-zinc-400 mt-1">
            Ronda {hiitRound} / {hiitTotalRounds}
          </span>
        </div>

        {/* Controles y progreso */}
        <div className="flex-1 space-y-4 relative z-10 w-full">
          <div>
            <h3 className="text-lg font-extrabold flex items-center gap-1.5 text-zinc-100">
              <Clock className="w-5 h-5 text-red-500" />
              {hiitPhase === 'complete'
                ? '¡Entrenamiento HIIT Finalizado con Éxito!'
                : `Sesión: ${hiitPresets[hiitPreset].name}`}
            </h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              {hiitPhase === 'prep' && 'Prepárate para iniciar con máxima intensidad.'}
              {hiitPhase === 'work' && '¡Máxima potencia! Realiza el ejercicio a máxima velocidad.'}
              {hiitPhase === 'rest' && 'Reduce pulsaciones levemente, respira hondo.'}
              {hiitPhase === 'complete' && 'Has completado el protocolo HIIT de hoy. Gran trabajo aeróbico.'}
            </p>
          </div>

          {/* Barra de progreso */}
          {hiitPhase !== 'complete' && (
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-extrabold text-zinc-400">
                <span>Progreso de Fase</span>
                <span className="font-mono">
                  {hiitTimeLeft} / {hiitPhase === 'prep' ? 10 : hiitPhase === 'work' ? hiitWorkDuration : hiitRestDuration}s
                </span>
              </div>
              <div className="w-full bg-zinc-900 rounded-full h-2 border border-zinc-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                    hiitPhase === 'work' ? 'bg-red-500' : hiitPhase === 'rest' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{
                    width: `${(hiitTimeLeft / (hiitPhase === 'prep' ? 10 : hiitPhase === 'work' ? hiitWorkDuration : hiitRestDuration)) * 100}%`
                  }}
                />
              </div>
            </div>
          )}

          {/* Fila de controles */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setHiitRunning(!hiitRunning)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md ${
                hiitRunning
                  ? 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700'
                  : 'bg-red-500 text-zinc-950 font-extrabold hover:bg-red-400'
              }`}
            >
              {hiitRunning ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-zinc-950" />}
              <span>{hiitRunning ? 'Pausar' : 'Comenzar Cardio'}</span>
            </button>

            <button
              onClick={() => {
                setHiitRunning(false);
                setHiitRound(1);
                setHiitPhase('prep');
                setHiitTimeLeft(10);
              }}
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold px-4 py-2.5 rounded-xl text-xs"
            >
              Reiniciar
            </button>

            {hiitPhase !== 'complete' && (
              <button
                onClick={() => setHiitTimeLeft(1)}
                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-500 hover:text-zinc-300 font-bold px-3 py-2.5 rounded-xl text-[10px] flex items-center gap-1.5 ml-auto"
              >
                Saltar Fase <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CIRCUITO SUGERIDO */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-5 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <h3 className="text-zinc-900 text-sm font-black uppercase tracking-wider flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-red-500" /> Circuito HIIT Sugerido
          </h3>
          <button
            onClick={handleShuffleCircuit}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-red-50 border border-zinc-200 hover:border-red-300 text-zinc-700 hover:text-red-600 rounded-xl text-xs font-bold transition-all shadow-sm self-start sm:self-auto"
            title="Generar nueva combinación de ejercicios para este protocolo"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Cambiar ejercicios</span>
          </button>
        </div>
        <p className="text-xs text-zinc-500 mb-4">
          Realiza el ejercicio según tu ronda durante los {hiitWorkDuration}s de trabajo de forma continua. Toca cualquier ejercicio para ver su técnica y ejecución.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {activeExercises.map((exercise, idx) => (
            <div
              key={idx}
              onClick={() => setInspectedExercise(findExerciseDetail(exercise))}
              className={`p-3 rounded-2xl border transition-all cursor-pointer group hover:border-red-400 hover:shadow-md ${
                hiitRound % activeExercises.length === (idx + 1) % activeExercises.length && hiitRunning && hiitPhase === 'work'
                  ? 'bg-red-50 border-red-400 ring-2 ring-red-400/50 shadow'
                  : 'bg-white border-zinc-200'
              }`}
              title="Toca para ver técnica y postura correcta"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 text-[10px] font-black flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-[10px] font-black text-zinc-400 uppercase">Estación</span>
                </div>
                <Info className="w-3.5 h-3.5 text-zinc-400 group-hover:text-red-500 transition-colors" />
              </div>
              <p className="text-xs font-black text-zinc-900 group-hover:text-red-600 transition-colors">{exercise}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL DE TÉCNICA DETALLADA */}
      {inspectedExercise && (
        <ExerciseDetailModal
          exercise={inspectedExercise}
          onClose={() => setInspectedExercise(null)}
        />
      )}
    </div>
  );
}
