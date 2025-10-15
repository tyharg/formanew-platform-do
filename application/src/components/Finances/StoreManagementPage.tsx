import React from 'react';
import PageContainer from '@/components/Common/PageContainer/PageContainer';
import CompanyStoreManagement from './StoreManagement/CompanyStoreManagement';

export default function StoreManagementPage() {
  return (
    <PageContainer title="Store">
      <CompanyStoreManagement />
    </PageContainer>
  );
}
