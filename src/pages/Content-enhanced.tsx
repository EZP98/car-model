import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import {
  getArtworks,
  getSections,
  updateArtwork,
  deleteArtwork,
  getNewsletterSubscribers,
  deleteNewsletterSubscriber,
  type Artwork,
  type Section,
  type NewsletterSubscriber
} from '../services/api';
import {
  getCritics,
  createCritic,
  updateCritic,
  deleteCritic,
  getExhibitions,
  createExhibition,
  updateExhibition,
  deleteExhibition,
  type Critic,
  type Exhibition
} from '../services/content-api';
import { useLanguage } from '../i18n/LanguageContext';

type TabType = 'opere' | 'sezioni' | 'newsletter' | 'critica' | 'biografia' | 'mostre';

const ContentEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('opere');
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [critics, setCritics] = useState<Critic[]>([]);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Stati per biografia
  const [bioContent, setBioContent] = useState({
    it: '',
    en: ''
  });

  // Carica i dati all'avvio
  useEffect(() => {
    loadData();
  }, [activeTab, language]);

  const loadData = async () => {
    try {
      setLoading(true);

      if (activeTab === 'opere' || activeTab === 'sezioni' || activeTab === 'newsletter') {
        const [artworksData, sectionsData, subscribersData] = await Promise.all([
          getArtworks(),
          getSections(),
          getNewsletterSubscribers()
        ]);
        setArtworks(artworksData);
        setSections(sectionsData);
        setSubscribers(subscribersData);
      } else if (activeTab === 'critica') {
        const criticsData = await getCritics(language);
        setCritics(criticsData);
      } else if (activeTab === 'mostre') {
        const exhibitionsData = await getExhibitions();
        setExhibitions(exhibitionsData);
      } else if (activeTab === 'biografia') {
        // Carica contenuti biografia dal database o localStorage
        const savedBio = localStorage.getItem('artist-bio');
        if (savedBio) {
          setBioContent(JSON.parse(savedBio));
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Usa dati di fallback se l'API non è disponibile
      if (activeTab === 'critica') {
        // Dati di fallback per critici
        setCritics([]);
      }
      if (activeTab === 'mostre') {
        // Dati di fallback per mostre
        setExhibitions([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handler per critici
  const handleEditCritic = (critic: Critic) => {
    setEditingId(critic.id);
    setFormData({ ...critic });
  };

  const handleSaveCritic = async () => {
    if (formData && editingId) {
      try {
        await updateCritic(editingId, formData);
        await loadData();
        setEditingId(null);
        setFormData(null);
        alert('Critico aggiornato con successo!');
      } catch (error) {
        console.error('Error updating critic:', error);
        alert('Errore durante l\'aggiornamento del critico');
      }
    }
  };

  const handleDeleteCritic = async (id: number) => {
    if (confirm('Sei sicuro di voler eliminare questo critico?')) {
      try {
        await deleteCritic(id);
        await loadData();
        alert('Critico eliminato con successo!');
      } catch (error) {
        console.error('Error deleting critic:', error);
        alert('Errore durante l\'eliminazione del critico');
      }
    }
  };

  const handleAddCritic = async () => {
    const name = prompt('Nome del critico:');
    if (!name) return;

    const role = prompt('Ruolo del critico:');
    if (!role) return;

    const text = prompt('Testo della recensione:');
    if (!text) return;

    try {
      await createCritic({
        name,
        role,
        text: language === 'it' || !language ? text : '',
        text_it: language === 'it' ? text : undefined,
        text_en: language === 'en' ? text : undefined
      });
      await loadData();
      alert('Critico aggiunto con successo!');
    } catch (error) {
      console.error('Error adding critic:', error);
      alert('Errore durante l\'aggiunta del critico');
    }
  };

  // Handler per mostre
  const handleEditExhibition = (exhibition: Exhibition) => {
    setEditingId(exhibition.id);
    setFormData({ ...exhibition });
  };

  const handleSaveExhibition = async () => {
    if (formData && editingId) {
      try {
        await updateExhibition(editingId, formData);
        await loadData();
        setEditingId(null);
        setFormData(null);
        alert('Mostra aggiornata con successo!');
      } catch (error) {
        console.error('Error updating exhibition:', error);
        alert('Errore durante l\'aggiornamento della mostra');
      }
    }
  };

  const handleDeleteExhibition = async (id: number) => {
    if (confirm('Sei sicuro di voler eliminare questa mostra?')) {
      try {
        await deleteExhibition(id);
        await loadData();
        alert('Mostra eliminata con successo!');
      } catch (error) {
        console.error('Error deleting exhibition:', error);
        alert('Errore durante l\'eliminazione della mostra');
      }
    }
  };

  // Handler esistenti per opere
  const handleEdit = (artwork: Artwork) => {
    setEditingId(artwork.id);
    setFormData({ ...artwork });
  };

  const handleSave = async () => {
    if (formData && editingId) {
      try {
        await updateArtwork(editingId, {
          title: formData.title,
          description: formData.description,
          image_url: formData.image_url,
          section_id: formData.section_id,
          order_index: formData.order_index
        });
        await loadData();
        setEditingId(null);
        setFormData(null);
        alert('Opera aggiornata con successo!');
      } catch (error) {
        console.error('Error updating artwork:', error);
        alert('Errore durante l\'aggiornamento dell\'opera');
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData(null);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Sei sicuro di voler eliminare questa opera?')) {
      try {
        await deleteArtwork(id);
        await loadData();
        alert('Opera eliminata con successo!');
      } catch (error) {
        console.error('Error deleting artwork:', error);
        alert('Errore durante l\'eliminazione dell\'opera');
      }
    }
  };

  const handleAdd = () => {
    if (activeTab === 'opere') {
      navigate('/content/opera');
    } else if (activeTab === 'critica') {
      handleAddCritic();
    } else if (activeTab === 'mostre') {
      // Navigate to add exhibition form or open modal
      alert('Form per aggiungere mostre in sviluppo...');
    }
  };

  const handleDeleteSubscriber = async (id: number) => {
    if (confirm('Sei sicuro di voler eliminare questo iscritto?')) {
      try {
        await deleteNewsletterSubscriber(id);
        await loadData();
      } catch (error) {
        console.error('Error deleting subscriber:', error);
        alert('Errore durante l\'eliminazione dell\'iscritto');
      }
    }
  };

  // Handler per biografia
  const handleSaveBio = () => {
    localStorage.setItem('artist-bio', JSON.stringify(bioContent));
    alert('Biografia salvata con successo!');
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Gestione Contenuti - Adele Lo Feudo</title>
      </Helmet>

      <div className="max-w-7xl mx-auto py-20 px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white uppercase" style={{ fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}>
            Gestione <span style={{ color: 'rgb(240, 45, 110)' }}>
              {activeTab === 'opere' ? 'Opere' :
               activeTab === 'sezioni' ? 'Sezioni' :
               activeTab === 'newsletter' ? 'Newsletter' :
               activeTab === 'critica' ? 'Critica' :
               activeTab === 'mostre' ? 'Mostre' :
               'Biografia'}
            </span>
          </h1>
          {(activeTab === 'opere' || activeTab === 'critica' || activeTab === 'mostre') && (
            <button
              onClick={handleAdd}
              className="px-6 py-3 font-bold uppercase text-white transition-colors"
              style={{ backgroundColor: 'rgb(240, 45, 110)', fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}
            >
              + Aggiungi {activeTab === 'opere' ? 'Opera' : activeTab === 'critica' ? 'Critico' : 'Mostra'}
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="mb-12 border-b-2" style={{ borderColor: 'rgba(240, 45, 110, 0.3)' }}>
          <div className="flex gap-8 overflow-x-auto">
            {(['opere', 'sezioni', 'mostre', 'critica', 'biografia', 'newsletter'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-4 font-bold uppercase text-lg transition-colors whitespace-nowrap ${activeTab === tab ? 'border-b-4' : ''}`}
                style={{
                  fontFamily: 'Palanquin, Helvetica Neue, sans-serif',
                  color: activeTab === tab ? 'rgb(240, 45, 110)' : 'white',
                  borderColor: activeTab === tab ? 'rgb(240, 45, 110)' : 'transparent'
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'opere' && (
          loading ? (
            <div className="text-center py-20">
              <p className="text-white text-xl" style={{ fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}>Caricamento...</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {artworks.map((artwork) => (
                <div key={artwork.id} className="bg-secondary p-6 border-2" style={{ borderColor: 'rgba(240, 45, 110, 0.3)' }}>
                  {editingId === artwork.id && formData ? (
                    <div className="space-y-4">
                      {/* Form di modifica opera */}
                      <div>
                        <label className="block text-white mb-2 font-bold" style={{ fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}>Titolo</label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full px-4 py-2 bg-background text-white border-2"
                          style={{ borderColor: 'rgba(240, 45, 110, 0.3)', fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}
                        />
                      </div>
                      <div className="flex gap-4">
                        <button
                          onClick={handleSave}
                          className="px-6 py-2 font-bold uppercase text-white"
                          style={{ backgroundColor: 'rgb(240, 45, 110)', fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}
                        >
                          Salva
                        </button>
                        <button
                          onClick={handleCancel}
                          className="px-6 py-2 font-bold uppercase text-white border-2"
                          style={{ borderColor: 'rgba(240, 45, 110, 0.3)', fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}
                        >
                          Annulla
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-6">
                      <img src={artwork.image_url || '/opera.png'} alt={artwork.title} className="w-32 h-32 object-contain" />
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-2" style={{ color: 'rgb(240, 45, 110)', fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}>
                          {artwork.title}
                        </h3>
                        <p className="text-white mb-2" style={{ fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}>{artwork.description}</p>
                        <p className="text-gray text-sm" style={{ fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}>
                          Serie: {sections.find(s => s.id === artwork.section_id)?.name || 'N/A'}
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleEdit(artwork)}
                          className="px-4 py-2 font-bold uppercase text-white"
                          style={{ backgroundColor: 'rgb(240, 45, 110)', fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}
                        >
                          Modifica
                        </button>
                        <button
                          onClick={() => handleDelete(artwork.id)}
                          className="px-4 py-2 font-bold uppercase text-white border-2"
                          style={{ borderColor: 'rgba(240, 45, 110, 0.3)', fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}
                        >
                          Elimina
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'critica' && (
          loading ? (
            <div className="text-center py-20">
              <p className="text-white text-xl" style={{ fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}>Caricamento...</p>
            </div>
          ) : critics.length === 0 ? (
            <div className="p-8 border text-center" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
              <p className="text-white text-lg mb-4" style={{ fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}>
                Nessun critico presente
              </p>
              <button
                onClick={handleAddCritic}
                className="px-6 py-3 font-bold uppercase text-white"
                style={{ backgroundColor: 'rgb(240, 45, 110)', fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}
              >
                Aggiungi il primo critico
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {critics.map((critic) => (
                <div key={critic.id} className="bg-secondary p-6 border-2" style={{ borderColor: 'rgba(240, 45, 110, 0.3)' }}>
                  {editingId === critic.id && formData ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-white mb-2 font-bold">Nome</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-2 bg-background text-white border-2"
                          style={{ borderColor: 'rgba(240, 45, 110, 0.3)' }}
                        />
                      </div>
                      <div>
                        <label className="block text-white mb-2 font-bold">Ruolo</label>
                        <input
                          type="text"
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className="w-full px-4 py-2 bg-background text-white border-2"
                          style={{ borderColor: 'rgba(240, 45, 110, 0.3)' }}
                        />
                      </div>
                      <div>
                        <label className="block text-white mb-2 font-bold">Testo ({language})</label>
                        <textarea
                          value={formData.text || ''}
                          onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                          rows={8}
                          className="w-full px-4 py-2 bg-background text-white border-2"
                          style={{ borderColor: 'rgba(240, 45, 110, 0.3)' }}
                        />
                      </div>
                      <div className="flex gap-4">
                        <button
                          onClick={handleSaveCritic}
                          className="px-6 py-2 font-bold uppercase text-white"
                          style={{ backgroundColor: 'rgb(240, 45, 110)' }}
                        >
                          Salva
                        </button>
                        <button
                          onClick={handleCancel}
                          className="px-6 py-2 font-bold uppercase text-white border-2"
                          style={{ borderColor: 'rgba(240, 45, 110, 0.3)' }}
                        >
                          Annulla
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-2" style={{ color: 'rgb(240, 45, 110)' }}>
                          {critic.name_it || critic.name}
                        </h3>
                        <p className="text-white/80 mb-4">{critic.role}</p>
                        <p className="text-white/60 italic" style={{ maxWidth: '800px' }}>
                          {critic.quote_it || critic.text ? `"${(critic.quote_it || critic.text).substring(0, 200)}..."` : 'Testo non disponibile'}
                        </p>
                      </div>
                      <div className="flex gap-4 ml-4">
                        <button
                          onClick={() => handleEditCritic(critic)}
                          className="px-4 py-2 font-bold uppercase text-white"
                          style={{ backgroundColor: 'rgb(240, 45, 110)' }}
                        >
                          Modifica
                        </button>
                        <button
                          onClick={() => handleDeleteCritic(critic.id)}
                          className="px-4 py-2 font-bold uppercase text-white border-2"
                          style={{ borderColor: 'rgba(240, 45, 110, 0.3)' }}
                        >
                          Elimina
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'biografia' && (
          <div className="space-y-6">
            <div className="bg-secondary p-8 border-2" style={{ borderColor: 'rgba(240, 45, 110, 0.3)' }}>
              <h3 className="text-2xl font-bold mb-6" style={{ color: 'rgb(240, 45, 110)' }}>
                Biografia dell'Artista
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-white mb-2 font-bold">Biografia (Italiano)</label>
                  <textarea
                    value={bioContent.it}
                    onChange={(e) => setBioContent({ ...bioContent, it: e.target.value })}
                    rows={10}
                    className="w-full px-4 py-2 bg-background text-white border-2"
                    style={{ borderColor: 'rgba(240, 45, 110, 0.3)' }}
                    placeholder="Inserisci la biografia in italiano..."
                  />
                </div>

                <div>
                  <label className="block text-white mb-2 font-bold">Biography (English)</label>
                  <textarea
                    value={bioContent.en}
                    onChange={(e) => setBioContent({ ...bioContent, en: e.target.value })}
                    rows={10}
                    className="w-full px-4 py-2 bg-background text-white border-2"
                    style={{ borderColor: 'rgba(240, 45, 110, 0.3)' }}
                    placeholder="Insert biography in English..."
                  />
                </div>

                <button
                  onClick={handleSaveBio}
                  className="px-8 py-3 font-bold uppercase text-white"
                  style={{ backgroundColor: 'rgb(240, 45, 110)' }}
                >
                  Salva Biografia
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mostre' && (
          loading ? (
            <div className="text-center py-20">
              <p className="text-white text-xl">Caricamento...</p>
            </div>
          ) : exhibitions.length === 0 ? (
            <div className="p-8 border text-center" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
              <p className="text-white text-lg mb-4">Nessuna mostra presente</p>
              <button
                onClick={() => alert('Form per aggiungere mostre in sviluppo...')}
                className="px-6 py-3 font-bold uppercase text-white"
                style={{ backgroundColor: 'rgb(240, 45, 110)' }}
              >
                Aggiungi la prima mostra
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {exhibitions.map((exhibition) => (
                <div key={exhibition.id} className="bg-secondary p-6 border-2" style={{ borderColor: 'rgba(240, 45, 110, 0.3)' }}>
                  {editingId === exhibition.id && formData ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white mb-2 font-bold">Titolo</label>
                          <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 bg-background text-white border-2"
                            style={{ borderColor: 'rgba(240, 45, 110, 0.3)' }}
                          />
                        </div>
                        <div>
                          <label className="block text-white mb-2 font-bold">Sottotitolo</label>
                          <input
                            type="text"
                            value={formData.subtitle || ''}
                            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                            className="w-full px-4 py-2 bg-background text-white border-2"
                            style={{ borderColor: 'rgba(240, 45, 110, 0.3)' }}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white mb-2 font-bold">Luogo</label>
                          <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full px-4 py-2 bg-background text-white border-2"
                            style={{ borderColor: 'rgba(240, 45, 110, 0.3)' }}
                          />
                        </div>
                        <div>
                          <label className="block text-white mb-2 font-bold">Data</label>
                          <input
                            type="text"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full px-4 py-2 bg-background text-white border-2"
                            style={{ borderColor: 'rgba(240, 45, 110, 0.3)' }}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-white mb-2 font-bold">Descrizione</label>
                        <textarea
                          value={formData.description || ''}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-2 bg-background text-white border-2"
                          style={{ borderColor: 'rgba(240, 45, 110, 0.3)' }}
                        />
                      </div>
                      <div className="flex gap-4">
                        <button
                          onClick={handleSaveExhibition}
                          className="px-6 py-2 font-bold uppercase text-white"
                          style={{ backgroundColor: 'rgb(240, 45, 110)' }}
                        >
                          Salva
                        </button>
                        <button
                          onClick={handleCancel}
                          className="px-6 py-2 font-bold uppercase text-white border-2"
                          style={{ borderColor: 'rgba(240, 45, 110, 0.3)' }}
                        >
                          Annulla
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-2" style={{ color: 'rgb(240, 45, 110)' }}>
                          {exhibition.title}
                        </h3>
                        <p className="text-white/80 mb-2">{exhibition.subtitle}</p>
                        <p className="text-white/60">{exhibition.location} • {exhibition.date}</p>
                        {exhibition.description && (
                          <p className="text-white/60 mt-3 italic">{exhibition.description}</p>
                        )}
                      </div>
                      <div className="flex gap-4 ml-4">
                        <button
                          onClick={() => handleEditExhibition(exhibition)}
                          className="px-4 py-2 font-bold uppercase text-white"
                          style={{ backgroundColor: 'rgb(240, 45, 110)' }}
                        >
                          Modifica
                        </button>
                        <button
                          onClick={() => handleDeleteExhibition(exhibition.id)}
                          className="px-4 py-2 font-bold uppercase text-white border-2"
                          style={{ borderColor: 'rgba(240, 45, 110, 0.3)' }}
                        >
                          Elimina
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'sezioni' && (
          <div className="grid gap-6">
            <div className="bg-secondary p-8 border-2 text-center" style={{ borderColor: 'rgba(240, 45, 110, 0.3)' }}>
              <p className="text-white text-lg" style={{ fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}>
                Gestione sezioni in arrivo...
              </p>
              <p className="text-gray mt-4" style={{ fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}>
                Qui potrai creare e modificare le sezioni (Name series, etc.)
              </p>
            </div>
          </div>
        )}

        {activeTab === 'newsletter' && (
          loading ? (
            <div className="text-center py-20">
              <p className="text-white text-xl" style={{ fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}>Caricamento...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}>
                  Totale iscritti: <span style={{ color: 'rgb(240, 45, 110)' }}>{subscribers.length}</span>
                </h2>
              </div>

              {subscribers.length === 0 ? (
                <div className="p-8 border text-center" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                  <p className="text-white text-lg" style={{ fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}>
                    Nessun iscritto alla newsletter
                  </p>
                </div>
              ) : (
                <div className="border" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                  <table className="w-full">
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>
                        <th className="text-left p-4 text-white font-bold uppercase text-sm">Email</th>
                        <th className="text-left p-4 text-white font-bold uppercase text-sm">Data Iscrizione</th>
                        <th className="text-right p-4 text-white font-bold uppercase text-sm">Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscribers.map((subscriber, index) => (
                        <tr key={subscriber.id}>
                          <td className="p-4 text-white">{subscriber.email}</td>
                          <td className="p-4 text-white/60">
                            {new Date(subscriber.subscribed_at).toLocaleDateString('it-IT', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleDeleteSubscriber(subscriber.id)}
                              className="px-4 py-2 font-bold uppercase text-white/60 hover:text-white transition-colors"
                            >
                              Elimina
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ContentEnhanced;