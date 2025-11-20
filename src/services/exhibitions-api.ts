/**
 * Exhibitions (Mostre) API Service
 * Gestisce le mostre/esibizioni dell'artista
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

export interface Exhibition {
  id: number;
  slug: string;
  title: string;
  subtitle?: string;
  location: string;
  date: string;
  description: string;
  info?: string;
  title_it?: string;
  title_en?: string;
  title_es?: string;
  title_fr?: string;
  title_ja?: string;
  title_zh?: string;
  title_zh_tw?: string;
  subtitle_it?: string;
  subtitle_en?: string;
  subtitle_es?: string;
  subtitle_fr?: string;
  subtitle_ja?: string;
  subtitle_zh?: string;
  subtitle_zh_tw?: string;
  description_it?: string;
  description_en?: string;
  description_es?: string;
  description_fr?: string;
  description_ja?: string;
  description_zh?: string;
  description_zh_tw?: string;
  location_it?: string;
  location_en?: string;
  location_es?: string;
  location_fr?: string;
  location_ja?: string;
  location_zh?: string;
  location_zh_tw?: string;
  info_it?: string;
  info_en?: string;
  info_es?: string;
  info_fr?: string;
  info_ja?: string;
  info_zh?: string;
  info_zh_tw?: string;
  website?: string;
  image_url?: string;
  order_index: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export async function getExhibitions(showAll = false): Promise<Exhibition[]> {
  try {
    const url = showAll
      ? `${API_BASE_URL}/api/exhibitions?all=true`
      : `${API_BASE_URL}/api/exhibitions`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch exhibitions');
    const data = await response.json() as { exhibitions: Exhibition[] };
    return data.exhibitions;
  } catch (error) {
    console.error('Error fetching exhibitions:', error);
    return [];
  }
}

export async function getExhibition(id: number): Promise<Exhibition> {
  const response = await fetch(`${API_BASE_URL}/api/exhibitions/${id}`);
  if (!response.ok) throw new Error('Failed to fetch exhibition');
  const data = await response.json() as { exhibition: Exhibition };
  return data.exhibition;
}

export async function createExhibition(exhibition: Omit<Exhibition, 'id' | 'created_at' | 'updated_at'>): Promise<Exhibition> {
  const response = await fetch(`${API_BASE_URL}/api/exhibitions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(exhibition),
  });
  if (!response.ok) throw new Error('Failed to create exhibition');
  const data = await response.json() as { exhibition: Exhibition };
  return data.exhibition;
}

export async function updateExhibition(id: number, updates: Partial<Exhibition>): Promise<Exhibition> {
  const response = await fetch(`${API_BASE_URL}/api/exhibitions/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Failed to update exhibition');
  const data = await response.json() as { exhibition: Exhibition };
  return data.exhibition;
}

export async function deleteExhibition(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/exhibitions/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete exhibition');
}