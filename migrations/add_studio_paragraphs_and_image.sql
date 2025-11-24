-- Add paragraph fields and image_url to studio table
ALTER TABLE studio ADD COLUMN paragraph1_it TEXT;
ALTER TABLE studio ADD COLUMN paragraph1_en TEXT;
ALTER TABLE studio ADD COLUMN paragraph1_es TEXT;
ALTER TABLE studio ADD COLUMN paragraph1_fr TEXT;
ALTER TABLE studio ADD COLUMN paragraph1_ja TEXT;
ALTER TABLE studio ADD COLUMN paragraph1_zh TEXT;
ALTER TABLE studio ADD COLUMN paragraph1_zh_tw TEXT;

ALTER TABLE studio ADD COLUMN paragraph2_it TEXT;
ALTER TABLE studio ADD COLUMN paragraph2_en TEXT;
ALTER TABLE studio ADD COLUMN paragraph2_es TEXT;
ALTER TABLE studio ADD COLUMN paragraph2_fr TEXT;
ALTER TABLE studio ADD COLUMN paragraph2_ja TEXT;
ALTER TABLE studio ADD COLUMN paragraph2_zh TEXT;
ALTER TABLE studio ADD COLUMN paragraph2_zh_tw TEXT;

ALTER TABLE studio ADD COLUMN paragraph3_it TEXT;
ALTER TABLE studio ADD COLUMN paragraph3_en TEXT;
ALTER TABLE studio ADD COLUMN paragraph3_es TEXT;
ALTER TABLE studio ADD COLUMN paragraph3_fr TEXT;
ALTER TABLE studio ADD COLUMN paragraph3_ja TEXT;
ALTER TABLE studio ADD COLUMN paragraph3_zh TEXT;
ALTER TABLE studio ADD COLUMN paragraph3_zh_tw TEXT;

ALTER TABLE studio ADD COLUMN paragraph4_it TEXT;
ALTER TABLE studio ADD COLUMN paragraph4_en TEXT;
ALTER TABLE studio ADD COLUMN paragraph4_es TEXT;
ALTER TABLE studio ADD COLUMN paragraph4_fr TEXT;
ALTER TABLE studio ADD COLUMN paragraph4_ja TEXT;
ALTER TABLE studio ADD COLUMN paragraph4_zh TEXT;
ALTER TABLE studio ADD COLUMN paragraph4_zh_tw TEXT;

ALTER TABLE studio ADD COLUMN image_url TEXT;

-- Migrate existing text_it content to paragraph1_it if it exists
UPDATE studio
SET paragraph1_it = text_it
WHERE text_it IS NOT NULL AND text_it != '' AND paragraph1_it IS NULL;
