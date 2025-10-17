import { Box, Button, Chip, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import Link from 'next/link';
import GetInvoiceButton from 'components/Pricing/GetInvoiceButton';

export const dynamic = 'force-dynamic';

type Plan = {
  name: string;
  description: string;
  price?: string;
  cadence?: string;
  buttonLabel: string;
  buttonVariant: 'contained' | 'outlined';
  buttonHref: string;
  features: string[];
  highlight?: boolean;
  badgeText?: string;
  supportingText?: string;
};

const plans: Plan[] = [
  {
    name: 'Free Tier',
    description: 'Perfect for testing the waters.',
    price: '$0',
    cadence: 'USD/year',
    buttonLabel: 'Sign up',
    buttonVariant: 'outlined',
    buttonHref: '/signup',
    features: [
      '1 company',
      'Up to 3 contracts',
      'Basic storefront',
      'Integrated payment processing',
    ],
  },
  {
    name: 'Incorporation',
    description: 'For freelancers and professionals who want to go legit with a real LLC.',
    price: '$129',
    cadence: 'USD/year per company',
    buttonLabel: 'Sign up',
    buttonVariant: 'contained',
    buttonHref: '/signup',
    features: [
      '1 incorporated company',
      'Unlimited contracts',
      'Client portal',
      'Basic storefront',
      'Integrated payment processing',
      'Access to EIN and formation assistance',
    ],
  },
  {
    name: 'Creator Plus',
    description: 'For creators who want a full online business presence.',
    buttonLabel: 'Coming Soon',
    buttonVariant: 'contained',
    buttonHref: '#',
    features: [
      '1 incorporated company',
      'Unlimited contracts & client portals',
      'Full Storefront',
      'Custom Domain',
      'Homepage editor with no-code customization',
      'Integrated payment processing',
    ],
    highlight: true,
    badgeText: 'Coming Soon',
  },
  {
    name: 'Developer Pro',
    description: 'For developers ready to deploy real products and SaaS apps.',
    buttonLabel: 'Coming Soon',
    buttonVariant: 'outlined',
    buttonHref: '#',
    features: [
      '1 incorporated company (additional companies $100/yr)',
      'Unlimited contracts & client portals',
      'Full Storefront + domain',
      'Jamstack app hosting platform (deploy apps, APIs, or web tools)',
      'Integrated payment processing (standard fees apply)',
    ],
    supportingText: 'Coming Soon',
  },
];

export default function PricingPage() {
  return (
    <Box
      component="section"
      sx={{
        bgcolor: '#f8f5ff',
        py: { xs: 8, md: 12 },
        px: 2,
      }}
    >
      <Box
        sx={{
          maxWidth: 1200,
          mx: 'auto',
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '2.5rem', md: '3rem' },
            fontWeight: 700,
            mb: 2,
          }}
        >
          Choose the plan that fits your needs.
        </Typography>
        <Typography
          variant="subtitle1"
          color="text.secondary"
          sx={{
            maxWidth: 560,
            mx: 'auto',
            mb: { xs: 6, md: 8 },
          }}
        >
          Discover flexible plans designed to help every team communicate with clarity and speed.
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gap: { xs: 3, md: 4 },
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
          }}
        >
          {plans.map((plan) => {
            const isHighlight = Boolean(plan.highlight);

            return (
              <Box
                key={plan.name}
                sx={{
                  position: 'relative',
                  p: { xs: 3, md: 4 },
                  textAlign: 'left',
                  borderRadius: 4,
                  bgcolor: '#fff',
                  border: '1px solid',
                  borderColor: isHighlight ? 'transparent' : '#e7e0ff',
                  boxShadow: isHighlight ? '0 24px 60px rgba(98, 82, 246, 0.25)' : '0 12px 30px rgba(15, 15, 30, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                  minHeight: 520,
                  '&::before': undefined,
                }}
              >
                <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 3, flexGrow: 1 }}>
                  {plan.badgeText && (
                    <Chip
                      label={plan.badgeText}
                      color="secondary"
                      size="small"
                      sx={{
                        alignSelf: 'flex-start',
                        fontWeight: 600,
                        bgcolor: '#f6f1ff',
                        color: '#4f3cf0',
                        mb: 1,
                      }}
                    />
                  )}

                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, fontSize: '1.75rem', mb: 1 }}>
                      {plan.name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {plan.description}
                    </Typography>
                  </Box>

                  <Box>
                    {plan.supportingText ? (
                      <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '2rem' }}>
                        {plan.supportingText}
                      </Typography>
                    ) : (
                      <>
                        <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '3rem', lineHeight: 1 }}>
                          {plan.price}
                        </Typography>
                        {plan.cadence && (
                          <Typography variant="subtitle2" color="text.secondary">
                            {plan.cadence}
                          </Typography>
                        )}
                      </>
                    )}
                  </Box>

                  <Button
                    variant={plan.buttonVariant}
                    component={Link}
                    href={plan.buttonHref}
                    size="large"
                    sx={{
                      borderRadius: 999,
                      px: 3,
                      py: 1.25,
                      fontWeight: 600,
                      ...(plan.buttonVariant === 'contained'
                        ? {
                            bgcolor: isHighlight ? '#4f3cf0' : '#111',
                            color: '#fff',
                            '&:hover': {
                              bgcolor: isHighlight ? '#4230d8' : '#222',
                            },
                          }
                        : {
                            borderColor: '#4f3cf0',
                            color: '#4f3cf0',
                            '&:hover': {
                              borderColor: '#4230d8',
                              color: '#4230d8',
                            },
                          }),
                    }}
                  >
                    {plan.buttonLabel}
                  </Button>

                  <List sx={{ pt: 1, pb: 0 }}>
                    {plan.features.map((feature) => (
                      <ListItem key={feature} sx={{ px: 0, py: 0.75 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckIcon sx={{ color: '#4f3cf0' }} />
                        </ListItemIcon>
                        <ListItemText
                          primaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                          primary={feature}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Box>
            );
          })}
        </Box>

        <Box sx={{ mt: { xs: 8, md: 10 }, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Need an invoice for your current subscription?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Generate and receive a professional invoice for your current plan via email.
          </Typography>
          <GetInvoiceButton variant="outlined" size="large" />
        </Box>
      </Box>
    </Box>
  );
}

