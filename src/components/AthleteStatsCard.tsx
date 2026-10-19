import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Dumbbell, 
  Footprints, 
  Timer, 
  Sparkles, 
  TrendingUp, 
  ChevronRight, 
  X, 
  Award, 
  HeartPulse, 
  CheckCircle2, 
  Zap 
} from 'lucide-react';
import { getAthleteWeeklySummary, AthleteWeeklySummary } from '../lib/athleteStats';

interface AthleteStatsCardProps {
  nickname: string;
  onNavigateToDiscipline?: (discipline: 'gym' | 'running' | 'hyrox' | 'hiit') => void;
}

export default function AthleteStatsCard({ nickname, onNavigateToDiscipline }: AthleteStatsCardProps) {
  const [summary, setSummary] = useState<AthleteWeeklySummary | null>(null);
  const [showFullModal, setShowFullModal] = useState(false);

  useEffect(() => {
    if (!nickname) return;
    setSummary(getAthleteWeeklySummary(nickname));
  }, [nickname]);

  if (!summary) return null;

  // Formato de horas y minutos
  const formatHoursMins = (totalMinutes: number) => {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (h > 0) return `${h}h ${m > 0 ? `${m}m` : ''}`;
    return `${m}m`;
  };

  const getStatusBgColor = (status: AthleteWeeklySummary['loadStatus']) => {
    switch (status) {
      case 'optimo': return 'bg-[#1FD08A]/10 text-[#1FD08A] border-[#1FD08A]/30';
      case 'sobrecarga': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default: return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
  };

  return (
    <>
      {/* TARJETA RESUMEN EN VISTA HOY */}
      <div 
        onClick={() => setShowFullModal(true)}
        className="w-full bg-[#20252C] border border-[#282F38] hover:border-[#1FD08A]/50 rounded-3xl p-4 shadow-xl transition-all cursor-pointer group active:scale-[0.99]"
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-[#1FD08A]/20 text-[#1FD08A] flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-[#F4F2ED]">
              Mi Rendimiento Semanal
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${getStatusBgColor(summary.loadStatus)}`}>
              {summary.loadBadgeText}
            </span>
            <ChevronRight className="w-4 h-4 text-[#A8B0BB] group-hover:text-[#1FD08A] group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        {/* 3 METRICAS CLAVE */}
        <div className="grid grid-cols-3 gap-2 py-1 border-y border-[#282F38]/60 my-2">
          {/* Entrenamientos */}
          <div className="text-center py-1">
            <p className="text-[10px] font-bold uppercase text-[#A8B0BB] flex items-center justify-center gap-1">
              <Dumbbell className="w-3 h-3 text-[#5B8DEF]" /> Sesiones
            </p>
            <p className="text-lg font-black text-[#F4F2ED] mt-0.5 font-mono tabular-nums">
              {summary.totalWorkouts}<span className="text-xs text-[#A8B0BB] font-normal">/{summary.targetWorkouts}</span>
            </p>
            <div className="w-12 h-1 bg-[#15181D] rounded-full mx-auto mt-1 overflow-hidden">
              <div 
                className="h-full bg-[#1FD08A] rounded-full transition-all"
                style={{ width: `${summary.compliancePercentage}%` }}
              />
            </div>
          </div>

          {/* Kilómetros Running */}
          <div className="text-center py-1 border-x border-[#282F38]/60">
            <p className="text-[10px] font-bold uppercase text-[#A8B0BB] flex items-center justify-center gap-1">
              <Footprints className="w-3 h-3 text-[#F2685B]" /> Carrera
            </p>
            <p className="text-lg font-black text-[#F4F2ED] mt-0.5 font-mono tabular-nums">
              {summary.totalRunningKm} <span className="text-xs text-[#A8B0BB] font-normal">km</span>
            </p>
            <p className="text-[10px] text-[#A8B0BB] font-mono mt-0.5">
              {summary.runningPaceAvg !== '--' ? `${summary.runningPaceAvg}` : 'Sin ritmo'}
            </p>
          </div>

          {/* Tiempo Total Activo */}
          <div className="text-center py-1">
            <p className="text-[10px] font-bold uppercase text-[#A8B0BB] flex items-center justify-center gap-1">
              <Timer className="w-3 h-3 text-[#C084FC]" /> Tiempo
            </p>
            <p className="text-lg font-black text-[#F4F2ED] mt-0.5 font-mono tabular-nums">
              {formatHoursMins(summary.totalActiveMinutes)}
            </p>
            <p className="text-[10px] text-emerald-400 font-bold mt-0.5 flex items-center justify-center gap-0.5">
              <Flame className="w-2.5 h-2.5 text-amber-400" /> Racha: {summary.weeksStreak}s
            </p>
          </div>
        </div>

        {/* Highlight o consejo rápido */}
        <p className="text-[11px] text-[#A8B0BB] pt-1 leading-snug line-clamp-1">
          💡 <span className="text-[#F4F2ED] font-semibold">{summary.loadAdvice}</span>
        </p>
      </div>

      {/* MODAL DETALLADO DE ESTADÍSTICAS DEL ATLETA */}
      {showFullModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#15181D] border border-[#282F38] text-[#F4F2ED] rounded-3xl p-5 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5">
            {/* Cabecera */}
            <div className="flex items-center justify-between border-b border-[#20252C] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-2xl bg-[#1FD08A]/20 text-[#1FD08A] flex items-center justify-center font-black">
                  <Award className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-[#F4F2ED]">Estadísticas de la Semana</h3>
                  <p className="text-xs text-[#A8B0BB]">Atleta: {nickname}</p>
                </div>
              </div>

              <button
                onClick={() => setShowFullModal(false)}
                className="w-8 h-8 rounded-xl bg-[#20252C] hover:bg-[#282F38] text-[#A8B0BB] hover:text-[#F4F2ED] flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tarjeta de Carga Semanal */}
            <div className="bg-[#20252C] border border-[#282F38] rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#A8B0BB] uppercase tracking-wider">Estado de Fatiga & Asimilación</span>
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${getStatusBgColor(summary.loadStatus)}`}>
                  {summary.loadBadgeText}
                </span>
              </div>
              <p className="text-xs text-[#F4F2ED] leading-relaxed">
                {summary.loadAdvice}
              </p>
            </div>

            {/* Desglose por Disciplina */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#A8B0BB]">
                Volumen por Disciplina
              </h4>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Gimnasio / Fuerza */}
                <div className="bg-[#20252C] border border-[#282F38] rounded-2xl p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#5B8DEF]">
                    <Dumbbell className="w-4 h-4" />
                    <span>Gimnasio & Fuerza</span>
                  </div>
                  <p className="text-xl font-black font-mono tabular-nums text-[#F4F2ED]">
                    {summary.gymSetsCompleted} <span className="text-xs font-normal text-[#A8B0BB]">series</span>
                  </p>
                  <p className="text-[11px] text-[#A8B0BB]">
                    {formatHoursMins(summary.gymMinutes)} acumulados
                  </p>
                  {summary.estimatedTonnageKg > 0 && (
                    <p className="text-[10px] text-amber-400/90 font-mono">
                      ~{summary.estimatedTonnageKg.toLocaleString()} kg movidos
                    </p>
                  )}
                </div>

                {/* Running */}
                <div className="bg-[#20252C] border border-[#282F38] rounded-2xl p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#F2685B]">
                    <Footprints className="w-4 h-4" />
                    <span>Running</span>
                  </div>
                  <p className="text-xl font-black font-mono tabular-nums text-[#F4F2ED]">
                    {summary.totalRunningKm} <span className="text-xs font-normal text-[#A8B0BB]">km</span>
                  </p>
                  <p className="text-[11px] text-[#A8B0BB]">
                    Ritmo prom: {summary.runningPaceAvg}
                  </p>
                  <p className="text-[10px] text-emerald-400 font-bold">
                    {summary.easyRunningPct}% en Zona 2 aeróbica
                  </p>
                </div>

                {/* Hyrox & OCR */}
                <div className="bg-[#20252C] border border-[#282F38] rounded-2xl p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#C084FC]">
                    <Flame className="w-4 h-4" />
                    <span>Hyrox & OCR</span>
                  </div>
                  <p className="text-xl font-black font-mono tabular-nums text-[#F4F2ED]">
                    {summary.hyroxSessionsCompleted} <span className="text-xs font-normal text-[#A8B0BB]">sesiones</span>
                  </p>
                  <p className="text-[11px] text-[#A8B0BB]">
                    {summary.hyroxStationsCompleted} estaciones trabajadas
                  </p>
                </div>

                {/* Tiempo Activo Global */}
                <div className="bg-[#20252C] border border-[#282F38] rounded-2xl p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1FD08A]">
                    <HeartPulse className="w-4 h-4" />
                    <span>Total en Movimiento</span>
                  </div>
                  <p className="text-xl font-black font-mono tabular-nums text-[#F4F2ED]">
                    {formatHoursMins(summary.totalActiveMinutes)}
                  </p>
                  <p className="text-[11px] text-[#A8B0BB]">
                    Racha activa: {summary.weeksStreak} semanas
                  </p>
                </div>
              </div>
            </div>

            {/* Barra de Distribución Híbrida */}
            <div className="bg-[#20252C] border border-[#282F38] rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#A8B0BB]">
                <span>Reparto del Entrenamiento</span>
                <span>{summary.compliancePercentage}% cumplido</span>
              </div>

              <div className="h-3 w-full bg-[#15181D] rounded-full overflow-hidden flex">
                <div 
                  className="bg-[#5B8DEF] h-full" 
                  style={{ width: `${summary.disciplineBreakdown.gymPct}%` }}
                  title={`Gimnasio: ${summary.disciplineBreakdown.gymPct}%`}
                />
                <div 
                  className="bg-[#F2685B] h-full" 
                  style={{ width: `${summary.disciplineBreakdown.runningPct}%` }}
                  title={`Running: ${summary.disciplineBreakdown.runningPct}%`}
                />
                <div 
                  className="bg-[#C084FC] h-full" 
                  style={{ width: `${summary.disciplineBreakdown.hyroxPct}%` }}
                  title={`Hyrox: ${summary.disciplineBreakdown.hyroxPct}%`}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-[#A8B0BB] pt-1">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#5B8DEF]" /> Fuerza ({summary.disciplineBreakdown.gymPct}%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#F2685B]" /> Running ({summary.disciplineBreakdown.runningPct}%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#C084FC]" /> Hyrox ({summary.disciplineBreakdown.hyroxPct}%)
                </span>
              </div>
            </div>

            {/* Hitos de la semana */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#A8B0BB]">
                Registro y Logros
              </h4>
              <div className="space-y-1.5">
                {summary.recentHighlights.map((hl, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-[#20252C] p-2.5 rounded-xl border border-[#282F38] text-xs text-[#F4F2ED]">
                    <span>{hl}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Botón cerrar */}
            <button
              onClick={() => setShowFullModal(false)}
              className="w-full bg-[#1FD08A] hover:bg-[#1ab87a] text-[#15181D] font-black py-3 rounded-2xl text-xs transition-all cursor-pointer shadow-lg active:scale-95"
            >
              Listo, cerrar estadísticas
            </button>
          </div>
        </div>
      )}
    </>
  );
}
