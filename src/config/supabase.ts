import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xshskxspsgspdajmakvt.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzaHNreHNwc2dzcGRham1ha3Z0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NDgyMzcsImV4cCI6MjA2NzEyNDIzN30.wybhWB7gC1ToHtNM-CGR2xXTpUfvMpjiuCF598Rsun0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for the collections
export interface Artwork {
  id: number
  title: string
  description: string
  image_url?: string
  category: 'sculture' | 'dipinti' | 'installazioni' | 'opere-miste'
  created_at: string
  updated_at: string
}

// Functions to fetch data
export const getArtworksByCategory = async (category: string): Promise<Artwork[]> => {
  const { data, error } = await supabase
    .from('artworks')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching artworks:', error)
    return []
  }

  return data || []
}

export const getAllArtworks = async (): Promise<Artwork[]> => {
  const { data, error } = await supabase
    .from('artworks')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all artworks:', error)
    return []
  }

  return data || []
} 