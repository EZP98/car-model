import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import BackofficeLayout from '../components/BackofficeLayout';
import { getExhibition, updateExhibition, deleteExhibition } from '../services/exhibitions-api';

const ExhibitionManagement: React.FC = () => {
  const { exhibitionId } = useParams<{ exhibitionId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
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
    order_index: 0,
    is_visible: true
  });

  useEffect(() => {
    loadExhibition();
  }, [exhibitionId]);

  const loadExhibition = async () => {
    if (!exhibitionId) return;

    setLoading(true);
    try {
      const exhibition = await getExhibition(parseInt(exhibitionId));
      setFormData({
        title: exhibition.title,
        subtitle: exhibition.subtitle || '',
        location: exhibition.location,
        date: exhibition.date,
        description: exhibition.description,
        info: exhibition.info || '',
        website: exhibition.website || '',
        image_url: exhibition.image_url || '',
        slug: exhibition.slug,
        order_index: exhibition.order_index,
        is_visible: exhibition.is_visible
      });
    } catch (error) {
      console.error('Error loading exhibition:', error);
      alert('Errore nel caricamento della mostra');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exhibitionId) return;

    setSaving(true);
    try {
      await updateExhibition(parseInt(exhibitionId), {
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
      alert('Mostra aggiornata con successo');
    } catch (error) {
      console.error('Error updating exhibition:', error);
      alert('Errore nell\'aggiornamento della mostra');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!exhibitionId) return;

    if (!window.confirm('Sei sicuro di voler eliminare questa mostra? Questa azione non può essere annullata.')) {
      return;
    }

    try {
      await deleteExhibition(parseInt(exhibitionId));
      navigate('/content');
    } catch (error) {
      console.error('Error deleting exhibition:', error);
      alert('Errore nell\'eliminazione della mostra');
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
        <title>Gestione Mostra - {formData.title} - Backoffice</title>
      </Helmet>

      <div className="max-w-5xl mx-auto py-20 px-12">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <button
              onClick={() => navigate('/content')}
              className="text-white/60 hover:text-white mb-4 flex items-center gap-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Torna a Gestione Contenuti
            </button>
            <h1 className="text-4xl font-bold text-white uppercase" style={{ fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}>
              Gestione <span style={{ color: 'rgb(240, 45, 110)' }}>Mostra</span>
            </h1>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <span className="text-white font-bold">Visibile</span>
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
          </label>
        </div>

        {/* Form */}
        <motion.form
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
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-background text-white border rounded-lg focus:outline-none focus:border-pink-500 transition-colors"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
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
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 bg-background text-white border rounded-lg focus:outline-none focus:border-pink-500 transition-colors"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                placeholder="es. 5 - 27 Ottobre 2024"
                required
              />
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
                required
              />
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
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-8 pt-8 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 font-bold uppercase text-white rounded-lg transition-all disabled:opacity-50 hover:opacity-90"
              style={{ backgroundColor: 'rgb(240, 45, 110)', fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}
            >
              {saving ? 'Salvataggio...' : 'Salva Modifiche'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/content')}
              className="px-8 py-3 font-bold uppercase text-white border rounded-lg hover:bg-white/5 transition-colors"
              style={{ borderColor: 'rgba(255, 255, 255, 0.1)', fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}
            >
              Annulla
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="ml-auto px-8 py-3 font-bold uppercase text-red-400 border border-red-400 rounded-lg hover:bg-red-400/10 transition-colors"
              style={{ fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}
            >
              Elimina Mostra
            </button>
          </div>
        </motion.form>
      </div>
    </BackofficeLayout>
  );
};

export default ExhibitionManagement;
