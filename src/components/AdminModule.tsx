import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Users, 
  Crown, 
  Gift, 
  CreditCard, 
  Search, 
  Plus, 
  Check, 
  X, 
  Key, 
  Flame, 
  Lock, 
  Unlock, 
  RefreshCw,
  Copy,
  TrendingUp,
  Tag,
  Sliders,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { 
  getUserSubscription, 
  getPlatformMetrics, 
  listAllProfiles, 
  listCoupons, 
  createCoupon, 
  toggleCouponActive, 
  adminUpdateUserSubscription, 
  claimAdminRole,
  PlatformMetrics, 
  CouponItem, 
  SubscriptionTier,
  UserRole,
  DEFAULT_PAYMENT_CONFIG,
  PaymentConfig
} from '../lib/subscription';

interface AdminModuleProps {
  nickname: string;
  onNotification?: (msg: string) => void;
}

export default function AdminModule({ nickname, onNotification }: AdminModuleProps) {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [activeTab, setActiveTab] = useState<'metrics' | 'athletes' | 'coupons' | 'pricing'>('metrics');
  const [loading, setLoading] = useState(true);

  // Datos
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [athletes, setAthletes] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Formulario nuevo cupón
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponTier, setNewCouponTier] = useState<'beta_lifetime' | 'pro'>('beta_lifetime');
  const [newCouponMaxUses, setNewCouponMaxUses] = useState(50);
  const [newCouponNotes, setNewCouponNotes] = useState('');
  const [isCreatingCoupon, setIsCreatingCoupon] = useState(false);

  // Configuración de cobro
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>(DEFAULT_PAYMENT_CONFIG);

  useEffect(() => {
    checkAdminStatus();
  }, [user?.id]);

  const checkAdminStatus = async () => {
    setLoading(true);
    const sub = await getUserSubscription(user?.id);
    const isOwner = Boolean(user?.email && user.email.toLowerCase() === 'jdavidcalderon20@gmail.com');
    const hasAdmin = isOwner || sub.role === 'admin' || (typeof localStorage !== 'undefined' && localStorage.getItem('fitmax_user_role') === 'admin');
    setIsAdmin(hasAdmin);
    if (hasAdmin) {
      await refreshData();
    }
    setLoading(false);
  };

  const refreshData = async () => {
    const [m, a, c] = await Promise.all([
      getPlatformMetrics(),
      listAllProfiles(),
      listCoupons()
    ]);
    setMetrics(m);
    setAthletes(a);
    setCoupons(c);
  };

  const handleUnlockAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminKey.trim()) return;

    const res = await claimAdminRole(adminKey, user?.id);
    if (res.success) {
      setIsAdmin(true);
      setAdminKey('');
      if (onNotification) onNotification(res.message);
      await refreshData();
    } else {
      alert(res.message);
    }
  };

  const handleUpdateAthleteTier = async (athleteId: string, newTier: SubscriptionTier, newRole?: UserRole) => {
    const ok = await adminUpdateUserSubscription(athleteId, newTier, newRole);
    if (ok) {
      if (onNotification) onNotification(`Atleta actualizado a: ${newTier.toUpperCase()}`);
      await refreshData();
    } else {
      alert('Error al actualizar el nivel del atleta.');
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;

    setIsCreatingCoupon(true);
    const res = await createCoupon({
      code: newCouponCode,
      tier: newCouponTier,
      max_uses: newCouponMaxUses,
      notes: newCouponNotes
    });
    setIsCreatingCoupon(false);

    if (res.success) {
      setNewCouponCode('');
      setNewCouponNotes('');
      if (onNotification) onNotification(res.message);
      await refreshData();
    } else {
      alert(res.message);
    }
  };

  const handleToggleCoupon = async (couponId: string, currentActive: boolean) => {
    await toggleCouponActive(couponId, !currentActive);
    await refreshData();
  };

  const copyText = (txt: string, msg: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(txt);
      if (onNotification) onNotification(msg);
    }
  };

  // Filtrado de atletas
  const filteredAthletes = athletes.filter((a) => {
    const nameMatch = a.nickname?.toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = a.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch || emailMatch;
  });

  // Si no está desbloqueado como Admin, mostrar pantalla de acceso de seguridad
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-6 md:p-12 text-center max-w-md mx-auto my-auto space-y-5 animate-fadeIn">
        <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400 shadow-xl">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-black text-zinc-900">Módulo Administrativo FitMax</h2>
          <p className="text-xs text-zinc-500 mt-1">
            Espacio restringido para el propietario. Gestiona suscripciones, cupones VIP y métricas de plataforma.
          </p>
        </div>

        <form onSubmit={handleUnlockAdmin} className="w-full space-y-3 pt-2">
          <div className="relative">
            <input
              type="password"
              placeholder="Clave maestra de administrador..."
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-4 py-3 text-xs font-mono font-bold text-zinc-900 focus:outline-none focus:border-emerald-500"
            />
            <Key className="w-4 h-4 text-zinc-400 absolute right-3.5 top-3.5" />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-black text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            <Unlock className="w-4 h-4" /> Desbloquear Panel de Propietario
          </button>
        </form>

        <div className="p-3 bg-zinc-100 rounded-xl text-[11px] text-zinc-500 border border-zinc-200">
          💡 <span className="font-semibold text-zinc-700">Clave de inicio rápido:</span> Ingresa tu clave maestra o el código <span className="font-mono font-bold text-emerald-600">FITMAX_ADMIN_2026</span> para acceder.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 animate-fadeIn">
      
      {/* HEADER DEL PANEL */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-zinc-900 rounded-2xl text-emerald-400 shadow-md">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-xl font-black tracking-tight text-zinc-900">
                Consola Administrativa FitMax
              </h2>
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                SuperAdmin
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              Control total sobre atletas, pases gratuitos, facturación directa y crecimiento
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshData}
            className="p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            title="Refrescar datos en vivo"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
          <button
            onClick={() => setIsAdmin(false)}
            className="p-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            title="Bloquear consola"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bloquear</span>
          </button>
        </div>
      </div>

      {/* PESTAÑAS DE NAVEGACIÓN ADMINISTRATIVA */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-zinc-100 p-1.5 rounded-2xl border border-zinc-200">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
            activeTab === 'metrics' ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" /> Métricas Clave
        </button>
        <button
          onClick={() => setActiveTab('athletes')}
          className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
            activeTab === 'athletes' ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" /> Atletas ({athletes.length})
        </button>
        <button
          onClick={() => setActiveTab('coupons')}
          className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
            activeTab === 'coupons' ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <Gift className="w-3.5 h-3.5" /> Cupones VIP ({coupons.length})
        </button>
        <button
          onClick={() => setActiveTab('pricing')}
          className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
            activeTab === 'pricing' ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" /> Cobro & Tarifas
        </button>
      </div>

      {/* TAB 1: MÉTRICAS Y KPIS */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            
            <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 p-4 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between text-emerald-600 mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider">Atletas Totales</span>
                <Users className="w-4 h-4" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-zinc-900">{metrics?.total_users ?? athletes.length}</p>
              <p className="text-[11px] text-zinc-500 mt-1">Registrados en FitMax</p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-200 p-4 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between text-amber-600 mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider">FitMax PRO</span>
                <Crown className="w-4 h-4" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-zinc-900">{metrics?.pro_users ?? 0}</p>
              <p className="text-[11px] text-zinc-500 mt-1">Suscripciones de pago</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-200 p-4 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between text-purple-600 mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider">Beta Lifetime VIP</span>
                <Gift className="w-4 h-4" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-zinc-900">{metrics?.beta_users ?? 1}</p>
              <p className="text-[11px] text-zinc-500 mt-1">Pases gratuitos concedidos</p>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-white border border-cyan-200 p-4 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between text-cyan-600 mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider">Combos Activos</span>
                <Flame className="w-4 h-4" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-zinc-900">{metrics?.total_squads ?? 1}</p>
              <p className="text-[11px] text-zinc-500 mt-1">Equipos de entrenamiento</p>
            </div>

          </div>

          {/* TARJETA DE RESUMEN ESTRATÉGICO */}
          <div className="bg-zinc-900 text-zinc-100 rounded-3xl p-6 border border-zinc-800 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-sm font-black uppercase tracking-wider">Estrategia de Monetización FitMax</h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Tu modelo combina el <span className="text-emerald-400 font-bold">Freemium Ético</span> (cero fricción para entrenar) con <span className="text-cyan-400 font-bold">Cobro Directo sin el 30% de Apple/Google</span>. Para tus evaluadores y amigos de confianza, puedes otorgarles <span className="text-amber-400 font-bold">Beta Lifetime</span> en un solo clic desde la pestaña "Atletas" o pasarles el cupón <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-amber-300 font-mono">COMBOCALI</code>.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: GESTIÓN DE ATLETAS */}
      {activeTab === 'athletes' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Buscar por apodo o correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-300 rounded-xl pl-9 pr-4 py-2 text-xs font-bold text-zinc-900 focus:outline-none focus:border-emerald-500"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            </div>
            <span className="text-xs font-bold text-zinc-500 self-center">
              {filteredAthletes.length} atletas encontrados
            </span>
          </div>

          <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    <th className="py-3 px-4">Atleta</th>
                    <th className="py-3 px-4">Correo</th>
                    <th className="py-3 px-4">Nivel</th>
                    <th className="py-3 px-4">Plan Actual</th>
                    <th className="py-3 px-4 text-right">Acción Rápida (1 Clic)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-xs font-bold">
                  {filteredAthletes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-zinc-400">
                        No se encontraron atletas registrados aún.
                      </td>
                    </tr>
                  ) : (
                    filteredAthletes.map((ath) => {
                      const tier = ath.subscription_tier || 'free';
                      return (
                        <tr key={ath.id} className="hover:bg-zinc-50/80 transition-colors">
                          <td className="py-3 px-4 flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-zinc-900 text-white text-[10px] font-black flex items-center justify-center">
                              {ath.nickname?.slice(0, 2).toUpperCase() || 'AT'}
                            </div>
                            <span className="font-black text-zinc-900">{ath.nickname}</span>
                          </td>
                          <td className="py-3 px-4 text-zinc-600 font-mono text-[11px]">
                            {ath.email || 'Modo local'}
                          </td>
                          <td className="py-3 px-4">
                            <span className="bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded text-[10px] font-bold">
                              Nivel {ath.selected_level || 'A'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {tier === 'beta_lifetime' ? (
                              <span className="bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">
                                🎁 Beta Lifetime
                              </span>
                            ) : tier === 'pro' ? (
                              <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">
                                👑 PRO
                              </span>
                            ) : (
                              <span className="bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                                Free
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {tier !== 'beta_lifetime' && (
                                <button
                                  onClick={() => handleUpdateAthleteTier(ath.id, 'beta_lifetime')}
                                  className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-black transition-colors"
                                  title="Otorgar acceso gratuito vitalicio"
                                >
                                  + Dar Beta
                                </button>
                              )}
                              {tier !== 'pro' && (
                                <button
                                  onClick={() => handleUpdateAthleteTier(ath.id, 'pro')}
                                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-zinc-950 rounded-lg text-[10px] font-black transition-colors"
                                  title="Otorgar suscripción PRO"
                                >
                                  + Dar PRO
                                </button>
                              )}
                              {tier !== 'free' && (
                                <button
                                  onClick={() => handleUpdateAthleteTier(ath.id, 'free')}
                                  className="px-2 py-1 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 rounded-lg text-[10px] font-bold transition-colors"
                                  title="Regresar a cuenta gratuita"
                                >
                                  Free
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GESTOR DE CUPONES VIP */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          
          {/* CREAR NUEVO CUPÓN */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-black text-zinc-900 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-600" /> Crear Nuevo Cupón Promocional
            </h3>
            
            <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1">Código del Cupón</label>
                <input
                  type="text"
                  placeholder="Ej. COMBOMEDELLIN"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                  className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-zinc-900 uppercase focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1">Plan a Otorgar</label>
                <select
                  value={newCouponTier}
                  onChange={(e) => setNewCouponTier(e.target.value as any)}
                  className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold text-zinc-900 focus:outline-none focus:border-emerald-500"
                >
                  <option value="beta_lifetime">🎁 Beta Lifetime (Vitalicio)</option>
                  <option value="pro">👑 FitMax PRO</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1">Usos Máximos</label>
                <input
                  type="number"
                  min={1}
                  max={1000}
                  value={newCouponMaxUses}
                  onChange={(e) => setNewCouponMaxUses(parseInt(e.target.value, 10) || 50)}
                  className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold text-zinc-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 block mb-1">Nota / Para quién es</label>
                <input
                  type="text"
                  placeholder="Ej. Atletas box mañana"
                  value={newCouponNotes}
                  onChange={(e) => setNewCouponNotes(e.target.value)}
                  className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold text-zinc-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="sm:col-span-2 md:col-span-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isCreatingCoupon || !newCouponCode.trim()}
                  className="py-2.5 px-6 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white font-black text-xs rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-emerald-400" /> Crear Cupón
                </button>
              </div>
            </form>
          </div>

          {/* LISTA DE CUPONES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {coupons.map((c) => (
              <div key={c.id} className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-sm text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded">
                      #{c.code}
                    </span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      c.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {c.is_active ? 'Activo' : 'Pausado'}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-500 mt-2">
                    Otorga: <span className="font-bold text-zinc-800">{c.tier === 'beta_lifetime' ? 'Beta Lifetime Vitalicio' : 'FitMax PRO'}</span>
                  </p>
                  {c.notes && <p className="text-[11px] text-zinc-400 mt-0.5 italic">{c.notes}</p>}

                  <div className="mt-3 text-xs font-bold text-zinc-600">
                    Canjeado: <span className="text-zinc-900">{c.times_used}</span> de {c.max_uses} veces
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                  <button
                    onClick={() => copyText(c.code, `¡Código #${c.code} copiado!`)}
                    className="flex items-center gap-1 text-[11px] font-bold text-zinc-600 hover:text-zinc-900"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copiar Código
                  </button>
                  <button
                    onClick={() => handleToggleCoupon(c.id, c.is_active)}
                    className={`text-[11px] font-bold ${c.is_active ? 'text-red-600 hover:text-red-700' : 'text-emerald-600 hover:text-emerald-700'}`}
                  >
                    {c.is_active ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: COBRO Y TARIFAS */}
      {activeTab === 'pricing' && (
        <div className="space-y-6">
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-black text-zinc-900 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-600" /> Tarifas Oficiales y Canales de Recepción de Pagos
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-white p-4 rounded-xl border border-zinc-200">
                <p className="text-[10px] font-black uppercase text-zinc-500">Membresía Mensual</p>
                <p className="text-xl font-black text-zinc-900 mt-1">$14.900 COP / mes</p>
                <p className="text-xs text-zinc-400 mt-0.5">Equivalente a ~$3.99 USD</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-zinc-200">
                <p className="text-[10px] font-black uppercase text-zinc-500">Membresía Anual (Plan Estrella)</p>
                <p className="text-xl font-black text-emerald-600 mt-1">$99.000 COP / año</p>
                <p className="text-xs text-zinc-400 mt-0.5">Ahorro del 45% ($8.250 COP / mes)</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-zinc-200">
                <p className="text-[10px] font-black uppercase text-purple-600">Nequi para Transferencias</p>
                <p className="text-base font-mono font-black text-zinc-900 mt-1">{paymentConfig.nequi_phone}</p>
                <p className="text-xs text-zinc-400 mt-0.5">Recepción sin comisión bancaria</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-zinc-200">
                <p className="text-[10px] font-black uppercase text-red-600">Daviplata</p>
                <p className="text-base font-mono font-black text-zinc-900 mt-1">{paymentConfig.daviplata_phone}</p>
                <p className="text-xs text-zinc-400 mt-0.5">Recepción directa</p>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
              <p className="font-black">💡 Cómo monetizar de forma inteligente:</p>
              <p>
                1. A las personas de tu box o amigos cercanos que invitas inicialmente, les regalas el pase con el cupón <span className="font-mono font-bold">COMBOCALI</span>.
              </p>
              <p>
                2. A los nuevos atletas que lleguen por recomendación o compartidos de WhatsApp, les ofreces el pago anual de $99.000 COP o mensual de $14.900 COP directo a tu Nequi o por link de Wompi.
              </p>
              <p>
                3. Al recibir la transferencia, buscas su correo en la pestaña "Atletas" y en 1 clic le activas el rango PRO. ¡Cero comisiones para Apple o Google!
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
