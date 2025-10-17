'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Box, CircularProgress, Paper, Tabs, Tab, Typography } from '@mui/material';
import FinanceLineItemsTab from './FinanceLineItemsTab';
import { CompanyFinance } from '@/types';
import { useCompanySelection } from '@/context/CompanySelectionContext';

type TabValue = 'transactions';

interface FinanceResponse {
  finance: CompanyFinance | null;
}

const fetchJson = async <T,>(input: RequestInfo | URL, init?: RequestInit): Promise<T> => {
  const response = await fetch(input, init);
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message = typeof payload.error === 'string' ? payload.error : response.statusText;
    throw new Error(message);
  }
  return (await response.json()) as T;
};

export default function CompanyFinanceSettings() {
  const { selectedCompanyId, isLoading: companiesLoading } = useCompanySelection();
  const [finance, setFinance] = useState<CompanyFinance | null>(null);
  const [tab, setTab] = useState<TabValue>('transactions');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLiveAccountStatus = useCallback(async (companyId: string, stripeAccountId: string) => {
    const status = await fetchJson<Partial<CompanyFinance>>(
      `/api/company/${companyId}/finance/stripe/status?accountId=${stripeAccountId}`,
      { cache: 'no-store' }
    );
    setFinance((previous) => (previous ? { ...previous, ...status } : (status as CompanyFinance)));
  }, []);

  const fetchCompanyFinance = useCallback(async () => {
    if (!selectedCompanyId) {
      setFinance(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = await fetchJson<FinanceResponse>(`/api/companies/${selectedCompanyId}/finance`, {
        cache: 'no-store',
      });

      const currentFinance = payload.finance ?? null;
      setFinance(currentFinance);

      if (currentFinance?.stripeAccountId) {
        await fetchLiveAccountStatus(selectedCompanyId, currentFinance.stripeAccountId);
      }
    } catch (err) {
      console.error('Failed to load company finance details', err);
      setError(err instanceof Error ? err.message : 'Unable to load Stripe Connect status.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCompanyId, fetchLiveAccountStatus]);

  useEffect(() => {
    if (!companiesLoading) {
      fetchCompanyFinance();
    }
  }, [companiesLoading, fetchCompanyFinance]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: TabValue) => {
    setTab(newValue);
  };

  const renderTransactionsTab = () => {
    if (!selectedCompanyId) {
      return <Alert severity="info">Select a company to view cash movements.</Alert>;
    }

    return (
      <FinanceLineItemsTab
        companyId={selectedCompanyId}
        currencyHint={finance?.stripeAccountId ? 'usd' : null}
      />
    );
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 200,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Company Finances
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage Stripe Connect and keep track of money flowing in and out of your business.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab value="transactions" label="Transactions" />
      </Tabs>

      {renderTransactionsTab()}
    </Paper>
  );
}
