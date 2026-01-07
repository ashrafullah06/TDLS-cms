import * as React from 'react';
import { useState, useMemo } from 'react';
import { Box } from '@strapi/design-system/Box';
import { Flex } from '@strapi/design-system/Flex';
import { Button } from '@strapi/design-system/Button';
import { Typography } from '@strapi/design-system/Typography';
import { TextInput } from '@strapi/design-system/TextInput';
import { Tag } from '@strapi/design-system/Tag';
import { Grid, GridItem } from '@strapi/design-system/Grid';
import { useCMEditViewDataManager } from '@strapi/helper-plugin';

type Variant = { color?: string | null; size?: string | null; generated_sku?: string | null; barcode?: string | null };
type Product = { base_sku?: string | null; product_variants?: Variant[] };

const S = (s: any) => (s ?? '').toString().toUpperCase().replace(/[^A-Z0-9-]/g, '');

// 🔒 Fixed size set (simple, explicit)
const FIXED_SIZES = ['XSS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL', 'XXXXXL'] as const;

// Light color suggestions (no heavy picker)
const COLOR_SUGGESTIONS = ['Black', 'White', 'Navy', 'Grey', 'Blue', 'Red', 'Green', 'Beige', 'Brown', 'Pink', 'Purple'];

export default function VariantMatrixCard() {
  const { modifiedData, onChange } = useCMEditViewDataManager<{ modifiedData: Product }>() as any;

  const [color, setColor] = useState<string>('');
  const [selected, setSelected] = useState<Set<string>>(new Set(['M', 'L']));

  const existing = useMemo(() => {
    const set = new Set<string>();
    (modifiedData?.product_variants || []).forEach((v: Variant) => {
      set.add(`${S(v.color)}|${S(v.size)}`);
    });
    return set;
  }, [modifiedData]);

  const toggleSize = (sz: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(sz)) next.delete(sz);
      else next.add(sz);
      return next;
    });
  };

  const addRow = (c: string, size: string) => {
    const key = `${S(c)}|${S(size)}`;
    if (!c || !size || existing.has(key)) return;
    const next = [...(modifiedData.product_variants || []), { color: c, size }];
    onChange({ target: { name: 'product_variants', value: next } });
  };

  const addSelectedForColor = () => {
    const c = color.trim();
    if (!c) return;
    FIXED_SIZES.forEach((sz) => {
      if (selected.has(sz)) addRow(c, sz);
    });
  };

  const filteredSuggestions = COLOR_SUGGESTIONS.filter((c) =>
    c.toLowerCase().startsWith(color.trim().toLowerCase())
  ).slice(0, 6);

  return (
    <Box hasRadius background="neutral0" shadow="tableShadow" padding={4} marginBottom={4}
         style={{ border: '1px solid var(--ds-colors-neutral150)' }}>
      <Flex direction="column" gap={3}>
        <Typography variant="delta">Variants — quick add</Typography>
        <Typography variant="pi" textColor="neutral600">
          Type a color, tick sizes (fixed set), then “Add selected sizes for this color”.
        </Typography>

        <Grid gap={2}>
          <GridItem col={8}>
            <TextInput
              label="Color"
              placeholder="e.g., Black"
              value={color}
              onChange={(e: any) => setColor(e.target.value)}
            />
            {color && filteredSuggestions.length > 0 && (
              <Flex gap={2} paddingTop={2} wrap="wrap">
                {filteredSuggestions.map((s) => (
                  <Button key={s} size="S" variant="tertiary" onClick={() => setColor(s)}>
                    {s}
                  </Button>
                ))}
              </Flex>
            )}
          </GridItem>
          <GridItem col={4} style={{ display: 'flex', alignItems: 'flex-end' }}>
            <Button onClick={addSelectedForColor} disabled={!color.trim()}>
              Add selected sizes for this color
            </Button>
          </GridItem>
        </Grid>

        <Flex gap={2} wrap="wrap" alignItems="center">
          {FIXED_SIZES.map((sz) => {
            const active = selected.has(sz);
            return (
              <Button key={sz} size="S" variant={active ? 'secondary' : 'tertiary'} onClick={() => toggleSize(sz)}>
                {sz}
              </Button>
            );
          })}
        </Flex>

        <Box paddingTop={2}>
          <Typography variant="pi" textColor="neutral600">Current variants:</Typography>
          <Flex wrap="wrap" gap={2} paddingTop={2}>
            {(modifiedData?.product_variants || []).length ? (
              (modifiedData?.product_variants || []).map((v: Variant, i: number) => (
                <Tag key={`${i}-${v.color}-${v.size}`}>{S(v.color)} / {S(v.size)}</Tag>
              ))
            ) : (
              <Typography textColor="neutral600">No variants yet.</Typography>
            )}
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
}
