'use client';
import { SessionProvider } from 'next-auth/react';
import { UserProvider } from './UserContext';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { NavigatingProvider } from './Navigation';

/**
 * Global wrapper that groups all context providers used in the application.
 * Includes session, theme, user and navigation.
 *
 * @param children - Tree of components that will receive these contexts.
 */
export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <AppRouterCacheProvider options={{ enableCssLayer: true }}>
        <UserProvider>
          <NavigatingProvider>{children}</NavigatingProvider>
        </UserProvider>
      </AppRouterCacheProvider>
    </SessionProvider>
  );
};
