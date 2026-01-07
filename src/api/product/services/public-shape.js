'use strict';

/**
 * Extract a Strapi media object in a uniform way.
 * Supports:
 *   - entityService shape → { id, url, ... }
 *   - REST shape → { id, attributes: { url, ... } }
 *   - or nested { data: { ... } } / { data: [ ... ] }
 */
function getMediaFromAny(input) {
  if (!input) return null;

  // If it's already a file-like object with a url
  if (input.url) return input;

  // REST shape: { attributes: { url, ... } }
  if (input.attributes && input.attributes.url) {
    return input.attributes;
  }

  // { data: { .. } } or { data: [ .. ] }
  if (input.data) {
    if (Array.isArray(input.data)) {
      return input.data[0] ? getMediaFromAny(input.data[0]) : null;
    }
    return getMediaFromAny(input.data);
  }

  return null;
}

/**
 * Normalize a "media list" field to an array of file-like objects.
 * Supports:
 *   - [ { url, ... }, ... ]
 *   - { data: [ { attributes: { url, ... } }, ... ] }
 */
function normalizeMediaList(input) {
  if (!input) return [];

  const result = [];

  // Already an array of files
  if (Array.isArray(input)) {
    for (const m of input) {
      const file = getMediaFromAny(m);
      if (file && file.url) result.push(file);
    }
    return result;
  }

  // Shape with .data
  if (Array.isArray(input.data)) {
    for (const m of input.data) {
      const file = getMediaFromAny(m);
      if (file && file.url) result.push(file);
    }
    return result;
  }

  const single = getMediaFromAny(input);
  return single && single.url ? [single] : [];
}

