import { NextRequest, NextResponse } from 'next/server';
import { stripe, validateStripeAccountId } from '@/lib/stripe';
import Stripe from 'stripe';
import { HTTP_STATUS } from '@/lib/api/http';
import { createDatabaseService } from 'services/database/databaseFactory';

const ensureBaseUrl = (): string => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_BASE_URL is not set. Define it so Stripe can redirect users back to your app.');
  }
  return baseUrl;
};

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params;
    const db = await createDatabaseService();
    const finance = await db.companyFinance.findByCompanyId(companyId);

    if (!finance?.stripeAccountId || !validateStripeAccountId(finance.stripeAccountId)) {
      return NextResponse.json(
        { error: 'Connect the company to Stripe before generating an account link.' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    try {
      const loginLink = await stripe.accounts.createLoginLink(finance.stripeAccountId);
      await db.companyFinance.update(companyId, { accountLoginLinkUrl: loginLink.url });
      return NextResponse.json({ url: loginLink.url, type: 'login_link' }, { status: HTTP_STATUS.OK });
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError && error.code === 'account_not_express') {
        const baseUrl = ensureBaseUrl();
        const accountLink = await stripe.accountLinks.create({
          account: finance.stripeAccountId,
          refresh_url: `${baseUrl}/dashboard/company/finances`,
          return_url: `${baseUrl}/dashboard/company/finances?accountId=${companyId}`,
          type: 'account_onboarding',
        });
        await db.companyFinance.update(companyId, { accountOnboardingUrl: accountLink.url });
        return NextResponse.json(
          {
            url: accountLink.url,
            type: 'account_link',
            message: 'This account uses the full Stripe dashboard. Follow the link to update onboarding details.',
          },
          { status: HTTP_STATUS.OK }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Stripe Connect Login Link Error:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to generate a Stripe dashboard link.';
    return NextResponse.json({ error: message }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}
