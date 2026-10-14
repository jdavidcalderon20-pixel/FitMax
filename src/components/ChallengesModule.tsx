import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, 
  Award, 
  Flame, 
  Calendar, 
  Footprints, 
  HeartPulse, 
  Mountain, 
  Zap, 
  Sparkles, 
  Dumbbell, 
  Shield, 
  Crown, 
  CheckCircle, 
  Lock, 
  Unlock, 
  Clock, 
  Target, 
  X, 
  Info, 
  RotateCcw,
  Check,
  ChevronRight,
  Share2
} from 'lucide-react';
import { 
  Badge, 
  Challenge, 
  BadgeCategory, 
  BadgeTier, 
  BADGE_TIER_STYLES, 
  evaluateBadges, 
  evaluateChallenges, 
  EvaluationContext 
} from '../lib/gamification';
import { playBeepSound } from '../lib/sound';
import { buildBadgeShareMessage, shareContent } from '../lib/share';

interface ChallengesModuleProps {
  nickname: string;
  onNotification?: (msg: string) => void;
}

// Información científica y consejos de entrenador para cada medalla
const BADGE_SCIENCE_DATA: Record<string, { science: string; coachTip: string }> = {
  first_blood: {
    science: 'Romper la inercia neural y registrar la primera sesión estimula la vía dopaminérgica del logro y sienta la base del hábito deportivo permanente.',
    coachTip: 'No busques la perfección en tu primera sesión; busca la consistencia. Presentarte a entrenar ya es el 80% de la victoria.'
  },
  mesocycle_half: {
    science: 'A partir de la semana 4 de un bloque estructurado, las adaptaciones neurales tempranas se consolidan en hipertrofia miofibrilar y remodelado del sarcómero.',
    coachTip: 'Mantén el mismo orden de ejercicios. Si el peso se estanca, añade una repetición extra o controla el tempo excéntrico (3 segundos de bajada).'
  },
  mesocycle_master: {
    science: 'Completar 8 semanas consecutivas con sobrecarga progresiva maximiza la tensión mecánica acumulada sin caer en el error de rotar ejercicios prematuramente.',
    coachTip: 'Al culminar este bloque, programa una semana de descarga (deload con 50% de volumen) para recuperar articulaciones y resensibilizar tus músculos al crecimiento.'
  },
  zone2_pioneer: {
    science: 'El entrenamiento en Zona 2 estimula la biogénesis mitocondrial, incrementa la densidad capilar periférica y maximiza la oxidación de ácidos grasos (San-Millán & Brooks).',
    coachTip: 'Corre a un ritmo donde puedas pronunciar frases completas sin jadear. Si tu frecuencia cardíaca sube demasiado, camina 1 minuto y retoma el trote suave.'
  },
  polarization_pro: {
    science: 'El modelo polarizado (Stephen Seiler) demuestra que dedicar el 80% del tiempo a baja intensidad y 20% a alta intensidad genera mayor VO2 max y previene el sobreentrenamiento frente a correr siempre a ritmo medio.',
    coachTip: 'No compitas en tus rodajes diarios. Guarda la verdadera intensidad exclusivamente para tus días de series o HIIT.'
  },
  long_run_hero: {
    science: 'Las tiradas largas superiores a 15 km optimizan el vaciamiento y resíntesis de glucógeno y fortalecen la resistencia tenomuscular contra el impacto cíclico repetitivo.',
    coachTip: 'Entrena tu hidratación y nutrición en carrera: consume entre 30 y 60 g de carbohidratos por hora para no sufrir caídas repentinas de energía.'
  },
  iron_grip: {
    science: 'La fuerza isométrica y la resistencia en flexores del antebrazo y dedos (Handgrip) son los factores limitantes más comunes en obstáculos de suspensión OCR.',
    coachTip: 'Dedica 2 o 3 minutos acumulados de suspensiones pasivas y activas en barra al final de cada entreno de tren superior.'
  },
  hyrox_sim_finisher: {
    science: 'Hyrox combina una alta tasa glucolítica en las estaciones con la capacidad de aclaramiento de lactato a ritmo de carrera.',
    coachTip: 'Controla el ritmo en el SkiErg y el trineo inicial; es en la segunda mitad de la carrera donde la gestión del esfuerzo marca la diferencia.'
  },
  compromised_runner: {
    science: 'La carrera comprometida ocurre cuando corres con congestión y fatiga previa en cuádriceps, forzando al sistema neuromuscular a mantener la cadencia y economía de carrera con lactato elevado.',
    coachTip: 'Transición sin pausa: al terminar las zancadas o el trineo, sal a trotar de inmediato sin sentarte, aunque los primeros 200 m sientas las piernas pesadas.'
  },
  progressive_overload_pro: {
    science: 'El principio de sobrecarga progresiva es el inductor mecánico esencial y comprobado para la hipertrofia muscular y la ganancia de fuerza neta.',
    coachTip: 'Anota meticulosamente cada serie. Superar tu registro de la semana pasada por tan solo 1 kg o 1 repetición garantiza resultados a largo plazo.'
  },
  titanium_streak: {
    science: 'La neurobiología de los hábitos demuestra que la automatización de la disciplina física se consolida tras un bloque consistente de semanas de ejecución deliberada.',
    coachTip: 'La constancia vence a la motivación. Registrar 16 sesiones te sitúa en el percentil más alto de atletas enfocados.'
  },
  hybrid_warrior: {
    science: 'El entrenamiento concurrente bien planificado (fuerza + resistencia aeróbica + capacidad funcional) desarrolla un atleta completo sin interferencia negativa entre vías de señalización.',
    coachTip: 'Distribuye tus días: 2-3 de fuerza, 1-2 de carrera polarizada y 1 funcional de Hyrox/OCR. Es la cima de la preparación física moderna.'
  }
};

