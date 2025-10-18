'use client';

import { Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import type { BusinessAddress, Incorporation } from 'types';

interface IncorporationDetailsPanelProps {
  incorporation: Incorporation | null;
}

const formatValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return '—';
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (value instanceof Date) {
    return value.toLocaleDateString();
  }
  return String(value);
};

const formatDate = (value: Date | string | null | undefined) => {
  if (!value) {
    return '—';
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString();
};

const formatAddress = (address?: BusinessAddress | null) => {
  if (!address) {
    return '—';
  }

  const parts = [
    address.principalAttention,
    address.principalAddress,
    address.principalSteAptFl,
    `${address.principalCity ?? ''} ${address.principalState ?? ''} ${address.principalZip ?? ''}`.trim(),
    address.principalCountry,
  ]
    .map((part) => (typeof part === 'string' ? part.trim() : ''))
    .filter(Boolean);

  return parts.length ? parts.join(', ') : '—';
};

const IncorporationDetailsPanel = ({ incorporation }: IncorporationDetailsPanelProps) => {
  if (!incorporation) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Incorporation details
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Complete the filing flow to unlock a read-only summary of your submitted information.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const {
    status,
    submittedAt,
    updatedAt,
    llcName,
    confirmLlcName,
    dbaDifferent,
    businessSubType,
    businessAddress,
    companyDetails,
    registeredAgent,
    attestation,
  } = incorporation;

  return (
    <Stack spacing={3}>
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6" fontWeight={600}>
                Filing status
              </Typography>
              <Chip
                label={status.replace('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                color={status === 'SUBMITTED' ? 'success' : 'default'}
                size="small"
              />
            </Stack>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  LLC name
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {formatValue(llcName || confirmLlcName)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Doing business as
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {dbaDifferent ? 'Different from LLC name' : 'Same as LLC name'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Last updated
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {formatDate(updatedAt as Date | string | null)}
                </Typography>
                {submittedAt ? (
                  <Typography variant="caption" color="text.secondary">
                    Submitted {formatDate(submittedAt as Date | string | null)}
                  </Typography>
                ) : null}
              </Grid>
            </Grid>
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Business profile
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Business subtype
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {formatValue(businessSubType)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Principal address
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {formatAddress(businessAddress)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Registered agent
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {formatValue(registeredAgent?.name)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatValue(registeredAgent?.address)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Agent jurisdiction
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {formatValue(registeredAgent?.formationLocale)}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Company details & attestation
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Duration type
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {formatValue(companyDetails?.durationType)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Duration date
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {formatDate(companyDetails?.durationDate ?? null)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Purpose statement
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {formatValue(companyDetails?.purposeStatement)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Organizer name
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {formatValue(attestation?.organizerName)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Signer capacity
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {formatValue(attestation?.signerCapacity)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Signed on
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {formatDate(attestation?.dateSigned ?? null)}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default IncorporationDetailsPanel;
