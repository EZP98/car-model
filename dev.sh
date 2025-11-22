#!/bin/bash

# Script per avviare l'ambiente di sviluppo

echo "🧹 Pulizia processi esistenti..."

# Killa eventuali processi su porta 3000/3001 (frontend)
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null

# Killa eventuali processi su porta 8787 (worker)
lsof -ti:8787 | xargs kill -9 2>/dev/null

echo "✅ Pulizia completata"
echo ""
echo "🔑 Controllo autenticazione Cloudflare..."

# Verifica che wrangler sia autenticato
if ! wrangler whoami >/dev/null 2>&1; then
  echo "❌ Non sei autenticato! Esegui: wrangler login"
  exit 1
fi

echo "✅ Autenticato correttamente"
echo ""
echo "🚀 Avvio worker API su porta 8787 (modalità remote - usa DB reale)..."

# Avvia worker in background usando --remote (accede al DB di produzione)
wrangler dev --remote --port 8787 &
WORKER_PID=$!

# Aspetta che il worker sia pronto
sleep 3

echo "✅ Worker avviato (PID: $WORKER_PID)"
echo ""
echo "💡 Se il worker si ferma con errore di autenticazione, esegui: wrangler login"
echo ""
echo "🚀 Avvio frontend su porta 3001..."

# Avvia frontend
npm run dev

# Quando il frontend si chiude, killa anche il worker
echo ""
echo "🛑 Chiusura worker..."
kill $WORKER_PID 2>/dev/null
