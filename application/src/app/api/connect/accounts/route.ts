import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { HTTP_STATUS } from '@/lib/api/http';

// Helper to assert that required configuration is present. This keeps the sample
// self-documenting so you know which placeholder needs a real value.
function getBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) {
    throw new Error(
      'NEXT_PUBLIC_BASE_URL is not set. Add it to your environment so Stripe knows where to redirect users after onboarding.'
    );
  }
  return baseUrl;
}

/**
 * Creates a new Stripe Connect account and returns a one-time onboarding link
 * that the user can be redirected to. The link expires quickly, so the UI will
 * surface the URL immediately.
 */
export async function POST(request: NextRequest) {
  try {
    const baseUrl = getBaseUrl();
    const body = await request.json().catch(() => ({}));
    const email: string | undefined = typeof body.email === 'string' ? body.email : undefined;

    // Create a Connect account that is fully controlled by the platform. The
    // required controller block configures who pays fees, who eats losses, and
    // grants the connected account access to the full Stripe dashboard.
    const account = await stripe.accounts.create({
      controller: {
        fees: {
          payer: 'account',
        },
        losses: {
          payments: 'stripe',
        },
        stripe_dashboard: {
          type: 'full',
        },
      },
      // Optional but useful: pre-fill the email address if you already collected it.
      email,
      metadata: {
        // Attaching metadata makes it easier to reconcile records in your system.
        // Replace this with your internal identifiers.
        sample_demo: 'connect-onboarding',
      },
    });

    // The Account Link walks the user through onboarding. Refresh and return URLs
    // should both live on your domain. For the sample we send users back to the
    // demo dashboard so they can continue testing the flow.
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${baseUrl}/connect-demo`,
      return_url: `${baseUrl}/connect-demo?accountId=${account.id}`,
      type: 'account_onboarding',
    });

    return NextResponse.json(
      {
        accountId: account.id,
        onboardingUrl: accountLink.url,
        // Surface the expiration so the UI can warn the user.
        expiresAt: accountLink.expires_at,
      },
      { status: HTTP_STATUS.CREATED }
    );
  } catch (error) {
    console.error('Failed to create Connect account:', error);
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to create a Stripe Connect account. Check the server logs for details.';
    return NextResponse.json({ error: message }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}
