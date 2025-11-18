/**
 * Exhibitions (Mostre) API Service
 * Gestisce le mostre/esibizioni dell'artista
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

export interface Exhibition {
  id: number;
  slug: string;
  title: string;
  subtitle?: string;
  location: string;
  date: string;
  description: string;
  info?: string;
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(exhibition),
  });
  if (!response.ok) throw new Error('Failed to create exhibition');
  const data = await response.json() as { exhibition: Exhibition };
  return data.exhibition;
}

export async function updateExhibition(id: number, updates: Partial<Exhibition>): Promise<Exhibition> {
  const response = await fetch(`${API_BASE_URL}/api/exhibitions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Failed to update exhibition');
  const data = await response.json() as { exhibition: Exhibition };
  return data.exhibition;
}

export async function deleteExhibition(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/exhibitions/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete exhibition');
}