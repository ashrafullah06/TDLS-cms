// src/admin/components/masked-inputs/index.tsx
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Box } from '@strapi/design-system/Box';
import { Flex } from '@strapi/design-system/Flex';
import { Grid, GridItem } from '@strapi/design-system/Grid';
import { TextInput } from '@strapi/design-system/TextInput';
import { Typography } from '@strapi/design-system/Typography';
import { Button } from '@strapi/design-system/Button';
import { Tag } from '@strapi/design-system/Tag';
import { useCMEditViewDataManager, useFetchClient, useNotification } from '@strapi/helper-plugin';

type Dict = Record<string, any>;

const U = (s: unknown) => (s ?? '').toString().toUpperCase();
const digits = (s: unknown) => (s ?? '').toString().replace(/\D/g, '');

const maskProductCode = (v: string) =>
  U(v).replace(/[^A-Z0-9-]/g, '').replace(/-{2,}/g, '-');

const maskSku = (v: string) =>
  U(v).replace(/[^A-Z0-9-]/g, '').replace(/-{2,}/g, '-');

const isEan13 = (s: string) => /^\d{13}$/.test(String(s || ''));

function eanCheckDigit12to13(v12: string) {
  const arr = v12.split('').map((d) => +d);
  const sum = arr.reduce((a, d, i) => a + d * (i % 2 ? 3 : 1), 0);
  const check = (10 - (sum % 10)) % 10;
  return v12 + String(check);
}

// Small deterministic browser-safe hash → 6-char HEX (no Node 'crypto')
function toHex6(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  const hex = (hash >>> 0).toString(16).padStart(6, '0').slice(0, 6);
  return hex.toUpperCase();
}

const ONLY_UID = 'api::product.product';

export default function MaskedInputs(): JSX.Element | null {
  const { modifiedData, onChange, initialData, layout } = useCMEditViewDataManager() as Dict;
  const { get } = useFetchClient();
  const notify = useNotification();

  // Only render on Product
  if (layout?.uid !== ONLY_UID) return null;

  const [dup, setDup] = useState<{ product_code?: boolean; barcode?: boolean }>({});

  async function checkUnique(field: 'product_code' | 'barcode', value: string) {
    if (!value) return;
    const params = new URLSearchParams();
    params.set(`filters[${field}][$eq]`, value);
    params.set('fields[0]', 'id');
    params.set('pageSize', '1');
    const res = await get(`/content-manager/collection-types/${ONLY_UID}?${params.toString()}`);

    // CM returns { results: [...] } in the admin API
    const found = res?.data?.results?.[0]?.id;
    const currentId = modifiedData?.id || initialData?.id;
    setDup((prev) => ({ ...prev, [field]: !!found && String(found) !== String(currentId) }));
  }

  const set =
    (name: string) =>
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const raw = e.target.value || '';
      let value = raw;

      if (name === 'product_code') value = maskProductCode(raw);
      if (name === 'base_sku') value = maskSku(raw);
      if (name === 'barcode') {
        let v = digits(raw).slice(0, 13);
        if (v.length === 12) v = eanCheckDigit12to13(v);
        value = v;
      }

      onChange({ target: { name, value } });

      if (name === 'product_code' && value) checkUnique('product_code', value);
      if (name === 'barcode' && isEan13(value)) checkUnique('barcode', value);
    };

  useEffect(() => {
    if (dup.product_code) notify({ type: 'warning', message: 'Product Code already exists.' });
    if (dup.barcode) notify({ type: 'warning', message: 'Barcode already exists.' });
  }, [dup, notify]);

  // Suggestions:
  const hsSuggestion = useMemo(() => {
    const cat0 = Array.isArray(modifiedData?.categories) ? modifiedData.categories[0] : undefined;
    // Try direct hs_code on the category, otherwise parse any 4+ digit sequence from code/name
    const direct = (cat0?.hs_code ?? '').toString();
    if (direct) return direct;
    const candidate = (cat0 ? (cat0.code || cat0.name || '').toString() : '').match(/\d{4,}/)?.[0] || '';
    return candidate;
  }, [modifiedData?.categories]);

  const colorSuggestion = useMemo(() => {
    const v0 =
      Array.isArray(modifiedData?.product_variants) && modifiedData.product_variants.length
        ? modifiedData.product_variants[0]
        : null;
    const colorName = (v0?.color ?? '').toString().trim().toUpperCase();
    return colorName ? toHex6(colorName) : '';
  }, [modifiedData?.product_variants]);

  const apply = (name: string, value: string) => {
    if (!value) return;
    onChange({ target: { name, value } });
    notify({ type: 'success', message: `Applied ${name}` });
  };

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
        <Typography variant="delta">Code Inputs (masked & hinted)</Typography>
        <Typography variant="pi" textColor="neutral600">
          Formats are enforced while you type. EAN-13 check digit is added automatically when you enter 12 digits.
        </Typography>
        <Grid gap={4}>
          <GridItem col={4}>
            <TextInput
              label="Product Code (CAT-YY-####)"
              name="product_code"
              hint="Uppercase & hyphens; duplicate check runs live"
              value={modifiedData?.product_code || ''}
              onChange={set('product_code')}
            />
          </GridItem>
          <GridItem col={4}>
            <TextInput
              label="Base SKU (CAT-####)"
              name="base_sku"
              hint="Uppercase & hyphens"
              value={modifiedData?.base_sku || ''}
              onChange={set('base_sku')}
            />
          </GridItem>
          <GridItem col={4}>
            <TextInput
              label="Barcode (EAN-13)"
              name="barcode"
              hint="13 digits; last digit auto-calculated"
              value={modifiedData?.barcode || ''}
              onChange={set('barcode')}
            />
          </GridItem>

          <GridItem col={4}>
            <TextInput
              label="HS Code"
              name="hs_code"
              hint={hsSuggestion ? `Suggestion: ${hsSuggestion}` : 'If category has HS code, we suggest it'}
              value={modifiedData?.hs_code || ''}
              onChange={set('hs_code')}
            />
            {hsSuggestion && hsSuggestion !== (modifiedData?.hs_code || '') && (
              <Flex gap={2} paddingTop={2} alignItems="center">
                <Tag>Suggested: {hsSuggestion}</Tag>
                <Button size="S" variant="tertiary" onClick={() => apply('hs_code', hsSuggestion)}>
                  Apply
                </Button>
              </Flex>
            )}
          </GridItem>

          <GridItem col={4}>
            <TextInput
              label="Color HEX"
              name="color_code"
              hint={colorSuggestion ? `Suggestion: ${colorSuggestion}` : 'Derived from first variant color'}
              value={modifiedData?.color_code || ''}
              onChange={set('color_code')}
            />
            {colorSuggestion && colorSuggestion !== (modifiedData?.color_code || '') && (
              <Flex gap={2} paddingTop={2} alignItems="center">
                <Tag>Suggested: {colorSuggestion}</Tag>
                <Button size="S" variant="tertiary" onClick={() => apply('color_code', colorSuggestion)}>
                  Apply
                </Button>
              </Flex>
            )}
          </GridItem>
        </Grid>
      </Flex>
    </Box>
  );
}
