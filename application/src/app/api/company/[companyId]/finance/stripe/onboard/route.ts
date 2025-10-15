import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { HTTP_STATUS } from '@/lib/api/http';
import { createDatabaseService } from 'services/database/databaseFactory';

const ensureBaseUrl = (): string => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) {
    throw new Error(
      'NEXT_PUBLIC_BASE_URL is not set. Define it so Stripe can redirect users back to your application after onboarding.'
    );
  }
  return baseUrl;
};

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params;
    const baseUrl = ensureBaseUrl();

    const db = await createDatabaseService();
    const company = await db.company.findById(companyId);

    if (!company) {
      return NextResponse.json({ error: 'Company not found.' }, { status: HTTP_STATUS.NOT_FOUND });
    }

    let finance = await db.companyFinance.findByCompanyId(companyId);
    if (!finance) {
      finance = await db.companyFinance.create({ companyId });
    }

    let { stripeAccountId } = finance;

    if (!stripeAccountId) {
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
        email: company.email ?? undefined,
        metadata: {
          companyId,
        },
      });

      stripeAccountId = account.id;
      finance = await db.companyFinance.update(companyId, { stripeAccountId });
    }

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${baseUrl}/dashboard/company/finances`,
      return_url: `${baseUrl}/dashboard/company/finances?accountId=${companyId}`,
      type: 'account_onboarding',
    });

    await db.companyFinance.update(companyId, {
      accountOnboardingUrl: accountLink.url,
      accountOnboardingExpiresAt: new Date(accountLink.expires_at * 1000),
    });

    return NextResponse.json(
      {
        accountId: stripeAccountId,
        url: accountLink.url,
        expiresAt: accountLink.expires_at,
      },
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    console.error('Stripe Connect Onboarding Error:', error);
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to initiate Stripe Connect onboarding.';
    return NextResponse.json({ error: message }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}
