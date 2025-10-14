import CompanyDetailsPage from 'components/Companies/CompanyDetails/CompanyDetailsPage';

type PageProps = {
  params: {
    companyId: string;
  };
};

export default function CompanyDetailsRoute({ params }: PageProps) {
  return <CompanyDetailsPage companyId={params.companyId} />;
}
