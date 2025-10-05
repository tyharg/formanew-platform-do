import { withAuth } from 'lib/auth/withAuth';
import { updatePassword } from './updatePassword';

export const PATCH = withAuth(updatePassword);
