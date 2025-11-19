-- Migration: Remove section_id dependency from artworks table
-- This creates a clean artworks table with only collection_id

-- Step 1: Create new clean table structure
CREATE TABLE artworks_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    year INTEGER,
    technique TEXT,
    dimensions TEXT,
    image_url TEXT,
    collection_id INTEGER,
    order_index INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE
);

-- Step 2: Copy all data from old table (mapping to new structure)
INSERT INTO artworks_new (id, title, year, technique, dimensions, image_url, collection_id, order_index, is_visible, created_at, updated_at)
SELECT id, title, year, technique, dimensions, image_url, collection_id, order_index, is_visible, created_at, updated_at
FROM artworks;

-- Step 3: Drop old table
DROP TABLE artworks;

-- Step 4: Rename new table to artworks
ALTER TABLE artworks_new RENAME TO artworks;

-- Optional: Drop sections table if no longer needed
-- DROP TABLE sections;
