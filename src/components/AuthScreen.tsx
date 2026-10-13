import React, { useState } from 'react';
import { Cloud, X, Mail, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../lib/auth';

interface AuthScreenProps {
  onClose: () => void;
}

export default function AuthScreen({ onClose }: AuthScreenProps) {
  const { signInWithEmail, cloudEnabled } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    const { error } = await signInWithEmail(email.trim());
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight text-white">Sincronizar en la nube</h3>
            <p className="text-xs text-zinc-400">Tu progreso disponible en cualquier dispositivo</p>
          </div>
        </div>

        {!cloudEnabled ? (
          <p className="text-sm text-zinc-400 leading-relaxed">
            La sincronización en la nube todavía no está configurada en esta instalación. Sigue las
            instrucciones del README ("Sincronización en la nube") para activarla — toma unos
            minutos y es gratis.
          </p>
        ) : sent ? (
          <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <p className="text-sm text-emerald-300">
              Revisa tu correo — te enviamos un enlace para entrar, sin contraseña que recordar.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-zinc-400 mb-4">
              Escribe tu correo y te enviamos un enlace para entrar, sin contraseña.
            </p>
            <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 mb-3">
              <Mail className="w-4 h-4 text-zinc-500 shrink-0" />
              <input
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent text-sm text-white placeholder-zinc-600 outline-none flex-1"
              />
            </div>
            {error && <p className="text-xs text-red-400 mb-3">{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={loading || !email.trim()}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-black py-2.5 rounded-xl text-sm transition-all"
            >
              {loading ? 'Enviando...' : 'Enviar enlace mágico'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
