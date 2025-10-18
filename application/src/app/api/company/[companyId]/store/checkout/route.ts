import { NextRequest, NextResponse } from 'next/server';
import { stripe, validateStripeAccountId } from '@/lib/stripe';
import { HTTP_STATUS } from '@/lib/api/http';
import { createDatabaseService } from 'services/database/databaseFactory';

const APPLICATION_FEE_PERCENT = 0.1;
const MIN_APPLICATION_FEE_CENTS = 100;

const getBaseUrl = (): string => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_BASE_URL is not set. Define it so Checkout can redirect after payment.');
  }
  return baseUrl;
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params;
    const db = await createDatabaseService();
    const finance = await db.companyFinance.findByCompanyId(companyId);

    if (!finance?.stripeAccountId || !validateStripeAccountId(finance.stripeAccountId)) {
      return NextResponse.json({ error: 'Storefront is not connected to Stripe.' }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    const { priceId } = await req.json();
    if (typeof priceId !== 'string' || priceId.length === 0) {
      return NextResponse.json({ error: 'Provide the connected account price ID to sell.' }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    const baseUrl = getBaseUrl();

    const price = await stripe.prices.retrieve(priceId, { stripeAccount: finance.stripeAccountId });
    const unitAmount = price.unit_amount ?? 0;
    const applicationFee = Math.max(Math.round(unitAmount * APPLICATION_FEE_PERCENT), MIN_APPLICATION_FEE_CENTS);

    const session = await stripe.checkout.sessions.create(
      {
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'payment',
        payment_intent_data: {
          application_fee_amount: applicationFee,
        },
        success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&companyId=${companyId}`,
        cancel_url: `${baseUrl}/company/${companyId}/store`,
      },
      { stripeAccount: finance.stripeAccountId }
    );

    return NextResponse.json({ url: session.url }, { status: HTTP_STATUS.OK });
  } catch (error) {
    console.error('Company storefront checkout error:', error);
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to create a Checkout session. Check the server logs for details.';
    return NextResponse.json({ error: message }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}
