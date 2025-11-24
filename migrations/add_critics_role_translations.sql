-- Migration: Add multilingual role fields to critics table
-- Date: 2025-11-24
-- Purpose: Add role_it, role_en, role_es, role_fr, role_ja, role_zh, role_zh_tw fields

-- Add new multilingual role columns
ALTER TABLE critics ADD COLUMN role_it TEXT;
ALTER TABLE critics ADD COLUMN role_en TEXT;
ALTER TABLE critics ADD COLUMN role_es TEXT;
ALTER TABLE critics ADD COLUMN role_fr TEXT;
ALTER TABLE critics ADD COLUMN role_ja TEXT;
ALTER TABLE critics ADD COLUMN role_zh TEXT;
ALTER TABLE critics ADD COLUMN role_zh_tw TEXT;

-- Copy existing role to role_it (Italian is the source language)
UPDATE critics SET role_it = role WHERE role_it IS NULL AND role IS NOT NULL;
