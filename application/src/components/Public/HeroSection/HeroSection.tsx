import React from 'react';
import { Typography, Box, Container } from '@mui/material';
import FormationCarousel from 'components/Public/FormationCarousel/FormationCarousel';
import CTAButtons from 'components/Public/CTAButtons/CTAButtons';
import { DIMENSIONS } from 'constants/landing';

/**
 * HeroSection component
 */
const HeroSection = () => {
  return (
    <Box component="section" bgcolor="background.default" py={DIMENSIONS.spacing.section} aria-labelledby="hero-title">
      <Container maxWidth="lg">
        <Box sx={{ 
          position: 'relative',
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          alignItems: { xs: 'center', lg: 'flex-start' },
          gap: DIMENSIONS.spacing.container
        }}>
          {/* Formation carousel */}
          <Box
            component="aside"
            aria-label="Company journey overview"
            sx={{ order: { xs: 2, lg: 2 }, mt: { xs: DIMENSIONS.spacing.container, lg: 0 } }}
          >
            <FormationCarousel />
          </Box>
          
          {/* Main hero content */}
          <Box component="header" sx={{ 
            order: { xs: 1, lg: 1 },
            flex: 1,
            minWidth: 0,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: DIMENSIONS.spacing.container,
            height: '100%',
            justifyContent: 'space-between'
          }}>
            <Typography
              variant="h1"
              component="h1"
              id="hero-title"
              fontWeight="bold"
              sx={{
                textAlign: 'center',
                width: '100%'
              }}
            >
              FormaNew
            </Typography>
            <Typography
              variant="h3"
              component="h2"
              fontWeight="bold"
              color="primary.main"
              sx={{
                textAlign: 'center',
                width: '100%'
              }}
            >
              The flagship platform for modern incorporation and the future of work
            </Typography>
            <Typography
              variant="h6"
              component="p"
              color="text.secondary"
              sx={{
                maxWidth: DIMENSIONS.layout.maxContentWidth,
                mx: 'auto',
                textAlign: 'center',
                width: '100%'
              }}
            >
              Launch your digital brand in record time with our elegant, ready-to-use workspace. From guided filings and EIN automation to embedded payments and client-ready tools, FormaNew keeps your incorporation on track while preparing your team for the future of work.
            </Typography>
            <Box component="nav" aria-label="Primary actions">
              <CTAButtons />
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection;
