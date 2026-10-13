import React, { useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, Wind, Target, Dumbbell } from 'lucide-react';
import { ExerciseDetail } from '../lib/exerciseBank';
import { SCIENTIFIC_EXERCISES } from '../data/exercisesData';
import EvidenceBadge from './EvidenceBadge';
import RealExercisePhotoGuide from './RealExercisePhotoGuide';

interface ExerciseDetailModalProps {
  exercise: ExerciseDetail | null;
  onClose: () => void;
}

export default function ExerciseDetailModal({ exercise, onClose }: ExerciseDetailModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!exercise) return null;

  const scientificMatch = SCIENTIFIC_EXERCISES.find(
    (se) => se.id === exercise.id || 
            se.name.toLowerCase().trim() === exercise.name.toLowerCase().trim() ||
            exercise.name.toLowerCase().includes(se.name.toLowerCase()) ||
            se.name.toLowerCase().includes(exercise.name.toLowerCase())
  );

  const evidenceLevel = scientificMatch?.evidence || (exercise.level === 'A' ? 'A' : exercise.level === 'B' ? 'B' : 'B');

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 md:p-6 overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="exercise-detail-title"
    >
      <div 
        className="relative bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full border border-zinc-200 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh] sm:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER - STICKY TOP Y SIEMPRE VISIBLE */}
        <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-900 text-white p-4 sm:p-5 flex items-start justify-between gap-3 shrink-0 border-b border-zinc-800 sticky top-0 z-20">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 flex-wrap">
              <span className="bg-emerald-500 text-zinc-950 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                {exercise.muscleGroup}
              </span>
              <span className="bg-zinc-800 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                {exercise.equipment}
              </span>
              <EvidenceBadge evidence={evidenceLevel} size="sm" />
            </div>
            <h3 id="exercise-detail-title" className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2 truncate">
              <Dumbbell className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="truncate">{exercise.name}</span>
            </h3>
            <p className="text-zinc-300 text-xs mt-1 font-medium flex items-center gap-1.5 line-clamp-1">
              <Target className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{exercise.targetFocus}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-zinc-800/90 hover:bg-rose-600 text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 font-bold text-xs shrink-0 border border-zinc-700/80 shadow-md focus:outline-none focus:ring-2 focus:ring-rose-500"
            title="Cerrar guía (Esc)"
            aria-label="Cerrar guía técnica"
          >
            <span className="hidden sm:inline font-bold">Cerrar</span>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENIDO SCROLLEABLE INTERNO */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 overscroll-contain">
          {/* GUÍA TÉCNICA ILUSTRADA CON FOTOGRAFÍA DEMOSTRATIVA REAL (2 FASES: INICIO Y FINAL) */}
          <RealExercisePhotoGuide exercise={exercise} />

          {/* PASO A PASO */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900 mb-2.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Técnica y Ejecución Paso a Paso
            </h4>
            <div className="space-y-2">
              {exercise.steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5 bg-zinc-50 border border-zinc-100 p-3 rounded-xl text-xs text-zinc-700 leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ERRORES COMUNES */}
          {exercise.commonMistakes && exercise.commonMistakes.length > 0 && (
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-800 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Errores Comunes a Evitar
              </h4>
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 space-y-1.5">
                {exercise.commonMistakes.map((mistake, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-amber-900 leading-relaxed">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{mistake}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* INDICACIONES CLAVE (CUES DE ENFOQUE MENTAL) */}
          {scientificMatch?.cues && scientificMatch.cues.length > 0 && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 space-y-1.5">
              <h4 className="text-[11px] font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Puntos Clave de Enfoque Mental
              </h4>
              <div className="space-y-1">
                {scientificMatch.cues.map((cue, idx) => (
                  <p key={idx} className="text-xs text-emerald-800 leading-snug flex items-start gap-1.5">
                    <span className="font-bold text-emerald-600 shrink-0">✓</span>
                    <span>{cue}</span>
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* NOTA DEL ENTRENADOR */}
          {scientificMatch?.notes && (
            <div className="bg-zinc-100 border border-zinc-200/90 rounded-2xl p-3 text-xs text-zinc-700 leading-relaxed">
              <span className="font-bold text-zinc-900">💡 Nota de aplicación: </span>
              {scientificMatch.notes}
            </div>
          )}

          {/* CONSEJO DE RESPIRACIÓN */}
          {exercise.breathingTip && (
            <div className="bg-blue-50 border border-blue-200/80 rounded-2xl p-3.5 flex items-start gap-2.5">
              <Wind className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-blue-900 mb-0.5">Respiración y Ritmo</p>
                <p className="text-xs text-blue-800 leading-relaxed">{exercise.breathingTip}</p>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER - STICKY BOTTOM */}
        <div className="p-3 sm:p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-500 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Técnica validada para prevenir lesiones</span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto bg-zinc-950 hover:bg-zinc-800 text-white font-black text-xs px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <span>Entendido, volver al entrenamiento</span>
          </button>
        </div>
      </div>
    </div>
  );
}
