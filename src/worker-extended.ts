/**
 * ALF Portfolio API Worker Extended
 * Aggiunge endpoints per collezioni, mostre e critica
 * Da aggiungere al worker.ts esistente
 */

// ========== COLLECTIONS ==========

// GET /api/collections - Lista tutte le collezioni
if (path === '/api/collections' && method === 'GET') {
  const { results } = await env.DB.prepare(
    'SELECT * FROM collections WHERE is_visible = 1 ORDER BY order_index ASC'
  ).all();

  return jsonResponse({ collections: results });
}

// GET /api/collections/:slug - Singola collezione per slug
if (path.match(/^\/api\/collections\/[\w-]+$/) && method === 'GET') {
  const slug = path.split('/').pop();
  const { results } = await env.DB.prepare(
    'SELECT * FROM collections WHERE slug = ? AND is_visible = 1'
  ).bind(slug).all();

  if (results.length === 0) {
    return jsonResponse({ error: 'Collection not found' }, 404);
  }

  return jsonResponse({ collection: results[0] });
}

// POST /api/collections - Crea nuova collezione
if (path === '/api/collections' && method === 'POST') {
  const body = await request.json() as {
    slug: string;
    title: string;
    description?: string;
    image_url: string;
    order_index?: number;
  };

  const { slug, title, description, image_url, order_index } = body;

  if (!slug || !title || !image_url) {
    return jsonResponse({ error: 'Slug, title and image_url are required' }, 400);
  }

  const result = await env.DB.prepare(
    `INSERT INTO collections (slug, title, description, image_url, order_index)
     VALUES (?, ?, ?, ?, ?)
     RETURNING *`
  ).bind(
    slug,
    title,
    description || null,
    image_url,
    order_index || 0
  ).first();

  return jsonResponse({ collection: result }, 201);
}

// PUT /api/collections/:id - Aggiorna collezione
if (path.match(/^\/api\/collections\/\d+$/) && method === 'PUT') {
  const id = path.split('/').pop();
  const body = await request.json();

  const result = await env.DB.prepare(
    `UPDATE collections
     SET slug = COALESCE(?, slug),
         title = COALESCE(?, title),
         description = COALESCE(?, description),
         image_url = COALESCE(?, image_url),
         order_index = COALESCE(?, order_index),
         is_visible = COALESCE(?, is_visible),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?
     RETURNING *`
  ).bind(
    body.slug || null,
    body.title || null,
    body.description || null,
    body.image_url || null,
    body.order_index || null,
    body.is_visible !== undefined ? body.is_visible : null,
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
    'SELECT * FROM exhibitions WHERE is_visible = 1 ORDER BY order_index ASC'
  ).all();

  return jsonResponse({ exhibitions: results });
}

// GET /api/exhibitions/:slug - Singola mostra per slug
if (path.match(/^\/api\/exhibitions\/[\w-]+$/) && method === 'GET') {
  const slug = path.split('/').pop();
  const { results } = await env.DB.prepare(
    'SELECT * FROM exhibitions WHERE slug = ? AND is_visible = 1'
  ).bind(slug).all();

  if (results.length === 0) {
    return jsonResponse({ error: 'Exhibition not found' }, 404);
  }

  return jsonResponse({ exhibition: results[0] });
}

// POST /api/exhibitions - Crea nuova mostra
if (path === '/api/exhibitions' && method === 'POST') {
  const body = await request.json() as {
    slug: string;
    title: string;
    subtitle?: string;
    location: string;
    date: string;
    description?: string;
    info?: string;
    website?: string;
    image_url?: string;
    order_index?: number;
  };

  const { slug, title, subtitle, location, date, description, info, website, image_url, order_index } = body;

  if (!slug || !title || !location || !date) {
    return jsonResponse({ error: 'Slug, title, location and date are required' }, 400);
  }

  const result = await env.DB.prepare(
    `INSERT INTO exhibitions (slug, title, subtitle, location, date, description, info, website, image_url, order_index)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     RETURNING *`
  ).bind(
    slug,
    title,
    subtitle || null,
    location,
    date,
    description || null,
    info || null,
    website || null,
    image_url || null,
    order_index || 0
  ).first();

  return jsonResponse({ exhibition: result }, 201);
}

