/**
 * ALF Portfolio API Worker
 * Gestisce CRUD per opere, sezioni e contenuti
 */

interface Env {
  DB: D1Database;
  ARTWORKS?: R2Bucket;
}

// Funzioni helper per CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
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
          order_index || 0,
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

        return jsonResponse({ collections: results });
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

        return jsonResponse({ collection: results[0] });
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
        };

        const { title, slug, description, image_url, order_index, is_visible } = body;

        if (!title || !slug) {
          return jsonResponse({ error: 'Title and slug are required' }, 400);
        }

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

        return jsonResponse({ collection: result }, 201);
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
        };

        const { title, slug, description, image_url, order_index, is_visible } = body;

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

        return jsonResponse({ collection: result });
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
        const body = await request.json() as {
          title?: string;
          subtitle?: string;
          location?: string;
          date?: string;
          description?: string;
          info?: string;
          website?: string;
          image_url?: string;
          slug?: string;
          order_index?: number;
          is_visible?: boolean;
        };

        const { title, subtitle, location, date, description, info, website, image_url, slug, order_index, is_visible } = body;

        const result = await env.DB.prepare(
          `UPDATE exhibitions
           SET title = COALESCE(?, title),
               subtitle = COALESCE(?, subtitle),
               location = COALESCE(?, location),
               date = COALESCE(?, date),
               description = COALESCE(?, description),
               info = COALESCE(?, info),
               website = COALESCE(?, website),
               image_url = COALESCE(?, image_url),
               slug = COALESCE(?, slug),
               order_index = COALESCE(?, order_index),
               is_visible = COALESCE(?, is_visible),
               updated_at = CURRENT_TIMESTAMP
           WHERE id = ?
           RETURNING *`
        ).bind(
          title || null,
          subtitle || null,
          location || null,
          date || null,
          description || null,
          info || null,
          website || null,
          image_url || null,
          slug || null,
          order_index || null,
          is_visible !== undefined ? (is_visible ? 1 : 0) : null,
          id
        ).first();

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

        return jsonResponse({ critics: results });
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

        return jsonResponse({ critic: results[0] });
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

        const { name, role, text, text_it, text_en, order_index, is_visible } = body;

        if (!name || !role || !text) {
          return jsonResponse({ error: 'Name, role and text are required' }, 400);
        }

        const result = await env.DB.prepare(
          `INSERT INTO critics (name, role, text, text_it, text_en, order_index, is_visible)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           RETURNING *`
        ).bind(
          name,
          role,
          text,
          text_it || null,
          text_en || null,
          order_index || 0,
          is_visible !== undefined ? (is_visible ? 1 : 0) : 1
        ).first();

        return jsonResponse({ critic: result }, 201);
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

        const { name, role, text, text_it, text_en, order_index, is_visible } = body;

        const result = await env.DB.prepare(
          `UPDATE critics
           SET name = COALESCE(?, name),
               role = COALESCE(?, role),
               text = COALESCE(?, text),
               text_it = COALESCE(?, text_it),
               text_en = COALESCE(?, text_en),
               order_index = COALESCE(?, order_index),
               is_visible = COALESCE(?, is_visible),
               updated_at = CURRENT_TIMESTAMP
           WHERE id = ?
           RETURNING *`
        ).bind(
          name || null,
          role || null,
          text || null,
          text_it || null,
          text_en || null,
          order_index || null,
          is_visible !== undefined ? (is_visible ? 1 : 0) : null,
          id
        ).first();

        if (!result) {
          return jsonResponse({ error: 'Critic not found' }, 404);
        }

        return jsonResponse({ critic: result });
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
        if (!env.ARTWORKS) {
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
        await env.ARTWORKS.put(filename, file.stream(), {
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

      // GET /images/:filename - Serve immagine da R2
      if (path.match(/^\/images\/.+$/) && method === 'GET') {
        if (!env.ARTWORKS) {
          return jsonResponse({ error: 'R2 storage not configured' }, 503);
        }

        const filename = path.replace('/images/', '');
        const object = await env.ARTWORKS.get(filename);

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
