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

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

function AppContent() {
  const location = useLocation();
  const showNavbar = !location.pathname.startsWith('/content');

  useEffect(() => {
    // GSAP initial setup
    gsap.set('body', { opacity: 1 });

    // Smooth scroll setup
    ScrollTrigger.refresh();

    // Scroll to top on page load/refresh
    window.scrollTo(0, 0);
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
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
  );
}

function App() {
  return (
    <HelmetProvider>
      <LanguageProvider>
        <Router>
          <AppContent />
        </Router>
      </LanguageProvider>
    </HelmetProvider>
  );
}

export default App;
