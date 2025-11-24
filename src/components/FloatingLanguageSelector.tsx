import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Language } from '../i18n/translations';

const FloatingLanguageSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages: Array<{ code: Language; label: string; flag: string }> = [
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
    { code: 'zh', label: '简体中文', flag: '🇨🇳' },
    { code: 'zh-TW', label: '繁體中文', flag: '🇹🇼' },
  ];

  const currentLanguage = languages.find(l => l.code === language) || languages[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLanguageChange = (code: Language) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div
      ref={dropdownRef}
      className="fixed bottom-8 right-8 z-[999] group"
    >
      {/* Dropdown Menu - opens upward */}
      <div
        className={`absolute bottom-full right-0 mb-3 bg-black/90 backdrop-blur-sm border border-white/20 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 origin-bottom-right ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
        }`}
        style={{ minWidth: '180px' }}
      >
        {languages.map((lang, index) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`w-full px-5 py-3 text-left flex items-center gap-3 transition-all duration-200 ${
              language === lang.code
                ? 'bg-accent/20 text-accent'
                : 'text-white hover:bg-white/10'
            }`}
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '14px',
              fontWeight: language === lang.code ? '600' : '500',
            }}
          >
            <span className="text-xl">{lang.flag}</span>
            <span>{lang.label}</span>
          </button>
        ))}
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-black/80 backdrop-blur-md border-2 border-white/30 shadow-xl flex items-center justify-center text-2xl transition-all duration-300 hover:scale-110 hover:border-accent hover:shadow-accent/50"
        aria-label="Select language"
        style={{
          boxShadow: isOpen
            ? '0 0 30px rgba(211, 175, 127, 0.5)'
            : '0 10px 25px rgba(0, 0, 0, 0.5)',
        }}
      >
        <span className="transform transition-transform duration-300 group-hover:scale-110">
          {currentLanguage.flag}
        </span>
      </button>

      {/* Tooltip - hidden when open */}
      {!isOpen && (
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-black/90 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          {currentLanguage.label}
        </div>
      )}
    </div>
  );
};

export default FloatingLanguageSelector;
