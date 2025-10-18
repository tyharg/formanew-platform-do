import { auth } from 'lib/auth/auth';
import CompanyIncorporationPageClient from '@/components/Companies/Incorporation/CompanyIncorporationPageClient';

export default async function IncorporationPage() {
  await auth();
  return <CompanyIncorporationPageClient />;
}
