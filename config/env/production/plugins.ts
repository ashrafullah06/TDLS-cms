// FILE: config/env/production/plugins.ts
// SECURITY NOTE: Do NOT hardcode secrets in this file. Keep secrets in Railway/Vercel env vars.

export default ({ env }) => {
  /**
   * Upload provider (Cloudflare R2 / S3-compatible):
   * - Supports either S3_* or R2_* env naming.
   * - Only enables aws-s3 when required credentials are present.
   * - Otherwise falls back to local upload to avoid breaking boot.
   */

  const bucket = env("S3_BUCKET", "") || env("R2_BUCKET", "");
  const region = env("S3_REGION", "") || env("R2_REGION", "auto");
  const accessKeyId = env("S3_ACCESS_KEY_ID", "") || env("R2_ACCESS_KEY_ID", "");
  const secretAccessKey =
    env("S3_SECRET_ACCESS_KEY", "") || env("R2_SECRET_ACCESS_KEY", "");

  const endpointFromAccount = env("R2_ACCOUNT_ID", "")
    ? `https://${env("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`
    : "";

  const endpoint =
    env("S3_ENDPOINT", "") || env("R2_ENDPOINT", "") || endpointFromAccount;

  const baseUrl =
    env("S3_BASE_URL", "") ||
    env("MEDIA_PUBLIC_URL", "") ||
    "https://media.thednalabstore.com";

  const rootPath = env("S3_ROOT_PATH", "") || env("R2_ROOT_PATH", "") || undefined;

  const hasS3 = !!bucket && !!accessKeyId && !!secretAccessKey;

  const upload = hasS3
    ? {
        config: {
          provider: "aws-s3",
          providerOptions: {
            // Ensures Strapi returns media URLs on your public media domain
            baseUrl,
            rootPath,

            // Strapi v4 provider expects `s3Options`
            s3Options: {
              region,
              endpoint: endpoint || undefined,
              forcePathStyle: env.bool("S3_FORCE_PATH_STYLE", true),
              credentials: {
                accessKeyId,
                secretAccessKey,
              },
              params: {
                Bucket: bucket,
              },
            },
          },
          actionOptions: {
            upload: {},
            uploadStream: {},
            delete: {},
          },
        },
      }
    : {
        config: {
          provider: "local",
        },
      };

  /**
   * Email provider:
   * - Only configure nodemailer if SMTP credentials are present.
   * - Otherwise keep provider present but inert (does not block startup).
   */
  const smtpHost = env("SMTP_HOST", "");
  const smtpUser = env("SMTP_USER", "");
  const smtpPass = env("SMTP_PASS", "");

  const hasSMTP = !!smtpHost && !!smtpUser && !!smtpPass;

  const defaultFrom =
    env("EMAIL_DEFAULT_FROM", "") ||
    env("SMTP_FROM", "") ||
    "no-reply@thednalabstore.com";

  const defaultReplyTo =
    env("EMAIL_DEFAULT_REPLY_TO", "") ||
    env("SMTP_REPLY_TO", "") ||
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
    : {
        config: {
          provider: "nodemailer",
          providerOptions: {},
          settings: {
            defaultFrom,
            defaultReplyTo,
          },
        },
      };

  // Keep disabled in production
  const documentation = { enabled: false };
  const graphql = { enabled: false };

  return {
    upload,
    email,
    documentation,
    graphql,
  };
};
