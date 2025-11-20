import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Import pages
import Collezione from './pages/Collezione';
import CollezioneDetail from './pages/CollezioneDetail';
import Content from './pages/Content';
import CollectionArtworks from './pages/CollectionArtworks';
import CollectionManagement from './pages/CollectionManagement';
import NewCollection from './pages/NewCollection';
import ExhibitionManagement from './pages/ExhibitionManagement';
import NewExhibition from './pages/NewExhibition';
import CriticManagement from './pages/CriticManagement';
import NewCritic from './pages/NewCritic';
import MediaStorage from './pages/MediaStorage';
import OperaForm from './pages/OperaForm';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import Login from './pages/Login';
import TranslationManagement from './pages/TranslationManagement';

// Import components
import Navbar from './components/Navbar';
import SmoothScroll from './components/SmoothScroll';
import ProtectedRoute from './components/ProtectedRoute';

// Import i18n
import { LanguageProvider } from './i18n/LanguageContext';

// Import Loading Context
import { LoadingProvider, useLoading } from './context/LoadingContext';

// Import Toast
import { ToastProvider } from './components/Toast';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Componente LoadingScreen - versione originale con effetto sparkle dal sito scaricato
const LoadingScreen: React.FC = () => {
  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-background"
      style={{ animation: 'fadeOut 0.5s ease-out 2.5s forwards' }}
    >
      <div className="flex flex-col items-center">
        <h1 className="text-8xl font-bold text-white mb-8 tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          ALF
        </h1>
        <div className="w-[200px] h-[3px] mx-auto bg-white/10 rounded-full overflow-visible relative">
          <div
            className="h-full rounded-full relative"
            style={{
              background: 'linear-gradient(90deg, #B01050 0%, #D01257 25%, #F02D6E 50%, #FF6B9D 75%, #FFB3D1 100%)',
              animation: 'loadBar 2.5s ease-out forwards',
              boxShadow: '0 0 15px rgba(240, 45, 110, 0.8)'
            }}
          >
            {/* Punto scintillante alla fine della barra */}
            <div
              style={{
                position: 'absolute',
                top: '-3px',
                right: '-4px',
                width: '8px',
                height: '8px',
                background: 'radial-gradient(circle, white 0%, rgba(255, 255, 255, 1) 30%, rgba(255, 255, 255, 0.4) 60%, transparent 100%)',
                borderRadius: '50%',
                filter: 'blur(0.5px)',
                boxShadow: '0 0 12px rgba(255, 255, 255, 1), 0 0 20px rgba(255, 255, 255, 0.9), 0 0 28px rgba(240, 45, 110, 1), 0 0 36px rgba(240, 45, 110, 0.7)',
                animation: 'sparkle 2s ease-in-out infinite'
              }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes loadBar {
          from { width: 0; }
          to { width: 100%; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; pointer-events: none; }
        }
        @keyframes sparkle {
          0%, 100% {
            opacity: 1;
            transform: scaleX(1);
          }
          50% {
            opacity: 0.8;
            transform: scaleX(1.5);
          }
        }
      `}</style>
    </div>
  );
};

function AppContent() {
  const location = useLocation();
  const { isLoading } = useLoading();
  const showNavbar = !location.pathname.startsWith('/content') && location.pathname !== '/login';

  useEffect(() => {
    // GSAP initial setup
    gsap.set('body', { opacity: 1 });

    // Smooth scroll setup
    ScrollTrigger.refresh();

    // Scroll to top on page load/refresh
    window.scrollTo(0, 0);
  }, []);

  // Disable snap scroll on /content routes
  useEffect(() => {
    if (location.pathname.startsWith('/content')) {
      document.body.classList.add('no-snap-scroll');
    } else {
      document.body.classList.remove('no-snap-scroll');
    }

    return () => {
      document.body.classList.remove('no-snap-scroll');
    };
  }, [location.pathname]);

  // Scroll to top on route change con delay per SmoothScroll
  useEffect(() => {
    // Usa un timeout per assicurarsi che il cambio di pagina sia completato
    const scrollToTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // Reset Lenis scroll if available (the smooth scroll library)
      const lenis = (window as any).lenis;
      if (lenis) {
        lenis.scrollTo(0, { immediate: true, force: true, lock: true });
      }

      // Forza anche il container SmoothScroll a tornare in alto
      const smoothScrollContainer = document.querySelector('.smooth-scroll-container');
      if (smoothScrollContainer) {
        smoothScrollContainer.scrollTop = 0;
      }
    };

    scrollToTop();

    // Riprova dopo un breve delay nel caso SmoothScroll interferisca
    const timer = setTimeout(scrollToTop, 100);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      {/* Loading Screen globale */}
      {isLoading && <LoadingScreen />}

      <SmoothScroll>
        <div className="min-h-screen flex flex-col bg-background text-primary font-sans leading-relaxed overflow-x-hidden">
          {showNavbar && <Navbar />}
          <main className="flex-1">
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Collezione />} />
                <Route path="/collezione" element={<Collezione />} />
                <Route path="/collezione/:id" element={<CollezioneDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/content" element={<ProtectedRoute><Content /></ProtectedRoute>} />
                <Route path="/content/collezione/new" element={<ProtectedRoute><NewCollection /></ProtectedRoute>} />
                <Route path="/content/collezione/:collectionId" element={<ProtectedRoute><CollectionManagement /></ProtectedRoute>} />
                <Route path="/content/collezione/:collectionId/opere" element={<ProtectedRoute><CollectionArtworks /></ProtectedRoute>} />
                <Route path="/content/mostra/new" element={<ProtectedRoute><NewExhibition /></ProtectedRoute>} />
                <Route path="/content/mostra/:exhibitionId" element={<ProtectedRoute><ExhibitionManagement /></ProtectedRoute>} />
                <Route path="/content/critico/new" element={<ProtectedRoute><NewCritic /></ProtectedRoute>} />
                <Route path="/content/critico/:criticId" element={<ProtectedRoute><CriticManagement /></ProtectedRoute>} />
                <Route path="/content/traduzioni" element={<ProtectedRoute><TranslationManagement /></ProtectedRoute>} />
                <Route path="/content/storage" element={<ProtectedRoute><MediaStorage /></ProtectedRoute>} />
                <Route path="/content/opera" element={<ProtectedRoute><OperaForm /></ProtectedRoute>} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsConditions />} />
              </Routes>
            </AnimatePresence>
          </main>
        </div>
      </SmoothScroll>
    </>
  );
}

function App() {
  return (
    <HelmetProvider>
      <LanguageProvider>
        <LoadingProvider>
          <ToastProvider>
            <Router>
              <AppContent />
            </Router>
          </ToastProvider>
        </LoadingProvider>
      </LanguageProvider>
    </HelmetProvider>
  );
}

export default App;
