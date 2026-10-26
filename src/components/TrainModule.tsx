import React, { useState } from 'react';
import { Dumbbell, Flame, Footprints, Mountain, Zap, Calendar, ChevronDown, Check, Info, Sparkles } from 'lucide-react';
import { Level, LEVELS } from '../types';
import WeeklyModule from './WeeklyModule';
import QuickModule from './QuickModule';
import CustomRoutineModule from './CustomRoutineModule';
import HiitModule from './HiitModule';
import RunningModule from './RunningModule';
import HyroxOcrModule from './HyroxOcrModule';

export type DisciplineType = 'gym' | 'hiit' | 'running' | 'hyrox';

interface TrainModuleProps {
  nickname: string;
  selectedLevel: Level;
  onSelectLevel: (lvl: Level) => void;
  onNotification: (msg: string) => void;
  initialDiscipline?: DisciplineType;
}

export default function TrainModule({
  nickname,
  selectedLevel,
  onSelectLevel,
  onNotification,
  initialDiscipline = 'gym'
}: TrainModuleProps) {
  const [activeDiscipline, setActiveDiscipline] = useState<DisciplineType>(initialDiscipline);
  const [gymMode, setGymMode] = useState<'weekly' | 'quick' | 'custom'>('weekly');
  const [showLevelSheet, setShowLevelSheet] = useState<boolean>(false);

  const currentLevelObj = LEVELS.find((l) => l.id === selectedLevel) || LEVELS[0];

  const disciplines = [
    {
      id: 'gym' as const,
      name: 'Gimnasio',
      icon: Dumbbell,
      color: 'text-blue-400',
      activeBg: 'bg-blue-500/15 border-blue-500 text-blue-300',
      dotColor: 'bg-blue-500'
    },
    {
      id: 'hiit' as const,
      name: 'Cardio & Funcional',
      icon: Flame,
      color: 'text-rose-400',
      activeBg: 'bg-rose-500/15 border-rose-500 text-rose-300',
      dotColor: 'bg-rose-500'
    },
    {
      id: 'running' as const,
      name: 'Running',
      icon: Footprints,
      color: 'text-amber-400',
      activeBg: 'bg-amber-500/15 border-amber-500 text-amber-300',
      dotColor: 'bg-amber-500'
    },
    {
      id: 'hyrox' as const,
      name: 'Hyrox',
      icon: Mountain,
      color: 'text-purple-400',
      activeBg: 'bg-purple-500/15 border-purple-500 text-purple-300',
      dotColor: 'bg-purple-500'
    }
  ];

  return (
    <div className="w-full space-y-5 animate-fadeIn">
      {/* Selector superior de disciplina */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
        {disciplines.map((d) => {
          const Icon = d.icon;
          const isActive = activeDiscipline === d.id;
          return (
            <button
              key={d.id}
              onClick={() => setActiveDiscipline(d.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? `${d.activeBg} shadow-sm scale-100 ring-1 ring-inset ring-current/20`
                  : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${d.dotColor}`}></span>
              <Icon className="w-4 h-4 shrink-0" />
              <span>{d.name}</span>
            </button>
          );
        })}
      </div>

      {/* Barra de control específica para Gimnasio */}
      {activeDiscipline === 'gym' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/90 border border-zinc-800/80 p-2.5 sm:p-3 rounded-2xl">
          {/* Sub-selector: Plan semanal vs Rutina rápida */}
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800/60 w-fit">
            <button
              onClick={() => setGymMode('weekly')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                gymMode === 'weekly'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Plan semanal</span>
            </button>
            <button
              onClick={() => setGymMode('quick')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                gymMode === 'quick'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Rutina rápida</span>
            </button>
            <button
              onClick={() => setGymMode('custom')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                gymMode === 'custom'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Rutina personalizada</span>
            </button>
          </div>

          {/* Chip de nivel de gimnasio */}
          <div className="relative">
            <button
              onClick={() => setShowLevelSheet(!showLevelSheet)}
              className="flex items-center gap-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 px-3 py-1.5 rounded-xl text-xs text-zinc-300 font-semibold transition-all cursor-pointer"
            >
              <span className="text-[11px] text-zinc-500 font-normal">Nivel:</span>
              <strong className="text-blue-400 font-bold">{currentLevelObj.simpleName || currentLevelObj.name}</strong>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {/* Hoja desplegable / Popover de nivel */}
            {showLevelSheet && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-zinc-900 border border-zinc-700/80 rounded-2xl p-3 shadow-2xl z-30 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800">
                  <p className="text-[11px] font-bold text-zinc-200 uppercase tracking-wider">
                    ¿Qué cambia según tu nivel?
                  </p>
                  <button
                    onClick={() => setShowLevelSheet(false)}
                    className="text-zinc-500 hover:text-zinc-300 text-xs font-bold p-1"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-1.5">
                  {LEVELS.map((lvl) => {
                    const isSelected = lvl.id === selectedLevel;
                    return (
                      <button
                        key={lvl.id}
                        onClick={() => {
                          onSelectLevel(lvl.id as Level);
                          setShowLevelSheet(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-start justify-between ${
                          isSelected
                            ? 'bg-blue-500/15 border-blue-500 text-blue-300'
                            : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                        }`}
                      >
                        <div>
                          <p className="font-bold text-white text-xs">{lvl.simpleName || lvl.name}</p>
                          <p className="text-[10px] text-zinc-400 mt-0.5 leading-tight">{lvl.description}</p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />}
                      </button>
                    );
                  })}
                </div>
                <div className="p-2 bg-zinc-950 rounded-xl border border-zinc-800/60 text-[10px] text-zinc-400 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>El nivel solo adapta los ejercicios y cargas de gimnasio.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Renderizado de la disciplina activa */}
      <div className="w-full">
        {activeDiscipline === 'gym' && (
          gymMode === 'weekly' ? (
            <WeeklyModule
              nickname={nickname}
              selectedLevel={selectedLevel}
              onNotification={onNotification}
            />
          ) : gymMode === 'quick' ? (
            <QuickModule
              nickname={nickname}
              selectedLevel={selectedLevel}
              onNotification={onNotification}
            />
          ) : (
            <CustomRoutineModule
              nickname={nickname}
              selectedLevel={selectedLevel}
              onNotification={onNotification}
            />
          )
        )}

        {activeDiscipline === 'hiit' && (
          <HiitModule />
        )}

        {activeDiscipline === 'running' && (
          <RunningModule
            nickname={nickname}
            onNotification={onNotification}
          />
        )}

        {activeDiscipline === 'hyrox' && (
          <HyroxOcrModule
            nickname={nickname}
          />
        )}
      </div>
    </div>
  );
}
