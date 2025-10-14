import { NextRequest, NextResponse } from 'next/server';
import { stripe, validateStripeAccountId } from '@/lib/stripe';
import { getCompanyById } from '@/lib/mockDb';

/**
 * API Route to retrieve the live status of a connected Stripe Account.
 * This is called by the frontend to ensure the displayed status is always current.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { companyId: string } }
) {
  const { companyId } = params;
  const searchParams = req.nextUrl.searchParams;
  const requestedStripeAccountId = searchParams.get('accountId');

  if (!requestedStripeAccountId || !validateStripeAccountId(requestedStripeAccountId)) {
    return NextResponse.json({ message: 'Invalid Stripe Account ID provided.' }, { status: 400 });
  }

  try {
    // 1. Verify that the requested Stripe Account ID belongs to the Company ID in the path
    const company = await getCompanyById(companyId);
    const actualStripeAccountId = company?.finance?.stripeAccountId;

    if (!company || actualStripeAccountId !== requestedStripeAccountId) {
        // This prevents one company from querying the status of another company's Stripe account
        return NextResponse.json({ message: 'Stripe account ID mismatch or company not found.' }, { status: 403 });
    }

    // --- Step 2: Retrieve the Account object directly from Stripe ---
    // Note: When retrieving an account by ID, the Stripe-Account header is not required.
    const account = await stripe.accounts.retrieve(requestedStripeAccountId);

    // --- Step 3: Extract relevant status fields ---
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
    console.error(`Error retrieving Stripe account status for ${requestedStripeAccountId}:`, error);
    return NextResponse.json(
      { message: 'Failed to retrieve live Stripe account status.', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
