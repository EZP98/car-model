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

// Determina l'URL dell'API in base all'ambiente
const API_BASE_URL = import.meta.env.PROD
  ? 'https://alf-portfolio-api.eziopappalardo98.workers.dev'
  : 'http://localhost:8787';

// ========== HELPER FUNCTIONS ==========

async function fetchAPI(endpoint: string, options?: RequestInit): Promise<any> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  return response.json();
}

// ========== CRITICS API ==========

export async function getCritics(language?: string): Promise<Critic[]> {
  const data = await fetchAPI('/api/critics');
  return data.critics || [];
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
  const data = await fetchAPI('/api/exhibitions');
  return data.exhibitions || [];
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
