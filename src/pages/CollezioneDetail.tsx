import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useLanguage } from '../i18n/LanguageContext';
import Navbar from '../components/Navbar';
import { getCollection, getCollectionArtworks, Collection, Artwork } from '../services/collections-api';
import { getTranslatedField } from '../utils/translations';

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

const CollezioneDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [selectedImage, setSelectedImage] = useState(0);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

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

        // Fetch artworks for this collection (only visible ones for public frontend)
        const artworksData = await getCollectionArtworks(collectionData.id);
        // Filter to show only visible artworks
        const visibleArtworks = artworksData.filter(artwork => artwork.is_visible);
        setArtworks(visibleArtworks);
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
    // Reset scroll - versione semplificata per evitare lag
    window.scrollTo({ top: 0, behavior: 'instant' });

    const lenis = (window as any).lenis;
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    }
  }, [id]);

  // Handler per errori di caricamento immagine
  const handleImageError = (imageId: string) => {
    setImageErrors(prev => new Set(prev).add(imageId));
  };

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
        <title>{getTranslatedField(collection, 'title', language)} - Adele Lo Feudo</title>
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
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <h1 className="text-[42px] font-bold text-white uppercase" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {getTranslatedField(collection, 'title', language)}
            </h1>
            <p className="text-white/60 text-[16px]">
              {getTranslatedField(collection, 'description', language)}
            </p>
          </motion.div>

          {/* Immagine di copertina della collezione */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="border border-white/10 rounded-[12px] overflow-hidden">
              <div className="aspect-[2/1] bg-black">
                {!imageErrors.has(`collection-${collection.id}`) ? (
                  <img
                    src={getImageUrl(collection.image_url)}
                    alt={`Copertina ${getTranslatedField(collection, 'title', language)}`}
                    loading="eager"
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(`collection-${collection.id}`)}
                  />
                ) : (
                  <div className="w-full h-full bg-black" />
                )}
              </div>
            </div>
          </motion.div>

          {/* Testo descrittivo della collezione */}
          {getTranslatedField(collection, 'detailed_description', language) && (
            <motion.div
              className="mb-16"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-white/80 leading-relaxed text-base whitespace-pre-wrap">
                {getTranslatedField(collection, 'detailed_description', language)}
              </p>
            </motion.div>
          )}

          {/* Griglia delle opere */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.4 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {artworks.length > 0 ? (
                artworks.map((artwork, index) => (
                  <motion.div
                    key={artwork.id}
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.05,
                      ease: "easeOut"
                    }}
                  >
                    <div className="border border-white/10 rounded-[12px] overflow-hidden group">
                      <div className="w-full bg-black">
                        {!imageErrors.has(`artwork-${artwork.id}`) ? (
                          <img
                            src={getImageUrl(artwork.image_url)}
                            alt={artwork.title}
                            loading="lazy"
                            className="w-full h-auto object-contain transition-transform duration-500 ease-out will-change-transform group-hover:scale-105"
                            onError={() => handleImageError(`artwork-${artwork.id}`)}
                          />
                        ) : (
                          <div className="w-full aspect-square bg-black" />
                        )}
                      </div>
                    </div>

                    <div className="text-center space-y-2">
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