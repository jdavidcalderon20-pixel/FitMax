import { supabase } from './supabaseClient';

export interface CompressedImageResult {
  blob: Blob;
  dataUrl: string;
  originalSizeKB: number;
  compressedSizeKB: number;
  savingsPercentage: number;
  format: 'image/webp' | 'image/jpeg';
}

/**
 * Comprime y redimensiona cualquier imagen directamente en el navegador del atleta
 * usando la API nativa de Canvas (sin dependencias externas pesadas).
 * 
 * - Reduce imágenes pesadas de teléfonos (5-15 MB) a un WebP ultra-ligero (~60-120 KB).
 * - Máxima dimensión por defecto: 1080px (ideal para móviles y feeds deportivos).
 * - Calidad visual: 80% (óptima nitidez con máxima compresión).
 */
export async function compressImageToWebP(
  file: File,
  maxDimension: number = 1080,
  quality: number = 0.8
): Promise<CompressedImageResult> {
  const originalSizeKB = Math.round(file.size / 1024);

  return new Promise((resolve, reject) => {
    // Si no estamos en entorno de navegador (ej. tests Node)
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      const fallbackBlob = file.slice(0, file.size, 'image/webp');
      return resolve({
        blob: fallbackBlob,
        dataUrl: '',
        originalSizeKB,
        compressedSizeKB: originalSizeKB,
        savingsPercentage: 0,
        format: 'image/webp'
      });
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer el archivo de imagen.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Formato de imagen inválido o no reconocido.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Escalar proporcionalmente si excede maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('No se pudo inicializar el contexto 2D de canvas.'));
        }

        // Renderizado nítido con suavizado de alta calidad
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Intentar exportar a WebP
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Error al comprimir el lienzo de la imagen.'));
            }

            const compressedSizeKB = Math.round(blob.size / 1024);
            const savingsPercentage = originalSizeKB > 0
              ? Math.max(0, Math.round(((originalSizeKB - compressedSizeKB) / originalSizeKB) * 100))
              : 0;

            const dataUrl = canvas.toDataURL('image/webp', quality);

            resolve({
              blob,
              dataUrl,
              originalSizeKB,
              compressedSizeKB,
              savingsPercentage,
              format: 'image/webp'
            });
          },
          'image/webp',
          quality
        );
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Sube la imagen comprimida a Supabase Storage (100% gratuito en el bucket squad_media)
 * o devuelve el DataURL local si el usuario está en modo invitado/local.
 */
export async function uploadSquadImage(
  file: File,
  squadId: string,
  userId?: string
): Promise<{ url: string; compressedSizeKB: number; savingsPercentage: number }> {
  const compressed = await compressImageToWebP(file, 1080, 0.8);

  // Si hay usuario y Supabase está disponible, subir al bucket
  if (supabase && userId) {
    try {
      const fileExt = compressed.format === 'image/webp' ? 'webp' : 'jpg';
      const fileName = `${squadId}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${fileExt}`;

      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('squad_media')
        .upload(fileName, compressed.blob, {
          contentType: compressed.format,
          cacheControl: '3600',
          upsert: false
        });

      if (!uploadErr && uploadData) {
        const { data: urlData } = supabase.storage
          .from('squad_media')
          .getPublicUrl(fileName);

        return {
          url: urlData.publicUrl,
          compressedSizeKB: compressed.compressedSizeKB,
          savingsPercentage: compressed.savingsPercentage
        };
      } else {
        console.warn('Storage upload error, fallback to dataUrl:', uploadErr);
      }
    } catch (e) {
      console.warn('Upload exception, fallback to dataUrl:', e);
    }
  }

  // Fallback seguro: DataURL en Base64 para modo offline / invitado
  return {
    url: compressed.dataUrl,
    compressedSizeKB: compressed.compressedSizeKB,
    savingsPercentage: compressed.savingsPercentage
  };
}
