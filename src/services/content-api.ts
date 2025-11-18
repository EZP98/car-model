/**
 * Content API Service
 * Gestisce le chiamate API per collezioni, mostre e critica
 */

// Configurazione API (usa la stessa configurazione base di api.ts)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787/api';

// Helper per gestire le richieste
async function fetchAPI(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

// ========== TYPES ==========

export interface Collection {
  id: number;
  slug: string;
  title: string;
  description?: string;
  image_url: string;
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
  description?: string;
  info?: string;
  website?: string;
  image_url?: string;
  order_index: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface Critic {
  id: number;
  name: string;
  role: string;
  text?: string; // Quando si richiede una lingua specifica
  texts?: { [key: string]: string }; // Quando si richiedono tutti i testi
  language?: string;
  order_index: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

// ========== COLLECTIONS API ==========

export async function getCollections(): Promise<Collection[]> {
  const data = await fetchAPI('/collections');
  return data.collections;
}

export async function getCollection(slug: string): Promise<Collection> {
  const data = await fetchAPI(`/collections/${slug}`);
  return data.collection;
}

export async function createCollection(collection: Omit<Collection, 'id' | 'created_at' | 'updated_at' | 'is_visible'>): Promise<Collection> {
  const data = await fetchAPI('/collections', {
    method: 'POST',
    body: JSON.stringify(collection),
  });
  return data.collection;
}

export async function updateCollection(id: number, updates: Partial<Collection>): Promise<Collection> {
  const data = await fetchAPI(`/collections/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return data.collection;
}

export async function deleteCollection(id: number): Promise<void> {
  await fetchAPI(`/collections/${id}`, {
    method: 'DELETE',
  });
}

// ========== EXHIBITIONS API ==========

export async function getExhibitions(): Promise<Exhibition[]> {
  const data = await fetchAPI('/exhibitions');
  return data.exhibitions;
}

export async function getExhibition(slug: string): Promise<Exhibition> {
  const data = await fetchAPI(`/exhibitions/${slug}`);
  return data.exhibition;
}

export async function createExhibition(exhibition: Omit<Exhibition, 'id' | 'created_at' | 'updated_at' | 'is_visible'>): Promise<Exhibition> {
  const data = await fetchAPI('/exhibitions', {
    method: 'POST',
    body: JSON.stringify(exhibition),
  });
  return data.exhibition;
}

export async function updateExhibition(id: number, updates: Partial<Exhibition>): Promise<Exhibition> {
  const data = await fetchAPI(`/exhibitions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return data.exhibition;
}

export async function deleteExhibition(id: number): Promise<void> {
  await fetchAPI(`/exhibitions/${id}`, {
    method: 'DELETE',
  });
}

// ========== CRITICS API ==========

export async function getCritics(language?: string): Promise<Critic[]> {
  const queryParams = language ? `?lang=${language}` : '';
  const data = await fetchAPI(`/critics${queryParams}`);
  return data.critics;
}

export async function getCritic(id: number, language?: string): Promise<Critic> {
  const queryParams = language ? `?lang=${language}` : '';
  const data = await fetchAPI(`/critics/${id}${queryParams}`);
  return data.critic;
}

export async function createCritic(critic: {
  name: string;
  role: string;
  order_index?: number;
  texts?: { [key: string]: string };
}): Promise<Critic> {
  const data = await fetchAPI('/critics', {
    method: 'POST',
    body: JSON.stringify(critic),
  });
  return data.critic;
}

export async function updateCritic(id: number, updates: {
  name?: string;
  role?: string;
  order_index?: number;
  is_visible?: boolean;
  texts?: { [key: string]: string };
}): Promise<Critic> {
  const data = await fetchAPI(`/critics/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return data.critic;
}

export async function deleteCritic(id: number): Promise<void> {
  await fetchAPI(`/critics/${id}`, {
    method: 'DELETE',
  });
}

// ========== NEWSLETTER API ==========

export interface NewsletterSubscriber {
  id: number;
  email: string;
  subscribed_at: string;
  is_active: boolean;
}

export async function getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  const data = await fetchAPI('/newsletter/subscribers');
  return data.subscribers;
}

export async function subscribeNewsletter(email: string): Promise<NewsletterSubscriber> {
  const data = await fetchAPI('/newsletter/subscribe', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  return data.subscriber;
}

export async function unsubscribeNewsletter(email: string): Promise<void> {
  await fetchAPI(`/newsletter/unsubscribe/${encodeURIComponent(email)}`, {
    method: 'DELETE',
  });
}