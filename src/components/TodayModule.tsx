import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Users, 
  ArrowRight, 
  ShieldCheck, 
  Flame, 
  Dumbbell, 
  Footprints, 
  Mountain, 
  Sparkles, 
  Calendar,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  Moon,
  HeartPulse,
  Sliders
} from 'lucide-react';
import { Level } from '../types';
import OnboardingModal, { OnboardingData } from './OnboardingModal';

interface TodayModuleProps {
  nickname: string;
  selectedLevel: Level;
  onNavigate: (section: 'train' | 'squads' | 'profile' | 'library', subDiscipline?: 'gym' | 'hiit' | 'running' | 'hyrox') => void;
  onOpenProfile: () => void;
  onOpenOnboarding?: () => void;
  onNotification?: (msg: string) => void;
}

export default function TodayModule({
  nickname,
  selectedLevel,
  onNavigate,
  onOpenProfile,
  onOpenOnboarding,
  onNotification
}: TodayModuleProps) {
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [isOnboardingDone, setIsOnboardingDone] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`fitmax_onboarding_completed_${nickname}`) === 'true';
    } catch {
      return false;
    }
  });

  // Modal para reprogramar o mover sesión (Aviso híbrido)
  const [showRescheduleModal, setShowRescheduleModal] = useState<boolean>(false);

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

  // Día de la semana actual (0 = Lunes, 6 = Domingo)
  const todayDayIndex = (new Date().getDay() + 6) % 7;

  // Racha de constancia en semanas
  const [weeksStreak, setWeeksStreak] = useState<number>(() => {
    try {
      const savedWeek = localStorage.getItem(`fit_gen_${nickname}_weekly_mesocycle_current_week`);
      return Math.max(1, parseInt(savedWeek || '2', 10));
    } catch {
      return 2;
    }
  });

  // Días de la semana híbrida
  // Azul (#5B8DEF) = Gimnasio, Coral (#F2685B) = Running, Ámbar (#F2A33A) = Hyrox, Violeta (#8E6CF0) = Cardio, Gris = Descanso
  const weekDays = [
    { label: 'L', name: 'Lunes', discipline: 'gym', isRest: false, color: '#5B8DEF', labelText: 'Torso' },
    { label: 'M', name: 'Martes', discipline: 'gym', isRest: false, color: '#5B8DEF', labelText: 'Pierna' },
    { label: 'X', name: 'Miércoles', discipline: 'running', isRest: false, color: '#F2685B', labelText: 'Running' },
    { label: 'J', name: 'Jueves', discipline: 'gym', isRest: false, color: '#5B8DEF', labelText: 'Torso' },
    { label: 'V', name: 'Viernes', discipline: 'gym', isRest: false, color: '#5B8DEF', labelText: 'Pierna' },
    { label: 'S', name: 'Sábado', discipline: 'hyrox', isRest: false, color: '#F2A33A', labelText: 'Hyrox' },
    { label: 'D', name: 'Domingo', discipline: 'rest', isRest: true, color: '#3A434F', labelText: 'Descanso' },
  ];

  const currentDayInfo = weekDays[todayDayIndex] || weekDays[0];
  const isRestDay = currentDayInfo.isRest;

  const handleOnboardingComplete = (data: OnboardingData) => {
    setIsOnboardingDone(true);
    setShowOnboarding(false);
    if (onNotification) {
      onNotification(`¡Bienvenido a FitMax, ${nickname}! Tu plan semanal ha sido generado.`);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-5 pb-20 animate-fadeIn">
      {/* Cabecera de bienvenida & Avatar */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Hola, {nickname}
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm font-semibold text-[#A8B0BB]">
              Semana híbrida
            </span>
            <span className="text-zinc-600">·</span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1FD08A] bg-[#1FD08A]/10 border border-[#1FD08A]/20 px-2 py-0.5 rounded-full">
              <Flame className="w-3 h-3 fill-current" />
              Racha: {weeksStreak} semanas cumplidas
            </span>
          </div>
        </div>
        <button
          onClick={onOpenProfile}
          className="w-11 h-11 rounded-full bg-[#20252C] hover:bg-[#282F38] border border-[#282F38] flex items-center justify-center text-white font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-md cursor-pointer"
          title="Ver mi perfil"
        >
          {getInitials(nickname)}
        </button>
      </div>

      {/* Semana híbrida (Tira de 7 días con colores de disciplina) */}
      <div className="bg-[#20252C] border border-[#282F38] rounded-3xl p-4 shadow-xl">
        <div className="flex items-center justify-between px-1">
          {weekDays.map((d, idx) => {
            const isToday = idx === todayDayIndex;
            return (
              <div key={idx} className="flex flex-col items-center gap-2">
                <span className={`text-xs font-bold ${isToday ? 'text-[#1FD08A]' : 'text-[#A8B0BB]'}`}>
                  {d.label}
                </span>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    isToday
                      ? 'ring-2 ring-[#1FD08A] ring-offset-2 ring-offset-[#20252C] shadow-[0_0_12px_rgba(31,208,138,0.4)]'
                      : ''
                  }`}
                  style={{
                    backgroundColor: d.isRest ? '#15181D' : `${d.color}25`,
                    border: `2px solid ${d.isRest ? '#282F38' : d.color}`,
                    color: d.color
                  }}
                  title={`${d.name}: ${d.labelText}`}
                >
                  {d.isRest ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A8B0BB]/60"></span>
                  ) : (
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TARJETA HERO: ONBOARDING SI NO HA COMPLETADO CONFIGURACIÓN */}
      {!isOnboardingDone && (
        <div className="bg-gradient-to-br from-[#20252C] to-[#15181D] border-2 border-[#1FD08A]/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1FD08A] animate-ping"></span>
            <span className="text-xs font-black uppercase tracking-wider text-[#1FD08A]">
              Nuevo atleta · Configuración inicial
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Elige tu objetivo y tu plan
            </h2>
            <p className="text-xs text-[#A8B0BB] mt-1 leading-relaxed">
              Responde 5 preguntas rápidas para calibrar tus días de entrenamiento, equipo y tu nivel de gimnasio.
            </p>
          </div>

          <button
            onClick={() => setShowOnboarding(true)}
            className="w-full bg-[#1FD08A] hover:bg-[#1ab87a] text-[#15181D] font-black py-4 px-6 rounded-2xl text-base transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(31,208,138,0.35)] cursor-pointer"
          >
            <Sparkles className="w-5 h-5 fill-current" />
            <span>Configurar mi plan (1 min)</span>
          </button>
        </div>
      )}

      {/* TARJETA PROTAGONISTA DE HOY */}
      {isRestDay ? (
        // DÍA DE DESCANSO PROGRAMADO
        <div className="bg-[#20252C] border border-[#282F38] rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-[#5B8DEF]" />
            <span className="text-xs font-bold text-[#5B8DEF] uppercase tracking-wider">
              Recuperación activa
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Hoy descansas
            </h2>
            <p className="text-xs text-[#A8B0BB] mt-1 leading-relaxed">
              Las adaptaciones de fuerza e hipertrofia se consolidan durante el reposo. ¿Quieres realizar una sesión suave de movilidad de 10 minutos para relajar articulaciones?
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={() => {
                if (onNotification) onNotification('Iniciando sesión guiada de movilidad de 10 min 🧘');
              }}
              className="flex-1 bg-[#15181D] hover:bg-[#282F38] border border-[#282F38] text-white font-bold py-3.5 px-4 rounded-2xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <HeartPulse className="w-4 h-4 text-[#1FD08A]" />
              <span>Movilidad de 10 minutos</span>
            </button>

            <button
              onClick={() => onNavigate('train', 'gym')}
              className="bg-[#20252C] hover:bg-[#282F38] border border-[#282F38] text-[#A8B0BB] hover:text-white font-bold py-3.5 px-4 rounded-2xl text-xs transition-all cursor-pointer"
            >
              Ver mi plan semanal
            </button>
          </div>
        </div>
      ) : (
        // DÍA CON ENTRENAMIENTO PROGRAMADO
        <div className="bg-[#20252C] border border-[#282F38] rounded-3xl p-6 shadow-xl relative overflow-hidden group space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#5B8DEF] animate-pulse"></span>
              <span className="text-xs font-bold text-[#5B8DEF] uppercase tracking-wider">
                Gimnasio, hoy
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#A8B0BB] bg-[#15181D] px-2.5 py-0.5 rounded-full border border-[#282F38]">
              Nivel: {selectedLevel === 'A' ? 'Base' : selectedLevel === 'B' ? 'Intermedio' : 'Avanzado'}
            </span>
          </div>

          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Torso (fuerza)
            </h2>
            <p className="text-xs text-[#A8B0BB] mt-1 font-medium">
              55 min · 5 ejercicios principales + finisher metabólico opcional
            </p>
          </div>

          <button
            onClick={() => onNavigate('train', 'gym')}
            className="w-full bg-[#1FD08A] hover:bg-[#1ab87a] text-[#15181D] font-black py-4 px-6 rounded-2xl text-base transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(31,208,138,0.35)] cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Empezar sesión</span>
          </button>
        </div>
      )}

      {/* TARJETA SECUNDARIA / AVISO HÍBRIDO INTELIGENTE */}
      <div className="bg-[#20252C] border border-[#282F38] rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F2A33A]"></span>
            <h3 className="text-sm font-bold text-white">
              Mañana: series de 5×1000 m
            </h3>
          </div>
          <button
            onClick={() => setShowRescheduleModal(true)}
            className="text-[11px] font-bold text-[#5B8DEF] hover:underline cursor-pointer"
          >
            Mover sesión
          </button>
        </div>
        <p className="text-xs text-[#A8B0BB] leading-relaxed">
          Hoy no hay piernas pesadas en gimnasio, así que llegarás con el glucógeno recuperado a tus series de carrera.
        </p>
      </div>

      {/* TARJETA SOCIAL: TU COMBO HOY */}
      <div className="bg-[#20252C] border border-[#282F38] rounded-2xl p-5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white mb-0.5">
            Tu combo hoy
          </h3>
          <p className="text-xs text-[#A8B0BB]">
            3 de 4 miembros ya entrenaron
          </p>
          <div className="flex items-center -space-x-1.5 mt-2.5">
            <span className="w-7 h-7 rounded-full bg-[#5B8DEF] border-2 border-[#20252C] text-white text-[10px] font-black flex items-center justify-center shadow">
              M
            </span>
            <span className="w-7 h-7 rounded-full bg-[#8E6CF0] border-2 border-[#20252C] text-white text-[10px] font-black flex items-center justify-center shadow">
              L
            </span>
            <span className="w-7 h-7 rounded-full bg-[#F2A33A] border-2 border-[#20252C] text-white text-[10px] font-black flex items-center justify-center shadow">
              A
            </span>
          </div>
        </div>

        <button
          onClick={() => onNavigate('squads')}
          className="bg-[#15181D] hover:bg-[#282F38] text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-[#282F38] transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
        >
          <span>Ver combo</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#1FD08A]" />
        </button>
      </div>

      {/* MODAL ONBOARDING (5 PASOS) */}
      {showOnboarding && (
        <OnboardingModal
          nickname={nickname}
          initialLevel={selectedLevel}
          onClose={() => setShowOnboarding(false)}
          onComplete={handleOnboardingComplete}
        />
      )}

      {/* MODAL REPROGRAMAR / MOVER SESIÓN (AVISO HÍBRIDO) */}
      {showRescheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#20252C] rounded-3xl p-6 max-w-md w-full border border-[#282F38] shadow-2xl text-[#F4F2ED] space-y-4">
            <div className="flex items-center justify-between border-b border-[#282F38] pb-3">
              <h3 className="text-base font-black text-white">Reorganizar sesión híbrida</h3>
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="text-[#A8B0BB] hover:text-white text-xs font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-[#A8B0BB] leading-relaxed">
              ¿Prefieres correr hoy y pasar la sesión de torso para mañana? La sobrecarga híbrida se recalculará automáticamente sin romper tu racha.
            </p>
            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  setShowRescheduleModal(false);
                  onNavigate('train', 'running');
                  if (onNotification) onNotification('Sesión invertida: hoy corres y mañana entrenas fuerza en gimnasio.');
                }}
                className="w-full py-3 px-4 bg-[#1FD08A] hover:bg-[#1ab87a] text-[#15181D] font-black rounded-xl text-xs transition-all cursor-pointer"
              >
                Invertir sesiones (Correr hoy)
              </button>
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="w-full py-3 px-4 bg-[#15181D] hover:bg-[#282F38] text-[#A8B0BB] hover:text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Mantener plan actual
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
