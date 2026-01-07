export default [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        // allow admin to load assets locally during dev
        directives: { 'connect-src': ["'self'", 'http:', 'https:'] },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      origin: ['*'], // open in dev
      headers: '*',
      methods: ['GET','POST','PUT','PATCH','DELETE','HEAD','OPTIONS'],
      keepHeadersOnError: true,
    },
  },
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
