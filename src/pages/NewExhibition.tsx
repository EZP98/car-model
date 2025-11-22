import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import BackofficeLayout from '../components/BackofficeLayout';
import { createExhibition } from '../services/exhibitions-api';
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

const NewExhibition: React.FC = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    location: '',
    date: '',
    description: '',
    info: '',
    website: '',
    image_url: '',
    slug: '',
    order_index: 1,
    is_visible: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.slug || !formData.location || !formData.date) {
      alert('I campi obbligatori devono essere compilati');
      return;
    }

    setSaving(true);
    try {
      const newExhibition = await createExhibition({
        title: formData.title,
        subtitle: formData.subtitle || undefined,
        location: formData.location,
        date: formData.date,
        description: formData.description,
        info: formData.info || undefined,
        website: formData.website || undefined,
        image_url: formData.image_url || undefined,
        slug: formData.slug,
        order_index: formData.order_index,
        is_visible: formData.is_visible
      });

      navigate(`/content/mostra/${newExhibition.id}`);
    } catch (error) {
      console.error('Error creating exhibition:', error);
      alert('Errore nella creazione della mostra');
      setSaving(false);
    }
  };

  const generateSlug = (title: string, date: string) => {
    const year = date ? new Date(date).getFullYear() : new Date().getFullYear();
    const slug = `${title}-${year}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return slug;
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title, prev.date)
    }));
  };

  const handleDateChange = (date: string) => {
    setFormData(prev => ({
      ...prev,
      date,
      slug: generateSlug(prev.title, date)
    }));
  };

  return (
    <BackofficeLayout>
      <Helmet>
        <title>Nuova Mostra - Gestione Backoffice</title>
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
            Nuova <span style={{ color: 'rgb(240, 45, 110)' }}>Mostra</span>
          </h1>
        </div>

        {/* Form */}
        <motion.form
          id="exhibition-form"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-secondary p-8 rounded-xl border"
          style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Titolo */}
            <div>
              <label className="block text-white mb-2 font-bold">
                Titolo Mostra *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-4 py-3 bg-background text-white border rounded-lg focus:outline-none focus:border-pink-500 transition-colors"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                placeholder="es. UNISONO"
                required
              />
            </div>

            {/* Sottotitolo */}
            <div>
              <label className="block text-white mb-2 font-bold">
                Sottotitolo
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-4 py-3 bg-background text-white border rounded-lg focus:outline-none focus:border-pink-500 transition-colors"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                placeholder="es. Personale di Adele Lo Feudo"
              />
            </div>

            {/* Luogo */}
            <div>
              <label className="block text-white mb-2 font-bold">
                Luogo *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 bg-background text-white border rounded-lg focus:outline-none focus:border-pink-500 transition-colors"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                placeholder="es. Loggia dei Lanari, Perugia"
                required
              />
            </div>

            {/* Data */}
            <div>
              <label className="block text-white mb-2 font-bold">
                Data *
              </label>
              <input
                type="text"
                value={formData.date}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full px-4 py-3 bg-background text-white border rounded-lg focus:outline-none focus:border-pink-500 transition-colors"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                placeholder="es. 5 - 27 Ottobre 2024"
                required
              />
              <p className="text-white/60 text-sm mt-1">
                Inserisci la data o il periodo in formato libero
              </p>
            </div>

            {/* Descrizione */}
            <div className="md:col-span-2">
              <label className="block text-white mb-2 font-bold">
                Descrizione
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-background text-white border rounded-lg focus:outline-none focus:border-pink-500 transition-colors resize-none"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                placeholder="Una mostra che esplora l'unità tra l'artista e la sua opera..."
              />
            </div>

            {/* Info */}
            <div className="md:col-span-2">
              <label className="block text-white mb-2 font-bold">
                Info Aggiuntive
              </label>
              <textarea
                value={formData.info}
                onChange={(e) => setFormData({ ...formData, info: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-background text-white border rounded-lg focus:outline-none focus:border-pink-500 transition-colors resize-none"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                placeholder="Orari di apertura, biglietti, altre informazioni..."
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-white mb-2 font-bold">
                Sito Web
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-4 py-3 bg-background text-white border rounded-lg focus:outline-none focus:border-pink-500 transition-colors"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                placeholder="https://..."
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-white mb-2 font-bold">
                Slug (URL) *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-3 bg-background text-white border rounded-lg focus:outline-none focus:border-pink-500 transition-colors"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                placeholder="es. unisono-2024"
                required
              />
              <p className="text-white/60 text-sm mt-1">
                URL: /mostre/{formData.slug || 'slug'}
              </p>
            </div>

            {/* Ordine */}
            <div>
              <label className="block text-white mb-2 font-bold">
                Ordine di visualizzazione
              </label>
              <input
                type="number"
                value={formData.order_index}
                onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-background text-white border rounded-lg focus:outline-none focus:border-pink-500 transition-colors"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                placeholder="0"
              />
            </div>

            {/* Immagine */}
            <div className="md:col-span-2">
              <label className="block text-white mb-2 font-bold">
                Immagine Copertina
              </label>
              <input
                type="text"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-4 py-3 bg-background text-white border rounded-lg focus:outline-none focus:border-pink-500 transition-colors"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                placeholder="/path/to/image.jpg"
              />
              {formData.image_url && (
                <div className="mt-4 h-40 w-auto inline-block">
                  <ImageWithFallback
                    src={getImageUrl(formData.image_url)}
                    alt="Anteprima"
                    className="rounded-lg"
                    objectFit="cover"
                    loading="eager"
                  />
                </div>
              )}
            </div>

            {/* Visibilità */}
            <div className="md:col-span-2">
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
                Se disattivato, la mostra sarà salvata ma non visibile nel sito pubblico
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
            form="exhibition-form"
            disabled={saving}
            className="px-6 py-3 font-bold uppercase text-white transition-all disabled:opacity-50 hover:opacity-90 shadow-lg"
            style={{ backgroundColor: 'rgb(240, 45, 110)', fontFamily: 'Montserrat, sans-serif', borderRadius: 0 }}
          >
            {saving ? 'Creazione...' : 'Crea Mostra'}
          </button>
        </div>

        {/* Help text */}
        <div className="mt-8 p-6 bg-secondary/50 rounded-xl border" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
          <h3 className="text-white font-bold mb-3">Suggerimenti:</h3>
          <ul className="text-white/60 space-y-2 text-sm">
            <li>• Il titolo apparirà nella homepage e nella sezione mostre</li>
            <li>• Lo slug viene generato automaticamente ma puoi modificarlo</li>
            <li>• La data può essere un singolo giorno o un periodo (es. "5 - 27 Ottobre 2024")</li>
            <li>• L'ordine di visualizzazione determina la posizione nella lista (numero più basso = prima posizione)</li>
          </ul>
        </div>
      </motion.div>
    </BackofficeLayout>
  );
};

export default NewExhibition;
