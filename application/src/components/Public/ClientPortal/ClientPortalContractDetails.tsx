'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import type { ChipProps } from '@mui/material/Chip';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { DIMENSIONS } from 'constants/landing';
import Link from 'next/link';

interface ContractDetailsProps {
  contractId: string;
  token: string;
}

interface RelevantPartySummary {
  id: string;
  fullName: string;
  email: string;
  role: string | null;
  phone: string | null;
}

interface WorkItemSummary {
  id: string;
  title: string;
  description: string | null;
  status: string;
  dueDate: string | null;
  completedAt: string | null;
  position: number;
}

interface CompanySummary {
  id: string;
  legalName: string;
  displayName: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
}

interface ContractDetailsResponse {
  id: string;
  title: string;
  description: string | null;
  status: string;
  counterpartyName: string;
  counterpartyEmail: string | null;
  contractValue: number | null;
  currency: string | null;
  startDate: string | null;
  endDate: string | null;
  signedDate: string | null;
  paymentTerms: string | null;
  renewalTerms: string | null;
  createdAt: string;
  updatedAt: string;
  company: CompanySummary | null;
  relevantParties: RelevantPartySummary[];
  workItems: WorkItemSummary[];
}

const formatDate = (value: string | null) => {
  if (!value) return 'Not specified';
  return new Date(value).toLocaleDateString();
};

const formatCurrency = (value: number | null, currency: string | null) => {
  if (value === null) return 'Not specified';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency || 'USD',
    }).format(value);
  } catch (error) {
    return `${value} ${currency ?? ''}`.trim();
  }
};

const formatAddress = (company: CompanySummary | null) => {
  if (!company) return 'Not specified';
  const parts = [company.addressLine1, company.addressLine2, company.city, company.state];
  const filtered = parts.filter(Boolean).join(', ');
  const postal = [company.postalCode, company.country].filter(Boolean).join(' ');
  return [filtered, postal].filter(Boolean).join('\n') || 'Not specified';
};

const statusColor = (status: string): ChipProps['color'] => {
  switch (status) {
    case 'COMPLETED':
      return 'success';
    case 'ACTIVE':
      return 'primary';
    case 'PENDING_SIGNATURE':
      return 'warning';
    case 'TERMINATED':
      return 'error';
    default:
      return 'default';
  }
};

