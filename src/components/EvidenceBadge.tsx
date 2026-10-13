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
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100',
    blue: 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100',
    purple: 'bg-purple-50 text-purple-800 border-purple-300 hover:bg-purple-100'
  }[info.color] || 'bg-zinc-50 text-zinc-800 border-zinc-300';

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
        <div className="absolute bottom-full left-0 mb-2 z-50 w-72 p-3 bg-zinc-950 text-white rounded-2xl shadow-2xl border border-zinc-800 text-xs animate-fadeIn pointer-events-none">
          <div className="flex items-center gap-1.5 mb-1 text-emerald-400 font-extrabold text-[11px] uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Respaldado por evidencia</span>
          </div>
          <p className="font-bold text-zinc-100 mb-1">{info.label}</p>
          <p className="text-zinc-300 text-[11px] leading-relaxed">
            {info.explanation}
          </p>
          <div className="mt-2 pt-2 border-t border-zinc-800/80 text-[10px] text-zinc-400 flex items-center justify-between">
            <span>Metodología FitMax</span>
            <span className="font-mono text-emerald-400">Ciencia Deportiva</span>
          </div>
        </div>
      )}
    </div>
  );
}