// PUT /api/exhibitions/:id - Aggiorna mostra
if (path.match(/^\/api\/exhibitions\/\d+$/) && method === 'PUT') {
  const id = path.split('/').pop();
  const body = await request.json();

  const result = await env.DB.prepare(
    `UPDATE exhibitions
     SET slug = COALESCE(?, slug),
         title = COALESCE(?, title),
         subtitle = COALESCE(?, subtitle),
         location = COALESCE(?, location),
         date = COALESCE(?, date),
         description = COALESCE(?, description),
         info = COALESCE(?, info),
         website = COALESCE(?, website),
         image_url = COALESCE(?, image_url),
         order_index = COALESCE(?, order_index),
         is_visible = COALESCE(?, is_visible),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?
     RETURNING *`
  ).bind(
    body.slug || null,
    body.title || null,
    body.subtitle || null,
    body.location || null,
    body.date || null,
    body.description || null,
    body.info || null,
    body.website || null,
    body.image_url || null,
    body.order_index || null,
    body.is_visible !== undefined ? body.is_visible : null,
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
  const language = url.searchParams.get('lang') || 'it';

  const { results } = await env.DB.prepare(
    `SELECT c.*, ct.text, ct.language
     FROM critics c
     LEFT JOIN critic_texts ct ON c.id = ct.critic_id AND ct.language = ?
     WHERE c.is_visible = 1
     ORDER BY c.order_index ASC`
  ).bind(language).all();

  return jsonResponse({ critics: results });
}

// GET /api/critics/:id - Singolo critico con tutti i testi
if (path.match(/^\/api\/critics\/\d+$/) && method === 'GET') {
  const id = path.split('/').pop();
  const language = url.searchParams.get('lang');

  let query;
  let params;

  if (language) {
    // Ritorna solo il testo per la lingua specifica
    query = `SELECT c.*, ct.text, ct.language
             FROM critics c
             LEFT JOIN critic_texts ct ON c.id = ct.critic_id AND ct.language = ?
             WHERE c.id = ? AND c.is_visible = 1`;
    params = [language, id];
  } else {
    // Ritorna tutti i testi in tutte le lingue
    query = `SELECT c.*,
             (SELECT json_group_object(language, text)
              FROM critic_texts
              WHERE critic_id = c.id) as texts
             FROM critics c
             WHERE c.id = ? AND c.is_visible = 1`;
    params = [id];
  }

  const result = await env.DB.prepare(query).bind(...params).first();

  if (!result) {
    return jsonResponse({ error: 'Critic not found' }, 404);
  }

  return jsonResponse({ critic: result });
}

// POST /api/critics - Crea nuovo critico
if (path === '/api/critics' && method === 'POST') {
  const body = await request.json() as {
    name: string;
    role: string;
    order_index?: number;
    texts?: { [key: string]: string }; // { it: "testo italiano", en: "english text", ... }
  };

  const { name, role, order_index, texts } = body;

  if (!name || !role) {
    return jsonResponse({ error: 'Name and role are required' }, 400);
  }

  // Inizia una transazione per inserire critico e testi
  const critic = await env.DB.prepare(
    `INSERT INTO critics (name, role, order_index)
     VALUES (?, ?, ?)
     RETURNING *`
  ).bind(
    name,
    role,
    order_index || 0
  ).first();

  if (texts && critic) {
    // Inserisci i testi per ogni lingua
    for (const [language, text] of Object.entries(texts)) {
      await env.DB.prepare(
        `INSERT INTO critic_texts (critic_id, language, text)
         VALUES (?, ?, ?)`
      ).bind(
        critic.id,
        language,
        text
      ).run();
    }
  }

  return jsonResponse({ critic }, 201);
}

// PUT /api/critics/:id - Aggiorna critico
if (path.match(/^\/api\/critics\/\d+$/) && method === 'PUT') {
  const id = path.split('/').pop();
  const body = await request.json();

  const result = await env.DB.prepare(
    `UPDATE critics
     SET name = COALESCE(?, name),
         role = COALESCE(?, role),
         order_index = COALESCE(?, order_index),
         is_visible = COALESCE(?, is_visible),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?
     RETURNING *`
  ).bind(
    body.name || null,
    body.role || null,
    body.order_index || null,
    body.is_visible !== undefined ? body.is_visible : null,
    id
  ).first();

  if (!result) {
    return jsonResponse({ error: 'Critic not found' }, 404);
  }

  // Se ci sono testi da aggiornare
  if (body.texts) {
    for (const [language, text] of Object.entries(body.texts)) {
      await env.DB.prepare(
        `INSERT INTO critic_texts (critic_id, language, text)
         VALUES (?, ?, ?)
         ON CONFLICT (critic_id, language)
         DO UPDATE SET text = excluded.text, updated_at = CURRENT_TIMESTAMP`
      ).bind(
        id,
        language,
        text
      ).run();
    }
  }

  return jsonResponse({ critic: result });
}

// DELETE /api/critics/:id - Elimina critico (i testi vengono eliminati automaticamente per CASCADE)
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

// ========== NEWSLETTER SUBSCRIBERS ==========

// GET /api/newsletter/subscribers - Lista iscritti newsletter
if (path === '/api/newsletter/subscribers' && method === 'GET') {
  const { results } = await env.DB.prepare(
    'SELECT * FROM newsletter_subscribers WHERE is_active = 1 ORDER BY subscribed_at DESC'
  ).all();

  return jsonResponse({ subscribers: results });
}

// POST /api/newsletter/subscribe - Iscrizione newsletter
if (path === '/api/newsletter/subscribe' && method === 'POST') {
  const body = await request.json() as { email: string };

  if (!body.email || !body.email.includes('@')) {
    return jsonResponse({ error: 'Valid email is required' }, 400);
  }

  try {
    const result = await env.DB.prepare(
      `INSERT INTO newsletter_subscribers (email) VALUES (?) RETURNING *`
    ).bind(body.email).first();

    return jsonResponse({ message: 'Successfully subscribed', subscriber: result }, 201);
  } catch (error: any) {
    if (error.message?.includes('UNIQUE')) {
      return jsonResponse({ error: 'Email already subscribed' }, 409);
    }
    throw error;
  }
}

// DELETE /api/newsletter/unsubscribe/:email - Disiscrizione newsletter
if (path.match(/^\/api\/newsletter\/unsubscribe\/[^/]+$/) && method === 'DELETE') {
  const email = decodeURIComponent(path.split('/').pop()!);

  const result = await env.DB.prepare(
    'UPDATE newsletter_subscribers SET is_active = 0 WHERE email = ? RETURNING *'
  ).bind(email).first();

  if (!result) {
    return jsonResponse({ error: 'Subscriber not found' }, 404);
  }

  return jsonResponse({ message: 'Successfully unsubscribed' });
}