'use client';

import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Stack, Tab, Tabs } from '@mui/material';
import PageContainer from 'components/Common/PageContainer/PageContainer';
import { useCompanySelection } from '@/context/CompanySelectionContext';
import { CompaniesApiClient, Company } from '@/lib/api/companies';
import type { Incorporation } from 'types';
import IncorporationForm from './IncorporationForm';
import IncorporationDetailsPanel from './IncorporationDetailsPanel';

type TabValue = 'filing' | 'details';

const companiesClient = new CompaniesApiClient();

const IncorporationPage = () => {
  const { companies, selectedCompanyId, selectCompany, isLoading } = useCompanySelection();
  const [company, setCompany] = useState<Company | null>(null);
  const [incorporation, setIncorporation] = useState<Incorporation | null>(null);
  const [activeTab, setActiveTab] = useState<TabValue>('filing');
  const [isFetchingCompany, setIsFetchingCompany] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasCompanies = companies.length > 0;

  const activeCompanyId = useMemo(() => selectedCompanyId ?? companies[0]?.id ?? null, [selectedCompanyId, companies]);

  useEffect(() => {
    if (!activeCompanyId) {
      setCompany(null);
      return;
    }

    let isMounted = true;
    setIsFetchingCompany(true);
    setError(null);

    const loadCompany = async () => {
      try {
        const loaded = await companiesClient.getCompany(activeCompanyId);
        if (isMounted) {
          setCompany(loaded);
        }
      } catch (err) {
        console.error('Failed to load company for incorporation workspace', err);
        if (isMounted) {
          setError('Unable to load company details right now.');
          setCompany(null);
        }
      } finally {
        if (isMounted) {
          setIsFetchingCompany(false);
        }
      }
    };

    void loadCompany();

    return () => {
      isMounted = false;
    };
  }, [activeCompanyId]);

  useEffect(() => {
    if (activeCompanyId && !selectedCompanyId) {
      selectCompany(activeCompanyId);
    }
  }, [activeCompanyId, selectedCompanyId, selectCompany]);

  if (isLoading || isFetchingCompany) {
    return (
      <PageContainer title="Incorporation">
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (!hasCompanies) {
    return (
      <PageContainer title="Incorporation">
        <Stack spacing={2}>
          <Alert severity="info">
            Create a company to begin the guided filing experience. You can launch a company from the Companies section of your
            dashboard.
          </Alert>
          <Button variant="contained" href="/dashboard/companies">
            Go to Companies
          </Button>
        </Stack>
      </PageContainer>
    );
  }

  if (!company) {
    return (
      <PageContainer title="Incorporation">
        <Alert severity="error">{error ?? 'Select a company to manage incorporation.'}</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Incorporation" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {error ? <Alert severity="error">{error}</Alert> : null}
      <Tabs
        value={activeTab}
        onChange={(_, value: TabValue) => setActiveTab(value)}
        aria-label="Incorporation workspace tabs"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Filing" value="filing" />
        <Tab label="Details" value="details" />
      </Tabs>

      {activeTab === 'filing' ? (
        <IncorporationForm companyId={company.id} onDataLoaded={setIncorporation} />
      ) : (
        <IncorporationDetailsPanel incorporation={incorporation} />
      )}

      {activeTab === 'details' && !incorporation ? (
        <Alert severity="info">
          Submit your incorporation packet to populate a read-only summary of your filing details.
        </Alert>
      ) : null}
    </PageContainer>
  );
};

export default IncorporationPage;
