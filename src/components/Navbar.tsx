import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { gsap } from 'gsap';

const Nav = styled.nav<{ scrolled: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 24px;
  background: linear-gradient(rgba(19, 19, 19, 0.4) 0%, rgba(19, 19, 19, 0.15) 50.4505%, rgba(19, 19, 19, 0) 100%);
  width: 100%;
  transition: all 0.3s ease;
`;

const NavContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const Logo = styled(Link)`
  font-size: 14px;
  font-weight: bold;
  text-decoration: none;
  color: rgb(240, 45, 110);
  font-family: 'HelveticaNeue-Bold', 'Helvetica Neue', sans-serif;
  text-transform: uppercase;
  text-align: center;
`;

const NavLinks = styled.div<{ isOpen: boolean }>`
  display: flex;
  justify-content: space-between;
  flex: 1;
  margin-left: 4rem;
  
  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    right: ${props => props.isOpen ? '0' : '-100%'};
    width: 300px;
    height: 100vh;
    background: white;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    transition: right 0.3s ease;
    box-shadow: ${props => props.isOpen ? '-5px 0 15px rgba(0, 0, 0, 0.1)' : 'none'};
    margin-left: 0;
  }
`;

const NavLink = styled.a<{ active: boolean }>`
  text-decoration: none;
  color: rgb(240, 45, 110);
  font-family: 'HelveticaNeue-Bold', 'Helvetica Neue', sans-serif;
  font-size: 14px;
  font-weight: bold;
  text-transform: uppercase;
  text-align: center;
  line-height: 2em;
  position: relative;
  transition: color 0.3s ease;
  cursor: pointer;
  
  &:hover {
    color: rgb(240, 45, 110);
    opacity: 0.8;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  flex-direction: column;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  
  @media (max-width: 768px) {
    display: flex;
  }
`;

const MenuLine = styled.span<{ isOpen: boolean; index: number }>`
  width: 25px;
  height: 3px;
  background: #333;
  margin: 2px 0;
  transition: all 0.3s ease;
  transform-origin: center;
  
  ${props => props.isOpen && props.index === 0 && `
    transform: rotate(45deg) translate(6px, 6px);
  `}
  
  ${props => props.isOpen && props.index === 1 && `
    opacity: 0;
  `}
  
  ${props => props.isOpen && props.index === 2 && `
    transform: rotate(-45deg) translate(6px, -6px);
  `}
`;

const Overlay = styled.div<{ isOpen: boolean }>`
  display: ${props => props.isOpen ? 'block' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  
  @media (min-width: 769px) {
    display: none;
  }
`;

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

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navItems = [
    { href: '#sculture', label: 'Collezione' },
    { href: '#dipinti', label: 'Collezione' },
    { href: '#installazioni', label: 'Collezione' },
    { href: '#opere-miste', label: 'Collezione' },
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
      <Nav scrolled={isScrolled}>
        <NavContainer>
          <Logo to="/">ALF</Logo>
          
          <NavLinks isOpen={isMobileMenuOpen}>
            {navItems.map((item, index) => (
              <NavLink
                key={index}
                onClick={() => handleNavClick(item.href)}
                active={false}
              >
                {item.label}
              </NavLink>
            ))}
          </NavLinks>
          
          <MobileMenuButton
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <MenuLine isOpen={isMobileMenuOpen} index={0} />
            <MenuLine isOpen={isMobileMenuOpen} index={1} />
            <MenuLine isOpen={isMobileMenuOpen} index={2} />
          </MobileMenuButton>
        </NavContainer>
      </Nav>
      
      <Overlay
        isOpen={isMobileMenuOpen}
        onClick={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
};

export default Navbar; 