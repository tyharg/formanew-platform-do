import React from 'react';
import { Button, Stack } from '@mui/material';
import Link from 'next/link';
import { COLORS, URLS, DIMENSIONS } from 'constants/landing';

/**
 * CTAButtons component
 */
const CTAButtons = () => {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={DIMENSIONS.spacing.small} justifyContent="center">
      <Button
        component={Link}
        href={URLS.githubRepo}
        target="_blank"
        rel="noopener noreferrer"
        variant="contained"
        size="large"
        sx={{
          backgroundColor: COLORS.github,
          color: '#ffffff',
          px: 4,
          py: 1.5,
          '&:hover': {
            backgroundColor: COLORS.githubHover,
          },
        }}
      >
        Learn more
      </Button>
      <Button
        component={Link}
        href="#formation"
        variant="contained"
        size="large"
        sx={{
          backgroundColor: COLORS.deploy,
          color: '#ffffff',
          px: 4,
          py: 1.5,
          '&:hover': {
            backgroundColor: COLORS.deployHover,
          },
        }}
      >
        Get Started
      </Button>
      <Button
        component={Link}
        href="/client-portal"
        variant="outlined"
        size="large"
        sx={{
          borderColor: COLORS.deploy,
          color: COLORS.deploy,
          px: 4,
          py: 1.5,
          '&:hover': {
            borderColor: COLORS.deployHover,
            backgroundColor: 'rgba(35, 197, 142, 0.08)',
          },
        }}
      >
        Client Portal
      </Button>
    </Stack>
  );
};

export default CTAButtons;
