import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ImageWithFallback from './ImageWithFallback';
import { optimizeImageComplete } from '../utils/imageOptimization';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
}

const ImagePickerModal: React.FC<ImagePickerModalProps> = ({ isOpen, onClose, onSelectImage }) => {
  const [availableImages, setAvailableImages] = useState<Array<{ filename: string; url: string }>>([]);
  const [allImages, setAllImages] = useState<Array<{ filename: string; url: string }>>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadImages();
    }
  }, [isOpen]);

  // Disable Lenis when modal is open
  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen]);

  const loadImages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/media`);
      if (response.ok) {
        const data = await response.json() as { images?: Array<{ filename: string; url: string }> };
        setAllImages(data.images || []);
        const originals = (data.images || []).filter(img => !img.filename.includes('_thumb'));
        setAvailableImages(originals);
      }
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Per favore seleziona solo file immagine');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    try {
      console.log('🚀 Ottimizzazione immagine...');

      const { optimized, thumbnail } = await optimizeImageComplete(file);

      // Upload optimized image
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

      // Upload thumbnail
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

      // Reload images and select the new one
      await loadImages();
      onSelectImage(dataOptimized.url);
      onClose();

    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError('Errore durante il caricamento dell\'immagine');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
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
            onClick={onClose}
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

            {uploadError && (
              <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {uploadError}
              </div>
            )}

            <div className="border-t border-white/10 pt-6 mb-4">
              <h4 className="text-white font-bold mb-4">Oppure scegli da Storage:</h4>
            </div>

            {availableImages.length === 0 ? (
              <p className="text-white/60 text-center py-8">Nessuna immagine disponibile nello storage</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {availableImages.map((image) => {
                  const thumbnailFilename = image.filename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '_thumb.$1');
                  const thumbnail = allImages.find(img => img.filename === thumbnailFilename);
                  const displayUrl = thumbnail ? thumbnail.url : image.url;

                  return (
                    <div
                      key={image.filename}
                      className="cursor-pointer group"
                      onClick={() => {
                        onSelectImage(image.url);
                        onClose();
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
  );
};

export default ImagePickerModal;
