'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Box, CircularProgress, Stack, Tab, Tabs } from '@mui/material';
import PageContainer from '@/components/Common/PageContainer/PageContainer';
import { useCompanySelection } from '@/context/CompanySelectionContext';
import { Incorporation, IncorporationStatus } from 'types';
import IncorporationForm from './IncorporationForm';
import IncorporationDetails from './IncorporationDetails';

const CompanyIncorporationPageClient: React.FC = () => {
  const { selectedCompanyId, selectedCompany, isLoading } = useCompanySelection();
  const [activeTab, setActiveTab] = useState<'filing' | 'details'>('filing');
  const [incorporation, setIncorporation] = useState<Incorporation | null>(null);
  const [isLoadingIncorporation, setIsLoadingIncorporation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadIncorporation = useCallback(async () => {
    if (!selectedCompanyId) {
      setIncorporation(null);
      return;
    }

    setIsLoadingIncorporation(true);
    setError(null);
    try {
      const response = await fetch(`/api/company/${selectedCompanyId}/incorporation`, { cache: 'no-store' });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Unable to load incorporation details.');
      }
      const data = await response.json();
      setIncorporation(data.incorporation ?? null);
    } catch (err) {
      console.error('Failed to load incorporation', err);
      setIncorporation(null);
      setError(err instanceof Error ? err.message : 'Unable to load incorporation record.');
    } finally {
      setIsLoadingIncorporation(false);
    }
  }, [selectedCompanyId]);

  useEffect(() => {
    setActiveTab('filing');
    if (selectedCompanyId) {
      void loadIncorporation();
    } else {
      setIncorporation(null);
    }
  }, [selectedCompanyId, loadIncorporation]);

  const handleIncorporationChange = (next: Incorporation) => {
    setIncorporation(next);
  };

  useEffect(() => {
    if (incorporation?.status === IncorporationStatus.SUBMITTED) {
      setActiveTab('details');
    }
  }, [incorporation?.status]);

  const company = selectedCompany ?? null;

  return (
    <PageContainer title="Incorporation" maxWidth={1100}>
      <Stack spacing={3}>
        {error && <Alert severity="error">{error}</Alert>}

        {isLoading && !company ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : !company ? (
          <Alert severity="info">Select or create a company to manage incorporation filings.</Alert>
        ) : (
          <Stack spacing={3}>
            <Box>
              <Tabs
                value={activeTab}
                onChange={(_, value: 'filing' | 'details') => setActiveTab(value)}
                aria-label="Incorporation tabs"
              >
                <Tab label="Filing" value="filing" />
                <Tab label="Details" value="details" />
              </Tabs>
            </Box>

            {activeTab === 'filing' ? (
              <IncorporationForm
                company={company}
                incorporation={incorporation}
                onIncorporationChange={handleIncorporationChange}
                onRefresh={loadIncorporation}
                isLoading={isLoadingIncorporation}
              />
            ) : (
              <IncorporationDetails
                company={company}
                incorporation={incorporation}
                isLoading={isLoadingIncorporation}
              />
            )}
          </Stack>
        )}
      </Stack>
    </PageContainer>
  );
};

export default CompanyIncorporationPageClient;
