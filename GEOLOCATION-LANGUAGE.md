# Rilevamento Automatico Lingua da Geolocalizzazione IP

Il portfolio ALF ora include il rilevamento automatico della lingua basato sulla posizione geografica dell'utente tramite il suo indirizzo IP.

## Come Funziona

### 1. **Backend - Cloudflare Worker Geolocation**

Cloudflare Workers fornisce automaticamente informazioni geografiche attraverso l'header `CF-IPCountry` in ogni richiesta.

**Endpoint:** `GET /api/detect-language`

**Response:**
```json
{
  "language": "it",
  "country": "IT",
  "timestamp": "2025-11-23T08:40:00.000Z"
}
```

**Mapping Paesi → Lingue:**
- 🇮🇹 Italia → `it`
- 🇬🇧 UK, 🇺🇸 USA, 🇨🇦 Canada, 🇦🇺 Australia → `en`
- 🇪🇸 Spagna, 🇲🇽 Messico, 🇦🇷 Argentina, 🇨🇱 Cile → `es`
- 🇫🇷 Francia, 🇧🇪 Belgio, 🇨🇭 Svizzera, 🇱🇺 Lussemburgo → `fr`
- 🇯🇵 Giappone → `ja`
- 🇨🇳 Cina, 🇸🇬 Singapore → `zh` (semplificato)
- 🇹🇼 Taiwan, 🇭🇰 Hong Kong → `zh-TW` (tradizionale)

Default per paesi non mappati: **Inglese** (`en`)

### 2. **Frontend - Auto-detection al primo caricamento**

Il `LanguageContext` chiama automaticamente l'API `/api/detect-language` al primo caricamento della pagina.

**Comportamento:**
1. ✅ **Prima visita** → rileva lingua da IP e imposta automaticamente
2. ✅ **Utente cambia lingua manualmente** → salva preferenza in `localStorage` e **disabilita** auto-detect
3. ✅ **Visite successive** → usa lingua salvata in `localStorage` (no auto-detect)

**LocalStorage Keys:**
- `language` → lingua corrente (`'it' | 'en' | 'es' | 'fr' | 'ja' | 'zh' | 'zh-TW'`)
- `language_manual_select` → flag che indica se l'utente ha scelto manualmente (`'true'`)

## Testing Locale

### 1. Avvia il worker Cloudflare

```bash
wrangler dev --remote --port 8787
```

**Importante:** Usa `--remote` per avere accesso agli header Cloudflare reali (incluso `CF-IPCountry`).

### 2. Testa l'endpoint direttamente

```bash
curl http://localhost:8787/api/detect-language
```

**Response attesa (locale):**
```json
{
  "language": "it",
  "country": "IT",
  "timestamp": "2025-11-23T08:40:00.000Z"
}
```

In locale, il country di default è `IT` (Italia), quindi la lingua rilevata sarà sempre `it`.

### 3. Simula diverse geolocalizzazioni

Per testare paesi diversi in locale, puoi:

**Opzione A - Modificare temporaneamente il default:**
```typescript
// In worker.ts, linea ~1045
const country = request.headers.get('CF-IPCountry') || 'US'; // Cambia in 'US', 'FR', 'JP', etc.
```

**Opzione B - Deploy su Cloudflare Workers e usa VPN:**
1. Deploy worker: `wrangler deploy`
2. Usa VPN per cambiare paese
3. Visita il sito e verifica lingua rilevata

**Opzione C - Test manuale con header custom (richiede modifica temporanea):**
```bash
# Aggiungi temporaneamente in worker.ts:
const country = request.headers.get('X-Test-Country') || request.headers.get('CF-IPCountry') || 'IT';

# Poi testa:
curl -H "X-Test-Country: FR" http://localhost:8787/api/detect-language
```

## Testing in Produzione

### 1. Deploy Worker

```bash
wrangler deploy
```

### 2. Verifica con DevTools

1. Apri il sito in produzione
2. Apri Console del browser (F12)
3. Cerca il log: `Language detected: en (Country: US)`
4. Verifica che la lingua sia corretta

### 3. Test con VPN

1. Connettiti a VPN in diversi paesi
2. Cancella `localStorage` del sito:
   ```javascript
   localStorage.clear();
   location.reload();
   ```
3. Ricarica la pagina
4. Verifica che la lingua cambi automaticamente

### 4. Reset per ri-testare auto-detection

Per forzare il rilevamento automatico (anche se hai già selezionato manualmente):

```javascript
// Console browser
localStorage.removeItem('language_manual_select');
localStorage.removeItem('language');
location.reload();
```

## Personalizzazione

### Aggiungere nuovi paesi

Modifica `worker.ts`, array `countryToLanguage`:

```typescript
const countryToLanguage: Record<string, string> = {
  'IT': 'it',
  'BR': 'pt', // Esempio: Brasile → Portoghese
  'DE': 'de', // Germania → Tedesco
  // ... altri paesi
};
```

**Nota:** Devi anche aggiungere le traduzioni corrispondenti in `src/i18n/translations.ts`.

### Cambiare lingua di fallback

Di default, paesi non mappati usano **Inglese**. Per cambiare:

```typescript
// worker.ts, linea ~1075
const detectedLanguage = countryToLanguage[country] || 'it'; // Cambia 'en' → 'it'
```

### Disabilitare auto-detection

Se vuoi disabilitare completamente il rilevamento automatico:

```typescript
// In LanguageContext.tsx, commenta useEffect:
/*
useEffect(() => {
  const hasManuallySelected = localStorage.getItem('language_manual_select');
  if (!hasManuallySelected && !isAutoDetected) {
    detectLanguageFromIP().then(detectedLang => { ... });
  }
}, [isAutoDetected]);
*/
```

## Troubleshooting

### Lingua non cambia automaticamente

1. **Verifica Console:**
   - Cerca errori nella console browser
   - Cerca log: `Language detected: ...`

2. **Controlla localStorage:**
   ```javascript
   console.log(localStorage.getItem('language'));
   console.log(localStorage.getItem('language_manual_select'));
   ```
   Se `language_manual_select` è `'true'`, l'auto-detect è disabilitato.

3. **Verifica API response:**
   ```bash
   curl https://your-worker.workers.dev/api/detect-language
   ```

### Worker restituisce sempre 'IT' locale

Usa `wrangler dev --remote` invece di `wrangler dev` per avere accesso agli header Cloudflare reali.

### Header CF-IPCountry non disponibile

L'header `CF-IPCountry` è disponibile **solo in produzione** (o con `--remote`). In sviluppo locale puro, il fallback è `'IT'`.

## Note di Sicurezza

- ✅ L'IP dell'utente **non viene salvato** né inviato al frontend
- ✅ Solo il codice paese ISO viene usato per il mapping
- ✅ Cloudflare gestisce la geolocalizzazione automaticamente (no servizi terzi)
- ✅ Funziona con privacy mode e VPN (rileva IP dell'exit node)

## Compatibilità

- ✅ Tutti i browser moderni
- ✅ Mobile (iOS/Android)
- ✅ Desktop (Windows/macOS/Linux)
- ✅ VPN/Proxy (rileva paese dell'exit point)
- ⚠️ Tor Browser → sempre fallback (solitamente inglese)

## Performance

- **Prima visita:** +1 richiesta API (~50-100ms)
- **Visite successive:** 0 richieste (usa localStorage)
- **Cambio manuale:** Istantaneo (solo localStorage)
- **Cache:** No cache necessaria (rilevamento una tantum)

---

**Ultima modifica:** 2025-11-23
**Autore:** ALF Portfolio Team
