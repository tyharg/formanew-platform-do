'use client';

import React, { useEffect, useState } from 'react';
import { Box, Button, Grid, Stack, TextField, Typography } from '@mui/material';
import { CreateCompanyPayload, UpdateCompanyPayload } from 'lib/api/companies';

type FormMode = 'create' | 'edit';

type CompanyFormState = {
  legalName: string;
  displayName: string;
  industry: string;
  ein: string;
  formationDate: string;
  website: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  description: string;
};

type FieldErrors = Partial<Record<keyof CompanyFormState, string>>;

const defaultState: CompanyFormState = {
  legalName: '',
  displayName: '',
  industry: '',
  ein: '',
  formationDate: '',
  website: '',
  phone: '',
  email: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  description: '',
};

const parseDateValue = (value?: string | null) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
};

const sanitizeString = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

interface CompanyFormProps {
  mode: FormMode;
  initialValues?: Partial<CompanyFormState>;
  onSubmit: (payload: CreateCompanyPayload | UpdateCompanyPayload) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const CompanyForm: React.FC<CompanyFormProps> = ({
  mode,
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [values, setValues] = useState<CompanyFormState>(defaultState);
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    setValues((prev) => ({
      ...prev,
      ...initialValues,
      formationDate: parseDateValue(initialValues?.formationDate ?? prev.formationDate),
    }));
    setErrors({});
  }, [initialValues]);

  const handleChange =
    (field: keyof CompanyFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = event.target;
      setValues((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

const validate = () => {
    const nextErrors: FieldErrors = {};
    const trimmedLegalName = values.legalName.trim();

    if (!trimmedLegalName) {
      nextErrors.legalName = 'Company name is required';
    }
    if (values.email.trim().length > 0 && !/^\S+@\S+\.\S+$/.test(values.email.trim())) {
      nextErrors.email = 'Invalid email address';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    const trimmedLegalName = values.legalName.trim();
    if (!trimmedLegalName) {
      return;
    }

    const sanitizedDisplayName = sanitizeString(values.displayName);

    const basePayload: CreateCompanyPayload = {
      legalName: trimmedLegalName,
      displayName: mode === 'create' ? sanitizedDisplayName ?? trimmedLegalName : sanitizedDisplayName,
      industry: sanitizeString(values.industry),
      ein: sanitizeString(values.ein),
      formationDate: values.formationDate.trim().length ? values.formationDate : null,
      website: sanitizeString(values.website),
      phone: sanitizeString(values.phone),
      email: sanitizeString(values.email),
      addressLine1: sanitizeString(values.addressLine1),
      addressLine2: sanitizeString(values.addressLine2),
      city: sanitizeString(values.city),
      state: sanitizeString(values.state),
      postalCode: sanitizeString(values.postalCode),
      country: sanitizeString(values.country),
      description: sanitizeString(values.description),
    };

    if (mode === 'create') {
      await onSubmit(basePayload);
    } else {
      const updatePayload: UpdateCompanyPayload = { ...basePayload };
      if (initialValues?.legalName?.trim() === trimmedLegalName) {
        delete updatePayload.legalName;
      }
      await onSubmit(updatePayload);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h6" fontWeight={600}>
            {mode === 'create' ? 'Add Company' : 'Edit Company'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {mode === 'create'
              ? 'Add the name now and update the rest of the company profile later.'
              : 'Store entity details and key contact info to keep your records organized.'}
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Company Name"
              fullWidth
              required
              value={values.legalName}
              onChange={handleChange('legalName')}
              error={Boolean(errors.legalName)}
              helperText={errors.legalName}
            />
          </Grid>

          {mode === 'edit' && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Display Name"
                  fullWidth
                  value={values.displayName}
                  onChange={handleChange('displayName')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Industry"
                  fullWidth
                  value={values.industry}
                  onChange={handleChange('industry')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField label="EIN" fullWidth value={values.ein} onChange={handleChange('ein')} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Formation Date"
                  type="date"
                  fullWidth
                  value={values.formationDate}
                  onChange={handleChange('formationDate')}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Website"
                  fullWidth
                  value={values.website}
                  onChange={handleChange('website')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone"
                  fullWidth
                  value={values.phone}
                  onChange={handleChange('phone')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  fullWidth
                  value={values.email}
                  onChange={handleChange('email')}
                  error={Boolean(errors.email)}
                  helperText={errors.email}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Address Line 1"
                  fullWidth
                  value={values.addressLine1}
                  onChange={handleChange('addressLine1')}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Address Line 2"
                  fullWidth
                  value={values.addressLine2}
                  onChange={handleChange('addressLine2')}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField label="City" fullWidth value={values.city} onChange={handleChange('city')} />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label="State/Province"
                  fullWidth
                  value={values.state}
                  onChange={handleChange('state')}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label="Postal Code"
                  fullWidth
                  value={values.postalCode}
                  onChange={handleChange('postalCode')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Country"
                  fullWidth
                  value={values.country}
                  onChange={handleChange('country')}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Description"
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
            {mode === 'create' ? 'Create Company' : 'Save Changes'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default CompanyForm;
