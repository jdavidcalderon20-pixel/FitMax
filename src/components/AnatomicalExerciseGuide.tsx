import React, { useState } from 'react';
import { Target, Sparkles, Activity, Layers, Info } from 'lucide-react';
import { ExerciseDetail } from '../lib/exerciseBank';

interface AnatomicalExerciseGuideProps {
  exercise: ExerciseDetail;
}

type MovementKind = 'bench_press' | 'squat' | 'hip_thrust' | 'pull' | 'biceps' | 'triceps' | 'shoulder' | 'core_cardio';

function detectMovementKind(exercise: ExerciseDetail): MovementKind {
  const name = exercise.name.toLowerCase();
  const group = exercise.muscleGroup.toLowerCase();
  const pattern = exercise.pattern.toLowerCase();

  if (/biceps|bíceps|curl|martillo/i.test(name) || (group === 'brazos' && /curl|martillo/i.test(name))) {
    return 'biceps';
  }
  if (/triceps|tríceps|copa|frances|fondos|pushdown/i.test(name) || (group === 'brazos' && /triceps|tríceps|copa/i.test(name))) {
    return 'triceps';
  }
  if (/thrust|glute|glúteo|puente|rdl|rumano|hip/i.test(name) || group === 'glúteos' || pattern === 'dominante cadera') {
    return 'hip_thrust';
  }
  if (/sentadilla|squat|prensa|cuadriceps|cuádriceps|búlgar|bulgar|lunge|estocada/i.test(name) || group === 'cuádriceps' || pattern === 'dominante rodilla') {
    return 'squat';
  }
  if (/dominada|jalon|jalón|remo|pull|tracción|espalda/i.test(name) || group === 'espalda' || pattern.includes('tracción')) {
    return 'pull';
  }
  if (/militar|press hombro|elevacion|elevación|lateral|pájaro|deltoides/i.test(name) || group === 'hombros' || pattern === 'empuje vertical') {
    return 'shoulder';
  }
  if (/press|pecho|flexion|flexión|push up|fondos pecho/i.test(name) || group === 'pecho' || pattern === 'empuje horizontal') {
    return 'bench_press';
  }
  return 'core_cardio';
}

interface MuscleHighlightData {
  primary: string;
  secondary: string[];
  primaryTone: string;
  secondaryTone: string;
  keyCue: string;
}

function getMuscleHighlights(kind: MovementKind, exercise: ExerciseDetail): MuscleHighlightData {
  switch (kind) {
    case 'bench_press':
      return {
        primary: 'Pectoral Mayor (Fibras esternales y claviculares)',
        secondary: ['Tríceps braquial', 'Deltoides anterior (hombro frontal)'],
        primaryTone: '#f43f5e',
        secondaryTone: '#fb923c',
        keyCue: 'Baja tocando el esternón con codos en ángulo de 45° a 60° (en flecha), empuja sin despegar los omóplatos.'
      };
    case 'squat':
      return {
        primary: 'Cuádriceps (Vasto externo, interno y recto femoral)',
        secondary: ['Glúteo mayor', 'Aductores', 'Core lumbar y abdominal'],
        primaryTone: '#f43f5e',
        secondaryTone: '#fb923c',
        keyCue: 'Inicia flexionando caderas y rodillas a la vez. Mantén el peso en todo el pie y las rodillas apuntando a los dedos.'
      };
    case 'hip_thrust':
      return {
        primary: 'Glúteo Mayor (Fibras superiores e inferiores en acortamiento)',
        secondary: ['Isquiotibiales', 'Erectores espinales', 'Core abdominal'],
        primaryTone: '#f43f5e',
        secondaryTone: '#fb923c',
        keyCue: 'Apoya el banco debajo de las escápulas. Empuja con los talones y contrae arriba con pelvis neutra (sin arquear la espalda).'
      };
    case 'pull':
      return {
        primary: 'Dorsal Ancho y Romboides (Amplitud y densidad de espalda)',
        secondary: ['Bíceps braquial', 'Braquiorradial', 'Deltoides posterior'],
        primaryTone: '#f43f5e',
        secondaryTone: '#fb923c',
        keyCue: 'Deprime y junta los omóplatos antes de tirar. Lleva la barra o mancuerna hacia tu cadera, no solo con los brazos.'
      };
    case 'biceps':
      return {
        primary: 'Bíceps Braquial (Cabeza larga y corta) + Braquial anterior',
        secondary: ['Braquiorradial (antebrazo)', 'Flexores de muñeca'],
        primaryTone: '#f43f5e',
        secondaryTone: '#fb923c',
        keyCue: 'Mantén los codos pegados a los costados y fijos. Sube flexionando el codo sin balancear la espalda ni los hombros.'
      };
    case 'triceps':
      return {
        primary: 'Tríceps Braquial (Cabeza larga, lateral y medial)',
        secondary: ['Ancóneo', 'Pectoral superior (estabilizador)'],
        primaryTone: '#f43f5e',
        secondaryTone: '#fb923c',
        keyCue: 'Extiende los codos por completo en la fase final aguantando 1 segundo. No dejes que los codos se abran hacia afuera.'
      };
    case 'shoulder':
      return {
        primary: 'Deltoides Medio y Anterior (Anchura y redondez del hombro)',
        secondary: ['Tríceps', 'Trapecio superior', 'Serrato anterior'],
        primaryTone: '#f43f5e',
        secondaryTone: '#fb923c',
        keyCue: 'Empuja verticalmente manteniendo las costillas abajo y el abdomen tenso para evitar hiperextensión lumbar.'
      };
    case 'core_cardio':
    default:
      return {
        primary: 'Core Funcional (Recto abdominal y transverso) / Capacidad Aeróbica',
        secondary: ['Glúteos', 'Hombros estabilizadores', 'Musculatura escapular'],
        primaryTone: '#f43f5e',
        secondaryTone: '#fb923c',
        keyCue: 'Mantén una columna neutra y rígida. Respira rítmicamente sin perder la tensión de la faja abdominal.'
      };
  }
}

