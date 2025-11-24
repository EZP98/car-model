/**
 * Script di Migrazione Immagini R2 → WebP
 *
 * Questo script migra tutte le immagini esistenti nel bucket R2
 * dal formato originale (JPG/PNG) al formato WebP ottimizzato.
 *
 * FUNZIONALITÀ:
 * 1. Lista tutti gli oggetti nel bucket R2
 * 2. Filtra solo le immagini (JPG, PNG, JPEG)
 * 3. Per ogni immagine:
 *    - Download dal bucket
 *    - Conversione in WebP (qualità 95%)
 *    - Ridimensionamento se > 2500px
 *    - Upload del file WebP
 *    - Aggiornamento del database
 *
 * PREREQUISITI:
 * - Wrangler configurato e autenticato
 * - R2 bucket: adele-lo-feudo-images
 * - D1 database: alf-portfolio-db
 *
 * USO:
 * npx tsx scripts/migrate-images-to-webp.ts
 *
 * OPZIONI:
 * --dry-run : Simula la migrazione senza modificare nulla
 * --limit N : Processa solo N immagini (per test)
 */

import sharp from 'sharp';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// ========================================
// CONFIGURAZIONE
// ========================================

const R2_BUCKET = 'adele-lo-feudo-images';
const WEBP_QUALITY = 95;
const MAX_WIDTH = 2500;

// Parse arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const limitIndex = args.findIndex(arg => arg === '--limit');
const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1]) : undefined;

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Esegue un comando wrangler e ritorna l'output
 */
function runWrangler(command: string): string {
  try {
    const output = execSync(`wrangler ${command}`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return output;
  } catch (error: any) {
    console.error(`❌ Errore eseguendo wrangler: ${error.message}`);
    throw error;
  }
}

/**
 * Ottiene tutti i path delle immagini dal database D1
 */
function getImagePathsFromDatabase(): string[] {
  console.log('📋 Fetching image paths from database...');

  try {
    // Query SQL inline (con --command invece di --file per ottenere i dati)
    const sql = 'SELECT DISTINCT image_url FROM collections WHERE image_url IS NOT NULL UNION SELECT DISTINCT image_url FROM artworks WHERE image_url IS NOT NULL';

    // Esegui query su D1 REMOTO con --command
    const command = `d1 execute alf-portfolio-db --remote --json --command "${sql}"`;
    const output = runWrangler(command);

    // Estrai solo la parte JSON dall'output di wrangler (ignora i log)
    // Il JSON inizia con '[' e finisce con ']'
    const jsonMatch = output.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('❌ No JSON found in wrangler output');
      return [];
    }

    // Parse output
    const result = JSON.parse(jsonMatch[0]);

    // Estrai i path delle immagini (formato può variare)
    const paths: string[] = [];

    // result è un array di oggetti con "results"
    if (Array.isArray(result)) {
      for (const item of result) {
        if (item.results && Array.isArray(item.results)) {
          for (const row of item.results) {
            if (row.image_url) {
              paths.push(row.image_url);
            }
          }
        }
      }
    }

    return paths;
  } catch (error) {
    console.error('❌ Failed to fetch images from database:', error);
    return [];
  }
}

/**
 * Filtra solo le immagini (JPG, PNG, JPEG)
 */
function filterImages(keys: string[]): string[] {
  return keys.filter(key => {
    const ext = path.extname(key).toLowerCase();
    return ['.jpg', '.jpeg', '.png'].includes(ext) && !key.includes('_thumb');
  });
}

/**
 * Scarica un'immagine dall'URL pubblico
 * Le immagini sono servite dal worker API
 */
async function downloadImage(imageUrl: string, outputPath: string): Promise<boolean> {
  try {
    // Costruisci l'URL completo
    // Se l'URL è relativo, usa l'API base URL di produzione
    const API_URL = process.env.VITE_API_URL || 'https://alf-portfolio-api.eziopappalardo98.workers.dev';
    const fullUrl = imageUrl.startsWith('http') ? imageUrl : `${API_URL}${imageUrl}`;

    console.log(`   📥 Downloading from: ${fullUrl}`);

    // Download usando fetch
    const response = await fetch(fullUrl);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Salva il file
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(outputPath, buffer);

    return true;
  } catch (error) {
    console.error(`❌ Failed to download ${imageUrl}:`, error);
    return false;
  }
}

