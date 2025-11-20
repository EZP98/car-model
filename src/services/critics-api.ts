/**
 * Critics (Critica) API Service
 * Gestisce le recensioni e i critici
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

export interface Critic {
  id: number;
  name: string;
  role: string;
  text: string;
  text_it?: string;
  text_en?: string;
  text_es?: string;
  text_fr?: string;
  text_ja?: string;
  text_zh?: string;
  text_zh_tw?: string;
  order_index: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export async function getCritics(showAll = false): Promise<Critic[]> {
  try {
    const url = showAll
      ? `${API_BASE_URL}/api/critics?all=true`
      : `${API_BASE_URL}/api/critics`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch critics');
    const data = await response.json() as { critics: Critic[] };
    return data.critics;
  } catch (error) {
    console.error('Error fetching critics:', error);
    return [];
  }
}

export async function getCritic(id: number): Promise<Critic> {
  const response = await fetch(`${API_BASE_URL}/api/critics/${id}`);
  if (!response.ok) throw new Error('Failed to fetch critic');
  const data = await response.json() as { critic: Critic };
  return data.critic;
}

export async function createCritic(critic: Omit<Critic, 'id' | 'created_at' | 'updated_at'>): Promise<Critic> {
  const response = await fetch(`${API_BASE_URL}/api/critics`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(critic),
  });
  if (!response.ok) throw new Error('Failed to create critic');
  const data = await response.json() as { critic: Critic };
  return data.critic;
}

export async function updateCritic(id: number, updates: Partial<Critic>): Promise<Critic> {
  const response = await fetch(`${API_BASE_URL}/api/critics/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Failed to update critic');
  const data = await response.json() as { critic: Critic };
  return data.critic;
}

export async function deleteCritic(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/critics/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete critic');
}