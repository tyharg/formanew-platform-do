import React from 'react';
import ClientPortalMagicLinkRequestForm from 'components/Public/ClientPortal/ClientPortalMagicLinkRequestForm';

interface ClientPortalIndexPageProps {
  params: { companyId: string };
}

/**
 * Renders the magic link request form for accessing the client portal
 * associated with a specific company.
 */
const ClientPortalIndexPage = ({ params }: ClientPortalIndexPageProps) => {
  return <ClientPortalMagicLinkRequestForm companyId={params.companyId} />;
};

export default ClientPortalIndexPage;
