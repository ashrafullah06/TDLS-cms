// FILE: config/env/production/server.ts
// SECURITY NOTE: Do NOT hardcode secrets (APP_KEYS, salts, JWT secrets) in this file.
// They must come from Railway environment variables.

export default ({ env }) => {
  const isProd = env("NODE_ENV", "production") === "production";

  // Canonical public URL for correct absolute URLs/redirects behind Railway + custom domain
  const publicUrl =
    env("STRAPI_PUBLIC_URL", "") ||
    env("PUBLIC_URL", "") ||
    env("URL", "") ||
    (isProd ? "https://cms.thednalabstore.com" : "http://localhost:1337");

  // Admin URL (relative is safest for same-domain admin)
  const adminUrl = env("ADMIN_PUBLIC_URL", "/admin");

  // In production we must have APP_KEYS. Fail fast if missing.
  const appKeys = env.array("APP_KEYS", []);
  if (isProd && (!appKeys || appKeys.length < 2)) {
    throw new Error(
      "Missing/invalid APP_KEYS. In production you must set APP_KEYS as a comma-separated list (at least 2 keys)."
    );
  }

  return {
    host: env("HOST", "0.0.0.0"),
    port: env.int("PORT", 1337),

    // Ensures Strapi generates correct absolute URLs
    url: publicUrl,

    // Railway is behind a proxy; enabling proxy improves correct protocol/IP handling
    proxy: env.bool("PROXY", true),

    admin: {
      url: adminUrl,
    },

    app: {
      keys: appKeys,
    },

    // Keep your intended webhook behavior
    webhooks: {
      populateRelations: env.bool("WEBHOOKS_POPULATE_RELATIONS", false),
    },
  };
};
