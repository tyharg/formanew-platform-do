import { redirect, notFound } from 'next/navigation';
import { createDatabaseService } from 'services/database/databaseFactory';

type PageProps = {
  params: Promise<{ accountId: string }>;
};

export default async function LegacyStorefrontPage({ params }: PageProps) {
  const { accountId } = await params;
  const db = await createDatabaseService();
  const finance = await db.companyFinance.findByStripeAccountId(accountId);

  if (!finance) {
    notFound();
  }

  redirect(`/company/${finance.companyId}/store`);
}
