import { Box, Button, Chip, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import GetInvoiceButton from 'components/Pricing/GetInvoiceButton';

export const dynamic = 'force-dynamic';

type Plan = {
  name: string;
  description: string;
  price?: string;
  cadence?: string;
  buttonLabel?: string;
  buttonVariant?: 'contained' | 'outlined';
  buttonHref?: string;
  features: string[];
  highlight?: boolean;
  badgeText?: string;
  supportingText?: string;
};

const plans: Plan[] = [
  {
    name: 'Free Tier',
    description: 'Ideal for exploring and getting started with our services.',
    price: '$0 USD',
    cadence: '/year',
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
    description: 'Designed for contractors and professionals aiming to establish a legitimate LLC.',
    price: '$129 USD',
    cadence: '/year per company',
    buttonLabel: 'Sign up',
    buttonVariant: 'contained',
    buttonHref: '/signup',
    features: [
      'Includes everything in Free Tier, plus:',
      '1 incorporated company',
      'Unlimited contracts',
      'Client portal',
      'Access to EIN and formation assistance',
    ],
  },
  {
    name: 'Creator Plus',
    description: 'Perfect for creators seeking a comprehensive online business presence.',
    features: [
      'Includes everything in Incorporation, plus:',
      'Professional storefront',
      'Custom domain',
      'Homepage editor with no-code customization',
      'AI tools for content and layout suggestions',
    ],
    highlight: true,
    badgeText: 'Coming Soon',
  },
  {
    name: 'Developer Pro',
    description: 'For developers launching comprehensive products and SaaS apps.',
    features: [
      'Includes everything in Creator Plus, plus:',
      'Jamstack app hosting platform (deploy apps, APIs, or web tools)',
      'Developer dashboard and deployment manager',
      'API key management & environment variables',
      'Priority technical support',
    ],
    highlight: true,
    badgeText: 'Coming Soon',
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
            const buttonVariant = plan.buttonVariant ?? 'contained';
            const shouldRenderButton = Boolean(plan.buttonHref && plan.buttonLabel);

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
                  boxShadow: isHighlight ? '0 12px 30px rgba(98, 82, 246, 0.125)' : '0 12px 30px rgba(15, 15, 30, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                  minHeight: 520,
                  '&::before': undefined,
                }}
              >
                <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 3, flexGrow: 1 }}>
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
                        {plan.price ? (
                          <>
                            <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '2.5rem', lineHeight: 1 }}>
                              {plan.price}
                            </Typography>
                            {plan.cadence && (
                              <Typography variant="subtitle2" color="text.secondary">
                                {plan.cadence}
                              </Typography>
                            )}
                          </>
                        ) : (
                          plan.badgeText && (
                            <Chip
                              label={plan.badgeText}
                              color="secondary"
                              size="small"
                              sx={{
                                alignSelf: 'flex-start',
                                fontWeight: 600,
                                bgcolor: '#f6f1ff',
                                color: '#4f3cf0',
                                height: '2.5rem',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            />
                          )
                        )}
                      </>
                    )}
                  </Box>


                  <List sx={{ pt: 1, pb: 0 }}>
                    {plan.features.map((feature, index) => (
                      <ListItem key={feature} sx={{ px: 0, py: 0.75 }}>
                        {index === 0 ? (
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#4f3cf0' }}>
                            {feature}
                          </Typography>
                        ) : (
                          <>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <CheckIcon sx={{ color: '#4f3cf0' }} />
                            </ListItemIcon>
                            <ListItemText
                              primaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                              primary={feature}
                            />
                          </>
                        )}
                      </ListItem>
                    ))}
                  </List>
                </Box>
                {shouldRenderButton && plan.buttonHref && plan.buttonLabel && (
                  <Button
                    variant={buttonVariant}
                    size="large"
                    sx={{
                      borderRadius: 999,
                      px: 5,
                      py: 1.25,
                      fontWeight: 600,
                      mt: 2,
                      ...(buttonVariant === 'contained'
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
                )}
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

