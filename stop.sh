#!/bin/bash

# Script per fermare tutti i processi di sviluppo

echo "🛑 Fermando tutti i processi..."

# Killa frontend (porta 3000/3001)
if lsof -ti:3000 > /dev/null 2>&1; then
  echo "  - Fermando frontend su porta 3000..."
  lsof -ti:3000 | xargs kill -9 2>/dev/null
fi

if lsof -ti:3001 > /dev/null 2>&1; then
  echo "  - Fermando frontend su porta 3001..."
  lsof -ti:3001 | xargs kill -9 2>/dev/null
fi

# Killa worker (porta 8787)
if lsof -ti:8787 > /dev/null 2>&1; then
  echo "  - Fermando worker API su porta 8787..."
  lsof -ti:8787 | xargs kill -9 2>/dev/null
fi

echo "✅ Tutti i processi sono stati fermati"
