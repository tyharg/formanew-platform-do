import StorefrontPageClient from './StorefrontPageClient';

type PageProps = {
  params: Promise<{ companyId: string }>;
};

export default async function CompanyStorefrontPage({ params }: PageProps) {
  const { companyId } = await params;
  return <StorefrontPageClient companyId={companyId} />;
}
