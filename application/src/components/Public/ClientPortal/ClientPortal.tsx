'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { DIMENSIONS } from 'constants/landing';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ContractStatus } from 'lib/api/contracts';

interface ContractSummary {
  id: string;
  title: string;
  status: ContractStatus;
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
  } catch {
    return `${value} ${currency ?? ''}`.trim();
  }
};

const ContractCard: React.FC<{ contract: ContractSummary; companyId: string | string[]; token: string }> = ({
  contract,
  companyId,
  token,
}) => {
  const href = token
    ? `/${companyId}/client-portal/${contract.id}?token=${encodeURIComponent(token)}`
    : `/${companyId}/client-portal/${contract.id}`;

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6" component="h3" fontWeight="bold">
              {contract.title}
            </Typography>
            {contract.company && (
              <Typography variant="body2" color="text.secondary">
                {contract.company.displayName || contract.company.legalName}
              </Typography>
            )}
          </Box>
          <Stack direction="row" spacing={1}>
            <Chip label={contract.status.replace(/_/g, ' ')} size="small" />
          </Stack>
          <Divider />
          <Box
            sx={{
              display: 'grid',
              gap: DIMENSIONS.spacing.small,
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
              },
            }}
          >
            <Stack>
              <Typography variant="caption" color="text.secondary">
                Counterparty
              </Typography>
              <Typography variant="body2">{contract.counterpartyName}</Typography>
            </Stack>
            <Stack>
              <Typography variant="caption" color="text.secondary">
                Contract Value
              </Typography>
              <Typography variant="body2">
                {formatCurrency(contract.contractValue, contract.currency)}
              </Typography>
            </Stack>
            <Stack>
              <Typography variant="caption" color="text.secondary">
                Start Date
              </Typography>
              <Typography variant="body2">{formatDate(contract.startDate)}</Typography>
            </Stack>
            <Stack>
              <Typography variant="caption" color="text.secondary">
                End Date
              </Typography>
              <Typography variant="body2">{formatDate(contract.endDate)}</Typography>
            </Stack>
          </Box>
          <Box display="flex" justifyContent="flex-end">
            <Button component={Link} href={href} variant="outlined" size="small">
              View Details
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

const ClientPortal: React.FC = () => {
  const [contracts, setContracts] = useState<ContractSummary[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [requestState, setRequestState] = useState(initialRequestState);
  const [activeTab, setActiveTab] = useState('contracts');
  const searchParams = useSearchParams();
  const { companyId: rawCompanyId } = useParams();
  const companyId = Array.isArray(rawCompanyId) ? rawCompanyId[0] : rawCompanyId;
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
        const response = await fetch(`/api/${companyId}/client-portal/contracts?token=${encodeURIComponent(token)}`, {
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
  }, [token, companyId]);

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
      const response = await fetch(`/api/${companyId}/client-portal/send-link`, {
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

  const { proposals, active, completed } = useMemo(() => {
    const proposals: ContractSummary[] = [];
    const active: ContractSummary[] = [];
    const completed: ContractSummary[] = [];

    contracts.forEach((contract) => {
      if (['DRAFT', 'PENDING_SIGNATURE'].includes(contract.status)) {
        proposals.push(contract);
      } else if (['ACTIVE'].includes(contract.status)) {
        active.push(contract);
      } else {
        completed.push(contract);
      }
    });

    return { proposals, active, completed };
  }, [contracts]);

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
      <Stack spacing={2}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Proposals ({proposals.length})</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              {proposals.length > 0 ? (
                proposals.map((contract) => (
                  <ContractCard key={contract.id} contract={contract} companyId={companyId || ''} token={token} />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No proposals found.
                </Typography>
              )}
            </Stack>
          </AccordionDetails>
        </Accordion>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Active ({active.length})</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              {active.length > 0 ? (
                active.map((contract) => (
                  <ContractCard key={contract.id} contract={contract} companyId={companyId || ''} token={token} />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No active contracts found.
                </Typography>
              )}
            </Stack>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Completed ({completed.length})</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              {completed.length > 0 ? (
                completed.map((contract) => (
                  <ContractCard key={contract.id} contract={contract} companyId={companyId || ''} token={token} />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No completed contracts found.
                </Typography>
              )}
            </Stack>
          </AccordionDetails>
        </Accordion>
      </Stack>
    );
  };

  const companyName = useMemo(() => {
    if (contracts.length > 0) {
      return contracts[0].company?.displayName || contracts[0].company?.legalName;
    }
    return null;
  }, [contracts]);

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
            <Stack spacing={1} textAlign="center" alignItems="center">
              <Typography variant="h4" component="h1" fontWeight="bold">
                {companyName ? `${companyName} - Client Portal` : 'Client Portal'}
              </Typography>
            </Stack>
            {!token && (
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
            <Tabs value={activeTab} onChange={(_e, value) => setActiveTab(value)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tab label="Contracts" value="contracts" />
              <Tab label="Invoices" value="invoices" />
            </Tabs>
            {activeTab === 'contracts' && <Box sx={{ pt: 3 }}>{renderContractsContent()}</Box>}
            {activeTab === 'invoices' && (
              <Box sx={{ pt: 3 }}>
                <Typography variant="body1" color="text.secondary">
                  The invoices feature is coming soon.
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default ClientPortal;
