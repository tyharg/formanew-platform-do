'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Button,
} from '@mui/material';
import PageContainer from 'components/Common/PageContainer/PageContainer';
import Toast from 'components/Common/Toast/Toast';
import PaginationControl from 'components/Common/Pagination/Pagination';
import ContractsHeader from './ContractsHeader/ContractsHeader';
import ContractsTable from './ContractsTable/ContractsTable';
import ContractForm from './ContractForm/ContractForm';
import { useRouter } from 'next/navigation';
import {
  Contract,
  ContractStatus,
  ContractsApiClient,
  CreateContractPayload,
  UpdateContractPayload,
} from 'lib/api/contracts';
import { useCompanySelection } from 'context/CompanySelectionContext';

const contractsClient = new ContractsApiClient();

type SortOption = 'recent' | 'oldest' | 'title' | 'valueHigh' | 'valueLow';

const sortContracts = (contracts: Contract[], sortBy: SortOption): Contract[] => {
  const sorted = [...contracts];
  switch (sortBy) {
    case 'recent':
      return sorted.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
    case 'oldest':
      return sorted.sort(
        (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
      );
    case 'title':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case 'valueHigh':
      return sorted.sort(
        (a, b) => (b.contractValue ?? 0) - (a.contractValue ?? 0),
      );
    case 'valueLow':
      return sorted.sort(
        (a, b) => (a.contractValue ?? 0) - (b.contractValue ?? 0),
      );
    default:
      return sorted;
  }
};

const ContractsPage: React.FC = () => {
  const {
    companies,
    selectedCompanyId,
    selectedCompany,
    isLoading: isLoadingCompanies,
    error: companyError,
  } = useCompanySelection();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoadingContracts, setIsLoadingContracts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [statusFilter, setStatusFilter] = useState<ContractStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error' | 'info' | 'warning'>(
    'info',
  );

  const router = useRouter();

  const resetToast = () => {
    setToastOpen(false);
    setToastMessage('');
    setToastSeverity('info');
  };

  const showToast = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToastMessage(message);
    setToastSeverity(severity);
    setToastOpen(true);
  };

  const loadContracts = useCallback(
    async (companyId: string) => {
      try {
        setIsLoadingContracts(true);
        const companyContracts = await contractsClient.getContracts(companyId);
        setContracts(companyContracts);
      } catch (err) {
        console.error('Failed to load contracts', err);
        setContracts([]);
        showToast('Unable to load contracts for the selected company.', 'error');
      } finally {
        setIsLoadingContracts(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (isLoadingCompanies) {
      return;
    }

    if (!selectedCompanyId) {
      setContracts([]);
      return;
    }
    loadContracts(selectedCompanyId);
  }, [selectedCompanyId, loadContracts, isLoadingCompanies]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, sortBy, selectedCompanyId]);

  const filteredContracts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let list = [...contracts];

    if (statusFilter !== 'ALL') {
      list = list.filter((contract) => contract.status === statusFilter);
    }

    if (query.length > 0) {
      list = list.filter((contract) => {
        const haystack = [
          contract.title,
          contract.counterpartyName,
          contract.counterpartyEmail ?? '',
          contract.description ?? '',
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      });
    }

    return sortContracts(list, sortBy);
  }, [contracts, searchQuery, statusFilter, sortBy]);

  const totalItems = filteredContracts.length;
  const paginatedContracts = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredContracts.slice(startIndex, startIndex + pageSize);
  }, [filteredContracts, page, pageSize]);

  const handleCreateClick = () => {
    if (!selectedCompanyId) {
      showToast('Select a company from the sidebar before creating a contract.', 'info');
      return;
    }
    setIsFormOpen(true);
  };

  const handleEdit = (contract: Contract) => {
    router.push(`/dashboard/contracts/${contract.id}`);
  };

  const handleView = (contract: Contract) => {
    router.push(`/dashboard/contracts/${contract.id}`);
  };

  const handleDeletePrompt = (contract: Contract) => {
    setContractToDelete(contract);
    setDeleteDialogOpen(true);
  };

  const handleContractSubmit = async (payload: CreateContractPayload | UpdateContractPayload) => {
    if (!selectedCompanyId) {
      showToast('Select a company from the sidebar before creating a contract.', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      const createPayload = payload as CreateContractPayload;
      if (!createPayload.companyId) {
        createPayload.companyId = selectedCompanyId;
      }

      await contractsClient.createContract(createPayload);
      showToast('Contract created successfully.', 'success');

      setIsFormOpen(false);
      if (selectedCompanyId) {
        await loadContracts(selectedCompanyId);
      }
    } catch (err) {
      console.error('Failed to submit contract form', err);
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!contractToDelete) return;
    try {
      setIsDeleting(true);
      await contractsClient.deleteContract(contractToDelete.id);
      showToast('Contract deleted.', 'success');
      setDeleteDialogOpen(false);
      setContractToDelete(null);
      if (selectedCompanyId) {
        await loadContracts(selectedCompanyId);
      }
    } catch (err) {
      console.error('Failed to delete contract', err);
      showToast('Unable to delete contract. Please try again.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const renderContent = () => {
    if (isLoadingCompanies) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={320}>
          <CircularProgress />
        </Box>
      );
    }

    const hasCompanies = companies.length > 0;
    const hasSelectedCompany = Boolean(selectedCompanyId);
    const fallbackCompany = selectedCompanyId
      ? companies.find((company) => company.id === selectedCompanyId)
      : null;
    const selectedCompanyName =
      selectedCompany?.displayName ||
      selectedCompany?.legalName ||
      fallbackCompany?.displayName ||
      fallbackCompany?.legalName ||
      null;

    return (
      <>
        {companyError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {companyError}
          </Alert>
        )}
        {!companyError && !hasCompanies && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Add a company to start managing contracts.
          </Alert>
        )}
        <ContractsHeader
          selectedCompanyName={selectedCompanyName}
          canCreate={hasSelectedCompany}
          onCreateContract={handleCreateClick}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

        {hasSelectedCompany ? (
          isLoadingContracts ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <ContractsTable
                contracts={paginatedContracts}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDeletePrompt}
              />
              <PaginationControl
                totalItems={totalItems}
                pageSize={pageSize}
                setPageSize={setPageSize}
                page={page}
                setPage={setPage}
                sx={{ mt: 3 }}
              />
            </>
          )
        ) : null}
      </>
    );
  };

  return (
    <PageContainer>
      {renderContent()}

      <Dialog
        open={isFormOpen}
        onClose={() => (isSubmitting ? undefined : setIsFormOpen(false))}
      >
        <DialogContent dividers sx={{ p: 3 }}>
          <ContractForm
            mode="create"
            initialValues={{ companyId: selectedCompanyId ?? '' }}
            onSubmit={handleContractSubmit}
            onCancel={() => {
              if (!isSubmitting) {
                setIsFormOpen(false);
              }
            }}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => (isDeleting ? undefined : setDeleteDialogOpen(false))}>
        <DialogTitle>Delete contract</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2">
            Are you sure you want to delete{' '}
            <strong>{contractToDelete?.title ?? 'this contract'}</strong>? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Toast open={toastOpen} message={toastMessage} severity={toastSeverity} onClose={resetToast} />
    </PageContainer>
  );
};

export default ContractsPage;
