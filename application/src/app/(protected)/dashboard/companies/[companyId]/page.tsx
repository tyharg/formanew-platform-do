import CompanyDetailsPage from 'components/Companies/CompanyDetails/CompanyDetailsPage';

type PageProps = {
  params: Promise<{
    companyId: string;
  }>;
};

export default async function CompanyDetailsRoute({ params }: PageProps) {
  const { companyId } = await params;
  return <CompanyDetailsPage companyId={companyId} />;
}
