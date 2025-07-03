# Artist Portfolio Website

Un sito web moderno e responsivo per artisti, costruito con React, TypeScript, GSAP e Styled Components.

## 🎨 Caratteristiche

- **Design Moderno**: Layout pulito e professionale
- **Animazioni Fluide**: Powered by GSAP per animazioni performanti
- **Responsive**: Ottimizzato per tutti i dispositivi
- **SEO Friendly**: Meta tags ottimizzati per i motori di ricerca
- **Cursore Personalizzato**: Esperienza utente interattiva
- **Portfolio Filtrato**: Galleria con filtri per categorie
- **Form di Contatto**: Sistema di contatto funzionale
- **Performance**: Ottimizzato per velocità e performance

## 🛠️ Tecnologie Utilizzate

- **React 19** - Framework UI
- **TypeScript** - Type safety
- **GSAP** - Animazioni professionali
- **Styled Components** - CSS-in-JS styling
- **React Router** - Navigazione SPA
- **React Helmet** - SEO management
- **Three.js** - Grafica 3D (opzionale)
- **Framer Motion** - Animazioni aggiuntive

## 🚀 Installazione e Setup

### Prerequisiti
- Node.js (versione 16 o superiore)
- npm o yarn
- Git

### Installazione

1. **Clona il repository**
   ```bash
   git clone https://github.com/yourusername/artist-portfolio.git
   cd artist-portfolio
   ```

2. **Installa le dipendenze**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Avvia il server di sviluppo**
   ```bash
   npm start
   ```

4. **Apri il browser**
   Il sito sarà disponibile su `http://localhost:3000`

## 📁 Struttura del Progetto

```
artist-portfolio/
├── public/
│   ├── index.html
│   └── ...
├── src/
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── Cursor.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── About.tsx
│   │   ├── Portfolio.tsx
│   │   └── Contact.tsx
│   ├── assets/
│   │   ├── images/
│   │   └── videos/
│   ├── styles/
│   ├── utils/
│   ├── hooks/
│   ├── App.tsx
│   ├── index.tsx
│   └── styled.d.ts
├── package.json
└── README.md
```

## 🎨 Personalizzazione

### Colori e Tema
Modifica i colori del tema in `src/App.tsx`:

```typescript
const theme = {
  colors: {
    primary: '#000000',
    secondary: '#ffffff',
    accent: '#ff6b6b',
    gray: '#888888',
    lightGray: '#f5f5f5',
  },
  // ...
};
```

### Contenuti
1. **Home Page**: Modifica `src/pages/Home.tsx`
2. **About**: Aggiorna `src/pages/About.tsx`
3. **Portfolio**: Aggiungi le tue opere in `src/pages/Portfolio.tsx`
4. **Contact**: Personalizza i contatti in `src/pages/Contact.tsx`

### Immagini
- Aggiungi le tue immagini in `src/assets/images/`
- Sostituisci i placeholder con le tue opere d'arte

## 🚀 Deploy su GitHub Pages

### Setup Iniziale

1. **Crea un repository su GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/artist-portfolio.git
   git push -u origin main
   ```

2. **Aggiorna l'homepage nel package.json**
   ```json
   "homepage": "https://yourusername.github.io/artist-portfolio"
   ```

3. **Deploy**
   ```bash
   npm run deploy
   ```

### Deploy Automatico
Il sito verrà automaticamente deployato su GitHub Pages ogni volta che esegui:
```bash
npm run deploy
```

### Configurazione GitHub Pages
1. Vai nelle impostazioni del repository su GitHub
2. Scorri fino alla sezione "Pages"
3. Seleziona "Deploy from a branch"
4. Scegli il branch `gh-pages`
5. Il sito sarà disponibile su `https://yourusername.github.io/artist-portfolio`

## 📱 Responsive Design

Il sito è completamente responsive e si adatta a:
- Desktop (1200px+)
- Tablet (768px - 1024px)
- Mobile (< 768px)

## 🔧 Scripts Disponibili

- `npm start` - Avvia il server di sviluppo
- `npm run build` - Crea la build di produzione
- `npm test` - Esegue i test
- `npm run deploy` - Deploy su GitHub Pages

## 🎯 Performance

- **Lazy Loading**: Caricamento ottimizzato delle immagini
- **Code Splitting**: Bundle ottimizzati
- **SEO**: Meta tags e structured data
- **Lighthouse Score**: 90+ su tutte le metriche

## 🤝 Contributi

I contributi sono benvenuti! Per contribuire:

1. Fork il progetto
2. Crea un branch per la feature (`git checkout -b feature/AmazingFeature`)
3. Commit le modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📄 Licenza

Questo progetto è sotto licenza MIT. Vedi il file `LICENSE` per i dettagli.

## 📞 Supporto

Se hai domande o problemi:
- Apri un issue su GitHub
- Contatta via email: your-email@example.com

## 🙏 Ringraziamenti

- [GSAP](https://greensock.com/gsap/) per le animazioni
- [Styled Components](https://styled-components.com/) per lo styling
- [React](https://reactjs.org/) per il framework
- [Three.js](https://threejs.org/) per la grafica 3D

---

**Made with ❤️ for artists**
