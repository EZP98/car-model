import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import BackofficeLayout from '../components/BackofficeLayout';
import BackofficeLoader from '../components/BackofficeLoader';
import Toast from '../components/Toast';
import ImageWithFallback from '../components/ImageWithFallback';
import { optimizeImageComplete, createThumbnail } from '../utils/imageOptimization';

interface MediaImage {
  filename: string;
  url: string;
  size: number;
  uploaded: string;
}

interface StorageStats {
  totalFiles: number;
  totalSize: number;
  originals: {
    count: number;
    size: number;
  };
  thumbnails: {
    count: number;
    size: number;
  };
}

// In development, use empty string to leverage Vite proxy
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const MediaStorage: React.FC = () => {
  const [images, setImages] = useState<MediaImage[]>([]);
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingImage, setViewingImage] = useState<MediaImage | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [displayCount, setDisplayCount] = useState(12);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerTarget = React.useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    image: MediaImage;
    usage: {
      artworks: Array<{ id: number; title: string }>;
      collections: Array<{ id: number; title: string }>;
      exhibitions: Array<{ id: number; title: string }>;
      total: number;
    } | null;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadImages = useCallback(async () => {
    try {
      console.time('⏱️ Load images');
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/media`);
      if (!response.ok) throw new Error('Failed to fetch images');
      const data = await response.json() as { images: MediaImage[] };
      console.log('📦 Loaded images:', data.images?.length || 0);
      setImages(data.images || []);
      console.timeEnd('⏱️ Load images');
    } catch (error) {
      console.error('Error loading images:', error);
      alert('Errore nel caricamento delle immagini');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/storage/stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json() as StorageStats;
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, []);

  useEffect(() => {
    loadImages();
    loadStats();
  }, [loadImages, loadStats]);

  // Reset display count when search changes
  useEffect(() => {
    setDisplayCount(12);
  }, [searchTerm]);

  // Infinite scroll observer - Optimized
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          const filteredImages = images.filter(img => !img.filename.includes('_thumb'));
          const searchFiltered = filteredImages.filter(img =>
            img.filename.toLowerCase().includes(searchTerm.toLowerCase())
          );

          if (displayCount < searchFiltered.length) {
            console.log('📜 Loading more images...', displayCount, '->', displayCount + 12);
            setLoadingMore(true);
            // Reduced timeout for better UX
            setTimeout(() => {
              setDisplayCount(prev => prev + 12);
              setLoadingMore(false);
            }, 150);
          }
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px' // Start loading slightly before reaching the end
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [images, displayCount, searchTerm, loadingMore]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // Verifica che sia un'immagine
    if (!file.type.startsWith('image/')) {
      alert('Per favore seleziona un file immagine');
      return;
    }
    setSelectedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);

      console.log('🚀 Inizio ottimizzazione e upload...');

      // Ottimizza immagine: converte in WebP alta qualità + thumbnail
      const { optimized, thumbnail } = await optimizeImageComplete(selectedFile);

      // Carica immagine ottimizzata (WebP 95%, max 2500px)
      console.log('📤 Upload immagine ottimizzata...');
      const formDataOptimized = new FormData();
      formDataOptimized.append('file', optimized);

      const responseOptimized = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_API_KEY}`,
        },
        body: formDataOptimized,
      });

      if (!responseOptimized.ok) throw new Error('Upload optimized failed');

      // Carica thumbnail (WebP 85%, max 400px)
      console.log('📤 Upload thumbnail...');
      const formDataThumbnail = new FormData();
      formDataThumbnail.append('file', thumbnail);

      const responseThumbnail = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_API_KEY}`,
        },
        body: formDataThumbnail,
      });

      if (!responseThumbnail.ok) throw new Error('Upload thumbnail failed');

      console.log('✅ Upload completato!');

      // Ricarica la lista delle immagini e le statistiche
      await loadImages();
      await loadStats();
      setSelectedFile(null);
      setToast({ message: 'Immagine caricata e ottimizzata con successo!', type: 'success' });
    } catch (error) {
      console.error('❌ Errore durante upload:', error);
      setToast({ message: 'Errore durante il caricamento dell\'immagine', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (url: string) => {
    const fullUrl = `${API_BASE_URL}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleDelete = async (image: MediaImage, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita di aprire la lightbox
    console.log('🗑️ Delete button clicked for:', image.filename);

    try {
      // Controlla dove è usata l'immagine
      const filename = image.filename;
      console.time('⏱️ Check image usage');
      const usageResponse = await fetch(`${API_BASE_URL}/api/images/${filename}/usage`);

      if (!usageResponse.ok) {
        throw new Error('Failed to check image usage');
      }

      const usageData = await usageResponse.json() as {
        usage: {
          artworks: Array<{ id: number; title: string }>;
          collections: Array<{ id: number; title: string }>;
          exhibitions: Array<{ id: number; title: string }>;
          total: number;
        }
      };
      console.timeEnd('⏱️ Check image usage');
      console.log('📊 Usage data:', usageData.usage);

      // Mostra modale di conferma
      setDeleteConfirm({
        image,
        usage: usageData.usage
      });

    } catch (error) {
      console.error('❌ Error checking image usage:', error);
      alert('Errore durante il controllo dell\'uso dell\'immagine');
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      setDeleting(true);
      console.time('⏱️ Delete image');

      const deleteResponse = await fetch(`${API_BASE_URL}/api/images/${deleteConfirm.image.filename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_API_KEY}`
        }
      });

      if (!deleteResponse.ok) {
        throw new Error('Failed to delete image');
      }

      console.timeEnd('⏱️ Delete image');
      console.log('✅ Image deleted successfully');

      // Chiudi modale
      setDeleteConfirm(null);

      // Ricarica le immagini e le statistiche
      await loadImages();
      await loadStats();

    } catch (error) {
      console.error('❌ Error deleting image:', error);
      alert('Errore durante l\'eliminazione dell\'immagine');
    } finally {
      setDeleting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRegenerateThumbnails = async () => {
    if (!confirm('Vuoi rigenerare tutti i thumbnail mancanti?')) return;

    try {
      setRegenerating(true);

      // Get list of images missing thumbnails
      const response = await fetch(`${API_BASE_URL}/api/regenerate-thumbnails`);
      if (!response.ok) throw new Error('Failed to get missing thumbnails');

      const data = await response.json() as { missing: string[], count: number };

      if (data.count === 0) {
        alert('Tutti i thumbnail sono già presenti!');
        return;
      }

      let regenerated = 0;

      // For each missing thumbnail, download image, create thumbnail, and upload
      for (const filename of data.missing) {
        try {
          // Download original image
          const imgResponse = await fetch(`${API_BASE_URL}/images/${filename}`);
          if (!imgResponse.ok) continue;

          const blob = await imgResponse.blob();
          const file = new File([blob], filename, { type: blob.type });

          // Create thumbnail
          const thumbnail = await createThumbnail(file);

          // Upload thumbnail
          const thumbFilename = filename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '_thumb.$1');
          const formData = new FormData();
          formData.append('file', thumbnail, thumbFilename);

          const uploadResponse = await fetch(`${API_BASE_URL}/api/upload`, {
            method: 'POST',
            body: formData
          });

          if (uploadResponse.ok) {
            regenerated++;
          }
        } catch (error) {
          console.error(`Error regenerating thumbnail for ${filename}:`, error);
        }
      }

      alert(`Rigenerati ${regenerated} thumbnail su ${data.count}`);
      await loadImages();
      await loadStats();
    } catch (error) {
      console.error('Error regenerating thumbnails:', error);
      alert('Errore durante la rigenerazione dei thumbnail');
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <BackofficeLayout>
      <Helmet>
        <title>Storage - Backoffice</title>
      </Helmet>

      <motion.div
        className="max-w-5xl mx-auto py-20 px-12 relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {/* Drag Overlay */}
        {dragActive && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center pointer-events-none">
            <div className="bg-secondary p-12 rounded-xl border-2 border-dashed border-pink-500">
              <svg className="w-20 h-20 mx-auto mb-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-white text-2xl font-bold">Rilascia per caricare</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-white uppercase" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <span style={{ color: 'rgb(240, 45, 110)' }}>Storage</span> Immagini
            </h1>

            {/* Search and Upload */}
            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="relative">
                <label htmlFor="storage-search" className="sr-only">Cerca immagine</label>
                <input
                  id="storage-search"
                  type="text"
                  placeholder="Cerca immagine..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 px-4 py-3 bg-secondary border text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition-colors"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 0, fontFamily: 'Montserrat, sans-serif' }}
                  aria-label="Cerca immagine nello storage"
                />
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Upload Button */}
              <div>
                <input
                  type="file"
                  id="file-upload-button"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  aria-label="Seleziona immagine da caricare"
                />
                <label
                  htmlFor="file-upload-button"
                  className="inline-flex items-center justify-center p-3 text-white cursor-pointer transition-all hover:opacity-90"
                  style={{ backgroundColor: 'rgb(240, 45, 110)', borderRadius: 0 }}
                  aria-label="Carica nuova immagine"
                  title="Carica immagine"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </label>
              </div>
            </div>
          </div>

          <p className="text-white/60">
            Gestisci tutte le immagini caricate su R2
          </p>
        </div>

        {/* Storage Stats */}
        {stats && (() => {
          const maxStorageGB = 10; // 10 GB
          const maxStorage = maxStorageGB * 1024 * 1024 * 1024; // 10GB in bytes
          const usedPercentage = (stats.totalSize / maxStorage) * 100;

          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-secondary p-5 rounded-xl border mb-8"
              style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white uppercase" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Spazio Occupato
                </h2>
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{ color: 'rgb(240, 45, 110)', fontFamily: 'Montserrat, sans-serif' }}>
                    {formatFileSize(stats.totalSize)} / {maxStorageGB} GB
                  </p>
                  <p className="text-white/60 text-xs">{stats.totalFiles} file totali · {usedPercentage.toFixed(2)}% usato</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${Math.min(usedPercentage, 100)}%`,
                      backgroundColor: usedPercentage > 80 ? 'rgb(239, 68, 68)' : 'rgb(240, 45, 110)'
                    }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })()}

        {/* Upload Confirmation Modal */}
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
            onClick={() => !uploading && setSelectedFile(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-secondary p-8 rounded-xl border max-w-md w-full"
              style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-white uppercase mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Conferma Caricamento
              </h2>

              <div className="text-white mb-6">
                <svg className="w-16 h-16 mx-auto mb-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-base font-bold mb-1 text-center">{selectedFile.name}</p>
                <p className="text-white/60 text-sm text-center">{formatFileSize(selectedFile.size)}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedFile(null)}
                  disabled={uploading}
                  className="flex-1 px-6 py-3 font-bold uppercase text-white border hover:bg-white/5 transition-colors disabled:opacity-50"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.2)', fontFamily: 'Montserrat, sans-serif', borderRadius: 0 }}
                >
                  Annulla
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 px-6 py-3 font-bold uppercase text-white transition-all disabled:opacity-50"
                  style={{ backgroundColor: 'rgb(240, 45, 110)', fontFamily: 'Montserrat, sans-serif', borderRadius: 0 }}
                >
                  {uploading ? 'Caricamento...' : 'Carica'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
            onClick={() => !deleting && setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-secondary p-8 rounded-xl border max-w-2xl w-full"
              style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-white uppercase mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Conferma Eliminazione
              </h2>

              <div className="mb-6">
                {/* Image preview */}
                <div className="flex items-center gap-4 mb-6 p-4 bg-black/20 rounded-lg">
                  <div className="w-20 h-20 flex-shrink-0">
                    <ImageWithFallback
                      src={`${API_BASE_URL}${deleteConfirm.image.url}`}
                      alt={deleteConfirm.image.filename}
                      className="rounded-lg"
                      aspectRatio="aspect-square"
                      objectFit="cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-base font-bold mb-1">{deleteConfirm.image.filename}</p>
                    <p className="text-white/60 text-sm">
                      {formatFileSize(deleteConfirm.image.size)} · {formatDate(deleteConfirm.image.uploaded)}
                    </p>
                  </div>
                </div>

                {/* Usage warning */}
                {deleteConfirm.usage && deleteConfirm.usage.total > 0 ? (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-5 mb-4">
                    <div className="flex items-start gap-3 mb-4">
                      <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-red-400 font-bold text-lg mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          ATTENZIONE: Immagine in uso
                        </p>
                        <p className="text-white/80 text-sm mb-3">
                          Questa immagine è attualmente utilizzata in {deleteConfirm.usage.total} {deleteConfirm.usage.total === 1 ? 'elemento' : 'elementi'}:
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 ml-9">
                      {deleteConfirm.usage.collections.length > 0 && (
                        <div>
                          <p className="text-pink-400 font-bold text-sm mb-1 uppercase" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            📚 {deleteConfirm.usage.collections.length} {deleteConfirm.usage.collections.length === 1 ? 'Collezione' : 'Collezioni'}
                          </p>
                          <ul className="list-disc list-inside text-white/70 text-sm space-y-1">
                            {deleteConfirm.usage.collections.map(c => (
                              <li key={c.id}>{c.title}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {deleteConfirm.usage.artworks.length > 0 && (
                        <div>
                          <p className="text-pink-400 font-bold text-sm mb-1 uppercase" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            🎨 {deleteConfirm.usage.artworks.length} {deleteConfirm.usage.artworks.length === 1 ? 'Opera' : 'Opere'}
                          </p>
                          <ul className="list-disc list-inside text-white/70 text-sm space-y-1">
                            {deleteConfirm.usage.artworks.map(a => (
                              <li key={a.id}>{a.title}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {deleteConfirm.usage.exhibitions.length > 0 && (
                        <div>
                          <p className="text-pink-400 font-bold text-sm mb-1 uppercase" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            🖼️ {deleteConfirm.usage.exhibitions.length} {deleteConfirm.usage.exhibitions.length === 1 ? 'Mostra' : 'Mostre'}
                          </p>
                          <ul className="list-disc list-inside text-white/70 text-sm space-y-1">
                            {deleteConfirm.usage.exhibitions.map(e => (
                              <li key={e.id}>{e.title}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-green-400 font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Immagine non utilizzata
                      </p>
                    </div>
                  </div>
                )}

                <p className="text-white/80 text-sm">
                  {deleteConfirm.usage && deleteConfirm.usage.total > 0
                    ? 'Eliminando questa immagine, gli elementi sopra elencati non mostreranno più la foto. Vuoi procedere?'
                    : 'Sei sicuro di voler eliminare questa immagine? L\'azione non può essere annullata.'}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleting}
                  className="flex-1 px-6 py-3 font-bold uppercase text-white border hover:bg-white/5 transition-colors disabled:opacity-50"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.2)', fontFamily: 'Montserrat, sans-serif', borderRadius: 0 }}
                >
                  Annulla
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 px-6 py-3 font-bold uppercase text-white transition-all disabled:opacity-50"
                  style={{ backgroundColor: 'rgb(239, 68, 68)', fontFamily: 'Montserrat, sans-serif', borderRadius: 0 }}
                >
                  {deleting ? 'Eliminazione...' : 'Elimina'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Image Lightbox */}
        {viewingImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-6"
            onClick={() => setViewingImage(null)}
          >
            <button
              onClick={() => setViewingImage(null)}
              className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
              style={{ borderRadius: 0 }}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-7xl max-h-full w-full flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image */}
              <div className="flex-1 flex items-center justify-center mb-6">
                <div className="max-w-full max-h-[80vh]">
                  <ImageWithFallback
                    src={`${API_BASE_URL}${viewingImage.url}`}
                    alt={viewingImage.filename}
                    objectFit="contain"
                    loading="eager"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="bg-secondary p-6 rounded-xl border max-w-5xl mx-auto w-full" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-lg font-bold mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {viewingImage.filename}
                    </p>
                    <p className="text-white/60 text-sm">
                      {formatFileSize(viewingImage.size)} · {formatDate(viewingImage.uploaded)}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(viewingImage.url)}
                    className="px-4 py-2 border border-white/20 hover:bg-white/5 transition-colors flex items-center gap-2"
                    style={{ borderRadius: 0 }}
                  >
                    {copiedUrl === viewingImage.url ? (
                      <>
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-white text-sm font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>Copiato!</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        <span className="text-white text-sm font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>Copia URL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Images Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-secondary"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white uppercase" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Immagini Caricate ({images.filter(img => !img.filename.includes('_thumb')).length})
            </h2>

            {/* Regenerate Thumbnails Button */}
            {stats && stats.originals.count > stats.thumbnails.count && (
              <button
                onClick={handleRegenerateThumbnails}
                disabled={regenerating}
                className="p-2 text-white border transition-all hover:bg-white/5 disabled:opacity-50"
                style={{ borderColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 0 }}
                aria-label="Rigenera thumbnail mancanti"
                title={`Rigenera ${stats.originals.count - stats.thumbnails.count} thumbnail mancanti`}
              >
                <svg
                  className={`w-5 h-5 ${regenerating ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            )}
          </div>

          {loading ? (
            <BackofficeLoader message="Caricamento immagini..." />
          ) : images.length === 0 ? (
            <div className="text-white/60 text-center py-12">
              Nessuna immagine caricata
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {images
                  .filter(img => !img.filename.includes('_thumb')) // Mostra solo originali
                  .filter(img => img.filename.toLowerCase().includes(searchTerm.toLowerCase())) // Filtra per ricerca
                  .slice(0, displayCount) // Infinite scroll pagination
                  .map((image) => {
                  // Cerca il thumbnail corrispondente
                  const thumbnailFilename = image.filename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '_thumb.$1');
                  const thumbnail = images.find(img => img.filename === thumbnailFilename);
                  const displayUrl = thumbnail ? thumbnail.url : image.url;

                  return (
                <div
                  key={image.filename}
                  className="bg-background rounded-lg overflow-hidden border border-white/10 hover:border-white/20"
                  style={{ willChange: 'border-color' }}
                >
                  {/* Image Preview */}
                  <div
                    className="aspect-video bg-black/20 flex items-center justify-center cursor-pointer relative group"
                    onClick={() => setViewingImage(image)}
                    style={{ overflow: 'visible' }}
                  >
                    {/* Placeholder */}
                    {!loadedImages.has(image.filename) && (
                      <div className="absolute inset-0 bg-white/5 animate-pulse" style={{ borderRadius: '0.5rem 0.5rem 0 0' }} />
                    )}
                    <div className={`w-full h-full ${
                        loadedImages.has(image.filename) ? 'opacity-100' : 'opacity-0'
                      }`}
                      style={{
                        borderRadius: '0.5rem 0.5rem 0 0',
                        transform: 'translateZ(0)',
                        willChange: 'opacity',
                        transition: 'opacity 0.2s ease-out'
                      }}
                    >
                      <ImageWithFallback
                        src={`${API_BASE_URL}${displayUrl}`}
                        alt={image.filename}
                        className="rounded-t-lg"
                        aspectRatio="aspect-video"
                        objectFit="cover"
                        loading="lazy"
                      />
                      <img
                        src={`${API_BASE_URL}${displayUrl}`}
                        alt=""
                        className="hidden"
                        onLoad={() => {
                          setLoadedImages(prev => new Set(prev).add(image.filename));
                        }}
                        loading="lazy"
                      />
                    </div>

                    {/* Delete Button - Visible on hover */}
                    <button
                      onClick={(e) => handleDelete(image, e)}
                      className="absolute top-2 right-2 p-2 bg-black/70 hover:bg-red-500 border border-white/30 hover:border-red-500 opacity-0 group-hover:opacity-100 z-10"
                      style={{
                        borderRadius: '4px',
                        transform: 'translateZ(0)',
                        willChange: 'opacity, background-color',
                        transition: 'opacity 0.15s ease-out, background-color 0.2s ease-out'
                      }}
                      title="Elimina immagine"
                      aria-label={`Elimina ${image.filename}`}
                    >
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  {/* Image Info */}
                  <div className="p-4 space-y-3">
                    <div>
                      <p className="text-white text-sm font-bold truncate" title={image.filename}>
                        {image.filename}
                      </p>
                      <p className="text-white/60 text-xs">
                        {formatFileSize(image.size)} · {formatDate(image.uploaded)}
                      </p>
                    </div>

                    {/* URL Display - Click to copy */}
                    <button
                      onClick={() => copyToClipboard(image.url)}
                      className="w-full px-3 py-2 bg-black/20 text-white/80 text-xs border border-white/10 hover:border-white/20 hover:bg-white/5 cursor-pointer text-left truncate"
                      style={{
                        borderRadius: 0,
                        transform: 'translateZ(0)',
                        transition: 'border-color 0.15s ease-out, background-color 0.15s ease-out'
                      }}
                      title={copiedUrl === image.url ? "Copiato!" : "Clicca per copiare URL"}
                    >
                      {copiedUrl === image.url ? (
                        <span className="text-green-500">✓ Copiato!</span>
                      ) : (
                        `${API_BASE_URL}${image.url}`
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
              </div>

              {/* Infinite scroll sentinel */}
              <div ref={observerTarget} className="h-10" />

              {/* Loading more indicator */}
              {loadingMore && (
                <div className="text-white text-center py-6">
                  <div className="inline-block w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </>
          )}
        </motion.div>
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
    </BackofficeLayout>
  );
};

export default MediaStorage;
