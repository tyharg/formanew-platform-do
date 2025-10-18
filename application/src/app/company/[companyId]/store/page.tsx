import { notFound } from 'next/navigation';
import { createDatabaseService } from 'services/database/databaseFactory';
import StorefrontPageClient from './StorefrontPageClient';

type PageProps = {
  params: Promise<{ companyId: string }>;
};

export default async function CompanyStorefrontPage({ params }: PageProps) {
  const { companyId } = await params;
  const db = await createDatabaseService();
  const company = await db.company.findById(companyId);

  if (!company) {
    notFound();
  }

  const storefrontName = company.displayName || company.legalName || 'FormaNew Storefront';

  return <StorefrontPageClient companyId={companyId} initialStorefrontName={storefrontName} />;
}
