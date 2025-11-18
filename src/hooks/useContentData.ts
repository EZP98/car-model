/**
 * Hook personalizzato per gestire i dati del contenuto
 * con caching e stato di caricamento
 */

import { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import {
  getCollections,
  getExhibitions,
  getCritics,
  type Collection,
  type Exhibition,
  type Critic,
} from '../services/content-api';

interface ContentData {
  collections: Collection[];
  exhibitions: Exhibition[];
  critics: Critic[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useContentData(): ContentData {
  const { language } = useLanguage();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [critics, setCritics] = useState<Critic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [collectionsData, exhibitionsData, criticsData] = await Promise.all([
        getCollections(),
        getExhibitions(),
        getCritics(language),
      ]);

      setCollections(collectionsData);
      setExhibitions(exhibitionsData);
      setCritics(criticsData);
    } catch (err) {
      console.error('Error fetching content data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load content');

      // Se c'è un errore, usa i dati hardcoded come fallback
      // Questo permette al sito di funzionare anche senza database
      useFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const useFallbackData = () => {
    // Dati hardcoded di fallback (gli stessi che sono attualmente nel componente)
    setCollections([
      {
        id: 1,
        slug: 'opera-5',
        title: 'OPERA 5',
        description: 'Opere scultoree che esplorano la materia e la forma attraverso l\'arte contemporanea',
        image_url: '/DSCF3759.jpg',
        order_index: 1,
        is_visible: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 2,
        slug: 'opera-6',
        title: 'OPERA 6',
        description: 'Opere scultoree che esplorano la materia e la forma attraverso l\'arte contemporanea',
        image_url: '/DSCF9079.jpg',
        order_index: 2,
        is_visible: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 3,
        slug: 'opera-7',
        title: 'OPERA 7',
        description: 'Opere scultoree che esplorano la materia e la forma attraverso l\'arte contemporanea',
        image_url: '/DSCF2104.jpg',
        order_index: 3,
        is_visible: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 4,
        slug: 'opera-8',
        title: 'OPERA 8',
        description: 'Opere scultoree che esplorano la materia e la forma attraverso l\'arte contemporanea',
        image_url: '/DSCF2012.jpg',
        order_index: 4,
        is_visible: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    // Mostre hardcoded
    const hardcodedExhibitions: Exhibition[] = [
      {
        id: 1,
        slug: 'cenerentola',
        title: 'CENERENTOLA',
        subtitle: 'Personale di Adele Lo Feudo',
        location: 'Palazzo delle Prigioni Vecchie, Perugia',
        date: '23 Novembre 2024',
        description: 'Il significato del dipinto di Adele Lo Feudo risiede nel celebrare e promuovere l\'immaginazione come risorsa indispensabile del sentire intimo.',
        info: 'Fino al 23 novembre 2024, dalle ore 17:30 alle ore 19:30 tutti i giorni, mattina su appuntamento. Escluso il lunedì. Chiusa il 1 novembre.',
        order_index: 1,
        is_visible: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 2,
        slug: 'tutt-uno',
        title: 'TUTT\'UNO CON L\'OPERA',
        subtitle: 'Personale di Adele Lo Feudo',
        location: 'Sala delle Cannoniere della Rocca Paolina, Perugia',
        date: '2 Marzo 2024',
        description: 'Una mostra che esplora l\'unità tra l\'artista e la sua opera, dove ogni pezzo racconta una storia di armonia e connessione profonda con la materia.',
        info: 'Inaugurazione della mostra Giovedì 14 Marzo 2024, ore 18:00. Sarà presente l\'Assessore alla Cultura del Comune di Perugia, Leonardo Varasano. Orari di apertura 15:30 - 19:30. Sabato e Domenica 10:30 - 13:30 / 16:00 - 19:30',
        order_index: 2,
        is_visible: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 3,
        slug: 'ritorno',
        title: 'RITORNO',
        subtitle: 'Personale di Adele Lo Feudo',
        location: 'Museo a Cielo Aperto di Camo (CN)',
        date: '3-24 Agosto 2025',
        description: 'Un viaggio attraverso l\'origine e il ritorno, dove l\'artista esplora le radici della propria espressione artistica in un dialogo continuo tra passato e presente.',
        info: 'Vernissage 3 agosto, ore 10:30. In esposizione fino al 24 agosto 2025',
        website: 'https://ritorno.adelelofeudo.com/',
        order_index: 3,
        is_visible: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 4,
        slug: 'fornace',
        title: 'Fornace Pasquinucci',
        subtitle: 'Mostra Collettiva',
        location: 'Fornace Pasquinucci, Camogli (Perugia)',
        date: '23 Luglio 2023',
        description: 'Una mostra collettiva che celebra la ceramica contemporanea e l\'arte del fuoco.',
        info: 'Dal 23 luglio al 31 agosto 2023. Orari: Mercoledì - Domenica 16:00 - 20:00',
        order_index: 4,
        is_visible: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    setExhibitions(hardcodedExhibitions);

    // Per i critici, usiamo una struttura semplificata
    // I testi completi sono già nel file translations.ts
    setCritics([]);
  };

  useEffect(() => {
    fetchData();
  }, [language]); // Ricarica quando cambia la lingua

  return {
    collections,
    exhibitions,
    critics,
    loading,
    error,
    refetch: fetchData,
  };
}

// Hook per singola collezione
export function useCollection(slug: string) {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        setLoading(true);
        const { getCollection } = await import('../services/content-api');
        const data = await getCollection(slug);
        setCollection(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load collection');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCollection();
    }
  }, [slug]);

  return { collection, loading, error };
}

// Hook per singola mostra
export function useExhibition(slug: string) {
  const [exhibition, setExhibition] = useState<Exhibition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExhibition = async () => {
      try {
        setLoading(true);
        const { getExhibition } = await import('../services/content-api');
        const data = await getExhibition(slug);
        setExhibition(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load exhibition');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchExhibition();
    }
  }, [slug]);

  return { exhibition, loading, error };
}