/**
 * ALF Portfolio API Worker
 * Gestisce CRUD per opere, sezioni e contenuti
 */

interface Env {
  DB: D1Database;
  IMAGES?: R2Bucket;
  API_KEY: string; // Secret API key for authentication
  AI?: any; // Cloudflare AI binding for translations
  ANTHROPIC_API_KEY?: string; // Anthropic API key for Claude translations
}

// Funzioni helper per CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Cache-Control, Pragma, Authorization',
};

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

// Authentication helper
function isAuthenticated(request: Request, env: Env): boolean {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return false;

  // Support both "Bearer TOKEN" and "TOKEN" formats
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.substring(7)
    : authHeader;

  return token === env.API_KEY;
}

function unauthorizedResponse() {
  return jsonResponse({ error: 'Unauthorized - Invalid or missing API key' }, 401);
}

// ========== TRANSLATION HELPERS ==========

interface Translation {
  entity_type: string;
  entity_id: number;
  field_name: string;
  language: string;
  value: string;
}

/**
 * Get all translations for a specific entity
 */
async function getTranslations(
  db: D1Database,
  entityType: string,
  entityId: number
): Promise<Record<string, any>> {
  const { results } = await db.prepare(
    'SELECT field_name, language, value FROM translations WHERE entity_type = ? AND entity_id = ?'
  ).bind(entityType, entityId).all();

  const translations: Record<string, any> = {};

  for (const row of results as any) {
    const key = `${row.field_name}_${row.language.replace('-', '_')}`;
    translations[key] = row.value;
  }

  return translations;
}

/**
 * Save or update translations for an entity
 */
async function saveTranslations(
  db: D1Database,
  entityType: string,
  entityId: number,
  translations: Record<string, any>
): Promise<void> {
  const languages = ['it', 'en', 'es', 'fr', 'ja', 'zh', 'zh-tw'];

  for (const [key, value] of Object.entries(translations)) {
    if (!value) continue;

    // Parse field name and language from key (e.g., "title_en" -> field="title", lang="en")
    const parts = key.split('_');
    const language = parts.pop();
    const fieldName = parts.join('_');

    // Normalize language code (zh_tw -> zh-tw)
    const normalizedLang = language === 'tw' ? 'zh-tw' : language;

    if (!languages.includes(normalizedLang || '')) continue;

    await db.prepare(
      `INSERT INTO translations (entity_type, entity_id, field_name, language, value, updated_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(entity_type, entity_id, field_name, language)
       DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`
    ).bind(entityType, entityId, fieldName, normalizedLang, value).run();
  }
}

/**
 * Enrich entities with their translations
 */
async function enrichWithTranslations(
  db: D1Database,
  entities: any[],
  entityType: string
): Promise<any[]> {
  if (!entities || entities.length === 0) return entities;

  // Get all entity IDs
  const entityIds = entities.map(e => e.id);

  // Get all translations for these entities in one query
  const { results } = await db.prepare(
    `SELECT entity_id, field_name, language, value
     FROM translations
     WHERE entity_type = ? AND entity_id IN (${entityIds.map(() => '?').join(',')})`
  ).bind(entityType, ...entityIds).all();

  // Group translations by entity_id
  const translationsByEntity: Record<number, Translation[]> = {};
  for (const row of results as any) {
    if (!translationsByEntity[row.entity_id]) {
      translationsByEntity[row.entity_id] = [];
    }
    translationsByEntity[row.entity_id].push(row);
  }

  // Enrich each entity with its translations
  return entities.map(entity => {
    const entityTranslations = translationsByEntity[entity.id] || [];
    const enriched = { ...entity };

    for (const trans of entityTranslations) {
      const key = `${trans.field_name}_${trans.language.replace('-', '_')}`;
      enriched[key] = trans.value;
    }

    return enriched;
  });
}

