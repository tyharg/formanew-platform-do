import React from 'react';
import type { Metadata } from 'next';
import { Box } from '@mui/material';
import HeroSection from 'components/Public/HeroSection/HeroSection';
import ApplicationPreview from 'components/Public/ApplicationPreview/ApplicationPreview';
import FeatureCards from 'components/Public/FeatureCards/FeatureCards';
import CTASection from 'components/Public/CTASection/CTASection';

export const metadata: Metadata = {
  title: 'FormaNew SaaS Starter Kit on DigitalOcean',
  description:
    'Explore FormaNew — a DigitalOcean-ready SaaS starter kit that includes authentication, billing, file storage, and AI integrations so you can launch faster.',
};

/**
 * Home page component
 */
const Home = () => {
  return (
    <Box component="main">
      <HeroSection />
      <ApplicationPreview />
      <FeatureCards />
      <CTASection />
    </Box>
  );
};

export default Home;
