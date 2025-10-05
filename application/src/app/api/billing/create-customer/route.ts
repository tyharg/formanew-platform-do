import { withAuth } from 'lib/auth/withAuth';
import { createCustomer } from './createCustomer';

/**
 * POST route to create a customer in the billing service
 */
export const POST = withAuth(createCustomer);
