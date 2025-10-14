'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import {
  CONTRACT_STATUS_OPTIONS,
  ContractStatus,
  CreateContractPayload,
  UpdateContractPayload,
} from 'lib/api/contracts';
import { useCompanySelection } from 'context/CompanySelectionContext';

type FormMode = 'create' | 'edit';

type ContractFormState = {
  companyId: string;
  title: string;
  counterpartyName: string;
  counterpartyEmail: string;
  contractValue: string;
  currency: string;
  status: ContractStatus;
  startDate: string;
  endDate: string;
  signedDate: string;
  paymentTerms: string;
  renewalTerms: string;
  description: string;
};

type FieldErrors = Partial<Record<keyof ContractFormState, string>>;

const dateInputValue = (value?: string | null) => {
  if (!value) return '';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
};

const sanitizeOptional = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

interface ContractFormProps {
  mode: FormMode;
  initialValues?: Partial<ContractFormState>;
  onSubmit: (payload: CreateContractPayload | UpdateContractPayload) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const DEFAULT_FORM_VALUES: ContractFormState = {
  companyId: '',
  title: '',
  counterpartyName: '',
  counterpartyEmail: '',
  contractValue: '',
  currency: 'USD',
  status: 'DRAFT',
  startDate: '',
  endDate: '',
  signedDate: '',
  paymentTerms: '',
  renewalTerms: '',
  description: '',
};

const ContractForm: React.FC<ContractFormProps> = ({
  mode,
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const { companies, selectedCompanyId, selectedCompany } = useCompanySelection();
  const [values, setValues] = useState<ContractFormState>(DEFAULT_FORM_VALUES);
  const [errors, setErrors] = useState<FieldErrors>({});

  const activeCompany = useMemo(() => {
    if (mode === 'edit' && initialValues?.companyId) {
      return companies.find((company) => company.id === initialValues.companyId) ?? null;
    }
    return selectedCompany ?? null;
  }, [companies, initialValues?.companyId, mode, selectedCompany]);

  useEffect(() => {
    const formatted: ContractFormState = {
      ...DEFAULT_FORM_VALUES,
      ...initialValues,
      contractValue:
        initialValues?.contractValue !== undefined && initialValues?.contractValue !== null
          ? String(initialValues.contractValue)
          : DEFAULT_FORM_VALUES.contractValue,
      currency: initialValues?.currency ?? 'USD',
      status: initialValues?.status ?? 'DRAFT',
      startDate: initialValues?.startDate ? dateInputValue(initialValues.startDate) : '',
      endDate: initialValues?.endDate ? dateInputValue(initialValues.endDate) : '',
      signedDate: initialValues?.signedDate ? dateInputValue(initialValues.signedDate) : '',
      paymentTerms: initialValues?.paymentTerms ?? '',
      renewalTerms: initialValues?.renewalTerms ?? '',
      description: initialValues?.description ?? '',
    };

    if (mode === 'edit' && initialValues?.companyId) {
      formatted.companyId = initialValues.companyId;
    } else {
      formatted.companyId = initialValues?.companyId ?? selectedCompanyId ?? '';
    }

    setValues(formatted);
    setErrors({});
  }, [initialValues, mode, selectedCompanyId]);

  const handleChange =
    (field: keyof ContractFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = event.target;
      setValues((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setValues((prev) => ({ ...prev, status: value as ContractStatus }));
  };

  const validate = (): boolean => {
    const nextErrors: FieldErrors = {};

    if (mode === 'create' && !(values.companyId || selectedCompanyId)) {
      nextErrors.companyId = 'Company is required';
    }
    if (!values.title.trim()) {
      nextErrors.title = 'Title is required';
    }
    if (!values.counterpartyName.trim()) {
      nextErrors.counterpartyName = 'Counterparty name is required';
    }

    if (values.contractValue.trim().length > 0) {
      const numericValue = Number(values.contractValue);
      if (Number.isNaN(numericValue)) {
        nextErrors.contractValue = 'Contract value must be a number';
      } else if (numericValue < 0) {
        nextErrors.contractValue = 'Contract value cannot be negative';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    const activeCompanyId = values.companyId || selectedCompanyId || '';
    if (!activeCompanyId) {
      setErrors((prev) => ({ ...prev, companyId: 'Company is required' }));
      return;
    }

    const basePayload: CreateContractPayload = {
      companyId: activeCompanyId,
      title: values.title.trim(),
      counterpartyName: values.counterpartyName.trim(),
      counterpartyEmail: sanitizeOptional(values.counterpartyEmail),
      contractValue:
        values.contractValue.trim().length > 0 ? Number(values.contractValue.trim()) : null,
      currency: sanitizeOptional(values.currency)?.toUpperCase() ?? null,
      status: values.status,
      startDate: values.startDate.trim().length ? values.startDate.trim() : null,
      endDate: values.endDate.trim().length ? values.endDate.trim() : null,
      signedDate: values.signedDate.trim().length ? values.signedDate.trim() : null,
      paymentTerms: sanitizeOptional(values.paymentTerms),
      renewalTerms: sanitizeOptional(values.renewalTerms),
      description: sanitizeOptional(values.description),
    };

    if (mode === 'create') {
      await onSubmit(basePayload);
    } else {
      const { companyId: _omitCompanyId, ...rest } = basePayload;
      await onSubmit(rest as UpdateContractPayload);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h6" fontWeight={600}>
            {mode === 'create' ? 'Create Contract' : 'Edit Contract'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {mode === 'create'
              ? 'Log the basics now. You can enrich the contract with terms and dates later.'
              : 'Provide key contract details to keep your pipeline organized.'}
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Company"
              value={activeCompany ? activeCompany.displayName || activeCompany.legalName : ''}
              InputProps={{ readOnly: true }}
              error={Boolean(errors.companyId)}
              helperText={
                errors.companyId
                  ? errors.companyId
                  : mode === 'edit'
                    ? 'Contracts remain associated with their original company.'
                    : !activeCompany
                        ? 'Select a company from the sidebar to assign this contract.'
                        : undefined
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Title"
              fullWidth
              required
              value={values.title}
              onChange={handleChange('title')}
              error={Boolean(errors.title)}
              helperText={errors.title}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Counterparty Name"
              fullWidth
              required
              value={values.counterpartyName}
              onChange={handleChange('counterpartyName')}
              error={Boolean(errors.counterpartyName)}
              helperText={errors.counterpartyName}
            />
          </Grid>

          <Grid item xs={12} sm={mode === 'create' ? 12 : 6}>
            <TextField
              label="Counterparty Email"
              fullWidth
              type="email"
              value={values.counterpartyEmail}
              onChange={handleChange('counterpartyEmail')}
            />
          </Grid>

          {mode === 'edit' && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Contract Value"
                  fullWidth
                  value={values.contractValue}
                  onChange={handleChange('contractValue')}
                  error={Boolean(errors.contractValue)}
                  helperText={errors.contractValue || 'Provide numeric value or leave blank'}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Currency"
                  fullWidth
                  value={values.currency}
                  onChange={handleChange('currency')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Status"
                  fullWidth
                  value={values.status}
                  onChange={handleStatusChange}
                >
                  {CONTRACT_STATUS_OPTIONS.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status.replace(/_/g, ' ')}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Signed Date"
                  type="date"
                  fullWidth
                  value={values.signedDate}
                  onChange={handleChange('signedDate')}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Start Date"
                  type="date"
                  fullWidth
                  value={values.startDate}
                  onChange={handleChange('startDate')}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="End Date"
                  type="date"
                  fullWidth
                  value={values.endDate}
                  onChange={handleChange('endDate')}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Payment Terms"
                  fullWidth
                  multiline
                  minRows={2}
                  value={values.paymentTerms}
                  onChange={handleChange('paymentTerms')}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Renewal Terms"
                  fullWidth
                  multiline
                  minRows={2}
                  value={values.renewalTerms}
                  onChange={handleChange('renewalTerms')}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Description / Notes"
                  fullWidth
                  multiline
                  minRows={3}
                  value={values.description}
                  onChange={handleChange('description')}
                />
              </Grid>
            </>
          )}
        </Grid>

        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button variant="outlined" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {mode === 'create' ? 'Create Contract' : 'Save Changes'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default ContractForm;
