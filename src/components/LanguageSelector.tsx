import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

const LanguageSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: 'it', label: 'IT', flag: '🇮🇹' },
    { code: 'en', label: 'EN', flag: '🇬🇧' },
    { code: 'es', label: 'ES', flag: '🇪🇸' },
    { code: 'fr', label: 'FR', flag: '🇫🇷' },
    { code: 'ja', label: 'JP', flag: '🇯🇵' },
    { code: 'zh', label: 'CN', flag: '🇨🇳' },
    { code: 'zh-TW', label: 'TW', flag: '🇹🇼' },
  ];

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('.floating-language-selector')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  const currentLanguage = languages.find(l => l.code === language);

  return (
    <div className="floating-language-selector fixed bottom-8 right-8 z-[1000] hidden md:block">
      {/* Language Menu */}
      <div
        className={`absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-md border border-white/20 rounded-xl py-2 shadow-xl min-w-[140px] transition-all duration-300 origin-bottom-right ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
        }`}
      >
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => {
              setLanguage(lang.code);
              setIsOpen(false);
            }}
            className={`w-full px-4 py-2 text-left hover:bg-white/10 transition-colors flex items-center gap-2 ${
              language === lang.code ? 'text-accent' : 'text-white'
            }`}
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            <span>{lang.flag}</span>
            <span className="font-bold">{lang.label}</span>
          </button>
        ))}
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-black/80 backdrop-blur-md border border-white/30 hover:border-white/60 transition-all flex items-center justify-center shadow-lg hover:shadow-xl"
        aria-label="Select language"
      >
        <span className="text-2xl">{currentLanguage?.flag}</span>
      </button>
    </div>
  );
};

export default LanguageSelector;
