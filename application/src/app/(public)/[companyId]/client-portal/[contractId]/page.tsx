'use client';

import React from 'react';
import ClientPortalContractDetails from 'components/Public/ClientPortal/ClientPortalContractDetails';
import { useParams, useSearchParams } from 'next/navigation';

const ClientPortalContractPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();

  const contractId = Array.isArray(params.contractId) ? params.contractId[0] : params.contractId ?? '';
  const companyId = Array.isArray(params.companyId) ? params.companyId[0] : params.companyId ?? '';
  const token = searchParams.get('token') ?? '';

  return <ClientPortalContractDetails contractId={contractId} token={token} companyId={companyId} />;
};

export default ClientPortalContractPage;
