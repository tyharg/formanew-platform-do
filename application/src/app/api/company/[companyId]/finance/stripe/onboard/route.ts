import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getCompanyById, updateCompanyFinance } from '@/lib/mockDb';

// Define the base URL for redirects (must be configured for your environment)
// NOTE: Replace 'http://localhost:3000' with your actual application root URL.
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

/**
 * API Route to handle Stripe Connect onboarding.
 * 1. Retrieves or creates a Stripe Connected Account.
 * 2. Generates an Account Link URL for the user to complete onboarding.
 * 3. Stores the Stripe Account ID in the database (mocked here).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { companyId: string } }
) {
  const { companyId } = params;

  try {
    // 1. Fetch company data to check existing Stripe Account ID
    const company = await getCompanyById(companyId);
    if (!company) {
      return NextResponse.json({ message: 'Company not found' }, { status: 404 });
    }

    let stripeAccountId = company.finance?.stripeAccountId;

    // --- Step 1: Create Connected Account if it doesn't exist ---
    if (!stripeAccountId) {
      console.log(`Creating new Stripe account for Company ID: ${companyId}`);
      
      // Create the account using the required controller properties.
      // This creates a Connect Account managed by the platform.
      const account = await stripe.accounts.create({
        controller: {
          // Platform controls fee collection - connected account pays fees
          fees: {
            payer: 'account',
          },
          // Stripe handles payment disputes and losses
          losses: {
            payments: 'stripe',
          },
          // Connected account gets full access to Stripe dashboard
          stripe_dashboard: {
            type: 'full',
          },
        },
        // Optional: Pre-fill information if available (e.g., company email)
        email: company.email || undefined,
        meta { // FIX: Corrected property name to 'metadata' and added colon ':'
          companyId: companyId,
        },
      });

      stripeAccountId = account.id;

      // Update the mock database with the new Stripe Account ID
      await updateCompanyFinance(companyId, { stripeAccountId });
      console.log(`Stripe Account created: ${stripeAccountId}`);
    }

    // --- Step 2: Generate Account Link for Onboarding/Updating ---
    
    // The refresh URL is where Stripe redirects the user if the link expires or they click 'back'.
    // NOTE: The return URL should point to the new dedicated Company Finances page, not the old settings tab.
    const refreshUrl = `${BASE_URL}/dashboard/company/finances`;
    
    // The return URL is where Stripe redirects the user after successful completion.
    const returnUrl = `${BASE_URL}/dashboard/company/finances?status=success`;

    // Create the Account Link. This link is single-use and expires quickly.
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding', // Use 'account_onboarding' for initial setup or updates
    });

    // Update the mock database with the link details (optional, but good practice)
    await updateCompanyFinance(companyId, {
      accountOnboardingUrl: accountLink.url,
      accountOnboardingExpiresAt: new Date(accountLink.expires_at * 1000),
    });

    // --- Step 3: Return the URL to the client for redirection ---
    return NextResponse.json({ url: accountLink.url });

  } catch (error) {
    console.error('Stripe Connect Onboarding Error:', error);
    return NextResponse.json(
      { message: 'Failed to initiate Stripe Connect onboarding.', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
