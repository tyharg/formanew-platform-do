'use client';

import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

interface AdminCompanyRow {
  id: string;
  name: string;
  legalName: string;
  createdAt: string;
  ownerName: string;
  ownerEmail: string;
  stripeAccountId: string | null;
  chargesEnabled: boolean;
  contractCount: number;
  state: string | null;
}

const AdminCompaniesTable: React.FC = () => {
  const [companies, setCompanies] = useState<AdminCompanyRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCompanies = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/admin/companies', { cache: 'no-store' });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Unable to load companies.');
        }
        setCompanies(data.companies ?? []);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Unable to load companies.');
        setCompanies([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCompanies();
  }, []);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Paper>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Company</TableCell>
            <TableCell>Owner</TableCell>
            <TableCell>Contracts</TableCell>
            <TableCell>Stripe account</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Created</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {companies.map((company) => (
            <TableRow key={company.id} hover>
              <TableCell>
                <Typography variant="body2" fontWeight={600}>
                  {company.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {company.legalName}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{company.ownerName}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {company.ownerEmail}
                </Typography>
              </TableCell>
              <TableCell>{company.contractCount}</TableCell>
              <TableCell>
                {company.stripeAccountId ? (
                  <Typography variant="caption">{company.stripeAccountId}</Typography>
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    Not connected
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  color={company.chargesEnabled ? 'success' : 'default'}
                  label={company.chargesEnabled ? 'Live' : 'Pending'}
                />
              </TableCell>
              <TableCell>
                <Typography variant="caption" color="text.secondary">
                  {new Date(company.createdAt).toLocaleDateString()}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {companies.length === 0 && (
        <Box py={4} textAlign="center">
          <Typography variant="body2" color="text.secondary">
            No companies yet. Encourage users to create their first entity from the dashboard.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default AdminCompaniesTable;
