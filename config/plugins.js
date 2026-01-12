// FILE: config/plugins.js
"use strict";

/**
 * Production-safe plugin configuration.
 *
 * HARD RULES:
 * - Do not break existing setup.
 * - Do not force new providers unless explicitly enabled via env.
 *
 * This file:
 * - keeps documentation/graphql disabled by default (unchanged behavior)
 * - enables Cloudflare R2 (S3-compatible) upload ONLY if UPLOAD_PROVIDER=aws-s3
 */

function envBool(env, key, defaultValue = false) {
  const v = env(key, "").toString().trim().toLowerCase();
  if (!v) return defaultValue;
  return v === "1" || v === "true" || v === "yes" || v === "on";
}

function trimTrailingSlashes(s) {
  return (s || "").toString().trim().replace(/\/+$/, "");
}

module.exports = ({ env }) => {
  const enableDocs = envBool(env, "STRAPI_ENABLE_DOCUMENTATION", false);
  const enableGraphql = envBool(env, "STRAPI_ENABLE_GRAPHQL", false);

  /**
   * Upload provider selection
   * - default: "" (Strapi behaves as your current setup)
   * - set UPLOAD_PROVIDER=aws-s3 on Railway to enable R2 via S3 provider
   */
  const uploadProvider = env("UPLOAD_PROVIDER", "").trim().toLowerCase();

  // Your public media domain (CDN / R2 custom domain)
  const publicMediaBaseUrl = env(
    "MEDIA_PUBLIC_URL",
    "https://media.thednalabstore.com"
  )
    .toString()
    .trim();

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
    const r2Endpoint = trimTrailingSlashes(env("R2_ENDPOINT", ""));
    const r2Region = env("R2_REGION", "auto").toString().trim() || "auto";
    const r2Bucket = env("R2_BUCKET", "").toString().trim();

    const accessKeyId = env("R2_ACCESS_KEY_ID", "").toString().trim();
    const secretAccessKey = env("R2_SECRET_ACCESS_KEY", "").toString().trim();

    // Optional folder inside the bucket (keep blank unless you intentionally want a prefix)
    const rootPath = env("MEDIA_ROOT_PATH", "").toString().trim() || "";

    const cacheControl = env(
      "R2_CACHE_CONTROL",
      "public, max-age=31536000, immutable"
    )
      .toString()
      .trim();

    // If anything is missing, do NOT enable the provider (prevents production crash loops)
    const hasAll =
      !!r2Endpoint && !!r2Bucket && !!accessKeyId && !!secretAccessKey;

    if (hasAll) {
      plugins.upload = {
        config: {
          // Strapi expects the provider key name here
          provider: "aws-s3",
          providerOptions: {
            // Ensures Strapi returns your CDN/custom-domain URLs for assets
            baseUrl: publicMediaBaseUrl,

            // Optional prefix inside the bucket
            rootPath,

            s3Options: {
              credentials: { accessKeyId, secretAccessKey },
              region: r2Region,

              // Cloudflare R2 S3 endpoint (account-level)
              endpoint: r2Endpoint,

              // R2 expects path-style addressing
              forcePathStyle: true,

              params: {
                Bucket: r2Bucket,
              },
            },
          },

          // These are passed to the S3 PutObject operations
          actionOptions: {
            upload: {
              CacheControl: cacheControl,
            },
            uploadStream: {
              CacheControl: cacheControl,
            },
            delete: {},
          },
        },
      };
    }
  }

  return plugins;
};
