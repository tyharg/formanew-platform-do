'use client';

import React from 'react';
import { Add, Search } from '@mui/icons-material';
import {
  Box,
  Button,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { CONTRACT_STATUS_OPTIONS, ContractStatus } from 'lib/api/contracts';

interface CompanyOption {
  id: string;
  name: string;
}

interface ContractsHeaderProps {
  companies: CompanyOption[];
  selectedCompanyId: string | null;
  onCompanyChange: (companyId: string) => void;
  onCreateContract: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortBy: 'recent' | 'oldest' | 'title' | 'valueHigh' | 'valueLow';
  onSortChange: (value: ContractsHeaderProps['sortBy']) => void;
  statusFilter: ContractStatus | 'ALL';
  onStatusFilterChange: (value: ContractStatus | 'ALL') => void;
}

const ContractsHeader: React.FC<ContractsHeaderProps> = ({
  companies,
  selectedCompanyId,
  onCompanyChange,
  onCreateContract,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  statusFilter,
  onStatusFilterChange,
}) => {
  const hasCompanies = companies.length > 0;

  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Contracts
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track agreement stages, signature dates, and counterparties for each company.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onCreateContract}
          disabled={!hasCompanies}
        >
          New Contract
        </Button>
      </Stack>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', md: 'center' }}
      >
        <TextField
          select
          label="Company"
          size="small"
          value={selectedCompanyId ?? ''}
          onChange={(event) => onCompanyChange(event.target.value)}
          sx={{ minWidth: { xs: '100%', md: 220 } }}
          disabled={!hasCompanies}
          helperText={!hasCompanies ? 'Create a company to start tracking contracts.' : undefined}
        >
          {companies.map((company) => (
            <MenuItem key={company.id} value={company.id}>
              {company.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          placeholder="Search contracts"
          size="small"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1 }}
        />

        <TextField
          select
          label="Status"
          size="small"
          value={statusFilter}
          onChange={(event) => onStatusFilterChange(event.target.value as ContractStatus | 'ALL')}
          sx={{ minWidth: { xs: '100%', md: 180 } }}
        >
          <MenuItem value="ALL">All Statuses</MenuItem>
          {CONTRACT_STATUS_OPTIONS.map((status) => (
            <MenuItem key={status} value={status}>
              {status.replace(/_/g, ' ')}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Sort"
          value={sortBy}
          size="small"
          onChange={(event) =>
            onSortChange(event.target.value as ContractsHeaderProps['sortBy'])
          }
          sx={{ minWidth: { xs: '100%', md: 180 } }}
        >
          <MenuItem value="recent">Newest</MenuItem>
          <MenuItem value="oldest">Oldest</MenuItem>
          <MenuItem value="title">Title (A-Z)</MenuItem>
          <MenuItem value="valueHigh">Value (High → Low)</MenuItem>
          <MenuItem value="valueLow">Value (Low → High)</MenuItem>
        </TextField>
      </Stack>
    </Box>
  );
};

export default ContractsHeader;
