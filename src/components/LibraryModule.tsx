import React, { useState } from 'react';
import { BookOpen, HelpCircle, FileText, Sparkles, Search, Dumbbell } from 'lucide-react';
import { Level } from '../types';
import ExerciseBankModule from './ExerciseBankModule';

interface LibraryModuleProps {
  nickname: string;
  selectedLevel: Level;
  onNotification?: (msg: string) => void;
}

export default function LibraryModule({ nickname, selectedLevel, onNotification }: LibraryModuleProps) {
  const [activeTab, setActiveTab] = useState<'bank' | 'glossary' | 'science'>('bank');
  const [glossarySearch, setGlossarySearch] = useState('');

  const glossaryTerms = [
    { term: 'RIR (Repeticiones en Reserva)', definition: 'Cuántas repeticiones te quedan antes de llegar al fallo muscular total. Un RIR 2 significa parar 2 reps antes.' },
    { term: 'Sobrecarga Progresiva', definition: 'Aumentar poco a poco el estímulo (peso, repeticiones o calidad técnica) cada semana para obligar al músculo a crecer.' },
    { term: 'RDL (Peso Muerto Rumano)', definition: 'Variante de peso muerto enfocada en isquiotibiales y glúteos, bajando con las rodillas semi-rígidas y cadera hacia atrás.' },
    { term: 'AMRAP', definition: 'Acrónimo en inglés: "Tantas rondas o repeticiones como puedas" dentro de un tiempo límite estipulado.' },
    { term: 'EMOM', definition: 'Acrónimo en inglés: "Cada minuto en el minuto". Realizas la tarea al iniciar el minuto y descansas lo que sobre.' },
    { term: 'Tempo (Ritmo Controlado)', definition: 'La velocidad de cada fase del ejercicio (ej. bajar en 3 segundos, pausar 1 segundo abajo y subir con fuerza).' },
    { term: 'Fartlek', definition: 'Término sueco que significa "juego de ritmos". Alternar tramos rápidos y lentos de forma libre durante la carrera.' },
    { term: 'Entrenamiento Polarizado 80/20', definition: 'El 80% de tus kilómetros se corren suave (Zona 2 conversacional) y solo el 20% a alta intensidad (series/tempo).' },
    { term: 'Bloque de Entrenamiento (Mesociclo)', definition: 'Un ciclo de 4 a 12 semanas con un objetivo claro (hipertrofia, fuerza o descarga) antes de rotar estímulo.' },
    { term: 'Compromised Running', definition: 'Correr inmediatamente después de ejercicios pesados o metabólicos (trineo, burpees), simula la fatiga de Hyrox.' },
  ];

  const filteredGlossary = glossaryTerms.filter(t => 
    t.term.toLowerCase().includes(glossarySearch.toLowerCase()) || 
    t.definition.toLowerCase().includes(glossarySearch.toLowerCase())
  );

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-16">
      {/* Selector de sub-pestañas en Biblioteca */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setActiveTab('bank')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'bank'
              ? 'bg-[#1FD08A] text-zinc-950 font-black shadow-sm'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          <span>Banco de ejercicios & Creador</span>
        </button>

        <button
          onClick={() => setActiveTab('glossary')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'glossary'
              ? 'bg-[#1FD08A] text-zinc-950 font-black shadow-sm'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Glosario simple</span>
        </button>

        <button
          onClick={() => setActiveTab('science')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'science'
              ? 'bg-[#1FD08A] text-zinc-950 font-black shadow-sm'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Ciencia explicada</span>
        </button>
      </div>

      {/* Contenido según pestaña */}
      {activeTab === 'bank' && (
        <ExerciseBankModule
          nickname={nickname}
          selectedLevel={selectedLevel}
          onNotification={onNotification}
        />
      )}

      {activeTab === 'glossary' && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Buscar un término (ej. RIR, Tempo, Polarizado)..."
              value={glossarySearch}
              onChange={(e) => setGlossarySearch(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 gap-3">
            {filteredGlossary.map((item, idx) => (
              <div key={idx} className="bg-zinc-900/80 border border-zinc-800/90 rounded-2xl p-4 space-y-1">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  {item.term}
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed pl-4">
                  {item.definition}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'science' && (
        <div className="max-w-2xl mx-auto space-y-4 text-xs text-zinc-300">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              ¿Por qué el volumen semanal es clave en hipertrofia?
            </h3>
            <p className="text-zinc-400 leading-relaxed">
              La literatura científica (Schoenfeld et al.) demuestra que entre 10 y 20 series efectivas por grupo muscular a la semana producen la mayor tasa de crecimiento. Menos de 10 mantiene o progresa lento; más de 20 suele generar fatiga residual sin beneficio extra.
            </p>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              ¿Por qué correr suave el 80% del tiempo? (Polarizado)
            </h3>
            <p className="text-zinc-400 leading-relaxed">
              Entrenar en Zona 2 construye la base mitocondrial y capilar en tus músculos con mínimo desgaste articular. Si corres siempre al máximo, acumulas fatiga que perjudica tanto tus entrenamientos de pesas como tu progreso en carrera.
            </p>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              RIR: ¿Por qué no ir siempre al fallo muscular?
            </h3>
            <p className="text-zinc-400 leading-relaxed">
              Dejar 1 a 3 repeticiones en reserva (RIR 1-3) estimula el 95-99% de las fibras musculares de una serie, pero genera la mitad de fatiga central que llegar al fallo absoluto. Esto te permite mantener buen rendimiento durante todas las series y sesiones de la semana.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
