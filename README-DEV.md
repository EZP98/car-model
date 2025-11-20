# Guida Sviluppo - Artist Portfolio

## 🚀 Avvio Rapido

### Opzione 1: Avvio Automatico (CONSIGLIATO)

Avvia **worker + frontend** con un solo comando:

```bash
npm run dev:all
```

Questo script:
1. ✅ Killa eventuali processi esistenti
2. ✅ Avvia il worker API su porta 8787
3. ✅ Avvia il frontend su porta 3001
4. ✅ Quando chiudi il frontend (Ctrl+C), ferma automaticamente il worker

### Opzione 2: Avvio Manuale

Se preferisci controllare worker e frontend separatamente:

**Terminal 1 - Worker API:**
```bash
npm run dev:worker
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Fermare Tutto

Per fermare tutti i processi:

```bash
npm run stop
```

O manualmente:

```bash
./stop.sh
```

---

## 🏗️ Architettura

```
┌─────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│    Frontend     │  HTTP   │   Worker API     │         │    Database      │
│  React + Vite   │  ────→  │  Cloudflare      │  ────→  │  D1 + R2 Storage │
│  localhost:3001 │         │  localhost:8787  │         │                  │
└─────────────────┘         └──────────────────┘         └──────────────────┘
```

### Cos'è il Worker?

Il **Worker** è il backend API serverless che:
- 🗄️ Gestisce il database D1 (collezioni, mostre, critici)
- 🖼️ Gestisce lo storage R2 (immagini)
- 🔒 Gestisce l'autenticazione (API key)
- 🌐 Fornisce tutte le API REST

**⚠️ IMPORTANTE**: Il frontend NON può funzionare senza il worker!

---

## 🔧 URL Importanti

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:8787
- **Backoffice**: http://localhost:3001/content

---

## ❗ Risoluzione Problemi

### Problema: "Nessuna collezione presente"

**Causa**: Il worker è crashato o non risponde

**Soluzione**:
```bash
npm run stop      # Ferma tutto
npm run dev:all   # Riavvia tutto
```

### Problema: "error code: 1031"

**Causa**: Il worker è in uno stato corrotto

**Soluzione**:
```bash
# Killa tutti i worker
lsof -ti:8787 | xargs kill -9

# Riavvia
npm run dev:worker
```

### Problema: "Address already in use"

**Causa**: Ci sono già worker/frontend in esecuzione

**Soluzione**:
```bash
npm run stop
```

### Verifica che il Worker Funzioni

Testa l'API direttamente:

```bash
curl http://localhost:8787/api/collections
```

Dovrebbe restituire JSON con le collezioni. Se ottieni un errore, riavvia il worker.

---

## 📝 Password & Credenziali

**Password Backoffice**: `AdeleLoFeudo2024!`

**Email Google OAuth autorizzate**:
- silviopappalardo66@gmail.com
- eziopappalardo98@gmail.com
- adelelofeudo@gmail.com

---

## 🎯 Best Practices

### ✅ DO:
- Usa `npm run dev:all` per avviare tutto
- Usa `npm run stop` quando hai finito
- Testa l'API con curl se hai dubbi

### ❌ DON'T:
- NON aprire multipli worker sulla stessa porta
- NON lasciare worker aperti quando chiudi il terminale
- NON accedere direttamente a localhost:8787 dal browser (usa localhost:3001)

---

## 🗂️ File di Configurazione

- `dev.sh` - Script avvio completo
- `stop.sh` - Script stop tutti i processi
- `vite.config.ts` - Configurazione Vite + proxy
- `wrangler.toml` - Configurazione Cloudflare Worker
- `.env` - Variabili d'ambiente (password, API keys)

---

## 🚀 Deploy in Produzione

```bash
# Build frontend
npm run build

# Deploy worker
wrangler deploy

# Deploy frontend su Cloudflare Pages
npm run deploy
```
