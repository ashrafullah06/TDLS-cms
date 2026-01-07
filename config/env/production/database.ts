// FILE: config/env/production/database.ts
import { parse } from "pg-connection-string";

export default ({ env }) => {
  const sanitize = (v: unknown) => {
    let s = String(v ?? "").trim();
    if (
      (s.startsWith('"') && s.endsWith('"')) ||
      (s.startsWith("'") && s.endsWith("'"))
    ) {
      s = s.slice(1, -1).trim();
    }
    return s;
  };

  const maskUrl = (u: string) =>
    String(u || "").replace(/:\/\/([^:]+):([^@]+)@/i, "://$1:****@");

  const resolveIndirection = (value: unknown) => {
    const raw = sanitize(value);
    if (!raw) return raw;

    // $VAR
    if (raw.startsWith("$") && raw.length > 1) {
      const ref = raw.slice(1).trim();
      return sanitize(env(ref)) || raw;
    }

    // ${VAR}
    if (raw.startsWith("${") && raw.endsWith("}")) {
      const ref = raw.slice(2, -1).trim();
      return sanitize(env(ref)) || raw;
    }

    // %VAR% (windows)
    if (raw.startsWith("%") && raw.endsWith("%") && raw.length > 2) {
      const ref = raw.slice(1, -1).trim();
      return sanitize(env(ref)) || raw;
    }

    // Key-as-value convenience
    const knownKeys = [
      "DATABASE_URL",
      "STRAPI_DB_USER_POOLER_CB",
      "STRAPI_DB_OWNER_POOLER_CB",
    ];
    if (knownKeys.includes(raw)) {
      return sanitize(env(raw)) || raw;
    }

    return raw;
  };

  /**
   * In production, prefer a single DATABASE_URL.
   * You can fallback to a named Neon pooler var for convenience.
   */
  let url =
    env("DATABASE_URL", "") ||
    env("STRAPI_DB_USER_POOLER_CB", "") ||
    env("STRAPI_DB_OWNER_POOLER_CB", "");

  url = resolveIndirection(url);

  if (!url) {
    throw new Error(
      "DATABASE_URL not set. Define DATABASE_URL (recommended) or STRAPI_DB_USER_POOLER_CB / STRAPI_DB_OWNER_POOLER_CB in production env."
    );
  }

  const parsed = parse(url);

  const host = parsed.host;
  const database = parsed.database;
  const user = parsed.user;
  const password = parsed.password;
  const port = parsed.port ? Number(parsed.port) : 5432;

  // Production SSL defaults to true for Neon.
  const useSSL = env.bool("DATABASE_SSL", true);
  const rejectUnauthorized = env.bool("DATABASE_SSL_REJECT_UNAUTHORIZED", false);

  // Safety checks to fail fast without leaking DB details in logs
  if (!host || !database || !user) {
    throw new Error(
      `Invalid DATABASE_URL: missing host/database/user. url=${maskUrl(url)}`
    );
  }

  // Neon pooler URLs often include connection_limit=1; clamp pool max to avoid timeouts.
  let connectionLimit: number | null = null;
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

  const poolMin = env.int("DB_POOL_MIN", 0);
  const poolMaxRequested = env.int("DB_POOL_MAX", env.int("PG_POOL_MAX", 10));
  const poolMax =
    connectionLimit != null
      ? Math.max(1, Math.min(poolMaxRequested, connectionLimit))
      : poolMaxRequested;

  const timeoutMs = env.int("DATABASE_CONNECTION_TIMEOUT", 60000);

  // pgbouncer-friendly hint (no behavior change; just safer visibility)
  if (pgbouncerEnabled && poolMin > 0) {
    // eslint-disable-next-line no-console
    console.warn(
      "[TDLC][db-config] pgbouncer=true with DB_POOL_MIN > 0 may keep idle connections open. Consider DB_POOL_MIN=0 in production."
    );
  }

  return {
    connection: {
      client: env("DATABASE_CLIENT", "postgres"),
      connection: {
        host,
        port,
        database,
        user,
        password,
        ssl: useSSL ? { rejectUnauthorized } : false,
      },
      pool: {
        min: poolMin,
        max: poolMax,
        acquireTimeoutMillis: timeoutMs,
      },
      debug: env.bool("DATABASE_DEBUG", false),
    },
  };
};
