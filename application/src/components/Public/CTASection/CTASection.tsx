import React from 'react';
import { Typography, Box, Container, Stack } from '@mui/material';
import CTAButtons from 'components/Public/CTAButtons/CTAButtons';
import { DIMENSIONS } from 'constants/landing';

/**
 * CTASection component
 */
const CTASection = () => {
  return (
    <Box component="section" py={DIMENSIONS.spacing.section} bgcolor="grey.50" aria-labelledby="cta-title">
      <Container maxWidth="md">
        <Stack spacing={DIMENSIONS.spacing.container} textAlign="center">
          <Box component="header">
            <Typography variant="h4" component="h3" id="cta-title" fontWeight="bold">
              Form your company and build your business in one workspace
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Incorporate, open accounts, and launch client experiences without juggling tools. FormaNew keeps filings, finance, and growth initiatives moving in sync.
            </Typography>
          </Box>
          <Box component="nav" aria-label="Get started actions">
            <CTAButtons />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default CTASection;