# 🚀 Setup Rapido per Artist Portfolio

## ⚡ Avvio Veloce

```bash
# 1. Installa le dipendenze
npm install --legacy-peer-deps

# 2. Avvia il server di sviluppo
npm start

# 3. Apri http://localhost:3000
```

## 🌐 Deploy su GitHub Pages

### Metodo 1: Deploy Manuale
```bash
# 1. Modifica l'homepage in package.json
"homepage": "https://tuo-username.github.io/artist-portfolio"

# 2. Deploy
npm run deploy
```

### Metodo 2: Script Automatico
```bash
# Usa lo script incluso
./deploy.sh
```

### Metodo 3: GitHub Actions (Automatico)
1. Pusha il codice su GitHub
2. Il deploy avviene automaticamente ad ogni push su `main`

## 📝 Personalizzazione Rapida

### 1. Informazioni Artista
Modifica `src/config/environment.ts`:
```typescript
contact: {
  email: 'tuo-email@example.com',
  phone: '+39 123 456 7890',
  address: 'Via Arte 123, Milano, IT',
},
```

### 2. Colori
Modifica `src/App.tsx`:
```typescript
const theme = {
  colors: {
    primary: '#000000',    // Colore principale
    accent: '#ff6b6b',     // Colore accent
    // ...
  }
};
```

### 3. Contenuti
- **Home**: `src/pages/Home.tsx`
- **About**: `src/pages/About.tsx`
- **Portfolio**: `src/pages/Portfolio.tsx`
- **Contact**: `src/pages/Contact.tsx`

### 4. Immagini
- Aggiungi le tue immagini in `src/assets/images/`
- Sostituisci i placeholder nei componenti

## 🔧 Comandi Utili

```bash
npm start          # Server di sviluppo
npm run build      # Build di produzione
npm run deploy     # Deploy su GitHub Pages
npm test           # Esegui i test
./deploy.sh        # Script di deploy automatico
```

## 📱 Test Responsive

Il sito è responsive per:
- 📱 Mobile: < 768px
- 📱 Tablet: 768px - 1024px
- 💻 Desktop: > 1024px

## 🎨 Caratteristiche Incluse

✅ Animazioni GSAP  
✅ Cursore personalizzato  
✅ SEO ottimizzato  
✅ Portfolio filtrato  
✅ Form di contatto  
✅ Design responsive  
✅ Deploy automatico  

## 🚨 Risoluzione Problemi

### Errori di dipendenze
```bash
npm install --legacy-peer-deps
```

### Build fallisce
```bash
npm run build 2>&1 | tee build.log
```

### Deploy non funziona
1. Controlla l'homepage in `package.json`
2. Verifica di essere su branch `main`
3. Controlla le impostazioni GitHub Pages

## 📞 Supporto

Se hai problemi:
1. Controlla la console del browser (F12)
2. Verifica i log di build
3. Apri un issue su GitHub

---

**Buona fortuna con il tuo portfolio artistico! 🎨** 