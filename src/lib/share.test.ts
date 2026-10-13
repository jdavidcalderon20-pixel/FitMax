import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  buildSquadInviteMessage, 
  buildBadgeShareMessage, 
  buildStreakShareMessage, 
  generateWhatsAppLink,
  shareContent 
} from './share';

describe('Viral Sharing Engine (WhatsApp & Native Share)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('builds squad invite message with code and app link', () => {
    const msg = buildSquadInviteMessage('Titanes Cali', 'HYR202', 'https://fitmax.app');
    expect(msg).toContain('Titanes Cali');
    expect(msg).toContain('#HYR202');
    expect(msg).toContain('https://fitmax.app');
  });

  it('builds badge share message with metal emoji', () => {
    const goldMsg = buildBadgeShareMessage('Press Militar Titan', 'gold', 'Superados 70 kg', 'HYR202', 'https://fitmax.app');
    expect(goldMsg).toContain('🥇');
    expect(goldMsg).toContain('Press Militar Titan');
    expect(goldMsg).toContain('#HYR202');

    const titMsg = buildBadgeShareMessage('Espartano Hyrox', 'titanium', 'Simulacro 28 min');
    expect(titMsg).toContain('⚡');
  });

  it('builds streak share message with consecutive days count', () => {
    const msg = buildStreakShareMessage('Carlos', 14, 'Titanes Cali', 'https://fitmax.app');
    expect(msg).toContain('14');
    expect(msg).toContain('Titanes Cali');
    expect(msg).toContain('FitMax');
  });

  it('generates encoded WhatsApp link', () => {
    const url = generateWhatsAppLink('Hola FitMax! 🔥');
    expect(url.startsWith('https://api.whatsapp.com/send?text=')).toBe(true);
    expect(url).toContain('Hola%20FitMax!%20%F0%9F%94%A5');
  });

  it('calls window.open fallback if navigator.share is unavailable', async () => {
    const originalWindow = (globalThis as any).window;
    const mockOpen = vi.fn();
    (globalThis as any).window = { open: mockOpen, location: { origin: 'https://fitmax.app' } };

    try {
      const result = await shareContent({
        title: 'FitMax',
        text: 'Entrena conmigo'
      });

      expect(mockOpen).toHaveBeenCalled();
      expect(result.method).toBe('whatsapp');
      expect(result.success).toBe(true);
    } finally {
      (globalThis as any).window = originalWindow;
    }
  });
});
