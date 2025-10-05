import React from 'react';
import { Button, Stack } from '@mui/material';
import Link from 'next/link';
import GitHubIcon from '@mui/icons-material/GitHub';
import LaunchIcon from '@mui/icons-material/Launch';
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
        startIcon={<GitHubIcon />}
        sx={{
          backgroundColor: COLORS.github,
          color: '#ffffff',
          '&:hover': {
            backgroundColor: COLORS.githubHover,
          },
        }}
      >
        View the code
      </Button>
      <Button
        component={Link}
        href={URLS.deployment}
        target="_blank"
        rel="noopener noreferrer"
        variant="contained"
        size="large"
        startIcon={<LaunchIcon />}
        sx={{
          backgroundColor: COLORS.deploy,
          color: '#ffffff',
          '&:hover': {
            backgroundColor: COLORS.deployHover,
          },
        }}
      >
        Deploy to DigitalOcean
      </Button>
    </Stack>
  );
};

export default CTAButtons;