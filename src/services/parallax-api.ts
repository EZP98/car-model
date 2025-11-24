/**
 * Parallax API Service
 * Gestisce i testi e l'immagine della sezione parallax
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

export interface Parallax {
  id: number;
  image_url: string | null;

  // Testo superiore
  text_top_it: string | null;
  text_top_en: string | null;
  text_top_es: string | null;
  text_top_fr: string | null;
  text_top_ja: string | null;
  text_top_zh: string | null;
  text_top_zh_tw: string | null;

  // Testo inferiore
  text_bottom_it: string | null;
  text_bottom_en: string | null;
  text_bottom_es: string | null;
  text_bottom_fr: string | null;
  text_bottom_ja: string | null;
  text_bottom_zh: string | null;
  text_bottom_zh_tw: string | null;

  content_version: number;
  translations_version: number;
  created_at: string;
  updated_at: string;
}

export async function getParallax(): Promise<Parallax | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/parallax`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch parallax');
    }
    const data = await response.json() as { parallax: Parallax };
    return data.parallax;
  } catch (error) {
    console.error('Error fetching parallax:', error);
    return null;
  }
}

export async function updateParallax(updates: Partial<Parallax>): Promise<Parallax> {
  const response = await fetch(`${API_BASE_URL}/api/parallax`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Failed to update parallax');
  const data = await response.json() as { parallax: Parallax };
  return data.parallax;
}
