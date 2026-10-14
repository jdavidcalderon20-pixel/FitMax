import React, { useState, useEffect } from 'react';
import { Level, LEVELS } from './types';
import TodayModule from './components/TodayModule';
import TrainModule, { DisciplineType } from './components/TrainModule';
import SquadsModule from './components/SquadsModule';
import LibraryModule from './components/LibraryModule';
import ProfileModule from './components/ProfileModule';
import AdminModule from './components/AdminModule';
import WelcomeScreen from './components/WelcomeScreen';
import HealthSafetyModal from './components/HealthSafetyModal';
import SoftWallModal, { SoftWallTrigger } from './components/SoftWallModal';
import SubscriptionModal from './components/SubscriptionModal';
import { useAuth } from './lib/auth';
import { getUserSubscription, SubscriptionInfo, ENABLE_MONETIZATION } from './lib/subscription';
import { 
  Home, 
  Dumbbell, 
  Users, 
  BookOpen, 
  User, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';

export type AppSection = 'today' | 'train' | 'squads' | 'library' | 'profile' | 'admin';

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

  const [activeSection, setActiveSection] = useState<AppSection>('today');
  const [trainDiscipline, setTrainDiscipline] = useState<DisciplineType>('gym');
  const [planSaveNotification, setPlanSaveNotification] = useState<string | null>(null);
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
    if (clean.length === 0) return 'AT';
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
    const lvlName = LEVELS.find((l) => l.id === level)?.simpleName || LEVELS.find((l) => l.id === level)?.name;
    showNotification(`Nivel actualizado a: ${lvlName}`);
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
    if (!isAdmin && activeSection === 'admin') {
      setActiveSection('today');
    }
  }, [isAdmin, activeSection]);

  const handleNavigate = (section: 'train' | 'squads' | 'profile' | 'library', subDiscipline?: DisciplineType) => {
    if (subDiscipline) {
      setTrainDiscipline(subDiscipline);
    }
    setActiveSection(section);
  };

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
          setActiveSection('admin');
        }}
      />
    );
  }

  // Las 5 secciones principales de la app
  const navSections = [
    { id: 'today' as const, label: 'Hoy', icon: Home },
    { id: 'train' as const, label: 'Entrenar', icon: Dumbbell },
    { id: 'squads' as const, label: 'Combo', icon: Users },
    { id: 'library' as const, label: 'Biblioteca', icon: BookOpen },
    { id: 'profile' as const, label: 'Perfil', icon: User },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-zinc-950">
      
      {/* CABECERA MINIMALISTA (Solo Logo + Avatar según sección 3.1) */}
      <header className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3 sm:px-6">
        <div className="max-w-4xl w-full mx-auto flex items-center justify-between">
          {/* Logo FitMax */}
          <button
            onClick={() => setActiveSection('today')}
            className="flex items-center gap-2.5 text-left transition-transform active:scale-95 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-emerald-500/30 p-0.5 bg-zinc-900 shrink-0 flex items-center justify-center">
              <img src="/icon.svg" alt="FitMax Logo" className="w-full h-full object-contain rounded-lg" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
                FitMax
              </span>
              <span className="text-[10px] text-zinc-500 block -mt-1 font-medium">
                Entrenamiento híbrido
              </span>
            </div>
          </button>

          {/* Avatar del Atleta (Abre el módulo Perfil) */}
          <button
            onClick={() => setActiveSection('profile')}
            className={`flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-full border transition-all cursor-pointer ${
              activeSection === 'profile'
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
            }`}
            title="Ir a mi perfil"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-zinc-950 text-[10px] font-black flex items-center justify-center">
              {getInitials(nickname)}
            </div>
            <span className="text-xs font-bold max-w-[100px] truncate hidden sm:inline">
              {nickname}
            </span>
          </button>
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-5 sm:px-6 pb-24">
        {/* Banner de Notificación */}
        {planSaveNotification && (
          <div className="mb-5 bg-emerald-500 text-zinc-950 rounded-2xl p-3.5 shadow-xl font-bold flex items-center gap-3 border border-emerald-400 animate-fadeIn text-xs">
            <Sparkles className="w-4 h-4 shrink-0" />
            <p>{planSaveNotification}</p>
          </div>
        )}

        {/* 1. SECCIÓN HOY */}
        {activeSection === 'today' && (
          <TodayModule
            nickname={nickname}
            selectedLevel={selectedLevel}
            onNavigate={handleNavigate}
            onOpenProfile={() => setActiveSection('profile')}
            onNotification={showNotification}
          />
        )}

        {/* 2. SECCIÓN ENTRENAR */}
        {activeSection === 'train' && (
          <TrainModule
            nickname={nickname}
            selectedLevel={selectedLevel}
            onSelectLevel={handleSelectLevel}
            onNotification={showNotification}
            initialDiscipline={trainDiscipline}
          />
        )}

        {/* 3. SECCIÓN COMBO */}
        {activeSection === 'squads' && (
          <div className="w-full animate-fadeIn pb-16">
            <SquadsModule
              nickname={nickname}
              onNotification={showNotification}
            />
          </div>
        )}

        {/* 4. SECCIÓN BIBLIOTECA */}
        {activeSection === 'library' && (
          <LibraryModule
            nickname={nickname}
            selectedLevel={selectedLevel}
            onNotification={showNotification}
          />
        )}

        {/* 5. SECCIÓN PERFIL */}
        {activeSection === 'profile' && (
          <ProfileModule
            nickname={nickname}
            selectedLevel={selectedLevel}
            onSelectLevel={handleSelectLevel}
            user={user}
            isAdmin={isAdmin}
            isStandalone={isStandalone}
            profiles={profiles}
            onSwitchProfile={handleSwitchProfile}
            onDeleteProfile={handleDeleteProfile}
            onOpenHealth={() => setShowHealthModal(true)}
            onOpenCloudSync={() => setSoftWallTrigger('cloud_sync')}
            onInstallApp={handleInstallClick}
            onSignOut={() => {
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
            onOpenAdmin={() => setActiveSection('admin')}
            onNotification={showNotification}
          />
        )}

        {/* CONSOLA DE ADMINISTRACIÓN (Solo Superadmin) */}
        {activeSection === 'admin' && isAdmin && (
          <div className="space-y-4 animate-fadeIn pb-16">
            <button
              onClick={() => setActiveSection('profile')}
              className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors bg-zinc-900 border border-zinc-800 px-3.5 py-2 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a Mi Perfil</span>
            </button>
            <AdminModule
              nickname={nickname}
              onNotification={showNotification}
            />
          </div>
        )}
      </main>

      {/* BARRA DE NAVEGACIÓN INFERIOR (Las 5 secciones: Hoy, Entrenar, Combo, Biblioteca, Perfil) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-800/80 px-2 py-1.5 sm:py-2">
        <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
          {navSections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'text-[#1FD08A]'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 transition-transform ${isActive ? 'scale-110' : ''}`} />
                <span className={`text-[10px] font-bold tracking-tight ${isActive ? 'text-white font-extrabold' : ''}`}>
                  {sec.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* MODAL SOFT WALL («MODO PUERTA ABIERTA») */}
      <SoftWallModal
        isOpen={!!softWallTrigger}
        trigger={softWallTrigger || 'cloud_sync'}
        onClose={() => setSoftWallTrigger(null)}
      />

      {/* MODAL DE SUSCRIPCIÓN & MEMBRESÍA FITMAX PRO (En pausa bajo ENABLE_MONETIZATION) */}
      {ENABLE_MONETIZATION && (
        <SubscriptionModal
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          onSubscriptionUpdated={(newTier) => {
            refreshSubscription();
            showNotification(`¡Membresía actualizada a ${newTier.toUpperCase()}! 🔥`);
          }}
          currentNickname={nickname}
        />
      )}

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
