/**
 * Image Optimization Utilities
 *
 * Funzioni per ottimizzare le immagini caricate:
 * - Conversione in WebP (formato moderno, più leggero)
 * - Ridimensionamento intelligente
 * - Compressione con qualità configurabile
 *
 * Usato in: MediaStorage, CollectionManagement, OperaForm
 */

// ========================================
// CONFIGURAZIONE
// ========================================

/**
 * Qualità WebP per immagini web (1-100)
 * 95 = Qualità perfetta, indistinguibile da originale
 * Usato per opere d'arte sul sito pubblico
 */
export const WEBP_QUALITY_HIGH = 95;

/**
 * Larghezza massima per immagini web (in pixel)
 * 2500px = Alta risoluzione, ottima per opere d'arte
 * Immagini più grandi vengono ridimensionate mantenendo aspect ratio
 */
export const MAX_WIDTH_WEB = 2500;

/**
 * Qualità WebP per thumbnail (1-100)
 * 85 = Ottima qualità, perfetta per anteprime
 */
export const WEBP_QUALITY_THUMB = 85;

/**
 * Dimensione massima per thumbnail (in pixel)
 * 400px = Dimensione ideale per griglie di anteprima
 */
export const MAX_SIZE_THUMB = 400;

// ========================================
// FUNZIONI PRINCIPALI
// ========================================

/**
 * Ottimizza un'immagine per il web
 *
 * Converte in WebP con qualità alta (95%)
 * Ridimensiona se supera 2500px di larghezza
 * Mantiene aspect ratio originale
 *
 * @param file File immagine originale (JPG, PNG, etc.)
 * @returns Promise<File> File WebP ottimizzato
 *
 * @example
 * const originalFile = e.target.files[0]; // 5 MB JPG
 * const optimizedFile = await optimizeImageForWeb(originalFile); // ~1.5 MB WebP
 */
export const optimizeImageForWeb = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Crea canvas per elaborazione
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Calcola dimensioni finali mantenendo aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH_WEB) {
          // Ridimensiona proporzionalmente
          height = (height * MAX_WIDTH_WEB) / width;
          width = MAX_WIDTH_WEB;
          console.log(`📐 Ridimensionamento: ${img.width}x${img.height} → ${width}x${height}`);
        }

        canvas.width = width;
        canvas.height = height;

        // Disegna immagine ottimizzata
        ctx.drawImage(img, 0, 0, width, height);

        // Converti in WebP con qualità alta
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Crea nuovo file con estensione .webp
              const originalName = file.name.replace(/\.(jpg|jpeg|png|gif)$/i, '');
              const webpFile = new File(
                [blob],
                `${originalName}.webp`,
                { type: 'image/webp' }
              );

              const originalSize = file.size;
              const optimizedSize = blob.size;
              const savings = ((1 - optimizedSize / originalSize) * 100).toFixed(1);

              console.log('✅ Ottimizzazione completata:');
              console.log(`   📦 Dimensione originale: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
              console.log(`   📦 Dimensione ottimizzata: ${(optimizedSize / 1024 / 1024).toFixed(2)} MB`);
              console.log(`   💰 Risparmio: ${savings}%`);

              resolve(webpFile);
            } else {
              reject(new Error('Failed to create WebP blob'));
            }
          },
          'image/webp',
          WEBP_QUALITY_HIGH / 100 // Canvas usa 0-1, noi usiamo 1-100
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Crea un thumbnail ottimizzato
 *
 * Ridimensiona a max 400px mantenendo aspect ratio
 * Converte in WebP con qualità 85%
 *
 * @param file File immagine originale o già ottimizzato
 * @returns Promise<File> File thumbnail WebP
 *
 * @example
 * const thumbnail = await createThumbnail(originalFile); // ~80 KB WebP
 */
export const createThumbnail = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Calcola dimensioni thumbnail mantenendo aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE_THUMB) {
            height = (height * MAX_SIZE_THUMB) / width;
            width = MAX_SIZE_THUMB;
          }
        } else {
          if (height > MAX_SIZE_THUMB) {
            width = (width * MAX_SIZE_THUMB) / height;
            height = MAX_SIZE_THUMB;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Converti in WebP
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Nome file con suffisso _thumb
              const originalName = file.name.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
              const thumbnailFile = new File(
                [blob],
                `${originalName}_thumb.webp`,
                { type: 'image/webp' }
              );

              resolve(thumbnailFile);
            } else {
              reject(new Error('Failed to create thumbnail blob'));
            }
          },
          'image/webp',
          WEBP_QUALITY_THUMB / 100
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Ottimizza un'immagine completa di originale + thumbnail
 *
 * Funzione all-in-one che:
 * 1. Ottimizza l'immagine originale in WebP alta qualità
 * 2. Crea thumbnail WebP
 * 3. Ritorna entrambi i file pronti per l'upload
 *
 * @param file File immagine originale
 * @returns Promise<{optimized: File, thumbnail: File}>
 *
 * @example
 * const { optimized, thumbnail } = await optimizeImageComplete(file);
 * // Upload optimized su R2 → usato dal frontend
 * // Upload thumbnail su R2 → usato nel backoffice
 */
export const optimizeImageComplete = async (file: File): Promise<{
  optimized: File;
  thumbnail: File;
}> => {
  console.log(`🚀 Ottimizzazione completa di: ${file.name}`);
  console.time('⏱️ Ottimizzazione totale');

  try {
    // Ottimizza originale in parallelo con creazione thumbnail
    const [optimized, thumbnail] = await Promise.all([
      optimizeImageForWeb(file),
      createThumbnail(file)
    ]);

    console.timeEnd('⏱️ Ottimizzazione totale');

    return { optimized, thumbnail };
  } catch (error) {
    console.error('❌ Errore durante ottimizzazione:', error);
    throw error;
  }
};

// ========================================
// FUNZIONI DI UTILITÀ
// ========================================

/**
 * Verifica se un file è un'immagine valida
 */
export const isValidImage = (file: File): boolean => {
  return file.type.startsWith('image/');
};

/**
 * Formatta le dimensioni del file in formato leggibile
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

/**
 * Calcola il risparmio percentuale tra due dimensioni
 */
export const calculateSavings = (originalSize: number, optimizedSize: number): number => {
  return parseFloat(((1 - optimizedSize / originalSize) * 100).toFixed(1));
};
