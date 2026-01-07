'use strict';

const crypto = require('crypto');

// Strapi UID for this content-type
const PRODUCT_UID = 'api::product.product';

/* ────────────────────────── tiny helpers ────────────────────────── */

const U = (s) => (s ?? '').toString().toUpperCase();
const S = (s) => U(s).replace(/[^A-Z0-9]/g, '');
const pad4 = (n) => String(n).padStart(4, '0');

const cat3 = (seed) => {
  const s = S(seed ?? '');
  return s.slice(0, 3) || 'GEN';
};

const col3 = (seed) => {
  const s = S(seed ?? '');
  return s.slice(0, 3) || 'NOC';
};

const y2 = () => new Date().getFullYear().toString().slice(-2);

const yymm = () => {
  const d = new Date();
  return (
    d.getFullYear().toString().slice(-2) +
    String(d.getMonth() + 1).padStart(2, '0')
  );
};

const yyyymmdd = () => {
  const d = new Date();
  return (
    d.getFullYear().toString() +
    String(d.getMonth() + 1).padStart(2, '0') +
    String(d.getDate()).padStart(2, '0')
  );
};

const isEan13 = (s) => /^\d{13}$/.test(String(s || ''));

/**
 * Deterministic EAN-13 from an arbitrary seed string.
 */
const makeEAN13 = (seed) => {
  const hex = crypto.createHash('sha1').update(String(seed)).digest('hex');
  const map = { a: '0', b: '1', c: '2', d: '3', e: '4', f: '5' };
  const digits = hex.replace(/[a-f]/g, (c) => map[c]);

  // Force leading "20" so we stay in a plausible GTIN range
  const base12 = '20' + digits.slice(0, 10);
  const arr = base12.split('').map((d) => +d);
  const sum = arr.reduce((acc, d, i) => acc + d * (i % 2 ? 3 : 1), 0);
  const check = (10 - (sum % 10)) % 10;
  return base12 + String(check);
};

/* ────────────────────────── SIZE SYSTEMS ────────────────────────── */

const SIZE_SYSTEM = {
  ALPHA: 'Alpha (XS-XXL: T-shirts, shirts, pants)',
  NUMERIC_SINGLE: 'Numeric (single: collar/waist, e.g. 15.5, 32)',
  WAIST_LENGTH: 'Numeric (waist x length: e.g. 32x30)',
  SHOE: 'Shoe size (e.g. 42, 8, UK 9)',
  KIDS: 'Kids age (e.g. 2-3Y, 4-5Y)',
  FREE: 'Free / one size',
};

function normalizeSizeSystemLabel(value) {
  if (!value) return SIZE_SYSTEM.ALPHA;
  const v = String(value).trim();

  // Match by prefix so we are tolerant if labels ever change slightly.
  if (v.startsWith('Alpha')) return SIZE_SYSTEM.ALPHA;
  if (v.startsWith('Numeric (single')) return SIZE_SYSTEM.NUMERIC_SINGLE;
  if (v.startsWith('Numeric (waist x length')) return SIZE_SYSTEM.WAIST_LENGTH;
  if (v.startsWith('Shoe size')) return SIZE_SYSTEM.SHOE;
  if (v.startsWith('Kids age')) return SIZE_SYSTEM.KIDS;
  if (v.startsWith('Free / one')) return SIZE_SYSTEM.FREE;

  return SIZE_SYSTEM.ALPHA;
}

