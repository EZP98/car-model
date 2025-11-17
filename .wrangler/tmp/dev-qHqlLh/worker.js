var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/worker.ts
var corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
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
var worker_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    if (method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    try {
      if (path === "/api/artworks" && method === "GET") {
        const sectionId = url.searchParams.get("section_id");
        let query = "SELECT * FROM artworks";
        const params = [];
        if (sectionId) {
          query += " WHERE section_id = ?";
          params.push(sectionId);
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
        const { title, description, image_url, section_id, order_index } = body;
        if (!title || !section_id) {
          return jsonResponse({ error: "Title and section_id are required" }, 400);
        }
        const result = await env.DB.prepare(
          `INSERT INTO artworks (title, description, image_url, section_id, order_index)
           VALUES (?, ?, ?, ?, ?)
           RETURNING *`
        ).bind(
          title,
          description || null,
          image_url || null,
          section_id,
          order_index || 0
        ).first();
        return jsonResponse({ artwork: result }, 201);
      }
      if (path.match(/^\/api\/artworks\/\d+$/) && method === "PUT") {
        const id = path.split("/").pop();
        const body = await request.json();
        const { title, description, image_url, section_id, order_index } = body;
        const result = await env.DB.prepare(
          `UPDATE artworks
           SET title = COALESCE(?, title),
               description = COALESCE(?, description),
               image_url = COALESCE(?, image_url),
               section_id = COALESCE(?, section_id),
               order_index = COALESCE(?, order_index),
               updated_at = CURRENT_TIMESTAMP
           WHERE id = ?
           RETURNING *`
        ).bind(
          title || null,
          description || null,
          image_url || null,
          section_id || null,
          order_index || null,
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
        if (!env.ARTWORKS) {
          return jsonResponse({ error: "R2 storage not configured" }, 503);
        }
        const formData = await request.formData();
        const file = formData.get("file");
        if (!file) {
          return jsonResponse({ error: "No file provided" }, 400);
        }
        const timestamp = Date.now();
        const filename = `${timestamp}-${file.name}`;
        await env.ARTWORKS.put(filename, file.stream(), {
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
      if (path.match(/^\/images\/.+$/) && method === "GET") {
        if (!env.ARTWORKS) {
          return jsonResponse({ error: "R2 storage not configured" }, 503);
        }
        const filename = path.replace("/images/", "");
        const object = await env.ARTWORKS.get(filename);
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

// .wrangler/tmp/bundle-oU4TDu/middleware-insertion-facade.js
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

// .wrangler/tmp/bundle-oU4TDu/middleware-loader.entry.ts
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
