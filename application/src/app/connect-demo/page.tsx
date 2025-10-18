import type { Metadata } from 'next';
import ConnectDemoClient from './ConnectDemoClient';

export const metadata: Metadata = {
  title: 'Stripe Connect Demo | FormaNew Integrations',
  description:
    'Walk through the embedded Stripe Connect onboarding experience bundled with FormaNew to understand how platform payouts are implemented.',
  keywords: ['Stripe Connect onboarding', 'platform payments demo', 'FormaNew integrations'],
};

export default function ConnectDemoPage() {
  return <ConnectDemoClient />;
}
