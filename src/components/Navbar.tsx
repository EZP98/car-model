import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { Language } from '../i18n/translations';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const languages: Array<{ code: Language; label: string; flag: string }> = [
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
    { code: 'zh', label: '简体中文', flag: '🇨🇳' },
    { code: 'zh-TW', label: '繁體中文', flag: '🇹🇼' },
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

          {/* Language Selector - Mobile Only */}
          <div
            className="flex flex-wrap gap-2 mt-4 justify-center max-w-xs"
            style={{
              opacity: isMobileMenuOpen ? 1 : 0,
              transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(20px)',
              transition: `all 0.6s ease-out ${navItems.length * 0.1}s`,
            }}
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsMobileMenuOpen(false);
                }}
                className={`px-3 py-1.5 rounded-full border transition-all duration-300 flex items-center gap-1.5 text-xs ${
                  language === lang.code
                    ? 'border-accent bg-accent/20 text-accent'
                    : 'border-white/20 text-white hover:border-accent hover:bg-accent/10'
                }`}
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                <span className="text-base">{lang.flag}</span>
                <span className="font-semibold">{lang.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar; 