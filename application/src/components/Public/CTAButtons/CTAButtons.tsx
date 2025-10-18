import React from 'react';
import { Button, Stack } from '@mui/material';
import Link from 'next/link';
import { COLORS, DIMENSIONS } from 'constants/landing';

/**
 * CTAButtons component
 */
const CTAButtons = () => {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={DIMENSIONS.spacing.small} justifyContent="center">
      <Button
        component={Link}
        href="/signup"
        variant="contained"
        size="large"
        sx={{
          backgroundColor: COLORS.deploy,
          color: '#ffffff',
          px: 5,
          py: 1.75,
          fontWeight: 600,
          '&:hover': {
            backgroundColor: COLORS.deployHover,
          },
        }}
      >
        Get Started
      </Button>
    </Stack>
  );
};

export default CTAButtons;
