'use client';

import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import { Box, Button, Stack, Switch, TextField, Typography, FormControlLabel } from '@mui/material';
import { CreateCompanyContactPayload, UpdateCompanyContactPayload, CompanyContact } from 'lib/api/companies';

type FormMode = 'create' | 'edit';

type ContactFormState = {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  isPrimary: boolean;
};

type FieldErrors = Partial<Record<keyof ContactFormState, string>>;

const defaultState: ContactFormState = {
  fullName: '',
  title: '',
  email: '',
  phone: '',
  isPrimary: false,
};

const sanitize = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

interface CompanyContactFormProps {
  mode: FormMode;
  companyId: string;
  initialValues?: CompanyContact;
  onSubmit: (
    payload: CreateCompanyContactPayload | UpdateCompanyContactPayload,
    contactId?: string
  ) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const CompanyContactForm: React.FC<CompanyContactFormProps> = ({
  mode,
  companyId,
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [values, setValues] = useState<ContactFormState>(defaultState);
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (initialValues) {
      setValues({
        fullName: initialValues.fullName,
        title: initialValues.title ?? '',
        email: initialValues.email ?? '',
        phone: initialValues.phone ?? '',
        isPrimary: initialValues.isPrimary,
      });
    } else {
      setValues(defaultState);
    }
    setErrors({});
  }, [initialValues]);

  const handleChange =
    (field: keyof ContactFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value =
        field === 'isPrimary'
          ? (event.target as HTMLInputElement).checked
          : event.target.value;
      setValues((prev) => ({ ...prev, [field]: value as never }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const validate = () => {
    const nextErrors: FieldErrors = {};
    if (!values.fullName.trim()) {
      nextErrors.fullName = 'Name is required';
    }
    if (values.email.trim().length > 0 && !/^\S+@\S+\.\S+$/.test(values.email.trim())) {
      nextErrors.email = 'Invalid email';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    const payload: CreateCompanyContactPayload = {
      companyId,
      fullName: values.fullName.trim(),
      title: sanitize(values.title),
      email: sanitize(values.email),
      phone: sanitize(values.phone),
      isPrimary: values.isPrimary,
    };

    if (mode === 'create') {
      await onSubmit(payload);
    } else if (initialValues) {
      const { companyId: _omit, ...updatePayload } = payload;
      await onSubmit(updatePayload as UpdateCompanyContactPayload, initialValues.id);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h6" fontWeight={600}>
            {mode === 'create' ? 'Add Contact' : 'Edit Contact'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {mode === 'create'
              ? 'Capture who we should reach out to. You can flesh out the profile later.'
              : 'Keep track of your champions, decision makers, and day-to-day contacts.'}
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid size={12}>
            <TextField
              label="Full Name"
              fullWidth
              required
              value={values.fullName}
              onChange={handleChange('fullName')}
              error={Boolean(errors.fullName)}
              helperText={errors.fullName}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: mode === 'create' ? 12 : 6 }}>
            <TextField
              label="Email"
              fullWidth
              value={values.email}
              onChange={handleChange('email')}
              error={Boolean(errors.email)}
              helperText={errors.email}
            />
          </Grid>

          {mode === 'edit' && (
            <>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Title"
                  fullWidth
                  value={values.title}
                  onChange={handleChange('title')}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Phone"
                  fullWidth
                  value={values.phone}
                  onChange={handleChange('phone')}
                />
              </Grid>
              <Grid size={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={values.isPrimary}
                      onChange={(event) =>
                        setValues((prev) => ({ ...prev, isPrimary: event.target.checked }))
                      }
                    />
                  }
                  label="Primary relationship owner"
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
            {mode === 'create' ? 'Save Contact' : 'Save Changes'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default CompanyContactForm;
