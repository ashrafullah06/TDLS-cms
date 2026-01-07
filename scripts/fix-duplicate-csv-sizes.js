// FILE: scripts/fix-duplicate-csv-sizes.js
'use strict';

const path = require('path');
const dotenv = require('dotenv');
const createStrapi = require('@strapi/strapi');

async function run() {
  const appDir = path.resolve(__dirname, '..');
  console.log('[TDLC] Bootstrapping Strapi (fix-duplicate-csv-sizes) from', appDir);
  console.log('[TDLC] NODE_ENV =', process.env.NODE_ENV || 'development');

  const envPath = path.join(appDir, '.env');
  dotenv.config({ path: envPath });
  console.log('[TDLC] Loaded env file:', envPath);

  if (process.env.STRAPI_DB_OWNER_POOLER_CB) {
    process.env.DATABASE_URL = process.env.STRAPI_DB_OWNER_POOLER_CB;
    console.log(
      '[TDLC] DATABASE_URL forced to STRAPI_DB_OWNER_POOLER_CB for fix-duplicate-csv-sizes script'
    );
  }

  const dbUrl =
    process.env.DATABASE_URL || process.env.STRAPI_DB_OWNER_POOLER_CB;
  console.log(
    '[TDLC] Effective DB URL (fix-duplicate-csv-sizes):',
    dbUrl ? dbUrl.replace(/:.+@/, ':****@') : '(none)'
  );

  const app = await createStrapi().load();

  try {
    console.log(
      '[TDLC] Loading products with product_variants for CSV cleanup...'
    );
    const products = await app.db.query('api::product.product').findMany({
      populate: { product_variants: true },
    });

    console.log(`[TDLC] Found ${products.length} products`);

    let totalVariantsTouched = 0;
    let totalProductsUpdated = 0;

    for (const p of products) {
      const variants = Array.isArray(p.product_variants)
        ? p.product_variants
        : [];

      let changed = false;
      const newVariants = variants.map((v, idx) => {
        const csvSize = typeof v.size === 'string' ? v.size : '';
        if (!csvSize || !csvSize.trim()) return v;

        const raw = csvSize
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

        const seen = new Set();
        const dedup = [];

        raw.forEach((r) => {
          const norm = r.toUpperCase();
          if (seen.has(norm)) return;
          seen.add(norm);
          dedup.push(r);
        });

        const dedupStr = dedup.join(', ');
        if (dedupStr === csvSize.trim()) return v;

        changed = true;
        totalVariantsTouched += 1;

        console.log(
          `[TDLC][FIX] Product #${p.id} "${p.name}", variant index ${idx}, color="${
            v.color || '(no color)'
          }"`
        );
        console.log(`  Old CSV: ${csvSize}`);
        console.log(`  New CSV: ${dedupStr}`);

        return {
          ...v,
          size: dedupStr,
        };
      });

      if (changed) {
        totalProductsUpdated += 1;
        await app.db.query('api::product.product').update({
          where: { id: p.id },
          data: {
            product_variants: newVariants,
          },
        });
      }
    }

    console.log(
      `[TDLC] CSV size cleanup complete. Products updated: ${totalProductsUpdated}, variants touched: ${totalVariantsTouched}`
    );
  } catch (err) {
    console.error('[TDLC] fix-duplicate-csv-sizes script failed:', err);
  } finally {
    await app.destroy();
  }
}

run().catch((err) => {
  console.error('[TDLC] Fatal in fix-duplicate-csv-sizes:', err);
});
