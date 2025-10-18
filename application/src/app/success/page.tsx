import { Suspense } from 'react';
import type { Metadata } from 'next';
import SuccessPageClient from './SuccessPageClient';
import { Box, CircularProgress } from '@mui/material';

export const metadata: Metadata = {
  title: 'Payment Success | FormaNew SaaS Starter Kit',
  description:
    'Confirmation page for successful FormaNew subscription upgrades with guidance on accessing your new DigitalOcean-powered workspace.',
};

function LoadingState() {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <CircularProgress />
    </Box>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <SuccessPageClient />
    </Suspense>
  );
}
