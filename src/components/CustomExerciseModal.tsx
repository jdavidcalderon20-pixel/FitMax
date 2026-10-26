import React, { useState } from 'react';
import { X, Sparkles, Plus, Dumbbell, ShieldAlert, Check } from 'lucide-react';
import { ExerciseDetail } from '../lib/exerciseBank';
import { saveCustomExercise } from '../lib/customExercises';

interface CustomExerciseModalProps {
  nickname: string;
  defaultMuscleGroup?: ExerciseDetail['muscleGroup'];
  onClose: () => void;
  onCreated: (newExercise: ExerciseDetail) => void;
  onNotification?: (msg: string) => void;
}

const MUSCLE_GROUPS: ExerciseDetail['muscleGroup'][] = [
  'Pecho',
  'Espalda',
  'Cuádriceps',
  'Glúteos',
  'Isquios y Glúteo',
  'Hombros',
  'Brazos',
  'Core',
  'Cardio y Metabólico'
];

const PATTERNS: ExerciseDetail['pattern'][] = [
  'Empuje horizontal',
  'Empuje vertical',
  'Tracción horizontal',
  'Tracción vertical',
  'Dominante rodilla',
  'Dominante cadera',
  'Aislamiento',
  'Metabólico',
  'Carga y Agarre'
];

const EQUIPMENTS: ExerciseDetail['equipment'][] = [
  'Mancuernas',
  'Barra',
  'Máquina',
  'Polea',
  'Peso corporal',
  'Kettlebell',
  'Caja / Banco',
  'Saco / Lastre',
  'Ergómetro'
];

export default function CustomExerciseModal({
  nickname,
  defaultMuscleGroup = 'Cuádriceps',
  onClose,
  onCreated,
  onNotification
}: CustomExerciseModalProps) {
  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState<ExerciseDetail['muscleGroup']>(defaultMuscleGroup);
  const [pattern, setPattern] = useState<ExerciseDetail['pattern']>('Aislamiento');
  const [equipment, setEquipment] = useState<ExerciseDetail['equipment']>('Máquina');
  const [techniqueCues, setTechniqueCues] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setErrorMsg('Por favor escribe el nombre de tu ejercicio.');
      return;
    }
    if (cleanName.length < 3) {
      setErrorMsg('El nombre debe tener al menos 3 caracteres.');
      return;
    }

    const created = saveCustomExercise(nickname, {
      name: cleanName,
      muscleGroup,
      pattern,
      equipment,
      techniqueCues: techniqueCues.trim(),
      targetFocus: `Ejercicio personalizado de ${muscleGroup}`
    });

    if (onNotification) {
      onNotification(`¡Ejercicio "${created.name}" guardado en tu catálogo! 🎯`);
    }
    onCreated(created);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-[#20252C] rounded-3xl p-5 sm:p-6 max-w-md w-full border border-[#282F38] shadow-2xl text-[#F4F2ED] space-y-4 max-h-[90vh] overflow-y-auto">
        {/* CABECERA */}
        <div className="flex items-center justify-between border-b border-[#282F38] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#1FD08A]/15 border border-[#1FD08A]/30 flex items-center justify-center text-[#1FD08A]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Crear Ejercicio Propio</h3>
              <p className="text-[11px] text-[#A8B0BB]">Añade tu variante al catálogo personal</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-[#15181D] rounded-xl text-[#A8B0BB] hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* NOMBRE DEL EJERCICIO */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#A8B0BB]">
              Nombre del ejercicio <span className="text-[#1FD08A]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Prensa a una pierna en 45°, Curl araña en banco..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrorMsg('');
              }}
              className="w-full bg-[#15181D] rounded-xl py-2.5 px-3 text-sm font-semibold text-white border border-[#282F38] focus:border-[#1FD08A] focus:outline-none transition-all placeholder:text-[#555]"
            />
          </div>

          {/* GRUPO MUSCULAR */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#A8B0BB]">Grupo muscular principal</label>
            <select
              value={muscleGroup}
              onChange={(e) => setMuscleGroup(e.target.value as ExerciseDetail['muscleGroup'])}
              className="w-full bg-[#15181D] rounded-xl py-2.5 px-3 text-xs font-bold text-white border border-[#282F38] focus:border-[#1FD08A] focus:outline-none cursor-pointer"
            >
              {MUSCLE_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* PATRÓN DE MOVIMIENTO Y EQUIPAMIENTO */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#A8B0BB]">Patrón</label>
              <select
                value={pattern}
                onChange={(e) => setPattern(e.target.value as ExerciseDetail['pattern'])}
                className="w-full bg-[#15181D] rounded-xl py-2 px-2.5 text-xs font-bold text-white border border-[#282F38] focus:border-[#1FD08A] focus:outline-none cursor-pointer"
              >
                {PATTERNS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#A8B0BB]">Equipamiento</label>
              <select
                value={equipment}
                onChange={(e) => setEquipment(e.target.value as ExerciseDetail['equipment'])}
                className="w-full bg-[#15181D] rounded-xl py-2 px-2.5 text-xs font-bold text-white border border-[#282F38] focus:border-[#1FD08A] focus:outline-none cursor-pointer"
              >
                {EQUIPMENTS.map((eq) => (
                  <option key={eq} value={eq}>
                    {eq}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* INDICACIONES TÉCNICAS (OPCIONAL) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#A8B0BB]">
              Técnica / Consejos de postura <span className="text-[10px] text-zinc-500 font-normal">(Opcional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Ej: Mantener el torso firme, no despegar la cadera, apretar en el pico de contracción 1s..."
              value={techniqueCues}
              onChange={(e) => setTechniqueCues(e.target.value)}
              className="w-full bg-[#15181D] rounded-xl py-2 px-3 text-xs text-white border border-[#282F38] focus:border-[#1FD08A] focus:outline-none transition-all placeholder:text-[#555] resize-none"
            />
          </div>

          {/* NOTA: SIN FOTO OBLIGATORIA */}
          <div className="p-3 bg-[#15181D] rounded-2xl border border-[#282F38] text-[11px] text-[#A8B0BB] flex items-start gap-2 leading-relaxed">
            <Dumbbell className="w-4 h-4 text-[#1FD08A] shrink-0 mt-0.5" />
            <span>
              Tu ejercicio se integrará inmediatamente con su icono deportivo y grupo muscular. Podrás seleccionarlo en tus rutinas personalizadas y en sustituciones.
            </span>
          </div>

          {/* BOTONES */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-[#15181D] hover:bg-[#282F38] text-[#A8B0BB] hover:text-white font-bold rounded-2xl text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-[#1FD08A] hover:bg-[#1ab87a] text-[#15181D] font-black rounded-2xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-[0_4px_15px_rgba(31,208,138,0.3)] cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Guardar ejercicio</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
