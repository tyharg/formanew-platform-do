import StorefrontPageClient from './StorefrontPageClient';

type PageProps = {
  params: Promise<{ accountId: string }>;
};

export default async function StorefrontPage({ params }: PageProps) {
  const { accountId } = await params;
  return <StorefrontPageClient accountId={accountId} />;
}
