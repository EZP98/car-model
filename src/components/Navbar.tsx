import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const handleNavClick = (href: string) => {
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
              onClick={() => handleNavClick(item.href)}
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
              onClick={() => handleNavClick(item.href)}
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
        </div>
      </div>
    </>
  );
};

export default Navbar; 