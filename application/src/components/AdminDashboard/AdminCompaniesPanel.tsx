'use client';

import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Chip,
} from '@mui/material';
import type { Company } from '@/lib/api/companies';

const AdminCompaniesPanel = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadCompanies = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/admin/companies');
        if (!response.ok) {
          throw new Error('Failed to load companies');
        }
        const data = await response.json();
        if (isMounted) {
          setCompanies(data.companies ?? []);
        }
      } catch (err) {
        console.error('Unable to fetch companies', err);
        if (isMounted) {
          setError('Unable to fetch companies. Try again later.');
          setCompanies([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadCompanies();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={600}>
            Companies
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          {isLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : companies.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No companies found.
            </Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Owner ID</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Stripe</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {companies.map((company) => {
                  const createdAt = new Date(company.createdAt);
                  const finance = company.finance ?? null;
                  return (
                    <TableRow key={company.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {company.displayName || company.legalName || 'Untitled company'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {company.legalName}
                        </Typography>
                      </TableCell>
                      <TableCell>{company.userId}</TableCell>
                      <TableCell>{Number.isNaN(createdAt.getTime()) ? '—' : createdAt.toLocaleDateString()}</TableCell>
                      <TableCell>
                        {finance?.stripeAccountId ? (
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="caption" color="text.secondary">
                              {finance.stripeAccountId}
                            </Typography>
                            <Chip
                              label={finance.chargesEnabled ? 'Live' : 'Pending'}
                              color={finance.chargesEnabled ? 'success' : 'warning'}
                              size="small"
                            />
                          </Stack>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Not connected
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default AdminCompaniesPanel;
