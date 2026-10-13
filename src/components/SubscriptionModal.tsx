import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Sparkles, 
  Check, 
  X, 
  Gift, 
  CreditCard, 
  Smartphone, 
  Zap, 
  ShieldCheck, 
  ArrowRight,
  Send,
  Copy,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { 
  getUserSubscription, 
  redeemCoupon, 
  SubscriptionInfo, 
  DEFAULT_PAYMENT_CONFIG,
  SubscriptionTier 
} from '../lib/subscription';
import { generateWhatsAppLink } from '../lib/share';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscriptionUpdated?: (tier: SubscriptionTier) => void;
  currentNickname?: string;
}

export default function SubscriptionModal({
  isOpen,
  onClose,
  onSubscriptionUpdated,
  currentNickname = 'Atleta'
}: SubscriptionModalProps) {
  const { user } = useAuth();
  const [subInfo, setSubInfo] = useState<SubscriptionInfo | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedCycle, setSelectedCycle] = useState<'monthly' | 'annual'>('annual');
  const [activeTab, setActiveTab] = useState<'plans' | 'coupon' | 'payment'>('plans');

  useEffect(() => {
    if (isOpen) {
      loadSubscription();
      setFeedbackMsg(null);
    }
  }, [isOpen, user?.id]);

  const loadSubscription = async () => {
    const info = await getUserSubscription(user?.id);
    setSubInfo(info);
  };

  if (!isOpen) return null;

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setFeedbackMsg(null);

    const res = await redeemCoupon(couponCode, user?.id);
    setCouponLoading(false);

    if (res.success) {
      setFeedbackMsg({ type: 'success', text: res.message });
      setCouponCode('');
      await loadSubscription();
      if (res.tier && onSubscriptionUpdated) {
        onSubscriptionUpdated(res.tier);
      }
    } else {
      setFeedbackMsg({ type: 'error', text: res.message });
    }
  };

  const handleWhatsAppPayment = () => {
    const planText = selectedCycle === 'annual' ? 'Anual ($99.000 COP)' : 'Mensual ($14.900 COP)';
    const text = `¡Hola equipo FitMax! 👋 Quiero activar mi suscripción FitMax PRO (${planText}).\n\n👤 Atleta: ${currentNickname}\n📧 Correo: ${user?.email || 'Modo Local'}\n\nAdjunto comprobante de pago para mi activación inmediata. 🔥`;
    const url = generateWhatsAppLink(text);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const copyToClipboard = (text: string, label: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setFeedbackMsg({ type: 'success', text: `¡${label} copiado al portapapeles!` });
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const isPro = subInfo?.isPro;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6 z-50 animate-fadeIn">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col text-zinc-100 relative">
        
        {/* BOTÓN CERRAR */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-zinc-900 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* HEADER HERO */}
        <div className="p-6 md:p-8 bg-gradient-to-b from-emerald-950/60 via-zinc-900 to-zinc-950 border-b border-zinc-800/80">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-zinc-950 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
              <Crown className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">Membresía FitMax PRO</h2>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  Élite
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Lleva tu rendimiento atlético al siguiente nivel sin barreras ni comisiones
              </p>
            </div>
          </div>

          {/* BADGE DE ESTADO ACTUAL */}
          {isPro ? (
            <div className="mt-4 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
              <div>
                <p className="text-xs font-black text-amber-300">
                  {subInfo?.tier === 'beta_lifetime' 
                    ? '✨ Tienes Pase Beta Lifetime Vitalicio Activo' 
                    : '👑 Tienes Suscripción FitMax PRO Activa'}
                </p>
                <p className="text-[11px] text-zinc-400">
                  Tienes acceso ilimitado a todas las funciones premium y liderazgo de combo.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-3 flex gap-2">
              <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Plan Free 100% garantizado de por vida
              </span>
            </div>
          )}

          {/* PESTAÑAS INTERNAS */}
          <div className="flex gap-2 mt-5 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setActiveTab('plans')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'plans' ? 'bg-emerald-500 text-zinc-950 shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Planes & Beneficios
            </button>
            <button
              onClick={() => setActiveTab('coupon')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'coupon' ? 'bg-amber-500 text-zinc-950 shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Gift className="w-3.5 h-3.5" /> Canjear Cupón / VIP
            </button>
            <button
              onClick={() => setActiveTab('payment')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'payment' ? 'bg-cyan-500 text-zinc-950 shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" /> Métodos de Pago
            </button>
          </div>
        </div>

        {/* FEEDBACK NOTIFICATION */}
        {feedbackMsg && (
          <div className={`mx-6 mt-4 p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
            feedbackMsg.type === 'success' 
              ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300' 
              : 'bg-red-950/80 border-red-600 text-red-300'
          }`}>
            {feedbackMsg.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* CONTENIDO DEL MODAL */}
        <div className="p-6 md:p-8 space-y-6">

          {/* TAB 1: PLANES */}
          {activeTab === 'plans' && (
            <div className="space-y-6">
              {/* TOGGLE MENSUAL / ANUAL */}
              <div className="flex justify-center items-center gap-3">
                <span className={`text-xs font-bold ${selectedCycle === 'monthly' ? 'text-white' : 'text-zinc-500'}`}>
                  Facturación Mensual
                </span>
                <button
                  onClick={() => setSelectedCycle(selectedCycle === 'annual' ? 'monthly' : 'annual')}
                  className="w-12 h-6 bg-zinc-800 rounded-full p-1 relative transition-colors border border-zinc-700"
                >
                  <div className={`w-4 h-4 rounded-full bg-emerald-400 transition-transform ${
                    selectedCycle === 'annual' ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-bold ${selectedCycle === 'annual' ? 'text-white' : 'text-zinc-500'}`}>
                    Anual
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-500/40">
                    Ahorra 45% 🔥
                  </span>
                </div>
              </div>

              {/* GRID COMPARATIVO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* TARJETA FREE */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Atleta Libre</span>
                    <h3 className="text-lg font-black text-white mt-1">Plan Free</h3>
                    <div className="mt-3 mb-4">
                      <span className="text-2xl font-black text-white">$0</span>
                      <span className="text-xs text-zinc-500 ml-1">/ para siempre</span>
                    </div>
                    <ul className="space-y-2 text-xs text-zinc-300">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Rutinas semanales y rápidas A/B</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Cronómetros Tabata, AMRAP y EMOM</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Unirse a combos existentes</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>12 Medallas atléticas e historial local</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-6 pt-4 border-t border-zinc-800">
                    <span className="text-[11px] text-zinc-500 block text-center">Incluido de fábrica</span>
                  </div>
                </div>

                {/* TARJETA PRO */}
                <div className="bg-gradient-to-b from-zinc-900 to-zinc-900/90 border-2 border-emerald-500/60 rounded-2xl p-5 flex flex-col justify-between relative shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                  <div className="absolute -top-3 right-4 bg-gradient-to-r from-emerald-400 to-cyan-400 text-zinc-950 text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-lg">
                    Recomendado
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Atleta Élite</span>
                    <h3 className="text-lg font-black text-white mt-1 flex items-center gap-1.5">
                      FitMax PRO <Crown className="w-4 h-4 text-amber-400" />
                    </h3>
                    <div className="mt-3 mb-4">
                      {selectedCycle === 'annual' ? (
                        <>
                          <span className="text-2xl font-black text-white">$99.000 COP</span>
                          <span className="text-xs text-zinc-400 ml-1">/ año</span>
                          <p className="text-[10px] text-emerald-400 font-bold mt-0.5">Equivale a solo $8.250 COP / mes (~$2.10 USD)</p>
                        </>
                      ) : (
                        <>
                          <span className="text-2xl font-black text-white">$14.900 COP</span>
                          <span className="text-xs text-zinc-400 ml-1">/ mes</span>
                          <p className="text-[10px] text-zinc-400 mt-0.5">Aprox. $3.90 USD / mes</p>
                        </>
                      )}
                    </div>
                    <ul className="space-y-2.5 text-xs text-zinc-200">
                      <li className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="font-bold">Periodización Inteligente de 4 a 12 semanas</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="font-bold">Escáner OCR ilimitado de tiempos Hyrox</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="font-bold">Crear combos como Capitán & Muro ilimitado</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Insignia dorada de Élite en el podio del Combo</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Sincronización multi-dispositivo sin límites</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-800/80">
                    {isPro ? (
                      <div className="w-full py-2.5 text-center text-xs font-black text-emerald-400 bg-emerald-950/60 rounded-xl border border-emerald-800">
                        ✓ Tu cuenta ya es PRO
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveTab('payment')}
                        className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 font-black text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        Activar FitMax PRO <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: CUPÓN / VIP */}
          {activeTab === 'coupon' && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-400">
                  <Gift className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">¿Tienes un Cupón de Invitación o Código VIP?</h3>
                  <p className="text-xs text-zinc-400">
                    Si eres evaluador beta, compañero de box o recibiste un código de cortesía, ingrésalo aquí.
                  </p>
                </div>
              </div>

              <form onSubmit={handleRedeem} className="space-y-3 pt-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Ej. COMBOCALI, FITMAXVIP..."
                    maxLength={20}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-mono font-bold text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 flex-1 uppercase tracking-wider"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-zinc-950 font-black text-xs rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 shrink-0"
                  >
                    {couponLoading ? 'Validando...' : 'Canjear Pase'}
                  </button>
                </div>
                <p className="text-[11px] text-zinc-500">
                  💡 Tip: Códigos de lanzamiento activos: <span className="font-mono text-zinc-300">COMBOCALI</span> (Beta Tester Vitalicio).
                </p>
              </form>
            </div>
          )}

          {/* TAB 3: MÉTODOS DE PAGO */}
          {activeTab === 'payment' && (
            <div className="space-y-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-6 h-6 text-purple-400 shrink-0" />
                  <div>
                    <h4 className="text-sm font-black text-white">Pago Directo Colombia (Cero Comisiones de App Store)</h4>
                    <p className="text-xs text-zinc-400">
                      Paga de forma segura mediante Nequi, Daviplata o PSE y activa tu cuenta de inmediato.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase text-purple-400">Nequi</p>
                      <p className="font-mono font-black text-base text-white mt-1">{DEFAULT_PAYMENT_CONFIG.nequi_phone}</p>
                      <p className="text-[11px] text-zinc-400 mt-1">A nombre de: FitMax Colombia</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(DEFAULT_PAYMENT_CONFIG.nequi_phone, 'Número Nequi')}
                      className="mt-3 flex items-center justify-center gap-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 py-1.5 px-3 rounded-lg text-[11px] font-bold transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copiar Número
                    </button>
                  </div>

                  <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase text-red-400">Daviplata</p>
                      <p className="font-mono font-black text-base text-white mt-1">{DEFAULT_PAYMENT_CONFIG.daviplata_phone}</p>
                      <p className="text-[11px] text-zinc-400 mt-1">A nombre de: FitMax Colombia</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(DEFAULT_PAYMENT_CONFIG.daviplata_phone, 'Número Daviplata')}
                      className="mt-3 flex items-center justify-center gap-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 py-1.5 px-3 rounded-lg text-[11px] font-bold transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copiar Número
                    </button>
                  </div>
                </div>

                {/* BOTÓN WHATSAPP ACTIVACIÓN */}
                <div className="pt-2">
                  <button
                    onClick={handleWhatsAppPayment}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Enviar Comprobante por WhatsApp para Activación Inmediata
                  </button>
                  <p className="text-[10px] text-zinc-500 text-center mt-2">
                    Tu cuenta será activada como PRO en menos de 10 minutos al verificar el comprobante.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
