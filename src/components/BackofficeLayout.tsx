import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface BackofficeLayoutProps {
  children: React.ReactNode;
}

const BackofficeLayout: React.FC<BackofficeLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      id: 'collezioni',
      label: 'Collezioni',
      path: '/content?tab=collezioni',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      )
    },
    {
      id: 'mostre',
      label: 'Mostre',
      path: '/content?tab=mostre',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <path d="M21 15l-5-5L5 21"/>
        </svg>
      )
    },
    {
      id: 'critica',
      label: 'Critica',
      path: '/content?tab=critica',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      )
    },
    {
      id: 'biografia',
      label: 'Biografia',
      path: '/content?tab=biografia',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      )
    },
  ];

  const isActive = (itemId: string) => {
    // Se siamo su /content con tab query param, usa quello
    if (location.pathname === '/content') {
      const params = new URLSearchParams(location.search);
      const currentTab = params.get('tab') || 'collezioni';
      return currentTab === itemId;
    }

    // Se siamo su pagine di dettaglio/creazione, identifica la sezione dal path
    const pathMap: { [key: string]: string } = {
      '/content/collezione/': 'collezioni',
      '/content/nuova-collezione': 'collezioni',
      '/content/mostra/': 'mostre',
      '/content/nuova-mostra': 'mostre',
      '/content/critico/': 'critica',
      '/content/nuovo-critico': 'critica',
    };

    for (const [pathPrefix, section] of Object.entries(pathMap)) {
      if (location.pathname.startsWith(pathPrefix) || location.pathname === pathPrefix.slice(0, -1)) {
        return section === itemId;
      }
    }

    return false;
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className="bg-secondary border-r fixed h-screen transition-all duration-300"
        style={{
          borderColor: 'rgba(255, 255, 255, 0.1)',
          width: '90px',
          zIndex: 40,
          overflow: 'visible'
        }}
      >
        {/* Header Sidebar */}
        <div className="p-4 border-b flex justify-center" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <h1 className="text-lg font-bold text-white uppercase" style={{ fontFamily: 'Montserrat, sans-serif', color: 'rgb(240, 45, 110)' }}>
            ALF
          </h1>
        </div>

        {/* Menu Items */}
        <nav className="p-6 space-y-3" style={{ overflow: 'visible' }}>
          {menuItems.map((item) => (
            <div key={item.id} className="relative group" style={{ overflow: 'visible' }}>
              <button
                onClick={() => navigate(item.path)}
                className={`w-full rounded-lg transition-all font-bold uppercase text-sm tracking-wide relative flex items-center justify-center px-4 py-4 ${
                  isActive(item.id)
                    ? 'text-white bg-white/10'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }`}
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  letterSpacing: '0.05em'
                }}
              >
                <span style={{ flexShrink: 0, width: '20px', height: '20px', display: 'inline-flex' }}>
                  {item.icon}
                </span>
              </button>
              {/* Tooltip on hover */}
              <div
                className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-secondary border rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap pointer-events-none"
                style={{
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  zIndex: 9999
                }}
              >
                <span className="text-white text-sm font-bold uppercase" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {item.label}
                </span>
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Sidebar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center border rounded-lg transition-all hover:bg-white/5 font-bold uppercase text-xs tracking-wide text-white/50 hover:text-white/80 px-3 py-3"
            style={{ borderColor: 'rgba(255, 255, 255, 0.1)', fontFamily: 'Montserrat, sans-serif' }}
            title="Torna al Sito"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: '90px' }}
      >
        {children}
      </main>
    </div>
  );
};

export default BackofficeLayout;