const ClientPortalContractDetails: React.FC<ContractDetailsProps> = ({ contractId, token }) => {
  const [contract, setContract] = useState<ContractDetailsResponse | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      setContract(null);
      return;
    }

    const controller = new AbortController();

    const loadContract = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await fetch(
          `/api/client-portal/contracts/${contractId}?token=${encodeURIComponent(token)}`,
          {
            method: 'GET',
            signal: controller.signal,
            cache: 'no-store',
          }
        );

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          const message = data?.error || 'Unable to load contract.';
          throw new Error(message);
        }

        const data = (await response.json()) as { contract: ContractDetailsResponse };
        setContract(data.contract);
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') {
          return;
        }
        console.error('Failed to load contract details for client portal', requestError);
        setError((requestError as Error).message || 'Unable to load contract.');
      } finally {
        setIsLoading(false);
      }
    };

    loadContract();

    return () => controller.abort();
  }, [contractId, token]);

  const workItems = useMemo(() => {
    if (!contract) return [];
    return [...contract.workItems].sort((a, b) => a.position - b.position);
  }, [contract]);

  const backHref = token ? `/client-portal?token=${encodeURIComponent(token)}` : '/client-portal';

  return (
    <Box component="section" bgcolor="grey.100" minHeight="100vh" py={DIMENSIONS.spacing.section}>
      <Container maxWidth="md">
        <Stack spacing={3}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Button component={Link} href={backHref} startIcon={<ArrowBackIcon />} variant="text">
              Back to contracts
            </Button>
            {contract && (
              <Chip label={contract.status.replace(/_/g, ' ')} color={statusColor(contract.status)} variant="outlined" />
            )}
          </Box>

          <Paper elevation={3} sx={{ p: { xs: 3, md: 5 } }}>
            {isLoading ? (
              <Stack spacing={2} alignItems="center">
                <CircularProgress />
                <Typography variant="body1">Preparing contract…</Typography>
              </Stack>
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : contract ? (
              <Stack spacing={4}>
                <Stack spacing={1} textAlign="center">
                  <Typography variant="h4" component="h1" fontWeight="bold">
                    {contract.title}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    {contract.company?.displayName || contract.company?.legalName || 'FormaNew Client'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Agreement effective {formatDate(contract.startDate)}
                  </Typography>
                </Stack>

                <Divider />

                <Box
                  sx={{
                    display: 'grid',
                    gap: DIMENSIONS.spacing.small,
                    gridTemplateColumns: {
                      xs: '1fr',
                      md: 'repeat(2, minmax(0, 1fr))',
                    },
                  }}
                >
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Counterparty
                    </Typography>
                    <Typography variant="body1">{contract.counterpartyName}</Typography>
                    {contract.counterpartyEmail && (
                      <Typography variant="body2" color="text.secondary">
                        {contract.counterpartyEmail}
                      </Typography>
                    )}
                  </Stack>
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Contract Value
                    </Typography>
                    <Typography variant="body1">
                      {formatCurrency(contract.contractValue, contract.currency)}
                    </Typography>
                  </Stack>
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Term
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(contract.startDate)} – {formatDate(contract.endDate)}
                    </Typography>
                  </Stack>
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Organization Address
                    </Typography>
                    <Typography variant="body1" whiteSpace="pre-line">
                      {formatAddress(contract.company)}
                    </Typography>
                  </Stack>
                </Box>

                {contract.description && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Executive Summary
                    </Typography>
                    <Typography variant="body1">{contract.description}</Typography>
                  </Box>
                )}

                {(contract.paymentTerms || contract.renewalTerms) && (
                  <Box
                    sx={{
                      display: 'grid',
                      gap: DIMENSIONS.spacing.small,
                      gridTemplateColumns: {
                        xs: '1fr',
                        md: 'repeat(2, minmax(0, 1fr))',
                      },
                    }}
                  >
                    {contract.paymentTerms && (
                      <Stack spacing={0.5}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Payment Terms
                        </Typography>
                        <Typography variant="body1">{contract.paymentTerms}</Typography>
                      </Stack>
                    )}
                    {contract.renewalTerms && (
                      <Stack spacing={0.5}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Renewal Terms
                        </Typography>
                        <Typography variant="body1">{contract.renewalTerms}</Typography>
                      </Stack>
                    )}
                  </Box>
                )}

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Relevant Parties
                  </Typography>
                  <Stack spacing={1} mt={1}>
                    {contract.relevantParties.map((party) => (
                      <Box key={party.id}>
                        <Typography variant="body1" fontWeight="medium">
                          {party.fullName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {party.role || 'Relevant party'} • {party.email}
                          {party.phone ? ` • ${party.phone}` : ''}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Work Items & Deliverables
                  </Typography>
                  {workItems.length === 0 ? (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      No work items have been scheduled for this contract yet.
                    </Alert>
                  ) : (
                    <Table size="small" sx={{ mt: 2 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>#</TableCell>
                          <TableCell>Task</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Due Date</TableCell>
                          <TableCell>Description</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {workItems.map((item, index) => (
                          <TableRow key={item.id} hover>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{item.title}</TableCell>
                            <TableCell>{item.status.replace(/_/g, ' ')}</TableCell>
                            <TableCell>{formatDate(item.dueDate)}</TableCell>
                            <TableCell>{item.description || '—'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </Box>

                <Divider />

                <Stack spacing={1} alignItems="flex-start">
                  <Typography variant="subtitle2" color="text.secondary">
                    Future Signatures
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    A dedicated signing experience will appear here once ready. For now, please contact your FormaNew
                    representative to finalize this agreement.
                  </Typography>
                </Stack>

                <Typography variant="caption" color="text.secondary" alignSelf="flex-end">
                  Last updated {formatDate(contract.updatedAt)}
                </Typography>
              </Stack>
            ) : (
              <Alert severity="info">Open a contract from the portal to view its details.</Alert>
            )}
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
};

export default ClientPortalContractDetails;
