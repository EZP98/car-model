import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import BackofficeLayout from '../components/BackofficeLayout';
import { getCollections, getCollectionArtworks, Collection, Artwork } from '../services/collections-api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

const CollectionArtworks: React.FC = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const navigate = useNavigate();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    year: '',
    technique: '',
    dimensions: '',
    image_url: ''
  });

  useEffect(() => {
    loadData();
  }, [collectionId]);

  const loadData = async () => {
    if (!collectionId) return;

    setLoading(true);
    try {
      // Get all collections and find the one we need
      const allCollections = await getCollections();
      const collectionData = allCollections.find(c => c.id === parseInt(collectionId));
      setCollection(collectionData || null);

      // Get artworks for this collection
      const artworksData = await getCollectionArtworks(parseInt(collectionId));
      setArtworks(artworksData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddArtwork = async () => {
    if (!collectionId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/artworks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          year: formData.year ? parseInt(formData.year) : null,
          collection_id: parseInt(collectionId),
          is_visible: true,
          order_index: artworks.length
        })
      });

      if (response.ok) {
        setShowAddForm(false);
        setFormData({ title: '', year: '', technique: '', dimensions: '', image_url: '' });
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
          ...formData,
          year: formData.year ? parseInt(formData.year) : null
        })
      });

      if (response.ok) {
        setEditingId(null);
        setFormData({ title: '', year: '', technique: '', dimensions: '', image_url: '' });
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

  const handleEdit = (artwork: Artwork) => {
    setEditingId(artwork.id);
    setFormData({
      title: artwork.title,
      year: artwork.year?.toString() || '',
      technique: artwork.technique || '',
      dimensions: artwork.dimensions || '',
      image_url: artwork.image_url || ''
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowAddForm(false);
    setFormData({ title: '', year: '', technique: '', dimensions: '', image_url: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 px-12 flex items-center justify-center">
        <div className="text-white">Caricamento...</div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-background pt-24 px-12">
        <div className="text-white">Collezione non trovata</div>
      </div>
    );
  }

  return (
    <BackofficeLayout>
      <Helmet>
        <title>Gestione Opere - {collection.title} - Adele Lo Feudo</title>
      </Helmet>

      <div className="max-w-5xl mx-auto py-20 px-12">
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
            <h1 className="text-4xl font-bold text-white uppercase" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Opere di <span style={{ color: 'rgb(240, 45, 110)' }}>{collection.title}</span>
            </h1>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-12 py-3 font-bold uppercase text-white transition-colors"
            style={{ backgroundColor: 'rgb(240, 45, 110)', fontFamily: 'Montserrat, sans-serif', borderRadius: 0 }}
          >
            + Aggiungi Opera
          </button>
        </div>

        {/* Form per aggiungere nuova opera */}
        {showAddForm && (
          <motion.div
            className="bg-secondary p-6 mb-6 border rounded-xl"
            style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-xl font-bold text-white mb-4">Nuova Opera</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white mb-2 font-bold">Titolo *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-background text-white border rounded-lg"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  placeholder="es. Senza Titolo #1"
                />
              </div>
              <div>
                <label className="block text-white mb-2 font-bold">Anno</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-4 py-2 bg-background text-white border rounded-lg"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  placeholder="es. 2024"
                />
              </div>
              <div>
                <label className="block text-white mb-2 font-bold">Tecnica</label>
                <input
                  type="text"
                  value={formData.technique}
                  onChange={(e) => setFormData({ ...formData, technique: e.target.value })}
                  className="w-full px-4 py-2 bg-background text-white border rounded-lg"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  placeholder="es. Olio su tela"
                />
              </div>
              <div>
                <label className="block text-white mb-2 font-bold">Dimensioni</label>
                <input
                  type="text"
                  value={formData.dimensions}
                  onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                  className="w-full px-4 py-2 bg-background text-white border rounded-lg"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  placeholder="es. 100x120 cm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-white mb-2 font-bold">URL Immagine</label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-4 py-2 bg-background text-white border rounded-lg"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  placeholder="es. /DSCF9079.jpg"
                />
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleAddArtwork}
                className="px-12 py-2 font-bold uppercase text-white"
                style={{ backgroundColor: 'rgb(240, 45, 110)', fontFamily: 'Montserrat, sans-serif', borderRadius: 0 }}
              >
                Aggiungi
              </button>
              <button
                onClick={handleCancel}
                className="px-12 py-2 font-bold uppercase text-white border"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)', fontFamily: 'Montserrat, sans-serif', borderRadius: 0 }}
              >
                Annulla
              </button>
            </div>
          </motion.div>
        )}

        {/* Lista opere */}
        {artworks.length === 0 ? (
          <div className="p-8 border text-center rounded-xl" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
            <p className="text-white text-lg mb-4">Nessuna opera presente in questa collezione</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-12 py-3 font-bold uppercase text-white"
              style={{ backgroundColor: 'rgb(240, 45, 110)', fontFamily: 'Montserrat, sans-serif', borderRadius: 0 }}
            >
              Aggiungi la prima opera
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {artworks.map((artwork) => (
              <motion.div
                key={artwork.id}
                className="bg-secondary p-6 border rounded-xl"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {editingId === artwork.id ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <label className="block text-white mb-2 font-bold">Anno</label>
                      <input
                        type="number"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        className="w-full px-4 py-2 bg-background text-white border rounded-lg"
                        style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-white mb-2 font-bold">Tecnica</label>
                      <input
                        type="text"
                        value={formData.technique}
                        onChange={(e) => setFormData({ ...formData, technique: e.target.value })}
                        className="w-full px-4 py-2 bg-background text-white border rounded-lg"
                        style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-white mb-2 font-bold">Dimensioni</label>
                      <input
                        type="text"
                        value={formData.dimensions}
                        onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                        className="w-full px-4 py-2 bg-background text-white border rounded-lg"
                        style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-white mb-2 font-bold">URL Immagine</label>
                      <input
                        type="text"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        className="w-full px-4 py-2 bg-background text-white border rounded-lg"
                        style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                      />
                    </div>
                    <div className="md:col-span-2 flex gap-4">
                      <button
                        onClick={() => handleUpdateArtwork(artwork.id)}
                        className="px-12 py-2 font-bold uppercase text-white"
                        style={{ backgroundColor: 'rgb(240, 45, 110)', fontFamily: 'Montserrat, sans-serif', borderRadius: 0 }}
                      >
                        Salva
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-12 py-2 font-bold uppercase text-white border"
                        style={{ borderColor: 'rgba(255, 255, 255, 0.1)', fontFamily: 'Montserrat, sans-serif', borderRadius: 0 }}
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
                      <h3 className="text-2xl font-bold mb-2" style={{ color: 'rgb(240, 45, 110)', fontFamily: 'Montserrat, sans-serif' }}>
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
                        onClick={() => handleEdit(artwork)}
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
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </BackofficeLayout>
  );
};

export default CollectionArtworks;