// FILE: scripts/backfill-product-codes-and-variants.js
'use strict';

const path = require('path');
const dotenv = require('dotenv');
const createStrapi = require('@strapi/strapi');

async function run() {
  const appDir = path.resolve(__dirname, '..');
  console.log('[TDLC] Bootstrapping Strapi (backfill-product-codes-and-variants) from', appDir);
  console.log('[TDLC] NODE_ENV =', process.env.NODE_ENV || 'development');

  // 1) Load .env
  const envPath = path.join(appDir, '.env');
  dotenv.config({ path: envPath });
  console.log('[TDLC] Loaded env file:', envPath);

  // 2) Always force OWNER URL for this backfill script
  if (process.env.STRAPI_DB_OWNER_POOLER_CB) {
    process.env.DATABASE_URL = process.env.STRAPI_DB_OWNER_POOLER_CB;
    console.log(
      '[TDLC] DATABASE_URL forced to STRAPI_DB_OWNER_POOLER_CB for backfill script'
    );
  }

  const dbUrl =
    process.env.DATABASE_URL || process.env.STRAPI_DB_OWNER_POOLER_CB;
  console.log(
    '[TDLC] Effective DB URL (backfill-product-codes-and-variants):',
    dbUrl ? dbUrl.replace(/:.+@/, ':****@') : '(none)'
  );

  // 3) Boot Strapi
  const app = await createStrapi().load();

  try {
    const codegen = require('../src/api/product/content-types/product/codegen');

    console.log('[TDLC] Backfill: loading products...');
    const products = await app.db.query('api::product.product').findMany({
      populate: {
        categories: true,
        factory: true,
        product_variants: {
          populate: { size_stocks: true },
        },
        images: true,
        gallery: true,
      },
    });

    console.log(`[TDLC] Found ${products.length} products`);

    for (const p of products) {
      // IMPORTANT: do NOT pass product_variants into data
      const data = {
        id: p.id,
        name: p.name,
        slug: p.slug,
        categories: p.categories,
        factory: p.factory,
        uuid: p.uuid,
        product_code: p.product_code,
        base_sku: p.base_sku,
        generated_sku: p.generated_sku,
        barcode: p.barcode,
        factory_batch_code: p.factory_batch_code,
        label_serial_code: p.label_serial_code,
        tag_serial_code: p.tag_serial_code,
        base_price: p.base_price,
        discount_price: p.discount_price,
        currency: p.currency,
        status: p.status,
        country_of_origin: p.country_of_origin,
        hs_code: p.hs_code,
        color_code: p.color_code,
        inventory: p.inventory,
        images: p.images,
        gallery: p.gallery,
        is_featured: p.is_featured,
        is_archived: p.is_archived,
        disable_frontend: p.disable_frontend,
      };

      // Mark as UPDATE so codegen behaves in "update mode"
      const event = {
        params: {
          where: { id: p.id }, // ⬅ marks this as update
          data,
        },
      };

      await codegen.generateAll(event);

      const updated = event.params.data || data;

      // Never persist product_variants from codegen here
      const codesOnly = {
        product_code: updated.product_code,
        base_sku: updated.base_sku,
        generated_sku: updated.generated_sku,
        barcode: updated.barcode,
        factory_batch_code: updated.factory_batch_code,
        label_serial_code: updated.label_serial_code,
        tag_serial_code: updated.tag_serial_code,
        color_code: updated.color_code,
      };

      console.log(
        `\n[TDLC][BACKFILL] Product ${p.id} "${p.name}" codes after codegen:`
      );
      console.log(
        `  product_code="${codesOnly.product_code}", base_sku="${codesOnly.base_sku}", generated_sku="${codesOnly.generated_sku}", color_code="${codesOnly.color_code || '(none)'}"`
      );

      await app.db.query('api::product.product').update({
        where: { id: p.id },
        data: codesOnly,
      });

      console.log(`[TDLC] Updated product ${p.id} (${p.name}) [codes only]`);
    }

    console.log('\n[TDLC] Backfill complete');
  } catch (err) {
    console.error('[TDLC] Backfill failed:', err);
  } finally {
    await app.destroy();
  }
}

run().catch((err) => {
  console.error('[TDLC] Fatal:', err);
});
