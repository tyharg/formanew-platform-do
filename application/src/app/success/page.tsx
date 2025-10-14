import { Suspense } from 'react';
import SuccessPageClient from './SuccessPageClient';
import { Box, CircularProgress } from '@mui/material';

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
