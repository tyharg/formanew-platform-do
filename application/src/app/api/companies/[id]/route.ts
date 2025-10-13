import { withAuth } from 'lib/auth/withAuth';
import { getCompany } from './getCompany';
import { updateCompany } from './updateCompany';
import { deleteCompany } from './deleteCompany';

export const GET = withAuth(getCompany);
export const PUT = withAuth(updateCompany);
export const DELETE = withAuth(deleteCompany);
