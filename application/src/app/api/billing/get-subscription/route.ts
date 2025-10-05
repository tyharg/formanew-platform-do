import { withAuth } from 'lib/auth/withAuth';
import { getSubscription } from './getSubscription';

/**
 * GET route to get a subscription data
 */
export const GET = withAuth(getSubscription);
