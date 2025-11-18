# Configurazione Cloudflare D1 Database

## 🎯 Panoramica

Il progetto è configurato per utilizzare **Cloudflare D1** (database SQL) per gestire i contenuti dinamici:
- **Collezioni** (Opere d'arte)
- **Mostre** (Esibizioni)
- **Critica** (Testi critici multilingua)
- **Newsletter** (Iscritti)

## 📁 File Creati

### Schema Database
- `schema-complete.sql` - Schema completo con tutte le tabelle necessarie

### API Backend
- `src/worker.ts` - Worker esistente con API base
- `src/worker-extended.ts` - Nuove API per collezioni, mostre e critica (da integrare in worker.ts)

### Frontend Services
- `src/services/content-api.ts` - Servizi per chiamate API
- `src/hooks/useContentData.ts` - React hooks per gestire i dati
- `src/pages/Collezione-with-api.tsx` - Esempio di integrazione

## 🚀 Setup Passo-Passo

### 1. Creare il Database D1

```bash
# Se non esiste già, crea il database
npx wrangler d1 create alf-portfolio-db

# Nota l'ID del database e aggiornalo in wrangler.toml se necessario
```

### 2. Applicare lo Schema

```bash
# Applica lo schema completo al database
npx wrangler d1 execute alf-portfolio-db --local --file=./schema-complete.sql

# Per il database di produzione (rimuovi --local)
npx wrangler d1 execute alf-portfolio-db --file=./schema-complete.sql
```

### 3. Integrare le Nuove API

Aggiungi il contenuto di `src/worker-extended.ts` al file `src/worker.ts` esistente, prima del return finale del default export.

### 4. Deploy del Worker

```bash
# Test locale
npx wrangler dev

# Deploy su Cloudflare
npx wrangler deploy
```

### 5. Configurare le Variabili d'Ambiente

Crea/aggiorna `.env.local`:

```env
VITE_API_URL=http://localhost:8787/api  # Per sviluppo locale
# VITE_API_URL=https://alf-portfolio-api.workers.dev/api  # Per produzione
```

### 6. Integrare nel Frontend

Per usare le API nel componente `Collezione.tsx`:

1. **Opzione A: Sostituisci completamente** (Consigliato per produzione)
   - Rinomina `Collezione.tsx` in `Collezione-backup.tsx`
   - Rinomina `Collezione-with-api.tsx` in `Collezione.tsx`
   - Adatta il codice alle tue esigenze

2. **Opzione B: Integrazione graduale** (Consigliato per test)
   ```tsx
   import { useContentData } from '../hooks/useContentData';

   // Nel componente
   const { collections, exhibitions, critics, loading, error } = useContentData();

   // Usa i dati dal database se disponibili, altrimenti fallback
   const mostreToShow = exhibitions.length > 0 ? exhibitions : mostreHardcoded;
   ```

## 📊 Gestione Contenuti

### Pagina Admin Esistente

La pagina `/content` permette già di gestire:
- Opere (artworks)
- Sezioni (sections)
- Newsletter

### Estensione Futura

Per gestire anche collezioni, mostre e critica dalla pagina admin:

1. Aggiungi nuove tab in `Content.tsx`
2. Usa le funzioni da `content-api.ts` per CRUD operations
3. Crea form per ogni tipo di contenuto

## 🔄 Migrazione Dati

### Script di Migrazione

Per migrare i dati hardcoded esistenti:

```bash
# Esegui gli INSERT già presenti in schema-complete.sql
npx wrangler d1 execute alf-portfolio-db --file=./schema-complete.sql

# Oppure crea uno script di migrazione separato
```

### Migrazione Testi Critici Multilingua

I testi dei critici dal file `translations.ts` devono essere inseriti nella tabella `critic_texts`:

```sql
-- Esempio per un critico
INSERT INTO critic_texts (critic_id, language, text) VALUES
  (1, 'it', 'Testo italiano di Angelo Leidi...'),
  (1, 'en', 'English text for Angelo Leidi...'),
  (1, 'es', 'Texto español de Angelo Leidi...');
```

## ⚙️ Configurazione R2 (Storage Immagini) - Opzionale

Se vuoi spostare anche le immagini su Cloudflare R2:

1. Crea un bucket R2:
   ```bash
   npx wrangler r2 bucket create alf-artworks
   ```

2. Abilita in `wrangler.toml`:
   ```toml
   [[r2_buckets]]
   binding = "ARTWORKS"
   bucket_name = "alf-artworks"
   ```

3. Implementa upload nel worker per gestire le immagini

## 🧪 Test

### Test Locale
```bash
# Avvia il worker locale
npx wrangler dev

# In un altro terminale, avvia il frontend
npm run dev

# Testa le API
curl http://localhost:8787/api/collections
curl http://localhost:8787/api/exhibitions
curl http://localhost:8787/api/critics?lang=it
```

### Test API Diretti
```bash
# Collections
curl -X GET http://localhost:8787/api/collections
curl -X GET http://localhost:8787/api/collections/opera-5

# Exhibitions
curl -X GET http://localhost:8787/api/exhibitions
curl -X GET http://localhost:8787/api/exhibitions/ritorno

# Critics (con lingua)
curl -X GET http://localhost:8787/api/critics?lang=it
curl -X GET http://localhost:8787/api/critics/1?lang=en
```

## 📝 Note Importanti

1. **Fallback Automatico**: Il sistema è progettato per funzionare anche senza database, usando i dati hardcoded come fallback

2. **Multilingua**: I testi dei critici supportano 7 lingue (it, en, es, fr, ja, zh, zh-TW)

3. **Performance**: Tutti gli indici necessari sono già creati nello schema

4. **Sicurezza**: Le API hanno CORS abilitato per permettere chiamate dal frontend

5. **Cache**: Considera l'implementazione di cache per ridurre le chiamate al database

## 🆘 Troubleshooting

### Errore "Database not found"
- Verifica che l'ID del database in `wrangler.toml` corrisponda a quello creato

### CORS Issues
- Assicurati che il worker abbia i corsHeaders configurati correttamente

### Dati non visualizzati
- Controlla la console del browser per errori
- Verifica che VITE_API_URL sia configurato correttamente
- Controlla che il worker sia in esecuzione

## 📚 Risorse

- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [Workers Documentation](https://developers.cloudflare.com/workers/)