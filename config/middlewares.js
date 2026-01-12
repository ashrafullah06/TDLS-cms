// FILE: config/middlewares.js
"use strict";

function toStr(v) {
  return (v ?? "").toString().trim();
}

function stripTrailingSlashes(s) {
  return toStr(s).replace(/\/+$/, "");
}

function normalizeUrlToOrigin(input) {
  const s = toStr(input);
  if (!s) return "";
  try {
    return new URL(s).origin;
  } catch {
    // If someone accidentally provides only hostname, keep it non-fatal.
    // Strapi will ignore invalid CSP entries rather than crashing boot.
    return stripTrailingSlashes(s);
  }
}

module.exports = ({ env }) => {
  const isProd = toStr(env("NODE_ENV")) === "production";

  // CORS origins: allow overriding via env (comma-separated)
  const envOriginsRaw = toStr(env("CORS_ORIGINS", ""));
  const envOrigins = envOriginsRaw
    .split(",")
    .map((s) => normalizeUrlToOrigin(s))
    .filter(Boolean);

  // Production-safe defaults
  const prodDefaultOrigins = [
    "https://www.thednalabstore.com",
    "https://thednalabstore.com",
    "https://cms.thednalabstore.com",
  ];

  // Dev defaults (local + prod domains)
  const devDefaultOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:1337",
    "http://127.0.0.1:1337",
    ...prodDefaultOrigins,
  ];

  const origins =
    envOrigins.length > 0
      ? envOrigins
      : isProd
      ? prodDefaultOrigins
      : devDefaultOrigins;

  // Cloudflare R2 public media domain (used by uploads / previews)
  const mediaPublicUrl = toStr(
    env("MEDIA_PUBLIC_URL", "https://media.thednalabstore.com")
  );
  const mediaOrigin = normalizeUrlToOrigin(mediaPublicUrl);

  return [
    "strapi::errors",

    /**
     * Security headers + CSP
     * - Keep Strapi defaults
     * - Allow your media domain for Admin previews + asset rendering
     */
    {
      name: "strapi::security",
      config: {
        contentSecurityPolicy: {
          useDefaults: true,
          directives: {
            "img-src": ["'self'", "data:", "blob:", mediaOrigin].filter(Boolean),
            "media-src": ["'self'", "data:", "blob:", mediaOrigin].filter(Boolean),

            // Admin preview / uploads / fetches can require connect-src allowances
            "connect-src": ["'self'", mediaOrigin].filter(Boolean),
          },
        },
      },
    },

    /**
     * CORS for storefront/admin to call Strapi APIs
     */
    {
      name: "strapi::cors",
      config: {
        origin: origins,
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
        headers: [
          "Content-Type",
          "Authorization",
          "Origin",
          "Accept",
          "X-Requested-With",
        ],
        keepHeaderOnError: true,
      },
    },

    "strapi::poweredBy",
    "strapi::logger",
    "strapi::query",

    /**
     * Body limits: keep uploads stable (R2 provider still uses Strapi upload endpoints).
     * Uses env keys if present, otherwise safe defaults.
     */
    {
      name: "strapi::body",
      config: {
        formLimit: toStr(env("BODY_FORM_LIMIT", "200mb")),
        jsonLimit: toStr(env("BODY_JSON_LIMIT", "10mb")),
        textLimit: toStr(env("BODY_TEXT_LIMIT", "10mb")),
        formidable: {
          maxFileSize: env.int("BODY_MAX_FILE_SIZE", 200 * 1024 * 1024), // 200MB
        },
      },
    },

    // Better perceived speed for API/admin (does not affect R2 itself)
    "strapi::compression",

    "strapi::session",
    "strapi::favicon",
    "strapi::public",
  ];
};
