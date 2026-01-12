// FILE: config/plugins.js
"use strict";

/**
 * Production-safe plugin configuration (single-file).
 *
 * HARD RULES:
 * - Do not break existing setup.
 * - Do not force new providers unless explicitly enabled via env.
 *
 * This file:
 * - keeps documentation/graphql disabled by default (unchanged behavior)
 * - enables Cloudflare R2 (S3-compatible) upload ONLY if UPLOAD_PROVIDER=aws-s3 AND required env vars exist
 * - enables Nodemailer email ONLY if SMTP credentials exist
 */

function toStr(v) {
  return (v ?? "").toString().trim();
}

function envBool(env, key, defaultValue = false) {
  const v = toStr(env(key, "")).toLowerCase();
  if (!v) return defaultValue;
  return v === "1" || v === "true" || v === "yes" || v === "on";
}

function envInt(env, key, defaultValue) {
  const raw = toStr(env(key, ""));
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : defaultValue;
}

function stripTrailingSlashes(s) {
  return toStr(s).replace(/\/+$/, "");
}

function hasValue(v) {
  return !!toStr(v);
}

module.exports = ({ env }) => {
  // Keep disabled by default; allow opting-in explicitly
  const enableDocs = envBool(env, "STRAPI_ENABLE_DOCUMENTATION", false);
  const enableGraphql = envBool(env, "STRAPI_ENABLE_GRAPHQL", false);

  /**
   * Upload provider selection
   * - default: "" (Strapi behaves as your current setup)
   * - set UPLOAD_PROVIDER=aws-s3 to enable R2 via S3 provider
   */
  const uploadProvider = toStr(env("UPLOAD_PROVIDER", "")).toLowerCase();

  // Base plugins (safe defaults)
  const plugins = {
    documentation: { enabled: enableDocs },
    graphql: { enabled: enableGraphql },
  };

  /**
   * Cloudflare R2 via S3-compatible provider.
   * Activates ONLY if UPLOAD_PROVIDER=aws-s3 AND required env vars exist.
   *
   * Requires package:
   *   @strapi/provider-upload-aws-s3
   */
  if (uploadProvider === "aws-s3") {
    // Support either S3_* or R2_* env naming (prefer S3_* if present)
    const bucket = toStr(env("S3_BUCKET", "")) || toStr(env("R2_BUCKET", ""));
    const region = toStr(env("S3_REGION", "")) || toStr(env("R2_REGION", "auto")) || "auto";

    const accessKeyId =
      toStr(env("S3_ACCESS_KEY_ID", "")) || toStr(env("R2_ACCESS_KEY_ID", ""));
    const secretAccessKey =
      toStr(env("S3_SECRET_ACCESS_KEY", "")) || toStr(env("R2_SECRET_ACCESS_KEY", ""));

    // Endpoint logic (R2 requires an explicit endpoint; can be derived from R2_ACCOUNT_ID)
    const r2AccountId = toStr(env("R2_ACCOUNT_ID", ""));
    const endpointFromAccount = r2AccountId
      ? `https://${r2AccountId}.r2.cloudflarestorage.com`
      : "";

    const rawEndpoint =
      toStr(env("S3_ENDPOINT", "")) ||
      toStr(env("R2_ENDPOINT", "")) ||
      endpointFromAccount;

    const endpoint = rawEndpoint ? stripTrailingSlashes(rawEndpoint) : "";

    // Your public media domain (CDN / R2 custom domain)
    const baseUrl =
      toStr(env("S3_BASE_URL", "")) ||
      toStr(env("MEDIA_PUBLIC_URL", "")) ||
      "https://media.thednalabstore.com";

    // Optional folder/prefix inside the bucket (keep blank unless you intentionally want a prefix)
    const rootPath =
      toStr(env("S3_ROOT_PATH", "")) ||
      toStr(env("R2_ROOT_PATH", "")) ||
      toStr(env("MEDIA_ROOT_PATH", "")) ||
      "";

    // R2 expects path-style addressing; keep default true unless explicitly overridden
    const forcePathStyle = envBool(
      env,
      "R2_FORCE_PATH_STYLE",
      envBool(env, "S3_FORCE_PATH_STYLE", true)
    );

    // Cache headers for static media (safe default)
    const cacheControl = toStr(
      env(
        "R2_CACHE_CONTROL",
        env("S3_CACHE_CONTROL", "public, max-age=31536000, immutable")
      )
    );

    // If anything is missing, do NOT enable upload (prevents production crash loops)
    const hasAllUploadVars =
      hasValue(bucket) &&
      hasValue(accessKeyId) &&
      hasValue(secretAccessKey) &&
      hasValue(endpoint);

    if (hasAllUploadVars) {
      plugins.upload = {
        config: {
          provider: "aws-s3",
          providerOptions: {
            // Ensures Strapi returns media URLs on your public media domain
            baseUrl: stripTrailingSlashes(baseUrl),

            // Optional prefix inside the bucket
            rootPath,

            s3Options: {
              credentials: { accessKeyId, secretAccessKey },
              region,

              // Cloudflare R2 S3 endpoint (account-level)
              endpoint,

              // R2 expects path-style addressing
              forcePathStyle,

              params: {
                Bucket: bucket,
              },
            },
          },

          // PutObject options (applies Cache-Control on upload)
          actionOptions: {
            upload: { CacheControl: cacheControl },
            uploadStream: { CacheControl: cacheControl },
            delete: {},
          },
        },
      };
    }
  }

  /**
   * Email provider:
   * - Configure nodemailer ONLY if SMTP credentials are present.
   * - Otherwise do NOT override anything.
   */
  const smtpHost = toStr(env("SMTP_HOST", ""));
  const smtpUser = toStr(env("SMTP_USER", ""));
  const smtpPass = toStr(env("SMTP_PASS", ""));
  const hasSMTP = hasValue(smtpHost) && hasValue(smtpUser) && hasValue(smtpPass);

  if (hasSMTP) {
    const defaultFrom =
      toStr(env("EMAIL_DEFAULT_FROM", "")) ||
      toStr(env("SMTP_FROM", "")) ||
      "no-reply@thednalabstore.com";

    const defaultReplyTo =
      toStr(env("EMAIL_DEFAULT_REPLY_TO", "")) ||
      toStr(env("SMTP_REPLY_TO", "")) ||
      "support@thednalabstore.com";

    plugins.email = {
      config: {
        provider: "nodemailer",
        providerOptions: {
          host: smtpHost,
          port: envInt(env, "SMTP_PORT", 465),
          secure: envBool(env, "SMTP_SECURE", true),
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        },
        settings: {
          defaultFrom,
          defaultReplyTo,
        },
      },
    };
  }

  return plugins;
};
