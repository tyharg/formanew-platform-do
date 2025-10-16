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

    const db = await createDatabaseService();
    const finance = await db.companyFinance.findByCompanyId(companyId);

    if (!finance?.stripeAccountId || !validateStripeAccountId(finance.stripeAccountId)) {
      return NextResponse.json(
        { error: 'Connect the company to Stripe before managing products.' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const updatePayload: {
      name?: string;
      description?: string;
      active?: boolean;
      metadata?: { [key: string]: string };
    } = {};

    if (body.name !== undefined) {
      updatePayload.name = body.name;
    }
    if (body.description !== undefined) {
      updatePayload.description = body.description;
    }
    if (body.active !== undefined) {
      updatePayload.active = body.active;
    }
    if (body.displayOnStorefront !== undefined) {
      updatePayload.metadata = { displayOnStorefront: String(body.displayOnStorefront) };
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json(
        { error: 'Provide at least one field to update (name, description, or active).' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const product = await stripe.products.update(
      productId,
      updatePayload,
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
