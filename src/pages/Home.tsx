import React, { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const HomeContainer = styled.div`
  min-height: 100vh;
`;

const HeroSection = styled.section`
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #131313 0%, #667eea 50%, #764ba2 100%);
`;

const HeroContent = styled.div`
  text-align: center;
  color: white;
  z-index: 2;
`;

const HeroTitle = styled.h1`
  font-size: 4rem;
  font-weight: 700;
  margin-bottom: 1rem;
  font-family: ${props => props.theme.fonts.secondary};
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.5rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: 1.2rem;
  }
`;

const CTAButton = styled.button`
  padding: 1rem 2rem;
  font-size: 1.1rem;
  background: transparent;
  color: white;
  border: 2px solid white;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  
  &:hover {
    background: white;
    color: #667eea;
    transform: translateY(-2px);
  }
`;

const AboutPreview = styled.section`
  padding: 5rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
`;

const SectionTitle = styled.h2`
  font-size: 3rem;
  margin-bottom: 2rem;
  font-family: ${props => props.theme.fonts.secondary};
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: 2rem;
  }
`;

const AboutText = styled.p`
  font-size: 1.2rem;
  line-height: 1.8;
  color: ${props => props.theme.colors.gray};
  max-width: 800px;
  margin: 0 auto;
`;

const Home: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations
      gsap.fromTo(titleRef.current, 
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, delay: 0.5, ease: "power3.out" }
      );
      
      gsap.fromTo(subtitleRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, delay: 0.8, ease: "power3.out" }
      );
      
      gsap.fromTo(buttonRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, delay: 1.1, ease: "power3.out" }
      );

      // Parallax effect for hero
      gsap.to(heroRef.current, {
        yPercent: -50,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    });

    return () => ctx.revert();
  }, []);

  const scrollToPortfolio = () => {
    const portfolioSection = document.getElementById('about-preview');
    portfolioSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <HomeContainer>
      <Helmet>
        <title>Artist Portfolio - Creative Visual Arts</title>
        <meta name="description" content="Discover the creative world of visual arts, paintings, and digital creations." />
      </Helmet>
      
      <HeroSection ref={heroRef}>
        <HeroContent>
          <HeroTitle ref={titleRef}>Creative Vision</HeroTitle>
          <HeroSubtitle ref={subtitleRef}>
            Exploring the boundaries of art and imagination
          </HeroSubtitle>
          <CTAButton ref={buttonRef} onClick={scrollToPortfolio}>
            Discover My Work
          </CTAButton>
        </HeroContent>
      </HeroSection>

      <AboutPreview id="about-preview">
        <SectionTitle>About the Artist</SectionTitle>
        <AboutText>
          Welcome to my creative universe. I'm a passionate artist dedicated to exploring 
          the intersection of traditional techniques and contemporary vision. Through my work, 
          I aim to capture emotions, tell stories, and create connections that transcend 
          the boundaries of conventional art.
        </AboutText>
      </AboutPreview>
    </HomeContainer>
  );
};

export default Home; 