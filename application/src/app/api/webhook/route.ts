import { withStripeAuth } from 'lib/auth/stripe/withStripeAuth';
import { webhookHandler } from './webhookHandler';

/**
 * Handles incoming webhook requests form Stripe.
 *
 */
export const POST = withStripeAuth(webhookHandler);
