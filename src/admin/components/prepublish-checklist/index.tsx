import * as React from 'react';
import { Box } from '@strapi/design-system/Box';
import { Flex } from '@strapi/design-system/Flex';
import { Typography } from '@strapi/design-system/Typography';
import { useCMEditViewDataManager } from '@strapi/helper-plugin';

const isEan13 = (s:string)=> /^\d{13}$/.test(String(s||''));

export default function PrePublishChecklist(){
  const { modifiedData } = useCMEditViewDataManager() as any;

  const checks = [
    ['Name', !!modifiedData?.name],
    ['Slug', !!modifiedData?.slug],
    ['At least one category', Array.isArray(modifiedData?.categories) && modifiedData.categories.length>0],
    ['Cover image', Array.isArray(modifiedData?.images) && modifiedData.images.length>0],
    ['Base price', !!modifiedData?.base_price],
    ['Currency', !!modifiedData?.currency],
    ['Product code', !!modifiedData?.product_code],
    ['Barcode (EAN-13)', isEan13(modifiedData?.barcode)],
  ];
  const errors = checks.filter(([,ok])=> !ok);

  return (
    <Box hasRadius background="neutral0" shadow="tableShadow" padding={4} marginBottom={4}
         style={{ border: '1px solid var(--ds-colors-neutral150)' }}>
      <Flex direction="column" gap={2}>
        <Typography variant="delta">Pre-publish Checklist</Typography>
        {errors.length===0
          ? <Typography textColor="success600">Looks good ✅ — ready to publish.</Typography>
          : <ul style={{margin:0, paddingLeft: '1.2rem'}}>
              {errors.map(([k],i)=>(<li key={i}><Typography textColor="danger600">{k} is required/invalid</Typography></li>))}
            </ul>}
      </Flex>
    </Box>
  );
}
