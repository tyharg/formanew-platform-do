import { withAuth } from 'lib/auth/withAuth';
import { generateInvoiceStorageHandler } from './handler';

export const POST = withAuth(generateInvoiceStorageHandler);
