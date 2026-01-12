// FILE: config/server.js
"use strict";

/**
 * TDLC / Strapi server config (single-file).
 *
 * Goals:
 * - Keep your existing behavior (no breaking changes).
 * - Enforce APP_KEYS only in production (fail fast to prevent crash loops later).
 * - Use a canonical public URL for correct absolute URLs behind Railway/proxy.
 * - Keep proxy enabled by default (Railway), but allow override via env.
 * - Keep webhook populateRelations default = false.
 */

function toStr(v) {
  return (v ?? "").toString().trim();
}

module.exports = ({ env }) => {
  const nodeEnv = toStr(env("NODE_ENV", "development"));
  const isProd = nodeEnv === "production";

  // Canonical public URL (Railway/proxy correctness)
  // Prefer STRAPI_PUBLIC_URL, then common platform vars, then sensible defaults.
  const publicUrl =
    toStr(env("STRAPI_PUBLIC_URL", "")) ||
    toStr(env("PUBLIC_URL", "")) ||
    toStr(env("URL", "")) ||
    (isProd ? "https://cms.thednalabstore.com" : "http://localhost:1337");

  // Admin URL (relative is safest for same-domain admin)
  const adminUrl = toStr(env("ADMIN_PUBLIC_URL", "/admin")) || "/admin";

  // Secrets must come from environment variables (Railway/Vercel/host runtime).
  const appKeys = env.array("APP_KEYS", []);

  // Production safety: never boot without proper APP_KEYS
  if (isProd && (!Array.isArray(appKeys) || appKeys.length < 2)) {
    throw new Error(
      "Missing/invalid APP_KEYS in production. Set APP_KEYS as a comma-separated list (at least 2 keys) in Railway Variables."
    );
  }

  return {
    host: env("HOST", "0.0.0.0"),
    port: env.int("PORT", 1337),

    // Ensures Strapi generates correct absolute URLs
    url: publicUrl,

    // Railway is behind a proxy; keep enabled by default (allow override if needed)
    proxy: env.bool("PROXY", true),

    admin: {
      url: adminUrl,
    },

    app: {
      keys: appKeys,
    },

    // Keep your intended webhook behavior (default = false)
    webhooks: {
      populateRelations: env.bool("WEBHOOKS_POPULATE_RELATIONS", false),
    },
  };
};