function parseNumeric(value) {
  if (value == null || value === '') return null;
  const n = parseFloat(String(value).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

/**
 * Given a size system and the normalized size label (e.g. "M", "15.5", "32X30", "42"),
 * return numeric breakdown for analytics / filtering.
 */
function parseSizeForSystem(sizeSystem, sizeName) {
  const size_system = normalizeSizeSystemLabel(sizeSystem);
  const raw = String(sizeName || '').trim();
  const upper = raw.toUpperCase();

  if (!raw) {
    return { size_system, primary_value: null, secondary_value: null };
  }

  // Numeric single: collar or waist only (15.5, 16, 30, 32 ...)
  if (size_system === SIZE_SYSTEM.NUMERIC_SINGLE) {
    return {
      size_system,
      primary_value: parseNumeric(raw),
      secondary_value: null,
    };
  }

  // Waist x length: "32x30", "30x32", "34×30"
  if (size_system === SIZE_SYSTEM.WAIST_LENGTH) {
    const parts = upper.split(/[X×]/);
    const waistPart = parts[0] ?? '';
    const lengthPart = parts[1] ?? '';
    return {
      size_system,
      primary_value: parseNumeric(waistPart),
      secondary_value: parseNumeric(lengthPart),
    };
  }

  // Shoe size: pick the first numeric value we find (42, 8, 8.5, etc.)
  if (size_system === SIZE_SYSTEM.SHOE) {
    const match = raw.match(/[\d.,]+/);
    const primary = match ? parseNumeric(match[0]) : null;
    return {
      size_system,
      primary_value: primary,
      secondary_value: null,
    };
  }

  // Kids age / Alpha / Free size → usually not broken into numeric values.
  return {
    size_system,
    primary_value: null,
    secondary_value: null,
  };
}

/* ────────────────────────── DB HELPERS ────────────────────────── */

/**
 * Find the next 4-digit sequence for a given prefix and attribute name.
 */
async function nextSeq(prefix, attrName) {
  const latest = await strapi.db.query(PRODUCT_UID).findMany({
    where: { [attrName]: { $startsWith: prefix } },
    select: [attrName],
    orderBy: { [attrName]: 'desc' },
    limit: 1,
  });

  const val = latest?.[0]?.[attrName];
  const n = val ? parseInt(String(val).slice(prefix.length), 10) || 0 : 0;
  return pad4(n + 1);
}

/**
 * Get first category entry from data + resolve it from DB if needed.
 */
async function getFirstCategory(data) {
  const arr = Array.isArray(data?.categories) ? data.categories : [];
  if (!arr.length) return null;

  const first = arr[0];
  const id = first?.id ?? first?.documentId ?? first;

  // Inline object without an id (rare in normal Strapi flow but keep it safe)
  if (!id) {
    return {
      name: first?.name,
      code: first?.code || first?.category_code,
      hs_code: first?.hs_code,
    };
  }

  try {
    const cat = await strapi.db
      .query('api::category.category')
      .findOne({ where: { id } });

    if (!cat) return null;

    return {
      name: cat.name,
      code: cat.category_code || cat.code,
      hs_code: cat.hs_code,
    };
  } catch (err) {
    strapi.log.warn(
      `[product codegen] Failed to load first category (id=${id}): ${err.message}`
    );

    return {
      name: first?.name,
      code: first?.code || first?.category_code,
      hs_code: first?.hs_code,
    };
  }
}

/**
 * Resolve a short factory code (6 chars) from related factory record.
 */
async function getFactoryCode(data) {
  let raw = data?.factory;

  if (raw && typeof raw === 'object') {
    if (Array.isArray(raw.connect) && raw.connect[0]) {
      raw = raw.connect[0];
    } else if (Array.isArray(raw.data) && raw.data[0]) {
      raw = raw.data[0];
    } else if (raw.data) {
      raw = raw.data;
    }
  }

  const fid =
    (raw && typeof raw === 'object' && (raw.id ?? raw.documentId)) || raw;

  if (!fid) return 'NA';

  try {
    const fac = await strapi.db.query('api::factory.factory').findOne({
      where: { id: fid },
    });
    return S(fac?.code || fac?.name || 'NA').slice(0, 6) || 'NA';
  } catch (err) {
    strapi.log.warn(
      `[product codegen] Failed to load factory for batch code: ${err.message}`
    );
    return 'NA';
  }
}

/**
 * Per-size SKU builder.
 * Result looks like:  BASE-COL-SIZE
 * Example: "TEE-0001-RED-M"
 */
const variantSizeSku = (base, color, sizeName) => {
  const c = col3(color);
  const s = S(sizeName || '');
  return `${base}-${c}${s ? '-' + s : ''}`;
};

function stripTags(html) {
  return String(html || '').replace(/<[^>]*>/g, ' ');
}

function collapseSpaces(s) {
  return String(s || '').replace(/\s+/g, ' ').trim();
}

function truncateString(s, max) {
  const str = String(s || '');
  if (str.length <= max) return str;
  return str.slice(0, max - 1).trimEnd();
}

/**
 * Build a default SEO meta object (en + website) from product data.
 */
function buildDefaultSeo(data, cat) {
  const baseName = collapseSpaces(data.name || '');
  const brand = 'THE DNA LAB CLOTHING';

  const titleRaw = [baseName, brand].filter(Boolean).join(' | ');
  const title = truncateString(titleRaw, 70);

  let descSource = data.short_description || '';
  if (!descSource && typeof data.description === 'string') {
    descSource = stripTags(data.description);
  }

  let description = collapseSpaces(descSource);
  if (description.length > 160) {
    description = truncateString(description, 160);
  }

  const keywordSet = new Set();

  if (baseName) {
    keywordSet.add(baseName.toLowerCase());
    baseName
      .split(/[\s,]+/)
      .map((w) => w.trim())
      .filter(Boolean)
      .forEach((w) => keywordSet.add(w.toLowerCase()));
  }

  if (cat?.name) keywordSet.add(String(cat.name).toLowerCase());
  if (cat?.code) keywordSet.add(String(cat.code).toLowerCase());

  keywordSet.add('the dna lab clothing');
  keywordSet.add('the dna lab store');
  keywordSet.add('tdlc');
  keywordSet.add('tdls');

  const keywords = Array.from(keywordSet)
    .map((value) => ({ value: truncateString(value, 48) }))
    .slice(0, 12);

  return {
    title,
    description,
    lang: 'en',
    channel: 'website',
    keywords,
  };
}

function ensureDefaults(data) {
  if (!data.status) data.status = 'Draft';
  if (!data.currency) data.currency = 'BDT';
  if (!data.country_of_origin) data.country_of_origin = 'BD';

  // Soft migration
  if (data.selling_price == null && data.base_price != null) {
    data.selling_price = data.base_price;
  }
  if (data.compare_price == null && data.discount_price != null) {
    data.compare_price = data.discount_price;
  }
}

/* ────────────────────────── RELATION / MEDIA NORMALISER ────────────────────────── */

/**
 * Normalise a single id-ish value into a scalar id:
 *   - scalar id
 *   - { id }
 *   - { data: id }
 *   - { data: { id } }
 *   - { data: [ { id }, id, ... ] }
 */
function normalizeIdValue(v) {
  if (v == null) return null;

  if (typeof v === 'string' || typeof v === 'number') return v;

  if (typeof v === 'object') {
    if (
      Object.prototype.hasOwnProperty.call(v, 'id') &&
      (typeof v.id === 'string' || typeof v.id === 'number')
    ) {
      return v.id;
    }

    const d = v.data;

    if (Array.isArray(d)) {
      const first = d[0];
      if (!first) return null;
      if (typeof first === 'string' || typeof first === 'number') return first;
      if (
        typeof first === 'object' &&
        Object.prototype.hasOwnProperty.call(first, 'id') &&
        (typeof first.id === 'string' || typeof first.id === 'number')
      ) {
        return first.id;
      }
      return null;
    }

    if (d != null) {
      if (typeof d === 'string' || typeof d === 'number') return d;
      if (
        typeof d === 'object' &&
        Object.prototype.hasOwnProperty.call(d, 'id') &&
        (typeof d.id === 'string' || typeof d.id === 'number')
      ) {
        return d.id;
      }
    }
  }

  return null;
}

/**
 * Normalise arbitrary relation/media input into:
 *   - scalar id
 *   - array of ids
 *   - null
 *
 * Supports:
 *   - id
 *   - [id, { id }, { data: { id } }, ...]
 *   - { id }
 *   - { data: id | { id } | [ { id }, id ] }
 *   - { connect: [...] }, { set: [...] }
 */
function normalizeRelationField(val) {
  if (val == null) return null;

  // Wrapper object
  if (!Array.isArray(val) && val && typeof val === 'object') {
    if (Array.isArray(val.data)) {
      const ids = val.data
        .map((item) => normalizeIdValue(item))
        .filter((id) => typeof id === 'string' || typeof id === 'number');
      return ids.length ? ids : null;
    }

    if (val.data && !Array.isArray(val.data)) {
      const id = normalizeIdValue(val.data);
      return typeof id === 'string' || typeof id === 'number' ? id : null;
    }

    if (Array.isArray(val.connect) || Array.isArray(val.set)) {
      const raw = Array.isArray(val.connect) ? val.connect : val.set;
      const ids = raw
        .map((item) => normalizeIdValue(item))
        .filter((id) => typeof id === 'string' || typeof id === 'number');
      return ids.length ? ids : null;
    }
  }

  // Plain array
  if (Array.isArray(val)) {
    const ids = val
      .map((item) => normalizeIdValue(item))
      .filter((id) => typeof id === 'string' || typeof id === 'number');
    return ids.length ? ids : null;
  }

  // Plain scalar or simple object
  const id = normalizeIdValue(val);
  return typeof id === 'string' || typeof id === 'number' ? id : null;
}

/**
 * Deep sanitizer: using the schema, walk the entire data tree and ensure that
 * all relation/media fields are *only* scalar ids or arrays of scalar ids.
 * Anything else gets converted or deleted.
 */
function sanitizeRelationsBySchema(schema, value) {
  if (!schema || !schema.attributes || !value || typeof value !== 'object') {
    return;
  }

  const attrs = schema.attributes;

  for (const [key, attr] of Object.entries(attrs)) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) continue;
    const fieldVal = value[key];

    // ----- RELATIONS / MEDIA -----
    if (attr.type === 'relation' || attr.type === 'media') {
      const isMany =
        attr.type === 'media'
          ? !!attr.multiple
          : attr.relation === 'oneToMany' ||
            attr.relation === 'manyToMany' ||
            attr.relation === 'manyToManyMorph' ||
            attr.relation === 'morphToMany';

      let normalized = normalizeRelationField(fieldVal);

      if (isMany) {
        if (normalized == null) {
          delete value[key];
          continue;
        }

        if (!Array.isArray(normalized)) normalized = [normalized];

        const ids = normalized.filter(
          (id) => typeof id === 'string' || typeof id === 'number'
        );

        if (!ids.length) {
          delete value[key];
        } else {
          value[key] = ids;
        }
      } else {
        if (Array.isArray(normalized)) normalized = normalized[0];

        if (typeof normalized === 'string' || typeof normalized === 'number') {
          value[key] = normalized;
        } else {
          delete value[key];
        }
      }

      continue;
    }

    // ----- COMPONENTS -----
    if (attr.type === 'component' && attr.component) {
      const compSchema =
        (strapi.components && strapi.components[attr.component]) || null;
      if (!compSchema) continue;

      if (attr.repeatable) {
        if (!Array.isArray(fieldVal)) continue;
        for (const item of fieldVal) {
          if (item && typeof item === 'object') {
            sanitizeRelationsBySchema(compSchema, item);
          }
        }
      } else {
        if (fieldVal && typeof fieldVal === 'object') {
          sanitizeRelationsBySchema(compSchema, fieldVal);
        }
      }

      continue;
    }

    // ----- DYNAMIC ZONES -----
    if (attr.type === 'dynamiczone' && Array.isArray(fieldVal)) {
      for (const dzItem of fieldVal) {
        if (!dzItem || typeof dzItem !== 'object') continue;
        const compUID = dzItem.__component;
        if (!compUID) continue;
        const compSchema =
          (strapi.components && strapi.components[compUID]) || null;
        if (!compSchema) continue;

        sanitizeRelationsBySchema(compSchema, dzItem);
      }
    }
  }
}

