/**
 * Biography API Service
 * Gestisce la biografia dell'artista
 */

// In development, use empty string to leverage Vite proxy
// In production, set VITE_API_URL env var to the deployed worker URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const API_KEY = import.meta.env.VITE_API_KEY || '';

// Helper to add authentication headers
function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (API_KEY) {
    headers['Authorization'] = `Bearer ${API_KEY}`;
  }

  return headers;
}

export interface Biography {
  id: number;
  text_it: string;
  text_en?: string;
  text_es?: string;
  text_fr?: string;
  text_ja?: string;
  text_zh?: string;
  text_zh_tw?: string;
  content_version: number;
  translations_version: number;
  created_at: string;
  updated_at: string;
}

export async function getBiography(): Promise<Biography | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/biography`);
    if (!response.ok) {
      if (response.status === 404) {
        return null; // No biography found
      }
      throw new Error('Failed to fetch biography');
    }
    const data = await response.json() as { biography: Biography };
    return data.biography;
  } catch (error) {
    console.error('Error fetching biography:', error);
    return null;
  }
}

export async function updateBiography(updates: Partial<Biography>): Promise<Biography> {
  const response = await fetch(`${API_BASE_URL}/api/biography`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Failed to update biography');
  const data = await response.json() as { biography: Biography };
  return data.biography;
}
