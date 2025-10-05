import { withAuth } from 'lib/auth/withAuth';
import { createSubscription } from './createSubscription';

/**
 * POST route to create a subscription in billing service
 */
export const POST = withAuth(createSubscription);
