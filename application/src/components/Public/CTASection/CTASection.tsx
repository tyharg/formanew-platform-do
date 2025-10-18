import React from 'react';
import { Box, Container, Stack } from '@mui/material';
import CTAButtons from 'components/Public/CTAButtons/CTAButtons';
import { DIMENSIONS } from 'constants/landing';

/**
 * CTASection component
 */
const CTASection = () => {
  return (
    <Box component="section" py={DIMENSIONS.spacing.section} bgcolor="grey.50">
      <Container maxWidth="md">
        <Stack spacing={DIMENSIONS.spacing.container} textAlign="center">
          <Box component="nav" aria-label="Get started actions">
            <CTAButtons />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default CTASection;
