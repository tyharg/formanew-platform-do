import { withAuth } from 'lib/auth/withAuth';
import { getContracts } from './getContracts';
import { createContract } from './createContract';

export const GET = withAuth(getContracts);
export const POST = withAuth(createContract);
