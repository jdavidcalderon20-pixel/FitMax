export type SoftWallTrigger = 'join_squad' | 'share_routine' | 'upload_photo' | 'cloud_sync';

export interface SoftWallTriggerDetails {
  title: string;
  subtitle: string;
  benefit: string;
  badge: string;
}

/**
 * Textos persuasivos y de propuesta de valor para el "Modo Puerta Abierta" (Soft Wall) en FitMax.
 * En lugar de bloquear al usuario, explican el beneficio directo de sincronizarse con su combo.
 */
export function getSoftWallTriggerDetails(trigger: SoftWallTrigger): SoftWallTriggerDetails {
  switch (trigger) {
    case 'join_squad':
      return {
        badge: 'Mi Combo & Nube',
        title: 'Unirme al Combo de mi Box',
        subtitle: 'Para sincronizarte con tu combo y que tus compañeros vean tus marcas y rachas diarias en vivo, ingresa tu correo en 5 segundos.',
        benefit: 'Tu combo verá tu asistencia diaria y tus medallas conseguidas'
      };
    case 'share_routine':
      return {
        badge: 'Mi Combo & Nube',
        title: 'Compartir mi rutina con mi compañero de Hyrox',
        subtitle: 'Para que tu compañero de Hyrox o gimnasio pueda clonar tu rutina en su teléfono y entrenar exactamente lo mismo.',
        benefit: 'Clonado automático de tus 4 días de mesociclo al móvil de tu amigo'
      };
    case 'upload_photo':
      return {
        badge: 'Mi Combo & Nube',
        title: 'Subir una foto al muro del reto',
        subtitle: 'Para que los del combo vean la foto de tu sesión, reaccionen con fuego y celebren el entreno juntos en la nube.',
        benefit: 'Fotos optimizadas en WebP con reacciones de puño y fuego en tiempo real'
      };
    case 'cloud_sync':
    default:
      return {
        badge: 'FitMax Nube',
        title: 'Sincronízate con tu Combo',
        subtitle: 'Para sincronizarte con tu combo y que tus compañeros vean tus marcas, ingresa tu correo en 5 segundos.',
        benefit: 'Acceso desde cualquier móvil, tablet o PC sin contraseñas'
      };
  }
}
