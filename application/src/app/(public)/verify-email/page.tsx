'use client';

import React, { Suspense, useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Link as MuiLink,
} from '@mui/material';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

/**
 * Email verification page.
 * Handles verifying a user's email address using a token from the query string.
 * Shows loading, success, and error states with appropriate messages.
 * On success, allows the user to proceed to login.
 */
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div />}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setError('Missing verification token.');
      return;
    }
    fetch(`/api/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Verification failed.');
        }
        setStatus('success');
      })
      .catch((e) => {
        setStatus('error');
        setError(e.message || 'Verification failed.');
      });
  }, [searchParams]);

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="80vh"
      sx={{
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 480,
          width: '100%',
        }}
      >
        <CardContent>
          <Typography variant="h4" fontWeight={700} mb={2} align="center">
            Email Verification
          </Typography>
          {status === 'verifying' && (
            <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
              <CircularProgress />
              <Typography variant="body1">Verifying your email...</Typography>
            </Box>
          )}

          {status === 'success' && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Your email has been verified! You can now{' '}
              <MuiLink
                component={Link}
                href="/login"
                variant="body2"
                color="primary"
                sx={{ fontWeight: 600 }}
                prefetch={true}
              >
                log in
              </MuiLink>
              .
            </Alert>
          )}
          {status === 'error' && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error || 'Verification failed.'}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
