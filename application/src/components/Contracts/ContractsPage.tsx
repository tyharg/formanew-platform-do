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
  Grid,
  Typography,
  Button,
} from '@mui/material';
import PageContainer from 'components/Common/PageContainer/PageContainer';
import Toast from 'components/Common/Toast/Toast';
import PaginationControl from 'components/Common/Pagination/Pagination';
import ContractsHeader from './ContractsHeader/ContractsHeader';
import ContractsTable from './ContractsTable/ContractsTable';
import ContractForm from './ContractForm/ContractForm';
import {
  Contract,
  ContractStatus,
  ContractsApiClient,
  CreateContractPayload,
  UpdateContractPayload,
} from 'lib/api/contracts';
import { CompaniesApiClient, Company } from 'lib/api/companies';

const contractsClient = new ContractsApiClient();
const companiesClient = new CompaniesApiClient();

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

const formatStatus = (status: ContractStatus) => status.replace(/_/g, ' ');

const formatCurrencyValue = (
  value: number | null | undefined,
  currency: string | null | undefined,
) => {
  if (value === null || value === undefined) return '—';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency ?? 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency ?? 'USD'} ${value.toLocaleString()}`;
  }
};

const detailRow = (label: string, value: React.ReactNode) => (
  <Grid item xs={12} sm={6}>
    <Typography variant="subtitle2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body1" fontWeight={500}>
      {value ?? '—'}
    </Typography>
  </Grid>
);

const ContractsPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);

  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [isLoadingContracts, setIsLoadingContracts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [statusFilter, setStatusFilter] = useState<ContractStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [activeContract, setActiveContract] = useState<Contract | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [contractToView, setContractToView] = useState<Contract | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error' | 'info' | 'warning'>(
    'info',
  );

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

  const loadCompanies = useCallback(async () => {
    try {
      setIsLoadingCompanies(true);
      setError(null);
      const companyList = await companiesClient.getCompanies();
      setCompanies(companyList);

      if (companyList.length > 0) {
        setSelectedCompanyId((prev) => prev ?? companyList[0].id);
      } else {
        setSelectedCompanyId(null);
      }
    } catch (err) {
      console.error('Failed to load companies', err);
      setError('Unable to load companies. Please try again later.');
      setCompanies([]);
      setSelectedCompanyId(null);
    } finally {
      setIsLoadingCompanies(false);
    }
  }, []);

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
    loadCompanies();
  }, [loadCompanies]);

  useEffect(() => {
    if (!selectedCompanyId) {
      setContracts([]);
      return;
    }
    loadContracts(selectedCompanyId);
  }, [selectedCompanyId, loadContracts]);

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
    setFormMode('create');
    setActiveContract(null);
    setIsFormOpen(true);
  };

  const handleEdit = (contract: Contract) => {
    setFormMode('edit');
    setActiveContract(contract);
    setIsFormOpen(true);
  };

  const handleView = (contract: Contract) => {
    setContractToView(contract);
    setIsViewDialogOpen(true);
  };

  const handleDeletePrompt = (contract: Contract) => {
    setContractToDelete(contract);
    setDeleteDialogOpen(true);
  };

  const handleContractSubmit = async (
    payload: CreateContractPayload | UpdateContractPayload,
  ) => {
    if (!selectedCompanyId && formMode === 'create') {
      showToast('Select a company before creating a contract.', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      if (formMode === 'create') {
        const createPayload = payload as CreateContractPayload;
        if (!createPayload.companyId) {
          createPayload.companyId = selectedCompanyId as string;
        }
        await contractsClient.createContract(createPayload);
        showToast('Contract created successfully.', 'success');
      } else if (activeContract) {
        await contractsClient.updateContract(activeContract.id, payload as UpdateContractPayload);
        showToast('Contract updated successfully.', 'success');
      }

      setIsFormOpen(false);
      setActiveContract(null);
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

  const selectedCompanyOptions = companies.map((company) => ({
    id: company.id,
    name: company.displayName || company.legalName,
  }));

  const defaultCompanyId = selectedCompanyId ?? selectedCompanyOptions[0]?.id;

  const renderContent = () => {
    if (isLoadingCompanies) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={320}>
          <CircularProgress />
        </Box>
      );
    }

    if (!selectedCompanyId && companies.length === 0) {
      return (
        <Alert severity="info">
          Create a company record first to start adding contracts. Head to the Companies section of
          the platform to get started.
        </Alert>
      );
    }

    return (
      <>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <ContractsHeader
          companies={selectedCompanyOptions}
          selectedCompanyId={selectedCompanyId}
          onCompanyChange={(id) => setSelectedCompanyId(id)}
          onCreateContract={handleCreateClick}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

        {isLoadingContracts ? (
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
        )}
      </>
    );
  };

  return (
    <PageContainer>
      {renderContent()}

      <Dialog
        open={isFormOpen}
        onClose={() => (isSubmitting ? undefined : setIsFormOpen(false))}
        fullWidth
        maxWidth="md"
      >
        <DialogContent dividers sx={{ p: 3 }}>
          <ContractForm
            mode={formMode}
            companies={selectedCompanyOptions}
            initialValues={
              formMode === 'edit' && activeContract
                ? {
                    companyId: activeContract.companyId,
                    title: activeContract.title,
                    counterpartyName: activeContract.counterpartyName,
                    counterpartyEmail: activeContract.counterpartyEmail ?? '',
                    contractValue:
                      activeContract.contractValue !== null &&
                      activeContract.contractValue !== undefined
                        ? String(activeContract.contractValue)
                        : '',
                    currency: activeContract.currency ?? 'USD',
                    status: activeContract.status,
                    startDate: activeContract.startDate,
                    endDate: activeContract.endDate,
                    signedDate: activeContract.signedDate,
                    paymentTerms: activeContract.paymentTerms ?? '',
                    renewalTerms: activeContract.renewalTerms ?? '',
                    description: activeContract.description ?? '',
                  }
                : { companyId: defaultCompanyId ?? '' }
            }
            defaultCompanyId={defaultCompanyId ?? undefined}
            onSubmit={handleContractSubmit}
            onCancel={() => {
              if (!isSubmitting) {
                setIsFormOpen(false);
                setActiveContract(null);
              }
            }}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onClose={() => setIsViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{contractToView?.title ?? 'Contract details'}</DialogTitle>
        <DialogContent dividers>
          {contractToView ? (
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              {detailRow('Company', companies.find((c) => c.id === contractToView.companyId)?.displayName ?? companies.find((c) => c.id === contractToView.companyId)?.legalName ?? '—')}
              {detailRow('Counterparty', contractToView.counterpartyName)}
              {detailRow('Counterparty Email', contractToView.counterpartyEmail ?? '—')}
              {detailRow('Status', formatStatus(contractToView.status))}
              {detailRow(
                'Value',
                formatCurrencyValue(contractToView.contractValue, contractToView.currency),
              )}
              {detailRow('Signed Date', contractToView.signedDate ? new Date(contractToView.signedDate).toLocaleDateString() : '—')}
              {detailRow('Start Date', contractToView.startDate ? new Date(contractToView.startDate).toLocaleDateString() : '—')}
              {detailRow('End Date', contractToView.endDate ? new Date(contractToView.endDate).toLocaleDateString() : '—')}
              {detailRow('Payment Terms', contractToView.paymentTerms ?? '—')}
              {detailRow('Renewal Terms', contractToView.renewalTerms ?? '—')}
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Description / Notes
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {contractToView.description ?? '—'}
                </Typography>
              </Grid>
            </Grid>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Unable to display contract details.
            </Typography>
          )}
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
