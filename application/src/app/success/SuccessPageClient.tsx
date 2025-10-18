'use client';

import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useSearchParams } from 'next/navigation';

export default function SuccessPageClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const companyId = searchParams.get('companyId');

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        textAlign: 'center',
      }}
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 500 }}>
        <CheckCircleOutlineIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Payment Successful!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Thank you for your purchase. Your transaction has been completed successfully.
        </Typography>

        {sessionId && (
          <Typography variant="caption" display="block" sx={{ mb: 1 }}>
            Session ID: {sessionId}
          </Typography>
        )}
        {companyId ? (
          <Button
            variant="outlined"
            onClick={() => (window.location.href = `/company/${companyId}/store`)}
            sx={{ mt: 2 }}
          >
            Return to Store
          </Button>
        ) : (
          <Button
            variant="outlined"
            onClick={() => (window.location.href = `/`)}
            sx={{ mt: 2 }}
          >
            Return Home
          </Button>
        )}
      </Paper>
    </Box>
  );
}
