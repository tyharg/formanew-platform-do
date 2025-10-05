'use client';

import React from 'react';
import { Box } from '@mui/material';
import UpdatePasswordForm from './UpdatePasswordForm/UpdatePasswordForm';
import ProfileUpdateForm from './ProfileUpdateForm/ProfileUpdateForm';
import PageContainer from '../Common/PageContainer/PageContainer';

/**
 * User account configuration page.
 * Contains profile update form and password change form.
 */
export default function AccountSettings() {
  return (
    <PageContainer title="Account Settings">
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: { xs: 2, sm: 3 },
        }}
      >
        <ProfileUpdateForm />
        <UpdatePasswordForm />
      </Box>
    </PageContainer>
  );
}
