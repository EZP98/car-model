import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Map country codes to languages
const countryToLanguage: Record<string, Language> = {
  IT: 'it',
  ES: 'es',
  FR: 'fr',
  JP: 'ja',
  CN: 'zh',
  TW: 'zh-TW',
  HK: 'zh-TW',
  // All other countries default to English (handled below)
};

async function detectLanguageFromIP(): Promise<Language> {
  try {
    // Use ipapi.co for free IP geolocation (no API key needed)
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) throw new Error('Geolocation failed');

    const data = await response.json();
    const countryCode = data.country_code as string;

    console.log('[LanguageContext] Detected country:', countryCode);

    // Return mapped language or default to English
    return countryToLanguage[countryCode] || 'en';
  } catch (error) {
    console.error('[LanguageContext] Error detecting language from IP:', error);
    return 'en'; // Default to English on error
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en'); // Start with English as default
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeLanguage = async () => {
      // Check if user has manually selected a language before
      const stored = localStorage.getItem('language');
      const validLanguages = ['it', 'en', 'es', 'fr', 'ja', 'zh', 'zh-TW'] as const;

      if (stored && validLanguages.includes(stored as any)) {
        // User has a saved preference, use it
        setLanguageState(stored as Language);
      } else {
        // No saved preference, detect from IP
        const detectedLang = await detectLanguageFromIP();
        setLanguageState(detectedLang);
      }

      setIsInitialized(true);
    };

    initializeLanguage();
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  // Don't render children until language is initialized to avoid flash
  if (!isInitialized) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
