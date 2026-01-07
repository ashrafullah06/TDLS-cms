// FILE: src/api/tdlc-sync/controllers/tdlc-sync.js
'use strict';

/**
 * TDLC Stock Sync – Strapi side
 *
 * This controller is called by Next.js cron:
 *   POST /api/tdlc-sync/update-stock
 * Body:
 *   { items: [{ sizeId, stock }, ...] }
 *
 * IMPORTANT: In your real schema, size rows are stored as a **component**:
 *   component UID: "variant.size-stock"
 *   collectionName / table: "components_variant_size_stocks"
 *
 * So we update the underlying table directly via `strapi.db.connection`.
 */

const TABLE_NAME = 'components_variant_size_stocks';

module.exports = {
  async updateStock(ctx) {
    const body = ctx.request.body || {};
    const items = Array.isArray(body.items) ? body.items : [];

    if (!items.length) {
      return ctx.badRequest('NO_ITEMS', {
        message: 'Body must contain "items": [{ sizeId, stock }, ...]',
      });
    }

    if (!strapi?.db?.connection) {
      ctx.throw(500, 'DB_CONNECTION_MISSING');
    }

    const knex = strapi.db.connection;

    strapi.log.info(
      `[tdlc-sync:update-stock] Received ${items.length} items from Next cron`
    );

    const updatedIds = [];
    const errors = [];

    for (const raw of items) {
      const sizeId = raw?.sizeId;
      const stock = raw?.stock;

      if (sizeId == null) {
        errors.push({ sizeId: null, error: 'MISSING_sizeId' });
        continue;
      }

      const stockNum = Number(stock);
      const intStock = Number.isFinite(stockNum)
        ? Math.max(0, Math.round(stockNum))
        : 0;

      try {
        strapi.log.info(
          `[tdlc-sync:update-stock] Updating component row id=${sizeId} (table=${TABLE_NAME}) → stock_quantity=${intStock}`
        );

        // Check existence first (so we can push a clean ROW_NOT_FOUND error)
        const existing = await knex(TABLE_NAME)
          .where({ id: sizeId })
          .first();

        if (!existing) {
          errors.push({ sizeId, error: 'ROW_NOT_FOUND' });
          continue;
        }

        await knex(TABLE_NAME)
          .where({ id: sizeId })
          .update({ stock_quantity: intStock });

        updatedIds.push(sizeId);
      } catch (err) {
        strapi.log.error(
          `[tdlc-sync:update-stock] Failed for sizeId=${sizeId}:`,
          err
        );
        errors.push({ sizeId, error: err?.message || String(err) });
      }
    }

    strapi.log.info(
      `[tdlc-sync:update-stock] Done. updated=${updatedIds.length}, errors=${errors.length}`
    );

    ctx.body = {
      ok: true,
      received: items.length,
      updated: updatedIds,
      updatedCount: updatedIds.length,
      errors,
    };
  },
};
