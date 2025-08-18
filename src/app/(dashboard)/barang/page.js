'use client';

import { Box, Stack } from '@mui/material';
import dynamic from 'next/dynamic';

// Dynamically import the content component with SSR disabled
const BarangContent = dynamic(() => import('@/components/barang/BarangContent'), {
  ssr: false
});

export default function BarangPage() {
  return (
    <Box 
      sx={{ 
        p: { xs: 2, sm: 2.5, md: 3 },
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        ml: { xs: 1, sm: 2 },
        borderRadius: { xs: '16px', sm: '24px' }
      }}
    >
      <BarangContent />
    </Box>
  );
}