-- Migration: Add ES, FR, JA, ZH translation columns
-- Date: 2025-11-19

-- =============================================
-- Collections Table - Additional Languages
-- =============================================

ALTER TABLE collections ADD COLUMN title_es TEXT;
ALTER TABLE collections ADD COLUMN title_fr TEXT;
ALTER TABLE collections ADD COLUMN title_ja TEXT;
ALTER TABLE collections ADD COLUMN title_zh TEXT;

ALTER TABLE collections ADD COLUMN description_es TEXT;
ALTER TABLE collections ADD COLUMN description_fr TEXT;
ALTER TABLE collections ADD COLUMN description_ja TEXT;
ALTER TABLE collections ADD COLUMN description_zh TEXT;

-- =============================================
-- Exhibitions Table - Additional Languages
-- =============================================

ALTER TABLE exhibitions ADD COLUMN title_es TEXT;
ALTER TABLE exhibitions ADD COLUMN title_fr TEXT;
ALTER TABLE exhibitions ADD COLUMN title_ja TEXT;
ALTER TABLE exhibitions ADD COLUMN title_zh TEXT;

ALTER TABLE exhibitions ADD COLUMN subtitle_es TEXT;
ALTER TABLE exhibitions ADD COLUMN subtitle_fr TEXT;
ALTER TABLE exhibitions ADD COLUMN subtitle_ja TEXT;
ALTER TABLE exhibitions ADD COLUMN subtitle_zh TEXT;

ALTER TABLE exhibitions ADD COLUMN description_es TEXT;
ALTER TABLE exhibitions ADD COLUMN description_fr TEXT;
ALTER TABLE exhibitions ADD COLUMN description_ja TEXT;
ALTER TABLE exhibitions ADD COLUMN description_zh TEXT;

ALTER TABLE exhibitions ADD COLUMN info_es TEXT;
ALTER TABLE exhibitions ADD COLUMN info_fr TEXT;
ALTER TABLE exhibitions ADD COLUMN info_ja TEXT;
ALTER TABLE exhibitions ADD COLUMN info_zh TEXT;

ALTER TABLE exhibitions ADD COLUMN location_es TEXT;
ALTER TABLE exhibitions ADD COLUMN location_fr TEXT;
ALTER TABLE exhibitions ADD COLUMN location_ja TEXT;
ALTER TABLE exhibitions ADD COLUMN location_zh TEXT;

-- =============================================
-- Critics Table - Additional Languages
-- =============================================
-- Critics già ha text_it e text_en, aggiungiamo le altre lingue

ALTER TABLE critics ADD COLUMN text_es TEXT;
ALTER TABLE critics ADD COLUMN text_fr TEXT;
ALTER TABLE critics ADD COLUMN text_ja TEXT;
ALTER TABLE critics ADD COLUMN text_zh TEXT;
