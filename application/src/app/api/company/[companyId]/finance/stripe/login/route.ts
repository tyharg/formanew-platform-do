import { NextRequest, NextResponse } from 'next/server';
import { stripe, validateStripeAccountId } from '@/lib/stripe';
import { getCompanyById, updateCompanyFinance } from '@/lib/mockDb';

/**
 * API Route to generate a Login Link for the connected account's Stripe Dashboard.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { companyId: string } }
) {
  const { companyId } = params;

  try {
    // 1. Fetch company data
    const company = await getCompanyById(companyId);
    const stripeAccountId = company?.finance?.stripeAccountId;

    if (!stripeAccountId || !validateStripeAccountId(stripeAccountId)) {
      return NextResponse.json({ message: 'Stripe account not connected.' }, { status: 400 });
    }

    // --- Step 1: Create Login Link ---
    // This link allows the connected account user to access their Stripe Dashboard
    // without needing a separate login/password flow.
    const loginLink = await stripe.accounts.createLoginLink(
      stripeAccountId
    );

    // Update the mock database with the link details (optional)
    await updateCompanyFinance(companyId, {
      accountLoginLinkUrl: loginLink.url,
    });

    // --- Step 2: Return the URL to the client for redirection ---
    return NextResponse.json({ url: loginLink.url });

  } catch (error) {
    console.error('Stripe Connect Login Link Error:', error);
    return NextResponse.json(
      { message: 'Failed to generate Stripe login link.', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
