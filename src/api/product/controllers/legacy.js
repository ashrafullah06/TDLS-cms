'use strict';

/**
 * Compatibility wrapper for legacy routes.
 *
 * IMPORTANT:
 * - This file should NOT be used as the main "api::product.product" controller.
 * - Keep your real core logic in TypeScript:
 *     src/api/product/controllers/product.ts
 * - In your routes, reference this controller with a different UID, e.g.:
 *     'api::product.legacy'
 *
 * These functions delegate to the main product controller, without
 * duplicating business logic.
 */

function getProductController() {
  const ctrl = strapi.controller('api::product.product');

  // Safety guard: if this controller is accidentally registered as
  // api::product.product, avoid infinite recursion and crash with a clear message.
  if (!ctrl || ctrl === module.exports) {
    throw new Error(
      '[product legacy controller] Misconfiguration: legacy controller is registered as api::product.product. ' +
      'Please ensure this file is NOT the main product controller. ' +
      'Use product.ts as the main controller and map legacy routes to a separate UID.'
    );
  }

  return ctrl;
}

module.exports = {
  async labels(ctx) {
    const productCtrl = getProductController();
    return productCtrl.labels(ctx);
  },

  async duplicate(ctx) {
    const productCtrl = getProductController();
    return productCtrl.duplicate(ctx);
  },

  async public(ctx) {
    const productCtrl = getProductController();
    return productCtrl.public(ctx);
  },

  async publicBySlug(ctx) {
    const productCtrl = getProductController();
    return productCtrl.publicBySlug(ctx);
  },
};
