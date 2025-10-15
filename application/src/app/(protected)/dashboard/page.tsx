import { auth } from 'lib/auth/auth';
import DashboardPageClient from './DashboardPageClient';

/**
 * Main dashboard page protected by authentication.
 * Displays a personalized message to the logged in user.
 *
 * @returns Page with centered greeting and session data.
 */
export default async function DashboardPage() {
  await auth();
  return <DashboardPageClient />;
}
