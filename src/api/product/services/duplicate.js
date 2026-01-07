// FILE: src/api/product/services/duplicate.js
'use strict';

module.exports = () => ({
  async run(id) {
    const entity = await strapi.entityService.findOne('api::product.product', id, {
      populate: { images: true, gallery: true, product_variants: true, categories: true },
    });
    if (!entity) throw new Error('Not found');

    const data = {
      ...entity,
      name: `${entity.name} (copy)`,
      slug: `${(entity.slug || entity.name)}-copy-${Date.now()}`.toLowerCase(),

      // wipe generated fields
      uuid: null,
      product_code: null,
      base_sku: null,
      generated_sku: null,
      barcode: null,
      factory_batch_code: null,
      label_serial_code: null,
      tag_serial_code: null,

      // relations as IDs
      images: Array.isArray(entity.images) ? entity.images.map((i) => i.id) : [],
      gallery: Array.isArray(entity.gallery) ? entity.gallery.map((i) => i.id) : [],

      // variants: base info only; SKUs/barcodes will regenerate via lifecycles
      product_variants: Array.isArray(entity.product_variants)
        ? entity.product_variants.map((v) => ({
            color: v.color,
            size: v.size,
            variant_image: v.variant_image?.id || null,
            generated_sku: null,
            barcode: null,
          }))
        : [],

      // reset publish + status
      publishedAt: null,
      status: 'Draft',
    };

    const created = await strapi.entityService.create('api::product.product', { data });
    return created;
  },
});
