import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import BackofficeLayout from '../components/BackofficeLayout';
import { getCollections, updateCollection, Collection, Artwork, getCollectionArtworks } from '../services/collections-api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

const CollectionManagement: React.FC = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const navigate = useNavigate();
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
    order_index: 0,
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

  useEffect(() => {
    loadData();
  }, [collectionId]);

  const loadData = async () => {
    if (!collectionId) return;

    setLoading(true);
    try {
      // Get all collections (including hidden ones) and find the one we need
      const allCollections = await getCollections(true);
      const collectionData = allCollections.find(c => c.id === parseInt(collectionId));

      if (collectionData) {
        setCollection(collectionData);
        setFormData({
          title: collectionData.title,
          slug: collectionData.slug,
          description: collectionData.description,
          image_url: collectionData.image_url,
          order_index: collectionData.order_index,
          is_visible: collectionData.is_visible
        });

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
      alert('Collezione aggiornata con successo!');
      loadData();
    } catch (error) {
      console.error('Error updating collection:', error);
      alert('Errore nell\'aggiornamento della collezione');
    } finally {
      setSaving(false);
    }
  };

  const handleAddArtwork = async () => {
    if (!collectionId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/artworks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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
        method: 'DELETE'
      });

      if (response.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Error deleting artwork:', error);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 px-6 flex items-center justify-center">
        <div className="text-white">Caricamento...</div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-background pt-24 px-6">
        <div className="text-white">Collezione non trovata</div>
      </div>
    );
  }

  return (
    <BackofficeLayout>
      <Helmet>
        <title>Dettaglio {collection.title} - Gestione Backoffice</title>
      </Helmet>

      <div className="max-w-5xl mx-auto py-20 px-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
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
              Gestione <span style={{ color: 'rgb(240, 45, 110)' }}>{collection.title}</span>
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
              <span className="text-white font-bold" style={{ fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}>
                Visibile nel frontend
              </span>
            </label>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('info')}
              className={`pb-4 px-4 font-bold uppercase text-lg transition-colors ${activeTab === 'info' ? 'border-b-4' : ''}`}
              style={{
                fontFamily: 'Palanquin, Helvetica Neue, sans-serif',
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
                fontFamily: 'Palanquin, Helvetica Neue, sans-serif',
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
            className="bg-secondary p-8 rounded-xl border"
            style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
          >
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
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2 bg-background text-white border rounded-lg"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                />
                <p className="text-white/60 text-sm mt-1">URL: /collezione/{formData.slug}</p>
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
                <label className="block text-white mb-2 font-bold">Immagine Copertina</label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-4 py-2 bg-background text-white border rounded-lg"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  placeholder="/DSCF9079.jpg"
                />
              </div>

              <div>
                <label className="block text-white mb-2 font-bold">Ordine di visualizzazione</label>
                <input
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-background text-white border rounded-lg"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                />
              </div>

              {formData.image_url && (
                <div className="md:col-span-2">
                  <label className="block text-white mb-2 font-bold">Anteprima Immagine</label>
                  <img
                    src={formData.image_url}
                    alt="Anteprima"
                    className="w-64 h-40 object-cover rounded-lg border"
                    style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={handleSaveCollection}
                disabled={saving}
                className="px-6 py-3 font-bold uppercase text-white rounded-lg transition-opacity disabled:opacity-50"
                style={{ backgroundColor: 'rgb(240, 45, 110)', fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}
              >
                {saving ? 'Salvataggio...' : 'Salva Modifiche'}
              </button>
              <button
                onClick={() => navigate('/content')}
                className="px-6 py-3 font-bold uppercase text-white border rounded-lg"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)', fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}
              >
                Annulla
              </button>
            </div>
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
                className="px-6 py-3 font-bold uppercase text-white transition-colors"
                style={{ backgroundColor: 'rgb(240, 45, 110)', fontFamily: 'Palanquin, Helvetica Neue, sans-serif' }}
              >
                + Aggiungi Opera
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
                          src={artwork.image_url || '/placeholder-artwork.jpg'}
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
                        <div className="flex gap-4">
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
      </div>
    </BackofficeLayout>
  );
};

export default CollectionManagement;