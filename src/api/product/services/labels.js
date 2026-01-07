// FILE: src/api/product/services/labels.js
'use strict';
const PDFDocument = require('pdfkit');

module.exports = () => ({
  async make(product) {
    const doc = new PDFDocument({ size: 'A4', margin: 36 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    const done = new Promise((res) =>
      doc.on('end', () => res(Buffer.concat(chunks)))
    );

    const variants = Array.isArray(product.product_variants)
      ? product.product_variants
      : [];

    const items = [
      {
        name: product.name,
        code: product.product_code,
        barcode: product.barcode,
      },
      ...variants.map((v) => ({
        name: `${product.name} ${v.color || ''} ${v.size || ''}`.trim(),
        code: v.generated_sku,
        barcode: v.barcode,
      })),
    ].slice(0, 64);

    doc.fontSize(14).text(`Labels: ${product.name} (${product.product_code})`);
    doc.moveDown();

    const cols = 2;
    const colW =
      (doc.page.width - doc.page.margins.left - doc.page.margins.right) /
      cols;
    let i = 0;

    for (const it of items) {
      const x = doc.page.margins.left + (i % cols) * colW;
      const y = doc.y;
      doc.rect(x, y, colW - 8, 80).stroke();
      doc
        .fontSize(12)
        .text(it.name || '', x + 8, y + 6, {
          width: colW - 24,
          height: 16,
        });
      doc
        .fontSize(10)
        .text(String(it.code || ''), { width: colW - 24 });
      doc.fontSize(10).text(`EAN: ${String(it.barcode || '')}`);
      i++;
      if (i % cols === 0) doc.moveDown(6);
    }

    doc.end();
    return done;
  },
});
