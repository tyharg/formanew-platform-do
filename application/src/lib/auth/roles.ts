import { UserRole } from 'types';

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;

export const ALL_ROLES: UserRole[] = Object.values(USER_ROLES);
