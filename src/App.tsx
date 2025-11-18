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
import OperaForm from './pages/OperaForm';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';

// Import components
import Navbar from './components/Navbar';
import SmoothScroll from './components/SmoothScroll';

// Import i18n
import { LanguageProvider } from './i18n/LanguageContext';

// Import Loading Context
import { LoadingProvider, useLoading } from './context/LoadingContext';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Componente LoadingScreen
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
        <div className="w-48 h-1 bg-white/20 relative overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-accent"
            style={{
              animation: 'loadingBar 3s ease-in-out forwards'
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes loadingBar {
          from { width: 0; }
          to { width: 100%; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; pointer-events: none; }
        }
      `}</style>
    </div>
  );
};

function AppContent() {
  const location = useLocation();
  const { isLoading } = useLoading();
  const showNavbar = !location.pathname.startsWith('/content');

  useEffect(() => {
    // GSAP initial setup
    gsap.set('body', { opacity: 1 });

    // Smooth scroll setup
    ScrollTrigger.refresh();

    // Scroll to top on page load/refresh
    window.scrollTo(0, 0);
  }, []);

  // Scroll to top on route change con delay per SmoothScroll
  useEffect(() => {
    // Usa un timeout per assicurarsi che il cambio di pagina sia completato
    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'instant' });
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
                <Route path="/content" element={<Content />} />
                <Route path="/content/opera" element={<OperaForm />} />
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
          <Router>
            <AppContent />
          </Router>
        </LoadingProvider>
      </LanguageProvider>
    </HelmetProvider>
  );
}

export default App;
