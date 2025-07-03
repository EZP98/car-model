import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';

// Import pages
import Home from './pages/Home';
import About from './pages/About';
import Portfolio from './pages/Portfolio';
import Contact from './pages/Contact';
import Collezione from './pages/Collezione';

// Import components
import Navbar from './components/Navbar';


// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const theme = {
  colors: {
    primary: '#ffffff',
    secondary: '#131313',
    accent: '#ff6b6b',
    gray: '#888888',
    lightGray: '#f5f5f5',
    background: '#131313',
  },
  fonts: {
    primary: "'Inter', sans-serif",
    secondary: "'Playfair Display', serif",
  },
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1200px',
  },
};

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Palanquin:wght@100;200;300;400;500;600;700&display=swap');
  
  @font-face {
    font-family: 'HelveticaNeue-Bold';
    src: local('Helvetica Neue Bold'), local('HelveticaNeue-Bold');
    font-weight: bold;
    font-style: normal;
  }
  
  @font-face {
    font-family: 'HelveticaNeue-MediumItalic';
    src: local('Helvetica Neue Medium Italic'), local('HelveticaNeue-MediumItalic');
    font-weight: 500;
    font-style: italic;
  }
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    font-family: ${props => props.theme.fonts.primary};
    line-height: 1.6;
    color: ${props => props.theme.colors.primary};
    background-color: ${props => props.theme.colors.background};
    overflow-x: hidden;
    cursor: default;
  }

  ::selection {
    background: ${props => props.theme.colors.accent};
    color: white;
  }

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.lightGray};
  }

  ::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.accent};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme.colors.primary};
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  flex: 1;
`;

function App() {
  useEffect(() => {
    // GSAP initial setup
    gsap.set('body', { opacity: 1 });
    
    // Smooth scroll setup
    ScrollTrigger.refresh();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <HelmetProvider>
        <GlobalStyle />
        <Router>
          <AppContainer>
            <Navbar />
            <MainContent>
              <Routes>
                <Route path="/" element={<Collezione />} />
                <Route path="/collezione" element={<Collezione />} />
                <Route path="/about" element={<About />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/contact" element={<Contact />} />
              </Routes>
            </MainContent>

          </AppContainer>
        </Router>
      </HelmetProvider>
    </ThemeProvider>
  );
}

export default App;
