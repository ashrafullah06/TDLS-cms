// FILE: config/database.js
"use strict";

const fs = require("fs");
const path = require("path");
const { parse } = require("pg-connection-string");

/**
 * TDLC / Strapi v4 Postgres config (single-file).
 *
 * Goals:
 * - Keep your existing behavior (no breaking changes).
 * - Support Neon pooler URLs + owner/user URLs.
 * - Resolve indirections: "$VAR", "${VAR}", "%VAR%", and "key-as-value".
 * - Sanitize quotes/whitespace so DNS host is not corrupted.
 * - OPTIONAL: load .env files ONLY if DB vars are missing (build container safety).
 * - Clamp pool max when Neon URL includes connection_limit (prevents timeouts).
 * - Use pool.acquireTimeoutMillis (Tarn/Knex compatible).
 */

module.exports = ({ env }) => {
  const toStr = (v) => (v ?? "").toString().trim();

  const sanitize = (v) => {
    let s = toStr(v);
    if (
      (s.startsWith('"') && s.endsWith('"')) ||
      (s.startsWith("'") && s.endsWith("'"))
    ) {
      s = s.slice(1, -1).trim();
    }
    return s;
  };

  const hasValue = (v) => !!sanitize(v);

  const stripTrailingSlashes = (u) => sanitize(u).replace(/\/+$/, "");

  const maskUrl = (u) =>
    String(u || "").replace(/:\/\/([^:]+):([^@]+)@/i, "://$1:****@");

  // Strapi env helpers are usually available; add safe fallbacks just in case.
  const envBool = (key, defaultValue = false) => {
    if (env && typeof env.bool === "function") return env.bool(key, defaultValue);
    const v = sanitize(env(key, defaultValue ? "true" : "false")).toLowerCase();
    if (!v) return defaultValue;
    return v === "1" || v === "true" || v === "yes" || v === "on";
  };

  const envInt = (key, defaultValue) => {
    if (env && typeof env.int === "function") return env.int(key, defaultValue);
    const raw = sanitize(env(key, ""));
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) ? n : defaultValue;
  };

  /**
   * Minimal, dependency-free .env loader.
   * Purpose: helps `strapi build` succeed when env vars are not injected at build-time
   *          but an env file exists in the repo/container.
   *
   * - Does NOT overwrite existing process.env keys
   * - Loads in this order (first match wins for missing keys):
   *   1) .env
   *   2) .env.<NODE_ENV> (if NODE_ENV is set)
   *   3) .env.production
   *   4) .env.development
   */
  const loadEnvFilesIfNeeded = () => {
    try {
      const nodeEnv = sanitize(process.env.NODE_ENV || env("NODE_ENV") || "").toLowerCase();

      const candidates = [".env"];
      if (nodeEnv) candidates.push(`.env.${nodeEnv}`);

      if (!candidates.includes(".env.production")) candidates.push(".env.production");
      if (!candidates.includes(".env.development")) candidates.push(".env.development");

      const loaded = [];

      for (const filename of candidates) {
        const filePath = path.join(process.cwd(), filename);
        if (!fs.existsSync(filePath)) continue;

        const raw = fs.readFileSync(filePath, "utf8");
        const lines = raw.split(/\r?\n/);

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) continue;

          // allow `export KEY=...`
          const normalized = trimmed.startsWith("export ")
            ? trimmed.slice(7).trim()
            : trimmed;

          const eq = normalized.indexOf("=");
          if (eq <= 0) continue;

          const key = normalized.slice(0, eq).trim();
          let val = normalized.slice(eq + 1).trim();

          if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
          ) {
            val = val.slice(1, -1);
          }

          if (typeof process.env[key] === "undefined") {
            process.env[key] = val;
          }
        }

        loaded.push(filename);
      }

      if (loaded.length) {
        // eslint-disable-next-line no-console
        console.log("[TDLC][db-config] Loaded env file(s):", loaded);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(
        "[TDLC][db-config] Env file load skipped due to error:",
        e?.message || e
      );
    }
  };

  const resolveIndirection = (value) => {
    const raw = sanitize(value);
    if (!raw) return raw;

    // $VAR
    if (raw.startsWith("$") && raw.length > 1) {
      const refName = raw.slice(1).trim();
      return sanitize(env(refName)) || raw;
    }

    // ${VAR}
    if (raw.startsWith("${") && raw.endsWith("}")) {
      const refName = raw.slice(2, -1).trim();
      return sanitize(env(refName)) || raw;
    }

    // %VAR% (Windows)
    if (raw.startsWith("%") && raw.endsWith("%") && raw.length > 2) {
      const refName = raw.slice(1, -1).trim();
      return sanitize(env(refName)) || raw;
    }

    // Key-as-value convenience
    const knownKeys = [
      "DATABASE_URL",
      "STRAPI_DB_OWNER_POOLER_CB",
      "STRAPI_DB_USER_POOLER_CB",
    ];
    if (knownKeys.includes(raw)) {
      return sanitize(env(raw)) || raw;
    }

    return raw;
  };

  // 1) Prefer a single DATABASE_URL; fallback to named Neon pooler vars.
  let url =
    env("DATABASE_URL") ||
    env("STRAPI_DB_OWNER_POOLER_CB") ||
    env("STRAPI_DB_USER_POOLER_CB");

  // If missing (common in build containers), attempt env file load (non-destructive).
  if (!url) {
    loadEnvFilesIfNeeded();
    url =
      env("DATABASE_URL") ||
      env("STRAPI_DB_OWNER_POOLER_CB") ||
      env("STRAPI_DB_USER_POOLER_CB");
  }

  url = resolveIndirection(url);

  if (!url) {
    throw new Error(
      "[TDLC][db-config] Missing DATABASE_URL / STRAPI_DB_OWNER_POOLER_CB / STRAPI_DB_USER_POOLER_CB. " +
        "Define DATABASE_URL (recommended) or set one of the Neon pooler vars in production env."
    );
  }

  // 2) Parse URL into parts
  const parsed = parse(url);

  const host = parsed.host;
  const database = parsed.database;
  const user = parsed.user;
  const password = parsed.password;
  const port = parsed.port ? Number(parsed.port) : 5432;

  // Fail fast (without leaking credentials)
  if (!host || !database || !user) {
    throw new Error(
      `[TDLC][db-config] Invalid DATABASE_URL: missing host/database/user. url=${maskUrl(
        url
      )}`
    );
  }

  // 3) Neon pooler hints: connection_limit / pgbouncer
  let connectionLimit = null;
  let pgbouncerEnabled = false;

  try {
    const u = new URL(url);
    const cl = u.searchParams.get("connection_limit");
    const pb = u.searchParams.get("pgbouncer");
    const n = cl ? Number(cl) : NaN;

    if (Number.isFinite(n) && n > 0) connectionLimit = n;
    if (typeof pb === "string") pgbouncerEnabled = pb.toLowerCase() === "true";
  } catch {
    // ignore
  }

  // 4) SSL defaults (Neon typically requires SSL)
  const sslEnabled = envBool("DATABASE_SSL", true);
  const sslRejectUnauthorized = envBool("DATABASE_SSL_REJECT_UNAUTHORIZED", false);

  // 5) Pool tuning (pgbouncer-safe)
  const poolMin = envInt("DB_POOL_MIN", 0);
  const poolMaxRequested = envInt("DB_POOL_MAX", envInt("PG_POOL_MAX", 10));

  const poolMax =
    connectionLimit != null
      ? Math.max(1, Math.min(poolMaxRequested, connectionLimit))
      : poolMaxRequested;

  const timeoutMs = envInt("DATABASE_CONNECTION_TIMEOUT", 60000);

  if (pgbouncerEnabled && poolMin > 0) {
    // eslint-disable-next-line no-console
    console.warn(
      "[TDLC][db-config] pgbouncer=true with DB_POOL_MIN > 0 may keep idle connections open. Consider DB_POOL_MIN=0 in production."
    );
  }

  // 6) Optional: if you use a public DB base URL elsewhere, keep it sanitized (no behavior change)
  // (Not required, but safe to keep a consistent helper available)
  void stripTrailingSlashes;

  const client = env("DATABASE_CLIENT", "postgres");

  const config = {
    connection: {
      client,
      connection: {
        host,
        port,
        database,
        user,
        password,
        ssl: sslEnabled ? { rejectUnauthorized: sslRejectUnauthorized } : false,
      },
      pool: {
        min: poolMin,
        max: poolMax,
        acquireTimeoutMillis: timeoutMs,
      },
      debug: envBool("DATABASE_DEBUG", false),
    },
  };

  // Safe summary (no password)
  // eslint-disable-next-line no-console
  console.log("[TDLC][db-config] Final DB config summary:", {
    client,
    host,
    port,
    database,
    user,
    ssl: !!config.connection.connection.ssl,
    poolMin,
    poolMax,
    poolMaxRequested,
    connectionLimit,
    pgbouncerEnabled,
  });

  return config;
};
