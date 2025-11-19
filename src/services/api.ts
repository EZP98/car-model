/**
 * API Service per comunicare con Cloudflare Workers
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

// Types
export interface Artwork {
  id: number;
  title: string;
  description?: string;
  image_url?: string;
  section_id: number;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Section {
  id: number;
  name: string;
  slug: string;
  description?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface ContentBlock {
  id: number;
  key: string;
  title?: string;
  content?: string;
  image_url?: string;
  updated_at: string;
}

// API Functions

// ========== ARTWORKS ==========

export async function getArtworks(sectionId?: number): Promise<Artwork[]> {
  try {
    const url = sectionId
      ? `${API_BASE_URL}/api/artworks?section_id=${sectionId}`
      : `${API_BASE_URL}/api/artworks`;

    const response = await fetch(url, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch artworks');
    const data = await response.json() as { artworks: Artwork[] };
    console.log('[api] Artworks loaded:', data.artworks?.length || 0);
    return data.artworks;
  } catch (error) {
    console.error('[api] Error fetching artworks:', error);
    return [];
  }
}

export async function getArtwork(id: number): Promise<Artwork> {
  const response = await fetch(`${API_BASE_URL}/api/artworks/${id}`);
  if (!response.ok) throw new Error('Failed to fetch artwork');
  const data = await response.json() as { artwork: Artwork };
  return data.artwork;
}

export async function createArtwork(artwork: {
  title: string;
  description?: string;
  image_url?: string;
  section_id: number;
  order_index?: number;
}): Promise<Artwork> {
  const response = await fetch(`${API_BASE_URL}/api/artworks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(artwork),
  });
  if (!response.ok) throw new Error('Failed to create artwork');
  const data = await response.json() as { artwork: Artwork };
  return data.artwork;
}

export async function updateArtwork(id: number, artwork: {
  title?: string;
  description?: string;
  image_url?: string;
  section_id?: number;
  order_index?: number;
}): Promise<Artwork> {
  const response = await fetch(`${API_BASE_URL}/api/artworks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(artwork),
  });
  if (!response.ok) throw new Error('Failed to update artwork');
  const data = await response.json() as { artwork: Artwork };
  return data.artwork;
}

export async function deleteArtwork(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/artworks/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete artwork');
}

// ========== SECTIONS ==========

export async function getSections(): Promise<Section[]> {
  const response = await fetch(`${API_BASE_URL}/api/sections`);
  if (!response.ok) throw new Error('Failed to fetch sections');
  const data = await response.json() as { sections: Section[] };
  return data.sections;
}

export async function getSection(id: number): Promise<Section> {
  const response = await fetch(`${API_BASE_URL}/api/sections/${id}`);
  if (!response.ok) throw new Error('Failed to fetch section');
  const data = await response.json() as { section: Section };
  return data.section;
}

export async function getSectionArtworks(id: number): Promise<Artwork[]> {
  const response = await fetch(`${API_BASE_URL}/api/sections/${id}/artworks`);
  if (!response.ok) throw new Error('Failed to fetch section artworks');
  const data = await response.json() as { artworks: Artwork[] };
  return data.artworks;
}

export async function createSection(section: {
  name: string;
  slug: string;
  description?: string;
  order_index?: number;
}): Promise<Section> {
  const response = await fetch(`${API_BASE_URL}/api/sections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(section),
  });
  if (!response.ok) throw new Error('Failed to create section');
  const data = await response.json() as { section: Section };
  return data.section;
}

export async function updateSection(id: number, section: {
  name?: string;
  slug?: string;
  description?: string;
  order_index?: number;
}): Promise<Section> {
  const response = await fetch(`${API_BASE_URL}/api/sections/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(section),
  });
  if (!response.ok) throw new Error('Failed to update section');
  const data = await response.json() as { section: Section };
  return data.section;
}

export async function deleteSection(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/sections/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete section');
}

// ========== CONTENT BLOCKS ==========

export async function getContentBlocks(): Promise<ContentBlock[]> {
  const response = await fetch(`${API_BASE_URL}/api/content`);
  if (!response.ok) throw new Error('Failed to fetch content blocks');
  const data = await response.json() as { content: ContentBlock[] };
  return data.content;
}

export async function getContentBlock(key: string): Promise<ContentBlock> {
  const response = await fetch(`${API_BASE_URL}/api/content/${key}`);
  if (!response.ok) throw new Error('Failed to fetch content block');
  const data = await response.json() as { content: ContentBlock };
  return data.content;
}

export async function updateContentBlock(key: string, content: {
  title?: string;
  content?: string;
  image_url?: string;
}): Promise<ContentBlock> {
  const response = await fetch(`${API_BASE_URL}/api/content/${key}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(content),
  });
  if (!response.ok) throw new Error('Failed to update content block');
  const data = await response.json() as { content: ContentBlock };
  return data.content;
}

// ========== IMAGE UPLOAD ==========

export async function uploadImage(file: File): Promise<{ url: string; filename: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) throw new Error('Failed to upload image');
  const data = await response.json() as { url: string; filename: string };
  return { url: data.url, filename: data.filename };
}

// ========== NEWSLETTER ==========

export interface NewsletterSubscriber {
  id: number;
  email: string;
  subscribed_at: string;
  ip_address?: string;
  user_agent?: string;
}

export async function subscribeToNewsletter(email: string): Promise<{ message: string; email?: string; alreadySubscribed?: boolean }> {
  const response = await fetch(`${API_BASE_URL}/api/newsletter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) throw new Error('Failed to subscribe to newsletter');
  const data = await response.json() as { message: string; email?: string; alreadySubscribed?: boolean };
  return data;
}

export async function getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  const response = await fetch(`${API_BASE_URL}/api/newsletter`);
  if (!response.ok) throw new Error('Failed to fetch newsletter subscribers');
  const data = await response.json() as { subscribers: NewsletterSubscriber[] };
  return data.subscribers;
}

export async function deleteNewsletterSubscriber(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/newsletter/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete newsletter subscriber');
}
