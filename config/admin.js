// FILE: config/admin.js
module.exports = ({ env }) => ({
  // Production-safe: secrets stay in environment variables (Railway Variables / .env local)
  apiToken: { salt: env("API_TOKEN_SALT") },
  transfer: { token: { salt: env("TRANSFER_TOKEN_SALT") } },
  auth: { secret: env("ADMIN_JWT_SECRET") },
});
