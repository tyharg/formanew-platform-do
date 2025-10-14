'use client';

import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import UpdatePasswordForm from './UpdatePasswordForm/UpdatePasswordForm';
import ProfileUpdateForm from './ProfileUpdateForm/ProfileUpdateForm';
import PageContainer from '../Common/PageContainer/PageContainer';
// Removed: import CompanyFinanceSettings from './CompanyFinanceSettings/CompanyFinanceSettings';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: { xs: 1, sm: 3 } }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

/**
 * User account configuration page.
 * Contains profile update form and password change form.
 */
export default function AccountSettings() {
  // Keeping tab structure for potential future user-specific tabs, but only showing 'Account' (index 0)
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <PageContainer title="Settings">
      <Box sx={{ width: '100%', typography: 'body1' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="settings tabs">
            <Tab label="Account" {...a11yProps(0)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
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
        </CustomTabPanel>
      </Box>
    </PageContainer>
  );
}
