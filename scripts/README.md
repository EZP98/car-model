# Script di Migrazione Immagini R2 → WebP

Questo script automatizza la migrazione di tutte le immagini esistenti nel bucket R2 Cloudflare dal formato originale (JPG/PNG) al formato WebP ottimizzato.

## Cosa Fa lo Script

1. **Lista** tutti gli oggetti nel bucket R2 `adele-lo-feudo-images`
2. **Filtra** solo le immagini (JPG, PNG, JPEG)
3. Per ogni immagine:
   - Download dal bucket R2
   - Conversione in WebP con qualità 95%
   - Ridimensionamento se larghezza > 2500px
   - Upload del file WebP ottimizzato
   - Aggiornamento dei path nel database D1

## Prerequisiti

- Wrangler CLI installato e autenticato
- Accesso al bucket R2: `adele-lo-feudo-images`
- Accesso al database D1: `alf-portfolio-db`
- Sharp installato (già incluso in devDependencies)

## Comandi Disponibili

### 1. Test Dry Run (Consigliato Prima)

```bash
npm run migrate:dry-run
```

Simula la migrazione senza modificare nulla. Mostra:
- Quante immagini verranno migrate
- Dimensioni originali vs WebP
- Risparmio stimato in %

### 2. Test su 5 Immagini

```bash
npm run migrate:test
```

Esegue un dry-run limitato alle prime 5 immagini. Perfetto per verificare che tutto funzioni correttamente prima della migrazione completa.

### 3. Migrazione Completa

```bash
npm run migrate:webp
```

⚠️ **ATTENZIONE**: Questo comando modifica effettivamente:
- File nel bucket R2
- Records nel database D1

Assicurati di:
1. Aver eseguito il dry-run prima
2. Avere un backup del database
3. Essere sicuro di voler procedere

## Output di Esempio

```
🚀 R2 Image Migration to WebP
================================

📋 Listing objects in R2 bucket...
📁 Total objects in bucket: 47
🖼️  Images to migrate: 23
📊 Processing: 23 images

🔄 Processing: images/collection-1.jpg
   📥 Downloading from R2...
   🎨 Converting to WebP...
   📐 Ridimensionamento: 3200x2400 → 2500x1875
   💾 Original: 2.35 MB
   💾 WebP: 0.89 MB
   💰 Savings: 62.1%
   📤 Uploading to R2 as: images/collection-1.webp
   🗄️  Updating database...
   ✅ Migration completed successfully!

================================
📊 MIGRATION SUMMARY
================================
✅ Success: 23
❌ Failed: 0
💾 Original size: 45.67 MB
💾 WebP size: 16.23 MB
💰 Total savings: 64.5%
💰 Bytes saved: 29.44 MB

✅ Migration completed!
```

## Opzioni Avanzate

### Limitare il Numero di Immagini

```bash
npx tsx scripts/migrate-images-to-webp.ts --dry-run --limit 10
```

Processa solo le prime 10 immagini (utile per test incrementali).

### Solo Dry Run Completo

```bash
npx tsx scripts/migrate-images-to-webp.ts --dry-run
```

Analizza tutte le immagini senza modificare nulla.

## Cosa Viene Aggiornato nel Database

Lo script aggiorna automaticamente questi campi:

### Tabella `collections`
- `image_url`: Cambiato da `/images/foo.jpg` a `/images/foo.webp`

### Tabella `artworks`
- `image_url`: Cambiato da `/images/bar.png` a `/images/bar.webp`

## Troubleshooting

### Errore: "wrangler: command not found"

Installa Wrangler globalmente:
```bash
npm install -g wrangler
```

Oppure usa npx:
```bash
npx wrangler login
```

### Errore: "Unauthorized"

Assicurati di essere autenticato:
```bash
wrangler login
```

### Errore: "Sharp module not found"

Reinstalla le dipendenze:
```bash
npm install
```

### La migrazione si blocca

Lo script processa le immagini una alla volta per evitare sovraccarichi. Per immagini molto grandi, il processo può richiedere alcuni minuti.

## Best Practices

1. **Sempre dry-run prima**: Esegui `npm run migrate:dry-run` per vedere cosa succederà
2. **Test incrementale**: Usa `npm run migrate:test` per testare su poche immagini
3. **Backup del database**: Crea un backup prima della migrazione completa
4. **Monitora lo spazio R2**: Dopo la migrazione, puoi eliminare manualmente le immagini originali per risparmiare spazio
5. **Verifica il sito**: Controlla che tutte le immagini vengano visualizzate correttamente dopo la migrazione

## Note Tecniche

- **Qualità WebP**: 95% (identica all'originale)
- **Max larghezza**: 2500px (ridimensionamento proporzionale)
- **Formato output**: `.webp`
- **Thumbnail**: Non vengono processati (già gestiti separatamente)
- **Risparmio medio atteso**: ~60-70% di riduzione dimensione file

## Cleanup Manuale Post-Migrazione

Dopo aver verificato che tutto funziona correttamente, puoi eliminare le immagini originali JPG/PNG dal bucket R2 per risparmiare spazio:

```bash
# Lista tutte le immagini JPG/PNG
wrangler r2 object list adele-lo-feudo-images | grep -E "\.(jpg|jpeg|png)$"

# Elimina un'immagine specifica (esempio)
wrangler r2 object delete adele-lo-feudo-images/images/old-image.jpg
```

⚠️ Fai questo solo DOPO aver verificato che:
1. Tutte le immagini WebP sono state caricate correttamente
2. Il database è stato aggiornato
3. Il sito mostra correttamente tutte le immagini
