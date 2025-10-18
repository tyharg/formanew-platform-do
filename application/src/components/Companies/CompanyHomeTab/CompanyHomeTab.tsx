'use client';

import React, { useMemo } from 'react';
import { Box, Chip, Divider, LinearProgress, Paper, Stack, Typography, Button } from '@mui/material';
import Link from 'next/link';
import { Company } from '@/lib/api/companies';

interface CompanyHomeTabProps {
  company: Company;
}

const formatCurrency = (value: number | null | undefined, currency = 'USD') => {
  if (value === null || value === undefined) {
    return '—';
  }
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `$${value.toLocaleString()}`;
  }
};

const CompanyHomeTab: React.FC<CompanyHomeTabProps> = ({ company }) => {
  const contractStats = useMemo(() => {
    const contracts = company.contracts ?? [];
    const total = contracts.length;
    const signed = contracts.filter((contract) => contract.status?.toLowerCase() === 'signed').length;
    const pipelineValue = contracts.reduce((sum, contract) => sum + (contract.contractValue ?? 0), 0);
    const winRate = total === 0 ? 0 : Math.round((signed / total) * 100);

    const byMonth = new Map<string, { label: string; value: number }>();
    contracts.forEach((contract) => {
      if (!contract.updatedAt) {
        return;
      }
      const date = new Date(contract.updatedAt);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const label = date.toLocaleString('default', { month: 'short' });
      const existing = byMonth.get(key);
      const value = (existing?.value ?? 0) + (contract.contractValue ?? 0);
      byMonth.set(key, { label, value });
    });

    const monthlySeries = Array.from(byMonth.entries())
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([, entry]) => entry)
      .slice(-6);

    return { total, signed, pipelineValue, winRate, monthlySeries };
  }, [company.contracts]);

  const milestones = useMemo(
    () => [
      { label: 'Formation filed', completed: Boolean(company.formationDate) },
      { label: 'EIN secured', completed: Boolean(company.ein) },
      { label: 'Finance workspace ready', completed: Boolean(company.finance?.chargesEnabled) },
    ],
    [company.ein, company.finance?.chargesEnabled, company.formationDate],
  );

  const milestoneProgress = Math.round(
    (milestones.filter((milestone) => milestone.completed).length / milestones.length) * 100,
  );

  const financeStatus = company.finance?.chargesEnabled
    ? 'Live payouts enabled'
    : company.finance?.stripeAccountId
      ? 'Pending Stripe verification'
      : 'Connect Stripe to start selling';

  const financeChipColor: 'success' | 'warning' | 'default' = company.finance?.chargesEnabled
    ? 'success'
    : company.finance?.stripeAccountId
      ? 'warning'
      : 'default';

  const actionItems = [
    {
      label: 'Complete incorporation filing',
      href: '/incorporation',
      completed: Boolean(company.ein && company.formationDate),
    },
    {
      label: 'Invite clients to your portal',
      href: '/dashboard/companies',
      completed: (company.contacts?.length ?? 0) > 0,
    },
    {
      label: 'Configure storefront products',
      href: '/dashboard/store',
      completed: Boolean(company.finance?.chargesEnabled),
    },
  ];

  const maxMonthlyValue = Math.max(1, ...contractStats.monthlySeries.map((entry) => entry.value));

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
        }}
      >
        <Paper sx={{ p: 3, height: '100%' }}>
          <Stack spacing={2}>
            <Typography variant="subtitle2" color="text.secondary">
              Incorporation momentum
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {milestoneProgress}% complete
            </Typography>
            <LinearProgress variant="determinate" value={milestoneProgress} sx={{ height: 10, borderRadius: 5 }} />
            <Stack spacing={1}>
              {milestones.map((milestone) => (
                <Stack key={milestone.label} direction="row" spacing={1} alignItems="center">
                  <Chip
                    size="small"
                    color={milestone.completed ? 'success' : 'default'}
                    label={milestone.completed ? 'Done' : 'Next'}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {milestone.label}
                  </Typography>
                </Stack>
              ))}
            </Stack>
            <Button component={Link} href="/incorporation" variant="outlined" size="small">
              Manage filings
            </Button>
          </Stack>
        </Paper>

        <Paper sx={{ p: 3, height: '100%' }}>
          <Stack spacing={2}>
            <Typography variant="subtitle2" color="text.secondary">
              Contract pipeline
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {contractStats.total} active deals
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {contractStats.signed} signed · win rate {contractStats.winRate}%
            </Typography>
            <Divider />
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Forecasted revenue
              </Typography>
              <Typography variant="subtitle1" fontWeight={600}>
                {formatCurrency(contractStats.pipelineValue)}
              </Typography>
            </Stack>
            <Button component={Link} href="/dashboard/contracts" variant="outlined" size="small">
              Review contracts
            </Button>
          </Stack>
        </Paper>

        <Paper sx={{ p: 3, height: '100%' }}>
          <Stack spacing={2}>
            <Typography variant="subtitle2" color="text.secondary">
              Finance workspace
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {company.finance?.stripeAccountId ? 'Stripe connected' : 'Setup in progress'}
            </Typography>
            <Chip size="small" color={financeChipColor} label={financeStatus} sx={{ alignSelf: 'flex-start' }} />
            <Typography variant="body2" color="text.secondary">
              Keep payouts, invoicing, and reporting aligned. View store performance or add new offerings directly from the finance hub.
            </Typography>
            <Button component={Link} href="/dashboard/finances" variant="outlined" size="small">
              Open finance hub
            </Button>
          </Stack>
        </Paper>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={700}>
            Monthly revenue momentum
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track how new contracts impact booked revenue and spot trends to plan cash flow.
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.max(contractStats.monthlySeries.length, 1)}, minmax(0, 1fr))`,
              gap: 2,
              pt: 1,
            }}
          >
            {contractStats.monthlySeries.length === 0 ? (
              <Stack alignItems="center" spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Create contracts to populate your revenue timeline.
                </Typography>
              </Stack>
            ) : (
              contractStats.monthlySeries.map((entry, index) => (
                <Stack key={`${entry.label}-${index}`} spacing={1} alignItems="center" sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      height: 120,
                      width: '100%',
                      bgcolor: 'primary.100',
                      borderRadius: 1,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: `${Math.min(100, Math.max(10, (entry.value / maxMonthlyValue) * 100))}%`,
                        bgcolor: 'primary.main',
                        borderRadius: 1,
                        transition: 'height 0.3s ease',
                      }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {entry.label}
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatCurrency(entry.value)}
                  </Typography>
                </Stack>
              ))
            )}
          </Box>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={700}>
            Quick actions
          </Typography>
          <Stack spacing={1.5}>
            {actionItems.map((item) => (
              <Stack
                key={item.label}
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={1.5}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip size="small" color={item.completed ? 'success' : 'default'} label={item.completed ? 'Complete' : 'To do'} />
                  <Typography variant="body2" color="text.secondary">
                    {item.label}
                  </Typography>
                </Stack>
                <Button component={Link} href={item.href} size="small" variant="text">
                  View
                </Button>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default CompanyHomeTab;
