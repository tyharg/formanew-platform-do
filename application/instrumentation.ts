/**
 * Next.js Instrumentation Hook
 *
 * This file is automatically called by Next.js during application startup.
 * It's the proper place for one-time initialization tasks.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  // Only run on server side and not during build
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { StatusService } = await import('./src/services/status/statusService');
      await StatusService.initialize();
    } catch (error) {
      console.error('Failed to initialize application during startup:', error);
    }
  }
}
