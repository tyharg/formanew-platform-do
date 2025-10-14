import ContractDetailsPage from 'components/Contracts/ContractDetailsPage';

interface ContractRouteProps {
  params: {
    contractId: string;
  };
}

export default function ContractRoute({ params }: ContractRouteProps) {
  return <ContractDetailsPage contractId={params.contractId} />;
}
