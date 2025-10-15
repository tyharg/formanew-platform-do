import React, { useState } from 'react';
import { Box, Button, Typography, Alert, CircularProgress, Stack } from '@mui/material';
import { CompanyFinance } from '@/types'; // Assuming types are imported via '@/types'

interface StripeConnectSetupProps {
  finance: CompanyFinance | null;
  companyId: string;
  onRefresh: () => void;
}

/**
 * Component to manage the Stripe Connect onboarding process.
 */
export default function StripeConnectSetup({ finance, companyId, onRefresh }: StripeConnectSetupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const safeRequirementsDue = finance?.requirementsDue ?? [];
  const safeRequirementsDueSoon = finance?.requirementsDueSoon ?? [];

  const handleConnectClick = async () => {
    setIsLoading(true);
    setError(null);
    setInfoMessage(null);
    setInfoMessage(null);
    try {
      // 1. Call API to create/retrieve Stripe Account Link
      // This API call handles both initial onboarding and generating update links for pending requirements.
      const response = await fetch(`/api/company/${companyId}/finance/stripe/onboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to initiate Stripe Connect onboarding.');
      }

      const { url } = await response.json();

      // 2. Redirect user to Stripe onboarding URL
      window.location.href = url;
      onRefresh();

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setIsLoading(false);
    }
  };

  const handleLoginClick = async () => {
    setIsLoading(true);
    setError(null);
    setInfoMessage(null);
    setInfoMessage(null);
    try {
      // Call API to create Stripe Login Link
      const response = await fetch(`/api/company/${companyId}/finance/stripe/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Failed to create Stripe login link.');
      }

      if (payload.message) {
        setInfoMessage(payload.message);
      }

      if (payload.url) {
        window.location.href = payload.url;
      }
      onRefresh();

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setIsLoading(false);
    }
  };

  if (!finance || !finance.stripeAccountId) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Stripe Connect Setup
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Connect your business to Stripe to enable payments and payouts.
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {infoMessage && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {infoMessage}
          </Alert>
        )}
        <Button
          variant="contained"
          color="primary"
          onClick={handleConnectClick}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isLoading ? 'Redirecting...' : 'Connect with Stripe'}
        </Button>
      </Box>
    );
  }

  // If Stripe Account exists
  const isReadyForPayouts = Boolean(finance?.payoutsEnabled && finance?.chargesEnabled);
  const hasRequirementsDue = safeRequirementsDue.length > 0;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Stripe Account Status
      </Typography>
      {infoMessage && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {infoMessage}
        </Alert>
      )}
      <Stack spacing={1} sx={{ mb: 2 }}>
        <Alert severity={isReadyForPayouts ? 'success' : hasRequirementsDue ? 'warning' : 'info'}>
          {isReadyForPayouts
            ? 'Stripe account is fully set up and ready for payments and payouts.'
            : hasRequirementsDue
            ? `Action required: ${safeRequirementsDue.length} pending requirement(s) need attention.`
            : 'Stripe account connected. Details submission pending.'}
        </Alert>

        {safeRequirementsDue.length > 0 && (
          <Alert severity="warning">
            <Typography variant="body2">
              Pending requirements: {safeRequirementsDue.join(', ')}
            </Typography>
          </Alert>
        )}
        {safeRequirementsDueSoon.length > 0 && (
          <Alert severity="info">
            <Typography variant="body2">
              Upcoming requirements: {safeRequirementsDueSoon.join(', ')}
            </Typography>
          </Alert>
        )}
      </Stack>

      <Stack direction="row" spacing={2}>
        <Button
          variant="outlined"
          onClick={handleLoginClick}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          Manage Stripe Account
        </Button>
        {hasRequirementsDue && (
          <Button
            variant="contained"
            color="warning"
            onClick={handleConnectClick}
            disabled={isLoading}
          >
            Complete Setup
          </Button>
        )}
      </Stack>
    </Box>
  );
}
