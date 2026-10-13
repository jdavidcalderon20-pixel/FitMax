import React, { useState } from 'react';
import { 
  Dumbbell, 
  Sparkles, 
  ArrowRight, 
  User, 
  Mail, 
  Lock, 
  Key, 
  ShieldCheck, 
  Crown,
  Footprints,
  Shield,
  CheckCircle,
  HelpCircle,
  Cloud
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { claimAdminRole } from '../lib/subscription';

interface WelcomeScreenProps {
  initialNickname?: string;
  onEnterAsGuest: (nickname: string) => void;
  onEnterAsAdmin?: () => void;
}

export default function WelcomeScreen({ 
  initialNickname = '', 
  onEnterAsGuest,
  onEnterAsAdmin 
}: WelcomeScreenProps) {
  const { user, signInWithPassword, signUpWithPassword, signInWithEmail, signInWithGoogle, cloudEnabled } = useAuth();
  const [mode, setMode] = useState<'guest' | 'login' | 'admin_direct'>('guest');

  // Estado Invitado
  const [guestName, setGuestName] = useState(initialNickname && initialNickname !== 'Invitado' ? initialNickname : '');

  // Estado Login / Nube
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // Estado Clave Admin Directa
  const [adminKey, setAdminKey] = useState('');
  const [adminError, setAdminError] = useState<string | null>(null);

  // Enviar como invitado
  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = guestName.trim() || 'Atleta FitMax';
    onEnterAsGuest(clean);
  };

  // Enviar login con correo y contraseña
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const isOwner = cleanEmail === 'jdavidcalderon20@gmail.com';

    try {
      if (isRegistering) {
        const res = await signUpWithPassword(cleanEmail, password);
        if (res.error) {
          setLoginError(res.error);
        } else {
          const nick = cleanEmail.split('@')[0] || 'Atleta';
          if (isOwner) {
            localStorage.setItem('fitmax_user_role', 'admin');
            localStorage.setItem('fitmax_subscription_tier', 'beta_lifetime');
            if (onEnterAsAdmin) onEnterAsAdmin();
            else onEnterAsGuest('Administrador');
          } else {
            onEnterAsGuest(nick);
          }
        }
      } else {
        const res = await signInWithPassword(cleanEmail, password);
        if (res.error) {
          if (res.error.toLowerCase().includes('invalid login credentials')) {
            setLoginError('Correo o contraseña incorrectos. Si aún no has creado tu cuenta, selecciona la pestaña "Crear Cuenta" arriba o ingresa con Enlace Mágico.');
          } else {
            setLoginError(res.error);
          }
        } else {
          const nick = cleanEmail.split('@')[0] || 'Atleta';
          if (isOwner) {
            localStorage.setItem('fitmax_user_role', 'admin');
            localStorage.setItem('fitmax_subscription_tier', 'beta_lifetime');
            if (onEnterAsAdmin) onEnterAsAdmin();
            else onEnterAsGuest('Administrador');
          } else {
            onEnterAsGuest(nick);
          }
        }
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Error durante la autenticación');
    } finally {
      setLoginLoading(false);
    }
  };

  // Enviar enlace mágico al correo
  const handleMagicLink = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setLoginError('Por favor ingresa un correo electrónico válido');
      return;
    }
    setLoginLoading(true);
    setLoginError(null);
    const res = await signInWithEmail(cleanEmail);
    setLoginLoading(false);
    if (res.error) {
      setLoginError(res.error);
    } else {
      setMagicLinkSent(true);
    }
  };

  // Login con Google
  const handleGoogleAuth = async () => {
    setLoginLoading(true);
    setLoginError(null);
    const res = await signInWithGoogle();
    if (res.error) {
      if (
        res.error.toLowerCase().includes('provider is not enabled') ||
        res.error.toLowerCase().includes('unsupported provider')
      ) {
        setLoginError('El inicio de sesión directo con Google requiere activar el proveedor en el panel de Supabase. Mientras tanto, puedes crear tu cuenta o ingresar con tu Correo y Contraseña.');
      } else {
        setLoginError(res.error);
      }
      setLoginLoading(false);
    }
  };

  // Acceso directo Admin con clave maestra
  const handleAdminKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    const res = await claimAdminRole(adminKey.trim(), user?.id);
    if (res.success) {
      localStorage.setItem('fitmax_user_role', 'admin');
      localStorage.setItem('fitmax_subscription_tier', 'beta_lifetime');
      if (onEnterAsAdmin) onEnterAsAdmin();
      else onEnterAsGuest('Administrador');
    } else {
      setAdminError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center p-4 selection:bg-emerald-500 selection:text-zinc-950 relative overflow-hidden">
      {/* Luces y efectos de fondo */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-emerald-600/15 via-cyan-500/15 to-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10 flex flex-col items-center text-center">
        
        {/* LOGO FITMAX */}
        <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-[0_0_35px_rgba(16,185,129,0.35)] border border-emerald-500/40 p-1.5 bg-zinc-900 mb-4 hover:scale-105 transition-transform">
          <img src="/icon.svg" alt="FitMax Logo" className="w-full h-full object-contain rounded-2xl" />
        </div>

        {/* TÍTULO Y SLOGAN CORTO */}
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white flex items-center gap-2">
          <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-300 bg-clip-text text-transparent">FitMax</span>
        </h1>
        <p className="text-emerald-400 text-sm font-black uppercase tracking-widest mt-1">
          Entrenamiento inteligente
        </p>
        <p className="text-zinc-400 text-xs mt-1 max-w-sm">
          Planifica tus mesociclos de hipertrofia, running 80/20 y sincroniza tus marcas con tu combo.
        </p>

        {/* SELECTOR DE MODO */}
        <div className="w-full bg-zinc-900/90 p-1.5 rounded-2xl border border-zinc-800 flex items-center gap-1 mt-6 mb-4 shadow-inner">
          <button
            onClick={() => { setMode('guest'); setLoginError(null); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              mode === 'guest'
                ? 'bg-emerald-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Atleta Invitado</span>
          </button>
          <button
            onClick={() => { setMode('login'); setLoginError(null); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-zinc-800 text-white shadow-md border border-zinc-700'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Sincronizar Cuenta</span>
          </button>
        </div>

        {/* CONTENEDOR PRINCIPAL */}
        <div className="w-full bg-zinc-900/80 border border-zinc-800/80 rounded-3xl p-6 shadow-2xl backdrop-blur-md text-left">
          
          {/* MODO 1: ATLETA INVITADO (CERO FRICCIÓN) */}
          {mode === 'guest' && (
            <form onSubmit={handleGuestSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1.5">
                  ¿Cómo te llamas o cuál es tu apodo?
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Ej. Juan, Titan, Fer..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 font-medium"
                    autoFocus
                  />
                  <div className="absolute right-3.5 top-3.5 text-zinc-600">
                    <User className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1.5">
                  ⚡ Entra al instante. No necesitas contraseñas; tus rutinas y cargas se guardan en este dispositivo.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-black rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
              >
                <span>Comenzar a Entrenar</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle className="w-3 h-3" /> Modo libre y gratuito
                </span>
                <button
                  type="button"
                  onClick={() => setMode('admin_direct')}
                  className="hover:text-amber-400 text-zinc-500 transition-colors flex items-center gap-1"
                >
                  <Crown className="w-3 h-3 text-amber-500" />
                  <span>Acceso Propietario</span>
                </button>
              </div>
            </form>
          )}

          {/* MODO 2: INICIAR SESIÓN / REGISTRO / GOOGLE */}
          {mode === 'login' && (
            <div className="space-y-4">
              {/* SUB-PESTAÑAS CLARAS: INICIAR SESIÓN O CREAR CUENTA */}
              <div className="flex bg-zinc-950 p-1 rounded-2xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => { setIsRegistering(false); setLoginError(null); }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    !isRegistering
                      ? 'bg-purple-600 text-white font-black shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => { setIsRegistering(true); setLoginError(null); }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    isRegistering
                      ? 'bg-purple-600 text-white font-black shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Crear Cuenta Nueva
                </button>
              </div>

              {loginError && (
                <div className="bg-rose-950/70 border border-rose-800/80 p-3 rounded-2xl text-xs text-rose-200">
                  {loginError}
                </div>
              )}

              {magicLinkSent ? (
                <div className="text-center py-4 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center mx-auto">
                    <Mail className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">¡Enlace enviado a tu correo!</h4>
                  <p className="text-xs text-zinc-400">
                    Revisa tu bandeja de entrada en <strong>{email}</strong> y haz clic en el enlace para ingresar de forma segura sin contraseña.
                  </p>
                  <button
                    onClick={() => setMagicLinkSent(false)}
                    className="text-xs text-emerald-400 hover:underline pt-2 inline-block font-bold"
                  >
                    Volver a intentar
                  </button>
                </div>
              ) : (
                <>
                  {/* Botón de Google OAuth */}
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={loginLoading}
                    className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 rounded-2xl text-xs font-bold text-white flex items-center justify-center gap-2.5 transition-all shadow-sm disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continuar con Google</span>
                  </button>

                  <div className="flex items-center gap-2 text-zinc-600 my-2">
                    <div className="flex-1 h-px bg-zinc-800" />
                    <span className="text-[10px] uppercase tracking-wider font-bold">o con correo</span>
                    <div className="flex-1 h-px bg-zinc-800" />
                  </div>

                  <form onSubmit={handleEmailAuth} className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-zinc-300 block mb-1">
                        Correo electrónico
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@correo.com"
                        required
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-300 block mb-1">
                        Contraseña
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
                    >
                      <span>
                        {loginLoading
                          ? 'Conectando...'
                          : isRegistering
                          ? 'Crear mi Cuenta FitMax'
                          : 'Iniciar Sesión con Correo'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <button
                        type="button"
                        onClick={handleMagicLink}
                        disabled={loginLoading}
                        className="text-zinc-400 hover:text-cyan-300 underline"
                      >
                        Ingresar sin clave (Magic Link)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setIsRegistering(!isRegistering); setLoginError(null); }}
                        className="text-purple-400 hover:underline font-bold"
                      >
                        {isRegistering ? '¿Ya tienes cuenta? Entrar' : '¿Eres nuevo? Regístrate'}
                      </button>
                    </div>

                    <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
                      <span className="flex items-center gap-1 text-zinc-400">
                        <CheckCircle className="w-3 h-3 text-emerald-400" /> Sincronización en la Nube
                      </span>
                      <button
                        type="button"
                        onClick={() => setMode('admin_direct')}
                        className="hover:text-amber-400 text-zinc-500 transition-colors flex items-center gap-1"
                      >
                        <Crown className="w-3 h-3 text-amber-500" />
                        <span>Acceso Propietario</span>
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          )}

          {/* MODO 3: ACCESO DIRECTO ADMIN (CON CLAVE MAESTRA) */}
          {mode === 'admin_direct' && (
            <form onSubmit={handleAdminKeySubmit} className="space-y-4">
              <div className="flex items-center gap-2 mb-2 text-amber-400">
                <Crown className="w-5 h-5 shrink-0" />
                <h4 className="text-sm font-black text-white">Consola de Propietario</h4>
              </div>

              {adminError && (
                <div className="bg-rose-950/70 border border-rose-800 p-2.5 rounded-xl text-xs text-rose-200">
                  {adminError}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  Clave secreta de Administración
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    placeholder="Clave de administrador"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 font-mono"
                    autoFocus
                  />
                  <div className="absolute right-3.5 top-3 text-zinc-600">
                    <Key className="w-4 h-4 text-amber-400" />
                  </div>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Acceso exclusivo para gestión de suscripciones, cupones y plataforma.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setMode('guest')}
                  className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-2xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black rounded-2xl text-xs shadow-md"
                >
                  Desbloquear Admin
                </button>
              </div>
            </form>
          )}

        </div>

        {/* PIE DE BIENVENIDA */}
        <p className="text-[11px] text-zinc-600 mt-6 text-center">
          FitMax • Entrenamiento Inteligente • {new Date().getFullYear()}
        </p>

      </div>
    </div>
  );
}
