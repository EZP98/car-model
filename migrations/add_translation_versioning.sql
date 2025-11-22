-- Migration: Add Translation Versioning System
-- Purpose: Track when Italian content changes to detect outdated translations
--
-- How it works:
-- 1. content_version: Incremented whenever ANY Italian (_it) field is modified
-- 2. translations_version: Set to current content_version when translations are updated
-- 3. If translations_version < content_version, translations are OUTDATED
--
-- Example workflow:
-- 1. User creates collection with title_it = "Serie Spirito"
--    → content_version = 1, translations_version = 0
-- 2. Claude translates to other languages
--    → translations_version = 1 (now up to date)
-- 3. User edits title_it = "Nuova Serie Spirito"
--    → content_version = 2, translations_version = 1
--    → System detects: translations_version (1) < content_version (2) → OUTDATED!
-- 4. Claude re-translates
--    → translations_version = 2 (up to date again)

-- Add versioning to collections table
ALTER TABLE collections
ADD COLUMN content_version INTEGER NOT NULL DEFAULT 1;

ALTER TABLE collections
ADD COLUMN translations_version INTEGER NOT NULL DEFAULT 0;

-- Add versioning to critics table
ALTER TABLE critics
ADD COLUMN content_version INTEGER NOT NULL DEFAULT 1;

ALTER TABLE critics
ADD COLUMN translations_version INTEGER NOT NULL DEFAULT 0;

-- Add versioning to exhibitions table
ALTER TABLE exhibitions
ADD COLUMN content_version INTEGER NOT NULL DEFAULT 1;

ALTER TABLE exhibitions
ADD COLUMN translations_version INTEGER NOT NULL DEFAULT 0;

-- Initialize existing records
-- For records that already have translations, set translations_version = content_version
-- This marks them as "up to date" at the time of migration

-- Collections: Mark as translated if any non-IT translation exists
UPDATE collections
SET translations_version = content_version
WHERE title_en IS NOT NULL
   OR title_es IS NOT NULL
   OR title_fr IS NOT NULL
   OR title_ja IS NOT NULL
   OR title_zh IS NOT NULL
   OR title_zh_tw IS NOT NULL
   OR description_en IS NOT NULL
   OR description_es IS NOT NULL
   OR description_fr IS NOT NULL
   OR description_ja IS NOT NULL
   OR description_zh IS NOT NULL
   OR description_zh_tw IS NOT NULL
   OR detailed_description_en IS NOT NULL
   OR detailed_description_es IS NOT NULL
   OR detailed_description_fr IS NOT NULL
   OR detailed_description_ja IS NOT NULL
   OR detailed_description_zh IS NOT NULL
   OR detailed_description_zh_tw IS NOT NULL;

-- Critics: Mark as translated if any non-IT translation exists
UPDATE critics
SET translations_version = content_version
WHERE text_en IS NOT NULL
   OR text_es IS NOT NULL
   OR text_fr IS NOT NULL
   OR text_ja IS NOT NULL
   OR text_zh IS NOT NULL
   OR text_zh_tw IS NOT NULL;

-- Exhibitions: Mark as translated if any non-IT translation exists
UPDATE exhibitions
SET translations_version = content_version
WHERE title_en IS NOT NULL
   OR title_es IS NOT NULL
   OR title_fr IS NOT NULL
   OR title_ja IS NOT NULL
   OR title_zh IS NOT NULL
   OR title_zh_tw IS NOT NULL
   OR subtitle_en IS NOT NULL
   OR subtitle_es IS NOT NULL
   OR subtitle_fr IS NOT NULL
   OR subtitle_ja IS NOT NULL
   OR subtitle_zh IS NOT NULL
   OR subtitle_zh_tw IS NOT NULL
   OR description_en IS NOT NULL
   OR description_es IS NOT NULL
   OR description_fr IS NOT NULL
   OR description_ja IS NOT NULL
   OR description_zh IS NOT NULL
   OR description_zh_tw IS NOT NULL
   OR location_en IS NOT NULL
   OR location_es IS NOT NULL
   OR location_fr IS NOT NULL
   OR location_ja IS NOT NULL
   OR location_zh IS NOT NULL
   OR location_zh_tw IS NOT NULL
   OR info_en IS NOT NULL
   OR info_es IS NOT NULL
   OR info_fr IS NOT NULL
   OR info_ja IS NOT NULL
   OR info_zh IS NOT NULL
   OR info_zh_tw IS NOT NULL;
