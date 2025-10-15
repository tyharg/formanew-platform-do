import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe, validateStripeAccountId } from '@/lib/stripe';
import { HTTP_STATUS } from '@/lib/api/http';
import { createDatabaseService } from 'services/database/databaseFactory';

const mapProducts = (products: Stripe.Product[]) =>
  products
    .map((product) => {
      const defaultPrice = product.default_price as Stripe.Price | string | null;
      const priceObject = typeof defaultPrice === 'object' && defaultPrice !== null ? defaultPrice : null;

      return {
        id: product.id,
        name: product.name,
        description: product.description ?? '',
        defaultPriceId: priceObject?.id ?? (typeof defaultPrice === 'string' ? defaultPrice : null),
        unitAmount: priceObject?.unit_amount ?? null,
        currency: priceObject?.currency ?? null,
        active: product.active,
      };
    })
    .filter((product) => product.defaultPriceId);

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params;
    const db = await createDatabaseService();
    const finance = await db.companyFinance.findByCompanyId(companyId);

    if (!finance?.stripeAccountId || !validateStripeAccountId(finance.stripeAccountId)) {
      return NextResponse.json(
        { error: 'Connect the company to Stripe first before listing products.' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const products = await stripe.products.list(
      { limit: 20, expand: ['data.default_price'] },
      { stripeAccount: finance.stripeAccountId }
    );

    return NextResponse.json({ products: mapProducts(products.data) }, { status: HTTP_STATUS.OK });
  } catch (error) {
    console.error('Failed to list products for connected account:', error);
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to list products for the connected account.';
    return NextResponse.json({ error: message }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params;
    const db = await createDatabaseService();
    const finance = await db.companyFinance.findByCompanyId(companyId);

    if (!finance?.stripeAccountId || !validateStripeAccountId(finance.stripeAccountId)) {
      return NextResponse.json(
        { error: 'Connect the company to Stripe before creating products.' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const body = await request.json().catch(() => ({}));
    const name: string | undefined = typeof body.name === 'string' ? body.name.trim() : undefined;
    const description: string | undefined = typeof body.description === 'string' ? body.description.trim() : undefined;
    const currency: string | undefined = typeof body.currency === 'string' ? body.currency.trim().toLowerCase() : undefined;
    const amountNumber = Number(body.amount);

    if (!name || !currency || !Number.isFinite(amountNumber)) {
      return NextResponse.json(
        { error: 'Provide a product name, currency, and price (e.g., 29.99).' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const priceInCents = Math.round(amountNumber * 100);

    const product = await stripe.products.create(
      {
        name,
        description,
        default_price_data: {
          unit_amount: priceInCents,
          currency,
        },
      },
      { stripeAccount: finance.stripeAccountId }
    );

    const defaultPrice = product.default_price as Stripe.Price | string | null;
    const priceId =
      typeof defaultPrice === 'string'
        ? defaultPrice
        : defaultPrice && typeof defaultPrice === 'object'
        ? defaultPrice.id ?? null
        : null;

    return NextResponse.json(
      {
        productId: product.id,
        priceId,
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
