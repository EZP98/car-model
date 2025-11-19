-- Migration: Add Traditional Chinese (zh_tw) columns
-- Date: 2025-11-19
-- _zh = Simplified Chinese (简体中文)
-- _zh_tw = Traditional Chinese (繁體中文)

-- =============================================
-- Collections Table - Traditional Chinese
-- =============================================

ALTER TABLE collections ADD COLUMN title_zh_tw TEXT;
ALTER TABLE collections ADD COLUMN description_zh_tw TEXT;

-- =============================================
-- Exhibitions Table - Traditional Chinese
-- =============================================

ALTER TABLE exhibitions ADD COLUMN title_zh_tw TEXT;
ALTER TABLE exhibitions ADD COLUMN subtitle_zh_tw TEXT;
ALTER TABLE exhibitions ADD COLUMN description_zh_tw TEXT;
ALTER TABLE exhibitions ADD COLUMN info_zh_tw TEXT;
ALTER TABLE exhibitions ADD COLUMN location_zh_tw TEXT;

-- =============================================
-- Critics Table - Traditional Chinese
-- =============================================

ALTER TABLE critics ADD COLUMN text_zh_tw TEXT;
