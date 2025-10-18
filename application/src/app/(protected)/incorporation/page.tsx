import { auth } from 'lib/auth/auth';
import IncorporationPage from 'components/Companies/Incorporation/IncorporationPage';

export default async function IncorporationRoute() {
  await auth();
  return <IncorporationPage />;
}
