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
import DownloadIcon from '@mui/icons-material/Download';

interface ContractDetailsProps {
  contractId: string;
  token: string;
  companyId: string;
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
  id:string;
  legalName: string;
  displayName: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
}

interface FileSummary {
  id: string;
  name: string;
  description: string | null;
  contentType: string | null;
  size: number | null;
  createdAt: string;
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
  files: FileSummary[];
  isBillingEnabled: boolean;
  stripePriceId: string | null;
  billingAmount: number | null;
  billingCurrency: string | null;
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
  } catch {
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

const formatFileSize = (bytes: number | null) => {
  if (bytes === null || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

const ClientPortalContractDetails: React.FC<ContractDetailsProps> = ({ contractId, token, companyId }) => {
  const [contract, setContract] = useState<ContractDetailsResponse | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(Boolean(token));
  const [isPaying, setIsPaying] = useState(false);

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
          `/api/${companyId}/client-portal/contracts/${contractId}?token=${encodeURIComponent(token)}`,
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
  }, [contractId, token, companyId]);

  const workItems = useMemo(() => {
    if (!contract) return [];
    return [...contract.workItems].sort((a, b) => a.position - b.position);
  }, [contract]);

  const handlePayment = async () => {
    if (!contract || (!contract.stripePriceId && !contract.billingAmount)) {
      setError('This contract is not configured for payments correctly.');
      return;
    }
    setIsPaying(true);
    setError('');

    try {
      const response = await fetch(
        `/api/${companyId}/client-portal/contracts/${contractId}/checkout?token=${encodeURIComponent(token)}`,
        {
          method: 'POST',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      console.error('Payment failed', err);
      setError((err as Error).message || 'Failed to initiate payment. Please try again.');
      setIsPaying(false);
    }
  };

  const backHref = token ? `/${companyId}/client-portal?token=${encodeURIComponent(token)}` : `/${companyId}/client-portal`;

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

                {contract.isBillingEnabled && (
                  <>
                    <Divider />
                    <Stack spacing={1} alignItems="center">
                      <Typography variant="h6">Payment due</Typography>
                      <Typography variant="body1">
                        A payment is required for this contract. Please use the button below to complete the payment.
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={handlePayment}
                        disabled={isPaying}
                      >
                        {isPaying ? <CircularProgress size={24} /> : 'Pay Now'}
                      </Button>
                    </Stack>
                  </>
                )}

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
                      Details
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ whiteSpace: 'pre-wrap', overflowX: 'auto' }}
                    >
                      {contract.description}
                    </Typography>
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
                        <Typography
                          variant="body1"
                          sx={{ whiteSpace: 'pre-wrap', overflowX: 'auto' }}
                        >
                          {contract.paymentTerms}
                        </Typography>
                      </Stack>
                    )}
                    {contract.renewalTerms && (
                      <Stack spacing={0.5}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Renewal Terms
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ whiteSpace: 'pre-wrap', overflowX: 'auto' }}
                        >
                          {contract.renewalTerms}
                        </Typography>
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

                {contract.files && contract.files.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Contract Files
                    </Typography>
                    <Table size="small" sx={{ mt: 2 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>File Name</TableCell>
                          <TableCell>Size</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {contract.files.map((file) => (
                          <TableRow key={file.id} hover>
                            <TableCell>{file.name}</TableCell>
                            <TableCell>{formatFileSize(file.size)}</TableCell>
                            <TableCell>
                              <Button
                                variant="text"
                                size="small"
                                startIcon={<DownloadIcon />}
                                href={`/api/${companyId}/client-portal/contracts/${contractId}/files/${
                                  file.id
                                }?token=${encodeURIComponent(token)}`}
                                download
                              >
                                Download
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                )}

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
