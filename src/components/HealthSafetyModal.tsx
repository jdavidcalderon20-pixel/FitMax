import React, { useState } from 'react';
import { X, ShieldCheck, Heart, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { HEALTH_SAFETY_QUESTIONS, MEDICAL_DISCLAIMER } from '../data/healthSecurityData';

interface HealthSafetyModalProps {
  onClose: () => void;
  onCompleted?: () => void;
}

export default function HealthSafetyModal({ onClose, onCompleted }: HealthSafetyModalProps) {
  const [answers, setAnswers] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('fitmax_parq_answers');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggleAnswer = (id: string, value: boolean) => {
    const updated = { ...answers, [id]: value };
    setAnswers(updated);
    try {
      localStorage.setItem('fitmax_parq_answers', JSON.stringify(updated));
    } catch (e) {}
  };

  const hasAnyYes = Object.values(answers).some((val) => val === true);
  const allAnswered = HEALTH_SAFETY_QUESTIONS.every((q) => answers[q.id] !== undefined);

  const handleFinish = () => {
    try {
      localStorage.setItem('fitmax_parq_completed_date', String(Date.now()));
    } catch (e) {}
    if (onCompleted) onCompleted();
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-zinc-950 text-white rounded-3xl max-w-lg w-full border border-zinc-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="p-5 md:p-6 border-b border-zinc-800 bg-zinc-900/60 flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-black px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wider">
                  {MEDICAL_DISCLAIMER.badge}
                </span>
                <span className="text-[10px] text-zinc-400 font-bold">1 Minuto</span>
              </div>
              <h3 className="font-extrabold text-base md:text-lg text-white mt-0.5">
                Chequeo Rápido de Salud y Seguridad
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                7 preguntas sencillas recomendadas antes de arrancar a entrenar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumen / Disclaimer */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-xs leading-relaxed">
          <div className="bg-zinc-900/70 border border-zinc-800 p-3.5 rounded-2xl text-zinc-300 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white mb-0.5">{MEDICAL_DISCLAIMER.title}</p>
              <p className="text-[11px] text-zinc-400">{MEDICAL_DISCLAIMER.summary}</p>
            </div>
          </div>

          {/* Preguntas */}
          <div className="space-y-2.5">
            {HEALTH_SAFETY_QUESTIONS.map((q, idx) => {
              const currentVal = answers[q.id];
              const isExpanded = expandedId === q.id;

              return (
                <div
                  key={q.id}
                  className="bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-3.5 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-zinc-200">
                        <span className="text-emerald-400 font-bold mr-1">{idx + 1}.</span>
                        {q.question}
                      </p>
                      {isExpanded && (
                        <p className="text-[11px] text-zinc-400 mt-1.5 pl-3 border-l-2 border-emerald-500/40 animate-fadeIn">
                          💡 {q.explanation}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : q.id)}
                      className="text-zinc-500 hover:text-zinc-300 p-1 shrink-0"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Botones Sí / No */}
                  <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-zinc-800/60 justify-end">
                    <span className="text-[11px] text-zinc-400 mr-auto">¿Aplica a ti?</span>
                    <button
                      type="button"
                      onClick={() => handleToggleAnswer(q.id, false)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        currentVal === false
                          ? 'bg-emerald-500 text-zinc-950 font-black shadow'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleAnswer(q.id, true)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        currentVal === true
                          ? 'bg-amber-500 text-zinc-950 font-black shadow'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      Sí
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Alerta en caso de responder Sí */}
          {hasAnyYes && (
            <div className="bg-amber-950/50 border border-amber-500/40 p-3.5 rounded-2xl text-amber-200 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-300">Recomendación Personalizada:</p>
                <p className="text-[11px] mt-0.5 leading-relaxed">
                  Has marcado "Sí" en al menos una pregunta. Te sugerimos consultar a un profesional médico o comenzar con intensidades moderadas (Zonas 1 y 2, RIR 3 en el gimnasio). ¡Tu salud siempre es lo primero!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-900/80 border-t border-zinc-800 flex items-center justify-between gap-3 shrink-0">
          <p className="text-[11px] text-zinc-400">
            {allAnswered ? '✓ Todas las preguntas contestadas' : 'Puedes responder a tu ritmo'}
          </p>
          <button
            onClick={handleFinish}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-xl text-xs transition-all shadow-md"
          >
            Guardar y Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
