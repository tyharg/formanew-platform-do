import { NextRequest, NextResponse } from 'next/server';
import { stripe, validateStripeAccountId } from '@/lib/stripe';
import { HTTP_STATUS } from '@/lib/api/http';

/**
 * Retrieves the live status of a connected account directly from Stripe. No
 * cached values are used so the response always reflects Stripe's latest
 * understanding of the account's onboarding progress.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const { accountId } = await params;

    if (!validateStripeAccountId(accountId)) {
      return NextResponse.json(
        { error: 'The provided accountId does not look like a Stripe Connect account ID (acct_...).' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const account = await stripe.accounts.retrieve(accountId);

    return NextResponse.json(
      {
        id: account.id,
        detailsSubmitted: account.details_submitted,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        requirementsDue: account.requirements?.currently_due ?? [],
        requirementsDueSoon: account.requirements?.eventually_due ?? [],
        controller: account.controller,
        metadata: account.metadata,
      },
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    console.error('Failed to retrieve account status:', error);
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to retrieve the Stripe Connect account status. Verify the account ID and try again.';
    return NextResponse.json({ error: message }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}
