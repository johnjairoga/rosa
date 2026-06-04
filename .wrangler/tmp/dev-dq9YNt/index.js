var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.js
async function validateWhatsAppNumber(request, env, corsHeaders) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
  try {
    const { number } = await request.json();
    if (!number) {
      return new Response(JSON.stringify({ error: "number is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
    const cleaned = number.replace(/[\s\-()]/g, "");
    if (!cleaned.match(/^(\+)?[\d]{7,}$/)) {
      return new Response(JSON.stringify({ valid: false, message: "Formato inv\xE1lido" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
    const apiKey = env.RAPIDAPI_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API configuration error" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
    const response = await fetch(
      "https://whatsapp-number-validator3.p.rapidapi.com/WhatsappNumberHasItWithToken",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-rapidapi-host": "whatsapp-number-validator3.p.rapidapi.com",
          "x-rapidapi-key": apiKey
        },
        body: JSON.stringify({ phone_number: cleaned })
      }
    );
    const data = await response.json();
    console.log("RapidAPI response:", data);
    const isValid = data.status === "valid" || data.has_whatsapp === true;
    return new Response(
      JSON.stringify({
        valid: isValid,
        message: isValid ? "\u2713 N\xFAmero validado correctamente" : "\u2717 Este n\xFAmero no tiene WhatsApp activo. Por favor, verifica el n\xFAmero e intenta con otro."
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
}
__name(validateWhatsAppNumber, "validateWhatsAppNumber");
var src_default = {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };
    const url = new URL(request.url);
    const pathname = url.pathname;
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders
      });
    }
    if (pathname === "/validate") {
      return validateWhatsAppNumber(request, env, corsHeaders);
    }
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
    try {
      let body;
      try {
        body = await request.json();
      } catch (e) {
        return new Response(JSON.stringify({ error: "Invalid JSON" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }
      const { number } = body;
      if (!number) {
        return new Response(JSON.stringify({ error: "number is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }
      const cleaned = number.replace(/[\s\-()]/g, "");
      if (!cleaned.match(/^(\+)?[\d]{7,}$/)) {
        return new Response(JSON.stringify({ error: "invalid number format" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }
      if (cleaned.startsWith("+")) {
        const digits = cleaned.slice(1);
        if (digits.length < 10 || digits.length > 15) {
          return new Response(JSON.stringify({ error: "invalid number length" }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders }
          });
        }
      }
      const apiKey = env.RAPIDAPI_KEY;
      if (!apiKey) {
        return new Response(JSON.stringify({ error: "API configuration error" }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }
      const cleanNumber = number.replace(/\D/g, "");
      const response = await fetch(
        `https://whatsapp-data1.p.rapidapi.com/picture/${cleanNumber}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-rapidapi-host": "whatsapp-data1.p.rapidapi.com",
            "x-rapidapi-key": apiKey
          }
        }
      );
      if (response.status === 404) {
        return new Response(JSON.stringify({ photoUrl: null }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }
      if (!response.ok) {
        return new Response(JSON.stringify({ photoUrl: null }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }
      const photoUrl = await response.text();
      return new Response(JSON.stringify({ photoUrl: photoUrl || null }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    } catch (error) {
      console.error("Error:", error);
      return new Response(JSON.stringify({ error: "Internal server error", details: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
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

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
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

// .wrangler/tmp/bundle-vwMFtf/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
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

// .wrangler/tmp/bundle-vwMFtf/middleware-loader.entry.ts
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
//# sourceMappingURL=index.js.map
