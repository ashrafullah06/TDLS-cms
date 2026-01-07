// FILE: scripts/fix-product-variants-link-table.js
'use strict';

const path = require('path');
const dotenv = require('dotenv');
const createStrapi = require('@strapi/strapi');

async function run() {
  const appDir = path.resolve(__dirname, '..');
  console.log('[TDLC] Bootstrapping Strapi (fix-product-variants-link-table) from', appDir);
  console.log('[TDLC] NODE_ENV =', process.env.NODE_ENV || 'development');

  // 1) Load .env
  const envPath = path.join(appDir, '.env');
  dotenv.config({ path: envPath });
  console.log('[TDLC] Loaded env file:', envPath);

  // 2) Force OWNER URL for this script
  if (process.env.STRAPI_DB_OWNER_POOLER_CB) {
    process.env.DATABASE_URL = process.env.STRAPI_DB_OWNER_POOLER_CB;
    console.log(
      '[TDLC] DATABASE_URL forced to STRAPI_DB_OWNER_POOLER_CB for fix-product-variants-link-table script'
    );
  }

  const dbUrl =
    process.env.DATABASE_URL || process.env.STRAPI_DB_OWNER_POOLER_CB;
  console.log(
    '[TDLC] Effective DB URL (fix-product-variants-link-table):',
    dbUrl ? dbUrl.replace(/:.+@/, ':****@') : '(none)'
  );

  // 3) Boot Strapi
  const app = await createStrapi().load();

  try {
    const knex = app.db.connection;

    console.log('[TDLC][LINK-FIX] Loading all product_variant link rows...');
    const links = await knex('products_product_variants_links')
      .select('id', 'entity_id', 'component_id')
      .orderBy([{ column: 'entity_id' }, { column: 'component_id' }, { column: 'id' }]);

    console.log('[TDLC][LINK-FIX] Total link rows:', links.length);

    const keepMap = new Map(); // key = `${entity_id}:${component_id}` -> keepId
    const duplicates = [];

    for (const row of links) {
      const key = `${row.entity_id}:${row.component_id}`;
      const existingKeepId = keepMap.get(key);

      if (existingKeepId == null) {
        // first time we see this product+variant pair – keep this row
        keepMap.set(key, row.id);
      } else {
        // duplicate relation – mark for deletion
        duplicates.push(row.id);
      }
    }

    if (!duplicates.length) {
      console.log('[TDLC][LINK-FIX] No duplicate link rows detected. Nothing to delete.');
    } else {
      console.log(
        `[TDLC][LINK-FIX] Found ${duplicates.length} duplicate link rows. Deleting...`
      );
      await knex('products_product_variants_links')
        .whereIn('id', duplicates)
        .del();
      console.log('[TDLC][LINK-FIX] Duplicate link rows deleted.');
    }

    // Optional: clean orphan component rows
    console.log('[TDLC][LINK-FIX] Cleaning orphan components (optional)...');
    const usedComponentIdsRows = await knex('products_product_variants_links')
      .distinct('component_id');

    const usedIds = usedComponentIdsRows.map((r) => r.component_id);

    const deletedOrphans = await knex('components_variant_product_variants')
      .whereNotIn('id', usedIds)
      .del();

    console.log(
      `[TDLC][LINK-FIX] Orphan components deleted: ${deletedOrphans}`
    );

    console.log('[TDLC][LINK-FIX] Done.');
  } catch (err) {
    console.error('[TDLC][LINK-FIX] Failed:', err);
  } finally {
    await app.destroy();
  }
}

run().catch((err) => {
  console.error('[TDLC][LINK-FIX] Fatal:', err);
});
