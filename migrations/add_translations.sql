-- Migration: Add translation columns to collections and exhibitions tables
-- Date: 2025-11-19

-- =============================================
-- Collections Table Translations
-- =============================================

-- Add new translation columns to collections
ALTER TABLE collections ADD COLUMN title_it TEXT;
ALTER TABLE collections ADD COLUMN title_en TEXT;
ALTER TABLE collections ADD COLUMN description_it TEXT;
ALTER TABLE collections ADD COLUMN description_en TEXT;

-- Migrate existing data to Italian columns
UPDATE collections SET title_it = title WHERE title_it IS NULL;
UPDATE collections SET description_it = description WHERE description_it IS NULL;

-- =============================================
-- Exhibitions Table Translations
-- =============================================

-- Add new translation columns to exhibitions
ALTER TABLE exhibitions ADD COLUMN title_it TEXT;
ALTER TABLE exhibitions ADD COLUMN title_en TEXT;
ALTER TABLE exhibitions ADD COLUMN subtitle_it TEXT;
ALTER TABLE exhibitions ADD COLUMN subtitle_en TEXT;
ALTER TABLE exhibitions ADD COLUMN description_it TEXT;
ALTER TABLE exhibitions ADD COLUMN description_en TEXT;
ALTER TABLE exhibitions ADD COLUMN info_it TEXT;
ALTER TABLE exhibitions ADD COLUMN info_en TEXT;
ALTER TABLE exhibitions ADD COLUMN location_it TEXT;
ALTER TABLE exhibitions ADD COLUMN location_en TEXT;

-- Migrate existing data to Italian columns
UPDATE exhibitions SET title_it = title WHERE title_it IS NULL;
UPDATE exhibitions SET subtitle_it = subtitle WHERE subtitle_it IS NULL;
UPDATE exhibitions SET description_it = description WHERE description_it IS NULL;
UPDATE exhibitions SET info_it = info WHERE info_it IS NULL;
UPDATE exhibitions SET location_it = location WHERE location_it IS NULL;

-- Note: English translations will be added separately
-- Old columns (title, description, etc.) will remain for backward compatibility
