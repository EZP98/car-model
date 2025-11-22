import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isLanguageMenuOpen && !target.closest('.language-selector')) {
        setIsLanguageMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isLanguageMenuOpen]);

  // Scroll to section when landing on homepage with hash
  useEffect(() => {
    if ((location.pathname === '/' || location.pathname === '/collezione') && location.hash) {
      setTimeout(() => {
        const element = document.querySelector(location.hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location.pathname, location.hash]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const navItems = [
    { href: '#collection', label: 'COLLEZIONI' },
    { href: '#mostre', label: 'MOSTRE' },
    { href: '#bio', label: 'CRITICA' },
    { href: '#about', label: 'ABOUT' },
  ];

  const handleNavClick = (href: string, e?: React.MouseEvent) => {
    e?.preventDefault();

    // Se non sei in homepage, vai alla home con hash
    if (location.pathname !== '/' && location.pathname !== '/collezione') {
      navigate('/' + href);
      setIsMobileMenuOpen(false);
      return;
    }

    // Se sei già in homepage, smooth scroll alla sezione
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-[1000] p-6 w-full transition-all duration-300"
        style={{
          background: 'linear-gradient(rgba(19, 19, 19, 0.4) 0%, rgba(19, 19, 19, 0.15) 50.4505%, rgba(19, 19, 19, 0) 100%)'
        }}
      >
        <div className="flex justify-between items-center w-full">
          <Link
            to="/"
            className="text-sm font-bold no-underline font-sans uppercase text-center text-accent"
          >
            ALF
          </Link>

          {/* Desktop Menu Items */}
          {navItems.map((item, index) => (
            <a
              key={index}
              href={'/' + item.href}
              onClick={(e) => handleNavClick(item.href, e)}
              className="hidden md:block no-underline text-base font-bold uppercase text-center leading-8 relative cursor-pointer text-accent hover:text-white transition-colors"
              style={{
                fontFamily: 'Montserrat, sans-serif'
              }}
            >
              {item.label}
            </a>
          ))}

          {/* Desktop Language Selector */}
          <div className="hidden md:block relative language-selector">
            <button
              onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
              className="text-base font-bold uppercase text-accent hover:text-white transition-colors flex items-center gap-2"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              <span>{languages.find(l => l.code === language)?.flag}</span>
              <span>{languages.find(l => l.code === language)?.label}</span>
            </button>

            {isLanguageMenuOpen && (
              <div className="absolute right-0 top-full mt-2 bg-secondary border border-white/10 rounded-lg py-2 shadow-xl z-[1001]">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsLanguageMenuOpen(false);
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
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex flex-col gap-1.5 w-8 h-6 justify-center items-center z-[1001]"
            aria-label="Toggle menu"
          >
            <span
              className={`w-full h-0.5 bg-accent transition-all duration-300 ${
                isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''
              }`}
            />
            <span
              className={`w-full h-0.5 bg-accent transition-all duration-300 ${
                isMobileMenuOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`w-full h-0.5 bg-accent transition-all duration-300 ${
                isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
              }`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 w-full h-screen bg-background z-[999] flex items-center justify-center md:hidden transition-all duration-500 ${
          isMobileMenuOpen
            ? 'opacity-100 visible'
            : 'opacity-0 invisible'
        }`}
        style={{
          transform: isMobileMenuOpen ? 'scale(1)' : 'scale(0.95)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="absolute top-6 right-6 text-accent hover:text-white transition-colors z-[1002]"
          aria-label="Close menu"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        <div className="flex flex-col items-center justify-center gap-6">
          {navItems.map((item, index) => (
            <a
              key={index}
              href={'/' + item.href}
              onClick={(e) => handleNavClick(item.href, e)}
              className="no-underline text-4xl md:text-5xl font-bold uppercase text-accent hover:text-white transition-all duration-300 cursor-pointer transform hover:scale-110"
              style={{
                fontFamily: 'Montserrat, sans-serif',
                opacity: isMobileMenuOpen ? 1 : 0,
                transform: isMobileMenuOpen
                  ? 'translateY(0)'
                  : 'translateY(20px)',
                transition: `all 0.6s ease-out ${index * 0.1}s`,
                letterSpacing: '0.05em'
              }}
            >
              {item.label}
            </a>
          ))}

          {/* Mobile Language Selector */}
          <div className="flex gap-3 flex-wrap justify-center mt-4">
            {languages.map((lang, index) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsMobileMenuOpen(false);
                }}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  language === lang.code
                    ? 'bg-accent text-black'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  opacity: isMobileMenuOpen ? 1 : 0,
                  transition: `all 0.6s ease-out ${(navItems.length + index) * 0.1}s`
                }}
              >
                <span className="mr-2">{lang.flag}</span>
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar; 