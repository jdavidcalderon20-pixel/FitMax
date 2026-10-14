import React, { useEffect, useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Wind, 
  Target, 
  Dumbbell, 
  TrendingDown, 
  TrendingUp, 
  RefreshCw, 
  Plus, 
  Check, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { ExerciseDetail, findExerciseDetail, EXERCISE_BANK } from '../lib/exerciseBank';
import { SCIENTIFIC_EXERCISES } from '../data/exercisesData';
import EvidenceBadge from './EvidenceBadge';
import RealExercisePhotoGuide from './RealExercisePhotoGuide';

interface ExerciseDetailModalProps {
  exercise: ExerciseDetail | null;
  onClose: () => void;
  onAddToRoutine?: (exercise: ExerciseDetail) => void;
  onSelectAlternative?: (exercise: ExerciseDetail) => void;
}

export default function ExerciseDetailModal({ 
  exercise: initialExercise, 
  onClose,
  onAddToRoutine,
  onSelectAlternative
}: ExerciseDetailModalProps) {
  const [currentEx, setCurrentEx] = useState<ExerciseDetail | null>(initialExercise);

  useEffect(() => {
    setCurrentEx(initialExercise);
  }, [initialExercise]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!currentEx) return null;

  const scientificMatch = SCIENTIFIC_EXERCISES.find(
    (se) => se.id === currentEx.id || 
            se.name.toLowerCase().trim() === currentEx.name.toLowerCase().trim() ||
            currentEx.name.toLowerCase().includes(se.name.toLowerCase()) ||
            se.name.toLowerCase().includes(currentEx.name.toLowerCase())
  );

  const evidenceLevel = (currentEx.evidence || scientificMatch?.evidence || (currentEx.level === 'A' ? 'A' : currentEx.level === 'B' ? 'B' : 'B')) as 'A' | 'B' | 'C';

  // Helper para resolver id o nombre de ejercicio alternativo
  const resolveExercise = (ref: string): ExerciseDetail | undefined => {
    return EXERCISE_BANK.find((ex) => 
      ex.id === ref || 
      ex.name.toLowerCase().trim() === ref.toLowerCase().trim() ||
      ex.name.toLowerCase().includes(ref.toLowerCase())
    );
  };

  const regressionEx = scientificMatch?.regression ? resolveExercise(scientificMatch.regression) : undefined;
  const progressionEx = scientificMatch?.progression ? resolveExercise(scientificMatch.progression) : undefined;
  const alternativesList = (scientificMatch?.alternatives || [])
    .map((altId) => resolveExercise(altId))
    .filter((ex): ex is ExerciseDetail => ex !== undefined && ex.id !== currentEx.id);

  const handleNavigateToExercise = (ex: ExerciseDetail) => {
    setCurrentEx(ex);
    if (onSelectAlternative) {
      onSelectAlternative(ex);
    }
  };

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
        className="relative bg-[#20252C] rounded-2xl sm:rounded-3xl max-w-2xl w-full border border-[#282F38] shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh] sm:max-h-[90vh] text-[#F4F2ED]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CABECERA STICKY SUPERIOR */}
        <div className="bg-[#15181D] p-4 sm:p-5 flex items-start justify-between gap-3 shrink-0 border-b border-[#282F38] sticky top-0 z-20">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 flex-wrap">
              <span className="bg-[#1FD08A]/15 text-[#1FD08A] px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-[#1FD08A]/30">
                {currentEx.muscleGroup}
              </span>
              <span className="bg-[#20252C] text-[#A8B0BB] border border-[#282F38] px-2 py-0.5 rounded-full text-[10px] font-bold">
                {currentEx.equipment}
              </span>
              <span className="bg-[#5B8DEF]/15 text-[#5B8DEF] border border-[#5B8DEF]/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                {currentEx.level === 'A' ? 'Base' : currentEx.level === 'B' ? 'Intermedio' : 'Avanzado'}
              </span>
              <EvidenceBadge evidence={evidenceLevel} size="sm" />
            </div>

            <h3 id="exercise-detail-title" className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2 truncate">
              <Dumbbell className="w-5 h-5 text-[#1FD08A] shrink-0" />
              <span className="truncate">{currentEx.name}</span>
            </h3>

            {currentEx.targetFocus && (
              <p className="text-[#A8B0BB] text-xs mt-1 font-medium flex items-center gap-1.5 line-clamp-1">
                <Target className="w-3.5 h-3.5 text-[#1FD08A] shrink-0" />
                <span className="truncate">{currentEx.targetFocus}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onAddToRoutine && (
              <button
                type="button"
                onClick={() => onAddToRoutine(currentEx)}
                className="px-3 py-1.5 bg-[#1FD08A] hover:bg-[#1ab87a] text-[#15181D] font-black text-xs rounded-xl transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                title="Añadir a mi rutina personalizada"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Añadir</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#20252C] hover:bg-[#282F38] text-[#A8B0BB] hover:text-white transition-all flex items-center gap-1.5 font-bold text-xs border border-[#282F38] cursor-pointer"
              title="Cerrar (Esc)"
              aria-label="Cerrar guía técnica"
            >
              <span className="hidden sm:inline">Cerrar</span>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CONTENIDO SCROLLEABLE */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 overscroll-contain">
          {/* GUÍA TÉCNICA ILUSTRADA CON FOTOGRAFÍA DEMOSTRATIVA */}
          <RealExercisePhotoGuide exercise={currentEx} />

          {/* PASO A PASO */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white mb-2.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#1FD08A]" />
              Técnica y ejecución paso a paso
            </h4>
            <div className="space-y-2">
              {currentEx.steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5 bg-[#15181D] border border-[#282F38] p-3 rounded-2xl text-xs text-[#F4F2ED] leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-[#1FD08A]/15 text-[#1FD08A] font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ERRORES COMUNES */}
          {currentEx.commonMistakes && currentEx.commonMistakes.length > 0 && (
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Errores comunes a evitar
              </h4>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 space-y-1.5">
                {currentEx.commonMistakes.map((mistake, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-amber-200 leading-relaxed">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{mistake}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PUNTOS CLAVE DE ENFOQUE (CUES TÉCNICOS) */}
          {scientificMatch?.cues && scientificMatch.cues.length > 0 && (
            <div className="bg-[#15181D] border border-[#1FD08A]/30 rounded-2xl p-3.5 space-y-1.5">
              <h4 className="text-[11px] font-black uppercase tracking-wider text-[#1FD08A] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1FD08A]" />
                Puntos clave de enfoque mental
              </h4>
              <div className="space-y-1">
                {scientificMatch.cues.map((cue, idx) => (
                  <p key={idx} className="text-xs text-[#F4F2ED] leading-snug flex items-start gap-1.5">
                    <span className="font-bold text-[#1FD08A] shrink-0">✓</span>
                    <span>{cue}</span>
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* CONSEJO DE RESPIRACIÓN */}
          {currentEx.breathingTip && (
            <div className="bg-[#5B8DEF]/10 border border-[#5B8DEF]/30 rounded-2xl p-3.5 flex items-start gap-2.5">
              <Wind className="w-4 h-4 text-[#5B8DEF] mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-[#5B8DEF] mb-0.5">Respiración y ritmo</p>
                <p className="text-xs text-blue-200 leading-relaxed">{currentEx.breathingTip}</p>
              </div>
            </div>
          )}

          {/* VARIANTES RELACIONADAS: MÁS FÁCIL, MÁS DIFÍCIL Y ALTERNATIVAS */}
          <div className="bg-[#15181D] border border-[#282F38] rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-[#1FD08A]" />
              Variantes y adaptaciones de este ejercicio
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Más fácil (Regresión) */}
              {regressionEx && (
                <button
                  type="button"
                  onClick={() => handleNavigateToExercise(regressionEx)}
                  className="p-3 bg-[#20252C] hover:bg-[#282F38] border border-[#282F38] rounded-xl text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-1.5 text-blue-400 text-[10px] font-black uppercase mb-1">
                    <TrendingDown className="w-3 h-3" />
                    <span>Más fácil (Regresión)</span>
                  </div>
                  <p className="text-xs font-bold text-white group-hover:text-[#1FD08A] transition-colors truncate">
                    {regressionEx.name}
                  </p>
                  <p className="text-[10px] text-[#A8B0BB] mt-0.5">{regressionEx.equipment}</p>
                </button>
              )}

              {/* Más difícil (Progresión) */}
              {progressionEx && (
                <button
                  type="button"
                  onClick={() => handleNavigateToExercise(progressionEx)}
                  className="p-3 bg-[#20252C] hover:bg-[#282F38] border border-[#282F38] rounded-xl text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-1.5 text-purple-400 text-[10px] font-black uppercase mb-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>Más difícil (Progresión)</span>
                  </div>
                  <p className="text-xs font-bold text-white group-hover:text-[#1FD08A] transition-colors truncate">
                    {progressionEx.name}
                  </p>
                  <p className="text-[10px] text-[#A8B0BB] mt-0.5">{progressionEx.equipment}</p>
                </button>
              )}
            </div>

            {/* Alternativas equivalentes */}
            {alternativesList.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-[#A8B0BB] uppercase tracking-wider block">
                  Alternativas equivalentes para el mismo grupo muscular:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {alternativesList.map((alt) => (
                    <button
                      key={alt.id}
                      type="button"
                      onClick={() => handleNavigateToExercise(alt)}
                      className="px-2.5 py-1 bg-[#20252C] hover:bg-[#282F38] hover:border-[#1FD08A]/40 border border-[#282F38] rounded-lg text-xs text-[#F4F2ED] transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>{alt.name}</span>
                      <ChevronRight className="w-3 h-3 text-[#A8B0BB]" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER STICKY INFERIOR */}
        <div className="p-3 sm:p-4 bg-[#15181D] border-t border-[#282F38] flex items-center justify-between gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2 text-xs text-[#A8B0BB] font-medium">
            <CheckCircle2 className="w-4 h-4 text-[#1FD08A] shrink-0" />
            <span>Técnica validada para prevenir lesiones</span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto bg-[#1FD08A] hover:bg-[#1ab87a] text-[#15181D] font-black text-xs px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Volver al entrenamiento</span>
          </button>
        </div>
      </div>
    </div>
  );
}
