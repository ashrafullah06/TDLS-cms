// FILE: config/database.js
'use strict';

const fs = require('fs');
const path = require('path');
const { parse } = require('pg-connection-string');

/**
 * Strapi v4 Postgres config for Neon + owner/user URLs.
 *
 * Works with your existing scripts in package.json:
 *   - develop:user
 *   - develop:owner (dotenv + cross-env DATABASE_URL=STRAPI_DB_OWNER_POOLER_CB ...)
 *
 * It:
 *   - Resolves "$VAR", "${VAR}", "%VAR%" and also the literal env key name as value
 *   - Sanitizes quotes/whitespace so DNS host is not corrupted
 *   - Always returns { connection: { client, connection: { ... }, pool, debug } }
 *
 * IMPORTANT:
 * - Tarn (Knex pool) does NOT support `acquireConnectionTimeout` inside `pool`.
 *   Use `pool.acquireTimeoutMillis` instead.
 */

module.exports = ({ env }) => {
  console.log('[TDLC][db-config] Loading config/database.js');

  // Helper: mask credentials in logs
  const maskUrl = (u) =>
    String(u || '').replace(/:\/\/([^:]+):([^@]+)@/i, '://$1:****@');

  // Helper: sanitize raw env value (trim + strip wrapping quotes)
  const sanitize = (v) => {
    let s = String(v ?? '').trim();
    // strip wrapping quotes (common on Windows/env files)
    if (
      (s.startsWith('"') && s.endsWith('"')) ||
      (s.startsWith("'") && s.endsWith("'"))
    ) {
      s = s.slice(1, -1).trim();
    }
    return s;
  };

  /**
   * Minimal, dependency-free .env loader.
   * Purpose: help `strapi build` succeed in environments where env vars are not injected at build-time
   *          but an env file exists (e.g., Railway build image).
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
      const nodeEnv = sanitize(process.env.NODE_ENV || env('NODE_ENV') || '').toLowerCase();

      const candidates = ['.env'];
      if (nodeEnv) candidates.push(`.env.${nodeEnv}`);

      // keep these explicit fallbacks (some repos only keep .env.production / .env.development)
      if (!candidates.includes('.env.production')) candidates.push('.env.production');
      if (!candidates.includes('.env.development')) candidates.push('.env.development');

      const loaded = [];

      for (const filename of candidates) {
        const filePath = path.join(process.cwd(), filename);
        if (!fs.existsSync(filePath)) continue;

        const raw = fs.readFileSync(filePath, 'utf8');
        const lines = raw.split(/\r?\n/);

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;

          // allow `export KEY=...`
          const normalized = trimmed.startsWith('export ') ? trimmed.slice(7).trim() : trimmed;

          const eq = normalized.indexOf('=');
          if (eq <= 0) continue;

          const key = normalized.slice(0, eq).trim();
          let val = normalized.slice(eq + 1).trim();

          // strip surrounding quotes
          if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
          ) {
            val = val.slice(1, -1);
          }

          // only set if not already present
          if (typeof process.env[key] === 'undefined') {
            process.env[key] = val;
          }
        }

        loaded.push(filename);
      }

      if (loaded.length) {
        console.log('[TDLC][db-config] Loaded env file(s):', loaded);
      }
    } catch (e) {
      console.warn('[TDLC][db-config] Env file load skipped due to error:', e?.message || e);
    }
  };

  // Helper: resolve indirection patterns and "key-as-value"
  const resolveIndirection = (value) => {
    let raw = sanitize(value);
    if (!raw) return raw;

    // $VAR
    if (raw.startsWith('$') && raw.length > 1) {
      const refName = raw.slice(1).trim();
      const resolved = sanitize(env(refName));
      if (resolved) {
        console.log('[TDLC][db-config] Resolving indirection:', {
          from: raw,
          to: maskUrl(resolved),
        });
        return resolved;
      }
      console.warn(
        `[TDLC][db-config] Warning: ${raw} could not be resolved from env – using it as-is`
      );
      return raw;
    }

    // ${VAR}
    if (raw.startsWith('${') && raw.endsWith('}')) {
      const refName = raw.slice(2, -1).trim();
      const resolved = sanitize(env(refName));
      if (resolved) {
        console.log('[TDLC][db-config] Resolving indirection:', {
          from: raw,
          to: maskUrl(resolved),
        });
        return resolved;
      }
      console.warn(
        `[TDLC][db-config] Warning: ${raw} could not be resolved from env – using it as-is`
      );
      return raw;
    }

    // %VAR% (Windows-style)
    if (raw.startsWith('%') && raw.endsWith('%') && raw.length > 2) {
      const refName = raw.slice(1, -1).trim();
      const resolved = sanitize(env(refName));
      if (resolved) {
        console.log('[TDLC][db-config] Resolving indirection:', {
          from: raw,
          to: maskUrl(resolved),
        });
        return resolved;
      }
      console.warn(
        `[TDLC][db-config] Warning: ${raw} could not be resolved from env – using it as-is`
      );
      return raw;
    }

    // Literal env key used as value (e.g. DATABASE_URL="STRAPI_DB_OWNER_POOLER_CB")
    const knownKeys = [
      'STRAPI_DB_OWNER_POOLER_CB',
      'STRAPI_DB_USER_POOLER_CB',
      'DATABASE_URL',
    ];
    if (knownKeys.includes(raw)) {
      const resolved = sanitize(env(raw));
      if (resolved) {
        console.log('[TDLC][db-config] Resolving key-as-value:', {
          from: raw,
          to: maskUrl(resolved),
        });
        return resolved;
      }
    }

    return raw;
  };

  // If DB env is missing (common in CI/build containers), try to load env files.
  // This does not affect localhost behavior (it only fills missing process.env keys).
  let raw =
    env('DATABASE_URL') ||
    env('STRAPI_DB_OWNER_POOLER_CB') ||
    env('STRAPI_DB_USER_POOLER_CB');

  if (!raw) {
    loadEnvFilesIfNeeded();
    raw =
      env('DATABASE_URL') ||
      env('STRAPI_DB_OWNER_POOLER_CB') ||
      env('STRAPI_DB_USER_POOLER_CB');
  }

  raw = resolveIndirection(raw);

  if (!raw) {
    throw new Error(
      '[TDLC][db-config] Missing DATABASE_URL / STRAPI_DB_OWNER_POOLER_CB / STRAPI_DB_USER_POOLER_CB. ' +
        'On Railway, set this as a Service/Shared Variable for the Production environment.'
    );
  }

  // 2) Parse Neon-style Postgres URL into parts
  const parsed = parse(raw);

  // Validate essentials to avoid silent malformed configs
  if (!parsed || !parsed.host) {
    throw new Error(
      `[TDLC][db-config] Invalid DATABASE_URL (host missing). Value was: ${maskUrl(raw)}`
    );
  }
  if (!parsed.database) {
    throw new Error(
      `[TDLC][db-config] Invalid DATABASE_URL (database missing). Value was: ${maskUrl(raw)}`
    );
  }

  // Extract Neon pooler hints (connection_limit / pgbouncer) to prevent pool misconfig
  let connectionLimit = null;
  let pgbouncerEnabled = false;

  try {
    const u = new URL(raw);
    const cl = u.searchParams.get('connection_limit');
    const pb = u.searchParams.get('pgbouncer');
    const clNum = cl ? Number(cl) : NaN;

    if (Number.isFinite(clNum) && clNum > 0) connectionLimit = clNum;
    if (typeof pb === 'string') pgbouncerEnabled = pb.toLowerCase() === 'true';
  } catch (_) {
    // ignore URL parsing failures; pg-connection-string already parsed core parts
  }

  const sslEnabled = env.bool('DATABASE_SSL', true);
  const sslRejectUnauthorized = env.bool(
    'DATABASE_SSL_REJECT_UNAUTHORIZED',
    false
  );

  const poolMin = env.int('DB_POOL_MIN', 0);

  // Support both DB_POOL_MAX and PG_POOL_MAX (your env includes both)
  const poolMaxRequested = env.int('DB_POOL_MAX', env.int('PG_POOL_MAX', 10));

  // If pooler URL uses connection_limit=1, NEVER exceed it (prevents timeouts/errors)
  const poolMax =
    connectionLimit != null
      ? Math.max(1, Math.min(poolMaxRequested, connectionLimit))
      : poolMaxRequested;

  if (poolMax !== poolMaxRequested) {
    console.warn('[TDLC][db-config] Pool max clamped to connection_limit:', {
      requested: poolMaxRequested,
      connectionLimit,
      effective: poolMax,
    });
  }

  if (pgbouncerEnabled && poolMin > 0) {
    console.warn(
      '[TDLC][db-config] Note: pgbouncer=true with poolMin > 0 can keep idle connections open. Consider DB_POOL_MIN=0 in production.'
    );
  }

  const timeoutMs = env.int('DATABASE_CONNECTION_TIMEOUT', 60000);

  const client = env('DATABASE_CLIENT', 'postgres');

  const config = {
    connection: {
      client,
      connection: {
        host: parsed.host,
        port: parsed.port ? Number(parsed.port) : 5432,
        database: parsed.database,
        user: parsed.user,
        password: parsed.password,
        ssl: sslEnabled ? { rejectUnauthorized: sslRejectUnauthorized } : false,
      },
      pool: {
        min: poolMin,
        max: poolMax,
        // Tarn/Knex pool supports this name
        acquireTimeoutMillis: timeoutMs,
      },
      debug: env.bool('DATABASE_DEBUG', false),
    },
  };

  // 3) Safe debug (no password)
  console.log('[TDLC][db-config] Final DB config summary:', {
    client: config.connection.client,
    host: config.connection.connection.host,
    port: config.connection.connection.port,
    database: config.connection.connection.database,
    user: config.connection.connection.user,
    ssl: !!config.connection.connection.ssl,
    poolMin,
    poolMax,
    poolMaxRequested,
    connectionLimit,
    pgbouncerEnabled,
  });

  return config;
};
