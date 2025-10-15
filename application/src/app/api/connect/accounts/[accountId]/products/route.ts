import { NextRequest, NextResponse } from 'next/server';
import { stripe, validateStripeAccountId } from '@/lib/stripe';
import type Stripe from 'stripe';
import { HTTP_STATUS } from '@/lib/api/http';

async function ensureAccountId(paramsPromise: Promise<{ accountId: string }>) {
  const { accountId } = await paramsPromise;
  if (!validateStripeAccountId(accountId)) {
    throw new Error('The accountId in the URL must be a valid Stripe Connect account ID (acct_...).');
  }
  return accountId;
}

/**
 * Lists products that live on the connected account by forwarding the
 * Stripe-Account header. This lets the platform keep its own catalog separate
 * from the connected account's catalog.
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ accountId: string }> }
) {
  try {
    const accountId = await ensureAccountId(context.params);

    const products = await stripe.products.list(
      { limit: 20, expand: ['data.default_price'] },
      { stripeAccount: accountId }
    );

    return NextResponse.json(
      {
        products: products.data.map((product) => {
          const defaultPrice = product.default_price as Stripe.Price | string | null;
          const priceObject = typeof defaultPrice === 'object' && defaultPrice !== null ? defaultPrice : null;
          return {
            id: product.id,
            name: product.name,
            description: product.description ?? '',
            defaultPriceId: priceObject?.id ?? (typeof defaultPrice === 'string' ? defaultPrice : null),
            unitAmount: priceObject?.unit_amount ?? null,
            currency: priceObject?.currency ?? null,
          };
        }),
      },
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    console.error('Failed to list products for connected account:', error);
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to list products for the connected account.';
    return NextResponse.json({ error: message }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}

/**
 * Creates a product (and default price) on the connected account. The platform
 * monetizes the charge later via the application fee in Checkout.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ accountId: string }> }
) {
  try {
    const accountId = await ensureAccountId(context.params);
    const body = await request.json().catch(() => ({}));

    const name: string | undefined = typeof body.name === 'string' ? body.name.trim() : undefined;
    const description: string | undefined = typeof body.description === 'string' ? body.description.trim() : undefined;
    const currency: string | undefined = typeof body.currency === 'string' ? body.currency.trim().toLowerCase() : undefined;
    const amount = Number(body.amount);

    if (!name || !currency || !Number.isFinite(amount)) {
      return NextResponse.json(
        {
          error:
            'Please provide a name, currency (e.g. usd), and amount in major units (e.g. 12.99) to create a product.',
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const priceInCents = Math.round(amount * 100);

    const product = await stripe.products.create(
      {
        name,
        description,
        default_price_data: {
          unit_amount: priceInCents,
          currency,
        },
      },
      {
        stripeAccount: accountId,
      }
    );

    return NextResponse.json(
      {
        productId: product.id,
        defaultPrice: product.default_price,
      },
      { status: HTTP_STATUS.CREATED }
    );
  } catch (error) {
    console.error('Failed to create product for connected account:', error);
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to create a product on the connected account.';
    return NextResponse.json({ error: message }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}
