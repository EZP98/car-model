import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ImageWithFallback from '../components/ImageWithFallback';

interface OperaFormData {
  id?: number;
  title: string;
  description: string;
  image: string;
  series: string;
}

const OperaForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const operaId = searchParams.get('id');

  const [formData, setFormData] = useState<OperaFormData>({
    title: '',
    description: '',
    image: '/opera.png',
    series: 'Name series'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Salvare i dati
    console.log('Salvando opera:', formData);
    navigate('/content');
  };

  const handleCancel = () => {
    navigate('/content');
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{operaId ? 'Modifica Opera' : 'Nuova Opera'} - Adele Lo Feudo</title>
      </Helmet>

      <div className="max-w-4xl mx-auto py-20 px-6">
        <div className="mb-12">
          <button
            onClick={handleCancel}
            className="text-white mb-6 flex items-center gap-2 hover:opacity-80 transition-opacity"
            style={{ fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}
          >
            <span>←</span> Torna alla lista
          </button>

          <h1 className="text-4xl font-bold text-white uppercase" style={{ fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}>
            {operaId ? 'Modifica' : 'Nuova'} <span style={{ color: 'rgb(240, 45, 110)' }}>Opera</span>
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-secondary p-8 rounded-lg border-2" style={{ borderColor: 'rgba(240, 45, 110, 0.3)' }}>
          <div className="space-y-6">
            {/* Titolo */}
            <div>
              <label className="block text-white mb-3 font-bold text-lg" style={{ fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}>
                Titolo Opera
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Es: Opera 1"
                required
                className="w-full px-4 py-3 bg-background text-white border-2 rounded text-lg"
                style={{ borderColor: 'rgba(240, 45, 110, 0.3)', fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}
              />
            </div>

            {/* Descrizione */}
            <div>
              <label className="block text-white mb-3 font-bold text-lg" style={{ fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}>
                Descrizione
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrizione dell'opera..."
                required
                rows={4}
                className="w-full px-4 py-3 bg-background text-white border-2 rounded text-lg"
                style={{ borderColor: 'rgba(240, 45, 110, 0.3)', fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}
              />
            </div>

            {/* Serie */}
            <div>
              <label className="block text-white mb-3 font-bold text-lg" style={{ fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}>
                Serie
              </label>
              <input
                type="text"
                value={formData.series}
                onChange={(e) => setFormData({ ...formData, series: e.target.value })}
                placeholder="Es: Name series"
                required
                className="w-full px-4 py-3 bg-background text-white border-2 rounded text-lg"
                style={{ borderColor: 'rgba(240, 45, 110, 0.3)', fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}
              />
            </div>

            {/* Upload Immagine */}
            <div>
              <label className="block text-white mb-3 font-bold text-lg" style={{ fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}>
                Immagine
              </label>

              <div className="space-y-4">
                {/* Preview immagine */}
                {formData.image && (
                  <div className="w-full max-w-md mx-auto border-2 rounded overflow-hidden" style={{ borderColor: 'rgba(240, 45, 110, 0.3)' }}>
                    <ImageWithFallback
                      src={formData.image}
                      alt="Preview"
                      objectFit="contain"
                      loading="eager"
                    />
                  </div>
                )}

                {/* Input file */}
                <div className="flex flex-col gap-3">
                  <label
                    className="cursor-pointer px-6 py-3 font-bold uppercase text-white text-center border-2 rounded transition-all hover:opacity-80"
                    style={{ borderColor: 'rgb(240, 45, 110)', fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // TODO: Upload su server/cloud
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData({ ...formData, image: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    Scegli immagine
                  </label>

                  <p className="text-gray text-sm text-center" style={{ fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}>
                    Oppure inserisci un URL immagine
                  </p>

                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://esempio.com/immagine.jpg"
                    className="w-full px-4 py-3 bg-background text-white border-2 rounded text-lg"
                    style={{ borderColor: 'rgba(240, 45, 110, 0.3)', fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pulsanti azione */}
          <div className="flex gap-4 mt-8 pt-6 border-t-2" style={{ borderColor: 'rgba(240, 45, 110, 0.3)' }}>
            <button
              type="submit"
              className="flex-1 px-8 py-4 font-bold uppercase text-white text-lg transition-all hover:opacity-90"
              style={{ backgroundColor: 'rgb(240, 45, 110)', fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}
            >
              Salva Opera
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-8 py-4 font-bold uppercase text-white border-2 text-lg transition-all hover:bg-background"
              style={{ borderColor: 'rgba(240, 45, 110, 0.3)', fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}
            >
              Annulla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OperaForm;
