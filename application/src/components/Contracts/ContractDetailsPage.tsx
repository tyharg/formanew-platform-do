'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from 'components/Common/PageContainer/PageContainer';
import Toast from 'components/Common/Toast/Toast';
import ConfirmationDialog from 'components/Notes/ConfirmationDialog/ConfirmationDialog';
import ContractForm from './ContractForm/ContractForm';
import {
  Contract,
  ContractsApiClient,
  UpdateContractPayload,
} from 'lib/api/contracts';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
  Tabs,
  Tab,
} from '@mui/material';
import { useCompanySelection } from 'context/CompanySelectionContext';
import ContractFilesTab from './ContractFiles/ContractFilesTab';
import ContractWorkItemsTab from './ContractWorkItems/ContractWorkItemsTab';
import ContractRelevantPartiesTab from './ContractRelevantParties/ContractRelevantPartiesTab';

const contractsClient = new ContractsApiClient();

interface ContractDetailsPageProps {
  contractId: string;
}

const ContractDetailsPage: React.FC<ContractDetailsPageProps> = ({ contractId }) => {
  const router = useRouter();
  const { selectCompany } = useCompanySelection();

  const [contract, setContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'workItems' | 'relevantParties' | 'files'>('details');

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');

  const showToast = (message: string, severity: typeof toastSeverity = 'success') => {
    setToastMessage(message);
    setToastSeverity(severity);
    setToastOpen(true);
  };

  const handleToastClose = () => setToastOpen(false);

  useEffect(() => {
    const loadContract = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const contractData = await contractsClient.getContract(contractId);
        setContract(contractData);
        selectCompany(contractData.companyId);
      } catch (err) {
        console.error('Failed to load contract details', err);
        setError('We could not load this contract. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadContract();
  }, [contractId, selectCompany]);

  const formInitialValues = useMemo(() => {
    if (!contract) {
      return undefined;
    }

    return {
      companyId: contract.companyId,
      title: contract.title,
      counterpartyName: contract.counterpartyName,
      counterpartyEmail: contract.counterpartyEmail ?? '',
      contractValue:
        contract.contractValue !== null && contract.contractValue !== undefined
          ? String(contract.contractValue)
          : '',
      currency: contract.currency ?? 'USD',
      status: contract.status,
      startDate: contract.startDate ?? '',
      endDate: contract.endDate ?? '',
      signedDate: contract.signedDate ?? '',
      paymentTerms: contract.paymentTerms ?? '',
      renewalTerms: contract.renewalTerms ?? '',
      description: contract.description ?? '',
    };
  }, [contract]);

  const handleUpdateContract = async (payload: UpdateContractPayload) => {
    try {
      setIsSaving(true);
      const updated = await contractsClient.updateContract(contractId, payload);
      setContract(updated);
      showToast('Contract updated.');
      setActiveTab('details');
    } catch (err) {
      console.error('Failed to update contract', err);
      showToast('Unable to save contract. Try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteContract = async () => {
    try {
      setIsDeleting(true);
      await contractsClient.deleteContract(contractId);
      showToast('Contract deleted.');
      router.push('/dashboard/contracts');
    } catch (err) {
      console.error('Failed to delete contract', err);
      showToast('Unable to delete contract. Try again.', 'error');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <PageContainer title="Contract details">
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => router.push('/dashboard/contracts')}>
          Back to Contracts
        </Button>
      </PageContainer>
    );
  }

  if (!contract) {
    return (
      <PageContainer title="Contract details">
        <Alert severity="warning" sx={{ mb: 3 }}>
          We couldn’t find that contract.
        </Alert>
        <Button variant="contained" onClick={() => router.push('/dashboard/contracts')}>
          Back to Contracts
        </Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={contract.title}>
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Last updated {new Date(contract.updatedAt).toLocaleString()}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => router.push('/dashboard/contracts')}>
              Back to Contracts
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={isDeleting}
            >
              Delete Contract
            </Button>
          </Stack>
        </Stack>

        <Tabs
          value={activeTab}
          onChange={(_event, value) => setActiveTab(value)}
          aria-label="Contract sections"
        >
          <Tab value="details" label="Details" />
          <Tab value="workItems" label="Work Items" />
          <Tab value="relevantParties" label="Relevant Parties" />
          <Tab value="files" label="Files" />
        </Tabs>

        {activeTab === 'details' ? (
          <ContractForm
            mode="edit"
            initialValues={formInitialValues}
            onSubmit={handleUpdateContract}
            onCancel={() => router.push('/dashboard/contracts')}
            isSubmitting={isSaving}
          />
        ) : activeTab === 'workItems' ? (
          <ContractWorkItemsTab contractId={contract.id} />
        ) : activeTab === 'relevantParties' ? (
          <ContractRelevantPartiesTab contractId={contract.id} />
        ) : (
          <ContractFilesTab contractId={contract.id} />
        )}
      </Stack>

      <ConfirmationDialog
        open={deleteDialogOpen}
        title="Delete contract?"
        message="This contract will be permanently removed. This action cannot be undone."
        confirmButtonText={isDeleting ? 'Deleting…' : 'Delete'}
        cancelButtonText="Cancel"
        confirmButtonColor="error"
        onConfirm={handleDeleteContract}
        onCancel={() => setDeleteDialogOpen(false)}
      />

      <Toast open={toastOpen} message={toastMessage} severity={toastSeverity} onClose={handleToastClose} />
    </PageContainer>
  );
};

export default ContractDetailsPage;
