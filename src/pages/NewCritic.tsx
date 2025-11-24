import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import BackofficeLayout from '../components/BackofficeLayout';
import { createCritic } from '../services/critics-api';
import Toast from '../components/Toast';

const NewCritic: React.FC = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    text: '',
    text_it: '',
    text_en: '',
    order_index: 1,
    is_visible: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.role || !formData.text) {
      setToast({ message: 'I campi obbligatori devono essere compilati', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      await createCritic({
        name: formData.name,
        role: formData.role,
        text: formData.text,
        text_it: formData.text_it || undefined,
        text_en: formData.text_en || undefined,
        order_index: formData.order_index,
        is_visible: formData.is_visible
      });

      setToast({ message: 'Critico creato con successo!', type: 'success' });
      setTimeout(() => {
        navigate('/content?tab=critica');
      }, 1500);
    } catch (error) {
      console.error('Error creating critic:', error);
      setToast({ message: 'Errore nella creazione del critico', type: 'error' });
      setSaving(false);
    }
  };

  return (
    <BackofficeLayout>
      <Helmet>
        <title>Nuovo Critico - Gestione Backoffice</title>
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
            Nuovo <span style={{ color: 'rgb(240, 45, 110)' }}>Critico</span>
          </h1>
        </div>

        {/* Form */}
        <motion.form
          id="critic-form"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-secondary p-8 rounded-xl border"
          style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nome */}
            <div>
              <label className="block text-white mb-2 font-bold">
                Nome Critico *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-background text-white border rounded-lg focus:outline-none focus:border-pink-500 transition-colors"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                placeholder="es. Angelo Leidi"
                required
              />
            </div>

            {/* Ruolo */}
            <div>
              <label className="block text-white mb-2 font-bold">
                Ruolo *
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-3 bg-background text-white border rounded-lg focus:outline-none focus:border-pink-500 transition-colors"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                placeholder="es. Critico d'Arte"
                required
              />
            </div>

            {/* Recensione (Testo principale) */}
            <div className="md:col-span-2">
              <label className="block text-white mb-2 font-bold">
                Recensione *
              </label>
              <textarea
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 bg-background text-white border rounded-lg focus:outline-none focus:border-pink-500 transition-colors resize-none"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                placeholder='"The works of Adele Lo Feudo represent a journey into the human soul..."'
                required
              />
              <p className="text-white/60 text-sm mt-1">
                Testo principale della recensione
              </p>
            </div>

            {/* Recensione (Italiano) */}
            <div className="md:col-span-2">
              <label className="block text-white mb-2 font-bold">
                Recensione (Italiano)
              </label>
              <textarea
                value={formData.text_it}
                onChange={(e) => setFormData({ ...formData, text_it: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 bg-background text-white border rounded-lg focus:outline-none focus:border-pink-500 transition-colors resize-none"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                placeholder="Le opere di Adele Lo Feudo sono un viaggio nell'anima umana..."
              />
              <p className="text-white/60 text-sm mt-1">
                Opzionale. Traduzione italiana della recensione
              </p>
            </div>

            {/* Recensione (Inglese) */}
            <div className="md:col-span-2">
              <label className="block text-white mb-2 font-bold">
                Recensione (Inglese)
              </label>
              <textarea
                value={formData.text_en}
                onChange={(e) => setFormData({ ...formData, text_en: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 bg-background text-white border rounded-lg focus:outline-none focus:border-pink-500 transition-colors resize-none"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                placeholder='"English translation of the review..."'
              />
              <p className="text-white/60 text-sm mt-1">
                Opzionale. Traduzione inglese della recensione
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
              <p className="text-white/60 text-sm mt-1">
                Numero più basso = prima posizione nella lista
              </p>
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
                Se disattivato, il critico sarà salvato ma non visibile nel sito pubblico
              </p>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-8 p-6 bg-background rounded-lg border" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <h3 className="text-white font-bold mb-4">Anteprima:</h3>
            <div className="space-y-2">
              <h4 className="text-xl font-bold" style={{ color: 'rgb(240, 45, 110)' }}>
                {formData.name || 'Nome Critico'}
              </h4>
              <p className="text-white/60">{formData.role || 'Ruolo'}</p>
              <p className="text-white italic mt-4">
                "{formData.text || 'La recensione apparirà qui...'}"
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
            form="critic-form"
            disabled={saving}
            className="px-6 py-3 font-bold uppercase text-white transition-all disabled:opacity-50 hover:opacity-90 shadow-lg"
            style={{ backgroundColor: 'rgb(240, 45, 110)', fontFamily: 'Montserrat, sans-serif', borderRadius: 0 }}
          >
            {saving ? 'Creazione...' : 'Crea Critico'}
          </button>
        </div>

        {/* Help text */}
        <div className="mt-8 p-6 bg-secondary/50 rounded-xl border" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
          <h3 className="text-white font-bold mb-3">Suggerimenti:</h3>
          <ul className="text-white/60 space-y-2 text-sm">
            <li>• Il nome e il ruolo appariranno nella sezione Critica del sito</li>
            <li>• Inserisci la recensione completa, verrà visualizzata con le virgolette</li>
            <li>• Puoi inserire la recensione in entrambe le lingue per il sito multilingua</li>
            <li>• L'ordine determina la posizione nella pagina (i numeri più bassi appaiono prima)</li>
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

export default NewCritic;