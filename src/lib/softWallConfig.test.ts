import { describe, it, expect } from 'vitest';
import { getSoftWallTriggerDetails } from './softWallConfig';

describe('Soft Wall Strategy («Modo Puerta Abierta») en FitMax', () => {
  it('provides exact copy and benefits for "join_squad"', () => {
    const details = getSoftWallTriggerDetails('join_squad');
    expect(details.title).toBe('Unirme al Combo de mi Box');
    expect(details.subtitle).toContain('Para sincronizarte con tu combo y que tus compañeros vean tus marcas');
    expect(details.benefit).toContain('asistencia diaria y tus medallas');
  });

  it('provides exact copy and benefits for "share_routine"', () => {
    const details = getSoftWallTriggerDetails('share_routine');
    expect(details.title).toBe('Compartir mi rutina con mi compañero de Hyrox');
    expect(details.subtitle).toContain('pueda clonar tu rutina en su teléfono');
    expect(details.benefit).toContain('Clonado automático');
  });

  it('provides exact copy and benefits for "upload_photo"', () => {
    const details = getSoftWallTriggerDetails('upload_photo');
    expect(details.title).toBe('Subir una foto al muro del reto');
    expect(details.subtitle).toContain('reaccionen con fuego y celebren el entreno');
    expect(details.benefit).toContain('WebP');
  });

  it('provides exact copy and benefits for "cloud_sync"', () => {
    const details = getSoftWallTriggerDetails('cloud_sync');
    expect(details.title).toBe('Sincronízate con tu Combo');
    expect(details.subtitle).toBe('Para sincronizarte con tu combo y que tus compañeros vean tus marcas, ingresa tu correo en 5 segundos.');
    expect(details.benefit).toContain('sin contraseñas');
  });

  it('falls back safely to cloud sync details on unknown triggers', () => {
    const details = getSoftWallTriggerDetails('unknown' as any);
    expect(details.title).toBe('Sincronízate con tu Combo');
  });
});
