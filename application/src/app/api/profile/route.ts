import { withAuth } from 'lib/auth/withAuth';
import { updateUserProfile } from './updateUserProfile';

export const PATCH = withAuth(updateUserProfile);
