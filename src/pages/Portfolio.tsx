import React, { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const PortfolioContainer = styled.div`
  min-height: 100vh;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 3rem;
  text-align: center;
`;

const Gallery = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const ArtworkCard = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const ArtworkImage = styled.div`
  width: 100%;
  height: 300px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  ${ArtworkCard}:hover &::after {
    opacity: 1;
  }
`;

const ArtworkInfo = styled.div`
  padding: 1.5rem;
  background: white;
`;

const ArtworkTitle = styled.h3`
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
  color: #333;
`;

const ArtworkDescription = styled.p`
  color: #666;
  line-height: 1.6;
`;

const FilterButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ active: boolean }>`
  padding: 0.7rem 1.5rem;
  border: 2px solid #667eea;
  background: ${props => props.active ? '#667eea' : 'transparent'};
  color: ${props => props.active ? 'white' : '#667eea'};
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  
  &:hover {
    background: #667eea;
    color: white;
  }
`;

const Portfolio: React.FC = () => {
  const [activeFilter, setActiveFilter] = React.useState('all');
  const galleryRef = useRef<HTMLDivElement>(null);

  const artworks = [
    { id: 1, title: "Abstract Dreams", category: "painting", description: "Oil on canvas exploration of subconscious imagery" },
    { id: 2, title: "Digital Horizons", category: "digital", description: "Contemporary digital art piece" },
    { id: 3, title: "Nature's Symphony", category: "painting", description: "Landscape painting capturing natural beauty" },
    { id: 4, title: "Urban Reflections", category: "mixed", description: "Mixed media artwork about city life" },
    { id: 5, title: "Emotional Spectrum", category: "digital", description: "Digital exploration of human emotions" },
    { id: 6, title: "Textured Reality", category: "mixed", description: "Mixed media with various textures and materials" },
  ];

  const filteredArtworks = activeFilter === 'all' 
    ? artworks 
    : artworks.filter(artwork => artwork.category === activeFilter);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.artwork-card', 
        { y: 50, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.6, 
          stagger: 0.1,
          scrollTrigger: {
            trigger: galleryRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    return () => ctx.revert();
  }, [filteredArtworks]);

  return (
    <PortfolioContainer>
      <Helmet>
        <title>Portfolio - Artist Portfolio</title>
        <meta name="description" content="Explore the complete collection of artworks including paintings, digital art, and mixed media." />
      </Helmet>
      
      <Title>Portfolio</Title>
      
      <FilterButtons>
        <FilterButton 
          active={activeFilter === 'all'} 
          onClick={() => setActiveFilter('all')}
        >
          All Works
        </FilterButton>
        <FilterButton 
          active={activeFilter === 'painting'} 
          onClick={() => setActiveFilter('painting')}
        >
          Paintings
        </FilterButton>
        <FilterButton 
          active={activeFilter === 'digital'} 
          onClick={() => setActiveFilter('digital')}
        >
          Digital Art
        </FilterButton>
        <FilterButton 
          active={activeFilter === 'mixed'} 
          onClick={() => setActiveFilter('mixed')}
        >
          Mixed Media
        </FilterButton>
      </FilterButtons>
      
      <Gallery ref={galleryRef}>
        {filteredArtworks.map((artwork) => (
          <ArtworkCard key={artwork.id} className="artwork-card">
            <ArtworkImage>
              Artwork {artwork.id}
            </ArtworkImage>
            <ArtworkInfo>
              <ArtworkTitle>{artwork.title}</ArtworkTitle>
              <ArtworkDescription>{artwork.description}</ArtworkDescription>
            </ArtworkInfo>
          </ArtworkCard>
        ))}
      </Gallery>
    </PortfolioContainer>
  );
};

export default Portfolio; 