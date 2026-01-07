'use strict';

const path = require('path');
const dotenv = require('dotenv');
const createStrapi = require('@strapi/strapi');

async function run() {
  const appDir = path.resolve(__dirname, '..');
  console.log('[TDLC] Bootstrapping Strapi (debug-raw-product-variants) from', appDir);
  console.log('[TDLC] NODE_ENV =', process.env.NODE_ENV || 'development');

  // 1) Load .env
  const envPath = path.join(appDir, '.env');
  dotenv.config({ path: envPath });
  console.log('[TDLC] Loaded env file:', envPath);

  // 2) Use OWNER DB URL so we never hit permission issues
  if (process.env.STRAPI_DB_OWNER_POOLER_CB) {
    process.env.DATABASE_URL = process.env.STRAPI_DB_OWNER_POOLER_CB;
    console.log(
      '[TDLC] DATABASE_URL forced to STRAPI_DB_OWNER_POOLER_CB for debug-raw-product-variants script'
    );
  }

  const dbUrl =
    process.env.DATABASE_URL || process.env.STRAPI_DB_OWNER_POOLER_CB;
  console.log(
    '[TDLC] Effective DB URL (debug-raw-product-variants):',
    dbUrl ? dbUrl.replace(/:.+@/, ':****@') : '(none)'
  );

  const app = await createStrapi().load();

  try {
    // 👇 CHANGE THIS if you want to inspect another product
    const PRODUCT_ID = 1;

    console.log(`[TDLC] Loading raw product #${PRODUCT_ID} from DB...`);

    const product = await app.db.query('api::product.product').findOne({
      where: { id: PRODUCT_ID },
      populate: {
        product_variants: {
          populate: { size_stocks: true, variant_image: true },
        },
      },
    });

    if (!product) {
      console.log(`[TDLC] Product #${PRODUCT_ID} not found.`);
      return;
    }

    const variants = Array.isArray(product.product_variants)
      ? product.product_variants
      : [];

    console.log(
      `\n[TDLC][RAW] Product #${product.id} "${product.name || '(no name)'}"`
    );
    console.log(`  Total variants in DB: ${variants.length}`);

    variants.forEach((v, idx) => {
      console.log(
        `  Variant[${idx}] id=${v.id || '(no id)'} color="${v.color || '(no color)'}" ` +
        `color_code="${v.color_code || '(none)'}" size="${v.size || '(no CSV size)'}"`
      );

      const sizeStocks = Array.isArray(v.size_stocks) ? v.size_stocks : [];
      console.log(`    size_stocks count: ${sizeStocks.length}`);
      if (sizeStocks.length) {
        console.log(
          '    sizes:',
          sizeStocks
            .map((s) => s.size_name || s.size || '(no size_name)')
            .join(', ')
        );
      }
    });

    console.log('\n[TDLC] debug-raw-product-variants: done.\n');
  } catch (err) {
    console.error('[TDLC] debug-raw-product-variants script failed:', err);
  } finally {
    await app.destroy();
  }
}

run().catch((err) => {
  console.error('[TDLC] Fatal in debug-raw-product-variants:', err);
});
