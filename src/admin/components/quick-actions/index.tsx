// src/admin/components/quick-actions/index.tsx
import React from 'react';
import { Box, Flex, Button, Typography } from '@strapi/design-system';
import { useCMEditViewDataManager, request } from '@strapi/helper-plugin';

const QuickActions: React.FC = () => {
  const { initialData, layout } = useCMEditViewDataManager() as any;
  const id = initialData?.id;
  const uid = layout?.uid; // e.g. 'api::product.product'

  // Show only for Product edit view, otherwise hide silently
  if (uid !== 'api::product.product') return null;

  const duplicate = async () => {
    try {
      // shallow clone without ids/timestamps; adjust to your fields if needed
      const { id: _omit, createdAt, updatedAt, publishedAt, ...payload } = initialData || {};
      const created = await request(`/content-manager/collection-types/${uid}`, {
        method: 'POST',
        body: payload,
      });
      if (created?.id && typeof window !== 'undefined') {
        window.open(`/admin/content-manager/collectionType/${uid}/${created.id}`, '_blank');
      }
    } catch (e) {
      // optional: toast
      console.error('Duplicate failed:', e);
    }
  };

  const labels = () => {
    if (!id) return;
    if (typeof window !== 'undefined') {
      window.open(`/api/products/${id}/labels.pdf`, '_blank');
    }
  };

  const copyCodes = async () => {
    try {
      const codes = {
        product_code: initialData?.product_code ?? null,
        base_sku: initialData?.base_sku ?? null,
        // include anything else you actually store:
        // variant_skus: initialData?.variants?.map(v => v.sku) ?? [],
        // barcodes: initialData?.variants?.map(v => v.barcode) ?? [],
      };
      if (typeof navigator !== 'undefined') {
        await navigator.clipboard.writeText(JSON.stringify(codes, null, 2));
      }
    } catch (e) {
      console.error('Copy failed:', e);
    }
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
        <Typography variant="delta">Quick actions</Typography>
        <Flex gap={2} wrap="wrap">
          <Button onClick={duplicate} disabled={!id}>Duplicate</Button>
          <Button onClick={labels} disabled={!id} variant="secondary">Labels PDF</Button>
          <Button onClick={copyCodes} variant="tertiary">Copy codes</Button>
        </Flex>
      </Flex>
    </Box>
  );
};

export default QuickActions;
