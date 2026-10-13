/**
 * Motor de Compartición y Viralidad de FitMax
 * Soporta Web Share API nativa (iOS/Android) y enlaces directos a WhatsApp Web / Móvil con fallback al portapapeles.
 */

export interface SharePayload {
  title: string;
  text: string;
  url?: string;
}

export function getAppOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return 'https://fitmax.app';
}

/**
 * Genera el texto formateado para invitar a amigos a unirse al Combo en FitMax
 */
export function buildSquadInviteMessage(squadName: string, squadCode: string, appUrl?: string): string {
  const url = appUrl || getAppOrigin();
  return `¡Hola! 👋 Te invito a entrenar conmigo en FitMax con mi combo "${squadName}".\n\n🔥 Código de invitación: #${squadCode}\n📲 Únete y clona mi rutina aquí: ${url}`;
}

/**
 * Genera el texto para presumir una medalla atlética ganada
 */
export function buildBadgeShareMessage(badgeTitle: string, metal: string, description: string, squadCode?: string, appUrl?: string): string {
  const url = appUrl || getAppOrigin();
  const metalEmoji = metal === 'titanium' ? '⚡' : metal === 'gold' ? '🥇' : metal === 'silver' ? '🥈' : '🥉';
  let msg = `¡Acabo de desbloquear la Medalla ${metalEmoji} "${badgeTitle}" en FitMax!\n\n💪 ${description}`;
  if (squadCode) {
    msg += `\n🔥 Entrena conmigo en mi combo #${squadCode}: ${url}`;
  } else {
    msg += `\n📲 Entrena conmigo en FitMax: ${url}`;
  }
  return msg;
}

/**
 * Genera el texto para compartir una racha consecutiva de entrenamiento
 */
export function buildStreakShareMessage(nickname: string, streakDays: number, squadName: string, appUrl?: string): string {
  const url = appUrl || getAppOrigin();
  return `¡Día ${streakDays} de racha consecutiva completado en FitMax con mi combo "${squadName}"! 🔥👊\n\nLa constancia no se negocia. ¿Quién más entrena hoy?\n📲 ${url}`;
}

/**
 * Genera el enlace oficial de WhatsApp para abrir en móvil o web
 */
export function generateWhatsAppLink(text: string): string {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

/**
 * Ejecuta la compartición nativa si el navegador lo soporta, o abre WhatsApp directamente.
 * Retorna true si se compartió por Web Share API o se abrió WhatsApp, o false si se copió al portapapeles.
 */
export async function shareContent(payload: SharePayload): Promise<{ method: 'native' | 'whatsapp' | 'clipboard'; success: boolean }> {
  const fullText = payload.url ? `${payload.text}\n${payload.url}` : payload.text;

  // 1. Intentar Web Share API nativa si está disponible (móviles)
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title: payload.title,
        text: payload.text,
        url: payload.url
      });
      return { method: 'native', success: true };
    } catch (err: any) {
      // Si el usuario canceló el diálogo nativo, no forzamos error
      if (err?.name === 'AbortError') {
        return { method: 'native', success: false };
      }
    }
  }

  // 2. Si es WhatsApp directo o navegador de escritorio
  const waUrl = generateWhatsAppLink(fullText);
  try {
    if (typeof window !== 'undefined') {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      return { method: 'whatsapp', success: true };
    }
  } catch (err) {
    console.error('Error abriendo WhatsApp', err);
  }

  // 3. Fallback: Copiar al portapapeles
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(fullText);
      return { method: 'clipboard', success: true };
    } catch {
      return { method: 'clipboard', success: false };
    }
  }

  return { method: 'clipboard', success: false };
}
