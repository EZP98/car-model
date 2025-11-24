/**
 * Script per eliminare le vecchie immagini JPG/PNG da R2
 * Mantiene solo le immagini WebP
 */

import { execSync } from 'child_process';

// Lista delle vecchie immagini da eliminare (basata sui path originali della migrazione)
const oldImages = [
  'images/1763545054997-DSCF2409.jpg',
  'images/1763549865233-DSCF2410.jpg',
  'images/1763550617754-DSCF0406.jpg',
  'images/DSCF2012.jpg',
  'images/DSCF2104.jpg',
  'images/DSCF9079.jpg',
  'images/adele.jpg',
  'images/evento-locandina.png',
  'images/evento-poster.png',
  'images/opera.png',
  'images/parallax-image.jpg',
];

const R2_BUCKET = 'adele-lo-feudo-images';

console.log('🗑️  Cleanup vecchie immagini JPG/PNG da R2');
console.log('==========================================\n');

let deleted = 0;
let failed = 0;

for (const imagePath of oldImages) {
  try {
    console.log(`🗑️  Eliminando: ${imagePath}`);

    // Formato corretto: {bucket}/{key}
    const objectPath = `${R2_BUCKET}/${imagePath}`;

    execSync(`wrangler r2 object delete ${objectPath} --remote`, {
      encoding: 'utf-8',
      stdio: 'pipe'
    });

    console.log(`   ✅ Eliminato con successo`);
    deleted++;
  } catch (error: any) {
    console.error(`   ❌ Errore: ${error.message}`);
    failed++;
  }
}

console.log('\n==========================================');
console.log('📊 RIEPILOGO CLEANUP');
console.log('==========================================');
console.log(`✅ Eliminati: ${deleted}`);
console.log(`❌ Falliti: ${failed}`);
console.log(`📁 Totale processati: ${oldImages.length}`);
console.log('\n✅ Cleanup completato!');
