import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import BackofficeLayout from '../components/BackofficeLayout';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import ImageWithFallback from '../components/ImageWithFallback';
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
import { getTranslatedField } from '../utils/translations';

// Get API base URL for image URLs
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Helper function to convert relative image URLs to absolute
const getImageUrl = (url: string | null | undefined): string => {
  if (!url) return '/opera.png';

  // If URL is already absolute, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // If URL is relative, prepend API base URL
  if (url.startsWith('/images/')) {
    return `${API_BASE_URL}${url}`;
  }

  return url;
};

type TabType = 'collezioni' | 'critica' | 'biografia' | 'mostre';

const ContentWithCollections: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [searchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as TabType) || 'collezioni';
  const [collections, setCollections] = useState<Collection[]>([]);
  const [critics, setCritics] = useState<Critic[]>([]);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Paginazione
  const [currentPageExhibitions, setCurrentPageExhibitions] = useState(1);
  const [currentPageCritics, setCurrentPageCritics] = useState(1);
  const [currentPageCollections, setCurrentPageCollections] = useState(1);
  const itemsPerPage = 5;

  // Ricerca
  const [searchCollections, setSearchCollections] = useState('');
  const [searchExhibitions, setSearchExhibitions] = useState('');
  const [searchCritics, setSearchCritics] = useState('');

  // Preview Modal & Drag and Drop
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewCollections, setPreviewCollections] = useState<Collection[]>([]);
  const [originalPreviewCollections, setOriginalPreviewCollections] = useState<Collection[]>([]);
  const [draggedCollection, setDraggedCollection] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Stati per biografia
  const [selectedBioEditor, setSelectedBioEditor] = useState<'alf' | 'studio' | null>(null);
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
        setToast({ message: 'Collezione aggiornata con successo!', type: 'success' });
      } catch (error) {
        console.error('Error updating collection:', error);
        setToast({ message: 'Errore durante l\'aggiornamento della collezione', type: 'error' });
      }
    }
  };

  const handleDeleteCollection = async (id: number) => {
    if (confirm('Sei sicuro di voler eliminare questa collezione?')) {
      try {
        await deleteCollection(id);
        await loadData();
        setToast({ message: 'Collezione eliminata con successo!', type: 'success' });
      } catch (error) {
        console.error('Error deleting collection:', error);
        setToast({ message: 'Errore durante l\'eliminazione della collezione', type: 'error' });
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
        setToast({ message: 'Critico aggiornato con successo!', type: 'success' });
      } catch (error) {
        console.error('Error updating critic:', error);
        setToast({ message: 'Errore durante l\'aggiornamento del critico', type: 'error' });
      }
    }
  };

  const handleDeleteCritic = async (id: number) => {
    if (confirm('Sei sicuro di voler eliminare questo critico?')) {
      try {
        await deleteCritic(id);
        await loadData();
        setToast({ message: 'Critico eliminato con successo!', type: 'success' });
      } catch (error) {
        console.error('Error deleting critic:', error);
        setToast({ message: 'Errore durante l\'eliminazione del critico', type: 'error' });
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
        order_index: 1,
        is_visible: true
      });
      await loadData();
      setToast({ message: 'Critico aggiunto con successo!', type: 'success' });
    } catch (error) {
      console.error('Error adding critic:', error);
      setToast({ message: 'Errore durante l\'aggiunta del critico', type: 'error' });
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
        setToast({ message: 'Mostra aggiornata con successo!', type: 'success' });
      } catch (error) {
        console.error('Error updating exhibition:', error);
        setToast({ message: 'Errore durante l\'aggiornamento della mostra', type: 'error' });
      }
    }
  };

  const handleDeleteExhibition = async (id: number) => {
    if (confirm('Sei sicuro di voler eliminare questa mostra?')) {
      try {
        await deleteExhibition(id);
        await loadData();
        setToast({ message: 'Mostra eliminata con successo!', type: 'success' });
      } catch (error) {
        console.error('Error deleting exhibition:', error);
        setToast({ message: 'Errore durante l\'eliminazione della mostra', type: 'error' });
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

  // Funzioni helper per ricerca
  const filterCollections = (collections: Collection[]) => {
    if (!searchCollections.trim()) return collections;
    const searchLower = searchCollections.toLowerCase();
    return collections.filter(c =>
      (c.title || '').toLowerCase().includes(searchLower) ||
      (c.description || '').toLowerCase().includes(searchLower)
    );
  };

  const filterExhibitions = (exhibitions: Exhibition[]) => {
    if (!searchExhibitions.trim()) return exhibitions;
    const searchLower = searchExhibitions.toLowerCase();
    return exhibitions.filter(e =>
      (e.title || '').toLowerCase().includes(searchLower) ||
      (e.subtitle || '').toLowerCase().includes(searchLower) ||
      (e.location || '').toLowerCase().includes(searchLower)
    );
  };

  const filterCritics = (critics: Critic[]) => {
    if (!searchCritics.trim()) return critics;
    const searchLower = searchCritics.toLowerCase();
    return critics.filter(c =>
      (c.name || '').toLowerCase().includes(searchLower) ||
      (c.role || '').toLowerCase().includes(searchLower) ||
      (c.text || '').toLowerCase().includes(searchLower)
    );
  };

  // Funzioni helper per paginazione
  const getPaginatedItems = <T,>(items: T[], currentPage: number) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  };

  const getTotalPages = (totalItems: number) => {
    return Math.ceil(totalItems / itemsPerPage);
  };

  // Componente Paginatore
  const Paginator = ({
    currentPage,
    totalItems,
    onPageChange
  }: {
    currentPage: number;
    totalItems: number;
    onPageChange: (page: number) => void;
  }) => {
    const totalPages = getTotalPages(totalItems);

    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center items-center gap-2 mt-8">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 font-bold text-white border rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5"
          style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
        >
          ←
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className="px-4 py-2 font-bold text-white rounded-lg transition-all hover:bg-white/5"
            style={{
              backgroundColor: currentPage === page ? 'rgb(240, 45, 110)' : 'transparent',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              border: currentPage === page ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 font-bold text-white border rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5"
          style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
        >
          →
        </button>
      </div>
    );
  };


  // Handler per biografia
  const handleSaveBio = () => {
    localStorage.setItem('artist-bio-enhanced', JSON.stringify(bioContent));
    setToast({ message: 'Biografia salvata con successo!', type: 'success' });
  };

  // Handler per aggiornare i paragrafi della biografia
  const updateBioParagraph = (section: 'alf' | 'studio', lang: 'it' | 'en', index: number, value: string) => {
    const newContent = { ...bioContent };
    newContent[section][lang].paragraphs[index] = value;
    setBioContent(newContent);
  };

  // Handlers per Preview Modal & Drag and Drop
  const handleOpenPreview = () => {
    const sortedCollections = [...collections].sort((a, b) => a.order_index - b.order_index);
    setPreviewCollections(sortedCollections);
    setOriginalPreviewCollections(sortedCollections);
    setShowPreviewModal(true);
  };

  const handleClosePreview = () => {
    setShowPreviewModal(false);
    setDraggedCollection(null);
    setDragOverIndex(null);
  };

  // Check if order has changed
  const hasOrderChanged = () => {
    if (previewCollections.length !== originalPreviewCollections.length) return true;
    return previewCollections.some((col, idx) =>
      col.id !== originalPreviewCollections[idx]?.id
    );
  };

  const handleCollectionDragStart = (index: number) => {
    setDraggedCollection(index);
  };

  const handleCollectionDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleCollectionDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedCollection === null) return;

    const newCollections = [...previewCollections];
    const draggedItem = newCollections[draggedCollection];
    newCollections.splice(draggedCollection, 1);
    newCollections.splice(dropIndex, 0, draggedItem);

    // Update order_index for all collections
    const updatedCollections = newCollections.map((col, idx) => ({
      ...col,
      order_index: idx + 1
    }));

    setPreviewCollections(updatedCollections);
    setDraggedCollection(null);
    setDragOverIndex(null);
  };

  const handleCollectionDragEnd = () => {
    setDraggedCollection(null);
    setDragOverIndex(null);
  };

  const handleSaveCollectionOrder = async () => {
    try {
      // Save the new order to the database
      await Promise.all(
        previewCollections.map(col =>
          updateCollection(col.id, { order_index: col.order_index })
        )
      );

      // Reload collections
      await loadData();
      setToast({ message: 'Ordine salvato con successo!', type: 'success' });
      handleClosePreview();
    } catch (error) {
      console.error('Error saving collection order:', error);
      setToast({ message: 'Errore nel salvare l\'ordine', type: 'error' });
    }
  };

  return (
    <BackofficeLayout>
      <Helmet>
        <title>Gestione Contenuti - Adele Lo Feudo</title>
      </Helmet>

      <motion.div
        className="max-w-5xl mx-auto py-20 px-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <motion.div
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="text-4xl font-bold text-white uppercase" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Gestione <span style={{ color: 'rgb(240, 45, 110)' }}>
              {activeTab === 'collezioni' ? 'Collezioni' :
               activeTab === 'critica' ? 'Critica' :
               activeTab === 'mostre' ? 'Mostre' :
               'Biografia'}
            </span>
          </h1>
          {activeTab === 'collezioni' && (
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchCollections}
                  onChange={(e) => {
                    setSearchCollections(e.target.value);
                    setCurrentPageCollections(1);
                  }}
                  placeholder="Cerca collezione..."
                  className="px-4 py-3 pr-10 bg-secondary text-white border focus:outline-none focus:border-pink-500 transition-colors"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.1)', fontFamily: 'Montserrat, sans-serif', width: '250px', borderRadius: 0 }}
                />
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </div>
              <button
                onClick={handleOpenPreview}
                className="p-3 text-white transition-colors hover:bg-white/10"
                style={{ backgroundColor: 'rgb(30, 30, 30)', borderRadius: 0, border: '1px solid rgba(255, 255, 255, 0.1)' }}
                title="Anteprima e riordina collezioni"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
              <button
                onClick={() => navigate('/content/collezione/new')}
                className="p-3 text-white transition-colors"
                style={{ backgroundColor: 'rgb(240, 45, 110)', borderRadius: 0 }}
                title="Aggiungi collezione"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          )}
          {activeTab === 'critica' && (
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchCritics}
                  onChange={(e) => {
                    setSearchCritics(e.target.value);
                    setCurrentPageCritics(1);
                  }}
                  placeholder="Cerca critico..."
                  className="px-4 py-3 pr-10 bg-secondary text-white border focus:outline-none focus:border-pink-500 transition-colors"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.1)', fontFamily: 'Montserrat, sans-serif', width: '250px', borderRadius: 0 }}
                />
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </div>
              <button
                onClick={handleAdd}
                className="p-3 text-white transition-colors"
                style={{ backgroundColor: 'rgb(240, 45, 110)', borderRadius: 0 }}
                title="Aggiungi critico"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          )}
          {activeTab === 'mostre' && (
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchExhibitions}
                  onChange={(e) => {
                    setSearchExhibitions(e.target.value);
                    setCurrentPageExhibitions(1);
                  }}
                  placeholder="Cerca mostra..."
                  className="px-4 py-3 pr-10 bg-secondary text-white border focus:outline-none focus:border-pink-500 transition-colors"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.1)', fontFamily: 'Montserrat, sans-serif', width: '250px', borderRadius: 0 }}
                />
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </div>
              <button
                onClick={handleAdd}
                className="p-3 text-white transition-colors"
                style={{ backgroundColor: 'rgb(240, 45, 110)', borderRadius: 0 }}
                title="Aggiungi mostra"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          )}
        </motion.div>


        {/* Tab Content */}
        {activeTab === 'collezioni' && (
          loading ? (
            <div className="min-h-[400px]" />
          ) : collections.length === 0 ? (
            <div className="p-8 border text-center" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
              <p className="text-white text-lg mb-4">Nessuna collezione presente</p>
              <button
                onClick={() => navigate('/content/collezione/new')}
                className="px-6 py-3 font-bold uppercase text-white"
                style={{ backgroundColor: 'rgb(240, 45, 110)', borderRadius: 0 }}
              >
                Aggiungi la prima collezione
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-6">
                {getPaginatedItems(filterCollections(collections), currentPageCollections).map((collection) => (
                <div
                  key={collection.id}
                  className="bg-secondary p-4 border rounded-xl hover:bg-white/5 cursor-pointer transition-all"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  onClick={() => navigate(`/content/collezione/${collection.id}`)}
                >
                  <div className="flex items-start gap-6 p-2">
                    <div className="w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                      <ImageWithFallback
                        src={getImageUrl(collection.image_url)}
                        alt={getTranslatedField(collection, 'title', language)}
                        objectFit="cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2" style={{ color: 'rgb(240, 45, 110)', fontFamily: 'Montserrat, sans-serif' }}>
                        {getTranslatedField(collection, 'title', language)}
                      </h3>
                      <p className="text-white mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {getTranslatedField(collection, 'description', language)}
                      </p>
                      <div className="flex items-center gap-4">
                        <p className="text-gray text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          Link: <span className="text-white/60">/collezione/{collection.slug}</span>
                        </p>
                        {!collection.is_visible && (
                          <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-lg font-bold">
                            NASCOSTO
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                ))}
              </div>
              <Paginator
                currentPage={currentPageCollections}
                totalItems={filterCollections(collections).length}
                onPageChange={setCurrentPageCollections}
              />
            </>
          )
        )}

        {activeTab === 'critica' && (
          loading ? (
            <div className="min-h-[400px]" />
          ) : critics.length === 0 ? (
            <div className="p-8 border text-center" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
              <p className="text-white text-lg mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Nessun critico presente
              </p>
              <button
                onClick={() => navigate('/content/critico/new')}
                className="px-6 py-3 font-bold uppercase text-white"
                style={{ backgroundColor: 'rgb(240, 45, 110)', fontFamily: 'Montserrat, sans-serif', borderRadius: 0 }}
              >
                Aggiungi il primo critico
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-6">
                {getPaginatedItems(filterCritics(critics), currentPageCritics).map((critic) => (
                  <div
                    key={critic.id}
                    className="bg-secondary p-4 border rounded-xl hover:bg-white/5 cursor-pointer transition-all"
                    style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                    onClick={() => navigate(`/content/critico/${critic.id}`)}
                  >
                    <div className="flex justify-between items-start p-2">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-2" style={{ color: 'rgb(240, 45, 110)', fontFamily: 'Montserrat, sans-serif' }}>
                          {critic.name_it || critic.name}
                        </h3>
                        <p className="text-white/80 mb-4">{critic.role}</p>
                        <p className="text-white/60 italic" style={{ maxWidth: '800px' }}>
                          {critic.quote_it || critic.text ? `"${(critic.quote_it || critic.text).substring(0, 200)}..."` : 'Testo non disponibile'}
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
              <Paginator
                currentPage={currentPageCritics}
                totalItems={filterCritics(critics).length}
                onPageChange={setCurrentPageCritics}
              />
            </>
          )
        )}

        {activeTab === 'mostre' && (
          loading ? (
            <div className="min-h-[400px]" />
          ) : exhibitions.length === 0 ? (
            <div className="p-8 border text-center" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
              <p className="text-white text-lg mb-4">Nessuna mostra presente</p>
              <button
                onClick={() => navigate('/content/mostra/new')}
                className="px-6 py-3 font-bold uppercase text-white"
                style={{ backgroundColor: 'rgb(240, 45, 110)', borderRadius: 0 }}
              >
                Aggiungi la prima mostra
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-6">
                {getPaginatedItems(filterExhibitions(exhibitions), currentPageExhibitions).map((exhibition) => (
                  <div
                    key={exhibition.id}
                    className="bg-secondary p-4 border rounded-xl hover:bg-white/5 cursor-pointer transition-all"
                    style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                    onClick={() => navigate(`/content/mostra/${exhibition.id}`)}
                  >
                    <div className="flex items-start gap-6 p-2">
                      {exhibition.image_url && (
                        <div className="w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                          <ImageWithFallback
                            src={getImageUrl(exhibition.image_url)}
                            alt={exhibition.title}
                            objectFit="cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-2" style={{ color: 'rgb(240, 45, 110)', fontFamily: 'Montserrat, sans-serif' }}>
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
              <Paginator
                currentPage={currentPageExhibitions}
                totalItems={filterExhibitions(exhibitions).length}
                onPageChange={setCurrentPageExhibitions}
              />
            </>
          )
        )}

        {activeTab === 'biografia' && (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Choice Screen */}
            {!selectedBioEditor && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ALF Card */}
                <button
                  onClick={() => setSelectedBioEditor('alf')}
                  className="bg-secondary p-4 border rounded-xl hover:bg-white/5 cursor-pointer transition-all"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <div className="text-center p-8">
                    <svg
                      width="64"
                      height="64"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="mx-auto mb-6 text-white/50"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <h3 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      <span style={{ color: 'rgb(240, 45, 110)' }}>ALF</span> Biografia
                    </h3>
                    <p className="text-white/60">
                      Modifica la biografia dell'artista
                    </p>
                  </div>
                </button>

                {/* STUDIO Card */}
                <button
                  onClick={() => setSelectedBioEditor('studio')}
                  className="bg-secondary p-4 border rounded-xl hover:bg-white/5 cursor-pointer transition-all"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <div className="text-center p-8">
                    <svg
                      width="64"
                      height="64"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="mx-auto mb-6 text-white/50"
                    >
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    <h3 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      <span style={{ color: 'rgb(240, 45, 110)' }}>STUDIO</span> Descrizione
                    </h3>
                    <p className="text-white/60">
                      Modifica la descrizione dello studio
                    </p>
                  </div>
                </button>
              </div>
            )}

            {/* ALF Editor */}
            {selectedBioEditor === 'alf' && (
              <div>
                <button
                  onClick={() => setSelectedBioEditor(null)}
                  className="text-white/60 hover:text-white mb-6 flex items-center gap-2"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                  Indietro
                </button>

                <div className="bg-secondary p-8 border rounded-xl" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                  <h3 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    <span style={{ color: 'rgb(240, 45, 110)' }}>ALF</span> Biografia
                  </h3>

                  <div className="space-y-8">
                    {/* Sezione Italiano */}
                    <div>
                      <h4 className="text-xl font-bold text-white mb-4">Italiano</h4>
                      {bioContent.alf.it.paragraphs.map((paragraph, index) => (
                        <div key={index}>
                          <textarea
                            value={paragraph}
                            onChange={(e) => updateBioParagraph('alf', 'it', index, e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 bg-background text-white border rounded-lg mb-2"
                            style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                            placeholder={`Paragrafo ${index + 1} in italiano...`}
                          />
                          {index < bioContent.alf.it.paragraphs.length - 1 && (
                            <div className="h-px bg-white/20 my-4"></div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-center pt-6">
                      <button
                        onClick={handleSaveBio}
                        className="px-8 py-3 font-bold uppercase text-white transition-all hover:scale-105"
                        style={{ backgroundColor: 'rgb(240, 45, 110)', fontFamily: 'Montserrat, sans-serif', borderRadius: 0 }}
                      >
                        Salva ALF
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STUDIO Editor */}
            {selectedBioEditor === 'studio' && (
              <div>
                <button
                  onClick={() => setSelectedBioEditor(null)}
                  className="text-white/60 hover:text-white mb-6 flex items-center gap-2"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                  Indietro
                </button>

                <div className="bg-secondary p-8 border rounded-xl" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                  <h3 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    <span style={{ color: 'rgb(240, 45, 110)' }}>STUDIO</span> Descrizione
                  </h3>

                  <div className="space-y-8">
                    {/* Sezione Italiano */}
                    <div>
                      <h4 className="text-xl font-bold text-white mb-4">Italiano</h4>
                      {bioContent.studio.it.paragraphs.map((paragraph, index) => (
                        <div key={index}>
                          <textarea
                            value={paragraph}
                            onChange={(e) => updateBioParagraph('studio', 'it', index, e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 bg-background text-white border rounded-lg mb-2"
                            style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                            placeholder={`Paragrafo ${index + 1} in italiano...`}
                          />
                          {index < bioContent.studio.it.paragraphs.length - 1 && (
                            <div className="h-px bg-white/20 my-4"></div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-center pt-6">
                      <button
                        onClick={handleSaveBio}
                        className="px-8 py-3 font-bold uppercase text-white transition-all hover:scale-105"
                        style={{ backgroundColor: 'rgb(240, 45, 110)', fontFamily: 'Montserrat, sans-serif', borderRadius: 0 }}
                      >
                        Salva Studio
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </motion.div>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={handleClosePreview}
        maxWidth="4xl"
        showCloseButton={false}
      >
        {/* Header */}
        <div className="bg-secondary border-b px-6 py-5 flex items-center justify-between" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <div>
            <h2 className="text-2xl font-bold text-white uppercase" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Anteprima <span style={{ color: 'rgb(240, 45, 110)' }}>Homepage</span>
            </h2>
            <p className="text-white/60 text-sm mt-1">Trascina per riordinare</p>
          </div>
          <button
            onClick={handleClosePreview}
            className="text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Collections Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {previewCollections.map((collection, index) => (
              <motion.div
                key={collection.id}
                draggable
                onDragStart={() => handleCollectionDragStart(index)}
                onDragOver={(e) => handleCollectionDragOver(e, index)}
                onDrop={(e) => handleCollectionDrop(e, index)}
                onDragEnd={handleCollectionDragEnd}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: draggedCollection === index ? 0.5 : 1,
                  scale: dragOverIndex === index ? 1.05 : 1
                }}
                transition={{ duration: 0.2 }}
                className="cursor-move group relative"
              >
                {/* Order Badge */}
                <div className="absolute -top-3 -left-3 z-10 bg-white text-black w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg" style={{ backgroundColor: 'rgb(240, 45, 110)' }}>
                  {index + 1}
                </div>

                {/* Drag Handle */}
                <div className="absolute -top-3 -right-3 z-10 bg-background border border-white/20 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  </svg>
                </div>

                {/* Collection Card */}
                <div className="aspect-[16/9] overflow-hidden rounded-lg border border-white/10 bg-background transition-all duration-300 group-hover:border-white/30">
                  <ImageWithFallback
                    src={getImageUrl(collection.image_url)}
                    alt={getTranslatedField(collection, 'title', language)}
                    objectFit="cover"
                    className="transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Helper Text */}
          {draggedCollection !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 border bg-white/5"
              style={{ borderRadius: '8px', borderColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <div className="flex items-center gap-3 text-white/80">
                <svg className="w-5 h-5 flex-shrink-0" style={{ color: 'rgb(240, 45, 110)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm">
                  Trascina la collezione nella posizione desiderata e rilascia per riordinare
                </p>
              </div>
            </motion.div>
          )}
        </div>

      </Modal>

      {/* Floating Buttons - Show only if order changed */}
      {showPreviewModal && hasOrderChanged() && (
        <div className="fixed bottom-6 right-6 flex gap-3 z-[10001]">
          <button
            onClick={handleClosePreview}
            className="px-6 py-3 font-bold uppercase text-white border hover:bg-white/5 transition-all shadow-lg"
            style={{
              borderColor: 'rgba(255, 255, 255, 0.2)',
              fontFamily: 'Montserrat, sans-serif',
              borderRadius: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)'
            }}
          >
            Annulla
          </button>
          <button
            onClick={handleSaveCollectionOrder}
            className="px-6 py-3 font-bold uppercase text-white transition-all hover:opacity-90 shadow-lg"
            style={{
              backgroundColor: 'rgb(240, 45, 110)',
              fontFamily: 'Montserrat, sans-serif',
              borderRadius: 0
            }}
          >
            Salva Ordine
          </button>
        </div>
      )}

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

export default ContentWithCollections;