/**
 * Content API Service - Connesso al database D1 tramite Cloudflare Worker
 * Gestisce i dati per critici e mostre usando il backend API
 */

// ========== TYPES ==========

export interface Critic {
  id: number;
  name: string;
  role: string;
  text: string;
  text_it?: string;
  text_en?: string;
  order_index: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
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
  website?: string;
  image_url?: string;
  order_index: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

// ========== API CONFIGURATION ==========

// In development, use empty string to leverage Vite proxy
// In production, set VITE_API_URL env var to the deployed worker URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const API_KEY = import.meta.env.VITE_API_KEY || '';

// ========== HELPER FUNCTIONS ==========

async function fetchAPI(endpoint: string, options?: RequestInit): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    ...(options?.headers as Record<string, string>),
  };

  // Add auth header for write operations
  if (API_KEY && options?.method && ['POST', 'PUT', 'DELETE'].includes(options.method)) {
    headers['Authorization'] = `Bearer ${API_KEY}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  return response.json();
}

// ========== CRITICS API ==========

export async function getCritics(language?: string): Promise<Critic[]> {
  try {
    const data = await fetchAPI('/api/critics');
    console.log('[content-api] Critics loaded:', data.critics?.length || 0);
    return data.critics || [];
  } catch (error) {
    console.error('[content-api] Error fetching critics:', error);
    return [];
  }
}

export async function getCritic(id: number, language?: string): Promise<Critic> {
  const data = await fetchAPI(`/api/critics/${id}`);
  return data.critic;
}

export async function createCritic(critic: {
  name: string;
  role: string;
  text: string;
  text_it?: string;
  text_en?: string;
  order_index?: number;
  is_visible?: boolean;
}): Promise<Critic> {
  const data = await fetchAPI('/api/critics', {
    method: 'POST',
    body: JSON.stringify(critic),
  });
  return data.critic;
}

export async function updateCritic(id: number, updates: {
  name?: string;
  role?: string;
  text?: string;
  text_it?: string;
  text_en?: string;
  order_index?: number;
  is_visible?: boolean;
}): Promise<Critic> {
  const data = await fetchAPI(`/api/critics/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return data.critic;
}

export async function deleteCritic(id: number): Promise<void> {
  await fetchAPI(`/api/critics/${id}`, {
    method: 'DELETE',
  });
}

// ========== EXHIBITIONS API ==========

export async function getExhibitions(): Promise<Exhibition[]> {
  try {
    const data = await fetchAPI('/api/exhibitions');
    console.log('[content-api] Exhibitions loaded:', data.exhibitions?.length || 0);
    return data.exhibitions || [];
  } catch (error) {
    console.error('[content-api] Error fetching exhibitions:', error);
    return [];
  }
}

export async function getExhibition(slug: string): Promise<Exhibition> {
  const data = await fetchAPI(`/api/exhibitions/${slug}`);
  return data.exhibition;
}

export async function createExhibition(exhibition: {
  slug: string;
  title: string;
  subtitle?: string;
  location: string;
  date: string;
  description: string;
  info?: string;
  website?: string;
  image_url?: string;
  order_index?: number;
  is_visible?: boolean;
}): Promise<Exhibition> {
  const data = await fetchAPI('/api/exhibitions', {
    method: 'POST',
    body: JSON.stringify(exhibition),
  });
  return data.exhibition;
}

export async function updateExhibition(id: number, updates: Partial<Exhibition>): Promise<Exhibition> {
  const data = await fetchAPI(`/api/exhibitions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return data.exhibition;
}

export async function deleteExhibition(id: number): Promise<void> {
  await fetchAPI(`/api/exhibitions/${id}`, {
    method: 'DELETE',
  });
}