/**
 * Resolve the schema object from event.model / event.contentType / PRODUCT_UID.
 * This is where we previously had a bug (treating string UID as schema).
 */
function resolveProductSchema(event) {
  let schema = event?.model || event?.contentType || PRODUCT_UID;

  // If it's a string UID, resolve via strapi.getModel / contentType
  if (typeof schema === 'string') {
    const uid = schema;
    schema =
      (strapi &&
        typeof strapi.getModel === 'function' &&
        strapi.getModel(uid)) ||
      (strapi &&
        typeof strapi.contentType === 'function' &&
        strapi.contentType(uid)) ||
      null;
  }

  // If it's still not usable, fall back to PRODUCT_UID
  if (!schema || !schema.attributes) {
    try {
      schema =
        (strapi &&
          typeof strapi.getModel === 'function' &&
          strapi.getModel(PRODUCT_UID)) ||
        (strapi &&
          typeof strapi.contentType === 'function' &&
          strapi.contentType(PRODUCT_UID)) ||
        null;
    } catch (err) {
      schema = null;
    }
  }

  return schema;
}

/**
 * For lifecycle usage; deep-sanitize all relation/media fields based on schema.
 */
function normalizeRelationsForWrite(event) {
  if (!event || !event.params || !event.params.data) return;
  const data = event.params.data;

  const schema = resolveProductSchema(event);
  if (!schema || !schema.attributes) return;

  sanitizeRelationsBySchema(schema, data);
}

