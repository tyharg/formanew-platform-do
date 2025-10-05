import { withAuth } from 'lib/auth/withAuth';
import { checkout } from './checkout';

/**
 * POST route to initialize the checkout process to upgrade to PRO plan
 */
export const POST = withAuth(checkout);
