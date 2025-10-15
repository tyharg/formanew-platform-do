'use client';

import React from 'react';
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import { useCompanySelection } from '@/context/CompanySelectionContext';
import CompanyDetailsPage from '@/components/Companies/CompanyDetails/CompanyDetailsPage';

export default function DashboardPageClient() {
  const {
    companies,
    selectedCompanyId,
    isLoading,
    error,
    selectCompany,
    refreshCompanies,
  } = useCompanySelection();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Stack spacing={2} sx={{ maxWidth: 500, mx: 'auto', mt: 6 }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="contained" onClick={() => refreshCompanies()}>
          Retry
        </Button>
      </Stack>
    );
  }

  if (!companies.length) {
    return (
      <Stack spacing={2} sx={{ maxWidth: 480, mx: 'auto', mt: 6 }}>
        <Typography variant="h5" component="h1">
          Create your first company
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Launchpad guidance will appear here once you add a company. Start in the Companies section to set
          up your business profile.
        </Typography>
        <Button component={Link} href="/dashboard/companies" variant="contained" color="primary">
          Go to Companies
        </Button>
      </Stack>
    );
  }

  if (!selectedCompanyId) {
    const firstCompany = companies[0];
    return (
      <Stack spacing={2} sx={{ maxWidth: 480, mx: 'auto', mt: 6 }}>
        <Typography variant="h5" component="h1">
          Select a company to continue
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Pick a company from the sidebar selector to view its launchpad.
        </Typography>
        <Button variant="contained" color="primary" onClick={() => selectCompany(firstCompany.id)}>
          View {firstCompany.displayName || firstCompany.legalName}
        </Button>
      </Stack>
    );
  }

  return <CompanyDetailsPage key={selectedCompanyId} companyId={selectedCompanyId} />;
}
