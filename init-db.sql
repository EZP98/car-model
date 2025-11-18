-- Create collections table
CREATE TABLE IF NOT EXISTS collections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    order_index INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create artworks table
CREATE TABLE IF NOT EXISTS artworks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    collection_id INTEGER,
    title TEXT NOT NULL,
    year INTEGER,
    technique TEXT,
    dimensions TEXT,
    image_url TEXT,
    order_index INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (collection_id) REFERENCES collections(id)
);

-- Create exhibitions table
CREATE TABLE IF NOT EXISTS exhibitions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    location TEXT,
    date TEXT,
    description TEXT,
    info TEXT,
    website TEXT,
    image_url TEXT,
    order_index INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create critics table
CREATE TABLE IF NOT EXISTS critics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT,
    text TEXT,
    text_it TEXT,
    text_en TEXT,
    order_index INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sections table
CREATE TABLE IF NOT EXISTS sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    order_index INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default collections
INSERT INTO collections (slug, title, description, image_url, order_index, is_visible) VALUES
    ('opera-5', 'OPERA 5', 'Opere scultoree che esplorano la materia e la forma attraverso l''arte contemporanea', '/DSCF3759.jpg', 1, 1),
    ('opera-6', 'OPERA 6', 'Opere scultoree che esplorano la materia e la forma attraverso l''arte contemporanea', '/DSCF9079.jpg', 2, 1),
    ('opera-7', 'OPERA 7', 'Opere scultoree che esplorano la materia e la forma attraverso l''arte contemporanea', '/DSCF2104.jpg', 3, 1),
    ('opera-8', 'OPERA 8', 'Opere scultoree che esplorano la materia e la forma attraverso l''arte contemporanea', '/DSCF2012.jpg', 4, 1);