/* ────────────────────────── core generator ────────────────────────── */

async function generateAll(event) {
  const isUpdate = !!(event && event.params && event.params.where);
  const data = event?.params?.data || {};

  // 0) Deep-normalize all relations/media (including nested components / DZ)
  normalizeRelationsForWrite(event);

  // 1) For CREATE without a name, skip heavy logic.
  if (!isUpdate && !data.name) {
    return;
  }

  ensureDefaults(data);

  // Ensure product-level size system always has a value.
  const productSizeSystem = normalizeSizeSystemLabel(
    data.size_system || SIZE_SYSTEM.ALPHA
  );
  data.size_system = productSizeSystem;

  // Load product model (schema)
  const model = resolveProductSchema(event);
  const attrs = (model && model.attributes) || {};

  const isSeoComponent = attrs.seo && attrs.seo.type === 'component';
  const isAltNamesComponent =
    attrs.alt_names_entries && attrs.alt_names_entries.type === 'component';
  const isTranslationsComponent =
    attrs.translations && attrs.translations.type === 'component';

  // UUID
  if (!data.uuid) data.uuid = crypto.randomUUID();

  // Category code prefix
  const cat = await getFirstCategory(data);
  const CAT = cat3(cat?.code || cat?.name || 'GEN');

  // Product code
  const productCodeOk =
    typeof data.product_code === 'string' &&
    /^[A-Z0-9]{2,}-\d{2}-\d{4}$/.test(data.product_code);

  if (!productCodeOk) {
    const prefix = `${CAT}-${y2()}-`;
    const seq = await nextSeq(prefix, 'product_code');
    data.product_code = prefix + seq;
  }

  // Base SKU
  if (!data.base_sku) {
    data.base_sku = `${CAT}-${String(data.product_code).slice(-4)}`;
  }

  // Product generated_sku
  if (!data.generated_sku) {
    data.generated_sku = data.base_sku;
  }

  // Product EAN-13
  if (!isEan13(data.barcode)) {
    data.barcode = makeEAN13(`${data.uuid}:${data.product_code}`);
  }

  // HS code from category
  if (!data.hs_code && cat?.hs_code) {
    data.hs_code = String(cat.hs_code);
  }

  // Factory + batch / serial codes
  if (!data.factory_batch_code) {
    const fact = await getFactoryCode(data);
    const prefix = `FB-${fact}-${yyyymmdd()}-`;
    const seq = await nextSeq(prefix, 'factory_batch_code');
    data.factory_batch_code = prefix + seq;
  }

  if (!data.label_serial_code) {
    const prefix = `LBL-${yymm()}-`;
    const seq = await nextSeq(prefix, 'label_serial_code');
    data.label_serial_code = prefix + seq;
  }

  if (!data.tag_serial_code) {
    const prefix = `TAG-${yymm()}-`;
    const seq = await nextSeq(prefix, 'tag_serial_code');
    data.tag_serial_code = prefix + seq;
  }

  /**
   * Variant / size-level SKUs & barcodes
   */
  if (!isUpdate && Array.isArray(data.product_variants)) {
    data.product_variants = data.product_variants.map((variant, vIndex) => {
      const v = { ...variant };

      if (v.color && !v.color_key) {
        v.color_key = S(v.color);
      }

      if (!v.generated_sku) {
        const col = v.color || 'COLOR';
        v.generated_sku = `${data.base_sku}-${col3(col)}`;
      }

      if (!isEan13(v.barcode)) {
        v.barcode = makeEAN13(
          `${data.uuid}:${data.product_code}:VARIANT:${vIndex}`
        );
      }

      let sizeStocks = Array.isArray(v.size_stocks) ? [...v.size_stocks] : [];

      if (
        (!sizeStocks || sizeStocks.length === 0) &&
        typeof v.size === 'string' &&
        v.size.trim() !== ''
      ) {
        const rawSizeNames = v.size
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

        const localSeen = new Set();
        const uniqueSizeNames = [];

        for (const raw of rawSizeNames) {
          const norm = raw.toString().trim().toUpperCase();
          if (!norm) continue;

          if (localSeen.has(norm)) {
            if (strapi && strapi.log) {
              strapi.log.warn(
                `[product codegen] Duplicate size "${norm}" in variant color="${v.color}" of product "${data.name}" – keeping one and ignoring the rest.`
              );
            }
            continue;
          }
          localSeen.add(norm);
          uniqueSizeNames.push(norm);
        }

        sizeStocks = uniqueSizeNames.map((sizeName) => ({
          size_name: sizeName,
          stock_quantity: data.inventory ?? 0,
          price: data.selling_price ?? null,
          compare_at_price: data.compare_price ?? null,
          price_override: null,
          is_active: true,
        }));
      }

      const seenVariant = new Set();

      sizeStocks = sizeStocks.map((s, sIndex) => {
        const rawSize =
          s.size_name || s.size || s.sizeName || s.size_code || null;
        const normSize = rawSize
          ? rawSize.toString().trim().toUpperCase()
          : '';

        if (!normSize) {
          const err = new Error(
            `Variant at index ${vIndex} is missing size_name for one of its size_stocks`
          );
          err.status = 400;
          throw err;
        }

        const colorLabel = v.color || 'COLOR';
        const key = `${U(colorLabel)}|${normSize}`;

        if (seenVariant.has(key)) {
          if (strapi && strapi.log) {
            strapi.log.warn(
              `[product codegen] Duplicate size_stocks entry (${colorLabel} / ${normSize}) in the same variant for product "${data.name}" – keeping the first occurrence.`
            );
          }
          return null;
        }
        seenVariant.add(key);

        const sizeSku =
          s.generated_sku ||
          variantSizeSku(data.base_sku, colorLabel, normSize);

        const sizeBarcode = isEan13(s.barcode)
          ? s.barcode
          : makeEAN13(`${data.uuid}:${sizeSku}:${vIndex}:${sIndex}`);

        const effectiveSizeSystem = normalizeSizeSystemLabel(
          s.size_system || v.size_system || productSizeSystem
        );

        const parsed = parseSizeForSystem(effectiveSizeSystem, normSize);

        return {
          ...s,
          size_name: normSize,
          generated_sku: sizeSku,
          barcode: sizeBarcode,
          is_active: typeof s.is_active === 'boolean' ? s.is_active : true,
          size_system: parsed.size_system,
          primary_value: parsed.primary_value,
          secondary_value: parsed.secondary_value,
        };
      });

      sizeStocks = sizeStocks.filter(Boolean);

      return {
        ...v,
        size_stocks: sizeStocks,
      };
    });
  }

  /**
   * SEO / Alt names / Translations (components)
   */
  if (isSeoComponent && (!Array.isArray(data.seo) || data.seo.length === 0)) {
    const seoMeta = buildDefaultSeo(data, cat);
    data.seo = [seoMeta];
  }

  if (
    isAltNamesComponent &&
    (!Array.isArray(data.alt_names_entries) ||
      data.alt_names_entries.length === 0) &&
    data.name
  ) {
    data.alt_names_entries = [
      {
        value: data.name,
        lang: 'en',
      },
    ];
  }

  if (
    isTranslationsComponent &&
    (!Array.isArray(data.translations) || data.translations.length === 0)
  ) {
    const baseName = data.name || '';
    const shortDesc = data.short_description || null;
    let descText = null;

    if (typeof data.description === 'string') {
      descText = collapseSpaces(stripTags(data.description));
    }

    data.translations = [
      {
        locale: 'en',
        name: baseName || null,
        short_description: shortDesc,
        description: descText,
      },
    ];
  }

  // FINAL: deep sanitize all relation/media fields again after mutations
  normalizeRelationsForWrite(event);

  // Debug log (deep) – if anything still looks like an object, we'll see it
  await debugRelations(event);

  event.params.data = data;
}

