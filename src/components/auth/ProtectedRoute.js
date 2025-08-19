"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { CircularProgress, Box } from '@mui/material';
import { isAuthenticated } from '@/utils/auth';

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!isAuthenticated() && pathname !== '/login') {
      router.push('/login');
    } else {
      setVerified(true);
    }
  }, [router, pathname]);

  if (!verified) {
    return (
      <Box sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return children;
}