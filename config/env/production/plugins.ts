// FILE: config/env/production/plugins.ts
// SECURITY NOTE: Do NOT hardcode secrets in this file. Keep secrets in Railway/Vercel env vars.

type EnvFn = ((key: string, defaultValue?: any) => any) & {
  bool: (key: string, defaultValue?: boolean) => boolean;
  int: (key: string, defaultValue?: number) => number;
};

function toStr(v: any): string {
  return (v ?? "").toString().trim();
}

function stripTrailingSlashes(url: string): string {
  return url.replace(/\/+$/, "");
}

function hasValue(v: string): boolean {
  return !!toStr(v);
}

export default ({ env }: { env: EnvFn }) => {
  /**
   * Upload provider (Cloudflare R2 / S3-compatible):
   * - ONLY enables aws-s3 when UPLOAD_PROVIDER=aws-s3 AND required vars exist.
   * - Otherwise does NOT override anything (falls back to Strapi defaults / base config).
   */

  const uploadProvider = toStr(env("UPLOAD_PROVIDER", "")).toLowerCase();
  const enableAwsS3 = uploadProvider === "aws-s3";

  // Support either S3_* or R2_* env naming (prefer S3_* if present, otherwise R2_*)
  const bucket = toStr(env("S3_BUCKET", "")) || toStr(env("R2_BUCKET", ""));
  const region = toStr(env("S3_REGION", "")) || toStr(env("R2_REGION", "auto")) || "auto";
  const accessKeyId =
    toStr(env("S3_ACCESS_KEY_ID", "")) || toStr(env("R2_ACCESS_KEY_ID", ""));
  const secretAccessKey =
    toStr(env("S3_SECRET_ACCESS_KEY", "")) || toStr(env("R2_SECRET_ACCESS_KEY", ""));

  // Endpoint logic (R2 requires an explicit endpoint)
  const r2AccountId = toStr(env("R2_ACCOUNT_ID", ""));
  const endpointFromAccount = r2AccountId
    ? `https://${r2AccountId}.r2.cloudflarestorage.com`
    : "";

  const rawEndpoint =
    toStr(env("S3_ENDPOINT", "")) || toStr(env("R2_ENDPOINT", "")) || endpointFromAccount;

  const endpoint = rawEndpoint ? stripTrailingSlashes(rawEndpoint) : "";

  const baseUrl =
    toStr(env("S3_BASE_URL", "")) ||
    toStr(env("MEDIA_PUBLIC_URL", "")) ||
    "https://media.thednalabstore.com";

  // Optional prefix inside bucket (keep blank unless you intentionally want a folder)
  const rootPath = toStr(env("S3_ROOT_PATH", "")) || toStr(env("R2_ROOT_PATH", "")) || "";

  // Path-style for R2 (prefer R2_ key, fallback S3_ key, default true)
  const forcePathStyle =
    env.bool("R2_FORCE_PATH_STYLE", env.bool("S3_FORCE_PATH_STYLE", true));

  // Cache headers (optional) — safe defaults for static media
  const cacheControl = toStr(
    env("R2_CACHE_CONTROL", env("S3_CACHE_CONTROL", "public, max-age=31536000, immutable"))
  );

  // Enable only when explicitly requested AND all required values exist
  const hasAllUploadVars =
    hasValue(bucket) && hasValue(accessKeyId) && hasValue(secretAccessKey) && hasValue(endpoint);

  const upload = enableAwsS3 && hasAllUploadVars
    ? {
        config: {
          provider: "aws-s3",
          providerOptions: {
            // Ensures Strapi returns media URLs on your public media domain
            baseUrl: stripTrailingSlashes(toStr(baseUrl)),
            rootPath,
            s3Options: {
              region,
              endpoint,
              forcePathStyle,
              credentials: {
                accessKeyId,
                secretAccessKey,
              },
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
      }
    : undefined;

  /**
   * Email provider:
   * - Configure nodemailer ONLY if SMTP credentials are present.
   * - Otherwise do NOT override anything (prevents inert/empty provider config).
   */
  const smtpHost = toStr(env("SMTP_HOST", ""));
  const smtpUser = toStr(env("SMTP_USER", ""));
  const smtpPass = toStr(env("SMTP_PASS", ""));
  const hasSMTP = hasValue(smtpHost) && hasValue(smtpUser) && hasValue(smtpPass);

  const defaultFrom =
    toStr(env("EMAIL_DEFAULT_FROM", "")) ||
    toStr(env("SMTP_FROM", "")) ||
    "no-reply@thednalabstore.com";

  const defaultReplyTo =
    toStr(env("EMAIL_DEFAULT_REPLY_TO", "")) ||
    toStr(env("SMTP_REPLY_TO", "")) ||
    "support@thednalabstore.com";

  const email = hasSMTP
    ? {
        config: {
          provider: "nodemailer",
          providerOptions: {
            host: smtpHost,
            port: env.int("SMTP_PORT", 465),
            secure: env.bool("SMTP_SECURE", true),
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
      }
    : undefined;

  // Keep disabled in production
  const documentation = { enabled: false };
  const graphql = { enabled: false };

  return {
    ...(upload ? { upload } : {}),
    ...(email ? { email } : {}),
    documentation,
    graphql,
  };
};