/* ────────────────────────── publish guard ────────────────────────── */

async function prePublishGuard(event) {
  const data = event?.params?.data || {};

  const publishing =
    Object.prototype.hasOwnProperty.call(data, 'publishedAt') &&
    data.publishedAt;

  if (!publishing) return;

  const missing = [];

  const hasName = !!data.name;
  const hasSlug = !!data.slug;

  const hasImagesArray =
    Array.isArray(data.images) && data.images.length > 0;
  const hasGalleryArray =
    Array.isArray(data.gallery) && data.gallery.length > 0;
  const okImages = hasImagesArray || hasGalleryArray;

  const okCategory =
    Array.isArray(data.categories) && data.categories.length > 0;

  const variants = Array.isArray(data.product_variants)
    ? data.product_variants
    : [];
  const hasSizeStocks = variants.some(
    (v) => Array.isArray(v.size_stocks) && v.size_stocks.length > 0
  );

  if (!hasName) missing.push('name');
  if (!hasSlug) missing.push('slug');
  if (!okCategory) missing.push('category');
  if (!okImages) missing.push('image (images or gallery)');

  if (Object.prototype.hasOwnProperty.call(data, 'selling_price')) {
    if (data.selling_price == null || data.selling_price === '') {
      missing.push('selling_price');
    }
  }

  if (!data.currency) missing.push('currency');

  if (!data.product_code) missing.push('product_code');
  if (!isEan13(data.barcode)) missing.push('barcode (EAN-13)');

  if (!hasSizeStocks) missing.push('at least one color + size variant');

  if (missing.length) {
    const err = new Error(
      `Cannot publish product: missing ${missing.join(', ')}`
    );
    err.status = 400;
    throw err;
  }
}

