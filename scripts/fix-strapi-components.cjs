// scripts/fix-strapi-components.cjs
/* eslint-disable */
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const apiGlob = path.join(root, 'src', 'api');
const compRoot = path.join(root, 'src', 'components');

function walk(dir, filterFn) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir)) {
    const p = path.join(dir, e);
    const st = fs.statSync(p);
    if (st.isDirectory()) out.push(...walk(p, filterFn));
    else if (!filterFn || filterFn(p)) out.push(p);
  }
  return out;
}

function readJSON(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

function writeJSON(p, obj) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(obj, null, 2));
}

function toCollectionName(uid) {
  // e.g. "variant.product-variant" -> "components_variant_product_variants"
  const [folder, name] = uid.split('.');
  return `components_${folder}_${name.replace(/-/g, '_')}s`;
}

function main() {
  // 1) collect referenced component UIDs in content-types (component + dynamic zones)
  const schemas = walk(apiGlob, p => p.endsWith('schema.json'));
  const uids = new Set();

  for (const p of schemas) {
    const json = readJSON(p);
    if (!json || !json.attributes) continue;

    for (const [attrName, attr] of Object.entries(json.attributes)) {
      if (attr && attr.type === 'component' && typeof attr.component === 'string') {
        uids.add(attr.component);
      }
      if (attr && attr.type === 'dynamiczone' && Array.isArray(attr.components)) {
        for (const c of attr.components) if (typeof c === 'string') uids.add(c);
      }
    }
  }

  // 2) ensure component files exist and have attributes
  let created = 0, patched = 0;

  for (const uid of uids) {
    const compPath = path.join(compRoot, ...uid.split('.')) + '.json';
    if (!fs.existsSync(compPath)) {
      const base = path.basename(compPath, '.json');
      const folder = uid.split('.')[0];
      const doc = {
        collectionName: toCollectionName(uid),
        info: { displayName: base, icon: 'cube', description: '' },
        attributes: {}
      };
      writeJSON(compPath, doc);
      console.log(`🆕 Created placeholder: ${compPath}`);
      created++;
    } else {
      const doc = readJSON(compPath);
      if (doc && !('attributes' in doc)) {
        doc.attributes = {};
        writeJSON(compPath, doc);
        console.log(`🩹 Patched missing attributes: ${compPath}`);
        patched++;
      } else if (!doc) {
        console.log(`❌ Invalid JSON (skip): ${compPath}`);
      }
    }
  }

  console.log(`Done. Created ${created}, patched ${patched}.`);
}

main();
