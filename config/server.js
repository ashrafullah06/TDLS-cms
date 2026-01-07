// FILE: config/server.js
"use strict";

module.exports = ({ env }) => {
  const nodeEnv = env("NODE_ENV", "development");
  const isProd = nodeEnv === "production";

  // Secrets must come from environment variables (Railway/Vercel/host runtime).
  const keysFromEnv = env.array("APP_KEYS", []);

  // Production safety: never boot without proper APP_KEYS
  if (isProd && (!keysFromEnv || keysFromEnv.length < 2)) {
    throw new Error(
      "Missing/invalid APP_KEYS in production. Set APP_KEYS as a comma-separated list (at least 2 keys) in Railway Variables."
    );
  }

  // Canonical public URL (Railway/proxy correctness)
  // Prefer STRAPI_PUBLIC_URL, but fall back to common platform variables if present.
  const publicUrl =
    env("STRAPI_PUBLIC_URL", "") ||
    env("PUBLIC_URL", "") ||
    env("URL", "") ||
    (isProd ? "https://cms.thednalabstore.com" : "http://localhost:1337");

  // Admin URL (relative is safest for same-domain admin)
  const adminUrl = env("ADMIN_PUBLIC_URL", "/admin");

  return {
    host: env("HOST", "0.0.0.0"),
    port: env.int("PORT", 1337),

    url: publicUrl,

    // Railway is behind a proxy; keep this enabled (but allow override if needed)
    proxy: env.bool("PROXY", true),

    admin: {
      url: adminUrl,
    },

    app: {
      keys: keysFromEnv,
    },

    // Keep your intended webhook behavior (default = false)
    webhooks: {
      populateRelations: env.bool("WEBHOOKS_POPULATE_RELATIONS", false),
    },
  };
};
