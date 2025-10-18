'use client';

import React from 'react';
import { Alert, Box, Chip, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import { Company } from '@/lib/api/companies';
import { Incorporation, IncorporationStatus } from 'types';

interface IncorporationDetailsProps {
  company: Company;
  incorporation: Incorporation | null;
  isLoading?: boolean;
}

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

const DetailItem = ({ label, value, span = 1 }: { label: string; value: React.ReactNode; span?: 1 | 2 }) => (
  <Box sx={{ gridColumn: { xs: 'auto', md: span === 2 ? 'span 2' : 'auto' } }}>
    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
      {label}
    </Typography>
    <Typography variant="body2" color="text.primary">
      {value ?? '—'}
    </Typography>
  </Box>
);

const IncorporationDetails: React.FC<IncorporationDetailsProps> = ({ company, incorporation, isLoading = false }) => {
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (!incorporation) {
    return <Alert severity="info">No incorporation record found yet. Complete the filing flow to generate one.</Alert>;
  }

  const statusLabel = incorporation.status === IncorporationStatus.SUBMITTED ? 'Submitted' : 'Draft';
  const statusColor = incorporation.status === IncorporationStatus.SUBMITTED ? 'success' : 'default';

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h6" fontWeight={700}>
              Filing overview
            </Typography>
            <Chip size="small" color={statusColor} label={statusLabel} />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Review the captured information for {company.displayName || company.legalName}. These values are included in generated state packets and attestation documents.
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
            }}
          >
            <DetailItem label="LLC name" value={incorporation.llcName ?? company.legalName} />
            <DetailItem label="Doing business as" value={incorporation.dbaDifferent ? 'Yes' : 'No'} />
            <DetailItem label="Business subtype" value={incorporation.businessSubType} />
            <DetailItem label="Name reserved" value={incorporation.nameReserved ? 'Reserved' : 'Pending'} />
          </Box>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={700}>
            Business address
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
            }}
          >
            <DetailItem label="Principal address" value={incorporation.businessAddress?.principalAddress} />
            <DetailItem label="Principal city" value={incorporation.businessAddress?.principalCity} />
            <DetailItem label="Principal state" value={incorporation.businessAddress?.principalState} />
            <DetailItem label="Principal postal code" value={incorporation.businessAddress?.principalZip} />
            <DetailItem label="Business phone" value={incorporation.businessAddress?.businessPhone} />
            <DetailItem label="Business email" value={incorporation.businessAddress?.businessEmail} />
          </Box>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={700}>
            Company details
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
            }}
          >
            <DetailItem label="Formation state" value={incorporation.businessDetails?.formationState} />
            <DetailItem
              label="Effective date"
              value={formatDate(incorporation.businessDetails?.effectiveDate ?? null)}
            />
            <DetailItem label="Management structure" value={incorporation.businessDetails?.managementStructure} />
            <DetailItem label="Duration type" value={incorporation.companyDetails?.durationType} />
            <DetailItem
              label="Duration date"
              value={formatDate(incorporation.companyDetails?.durationDate ?? null)}
            />
            <DetailItem label="Purpose statement" value={incorporation.companyDetails?.purposeStatement} span={2} />
          </Box>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={700}>
            Primary contact & attestation
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
            }}
          >
            <DetailItem
              label="Primary contact"
              value={`${incorporation.primaryContact?.firstName ?? ''} ${incorporation.primaryContact?.lastName ?? ''}`.trim() || '—'}
            />
            <DetailItem label="Contact email" value={incorporation.primaryContact?.email} />
            <DetailItem label="Attestation signer" value={incorporation.attestation?.organizerName} />
            <DetailItem label="Date signed" value={formatDate(incorporation.attestation?.dateSigned ?? null)} />
            <DetailItem label="Attestation title" value={incorporation.attestation?.organizerTitle} />
            <DetailItem label="Signer capacity" value={incorporation.attestation?.signerCapacity} />
          </Box>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default IncorporationDetails;
