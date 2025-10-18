'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import SavingsIcon from '@mui/icons-material/Savings';
import PaidIcon from '@mui/icons-material/Paid';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useCompanySelection } from '@/context/CompanySelectionContext';
import {
  FinanceLineItem,
  financeLineItemsClient,
} from '@/lib/api/companyFinanceLineItems';

const formatCurrency = (value: number, currency: string) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const groupByMonth = (items: FinanceLineItem[]) => {
  const grouped = new Map<string, { inflow: number; outflow: number }>();

  items.forEach((item) => {
    const date = new Date(item.occurredAt);
    if (Number.isNaN(date.getTime())) {
      return;
    }
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!grouped.has(key)) {
      grouped.set(key, { inflow: 0, outflow: 0 });
    }
    const bucket = grouped.get(key)!;
    if (item.type === 'INFLOW') {
      bucket.inflow += item.amount;
    } else {
      bucket.outflow += item.amount;
    }
  });

  return Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([key, value]) => ({
      key,
      label: new Date(`${key}-01`).toLocaleDateString(undefined, { month: 'short' }),
      net: value.inflow - value.outflow,
    }));
};

const FreelancerFinanceDashboard = () => {
  const { selectedCompanyId, isLoading: companiesLoading } = useCompanySelection();
  const [lineItems, setLineItems] = useState<FinanceLineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!selectedCompanyId) {
        setLineItems([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await financeLineItemsClient.list(selectedCompanyId);
        if (isMounted) {
          setLineItems(response.items ?? []);
        }
      } catch (err) {
        console.error('Failed to load finance line items', err);
        if (isMounted) {
          setError('Unable to load transactions. Refresh and try again.');
          setLineItems([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (!companiesLoading) {
      void load();
    }

    return () => {
      isMounted = false;
    };
  }, [selectedCompanyId, companiesLoading]);

  const currency = useMemo(() => lineItems[0]?.currency ?? 'usd', [lineItems]);

  const financeSummary = useMemo(() => {
    return lineItems.reduce(
      (acc, item) => {
        if (item.type === 'INFLOW') {
          acc.income += item.amount;
        } else {
          acc.expenses += item.amount;
        }
        return acc;
      },
      { income: 0, expenses: 0 },
    );
  }, [lineItems]);

  const netIncome = financeSummary.income - financeSummary.expenses;
  const taxReserve = Math.max(Math.round(netIncome * 0.3), 0);
  const averageMonthlyNet = useMemo(() => {
    const monthly = groupByMonth(lineItems);
    if (monthly.length === 0) {
      return 0;
    }
    const total = monthly.reduce((sum, point) => sum + point.net, 0);
    return total / monthly.length;
  }, [lineItems]);

  const monthlyMomentum = useMemo(() => groupByMonth(lineItems), [lineItems]);
  const maxMomentum = useMemo(
    () => monthlyMomentum.reduce((max, point) => Math.max(max, Math.abs(point.net)), 0),
    [monthlyMomentum],
  );

  if (!selectedCompanyId) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Freelancer finance workspace
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Select a company to see income, expenses, and helpful planning insights.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h6" fontWeight={600}>
        Freelancer finance workspace
      </Typography>

      {error ? <Alert severity="error">{error}</Alert> : null}

      {isLoading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PaidIcon color="primary" />
                      <Typography variant="subtitle2" color="text.secondary">
                        Income to date
                      </Typography>
                    </Box>
                    <Typography variant="h5" fontWeight={700}>
                      {formatCurrency(financeSummary.income, currency)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Logged in FormaNew
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <TrendingDownIcon color="warning" />
                      <Typography variant="subtitle2" color="text.secondary">
                        Expenses
                      </Typography>
                    </Box>
                    <Typography variant="h5" fontWeight={700}>
                      {formatCurrency(financeSummary.expenses, currency)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Categorize new spend to stay on budget.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <TrendingUpIcon color="success" />
                      <Typography variant="subtitle2" color="text.secondary">
                        Net income
                      </Typography>
                    </Box>
                    <Typography variant="h5" fontWeight={700}>
                      {formatCurrency(netIncome, currency)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Avg. monthly net {formatCurrency(averageMonthlyNet || 0, currency)}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <SavingsIcon color="primary" />
                      <Typography variant="subtitle2" color="text.secondary">
                        Suggested tax reserve (30%)
                      </Typography>
                    </Box>
                    <Typography variant="h5" fontWeight={700}>
                      {formatCurrency(taxReserve, currency)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Transfer this amount into a savings account to stay ahead of quarterly taxes.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Monthly momentum
                  </Typography>
                  {monthlyMomentum.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Add income and expenses to see your recent cash flow trends.
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', minHeight: 140 }}>
                      {monthlyMomentum.map((point) => {
                        const normalized = maxMomentum ? Math.max(point.net / maxMomentum, -1) : 0;
                        const height = `${Math.abs(normalized) * 100 + 24}px`;
                        const isPositive = point.net >= 0;
                        return (
                          <Box key={point.key} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                            <Box
                              sx={{
                                width: '100%',
                                maxWidth: 48,
                                height,
                                borderRadius: 2,
                                background: isPositive
                                  ? 'linear-gradient(180deg, rgba(76,175,80,0.15) 0%, rgba(76,175,80,0.65) 100%)'
                                  : 'linear-gradient(180deg, rgba(229,57,53,0.15) 0%, rgba(229,57,53,0.65) 100%)',
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
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Recent activity
              </Typography>
              {lineItems.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No transactions recorded yet. Add your latest invoices and expenses to keep cash flow current.
                </Typography>
              ) : (
                <Stack spacing={1} divider={<Divider flexItem />}>
                  {lineItems
                    .slice()
                    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
                    .slice(0, 6)
                    .map((item) => (
                      <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            {item.description || (item.type === 'INFLOW' ? 'Invoice payment' : 'Expense')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(item.occurredAt)} · {item.category || 'Uncategorized'}
                          </Typography>
                        </Box>
                        <Typography
                          variant="body1"
                          fontWeight={600}
                          color={item.type === 'INFLOW' ? 'success.main' : 'warning.main'}
                        >
                          {item.type === 'INFLOW' ? '+' : '-'}
                          {formatCurrency(item.amount, item.currency)}
                        </Typography>
                      </Box>
                    ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </Stack>
  );
};

export default FreelancerFinanceDashboard;
