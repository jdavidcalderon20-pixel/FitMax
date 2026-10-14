import React, { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Dumbbell, 
  Footprints, 
  Mountain, 
  Flame, 
  HeartPulse, 
  ShieldCheck, 
  Sparkles, 
  Calendar,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Level } from '../types';
import { HEALTH_SAFETY_QUESTIONS } from '../data/healthSecurityData';

export interface OnboardingData {
  goals: string[];
  gymLevel: Level;
  daysPerWeek: 3 | 4 | 5;
  equipment: 'full_gym' | 'home_dumbbells' | 'bodyweight';
  age: number;
  runningPaceTime?: string;
  runningDistance?: '5k' | '10k' | 'none';
  healthPassed: boolean;
}

interface OnboardingModalProps {
  nickname: string;
  initialLevel?: Level;
  onClose: () => void;
  onComplete: (data: OnboardingData) => void;
}

export default function OnboardingModal({
  nickname,
  initialLevel = 'B',
  onClose,
  onComplete
}: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Paso 1: Objetivos
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['musculo']);

  // Paso 2: Experiencia / Nivel de gimnasio
  const [gymLevel, setGymLevel] = useState<Level>(initialLevel);

  // Paso 3: Disponibilidad y equipamiento
  const [daysPerWeek, setDaysPerWeek] = useState<3 | 4 | 5>(4);
  const [equipment, setEquipment] = useState<'full_gym' | 'home_dumbbells' | 'bodyweight'>('full_gym');

  // Paso 4: Datos para cálculos
  const [age, setAge] = useState<number>(28);
  const [runningDistance, setRunningDistance] = useState<'5k' | '10k' | 'none'>('5k');
  const [runningPaceTime, setRunningPaceTime] = useState<string>('26');

  // Paso 5: Salud PAR-Q+
  const [healthAnswers, setHealthAnswers] = useState<Record<string, boolean>>({});

  const toggleGoal = (id: string) => {
    setSelectedGoals((prev) => 
      prev.includes(id) 
        ? (prev.length > 1 ? prev.filter((g) => g !== id) : prev) 
        : [...prev, id]
    );
  };

  const handleHealthAnswer = (qId: string, value: boolean) => {
    setHealthAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const isHealthCleared = Object.keys(healthAnswers).length === HEALTH_SAFETY_QUESTIONS.length && 
    Object.values(healthAnswers).every((val) => val === false);

  const hasHealthRisk = Object.values(healthAnswers).some((val) => val === true);

  const handleFinish = (skipHealthCheck: boolean = false) => {
    const data: OnboardingData = {
      goals: selectedGoals,
      gymLevel,
      daysPerWeek,
      equipment,
      age,
      runningDistance: selectedGoals.includes('correr') ? runningDistance : undefined,
      runningPaceTime: selectedGoals.includes('correr') && runningDistance !== 'none' ? runningPaceTime : undefined,
      healthPassed: skipHealthCheck ? false : isHealthCleared
    };

    try {
      localStorage.setItem(`fitmax_onboarding_completed_${nickname}`, 'true');
      localStorage.setItem(`fitmax_user_goals_${nickname}`, JSON.stringify(selectedGoals));
      localStorage.setItem(`fit_gen_${nickname}_weekly_days_count`, String(daysPerWeek));
      localStorage.setItem(`fit_athlete_age_${nickname}`, String(age));
      localStorage.setItem(`fit_athlete_equipment_${nickname}`, equipment);
      if (data.healthPassed) {
        localStorage.setItem(`fitmax_health_checked_${nickname}`, 'true');
      }
    } catch (e) {}

    onComplete(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-[#20252C] rounded-3xl max-w-lg w-full border border-[#282F38] shadow-2xl text-[#F4F2ED] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Cabecera con barra de progreso de 5 pasos */}
        <div className="p-5 border-b border-[#282F38] flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#1FD08A] bg-[#1FD08A]/15 px-2.5 py-0.5 rounded-full">
              Paso {currentStep} de 5
            </span>
            <h2 className="text-base font-black text-white mt-1">Configura tu plan personalizado</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#15181D] rounded-xl text-[#A8B0BB] hover:text-white transition-colors cursor-pointer"
            title="Cerrar y retomar después"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de progreso visual */}
        <div className="w-full bg-[#15181D] h-1.5 shrink-0">
          <div 
            className="bg-[#1FD08A] h-full transition-all duration-300"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>

        {/* Contenido deslizable por paso */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* PASO 1: OBJETIVOS DEPORTIVOS */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h3 className="text-lg font-black text-white">¿Cuáles son tus objetivos?</h3>
                <p className="text-xs text-[#A8B0BB] mt-1">
                  Puedes elegir más de uno para crear tu semana híbrida inteligente.
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  { id: 'musculo', title: 'Ganar músculo y fuerza', desc: 'Hipertrofia, volumen muscular y progresión de cargas en gimnasio.', icon: Dumbbell, color: 'text-blue-400' },
                  { id: 'correr', title: 'Correr (Running)', desc: 'Preparar 5K, 10K, media o maratón con series y fondos progresivos.', icon: Footprints, color: 'text-rose-400' },
                  { id: 'hyrox', title: 'Hyrox', desc: 'Carrera combinada con trineos, zancadas, remos y wall balls.', icon: Mountain, color: 'text-amber-400' },
                  { id: 'ocr', title: 'Carreras de obstáculos (OCR)', desc: 'Fuerza de agarre, suspensión en barra y resistencia todoterreno.', icon: Flame, color: 'text-purple-400' },
                  { id: 'salud', title: 'Mejorar mi condición general', desc: 'Movilidad, capacidad aeróbica, energía y longevidad diaria.', icon: HeartPulse, color: 'text-[#1FD08A]' },
                ].map((item) => {
                  const Icon = item.icon;
                  const isChecked = selectedGoals.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleGoal(item.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                        isChecked
                          ? 'bg-[#15181D] border-[#1FD08A] ring-1 ring-[#1FD08A]/40'
                          : 'bg-[#15181D]/60 border-[#282F38] hover:border-[#3A434F]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-xl bg-[#20252C] flex items-center justify-center shrink-0 mt-0.5 ${item.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-black text-sm text-white">{item.title}</p>
                          <p className="text-[11px] text-[#A8B0BB] mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                        isChecked ? 'bg-[#1FD08A] border-[#1FD08A] text-[#15181D]' : 'border-[#282F38]'
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* PASO 2: EXPERIENCIA EN GIMNASIO (ALIMENTA EL NIVEL) */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h3 className="text-lg font-black text-white">Tu experiencia con pesas</h3>
                <p className="text-xs text-[#A8B0BB] mt-1">
                  El nivel adapta únicamente los ejercicios y la dificultad de gimnasio. Podrás cambiarlo cuando quieras.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    level: 'A' as Level,
                    name: 'Base',
                    phrase: 'Nunca he entrenado con pesas o llevo menos de 3 meses.',
                    detail: 'Aprendes la técnica paso a paso con máquinas guiadas y peso corporal sin riesgo de lesión.'
                  },
                  {
                    level: 'B' as Level,
                    name: 'Intermedio (Recomendado)',
                    phrase: 'Entreno hace menos de un año con regularidad.',
                    detail: 'Conoces los movimientos básicos y buscas ganar fuerza sostenida con mancuernas, poleas y barras.'
                  },
                  {
                    level: 'C' as Level,
                    name: 'Avanzado',
                    phrase: 'Llevo más de un año entrenando consistentemente.',
                    detail: 'Dominas la sobrecarga progresiva, sentadillas con barra libre y variantes complejas de alta demanda.'
                  }
                ].map((item) => {
                  const isSelected = gymLevel === item.level;
                  return (
                    <button
                      key={item.level}
                      type="button"
                      onClick={() => setGymLevel(item.level)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#15181D] border-[#5B8DEF] ring-1 ring-[#5B8DEF]/50'
                          : 'bg-[#15181D]/60 border-[#282F38] hover:border-[#3A434F]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-black text-white">{item.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-[#5B8DEF]" />}
                      </div>
                      <p className="text-xs text-[#F4F2ED] font-semibold mb-1">
                        "{item.phrase}"
                      </p>
                      <p className="text-[11px] text-[#A8B0BB] leading-relaxed">
                        {item.detail}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* PASO 3: DISPONIBILIDAD Y EQUIPAMIENTO */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h3 className="text-lg font-black text-white">Disponibilidad y espacio</h3>
                <p className="text-xs text-[#A8B0BB] mt-1">
                  Estructuraremos tu bloque semanal para respetar tus días de descanso.
                </p>
              </div>

              {/* Días por semana */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#A8B0BB]">¿Cuántos días por semana quieres entrenar?</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { days: 3 as const, label: '3 días', sub: 'Full Body' },
                    { days: 4 as const, label: '4 días', sub: 'Torso/Pierna (Recomendado)' },
                    { days: 5 as const, label: '5 días', sub: 'Alta frecuencia' }
                  ].map((d) => (
                    <button
                      key={d.days}
                      type="button"
                      onClick={() => setDaysPerWeek(d.days)}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        daysPerWeek === d.days
                          ? 'bg-[#1FD08A]/15 border-[#1FD08A] text-white font-black'
                          : 'bg-[#15181D] border-[#282F38] text-[#A8B0BB] hover:text-white'
                      }`}
                    >
                      <div className="text-sm font-black">{d.label}</div>
                      <div className="text-[10px] opacity-80 mt-0.5">{d.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Equipamiento */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#A8B0BB]">¿Dónde entrenarás principalmente?</label>
                <div className="space-y-2">
                  {[
                    { id: 'full_gym' as const, title: 'Gimnasio comercial completo', desc: 'Acceso a barras, mancuernas, poleas y máquinas guiadas.' },
                    { id: 'home_dumbbells' as const, title: 'Casa con mancuernas y banco', desc: 'Entrenamiento efectivo adaptado a peso libre en casa.' },
                    { id: 'bodyweight' as const, title: 'Solo peso corporal y calistenia', desc: 'Flexiones, dominadas, sentadillas y variantes con autocarga.' }
                  ].map((eq) => (
                    <button
                      key={eq.id}
                      type="button"
                      onClick={() => setEquipment(eq.id)}
                      className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        equipment === eq.id
                          ? 'bg-[#15181D] border-[#5B8DEF] text-white font-bold'
                          : 'bg-[#15181D] border-[#282F38] text-[#A8B0BB] hover:text-white'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-black text-white">{eq.title}</p>
                        <p className="text-[10px] text-[#A8B0BB] mt-0.5">{eq.desc}</p>
                      </div>
                      {equipment === eq.id && <Check className="w-4 h-4 text-[#5B8DEF] shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PASO 4: DATOS PARA CÁLCULOS */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h3 className="text-lg font-black text-white">Datos para tus cálculos</h3>
                <p className="text-xs text-[#A8B0BB] mt-1">
                  Nos permite calcular tus zonas de frecuencia cardíaca y ritmos de entrenamiento precisos.
                </p>
              </div>

              {/* Edad */}
              <div className="bg-[#15181D] p-4 rounded-2xl border border-[#282F38] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white">Tu edad actual</label>
                  <span className="text-xs font-mono font-bold text-[#1FD08A]">{age} años</span>
                </div>
                <input
                  type="range"
                  min="14"
                  max="75"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value, 10))}
                  className="w-full accent-[#1FD08A] cursor-pointer"
                />
                <p className="text-[10px] text-[#A8B0BB]">
                  Frecuencia Cardíaca Máxima estimada: <strong className="text-white font-mono">{Math.round(208 - 0.7 * age)} ppm</strong> (Fórmula de Tanaka).
                </p>
              </div>

              {/* Pregunta de Running si seleccionó correr */}
              {selectedGoals.includes('correr') && (
                <div className="bg-[#15181D] p-4 rounded-2xl border border-[#282F38] space-y-3">
                  <div className="flex items-center gap-2">
                    <Footprints className="w-4 h-4 text-rose-400" />
                    <label className="text-xs font-bold text-white">Tu ritmo de carrera aproximado</label>
                  </div>
                  <p className="text-[11px] text-[#A8B0BB]">
                    ¿Tienes una marca reciente o estimada?
                  </p>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: '5k' as const, label: '5K' },
                      { id: '10k' as const, label: '10K' },
                      { id: 'none' as const, label: 'No sé / Inicial' }
                    ].map((dist) => (
                      <button
                        key={dist.id}
                        type="button"
                        onClick={() => setRunningDistance(dist.id)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                          runningDistance === dist.id
                            ? 'bg-rose-500/20 border-rose-500 text-white'
                            : 'bg-[#20252C] border-[#282F38] text-[#A8B0BB] hover:text-white'
                        }`}
                      >
                        {dist.label}
                      </button>
                    ))}
                  </div>

                  {runningDistance !== 'none' && (
                    <div className="flex items-center gap-3 pt-1">
                      <span className="text-xs text-[#A8B0BB]">Tiempo en {runningDistance.toUpperCase()}:</span>
                      <input
                        type="number"
                        value={runningPaceTime}
                        onChange={(e) => setRunningPaceTime(e.target.value)}
                        className="w-20 bg-[#20252C] border border-[#282F38] rounded-xl px-2.5 py-1.5 text-center font-mono font-bold text-xs text-white focus:outline-none focus:border-rose-400"
                        placeholder="min"
                      />
                      <span className="text-xs text-[#A8B0BB]">minutos</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* PASO 5: CHEQUEO DE SALUD (PAR-Q+) */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-4 h-4 text-[#1FD08A]" />
                  <span className="text-xs font-bold text-[#1FD08A] uppercase tracking-wider">Seguridad deportiva</span>
                </div>
                <h3 className="text-lg font-black text-white">Chequeo de salud preventiva</h3>
                <p className="text-xs text-[#A8B0BB] mt-0.5 leading-relaxed">
                  Basado en el estándar internacional PAR-Q+. Asegura que puedas entrenar con total tranquilidad.
                </p>
              </div>

              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {HEALTH_SAFETY_QUESTIONS.map((q, idx) => {
                  const answered = healthAnswers[q.id];
                  return (
                    <div key={q.id} className="p-3 bg-[#15181D] rounded-2xl border border-[#282F38] space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-xs font-semibold text-[#F4F2ED] leading-snug">
                          {idx + 1}. {q.question}
                        </span>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleHealthAnswer(q.id, false)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            answered === false
                              ? 'bg-[#1FD08A] border-[#1FD08A] text-[#15181D]'
                              : 'bg-[#20252C] border-[#282F38] text-[#A8B0BB] hover:text-white'
                          }`}
                        >
                          No
                        </button>
                        <button
                          type="button"
                          onClick={() => handleHealthAnswer(q.id, true)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            answered === true
                              ? 'bg-rose-600 border-rose-500 text-white'
                              : 'bg-[#20252C] border-[#282F38] text-[#A8B0BB] hover:text-white'
                          }`}
                        >
                          Sí
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {hasHealthRisk && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>
                    Respondiste "Sí" a una o más preguntas. Te recomendamos consultar con un médico deportólogo antes de realizar sesiones de alta intensidad.
                  </p>
                </div>
              )}

              {isHealthCleared && (
                <div className="p-3 bg-[#1FD08A]/10 border border-[#1FD08A]/30 rounded-xl text-xs text-[#1FD08A] flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <p className="font-bold">¡Excelente! Tu perfil de salud está verificado para iniciar sin restricciones.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer con botones de navegación */}
        <div className="p-5 border-t border-[#282F38] flex items-center justify-between shrink-0 bg-[#1A1F26]">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((s) => s - 1)}
              className="px-4 py-2.5 bg-[#15181D] hover:bg-[#282F38] text-[#A8B0BB] hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Atrás</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-[#A8B0BB] hover:text-white font-semibold transition-colors cursor-pointer"
            >
              Completar más tarde
            </button>
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((s) => s + 1)}
              className="px-6 py-2.5 bg-[#1FD08A] hover:bg-[#1ab87a] text-[#15181D] font-black rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <span>Continuar</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleFinish(true)}
                className="px-3.5 py-2.5 bg-[#15181D] hover:bg-[#282F38] text-[#A8B0BB] hover:text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
                title="Guardar plan y completar preguntas de salud después"
              >
                Completar luego
              </button>
              <button
                type="button"
                onClick={() => handleFinish(false)}
                className="px-6 py-2.5 bg-[#1FD08A] hover:bg-[#1ab87a] text-[#15181D] font-black rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Crear mi plan</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
