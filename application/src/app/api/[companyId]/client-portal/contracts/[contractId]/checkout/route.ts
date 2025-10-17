import { NextRequest, NextResponse } from 'next/server';
import { createDatabaseService } from '@/services/database/databaseFactory';
import { HTTP_STATUS } from '@/lib/api/http';
import { verifyClientPortalToken } from '@/lib/auth/clientPortalToken';
import { stripe } from '@/lib/stripe';
import { serverConfig } from '@/settings';

interface Params {
  companyId: string;
  contractId: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { companyId, contractId } = await params;
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    let payload;
    try {
      payload = verifyClientPortalToken(token);
    } catch {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }
    const db = await createDatabaseService();
    const partiesFromToken = await db.relevantParty.findByIds(payload.partyIds);

    if (partiesFromToken.length === 0) {
      return NextResponse.json(
        { error: 'No matching relevant parties found for this token' },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }

    const sanitizedEmail = payload.email.trim().toLowerCase();
    const authorizedParty = partiesFromToken.find((party) => {
      return (
        party.email.trim().toLowerCase() === sanitizedEmail &&
        party.contractId === contractId
      );
    });

    if (!authorizedParty) {
      return NextResponse.json(
        { error: 'Token does not grant access to this contract' },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }

    const contract = await db.contract.findById(contractId);

    if (!contract || contract.companyId !== companyId) {
      return NextResponse.json({ error: 'Contract not found' }, { status: HTTP_STATUS.NOT_FOUND });
    }

    if (
      !contract.isBillingEnabled ||
      (!contract.stripePriceId && !contract.billingAmount)
    ) {
      return NextResponse.json(
        { error: 'This contract is not configured for payments' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const finance = await db.companyFinance.findByCompanyId(companyId);
    if (!finance?.stripeAccountId) {
      return NextResponse.json(
        { error: 'Stripe account not connected for this company' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const successUrl = `${serverConfig.baseURL}/${companyId}/client-portal/${contractId}?payment=success&token=${encodeURIComponent(
      token
    )}`;
    const cancelUrl = `${serverConfig.baseURL}/${companyId}/client-portal/${contractId}?payment=cancel&token=${encodeURIComponent(
      token
    )}`;

    const lineItems = contract.stripePriceId
      ? [{ price: contract.stripePriceId, quantity: 1 }]
      : [
          {
            price_data: {
              currency: contract.billingCurrency || 'USD',
              product_data: {
                name: contract.title,
              },
              unit_amount: contract.billingAmount || 0,
            },
            quantity: 1,
          },
        ];

    const session = await stripe.checkout.sessions.create(
      {
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: authorizedParty.email,
      },
      {
        stripeAccount: finance.stripeAccountId,
      }
    );

    if (!session.url) {
      return NextResponse.json(
        { error: 'Could not create a checkout session' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error('Failed to create checkout session', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Internal server error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}