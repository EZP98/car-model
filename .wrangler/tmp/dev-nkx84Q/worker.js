var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/worker.ts
var corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Cache-Control, Pragma, Authorization"
};
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders
    }
  });
}
__name(jsonResponse, "jsonResponse");
function isAuthenticated(request, env) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) return false;
  const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
  return token === env.API_KEY;
}
__name(isAuthenticated, "isAuthenticated");
function unauthorizedResponse() {
  return jsonResponse({ error: "Unauthorized - Invalid or missing API key" }, 401);
}
__name(unauthorizedResponse, "unauthorizedResponse");
var worker_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    if (method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    const writeOperations = ["POST", "PUT", "DELETE"];
    if (writeOperations.includes(method) && !isAuthenticated(request, env)) {
      return unauthorizedResponse();
    }
    try {
      if (path === "/api/artworks" && method === "GET") {
        const collectionId = url.searchParams.get("collection_id");
        const sectionId = url.searchParams.get("section_id");
        let query = "SELECT * FROM artworks";
        const params = [];
        if (collectionId) {
          query += " WHERE collection_id = ? AND is_visible = 1";
          params.push(collectionId);
        } else if (sectionId) {
          query += " WHERE section_id = ?";
          params.push(sectionId);
        } else {
          query += " WHERE is_visible = 1";
        }
        query += " ORDER BY order_index ASC";
        const { results } = await env.DB.prepare(query).bind(...params).all();
        return jsonResponse({ artworks: results });
      }
      if (path.match(/^\/api\/artworks\/\d+$/) && method === "GET") {
        const id = path.split("/").pop();
        const { results } = await env.DB.prepare(
          "SELECT * FROM artworks WHERE id = ?"
        ).bind(id).all();
        if (results.length === 0) {
          return jsonResponse({ error: "Artwork not found" }, 404);
        }
        return jsonResponse({ artwork: results[0] });
      }
      if (path === "/api/artworks" && method === "POST") {
        const body = await request.json();
        const { title, year, technique, dimensions, image_url, collection_id, section_id, order_index, is_visible } = body;
        if (!title || !collection_id && !section_id) {
          return jsonResponse({ error: "Title and collection_id are required" }, 400);
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
          order_index !== void 0 ? order_index : 0,
          is_visible !== void 0 ? is_visible ? 1 : 0 : 1
        ).first();
        return jsonResponse({ artwork: result }, 201);
      }
      if (path.match(/^\/api\/artworks\/\d+$/) && method === "PUT") {
        const id = path.split("/").pop();
        const body = await request.json();
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
          is_visible !== void 0 ? is_visible ? 1 : 0 : null,
          id
        ).first();
        if (!result) {
          return jsonResponse({ error: "Artwork not found" }, 404);
        }
        return jsonResponse({ artwork: result });
      }
      if (path.match(/^\/api\/artworks\/\d+$/) && method === "DELETE") {
        const id = path.split("/").pop();
        const result = await env.DB.prepare(
          "DELETE FROM artworks WHERE id = ? RETURNING *"
        ).bind(id).first();
        if (!result) {
          return jsonResponse({ error: "Artwork not found" }, 404);
        }
        return jsonResponse({ message: "Artwork deleted", artwork: result });
      }
      if (path === "/api/sections" && method === "GET") {
        const { results } = await env.DB.prepare(
          "SELECT * FROM sections ORDER BY order_index ASC"
        ).all();
        return jsonResponse({ sections: results });
      }
      if (path.match(/^\/api\/sections\/\d+$/) && method === "GET") {
        const id = path.split("/").pop();
        const { results } = await env.DB.prepare(
          "SELECT * FROM sections WHERE id = ?"
        ).bind(id).all();
        if (results.length === 0) {
          return jsonResponse({ error: "Section not found" }, 404);
        }
        return jsonResponse({ section: results[0] });
      }
      if (path.match(/^\/api\/sections\/\d+\/artworks$/) && method === "GET") {
        const id = path.split("/")[3];
        const { results } = await env.DB.prepare(
          "SELECT * FROM artworks WHERE section_id = ? ORDER BY order_index ASC"
        ).bind(id).all();
        return jsonResponse({ artworks: results });
      }
      if (path === "/api/sections" && method === "POST") {
        const body = await request.json();
        const { name, slug, description, order_index } = body;
        if (!name || !slug) {
          return jsonResponse({ error: "Name and slug are required" }, 400);
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
      if (path.match(/^\/api\/sections\/\d+$/) && method === "PUT") {
        const id = path.split("/").pop();
        const body = await request.json();
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
          return jsonResponse({ error: "Section not found" }, 404);
        }
        return jsonResponse({ section: result });
      }
      if (path.match(/^\/api\/sections\/\d+$/) && method === "DELETE") {
        const id = path.split("/").pop();
        const result = await env.DB.prepare(
          "DELETE FROM sections WHERE id = ? RETURNING *"
        ).bind(id).first();
        if (!result) {
          return jsonResponse({ error: "Section not found" }, 404);
        }
        return jsonResponse({ message: "Section deleted", section: result });
      }
      if (path === "/api/collections" && method === "GET") {
        const showAll = url.searchParams.get("all") === "true";
        const query = showAll ? "SELECT * FROM collections ORDER BY order_index ASC" : "SELECT * FROM collections WHERE is_visible = 1 ORDER BY order_index ASC";
        const { results } = await env.DB.prepare(query).all();
        return jsonResponse({ collections: results });
      }
      if (path.match(/^\/api\/collections\/[a-z0-9-]+$/) && method === "GET") {
        const slug = path.split("/").pop();
        const { results } = await env.DB.prepare(
          "SELECT * FROM collections WHERE slug = ?"
        ).bind(slug).all();
        if (results.length === 0) {
          return jsonResponse({ error: "Collection not found" }, 404);
        }
        return jsonResponse({ collection: results[0] });
      }
      if (path === "/api/collections" && method === "POST") {
        const body = await request.json();
        const { title, slug, description, image_url, order_index, is_visible } = body;
        if (!title || !slug) {
          return jsonResponse({ error: "Title and slug are required" }, 400);
        }
        const existingCollection = await env.DB.prepare(
          "SELECT id FROM collections WHERE slug = ?"
        ).bind(slug).first();
        if (existingCollection) {
          return jsonResponse({
            error: "Slug already exists",
            message: "Lo slug esiste gi\xE0. Per favore usa un nome diverso o modifica manualmente lo slug."
          }, 409);
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
          is_visible !== void 0 ? is_visible ? 1 : 0 : 1
        ).first();
        return jsonResponse({ collection: result }, 201);
      }
      if (path.match(/^\/api\/collections\/\d+$/) && method === "PUT") {
        const id = path.split("/").pop();
        const body = await request.json();
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
          is_visible !== void 0 ? is_visible ? 1 : 0 : null,
          id
        ).first();
        if (!result) {
          return jsonResponse({ error: "Collection not found" }, 404);
        }
        return jsonResponse({ collection: result });
      }
      if (path.match(/^\/api\/collections\/\d+$/) && method === "DELETE") {
        const id = path.split("/").pop();
        const result = await env.DB.prepare(
          "DELETE FROM collections WHERE id = ? RETURNING *"
        ).bind(id).first();
        if (!result) {
          return jsonResponse({ error: "Collection not found" }, 404);
        }
        return jsonResponse({ message: "Collection deleted", collection: result });
      }
      if (path === "/api/exhibitions" && method === "GET") {
        const { results } = await env.DB.prepare(
          "SELECT * FROM exhibitions ORDER BY date DESC"
        ).all();
        return jsonResponse({ exhibitions: results });
      }
      if (path.match(/^\/api\/exhibitions\/\d+$/) && method === "GET") {
        const id = path.split("/").pop();
        const { results } = await env.DB.prepare(
          "SELECT * FROM exhibitions WHERE id = ?"
        ).bind(id).all();
        if (results.length === 0) {
          return jsonResponse({ error: "Exhibition not found" }, 404);
        }
        return jsonResponse({ exhibition: results[0] });
      }
      if (path.match(/^\/api\/exhibitions\/[a-z0-9-]+$/) && method === "GET") {
        const slug = path.split("/").pop();
        const { results } = await env.DB.prepare(
          "SELECT * FROM exhibitions WHERE slug = ?"
        ).bind(slug).all();
        if (results.length === 0) {
          return jsonResponse({ error: "Exhibition not found" }, 404);
        }
        return jsonResponse({ exhibition: results[0] });
      }
      if (path === "/api/exhibitions" && method === "POST") {
        const body = await request.json();
        const { title, subtitle, location, date, description, info, website, image_url, slug, order_index, is_visible } = body;
        if (!title || !slug || !location || !date) {
          return jsonResponse({ error: "Title, slug, location and date are required" }, 400);
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
          is_visible !== void 0 ? is_visible ? 1 : 0 : 1
        ).first();
        return jsonResponse({ exhibition: result }, 201);
      }
      if (path.match(/^\/api\/exhibitions\/\d+$/) && method === "PUT") {
        const id = path.split("/").pop();
        const body = await request.json();
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
          is_visible !== void 0 ? is_visible ? 1 : 0 : null,
          id
        ).first();
        if (!result) {
          return jsonResponse({ error: "Exhibition not found" }, 404);
        }
        return jsonResponse({ exhibition: result });
      }
      if (path.match(/^\/api\/exhibitions\/\d+$/) && method === "DELETE") {
        const id = path.split("/").pop();
        const result = await env.DB.prepare(
          "DELETE FROM exhibitions WHERE id = ? RETURNING *"
        ).bind(id).first();
        if (!result) {
          return jsonResponse({ error: "Exhibition not found" }, 404);
        }
        return jsonResponse({ message: "Exhibition deleted", exhibition: result });
      }
      if (path === "/api/critics" && method === "GET") {
        const { results } = await env.DB.prepare(
          "SELECT * FROM critics ORDER BY id ASC"
        ).all();
        return jsonResponse({ critics: results });
      }
      if (path.match(/^\/api\/critics\/\d+$/) && method === "GET") {
        const id = path.split("/").pop();
        const { results } = await env.DB.prepare(
          "SELECT * FROM critics WHERE id = ?"
        ).bind(id).all();
        if (results.length === 0) {
          return jsonResponse({ error: "Critic not found" }, 404);
        }
        return jsonResponse({ critic: results[0] });
      }
      if (path === "/api/critics" && method === "POST") {
        const body = await request.json();
        const { name, role, text, text_it, text_en, order_index, is_visible } = body;
        if (!name || !role || !text) {
          return jsonResponse({ error: "Name, role and text are required" }, 400);
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
          is_visible !== void 0 ? is_visible ? 1 : 0 : 1
        ).first();
        return jsonResponse({ critic: result }, 201);
      }
      if (path.match(/^\/api\/critics\/\d+$/) && method === "PUT") {
        const id = path.split("/").pop();
        const body = await request.json();
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
          is_visible !== void 0 ? is_visible ? 1 : 0 : null,
          id
        ).first();
        if (!result) {
          return jsonResponse({ error: "Critic not found" }, 404);
        }
        return jsonResponse({ critic: result });
      }
      if (path.match(/^\/api\/critics\/\d+$/) && method === "DELETE") {
        const id = path.split("/").pop();
        const result = await env.DB.prepare(
          "DELETE FROM critics WHERE id = ? RETURNING *"
        ).bind(id).first();
        if (!result) {
          return jsonResponse({ error: "Critic not found" }, 404);
        }
        return jsonResponse({ message: "Critic deleted", critic: result });
      }
      if (path === "/api/content" && method === "GET") {
        const { results } = await env.DB.prepare(
          "SELECT * FROM content_blocks"
        ).all();
        return jsonResponse({ content: results });
      }
      if (path.match(/^\/api\/content\/[\w-]+$/) && method === "GET") {
        const key = path.split("/").pop();
        const { results } = await env.DB.prepare(
          "SELECT * FROM content_blocks WHERE key = ?"
        ).bind(key).all();
        if (results.length === 0) {
          return jsonResponse({ error: "Content block not found" }, 404);
        }
        return jsonResponse({ content: results[0] });
      }
      if (path.match(/^\/api\/content\/[\w-]+$/) && method === "PUT") {
        const key = path.split("/").pop();
        const body = await request.json();
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
          return jsonResponse({ error: "Content block not found" }, 404);
        }
        return jsonResponse({ content: result });
      }
      if (path === "/api/upload" && method === "POST") {
        if (!env.IMAGES) {
          return jsonResponse({ error: "R2 storage not configured" }, 503);
        }
        const formData = await request.formData();
        const file = formData.get("file");
        if (!file) {
          return jsonResponse({ error: "No file provided" }, 400);
        }
        const timestamp = Date.now();
        const filename = `${timestamp}-${file.name}`;
        await env.IMAGES.put(filename, file.stream(), {
          httpMetadata: {
            contentType: file.type
          }
        });
        const imageUrl = `/images/${filename}`;
        return jsonResponse({
          message: "File uploaded successfully",
          url: imageUrl,
          filename
        }, 201);
      }
      if (path === "/api/media" && method === "GET") {
        if (!env.IMAGES) {
          return jsonResponse({ error: "R2 storage not configured" }, 503);
        }
        const listed = await env.IMAGES.list();
        const images = listed.objects.map((obj) => ({
          filename: obj.key,
          url: `/images/${obj.key}`,
          size: obj.size,
          uploaded: obj.uploaded.toISOString()
        })).sort((a, b) => new Date(b.uploaded).getTime() - new Date(a.uploaded).getTime());
        return jsonResponse({ images });
      }
      if (path === "/api/storage/stats" && method === "GET") {
        if (!env.IMAGES) {
          return jsonResponse({ error: "R2 storage not configured" }, 503);
        }
        const listed = await env.IMAGES.list();
        let totalSize = 0;
        let originalsCount = 0;
        let originalsSize = 0;
        let thumbnailsCount = 0;
        let thumbnailsSize = 0;
        for (const obj of listed.objects) {
          totalSize += obj.size;
          if (obj.key.includes("_thumb")) {
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
      if (path === "/api/regenerate-thumbnails" && method === "GET") {
        if (!env.IMAGES) {
          return jsonResponse({ error: "R2 storage not configured" }, 503);
        }
        const listed = await env.IMAGES.list();
        const originals = listed.objects.filter((obj) => !obj.key.includes("_thumb"));
        const thumbnails = listed.objects.filter((obj) => obj.key.includes("_thumb"));
        const missingThumbnails = [];
        for (const original of originals) {
          const thumbName = original.key.replace(/\.(jpg|jpeg|png|gif|webp)$/i, "_thumb.$1");
          const hasThumb = thumbnails.some((t) => t.key === thumbName);
          if (!hasThumb) {
            missingThumbnails.push(original.key);
          }
        }
        return jsonResponse({
          missing: missingThumbnails,
          count: missingThumbnails.length
        });
      }
      if (path.match(/^\/images\/.+$/) && method === "GET") {
        if (!env.IMAGES) {
          return jsonResponse({ error: "R2 storage not configured" }, 503);
        }
        const filename = path.replace("/images/", "");
        const object = await env.IMAGES.get(filename);
        if (!object) {
          return jsonResponse({ error: "Image not found" }, 404);
        }
        return new Response(object.body, {
          headers: {
            "Content-Type": object.httpMetadata?.contentType || "application/octet-stream",
            "Cache-Control": "public, max-age=31536000",
            ...corsHeaders
          }
        });
      }
      if (path.match(/^\/api\/images\/.+\/usage$/) && method === "GET") {
        const filename = path.split("/")[3];
        const imageUrl = `/images/${filename}`;
        const artworksUsage = await env.DB.prepare(
          "SELECT id, title FROM artworks WHERE image_url = ?"
        ).bind(imageUrl).all();
        const collectionsUsage = await env.DB.prepare(
          "SELECT id, title FROM collections WHERE image_url = ?"
        ).bind(imageUrl).all();
        const exhibitionsUsage = await env.DB.prepare(
          "SELECT id, title FROM exhibitions WHERE image_url = ?"
        ).bind(imageUrl).all();
        const usage = {
          artworks: artworksUsage.results || [],
          collections: collectionsUsage.results || [],
          exhibitions: exhibitionsUsage.results || [],
          total: (artworksUsage.results?.length || 0) + (collectionsUsage.results?.length || 0) + (exhibitionsUsage.results?.length || 0)
        };
        return jsonResponse({ usage });
      }
      if (path.match(/^\/api\/images\/[^/]+$/) && method === "DELETE") {
        if (!env.IMAGES) {
          return jsonResponse({ error: "R2 storage not configured" }, 503);
        }
        const filename = path.split("/")[3];
        await env.IMAGES.delete(filename);
        const thumbFilename = filename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, "_thumb.$1");
        await env.IMAGES.delete(thumbFilename);
        return jsonResponse({
          message: "Image deleted successfully",
          filename
        });
      }
      if (path === "/api/newsletter" && method === "POST") {
        const body = await request.json();
        const { email } = body;
        if (!email || !email.includes("@")) {
          return jsonResponse({ error: "Valid email is required" }, 400);
        }
        const existing = await env.DB.prepare(
          "SELECT id FROM newsletter_subscribers WHERE email = ?"
        ).bind(email.toLowerCase()).first();
        if (existing) {
          return jsonResponse({
            message: "Email already subscribed",
            alreadySubscribed: true
          }, 200);
        }
        const ipAddress = request.headers.get("CF-Connecting-IP") || request.headers.get("X-Real-IP") || "unknown";
        const userAgent = request.headers.get("User-Agent") || "unknown";
        await env.DB.prepare(
          `INSERT INTO newsletter_subscribers (email, ip_address, user_agent)
           VALUES (?, ?, ?)`
        ).bind(email.toLowerCase(), ipAddress, userAgent).run();
        return jsonResponse({
          message: "Successfully subscribed to newsletter",
          email: email.toLowerCase()
        }, 201);
      }
      if (path === "/api/newsletter" && method === "GET") {
        const { results } = await env.DB.prepare(
          "SELECT id, email, subscribed_at FROM newsletter_subscribers ORDER BY subscribed_at DESC"
        ).all();
        return jsonResponse({ subscribers: results });
      }
      if (path.match(/^\/api\/newsletter\/\d+$/) && method === "DELETE") {
        const id = path.split("/").pop();
        await env.DB.prepare(
          "DELETE FROM newsletter_subscribers WHERE id = ?"
        ).bind(id).run();
        return jsonResponse({ message: "Subscriber removed successfully" });
      }
      return jsonResponse({ error: "Not found" }, 404);
    } catch (error) {
      console.error("Worker error:", error);
      return jsonResponse({
        error: "Internal server error",
        message: error.message
      }, 500);
    }
  }
};

// ../../../../../opt/homebrew/lib/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../../../opt/homebrew/lib/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-p6RWeI/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// ../../../../../opt/homebrew/lib/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-p6RWeI/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=worker.js.map
