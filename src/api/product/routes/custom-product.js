'use strict';

module.exports = {
  routes: [
    { method: 'GET',  path: '/products/:id/labels.pdf', handler: 'custom-product.labels',   config: { auth: false } },
    { method: 'POST', path: '/products/:id/duplicate',  handler: 'custom-product.duplicate', config: { auth: false } },
    { method: 'GET',  path: '/products/:id/public',     handler: 'custom-product.public',   config: { auth: false } },
    { method: 'GET',  path: '/products/by-slug/:slug/public', handler: 'custom-product.publicBySlug', config: { auth: false } }
  ],
};
