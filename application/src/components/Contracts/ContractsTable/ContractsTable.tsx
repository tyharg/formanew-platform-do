'use client';

import React from 'react';
import {
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  Box,
  Stack,
} from '@mui/material';
import { Delete, Edit, Visibility } from '@mui/icons-material';
import { Contract, ContractStatus } from 'lib/api/contracts';

interface ContractsTableProps {
  contracts: Contract[];
  onView: (contract: Contract) => void;
  onEdit: (contract: Contract) => void;
  onDelete: (contract: Contract) => void;
}

const formatCurrency = (value: number | null | undefined, currency: string | null | undefined) => {
  if (value === null || value === undefined) return '—';
  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency ?? 'USD',
    maximumFractionDigits: 0,
  });
  try {
    return formatter.format(value);
  } catch {
    return `${value.toLocaleString()} ${currency ?? 'USD'}`;
  }
};

const formatDate = (value: string | null | undefined) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString();
};

const statusColor = (status: ContractStatus): 'default' | 'warning' | 'success' | 'error' | 'info' => {
  switch (status) {
    case 'COMPLETED':
      return 'success';
    case 'ACTIVE':
      return 'info';
    case 'PENDING_SIGNATURE':
      return 'warning';
    case 'TERMINATED':
      return 'error';
    default:
      return 'default';
  }
};

const ContractsTable: React.FC<ContractsTableProps> = ({ contracts, onView, onEdit, onDelete }) => {
  if (!contracts.length) {
    return (
      <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          No contracts to display
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create a contract to begin tracking counterparty details, value, and status.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Counterparty</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Value</TableCell>
            <TableCell>Start</TableCell>
            <TableCell>End</TableCell>
            <TableCell>Updated</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {contracts.map((contract) => (
            <TableRow key={contract.id} hover>
              <TableCell>
                <Stack spacing={0.5}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {contract.title}
                  </Typography>
                  {contract.description && (
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {contract.description}
                    </Typography>
                  )}
                </Stack>
              </TableCell>
              <TableCell>
                <Stack spacing={0.5}>
                  <Typography variant="body1">{contract.counterpartyName}</Typography>
                  {contract.counterpartyEmail && (
                    <Typography variant="body2" color="text.secondary">
                      {contract.counterpartyEmail}
                    </Typography>
                  )}
                </Stack>
              </TableCell>
              <TableCell>
                <Chip
                  label={contract.status.replace(/_/g, ' ')}
                  color={statusColor(contract.status)}
                  size="small"
                  sx={{ fontWeight: 600, textTransform: 'capitalize' }}
                />
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" fontWeight={600}>
                  {formatCurrency(contract.contractValue, contract.currency)}
                </Typography>
              </TableCell>
              <TableCell>{formatDate(contract.startDate)}</TableCell>
              <TableCell>{formatDate(contract.endDate)}</TableCell>
              <TableCell>{formatDate(contract.updatedAt)}</TableCell>
              <TableCell align="right">
                <Box display="flex" justifyContent="flex-end" gap={1}>
                  <Tooltip title="View">
                    <IconButton size="small" onClick={() => onView(contract)} aria-label="View">
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => onEdit(contract)} aria-label="Edit">
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={() => onDelete(contract)}
                      color="error"
                      aria-label="Delete"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ContractsTable;
