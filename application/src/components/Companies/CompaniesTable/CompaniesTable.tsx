'use client';

import React from 'react';
import {
  Box,
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
  Stack,
} from '@mui/material';
import { Business, Visibility, Edit, Delete } from '@mui/icons-material';
import { Company } from 'lib/api/companies';

interface CompaniesTableProps {
  companies: Company[];
  onView: (company: Company) => void;
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
}

const formatDate = (value: string | null | undefined) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
};

const CompaniesTable: React.FC<CompaniesTableProps> = ({ companies, onView, onEdit, onDelete }) => {
  if (companies.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          No companies yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Capture information about your entities to manage contracts, contacts, and growth metrics from one place.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Company</TableCell>
            <TableCell>Industry</TableCell>
            <TableCell>Formation</TableCell>
            <TableCell>Primary Contact</TableCell>
            <TableCell align="right">Contracts</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {companies.map((company) => {
            const primaryContact = company.contacts?.find((contact) => contact.isPrimary);
            const contractCount = company.contracts?.length ?? 0;

            return (
              <TableRow key={company.id} hover>
                <TableCell>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Business fontSize="small" color="primary" />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {company.displayName || company.legalName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {company.legalName}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>{company.industry || '—'}</TableCell>
                <TableCell>{formatDate(company.formationDate)}</TableCell>
                <TableCell>
                  {primaryContact ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2">{primaryContact.fullName}</Typography>
                      {primaryContact.email && (
                        <Chip size="small" label={primaryContact.email} variant="outlined" />
                      )}
                    </Box>
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell align="right">
                  <Chip
                    size="small"
                    label={`${contractCount} ${contractCount === 1 ? 'Contract' : 'Contracts'}`}
                    color={contractCount > 0 ? 'primary' : 'default'}
                    variant={contractCount > 0 ? 'filled' : 'outlined'}
                  />
                </TableCell>
                <TableCell align="right">
                  <Box display="flex" justifyContent="flex-end" gap={1}>
                    <Tooltip title="View company">
                      <IconButton size="small" onClick={() => onView(company)}>
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit company">
                      <IconButton size="small" onClick={() => onEdit(company)}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete company">
                      <IconButton size="small" color="error" onClick={() => onDelete(company)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CompaniesTable;
