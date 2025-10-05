import { AuthService } from './auth';

/**
 * Factory function to create and return the appropriate auth client. Mainly used for tests
 */
export async function createAuthService(): Promise<AuthService> {
  const { NextAuthService } = await import('./nextAuthService');
  return new NextAuthService();
}
