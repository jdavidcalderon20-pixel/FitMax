import React, { useState, useEffect, useRef } from 'react';
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
  Sparkles,
  Dumbbell,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { playBeepSound } from '../lib/sound';
import { ExerciseDetail, findExerciseDetail } from '../lib/exerciseBank';
import ExerciseDetailModal from './ExerciseDetailModal';
import EvidenceBadge from './EvidenceBadge';
import { FUNCTIONAL_ROUTINES, FunctionalRoutine } from '../data/functionalRoutinesData';

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
  'Saltos de cuerda virtuales',
  'Thruster con kettlebells o mancuernas',
  'Cargada con kettlebell o mancuerna (Clean)',
  'Saltos al cajón (Box jumps)'
];

export default function HiitModule() {
  // Modo de disciplina: HIIT vs Funcional
  const [cardioMode, setCardioMode] = useState<'hiit' | 'functional'>('hiit');

  // Estados de HIIT
  const [hiitPreset, setHiitPreset] = useState<string>('diez_uno');
  const [customCircuit, setCustomCircuit] = useState<Record<string, string[]>>({});
  const [showCircuit, setShowCircuit] = useState<boolean>(true);

  // Estados de Funcional
  const [selectedFunctionalId, setSelectedFunctionalId] = useState<string>('functional_fullbody_cargas');

  // Estados del temporizador
  const [hiitRunning, setHiitRunning] = useState<boolean>(false);
  const [hiitPhase, setHiitPhase] = useState<'prep' | 'work' | 'rest' | 'complete'>('prep');
  const [hiitTimeLeft, setHiitTimeLeft] = useState<number>(10);
  const [hiitRound, setHiitRound] = useState<number>(1);
  const [hiitTotalRounds, setHiitTotalRounds] = useState<number>(10);
  const [hiitWorkDuration, setHiitWorkDuration] = useState<number>(60);
  const [hiitRestDuration, setHiitRestDuration] = useState<number>(60);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [inspectedExercise, setInspectedExercise] = useState<ExerciseDetail | null>(null);

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
      exercises: ['Rodillas arriba', 'Sentadillas con salto', 'Escaladores (Mountain climbers)', 'Balanceos con pesa rusa (Kettlebell swings)']
    },
    noruego: {
      name: 'Noruego 4×4 Clínico',
      description: 'Estándar de oro médico: 4 minutos a intensidad exigente (85-95% FC) por 3 minutos suaves.',
      work: 240,
      rest: 180,
      rounds: 4,
      evidence: 'A',
      exercises: ['Cinta de correr a buen ritmo', 'Bicicleta estática intensa', 'Remo en máquina (Rowing)', 'SkiErg (máquina de esquí)']
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
      exercises: ['Cinta de correr a buen ritmo', 'Bicicleta estática intensa', 'Empuje de trineo (Sled push)', 'Burpees completos']
    },
    shred: {
      name: 'Circuito Metabólico Rápido',
      description: 'Cardio y fuerza funcional en movimiento continuo con estaciones dinámicas.',
      work: 40,
      rest: 20,
      rounds: 10,
      evidence: 'B',
      exercises: ['Burpees completos', 'Zancadas con salto alternadas', 'Flexiones explosivas', 'Plancha con saltos de pies']
    }
  };

  const activeFunctionalRoutine = FUNCTIONAL_ROUTINES.find((r) => r.id === selectedFunctionalId) || FUNCTIONAL_ROUTINES[0];

  const handleShuffleCircuit = () => {
    const shuffled = [...HIIT_EXERCISE_POOL].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 4);
    setCustomCircuit((prev) => ({
      ...prev,
      [hiitPreset]: selected
    }));
  };

  const activeExercises = customCircuit[hiitPreset] || hiitPresets[hiitPreset].exercises;

  // Sincronización del temporizador según el modo activo
  useEffect(() => {
    if (cardioMode === 'hiit') {
      const config = hiitPresets[hiitPreset];
      setHiitTotalRounds(config.rounds);
      setHiitWorkDuration(config.work);
      setHiitRestDuration(config.rest);
    } else {
      const totalIntervals = activeFunctionalRoutine.rounds * activeFunctionalRoutine.stations.length;
      setHiitTotalRounds(totalIntervals);
      setHiitWorkDuration(activeFunctionalRoutine.workSec);
      setHiitRestDuration(activeFunctionalRoutine.restSec);
    }
    setHiitRound(1);
    setHiitPhase('prep');
    setHiitTimeLeft(10);
    setHiitRunning(false);
  }, [cardioMode, hiitPreset, selectedFunctionalId]);

  // Referencia mutable atómica para el temporizador que evita desincronizaciones y dobles incrementos
  const hiitStateRef = useRef({
    running: hiitRunning,
    phase: hiitPhase,
    timeLeft: hiitTimeLeft,
    round: hiitRound,
    totalRounds: hiitTotalRounds,
    workDuration: hiitWorkDuration,
    restDuration: hiitRestDuration,
    isMuted
  });

  useEffect(() => {
    hiitStateRef.current = {
      running: hiitRunning,
      phase: hiitPhase,
      timeLeft: hiitTimeLeft,
      round: hiitRound,
      totalRounds: hiitTotalRounds,
      workDuration: hiitWorkDuration,
      restDuration: hiitRestDuration,
      isMuted
    };
  });

  useEffect(() => {
    let intervalId: any = null;
    if (hiitRunning) {
      intervalId = setInterval(() => {
        const state = hiitStateRef.current;
        if (!state.running || state.phase === 'complete') return;

        // Beep en los últimos 3 segundos
        if (state.timeLeft === 4 || state.timeLeft === 3 || state.timeLeft === 2) {
          playBeepSound(state.isMuted);
        }

        if (state.timeLeft <= 1) {
          playBeepSound(state.isMuted);

          if (state.phase === 'prep') {
            setHiitPhase('work');
            setHiitTimeLeft(state.workDuration);
          } else if (state.phase === 'work') {
            if (state.round >= state.totalRounds) {
              setHiitPhase('complete');
              setHiitRunning(false);
              setHiitTimeLeft(0);
            } else {
              setHiitPhase('rest');
              setHiitTimeLeft(state.restDuration);
            }
          } else if (state.phase === 'rest') {
            // Avance estricto y atómico de ronda
            setHiitRound(state.round + 1);
            setHiitPhase('work');
            setHiitTimeLeft(state.workDuration);
          }
        } else {
          setHiitTimeLeft(state.timeLeft - 1);
        }
      }, 1000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [hiitRunning]);

  // Estación actual activa en modo funcional o HIIT
  const activeHiitPresetObj = hiitPresets[hiitPreset];
  const hiitStationsList = activeHiitPresetObj.exercises;
  const currentHiitStationIndex = (hiitRound - 1) % hiitStationsList.length;
  const nextHiitStationIndex = hiitRound % hiitStationsList.length;

  const currentStationIndex = (hiitRound - 1) % activeFunctionalRoutine.stations.length;
  const nextStationIndex = hiitRound % activeFunctionalRoutine.stations.length;
  const currentStation = activeFunctionalRoutine.stations[currentStationIndex];
  const nextStation = activeFunctionalRoutine.stations[nextStationIndex];
  const currentRoundNumber = Math.floor((hiitRound - 1) / activeFunctionalRoutine.stations.length) + 1;

  return (
    <div className="flex flex-col flex-1 h-full gap-5 animate-fadeIn pb-16">
      {/* CABECERA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#282F38] pb-4 gap-4">
        <div>
          <span className="bg-[#FB923C]/15 text-[#FB923C] px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-block mb-1 border border-[#FB923C]/30">
            Acondicionamiento Físico
          </span>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-[#F4F2ED]">
            Cardio HIIT &amp; Entrenamiento Funcional
          </h2>
          <p className="text-[#A8B0BB] text-xs mt-0.5">
            Alterna entre protocolos de intervalos o circuitos funcionales con cronómetro interactivo.
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

      {/* SELECTOR DE MODALIDAD: CARDIO HIIT vs ENTRENAMIENTO FUNCIONAL */}
      <div className="flex items-center gap-2 p-1.5 bg-[#20252C] border border-[#282F38] rounded-2xl w-fit">
        <button
          onClick={() => setCardioMode('hiit')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
            cardioMode === 'hiit'
              ? 'bg-[#FB923C] text-[#15181D] shadow-md scale-100'
              : 'text-[#A8B0BB] hover:text-[#F4F2ED] hover:bg-[#15181D]'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Cardio HIIT Metabólico</span>
        </button>

        <button
          onClick={() => setCardioMode('functional')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
            cardioMode === 'functional'
              ? 'bg-[#1FD08A] text-[#15181D] shadow-md scale-100'
              : 'text-[#A8B0BB] hover:text-[#F4F2ED] hover:bg-[#15181D]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Entrenamiento Funcional</span>
        </button>
      </div>

      {/* SECCIÓN MODO HIIT: CALCULADORA Y PROTOCOLOS */}
      {cardioMode === 'hiit' && (
        <div className="space-y-4 animate-fadeIn">
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

          {/* SELECTOR DE PROTOCOLOS HIIT */}
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

          {/* Tarjeta de Circuito Seleccionado para HIIT (Alineado con Funcional) */}
          <div className="bg-[#20252C] border border-[#282F38] rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap border-b border-[#282F38] pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-[#FB923C] tracking-wider">
                  Protocolo seleccionado
                </span>
                <h3 className="text-sm sm:text-base font-black text-[#F4F2ED]">
                  {activeHiitPresetObj.name}
                </h3>
                <p className="text-xs text-[#A8B0BB] mt-0.5">
                  {hiitStationsList.length} estaciones recomendadas · {activeHiitPresetObj.rounds} intervalos de esfuerzo puro.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black text-[#FB923C] bg-[#FB923C]/10 border border-[#FB923C]/20 px-3 py-1 rounded-xl">
                  {activeHiitPresetObj.work}s Trabajo / {activeHiitPresetObj.rest}s Pausa
                </span>
              </div>
            </div>

            {/* Estaciones recomendadas de este protocolo con botón para ver técnica y fotos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              {hiitStationsList.map((exName, sIdx) => {
                const isCurrentStationInTimer = cardioMode === 'hiit' && hiitRunning && currentHiitStationIndex === sIdx;
                const detail = findExerciseDetail(exName);
                return (
                  <div
                    key={sIdx}
                    onClick={() => setInspectedExercise(detail)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
                      isCurrentStationInTimer
                        ? 'bg-[#FB923C]/20 border-[#FB923C] ring-1 ring-[#FB923C] shadow-md'
                        : 'bg-[#15181D] border-[#282F38] hover:border-[#38414D]'
                    }`}
                    title="Toca para ver técnica y fotos de demostración"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="w-5 h-5 rounded-full bg-[#FB923C]/20 text-[#FB923C] text-[10px] font-black flex items-center justify-center">
                          {sIdx + 1}
                        </span>
                        <Info className="w-3.5 h-3.5 text-[#A8B0BB] group-hover:text-[#FB923C] transition-colors" />
                      </div>
                      <p className="text-xs font-bold text-[#F4F2ED] group-hover:text-[#FB923C] transition-colors line-clamp-2">
                        {exName}
                      </p>
                    </div>
                    <p className="text-[10px] text-[#A8B0BB] mt-2 pt-1 border-t border-[#282F38]/60 leading-tight">
                      {detail.targetFocus || detail.muscleGroup}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Consejos del coach para este protocolo */}
            <div className="bg-[#15181D] border border-[#282F38] rounded-2xl p-3 text-xs text-[#A8B0BB] space-y-1">
              <span className="text-[10px] font-black uppercase text-[#FB923C] block">
                Consejos del coach para este protocolo:
              </span>
              <p className="text-zinc-300 text-[11px] leading-relaxed">
                {activeHiitPresetObj.description} En los intervalos de descanso activo, camina suavemente y respira hondo por la nariz para disipar el lactato muscular sin detenerte de golpe.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN MODO FUNCIONAL: RUTINAS Y CIRCUITOS ESTRUCTURADOS */}
      {cardioMode === 'functional' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Tarjetas de selección de rutina funcional */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FUNCTIONAL_ROUTINES.map((routine) => {
              const isSelected = routine.id === selectedFunctionalId;
              return (
                <div
                  key={routine.id}
                  onClick={() => setSelectedFunctionalId(routine.id)}
                  className={`p-4 rounded-3xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#1FD08A]/10 border-[#1FD08A] ring-1 ring-[#1FD08A] shadow-md'
                      : 'bg-[#20252C] border-[#282F38] hover:border-[#38414D]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#1FD08A]/15 text-[#1FD08A] border border-[#1FD08A]/30">
                        {routine.categoryLabel}
                      </span>
                      <span className="text-[10px] font-bold text-[#A8B0BB]">
                        ~{routine.totalDurationMin} min · {routine.rounds} vueltas
                      </span>
                    </div>

                    <h4 className={`text-sm font-black ${isSelected ? 'text-[#1FD08A]' : 'text-[#F4F2ED]'}`}>
                      {routine.name}
                    </h4>
                    <p className="text-xs text-[#A8B0BB] mt-1 leading-snug">
                      {routine.shortDesc}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#282F38] flex items-center justify-between text-[11px] text-[#A8B0BB]">
                    <span>📦 Equipo: <strong className="text-white">{routine.equipment}</strong></span>
                    <span>⏱️ {routine.workSec}s / {routine.restSec}s</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resumen del circuito funcional y estaciones */}
          <div className="bg-[#20252C] border border-[#282F38] rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap border-b border-[#282F38] pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-[#1FD08A] tracking-wider">
                  Circuito seleccionado
                </span>
                <h3 className="text-sm sm:text-base font-black text-[#F4F2ED]">
                  {activeFunctionalRoutine.name}
                </h3>
                <p className="text-xs text-[#A8B0BB] mt-0.5">
                  {activeFunctionalRoutine.stations.length} ejercicios · {activeFunctionalRoutine.rounds} vueltas completas ({activeFunctionalRoutine.rounds * activeFunctionalRoutine.stations.length} intervalos de trabajo).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black text-[#1FD08A] bg-[#1FD08A]/10 border border-[#1FD08A]/20 px-3 py-1 rounded-xl">
                  {activeFunctionalRoutine.workSec}s Trabajo / {activeFunctionalRoutine.restSec}s Pausa
                </span>
              </div>
            </div>

            {/* Lista de estaciones con botón para ver técnica detallada */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {activeFunctionalRoutine.stations.map((st, sIdx) => {
                const isCurrentStationInTimer = cardioMode === 'functional' && hiitRunning && currentStationIndex === sIdx;
                return (
                  <div
                    key={sIdx}
                    onClick={() => setInspectedExercise(findExerciseDetail(st.name))}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
                      isCurrentStationInTimer
                        ? 'bg-[#1FD08A]/20 border-[#1FD08A] ring-1 ring-[#1FD08A] shadow-md'
                        : 'bg-[#15181D] border-[#282F38] hover:border-[#38414D]'
                    }`}
                    title="Toca para ver técnica y fotos de demostración"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="w-5 h-5 rounded-full bg-[#1FD08A]/20 text-[#1FD08A] text-[10px] font-black flex items-center justify-center">
                          {sIdx + 1}
                        </span>
                        <Info className="w-3.5 h-3.5 text-[#A8B0BB] group-hover:text-[#1FD08A] transition-colors" />
                      </div>
                      <p className="text-xs font-bold text-[#F4F2ED] group-hover:text-[#1FD08A] transition-colors line-clamp-2">
                        {st.name}
                      </p>
                    </div>
                    <p className="text-[10px] text-[#A8B0BB] mt-2 pt-1 border-t border-[#282F38]/60 leading-tight">
                      {st.focus}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Consejos del coach para este circuito */}
            <div className="bg-[#15181D] border border-[#282F38] rounded-2xl p-3 text-xs text-[#A8B0BB] space-y-1">
              <span className="text-[10px] font-black uppercase text-[#1FD08A] block">
                Consejos del coach para esta rutina:
              </span>
              <div className="space-y-1">
                {activeFunctionalRoutine.coachTips.map((tip, i) => (
                  <p key={i} className="flex items-start gap-1.5 text-zinc-300 text-[11px]">
                    <span className="text-[#1FD08A] font-bold">•</span>
                    <span>{tip}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONSOLA PRINCIPAL: TEMPORIZADOR ASISTIDO */}
      <div className="bg-[#15181D] text-white rounded-3xl p-6 border-2 border-[#282F38] shadow-2xl flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
        {/* Círculo indicador */}
        <div
          className="w-44 h-44 rounded-full border-4 flex flex-col items-center justify-center shrink-0 shadow-lg relative z-10 transition-all duration-300 select-none bg-[#20252C]/80 backdrop-blur-sm"
          style={{
            borderColor:
              hiitPhase === 'work' ? (cardioMode === 'hiit' ? '#FB923C' : '#1FD08A') :
              hiitPhase === 'rest' ? '#5B8DEF' :
              hiitPhase === 'prep' ? '#FBBF24' : '#C084FC'
          }}
        >
          <span
            className={`text-[10px] font-black uppercase tracking-wider ${
              hiitPhase === 'work' ? (cardioMode === 'hiit' ? 'text-[#FB923C] animate-pulse' : 'text-[#1FD08A] animate-pulse') :
              hiitPhase === 'rest' ? 'text-[#5B8DEF]' :
              hiitPhase === 'prep' ? 'text-amber-400' : 'text-purple-400'
            }`}
          >
            {hiitPhase === 'prep' ? 'Prepárate' :
             hiitPhase === 'work' ? '¡En acción!' :
             hiitPhase === 'rest' ? 'Descanso' : 'Completado'}
          </span>

          <span className="text-5xl font-black font-mono tracking-tight tabular-nums mt-1 text-[#F4F2ED]">
            {hiitPhase === 'complete' ? '🎉' : `${hiitTimeLeft}s`}
          </span>

          <span className="text-[10px] font-bold text-[#A8B0BB] mt-1">
            {cardioMode === 'functional'
              ? `Vuelta ${currentRoundNumber} · Intervalo ${hiitRound}/${hiitTotalRounds}`
              : `Ronda ${hiitRound} de ${hiitTotalRounds}`}
          </span>
        </div>

        {/* Controles y progreso */}
        <div className="flex-1 space-y-4 relative z-10 w-full">
          <div>
            <h3 className="text-lg font-extrabold flex items-center gap-1.5 text-[#F4F2ED]">
              <Clock className="w-5 h-5 text-[#FB923C]" />
              {hiitPhase === 'complete'
                ? '¡Sesión finalizada con éxito!'
                : hiitPhase === 'prep'
                ? 'Prepárate para comenzar'
                : hiitPhase === 'rest'
                ? (cardioMode === 'functional'
                    ? `Pausa (Próximo: ${nextStation?.name || 'Siguiente'})`
                    : `Pausa (Próximo: ${hiitStationsList[nextHiitStationIndex] || 'Siguiente'})`)
                : cardioMode === 'functional'
                ? `Estación ${currentStationIndex + 1}: ${currentStation?.name || activeFunctionalRoutine.name}`
                : `Estación ${currentHiitStationIndex + 1}: ${hiitStationsList[currentHiitStationIndex] || activeHiitPresetObj.name}`}
            </h3>
            <p className="text-xs text-[#A8B0BB] mt-1 leading-relaxed">
              {hiitPhase === 'prep' && 'Ajusta tu postura e inicia en cuanto suene el pitido.'}
              {hiitPhase === 'work' && (
                cardioMode === 'functional'
                  ? `Enfócate en: ${currentStation?.focus || 'Intervalo activo de trabajo'}`
                  : `Realiza: ${hiitStationsList[currentHiitStationIndex]}. ¡Intensidad sostenida!`
              )}
              {hiitPhase === 'rest' && (
                <span>
                  Respira profundo por la nariz y exhala por la boca. Siguiente estación: <strong className="text-white">{cardioMode === 'functional' ? nextStation?.name : hiitStationsList[nextHiitStationIndex]}</strong>.
                </span>
              )}
              {hiitPhase === 'complete' && 'Has completado el entrenamiento de hoy. Gran trabajo de acondicionamiento.'}
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
                    hiitPhase === 'work' ? (cardioMode === 'hiit' ? 'bg-[#FB923C]' : 'bg-[#1FD08A]') : hiitPhase === 'rest' ? 'bg-[#5B8DEF]' : 'bg-amber-400'
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
                  : cardioMode === 'functional'
                  ? 'bg-[#1FD08A] text-[#15181D] font-extrabold hover:bg-[#1ab87a]'
                  : 'bg-[#FB923C] text-[#15181D] font-extrabold hover:bg-[#ea580c]'
              }`}
            >
              {hiitRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-[#15181D]" />}
              <span>{hiitRunning ? 'Pausar' : cardioMode === 'functional' ? 'Iniciar circuito funcional' : 'Comenzar cardio'}</span>
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

      {/* CIRCUITO SUGERIDO PARA HIIT (EN MODO HIIT) */}
      {cardioMode === 'hiit' && (
        <div className="bg-[#20252C] border border-[#282F38] rounded-3xl p-4 sm:p-5 shadow-xl">
          <div 
            onClick={() => setShowCircuit(!showCircuit)}
            className="flex items-center justify-between gap-2 cursor-pointer select-none"
          >
            <div className="flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-[#FB923C]" />
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#F4F2ED]">
                Ejercicios sugeridos para este protocolo ({activeExercises.length} estaciones)
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
                  Realiza el ejercicio según tu ronda durante los {hiitWorkDuration} s de trabajo. Toca cualquier ejercicio para ver su técnica y fotos de demostración.
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
      )}

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
