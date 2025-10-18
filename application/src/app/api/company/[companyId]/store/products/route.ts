import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe, validateStripeAccountId } from '@/lib/stripe';
import { HTTP_STATUS } from '@/lib/api/http';
import { createDatabaseService } from 'services/database/databaseFactory';

const mapProducts = (products: Stripe.Product[]) =>
  products
    .filter((product) => product.metadata.displayOnStorefront === 'true')
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
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params;
    const db = await createDatabaseService();
    const company = await db.company.findById(companyId);

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: HTTP_STATUS.NOT_FOUND });
    }

    const finance = await db.companyFinance.findByCompanyId(companyId);
    const accountId = finance?.stripeAccountId ?? null;

    if (!accountId || !validateStripeAccountId(accountId)) {
      return NextResponse.json(
        {
          products: [],
          storefrontName: company.displayName || company.legalName || 'FormaNew Storefront',
          stripeAccountId: null,
        },
        { status: HTTP_STATUS.OK },
      );
    }

    const products = await stripe.products.list({ limit: 20, expand: ['data.default_price'] }, { stripeAccount: accountId });

    return NextResponse.json(
      {
        products: mapProducts(products.data),
        storefrontName: company.displayName || company.legalName || 'FormaNew Storefront',
        stripeAccountId: accountId,
      },
      { status: HTTP_STATUS.OK },
    );
  } catch (error) {
    console.error('Company storefront products error:', error);
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to fetch storefront products. Please try again later.';
    return NextResponse.json({ error: message }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}
