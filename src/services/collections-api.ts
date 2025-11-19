/**
 * Collections API Service
 * Gestisce le collezioni (OPERA 5-8) che si vedono nel frontend
 */

const API_BASE_URL = import.meta.env.PROD
  ? 'https://alf-portfolio-api.eziopappalardo98.workers.dev'
  : 'http://localhost:8787';
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

export interface Collection {
  id: number;
  slug: string;
  title: string;
  description: string;
  image_url: string;
  order_index: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface Artwork {
  id: number;
  collection_id: number;
  title: string;
  year?: number;
  technique?: string;
  dimensions?: string;
  image_url?: string;
  order_index: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export async function getCollections(showAll = false): Promise<Collection[]> {
  try {
    const url = showAll
      ? `${API_BASE_URL}/api/collections?all=true`
      : `${API_BASE_URL}/api/collections`;
    const response = await fetch(url, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch collections');
    const data = await response.json() as { collections: Collection[] };
    console.log('[collections-api] Collections loaded:', data.collections?.length || 0);
    return data.collections;
  } catch (error) {
    console.error('[collections-api] Error fetching collections:', error);
    // Fallback to localStorage if API fails
    const COLLECTIONS_KEY = 'alf-collections';
    const stored = localStorage.getItem(COLLECTIONS_KEY);
    if (stored) {
      console.log('[collections-api] Using localStorage fallback');
      return JSON.parse(stored);
    }
    console.log('[collections-api] No collections found');
    return [];
  }
}

export async function getCollection(slug: string): Promise<Collection> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/collections/${slug}`);
    if (!response.ok) throw new Error('Failed to fetch collection');
    const data = await response.json() as { collection: Collection };
    return data.collection;
  } catch (error) {
    console.error('Error fetching collection:', error);
    // Fallback to localStorage if API fails
    const collections = await getCollections();
    const collection = collections.find(c => c.slug === slug);
    if (!collection) {
      throw new Error('Collection not found');
    }
    return collection;
  }
}

export async function getCollectionArtworks(collectionId: number): Promise<Artwork[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/artworks?collection_id=${collectionId}`);
    if (!response.ok) throw new Error('Failed to fetch artworks');
    const data = await response.json() as { artworks: Artwork[] };
    return data.artworks;
  } catch (error) {
    console.error('Error fetching artworks:', error);
    return [];
  }
}

export async function createCollection(collection: Omit<Collection, 'id' | 'created_at' | 'updated_at'>): Promise<Collection> {
  const response = await fetch(`${API_BASE_URL}/api/collections`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(collection),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})) as { message?: string; error?: string };
    const errorMessage = errorData.message || errorData.error || 'Failed to create collection';
    throw new Error(errorMessage);
  }
  const data = await response.json() as { collection: Collection };
  return data.collection;
}

export async function updateCollection(id: number, updates: Partial<Collection>): Promise<Collection> {
  const response = await fetch(`${API_BASE_URL}/api/collections/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Failed to update collection');
  const data = await response.json() as { collection: Collection };
  return data.collection;
}

export async function deleteCollection(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/collections/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete collection');
}