import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import {
  getCollections,
  updateCollection,
  deleteCollection,
  type Collection
} from '../services/collections-api';
import {
  getExhibitions,
  createExhibition,
  updateExhibition,
  deleteExhibition,
  type Exhibition
} from '../services/exhibitions-api';
import {
  getCritics,
  createCritic,
  updateCritic,
  deleteCritic,
  type Critic
} from '../services/critics-api';
import { useLanguage } from '../i18n/LanguageContext';

type TabType = 'collezioni' | 'critica' | 'biografia' | 'mostre';

const ContentWithCollections: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('collezioni');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [critics, setCritics] = useState<Critic[]>([]);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Stati per biografia
  const [bioContent, setBioContent] = useState({
    alf: {
      it: {
        paragraphs: ['', '', '', '']
      },
      en: {
        paragraphs: ['', '', '', '']
      }
    },
    studio: {
      it: {
        paragraphs: ['', '', '', '']
      },
      en: {
        paragraphs: ['', '', '', '']
      }
    }
  });
  const [bioView, setBioView] = useState<'alf' | 'studio'>('alf');

  // Carica i dati all'avvio
  useEffect(() => {
    loadData();
  }, [activeTab, language]);

  const loadData = async () => {
    try {
      setLoading(true);

      if (activeTab === 'collezioni') {
        const collectionsData = await getCollections(true); // Show all collections in backoffice
        setCollections(collectionsData);
      } else if (activeTab === 'critica') {
        const criticsData = await getCritics(true); // Show all critics in backoffice
        setCritics(criticsData);
      } else if (activeTab === 'mostre') {
        const exhibitionsData = await getExhibitions(true); // Show all exhibitions in backoffice
        setExhibitions(exhibitionsData);
      } else if (activeTab === 'biografia') {
        // Carica contenuti biografia dal database o localStorage
        const savedBio = localStorage.getItem('artist-bio-enhanced');
        if (savedBio) {
          setBioContent(JSON.parse(savedBio));
        } else {
          // Dati di default per la biografia
          setBioContent({
            alf: {
              it: {
                paragraphs: [
                  'Adele Lo Feudo è un\'artista italiana che ha dedicato la sua vita alla ricerca espressiva attraverso la materia pittorica. Il suo percorso artistico inizia negli anni della formazione accademica, dove sviluppa una tecnica personale che unisce tradizione e innovazione.',
                  'La sua arte si caratterizza per l\'intensità emotiva e la forza comunicativa, elementi che emergono attraverso l\'uso sapiente del colore e della texture. Ogni opera è un viaggio nell\'anima umana, un\'esplorazione delle emozioni più profonde.',
                  'Nel corso degli anni, Adele ha esposto in numerose mostre personali e collettive, ottenendo riconoscimenti dalla critica e dal pubblico. Il suo lavoro è presente in collezioni private e pubbliche in Italia e all\'estero.',
                  'L\'artista continua la sua ricerca con passione e dedizione, sempre alla ricerca di nuovi linguaggi espressivi per comunicare la complessità dell\'esistenza umana attraverso l\'arte.'
                ]
              },
              en: {
                paragraphs: [
                  'Adele Lo Feudo is an Italian artist who has dedicated her life to expressive research through pictorial matter. Her artistic journey begins during her academic training years, where she develops a personal technique that combines tradition and innovation.',
                  'Her art is characterized by emotional intensity and communicative power, elements that emerge through the skillful use of color and texture. Each work is a journey into the human soul, an exploration of the deepest emotions.',
                  'Over the years, Adele has exhibited in numerous solo and group exhibitions, receiving recognition from critics and the public. Her work is present in private and public collections in Italy and abroad.',
                  'The artist continues her research with passion and dedication, always looking for new expressive languages to communicate the complexity of human existence through art.'
                ]
              }
            },
            studio: {
              it: {
                paragraphs: [
                  'Lo studio di Adele Lo Feudo è un laboratorio creativo dove l\'arte prende forma attraverso un processo di ricerca continua. Situato nel cuore della città, lo spazio si configura come un ambiente di sperimentazione dove tecniche tradizionali e approcci contemporanei si fondono per dare vita a opere uniche.',
                  'Ogni progetto nasce da un\'attenta analisi del contesto e da un dialogo costante con il committente, garantendo risultati che non solo soddisfano le aspettative estetiche, ma che raccontano anche una storia, evocano emozioni e creano connessioni profonde con lo spazio circostante.',
                  'Lo studio offre servizi di consulenza artistica, progettazione di opere su commissione, restauro conservativo e workshop formativi. La filosofia che guida ogni intervento è quella di creare non solo oggetti d\'arte, ma esperienze che arricchiscono l\'ambiente e la vita di chi le vive quotidianamente.',
                  'Con oltre vent\'anni di esperienza nel settore, lo studio ha realizzato progetti per collezioni private, spazi pubblici e istituzioni culturali, sempre mantenendo un approccio artigianale e una cura meticolosa per ogni dettaglio.'
                ]
              },
              en: {
                paragraphs: [
                  'Adele Lo Feudo\'s studio is a creative laboratory where art takes shape through a process of continuous research. Located in the heart of the city, the space is configured as an experimentation environment where traditional techniques and contemporary approaches merge to create unique works.',
                  'Each project originates from a careful analysis of the context and constant dialogue with the client, ensuring results that not only meet aesthetic expectations but also tell a story, evoke emotions, and create deep connections with the surrounding space.',
                  'The studio offers artistic consultancy services, commissioned work design, conservative restoration, and educational workshops. The philosophy guiding each intervention is to create not just art objects, but experiences that enrich the environment and the lives of those who experience them daily.',
                  'With over twenty years of experience in the sector, the studio has realized projects for private collections, public spaces, and cultural institutions, always maintaining an artisanal approach and meticulous care for every detail.'
                ]
              }
            }
          });
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Usa dati di fallback se l'API non è disponibile
      if (activeTab === 'collezioni') {
        setCollections([]);
      }
      if (activeTab === 'critica') {
        setCritics([]);
      }
      if (activeTab === 'mostre') {
        setExhibitions([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handler per collezioni
  const handleEditCollection = (collection: Collection) => {
    setEditingId(collection.id);
    setFormData({ ...collection });
  };

  const handleSaveCollection = async () => {
    if (formData && editingId) {
      try {
        await updateCollection(editingId, formData);
        await loadData();
        setEditingId(null);
        setFormData(null);
        alert('Collezione aggiornata con successo!');
      } catch (error) {
        console.error('Error updating collection:', error);
        alert('Errore durante l\'aggiornamento della collezione');
      }
    }
  };

  const handleDeleteCollection = async (id: number) => {
    if (confirm('Sei sicuro di voler eliminare questa collezione?')) {
      try {
        await deleteCollection(id);
        await loadData();
        alert('Collezione eliminata con successo!');
      } catch (error) {
        console.error('Error deleting collection:', error);
        alert('Errore durante l\'eliminazione della collezione');
      }
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
        text,
        order_index: 0,
        is_visible: true
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

  const handleCancel = () => {
    setEditingId(null);
    setFormData(null);
  };

  const handleAdd = () => {
    if (activeTab === 'critica') {
      navigate('/content/critico/new');
    } else if (activeTab === 'mostre') {
      navigate('/content/mostra/new');
    }
  };


  // Handler per biografia
  const handleSaveBio = () => {
    localStorage.setItem('artist-bio-enhanced', JSON.stringify(bioContent));
    alert('Biografia salvata con successo!');
  };

  // Handler per aggiornare i paragrafi della biografia
  const updateBioParagraph = (section: 'alf' | 'studio', lang: 'it' | 'en', index: number, value: string) => {
    const newContent = { ...bioContent };
    newContent[section][lang].paragraphs[index] = value;
    setBioContent(newContent);
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Gestione Contenuti - Adele Lo Feudo</title>
      </Helmet>

      <div className="max-w-6xl mx-auto py-20 px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white uppercase" style={{ fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}>
            Gestione <span style={{ color: 'rgb(240, 45, 110)' }}>
              {activeTab === 'collezioni' ? 'Collezioni' :
               activeTab === 'critica' ? 'Critica' :
               activeTab === 'mostre' ? 'Mostre' :
               'Biografia'}
            </span>
          </h1>
          {activeTab === 'collezioni' && (
            <button
              onClick={() => navigate('/content/collezione/new')}
              className="px-6 py-3 font-bold uppercase text-white transition-colors"
              style={{ backgroundColor: 'rgb(240, 45, 110)', fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}
            >
              + Aggiungi Collezione
            </button>
          )}
          {(activeTab === 'critica' || activeTab === 'mostre') && (
            <button
              onClick={handleAdd}
              className="px-6 py-3 font-bold uppercase text-white transition-colors"
              style={{ backgroundColor: 'rgb(240, 45, 110)', fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}
            >
              + Aggiungi {activeTab === 'critica' ? 'Critico' : 'Mostra'}
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="mb-12 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <div className="flex gap-8 overflow-x-auto">
            {(['collezioni', 'mostre', 'critica', 'biografia'] as TabType[]).map((tab) => (
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
        {activeTab === 'collezioni' && (
          loading ? (
            <div className="text-center py-20">
              <p className="text-white text-xl">Caricamento...</p>
            </div>
          ) : collections.length === 0 ? (
            <div className="p-8 border text-center" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
              <p className="text-white text-lg mb-4">Nessuna collezione presente</p>
              <button
                onClick={() => navigate('/content/collezione/new')}
                className="px-6 py-3 font-bold uppercase text-white"
                style={{ backgroundColor: 'rgb(240, 45, 110)' }}
              >
                Aggiungi la prima collezione
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {collections.map((collection) => (
                <div
                  key={collection.id}
                  className={`bg-secondary border rounded-xl transition-all ${editingId === collection.id ? 'p-6' : 'p-4 hover:bg-white/5 cursor-pointer'}`}
                  style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  onClick={editingId !== collection.id ? () => navigate(`/content/collezione/${collection.id}`) : undefined}
                >
                  {editingId === collection.id && formData ? (
                    <div className="space-y-4">
                      {/* Form di modifica collezione */}
                      <div>
                        <label className="block text-white mb-2 font-bold" style={{ fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}>Titolo</label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full px-4 py-2 bg-background text-white border rounded-lg"
                          style={{ borderColor: 'rgba(255, 255, 255, 0.1)', fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}
                        />
                      </div>
                      <div>
                        <label className="block text-white mb-2 font-bold" style={{ fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}>Descrizione</label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-2 bg-background text-white border rounded-lg"
                          style={{ borderColor: 'rgba(255, 255, 255, 0.1)', fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}
                        />
                      </div>
                      <div>
                        <label className="block text-white mb-2 font-bold" style={{ fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}>Immagine URL</label>
                        <input
                          type="text"
                          value={formData.image_url}
                          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                          className="w-full px-4 py-2 bg-background text-white border rounded-lg"
                          style={{ borderColor: 'rgba(255, 255, 255, 0.1)', fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}
                        />
                      </div>
                      <div className="flex gap-4">
                        <button
                          onClick={handleSaveCollection}
                          className="px-6 py-2 font-bold uppercase text-white"
                          style={{ backgroundColor: 'rgb(240, 45, 110)', fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}
                        >
                          Salva
                        </button>
                        <button
                          onClick={handleCancel}
                          className="px-6 py-2 font-bold uppercase text-white border rounded-lg"
                          style={{ borderColor: 'rgba(255, 255, 255, 0.1)', fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}
                        >
                          Annulla
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-6 p-2">
                      <img
                        src={collection.image_url || '/opera.png'}
                        alt={collection.title}
                        className="w-48 h-32 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-2" style={{ color: 'rgb(240, 45, 110)', fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}>
                          {collection.title}
                        </h3>
                        <p className="text-white mb-2" style={{ fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}>
                          {collection.description}
                        </p>
                        <div className="flex items-center gap-4">
                          <p className="text-gray text-sm" style={{ fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}>
                            Link: <span className="text-white/60">/collezione/{collection.slug}</span>
                          </p>
                          {!collection.is_visible && (
                            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-lg font-bold">
                              NASCOSTO
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCollection(collection.id);
                          }}
                          className="p-2 text-white border rounded-lg hover:text-red-400 hover:border-red-400 transition-colors"
                          style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                          title="Elimina"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
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
              <p className="text-white text-xl">Caricamento...</p>
            </div>
          ) : critics.length === 0 ? (
            <div className="p-8 border text-center" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
              <p className="text-white text-lg mb-4" style={{ fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}>
                Nessun critico presente
              </p>
              <button
                onClick={() => navigate('/content/critico/new')}
                className="px-6 py-3 font-bold uppercase text-white"
                style={{ backgroundColor: 'rgb(240, 45, 110)', fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}
              >
                Aggiungi il primo critico
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {critics.map((critic) => (
                <div
                  key={critic.id}
                  className="bg-secondary p-4 border rounded-xl hover:bg-white/5 cursor-pointer transition-all"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  onClick={() => navigate(`/content/critico/${critic.id}`)}
                >
                  <div className="flex justify-between items-start p-2">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2" style={{ color: 'rgb(240, 45, 110)', fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}>
                        {critic.name}
                      </h3>
                      <p className="text-white/80 mb-4">{critic.role}</p>
                      <p className="text-white/60 italic" style={{ maxWidth: '800px' }}>
                        {critic.text ? `"${critic.text.substring(0, 200)}..."` : 'Testo non disponibile'}
                      </p>
                      {!critic.is_visible && (
                        <span className="inline-block mt-2 px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-lg font-bold">
                          NASCOSTO
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
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
                onClick={() => navigate('/content/mostra/new')}
                className="px-6 py-3 font-bold uppercase text-white"
                style={{ backgroundColor: 'rgb(240, 45, 110)' }}
              >
                Aggiungi la prima mostra
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {exhibitions.map((exhibition) => (
                <div
                  key={exhibition.id}
                  className="bg-secondary p-4 border rounded-xl hover:bg-white/5 cursor-pointer transition-all"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  onClick={() => navigate(`/content/mostra/${exhibition.id}`)}
                >
                  <div className="flex items-start gap-6 p-2">
                    {exhibition.image_url && (
                      <img
                        src={exhibition.image_url}
                        alt={exhibition.title}
                        className="w-48 h-32 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2" style={{ color: 'rgb(240, 45, 110)', fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}>
                        {exhibition.title}
                      </h3>
                      {exhibition.subtitle && (
                        <p className="text-white/80 mb-2">{exhibition.subtitle}</p>
                      )}
                      <p className="text-white/60 mb-2">
                        📍 {exhibition.location}
                      </p>
                      <p className="text-white/60 mb-2">
                        📅 {exhibition.date}
                      </p>
                      {exhibition.description && (
                        <p className="text-white/60 italic mt-2">
                          {exhibition.description.substring(0, 150)}...
                        </p>
                      )}
                      {!exhibition.is_visible && (
                        <span className="inline-block mt-2 px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-lg font-bold">
                          NASCOSTA
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'biografia' && (
          <div className="max-w-5xl mx-auto">
            <div className="bg-secondary p-8 border rounded-xl" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
              <h3 className="text-2xl font-bold text-white mb-6 text-center" style={{ fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}>
                Gestione <span style={{ color: 'rgb(240, 45, 110)' }}>Biografia</span>
              </h3>

              {/* Toggle ALF / Studio */}
              <div className="flex justify-center mb-8">
                <div className="inline-flex gap-2 p-1 bg-black/30 rounded-full">
                  <button
                    onClick={() => setBioView('alf')}
                    className={`px-6 py-2 rounded-full transition-all font-bold uppercase text-sm ${
                      bioView === 'alf'
                        ? 'bg-accent text-white'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    ALF
                  </button>
                  <button
                    onClick={() => setBioView('studio')}
                    className={`px-6 py-2 rounded-full transition-all font-bold uppercase text-sm ${
                      bioView === 'studio'
                        ? 'bg-accent text-white'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Studio
                  </button>
                </div>
              </div>

              <div className="space-y-8">
                {/* Sezione Italiano */}
                <div>
                  <h4 className="text-xl font-bold text-white mb-4">
                    {bioView === 'alf' ? 'Biografia ALF' : 'Descrizione Studio'} - Italiano
                  </h4>
                  {bioContent[bioView].it.paragraphs.map((paragraph, index) => (
                    <div key={index}>
                      <textarea
                        value={paragraph}
                        onChange={(e) => updateBioParagraph(bioView, 'it', index, e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 bg-background text-white border rounded-lg mb-2"
                        style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                        placeholder={`Paragrafo ${index + 1} in italiano...`}
                      />
                      {index < bioContent[bioView].it.paragraphs.length - 1 && (
                        <div className="h-px bg-white/20 my-4"></div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Sezione Inglese */}
                <div className="pt-6 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                  <h4 className="text-xl font-bold text-white mb-4">
                    {bioView === 'alf' ? 'Biography ALF' : 'Studio Description'} - English
                  </h4>
                  {bioContent[bioView].en.paragraphs.map((paragraph, index) => (
                    <div key={index}>
                      <textarea
                        value={paragraph}
                        onChange={(e) => updateBioParagraph(bioView, 'en', index, e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 bg-background text-white border rounded-lg mb-2"
                        style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                        placeholder={`Paragraph ${index + 1} in English...`}
                      />
                      {index < bioContent[bioView].en.paragraphs.length - 1 && (
                        <div className="h-px bg-white/20 my-4"></div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-center pt-6">
                  <button
                    onClick={handleSaveBio}
                    className="px-8 py-3 font-bold uppercase text-white transition-all hover:scale-105"
                    style={{ backgroundColor: 'rgb(240, 45, 110)', fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}
                  >
                    Salva Biografia
                  </button>
                </div>
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
                <div key={exhibition.id} className="bg-secondary p-6 border rounded-xl" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                  {editingId === exhibition.id && formData ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white mb-2 font-bold">Titolo</label>
                          <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 bg-background text-white border rounded-lg"
                            style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                          />
                        </div>
                        <div>
                          <label className="block text-white mb-2 font-bold">Sottotitolo</label>
                          <input
                            type="text"
                            value={formData.subtitle || ''}
                            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                            className="w-full px-4 py-2 bg-background text-white border rounded-lg"
                            style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
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
                            className="w-full px-4 py-2 bg-background text-white border rounded-lg"
                            style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                          />
                        </div>
                        <div>
                          <label className="block text-white mb-2 font-bold">Data</label>
                          <input
                            type="text"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full px-4 py-2 bg-background text-white border rounded-lg"
                            style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-white mb-2 font-bold">Descrizione</label>
                        <textarea
                          value={formData.description || ''}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-2 bg-background text-white border rounded-lg"
                          style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
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
                          className="px-6 py-2 font-bold uppercase text-white border rounded-lg"
                          style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
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
                          className="p-2 text-white hover:opacity-80 transition-opacity"
                          title="Modifica"
                          style={{ backgroundColor: 'rgb(240, 45, 110)' }}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteExhibition(exhibition.id)}
                          className="px-4 py-2 font-bold uppercase text-white border rounded-lg"
                          style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}

      </div>
    </div>
  );
};

export default ContentWithCollections;