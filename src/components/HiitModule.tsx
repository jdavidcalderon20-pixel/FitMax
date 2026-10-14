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
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { playBeepSound } from '../lib/sound';
import { ExerciseDetail, findExerciseDetail } from '../lib/exerciseBank';
import ExerciseDetailModal from './ExerciseDetailModal';
import EvidenceBadge from './EvidenceBadge';

const HIIT_EXERCISE_POOL = [
  'Burpees completos',
  'Arrancada con mancuerna (Snatch)',
  'Saltos de tijera (Jumping jacks)',
  'Escaladores (Mountain climbers)',
  'Sentadillas con salto',
  'Zancadas con salto alternadas',
  'Flexiones explosivas',
  'Plancha con saltos de pies',
  'Rodillas arriba',
  'Balanceos con pesa rusa (Kettlebell swings)',
  'Patinadores laterales (Skaters)',
  'Flexiones comando',
  'Hollow rocks de abdomen',
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
  const [showCircuit, setShowCircuit] = useState<boolean>(false); // Plegado por defecto

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
    evidence: 'A' | 'B' | 'C';
    exercises: string[];
  }> = {
    diez_uno: {
      name: '10×1 Minuto Progresivo',
      description: '1 minuto activo por 1 minuto de pausa suave. El protocolo más amigable y equilibrado para iniciar.',
      work: 60,
      rest: 60,
      rounds: 10,
      evidence: 'A',
      exercises: ['Rodillas arriba', 'Sentadillas con salto', 'Escaladores', 'Balanceos con pesa rusa (Kettlebell swings)']
    },
    noruego: {
      name: 'Noruego 4×4 Clínico',
      description: 'Estándar de oro médico: 4 minutos a intensidad exigente (85-95% FC) por 3 minutos suaves.',
      work: 240,
      rest: 180,
      rounds: 4,
      evidence: 'A',
      exercises: ['Cinta de correr a buen ritmo', 'Bicicleta estática intensa', 'Remo indoor dinámico', 'SkiErg (máquina de esquí)']
    },
    tabata: {
      name: 'Método Tabata Express',
      description: 'Entrenamiento de 4 minutos al máximo esfuerzo: 20 segundos intensos por 10 segundos de descanso.',
      work: 20,
      rest: 10,
      rounds: 8,
      evidence: 'B',
      exercises: ['Arrancada con mancuerna (Snatch)', 'Saltos de tijera (Jumping jacks)', 'Escaladores (Mountain climbers)', 'Sentadillas con salto']
    },
    treinta_treinta: {
      name: '30/30 Dinámico',
      description: '30 segundos vivos por 30 segundos de recuperación. Excelente para deportes de equipo y corredores.',
      work: 30,
      rest: 30,
      rounds: 12,
      evidence: 'B',
      exercises: ['Burpees completos', 'Zancadas con salto alternadas', 'Patinadores laterales (Skaters)', 'Saltos de cuerda virtuales']
    },
    sit: {
      name: 'Sprint Interval (SIT a fondo)',
      description: '30 segundos a potencia máxima seguidos de descanso largo para recuperación de fosfocreatina.',
      work: 30,
      rest: 210,
      rounds: 4,
      evidence: 'A',
      exercises: ['Sprint en cinta o llano', 'AirBike a máxima potencia', 'Empuje de trineo (Sled push)', 'Sprint en cuesta']
    },
    shred: {
      name: 'Circuito Funcional Quemador',
      description: 'Cardio y fuerza funcional en movimiento continuo con estaciones dinámicas.',
      work: 40,
      rest: 20,
      rounds: 10,
      evidence: 'B',
      exercises: ['Burpees completos', 'Zancadas con salto alternadas', 'Flexiones explosivas', 'Plancha con saltos de pies']
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
    <div className="flex flex-col flex-1 h-full gap-5 animate-fadeIn pb-16">
      {/* CABECERA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#20252C] pb-4 gap-4">
        <div>
          <span className="bg-[#FB923C]/15 text-[#FB923C] px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-block mb-1 border border-[#FB923C]/30">
            Cardio Intervalos
          </span>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-[#F4F2ED]">
            Cardio HIIT &amp; Acondicionamiento
          </h2>
          <p className="text-[#A8B0BB] text-xs mt-0.5">
            Selecciona tu protocolo y sigue el temporizador acústico asistido.
          </p>
        </div>

        <button
          onClick={() => setIsMuted(!isMuted)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#282F38] text-xs font-bold text-[#A8B0BB] hover:text-[#F4F2ED] bg-[#20252C] transition-all cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-zinc-500" /> : <Volume2 className="w-4 h-4 text-[#1FD08A]" />}
          <span>{isMuted ? 'Silenciado' : 'Sonido activo'}</span>
        </button>
      </div>

      {/* CALCULADORA DE PULSACIONES DE ORO (FÓRMULA DE TANAKA) */}
      <div className="bg-[#20252C] border border-[#282F38] p-4 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FB923C]/15 text-[#FB923C] flex items-center justify-center shrink-0 border border-[#FB923C]/30">
            <HeartPulse className="w-5 h-5 text-[#FB923C]" />
          </div>
          <div>
            <h4 className="text-xs font-black text-[#F4F2ED] uppercase tracking-wider flex items-center gap-2">
              Zona cardíaca objetivo
              <span className="text-[10px] bg-[#FB923C]/20 text-[#FB923C] px-2 py-0.5 rounded-full font-bold">
                Fórmula Tanaka
              </span>
            </h4>
            <p className="text-[11px] text-[#A8B0BB] mt-0.5 leading-snug">
              En los intervalos fuertes busca entre <strong className="text-[#FB923C]">{hiitTargetHrMin} y {hiitTargetHrMax} ppm</strong> (FC Máx: {estimatedMaxHr} ppm).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto bg-[#15181D] px-3 py-1.5 rounded-2xl border border-[#282F38]">
          <span className="text-[11px] text-[#A8B0BB] font-bold">Edad:</span>
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
            className="w-14 bg-[#20252C] border border-[#282F38] text-[#F4F2ED] font-black text-xs px-2 py-1 rounded-xl text-center focus:border-[#FB923C] outline-none"
          />
          <span className="text-xs text-[#A8B0BB] font-bold">años</span>
        </div>
      </div>

      {/* SELECTOR DE PROTOCOLOS ARRIBA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {(Object.keys(hiitPresets) as Array<keyof typeof hiitPresets>).map((presetId) => {
          const preset = hiitPresets[presetId];
          const isSelected = hiitPreset === presetId;
          return (
            <button
              key={presetId}
              onClick={() => setHiitPreset(presetId)}
              className={`p-4 rounded-3xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'bg-[#FB923C]/10 border-[#FB923C] ring-1 ring-[#FB923C] shadow-md'
                  : 'bg-[#20252C] border-[#282F38] hover:border-[#38414D]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                  <EvidenceBadge evidence={preset.evidence} size="sm" />
                  <span className="text-[10px] font-mono text-[#A8B0BB] font-bold">
                    {preset.rounds} rondas
                  </span>
                </div>
                <p className={`text-xs font-black ${isSelected ? 'text-[#FB923C]' : 'text-[#F4F2ED]'}`}>
                  {preset.name}
                </p>
                <p className="text-[11px] text-[#A8B0BB] leading-snug mt-1">
                  {preset.description}
                </p>
              </div>

              <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-[#282F38] text-[10px] font-bold text-[#A8B0BB]">
                <span>⏱️ Trabajo: {preset.work} s</span>
                <span>😮‍💨 Pausa: {preset.rest} s</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* CONSOLA PRINCIPAL: TEMPORIZADOR GRANDE */}
      <div className="bg-[#15181D] text-white rounded-3xl p-6 border-2 border-[#282F38] shadow-2xl flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
        {/* Círculo indicador */}
        <div
          className="w-44 h-44 rounded-full border-4 flex flex-col items-center justify-center shrink-0 shadow-lg relative z-10 transition-all duration-300 select-none bg-[#20252C]/80 backdrop-blur-sm"
          style={{
            borderColor:
              hiitPhase === 'work' ? '#FB923C' :
              hiitPhase === 'rest' ? '#1FD08A' :
              hiitPhase === 'prep' ? '#FBBF24' : '#C084FC'
          }}
        >
          <span
            className={`text-[10px] font-black uppercase tracking-wider ${
              hiitPhase === 'work' ? 'text-[#FB923C] animate-pulse' :
              hiitPhase === 'rest' ? 'text-[#1FD08A]' :
              hiitPhase === 'prep' ? 'text-amber-400' : 'text-purple-400'
            }`}
          >
            {hiitPhase === 'prep' ? 'Prepárate' :
             hiitPhase === 'work' ? '¡Entrena!' :
             hiitPhase === 'rest' ? '¡Descansa!' : 'Terminado'}
          </span>

          <span className="text-5xl font-black font-mono tracking-tight tabular-nums mt-1 text-[#F4F2ED]">
            {hiitPhase === 'complete' ? '🎉' : `${hiitTimeLeft}s`}
          </span>

          <span className="text-[10px] font-bold text-[#A8B0BB] mt-1">
            Ronda {hiitRound} de {hiitTotalRounds}
          </span>
        </div>

        {/* Controles y progreso */}
        <div className="flex-1 space-y-4 relative z-10 w-full">
          <div>
            <h3 className="text-lg font-extrabold flex items-center gap-1.5 text-[#F4F2ED]">
              <Clock className="w-5 h-5 text-[#FB923C]" />
              {hiitPhase === 'complete'
                ? '¡Entrenamiento HIIT finalizado con éxito!'
                : `Sesión: ${hiitPresets[hiitPreset].name}`}
            </h3>
            <p className="text-xs text-[#A8B0BB] mt-1 leading-relaxed">
              {hiitPhase === 'prep' && 'Prepárate para iniciar con máxima intensidad.'}
              {hiitPhase === 'work' && '¡Máxima potencia! Mantén el ritmo alto durante todo el intervalo.'}
              {hiitPhase === 'rest' && 'Reduce pulsaciones suavemente y respira profundo por la nariz.'}
              {hiitPhase === 'complete' && 'Has completado el protocolo HIIT de hoy. Gran trabajo aeróbico.'}
            </p>
          </div>

          {/* Barra de progreso */}
          {hiitPhase !== 'complete' && (
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-extrabold text-[#A8B0BB]">
                <span>Progreso de fase</span>
                <span className="font-mono">
                  {hiitTimeLeft} / {hiitPhase === 'prep' ? 10 : hiitPhase === 'work' ? hiitWorkDuration : hiitRestDuration} s
                </span>
              </div>
              <div className="w-full bg-[#20252C] rounded-full h-2 border border-[#282F38] overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                    hiitPhase === 'work' ? 'bg-[#FB923C]' : hiitPhase === 'rest' ? 'bg-[#1FD08A]' : 'bg-amber-400'
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
              className={`px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                hiitRunning
                  ? 'bg-[#20252C] text-[#F4F2ED] hover:bg-[#282F38] border border-[#282F38]'
                  : 'bg-[#1FD08A] text-[#15181D] font-extrabold hover:bg-[#1ab87a]'
              }`}
            >
              {hiitRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-[#15181D]" />}
              <span>{hiitRunning ? 'Pausar' : 'Comenzar cardio'}</span>
            </button>

            <button
              onClick={() => {
                setHiitRunning(false);
                setHiitRound(1);
                setHiitPhase('prep');
                setHiitTimeLeft(10);
              }}
              className="bg-[#20252C] hover:bg-[#282F38] border border-[#282F38] text-[#A8B0BB] hover:text-[#F4F2ED] font-bold px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
            >
              Reiniciar
            </button>

            {hiitPhase !== 'complete' && (
              <button
                onClick={() => setHiitTimeLeft(1)}
                className="bg-[#20252C] hover:bg-[#282F38] border border-[#282F38] text-[#A8B0BB] hover:text-[#F4F2ED] font-bold px-3 py-2.5 rounded-xl text-[10px] flex items-center gap-1.5 ml-auto cursor-pointer"
              >
                Saltar fase <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CIRCUITO HIIT SUGERIDO (PLEGADO POR DEFECTO) */}
      <div className="bg-[#20252C] border border-[#282F38] rounded-3xl p-4 sm:p-5 shadow-xl">
        <div 
          onClick={() => setShowCircuit(!showCircuit)}
          className="flex items-center justify-between gap-2 cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-[#FB923C]" />
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#F4F2ED]">
              Circuito HIIT sugerido ({activeExercises.length} ejercicios)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#A8B0BB] font-semibold">
              {showCircuit ? 'Plegar' : 'Ver ejercicios'}
            </span>
            {showCircuit ? <ChevronUp className="w-4 h-4 text-[#A8B0BB]" /> : <ChevronDown className="w-4 h-4 text-[#A8B0BB]" />}
          </div>
        </div>

        {showCircuit && (
          <div className="mt-4 pt-3 border-t border-[#282F38] space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className="text-xs text-[#A8B0BB]">
                Realiza el ejercicio según tu ronda durante los {hiitWorkDuration} s de trabajo. Toca cualquier ejercicio para ver su técnica.
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleShuffleCircuit();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#15181D] hover:bg-[#282F38] border border-[#282F38] text-[#A8B0BB] hover:text-[#F4F2ED] rounded-xl text-xs font-bold transition-all cursor-pointer"
                title="Generar nueva combinación de ejercicios para este protocolo"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Cambiar ejercicios</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              {activeExercises.map((exercise, idx) => (
                <div
                  key={idx}
                  onClick={() => setInspectedExercise(findExerciseDetail(exercise))}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer group ${
                    hiitRound % activeExercises.length === (idx + 1) % activeExercises.length && hiitRunning && hiitPhase === 'work'
                      ? 'bg-[#FB923C]/20 border-[#FB923C] ring-1 ring-[#FB923C]'
                      : 'bg-[#15181D] border-[#282F38] hover:border-[#38414D]'
                  }`}
                  title="Toca para ver técnica y postura correcta"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#FB923C]/20 text-[#FB923C] text-[10px] font-black flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-[10px] font-black text-[#A8B0BB] uppercase">Estación</span>
                    </div>
                    <Info className="w-3.5 h-3.5 text-[#A8B0BB] group-hover:text-[#FB923C] transition-colors" />
                  </div>
                  <p className="text-xs font-black text-[#F4F2ED] group-hover:text-[#FB923C] transition-colors">{exercise}</p>
                </div>
              ))}
            </div>
          </div>
        )}
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
