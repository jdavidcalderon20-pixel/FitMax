import React, { useState } from 'react';
import { 
  User, 
  Cloud, 
  Heart, 
  Trophy, 
  Smartphone, 
  LogOut, 
  ShieldAlert, 
  Users, 
  Check, 
  Info, 
  Plus, 
  Trash2, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Level, LEVELS } from '../types';
import ChallengesModule from './ChallengesModule';

interface ProfileModuleProps {
  nickname: string;
  selectedLevel: Level;
  onSelectLevel: (lvl: Level) => void;
  user: any;
  isAdmin: boolean;
  isStandalone: boolean;
  profiles: string[];
  onSwitchProfile: (newNick: string) => void;
  onDeleteProfile: (nick: string, e: React.MouseEvent) => void;
  onOpenHealth: () => void;
  onOpenCloudSync: () => void;
  onInstallApp: () => void;
  onSignOut: () => void;
  onOpenAdmin: () => void;
  onNotification: (msg: string) => void;
}

export default function ProfileModule({
  nickname,
  selectedLevel,
  onSelectLevel,
  user,
  isAdmin,
  isStandalone,
  profiles,
  onSwitchProfile,
  onDeleteProfile,
  onOpenHealth,
  onOpenCloudSync,
  onInstallApp,
  onSignOut,
  onOpenAdmin,
  onNotification
}: ProfileModuleProps) {
  const [activeTab, setActiveTab] = useState<'settings' | 'achievements'>('settings');
  const [newNickInput, setNewNickInput] = useState('');
  const [showNewProfileInput, setShowNewProfileInput] = useState(false);

  const getInitials = (nameStr: string) => {
    const clean = nameStr.trim();
    if (!clean) return 'AT';
    const parts = clean.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  };

  const handleCreateProfile = () => {
    const clean = newNickInput.trim();
    if (!clean) return;
    onSwitchProfile(clean);
    setNewNickInput('');
    setShowNewProfileInput(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 pb-20 animate-fadeIn">
      {/* Selector de sub-pestañas: Ajustes vs Logros */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'settings'
              ? 'bg-[#1FD08A] text-zinc-950 font-black shadow-sm'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Mi Perfil & Ajustes</span>
        </button>

        <button
          onClick={() => setActiveTab('achievements')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'achievements'
              ? 'bg-[#1FD08A] text-zinc-950 font-black shadow-sm'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Logros y Medallas</span>
        </button>
      </div>

      {activeTab === 'achievements' ? (
        <ChallengesModule nickname={nickname} onNotification={onNotification} />
      ) : (
        <div className="space-y-6">
          {/* Tarjeta de Atleta / Perfil */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 text-zinc-950 font-black text-xl flex items-center justify-center shadow-lg shrink-0">
              {getInitials(nickname)}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-black text-white">{nickname}</h2>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                {user ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Cloud className="w-3.5 h-3.5" />
                    Sincronizado en la nube ({user.email})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700">
                    <Cloud className="w-3.5 h-3.5 text-zinc-500" />
                    Guardado en este dispositivo (Modo local)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Consola de Administración (Exclusivo Superadmin) */}
          {isAdmin && (
            <div className="bg-gradient-to-r from-purple-950/60 to-zinc-900 border border-purple-500/40 rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Panel de administración</h3>
                  <p className="text-xs text-purple-300">Gestión de atletas, suscripciones y métricas de plataforma.</p>
                </div>
              </div>
              <button
                onClick={onOpenAdmin}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
              >
                Abrir consola
              </button>
            </div>
          )}

          {/* Tu nivel de gimnasio */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Tu nivel de gimnasio</h3>
                <p className="text-xs text-zinc-400">Ajusta la dificultad y variantes de ejercicios con pesas.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {LEVELS.map((lvl) => {
                const isSelected = lvl.id === selectedLevel;
                return (
                  <button
                    key={lvl.id}
                    onClick={() => onSelectLevel(lvl.id as Level)}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                      isSelected
                        ? 'bg-blue-500/15 border-blue-500 ring-1 ring-blue-500'
                        : 'bg-zinc-950/50 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-white">
                        {lvl.simpleName || lvl.name}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-blue-400" />}
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-tight">
                      {lvl.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Espacios de entrenamiento (Perfiles locales) */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Espacios de entrenamiento</h3>
                <p className="text-xs text-zinc-400">Permite que varias personas entrenen en este mismo teléfono.</p>
              </div>
              <button
                onClick={() => setShowNewProfileInput(!showNewProfileInput)}
                className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold px-3 py-1.5 rounded-xl border border-zinc-700 flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuevo</span>
              </button>
            </div>

            {showNewProfileInput && (
              <div className="flex gap-2 p-3 bg-zinc-950 rounded-xl border border-zinc-800 animate-fadeIn">
                <input
                  type="text"
                  placeholder="Nombre o apodo..."
                  value={newNickInput}
                  onChange={(e) => setNewNickInput(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleCreateProfile}
                  className="bg-emerald-500 text-zinc-950 font-bold px-4 py-2 rounded-lg text-xs"
                >
                  Crear
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {profiles.map((p) => {
                const isCurrent = p === nickname;
                return (
                  <div
                    key={p}
                    onClick={() => onSwitchProfile(p)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isCurrent
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-white font-bold'
                        : 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-zinc-800 text-[10px] font-black flex items-center justify-center text-zinc-300">
                        {getInitials(p)}
                      </div>
                      <span>{p}</span>
                      {isCurrent && <span className="text-[10px] text-emerald-400 font-normal">(activo)</span>}
                    </div>

                    {p !== 'Invitado' && (
                      <button
                        onClick={(e) => onDeleteProfile(p, e)}
                        className="text-zinc-600 hover:text-rose-400 p-1"
                        title="Eliminar este perfil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Accesos de Utilidad: Salud, Nube e Instalación */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl divide-y divide-zinc-800/80 overflow-hidden">
            {/* Salud y seguridad */}
            <button
              onClick={onOpenHealth}
              className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-rose-400" />
                <div>
                  <p className="text-xs font-bold text-white">Chequeo de salud y seguridad</p>
                  <p className="text-[11px] text-zinc-400">Cuestionario preventivo antes de entrenar fuerte.</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </button>

            {/* Guardar en la nube */}
            <button
              onClick={onOpenCloudSync}
              className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Cloud className="w-5 h-5 text-cyan-400" />
                <div>
                  <p className="text-xs font-bold text-white">Guardar en la nube / Sincronización</p>
                  <p className="text-[11px] text-zinc-400">Conecta tu cuenta para respaldar rutinas y marcas.</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </button>

            {/* Instalar App (PWA) */}
            {!isStandalone && (
              <button
                onClick={onInstallApp}
                className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-xs font-bold text-white">Instalar app en tu celular</p>
                    <p className="text-[11px] text-zinc-400">Añade FitMax a tu pantalla de inicio como app nativa.</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            )}

            {/* Cerrar sesión */}
            <button
              onClick={onSignOut}
              className="w-full flex items-center justify-between p-4 hover:bg-rose-950/20 transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-rose-400" />
                <div>
                  <p className="text-xs font-bold text-rose-300">Cerrar sesión</p>
                  <p className="text-[11px] text-zinc-500">Salir de esta cuenta o volver a la bienvenida.</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-rose-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
