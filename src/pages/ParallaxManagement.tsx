import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import BackofficeLayout from '../components/BackofficeLayout';
import Toast from '../components/Toast';
import ImageWithFallback from '../components/ImageWithFallback';
import { getParallax, updateParallax } from '../services/parallax-api';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const API_KEY = import.meta.env.VITE_API_KEY || '';

// Helper to add authentication headers
function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (API_KEY) {
    headers['Authorization'] = `Bearer ${API_KEY}`;
  }

  return headers;
}

// Helper function to get full image URL
const getImageUrl = (path: string): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const imageBaseUrl = import.meta.env.DEV
    ? 'https://alf-portfolio-api.eziopappalardo98.workers.dev'
    : API_BASE_URL;
  return `${imageBaseUrl}${path}`;
};

const ParallaxManagement: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [availableImages, setAvailableImages] = useState<Array<{ filename: string; url: string }>>([]);
  const [allImages, setAllImages] = useState<Array<{ filename: string; url: string }>>([]);
  const [formData, setFormData] = useState({
    text_top_it: '',
    text_bottom_it: '',
    image_url: ''
  });
  const [originalData, setOriginalData] = useState({
    text_top_it: '',
    text_bottom_it: '',
    image_url: ''
  });

  useEffect(() => {
    loadParallax();
    loadAvailableImages();
  }, []);

  const loadParallax = async () => {
    setLoading(true);
    try {
      const parallax = await getParallax();
      if (parallax) {
        const data = {
          text_top_it: parallax.text_top_it || '',
          text_bottom_it: parallax.text_bottom_it || '',
          image_url: parallax.image_url || ''
        };
        setFormData(data);
        setOriginalData(data);
      }
    } catch (error) {
      console.error('Error loading parallax:', error);
      setToast({ message: 'Errore nel caricamento del parallasse', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableImages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/storage/images`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch images');
      const data = await response.json();
      setAllImages(data.images || []);
      const filtered = (data.images || []).filter((img: { filename: string }) =>
        !img.filename.endsWith('_thumb.jpg') &&
        !img.filename.endsWith('_thumb.jpeg') &&
        !img.filename.endsWith('_thumb.png') &&
        !img.filename.endsWith('_thumb.gif') &&
        !img.filename.endsWith('_thumb.webp')
      );
      setAvailableImages(filtered);
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };

  // Check if there are unsaved changes
  const hasChanges = React.useMemo(() => {
    return formData.text_top_it !== originalData.text_top_it ||
           formData.text_bottom_it !== originalData.text_bottom_it ||
           formData.image_url !== originalData.image_url;
  }, [formData, originalData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);
    try {
      await updateParallax({
        text_top_it: formData.text_top_it,
        text_bottom_it: formData.text_bottom_it,
        image_url: formData.image_url || null
      });
      setOriginalData(formData); // Reset original data after successful save
      setToast({ message: 'Parallasse aggiornato con successo', type: 'success' });
      loadParallax();
    } catch (error) {
      console.error('Error updating parallax:', error);
      setToast({ message: 'Errore nell\'aggiornamento del parallasse', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white text-xl">Caricamento...</div>
      </div>
    );
  }

  return (
    <BackofficeLayout>
      <Helmet>
        <title>Gestione Parallasse - Backoffice</title>
      </Helmet>

      <motion.div
        className="max-w-5xl mx-auto py-20 px-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="text-white/60 hover:text-white mb-4 flex items-center gap-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Indietro
            </button>
            <h1 className="text-4xl font-bold text-white uppercase" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Gestione <span style={{ color: 'rgb(240, 45, 110)' }}>Parallasse</span>
            </h1>
            <p className="text-white/60 mt-2">
              Gestisci i testi e l'immagine della sezione parallax presente nella homepage
            </p>
          </div>
        </div>

        {/* Form */}
        <motion.form
          id="parallax-form"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row gap-8 md:gap-12 items-start"
        >
          <div className="w-full md:w-[380px] flex-shrink-0">
            <label className="block text-white mb-4 font-bold">
              Immagine Parallax
            </label>
            <div
              className="group border border-white/10 rounded-lg overflow-hidden bg-black cursor-pointer hover:border-accent transition-colors"
              onClick={() => setShowImagePicker(true)}
            >
              {formData.image_url ? (
                <div className="aspect-video relative">
                  <ImageWithFallback
                    src={getImageUrl(formData.image_url)}
                    alt="Parallax"
                    aspectRatio="aspect-video"
                    objectFit="cover"
                    loading="eager"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="text-center text-white">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="font-bold text-sm">Cambia Immagine</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-video flex flex-col items-center justify-center p-8">
                  <svg className="w-16 h-16 text-white/40 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-white/60 font-bold text-lg mb-1">Clicca per scegliere immagine</p>
                  <p className="text-white/40 text-sm">Immagine di sfondo parallax</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-6">
            {/* Testo Superiore (Italiano) */}
            <div>
              <label className="block text-white mb-2 font-bold">
                Testo Superiore (Italiano)
              </label>
              <textarea
                value={formData.text_top_it}
                onChange={(e) => setFormData({ ...formData, text_top_it: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-background text-white border rounded-lg focus:outline-none focus:border-pink-500 transition-colors resize-none"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                placeholder="Testo che apparirà sopra l'immagine parallax..."
              />
              <p className="text-white/60 text-sm mt-2">
                Questo testo appare nella parte superiore della sezione parallax. Le traduzioni vengono gestite nella sezione Traduzioni.
              </p>
            </div>

            {/* Testo Inferiore (Italiano) */}
            <div>
              <label className="block text-white mb-2 font-bold">
                Testo Inferiore (Italiano)
              </label>
              <textarea
                value={formData.text_bottom_it}
                onChange={(e) => setFormData({ ...formData, text_bottom_it: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-background text-white border rounded-lg focus:outline-none focus:border-pink-500 transition-colors resize-none"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                placeholder="Testo che apparirà sotto l'immagine parallax..."
              />
              <p className="text-white/60 text-sm mt-2">
                Questo testo appare nella parte inferiore della sezione parallax. Le traduzioni vengono gestite nella sezione Traduzioni.
              </p>
            </div>
          </div>
        </motion.form>

        {/* Floating Buttons - Show only when there are unsaved changes */}
        {hasChanges && (
        <div className="fixed bottom-6 right-6 flex gap-3 z-50">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 font-bold uppercase text-white border hover:bg-white/5 transition-all shadow-lg"
            style={{ borderColor: 'rgba(255, 255, 255, 0.2)', fontFamily: 'Montserrat, sans-serif', borderRadius: 0, backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          >
            Annulla
          </button>
          <button
            type="submit"
            form="parallax-form"
            disabled={saving}
            className="px-6 py-3 font-bold uppercase text-white transition-all disabled:opacity-50 hover:opacity-90 shadow-lg"
            style={{ backgroundColor: 'rgb(240, 45, 110)', fontFamily: 'Montserrat, sans-serif', borderRadius: 0 }}
          >
            {saving ? 'Salvataggio...' : 'Salva Modifiche'}
          </button>
        </div>
        )}
      </motion.div>

      {/* Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={!!toast}
          onClose={() => setToast(null)}
        />
      )}

      {/* Image Picker Modal */}
      {showImagePicker && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}>
          <div className="bg-secondary rounded-xl border max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
              <h3 className="text-2xl font-bold text-white">Seleziona Immagine</h3>
              <button
                onClick={() => setShowImagePicker(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {availableImages.length === 0 ? (
                <p className="text-white/60 text-center py-8">Nessuna immagine disponibile nello storage</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {availableImages.map((image) => {
                    const thumbnailFilename = image.filename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '_thumb.$1');
                    const thumbnail = allImages.find(img => img.filename === thumbnailFilename);
                    const displayUrl = thumbnail ? thumbnail.url : image.url;

                    return (
                      <div
                        key={image.filename}
                        className="cursor-pointer group"
                        onClick={() => {
                          setFormData({ ...formData, image_url: image.url });
                          setShowImagePicker(false);
                        }}
                      >
                        <div className="aspect-video bg-background rounded-lg overflow-hidden border-2 border-transparent group-hover:border-accent transition-colors">
                          <ImageWithFallback
                            src={`${API_BASE_URL}${displayUrl}`}
                            alt={image.filename}
                            aspectRatio="aspect-video"
                            objectFit="cover"
                          />
                        </div>
                        <p className="text-white/60 text-sm mt-2 truncate">{image.filename}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </BackofficeLayout>
  );
};

export default ParallaxManagement;
