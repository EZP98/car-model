import React, { createContext, useContext, useEffect, useState } from 'react';

interface LoadingContextType {
  hasShownLoading: boolean;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Controlla se il loading è già stato mostrato in questa sessione
  const [hasShownLoading, setHasShownLoading] = useState(() => {
    return sessionStorage.getItem('hasShownLoading') === 'true';
  });

  const [isLoading, setIsLoading] = useState(!hasShownLoading);

  useEffect(() => {
    if (!hasShownLoading && isLoading) {
      // Dopo 3 secondi, nascondi il loading e salva che è stato mostrato
      const timer = setTimeout(() => {
        setIsLoading(false);
        setHasShownLoading(true);
        sessionStorage.setItem('hasShownLoading', 'true');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [hasShownLoading, isLoading]);

  return (
    <LoadingContext.Provider value={{ hasShownLoading, isLoading, setIsLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};