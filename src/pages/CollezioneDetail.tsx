import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useLanguage } from '../i18n/LanguageContext';
import Navbar from '../components/Navbar';
import { getCollection, getCollectionArtworks, Collection, Artwork } from '../services/collections-api';

const CollezioneDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [selectedImage, setSelectedImage] = useState(0);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background pt-24 px-6 flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
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
        <meta name="description" content={collection.description} />
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
              {collection.description}
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
                  src={collection.image_url}
                  alt={`Copertina ${collection.title}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>

          {/* Testo descrittivo della collezione */}
          <motion.div
            className="border border-white/10 rounded-[12px] p-8 bg-white/5 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Il Perché di Questa Collezione
            </h3>
            <p className="text-white/80 leading-relaxed text-base">
              Questa serie di opere nasce da una profonda riflessione sulla materialità e la trasformazione.
              Ogni quadro rappresenta un dialogo silenzioso tra l'artista e la tela, dove il colore diventa
              veicolo di emozioni non dette e la forma si fa portavoce di un linguaggio universale che trascende
              le parole. L'intento è quello di creare uno spazio contemplativo dove l'osservatore possa ritrovare
              frammenti di sé stesso riflessi nelle texture e nelle cromie, invitandolo a una lettura personale e
              intima dell'opera. La collezione si propone come un viaggio attraverso stati d'animo e percezioni,
              dove ogni pennellata è testimonianza di un momento vissuto e ogni composizione diventa finestra
              su mondi interiori inesplorati.
            </p>
          </motion.div>

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
                          src={artwork.image_url || '/placeholder-artwork.jpg'}
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
          <div className="mt-16 pb-16">
            <button
              onClick={() => navigate('/')}
              className="text-white/60 hover:text-white transition-colors flex items-center gap-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              <span>Torna alla Collezione</span>
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default CollezioneDetail;