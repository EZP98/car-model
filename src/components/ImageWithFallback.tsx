import React, { useState } from 'react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  aspectRatio?: string; // es. "aspect-[3/2]", "aspect-square"
  objectFit?: 'cover' | 'contain';
}

/**
 * Componente immagine con fallback a sfondo nero in caso di errore di caricamento
 * Standardizza il comportamento delle immagini rotte su tutto il sito
 */
export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  loading = 'lazy',
  aspectRatio,
  objectFit = 'cover'
}) => {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
  };

  const objectFitClass = objectFit === 'cover' ? 'object-cover' : 'object-contain';

  return (
    <div className={`w-full h-full bg-black ${aspectRatio || ''}`}>
      {!hasError ? (
        <img
          src={src}
          alt={alt}
          loading={loading}
          className={`w-full h-full ${objectFitClass} ${className}`}
          onError={handleError}
        />
      ) : (
        <div className="w-full h-full bg-black" />
      )}
    </div>
  );
};

export default ImageWithFallback;
