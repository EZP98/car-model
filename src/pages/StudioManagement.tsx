import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import BackofficeLayout from '../components/BackofficeLayout';
import Toast from '../components/Toast';
import ImageWithFallback from '../components/ImageWithFallback';
import ImagePickerModal from '../components/ImagePickerModal';
import { getStudio, updateStudio } from '../services/studio-api';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

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

const StudioManagement: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [formData, setFormData] = useState({
    paragraph1_it: '',
    paragraph2_it: '',
    paragraph3_it: '',
    paragraph4_it: '',
    image_url: ''
  });
  const [originalData, setOriginalData] = useState({
    paragraph1_it: '',
    paragraph2_it: '',
    paragraph3_it: '',
    paragraph4_it: '',
    image_url: ''
  });

  useEffect(() => {
    loadStudio();
  }, []);

  const loadStudio = async () => {
    setLoading(true);
    try {
      const studio = await getStudio();
      console.log('Studio loaded:', studio);
      if (studio) {
        const data = {
          paragraph1_it: studio.paragraph1_it || '',
          paragraph2_it: studio.paragraph2_it || '',
          paragraph3_it: studio.paragraph3_it || '',
          paragraph4_it: studio.paragraph4_it || '',
          image_url: studio.image_url || ''
        };
        console.log('Form data:', data);
        setFormData(data);
        setOriginalData(data);
      } else {
        console.log('No studio data found');
      }
    } catch (error) {
      console.error('Error loading studio:', error);
      setToast({ message: 'Errore nel caricamento dello studio', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Handle image selection from modal
  const handleSelectImage = (imageUrl: string) => {
    setFormData({ ...formData, image_url: imageUrl });
    setShowImagePicker(false);
  };

  // Check if there are unsaved changes
  const hasChanges = React.useMemo(() => {
    return formData.paragraph1_it !== originalData.paragraph1_it ||
           formData.paragraph2_it !== originalData.paragraph2_it ||
           formData.paragraph3_it !== originalData.paragraph3_it ||
           formData.paragraph4_it !== originalData.paragraph4_it ||
           formData.image_url !== originalData.image_url;
  }, [formData, originalData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);
    try {
      await updateStudio({
        paragraph1_it: formData.paragraph1_it,
        paragraph2_it: formData.paragraph2_it,
        paragraph3_it: formData.paragraph3_it,
        paragraph4_it: formData.paragraph4_it,
        image_url: formData.image_url || null
      });
      setOriginalData(formData);
      setToast({ message: 'Studio aggiornato con successo', type: 'success' });
      loadStudio();
    } catch (error) {
      console.error('Error updating studio:', error);
      setToast({ message: 'Errore nell\'aggiornamento dello studio', type: 'error' });
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

  console.log('Rendering with formData:', formData);

  return (
    <BackofficeLayout>
      <Helmet>
        <title>Gestione Studio - Backoffice</title>
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
              Gestione <span style={{ color: 'rgb(240, 45, 110)' }}>Studio</span>
            </h1>
          </div>
        </div>

        {/* Form */}
        <motion.form
          id="studio-form"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row gap-8 md:gap-12 items-start"
        >
            {/* Left: Image Picker */}
            <div className="w-full md:w-[380px] flex-shrink-0">
              <label className="block text-white mb-4 font-bold">
                Immagine Studio
              </label>
              <div
                className="group border border-white/10 rounded-lg overflow-hidden bg-black cursor-pointer hover:border-accent transition-colors"
                onClick={() => setShowImagePicker(true)}
              >
                {formData.image_url ? (
                  <div className="aspect-[3/4] relative">
                    <ImageWithFallback
                      src={getImageUrl(formData.image_url)}
                      alt="Studio"
                      aspectRatio="aspect-[3/4]"
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
                  <div className="aspect-[3/4] flex flex-col items-center justify-center p-8">
                    <svg className="w-16 h-16 text-white/40 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-white/60 font-bold text-lg mb-1">Clicca per scegliere immagine</p>
                    <p className="text-white/40 text-sm">Immagine dello studio</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Paragraphs */}
            <div className="flex-1 space-y-6">
              {/* Paragraph 1 */}
              <div>
                <label className="block text-white mb-2 font-bold">
                  Paragrafo 1
                </label>
                <textarea
                  value={formData.paragraph1_it}
                  onChange={(e) => setFormData({ ...formData, paragraph1_it: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 bg-background text-white border rounded-lg focus:outline-none focus:border-pink-500 transition-colors resize-none"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  placeholder="Primo paragrafo della descrizione dello studio..."
                />
              </div>

              {/* Paragraph 2 */}
              <div>
                <label className="block text-white mb-2 font-bold">
                  Paragrafo 2
                </label>
                <textarea
                  value={formData.paragraph2_it}
                  onChange={(e) => setFormData({ ...formData, paragraph2_it: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 bg-background text-white border rounded-lg focus:outline-none focus:border-pink-500 transition-colors resize-none"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  placeholder="Secondo paragrafo della descrizione dello studio..."
                />
              </div>

              {/* Paragraph 3 */}
              <div>
                <label className="block text-white mb-2 font-bold">
                  Paragrafo 3
                </label>
                <textarea
                  value={formData.paragraph3_it}
                  onChange={(e) => setFormData({ ...formData, paragraph3_it: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 bg-background text-white border rounded-lg focus:outline-none focus:border-pink-500 transition-colors resize-none"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  placeholder="Terzo paragrafo della descrizione dello studio..."
                />
              </div>

              {/* Paragraph 4 */}
              <div>
                <label className="block text-white mb-2 font-bold">
                  Paragrafo 4
                </label>
                <textarea
                  value={formData.paragraph4_it}
                  onChange={(e) => setFormData({ ...formData, paragraph4_it: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 bg-background text-white border rounded-lg focus:outline-none focus:border-pink-500 transition-colors resize-none"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  placeholder="Quarto paragrafo della descrizione dello studio..."
                />
              </div>

              <p className="text-white/60 text-sm">
                Le traduzioni dei paragrafi vengono gestite nella sezione Traduzioni.
              </p>
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
            form="studio-form"
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
      <ImagePickerModal
        isOpen={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onSelectImage={handleSelectImage}
      />
    </BackofficeLayout>
  );
};

export default StudioManagement;