function absoluteUrl(media, ctx) {
  const file = getMediaFromAny(media);
  if (!file || !file.url) return null;

  const url = file.url;
  if (/^https?:\/\//i.test(url)) return url;

  // Prefer explicit server URL if configured
  let base = strapi.config?.server?.url || '';

  // If no ctx and no explicit server.url, just return relative URL
  if (!ctx && !base) {
    return url.startsWith('/') ? url : `/${url}`;
  }

  // If server.url is not set, try to infer from ctx (if available)
  if (!base && ctx) {
    const headers = ctx.request?.header || ctx.request?.headers || {};
    const xfHost = headers['x-forwarded-host'] || headers['X-Forwarded-Host'];
    const xfProto = headers['x-forwarded-proto'] || headers['X-Forwarded-Proto'];

    if (xfHost) {
      base = `${xfProto || 'https'}://${xfHost}`;
    } else {
      const protocol = ctx.request?.protocol || 'http';
      const host = ctx.request?.host || headers.host || 'localhost';
      base = `${protocol}://${host}`;
    }
  }

  // If we still don't have a base (no ctx, no server.url), fallback to relative.
  if (!base) {
    return url.startsWith('/') ? url : `/${url}`;
  }

  const normalizedBase = base.replace(/\/+$/, '');
  const normalizedPath = url.startsWith('/') ? url : `/${url}`;

  return `${normalizedBase}${normalizedPath}`;
}

/**
 * Safe numeric conversion helper.
 */
function toNum(v) {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/**
 * Normalize SEO component array:
 *   seo: repeatable component "common.seo-meta"
 *     - title
 *     - description
 *     - lang ("en" | "bn")
 *     - channel ("website" | "marketplace" | "social")
 *     - keywords: repeatable "common.keyword" (value)
 *
 * Returns:
 *   {
 *     primary: { ... },
 *     records: [ ... ]
 *   }
 */
function normalizeSeo(p) {
  const rawSeo = Array.isArray(p.seo)
    ? p.seo
    : p.seo
    ? [p.seo]
    : [];

  const records = rawSeo.map((item) => {
    const kws = Array.isArray(item.keywords) ? item.keywords : [];
    const keywords = kws
      .map((k) => (k && typeof k.value === 'string' ? k.value.trim() : null))
      .filter(Boolean);

    return {
      title: item.title || p.name || '',
      description: item.description || p.short_description || '',
      lang: item.lang || 'en',
      channel: item.channel || 'website',
      keywords,
    };
  });

  // Choose primary: prefer website + en, then first entry, otherwise null
  let primary =
    records.find((r) => r.channel === 'website' && r.lang === 'en') ||
    records[0] ||
    null;

  // Fallback if no SEO component records exist:
  if (!primary) {
    primary = {
      title: p.name || '',
      description: p.short_description || '',
      lang: 'en',
      channel: 'website',
      keywords: [],
    };
  }

  return { primary, records };
}

/**
 * Normalize Alt Names component:
 *   alt_names_entries: repeatable "common.alt-name"
 *     - value
 *     - lang ("en" | "bn" | "marketplace" | "nickname")
 *
 * Returns:
 *   {
 *     list: [{ value, lang }],
 *     by_lang: { en: [...], bn: [...], ... }
 *   }
 */
function normalizeAltNames(p) {
  const rawAlt = Array.isArray(p.alt_names_entries)
    ? p.alt_names_entries
    : [];

  const list = rawAlt
    .map((a) => {
      if (!a || !a.value) return null;
      const value = String(a.value).trim();
      if (!value) return null;
      const lang = a.lang || 'en';
      return { value, lang };
    })
    .filter(Boolean);

  const byLang = {};
  for (const item of list) {
    if (!byLang[item.lang]) byLang[item.lang] = [];
    byLang[item.lang].push(item.value);
  }

  return { list, by_lang: byLang };
}

/**
 * Normalize translations component:
 *   translations: repeatable "common.translation"
 *     - locale
 *     - name
 *     - description
 *     - short_description
 */
function normalizeTranslations(p) {
  const raw = Array.isArray(p.translations) ? p.translations : [];
  return raw.map((t) => ({
    locale: t.locale || null,
    name: t.name || null,
    description: t.description || null,
    short_description: t.short_description || null,
  }));
}

/**
 * Relation → slug[] helper.
 * Works with Strapi relation shapes:
 *   - { data: { attributes: { slug } } }
 *   - { data: [ { attributes: { slug } }, ... ] }
 *   - or just attributes directly.
 */
function relSlugs(rel) {
  if (!rel) return [];
  const data = rel.data ?? rel;

  const arr = Array.isArray(data) ? data : [data];

  return arr
    .map((n) => {
      const attrs = n?.attributes || n;
      return attrs?.slug || attrs?.name;
    })
    .filter(Boolean)
    .map((s) =>
      s
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
    );
}

module.exports = () => ({
  async serialize(p, ctx) {
    // -----------------------------
    // IMAGES & GALLERY
    // -----------------------------
    const images = normalizeMediaList(p.images);
    const galleryFiles = normalizeMediaList(p.gallery);

    // Prefer explicit images[]; fall back to gallery[] if needed
    const coverFile = images[0] || galleryFiles[0] || null;
    const cover = coverFile ? absoluteUrl(coverFile, ctx) : null;

    const gallery = galleryFiles
      .map((f) => absoluteUrl(f, ctx))
      .filter(Boolean);

    // -----------------------------
    // DESCRIPTION
    // -----------------------------
    const rawDescription = p.description ?? '';

    // We keep the old key for backwards compatibility,
    // but also expose a raw version so the frontend can render blocks later.
    const description_html = rawDescription; // currently stored as richtext string
    const description_raw = rawDescription;

    // -----------------------------
    // PRICING (MODEL 3)
    // Product-level selling/compare as base,
    // then can be overridden by variant/size on the frontend.
    // -----------------------------
    const productSale =
      toNum(p.selling_price) ?? toNum(p.base_price) ?? 0;
    const productCompare =
      toNum(p.compare_price) ?? toNum(p.discount_price) ?? null;

    // We'll also derive min/max across all size-level prices (if present)
    let rangeMin = null;
    let rangeMax = null;

    // -----------------------------
    // VARIANTS & SIZE STOCKS
    // -----------------------------
    const rawVariants = Array.isArray(p.product_variants)
      ? p.product_variants
      : [];

    let stockTotalFromSizes = 0;

    const variants = rawVariants.map((v) => {
      const stocks = Array.isArray(v.size_stocks) ? v.size_stocks : [];

      // Normalize variant images (multiple allowed)
      const variantImages = normalizeMediaList(v.variant_image);
      const primaryVariantImage = variantImages[0] || null;

      // Use first stock row as "primary" for simple cases
      const primaryStock = stocks[0] || null;

      // Keep old top-level keys for compatibility
      const legacySku =
        v.generated_sku ||
        (primaryStock && primaryStock.generated_sku) ||
        null;
      const legacyBarcode =
        v.barcode || (primaryStock && primaryStock.barcode) || null;

      // Aggregate stock and price range at variant level
      let variantStockTotal = 0;
      let variantMin = null;
      let variantMax = null;

      const sizes = stocks.map((s) => {
        const sizeName = s.size_name ?? null;
        const qty = toNum(s.stock_quantity) ?? 0;

        // Effective pricing at size level:
        // size.price_override → size.price → productSale
        const sizeOverride = toNum(s.price_override);
        const sizePrice = toNum(s.price);
        const sizeCompare = toNum(s.compare_at_price);

        const effPrice =
          sizeOverride != null
            ? sizeOverride
            : sizePrice != null
            ? sizePrice
            : productSale;

        const effCompare =
          sizeCompare != null
            ? sizeCompare
            : productCompare != null
            ? productCompare
            : effPrice;

        // Track stock totals (only active sizes)
        if (s.is_active !== false) {
          stockTotalFromSizes += qty;
          variantStockTotal += qty;
        }

        // Track global price range
        if (effPrice != null) {
          if (rangeMin == null || effPrice < rangeMin) rangeMin = effPrice;
          if (rangeMax == null || effPrice > rangeMax) rangeMax = effPrice;
        }

        // Track per-variant price range
        if (effPrice != null) {
          if (variantMin == null || effPrice < variantMin) variantMin = effPrice;
          if (variantMax == null || effPrice > variantMax) variantMax = effPrice;
        }

        return {
          id: s.id,
          size_name: sizeName,
          stock_quantity: qty,
          price: sizePrice,
          compare_at_price: sizeCompare,
          price_override: sizeOverride,
          effective_price: effPrice,
          effective_compare_at_price: effCompare,
          sku: s.generated_sku ?? null,
          barcode: s.barcode ?? null,
          is_active: s.is_active !== false,
          sold_count: toNum(s.sold_count) ?? 0,
          inventory_status: s.inventory_status ?? null,
          warehouse_location: s.warehouse_location ?? null,
          backorder_allowed: s.backorder_allowed ?? false,
          restock_date: s.restock_date ?? null,

          // 🔹 NEW: sizing meta for frontend (safe, optional)
          size_system: s.size_system ?? p.size_system ?? null,
          primary_value: s.primary_value ?? null,
          secondary_value: s.secondary_value ?? null,
        };
      });

      return {
        // Legacy / simple fields
        color: v.color || null,
        size: v.size || null, // legacy, often null in your current data
        sku: legacySku,
        barcode: legacyBarcode,
        image: primaryVariantImage
          ? absoluteUrl(primaryVariantImage, ctx)
          : null,

        // New richer media field: all variant images
        images: variantImages
          .map((img) => absoluteUrl(img, ctx))
          .filter(Boolean),

        // New aggregate info
        stock_total: variantStockTotal,
        price_range: {
          min: variantMin,
          max: variantMax,
        },

        // New richer structure for multiple sizes per color
        sizes,
      };
    });

    const hasVariants = variants.length > 0;

    // If we didn't see any size-level prices, fall back to product-level sale
    if (rangeMin == null && productSale != null) {
      rangeMin = productSale;
    }
    if (rangeMax == null && productSale != null) {
      rangeMax = productSale;
    }

    // Final product-level public prices:
    const price_sale = productSale;
    const price_mrp = productCompare != null ? productCompare : productSale;

    // Stock total: prefer sum from size_stocks; fallback to product.inventory
    const stockTotal =
      stockTotalFromSizes > 0
        ? stockTotalFromSizes
        : toNum(p.inventory) ?? null;

    // -----------------------------
    // SEO / ALT NAMES / TRANSLATIONS
    // -----------------------------
    const seo = normalizeSeo(p);
    const alt_names = normalizeAltNames(p);
    const translations = normalizeTranslations(p);

    // -----------------------------
    // Final public shape
    // -----------------------------
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      short_description: p.short_description,
      // Old key (backwards compatible)
      description_html,
      // New key (for future rich rendering)
      description_raw,
      status: p.status,
      fit: p.fit || null,
      // 🔹 NEW: product-level sizing system (for UI hints, filters, etc.)
      size_system: p.size_system || null,
      price_currency: p.currency,
      price_mrp,
      price_sale,
      price_range: {
        min: rangeMin,
        max: rangeMax,
      },
      cover_image: cover,
      gallery,
      has_variants: hasVariants,
      stock_total: stockTotal,
      codes: {
        uuid: p.uuid,
        product_code: p.product_code,
        base_sku: p.base_sku,
        barcode: p.barcode,
        hs_code: p.hs_code || null,
      },
      seo,
      alt_names,
      translations,
      variants,

      // 🔹 taxonomy / relation slugs for navigation & filters
      audience_categories_slugs: relSlugs(p.audience_categories),
      categories_slugs: relSlugs(p.categories),
      sub_categories_slugs: relSlugs(p.sub_categories),
      super_categories_slugs: relSlugs(p.super_categories),
      age_groups_slugs: relSlugs(p.age_groups),
      gender_groups_slugs: relSlugs(p.gender_groups),
      brand_tiers_slugs: relSlugs(p.brand_tiers),
      events_products_collections_slugs: relSlugs(p.events_products_collections),
      tags_slugs: relSlugs(p.tags),
    };
  },
});
