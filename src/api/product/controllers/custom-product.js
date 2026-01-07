'use strict';

/**
 * Compatibility wrapper for legacy routes.
 *
 * All core logic now lives in the TypeScript controller:
 *   src/api/product/controllers/product.ts
 *
 * These functions simply delegate to that controller so you don't
 * have duplicated behaviour in two places.
 */

module.exports = {
  async labels(ctx) {
    return strapi.controller('api::product.product').labels(ctx);
  },

  async duplicate(ctx) {
    return strapi.controller('api::product.product').duplicate(ctx);
  },

  async public(ctx) {
    return strapi.controller('api::product.product').public(ctx);
  },

  async publicBySlug(ctx) {
    return strapi.controller('api::product.product').publicBySlug(ctx);
  },
};
