import { describe, it, expect } from 'vitest';
import { compressImageToWebP } from './imageCompression';

describe('imageCompression module', () => {
  it('handles image file compression gracefully with fallback in test environment', async () => {
    // Crear un archivo simulado de imagen
    const dummyContent = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]); // cabecera PNG
    const file = new File([dummyContent], 'test_run.png', { type: 'image/png' });

    const result = await compressImageToWebP(file, 1080, 0.8);

    expect(result).toBeDefined();
    expect(result.format).toBe('image/webp');
    expect(result.blob).toBeInstanceOf(Blob);
    expect(result.originalSizeKB).toBeGreaterThanOrEqual(0);
  });
});