export default function AnatomicalExerciseGuide({ exercise }: AnatomicalExerciseGuideProps) {
  const [activePhase, setActivePhase] = useState<'phase1' | 'phase2'>('phase2');
  const [showSideBySide, setShowSideBySide] = useState<boolean>(true);

  const kind = detectMovementKind(exercise);
  const highlights = getMuscleHighlights(kind, exercise);

  return (
    <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-4 md:p-5 text-white shadow-xl space-y-4">
      {/* CABECERA DE LA GUÍA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Guía Anatómica Ilustrada
            </span>
            <span className="text-[11px] font-mono text-zinc-400 font-bold">
              Estilo 2 Fases (Inicio & Fin)
            </span>
          </div>
          <p className="text-xs text-zinc-300 mt-1 font-semibold">
            Músculos implicados resaltados en <strong className="text-rose-400">coral</strong> (principal) y <strong className="text-orange-400">ámbar</strong> (sinergistas).
          </p>
        </div>

        {/* SELECTOR DE MODO O FASE */}
        <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 self-start sm:self-auto">
          <button
            onClick={() => {
              setShowSideBySide(true);
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              showSideBySide
                ? 'bg-rose-500 text-zinc-950 font-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Lado a lado
          </button>
          <button
            onClick={() => {
              setShowSideBySide(false);
              setActivePhase('phase1');
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              !showSideBySide && activePhase === 'phase1'
                ? 'bg-zinc-800 text-white font-black'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            1. Inicio
          </button>
          <button
            onClick={() => {
              setShowSideBySide(false);
              setActivePhase('phase2');
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              !showSideBySide && activePhase === 'phase2'
                ? 'bg-zinc-800 text-white font-black'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            2. Contracción
          </button>
        </div>
      </div>

      {/* ÁREA DE ILUSTRACIONES */}
      <div className="bg-white rounded-2xl p-4 md:p-6 text-zinc-900 border border-zinc-200 shadow-inner overflow-hidden">
        {exercise.imageUrl ? (
          /* Si hay imagen directa personalizada, mostrarla */
          <div className="flex flex-col items-center justify-center p-2">
            <img
              src={exercise.imageUrl}
              alt={exercise.name}
              className="max-h-64 object-contain rounded-xl"
            />
          </div>
        ) : showSideBySide ? (
          /* VISTA LADO A LADO (FASE 1: INICIO vs FASE 2: CONTRACCIÓN) */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* FASE 1: INICIO / ESTIRAMIENTO */}
            <div className="flex flex-col items-center border-b md:border-b-0 md:border-r border-zinc-200 pb-4 md:pb-0 md:pr-4">
              <span className="text-[11px] font-black uppercase tracking-wider text-zinc-500 bg-zinc-100 px-3 py-0.5 rounded-full mb-3">
                1. Posición Inicial / Estiramiento
              </span>
              <div className="w-full h-44 flex items-center justify-center">
                <AnatomicalFigure kind={kind} phase="start" />
              </div>
              <p className="text-[11px] text-zinc-600 font-medium text-center mt-2">
                Alinea el cuerpo, respira profundo y prepara la trayectoria de movimiento.
              </p>
            </div>

            {/* FASE 2: CONTRACCIÓN MÁXIMA */}
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 px-3 py-0.5 rounded-full mb-3">
                2. Contracción Máxima / Final
              </span>
              <div className="w-full h-44 flex items-center justify-center">
                <AnatomicalFigure kind={kind} phase="finish" />
              </div>
              <p className="text-[11px] text-zinc-600 font-medium text-center mt-2">
                Aplica fuerza con el músculo diana y sostén 1 segundo la máxima tensión.
              </p>
            </div>
          </div>
        ) : (
          /* VISTA EN PESTAÑA INDIVIDUAL */
          <div className="flex flex-col items-center justify-center py-2">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-800 bg-zinc-100 px-3 py-1 rounded-full mb-4">
              {activePhase === 'phase1' ? '1. Posición Inicial / Estiramiento' : '2. Contracción Máxima / Final'}
            </span>
            <div className="w-full max-w-sm h-52 flex items-center justify-center">
              <AnatomicalFigure kind={kind} phase={activePhase === 'phase1' ? 'start' : 'finish'} />
            </div>
          </div>
        )}
      </div>

      {/* LEYENDA ANATÓMICA Y MÚSCULOS DIANA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 flex items-start gap-2.5">
          <div className="w-3.5 h-3.5 rounded-full bg-rose-500 shrink-0 mt-0.5 ring-4 ring-rose-500/20" />
          <div className="text-xs">
            <div className="text-[10px] font-black uppercase tracking-wider text-rose-400">
              Músculo Principal Activo
            </div>
            <p className="text-zinc-100 font-bold mt-0.5">{highlights.primary}</p>
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 flex items-start gap-2.5">
          <div className="w-3.5 h-3.5 rounded-full bg-orange-400 shrink-0 mt-0.5 ring-4 ring-orange-400/20" />
          <div className="text-xs">
            <div className="text-[10px] font-black uppercase tracking-wider text-orange-400">
              Músculos Secundarios / Sinergistas
            </div>
            <p className="text-zinc-300 font-semibold mt-0.5">
              {highlights.secondary.join(' • ')}
            </p>
          </div>
        </div>
      </div>

      {/* CLAVE BIOMECÁNICA DEL ENTRENADOR */}
      <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs text-rose-200 flex items-start gap-2.5 leading-relaxed">
        <Info className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-rose-300">Punto clave para sentir el músculo: </strong>
          {highlights.keyCue}
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// COMPONENTE VECTORIAL ANATÓMICO (LÍNEA CLARA CON MÚSCULOS EN CORAL/SALMÓN)
// =========================================================================
function AnatomicalFigure({ kind, phase }: { kind: MovementKind; phase: 'start' | 'finish' }) {
  const isStart = phase === 'start';

  switch (kind) {
    case 'bench_press':
      return (
        <svg viewBox="0 0 240 160" className="w-full h-full max-h-44 select-none">
          {/* Estructura del Banco Plano */}
          <rect x="30" y="115" width="180" height="8" rx="2" fill="#64748b" />
          <line x1="55" y1="123" x2="55" y2="150" stroke="#475569" strokeWidth="4" />
          <line x1="185" y1="123" x2="185" y2="150" stroke="#475569" strokeWidth="4" />

          {/* Atleta acostado en banco */}
          {/* Cabeza */}
          <circle cx="50" cy="104" r="9" fill="#0f172a" />
          {/* Torso */}
          <path d="M58 108 L145 108 L145 116 L58 116 Z" fill="#0f172a" />
          {/* Piernas al suelo */}
          <path d="M145 112 L175 112 L175 148 L185 148" fill="none" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />

          {/* MÚSCULOS RESALTADOS EN CORAL/SALMÓN (PECTORAL) */}
          <ellipse cx="92" cy="100" rx="18" ry="9" fill="#f43f5e" opacity="0.9" />
          <text x="92" y="93" fill="#881337" fontSize="8" fontWeight="bold" textAnchor="middle">PECHO</text>

          {isStart ? (
            /* FASE 1: BARRA ABAJO TOCANDO EL PECHO (MÁXIMO ESTIRAMIENTO) */
            <g>
              {/* Brazos flexionados con codos abajo a 45° */}
              <polyline points="75,108 82,126 92,102" fill="none" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="108,108 102,126 92,102" fill="none" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              {/* Barra larga horizontal baja */}
              <line x1="40" y1="100" x2="150" y2="100" stroke="#334155" strokeWidth="4" />
              {/* Discos */}
              <rect x="36" y="86" width="6" height="28" rx="2" fill="#0f172a" />
              <rect x="148" y="86" width="6" height="28" rx="2" fill="#0f172a" />
              {/* Flecha indicativa de bajada controlada */}
              <path d="M92 78 L92 90 M88 86 L92 90 L96 86" fill="none" stroke="#64748b" strokeWidth="2" />
            </g>
          ) : (
            /* FASE 2: BARRA ARRIBA CON BRAZOS EXTENDIDOS (MÁXIMA CONTRACCIÓN) */
            <g>
              {/* Brazos extendidos hacia arriba */}
              <line x1="75" y1="108" x2="88" y2="52" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />
              <line x1="110" y1="108" x2="96" y2="52" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />
              {/* Tríceps y hombro resaltados */}
              <ellipse cx="80" cy="80" rx="4" ry="12" fill="#fb923c" transform="rotate(-15 80 80)" />
              {/* Barra larga arriba */}
              <line x1="40" y1="50" x2="150" y2="50" stroke="#334155" strokeWidth="4" />
              <rect x="36" y="36" width="6" height="28" rx="2" fill="#0f172a" />
              <rect x="148" y="36" width="6" height="28" rx="2" fill="#0f172a" />
              {/* Flechas de empuje */}
              <path d="M92 68 L92 56 M88 60 L92 56 L96 60" fill="none" stroke="#f43f5e" strokeWidth="2.5" />
            </g>
          )}
        </svg>
      );

    case 'squat':
      return (
        <svg viewBox="0 0 200 170" className="w-full h-full max-h-44 select-none">
          {/* Suelo */}
          <line x1="20" y1="155" x2="180" y2="155" stroke="#94a3b8" strokeWidth="3" />

          {isStart ? (
            /* FASE 1: DE PIE ERGUIDO CON BARRA */
            <g>
              {/* Cabeza */}
              <circle cx="95" cy="28" r="9" fill="#0f172a" />
              {/* Barra sobre hombros */}
              <line x1="60" y1="36" x2="130" y2="36" stroke="#475569" strokeWidth="4" />
              <rect x="56" y="24" width="6" height="24" rx="2" fill="#0f172a" />
              <rect x="128" y="24" width="6" height="24" rx="2" fill="#0f172a" />
              {/* Torso erguido */}
              <line x1="95" y1="36" x2="95" y2="85" stroke="#0f172a" strokeWidth="7" strokeLinecap="round" />
              {/* Brazos a la barra */}
              <path d="M95 44 L114 40 L110 36" fill="none" stroke="#0f172a" strokeWidth="3.5" />
              {/* Cuádriceps (Muslos rectos) */}
              <ellipse cx="92" cy="105" rx="6" ry="18" fill="#f43f5e" opacity="0.9" />
              <line x1="95" y1="85" x2="95" y2="125" stroke="#0f172a" strokeWidth="5" />
              {/* Piernas inferiores y pies */}
              <line x1="95" y1="125" x2="95" y2="155" stroke="#0f172a" strokeWidth="5" />
              <line x1="95" y1="155" x2="108" y2="155" stroke="#0f172a" strokeWidth="4" />
              <text x="135" y="105" fill="#e11d48" fontSize="9" fontWeight="bold">CUÁDRICEPS</text>
            </g>
          ) : (
            /* FASE 2: EN FONDO DE SENTADILLA (90° PARALELO) */
            <g>
              {/* Cabeza */}
              <circle cx="75" cy="62" r="9" fill="#0f172a" />
              {/* Barra */}
              <line x1="42" y1="72" x2="110" y2="72" stroke="#475569" strokeWidth="4" />
              <rect x="38" y="60" width="6" height="24" rx="2" fill="#0f172a" />
              <rect x="108" y="60" width="6" height="24" rx="2" fill="#0f172a" />
              {/* Torso inclinado a 60° */}
              <line x1="75" y1="70" x2="60" y2="108" stroke="#0f172a" strokeWidth="7" strokeLinecap="round" />
              {/* Muslos paralelos al suelo (Cuádriceps activo en tensión) */}
              <line x1="60" y1="108" x2="110" y2="110" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
              <ellipse cx="85" cy="108" rx="20" ry="7" fill="#f43f5e" opacity="0.95" />
              {/* Espinillas a pies */}
              <line x1="110" y1="110" x2="98" y2="155" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />
              <line x1="98" y1="155" x2="115" y2="155" stroke="#0f172a" strokeWidth="5" />
              {/* Glúteo activo */}
              <circle cx="56" cy="110" r="9" fill="#fb923c" opacity="0.9" />
              <text x="135" y="108" fill="#e11d48" fontSize="9" fontWeight="bold">90° PARALELO</text>
            </g>
          )}
        </svg>
      );

    case 'hip_thrust':
      return (
        <svg viewBox="0 0 220 160" className="w-full h-full max-h-44 select-none">
          {/* Suelo y Banco de apoyo */}
          <line x1="20" y1="150" x2="200" y2="150" stroke="#94a3b8" strokeWidth="3" />
          <rect x="35" y="95" width="40" height="55" rx="3" fill="#475569" />
          <line x1="35" y1="95" x2="75" y2="95" stroke="#334155" strokeWidth="4" />

          {isStart ? (
            /* FASE 1: CADERA ABAJO CERCA DEL SUELO */
            <g>
              {/* Cabeza apoyada en banco */}
              <circle cx="70" cy="85" r="8" fill="#0f172a" />
              {/* Espalda apoyada inclinada hacia abajo */}
              <line x1="70" y1="92" x2="95" y2="135" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
              {/* Glúteo abajo */}
              <ellipse cx="96" cy="135" rx="9" ry="8" fill="#f43f5e" opacity="0.9" />
              {/* Barra en pelvis */}
              <circle cx="102" cy="130" r="7" fill="#334155" />
              {/* Muslos flexionados hacia arriba */}
              <line x1="96" y1="135" x2="135" y2="108" stroke="#0f172a" strokeWidth="5" />
              {/* Piernas a pies */}
              <line x1="135" y1="108" x2="140" y2="150" stroke="#0f172a" strokeWidth="5" />
              <line x1="140" y1="150" x2="155" y2="150" stroke="#0f172a" strokeWidth="4" />
              <text x="150" y="85" fill="#64748b" fontSize="8" fontWeight="bold">Fase de estiramiento</text>
            </g>
          ) : (
            /* FASE 2: EXTENSIÓN COMPLETA DE CADERA (BLOQUEO DE GLÚTEOS) */
            <g>
              {/* Cabeza sobre banco mirando al frente/rodillas */}
              <circle cx="68" cy="84" r="8" fill="#0f172a" />
              {/* Torso horizontal a 180° */}
              <line x1="70" y1="92" x2="120" y2="92" stroke="#0f172a" strokeWidth="7" strokeLinecap="round" />
              {/* GLÚTEO MAYOR EN MÁXIMA CONTRACCIÓN */}
              <ellipse cx="118" cy="95" rx="14" ry="10" fill="#f43f5e" opacity="0.95" />
              {/* Barra en cadera */}
              <circle cx="120" cy="84" r="8" fill="#334155" />
              <line x1="95" y1="84" x2="145" y2="84" stroke="#475569" strokeWidth="4" />
              {/* Muslo horizontal formando 90° con tibia */}
              <line x1="120" y1="92" x2="160" y2="92" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
              {/* Tibia vertical a 90° con el suelo */}
              <line x1="160" y1="92" x2="160" y2="150" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
              <line x1="160" y1="150" x2="175" y2="150" stroke="#0f172a" strokeWidth="4" />
              <text x="118" y="125" fill="#be123c" fontSize="9" fontWeight="black" textAnchor="middle">GLÚTEO BLOQUEADO</text>
            </g>
          )}
        </svg>
      );

    case 'biceps':
      return (
        <svg viewBox="0 0 180 160" className="w-full h-full max-h-44 select-none">
          {/* Suelo */}
          <line x1="20" y1="150" x2="160" y2="150" stroke="#94a3b8" strokeWidth="3" />
          {/* Cabeza */}
          <circle cx="70" cy="30" r="9" fill="#0f172a" />
          {/* Torso erguido */}
          <line x1="70" y1="38" x2="70" y2="95" stroke="#0f172a" strokeWidth="7" strokeLinecap="round" />
          {/* Piernas */}
          <line x1="70" y1="95" x2="65" y2="150" stroke="#0f172a" strokeWidth="5" />
          <line x1="70" y1="95" x2="78" y2="150" stroke="#0f172a" strokeWidth="5" />

          {/* Brazo superior vertical fijo (húmero pegado al torso) */}
          <line x1="70" y1="48" x2="78" y2="80" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />

          {isStart ? (
            /* FASE 1: BRAZO EXTENDIDO CON MANCUERNA ABAJO */
            <g>
              <line x1="78" y1="80" x2="82" y2="120" stroke="#0f172a" strokeWidth="4.5" strokeLinecap="round" />
              {/* Mancuerna abajo */}
              <rect x="74" y="120" width="16" height="6" rx="2" fill="#334155" />
              <circle cx="74" cy="123" r="5" fill="#0f172a" />
              <circle cx="90" cy="123" r="5" fill="#0f172a" />
              <text x="110" y="85" fill="#64748b" fontSize="8" fontWeight="bold">Extensión completa</text>
            </g>
          ) : (
            /* FASE 2: BRAZO FLEXIONADO CON BÍCEPS RESALTADO */
            <g>
              {/* BÍCEPS RESALTADO EN CORAL */}
              <ellipse cx="76" cy="62" rx="7" ry="11" fill="#f43f5e" opacity="0.95" />
              {/* Antebrazo flexionado arriba */}
              <line x1="78" y1="80" x2="95" y2="52" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />
              {/* Mancuerna arriba */}
              <rect x="88" y="46" width="16" height="6" rx="2" fill="#334155" />
              <circle cx="88" cy="49" r="5" fill="#0f172a" />
              <circle cx="104" cy="49" r="5" fill="#0f172a" />
              <text x="115" y="65" fill="#e11d48" fontSize="9" fontWeight="black">BÍCEPS</text>
            </g>
          )}
        </svg>
      );

    case 'triceps':
      return (
        <svg viewBox="0 0 180 160" className="w-full h-full max-h-44 select-none">
          <line x1="20" y1="150" x2="160" y2="150" stroke="#94a3b8" strokeWidth="3" />
          <circle cx="65" cy="30" r="9" fill="#0f172a" />
          <line x1="65" y1="38" x2="65" y2="95" stroke="#0f172a" strokeWidth="7" strokeLinecap="round" />
          <line x1="65" y1="95" x2="60" y2="150" stroke="#0f172a" strokeWidth="5" />
          <line x1="65" y1="95" x2="72" y2="150" stroke="#0f172a" strokeWidth="5" />

          {/* Brazo superior vertical pegado al oído (Extensión copa tras cabeza) */}
          <line x1="65" y1="48" x2="72" y2="18" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />

          {isStart ? (
            /* FASE 1: CODO FLEXIONADO TRAS LA CABEZA */
            <g>
              <line x1="72" y1="18" x2="52" y2="38" stroke="#0f172a" strokeWidth="4.5" strokeLinecap="round" />
              <circle cx="48" cy="42" r="7" fill="#334155" />
              <text x="95" y="40" fill="#64748b" fontSize="8" fontWeight="bold">Estiramiento tríceps</text>
            </g>
          ) : (
            /* FASE 2: EXTENSIÓN COMPLETA HACIA EL TECHO */
            <g>
              {/* TRÍCEPS RESALTADO EN CORAL */}
              <ellipse cx="68" cy="28" rx="6" ry="10" fill="#f43f5e" opacity="0.95" />
              <line x1="72" y1="18" x2="78" y2="-5" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />
              <circle cx="80" cy="-8" r="7" fill="#334155" />
              <text x="98" y="25" fill="#e11d48" fontSize="9" fontWeight="black">TRÍCEPS</text>
            </g>
          )}
        </svg>
      );

    case 'pull':
      return (
        <svg viewBox="0 0 200 160" className="w-full h-full max-h-44 select-none">
          {/* Barra fija o polea arriba */}
          <line x1="30" y1="15" x2="170" y2="15" stroke="#475569" strokeWidth="4" />

          {isStart ? (
            /* FASE 1: COLGADO O BRAZOS EXTENDIDOS ARRIBA */
            <g>
              <line x1="55" y1="15" x2="78" y2="52" stroke="#0f172a" strokeWidth="4.5" />
              <line x1="145" y1="15" x2="122" y2="52" stroke="#0f172a" strokeWidth="4.5" />
              <circle cx="100" cy="48" r="8" fill="#0f172a" />
              <line x1="100" y1="56" x2="100" y2="115" stroke="#0f172a" strokeWidth="7" strokeLinecap="round" />
              <line x1="100" y1="115" x2="95" y2="150" stroke="#0f172a" strokeWidth="4.5" />
              <text x="135" y="85" fill="#64748b" fontSize="8" fontWeight="bold">Dorsal estirado</text>
            </g>
          ) : (
            /* FASE 2: BARRA AL ESTERNÓN (DORSALES ACTIVADOS EN CORAL) */
            <g>
              {/* Brazos flexionados con codos abajo pegados al torso */}
              <line x1="65" y1="15" x2="78" y2="45" stroke="#0f172a" strokeWidth="4.5" />
              <line x1="135" y1="15" x2="122" y2="45" stroke="#0f172a" strokeWidth="4.5" />
              <circle cx="100" cy="38" r="8" fill="#0f172a" />
              <line x1="100" y1="46" x2="100" y2="105" stroke="#0f172a" strokeWidth="7" strokeLinecap="round" />
              {/* DORSALES ANCHOS RESALTADOS EN CORAL */}
              <polygon points="85,55 75,90 100,85" fill="#f43f5e" opacity="0.95" />
              <polygon points="115,55 125,90 100,85" fill="#f43f5e" opacity="0.95" />
              <text x="100" y="125" fill="#e11d48" fontSize="9" fontWeight="black" textAnchor="middle">DORSALES RETRAÍDOS</text>
            </g>
          )}
        </svg>
      );

    case 'shoulder':
    case 'core_cardio':
    default:
      return (
        <svg viewBox="0 0 180 160" className="w-full h-full max-h-44 select-none">
          <line x1="20" y1="150" x2="160" y2="150" stroke="#94a3b8" strokeWidth="3" />
          <circle cx="90" cy="30" r="9" fill="#0f172a" />
          <line x1="90" y1="38" x2="90" y2="95" stroke="#0f172a" strokeWidth="7" strokeLinecap="round" />
          <line x1="90" y1="95" x2="80" y2="150" stroke="#0f172a" strokeWidth="5" />
          <line x1="90" y1="95" x2="100" y2="150" stroke="#0f172a" strokeWidth="5" />

          {/* DELTOIDES / CORE EN CORAL */}
          <circle cx="75" cy="44" r="7" fill="#f43f5e" opacity="0.95" />
          <circle cx="105" cy="44" r="7" fill="#f43f5e" opacity="0.95" />

          {isStart ? (
            /* MANCUERNAS A HOMBROS */
            <g>
              <line x1="75" y1="44" x2="70" y2="65" stroke="#0f172a" strokeWidth="4.5" />
              <line x1="105" y1="44" x2="110" y2="65" stroke="#0f172a" strokeWidth="4.5" />
              <rect x="62" y="60" width="16" height="5" rx="2" fill="#334155" />
              <rect x="102" y="60" width="16" height="5" rx="2" fill="#334155" />
            </g>
          ) : (
            /* EMPUJE VERTICAL ARRIBA */
            <g>
              <line x1="75" y1="44" x2="72" y2="10" stroke="#0f172a" strokeWidth="4.5" />
              <line x1="105" y1="44" x2="108" y2="10" stroke="#0f172a" strokeWidth="4.5" />
              <rect x="64" y="6" width="16" height="5" rx="2" fill="#334155" />
              <rect x="100" y="6" width="16" height="5" rx="2" fill="#334155" />
              <text x="90" y="75" fill="#e11d48" fontSize="9" fontWeight="black" textAnchor="middle">DELTOIDES</text>
            </g>
          )}
        </svg>
      );
  }
}
