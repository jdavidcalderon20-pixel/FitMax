import React, { useState } from 'react';
import { Camera, Layers, CheckCircle2, AlertCircle, Dumbbell, ShieldCheck, Sparkles } from 'lucide-react';
import { ExerciseDetail } from '../lib/exerciseBank';
import { findExerciseMedia } from '../lib/exerciseMediaDb';

interface RealExercisePhotoGuideProps {
  exercise: ExerciseDetail;
}

export default function RealExercisePhotoGuide({ exercise }: RealExercisePhotoGuideProps) {
  const [activeTab, setActiveTab] = useState<'both' | 'start' | 'finish'>('both');
  const [img1Error, setImg1Error] = useState(false);
  const [img2Error, setImg2Error] = useState(false);

  // Buscar coincidencia multimedia en la base de datos de fotos reales
  const mediaEntry = findExerciseMedia(exercise.name);

  // Determinar URLs de imágenes
  const startImg = exercise.demoImages?.[0] || mediaEntry?.demoImages[0] || exercise.imageUrl;
  const finishImg = exercise.demoImages?.[1] || mediaEntry?.demoImages[1] || exercise.imageUrl;

  const primaryMuscle = mediaEntry?.primaryMuscle || exercise.targetFocus;
  const secondaryMuscles = mediaEntry?.secondaryMuscles || [];
  const exerciseTitle = mediaEntry?.canonicalName || exercise.name;

  return (
    <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-4 md:p-5 text-white shadow-xl space-y-4">
      {/* HEADER DE LA DEMOSTRACIÓN VISUAL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5" /> Fotografía Técnica Real
            </span>
            <span className="text-[11px] text-zinc-400 font-bold bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-lg">
              {exercise.muscleGroup} • {exercise.equipment}
            </span>
          </div>
          <p className="text-xs text-zinc-300 font-semibold mt-1">
            Demostración en 2 tiempos: <strong className="text-emerald-400">1. Posición Inicial</strong> y <strong className="text-purple-400">2. Contracción Máxima</strong>.
          </p>
        </div>

        {/* SELECTOR DE VISTA */}
        <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 self-start sm:self-auto shrink-0 shadow-inner">
          <button
            onClick={() => setActiveTab('both')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'both'
                ? 'bg-emerald-500 text-zinc-950 font-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Lado a lado
          </button>
          <button
            onClick={() => setActiveTab('start')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'start'
                ? 'bg-zinc-800 text-white font-black'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            1. Inicio
          </button>
          <button
            onClick={() => setActiveTab('finish')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'finish'
                ? 'bg-zinc-800 text-white font-black'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            2. Ejecución
          </button>
        </div>
      </div>

      {/* ÁREA DE FOTOGRAFÍAS REALES */}
      {startImg && finishImg && !img1Error ? (
        <div className="bg-zinc-900/80 rounded-2xl p-3 md:p-4 border border-zinc-800/90 shadow-inner">
          {activeTab === 'both' ? (
            /* VISTA LADO A LADO */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
              {/* FASE 1: INICIO */}
              <div className="flex flex-col items-center bg-zinc-950/70 border border-zinc-800 rounded-xl p-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-0.5 rounded-full mb-2.5">
                  1. Posición Inicial (Inicio)
                </span>
                <div className="w-full h-56 sm:h-64 rounded-lg overflow-hidden bg-black flex items-center justify-center border border-zinc-800 relative group">
                  <img
                    src={startImg}
                    alt={`${exerciseTitle} - Posición inicial`}
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                    onError={() => setImg1Error(true)}
                    loading="lazy"
                  />
                </div>
                <p className="text-[11px] text-zinc-400 text-center mt-2.5 leading-snug">
                  Alinea tu postura y estabiliza el tronco antes de mover la carga.
                </p>
              </div>

              {/* FASE 2: CONTRACCIÓN / FINAL */}
              <div className="flex flex-col items-center bg-zinc-950/70 border border-zinc-800 rounded-xl p-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-0.5 rounded-full mb-2.5">
                  2. Contracción Máxima (Final)
                </span>
                <div className="w-full h-56 sm:h-64 rounded-lg overflow-hidden bg-black flex items-center justify-center border border-zinc-800 relative group">
                  <img
                    src={finishImg}
                    alt={`${exerciseTitle} - Contracción máxima`}
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                    onError={() => setImg2Error(true)}
                    loading="lazy"
                  />
                </div>
                <p className="text-[11px] text-zinc-400 text-center mt-2.5 leading-snug">
                  Llega al punto álgido de contracción sin rebotar ni perder el control.
                </p>
              </div>
            </div>
          ) : activeTab === 'start' ? (
            /* FASE INDIVIDUAL: INICIO */
            <div className="flex flex-col items-center max-w-md mx-auto">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 rounded-full mb-3">
                1. Posición Inicial
              </span>
              <div className="w-full h-72 rounded-xl overflow-hidden bg-black flex items-center justify-center border border-zinc-800 shadow-md">
                <img
                  src={startImg}
                  alt={`${exerciseTitle} - Inicio`}
                  className="w-full h-full object-contain"
                  onError={() => setImg1Error(true)}
                />
              </div>
            </div>
          ) : (
            /* FASE INDIVIDUAL: FINAL */
            <div className="flex flex-col items-center max-w-md mx-auto">
              <span className="text-xs font-black uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3.5 py-1 rounded-full mb-3">
                2. Contracción Máxima / Final
              </span>
              <div className="w-full h-72 rounded-xl overflow-hidden bg-black flex items-center justify-center border border-zinc-800 shadow-md">
                <img
                  src={finishImg}
                  alt={`${exerciseTitle} - Contracción`}
                  className="w-full h-full object-contain"
                  onError={() => setImg2Error(true)}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        /* TARJETA INFORMATIVA SI NO HAY IMÁGENES O FALLA LA RED */
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center space-y-2">
          <Dumbbell className="w-8 h-8 text-emerald-400 mx-auto opacity-70" />
          <h4 className="text-sm font-black text-white">{exercise.name}</h4>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            {exercise.targetFocus}
          </p>
        </div>
      )}

      {/* LEYENDA ANATÓMICA: MÚSCULO PRINCIPAL Y SECUNDARIOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-start gap-2.5 shadow-sm">
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shrink-0 mt-0.5 ring-4 ring-emerald-500/20" />
          <div className="text-xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
              Músculo Principal Activo
            </span>
            <p className="text-zinc-100 font-bold mt-0.5 leading-snug">
              {primaryMuscle}
            </p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-start gap-2.5 shadow-sm">
          <div className="w-3.5 h-3.5 rounded-full bg-purple-400 shrink-0 mt-0.5 ring-4 ring-purple-400/20" />
          <div className="text-xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 block">
              Músculos Secundarios / Sinergistas
            </span>
            <p className="text-zinc-300 font-semibold mt-0.5 leading-snug">
              {secondaryMuscles.length > 0 ? secondaryMuscles.join(' • ') : 'Estabilizadores articulares'}
            </p>
          </div>
        </div>
      </div>

      {/* CONSEJO DE TÉCNICA */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-300 flex items-start gap-2.5 leading-relaxed">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-emerald-200">Clave de ejecución: </strong>
          Cadencia de 2 a 3 segundos en la bajada, pausa de 1 segundo en el estiramiento y subida explosiva pero controlada.
        </div>
      </div>
    </div>
  );
}
