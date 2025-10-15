'use client';

import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DIMENSIONS } from 'constants/landing';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface ContractSummary {
  id: string;
  title: string;
  status: string;
  counterpartyName: string;
  counterpartyEmail: string | null;
  contractValue: number | null;
  currency: string | null;
  startDate: string | null;
  endDate: string | null;
  signedDate: string | null;
  company: {
    id: string;
    legalName: string;
    displayName: string | null;
  } | null;
  relevantParty: {
    id: string;
    fullName: string;
    email: string;
    role: string | null;
    phone: string | null;
  } | null;
  description: string | null;
  paymentTerms: string | null;
  renewalTerms: string | null;
  updatedAt: string;
  createdAt: string;
}

const initialRequestState = {
  email: '',
  error: '',
  success: '',
  isSubmitting: false,
};

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

const ClientPortal: React.FC = () => {
  const [contracts, setContracts] = useState<ContractSummary[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [requestState, setRequestState] = useState(initialRequestState);
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const token = searchParams.get('token') ?? '';

  useEffect(() => {
    if (!token) {
      setContracts([]);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    const loadContracts = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await fetch(`/api/client-portal/contracts?token=${encodeURIComponent(token)}`, {
          method: 'GET',
          signal: controller.signal,
          cache: 'no-store',
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          const message = data?.error || 'Unable to load contracts.';
          throw new Error(message);
        }

        const data = (await response.json()) as { contracts: ContractSummary[] };
        setContracts(data.contracts);
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') {
          return;
        }
        console.error('Failed to load client portal contracts', requestError);
        setError((requestError as Error).message || 'Unable to load contracts.');
      } finally {
        setIsLoading(false);
      }
    };

    loadContracts();

    return () => controller.abort();
  }, [token]);

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRequestState((prev) => ({ ...prev, email: event.target.value }));
  };

  const handleRequestSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!requestState.email.trim()) {
      setRequestState((prev) => ({ ...prev, error: 'Please enter an email address.' }));
      return;
    }

    setRequestState((prev) => ({ ...prev, error: '', success: '', isSubmitting: true }));

    try {
      const response = await fetch('/api/client-portal/send-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: requestState.email }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setRequestState({
          ...initialRequestState,
          success: 'We just emailed you a secure portal link. Please check your inbox.',
        });
        return;
      }

      const message = data?.error || 'We were unable to send the link. Please try again later.';
      setRequestState((prev) => ({ ...prev, error: message, isSubmitting: false }));
    } catch (requestError) {
      console.error('Failed to request client portal link', requestError);
      setRequestState((prev) => ({
        ...prev,
        error: 'We were unable to send the link. Please try again later.',
        isSubmitting: false,
      }));
    }
  };

  const renderContractsContent = () => {
    if (!token) {
      return (
        <Alert severity="info">
          Enter your email above to receive a secure link. Once you open the link we send, your contracts will appear here.
        </Alert>
      );
    }

    if (isLoading) {
      return (
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography variant="body1">Loading your contracts…</Typography>
        </Stack>
      );
    }

    if (error) {
      return <Alert severity="error">{error}</Alert>;
    }

    if (contracts.length === 0) {
      return <Alert severity="warning">We didn&apos;t find any contracts associated with this link.</Alert>;
    }

    return (
      <Stack spacing={3}>
        {contracts.map((contract) => {
          const href = token
            ? `/client-portal/${contract.id}?token=${encodeURIComponent(token)}`
            : `/client-portal/${contract.id}`;
          return (
            <Card key={contract.id} variant="outlined">
            <CardContent>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h5" component="h2" fontWeight="bold">
                    {contract.title}
                  </Typography>
                  {contract.company && (
                    <Typography variant="subtitle1" color="text.secondary">
                      {contract.company.displayName || contract.company.legalName}
                    </Typography>
                  )}
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Status
                    </Typography>
                    <Typography variant="body1">{contract.status}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Contract Value
                    </Typography>
                    <Typography variant="body1">
                      {formatCurrency(contract.contractValue, contract.currency)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Counterparty
                    </Typography>
                    <Typography variant="body1">
                      {contract.counterpartyName}
                      {contract.counterpartyEmail ? ` (${contract.counterpartyEmail})` : ''}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Your Role
                    </Typography>
                    <Typography variant="body1">
                      {contract.relevantParty?.role || 'Relevant party'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Start Date
                    </Typography>
                    <Typography variant="body1">{formatDate(contract.startDate)}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      End Date
                    </Typography>
                    <Typography variant="body1">{formatDate(contract.endDate)}</Typography>
                  </Grid>
                </Grid>
                {contract.description && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Description
                      </Typography>
                      <Typography variant="body1">{contract.description}</Typography>
                    </Box>
                  </>
                )}
                {(contract.paymentTerms || contract.renewalTerms) && (
                  <Grid container spacing={2}>
                    {contract.paymentTerms && (
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Payment Terms
                        </Typography>
                        <Typography variant="body1">{contract.paymentTerms}</Typography>
                      </Grid>
                    )}
                    {contract.renewalTerms && (
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Renewal Terms
                        </Typography>
                        <Typography variant="body1">{contract.renewalTerms}</Typography>
                      </Grid>
                    )}
                  </Grid>
                )}
                <Typography variant="caption" color="text.secondary">
                  Last updated {formatDate(contract.updatedAt)}
                </Typography>
                <Box display="flex" justifyContent="flex-end">
                  <Button component={Link} href={href} variant="outlined">
                    View contract
                  </Button>
                </Box>
              </Stack>
            </CardContent>
            </Card>
          );
        })}
      </Stack>
    );
  };

  return (
    <Box component="section" bgcolor="grey.50" minHeight="100vh" py={DIMENSIONS.spacing.section}>
      <Container maxWidth="lg">
        <Box
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 4,
            boxShadow: 3,
            px: { xs: 3, md: 6 },
            py: { xs: 4, md: 6 },
          }}
        >
          <Stack spacing={DIMENSIONS.spacing.container}>
            <Stack spacing={2} textAlign="center" alignItems="center">
              <Typography variant="h4" component="h1" fontWeight="bold">
                Client Portal
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Request a secure magic link and review the contracts you&apos;re listed on as a relevant party.
              </Typography>
            </Stack>
            {!session && (
              <Box
                component="form"
                onSubmit={handleRequestSubmit}
                noValidate
                sx={{ width: '100%', maxWidth: 520, mx: 'auto' }}
                aria-label="Client portal link request form"
              >
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                  <TextField
                    fullWidth
                    type="email"
                    label="Email address"
                    value={requestState.email}
                    onChange={handleEmailChange}
                    placeholder="you@example.com"
                    required
                    disabled={requestState.isSubmitting}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={requestState.isSubmitting}
                  >
                    {requestState.isSubmitting ? 'Sending…' : 'Send Link'}
                  </Button>
                </Stack>
                <Box mt={2}>
                  {requestState.error && <Alert severity="error">{requestState.error}</Alert>}
                  {requestState.success && <Alert severity="success">{requestState.success}</Alert>}
                </Box>
              </Box>
            )}
            <Divider />
            <Stack spacing={2}>
              <Typography variant="h5" component="h2" fontWeight="bold">
                Your Contracts
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Contracts that include you as a relevant party appear below once you open a valid portal link.
              </Typography>
              {renderContractsContent()}
            </Stack>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default ClientPortal;
