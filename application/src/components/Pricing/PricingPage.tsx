'use client';

import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import PageContainer from '@/components/Common/PageContainer/PageContainer';

const tiers = [
  {
    title: 'Free Tier',
    price: '0',
    description: 'Perfect for testing the waters.',
    features: [
      '1 company',
      'Up to 3 contracts',
      'Basic storefront (Nanomarket Lite)',
      'Integrated payment processing (standard fees apply)',
    ],
    buttonText: 'Get Started',
    buttonVariant: 'outlined',
    disabled: false,
  },
  {
    title: 'Incorporation',
    price: '100',
    description: 'For freelancers and professionals who want to go legit with a real LLC.',
    features: [
      '1 incorporated company',
      'Unlimited contracts & client portals',
      'Basic storefront (Nanomarket Lite)',
      'Integrated payment processing (standard fees apply)',
      'Access to EIN and formation assistance',
    ],
    buttonText: 'Choose Plan',
    buttonVariant: 'contained',
    disabled: false,
  },
  {
    title: 'Creator Plus',
    price: '200',
    priceDetails: '/ year first company, $100 / year additional',
    description: 'For creators who want a full online business presence.',
    features: [
      '1 incorporated company (additional companies $100/yr)',
      'Unlimited contracts & client portals',
      'Full Nanomarket (custom domain + full e-commerce)',
      'Homepage editor with AI (no-code customization)',
      'Integrated payment processing (standard fees apply)',
    ],
    buttonText: 'Coming Soon',
    buttonVariant: 'contained',
    disabled: true,
  },
  {
    title: 'Developer Pro',
    price: '300',
    priceDetails: '/ year first company, $100 / year additional',
    description: 'For developers ready to deploy real products and SaaS apps.',
    features: [
      '1 incorporated company (additional companies $100/yr)',
      'Unlimited contracts & client portals',
      'Full Nanomarket + domain',
      'Homepage editor with AI',
      'Jamstack app hosting platform (deploy apps, APIs, or web tools)',
      'Integrated payment processing (standard fees apply)',
    ],
    buttonText: 'Coming Soon',
    buttonVariant: 'contained',
    disabled: true,
  },
];

const PricingPage: React.FC = () => {
  return (
    <PageContainer title="Pricing">
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        <Typography variant="h2" component="h1" align="center" gutterBottom>
          Pricing Plans
        </Typography>
        <Typography variant="h5" align="center" color="text.secondary" paragraph>
          Choose the plan that&apos;s right for you.
        </Typography>
        <Box
          sx={{
            mt: 4,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          {tiers.map((tier) => (
            <Box key={tier.title} sx={{ width: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(25% - 24px)' } }}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  borderRadius: '10px',
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 20px rgba(0,0,0,0.12)' },
                  minHeight: '450px', // Fixed height for consistent card size
                }}
              >
                <Box
                  sx={{
                    bgcolor: (theme) => theme.palette.primary.main,
                    color: 'primary.contrastText',
                    p: 2,
                    borderTopLeftRadius: '10px',
                    borderTopRightRadius: '10px',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                    {tier.title}
                  </Typography>
                </Box>
                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'baseline',
                      justifyContent: 'center',
                      my: 1,
                    }}
                  >
                    <Typography variant="h4" component="h3" sx={{ fontWeight: 'bold' }}>
                      ${tier.price}
                    </Typography>
                    <Typography variant="subtitle1" ml={1}>
                      / year
                    </Typography>
                  </Box>
                  {tier.priceDetails && (
                    <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mb={1}>
                      {tier.priceDetails}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, minHeight: 40, textAlign: 'center' }}>
                    {tier.description}
                  </Typography>
                  <List sx={{ mt: 2 }}>
                    {tier.features.map((feature) => (
                      <ListItem key={feature} disableGutters sx={{ py: 0.25 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={feature} primaryTypographyProps={{ variant: 'body2' }} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
                <Box sx={{ p: 2, pt: 0, mt: 'auto' }}>
                  <Button
                    fullWidth
                    variant={tier.buttonVariant as 'outlined' | 'contained'}
                    color="primary"
                    disabled={tier.disabled}
                    size="small"
                  >
                    {tier.buttonText}
                  </Button>
                </Box>
              </Card>
            </Box>
          ))}
        </Box>
      </Container>
    </PageContainer>
  );
};

export default PricingPage;
