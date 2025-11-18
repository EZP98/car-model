import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
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
    city: '',
    start_date: '',
    end_date: '',
    description: '',
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
        city: exhibition.city,
        start_date: exhibition.start_date.split('T')[0], // Format for date input
        end_date: exhibition.end_date ? exhibition.end_date.split('T')[0] : '',
        description: exhibition.description,
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
        ...formData,
        subtitle: formData.subtitle || undefined,
        end_date: formData.end_date || undefined,
        image_url: formData.image_url || undefined
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

  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white text-xl">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Gestione Mostra - {formData.title} - Backoffice</title>
      </Helmet>

      <div className="max-w-6xl mx-auto py-20 px-6">
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
                placeholder="es. Loggia dei Lanari, Piazza Matteotti 18"
                required
              />
            </div>

            {/* Città */}
            <div>
              <label className="block text-white mb-2 font-bold">
                Città *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-3 bg-background text-white border rounded-lg focus:outline-none focus:border-pink-500 transition-colors"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                placeholder="es. Perugia"
                required
              />
            </div>

            {/* Data Inizio */}
            <div>
              <label className="block text-white mb-2 font-bold">
                Data Inizio *
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-3 bg-background text-white border rounded-lg focus:outline-none focus:border-pink-500 transition-colors"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                required
              />
            </div>

            {/* Data Fine */}
            <div>
              <label className="block text-white mb-2 font-bold">
                Data Fine
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-4 py-3 bg-background text-white border rounded-lg focus:outline-none focus:border-pink-500 transition-colors"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
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
                placeholder="Descrizione della mostra..."
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
                placeholder="es. unisono-perugia-2024"
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
                <div className="mt-4">
                  <img
                    src={formData.image_url}
                    alt="Anteprima"
                    className="h-40 object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.jpg';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Preview Date */}
            {(formData.start_date || formData.end_date) && (
              <div className="md:col-span-2 p-4 bg-background rounded-lg border" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                <p className="text-white/60 text-sm mb-2">Anteprima date:</p>
                <p className="text-white">
                  {formatDateForDisplay(formData.start_date)}
                  {formData.end_date && ` - ${formatDateForDisplay(formData.end_date)}`}
                </p>
              </div>
            )}
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
    </div>
  );
};

export default ExhibitionManagement;