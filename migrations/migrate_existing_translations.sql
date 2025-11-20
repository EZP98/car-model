-- Migration: Migrate existing translations from columns to translations table
-- Date: 2025-01-20
-- Description: Move existing translation data from title_it, title_en, etc. columns to the new translations table

-- Migrate collection titles
INSERT OR IGNORE INTO translations (entity_type, entity_id, field_name, language, value)
SELECT 'collection', id, 'title', 'it', title_it FROM collections WHERE title_it IS NOT NULL AND title_it != '';

INSERT OR IGNORE INTO translations (entity_type, entity_id, field_name, language, value)
SELECT 'collection', id, 'title', 'en', title_en FROM collections WHERE title_en IS NOT NULL AND title_en != '';

INSERT OR IGNORE INTO translations (entity_type, entity_id, field_name, language, value)
SELECT 'collection', id, 'title', 'es', title_es FROM collections WHERE title_es IS NOT NULL AND title_es != '';

INSERT OR IGNORE INTO translations (entity_type, entity_id, field_name, language, value)
SELECT 'collection', id, 'title', 'fr', title_fr FROM collections WHERE title_fr IS NOT NULL AND title_fr != '';

INSERT OR IGNORE INTO translations (entity_type, entity_id, field_name, language, value)
SELECT 'collection', id, 'title', 'ja', title_ja FROM collections WHERE title_ja IS NOT NULL AND title_ja != '';

INSERT OR IGNORE INTO translations (entity_type, entity_id, field_name, language, value)
SELECT 'collection', id, 'title', 'zh', title_zh FROM collections WHERE title_zh IS NOT NULL AND title_zh != '';

INSERT OR IGNORE INTO translations (entity_type, entity_id, field_name, language, value)
SELECT 'collection', id, 'title', 'zh-tw', title_zh_tw FROM collections WHERE title_zh_tw IS NOT NULL AND title_zh_tw != '';

-- Migrate collection descriptions
INSERT OR IGNORE INTO translations (entity_type, entity_id, field_name, language, value)
SELECT 'collection', id, 'description', 'it', description_it FROM collections WHERE description_it IS NOT NULL AND description_it != '';

INSERT OR IGNORE INTO translations (entity_type, entity_id, field_name, language, value)
SELECT 'collection', id, 'description', 'en', description_en FROM collections WHERE description_en IS NOT NULL AND description_en != '';

INSERT OR IGNORE INTO translations (entity_type, entity_id, field_name, language, value)
SELECT 'collection', id, 'description', 'es', description_es FROM collections WHERE description_es IS NOT NULL AND description_es != '';

INSERT OR IGNORE INTO translations (entity_type, entity_id, field_name, language, value)
SELECT 'collection', id, 'description', 'fr', description_fr FROM collections WHERE description_fr IS NOT NULL AND description_fr != '';

INSERT OR IGNORE INTO translations (entity_type, entity_id, field_name, language, value)
SELECT 'collection', id, 'description', 'ja', description_ja FROM collections WHERE description_ja IS NOT NULL AND description_ja != '';

INSERT OR IGNORE INTO translations (entity_type, entity_id, field_name, language, value)
SELECT 'collection', id, 'description', 'zh', description_zh FROM collections WHERE description_zh IS NOT NULL AND description_zh != '';

INSERT OR IGNORE INTO translations (entity_type, entity_id, field_name, language, value)
SELECT 'collection', id, 'description', 'zh-tw', description_zh_tw FROM collections WHERE description_zh_tw IS NOT NULL AND description_zh_tw != '';

-- Migrate critic texts (currently only IT and EN)
INSERT OR IGNORE INTO translations (entity_type, entity_id, field_name, language, value)
SELECT 'critic', id, 'text', 'it', text_it FROM critics WHERE text_it IS NOT NULL AND text_it != '';

INSERT OR IGNORE INTO translations (entity_type, entity_id, field_name, language, value)
SELECT 'critic', id, 'text', 'en', text_en FROM critics WHERE text_en IS NOT NULL AND text_en != '';
