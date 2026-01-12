// FILE: config/middlewares.js

"use strict";

function toStr(v) {
  return (v ?? "").toString().trim();
}

function normalizeUrlToOrigin(input) {
  const s = toStr(input);
  if (!s) return "";
  try {
    // If it's already a full URL, return its origin
    return new URL(s).origin;
  } catch {
    // If someone accidentally provides only hostname, keep it as-is
    // (CSP will ignore invalid entries; better than crashing boot)
    return s.replace(/\/+$/, "");
  }
}

module.exports = ({ env }) => {
  const isProd = toStr(env("NODE_ENV")) === "production";

  const envOriginsRaw = toStr(env("CORS_ORIGINS", ""));
  const envOrigins = envOriginsRaw
    .split(",")
    .map((s) => toStr(s))
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
    "https://www.thednalabstore.com",
    "https://thednalabstore.com",
    "https://cms.thednalabstore.com",
  ];

  const origins =
    envOrigins.length > 0
      ? envOrigins
      : isProd
      ? prodDefaultOrigins
      : devDefaultOrigins;

  // Cloudflare R2 public media domain (used by uploads / previews)
  const mediaPublicUrl = toStr(env("MEDIA_PUBLIC_URL", "https://media.thednalabstore.com"));
  const mediaOrigin = normalizeUrlToOrigin(mediaPublicUrl);

  return [
    "strapi::errors",

    // Security headers + CSP (allow your R2 custom domain for previews)
    {
      name: "strapi::security",
      config: {
        contentSecurityPolicy: {
          useDefaults: true,
          directives: {
            // Keep defaults, extend only what you need
            "img-src": ["'self'", "data:", "blob:", mediaOrigin].filter(Boolean),
            "media-src": ["'self'", "data:", "blob:", mediaOrigin].filter(Boolean),

            // Admin may fetch some assets / previews; safe to include the media origin
            "connect-src": ["'self'", mediaOrigin].filter(Boolean),
          },
        },
      },
    },

    // CORS for storefront/admin to call Strapi APIs
    {
      name: "strapi::cors",
      config: {
        origin: origins,

        // supports cookie/session based flows
        credentials: true,

        // reduce preflight issues
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
        headers: [
          "Content-Type",
          "Authorization",
          "Origin",
          "Accept",
          "X-Requested-With",
        ],

        // keep CORS headers in Strapi error responses too
        keepHeaderOnError: true,
      },
    },

    // Better perceived speed for API/admin (does not affect R2 itself)
    "strapi::compression",

    "strapi::poweredBy",
    "strapi::logger",
    "strapi::query",
    "strapi::body",
    "strapi::session",
    "strapi::favicon",
    "strapi::public",
  ];
};
