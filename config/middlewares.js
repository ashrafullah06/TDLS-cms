// FILE: config/middlewares.js

module.exports = ({ env }) => {
  const isProd = env("NODE_ENV") === "production";

  const envOriginsRaw = env("CORS_ORIGINS", "");
  const envOrigins = envOriginsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // Production-safe defaults (storefront only)
  const prodDefaultOrigins = [
    "https://www.thednalabstore.com",
    "https://thednalabstore.com",
    "https://cms.thednalabstore.com",
  ];

  // Dev defaults (local + prod domains)
  const devDefaultOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://www.thednalabstore.com",
    "https://thednalabstore.com",
    "https://cms.thednalabstore.com",
  ];

  const origins =
    envOrigins.length > 0 ? envOrigins : isProd ? prodDefaultOrigins : devDefaultOrigins;

  // Cloudflare R2 public media domain (used by uploads)
  // Keep this aligned with your real public media host.
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
            // Allow images/media from your R2 public domain (and standard safe sources)
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
        headers: "*",
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
