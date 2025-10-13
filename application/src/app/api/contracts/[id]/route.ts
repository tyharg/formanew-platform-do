import { withAuth } from 'lib/auth/withAuth';
import { getContract } from './getContract';
import { updateContract } from './updateContract';
import { deleteContract } from './deleteContract';

export const GET = withAuth(getContract);
export const PUT = withAuth(updateContract);
export const DELETE = withAuth(deleteContract);
