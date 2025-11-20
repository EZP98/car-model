-- Migration: Add detailed_description field to collections table
-- Date: 2025-11-20
-- Description: Adds a new detailed_description field for the "Il Perché di Questa Collezione" section

-- =============================================
-- Collections Table - Add detailed_description
-- =============================================

-- Add detailed_description column for base (Italian)
ALTER TABLE collections ADD COLUMN detailed_description TEXT;

-- Add translation columns for all supported languages
ALTER TABLE collections ADD COLUMN detailed_description_it TEXT;
ALTER TABLE collections ADD COLUMN detailed_description_en TEXT;
ALTER TABLE collections ADD COLUMN detailed_description_es TEXT;
ALTER TABLE collections ADD COLUMN detailed_description_fr TEXT;
ALTER TABLE collections ADD COLUMN detailed_description_ja TEXT;
ALTER TABLE collections ADD COLUMN detailed_description_zh TEXT;
ALTER TABLE collections ADD COLUMN detailed_description_zh_tw TEXT;

-- Set a default value for existing collections (optional - can be updated later from backoffice)
UPDATE collections
SET detailed_description_it = 'Questa serie di opere nasce da una profonda riflessione sulla materialità e la trasformazione. Ogni quadro rappresenta un dialogo silenzioso tra l''artista e la tela, dove il colore diventa veicolo di emozioni non dette e la forma si fa portavoce di un linguaggio universale che trascende le parole. L''intento è quello di creare uno spazio contemplativo dove l''osservatore possa ritrovare frammenti di sé stesso riflessi nelle texture e nelle cromie, invitandolo a una lettura personale e intima dell''opera. La collezione si propone come un viaggio attraverso stati d''animo e percezioni, dove ogni pennellata è testimonianza di un momento vissuto e ogni composizione diventa finestra su mondi interiori inesplorati.'
WHERE detailed_description_it IS NULL;

UPDATE collections
SET detailed_description = detailed_description_it
WHERE detailed_description IS NULL;

-- Note: English and other language translations will be added from the backoffice or through separate migrations
