import { withAuth } from 'lib/auth/withAuth';
import { cancelSubscription } from './cancelSubscription';

/**
 * POST route to cancel a subscription
 */
export const POST = withAuth(cancelSubscription);
