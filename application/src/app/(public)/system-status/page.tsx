import SystemStatusPage from '../../../components/SystemStatus/SystemStatusPage';

/**
 * System Status page route for checking and displaying the status of all system services.
 */
export default function StatusPage() {
  return <SystemStatusPage />;
}

/**
 * Metadata for the Status page.
 */
export const metadata = {
  title: 'System Status',
  description: 'Check the status of all system services and their connectivity.',
};
