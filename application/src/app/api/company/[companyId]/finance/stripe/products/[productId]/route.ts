import { NextRequest, NextResponse } from 'next/server';
import { stripe, validateStripeAccountId } from '@/lib/stripe';
import { HTTP_STATUS } from '@/lib/api/http';
import { createDatabaseService } from 'services/database/databaseFactory';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ companyId: string; productId: string }> }
) {
  try {
    const { companyId, productId } = await params;
    const db = await createDatabaseService();
    const finance = await db.companyFinance.findByCompanyId(companyId);

    if (!finance?.stripeAccountId || !validateStripeAccountId(finance.stripeAccountId)) {
      return NextResponse.json(
        { error: 'Connect the company to Stripe before managing products.' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    await stripe.products.update(
      productId,
      { active: false },
      { stripeAccount: finance.stripeAccountId }
    );

    return NextResponse.json({ success: true }, { status: HTTP_STATUS.OK });
  } catch (error) {
    console.error('Failed to archive product for connected account:', error);
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to archive the product for the connected account.';
    return NextResponse.json({ error: message }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; productId: string }> }
) {
  try {
    const { companyId, productId } = await params;
    const body = await request.json().catch(() => ({}));
    const active = typeof body.active === 'boolean' ? body.active : null;

    if (active === null) {
      return NextResponse.json(
        { error: 'Provide an "active" boolean flag when updating a product.' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const db = await createDatabaseService();
    const finance = await db.companyFinance.findByCompanyId(companyId);

    if (!finance?.stripeAccountId || !validateStripeAccountId(finance.stripeAccountId)) {
      return NextResponse.json(
        { error: 'Connect the company to Stripe before managing products.' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const product = await stripe.products.update(
      productId,
      { active },
      { stripeAccount: finance.stripeAccountId }
    );

    return NextResponse.json(
      {
        success: true,
        product: {
          id: product.id,
          active: product.active,
        },
      },
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    console.error('Failed to update product for connected account:', error);
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to update the product for the connected account.';
    return NextResponse.json({ error: message }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}
