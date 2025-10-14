'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import PageContainer from 'components/Common/PageContainer/PageContainer';
import { useCompanySelection } from 'context/CompanySelectionContext';
import { CompanyFinanceApiClient, type CompanyFinance } from 'lib/api/companyFinance';

const formatDateTime = (value: string | null): string => {
  if (!value) {
    return '—';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '—';
  }

  return parsed.toLocaleString();
};

const FinancesPage: React.FC = () => {
  const {
    selectedCompanyId,
    selectedCompany,
    isLoading: isLoadingCompanies,
    error: companyError,
    refreshCompanies,
  } = useCompanySelection();

  const financeClient = useMemo(() => new CompanyFinanceApiClient(), []);
  const [finance, setFinance] = useState<CompanyFinance | null>(null);
  const [isLoadingFinance, setIsLoadingFinance] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFinance = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      if (!selectedCompanyId) {
        setFinance(null);
        return;
      }

      if (mode === 'initial') {
        setIsLoadingFinance(true);
      } else {
        setIsRefreshing(true);
      }

      setError(null);
      try {
        const record = await financeClient.getFinance(selectedCompanyId);
        setFinance(record);
      } catch (err) {
        console.error('Failed to load company finance', err);
        setFinance(null);
        setError('Unable to load Stripe status for this company.');
      } finally {
        if (mode === 'initial') {
          setIsLoadingFinance(false);
        } else {
          setIsRefreshing(false);
        }
      }
    },
    [financeClient, selectedCompanyId]
  );

  useEffect(() => {
    loadFinance('initial');
  }, [loadFinance]);

  const handleInitialize = useCallback(async () => {
    if (!selectedCompanyId) {
      return;
    }

    setIsInitializing(true);
    setError(null);
    try {
      const record = await financeClient.createFinance(selectedCompanyId, {});
      setFinance(record);
      await refreshCompanies();
    } catch (err) {
      console.error('Failed to initialize Stripe finance record', err);
      setError('Unable to initialize Stripe Connect for this company.');
    } finally {
      setIsInitializing(false);
    }
  }, [financeClient, refreshCompanies, selectedCompanyId]);

  const handleRefresh = useCallback(async () => {
    await loadFinance('refresh');
  }, [loadFinance]);

  const renderStatusChips = () => {
    if (!finance) {
      return null;
    }

    return (
      <Stack direction="row" spacing={1} flexWrap="wrap">
        <Chip
          label={finance.detailsSubmitted ? 'Details submitted' : 'Details pending'}
          color={finance.detailsSubmitted ? 'success' : 'warning'}
          size="small"
        />
        <Chip
          label={finance.chargesEnabled ? 'Charges enabled' : 'Charges disabled'}
          color={finance.chargesEnabled ? 'success' : 'default'}
          size="small"
        />
        <Chip
          label={finance.payoutsEnabled ? 'Payouts enabled' : 'Payouts disabled'}
          color={finance.payoutsEnabled ? 'success' : 'default'}
          size="small"
        />
      </Stack>
    );
  };

  const renderRequirements = (items?: string[]) => {
    if (!items || items.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary">
          No outstanding requirements.
        </Typography>
      );
    }

    return (
      <Stack component="ul" sx={{ pl: 2, m: 0 }} spacing={0.5}>
        {items.map((requirement) => (
          <Typography component="li" key={requirement} variant="body2">
            {requirement}
          </Typography>
        ))}
      </Stack>
    );
  };

  const renderContent = () => {
    if (isLoadingCompanies || isLoadingFinance) {
      return (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress size={32} />
        </Box>
      );
    }

    if (!selectedCompanyId) {
      return (
        <Alert severity="info">Select or create a company to manage Stripe Connect.</Alert>
      );
    }

    if (!finance) {
      return (
        <Stack spacing={2}>
          <Typography>
            Stripe Connect is not configured for this company yet. Start the onboarding process to
            connect a Stripe account.
          </Typography>
          <Button
            variant="contained"
            onClick={handleInitialize}
            disabled={isInitializing}
          >
            {isInitializing ? 'Initializing…' : 'Initialize Stripe Connect'}
          </Button>
        </Stack>
      );
    }

    return (
      <Stack spacing={3}>
        {renderStatusChips()}

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Stripe account ID
              </Typography>
              <Typography variant="body1">
                {finance.stripeAccountId ?? 'Pending assignment'}
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Onboarding link expires
              </Typography>
              <Typography variant="body1">{formatDateTime(finance.accountOnboardingExpiresAt)}</Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Onboarding link
              </Typography>
              {finance.accountOnboardingUrl ? (
                <Button
                  component="a"
                  href={finance.accountOnboardingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Resume onboarding
                </Button>
              ) : (
                <Typography variant="body1">Not generated yet</Typography>
              )}
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Stripe dashboard login link
              </Typography>
              {finance.accountLoginLinkUrl ? (
                <Button
                  component="a"
                  href={finance.accountLoginLinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                >
                  Open dashboard
                </Button>
              ) : (
                <Typography variant="body1">Not generated yet</Typography>
              )}
            </Stack>
          </Grid>
        </Grid>

        <Divider />

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <Typography variant="subtitle2">Requirements due</Typography>
              {renderRequirements(finance.requirementsDue)}
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <Typography variant="subtitle2">Requirements due soon</Typography>
              {renderRequirements(finance.requirementsDueSoon)}
            </Stack>
          </Grid>
        </Grid>

        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Button variant="contained" onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? 'Refreshing…' : 'Refresh status'}
          </Button>
        </Stack>
      </Stack>
    );
  };

  return (
    <PageContainer
      title="Finances"
      sx={{
        '& .MuiCard-root': {
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Stack spacing={3}>
        <Typography>
          Manage Stripe Connect settings for{' '}
          {selectedCompany?.displayName || selectedCompany?.legalName || 'your company'}.
        </Typography>

        {companyError && <Alert severity="error">{companyError}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}

        {renderContent()}
      </Stack>
    </PageContainer>
  );
};

export default FinancesPage;
