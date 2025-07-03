import React from 'react';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';

const AboutContainer = styled.div`
  min-height: 100vh;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-top: 3rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const TextSection = styled.div`
  font-size: 1.1rem;
  line-height: 1.8;
`;

const ImageSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PlaceholderImage = styled.div`
  width: 300px;
  height: 400px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
`;

const About: React.FC = () => {
  return (
    <AboutContainer>
      <Helmet>
        <title>About - Artist Portfolio</title>
        <meta name="description" content="Learn more about the artist, their journey, and creative process." />
      </Helmet>
      
      <Title>About the Artist</Title>
      
      <Content>
        <TextSection>
          <h2>My Journey</h2>
          <p>
            Art has been my passion since childhood. Growing up surrounded by colors, textures, 
            and endless possibilities, I discovered that creating art was not just a hobby, 
            but a way to communicate emotions and stories that words couldn't express.
          </p>
          
          <h2>Philosophy</h2>
          <p>
            I believe that art should evoke emotion, challenge perspectives, and create 
            connections between the artist and the viewer. My work explores themes of 
            human experience, nature, and the abstract concepts that define our existence.
          </p>
          
          <h2>Technique</h2>
          <p>
            My artistic practice combines traditional techniques with contemporary approaches. 
            I work across various mediums including oil painting, digital art, mixed media, 
            and experimental installations.
          </p>
        </TextSection>
        
        <ImageSection>
          <PlaceholderImage>
            Artist Photo
          </PlaceholderImage>
        </ImageSection>
      </Content>
    </AboutContainer>
  );
};

export default About; 