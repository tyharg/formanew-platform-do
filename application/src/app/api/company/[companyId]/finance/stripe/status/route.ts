import { NextRequest, NextResponse } from 'next/server';
import { stripe, validateStripeAccountId } from '@/lib/stripe';
import { HTTP_STATUS } from '@/lib/api/http';
import { createDatabaseService } from 'services/database/databaseFactory';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params;
    const searchParams = request.nextUrl.searchParams;

    const db = await createDatabaseService();
    const finance = await db.companyFinance.findByCompanyId(companyId);

    if (!finance?.stripeAccountId) {
      return NextResponse.json(
        { error: 'This company has not been connected to Stripe yet.' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const requestedAccountId = searchParams.get('accountId') ?? finance.stripeAccountId;

    if (!validateStripeAccountId(requestedAccountId)) {
      return NextResponse.json(
        { error: 'Provide a valid Stripe Connect account ID (acct_...).' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    if (requestedAccountId !== finance.stripeAccountId) {
      return NextResponse.json(
        { error: 'The requested account ID does not belong to this company.' },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }

    const account = await stripe.accounts.retrieve(requestedAccountId);

    const statusPayload = {
      stripeAccountId: account.id,
      detailsSubmitted: account.details_submitted,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      requirementsDue: account.requirements?.currently_due ?? [],
      requirementsDueSoon: account.requirements?.eventually_due ?? [],
    };

    await db.companyFinance.update(companyId, statusPayload);

    return NextResponse.json(statusPayload, { status: HTTP_STATUS.OK });
  } catch (error) {
    console.error('Failed to retrieve live Stripe account status:', error);
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to retrieve the Stripe Connect account status.';
    return NextResponse.json({ error: message }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}