/* ────────────────────────── DEBUG LOGGER (deep) ────────────────────────── */

/**
 * Deep debug helper: walk the schema tree and find any relation/media fields
 * that still contain plain objects instead of ids. Logs, but does not throw.
 */
async function debugRelations(event) {
  if (!event || !event.params || !event.params.data) return;
  const data = event.params.data;

  const model = resolveProductSchema(event);
  if (!model || !model.attributes) return;

  const badFields = [];

  const isPlainObject = (val) =>
    val &&
    typeof val === 'object' &&
    !Array.isArray(val) &&
    !(val instanceof Date) &&
    !(val instanceof Buffer);

  function walk(schema, value, path) {
    if (!schema || !schema.attributes || !value || typeof value !== 'object') {
      return;
    }

    const attrs = schema.attributes;

    for (const [key, attr] of Object.entries(attrs)) {
      if (!Object.prototype.hasOwnProperty.call(value, key)) continue;
      const fieldVal = value[key];
      const fieldPath = path ? `${path}.${key}` : key;

      if (attr.type === 'relation' || attr.type === 'media') {
        if (fieldVal == null) continue;

        if (isPlainObject(fieldVal)) {
          badFields.push({ path: fieldPath, sample: fieldVal });
          continue;
        }

        if (Array.isArray(fieldVal)) {
          const sampleBad = fieldVal.find((item) => isPlainObject(item));
          if (sampleBad) {
            badFields.push({ path: fieldPath, sample: sampleBad });
          }
        }

        continue;
      }

      if (attr.type === 'component' && attr.component) {
        const compSchema =
          (strapi.components && strapi.components[attr.component]) || null;
        if (!compSchema) continue;

        if (attr.repeatable) {
          if (!Array.isArray(fieldVal)) continue;
          fieldVal.forEach((item, idx) => {
            if (item && typeof item === 'object') {
              walk(compSchema, item, `${fieldPath}[${idx}]`);
            }
          });
        } else if (fieldVal && typeof fieldVal === 'object') {
          walk(compSchema, fieldVal, fieldPath);
        }
        continue;
      }

      if (attr.type === 'dynamiczone' && Array.isArray(fieldVal)) {
        fieldVal.forEach((dzItem, idx) => {
          if (!dzItem || typeof dzItem !== 'object') return;
          const compUID = dzItem.__component;
          if (!compUID) return;
          const compSchema =
            (strapi.components && strapi.components[compUID]) || null;
          if (!compSchema) return;
          walk(compSchema, dzItem, `${fieldPath}[${idx}]`);
        });
      }
    }
  }

  walk(model, data, '');

  if (badFields.length) {
    strapi.log.error(
      '[TDLC product debugRelations] Found non-scalar relation/media values before DB attachRelations.'
    );
    strapi.log.error(
      `[TDLC product debugRelations] product name="${data.name || ''}", slug="${
        data.slug || ''
      }", product_code="${data.product_code || ''}"`
    );
    for (const bf of badFields) {
      try {
        strapi.log.error(
          `[TDLC product debugRelations] path="${bf.path}" sample=${JSON.stringify(
            bf.sample
          )}`
        );
      } catch (e) {
        strapi.log.error(
          `[TDLC product debugRelations] path="${bf.path}" sample=[unserializable]`
        );
      }
    }
  }
}

module.exports = {
  generateAll,
  prePublishGuard,
  normalizeRelationsForWrite,
  debugRelations,
};
