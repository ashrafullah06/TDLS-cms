import * as React from 'react';
import { useMemo } from 'react';
import { Box } from '@strapi/design-system/Box';
import { Flex } from '@strapi/design-system/Flex';
import { Grid, GridItem } from '@strapi/design-system/Grid';
import { Typography } from '@strapi/design-system/Typography';
import { Divider } from '@strapi/design-system/Divider';
import { Tag } from '@strapi/design-system/Tag';
import { Tooltip } from '@strapi/design-system/Tooltip';
import { useCMEditViewDataManager } from '@strapi/helper-plugin';

type Variant = { color?: string | null; size?: string | null };

type ProductData = {
  uuid?: string | null;
  product_code?: string | null;
  base_sku?: string | null;
  generated_sku?: string | null;
  barcode?: string | null;
  factory_batch_code?: string | null;
  label_serial_code?: string | null;
  tag_serial_code?: string | null;
  color_code?: string | null;
  hs_code?: string | null;
  slug?: string | null;
  title?: string | null;
  name?: string | null;
  categories?: any[];
  factory?: any;
  product_variants?: Variant[];
};

const U = (s: any) => (s ?? '').toString().toUpperCase();
const S = (s: any) => U(s).replace(/[^A-Z0-9]/g, '');
const cat3 = (x: any) => {
  const s = S(x);
  return s.slice(0, 3) || 'GEN';
};
const col3 = (x: any) => {
  const s = S(x);
  return s.slice(0, 3) || 'NOC';
};
const yymm = () => {
  const d = new Date();
  return String(d.getFullYear() % 100).padStart(2, '0') + String(d.getMonth() + 1).padStart(2, '0');
};
const yyyymmdd = () => {
  const d = new Date();
  return String(d.getFullYear()) + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
};

const hexFromColorName = (name?: string | null) => {
  const n = U(name || '').trim();
  const MAP: Record<string, string> = {
    BLACK: '000000',
    WHITE: 'FFFFFF',
    RED: 'FF0000',
    BLUE: '0000FF',
    GREEN: '008000',
    YELLOW: 'FFFF00',
    ORANGE: 'FFA500',
    PINK: 'FFC0CB',
    PURPLE: '800080',
    BROWN: '8B4513',
    GREY: '808080',
    GRAY: '808080',
    NAVY: '000080',
    BEIGE: 'F5F5DC',
    MAROON: '800000',
    TEAL: '008080',
  };
  return MAP[n];
};

const VariantPreview = ({ base, v }: { base: string; v: Variant }) => {
  const sku = `${base}-${col3(v.color)}-${U(v.size || 'NOSZ').replace(/\s+/g, '')}`;
  return <Tag>{sku}</Tag>;
};

