import React from 'react';
import { Play, Users, ArrowRight, ShieldCheck, Flame, Dumbbell, Footprints, Mountain, Sparkles } from 'lucide-react';
import { Level } from '../types';

interface TodayModuleProps {
  nickname: string;
  selectedLevel: Level;
  onNavigate: (section: 'train' | 'squads' | 'profile' | 'library', subDiscipline?: 'gym' | 'hiit' | 'running' | 'hyrox') => void;
  onOpenProfile: () => void;
}

export default function TodayModule({
  nickname,
  selectedLevel,
  onNavigate,
  onOpenProfile
}: TodayModuleProps) {
  // Iniciales del atleta
  const getInitials = (nameStr: string) => {
    const clean = nameStr.trim();
    if (!clean) return 'AT';
    const parts = clean.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  };

  // Días de la semana híbrida
  const weekDays = [
    { label: 'L', discipline: 'gym', active: false, done: true, color: 'bg-blue-500 text-blue-400 border-blue-500' },
    { label: 'M', discipline: 'gym', active: true, done: false, color: 'bg-blue-500 text-blue-400 border-blue-400' },
    { label: 'X', discipline: 'running', active: false, done: false, color: 'border-amber-500 text-amber-400' },
    { label: 'J', discipline: 'gym', active: false, done: false, color: 'border-blue-500 text-blue-400' },
    { label: 'V', discipline: 'hiit', active: false, done: false, color: 'border-rose-500 text-rose-400' },
    { label: 'S', discipline: 'hyrox', active: false, done: false, color: 'border-purple-500 text-purple-400' },
    { label: 'D', discipline: 'rest', active: false, done: false, color: 'text-zinc-600' },
  ];

  return (
    <div className="w-full max-w-xl mx-auto space-y-6 pb-20 animate-fadeIn">
      {/* Cabecera de bienvenida & Avatar */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Hola, {nickname}
          </h1>
          <p className="text-zinc-400 text-sm mt-0.5 font-medium">
            Semana híbrida
          </p>
        </div>
        <button
          onClick={onOpenProfile}
          className="w-11 h-11 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 flex items-center justify-center text-white font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-md"
          title="Ver mi perfil"
        >
          {getInitials(nickname)}
        </button>
      </div>

      {/* Semana híbrida (Tira de 7 días con códigos de color de disciplinas) */}
      <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between px-2">
          {weekDays.map((d, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2">
              <span className={`text-xs font-semibold ${d.active ? 'text-white font-black' : 'text-zinc-400'}`}>
                {d.label}
              </span>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                  d.active
                    ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-zinc-950 bg-blue-500/20 text-blue-400'
                    : d.done
                    ? 'bg-blue-500 text-zinc-950 font-bold'
                    : d.discipline === 'rest'
                    ? 'w-2 h-2 rounded-full bg-zinc-700 my-2.5'
                    : `border-2 ${d.color} bg-transparent`
                }`}
              >
                {d.done && <span className="text-[10px]">✓</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tarjeta Protagonista: Sesión de Hoy */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-900/80 border border-zinc-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
            Gimnasio, hoy
          </span>
        </div>

        <h2 className="text-3xl font-black text-white tracking-tight mb-1">
          Torso (fuerza)
        </h2>
        <p className="text-zinc-400 text-sm mb-6">
          55 min · 5 ejercicios y un finisher opcional
        </p>

        <button
          onClick={() => onNavigate('train', 'gym')}
          className="w-full bg-[#1FD08A] hover:bg-[#1ab87a] text-zinc-950 font-black py-4 px-6 rounded-2xl text-base transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(31,208,138,0.3)] cursor-pointer"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Empezar sesión</span>
        </button>
      </div>

      {/* Tarjeta Secundaria: Mañana (Aviso Híbrido Inteligente) */}
      <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <h3 className="text-sm font-bold text-white">
            Mañana: series de 5×1000 m
          </h3>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Hoy no hay piernas pesadas, así que llegas fresco a las series de carrera.
        </p>
      </div>

      {/* Tarjeta Social: Tu Combo Hoy */}
      <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white mb-0.5">
            Tu combo hoy
          </h3>
          <p className="text-xs text-zinc-400">
            3 de 4 miembros ya entrenaron
          </p>
          <div className="flex items-center -space-x-1.5 mt-2.5">
            <span className="w-7 h-7 rounded-full bg-blue-600/90 border border-zinc-900 text-white text-[10px] font-black flex items-center justify-center">
              M
            </span>
            <span className="w-7 h-7 rounded-full bg-purple-600/90 border border-zinc-900 text-white text-[10px] font-black flex items-center justify-center">
              L
            </span>
            <span className="w-7 h-7 rounded-full bg-amber-600/90 border border-zinc-900 text-white text-[10px] font-black flex items-center justify-center">
              A
            </span>
          </div>
        </div>

        <button
          onClick={() => onNavigate('squads')}
          className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-zinc-700 transition-all active:scale-95 flex items-center gap-1.5"
        >
          <span>Ver</span>
          <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
        </button>
      </div>
    </div>
  );
}
