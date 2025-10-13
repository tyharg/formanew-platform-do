import { withAuth } from 'lib/auth/withAuth';
import { getCompanies } from './getCompanies';
import { createCompany } from './createCompany';

export const GET = withAuth(getCompanies);

export const POST = withAuth(createCompany);
