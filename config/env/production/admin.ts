// FILE: config/env/production/admin.ts
// SECURITY NOTE: Do NOT hardcode secrets in this file. Keep them in Railway env vars.

export default ({ env }) => {
  const isProd = env("NODE_ENV", "production") === "production";

  const adminJwt = env("ADMIN_JWT_SECRET", "");

  // Fail fast in production if missing.
  if (isProd && !adminJwt) {
    throw new Error(
      "Missing ADMIN_JWT_SECRET for production. Set ADMIN_JWT_SECRET in your hosting environment."
    );
  }

  // Keep your existing option, but allow a more general env name too.
  // If you later host admin on a separate domain, you can set:
  // STRAPI_ADMIN_URL=/admin  (default) OR https://cms.thednalabstore.com/admin
  const adminUrl =
    env("STRAPI_ADMIN_BACKEND_URL", "") ||
    env("STRAPI_ADMIN_URL", "") ||
    "/admin";

  return {
    auth: { secret: adminJwt },
    url: adminUrl,
    serveAdminPanel: env.bool("SERVE_ADMIN", true),
  };
};
