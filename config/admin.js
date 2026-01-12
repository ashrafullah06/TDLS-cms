// FILE: config/admin.js
"use strict";

/**
 * TDLC / Strapi Admin config (single-file).
 *
 * Goals:
 * - Keep your existing behavior (no breaking changes).
 * - Keep secrets in env vars only.
 * - Fail fast in production if critical admin secrets are missing.
 * - Support optional admin URL settings without forcing a separate-domain setup.
 */

function toStr(v) {
  return (v ?? "").toString().trim();
}

module.exports = ({ env }) => {
  const isProd = toStr(env("NODE_ENV", "production")) === "production";

  // Core admin secrets (must be present in production)
  const apiTokenSalt = toStr(env("API_TOKEN_SALT", ""));
  const transferTokenSalt = toStr(env("TRANSFER_TOKEN_SALT", ""));
  const adminJwtSecret = toStr(env("ADMIN_JWT_SECRET", ""));

  // Optional: Admin URL (relative is safest for same-domain admin)
  const adminUrl =
    toStr(env("STRAPI_ADMIN_BACKEND_URL", "")) ||
    toStr(env("STRAPI_ADMIN_URL", "")) ||
    "/admin";

  // Fail fast in production if missing any required secret
  if (isProd) {
    const missing = [];
    if (!apiTokenSalt) missing.push("API_TOKEN_SALT");
    if (!transferTokenSalt) missing.push("TRANSFER_TOKEN_SALT");
    if (!adminJwtSecret) missing.push("ADMIN_JWT_SECRET");

    if (missing.length) {
      throw new Error(
        `Missing required admin secret(s) in production: ${missing.join(
          ", "
        )}. Set them in Railway/Vercel environment variables.`
      );
    }
  }

  return {
    // Matches your original structure + adds safe URL + serveAdminPanel support
    apiToken: { salt: apiTokenSalt || undefined },
    transfer: { token: { salt: transferTokenSalt || undefined } },
    auth: { secret: adminJwtSecret || undefined },

    // Optional (does not break existing setup)
    url: adminUrl,
    serveAdminPanel: env.bool("SERVE_ADMIN", true),
  };
};
