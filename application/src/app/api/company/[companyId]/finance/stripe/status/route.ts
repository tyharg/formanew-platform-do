import { NextRequest, NextResponse } from 'next/server';
import { stripe, validateStripeAccountId } from '@/lib/stripe';

/**
 * API Route to retrieve the live status of a connected Stripe Account.
 * This is called by the frontend to ensure the displayed status is always current.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { companyId: string } }
) {
  const searchParams = req.nextUrl.searchParams;
  const stripeAccountId = searchParams.get('accountId');

  if (!stripeAccountId || !validateStripeAccountId(stripeAccountId)) {
    return NextResponse.json({ message: 'Invalid Stripe Account ID provided.' }, { status: 400 });
  }

  try {
    // --- Step 1: Retrieve the Account object directly from Stripe ---
    // Note: When retrieving an account by ID, the Stripe-Account header is not required.
    const account = await stripe.accounts.retrieve(stripeAccountId);

    // --- Step 2: Extract relevant status fields ---
    const requirements = account.requirements;

    const status = {
      detailsSubmitted: account.details_submitted,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      // List of requirements that are currently due
      requirementsDue: requirements?.currently_due || [],
      // List of requirements that will become due soon
      requirementsDueSoon: requirements?.eventually_due || [],
    };

    return NextResponse.json(status);

  } catch (error) {
    console.error(`Error retrieving Stripe account status for ${stripeAccountId}:`, error);
    return NextResponse.json(
      { message: 'Failed to retrieve live Stripe account status.', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
