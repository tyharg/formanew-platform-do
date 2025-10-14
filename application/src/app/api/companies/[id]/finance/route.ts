import { withAuth } from 'lib/auth/withAuth';
import { getCompanyFinance } from './getCompanyFinance';
import { createCompanyFinance } from './createCompanyFinance';
import { updateCompanyFinance } from './updateCompanyFinance';

export const GET = withAuth(getCompanyFinance);
export const POST = withAuth(createCompanyFinance);
export const PUT = withAuth(updateCompanyFinance);
