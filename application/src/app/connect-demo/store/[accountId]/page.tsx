import { stripe, validateStripeAccountId } from '@/lib/stripe';
import type Stripe from 'stripe';
import ConnectStorefrontClient from './StorefrontClient';

export const metadata = {
  title: 'Connected Storefront',
};

function mapProducts(products: Stripe.Product[]): Array<{
  id: string;
  name: string;
  description: string;
  priceId: string;
  unitAmount: number;
  currency: string;
}> {
  return products
    .map((product) => {
      const defaultPrice = product.default_price as Stripe.Price | string | null;
      const priceObject = typeof defaultPrice === 'object' && defaultPrice !== null ? defaultPrice : null;
      return {
        id: product.id,
        name: product.name,
        description: product.description ?? 'No description provided.',
        priceId: priceObject?.id ?? (typeof defaultPrice === 'string' ? defaultPrice : ''),
        unitAmount: priceObject?.unit_amount ?? 0,
        currency: priceObject?.currency ?? 'usd',
      };
    })
    .filter((product) => product.priceId);
}

export default async function ConnectedStorePage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;

  if (!validateStripeAccountId(accountId)) {
    throw new Error('The accountId in the URL must be a valid Stripe Connect account ID (acct_...).');
  }

  const productList = await stripe.products.list(
    { limit: 20, expand: ['data.default_price'] },
    { stripeAccount: accountId }
  );

  const products = mapProducts(productList.data);

  return (
    <ConnectStorefrontClient
      accountId={accountId}
      products={products}
      note="For demo purposes we use the Stripe account ID in the URL. In production, map it to a stable slug or your own company identifier."
    />
  );
}