// Router principale
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Authentication check for write operations
    const writeOperations = ['POST', 'PUT', 'DELETE'];
    if (writeOperations.includes(method) && !isAuthenticated(request, env)) {
      return unauthorizedResponse();
    }

    try {
      // API Routes

      // ========== ARTWORKS ==========

      // GET /api/artworks - Lista tutte le opere
      if (path === '/api/artworks' && method === 'GET') {
        const collectionId = url.searchParams.get('collection_id');
        const sectionId = url.searchParams.get('section_id'); // Keep for backward compatibility
        let query = 'SELECT * FROM artworks';
        const params: any[] = [];

        if (collectionId) {
          query += ' WHERE collection_id = ? AND is_visible = 1';
          params.push(collectionId);
        } else if (sectionId) {
          query += ' WHERE section_id = ?';
          params.push(sectionId);
        } else {
          query += ' WHERE is_visible = 1';
        }

        query += ' ORDER BY order_index ASC';

        const { results } = await env.DB.prepare(query)
          .bind(...params)
          .all();

        return jsonResponse({ artworks: results });
      }

      // GET /api/artworks/:id - Singola opera
      if (path.match(/^\/api\/artworks\/\d+$/) && method === 'GET') {
        const id = path.split('/').pop();
        const { results } = await env.DB.prepare(
          'SELECT * FROM artworks WHERE id = ?'
        ).bind(id).all();

        if (results.length === 0) {
          return jsonResponse({ error: 'Artwork not found' }, 404);
        }

        return jsonResponse({ artwork: results[0] });
      }

      // POST /api/artworks - Crea nuova opera
      if (path === '/api/artworks' && method === 'POST') {
        const body = await request.json() as {
          title: string;
          year?: number;
          technique?: string;
          dimensions?: string;
          image_url?: string;
          collection_id?: number;
          section_id?: number; // Keep for backward compatibility
          order_index?: number;
          is_visible?: boolean;
        };

        const { title, year, technique, dimensions, image_url, collection_id, section_id, order_index, is_visible } = body;

        if (!title || (!collection_id && !section_id)) {
          return jsonResponse({ error: 'Title and collection_id are required' }, 400);
        }

        const result = await env.DB.prepare(
          `INSERT INTO artworks (title, year, technique, dimensions, image_url, collection_id, order_index, is_visible)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           RETURNING *`
        ).bind(
          title,
          year || null,
          technique || null,
          dimensions || null,
          image_url || null,
          collection_id || section_id || null,
          order_index !== undefined ? order_index : 0,
          is_visible !== undefined ? (is_visible ? 1 : 0) : 1
        ).first();

        return jsonResponse({ artwork: result }, 201);
      }

      // PUT /api/artworks/:id - Aggiorna opera
      if (path.match(/^\/api\/artworks\/\d+$/) && method === 'PUT') {
        const id = path.split('/').pop();
        const body = await request.json() as {
          title?: string;
          year?: number;
          technique?: string;
          dimensions?: string;
          image_url?: string;
          collection_id?: number;
          section_id?: number;
          order_index?: number;
          is_visible?: boolean;
        };

        const { title, year, technique, dimensions, image_url, collection_id, section_id, order_index, is_visible } = body;

        const result = await env.DB.prepare(
          `UPDATE artworks
           SET title = COALESCE(?, title),
               year = COALESCE(?, year),
               technique = COALESCE(?, technique),
               dimensions = COALESCE(?, dimensions),
               image_url = COALESCE(?, image_url),
               collection_id = COALESCE(?, collection_id),
               order_index = COALESCE(?, order_index),
               is_visible = COALESCE(?, is_visible),
               updated_at = CURRENT_TIMESTAMP
           WHERE id = ?
           RETURNING *`
        ).bind(
          title || null,
          year || null,
          technique || null,
          dimensions || null,
          image_url || null,
          collection_id || section_id || null,
          order_index || null,
          is_visible !== undefined ? (is_visible ? 1 : 0) : null,
          id
        ).first();

        if (!result) {
          return jsonResponse({ error: 'Artwork not found' }, 404);
        }

        return jsonResponse({ artwork: result });
      }

      // DELETE /api/artworks/:id - Elimina opera
      if (path.match(/^\/api\/artworks\/\d+$/) && method === 'DELETE') {
        const id = path.split('/').pop();

        const result = await env.DB.prepare(
          'DELETE FROM artworks WHERE id = ? RETURNING *'
        ).bind(id).first();

        if (!result) {
          return jsonResponse({ error: 'Artwork not found' }, 404);
        }

        return jsonResponse({ message: 'Artwork deleted', artwork: result });
      }

      // ========== SECTIONS ==========

      // GET /api/sections - Lista tutte le sezioni
      if (path === '/api/sections' && method === 'GET') {
        const { results } = await env.DB.prepare(
          'SELECT * FROM sections ORDER BY order_index ASC'
        ).all();

        return jsonResponse({ sections: results });
      }

      // GET /api/sections/:id - Singola sezione
      if (path.match(/^\/api\/sections\/\d+$/) && method === 'GET') {
        const id = path.split('/').pop();
        const { results } = await env.DB.prepare(
          'SELECT * FROM sections WHERE id = ?'
        ).bind(id).all();

        if (results.length === 0) {
          return jsonResponse({ error: 'Section not found' }, 404);
        }

        return jsonResponse({ section: results[0] });
      }

      // GET /api/sections/:id/artworks - Opere di una sezione
      if (path.match(/^\/api\/sections\/\d+\/artworks$/) && method === 'GET') {
        const id = path.split('/')[3];
        const { results } = await env.DB.prepare(
          'SELECT * FROM artworks WHERE section_id = ? ORDER BY order_index ASC'
        ).bind(id).all();

        return jsonResponse({ artworks: results });
      }

      // POST /api/sections - Crea nuova sezione
      if (path === '/api/sections' && method === 'POST') {
        const body = await request.json() as {
          name: string;
          slug: string;
          description?: string;
          order_index?: number;
        };

        const { name, slug, description, order_index } = body;

        if (!name || !slug) {
          return jsonResponse({ error: 'Name and slug are required' }, 400);
        }

        const result = await env.DB.prepare(
          `INSERT INTO sections (name, slug, description, order_index)
           VALUES (?, ?, ?, ?)
           RETURNING *`
        ).bind(
          name,
          slug,
          description || null,
          order_index || 0
        ).first();

        return jsonResponse({ section: result }, 201);
      }

      // PUT /api/sections/:id - Aggiorna sezione
      if (path.match(/^\/api\/sections\/\d+$/) && method === 'PUT') {
        const id = path.split('/').pop();
        const body = await request.json() as {
          name?: string;
          slug?: string;
          description?: string;
          order_index?: number;
        };

        const { name, slug, description, order_index } = body;

        const result = await env.DB.prepare(
          `UPDATE sections
           SET name = COALESCE(?, name),
               slug = COALESCE(?, slug),
               description = COALESCE(?, description),
               order_index = COALESCE(?, order_index),
               updated_at = CURRENT_TIMESTAMP
           WHERE id = ?
           RETURNING *`
        ).bind(
          name || null,
          slug || null,
          description || null,
          order_index || null,
          id
        ).first();

        if (!result) {
          return jsonResponse({ error: 'Section not found' }, 404);
        }

        return jsonResponse({ section: result });
      }

      // DELETE /api/sections/:id - Elimina sezione
      if (path.match(/^\/api\/sections\/\d+$/) && method === 'DELETE') {
        const id = path.split('/').pop();

        const result = await env.DB.prepare(
          'DELETE FROM sections WHERE id = ? RETURNING *'
        ).bind(id).first();

        if (!result) {
          return jsonResponse({ error: 'Section not found' }, 404);
        }

        return jsonResponse({ message: 'Section deleted', section: result });
      }

      // ========== COLLECTIONS ==========

      // GET /api/collections - Lista tutte le collezioni
      if (path === '/api/collections' && method === 'GET') {
        const showAll = url.searchParams.get('all') === 'true';

        const query = showAll
          ? 'SELECT * FROM collections ORDER BY order_index ASC'
          : 'SELECT * FROM collections WHERE is_visible = 1 ORDER BY order_index ASC';

        const { results } = await env.DB.prepare(query).all();
        const enriched = await enrichWithTranslations(env.DB, results, 'collection');

        return jsonResponse({ collections: enriched });
      }

      // GET /api/collections/:slug - Singola collezione
      if (path.match(/^\/api\/collections\/[a-z0-9-]+$/) && method === 'GET') {
        const slug = path.split('/').pop();
        const { results } = await env.DB.prepare(
          'SELECT * FROM collections WHERE slug = ?'
        ).bind(slug).all();

        if (results.length === 0) {
          return jsonResponse({ error: 'Collection not found' }, 404);
        }

        const enriched = await enrichWithTranslations(env.DB, results, 'collection');
        return jsonResponse({ collection: enriched[0] });
      }

      // POST /api/collections - Crea nuova collezione
      if (path === '/api/collections' && method === 'POST') {
        const body = await request.json() as {
          title: string;
          slug: string;
          description?: string;
          image_url?: string;
          order_index?: number;
          is_visible?: boolean;
          title_it?: string;
          title_en?: string;
          title_es?: string;
          title_fr?: string;
          title_ja?: string;
          title_zh?: string;
          title_zh_tw?: string;
          description_it?: string;
          description_en?: string;
          description_es?: string;
          description_fr?: string;
          description_ja?: string;
          description_zh?: string;
          description_zh_tw?: string;
        };

        const { title, slug, description, image_url, order_index, is_visible } = body;

        if (!title || !slug) {
          return jsonResponse({ error: 'Title and slug are required' }, 400);
        }

        // Check if slug already exists
        const existingCollection = await env.DB.prepare(
          'SELECT id FROM collections WHERE slug = ?'
        ).bind(slug).first();

        if (existingCollection) {
          return jsonResponse({
            error: 'Slug already exists',
            message: 'Lo slug esiste già. Per favore usa un nome diverso o modifica manualmente lo slug.'
          }, 409);
        }

        // Insert base collection data (without translation fields)
        const result = await env.DB.prepare(
          `INSERT INTO collections (title, slug, description, image_url, order_index, is_visible)
           VALUES (?, ?, ?, ?, ?, ?)
           RETURNING *`
        ).bind(
          title,
          slug,
          description || null,
          image_url || null,
          order_index || 0,
          is_visible !== undefined ? (is_visible ? 1 : 0) : 1
        ).first();

        // Save translations to translations table
        await saveTranslations(env.DB, 'collection', (result as any).id, body);

        // Enrich with translations before returning
        const enriched = await enrichWithTranslations(env.DB, [result as any], 'collection');

        return jsonResponse({ collection: enriched[0] }, 201);
      }

      // PUT /api/collections/:id - Aggiorna collezione
      if (path.match(/^\/api\/collections\/\d+$/) && method === 'PUT') {
        const id = path.split('/').pop();
        const body = await request.json() as {
          title?: string;
          slug?: string;
          description?: string;
          image_url?: string;
          order_index?: number;
          is_visible?: boolean;
          title_it?: string;
          title_en?: string;
          title_es?: string;
          title_fr?: string;
          title_ja?: string;
          title_zh?: string;
          title_zh_tw?: string;
          description_it?: string;
          description_en?: string;
          description_es?: string;
          description_fr?: string;
          description_ja?: string;
          description_zh?: string;
          description_zh_tw?: string;
        };

        const { title, slug, description, image_url, order_index, is_visible } = body;

        // Update base collection data (without translation fields)
        const result = await env.DB.prepare(
          `UPDATE collections
           SET title = COALESCE(?, title),
               slug = COALESCE(?, slug),
               description = COALESCE(?, description),
               image_url = COALESCE(?, image_url),
               order_index = COALESCE(?, order_index),
               is_visible = COALESCE(?, is_visible),
               updated_at = CURRENT_TIMESTAMP
           WHERE id = ?
           RETURNING *`
        ).bind(
          title || null,
          slug || null,
          description || null,
          image_url || null,
          order_index || null,
          is_visible !== undefined ? (is_visible ? 1 : 0) : null,
          id
        ).first();

        if (!result) {
          return jsonResponse({ error: 'Collection not found' }, 404);
        }

        // Save translations to translations table
        await saveTranslations(env.DB, 'collection', (result as any).id, body);

        // Enrich with translations before returning
        const enriched = await enrichWithTranslations(env.DB, [result as any], 'collection');

        return jsonResponse({ collection: enriched[0] });
      }

      // DELETE /api/collections/:id - Elimina collezione
      if (path.match(/^\/api\/collections\/\d+$/) && method === 'DELETE') {
        const id = path.split('/').pop();

        const result = await env.DB.prepare(
          'DELETE FROM collections WHERE id = ? RETURNING *'
        ).bind(id).first();

        if (!result) {
          return jsonResponse({ error: 'Collection not found' }, 404);
        }

        return jsonResponse({ message: 'Collection deleted', collection: result });
      }

      // ========== EXHIBITIONS ==========

      // GET /api/exhibitions - Lista tutte le mostre
      if (path === '/api/exhibitions' && method === 'GET') {
        const { results } = await env.DB.prepare(
          'SELECT * FROM exhibitions ORDER BY date DESC'
        ).all();

        return jsonResponse({ exhibitions: results });
      }

      // GET /api/exhibitions/:id - Singola mostra per ID
      if (path.match(/^\/api\/exhibitions\/\d+$/) && method === 'GET') {
        const id = path.split('/').pop();
        const { results } = await env.DB.prepare(
          'SELECT * FROM exhibitions WHERE id = ?'
        ).bind(id).all();

        if (results.length === 0) {
          return jsonResponse({ error: 'Exhibition not found' }, 404);
        }

        return jsonResponse({ exhibition: results[0] });
      }

      // GET /api/exhibitions/:slug - Singola mostra per slug
      if (path.match(/^\/api\/exhibitions\/[a-z0-9-]+$/) && method === 'GET') {
        const slug = path.split('/').pop();
        const { results } = await env.DB.prepare(
          'SELECT * FROM exhibitions WHERE slug = ?'
        ).bind(slug).all();

        if (results.length === 0) {
          return jsonResponse({ error: 'Exhibition not found' }, 404);
        }

        return jsonResponse({ exhibition: results[0] });
      }

      // POST /api/exhibitions - Crea nuova mostra
      if (path === '/api/exhibitions' && method === 'POST') {
        const body = await request.json() as {
          title: string;
          subtitle?: string;
          location: string;
          date: string;
          description?: string;
          info?: string;
          website?: string;
          image_url?: string;
          slug: string;
          order_index?: number;
          is_visible?: boolean;
        };

        const { title, subtitle, location, date, description, info, website, image_url, slug, order_index, is_visible } = body;

        if (!title || !slug || !location || !date) {
          return jsonResponse({ error: 'Title, slug, location and date are required' }, 400);
        }

        const result = await env.DB.prepare(
          `INSERT INTO exhibitions (title, subtitle, location, date, description, info, website, image_url, slug, order_index, is_visible)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           RETURNING *`
        ).bind(
          title,
          subtitle || null,
          location,
          date,
          description || null,
          info || null,
          website || null,
          image_url || null,
          slug,
          order_index || 0,
          is_visible !== undefined ? (is_visible ? 1 : 0) : 1
        ).first();

        return jsonResponse({ exhibition: result }, 201);
      }

      // PUT /api/exhibitions/:id - Aggiorna mostra
      if (path.match(/^\/api\/exhibitions\/\d+$/) && method === 'PUT') {
        const id = path.split('/').pop();
        const body = await request.json() as any;

        const {
          title, subtitle, location, date, description, info, website, image_url, slug, order_index, is_visible,
          title_it, title_en, title_es, title_fr, title_ja, title_zh, title_zh_tw,
          subtitle_it, subtitle_en, subtitle_es, subtitle_fr, subtitle_ja, subtitle_zh, subtitle_zh_tw,
          description_it, description_en, description_es, description_fr, description_ja, description_zh, description_zh_tw,
          location_it, location_en, location_es, location_fr, location_ja, location_zh, location_zh_tw,
          info_it, info_en, info_es, info_fr, info_ja, info_zh, info_zh_tw
        } = body;

        // Build dynamic UPDATE query with all fields
        const updates: string[] = [];
        const params: any[] = [];

        // Base fields
        if (title !== undefined) { updates.push('title = ?'); params.push(title); }
        if (subtitle !== undefined) { updates.push('subtitle = ?'); params.push(subtitle); }
        if (location !== undefined) { updates.push('location = ?'); params.push(location); }
        if (date !== undefined) { updates.push('date = ?'); params.push(date); }
        if (description !== undefined) { updates.push('description = ?'); params.push(description); }
        if (info !== undefined) { updates.push('info = ?'); params.push(info); }
        if (website !== undefined) { updates.push('website = ?'); params.push(website); }
        if (image_url !== undefined) { updates.push('image_url = ?'); params.push(image_url); }
        if (slug !== undefined) { updates.push('slug = ?'); params.push(slug); }
        if (order_index !== undefined) { updates.push('order_index = ?'); params.push(order_index); }
        if (is_visible !== undefined) { updates.push('is_visible = ?'); params.push(is_visible ? 1 : 0); }

        // Translation fields
        if (title_it !== undefined) { updates.push('title_it = ?'); params.push(title_it); }
        if (title_en !== undefined) { updates.push('title_en = ?'); params.push(title_en); }
        if (title_es !== undefined) { updates.push('title_es = ?'); params.push(title_es); }
        if (title_fr !== undefined) { updates.push('title_fr = ?'); params.push(title_fr); }
        if (title_ja !== undefined) { updates.push('title_ja = ?'); params.push(title_ja); }
        if (title_zh !== undefined) { updates.push('title_zh = ?'); params.push(title_zh); }
        if (title_zh_tw !== undefined) { updates.push('title_zh_tw = ?'); params.push(title_zh_tw); }

        if (subtitle_it !== undefined) { updates.push('subtitle_it = ?'); params.push(subtitle_it); }
        if (subtitle_en !== undefined) { updates.push('subtitle_en = ?'); params.push(subtitle_en); }
        if (subtitle_es !== undefined) { updates.push('subtitle_es = ?'); params.push(subtitle_es); }
        if (subtitle_fr !== undefined) { updates.push('subtitle_fr = ?'); params.push(subtitle_fr); }
        if (subtitle_ja !== undefined) { updates.push('subtitle_ja = ?'); params.push(subtitle_ja); }
        if (subtitle_zh !== undefined) { updates.push('subtitle_zh = ?'); params.push(subtitle_zh); }
        if (subtitle_zh_tw !== undefined) { updates.push('subtitle_zh_tw = ?'); params.push(subtitle_zh_tw); }

        if (description_it !== undefined) { updates.push('description_it = ?'); params.push(description_it); }
        if (description_en !== undefined) { updates.push('description_en = ?'); params.push(description_en); }
        if (description_es !== undefined) { updates.push('description_es = ?'); params.push(description_es); }
        if (description_fr !== undefined) { updates.push('description_fr = ?'); params.push(description_fr); }
        if (description_ja !== undefined) { updates.push('description_ja = ?'); params.push(description_ja); }
        if (description_zh !== undefined) { updates.push('description_zh = ?'); params.push(description_zh); }
        if (description_zh_tw !== undefined) { updates.push('description_zh_tw = ?'); params.push(description_zh_tw); }

        if (location_it !== undefined) { updates.push('location_it = ?'); params.push(location_it); }
        if (location_en !== undefined) { updates.push('location_en = ?'); params.push(location_en); }
        if (location_es !== undefined) { updates.push('location_es = ?'); params.push(location_es); }
        if (location_fr !== undefined) { updates.push('location_fr = ?'); params.push(location_fr); }
        if (location_ja !== undefined) { updates.push('location_ja = ?'); params.push(location_ja); }
        if (location_zh !== undefined) { updates.push('location_zh = ?'); params.push(location_zh); }
        if (location_zh_tw !== undefined) { updates.push('location_zh_tw = ?'); params.push(location_zh_tw); }

        if (info_it !== undefined) { updates.push('info_it = ?'); params.push(info_it); }
        if (info_en !== undefined) { updates.push('info_en = ?'); params.push(info_en); }
        if (info_es !== undefined) { updates.push('info_es = ?'); params.push(info_es); }
        if (info_fr !== undefined) { updates.push('info_fr = ?'); params.push(info_fr); }
        if (info_ja !== undefined) { updates.push('info_ja = ?'); params.push(info_ja); }
        if (info_zh !== undefined) { updates.push('info_zh = ?'); params.push(info_zh); }
        if (info_zh_tw !== undefined) { updates.push('info_zh_tw = ?'); params.push(info_zh_tw); }

        if (updates.length === 0) {
          return jsonResponse({ error: 'No fields to update' }, 400);
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(id);

        const result = await env.DB.prepare(
          `UPDATE exhibitions SET ${updates.join(', ')} WHERE id = ? RETURNING *`
        ).bind(...params).first();

        if (!result) {
          return jsonResponse({ error: 'Exhibition not found' }, 404);
        }

        return jsonResponse({ exhibition: result });
      }

      // DELETE /api/exhibitions/:id - Elimina mostra
      if (path.match(/^\/api\/exhibitions\/\d+$/) && method === 'DELETE') {
        const id = path.split('/').pop();

        const result = await env.DB.prepare(
          'DELETE FROM exhibitions WHERE id = ? RETURNING *'
        ).bind(id).first();

        if (!result) {
          return jsonResponse({ error: 'Exhibition not found' }, 404);
        }

        return jsonResponse({ message: 'Exhibition deleted', exhibition: result });
      }

      // ========== CRITICS ==========

      // GET /api/critics - Lista tutti i critici
      if (path === '/api/critics' && method === 'GET') {
        const { results } = await env.DB.prepare(
          'SELECT * FROM critics ORDER BY id ASC'
        ).all();

        const enriched = await enrichWithTranslations(env.DB, results, 'critic');

        return jsonResponse({ critics: enriched });
      }

      // GET /api/critics/:id - Singolo critico
      if (path.match(/^\/api\/critics\/\d+$/) && method === 'GET') {
        const id = path.split('/').pop();
        const { results } = await env.DB.prepare(
          'SELECT * FROM critics WHERE id = ?'
        ).bind(id).all();

        if (results.length === 0) {
          return jsonResponse({ error: 'Critic not found' }, 404);
        }

        const enriched = await enrichWithTranslations(env.DB, results, 'critic');

        return jsonResponse({ critic: enriched[0] });
      }

      // POST /api/critics - Crea nuovo critico
      if (path === '/api/critics' && method === 'POST') {
        const body = await request.json() as {
          name: string;
          role: string;
          text: string;
          text_it?: string;
          text_en?: string;
          order_index?: number;
          is_visible?: boolean;
        };

        const { name, role, text, order_index, is_visible } = body;

        if (!name || !role || !text) {
          return jsonResponse({ error: 'Name, role and text are required' }, 400);
        }

        // Insert base critic data (without translation fields)
        const result = await env.DB.prepare(
          `INSERT INTO critics (name, role, text, order_index, is_visible)
           VALUES (?, ?, ?, ?, ?)
           RETURNING *`
        ).bind(
          name,
          role,
          text,
          order_index || 0,
          is_visible !== undefined ? (is_visible ? 1 : 0) : 1
        ).first();

        // Save translations to translations table
        await saveTranslations(env.DB, 'critic', (result as any).id, body);

        // Enrich with translations before returning
        const enriched = await enrichWithTranslations(env.DB, [result as any], 'critic');

        return jsonResponse({ critic: enriched[0] }, 201);
      }

      // PUT /api/critics/:id - Aggiorna critico
      if (path.match(/^\/api\/critics\/\d+$/) && method === 'PUT') {
        const id = path.split('/').pop();
        const body = await request.json() as {
          name?: string;
          role?: string;
          text?: string;
          text_it?: string;
          text_en?: string;
          order_index?: number;
          is_visible?: boolean;
        };

        const { name, role, text, order_index, is_visible } = body;

        // Update base critic data (without translation fields)
        const result = await env.DB.prepare(
          `UPDATE critics
           SET name = COALESCE(?, name),
               role = COALESCE(?, role),
               text = COALESCE(?, text),
               order_index = COALESCE(?, order_index),
               is_visible = COALESCE(?, is_visible),
               updated_at = CURRENT_TIMESTAMP
           WHERE id = ?
           RETURNING *`
        ).bind(
          name || null,
          role || null,
          text || null,
          order_index || null,
          is_visible !== undefined ? (is_visible ? 1 : 0) : null,
          id
        ).first();

        if (!result) {
          return jsonResponse({ error: 'Critic not found' }, 404);
        }

        // Save translations to translations table
        await saveTranslations(env.DB, 'critic', (result as any).id, body);

        // Enrich with translations before returning
        const enriched = await enrichWithTranslations(env.DB, [result as any], 'critic');

        return jsonResponse({ critic: enriched[0] });
      }

      // DELETE /api/critics/:id - Elimina critico
      if (path.match(/^\/api\/critics\/\d+$/) && method === 'DELETE') {
        const id = path.split('/').pop();

        const result = await env.DB.prepare(
          'DELETE FROM critics WHERE id = ? RETURNING *'
        ).bind(id).first();

        if (!result) {
          return jsonResponse({ error: 'Critic not found' }, 404);
        }

        return jsonResponse({ message: 'Critic deleted', critic: result });
      }

      // ========== CONTENT BLOCKS ==========

      // GET /api/content - Lista tutti i content blocks
      if (path === '/api/content' && method === 'GET') {
        const { results } = await env.DB.prepare(
          'SELECT * FROM content_blocks'
        ).all();

        return jsonResponse({ content: results });
      }

      // GET /api/content/:key - Singolo content block per chiave
      if (path.match(/^\/api\/content\/[\w-]+$/) && method === 'GET') {
        const key = path.split('/').pop();
        const { results } = await env.DB.prepare(
          'SELECT * FROM content_blocks WHERE key = ?'
        ).bind(key).all();

        if (results.length === 0) {
          return jsonResponse({ error: 'Content block not found' }, 404);
        }

        return jsonResponse({ content: results[0] });
      }

      // PUT /api/content/:key - Aggiorna content block
      if (path.match(/^\/api\/content\/[\w-]+$/) && method === 'PUT') {
        const key = path.split('/').pop();
        const body = await request.json() as {
          title?: string;
          content?: string;
          image_url?: string;
        };

        const { title, content, image_url } = body;

        const result = await env.DB.prepare(
          `UPDATE content_blocks
           SET title = COALESCE(?, title),
               content = COALESCE(?, content),
               image_url = COALESCE(?, image_url),
               updated_at = CURRENT_TIMESTAMP
           WHERE key = ?
           RETURNING *`
        ).bind(
          title || null,
          content || null,
          image_url || null,
          key
        ).first();

        if (!result) {
          return jsonResponse({ error: 'Content block not found' }, 404);
        }

        return jsonResponse({ content: result });
      }

      // ========== IMAGE UPLOAD (R2) ==========

      // POST /api/upload - Upload immagine su R2
      if (path === '/api/upload' && method === 'POST') {
        if (!env.IMAGES) {
          return jsonResponse({ error: 'R2 storage not configured' }, 503);
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
          return jsonResponse({ error: 'No file provided' }, 400);
        }

        // Genera nome file unico
        const timestamp = Date.now();
        const filename = `${timestamp}-${file.name}`;

        // Upload su R2
        await env.IMAGES.put(filename, file.stream(), {
          httpMetadata: {
            contentType: file.type,
          },
        });

        const imageUrl = `/images/${filename}`;

        return jsonResponse({
          message: 'File uploaded successfully',
          url: imageUrl,
          filename
        }, 201);
      }

      // GET /api/media - Lista tutte le immagini in R2
      if (path === '/api/media' && method === 'GET') {
        if (!env.IMAGES) {
          return jsonResponse({ error: 'R2 storage not configured' }, 503);
        }

        const listed = await env.IMAGES.list();
        const images = listed.objects
          .map(obj => ({
            filename: obj.key,
            url: `/images/${obj.key}`,
            size: obj.size,
            uploaded: obj.uploaded.toISOString()
          }))
          // Ordina per data di upload: dalla più recente alla meno recente
          .sort((a, b) => new Date(b.uploaded).getTime() - new Date(a.uploaded).getTime());

        return jsonResponse({ images });
      }

      // GET /api/storage/stats - Statistiche storage R2
      if (path === '/api/storage/stats' && method === 'GET') {
        if (!env.IMAGES) {
          return jsonResponse({ error: 'R2 storage not configured' }, 503);
        }

        const listed = await env.IMAGES.list();

        let totalSize = 0;
        let originalsCount = 0;
        let originalsSize = 0;
        let thumbnailsCount = 0;
        let thumbnailsSize = 0;

        for (const obj of listed.objects) {
          totalSize += obj.size;

          if (obj.key.includes('_thumb')) {
            thumbnailsCount++;
            thumbnailsSize += obj.size;
          } else {
            originalsCount++;
            originalsSize += obj.size;
          }
        }

        return jsonResponse({
          totalFiles: listed.objects.length,
          totalSize,
          originals: {
            count: originalsCount,
            size: originalsSize
          },
          thumbnails: {
            count: thumbnailsCount,
            size: thumbnailsSize
          }
        });
      }

      // GET /api/regenerate-thumbnails - Trova immagini senza thumbnail
      if (path === '/api/regenerate-thumbnails' && method === 'GET') {
        if (!env.IMAGES) {
          return jsonResponse({ error: 'R2 storage not configured' }, 503);
        }

        const listed = await env.IMAGES.list();
        const originals = listed.objects.filter(obj => !obj.key.includes('_thumb'));
        const thumbnails = listed.objects.filter(obj => obj.key.includes('_thumb'));

        const missingThumbnails: string[] = [];

        for (const original of originals) {
          // Generate expected thumbnail filename
          const thumbName = original.key.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '_thumb.$1');
          const hasThumb = thumbnails.some(t => t.key === thumbName);

          if (!hasThumb) {
            missingThumbnails.push(original.key);
          }
        }

        return jsonResponse({
          missing: missingThumbnails,
          count: missingThumbnails.length
        });
      }

      // GET /images/:filename - Serve immagine da R2
      if (path.match(/^\/images\/.+$/) && method === 'GET') {
        if (!env.IMAGES) {
          return jsonResponse({ error: 'R2 storage not configured' }, 503);
        }

        const filename = path.replace('/images/', '');
        const object = await env.IMAGES.get(filename);

        if (!object) {
          return jsonResponse({ error: 'Image not found' }, 404);
        }

        return new Response(object.body, {
          headers: {
            'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
            'Cache-Control': 'public, max-age=31536000',
            ...corsHeaders,
          },
        });
      }

      // GET /api/images/:filename/usage - Controlla dove è usata l'immagine
      if (path.match(/^\/api\/images\/.+\/usage$/) && method === 'GET') {
        const filename = path.split('/')[3];
        const imageUrl = `/images/${filename}`;

        // Controlla in artworks
        const artworksUsage = await env.DB.prepare(
          'SELECT id, title FROM artworks WHERE image_url = ?'
        ).bind(imageUrl).all();

        // Controlla in collections
        const collectionsUsage = await env.DB.prepare(
          'SELECT id, title FROM collections WHERE image_url = ?'
        ).bind(imageUrl).all();

        // Controlla in exhibitions
        const exhibitionsUsage = await env.DB.prepare(
          'SELECT id, title FROM exhibitions WHERE image_url = ?'
        ).bind(imageUrl).all();

        const usage = {
          artworks: artworksUsage.results || [],
          collections: collectionsUsage.results || [],
          exhibitions: exhibitionsUsage.results || [],
          total: (artworksUsage.results?.length || 0) +
                 (collectionsUsage.results?.length || 0) +
                 (exhibitionsUsage.results?.length || 0)
        };

        return jsonResponse({ usage });
      }

      // DELETE /api/images/:filename - Elimina immagine da R2
      if (path.match(/^\/api\/images\/[^/]+$/) && method === 'DELETE') {
        if (!env.IMAGES) {
          return jsonResponse({ error: 'R2 storage not configured' }, 503);
        }

        const filename = path.split('/')[3];

        // Elimina l'originale
        await env.IMAGES.delete(filename);

        // Elimina il thumbnail se esiste
        const thumbFilename = filename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '_thumb.$1');
        await env.IMAGES.delete(thumbFilename);

        return jsonResponse({
          message: 'Image deleted successfully',
          filename
        });
      }

      // ========== NEWSLETTER ==========

      // POST /api/newsletter - Iscriviti alla newsletter
      if (path === '/api/newsletter' && method === 'POST') {
        const body = await request.json() as { email: string };
        const { email } = body;

        if (!email || !email.includes('@')) {
          return jsonResponse({ error: 'Valid email is required' }, 400);
        }

        // Controlla se l'email esiste già
        const existing = await env.DB.prepare(
          'SELECT id FROM newsletter_subscribers WHERE email = ?'
        ).bind(email.toLowerCase()).first();

        if (existing) {
          return jsonResponse({
            message: 'Email already subscribed',
            alreadySubscribed: true
          }, 200);
        }

        // Aggiungi la nuova email
        const ipAddress = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Real-IP') || 'unknown';
        const userAgent = request.headers.get('User-Agent') || 'unknown';

        await env.DB.prepare(
          `INSERT INTO newsletter_subscribers (email, ip_address, user_agent)
           VALUES (?, ?, ?)`
        ).bind(email.toLowerCase(), ipAddress, userAgent).run();

        return jsonResponse({
          message: 'Successfully subscribed to newsletter',
          email: email.toLowerCase()
        }, 201);
      }

      // GET /api/newsletter - Lista iscritti (per backoffice)
      if (path === '/api/newsletter' && method === 'GET') {
        const { results } = await env.DB.prepare(
          'SELECT id, email, subscribed_at FROM newsletter_subscribers ORDER BY subscribed_at DESC'
        ).all();

        return jsonResponse({ subscribers: results });
      }

      // DELETE /api/newsletter/:id - Rimuovi iscritto
      if (path.match(/^\/api\/newsletter\/\d+$/) && method === 'DELETE') {
        const id = path.split('/').pop();

        await env.DB.prepare(
          'DELETE FROM newsletter_subscribers WHERE id = ?'
        ).bind(id).run();

        return jsonResponse({ message: 'Subscriber removed successfully' });
      }

      // ========== TRANSLATION ==========

      // POST /api/translate - Auto-translate text using Claude API
      if (path === '/api/translate' && method === 'POST') {
        // Check for Anthropic API key (preferred) or fallback to Cloudflare AI
        const useClaudeAPI = !!env.ANTHROPIC_API_KEY;

        if (!useClaudeAPI && !env.AI) {
          return jsonResponse({ error: 'Translation service not configured. Please set ANTHROPIC_API_KEY or configure Cloudflare AI binding.' }, 503);
        }

        const body = await request.json() as {
          text: string;
          targetLanguage: string;
          sourceLanguage?: string;
        };

        const { text, targetLanguage, sourceLanguage = 'it' } = body;

        if (!text || !targetLanguage) {
          return jsonResponse({ error: 'text and targetLanguage are required' }, 400);
        }

        // Map language codes to full language names
        const languageNames: Record<string, { source: string; target: string }> = {
          'en': { source: 'Italian', target: 'English' },
          'es': { source: 'Italian', target: 'Spanish' },
          'fr': { source: 'Italian', target: 'French' },
          'ja': { source: 'Italian', target: 'Japanese' },
          'zh': { source: 'Italian', target: 'Simplified Chinese' },
          'zh_tw': { source: 'Italian', target: 'Traditional Chinese' },
        };

        const langConfig = languageNames[targetLanguage];
        if (!langConfig) {
          return jsonResponse({ error: 'Unsupported target language' }, 400);
        }

        try {
          let translatedText = '';

          if (useClaudeAPI) {
            // Use Claude API for high-quality translations
            const response = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': env.ANTHROPIC_API_KEY!,
                'anthropic-version': '2023-06-01'
              },
              body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 4096,
                messages: [{
                  role: 'user',
                  content: `You are a professional translator specializing in art and cultural content. Translate the following text from ${langConfig.source} to ${langConfig.target}.

IMPORTANT INSTRUCTIONS:
- Maintain the artistic and cultural tone
- Preserve formatting (line breaks, punctuation)
- Keep proper nouns and artwork titles in their original form
- Ensure natural, fluent language in the target language
- Return ONLY the translated text, no explanations

Text to translate:
${text}`
                }]
              })
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(`Claude API error: ${response.status} - ${JSON.stringify(errorData)}`);
            }

            const data = await response.json() as any;
            translatedText = data.content[0].text.trim();
          } else {
            // Fallback to Cloudflare AI
            const aiResponse = await env.AI!.run('@cf/meta/m2m100-1.2b', {
              text,
              source_lang: 'italian',
              target_lang: targetLanguage === 'zh_tw' ? 'chinese_traditional' :
                          targetLanguage === 'zh' ? 'chinese_simplified' :
                          targetLanguage === 'ja' ? 'japanese' :
                          targetLanguage === 'es' ? 'spanish' :
                          targetLanguage === 'fr' ? 'french' : 'english'
            });

            translatedText = aiResponse?.translated_text || aiResponse?.text || '';
          }

          return jsonResponse({
            translatedText,
            sourceLanguage,
            targetLanguage,
            originalText: text,
            engine: useClaudeAPI ? 'claude-3.5-sonnet' : 'cloudflare-ai'
          });
        } catch (error: any) {
          console.error('Translation error:', error);
          return jsonResponse({
            error: 'Translation failed',
            message: error.message
          }, 500);
        }
      }

      // Route non trovata
      return jsonResponse({ error: 'Not found' }, 404);

    } catch (error: any) {
      console.error('Worker error:', error);
      return jsonResponse({
        error: 'Internal server error',
        message: error.message
      }, 500);
    }
  },
};
