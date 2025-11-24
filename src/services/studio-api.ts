/**
 * Studio API Service
 * Gestisce la descrizione dello studio dell'artista
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const API_KEY = import.meta.env.VITE_API_KEY || '';

function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (API_KEY) {
    headers['Authorization'] = `Bearer ${API_KEY}`;
  }

  return headers;
}

export interface Studio {
  id: number;
  text_it: string;
  text_en?: string;
  text_es?: string;
  text_fr?: string;
  text_ja?: string;
  text_zh?: string;
  text_zh_tw?: string;
  paragraph1_it?: string;
  paragraph1_en?: string;
  paragraph1_es?: string;
  paragraph1_fr?: string;
  paragraph1_ja?: string;
  paragraph1_zh?: string;
  paragraph1_zh_tw?: string;
  paragraph2_it?: string;
  paragraph2_en?: string;
  paragraph2_es?: string;
  paragraph2_fr?: string;
  paragraph2_ja?: string;
  paragraph2_zh?: string;
  paragraph2_zh_tw?: string;
  paragraph3_it?: string;
  paragraph3_en?: string;
  paragraph3_es?: string;
  paragraph3_fr?: string;
  paragraph3_ja?: string;
  paragraph3_zh?: string;
  paragraph3_zh_tw?: string;
  paragraph4_it?: string;
  paragraph4_en?: string;
  paragraph4_es?: string;
  paragraph4_fr?: string;
  paragraph4_ja?: string;
  paragraph4_zh?: string;
  paragraph4_zh_tw?: string;
  image_url?: string;
  content_version: number;
  translations_version: number;
  created_at: string;
  updated_at: string;
}

export async function getStudio(): Promise<Studio | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/studio`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch studio');
    }
    const data = await response.json() as { studio: Studio };
    return data.studio;
  } catch (error) {
    console.error('Error fetching studio:', error);
    return null;
  }
}

export async function updateStudio(updates: Partial<Studio>): Promise<Studio> {
  const response = await fetch(`${API_BASE_URL}/api/studio`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Failed to update studio');
  const data = await response.json() as { studio: Studio };
  return data.studio;
}
