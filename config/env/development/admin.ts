export default ({ env }) => ({
  auth: { secret: env('ADMIN_JWT_SECRET', 'dev-admin-jwt-secret') },
  url: env('STRAPI_ADMIN_BACKEND_URL', '/admin'),
  serveAdminPanel: true,
});
