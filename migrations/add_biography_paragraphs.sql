-- Add paragraph fields to biography table
ALTER TABLE biography ADD COLUMN paragraph1_it TEXT;
ALTER TABLE biography ADD COLUMN paragraph1_en TEXT;
ALTER TABLE biography ADD COLUMN paragraph1_es TEXT;
ALTER TABLE biography ADD COLUMN paragraph1_fr TEXT;
ALTER TABLE biography ADD COLUMN paragraph1_ja TEXT;
ALTER TABLE biography ADD COLUMN paragraph1_zh TEXT;
ALTER TABLE biography ADD COLUMN paragraph1_zh_tw TEXT;

ALTER TABLE biography ADD COLUMN paragraph2_it TEXT;
ALTER TABLE biography ADD COLUMN paragraph2_en TEXT;
ALTER TABLE biography ADD COLUMN paragraph2_es TEXT;
ALTER TABLE biography ADD COLUMN paragraph2_fr TEXT;
ALTER TABLE biography ADD COLUMN paragraph2_ja TEXT;
ALTER TABLE biography ADD COLUMN paragraph2_zh TEXT;
ALTER TABLE biography ADD COLUMN paragraph2_zh_tw TEXT;

ALTER TABLE biography ADD COLUMN paragraph3_it TEXT;
ALTER TABLE biography ADD COLUMN paragraph3_en TEXT;
ALTER TABLE biography ADD COLUMN paragraph3_es TEXT;
ALTER TABLE biography ADD COLUMN paragraph3_fr TEXT;
ALTER TABLE biography ADD COLUMN paragraph3_ja TEXT;
ALTER TABLE biography ADD COLUMN paragraph3_zh TEXT;
ALTER TABLE biography ADD COLUMN paragraph3_zh_tw TEXT;

ALTER TABLE biography ADD COLUMN paragraph4_it TEXT;
ALTER TABLE biography ADD COLUMN paragraph4_en TEXT;
ALTER TABLE biography ADD COLUMN paragraph4_es TEXT;
ALTER TABLE biography ADD COLUMN paragraph4_fr TEXT;
ALTER TABLE biography ADD COLUMN paragraph4_ja TEXT;
ALTER TABLE biography ADD COLUMN paragraph4_zh TEXT;
ALTER TABLE biography ADD COLUMN paragraph4_zh_tw TEXT;

-- Migrate existing text_it content to paragraph fields (split by double newlines)
-- This would need to be done programmatically, but we'll do it manually for now
-- The text_it field will be kept for backward compatibility but paragraph fields will be the new source
