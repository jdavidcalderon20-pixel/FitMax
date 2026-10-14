import { supabase } from './supabaseClient';

/**
 * Bandera para pausar el flujo de monetización y pases VIP en la interfaz,
 * preservando intacta toda la lógica interna.
 */
export const ENABLE_MONETIZATION = false;

export type SubscriptionTier = 'free' | 'pro' | 'beta_lifetime';
export type SubscriptionStatus = 'active' | 'past_due' | 'trialing' | 'canceled';
export type UserRole = 'athlete' | 'admin';

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  role: UserRole;
  expiresAt: string | null;
  isPro: boolean;
}

export interface PlatformMetrics {
  total_users: number;
  free_users: number;
  pro_users: number;
  beta_users: number;
  total_squads: number;
  today_checkins: number;
  total_coupons: number;
  total_redemptions: number;
}

export interface CouponItem {
  id: string;
  code: string;
  tier: 'pro' | 'beta_lifetime';
  duration_days: number | null;
  max_uses: number;
  times_used: number;
  is_active: boolean;
  notes: string | null;
  created_at: string;
}

export interface PaymentConfig {
  monthly_cop: number;
  annual_cop: number;
  monthly_usd: number;
  annual_usd: number;
  nequi_phone: string;
  daviplata_phone: string;
  wompi_url: string;
  whatsapp: string;
}

export const DEFAULT_PAYMENT_CONFIG: PaymentConfig = {
  monthly_cop: 14900,
  annual_cop: 99000,
  monthly_usd: 3.99,
  annual_usd: 24.99,
  nequi_phone: '3001234567',
  daviplata_phone: '3001234567',
  wompi_url: '',
  whatsapp: '573001234567'
};

/**
 * Valida si un nivel de suscripción califica como PRO (acceso ilimitado a funciones premium)
 */
export function isProTier(tier?: SubscriptionTier | string | null): boolean {
  return tier === 'pro' || tier === 'beta_lifetime';
}

/**
 * Obtiene el estado de suscripción de un atleta (modo local o nube)
 */
export async function getUserSubscription(userId?: string | null): Promise<SubscriptionInfo> {
  const localTier = (typeof localStorage !== 'undefined' ? localStorage.getItem('fitmax_subscription_tier') : null) as SubscriptionTier || 'free';
  const localRole = (typeof localStorage !== 'undefined' ? localStorage.getItem('fitmax_user_role') : null) as UserRole || 'athlete';

  if (!supabase || !userId) {
    return {
      tier: localTier,
      status: 'active',
      role: localRole,
      expiresAt: null,
      isPro: isProTier(localTier)
    };
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status, role, subscription_expires_at')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return {
        tier: localTier,
        status: 'active',
        role: localRole,
        expiresAt: null,
        isPro: isProTier(localTier)
      };
    }

    const tier = (data.subscription_tier as SubscriptionTier) || 'free';
    const role = (data.role as UserRole) || 'athlete';

    // Sincronizar con almacenamiento local para acceso offline fluido
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('fitmax_subscription_tier', tier);
      localStorage.setItem('fitmax_user_role', role);
    }

    return {
      tier,
      status: (data.subscription_status as SubscriptionStatus) || 'active',
      role,
      expiresAt: data.subscription_expires_at ?? null,
      isPro: isProTier(tier)
    };
  } catch (err) {
    console.error('Error fetching user subscription:', err);
    return {
      tier: localTier,
      status: 'active',
      role: localRole,
      expiresAt: null,
      isPro: isProTier(localTier)
    };
  }
}

/**
 * Canjea un cupón promocional o pase VIP para desbloquear FitMax Pro / Beta Lifetime
 */
