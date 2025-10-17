"use client";

import IncorporationTab from '@/components/Incorporation/IncorporationTab';
import { useUser } from '@/context/UserContext';
import PageContainer from '@/components/Common/PageContainer/PageContainer';

const IncorporationPage = () => {
  const { user, company } = useUser();

  if (!user || !company) {
    return null;
  }

  return (
    <PageContainer>
      <h1 className="text-2xl font-semibold mb-6">Incorporation</h1>
      <IncorporationTab company={company} />
    </PageContainer>
  );
};

export default IncorporationPage;