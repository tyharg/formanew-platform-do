import ContractDetailsPage from 'components/Contracts/ContractDetailsPage';

interface ContractRouteProps {
  params: Promise<{
    contractId: string;
  }>;
}

export default async function ContractRoute({ params }: ContractRouteProps) {
  const { contractId } = await params;
  return <ContractDetailsPage contractId={contractId} />;
}
