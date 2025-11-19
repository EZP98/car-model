import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import BackofficeLayout from '../components/BackofficeLayout';
import { getCollections, updateCollection, deleteCollection, Collection, Artwork, getCollectionArtworks } from '../services/collections-api';
import { useToast } from '../components/Toast';

const API_BASE_URL = import.meta.env.PROD
  ? 'https://alf-portfolio-api.eziopappalardo98.workers.dev'
  : 'http://localhost:8787';
const API_KEY = import.meta.env.VITE_API_KEY || '';

// Helper to add authentication headers
function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (API_KEY) {
    headers['Authorization'] = `Bearer ${API_KEY}`;
  }

  return headers;
}

// Helper function to get full image URL
const getImageUrl = (path: string): string => {
  if (!path) return '';
  // Se è già un URL completo, ritornalo così com'è
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // Se è un path relativo, costruisci l'URL completo per R2
  return `${API_BASE_URL}${path}`;
};

const CollectionManagement: React.FC = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'opere'>('info');

  // Form data for collection
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    image_url: '',
    order_index: 1,
    is_visible: true
  });

  // Original data to track changes
  const [originalData, setOriginalData] = useState({
    title: '',
    slug: '',
    description: '',
    image_url: '',
    order_index: 1,
    is_visible: true
  });

  // Form data for artwork
  const [artworkFormData, setArtworkFormData] = useState({
    title: '',
    year: '',
    technique: '',
    dimensions: '',
    image_url: ''
  });
  const [editingArtworkId, setEditingArtworkId] = useState<number | null>(null);
  const [showAddArtwork, setShowAddArtwork] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [availableImages, setAvailableImages] = useState<Array<{ filename: string; url: string }>>([]);

  useEffect(() => {
    loadData();
    loadImages();
  }, [collectionId]);

  const loadImages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/media`);
      if (response.ok) {
        const data = await response.json() as { images?: Array<{ filename: string; url: string }> };
        setAvailableImages(data.images || []);
      }
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };

  // Check if there are changes
  const hasChanges = React.useMemo(() => {
    return formData.title !== originalData.title ||
      formData.slug !== originalData.slug ||
      formData.description !== originalData.description ||
      formData.image_url !== originalData.image_url ||
      formData.order_index !== originalData.order_index ||
      formData.is_visible !== originalData.is_visible;
  }, [formData, originalData]);

  const loadData = async () => {
    if (!collectionId) return;

    setLoading(true);
    try {
      // Get all collections (including hidden ones) and find the one we need
      const allCollections = await getCollections(true);
      const collectionData = allCollections.find(c => c.id === parseInt(collectionId));

      if (collectionData) {
        setCollection(collectionData);
        const data = {
          title: collectionData.title,
          slug: collectionData.slug,
          description: collectionData.description,
          image_url: collectionData.image_url,
          order_index: collectionData.order_index,
          is_visible: collectionData.is_visible
        };
        setFormData(data);
        setOriginalData(data);

        // Get artworks
        const artworksData = await getCollectionArtworks(parseInt(collectionId));
        setArtworks(artworksData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCollection = async () => {
    if (!collection) return;

    setSaving(true);
    try {
      await updateCollection(collection.id, formData);
      showSuccess('Collezione aggiornata con successo!');
      loadData();
    } catch (error) {
      console.error('Error updating collection:', error);
      showError('Errore nell\'aggiornamento della collezione');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCollection = async () => {
    if (!collection) return;

    const confirmDelete = window.confirm(
      `Sei sicuro di voler eliminare la collezione "${collection.title}"?\n\n` +
      'Questa azione eliminerà anche tutte le opere associate e non può essere annullata.'
    );

    if (!confirmDelete) return;

    try {
      await deleteCollection(collection.id);
      showSuccess('Collezione eliminata con successo!');
      setTimeout(() => {
        navigate('/content?tab=collezioni');
      }, 1000);
    } catch (error) {
      console.error('Error deleting collection:', error);
      showError('Errore nell\'eliminazione della collezione');
    }
  };

  const handleAddArtwork = async () => {
    if (!collectionId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/artworks`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...artworkFormData,
          year: artworkFormData.year ? parseInt(artworkFormData.year) : null,
          collection_id: parseInt(collectionId),
          is_visible: true,
          order_index: artworks.length
        })
      });

      if (response.ok) {
        setShowAddArtwork(false);
        setArtworkFormData({ title: '', year: '', technique: '', dimensions: '', image_url: '' });
        loadData();
      }
    } catch (error) {
      console.error('Error adding artwork:', error);
    }
  };

  const handleUpdateArtwork = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/artworks/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...artworkFormData,
          year: artworkFormData.year ? parseInt(artworkFormData.year) : null
        })
      });

      if (response.ok) {
        setEditingArtworkId(null);
        setArtworkFormData({ title: '', year: '', technique: '', dimensions: '', image_url: '' });
        loadData();
      }
    } catch (error) {
      console.error('Error updating artwork:', error);
    }
  };

  const handleDeleteArtwork = async (id: number) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa opera?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/artworks/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Error deleting artwork:', error);
    }
  };

  const handleToggleArtworkVisibility = async (artwork: Artwork) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/artworks/${artwork.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          is_visible: !artwork.is_visible
        })
      });

      if (response.ok) {
        showSuccess(`Opera ${!artwork.is_visible ? 'visibile' : 'nascosta'} con successo`);
        loadData();
      }
    } catch (error) {
      console.error('Error toggling artwork visibility:', error);
      showError('Errore nell\'aggiornamento della visibilità');
    }
  };

  const handleEditArtwork = (artwork: Artwork) => {
    setEditingArtworkId(artwork.id);
    setArtworkFormData({
      title: artwork.title,
      year: artwork.year?.toString() || '',
      technique: artwork.technique || '',
      dimensions: artwork.dimensions || '',
      image_url: artwork.image_url || ''
    });
  };

  return (
    <BackofficeLayout>
      <Helmet>
        <title>{collection ? `Dettaglio ${collection.title}` : 'Caricamento...'} - Gestione Backoffice</title>
      </Helmet>

      {loading ? (
        <div className="max-w-5xl mx-auto py-20 px-12 flex items-center justify-center min-h-[60vh]">
          <div className="text-white text-xl">Caricamento...</div>
        </div>
      ) : !collection ? (
        <div className="max-w-5xl mx-auto py-20 px-12">
          <div className="text-white text-xl">Collezione non trovata</div>
        </div>
      ) : (
      <div className="max-w-5xl mx-auto py-20 px-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
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
            <h1 className="text-4xl font-bold uppercase" style={{ fontFamily: 'Montserrat, sans-serif', color: 'white' }}>
              {collection.title}
            </h1>
          </div>
          <div className="flex items-center gap-4">
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
                Visibile nel frontend
              </span>
            </label>

            {/* Delete Button */}
            <button
              onClick={handleDeleteCollection}
              className="px-4 py-2 font-bold uppercase text-white border border-red-500/30 hover:bg-red-500/10 hover:border-red-500 transition-colors"
              style={{ fontFamily: 'Montserrat, sans-serif', borderRadius: '8px' }}
              title="Elimina collezione"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('info')}
              className={`pb-4 px-4 font-bold uppercase text-lg transition-colors ${activeTab === 'info' ? 'border-b-4' : ''}`}
              style={{
                fontFamily: 'Montserrat, sans-serif',
                color: activeTab === 'info' ? 'rgb(240, 45, 110)' : 'white',
                borderColor: activeTab === 'info' ? 'rgb(240, 45, 110)' : 'transparent'
              }}
            >
              Informazioni Collezione
            </button>
            <button
              onClick={() => setActiveTab('opere')}
              className={`pb-4 px-4 font-bold uppercase text-lg transition-colors ${activeTab === 'opere' ? 'border-b-4' : ''}`}
              style={{
                fontFamily: 'Montserrat, sans-serif',
                color: activeTab === 'opere' ? 'rgb(240, 45, 110)' : 'white',
                borderColor: activeTab === 'opere' ? 'rgb(240, 45, 110)' : 'transparent'
              }}
            >
              Opere ({artworks.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'info' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Informazioni Collezione */}
            <div className="bg-secondary p-8 rounded-xl border" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
              <h2 className="text-2xl font-bold text-white mb-6">Informazioni Collezione</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <label className="block text-white mb-2 font-bold">Slug (URL)</label>
                  <input
                    type="text"
                    value={formData.slug}
                    readOnly
                    className="w-full px-4 py-2 bg-background/50 text-white/70 border rounded-lg cursor-not-allowed"
                    style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  />
                  <p className="text-white/60 text-sm mt-1">⚠️ Non modificabile | URL: /collezione/{formData.slug}</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white mb-2 font-bold">Descrizione</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 bg-background text-white border rounded-lg"
                    style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  />
                </div>

                <div>
                  <label className="block text-white mb-2 font-bold">Ordine di visualizzazione</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.order_index}
                    onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2 bg-background text-white border rounded-lg"
                    style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  />
                  <p className="text-white/60 text-sm mt-1">
                    1 = prima posizione. Se usi numeri uguali o salti (es. 1, 5, 12), l'ordine sarà comunque corretto.
                  </p>
                </div>
              </div>
            </div>

            {/* Immagine Collezione */}
            <div className="bg-secondary p-8 rounded-xl border" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
              <h2 className="text-2xl font-bold text-white mb-6">Immagine Collezione</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-white mb-2 font-bold">Immagine Copertina</label>
                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="flex-1 px-4 py-2 bg-background text-white border rounded-lg"
                      style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                      placeholder="/images/foto.jpg"
                    />
                    <button
                      onClick={() => setShowImagePicker(true)}
                      className="px-6 py-2 font-bold uppercase text-white rounded-lg transition-opacity hover:opacity-90"
                      style={{ backgroundColor: 'rgb(240, 45, 110)' }}
                    >
                      Scegli da Storage
                    </button>
                  </div>
                </div>

                {formData.image_url && (
                  <div>
                    <label className="block text-white mb-2 font-bold">Anteprima Immagine</label>
                    <img
                      src={getImageUrl(formData.image_url)}
                      alt="Anteprima"
                      className="w-64 h-40 object-cover rounded-lg border"
                      style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.jpg';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Image Picker Modal */}
            {showImagePicker && (
              <div
                className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6"
                onClick={() => setShowImagePicker(false)}
              >
                <div
                  className="bg-secondary rounded-xl p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto border"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-white">Seleziona Immagine</h3>
                    <button
                      onClick={() => setShowImagePicker(false)}
                      className="text-white/60 hover:text-white text-3xl"
                    >
                      ×
                    </button>
                  </div>

                  {availableImages.length === 0 ? (
                    <p className="text-white/60 text-center py-8">Nessuna immagine disponibile nello storage</p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {availableImages.map((image) => (
                        <div
                          key={image.filename}
                          className="cursor-pointer group"
                          onClick={() => {
                            setFormData({ ...formData, image_url: image.url });
                            setShowImagePicker(false);
                          }}
                        >
                          <div className="aspect-video bg-background rounded-lg overflow-hidden border-2 border-transparent group-hover:border-accent transition-colors">
                            <img
                              src={getImageUrl(image.url)}
                              alt={image.filename}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-white/60 text-sm mt-2 truncate">{image.filename}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'opere' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Opere della Collezione</h2>
              <button
                onClick={() => setShowAddArtwork(true)}
                className="w-12 h-12 flex items-center justify-center font-bold text-white text-2xl transition-colors"
                style={{ backgroundColor: 'rgb(240, 45, 110)', borderRadius: '8px' }}
                title="Aggiungi Opera"
              >
                +
              </button>
            </div>

            {/* Form per aggiungere nuova opera */}
            {showAddArtwork && (
              <div className="bg-secondary p-6 mb-6 border rounded-xl" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                <h3 className="text-xl font-bold text-white mb-4">Nuova Opera</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white mb-2 font-bold">Titolo *</label>
                    <input
                      type="text"
                      value={artworkFormData.title}
                      onChange={(e) => setArtworkFormData({ ...artworkFormData, title: e.target.value })}
                      className="w-full px-4 py-2 bg-background text-white border rounded-lg"
                      style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2 font-bold">Anno</label>
                    <input
                      type="number"
                      value={artworkFormData.year}
                      onChange={(e) => setArtworkFormData({ ...artworkFormData, year: e.target.value })}
                      className="w-full px-4 py-2 bg-background text-white border rounded-lg"
                      style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2 font-bold">Tecnica</label>
                    <input
                      type="text"
                      value={artworkFormData.technique}
                      onChange={(e) => setArtworkFormData({ ...artworkFormData, technique: e.target.value })}
                      className="w-full px-4 py-2 bg-background text-white border rounded-lg"
                      style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2 font-bold">Dimensioni</label>
                    <input
                      type="text"
                      value={artworkFormData.dimensions}
                      onChange={(e) => setArtworkFormData({ ...artworkFormData, dimensions: e.target.value })}
                      className="w-full px-4 py-2 bg-background text-white border rounded-lg"
                      style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-white mb-2 font-bold">URL Immagine</label>
                    <input
                      type="text"
                      value={artworkFormData.image_url}
                      onChange={(e) => setArtworkFormData({ ...artworkFormData, image_url: e.target.value })}
                      className="w-full px-4 py-2 bg-background text-white border rounded-lg"
                      style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                    />
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={handleAddArtwork}
                    className="px-6 py-2 font-bold uppercase text-white rounded-lg"
                    style={{ backgroundColor: 'rgb(240, 45, 110)' }}
                  >
                    Aggiungi
                  </button>
                  <button
                    onClick={() => {
                      setShowAddArtwork(false);
                      setArtworkFormData({ title: '', year: '', technique: '', dimensions: '', image_url: '' });
                    }}
                    className="px-6 py-2 font-bold uppercase text-white border rounded-lg"
                    style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    Annulla
                  </button>
                </div>
              </div>
            )}

            {/* Lista opere */}
            {artworks.length === 0 ? (
              <div className="p-8 border text-center rounded-xl" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                <p className="text-white text-lg mb-4">Nessuna opera presente in questa collezione</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {artworks.map((artwork) => (
                  <div key={artwork.id} className="bg-secondary p-6 border rounded-xl" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    {editingArtworkId === artwork.id ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white mb-2 font-bold">Titolo</label>
                          <input
                            type="text"
                            value={artworkFormData.title}
                            onChange={(e) => setArtworkFormData({ ...artworkFormData, title: e.target.value })}
                            className="w-full px-4 py-2 bg-background text-white border rounded-lg"
                            style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                          />
                        </div>
                        <div>
                          <label className="block text-white mb-2 font-bold">Anno</label>
                          <input
                            type="number"
                            value={artworkFormData.year}
                            onChange={(e) => setArtworkFormData({ ...artworkFormData, year: e.target.value })}
                            className="w-full px-4 py-2 bg-background text-white border rounded-lg"
                            style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                          />
                        </div>
                        <div>
                          <label className="block text-white mb-2 font-bold">Tecnica</label>
                          <input
                            type="text"
                            value={artworkFormData.technique}
                            onChange={(e) => setArtworkFormData({ ...artworkFormData, technique: e.target.value })}
                            className="w-full px-4 py-2 bg-background text-white border rounded-lg"
                            style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                          />
                        </div>
                        <div>
                          <label className="block text-white mb-2 font-bold">Dimensioni</label>
                          <input
                            type="text"
                            value={artworkFormData.dimensions}
                            onChange={(e) => setArtworkFormData({ ...artworkFormData, dimensions: e.target.value })}
                            className="w-full px-4 py-2 bg-background text-white border rounded-lg"
                            style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-white mb-2 font-bold">URL Immagine</label>
                          <input
                            type="text"
                            value={artworkFormData.image_url}
                            onChange={(e) => setArtworkFormData({ ...artworkFormData, image_url: e.target.value })}
                            className="w-full px-4 py-2 bg-background text-white border rounded-lg"
                            style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                          />
                        </div>
                        <div className="md:col-span-2 flex gap-4">
                          <button
                            onClick={() => handleUpdateArtwork(artwork.id)}
                            className="px-6 py-2 font-bold uppercase text-white rounded-lg"
                            style={{ backgroundColor: 'rgb(240, 45, 110)' }}
                          >
                            Salva
                          </button>
                          <button
                            onClick={() => {
                              setEditingArtworkId(null);
                              setArtworkFormData({ title: '', year: '', technique: '', dimensions: '', image_url: '' });
                            }}
                            className="px-6 py-2 font-bold uppercase text-white border rounded-lg"
                            style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                          >
                            Annulla
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-6">
                        <img
                          src={getImageUrl(artwork.image_url || '/placeholder-artwork.jpg')}
                          alt={artwork.title}
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold mb-2" style={{ color: 'rgb(240, 45, 110)' }}>
                            {artwork.title}
                          </h3>
                          <div className="text-white/80 space-y-1">
                            {artwork.year && <p>Anno: {artwork.year}</p>}
                            {artwork.technique && <p>Tecnica: {artwork.technique}</p>}
                            {artwork.dimensions && <p>Dimensioni: {artwork.dimensions}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {/* Toggle Visibilità */}
                          <button
                            onClick={() => handleToggleArtworkVisibility(artwork)}
                            className="relative"
                            title={artwork.is_visible ? 'Nascondi nel frontend' : 'Mostra nel frontend'}
                          >
                            <div
                              style={{
                                width: '56px',
                                height: '28px',
                                borderRadius: '14px',
                                backgroundColor: artwork.is_visible ? 'rgb(240, 45, 110)' : '#4B5563',
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
                                  left: artwork.is_visible ? '30px' : '2px',
                                  transition: 'left 0.3s',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}
                              />
                            </div>
                          </button>

                          <button
                            onClick={() => handleEditArtwork(artwork)}
                            className="p-2 text-white rounded-lg hover:opacity-80 transition-opacity"
                            title="Modifica"
                            style={{ backgroundColor: 'rgb(240, 45, 110)' }}
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteArtwork(artwork.id)}
                            className="p-2 text-white border rounded-lg hover:text-red-400 hover:border-red-400 transition-colors"
                            style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                            title="Elimina"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            )}
          </motion.div>
        )}

        {/* Floating Buttons - Only show in Info tab when there are changes */}
        {activeTab === 'info' && hasChanges && (
          <div className="fixed bottom-6 right-6 flex gap-3 z-50">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 font-bold uppercase text-white border hover:bg-white/5 transition-all shadow-lg"
              style={{ borderColor: 'rgba(255, 255, 255, 0.2)', fontFamily: 'Montserrat, sans-serif', borderRadius: 0, backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
            >
              Annulla
            </button>
            <button
              onClick={handleSaveCollection}
              disabled={saving}
              className="px-6 py-3 font-bold uppercase text-white transition-all disabled:opacity-50 hover:opacity-90 shadow-lg"
              style={{ backgroundColor: 'rgb(240, 45, 110)', fontFamily: 'Montserrat, sans-serif', borderRadius: 0 }}
            >
              {saving ? 'Salvataggio...' : 'Salva Modifiche'}
            </button>
          </div>
        )}
      </div>
      )}
    </BackofficeLayout>
  );
};

export default CollectionManagement;