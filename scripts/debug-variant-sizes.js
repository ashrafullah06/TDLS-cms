// FILE: scripts/debug-product-colors.js
'use strict';

const path = require('path');
const dotenv = require('dotenv');
const createStrapi = require('@strapi/strapi');

async function run() {
  const appDir = path.resolve(__dirname, '..');
  console.log('[TDLC] Bootstrapping Strapi (debug-product-colors) from', appDir);
  console.log('[TDLC] NODE_ENV =', process.env.NODE_ENV || 'development');

  // 1) Load .env
  const envPath = path.join(appDir, '.env');
  dotenv.config({ path: envPath });
  console.log('[TDLC] Loaded env file:', envPath);

  // 2) Prefer OWNER URL so this script never hits permission issues
  if (process.env.STRAPI_DB_OWNER_POOLER_CB) {
    process.env.DATABASE_URL = process.env.STRAPI_DB_OWNER_POOLER_CB;
    console.log(
      '[TDLC] DATABASE_URL forced to STRAPI_DB_OWNER_POOLER_CB for debug-product-colors script'
    );
  }

  const dbUrl =
    process.env.DATABASE_URL || process.env.STRAPI_DB_OWNER_POOLER_CB;
  console.log(
    '[TDLC] Effective DB URL (debug-product-colors):',
    dbUrl ? dbUrl.replace(/:.+@/, ':****@') : '(none)'
  );

  // 3) Boot Strapi
  const app = await createStrapi().load();

  try {
    console.log(
      '[TDLC] Loading products with variants to inspect color_code values...'
    );

    const products = await app.db.query('api::product.product').findMany({
      populate: {
        product_variants: true,
      },
    });

    console.log(`[TDLC] Found ${products.length} products\n`);

    for (const p of products) {
      const variants = Array.isArray(p.product_variants)
        ? p.product_variants
        : [];

      console.log(
        `[TDLC][COLORS] Product #${p.id} "${p.name || '(no name)'}"`
      );
      console.log(
        `  Product color_code: ${p.color_code || '(none)'}`
      );

      if (!variants.length) {
        console.log('  (no variants)\n');
        continue;
      }

      variants.forEach((v, vIndex) => {
        const color = v.color || '(no color)';
        const colorKey = v.color_key || '(none)';
        const colorCode = v.color_code || '(none)';

        console.log(
          `  Variant ${vIndex}: color="${color}", color_key="${colorKey}", color_code="${colorCode}"`
        );
      });

      console.log(''); // blank line between products
    }

    console.log('[TDLC] Color debug scan complete.');
  } catch (err) {
    console.error('[TDLC] debug-product-colors script failed:', err);
  } finally {
    await app.destroy();
  }
}

run().catch((err) => {
  console.error('[TDLC] Fatal in debug-product-colors:', err);
});
