-- Schema completo per database D1 - ALF Portfolio
-- Database: alf-portfolio-db

-- ========== TABELLE ESISTENTI ==========

-- Tabella per le sezioni/serie (es: "Name series", "Sculture", etc.)
CREATE TABLE IF NOT EXISTS sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabella per le opere d'arte
CREATE TABLE IF NOT EXISTS artworks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  section_id INTEGER NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
);

-- Tabella per i contenuti statici
CREATE TABLE IF NOT EXISTS content_blocks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  title TEXT,
  content TEXT,
  image_url TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ========== NUOVE TABELLE ==========

-- Tabella per le mostre/esposizioni
CREATE TABLE IF NOT EXISTS exhibitions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  location TEXT NOT NULL,
  date TEXT NOT NULL, -- formato: "3-24 Agosto 2025" o "14 Marzo 2024"
  description TEXT,
  info TEXT, -- informazioni aggiuntive, orari, etc.
  website TEXT, -- URL del sito della mostra se presente
  image_url TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabella per i critici
CREATE TABLE IF NOT EXISTS critics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabella per i testi critici (multilingua)
CREATE TABLE IF NOT EXISTS critic_texts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  critic_id INTEGER NOT NULL,
  language TEXT NOT NULL DEFAULT 'it', -- it, en, es, fr, ja, zh, zh-TW
  text TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (critic_id) REFERENCES critics(id) ON DELETE CASCADE,
  UNIQUE(critic_id, language)
);

-- Tabella per le collezioni
CREATE TABLE IF NOT EXISTS collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabella per newsletter subscribers (già esistente nel Content.tsx)
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT 1
);

-- ========== INDICI PER PERFORMANCE ==========

CREATE INDEX IF NOT EXISTS idx_artworks_section ON artworks(section_id);
CREATE INDEX IF NOT EXISTS idx_artworks_order ON artworks(order_index);
CREATE INDEX IF NOT EXISTS idx_sections_order ON sections(order_index);
CREATE INDEX IF NOT EXISTS idx_exhibitions_order ON exhibitions(order_index);
CREATE INDEX IF NOT EXISTS idx_exhibitions_visible ON exhibitions(is_visible);
CREATE INDEX IF NOT EXISTS idx_critics_order ON critics(order_index);
CREATE INDEX IF NOT EXISTS idx_critics_visible ON critics(is_visible);
CREATE INDEX IF NOT EXISTS idx_critic_texts_language ON critic_texts(language);
CREATE INDEX IF NOT EXISTS idx_collections_order ON collections(order_index);
CREATE INDEX IF NOT EXISTS idx_collections_visible ON collections(is_visible);

-- ========== DATI DI MIGRAZIONE ==========

-- Inserimento collezioni (OPERA 5-8)
INSERT INTO collections (slug, title, description, image_url, order_index) VALUES
  ('opera-5', 'OPERA 5', 'Opere scultoree che esplorano la materia e la forma attraverso l''arte contemporanea', '/DSCF3759.jpg', 1),
  ('opera-6', 'OPERA 6', 'Opere scultoree che esplorano la materia e la forma attraverso l''arte contemporanea', '/DSCF9079.jpg', 2),
  ('opera-7', 'OPERA 7', 'Opere scultoree che esplorano la materia e la forma attraverso l''arte contemporanea', '/DSCF2104.jpg', 3),
  ('opera-8', 'OPERA 8', 'Opere scultoree che esplorano la materia e la forma attraverso l''arte contemporanea', '/DSCF2012.jpg', 4);

-- Inserimento mostre
INSERT INTO exhibitions (slug, title, subtitle, location, date, description, info, website, order_index) VALUES
  ('cenerentola', 'CENERENTOLA', 'Personale di Adele Lo Feudo', 'Palazzo delle Prigioni Vecchie, Perugia', '23 Novembre 2024', 'Il significato del dipinto di Adele Lo Feudo risiede nel celebrare e promuovere l''immaginazione come risorsa indispensabile del sentire intimo.', 'Fino al 23 novembre 2024, dalle ore 17:30 alle ore 19:30 tutti i giorni, mattina su appuntamento. Escluso il lunedì. Chiusa il 1 novembre.', NULL, 1),
  ('tutt-uno', 'TUTT''UNO CON L''OPERA', 'Personale di Adele Lo Feudo', 'Sala delle Cannoniere della Rocca Paolina, Perugia', '2 Marzo 2024', 'Una mostra che esplora l''unità tra l''artista e la sua opera, dove ogni pezzo racconta una storia di armonia e connessione profonda con la materia.', 'Inaugurazione della mostra Giovedì 14 Marzo 2024, ore 18:00. Sarà presente l''Assessore alla Cultura del Comune di Perugia, Leonardo Varasano. Orari di apertura 15:30 - 19:30. Sabato e Domenica 10:30 - 13:30 / 16:00 - 19:30', NULL, 2),
  ('ritorno', 'RITORNO', 'Personale di Adele Lo Feudo', 'Museo a Cielo Aperto di Camo (CN)', '3-24 Agosto 2025', 'Un viaggio attraverso l''origine e il ritorno, dove l''artista esplora le radici della propria espressione artistica in un dialogo continuo tra passato e presente.', 'Vernissage 3 agosto, ore 10:30. In esposizione fino al 24 agosto 2025', 'https://ritorno.adelelofeudo.com/', 3),
  ('fornace', 'Fornace Pasquinucci', 'Mostra Collettiva', 'Fornace Pasquinucci, Camogli (Perugia)', '23 Luglio 2023', 'Una mostra collettiva che celebra la ceramica contemporanea e l''arte del fuoco.', 'Dal 23 luglio al 31 agosto 2023. Orari: Mercoledì - Domenica 16:00 - 20:00', NULL, 4);

-- Inserimento critici
INSERT INTO critics (name, role, order_index) VALUES
  ('Angelo Leidi', 'Critico d''Arte', 1),
  ('Leonardo Varasano', 'Assessore alla Cultura del Comune di Perugia', 2),
  ('Celeste Morè', 'Critico d''Arte', 3),
  ('Marco Botti', 'Giornalista Culturale', 4),
  ('Helen Pankhurst', 'Nipote di Emmeline Pankhurst, leader delle Suffragette', 5),
  ('Alessandra Boldreghini', 'Assessore alla Cultura del Comune di Morro d''Alba', 6),
  ('Donato Antonio Loscalzo', 'Poeta e Professore di Letteratura e Storia', 7),
  ('Alessandra Primicerio', 'Critico d''Arte', 8),
  ('Emidio De Albentiis', 'Direttore Accademia Belle Arti di Perugia', 9);

-- Nota: I testi dei critici dovranno essere inseriti dalla tabella critic_texts
-- con INSERT separati per ogni lingua, prendendoli dal file translations.ts