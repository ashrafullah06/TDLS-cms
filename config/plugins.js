// FILE: config/plugins.js
"use strict";

/**
 * Production-safe plugin configuration.
 *
 * HARD RULES (per your instruction):
 * - Do not break existing setup.
 * - Do not force new providers unless explicitly enabled via env.
 *
 * This file:
 * - keeps documentation/graphql disabled by default (unchanged behavior)
 * - adds Cloudflare R2 (S3-compatible) upload config ONLY if UPLOAD_PROVIDER=aws-s3
 */

module.exports = ({ env }) => {
  const enableDocs =
    env("STRAPI_ENABLE_DOCUMENTATION", "false").toLowerCase() === "true";

  const enableGraphql =
    env("STRAPI_ENABLE_GRAPHQL", "false").toLowerCase() === "true";

  /**
   * Upload provider selection
   * - default: undefined (Strapi behaves as your current setup)
   * - set UPLOAD_PROVIDER=aws-s3 on Railway to enable R2 via S3 provider
   */
  const uploadProvider = env("UPLOAD_PROVIDER", "").trim().toLowerCase();

  // Your public media domain (CDN / R2 public URL)
  const publicMediaBaseUrl = env(
    "MEDIA_PUBLIC_URL",
    "https://media.thednalabstore.com"
  );

  const plugins = {
    documentation: {
      enabled: enableDocs,
    },

    graphql: {
      enabled: enableGraphql,
    },
  };

  /**
   * Cloudflare R2 via S3-compatible provider.
   * IMPORTANT:
   * - Only activates if UPLOAD_PROVIDER=aws-s3
   * - Requires the upload provider package installed in your Strapi project:
   *   @strapi/provider-upload-aws-s3
   */
  if (uploadProvider === "aws-s3") {
    plugins.upload = {
      config: {
        provider: "@strapi/provider-upload-aws-s3",
        providerOptions: {
          s3Options: {
            region: env("R2_REGION", "auto"),
            endpoint: env("R2_ENDPOINT"), // e.g. https://<accountid>.r2.cloudflarestorage.com
            credentials: {
              accessKeyId: env("R2_ACCESS_KEY_ID"),
              secretAccessKey: env("R2_SECRET_ACCESS_KEY"),
            },
            // Cloudflare R2 typically expects path-style addressing
            forcePathStyle: true,
            params: {
              Bucket: env("R2_BUCKET"),
            },
          },
        },
        actionOptions: {
          upload: {
            // If you want stricter cache control you can tune it later
          },
          uploadStream: {},
          delete: {},
        },
      },
    };

    // Ensures Strapi returns your public CDN domain in asset URLs
    plugins["upload"].config.baseUrl = publicMediaBaseUrl;
  }

  return plugins;
};
