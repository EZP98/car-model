-- Migration: Copy existing text to text_it
-- Date: 2025-11-19

UPDATE critics SET text_it = text WHERE text_it IS NULL AND text IS NOT NULL;
