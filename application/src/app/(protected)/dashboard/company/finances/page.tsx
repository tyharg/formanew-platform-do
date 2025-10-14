import React from 'react';
import PageContainer from '@/components/Common/PageContainer/PageContainer';
import CompanyFinanceSettings from '@/components/AccountSettings/CompanyFinanceSettings/CompanyFinanceSettings';

/**
 * Dedicated page for managing Company Finance settings (Stripe Connect, etc.).
 * This page assumes the user is associated with a primary company, which is handled
 * by the CompanyFinanceSettings component using MOCK_COMPANY_ID for the demo.
 */
export default function CompanyFinancesPage() {
  return (
    <PageContainer title="Company Finances">
      <CompanyFinanceSettings />
    </PageContainer>
  );
}