// Renderizador del icono dinámico de medalla
const renderBadgeIcon = (iconName: string, className: string = 'w-6 h-6') => {
  switch (iconName) {
    case 'Flame': return <Flame className={className} />;
    case 'Calendar': return <Calendar className={className} />;
    case 'Trophy': return <Trophy className={className} />;
    case 'Footprints': return <Footprints className={className} />;
    case 'HeartPulse': return <HeartPulse className={className} />;
    case 'Award': return <Award className={className} />;
    case 'Mountain': return <Mountain className={className} />;
    case 'Zap': return <Zap className={className} />;
    case 'Sparkles': return <Sparkles className={className} />;
    case 'Dumbbell': return <Dumbbell className={className} />;
    case 'Shield': return <Shield className={className} />;
    case 'Crown': return <Crown className={className} />;
    default: return <Award className={className} />;
  }
};

export default function ChallengesModule({ nickname, onNotification }: ChallengesModuleProps) {
  const [activeTab, setActiveTab] = useState<'hall' | 'challenges'>('hall');
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | 'all'>('all');
  const [inspectedBadge, setInspectedBadge] = useState<Badge | null>(null);

  // Estado de retos unidos
  const [joinedChallengeIds, setJoinedChallengeIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`fit_gen_${nickname}_joined_challenges`);
      return saved ? JSON.parse(saved) : ['challenge_50k_month', 'challenge_mesocycle_16']; // 2 unidos por defecto para incentivar
    } catch {
      return ['challenge_50k_month', 'challenge_mesocycle_16'];
    }
  });

  // Carga reactiva de contexto del atleta desde localStorage
  const [context, setContext] = useState<EvaluationContext>(() => {
    return loadEvaluationContext(nickname, joinedChallengeIds);
  });

  // Función auxiliar de carga
  function loadEvaluationContext(userNick: string, joinedIds: string[]): EvaluationContext {
    try {
      const weeklyLogs = JSON.parse(localStorage.getItem(`fit_gen_${userNick}_weekly_logs_v1`) || '{}');
      const weeklyHistory = JSON.parse(localStorage.getItem(`fit_gen_${userNick}_weekly_history_v1`) || '{}');
      const runningLogs = JSON.parse(localStorage.getItem(`fit_gen_${userNick}_running_logs_v1`) || '[]');
      const hyroxOcrCompleted = JSON.parse(localStorage.getItem(`fit_gen_${userNick}_hyroxocr_completed_v1`) || '{}');
      const mesocycleWeek = parseInt(localStorage.getItem(`fit_gen_${userNick}_weekly_mesocycle_current_week`) || '1', 10);

      return {
        weeklyLogs,
        weeklyHistory,
        runningLogs,
        hyroxOcrCompleted,
        mesocycleWeek: Math.max(1, mesocycleWeek),
        joinedChallengeIds: joinedIds
      };
    } catch (e) {
      return {
        weeklyLogs: {},
        weeklyHistory: {},
        runningLogs: [],
        hyroxOcrCompleted: {},
        mesocycleWeek: 1,
        joinedChallengeIds: joinedIds
      };
    }
  }

  // Recargar al cambiar nickname
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`fit_gen_${nickname}_joined_challenges`);
      const parsedJoined = saved ? JSON.parse(saved) : ['challenge_50k_month', 'challenge_mesocycle_16'];
      setJoinedChallengeIds(parsedJoined);
      setContext(loadEvaluationContext(nickname, parsedJoined));
    } catch {
      // Ignorar error de parsing
    }
  }, [nickname]);

  // Recalcular medallas y retos
  const badges = useMemo(() => evaluateBadges(context), [context]);
  const challenges = useMemo(() => evaluateChallenges(context), [context]);

  // Métricas de medallas
  const unlockedBadgesCount = useMemo(() => badges.filter((b) => b.isUnlocked).length, [badges]);
  const totalBadgesCount = badges.length;
  const masteryPercentage = Math.round((unlockedBadgesCount / totalBadgesCount) * 100);

  // Rango honorífico del atleta según medallas conseguidas
  const athleteRank = useMemo(() => {
    if (unlockedBadgesCount === 0) return { title: 'Recluta de Base', tier: 'bronze', icon: Shield };
    if (unlockedBadgesCount <= 2) return { title: 'Atleta Iniciado', tier: 'bronze', icon: Shield };
    if (unlockedBadgesCount <= 5) return { title: 'Atleta en Desarrollo', tier: 'silver', icon: Dumbbell };
    if (unlockedBadgesCount <= 8) return { title: 'Guerrero Híbrido', tier: 'gold', icon: Zap };
    if (unlockedBadgesCount <= 11) return { title: 'Competidor de Élite', tier: 'gold', icon: Trophy };
    return { title: 'Leyenda Imparable de Titanio', tier: 'titanium', icon: Crown };
  }, [unlockedBadgesCount]);

  // Manejo de unirse o abandonar reto
  const handleToggleJoinChallenge = (challengeId: string) => {
    const isAlreadyJoined = joinedChallengeIds.includes(challengeId);
    let updated: string[];

    if (isAlreadyJoined) {
      updated = joinedChallengeIds.filter((id) => id !== challengeId);
      if (onNotification) onNotification('Has salido del reto.');
    } else {
      updated = [...joinedChallengeIds, challengeId];
      playBeepSound();
      if (onNotification) onNotification('¡Te has unido al reto! Tus entrenamientos ya suman a este objetivo.');
    }

    setJoinedChallengeIds(updated);
    try {
      localStorage.setItem(`fit_gen_${nickname}_joined_challenges`, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    setContext((prev) => ({
      ...prev,
      joinedChallengeIds: updated
    }));
  };

  // Filtrado de medallas por categoría
  const filteredBadges = useMemo(() => {
    if (selectedCategory === 'all') return badges;
    return badges.filter((b) => b.category === selectedCategory);
  }, [badges, selectedCategory]);

  // Refrescar manualmente el contexto
  const handleRefresh = () => {
    setContext(loadEvaluationContext(nickname, joinedChallengeIds));
    if (onNotification) onNotification('Progreso de medallas y retos sincronizado con éxito.');
  };

  // Manejador viral de WhatsApp para presumir medalla
  const handleShareBadge = async (badge: Badge) => {
    playBeepSound();
    const text = buildBadgeShareMessage(badge.title, badge.tier, badge.description);
    const res = await shareContent({
      title: `Medalla Desbloqueada en FitMax: ${badge.title}`,
      text
    });
    if (res.method === 'clipboard' && onNotification) {
      onNotification('¡Texto de la medalla copiado al portapapeles!');
    } else if (onNotification) {
      onNotification('¡Abriendo WhatsApp para presumir tu medalla!');
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 animate-fadeIn">
      
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#282F38] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#20252C] text-amber-400 px-3 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 border border-[#282F38]">
              <Trophy className="w-3 h-3 text-amber-500" /> Medallas y retos
            </span>
            <span className="text-[#A8B0BB] text-xs font-semibold">
              {unlockedBadgesCount} / {totalBadgesCount} conseguidas
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-[#F4F2ED] flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-400" />
            Salón de medallas y retos mensuales
          </h2>
          <p className="text-[#A8B0BB] text-xs mt-0.5">
            Gana insignias atléticas con base científica por tu constancia, marcas de fuerza, rodajes en Zona 2 y pruebas Hyrox/OCR.
          </p>
        </div>

        {/* BOTÓN SINCRONIZAR PROGRESO */}
        <button
          onClick={handleRefresh}
          className="bg-[#20252C] hover:bg-[#282F38] text-[#F4F2ED] border border-[#282F38] font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          title="Recalcular con tus últimos entrenamientos registrados"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#A8B0BB]" />
          <span>Actualizar progreso</span>
        </button>
      </div>

      {/* BANNER SUPERIOR DE RANGO Y MAESTRÍA ATLÉTICA */}
      <div className="bg-[#20252C] border border-[#282F38] rounded-3xl p-5 md:p-6 text-[#F4F2ED] shadow-xl relative overflow-hidden">
        {/* Luz de fondo ambiental */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          
          {/* Avatar de rango y título */}
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center p-3 border shadow-inner ${
              athleteRank.tier === 'titanium'
                ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 ring-2 ring-cyan-400/40'
                : athleteRank.tier === 'gold'
                ? 'bg-amber-950/60 border-amber-400 text-amber-300 ring-2 ring-amber-400/40'
                : athleteRank.tier === 'silver'
                ? 'bg-slate-800/80 border-slate-400 text-slate-200'
                : 'bg-amber-950/40 border-amber-700 text-amber-500'
            }`}>
              <athleteRank.icon className="w-8 h-8" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#1FD08A] bg-[#1FD08A]/10 px-2.5 py-0.5 rounded-md border border-[#1FD08A]/30">
                  Rango del atleta
                </span>
                <span className="text-xs text-[#A8B0BB] font-semibold">Perfil: {nickname}</span>
              </div>
              <h3 className="text-xl md:text-2xl font-black tracking-tight text-[#F4F2ED] mt-0.5">
                {athleteRank.title}
              </h3>
              <p className="text-xs text-[#A8B0BB] mt-0.5">
                Has completado el <strong className="text-amber-400">{masteryPercentage}%</strong> de las condecoraciones atléticas disponibles.
              </p>
            </div>
          </div>

          {/* Barra de progreso global y resumen por tier */}
          <div className="w-full lg:w-80 flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-[#A8B0BB]">Maestría global</span>
              <span className="text-amber-400">{unlockedBadgesCount} / {totalBadgesCount} medallas</span>
            </div>
            
            <div className="w-full bg-[#15181D] h-3 rounded-full overflow-hidden p-0.5 border border-[#282F38]">
              <div 
                className="bg-gradient-to-r from-amber-500 via-[#1FD08A] to-cyan-400 h-full rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(251,191,36,0.5)]"
                style={{ width: `${masteryPercentage}%` }}
              />
            </div>

            <div className="grid grid-cols-4 gap-1 text-center mt-1">
              <div className="bg-[#15181D] border border-amber-900/40 rounded-lg py-1 px-1">
                <span className="text-[9px] text-amber-500 block font-bold">Bronce</span>
                <span className="text-xs font-black text-amber-400">
                  {badges.filter((b) => b.tier === 'bronze' && b.isUnlocked).length} / {badges.filter((b) => b.tier === 'bronze').length}
                </span>
              </div>
              <div className="bg-[#15181D] border border-slate-700/50 rounded-lg py-1 px-1">
                <span className="text-[9px] text-slate-400 block font-bold">Plata</span>
                <span className="text-xs font-black text-slate-200">
                  {badges.filter((b) => b.tier === 'silver' && b.isUnlocked).length} / {badges.filter((b) => b.tier === 'silver').length}
                </span>
              </div>
              <div className="bg-[#15181D] border border-amber-500/40 rounded-lg py-1 px-1">
                <span className="text-[9px] text-yellow-400 block font-bold">Oro</span>
                <span className="text-xs font-black text-yellow-300">
                  {badges.filter((b) => b.tier === 'gold' && b.isUnlocked).length} / {badges.filter((b) => b.tier === 'gold').length}
                </span>
              </div>
              <div className="bg-[#15181D] border border-cyan-500/40 rounded-lg py-1 px-1">
                <span className="text-[9px] text-cyan-400 block font-bold">Titanio</span>
                <span className="text-xs font-black text-cyan-300">
                  {badges.filter((b) => b.tier === 'titanium' && b.isUnlocked).length} / {badges.filter((b) => b.tier === 'titanium').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABS DE SUB-SECCIÓN: MURO DE MEDALLAS VS RETOS MENSUALES */}
      <div className="flex items-center gap-2 border-b border-[#282F38] pb-2">
        <button
          onClick={() => setActiveTab('hall')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'hall'
              ? 'bg-[#1FD08A] text-[#15181D] shadow-sm'
              : 'text-[#A8B0BB] hover:text-[#F4F2ED] hover:bg-[#20252C]'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>Salón de medallas ({badges.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('challenges')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer relative ${
            activeTab === 'challenges'
              ? 'bg-[#1FD08A] text-[#15181D] shadow-sm'
              : 'text-[#A8B0BB] hover:text-[#F4F2ED] hover:bg-[#20252C]'
          }`}
        >
          <Target className="w-4 h-4 text-emerald-400" />
          <span>Retos de la comunidad ({challenges.length})</span>
          {joinedChallengeIds.length > 0 && (
            <span className="bg-[#15181D] text-[#1FD08A] text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ml-1 border border-[#1FD08A]/40">
              {joinedChallengeIds.length} activos
            </span>
          )}
        </button>
      </div>

      {/* VISTA 1: SALÓN DE TROFEOS */}
      {activeTab === 'hall' && (
        <div className="space-y-4">
          
          {/* BARRA DE FILTROS POR CATEGORÍA */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-[#A8B0BB] font-semibold mr-1">Filtrar:</span>
            {[
              { id: 'all', label: 'Todas las medallas' },
              { id: 'strength', label: 'Fuerza & mesociclo' },
              { id: 'running', label: 'Running & Z2' },
              { id: 'hybrid', label: 'Hyrox & agarre OCR' },
              { id: 'consistency', label: 'Constancia' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedCategory(f.id as BadgeCategory | 'all')}
                className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                  selectedCategory === f.id
                    ? 'bg-[#1FD08A] text-[#15181D] shadow-sm'
                    : 'bg-[#20252C] border border-[#282F38] text-[#A8B0BB] hover:text-[#F4F2ED] hover:border-[#38414D]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* GRID DE MEDALLAS (ALTO CONTRASTE) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBadges.map((badge) => {
              const tierStyle = BADGE_TIER_STYLES[badge.tier];

              return (
                <div
                  key={badge.id}
                  onClick={() => {
                    if (badge.isUnlocked) {
                      playBeepSound();
                    }
                    setInspectedBadge(badge);
                  }}
                  className={`cursor-pointer rounded-2xl p-5 border transition-all duration-200 relative flex flex-col justify-between overflow-hidden group shadow-sm hover:border-[#38414D] ${
                    badge.isUnlocked
                      ? `bg-gradient-to-br ${tierStyle.bg} ${tierStyle.border}`
                      : 'bg-[#20252C] border-[#282F38]'
                  }`}
                >
                  {/* Resplandor decorativo si está desbloqueada */}
                  {badge.isUnlocked && (
                    <div className="absolute -top-12 -right-12 w-28 h-28 bg-amber-400/10 rounded-full blur-2xl group-hover:bg-amber-400/20 transition-all pointer-events-none" />
                  )}

                  <div>
                    {/* Fila superior: Categoría, Tier y Estado */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        badge.tier === 'titanium'
                          ? 'bg-cyan-950/80 text-cyan-300 border-cyan-800'
                          : badge.tier === 'gold'
                          ? 'bg-yellow-950/80 text-yellow-300 border-yellow-800'
                          : badge.tier === 'silver'
                          ? 'bg-slate-800/80 text-slate-300 border-slate-700'
                          : 'bg-amber-950/80 text-amber-400 border-amber-800'
                      }`}>
                        {badge.tier.charAt(0).toUpperCase() + badge.tier.slice(1)}
                      </span>

                      {badge.isUnlocked ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[#1FD08A] bg-[#1FD08A]/10 px-2 py-0.5 rounded-full border border-[#1FD08A]/30">
                          <CheckCircle className="w-3 h-3" /> Conseguida
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[#A8B0BB] bg-[#15181D] px-2 py-0.5 rounded-full border border-[#282F38]">
                          <Lock className="w-3 h-3 text-zinc-400" /> En curso
                        </span>
                      )}
                    </div>

                    {/* Icono y Título */}
                    <div className="flex items-center gap-3.5 mb-2.5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center p-2.5 border transition-all shrink-0 ${
                        badge.isUnlocked
                          ? `bg-[#15181D] ${tierStyle.border} ${tierStyle.text} shadow-sm`
                          : 'bg-[#15181D] border-[#282F38] text-zinc-400'
                      }`}>
                        {renderBadgeIcon(badge.iconName, 'w-6 h-6')}
                      </div>

                      <div>
                        <h4 className="text-base font-black tracking-tight leading-snug text-[#F4F2ED]">
                          {badge.title}
                        </h4>
                        <p className="text-[11px] text-[#A8B0BB] leading-tight mt-0.5 line-clamp-2">
                          {badge.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Barra de progreso de la medalla */}
                  <div className="mt-4 pt-3 border-t border-[#282F38]">
                    <div className="flex justify-between items-center text-[11px] font-bold mb-1.5">
                      <span className="text-[#A8B0BB]">{badge.progressLabel}</span>
                      <span className={badge.isUnlocked ? 'text-[#1FD08A]' : 'text-[#F4F2ED]'}>
                        {badge.progress}%
                      </span>
                    </div>

                    <div className="w-full bg-[#15181D] h-2 rounded-full overflow-hidden border border-[#282F38]">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          badge.isUnlocked
                            ? 'bg-gradient-to-r from-amber-400 to-[#1FD08A]'
                            : 'bg-[#1FD08A]'
                        }`}
                        style={{ width: `${badge.progress}%` }}
                      />
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#A8B0BB] group-hover:text-[#1FD08A] transition-colors">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Info className="w-3.5 h-3.5 text-[#1FD08A]" /> ¿Por qué esta medalla?
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VISTA 2: RETOS MENSUALES */}
      {activeTab === 'challenges' && (
        <div className="space-y-4">
          
          <div className="bg-[#20252C] border border-[#282F38] rounded-2xl p-4 flex items-start gap-3 text-[#F4F2ED]">
            <Target className="w-5 h-5 text-[#1FD08A] shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <p className="font-extrabold text-sm mb-0.5 text-[#F4F2ED]">Retos activos de la comunidad</p>
              <p className="text-[#A8B0BB]">
                Inscríbete a cualquiera de los retos para conectar tus sesiones automáticamente. Cada meta alcanzada desbloqueará su respectiva insignia atlética de honor.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challenges.map((challenge) => {
              return (
                <div
                  key={challenge.id}
                  className={`rounded-2xl p-5 border transition-all bg-[#20252C] text-[#F4F2ED] flex flex-col justify-between shadow-md relative overflow-hidden ${
                    challenge.isCompleted
                      ? 'border-[#1FD08A] ring-1 ring-[#1FD08A]/40'
                      : challenge.isJoined
                      ? 'border-[#38414D]'
                      : 'border-[#282F38]'
                  }`}
                >
                  <div>
                    {/* Cabecera del reto */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="flex items-center gap-1 text-[10px] font-bold bg-[#15181D] text-[#A8B0BB] px-2.5 py-0.5 rounded-full border border-[#282F38]">
                        <Clock className="w-3 h-3 text-amber-400" />
                        {challenge.daysLeft} días restantes
                      </span>

                      {challenge.isCompleted ? (
                        <span className="bg-[#1FD08A] text-[#15181D] text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" /> Completado
                        </span>
                      ) : challenge.isJoined ? (
                        <span className="bg-[#1FD08A]/10 text-[#1FD08A] border border-[#1FD08A]/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Inscrito
                        </span>
                      ) : (
                        <span className="bg-[#15181D] text-[#A8B0BB] text-[10px] font-semibold px-2 py-0.5 rounded-full border border-[#282F38]">
                          Abierto a inscripción
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-black tracking-tight text-[#F4F2ED] mb-1">
                      {challenge.title}
                    </h3>
                    <p className="text-xs text-[#A8B0BB] leading-relaxed mb-4">
                      {challenge.description}
                    </p>

                    {/* Recompensa */}
                    <div className="bg-[#15181D] border border-[#282F38] rounded-2xl p-3 flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                        <Trophy className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-[#A8B0BB] block">
                          Recompensa al completar:
                        </span>
                        <span className="text-xs font-black text-amber-300">
                          Medalla: {challenge.badgeRewardTitle}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progreso del reto */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                      <span className="text-[#A8B0BB]">
                        Progreso: <strong className="text-[#F4F2ED]">{challenge.currentValue}</strong> / {challenge.targetValue} {challenge.unit}
                      </span>
                      <span className={challenge.isCompleted ? 'text-[#1FD08A]' : 'text-amber-400'}>
                        {challenge.progress}%
                      </span>
                    </div>

                    <div className="w-full bg-[#15181D] h-2.5 rounded-full overflow-hidden border border-[#282F38] mb-4">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          challenge.isCompleted
                            ? 'bg-[#1FD08A] shadow-[0_0_10px_rgba(31,208,138,0.5)]'
                            : 'bg-gradient-to-r from-amber-500 to-[#1FD08A]'
                        }`}
                        style={{ width: `${challenge.progress}%` }}
                      />
                    </div>

                    {/* Botón de acción */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleJoinChallenge(challenge.id)}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          challenge.isCompleted
                            ? 'bg-[#1FD08A] text-[#15181D] hover:bg-[#1bc07e] shadow-md'
                            : challenge.isJoined
                            ? 'bg-[#15181D] hover:bg-[#20252C] text-[#F4F2ED] border border-[#282F38]'
                            : 'bg-[#1FD08A] hover:bg-[#1bc07e] text-[#15181D] shadow-md'
                        }`}
                      >
                        {challenge.isCompleted ? (
                          <>
                            <Trophy className="w-4 h-4" />
                            <span>¡Objetivo conquistado!</span>
                          </>
                        ) : challenge.isJoined ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-[#1FD08A]" />
                            <span>Inscrito (haz clic para salir)</span>
                          </>
                        ) : (
                          <>
                            <Target className="w-4 h-4" />
                            <span>Unirme al reto</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL DE DETALLE BIOMECÁNICO Y CIENTÍFICO DE MEDALLA */}
      {inspectedBadge && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#20252C] border border-[#282F38] rounded-3xl max-w-lg w-full p-6 text-[#F4F2ED] shadow-2xl relative">
            
            {/* Botón Cerrar */}
            <button
              onClick={() => setInspectedBadge(null)}
              className="absolute top-4 right-4 p-2 bg-[#15181D] hover:bg-[#282F38] text-[#A8B0BB] hover:text-[#F4F2ED] rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabecera de la medalla */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center p-4 mb-3 border shadow-2xl ${
                inspectedBadge.isUnlocked
                  ? `${BADGE_TIER_STYLES[inspectedBadge.tier].bg} ${BADGE_TIER_STYLES[inspectedBadge.tier].border} ${BADGE_TIER_STYLES[inspectedBadge.tier].text} ring-4 ${BADGE_TIER_STYLES[inspectedBadge.tier].ring}`
                  : 'bg-[#15181D] border-[#282F38] text-zinc-500'
              }`}>
                {renderBadgeIcon(inspectedBadge.iconName, 'w-10 h-10')}
              </div>

              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  inspectedBadge.tier === 'titanium'
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                    : inspectedBadge.tier === 'gold'
                    ? 'bg-amber-950 text-amber-300 border-amber-800'
                    : inspectedBadge.tier === 'silver'
                    ? 'bg-slate-800 text-slate-300 border-slate-700'
                    : 'bg-amber-950 text-amber-500 border-amber-800'
                }`}>
                  Nivel: {inspectedBadge.tier.charAt(0).toUpperCase() + inspectedBadge.tier.slice(1)}
                </span>
                
                {inspectedBadge.isUnlocked ? (
                  <span className="text-[10px] font-bold text-[#1FD08A] bg-[#1FD08A]/10 px-2.5 py-0.5 rounded-full border border-[#1FD08A]/30 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Desbloqueada
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-[#A8B0BB] bg-[#15181D] px-2.5 py-0.5 rounded-full border border-[#282F38] flex items-center gap-1">
                    <Lock className="w-3 h-3 text-zinc-400" /> En curso
                  </span>
                )}
              </div>

              <h3 className="text-xl font-black tracking-tight text-[#F4F2ED] mt-1">
                {inspectedBadge.title}
              </h3>
              <p className="text-xs text-[#A8B0BB] max-w-sm mt-1">
                {inspectedBadge.description}
              </p>
            </div>

            {/* Progreso intra-medalla */}
            <div className="bg-[#15181D] border border-[#282F38] rounded-2xl p-4 mb-4">
              <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                <span className="text-[#A8B0BB]">Progreso actual: {inspectedBadge.progressLabel}</span>
                <span className={inspectedBadge.isUnlocked ? 'text-[#1FD08A]' : 'text-amber-400'}>
                  {inspectedBadge.progress}%
                </span>
              </div>
              <div className="w-full bg-[#20252C] h-2.5 rounded-full overflow-hidden border border-[#282F38]">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    inspectedBadge.isUnlocked
                      ? 'bg-gradient-to-r from-amber-400 to-[#1FD08A] shadow-[0_0_8px_rgba(31,208,138,0.4)]'
                      : 'bg-[#1FD08A]'
                  }`}
                  style={{ width: `${inspectedBadge.progress}%` }}
                />
              </div>
            </div>

            {/* Sección Científica y Consejo */}
            <div className="space-y-3 mb-6">
              <div className="bg-[#15181D] border border-[#282F38] rounded-2xl p-3.5">
                <p className="text-[11px] font-bold uppercase text-[#1FD08A] tracking-wider flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#1FD08A]" /> ¿Por qué esta medalla?
                </p>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {BADGE_SCIENCE_DATA[inspectedBadge.id]?.science || 'Hito atlético estructurado para el desarrollo integral del rendimiento físico.'}
                </p>
              </div>

              <div className="bg-[#15181D] border border-[#282F38] rounded-2xl p-3.5">
                <p className="text-[11px] font-bold uppercase text-amber-400 tracking-wider flex items-center gap-1.5 mb-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" /> Consejo del entrenador
                </p>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {BADGE_SCIENCE_DATA[inspectedBadge.id]?.coachTip || 'Mantén la disciplina en tus registros semanales para alcanzar este objetivo.'}
                </p>
              </div>
            </div>

            {/* Botón Compartir Medalla en WhatsApp si está desbloqueada */}
            {inspectedBadge.isUnlocked && (
              <button
                onClick={() => handleShareBadge(inspectedBadge)}
                className="w-full py-3 bg-[#1FD08A] hover:bg-[#1bc07e] text-[#15181D] font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md mb-2.5 active:scale-95"
              >
                <Share2 className="w-4 h-4" />
                <span>Presumir medalla en WhatsApp</span>
              </button>
            )}

            {/* Botón cerrar modal */}
            <button
              onClick={() => setInspectedBadge(null)}
              className="w-full py-3 bg-[#15181D] hover:bg-[#282F38] text-[#F4F2ED] border border-[#282F38] font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Cerrar detalle
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
