import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import BackofficeLayout from '../components/BackofficeLayout';
import { getCollections, updateCollection, deleteCollection, Collection, Artwork, getCollectionArtworks, getAllArtworks } from '../services/collections-api';
import Toast from '../components/Toast';
import ImageWithFallback from '../components/ImageWithFallback';
import ConfirmModal from '../components/ConfirmModal';
import { optimizeImageComplete } from '../utils/imageOptimization';

// In development, use empty string to leverage Vite proxy
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
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
  // TEMPORARY: Use production images even on localhost for preview
  // Remove this when you want to test with local images
  const imageBaseUrl = import.meta.env.DEV
    ? 'https://alf-portfolio-api.eziopappalardo98.workers.dev'
    : API_BASE_URL;
  // Se è un path relativo, costruisci l'URL completo per R2
  return `${imageBaseUrl}${path}`;
};

const CollectionManagement: React.FC = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const navigate = useNavigate();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'opere'>('info');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Form data for collection (Italian fields only - other languages auto-translated by AI)
  const [formData, setFormData] = useState({
    title_it: '',
    slug: '',
    description_it: '',
    detailed_description_it: '',
    image_url: '',
    order_index: 1,
    is_visible: true
  });

  // Original data to track changes
  const [originalData, setOriginalData] = useState({
    title_it: '',
    slug: '',
    description_it: '',
    detailed_description_it: '',
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
  const [allImages, setAllImages] = useState<Array<{ filename: string; url: string }>>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [draggedArtwork, setDraggedArtwork] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  // Multi-select artwork modal state
  const [showArtworkSelector, setShowArtworkSelector] = useState(false);
  const [storageImages, setStorageImages] = useState<Array<{ filename: string; url: string }>>([]);
  const [selectedImageUrls, setSelectedImageUrls] = useState<Set<string>>(new Set());
  const [loadingStorageImages, setLoadingStorageImages] = useState(false);
  const [addingArtworks, setAddingArtworks] = useState(false);

  useEffect(() => {
    loadData();
    loadImages();
  }, [collectionId]);

  // Disable Lenis when modal is open
  useEffect(() => {
    if (showImagePicker || showArtworkSelector) {
      const lenis = (window as any).lenis;
      if (lenis) {
        lenis.stop();
      }
    } else {
      const lenis = (window as any).lenis;
      if (lenis) {
        lenis.start();
      }
    }
  }, [showImagePicker, showArtworkSelector]);

  const loadImages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/media`);
      if (response.ok) {
        const data = await response.json() as { images?: Array<{ filename: string; url: string }> };
        // Keep all images (originals + thumbnails) for finding thumbnails
        setAllImages(data.images || []);
        // Filter out thumbnails - show only originals in the picker
        const originals = (data.images || []).filter(img => !img.filename.includes('_thumb'));
        setAvailableImages(originals);
      }
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };

  // Get thumbnail URL from original URL
  const getThumbnailUrl = (originalUrl: string): string => {
    // Replace extension with _thumb.extension
    return originalUrl.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '_thumb.$1');
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Per favore seleziona solo file immagine');
      return;
    }

    setIsUploading(true);
    try {
      console.log('🚀 Ottimizzazione immagine collezione...');

      // Ottimizza immagine in WebP + thumbnail
      const { optimized, thumbnail } = await optimizeImageComplete(file);

      // Carica immagine ottimizzata
      console.log('📤 Upload immagine ottimizzata...');
      const uploadFormDataOptimized = new FormData();
      uploadFormDataOptimized.append('file', optimized);

      const responseOptimized = await fetch(`${API_BASE_URL}/api/media/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_API_KEY || ''}`
        },
        body: uploadFormDataOptimized
      });

      if (!responseOptimized.ok) throw new Error('Upload optimized failed');

      const dataOptimized = await responseOptimized.json() as { url: string };

      // Carica thumbnail
      console.log('📤 Upload thumbnail...');
      const uploadFormDataThumbnail = new FormData();
      uploadFormDataThumbnail.append('file', thumbnail);

      const responseThumbnail = await fetch(`${API_BASE_URL}/api/media/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_API_KEY || ''}`
        },
        body: uploadFormDataThumbnail
      });

      if (!responseThumbnail.ok) {
        console.warn('⚠️ Thumbnail upload failed, but main image is uploaded');
      }

      console.log('✅ Upload completato!');

      // Reload images to show the new one
      await loadImages();

      // Auto-select the uploaded image
      setFormData(prev => ({ ...prev, image_url: dataOptimized.url }));
      setShowImagePicker(false);

      alert('Immagine caricata e ottimizzata con successo!');
    } catch (error) {
      console.error('❌ Errore upload:', error);
      alert('Errore durante il caricamento. Riprova.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  // Drag & Drop handlers for artworks reordering
  const handleArtworkDragStart = (index: number) => {
    setDraggedArtwork(index);
  };

  const handleArtworkDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleArtworkDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedArtwork === null || draggedArtwork === dropIndex) {
      setDraggedArtwork(null);
      setDragOverIndex(null);
      return;
    }

    // Reorder artworks array
    const newArtworks = [...artworks];
    const draggedItem = newArtworks[draggedArtwork];
    newArtworks.splice(draggedArtwork, 1);
    newArtworks.splice(dropIndex, 0, draggedItem);

    setArtworks(newArtworks);
    setDraggedArtwork(null);
    setDragOverIndex(null);

    // TODO: Save new order to backend
    console.log('New artwork order:', newArtworks.map((a, i) => ({ id: a.id, order: i + 1 })));
  };

  const handleArtworkDragEnd = () => {
    setDraggedArtwork(null);
    setDragOverIndex(null);
  };

  // Check if there are changes
  const hasChanges = React.useMemo(() => {
    return formData.title_it !== originalData.title_it ||
      formData.slug !== originalData.slug ||
      formData.description_it !== originalData.description_it ||
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
          title_it: (collectionData as any).title_it || collectionData.title,
          slug: collectionData.slug,
          description_it: (collectionData as any).description_it || collectionData.description,
          detailed_description_it: (collectionData as any).detailed_description_it || (collectionData as any).detailed_description || '',
          image_url: collectionData.image_url,
          order_index: collectionData.order_index,
          is_visible: collectionData.is_visible
        };
        setFormData(data);
        setOriginalData(data);

        // Get artworks (including hidden ones for backoffice)
        const artworksData = await getCollectionArtworks(parseInt(collectionId), true);
        console.log('Artworks loaded:', artworksData);
        console.log('First artwork image_url:', artworksData[0]?.image_url);
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
      setToast({ message: 'Collezione aggiornata con successo!', type: 'success' });
      loadData();
    } catch (error) {
      console.error('Error updating collection:', error);
      setToast({ message: 'Errore nell\'aggiornamento della collezione', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCollection = async () => {
    if (!collection) return;

    setConfirmModal({
      isOpen: true,
      title: 'Elimina Collezione',
      message: `Sei sicuro di voler eliminare la collezione "${collection.title_it || collection.title}"?\n\nQuesta azione eliminerà anche tutte le opere associate e non può essere annullata.`,
      onConfirm: async () => {
        try {
          await deleteCollection(collection.id);
          setToast({ message: 'Collezione eliminata con successo!', type: 'success' });
          setConfirmModal(null);
          setTimeout(() => {
            navigate('/content?tab=collezioni');
          }, 1000);
        } catch (error) {
          console.error('Error deleting collection:', error);
          setToast({ message: 'Errore nell\'eliminazione della collezione', type: 'error' });
          setConfirmModal(null);
        }
      }
    });
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
    setConfirmModal({
      isOpen: true,
      title: 'Elimina Opera',
      message: 'Sei sicuro di voler eliminare questa opera?',
      onConfirm: async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/artworks/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
          });

          if (response.ok) {
            // Update state directly instead of reloading all data
            setArtworks(prev => prev.filter(artwork => artwork.id !== id));
            setToast({ message: 'Opera eliminata con successo!', type: 'success' });
            setConfirmModal(null);
          }
        } catch (error) {
          console.error('Error deleting artwork:', error);
          setToast({ message: 'Errore nell\'eliminazione dell\'opera', type: 'error' });
          setConfirmModal(null);
        }
      }
    });
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
        setToast({ message: `Opera ${!artwork.is_visible ? 'visibile' : 'nascosta'} con successo`, type: 'success' });
        loadData();
      }
    } catch (error) {
      console.error('Error toggling artwork visibility:', error);
      setToast({ message: 'Errore nell\'aggiornamento della visibilità', type: 'error' });
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

  // Load all storage images for selection
  const loadStorageImages = async () => {
    setLoadingStorageImages(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/media`);
      if (response.ok) {
        const data = await response.json() as { images?: Array<{ filename: string; url: string }> };
        // Filter out thumbnails - show only originals
        const originals = (data.images || []).filter(img => !img.filename.includes('_thumb'));
        setStorageImages(originals);
      }
    } catch (error) {
      console.error('Error loading storage images:', error);
      setToast({ message: 'Errore nel caricamento delle immagini', type: 'error' });
    } finally {
      setLoadingStorageImages(false);
    }
  };

  // Open artwork selector modal
  const handleOpenArtworkSelector = () => {
    setShowArtworkSelector(true);
    setSelectedImageUrls(new Set());
    loadStorageImages();
  };

  // Toggle image selection
  const toggleImageSelection = (imageUrl: string) => {
    setSelectedImageUrls(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imageUrl)) {
        newSet.delete(imageUrl);
      } else {
        newSet.add(imageUrl);
      }
      return newSet;
    });
  };

  // Handle uploading artwork image in selector modal
  const handleArtworkImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Per favore seleziona solo file immagine');
      return;
    }

    setIsUploading(true);
    try {
      console.log('🚀 Ottimizzazione opera...');

      // Ottimizza immagine in WebP + thumbnail
      const { optimized, thumbnail } = await optimizeImageComplete(file);

      // Carica immagine ottimizzata
      console.log('📤 Upload opera ottimizzata...');
      const uploadFormDataOptimized = new FormData();
      uploadFormDataOptimized.append('file', optimized);

      const responseOptimized = await fetch(`${API_BASE_URL}/api/media/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_API_KEY || ''}`
        },
        body: uploadFormDataOptimized
      });

      if (!responseOptimized.ok) throw new Error('Upload optimized failed');

      const dataOptimized = await responseOptimized.json() as { url: string };

      // Carica thumbnail
      console.log('📤 Upload thumbnail opera...');
      const uploadFormDataThumbnail = new FormData();
      uploadFormDataThumbnail.append('file', thumbnail);

      const responseThumbnail = await fetch(`${API_BASE_URL}/api/media/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_API_KEY || ''}`
        },
        body: uploadFormDataThumbnail
      });

      if (!responseThumbnail.ok) {
        console.warn('⚠️ Thumbnail upload failed, but main image is uploaded');
      }

      console.log('✅ Opera caricata e ottimizzata!');

      // Create a new artwork with this image
      if (!collectionId) return;

      const createResponse = await fetch(`${API_BASE_URL}/api/artworks`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: file.name.replace(/\.[^/.]+$/, ''), // Use filename without extension as title
          image_url: dataOptimized.url,
          collection_id: parseInt(collectionId),
          is_visible: true,
          order_index: artworks.length
        })
      });

      if (createResponse.ok) {
        setToast({ message: 'Opera caricata e ottimizzata con successo!', type: 'success' });
        loadStorageImages();
        loadData(); // Refresh collection artworks
      }
    } catch (error) {
      console.error('❌ Errore upload opera:', error);
      setToast({ message: 'Errore durante il caricamento', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  // Add selected images as artworks to collection
  const handleAddSelectedArtworks = async () => {
    if (selectedImageUrls.size === 0) {
      setToast({ message: 'Seleziona almeno un\'immagine', type: 'error' });
      return;
    }

    if (!collectionId) return;

    setAddingArtworks(true);
    try {
      // Create artwork records for each selected image
      const createPromises = Array.from(selectedImageUrls).map((imageUrl, index) => {
        // Extract filename from URL for title
        const filename = imageUrl.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'Opera';

        return fetch(`${API_BASE_URL}/api/artworks`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            title: filename,
            image_url: imageUrl,
            collection_id: parseInt(collectionId),
            is_visible: true,
            order_index: artworks.length + index
          })
        });
      });

      await Promise.all(createPromises);

      setToast({
        message: `${selectedImageUrls.size} ${selectedImageUrls.size === 1 ? 'opera aggiunta' : 'opere aggiunte'} con successo!`,
        type: 'success'
      });

      setShowArtworkSelector(false);
      setSelectedImageUrls(new Set());
      loadData(); // Refresh collection artworks
    } catch (error) {
      console.error('Error adding artworks:', error);
      setToast({ message: 'Errore nell\'aggiunta delle opere', type: 'error' });
    } finally {
      setAddingArtworks(false);
    }
  };

  return (
    <BackofficeLayout>
      <Helmet>
        <title>{collection ? `Dettaglio ${collection.title_it || collection.title}` : 'Caricamento...'} - Gestione Backoffice</title>
      </Helmet>

      {loading ? (
        <div className="max-w-5xl mx-auto py-20 px-12 min-h-[60vh]" />
      ) : !collection ? (
        <div className="max-w-5xl mx-auto py-20 px-12">
          <div className="text-white text-xl">Collezione non trovata</div>
        </div>
      ) : (
      <motion.div
        className="max-w-5xl mx-auto py-20 px-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
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
              {collection.title_it || collection.title}
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
        <div className="mb-6 flex gap-2 border-b border-white/10">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-6 py-3 font-bold uppercase text-sm tracking-wide transition-colors border-b-2 ${
              activeTab === 'info'
                ? 'text-white border-accent'
                : 'text-white/50 hover:text-white border-transparent hover:border-white/20'
            }`}
          >
            Informazioni Collezione
          </button>
          <button
            onClick={() => setActiveTab('opere')}
            className={`px-6 py-3 font-bold uppercase text-sm tracking-wide transition-colors border-b-2 ${
              activeTab === 'opere'
                ? 'text-white border-accent'
                : 'text-white/50 hover:text-white border-transparent hover:border-white/20'
            }`}
          >
            Opere ({artworks.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'info' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Immagine Collezione */}
            <div
              onClick={() => setShowImagePicker(true)}
              className="relative cursor-pointer group rounded-xl overflow-hidden"
              style={{
                border: formData.image_url ? '2px solid rgba(255, 255, 255, 0.1)' : '2px dashed rgba(255, 255, 255, 0.3)',
                backgroundColor: formData.image_url ? 'transparent' : 'rgba(0, 0, 0, 0.3)'
              }}
            >
              {formData.image_url ? (
                <>
                  {/* Image with overlay */}
                  <div className="aspect-video relative">
                    <ImageWithFallback
                      src={getImageUrl(formData.image_url)}
                      alt="Copertina"
                      aspectRatio="aspect-video"
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
                </>
              ) : (
                <>
                  {/* Empty state */}
                  <div className="aspect-video flex flex-col items-center justify-center p-8">
                    <svg className="w-16 h-16 text-white/40 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-white/60 font-bold text-lg mb-1">Clicca per scegliere immagine</p>
                    <p className="text-white/40 text-sm">Immagine di copertina della collezione</p>
                  </div>
                </>
              )}
            </div>

            {/* Informazioni Collezione */}
            <div className="bg-secondary p-8 rounded-xl border" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
              <h2 className="text-2xl font-bold text-white mb-6">Informazioni Collezione</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-white mb-2 font-bold">Titolo</label>
                  <input
                    type="text"
                    value={formData.title_it}
                    onChange={(e) => setFormData({ ...formData, title_it: e.target.value })}
                    className="w-full px-4 py-2 bg-background text-white border rounded-lg"
                    style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  />
                </div>

                <div>
                  <label className="block text-white mb-2 font-bold">Descrizione Breve</label>
                  <textarea
                    value={formData.description_it}
                    onChange={(e) => setFormData({ ...formData, description_it: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 bg-background text-white border rounded-lg"
                    style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  />
                </div>

                <div>
                  <label className="block text-white mb-2 font-bold">Descrizione Dettagliata</label>
                  <textarea
                    value={formData.detailed_description_it || ''}
                    onChange={(e) => setFormData({ ...formData, detailed_description_it: e.target.value })}
                    rows={8}
                    className="w-full px-4 py-2 bg-background text-white border rounded-lg"
                    style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                    placeholder="Testo lungo che apparirà nella sezione 'Il Perché di Questa Collezione' della pagina pubblica..."
                  />
                </div>
              </div>
            </div>


            {/* Image Picker Modal */}
            {showImagePicker && createPortal(
              <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                {/* Backdrop */}
                <div
                  className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                  onClick={() => setShowImagePicker(false)}
                />

                {/* Modal Panel */}
                <div
                  className="relative bg-secondary rounded-xl max-w-4xl w-full border max-h-[90vh] flex flex-col"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="p-8 pb-0">
                    <button
                      onClick={() => setShowImagePicker(false)}
                      className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-xl transition-all hover:scale-110"
                    >
                      <span className="text-white text-2xl">×</span>
                    </button>
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-white">Seleziona Immagine</h2>
                    </div>
                  </div>

                  {/* Content - Scrollable */}
                  <div
                    className="flex-1 overflow-y-auto px-8 pb-8 scrollbar-hide"
                    onWheel={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                  >
                    <div className="space-y-6">
                    {/* Drag & Drop Upload Zone */}
                    <div
                    className={`mb-6 border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragging
                        ? 'border-accent bg-accent/10'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {isUploading ? (
                      <div className="text-white">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
                        <p>Caricamento in corso...</p>
                      </div>
                    ) : (
                      <>
                        <div className="text-white/80 mb-4">
                          <svg
                            className="mx-auto h-12 w-12 mb-2"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                            aria-hidden="true"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <p className="text-lg font-bold">Trascina un'immagine qui</p>
                          <p className="text-sm text-white/60 mt-1">oppure</p>
                        </div>
                        <label className="inline-block cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file);
                            }}
                          />
                          <span className="px-6 py-3 bg-accent text-white hover:bg-accent/80 transition-colors inline-block" style={{ borderRadius: 0 }}>
                            Seleziona File
                          </span>
                        </label>
                      </>
                    )}
                    </div>

                    <div className="border-t border-white/10 pt-6 mb-4">
                      <h4 className="text-white font-bold mb-4">Oppure scegli da Storage:</h4>
                    </div>

                    {availableImages.length === 0 ? (
                      <p className="text-white/60 text-center py-8">Nessuna immagine disponibile nello storage</p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {availableImages.map((image) => {
                          // Find corresponding thumbnail - same logic as MediaStorage
                          const thumbnailFilename = image.filename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '_thumb.$1');
                          const thumbnail = allImages.find(img => img.filename === thumbnailFilename);
                          const displayUrl = thumbnail ? thumbnail.url : image.url;

                          return (
                            <div
                              key={image.filename}
                              className="cursor-pointer group"
                              onClick={() => {
                                // Set the ORIGINAL high-quality image URL
                                setFormData({ ...formData, image_url: image.url });
                                setShowImagePicker(false);
                              }}
                            >
                              <div className="aspect-video bg-background rounded-lg overflow-hidden border-2 border-transparent group-hover:border-accent transition-colors">
                                <ImageWithFallback
                                  src={`${API_BASE_URL}${displayUrl}`}
                                  alt={image.filename}
                                  aspectRatio="aspect-video"
                                  objectFit="cover"
                                />
                              </div>
                              <p className="text-white/60 text-sm mt-2 truncate">{image.filename}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    </div>
                  </div>
                </div>
              </div>,
              document.body
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
                onClick={handleOpenArtworkSelector}
                className="w-12 h-12 flex items-center justify-center font-bold text-white text-2xl transition-colors"
                style={{ backgroundColor: 'rgb(240, 45, 110)', borderRadius: '8px' }}
                title="Aggiungi Opere"
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
                  <div
                    key={artwork.id}
                    className={`bg-secondary p-6 border rounded-xl ${editingArtworkId === artwork.id ? '' : 'flex items-center gap-6'}`}
                    style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  >
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
                      <>
                        <div className="w-48 h-32 flex-shrink-0">
                          <ImageWithFallback
                            src={getImageUrl(artwork.image_url || '/placeholder-artwork.jpg')}
                            alt={artwork.title}
                            className="rounded-lg"
                            objectFit="cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold mb-1 truncate" style={{ color: 'rgb(240, 45, 110)' }}>
                            {artwork.title || 'Senza titolo'}
                          </h3>
                          <p className="text-white/60 text-sm">
                            {[
                              artwork.year && `${artwork.year}`,
                              artwork.technique,
                              artwork.dimensions
                            ].filter(Boolean).join(' • ') || 'Nessuna informazione'}
                          </p>
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
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Artwork Selector Modal */}
            {showArtworkSelector && createPortal(
              <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                {/* Backdrop */}
                <div
                  className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                  onClick={() => setShowArtworkSelector(false)}
                />

                {/* Modal Panel */}
                <div
                  className="relative bg-secondary rounded-xl max-w-6xl w-full border max-h-[90vh] flex flex-col"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close Button - Fixed */}
                  <button
                    onClick={() => setShowArtworkSelector(false)}
                    className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-xl transition-all hover:scale-110 z-10"
                  >
                    <span className="text-white text-2xl">×</span>
                  </button>

                  {/* Content - Scrollable (including header) */}
                  <div
                    className="flex-1 overflow-y-auto scrollbar-hide"
                    onWheel={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                  >
                    {/* Header */}
                    <div className="p-8 pb-4 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Aggiungi Opere alla Collezione</h2>
                        <p className="text-white/60">Seleziona opere esistenti o carica nuove immagini</p>
                      </div>
                    </div>

                    <div className="px-8 py-6">
                    <div className="space-y-6">
                      {/* Upload Zone */}
                      <div
                        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                          isDragging
                            ? 'border-accent bg-accent/10'
                            : 'border-white/20 hover:border-white/40'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDragging(false);
                          const files = Array.from(e.dataTransfer.files);
                          if (files.length > 0) {
                            handleArtworkImageUpload(files[0]);
                          }
                        }}
                      >
                        {isUploading ? (
                          <div className="text-white">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-2"></div>
                            <p className="text-sm">Caricamento in corso...</p>
                          </div>
                        ) : (
                          <>
                            <div className="text-white/80 mb-3">
                              <svg
                                className="mx-auto h-8 w-8 mb-2"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 48 48"
                                aria-hidden="true"
                              >
                                <path
                                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <p className="text-base font-bold">Carica nuova opera</p>
                              <p className="text-xs text-white/60 mt-1">Trascina un'immagine qui oppure</p>
                            </div>
                            <label className="inline-block cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleArtworkImageUpload(file);
                                }}
                              />
                              <span className="px-5 py-2 bg-accent text-white text-sm hover:bg-accent/80 transition-colors inline-block" style={{ borderRadius: 0 }}>
                                Seleziona File
                              </span>
                            </label>
                          </>
                        )}
                      </div>

                      {/* Divider */}
                      <div className="border-t border-white/10 pt-6">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-white font-bold">Oppure seleziona immagini dallo storage:</h4>
                          {selectedImageUrls.size > 0 && (
                            <span className="text-white/60 text-sm">
                              {selectedImageUrls.size} {selectedImageUrls.size === 1 ? 'immagine selezionata' : 'immagini selezionate'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Storage Images Grid */}
                      {loadingStorageImages ? (
                        <div className="text-center py-12">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
                          <p className="text-white/60">Caricamento immagini...</p>
                        </div>
                      ) : storageImages.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-white/60">Nessuna immagine disponibile nello storage</p>
                          <p className="text-white/40 text-sm mt-2">Carica nuove immagini usando il form sopra</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {storageImages.map((image) => {
                            const isSelected = selectedImageUrls.has(image.url);
                            // Find corresponding thumbnail
                            const thumbnailFilename = image.filename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '_thumb.$1');
                            const thumbnail = allImages.find(img => img.filename === thumbnailFilename);
                            const displayUrl = thumbnail ? thumbnail.url : image.url;

                            return (
                              <div
                                key={image.filename}
                                className="cursor-pointer group relative"
                                onClick={() => toggleImageSelection(image.url)}
                              >
                                <div className="aspect-square bg-background rounded-lg overflow-hidden border-2 border-white/10 transition-all">
                                  <ImageWithFallback
                                    src={`${API_BASE_URL}${displayUrl}`}
                                    alt={image.filename}
                                    aspectRatio="aspect-square"
                                    objectFit="cover"
                                  />
                                  {/* Checkbox overlay */}
                                  <div className={`absolute top-2 right-2 w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                                    isSelected ? 'bg-accent' : 'bg-black/50 group-hover:bg-black/70'
                                  }`}>
                                    {isSelected && (
                                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </div>
                                </div>
                                <p className="text-white text-sm mt-2 truncate font-bold">{image.filename}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-6 border-t flex justify-between items-center" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <button
                      onClick={() => {
                        setShowArtworkSelector(false);
                        setSelectedImageUrls(new Set());
                      }}
                      className="px-6 py-3 font-bold uppercase text-white border hover:bg-white/5 transition-colors"
                      style={{ borderColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 0 }}
                    >
                      Annulla
                    </button>
                    <button
                      onClick={handleAddSelectedArtworks}
                      disabled={selectedImageUrls.size === 0 || addingArtworks}
                      className="px-6 py-3 font-bold uppercase text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: 'rgb(240, 45, 110)', borderRadius: 0 }}
                    >
                      {addingArtworks ? 'Aggiunta in corso...' : `Aggiungi ${selectedImageUrls.size > 0 ? `(${selectedImageUrls.size})` : ''}`}
                    </button>
                  </div>
                </div>
              </div>,
              document.body
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
      </motion.div>
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

      {/* Confirm Modal */}
      {confirmModal && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal(null)}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
        />
      )}
    </BackofficeLayout>
  );
};

export default CollectionManagement;