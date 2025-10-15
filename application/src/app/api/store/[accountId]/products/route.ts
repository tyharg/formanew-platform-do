import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe, validateStripeAccountId } from '@/lib/stripe';
import { HTTP_STATUS } from '@/lib/api/http';

const mapProducts = (products: Stripe.Product[]) =>
  products
    .map((product) => {
      const defaultPrice = product.default_price as Stripe.Price | string | null;
      const priceObject = typeof defaultPrice === 'object' && defaultPrice !== null ? defaultPrice : null;

      return {
        id: product.id,
        name: product.name,
        description: product.description ?? 'No description provided.',
        priceId: priceObject?.id ?? (typeof defaultPrice === 'string' ? defaultPrice : null),
        unitAmount: priceObject?.unit_amount ?? null,
        currency: priceObject?.currency ?? null,
      };
    })
    .filter((product) => product.priceId !== null);

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const { accountId } = await params;

    if (!validateStripeAccountId(accountId)) {
      return NextResponse.json(
        { error: 'The accountId in the URL must be a valid Stripe Connect account ID (acct_...).' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const products = await stripe.products.list(
      { limit: 20, expand: ['data.default_price'] },
      { stripeAccount: accountId }
    );

    return NextResponse.json({ products: mapProducts(products.data) }, { status: HTTP_STATUS.OK });
  } catch (error) {
    console.error('Stripe Product Fetch Error:', error);
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to fetch products from the connected account.';
    return NextResponse.json({ error: message }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}
