import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ReactComponent as AdeleSVG } from '../assets/images/adele.svg';
import { getArtworks, subscribeToNewsletter, type Artwork } from '../services/api';
import { getCollections, type Collection } from '../services/collections-api';
import { getExhibitions, type Exhibition, getCritics, type Critic } from '../services/content-api';
import { useLanguage } from '../i18n/LanguageContext';
import { useTranslation } from '../i18n/useTranslation';
import { Language } from '../i18n/translations';

// Funzione per formattare la data mostrando solo mese e anno
const formatDataMostra = (dataStr: string) => {
  const mesi = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];

  // Estrae mese e anno in base ai diversi formati
  let mese = '';
  let anno = '';

  // Formato: "Mese Anno" (es: "Dicembre 2024", "Maggio 2024")
  if (/^[A-Za-z]+ \d{4}$/.test(dataStr)) {
    const parts = dataStr.split(' ');
    return `${parts[0]} ${parts[1]}`;
  }

  // Formato: "gg-gg Mese Anno" (es: "3-24 Agosto 2025")
  if (/^\d{1,2}-\d{1,2} [A-Za-z]+ \d{4}$/.test(dataStr)) {
    const match = dataStr.match(/([A-Za-z]+) (\d{4})$/);
    if (match) {
      return `${match[1]} ${match[2]}`;
    }
  }

  // Formato: "DD/MM/YYYY" o "DD/MM/YY"
  if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(dataStr)) {
    const [giorno, meseNum, annoStr] = dataStr.split('/');
    const meseIndex = parseInt(meseNum) - 1;
    if (meseIndex >= 0 && meseIndex < 12) {
      mese = mesi[meseIndex];
      anno = annoStr.length === 2 ? `20${annoStr}` : annoStr;
      return `${mese} ${anno}`;
    }
  }

  // Formato: "DD-Mese-YYYY" o "DD Mese YYYY"
  const regexData = /^\d{1,2}[\s-]([A-Za-z]+)[\s-](\d{4})$/;
  const match = dataStr.match(regexData);
  if (match) {
    return `${match[1]} ${match[2]}`;
  }

  // Se non corrisponde a nessun formato, restituisce la stringa originale
  return dataStr;
};

// Componente Modale per Mostra
interface MostraModalProps {
  isOpen: boolean;
  onClose: () => void;
  mostra: {
    titolo: string;
    sottotitolo: string;
    luogo: string;
    data: string;
    descrizione: string;
    info?: string;
    website?: string;
  };
}

