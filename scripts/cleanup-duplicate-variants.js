// FILE: scripts/cleanup-duplicate-variants.js
'use strict';

const path = require('path');
const dotenv = require('dotenv');
const createStrapi = require('@strapi/strapi');

async function run() {
  const appDir = path.resolve(__dirname, '..');
  console.log('[TDLC] Bootstrapping Strapi (cleanup-duplicate-variants) from', appDir);
  console.log('[TDLC] NODE_ENV =', process.env.NODE_ENV || 'development');

  // Load .env
  const envPath = path.join(appDir, '.env');
  dotenv.config({ path: envPath });
  console.log('[TDLC] Loaded env file:', envPath);

  // Use OWNER connection so we avoid permission issues
  if (process.env.STRAPI_DB_OWNER_POOLER_CB) {
    process.env.DATABASE_URL = process.env.STRAPI_DB_OWNER_POOLER_CB;
    console.log(
      '[TDLC] DATABASE_URL forced to STRAPI_DB_OWNER_POOLER_CB for cleanup-duplicate-variants script'
    );
  }

  const dbUrl =
    process.env.DATABASE_URL || process.env.STRAPI_DB_OWNER_POOLER_CB;
  console.log(
    '[TDLC] Effective DB URL (cleanup-duplicate-variants):',
    dbUrl ? dbUrl.replace(/:.+@/, ':****@') : '(none)'
  );

  const app = await createStrapi().load();

  try {
    console.log('[TDLC] Loading products with product_variants for cleanup...');
    const products = await app.db.query('api::product.product').findMany({
      populate: {
        product_variants: {
          populate: { size_stocks: true, variant_image: true },
        },
      },
    });

    console.log(`[TDLC] Found ${products.length} products\n`);

    let totalDupProducts = 0;
    let totalVariantsRemoved = 0;

    for (const p of products) {
      const variants = Array.isArray(p.product_variants)
        ? p.product_variants
        : [];

      if (!variants.length) continue;

      const seenVariantKeys = new Set();
      const cleanVariants = [];
      const removedVariants = [];

      for (const v of variants) {
        const color = (v.color || '').toString().trim().toUpperCase() || '(NO_COLOR)';
        const imgId = v.variant_image?.id || v.variant_image || 'NO_IMG';
        const key = `${color}|${imgId}`;

        if (seenVariantKeys.has(key)) {
          removedVariants.push({
            id: v.id,
            color: v.color,
            variant_image: imgId,
          });
          continue;
        }
        seenVariantKeys.add(key);

        // Deduplicate size_stocks within this variant
        const sizeStocks = Array.isArray(v.size_stocks) ? v.size_stocks : [];
        const seenSizes = new Set();
        const cleanSizeStocks = [];

        for (const s of sizeStocks) {
          const rawSize =
            s.size_name || s.size || s.sizeName || s.size_code || null;
          const normSize = rawSize
            ? rawSize.toString().trim().toUpperCase()
            : '';

          if (!normSize) continue;
          if (seenSizes.has(normSize)) {
            continue;
          }
          seenSizes.add(normSize);

          const { id: _ignoreSizeId, ...restSize } = s;
          cleanSizeStocks.push({
            ...restSize,
            size_name: normSize,
          });
        }

        // Strip the component id so Strapi creates a fresh component row
        const { id: _ignoreVariantId, size_stocks, ...restVariant } = v;

        cleanVariants.push({
          ...restVariant,
          size_stocks: cleanSizeStocks,
        });
      }

      if (!removedVariants.length && cleanVariants.length === variants.length) {
        // no change
        continue;
      }

      totalDupProducts += 1;
      totalVariantsRemoved += removedVariants.length;

      console.log(
        `[TDLC][CLEANUP] Product #${p.id} "${p.name}" – ` +
          `input variants=${variants.length}, unique variants=${cleanVariants.length}, removed duplicates=${removedVariants.length}`
      );
      removedVariants.forEach((rv) => {
        console.log(
          `    removed: id=${rv.id || '(no id)'} color="${rv.color || ''}" img=${rv.variant_image}`
        );
      });

      // IMPORTANT: we pass variants WITHOUT ids so Strapi wipes old links
      await app.db.query('api::product.product').update({
        where: { id: p.id },
        data: {
          product_variants: cleanVariants,
        },
      });
    }

    console.log('\n[TDLC] Cleanup complete.');
    console.log(
      `[TDLC] Products affected: ${totalDupProducts}, duplicate variant links removed (logically): ${totalVariantsRemoved}`
    );
  } catch (err) {
    console.error('[TDLC] cleanup-duplicate-variants script failed:', err);
  } finally {
    await app.destroy();
  }
}

run().catch((err) => {
  console.error('[TDLC] Fatal in cleanup-duplicate-variants:', err);
});
