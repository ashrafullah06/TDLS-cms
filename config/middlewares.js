// FILE: config/middlewares.js

module.exports = ({ env }) => {
  const isProd = env("NODE_ENV") === "production";

  const envOriginsRaw = env("CORS_ORIGINS", "");
  const envOrigins = envOriginsRaw
    .split(",")
    .map((s) => s.trim())
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
    envOrigins.length > 0 ? envOrigins : isProd ? prodDefaultOrigins : devDefaultOrigins;

  // Cloudflare R2 public media domain (used by uploads)
  const mediaHost = env("MEDIA_PUBLIC_URL", "https://media.thednalabstore.com");

  return [
    "strapi::errors",

    // ✅ Production hardening + allow your media domain in CSP so admin can preview images
    {
      name: "strapi::security",
      config: {
        contentSecurityPolicy: {
          useDefaults: true,
          directives: {
            "img-src": ["'self'", "data:", "blob:", mediaHost],
            "media-src": ["'self'", "data:", "blob:", mediaHost],
          },
        },
      },
    },

    {
      name: "strapi::cors",
      config: {
        origin: origins,

        // ✅ future-proof for cookie/session based flows (and avoids subtle CORS issues)
        credentials: true,

        // ✅ reduce preflight issues
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
        headers: [
          "Content-Type",
          "Authorization",
          "Origin",
          "Accept",
          "X-Requested-With",
        ],

        // ✅ keep CORS headers in Strapi error responses too
        keepHeaderOnError: true,
      },
    },

    "strapi::poweredBy",
    "strapi::logger",
    "strapi::query",
    "strapi::body",
    "strapi::session",
    "strapi::favicon",
    "strapi::public",
  ];
};