export async function redeemCoupon(
  code: string,
  userId?: string | null
): Promise<{ success: boolean; message: string; tier?: SubscriptionTier }> {
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) {
    return { success: false, message: 'Por favor ingresa un código de cupón válido.' };
  }

  // Si hay sesión en Supabase activa, canjeamos en el backend seguro
  if (supabase && userId) {
    try {
      const { data, error } = await supabase.rpc('redeem_coupon', { p_code: cleanCode });
      if (error) {
        return { success: false, message: error.message || 'No fue posible canjear el cupón.' };
      }
      const response = data as { success: boolean; tier: SubscriptionTier; message: string };
      if (typeof localStorage !== 'undefined' && response.tier) {
        localStorage.setItem('fitmax_subscription_tier', response.tier);
      }
      return {
        success: true,
        message: response.message || `¡Cupón ${cleanCode} canjeado con éxito!`,
        tier: response.tier
      };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Error de conexión canjeando el cupón.' };
    }
  }

  // Fallback para modo local / offline (cupones oficiales de lanzamiento)
  const localValidCodes: Record<string, SubscriptionTier> = {
    COMBOCALI: 'beta_lifetime',
    FITMAXVIP: 'beta_lifetime',
    BETALIFETIME: 'beta_lifetime',
    PRO2026: 'pro'
  };

  if (localValidCodes[cleanCode]) {
    const tier = localValidCodes[cleanCode];
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('fitmax_subscription_tier', tier);
    }
    return {
      success: true,
      message: `¡Cupón ${cleanCode} activado localmente! Disfruta de FitMax ${tier === 'beta_lifetime' ? 'Beta Lifetime' : 'PRO'}.`,
      tier
    };
  }

  return { success: false, message: 'El código de cupón no es válido o ha expirado.' };
}

/**
 * Solicita el reclamo de rol de Administrador para el propietario
 */
export async function claimAdminRole(
  secretKey: string,
  userId?: string | null
): Promise<{ success: boolean; message: string }> {
  const clean = secretKey.trim();
  if (!clean) return { success: false, message: 'Ingresa la clave de administración.' };

  if (supabase && userId) {
    try {
      const { data, error } = await supabase.rpc('claim_admin_role', { p_secret: clean });
      if (error) return { success: false, message: error.message };
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('fitmax_user_role', 'admin');
        localStorage.setItem('fitmax_subscription_tier', 'beta_lifetime');
      }
      return { success: true, message: (data as any)?.message || '¡Rol de Administrador concedido!' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Error al validar rol de administrador.' };
    }
  }

  // Fallback modo local
  if (clean === 'FITMAX_ADMIN_2026' || clean === 'COMBOCALI') {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('fitmax_user_role', 'admin');
      localStorage.setItem('fitmax_subscription_tier', 'beta_lifetime');
    }
    return { success: true, message: '¡Modo Administrador activado en este navegador!' };
  }

  return { success: false, message: 'Clave de administración incorrecta.' };
}

/**
 * Obtiene las métricas de la plataforma para el panel administrativo
 */
export async function getPlatformMetrics(): Promise<PlatformMetrics> {
  const defaultMetrics: PlatformMetrics = {
    total_users: 1,
    free_users: 0,
    pro_users: 0,
    beta_users: 1,
    total_squads: 1,
    today_checkins: 1,
    total_coupons: 3,
    total_redemptions: 0
  };

  if (!supabase) return defaultMetrics;

  try {
    const { data, error } = await supabase.rpc('admin_get_platform_metrics');
    if (!error && data) {
      return data as PlatformMetrics;
    }
  } catch (err) {
    console.error('Error fetching admin metrics:', err);
  }

  // Fallback contando directamente
  try {
    const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: squadsCount } = await supabase.from('squads').select('*', { count: 'exact', head: true });
    const { count: couponsCount } = await supabase.from('coupons').select('*', { count: 'exact', head: true });

    return {
      ...defaultMetrics,
      total_users: usersCount || 1,
      total_squads: squadsCount || 0,
      total_coupons: couponsCount || 3
    };
  } catch {
    return defaultMetrics;
  }
}

/**
 * Lista todos los perfiles de usuarios para gestión administrativa
 */
