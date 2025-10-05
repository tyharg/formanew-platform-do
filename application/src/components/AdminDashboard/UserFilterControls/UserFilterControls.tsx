import React from 'react';
import { Stack, TextField, MenuItem } from '@mui/material';
import { SubscriptionStatusEnum, SubscriptionPlanEnum } from '../../../types';

interface UserFilterControlsProps {
  searchName: string;
  setSearchName: (value: string) => void;
  filterPlan: string;
  setFilterPlan: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  setPage: (value: number) => void;
}

/**
 * UserFilterControls renders filter controls for searching and filtering users by name, plan, and status.
 */
const UserFilterControls: React.FC<UserFilterControlsProps> = ({
  searchName,
  setSearchName,
  filterPlan,
  setFilterPlan,
  filterStatus,
  setFilterStatus,
  setPage,
}) => (
  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={3} alignItems="center">
    <TextField
      label="Search by name"
      size="small"
      fullWidth
      sx={{
        color: 'grey.500',
        maxWidth: { md: 300 },
        '& .MuiFormLabel-root': { color: 'text.medium' },
      }}
      value={searchName}
      onChange={(e) => {
        setSearchName(e.target.value);
        setPage(1);
      }}
    />
    <TextField
      select
      label="Filter by plan"
      size="small"
      fullWidth
      sx={{ maxWidth: { md: 200 }, '& .MuiFormLabel-root': { color: 'text.medium' } }}
      value={filterPlan}
      onChange={(e) => {
        setFilterPlan(e.target.value);
        setPage(1);
      }}
      slotProps={{ htmlInput: { 'data-testid': 'plan-select' } }}
    >
      <MenuItem value="">All</MenuItem>
      {Object.values(SubscriptionPlanEnum).map((plan) => (
        <MenuItem key={plan} value={plan}>
          {plan}
        </MenuItem>
      ))}
    </TextField>
    <TextField
      select
      label="Filter by status"
      size="small"
      fullWidth
      sx={{ maxWidth: { md: 200 }, '& .MuiFormLabel-root': { color: 'text.medium' } }}
      value={filterStatus}
      onChange={(e) => {
        setFilterStatus(e.target.value);
        setPage(1);
      }}
      slotProps={{ htmlInput: { 'data-testid': 'status-select' } }}
    >
      <MenuItem value="">All</MenuItem>
      {Object.values(SubscriptionStatusEnum).map((status) => (
        <MenuItem key={status} value={status}>
          {status}
        </MenuItem>
      ))}
    </TextField>
  </Stack>
);

export default UserFilterControls;
