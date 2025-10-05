import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionPlanEnum, SubscriptionStatusEnum } from 'types';
import { HTTP_STATUS } from 'lib/api/http';
import { createDatabaseService } from 'services/database/databaseFactory';
import { createBillingService } from 'services/billing/billingFactory';

/**
 * Cancel an active subscription for a user.
 *
 * @param user - The user object containing id and role and email.
 */
export const cancelSubscription = async (
  request: NextRequest,
  user: { id: string; role: string; email: string }
): Promise<Response> => {
  try {
    const billingService = await createBillingService();
    const db = await createDatabaseService();

    const customer = await billingService.listCustomer(user.email);

    if (!customer || !customer[0]) {
      return NextResponse.json({ error: 'Customer not found' }, { status: HTTP_STATUS.NOT_FOUND });
    }

    const customerId = customer[0].id;
    const stripeSubscriptions = await billingService.listSubscription(customerId);

    const stripeSub = stripeSubscriptions[0];
    if (!stripeSub) {
      return NextResponse.json(
        { error: 'No active subscription' },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    const dbSubscription = await db.subscription.findByUserId(user.id);

    if (!dbSubscription || !dbSubscription[0]) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    await billingService.updateSubscription(
      stripeSub.id,
      stripeSub.items[0].id,
      SubscriptionPlanEnum.FREE
    );
    await db.subscription.update(user.id, {
      plan: SubscriptionPlanEnum.FREE,
      status: SubscriptionStatusEnum.PENDING,
    });

    return NextResponse.json({ canceled: true });
  } catch (err: unknown) {
    console.error('Internal Server Error', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};
