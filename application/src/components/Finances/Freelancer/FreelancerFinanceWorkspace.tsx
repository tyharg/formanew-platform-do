'use client';

import React, { useMemo } from 'react';
import { Box, Button, Chip, Divider, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import { useCompanySelection } from '@/context/CompanySelectionContext';

const formatCurrency = (value: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);

const FreelancerFinanceWorkspace: React.FC = () => {
  const { selectedCompany } = useCompanySelection();
  const companyName = selectedCompany?.displayName || selectedCompany?.legalName || 'your company';

  const pipelineValue = useMemo(
    () => (selectedCompany?.contracts ?? []).reduce((sum, contract) => sum + (contract.contractValue ?? 0), 0),
    [selectedCompany?.contracts],
  );

  const outstandingInvoices = 3;
  const averageInvoice = outstandingInvoices ? Math.round(pipelineValue / outstandingInvoices) : 0;
  const recommendedTaxReserve = Math.round(pipelineValue * 0.3);

  const recurringExpenses = [
    { label: 'Coworking & tools', amount: 420 },
    { label: 'Benefits & insurance', amount: 260 },
    { label: 'Savings for time off', amount: 350 },
  ];

  const revenueGoals = [
    { label: 'Booked', value: pipelineValue, goal: 120000 },
    { label: 'Collected', value: Math.round(pipelineValue * 0.55), goal: 120000 },
  ];

  const financeActions = [
    'Send follow-up on two outstanding invoices',
    'Schedule quarterly tax payment reminder',
    'Log contractor expenses from latest project',
  ];

  return (
    <Stack spacing={3}>
      <Typography variant="h6" fontWeight={700}>
        Freelancer finance assistant
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Track how {companyName} is performing this season, reserve cash for taxes, and keep invoices moving.
      </Typography>

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
              Annual revenue target
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {formatCurrency(pipelineValue)} booked
            </Typography>
            <Stack spacing={1}>
              {revenueGoals.map((goal) => {
                const progress = Math.min(100, Math.round((goal.value / goal.goal) * 100));
                return (
                  <Box key={goal.label}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">
                        {goal.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {progress}% of {formatCurrency(goal.goal)}
                      </Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                );
              })}
            </Stack>
            <Button size="small" variant="outlined">
              Update targets
            </Button>
          </Stack>
        </Paper>

        <Paper sx={{ p: 3, height: '100%' }}>
          <Stack spacing={2}>
            <Typography variant="subtitle2" color="text.secondary">
              Invoices to collect
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {outstandingInvoices} outstanding
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Avg invoice {formatCurrency(averageInvoice)} · Recommend sending reminders today.
            </Typography>
            <Divider />
            <Stack spacing={1}>
              {financeActions.slice(0, 2).map((action) => (
                <Stack key={action} direction="row" spacing={1} alignItems="center">
                  <Chip size="small" color="warning" label="Due" />
                  <Typography variant="body2" color="text.secondary">
                    {action}
                  </Typography>
                </Stack>
              ))}
            </Stack>
            <Button size="small" variant="outlined">
              Open invoice log
            </Button>
          </Stack>
        </Paper>

        <Paper sx={{ p: 3, height: '100%' }}>
          <Stack spacing={2}>
            <Typography variant="subtitle2" color="text.secondary">
              Suggested tax reserve
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {formatCurrency(recommendedTaxReserve)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Move 30% of collected revenue into a dedicated savings account to cover quarterly estimates.
            </Typography>
            <Divider />
            <Stack spacing={1}>
              {recurringExpenses.map((expense) => (
                <Stack key={expense.label} direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    {expense.label}
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatCurrency(expense.amount)}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Paper>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="subtitle1" fontWeight={700}>
            Weekly finance checklist
          </Typography>
          <Stack spacing={1.5}>
            {financeActions.map((action) => (
              <Stack key={action} direction="row" spacing={1} alignItems="center">
                <Chip size="small" color="default" label="Planned" />
                <Typography variant="body2" color="text.secondary">
                  {action}
                </Typography>
              </Stack>
            ))}
          </Stack>
          <Box>
            <Button size="small" variant="contained">
              Export summary
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default FreelancerFinanceWorkspace;
