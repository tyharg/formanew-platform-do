'use client';

import React from 'react';
import { Stack } from '@mui/material';
import PageContainer from '@/components/Common/PageContainer/PageContainer';
import CompanyFinanceSettings from '@/components/AccountSettings/CompanyFinanceSettings/CompanyFinanceSettings';
import FreelancerFinanceDashboard from './FreelancerFinanceDashboard';

const FinancesPage: React.FC = () => {
  return (
    <PageContainer title="Finances">
      <Stack spacing={3}>
        <FreelancerFinanceDashboard />
        <CompanyFinanceSettings />
      </Stack>
    </PageContainer>
  );
};

export default FinancesPage;
