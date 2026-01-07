import * as React from 'react';
import { Box } from '@strapi/design-system/Box';
import { Flex } from '@strapi/design-system/Flex';
import { Typography } from '@strapi/design-system/Typography';
import { Button } from '@strapi/design-system/Button';
import { useCMEditViewDataManager, useNotification } from '@strapi/helper-plugin';

export default function UrlPreview() {
  const { modifiedData } = useCMEditViewDataManager() as any;
  const notify = useNotification();
  const slug = (modifiedData?.slug || '').toString();

  // No placeholder domain. We show the relative storefront path only.
  const path = slug ? `/product/${slug}` : '';

  const copy = async () => {
    if (!path) return;
    await navigator.clipboard.writeText(path);
    notify({ type: 'success', message: 'Path copied to clipboard.' });
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
        <Typography variant="delta">URL Preview</Typography>
        {path ? (
          <Flex gap={2} alignItems="center">
            <Typography>{path}</Typography>
            <Button size="S" variant="tertiary" onClick={copy}>
              Copy
            </Button>
          </Flex>
        ) : (
          <Typography textColor="neutral600">Set a slug to preview the storefront path.</Typography>
        )}
      </Flex>
    </Box>
  );
}
