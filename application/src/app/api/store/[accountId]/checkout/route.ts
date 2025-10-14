import { NextRequest, NextResponse } from 'next/server';
import { stripe, validateStripeAccountId } from '@/lib/stripe';

// Define the base URL for redirects
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

/**
 * API Route to create a Stripe Checkout Session for a Direct Charge with Application Fee.
 * This route is called by the customer viewing the storefront.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  const { accountId: stripeAccountId } = await params;
  const { priceId, applicationFeeAmount } = await req.json();

  if (!validateStripeAccountId(stripeAccountId)) {
    return NextResponse.json({ message: 'Invalid Stripe Account ID.' }, { status: 400 });
  }
  if (!priceId || !applicationFeeAmount) {
    return NextResponse.json({ message: 'Missing priceId or applicationFeeAmount.' }, { status: 400 });
  }

  try {
    // Convert application fee from dollars/units to cents/smallest currency unit
    const feeInCents = Math.round(parseFloat(applicationFeeAmount) * 100);

    // --- Step 1: Create Checkout Session ---
    // We create the session on the platform's secret key, but specify the connected account
    // using the stripeAccount option. This results in a Direct Charge.
    const session = await stripe.checkout.sessions.create(
      {
        // Line items must reference a Price ID existing on the connected account
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'payment',
        // Payment Intent Data is used to specify the application fee
        payment_intent_data: {
          // The fee is collected by the platform (us) from the total payment amount.
          application_fee_amount: feeInCents,
        },
        // Redirect URLs
        success_url: `${BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}&accountId=${stripeAccountId}`,
        cancel_url: `${BASE_URL}/store/${stripeAccountId}`,
      },
      {
        // IMPORTANT: Directs the charge to the connected account.
        // The connected account receives the payment minus the Stripe fees and the application fee.
        stripeAccount: stripeAccountId,
      }
    );

    // --- Step 2: Return the session URL for redirection ---
    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error('Stripe Checkout Session Error:', error);
    return NextResponse.json(
      { message: 'Failed to create checkout session.', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
