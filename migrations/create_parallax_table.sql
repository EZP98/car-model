-- Migration: Create Parallax Table
-- Purpose: Store parallax section texts with multilingual support

CREATE TABLE IF NOT EXISTS parallax (
  id INTEGER PRIMARY KEY CHECK (id = 1), -- Solo un record

  -- Immagine
  image_url TEXT,

  -- Testo superiore (multilingua)
  text_top_it TEXT,
  text_top_en TEXT,
  text_top_es TEXT,
  text_top_fr TEXT,
  text_top_ja TEXT,
  text_top_zh TEXT,
  text_top_zh_tw TEXT,

  -- Testo inferiore (multilingua)
  text_bottom_it TEXT,
  text_bottom_en TEXT,
  text_bottom_es TEXT,
  text_bottom_fr TEXT,
  text_bottom_ja TEXT,
  text_bottom_zh TEXT,
  text_bottom_zh_tw TEXT,

  -- Versioning per tracking traduzioni
  content_version INTEGER NOT NULL DEFAULT 1,
  translations_version INTEGER NOT NULL DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserisci i testi originali
INSERT INTO parallax (
  id,
  image_url,
  text_top_it,
  text_bottom_it,
  content_version,
  translations_version
) VALUES (
  1,
  '/parallax-image.jpg',
  'Parto da un''immagine per stimolare l''osservatore a porsi delle domande, andando oltre',
  'Giustizia attraverso conoscenza e memoria',
  1,
  0
);
