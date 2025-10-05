'use client';

import { Typography, Box, useTheme } from '@mui/material';
import { useEffect, useState, useMemo } from 'react';
import { StripeClient } from 'lib/api/stripe';
import { SubscriptionPlanEnum } from 'types';

/**
 * DashboardPageClient renders the dashboard UI and allows the user to send a test email to themselves.
 * @param userEmail - The email address of the logged-in user.
 * @param userName - The full name of the logged-in user.
 */
export default function DashboardPageClient({ userEmail, userName }: { userEmail: string; userName: string }) {
  const [subscription, setSubscription] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const stripeApi = useMemo(() => new StripeClient(), []);
  const theme = useTheme();
  const subscriptionLabel = 'Your current subscription plan is: ';
  
  // Extract first name from full name, fallback to email if name is empty
  const getDisplayName = () => {
    if (userName && userName.trim()) {
      return userName.trim().split(' ')[0];
    }
    return userEmail.split('@')[0]; // Fallback to email username
  };

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const { subscription } = await stripeApi.getSubscription();
        // Set to plan name if found, else null
        setSubscription(subscription.length > 0 ? subscription[0].plan : null);
      } catch {
        setSubscription(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscription();
  }, [stripeApi]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="80vh"
    >
      <Typography variant="h4">Welcome back, {getDisplayName()}!</Typography>
      <Typography variant="h5" mt={2}>
        {loading ? (
          'Loading subscription...'
        ) : subscription === SubscriptionPlanEnum.FREE ? (
          <>
            {subscriptionLabel}{' '}
            <span
              style={{
                color: '#888',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: 1.5,
              }}
            >
              {subscription}
            </span>
          </>
        ) : subscription === SubscriptionPlanEnum.PRO ? (
          <>
            {subscriptionLabel}{' '}
            <span
              style={{
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 2,
                fontSize: '1.2rem',
                padding: '0.25em 0.75em',
                borderRadius: '1.5em',
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                color: '#fff',
                boxShadow: '0 2px 12px 0 rgba(31,162,255,0.15)',
                border: 'none',
                outline: 'none',
                display: 'inline-block',
                WebkitBackgroundClip: 'padding-box',
                backgroundClip: 'padding-box',
                transition: 'box-shadow 0.2s',
              }}
            >
              {subscription}
            </span>
          </>
        ) : (
          'Your current subscription plan is: None'
        )}
      </Typography>
    </Box>
  );
}