/**
 * Upload di un file nel bucket R2 tramite API del worker
 */
async function uploadToR2(filePath: string, newImageUrl: string): Promise<boolean> {
  try {
    const API_URL = process.env.VITE_API_URL || 'https://alf-portfolio-api.eziopappalardo98.workers.dev';
    const API_KEY = process.env.VITE_API_KEY || 'alf_api_1388ace7aebbd1676b3d56eb91b4f31e96dcace06ac451d686957774f9fa2a08';

    // Leggi il file
    const fileBuffer = fs.readFileSync(filePath);
    const blob = new Blob([fileBuffer], { type: 'image/webp' });

    // Crea FormData
    const formData = new FormData();
    formData.append('file', blob, path.basename(newImageUrl));

    console.log(`   📤 Uploading to: ${API_URL}/api/upload`);

    // Upload tramite API con autenticazione
    const response = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    const result = await response.json();
    console.log(`   ✅ Uploaded successfully: ${result.url}`);

    return true;
  } catch (error) {
    console.error(`❌ Failed to upload:`, error);
    return false;
  }
}

/**
 * Converte un'immagine in WebP usando sharp
 */
async function convertToWebP(
  inputPath: string,
  outputPath: string
): Promise<{ success: boolean; originalSize: number; webpSize: number }> {
  try {
    const originalSize = fs.statSync(inputPath).size;

    // Leggi metadati immagine
    const metadata = await sharp(inputPath).metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;

    // Calcola nuove dimensioni se necessario
    let newWidth = width;
    let newHeight = height;

    if (width > MAX_WIDTH) {
      newWidth = MAX_WIDTH;
      newHeight = Math.round((height * MAX_WIDTH) / width);
      console.log(`   📐 Ridimensionamento: ${width}x${height} → ${newWidth}x${newHeight}`);
    }

    // Converti in WebP
    await sharp(inputPath)
      .resize(newWidth, newHeight, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: WEBP_QUALITY })
      .toFile(outputPath);

    const webpSize = fs.statSync(outputPath).size;

    return {
      success: true,
      originalSize,
      webpSize
    };
  } catch (error) {
    console.error(`❌ Conversione fallita:`, error);
    return {
      success: false,
      originalSize: 0,
      webpSize: 0
    };
  }
}

/**
 * Aggiorna il path dell'immagine nel database D1
 */
async function updateDatabase(oldPath: string, newPath: string): Promise<boolean> {
  try {
    // Crea un file SQL temporaneo per l'update
    const sqlFile = `/tmp/update-${Date.now()}.sql`;
    const sql = `
      -- Aggiorna collections
      UPDATE collections
      SET image_url = REPLACE(image_url, '${oldPath}', '${newPath}')
      WHERE image_url LIKE '%${oldPath}%';

      -- Aggiorna artworks
      UPDATE artworks
      SET image_url = REPLACE(image_url, '${oldPath}', '${newPath}')
      WHERE image_url LIKE '%${oldPath}%';
    `;

    fs.writeFileSync(sqlFile, sql);

    // Esegui SQL su D1 REMOTO
    const command = `d1 execute alf-portfolio-db --remote --file="${sqlFile}"`;
    runWrangler(command);

    // Cleanup
    fs.unlinkSync(sqlFile);

    return true;
  } catch (error) {
    console.error(`❌ Database update failed:`, error);
    return false;
  }
}

