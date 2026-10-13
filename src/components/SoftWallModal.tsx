import React, { useState } from 'react';
import { 
  Cloud, 
  X, 
  Mail, 
  CheckCircle2, 
  Users, 
  Share2, 
  Camera, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Flame
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { getSoftWallTriggerDetails, SoftWallTrigger } from '../lib/softWallConfig';

export type { SoftWallTrigger };

interface SoftWallModalProps {
  isOpen: boolean;
  trigger: SoftWallTrigger;
  onClose: () => void;
  onContinueAsGuest?: () => void;
}

export default function SoftWallModal({ 
  isOpen, 
  trigger, 
  onClose, 
  onContinueAsGuest 
}: SoftWallModalProps) {
  const { signInWithEmail, cloudEnabled } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) return;

    setLoading(true);
    setError(null);
    const { error: authErr } = await signInWithEmail(cleanEmail);
    setLoading(false);

    if (authErr) {
      setError(authErr);
    } else {
      setSent(true);
    }
  };

  const details = getSoftWallTriggerDetails(trigger);
  const TriggerIcon = trigger === 'join_squad' 
    ? Users 
    : trigger === 'share_routine' 
    ? Share2 
    : trigger === 'upload_photo' 
    ? Camera 
    : Cloud;

  const iconColor = trigger === 'join_squad' 
    ? 'text-cyan-400 bg-cyan-950/80 border-cyan-800'
    : trigger === 'share_routine'
    ? 'text-emerald-400 bg-emerald-950/80 border-emerald-800'
    : trigger === 'upload_photo'
    ? 'text-amber-400 bg-amber-950/80 border-amber-800'
    : 'text-emerald-400 bg-emerald-950/80 border-emerald-800';

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl relative overflow-hidden">
        
        {/* Resplandor ambiental de fondo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabecera del Gancho Social */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center p-2.5 border shadow-md ${iconColor}`}>
            <TriggerIcon className="w-6 h-6" />
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800 flex items-center gap-1 w-fit mb-1">
              <Sparkles className="w-3 h-3" /> Modo Equipo & Nube
            </span>
            <h3 className="text-lg font-black tracking-tight text-white leading-tight">
              {details.title}
            </h3>
          </div>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed mb-5">
          {details.subtitle}
        </p>

        {/* Lista de beneficios de registrarse */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 mb-5 space-y-2.5 text-xs">
          <div className="flex items-center gap-2 text-zinc-200 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{details.benefit}</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <Flame className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Sin contraseñas: Entra con 1 solo clic desde tu correo</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>100% Gratuito y sin publicidad</span>
          </div>
        </div>

        {sent ? (
          <div className="bg-emerald-950/60 border border-emerald-800 rounded-2xl p-4 text-center space-y-2 animate-fadeIn">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-black text-white">¡Enlace Mágico Enviado!</h4>
            <p className="text-xs text-emerald-200">
              Revisa tu bandeja de entrada en <strong className="text-white">{email}</strong> y pulsa el enlace para activar tu cuenta de inmediato.
            </p>
            <button
              onClick={onClose}
              className="mt-2 w-full py-2.5 bg-emerald-500 text-zinc-950 font-black rounded-xl text-xs hover:bg-emerald-400 transition-colors"
            >
              Listo, entendido
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                Ingresa tu correo en 5 segundos:
              </label>
              <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 focus-within:border-cyan-400 transition-all">
                <Mail className="w-4 h-4 text-zinc-500 shrink-0" />
                <input
                  type="email"
                  required
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent text-xs text-white placeholder-zinc-500 outline-none flex-1 font-bold"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 font-bold bg-red-950/40 p-2 rounded-xl border border-red-800">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-50 text-zinc-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-500/20"
            >
              <span>{loading ? 'Generando enlace...' : 'Sincronizarme con mi Equipo'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Opción de escape cero fricción: continuar como invitado */}
            {onContinueAsGuest && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onContinueAsGuest();
                }}
                className="w-full py-2.5 text-zinc-400 hover:text-zinc-200 text-xs font-bold transition-colors block text-center"
              >
                Continuar en modo invitado local por ahora →
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
