import { NextRequest, NextResponse } from 'next/server';
import { stripe, validateStripeAccountId } from '@/lib/stripe';
import { HTTP_STATUS } from '@/lib/api/http';

const APPLICATION_FEE_PERCENT = 0.1; // 10% platform fee for the sample.
const MIN_APPLICATION_FEE_CENTS = 100; // $1.00 minimum.

function getBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) {
    throw new Error(
      'NEXT_PUBLIC_BASE_URL is not configured. Set it so Checkout knows where to redirect after payment.'
    );
  }
  return baseUrl;
}

export async function POST(
  request: NextRequest,
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

    const body = await request.json().catch(() => ({}));
    const priceId: string | undefined = typeof body.priceId === 'string' ? body.priceId : undefined;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Include the default price ID for the product you want to sell.' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const successUrlBase = getBaseUrl();

    // Collect the application fee from the amount the customer pays. The
    // connected account receives the remainder immediately because this is a
    // Direct Charge.
    const price = await stripe.prices.retrieve(priceId, { stripeAccount: accountId });
    const unitAmount = price.unit_amount ?? 0;

    const feeAmount = Math.max(
      Math.round(unitAmount * APPLICATION_FEE_PERCENT),
      MIN_APPLICATION_FEE_CENTS
    );

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
          application_fee_amount: feeAmount,
        },
        success_url: `${successUrlBase}/success?session_id={CHECKOUT_SESSION_ID}&accountId=${accountId}`,
        cancel_url: `${successUrlBase}/connect-demo/store/${accountId}?status=cancelled`,
      },
      {
        stripeAccount: accountId,
      }
    );

    return NextResponse.json({ url: session.url }, { status: HTTP_STATUS.OK });
  } catch (error) {
    console.error('Failed to create Checkout session:', error);
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to create a Checkout session for the connected account.';
    return NextResponse.json({ error: message }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}
