-- Migration: Create translations table
-- Date: 2025-01-20
-- Description: Create a flexible translations table to handle all translatable content

CREATE TABLE IF NOT EXISTS translations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL,      -- 'collection', 'exhibition', 'critic', 'content_block', etc.
  entity_id INTEGER NOT NULL,     -- ID of the entity being translated
  field_name TEXT NOT NULL,       -- 'title', 'description', 'text', etc.
  language TEXT NOT NULL,         -- 'it', 'en', 'es', 'fr', 'ja', 'zh', 'zh-tw'
  value TEXT,                     -- The translated text
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(entity_type, entity_id, field_name, language)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_translations_entity ON translations(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_translations_language ON translations(language);
CREATE INDEX IF NOT EXISTS idx_translations_lookup ON translations(entity_type, entity_id, language);
