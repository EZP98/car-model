-- Migration: Create Studio Table
-- Purpose: Store studio description with multilingual support

CREATE TABLE IF NOT EXISTS studio (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- Italian (source content)
  text_it TEXT NOT NULL,

  -- Translations
  text_en TEXT,
  text_es TEXT,
  text_fr TEXT,
  text_ja TEXT,
  text_zh TEXT,
  text_zh_tw TEXT,

  -- Versioning for translation tracking
  content_version INTEGER NOT NULL DEFAULT 1,
  translations_version INTEGER NOT NULL DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial empty studio description
INSERT INTO studio (
  text_it,
  content_version,
  translations_version
) VALUES (
  'Descrizione dello studio.',
  1,
  0
);
