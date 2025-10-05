import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS } from 'lib/api/http';
import { createDatabaseService } from 'services/database/databaseFactory';
import { createBillingService } from 'services/billing/billingFactory';
import { SubscriptionPlanEnum } from 'types';

/**
 * Initiates a checkout session for upgrading to Pro.
 *
 * @param request - The Next.js request object.
 * @param user - The user object containing id, role, and email.
 * @returns A JSON response with the checkout URL or an error message.
 */
export const checkout = async (
  request: NextRequest,
  user: { id: string; role: string; email: string }
): Promise<NextResponse> => {
  const db = await createDatabaseService();

  const subscription = await db.subscription.findByUserId(user.id);

  if (!subscription || !subscription[0] || !subscription[0].customerId) {
    console.error('No active subscription found for user:', user.id);
    return NextResponse.json({ error: 'No subscription found' }, { status: HTTP_STATUS.NOT_FOUND });
  }

  try {
    const billingService = await createBillingService();

    const url = await billingService.manageSubscription(
      SubscriptionPlanEnum.PRO,
      subscription[0].customerId
    );

    if (!url) {
      console.error('Failed to create Billing Portal session');
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    return NextResponse.json({ url }, { status: HTTP_STATUS.OK });
  } catch (error) {
    console.error(
      'Error creating Billing Portal session',
      (error as { message?: string }).message ?? undefined
    );
    
    // Provide more specific error messages
    const errorMessage = (error as { message?: string }).message;
    if (errorMessage?.includes('already on the')) {
      return NextResponse.json(
        { error: errorMessage },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};