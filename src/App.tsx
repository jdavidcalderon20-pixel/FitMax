import React, { useState, useEffect } from 'react';
import { Level, LEVELS } from './types';
import WeeklyModule from './components/WeeklyModule';
import QuickModule from './components/QuickModule';
import HiitModule from './components/HiitModule';
import RunningModule from './components/RunningModule';
import HyroxOcrModule from './components/HyroxOcrModule';
import ExerciseBankModule from './components/ExerciseBankModule';
import ChallengesModule from './components/ChallengesModule';
import SquadsModule from './components/SquadsModule';
import SoftWallModal, { SoftWallTrigger } from './components/SoftWallModal';
import SubscriptionModal from './components/SubscriptionModal';
import AdminModule from './components/AdminModule';
import WelcomeScreen from './components/WelcomeScreen';
import HealthSafetyModal from './components/HealthSafetyModal';
import { useAuth } from './lib/auth';
import { getUserSubscription, SubscriptionInfo, SubscriptionTier } from './lib/subscription';
import { 
  Dumbbell, 
  Activity, 
  Heart, 
  Sparkles,
  Calendar,
  Flame,
  Footprints,
  Mountain,
  Award,
  Info,
  Trophy,
  HeartPulse,
  Clock,
  ArrowUpDown,
  User,
  Users,
  Trash2,
  Sliders,
  ChevronDown,
  X,
  Zap,
  BookOpen,
  Cloud,
  Smartphone,
  Crown,
  ShieldAlert,
  LogOut
} from 'lucide-react';

export type AppModule = 'weekly' | 'quick' | 'hiit' | 'running' | 'hyroxocr' | 'bank' | 'challenges' | 'squads' | 'admin';

