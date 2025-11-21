import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useLanguage } from '../i18n/LanguageContext';
import Navbar from '../components/Navbar';
import { getCollection, getCollectionArtworks, Collection, Artwork } from '../services/collections-api';

// Get API base URL for image URLs
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Helper function to convert relative image URLs to absolute
const getImageUrl = (url: string | null | undefined): string => {
  if (!url) return '/placeholder-artwork.jpg';

  // If URL is already absolute, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // If URL is relative, prepend API base URL
  if (url.startsWith('/images/')) {
    return `${API_BASE_URL}${url}`;
  }

  return url;
};

// Helper function to get translated field based on current language
const getTranslatedField = <T extends Record<string, any>>(
  item: T,
  fieldName: string,
  language: string,
  fallbackField?: string
): string => {
  // Map zh-TW to zh_tw for database column naming
  const langSuffix = language === 'zh-TW' ? 'zh_tw' : language;
  const translatedFieldName = `${fieldName}_${langSuffix}`;

  // Try to get the translated field
  if (item[translatedFieldName]) {
    return item[translatedFieldName];
  }

  // Fall back to the specified fallback field or the base field
  return item[fallbackField || fieldName] || '';
};

const CollezioneDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [selectedImage, setSelectedImage] = useState(0);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTestModal, setShowTestModal] = useState(false);

  // Fetch collection and artworks data
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch collection details
        const collectionData = await getCollection(id);
        setCollection(collectionData);

        // Fetch artworks for this collection
        const artworksData = await getCollectionArtworks(collectionData.id);
        setArtworks(artworksData);
      } catch (err) {
        console.error('Error fetching collection data:', err);
        setError('Failed to load collection');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  // Scroll to top quando la pagina viene caricata
  useEffect(() => {
    // Forza lo scroll immediato
    const scrollToTop = () => {
      // Reset native scroll
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // Reset Lenis scroll if available (the smooth scroll library)
      const lenis = (window as any).lenis;
      if (lenis) {
        lenis.scrollTo(0, { immediate: true, force: true, lock: true });
      }

      // Forza anche eventuali container con scroll
      const containers = document.querySelectorAll('.smooth-scroll-container, [data-scroll-container]');
      containers.forEach(container => {
        if (container) {
          container.scrollTop = 0;
          (container as any).scrollTo?.(0, 0);
        }
      });
    };

    // Esegui immediatamente
    scrollToTop();

    // Riprova dopo un breve delay per assicurarsi che funzioni
    const timers = [
      setTimeout(scrollToTop, 0),
      setTimeout(scrollToTop, 50),
      setTimeout(scrollToTop, 100),
      setTimeout(scrollToTop, 200)
    ];

    return () => timers.forEach(timer => clearTimeout(timer));
  }, [id]); // Aggiungi id come dipendenza per re-triggere quando cambia collezione

  // Loading state - show nothing
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background pt-24 px-6" />
      </>
    );
  }

  // Error or no collection found
  if (!collection) {
    return null;
  }

  const currentImage = artworks[selectedImage];

  return (
    <>
      <Helmet>
        <title>{collection.title} - Adele Lo Feudo</title>
        <meta name="description" content={getTranslatedField(collection, 'description', language)} />
      </Helmet>

      <Navbar />

      <motion.div
        className="min-h-screen bg-background pt-24 px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Header con titolo collezione */}
          <motion.div
            className="mb-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="text-[42px] font-bold text-white uppercase mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {collection.title}
            </h1>
            <p className="text-white/60 text-[16px]">
              {getTranslatedField(collection, 'description', language)}
            </p>
          </motion.div>

          {/* Immagine di copertina della collezione */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <div className="border border-white/10 rounded-[12px] overflow-hidden">
              <div className="aspect-[2/1]">
                <img
                  src={getImageUrl(collection.image_url)}
                  alt={`Copertina ${collection.title}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>

          {/* Testo descrittivo della collezione */}
          {getTranslatedField(collection, 'detailed_description', language) && (
            <motion.div
              className="border border-white/10 rounded-[12px] p-8 bg-white/5 mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Il Perché di Questa Collezione
              </h3>
              <p className="text-white/80 leading-relaxed text-base whitespace-pre-wrap">
                {getTranslatedField(collection, 'detailed_description', language)}
              </p>
            </motion.div>
          )}

          {/* Griglia delle opere */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <motion.h3
              className="text-2xl font-bold text-white mb-8 uppercase tracking-wider text-center"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              Opere della Collezione
            </motion.h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {artworks.length > 0 ? (
                artworks.map((artwork, index) => (
                  <motion.div
                    key={artwork.id}
                    className="space-y-4"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.6,
                      delay: 0.6 + index * 0.1,
                      ease: "easeOut"
                    }}
                  >
                    <div className="border border-white/10 rounded-[12px] overflow-hidden">
                      <div className="aspect-square">
                        <img
                          src={getImageUrl(artwork.image_url)}
                          alt={artwork.title}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                    </div>

                    <div className="text-center space-y-2">
                      <h4 className="text-lg font-bold text-white">{artwork.title}</h4>
                      {artwork.year && <p className="text-white/60 text-sm">{artwork.year}</p>}
                      {artwork.technique && <p className="text-white/60 text-sm">{artwork.technique}</p>}
                      {artwork.dimensions && <p className="text-white/60 text-sm">{artwork.dimensions}</p>}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-2 text-center py-8">
                  <p className="text-white/60">Nessuna opera disponibile per questa collezione.</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Torna alla collezione */}
          <div className="mt-16 pb-16 flex justify-between items-center">
            <button
              onClick={() => navigate('/')}
              className="text-white/60 hover:text-white transition-colors flex items-center gap-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              <span>Torna alla Collezione</span>
            </button>

            <button
              onClick={() => setShowTestModal(true)}
              className="px-6 py-3 bg-accent text-white rounded-lg font-bold hover:opacity-90"
            >
              TEST MODALE
            </button>
          </div>
        </div>
      </motion.div>

      {/* TEST MODAL - EXACT structure from QRCodeModal */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowTestModal(false)}
          />

          <div className="relative bg-secondary rounded-3xl max-w-xl w-full shadow-2xl border border-white/10 max-h-[90vh] flex flex-col">
            <div className="p-6 pb-0">
              <button
                onClick={() => setShowTestModal(false)}
                className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-xl transition-all hover:scale-110"
              >
                <span className="text-white text-2xl">×</span>
              </button>

              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-white">
                  Test Scroll Modale
                </h2>
                <p className="text-sm text-white/60 mt-1">Scorri dentro questa modale</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-hide">
              <div className="space-y-6">
                {/* Content with lots of items to test scroll */}
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-background/50 p-6 rounded-xl border border-white/10"
                  >
                    <h3 className="text-white font-bold text-lg mb-2">
                      Item {i + 1}
                    </h3>
                    <p className="text-white/70">
                      Questo è un contenuto di test per verificare che lo scroll funzioni
                      correttamente DENTRO la modale e NON faccia scrollare la pagina sotto.
                    </p>
                    <p className="text-white/50 text-sm mt-2">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                  </div>
                ))}

                <div className="pt-4">
                  <button
                    onClick={() => setShowTestModal(false)}
                    className="w-full px-6 py-3 bg-accent text-white rounded-lg font-bold hover:opacity-90"
                  >
                    Chiudi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CollezioneDetail;