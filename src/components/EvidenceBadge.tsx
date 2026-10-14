import React, { useState } from 'react';
import { ShieldCheck, HelpCircle, Sparkles } from 'lucide-react';
import { Evidence, EVIDENCE_INFO } from '../data/types';

interface EvidenceBadgeProps {
  evidence?: Evidence;
  size?: 'sm' | 'md';
  showExplanation?: boolean;
}

export default function EvidenceBadge({ 
  evidence = 'B', 
  size = 'md',
  showExplanation = false
}: EvidenceBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const info = EVIDENCE_INFO[evidence] || EVIDENCE_INFO.B;

  const colorStyles = {
    emerald: 'bg-[#1FD08A]/15 text-[#1FD08A] border-[#1FD08A]/30 hover:bg-[#1FD08A]/25',
    blue: 'bg-[#5B8DEF]/15 text-[#5B8DEF] border-[#5B8DEF]/30 hover:bg-[#5B8DEF]/25',
    purple: 'bg-[#C084FC]/15 text-[#C084FC] border-[#C084FC]/30 hover:bg-[#C084FC]/25'
  }[info.color] || 'bg-[#20252C] text-[#F4F2ED] border-[#282F38]';

  const badgePadding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`inline-flex items-center gap-1.5 font-bold rounded-full border transition-all cursor-pointer shadow-xs ${badgePadding} ${colorStyles}`}
        title="Haz clic para ver el respaldo científico de este ejercicio"
      >
        <ShieldCheck className={size === 'sm' ? 'w-3 h-3 text-emerald-600' : 'w-3.5 h-3.5 text-emerald-600'} />
        <span>{info.badge}</span>
        <HelpCircle className={size === 'sm' ? 'w-2.5 h-2.5 opacity-60' : 'w-3 h-3 opacity-60'} />
      </button>

      {/* Tooltip / Explicación Científica Amigable */}
      {(showTooltip || showExplanation) && (
        <div className="absolute bottom-full left-0 mb-2 z-50 w-72 p-3 bg-[#15181D] text-[#F4F2ED] rounded-2xl shadow-2xl border border-[#282F38] text-xs animate-fadeIn pointer-events-none">
          <div className="flex items-center gap-1.5 mb-1 text-[#1FD08A] font-extrabold text-[11px] uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Respaldado por evidencia</span>
          </div>
          <p className="font-bold text-[#F4F2ED] mb-1">{info.label}</p>
          <p className="text-[#A8B0BB] text-[11px] leading-relaxed">
            {info.explanation}
          </p>
          <div className="mt-2 pt-2 border-t border-[#282F38] text-[10px] text-[#A8B0BB] flex items-center justify-between">
            <span>Metodología FitMax</span>
            <span className="font-mono text-[#1FD08A]">Ciencia deportiva</span>
          </div>
        </div>
      )}
    </div>
  );
}
