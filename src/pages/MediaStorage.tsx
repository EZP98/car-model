import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import BackofficeLayout from '../components/BackofficeLayout';

interface MediaImage {
  filename: string;
  url: string;
  size: number;
  uploaded: string;
}

const API_BASE_URL = import.meta.env.PROD
  ? 'https://alf-portfolio-api.eziopappalardo98.workers.dev'
  : 'http://localhost:8787';

const MediaStorage: React.FC = () => {
  const [images, setImages] = useState<MediaImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const loadImages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/media`);
      if (!response.ok) throw new Error('Failed to fetch images');
      const data = await response.json() as { images: MediaImage[] };
      setImages(data.images || []);
    } catch (error) {
      console.error('Error loading images:', error);
      alert('Errore nel caricamento delle immagini');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

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
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const result = await response.json();
      console.log('Upload successful:', result);

      // Ricarica la lista delle immagini
      await loadImages();
      setSelectedFile(null);
      alert('Immagine caricata con successo!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Errore durante il caricamento dell\'immagine');
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

  return (
    <BackofficeLayout>
      <Helmet>
        <title>Storage - Backoffice</title>
      </Helmet>

      <div
        className="max-w-7xl mx-auto py-20 px-12 relative"
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
          <h1 className="text-4xl font-bold text-white uppercase mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <span style={{ color: 'rgb(240, 45, 110)' }}>Storage</span> Immagini
          </h1>
          <p className="text-white/60">
            Gestisci tutte le immagini caricate su R2
          </p>
        </div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-secondary p-8 rounded-xl border mb-8"
          style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
        >
          <h2 className="text-2xl font-bold text-white uppercase mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Carica Nuova Immagine
          </h2>

          {/* Upload Area */}
          <div
            className="border-2 border-dashed rounded-lg p-6 text-center transition-all border-white/20 hover:border-white/40"
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept="image/*"
              onChange={handleFileInputChange}
            />

            {selectedFile ? (
              <div className="space-y-3">
                <div className="text-white">
                  <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-base font-bold mb-1">{selectedFile.name}</p>
                  <p className="text-white/60 text-sm">{formatFileSize(selectedFile.size)}</p>
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="px-6 py-3 font-bold uppercase text-white border hover:bg-white/5 transition-colors"
                    style={{ borderColor: 'rgba(255, 255, 255, 0.2)', fontFamily: 'Montserrat, sans-serif', borderRadius: 0 }}
                  >
                    Annulla
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="px-6 py-3 font-bold uppercase text-white transition-all disabled:opacity-50"
                    style={{ backgroundColor: 'rgb(240, 45, 110)', fontFamily: 'Montserrat, sans-serif', borderRadius: 0 }}
                  >
                    {uploading ? 'Caricamento...' : 'Carica'}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <svg className="w-12 h-12 mx-auto mb-3 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-white text-base mb-2">Trascina un'immagine sulla pagina</p>
                <p className="text-white/60 text-sm mb-3">oppure</p>
                <label
                  htmlFor="file-upload"
                  className="inline-block px-6 py-3 font-bold uppercase text-white cursor-pointer transition-colors"
                  style={{ backgroundColor: 'rgb(240, 45, 110)', fontFamily: 'Montserrat, sans-serif', borderRadius: 0 }}
                >
                  Scegli File
                </label>
              </div>
            )}
          </div>
        </motion.div>

        {/* Images Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-secondary p-8 rounded-xl border"
          style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
        >
          <h2 className="text-2xl font-bold text-white uppercase mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Immagini Caricate ({images.length})
          </h2>

          {loading ? (
            <div className="text-white text-center py-12">Caricamento...</div>
          ) : images.length === 0 ? (
            <div className="text-white/60 text-center py-12">
              Nessuna immagine caricata
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((image) => (
                <div
                  key={image.filename}
                  className="bg-background rounded-lg overflow-hidden border border-white/10 hover:border-white/20 transition-all"
                >
                  {/* Image Preview */}
                  <div className="aspect-video bg-black/20 flex items-center justify-center overflow-hidden">
                    <img
                      src={`${API_BASE_URL}${image.url}`}
                      alt={image.filename}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
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

                    {/* URL Display */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={`${API_BASE_URL}${image.url}`}
                        readOnly
                        className="flex-1 px-3 py-2 bg-black/20 text-white/80 text-xs border border-white/10 focus:outline-none"
                        style={{ borderRadius: 0 }}
                      />
                      <button
                        onClick={() => copyToClipboard(image.url)}
                        className="px-3 py-2 border border-white/20 hover:bg-white/5 transition-colors"
                        style={{ borderRadius: 0 }}
                        title="Copia URL"
                      >
                        {copiedUrl === image.url ? (
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </BackofficeLayout>
  );
};

export default MediaStorage;
