'use client';

import React from 'react';
import PageContainer from '@/components/Common/PageContainer/PageContainer';
import CompanyFinanceSettings from '@/components/AccountSettings/CompanyFinanceSettings/CompanyFinanceSettings';

const FinancesPage: React.FC = () => {
  return (
    <PageContainer title="Finances">
      <CompanyFinanceSettings />
    </PageContainer>
  );
};

export default FinancesPage;
