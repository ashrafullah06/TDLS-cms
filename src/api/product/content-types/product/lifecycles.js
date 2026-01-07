// FILE: src/api/product/content-types/product/lifecycles.js
'use strict';

const codegen = require('./codegen');

const SYNC_SECRET = process.env.STRAPI_SYNC_SECRET || '';
const NEXT_SYNC_URL =
  process.env.NEXT_SYNC_URL ||
  'http://localhost:3000/api/internal/strapi-sync/products';

// Node 18+ has global fetch; if not, you can require("node-fetch")
async function notifyNext(entry) {
  const id = entry?.id;
  const slug = entry?.slug;

  if (!id && !slug) {
    strapi.log.warn(
      '[strapi-sync] Product entry has no id/slug; skipping sync'
    );
    return;
  }

  if (!SYNC_SECRET) {
    strapi.log.error(
      '[strapi-sync] STRAPI_SYNC_SECRET is not set; skipping sync'
    );
    return;
  }

  try {
    const res = await fetch(NEXT_SYNC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-strapi-sync-secret': SYNC_SECRET,
      },
      body: JSON.stringify({ entry: { id, slug } }),
    });

    const txt = await res.text().catch(() => '');
    let json = {};
    try {
      json = txt ? JSON.parse(txt) : {};
    } catch {
      // non-JSON body, keep txt as debug
    }

    if (!res.ok) {
      strapi.log.warn(
        `[strapi-sync] Next sync failed ${res.status} ${res.statusText} – ${txt}`
      );
      return;
    }

    strapi.log.info(
      `[strapi-sync] Synced product id=${id}, slug="${slug}" → Next: ${JSON.stringify(
        json
      )}`
    );
  } catch (err) {
    strapi.log.error(
      `[strapi-sync] Error calling Next sync endpoint: ${err.message || err}`
    );
  }
}

module.exports = {
  async beforeCreate(event) {
    // 1) Normalize / generate codes on create
    await codegen.generateAll(event);
    await codegen.prePublishGuard(event);
    await codegen.debugRelations(event);
  },

  async afterCreate(event) {
    const entry = event.result || event.params?.data || {};
    await notifyNext(entry);
  },

  async beforeUpdate(event) {
    // Keep your current behaviour (no re-gen codes, just debug)
    await codegen.debugRelations(event);
  },

  async afterUpdate(event) {
    const entry = event.result || event.params?.data || {};
    await notifyNext(entry);
  },
};