export default function SystemCodesCard() {
  const { modifiedData } =
    useCMEditViewDataManager<{ modifiedData: ProductData }>() as any;

  const view = useMemo(() => {
    const data = (modifiedData || {}) as ProductData;
    const nowYY = String(new Date().getFullYear() % 100).padStart(2, '0');

    const catSeed = cat3(
      data.categories?.[0]?.slug ||
        data.categories?.[0]?.code ||
        data.categories?.[0]?.name ||
        data.slug ||
        data.title ||
        data.name ||
        'GEN'
    );

    const codePrefix = `${catSeed}-${nowYY}-`;
    const prodCodeLive =
      data.product_code && /^[A-Z0-9]{2,}-\d{2}-\d{4}$/.test(data.product_code)
        ? data.product_code
        : `${codePrefix}????`;

    const baseLive = data.base_sku || `${catSeed}-????`;

    const v = Array.isArray(data.product_variants) ? data.product_variants : [];
    const colorHexLive = data.color_code || hexFromColorName(v[0]?.color);

    const factCode = S(data.factory?.code || data.factory?.name || 'NA').slice(0, 6) || 'NA';
    const fbLive = data.factory_batch_code || `FB-${factCode}-${yyyymmdd()}-????`;
    const lblLive = data.label_serial_code || `LBL-${yymm()}-????`;
    const tagLive = data.tag_serial_code || `TAG-${yymm()}-????`;
    const hsLive =
      data.hs_code ||
      (data.categories?.[0]?.hs_code ? String((data as any).categories[0].hs_code) : undefined);

    // Product-level generated_sku mirrors base; barcode often appears after first save
    const genSkuLive = data.generated_sku || baseLive;
    const barcodeLive = data.barcode || '— (after first save)';

    return {
      prodCodeLive,
      baseLive,
      genSkuLive,
      barcodeLive,
      uuid: data.uuid || '— (after first save)',
      fbLive,
      lblLive,
      tagLive,
      colorHexLive: colorHexLive || '—',
      hsLive: hsLive || '—',
      v,
      real: data,
    };
  }, [modifiedData]);

  return (
    <Box
      hasRadius
      background="neutral0"
      shadow="tableShadow"
      padding={4}
      marginBottom={4}
      style={{ border: '1px solid var(--ds-colors-neutral150)' }}
    >
      <Flex direction="column" gap={2}>
        <Typography variant="delta">System Codes (Preview)</Typography>
        <Typography variant="pi" textColor="neutral600">
          Live, read-only suggestions. Final values are assigned by backend lifecycles on save.
        </Typography>

        <Divider />

        <Grid gap={4}>
          <GridItem col={6}>
            <Typography variant="sigma">UUID</Typography>
            <Flex gap={2} paddingTop={1}>
              <Tag>{view.uuid}</Tag>
            </Flex>
          </GridItem>

          <GridItem col={6}>
            <Typography variant="sigma">Product Code</Typography>
            <Flex gap={2} paddingTop={1}>
              <Tag>{view.prodCodeLive}</Tag>
              {view.real.product_code && view.real.product_code !== view.prodCodeLive && (
                <Tooltip description="Saved">
                  <Tag variant="success">{view.real.product_code}</Tag>
                </Tooltip>
              )}
            </Flex>
          </GridItem>

          <GridItem col={6}>
            <Typography variant="sigma">Base SKU</Typography>
            <Flex gap={2} paddingTop={1}>
              <Tag>{view.baseLive}</Tag>
              {view.real.base_sku && view.real.base_sku !== view.baseLive && (
                <Tooltip description="Saved">
                  <Tag variant="success">{view.real.base_sku}</Tag>
                </Tooltip>
              )}
            </Flex>
          </GridItem>

          <GridItem col={6}>
            <Typography variant="sigma">Generated SKU</Typography>
            <Flex gap={2} paddingTop={1}>
              <Tag>{view.genSkuLive}</Tag>
            </Flex>
          </GridItem>

          <GridItem col={6}>
            <Typography variant="sigma">Barcode</Typography>
            <Flex gap={2} paddingTop={1}>
              <Tag>{view.barcodeLive}</Tag>
            </Flex>
          </GridItem>

          <GridItem col={6}>
            <Typography variant="sigma">Factory Batch</Typography>
            <Flex gap={2} paddingTop={1}>
              <Tag>{view.fbLive}</Tag>
              {view.real.factory_batch_code && view.real.factory_batch_code !== view.fbLive && (
                <Tooltip description="Saved">
                  <Tag variant="success">{view.real.factory_batch_code}</Tag>
                </Tooltip>
              )}
            </Flex>
          </GridItem>

          <GridItem col={6}>
            <Typography variant="sigma">Label Serial</Typography>
            <Flex gap={2} paddingTop={1}>
              <Tag>{view.lblLive}</Tag>
              {view.real.label_serial_code && view.real.label_serial_code !== view.lblLive && (
                <Tooltip description="Saved">
                  <Tag variant="success">{view.real.label_serial_code}</Tag>
                </Tooltip>
              )}
            </Flex>
          </GridItem>

          <GridItem col={6}>
            <Typography variant="sigma">Tag Serial</Typography>
            <Flex gap={2} paddingTop={1}>
              <Tag>{view.tagLive}</Tag>
              {view.real.tag_serial_code && view.real.tag_serial_code !== view.tagLive && (
                <Tooltip description="Saved">
                  <Tag variant="success">{view.real.tag_serial_code}</Tag>
                </Tooltip>
              )}
            </Flex>
          </GridItem>

          <GridItem col={6}>
            <Typography variant="sigma">HS Code</Typography>
            <Flex gap={2} paddingTop={1}>
              <Tag>{view.hsLive}</Tag>
            </Flex>
          </GridItem>

          <GridItem col={6}>
            <Typography variant="sigma">Color HEX</Typography>
            <Flex gap={2} paddingTop={1}>
              <Tag>{view.colorHexLive}</Tag>
            </Flex>
          </GridItem>
        </Grid>

        <Box paddingTop={3}>
          <Typography variant="sigma">Variant SKU Preview</Typography>
          <Flex wrap="wrap" gap={2} paddingTop={2}>
            {view.v?.length ? (
              view.v.map((vv, i) => <VariantPreview key={i} base={view.real.base_sku || view.baseLive} v={vv} />)
            ) : (
              <Typography textColor="neutral600">Add variants to see per-variant SKUs.</Typography>
            )}
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
}
