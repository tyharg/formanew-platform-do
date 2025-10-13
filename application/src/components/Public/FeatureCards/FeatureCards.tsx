import React from 'react';
import { Typography, Box, Container, Stack, Card, CardContent } from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import DescriptionIcon from '@mui/icons-material/Description';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import { FEATURES, DIMENSIONS } from 'constants/landing';

const featureIcons = {
  'LLC Formation in Any State': (
    <PublicIcon sx={{ fontSize: DIMENSIONS.iconSize.large, color: FEATURES[0].color }} />
  ),
  'Registered Agent Included': (
    <AssignmentIndIcon sx={{ fontSize: DIMENSIONS.iconSize.large, color: FEATURES[1].color }} />
  ),
  'Fast EIN Setup': (
    <FingerprintIcon sx={{ fontSize: DIMENSIONS.iconSize.large, color: FEATURES[2].color }} />
  ),
  'Bank + Payments Setup': (
    <AccountBalanceIcon sx={{ fontSize: DIMENSIONS.iconSize.large, color: FEATURES[3].color }} />
  ),
  'Business Name Check': (
    <ManageSearchIcon sx={{ fontSize: DIMENSIONS.iconSize.large, color: FEATURES[4].color }} />
  ),
  'State Fee & Timeline Estimator': (
    <QueryStatsIcon sx={{ fontSize: DIMENSIONS.iconSize.large, color: FEATURES[5].color }} />
  ),
  'Compliance Autopilot': (
    <AutorenewIcon sx={{ fontSize: DIMENSIONS.iconSize.large, color: FEATURES[6].color }} />
  ),
  'Contracts & E-Sign': (
    <DescriptionIcon sx={{ fontSize: DIMENSIONS.iconSize.large, color: FEATURES[7].color }} />
  ),
  'Invoicing & Payouts': (
    <RequestQuoteIcon sx={{ fontSize: DIMENSIONS.iconSize.large, color: FEATURES[8].color }} />
  ),
};

/**
 * FeatureCards component
 */
const FeatureCards = () => {
  return (
    <Box component="section" py={DIMENSIONS.spacing.section} bgcolor="background.default" aria-labelledby="features-title" id="formation">
      <Container maxWidth="lg">
        <Stack spacing={DIMENSIONS.spacing.card}>
          <Box component="header">
            <Typography variant="h4" component="h3" id="features-title" fontWeight="bold" textAlign="center">
              What&apos;s included
            </Typography>
          </Box>
          <Box
            role="grid"
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: DIMENSIONS.spacing.stack,
            }}
          >
            {FEATURES.map((feature, idx) => (
              <Card component="article" key={idx} role="gridcell" sx={{ height: '100%' }}>
                <CardContent>
                  <Stack spacing={DIMENSIONS.spacing.stack} alignItems="center" textAlign="center">
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      width: DIMENSIONS.iconContainer.width,
                      height: DIMENSIONS.iconContainer.height,
                      borderRadius: 2,
                      bgcolor: 'grey.50',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}>
                      {featureIcons[feature.title as keyof typeof featureIcons]}
                    </Box>
                    <Box component="header">
                      <Typography variant="h6" component="h4" fontWeight="bold">
                        {feature.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default FeatureCards;
