'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PageContainer from 'components/Common/PageContainer/PageContainer';
import Toast from 'components/Common/Toast/Toast';
import CompaniesTable from './CompaniesTable/CompaniesTable';
import CompanyForm from './CompanyForm/CompanyForm';
import PaginationControl from 'components/Common/Pagination/Pagination';
import { useRouter } from 'next/navigation';
import {
  CompaniesApiClient,
  Company,
  CreateCompanyPayload,
  UpdateCompanyPayload,
} from 'lib/api/companies';

type SortOption = 'recent' | 'alpha' | 'contracts';

const companiesClient = new CompaniesApiClient();

const sortCompanies = (companies: Company[], sortBy: SortOption): Company[] => {
  const list = [...companies];
  switch (sortBy) {
    case 'recent':
      return list.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
    case 'contracts':
      return list.sort(
        (a, b) => (b.contracts?.length ?? 0) - (a.contracts?.length ?? 0),
      );
    case 'alpha':
    default:
      return list.sort((a, b) =>
        (a.displayName || a.legalName).localeCompare(b.displayName || b.legalName),
      );
  }
};

const CompaniesPage: React.FC = () => {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isCreateEditOpen, setIsCreateEditOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [companyPendingDelete, setCompanyPendingDelete] = useState<Company | null>(null);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error' | 'info' | 'warning'>(
    'success',
  );

  const showToast = (message: string, severity: typeof toastSeverity = 'success') => {
    setToastMessage(message);
    setToastSeverity(severity);
    setToastOpen(true);
  };

  const resetToast = () => {
    setToastOpen(false);
    setToastMessage('');
  };

  const loadCompanies = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await companiesClient.getCompanies();
      setCompanies(response);
    } catch (err) {
      console.error('Failed to load companies', err);
      setError('Unable to load companies right now. Please try again later.');
      setCompanies([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, industryFilter, sortBy]);

  const filteredCompanies = useMemo(() => {
    let list = [...companies];
    if (industryFilter !== 'ALL') {
      list = list.filter(
        (company) => (company.industry ?? '').toLowerCase() === industryFilter.toLowerCase(),
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((company) => {
        const haystack = [
          company.legalName,
          company.displayName ?? '',
          company.industry ?? '',
          company.email ?? '',
          company.phone ?? '',
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      });
    }
    return sortCompanies(list, sortBy);
  }, [companies, industryFilter, searchQuery, sortBy]);

  const paginatedCompanies = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredCompanies.slice(start, start + pageSize);
  }, [filteredCompanies, page, pageSize]);

  const industries = useMemo(() => {
    const set = new Set<string>();
    companies.forEach((company) => {
      if (company.industry) {
        set.add(company.industry);
      }
    });
    return Array.from(set).sort();
  }, [companies]);

  const handleCreateCompany = () => {
    setFormMode('create');
    setSelectedCompany(null);
    setIsCreateEditOpen(true);
  };

  const handleEditCompany = (company: Company) => {
    setFormMode('edit');
    setSelectedCompany(company);
    setIsCreateEditOpen(true);
  };

  const handleCompanySubmit = async (payload: CreateCompanyPayload | UpdateCompanyPayload) => {
    try {
      setIsSubmitting(true);
      if (formMode === 'create') {
        await companiesClient.createCompany(payload);
        showToast('Company created successfully.');
      } else if (selectedCompany) {
        await companiesClient.updateCompany(selectedCompany.id, payload);
        showToast('Company updated successfully.');
      }
      setIsCreateEditOpen(false);
      setSelectedCompany(null);
      await loadCompanies();
    } catch (err) {
      console.error('Failed to save company', err);
      showToast('Unable to save company. Try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCompany = async () => {
    if (!companyPendingDelete) return;
    try {
      setIsDeleting(true);
      await companiesClient.deleteCompany(companyPendingDelete.id);
      showToast('Company deleted.');
      setCompanyPendingDelete(null);
      await loadCompanies();
    } catch (err) {
      console.error('Failed to delete company', err);
      showToast('Unable to delete company. Try again.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewCompany = (company: Company) => {
    router.push(`/dashboard/companies/${company.id}`);
  };

  const renderTableSection = () => {
    if (isLoading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={240}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      );
    }

    return (
      <>
        <CompaniesTable
          companies={paginatedCompanies}
          onView={handleViewCompany}
          onEdit={(company) => handleEditCompany(company)}
          onDelete={(company) => setCompanyPendingDelete(company)}
        />
        <PaginationControl
          totalItems={filteredCompanies.length}
          pageSize={pageSize}
          setPageSize={setPageSize}
          page={page}
          setPage={setPage}
          sx={{ mt: 3 }}
        />
      </>
    );
  };

  return (
    <PageContainer title="Companies">
      <Stack spacing={3}>
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2} alignItems={{ xs: 'stretch', md: 'center' }}>
          <Button variant="contained" onClick={handleCreateCompany}>
            Add Company
          </Button>
          <TextField
            placeholder="Search companies"
            size="small"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            sx={{ flexGrow: 1 }}
          />
          <TextField
            select
            size="small"
            label="Industry"
            value={industryFilter}
            onChange={(event) => setIndustryFilter(event.target.value)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="ALL">All industries</MenuItem>
            {industries.map((industry) => (
              <MenuItem key={industry} value={industry}>
                {industry}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Sort by"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortOption)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="recent">Recently updated</MenuItem>
            <MenuItem value="alpha">Name (A-Z)</MenuItem>
            <MenuItem value="contracts">Contracts</MenuItem>
          </TextField>
        </Box>

        {renderTableSection()}
      </Stack>

      <Dialog
        open={isCreateEditOpen}
        onClose={() => (isSubmitting ? undefined : setIsCreateEditOpen(false))}
        fullWidth
        maxWidth="md"
      >
        <DialogContent dividers sx={{ p: 3 }}>
          <CompanyForm
            mode={formMode}
            initialValues={
              formMode === 'edit' && selectedCompany
                ? {
                    legalName: selectedCompany.legalName,
                    displayName: selectedCompany.displayName ?? '',
                    industry: selectedCompany.industry ?? '',
                    ein: selectedCompany.ein ?? '',
                    formationDate: selectedCompany.formationDate ?? '',
                    website: selectedCompany.website ?? '',
                    phone: selectedCompany.phone ?? '',
                    email: selectedCompany.email ?? '',
                    addressLine1: selectedCompany.addressLine1 ?? '',
                    addressLine2: selectedCompany.addressLine2 ?? '',
                    city: selectedCompany.city ?? '',
                    state: selectedCompany.state ?? '',
                    postalCode: selectedCompany.postalCode ?? '',
                    country: selectedCompany.country ?? '',
                    description: selectedCompany.description ?? '',
                  }
                : undefined
            }
            onSubmit={handleCompanySubmit}
            onCancel={() => {
              if (!isSubmitting) {
                setIsCreateEditOpen(false);
                setSelectedCompany(null);
              }
            }}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(companyPendingDelete)}
        onClose={() => (isDeleting ? undefined : setCompanyPendingDelete(null))}
      >
        <DialogTitle>Delete company</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2">
            Are you sure you want to remove{' '}
            <strong>{companyPendingDelete?.displayName || companyPendingDelete?.legalName}</strong>?
            This will also remove linked contacts and notes.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompanyPendingDelete(null)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button onClick={handleDeleteCompany} color="error" variant="contained" disabled={isDeleting}>
            {isDeleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Toast open={toastOpen} message={toastMessage} severity={toastSeverity} onClose={resetToast} />
    </PageContainer>
  );
};

export default CompaniesPage;