const MostraModal: React.FC<MostraModalProps> = ({ isOpen, onClose, mostra }) => {
  // Previene lo scroll del body quando il modale è aperto
  React.useEffect(() => {
    if (isOpen) {
      // Salva la posizione corrente dello scroll
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      // Ripristina lo scroll
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(10px)'
      }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-7xl h-[90vh] md:h-[85vh] bg-background rounded-3xl flex flex-col overflow-hidden"
        style={{
          fontFamily: 'Montserrat, sans-serif'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-white hover:text-accent transition-colors z-10"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Two Column Layout with Independent Scroll */}
        <div className="flex flex-col md:flex-row w-full h-full">
          {/* Left Column - Info (Fixed) */}
          <div className="w-full md:w-2/5 p-8 md:p-12 overflow-y-auto border-r border-white/10 flex-shrink-0">
            <div className="space-y-8">
              {/* Header */}
              <div className="space-y-4">
                <h2 className="text-5xl font-bold text-white uppercase tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {mostra.titolo}
                </h2>
                <p className="text-[18px] text-white/80">
                  {mostra.sottotitolo}
                </p>
              </div>

              {/* Divider */}
              <div className="h-px bg-white/20"></div>

              {/* Info */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-sm uppercase text-accent tracking-wider font-bold">Luogo</p>
                  <p className="text-[16px] text-white leading-relaxed">{mostra.luogo}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm uppercase text-accent tracking-wider font-bold">Periodo</p>
                  <p className="text-[16px] text-white leading-relaxed">
                    {formatDataMostra(mostra.data)}
                  </p>
                </div>
                {mostra.info && (
                  <div className="space-y-2">
                    <p className="text-sm uppercase text-accent tracking-wider font-bold">Durata</p>
                    <p className="text-[15px] text-white/70 leading-relaxed italic">
                      {mostra.info}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Content (Scrollable) */}
          <div className="w-full md:w-3/5 p-8 md:p-12 overflow-y-auto flex-grow">
            <div className="space-y-8">
              {/* Description */}
              <p className="text-[16px] leading-loose text-white/90">
                {mostra.descrizione}
              </p>

              {/* Website iframe if available */}
              {mostra.website && (
                <div className="mt-8 space-y-4">
                  <div className="rounded-2xl overflow-hidden border border-white/20">
                    <iframe
                      src={mostra.website}
                      title={`${mostra.titolo} Website`}
                      className="w-full h-[800px]"
                      style={{
                        backgroundColor: '#000',
                        border: 'none'
                      }}
                      loading="lazy"
                    />
                  </div>
                  <p className="text-sm text-white/60 text-center">
                    Sito web dedicato alla mostra
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente Language Switcher fluttuante
const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'zh', name: '中文 (简体)', flag: '🇨🇳' },
    { code: 'zh-TW', name: '中文 (繁體)', flag: '🇹🇼' }
  ] as const;

  const currentLang = languages.find(lang => lang.code === language) || languages[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageSelect = (langCode: typeof languages[number]['code']) => {
    setLanguage(langCode as Language);
    setIsOpen(false);
  };

  return (
    <div
      ref={dropdownRef}
      className="fixed bottom-6 right-6 z-50 hidden md:block"
      style={{
        backdropFilter: 'blur(5px)',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '7px',
        padding: '8px'
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-black rounded hover:opacity-90 transition-opacity"
        style={{
          boxShadow: 'rgba(0, 0, 0, 0.15) 0px 4px 8px 0px',
          minWidth: '140px'
        }}
      >
        <span className="font-body text-[14px] font-medium text-white tracking-tight flex items-center gap-2">
          <span>{currentLang.flag}</span>
          <span>{currentLang.name}</span>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute bottom-full mb-2 right-0 bg-black rounded shadow-lg overflow-hidden"
          style={{
            boxShadow: 'rgba(0, 0, 0, 0.25) 0px 8px 16px 0px',
            minWidth: '140px'
          }}
        >
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => handleLanguageSelect(lang.code)}
              className="w-full px-4 py-2 text-left font-body text-[14px] font-medium text-white tracking-tight hover:bg-[rgb(40,40,40)] transition-colors flex items-center gap-2"
              style={{
                backgroundColor: language === lang.code ? 'rgb(40, 40, 40)' : 'transparent'
              }}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Componente Modale per Testo Critico
interface TestoCriticoModalProps {
  isOpen: boolean;
  onClose: () => void;
  critico: {
    nome: string;
    ruolo: string;
    testo: string;
  };
}

const TestoCriticoModal: React.FC<TestoCriticoModalProps> = ({ isOpen, onClose, critico }) => {
  // Block body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Split text into paragraphs for better formatting
  const paragraphs = critico.testo.split('\n\n').filter((p: string) => p.trim());

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(15px)'
      }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl max-h-[90vh] md:h-[85vh] bg-background/95 backdrop-blur rounded-3xl flex flex-col border border-white/10"
        style={{
          fontFamily: 'Montserrat, sans-serif',
          boxShadow: '0 25px 50px -12px rgba(240, 45, 110, 0.25)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors z-10"
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-8 md:p-12 min-h-0 custom-scrollbar">
          {/* Header Section */}
          <div className="mb-10 pb-8 border-b border-white/10">
            <h2 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-wide mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {critico.nome}
            </h2>
            <p className="text-[18px] text-accent font-medium">
              {critico.ruolo}
            </p>
          </div>

          {/* Text Content */}
          <div className="space-y-6 max-w-4xl mx-auto">
            {paragraphs.length > 1 ? (
              paragraphs.map((paragraph: string, index: number) => (
                <p key={index} className="text-[16px] md:text-[17px] leading-relaxed text-white/85 font-light" style={{ lineHeight: '1.8' }}>
                  {index === 0 && <span className="text-accent text-[24px] mr-1">"</span>}
                  {paragraph}
                  {index === paragraphs.length - 1 && <span className="text-accent text-[24px] ml-1">"</span>}
                </p>
              ))
            ) : (
              <p className="text-[16px] md:text-[17px] leading-relaxed text-white/85 font-light italic" style={{ lineHeight: '1.8' }}>
                <span className="text-accent text-[32px] leading-none align-text-top">"</span>
                {critico.testo}
                <span className="text-accent text-[32px] leading-none align-text-bottom">"</span>
              </p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(240, 45, 110, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(240, 45, 110, 0.7);
        }
      `}</style>
    </div>
  );
};

// Componente item per Testi Critici
interface TestoCriticoItemProps {
  nome: string;
  ruolo: string;
  testo: string;
  onClick: () => void;
}

const TestoCriticoItem: React.FC<TestoCriticoItemProps> = ({ nome, ruolo, testo, onClick }) => {
  // Estrae le prime 180 caratteri del testo come anteprima (aumentato per mostrare più contenuto)
  const anteprima = testo && testo.length > 180 ? testo.substring(0, 180) + '...' : testo || '';

  return (
    <button
      onClick={onClick}
      className="w-[85vw] md:w-full flex-shrink-0 snap-center p-8 border border-white/20 text-left hover:border-white/40 hover:bg-white/[0.035] transition-all group rounded-[12px] min-h-[280px] flex flex-col"
    >
      <div className="flex items-start justify-between mb-4">
        <h6 className="m-0 text-white font-body text-[20px] font-bold uppercase tracking-wide">{nome || ''}</h6>
        <svg className="flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity ml-4" width="24" height="24" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z" fill="rgb(153, 153, 153)"/>
        </svg>
      </div>
      <p className="m-0 text-white/70 font-body text-[15px] font-medium mb-4 leading-tight">{ruolo || ''}</p>
      <p className="m-0 text-white/50 font-body text-[14px] font-normal italic leading-relaxed flex-grow">&ldquo;{anteprima}&rdquo;</p>
    </button>
  );
};

const Collezione: React.FC = () => {
  const { t } = useTranslation();
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [critics, setCritics] = useState<Critic[]>([]);
  const [selectedMostra, setSelectedMostra] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mostreVisibili, setMostreVisibili] = useState(4);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [selectedCritico, setSelectedCritico] = useState<any>(null);
  const [isCriticoModalOpen, setIsCriticoModalOpen] = useState(false);
  const [aboutView, setAboutView] = useState<'alf' | 'studio'>('alf');
  const [loadingCollections, setLoadingCollections] = useState(true);

  const openMostraModal = (mostra: any) => {
    setSelectedMostra(mostra);
    setIsModalOpen(true);
  };

  const closeMostraModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedMostra(null), 300);
  };

  const openCriticoModal = (critico: any) => {
    setSelectedCritico(critico);
    setIsCriticoModalOpen(true);
  };

  const closeCriticoModal = () => {
    setIsCriticoModalOpen(false);
    setTimeout(() => setSelectedCritico(null), 300);
  };

  const mostraAltre = () => {
    const previousCount = mostreVisibili;
    const newCount = Math.min(mostreVisibili + 4, exhibitionsOrdered.length);
    setMostreVisibili(newCount);

    // Anima le nuove mostre dopo che sono state renderizzate
    setTimeout(() => {
      const newItems = document.querySelectorAll('.mostra-item');
      for (let i = previousCount; i < newCount; i++) {
        if (newItems[i]) {
          gsap.fromTo(newItems[i],
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: (i - previousCount) * 0.1 }
          );
        }
      }
    }, 10);
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;

    try {
      const result = await subscribeToNewsletter(newsletterEmail);
      setIsSignedUp(true);
      console.log(result.message);
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      alert('Errore durante l\'iscrizione. Riprova più tardi.');
    }
  };

  // Ordina le mostre fetchate per anno e mese (dalla più recente alla più vecchia)
  const exhibitionsOrdered = [...exhibitions]
    .filter(e => e.is_visible)
    .map(e => ({
      id: e.slug,
      titolo: e.title,
      sottotitolo: e.subtitle || '',
      luogo: e.location,
      data: e.date,
      descrizione: e.description || '',
      info: e.info,
      website: e.website
    }))
    .sort((a, b) => {
      // Estrae l'anno dalla stringa data
      const getYear = (dataStr: string) => {
        const match = dataStr.match(/\d{4}/);
        return match ? parseInt(match[0]) : 0;
      };

      // Estrae il mese (se disponibile)
      const getMonth = (dataStr: string) => {
        const mesi = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
                      'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];

        // Cerca il nome del mese
        const meseTrovato = mesi.findIndex(m => dataStr.toLowerCase().includes(m));
        if (meseTrovato !== -1) return meseTrovato;

        // Cerca il numero del mese nel formato gg/mm/aaaa
        const match = dataStr.match(/\d{1,2}\/(\d{1,2})\/\d{4}/);
        if (match) return parseInt(match[1]) - 1;

        return 0;
      };

      const yearA = getYear(a.data);
      const yearB = getYear(b.data);

      // Prima ordina per anno
      if (yearA !== yearB) {
        return yearB - yearA;
      }

      // Se stesso anno, ordina per mese
      return getMonth(b.data) - getMonth(a.data);
    });

  // Carica dati dalle API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingCollections(true);
        console.log('Loading data...');
        const [artworksData, collectionsData, exhibitionsData, criticsData] = await Promise.all([
          getArtworks(),
          getCollections(),
          getExhibitions(),
          getCritics()
        ]);
        console.log('Collections loaded:', collectionsData);
        console.log('Exhibitions loaded:', exhibitionsData);
        console.log('Critics loaded:', criticsData);
        setArtworks(artworksData);
        // Filtra solo le collezioni visibili
        const visibleCollections = collectionsData.filter(c => c.is_visible);
        setCollections(visibleCollections);
        setExhibitions(exhibitionsData);
        setCritics(criticsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoadingCollections(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    // Avvia le animazioni

    const ctx = gsap.context(() => {
      // Hero animations
      gsap.fromTo(titleRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 3, delay: 0.5, ease: "power2.out" }
      );

      gsap.fromTo(subtitleRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 2.8, delay: 0.8, ease: "power2.out" }
      );

      // Hero image animation
      gsap.fromTo('.hero-image',
        { y: 30, opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 3.2, delay: 1.1, ease: "power2.out" }
      );

      // Hero fade out on scroll
      gsap.to(heroRef.current, {
        opacity: 0,
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });

      // Description fade out on scroll
      gsap.to('.description-section', {
        opacity: 0,
        scrollTrigger: {
          trigger: '.description-section',
          start: "center top",
          end: "bottom top",
          scrub: true
        }
      });

      // Collection items animation
      gsap.fromTo('.collection-item',
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 2,
          stagger: 0.3,
          ease: "power2.out",
          scrollTrigger: {
            trigger: '.collection-grid',
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // Mostre section animation
      gsap.fromTo('#mostre',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: '#mostre',
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // Testi Critici animation
      gsap.fromTo('.testo-critico',
        { x: -20, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1.5,
          stagger: 0.3,
          ease: "power2.out",
          scrollTrigger: {
            trigger: '#testi-critici',
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    return () => ctx.revert();
  }, [artworks]);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Adele Lo Feudo - L'Artista Italiana</title>
        <meta name="description" content="Adele Lo Feudo - L'artista italiana che esplora l'anima attraverso la materia. Scopri le opere d'arte contemporanea." />
      </Helmet>


      {/* Hero Section */}
      <section ref={heroRef} className="min-h-screen flex flex-col justify-center p-0 w-screen -ml-[calc(50vw-50%)] mb-0" style={{ scrollSnapAlign: 'start' }}>
        <div className="w-full pt-24 px-6 mobile:pt-24 mobile:px-6" style={{ textAlign: 'left' }}>
          <div ref={titleRef} className="w-full mb-0 flex mobile:justify-center opacity-0" style={{ justifyContent: 'flex-start' }}>
            <AdeleSVG className="w-full h-auto fill-white [&_*]:fill-white" style={{ maxWidth: '100%' }} />
          </div>
          <h2 ref={subtitleRef} className="text-body font-bold uppercase leading-[1.4] tracking-[0px] text-left mt-6 mb-6 opacity-0">
            {t('subtitlePart1')}<span className="italic text-accent underline">{t('anima')}</span><br/>
            {t('subtitlePart2')}<span className="italic text-accent underline">{t('materia')}</span>
          </h2>
        </div>
        <div className="relative w-full flex items-center justify-center mt-4 mb-16 px-6 mobile:px-6">
          <img
            className="hero-image w-[700px] max-w-[90%] h-auto object-contain object-center rounded-[10px] opacity-0"
            src="https://framerusercontent.com/images/8TonweCu2FGoT0Vejhe7bUZe5ys.png"
            alt="Adele Lo Feudo - Artista"
            loading="lazy"
          />
        </div>
      </section>

      {/* Description Section */}
      <section className="description-section min-h-screen flex items-center px-6" style={{ scrollSnapAlign: 'start' }}>
        <div className="w-full">
          <p className="heading-primary text-left">
            {t('descriptionPart1')}<span className="text-accent">{t('accentDescription1')}</span>{t('descriptionPart2')}<span className="text-accent">{t('accentDescription2')}</span>{t('descriptionPart3')}<span className="text-accent">{t('accentDescription3')}</span>{t('descriptionPart4')}
          </p>
        </div>
      </section>

      {/* Collection Section */}
      <section id="collection" className="py-20 px-6" style={{ scrollSnapAlign: 'start', minHeight: '100vh' }}>
        <div className="w-full">
          <h2 className="text-[42px] font-bold text-accent uppercase mb-8" style={{fontFamily: 'Montserrat, sans-serif'}}>Collezioni</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {loadingCollections ? (
              <div className="col-span-2 text-center py-12">
                <p className="text-white text-xl">Caricamento collezioni...</p>
              </div>
            ) : collections.length === 0 ? (
              <div className="col-span-2 text-center py-12">
                <p className="text-white/60">Nessuna collezione disponibile</p>
              </div>
            ) : (
              collections
                .filter(collection => collection.is_visible)
                .sort((a, b) => a.order_index - b.order_index)
                .map((collection, index) => (
                  <motion.div
                    key={collection.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                  >
                    <Link to={`/collezione/${collection.slug}`} className="group cursor-pointer block">
                      <div className="flex flex-col gap-1 mb-4">
                        <h4 className="font-body text-[16px] font-bold text-white uppercase">{collection.title}</h4>
                        <p className="font-body text-[14px] text-white/60">
                          {collection.description}
                        </p>
                      </div>
                      <div className="border border-white/10 rounded-[12px] overflow-hidden">
                        <div className="aspect-[3/2]">
                          <img
                            alt={collection.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            src={collection.image_url || '/opera.png'}
                          />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
            )}
          </div>
        </div>
      </section>

      {/* Mostre Section */}
      <section id="mostre" className="py-20 px-6" style={{ scrollSnapAlign: 'start', minHeight: '100vh' }}>
        <div className="w-full">
          <h2 className="text-[42px] font-bold text-accent uppercase mb-8" style={{fontFamily: 'Montserrat, sans-serif'}}>Mostre</h2>

          <div className="border-t border-white/20">
            {exhibitionsOrdered.slice(0, mostreVisibili).map((mostra, index) => {
              return (
                <div
                  key={mostra.id}
                  className="mostra-item border-b border-white/20 py-8 flex items-center justify-between gap-8 cursor-pointer hover:bg-white/[0.035] transition-all"
                  onClick={() => openMostraModal(mostra)}
                >
                  <div className="flex-1 m-0 flex flex-col justify-center">
                    <p className="m-0 text-white font-body text-[18px] font-bold uppercase mb-2">{mostra.titolo}</p>
                    <p className="m-0 text-white font-body text-[16px] font-normal uppercase">{mostra.sottotitolo}</p>
                  </div>
                  <div className="flex-1 m-0 flex items-center justify-end">
                    <p className="m-0 text-white/60 font-body text-[14px] font-normal">
                      {formatDataMostra(mostra.data)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pulsante Mostra Altre */}
          {mostreVisibili < exhibitionsOrdered.length && (
            <div className="mt-12 flex justify-center">
              <button
                onClick={mostraAltre}
                className="px-8 py-4 border border-white/40 text-white hover:border-accent hover:text-accent transition-colors font-body text-[16px] uppercase tracking-wide"
              >
                Mostra Altre
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Pin Section with Parallax */}
      <section
        className="pin-section relative overflow-hidden"
        style={{
          height: '100vh',
          scrollSnapAlign: 'start',
          backgroundImage: 'url(/parallax-image.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 flex items-start justify-start px-6 md:px-12 pt-16 md:pt-20">
          <div className="max-w-3xl text-left">
            <p
              className="text-white text-[20px] md:text-[28px] font-bold leading-relaxed uppercase tracking-wide"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Parto da un'immagine per stimolare l'osservatore a porsi delle domande, andando oltre
            </p>
          </div>
        </div>
        <div className="absolute bottom-8 right-6 md:bottom-12 md:right-12">
          <p
            className="text-white text-[20px] md:text-[28px] font-bold leading-relaxed uppercase tracking-wide text-right"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            <span className="md:block">Giustizia attraverso</span>
            <span className="md:block">conoscenza e memoria</span>
          </p>
        </div>
      </section>

      {/* Bio & Testi Critici Section */}
      <section id="bio" className="py-20 md:px-6" style={{ scrollSnapAlign: 'start', minHeight: 'auto' }}>
        <div className="w-full">
          <h2 className="text-[42px] font-bold text-accent uppercase mb-8" style={{fontFamily: 'Montserrat, sans-serif'}}>
            {t('critique')}
          </h2>

          <div className="w-full">
            {/* Testi Critici */}
            <div className="flex md:grid overflow-x-scroll md:overflow-visible gap-6 px-6 md:px-0 md:grid-cols-2 lg:grid-cols-3 snap-x snap-mandatory md:snap-none" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
              {critics
                .filter(critic => critic.is_visible)
                .sort((a, b) => a.order_index - b.order_index)
                .map((critic) => {
                  // Get the text for the current language
                  const currentLang = localStorage.getItem('preferredLanguage') || 'it';
                  const criticText = currentLang === 'en' && critic.text_en
                    ? critic.text_en
                    : currentLang === 'it' && critic.text_it
                    ? critic.text_it
                    : critic.text || '';

                  return (
                    <TestoCriticoItem
                      key={critic.id}
                      nome={critic.name}
                      ruolo={critic.role}
                      testo={criticText}
                      onClick={() => openCriticoModal({
                        nome: critic.name,
                        ruolo: critic.role,
                        testo: criticText
                      })}
                    />
                  );
                })
              }
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="pt-20 pb-32 px-6" style={{ scrollSnapAlign: 'start', minHeight: 'auto' }}>
        <div className="w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h2 className="text-[42px] font-bold text-accent uppercase" style={{fontFamily: 'Montserrat, sans-serif'}}>ABOUT</h2>

            {/* Toggle Switch */}
            <div className="flex items-center gap-4 bg-white/5 rounded-full p-1 border border-white/10">
              <button
                onClick={() => setAboutView('alf')}
                className={`px-6 py-2 rounded-full transition-all font-bold uppercase text-sm ${
                  aboutView === 'alf'
                    ? 'bg-accent text-white'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                ALF
              </button>
              <button
                onClick={() => setAboutView('studio')}
                className={`px-6 py-2 rounded-full transition-all font-bold uppercase text-sm ${
                  aboutView === 'studio'
                    ? 'bg-accent text-white'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Studio
              </button>
            </div>
          </div>

          {/* Content Container with smooth transition */}
          <div className="relative">
            {/* ALF View */}
            <div className={`transition-all duration-500 ${
              aboutView === 'alf'
                ? 'opacity-100 translate-x-0 scale-100 relative'
                : 'opacity-0 -translate-x-8 scale-95 pointer-events-none absolute inset-0'
            }`}>
              <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
                {/* Image Column */}
                <div className="group w-full md:w-[380px] flex-shrink-0">
                  <div className="border border-white/10 rounded-[12px] overflow-hidden">
                    <div className="aspect-[3/4]">
                      <img
                        src="/adele.jpg"
                        alt="Adele Lo Feudo"
                        className="w-full h-full object-cover grayscale group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>
                </div>
                {/* Text Column */}
                <div className="flex flex-col gap-6 flex-1">
                  <p className="font-body text-[16px] text-white/80 leading-loose">
                    {t('bioText1')}
                  </p>
                  <div className="h-px bg-white/20"></div>
                  <p className="font-body text-[16px] text-white/80 leading-loose">
                    {t('bioText2')}
                  </p>
                  <div className="h-px bg-white/20"></div>
                  <p className="font-body text-[16px] text-white/80 leading-loose">
                    {t('bioText3')}
                  </p>
                  <div className="h-px bg-white/20"></div>
                  <p className="font-body text-[16px] text-white/80 leading-loose">
                    {t('bioText4')}
                  </p>
                </div>
              </div>
            </div>

            {/* Studio View */}
            <div className={`transition-all duration-500 ${
              aboutView === 'studio'
                ? 'opacity-100 translate-x-0 scale-100 relative'
                : 'opacity-0 translate-x-8 scale-95 pointer-events-none absolute inset-0'
            }`}>
              <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
                {/* Image Column */}
                <div className="group w-full md:w-[380px] flex-shrink-0">
                  <div className="border border-white/10 rounded-[12px] overflow-hidden">
                    <div className="aspect-[3/4]">
                      <img
                        src="/parallax-image.jpg"
                        alt="ALF Studio"
                        className="w-full h-full object-cover grayscale group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>
                </div>
                {/* Text Column */}
                <div className="flex flex-col gap-6 flex-1">
                  <p className="font-body text-[16px] text-white/80 leading-loose">
                    Lo studio di Adele Lo Feudo è un laboratorio creativo dove l'arte prende forma attraverso
                    un processo di ricerca continua. Situato nel cuore della città, lo spazio si configura come
                    un ambiente di sperimentazione dove tecniche tradizionali e approcci contemporanei si fondono
                    per dare vita a opere uniche.
                  </p>
                  <div className="h-px bg-white/20"></div>
                  <p className="font-body text-[16px] text-white/80 leading-loose">
                    Ogni progetto nasce da un'attenta analisi del contesto e da un dialogo costante con il committente,
                    garantendo risultati che non solo soddisfano le aspettative estetiche, ma che raccontano anche una
                    storia, evocano emozioni e creano connessioni profonde con lo spazio circostante.
                  </p>
                  <div className="h-px bg-white/20"></div>
                  <p className="font-body text-[16px] text-white/80 leading-loose">
                    Lo studio offre servizi di consulenza artistica, progettazione di opere su commissione,
                    restauro conservativo e workshop formativi. La filosofia che guida ogni intervento è quella
                    di creare non solo oggetti d'arte, ma esperienze che arricchiscono l'ambiente e la vita di
                    chi le vive quotidianamente.
                  </p>
                  <div className="h-px bg-white/20"></div>
                  <p className="font-body text-[16px] text-white/80 leading-loose">
                    Con oltre vent'anni di esperienza nel settore, lo studio ha realizzato progetti per collezioni
                    private, spazi pubblici e istituzioni culturali, sempre mantenendo un approccio artigianale e
                    una cura meticolosa per ogni dettaglio.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background mt-5 border-t border-white/20 pt-[3.75rem] md:mt-10 relative bottom-0">
        <div className="flex flex-col gap-12 px-5 pb-10">
          {/* CTA Section */}
          <div className="flex w-full flex-col gap-8 md:gap-10 items-center md:items-start">
            <p className="text-[16px] md:text-[18px] font-bold text-white uppercase tracking-wider" style={{fontFamily: 'Montserrat, sans-serif'}}>
              Adele Lo Feudo
            </p>
            <h2 className="text-[28px] md:text-[48px] font-bold text-white uppercase leading-[1.1] text-center md:text-left -mt-4" style={{fontFamily: 'Montserrat, sans-serif'}}>
              Trasforma la Tua<br />Visione in Realtà
            </h2>
            <a
              href="mailto:adelelofeudo@gmail.com"
              className="px-8 py-4 border border-white/40 text-white hover:border-accent hover:text-accent transition-colors font-body text-[16px] uppercase tracking-wide"
            >
              Contattami
            </a>
          </div>

          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Copyright, Links and Social Icons - All on the left */}
            <div className="flex flex-wrap items-center gap-5">
              <p className="text-white text-xs md:text-xs">{t('allRights')}</p>
              <Link
                to="/terms"
                className="transition-text-decoration duration-300 ease-in decoration-1 cursor-pointer decoration-transparent hover:underline hover:decoration-current focus:underline focus:decoration-current decoration-white/60 text-xs underline-offset-[0.375rem] text-xs md:text-xs"
              >
                {t('terms')}
              </Link>
              <Link
                to="/privacy"
                className="transition-text-decoration duration-300 ease-in decoration-1 cursor-pointer decoration-transparent hover:underline hover:decoration-current focus:underline focus:decoration-current decoration-white/60 text-xs underline-offset-[0.375rem] text-xs md:text-xs"
              >
                {t('privacy')}
              </Link>
              {/* Social Icons */}
              <a href="https://www.facebook.com/wood.baconsoup?locale=fo_FO" target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-60">
                <svg className="text-white" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/adelelofeudo/" target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-60">
                <svg className="text-white" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Language Switcher */}
      <LanguageSwitcher />

      {/* Modal Mostre */}
      {selectedMostra && (
        <MostraModal
          isOpen={isModalOpen}
          onClose={closeMostraModal}
          mostra={selectedMostra}
        />
      )}

      {/* Modal Testi Critici */}
      {selectedCritico && (
        <TestoCriticoModal
          isOpen={isCriticoModalOpen}
          onClose={closeCriticoModal}
          critico={selectedCritico}
        />
      )}
    </div>
  );
};

export default Collezione;