/**
 * Formatta bytes in formato leggibile
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// ========================================
// MAIN MIGRATION LOGIC
// ========================================

async function migrateImage(key: string): Promise<{
  success: boolean;
  originalSize: number;
  webpSize: number;
  savings: number;
}> {
  console.log(`\n🔄 Processing: ${key}`);

  // Crea directory temporanea
  const tempDir = '/tmp/r2-migration';
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  // Path temporanei
  const originalPath = path.join(tempDir, path.basename(key));
  const webpPath = path.join(tempDir, path.basename(key, path.extname(key)) + '.webp');

  try {
    // 1. Download immagine originale dall'URL
    console.log('   📥 Downloading image...');
    const downloadSuccess = await downloadImage(key, originalPath);
    if (!downloadSuccess) {
      return { success: false, originalSize: 0, webpSize: 0, savings: 0 };
    }

    // 2. Converti in WebP
    console.log('   🎨 Converting to WebP...');
    const { success, originalSize, webpSize } = await convertToWebP(originalPath, webpPath);
    if (!success) {
      return { success: false, originalSize: 0, webpSize: 0, savings: 0 };
    }

    const savings = ((1 - webpSize / originalSize) * 100).toFixed(1);
    console.log(`   💾 Original: ${formatBytes(originalSize)}`);
    console.log(`   💾 WebP: ${formatBytes(webpSize)}`);
    console.log(`   💰 Savings: ${savings}%`);

    if (isDryRun) {
      console.log('   🔍 DRY RUN: Skipping upload and database update');
    } else {
      // 3. Upload WebP su R2
      const newKey = key.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      console.log(`   📤 Uploading to R2 as: ${newKey}`);
      const uploadSuccess = await uploadToR2(webpPath, newKey);

      if (!uploadSuccess) {
        return { success: false, originalSize, webpSize, savings: parseFloat(savings) };
      }

      // 4. Aggiorna database
      console.log('   🗄️  Updating database...');
      await updateDatabase(key, newKey);

      console.log('   ✅ Migration completed successfully!');
    }

    // Cleanup files temporanei
    fs.unlinkSync(originalPath);
    fs.unlinkSync(webpPath);

    return {
      success: true,
      originalSize,
      webpSize,
      savings: parseFloat(savings)
    };

  } catch (error) {
    console.error(`   ❌ Error:`, error);

    // Cleanup in caso di errore
    if (fs.existsSync(originalPath)) fs.unlinkSync(originalPath);
    if (fs.existsSync(webpPath)) fs.unlinkSync(webpPath);

    return { success: false, originalSize: 0, webpSize: 0, savings: 0 };
  }
}

// ========================================
// MAIN SCRIPT
// ========================================

async function main() {
  console.log('🚀 R2 Image Migration to WebP');
  console.log('================================\n');

  if (isDryRun) {
    console.log('🔍 DRY RUN MODE: No changes will be made\n');
  }

  if (limit) {
    console.log(`⚠️  LIMIT MODE: Processing only ${limit} images\n`);
  }

  // 1. Ottieni tutti i path delle immagini dal database
  const allPaths = getImagePathsFromDatabase();
  console.log(`📁 Total image paths in database: ${allPaths.length}`);

  // 2. Filtra solo le immagini non-WebP (JPG, PNG, JPEG)
  const imageKeys = filterImages(allPaths);
  console.log(`🖼️  Images to migrate: ${imageKeys.length}`);

  // 3. Applica limit se specificato
  const keysToProcess = limit ? imageKeys.slice(0, limit) : imageKeys;
  console.log(`📊 Processing: ${keysToProcess.length} images\n`);

  // 4. Statistiche
  let successCount = 0;
  let failCount = 0;
  let totalOriginalSize = 0;
  let totalWebPSize = 0;

  // 5. Processa ogni immagine
  for (const key of keysToProcess) {
    const result = await migrateImage(key);

    if (result.success) {
      successCount++;
      totalOriginalSize += result.originalSize;
      totalWebPSize += result.webpSize;
    } else {
      failCount++;
    }
  }

  // 6. Report finale
  console.log('\n================================');
  console.log('📊 MIGRATION SUMMARY');
  console.log('================================');
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`💾 Original size: ${formatBytes(totalOriginalSize)}`);
  console.log(`💾 WebP size: ${formatBytes(totalWebPSize)}`);

  if (totalOriginalSize > 0) {
    const totalSavings = ((1 - totalWebPSize / totalOriginalSize) * 100).toFixed(1);
    console.log(`💰 Total savings: ${totalSavings}%`);
    console.log(`💰 Bytes saved: ${formatBytes(totalOriginalSize - totalWebPSize)}`);
  }

  if (isDryRun) {
    console.log('\n🔍 This was a DRY RUN - no changes were made');
    console.log('Run without --dry-run to perform actual migration');
  }

  console.log('\n✅ Migration completed!');
}

// Esegui lo script
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
