import React from 'react';
import ClientPortalContractDetails from 'components/Public/ClientPortal/ClientPortalContractDetails';

interface ClientPortalContractPageProps {
  params: { contractId: string };
  searchParams: Record<string, string | string[] | undefined>;
}

const ClientPortalContractPage = ({ params, searchParams }: ClientPortalContractPageProps) => {
  const tokenParam = searchParams?.token;
  const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam || '';

  return <ClientPortalContractDetails contractId={params.contractId} token={token} />;
};

export default ClientPortalContractPage;