export default function App() {
  const [selectedLevel, setSelectedLevel] = useState<Level>(() => {
    try {
      const savedNick = localStorage.getItem('fit_gen_nickname') || 'Invitado';
      const savedLevel = localStorage.getItem(`fit_gen_${savedNick}_selected_level`);
      return (savedLevel as Level) || 'A';
    } catch (e) {
      return 'A';
    }
  });

  const [activeModule, setActiveModule] = useState<AppModule>('weekly');
  const [planSaveNotification, setPlanSaveNotification] = useState<string | null>(null);
  const [showConfigMobile, setShowConfigMobile] = useState<boolean>(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState<boolean>(false);
  const [userSubscription, setUserSubscription] = useState<SubscriptionInfo | null>(null);

  // Control de Acceso Inicial (Modo Invitado / Pantalla de Bienvenida)
  const [hasEntered, setHasEntered] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('fitmax_has_entered_v1');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  // Espacios de usuario / Perfiles locales
  const [nickname, setNickname] = useState<string>(() => {
    try {
      return localStorage.getItem('fit_gen_nickname') || 'Invitado';
    } catch (e) {
      return 'Invitado';
    }
  });

  const [profiles, setProfiles] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('fit_gen_profiles');
      return saved ? JSON.parse(saved) : ['Invitado'];
    } catch (e) {
      return ['Invitado'];
    }
  });

  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [tempNickname, setTempNickname] = useState<string>('');
  const [showScienceModal, setShowScienceModal] = useState<boolean>(false);
  const [showHealthModal, setShowHealthModal] = useState<boolean>(false);
  const { user, signOut } = useAuth();
  const [softWallTrigger, setSoftWallTrigger] = useState<SoftWallTrigger | null>(null);

  // Soporte PWA: Instalación en Pantalla de Inicio Móvil
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(display-mode: standalone)').matches;
  });

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice?.outcome === 'accepted') {
        setInstallPrompt(null);
        showNotification('¡FitMax instalado con éxito en tu pantalla de inicio! 📲');
      }
    } else {
      alert('Para instalar FitMax en tu celular:\n\n• En iPhone (Safari): Toca el botón "Compartir" (ícono del cuadrado con flecha arriba) y selecciona "Agregar a la pantalla de inicio".\n\n• En Android (Chrome): Toca los 3 puntos superiores y pulsa "Instalar aplicación" o "Agregar a la pantalla principal".');
    }
  };

  // Helper para iniciales de avatar
  const getInitials = (nameStr: string) => {
    const clean = nameStr.trim();
    if (clean.length === 0) return 'IN';
    const parts = clean.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  };

  const showNotification = (msg: string) => {
    setPlanSaveNotification(msg);
    setTimeout(() => setPlanSaveNotification(null), 4000);
  };

  const refreshSubscription = async () => {
    const sub = await getUserSubscription(user?.id);
    setUserSubscription(sub);
  };

  useEffect(() => {
    refreshSubscription();
  }, [user?.id, nickname]);

  // Cambiar o crear perfil
  const handleSwitchProfile = (newNick: string) => {
    const clean = newNick.trim();
    if (!clean) return;
    setNickname(clean);
    try {
      localStorage.setItem('fit_gen_nickname', clean);
      if (!profiles.includes(clean)) {
        const updated = [...profiles, clean];
        setProfiles(updated);
        localStorage.setItem('fit_gen_profiles', JSON.stringify(updated));
      }
    } catch (e) {
      console.error(e);
    }
    setShowProfileModal(false);
    setTempNickname('');
    showNotification(`¡Espacio cambiado a: ${clean}!`);
  };

  // Eliminar perfil y limpiar todas sus claves locales
  const handleDeleteProfile = (profileToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (profileToDelete === 'Invitado') {
      alert('No puedes eliminar el perfil Invitado.');
      return;
    }
    if (window.confirm(`¿Seguro que deseas eliminar el espacio "${profileToDelete}"? Se borrarán sus rutinas y progreso.`)) {
      const updated = profiles.filter((p) => p !== profileToDelete);
      setProfiles(updated);
      try {
        localStorage.setItem('fit_gen_profiles', JSON.stringify(updated));
        localStorage.removeItem(`fit_gen_${profileToDelete}_logs_v2`);
        localStorage.removeItem(`fit_gen_${profileToDelete}_history_v1`);
        localStorage.removeItem(`fit_gen_${profileToDelete}_weekly_routine_v1`);
        localStorage.removeItem(`fit_gen_${profileToDelete}_weekly_logs_v1`);
        localStorage.removeItem(`fit_gen_${profileToDelete}_weekly_history_v1`);
        localStorage.removeItem(`fit_gen_${profileToDelete}_weekly_start_date`);
        localStorage.removeItem(`fit_gen_${profileToDelete}_weekly_mesocycle_target_weeks`);
        localStorage.removeItem(`fit_gen_${profileToDelete}_quick_routine_v1`);
        localStorage.removeItem(`fit_gen_${profileToDelete}_selected_level`);
        localStorage.removeItem(`fit_gen_${profileToDelete}_running_logs_v1`);
        localStorage.removeItem(`fit_gen_${profileToDelete}_hyroxocr_completed_v1`);
      } catch (err) {
        console.error(err);
      }
      if (nickname === profileToDelete) {
        setNickname('Invitado');
        try {
          localStorage.setItem('fit_gen_nickname', 'Invitado');
        } catch (err) {}
      }
    }
  };

  // Sincronizar nivel al cambiar perfil
  useEffect(() => {
    if (!nickname) return;
    try {
      const savedLevel = localStorage.getItem(`fit_gen_${nickname}_selected_level`);
      if (savedLevel) {
        setSelectedLevel(savedLevel as Level);
      } else {
        setSelectedLevel('A');
      }
    } catch (e) {
      setSelectedLevel('A');
    }
  }, [nickname]);

  // Persistir nivel al cambiar
  const handleSelectLevel = (level: Level) => {
    setSelectedLevel(level);
    try {
      localStorage.setItem(`fit_gen_${nickname}_selected_level`, level);
    } catch (e) {
      console.error(e);
    }
    showNotification(`Nivel actualizado a: ${LEVELS.find((l) => l.id === level)?.name}`);
  };

  const isOwnerEmail = Boolean(user?.email && user.email.toLowerCase() === 'jdavidcalderon20@gmail.com');
  const isAdmin = isOwnerEmail || userSubscription?.role === 'admin' || (typeof localStorage !== 'undefined' && localStorage.getItem('fitmax_user_role') === 'admin');

  // Asegurar permisos inmediatos de Propietario si la sesión activa es el correo del dueño
  useEffect(() => {
    if (isOwnerEmail) {
      try {
        localStorage.setItem('fitmax_user_role', 'admin');
        localStorage.setItem('fitmax_subscription_tier', 'beta_lifetime');
      } catch {}
    }
  }, [isOwnerEmail]);

  // Redirigir fuera de la consola Admin si el usuario no tiene permisos
  useEffect(() => {
    if (!isAdmin && activeModule === 'admin') {
      setActiveModule('weekly');
    }
  }, [isAdmin, activeModule]);

  // Si no ha ingresado y no hay sesión activa, mostrar la Pantalla de Bienvenida / Acceso Inicial
  if (!hasEntered && !user) {
    return (
      <WelcomeScreen
        initialNickname={nickname}
        onEnterAsGuest={(enteredNick) => {
          handleSwitchProfile(enteredNick);
          setHasEntered(true);
          try {
            localStorage.setItem('fitmax_has_entered_v1', 'true');
          } catch {}
        }}
        onEnterAsAdmin={() => {
          setHasEntered(true);
          try {
            localStorage.setItem('fitmax_has_entered_v1', 'true');
            localStorage.setItem('fitmax_user_role', 'admin');
          } catch {}
          refreshSubscription();
          setActiveModule('admin');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col p-3 md:p-6 lg:p-8 font-sans selection:bg-emerald-500 selection:text-zinc-950">
      <div className="max-w-7xl w-full mx-auto flex flex-col flex-1">
        
        {/* HEADER PRINCIPAL FITMAX */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-zinc-800/80 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-[0_0_25px_rgba(16,185,129,0.35)] border border-emerald-500/40 p-1 bg-zinc-900 shrink-0 flex items-center justify-center hover:scale-105 transition-transform">
                <img src="/icon.svg" alt="FitMax Logo" className="w-full h-full object-contain rounded-xl" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-300 bg-clip-text text-transparent">FitMax</span>
                  <button
                    onClick={() => setShowSubscriptionModal(true)}
                    className="text-[10px] bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 flex items-center gap-1 shadow-sm"
                    title="Ver membresía FitMax PRO y pases VIP"
                  >
                    <Crown className="w-3 h-3 text-amber-400" />
                    <span>{userSubscription?.isPro ? 'PRO' : 'FREE'}</span>
                  </button>
                </h1>
                <p className="text-zinc-400 text-xs mt-0.5">
                  Entrenamiento inteligente
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end flex-wrap">
            {/* Botón PWA para Instalar en Celular */}
            {!isStandalone && (
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 hover:from-cyan-500/30 hover:to-emerald-500/30 border border-cyan-500/40 text-cyan-300 font-bold px-3 py-2 rounded-xl text-xs transition-all shadow-sm active:scale-95"
                title="Instalar FitMax como aplicación en tu celular"
              >
                <Smartphone className="w-4 h-4 text-cyan-400 shrink-0 animate-pulse" />
                <span className="hidden sm:inline">Instalar App</span>
                <span className="sm:hidden text-[10px]">Instalar</span>
              </button>
            )}

            {/* Botón Membresía PRO / VIP */}
            <button
              onClick={() => setShowSubscriptionModal(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/40 text-amber-300 font-bold px-3 py-2 rounded-xl text-xs transition-all shadow-sm active:scale-95"
              title="Membresía FitMax PRO, cupones y pases VIP"
            >
              <Crown className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="hidden sm:inline">
                {userSubscription?.tier === 'beta_lifetime' ? 'Pase VIP' : userSubscription?.tier === 'pro' ? 'FitMax PRO' : 'Membresía'}
              </span>
              <span className="sm:hidden text-[10px]">
                {userSubscription?.isPro ? 'PRO' : 'VIP'}
              </span>
            </button>

            {/* Botón Consola Admin (Solo visible para el Administrador) */}
            {isAdmin && (
              <button
                onClick={() => {
                  setActiveModule('admin');
                  setShowConfigMobile(false);
                }}
                className={`flex items-center gap-1.5 border font-bold px-2.5 py-2 rounded-xl text-xs transition-all ${
                  activeModule === 'admin'
                    ? 'bg-purple-950/80 border-purple-500 text-purple-300 shadow-md'
                    : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
                title="Consola de Administración y Suscripciones (Propietario)"
              >
                <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}

            {/* Estado Nube / Soft Wall («Modo Puerta Abierta») */}
            {user ? (
              <button
                onClick={() => {
                  if (window.confirm(`Sesión activa como: ${user.email}\n\n¿Deseas cerrar sesión y volver a modo local?`)) {
                    signOut();
                    showNotification('Sesión cerrada. Trabajando en modo local.');
                  }
                }}
                className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-bold px-3 py-2 rounded-xl text-xs transition-all hover:bg-emerald-900"
                title={`Sincronizado con la nube: ${user.email}. Clic para cerrar sesión.`}
              >
                <Cloud className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="hidden sm:inline font-mono text-[11px] max-w-[130px] truncate">{user.email}</span>
                <span className="sm:hidden text-[10px]">Cloud</span>
              </button>
            ) : (
              <button
                onClick={() => setSoftWallTrigger('cloud_sync')}
                className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold px-3 py-2 rounded-xl text-xs transition-all group"
                title="Sincronizar tus datos con tu combo en la nube"
              >
                <Cloud className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform shrink-0" />
                <span className="hidden sm:inline">Sincronizar Nube</span>
                <span className="sm:hidden text-[10px]">Nube</span>
              </button>
            )}

            {/* Chequeo Rápido de Salud & Seguridad */}
            <button
              onClick={() => setShowHealthModal(true)}
              className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold px-3 py-2 rounded-xl text-xs transition-all"
              title="Chequeo rápido de seguridad y salud antes de entrenar"
            >
              <Heart className="w-4 h-4 text-rose-400" />
              <span className="hidden sm:inline">Salud & Seguridad</span>
              <span className="sm:hidden">Salud</span>
            </button>

            <button
              onClick={() => setShowScienceModal(true)}
              className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold px-3 py-2 rounded-xl text-xs transition-all"
            >
              <Info className="w-4 h-4 text-purple-400" />
              <span className="hidden sm:inline">Ciencia del Entrenamiento</span>
              <span className="sm:hidden">Ciencia</span>
            </button>

            {/* Selector de Perfil */}
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-all"
              title="Cambiar de espacio de entrenamiento"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-zinc-950 text-[10px] font-black flex items-center justify-center">
                {getInitials(nickname)}
              </div>
              <span className="max-w-[120px] truncate">{nickname}</span>
              <Users className="w-3.5 h-3.5 text-zinc-400 ml-0.5" />
            </button>

            {/* Botón Cerrar Sesión / Salir a Bienvenida */}
            <button
              onClick={() => {
                if (window.confirm('¿Deseas cerrar tu sesión actual y volver a la pantalla de bienvenida?')) {
                  signOut();
                  try {
                    localStorage.removeItem('fitmax_user_role');
                    localStorage.removeItem('fitmax_has_entered_v1');
                  } catch {}
                  setHasEntered(false);
                  showNotification('Sesión cerrada. Regresando a la pantalla de bienvenida.');
                }
              }}
              className="flex items-center gap-1.5 bg-zinc-900 hover:bg-rose-950/50 hover:text-rose-300 hover:border-rose-700/60 border border-zinc-800 text-zinc-400 font-bold px-3 py-2 rounded-xl text-xs transition-all shrink-0 active:scale-95"
              title="Cerrar sesión y cambiar de cuenta o volver a la bienvenida"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
              <span className="sm:hidden">Salir</span>
            </button>
          </div>
        </header>

        {/* NAVEGACIÓN ENTRE MÓDULOS */}
        <div className={`grid grid-cols-4 sm:grid-cols-4 ${isAdmin ? 'lg:grid-cols-9' : 'lg:grid-cols-8'} gap-1.5 sm:gap-2 mb-6 bg-zinc-900/80 p-1.5 rounded-2xl border border-zinc-800`}>
          <button
            onClick={() => { setActiveModule('weekly'); setShowConfigMobile(false); }}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 px-1 py-2 sm:px-2.5 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-black tracking-tight transition-all text-center ${
              activeModule === 'weekly'
                ? 'bg-emerald-500 text-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden sm:inline">Plan Semanal</span>
            <span className="sm:hidden">Semanal</span>
          </button>

          <button
            onClick={() => { setActiveModule('quick'); setShowConfigMobile(false); }}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 px-1 py-2 sm:px-2.5 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-black tracking-tight transition-all text-center ${
              activeModule === 'quick'
                ? 'bg-emerald-500 text-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden sm:inline">Rápido A/B</span>
            <span className="sm:hidden">Rápido</span>
          </button>

          <button
            onClick={() => { setActiveModule('hiit'); setShowConfigMobile(false); }}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 px-1 py-2 sm:px-2.5 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-black tracking-tight transition-all text-center ${
              activeModule === 'hiit'
                ? 'bg-emerald-500 text-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden sm:inline">Cardio HIIT</span>
            <span className="sm:hidden">HIIT</span>
          </button>

          <button
            onClick={() => { setActiveModule('running'); setShowConfigMobile(false); }}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 px-1 py-2 sm:px-2.5 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-black tracking-tight transition-all text-center ${
              activeModule === 'running'
                ? 'bg-emerald-500 text-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <Footprints className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>Running</span>
          </button>

          <button
            onClick={() => { setActiveModule('hyroxocr'); setShowConfigMobile(false); }}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 px-1 py-2 sm:px-2.5 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-black tracking-tight transition-all text-center ${
              activeModule === 'hyroxocr'
                ? 'bg-emerald-500 text-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <Mountain className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden sm:inline">Hyrox / OCR</span>
            <span className="sm:hidden">Hyrox/OCR</span>
          </button>

          <button
            onClick={() => { setActiveModule('bank'); setShowConfigMobile(false); }}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 px-1 py-2 sm:px-2.5 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-black tracking-tight transition-all text-center ${
              activeModule === 'bank'
                ? 'bg-emerald-500 text-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden sm:inline">Banco &amp; Creador</span>
            <span className="sm:hidden">Banco</span>
          </button>

          <button
            onClick={() => { setActiveModule('challenges'); setShowConfigMobile(false); }}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 px-1 py-2 sm:px-2.5 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-black tracking-tight transition-all text-center ${
              activeModule === 'challenges'
                ? 'bg-amber-500 text-zinc-950 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden sm:inline">Retos &amp; Medallas</span>
            <span className="sm:hidden">Retos</span>
          </button>

          <button
            onClick={() => { setActiveModule('squads'); setShowConfigMobile(false); }}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 px-1 py-2 sm:px-2.5 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-black tracking-tight transition-all text-center ${
              activeModule === 'squads'
                ? 'bg-cyan-500 text-zinc-950 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden sm:inline">Mi Combo</span>
            <span className="sm:hidden">Combo</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => { setActiveModule('admin'); setShowConfigMobile(false); }}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 px-1 py-2 sm:px-2.5 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-black tracking-tight transition-all text-center ${
                activeModule === 'admin'
                  ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                  : 'text-purple-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden sm:inline">Admin</span>
              <span className="sm:hidden">Admin</span>
            </button>
          )}
        </div>

        {/* NOTIFICACIÓN FLOTANTE / BANNER */}
        {planSaveNotification && (
          <div className="mb-6 bg-emerald-500 text-zinc-950 rounded-2xl p-4 shadow-xl font-bold flex items-center gap-3 border border-emerald-400 animate-fadeIn">
            <Sparkles className="w-5 h-5 shrink-0" />
            <p className="text-sm">{planSaveNotification}</p>
          </div>
        )}

        {/* MAIN BODY CON SIDEBAR Y CONSOLA */}
        <main className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
          
          {/* PANEL IZQUIERDO: PERFIL DE CONDICIÓN & AYUDA */}
          <section className="md:col-span-4 lg:col-span-3 bg-zinc-900 border border-zinc-800 rounded-3xl p-5 md:p-6 flex flex-col shadow-xl h-fit gap-4 md:gap-6">
            
            {/* Header móvil con colapso */}
            <div className="flex md:hidden justify-between items-center w-full">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-black">Nivel Actual</p>
                  <p className="text-xs font-extrabold text-white">
                    {LEVELS.find((l) => l.id === selectedLevel)?.name}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowConfigMobile(!showConfigMobile)}
                className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-extrabold px-3 py-2 rounded-xl border border-zinc-700 flex items-center gap-1.5 transition-all"
              >
                <span>{showConfigMobile ? 'Ocultar Opciones' : 'Ver Ajustes'}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-emerald-400 transition-transform ${showConfigMobile ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Contenedor colapsable en móvil */}
            <div className={`${showConfigMobile ? 'flex animate-fadeIn' : 'hidden'} md:flex flex-col gap-6 w-full`}>
              <div>
                <h3 className="hidden md:flex text-zinc-400 text-xs uppercase tracking-wider mb-3 items-center gap-2 font-bold">
                  <Activity className="w-4 h-4 text-emerald-400" /> Perfil de Condición
                </h3>
                
                <div className="space-y-2.5">
                  {LEVELS.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => handleSelectLevel(level.id as Level)}
                      className={`text-left p-3.5 rounded-2xl border transition-all duration-200 w-full ${
                        selectedLevel === level.id
                          ? 'bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500'
                          : 'bg-zinc-950/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                      }`}
                    >
                      <div className={`font-bold text-sm mb-0.5 ${selectedLevel === level.id ? 'text-emerald-400' : 'text-zinc-300'}`}>
                        {level.name}
                      </div>
                      <div className="text-[11px] text-zinc-500 leading-tight">
                        {level.description}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Tarjeta explicativa de qué cambia al seleccionar nivel */}
                <div className="mt-3 p-3 bg-zinc-950/80 border border-zinc-800 rounded-2xl">
                  <p className="text-[10px] font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5 mb-1.5">
                    <Info className="w-3.5 h-3.5 shrink-0" /> ¿Qué adapta tu nivel?
                  </p>
                  <ul className="text-[10px] text-zinc-400 space-y-1.5 leading-snug">
                    <li>• <strong className="text-zinc-200">Nivel A:</strong> Ejercicios guiados (mancuernas y máquinas), AMRAP sugerido de 5 min. Ideal para aprender técnica y construir base.</li>
                    <li>• <strong className="text-zinc-200">Nivel B:</strong> Barras libres y cargas progresivas, AMRAP de 7 min. Equilibrio entre hipertrofia y fuerza.</li>
                    <li>• <strong className="text-zinc-200">Nivel C:</strong> Variantes de alta exigencia (pausas 2s abajo, tempo), AMRAP de 10 min. Máxima intensidad.</li>
                  </ul>
                </div>
              </div>

              {/* Información contextual según módulo */}
              <div className="pt-4 border-t border-zinc-800 text-xs text-zinc-400 space-y-2">
                {activeModule === 'weekly' && (
                  <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800 space-y-1.5">
                    <p className="font-bold text-zinc-200">Hipertrofia Torso / Pierna</p>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Frecuencia 2 por grupo muscular. Puedes mantener la misma rutina durante 4 a 12 semanas (mesociclo) para consolidar tu fuerza antes de cambiar de bloque.
                    </p>
                  </div>
                )}

                {activeModule === 'quick' && (
                  <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800 space-y-1.5">
                    <p className="font-bold text-zinc-200">Entrenamiento Rápido</p>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Sesiones dinámicas A y B. Ideal si dispones de menos tiempo o quieres variar ejercicios aleatorios frecuentemente.
                    </p>
                  </div>
                )}

                {activeModule === 'hiit' && (
                  <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800 space-y-1.5">
                    <p className="font-bold text-zinc-200">Cardio Intervalos</p>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Protocolos de alta intensidad (Tabata, Quemador, Pirámide) con guía acústica por rondas.
                    </p>
                  </div>
                )}

                {activeModule === 'running' && (
                  <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800 space-y-1.5">
                    <p className="font-bold text-zinc-200">Entrenamiento Polarizado</p>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Modelo 80/20: el 80% del volumen a ritmo conversacional fácil (Z2) previene lesiones y optimiza la capacidad mitocondrial.
                    </p>
                  </div>
                )}

                {activeModule === 'hyroxocr' && (
                  <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800 space-y-1.5">
                    <p className="font-bold text-zinc-200">Rendimiento Funcional</p>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Simulaciones de estaciones Hyrox oficiales (2026/27) y preparación para carreras OCR de obstáculos.
                    </p>
                  </div>
                )}

                {activeModule === 'bank' && (
                  <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800 space-y-1.5">
                    <p className="font-bold text-zinc-200">Banco & Creador de Rutinas</p>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Explora la técnica, errores comunes y biomecánica de cada ejercicio, o diseña tus propias rutinas a medida con guardado persistente.
                    </p>
                  </div>
                )}

                {activeModule === 'challenges' && (
                  <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800 space-y-1.5">
                    <p className="font-bold text-zinc-200">Salón de Trofeos & Retos</p>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Conquista 12 insignias atléticas con rigor biomecánico e inscríbete en retos comunitarios de running, fuerza e híbrido.
                    </p>
                  </div>
                )}

                {activeModule === 'squads' && (
                  <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800 space-y-1.5">
                    <p className="font-bold text-zinc-200">Mi Combo &amp; Entrenamiento Grupal</p>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Entrena con tu combo, comparte y clona rutinas con códigos de invitación y monitorea el check-in diario grupal.
                    </p>
                  </div>
                )}

                {activeModule === 'admin' && (
                  <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800 space-y-1.5">
                    <p className="font-bold text-zinc-200">Panel Administrativo FitMax</p>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Gestión de suscripciones, otorgamiento de pases vitalicios para amigos, cupones de invitación y métricas de crecimiento.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* PANEL DERECHO: CONSOLA DE ENTRENAMIENTO */}
          <section className="md:col-span-8 lg:col-span-9 bg-white text-zinc-950 rounded-3xl p-5 md:p-7 flex flex-col min-h-[550px] shadow-2xl">
            {activeModule === 'weekly' && (
              <WeeklyModule
                nickname={nickname}
                selectedLevel={selectedLevel}
                onNotification={showNotification}
              />
            )}

            {activeModule === 'quick' && (
              <QuickModule
                nickname={nickname}
                selectedLevel={selectedLevel}
                onNotification={showNotification}
              />
            )}

            {activeModule === 'hiit' && (
              <HiitModule />
            )}

            {activeModule === 'running' && (
              <RunningModule nickname={nickname} onNotification={showNotification} />
            )}

            {activeModule === 'hyroxocr' && (
              <HyroxOcrModule nickname={nickname} />
            )}

            {activeModule === 'bank' && (
              <ExerciseBankModule
                nickname={nickname}
                selectedLevel={selectedLevel}
                onNotification={showNotification}
              />
            )}

            {activeModule === 'challenges' && (
              <ChallengesModule
                nickname={nickname}
                onNotification={showNotification}
              />
            )}

            {activeModule === 'squads' && (
              <SquadsModule
                nickname={nickname}
                onNotification={showNotification}
              />
            )}

            {activeModule === 'admin' && (
              <AdminModule
                nickname={nickname}
                onNotification={showNotification}
              />
            )}
          </section>
        </main>
      </div>

      {/* MODAL DE PERFIL / ESPACIOS */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-fadeIn">
            <button 
              onClick={() => setShowProfileModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight text-white">Espacios de Usuario</h3>
                <p className="text-xs text-zinc-400">Tus rutinas, pesos y marcas se guardan por perfil</p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSwitchProfile(tempNickname);
              }}
              className="flex gap-2 mb-6"
            >
              <input
                type="text"
                placeholder="Nombre o apodo..."
                value={tempNickname}
                onChange={(e) => setTempNickname(e.target.value)}
                maxLength={20}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 flex-1 font-bold"
              />
              <button
                type="submit"
                disabled={!tempNickname.trim()}
                className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 font-black px-4 rounded-xl text-xs uppercase tracking-wider transition-colors shrink-0"
              >
                Entrar
              </button>
            </form>

            <div className="border-t border-zinc-800/80 pt-4">
              <span className="text-[10px] uppercase font-black text-zinc-500 tracking-wider block mb-3">
                Espacios en este dispositivo:
              </span>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {profiles.map((p) => (
                  <div
                    key={p}
                    onClick={() => handleSwitchProfile(p)}
                    className={`flex items-center justify-between p-2.5 px-3.5 rounded-xl border transition-all cursor-pointer ${
                      nickname === p
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-extrabold'
                        : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black select-none shrink-0 ${
                        nickname === p ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-900 text-zinc-400'
                      }`}>
                        {getInitials(p)}
                      </div>
                      <span className="text-sm truncate font-bold">{p}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 shrink-0">
                      {nickname === p && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md font-black uppercase tracking-wider">
                          Activo
                        </span>
                      )}
                      {p !== 'Invitado' && (
                        <button
                          onClick={(e) => handleDeleteProfile(p, e)}
                          className="p-1.5 hover:bg-red-950/40 text-zinc-500 hover:text-red-400 rounded-lg transition-colors"
                          title="Eliminar este espacio"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setShowProfileModal(false);
                setHasEntered(false);
                if (user) signOut();
                try {
                  localStorage.removeItem('fitmax_has_entered_v1');
                } catch {}
              }}
              className="mt-4 w-full bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <User className="w-3.5 h-3.5" />
              <span>Cambiar Atleta / Pantalla de Inicio</span>
            </button>

            <button
              onClick={() => setShowProfileModal(false)}
              className="mt-2 w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE CIENCIA DEL ENTRENAMIENTO */}
      {showScienceModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto animate-fadeIn">
            <button 
              onClick={() => setShowScienceModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-purple-500/10 rounded-2xl border border-purple-500/20 text-purple-400">
                <Info className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight text-white">Ciencia del Entrenamiento</h3>
                <p className="text-xs text-zinc-400">Los principios que definen cada rutina de esta app</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
                <h4 className="text-emerald-400 text-xs uppercase tracking-wider font-extrabold flex items-center gap-1.5 mb-1.5">
                  <Award className="w-3.5 h-3.5" /> Volumen semanal
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Cada grupo muscular acumula entre <span className="text-zinc-200 font-semibold">10 y 20 series efectivas por semana</span>, el rango asociado a mayor hipertrofia en los metaanálisis de dosis-respuesta (Schoenfeld et al., 2017).
                </p>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
                <h4 className="text-emerald-400 text-xs uppercase tracking-wider font-extrabold flex items-center gap-1.5 mb-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Frecuencia: 2x por semana
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  El plan semanal entrena torso y pierna dos veces cada uno (días 1+3 y 2+4). Entrenar cada músculo <span className="text-zinc-200 font-semibold">2 veces por semana</span> produce más hipertrofia que 1 sola vez, incluso con el mismo volumen total (Schoenfeld et al., 2016).
                </p>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
                <h4 className="text-purple-400 text-xs uppercase tracking-wider font-extrabold flex items-center gap-1.5 mb-1.5">
                  <Sliders className="w-3.5 h-3.5" /> RIR: cuánto esfuerzo aplicar
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  El "RIR" (Repeticiones en Reserva) que ves junto a cada ejercicio indica cuántas repeticiones más podrías hacer antes de fallar. Los compuestos pesados dejan más margen (RIR 2-3) para proteger la técnica; el aislamiento se acerca más al fallo (RIR 0-1).
                </p>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
                <h4 className="text-purple-400 text-xs uppercase tracking-wider font-extrabold flex items-center gap-1.5 mb-1.5">
                  <ArrowUpDown className="w-3.5 h-3.5" /> Sobrecarga progresiva
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  El estímulo debe crecer con el tiempo. Cada vez que marcas un ejercicio como completado, la app guarda tu peso y reps y calcula tu progresión: mientras estés dentro del rango de reps te sugiere subir repeticiones; al tocar el techo del rango, sugiere subir ~4% de carga (doble progresión).
                </p>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
                <h4 className="text-emerald-400 text-xs uppercase tracking-wider font-extrabold flex items-center gap-1.5 mb-1.5">
                  <Clock className="w-3.5 h-3.5" /> Descanso entre series
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Los descansos sugeridos están calibrados por tipo de esfuerzo: <span className="text-zinc-200 font-semibold">~150s en días de fuerza y ~90-120s en compuestos</span> (Schoenfeld et al., 2016); <span className="text-zinc-200 font-semibold">45-60s en aislamiento y core</span> para mantener densidad.
                </p>
              </div>

              <div className="bg-amber-950/20 border border-amber-500/20 rounded-2xl p-4">
                <h4 className="text-amber-400 text-xs uppercase tracking-wider font-extrabold flex items-center gap-1.5 mb-1.5">
                  <Trophy className="w-3.5 h-3.5" /> Descarga (deload) cada 4-8 semanas
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Tras varias semanas seguidas acumulando fatiga, una semana con ~40-50% menos volumen permite disipar fatiga sistémica y consolidar adaptaciones de fuerza e hipertrofia.
                </p>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
                <h4 className="text-zinc-300 text-xs uppercase tracking-wider font-extrabold flex items-center gap-1.5 mb-1.5">
                  <HeartPulse className="w-3.5 h-3.5" /> Recuperación
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  El músculo crece durante el descanso, no en el gimnasio. El sueño profundo (7-9h) y la nutrición adecuada son el pilar que sostiene todo entrenamiento.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowScienceModal(false)}
              className="mt-6 w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* MODAL SOFT WALL («MODO PUERTA ABIERTA») */}
      <SoftWallModal
        isOpen={!!softWallTrigger}
        trigger={softWallTrigger || 'cloud_sync'}
        onClose={() => setSoftWallTrigger(null)}
      />

      {/* MODAL DE SUSCRIPCIÓN & MEMBRESÍA FITMAX PRO */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSubscriptionUpdated={(newTier) => {
          refreshSubscription();
          showNotification(`¡Membresía actualizada a ${newTier.toUpperCase()}! 🔥`);
        }}
        currentNickname={nickname}
      />

      {/* MODAL DE CHEQUEO DE SALUD Y SEGURIDAD (PAR-Q+) */}
      {showHealthModal && (
        <HealthSafetyModal
          onClose={() => setShowHealthModal(false)}
          onCompleted={() => showNotification('¡Chequeo preventivo de salud guardado!')}
        />
      )}
    </div>
  );
}
