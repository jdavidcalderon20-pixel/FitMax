// Reproductor de alerta acústica mediante Web Audio API (100% offline, sin dependencias externas)
export const playBeepSound = (isMuted: boolean = false): void => {
  if (isMuted || typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();

    const playTone = (timeOffset: number, freq: number, dur: number) => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, context.currentTime + timeOffset);
      gain.gain.setValueAtTime(0.2, context.currentTime + timeOffset);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + timeOffset + dur);
      osc.connect(gain);
      gain.connect(context.destination);
      osc.start(context.currentTime + timeOffset);
      osc.stop(context.currentTime + timeOffset + dur);
    };

    // Melodía de finalización (C5 -> E5 -> G5)
    playTone(0, 523.25, 0.15);
    playTone(0.18, 659.25, 0.15);
    playTone(0.36, 783.99, 0.3);
  } catch (e) {
    console.warn('Audio playback error', e);
  }
};