export async function listAllProfiles(): Promise<any[]> {
  if (!supabase) {
    const localNick = (typeof localStorage !== 'undefined' ? localStorage.getItem('fit_gen_nickname') : null) || 'Invitado';
    const localTier = (typeof localStorage !== 'undefined' ? localStorage.getItem('fitmax_subscription_tier') : null) || 'free';
    const localRole = (typeof localStorage !== 'undefined' ? localStorage.getItem('fitmax_user_role') : null) || 'athlete';
    return [
      {
        id: 'local-owner',
        nickname: localNick,
        email: 'propietario@fitmax.local',
        role: localRole,
        subscription_tier: localTier,
        subscription_status: 'active',
        created_at: new Date().toISOString()
      }
    ];
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, nickname, email, role, selected_level, subscription_tier, subscription_status, subscription_expires_at, created_at')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data;
  } catch (err) {
    console.error('Error listing profiles:', err);
    return [];
  }
}

/**
 * Actualiza el tier o rol de un atleta desde el panel de administración
 */
export async function adminUpdateUserSubscription(
  targetUserId: string,
  tier: SubscriptionTier,
  role?: UserRole
): Promise<boolean> {
  if (!supabase) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('fitmax_subscription_tier', tier);
      if (role) localStorage.setItem('fitmax_user_role', role);
    }
    return true;
  }

  try {
    const { error } = await supabase.rpc('admin_set_user_subscription', {
      p_target_user_id: targetUserId,
      p_tier: tier,
      p_role: role || null
    });
    return !error;
  } catch (err) {
    console.error('Error updating user subscription:', err);
    return false;
  }
}

/**
 * Lista los cupones activos y creados
 */
export async function listCoupons(): Promise<CouponItem[]> {
  if (!supabase) {
    return [
      {
        id: 'c1',
        code: 'COMBOCALI',
        tier: 'beta_lifetime',
        duration_days: null,
        max_uses: 100,
        times_used: 0,
        is_active: true,
        notes: 'Cupón de bienvenida para combos de prueba',
        created_at: new Date().toISOString()
      },
      {
        id: 'c2',
        code: 'FITMAXVIP',
        tier: 'beta_lifetime',
        duration_days: null,
        max_uses: 100,
        times_used: 0,
        is_active: true,
        notes: 'Cupón VIP vitalicio para fundadores',
        created_at: new Date().toISOString()
      }
    ];
  }

  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as CouponItem[];
  } catch (err) {
    console.error('Error listing coupons:', err);
    return [];
  }
}

/**
 * Crea un nuevo cupón desde el panel administrativo
 */
export async function createCoupon(coupon: {
  code: string;
  tier: 'pro' | 'beta_lifetime';
  max_uses: number;
  duration_days?: number | null;
  notes?: string;
}): Promise<{ success: boolean; message: string }> {
  const cleanCode = coupon.code.trim().toUpperCase();
  if (!cleanCode) return { success: false, message: 'El código del cupón es requerido.' };

  if (!supabase) {
    return { success: true, message: `Cupón ${cleanCode} registrado en modo local.` };
  }

  try {
    const { error } = await supabase.from('coupons').insert({
      code: cleanCode,
      tier: coupon.tier,
      max_uses: coupon.max_uses || 50,
      duration_days: coupon.duration_days || null,
      notes: coupon.notes || null,
      is_active: true
    });

    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, message: `Cupón ${cleanCode} creado con éxito.` };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Error creando el cupón.' };
  }
}

/**
 * Activa o desactiva un cupón
 */
export async function toggleCouponActive(couponId: string, isActive: boolean): Promise<boolean> {
  if (!supabase) return true;
  try {
    const { error } = await supabase
      .from('coupons')
      .update({ is_active: isActive })
      .eq('id', couponId);
    return !error;
  } catch (err) {
    console.error('Error toggling coupon:', err);
    return false;
  }
}
