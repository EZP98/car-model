import React, { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ReactComponent as AdeleSVG } from '../assets/images/adele.svg';

const CollezioneContainer = styled.div`
  min-height: 100vh;
  background-color: ${props => props.theme.colors.background};
`;

const HeroSection = styled.section`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
`;

const HeroContent = styled.div`
  width: 100%;
  text-align: left;
  margin-bottom: 3rem;
  padding: 96px 24px 0 24px;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    text-align: center;
    padding: 96px 24px 0 24px;
  }
`;

const AdeleLogoContainer = styled.div`
  width: 100%;
  margin-bottom: 0;
  display: flex;
  justify-content: flex-start;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    justify-content: center;
  }
`;

const StyledAdeleSVG = styled(AdeleSVG)`
  width: 100%;
  height: auto;
  fill: white;
  
  * {
    fill: white !important;
  }
`;

const HeroSubtitle = styled.h2`
  font-size: 18px;
  font-family: 'HelveticaNeue-Bold', 'Helvetica Neue', sans-serif;
  color: white;
  text-transform: uppercase;
  text-align: left;
  line-height: 1.4;
  letter-spacing: 0px;
  margin-bottom: 3rem;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    text-align: center;
    font-size: 16px;
  }
`;

const HighlightText = styled.span`
  font-family: 'HelveticaNeue-MediumItalic', 'Helvetica Neue', sans-serif;
  color: rgb(240, 45, 110);
  text-decoration: underline;
`;

const HeroImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1rem;
  padding: 0 24px;
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    height: 70vh;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    height: 60vh;
    padding: 0 24px;
  }
`;

const HeroImage = styled.img`
  width: 700px;
  max-width: 90%;
  height: auto;
  object-fit: contain;
  object-position: center center;
  border-radius: 10px;
`;

const CollectionGrid = styled.section`
  padding: 5rem 24px;
`;

const SectionTitle = styled.h2`
  font-size: 3rem;
  margin-bottom: 3rem;
  text-align: center;
  color: rgb(240, 45, 110);
  font-family: 'Palanquin', sans-serif;
  font-weight: 700;
  text-transform: uppercase;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: 2rem;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const CollectionItem = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(240, 45, 110, 0.2);
  transition: transform 0.3s ease;
  background: rgba(240, 45, 110, 0.1);
  border: 2px solid rgba(240, 45, 110, 0.3);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(240, 45, 110, 0.3);
  }
`;

const ItemImage = styled.div`
  width: 100%;
  height: 300px;
  background: linear-gradient(135deg, rgba(240, 45, 110, 0.8) 0%, rgba(19, 19, 19, 0.8) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  font-family: 'HelveticaNeue-Bold', 'Helvetica Neue', sans-serif;
  text-transform: uppercase;
`;

const ItemInfo = styled.div`
  padding: 1.5rem;
  background: rgba(19, 19, 19, 0.9);
`;

const ItemTitle = styled.h3`
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
  color: rgb(240, 45, 110);
  font-family: 'HelveticaNeue-Bold', 'Helvetica Neue', sans-serif;
  text-transform: uppercase;
`;

const ItemDescription = styled.p`
  color: white;
  line-height: 1.6;
`;

const DescriptionSection = styled.section`
  padding: 5rem 24px;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: 3rem 24px;
  }
`;

const DescriptionContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  flex-shrink: 0;
`;

const UnifiedText = styled.div`
  font-family: 'HelveticaNeue-Bold', 'Helvetica Neue', sans-serif;
  font-size: 48px;
  text-align: left;
  color: rgb(255, 255, 255);
  text-transform: uppercase;
  line-height: 1.2;
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    font-size: 36px;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    text-align: center;
    font-size: 28px;
  }
`;

const HighlightSpan = styled.span`
  color: rgb(240, 45, 110);
`;

