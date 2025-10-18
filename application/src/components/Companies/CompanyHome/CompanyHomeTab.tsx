'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TimelineIcon from '@mui/icons-material/Timeline';
import type { Company } from 'lib/api/companies';
import {
  FinanceLineItem,
  financeLineItemsClient,
} from '@/lib/api/companyFinanceLineItems';

type NavigationTarget = 'settings' | 'contacts' | 'notes' | 'launchpad';

interface CompanyHomeTabProps {
  company: Company;
  onNavigateToTab?: (tab: NavigationTarget) => void;
}

const formatCurrency = (value: number, currency: string) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(value);

const getMonthKey = (isoDate: string) => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const month = date.getMonth();
  const year = date.getFullYear();
  return `${year}-${String(month + 1).padStart(2, '0')}`;
};

const monthLabel = (key: string) => {
  const [year, month] = key.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString(undefined, { month: 'short' });
};

const CompanyHomeTab = ({ company, onNavigateToTab }: CompanyHomeTabProps) => {
  const [lineItems, setLineItems] = useState<FinanceLineItem[]>([]);
  const [isLoadingFinances, setIsLoadingFinances] = useState(true);
  const [financeError, setFinanceError] = useState<string | null>(null);

  const companyId = company.id;

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoadingFinances(true);
      setFinanceError(null);

      try {
        const response = await financeLineItemsClient.list(companyId);
        if (isMounted) {
          setLineItems(response.items ?? []);
        }
      } catch (error) {
        console.error('Failed to load finance line items', error);
        if (isMounted) {
          setFinanceError('Unable to load recent transactions right now.');
          setLineItems([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingFinances(false);
        }
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [companyId]);

  const currency = useMemo(() => lineItems[0]?.currency ?? 'usd', [lineItems]);

  const financeSummary = useMemo(() => {
    return lineItems.reduce(
      (acc, item) => {
        if (item.type === 'INFLOW') {
          acc.inflow += item.amount;
          acc.inflowCount += 1;
        } else {
          acc.outflow += item.amount;
        }
        return acc;
      },
      { inflow: 0, outflow: 0, inflowCount: 0 }
    );
  }, [lineItems]);

  const netIncome = financeSummary.inflow - financeSummary.outflow;

  const averageInvoice = financeSummary.inflowCount
    ? financeSummary.inflow / financeSummary.inflowCount
    : 0;

  const monthlyMomentum = useMemo(() => {
    const grouped = new Map<string, { inflow: number; outflow: number }>();

    lineItems.forEach((item) => {
      const key = getMonthKey(item.occurredAt);
      if (!key) {
        return;
      }

      if (!grouped.has(key)) {
        grouped.set(key, { inflow: 0, outflow: 0 });
      }

      const current = grouped.get(key)!;
      if (item.type === 'INFLOW') {
        current.inflow += item.amount;
      } else {
        current.outflow += item.amount;
      }
    });

    const sorted = Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6);

    return sorted.map(([key, value]) => ({
      key,
      label: monthLabel(key),
      value: value.inflow - value.outflow,
    }));
  }, [lineItems]);

  const maxMomentum = useMemo(
    () =>
      monthlyMomentum.reduce(
        (max, point) => Math.max(max, Math.abs(point.value)),
        0,
      ),
    [monthlyMomentum],
  );

  const contactsCount = company.contacts?.length ?? 0;
  const contractsCount = company.contracts?.length ?? 0;
  const notesCount = company.notes?.length ?? 0;

  const actionItems = useMemo(() => {
    const items: Array<{ title: string; description: string; action?: () => void } | null> = [
      !company.description
        ? {
            title: 'Add a company overview',
            description:
              'Tell prospective partners who you are, what you deliver, and how to get in touch.',
            action: () => onNavigateToTab?.('settings'),
          }
        : null,
      contactsCount === 0
        ? {
            title: 'Create your first contact',
            description:
              'Store key client and partner details so everyone on your team has the same context.',
            action: () => onNavigateToTab?.('contacts'),
          }
        : null,
      lineItems.length < 3
        ? {
            title: 'Log recent income',
            description:
              'Track payouts and expenses so your cash flow and tax prep stay accurate.',
            action: () => onNavigateToTab?.('launchpad'),
          }
        : null,
    ];

    const filtered = items.filter((item): item is NonNullable<typeof item> => Boolean(item));
    return filtered.length > 0
      ? filtered
      : [
          {
            title: 'Great work! Your workspace is ready.',
            description:
              'Keep logging revenue and notes so your launchpad reflects the health of your studio.',
          },
        ];
  }, [company.description, contactsCount, lineItems.length, onNavigateToTab]);

  return (
    <Stack spacing={3}>
      <Card variant="outlined">
        <CardContent>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Contracts
              </Typography>
              <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                {contractsCount}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Draft, track, and organize agreements in one place.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Contacts
              </Typography>
              <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                {contactsCount}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Keep stakeholders close with shared context for every project.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Notes
              </Typography>
              <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                {notesCount}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Capture decisions and updates so nothing slips between meetings.
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Stack spacing={3}>
            <Box display="flex" flexWrap="wrap" gap={1} alignItems="center">
              <Typography variant="h6" fontWeight={600} display="inline-flex" alignItems="center" gap={1}>
                Financial pulse
              </Typography>
              <Chip
                label={company.finance?.chargesEnabled ? 'Stripe payouts active' : 'Stripe not connected'}
                color={company.finance?.chargesEnabled ? 'success' : 'default'}
                size="small"
              />
            </Box>

            {financeError ? (
              <Alert severity="error">{financeError}</Alert>
            ) : isLoadingFinances ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress size={32} />
              </Box>
            ) : (
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Revenue YTD
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ mt: 1 }}>
                    {formatCurrency(financeSummary.inflow, currency)}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} sx={{ mt: 1 }}>
                    <TrendingUpIcon color="success" fontSize="small" />
                    <Typography variant="caption" color="success.main">
                      Captured in FormaNew
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Operating spend
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ mt: 1 }}>
                    {formatCurrency(financeSummary.outflow, currency)}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} sx={{ mt: 1 }}>
                    <TrendingDownIcon color="warning" fontSize="small" />
                    <Typography variant="caption" color="warning.main">
                      Monitor new expenses
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Net income
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ mt: 1 }}>
                    {formatCurrency(netIncome, currency)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    After expenses logged in FormaNew
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Avg. invoice
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ mt: 1 }}>
                    {formatCurrency(averageInvoice || 0, currency)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Based on recent inflows
                  </Typography>
                </Grid>
              </Grid>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <TimelineIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Monthly momentum
              </Typography>
            </Box>
            {isLoadingFinances ? (
              <LinearProgress />
            ) : monthlyMomentum.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Log your first payment or expense to unlock momentum insights.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', minHeight: 160 }}>
                {monthlyMomentum.map((point) => {
                  const normalized = maxMomentum ? Math.max(point.value / maxMomentum, -1) : 0;
                  const height = `${Math.abs(normalized) * 120 + 20}px`;
                  const isPositive = point.value >= 0;

                  return (
                    <Box key={point.key} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: '100%',
                          maxWidth: 60,
                          height,
                          borderRadius: 2,
                          background: isPositive
                            ? 'linear-gradient(180deg, rgba(25,118,210,0.2) 0%, rgba(25,118,210,0.65) 100%)'
                            : 'linear-gradient(180deg, rgba(239,83,80,0.2) 0%, rgba(239,83,80,0.7) 100%)',
                          transition: 'height 0.3s ease',
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {point.label}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Next best actions
          </Typography>
          <Stack spacing={2} divider={<Divider flexItem />}>
            {actionItems.map((item) => (
              <Box key={item.title} sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: { md: 'center' } }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {item.description}
                  </Typography>
                </Box>
                {item.action && (
                  <Button variant="contained" size="small" onClick={item.action} sx={{ alignSelf: { xs: 'flex-start', md: 'center' } }}>
                    Open section
                  </Button>
                )}
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default CompanyHomeTab;
