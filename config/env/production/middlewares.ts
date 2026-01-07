// FILE: config/env/production/middlewares.ts

export default ({ env }) => {
  /**
   * Production CORS:
   * - Allow your storefront domain(s)
   * - Allow overriding via Railway Variables: CORS_ORIGINS
   *
   * Example:
   * CORS_ORIGINS="https://www.thednalabstore.com,https://thednalabstore.com"
   */
  const corsOriginsFromEnv = (env("CORS_ORIGINS", "") || "")
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean);

  const defaultOrigins = [
    "https://www.thednalabstore.com",
    "https://thednalabstore.com",
    // Optional local dev/testing:
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ];

  const corsOrigins =
    corsOriginsFromEnv.length > 0 ? corsOriginsFromEnv : defaultOrigins;

  /**
   * Public media host (Cloudflare R2 public domain).
   * Used to keep Strapi Admin previews working under a stricter CSP.
   */
  const mediaHost = env("MEDIA_PUBLIC_URL", "https://media.thednalabstore.com");

  return [
    "strapi::errors",

    /**
     * Security:
     * Production-safe CSP: keep defaults, and allow your media domain for image/media previews.
     * This avoids "broken images" in Strapi Admin when assets are served from media.thednalabstore.com.
     */
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

    /**
     * CORS:
     * Needed so your Vercel storefront can call:
     * https://cms.thednalabstore.com/api/...
     */
    {
      name: "strapi::cors",
      config: {
        origin: corsOrigins,
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
     */
    {
      name: "strapi::body",
      config: {
        formLimit: env("BODY_FORM_LIMIT", "200mb"),
        jsonLimit: env("BODY_JSON_LIMIT", "10mb"),
        textLimit: env("BODY_TEXT_LIMIT", "10mb"),
        formidable: {
          maxFileSize: env.int("BODY_MAX_FILE_SIZE", 200 * 1024 * 1024), // 200MB
        },
      },
    },

    "strapi::session",
    "strapi::favicon",
    "strapi::public",
  ];
};
