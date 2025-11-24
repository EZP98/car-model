import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import BackofficeLayout from '../components/BackofficeLayout';
import { createCollection } from '../services/collections-api';
import ImageWithFallback from '../components/ImageWithFallback';
import Toast from '../components/Toast';
import { optimizeImageComplete } from '../utils/imageOptimization';

// In development, use empty string to leverage Vite proxy
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Helper function to get full image URL
const getImageUrl = (path: string): string => {
  if (!path) return '';
  // Se è già un URL completo, ritornalo così com'è
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // TEMPORARY: Use production images even on localhost for preview
  const imageBaseUrl = import.meta.env.DEV
    ? 'https://alf-portfolio-api.eziopappalardo98.workers.dev'
    : API_BASE_URL;
  // Se è un path relativo, costruisci l'URL completo per R2
  return `${imageBaseUrl}${path}`;
};

const NewCollection: React.FC = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [availableImages, setAvailableImages] = useState<Array<{ filename: string; url: string }>>([]);
  const [allImages, setAllImages] = useState<Array<{ filename: string; url: string }>>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [formData, setFormData] = useState({
    title_it: '',
    slug: '',
    description_it: '',
    detailed_description_it: '',
    image_url: '',
    order_index: 1,
    is_visible: true
  });

  useEffect(() => {
    loadImages();
  }, []);

  // Disable Lenis when modal is open
  useEffect(() => {
    if (showImagePicker) {
      const lenis = (window as any).lenis;
      if (lenis) {
        lenis.stop();
      }
    } else {
      const lenis = (window as any).lenis;
      if (lenis) {
        lenis.start();
      }
    }
  }, [showImagePicker]);

  const loadImages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/media`);
      if (response.ok) {
        const data = await response.json() as { images?: Array<{ filename: string; url: string }> };
        // Keep all images (originals + thumbnails) for finding thumbnails
        setAllImages(data.images || []);
        // Filter out thumbnails - show only originals in the picker
        const originals = (data.images || []).filter(img => !img.filename.includes('_thumb'));
        setAvailableImages(originals);
      }
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setToast({ message: 'Per favore seleziona solo file immagine', type: 'error' });
      return;
    }

    setIsUploading(true);
    try {
      console.log('🚀 Ottimizzazione immagine collezione...');

      // Ottimizza immagine in WebP + thumbnail
      const { optimized, thumbnail } = await optimizeImageComplete(file);

      // Carica immagine ottimizzata
      console.log('📤 Upload immagine ottimizzata...');
      const uploadFormDataOptimized = new FormData();
      uploadFormDataOptimized.append('file', optimized);

      const responseOptimized = await fetch(`${API_BASE_URL}/api/media/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_API_KEY || ''}`
        },
        body: uploadFormDataOptimized
      });

      if (!responseOptimized.ok) throw new Error('Upload optimized failed');

      const dataOptimized = await responseOptimized.json() as { url: string };

      // Carica thumbnail
      console.log('📤 Upload thumbnail...');
      const uploadFormDataThumbnail = new FormData();
      uploadFormDataThumbnail.append('file', thumbnail);

      const responseThumbnail = await fetch(`${API_BASE_URL}/api/media/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_API_KEY || ''}`
        },
        body: uploadFormDataThumbnail
      });

      if (!responseThumbnail.ok) {
        console.warn('⚠️ Thumbnail upload failed, but main image is uploaded');
      }

      console.log('✅ Upload completato!');

      // Reload images to show the new one
      await loadImages();

      // Auto-select the uploaded image
      setFormData(prev => ({ ...prev, image_url: dataOptimized.url }));
      setShowImagePicker(false);

      setToast({ message: 'Immagine caricata e ottimizzata con successo!', type: 'success' });
    } catch (error) {
      console.error('❌ Errore upload:', error);
      setToast({ message: 'Errore durante il caricamento. Riprova.', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title_it || !formData.slug) {
      setToast({ message: 'Titolo e Slug sono obbligatori', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      await createCollection({
        title_it: formData.title_it,
        slug: formData.slug,
        description_it: formData.description_it,
        detailed_description_it: formData.detailed_description_it,
        image_url: formData.image_url,
        order_index: formData.order_index,
        is_visible: formData.is_visible
      } as any);

      setToast({ message: 'Collezione creata con successo!', type: 'success' });
      // Naviga dopo un breve delay per permettere al toast di essere visibile
      setTimeout(() => {
        navigate('/content?tab=collezioni');
      }, 1500);
    } catch (error) {
      console.error('Error creating collection:', error);
      const errorMessage = error instanceof Error ? error.message : 'Errore nella creazione della collezione';
      setToast({ message: errorMessage, type: 'error' });
      setSaving(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title_it: title,
      slug: generateSlug(title)
    });
  };

  return (
    <BackofficeLayout>
      <Helmet>
        <title>Nuova Collezione - Gestione Backoffice</title>
      </Helmet>

      <motion.div
        className="max-w-5xl mx-auto py-20 px-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
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
            <h1 className="text-4xl font-bold uppercase" style={{ fontFamily: 'Montserrat, sans-serif', color: 'white' }}>
              Nuova <span style={{ color: 'rgb(240, 45, 110)' }}>Collezione</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={formData.is_visible}
                  onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                  className="sr-only"
                />
                <div
                  style={{
                    width: '56px',
                    height: '28px',
                    borderRadius: '14px',
                    backgroundColor: formData.is_visible ? 'rgb(240, 45, 110)' : '#4B5563',
                    transition: 'background-color 0.3s',
                    position: 'relative'
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '12px',
                      backgroundColor: 'white',
                      position: 'absolute',
                      top: '2px',
                      left: formData.is_visible ? '30px' : '2px',
                      transition: 'left 0.3s',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                  />
                </div>
              </div>
              <span className="text-white font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Visibile nel frontend
              </span>
            </label>
          </div>
        </div>

        {/* Form Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Immagine Collezione */}
          <div
            onClick={() => setShowImagePicker(true)}
            className="relative cursor-pointer group rounded-xl overflow-hidden"
            style={{
              border: formData.image_url ? '2px solid rgba(255, 255, 255, 0.1)' : '2px dashed rgba(255, 255, 255, 0.3)',
              backgroundColor: formData.image_url ? 'transparent' : 'rgba(0, 0, 0, 0.3)'
            }}
          >
            {formData.image_url ? (
              <>
                {/* Image with overlay */}
                <div className="aspect-video relative">
                  <ImageWithFallback
                    src={getImageUrl(formData.image_url)}
                    alt="Copertina"
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
              </>
            ) : (
              <>
                {/* Empty state */}
                <div className="aspect-video flex flex-col items-center justify-center p-8">
                  <svg className="w-16 h-16 text-white/40 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-white/60 font-bold text-lg mb-1">Clicca per scegliere immagine</p>
                  <p className="text-white/40 text-sm">Immagine di copertina della collezione</p>
                </div>
              </>
            )}
          </div>

          {/* Informazioni Collezione */}
          <form id="collection-form" onSubmit={handleSubmit} className="bg-secondary p-8 rounded-xl border" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <h2 className="text-2xl font-bold text-white mb-6">Informazioni Collezione</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-white mb-2 font-bold">Titolo *</label>
                <input
                  type="text"
                  value={formData.title_it}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-2 bg-background text-white border rounded-lg"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  placeholder="es. OPERA 9"
                  required
                />
                <p className="text-white/60 text-sm mt-1">
                  Slug generato automaticamente: {formData.slug || 'slug'}
                </p>
              </div>

              <div>
                <label className="block text-white mb-2 font-bold">Descrizione Breve</label>
                <textarea
                  value={formData.description_it}
                  onChange={(e) => setFormData({ ...formData, description_it: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-background text-white border rounded-lg"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  placeholder="Breve descrizione che apparirà nella homepage..."
                />
              </div>

              <div>
                <label className="block text-white mb-2 font-bold">Descrizione Dettagliata</label>
                <textarea
                  value={formData.detailed_description_it || ''}
                  onChange={(e) => setFormData({ ...formData, detailed_description_it: e.target.value })}
                  rows={8}
                  className="w-full px-4 py-2 bg-background text-white border rounded-lg"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  placeholder="Testo lungo che apparirà nella sezione 'Il Perché di Questa Collezione' della pagina pubblica..."
                />
              </div>
            </div>
          </form>

          {/* Image Picker Modal */}
          {showImagePicker && createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={() => setShowImagePicker(false)}
              />

              {/* Modal Panel */}
              <div
                className="relative bg-secondary rounded-xl max-w-4xl w-full border max-h-[90vh] flex flex-col"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="p-8 pb-0">
                  <button
                    onClick={() => setShowImagePicker(false)}
                    className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-xl transition-all hover:scale-110"
                  >
                    <span className="text-white text-2xl">×</span>
                  </button>
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-white">Seleziona Immagine</h2>
                  </div>
                </div>

                {/* Content - Scrollable */}
                <div
                  className="flex-1 overflow-y-auto px-8 pb-8 scrollbar-hide"
                  onWheel={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                >
                  <div className="space-y-6">
                    {/* Drag & Drop Upload Zone */}
                    <div
                      className={`mb-6 border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        isDragging
                          ? 'border-accent bg-accent/10'
                          : 'border-white/20 hover:border-white/40'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      {isUploading ? (
                        <div className="text-white">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
                          <p>Caricamento in corso...</p>
                        </div>
                      ) : (
                        <>
                          <div className="text-white/80 mb-4">
                            <svg
                              className="mx-auto h-12 w-12 mb-2"
                              stroke="currentColor"
                              fill="none"
                              viewBox="0 0 48 48"
                              aria-hidden="true"
                            >
                              <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <p className="text-lg font-bold">Trascina un'immagine qui</p>
                            <p className="text-sm text-white/60 mt-1">oppure</p>
                          </div>
                          <label className="inline-block cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file);
                              }}
                            />
                            <span className="px-6 py-3 bg-accent text-white hover:bg-accent/80 transition-colors inline-block" style={{ borderRadius: 0 }}>
                              Seleziona File
                            </span>
                          </label>
                        </>
                      )}
                    </div>

                    <div className="border-t border-white/10 pt-6 mb-4">
                      <h4 className="text-white font-bold mb-4">Oppure scegli da Storage:</h4>
                    </div>

                    {availableImages.length === 0 ? (
                      <p className="text-white/60 text-center py-8">Nessuna immagine disponibile nello storage</p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {availableImages.map((image) => {
                          // Find corresponding thumbnail
                          const thumbnailFilename = image.filename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '_thumb.$1');
                          const thumbnail = allImages.find(img => img.filename === thumbnailFilename);
                          const displayUrl = thumbnail ? thumbnail.url : image.url;

                          return (
                            <div
                              key={image.filename}
                              className="cursor-pointer group"
                              onClick={() => {
                                // Set the ORIGINAL high-quality image URL
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
              </div>
            </div>,
            document.body
          )}
        </motion.div>

        {/* Floating Buttons */}
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
            form="collection-form"
            disabled={saving}
            className="px-6 py-3 font-bold uppercase text-white transition-all disabled:opacity-50 hover:opacity-90 shadow-lg"
            style={{ backgroundColor: 'rgb(240, 45, 110)', fontFamily: 'Montserrat, sans-serif', borderRadius: 0 }}
          >
            {saving ? 'Creazione...' : 'Crea Collezione'}
          </button>
        </div>
      </motion.div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={!!toast}
          onClose={() => setToast(null)}
        />
      )}
    </BackofficeLayout>
  );
};

export default NewCollection;