const CollectionDescription = styled.div`
  margin-top: 12px;
  text-align: center;
  color: white;
  font-family: 'HelveticaNeue-Bold', 'Helvetica Neue', sans-serif;
  font-size: 18px;
  line-height: 1.6;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: 16px;
    margin-top: 12px;
  }
`;

const Collezione: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations
      gsap.fromTo(titleRef.current, 
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, delay: 0.3, ease: "power3.out" }
      );
      
      gsap.fromTo(subtitleRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, delay: 0.6, ease: "power3.out" }
      );

      // Hero image animation
      gsap.fromTo('.hero-image',
        { y: 80, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 1.2, delay: 0.9, ease: "power3.out" }
      );

      // Collection items animation
      gsap.fromTo('.collection-item', 
        { y: 50, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.6, 
          stagger: 0.1,
          scrollTrigger: {
            trigger: '.collection-grid',
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    return () => ctx.revert();
  }, []);

  const collectionItems = [
    { id: 1, title: "ALF Collection 01", description: "Edizione limitata della collezione ALF" },
    { id: 2, title: "ALF Collection 02", description: "Pezzi unici e rari della serie ALF" },
    { id: 3, title: "ALF Collection 03", description: "Opere d'arte contemporanea ALF" },
    { id: 4, title: "ALF Collection 04", description: "Collezione esclusiva ALF" },
    { id: 5, title: "ALF Collection 05", description: "Serie speciale ALF limited edition" },
    { id: 6, title: "ALF Collection 06", description: "Capolavori della collezione ALF" },
  ];

  return (
    <CollezioneContainer>
             <Helmet>
         <title>Adele Lo Feudo - L'Artista Italiana</title>
         <meta name="description" content="Adele Lo Feudo - L'artista italiana che esplora l'anima attraverso la materia. Scopri le opere d'arte contemporanea." />
       </Helmet>
      
      <HeroSection ref={heroRef}>
        <HeroContent>
          <AdeleLogoContainer>
            <StyledAdeleSVG />
          </AdeleLogoContainer>
          <HeroSubtitle ref={subtitleRef}>
            L'Artista Italiana che Esplora l'<HighlightText>Anima</HighlightText><br/>
            Attraverso la <HighlightText>MATERIA</HighlightText>
          </HeroSubtitle>
        </HeroContent>
        <HeroImageContainer>
          <HeroImage 
            className="hero-image"
            src="https://framerusercontent.com/images/8TonweCu2FGoT0Vejhe7bUZe5ys.png" 
            alt="Adele Lo Feudo - Artista"
            loading="lazy"
          />
        </HeroImageContainer>
      </HeroSection>

      <DescriptionSection>
        <DescriptionContainer>
          <UnifiedText>
            Adele Lo Feudo, in arte <HighlightSpan>ALF</HighlightSpan>, è una pittrice contemporanea nota per le sue opere materiche e ritratti espressivi. Esplora temi sociali e l'<HighlightSpan>universo femminile</HighlightSpan> con sguardo penetrante, trasformando la tela in territorio di esplorazione dell'<HighlightSpan>anima</HighlightSpan> umana.
          </UnifiedText>
        </DescriptionContainer>
      </DescriptionSection>

      <CollectionGrid id="sculture" className="collection-grid">
        <SectionTitle>Sculture</SectionTitle>
        
        <Grid>
          {collectionItems.slice(0, 2).map((item) => (
            <CollectionItem key={item.id} className="collection-item">
              <ItemImage>
                SCULTURA {item.id.toString().padStart(2, '0')}
              </ItemImage>
              <ItemInfo>
                <ItemTitle>Scultura {item.id}</ItemTitle>
                <ItemDescription>Opere scultoree che esplorano la materia e la forma attraverso l'arte contemporanea</ItemDescription>
              </ItemInfo>
            </CollectionItem>
          ))}
        </Grid>
        <CollectionDescription>
          Le sculture di Adele Lo Feudo nascono dall'incontro tra materia e spirito, dove ogni forma racconta una storia di trasformazione.<br/>
          Attraverso l'argilla e il bronzo, l'artista esplora i confini dell'espressione umana, creando opere che dialogano con l'anima.<br/>
          Ogni scultura è un viaggio nell'inconscio collettivo, un ponte tra il tangibile e l'invisibile.
        </CollectionDescription>
      </CollectionGrid>

      <CollectionGrid id="dipinti" className="collection-grid">
        <SectionTitle>Dipinti</SectionTitle>
        
        <Grid>
          {collectionItems.slice(2, 4).map((item) => (
            <CollectionItem key={item.id} className="collection-item">
              <ItemImage>
                DIPINTO {item.id.toString().padStart(2, '0')}
              </ItemImage>
              <ItemInfo>
                <ItemTitle>Dipinto {item.id}</ItemTitle>
                <ItemDescription>Dipinti che raccontano l'anima attraverso colori e texture uniche</ItemDescription>
              </ItemInfo>
            </CollectionItem>
          ))}
        </Grid>
        <CollectionDescription>
          I dipinti di ALF sono esplosioni di colore e texture che catturano l'essenza dell'universo femminile contemporaneo.<br/>
          Ogni pennellata è un gesto di ribellione contro i canoni tradizionali, un grido di libertà espressiva che rompe ogni schema.<br/>
          Le tele diventano specchi dell'anima, riflettendo emozioni pure e stati d'essere autentici.
        </CollectionDescription>
      </CollectionGrid>

      <CollectionGrid id="installazioni" className="collection-grid">
        <SectionTitle>Installazioni</SectionTitle>
        
        <Grid>
          {collectionItems.slice(4, 5).map((item) => (
            <CollectionItem key={item.id} className="collection-item">
              <ItemImage>
                INSTALLAZIONE {item.id.toString().padStart(2, '0')}
              </ItemImage>
              <ItemInfo>
                <ItemTitle>Installazione {item.id}</ItemTitle>
                <ItemDescription>Installazioni immersive che trasformano lo spazio in esperienza artistica</ItemDescription>
              </ItemInfo>
            </CollectionItem>
          ))}
        </Grid>
        <CollectionDescription>
          Le installazioni di Adele Lo Feudo trasformano lo spazio in un territorio di esplorazione sensoriale ed emotiva.<br/>
          Ogni ambiente diventa un palcoscenico dove l'arte incontra la vita, creando esperienze immersive che coinvolgono tutti i sensi.<br/>
          L'artista costruisce mondi paralleli dove il pubblico diventa parte integrante dell'opera stessa.
        </CollectionDescription>
      </CollectionGrid>

      <CollectionGrid id="opere-miste" className="collection-grid">
        <SectionTitle>Opere Miste</SectionTitle>
        
        <Grid>
          {collectionItems.slice(5, 6).map((item) => (
            <CollectionItem key={item.id} className="collection-item">
              <ItemImage>
                OPERA MISTA {item.id.toString().padStart(2, '0')}
              </ItemImage>
              <ItemInfo>
                <ItemTitle>Opera Mista {item.id}</ItemTitle>
                <ItemDescription>Tecniche miste che uniscono diversi linguaggi artistici in un'unica espressione</ItemDescription>
              </ItemInfo>
            </CollectionItem>
          ))}
        </Grid>
        <CollectionDescription>
          Le opere miste rappresentano il culmine della ricerca artistica di ALF, dove tecniche diverse si fondono in un linguaggio unico.<br/>
          Pittura, scultura e materiali innovativi dialogano creando composizioni che sfidano le categorie tradizionali dell'arte.<br/>
          Ogni opera è un esperimento di libertà creativa, un manifesto dell'arte contemporanea senza confini.
        </CollectionDescription>
      </CollectionGrid>
    </CollezioneContainer>
  );
};

export default Collezione; 