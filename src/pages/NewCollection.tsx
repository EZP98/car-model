import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import BackofficeLayout from '../components/BackofficeLayout';
import { createCollection } from '../services/collections-api';
import Toast from '../components/Toast';
import ImageWithFallback from '../components/ImageWithFallback';

// In development, use empty string to leverage Vite proxy
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Helper function to get full image URL
const getImageUrl = (path: string): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // TEMPORARY: Use production images even on localhost for preview
  const imageBaseUrl = import.meta.env.DEV
    ? 'https://alf-portfolio-api.eziopappalardo98.workers.dev'
    : API_BASE_URL;
  return `${imageBaseUrl}${path}`;
};

const NewCollection: React.FC = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    image_url: '',
    order_index: 1,
    is_visible: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.slug) {
      setToast({ message: 'Titolo e Slug sono obbligatori', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      const newCollection = await createCollection({
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        image_url: formData.image_url,
        order_index: formData.order_index,
        is_visible: formData.is_visible
      });

      // Mostra messaggio di successo
      setToast({ message: 'Collezione creata con successo!', type: 'success' });

      // Naviga alla pagina di gestione della nuova collezione dopo un breve delay
      setTimeout(() => {
        navigate(`/content/collezione/${newCollection.id}`);
      }, 1000);
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
      title,
      slug: generateSlug(title)
    });
  };

  return (
    <BackofficeLayout>
      <Helmet>
        <title>Nuova Collezione - Gestione Backoffice</title>
      </Helmet>

      <motion.div
        className="max-w-4xl mx-auto py-20 px-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Header */}
        <div className="mb-8">
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
            Nuova <span style={{ color: 'rgb(240, 45, 110)' }}>Collezione</span>
          </h1>
        </div>

        {/* Form */}
        <motion.form
          id="collection-form"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-secondary p-8 rounded-xl border"
          style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
        >
          <div className="space-y-6">
            {/* Titolo */}
            <div>
              <label className="block text-white mb-2 font-bold">
                Titolo *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-4 py-3 bg-background text-white border rounded-lg focus:outline-none focus:border-pink-500 transition-colors"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                placeholder="es. OPERA 9"
                required
              />
            </div>

            {/* Descrizione */}
            <div>
              <label className="block text-white mb-2 font-bold">
                Descrizione
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-background text-white border rounded-lg focus:outline-none focus:border-pink-500 transition-colors resize-none"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                placeholder="Descrizione della collezione..."
              />
            </div>

            {/* Immagine Copertina */}
            <div>
              <label className="block text-white mb-2 font-bold">
                Immagine Copertina
              </label>
              <input
                type="text"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-4 py-3 bg-background text-white border rounded-lg focus:outline-none focus:border-pink-500 transition-colors"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                placeholder="/DSCF9079.jpg"
              />
            </div>

            {/* Ordine */}
            <div>
              <label className="block text-white mb-2 font-bold">
                Ordine di visualizzazione
              </label>
              <input
                type="number"
                min="1"
                value={formData.order_index}
                onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-3 bg-background text-white border rounded-lg focus:outline-none focus:border-pink-500 transition-colors"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                placeholder="1"
              />
              <p className="text-white/60 text-sm mt-1">
                1 = prima posizione. Se usi numeri uguali o salti (es. 1, 5, 12), l'ordine sarà comunque corretto.
              </p>
            </div>

            {/* Anteprima immagine */}
            {formData.image_url && (
              <div>
                <label className="block text-white mb-2 font-bold">
                  Anteprima Immagine
                </label>
                <div className="border rounded-lg overflow-hidden h-64" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                  <ImageWithFallback
                    src={getImageUrl(formData.image_url)}
                    alt="Anteprima"
                    objectFit="cover"
                    loading="eager"
                  />
                </div>
              </div>
            )}

            {/* Visibilità */}
            <div>
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
                  Visibile nel frontend immediatamente
                </span>
              </label>
              <p className="text-white/60 text-sm mt-2 ml-16">
                Se disattivato, la collezione sarà salvata ma non visibile nel sito pubblico
              </p>
            </div>
          </div>

        </motion.form>

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

        {/* Help text */}
        <div className="mt-8 p-6 bg-secondary/50 rounded-xl border" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
          <h3 className="text-white font-bold mb-3">Suggerimenti:</h3>
          <ul className="text-white/60 space-y-2 text-sm">
            <li>• Il titolo apparirà nella homepage e nelle pagine della collezione</li>
            <li>• L'ordine di visualizzazione determina la posizione nella homepage (numero più basso = prima posizione)</li>
            <li>• Puoi aggiungere le opere alla collezione dopo averla creata</li>
          </ul>
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